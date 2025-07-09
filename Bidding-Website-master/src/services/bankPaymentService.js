/**
 * Bank Payment Service - Simple bank transfer only payment system
 * This replaces all other payment services with a clean, working implementation
 */

// Storage keys
const BALANCE_STORAGE_KEY = 'bankPaymentBalance';
const TRANSACTIONS_STORAGE_KEY = 'bankPaymentTransactions';

// Mock user balance storage
let userBalance = {
  totalBalance: 0,
  heldAmount: 0,
  availableBalance: 0,
  heldTransactions: 0
};

// Mock transactions storage
let transactions = [];

// Generate unique transaction ID
const generateTransactionId = () => {
  return `BANK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Save data to localStorage
const saveToStorage = () => {
  localStorage.setItem(BALANCE_STORAGE_KEY, JSON.stringify(userBalance));
  localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
};

// Load data from localStorage
const loadFromStorage = () => {
  try {
    const savedBalance = localStorage.getItem(BALANCE_STORAGE_KEY);
    const savedTransactions = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    
    if (savedBalance) {
      const parsedBalance = JSON.parse(savedBalance);
      // Validate the structure
      if (parsedBalance && typeof parsedBalance.totalBalance === 'number') {
        userBalance = {
          totalBalance: parsedBalance.totalBalance || 0,
          heldAmount: parsedBalance.heldAmount || 0,
          availableBalance: parsedBalance.availableBalance || 0,
          heldTransactions: parsedBalance.heldTransactions || 0
        };
      }
    }
    
    if (savedTransactions) {
      const parsedTransactions = JSON.parse(savedTransactions);
      if (Array.isArray(parsedTransactions)) {
        transactions = parsedTransactions;
      }
    }
    
  } catch (error) {
    // Reset to defaults and let initialize() handle demo data creation
    userBalance = {
      totalBalance: 0,
      heldAmount: 0,
      availableBalance: 0,
      heldTransactions: 0
    };
    transactions = [];
  }
};

// Initialize with default demo data
const initializeDefaultData = () => {
  userBalance = {
    totalBalance: 1000,
    heldAmount: 0,
    availableBalance: 1000,
    heldTransactions: 0
  };
  
  transactions = [
    {
      id: generateTransactionId(),
      type: 'DEPOSIT',
      amount: 1000,
      description: 'Demo starting balance',
      timestamp: new Date().toISOString(),
      status: 'COMPLETED',
      balanceBefore: 0,
      balanceAfter: 1000,
      bankDetails: {
        accountNumber: '****1234',
        accountHolder: 'Demo Account'
      }
    }
  ];
  
  saveToStorage();
};

// Bank Payment Service
export const bankPaymentService = {
  // Initialize the service
  initialize: () => {
    loadFromStorage();
    
    // If no meaningful data exists, create demo data
    if (userBalance.totalBalance === 0 || transactions.length === 0) {
      initializeDefaultData();
    }
    
  },

  // Get current balance information
  getBalanceInfo: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    loadFromStorage(); // Ensure we have latest data
    
    // Double-check that we have valid data
    if (userBalance.totalBalance === 0 && transactions.length === 0) {
      initializeDefaultData();
    }
    
    return {
      success: true,
      totalBalance: userBalance.totalBalance,
      heldAmount: userBalance.heldAmount,
      availableBalance: userBalance.availableBalance,
      heldTransactions: userBalance.heldTransactions
    };
  },

  // Add balance via bank transfer
  addBalance: async (amount, bankDetails = null) => {
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Validate amount
    if (!amount || amount <= 0) {
      throw new Error('Please enter a valid amount');
    }
    
    if (amount < 10) {
      throw new Error('Minimum amount is 10 ETB');
    }
    
    if (amount > 100000) {
      throw new Error('Maximum amount is 100,000 ETB');
    }
    
    // Validate bank details
    if (bankDetails) {
      if (!bankDetails.accountNumber || bankDetails.accountNumber.length < 8) {
        throw new Error('Please provide a valid account number (minimum 8 digits)');
      }
      
      if (!bankDetails.accountHolder || bankDetails.accountHolder.trim().length < 2) {
        throw new Error('Please provide the account holder name');
      }
    }
    
    // Simulate random payment failure (2% chance)
    if (Math.random() < 0.02) {
      throw new Error('Bank transfer failed. Please check your account details and try again.');
    }
    
    // Update balance
    const balanceBefore = userBalance.totalBalance;
    userBalance.totalBalance += amount;
    userBalance.availableBalance += amount;
    
    // Create transaction record
    const transaction = {
      id: generateTransactionId(),
      type: 'DEPOSIT',
      amount: amount,
      description: `Bank transfer deposit of ${amount} ETB`,
      timestamp: new Date().toISOString(),
      status: 'COMPLETED',
      balanceBefore: balanceBefore,
      balanceAfter: userBalance.totalBalance,
      bankDetails: bankDetails ? {
        accountNumber: `****${bankDetails.accountNumber.slice(-4)}`,
        accountHolder: bankDetails.accountHolder
      } : null
    };
    
    transactions.unshift(transaction); // Add to beginning of array
    
    // Save to storage
    saveToStorage();
    
    // Dispatch balance update event
    window.dispatchEvent(new CustomEvent('bankBalanceUpdate', {
      detail: { 
        type: 'BALANCE_ADDED', 
        amount, 
        newBalance: userBalance.totalBalance,
        transaction 
      }
    }));
    
    return {
      success: true,
      message: 'Bank transfer completed successfully',
      transaction: transaction,
      newBalance: userBalance.totalBalance,
      paymentReference: transaction.id
    };
  },

  // Hold balance for bidding
  holdBalance: async (amount, productId, bidId) => {
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    loadFromStorage(); // Ensure we have latest data
    
    if (userBalance.availableBalance < amount) {
      throw new Error(`Insufficient balance. Available: ${userBalance.availableBalance} ETB, Required: ${amount} ETB`);
    }
    
    // Update balance
    userBalance.availableBalance -= amount;
    userBalance.heldAmount += amount;
    userBalance.heldTransactions += 1;
    
    // Create transaction record
    const transaction = {
      id: generateTransactionId(),
      type: 'HOLD',
      amount: amount,
      description: `Balance held for bid on product ${productId}`,
      timestamp: new Date().toISOString(),
      status: 'HELD',
      productId: productId,
      bidId: bidId,
      balanceBefore: userBalance.totalBalance,
      balanceAfter: userBalance.totalBalance
    };
    
    transactions.unshift(transaction);
    
    // Save to storage
    saveToStorage();
    
    // Dispatch balance update event
    window.dispatchEvent(new CustomEvent('bankBalanceUpdate', {
      detail: { 
        type: 'BALANCE_HELD', 
        amount, 
        productId,
        newBalance: userBalance.totalBalance 
      }
    }));
    
    return {
      success: true,
      message: 'Balance held for bid',
      transaction: transaction,
      newBalance: userBalance.totalBalance
    };
  },

  // Release held balance (when outbid)
  releaseHold: async (holdTransactionId) => {
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    loadFromStorage(); // Ensure we have latest data
    
    // Find the hold transaction
    const holdTransaction = transactions.find(t => t.id === holdTransactionId && t.type === 'HOLD');
    
    if (!holdTransaction) {
      throw new Error('Hold transaction not found');
    }
    
    // Update balance
    userBalance.availableBalance += holdTransaction.amount;
    userBalance.heldAmount -= holdTransaction.amount;
    userBalance.heldTransactions -= 1;
    
    // Create release transaction
    const releaseTransaction = {
      id: generateTransactionId(),
      type: 'RELEASE',
      amount: holdTransaction.amount,
      description: `Balance released from bid hold`,
      timestamp: new Date().toISOString(),
      status: 'COMPLETED',
      relatedTransactionId: holdTransactionId,
      balanceBefore: userBalance.totalBalance,
      balanceAfter: userBalance.totalBalance
    };
    
    transactions.unshift(releaseTransaction);
    
    // Save to storage
    saveToStorage();
    
    // Dispatch balance update event
    window.dispatchEvent(new CustomEvent('bankBalanceUpdate', {
      detail: { 
        type: 'BALANCE_RELEASED', 
        amount: holdTransaction.amount,
        newBalance: userBalance.totalBalance 
      }
    }));
    
    return {
      success: true,
      message: 'Balance released successfully',
      transaction: releaseTransaction,
      newBalance: userBalance.totalBalance
    };
  },

  // Complete payment (when auction is won)
  completePayment: async (holdTransactionId) => {
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    loadFromStorage(); // Ensure we have latest data
    
    // Find the hold transaction
    const holdTransaction = transactions.find(t => t.id === holdTransactionId && t.type === 'HOLD');
    
    if (!holdTransaction) {
      throw new Error('Hold transaction not found');
    }
    
    // Update balance (amount already deducted from available, now deduct from total)
    userBalance.totalBalance -= holdTransaction.amount;
    userBalance.heldAmount -= holdTransaction.amount;
    userBalance.heldTransactions -= 1;
    
    // Create payment transaction
    const paymentTransaction = {
      id: generateTransactionId(),
      type: 'PAYMENT',
      amount: holdTransaction.amount,
      description: `Payment for won auction`,
      timestamp: new Date().toISOString(),
      status: 'COMPLETED',
      relatedTransactionId: holdTransactionId,
      productId: holdTransaction.productId,
      balanceBefore: userBalance.totalBalance + holdTransaction.amount,
      balanceAfter: userBalance.totalBalance
    };
    
    transactions.unshift(paymentTransaction);
    
    // Save to storage
    saveToStorage();
    
    // Dispatch balance update event
    window.dispatchEvent(new CustomEvent('bankBalanceUpdate', {
      detail: { 
        type: 'PAYMENT_COMPLETED', 
        amount: holdTransaction.amount,
        newBalance: userBalance.totalBalance 
      }
    }));
    
    return {
      success: true,
      message: 'Payment completed successfully',
      transaction: paymentTransaction,
      newBalance: userBalance.totalBalance
    };
  },

  // Get transaction history
  getTransactions: async (limit = 50, offset = 0) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    loadFromStorage(); // Ensure we have latest data
    
    const paginatedTransactions = transactions.slice(offset, offset + limit);
    
    return {
      success: true,
      transactions: paginatedTransactions,
      total: transactions.length,
      hasMore: offset + limit < transactions.length
    };
  },

  // Reset demo data (for testing)
  resetDemoData: () => {
    initializeDefaultData();
    
    // Dispatch balance update event
    window.dispatchEvent(new CustomEvent('bankBalanceUpdate', {
      detail: { 
        type: 'DATA_RESET', 
        newBalance: userBalance.totalBalance 
      }
    }));
    
    return {
      success: true,
      message: 'Demo data reset successfully',
      newBalance: userBalance.totalBalance
    };
  },

  // Get payment methods (only bank transfer)
  getPaymentMethods: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      success: true,
      paymentMethods: [
        {
          id: 'BANK_TRANSFER',
          name: 'Bank Transfer',
          description: 'Direct bank transfer using account number',
          icon: 'bank',
          enabled: true,
          processingTime: 'Instant (Demo)'
        }
      ]
    };
  },

  // Force re-initialization (useful for debugging)
  forceInitialize: () => {
    initializeDefaultData();
    return {
      success: true,
      message: 'Bank payment service force initialized',
      newBalance: userBalance.totalBalance
    };
  },

  // Check if service is properly initialized
  isInitialized: () => {
    return userBalance.totalBalance > 0 || transactions.length > 0;
  },

  // Clear all data and reinitialize (for debugging)
  clearAndReinitialize: () => {
    
    // Clear localStorage
    localStorage.removeItem(BALANCE_STORAGE_KEY);
    localStorage.removeItem(TRANSACTIONS_STORAGE_KEY);
    
    // Reset in-memory data
    userBalance = {
      totalBalance: 0,
      heldAmount: 0,
      availableBalance: 0,
      heldTransactions: 0
    };
    transactions = [];
    
    // Initialize with fresh demo data
    initializeDefaultData();
    
    // Dispatch update event
    window.dispatchEvent(new CustomEvent('bankBalanceUpdate', {
      detail: { 
        type: 'DATA_CLEARED_AND_REINITIALIZED', 
        newBalance: userBalance.totalBalance 
      }
    }));
    
    return {
      success: true,
      message: 'All data cleared and reinitialized',
      newBalance: userBalance.totalBalance
    };
  }
};

// Initialize on import
bankPaymentService.initialize();

export default bankPaymentService;