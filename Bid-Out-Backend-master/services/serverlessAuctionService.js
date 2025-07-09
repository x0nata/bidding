/**
 * Serverless-compatible Auction Service
 * 
 * This service provides auction management functionality for serverless environments
 * replacing the node-schedule based AuctionScheduler with HTTP-based triggers
 */

const Product = require("../model/productModel");
const BiddingProduct = require("../model/biddingProductModel");
const User = require("../model/userModel");
const sendEmail = require("../utils/sendEmail");

class ServerlessAuctionService {
  constructor() {
    // No persistent scheduling in serverless
    // Instead, we provide methods to be called via HTTP endpoints or cron jobs
  }

  /**
   * Check and process expired auctions
   * This should be called by external cron services (Vercel Cron, GitHub Actions)
   */
  async processExpiredAuctions() {
    try {
      const now = new Date();
      
      // Find auctions that should have ended but are still active
      const expiredAuctions = await Product.find({
        auctionType: 'Timed',
        auctionEndDate: { $lt: now },
        isSoldout: false
      });

      console.log(`Found ${expiredAuctions.length} expired auctions to process`);

      const results = [];
      for (const auction of expiredAuctions) {
        try {
          const result = await this.endAuction(auction._id);
          results.push({ auctionId: auction._id, success: true, result });
        } catch (error) {
          console.error(`Failed to end auction ${auction._id}:`, error);
          results.push({ auctionId: auction._id, success: false, error: error.message });
        }
      }

      return {
        processed: expiredAuctions.length,
        results,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error processing expired auctions:', error);
      throw error;
    }
  }

  /**
   * End a specific auction and determine winner
   */
  async endAuction(auctionId) {
    try {
      const auction = await Product.findById(auctionId);
      if (!auction) {
        throw new Error('Auction not found');
      }

      if (auction.isSoldout) {
        return { message: 'Auction already ended', auctionId };
      }

      // Find the highest bid
      const winningBid = await BiddingProduct.findOne({
        product: auctionId
      }).sort({ bidAmount: -1 }).populate('user', 'name email');

      if (!winningBid) {
        // No bids - mark as ended without winner
        await Product.findByIdAndUpdate(auctionId, {
          isSoldout: true,
          auctionEndReason: 'no_bids'
        });

        return {
          auctionId,
          status: 'ended',
          winner: null,
          reason: 'no_bids'
        };
      }

      // Update auction as sold
      await Product.findByIdAndUpdate(auctionId, {
        isSoldout: true,
        currentPrice: winningBid.bidAmount,
        auctionEndReason: 'time_expired',
        winner: winningBid.user._id
      });

      // Update winning bid status
      await BiddingProduct.findByIdAndUpdate(winningBid._id, {
        isWinning: true
      });

      // Notify winner
      await this.notifyWinner(auction, winningBid);

      // Notify other bidders
      await this.notifyOtherBidders(auctionId, winningBid.user._id);

      return {
        auctionId,
        status: 'ended',
        winner: {
          userId: winningBid.user._id,
          name: winningBid.user.name,
          email: winningBid.user.email,
          winningBid: winningBid.bidAmount
        },
        reason: 'time_expired'
      };
    } catch (error) {
      console.error('Error ending auction:', error);
      throw error;
    }
  }

  /**
   * Check if an auction should be extended due to late bids
   */
  async checkAuctionExtension(auctionId) {
    try {
      const auction = await Product.findById(auctionId);
      if (!auction || auction.auctionType !== 'Timed' || !auction.auctionEndDate) {
        return { extended: false, reason: 'not_applicable' };
      }

      const now = new Date();
      const timeRemaining = auction.auctionEndDate - now;
      const extendThreshold = 5 * 60 * 1000; // 5 minutes

      if (timeRemaining < extendThreshold && timeRemaining > 0) {
        // Check if there was a recent bid
        const recentBid = await BiddingProduct.findOne({
          product: auctionId,
          createdAt: { $gte: new Date(now - extendThreshold) }
        });

        if (recentBid) {
          const newEndTime = new Date(now.getTime() + extendThreshold);
          await Product.findByIdAndUpdate(auctionId, {
            auctionEndDate: newEndTime
          });

          return {
            extended: true,
            newEndTime,
            reason: 'late_bid',
            originalEndTime: auction.auctionEndDate
          };
        }
      }

      return { extended: false, reason: 'no_recent_bids' };
    } catch (error) {
      console.error('Error checking auction extension:', error);
      throw error;
    }
  }

  /**
   * Get auctions that are ending soon (for notifications)
   */
  async getAuctionsEndingSoon(minutesAhead = 30) {
    try {
      const now = new Date();
      const endTime = new Date(now.getTime() + (minutesAhead * 60 * 1000));

      const endingSoon = await Product.find({
        auctionType: 'Timed',
        auctionEndDate: { $gte: now, $lte: endTime },
        isSoldout: false
      }).populate('user', 'name email');

      return endingSoon.map(auction => ({
        auctionId: auction._id,
        title: auction.title,
        endTime: auction.auctionEndDate,
        timeRemaining: auction.auctionEndDate - now,
        owner: auction.user
      }));
    } catch (error) {
      console.error('Error getting auctions ending soon:', error);
      throw error;
    }
  }

  /**
   * Notify auction winner
   */
  async notifyWinner(auction, winningBid) {
    console.log('📧 Email disabled - would notify auction winner:', {
      winner: winningBid.user.email,
      auction: auction.title,
      price: winningBid.bidAmount
    });
  }

  /**
   * Notify other bidders about auction end
   */
  async notifyOtherBidders(auctionId, winnerId) {
    try {
      const otherBidders = await BiddingProduct.find({
        product: auctionId,
        user: { $ne: winnerId }
      }).populate('user', 'name email').distinct('user');

      const auction = await Product.findById(auctionId);

      console.log('📧 Email disabled - would notify other bidders:', {
        count: otherBidders.length,
        auction: auction.title
      });
    } catch (error) {
      console.error('Error processing other bidders notification:', error);
    }
  }
}

module.exports = ServerlessAuctionService;
