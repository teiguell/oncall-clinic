import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

interface GoogleMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    position: { lat: number; lng: number };
    title?: string;
    icon?: string;
  }>;
  height?: string;
  width?: string;
  onMapClick?: (event: google.maps.MapMouseEvent) => void;
}

// Extend window interface to handle the callback
declare global {
  interface Window {
    initMap: () => void;
  }
}

export default function GoogleMap({
  center = { lat: 40.4167, lng: -3.7037 }, // Default to Madrid
  zoom = 13,
  markers = [],
  height = "500px",
  width = "100%",
  onMapClick,
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [mapMarkers, setMapMarkers] = useState<google.maps.Marker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    const initMap = async () => {
      try {
        // Load Google Maps API
        const loader = new Loader({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
          version: "weekly",
          libraries: ["places"]
        });

        // Initialize Google Maps API
        await loader.load();
        
        if (!mapRef.current) return;
        
        // Create map instance
        const map = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          mapId: "ONCALL_MAP",
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });
        
        // Add click handler if provided
        if (onMapClick) {
          map.addListener("click", onMapClick);
        }
        
        setMapInstance(map);
        setIsLoaded(true);
      } catch (err) {
        console.error("Error loading Google Maps:", err);
        setError("Failed to load map. Please try again later.");
      }
    };

    if (!isLoaded && !error) {
      initMap();
    }
    
    return () => {
      // Cleanup markers when component unmounts
      mapMarkers.forEach(marker => marker.setMap(null));
    };
  }, [center, zoom, onMapClick, isLoaded, error]);

  // Update markers when they change
  useEffect(() => {
    if (!mapInstance || !isLoaded) return;

    // Clear existing markers
    mapMarkers.forEach(marker => marker.setMap(null));
    const newMarkers: google.maps.Marker[] = [];

    // Add new markers
    markers.forEach(markerData => {
      const marker = new google.maps.Marker({
        position: markerData.position,
        map: mapInstance,
        title: markerData.title,
        icon: markerData.icon,
      });

      newMarkers.push(marker);
    });

    setMapMarkers(newMarkers);
  }, [markers, mapInstance, isLoaded]);

  // Update center when it changes
  useEffect(() => {
    if (!mapInstance || !isLoaded) return;
    mapInstance.setCenter(center);
  }, [center, mapInstance, isLoaded]);

  return (
    <div style={{ position: "relative", height, width }}>
      {error && (
        <div 
          style={{ 
            position: "absolute", 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            backgroundColor: "#f0f0f0",
            zIndex: 10,
            padding: "1rem",
            textAlign: "center" 
          }}
        >
          <div>
            <p>{error}</p>
            <button 
              onClick={() => {
                setError(null);
                setIsLoaded(false);
              }}
              style={{
                marginTop: "0.5rem",
                padding: "0.5rem 1rem",
                backgroundColor: "#0070f3",
                color: "white",
                border: "none",
                borderRadius: "0.25rem",
                cursor: "pointer"
              }}
            >
              Retry
            </button>
          </div>
        </div>
      )}
      <div
        ref={mapRef}
        style={{ height: "100%", width: "100%" }}
        data-testid="google-map"
      />
    </div>
  );
}