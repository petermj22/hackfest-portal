import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingOverlay from '../pages/authentication-screen/components/LoadingOverlay';

const ProtectedRoute = ({ children, requireAuth = true, redirectTo = '/authentication-screen' }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingOverlay isVisible={true} />;
  }

  if (requireAuth && !user) {
    // Redirect to authentication screen, but save the attempted location
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (!requireAuth && user) {
    // If user is authenticated but trying to access auth pages, redirect to dashboard
    return <Navigate to="/team-dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
