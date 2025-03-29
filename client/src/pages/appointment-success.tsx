import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { Appointment } from "@/types";
import PaymentForm from "@/components/payments/payment-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function AppointmentSuccess() {
  const { isAuthenticated, user } = useAuth();
  const [location, navigate] = useLocation();
  const [appointmentId, setAppointmentId] = useState<number | null>(null);
  
  // Parse the appointment ID from the URL
  useEffect(() => {
    const match = location.match(/\/appointment\/success\/(\d+)/);
    if (match && match[1]) {
      setAppointmentId(parseInt(match[1]));
    }
  }, [location]);

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Fetch appointment details
  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ['/api/appointments'],
    enabled: isAuthenticated && !!appointmentId,
  });

  // Find the specific appointment
  const appointment = appointments.find(app => app.id === appointmentId);

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Debes iniciar sesión para ver los detalles de tu cita
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        <span className="ml-2">Cargando detalles de la cita...</span>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No encontramos la cita solicitada. Por favor, verifica el enlace e intenta de nuevo.
          </AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button onClick={() => navigate("/dashboard/patient")}>
            Ir a mi dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Handle case when appointment is already paid
  if (appointment.paymentStatus === 'paid') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>¡Cita confirmada!</CardTitle>
            <CardDescription>
              Tu cita ha sido reservada y pagada correctamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6">
              <div className="rounded-full bg-green-100 p-3 mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">¡Todo listo!</h3>
              <p className="text-neutral-500 text-center mb-6">
                Tu cita con {appointment.doctor?.firstName} {appointment.doctor?.lastName} está programada para el {new Date(appointment.appointmentDate).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })} a las {new Date(appointment.appointmentDate).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <Button onClick={() => navigate("/dashboard/patient")} className="mb-2">
                Ver mis citas
              </Button>
              <Button variant="outline" onClick={() => navigate("/doctors")}>
                Buscar más médicos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Payment pending, show payment form
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <PaymentForm 
          appointment={appointment} 
          onSuccess={() => {
            // This will be handled by the payment form's internal redirect
          }} 
        />
      </div>
    </div>
  );
}
