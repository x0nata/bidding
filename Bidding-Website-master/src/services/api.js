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
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    register: (data) => api.post('/users/register', data),
    login: (data) => api.post('/users/login', data),
    logout: () => api.get('/users/logout'),
    checkAuth: () => api.get('/users/loggedin'),
    getUser: () => api.get('/users/getuser'),
    loginAsSeller: (data) => api.post('/users/seller', data),
    updateProfile: (data) => api.put('/users/profile', data),
    changePassword: (data) => api.put('/users/password', data),
  },

  // Products
  products: {
    getAll: (params) => api.get('/product', { params }),
    getById: (id) => api.get(`/product/${id}`),
    create: (data) => api.post('/product', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, data) => api.put(`/product/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => api.delete(`/product/${id}`),
    getUserProducts: () => api.get('/product/user'),
    getWonProducts: () => api.get('/product/won-products'),
    getActiveAuctions: () => api.get('/product/auctions/active'),
    getUpcomingAuctions: () => api.get('/product/auctions/upcoming'),
    search: (query) => api.get(`/product/search?q=${encodeURIComponent(query)}`),
  },

  // Categories
  categories: {
    getAll: () => api.get('/category'),
    getById: (id) => api.get(`/category/${id}`),
    create: (data) => api.post('/category', data),
    update: (id, data) => api.put(`/category/${id}`, data),
    delete: (id) => api.delete(`/category/${id}`),
  },

  // Bidding
  bidding: {
    placeBid: (data) => api.post('/bidding', data),
    getBidsForProduct: (productId) => api.get(`/bidding/${productId}`),
    getUserBids: () => api.get('/bidding/user/activity'),
    setProxyBid: (data) => api.post('/bidding/proxy', data),
    cancelProxyBid: (productId) => api.delete(`/bidding/proxy/${productId}`),
    getBidHistory: (productId) => api.get(`/bidding/${productId}`),
    getTotalActiveBidsCount: () => api.get('/bidding/stats/active-bids-count'),
    submitDeliveryInfo: (productId, data) => api.post(`/auctions/${productId}/delivery-info`, data),
  },

  // Auctions
  auctions: {
    getAll: (params) => api.get('/auction', { params }),
    getById: (id) => api.get(`/auction/${id}`),
    create: (data) => api.post('/auction', data),
    update: (id, data) => api.put(`/auction/${id}`, data),
    delete: (id) => api.delete(`/auction/${id}`),
    getLive: () => api.get('/auction/live'),
    getUpcoming: () => api.get('/auction/upcoming'),
    getEnded: () => api.get('/auction/ended'),
    start: (id) => api.post(`/auction/${id}/start`),
    end: (id) => api.post(`/auction/${id}/end`),
    endInstantPurchase: (id, data) => api.post(`/auction/${id}/end-instant-purchase`, data),
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
    getUsers: () => api.get('/users/users'),
    // Deprecated - use adminUserApi.updateUser() instead
    updateUser: (id, data) => api.put(`/users/admin/${id}`, data),
    // Deprecated - use adminUserApi.deleteUser() instead
    deleteUser: (id) => api.delete(`/users/admin/${id}`),
    // Deprecated - use adminAnalyticsApi.getSystemStats() instead
    getStats: () => {
      // admin.getStats() is deprecated. Use adminAnalyticsApi.getSystemStats() instead.
      throw new Error('This endpoint does not exist. Use adminAnalyticsApi.getSystemStats() instead.');
    },
    // Not implemented on backend
    getReports: () => api.get('/admin/reports'),
    // Deprecated - use adminProductApi.updateProductStatus() instead
    approveProduct: (id) => api.put(`/product/admin/product-verified/${id}`, { status: 'approved' }),
    // Deprecated - use adminProductApi.updateProductStatus() instead
    rejectProduct: (id) => api.put(`/product/admin/product-verified/${id}`, { status: 'rejected' }),
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
