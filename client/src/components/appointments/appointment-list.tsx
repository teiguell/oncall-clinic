import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { Appointment } from "@/types";
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
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/payment";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  FileText, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Loader2
} from "lucide-react";

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  let variant: "default" | "secondary" | "destructive" | "outline" = "default";
  let label = "";
  let icon = null;

  switch (status) {
    case "scheduled":
      variant = "default";
      label = "Programada";
      icon = <Calendar className="h-3 w-3 mr-1" />;
      break;
    case "completed":
      variant = "secondary";
      label = "Completada";
      icon = <CheckCircle className="h-3 w-3 mr-1" />;
      break;
    case "canceled":
      variant = "destructive";
      label = "Cancelada";
      icon = <XCircle className="h-3 w-3 mr-1" />;
      break;
    default:
      variant = "outline";
      label = status;
  }

  return (
    <Badge variant={variant} className="flex items-center">
      {icon}
      {label}
    </Badge>
  );
};

// Payment status badge component
const PaymentBadge = ({ status }: { status: string }) => {
  let variant: "default" | "secondary" | "destructive" | "outline" = "default";
  let label = "";

  switch (status) {
    case "paid":
      variant = "secondary";
      label = "Pagado";
      break;
    case "pending":
      variant = "outline";
      label = "Pendiente";
      break;
    case "refunded":
      variant = "default";
      label = "Reembolsado";
      break;
    default:
      variant = "outline";
      label = status;
  }

  return <Badge variant={variant}>{label}</Badge>;
};

export default function AppointmentList() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("upcoming");
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean, appointmentId: number | null }>({
    open: false,
    appointmentId: null
  });

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
            <StatusBadge status={appointment.status} />
            <PaymentBadge status={appointment.paymentStatus} />
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
        <div className="flex justify-between w-full">
          {appointment.status === 'scheduled' && appointment.paymentStatus === 'pending' && !isDoctor && (
            <Link href={`/appointment/success/${appointment.id}`}>
              <Button variant="outline">
                Completar pago
              </Button>
            </Link>
          )}
          
          {canCancel && (
            <Button variant="outline" onClick={onCancel} className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600">
              Cancelar cita
            </Button>
          )}
          
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
