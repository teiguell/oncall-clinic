// Common types for the application

export interface User {
  id: number;
  username: string;
  email: string;
  userType: 'patient' | 'doctor';
  firstName: string;
  lastName: string;
  phoneNumber: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  profilePicture?: string;
  createdAt: string;
}

export interface PatientProfile {
  id: number;
  userId: number;
  address: string;
  city: string;
  postalCode: string;
  dob?: string;
  insuranceInfo?: string;
  medicalHistory?: string;
}

export interface DoctorProfile {
  id: number;
  userId: number;
  specialtyId: number;
  licenseNumber: string;
  education: string;
  experience: number;
  bio: string;
  basePrice: number;
  isAvailable: boolean;
  averageRating: number;
  user?: User;
  specialty?: Specialty;
  availability?: Availability[];
  reviews?: Review[];
}

export interface Specialty {
  id: number;
  name: string;
  description?: string;
}

export interface Availability {
  id: number;
  doctorProfileId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface Location {
  id: number;
  userId: number;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentDate: string;
  duration: number;
  status: 'scheduled' | 'confirmed' | 'en_route' | 'arrived' | 'in_progress' | 'completed' | 'canceled';
  reasonForVisit: string;
  locationId: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  patient?: User;
  doctor?: User;
  location?: Location;
  payment?: Payment;
}

export interface Review {
  id: number;
  appointmentId: number;
  reviewerId: number;
  revieweeId: number;
  rating: number;
  comment?: string;
  createdAt: string;
  reviewer?: User;
}

export interface Notification {
  id: number;
  userId: number;
  type: string;
  content: string;
  read: boolean;
  createdAt: string;
  data?: {
    appointmentId?: number;
    status?: string;
    timestamp?: string;
    [key: string]: any;
  };
}

export interface Payment {
  id: number;
  appointmentId: number;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod?: string;
  transactionId?: string;
  createdAt: string;
}

export interface SearchFilters {
  specialty?: number;
  location?: string;
  date?: string;
  latitude?: number;
  longitude?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegistrationData {
  username: string;
  email: string;
  password: string;
  userType: 'patient' | 'doctor';
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface PatientRegistrationData extends RegistrationData {
  address: string;
  city: string;
  postalCode: string;
  dob?: string;
  insuranceInfo?: string;
}

export interface DoctorRegistrationData extends RegistrationData {
  specialtyId: number;
  licenseNumber: string;
  education: string;
  experience: number;
  bio: string;
  basePrice: number;
}

export interface VerificationData {
  verificationId: string;
  code: string;
  email: string; // Requerido para compatibilidad con express-session
}

export interface SessionData {
  sessionId: string;
  user: User;
}

export interface PaymentFormData {
  appointmentId: number;
  paymentMethod: string;
  cardDetails?: {
    number: string;
    name: string;
    expiry: string;
    cvc: string;
  };
}

export interface AppointmentFormData {
  doctorId: number;
  appointmentDate: string;
  duration: number;
  reasonForVisit: string;
  locationId: number;
  totalAmount: number;
}

export interface ReviewFormData {
  appointmentId: number;
  rating: number;
  comment?: string;
}

export type Status = 'idle' | 'loading' | 'success' | 'error';

export interface LoginResponse {
  message: string;
  sessionId: string;
  user: User;
}

export interface ApiError {
  message: string;
  errors?: any[];
}

export type Testimonial = {
  id: number;
  name: string;
  rating: number;
  comment: string;
  image?: string;
};

export type FAQItem = {
  id: number;
  question: string;
  answer: string;
};
