-- =============================================
-- OnCall Clinic — Round 15 — Clinics (B2B channel)
-- Migration 025
-- =============================================
-- Adds the `clinics` table + `clinic_doctors` junction + FK columns on
-- doctor_profiles + consultations. Migration was originally specced as
-- 022 in Director's brief; renumbered to 025 because:
--   - 022 = notifications_log (Round 14-C)
--   - 023 = consultations.eta_sms_sent_at (Round 14 follow-up)
--   - 024 = find_nearest_doctors realignment
--
-- Strategic context: clinics are a third role alongside patient + doctor.
-- They're businesses (CIF, RC empresarial, Stripe Connect type='standard'
-- + business_type='company') who own multiple verified individual
-- doctors. OnCall takes 8% commission (vs 10% for individual doctors).
-- The clinic-id appears on consultations served by a clinic doctor so
-- the webhook + payouts can route the application_fee_amount correctly.
--
-- R7 compliance: clinics are responsible for their doctors' clinical
-- conduct. OnCall is still a pure technology intermediary — no clinical
-- data is captured at this layer.

-- ---------- TABLE: clinics ----------
CREATE TABLE IF NOT EXISTS clinics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name TEXT NOT NULL,
  cif TEXT NOT NULL UNIQUE,
  legal_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,

  -- Location + coverage
  address TEXT,
  city TEXT NOT NULL,
  province TEXT,
  coverage_zones TEXT[] DEFAULT '{}',
  coverage_radius_km INTEGER DEFAULT 25,

  -- Verification
  rc_insurance_verified BOOLEAN DEFAULT FALSE,
  rc_insurance_expiry DATE,
  verification_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'verified', 'rejected', 'suspended')),
  verified_at TIMESTAMPTZ,
  verified_by TEXT,

  -- Stripe Connect (type='standard' for company accounts)
  stripe_account_id TEXT,
  stripe_onboarding_complete BOOLEAN DEFAULT FALSE,

  -- Commission (8% all-in for clinics, vs 10/15% for individuals)
  commission_rate NUMERIC(4,2) NOT NULL DEFAULT 8.00,

  -- Public profile
  logo_url TEXT,
  website TEXT,
  description TEXT,
  max_doctors INTEGER DEFAULT 10,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------- TABLE: clinic_doctors (junction) ----------
CREATE TABLE IF NOT EXISTS clinic_doctors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES doctor_profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'pending')),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(clinic_id, doctor_id)
);

-- ---------- FK columns ----------
-- Optional FK on doctor_profiles for the "doctor's primary clinic"
-- (a doctor may also have multiple via clinic_doctors; this column is
-- the canonical "default clinic for booking branding").
ALTER TABLE doctor_profiles
  ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL;

-- Required for webhook routing of the application_fee_amount when a
-- consultation is served via a clinic doctor.
ALTER TABLE consultations
  ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL;

-- ---------- INDEXES ----------
CREATE INDEX IF NOT EXISTS idx_clinics_city ON clinics(city);
CREATE INDEX IF NOT EXISTS idx_clinics_verification ON clinics(verification_status);
CREATE INDEX IF NOT EXISTS idx_clinic_doctors_clinic ON clinic_doctors(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_doctors_doctor ON clinic_doctors(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_clinic
  ON doctor_profiles(clinic_id) WHERE clinic_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_consultations_clinic
  ON consultations(clinic_id) WHERE clinic_id IS NOT NULL;

-- ---------- RLS ----------
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_doctors ENABLE ROW LEVEL SECURITY;

-- Clinic owner sees + manages own data
DROP POLICY IF EXISTS "clinic_own_data" ON clinics;
CREATE POLICY "clinic_own_data" ON clinics
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Public read of verified clinics (powers the public_clinics view + any
-- patient-facing listings).
DROP POLICY IF EXISTS "verified_clinics_public_read" ON clinics;
CREATE POLICY "verified_clinics_public_read" ON clinics
  FOR SELECT
  TO anon, authenticated
  USING (verification_status = 'verified');

-- Clinic owner sees + manages own clinic_doctors rows
DROP POLICY IF EXISTS "clinic_own_doctors" ON clinic_doctors;
CREATE POLICY "clinic_own_doctors" ON clinic_doctors
  FOR ALL
  TO authenticated
  USING (clinic_id IN (SELECT id FROM clinics WHERE user_id = auth.uid()))
  WITH CHECK (clinic_id IN (SELECT id FROM clinics WHERE user_id = auth.uid()));

-- Doctor sees their own clinic memberships (read-only)
DROP POLICY IF EXISTS "doctor_sees_own_clinic" ON clinic_doctors;
CREATE POLICY "doctor_sees_own_clinic" ON clinic_doctors
  FOR SELECT
  TO authenticated
  USING (doctor_id IN (SELECT id FROM doctor_profiles WHERE user_id = auth.uid()));

-- ---------- VIEW: public_clinics ----------
-- Verified-only, aggregated stats for landing/comparison surfaces.
-- Note: dp.rating (not average_rating — column is `rating` per
-- doctor_profiles schema; Director's spec had a typo).
DROP VIEW IF EXISTS public_clinics;
CREATE VIEW public_clinics AS
SELECT
  c.id,
  c.name,
  c.city,
  c.coverage_zones,
  c.logo_url,
  c.commission_rate,
  c.description,
  COUNT(cd.id) FILTER (WHERE cd.status = 'active') AS doctor_count,
  AVG(dp.rating) FILTER (WHERE cd.status = 'active') AS avg_rating
FROM clinics c
LEFT JOIN clinic_doctors cd ON cd.clinic_id = c.id
LEFT JOIN doctor_profiles dp ON dp.id = cd.doctor_id
WHERE c.verification_status = 'verified'
GROUP BY c.id;

COMMENT ON TABLE clinics IS
  'Round 15 — B2B channel for clinics that already operate home visits.
   Clinics own multiple individual doctors via clinic_doctors. Commission
   is 8% all-in (vs 10/15% for individual doctors). RLS: own data + public
   read of verified rows.';

COMMENT ON COLUMN clinics.commission_rate IS
  'Round 15 — percentage charged on each consultation served by a clinic
   doctor. Default 8.00. Used by webhook to compute application_fee_amount
   instead of the doctor''s own rate when consultation.clinic_id IS NOT NULL.';

COMMENT ON COLUMN consultations.clinic_id IS
  'Round 15 — set when the booked doctor belongs to a verified clinic.
   Webhook reads this to route application_fee_amount via the clinic''s
   Stripe account instead of the doctor''s.';
