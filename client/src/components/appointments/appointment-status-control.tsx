import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { ChevronRightIcon, CalendarIcon, CheckIcon, XIcon, TruckIcon, HomeIcon, ActivityIcon } from 'lucide-react';

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

interface AppointmentStatusControlProps {
  appointmentId: number;
  currentStatus: AppointmentStatus;
  onStatusChange: (status: AppointmentStatus) => Promise<void>;
  patientName: string;
  scheduledTime: Date;
  address: string;
}

export default function AppointmentStatusControl({
  appointmentId,
  currentStatus,
  onStatusChange,
  patientName,
  scheduledTime,
  address
}: AppointmentStatusControlProps) {
  const { t } = useTranslation();
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Define the next status and its action button based on current status
  const getNextAction = () => {
    switch (currentStatus) {
      case 'scheduled':
        return {
          status: 'confirmed',
          label: t('appointment.actions.confirm'),
          icon: <CheckIcon className="h-4 w-4 mr-2" />,
          variant: 'default' as const,
          description: t('appointment.statusChange.confirmDescription')
        };
      case 'confirmed':
        return {
          status: 'en_route',
          label: t('appointment.actions.startJourney'),
          icon: <TruckIcon className="h-4 w-4 mr-2" />,
          variant: 'default' as const,
          description: t('appointment.statusChange.enRouteDescription')
        };
      case 'en_route':
        return {
          status: 'arrived',
          label: t('appointment.actions.markArrived'),
          icon: <HomeIcon className="h-4 w-4 mr-2" />,
          variant: 'default' as const,
          description: t('appointment.statusChange.arrivedDescription')
        };
      case 'arrived':
        return {
          status: 'in_progress',
          label: t('appointment.actions.startConsultation'),
          icon: <ActivityIcon className="h-4 w-4 mr-2" />,
          variant: 'default' as const,
          description: t('appointment.statusChange.inProgressDescription')
        };
      case 'in_progress':
        return {
          status: 'completed',
          label: t('appointment.actions.completeAppointment'),
          icon: <CheckIcon className="h-4 w-4 mr-2" />,
          variant: 'default' as const,
          description: t('appointment.statusChange.completedDescription')
        };
      case 'completed':
      case 'canceled':
        return null;
      default:
        return null;
    }
  };
  
  const nextAction = getNextAction();
  
  const { toast } = useToast();

  const handleStatusChange = async (status: AppointmentStatus) => {
    try {
      setIsUpdating(true);
      await onStatusChange(status);
      toast({
        title: t('appointment.statusChange.success', { status: t(`appointment.status.${status}`) }),
        variant: "default",
      });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast({
        title: t('appointment.statusChange.error'),
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('appointment.statusControl.title')}</CardTitle>
        <CardDescription>{t('appointment.statusControl.subtitle')}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-neutral-500">{t('appointment.details.with')}</h3>
            <p className="font-medium">{patientName}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-neutral-500">{t('appointment.details.when')}</h3>
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2 text-neutral-400" />
              <p>{formatDate(scheduledTime)} {t('appointment.details.at')} {formatTime(scheduledTime)}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-neutral-500">{t('appointment.details.where')}</h3>
            <p>{address}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-neutral-500">{t('appointment.details.status')}</h3>
            <p className="font-semibold">{t(`appointment.status.${currentStatus}`)}</p>
          </div>
        </div>
      </CardContent>
      
      <Separator />
      
      <CardFooter className="pt-6 flex flex-col items-stretch space-y-3">
        {nextAction && (
          <>
            <p className="text-sm text-neutral-500">{nextAction.description}</p>
            <Button 
              onClick={() => handleStatusChange(nextAction.status)}
              disabled={isUpdating}
              className="w-full"
              variant={nextAction.variant}
            >
              {nextAction.icon}
              {nextAction.label}
            </Button>
          </>
        )}
        
        {currentStatus !== 'completed' && currentStatus !== 'canceled' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full">
                {t('appointment.actions.moreOptions')}
                <ChevronRightIcon className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              {currentStatus !== 'canceled' && (
                <DropdownMenuItem 
                  className="text-red-500 focus:text-red-500"
                  onClick={() => handleStatusChange('canceled')}
                >
                  <XIcon className="h-4 w-4 mr-2" />
                  {t('appointment.actions.cancel')}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardFooter>
    </Card>
  );
}