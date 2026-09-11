export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
export const PATIENT_API_BASE_URL = import.meta.env.VITE_PATIENT_API_BASE_URL || 'http://localhost:5002/api/v1';
export const CLINICAL_API_BASE_URL = import.meta.env.VITE_CLINICAL_API_BASE_URL || 'http://localhost:5003/api/v1';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'swasthya_access_token',
  REFRESH_TOKEN: 'swasthya_refresh_token',
  USER_DATA: 'swasthya_user_data',
};

export const ROLES = {
  PATIENT: 'PATIENT',
  DOCTOR: 'DOCTOR',
  ADMIN: 'ADMIN',
};

export const ERROR_CODES = {
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  INVALID_TOKEN: 'INVALID_TOKEN',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  PATIENT_NOT_FOUND: 'PATIENT_NOT_FOUND',
  PATIENT_ALREADY_EXISTS: 'PATIENT_ALREADY_EXISTS',
};
