import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/auth-context";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Calendar, Clock, MapPin, FileText, User, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import AppointmentProgressMap from "@/components/appointments/appointment-progress-map";
import AppointmentJourneyMap from "@/components/appointments/appointment-journey-map";
import AppointmentStatusControl from "@/components/appointments/appointment-status-control";

interface AppointmentDetails {
  id: number;
  doctorId: number;
  patientId: number;
  appointmentDate: string;
  duration: number;
  status: string;
  reasonForVisit: string;
  locationId: number;
  createdAt: string;
  doctor: {
    id: number;
    user: {
      firstName: string;
      lastName: string;
    };
    specialty: {
      name: string;
    };
  };
  location: {
    address: string;
    city: string;
    postalCode: string;
  };
  payment: {
    id: number;
    amount: number;
    status: string;
  };
}

export default function AppointmentSuccess() {
  const { t, i18n } = useTranslation();
  const [location, navigate] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const locale = i18n.language === 'es' ? es : enUS;
  
  const [appointmentId, setAppointmentId] = useState<number | null>(null);
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Extract appointment ID from URL
  useEffect(() => {
    const match = location.match(/\/appointment\/success\/(\d+)/);
    if (match && match[1]) {
      setAppointmentId(parseInt(match[1]));
    } else {
      setError(t('errors.invalid_appointment'));
    }
  }, [location, t]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);
  
  // Fetch appointment details
  useEffect(() => {
    if (!appointmentId) return;
    
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(`/api/appointments/${appointmentId}`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        setAppointment(data);
      } catch (error) {
        console.error("Error fetching appointment:", error);
        setError(t('errors.appointment_fetch_failed'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointment();
  }, [appointmentId, t]);
  
  const handleViewAppointments = () => {
    navigate("/patient/appointments");
  };
  
  const handleViewDashboard = () => {
    // Redirect to the correct dashboard based on user type
    if (user?.userType === 'doctor') {
      navigate("/doctor/dashboard");
    } else {
      navigate("/patient/dashboard");
    }
  };
  
  // Function to handle appointment status updates
  const handleStatusUpdate = (newStatus: string) => {
    if (appointment) {
      setAppointment({
        ...appointment,
        status: newStatus
      });
    }
  };
  
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <Card className="border-green-200 shadow-md">
          <CardHeader className="text-center">
            <Skeleton className="h-10 w-3/4 mx-auto mb-4" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton className="h-5 w-5 mt-0.5" />
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error || !appointment) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <Alert variant="destructive">
          <AlertTitle>{t('errors.error')}</AlertTitle>
          <AlertDescription>
            {error || t('errors.appointment_not_found')}
          </AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button onClick={() => navigate("/")}>
            {t('general.back_to_home')}
          </Button>
        </div>
      </div>
    );
  }
  
  // Format appointment date and time
  const appointmentDate = new Date(appointment.appointmentDate);
  const formattedDate = format(appointmentDate, 'PPP', { locale });
  const formattedTime = format(appointmentDate, 'p', { locale });
  const endTime = new Date(appointmentDate.getTime() + appointment.duration * 60000);
  const formattedEndTime = format(endTime, 'p', { locale });
  
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <Card className="border-green-200 shadow-md mb-8">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-600">
            {t('appointment.booking_success_title')}
          </CardTitle>
          <CardDescription>
            {t('appointment.booking_reference', { id: appointment.id })}
          </CardDescription>
        </CardHeader>
        
        {/* Mapa de recorrido del paciente */}
        <div className="px-6 mb-8">
          <AppointmentJourneyMap 
            currentStatus={appointment.status as any}
            appointmentDate={appointment.appointmentDate}
            completedDate={appointment.status === 'completed' ? new Date().toISOString() : undefined}
          />
        </div>
        
        <CardContent className="space-y-6">
          <div className="flex items-start space-x-3">
            <User className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium">{t('doctor.doctor')}</h4>
              <p className="text-sm text-muted-foreground">
                Dr. {appointment.doctor.user.firstName} {appointment.doctor.user.lastName} - {appointment.doctor.specialty.name}
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Calendar className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium">{t('appointment.date')}</h4>
              <p className="text-sm text-muted-foreground">
                {formattedDate}
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium">{t('appointment.time')}</h4>
              <p className="text-sm text-muted-foreground">
                {formattedTime} - {formattedEndTime} ({appointment.duration} {t('appointment.minutes')})
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <MapPin className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium">{t('appointment.location')}</h4>
              <p className="text-sm text-muted-foreground">
                {appointment.location.address}, {appointment.location.city}
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <FileText className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium">{t('appointment.reason')}</h4>
              <p className="text-sm text-muted-foreground">
                {appointment.reasonForVisit || t('appointment.not_provided')}
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <DollarSign className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium">{t('appointment.payment')}</h4>
              <p className="text-sm text-muted-foreground">
                {new Intl.NumberFormat(i18n.language, { 
                  style: 'currency', 
                  currency: 'EUR' 
                }).format(appointment.payment.amount / 100)} - 
                <span className={appointment.payment.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}>
                  {' '}{t(`payment.status.${appointment.payment.status}`)}
                </span>
              </p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto"
            onClick={handleViewAppointments}
          >
            {t('appointment.view_all_appointments')}
          </Button>
          <Button 
            className="w-full sm:w-auto"
            onClick={handleViewDashboard}
          >
            {t('general.back_to_dashboard')}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Control de estado para doctores */}
      {user?.userType === 'doctor' && appointment.doctorId === user?.id && (
        <div className="mt-8">
          <AppointmentStatusControl
            appointmentId={appointment.id}
            currentStatus={appointment.status as any}
            onStatusUpdated={handleStatusUpdate}
            className="shadow-md"
          />
        </div>
      )}
      
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          {t('appointment.confirmation_email')}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {t('appointment.questions_contact')}
        </p>
      </div>
    </div>
  );
}