import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { storage } from '../utils/storage';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach Authorization Bearer token to requests
api.interceptors.request.use(
  (config) => {
    const token = storage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for refresh token handling and error normalization
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors (e.g. server unreachable or CORS block)
    if (!error.response) {
      return Promise.reject({
        statusCode: 0,
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to the server. Please check your internet connection or verify if the Auth Service is running on http://localhost:5000.',
        details: [],
      });
    }

    // Normalize error object
    const errorResponse = error.response?.data || {};
    const statusCode = error.response?.status || 500;
    const errorCode = errorResponse.error?.code || errorResponse.code || 'UNKNOWN_ERROR';
    const message =
      errorResponse.error?.message ||
      errorResponse.message ||
      error.message ||
      'An unexpected error occurred';

    // Handle token refresh on 401 UNAUTHORIZED
    if (
      statusCode === 401 &&
      errorCode !== 'INVALID_CREDENTIALS' &&
      !originalRequest._retry &&
      storage.getRefreshToken()
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = storage.getRefreshToken();
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });

        if (data?.success && data?.data?.accessToken) {
          storage.setAccessToken(data.data.accessToken);
          if (data.data.refreshToken) {
            storage.setRefreshToken(data.data.refreshToken);
          }
          originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        storage.clearAuth();
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject({
      statusCode,
      code: errorCode,
      message,
      details: errorResponse.error?.details || [],
    });
  }
);

export default api;
