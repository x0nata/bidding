import { bankPaymentService } from './bankPaymentService';

/**
 * Mock Balance Integration - Connects frontend mock balance with backend
 */
export const mockBalanceIntegration = {
  /**
   * Sync frontend mock balance with backend for bidding
   */
  syncBalanceForBidding: async (bidAmount) => {
    try {
      // Get current mock balance
      const balanceInfo = await bankPaymentService.getBalanceInfo();
      
      
      // If we have sufficient mock balance, proceed with bid
      if (balanceInfo.availableBalance >= bidAmount) {
        // Hold the amount in mock system
        await bankPaymentService.holdBalance(bidAmount, 'demo-product', 'demo-bid');
        
        return { success: true, balanceInfo };
      } else {
        throw new Error(`Insufficient mock balance. Available: ${balanceInfo.availableBalance}, Required: ${bidAmount}`);
      }
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get current mock balance status
   */
  getCurrentBalance: async () => {
    try {
      return await bankPaymentService.getBalanceInfo();
    } catch (error) {
      return {
        totalBalance: 50000,
        availableBalance: 50000,
        heldAmount: 0,
        heldTransactions: 0
      };
    }
  },

  /**
   * Add balance to mock system
   */
  addMockBalance: async (amount) => {
    try {
      const result = await bankPaymentService.addBalance(amount, {
        accountNumber: '12345678',
        accountHolder: 'Demo User'
      });
      
      return result;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Initialize mock balance if needed
   */
  initializeMockBalance: async () => {
    try {
      const balanceInfo = await bankPaymentService.getBalanceInfo();
      
      // If balance is too low, add some demo balance
      if (balanceInfo.totalBalance < 1000) {
        await this.addMockBalance(50000);
      }
      
      return balanceInfo;
    } catch (error) {
      // Force initialization
      bankPaymentService.forceInitialize();
      return await bankPaymentService.getBalanceInfo();
    }
  }
};

export default mockBalanceIntegration;