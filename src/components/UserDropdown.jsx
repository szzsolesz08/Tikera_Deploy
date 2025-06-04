import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './UserDropdown.css';

function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, checkAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    window.addEventListener('auth-change', checkAuth);
    return () => window.removeEventListener('auth-change', checkAuth);
  }, [checkAuth]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    await authAPI.logout();
    setIsOpen(false);
    
    window.dispatchEvent(new Event('auth-change'));
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && !e.target.closest('.user-dropdown-container')) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="user-dropdown-container">
      <button 
        className="user-icon-button" 
        onClick={toggleDropdown}
        aria-label="User menu"
      >
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path 
            fill="currentColor" 
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
          />
        </svg>
        {isAuthenticated && user && (
          <span className="user-name-display">{user.name.split(' ')[0]}</span>
        )}
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          {isAuthenticated ? (
            <>
              <div className="user-info">
                <span className="user-greeting">Hello, {user?.name}</span>
                <span className="user-email">{user?.email}</span>
                {user?.role && (
                  <span className={`user-role ${isAdmin ? 'admin-role' : 'user-role'}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                )}
              </div>
              <div className="dropdown-divider"></div>
              {!isAdmin && (
                <Link to="/my-screenings" className="dropdown-item">
                  Foglalásaim
                </Link>
              )}
              
              {isAdmin && (
                <>
                  <Link to="/admin/movies" className="dropdown-item admin-link">
                    Filmek kezelése
                  </Link>
                  <Link to="/admin/screenings" className="dropdown-item admin-link">
                    Vetítések kezelése
                  </Link>
                  <Link to="/admin/add-movie" className="dropdown-item admin-link">
                    Film hozzáadása
                  </Link>
                  <Link to="/admin/add-screening" className="dropdown-item admin-link">
                    Vetítés hozzáadása
                  </Link>
                </>
              )}
              
              <div className="dropdown-divider"></div>
              <button className="dropdown-item" onClick={handleLogout}>
                Kijelentkezés
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="dropdown-item">Bejelentkezés</Link>
              <Link to="/register" className="dropdown-item">Regisztráció</Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default UserDropdown;
