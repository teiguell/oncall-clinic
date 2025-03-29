import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import VerifyForm from "@/components/auth/verify-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function Verify() {
  const [location, navigate] = useLocation();
  const [verificationId, setVerificationId] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Parse query parameters
    const searchParams = new URLSearchParams(location.split("?")[1]);
    const id = searchParams.get("id");
    const emailParam = searchParams.get("email");

    if (!id) {
      setError("Enlace de verificación inválido. Por favor, solicita un nuevo código de verificación.");
      return;
    }

    setVerificationId(id);
    
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [location]);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <VerifyForm verificationId={verificationId} email={email} />
    </div>
  );
}
