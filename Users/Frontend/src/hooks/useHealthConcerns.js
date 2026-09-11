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
      setConcerns(data);
    } catch (err) {
      setError(err.message || 'Failed to load health concerns');
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
    } catch (err) {
      setError(err.message || 'Failed to load concern details');
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
      setError(err.message || 'Failed to submit health concern');
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
  };
};
