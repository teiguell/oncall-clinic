import { useState } from "react";
import { Link, useLocation } from "wouter";
import { DoctorProfile, Review } from "@/types";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/payment";
import RatingDisplay from "@/components/rating/rating-display";
import { 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  Clock, 
  Award, 
  School, 
  Briefcase, 
  FileText, 
  User
} from "lucide-react";
import { useAuth } from "@/context/auth-context";

interface DoctorProfileViewProps {
  doctor: DoctorProfile;
  reviews?: Review[];
}

export default function DoctorProfileView({ doctor, reviews = [] }: DoctorProfileViewProps) {
  const [, navigate] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("about");
  
  const { user: doctorUser, specialty, availability } = doctor;
  
  if (!doctorUser) {
    return <div>Error: Doctor information not available</div>;
  }

  const handleBookAppointment = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    navigate(`/appointment/new/${doctor.id}`);
  };
  
  // Format days of week
  const getDayOfWeek = (day: number) => {
    const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    return days[day];
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 sm:p-8 bg-primary-50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center">
            <div className="flex-shrink-0 mb-4 sm:mb-0">
              <img 
                className="h-24 w-24 rounded-full bg-white p-1 border border-primary-200"
                src={doctorUser.profilePicture || `https://ui-avatars.com/api/?name=${doctorUser.firstName}+${doctorUser.lastName}&background=0D8ABC&color=fff`}
                alt={`${doctorUser.firstName} ${doctorUser.lastName}`}
              />
            </div>
            <div className="sm:ml-6">
              <h1 className="text-2xl font-bold text-neutral-900">
                {doctorUser.userType === 'doctor' ? 'Dr.' : 'Dra.'} {doctorUser.firstName} {doctorUser.lastName}
              </h1>
              <p className="text-lg text-neutral-600">{specialty?.name || "Medicina General"}</p>
              <div className="flex items-center mt-1">
                <RatingDisplay rating={doctor.averageRating} />
                <span className="text-sm text-neutral-500 ml-1">
                  ({reviews.length} reseñas)
                </span>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center text-sm text-neutral-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>Madrid, España</span>
                </div>
                <div className="flex items-center text-sm text-neutral-500">
                  <Phone className="h-4 w-4 mr-1" />
                  <span>{doctorUser.phoneNumber}</span>
                </div>
                <div className="flex items-center text-sm text-neutral-500">
                  <Mail className="h-4 w-4 mr-1" />
                  <span>{doctorUser.email}</span>
                </div>
              </div>
            </div>
            <div className="mt-6 sm:mt-0 sm:ml-auto">
              <Button onClick={handleBookAppointment} className="w-full sm:w-auto">
                <Calendar className="mr-2 h-4 w-4" />
                Reservar cita
              </Button>
              <p className="mt-2 text-sm text-center text-neutral-500">
                {formatCurrency(doctor.basePrice)} por consulta
              </p>
            </div>
          </div>
        </div>
        
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="p-6">
          <TabsList className="mb-6">
            <TabsTrigger value="about">
              <User className="h-4 w-4 mr-2" />
              Sobre el médico
            </TabsTrigger>
            <TabsTrigger value="schedule">
              <Clock className="h-4 w-4 mr-2" />
              Horarios
            </TabsTrigger>
            <TabsTrigger value="reviews">
              <Star className="h-4 w-4 mr-2" />
              Reseñas ({reviews.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Biografía</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{doctor.bio}</p>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Educación</CardTitle>
                </CardHeader>
                <CardContent className="flex items-start">
                  <School className="h-5 w-5 text-primary-500 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium">{doctor.education}</p>
                    <p className="text-sm text-neutral-500">Medicina General</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Experiencia</CardTitle>
                </CardHeader>
                <CardContent className="flex items-start">
                  <Briefcase className="h-5 w-5 text-primary-500 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium">{doctor.experience} años de experiencia</p>
                    <p className="text-sm text-neutral-500">Hospital Universitario La Paz</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Especialidades</CardTitle>
                </CardHeader>
                <CardContent className="flex items-start">
                  <Award className="h-5 w-5 text-primary-500 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium">{specialty?.name || "Medicina General"}</p>
                    <p className="text-sm text-neutral-500">{specialty?.description || "Atención médica básica y preventiva"}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Licencia</CardTitle>
                </CardHeader>
                <CardContent className="flex items-start">
                  <FileText className="h-5 w-5 text-primary-500 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium">Nº de licencia: {doctor.licenseNumber}</p>
                    <p className="text-sm text-neutral-500">Colegio Oficial de Médicos de Madrid</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>Horario de consultas</CardTitle>
                <CardDescription>
                  Estos son los horarios disponibles para reservar tu cita
                </CardDescription>
              </CardHeader>
              <CardContent>
                {availability && availability.length > 0 ? (
                  <div className="space-y-4">
                    {availability.map((slot) => (
                      <div key={slot.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                        <div className="font-medium">{getDayOfWeek(slot.dayOfWeek)}</div>
                        <div>{slot.startTime} - {slot.endTime}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div className="font-medium">Lunes a Viernes</div>
                      <div>09:00 - 17:00</div>
                    </div>
                    <div className="flex items-center justify-between border-b pb-3">
                      <div className="font-medium">Sábado</div>
                      <div>10:00 - 13:00</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Domingo</div>
                      <div className="text-neutral-500">Cerrado</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Reseñas de pacientes</CardTitle>
                <CardDescription>
                  Lo que opinan los pacientes sobre {doctorUser.firstName} {doctorUser.lastName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-0">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <img 
                              className="h-10 w-10 rounded-full"
                              src={review.reviewer?.profilePicture || `https://ui-avatars.com/api/?name=${review.reviewer?.firstName || 'U'}+${review.reviewer?.lastName || 'N'}&background=0D8ABC&color=fff`}
                              alt={review.reviewer?.firstName || 'Usuario'}
                            />
                          </div>
                          <div className="ml-3">
                            <div className="flex items-center">
                              <h4 className="text-sm font-medium">
                                {review.reviewer?.firstName || 'Usuario'} {review.reviewer?.lastName || ''}
                              </h4>
                              <span className="mx-2 text-neutral-300">•</span>
                              <span className="text-xs text-neutral-500">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center mt-1">
                              <RatingDisplay rating={review.rating} size="sm" />
                            </div>
                            <div className="mt-2 text-sm text-neutral-700">
                              {review.comment || "Excelente servicio, muy recomendable."}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-neutral-500">
                    Aún no hay reseñas para este médico
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
