import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox"; // Added import for Checkbox
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription 
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, AlertCircle, User, Stethoscope } from "lucide-react";

// Base schema for common fields
const baseSchema = z.object({
  firstName: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  lastName: z.string().min(2, { message: "El apellido debe tener al menos 2 caracteres" }),
  email: z.string().email({ message: "Por favor, introduce un correo electrónico válido" }),
  phoneNumber: z.string().min(9, { message: "El número de teléfono debe tener al menos 9 dígitos" }),
  password: z.string()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" })
    .max(100),
  confirmPassword: z.string(),
  userType: z.enum(["patient", "doctor"]),
  termsAccepted: z.boolean().refine(val => val, {message: t('auth.terms_required')}) // Added termsAccepted field
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof baseSchema>;

export default function RegisterForm() {
  const { register } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"patient" | "doctor">("patient");

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      userType: "patient",
      termsAccepted: false // Added default value for termsAccepted
    },
  });

  // When tab changes, update the userType value in the form
  const handleTabChange = (value: string) => {
    setActiveTab(value as "patient" | "doctor");
    form.setValue("userType", value as "patient" | "doctor");
  };

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      // Generate a username from the email (before the @ symbol)
      const username = data.email.split('@')[0];

      // Register the user
      const result = await register({
        ...data,
        username
      });

      toast({
        title: "Registro exitoso",
        description: "Te hemos enviado un código de verificación",
      });

      // Navigate to verification page with the verification ID
      navigate(`/verify?id=${result.verificationId}&email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      console.error("Registration error:", error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Error al registrarse. Intenta de nuevo.");
      }

      toast({
        variant: "destructive",
        title: "Error en el registro",
        description: "No se pudo completar el registro. Intenta de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Crear una cuenta</CardTitle>
        <CardDescription>
          Regístrate para acceder a los servicios médicos
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="patient" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              Paciente
            </TabsTrigger>
            <TabsTrigger value="doctor" className="flex items-center">
              <Stethoscope className="mr-2 h-4 w-4" />
              Médico
            </TabsTrigger>
          </TabsList>
          <TabsContent value="patient">
            <p className="text-sm text-neutral-500 mb-4">
              Regístrate como paciente para buscar y reservar citas con médicos certificados.
            </p>
          </TabsContent>
          <TabsContent value="doctor">
            <p className="text-sm text-neutral-500 mb-4">
              Regístrate como médico para ofrecer tus servicios a pacientes en tu zona.
            </p>
          </TabsContent>
        </Tabs>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nombre" 
                        {...field} 
                        disabled={isLoading}
                      />
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
                      <Input 
                        placeholder="Apellidos" 
                        {...field} 
                        disabled={isLoading}
                      />
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
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="nombre@ejemplo.com" 
                      type="email" 
                      {...field} 
                      disabled={isLoading}
                    />
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
                    <Input 
                      placeholder="612345678" 
                      type="tel" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Contraseña" 
                        type="password" 
                        {...field} 
                        disabled={isLoading}
                      />
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
                    <FormLabel>Confirmar contraseña</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Confirmar contraseña" 
                        type="password" 
                        {...field} 
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="userType"
              render={({ field }) => (
                <FormItem className="hidden">
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-1"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="patient" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Paciente
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="doctor" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Médico
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="termsAccepted"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      {t('auth.terms_accept')} <Link href="/legal/privacy" className="text-primary hover:underline">
                        {t('legal.privacy_policy')}
                      </Link>
                    </FormLabel>
                    <FormMessage />
                  </div>
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
                  Procesando...
                </>
              ) : (
                "Crear cuenta"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-center text-neutral-600">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login">
            <a className="text-primary-500 hover:underline">Inicia sesión</a>
          </Link>
        </div>
        <div className="text-xs text-center text-neutral-500">
          Al registrarte, aceptas nuestros{" "}
          <a href="#" className="text-primary-500 hover:underline">Términos de servicio</a>{" "}
          y{" "}
          <a href="#" className="text-primary-500 hover:underline">Política de privacidad</a>
        </div>
      </CardFooter>
    </Card>
  );
}