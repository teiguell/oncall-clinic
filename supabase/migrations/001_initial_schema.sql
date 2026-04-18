-- =============================================
-- OnCall Clinic - Database Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For geospatial queries

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- DOCTOR PROFILES TABLE
-- =============================================
CREATE TABLE doctor_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  license_number TEXT UNIQUE NOT NULL,      -- Número de colegiación
  specialty TEXT NOT NULL,
  bio TEXT,
  address TEXT,
  city TEXT NOT NULL DEFAULT 'Madrid',
  verification_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'approved', 'rejected', 'suspended')),
  is_available BOOLEAN DEFAULT FALSE,
  current_lat DOUBLE PRECISION,
  current_lng DOUBLE PRECISION,
  rating DECIMAL(3,2) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  commission_rate DECIMAL(4,2) DEFAULT 0.15,
  stripe_account_id TEXT,
  stripe_onboarded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- DOCTOR DOCUMENTS TABLE
-- =============================================
CREATE TABLE doctor_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  doctor_id UUID REFERENCES doctor_profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('license', 'id_card', 'insurance', 'other')),
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CONSULTATIONS TABLE
-- =============================================
CREATE TABLE consultations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES profiles(id) NOT NULL,
  doctor_id UUID REFERENCES doctor_profiles(id),
  type TEXT NOT NULL CHECK (type IN ('urgent', 'scheduled')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'in_progress', 'arrived', 'completed', 'cancelled')),
  service_type TEXT NOT NULL,
  symptoms TEXT NOT NULL,
  notes TEXT,
  address TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  scheduled_at TIMESTAMPTZ,               -- Para citas programadas
  accepted_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  price INTEGER,                           -- En céntimos
  commission INTEGER,                      -- En céntimos (plataforma)
  doctor_amount INTEGER,                   -- En céntimos (médico)
  payout_status TEXT CHECK (payout_status IN ('pending', 'processing', 'completed', 'failed')),
  payout_at TIMESTAMPTZ,
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CONSULTATION STATUS HISTORY
-- =============================================
CREATE TABLE consultation_status_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PAYOUTS TABLE
-- =============================================
CREATE TABLE payouts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  doctor_id UUID REFERENCES doctor_profiles(id) NOT NULL,
  consultation_id UUID REFERENCES consultations(id) NOT NULL,
  amount INTEGER NOT NULL,                 -- En céntimos
  currency TEXT DEFAULT 'eur',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  stripe_transfer_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_consultations_patient ON consultations(patient_id);
CREATE INDEX idx_consultations_doctor ON consultations(doctor_id);
CREATE INDEX idx_consultations_status ON consultations(status);
CREATE INDEX idx_consultations_created ON consultations(created_at DESC);
CREATE INDEX idx_doctor_profiles_available ON doctor_profiles(is_available);
CREATE INDEX idx_doctor_profiles_verification ON doctor_profiles(verification_status);
CREATE INDEX idx_notifications_user ON notifications(user_id, read);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read any profile, only update their own
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Doctor profiles: public read, doctors manage their own
CREATE POLICY "doctor_profiles_select" ON doctor_profiles FOR SELECT USING (true);
CREATE POLICY "doctor_profiles_insert" ON doctor_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "doctor_profiles_update" ON doctor_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Documents: doctors see their own
CREATE POLICY "doctor_docs_select" ON doctor_documents FOR SELECT
  USING (doctor_id IN (SELECT id FROM doctor_profiles WHERE user_id = auth.uid()));
CREATE POLICY "doctor_docs_insert" ON doctor_documents FOR INSERT
  WITH CHECK (doctor_id IN (SELECT id FROM doctor_profiles WHERE user_id = auth.uid()));

-- Consultations: patients see their own, doctors see assigned ones
CREATE POLICY "consultations_patient_select" ON consultations FOR SELECT
  USING (patient_id = auth.uid() OR
         doctor_id IN (SELECT id FROM doctor_profiles WHERE user_id = auth.uid()));
CREATE POLICY "consultations_patient_insert" ON consultations FOR INSERT
  WITH CHECK (patient_id = auth.uid());
CREATE POLICY "consultations_update" ON consultations FOR UPDATE
  USING (patient_id = auth.uid() OR
         doctor_id IN (SELECT id FROM doctor_profiles WHERE user_id = auth.uid()));

-- Notifications: users see their own
CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- Payouts: doctors see their own
CREATE POLICY "payouts_select" ON payouts FOR SELECT
  USING (doctor_id IN (SELECT id FROM doctor_profiles WHERE user_id = auth.uid()));

-- =============================================
-- ADMIN BYPASS POLICIES (using service role)
-- =============================================
-- Service role bypasses RLS automatically

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_doctor_profiles_updated_at BEFORE UPDATE ON doctor_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON consultations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-track consultation status changes
CREATE OR REPLACE FUNCTION track_consultation_status()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO consultation_status_history (consultation_id, status)
    VALUES (NEW.id, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER consultation_status_tracker AFTER UPDATE ON consultations
  FOR EACH ROW EXECUTE FUNCTION track_consultation_status();

-- Function to find nearest available doctors
CREATE OR REPLACE FUNCTION find_nearest_doctors(
  patient_lat DOUBLE PRECISION,
  patient_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 50,
  specialty_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  doctor_id UUID,
  user_id UUID,
  full_name TEXT,
  specialty TEXT,
  rating DECIMAL,
  distance_km DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dp.id as doctor_id,
    dp.user_id,
    p.full_name,
    dp.specialty,
    dp.rating,
    (
      6371 * acos(
        cos(radians(patient_lat)) * cos(radians(dp.current_lat)) *
        cos(radians(dp.current_lng) - radians(patient_lng)) +
        sin(radians(patient_lat)) * sin(radians(dp.current_lat))
      )
    ) as distance_km
  FROM doctor_profiles dp
  JOIN profiles p ON p.id = dp.user_id
  WHERE dp.is_available = TRUE
    AND dp.verification_status = 'approved'
    AND dp.current_lat IS NOT NULL
    AND dp.current_lng IS NOT NULL
    AND (specialty_filter IS NULL OR dp.specialty = specialty_filter)
  HAVING (
    6371 * acos(
      cos(radians(patient_lat)) * cos(radians(dp.current_lat)) *
      cos(radians(dp.current_lng) - radians(patient_lng)) +
      sin(radians(patient_lat)) * sin(radians(dp.current_lat))
    )
  ) <= radius_km
  ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- REALTIME SUBSCRIPTIONS
-- Enable realtime for tracking
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE consultations;
ALTER PUBLICATION supabase_realtime ADD TABLE doctor_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
