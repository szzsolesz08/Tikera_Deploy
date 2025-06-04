import { useState } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import './Home.css';
import Movies from './Movies';
import MovieDetails from './MovieDetails';
import UserDropdown from './components/UserDropdown';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';

import AddMovie from './components/admin/AddMovie';
import AddScreening from './components/admin/AddScreening';
import EditMovie from './components/admin/EditMovie';
import EditScreening from './components/admin/EditScreening';
import MovieList from './components/admin/MovieList';
import ScreeningList from './components/admin/ScreeningList';

import MyScreenings from './components/user/MyScreenings';

import { useAuth } from './context/AuthContext';

function Home() {
  const today = new Date();
  const getISOWeek = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  };
  const [currentWeek, setCurrentWeek] = useState(getISOWeek(today));
  
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="main-container">
      <header className="header">
        <div className="toolbar">
          <Link to="/" className="logo-container" style={{ textDecoration: 'none', color: 'inherit' }}>
            <svg 
              className="logo-icon" 
              viewBox="0 0 24 24" 
              width="24" 
              height="24"
            >
              <path 
                fill="currentColor" 
                d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"
              />
            </svg>
            <span className="logo-text">TIKERA</span>
          </Link>
          
          <UserDropdown />
        </div>
      </header>
      <main className="main-content content-container">
        <Routes>
          <Route path="/" element={<Movies initialWeek={currentWeek} />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<ProtectedRoute requireAdmin={true} redirectPath="/" />}>
            <Route path="/admin/movies" element={<MovieList />} />
            <Route path="/admin/screenings" element={<ScreeningList />} />
            <Route path="/admin/add-movie" element={<AddMovie />} />
            <Route path="/admin/add-screening" element={<AddScreening />} />
            <Route path="/admin/edit-movie/:id" element={<EditMovie />} />
            <Route path="/admin/edit-screening/:id" element={<EditScreening />} />
          </Route>
          
          <Route 
            path="/admin" 
            element={
              isAuthenticated && isAdmin
                ? <Navigate to="/admin/movies" replace />
                : <Navigate to="/" replace />
            }
          />
          
          <Route element={<ProtectedRoute requireAdmin={false} redirectPath="/login" />}>
            <Route path="/my-screenings" element={<MyScreenings />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default Home;