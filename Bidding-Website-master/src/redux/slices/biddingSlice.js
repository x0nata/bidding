import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { addInstantPurchaseNotification } from './notificationSlice';

// Initial state
const initialState = {
  bids: [],
  userBids: [],
  currentBid: null,
  isLoading: false,
  error: null,
  message: null,
};

// Async thunks
export const placeBid = createAsyncThunk(
  'bidding/placeBid',
  async (bidData, { rejectWithValue, dispatch }) => {
    try {
      // Transform the data to match backend expectations
      const payload = {
        productId: bidData.productId,
        price: bidData.amount || bidData.price,
        bidType: bidData.bidType || 'Manual'
      };
      const response = await api.post('/bidding', payload);

      // Check if instant purchase was triggered
      if (response.data.instantPurchase && response.data.auctionEnded) {
        // Dispatch instant purchase notification
        dispatch(addInstantPurchaseNotification({
          productTitle: response.data.product?.title || 'Auction Item',
          finalPrice: response.data.finalPrice,
          productId: bidData.productId,
          winner: response.data.winner
        }));
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to place bid');
    }
  }
);

export const getBidsForProduct = createAsyncThunk(
  'bidding/getBidsForProduct',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/bidding/${productId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bids');
    }
  }
);

export const getUserBids = createAsyncThunk(
  'bidding/getUserBids',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/bidding/user/activity');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user bids');
    }
  }
);

export const setProxyBid = createAsyncThunk(
  'bidding/setProxyBid',
  async (proxyBidData, { rejectWithValue }) => {
    try {
      const response = await api.post('/bidding/proxy', proxyBidData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to set proxy bid');
    }
  }
);

export const cancelProxyBid = createAsyncThunk(
  'bidding/cancelProxyBid',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/bidding/proxy/${productId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel proxy bid');
    }
  }
);

// Bidding slice
const biddingSlice = createSlice({
  name: 'bidding',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    addBid: (state, action) => {
      state.bids.unshift(action.payload);
    },
    updateCurrentBid: (state, action) => {
      state.currentBid = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Place bid
      .addCase(placeBid.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(placeBid.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bids.unshift(action.payload);
        state.currentBid = action.payload;
        state.message = 'Bid placed successfully';
      })
      .addCase(placeBid.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get bids for product
      .addCase(getBidsForProduct.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBidsForProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bids = action.payload;
        state.currentBid = action.payload[0] || null;
      })
      .addCase(getBidsForProduct.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get user bids
      .addCase(getUserBids.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserBids.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle the response structure from backend: { bids: [...], pagination: {...} }
        state.userBids = Array.isArray(action.payload) ? action.payload : (action.payload.bids || []);
      })
      .addCase(getUserBids.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.userBids = []; // Ensure it's always an array
      })
      // Set proxy bid
      .addCase(setProxyBid.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(setProxyBid.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = 'Proxy bid set successfully';
      })
      .addCase(setProxyBid.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Cancel proxy bid
      .addCase(cancelProxyBid.fulfilled, (state, action) => {
        state.message = 'Proxy bid cancelled successfully';
      });
  },
});

export const { clearError, clearMessage, addBid, updateCurrentBid } = biddingSlice.actions;
export default biddingSlice.reducer;
