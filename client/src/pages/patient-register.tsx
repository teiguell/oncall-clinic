import { useState } from 'react';
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
import { UserPlus, Check, RefreshCw, CalendarIcon, Eye, EyeOff } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { OAuthButton } from '@/components/auth/oauth-button';

// Utils
import { apiRequest } from '@/lib/queryClient';
import { patientRegistrationSchema } from '@shared/schema';

// Form validation with refinements
const registerFormSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string(),
  firstName: z.string().min(2, "Nombre demasiado corto"),
  lastName: z.string().min(2, "Apellido demasiado corto"),
  phoneNumber: z.string().min(9, "Número de teléfono inválido"),
  
  // Optional fields
  address: z.string().optional(),
  city: z.string().optional(), 
  postalCode: z.string().optional(),
  dob: z.string().optional(), // fecha de nacimiento
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export default function PatientRegister() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationStep, setVerificationStep] = useState<boolean>(false);
  const [verificationData, setVerificationData] = useState<{
    verificationId?: string;
    userId?: number;
    verificationCode?: string;
  }>({});
  const [verificationCode, setVerificationCode] = useState('');

  // Formulario de registro
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      address: '',
      city: '',
      postalCode: '',
      dob: '',
    },
  });

  // Manejar envío del formulario
  async function onSubmit(values: RegisterFormValues) {
    try {
      setIsLoading(true);
      
      // Enviar datos al servidor
      const response = await apiRequest('/api/auth/patient/register', 'POST', {
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber,
        address: values.address || '',
        city: values.city || '',
        postalCode: values.postalCode || '',
        dob: values.dob || '',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al registrar paciente');
      }

      const data = await response.json();
      
      setVerificationData({
        verificationId: data.verificationId,
        userId: data.userId,
        verificationCode: data.verificationCode, // Solo para desarrollo
      });
      
      setVerificationStep(true);
      
      toast.success(t('register.success'));
    } catch (error) {
      console.error('Error during registration:', error);
      toast.error(error instanceof Error ? error.message : t('register.error'));
    } finally {
      setIsLoading(false);
    }
  }

  // Verificar código
  async function handleVerifyCode() {
    if (!verificationData.verificationId) return;
    
    try {
      setIsLoading(true);
      
      const response = await apiRequest('/api/auth/verify-code', 'POST', {
        verificationId: verificationData.userId?.toString() || verificationData.verificationId,
        code: verificationCode,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Código de verificación inválido');
      }

      toast.success(t('verification.success'));
      
      // Redireccionar a login
      setTimeout(() => {
        setLocation('/login');
      }, 1500);
    } catch (error) {
      console.error('Error during verification:', error);
      toast.error(error instanceof Error ? error.message : t('verification.error'));
    } finally {
      setIsLoading(false);
    }
  }

  // Cancelar verificación
  function handleCancelVerification() {
    setVerificationStep(false);
    setVerificationData({});
    setVerificationCode('');
  }

  if (verificationStep) {
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
            {verificationData.verificationCode && (
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
                  onClick={handleVerifyCode}
                  disabled={isLoading || verificationCode.length !== 6}
                >
                  <Check className="h-4 w-4 mr-2" />
                  {isLoading ? t('common.loading') : t('verification.verify')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            <UserPlus className="h-6 w-6 inline-block mr-2" />
            {t('patientRegister.title')}
          </CardTitle>
          <CardDescription className="text-center">
            {t('patientRegister.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Información personal */}
              <div className="space-y-4">
                <h3 className="font-medium">{t('patientRegister.personalInfo')}</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('common.firstName')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('common.firstNamePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('common.lastName')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('common.lastNamePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('common.email')}</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder={t('common.emailPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('common.phoneNumber')}</FormLabel>
                      <FormControl>
                        <Input placeholder="+34 XXX XXX XXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>{t('patientRegister.dob')}</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                            >
                              {field.value ? (
                                format(new Date(field.value), "PPP")
                              ) : (
                                <span>{t('patientRegister.selectDate')}</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date ? date.toISOString() : "")}
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Separator />
              
              {/* Dirección (opcional) */}
              <div className="space-y-4">
                <h3 className="font-medium">
                  {t('patientRegister.addressInfo')} 
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    {t('common.optional')}
                  </span>
                </h3>
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('common.address')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('common.addressPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('common.city')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('common.cityPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('common.postalCode')}</FormLabel>
                        <FormControl>
                          <Input placeholder="28001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <Separator />
              
              {/* Contraseña */}
              <div className="space-y-4">
                <h3 className="font-medium">{t('common.securityInfo')}</h3>
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('common.password')}</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="••••••••" 
                            {...field} 
                          />
                        </FormControl>
                        <button 
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('common.confirmPassword')}</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input 
                            type={showConfirmPassword ? "text" : "password"} 
                            placeholder="••••••••" 
                            {...field} 
                          />
                        </FormControl>
                        <button 
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t('common.loading') : t('register.submit')}
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
                  toast.success(t('login.success'));
                  // Redirigir al dashboard de paciente
                  setLocation('/patient-dashboard');
                }}
                isDisabled={isLoading}
                userType="patient"
              />
              
              {/* Comentado hasta implementar Apple OAuth */}
              {/* <OAuthButton 
                provider="apple" 
                onSuccess={(data) => {
                  toast.success(t('login.success'));
                  setLocation('/patient-dashboard');
                }}
                isDisabled={isLoading}
                userType="patient"
              /> */}
            </div>
          </div>
          

        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <p className="text-sm text-center">
            {t('register.alreadyHaveAccount')}{' '}
            <a href="/login" className="text-primary font-semibold hover:underline">
              {t('common.login')}
            </a>
          </p>
          <p className="text-sm text-center">
            {t('login.forgotPasswordQuestion')}{' '}
            <a href="/forgot-password" className="text-primary font-semibold hover:underline">
              {t('login.recoverPassword')}
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}