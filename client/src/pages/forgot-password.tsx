import { useState } from "react";
import { z } from "zod";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Check, Mail, KeyRound, ArrowLeft, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define schemas
const forgotPasswordSchema = z.object({
  email: z.string().email()
});

const verifyCodeSchema = z.object({
  code: z.string().min(6, "El código debe tener al menos 6 caracteres")
});

const resetPasswordSchema = z.object({
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"]
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
type VerifyCodeFormValues = z.infer<typeof verifyCodeSchema>;
type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ForgotPassword() {
  const { toast } = useToast();
  
  // State
  const [currentStep, setCurrentStep] = useState<"email" | "verify" | "reset">("email");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationId, setVerificationId] = useState("");
  
  // Forms
  const emailForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ""
    }
  });
  
  const verifyForm = useForm<VerifyCodeFormValues>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: {
      code: ""
    }
  });
  
  const resetForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  });
  
  // Submit handlers
  async function onSubmit(values: ForgotPasswordFormValues) {
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest('/api/auth/forgot-password', {
        method: 'POST',
        data: values
      });
      
      // Guardar email para los siguientes pasos
      setEmail(values.email);
      
      // Para desarrollo, el servidor devuelve el código y el ID de verificación
      if (response.verificationId && response.verificationCode) {
        setVerificationId(response.verificationId);
        setVerificationCode(response.verificationCode);
        toast({
          title: "Código enviado",
          description: `Código: ${response.verificationCode}`,
        });
      }
      
      // Avanzar al siguiente paso
      setCurrentStep("verify");
      
      toast({
        title: "Email enviado",
        description: "Si la dirección existe, recibirás un código de verificación.",
      });
    } catch (error) {
      console.error("Error al enviar el email:", error);
      toast({
        title: "Error",
        description: "Ha ocurrido un error al enviar el email. Intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  async function handleVerifyCode(values: VerifyCodeFormValues) {
    setIsSubmitting(true);
    
    try {
      await apiRequest('/api/auth/verify-reset-code', {
        method: 'POST',
        data: {
          verificationId,
          code: values.code
        }
      });
      
      setCurrentStep("reset");
      
      toast({
        title: "Código verificado",
        description: "Ahora puedes restablecer tu contraseña.",
      });
    } catch (error) {
      console.error("Error al verificar el código:", error);
      toast({
        title: "Error",
        description: "El código es inválido o ha expirado.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  async function handleResetPassword(values: ResetPasswordFormValues) {
    setIsSubmitting(true);
    
    try {
      await apiRequest('/api/auth/reset-password', {
        method: 'POST',
        data: {
          verificationId,
          code: verifyForm.getValues().code,
          password: values.password
        }
      });
      
      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido actualizada exitosamente.",
      });
      
      // Redirigir al login después de unos segundos
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (error) {
      console.error("Error al restablecer la contraseña:", error);
      toast({
        title: "Error",
        description: "Ha ocurrido un error al restablecer la contraseña.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  async function handleResendCode() {
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest('/api/auth/resend-reset-code', {
        method: 'POST',
        data: { email }
      });
      
      // Para desarrollo, el servidor devuelve el código y el ID de verificación
      if (response.verificationId && response.verificationCode) {
        setVerificationId(response.verificationId);
        setVerificationCode(response.verificationCode);
        toast({
          title: "Código reenviado",
          description: `Nuevo código: ${response.verificationCode}`,
        });
      }
      
      toast({
        title: "Código reenviado",
        description: "Si la dirección existe, recibirás un nuevo código de verificación.",
      });
    } catch (error) {
      console.error("Error al reenviar el código:", error);
      toast({
        title: "Error",
        description: "Ha ocurrido un error al reenviar el código.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  function handleCancelVerification() {
    setCurrentStep("email");
    verifyForm.reset();
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-md">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">{t("auth.recoverPassword")}</CardTitle>
          <CardDescription>
            {t("auth.forgotPasswordQuestion")}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {currentStep === "email" && (
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("auth.email")}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="usuario@ejemplo.com" 
                          type="email" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("Enviando...")}
                    </>
                  ) : (
                    t("Enviar código de recuperación")
                  )}
                </Button>
              </form>
            </Form>
          )}
          
          {currentStep === "verify" && (
            <>
              <Alert className="mb-4">
                <Mail className="h-4 w-4" />
                <AlertTitle>{t("Código enviado")}</AlertTitle>
                <AlertDescription>
                  {t("Hemos enviado un código de verificación a")} {email}
                </AlertDescription>
              </Alert>
              
              <Form {...verifyForm}>
                <form onSubmit={verifyForm.handleSubmit(handleVerifyCode)} className="space-y-4">
                  <FormField
                    control={verifyForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("auth.verification.code")}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="123456" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={handleCancelVerification}
                      disabled={isSubmitting}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      {t("Volver")}
                    </Button>
                    
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("Verificando...")}
                        </>
                      ) : (
                        t("Verificar código")
                      )}
                    </Button>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <Button
                    type="button"
                    variant="link"
                    className="w-full"
                    onClick={handleResendCode}
                    disabled={isSubmitting}
                  >
                    {t("¿No recibiste el código? Reenviar")}
                  </Button>
                </form>
              </Form>
            </>
          )}
          
          {currentStep === "reset" && (
            <>
              <Alert className="mb-4">
                <Check className="h-4 w-4" />
                <AlertTitle>{t("Código verificado")}</AlertTitle>
                <AlertDescription>
                  {t("Ahora puedes restablecer tu contraseña")}
                </AlertDescription>
              </Alert>
              
              <Form {...resetForm}>
                <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-4">
                  <FormField
                    control={resetForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("auth.password")}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="••••••••" 
                            type="password" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={resetForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("auth.confirmPassword")}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="••••••••" 
                            type="password" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("Actualizando contraseña...")}
                      </>
                    ) : (
                      t("Actualizar contraseña")
                    )}
                  </Button>
                </form>
              </Form>
            </>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center w-full">
            <Link href="/login" className="text-sm text-blue-600 hover:text-blue-800">
              {t("¿Ya tienes cuenta? Iniciar sesión")}
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}