import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CalendarCheck,
  ThumbsUp,
  Car,
  DoorOpen,
  Stethoscope,
  CheckCircle,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

type AppointmentStatus = 
  'scheduled' | 
  'confirmed' | 
  'en_route' | 
  'arrived' | 
  'in_progress' | 
  'completed' | 
  'canceled';

interface StatusStep {
  status: AppointmentStatus;
  icon: React.ReactNode;
  label: string;
  description: string;
}

interface AppointmentJourneyMapProps {
  currentStatus: AppointmentStatus;
  appointmentDate: string;
  completedDate?: string;
  className?: string;
}

export function AppointmentJourneyMap({ 
  currentStatus,
  appointmentDate,
  completedDate,
  className 
}: AppointmentJourneyMapProps) {
  const { t } = useTranslation();
  
  if (currentStatus === 'canceled') {
    return (
      <div className={cn("w-full p-6 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800", className)}>
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
          {t('appointment.status.canceled')}
        </h3>
        <p className="text-sm text-red-600 dark:text-red-400">
          {t('appointment.canceled_description')}
        </p>
      </div>
    );
  }
  
  const statusSteps: StatusStep[] = [
    {
      status: 'scheduled',
      icon: <CalendarCheck className="h-6 w-6" />,
      label: t('appointment.status.scheduled'),
      description: t('appointment.scheduled_description')
    },
    {
      status: 'confirmed',
      icon: <ThumbsUp className="h-6 w-6" />,
      label: t('appointment.status.confirmed'),
      description: t('appointment.confirmed_description')
    },
    {
      status: 'en_route',
      icon: <Car className="h-6 w-6" />,
      label: t('appointment.status.en_route'),
      description: t('appointment.en_route_description')
    },
    {
      status: 'arrived',
      icon: <DoorOpen className="h-6 w-6" />,
      label: t('appointment.status.arrived'),
      description: t('appointment.arrived_description')
    },
    {
      status: 'in_progress',
      icon: <Stethoscope className="h-6 w-6" />,
      label: t('appointment.status.in_progress'),
      description: t('appointment.in_progress_description')
    },
    {
      status: 'completed',
      icon: <CheckCircle className="h-6 w-6" />,
      label: t('appointment.status.completed'),
      description: t('appointment.completed_description')
    }
  ];
  
  // Find current step index
  const currentStatusIndex = statusSteps.findIndex(step => step.status === currentStatus);
  
  return (
    <div className={cn("w-full p-6 bg-background rounded-lg border", className)}>
      <h3 className="text-lg font-semibold mb-6">
        {t('appointment.journey_title')}
      </h3>
      
      <div className="space-y-8">
        {statusSteps.map((step, index) => {
          const isCompleted = index <= currentStatusIndex;
          const isCurrent = index === currentStatusIndex;
          
          return (
            <div key={step.status} className="relative">
              {/* Connector line */}
              {index < statusSteps.length - 1 && (
                <div 
                  className={cn(
                    "absolute left-6 top-10 w-0.5 h-12 -ml-[1px]",
                    isCompleted ? "bg-primary" : "bg-border"
                  )}
                />
              )}
              
              {/* Step content */}
              <div className="flex items-start gap-4">
                <div 
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-full shrink-0",
                    isCompleted 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {step.icon}
                </div>
                
                <div>
                  <h4 className={cn(
                    "text-base font-medium flex items-center gap-2",
                    isCompleted ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.label}
                    {isCurrent && <Clock className="h-4 w-4 text-primary animate-pulse" />}
                  </h4>
                  
                  <p className={cn(
                    "text-sm mt-1",
                    isCompleted ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.description}
                  </p>
                  
                  {/* Timestamp for the current step */}
                  {isCurrent && (
                    <p className="text-xs text-primary mt-2">
                      {
                        step.status === 'scheduled' 
                          ? t('appointment.scheduled_for', { date: new Date(appointmentDate).toLocaleString() })
                          : step.status === 'completed' && completedDate
                            ? t('appointment.completed_at', { date: new Date(completedDate).toLocaleString() })
                            : t('appointment.status_updated_at', { date: new Date().toLocaleString() })
                      }
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AppointmentJourneyMap;