/**
 * Constantes y utilidades para el modo SANDBOX
 * Este modo permite probar la aplicación sin necesidad de APIs externas
 */

// Determinar si estamos en modo SANDBOX
// 1. Si está definido como variable de entorno (establecido en Replit)
// 2. Si no, verificar si estamos en desarrollo o en una URL que indique sandbox/demo
export const IS_SANDBOX = 
  // Prioridad 1: variable de entorno explícita
  typeof import.meta.env.VITE_APP_SANDBOX !== 'undefined' 
    ? import.meta.env.VITE_APP_SANDBOX === 'true'
    // Prioridad 2: detectar por URL o entorno
    : !import.meta.env.PROD || 
      window.location.hostname.includes('replit.dev') ||
      window.location.hostname.includes('sandbox') || 
      window.location.hostname.includes('demo') ||
      window.location.search.includes('sandbox=true');

// Credenciales de Doctor de prueba predefinidas para modo SANDBOX
export const SANDBOX_DOCTOR = {
  id: 'sandbox-doctor-1',
  email: 'doctor@demo.com',
  password: 'Sandbox123!',
  name: 'Dr. Simulado Pérez',
  specialty: 'Medicina General',
  licenseNumber: 'DEMO-12345',
  profileImage: 'https://ui-avatars.com/api/?name=Dr.+Simulado&background=0D8ABC&color=fff',
  phone: '+34600000001',
  description: 'Doctor simulado para pruebas en modo SANDBOX.',
  address: 'Calle Ejemplo 123, Ibiza, 07800',
  isVerified: true,
  rating: 4.8,
  reviews: 24,
  hourlyRate: 120,
  availability: {
    monday: ['09:00-13:00', '16:00-20:00'],
    tuesday: ['09:00-13:00', '16:00-20:00'],
    wednesday: ['09:00-13:00', '16:00-20:00'],
    thursday: ['09:00-13:00', '16:00-20:00'],
    friday: ['09:00-13:00', '16:00-20:00'],
    saturday: ['10:00-14:00'],
    sunday: []
  },
  languages: ['Español', 'Inglés'],
  education: [
    { institution: 'Universidad de Barcelona', degree: 'Medicina', year: '2010' },
    { institution: 'Hospital Clínic Barcelona', degree: 'Residencia - Medicina Familiar', year: '2014' }
  ]
};

// Credenciales de paciente de prueba predefinidas para modo SANDBOX
export const SANDBOX_PATIENT = {
  id: 'sandbox-patient-1',
  email: 'paciente@demo.com',
  password: 'Sandbox123!',
  name: 'Ana Paciente',
  profileImage: 'https://ui-avatars.com/api/?name=Ana+Paciente&background=2A9D8F&color=fff',
  phone: '+34600000002',
  address: 'Avenida Prueba 456, Ibiza, 07800',
  medicalHistory: 'Sin historial para modo SANDBOX.',
  birthDate: '1985-06-15',
  gender: 'female'
};

// Credenciales de administrador de prueba predefinidas para modo SANDBOX
export const SANDBOX_ADMIN = {
  id: 'sandbox-admin-1',
  email: 'admin@demo.com',
  password: 'Sandbox123!',
  name: 'Carlos Admin',
  role: 'admin'
};

// Ubicaciones de Ibiza para pruebas en modo SANDBOX
export const SANDBOX_LOCATIONS = [
  {
    name: 'Ibiza Ciudad',
    address: 'Ibiza, 07800, Islas Baleares, España',
    latLng: { lat: 38.9067339, lng: 1.4202622 },
    placeId: 'ChIJ6UHi8_UQtRIRyJ_u59ZG77s'
  },
  {
    name: 'Santa Eulària des Riu',
    address: 'Santa Eulària des Riu, 07840, Islas Baleares, España',
    latLng: { lat: 38.9841077, lng: 1.5356388 },
    placeId: 'ChIJf6HRe-sNtRIR0Lb_x8KCY5A'
  },
  {
    name: 'Sant Antoni de Portmany',
    address: 'Sant Antoni de Portmany, 07820, Islas Baleares, España',
    latLng: { lat: 38.9796055, lng: 1.3035949 },
    placeId: 'ChIJ3b0N-UoJtRIR4NpPXd9drzw'
  },
  {
    name: 'Sant Josep de sa Talaia',
    address: 'Sant Josep de sa Talaia, 07830, Islas Baleares, España',
    latLng: { lat: 38.9206427, lng: 1.2898494 },
    placeId: 'ChIJTWKP7HUJtRIR0CksVdSkJFg'
  },
  {
    name: 'Sant Joan de Labritja',
    address: 'Sant Joan de Labritja, 07810, Islas Baleares, España',
    latLng: { lat: 39.0791232, lng: 1.4483049 },
    placeId: 'ChIJcZKRJ64MtRIRnSZ_m3mwdyA'
  },
  {
    name: 'Playa d\'en Bossa',
    address: 'Playa d\'en Bossa, 07817, Islas Baleares, España',
    latLng: { lat: 38.8834472, lng: 1.3995824 },
    placeId: 'ChIJdTmqPzsRtRIR2JaLmGX04wo'
  },
  {
    name: 'Cala Llonga',
    address: 'Cala Llonga, 07849, Islas Baleares, España',
    latLng: { lat: 38.9526669, lng: 1.5388216 },
    placeId: 'ChIJOXVCNxYOtRIRxrqTyVBB3Zk'
  },
  {
    name: 'Es Canar',
    address: 'Es Canar, 07840, Islas Baleares, España',
    latLng: { lat: 39.0004153, lng: 1.5806126 },
    placeId: 'ChIJj5_CvPgNtRIRgPfyNyMNPr0'
  },
  {
    name: 'San Carlos',
    address: 'San Carlos, 07850, Islas Baleares, España',
    latLng: { lat: 39.0268973, lng: 1.5563726 },
    placeId: 'ChIJNzhiGgQOtRIRc0TULcf0RjU'
  },
  {
    name: 'Santa Gertrudis de Fruitera',
    address: 'Santa Gertrudis de Fruitera, 07814, Islas Baleares, España',
    latLng: { lat: 39.0156825, lng: 1.4362025 },
    placeId: 'ChIJ4Y6qnucLtRIRsPpq2KpQ9nE'
  }
];

// Estado de la cita en SANDBOX
export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  EN_ROUTE = 'en_route',
  ARRIVED = 'arrived',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Mensaje de banner para modo SANDBOX
export const SANDBOX_BANNER_MESSAGE = {
  es: '🧪 Modo SANDBOX activo - Esta es una versión de prueba con datos simulados.',
  en: '🧪 SANDBOX Mode active - This is a test version with simulated data.'
};

// Límites del área de operación (Ibiza y alrededores)
export const ALLOWED_AREA_BOUNDS = {
  north: 39.15, // Límite norte (latitud)
  south: 38.7,  // Límite sur (latitud)
  east: 1.65,   // Límite este (longitud)
  west: 1.15    // Límite oeste (longitud)
};

/**
 * Verifica si una coordenada está dentro del área permitida
 * @param lat Latitud
 * @param lng Longitud
 * @returns true si está dentro del área permitida
 */
export function isWithinAllowedArea(lat: number, lng: number): boolean {
  return (
    lat <= ALLOWED_AREA_BOUNDS.north &&
    lat >= ALLOWED_AREA_BOUNDS.south &&
    lng <= ALLOWED_AREA_BOUNDS.east &&
    lng >= ALLOWED_AREA_BOUNDS.west
  );
}