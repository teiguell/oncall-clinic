import { useTranslation } from 'react-i18next';
import { WeeklyAvailability, TimeSlot } from '@shared/schema';
import TimeSlotBlock from './TimeSlotBlock';
import { Loader2 } from 'lucide-react';

interface WeeklyAvailabilityCalendarProps {
  availability: WeeklyAvailability;
  onRemoveTimeSlot: (day: keyof WeeklyAvailability, index: number) => void;
  isLoading?: boolean;
}

const WeeklyAvailabilityCalendar = ({ 
  availability, 
  onRemoveTimeSlot,
  isLoading = false
}: WeeklyAvailabilityCalendarProps) => {
  const { t } = useTranslation();
  
  // Create array of days for the header
  const days = [
    { key: 'monday', label: t('days.monday') },
    { key: 'tuesday', label: t('days.tuesday') },
    { key: 'wednesday', label: t('days.wednesday') },
    { key: 'thursday', label: t('days.thursday') },
    { key: 'friday', label: t('days.friday') },
    { key: 'saturday', label: t('days.saturday') },
    { key: 'sunday', label: t('days.sunday') }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        <p>{t('common.loading')}</p>
      </div>
    );
  }
  
  return (
    <div className="border rounded-md overflow-hidden bg-white">
      {/* Calendar header - days of the week */}
      <div className="grid grid-cols-7 bg-neutral-50 border-b">
        {days.map(day => (
          <div 
            key={day.key} 
            className="p-2 text-center font-medium text-sm border-r last:border-r-0"
          >
            {day.label}
          </div>
        ))}
      </div>
      
      {/* Calendar body */}
      <div className="grid grid-cols-7 min-h-[300px]">
        {days.map(day => (
          <div 
            key={day.key} 
            className="p-2 border-r last:border-r-0 border-b"
          >
            {/* Time slots for this day */}
            <div className="space-y-2">
              {availability[day.key as keyof WeeklyAvailability]?.length > 0 ? (
                availability[day.key as keyof WeeklyAvailability].map((slot: TimeSlot, index: number) => (
                  <TimeSlotBlock 
                    key={`${day.key}-${index}`}
                    timeSlot={slot}
                    onRemove={() => onRemoveTimeSlot(day.key as keyof WeeklyAvailability, index)}
                  />
                ))
              ) : (
                <p className="text-xs text-neutral-400 text-center py-2">
                  {t('doctor.noTimeSlots')}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyAvailabilityCalendar;