import React, { useState, useEffect } from 'react';
import { 
  FiCheckCircle, 
  FiAlertCircle, 
  FiInfo, 
  FiX,
  FiAlertTriangle
} from 'react-icons/fi';

export const Toast = ({ 
  type = 'info', 
  title, 
  message, 
  duration = 5000, 
  onClose,
  position = 'top-right',
  showProgress = true 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (duration > 0) {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (duration / 100));
          if (newProgress <= 0) {
            clearInterval(progressInterval);
            handleClose();
            return 0;
          }
          return newProgress;
        });
      }, 100);

      return () => clearInterval(progressInterval);
    }
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose && onClose();
    }, 300);
  };

  const getToastStyles = () => {
    const baseStyles = "fixed z-50 max-w-sm w-full bg-white rounded-lg shadow-lg border transition-all duration-300 transform";
    
    const positionStyles = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
    };

    const visibilityStyles = isVisible 
      ? 'translate-y-0 opacity-100 scale-100' 
      : 'translate-y-2 opacity-0 scale-95';

    return `${baseStyles} ${positionStyles[position]} ${visibilityStyles}`;
  };

  const getIconAndColors = () => {
    switch (type) {
      case 'success':
        return {
          icon: FiCheckCircle,
          iconColor: 'text-green-600',
          borderColor: 'border-green-200',
          bgColor: 'bg-green-50',
          progressColor: 'bg-green-500'
        };
      case 'error':
        return {
          icon: FiAlertCircle,
          iconColor: 'text-red-600',
          borderColor: 'border-red-200',
          bgColor: 'bg-red-50',
          progressColor: 'bg-red-500'
        };
      case 'warning':
        return {
          icon: FiAlertTriangle,
          iconColor: 'text-yellow-600',
          borderColor: 'border-yellow-200',
          bgColor: 'bg-yellow-50',
          progressColor: 'bg-yellow-500'
        };
      case 'info':
      default:
        return {
          icon: FiInfo,
          iconColor: 'text-blue-600',
          borderColor: 'border-blue-200',
          bgColor: 'bg-blue-50',
          progressColor: 'bg-blue-500'
        };
    }
  };

  const { icon: Icon, iconColor, borderColor, bgColor, progressColor } = getIconAndColors();

  return (
    <div className={getToastStyles()}>
      <div className={`p-4 ${borderColor} border-l-4`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          
          <div className="ml-3 flex-1">
            {title && (
              <h3 className="text-sm font-medium text-gray-900 mb-1">
                {title}
              </h3>
            )}
            {message && (
              <p className="text-sm text-gray-700">
                {message}
              </p>
            )}
          </div>
          
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleClose}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      {showProgress && duration > 0 && (
        <div className="h-1 bg-gray-200">
          <div 
            className={`h-full transition-all duration-100 ease-linear ${progressColor}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

// Toast Container Component
export const ToastContainer = ({ toasts = [], removeToast }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {toasts.map((toast, index) => (
        <div 
          key={toast.id} 
          className="pointer-events-auto"
          style={{ 
            transform: `translateY(${index * 80}px)` 
          }}
        >
          <Toast
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now() + Math.random();
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);
    
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  // Convenience methods
  const success = (title, message, options = {}) => 
    addToast({ type: 'success', title, message, ...options });

  const error = (title, message, options = {}) => 
    addToast({ type: 'error', title, message, duration: 0, ...options });

  const warning = (title, message, options = {}) => 
    addToast({ type: 'warning', title, message, ...options });

  const info = (title, message, options = {}) => 
    addToast({ type: 'info', title, message, ...options });

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info
  };
};

export default Toast;
