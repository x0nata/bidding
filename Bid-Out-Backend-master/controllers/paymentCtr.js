const asyncHandler = require("express-async-handler");
const BalanceService = require("../services/balanceService");
const User = require("../model/userModel");
const Transaction = require("../model/transactionModel");

/**
 * Add balance to user account (Demo Payment)
 * @route POST /api/payments/add-balance
 * @access Private
 */
const addBalance = asyncHandler(async (req, res) => {
  const { amount, paymentMethod = 'DEMO_CARD', cardDetails } = req.body;
  const userId = req.user.id;

  // Validation
  if (!amount || amount <= 0) {
    res.status(400);
    throw new Error("Please provide a valid amount");
  }

  if (amount > 50000) {
    res.status(400);
    throw new Error("Maximum deposit amount is 50,000 ETB per transaction");
  }

  if (amount < 10) {
    res.status(400);
    throw new Error("Minimum deposit amount is 10 ETB");
  }

  // Validate payment method
  const validPaymentMethods = ['DEMO_CARD', 'DEMO_BANK', 'DEMO_MOBILE'];
  if (!validPaymentMethods.includes(paymentMethod)) {
    res.status(400);
    throw new Error("Invalid payment method");
  }

  // Demo validation for card details (if card payment)
  if (paymentMethod === 'DEMO_CARD') {
    if (!cardDetails || !cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv) {
      res.status(400);
      throw new Error("Please provide valid card details");
    }

    // Demo card validation
    const cardNumber = cardDetails.cardNumber.replace(/\s/g, '');
    if (cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)) {
      res.status(400);
      throw new Error("Please provide a valid 16-digit card number");
    }

    // Demo CVV validation
    if (!/^\d{3,4}$/.test(cardDetails.cvv)) {
      res.status(400);
      throw new Error("Please provide a valid CVV");
    }

    // Demo expiry validation
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryRegex.test(cardDetails.expiryDate)) {
      res.status(400);
      throw new Error("Please provide a valid expiry date (MM/YY)");
    }
  }

  try {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Demo payment simulation - randomly fail 5% of transactions for realism
    const shouldFail = Math.random() < 0.05;
    if (shouldFail) {
      res.status(400);
      throw new Error("Payment failed. Please try again or use a different payment method.");
    }

    // Create description based on payment method
    let description = `Demo payment deposit of ${amount} ETB`;
    if (paymentMethod === 'DEMO_CARD') {
      description += ` via card ending in ${cardDetails.cardNumber.slice(-4)}`;
    } else if (paymentMethod === 'DEMO_BANK') {
      description += ` via bank transfer`;
    } else if (paymentMethod === 'DEMO_MOBILE') {
      description += ` via mobile payment`;
    }

    // Add balance using the service
    const result = await BalanceService.addBalance(
      userId,
      amount,
      paymentMethod,
      description,
      {
        paymentMethod,
        cardLastFour: paymentMethod === 'DEMO_CARD' ? cardDetails.cardNumber.slice(-4) : null,
        demoTransaction: true
      },
      req.ip,
      req.get('User-Agent')
    );

    // Notify via WebSocket if available
    if (global.socketService) {
      try {
        global.socketService.notifyBalanceUpdate(userId, {
          newBalance: result.newBalance,
          transaction: result.transaction,
          type: 'BALANCE_ADDED'
        });
      } catch (error) {
      }
    }

    res.status(201).json({
      success: true,
      message: "Balance added successfully",
      transaction: result.transaction,
      newBalance: result.newBalance,
      paymentReference: result.transaction.paymentReference
    });

  } catch (error) {
    res.status(400);
    throw new Error(error.message || "Payment processing failed");
  }
});

/**
 * Get user balance information
 * @route GET /api/payments/balance
 * @access Private
 */
const getBalanceInfo = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  try {
    const balanceInfo = await BalanceService.getUserBalanceInfo(userId);
    
    res.status(200).json({
      success: true,
      ...balanceInfo
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message || "Failed to fetch balance information");
  }
});

/**
 * Get user transaction history
 * @route GET /api/payments/transactions
 * @access Private
 */
const getTransactionHistory = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 20, type } = req.query;

  try {
    const history = await BalanceService.getUserTransactionHistory(
      userId,
      parseInt(page),
      parseInt(limit),
      type
    );
    
    res.status(200).json({
      success: true,
      ...history
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message || "Failed to fetch transaction history");
  }
});

/**
 * Get payment methods (Demo)
 * @route GET /api/payments/methods
 * @access Private
 */
const getPaymentMethods = asyncHandler(async (req, res) => {
  const paymentMethods = [
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
  ];

  res.status(200).json({
    success: true,
    paymentMethods
  });
});

/**
 * Validate payment details (Demo)
 * @route POST /api/payments/validate
 * @access Private
 */
const validatePaymentDetails = asyncHandler(async (req, res) => {
  const { paymentMethod, details } = req.body;

  if (!paymentMethod || !details) {
    res.status(400);
    throw new Error("Payment method and details are required");
  }

  let isValid = true;
  let errors = [];

  if (paymentMethod === 'DEMO_CARD') {
    const { cardNumber, expiryDate, cvv, cardholderName } = details;
    
    if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
      isValid = false;
      errors.push("Invalid card number");
    }
    
    if (!expiryDate || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
      isValid = false;
      errors.push("Invalid expiry date");
    }
    
    if (!cvv || !/^\d{3,4}$/.test(cvv)) {
      isValid = false;
      errors.push("Invalid CVV");
    }
    
    if (!cardholderName || cardholderName.trim().length < 2) {
      isValid = false;
      errors.push("Invalid cardholder name");
    }
  }

  res.status(200).json({
    success: true,
    isValid,
    errors
  });
});

module.exports = {
  addBalance,
  getBalanceInfo,
  getTransactionHistory,
  getPaymentMethods,
  validatePaymentDetails
};
