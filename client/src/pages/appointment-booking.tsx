import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import AppointmentForm from "@/components/appointments/appointment-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppointmentBooking() {
  const { isAuthenticated, user } = useAuth();
  const [location, navigate] = useLocation();
  const [doctorId, setDoctorId] = useState<number | null>(null);
  
  useEffect(() => {
    // Extract doctor ID from URL
    const match = location.match(/\/appointment\/new\/(\d+)/);
    if (match && match[1]) {
      setDoctorId(parseInt(match[1]));
    }
  }, [location]);

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(location)}`);
    } else if (user && user.userType !== "patient") {
      // Only patients can book appointments
      navigate("/dashboard/doctor");
    }
  }, [isAuthenticated, user, navigate, location]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Debes iniciar sesión como paciente para reservar una cita
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!doctorId) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            ID de médico no válido. Por favor, regresa a la búsqueda e intenta de nuevo.
          </AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button onClick={() => navigate("/doctors")}>
            Volver a la búsqueda
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 bg-neutral-50">
      <AppointmentForm doctorId={doctorId} />
    </div>
  );
}
