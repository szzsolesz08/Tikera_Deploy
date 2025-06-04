import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { movieAPI } from '../../services/api';
import './Admin.css';

function AddMovie() {
  const { isAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
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
        duration: parseInt(formData.duration, 10)
      };
      
      // Call API to create movie
      await movieAPI.createMovie(movieData);
      
      // Reset form on success
      setFormData({
        title: '',
        description: '',
        duration: '',
        genre: '',
        release_year: '',
        image_path: ''
      });
      
      setSuccess(true);
    } catch (err) {
      console.error('Failed to create movie:', err);
      setError(err.message || 'Hiba történt a film létrehozásakor');
      
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
        <h2 className="admin-title">Film hozzáadása</h2>
        
        {success && (
          <div className="success-message">
            <p>A film sikeresen hozzáadva! ✓</p>
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
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn primary-btn" 
              disabled={isLoading}
            >
              {isLoading ? 'Feltöltés...' : 'Film hozzáadása'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddMovie;
