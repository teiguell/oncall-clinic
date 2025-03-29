import { useEffect } from "react";
import { useLocation } from "wouter";
import DoctorSearchComponent from "@/components/doctors/doctor-search";
import { useAuth } from "@/context/auth-context";

export default function DoctorSearch() {
  const { isAuthenticated } = useAuth();
  const [location, navigate] = useLocation();

  // Handle authentication via useEffect if you need to check auth
  // For doctor search, we'll allow non-authenticated users to view results
  // but redirect to login when they try to book

  return (
    <div className="pt-8 pb-16 bg-neutral-50">
      <DoctorSearchComponent />
    </div>
  );
}
