// This hook now uses the Bank Payment System
// Redirects to useBankBalance for consistency
import { useBankBalance, useBankBiddingBalance } from './useBankBalance';

/**
 * Legacy hook that now uses the bank payment system
 */
export const useBalanceUpdates = () => {
  return useBankBalance();
};

/**
 * Legacy bidding balance hook that now uses the bank payment system
 */
export const useBiddingBalance = () => {
  return useBankBiddingBalance();
};

export default useBalanceUpdates;