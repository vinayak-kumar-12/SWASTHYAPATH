import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';

import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { VerificationPending } from '../pages/auth/VerificationPending';
import { VerifyEmail } from '../pages/auth/VerifyEmail';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { ResetPassword } from '../pages/auth/ResetPassword';

import { Dashboard } from '../pages/dashboard/Dashboard';
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

      {/* Protected Authenticated Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
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
