import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Configure axios defaults
axios.defaults.withCredentials = true;

// Create axios instance for user API
const userApi = axios.create({
  baseURL: `${API_URL}/api/users`,
  withCredentials: true,
});

// Admin User Management APIs
export const adminUserApi = {
  // Get all users
  getAllUsers: async () => {
    try {
      const response = await userApi.get('/users');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch users';
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    try {
      const response = await userApi.get(`/admin/${userId}`);
      return response.data.user;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch user';
    }
  },

  // Update user (admin)
  updateUser: async (userId, updateData) => {
    try {
      const response = await userApi.put(`/admin/${userId}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update user';
    }
  },

  // Delete user (admin)
  deleteUser: async (userId) => {
    try {
      const response = await userApi.delete(`/admin/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to delete user';
    }
  },

  // Bulk update users (placeholder for future implementation)
  bulkUpdateUsers: async (userIds, action) => {
    try {
      // This would need to be implemented on the backend
      const promises = userIds.map(userId => {
        switch (action) {
          case 'suspend':
            return userApi.put(`/admin/${userId}`, { status: 'suspended' });
          case 'activate':
            return userApi.put(`/admin/${userId}`, { status: 'active' });
          case 'delete':
            return userApi.delete(`/admin/${userId}`);
          default:
            throw new Error('Invalid bulk action');
        }
      });
      
      await Promise.all(promises);
      return { message: `Bulk ${action} completed successfully` };
    } catch (error) {
      throw error.response?.data?.message || `Failed to perform bulk ${action}`;
    }
  }
};

// Regular User APIs
export const userApiService = {
  // Get current user profile
  getProfile: async () => {
    try {
      const response = await userApi.get('/getuser');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch profile';
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await userApi.put('/profile', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to update profile';
    }
  },

  // Get user balance
  getBalance: async () => {
    try {
      const response = await userApi.get('/sell-amount');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to fetch balance';
    }
  }
};

export default {
  admin: adminUserApi,
  user: userApiService
};
