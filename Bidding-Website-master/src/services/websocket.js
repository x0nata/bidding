// Safe import with error handling
let io = null;
try {
  io = require('socket.io-client');
} catch (error) {
  console.warn('socket.io-client not available, WebSocket features disabled');
}

import { store } from '../redux/store';
import { addBid, updateCurrentBid } from '../redux/slices/biddingSlice';
import { updateAuctionStatus } from '../redux/slices/auctionSlice';
import {
  addBidNotification,
  addAuctionNotification,
  addInstantPurchaseNotification,
  addAuctionEndedNotification
} from '../redux/slices/notificationSlice';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.isAvailable = !!io;
  }

  connect() {
    // Early return if socket.io is not available
    if (!this.isAvailable) {
      console.log('🔄 WebSocket not available - using polling mode');
      return;
    }

    if (this.socket && this.isConnected) {
      return;
    }

    // 🚨 VERCEL COMPATIBILITY: Check if WebSocket is disabled
    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL;
    const WEBSOCKET_ENABLED = process.env.REACT_APP_ENABLE_WEBSOCKET !== 'false';

    if (!SOCKET_URL || !WEBSOCKET_ENABLED) {
      console.log('🔄 WebSocket disabled for Vercel serverless - using polling mode');
      this.isConnected = false;
      return;
    }

    this.socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['polling'], // 🔧 FIXED: Only use polling for Vercel compatibility
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      this.isConnected = false;
    });

    // Bidding events
    this.socket.on('newBid', (bidData) => {
      store.dispatch(addBid(bidData));
      store.dispatch(updateCurrentBid(bidData));
      
      // Add notification
      store.dispatch(addBidNotification({
        productTitle: bidData.product?.title || 'Unknown Item',
        bidAmount: bidData.amount,
        bidder: bidData.bidder?.name || 'Anonymous',
      }));
    });

    this.socket.on('bidUpdate', (bidData) => {
      store.dispatch(updateCurrentBid(bidData));
    });

    // Auction events
    this.socket.on('auctionStarted', (auctionData) => {
      store.dispatch(updateAuctionStatus({
        auctionId: auctionData._id,
        status: 'active'
      }));
      
      store.dispatch(addAuctionNotification({
        type: 'started',
        productTitle: auctionData.product?.title || 'Unknown Item',
        message: `Auction for ${auctionData.product?.title || 'Unknown Item'} has started!`
      }));
    });

    this.socket.on('auctionEnded', (auctionData) => {
      store.dispatch(updateAuctionStatus({
        auctionId: auctionData._id,
        status: 'ended'
      }));
      
      store.dispatch(addAuctionNotification({
        type: 'ended',
        productTitle: auctionData.product?.title || 'Unknown Item',
        message: `Auction for ${auctionData.product?.title || 'Unknown Item'} has ended!`
      }));
    });

    this.socket.on('auctionUpdate', (auctionData) => {
      store.dispatch(updateAuctionStatus({
        auctionId: auctionData._id,
        status: auctionData.status
      }));
    });

    // Price update events
    this.socket.on('priceUpdate', (data) => {
      // Handle real-time price updates
    });

    // User events
    this.socket.on('userJoined', (userData) => {
    });

    this.socket.on('userLeft', (userData) => {
    });

    // Balance update events
    this.socket.on('balance_update', (balanceData) => {

      // Dispatch balance update to store if needed
      // You can add a balance slice to Redux if you want to manage balance state globally

      // Show notification based on update type
      const { type, amount, auctionTitle, newBalance } = balanceData;
      let message = '';

      switch (type) {
        case 'BALANCE_ADDED':
          message = `${amount} ETB added to your account`;
          break;
        case 'AUCTION_PAYMENT':
          message = `Payment of ${amount} ETB processed for ${auctionTitle}`;
          break;
        case 'BID_REFUND':
          message = `Bid refund of ${amount} ETB processed for ${auctionTitle}`;
          break;
        case 'BID_HOLD':
          message = `${amount} ETB held for your bid on ${auctionTitle}`;
          break;
        default:
          message = `Balance updated: ${newBalance} ETB`;
      }

      store.dispatch(addBidNotification({
        productTitle: auctionTitle || 'Account Balance',
        message,
        type: 'balance_update'
      }));
    });

    // User outbid events (with balance refund info)
    this.socket.on('user_outbid', (outbidData) => {

      const message = `You were outbid on ${outbidData.product?.title}. Your bid amount has been refunded.`;

      store.dispatch(addBidNotification({
        productTitle: outbidData.product?.title || 'Auction',
        message,
        type: 'outbid'
      }));
    });

    // Instant purchase events
    this.socket.on('instant_purchase_win', (winData) => {
      // Notify the winner
      store.dispatch(addInstantPurchaseNotification({
        productTitle: winData.product?.title || 'Auction Item',
        finalPrice: winData.finalPrice,
        productId: winData.productId,
        winner: winData.winner
      }));
    });

    this.socket.on('auction_ended_instant_purchase', (endData) => {
      // Notify other bidders that auction ended due to instant purchase
      store.dispatch(addAuctionEndedNotification({
        productTitle: endData.product?.title || 'Auction Item',
        reason: 'instant_purchase',
        winner: endData.winner,
        finalPrice: endData.finalPrice
      }));
    });

    // General auction ending events
    this.socket.on('auction_auto_ended', (endData) => {
      store.dispatch(addAuctionEndedNotification({
        productTitle: endData.product?.title || 'Auction Item',
        reason: endData.reason || 'ended',
        winner: endData.winner,
        finalPrice: endData.finalPrice
      }));
    });
  }

  disconnect() {
    if (!this.isAvailable) {
      return; // No-op if socket.io not available
    }

    if (this.socket) {
      try {
        this.socket.disconnect();
      } catch (error) {
        console.warn('Error disconnecting socket:', error);
      }
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Join auction room
  joinAuction(auctionId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('joinAuction', auctionId);
    }
  }

  // Leave auction room
  leaveAuction(auctionId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leaveAuction', auctionId);
    }
  }

  // Place bid through WebSocket
  placeBid(bidData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('placeBid', bidData);
    }
  }

  // Send message to auction room
  sendMessage(auctionId, message) {
    if (this.socket && this.isConnected) {
      this.socket.emit('auctionMessage', { auctionId, message });
    }
  }

  // Subscribe to user's listing updates
  subscribeToUserListings(userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('subscribeToUserListings', { userId });
    }
  }

  // Unsubscribe from user's listing updates
  unsubscribeFromUserListings(userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('unsubscribeFromUserListings', { userId });
    }
  }

  // Subscribe to specific listing updates
  subscribeToListing(listingId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('subscribeToListing', { listingId });
    }
  }

  // Unsubscribe from specific listing updates
  unsubscribeFromListing(listingId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('unsubscribeFromListing', { listingId });
    }
  }

  // Add event listener with cleanup function
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      // Return cleanup function
      return () => {
        if (this.socket) {
          this.socket.off(event, callback);
        }
      };
    }
    return () => {}; // No-op cleanup if no socket
  }

  // Remove event listener
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Get connection status
  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;
