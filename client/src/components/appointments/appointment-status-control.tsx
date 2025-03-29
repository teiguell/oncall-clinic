import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle2,
  Car,
  DoorOpen, 
  Stethoscope,
  CheckSquare,
  XCircle,
  Loader2
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';

// Appointment status options in the journey
type AppointmentStatus = 
  'scheduled' | 
  'confirmed' | 
  'en_route' | 
  'arrived' | 
  'in_progress' | 
  'completed' | 
  'canceled';

interface AppointmentStatusControlProps {
  appointmentId: number;
  currentStatus: AppointmentStatus;
  onStatusUpdated?: (newStatus: AppointmentStatus) => void;
  className?: string;
}

export function AppointmentStatusControl({
  appointmentId,
  currentStatus,
  onStatusUpdated,
  className
}: AppointmentStatusControlProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Logic to determine next possible statuses based on current status
  const getNextPossibleStatuses = (): AppointmentStatus[] => {
    switch (currentStatus) {
      case 'scheduled':
        return ['confirmed', 'canceled'];
      case 'confirmed':
        return ['en_route', 'canceled'];
      case 'en_route':
        return ['arrived', 'canceled'];
      case 'arrived':
        return ['in_progress', 'canceled'];
      case 'in_progress':
        return ['completed', 'canceled'];
      case 'completed':
      case 'canceled':
        return []; // No further transitions possible
      default:
        return [];
    }
  };
  
  const getStatusActionButton = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed':
        return {
          icon: <CheckCircle2 className="h-4 w-4 mr-2" />,
          label: t('appointment.actions.confirm'),
          variant: 'outline' as const
        };
      case 'en_route':
        return {
          icon: <Car className="h-4 w-4 mr-2" />,
          label: t('appointment.actions.start_journey'),
          variant: 'outline' as const
        };
      case 'arrived':
        return {
          icon: <DoorOpen className="h-4 w-4 mr-2" />,
          label: t('appointment.actions.mark_arrived'),
          variant: 'outline' as const
        };
      case 'in_progress':
        return {
          icon: <Stethoscope className="h-4 w-4 mr-2" />,
          label: t('appointment.actions.start_appointment'),
          variant: 'outline' as const
        };
      case 'completed':
        return {
          icon: <CheckSquare className="h-4 w-4 mr-2" />,
          label: t('appointment.actions.complete'),
          variant: 'outline' as const
        };
      case 'canceled':
        return {
          icon: <XCircle className="h-4 w-4 mr-2" />,
          label: t('appointment.actions.cancel'),
          variant: 'destructive' as const
        };
      default:
        return {
          icon: null,
          label: t('appointment.actions.update'),
          variant: 'outline' as const
        };
    }
  };
  
  const updateAppointmentStatus = async (newStatus: AppointmentStatus) => {
    setIsUpdating(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update appointment status');
      }
      
      // Call the callback if provided
      if (onStatusUpdated) {
        onStatusUpdated(newStatus);
      }
      
      toast({
        title: t('appointment.status_updated'),
        description: t(`appointment.status_updated_to`, { status: t(`appointment.status.${newStatus}`) }),
        variant: 'default',
      });
      
    } catch (error) {
      console.error('Error updating appointment status:', error);
      setError(error instanceof Error ? error.message : String(error));
      
      toast({
        title: t('errors.status_update_failed'),
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const nextPossibleStatuses = getNextPossibleStatuses();
  
  if (nextPossibleStatuses.length === 0) {
    // No further actions possible
    return null;
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{t('appointment.update_status')}</CardTitle>
        <CardDescription>
          {t('appointment.current_status')}: <strong>{t(`appointment.status.${currentStatus}`)}</strong>
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="text-sm text-muted-foreground mb-4">
          {t('appointment.select_next_status')}
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-wrap gap-2">
        {isUpdating ? (
          <Button disabled className="w-full">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {t('common.updating')}
          </Button>
        ) : (
          nextPossibleStatuses.map(status => {
            const { icon, label, variant } = getStatusActionButton(status);
            return (
              <Button
                key={status}
                variant={variant}
                onClick={() => updateAppointmentStatus(status)}
                className="flex-1"
              >
                {icon}
                {label}
              </Button>
            );
          })
        )}
      </CardFooter>
    </Card>
  );
}

export default AppointmentStatusControl;