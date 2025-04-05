import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider, useAuth } from "./context/auth-context";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

// Initialize i18n
import "./i18n"; // Import the i18n configuration

// Error handling
import ErrorBoundary from "./components/error/ErrorBoundary";
import FallbackError from "./components/error/FallbackError";
import { logger } from "./lib/errorLogger";

// Custom hooks
import useWebSocketNotifications from "./hooks/useWebSocketNotifications";
import useErrorLogger from "./hooks/useErrorLogger";

// Layout components
import Navbar from "./components/layout/navbar";
import Footer from "./components/layout/footer";
import LanguageSwitcher from "./components/ui/language-switcher";
import { SandboxBanner } from "./components/common/SandboxBanner";
import LoadingScreen from "./components/ui/loading-screen";

// Dev/Sandbox components
import { ErrorLogger } from "./components/dev/ErrorLogger";
import { ErrorGenerator } from "./components/dev/ErrorGenerator";
import { IS_SANDBOX } from "./lib/sandbox";

// Pages
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import PatientRegister from "./pages/patient-register";
import Verify from "./pages/verify";
import ForgotPassword from "./pages/forgot-password";
import DoctorSearch from "./pages/doctor-search";
import DoctorProfile from "./pages/doctor-profile";
import AppointmentBooking from "./pages/appointment-booking";
import AppointmentSuccess from "./pages/appointment-success";
import PatientDashboard from "./pages/patient-dashboard";
import DoctorDashboard from "./pages/doctor-dashboard";
import Profile from "./pages/profile";
import NotFound from "./pages/not-found";
import DoctorRegister from "./pages/doctor-register";
import AdminDoctorVerification from "./pages/admin-doctor-verification";
import AboutPage from "./pages/about";

// Layout wrapper component that applies the app structure
function AppLayout({ children, fullHeight = false }: { children: React.ReactNode; fullHeight?: boolean }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className={`flex-grow ${fullHeight ? 'flex flex-col' : ''}`}>
        <ErrorBoundary FallbackComponent={FallbackError}>
          {children}
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}

// Route components with layout applied
function HomeRoute() {
  return (
    <AppLayout>
      <Home />
    </AppLayout>
  );
}

function LoginRoute() {
  return (
    <AppLayout fullHeight>
      <Login />
    </AppLayout>
  );
}

function RegisterRoute() {
  return (
    <AppLayout fullHeight>
      <Register />
    </AppLayout>
  );
}

function PatientRegisterRoute() {
  return (
    <AppLayout fullHeight>
      <PatientRegister />
    </AppLayout>
  );
}

function VerifyRoute() {
  return (
    <AppLayout fullHeight>
      <Verify />
    </AppLayout>
  );
}

function ForgotPasswordRoute() {
  return (
    <AppLayout fullHeight>
      <ForgotPassword />
    </AppLayout>
  );
}

function DoctorSearchRoute() {
  return (
    <AppLayout>
      <DoctorSearch />
    </AppLayout>
  );
}

function DoctorProfileRoute() {
  return (
    <AppLayout>
      <DoctorProfile />
    </AppLayout>
  );
}

function AppointmentBookingRoute() {
  return (
    <AppLayout>
      <AppointmentBooking />
    </AppLayout>
  );
}

function AppointmentSuccessRoute() {
  return (
    <AppLayout>
      <AppointmentSuccess />
    </AppLayout>
  );
}

function PatientDashboardRoute() {
  return (
    <AppLayout>
      <PatientDashboard />
    </AppLayout>
  );
}

function DoctorDashboardRoute() {
  return (
    <AppLayout>
      <DoctorDashboard />
    </AppLayout>
  );
}

function ProfileRoute() {
  return (
    <AppLayout>
      <Profile />
    </AppLayout>
  );
}

function DoctorRegisterRoute() {
  return (
    <AppLayout fullHeight>
      <DoctorRegister />
    </AppLayout>
  );
}

function AdminDoctorVerificationRoute() {
  return (
    <AppLayout>
      <AdminDoctorVerification />
    </AppLayout>
  );
}

function AboutRoute() {
  return (
    <AppLayout>
      <AboutPage />
    </AppLayout>
  );
}

function NotFoundRoute() {
  // No layout for NotFound as it has its own full page design
  // Pero aún así lo envolvemos en ErrorBoundary
  return (
    <ErrorBoundary FallbackComponent={FallbackError}>
      <NotFound />
    </ErrorBoundary>
  );
}

// Importar el componente ProtectedRoute
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      {/* Rutas públicas */}
      <Route path="/" component={HomeRoute} />
      <Route path="/login" component={LoginRoute} />
      <Route path="/register" component={RegisterRoute} />
      <Route path="/register/patient" component={PatientRegisterRoute} />
      <Route path="/register/doctor" component={DoctorRegisterRoute} />
      <Route path="/verify" component={VerifyRoute} />
      <Route path="/forgot-password" component={ForgotPasswordRoute} />
      <Route path="/doctors" component={DoctorSearchRoute} />
      <Route path="/doctors/:id" component={DoctorProfileRoute} />
      <Route path="/about" component={AboutRoute} />
      
      {/* Rutas protegidas que requieren autenticación */}
      <ProtectedRoute 
        path="/appointment/new/:doctorId" 
        component={AppointmentBookingRoute} 
        userType="patient" // Solo pacientes pueden reservar citas
      />
      <ProtectedRoute 
        path="/appointment/success/:id" 
        component={AppointmentSuccessRoute} 
      />
      <ProtectedRoute 
        path="/profile" 
        component={ProfileRoute} 
      />
      
      {/* Rutas específicas por tipo de usuario */}
      <ProtectedRoute 
        path="/dashboard/patient" 
        component={PatientDashboardRoute} 
        userType="patient"
      />
      <ProtectedRoute 
        path="/dashboard/doctor" 
        component={DoctorDashboardRoute} 
        userType="doctor"
      />
      <ProtectedRoute 
        path="/admin/doctor-verification" 
        component={AdminDoctorVerificationRoute} 
        userType="admin"
      />
      
      {/* Ruta para páginas no encontradas */}
      <Route component={NotFoundRoute} />
    </Switch>
  );
}

function App() {
  const { t } = useTranslation();
  
  // Envolvemos toda la aplicación en un ErrorBoundary para capturar errores globales
  return (
    <ErrorBoundary FallbackComponent={FallbackError}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppContent />
          <Toaster />
          {/* ToastContainer for react-toastify */}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          
          {/* Componentes para desarrollo/sandbox - sólo se muestran en modo SANDBOX */}
          {IS_SANDBOX && <ErrorLogger />}
          {IS_SANDBOX && <ErrorGenerator />}
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

// Componente interior que puede acceder a useAuth después de que AuthProvider esté disponible
function AppContent() {
  const { t, ready } = useTranslation();
  
  if (!ready) {
    return <LoadingScreen />;
  }
  const { user } = useAuth();
  
  // WebSocket comentado temporalmente para debugging
  // Simulamos las variables para evitar errores
  const isConnected = false;
  const lastNotification = null;
  
  /*
  const { 
    isConnected,
    lastNotification 
  } = useWebSocketNotifications(
    user?.id ? user.id.toString() : null, // Usar ID del usuario como token de autenticación
    '/ws', // WebSocket endpoint (relative to current host)
    {
      autoReconnect: true,
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      onConnected: () => {
        console.log('✅ Connected to notification service');
      },
      onDisconnected: () => {
        console.log('❌ Disconnected from notification service');
      }
    }
  );
  */
  
  // Inicializar el error logger para capturar errores
  const errorLogger = useErrorLogger();
  
  // Log new notifications (optional)
  useEffect(() => {
    if (lastNotification) {
      console.log('New notification received:', lastNotification);
    }
  }, [lastNotification]);

  return <Router />;
}

export default App;
