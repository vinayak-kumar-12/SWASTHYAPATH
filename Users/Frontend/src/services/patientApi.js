import api from './api';
import { PATIENT_API_BASE_URL } from '../utils/constants';

// Helper to construct endpoint URL cleanly
const getEndpoint = (path) => `${PATIENT_API_BASE_URL}${path}`;

export const patientApi = {
  getMyProfile: async () => {
    try {
      const response = await api.get(getEndpoint('/patients/me'));
      return response.data;
    } catch (err) {
      // Fallback try relative URL in case gateway is proxying /patients/me
      if (err?.statusCode === 404 && err?.code === 'ROUTE_NOT_FOUND') {
        try {
          const fallbackRes = await api.get('/patients/me');
          return fallbackRes.data;
        } catch (fallbackErr) {
          throw fallbackErr;
        }
      }
      throw err;
    }
  },

  createProfile: async (patientData) => {
    try {
      const response = await api.post(getEndpoint('/patients'), patientData);
      return response.data;
    } catch (err) {
      if (err?.statusCode === 404 && err?.code === 'ROUTE_NOT_FOUND') {
        const fallbackRes = await api.post('/patients', patientData);
        return fallbackRes.data;
      }
      throw err;
    }
  },

  updateProfile: async (patientData) => {
    try {
      const response = await api.put(getEndpoint('/patients/me'), patientData);
      return response.data;
    } catch (err) {
      if (err?.statusCode === 404 && err?.code === 'ROUTE_NOT_FOUND') {
        const fallbackRes = await api.put('/patients/me', patientData);
        return fallbackRes.data;
      }
      throw err;
    }
  },
};
