import api from './api';

export const authApi = {
  registerUser: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  loginUser: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  verifyEmail: async (token) => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },

  resendVerification: async (email) => {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async ({ token, newPassword }) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logoutUser: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch {
      // Ignore network failure on logout
      return { success: true };
    }
  },

  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },
};
