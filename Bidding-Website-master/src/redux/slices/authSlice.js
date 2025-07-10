import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// ✅ FIXED: Remove /api suffix since it's added in the endpoint URLs
const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5002';

// Configure axios defaults
axios.defaults.withCredentials = true;

// Note: Token handling is done in api.js interceptor to avoid conflicts

// Initialize state from localStorage if available
const getInitialState = () => {
  try {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      const user = JSON.parse(userData);
      console.log('Initializing auth state from localStorage, user role:', user?.role);
      return {
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        message: null,
      };
    }
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
    // Clear corrupted data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    message: null,
  };
};

// Initial state
const initialState = getInitialState();

// Async thunks
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/users/register`, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/users/login`, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axios.get(`${API_URL}/api/users/logout`);
      return {};
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      // Check if we have a token in localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        return null;
      }

      // First check if the token is valid
      const statusResponse = await axios.get(`${API_URL}/api/users/loggedin`);
      console.log('Auth status response:', statusResponse.data);

      if (statusResponse.data) {
        // If valid, get user data
        const userResponse = await axios.get(`${API_URL}/api/users/getuser`);
        console.log('User data response:', userResponse.data);
        return userResponse.data;
      }

      // If token is invalid, clear it
      localStorage.removeItem('token');
      return null;
    } catch (error) {
      // Clear invalid token
      localStorage.removeItem('token');
      return null; // Don't reject, just return null for failed auth check
    }
  }
);

export const loginAsSeller = createAsyncThunk(
  'auth/loginAsSeller',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/users/seller`, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Seller login failed');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/api/users/profile`, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Profile update failed');
    }
  }
);

export const refreshUserData = createAsyncThunk(
  'auth/refreshUserData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/users/getuser`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to refresh user data');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.message = action.payload.message;

        // Store token in localStorage if provided
        if (action.payload.token) {
          localStorage.setItem('token', action.payload.token);
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle both response formats: direct user object or wrapped in user property
        state.user = action.payload.user || action.payload;
        state.isAuthenticated = true;
        state.message = action.payload.message || 'Login successful';

        // Store token and user data in localStorage if provided
        if (action.payload.token) {
          localStorage.setItem('token', action.payload.token);
        }

        // Store user data for persistence across page refreshes
        localStorage.setItem('user', JSON.stringify(state.user));

        console.log('Login successful, user role:', state.user?.role);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.message = 'Logged out successfully';

        // Clear all auth data from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.log('Logout successful, cleared localStorage');
      })
      // Check auth status
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
          state.isLoading = false;
          // Update localStorage with fresh user data
          localStorage.setItem('user', JSON.stringify(action.payload));
          console.log('Auth status check successful, user role:', action.payload?.role);
        } else {
          state.user = null;
          state.isAuthenticated = false;
          state.isLoading = false;
          // Clear localStorage if auth check fails
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          console.log('Auth status check failed, clearing user data');
        }
      })
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        // Clear localStorage on auth check failure
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        console.log('Auth status check rejected, clearing user data');
      })
      // Login as seller
      .addCase(loginAsSeller.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsSeller.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.message = action.payload.message;

        // Store token in localStorage if provided
        if (action.payload.token) {
          localStorage.setItem('token', action.payload.token);
        }
      })
      .addCase(loginAsSeller.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update user profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update user data in real-time
        state.user = { ...state.user, ...action.payload };
        state.message = 'Profile updated successfully';
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Refresh user data
      .addCase(refreshUserData.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      });
  },
});

export const { clearError, clearMessage, setUser } = authSlice.actions;

// Stable selectors to prevent unnecessary re-renders in Vercel
export const selectAuthState = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
  isLoading: state.auth.isLoading,
  userRole: state.auth.user?.role,
  userId: state.auth.user?._id,
  hasUser: !!state.auth.user,
  error: state.auth.error
});

export const selectIsAdmin = (state) => {
  return state.auth.isAuthenticated &&
         state.auth.user &&
         state.auth.user.role === 'admin';
};

export const selectUserStable = (state) => {
  const user = state.auth.user;
  if (!user) return null;

  // Return a stable object with only essential properties
  return {
    id: user._id,
    role: user.role,
    name: user.name,
    email: user.email
  };
};

// Helper functions for admin authentication
export const isAdminUser = (user) => {
  return user && user.role === 'admin';
};

export const getRedirectPath = (user, defaultPath = '/dashboard') => {
  if (isAdminUser(user)) {
    return '/admin/dashboard';
  }
  return defaultPath;
};

export const shouldRedirectToAdmin = (user, currentPath) => {
  if (!isAdminUser(user)) return false;

  // List of user dashboard paths that should redirect admins
  const userDashboardPaths = [
    '/dashboard',
    '/product',
    '/userlist',
    '/winning-products',
    '/add-product',
    '/categories',
    '/income',
    '/transportation',
    '/my-bids',
    '/sales-history',
    '/balance',
    '/profile'
  ];

  return userDashboardPaths.some(path =>
    currentPath === path || currentPath.startsWith(path + '/')
  );
};

export default authSlice.reducer;
