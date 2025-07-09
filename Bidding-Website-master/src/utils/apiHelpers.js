// Common API helper functions to reduce code duplication

import { showError, showSuccess } from '../redux/slices/notificationSlice';

// Common error handler for API calls
export const handleApiError = (error, dispatch, defaultMessage = 'An error occurred') => {
  const message = error.response?.data?.message || error.message || defaultMessage;
  dispatch(showError(message));
  return message;
};

// Common success handler for API calls
export const handleApiSuccess = (message, dispatch) => {
  dispatch(showSuccess(message));
};

// Generic API call wrapper with error handling
export const apiCall = async (apiFunction, dispatch, successMessage = null, errorMessage = null) => {
  try {
    const response = await apiFunction();
    if (successMessage) {
      handleApiSuccess(successMessage, dispatch);
    }
    return { success: true, data: response.data };
  } catch (error) {
    const message = handleApiError(error, dispatch, errorMessage);
    return { success: false, error: message };
  }
};

// Form submission helper with loading state
export const handleFormSubmission = async (
  apiFunction,
  dispatch,
  setLoading,
  successMessage = 'Operation completed successfully',
  errorMessage = null,
  onSuccess = null
) => {
  setLoading(true);
  
  try {
    const result = await apiCall(apiFunction, dispatch, successMessage, errorMessage);
    
    if (result.success && onSuccess) {
      onSuccess(result.data);
    }
    
    return result;
  } finally {
    setLoading(false);
  }
};

// Fetch data with loading and error handling
export const fetchData = async (
  apiFunction,
  setData,
  setLoading,
  dispatch,
  errorMessage = 'Failed to fetch data'
) => {
  setLoading(true);
  
  try {
    const result = await apiCall(apiFunction, dispatch, null, errorMessage);
    
    if (result.success) {
      setData(result.data);
    }
    
    return result;
  } finally {
    setLoading(false);
  }
};

// File upload helper
export const uploadFiles = async (files, endpoint, dispatch, onProgress = null) => {
  const formData = new FormData();
  
  files.forEach((file, index) => {
    formData.append(`file${index}`, file);
  });
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      onUploadProgress: onProgress
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    handleApiSuccess('Files uploaded successfully', dispatch);
    return { success: true, data };
  } catch (error) {
    handleApiError(error, dispatch, 'Failed to upload files');
    return { success: false, error: error.message };
  }
};

// Pagination helper
export const createPaginationParams = (page = 1, limit = 10, filters = {}) => {
  return {
    page,
    limit,
    ...filters
  };
};

// Search helper
export const createSearchParams = (query, filters = {}) => {
  return {
    q: query,
    ...filters
  };
};

// Common loading states
export const LoadingStates = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

// Loading state manager
export class LoadingStateManager {
  constructor(initialState = LoadingStates.IDLE) {
    this.state = initialState;
    this.listeners = [];
  }
  
  setState(newState) {
    this.state = newState;
    this.listeners.forEach(listener => listener(newState));
  }
  
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  isLoading() {
    return this.state === LoadingStates.LOADING;
  }
  
  isError() {
    return this.state === LoadingStates.ERROR;
  }
  
  isSuccess() {
    return this.state === LoadingStates.SUCCESS;
  }
}

// Debounce helper for search
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Format error messages for display
export const formatErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  if (error.response?.data?.message) return error.response.data.message;
  return 'An unexpected error occurred';
};

// Retry mechanism for failed API calls
export const retryApiCall = async (apiFunction, maxRetries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiFunction();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
};

// Cache helper for API responses
export class ApiCache {
  constructor(ttl = 5 * 60 * 1000) { // 5 minutes default TTL
    this.cache = new Map();
    this.ttl = ttl;
  }
  
  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  clear() {
    this.cache.clear();
  }
  
  delete(key) {
    this.cache.delete(key);
  }
}

// Create a global cache instance
export const apiCache = new ApiCache();

// Cached API call wrapper
export const cachedApiCall = async (key, apiFunction, useCache = true) => {
  if (useCache) {
    const cached = apiCache.get(key);
    if (cached) {
      return cached;
    }
  }
  
  const result = await apiFunction();
  
  if (useCache && result) {
    apiCache.set(key, result);
  }
  
  return result;
};
