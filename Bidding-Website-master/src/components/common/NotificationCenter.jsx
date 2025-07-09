import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  removeNotification, 
  markAsRead, 
  markAllAsRead,
  clearAllNotifications 
} from '../../redux/slices/notificationSlice';
import { 
  MdClose, 
  MdCheckCircle, 
  MdError, 
  MdWarning, 
  MdInfo,
  MdGavel,
  MdNotifications,
  MdNotificationsActive,
  MdClear
} from 'react-icons/md';
import { FiTruck, FiDollarSign } from 'react-icons/fi';
import { formatETB } from '../../utils/currency';
import InstantPurchaseWinnerModal from '../bidding/InstantPurchaseWinnerModal';

const NotificationCenter = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount } = useSelector(state => state.notification);
  const [isOpen, setIsOpen] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [selectedWinnerNotification, setSelectedWinnerNotification] = useState(null);

  // Auto-hide notifications after a delay
  useEffect(() => {
    const autoHideNotifications = notifications.filter(n => n.autoHide && !n.read);
    
    autoHideNotifications.forEach(notification => {
      setTimeout(() => {
        dispatch(removeNotification(notification.id));
      }, 5000); // Auto-hide after 5 seconds
    });
  }, [notifications, dispatch]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <MdCheckCircle className="text-green-500" />;
      case 'error':
        return <MdError className="text-red-500" />;
      case 'warning':
        return <MdWarning className="text-yellow-500" />;
      case 'info':
        return <MdInfo className="text-blue-500" />;
      case 'bid':
        return <MdGavel className="text-purple-500" />;
      case 'auction':
        return <MdGavel className="text-blue-500" />;
      case 'instant_purchase_win':
        return <MdCheckCircle className="text-green-500" />;
      case 'auction_ended':
        return <MdGavel className="text-gray-500" />;
      case 'balance_update':
        return <FiDollarSign className="text-green-500" />;
      default:
        return <MdInfo className="text-gray-500" />;
    }
  };

  const getNotificationBgColor = (type, priority) => {
    if (priority === 'high') return 'bg-gradient-to-r from-green-50 to-green-100 border-green-200';
    
    switch (type) {
      case 'success':
      case 'instant_purchase_win':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'bid':
      case 'auction':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      dispatch(markAsRead(notification.id));
    }

    // Handle special notification types
    if (notification.type === 'instant_purchase_win' && notification.actionRequired) {
      setSelectedWinnerNotification(notification);
      setShowWinnerModal(true);
    }
  };

  const handleCloseNotification = (e, notificationId) => {
    e.stopPropagation();
    dispatch(removeNotification(notificationId));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleClearAll = () => {
    dispatch(clearAllNotifications());
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <>
      {/* Notification Bell */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          {unreadCount > 0 ? (
            <MdNotificationsActive className="text-2xl text-green-600" />
          ) : (
            <MdNotifications className="text-2xl" />
          )}
          
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notification Dropdown */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={handleClearAll}
                    className="text-gray-400 hover:text-gray-600"
                    title="Clear all"
                  >
                    <MdClear />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <MdClose />
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <MdNotifications className="text-4xl mx-auto mb-2 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50' : ''
                    } ${getNotificationBgColor(notification.type, notification.priority)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 text-xl">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${
                              notification.priority === 'high' ? 'text-green-800' : 'text-gray-900'
                            }`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            
                            {/* Special content for instant purchase notifications */}
                            {notification.type === 'instant_purchase_win' && notification.metadata && (
                              <div className="mt-2 p-2 bg-white rounded border border-green-200">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-600">Final Price:</span>
                                  <span className="font-semibold text-green-600">
                                    {formatETB(notification.metadata.finalPrice)}
                                  </span>
                                </div>
                                {notification.actionRequired && (
                                  <div className="mt-1 flex items-center space-x-1">
                                    <FiTruck className="text-blue-500" />
                                    <span className="text-xs text-blue-600 font-medium">
                                      Action Required: Provide delivery address
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-2">
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                            <button
                              onClick={(e) => handleCloseNotification(e, notification.id)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <MdClose className="text-sm" />
                            </button>
                          </div>
                        </div>
                        
                        {!notification.read && (
                          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Instant Purchase Winner Modal */}
      {showWinnerModal && selectedWinnerNotification && (
        <InstantPurchaseWinnerModal
          isOpen={showWinnerModal}
          onClose={() => {
            setShowWinnerModal(false);
            setSelectedWinnerNotification(null);
          }}
          productTitle={selectedWinnerNotification.metadata?.productTitle}
          finalPrice={selectedWinnerNotification.metadata?.finalPrice}
          productId={selectedWinnerNotification.metadata?.productId}
          notificationId={selectedWinnerNotification.id}
        />
      )}
    </>
  );
};

export default NotificationCenter;
