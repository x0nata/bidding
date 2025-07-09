import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { showSuccess, showError } from '../../redux/slices/notificationSlice';

// Bidding Manager - Centralized bidding logic and state management
class BiddingManager {
  constructor() {
    this.listeners = new Set();
    this.activeBids = new Map();
    this.bidHistory = new Map();
    this.notifications = [];
  }

  // Subscribe to bidding updates
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners of updates
  notify(event, data) {
    this.listeners.forEach(callback => callback(event, data));
  }

  // Place a bid
  async placeBid(auctionId, amount, userId) {
    try {
      // Validate bid
      const validation = this.validateBid(auctionId, amount, userId);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // TODO: Replace with actual API call
      // const response = await fetch(`/api/auctions/${auctionId}/bid`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ amount, userId })
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update local state
      const bid = {
        id: Date.now(),
        auctionId,
        amount,
        userId,
        timestamp: new Date().toISOString(),
        isWinning: true
      };

      this.addBidToHistory(auctionId, bid);
      this.updateActiveBid(auctionId, bid);

      // Notify listeners
      this.notify('bidPlaced', { auctionId, bid });
      this.notify('bidUpdate', { auctionId, currentBid: amount, totalBids: this.getBidCount(auctionId) });

      return { success: true, bid };
    } catch (error) {
      this.notify('bidError', { auctionId, error: error.message });
      throw error;
    }
  }

  // Validate bid amount and conditions
  validateBid(auctionId, amount, userId) {
    const currentBid = this.getCurrentBid(auctionId);
    const minIncrement = this.calculateMinIncrement(currentBid);
    const minimumBid = currentBid + minIncrement;

    if (!userId) {
      return { isValid: false, error: 'User must be logged in to bid' };
    }

    if (amount < minimumBid) {
      return { isValid: false, error: `Minimum bid is $${minimumBid.toLocaleString()}` };
    }

    if (amount > 1000000) {
      return { isValid: false, error: 'Bid amount cannot exceed $1,000,000' };
    }

    // Check if auction is still active
    const auction = this.getAuctionData(auctionId);
    if (auction && new Date(auction.endDate) <= new Date()) {
      return { isValid: false, error: 'Auction has ended' };
    }

    return { isValid: true };
  }

  // Calculate minimum bid increment based on current price
  calculateMinIncrement(currentPrice) {
    if (currentPrice < 100) return 5;
    if (currentPrice < 500) return 10;
    if (currentPrice < 1000) return 25;
    if (currentPrice < 5000) return 50;
    if (currentPrice < 10000) return 100;
    return 250;
  }

  // Get current highest bid for an auction
  getCurrentBid(auctionId) {
    const activeBid = this.activeBids.get(auctionId);
    return activeBid ? activeBid.amount : 0;
  }

  // Get bid count for an auction
  getBidCount(auctionId) {
    const history = this.bidHistory.get(auctionId);
    return history ? history.length : 0;
  }

  // Add bid to history
  addBidToHistory(auctionId, bid) {
    if (!this.bidHistory.has(auctionId)) {
      this.bidHistory.set(auctionId, []);
    }
    
    const history = this.bidHistory.get(auctionId);
    
    // Mark previous bids as not winning
    history.forEach(existingBid => {
      existingBid.isWinning = false;
    });
    
    // Add new bid
    history.unshift(bid);
    this.bidHistory.set(auctionId, history);
  }

  // Update active bid
  updateActiveBid(auctionId, bid) {
    this.activeBids.set(auctionId, bid);
  }

  // Get bid history for an auction
  getBidHistory(auctionId) {
    return this.bidHistory.get(auctionId) || [];
  }

  // Get auction data (mock for now)
  getAuctionData(auctionId) {
    // TODO: Replace with actual auction data
    return {
      id: auctionId,
      endDate: '2024-02-15T18:00:00Z',
      startingBid: 500,
      reservePrice: 800
    };
  }

  // Check if user is winning an auction
  isUserWinning(auctionId, userId) {
    const activeBid = this.activeBids.get(auctionId);
    return activeBid && activeBid.userId === userId;
  }

  // Get user's bid for an auction
  getUserBid(auctionId, userId) {
    const history = this.getBidHistory(auctionId);
    return history.find(bid => bid.userId === userId);
  }

  // Simulate being outbid (for demo purposes)
  simulateOutbid(auctionId, userId) {
    const currentBid = this.getCurrentBid(auctionId);
    const increment = this.calculateMinIncrement(currentBid);
    const newAmount = currentBid + increment;

    const newBid = {
      id: Date.now(),
      auctionId,
      amount: newAmount,
      userId: 'other-user',
      timestamp: new Date().toISOString(),
      isWinning: true
    };

    this.addBidToHistory(auctionId, newBid);
    this.updateActiveBid(auctionId, newBid);

    // Notify that user was outbid
    this.notify('userOutbid', { auctionId, userId, newBid });
    this.notify('bidUpdate', { auctionId, currentBid: newAmount, totalBids: this.getBidCount(auctionId) });
  }

  // Get suggested bid amounts
  getSuggestedBids(auctionId) {
    const currentBid = this.getCurrentBid(auctionId);
    const increment = this.calculateMinIncrement(currentBid);
    const minimumBid = currentBid + increment;

    return [
      minimumBid,
      minimumBid + increment,
      minimumBid + (increment * 2),
      minimumBid + (increment * 5)
    ];
  }

  // Add notification
  addNotification(type, message, auctionId) {
    const notification = {
      id: Date.now(),
      type,
      message,
      auctionId,
      timestamp: new Date().toISOString(),
      read: false
    };

    this.notifications.unshift(notification);
    this.notify('notification', notification);

    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }
  }

  // Get notifications for user
  getNotifications(userId) {
    return this.notifications.filter(notification => 
      notification.userId === userId || !notification.userId
    );
  }

  // Mark notification as read
  markNotificationRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.notify('notificationRead', { notificationId });
    }
  }

  // Clear all data (for testing)
  clear() {
    this.activeBids.clear();
    this.bidHistory.clear();
    this.notifications = [];
    this.notify('cleared', {});
  }
}

// Create singleton instance
const biddingManager = new BiddingManager();

// React hook for using bidding manager
export const useBiddingManager = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [bidData, setBidData] = useState({});

  const handleBiddingEvent = useCallback((event, data) => {
    switch (event) {
      case 'bidPlaced':
        dispatch(showSuccess(`Bid placed successfully for $${data.bid.amount.toLocaleString()}!`));
        break;
      case 'bidError':
        dispatch(showError(data.error));
        break;
      case 'userOutbid':
        if (data.userId === user?.id) {
          dispatch(showError(`You have been outbid on this auction!`));
        }
        break;
      case 'bidUpdate':
        setBidData(prev => ({
          ...prev,
          [data.auctionId]: {
            currentBid: data.currentBid,
            totalBids: data.totalBids
          }
        }));
        break;
      default:
        break;
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    const unsubscribe = biddingManager.subscribe(handleBiddingEvent);
    return unsubscribe;
  }, [handleBiddingEvent]);

  return {
    placeBid: (auctionId, amount) => biddingManager.placeBid(auctionId, amount, user?.id),
    getCurrentBid: (auctionId) => biddingManager.getCurrentBid(auctionId),
    getBidHistory: (auctionId) => biddingManager.getBidHistory(auctionId),
    isUserWinning: (auctionId) => biddingManager.isUserWinning(auctionId, user?.id),
    getUserBid: (auctionId) => biddingManager.getUserBid(auctionId, user?.id),
    getSuggestedBids: (auctionId) => biddingManager.getSuggestedBids(auctionId),
    validateBid: (auctionId, amount) => biddingManager.validateBid(auctionId, amount, user?.id),
    calculateMinIncrement: biddingManager.calculateMinIncrement,
    bidData
  };
};

export default biddingManager;
