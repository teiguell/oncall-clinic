import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./context/auth-context";

// Layout components
import Navbar from "./components/layout/navbar";
import Footer from "./components/layout/footer";

// Pages
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import Verify from "./pages/verify";
import DoctorSearch from "./pages/doctor-search";
import DoctorProfile from "./pages/doctor-profile";
import AppointmentBooking from "./pages/appointment-booking";
import AppointmentSuccess from "./pages/appointment-success";
import PatientDashboard from "./pages/patient-dashboard";
import DoctorDashboard from "./pages/doctor-dashboard";
import Profile from "./pages/profile";
import NotFound from "./pages/not-found";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/verify" component={Verify} />
          <Route path="/doctors" component={DoctorSearch} />
          <Route path="/doctors/:id" component={DoctorProfile} />
          <Route path="/appointment/new/:doctorId" component={AppointmentBooking} />
          <Route path="/appointment/success/:id" component={AppointmentSuccess} />
          <Route path="/dashboard/patient" component={PatientDashboard} />
          <Route path="/dashboard/doctor" component={DoctorDashboard} />
          <Route path="/profile" component={Profile} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
