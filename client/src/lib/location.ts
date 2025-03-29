import { apiRequest } from "@/lib/queryClient";
import { getStoredSession } from "@/lib/auth";
import { Location } from "@/types";

// Get user's coordinates from browser
export const getCurrentPosition = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });
  });
};

// Add a new location
export const addLocation = async (locationData: Omit<Location, 'id' | 'userId'>): Promise<Location> => {
  const sessionData = getStoredSession();
  
  if (!sessionData) {
    throw new Error("Not authenticated");
  }
  
  const response = await apiRequest("POST", "/api/locations", locationData, {
    headers: {
      Authorization: `Bearer ${sessionData.sessionId}`
    }
  });
  
  return response.json();
};

// Get all user locations
export const getUserLocations = async (): Promise<Location[]> => {
  const sessionData = getStoredSession();
  
  if (!sessionData) {
    throw new Error("Not authenticated");
  }
  
  const response = await apiRequest("GET", "/api/locations", undefined, {
    headers: {
      Authorization: `Bearer ${sessionData.sessionId}`
    }
  });
  
  return response.json();
};

// Calculate distance between two coordinates (in kilometers)
export const calculateDistance = (
  lat1: number, lon1: number, 
  lat2: number, lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Geocoding function (for a real app, you would use a service like Google Maps API)
// This is a mock implementation, in real app would call a geocoding service
export const geocodeAddress = async (address: string): Promise<{latitude: number, longitude: number}> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // For demo purposes, return random coordinates near Madrid, Spain
  const madridLat = 40.416775;
  const madridLng = -3.703790;
  
  // Add some small random offset (±0.05 degrees, roughly within 5km)
  const latOffset = (Math.random() - 0.5) * 0.1;
  const lngOffset = (Math.random() - 0.5) * 0.1;
  
  return {
    latitude: madridLat + latOffset,
    longitude: madridLng + lngOffset
  };
};

// Reverse geocoding function (coordinates to address)
// This is a mock implementation, in real app would call a geocoding service
export const reverseGeocode = async (
  latitude: number, 
  longitude: number
): Promise<{address: string, city: string, state: string, postalCode: string}> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // For demo purposes, return a mock address
  return {
    address: `Calle ${Math.floor(Math.random() * 100) + 1}`,
    city: "Madrid",
    state: "Madrid",
    postalCode: `280${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`
  };
};
