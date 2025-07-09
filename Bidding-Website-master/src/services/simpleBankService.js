/**
 * Simple Bank Payment Service - Bank transfer only simulation
 */

// Mock user balance storage (in real app, this would be in backend)
let mockUserBalance = {
  totalBalance: 0,
  heldAmount: 0,
  availableBalance: 0,
  heldTransactions: 0
};

// Mock transaction history
let mockTransactions = [];

// Generate mock transaction ID
const generateTransactionId = () => {
  return `BANK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const simpleBankService = {
  // Initialize with some demo balance for testing
  initializeDemoBalance: () => {
    const savedBalance = localStorage.getItem('simpleBankBalance');
    if (savedBalance) {
      mockUserBalance = JSON.parse(savedBalance);
    } else {
      // Give user 1000 ETB to start with for demo
      mockUserBalance = {
        totalBalance: 1000,
        heldAmount: 0,
        availableBalance: 1000,
        heldTransactions: 0
      };
      localStorage.setItem('simpleBankBalance', JSON.stringify(mockUserBalance));
    }
    
    const savedTransactions = localStorage.getItem('simpleBankTransactions');
    if (savedTransactions) {
      mockTransactions = JSON.parse(savedTransactions);
    } else {
      // Add initial demo transaction
      mockTransactions = [{
        id: generateTransactionId(),
        type: 'DEPOSIT',
        amount: 1000,
        description: 'Demo starting balance',
        timestamp: new Date().toISOString(),
        status: 'COMPLETED'
      }];
      localStorage.setItem('simpleBankTransactions', JSON.stringify(mockTransactions));
    }
  },

  // Get payment methods (only bank transfer)
  getPaymentMethods: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      paymentMethods: [
        {
          id: 'BANK_TRANSFER',
          name: 'Bank Transfer',
          description: 'Direct bank transfer using account number',
          icon: 'bank',
          enabled: true,
          processingTime: 'Instant (Demo)',
          fees: 'No fees for demo'
        }
      ]
    };
  },

  // Get balance information
  getBalanceInfo: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Get latest balance from localStorage
    const savedBalance = localStorage.getItem('simpleBankBalance');
    if (savedBalance) {
      mockUserBalance = JSON.parse(savedBalance);
    }
    
    return {
      success: true,
      totalBalance: mockUserBalance.totalBalance,
      heldAmount: mockUserBalance.heldAmount,
      availableBalance: mockUserBalance.availableBalance,
      heldTransactions: mockUserBalance.heldTransactions
    };
  },

  // Add balance via bank transfer
  addBalance: async (amount, bankDetails = null) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Validate amount
    if (!amount || amount <= 0) {
      throw new Error('Please provide a valid amount');
    }
    
    if (amount < 10) {
      throw new Error('Minimum amount is 10 ETB');
    }
    
    if (amount > 100000) {
      throw new Error('Maximum amount is 100,000 ETB per transaction');
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
    mockUserBalance.totalBalance += amount;
    mockUserBalance.availableBalance += amount;
    
    // Create transaction record
    const transaction = {
      id: generateTransactionId(),
      type: 'DEPOSIT',
      amount: amount,
      description: `Bank transfer deposit of ${amount} ETB`,
      paymentMethod: 'BANK_TRANSFER',
      timestamp: new Date().toISOString(),
      status: 'COMPLETED',
      balanceBefore: mockUserBalance.totalBalance - amount,
      balanceAfter: mockUserBalance.totalBalance,
      bankDetails: bankDetails ? {
        accountNumber: bankDetails.accountNumber.slice(-4), // Only store last 4 digits
        accountHolder: bankDetails.accountHolder
      } : null
    };
    
    mockTransactions.unshift(transaction);
    
    // Save to localStorage
    localStorage.setItem('simpleBankBalance', JSON.stringify(mockUserBalance));
    localStorage.setItem('simpleBankTransactions', JSON.stringify(mockTransactions));
    
    return {
      success: true,
      message: 'Bank transfer completed successfully',
      transaction: transaction,
      newBalance: mockUserBalance.totalBalance,
      paymentReference: transaction.id
    };
  },

  // Hold balance for bidding
  holdBalance: async (amount, productId, bidId) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (mockUserBalance.availableBalance < amount) {
      throw new Error(`Insufficient balance. Available: ${mockUserBalance.availableBalance} ETB, Required: ${amount} ETB`);
    }
    
    // Update balance
    mockUserBalance.availableBalance -= amount;
    mockUserBalance.heldAmount += amount;
    mockUserBalance.heldTransactions += 1;
    
    // Create transaction record
    const transaction = {
      id: generateTransactionId(),
      type: 'BID_HOLD',
      amount: amount,
      description: `Bid hold for auction ${productId}`,
      timestamp: new Date().toISOString(),
      status: 'COMPLETED',
      productId: productId,
      bidId: bidId,
      isHeld: true
    };
    
    mockTransactions.unshift(transaction);
    
    // Save to localStorage
    localStorage.setItem('simpleBankBalance', JSON.stringify(mockUserBalance));
    localStorage.setItem('simpleBankTransactions', JSON.stringify(mockTransactions));
    
    return {
      success: true,
      transaction: transaction,
      newBalance: mockUserBalance.totalBalance
    };
  },

  // Release held balance (when outbid)
  releaseHold: async (holdTransactionId) => {
    // Find the hold transaction
    const holdTransaction = mockTransactions.find(t => t.id === holdTransactionId && t.isHeld);
    
    if (!holdTransaction) {
      throw new Error('Hold transaction not found');
    }
    
    // Update balance
    mockUserBalance.availableBalance += holdTransaction.amount;
    mockUserBalance.heldAmount -= holdTransaction.amount;
    mockUserBalance.heldTransactions -= 1;
    
    // Mark hold as released
    holdTransaction.isHeld = false;
    
    // Create release transaction
    const releaseTransaction = {
      id: generateTransactionId(),
      type: 'BID_RELEASE',
      amount: holdTransaction.amount,
      description: `Released bid hold - outbid`,
      timestamp: new Date().toISOString(),
      status: 'COMPLETED',
      relatedHoldId: holdTransactionId
    };
    
    mockTransactions.unshift(releaseTransaction);
    
    // Save to localStorage
    localStorage.setItem('simpleBankBalance', JSON.stringify(mockUserBalance));
    localStorage.setItem('simpleBankTransactions', JSON.stringify(mockTransactions));
    
    return {
      success: true,
      transaction: releaseTransaction,
      newBalance: mockUserBalance.totalBalance
    };
  },

  // Convert hold to deduction (when winning bid)
  convertHoldToDeduction: async (holdTransactionId) => {
    // Find the hold transaction
    const holdTransaction = mockTransactions.find(t => t.id === holdTransactionId && t.isHeld);
    
    if (!holdTransaction) {
      throw new Error('Hold transaction not found');
    }
    
    // Update balance (amount already deducted from available, now deduct from total)
    mockUserBalance.totalBalance -= holdTransaction.amount;
    mockUserBalance.heldAmount -= holdTransaction.amount;
    mockUserBalance.heldTransactions -= 1;
    
    // Mark hold as converted
    holdTransaction.isHeld = false;
    
    // Create deduction transaction
    const deductionTransaction = {
      id: generateTransactionId(),
      type: 'BID_DEDUCTION',
      amount: holdTransaction.amount,
      description: `Payment for won auction`,
      timestamp: new Date().toISOString(),
      status: 'COMPLETED',
      relatedHoldId: holdTransactionId
    };
    
    mockTransactions.unshift(deductionTransaction);
    
    // Save to localStorage
    localStorage.setItem('simpleBankBalance', JSON.stringify(mockUserBalance));
    localStorage.setItem('simpleBankTransactions', JSON.stringify(mockTransactions));
    
    return {
      success: true,
      transaction: deductionTransaction,
      newBalance: mockUserBalance.totalBalance
    };
  },

  // Get transaction history
  getTransactionHistory: async (page = 1, limit = 20) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const savedTransactions = localStorage.getItem('simpleBankTransactions');
    if (savedTransactions) {
      mockTransactions = JSON.parse(savedTransactions);
    }
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTransactions = mockTransactions.slice(startIndex, endIndex);
    
    return {
      success: true,
      transactions: paginatedTransactions,
      totalPages: Math.ceil(mockTransactions.length / limit),
      currentPage: page,
      total: mockTransactions.length
    };
  },

  // Reset demo data
  resetDemoData: () => {
    mockUserBalance = {
      totalBalance: 1000,
      heldAmount: 0,
      availableBalance: 1000,
      heldTransactions: 0
    };
    
    mockTransactions = [{
      id: generateTransactionId(),
      type: 'DEPOSIT',
      amount: 1000,
      description: 'Demo starting balance',
      timestamp: new Date().toISOString(),
      status: 'COMPLETED'
    }];
    
    localStorage.setItem('simpleBankBalance', JSON.stringify(mockUserBalance));
    localStorage.setItem('simpleBankTransactions', JSON.stringify(mockTransactions));
  }
};

// Initialize on import
simpleBankService.initializeDemoBalance();

export default simpleBankService;