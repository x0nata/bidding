import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5002/api';

// Configure axios defaults
axios.defaults.withCredentials = true;

// Initial state
const initialState = {
  products: [],
  userProducts: [],
  adminProducts: [],
  currentProduct: null,
  currentAuctionBids: [],
  wonProducts: [],
  activeAuctions: [],
  upcomingAuctions: [],
  isLoading: false,
  error: null,
  message: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  filters: {
    category: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    minPrice: '',
    maxPrice: '',
    condition: '',
    era: '',
    authenticity: '',
  },

};

// Async thunks
export const getAllProducts = createAsyncThunk(
  'product/getAllProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await axios.get(`${API_URL}/product?${queryParams}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const getProductById = createAsyncThunk(
  'product/getProductById',
  async (id, { rejectWithValue }) => {
    try {
      // First try to get detailed auction data
      try {
        const auctionResponse = await axios.get(`${API_URL}/product/auctions/${id}/details`);
        if (auctionResponse.data && auctionResponse.data.auction) {
          return auctionResponse.data.auction;
        }
      } catch (auctionError) {
        // If auction endpoint fails, fall back to regular product endpoint
      }

      // Fallback to regular product endpoint
      const response = await axios.get(`${API_URL}/product/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product');
    }
  }
);

export const createProduct = createAsyncThunk(
  'product/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      // Handle each field appropriately
      Object.keys(productData).forEach(key => {
        const value = productData[key];

        if (key === 'image' && value instanceof File) {
          // Handle single image file
          formData.append('image', value);
        } else if (key === 'images' && Array.isArray(value)) {
          // Handle multiple images
          value.forEach(file => {
            if (file instanceof File) {
              formData.append('images', file);
            }
          });
        } else if (key === 'materials' && Array.isArray(value)) {
          // Handle materials array
          formData.append('materials', JSON.stringify(value));
        } else if (key === 'techniques' && Array.isArray(value)) {
          // Handle techniques array
          formData.append('techniques', JSON.stringify(value));
        } else if (key === 'maker' && typeof value === 'object' && value !== null) {
          // Handle maker object
          formData.append('maker', JSON.stringify(value));
        } else if (value !== null && value !== undefined && value !== '') {
          // Handle all other fields
          formData.append(key, value);
        }
      });

      // Add timeout to the request
      const response = await axios.post(`${API_URL}/product`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000, // 30 second timeout
        validateStatus: function (status) {
          return status < 500; // Resolve only if the status code is less than 500
        }
      });

      // Check if response indicates success
      if (response.status >= 400) {
        throw new Error(response.data?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.data;
    } catch (error) {

      // Handle different types of errors
      let errorMessage = 'Failed to create product';

      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please check your connection.';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.response?.status === 413) {
        errorMessage = 'File too large. Please reduce image sizes and try again.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Invalid data provided.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in and try again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return rejectWithValue(errorMessage);
    }
  }
);

export const updateProduct = createAsyncThunk(
  'product/updateProduct',
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      Object.keys(productData).forEach(key => {
        if (key === 'images' && Array.isArray(productData[key])) {
          productData[key].forEach(file => formData.append('images', file));
        } else {
          formData.append(key, productData[key]);
        }
      });
      
      const response = await axios.put(`${API_URL}/product/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'product/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/product/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete product');
    }
  }
);

export const getUserProducts = createAsyncThunk(
  'product/getUserProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/product/user`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user products');
    }
  }
);





// Action to update a specific user listing (for WebSocket updates)
export const updateUserListing = createAsyncThunk(
  'product/updateUserListing',
  async ({ productId, updateData }, { rejectWithValue }) => {
    try {
      // This would typically come from WebSocket, but we can also fetch fresh data
      const response = await axios.get(`${API_URL}/product/auctions/${productId}/details`);
      return { productId, data: response.data.auction };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update listing');
    }
  }
);

export const getWonProducts = createAsyncThunk(
  'product/getWonProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/product/won`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch won products');
    }
  }
);

export const getActiveAuctions = createAsyncThunk(
  'product/getActiveAuctions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/product/auctions/active`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch active auctions');
    }
  }
);

export const getUpcomingAuctions = createAsyncThunk(
  'product/getUpcomingAuctions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/product/auctions/upcoming`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch upcoming auctions');
    }
  }
);

export const getAuctionDetails = createAsyncThunk(
  'product/getAuctionDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/product/auctions/${id}/details`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch auction details');
    }
  }
);

// Product slice
const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setCurrentProduct: (state, action) => {
      state.currentProduct = action.payload;
    },


    clearUserListingsError: (state) => {
      state.userListings.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all products
      .addCase(getAllProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllProducts.fulfilled, (state, action) => {
        state.isLoading = false;

        // Handle different response structures from backend
        const productsData = action.payload.products || action.payload;

        // Ensure we have an array
        if (Array.isArray(productsData)) {
          // Smart merge: preserve recently added user products that might not be in the API response yet
          const recentUserProducts = state.userProducts.filter(userProduct => {
            const isRecent = new Date(userProduct.createdAt) > new Date(Date.now() - 300000); // 5 minutes
            const notInApiResponse = !productsData.find(apiProduct => apiProduct._id === userProduct._id);
            return isRecent && notInApiResponse;
          });

          // Merge API products with recent user products, avoiding duplicates
          const existingIds = new Set(productsData.map(p => p._id));
          const uniqueRecentProducts = recentUserProducts.filter(p => !existingIds.has(p._id));

          // Combine and sort by creation date (newest first)
          state.products = [...uniqueRecentProducts, ...productsData].sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
          );

        } else {
          // Even if API fails, preserve recent user products
          const recentUserProducts = state.userProducts.filter(userProduct => {
            return new Date(userProduct.createdAt) > new Date(Date.now() - 300000); // 5 minutes
          });
          state.products = recentUserProducts;
        }

        state.pagination = action.payload.pagination || initialState.pagination;

        // Log sample data for debugging
        if (state.products.length > 0) {
          // Sample data logged
        }
      })
      .addCase(getAllProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get product by ID
      .addCase(getProductById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
      })
      .addCase(getProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create product
      .addCase(createProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle backend response structure (action.payload.data or action.payload)
        const newProduct = action.payload.data || action.payload;

        // Ensure the product has required fields for homepage display
        const productWithDefaults = {
          ...newProduct,
          createdAt: newProduct.createdAt || new Date().toISOString(),
          auctionEndDate: newProduct.auctionEndDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default 7 days from now
          isSoldout: false,
          isActive: true,
          // Add fields needed for My Listings display
          currentBid: newProduct.startingBid || newProduct.price || 0,
          totalBids: 0,
          auctionStatus: 'active', // New listings are typically active
          timeRemaining: newProduct.auctionEndDate ? new Date(newProduct.auctionEndDate).getTime() - Date.now() : null
        };

        // Add to both userProducts and main products array for immediate homepage display
        state.userProducts.push(productWithDefaults);
        state.products.unshift(productWithDefaults); // Add to beginning for newest first



        // Also add to activeAuctions if it's an active auction
        if (productWithDefaults.auctionEndDate && new Date(productWithDefaults.auctionEndDate) > new Date()) {
          state.activeAuctions.unshift(productWithDefaults);
        }

        state.message = 'Product created successfully';
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update in both userProducts and main products array
        const userIndex = state.userProducts.findIndex(p => p._id === action.payload._id);
        if (userIndex !== -1) {
          state.userProducts[userIndex] = action.payload;
        }
        const productIndex = state.products.findIndex(p => p._id === action.payload._id);
        if (productIndex !== -1) {
          state.products[productIndex] = action.payload;
        }
        state.message = 'Product updated successfully';
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        // Remove from both userProducts and main products array
        state.userProducts = state.userProducts.filter(p => p._id !== action.payload);
        state.products = state.products.filter(p => p._id !== action.payload);
        state.message = 'Product deleted successfully';
      })
      // Get user products
      .addCase(getUserProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        // Ensure we always have an array
        state.userProducts = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getUserProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        // Keep existing userProducts on error
        state.userProducts = Array.isArray(state.userProducts) ? state.userProducts : [];
      })


      // Get won products
      .addCase(getWonProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getWonProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        // Ensure we always have an array
        state.wonProducts = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getWonProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        // Keep existing wonProducts on error
        state.wonProducts = Array.isArray(state.wonProducts) ? state.wonProducts : [];
      })
      // Get active auctions
      .addCase(getActiveAuctions.fulfilled, (state, action) => {
        // Ensure we have an array
        if (Array.isArray(action.payload)) {
          // Smart merge: preserve recently added user auctions that might not be in the API response yet
          const recentUserAuctions = state.userProducts.filter(userProduct => {
            const isRecent = new Date(userProduct.createdAt) > new Date(Date.now() - 300000); // 5 minutes
            const isActiveAuction = userProduct.auctionEndDate && new Date(userProduct.auctionEndDate) > new Date();
            const notInApiResponse = !action.payload.find(apiAuction => apiAuction._id === userProduct._id);
            return isRecent && isActiveAuction && notInApiResponse;
          });

          // Merge API auctions with recent user auctions, avoiding duplicates
          const existingIds = new Set(action.payload.map(a => a._id));
          const uniqueRecentAuctions = recentUserAuctions.filter(a => !existingIds.has(a._id));

          // Combine and sort by creation date (newest first)
          state.activeAuctions = [...uniqueRecentAuctions, ...action.payload].sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
          );


          // Log sample data for debugging
          if (state.activeAuctions.length > 0) {
            // Sample data logged
          }
        } else {
          state.activeAuctions = [];
        }
      })
      // Get upcoming auctions
      .addCase(getUpcomingAuctions.fulfilled, (state, action) => {
        state.upcomingAuctions = action.payload;
      })
      // Get auction details
      .addCase(getAuctionDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAuctionDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        // Store both auction and bids data
        if (action.payload.auction) {
          state.currentProduct = action.payload.auction;
        }
        // Store bids in a separate field for easy access
        state.currentAuctionBids = action.payload.bids || [];
      })
      .addCase(getAuctionDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearMessage,
  setFilters,
  clearFilters,
  setCurrentProduct,

} = productSlice.actions;



export default productSlice.reducer;
