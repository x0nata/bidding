import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Title, Body } from '../common/Design';
import { MdNotifications, MdClose, MdGavel, MdTrendingUp, MdCheckCircle, MdWarning } from 'react-icons/md';
import { FiClock, FiBell, FiBellOff } from 'react-icons/fi';
import { RiAuctionFill } from 'react-icons/ri';
import { useBiddingNotifications } from '../../hooks/useBiddingUpdates';

const BiddingNotifications = ({ className = '' }) => {
  const { user } = useSelector((state) => state.auth);
  const [showNotifications, setShowNotifications] = useState(false);

  // Use the real-time notifications hook
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification
  } = useBiddingNotifications();

  // Request notification permission on mount
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'outbid':
        return <MdTrendingUp className="text-orange-500" />;
      case 'winning':
        return <MdCheckCircle className="text-green-500" />;
      case 'ending_soon':
        return <FiClock className="text-yellow-500" />;
      case 'won':
        return <MdGavel className="text-blue-500" />;
      default:
        return <MdNotifications className="text-gray-500" />;
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-green transition-colors"
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <Title level={5} className="text-gray-800">Bidding Notifications</Title>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-green hover:text-primary text-sm"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setShowNotifications(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <MdClose size={20} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <FiBellOff className="mx-auto text-gray-400 text-3xl mb-2" />
                <Body className="text-gray-500">No notifications yet</Body>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Title level={6} className={`text-gray-800 ${!notification.read ? 'font-semibold' : ''}`}>
                            {notification.title}
                          </Title>
                          <Body className="text-gray-600 text-sm mt-1">
                            {notification.message}
                          </Body>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                            {notification.actionUrl && (
                              <a
                                href={notification.actionUrl}
                                onClick={() => markAsRead(notification.id)}
                                className="text-green hover:text-primary text-sm font-medium"
                              >
                                View Auction
                              </a>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => clearNotification(notification.id)}
                          className="text-gray-400 hover:text-gray-600 ml-2"
                        >
                          <MdClose size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <a
                href="/my-bids"
                className="text-green hover:text-primary text-sm font-medium"
              >
                View All Bids
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BiddingNotifications;
