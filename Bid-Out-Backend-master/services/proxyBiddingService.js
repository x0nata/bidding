const BiddingProduct = require("../model/biddingProductModel");
const Product = require("../model/productModel");

class ProxyBiddingService {
  constructor() {
    this.processingQueue = new Set(); // Prevent concurrent processing of same auction
  }

  async processProxyBids(auctionId, newBidAmount, excludeUserId = null) {
    // Prevent concurrent processing
    if (this.processingQueue.has(auctionId.toString())) {
      return;
    }

    this.processingQueue.add(auctionId.toString());

    try {
      const auction = await Product.findById(auctionId);
      if (!auction || auction.isSoldout) {
        return;
      }

      // Get all active proxy bids for this auction, excluding the user who just bid
      const proxyBids = await BiddingProduct.find({
        product: auctionId,
        bidType: 'Proxy',
        bidStatus: { $in: ['Active', 'Winning'] },
        user: { $ne: excludeUserId },
        maxBid: { $gt: newBidAmount }
      })
        .sort({ maxBid: -1, createdAt: 1 }) // Highest max bid first, then earliest
        .populate('user', 'name email');

      if (proxyBids.length === 0) {
        return;
      }

      let currentHighestBid = newBidAmount;
      const bidIncrement = auction.bidIncrement || 10;
      let bidsPlaced = [];

      // Process proxy bids in order
      for (let i = 0; i < proxyBids.length; i++) {
        const proxyBid = proxyBids[i];
        
        // Check if this proxy bid can still bid higher
        if (proxyBid.maxBid <= currentHighestBid) {
          continue;
        }

        // Calculate the next bid amount
        let nextBidAmount = currentHighestBid + bidIncrement;

        // Check if there are other proxy bids that could compete
        const competingBids = proxyBids.slice(i + 1).filter(bid => bid.maxBid > nextBidAmount);
        
        if (competingBids.length > 0) {
          // There are competing proxy bids, bid up to the next highest max bid
          const nextHighestMaxBid = Math.max(...competingBids.map(bid => bid.maxBid));
          
          if (proxyBid.maxBid > nextHighestMaxBid) {
            // This proxy bid can outbid all others
            nextBidAmount = Math.min(nextHighestMaxBid + bidIncrement, proxyBid.maxBid);
          } else {
            // This proxy bid will be outbid, bid up to its maximum
            nextBidAmount = proxyBid.maxBid;
          }
        } else {
          // No competing proxy bids, just bid the increment
          nextBidAmount = Math.min(nextBidAmount, proxyBid.maxBid);
        }

        // Place the proxy bid
        const placedBid = await this.placeProxyBid(proxyBid, nextBidAmount, auctionId);
        if (placedBid) {
          bidsPlaced.push(placedBid);
          currentHighestBid = nextBidAmount;

          // Notify via WebSocket if available
          if (global.socketService) {
            const bidData = {
              bidId: placedBid._id,
              auctionId,
              bidAmount: nextBidAmount,
              bidType: 'Proxy',
              bidder: {
                id: proxyBid.user._id,
                name: proxyBid.user.name
              },
              timestamp: new Date(),
              isWinning: true,
              isProxyBid: true
            };

            global.socketService.io.to(`auction_${auctionId}`).emit("new_bid", bidData);
          }

          // If this bid reached the maximum, mark it as exhausted
          if (nextBidAmount >= proxyBid.maxBid) {
            proxyBid.bidStatus = 'Outbid'; // Will be updated if it becomes winning again
          }
        }

        // Check if we've reached the auction's reserve price or other limits
        if (auction.reservePrice && currentHighestBid >= auction.reservePrice) {
          // Reserve price met, continue normal proxy bidding
        }
      }

      // Update bid statuses
      await this.updateBidStatuses(auctionId, currentHighestBid);

      return bidsPlaced;

    } catch (error) {
    } finally {
      this.processingQueue.delete(auctionId.toString());
    }
  }

  async placeProxyBid(proxyBid, bidAmount, auctionId) {
    try {
      // Update the existing proxy bid record
      proxyBid.price = bidAmount;
      proxyBid.bidStatus = 'Active';
      proxyBid.updatedAt = new Date();
      
      await proxyBid.save();

      return proxyBid;
    } catch (error) {
      return null;
    }
  }

  async updateBidStatuses(auctionId, currentHighestBid) {
    try {
      // Get all bids for this auction
      const allBids = await BiddingProduct.find({ product: auctionId }).sort({ price: -1 });

      if (allBids.length === 0) {
        return;
      }

      // Find the highest bid
      const highestBid = allBids[0];

      // Update all bids
      for (const bid of allBids) {
        let newStatus = 'Lost';
        let isWinning = false;

        if (bid._id.toString() === highestBid._id.toString()) {
          newStatus = 'Winning';
          isWinning = true;
        } else if (bid.price === currentHighestBid) {
          // Handle ties (shouldn't happen with proper increment logic)
          newStatus = 'Winning';
          isWinning = true;
        } else {
          newStatus = 'Outbid';
          isWinning = false;
        }

        // Only update if status changed
        if (bid.bidStatus !== newStatus || bid.isWinningBid !== isWinning) {
          await BiddingProduct.findByIdAndUpdate(bid._id, {
            bidStatus: newStatus,
            isWinningBid: isWinning
          });
        }
      }
    } catch (error) {
    }
  }

  async getProxyBidSummary(auctionId) {
    try {
      const proxyBids = await BiddingProduct.find({
        product: auctionId,
        bidType: 'Proxy',
        bidStatus: { $in: ['Active', 'Winning'] }
      })
        .populate('user', 'name')
        .sort({ maxBid: -1 });

      return proxyBids.map(bid => ({
        userId: bid.user._id,
        userName: bid.user.name,
        currentBid: bid.price,
        maxBid: bid.maxBid,
        remainingCapacity: bid.maxBid - bid.price,
        status: bid.bidStatus,
        isWinning: bid.isWinningBid
      }));
    } catch (error) {
      return [];
    }
  }

  async cancelProxyBid(userId, auctionId) {
    try {
      const proxyBid = await BiddingProduct.findOne({
        user: userId,
        product: auctionId,
        bidType: 'Proxy',
        bidStatus: { $in: ['Active', 'Winning'] }
      });

      if (!proxyBid) {
        return { success: false, message: "No active proxy bid found" };
      }

      // Check if this is the current winning bid
      const highestBid = await BiddingProduct.findOne({ product: auctionId }).sort({ price: -1 });
      
      if (highestBid && highestBid._id.toString() === proxyBid._id.toString()) {
        return { success: false, message: "Cannot cancel proxy bid while it's the winning bid" };
      }

      // Cancel the proxy bid
      proxyBid.bidStatus = 'Cancelled';
      proxyBid.bidType = 'Manual'; // Convert to manual bid
      await proxyBid.save();

      return { success: true, message: "Proxy bid cancelled successfully" };
    } catch (error) {
      return { success: false, message: "Error cancelling proxy bid" };
    }
  }

  async updateProxyBidMax(userId, auctionId, newMaxBid) {
    try {
      const proxyBid = await BiddingProduct.findOne({
        user: userId,
        product: auctionId,
        bidType: 'Proxy',
        bidStatus: { $in: ['Active', 'Winning'] }
      });

      if (!proxyBid) {
        return { success: false, message: "No active proxy bid found" };
      }

      if (newMaxBid <= proxyBid.price) {
        return { success: false, message: "New maximum bid must be higher than current bid" };
      }

      // Update the maximum bid
      proxyBid.maxBid = newMaxBid;
      await proxyBid.save();

      // Trigger proxy bidding process to see if this bid can now win
      await this.processProxyBids(auctionId, proxyBid.price, userId);

      return { success: true, message: "Proxy bid maximum updated successfully" };
    } catch (error) {
      return { success: false, message: "Error updating proxy bid maximum" };
    }
  }

  // Method to handle auction time extension due to late bids
  async handleAuctionExtension(auctionId, originalEndTime, newEndTime) {
    try {
      // Notify all proxy bidders about the extension
      const proxyBids = await BiddingProduct.find({
        product: auctionId,
        bidType: 'Proxy',
        bidStatus: { $in: ['Active', 'Winning'] }
      }).populate('user', 'name email');

      // Send notifications via WebSocket and email if needed
      if (global.socketService) {
        global.socketService.io.to(`auction_${auctionId}`).emit("auction_extended", {
          originalEndTime,
          newEndTime,
          reason: "Late bid received",
          affectedProxyBids: proxyBids.length
        });
      }

    } catch (error) {
    }
  }
}

module.exports = ProxyBiddingService;
