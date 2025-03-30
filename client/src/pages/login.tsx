import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { toast } from 'react-toastify';

// Components
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, LogIn, Check, RefreshCw } from 'lucide-react';
import { OAuthButton } from '@/components/auth/oauth-button';

// Utils
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/context/auth-context';

type LoginFormValues = {
  email: string;
  password: string;
  remember: boolean;
};

export default function Login() {
  const { t } = useTranslation();
  
  // Schema para validación de formulario
  const loginFormSchema = z.object({
    email: z.string()
      .min(1, "Email is required")
      .email("Invalid email format"),
    password: z.string()
      .min(1, "Password is required"),
    remember: z.boolean().optional().default(false),
  });
  const [, params] = useLocation();
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'email' | 'twoFactor' | null>(null);
  const [verificationData, setVerificationData] = useState<{
    verificationId: string;
    userId?: number;
    verificationCode?: string;
    twoFactorCode?: string;
  } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');

  // Formulario de login
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  });

  // Manejar envío del formulario
  async function onSubmit(values: LoginFormValues) {
    try {
      setIsLoading(true);

      const result = await login({
        email: values.email,
        password: values.password,
        remember: values.remember,
      });

      // Si llegamos aquí, el login fue exitoso
      toast.success(t('login.success'));
      
      // Redirigir a la página correspondiente según el tipo de usuario
      // O a la página de donde vino el usuario
      const redirectTo = new URLSearchParams(params).get('redirect') || 
                         (result.user.userType === 'patient' ? '/patient-dashboard' : 
                          result.user.userType === 'doctor' ? '/doctor-dashboard' : 
                          '/');
                         
      setLocation(redirectTo);
      
    } catch (error: any) {
      console.error('Error during login:', error);
      
      // Manejar caso especial: correo no verificado
      if (error.status === 403 && error.data?.verificationId) {
        setVerificationData({
          verificationId: error.data.verificationId,
          userId: error.data.userId,
          verificationCode: error.data.verificationCode, // Solo para desarrollo
        });
        setVerificationStep('email');
        return;
      }
      
      // Manejar caso especial: requiere 2FA
      if (error.data?.requiresTwoFactor) {
        setVerificationData({
          verificationId: error.data.verificationId,
          twoFactorCode: error.data.twoFactorCode, // Solo para desarrollo
        });
        setVerificationStep('twoFactor');
        return;
      }
      
      toast.error(error.data?.message || t('login.error'));
    } finally {
      setIsLoading(false);
    }
  }

  // Verificar código de email
  async function handleVerifyEmail() {
    if (!verificationData) return;
    
    try {
      setIsLoading(true);
      
      const response = await apiRequest('/api/auth/verify-code', {
        method: 'POST',
        body: JSON.stringify({
          verificationId: verificationData.userId?.toString() || verificationData.verificationId,
          code: verificationCode,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Código de verificación inválido');
      }

      toast.success('Correo electrónico verificado correctamente');
      
      // Volver al formulario de login
      setVerificationStep(null);
      setVerificationData(null);
      setVerificationCode('');
    } catch (error) {
      console.error('Error durante la verificación:', error);
      toast.error(error instanceof Error ? error.message : 'Error al verificar código');
    } finally {
      setIsLoading(false);
    }
  }

  // Verificar código 2FA
  async function handleVerifyTwoFactor() {
    if (!verificationData) return;
    
    try {
      setIsLoading(true);
      
      // Completar la autenticación con el código 2FA
      const response = await apiRequest('/api/auth/verify-2fa', {
        method: 'POST',
        body: JSON.stringify({
          verificationId: verificationData.verificationId,
          code: verificationCode,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Código de verificación inválido');
      }

      const data = await response.json();
      
      // Guardar token de sesión y redirigir
      localStorage.setItem('sessionId', data.sessionId);
      
      toast.success('Inicio de sesión exitoso');
      
      // Redirigir a la página correspondiente según el tipo de usuario
      setLocation(data.user.userType === 'patient' ? '/patient-dashboard' : 
                 data.user.userType === 'doctor' ? '/doctor-dashboard' : '/');
    } catch (error) {
      console.error('Error durante la verificación 2FA:', error);
      toast.error(error instanceof Error ? error.message : 'Error al verificar código');
    } finally {
      setIsLoading(false);
    }
  }

  // Reenviar código de verificación
  async function handleResendCode() {
    if (!verificationData || !form.getValues().email) return;
    
    try {
      setIsLoading(true);
      
      // Llamar a un endpoint que reenvíe el código según el tipo de verificación
      const endpoint = verificationStep === 'email' ? '/api/auth/resend-verification' : '/api/auth/resend-2fa';
      
      const response = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          email: form.getValues().email,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al reenviar código');
      }

      const data = await response.json();
      
      // Actualizar datos de verificación con el nuevo código
      if (verificationStep === 'email') {
        setVerificationData({
          ...verificationData,
          verificationId: data.verificationId,
          verificationCode: data.verificationCode,
        });
      } else {
        setVerificationData({
          ...verificationData,
          verificationId: data.verificationId,
          twoFactorCode: data.twoFactorCode,
        });
      }
      
      toast.info('Código reenviado correctamente');
    } catch (error) {
      console.error('Error al reenviar código:', error);
      toast.error(error instanceof Error ? error.message : 'Error al reenviar código');
    } finally {
      setIsLoading(false);
    }
  }

  // Cancelar verificación
  function handleCancelVerification() {
    setVerificationStep(null);
    setVerificationData(null);
    setVerificationCode('');
  }

  if (verificationStep === 'email') {
    return (
      <div className="container max-w-md mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {t('verification.title')}
            </CardTitle>
            <CardDescription className="text-center">
              {t('verification.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-center">
              {t('verification.instructions')}
            </p>
            
            {/* Para desarrollo mostramos el código */}
            {verificationData?.verificationCode && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-xs text-yellow-700">
                  <strong>Código de desarrollo:</strong> {verificationData.verificationCode}
                </p>
              </div>
            )}
            
            <div className="flex flex-col items-center space-y-4">
              <Input
                className="text-center text-xl tracking-widest w-full max-w-xs"
                placeholder="123456"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
              
              <div className="flex space-x-2 w-full max-w-xs">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleCancelVerification}
                  disabled={isLoading}
                >
                  {t('common.cancel')}
                </Button>
                <Button 
                  type="button" 
                  className="flex-1"
                  onClick={handleVerifyEmail}
                  disabled={isLoading || verificationCode.length !== 6}
                >
                  <Check className="h-4 w-4 mr-2" />
                  {isLoading ? t('common.loading') : t('verification.verify')}
                </Button>
              </div>
              
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={handleResendCode}
                disabled={isLoading}
                className="text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                {t('verification.resendCode')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (verificationStep === 'twoFactor') {
    return (
      <div className="container max-w-md mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {t('twoFactor.title')}
            </CardTitle>
            <CardDescription className="text-center">
              {t('twoFactor.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-center">
              {t('twoFactor.instructions')}
            </p>
            
            {/* Para desarrollo mostramos el código */}
            {verificationData?.twoFactorCode && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-xs text-yellow-700">
                  <strong>Código de desarrollo:</strong> {verificationData.twoFactorCode}
                </p>
              </div>
            )}
            
            <div className="flex flex-col items-center space-y-4">
              <Input
                className="text-center text-xl tracking-widest w-full max-w-xs"
                placeholder="123456"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
              
              <div className="flex space-x-2 w-full max-w-xs">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleCancelVerification}
                  disabled={isLoading}
                >
                  {t('common.cancel')}
                </Button>
                <Button 
                  type="button" 
                  className="flex-1"
                  onClick={handleVerifyTwoFactor}
                  disabled={isLoading || verificationCode.length !== 6}
                >
                  <Check className="h-4 w-4 mr-2" />
                  {isLoading ? t('common.loading') : t('twoFactor.verify')}
                </Button>
              </div>
              
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={handleResendCode}
                disabled={isLoading}
                className="text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                {t('twoFactor.resendCode')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            <LogIn className="h-6 w-6 inline-block mr-2" />
            {t('auth.login')}
          </CardTitle>
          <CardDescription className="text-center">
            {t('login.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('common.email')}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder={t('common.emailPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('common.password')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          {...field} 
                        />
                        <button 
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </FormControl>
                    <div className="flex justify-between items-center mt-1">
                      <FormField
                        control={form.control}
                        name="remember"
                        render={({ field }) => (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="remember"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <label
                              htmlFor="remember"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {t('login.rememberMe')}
                            </label>
                          </div>
                        )}
                      />
                      <a href="/forgot-password" className="text-sm text-primary hover:underline">
                        {t('auth.forgotPassword')}
                      </a>
                    </div>
                    <FormMessage className="text-destructive" />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t('common.loading') : t('login.submit')}
              </Button>
            </form>
          </Form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  {t('auth.orContinueWith')}
                </span>
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <OAuthButton 
                provider="google" 
                onSuccess={(data) => {
                  // Redirigir a la página correspondiente según el tipo de usuario
                  const redirectTo = new URLSearchParams(params).get('redirect') || 
                                    (data.user.userType === 'patient' ? '/patient-dashboard' : 
                                     data.user.userType === 'doctor' ? '/doctor-dashboard' : 
                                     '/');
                  setLocation(redirectTo);
                }}
                isDisabled={isLoading}
              />
              
              {/* Comentado hasta implementar Apple OAuth */}
              {/* <OAuthButton 
                provider="apple" 
                onSuccess={handleOAuthSuccess}
                isDisabled={isLoading}
              /> */}
            </div>
          </div>
          

        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-center">
            {t('login.noAccount')}{' '}
            <a href="/register" className="text-primary font-semibold hover:underline">
              {t('login.createAccount')}
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}