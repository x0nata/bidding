// Common data fetching patterns to reduce code duplication

import { toast } from 'react-toastify';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

// Common fetch wrapper with error handling
export const fetchWithErrorHandling = async (url, options = {}) => {
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Generic data fetchers
export const fetchCategories = async () => {
  try {
    return await fetchWithErrorHandling(`${API_BASE_URL}/api/category/hierarchy`);
  } catch (error) {
    toast.error('Failed to load categories');
    throw error;
  }
};

export const fetchProducts = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add all non-empty parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const url = `${API_BASE_URL}/api/product${queryParams.toString() ? `?${queryParams}` : ''}`;
    return await fetchWithErrorHandling(url);
  } catch (error) {
    toast.error('Failed to load products');
    throw error;
  }
};

export const fetchProductById = async (id) => {
  try {
    return await fetchWithErrorHandling(`${API_BASE_URL}/product/${id}`);
  } catch (error) {
    toast.error('Failed to load product details');
    throw error;
  }
};

// Verify product exists in database (without showing error toast)
export const verifyProductExists = async (id) => {
  try {
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/product/${id}`);
    return response && response._id === id;
  } catch (error) {
    return false;
  }
};

// Verify product appears in listings (without showing error toast)
export const verifyProductInListings = async (id) => {
  try {
    // ✅ FIXED: Added /api prefix to match backend routes
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/api/product`);
    const products = response.products || [];
    return products.some(product => product._id === id);
  } catch (error) {
    return false;
  }
};

export const fetchAuctionDetails = async (auctionId) => {
  try {
    // ✅ FIXED: Added /api prefix to match backend routes
    return await fetchWithErrorHandling(`${API_BASE_URL}/api/product/auctions/${auctionId}/details`);
  } catch (error) {
    toast.error('Failed to load auction details');
    throw error;
  }
};

export const fetchUserProfile = async () => {
  try {
    // ✅ FIXED: Added /api prefix to match backend routes
    return await fetchWithErrorHandling(`${API_BASE_URL}/api/users/getuser`);
  } catch (error) {
    toast.error('Failed to load user profile');
    throw error;
  }
};

export const fetchWatchlist = async () => {
  try {
    // ✅ FIXED: Added /api prefix - Note: This endpoint may not exist in backend
    return await fetchWithErrorHandling(`${API_BASE_URL}/api/users/watchlist`);
  } catch (error) {
    toast.error('Failed to load watchlist');
    throw error;
  }
};

export const fetchBidHistory = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params);
    // ✅ FIXED: Use correct bidding endpoint
    return await fetchWithErrorHandling(`${API_BASE_URL}/api/bidding/user/activity?${queryParams}`);
  } catch (error) {
    toast.error('Failed to load bid history');
    throw error;
  }
};

export const fetchSalesHistory = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params);
    // ✅ FIXED: Use dedicated sales history endpoint
    return await fetchWithErrorHandling(`${API_BASE_URL}/api/users/sales-history?${queryParams}`);
  } catch (error) {
    toast.error('Failed to load sales history');
    throw error;
  }
};

// Admin-specific data fetchers
export const fetchAllUsers = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params);
    // ✅ FIXED: Use correct admin users endpoint
    return await fetchWithErrorHandling(`${API_BASE_URL}/api/users/users?${queryParams}`);
  } catch (error) {
    toast.error('Failed to load users');
    throw error;
  }
};

export const fetchAllAuctions = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params);
    // ✅ FIXED: Use correct admin auctions endpoint
    return await fetchWithErrorHandling(`${API_BASE_URL}/api/product/admin/auctions?${queryParams}`);
  } catch (error) {
    toast.error('Failed to load auctions');
    throw error;
  }
};

export const fetchDashboardStats = async () => {
  try {
    // ✅ FIXED: Use available admin endpoint for income estimation
    return await fetchWithErrorHandling(`${API_BASE_URL}/api/users/estimate-income`);
  } catch (error) {
    toast.error('Failed to load dashboard statistics');
    throw error;
  }
};

// Data submission functions
export const submitProductListing = async (formData) => {
  try {
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/api/product`, {
      method: 'POST',
      body: formData instanceof FormData ? formData : JSON.stringify(formData),
      headers: formData instanceof FormData ? {} : { 'Content-Type': 'application/json' }
    });

    // Verify the response contains the expected data structure
    if (!response.success || !response.data || !response.data._id) {
      throw new Error('Invalid response from server - product may not have been saved');
    }

    // Don't show success message here - let the calling component handle it
    // after proper verification
    return { success: true, data: response.data };
  } catch (error) {
    toast.error(error.message || 'Failed to create listing');
    return { success: false, error: error.message };
  }
};

export const submitBid = async (auctionId, bidAmount) => {
  try {
    // ✅ FIXED: Use correct bidding endpoint
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/api/bidding`, {
      method: 'POST',
      body: JSON.stringify({ auctionId, bidAmount })
    });

    toast.success('Bid placed successfully!');
    return { success: true, data: response };
  } catch (error) {
    toast.error(error.message || 'Failed to place bid');
    return { success: false, error: error.message };
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/user/profile`, {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
    
    toast.success('Profile updated successfully!');
    return { success: true, data: response };
  } catch (error) {
    toast.error(error.message || 'Failed to update profile');
    return { success: false, error: error.message };
  }
};

export const addToWatchlist = async (productId) => {
  try {
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/user/watchlist`, {
      method: 'POST',
      body: JSON.stringify({ productId })
    });
    
    toast.success('Added to watchlist!');
    return { success: true, data: response };
  } catch (error) {
    toast.error(error.message || 'Failed to add to watchlist');
    return { success: false, error: error.message };
  }
};



// File upload helper
export const uploadFiles = async (files, endpoint = '/upload') => {
  try {
    const formData = new FormData();
    
    if (Array.isArray(files)) {
      files.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });
    } else {
      formData.append('file', files);
    }
    
    const response = await fetchWithErrorHandling(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    });
    
    return { success: true, data: response };
  } catch (error) {
    toast.error(error.message || 'Failed to upload files');
    return { success: false, error: error.message };
  }
};

// Search functionality
export const searchProducts = async (query, filters = {}) => {
  try {
    const params = {
      search: query,
      ...filters
    };
    
    return await fetchProducts(params);
  } catch (error) {
    toast.error('Search failed');
    throw error;
  }
};

// Authentication helpers
export const loginUser = async (credentials) => {
  try {
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/api/users/login`, {
      method: 'POST',
      body: JSON.stringify(credentials)
    });

    toast.success('Login successful!');
    return { success: true, data: response };
  } catch (error) {
    toast.error(error.message || 'Login failed');
    return { success: false, error: error.message };
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await fetchWithErrorHandling(`${API_BASE_URL}/api/users/register`, {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    toast.success('Registration successful!');
    return { success: true, data: response };
  } catch (error) {
    toast.error(error.message || 'Registration failed');
    return { success: false, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await fetchWithErrorHandling(`${API_BASE_URL}/api/users/logout`, {
      method: 'POST'
    });
    
    toast.success('Logged out successfully!');
    return { success: true };
  } catch (error) {
    toast.error(error.message || 'Logout failed');
    return { success: false, error: error.message };
  }
};
