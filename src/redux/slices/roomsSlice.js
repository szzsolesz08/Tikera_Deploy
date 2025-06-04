import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { movieAPI } from '../../services/api';

export const fetchRooms = createAsyncThunk(
  'rooms/fetchRooms',
  async (_, { rejectWithValue }) => {
    try {
      const rooms = await movieAPI.getRooms();
      return rooms;
    } catch (error) {
      return rejectWithValue(error.message || 'Termek betöltése sikertelen');
    }
  }
);

const roomsSlice = createSlice({
  name: 'rooms',
  initialState: {
    rooms: [],
    roomsMap: {},
    isLoading: false,
    error: null
  },
  reducers: {
    clearRoomsError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRooms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rooms = action.payload;
        
        state.roomsMap = action.payload.reduce((map, room) => {
          map[String(room.id)] = room;
          return map;
        }, {});
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearRoomsError } = roomsSlice.actions;

export const selectAllRooms = (state) => state.rooms.rooms;
export const selectRoomsMap = (state) => state.rooms.roomsMap;
export const selectRoomsLoading = (state) => state.rooms.isLoading;
export const selectRoomsError = (state) => state.rooms.error;

export const selectRoomById = (state, roomId) => 
  state.rooms.roomsMap[String(roomId)] || null;

export const selectRoomByDimensions = (state, rows, seatsPerRow) => 
  state.rooms.rooms.find(room => room.rows === rows && room.seats_per_row === seatsPerRow) || null;

export default roomsSlice.reducer;
