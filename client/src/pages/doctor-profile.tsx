import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { DoctorProfile as DoctorProfileType, Review } from "@/types";
import DoctorProfileView from "@/components/doctors/doctor-profile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

export default function DoctorProfile() {
  const [location] = useLocation();
  const [doctorId, setDoctorId] = useState<number | null>(null);

  useEffect(() => {
    // Extract doctor ID from URL
    const match = location.match(/\/doctors\/(\d+)/);
    if (match && match[1]) {
      setDoctorId(parseInt(match[1]));
    }
  }, [location]);

  // Fetch doctor details
  const {
    data: doctor,
    isLoading,
    isError,
    error
  } = useQuery<DoctorProfileType>({
    queryKey: [`/api/doctors/${doctorId}`],
    enabled: !!doctorId,
  });

  if (!doctorId) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            ID de médico no válido. Por favor, regresa a la búsqueda e intenta de nuevo.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        <span className="ml-2">Cargando información del médico...</span>
      </div>
    );
  }

  if (isError || !doctor) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : "Error al cargar la información del médico. Intenta de nuevo más tarde."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="py-8 bg-neutral-50">
      <DoctorProfileView doctor={doctor} reviews={doctor.reviews || []} />
    </div>
  );
}
