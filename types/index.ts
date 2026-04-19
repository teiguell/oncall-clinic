// =============================================
// OnCall Clinic - Type Definitions
// =============================================

export type UserRole = 'patient' | 'doctor' | 'admin'

export type ConsultationStatus =
  | 'pending'        // Paciente solicitó, buscando médico
  | 'accepted'       // Médico aceptó
  | 'in_progress'    // Médico en camino
  | 'arrived'        // Médico llegó
  | 'completed'      // Consulta completada
  | 'cancelled'      // Cancelada

export type DoctorVerificationStatus =
  | 'pending'
  | 'verified'
  | 'rejected'
  | 'suspended'

export type ConsultationType = 'urgent' | 'scheduled'

export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed'

// ---- Database Types ----

export interface Profile {
  id: string
  email: string
  full_name: string
  phone: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface DoctorProfile {
  id: string
  user_id: string
  license_number: string          // Número de colegiación
  specialty: string
  bio: string | null
  address: string | null
  city: string
  verification_status: DoctorVerificationStatus
  is_available: boolean           // Toggle online/offline
  current_lat: number | null
  current_lng: number | null
  rating: number
  total_reviews: number
  commission_rate: number         // Porcentaje que cobra la plataforma (ej: 0.15)
  stripe_account_id: string | null
  stripe_onboarded: boolean
  documents: DoctorDocument[]
  created_at: string
  updated_at: string
  // Joined
  profile?: Profile
}

export interface DoctorDocument {
  id: string
  doctor_id: string
  type: 'license' | 'id_card' | 'insurance' | 'other'
  url: string
  name: string
  verified: boolean
  uploaded_at: string
}

export interface Consultation {
  id: string
  patient_id: string
  doctor_id: string | null
  type: ConsultationType
  status: ConsultationStatus
  service_type: ServiceType
  symptoms: string
  notes: string | null
  address: string
  lat: number
  lng: number
  scheduled_at: string | null     // Para citas programadas
  accepted_at: string | null
  started_at: string | null
  completed_at: string | null
  cancelled_at: string | null
  cancellation_reason: string | null
  price: number | null            // en céntimos / centavos
  commission: number | null
  doctor_amount: number | null
  payout_status: PayoutStatus | null
  payout_at: string | null
  rating: number | null
  review: string | null
  created_at: string
  // Joined
  patient?: Profile
  doctor?: DoctorProfile & { profile: Profile }
}

export type ServiceType =
  | 'general_medicine'
  | 'pediatrics'
  | 'physio'
  | 'nursing'

export interface ServiceOption {
  value: ServiceType
  label: string
  icon: string
  description: string
  basePrice: number  // en euros
  active: boolean
  comingSoon?: boolean
}

export const SERVICES: ServiceOption[] = [
  { value: 'general_medicine', label: 'Medicina General', icon: '🩺', description: 'Consulta médica general a domicilio', basePrice: 150, active: true },
  { value: 'pediatrics',       label: 'Pediatría',        icon: '👶', description: 'Atención médica para niños',         basePrice: 150, active: false, comingSoon: true },
  { value: 'physio',           label: 'Fisioterapia',     icon: '🦵', description: 'Fisioterapia a domicilio',           basePrice: 150, active: false, comingSoon: true },
  { value: 'nursing',          label: 'Enfermería',       icon: '💉', description: 'Servicios de enfermería',            basePrice: 150, active: false, comingSoon: true },
]

export interface StatusHistoryEntry {
  id: string
  consultation_id: string
  status: ConsultationStatus
  note: string | null
  created_at: string
}

export interface Payout {
  id: string
  doctor_id: string
  consultation_id: string
  amount: number
  currency: string
  status: PayoutStatus
  stripe_transfer_id: string | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  body: string
  type: 'consultation_request' | 'consultation_accepted' | 'doctor_arrived' | 'consultation_completed' | 'payout' | 'verification'
  read: boolean
  data: Record<string, unknown>
  created_at: string
}

// ---- API Response Types ----

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
}

// ---- Map Types ----

export interface MapLocation {
  lat: number
  lng: number
  address?: string
}

export interface DoctorMarker extends MapLocation {
  doctorId: string
  name: string
  specialty: string
  rating: number
  isAvailable: boolean
}
