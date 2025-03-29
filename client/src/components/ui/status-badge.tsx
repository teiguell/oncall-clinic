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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  
  // Status configurations
  const statusConfig: Record<AppointmentStatus, { color: string; icon: React.ReactNode }> = {
    scheduled: {
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: <Calendar className="h-3.5 w-3.5 mr-1" />
    },
    confirmed: {
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: <Check className="h-3.5 w-3.5 mr-1" />
    },
    en_route: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: <Navigation className="h-3.5 w-3.5 mr-1" />
    },
    arrived: {
      color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: <MapPin className="h-3.5 w-3.5 mr-1" />
    },
    in_progress: {
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: <Stethoscope className="h-3.5 w-3.5 mr-1" />
    },
    completed: {
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: <CheckCircle className="h-3.5 w-3.5 mr-1" />
    },
    canceled: {
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: <AlertTriangle className="h-3.5 w-3.5 mr-1" />
    }
  };

  const config = statusConfig[status];

  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", config.color, className)}>
      {config.icon}
      {t(`appointment.status.${status}`)}
    </span>
  );
}

export function PaymentBadge({ status, className }: PaymentBadgeProps) {
  const { t } = useTranslation();
  
  // Payment status configurations
  const statusConfig: Record<PaymentStatus, { color: string; icon?: React.ReactNode }> = {
    pending: {
      color: 'bg-amber-100 text-amber-800 border-amber-200'
    },
    paid: {
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: <Check className="h-3.5 w-3.5 mr-1" />
    },
    refunded: {
      color: 'bg-slate-100 text-slate-800 border-slate-200'
    }
  };

  const config = statusConfig[status];

  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", config.color, className)}>
      {config.icon}
      {t(`payment.status.${status}`)}
    </span>
  );
}