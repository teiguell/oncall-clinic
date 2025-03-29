import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPinIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

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
  placeholder = "Enter an address..."
}: AddressAutocompleteProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [value, setValue] = useState(defaultValue);

  // Load Google Maps API and initialize autocomplete
  useEffect(() => {
    const initAutocomplete = async () => {
      try {
        // Load Google Maps API with places library
        const loader = new Loader({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
          version: "weekly",
          libraries: ["places"]
        });

        await loader.load();
        
        if (!inputRef.current) return;
        
        // Initialize places autocomplete
        const autocompleteInstance = new google.maps.places.Autocomplete(inputRef.current, {
          fields: ["address_components", "formatted_address", "geometry", "name"],
          types: ["address"],
        });
        
        // Add place_changed event listener
        autocompleteInstance.addListener("place_changed", () => {
          const place = autocompleteInstance.getPlace();
          
          if (!place.geometry || !place.geometry.location) {
            console.error("Place selected with no geometry");
            return;
          }
          
          const address = place.formatted_address || place.name || "";
          const location = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          };
          
          // Update the input value
          setValue(address);
          
          // Call the callback
          onAddressSelect(address, location, place);
        });
        
        setAutocomplete(autocompleteInstance);
        setIsLoaded(true);
      } catch (err) {
        console.error("Error initializing address autocomplete:", err);
        setError("Failed to load address search. Please enter address manually.");
      }
    };

    if (!isLoaded && !error) {
      initAutocomplete();
    }
  }, [isLoaded, error, onAddressSelect]);

  return (
    <div className={`relative ${className}`}>
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
          className="pr-10"
          required={required}
        />
        <MapPinIcon 
          className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" 
        />
      </div>
      
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}