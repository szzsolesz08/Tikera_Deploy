import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  fetchRooms, 
  selectAllRooms, 
  selectRoomsLoading, 
  selectRoomsError 
} from '../../redux/slices/roomsSlice';
import {
  fetchMovies,
  selectAllMovies,
  selectMoviesLoading,
  selectMoviesError
} from '../../redux/slices/moviesSlice';
import {
  deleteScreening,
  setProcessedScreenings,
  selectProcessedScreenings,
  selectScreeningsLoading,
  selectScreeningsError,
  selectScreeningsActionSuccess
} from '../../redux/slices/screeningsSlice';
import './Admin.css';

function ScreeningList() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const processedScreenings = useSelector(selectProcessedScreenings);
  const rooms = useSelector(selectAllRooms);
  const movies = useSelector(selectAllMovies);
  const isMoviesLoading = useSelector(selectMoviesLoading);
  const isRoomsLoading = useSelector(selectRoomsLoading);
  const isScreeningsLoading = useSelector(selectScreeningsLoading);
  const moviesError = useSelector(selectMoviesError);
  const roomsError = useSelector(selectRoomsError);
  const screeningsError = useSelector(selectScreeningsError);
  const actionSuccess = useSelector(selectScreeningsActionSuccess);
  
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const isLoading = isMoviesLoading || isRoomsLoading || isScreeningsLoading;
  const error = screeningsError || moviesError || roomsError;
  
  useEffect(() => {
    dispatch(fetchMovies());
    dispatch(fetchRooms());
  }, [dispatch]);
  
  useEffect(() => {
    if (movies.length > 0 && rooms.length > 0 && !isLoading) {
      const allScreenings = [];
      
      movies.forEach(movie => {
        if (movie.screenings && Array.isArray(movie.screenings)) {
          movie.screenings.forEach(screening => {
            let room_name = '';
            rooms.forEach(room => {
              if (room.rows === screening.room.rows && room.seats_per_row === screening.room.seatsPerRow) {
                room_name = room.name;
              }
            });
            
            allScreenings.push({
              id: screening.id,
              movie_id: movie.id,
              movie_title: movie.title,
              room_id: screening.room.id,
              room_name: room_name || `${screening.room.rows}×${screening.room.seatsPerRow} terem`,
              date: screening.date,
              start_time: screening.start_time
            });
          });
        }
      });
      
      allScreenings.sort((a, b) => {
        const dateA = new Date(a.date || a.start_time);
        const dateB = new Date(b.date || b.start_time);
        return dateB - dateA;
      });
      
      dispatch(setProcessedScreenings(allScreenings));
    }
  }, [movies, rooms, isLoading, dispatch]);
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      if (typeof dateString === 'string' && dateString.length <= 10 && dateString.includes('-')) {
        const [year, month, day] = dateString.split('-');
        return `${year}. ${month}. ${day}.`;
      }
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString || 'N/A';
      }
      
      return date.toLocaleDateString('hu-HU', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString || 'N/A';
    }
  };
  
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    
    try {
      if (timeString.includes('T')) {
        const time = timeString.split('T')[1];
        return time.substr(0, 5);
      }
      
      if (timeString.includes(':')) {
        return timeString.substr(0, 5);
      }
      
      return timeString;
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString || 'N/A';
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
        <div className="page-header">
          <h2 className="admin-title">Vetítések kezelése</h2>
          <Link to="/admin/add-screening" className="btn primary-btn add-button">
            + Új vetítés hozzáadása
          </Link>
        </div>

        {isLoading ? (
          <div className="loading-message">Vetítések betöltése...</div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
          </div>
        ) : (
          <div className="admin-list">
            {processedScreenings.length === 0 ? (
              <div className="empty-list">
                <p>Nincsenek vetítések az adatbázisban.</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Film</th>
                    <th>Terem</th>
                    <th>Dátum</th>
                    <th>Időpont</th>
                    <th>Műveletek</th>
                  </tr>
                </thead>
                <tbody>
                  {processedScreenings.map(screening => {
                    return (
                      <tr key={screening.id}>
                        <td>{screening.movie_title}</td>
                        <td>{screening.room_name}</td>
                        <td>
                          {formatDate(screening.date || 
                                    (screening.start_time && screening.start_time.includes('T') ? 
                                    screening.start_time.split('T')[0] : null))}
                        </td>
                        <td>{formatTime(screening.start_time)}</td>
                        <td className="actions-cell">
                          <button 
                            className="btn action-btn edit-btn" 
                            onClick={() => navigate(`/admin/edit-screening/${screening.id}`)}
                          >
                            Szerkesztés
                          </button>
                          <button 
                            className="btn action-btn delete-btn" 
                            onClick={() => setDeleteConfirmation(screening)}
                          >
                            Törlés
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
        
        {/* Delete confirmation modal */}
        {deleteConfirmation && (
          <div className="modal-overlay">
            <div className="confirmation-modal">
              <h3>Vetítés törlése</h3>
              <p>Biztosan törölni szeretné a következő vetítést?</p>
              <p>
                <strong>{deleteConfirmation.movie_title}</strong>
                <br />
                {deleteConfirmation.room_name}, {formatDate(deleteConfirmation.date)} {formatTime(deleteConfirmation.start_time)}
              </p>
              <div className="modal-actions">
                <button 
                  className="btn cancel-btn"
                  onClick={() => setDeleteConfirmation(null)}
                >
                  Mégsem
                </button>
                <button 
                  className="btn action-btn delete-btn" 
                  onClick={() => {
                    dispatch(deleteScreening(deleteConfirmation.id));
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

export default ScreeningList;
