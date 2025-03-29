import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Mail, ArrowRight } from "lucide-react";

const verifySchema = z.object({
  code: z.string()
    .min(6, { message: "El código debe tener 6 dígitos" })
    .max(6)
    .regex(/^\d+$/, { message: "El código debe contener solo números" })
});

type VerifyFormValues = z.infer<typeof verifySchema>;

interface VerifyFormProps {
  verificationId: string;
  email: string;
}

export default function VerifyForm({ verificationId, email }: VerifyFormProps) {
  const { verifyEmail } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: ""
    },
  });

  const onSubmit = async (data: VerifyFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      await verifyEmail({
        verificationId,
        code: data.code
      });
      
      toast({
        title: "Verificación exitosa",
        description: "Tu correo electrónico ha sido verificado. Ya puedes iniciar sesión.",
      });
      
      navigate("/login");
    } catch (error) {
      console.error("Verification error:", error);
      
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Error al verificar el correo. Intenta de nuevo.");
      }
      
      toast({
        variant: "destructive",
        title: "Error de verificación",
        description: "Código incorrecto o expirado. Intenta de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Verificar tu correo</CardTitle>
        <CardDescription>
          Ingresa el código de verificación enviado a {email}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center">
            <Mail className="h-8 w-8 text-primary-500" />
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de verificación</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ingresa el código de 6 dígitos" 
                      {...field} 
                      disabled={isLoading}
                      maxLength={6}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  Verificar y continuar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-center text-neutral-600">
          ¿No recibiste el código?{" "}
          <button 
            className="text-primary-500 hover:underline"
            onClick={() => {
              toast({
                title: "Código reenviado",
                description: "Hemos enviado un nuevo código a tu correo.",
              });
            }}
          >
            Reenviar código
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}
