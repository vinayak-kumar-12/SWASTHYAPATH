import { useState, useEffect, useCallback } from 'react';
import { healthConcernService } from '../services/healthConcernService';

export const useHealthConcerns = (concernId = null) => {
  const [concerns, setConcerns] = useState([]);
  const [activeConcern, setActiveConcern] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchConcerns = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await healthConcernService.getHealthConcerns();
      setConcerns(data || []);
    } catch (err) {
      setError(err.message || 'Unable to load your health concerns. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchConcernById = useCallback(async (id) => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await healthConcernService.getHealthConcernById(id);
      setActiveConcern(data);
      if (!data) {
        setError('Health concern not found');
      }
    } catch (err) {
      setError(err.message || 'Unable to load health concern details');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (concernId) {
      fetchConcernById(concernId);
    } else {
      fetchConcerns();
    }
  }, [concernId, fetchConcerns, fetchConcernById]);

  const submitConcern = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const created = await healthConcernService.createHealthConcern(formData);
      setConcerns((prev) => [created, ...prev]);
      setActiveConcern(created);
      return created;
    } catch (err) {
      setError(err.message || 'Failed to submit health concern. Please try again.');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateConcern = async (id, updateData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const updated = await healthConcernService.updateHealthConcern(id, updateData);
      if (updated) {
        setActiveConcern(updated);
        setConcerns((prev) => prev.map((item) => (item.id === id ? updated : item)));
      }
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to update health concern');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    concerns,
    activeConcern,
    isLoading,
    isSubmitting,
    error,
    refreshConcerns: fetchConcerns,
    fetchConcernById,
    submitConcern,
    updateConcern,
  };
};
