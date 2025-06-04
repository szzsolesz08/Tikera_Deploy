import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import moviesReducer from './slices/moviesSlice';
import screeningsReducer from './slices/screeningsSlice';
import bookingsReducer from './slices/bookingsSlice';
import roomsReducer from './slices/roomsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    movies: moviesReducer,
    screenings: screeningsReducer,
    bookings: bookingsReducer,
    rooms: roomsReducer,
  },
});

export default store;
