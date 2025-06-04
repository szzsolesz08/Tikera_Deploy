import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { movieAPI } from '../../services/api';

export const fetchMovies = createAsyncThunk(
  'movies/fetchMovies',
  async (_, { rejectWithValue }) => {
    try {
      const movies = await movieAPI.getMovies();
      return movies;
    } catch (error) {
      return rejectWithValue(error.message || 'Filmek betöltése sikertelen');
    }
  }
);

export const fetchMoviesByWeek = createAsyncThunk(
  'movies/fetchMoviesByWeek',
  async (weekOffset, { rejectWithValue }) => {
    try {
      const movies = await movieAPI.getMoviesByWeek(weekOffset);
      return { movies, weekOffset };
    } catch (error) {
      return rejectWithValue(error.message || 'Filmek betöltése sikertelen');
    }
  }
);

export const fetchMovieById = createAsyncThunk(
  'movies/fetchMovieById',
  async (movieId, { rejectWithValue }) => {
    try {
      const movie = await movieAPI.getMovie(movieId);
      return movie;
    } catch (error) {
      return rejectWithValue(error.message || 'Film adatainak betöltése sikertelen');
    }
  }
);

export const addMovie = createAsyncThunk(
  'movies/addMovie',
  async (movieData, { rejectWithValue }) => {
    try {
      const newMovie = await movieAPI.addMovie(movieData);
      return newMovie;
    } catch (error) {
      return rejectWithValue(error.message || 'Film hozzáadása sikertelen');
    }
  }
);

export const updateMovie = createAsyncThunk(
  'movies/updateMovie',
  async ({ id, movieData }, { rejectWithValue }) => {
    try {
      const updatedMovie = await movieAPI.updateMovie(id, movieData);
      return updatedMovie;
    } catch (error) {
      return rejectWithValue(error.message || 'Film frissítése sikertelen');
    }
  }
);

export const deleteMovie = createAsyncThunk(
  'movies/deleteMovie',
  async (movieId, { rejectWithValue }) => {
    try {
      await movieAPI.deleteMovie(movieId);
      return movieId;
    } catch (error) {
      return rejectWithValue(error.message || 'Film törlése sikertelen');
    }
  }
);

const moviesSlice = createSlice({
  name: 'movies',
  initialState: {
    allMovies: [],
    moviesByWeek: {},
    currentMovie: null,
    currentWeekOffset: 0,
    isLoading: false,
    error: null,
    actionSuccess: null
  },
  reducers: {
    clearMoviesError: (state) => {
      state.error = null;
    },
    clearActionSuccess: (state) => {
      state.actionSuccess = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMovies.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMovies.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allMovies = action.payload;
      })
      .addCase(fetchMovies.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(fetchMoviesByWeek.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMoviesByWeek.fulfilled, (state, action) => {
        state.isLoading = false;
        state.moviesByWeek[action.payload.weekOffset] = action.payload.movies;
        state.currentWeekOffset = action.payload.weekOffset;
      })
      .addCase(fetchMoviesByWeek.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(fetchMovieById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMovieById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentMovie = action.payload;
        
        const index = state.allMovies.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.allMovies[index] = action.payload;
        }
      })
      .addCase(fetchMovieById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(addMovie.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.actionSuccess = null;
      })
      .addCase(addMovie.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allMovies.push(action.payload);
        state.actionSuccess = 'Film sikeresen hozzáadva';
      })
      .addCase(addMovie.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(updateMovie.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.actionSuccess = null;
      })
      .addCase(updateMovie.fulfilled, (state, action) => {
        state.isLoading = false;
        
        const index = state.allMovies.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.allMovies[index] = action.payload;
        }
        
        if (state.currentMovie && state.currentMovie.id === action.payload.id) {
          state.currentMovie = action.payload;
        }
        
        state.actionSuccess = 'Film sikeresen frissítve';
      })
      .addCase(updateMovie.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(deleteMovie.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.actionSuccess = null;
      })
      .addCase(deleteMovie.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allMovies = state.allMovies.filter(movie => movie.id !== action.payload);
        
        if (state.currentMovie && state.currentMovie.id === action.payload) {
          state.currentMovie = null;
        }
        
        Object.keys(state.moviesByWeek).forEach(weekOffset => {
          state.moviesByWeek[weekOffset] = state.moviesByWeek[weekOffset]
            .filter(movie => movie.id !== action.payload);
        });
        
        state.actionSuccess = 'Film sikeresen törölve';
      })
      .addCase(deleteMovie.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearMoviesError, clearActionSuccess } = moviesSlice.actions;

export const selectAllMovies = (state) => state.movies.allMovies;
export const selectCurrentMovie = (state) => state.movies.currentMovie;
export const selectMoviesByWeek = (state, weekOffset = state.movies.currentWeekOffset) => 
  state.movies.moviesByWeek[weekOffset] || [];
export const selectMoviesLoading = (state) => state.movies.isLoading;
export const selectMoviesError = (state) => state.movies.error;
export const selectMoviesActionSuccess = (state) => state.movies.actionSuccess;

export default moviesSlice.reducer;
