import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  fetchMovies,
  deleteMovie,
  selectAllMovies,
  selectMoviesLoading,
  selectMoviesError,
  selectMoviesActionSuccess
} from '../../redux/slices/moviesSlice';
import './Admin.css';

function MovieList() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const movies = useSelector(selectAllMovies);
  const isLoading = useSelector(selectMoviesLoading);
  const error = useSelector(selectMoviesError);
  const actionSuccess = useSelector(selectMoviesActionSuccess);
  
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  
  useEffect(() => {
    dispatch(fetchMovies());
  }, [dispatch]);

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
        <div className="page-header">
          <h2 className="admin-title">Filmek kezelése</h2>
          <Link to="/admin/add-movie" className="btn primary-btn add-button">
            + Új film hozzáadása
          </Link>
        </div>

        {isLoading ? (
          <div className="loading-message">Filmek betöltése...</div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
          </div>
        ) : (
          <div className="admin-list">
            {movies.length === 0 ? (
              <div className="empty-list">
                <p>Nincsenek filmek az adatbázisban.</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Kép</th>
                    <th>Cím</th>
                    <th>Hossz</th>
                    <th>Műfaj</th>
                    <th>Megjelenés éve</th>
                    <th>Műveletek</th>
                  </tr>
                </thead>
                <tbody>
                  {movies.map(movie => (
                    <tr key={movie.id}>
                      <td className="image-cell">
                        {movie.image_path ? (
                          <img 
                            src={movie.image_path}
                            alt={movie.title}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/80x120?text=Nincs+kép';
                            }}
                          />
                        ) : (
                          <div className="no-image">Nincs kép</div>
                        )}
                      </td>
                      <td>{movie.title}</td>
                      <td>{movie.duration} perc</td>
                      <td>{movie.genre}</td>
                      <td>{movie.release_year}</td>
                      <td className="actions-cell">
                        <button 
                          className="btn action-btn edit-btn" 
                          onClick={() => navigate(`/admin/edit-movie/${movie.id}`)}
                        >
                          Szerkesztés
                        </button>
                        <button 
                          className="btn action-btn delete-btn" 
                          onClick={() => setDeleteConfirmation(movie)}
                        >
                          Törlés
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        
        {/* Delete confirmation modal */}
        {deleteConfirmation && (
          <div className="modal-overlay">
            <div className="confirmation-modal">
              <h3>Film törlése</h3>
              <p>Biztosan törölni szeretné a következő filmet?</p>
              <p>
                <strong>{deleteConfirmation.title}</strong>
                <br />
                {deleteConfirmation.genre}, {deleteConfirmation.duration} perc, {deleteConfirmation.release_year}
              </p>
              <div className="warning-message">
                <p>Figyelem! A film törlésével az összes hozzá tartozó vetítés is törlődik!</p>
              </div>
              <div className="modal-actions">
                <button 
                  className="btn cancel-btn"
                  onClick={() => setDeleteConfirmation(null)}
                >
                  Mégsem
                </button>
                <button 
                  className="btn delete-btn"
                  onClick={() => {
                    dispatch(deleteMovie(deleteConfirmation.id));
                    setDeleteConfirmation(null);
                  }}
                >
                  Törlés
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Success message */}
        {actionSuccess && (
          <div className="success-message floating">
            <p>{actionSuccess}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MovieList;
