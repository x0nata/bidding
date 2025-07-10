import axios from 'axios';

// Create axios instance with default configuration
// Use multiple environment variable options for backward compatibility
const getBaseURL = () => {
  return process.env.REACT_APP_BACKEND_URL ||
         process.env.REACT_APP_API_URL;
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout for Vercel functions
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available - use x-auth-token to match backend expectations
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const apiEndpoints = {
  // Authentication
  auth: {
    register: (data) => api.post('/api/users/register', data),
    login: (data) => api.post('/api/users/login', data),
    logout: () => api.get('/api/users/logout'),
    checkAuth: () => api.get('/api/users/loggedin'),
    getUser: () => api.get('/api/users/getuser'),
    loginAsSeller: (data) => api.post('/api/users/seller', data),
    updateProfile: (data) => api.put('/api/users/profile', data),
    changePassword: (data) => api.put('/api/users/password', data),
  },

  // Products
  products: {
    getAll: (params) => api.get('/api/product', { params }),
    getById: (id) => api.get(`/api/product/${id}`),
    create: (data) => api.post('/api/product', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, data) => api.put(`/api/product/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => api.delete(`/api/product/${id}`),
    getUserProducts: () => api.get('/api/product/user'),
    getWonProducts: () => api.get('/api/product/won-products'),
    getActiveAuctions: () => api.get('/api/product/auctions/active'),
    getUpcomingAuctions: () => api.get('/api/product/auctions/upcoming'),
    search: (query) => api.get(`/api/product/search?q=${encodeURIComponent(query)}`),
  },

  // Categories
  categories: {
    getAll: () => api.get('/api/category'),
    getById: (id) => api.get(`/api/category/${id}`),
    create: (data) => api.post('/api/category', data),
    update: (id, data) => api.put(`/api/category/${id}`, data),
    delete: (id) => api.delete(`/api/category/${id}`),
  },

  // Bidding
  bidding: {
    placeBid: (data) => api.post('/api/bidding', data),
    getBidsForProduct: (productId) => api.get(`/api/bidding/${productId}`),
    getUserBids: () => api.get('/api/bidding/user/activity'),
    getBidHistory: (productId) => api.get(`/api/bidding/${productId}`),
    getTotalActiveBidsCount: () => api.get('/api/bidding/stats/active-bids-count'),
    // Note: Proxy bidding and delivery info endpoints removed as they don't exist in backend
  },

  // Auctions (handled through product routes in backend)
  auctions: {
    getActive: () => api.get('/api/product/auctions/active'),
    getUpcoming: () => api.get('/api/product/auctions/upcoming'),
    getDetails: (id) => api.get(`/api/product/auctions/${id}/details`),
    // Note: Other auction operations are handled through product endpoints
  },

  // Notifications
  notifications: {
    getAll: () => api.get('/notifications'),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    markAllAsRead: () => api.put('/notifications/mark-all-read'),
    sendInstantPurchaseWinner: (data) => api.post('/notifications/instant-purchase-winner', data),
    sendAuctionEnded: (data) => api.post('/notifications/auction-ended', data),
  },

  // Admin - Note: Use adminApi.js for admin functionality instead
  // These endpoints don't exist on the backend - use adminAnalyticsApi, adminUserApi, etc.
  admin: {
    // Deprecated - use adminUserApi.getAllUsers() instead
    getUsers: () => api.get('/api/users/users'),
    // Deprecated - use adminUserApi.updateUser() instead
    updateUser: (id, data) => api.put(`/api/users/admin/${id}`, data),
    // Deprecated - use adminUserApi.deleteUser() instead
    deleteUser: (id) => api.delete(`/api/users/admin/${id}`),
    // Deprecated - use adminAnalyticsApi.getSystemStats() instead
    getStats: () => {
      // admin.getStats() is deprecated. Use adminAnalyticsApi.getSystemStats() instead.
      throw new Error('This endpoint does not exist. Use adminAnalyticsApi.getSystemStats() instead.');
    },
    // Not implemented on backend
    getReports: () => api.get('/admin/reports'),
    // Deprecated - use adminProductApi.updateProductStatus() instead
    approveProduct: (id) => api.put(`/api/product/admin/product-verified/${id}`, { status: 'approved' }),
    // Deprecated - use adminProductApi.updateProductStatus() instead
    rejectProduct: (id) => api.put(`/api/product/admin/product-verified/${id}`, { status: 'rejected' }),
  },

  // Appraisals
  appraisals: {
    getAll: () => api.get('/appraisal'),
    getById: (id) => api.get(`/appraisal/${id}`),
    create: (data) => api.post('/appraisal', data),
    update: (id, data) => api.put(`/appraisal/${id}`, data),
    delete: (id) => api.delete(`/appraisal/${id}`),
    approve: (id) => api.put(`/appraisal/${id}/approve`),
    reject: (id) => api.put(`/appraisal/${id}/reject`),
  },

  // Documents
  documents: {
    getAll: () => api.get('/document'),
    getById: (id) => api.get(`/document/${id}`),
    upload: (data) => api.post('/document', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => api.delete(`/document/${id}`),
    verify: (id) => api.put(`/document/${id}/verify`),
  },

  // Notifications
  notifications: {
    getAll: () => api.get('/notifications'),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    markAllAsRead: () => api.put('/notifications/read-all'),
    delete: (id) => api.delete(`/notifications/${id}`),
  },



  // Newsletter
  newsletter: {
    subscribe: (data) => api.post('/newsletter/subscribe', data),
    unsubscribe: (token) => api.get(`/newsletter/unsubscribe/${token}`),
    updatePreferences: (token, preferences) => api.put(`/newsletter/preferences/${token}`, { preferences }),
    getStats: () => api.get('/newsletter/stats'),
    getSubscribers: (params = '') => api.get(`/newsletter/subscribers${params}`),
    sendToAll: (data) => api.post('/newsletter/send', data),
  },

  // Contact
  contact: {
    sendMessage: (data) => api.post('/contact/message', data),
    sendImmediateHelp: (data) => api.post('/contact/immediate-help', data),
  },
};

export default api;
