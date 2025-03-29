import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import LoginForm from "@/components/auth/login-form";

export default function Login() {
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on user type
      if (user.userType === "doctor") {
        navigate("/dashboard/doctor");
      } else {
        navigate("/dashboard/patient");
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <LoginForm />
    </div>
  );
}
