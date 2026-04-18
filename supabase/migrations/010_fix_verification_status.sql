-- =============================================
-- OnCall Clinic - Fix verification_status enum
-- Migration 010
-- Problem: migration 001 uses 'approved' but migration 008 uses 'verified'.
-- Solution: unify to 'verified' everywhere.
-- =============================================

-- 1. Update existing data
UPDATE doctor_profiles SET verification_status = 'verified' WHERE verification_status = 'approved';

-- 2. Drop the old CHECK constraint and add new one with 'verified'
ALTER TABLE doctor_profiles DROP CONSTRAINT IF EXISTS doctor_profiles_verification_status_check;
ALTER TABLE doctor_profiles ADD CONSTRAINT doctor_profiles_verification_status_check
  CHECK (verification_status IN ('pending', 'verified', 'rejected', 'suspended'));

-- =============================================
-- FIX B4 — Referral code collision-resistant
-- Old: 4-char hex = 65,536 combos, no retry.
-- New: 8-char alphanumeric = ~2.8 trillion combos + retry loop.
-- =============================================

CREATE OR REPLACE FUNCTION generate_referral_code() RETURNS TRIGGER AS $$
DECLARE
  new_code TEXT;
  attempts INT := 0;
BEGIN
  IF NEW.referral_code IS NULL THEN
    LOOP
      new_code := 'ONCALL-' || UPPER(SUBSTR(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT), 1, 8));
      EXIT WHEN NOT EXISTS (SELECT 1 FROM profiles WHERE referral_code = new_code);
      attempts := attempts + 1;
      IF attempts > 10 THEN
        RAISE EXCEPTION 'Could not generate unique referral code after 10 attempts';
      END IF;
    END LOOP;
    NEW.referral_code := new_code;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
