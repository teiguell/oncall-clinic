/**
 * Configuración del modo SANDBOX para pruebas alpha
 * Esta configuración permite usar un entorno controlado para pruebas.
 */

import { DoctorProfile, InsertDoctorProfile, Specialty, InsertAvailability, WeeklyAvailability } from '@shared/schema';

// Bandera principal para activar/desactivar el modo sandbox
export const IS_SANDBOX = process.env.VITE_IS_SANDBOX === 'true';

// Coordenadas del área permitida (Islas Baleares)
export const ALLOWED_AREA_BOUNDS = {
  northeast: { lat: 40.1395, lng: 4.3275 }, // Punto noreste
  southwest: { lat: 38.6424, lng: 1.1558 }, // Punto suroeste
};

// Mensajes para el usuario
export const SANDBOX_MESSAGES = {
  AREA_RESTRICTED: "Actualmente solo ofrecemos servicios en las Islas Baleares.",
  SANDBOX_MODE: "Versión de pruebas sin validez asistencial",
  SPECIALTY_RESTRICTED: "Actualmente solo ofrecemos servicios de Medicina General.",
};

// Doctor ficticio de prueba
export const TEST_DOCTOR: InsertDoctorProfile = {
  userId: 1, // El ID se asignará durante la creación
  specialtyId: 1, // Medicina General
  licenseNumber: "SANDBOX-070123456",
  education: "Universidad de Barcelona, Facultad de Medicina",
  experience: 12,
  bio: "Médico general con amplia experiencia en atención primaria. Especializado en medicina familiar y preventiva.",
  basePrice: 8000, // 80.00 en cents
  isAvailable: true,
  bankAccount: "SANDBOX_ACCOUNT",
  locationLat: 39.5696,
  locationLng: 2.6502,
  locationAddress: "Palma de Mallorca, Islas Baleares"
};

// Horario del doctor ficticio
export const TEST_DOCTOR_AVAILABILITY: WeeklyAvailability = {
  monday: [
    { start: "08:00", end: "20:00" }
  ],
  tuesday: [
    { start: "08:00", end: "20:00" }
  ],
  wednesday: [
    { start: "08:00", end: "20:00" }
  ],
  thursday: [
    { start: "08:00", end: "20:00" }
  ],
  friday: [
    { start: "08:00", end: "20:00" }
  ],
  saturday: [
    { start: "08:00", end: "20:00" }
  ],
  sunday: [
    { start: "08:00", end: "20:00" }
  ]
};

// Función para verificar si las coordenadas están dentro del área permitida
export function isWithinAllowedArea(lat: number, lng: number): boolean {
  return (
    lat >= ALLOWED_AREA_BOUNDS.southwest.lat &&
    lat <= ALLOWED_AREA_BOUNDS.northeast.lat &&
    lng >= ALLOWED_AREA_BOUNDS.southwest.lng &&
    lng <= ALLOWED_AREA_BOUNDS.northeast.lng
  );
}

// Función para calcular la distancia entre dos puntos (fórmula de Haversine)
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

// Función para simular el movimiento del médico desde su ubicación hacia la ubicación del paciente
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