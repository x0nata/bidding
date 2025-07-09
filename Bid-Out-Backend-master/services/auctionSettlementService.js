const BalanceService = require("./balanceService");
const BiddingProduct = require("../model/biddingProductModel");
const Product = require("../model/productModel");
const User = require("../model/userModel");
const Transaction = require("../model/transactionModel");

class AuctionSettlementService {
  /**
   * Settle all balances when an auction ends successfully
   * @param {string} auctionId - Product/Auction ID
   * @param {object} winningBid - The winning bid object
   * @returns {Promise<object>} Settlement results
   */
  static async settleAuctionBalances(auctionId, winningBid) {
    const results = {
      success: true,
      winnerSettlement: null,
      loserRefunds: [],
      commissionPayment: null,
      sellerPayment: null,
      errors: []
    };

    try {
      const auction = await Product.findById(auctionId).populate('user', 'name email');
      if (!auction) {
        throw new Error("Auction not found");
      }

      // 1. Convert winner's hold to permanent deduction
      if (winningBid.holdTransactionId) {
        try {
          const winnerSettlement = await BalanceService.convertHoldToDeduction(
            winningBid.holdTransactionId,
            `Final payment for winning auction: ${auction.title} - ${winningBid.price} ETB`
          );
          results.winnerSettlement = winnerSettlement;
        } catch (error) {
          results.errors.push(`Winner settlement failed: ${error.message}`);
          results.success = false;
        }
      }

      // 2. Refund all losing bidders
      const losingBids = await BiddingProduct.find({
        product: auctionId,
        _id: { $ne: winningBid._id },
        holdTransactionId: { $exists: true, $ne: null }
      });

      for (const losingBid of losingBids) {
        try {
          const refund = await BalanceService.releaseBidHold(
            losingBid.holdTransactionId,
            `Refund for losing bid on auction: ${auction.title}`
          );
          results.loserRefunds.push({
            bidId: losingBid._id,
            userId: losingBid.user,
            amount: refund.transaction.amount,
            refund
          });
        } catch (error) {
          results.errors.push(`Refund failed for bid ${losingBid._id}: ${error.message}`);
        }
      }

      // 3. Calculate and handle commission
      const commissionRate = auction.commission || 0;
      const commissionAmount = (commissionRate / 100) * winningBid.price;
      const sellerAmount = winningBid.price - commissionAmount;

      // 4. Pay commission to admin (if any)
      if (commissionAmount > 0) {
        try {
          const admin = await User.findOne({ role: "admin" });
          if (admin) {
            const commissionResult = await BalanceService.addBalance(
              admin._id,
              commissionAmount,
              'SYSTEM',
              `Commission from auction: ${auction.title} (${commissionRate}% of ${winningBid.price} ETB)`,
              {
                auctionId,
                winningBidId: winningBid._id,
                commissionRate,
                originalAmount: winningBid.price
              }
            );
            results.commissionPayment = commissionResult;
          }
        } catch (error) {
          results.errors.push(`Commission payment failed: ${error.message}`);
        }
      }

      // 5. Pay seller
      if (sellerAmount > 0) {
        try {
          const sellerResult = await BalanceService.addBalance(
            auction.user._id,
            sellerAmount,
            'SYSTEM',
            `Payment for sold auction: ${auction.title} - ${sellerAmount} ETB (after ${commissionRate}% commission)`,
            {
              auctionId,
              winningBidId: winningBid._id,
              grossAmount: winningBid.price,
              commissionAmount,
              netAmount: sellerAmount
            }
          );
          results.sellerPayment = sellerResult;
        } catch (error) {
          results.errors.push(`Seller payment failed: ${error.message}`);
        }
      }

      // 6. Update auction with settlement info
      auction.settlementCompleted = true;
      auction.settlementDate = new Date();
      auction.finalPrice = winningBid.price;
      auction.commissionAmount = commissionAmount;
      auction.sellerAmount = sellerAmount;
      await auction.save();

      return results;

    } catch (error) {
      results.success = false;
      results.errors.push(error.message);
      return results;
    }
  }

  /**
   * Refund all bidders when auction ends without sale (no bids or reserve not met)
   * @param {string} auctionId - Product/Auction ID
   * @param {string} reason - Reason for refund
   * @returns {Promise<object>} Refund results
   */
  static async refundAllBidders(auctionId, reason = 'Auction ended without sale') {
    const results = {
      success: true,
      refunds: [],
      errors: []
    };

    try {
      const auction = await Product.findById(auctionId);
      if (!auction) {
        throw new Error("Auction not found");
      }

      // Get all bids with holds
      const allBids = await BiddingProduct.find({
        product: auctionId,
        holdTransactionId: { $exists: true, $ne: null }
      });

      for (const bid of allBids) {
        try {
          const refund = await BalanceService.releaseBidHold(
            bid.holdTransactionId,
            `${reason}: ${auction.title}`
          );
          results.refunds.push({
            bidId: bid._id,
            userId: bid.user,
            amount: refund.transaction.amount,
            refund
          });
        } catch (error) {
          results.errors.push(`Refund failed for bid ${bid._id}: ${error.message}`);
        }
      }

      return results;

    } catch (error) {
      results.success = false;
      results.errors.push(error.message);
      return results;
    }
  }

  /**
   * Handle cleanup of expired bid holds (for auctions that ended abnormally)
   * @param {number} daysOld - How many days old the holds should be to clean up
   * @returns {Promise<object>} Cleanup results
   */
  static async cleanupExpiredHolds(daysOld = 7) {
    const results = {
      success: true,
      cleanedHolds: [],
      errors: []
    };

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      // Find expired holds
      const expiredHolds = await Transaction.find({
        type: 'BID_HOLD',
        isHeld: true,
        createdAt: { $lt: cutoffDate }
      }).populate('relatedProduct', 'title isSoldout');

      for (const hold of expiredHolds) {
        try {
          // Check if the related auction has ended
          if (hold.relatedProduct && hold.relatedProduct.isSoldout) {
            const refund = await BalanceService.releaseBidHold(
              hold._id,
              `Cleanup: Released expired hold for ended auction: ${hold.relatedProduct.title}`
            );
            results.cleanedHolds.push({
              holdId: hold._id,
              userId: hold.user,
              amount: hold.amount,
              auctionTitle: hold.relatedProduct.title
            });
          }
        } catch (error) {
          results.errors.push(`Cleanup failed for hold ${hold._id}: ${error.message}`);
        }
      }

      return results;

    } catch (error) {
      results.success = false;
      results.errors.push(error.message);
      return results;
    }
  }

  /**
   * Get settlement status for an auction
   * @param {string} auctionId - Product/Auction ID
   * @returns {Promise<object>} Settlement status
   */
  static async getSettlementStatus(auctionId) {
    try {
      const auction = await Product.findById(auctionId);
      if (!auction) {
        throw new Error("Auction not found");
      }

      const winningBid = await BiddingProduct.findOne({
        product: auctionId,
        bidStatus: 'Won'
      }).populate('user', 'name email');

      const allBids = await BiddingProduct.find({
        product: auctionId
      }).populate('user', 'name email');

      const heldTransactions = await Transaction.find({
        relatedProduct: auctionId,
        type: 'BID_HOLD',
        isHeld: true
      });

      return {
        auction: {
          id: auction._id,
          title: auction.title,
          isSoldout: auction.isSoldout,
          settlementCompleted: auction.settlementCompleted || false,
          settlementDate: auction.settlementDate,
          finalPrice: auction.finalPrice,
          commissionAmount: auction.commissionAmount,
          sellerAmount: auction.sellerAmount
        },
        winningBid,
        totalBids: allBids.length,
        pendingHolds: heldTransactions.length,
        bids: allBids.map(bid => ({
          id: bid._id,
          user: bid.user,
          price: bid.price,
          status: bid.bidStatus,
          hasHold: !!bid.holdTransactionId
        }))
      };

    } catch (error) {
      throw error;
    }
  }
}

module.exports = AuctionSettlementService;
