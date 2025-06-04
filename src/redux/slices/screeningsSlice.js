import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { movieAPI } from '../../services/api';

export const fetchScreenings = createAsyncThunk(
  'screenings/fetchScreenings',
  async (_, { rejectWithValue }) => {
    try {
      const screenings = await movieAPI.getScreenings();
      return screenings;
    } catch (error) {
      return rejectWithValue(error.message || 'Vetítések betöltése sikertelen');
    }
  }
);

export const fetchScreeningById = createAsyncThunk(
  'screenings/fetchScreeningById',
  async (screeningId, { rejectWithValue }) => {
    try {
      const screening = await movieAPI.getScreening(screeningId);
      return screening;
    } catch (error) {
      return rejectWithValue(error.message || 'Vetítés adatainak betöltése sikertelen');
    }
  }
);

export const addScreening = createAsyncThunk(
  'screenings/addScreening',
  async (screeningData, { rejectWithValue }) => {
    try {
      const newScreening = await movieAPI.addScreening(screeningData);
      return newScreening;
    } catch (error) {
      return rejectWithValue(error.message || 'Vetítés hozzáadása sikertelen');
    }
  }
);

export const updateScreening = createAsyncThunk(
  'screenings/updateScreening',
  async ({ id, screeningData }, { rejectWithValue }) => {
    try {
      const updatedScreening = await movieAPI.updateScreening(id, screeningData);
      return updatedScreening;
    } catch (error) {
      return rejectWithValue(error.message || 'Vetítés frissítése sikertelen');
    }
  }
);

export const deleteScreening = createAsyncThunk(
  'screenings/deleteScreening',
  async (screeningId, { rejectWithValue }) => {
    try {
      await movieAPI.deleteScreening(screeningId);
      return screeningId;
    } catch (error) {
      return rejectWithValue(error.message || 'Vetítés törlése sikertelen');
    }
  }
);

const screeningsSlice = createSlice({
  name: 'screenings',
  initialState: {
    screenings: [],
    processedScreenings: [],
    currentScreening: null,
    isLoading: false,
    error: null,
    actionSuccess: null
  },
  reducers: {
    clearScreeningsError: (state) => {
      state.error = null;
    },
    clearActionSuccess: (state) => {
      state.actionSuccess = null;
    },
    setProcessedScreenings: (state, action) => {
      state.processedScreenings = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchScreenings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchScreenings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.screenings = action.payload;
      })
      .addCase(fetchScreenings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(fetchScreeningById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchScreeningById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentScreening = action.payload;
        
        const index = state.screenings.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.screenings[index] = action.payload;
        }
      })
      .addCase(fetchScreeningById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(addScreening.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.actionSuccess = null;
      })
      .addCase(addScreening.fulfilled, (state, action) => {
        state.isLoading = false;
        state.screenings.push(action.payload);
        state.actionSuccess = 'Vetítés sikeresen hozzáadva';
      })
      .addCase(addScreening.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(updateScreening.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.actionSuccess = null;
      })
      .addCase(updateScreening.fulfilled, (state, action) => {
        state.isLoading = false;
        
        const index = state.screenings.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.screenings[index] = action.payload;
        }
        
        const processedIndex = state.processedScreenings.findIndex(s => s.id === action.payload.id);
        if (processedIndex !== -1) {
          state.processedScreenings[processedIndex] = {
            ...state.processedScreenings[processedIndex],
            ...action.payload
          };
        }
        
        if (state.currentScreening && state.currentScreening.id === action.payload.id) {
          state.currentScreening = action.payload;
        }
        
        state.actionSuccess = 'Vetítés sikeresen frissítve';
      })
      .addCase(updateScreening.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(deleteScreening.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.actionSuccess = null;
      })
      .addCase(deleteScreening.fulfilled, (state, action) => {
        state.isLoading = false;
        state.screenings = state.screenings.filter(screening => screening.id !== action.payload);
        state.processedScreenings = state.processedScreenings.filter(screening => screening.id !== action.payload);
        
        if (state.currentScreening && state.currentScreening.id === action.payload) {
          state.currentScreening = null;
        }
        
        state.actionSuccess = 'Vetítés sikeresen törölve';
      })
      .addCase(deleteScreening.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearScreeningsError, clearActionSuccess, setProcessedScreenings } = screeningsSlice.actions;

export const selectAllScreenings = (state) => state.screenings.screenings;
export const selectProcessedScreenings = (state) => state.screenings.processedScreenings;
export const selectCurrentScreening = (state) => state.screenings.currentScreening;
export const selectScreeningsLoading = (state) => state.screenings.isLoading;
export const selectScreeningsError = (state) => state.screenings.error;
export const selectScreeningsActionSuccess = (state) => state.screenings.actionSuccess;

export default screeningsSlice.reducer;
