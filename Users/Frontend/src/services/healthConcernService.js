import { INITIAL_MOCK_CONCERNS } from '../data/mockHealthConcerns';

const STORAGE_KEY = 'swasthya_health_concerns';

const initializeStorage = () => {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_CONCERNS));
    }
  } catch (error) {
    console.error('Error initializing health concerns storage:', error);
  }
};

export const healthConcernService = {
  /**
   * Fetch all health concerns for current patient
   */
  getHealthConcerns: async () => {
    initializeStorage();
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const items = data ? JSON.parse(data) : INITIAL_MOCK_CONCERNS;
      return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Failed to get health concerns:', error);
      return INITIAL_MOCK_CONCERNS;
    }
  },

  /**
   * Fetch a single health concern by ID
   */
  getHealthConcernById: async (id) => {
    initializeStorage();
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const items = data ? JSON.parse(data) : INITIAL_MOCK_CONCERNS;
      const found = items.find((item) => item.id === id);
      return found || null;
    } catch (error) {
      console.error('Failed to get health concern by id:', error);
      return null;
    }
  },

  /**
   * Create a new health concern submission
   */
  createHealthConcern: async (formData) => {
    initializeStorage();
    // Simulate brief network latency for realistic submission feel
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newConcern = {
      id: `hc-${Date.now().toString().slice(-6)}`,
      patientId: formData.patientId || 'patient-demo-01',
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
      medicalConditions: formData.medicalConditions ? formData.medicalConditions.trim() : 'None reported',
      medications: formData.medications ? formData.medications.trim() : 'None reported',
      allergies: formData.allergies ? formData.allergies.trim() : 'None reported',
      previousTreatment: formData.previousTreatment ? formData.previousTreatment.trim() : 'None reported',
      additionalInformation: formData.additionalInformation ? formData.additionalInformation.trim() : '',
      status: 'Awaiting Review',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const items = data ? JSON.parse(data) : [...INITIAL_MOCK_CONCERNS];
      const updated = [newConcern, ...items];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return newConcern;
    } catch (error) {
      console.error('Failed to save new health concern:', error);
      throw new Error('Failed to save health concern. Please try again.');
    }
  },
};
