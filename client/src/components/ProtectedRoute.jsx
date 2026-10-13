import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole === 'ADMIN' && user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  if (requiredRole === 'BARBER' && user?.role !== 'BARBER' && user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children;
};
