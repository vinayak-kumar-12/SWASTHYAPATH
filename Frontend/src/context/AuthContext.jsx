import React, { createContext, useState, useEffect, useCallback } from 'react';
import { storage } from '../utils/storage';
import { authApi } from '../services/authApi';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => storage.getUser());
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(storage.getAccessToken()));
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and verify authentication state on mount
  const checkAuth = useCallback(async () => {
    const token = storage.getAccessToken();
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    try {
      const response = await authApi.getCurrentUser();
      if (response?.success && response?.data) {
        setUser(response.data);
        storage.setUser(response.data);
        setIsAuthenticated(true);
      } else {
        storage.clearAuth();
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch {
      storage.clearAuth();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    }
  };

  const updateUserState = (updatedUser) => {
    setUser(updatedUser);
    storage.setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        checkAuth,
        updateUserState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
