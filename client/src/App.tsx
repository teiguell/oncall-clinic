import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/auth-context";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

// Initialize i18n
import "./i18n"; // Import the i18n configuration

// Custom hooks
import useWebSocketNotifications from "./hooks/useWebSocketNotifications";

// Layout components
import Navbar from "./components/layout/navbar";
import Footer from "./components/layout/footer";
import LanguageSwitcher from "./components/ui/language-switcher";
import { SandboxBanner } from "./components/common/SandboxBanner";

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

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <SandboxBanner />
      <Navbar />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/register/patient" component={PatientRegister} />
          <Route path="/verify" component={Verify} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/doctors" component={DoctorSearch} />
          <Route path="/doctors/:id" component={DoctorProfile} />
          <Route path="/appointment/new/:doctorId" component={AppointmentBooking} />
          <Route path="/appointment/success/:id" component={AppointmentSuccess} />
          <Route path="/dashboard/patient" component={PatientDashboard} />
          <Route path="/dashboard/doctor" component={DoctorDashboard} />
          <Route path="/profile" component={Profile} />
          <Route path="/register/doctor" component={DoctorRegister} />
          <Route path="/admin/doctor-verification" component={AdminDoctorVerification} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  const { t } = useTranslation();
  
  // Mock function to get JWT token from localStorage or context
  const getAuthToken = () => {
    return localStorage.getItem('auth_token');
  };
  
  // Use the WebSocket notifications hook
  const { 
    isConnected,
    lastNotification 
  } = useWebSocketNotifications(
    getAuthToken(), // Pass the authentication token
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
  
  // Log new notifications (optional)
  useEffect(() => {
    if (lastNotification) {
      console.log('New notification received:', lastNotification);
    }
  }, [lastNotification]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
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
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
