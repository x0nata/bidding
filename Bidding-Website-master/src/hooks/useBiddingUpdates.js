import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import biddingService from '../services/biddingService';
import { showSuccess, showError, showInfo } from '../redux/slices/notificationSlice';

// Custom hook for real-time bidding updates
export const useBiddingUpdates = (auctionId = null) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [bidUpdates, setBidUpdates] = useState({});
  const unsubscribeRef = useRef(null);

  // Handle bidding events
  const handleBiddingEvent = useCallback((event, data) => {
    setLastUpdate(new Date().toISOString());

    switch (event) {
      case 'connected':
        setConnectionStatus('connected');
        dispatch(showSuccess('Connected to live bidding updates'));
        break;

      case 'connectionFailed':
        setConnectionStatus('failed');
        dispatch(showError('Failed to connect to live updates. Some features may not work properly.'));
        break;

      case 'offline':
        setConnectionStatus('offline');
        dispatch(showInfo('You are offline. Updates will resume when connection is restored.'));
        break;

      case 'online':
        setConnectionStatus('connected');
        dispatch(showSuccess('Connection restored. Live updates resumed.'));
        break;

      case 'bidUpdate':
        setBidUpdates(prev => ({
          ...prev,
          [data.auctionId]: {
            currentBid: data.newBid.amount,
            totalBids: data.totalBids,
            lastBidder: data.newBid.bidder,
            timestamp: data.newBid.timestamp
          }
        }));

        // Show notification if user is watching this auction
        if (data.auctionId && data.newBid.bidder.id !== user?.id) {
          dispatch(showInfo(`New bid placed: $${data.newBid.amount.toLocaleString()}`));
        }
        break;

      case 'userOutbid':
        if (data.userId === user?.id) {
          dispatch(showError(`You have been outbid on "${data.auctionTitle}"!`));
          
          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification('You have been outbid!', {
              body: `Someone placed a higher bid on "${data.auctionTitle}"`,
              icon: '/favicon.ico',
              tag: `outbid-${data.auctionId}`
            });
          }
        }
        break;

      case 'auctionEndingSoon':
        dispatch(showInfo(`Auction ending soon: "${data.title}" - ${data.timeLeft} minutes left`));
        
        if (Notification.permission === 'granted') {
          new Notification('Auction Ending Soon!', {
            body: `"${data.title}" ends in ${data.timeLeft} minutes`,
            icon: '/favicon.ico',
            tag: `ending-${data.auctionId}`
          });
        }
        break;

      case 'auctionEnded':
        if (data.winnerId === user?.id) {
          dispatch(showSuccess(`Congratulations! You won "${data.title}"!`));
          
          if (Notification.permission === 'granted') {
            new Notification('Auction Won!', {
              body: `Congratulations! You won "${data.title}"`,
              icon: '/favicon.ico',
              tag: `won-${data.auctionId}`
            });
          }
        } else {
          dispatch(showInfo(`Auction ended: "${data.title}"`));
        }
        break;

      case 'missedUpdatesSync':
        // Handle missed updates when page becomes visible again
        break;

      default:
        break;
    }
  }, [dispatch, user?.id]);

  // Subscribe to auction-specific updates
  useEffect(() => {
    if (auctionId && isAuthenticated) {
      const unsubscribe = biddingService.subscribeToAuction(auctionId, handleBiddingEvent);
      unsubscribeRef.current = unsubscribe;
      
      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
        }
      };
    }
  }, [auctionId, isAuthenticated, handleBiddingEvent]);

  // Subscribe to user-specific updates
  useEffect(() => {
    if (user?.id && isAuthenticated) {
      const unsubscribe = biddingService.subscribeToUser(user.id, handleBiddingEvent);
      
      return unsubscribe;
    }
  }, [user?.id, isAuthenticated, handleBiddingEvent]);

  // Subscribe to global updates
  useEffect(() => {
    const unsubscribe = biddingService.subscribeToGlobal(handleBiddingEvent);
    return unsubscribe;
  }, [handleBiddingEvent]);

  // Update connection status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const status = biddingService.getConnectionStatus();
      setConnectionStatus(status.isConnected ? 'connected' : 'disconnected');
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if (isAuthenticated && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          dispatch(showSuccess('Browser notifications enabled for bidding updates'));
        }
      });
    }
  }, [isAuthenticated, dispatch]);

  return {
    connectionStatus,
    lastUpdate,
    bidUpdates,
    isConnected: connectionStatus === 'connected',
    getBidUpdate: (auctionId) => bidUpdates[auctionId] || null,
    refreshConnection: () => {
      biddingService.disconnect();
      setTimeout(() => biddingService.initialize(), 1000);
    }
  };
};

// Hook for auction-specific updates
export const useAuctionUpdates = (auctionId) => {
  return useBiddingUpdates(auctionId);
};

// Hook for user bidding notifications
export const useBiddingNotifications = () => {
  const { user } = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const addNotification = useCallback((type, title, message, auctionId) => {
    const notification = {
      id: Date.now(),
      type,
      title,
      message,
      auctionId,
      timestamp: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50
    setUnreadCount(prev => prev + 1);
  }, []);

  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearNotification = useCallback((notificationId) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  }, []);

  // Listen for bidding events to create notifications
  useEffect(() => {
    if (!user?.id) return;

    const handleEvent = (event, data) => {
      switch (event) {
        case 'userOutbid':
          if (data.userId === user.id) {
            addNotification('outbid', 'You have been outbid!', 
              `Someone placed a higher bid on "${data.auctionTitle}"`, data.auctionId);
          }
          break;
        case 'auctionEndingSoon':
          addNotification('ending_soon', 'Auction ending soon!', 
            `"${data.title}" ends in ${data.timeLeft} minutes`, data.auctionId);
          break;
        case 'auctionEnded':
          if (data.winnerId === user.id) {
            addNotification('won', 'Congratulations! You won!', 
              `You won the auction for "${data.title}"`, data.auctionId);
          }
          break;
        default:
          break;
      }
    };

    const unsubscribe = biddingService.subscribeToUser(user.id, handleEvent);
    return unsubscribe;
  }, [user?.id, addNotification]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    addNotification
  };
};

// Hook for connection status monitoring
export const useConnectionStatus = () => {
  const [status, setStatus] = useState('connecting');
  const [lastConnected, setLastConnected] = useState(null);

  useEffect(() => {
    const handleEvent = (event, data) => {
      switch (event) {
        case 'connected':
          setStatus('connected');
          setLastConnected(new Date().toISOString());
          break;
        case 'connectionFailed':
          setStatus('failed');
          break;
        case 'offline':
          setStatus('offline');
          break;
        case 'online':
          setStatus('connected');
          setLastConnected(new Date().toISOString());
          break;
        default:
          break;
      }
    };

    const unsubscribe = biddingService.subscribeToGlobal(handleEvent);
    return unsubscribe;
  }, []);

  return {
    status,
    lastConnected,
    isConnected: status === 'connected',
    isOffline: status === 'offline',
    hasFailed: status === 'failed'
  };
};
