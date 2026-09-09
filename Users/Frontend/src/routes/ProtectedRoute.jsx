import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader } from '../components/common/Loader';

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, isCheckingProfile, hasPatientProfile } = useAuth();

  if (isLoading || isCheckingProfile) {
    return <Loader fullPage message="Verifying patient security session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Enforce mandatory patient profile setup before allowing access to main dashboard
  if (!hasPatientProfile) {
    return <Navigate to="/patient-setup" replace />;
  }

  return <Outlet />;
};

