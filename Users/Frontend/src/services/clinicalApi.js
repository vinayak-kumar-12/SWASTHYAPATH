import api from './api';
import { CLINICAL_API_BASE_URL } from '../utils/constants';

const getEndpoint = (path) => `${CLINICAL_API_BASE_URL}${path}`;

export const clinicalApi = {
  /**
   * Fetch all health concerns for authenticated patient
   */
  getHealthConcerns: async () => {
    const response = await api.get(getEndpoint('/clinical/health-concerns'));
    return response.data;
  },

  /**
   * Fetch a single health concern by ID
   */
  getHealthConcern: async (id) => {
    const response = await api.get(getEndpoint(`/clinical/health-concerns/${id}`));
    return response.data;
  },

  /**
   * Create a new health concern for authenticated patient
   */
  createHealthConcern: async (concernData) => {
    const response = await api.post(getEndpoint('/clinical/health-concerns'), concernData);
    return response.data;
  },

  /**
   * Update an existing health concern
   */
  updateHealthConcern: async (id, updateData) => {
    const response = await api.put(getEndpoint(`/clinical/health-concerns/${id}`), updateData);
    return response.data;
  },

  /**
   * Delete a health concern
   */
  deleteHealthConcern: async (id) => {
    const response = await api.delete(getEndpoint(`/clinical/health-concerns/${id}`));
    return response.data;
  },
};
