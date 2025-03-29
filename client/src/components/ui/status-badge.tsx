import { 
  Calendar, 
  CheckCircle, 
  MapPin, 
  Navigation, 
  AlertTriangle, 
  Stethoscope, 
  Check 
} from "lucide-react";
import { cn } from "@/lib/utils";

type AppointmentStatus = 
  | 'scheduled' 
  | 'confirmed' 
  | 'en_route' 
  | 'arrived' 
  | 'in_progress' 
  | 'completed' 
  | 'canceled';

type PaymentStatus = 'pending' | 'paid' | 'refunded';

interface StatusBadgeProps {
  status: AppointmentStatus;
  className?: string;
}

interface PaymentBadgeProps {
  status: PaymentStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  // Status configurations
  const statusConfig: Record<AppointmentStatus, { label: string; color: string; icon: React.ReactNode }> = {
    scheduled: {
      label: 'Programada',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: <Calendar className="h-3.5 w-3.5 mr-1" />
    },
    confirmed: {
      label: 'Confirmada',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: <Check className="h-3.5 w-3.5 mr-1" />
    },
    en_route: {
      label: 'En camino',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: <Navigation className="h-3.5 w-3.5 mr-1" />
    },
    arrived: {
      label: 'Médico llegó',
      color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: <MapPin className="h-3.5 w-3.5 mr-1" />
    },
    in_progress: {
      label: 'En consulta',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: <Stethoscope className="h-3.5 w-3.5 mr-1" />
    },
    completed: {
      label: 'Completada',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />
    },
    canceled: {
      label: 'Cancelada',
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: <AlertTriangle className="h-3.5 w-3.5 mr-1" />
    }
  };

  const config = statusConfig[status];

  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", config.color, className)}>
      {config.icon}
      {config.label}
    </span>
  );
}

export function PaymentBadge({ status, className }: PaymentBadgeProps) {
  // Payment status configurations
  const statusConfig: Record<PaymentStatus, { label: string; color: string; icon?: React.ReactNode }> = {
    pending: {
      label: 'Pendiente',
      color: 'bg-amber-100 text-amber-800 border-amber-200'
    },
    paid: {
      label: 'Pagada',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: <Check className="h-3.5 w-3.5 mr-1" />
    },
    refunded: {
      label: 'Reembolsada',
      color: 'bg-slate-100 text-slate-800 border-slate-200'
    }
  };

  const config = statusConfig[status];

  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", config.color, className)}>
      {config.icon}
      {config.label}
    </span>
  );
}