import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5002/api';

// Configure axios defaults
axios.defaults.withCredentials = true;

// Initial state
const initialState = {
  auctions: [],
  currentAuction: null,
  liveAuctions: [],
  upcomingAuctions: [],
  endedAuctions: [],
  isLoading: false,
  error: null,
  message: null,
};

// Async thunks
export const getAllAuctions = createAsyncThunk(
  'auction/getAllAuctions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await axios.get(`${API_URL}/auction?${queryParams}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch auctions');
    }
  }
);

export const getAuctionById = createAsyncThunk(
  'auction/getAuctionById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/auction/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch auction');
    }
  }
);

export const createAuction = createAsyncThunk(
  'auction/createAuction',
  async (auctionData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auction`, auctionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create auction');
    }
  }
);

export const updateAuction = createAsyncThunk(
  'auction/updateAuction',
  async ({ id, auctionData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/auction/${id}`, auctionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update auction');
    }
  }
);

export const deleteAuction = createAsyncThunk(
  'auction/deleteAuction',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/auction/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete auction');
    }
  }
);

export const getLiveAuctions = createAsyncThunk(
  'auction/getLiveAuctions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/auction/live`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch live auctions');
    }
  }
);

export const getUpcomingAuctions = createAsyncThunk(
  'auction/getUpcomingAuctions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/auction/upcoming`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch upcoming auctions');
    }
  }
);

export const getEndedAuctions = createAsyncThunk(
  'auction/getEndedAuctions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/auction/ended`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch ended auctions');
    }
  }
);

export const startAuction = createAsyncThunk(
  'auction/startAuction',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auction/${id}/start`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start auction');
    }
  }
);

export const endAuction = createAsyncThunk(
  'auction/endAuction',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auction/${id}/end`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to end auction');
    }
  }
);

// Auction slice
const auctionSlice = createSlice({
  name: 'auction',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    setCurrentAuction: (state, action) => {
      state.currentAuction = action.payload;
    },
    updateAuctionStatus: (state, action) => {
      const { auctionId, status } = action.payload;
      const auction = state.auctions.find(a => a._id === auctionId);
      if (auction) {
        auction.status = status;
      }
      if (state.currentAuction && state.currentAuction._id === auctionId) {
        state.currentAuction.status = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all auctions
      .addCase(getAllAuctions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllAuctions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.auctions = action.payload;
      })
      .addCase(getAllAuctions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get auction by ID
      .addCase(getAuctionById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAuctionById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentAuction = action.payload;
      })
      .addCase(getAuctionById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create auction
      .addCase(createAuction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createAuction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.auctions.push(action.payload);
        state.message = 'Auction created successfully';
      })
      .addCase(createAuction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update auction
      .addCase(updateAuction.fulfilled, (state, action) => {
        const index = state.auctions.findIndex(a => a._id === action.payload._id);
        if (index !== -1) {
          state.auctions[index] = action.payload;
        }
        state.message = 'Auction updated successfully';
      })
      // Delete auction
      .addCase(deleteAuction.fulfilled, (state, action) => {
        state.auctions = state.auctions.filter(a => a._id !== action.payload);
        state.message = 'Auction deleted successfully';
      })
      // Get live auctions
      .addCase(getLiveAuctions.fulfilled, (state, action) => {
        state.liveAuctions = action.payload;
      })
      // Get upcoming auctions
      .addCase(getUpcomingAuctions.fulfilled, (state, action) => {
        state.upcomingAuctions = action.payload;
      })
      // Get ended auctions
      .addCase(getEndedAuctions.fulfilled, (state, action) => {
        state.endedAuctions = action.payload;
      })
      // Start auction
      .addCase(startAuction.fulfilled, (state, action) => {
        const index = state.auctions.findIndex(a => a._id === action.payload._id);
        if (index !== -1) {
          state.auctions[index] = action.payload;
        }
        state.message = 'Auction started successfully';
      })
      // End auction
      .addCase(endAuction.fulfilled, (state, action) => {
        const index = state.auctions.findIndex(a => a._id === action.payload._id);
        if (index !== -1) {
          state.auctions[index] = action.payload;
        }
        state.message = 'Auction ended successfully';
      });
  },
});

export const { clearError, clearMessage, setCurrentAuction, updateAuctionStatus } = auctionSlice.actions;
export default auctionSlice.reducer;
