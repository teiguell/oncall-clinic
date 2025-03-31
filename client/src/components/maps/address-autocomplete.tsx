import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPinIcon, CheckIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { IS_SANDBOX, ALLOWED_AREA_BOUNDS, isWithinAllowedArea, SANDBOX_MESSAGES } from "@/lib/sandbox";
import { Button } from "@/components/ui/button";

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

// Simulated place result for sandbox mode
const createMockPlaceResult = (address: string, location: { lat: number; lng: number }): google.maps.places.PlaceResult => {
  return {
    address_components: [],
    formatted_address: address,
    geometry: {
      location: {
        lat: () => location.lat,
        lng: () => location.lng
      }
    },
    name: address,
    place_id: "sandbox-place-" + Math.random().toString(36).substring(2, 15)
  } as google.maps.places.PlaceResult;
};

// Sandbox predefined locations
const SANDBOX_LOCATIONS = [
  {
    address: "Hospital Universitario Son Espases, Palma de Mallorca",
    location: { lat: 39.5947, lng: 2.6371 }
  },
  {
    address: "Plaza de España, Palma de Mallorca",
    location: { lat: 39.5751, lng: 2.6534 }
  },
  {
    address: "Playa de Palma, Palma de Mallorca",
    location: { lat: 39.5151, lng: 2.7452 }
  },
  {
    address: "Puerto de Alcúdia, Mallorca",
    location: { lat: 39.8382, lng: 3.1176 }
  },
];

function SandboxAddressAutocomplete({
  onAddressSelect,
  defaultValue = "",
  label,
  required = false,
  className = "",
  placeholder = "Enter an address..."
}: AddressAutocompleteProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState(defaultValue);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  const handleAddressSelect = (address: string, location: { lat: number; lng: number }) => {
    setValue(address);
    
    const mockPlaceResult = createMockPlaceResult(address, location);
    onAddressSelect(address, location, mockPlaceResult);
    
    setShowSuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle custom address input
  const handleCustomAddressSubmit = () => {
    if (!value.trim()) return;
    
    // Generate a random location within the allowed area
    const latRange = ALLOWED_AREA_BOUNDS.northeast.lat - ALLOWED_AREA_BOUNDS.southwest.lat;
    const lngRange = ALLOWED_AREA_BOUNDS.northeast.lng - ALLOWED_AREA_BOUNDS.southwest.lng;
    
    const location = {
      lat: ALLOWED_AREA_BOUNDS.southwest.lat + Math.random() * latRange,
      lng: ALLOWED_AREA_BOUNDS.southwest.lng + Math.random() * lngRange
    };
    
    handleAddressSelect(value, location);
  };

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
          id="address-input-sandbox"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => {
            setInputFocused(true);
            setShowSuggestions(true);
          }}
          placeholder={placeholder || t('common.enterAddress')}
          className="pr-10"
          required={required}
        />
        <MapPinIcon 
          className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" 
        />
      </div>

      <div className="mt-2 text-amber-600 text-sm flex items-center bg-amber-50 p-2 rounded">
        <CheckIcon className="h-4 w-4 mr-1 flex-shrink-0" /> 
        {t('sandbox.addressNotice')}
      </div>
      
      {inputFocused && !showSuggestions && (
        <Button 
          type="button" 
          variant="secondary" 
          size="sm" 
          className="mt-2 w-full"
          onClick={handleCustomAddressSubmit}
        >
          {t('common.confirm')}
        </Button>
      )}
      
      {showSuggestions && (
        <div 
          ref={suggestionRef}
          className="absolute z-50 mt-1 w-full bg-white shadow-lg rounded-md border border-neutral-200 max-h-60 overflow-auto"
        >
          <div className="p-2 text-sm text-neutral-500 border-b">
            {t('sandbox.selectAddress')}
          </div>
          {SANDBOX_LOCATIONS.map((location, index) => (
            <div 
              key={index}
              className="p-2 hover:bg-neutral-100 cursor-pointer"
              onClick={() => handleAddressSelect(location.address, location.location)}
            >
              <div className="flex items-start">
                <MapPinIcon className="h-4 w-4 mr-2 mt-0.5 text-neutral-500" />
                <span>{location.address}</span>
              </div>
            </div>
          ))}
          <div 
            className="p-2 hover:bg-neutral-100 cursor-pointer border-t"
            onClick={handleCustomAddressSubmit}
          >
            <div className="flex items-start">
              <CheckIcon className="h-4 w-4 mr-2 mt-0.5 text-neutral-500" />
              <span>{t('sandbox.useCustomAddress')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
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

  // Return sandbox address autocomplete if in sandbox mode
  if (IS_SANDBOX) {
    return (
      <SandboxAddressAutocomplete
        onAddressSelect={onAddressSelect}
        defaultValue={defaultValue}
        label={label}
        required={required}
        className={className}
        placeholder={placeholder}
      />
    );
  }

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
        setError(t('error.addressSearchFailed'));
      }
    };

    if (!isLoaded && !error) {
      initAutocomplete();
    }
  }, [isLoaded, error, onAddressSelect, t]);

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