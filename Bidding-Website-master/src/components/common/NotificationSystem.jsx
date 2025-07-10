import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { removeNotification, markAsRead, markAsProcessed } from '../../redux/slices/notificationSlice';

const NotificationSystem = () => {
  const dispatch = useDispatch();
  const { notifications } = useSelector((state) => state.notification);

  useEffect(() => {
    // Process new notifications
    notifications.forEach((notification) => {
      if (!notification.processed) {
        // Show toast notification
        const toastOptions = {
          autoClose: 5000, // Always auto-close after 5 seconds
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          onClose: () => {
            dispatch(markAsRead(notification.id));
            // Remove notification after close
            setTimeout(() => {
              dispatch(removeNotification(notification.id));
            }, 100);
          },
        };

        switch (notification.type) {
          case 'success':
            toast.success(notification.message, toastOptions);
            break;
          case 'error':
            toast.error(notification.message, toastOptions);
            break;
          case 'warning':
            toast.warning(notification.message, toastOptions);
            break;
          case 'info':
            toast.info(notification.message, toastOptions);
            break;
          case 'bid':
            toast.info(
              <div>
                <strong>{notification.title}</strong>
                <br />
                {notification.message}
              </div>,
              toastOptions
            );
            break;
          case 'auction':
            toast.warning(
              <div>
                <strong>{notification.title}</strong>
                <br />
                {notification.message}
              </div>,
              toastOptions
            );
            break;
          default:
            toast(notification.message, toastOptions);
        }

        // Mark as processed to avoid duplicate toasts
        dispatch(markAsProcessed(notification.id));
      }
    });
  }, [notifications, dispatch]);

  return null; // This component doesn't render anything visible
};

export default NotificationSystem;
