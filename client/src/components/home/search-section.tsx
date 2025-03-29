import { useState, FormEvent } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Specialty } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { getCurrentPosition, geocodeAddress } from "@/lib/location";
import { Search, MapPin } from "lucide-react";

export default function SearchSection() {
  const [, navigate] = useLocation();
  const [specialty, setSpecialty] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Fetch specialties from API
  const { data: specialties = [] } = useQuery<Specialty[]>({
    queryKey: ['/api/specialties'],
  });

  const handleRequestLocation = async () => {
    setIsGettingLocation(true);
    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      
      // For demo: Just show coordinates instead of actual geocoding
      setLocation(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
    } catch (error) {
      console.error("Error getting location:", error);
      setLocation("");
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Prepare search params
    const searchParams = new URLSearchParams();
    
    if (specialty) {
      searchParams.append("specialty", specialty);
    }
    
    if (date) {
      searchParams.append("date", date);
    }
    
    if (location) {
      // If location is entered, try to geocode it to get coordinates
      try {
        const coords = await geocodeAddress(location);
        searchParams.append("latitude", coords.latitude.toString());
        searchParams.append("longitude", coords.longitude.toString());
        searchParams.append("location", location);
      } catch (error) {
        console.error("Error geocoding address:", error);
        searchParams.append("location", location);
      }
    }
    
    // Navigate to search results page with query parameters
    navigate(`/doctors?${searchParams.toString()}`);
  };

  return (
    <div className="bg-primary-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary-500 font-semibold tracking-wide uppercase">Encuentra tu médico</h2>
          <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Atención médica a un clic de distancia
          </p>
          <p className="mt-4 max-w-2xl text-xl text-neutral-500 lg:mx-auto">
            Busca médicos disponibles en tu zona por especialidad y disponibilidad
          </p>
        </div>

        <div className="mt-10 bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label htmlFor="specialty" className="block text-sm font-medium text-neutral-700">Especialidad</label>
                <Select value={specialty} onValueChange={setSpecialty}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Todas las especialidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas las especialidades</SelectItem>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty.id} value={specialty.id.toString()}>
                        {specialty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-neutral-700">Ubicación</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <Input 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Tu dirección o código postal"
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    className="ml-2"
                    onClick={handleRequestLocation}
                    disabled={isGettingLocation}
                  >
                    <MapPin size={18} />
                  </Button>
                </div>
              </div>
              
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-neutral-700">Fecha</label>
                <Input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-center">
              <Button type="submit" className="inline-flex items-center px-6 py-3">
                <Search className="mr-2 h-4 w-4" />
                Buscar médicos disponibles
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
