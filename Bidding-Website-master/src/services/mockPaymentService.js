/**
 * Mock Payment Service - Simple simulation without backend dependency
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
  return `DEMO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const mockPaymentService = {
  // Initialize with some demo balance for testing
  initializeDemoBalance: () => {
    const savedBalance = localStorage.getItem('mockUserBalance');
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
      localStorage.setItem('mockUserBalance', JSON.stringify(mockUserBalance));
    }
    
    const savedTransactions = localStorage.getItem('mockTransactions');
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
      localStorage.setItem('mockTransactions', JSON.stringify(mockTransactions));
    }
  },

  // Get payment methods
  getPaymentMethods: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      paymentMethods: [
        {
          id: 'DEMO_CARD',
          name: 'Credit/Debit Card',
          description: 'Pay with your credit or debit card',
          icon: 'credit-card',
          enabled: true,
          processingTime: 'Instant',
          fees: 'No fees for demo'
        },
        {
          id: 'DEMO_BANK',
          name: 'Bank Transfer',
          description: 'Direct bank transfer',
          icon: 'bank',
          enabled: true,
          processingTime: '1-2 minutes',
          fees: 'No fees for demo'
        },
        {
          id: 'DEMO_MOBILE',
          name: 'Mobile Payment',
          description: 'Pay with mobile money',
          icon: 'smartphone',
          enabled: true,
          processingTime: 'Instant',
          fees: 'No fees for demo'
        }
      ]
    };
  },

  // Get balance information
  getBalanceInfo: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Get latest balance from localStorage
    const savedBalance = localStorage.getItem('mockUserBalance');
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

  // Add balance
  addBalance: async (amount, paymentMethod, cardDetails = null) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Validate amount
    if (!amount || amount <= 0) {
      throw new Error('Please provide a valid amount');
    }
    
    if (amount < 10) {
      throw new Error('Minimum amount is 10 ETB');
    }
    
    if (amount > 50000) {
      throw new Error('Maximum amount is 50,000 ETB per transaction');
    }

    // Validate card details for card payments
    if (paymentMethod === 'DEMO_CARD' && cardDetails) {
      if (!cardDetails.cardNumber || cardDetails.cardNumber.replace(/\s/g, '').length !== 16) {
        throw new Error('Please provide a valid 16-digit card number');
      }
      
      if (!cardDetails.expiryDate || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardDetails.expiryDate)) {
        throw new Error('Please provide a valid expiry date (MM/YY)');
      }
      
      if (!cardDetails.cvv || !/^\d{3,4}$/.test(cardDetails.cvv)) {
        throw new Error('Please provide a valid CVV');
      }
      
      if (!cardDetails.cardholderName || cardDetails.cardholderName.trim().length < 2) {
        throw new Error('Please provide the cardholder name');
      }
    }

    // Simulate random payment failure (5% chance)
    if (Math.random() < 0.05) {
      throw new Error('Payment failed. Please try again or use a different payment method.');
    }

    // Update balance
    mockUserBalance.totalBalance += amount;
    mockUserBalance.availableBalance += amount;
    
    // Create transaction record
    const transaction = {
      id: generateTransactionId(),
      type: 'DEPOSIT',
      amount: amount,
      description: `Demo payment deposit of ${amount} ETB via ${paymentMethod}`,
      paymentMethod: paymentMethod,
      timestamp: new Date().toISOString(),
      status: 'COMPLETED',
      balanceBefore: mockUserBalance.totalBalance - amount,
      balanceAfter: mockUserBalance.totalBalance
    };
    
    mockTransactions.unshift(transaction);
    
    // Save to localStorage
    localStorage.setItem('mockUserBalance', JSON.stringify(mockUserBalance));
    localStorage.setItem('mockTransactions', JSON.stringify(mockTransactions));
    
    return {
      success: true,
      message: 'Balance added successfully',
      transaction: transaction,
      newBalance: mockUserBalance.totalBalance,
      paymentReference: transaction.id
    };
  },

  // Hold balance for bidding
  holdBalance: async (amount, productId, bidId) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
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
    localStorage.setItem('mockUserBalance', JSON.stringify(mockUserBalance));
    localStorage.setItem('mockTransactions', JSON.stringify(mockTransactions));
    
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
    localStorage.setItem('mockUserBalance', JSON.stringify(mockUserBalance));
    localStorage.setItem('mockTransactions', JSON.stringify(mockTransactions));
    
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
    localStorage.setItem('mockUserBalance', JSON.stringify(mockUserBalance));
    localStorage.setItem('mockTransactions', JSON.stringify(mockTransactions));
    
    return {
      success: true,
      transaction: deductionTransaction,
      newBalance: mockUserBalance.totalBalance
    };
  },

  // Get transaction history
  getTransactionHistory: async (page = 1, limit = 20) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const savedTransactions = localStorage.getItem('mockTransactions');
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
    
    localStorage.setItem('mockUserBalance', JSON.stringify(mockUserBalance));
    localStorage.setItem('mockTransactions', JSON.stringify(mockTransactions));
  }
};

// Initialize on import
mockPaymentService.initializeDemoBalance();

export default mockPaymentService;