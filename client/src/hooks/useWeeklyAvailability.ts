import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { apiRequest } from '@/lib/queryClient';
import { DoctorProfile, TimeSlot, WeeklyAvailability } from '@shared/schema';

interface UseWeeklyAvailabilityProps {
  doctorId?: number;
  initialData?: WeeklyAvailability;
  onSuccess?: (weeklyAvailability: WeeklyAvailability) => void;
}

interface UseWeeklyAvailabilityResult {
  weeklyAvailability: WeeklyAvailability;
  isLoading: boolean;
  isUpdating: boolean;
  addTimeSlot: (day: keyof WeeklyAvailability, timeSlot: TimeSlot) => void;
  removeTimeSlot: (day: keyof WeeklyAvailability, index: number) => void;
  updateTimeSlot: (day: keyof WeeklyAvailability, index: number, timeSlot: TimeSlot) => void;
  clearDay: (day: keyof WeeklyAvailability) => void;
  saveWeeklyAvailability: () => Promise<void>;
  fetchWeeklyAvailability: () => Promise<void>;
}

// Default empty weekly availability
const emptyWeeklyAvailability: WeeklyAvailability = {
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: []
};

/**
 * Hook to manage weekly availability for doctors
 */
const useWeeklyAvailability = ({
  doctorId,
  initialData,
  onSuccess
}: UseWeeklyAvailabilityProps): UseWeeklyAvailabilityResult => {
  const [weeklyAvailability, setWeeklyAvailability] = useState<WeeklyAvailability>(
    initialData || emptyWeeklyAvailability
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Fetch weekly availability data from API
  const fetchWeeklyAvailability = useCallback(async () => {
    if (!doctorId) return;

    try {
      setIsLoading(true);
      const response = await apiRequest<DoctorProfile>({ 
        url: `/api/doctors/${doctorId}` 
      });

      if (response && response.weeklyAvailability) {
        setWeeklyAvailability(response.weeklyAvailability as WeeklyAvailability);
      } else {
        setWeeklyAvailability(emptyWeeklyAvailability);
      }
    } catch (error) {
      console.error('Failed to fetch weekly availability:', error);
      toast.error(t('errors.general'));
    } finally {
      setIsLoading(false);
    }
  }, [doctorId, t]);

  // Initialize data
  useEffect(() => {
    if (initialData) {
      setWeeklyAvailability(initialData);
    } else if (doctorId) {
      fetchWeeklyAvailability();
    }
  }, [doctorId, initialData, fetchWeeklyAvailability]);

  // Add a time slot to a specific day
  const addTimeSlot = useCallback((day: keyof WeeklyAvailability, timeSlot: TimeSlot) => {
    setWeeklyAvailability(prev => ({
      ...prev,
      [day]: [...(prev[day] || []), timeSlot]
    }));
  }, []);

  // Remove a time slot from a specific day
  const removeTimeSlot = useCallback((day: keyof WeeklyAvailability, index: number) => {
    setWeeklyAvailability(prev => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index)
    }));
  }, []);

  // Update an existing time slot
  const updateTimeSlot = useCallback((day: keyof WeeklyAvailability, index: number, timeSlot: TimeSlot) => {
    setWeeklyAvailability(prev => ({
      ...prev,
      [day]: prev[day].map((slot, i) => (i === index ? timeSlot : slot))
    }));
  }, []);

  // Clear all time slots for a specific day
  const clearDay = useCallback((day: keyof WeeklyAvailability) => {
    setWeeklyAvailability(prev => ({
      ...prev,
      [day]: []
    }));
  }, []);

  // Validate time slots (basic validation)
  const validateTimeSlots = useCallback((availability: WeeklyAvailability): boolean => {
    const days = Object.keys(availability) as Array<keyof WeeklyAvailability>;
    
    for (const day of days) {
      const slots = availability[day];
      for (const slot of slots) {
        const [startHour, startMinute] = slot.start.split(':').map(Number);
        const [endHour, endMinute] = slot.end.split(':').map(Number);
        
        const startTime = startHour * 60 + startMinute;
        const endTime = endHour * 60 + endMinute;
        
        if (startTime >= endTime) {
          toast.error(t('doctor.invalidTimeSlot'));
          return false;
        }
      }
    }
    
    return true;
  }, [t]);

  // Save weekly availability to API
  const saveWeeklyAvailability = useCallback(async () => {
    if (isUpdating) return;

    if (!validateTimeSlots(weeklyAvailability)) {
      return;
    }

    try {
      setIsUpdating(true);
      
      await apiRequest<{success: boolean}>({
        url: '/api/weekly-availability',
        method: 'PUT',
        data: weeklyAvailability
      });

      toast.success(t('doctor.availabilityUpdated'));
      
      if (onSuccess) {
        onSuccess(weeklyAvailability);
      }
    } catch (error) {
      console.error('Failed to save weekly availability:', error);
      toast.error(t('errors.updateFailed'));
    } finally {
      setIsUpdating(false);
    }
  }, [isUpdating, weeklyAvailability, validateTimeSlots, onSuccess, t]);

  return {
    weeklyAvailability,
    isLoading,
    isUpdating,
    addTimeSlot,
    removeTimeSlot,
    updateTimeSlot,
    clearDay,
    saveWeeklyAvailability,
    fetchWeeklyAvailability
  };
};

export default useWeeklyAvailability;