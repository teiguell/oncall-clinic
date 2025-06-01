import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { DoctorProfile } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Calendar, Users, Settings, Euro } from "lucide-react";

export default function DoctorDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  // Get doctor profile
  const { data: doctorProfile, isLoading: profileLoading } = useQuery<DoctorProfile>({
    queryKey: ['/api/doctor/profile'],
    enabled: !!user && user.userType === 'doctor',
    refetchOnWindowFocus: false,
  });

  // Get appointments
  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ['/api/appointments/doctor'],
    enabled: !!user && user.userType === 'doctor',
    refetchOnWindowFocus: false,
  });

  // Loading state
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Redirect if not a doctor
  if (!user || user.userType !== 'doctor') {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Médico</h1>
          <p className="text-gray-600">Gestiona tus citas y perfil profesional</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Resumen
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Citas
            </TabsTrigger>
            <TabsTrigger value="earnings" className="flex items-center gap-2">
              <Euro className="h-4 w-4" />
              Ganancias
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Perfil
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Citas Hoy</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Array.isArray(appointments) ? appointments.filter((apt: any) => {
                      const today = new Date().toDateString();
                      return new Date(apt.appointmentDate).toDateString() === today;
                    }).length : 0}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Citas Pendientes</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Array.isArray(appointments) ? appointments.filter((apt: any) => apt.status === 'scheduled').length : 0}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Estado</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {doctorProfile?.isAvailable ? 'Disponible' : 'No Disponible'}
                  </div>
                </CardContent>
              </Card>
            </div>

            {doctorProfile && (
              <Card>
                <CardHeader>
                  <CardTitle>Perfil del Médico</CardTitle>
                  <CardDescription>
                    Tu información profesional y datos de contacto
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Nombre</Label>
                      <p className="text-gray-900">{user.firstName} {user.lastName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Teléfono</Label>
                      <p className="text-gray-900">{user.phoneNumber}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Número de Licencia</Label>
                      <p className="text-gray-900">{doctorProfile.licenseNumber}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Experiencia</Label>
                      <p className="text-gray-900">{doctorProfile.experience} años</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Precio Base</Label>
                      <p className="text-gray-900">€{doctorProfile.basePrice}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Biografía</Label>
                    <p className="text-gray-900 mt-1">{doctorProfile.bio}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Educación</Label>
                    <p className="text-gray-900 mt-1">{doctorProfile.education}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mis Citas</CardTitle>
                <CardDescription>
                  Lista de todas tus citas programadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {appointmentsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : !Array.isArray(appointments) || appointments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No tienes citas programadas</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((appointment: any) => (
                      <div key={appointment.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">
                              Cita #{appointment.id}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {new Date(appointment.appointmentDate).toLocaleDateString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            <p className="text-sm text-gray-600">
                              Motivo: {appointment.reasonForVisit}
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                              appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                              appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {appointment.status === 'scheduled' ? 'Programada' :
                               appointment.status === 'completed' ? 'Completada' :
                               appointment.status === 'cancelled' ? 'Cancelada' : appointment.status}
                            </span>
                            <p className="text-sm font-medium mt-1">
                              €{appointment.totalAmount}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ganancias</CardTitle>
                <CardDescription>
                  Resumen de tus ingresos por consultas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Euro className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Información de ganancias próximamente</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Perfil</CardTitle>
                <CardDescription>
                  Actualiza tu información profesional
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Configuración del perfil próximamente</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}