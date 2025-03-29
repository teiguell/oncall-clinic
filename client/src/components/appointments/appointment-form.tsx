import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { AppointmentFormData, DoctorProfile, Location } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Calendar, Clock, MapPin, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/payment";
import { apiRequest } from "@/lib/queryClient";
import { getUserLocations } from "@/lib/location";
import { queryClient } from "@/lib/queryClient";

interface AppointmentFormProps {
  doctorId: number;
}

const appointmentSchema = z.object({
  doctorId: z.number(),
  appointmentDate: z.string().min(1, "Selecciona una fecha"),
  appointmentTime: z.string().min(1, "Selecciona una hora"),
  duration: z.number().min(30, "La duración mínima es de 30 minutos"),
  reasonForVisit: z.string().min(10, "Por favor, proporciona una razón para la visita").max(500),
  locationId: z.number(),
});

export default function AppointmentForm({ doctorId }: AppointmentFormProps) {
  const [, navigate] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [isCreatingLocation, setIsCreatingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated or not a patient
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (user && user.userType !== "patient") {
      toast({
        variant: "destructive",
        title: "Acceso denegado",
        description: "Solo los pacientes pueden reservar citas",
      });
      navigate("/");
    }
  }, [isAuthenticated, user, navigate, toast]);

  // Fetch doctor details
  const { data: doctor, isLoading: isLoadingDoctor } = useQuery<DoctorProfile>({
    queryKey: [`/api/doctors/${doctorId}`],
    enabled: !!doctorId,
  });

  // Fetch user locations
  const { data: locations = [], isLoading: isLoadingLocations } = useQuery<Location[]>({
    queryKey: ['/api/locations'],
    queryFn: getUserLocations,
    enabled: isAuthenticated,
  });

  const form = useForm<z.infer<typeof appointmentSchema>>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      doctorId: doctorId,
      appointmentDate: new Date().toISOString().split('T')[0],
      appointmentTime: "10:00",
      duration: 60,
      reasonForVisit: "",
      locationId: locations[0]?.id || 0,
    },
  });

  // Set locationId when locations are loaded
  useEffect(() => {
    if (locations.length > 0 && !form.getValues().locationId) {
      form.setValue('locationId', locations[0].id);
    }
  }, [locations, form]);

  // Create appointment mutation
  const createAppointment = useMutation({
    mutationFn: async (data: AppointmentFormData) => {
      const response = await apiRequest('POST', '/api/appointments', data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      navigate(`/appointment/success/${data.id}`);
      toast({
        title: "Cita reservada",
        description: "Tu cita ha sido reservada correctamente",
      });
    },
    onError: (error) => {
      console.error("Error creating appointment:", error);
      setError("Error al crear la cita. Por favor, inténtalo de nuevo.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo reservar la cita. Inténtalo de nuevo.",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof appointmentSchema>) => {
    if (!doctor) return;
    
    // Combine date and time for the appointment
    const appointmentDateTime = new Date(`${values.appointmentDate}T${values.appointmentTime}`);
    
    // Create appointment data
    const appointmentData: AppointmentFormData = {
      doctorId: values.doctorId,
      appointmentDate: appointmentDateTime.toISOString(),
      duration: values.duration,
      reasonForVisit: values.reasonForVisit,
      locationId: values.locationId,
      totalAmount: doctor.basePrice, // Use the doctor's base price
    };

    createAppointment.mutate(appointmentData);
  };

  // Generate available time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 18) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return slots;
  };

  // Availability check - this would connect to the backend in a real app
  const checkAvailability = (date: string, time: string) => {
    // Mock implementation - in a real app this would check against doctor availability
    return true; // Assuming all slots are available for demo
  };

  // If loading, show a loading state
  if (isLoadingDoctor) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        <span className="ml-2">Cargando datos del médico...</span>
      </div>
    );
  }

  // If doctor not found, show error
  if (!doctor) {
    return (
      <div className="max-w-md mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No se pudo cargar la información del médico. Por favor, intenta de nuevo.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Reservar cita médica</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="w-full md:w-1/3 p-4 bg-primary-50 rounded-lg">
              <h3 className="font-medium text-lg mb-2">Detalles del médico</h3>
              
              <div className="flex items-center mb-4">
                <img
                  src={doctor.user?.profilePicture || `https://ui-avatars.com/api/?name=${doctor.user?.firstName}+${doctor.user?.lastName}&background=0D8ABC&color=fff`}
                  alt={`${doctor.user?.firstName} ${doctor.user?.lastName}`}
                  className="h-16 w-16 rounded-full"
                />
                <div className="ml-3">
                  <p className="font-medium">{doctor.user?.userType === 'doctor' ? 'Dr.' : 'Dra.'} {doctor.user?.firstName} {doctor.user?.lastName}</p>
                  <p className="text-sm text-neutral-500">{doctor.specialty?.name}</p>
                </div>
              </div>
              
              <p className="text-sm mb-1">
                <span className="font-medium">Precio por consulta:</span> {formatCurrency(doctor.basePrice)}
              </p>
              <p className="text-sm mb-1">
                <span className="font-medium">Experiencia:</span> {doctor.experience} años
              </p>
              <p className="text-sm">
                <span className="font-medium">Valoración:</span> {doctor.averageRating.toFixed(1)}/5
              </p>
            </div>

            <div className="w-full md:w-2/3">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="appointmentDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de la cita</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <Calendar className="h-4 w-4 text-neutral-500 absolute mt-3 ml-3" />
                              <Input
                                type="date"
                                className="pl-10"
                                min={new Date().toISOString().split('T')[0]}
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="appointmentTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hora</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <Clock className="h-4 w-4 text-neutral-500 absolute mt-3 ml-3" />
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger className="pl-10">
                                  <SelectValue placeholder="Selecciona una hora" />
                                </SelectTrigger>
                                <SelectContent>
                                  {generateTimeSlots().map((time) => (
                                    <SelectItem
                                      key={time}
                                      value={time}
                                      disabled={!checkAvailability(form.getValues().appointmentDate, time)}
                                    >
                                      {time}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duración (minutos)</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value.toString()}
                            onValueChange={(value) => field.onChange(parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona duración" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="30">30 minutos</SelectItem>
                              <SelectItem value="60">60 minutos</SelectItem>
                              <SelectItem value="90">90 minutos</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="locationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ubicación</FormLabel>
                        <FormControl>
                          <div className="flex">
                            <MapPin className="h-4 w-4 text-neutral-500 absolute mt-3 ml-3" />
                            {isLoadingLocations ? (
                              <div className="pl-10 py-2 border rounded-md flex items-center">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Cargando ubicaciones...
                              </div>
                            ) : locations.length > 0 ? (
                              <Select
                                value={field.value.toString()}
                                onValueChange={(value) => field.onChange(parseInt(value))}
                              >
                                <SelectTrigger className="pl-10">
                                  <SelectValue placeholder="Selecciona ubicación" />
                                </SelectTrigger>
                                <SelectContent>
                                  {locations.map((location) => (
                                    <SelectItem key={location.id} value={location.id.toString()}>
                                      {location.address}, {location.city}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="pl-10 py-2 border rounded-md text-neutral-500 w-full">
                                No tienes ubicaciones guardadas
                              </div>
                            )}
                          </div>
                        </FormControl>
                        {locations.length === 0 && (
                          <Button
                            type="button"
                            variant="link"
                            className="px-0 mt-1"
                            onClick={() => setIsCreatingLocation(true)}
                          >
                            + Añadir una ubicación
                          </Button>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reasonForVisit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Motivo de la consulta</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe brevemente el motivo de tu consulta"
                            {...field}
                            rows={4}
                          />
                        </FormControl>
                        <FormDescription>
                          Esta información ayudará al médico a prepararse para tu cita.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4 border-t">
                    <div className="flex justify-between mb-2">
                      <span>Precio de la consulta</span>
                      <span>{formatCurrency(doctor.basePrice)}</span>
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={createAppointment.isPending}
                    >
                      {createAppointment.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Reservando cita...
                        </>
                      ) : (
                        "Reservar y proceder al pago"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
