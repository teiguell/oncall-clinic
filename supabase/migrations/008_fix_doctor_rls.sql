-- =============================================
-- OnCall Clinic - Fix Doctor Profiles RLS
-- Migration 008
-- =============================================

-- Drop overly permissive policy
DROP POLICY IF EXISTS "Public read doctor profiles" ON doctor_profiles;

-- Verified doctors: basic info visible to everyone
CREATE POLICY "Public read doctor basic info" ON doctor_profiles
  FOR SELECT USING (
    verification_status = 'verified'
  );

-- Doctors can see their own full profile (including Stripe, RC, RETA data)
CREATE POLICY "Doctors read own full profile" ON doctor_profiles
  FOR SELECT USING (user_id = auth.uid());

-- Admins can read all profiles
CREATE POLICY "Admin read all profiles" ON doctor_profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Public view exposing only safe fields (no Stripe, RC details, personal documents)
CREATE OR REPLACE VIEW public_doctors AS
SELECT
  dp.id,
  p.full_name,
  p.avatar_url,
  dp.specialty,
  dp.rating,
  dp.total_reviews,
  dp.languages,
  dp.years_experience,
  dp.verification_status,
  dp.bio
FROM doctor_profiles dp
JOIN profiles p ON p.id = dp.user_id
WHERE dp.verification_status = 'verified';
