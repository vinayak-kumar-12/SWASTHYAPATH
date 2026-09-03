import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader } from '../components/common/Loader';

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loader fullPage message="Verifying session security..." />;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
