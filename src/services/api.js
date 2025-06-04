const API_URL = import.meta.env.VITE_API_URL;

function getNumericDayIndex(dayName) {
  const dayMap = {
    'Monday': [1],
    'Tuesday': [2],
    'Wednesday': [3],
    'Thursday': [4],
    'Friday': [5],
    'Saturday': [6],
    'Sunday': [7]
  };
  
  return dayMap[dayName] || [];
}

async function fetchAPI(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  const token = localStorage.getItem('tikera_auth_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
  
  const defaultOptions = { headers };
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, mergedOptions);
    
    if (response.status === 401) {
      localStorage.removeItem('tikera_auth_token');
      localStorage.removeItem('tikera_user');
    }
    
    const jsonResponse = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      if (response.status === 422 && jsonResponse.errors) {
        const errorMessages = Object.entries(jsonResponse.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('\n');
        
        const error = new Error(errorMessages || jsonResponse.message || 'Validation failed');
        error.validationErrors = jsonResponse.errors;
        throw error;
      }
      
      throw new Error(jsonResponse.message || `API call failed with status: ${response.status}`);
    }
    
    return jsonResponse.data !== undefined ? jsonResponse.data : jsonResponse;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

export const authAPI = {
  login: async (email, password) => {
    const response = await fetchAPI('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      localStorage.setItem('tikera_auth_token', response.token);
      localStorage.setItem('tikera_user', JSON.stringify(response.user));
    }
    
    return response;
  },
  
  register: async (name, email, password, password_confirmation) => {
    const response = await fetchAPI('/register', {
      method: 'POST',
      body: JSON.stringify({
        name,
        email,
        password,
        password_confirmation
      }),
    });
    
    if (response.token) {
      localStorage.setItem('tikera_auth_token', response.token);
      localStorage.setItem('tikera_user', JSON.stringify(response.user));
    }
    
    return response;
  },
  
  logout: async () => {
    try {
      await fetchAPI('/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('tikera_auth_token');
      localStorage.removeItem('tikera_user');
    }
  },
  
  getCurrentUser: () => {
    const userJson = localStorage.getItem('tikera_user');
    if (!userJson) return null;
    
    try {
      return JSON.parse(userJson);
    } catch (e) {
      console.error('Failed to parse user data', e);
      localStorage.removeItem('tikera_user');
      return null;
    }
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('tikera_auth_token');
  }
};

export const movieAPI = {
  getMovies: async () => {
    return await fetchAPI('/movies');
  },
  
  getMovie: async (id) => {
    return await fetchAPI(`/movies/${id}`);
  },
  
  getMoviesByWeek: async (weekNumber) => {
    return await fetchAPI(`/movies/week?week_number=${weekNumber}`);
  },
  

  
  getMoviesByWeekAndDay: async (weekNumber, day = null) => {
    try {
      let weekMovies;
      try {
        weekMovies = await fetchAPI(`/movies/week?week_number=${weekNumber}`);
      } catch (weekError) {
        console.error('Error fetching weekly movies, falling back to all movies:', weekError);
        weekMovies = await fetchAPI('/movies');
      }
      
      if (!Array.isArray(weekMovies)) {
        console.error('Unexpected movies response format:', weekMovies);
        return [];
      }
      console.log('Week movies:', weekMovies);
      if (!day) {
        return weekMovies;
      }
      
      const dayIndices = getNumericDayIndex(day)[0];
      
      const filteredMovies = weekMovies.filter(movie => {
        if (!Array.isArray(movie.screenings)) {
          return false;
        }
        
        return movie.screenings.some(screening => {
          if (!screening) return false;
          
          const screeningDay = screening.week_day;
          
          if (typeof screeningDay === 'number' && dayIndices === screeningDay) {
            return true;
          }
          
          if (screeningDay === day) {
            return true;
          }
          
          return false;
        });
      });
      
      return filteredMovies;
    } catch (error) {
      console.error('Failed to fetch movies by week and day:', error);
      throw error;
    }
  },
  
  getScreenings: async () => {
    return await fetchAPI('/screenings');
  },

  getScreening: async (screeningId) => {
    return await fetchAPI(`/screenings/${screeningId}`);
  },

  createBooking: async (screeningId, bookingData) => {
    const formattedSeats = bookingData.seats.map(seat => ({
      row: seat.row,
      number: seat.seat || seat.number
    }));
    
    const bookingPayload = {
      screening_id: screeningId,
      seats: formattedSeats,
      ticket_types: Object.entries(bookingData.ticket_counts)
        .filter(([_, count]) => count > 0)
        .map(([type, count]) => {
          let apiTicketType;
          switch(type) {
            case 'adult': apiTicketType = 'normal'; break;
            case 'student': apiTicketType = 'student'; break;
            case 'senior': apiTicketType = 'senior'; break;
            default: apiTicketType = 'normal';
          }
          return { type: apiTicketType, quantity: count };
        })
    };
    
    return await fetchAPI('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingPayload),
    });
  },
  
  getBookings: async () => {
    return await fetchAPI('/bookings');
  },
  
  getBooking: async (bookingId) => {
    return await fetchAPI(`/bookings/${bookingId}`);
  },

  createMovie: async (movieData) => {
    return await fetchAPI('/movies', {
      method: 'POST',
      body: JSON.stringify(movieData),
    });
  },
  
  updateMovie: async (movieId, movieData) => {
    return await fetchAPI(`/movies/${movieId}`, {
      method: 'PUT',
      body: JSON.stringify(movieData),
    });
  },
  
  getRooms: async () => {
    return await fetchAPI('/rooms');
  },
  
  createScreening: async (screeningData) => {
    return await fetchAPI('/screenings', {
      method: 'POST',
      body: JSON.stringify(screeningData),
    });
  },
  
  updateScreening: async (screeningId, screeningData) => {
    return await fetchAPI(`/screenings/${screeningId}`, {
      method: 'PUT',
      body: JSON.stringify(screeningData)
    });
  },
  
  deleteMovie: async (movieId) => {
    return await fetchAPI(`/movies/${movieId}`, {
      method: 'DELETE'
    });
  },
  
  deleteScreening: async (screeningId) => {
    return await fetchAPI(`/screenings/${screeningId}`, {
      method: 'DELETE'
    });
  },
};
