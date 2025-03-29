import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { AlertCircle, CheckCircle, XCircle, FileBadge, FileCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';

// Esquema para validación del formulario de verificación
const verificationFormSchema = z.object({
  adminNotes: z.string().optional(),
  isVerified: z.boolean().default(true)
});

type VerificationFormData = z.infer<typeof verificationFormSchema>;

export default function AdminDoctorVerificationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ url: string, title: string } | null>(null);

  // Redirigir si no es administrador
  if (user && user.userType !== 'admin') {
    navigate('/');
    return null;
  }

  // Formulario para la verificación
  const form = useForm<VerificationFormData>({
    resolver: zodResolver(verificationFormSchema),
    defaultValues: {
      adminNotes: '',
      isVerified: true
    }
  });

  // Obtener médicos sin verificar
  const unverifiedDoctorsQuery = useQuery({
    queryKey: ['/api/admin/unverified-doctors'],
    select: (data) => data?.doctors || [],
  });

  // Mutación para verificar a un médico
  const verifyDoctorMutation = useMutation({
    mutationFn: async (data: { doctorId: number, isVerified: boolean, adminNotes?: string }) => {
      return apiRequest('/api/admin/verify-doctor', {
        method: 'POST',
        data
      });
    },
    onSuccess: () => {
      setVerifyDialogOpen(false);
      toast({
        title: "Médico verificado con éxito",
        description: "El médico ha sido notificado y ahora puede recibir citas.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/unverified-doctors'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al verificar médico",
        description: error.message || "Ha ocurrido un error al intentar verificar al médico.",
        variant: "destructive"
      });
    }
  });

  const openVerifyDialog = (doctor: any) => {
    setSelectedDoctor(doctor);
    setVerifyDialogOpen(true);
  };

  const handleVerifyDoctor = (formData: VerificationFormData) => {
    if (!selectedDoctor) return;

    verifyDoctorMutation.mutate({
      doctorId: selectedDoctor.id,
      isVerified: formData.isVerified,
      adminNotes: formData.adminNotes
    });
  };

  const previewDocument = (url: string, title: string) => {
    setPreviewImage({ url, title });
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Verificación de Médicos</h1>
      
      {!user && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acceso no autorizado</AlertTitle>
          <AlertDescription>
            Debe iniciar sesión como administrador para acceder a esta página.
          </AlertDescription>
        </Alert>
      )}
      
      {unverifiedDoctorsQuery.isLoading ? (
        <div className="text-center py-12">
          <p>Cargando solicitudes de verificación...</p>
        </div>
      ) : unverifiedDoctorsQuery.isError ? (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No se pudieron cargar las solicitudes de verificación. Por favor, intente nuevamente.
          </AlertDescription>
        </Alert>
      ) : unverifiedDoctorsQuery.data.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <p className="text-lg font-medium">No hay solicitudes pendientes de verificación</p>
            <p className="text-muted-foreground">Todas las solicitudes de médicos han sido procesadas.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {unverifiedDoctorsQuery.data.map((doctor: any) => (
            <Card key={doctor.id} className="overflow-hidden">
              <CardHeader className="bg-primary/5">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>
                      Dr. {doctor.user?.firstName} {doctor.user?.lastName}
                    </CardTitle>
                    <CardDescription>
                      {doctor.specialty || "Especialidad no especificada"} - Nº Colegiado: {doctor.licenseNumber}
                    </CardDescription>
                  </div>
                  <Badge variant={doctor.isVerified ? "default" : "outline"}>
                    {doctor.isVerified ? "Verificado" : "Pendiente"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Información Personal</h3>
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-2">
                        <span className="font-medium text-muted-foreground">Correo:</span>
                        <span>{doctor.user?.email}</span>
                      </div>
                      <div className="grid grid-cols-2">
                        <span className="font-medium text-muted-foreground">Teléfono:</span>
                        <span>{doctor.user?.phoneNumber}</span>
                      </div>
                      <div className="grid grid-cols-2">
                        <span className="font-medium text-muted-foreground">Experiencia:</span>
                        <span>{doctor.experience} años</span>
                      </div>
                      <div className="grid grid-cols-2">
                        <span className="font-medium text-muted-foreground">Precio base:</span>
                        <span>{(doctor.basePrice / 100).toFixed(2)} €</span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-medium mt-6 mb-2">Formación Académica</h3>
                    <p className="text-sm whitespace-pre-wrap">{doctor.education}</p>
                    
                    <h3 className="text-lg font-medium mt-6 mb-2">Biografía Profesional</h3>
                    <p className="text-sm whitespace-pre-wrap">{doctor.bio}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Documentación</h3>
                    <div className="space-y-3">
                      {doctor.identityDocFront ? (
                        <div className="flex items-center p-3 border rounded-md bg-muted/20">
                          <FileBadge className="h-5 w-5 mr-2 text-blue-500" />
                          <span className="flex-grow">DNI (Anverso)</span>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => previewDocument(doctor.identityDocFront, "DNI (Anverso)")}
                          >
                            Ver
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center p-3 border rounded-md bg-red-50">
                          <XCircle className="h-5 w-5 mr-2 text-red-500" />
                          <span className="flex-grow text-red-600">DNI (Anverso) - No cargado</span>
                        </div>
                      )}
                      
                      {doctor.identityDocBack ? (
                        <div className="flex items-center p-3 border rounded-md bg-muted/20">
                          <FileBadge className="h-5 w-5 mr-2 text-blue-500" />
                          <span className="flex-grow">DNI (Reverso)</span>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => previewDocument(doctor.identityDocBack, "DNI (Reverso)")}
                          >
                            Ver
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center p-3 border rounded-md bg-red-50">
                          <XCircle className="h-5 w-5 mr-2 text-red-500" />
                          <span className="flex-grow text-red-600">DNI (Reverso) - No cargado</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/20 border-t flex justify-end gap-2 py-4">
                <Button 
                  variant="default" 
                  onClick={() => openVerifyDialog(doctor)}
                  disabled={verifyDoctorMutation.isPending}
                >
                  {verifyDoctorMutation.isPending ? "Procesando..." : "Verificar Médico"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Diálogo de verificación */}
      {selectedDoctor && (
        <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verificar Doctor</DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleVerifyDoctor)} className="space-y-4">
                <div className="text-center mb-2">
                  <span className="font-medium">
                    Dr. {selectedDoctor.user?.firstName} {selectedDoctor.user?.lastName}
                  </span>
                  <p className="text-sm text-muted-foreground">
                    {selectedDoctor.specialty} - Nº Colegiado: {selectedDoctor.licenseNumber}
                  </p>
                </div>
                
                <FormField
                  control={form.control}
                  name="adminNotes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas de verificación</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Añada notas o comentarios para el médico (opcional)"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Estas notas serán visibles para el médico.
                      </FormDescription>
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setVerifyDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  
                  <Button 
                    type="submit" 
                    disabled={verifyDoctorMutation.isPending}
                  >
                    {verifyDoctorMutation.isPending ? "Verificando..." : "Verificar Médico"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Previsualizador de documentos */}
      {previewImage && (
        <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{previewImage.title}</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center">
              <img 
                src={previewImage.url} 
                alt={previewImage.title}
                className="max-h-[70vh] object-contain" 
              />
            </div>
            <DialogFooter>
              <Button onClick={() => setPreviewImage(null)}>Cerrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}