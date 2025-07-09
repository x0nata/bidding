// const schedule = require("node-schedule"); // Disabled for serverless deployment
const Product = require("../model/productModel");
const BiddingProduct = require("../model/biddingProductModel");
const User = require("../model/userModel");
const sendEmail = require("../utils/sendEmail");
const AuctionSettlementService = require("./auctionSettlementService");
const AuctionWinnerService = require("./auctionWinnerService");

class AuctionScheduler {
  constructor() {
    this.scheduledJobs = new Map(); // auctionId -> job
    this.auctionWinnerService = new AuctionWinnerService();
    this.initializeScheduler();
  }

  async initializeScheduler() {
    
    // Schedule existing auctions that haven't ended yet
    await this.scheduleExistingAuctions();
    
    // Run cleanup every hour to check for missed auctions
    // schedule.scheduleJob("0 * * * *", () => {
    //   this.cleanupMissedAuctions();
    // }); // Disabled for serverless deployment
    
  }

  async scheduleExistingAuctions() {
    try {
      const now = new Date();
      
      // Find all timed auctions that haven't ended yet
      const activeAuctions = await Product.find({
        auctionType: 'Timed',
        auctionEndDate: { $gt: now },
        isSoldout: false
      });


      for (const auction of activeAuctions) {
        this.scheduleAuctionEnd(auction._id, auction.auctionEndDate);
      }
    } catch (error) {
    }
  }

  scheduleAuctionEnd(auctionId, endDate) {
    // Cancel existing job if it exists
    if (this.scheduledJobs.has(auctionId.toString())) {
      this.scheduledJobs.get(auctionId.toString()).cancel();
    }

    // Schedule new job
    // const job = schedule.scheduleJob(endDate, async () => {
    //   await this.endAuction(auctionId);
    //   this.scheduledJobs.delete(auctionId.toString());
    // }); // Disabled for serverless deployment

    // this.scheduledJobs.set(auctionId.toString(), job);
    console.log('📅 Scheduling disabled for serverless - use Vercel cron instead');
  }

  async endAuction(auctionId) {
    try {
      // Use the winner service to handle auction ending
      const result = await this.auctionWinnerService.determineAndProcessWinner(
        auctionId,
        'time_expired'
      );

      // Log result for debugging
      if (!result.success) {
        console.error('Failed to end auction:', auctionId, result.error);
      }

    } catch (error) {
      console.error('Error in endAuction:', error);
    }
  }

  async notifyWinner(auction, winningBid) {
    try {
      // Email functionality disabled for simplified deployment
      console.log('📧 Email disabled - would notify auction winner:', {
        winner: winningBid.user.email,
        auction: auction.title,
        price: winningBid.price
      });
    } catch (error) {
    }
  }

  async notifySeller(auction, winningBid, status) {
    try {
      let subject, text;
      
      switch (status) {
        case 'successful':
          subject = `Your auction for "${auction.title}" has ended successfully!`;
          text = `
Dear ${auction.user.name},

Your auction for "${auction.title}" has ended successfully!

Auction Results:
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
          subject = `Your auction for "${auction.title}" ended - Reserve price not met`;
          text = `
Dear ${auction.user.name},

Your auction for "${auction.title}" has ended, but the reserve price was not met.

Auction Results:
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
          subject = `Your auction for "${auction.title}" ended with no bids`;
          text = `
Dear ${auction.user.name},

Your auction for "${auction.title}" has ended with no bids received.

You may choose to:
1. Relist the item with a lower starting price
2. Improve the item description and photos
3. Choose a different category or timing

Thank you for using Horn of Antiques!

Best regards,
Antique Auction System Team
          `;
          break;
      }
      
      // Email functionality disabled for simplified deployment
      console.log('📧 Email disabled - would notify seller:', {
        seller: auction.user.email,
        auction: auction.title,
        status: status
      });
    } catch (error) {
    }
  }

  async notifyLosers(auctionId, winningBidId) {
    try {
      const losingBids = await BiddingProduct.find({
        product: auctionId,
        _id: { $ne: winningBidId }
      }).populate('user', 'name email').populate('product', 'title');

      for (const bid of losingBids) {
        // Email functionality disabled for simplified deployment
        console.log('📧 Email disabled - would notify losing bidder:', {
          bidder: bid.user.email,
          auction: bid.product.title
        });
      }
    } catch (error) {
    }
  }

  async notifyBidders(auctionId, status) {
    try {
      const bids = await BiddingProduct.find({ product: auctionId })
        .populate('user', 'name email')
        .populate('product', 'title');

      for (const bid of bids) {
        let subject, text;
        
        if (status === 'reserve_not_met') {
          subject = `Auction ended for "${bid.product.title}" - Reserve not met`;
          text = `
Dear ${bid.user.name},

The auction for "${bid.product.title}" has ended, but the reserve price was not met.

Your bid of $${bid.price} was not successful as the seller's reserve price was higher than the highest bid.

Thank you for participating in Horn of Antiques!

Best regards,
Horn of Antiques Team
          `;
        }
        
        // Email functionality disabled for simplified deployment
        console.log('📧 Email disabled - would notify bidder:', bid.user.email);
      }
    } catch (error) {
    }
  }

  async cleanupMissedAuctions() {
    try {
      const now = new Date();
      
      // Find auctions that should have ended but are still active
      const missedAuctions = await Product.find({
        auctionType: 'Timed',
        auctionEndDate: { $lt: now },
        isSoldout: false
      });


      for (const auction of missedAuctions) {
        await this.endAuction(auction._id);
      }
    } catch (error) {
    }
  }

  // Method to reschedule an auction (when end time is extended)
  rescheduleAuction(auctionId, newEndDate) {
    this.scheduleAuctionEnd(auctionId, newEndDate);
  }

  // Method to cancel a scheduled auction
  cancelScheduledAuction(auctionId) {
    const job = this.scheduledJobs.get(auctionId.toString());
    if (job) {
      job.cancel();
      this.scheduledJobs.delete(auctionId.toString());
    }
  }
}

module.exports = AuctionScheduler;
