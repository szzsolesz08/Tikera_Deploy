import { useState, useEffect } from 'react';
import MovieDetails from './MovieDetails';
import LoadingSpinner from './components/LoadingSpinner';
import { movieAPI } from './services/api';
import { IconButton } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import './Movies.css';

const weekdayMap = {
  'Hétfő': 'Monday',
  'Kedd': 'Tuesday',
  'Szerda': 'Wednesday',
  'Csütörtök': 'Thursday',
  'Péntek': 'Friday',
  'Szombat': 'Saturday',
  'Vasárnap': 'Sunday'
};

const weekdays = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'];

function Movies({ initialWeek }) {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(initialWeek || 1);
  
  const today = new Date();
  const currentDayIndex = (today.getDay() + 6) % 7;
  const [selectedDay, setSelectedDay] = useState(weekdays[currentDayIndex]);

  const handleWeekChange = (increment) => {
    const newWeek = Math.min(Math.max(1, selectedWeek + increment), 52);
    setSelectedWeek(newWeek);
  };
  
  const handleDaySelect = (day) => {
    setSelectedDay(day);
  };

  useEffect(() => {
      const fetchMovies = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const englishDay = weekdayMap[selectedDay] || selectedDay;
        console.log(`Fetching movies for week ${selectedWeek}, day: ${englishDay}`);
        
        const allWeekMovies = await movieAPI.getMoviesByWeek(selectedWeek);
        console.log('All movies for week before filtering:', allWeekMovies);
        
        let hasAnyScreenings = false;
        if (Array.isArray(allWeekMovies)) {
          allWeekMovies.forEach(movie => {
            if (Array.isArray(movie.screenings) && movie.screenings.length > 0) {
              hasAnyScreenings = true;
              console.log(`Movie ${movie.title} has ${movie.screenings.length} screenings`);
              if (movie.screenings[0] && movie.screenings[0].start_time) {
                const date = new Date(movie.screenings[0].start_time);
                console.log(`First screening date: ${date}, JS day: ${date.getDay()}, ISO day: ${date.getDay() === 0 ? 7 : date.getDay()}`);
              }
            }
          });
        }
        console.log('Has any screenings:', hasAnyScreenings);
        
        const data = await movieAPI.getMoviesByWeekAndDay(selectedWeek, englishDay);
        console.log(`Received data from API for week ${selectedWeek}:`, data);
        
        if (!Array.isArray(data)) {
          console.error('API did not return an array. Received:', data);
          setError('Invalid data format received from server.');
          setMovies([]);
          return;
        }
        
        console.log(`Filtered movies for week ${selectedWeek}, day ${englishDay}:`, data.length);
        
        if (data.length > 0) {
          console.log('First movie data:', {
            title: data[0].title,
            image_path: data[0].image_path,
            screenings: data[0].screenings ? data[0].screenings.length : 0
          });
        } else {
          console.log('No movies found for the selected criteria');
        }
        
        setMovies(data);
      } catch (error) {
        console.error('Error fetching movies:', error);
        setError(`Failed to load movies. Error: ${error.message || 'Unknown error'}`);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMovies();
  }, [selectedDay, selectedWeek]);

  return (
    <div className="movies-container">
      <div className="content-layout">
        <div className="filters-container">
          <div className="week-selector">
            <IconButton 
              onClick={() => handleWeekChange(-1)} 
              disabled={selectedWeek <= 1}
              className="week-nav-button"
            >
              <ArrowBackIosNewIcon />
            </IconButton>
            <div className="week-display">
              <span>{selectedWeek}. hét</span>
            </div>
            <IconButton 
              onClick={() => handleWeekChange(1)} 
              disabled={selectedWeek >= 52}
              className="week-nav-button"
            >
              <ArrowForwardIosIcon />
            </IconButton>
          </div>
          
          <div className="day-selector">
            {weekdays.map((day) => (
              <button
                key={day}
                className={`day-button ${day === selectedDay ? 'active' : ''}`}
                onClick={() => handleDaySelect(day)}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      
        <div className="movie-grid">
          {loading && <div className="loading-overlay"><LoadingSpinner /></div>}
          
          {movies.length > 0 ? (
            movies.map((movie) => (
              <div 
                key={movie.id} 
                className="movie-card"
                onClick={() => setSelectedMovie(movie)}
              >
                <div className="movie-image">
                  {movie.image_path ? (
                    <img 
                      src={movie.image_path.startsWith('http') 
                        ? movie.image_path 
                        : movie.image_path.startsWith('/') 
                          ? `${import.meta.env.VITE_API_URL}${movie.image_path}`
                          : `${import.meta.env.VITE_API_URL}/${movie.image_path}`
                      } 
                      alt={movie.title}
                      onError={(e) => {
                        console.log('Image failed to load:', e.target.src);
                        const apiUrl = import.meta.env.VITE_API_URL;
                        const normalizedSrc = e.target.src.startsWith(apiUrl)
                          ? e.target.src.substring(apiUrl.length)
                          : e.target.src;
                        console.log('Normalized path:', normalizedSrc);
                        e.target.style.display = 'none';
                      }}
                      style={{ maxWidth: '100%', maxHeight: '200px' }}
                    />
                  ) : (
                    <div className="no-image">No Image Available</div>
                  )}
                </div>
                <div className="movie-info">
                  <h3>{movie.title}</h3>
                  <div className="movie-details">
                    <span>{movie.duration} min</span>
                    <span>{movie.genre}</span>
                    <span>{movie.release_year}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-movies-message">
              No movies available for this day in week {selectedWeek}.
            </div>
          )}
        </div>
      </div>

      {selectedMovie && (
        <MovieDetails 
          movie={selectedMovie} 
          selectedDay={selectedDay}
          onClose={() => setSelectedMovie(null)} 
        />
      )}
    </div>
  );
}

export default Movies;