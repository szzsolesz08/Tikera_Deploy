import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ requireAdmin, redirectPath = '/login' }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Betöltés...</div>;
  }
  
  if (requireAdmin && (!isAuthenticated || !isAdmin)) {
    return <Navigate to={redirectPath} replace />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
