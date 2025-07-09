import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5002/api';

// Initial state
const initialState = {
  isOnboardingCompleted: false,
  currentStep: 0,
  totalSteps: 0,
  onboardingData: {},
  isLoading: false,
  error: null,
};

// Async thunks
export const completeOnboarding = createAsyncThunk(
  'onboarding/complete',
  async (onboardingData, { rejectWithValue }) => {
    try {
      // In a real app, this would save to backend
      // For now, we'll store in localStorage
      localStorage.setItem('onboardingCompleted', 'true');
      localStorage.setItem('onboardingData', JSON.stringify(onboardingData));
      return onboardingData;
    } catch (error) {
      return rejectWithValue('Failed to complete onboarding');
    }
  }
);

export const checkOnboardingStatus = createAsyncThunk(
  'onboarding/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      // In a real app, this would check backend
      // For now, we'll check localStorage
      const isCompleted = localStorage.getItem('onboardingCompleted') === 'true';
      const data = localStorage.getItem('onboardingData');
      return {
        isCompleted,
        data: data ? JSON.parse(data) : {}
      };
    } catch (error) {
      return rejectWithValue('Failed to check onboarding status');
    }
  }
);

export const resetOnboarding = createAsyncThunk(
  'onboarding/reset',
  async (_, { rejectWithValue }) => {
    try {
      localStorage.removeItem('onboardingCompleted');
      localStorage.removeItem('onboardingData');
      return {};
    } catch (error) {
      return rejectWithValue('Failed to reset onboarding');
    }
  }
);

// Onboarding slice
const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },
    setTotalSteps: (state, action) => {
      state.totalSteps = action.payload;
    },
    updateOnboardingData: (state, action) => {
      state.onboardingData = { ...state.onboardingData, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    skipOnboarding: (state) => {
      state.isOnboardingCompleted = true;
      localStorage.setItem('onboardingCompleted', 'true');
    }
  },
  extraReducers: (builder) => {
    builder
      // Complete onboarding
      .addCase(completeOnboarding.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(completeOnboarding.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isOnboardingCompleted = true;
        state.onboardingData = action.payload;
      })
      .addCase(completeOnboarding.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Check onboarding status
      .addCase(checkOnboardingStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkOnboardingStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isOnboardingCompleted = action.payload.isCompleted;
        state.onboardingData = action.payload.data;
      })
      .addCase(checkOnboardingStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Reset onboarding
      .addCase(resetOnboarding.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetOnboarding.fulfilled, (state) => {
        state.isLoading = false;
        state.isOnboardingCompleted = false;
        state.currentStep = 0;
        state.onboardingData = {};
      })
      .addCase(resetOnboarding.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setCurrentStep,
  setTotalSteps,
  updateOnboardingData,
  clearError,
  skipOnboarding
} = onboardingSlice.actions;

export default onboardingSlice.reducer;
