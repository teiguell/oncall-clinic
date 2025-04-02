import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, Clock, MapPin, DollarSign, User, FileText, AlertCircle } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { z } from 'zod';
import { appointmentBookingSchema, type AppointmentBookingData } from '@shared/schema';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

const formSchema = appointmentBookingSchema.omit({ patientId: true }).extend({
  timeSlot: z.string().min(1, { message: "Please select a time" }),
});

interface AppointmentFormProps {
  doctorId: number;
}

interface DoctorDetails {
  id: number;
  userId: number;
  specialtyId: number;
  licenseNumber: string;
  education: string;
  experience: number;
  bio: string;
  basePrice: number;
  isAvailable: boolean;
  isVerified: boolean;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    profilePicture: string | null;
  };
  specialty: {
    id: number;
    name: string;
    description: string;
  };
  distance?: number;
}

interface LocationItem {
  id: number;
  userId: number;
  address: string;
  city: string;
  postalCode: string;
  lat: number;
  lng: number;
  name?: string;
}

export default function AppointmentForm({ doctorId }: AppointmentFormProps) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const locale = i18n.language === 'es' ? es : enUS;

  const [isLoading, setIsLoading] = useState(false);
  const [doctor, setDoctor] = useState<DoctorDetails | null>(null);
  const [doctorLoading, setDoctorLoading] = useState(true);
  const [doctorError, setDoctorError] = useState<string | null>(null);

  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);

  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30'
  ]);

  const [isGuestBooking, setIsGuestBooking] = useState(false);
  const [guestData, setGuestData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      doctorId,
      appointmentDate: '',
      reasonForVisit: '',
      duration: 30,
      totalAmount: 0,
      locationId: 0,
      timeSlot: ''
    },
  });

  const guestForm = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: ''
    }
  });

  const guestSchema = z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    email: z.string().email({ message: 'Invalid email' }),
    phone: z.string().min(10, { message: 'Phone number must be at least 10 digits' }),
  });


  // Fetch doctor details
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setDoctorLoading(true);
        setDoctorError(null);

        const response = await fetch(`/api/doctors/${doctorId}`);

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const doctorData = await response.json();
        setDoctor(doctorData);

        // Update form with base price
        form.setValue('totalAmount', doctorData.basePrice);
      } catch (error) {
        console.error('Error fetching doctor:', error);
        setDoctorError(t('errors.doctor_fetch_failed'));
      } finally {
        setDoctorLoading(false);
      }
    };

    if (doctorId) {
      fetchDoctor();
    }
  }, [doctorId, form, t]);

  // Fetch user locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLocationsLoading(true);

        const response = await fetch('/api/locations');

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const locationsData = await response.json();

        // Add a friendly name to each location
        const enhancedLocations = locationsData.map((loc: LocationItem, index: number) => ({
          ...loc,
          name: `${loc.address}, ${loc.city} (${t('general.location')} ${index + 1})`
        }));

        setLocations(enhancedLocations);

        // If locations available, set default
        if (enhancedLocations.length > 0) {
          form.setValue('locationId', enhancedLocations[0].id);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
        toast({
          title: t('errors.locations_fetch_failed'),
          description: t('errors.try_again'),
          variant: 'destructive',
        });
      } finally {
        setLocationsLoading(false);
      }
    };

    fetchLocations();
  }, [form, t, toast]);

  const handleAddLocation = () => {
    navigate('/locations/new');
  };

  useEffect(() => {
    if (!isAuthenticated && !isGuestBooking) {
      // Show guest booking option instead of redirecting
      setIsGuestBooking(true);
    } else if (user && user.userType !== "patient") {
      // Only patients can book appointments
      navigate("/dashboard/doctor");
    }
  }, [isAuthenticated, user, navigate, location]);

  const handleGuestSubmit = async (data: any) => {
    try {
      setGuestData(data);
      const selectedDate = form.getValues('appointmentDate').split('T')[0];
      const selectedTime = form.getValues('timeSlot');
      const appointmentDateTime = `${selectedDate}T${selectedTime}:00`;

      const appointmentData: AppointmentBookingData = {
        ...form.getValues(),
        appointmentDate: appointmentDateTime,
      };
      const response = await apiRequest('POST', '/api/appointments/guest', {
        ...appointmentData,
        guestData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error booking appointment');
      }

      const result = await response.json();
      navigate(`/appointment/success/${result.appointment.id}?token=${result.authToken}`);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: t('errors.booking_failed'),
        description: t('errors.try_again'),
        variant: 'destructive',
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: t('errors.not_authenticated'),
        description: t('errors.login_required'),
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);

      // Build date from selected date and time
      const selectedDate = form.getValues('appointmentDate').split('T')[0];
      const selectedTime = form.getValues('timeSlot');
      const appointmentDateTime = `${selectedDate}T${selectedTime}:00`;

      // Prepare data for API
      const appointmentData: AppointmentBookingData = {
        ...values,
        patientId: user.id,
        appointmentDate: appointmentDateTime,
      };

      // Post to API
      const response = await apiRequest('POST', '/api/appointments', appointmentData);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error creating appointment');
      }

      const result = await response.json();

      toast({
        title: t('appointment.booking_success'),
        description: t('appointment.booking_confirmation', { 
          date: format(new Date(appointmentDateTime), 'PPP', { locale }),
          time: format(new Date(appointmentDateTime), 'p', { locale })
        }),
      });

      // Navigate to appointment success page
      navigate(`/appointment/success/${result.appointment.id}`);
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: t('errors.booking_failed'),
        description: typeof error === 'object' && error !== null && 'message' in error
          ? String((error as Error).message)
          : t('errors.try_again'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (doctorLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">{t('general.loading')}</span>
      </div>
    );
  }

  if (doctorError || !doctor) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t('errors.error')}</AlertTitle>
        <AlertDescription>
          {doctorError || t('errors.doctor_not_found')}
        </AlertDescription>
      </Alert>
    );
  }

  const today = new Date();
  const maxDate = new Date();
  maxDate.setMonth(today.getMonth() + 3);

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <Card>
          <CardHeader>
            <CardTitle>{t('appointment.new_appointment')}</CardTitle>
            <CardDescription>
              {t('appointment.with_doctor', { 
                name: `${doctor.user.firstName} ${doctor.user.lastName}`, 
                specialty: doctor.specialty.name
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isGuestBooking ? (
              <Form {...guestForm}>
                <form onSubmit={guestForm.handleSubmit(handleGuestSubmit)} className="space-y-6">
                  <FormField
                    control={guestForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('general.full_name')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('general.full_name_placeholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={guestForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('general.email')}</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder={t('general.email_placeholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={guestForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('general.phone')}</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder={t('general.phone_placeholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    {t('appointment.confirm_booking')}
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="appointmentDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>{t('appointment.select_date')}</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={`w-full pl-3 text-left font-normal ${
                                  !field.value && "text-muted-foreground"
                                }`}
                              >
                                {field.value ? (
                                  format(new Date(field.value), 'PPP', { locale })
                                ) : (
                                  <span>{t('appointment.pick_date')}</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => {
                                if (date) {
                                  // Format as ISO string but keep only the date part
                                  const formattedDate = date.toISOString().split('T')[0];
                                  field.onChange(`${formattedDate}T00:00:00`);
                                }
                              }}
                              disabled={(date) => 
                                date < today || 
                                date > maxDate || 
                                isWeekend(date)
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          {t('appointment.business_days')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timeSlot"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('appointment.select_time')}</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('appointment.pick_time')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableTimeSlots.map((timeSlot) => (
                              <SelectItem key={timeSlot} value={timeSlot}>
                                {timeSlot}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {t('appointment.time_slots')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="locationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('appointment.select_location')}</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('appointment.pick_location')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {locations.map((location) => (
                              <SelectItem key={location.id} value={location.id.toString()}>
                                {location.name || `${location.address}, ${location.city}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {locationsLoading ? (
                          <FormDescription>
                            {t('general.loading')}...
                          </FormDescription>
                        ) : locations.length === 0 ? (
                          <div className="mt-2">
                            <Alert>
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                {t('appointment.no_locations')}
                              </AlertDescription>
                            </Alert>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2"
                              onClick={handleAddLocation}
                              type="button"
                            >
                              {t('appointment.add_location')}
                            </Button>
                          </div>
                        ) : (
                          <FormDescription>
                            {t('appointment.location_description')}
                          </FormDescription>
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
                        <FormLabel>{t('appointment.reason')}</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder={t('appointment.reason_placeholder')} 
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {t('appointment.reason_description')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="mt-6">
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isLoading || locations.length === 0}
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {t('appointment.confirm_booking')}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>{t('appointment.summary')}</CardTitle>
            <CardDescription>
              {t('appointment.booking_details')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <User className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">{t('doctor.doctor')}</h4>
                <p className="text-sm text-muted-foreground">
                  Dr. {doctor.user.firstName} {doctor.user.lastName} - {doctor.specialty.name}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CalendarIcon className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">{t('appointment.date')}</h4>
                <p className="text-sm text-muted-foreground">
                  {form.watch('appointmentDate') ? (
                    format(new Date(form.watch('appointmentDate')), 'PPP', { locale })
                  ) : (
                    t('appointment.not_selected')
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">{t('appointment.time')}</h4>
                <p className="text-sm text-muted-foreground">
                  {form.watch('timeSlot') ? form.watch('timeSlot') : t('appointment.not_selected')}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">{t('appointment.location')}</h4>
                <p className="text-sm text-muted-foreground">
                  {(() => {
                    const locationId = form.watch('locationId');
                    const selectedLocation = locations.find(loc => loc.id === locationId);

                    if (!locationId || !selectedLocation) {
                      return t('appointment.not_selected');
                    }

                    return `${selectedLocation.address}, ${selectedLocation.city}`;
                  })()}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">{t('appointment.reason')}</h4>
                <p className="text-sm text-muted-foreground">
                  {form.watch('reasonForVisit') || t('appointment.not_provided')}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <DollarSign className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">{t('appointment.cost')}</h4>
                <p className="text-sm text-muted-foreground">
                  {new Intl.NumberFormat(i18n.language, { 
                    style: 'currency', 
                    currency: 'EUR' 
                  }).format(doctor.basePrice / 100)}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <div className="w-full">
              <p className="flex justify-between font-medium">
                <span>{t('appointment.total')}</span>
                <span>
                  {new Intl.NumberFormat(i18n.language, { 
                    style: 'currency', 
                    currency: 'EUR' 
                  }).format(doctor.basePrice / 100)}
                </span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {t('appointment.payment_explanation')}
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}