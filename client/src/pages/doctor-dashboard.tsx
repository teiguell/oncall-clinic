import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import AppointmentList from "@/components/appointments/appointment-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";

export default function DoctorDashboard() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("appointments");

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
                <CardTitle>Disponibilidad</CardTitle>
                <CardDescription>Configura tus horas de trabajo</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="py-4 text-center text-neutral-500 text-sm">
                  Esta función estará disponible próximamente
                </p>
                <Button variant="outline" className="w-full" disabled>
                  Configurar horario
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
              <TabsTrigger value="patients">Mis pacientes</TabsTrigger>
              <TabsTrigger value="reviews">Reseñas recibidas</TabsTrigger>
            </TabsList>

            <TabsContent value="appointments">
              <AppointmentList />
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
