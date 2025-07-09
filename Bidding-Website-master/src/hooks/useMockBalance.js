import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { mockPaymentService } from '../services/mockPaymentService';

/**
 * Mock balance hook - Simple balance management without backend dependency
 */
export const useMockBalance = () => {
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
    if (!isAuthenticated) {
      setBalanceInfo({
        totalBalance: 0,
        heldAmount: 0,
        availableBalance: 0,
        heldTransactions: 0
      });
      return;
    }

    try {
      setLoading(true);
      const response = await mockPaymentService.getBalanceInfo();
      
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
  }, [isAuthenticated]);

  // Listen for balance update events
  useEffect(() => {
    const handleBalanceUpdate = () => {
      fetchBalanceInfo();
    };

    window.addEventListener('mockBalanceUpdate', handleBalanceUpdate);
    
    return () => {
      window.removeEventListener('mockBalanceUpdate', handleBalanceUpdate);
    };
  }, [fetchBalanceInfo]);

  // Fetch initial balance on mount and when user changes
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchBalanceInfo();
    } else {
      setBalanceInfo({
        totalBalance: 0,
        heldAmount: 0,
        availableBalance: 0,
        heldTransactions: 0
      });
    }
  }, [isAuthenticated, user?.id, fetchBalanceInfo]);

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

  // Add balance using mock service
  const addBalance = useCallback(async (amount, paymentMethod, cardDetails) => {
    try {
      setLoading(true);
      const result = await mockPaymentService.addBalance(amount, paymentMethod, cardDetails);
      
      // Trigger balance refresh
      await fetchBalanceInfo();
      
      // Dispatch global update event
      window.dispatchEvent(new CustomEvent('mockBalanceUpdate', {
        detail: { type: 'balance_added', amount, newBalance: result.newBalance }
      }));
      
      return result;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchBalanceInfo]);

  // Hold balance for bidding
  const holdBalance = useCallback(async (amount, productId, bidId) => {
    try {
      const result = await mockPaymentService.holdBalance(amount, productId, bidId);
      
      // Trigger balance refresh
      await fetchBalanceInfo();
      
      // Dispatch global update event
      window.dispatchEvent(new CustomEvent('mockBalanceUpdate', {
        detail: { type: 'balance_held', amount, productId }
      }));
      
      return result;
    } catch (error) {
      throw error;
    }
  }, [fetchBalanceInfo]);

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
    isConnected: true // Always connected for mock service
  };
};

/**
 * Hook specifically for bidding components that need balance validation
 */
export const useMockBiddingBalance = () => {
  const balanceHook = useMockBalance();
  
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

export default useMockBalance;