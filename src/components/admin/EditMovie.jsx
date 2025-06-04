import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { movieAPI } from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import './Admin.css';

function EditMovie() {
  const { isAdmin } = useAuth();
  const { id } = useParams(); // Get movie ID from URL
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMovie, setIsLoadingMovie] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    genre: '',
    release_year: '',
    image_path: ''
  });
  
  // Form validation errors
  const [validationErrors, setValidationErrors] = useState({});

  // Load movie data
  useEffect(() => {
    const fetchMovie = async () => {
      setIsLoadingMovie(true);
      try {
        const movie = await movieAPI.getMovie(id);
        
        // Set form data with movie details
        setFormData({
          title: movie.title || '',
          description: movie.description || '',
          duration: movie.duration ? movie.duration.toString() : '',
          genre: movie.genre || '',
          release_year: movie.release_year ? movie.release_year.toString() : '',
          image_path: movie.image_path || ''
        });
      } catch (err) {
        console.error('Failed to load movie:', err);
        setError('A film betöltése sikertelen. Ellenőrizze, hogy létezik-e a film.');
      } finally {
        setIsLoadingMovie(false);
      }
    };
    
    fetchMovie();
  }, [id]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ''
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) errors.title = 'A cím megadása kötelező';
    if (!formData.description.trim()) errors.description = 'A leírás megadása kötelező';
    if (!formData.duration) errors.duration = 'A film hosszának megadása kötelező';
    if (!formData.genre.trim()) errors.genre = 'A műfaj megadása kötelező';
    if (!formData.release_year) errors.release_year = 'A megjelenési év megadása kötelező';
    if (formData.release_year && (formData.release_year < 1900 || formData.release_year > 2100)) {
      errors.release_year = 'Érvénytelen év. Kérjük, adjon meg egy évet 1900 és 2100 között.';
    }
    
    // Image URL is optional, but if provided, validate it's a URL
    if (formData.image_path && !formData.image_path.match(/^https?:\/\/.+/)) {
      errors.image_path = 'Érvényes URL-t adjon meg (http:// vagy https:// kezdettel)';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset states
    setSuccess(false);
    setError(null);
    
    // Validate form
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Convert duration to integer
      const movieData = {
        ...formData,
        duration: parseInt(formData.duration, 10),
        release_year: parseInt(formData.release_year, 10)
      };
      
      // Call API to update movie
      await movieAPI.updateMovie(id, movieData);
      
      setSuccess(true);
      
      // Navigate back to movie list after short delay
      setTimeout(() => {
        navigate('/admin/movies');
      }, 2000);
    } catch (err) {
      console.error('Failed to update movie:', err);
      setError(err.message || 'Hiba történt a film frissítésekor');
      
      // Handle validation errors from the server
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
        <h2 className="admin-title">Film szerkesztése</h2>
        
        {isLoadingMovie ? (
          <div className="loading-message">
            <p>Film adatok betöltése...</p>
          </div>
        ) : (
          <>
            {success && (
              <div className="success-message">
                <p>A film sikeresen frissítve! ✓</p>
              </div>
            )}
            
            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}
            
            <form className="admin-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Film címe *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={validationErrors.title ? 'error' : ''}
                />
                {validationErrors.title && <div className="error-text">{validationErrors.title}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Film leírása *</label>
                <textarea
                  id="description"
                  name="description"
                  rows="5"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={validationErrors.description ? 'error' : ''}
                ></textarea>
                {validationErrors.description && <div className="error-text">{validationErrors.description}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="duration">Film hossza (perc) *</label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="1"
                  max="999"
                  className={validationErrors.duration ? 'error' : ''}
                />
                {validationErrors.duration && <div className="error-text">{validationErrors.duration}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="genre">Film műfaja *</label>
                <input
                  type="text"
                  id="genre"
                  name="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                  className={validationErrors.genre ? 'error' : ''}
                />
                {validationErrors.genre && <div className="error-text">{validationErrors.genre}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="release_year">Megjelenés éve *</label>
                <input
                  type="number"
                  id="release_year"
                  name="release_year"
                  value={formData.release_year}
                  onChange={handleInputChange}
                  min="1900"
                  max="2100"
                  className={validationErrors.release_year ? 'error' : ''}
                />
                {validationErrors.release_year && <div className="error-text">{validationErrors.release_year}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="image_path">Kép URL-je (opcionális)</label>
                <input
                  type="url"
                  id="image_path"
                  name="image_path"
                  value={formData.image_path}
                  onChange={handleInputChange}
                  className={validationErrors.image_path ? 'error' : ''}
                />
                {validationErrors.image_path && <div className="error-text">{validationErrors.image_path}</div>}
                {formData.image_path && (
                  <div className="image-preview">
                    <img 
                      src={formData.image_path} 
                      alt="Film előnézet" 
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = 'https://via.placeholder.com/300x450?text=Nincs+kép';
                      }}
                    />
                  </div>
                )}
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn secondary-btn" 
                  onClick={() => navigate('/admin/movies')}
                  disabled={isLoading}
                >
                  Vissza
                </button>
                <button 
                  type="submit" 
                  className="btn primary-btn" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Frissítés...' : 'Film mentése'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default EditMovie;
