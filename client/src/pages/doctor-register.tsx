import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next';

// Adaptación del esquema de registro de médicos para frontend (sin archivos)
const doctorRegistrationSchema = z.object({
  // Información de usuario
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string(),
  firstName: z.string().min(2, "Nombre demasiado corto"),
  lastName: z.string().min(2, "Apellido demasiado corto"),
  phoneNumber: z.string().min(9, "Número de teléfono inválido"),
  
  // Información profesional
  licenseNumber: z.string().min(4, "Número de colegiado inválido"),
  specialtyId: z.number({ required_error: "Debe seleccionar una especialidad" }),
  education: z.string().min(10, "Por favor, proporcione más detalles sobre su educación"),
  experience: z.number().min(0, "La experiencia no puede ser negativa"),
  bio: z.string().min(50, "La biografía debe tener al menos 50 caracteres"),
  basePrice: z.number().min(10, "El precio base debe ser mayor que 10 €"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof doctorRegistrationSchema>;

export default function DoctorRegisterPage() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [verificationData, setVerificationData] = useState<{ verificationId: string, verificationCode: string } | null>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Especialidades
  const specialtiesQuery = useQuery({
    queryKey: ['/api/specialties'],
    select: (data) => {
      return data || [];
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest('/api/doctor/register', {
        method: 'POST',
        data
      });
    },
    onSuccess: (response) => {
      setVerificationData({
        verificationId: response.verificationId,
        verificationCode: response.verificationCode
      });
      setCurrentStep(3); // Pasar a la pantalla de verificación
      toast({
        title: "¡Registro exitoso!",
        description: "Por favor verifique su correo electrónico para continuar."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error de registro",
        description: error.message || "Ocurrió un error al registrar su cuenta. Por favor intente nuevamente.",
        variant: "destructive"
      });
    }
  });

  const verifyMutation = useMutation({
    mutationFn: async (data: { verificationId: string, code: string }) => {
      return apiRequest('/api/auth/verify', {
        method: 'POST',
        data
      });
    },
    onSuccess: () => {
      toast({
        title: "¡Verificación exitosa!",
        description: "Su cuenta ha sido verificada. Ahora puede iniciar sesión."
      });
      navigate('/login');
    },
    onError: (error: any) => {
      toast({
        title: "Error de verificación",
        description: error.message || "Ocurrió un error al verificar su cuenta. Por favor intente nuevamente.",
        variant: "destructive"
      });
    }
  });

  const form = useForm<FormData>({
    resolver: zodResolver(doctorRegistrationSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      licenseNumber: '',
      specialtyId: undefined,
      education: '',
      experience: 0,
      bio: '',
      basePrice: 2500, // €25.00 en centavos
    }
  });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    
    try {
      await registerMutation.mutateAsync(data);
    } catch (error) {
      console.error("Error during doctor registration:", error);
    }
    
    setSubmitting(false);
  };

  const onVerify = () => {
    if (!verificationData) return;
    
    const code = form.watch('confirmPassword'); // Reutilizamos el campo para el código
    
    verifyMutation.mutate({
      verificationId: verificationData.verificationId,
      code
    });
  };

  const nextStep = () => {
    const fields = currentStep === 1 
      ? ['email', 'password', 'confirmPassword', 'firstName', 'lastName', 'phoneNumber'] 
      : ['licenseNumber', 'specialtyId', 'education', 'experience', 'bio', 'basePrice'];
    
    const isValid = fields.every(field => form.getFieldState(field as keyof FormData).invalid === false);
    
    if (isValid) {
      setCurrentStep(currentStep + 1);
    } else {
      // Trigger validation on relevant fields
      form.trigger(fields as (keyof FormData)[]);
      toast({
        title: "Campos incompletos",
        description: "Por favor complete todos los campos requeridos correctamente.",
        variant: "destructive"
      });
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">1. Información Personal</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Nombre" {...field} />
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
              <FormLabel>Apellidos</FormLabel>
              <FormControl>
                <Input placeholder="Apellidos" {...field} />
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
            <FormLabel>Correo Electrónico</FormLabel>
            <FormControl>
              <Input type="email" placeholder="ejemplo@oncall.clinic" {...field} />
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
            <FormLabel>Teléfono</FormLabel>
            <FormControl>
              <Input placeholder="Número de teléfono" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Contraseña" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar Contraseña</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Confirmar Contraseña" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">2. Información Profesional</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="licenseNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de Colegiado</FormLabel>
              <FormControl>
                <Input placeholder="Nº de colegiado" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="specialtyId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Especialidad</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una especialidad" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {specialtiesQuery.isLoading ? (
                    <SelectItem value="loading" disabled>Cargando especialidades...</SelectItem>
                  ) : specialtiesQuery.data?.map((specialty: any) => (
                    <SelectItem key={specialty.id} value={specialty.id.toString()}>
                      {specialty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="experience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Años de Experiencia</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Años de experiencia" 
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="basePrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Precio Base (€)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Precio base en euros" 
                  {...field}
                  // Convertimos de céntimos a euros para la visualización, pero guardamos en céntimos
                  value={field.value ? field.value / 100 : ''}
                  onChange={(e) => {
                    const euros = parseFloat(e.target.value);
                    if (!isNaN(euros)) {
                      field.onChange(Math.round(euros * 100)); // Convertir a céntimos
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="education"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Educación y Formación</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Describa su formación académica, títulos, instituciones y años" 
                className="min-h-[100px]"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="bio"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Biografía profesional</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Incluya una descripción de su trayectoria profesional, especialización y enfoque de tratamiento" 
                className="min-h-[150px]"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="mt-4 text-sm text-muted-foreground">
        <p>En un próximo paso, se le solicitará subir los siguientes documentos:</p>
        <ul className="list-disc list-inside mt-2">
          <li>Documento Nacional de Identidad (ambas caras)</li>
          <li>Título de médico</li>
          <li>Certificado de colegiación</li>
        </ul>
        <p className="mt-2">Esta información será verificada por nuestro equipo antes de poder atender pacientes.</p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">3. Verificación de Cuenta</h3>
      <p className="text-sm text-muted-foreground">
        Hemos enviado un código de verificación a su correo electrónico. Por favor introdúzcalo a continuación para completar su registro.
      </p>
      
      {/* Para el demo, mostrar el código de verificación */}
      {verificationData && (
        <div className="p-4 mb-4 bg-muted rounded-md">
          <p className="text-sm font-medium">Código de verificación (para demo):</p>
          <p className="font-mono text-lg">{verificationData.verificationCode}</p>
        </div>
      )}
      
      <FormField
        control={form.control}
        name="confirmPassword" // Reutilizamos este campo para el código
        render={({ field }) => (
          <FormItem>
            <FormLabel>Código de Verificación</FormLabel>
            <FormControl>
              <Input 
                placeholder="Ingrese el código de 6 dígitos" 
                {...field} 
                value={undefined} // Reset the value
                onChange={(e) => field.onChange(e.target.value)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <Button
        type="button"
        className="w-full"
        onClick={onVerify}
        disabled={verifyMutation.isPending}
      >
        {verifyMutation.isPending ? "Verificando..." : "Verificar"}
      </Button>
      
      <div className="text-center mt-4">
        <p className="text-sm text-muted-foreground">
          ¿No recibió el código? 
          <Button variant="link" className="p-0 ml-1 h-auto" onClick={() => {}}>
            Reenviar código
          </Button>
        </p>
      </div>
    </div>
  );

  return (
    <div className="container max-w-3xl py-8">
      <Card className="border shadow-md">
        <CardHeader className="bg-primary/5">
          <CardTitle className="text-2xl font-bold">Registro de Médicos</CardTitle>
          <CardDescription>
            Complete la información para unirse a OnCall Clinic como profesional médico
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              
              {currentStep < 3 && (
                <div className="flex justify-between mt-6">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                    >
                      Anterior
                    </Button>
                  )}
                  
                  {currentStep < 2 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className={currentStep === 1 ? "ml-auto" : ""}
                    >
                      Siguiente
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={submitting}
                    >
                      {submitting ? "Enviando..." : "Completar Registro"}
                    </Button>
                  )}
                </div>
              )}
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center bg-muted/20 border-t">
          <p className="text-sm text-muted-foreground">
            ¿Ya tiene una cuenta? <a href="/login" className="text-primary hover:underline">Iniciar sesión</a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}