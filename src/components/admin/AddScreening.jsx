import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { movieAPI } from '../../services/api';
import './Admin.css';

function AddScreening() {
  const { isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  const [movies, setMovies] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState({
    movie_id: '',
    room_id: '',
    date: '',
    start_time: ''
  });
  
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [moviesData, roomsData] = await Promise.all([
          movieAPI.getMovies(),
          movieAPI.getRooms()
        ]);
        
        setMovies(moviesData);
        setRooms(roomsData);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Adatok betöltése sikertelen.');
      } finally {
        setLoadingData(false);
      }
    };
    
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.movie_id) errors.movie_id = 'Film kiválasztása kötelező';
    if (!formData.room_id) errors.room_id = 'Terem kiválasztása kötelező';
    if (!formData.date) errors.date = 'Dátum megadása kötelező';
    if (!formData.start_time) errors.start_time = 'Kezdési időpont megadása kötelező';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setSuccess(false);
    setError(null);
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const screeningData = {
        movie_id: parseInt(formData.movie_id, 10),
        room_id: parseInt(formData.room_id, 10),
        date: formData.date,
        start_time: formData.start_time
      };
      
      await movieAPI.createScreening(screeningData);
      
      setFormData({
        movie_id: '',
        room_id: '',
        date: '',
        start_time: ''
      });
      
      setSuccess(true);
    } catch (err) {
      console.error('Failed to create screening:', err);
      setError(err.message || 'Hiba történt a vetítés létrehozásakor');
      
      if (err.errors) {
        setValidationErrors(err.errors);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isAdmin) {
    return (
      <div className="unauthorized-message">
        <h2>Hozzáférés megtagadva</h2>
        <p>Nem vagy jogosult erre az oldalra.</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-content">
        <h2 className="admin-title">Vetítés hozzáadása</h2>
        
        {loadingData ? (
          <div className="loading-message">Adatok betöltése...</div>
        ) : (
          <>
            {success && (
              <div className="success-message">
                <p>A vetítés sikeresen hozzáadva! ✓</p>
              </div>
            )}
            
            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}
            
            <form className="admin-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="movie_id">Film kiválasztása *</label>
                <select
                  id="movie_id"
                  name="movie_id"
                  value={formData.movie_id}
                  onChange={handleInputChange}
                  className={validationErrors.movie_id ? 'error' : ''}
                  disabled={loadingData || movies.length === 0}
                >
                  <option value="">-- Válasszon filmet --</option>
                  {movies.map(movie => (
                    <option key={movie.id} value={movie.id}>
                      {movie.title}
                    </option>
                  ))}
                </select>
                {validationErrors.movie_id && <div className="error-text">{validationErrors.movie_id}</div>}
                {movies.length === 0 && !loadingData && (
                  <div className="hint-text">Nincsenek filmek az adatbázisban. Először adjon hozzá filmeket.</div>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="room_id">Terem kiválasztása *</label>
                <select
                  id="room_id"
                  name="room_id"
                  value={formData.room_id}
                  onChange={handleInputChange}
                  className={validationErrors.room_id ? 'error' : ''}
                  disabled={loadingData || rooms.length === 0}
                >
                  <option value="">-- Válasszon termet --</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>
                      {room.name} ({room.capacity} fő)
                    </option>
                  ))}
                </select>
                {validationErrors.room_id && <div className="error-text">{validationErrors.room_id}</div>}
                {rooms.length === 0 && !loadingData && (
                  <div className="hint-text">Nincsenek termek az adatbázisban.</div>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="date">Vetítés dátuma *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={validationErrors.date ? 'error' : ''}
                />
                {validationErrors.date && <div className="error-text">{validationErrors.date}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="start_time">Kezdési időpont *</label>
                <input
                  type="time"
                  id="start_time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleInputChange}
                  className={validationErrors.start_time ? 'error' : ''}
                />
                {validationErrors.start_time && <div className="error-text">{validationErrors.start_time}</div>}
              </div>
              
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn primary-btn" 
                  disabled={isLoading || loadingData}
                >
                  {isLoading ? 'Feltöltés...' : 'Vetítés hozzáadása'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default AddScreening;
