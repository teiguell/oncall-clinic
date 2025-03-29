import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from "@/lib/utils";
import { 
  Calendar, 
  CheckCircle2, 
  Car, 
  Home, 
  Stethoscope, 
  ClipboardCheck,
  XCircle
} from 'lucide-react';

// Definición de los estados posibles de la cita
const APPOINTMENT_STATES = [
  'scheduled',    // Programada
  'confirmed',    // Confirmada por el médico
  'en_route',     // Médico en camino
  'arrived',      // Médico llegó al domicilio
  'in_progress',  // Consulta en progreso
  'completed',    // Cita completada
  'canceled'      // Cita cancelada
] as const;

type AppointmentStatus = typeof APPOINTMENT_STATES[number];

interface AppointmentStepProps {
  status: AppointmentStatus;
  currentStatus: AppointmentStatus;
  icon: React.ReactNode;
  label: string;
  isFirst?: boolean;
  isLast?: boolean;
}

// Componente para cada paso en el mapa de progreso
const AppointmentStep: React.FC<AppointmentStepProps> = ({
  status,
  currentStatus,
  icon,
  label,
  isFirst = false,
  isLast = false
}) => {
  // Determinar si es el paso actual, un paso completado o un paso futuro
  const isCurrent = status === currentStatus;
  const isCompleted = APPOINTMENT_STATES.indexOf(status) < APPOINTMENT_STATES.indexOf(currentStatus);
  const isCanceled = currentStatus === 'canceled';
  
  // Estilos para diferentes estados
  const stepClasses = cn(
    "flex flex-col items-center relative z-10",
    isCompleted ? "text-green-600" : 
      isCurrent ? "text-blue-600 font-bold" : 
        isCanceled ? "text-gray-400" : "text-gray-500"
  );
  
  const iconContainerClasses = cn(
    "w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-md",
    isCompleted ? "bg-green-100 border-2 border-green-600" :
      isCurrent ? "bg-blue-100 border-2 border-blue-600 animate-pulse" :
        isCanceled ? "bg-gray-100 border-2 border-gray-400" : "bg-gray-100 border-2 border-gray-300"
  );
  
  // Si no es el primer o último paso, mostrar línea conectora
  const showLineLeft = !isFirst;
  const showLineRight = !isLast && currentStatus !== 'canceled';
  
  const lineLeftClasses = cn(
    "absolute top-6 h-0.5 w-1/2 -left-1/4",
    isCompleted ? "bg-green-600" : "bg-gray-300"
  );
  
  const lineRightClasses = cn(
    "absolute top-6 h-0.5 w-1/2 -right-1/4",
    (isCompleted || isCurrent) ? "bg-green-600" : "bg-gray-300"
  );
  
  return (
    <div className={stepClasses}>
      {showLineLeft && <div className={lineLeftClasses}></div>}
      {showLineRight && <div className={lineRightClasses}></div>}
      
      <div className={iconContainerClasses}>
        {icon}
      </div>
      <span className="text-sm font-medium text-center w-20">{label}</span>
    </div>
  );
};

interface AppointmentProgressMapProps {
  status: AppointmentStatus;
  className?: string;
}

const AppointmentProgressMap: React.FC<AppointmentProgressMapProps> = ({ 
  status,
  className
}) => {
  const { t } = useTranslation();
  
  // Si la cita está cancelada, mostrar un mapa simplificado
  if (status === 'canceled') {
    return (
      <div className={cn("flex flex-col items-center p-4 rounded-lg bg-gray-50", className)}>
        <div className="bg-red-100 p-4 rounded-full mb-3">
          <XCircle className="w-12 h-12 text-red-600" />
        </div>
        <h3 className="font-semibold text-xl text-red-600 mb-2">
          {t('appointment.status.canceled')}
        </h3>
        <p className="text-gray-600 text-center">
          {t('appointment.canceled_description')}
        </p>
      </div>
    );
  }
  
  // Configuración de los pasos para el mapa de progreso
  const steps = [
    {
      status: 'scheduled',
      icon: <Calendar className="w-6 h-6" />,
      label: t('appointment.status.scheduled')
    },
    {
      status: 'confirmed',
      icon: <CheckCircle2 className="w-6 h-6" />,
      label: t('appointment.status.confirmed')
    },
    {
      status: 'en_route',
      icon: <Car className="w-6 h-6" />,
      label: t('appointment.status.en_route')
    },
    {
      status: 'arrived',
      icon: <Home className="w-6 h-6" />,
      label: t('appointment.status.arrived')
    },
    {
      status: 'in_progress',
      icon: <Stethoscope className="w-6 h-6" />,
      label: t('appointment.status.in_progress')
    },
    {
      status: 'completed',
      icon: <ClipboardCheck className="w-6 h-6" />,
      label: t('appointment.status.completed')
    }
  ];
  
  return (
    <div className={cn("bg-white p-6 rounded-lg shadow-md", className)}>
      <h3 className="text-xl font-semibold mb-6 text-center text-gray-800">
        {t('appointment.progress_map')}
      </h3>
      
      <div className="flex justify-between w-full mb-6">
        {steps.map((step, index) => (
          <AppointmentStep
            key={step.status}
            status={step.status as AppointmentStatus}
            currentStatus={status}
            icon={step.icon}
            label={step.label}
            isFirst={index === 0}
            isLast={index === steps.length - 1}
          />
        ))}
      </div>
      
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          {t('appointment.current_status')}: <span className="font-semibold text-blue-600">
            {t(`appointment.status.${status}`)}
          </span>
        </p>
      </div>
    </div>
  );
};

export default AppointmentProgressMap;