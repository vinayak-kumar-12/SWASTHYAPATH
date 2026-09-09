import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader } from '../components/common/Loader';

export const PatientProfileRoute = () => {
  const { isAuthenticated, isLoading, isCheckingProfile, hasPatientProfile } = useAuth();

  if (isLoading || isCheckingProfile) {
    return <Loader fullPage message="Checking onboarding status..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If patient profile is already completed, redirect directly to dashboard
  if (hasPatientProfile) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
