import { useTranslation } from 'react-i18next';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { queryClient } from '@/lib/queryClient';
import { DoctorProfile } from '@shared/schema';
import useAvailability from '@/hooks/useAvailability';

interface AvailabilityToggleProps {
  doctorProfile: DoctorProfile | null | undefined;
  isLoading?: boolean;
  className?: string;
}

const AvailabilityToggle = ({ doctorProfile, isLoading = false, className = '' }: AvailabilityToggleProps) => {
  const { t } = useTranslation();
  
  // Use our custom hook for managing availability
  const { isAvailable, isUpdating, toggleAvailability } = useAvailability({
    doctorProfile,
    onSuccess: () => {
      // Invalidate doctor profile query to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/doctors/profile'] });
    }
  });

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Switch
        checked={isAvailable}
        onCheckedChange={toggleAvailability}
        disabled={isLoading || isUpdating || !doctorProfile}
        className={isAvailable ? "bg-green-500" : ""}
        aria-label={t('availability.toggle')}
      />
      <Label htmlFor="availability-mode" className="text-sm font-medium">
        {isAvailable ? t('availability.available') : t('availability.unavailable')}
      </Label>
      {isUpdating && (
        <span className="ml-2 animate-pulse text-primary">
          {t('common.updating')}...
        </span>
      )}
    </div>
  );
};

export default AvailabilityToggle;