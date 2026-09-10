import React, { createContext, useState, useEffect, useCallback } from 'react';
import { storage } from '../utils/storage';
import { authApi } from '../services/authApi';
import { patientApi } from '../services/patientApi';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => storage.getUser());
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(storage.getAccessToken()));
  const [isLoading, setIsLoading] = useState(true);
  const [patientProfile, setPatientProfile] = useState(null);
  const [hasPatientProfile, setHasPatientProfile] = useState(false);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);

  // Fetch patient profile for authenticated user
  const fetchPatientProfile = useCallback(async () => {
    setIsCheckingProfile(true);
    try {
      const response = await patientApi.getMyProfile();
      if (response?.success && response?.data) {
        setPatientProfile(response.data);
        setHasPatientProfile(true);
        return { hasProfile: true, profile: response.data };
      } else {
        setPatientProfile(null);
        setHasPatientProfile(false);
        return { hasProfile: false, profile: null };
      }
    } catch (err) {
      if (err?.code === 'PATIENT_NOT_FOUND' || (err?.statusCode === 404 && err?.code === 'PATIENT_NOT_FOUND')) {
        setPatientProfile(null);
        setHasPatientProfile(false);
        return { hasProfile: false, profile: null };
      }
      // Non-404 error (e.g. 401 unauth or network error)
      setPatientProfile(null);
      setHasPatientProfile(false);
      return { hasProfile: false, profile: null, error: err };
    } finally {
      setIsCheckingProfile(false);
    }
  }, []);

  // Initialize and verify authentication state on mount
  const checkAuth = useCallback(async () => {
    const token = storage.getAccessToken();
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      setPatientProfile(null);
      setHasPatientProfile(false);
      setIsCheckingProfile(false);
      setIsLoading(false);
      return;
    }

    try {
      const response = await authApi.getCurrentUser();
      if (response?.success && response?.data) {
        setUser(response.data);
        storage.setUser(response.data);
        setIsAuthenticated(true);
        // Verify patient profile status
        await fetchPatientProfile();
      } else {
        storage.clearAuth();
        setUser(null);
        setIsAuthenticated(false);
        setPatientProfile(null);
        setHasPatientProfile(false);
        setIsCheckingProfile(false);
      }
    } catch {
      storage.clearAuth();
      setUser(null);
      setIsAuthenticated(false);
      setPatientProfile(null);
      setHasPatientProfile(false);
      setIsCheckingProfile(false);
    } finally {
      setIsLoading(false);
    }
  }, [fetchPatientProfile]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials) => {
    const response = await authApi.loginUser(credentials);
    if (response?.success && response?.data) {
      const { user: userData, accessToken, refreshToken } = response.data;
      storage.setAccessToken(accessToken);
      if (refreshToken) storage.setRefreshToken(refreshToken);
      storage.setUser(userData);
      setUser(userData);
      setIsAuthenticated(true);
      // Fetch profile state upon login
      await fetchPatientProfile();
    }
    return response;
  };

  const register = async (userData) => {
    const response = await authApi.registerUser(userData);
    return response;
  };

  const logout = async () => {
    try {
      await authApi.logoutUser();
    } finally {
      storage.clearAuth();
      setUser(null);
      setIsAuthenticated(false);
      setPatientProfile(null);
      setHasPatientProfile(false);
      setIsCheckingProfile(false);
    }
  };

  const updateUserState = (updatedUser) => {
    setUser(updatedUser);
    storage.setUser(updatedUser);
  };

  const createPatientProfile = async (profileData) => {
    const response = await patientApi.createProfile(profileData);
    if (response?.success && response?.data) {
      setPatientProfile(response.data);
      setHasPatientProfile(true);
    }
    return response;
  };

  const updatePatientProfile = async (profileData) => {
    const response = await patientApi.updateProfile(profileData);
    if (response?.success && response?.data) {
      setPatientProfile(response.data);
    }
    return response;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        patientProfile,
        hasPatientProfile,
        isCheckingProfile,
        login,
        register,
        logout,
        checkAuth,
        updateUserState,
        fetchPatientProfile,
        createPatientProfile,
        updatePatientProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

