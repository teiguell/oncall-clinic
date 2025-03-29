import { useState } from "react";
import { Link } from "wouter";
import { DoctorProfile } from "@/types";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/payment";
import { 
  Star, 
  StarHalf, 
  School, 
  Briefcase, 
  Euro, 
  Clock
} from "lucide-react";

interface DoctorCardProps {
  doctor: DoctorProfile;
}

export default function DoctorCard({ doctor }: DoctorCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const { user, specialty } = doctor;
  
  if (!user) {
    return null;
  }

  // Format rating stars
  const renderRatingStars = () => {
    const fullStars = Math.floor(doctor.averageRating);
    const hasHalfStar = doctor.averageRating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="h-4 w-4 text-yellow-400 fill-current" />
        ))}
        {hasHalfStar && <StarHalf key="half" className="h-4 w-4 text-yellow-400 fill-current" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="h-4 w-4 text-neutral-300" />
        ))}
      </div>
    );
  };

  // Get a random availability time for demonstration
  const getRandomAvailability = () => {
    const hours = [10, 12, 14, 16, 18];
    const randomHour = hours[Math.floor(Math.random() * hours.length)];
    return `${randomHour}:00`;
  };

  return (
    <div 
      className={`bg-white overflow-hidden shadow rounded-lg border ${
        isHovered ? "border-primary-200 shadow-md" : "border-neutral-200"
      } transition-all duration-200`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <img 
              className="h-16 w-16 rounded-full"
              src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=0D8ABC&color=fff`}
              alt={`${user.firstName} ${user.lastName}`}
            />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium leading-6 text-neutral-900">
              {user.userType === 'doctor' ? 'Dr.' : 'Dra.'} {user.firstName} {user.lastName}
            </h3>
            <p className="text-sm text-neutral-500">{specialty?.name || "Medicina General"}</p>
            <div className="flex items-center mt-1">
              <div className="flex items-center">
                {renderRatingStars()}
              </div>
              <span className="text-sm text-neutral-500 ml-1">{doctor.averageRating.toFixed(1)}</span>
              <span className="text-sm text-neutral-500 ml-1">
                ({Math.floor(Math.random() * 120 + 20)} reseñas)
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center text-sm text-neutral-500 mb-1">
            <School className="h-4 w-4 mr-1" />
            <span>{doctor.education}</span>
          </div>
          <div className="flex items-center text-sm text-neutral-500 mb-1">
            <Briefcase className="h-4 w-4 mr-1" />
            <span>{doctor.experience} años de experiencia</span>
          </div>
          <div className="flex items-center text-sm text-neutral-500">
            <Euro className="h-4 w-4 mr-1" />
            <span>{formatCurrency(doctor.basePrice)} por consulta</span>
          </div>
        </div>

        <div className="mt-4 text-sm text-neutral-700">
          <p className="line-clamp-3">{doctor.bio}</p>
        </div>

        <div className="mt-5 border-t border-neutral-200 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-neutral-500">
              <Clock className="h-4 w-4 mr-1" />
              <span>Disponible hoy a partir de las {getRandomAvailability()}</span>
            </div>
            <Link href={`/doctors/${doctor.id}`}>
              <Button size="sm">
                Ver perfil
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
