// const { Server } = require("socket.io"); // Disabled for serverless deployment
const jwt = require("jsonwebtoken");
const User = require("../model/userModel");
const Product = require("../model/productModel");
const BiddingProduct = require("../model/biddingProductModel");

class SocketService {
  constructor(server) {
    // Socket.io disabled for serverless deployment
    console.log('🔌 Socket.io disabled for serverless deployment');

    this.connectedUsers = new Map(); // userId -> socketId
    this.auctionRooms = new Map(); // auctionId -> Set of socketIds
    this.userSockets = new Map(); // socketId -> userId

    // this.setupMiddleware();
    // this.setupEventHandlers();
  }

  setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error("Authentication error: No token provided"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        
        if (!user) {
          return next(new Error("Authentication error: User not found"));
        }

        socket.userId = user._id.toString();
        socket.user = user;
        next();
      } catch (error) {
        next(new Error("Authentication error: Invalid token"));
      }
    });
  }

  setupEventHandlers() {
    this.io.on("connection", (socket) => {
      
      // Store user connection
      this.connectedUsers.set(socket.userId, socket.id);
      this.userSockets.set(socket.id, socket.userId);

      // Join auction room
      socket.on("join_auction", async (auctionId) => {
        try {
          const auction = await Product.findById(auctionId);
          if (!auction) {
            socket.emit("error", { message: "Auction not found" });
            return;
          }

          socket.join(`auction_${auctionId}`);
          
          // Add to auction room tracking
          if (!this.auctionRooms.has(auctionId)) {
            this.auctionRooms.set(auctionId, new Set());
          }
          this.auctionRooms.get(auctionId).add(socket.id);

          // Send current auction state
          const currentBid = await this.getCurrentAuctionState(auctionId);
          socket.emit("auction_state", currentBid);

          // Notify others that someone joined
          socket.to(`auction_${auctionId}`).emit("user_joined", {
            userId: socket.userId,
            userName: socket.user.name,
            viewerCount: this.auctionRooms.get(auctionId).size
          });

        } catch (error) {
          socket.emit("error", { message: "Failed to join auction" });
        }
      });

      // Leave auction room
      socket.on("leave_auction", (auctionId) => {
        socket.leave(`auction_${auctionId}`);
        
        if (this.auctionRooms.has(auctionId)) {
          this.auctionRooms.get(auctionId).delete(socket.id);
          
          // Notify others that someone left
          socket.to(`auction_${auctionId}`).emit("user_left", {
            userId: socket.userId,
            userName: socket.user.name,
            viewerCount: this.auctionRooms.get(auctionId).size
          });
        }
      });

      // Handle real-time bidding
      socket.on("place_bid", async (data) => {
        try {
          const { auctionId, bidAmount, bidType = 'Manual', maxBid } = data;
          
          // Validate bid (similar to REST API validation)
          const auction = await Product.findById(auctionId);
          if (!auction) {
            socket.emit("bid_error", { message: "Auction not found" });
            return;
          }

          // Check if auction is active
          const now = new Date();
          if (auction.auctionType === 'Timed') {
            if (auction.auctionEndDate && now > auction.auctionEndDate) {
              socket.emit("bid_error", { message: "Auction has ended" });
              return;
            }
          }

          // Check if user is the seller
          if (auction.user.toString() === socket.userId) {
            socket.emit("bid_error", { message: "You cannot bid on your own auction" });
            return;
          }

          // Get current highest bid
          const highestBid = await BiddingProduct.findOne({ product: auctionId }).sort({ price: -1 });
          const currentHighestBid = highestBid ? highestBid.price : auction.startingBid;
          const minimumBid = currentHighestBid + (auction.bidIncrement || 10);

          if (bidAmount < minimumBid) {
            socket.emit("bid_error", { 
              message: `Your bid must be at least $${minimumBid}`,
              minimumBid 
            });
            return;
          }

          // Create or update bid
          let biddingProduct;
          const existingBid = await BiddingProduct.findOne({ 
            user: socket.userId, 
            product: auctionId 
          });

          if (existingBid) {
            existingBid.price = bidAmount;
            existingBid.bidType = bidType;
            existingBid.maxBid = maxBid;
            existingBid.bidStatus = 'Active';
            await existingBid.save();
            biddingProduct = existingBid;
          } else {
            biddingProduct = await BiddingProduct.create({
              user: socket.userId,
              product: auctionId,
              price: bidAmount,
              bidType,
              maxBid,
              bidStatus: 'Active',
              bidIncrement: auction.bidIncrement || 10,
            });
          }

          // Update previous winning bids
          if (highestBid && highestBid.user.toString() !== socket.userId) {
            await BiddingProduct.findByIdAndUpdate(highestBid._id, { 
              bidStatus: 'Outbid',
              isWinningBid: false 
            });
          }

          // Set current bid as winning
          biddingProduct.isWinningBid = true;
          biddingProduct.bidStatus = 'Winning';
          await biddingProduct.save();

          // Broadcast bid to all users in the auction room
          const bidData = {
            bidId: biddingProduct._id,
            auctionId,
            bidAmount,
            bidType,
            bidder: {
              id: socket.userId,
              name: socket.user.name
            },
            timestamp: new Date(),
            isWinning: true
          };

          this.io.to(`auction_${auctionId}`).emit("new_bid", bidData);

          // Broadcast active bids count update to all connected users
          this.broadcastActiveBidsUpdate();

          // Send confirmation to bidder
          socket.emit("bid_success", {
            ...bidData,
            message: "Bid placed successfully"
          });

          // Extend auction time if bid placed near end (for timed auctions)
          if (auction.auctionType === 'Timed' && auction.auctionEndDate) {
            const timeRemaining = auction.auctionEndDate - now;
            const extendThreshold = 5 * 60 * 1000; // 5 minutes

            if (timeRemaining < extendThreshold) {
              const newEndTime = new Date(now.getTime() + extendThreshold);
              await Product.findByIdAndUpdate(auctionId, { 
                auctionEndDate: newEndTime 
              });

              this.io.to(`auction_${auctionId}`).emit("auction_extended", {
                newEndTime,
                message: "Auction extended due to late bid"
              });
            }
          }

        } catch (error) {
          socket.emit("bid_error", { message: "Failed to place bid" });
        }
      });

      // Subscribe to user's listing updates
      socket.on("subscribeToUserListings", ({ userId }) => {
        if (userId === socket.userId) {
          socket.join(`user_listings_${userId}`);
        }
      });

      // Unsubscribe from user's listing updates
      socket.on("unsubscribeFromUserListings", ({ userId }) => {
        if (userId === socket.userId) {
          socket.leave(`user_listings_${userId}`);
        }
      });

      // Subscribe to specific listing updates
      socket.on("subscribeToListing", async ({ listingId }) => {
        try {
          const listing = await Product.findById(listingId);
          if (listing && listing.user.toString() === socket.userId) {
            socket.join(`listing_${listingId}`);
          }
        } catch (error) {
        }
      });

      // Unsubscribe from specific listing updates
      socket.on("unsubscribeFromListing", ({ listingId }) => {
        socket.leave(`listing_${listingId}`);
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        
        // Clean up user tracking
        this.connectedUsers.delete(socket.userId);
        this.userSockets.delete(socket.id);

        // Clean up auction rooms
        for (const [auctionId, socketIds] of this.auctionRooms.entries()) {
          if (socketIds.has(socket.id)) {
            socketIds.delete(socket.id);
            
            // Notify others in the auction
            socket.to(`auction_${auctionId}`).emit("user_left", {
              userId: socket.userId,
              userName: socket.user.name,
              viewerCount: socketIds.size
            });
          }
        }
      });
    });
  }

  // Broadcast active bids count update to all connected users
  async broadcastActiveBidsUpdate() {
    try {
      // Get all active auctions (not sold out and not expired)
      const now = new Date();
      const activeAuctions = await Product.find({
        isSoldout: false,
        $or: [
          { auctionEndDate: { $gt: now } }, // Future end date
          { auctionEndDate: { $exists: false } }, // No end date set
          { auctionEndDate: null } // Null end date
        ]
      }).select('_id');

      const activeAuctionIds = activeAuctions.map(auction => auction._id);

      // Count all bids on active auctions with active status
      const activeBidsCount = await BiddingProduct.countDocuments({
        product: { $in: activeAuctionIds },
        bidStatus: { $in: ['Active', 'Winning'] }
      });

      // Broadcast to all connected users
      this.io.emit("active_bids_count_update", {
        totalActiveBids: activeBidsCount,
        activeAuctions: activeAuctionIds.length,
        timestamp: now
      });
    } catch (error) {
    }
  }

  async getCurrentAuctionState(auctionId) {
    try {
      const auction = await Product.findById(auctionId);
      const highestBid = await BiddingProduct.findOne({ product: auctionId })
        .sort({ price: -1 })
        .populate('user', 'name');

      const totalBids = await BiddingProduct.countDocuments({ product: auctionId });
      const currentBid = highestBid ? highestBid.price : auction.startingBid;
      
      const now = new Date();
      let timeRemaining = null;
      if (auction.auctionEndDate) {
        timeRemaining = Math.max(0, auction.auctionEndDate - now);
      }

      return {
        auctionId,
        currentBid,
        totalBids,
        timeRemaining,
        highestBidder: (highestBid && highestBid.user) ? highestBid.user.name : null,
        reserveMet: auction.reservePrice ? currentBid >= auction.reservePrice : true,
        viewerCount: this.auctionRooms.get(auctionId)?.size || 0
      };
    } catch (error) {
      return null;
    }
  }

  // Method to end auction and notify all participants
  async endAuction(auctionId) {
    const auctionState = await this.getCurrentAuctionState(auctionId);
    this.io.to(`auction_${auctionId}`).emit("auction_ended", auctionState);
  }

  // Method to send notifications to specific users
  notifyUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  // Notify user about balance updates
  notifyBalanceUpdate(userId, updateData) {
    const socketId = this.connectedUsers.get(userId.toString());
    if (socketId) {
      this.io.to(socketId).emit("balance_update", {
        type: updateData.type || 'BALANCE_CHANGE',
        newBalance: updateData.newBalance,
        transaction: updateData.transaction,
        amount: updateData.amount,
        auctionTitle: updateData.auctionTitle,
        timestamp: new Date()
      });
    }
  }

  // Notify user when they are outbid (with balance refund info)
  notifyUserOutbid(userId, outbidData) {
    const socketId = this.connectedUsers.get(userId.toString());
    if (socketId) {
      this.io.to(socketId).emit("user_outbid", {
        product: outbidData.product,
        outbidAmount: outbidData.outbidAmount,
        previousBid: outbidData.previousBid,
        refundProcessed: true,
        timestamp: new Date()
      });
    }
  }

  // Notify user about bid on their listing
  async notifyListingOwnerOfBid(listingId, bidData) {
    try {
      const listing = await Product.findById(listingId).populate('user', 'name');
      if (listing && listing.user) {
        const ownerId = listing.user._id.toString();

        // Send to user's listing room
        this.io.to(`user_listings_${ownerId}`).emit("listing_bid_update", {
          listingId,
          listingTitle: listing.title,
          bidData: {
            amount: bidData.price,
            bidder: {
              name: bidData.user?.name || 'Anonymous',
              id: bidData.user?._id
            },
            timestamp: bidData.createdAt || new Date()
          },
          totalBids: await BiddingProduct.countDocuments({ product: listingId }),
          currentBid: bidData.price
        });

        // Also send to specific listing room
        this.io.to(`listing_${listingId}`).emit("listing_bid_update", {
          listingId,
          bidData,
          totalBids: await BiddingProduct.countDocuments({ product: listingId })
        });
      }
    } catch (error) {
    }
  }

  // Notify user about auction status change on their listing
  async notifyListingOwnerOfStatusChange(listingId, statusData) {
    try {
      const listing = await Product.findById(listingId).populate('user', 'name');
      if (listing && listing.user) {
        const ownerId = listing.user._id.toString();

        // Send to user's listing room
        this.io.to(`user_listings_${ownerId}`).emit("listing_status_update", {
          listingId,
          listingTitle: listing.title,
          status: statusData.status,
          timeRemaining: statusData.timeRemaining,
          message: statusData.message
        });

        // Also send to specific listing room
        this.io.to(`listing_${listingId}`).emit("listing_status_update", statusData);
      }
    } catch (error) {
    }
  }

  // Get all user's active listings for real-time updates
  async getUserActiveListings(userId) {
    try {
      const listings = await Product.find({
        user: userId,
        auctionEndDate: { $gt: new Date() }
      }).select('_id title auctionEndDate');

      return listings;
    } catch (error) {
      return [];
    }
  }

  // Instant Purchase Notification Methods
  notifyInstantPurchaseWinner(userId, data) {
    try {
      const socketId = this.connectedUsers.get(userId.toString());
      if (socketId) {
        this.io.to(socketId).emit('instant_purchase_winner', {
          type: 'INSTANT_PURCHASE_WINNER',
          timestamp: new Date(),
          data: {
            product: data.product,
            winningBid: data.winningBid,
            message: data.message,
            auctionEndReason: 'instant_purchase'
          }
        });
      }
    } catch (error) {
      console.error('Error notifying instant purchase winner:', error);
    }
  }

  notifyInstantPurchaseSeller(sellerId, data) {
    try {
      const socketId = this.connectedUsers.get(sellerId.toString());
      if (socketId) {
        this.io.to(socketId).emit('instant_purchase_seller', {
          type: 'INSTANT_PURCHASE_SELLER',
          timestamp: new Date(),
          data: {
            product: data.product,
            winner: data.winner,
            finalPrice: data.finalPrice,
            message: `Your auction for "${data.product.title}" sold instantly for $${data.finalPrice}!`
          }
        });
      }
    } catch (error) {
      console.error('Error notifying instant purchase seller:', error);
    }
  }

  notifyAuctionEnded(auctionId, data) {
    try {
      // Notify all users in the auction room
      const roomName = `auction_${auctionId}`;
      this.io.to(roomName).emit('auction_ended', {
        type: 'AUCTION_ENDED',
        timestamp: new Date(),
        data: {
          auctionId,
          reason: data.reason,
          winner: data.winner,
          finalPrice: data.finalPrice,
          product: data.product
        }
      });

      // Also notify specific users if they're connected
      if (data.winner && data.winner.id) {
        this.notifyInstantPurchaseWinner(data.winner.id, {
          product: data.product,
          winningBid: data.finalPrice,
          message: 'Congratulations! You won the auction with an instant purchase!'
        });
      }
    } catch (error) {
      console.error('Error notifying auction ended:', error);
    }
  }

  notifyBalanceUpdate(userId, data) {
    try {
      const socketId = this.connectedUsers.get(userId.toString());
      if (socketId) {
        this.io.to(socketId).emit('balance_update', {
          type: 'BALANCE_UPDATE',
          timestamp: new Date(),
          data: {
            updateType: data.type,
            amount: data.amount,
            auctionTitle: data.auctionTitle,
            reason: data.reason || 'Auction settlement'
          }
        });
      }
    } catch (error) {
      console.error('Error notifying balance update:', error);
    }
  }

  // Broadcast instant purchase to all auction watchers
  broadcastInstantPurchase(auctionId, data) {
    try {
      const roomName = `auction_${auctionId}`;
      this.io.to(roomName).emit('instant_purchase_triggered', {
        type: 'INSTANT_PURCHASE_TRIGGERED',
        timestamp: new Date(),
        data: {
          auctionId,
          winner: data.winner,
          finalPrice: data.finalPrice,
          instantPurchasePrice: data.instantPurchasePrice,
          product: data.product,
          message: 'Auction ended due to instant purchase!'
        }
      });
    } catch (error) {
      console.error('Error broadcasting instant purchase:', error);
    }
  }
}

module.exports = SocketService;
