// Configuración del modo SANDBOX para el frontend
// Este archivo contiene todas las constantes y funciones relacionadas con el modo de pruebas

// Bandera para activar/desactivar el modo SANDBOX (desde las variables de entorno)
export const IS_SANDBOX = import.meta.env.VITE_IS_SANDBOX === 'true';

// Coordenadas del área restringida para pruebas (Ibiza)
export const ALLOWED_AREA_BOUNDS = {
  northeast: { lat: 39.1300, lng: 1.6350 }, // Noreste de Ibiza
  southwest: { lat: 38.8000, lng: 1.3500 }, // Suroeste de Ibiza
  center: { lat: 38.9086, lng: 1.4350 }     // Centro (Ibiza ciudad)
};

// Mensajes específicos del modo SANDBOX
export const SANDBOX_MESSAGES = {
  SANDBOX_MODE: "Versión de pruebas sin validez asistencial",
  AREA_RESTRICTED: "Actualmente solo ofrecemos servicios en la isla de Ibiza.",
  SPECIALTY_RESTRICTED: "Actualmente solo ofrecemos servicios de Medicina General.",
  PAYMENT_SIMULATED: "El pago se simula en el modo SANDBOX"
};

/**
 * Verifica si unas coordenadas están dentro del área permitida para pruebas
 */
export function isWithinAllowedArea(lat: number, lng: number): boolean {
  return (
    lat >= ALLOWED_AREA_BOUNDS.southwest.lat &&
    lat <= ALLOWED_AREA_BOUNDS.northeast.lat &&
    lng >= ALLOWED_AREA_BOUNDS.southwest.lng &&
    lng <= ALLOWED_AREA_BOUNDS.northeast.lng
  );
}

/**
 * Calcula la distancia entre dos coordenadas en kilómetros (fórmula de Haversine)
 */
export function calculateDistance(
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = degreesToRadians(lat2 - lat1);
  const dLng = degreesToRadians(lng2 - lng1);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance;
}

function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI/180);
}

/**
 * Simula el movimiento del médico desde su ubicación actual hacia las coordenadas del paciente
 */
export function simulateDoctorMovement(
  doctorLat: number, 
  doctorLng: number, 
  patientLat: number, 
  patientLng: number, 
  progress: number // 0 a 1
): { lat: number, lng: number } {
  // Interpolación lineal entre la posición del médico y la del paciente
  const lat = doctorLat + (patientLat - doctorLat) * progress;
  const lng = doctorLng + (patientLng - doctorLng) * progress;
  
  return { lat, lng };
}