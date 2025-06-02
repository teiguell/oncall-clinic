-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone_number TEXT,
  user_type TEXT CHECK (user_type IN ('patient', 'doctor', 'admin')) NOT NULL,
  profile_picture TEXT,
  email_verified BOOLEAN DEFAULT false,
  two_factor_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Specialties table
CREATE TABLE specialties (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Doctor profiles table
CREATE TABLE doctor_profiles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  specialty_id INTEGER REFERENCES specialties(id),
  license_number TEXT UNIQUE NOT NULL,
  education TEXT NOT NULL,
  experience INTEGER NOT NULL CHECK (experience >= 0),
  bio TEXT,
  base_price INTEGER NOT NULL CHECK (base_price > 0), -- in cents
  commission_rate DECIMAL(5,2) DEFAULT 15.00 CHECK (commission_rate >= 0 AND commission_rate <= 100),
  is_available BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  average_rating DECIMAL(3,2) DEFAULT 0.00 CHECK (average_rating >= 0 AND average_rating <= 5),
  total_reviews INTEGER DEFAULT 0,
  total_appointments INTEGER DEFAULT 0,
  
  -- Fiscal data for invoicing
  nif TEXT,
  fiscal_address TEXT,
  fiscal_city TEXT,
  fiscal_postal_code TEXT,
  fiscal_data_complete BOOLEAN DEFAULT false,
  
  -- Location data
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  service_radius INTEGER DEFAULT 50, -- km
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Patient profiles table
CREATE TABLE patient_profiles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date_of_birth DATE,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  insurance_info TEXT,
  medical_history TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  
  -- Location data
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Doctor availability table
CREATE TABLE doctor_availability (
  id SERIAL PRIMARY KEY,
  doctor_profile_id INTEGER REFERENCES doctor_profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(doctor_profile_id, day_of_week, start_time)
);

-- Appointments table
CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  tracking_code TEXT UNIQUE NOT NULL DEFAULT 'ONC-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8)),
  patient_id UUID REFERENCES users(id),
  doctor_id UUID REFERENCES users(id),
  
  -- Appointment details
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER DEFAULT 60 CHECK (duration > 0), -- minutes
  status TEXT CHECK (status IN ('pending', 'confirmed', 'en_route', 'arrived', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  reason_for_visit TEXT NOT NULL,
  
  -- Location
  patient_address TEXT NOT NULL,
  patient_city TEXT NOT NULL,
  patient_postal_code TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Pricing
  base_amount INTEGER NOT NULL CHECK (base_amount > 0), -- in cents
  travel_fee INTEGER DEFAULT 0 CHECK (travel_fee >= 0),
  total_amount INTEGER NOT NULL CHECK (total_amount > 0),
  
  -- Payment
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')) DEFAULT 'pending',
  payment_method TEXT,
  payment_transaction_id TEXT,
  
  -- Admin fields
  admin_notes TEXT,
  cancelled_reason TEXT,
  cancelled_by UUID REFERENCES users(id),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES users(id),
  reviewee_id UUID REFERENCES users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(appointment_id, reviewer_id, reviewee_id)
);

-- Invoices table (ya tienes lógica, ahora la tabla)
CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  type TEXT CHECK (type IN ('medical_service', 'platform_commission')) NOT NULL,
  
  -- Entities
  from_entity_type TEXT CHECK (from_entity_type IN ('doctor', 'platform')) NOT NULL,
  from_entity_id UUID REFERENCES users(id),
  to_entity_type TEXT CHECK (to_entity_type IN ('patient', 'doctor')) NOT NULL,
  to_entity_id UUID REFERENCES users(id),
  
  appointment_id INTEGER REFERENCES appointments(id),
  
  -- Amounts (in cents)
  amount INTEGER NOT NULL CHECK (amount > 0),
  vat_rate DECIMAL(5,2) DEFAULT 0.00,
  vat_amount INTEGER DEFAULT 0,
  total_amount INTEGER NOT NULL CHECK (total_amount > 0),
  currency TEXT DEFAULT 'EUR',
  
  description TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'sent', 'paid', 'cancelled', 'error')) DEFAULT 'pending',
  
  sent_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  appointment_id INTEGER REFERENCES appointments(id),
  invoice_id INTEGER REFERENCES invoices(id),
  
  amount INTEGER NOT NULL CHECK (amount > 0), -- in cents
  currency TEXT DEFAULT 'EUR',
  
  payment_method TEXT NOT NULL, -- 'revolut', 'stripe', 'apple_pay', etc.
  payment_provider TEXT NOT NULL,
  transaction_id TEXT UNIQUE,
  provider_payment_id TEXT,
  
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
  
  -- Revolut specific fields
  revolut_order_id TEXT,
  revolut_payment_id TEXT,
  
  -- Metadata
  metadata JSONB,
  error_message TEXT,
  
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'appointment', 'payment', 'system', etc.
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  
  -- Related entities
  appointment_id INTEGER REFERENCES appointments(id),
  payment_id INTEGER REFERENCES payments(id),
  
  -- Metadata
  data JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin settings table
CREATE TABLE admin_settings (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event log table (ya tienes la lógica)
CREATE TABLE event_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracking_code TEXT,
  user_id UUID REFERENCES users(id),
  user_role TEXT CHECK (user_role IN ('patient', 'doctor', 'admin')),
  event_type TEXT NOT NULL,
  event_payload JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default specialties
INSERT INTO specialties (name, description, icon, color) VALUES
  ('Medicina General', 'Atención médica general y diagnóstico', '🩺', '#3B82F6'),
  ('Pediatría', 'Atención médica especializada para niños', '🧸', '#10B981'),
  ('Cardiología', 'Especialista en enfermedades del corazón', '❤️', '#EF4444'),
  ('Dermatología', 'Tratamiento de enfermedades de la piel', '🧴', '#F59E0B'),
  ('Neurología', 'Especialista en sistema nervioso', '🧠', '#8B5CF6'),
  ('Ginecología', 'Salud femenina y reproductiva', '🌸', '#EC4899');

-- Insert admin settings
INSERT INTO admin_settings (key, value, description) VALUES
  ('default_commission_rate', '15.0', 'Tasa de comisión por defecto para nuevos médicos'),
  ('service_fee', '500', 'Tarifa de servicio base en céntimos'),
  ('max_service_radius', '100', 'Radio máximo de servicio en kilómetros'),
  ('appointment_cancellation_hours', '24', 'Horas mínimas para cancelar una cita'),
  ('platform_contact_email', '"support@oncallclinic.com"', 'Email de contacto de la plataforma'),
  ('maintenance_mode', 'false', 'Modo de mantenimiento de la plataforma');

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_doctor_profiles_user_id ON doctor_profiles(user_id);
CREATE INDEX idx_doctor_profiles_specialty_id ON doctor_profiles(specialty_id);
CREATE INDEX idx_doctor_profiles_is_available ON doctor_profiles(is_available);
CREATE INDEX idx_doctor_profiles_location ON doctor_profiles(latitude, longitude);
CREATE INDEX idx_patient_profiles_user_id ON patient_profiles(user_id);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_appointment_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_tracking_code ON appointments(tracking_code);
CREATE INDEX idx_reviews_appointment_id ON reviews(appointment_id);
CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX idx_invoices_appointment_id ON invoices(appointment_id);
CREATE INDEX idx_payments_appointment_id ON payments(appointment_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_event_log_tracking_code ON event_log(tracking_code);
CREATE INDEX idx_event_log_user_id ON event_log(user_id);
CREATE INDEX idx_event_log_timestamp ON event_log(timestamp);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctor_profiles_updated_at BEFORE UPDATE ON doctor_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_profiles_updated_at BEFORE UPDATE ON patient_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON admin_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
