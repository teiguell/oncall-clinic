import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  Stethoscope, 
  CheckCircle, 
  XCircle, 
  Eye, 
  FileText,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Shield,
  Activity,
  Home
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface User {
  id: number;
  username: string;
  email: string;
  userType: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  emailVerified: boolean;
  createdAt: string;
  profilePicture?: string;
}

interface DoctorProfile {
  id: number;
  userId: number;
  licenseNumber: string;
  education: string;
  experience: number;
  bio: string;
  basePrice: number;
  isAvailable: boolean;
  isVerified: boolean;
  identityDocFront?: string;
  identityDocBack?: string;
  professionalCertificate?: string;
  professionalPhoto?: string;
  locationAddress: string;
  user: User;
}

interface PatientProfile {
  id: number;
  userId: number;
  address: string;
  city: string;
  postalCode: string;
  dob?: string;
  insuranceInfo?: string;
  medicalHistory?: string;
  user: User;
}

export default function AdminPanel() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("doctors");
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<PatientProfile | null>(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const { toast } = useToast();

  // Fetch doctors
  const { data: doctors, isLoading: doctorsLoading } = useQuery<DoctorProfile[]>({
    queryKey: ['/api/admin/doctors'],
  });

  // Fetch patients
  const { data: patients, isLoading: patientsLoading } = useQuery<PatientProfile[]>({
    queryKey: ['/api/admin/patients'],
  });

  // Verify doctor mutation
  const verifyDoctorMutation = useMutation({
    mutationFn: async ({ doctorId, verified, notes }: { doctorId: number; verified: boolean; notes: string }) => {
      const response = await apiRequest('POST', '/api/admin/verify-doctor', {
        doctorId,
        verified,
        notes
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/doctors'] });
      toast({
        title: "Verificación actualizada",
        description: "El estado de verificación del médico ha sido actualizado",
      });
      setSelectedDoctor(null);
      setVerificationNotes("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la verificación",
        variant: "destructive",
      });
    },
  });

  // Activate/deactivate user mutation
  const toggleUserMutation = useMutation({
    mutationFn: async ({ userId, active }: { userId: number; active: boolean }) => {
      const response = await apiRequest('POST', '/api/admin/toggle-user', {
        userId,
        active
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/doctors'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/patients'] });
      toast({
        title: "Usuario actualizado",
        description: "El estado del usuario ha sido actualizado",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el usuario",
        variant: "destructive",
      });
    },
  });

  const handleVerifyDoctor = (verified: boolean) => {
    if (!selectedDoctor) return;
    
    verifyDoctorMutation.mutate({
      doctorId: selectedDoctor.id,
      verified,
      notes: verificationNotes
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
                <p className="text-sm text-gray-600">OnCall Clinic - Sistema de gestión</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="flex items-center space-x-2"
            >
              <Home className="h-4 w-4" />
              <span>Volver al inicio</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="doctors" className="flex items-center space-x-2">
              <Stethoscope className="h-4 w-4" />
              <span>Médicos ({doctors?.length || 0})</span>
            </TabsTrigger>
            <TabsTrigger value="patients" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Pacientes ({patients?.length || 0})</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Estadísticas</span>
            </TabsTrigger>
          </TabsList>

          {/* Doctors Tab */}
          <TabsContent value="doctors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Médicos</CardTitle>
                <CardDescription>
                  Verifica documentación y administra perfiles médicos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {doctorsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Cargando médicos...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Médico</TableHead>
                        <TableHead>Contacto</TableHead>
                        <TableHead>Licencia</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Registro</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {doctors?.map((doctor) => (
                        <TableRow key={doctor.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={doctor.professionalPhoto} />
                                <AvatarFallback>
                                  {doctor.user.firstName[0]}{doctor.user.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {doctor.user.firstName} {doctor.user.lastName}
                                </p>
                                <p className="text-sm text-gray-600">@{doctor.user.username}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1 text-sm">
                                <Mail className="h-3 w-3" />
                                <span>{doctor.user.email}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-sm">
                                <Phone className="h-3 w-3" />
                                <span>{doctor.user.phoneNumber}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-mono text-sm">{doctor.licenseNumber}</p>
                              <p className="text-xs text-gray-600">{doctor.experience} años exp.</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge variant={doctor.isVerified ? "default" : "secondary"}>
                                {doctor.isVerified ? "Verificado" : "Pendiente"}
                              </Badge>
                              <Badge variant={doctor.isAvailable ? "outline" : "destructive"}>
                                {doctor.isAvailable ? "Activo" : "Inactivo"}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(doctor.user.createdAt)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedDoctor(doctor)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>
                                      Verificación de Médico - {doctor.user.firstName} {doctor.user.lastName}
                                    </DialogTitle>
                                    <DialogDescription>
                                      Revisa la documentación y verifica al médico
                                    </DialogDescription>
                                  </DialogHeader>
                                  
                                  {selectedDoctor && (
                                    <div className="space-y-6">
                                      {/* Personal Info */}
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label>Información Personal</Label>
                                          <div className="space-y-2 mt-2">
                                            <p><strong>Nombre:</strong> {selectedDoctor.user.firstName} {selectedDoctor.user.lastName}</p>
                                            <p><strong>Email:</strong> {selectedDoctor.user.email}</p>
                                            <p><strong>Teléfono:</strong> {selectedDoctor.user.phoneNumber}</p>
                                            <p><strong>Licencia:</strong> {selectedDoctor.licenseNumber}</p>
                                            <p><strong>Experiencia:</strong> {selectedDoctor.experience} años</p>
                                          </div>
                                        </div>
                                        <div>
                                          <Label>Foto Profesional</Label>
                                          {selectedDoctor.professionalPhoto ? (
                                            <img 
                                              src={selectedDoctor.professionalPhoto} 
                                              alt="Foto profesional"
                                              className="w-32 h-32 object-cover rounded-lg mt-2"
                                            />
                                          ) : (
                                            <div className="w-32 h-32 bg-gray-200 rounded-lg mt-2 flex items-center justify-center">
                                              <FileText className="h-8 w-8 text-gray-400" />
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Documents */}
                                      <div className="space-y-4">
                                        <Label>Documentación</Label>
                                        <div className="grid grid-cols-3 gap-4">
                                          <div>
                                            <p className="text-sm font-medium mb-2">DNI - Frontal</p>
                                            {selectedDoctor.identityDocFront ? (
                                              <img 
                                                src={selectedDoctor.identityDocFront} 
                                                alt="DNI frontal"
                                                className="w-full h-32 object-cover rounded border"
                                              />
                                            ) : (
                                              <div className="w-full h-32 bg-gray-100 rounded border flex items-center justify-center">
                                                <FileText className="h-6 w-6 text-gray-400" />
                                              </div>
                                            )}
                                          </div>
                                          <div>
                                            <p className="text-sm font-medium mb-2">DNI - Trasera</p>
                                            {selectedDoctor.identityDocBack ? (
                                              <img 
                                                src={selectedDoctor.identityDocBack} 
                                                alt="DNI trasera"
                                                className="w-full h-32 object-cover rounded border"
                                              />
                                            ) : (
                                              <div className="w-full h-32 bg-gray-100 rounded border flex items-center justify-center">
                                                <FileText className="h-6 w-6 text-gray-400" />
                                              </div>
                                            )}
                                          </div>
                                          <div>
                                            <p className="text-sm font-medium mb-2">Certificado Profesional</p>
                                            {selectedDoctor.professionalCertificate ? (
                                              <img 
                                                src={selectedDoctor.professionalCertificate} 
                                                alt="Certificado"
                                                className="w-full h-32 object-cover rounded border"
                                              />
                                            ) : (
                                              <div className="w-full h-32 bg-gray-100 rounded border flex items-center justify-center">
                                                <FileText className="h-6 w-6 text-gray-400" />
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Verification Notes */}
                                      <div className="space-y-2">
                                        <Label htmlFor="verification-notes">Notas de Verificación</Label>
                                        <Textarea
                                          id="verification-notes"
                                          value={verificationNotes}
                                          onChange={(e) => setVerificationNotes(e.target.value)}
                                          placeholder="Agregar notas sobre la verificación..."
                                          className="min-h-[100px]"
                                        />
                                      </div>

                                      {/* Actions */}
                                      <div className="flex justify-end space-x-3">
                                        <Button
                                          variant="destructive"
                                          onClick={() => handleVerifyDoctor(false)}
                                          disabled={verifyDoctorMutation.isPending}
                                        >
                                          <XCircle className="h-4 w-4 mr-2" />
                                          Rechazar
                                        </Button>
                                        <Button
                                          onClick={() => handleVerifyDoctor(true)}
                                          disabled={verifyDoctorMutation.isPending}
                                        >
                                          <CheckCircle className="h-4 w-4 mr-2" />
                                          Verificar
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                              
                              <Button
                                variant={doctor.isAvailable ? "destructive" : "default"}
                                size="sm"
                                onClick={() => toggleUserMutation.mutate({
                                  userId: doctor.userId,
                                  active: !doctor.isAvailable
                                })}
                                disabled={toggleUserMutation.isPending}
                              >
                                {doctor.isAvailable ? "Desactivar" : "Activar"}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Pacientes</CardTitle>
                <CardDescription>
                  Administra perfiles de pacientes registrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {patientsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Cargando pacientes...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Contacto</TableHead>
                        <TableHead>Ubicación</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Registro</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patients?.map((patient) => (
                        <TableRow key={patient.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={patient.user.profilePicture} />
                                <AvatarFallback>
                                  {patient.user.firstName[0]}{patient.user.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {patient.user.firstName} {patient.user.lastName}
                                </p>
                                <p className="text-sm text-gray-600">@{patient.user.username}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1 text-sm">
                                <Mail className="h-3 w-3" />
                                <span>{patient.user.email}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-sm">
                                <Phone className="h-3 w-3" />
                                <span>{patient.user.phoneNumber}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1 text-sm">
                              <MapPin className="h-3 w-3" />
                              <span>{patient.city}, {patient.postalCode}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={patient.user.emailVerified ? "default" : "secondary"}>
                              {patient.user.emailVerified ? "Verificado" : "Pendiente"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(patient.user.createdAt)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleUserMutation.mutate({
                                userId: patient.userId,
                                active: !patient.user.emailVerified
                              })}
                              disabled={toggleUserMutation.isPending}
                            >
                              {patient.user.emailVerified ? "Desactivar" : "Activar"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Médicos</CardTitle>
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{doctors?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {doctors?.filter(d => d.isVerified).length || 0} verificados
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Pacientes</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{patients?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {patients?.filter(p => p.user.emailVerified).length || 0} verificados
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Médicos Activos</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {doctors?.filter(d => d.isAvailable && d.isVerified).length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Disponibles ahora
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}