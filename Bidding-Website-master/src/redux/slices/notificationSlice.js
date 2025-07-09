import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
};

// Notification slice
const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const notification = {
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        read: false,
        processed: false,
        ...action.payload,
      };
      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },
    removeNotification: (state, action) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        const notification = state.notifications[index];
        if (!notification.read) {
          state.unreadCount -= 1;
        }
        state.notifications.splice(index, 1);
      }
    },
    markAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount -= 1;
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
      state.unreadCount = 0;
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    showSuccess: (state, action) => {
      const notification = {
        id: Date.now() + Math.random(),
        type: 'success',
        title: 'Success',
        message: action.payload,
        timestamp: new Date().toISOString(),
        read: false,
        processed: false,
        autoHide: true,
      };
      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },
    showError: (state, action) => {
      const notification = {
        id: Date.now() + Math.random(),
        type: 'error',
        title: 'Error',
        message: action.payload,
        timestamp: new Date().toISOString(),
        read: false,
        processed: false,
        autoHide: false,
      };
      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },
    showWarning: (state, action) => {
      const notification = {
        id: Date.now() + Math.random(),
        type: 'warning',
        title: 'Warning',
        message: action.payload,
        timestamp: new Date().toISOString(),
        read: false,
        processed: false,
        autoHide: true,
      };
      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },
    showInfo: (state, action) => {
      const notification = {
        id: Date.now() + Math.random(),
        type: 'info',
        title: 'Information',
        message: action.payload,
        timestamp: new Date().toISOString(),
        read: false,
        processed: false,
        autoHide: true,
      };
      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },
    addBidNotification: (state, action) => {
      const { productTitle, bidAmount, bidder } = action.payload;
      const notification = {
        id: Date.now() + Math.random(),
        type: 'bid',
        title: 'New Bid Placed',
        message: `${bidder} placed a bid of $${bidAmount} on ${productTitle}`,
        timestamp: new Date().toISOString(),
        read: false,
        processed: false,
        autoHide: false,
      };
      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },
    addAuctionNotification: (state, action) => {
      const { type, productTitle, message } = action.payload;
      const notification = {
        id: Date.now() + Math.random(),
        type: 'auction',
        title: `Auction ${type}`,
        message: message || `Auction for ${productTitle} has ${type}`,
        timestamp: new Date().toISOString(),
        read: false,
        processed: false,
        autoHide: false,
      };
      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },
    markAsProcessed: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.processed = true;
      }
    },
    addInstantPurchaseNotification: (state, action) => {
      const { productTitle, finalPrice, productId, winner } = action.payload;
      const notification = {
        id: Date.now() + Math.random(),
        type: 'instant_purchase_win',
        title: '🎉 Congratulations! You Won!',
        message: `You have won the auction for "${productTitle}" with an instant purchase of ${finalPrice}! Please provide your delivery address to complete the purchase.`,
        timestamp: new Date().toISOString(),
        read: false,
        processed: false,
        autoHide: false,
        priority: 'high',
        actionRequired: true,
        metadata: {
          productId,
          productTitle,
          finalPrice,
          winner,
          type: 'instant_purchase'
        }
      };
      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },
    addAuctionEndedNotification: (state, action) => {
      const { productTitle, reason, winner, finalPrice } = action.payload;
      const notification = {
        id: Date.now() + Math.random(),
        type: 'auction_ended',
        title: 'Auction Ended',
        message: reason === 'instant_purchase'
          ? `Auction for "${productTitle}" ended due to instant purchase by ${winner?.name || 'another bidder'}.`
          : `Auction for "${productTitle}" has ended.`,
        timestamp: new Date().toISOString(),
        read: false,
        processed: false,
        autoHide: true,
        metadata: {
          productTitle,
          reason,
          winner,
          finalPrice
        }
      };
      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },
  },
});

export const {
  addNotification,
  removeNotification,
  markAsRead,
  markAllAsRead,
  clearAllNotifications,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  addBidNotification,
  addAuctionNotification,
  markAsProcessed,
  addInstantPurchaseNotification,
  addAuctionEndedNotification,
} = notificationSlice.actions;

export default notificationSlice.reducer;
