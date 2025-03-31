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
import { Loader2, AlertCircle, Mail, ArrowRight, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

interface VerifyFormProps {
  verificationId: string;
  email: string;
}

export default function VerifyForm({ verificationId, email }: VerifyFormProps) {
  const { verifyEmail, sendVerificationCode } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCodeSent, setIsCodeSent] = useState(false);

  // Esquema de validación del formulario con i18n
  const verifySchema = z.object({
    code: z.string()
      .min(6, { message: t('verification.invalidCode') })
      .max(6)
      .regex(/^\d+$/, { message: t('verification.invalidCode') })
  });

  type VerifyFormValues = z.infer<typeof verifySchema>;

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
      // Incluir el email en la verificación para que funcione con ambos sistemas
      // verifyEmail ahora devuelve los datos del usuario después de la verificación
      const userData = await verifyEmail({
        verificationId,
        code: data.code,
        email: email // Incluir el email para compatibilidad con express-session
      });
      
      // Mostrar mensaje de bienvenida
      toast({
        title: t('verification.success'),
        description: t('common.welcome') + `, ${userData?.firstName || ''}!`,
      });
      
      // Redirigir según el tipo de usuario
      if (userData?.userType === 'doctor') {
        navigate("/dashboard/doctor");
      } else {
        navigate("/dashboard/patient");
      }
    } catch (error) {
      console.error("Verification error:", error);
      
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(t('verification.verifyError'));
      }
      
      toast({
        variant: "destructive",
        title: t('verification.error'),
        description: t('verification.invalidCode'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError(null);
    
    try {
      const response = await sendVerificationCode(email);
      
      setIsCodeSent(true);
      
      toast({
        title: t('verification.resendSuccess'),
        description: t('verification.subtitle'),
        action: (
          <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="h-4 w-4 text-green-600" />
          </div>
        )
      });
      
      // Reiniciar el estado después de 3 segundos
      setTimeout(() => {
        setIsCodeSent(false);
      }, 3000);
      
    } catch (error) {
      console.error("Error resending code:", error);
      
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(t('verification.resendError'));
      }
      
      toast({
        variant: "destructive",
        title: t('common.error'),
        description: t('verification.resendError'),
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t('verification.title')}</CardTitle>
        <CardDescription>
          {t('verification.enterVerificationCode')} {email}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isCodeSent && (
          <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{t('verification.resendSuccess')}</AlertDescription>
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
                  <FormLabel>{t('verification.verificationCode')}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t('verification.invalidCode')} 
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
                  {t('common.loading')}
                </>
              ) : (
                <>
                  {t('verification.verify')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-center text-neutral-600">
          {t('verification.instructions')}{" "}
          <button 
            className="text-primary-500 hover:underline"
            onClick={handleResendCode}
            disabled={isResending}
          >
            {isResending ? t('common.loading') : t('verification.resendCode')}
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}
