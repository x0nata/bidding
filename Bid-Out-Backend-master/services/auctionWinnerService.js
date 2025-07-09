const Product = require("../model/productModel");
const BiddingProduct = require("../model/biddingProductModel");
const User = require("../model/userModel");
const sendEmail = require("../utils/sendEmail");
const AuctionSettlementService = require("./auctionSettlementService");

class AuctionWinnerService {
  
  /**
   * Determine and process auction winner for both Live and Timed auctions
   * @param {String} auctionId - The auction/product ID
   * @param {String} reason - Reason for ending ('time_expired', 'instant_purchase', 'admin_ended')
   * @param {Object} options - Additional options
   */
  async determineAndProcessWinner(auctionId, reason = 'time_expired', options = {}) {
    try {
      const auction = await Product.findById(auctionId).populate('user', 'name email');
      if (!auction) {
        throw new Error('Auction not found');
      }

      if (auction.isSoldout) {
        return { success: false, message: 'Auction already ended' };
      }

      // Get the highest bid
      const winningBid = await BiddingProduct.findOne({ product: auctionId })
        .sort({ price: -1 })
        .populate('user', 'name email');

      if (!winningBid) {
        return await this.handleNoWinnerScenario(auction, reason);
      }

      // Check reserve price for both auction types
      if (auction.reservePrice && winningBid.price < auction.reservePrice) {
        return await this.handleReserveNotMet(auction, winningBid, reason);
      }

      // Process successful auction
      return await this.processSuccessfulAuction(auction, winningBid, reason, options);

    } catch (error) {
      console.error('Error in determineAndProcessWinner:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle scenario where no bids were placed
   */
  async handleNoWinnerScenario(auction, reason) {
    try {
      // Mark auction as ended
      auction.isSoldout = true;
      await auction.save();

      // Refund any held amounts (safety check)
      await AuctionSettlementService.refundAllBidders(auction._id, `Auction ended with no bids - ${reason}`);

      // Notify seller
      await this.notifySeller(auction, null, 'no_bids', reason);

      // Notify via WebSocket if available
      if (global.socketService) {
        global.socketService.notifyAuctionEnded(auction._id, {
          reason,
          winner: null,
          finalPrice: 0,
          product: auction
        });
      }

      return {
        success: true,
        message: 'Auction ended with no bids',
        auction,
        winner: null
      };
    } catch (error) {
      console.error('Error handling no winner scenario:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle scenario where reserve price was not met
   */
  async handleReserveNotMet(auction, highestBid, reason) {
    try {
      // Mark auction as ended
      auction.isSoldout = true;
      await auction.save();

      // Update all bids to 'Lost'
      await BiddingProduct.updateMany(
        { product: auction._id },
        { bidStatus: 'Lost', isWinningBid: false }
      );

      // Refund all bidders since reserve wasn't met
      await AuctionSettlementService.refundAllBidders(auction._id, `Reserve price not met - ${reason}`);

      // Send notifications
      await this.notifySeller(auction, highestBid, 'reserve_not_met', reason);
      await this.notifyBidders(auction._id, 'reserve_not_met', reason);

      // Notify via WebSocket if available
      if (global.socketService) {
        global.socketService.notifyAuctionEnded(auction._id, {
          reason: 'reserve_not_met',
          winner: null,
          finalPrice: highestBid.price,
          reservePrice: auction.reservePrice,
          product: auction
        });
      }

      return {
        success: true,
        message: 'Auction ended - reserve price not met',
        auction,
        highestBid: highestBid.price,
        reservePrice: auction.reservePrice
      };
    } catch (error) {
      console.error('Error handling reserve not met:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Process successful auction with winner
   */
  async processSuccessfulAuction(auction, winningBid, reason, options = {}) {
    try {
      // Update auction as sold
      auction.isSoldout = true;
      auction.soldTo = winningBid.user._id;
      auction.finalPrice = winningBid.price;
      await auction.save();

      // Update winning bid
      winningBid.bidStatus = 'Won';
      winningBid.isWinningBid = true;
      await winningBid.save();

      // Update all other bids to 'Lost'
      await BiddingProduct.updateMany(
        { product: auction._id, _id: { $ne: winningBid._id } },
        { bidStatus: 'Lost', isWinningBid: false }
      );

      // Handle balance settlements
      const settlementResult = await AuctionSettlementService.settleAuctionBalances(auction._id, winningBid);

      // Send notifications
      await this.notifyWinner(auction, winningBid, reason);
      await this.notifySeller(auction, winningBid, 'successful', reason);
      await this.notifyLosers(auction._id, winningBid._id, reason);

      // Notify via WebSocket if available
      if (global.socketService) {
        global.socketService.notifyAuctionEnded(auction._id, {
          reason,
          winner: {
            id: winningBid.user._id,
            name: winningBid.user.name,
            email: winningBid.user.email
          },
          finalPrice: winningBid.price,
          product: auction
        });

        // Notify about balance updates
        if (settlementResult.winnerSettlement) {
          global.socketService.notifyBalanceUpdate(winningBid.user._id, {
            type: 'AUCTION_PAYMENT',
            amount: winningBid.price,
            auctionTitle: auction.title
          });
        }

        // Notify refunded users
        for (const refund of settlementResult.loserRefunds) {
          global.socketService.notifyBalanceUpdate(refund.userId, {
            type: 'BID_REFUND',
            amount: refund.amount,
            auctionTitle: auction.title
          });
        }
      }

      return {
        success: true,
        message: 'Auction ended successfully',
        auction,
        winner: {
          user: winningBid.user,
          winningBid: winningBid.price,
          totalBids: await BiddingProduct.countDocuments({ product: auction._id })
        },
        settlement: {
          completed: settlementResult.success,
          errors: settlementResult.errors
        }
      };
    } catch (error) {
      console.error('Error processing successful auction:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if a bid amount triggers instant purchase for live auctions
   */
  isInstantPurchaseTriggered(auction, bidAmount) {
    return auction.auctionType === 'Live' && 
           auction.instantPurchasePrice && 
           bidAmount >= auction.instantPurchasePrice;
  }

  /**
   * Check if a bid amount triggers instant purchase for timed auctions (Buy It Now)
   */
  isBuyItNowTriggered(auction, bidAmount) {
    return auction.auctionType === 'Timed' && 
           auction.instantPurchasePrice && 
           bidAmount >= auction.instantPurchasePrice;
  }

  /**
   * Send notification to auction winner
   */
  async notifyWinner(auction, winningBid, reason) {
    try {
      const reasonText = this.getReasonText(reason);
      
      await sendEmail({
        email: winningBid.user.email,
        subject: `Congratulations! You won the auction for "${auction.title}"`,
        text: `
Dear ${winningBid.user.name},

Congratulations! You have won the ${auction.auctionType.toLowerCase()} auction for "${auction.title}" with your bid of $${winningBid.price}.

${reasonText}

Auction Details:
- Item: ${auction.title}
- Auction Type: ${auction.auctionType}
- Winning Bid: $${winningBid.price}
- Auction End: ${new Date().toLocaleString()}

Next Steps:
1. You will be contacted by the seller for payment and shipping arrangements
2. Please complete payment within 48 hours
3. Shipping details will be provided after payment confirmation

Thank you for participating in Horn of Antiques!

Best regards,
Horn of Antiques Team
        `,
      });
    } catch (error) {
      console.error('Error notifying winner:', error);
    }
  }

  /**
   * Send notification to seller
   */
  async notifySeller(auction, winningBid, status, reason) {
    try {
      const reasonText = this.getReasonText(reason);
      let subject, text;
      
      switch (status) {
        case 'successful':
          subject = `Your ${auction.auctionType.toLowerCase()} auction for "${auction.title}" has ended successfully!`;
          text = `
Dear ${auction.user.name},

Your ${auction.auctionType.toLowerCase()} auction for "${auction.title}" has ended successfully!

${reasonText}

Auction Results:
- Auction Type: ${auction.auctionType}
- Winning Bid: $${winningBid.price}
- Winner: ${winningBid.user.name}
- Total Bids: ${await BiddingProduct.countDocuments({ product: auction._id })}

Next Steps:
1. Contact the winner at ${winningBid.user.email} for payment arrangements
2. Arrange shipping after payment confirmation
3. Update the auction status once the item is shipped

Thank you for using Horn of Antiques!

Best regards,
Horn of Antiques Team
          `;
          break;
          
        case 'reserve_not_met':
          subject = `Your ${auction.auctionType.toLowerCase()} auction for "${auction.title}" ended - Reserve price not met`;
          text = `
Dear ${auction.user.name},

Your ${auction.auctionType.toLowerCase()} auction for "${auction.title}" has ended, but the reserve price was not met.

${reasonText}

Auction Results:
- Auction Type: ${auction.auctionType}
- Highest Bid: $${winningBid.price}
- Reserve Price: $${auction.reservePrice}
- Total Bids: ${await BiddingProduct.countDocuments({ product: auction._id })}

You may choose to:
1. Contact the highest bidder to negotiate
2. Relist the item with a lower reserve price
3. Relist the item as a "Buy Now" auction

Thank you for using Horn of Antiques!

Best regards,
Horn of Antiques Team
          `;
          break;
          
        case 'no_bids':
          subject = `Your ${auction.auctionType.toLowerCase()} auction for "${auction.title}" ended with no bids`;
          text = `
Dear ${auction.user.name},

Your ${auction.auctionType.toLowerCase()} auction for "${auction.title}" has ended with no bids received.

${reasonText}

You may choose to:
1. Relist the item with a lower starting price
2. Improve the item description and photos
3. Choose a different category or timing

Thank you for using Horn of Antiques!

Best regards,
Horn of Antiques Team
          `;
          break;
      }
      
      await sendEmail({
        email: auction.user.email,
        subject,
        text,
      });
    } catch (error) {
      console.error('Error notifying seller:', error);
    }
  }

  /**
   * Send notification to losing bidders
   */
  async notifyLosers(auctionId, winningBidId, reason) {
    try {
      const losingBids = await BiddingProduct.find({
        product: auctionId,
        _id: { $ne: winningBidId }
      }).populate('user', 'name email').populate('product', 'title auctionType');

      const reasonText = this.getReasonText(reason);

      for (const bid of losingBids) {
        await sendEmail({
          email: bid.user.email,
          subject: `Auction ended for "${bid.product.title}"`,
          text: `
Dear ${bid.user.name},

The ${bid.product.auctionType.toLowerCase()} auction for "${bid.product.title}" has ended.

${reasonText}

Unfortunately, your bid of $${bid.price} was not the winning bid.

Thank you for participating in Horn of Antiques! We hope you'll find other interesting items in our upcoming auctions.

Best regards,
Horn of Antiques Team
          `,
        });
      }
    } catch (error) {
      console.error('Error notifying losers:', error);
    }
  }

  /**
   * Send notification to all bidders for specific scenarios
   */
  async notifyBidders(auctionId, status, reason) {
    try {
      const bids = await BiddingProduct.find({ product: auctionId })
        .populate('user', 'name email')
        .populate('product', 'title auctionType');

      const reasonText = this.getReasonText(reason);

      for (const bid of bids) {
        let subject, text;
        
        if (status === 'reserve_not_met') {
          subject = `Auction ended for "${bid.product.title}" - Reserve not met`;
          text = `
Dear ${bid.user.name},

The ${bid.product.auctionType.toLowerCase()} auction for "${bid.product.title}" has ended, but the reserve price was not met.

${reasonText}

Your bid of $${bid.price} was not successful as the seller's reserve price was higher than the highest bid.

Thank you for participating in Horn of Antiques!

Best regards,
Horn of Antiques Team
          `;
        }
        
        await sendEmail({
          email: bid.user.email,
          subject,
          text,
        });
      }
    } catch (error) {
      console.error('Error notifying bidders:', error);
    }
  }

  /**
   * Get human-readable text for auction ending reason
   */
  getReasonText(reason) {
    switch (reason) {
      case 'instant_purchase':
        return 'The auction ended because the instant purchase price was reached.';
      case 'time_expired':
        return 'The auction ended when the scheduled time expired.';
      case 'admin_ended':
        return 'The auction was ended by an administrator.';
      default:
        return 'The auction has ended.';
    }
  }
}

module.exports = AuctionWinnerService;
