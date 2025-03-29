import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { StarIcon, LocateIcon, FilterIcon, SearchIcon } from "lucide-react";
import GoogleMap from "@/components/maps/google-map";
import AddressAutocomplete from "@/components/maps/address-autocomplete";
import { useToast } from "@/hooks/use-toast";

interface DoctorSearchProps {}

export default function DoctorSearch({}: DoctorSearchProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [mapMarkers, setMapMarkers] = useState<Array<{ position: { lat: number; lng: number }; title: string }>>([]);
  const [distance, setDistance] = useState<number>(10); // km
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data: specialties = [] } = useQuery({
    queryKey: ["/api/specialties"],
    refetchOnWindowFocus: false,
  });

  const { data: doctors = [], isLoading } = useQuery({
    queryKey: ["/api/doctors", currentLocation, distance, selectedSpecialty],
    queryFn: async () => {
      if (!currentLocation) return [];
      
      const searchParams = new URLSearchParams({
        lat: currentLocation.lat.toString(),
        lng: currentLocation.lng.toString(),
        distance: distance.toString(),
        ...(selectedSpecialty !== "all" && { specialty: selectedSpecialty }),
        verified: "true"
      });
      
      const response = await fetch(`/api/doctors?${searchParams}`);
      if (!response.ok) {
        throw new Error("Failed to fetch doctors");
      }
      return response.json();
    },
    enabled: !!currentLocation,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(location);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default to Madrid if we can't get user location
          setCurrentLocation({ lat: 40.4167, lng: -3.7037 });
        }
      );
    } else {
      // Default to Madrid if geolocation is not supported
      setCurrentLocation({ lat: 40.4167, lng: -3.7037 });
    }
  }, []);

  useEffect(() => {
    if (doctors && doctors.length > 0) {
      // Create markers for doctors
      const markers = doctors.map((doctor) => ({
        position: { 
          lat: doctor.location?.latitude || 0, 
          lng: doctor.location?.longitude || 0 
        },
        title: `Dr. ${doctor.firstName} ${doctor.lastName}`,
      }));
      
      setMapMarkers(markers);
    } else {
      setMapMarkers([]);
    }
  }, [doctors]);

  const handleAddressSelect = (
    address: string, 
    location: { lat: number; lng: number },
    _placeDetails: google.maps.places.PlaceResult
  ) => {
    setSelectedAddress(address);
    setCurrentLocation(location);
    
    toast({
      title: t('doctorSearch.locationUpdated'),
      description: address,
    });
  };

  const toggleFilters = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-4">{t('doctorSearch.title')}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {currentLocation ? (
              <GoogleMap 
                center={currentLocation} 
                markers={mapMarkers}
                height="400px"
              />
            ) : (
              <div className="h-[400px] flex items-center justify-center bg-neutral-100 rounded-md">
                <p>{t('common.loading')}</p>
              </div>
            )}
          </div>
          
          <div className="flex flex-col space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <AddressAutocomplete
                    label={t('doctorSearch.yourLocation')}
                    placeholder={t('doctorSearch.enterAddress')}
                    onAddressSelect={handleAddressSelect}
                  />
                </div>
                
                <div className="mb-4">
                  <Button 
                    variant="outline" 
                    className="flex items-center w-full"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            const location = {
                              lat: position.coords.latitude,
                              lng: position.coords.longitude,
                            };
                            setCurrentLocation(location);
                            setSelectedAddress(t('doctorSearch.currentLocation'));
                          },
                          (error) => {
                            console.error("Error getting location:", error);
                            toast({
                              title: t('error.locationAccess'),
                              description: t('error.enableLocationAccess'),
                              variant: "destructive",
                            });
                          }
                        );
                      }
                    }}
                  >
                    <LocateIcon className="h-4 w-4 mr-2" />
                    {t('doctorSearch.useCurrentLocation')}
                  </Button>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full mb-4"
                  onClick={toggleFilters}
                >
                  <FilterIcon className="h-4 w-4 mr-2" />
                  {isFilterOpen ? t('doctorSearch.hideFilters') : t('doctorSearch.showFilters')}
                </Button>
                
                {isFilterOpen && (
                  <div className="space-y-4">
                    <div>
                      <Label>{t('doctorSearch.filters.specialty')}</Label>
                      <Select 
                        value={selectedSpecialty} 
                        onValueChange={setSelectedSpecialty}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('doctorSearch.filters.anySpecialty')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('doctorSearch.filters.anySpecialty')}</SelectItem>
                          {specialties.map((specialty) => (
                            <SelectItem key={specialty.id} value={String(specialty.id)}>
                              {specialty.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>{t('doctorSearch.filters.distance')}: {distance} km</Label>
                      <Slider
                        value={[distance]}
                        min={1}
                        max={50}
                        step={1}
                        onValueChange={(value) => setDistance(value[0])}
                        className="mt-2"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-neutral-900">
            {doctors.length > 0 
              ? t('doctorSearch.results.found', { count: doctors.length }) 
              : t('doctorSearch.results.noResults')}
          </h2>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <p>{t('common.loading')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <Card key={doctor.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">
                          Dr. {doctor.firstName} {doctor.lastName}
                        </h3>
                        <p className="text-sm text-neutral-500">
                          {specialties.find(s => s.id === doctor.specialtyId)?.name}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium">{doctor.averageRating || "N/A"}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex items-center text-sm text-neutral-500 mb-1">
                        <span>{t('doctorProfile.experience')}: {doctor.experience} {t('doctorProfile.years', { count: doctor.experience })}</span>
                      </div>
                      
                      {doctor.location && (
                        <div className="flex items-center text-sm text-neutral-500 mb-1">
                          <span>{doctor.location.city}, {doctor.location.postalCode}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm mb-3">
                        <Badge variant={doctor.isAvailable ? "success" : "secondary"} className="mr-2">
                          {doctor.isAvailable ? t('doctorSearch.available') : t('doctorSearch.unavailable')}
                        </Badge>
                        <Badge>€{doctor.basePrice}/h</Badge>
                      </div>
                      
                      <p className="text-sm text-neutral-600 line-clamp-3">
                        {doctor.bio}
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="p-4 bg-neutral-50">
                    <div className="flex justify-between">
                      <Link href={`/doctors/${doctor.id}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          {t('doctorProfile.viewMore')}
                        </Button>
                      </Link>
                      <div className="w-4"></div>
                      <Link href={`/appointment-booking/${doctor.id}`}>
                        <Button size="sm" className="w-full">
                          {t('doctorProfile.bookAppointment')}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {!isLoading && doctors.length === 0 && (
          <div className="text-center py-12">
            <SearchIcon className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-neutral-900 mb-2">{t('doctorSearch.results.noResults')}</h3>
            <p className="text-neutral-500 max-w-md mx-auto">{t('doctorSearch.results.tryAgain')}</p>
          </div>
        )}
      </div>
    </div>
  );
}