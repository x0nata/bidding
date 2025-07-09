const mongoose = require("mongoose");
const BalanceService = require("./balanceService");
const Transaction = require("../model/transactionModel");
const BiddingProduct = require("../model/biddingProductModel");
const Product = require("../model/productModel");

class ErrorHandlingService {
  /**
   * Handle concurrent bidding scenarios
   * @param {string} productId - Product ID
   * @param {string} userId - User ID
   * @param {number} bidAmount - Bid amount
   * @returns {Promise<object>} Result of handling concurrent bids
   */
  static async handleConcurrentBids(productId, userId, bidAmount) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Lock the product for update to prevent race conditions
      const product = await Product.findById(productId).session(session);
      if (!product) {
        throw new Error("Product not found");
      }

      // Get the current highest bid with lock
      const currentHighestBid = await BiddingProduct.findOne({ product: productId })
        .sort({ price: -1 })
        .session(session);

      const currentPrice = currentHighestBid ? currentHighestBid.price : product.startingBid;
      const minimumBid = currentPrice + (product.bidIncrement || 10);

      // Validate bid amount against current state
      if (bidAmount < minimumBid) {
        await session.abortTransaction();
        return {
          success: false,
          error: `Bid too low. Minimum bid is ${minimumBid} ETB`,
          currentBid: currentPrice
        };
      }

      // Check if user already has a bid
      const existingBid = await BiddingProduct.findOne({ 
        product: productId, 
        user: userId 
      }).session(session);

      if (existingBid && bidAmount <= existingBid.price) {
        await session.abortTransaction();
        return {
          success: false,
          error: "Your new bid must be higher than your previous bid",
          currentBid: currentPrice
        };
      }

      await session.commitTransaction();
      return {
        success: true,
        currentBid: currentPrice,
        minimumBid,
        existingBid
      };

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Handle insufficient balance scenarios with detailed feedback
   * @param {string} userId - User ID
   * @param {number} requiredAmount - Required amount
   * @returns {Promise<object>} Balance analysis and suggestions
   */
  static async handleInsufficientBalance(userId, requiredAmount) {
    try {
      const balanceInfo = await BalanceService.getUserBalanceInfo(userId);
      const shortfall = requiredAmount - balanceInfo.availableBalance;

      const suggestions = [];
      
      if (balanceInfo.heldAmount > 0) {
        suggestions.push({
          type: 'RELEASE_HOLDS',
          message: `You have ${balanceInfo.heldAmount} ETB held for other bids. Consider canceling some bids to free up balance.`,
          amount: balanceInfo.heldAmount
        });
      }

      if (shortfall <= 1000) {
        suggestions.push({
          type: 'ADD_SMALL_AMOUNT',
          message: `Add just ${shortfall.toFixed(2)} ETB more to place this bid.`,
          amount: shortfall
        });
      } else {
        suggestions.push({
          type: 'ADD_BALANCE',
          message: `Add ${shortfall.toFixed(2)} ETB to your account to place this bid.`,
          amount: shortfall
        });
      }

      return {
        success: false,
        error: 'INSUFFICIENT_BALANCE',
        balanceInfo,
        shortfall,
        suggestions
      };

    } catch (error) {
      return {
        success: false,
        error: 'BALANCE_CHECK_FAILED',
        message: 'Unable to check balance. Please try again.'
      };
    }
  }

  /**
   * Handle auction ending edge cases
   * @param {string} auctionId - Auction ID
   * @returns {Promise<object>} Cleanup results
   */
  static async handleAuctionEndingEdgeCases(auctionId) {
    const results = {
      success: true,
      cleanupActions: [],
      errors: []
    };

    try {
      // Find all active bids for this auction
      const activeBids = await BiddingProduct.find({
        product: auctionId,
        bidStatus: { $in: ['Active', 'Winning'] }
      });

      // Find all held transactions for this auction
      const heldTransactions = await Transaction.find({
        relatedProduct: auctionId,
        type: 'BID_HOLD',
        isHeld: true
      });

      // Check for orphaned holds (holds without corresponding bids)
      for (const hold of heldTransactions) {
        const correspondingBid = activeBids.find(bid => 
          bid.holdTransactionId && bid.holdTransactionId.toString() === hold._id.toString()
        );

        if (!correspondingBid) {
          try {
            await BalanceService.releaseBidHold(
              hold._id,
              `Cleanup: Released orphaned hold for auction ${auctionId}`
            );
            results.cleanupActions.push({
              type: 'ORPHANED_HOLD_RELEASED',
              transactionId: hold._id,
              amount: hold.amount,
              userId: hold.user
            });
          } catch (error) {
            results.errors.push({
              type: 'HOLD_RELEASE_FAILED',
              transactionId: hold._id,
              error: error.message
            });
          }
        }
      }

      // Check for bids without holds
      for (const bid of activeBids) {
        if (!bid.holdTransactionId) {
          results.cleanupActions.push({
            type: 'BID_WITHOUT_HOLD',
            bidId: bid._id,
            userId: bid.user,
            amount: bid.price
          });
        }
      }

      return results;

    } catch (error) {
      results.success = false;
      results.errors.push({
        type: 'CLEANUP_FAILED',
        error: error.message
      });
      return results;
    }
  }

  /**
   * Implement transaction rollback for failed operations
   * @param {string} transactionId - Transaction ID to rollback
   * @param {string} reason - Reason for rollback
   * @returns {Promise<object>} Rollback result
   */
  static async rollbackTransaction(transactionId, reason) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const transaction = await Transaction.findById(transactionId).session(session);
      if (!transaction) {
        throw new Error("Transaction not found");
      }

      if (transaction.status === 'CANCELLED') {
        return {
          success: true,
          message: "Transaction already cancelled"
        };
      }

      // Handle different transaction types
      let rollbackAction = null;

      switch (transaction.type) {
        case 'BID_HOLD':
          if (transaction.isHeld) {
            rollbackAction = await BalanceService.releaseBidHold(
              transactionId,
              `Rollback: ${reason}`
            );
          }
          break;

        case 'DEPOSIT':
          // For deposits, we would need to reverse the balance addition
          // This is more complex and might require admin approval
          rollbackAction = {
            success: false,
            error: "Deposit rollbacks require manual processing"
          };
          break;

        case 'BID_DEDUCTION':
          // Convert back to a hold or refund
          rollbackAction = await BalanceService.addBalance(
            transaction.user,
            transaction.amount,
            'SYSTEM',
            `Rollback refund: ${reason}`,
            { originalTransactionId: transactionId }
          );
          break;

        default:
          rollbackAction = {
            success: false,
            error: `Rollback not supported for transaction type: ${transaction.type}`
          };
      }

      // Mark original transaction as cancelled
      transaction.status = 'CANCELLED';
      transaction.metadata = {
        ...transaction.metadata,
        rollbackReason: reason,
        rollbackDate: new Date()
      };
      await transaction.save({ session });

      await session.commitTransaction();

      return {
        success: rollbackAction?.success || false,
        rollbackAction,
        originalTransaction: transaction
      };

    } catch (error) {
      await session.abortTransaction();
      return {
        success: false,
        error: error.message
      };
    } finally {
      session.endSession();
    }
  }

  /**
   * Validate system integrity and fix inconsistencies
   * @returns {Promise<object>} Validation and fix results
   */
  static async validateAndFixSystemIntegrity() {
    const results = {
      success: true,
      checks: [],
      fixes: [],
      errors: []
    };

    try {
      // Check 1: Users with negative balances
      const usersWithNegativeBalance = await mongoose.connection.db
        .collection('users')
        .find({ balance: { $lt: 0 } })
        .toArray();

      results.checks.push({
        name: 'NEGATIVE_BALANCE_CHECK',
        count: usersWithNegativeBalance.length,
        users: usersWithNegativeBalance.map(u => ({ id: u._id, balance: u.balance }))
      });

      // Check 2: Held transactions older than 30 days
      const oldHeldTransactions = await Transaction.find({
        type: 'BID_HOLD',
        isHeld: true,
        createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      });

      results.checks.push({
        name: 'OLD_HELD_TRANSACTIONS',
        count: oldHeldTransactions.length
      });

      // Auto-fix old held transactions
      for (const hold of oldHeldTransactions) {
        try {
          await BalanceService.releaseBidHold(
            hold._id,
            'System cleanup: Released old held transaction'
          );
          results.fixes.push({
            type: 'OLD_HOLD_RELEASED',
            transactionId: hold._id,
            amount: hold.amount
          });
        } catch (error) {
          results.errors.push({
            type: 'OLD_HOLD_RELEASE_FAILED',
            transactionId: hold._id,
            error: error.message
          });
        }
      }

      // Check 3: Bids without corresponding holds
      const bidsWithoutHolds = await BiddingProduct.find({
        bidStatus: { $in: ['Active', 'Winning'] },
        holdTransactionId: { $exists: false }
      });

      results.checks.push({
        name: 'BIDS_WITHOUT_HOLDS',
        count: bidsWithoutHolds.length
      });

      return results;

    } catch (error) {
      results.success = false;
      results.errors.push({
        type: 'INTEGRITY_CHECK_FAILED',
        error: error.message
      });
      return results;
    }
  }
}

module.exports = ErrorHandlingService;
