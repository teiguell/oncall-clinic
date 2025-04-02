import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { DoctorProfile, SearchFilters, Specialty } from "@/types";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Slider, 
  SliderTrack, 
  SliderThumb, 
  SliderRange 
} from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { geocodeAddress } from "@/lib/location";
import DoctorCard from "./doctor-card";
import { formatCurrency } from "@/lib/payment";
import { 
  Search, 
  MapPin, 
  Calendar, 
  Filter, 
  Star, 
  Euro, 
  Loader2 
} from "lucide-react";
import { cn } from "@/lib/utils";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from 'react-places-autocomplete';


export default function DoctorSearch() {
  const search = useSearch();
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(search);

  // Initialize filters from URL
  const [filters, setFilters] = useState<SearchFilters>({
    specialty: 1, // Default to General Medicine (ID 1)
    location: searchParams.get('location') || "",
    date: searchParams.get('date') || new Date().toISOString().split('T')[0],
    latitude: searchParams.get('latitude') ? parseFloat(searchParams.get('latitude') as string) : undefined,
    longitude: searchParams.get('longitude') ? parseFloat(searchParams.get('longitude') as string) : undefined
  });

  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  const handleAddressChange = (address: string) => {
    setAddress(address);
  };

  const handleAddressSelect = async (address: string) => {
    const results = await geocodeByAddress(address);
    const latLng = await getLatLng(results[0]);
    setCoordinates(latLng);
    setFilters({...filters, location: address, latitude: latLng.lat, longitude: latLng.lng});
  };

  // Additional filter states
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(150);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>("rating");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch doctors based on filters.  Specialty is hardcoded to General Medicine.
  const { data: doctors = [], isLoading } = useQuery<DoctorProfile[]>({
    queryKey: ['/api/doctors', filters],
    enabled: true,
    queryFn: async () => {
      if (!filters.latitude || !filters.longitude) return [];
      const searchParams = new URLSearchParams({
        lat: filters.latitude.toString(),
        lng: filters.longitude.toString(),
        specialty: "1", // Force General Medicine only
        verified: "true"
      });
      const response = await fetch(`/api/doctors?${searchParams}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    }
  });


  // Filter and sort doctors
  const filteredDoctors = doctors?.filter(doctor => {
    if (!doctor) return false; //Handle potential null values.
    if (minPrice > 0 && doctor.basePrice < minPrice * 100) return false;
    if (maxPrice < 150 && doctor.basePrice > maxPrice * 100) return false;
    if (minRating > 0 && doctor.averageRating < minRating) return false;
    return doctor.specialtyId === 1; 
  }) || [];

  const sortedDoctors = [...filteredDoctors].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.averageRating - a.averageRating;
      case "price_low":
        return a.basePrice - b.basePrice;
      case "price_high":
        return b.basePrice - a.basePrice;
      case "experience":
        return b.experience - a.experience;
      default:
        return 0;
    }
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.location) {
      params.append("location", filters.location);
    }

    if (filters.date) {
      params.append("date", filters.date);
    }

    if (filters.latitude && filters.longitude) {
      params.append("latitude", filters.latitude.toString());
      params.append("longitude", filters.longitude.toString());
    }

    const newSearch = params.toString();
    if (newSearch) {
      navigate(`/doctors?${newSearch}`);
    } else {
      navigate('/doctors');
    }
  }, [filters, navigate]);

  // Handle filter changes
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      location: e.target.value
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      date: e.target.value
    });
  };

  const handleSearch = async () => {
    //If location is provided via autocomplete, coordinates are already set.
    if(!coordinates && filters.location){
      try {
        const { latitude, longitude } = await geocodeAddress(filters.location);
        setFilters({
          ...filters,
          latitude,
          longitude
        });
      } catch (error) {
        console.error("Error geocoding address:", error);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Mobile filter button */}
        <div className="md:hidden mb-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter className="mr-2 h-4 w-4" />
            {isFilterOpen ? "Ocultar filtros" : "Mostrar filtros"}
          </Button>
        </div>

        {/* Filters sidebar */}
        <div className={cn(
          "w-full md:w-1/4 transition-all",
          isFilterOpen ? "block" : "hidden md:block"
        )}>
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Ubicación
                </label>
                <PlacesAutocomplete
                  value={address}
                  onChange={handleAddressChange}
                  onSelect={handleAddressSelect}
                >
                  {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                    <div>
                      <Input {...getInputProps({ placeholder: 'Ciudad o código postal' })} />
                      <div>
                        {loading ? <div>Cargando...</div> : null}
                        {suggestions.map((suggestion) => {
                          const style = {
                            backgroundColor: suggestion.isHighlighted ? '#ddd' : '#fff',
                            cursor: 'pointer',
                            padding: '10px',
                            borderBottom: '1px solid #ccc',
                          };
                          return (
                            <div key={suggestion.placeId} {...getSuggestionItemProps(suggestion, { style })}>
                              {suggestion.description}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </PlacesAutocomplete>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Fecha
                </label>
                <Input
                  type="date"
                  value={filters.date || ""}
                  onChange={handleDateChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Precio (€)
                </label>
                <div className="flex justify-between mb-2 text-sm">
                  <span>{minPrice}€</span>
                  <span>{maxPrice}€</span>
                </div>
                <Slider
                  defaultValue={[minPrice, maxPrice]}
                  min={0}
                  max={150}
                  step={5}
                  onValueChange={(values) => {
                    setMinPrice(values[0]);
                    setMaxPrice(values[1]);
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Valoración mínima
                </label>
                <Select
                  value={minRating.toString()}
                  onValueChange={(value) => setMinRating(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Cualquier valoración" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Cualquier valoración</SelectItem>
                    <SelectItem value="3">3+ estrellas</SelectItem>
                    <SelectItem value="4">4+ estrellas</SelectItem>
                    <SelectItem value="4.5">4.5+ estrellas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Ordenar por
                </label>
                <Select
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-2" />
                        Mejor valorados
                      </div>
                    </SelectItem>
                    <SelectItem value="price_low">
                      <div className="flex items-center">
                        <Euro className="h-4 w-4 mr-2" />
                        Precio: menor a mayor
                      </div>
                    </SelectItem>
                    <SelectItem value="price_high">
                      <div className="flex items-center">
                        <Euro className="h-4 w-4 mr-2" />
                        Precio: mayor a menor
                      </div>
                    </SelectItem>
                    <SelectItem value="experience">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Más experiencia
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full"
                onClick={handleSearch}
              >
                <Search className="mr-2 h-4 w-4" />
                Aplicar filtros
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Search results */}
        <div className="w-full md:w-3/4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-neutral-900">
              Médicos de Medicina General
            </h1>
            <p className="text-neutral-500">
              {filters.location ? `Cerca de ${filters.location}` : "En tu zona"} 
              {filters.date ? ` · ${new Date(filters.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}` : ""}
            </p>
            <div className="mt-2 text-sm text-neutral-500">
              {!isLoading && `${sortedDoctors.length} médicos encontrados`}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
              <span className="ml-2 text-neutral-500">Buscando médicos...</span>
            </div>
          ) : sortedDoctors.length > 0 ? (
            <div className="space-y-6">
              {sortedDoctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="flex flex-col items-center">
                <Search className="h-12 w-12 text-neutral-300 mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 mb-2">No se encontraron médicos</h3>
                <p className="text-neutral-500 mb-6">
                  Intenta modificar tus filtros de búsqueda para encontrar más resultados
                </p>
                <Button onClick={() => {
                  setFilters({
                    specialty: 1, //default to general medicine
                    location: "",
                    date: new Date().toISOString().split('T')[0]
                  });
                  setMinPrice(0);
                  setMaxPrice(150);
                  setMinRating(0);
                }}>
                  Reiniciar filtros
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}