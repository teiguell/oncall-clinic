import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import { useQuery } from "@tanstack/react-query";
import { DoctorProfile, TimeSlot, WeeklyAvailability } from "@shared/schema";
import AppointmentList from "@/components/appointments/appointment-list";
import AvailabilityToggle from "@/components/doctor/availability-toggle";
import WeeklyAvailabilityCalendar from "@/components/doctor/WeeklyAvailabilityCalendar";
import useWeeklyAvailability from "@/hooks/useWeeklyAvailability";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, Plus, Trash2 } from "lucide-react";

// Schedule Tab Component
interface ScheduleTabProps {
  doctorProfile: DoctorProfile | undefined;
  profileLoading: boolean;
}

function ScheduleTab({ doctorProfile, profileLoading }: ScheduleTabProps) {
  const [selectedDay, setSelectedDay] = useState<keyof WeeklyAvailability>("monday");
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("17:00");
  
  // Initialize time slot management with the weekly availability hook
  const {
    weeklyAvailability,
    isLoading: availabilityLoading,
    isUpdating,
    addTimeSlot,
    removeTimeSlot,
    saveWeeklyAvailability
  } = useWeeklyAvailability({
    doctorId: doctorProfile?.id,
    initialData: doctorProfile?.weeklyAvailability as WeeklyAvailability,
    onSuccess: () => {
      // Could add additional callbacks here if needed
    }
  });

  // Handle adding a new time slot
  const handleAddTimeSlot = () => {
    if (startTime >= endTime) {
      // Show error notification
      alert(t('doctor.invalidTimeSlot'));
      return;
    }
    
    addTimeSlot(selectedDay, { start: startTime, end: endTime });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('doctorDashboard.schedule')}</CardTitle>
        <CardDescription>{t('doctorDashboard.weeklyScheduleDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">{t('availability.status')}</h3>
          <div className="flex items-center space-x-4 mb-4 p-4 border rounded-md">
            <div>
              <h4 className="text-sm font-medium mb-1">{t('availability.toggle')}</h4>
              <p className="text-sm text-neutral-500">
                {profileLoading ? t('common.loading') : 
                  doctorProfile?.isAvailable ? 
                    t('availability.available') : 
                    t('availability.unavailable')
                }
              </p>
            </div>
            <AvailabilityToggle 
              doctorProfile={doctorProfile} 
              isLoading={profileLoading}
              className="ml-auto"
            />
          </div>
        </div>
        
        {/* Weekly Schedule Calendar */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">{t('doctor.weeklyAvailability')}</h3>
          <WeeklyAvailabilityCalendar 
            availability={weeklyAvailability} 
            onRemoveTimeSlot={removeTimeSlot}
            isLoading={availabilityLoading}
          />
        </div>
        
        {/* Add new time slot form */}
        <div className="p-4 border rounded-md mt-6">
          <h4 className="font-medium mb-4">{t('doctor.addTimeSlot')}</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label htmlFor="day-select">{t('common.day')}</Label>
              <select
                id="day-select"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value as keyof WeeklyAvailability)}
              >
                <option value="monday">{t('days.monday')}</option>
                <option value="tuesday">{t('days.tuesday')}</option>
                <option value="wednesday">{t('days.wednesday')}</option>
                <option value="thursday">{t('days.thursday')}</option>
                <option value="friday">{t('days.friday')}</option>
                <option value="saturday">{t('days.saturday')}</option>
                <option value="sunday">{t('days.sunday')}</option>
              </select>
            </div>
            <div>
              <Label htmlFor="start-time">{t('doctor.startTime')}</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end-time">{t('doctor.endTime')}</Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => {
                setStartTime("09:00");
                setEndTime("17:00");
              }}
            >
              {t('common.reset')}
            </Button>
            <Button 
              type="button" 
              onClick={handleAddTimeSlot}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('doctor.addTimeSlot')}
            </Button>
          </div>
        </div>
        
        {/* Save button */}
        <div className="mt-6 flex justify-end">
          <Button 
            onClick={saveWeeklyAvailability} 
            disabled={isUpdating}
            className="min-w-[120px]"
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('common.saving')}
              </>
            ) : t('common.saveChanges')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DoctorDashboard() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("appointments");
  
  // Fetch doctor profile data
  const { data: doctorProfile, isLoading: profileLoading } = useQuery<DoctorProfile>({
    queryKey: ['/api/doctors/profile'],
    enabled: isAuthenticated && user?.userType === 'doctor'
  });

  // Redirect if not logged in or not a doctor
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate("/login");
      } else if (user && user.userType !== "doctor") {
        navigate("/dashboard/patient");
      }
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        <span className="ml-2">Cargando...</span>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Debes iniciar sesión para acceder a tu dashboard
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (user.userType !== "doctor") {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Esta área es solo para médicos
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard del Médico</h1>
        <p className="text-neutral-500">Gestiona tus citas y perfil profesional</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left sidebar with doctor info */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Mi perfil</CardTitle>
              <CardDescription>Información profesional</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center mb-4">
                <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xl font-bold mb-3">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <h3 className="text-lg font-medium">Dr. {user.firstName} {user.lastName}</h3>
                <p className="text-neutral-500">{user.email}</p>
              </div>
              
              <div className="space-y-4 mt-6">
                <div>
                  <p className="text-sm text-neutral-500">Nombre</p>
                  <p className="font-medium">{user.firstName} {user.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Teléfono</p>
                  <p className="font-medium">{user.phoneNumber}</p>
                </div>
                <Button variant="outline" className="w-full" onClick={() => navigate("/profile")}>
                  Editar perfil
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('availability.status')}</CardTitle>
                <CardDescription>{t('doctorDashboard.availabilityDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="py-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium">{t('availability.toggle')}</h4>
                      <p className="text-sm text-neutral-500">
                        {profileLoading ? t('common.loading') : 
                          doctorProfile?.isAvailable ? 
                            t('availability.available') : 
                            t('availability.unavailable')
                        }
                      </p>
                    </div>
                    <AvailabilityToggle 
                      doctorProfile={doctorProfile} 
                      isLoading={profileLoading}
                      className="ml-auto"
                    />
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setActiveTab("schedule")}
                >
                  {t('doctorDashboard.schedule')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main content area */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="appointments" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="appointments">Mis citas</TabsTrigger>
              <TabsTrigger value="schedule">Horario</TabsTrigger>
              <TabsTrigger value="patients">Mis pacientes</TabsTrigger>
              <TabsTrigger value="reviews">Reseñas recibidas</TabsTrigger>
            </TabsList>

            <TabsContent value="appointments">
              <AppointmentList />
            </TabsContent>

            <TabsContent value="schedule">
              <ScheduleTab doctorProfile={doctorProfile} profileLoading={profileLoading || false} />
            </TabsContent>

            <TabsContent value="patients">
              <Card>
                <CardHeader>
                  <CardTitle>Mis pacientes</CardTitle>
                  <CardDescription>Historial y seguimiento de pacientes</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="py-10 text-center text-neutral-500">
                    Esta función estará disponible próximamente
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <Card>
                <CardHeader>
                  <CardTitle>Reseñas recibidas</CardTitle>
                  <CardDescription>Valoraciones de tus pacientes</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="py-10 text-center text-neutral-500">
                    Esta función estará disponible próximamente
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
