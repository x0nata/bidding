/**
 * Balance utility functions for ensuring consistency across the application
 */

import { paymentApiService } from '../services/paymentApi';

/**
 * Global balance refresh function that can be called from anywhere
 * This ensures all components using the balance hook get updated
 */
export const refreshGlobalBalance = async () => {
  try {
    // Trigger a custom event that the useBalanceUpdates hook can listen to
    const event = new CustomEvent('refreshBalance', {
      detail: { timestamp: new Date().toISOString() }
    });
    window.dispatchEvent(event);
    
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Call this function after any operation that changes the user's balance
 * Examples: placing a bid, adding balance, winning an auction, etc.
 */
export const notifyBalanceChange = async (operation = 'unknown') => {
  return refreshGlobalBalance();
};

/**
 * Utility to format balance amounts consistently
 */
export const formatBalance = (amount) => {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 2
  }).format(amount || 0);
};

/**
 * Check if user has sufficient balance for an operation
 */
export const checkSufficientBalance = (availableBalance, requiredAmount) => {
  return availableBalance >= requiredAmount;
};

/**
 * Get balance status for UI display
 */
export const getBalanceStatus = (availableBalance) => {
  if (availableBalance === 0) {
    return { status: 'empty', message: 'No available balance', color: 'red' };
  } else if (availableBalance < 100) {
    return { status: 'low', message: 'Low balance', color: 'yellow' };
  } else {
    return { status: 'good', message: 'Sufficient balance', color: 'green' };
  }
};

export default {
  refreshGlobalBalance,
  notifyBalanceChange,
  formatBalance,
  checkSufficientBalance,
  getBalanceStatus
};