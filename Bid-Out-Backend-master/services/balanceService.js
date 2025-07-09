const mongoose = require("mongoose");
const User = require("../model/userModel");
const Transaction = require("../model/transactionModel");

class BalanceService {
  /**
   * Add balance to user account (demo payment)
   * @param {string} userId - User ID
   * @param {number} amount - Amount to add
   * @param {string} paymentMethod - Payment method used
   * @param {string} description - Transaction description
   * @param {object} metadata - Additional metadata
   * @param {string} ipAddress - User IP address
   * @param {string} userAgent - User agent
   * @returns {Promise<object>} Transaction and updated balance
   */
  static async addBalance(userId, amount, paymentMethod = 'DEMO_CARD', description, metadata = {}, ipAddress, userAgent) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get user with current balance
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new Error("User not found");
      }

      const balanceBefore = user.balance || 0;
      const balanceAfter = balanceBefore + amount;

      // Create transaction record
      const transaction = new Transaction({
        user: userId,
        type: 'DEPOSIT',
        amount,
        balanceBefore,
        balanceAfter,
        status: 'COMPLETED',
        description,
        paymentMethod,
        paymentReference: `DEMO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        metadata,
        ipAddress,
        userAgent,
      });

      await transaction.save({ session });

      // Update user balance
      user.balance = balanceAfter;
      await user.save({ session });

      await session.commitTransaction();

      return {
        transaction: await Transaction.findById(transaction._id).populate('user', 'name email'),
        newBalance: balanceAfter,
        success: true
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Hold amount for bid (reserve balance)
   * @param {string} userId - User ID
   * @param {number} amount - Amount to hold
   * @param {string} productId - Product being bid on
   * @param {string} bidId - Bid ID
   * @param {string} description - Transaction description
   * @param {string} ipAddress - User IP address
   * @param {string} userAgent - User agent
   * @returns {Promise<object>} Transaction and updated balance
   */
  static async holdBidAmount(userId, amount, productId, bidId, description, ipAddress, userAgent) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get user with current balance
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new Error("User not found");
      }

      const balanceBefore = user.balance || 0;
      
      // Check if user has sufficient balance
      if (balanceBefore < amount) {
        throw new Error(`Insufficient balance. Available: ${balanceBefore} ETB, Required: ${amount} ETB`);
      }

      const balanceAfter = balanceBefore - amount;

      // Create hold transaction
      const transaction = new Transaction({
        user: userId,
        type: 'BID_HOLD',
        amount,
        balanceBefore,
        balanceAfter,
        status: 'COMPLETED',
        description,
        relatedProduct: productId,
        relatedBid: bidId,
        isHeld: true,
        heldUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Hold for 7 days
        ipAddress,
        userAgent,
      });

      await transaction.save({ session });

      // Update user balance
      user.balance = balanceAfter;
      await user.save({ session });

      await session.commitTransaction();

      return {
        transaction: await Transaction.findById(transaction._id).populate('user', 'name email'),
        newBalance: balanceAfter,
        success: true
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Release held amount (when outbid)
   * @param {string} holdTransactionId - Original hold transaction ID
   * @param {string} description - Release description
   * @returns {Promise<object>} Release transaction and updated balance
   */
  static async releaseBidHold(holdTransactionId, description) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get the original hold transaction
      const holdTransaction = await Transaction.findById(holdTransactionId).session(session);
      if (!holdTransaction || holdTransaction.type !== 'BID_HOLD' || !holdTransaction.isHeld) {
        throw new Error("Invalid hold transaction");
      }

      // Get user
      const user = await User.findById(holdTransaction.user).session(session);
      if (!user) {
        throw new Error("User not found");
      }

      const balanceBefore = user.balance || 0;
      const balanceAfter = balanceBefore + holdTransaction.amount;

      // Create release transaction
      const releaseTransaction = new Transaction({
        user: holdTransaction.user,
        type: 'BID_RELEASE',
        amount: holdTransaction.amount,
        balanceBefore,
        balanceAfter,
        status: 'COMPLETED',
        description,
        relatedProduct: holdTransaction.relatedProduct,
        relatedBid: holdTransaction.relatedBid,
        relatedHoldTransaction: holdTransactionId,
      });

      await releaseTransaction.save({ session });

      // Mark hold transaction as no longer held
      holdTransaction.isHeld = false;
      await holdTransaction.save({ session });

      // Update user balance
      user.balance = balanceAfter;
      await user.save({ session });

      await session.commitTransaction();

      return {
        transaction: await Transaction.findById(releaseTransaction._id).populate('user', 'name email'),
        newBalance: balanceAfter,
        success: true
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Convert held amount to permanent deduction (when winning auction)
   * @param {string} holdTransactionId - Original hold transaction ID
   * @param {string} description - Deduction description
   * @returns {Promise<object>} Deduction transaction
   */
  static async convertHoldToDeduction(holdTransactionId, description) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get the original hold transaction
      const holdTransaction = await Transaction.findById(holdTransactionId).session(session);
      if (!holdTransaction || holdTransaction.type !== 'BID_HOLD' || !holdTransaction.isHeld) {
        throw new Error("Invalid hold transaction");
      }

      // Create deduction transaction (balance already reduced, so no balance change)
      const deductionTransaction = new Transaction({
        user: holdTransaction.user,
        type: 'BID_DEDUCTION',
        amount: holdTransaction.amount,
        balanceBefore: holdTransaction.balanceAfter, // Balance after the hold
        balanceAfter: holdTransaction.balanceAfter,  // No change as already deducted
        status: 'COMPLETED',
        description,
        relatedProduct: holdTransaction.relatedProduct,
        relatedBid: holdTransaction.relatedBid,
        relatedHoldTransaction: holdTransactionId,
      });

      await deductionTransaction.save({ session });

      // Mark hold transaction as no longer held (now permanently deducted)
      holdTransaction.isHeld = false;
      await holdTransaction.save({ session });

      await session.commitTransaction();

      return {
        transaction: await Transaction.findById(deductionTransaction._id).populate('user', 'name email'),
        success: true
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get user's available balance (total balance minus held amounts)
   * @param {string} userId - User ID
   * @returns {Promise<object>} Balance information
   */
  static async getUserBalanceInfo(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Calculate held amounts
    const heldTransactions = await Transaction.find({
      user: userId,
      type: 'BID_HOLD',
      isHeld: true,
      status: 'COMPLETED'
    });

    const totalHeld = heldTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    const availableBalance = (user.balance || 0) - totalHeld;

    return {
      totalBalance: user.balance || 0,
      heldAmount: totalHeld,
      availableBalance: Math.max(0, availableBalance),
      heldTransactions: heldTransactions.length
    };
  }

  /**
   * Get user transaction history
   * @param {string} userId - User ID
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @param {string} type - Transaction type filter
   * @returns {Promise<object>} Transaction history
   */
  static async getUserTransactionHistory(userId, page = 1, limit = 20, type = null) {
    const query = { user: userId };
    if (type) {
      query.type = type;
    }

    const transactions = await Transaction.find(query)
      .populate('relatedProduct', 'title image')
      .populate('relatedBid', 'price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(query);

    return {
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    };
  }
}

module.exports = BalanceService;
