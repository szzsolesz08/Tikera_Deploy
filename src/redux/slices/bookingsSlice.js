import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { movieAPI } from '../../services/api';

export const fetchUserBookings = createAsyncThunk(
  'bookings/fetchUserBookings',
  async (_, { rejectWithValue }) => {
    try {
      const bookings = await movieAPI.getUserBookings();
      return bookings;
    } catch (error) {
      return rejectWithValue(error.message || 'Foglalások betöltése sikertelen');
    }
  }
);

export const createBooking = createAsyncThunk(
  'bookings/createBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await movieAPI.createBooking(bookingData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Foglalás létrehozása sikertelen');
    }
  }
);

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState: {
    userBookings: [],
    currentBooking: null,
    selectedSeats: [],
    selectedTickets: [],
    isLoading: false,
    error: null,
    bookingSuccess: false
  },
  reducers: {
    clearBookingError: (state) => {
      state.error = null;
    },
    clearBookingSuccess: (state) => {
      state.bookingSuccess = false;
    },
    setSelectedSeats: (state, action) => {
      state.selectedSeats = action.payload;
    },
    addSelectedSeat: (state, action) => {
      state.selectedSeats.push(action.payload);
    },
    removeSelectedSeat: (state, action) => {
      state.selectedSeats = state.selectedSeats.filter(
        seat => !(seat.row === action.payload.row && seat.seat === action.payload.seat)
      );
    },
    clearSelectedSeats: (state) => {
      state.selectedSeats = [];
    },
    setSelectedTickets: (state, action) => {
      state.selectedTickets = action.payload;
    },
    clearSelectedTickets: (state) => {
      state.selectedTickets = [];
    },
    resetBookingState: (state) => {
      state.selectedSeats = [];
      state.selectedTickets = [];
      state.error = null;
      state.bookingSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userBookings = action.payload;
      })
      .addCase(fetchUserBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(createBooking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.bookingSuccess = false;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBooking = action.payload;
        state.userBookings.push(action.payload);
        state.bookingSuccess = true;
        state.selectedSeats = [];
        state.selectedTickets = [];
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  clearBookingError, 
  clearBookingSuccess, 
  setSelectedSeats, 
  addSelectedSeat, 
  removeSelectedSeat, 
  clearSelectedSeats, 
  setSelectedTickets, 
  clearSelectedTickets, 
  resetBookingState 
} = bookingsSlice.actions;

export const selectUserBookings = (state) => state.bookings.userBookings;
export const selectCurrentBooking = (state) => state.bookings.currentBooking;
export const selectSelectedSeats = (state) => state.bookings.selectedSeats;
export const selectSelectedTickets = (state) => state.bookings.selectedTickets;
export const selectBookingsLoading = (state) => state.bookings.isLoading;
export const selectBookingsError = (state) => state.bookings.error;
export const selectBookingSuccess = (state) => state.bookings.bookingSuccess;

export default bookingsSlice.reducer;
