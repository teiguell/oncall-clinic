import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router, Route, Switch } from "wouter";
import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";

// Layout Components
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

// Pages
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import PatientRegister from "@/pages/patient-register";
import DoctorRegister from "@/pages/doctor-register";
import PatientDashboard from "@/pages/patient-dashboard";
import DoctorDashboard from "@/pages/doctor-dashboard";
import DoctorSearch from "@/pages/doctor-search";
import AppointmentBooking from "@/pages/appointment-booking";
import AppointmentSuccess from "@/pages/appointment-success";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";
import About from "@/pages/about";
import ForgotPassword from "@/pages/forgot-password";
import Verify from "@/pages/verify";
import AdminDoctorVerification from "@/pages/admin-doctor-verification";
import AdminTraceability from "@/pages/admin-traceability";
import { ProtectedRoute } from "@/lib/protected-route";

// Legal Pages
import PrivacyPolicyES from "@/pages/legal/privacy-policy-es";
import PrivacyPolicyEN from "@/pages/legal/privacy-policy-en";
import TermsOfUseES from "@/pages/legal/terms-of-use-es";
import TermsOfUseEN from "@/pages/legal/terms-of-use-en";
import CookiesPolicyES from "@/pages/legal/cookies-policy-es";
import CookiesPolicyEN from "@/pages/legal/cookies-policy-en";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="flex-grow">
        <Switch>
          {/* Public Routes */}
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/patient/register" component={PatientRegister} />
          <Route path="/doctor/register" component={DoctorRegister} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/verify" component={Verify} />
          <Route path="/about" component={About} />
          <Route path="/doctors" component={DoctorSearch} />

          {/* Legal Pages */}
          <Route path="/legal/privacy-policy-es" component={PrivacyPolicyES} />
          <Route path="/legal/privacy-policy-en" component={PrivacyPolicyEN} />
          <Route path="/legal/terms-of-use-es" component={TermsOfUseES} />
          <Route path="/legal/terms-of-use-en" component={TermsOfUseEN} />
          <Route path="/legal/cookies-policy-es" component={CookiesPolicyES} />
          <Route path="/legal/cookies-policy-en" component={CookiesPolicyEN} />

          {/* Protected Routes */}
          <Route path="/dashboard/patient" component={PatientDashboard} />
          <Route path="/dashboard/doctor" component={DoctorDashboard} />
          <Route path="/doctor-dashboard" component={DoctorDashboard} />
          <ProtectedRoute path="/book/:doctorId" component={AppointmentBooking} />
          <ProtectedRoute path="/appointment/success" component={AppointmentSuccess} />
          <ProtectedRoute path="/profile" component={Profile} />

          {/* Admin Routes */}
          <ProtectedRoute 
            path="/admin/doctors/verify" 
            component={AdminDoctorVerification}
          />
          <ProtectedRoute 
            path="/admin/traceability" 
            component={AdminTraceability}
          />

          {/* Fallback */}
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;