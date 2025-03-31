/**
 * Interfaces para testing
 */

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  userType: 'patient' | 'doctor' | 'admin';
}

export interface TestFixtures {
  patientUser: User;
  doctorUser: User;
  adminUser: User;
}

// Credenciales predefinidas para usuarios ya existentes
export const EXISTING_USERS = {
  patient: {
    email: 'patient@example.com',
    password: 'password123'
  },
  doctor: {
    email: 'doctor@example.com',
    password: 'password123'
  },
  admin: {
    email: 'admin@oncall.clinic',
    password: 'admin123'
  },
  verifiedDoctor: {
    email: 'verified.doctor@example.com',
    password: 'password123'
  }
};