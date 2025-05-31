import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { DoctorProfile } from '@shared/schema';

interface UseAvailabilityProps {
  doctorProfile: DoctorProfile | null | undefined;
  onSuccess?: (isAvailable: boolean) => void;
}

interface UseAvailabilityResult {
  isAvailable: boolean;
  isUpdating: boolean;
  toggleAvailability: () => Promise<void>;
  setAvailability: (value: boolean) => Promise<void>;
}

const useAvailability = ({ doctorProfile, onSuccess }: UseAvailabilityProps): UseAvailabilityResult => {
  const [isAvailable, setIsAvailable] = useState<boolean>(doctorProfile?.isAvailable || false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Function to update availability status
  const updateAvailability = useCallback(async (newStatus: boolean) => {
    if (!doctorProfile || isUpdating) return;

    try {
      setIsUpdating(true);
      
      // API call to update availability
      const response = await fetch('/api/availability', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ available: newStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || t('errors.updateFailed'));
      }

      // Update local state
      setIsAvailable(newStatus);
      
      // Show success notification
      toast.success(newStatus ? t('available') : t('not_available'));
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(newStatus);
      }
    } catch (error) {
      console.error('Failed to update availability:', error);
      toast.error(t('errors.updateFailed'));
    } finally {
      setIsUpdating(false);
    }
  }, [doctorProfile, isUpdating, onSuccess, t]);

  // Toggle availability (switch between true and false)
  const toggleAvailability = useCallback(async () => {
    await updateAvailability(!isAvailable);
  }, [isAvailable, updateAvailability]);

  // Set availability to a specific value
  const setAvailability = useCallback(async (value: boolean) => {
    await updateAvailability(value);
  }, [updateAvailability]);

  return {
    isAvailable,
    isUpdating,
    toggleAvailability,
    setAvailability
  };
};

export default useAvailability;