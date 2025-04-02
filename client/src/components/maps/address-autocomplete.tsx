import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPinIcon, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { IS_SANDBOX, ALLOWED_AREA_BOUNDS, isWithinAllowedArea } from "@/lib/sandbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AddressAutocompleteProps {
  onAddressSelect: (
    address: string,
    location: { lat: number; lng: number },
    placeDetails: google.maps.places.PlaceResult
  ) => void;
  defaultValue?: string;
  label?: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

export default function AddressAutocomplete({
  onAddressSelect,
  defaultValue = "",
  label,
  required = false,
  className = "",
  placeholder = ""
}: AddressAutocompleteProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [value, setValue] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!IS_SANDBOX) {
      const initAutocomplete = async () => {
        try {
          const loader = new Loader({
            apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
            version: "weekly",
            libraries: ["places"]
          });

          await loader.load();

          if (!inputRef.current) return;

          const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
            bounds: ALLOWED_AREA_BOUNDS,
            strictBounds: true,
            fields: ["address_components", "formatted_address", "geometry", "name"],
            types: ["address"]
          });

          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (!place.geometry?.location) return;

            const location = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            };

            if (!isWithinAllowedArea(location)) {
              toast({
                title: t('error.locationOutOfBounds'),
                description: t('error.locationMustBeInIbiza'),
                variant: "destructive"
              });
              return;
            }

            setValue(place.formatted_address || "");
            onAddressSelect(place.formatted_address || "", location, place);
          });

          autocompleteRef.current = autocomplete;
        } catch (error) {
          console.error("Error loading Google Maps:", error);
        }
      };

      initAutocomplete();
    }
  }, [onAddressSelect, t, toast]);

  const handleGeolocation = () => {
    setIsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          if (!isWithinAllowedArea(location)) {
            toast({
              title: t('error.locationOutOfBounds'),
              description: t('error.locationMustBeInIbiza'),
              variant: "destructive"
            });
            setIsLoading(false);
            return;
          }

          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.lat},${location.lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
            );
            const data = await response.json();

            if (data.results[0]) {
              const address = data.results[0].formatted_address;
              setValue(address);
              onAddressSelect(address, location, data.results[0]);
            }
          } catch (error) {
            console.error("Error reverse geocoding:", error);
          }
          setIsLoading(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast({
            title: t('error.locationAccess'),
            description: t('error.enableLocationAccess'),
            variant: "destructive"
          });
          setIsLoading(false);
        }
      );
    }
  };

  return (
    <div className={className}>
      {label && (
        <Label htmlFor="address-input" className="mb-2 block">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      <div className="relative">
        <Input
          id="address-input"
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder || t('common.enterAddress')}
          className="pr-20"
          required={required}
        />
        <Button 
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2"
          onClick={handleGeolocation}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapPinIcon className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}