import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { bankPaymentService } from '../services/bankPaymentService';

/**
 * Bank Balance Hook - Simple bank transfer only balance management
 */
export const useBankBalance = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [balanceInfo, setBalanceInfo] = useState({
    totalBalance: 0,
    heldAmount: 0,
    availableBalance: 0,
    heldTransactions: 0
  });
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Fetch balance information
  const fetchBalanceInfo = useCallback(async () => {
    try {
      setLoading(true);
      const response = await bankPaymentService.getBalanceInfo();
      
      const balanceData = {
        totalBalance: response.totalBalance || 0,
        heldAmount: response.heldAmount || 0,
        availableBalance: response.availableBalance || 0,
        heldTransactions: response.heldTransactions || 0
      };
      
      setBalanceInfo(balanceData);
      setLastUpdate(new Date());
    } catch (error) {
      // Set default values on error
      setBalanceInfo({
        totalBalance: 0,
        heldAmount: 0,
        availableBalance: 0,
        heldTransactions: 0
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Listen for balance update events
  useEffect(() => {
    const handleBalanceUpdate = (event) => {
      fetchBalanceInfo();
    };

    window.addEventListener('bankBalanceUpdate', handleBalanceUpdate);
    
    return () => {
      window.removeEventListener('bankBalanceUpdate', handleBalanceUpdate);
    };
  }, [fetchBalanceInfo]);

  // Fetch initial balance on mount
  useEffect(() => {
    
    // Ensure the bank service is initialized
    if (!bankPaymentService.isInitialized()) {
      bankPaymentService.forceInitialize();
    }
    
    fetchBalanceInfo();
  }, [fetchBalanceInfo]);

  // Also fetch when authentication status changes (for consistency)
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchBalanceInfo();
    }
  }, [isAuthenticated, user?.id, fetchBalanceInfo]);

  // Periodic check to ensure balance is loaded (fallback)
  useEffect(() => {
    const interval = setInterval(() => {
      if (balanceInfo.totalBalance === 0 && balanceInfo.availableBalance === 0 && !loading) {
        fetchBalanceInfo();
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [balanceInfo, loading, fetchBalanceInfo]);

  // Format amount for display
  const formatAmount = useCallback((amount) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2
    }).format(amount || 0);
  }, []);

  // Check if user has sufficient balance for a bid
  const hasSufficientBalance = useCallback((amount) => {
    return balanceInfo.availableBalance >= amount;
  }, [balanceInfo.availableBalance]);

  // Get balance status for UI display
  const getBalanceStatus = useCallback(() => {
    if (balanceInfo.availableBalance === 0) {
      return { status: 'empty', message: 'No available balance', color: 'red' };
    } else if (balanceInfo.availableBalance < 100) {
      return { status: 'low', message: 'Low balance', color: 'yellow' };
    } else {
      return { status: 'good', message: 'Sufficient balance', color: 'green' };
    }
  }, [balanceInfo.availableBalance]);

  // Add balance using bank service
  const addBalance = useCallback(async (amount, bankDetails) => {
    try {
      setLoading(true);
      const result = await bankPaymentService.addBalance(amount, bankDetails);
      
      // Balance will be refreshed automatically via event listener
      return result;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Hold balance for bidding
  const holdBalance = useCallback(async (amount, productId, bidId) => {
    try {
      const result = await bankPaymentService.holdBalance(amount, productId, bidId);
      
      // Balance will be refreshed automatically via event listener
      return result;
    } catch (error) {
      throw error;
    }
  }, []);

  // Release held balance
  const releaseHold = useCallback(async (holdTransactionId) => {
    try {
      const result = await bankPaymentService.releaseHold(holdTransactionId);
      
      // Balance will be refreshed automatically via event listener
      return result;
    } catch (error) {
      throw error;
    }
  }, []);

  // Complete payment
  const completePayment = useCallback(async (holdTransactionId) => {
    try {
      const result = await bankPaymentService.completePayment(holdTransactionId);
      
      // Balance will be refreshed automatically via event listener
      return result;
    } catch (error) {
      throw error;
    }
  }, []);

  // Debug method to check service status
  const debugStatus = useCallback(() => {
    return {
      balanceInfo,
      loading,
      lastUpdate,
      isServiceInitialized: bankPaymentService.isInitialized(),
      storageData: {
        balance: localStorage.getItem('bankPaymentBalance'),
        transactions: localStorage.getItem('bankPaymentTransactions')
      }
    };
  }, [balanceInfo, loading, lastUpdate]);

  return {
    balanceInfo,
    loading,
    lastUpdate,
    fetchBalanceInfo,
    formatAmount,
    hasSufficientBalance,
    getBalanceStatus,
    addBalance,
    holdBalance,
    releaseHold,
    completePayment,
    debugStatus,
    isConnected: true // Always connected for bank service
  };
};

/**
 * Hook specifically for bidding components that need balance validation
 */
export const useBankBiddingBalance = () => {
  const balanceHook = useBankBalance();
  
  // Validate if user can place a specific bid amount
  const validateBidAmount = useCallback((bidAmount) => {
    const amount = parseFloat(bidAmount);
    
    if (isNaN(amount) || amount <= 0) {
      return { valid: false, error: 'Please enter a valid bid amount' };
    }
    
    if (!balanceHook.hasSufficientBalance(amount)) {
      return {
        valid: false,
        error: `Insufficient balance. Available: ${balanceHook.formatAmount(balanceHook.balanceInfo.availableBalance)}, Required: ${balanceHook.formatAmount(amount)}`
      };
    }
    
    return { valid: true, error: null };
  }, [balanceHook]);

  // Get minimum balance needed message
  const getMinimumBalanceMessage = useCallback((minimumBid) => {
    if (balanceHook.balanceInfo.availableBalance < minimumBid) {
      const needed = minimumBid - balanceHook.balanceInfo.availableBalance;
      return `You need ${balanceHook.formatAmount(needed)} more to bid on this auction.`;
    }
    return null;
  }, [balanceHook]);

  return {
    ...balanceHook,
    validateBidAmount,
    getMinimumBalanceMessage
  };
};

export default useBankBalance;