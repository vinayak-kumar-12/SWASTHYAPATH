import { STORAGE_KEYS } from './constants';

export const storage = {
  getAccessToken: () => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch {
      return null;
    }
  },
  setAccessToken: (token) => {
    try {
      if (token) localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    } catch (err) {
      console.error('Error saving access token', err);
    }
  },
  getRefreshToken: () => {
    try {
      return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch {
      return null;
    }
  },
  setRefreshToken: (token) => {
    try {
      if (token) localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
    } catch (err) {
      console.error('Error saving refresh token', err);
    }
  },
  getUser: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  setUser: (user) => {
    try {
      if (user) localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    } catch (err) {
      console.error('Error saving user data', err);
    }
  },
  clearAuth: () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (err) {
      console.error('Error clearing auth storage', err);
    }
  },
};
