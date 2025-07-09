import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Create axios instance with default config
const adminApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers['x-auth-token'] = token;
    }
    // Admin API request logging removed for production
    return config;
  },
  (error) => {
    console.error('Admin API request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
adminApi.interceptors.response.use(
  (response) => {
    // Admin API response logging removed for production
    return response;
  },
  (error) => {
    console.error('Admin API response error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// Admin User Management APIs
export const adminUserApi = {
  // Get all users
  getAllUsers: async () => {
    try {
      const response = await adminApi.get('/users/users');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch users';
    }
  },

  // Update user (suspend/activate, role change, etc.)
  updateUser: async (userId, updateData) => {
    try {
      const response = await adminApi.put(`/users/${userId}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update user';
    }
  },

  // Delete user
  deleteUser: async (userId) => {
    try {
      const response = await adminApi.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to delete user';
    }
  },

  // Get user details
  getUserDetails: async (userId) => {
    try {
      const response = await adminApi.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch user details';
    }
  },

  // Bulk user operations
  bulkUpdateUsers: async (userIds, action) => {
    try {
      const response = await adminApi.post('/users/bulk-update', {
        userIds,
        action
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to perform bulk operation';
    }
  }
};

// Admin Product Management APIs
export const adminProductApi = {
  // Get all products for admin
  getAllProducts: async () => {
    try {
      const response = await adminApi.get('/product/admin/products');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch products';
    }
  },

  // Approve/reject product
  updateProductStatus: async (productId, status, comments = '') => {
    try {
      const response = await adminApi.patch(`/product/admin/product-verified/${productId}`, {
        status,
        comments
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update product status';
    }
  },

  // Delete product (admin)
  deleteProduct: async (productId) => {
    try {
      const response = await adminApi.delete(`/product/admin/products`, {
        data: { productIds: productId }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to delete product';
    }
  }
};

// Enhanced Admin Auction Management APIs
export const adminAuctionApi = {
  // Get all auctions with filtering and pagination
  getAllAuctions: async (params = {}) => {
    try {
      const response = await adminApi.get('/product/admin/auctions', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch auctions';
    }
  },

  // Update auction details
  updateAuction: async (auctionId, updateData) => {
    try {
      const response = await adminApi.put(`/product/admin/auctions/${auctionId}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update auction';
    }
  },

  // End auction early
  endAuctionEarly: async (auctionId, reason = '') => {
    try {
      const response = await adminApi.post(`/product/admin/auctions/${auctionId}/end`, { reason });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to end auction';
    }
  },

  // Change auction status (approve, reject, pause, cancel)
  changeAuctionStatus: async (auctionId, status, reason = '') => {
    try {
      const response = await adminApi.patch(`/product/admin/auctions/${auctionId}/status`, {
        status,
        reason
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to change auction status';
    }
  },

  // Get auction bid history
  getAuctionBidHistory: async (auctionId, params = {}) => {
    try {
      const response = await adminApi.get(`/product/admin/auctions/${auctionId}/bids`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch bid history';
    }
  },

  // Delete auction
  deleteAuction: async (auctionId) => {
    try {
      const response = await adminApi.delete(`/product/admin/products`, {
        data: { productIds: auctionId }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to delete auction';
    }
  }
};

// Admin Analytics APIs
export const adminAnalyticsApi = {
  // Get system statistics
  getSystemStats: async () => {
    try {
      const [usersResponse, productsResponse, revenueResponse] = await Promise.all([
        adminApi.get('/users/users'),  // Backend route is actually /users/users - let me check
        adminApi.get('/product'),
        adminApi.get('/users/estimate-income')
      ]);

      const users = usersResponse.data;
      const products = productsResponse.data.products || productsResponse.data || [];
      const revenue = revenueResponse.data.commissionBalance || 0;

      const stats = {
        totalUsers: users.length,
        totalProducts: products.length,
        activeAuctions: products.filter(p => p.auctionStatus === 'active').length,
        completedAuctions: products.filter(p => p.auctionStatus === 'completed').length,
        pendingApprovals: products.filter(p => !p.isverify).length,
        totalRevenue: revenue,
        recentUsers: users.slice(-5).reverse(),
        recentProducts: products.slice(-5).reverse()
      };

      console.log('Computed stats:', stats);
      return stats;
    } catch (error) {
      console.error('Error in getSystemStats:', error);
      throw error.response?.data?.message || error.message || 'Failed to fetch system statistics';
    }
  },

  // Get revenue data
  getRevenueData: async () => {
    try {
      const response = await adminApi.get('/users/estimate-income');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch revenue data';
    }
  }
};

// Admin Certificate Management APIs
export const adminCertificateApi = {
  // Get all certificates for review
  getAllCertificates: async () => {
    try {
      // This would be implemented when certificate system is added
      return [];
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch certificates';
    }
  },

  // Approve/reject certificate
  updateCertificateStatus: async (certificateId, status, comments = '') => {
    try {
      // This would be implemented when certificate system is added
      return { message: 'Certificate status updated' };
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update certificate status';
    }
  }
};

export default {
  users: adminUserApi,
  products: adminProductApi,
  auctions: adminAuctionApi,
  analytics: adminAnalyticsApi,
  certificates: adminCertificateApi
};
