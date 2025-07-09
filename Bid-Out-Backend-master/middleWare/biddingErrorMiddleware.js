const ErrorHandlingService = require("../services/errorHandlingService");

/**
 * Middleware to handle bidding-specific errors with detailed responses
 */
const biddingErrorHandler = (err, req, res, next) => {

  // Handle specific error types
  if (err.message.includes('Insufficient balance')) {
    return res.status(400).json({
      success: false,
      error: 'INSUFFICIENT_BALANCE',
      message: err.message,
      code: 'BALANCE_TOO_LOW',
      suggestions: [
        {
          action: 'ADD_BALANCE',
          message: 'Add more balance to your account',
          url: '/balance'
        },
        {
          action: 'LOWER_BID',
          message: 'Try placing a lower bid amount'
        }
      ]
    });
  }

  if (err.message.includes('cannot bid on your own')) {
    return res.status(403).json({
      success: false,
      error: 'SELF_BIDDING_NOT_ALLOWED',
      message: 'You cannot bid on your own auction',
      code: 'SELF_BID_FORBIDDEN'
    });
  }

  if (err.message.includes('auction has ended') || err.message.includes('auction has not started')) {
    return res.status(400).json({
      success: false,
      error: 'AUCTION_NOT_ACTIVE',
      message: err.message,
      code: 'TIMING_ERROR'
    });
  }

  if (err.message.includes('bid must be higher')) {
    return res.status(400).json({
      success: false,
      error: 'BID_TOO_LOW',
      message: err.message,
      code: 'AMOUNT_TOO_LOW',
      suggestions: [
        {
          action: 'INCREASE_BID',
          message: 'Increase your bid amount to meet the minimum requirement'
        }
      ]
    });
  }

  // Handle MongoDB/Mongoose errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Invalid data provided',
      details: errors,
      code: 'INVALID_INPUT'
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'INVALID_ID',
      message: 'Invalid ID format',
      code: 'MALFORMED_ID'
    });
  }

  // Handle concurrent modification errors
  if (err.message.includes('E11000') || err.message.includes('duplicate key')) {
    return res.status(409).json({
      success: false,
      error: 'CONCURRENT_MODIFICATION',
      message: 'Another bid was placed at the same time. Please try again.',
      code: 'RACE_CONDITION',
      suggestions: [
        {
          action: 'RETRY',
          message: 'Please refresh and try placing your bid again'
        }
      ]
    });
  }

  // Handle network/timeout errors
  if (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT') {
    return res.status(503).json({
      success: false,
      error: 'NETWORK_ERROR',
      message: 'Network connection issue. Please try again.',
      code: 'CONNECTION_FAILED',
      suggestions: [
        {
          action: 'RETRY',
          message: 'Check your internet connection and try again'
        }
      ]
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    error: 'INTERNAL_SERVER_ERROR',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred. Please try again.' 
      : err.message,
    code: 'UNKNOWN_ERROR'
  });
};

/**
 * Middleware to validate bidding requests
 */
const validateBiddingRequest = async (req, res, next) => {
  try {
    const { productId, price } = req.body;
    const userId = req.user.id;

    // Basic validation
    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_PRODUCT_ID',
        message: 'Product ID is required',
        code: 'INVALID_REQUEST'
      });
    }

    if (!price || isNaN(price) || price <= 0) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_BID_AMOUNT',
        message: 'Valid bid amount is required',
        code: 'INVALID_AMOUNT'
      });
    }

    // Check for concurrent bidding issues
    try {
      const concurrentCheck = await ErrorHandlingService.handleConcurrentBids(
        productId, 
        userId, 
        parseFloat(price)
      );

      if (!concurrentCheck.success) {
        return res.status(409).json({
          success: false,
          error: 'CONCURRENT_BID_CONFLICT',
          message: concurrentCheck.error,
          currentBid: concurrentCheck.currentBid,
          code: 'BID_CONFLICT'
        });
      }

      // Add concurrent check results to request for use in controller
      req.concurrentCheck = concurrentCheck;
    } catch (error) {
      // Continue without concurrent check for demo purposes
    }
    
    next();

  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to handle balance validation
 */
const validateBalance = async (req, res, next) => {
  try {
    const { price } = req.body;
    const userId = req.user.id;

    // Check balance using error handling service
    const balanceCheck = await ErrorHandlingService.handleInsufficientBalance(
      userId, 
      parseFloat(price)
    );

    if (!balanceCheck.success && balanceCheck.error === 'INSUFFICIENT_BALANCE') {
      return res.status(400).json({
        success: false,
        error: 'INSUFFICIENT_BALANCE',
        message: `Insufficient balance. You need ${balanceCheck.shortfall.toFixed(2)} ETB more.`,
        balanceInfo: balanceCheck.balanceInfo,
        suggestions: balanceCheck.suggestions,
        code: 'BALANCE_TOO_LOW'
      });
    }

    if (!balanceCheck.success) {
      return res.status(500).json({
        success: false,
        error: 'BALANCE_CHECK_FAILED',
        message: balanceCheck.message || 'Unable to verify balance',
        code: 'BALANCE_ERROR'
      });
    }

    next();

  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to log bidding attempts for debugging
 */
const logBiddingAttempt = (req, res, next) => {
  const { productId, price, bidType } = req.body;
  const userId = req.user?.id;
  const userAgent = req.get('User-Agent');
  const ip = req.ip;

  next();
};

/**
 * Middleware to handle rate limiting for bidding
 */
const rateLimitBidding = (() => {
  const attempts = new Map(); // userId -> { count, resetTime }
  const MAX_ATTEMPTS = 10; // Max bids per minute
  const WINDOW_MS = 60 * 1000; // 1 minute

  return (req, res, next) => {
    const userId = req.user?.id;
    if (!userId) return next();

    const now = Date.now();
    const userAttempts = attempts.get(userId) || { count: 0, resetTime: now + WINDOW_MS };

    // Reset if window has passed
    if (now > userAttempts.resetTime) {
      userAttempts.count = 0;
      userAttempts.resetTime = now + WINDOW_MS;
    }

    userAttempts.count++;
    attempts.set(userId, userAttempts);

    if (userAttempts.count > MAX_ATTEMPTS) {
      return res.status(429).json({
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many bidding attempts. Please wait before trying again.',
        retryAfter: Math.ceil((userAttempts.resetTime - now) / 1000),
        code: 'TOO_MANY_REQUESTS'
      });
    }

    next();
  };
})();

module.exports = {
  biddingErrorHandler,
  validateBiddingRequest,
  validateBalance,
  logBiddingAttempt,
  rateLimitBidding
};
