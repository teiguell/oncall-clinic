import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Appointment, Notification } from "@/types";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/payment";
import { subscribeToNotifications } from "@/lib/notifications";
import { useToast } from "@/hooks/use-toast";
import AppointmentStatusControls from "./appointment-status-controls";
import { StatusBadge, PaymentBadge } from "@/components/ui/status-badge";
import { 
  Calendar,
  Clock, 
  MapPin, 
  User, 
  FileText, 
  XCircle,
  AlertCircle,
  Bell,
  Loader2
} from "lucide-react";

export default function AppointmentList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("upcoming");
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean, appointmentId: number | null }>({
    open: false,
    appointmentId: null
  });
  
  // Subscribe to real-time notifications
  useEffect(() => {
    // Only subscribe if user is authenticated
    if (!user) return;
    
    // Set up notifications handler
    const unsubscribe = subscribeToNotifications((notification: any) => {
      // Handle appointment status notifications
      if (notification.type === 'appointment_status') {
        // Display toast notification
        toast({
          title: "Estado de cita actualizado",
          description: notification.message,
          duration: 5000,
        });
        
        // Refresh appointments data
        queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      }
    });
    
    // Clean up subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [user, toast]);

  // Fetch user's appointments
  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments'],
  });

  // Filter appointments based on tab
  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.appointmentDate);
    const now = new Date();

    if (activeTab === "upcoming") {
      return appointmentDate >= now && appointment.status !== "canceled";
    } else if (activeTab === "past") {
      return appointmentDate < now || appointment.status === "completed";
    } else if (activeTab === "canceled") {
      return appointment.status === "canceled";
    }
    return true;
  });

  // Cancel appointment
  const handleCancelAppointment = async () => {
    if (!cancelDialog.appointmentId) return;
    
    try {
      await apiRequest(
        "PATCH", 
        `/api/appointments/${cancelDialog.appointmentId}/status`, 
        { status: "canceled" }
      );
      
      // Invalidate appointments query to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      
      setCancelDialog({ open: false, appointmentId: null });
    } catch (error) {
      console.error("Error canceling appointment:", error);
    }
  };

  // Format date
  const formatAppointmentDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Format time
  const formatAppointmentTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        <span className="ml-2">Cargando citas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Próximas</TabsTrigger>
          <TabsTrigger value="past">Pasadas</TabsTrigger>
          <TabsTrigger value="canceled">Canceladas</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {filteredAppointments.length > 0 ? (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  userType={user?.userType || 'patient'}
                  onCancel={() => setCancelDialog({ open: true, appointmentId: appointment.id })}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-lg shadow">
              <Calendar className="h-10 w-10 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900">No tienes citas próximas</h3>
              <p className="text-neutral-500 mt-2 mb-6">
                {user?.userType === 'patient' 
                  ? 'Reserva una cita con un médico para recibir atención médica en casa' 
                  : 'No tienes citas programadas con pacientes'}
              </p>
              {user?.userType === 'patient' && (
                <Link href="/doctors">
                  <Button>Buscar médicos</Button>
                </Link>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {filteredAppointments.length > 0 ? (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  userType={user?.userType || 'patient'}
                  isPast
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-lg shadow">
              <Clock className="h-10 w-10 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900">No tienes citas pasadas</h3>
              <p className="text-neutral-500 mt-2">
                Aquí se mostrarán tus citas completadas
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="canceled">
          {filteredAppointments.length > 0 ? (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  userType={user?.userType || 'patient'}
                  isPast
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-lg shadow">
              <XCircle className="h-10 w-10 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900">No tienes citas canceladas</h3>
              <p className="text-neutral-500 mt-2">
                Aquí se mostrarán tus citas canceladas
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={cancelDialog.open} onOpenChange={(open) => setCancelDialog({ ...cancelDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar cita</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres cancelar esta cita? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog({ open: false, appointmentId: null })}>
              No, mantener cita
            </Button>
            <Button variant="destructive" onClick={handleCancelAppointment}>
              Sí, cancelar cita
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface AppointmentCardProps {
  appointment: Appointment;
  userType: 'patient' | 'doctor';
  isPast?: boolean;
  onCancel?: () => void;
}

function AppointmentCard({ appointment, userType, isPast = false, onCancel }: AppointmentCardProps) {
  const isDoctor = userType === 'doctor';
  const { patient, doctor, location } = appointment;
  
  // Determine the other party (if doctor, show patient info and vice versa)
  const otherParty = isDoctor ? patient : doctor;
  
  // Check if appointment can be canceled (not canceled and not past)
  const canCancel = appointment.status !== 'canceled' && !isPast;
  
  // Format date
  const formatAppointmentDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Format time
  const formatAppointmentTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              {isDoctor 
                ? `Cita con ${patient?.firstName} ${patient?.lastName}`
                : `Cita con ${doctor?.userType === 'doctor' ? 'Dr.' : 'Dra.'} ${doctor?.firstName} ${doctor?.lastName}`
              }
            </CardTitle>
            <CardDescription>
              {formatAppointmentDate(appointment.appointmentDate)} · {formatAppointmentTime(appointment.appointmentDate)}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <StatusBadge status={appointment.status as any} />
            <PaymentBadge status={appointment.paymentStatus as any} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2 text-neutral-500" />
              <span>Duración: {appointment.duration} minutos</span>
            </div>
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-2 text-neutral-500" />
              <span>{location?.address}, {location?.city}</span>
            </div>
            <div className="flex items-center text-sm">
              <FileText className="h-4 w-4 mr-2 text-neutral-500" />
              <span>Motivo: {appointment.reasonForVisit}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <User className="h-4 w-4 mr-2 text-neutral-500" />
              <span>
                {isDoctor ? 'Paciente' : 'Médico'}: {otherParty?.firstName} {otherParty?.lastName}
              </span>
            </div>
            <div className="flex items-center text-sm">
              <AlertCircle className="h-4 w-4 mr-2 text-neutral-500" />
              <span>Precio: {formatCurrency(appointment.totalAmount)}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="flex flex-wrap justify-between w-full gap-2">
          {/* Doctor-specific status controls */}
          {isDoctor && !isPast && appointment.status !== 'canceled' && (
            <AppointmentStatusControls appointment={appointment} />
          )}
          
          {/* Payment button for patients */}
          {appointment.status === 'scheduled' && appointment.paymentStatus === 'pending' && !isDoctor && (
            <Link href={`/appointment/success/${appointment.id}`}>
              <Button variant="outline">
                Completar pago
              </Button>
            </Link>
          )}
          
          {/* Cancel button */}
          {canCancel && onCancel && (
            <Button variant="outline" onClick={onCancel} className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600">
              Cancelar cita
            </Button>
          )}
          
          {/* View profile button for completed appointments */}
          {appointment.status === 'completed' && (
            <Link href={`/doctors/${doctor?.id}`}>
              <Button variant="outline">
                {isDoctor ? 'Ver paciente' : 'Ver médico'}
              </Button>
            </Link>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}