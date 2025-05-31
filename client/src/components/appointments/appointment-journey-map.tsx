import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  CalendarIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  TruckIcon, 
  HomeIcon, 
  ActivityIcon, 
  CheckIcon 
} from 'lucide-react';

// Status mapping:
// "scheduled" → "confirmed" → "en_route" → "arrived" → "in_progress" → "completed"
// or "canceled" at any point

type AppointmentStatus = 
  | 'scheduled' 
  | 'confirmed' 
  | 'en_route' 
  | 'arrived' 
  | 'in_progress' 
  | 'completed' 
  | 'canceled';

interface AppointmentJourneyMapProps {
  status: AppointmentStatus;
  isMobile?: boolean;
  appointmentTime?: Date;
  arrivalTime?: Date | null;
  completionTime?: Date | null;
  estimatedArrival?: string | null;
  doctorName?: string;
  patientName?: string;
  userType: 'patient' | 'doctor';
}

export default function AppointmentJourneyMap({
  status,
  isMobile = false,
  appointmentTime,
  arrivalTime,
  completionTime,
  estimatedArrival,
  doctorName,
  patientName,
  userType
}: AppointmentJourneyMapProps) {
  const [activeStep, setActiveStep] = useState<number>(0);
  
  const steps = [
    {
      status: 'scheduled',
      title: t('appointment.status.scheduled'),
      icon: <CalendarIcon className="h-5 w-5" />,
      isComplete: ['scheduled', 'confirmed', 'en_route', 'arrived', 'in_progress', 'completed'].includes(status),
      isCurrent: status === 'scheduled',
    },
    {
      status: 'confirmed',
      title: t('appointment.status.confirmed'),
      icon: <CheckCircleIcon className="h-5 w-5" />,
      isComplete: ['confirmed', 'en_route', 'arrived', 'in_progress', 'completed'].includes(status),
      isCurrent: status === 'confirmed',
    },
    {
      status: 'en_route',
      title: t('appointment.status.en_route'),
      icon: <TruckIcon className="h-5 w-5" />,
      isComplete: ['en_route', 'arrived', 'in_progress', 'completed'].includes(status),
      isCurrent: status === 'en_route',
    },
    {
      status: 'arrived',
      title: t('appointment.status.arrived'),
      icon: <HomeIcon className="h-5 w-5" />,
      isComplete: ['arrived', 'in_progress', 'completed'].includes(status),
      isCurrent: status === 'arrived',
    },
    {
      status: 'in_progress',
      title: t('appointment.status.in_progress'),
      icon: <ActivityIcon className="h-5 w-5" />,
      isComplete: ['in_progress', 'completed'].includes(status),
      isCurrent: status === 'in_progress',
    },
    {
      status: 'completed',
      title: t('appointment.status.completed'),
      icon: <CheckIcon className="h-5 w-5" />,
      isComplete: ['completed'].includes(status),
      isCurrent: status === 'completed',
    },
  ];

  // Find active step based on status
  useEffect(() => {
    if (status === 'canceled') {
      setActiveStep(-1); // Special case for canceled
    } else {
      const activeIndex = steps.findIndex(step => step.status === status);
      setActiveStep(activeIndex >= 0 ? activeIndex : 0);
    }
  }, [status, steps]);

  if (status === 'canceled') {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <XCircleIcon className="h-8 w-8 text-red-500 mr-2" />
            <div>
              <h3 className="font-semibold text-red-700">{t('appointment.status.canceled')}</h3>
              <p className="text-sm text-red-600">
                {userType === 'patient' 
                  ? t('appointment.canceled.patientMessage', { doctorName }) 
                  : t('appointment.canceled.doctorMessage', { patientName })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isMobile) {
    // Mobile layout (vertical)
    return (
      <div className="space-y-4 px-2 py-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-lg">{t('appointment.journey.title')}</h3>
          <Badge variant={status === 'completed' ? 'default' : 'outline'}>
            {t(`appointment.status.${status}`)}
          </Badge>
        </div>
        
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div 
              key={step.status} 
              className={`flex items-start ${index <= activeStep ? '' : 'opacity-40'}`}
            >
              <div className="flex flex-col items-center mr-4">
                <div 
                  className={`
                    rounded-full p-2 flex items-center justify-center
                    ${step.isComplete ? 'bg-primary text-primary-foreground' : 
                      step.isCurrent ? 'bg-primary/20 text-primary border border-primary' : 
                      'bg-neutral-100 text-neutral-400'}
                  `}
                >
                  {step.icon}
                </div>
                {index < steps.length - 1 && (
                  <div 
                    className={`w-0.5 h-8 ${
                      index < activeStep ? 'bg-primary' : 'bg-neutral-200'
                    }`}
                  />
                )}
              </div>
              <div className="pt-1">
                <p className="font-medium">{step.title}</p>
                {step.isCurrent && estimatedArrival && step.status === 'en_route' && (
                  <p className="text-sm text-neutral-500">
                    {t('appointment.journey.eta')}: {estimatedArrival}
                  </p>
                )}
                {step.status === 'arrived' && arrivalTime && (
                  <p className="text-sm text-neutral-500">
                    {t('appointment.journey.arrivedAt')}: {arrivalTime.toLocaleTimeString()}
                  </p>
                )}
                {step.status === 'completed' && completionTime && (
                  <p className="text-sm text-neutral-500">
                    {t('appointment.journey.completedAt')}: {completionTime.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Desktop layout (horizontal)
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-medium text-lg">{t('appointment.journey.title')}</h3>
          <Badge variant={status === 'completed' ? 'default' : 'outline'}>
            {t(`appointment.status.${status}`)}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.status} className="flex flex-col items-center relative">
              <div 
                className={`
                  rounded-full p-3 flex items-center justify-center mb-2
                  ${step.isComplete ? 'bg-primary text-primary-foreground' : 
                    step.isCurrent ? 'bg-primary/20 text-primary border border-primary' : 
                    'bg-neutral-100 text-neutral-400'}
                `}
              >
                {step.icon}
              </div>
              <p className={`text-sm font-medium ${index <= activeStep ? 'text-neutral-900' : 'text-neutral-400'}`}>
                {step.title}
              </p>
              
              {/* Additional time info */}
              {step.isCurrent && estimatedArrival && step.status === 'en_route' && (
                <p className="text-xs text-neutral-500 absolute -bottom-5 whitespace-nowrap">
                  ETA: {estimatedArrival}
                </p>
              )}
              
              {/* Connect steps with lines */}
              {index < steps.length - 1 && (
                <div 
                  className={`absolute top-5 left-full w-full h-0.5 -ml-2 ${
                    index < activeStep ? 'bg-primary' : 'bg-neutral-200'
                  }`} 
                  style={{ width: 'calc(100% - 20px)' }}
                />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}