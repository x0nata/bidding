// Error monitoring utility for tracking and logging errors

/**
 * Log listing creation errors for debugging and monitoring
 * @param {string} stage - The stage where the error occurred
 * @param {Error} error - The error object
 * @param {object} context - Additional context information
 */
export const logListingError = (stage, error, context = {}) => {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    stage,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    context,
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  // Log to console for development
  console.error('Listing Error:', errorInfo);

  // Store in localStorage for debugging (keep last 10 errors)
  try {
    const existingErrors = JSON.parse(localStorage.getItem('listing_errors') || '[]');
    existingErrors.unshift(errorInfo);
    
    // Keep only the most recent 10 errors
    const recentErrors = existingErrors.slice(0, 10);
    localStorage.setItem('listing_errors', JSON.stringify(recentErrors));
  } catch (storageError) {
    console.warn('Failed to store error in localStorage:', storageError);
  }

  // In production, you could send this to an error monitoring service
  // Example: Sentry, LogRocket, or custom error tracking endpoint
  if (process.env.NODE_ENV === 'production') {
    // sendToErrorMonitoringService(errorInfo);
  }

  return errorInfo;
};

/**
 * Get stored listing errors from localStorage
 * @returns {Array} Array of stored error objects
 */
export const getStoredListingErrors = () => {
  try {
    return JSON.parse(localStorage.getItem('listing_errors') || '[]');
  } catch (error) {
    console.warn('Failed to retrieve stored errors:', error);
    return [];
  }
};

/**
 * Clear stored listing errors
 */
export const clearStoredListingErrors = () => {
  try {
    localStorage.removeItem('listing_errors');
  } catch (error) {
    console.warn('Failed to clear stored errors:', error);
  }
};

/**
 * Log general application errors
 * @param {string} component - Component where error occurred
 * @param {Error} error - The error object
 * @param {object} context - Additional context
 */
export const logApplicationError = (component, error, context = {}) => {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    component,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    context,
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  console.error('Application Error:', errorInfo);

  // Store in localStorage for debugging
  try {
    const existingErrors = JSON.parse(localStorage.getItem('app_errors') || '[]');
    existingErrors.unshift(errorInfo);
    
    // Keep only the most recent 20 errors
    const recentErrors = existingErrors.slice(0, 20);
    localStorage.setItem('app_errors', JSON.stringify(recentErrors));
  } catch (storageError) {
    console.warn('Failed to store application error:', storageError);
  }

  return errorInfo;
};

/**
 * Create an error boundary handler
 * @param {string} componentName - Name of the component
 * @returns {Function} Error handler function
 */
export const createErrorHandler = (componentName) => {
  return (error, errorInfo) => {
    logApplicationError(componentName, error, { errorInfo });
  };
};

export default {
  logListingError,
  getStoredListingErrors,
  clearStoredListingErrors,
  logApplicationError,
  createErrorHandler
};
