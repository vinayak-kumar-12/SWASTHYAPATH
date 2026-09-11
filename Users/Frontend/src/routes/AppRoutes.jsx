import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { PatientProfileRoute } from './PatientProfileRoute';

import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { VerificationPending } from '../pages/auth/VerificationPending';
import { VerifyEmail } from '../pages/auth/VerifyEmail';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { ResetPassword } from '../pages/auth/ResetPassword';

import { Dashboard } from '../pages/dashboard/Dashboard';
import { HealthConcernList } from '../pages/dashboard/HealthConcernList';
import { HealthConcernForm } from '../pages/dashboard/HealthConcernForm';
import { HealthConcernDetails } from '../pages/dashboard/HealthConcernDetails';
import { PatientProfileSetup } from '../pages/patient/PatientProfileSetup';
import { PatientProfileView } from '../pages/patient/PatientProfileView';
import { NotFound } from '../pages/errors/NotFound';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Public / Guest Routes */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verification-pending" element={<VerificationPending />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Mandatory Onboarding Profile Route (Only accessible if logged in but NO patient profile) */}
      <Route element={<PatientProfileRoute />}>
        <Route path="/patient-setup" element={<PatientProfileSetup />} />
      </Route>

      {/* Protected Authenticated Routes (Only accessible after profile setup is complete) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/health-concerns" element={<HealthConcernList />} />
        <Route path="/dashboard/health-concern/new" element={<HealthConcernForm />} />
        <Route path="/dashboard/health-concern/:id" element={<HealthConcernDetails />} />
        <Route path="/patient-profile" element={<PatientProfileView />} />
        {/* Placeholder module routes redirecting to Dashboard */}
        <Route path="/patients" element={<Dashboard />} />
        <Route path="/doctors" element={<Dashboard />} />
        <Route path="/appointments" element={<Dashboard />} />
        <Route path="/documents" element={<Dashboard />} />
        <Route path="/notifications" element={<Dashboard />} />
        <Route path="/settings" element={<Dashboard />} />
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
