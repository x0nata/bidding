// This service now uses the Bank Payment System
// Redirects to bankPaymentService for consistency
import { bankPaymentService } from './bankPaymentService';

// Legacy payment API service that now uses bank payment system
export const paymentApiService = {
  // Get available payment methods (only bank transfer now)
  getPaymentMethods: async () => {
    return await bankPaymentService.getPaymentMethods();
  },

  // Validate payment details (bank details)
  validatePaymentDetails: async (paymentMethod, details) => {
    // Simple validation for bank details
    if (paymentMethod === 'BANK_TRANSFER') {
      if (!details.accountNumber || details.accountNumber.length < 8) {
        throw new Error('Please provide a valid account number (minimum 8 digits)');
      }
      if (!details.accountHolder || details.accountHolder.trim().length < 2) {
        throw new Error('Please provide the account holder name');
      }
      return { success: true, valid: true };
    }
    throw new Error('Only bank transfer is supported');
  },

  // Add balance (now uses bank transfer only)
  addBalance: async (amount, paymentMethod, cardDetails = null) => {
    // Convert old card details to bank details if needed
    let bankDetails = null;
    if (cardDetails && cardDetails.cardholderName) {
      bankDetails = {
        accountNumber: '12345678901', // Default demo account
        accountHolder: cardDetails.cardholderName
      };
    }
    
    return await bankPaymentService.addBalance(amount, bankDetails);
  },

  // Get balance information
  getBalanceInfo: async () => {
    return await bankPaymentService.getBalanceInfo();
  },

  // Get transaction history
  getTransactionHistory: async (page = 1, limit = 50, type = null) => {
    const offset = (page - 1) * limit;
    const result = await bankPaymentService.getTransactions(limit, offset);
    
    // Filter by type if specified
    let transactions = result.transactions;
    if (type) {
      const typeMap = {
        'DEPOSIT': 'DEPOSIT',
        'BID_HOLD': 'HOLD',
        'BID_RELEASE': 'RELEASE',
        'BID_DEDUCTION': 'PAYMENT',
        'PAYMENT': 'PAYMENT'
      };
      const bankType = typeMap[type];
      if (bankType) {
        transactions = transactions.filter(t => t.type === bankType);
      }
    }
    
    return {
      success: true,
      transactions: transactions,
      total: result.total,
      hasMore: result.hasMore,
      page: page,
      limit: limit
    };
  }
};

// Legacy demo payment utilities
export const demoPaymentUtils = {
  // Format amount for display
  formatAmount: (amount) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2
    }).format(amount || 0);
  },

  // Format card number (not used anymore, but kept for compatibility)
  formatCardNumber: (value) => {
    return value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  },

  // Format expiry date (not used anymore, but kept for compatibility)
  formatExpiryDate: (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/(\d{1,2})(\d{0,2})/);
    if (matches) {
      return matches[2] ? `${matches[1]}/${matches[2]}` : matches[1];
    }
    return v;
  },

  // Validate card number (not used anymore, but kept for compatibility)
  validateCardNumber: (number) => {
    return true; // Always return true for compatibility
  },

  // Get card type (not used anymore, but kept for compatibility)
  getCardType: (number) => {
    return 'Bank Transfer';
  },

  // Get demo card numbers (now returns bank details)
  getDemoCardNumbers: () => [
    { number: '12345678901', type: 'Bank Transfer', name: 'Demo Bank Account' }
  ]
};

export default paymentApiService;