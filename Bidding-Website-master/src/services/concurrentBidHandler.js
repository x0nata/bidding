import { store } from '../redux/store';
import { showError, showWarning, addAuctionEndedNotification } from '../redux/slices/notificationSlice';

class ConcurrentBidHandler {
  constructor() {
    this.activeBids = new Map(); // Track active bid attempts
    this.auctionLocks = new Map(); // Track auction processing locks
    this.bidQueue = new Map(); // Queue bids for processing
  }

  // Handle concurrent bid attempts
  async handleConcurrentBid(auctionId, bidData, bidder) {
    const bidKey = `${auctionId}-${bidder.id}`;
    const auctionKey = auctionId.toString();

    // Check if user already has an active bid for this auction
    if (this.activeBids.has(bidKey)) {
      return {
        success: false,
        error: 'You already have a bid being processed for this auction. Please wait.',
        code: 'CONCURRENT_BID_ATTEMPT'
      };
    }

    // Check if auction is locked for processing
    if (this.auctionLocks.has(auctionKey)) {
      // Queue the bid for later processing
      return await this.queueBid(auctionId, bidData, bidder);
    }

    // Mark bid as active
    this.activeBids.set(bidKey, {
      timestamp: Date.now(),
      bidData,
      bidder
    });

    try {
      // Process the bid
      const result = await this.processBid(auctionId, bidData, bidder);
      return result;
    } finally {
      // Clean up active bid tracking
      this.activeBids.delete(bidKey);
    }
  }

  // Queue bid for processing when auction is locked
  async queueBid(auctionId, bidData, bidder) {
    const queueKey = auctionId.toString();
    
    if (!this.bidQueue.has(queueKey)) {
      this.bidQueue.set(queueKey, []);
    }

    const queue = this.bidQueue.get(queueKey);
    
    // Check if user already has a bid in queue
    const existingBidIndex = queue.findIndex(item => item.bidder.id === bidder.id);
    if (existingBidIndex !== -1) {
      // Update existing bid with new amount if higher
      const existingBid = queue[existingBidIndex];
      if (bidData.amount > existingBid.bidData.amount) {
        queue[existingBidIndex] = {
          bidData,
          bidder,
          timestamp: Date.now()
        };
      }
      
      return {
        success: false,
        error: 'Your bid has been updated in the queue. Please wait for processing.',
        code: 'BID_QUEUED_UPDATED'
      };
    }

    // Add new bid to queue
    queue.push({
      bidData,
      bidder,
      timestamp: Date.now()
    });

    // Sort queue by bid amount (highest first)
    queue.sort((a, b) => b.bidData.amount - a.bidData.amount);

    return {
      success: false,
      error: 'Auction is being processed. Your bid has been queued.',
      code: 'BID_QUEUED'
    };
  }

  // Process queued bids after auction processing completes
  async processQueuedBids(auctionId) {
    const queueKey = auctionId.toString();
    const queue = this.bidQueue.get(queueKey);

    if (!queue || queue.length === 0) {
      return;
    }

    // Remove auction lock
    this.auctionLocks.delete(queueKey);

    // Process highest bid first
    const highestBid = queue.shift();
    
    if (highestBid) {
      try {
        await this.processBid(auctionId, highestBid.bidData, highestBid.bidder);
      } catch (error) {
        console.error('Error processing queued bid:', error);
      }
    }

    // Clear remaining queue if auction ended
    this.bidQueue.delete(queueKey);
  }

  // Lock auction for processing
  lockAuction(auctionId, reason = 'processing') {
    const auctionKey = auctionId.toString();
    this.auctionLocks.set(auctionKey, {
      reason,
      timestamp: Date.now()
    });
  }

  // Unlock auction
  unlockAuction(auctionId) {
    const auctionKey = auctionId.toString();
    this.auctionLocks.delete(auctionKey);
    
    // Process any queued bids
    this.processQueuedBids(auctionId);
  }

  // Check if auction is locked
  isAuctionLocked(auctionId) {
    return this.auctionLocks.has(auctionId.toString());
  }

  // Process individual bid with race condition handling
  async processBid(auctionId, bidData, bidder) {
    try {
      // Lock auction during processing
      this.lockAuction(auctionId, 'bid_processing');

      // Simulate API call to place bid
      // In real implementation, this would call the actual API
      const response = await this.simulateBidPlacement(auctionId, bidData, bidder);

      if (response.auctionEnded) {
        // Handle auction ending scenarios
        await this.handleAuctionEnded(auctionId, response);
      }

      return {
        success: true,
        data: response
      };

    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to process bid',
        code: 'BID_PROCESSING_ERROR'
      };
    } finally {
      // Always unlock auction
      this.unlockAuction(auctionId);
    }
  }

  // Simulate bid placement (replace with actual API call)
  async simulateBidPlacement(auctionId, bidData, bidder) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

    // Simulate different scenarios
    const random = Math.random();
    
    if (random < 0.1) {
      // 10% chance of auction ending due to instant purchase
      return {
        success: true,
        auctionEnded: true,
        instantPurchase: true,
        finalPrice: bidData.amount,
        winner: bidder
      };
    } else if (random < 0.15) {
      // 5% chance of auction ending due to time
      return {
        success: true,
        auctionEnded: true,
        instantPurchase: false,
        reason: 'time_expired',
        finalPrice: bidData.amount,
        winner: bidder
      };
    } else if (random < 0.2) {
      // 5% chance of bid being outbid during processing
      throw new Error('Bid was outbid during processing');
    } else {
      // Normal bid placement
      return {
        success: true,
        auctionEnded: false,
        currentBid: bidData.amount,
        bidder: bidder
      };
    }
  }

  // Handle auction ended scenarios
  async handleAuctionEnded(auctionId, endData) {
    // Notify all users with active bids that auction ended
    const activeBidsForAuction = Array.from(this.activeBids.entries())
      .filter(([key]) => key.startsWith(`${auctionId}-`));

    activeBidsForAuction.forEach(([key, bidInfo]) => {
      if (bidInfo.bidder.id !== endData.winner?.id) {
        // Notify non-winners that auction ended
        store.dispatch(addAuctionEndedNotification({
          productTitle: endData.productTitle || 'Auction Item',
          reason: endData.instantPurchase ? 'instant_purchase' : endData.reason,
          winner: endData.winner,
          finalPrice: endData.finalPrice
        }));
      }
    });

    // Clear all active bids for this auction
    activeBidsForAuction.forEach(([key]) => {
      this.activeBids.delete(key);
    });

    // Clear queued bids for this auction
    this.bidQueue.delete(auctionId.toString());
  }

  // Handle network errors and retries
  async handleNetworkError(auctionId, bidData, bidder, error, retryCount = 0) {
    const maxRetries = 3;
    
    if (retryCount < maxRetries) {
      // Wait before retry with exponential backoff
      const delay = Math.pow(2, retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      try {
        return await this.processBid(auctionId, bidData, bidder);
      } catch (retryError) {
        return await this.handleNetworkError(auctionId, bidData, bidder, retryError, retryCount + 1);
      }
    } else {
      // Max retries reached
      store.dispatch(showError('Network error: Failed to place bid after multiple attempts. Please try again.'));
      return {
        success: false,
        error: 'Network error: Max retries exceeded',
        code: 'NETWORK_ERROR_MAX_RETRIES'
      };
    }
  }

  // Clean up expired bids and locks
  cleanup() {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    // Clean up expired active bids
    for (const [key, bidInfo] of this.activeBids.entries()) {
      if (now - bidInfo.timestamp > maxAge) {
        this.activeBids.delete(key);
      }
    }

    // Clean up expired auction locks
    for (const [key, lockInfo] of this.auctionLocks.entries()) {
      if (now - lockInfo.timestamp > maxAge) {
        this.auctionLocks.delete(key);
      }
    }

    // Clean up expired queued bids
    for (const [auctionId, queue] of this.bidQueue.entries()) {
      const validBids = queue.filter(bid => now - bid.timestamp <= maxAge);
      if (validBids.length === 0) {
        this.bidQueue.delete(auctionId);
      } else {
        this.bidQueue.set(auctionId, validBids);
      }
    }
  }

  // Get status information
  getStatus() {
    return {
      activeBids: this.activeBids.size,
      lockedAuctions: this.auctionLocks.size,
      queuedBids: Array.from(this.bidQueue.values()).reduce((total, queue) => total + queue.length, 0)
    };
  }
}

// Export singleton instance
export default new ConcurrentBidHandler();
