import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import VerifyForm from "@/components/auth/verify-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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

    if (!id && !emailParam) {
      setError("Enlace de verificación inválido. Por favor, solicita un nuevo código de verificación.");
      return;
    }

    if (id) {
      setVerificationId(id);
    }
    
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [location]);

  const goToLogin = () => {
    navigate("/login");
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <Card className="max-w-md mx-auto p-6">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            variant="outline" 
            className="mt-4 flex items-center" 
            onClick={goToLogin}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio de sesión
          </Button>
        </Card>
      </div>
    );
  }

  // Si no tenemos el ID pero tenemos el email, podemos continuar solo con el email
  // El nuevo sistema usará la sesión para almacenar el código
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <VerifyForm verificationId={verificationId} email={email} />
    </div>
  );
}
