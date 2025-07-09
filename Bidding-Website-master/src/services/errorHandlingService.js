import { showError, showWarning, showInfo } from '../redux/slices/notificationSlice';

/**
 * Frontend error handling service for bidding and payment operations
 */
class ErrorHandlingService {
  /**
   * Handle API errors with user-friendly messages and actions
   * @param {object} error - Error object from API
   * @param {function} dispatch - Redux dispatch function
   * @returns {object} Processed error with user actions
   */
  static handleApiError(error, dispatch) {
    const errorData = error.response?.data || {};
    const errorCode = errorData.code || 'UNKNOWN_ERROR';
    const errorMessage = errorData.message || error.message || 'An unexpected error occurred';


    const processedError = {
      code: errorCode,
      message: errorMessage,
      suggestions: errorData.suggestions || [],
      userActions: [],
      severity: 'error'
    };

    // Handle specific error types
    switch (errorCode) {
      case 'INSUFFICIENT_BALANCE':
        processedError.severity = 'warning';
        processedError.userActions = [
          {
            label: 'Add Balance',
            action: 'ADD_BALANCE',
            primary: true
          },
          {
            label: 'View Balance',
            action: 'VIEW_BALANCE',
            primary: false
          }
        ];
        dispatch(showWarning(errorMessage));
        break;

      case 'SELF_BID_FORBIDDEN':
        processedError.severity = 'info';
        processedError.userActions = [
          {
            label: 'View My Auctions',
            action: 'VIEW_MY_AUCTIONS',
            primary: true
          }
        ];
        dispatch(showInfo('You cannot bid on your own auctions'));
        break;

      case 'AUCTION_NOT_ACTIVE':
        processedError.severity = 'warning';
        processedError.userActions = [
          {
            label: 'Browse Active Auctions',
            action: 'BROWSE_AUCTIONS',
            primary: true
          },
          {
            label: 'Refresh Page',
            action: 'REFRESH',
            primary: false
          }
        ];
        dispatch(showWarning(errorMessage));
        break;

      case 'BID_TOO_LOW':
        processedError.severity = 'warning';
        processedError.userActions = [
          {
            label: 'Increase Bid',
            action: 'INCREASE_BID',
            primary: true
          },
          {
            label: 'View Current Bids',
            action: 'VIEW_BIDS',
            primary: false
          }
        ];
        dispatch(showWarning(errorMessage));
        break;

      case 'CONCURRENT_BID_CONFLICT':
      case 'RACE_CONDITION':
        processedError.severity = 'warning';
        processedError.userActions = [
          {
            label: 'Try Again',
            action: 'RETRY_BID',
            primary: true
          },
          {
            label: 'Refresh',
            action: 'REFRESH',
            primary: false
          }
        ];
        dispatch(showWarning('Another bid was placed at the same time. Please try again.'));
        break;

      case 'RATE_LIMIT_EXCEEDED':
        processedError.severity = 'warning';
        processedError.userActions = [
          {
            label: 'Wait and Retry',
            action: 'WAIT_RETRY',
            primary: true,
            delay: errorData.retryAfter
          }
        ];
        dispatch(showWarning(`Too many attempts. Please wait ${errorData.retryAfter || 60} seconds.`));
        break;

      case 'NETWORK_ERROR':
      case 'CONNECTION_FAILED':
        processedError.severity = 'error';
        processedError.userActions = [
          {
            label: 'Check Connection',
            action: 'CHECK_CONNECTION',
            primary: true
          },
          {
            label: 'Retry',
            action: 'RETRY',
            primary: false
          }
        ];
        dispatch(showError('Network connection issue. Please check your internet connection.'));
        break;

      case 'VALIDATION_ERROR':
      case 'INVALID_INPUT':
        processedError.severity = 'warning';
        processedError.userActions = [
          {
            label: 'Fix Input',
            action: 'FIX_INPUT',
            primary: true
          }
        ];
        dispatch(showWarning('Please check your input and try again.'));
        break;

      default:
        processedError.userActions = [
          {
            label: 'Try Again',
            action: 'RETRY',
            primary: true
          },
          {
            label: 'Contact Support',
            action: 'CONTACT_SUPPORT',
            primary: false
          }
        ];
        dispatch(showError(errorMessage));
    }

    return processedError;
  }

  /**
   * Handle bidding-specific errors with contextual actions
   * @param {object} error - Error from bidding API
   * @param {object} context - Bidding context (auction, bid amount, etc.)
   * @param {function} dispatch - Redux dispatch
   * @returns {object} Processed error with bidding-specific actions
   */
  static handleBiddingError(error, context, dispatch) {
    const processedError = this.handleApiError(error, dispatch);
    
    // Add bidding-specific context
    processedError.context = {
      auctionId: context.auctionId,
      bidAmount: context.bidAmount,
      currentBid: context.currentBid,
      minimumBid: context.minimumBid
    };

    // Add bidding-specific actions based on error type
    if (processedError.code === 'BID_TOO_LOW' && context.minimumBid) {
      processedError.suggestedBidAmount = context.minimumBid;
      processedError.userActions.unshift({
        label: `Bid ${context.minimumBid} ETB`,
        action: 'SET_MINIMUM_BID',
        primary: true,
        data: { amount: context.minimumBid }
      });
    }

    if (processedError.code === 'INSUFFICIENT_BALANCE' && context.shortfall) {
      processedError.userActions.unshift({
        label: `Add ${context.shortfall} ETB`,
        action: 'ADD_EXACT_AMOUNT',
        primary: true,
        data: { amount: context.shortfall }
      });
    }

    return processedError;
  }

  /**
   * Handle payment errors with payment-specific actions
   * @param {object} error - Error from payment API
   * @param {object} context - Payment context
   * @param {function} dispatch - Redux dispatch
   * @returns {object} Processed error with payment-specific actions
   */
  static handlePaymentError(error, context, dispatch) {
    const processedError = this.handleApiError(error, dispatch);
    
    // Add payment-specific actions
    if (error.response?.status === 400 && error.response?.data?.message?.includes('card')) {
      processedError.userActions = [
        {
          label: 'Try Different Card',
          action: 'CHANGE_PAYMENT_METHOD',
          primary: true
        },
        {
          label: 'Check Card Details',
          action: 'VERIFY_CARD',
          primary: false
        }
      ];
    }

    return processedError;
  }

  /**
   * Create user-friendly error messages for common scenarios
   * @param {string} errorType - Type of error
   * @param {object} data - Additional data for the error
   * @returns {object} User-friendly error object
   */
  static createUserFriendlyError(errorType, data = {}) {
    const errors = {
      NETWORK_OFFLINE: {
        title: 'No Internet Connection',
        message: 'Please check your internet connection and try again.',
        icon: 'wifi-off',
        actions: [
          { label: 'Retry', action: 'RETRY', primary: true },
          { label: 'Go Offline', action: 'GO_OFFLINE', primary: false }
        ]
      },
      SESSION_EXPIRED: {
        title: 'Session Expired',
        message: 'Your session has expired. Please log in again.',
        icon: 'clock',
        actions: [
          { label: 'Log In', action: 'LOGIN', primary: true },
          { label: 'Go Home', action: 'GO_HOME', primary: false }
        ]
      },
      AUCTION_ENDED: {
        title: 'Auction Has Ended',
        message: `The auction for "${data.auctionTitle}" has already ended.`,
        icon: 'gavel',
        actions: [
          { label: 'View Results', action: 'VIEW_RESULTS', primary: true },
          { label: 'Browse Auctions', action: 'BROWSE_AUCTIONS', primary: false }
        ]
      },
      OUTBID: {
        title: 'You\'ve Been Outbid',
        message: `Someone placed a higher bid on "${data.auctionTitle}". Your previous bid has been refunded.`,
        icon: 'trending-up',
        actions: [
          { label: 'Place Higher Bid', action: 'PLACE_HIGHER_BID', primary: true },
          { label: 'View Auction', action: 'VIEW_AUCTION', primary: false }
        ]
      },
      BALANCE_LOW: {
        title: 'Low Balance',
        message: `You have ${data.balance} ETB remaining. Consider adding more balance.`,
        icon: 'dollar-sign',
        actions: [
          { label: 'Add Balance', action: 'ADD_BALANCE', primary: true },
          { label: 'View Transactions', action: 'VIEW_TRANSACTIONS', primary: false }
        ]
      }
    };

    return errors[errorType] || {
      title: 'Something Went Wrong',
      message: 'An unexpected error occurred. Please try again.',
      icon: 'alert-circle',
      actions: [
        { label: 'Try Again', action: 'RETRY', primary: true },
        { label: 'Contact Support', action: 'CONTACT_SUPPORT', primary: false }
      ]
    };
  }

  /**
   * Handle retry logic with exponential backoff
   * @param {function} operation - Operation to retry
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} baseDelay - Base delay in milliseconds
   * @returns {Promise} Promise that resolves when operation succeeds or max retries reached
   */
  static async retryOperation(operation, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  /**
   * Check if error is retryable
   * @param {object} error - Error object
   * @returns {boolean} Whether the error is retryable
   */
  static isRetryableError(error) {
    const retryableCodes = [
      'NETWORK_ERROR',
      'CONNECTION_FAILED',
      'TIMEOUT',
      'CONCURRENT_BID_CONFLICT',
      'RACE_CONDITION'
    ];
    
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    
    return (
      retryableCodes.includes(error.response?.data?.code) ||
      retryableStatuses.includes(error.response?.status) ||
      error.code === 'NETWORK_ERROR' ||
      error.code === 'ECONNRESET' ||
      error.code === 'ETIMEDOUT'
    );
  }
}

export default ErrorHandlingService;
