import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = () => {
    const authenticated = authAPI.isAuthenticated();
    setIsAuthenticated(authenticated);
    
    if (authenticated) {
      const userData = authAPI.getCurrentUser();
      setUser(userData);
      
      setIsAdmin(userData?.role === 'admin');
    } else {
      setUser(null);
      setIsAdmin(false);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
    
    window.addEventListener('auth-change', checkAuth);
    return () => window.removeEventListener('auth-change', checkAuth);
  }, []);

  const contextValue = {
    user,
    isAuthenticated,
    isAdmin,
    loading,
    checkAuth,
    hasRole: (role) => {
      if (!isAuthenticated || !user) return false;
      return user.role === role;
    },
    isUser: () => isAuthenticated && user && user.role === 'user',
    isAdminUser: () => isAuthenticated && user && user.role === 'admin',
    isVisitor: () => !isAuthenticated
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
