import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { IS_SANDBOX, ALLOWED_AREA_BOUNDS } from "@/lib/sandbox";

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

// Sandbox Map Component (used when IS_SANDBOX is true)
function SandboxMap({
  center = ALLOWED_AREA_BOUNDS.center,
  markers = [],
  height = "500px",
  width = "100%",
  onMapClick,
}: GoogleMapProps) {
  const [selectedPoint, setSelectedPoint] = useState<{ x: number, y: number } | null>(null);
  
  // Handle canvas click to simulate map clicks
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onMapClick) return;
    
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate relative position (0-1)
    const relX = x / canvas.width;
    const relY = y / canvas.height;
    
    // Convert to lat/lng within the sandbox bounds
    const latRange = ALLOWED_AREA_BOUNDS.northeast.lat - ALLOWED_AREA_BOUNDS.southwest.lat;
    const lngRange = ALLOWED_AREA_BOUNDS.northeast.lng - ALLOWED_AREA_BOUNDS.southwest.lng;
    
    const lat = ALLOWED_AREA_BOUNDS.southwest.lat + (1 - relY) * latRange;
    const lng = ALLOWED_AREA_BOUNDS.southwest.lng + relX * lngRange;
    
    setSelectedPoint({ x, y });
    
    // Create a simulated map event
    const mockEvent = {
      latLng: {
        lat: () => lat,
        lng: () => lng
      },
      // Add other required properties for google.maps.MapMouseEvent
    } as google.maps.MapMouseEvent;
    
    onMapClick(mockEvent);
  };
  
  useEffect(() => {
    // Draw the sandbox map on the canvas
    const canvas = document.getElementById('sandbox-map') as HTMLCanvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background (simplified map style)
    ctx.fillStyle = '#e4f2f7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    ctx.strokeStyle = '#c9e6f0';
    ctx.lineWidth = 1;
    
    // Vertical grid lines
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let i = 0; i < canvas.height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }
    
    // Draw markers
    markers.forEach(marker => {
      // Convert lat/lng to canvas coordinates
      const latRange = ALLOWED_AREA_BOUNDS.northeast.lat - ALLOWED_AREA_BOUNDS.southwest.lat;
      const lngRange = ALLOWED_AREA_BOUNDS.northeast.lng - ALLOWED_AREA_BOUNDS.southwest.lng;
      
      const relY = 1 - (marker.position.lat - ALLOWED_AREA_BOUNDS.southwest.lat) / latRange;
      const relX = (marker.position.lng - ALLOWED_AREA_BOUNDS.southwest.lng) / lngRange;
      
      const x = relX * canvas.width;
      const y = relY * canvas.height;
      
      // Draw marker pin
      ctx.fillStyle = '#1976d2';
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw pin shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.arc(x + 1, y + 1, 6, 0, 2 * Math.PI);
      ctx.fill();
    });
    
    // Draw selected point if any
    if (selectedPoint) {
      ctx.fillStyle = '#ff4081';
      ctx.beginPath();
      ctx.arc(selectedPoint.x, selectedPoint.y, 8, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // Draw center marker
    const latRange = ALLOWED_AREA_BOUNDS.northeast.lat - ALLOWED_AREA_BOUNDS.southwest.lat;
    const lngRange = ALLOWED_AREA_BOUNDS.northeast.lng - ALLOWED_AREA_BOUNDS.southwest.lng;
    
    const relY = 1 - (center.lat - ALLOWED_AREA_BOUNDS.southwest.lat) / latRange;
    const relX = (center.lng - ALLOWED_AREA_BOUNDS.southwest.lng) / lngRange;
    
    const centerX = relX * canvas.width;
    const centerY = relY * canvas.height;
    
    ctx.fillStyle = '#d32f2f';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
    ctx.fill();
    
  }, [center, markers, selectedPoint]);
  
  return (
    <div style={{ position: "relative", height, width }}>
      <div className="absolute top-0 left-0 right-0 bg-amber-100 text-amber-800 text-sm p-2 text-center rounded-t-md z-10">
        {t('sandbox.mapNotice')}
      </div>
      <canvas 
        id="sandbox-map" 
        width="800" 
        height="600"
        onClick={handleCanvasClick}
        style={{ 
          height: "100%", 
          width: "100%",
          borderRadius: "0 0 0.375rem 0.375rem",
          cursor: "pointer"
        }}
      />
    </div>
  );
}

export default function GoogleMap({
  center = { lat: 38.9086, lng: 1.4350 }, // Default to Ibiza ciudad
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

  // Return sandbox map if in sandbox mode
  if (IS_SANDBOX) {
    return (
      <SandboxMap 
        center={center}
        markers={markers}
        height={height}
        width={width}
        onMapClick={onMapClick}
      />
    );
  }

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
        setError(t('error.mapLoadFailed'));
      }
    };

    if (!isLoaded && !error) {
      initMap();
    }
    
    return () => {
      // Cleanup markers when component unmounts
      mapMarkers.forEach(marker => marker.setMap(null));
    };
  }, [center, zoom, onMapClick, isLoaded, error, t]);

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
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 rounded-md z-10 p-4 text-center">
          <div>
            <p className="text-red-600 mb-2">{error}</p>
            <button 
              onClick={() => {
                setError(null);
                setIsLoaded(false);
              }}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              {t('common.retry')}
            </button>
          </div>
        </div>
      )}
      <div
        ref={mapRef}
        style={{ height: "100%", width: "100%" }}
        data-testid="google-map"
        className="rounded-md"
      />
    </div>
  );
}