import { clinicalApi } from './clinicalApi';
import { INITIAL_MOCK_CONCERNS } from '../data/mockHealthConcerns';

const LOCAL_STORAGE_KEY = 'swasthya_health_concerns';

// Helper to normalize Mongo document or local item into standard frontend presentation format
const normalizeConcern = (item) => {
  if (!item) return null;

  const id = item._id ? item._id.toString() : item.id;
  const concernTitle =
    typeof item.concern === 'object' && item.concern !== null
      ? item.concern.title
      : item.concern || item.title || 'Health Concern';

  const description =
    typeof item.concern === 'object' && item.concern !== null
      ? item.concern.description
      : item.description || '';

  const category =
    typeof item.concern === 'object' && item.concern !== null
      ? item.concern.category
      : item.category || 'General';

  const onset = item.details?.onset || item.onset || 'Today';
  const severity = item.details?.severity !== undefined ? item.details.severity : item.severity || 5;
  const frequency = item.details?.frequency || item.frequency || 'Constant';
  const location = item.details?.location || item.location || 'Not specified';
  const triggers = item.details?.triggers || item.triggers || 'None reported';
  const relievingFactors = item.details?.relievingFactors || item.relievingFactors || 'None reported';

  const associatedSymptoms = Array.isArray(item.associatedSymptoms) ? item.associatedSymptoms : [];

  const formatList = (val) => {
    if (Array.isArray(val)) return val.join(', ');
    return val || 'None reported';
  };

  const medicalConditions = formatList(item.healthContext?.medicalConditions || item.medicalConditions);
  const medications = formatList(item.healthContext?.medications || item.medications);
  const allergies = formatList(item.healthContext?.allergies || item.allergies);
  const previousTreatment = item.healthContext?.previousTreatment || item.previousTreatment || 'None reported';
  const additionalInformation = item.healthContext?.additionalInformation || item.additionalInformation || '';

  return {
    ...item,
    id,
    _id: id,
    concern: concernTitle,
    description,
    category,
    onset,
    severity,
    frequency,
    location,
    triggers,
    relievingFactors,
    associatedSymptoms,
    medicalConditions,
    medications,
    allergies,
    previousTreatment,
    additionalInformation,
    status: item.status || 'Awaiting Review',
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
  };
};

export const healthConcernService = {
  /**
   * Fetch all health concerns for authenticated patient
   */
  getHealthConcerns: async () => {
    try {
      const response = await clinicalApi.getHealthConcerns();
      if (response && response.success && Array.isArray(response.data)) {
        return response.data.map(normalizeConcern);
      }
    } catch (err) {
      console.warn('Clinical Service API unavailable, checking local storage fallback:', err?.message);
    }

    // Fallback to local storage
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      const items = stored ? JSON.parse(stored) : INITIAL_MOCK_CONCERNS;
      return items.map(normalizeConcern).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (err) {
      return INITIAL_MOCK_CONCERNS.map(normalizeConcern);
    }
  },

  /**
   * Fetch single health concern by ID
   */
  getHealthConcernById: async (id) => {
    try {
      const response = await clinicalApi.getHealthConcern(id);
      if (response && response.success && response.data) {
        return normalizeConcern(response.data);
      }
    } catch (err) {
      console.warn(`Clinical Service API error for ID ${id}, checking local fallback:`, err?.message);
    }

    // Fallback to local storage
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      const items = stored ? JSON.parse(stored) : INITIAL_MOCK_CONCERNS;
      const found = items.find((item) => item.id === id || item._id === id);
      return found ? normalizeConcern(found) : null;
    } catch (err) {
      return null;
    }
  },

  /**
   * Create a new health concern
   */
  createHealthConcern: async (formData) => {
    try {
      const payload = {
        concern: {
          title: formData.concern.trim(),
          description: formData.description.trim(),
          category: formData.category || 'General',
        },
        description: formData.description.trim(),
        category: formData.category || 'General',
        onset: formData.onset || 'Today',
        severity: Number(formData.severity) || 5,
        frequency: formData.frequency || 'Constant',
        location: formData.location ? formData.location.trim() : 'Not specified',
        triggers: formData.triggers ? formData.triggers.trim() : 'None reported',
        relievingFactors: formData.relievingFactors ? formData.relievingFactors.trim() : 'None reported',
        associatedSymptoms: Array.isArray(formData.associatedSymptoms) ? formData.associatedSymptoms : [],
        medicalConditions: formData.medicalConditions ? formData.medicalConditions.trim() : '',
        medications: formData.medications ? formData.medications.trim() : '',
        allergies: formData.allergies ? formData.allergies.trim() : '',
        previousTreatment: formData.previousTreatment ? formData.previousTreatment.trim() : '',
        additionalInformation: formData.additionalInformation ? formData.additionalInformation.trim() : '',
      };

      const response = await clinicalApi.createHealthConcern(payload);
      if (response && response.success && response.data) {
        return normalizeConcern(response.data);
      }
    } catch (err) {
      console.warn('Clinical API creation failed, saving to local storage fallback:', err?.message);
    }

    // Local Storage Fallback
    const localNew = {
      id: `hc-${Date.now().toString().slice(-6)}`,
      concern: formData.concern.trim(),
      category: formData.category || 'General',
      description: formData.description.trim(),
      onset: formData.onset || 'Today',
      severity: Number(formData.severity) || 5,
      frequency: formData.frequency || 'Constant',
      location: formData.location ? formData.location.trim() : 'Not specified',
      triggers: formData.triggers ? formData.triggers.trim() : 'None reported',
      relievingFactors: formData.relievingFactors ? formData.relievingFactors.trim() : 'None reported',
      associatedSymptoms: Array.isArray(formData.associatedSymptoms) ? formData.associatedSymptoms : [],
      medicalConditions: formData.medicalConditions || 'None reported',
      medications: formData.medications || 'None reported',
      allergies: formData.allergies || 'None reported',
      previousTreatment: formData.previousTreatment || 'None reported',
      additionalInformation: formData.additionalInformation || '',
      status: 'Awaiting Review',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      const items = stored ? JSON.parse(stored) : [...INITIAL_MOCK_CONCERNS];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([localNew, ...items]));
    } catch (err) {
      console.error('Failed to save to local fallback:', err);
    }

    return normalizeConcern(localNew);
  },

  /**
   * Update an existing health concern
   */
  updateHealthConcern: async (id, updateData) => {
    try {
      const response = await clinicalApi.updateHealthConcern(id, updateData);
      if (response && response.success && response.data) {
        return normalizeConcern(response.data);
      }
    } catch (err) {
      console.warn('Clinical API update failed:', err?.message);
    }
    return null;
  },

  /**
   * Delete a health concern
   */
  deleteHealthConcern: async (id) => {
    try {
      const response = await clinicalApi.deleteHealthConcern(id);
      return response?.success || false;
    } catch (err) {
      console.warn('Clinical API delete failed:', err?.message);
      return false;
    }
  },
};
