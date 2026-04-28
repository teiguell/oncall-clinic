-- =============================================
-- OnCall Clinic — Round 18-C — clinic doctor invitations
-- Migration 035
-- =============================================
-- Director's brief specified `033_clinic_doctor_invites.sql` but 033
-- was used for live doctor position; renumbered to 035.
--
-- Allows a clinic to invite a doctor by email even when the doctor
-- is NOT yet registered on OnCall. Flow:
--   1. Clinic owner posts /api/clinic/doctors/invite with email
--   2. We INSERT clinic_doctor_invites { token, doctor_email, ... }
--   3. Email magic-link to the doctor: /doctor/onboarding?inviteToken=<UUID>
--   4. Doctor onboards. /api/doctor/onboarding-complete reads the
--      query param + cookie, looks up the invite, and INSERTs a
--      clinic_doctors row linking them. Invite is marked 'accepted'.
--
-- Token expires in 14 days (clinic_doctor_invites.expires_at).
-- A cron sweeper can flip status='expired' but the validation logic
-- always re-checks expires_at, so the column is best-effort.

CREATE TABLE IF NOT EXISTS clinic_doctor_invites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  doctor_email TEXT NOT NULL,
  doctor_name TEXT,
  invite_token UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'expired', 'rejected')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '14 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_clinic_invites_email
  ON clinic_doctor_invites(doctor_email);
CREATE INDEX IF NOT EXISTS idx_clinic_invites_token
  ON clinic_doctor_invites(invite_token);
CREATE INDEX IF NOT EXISTS idx_clinic_invites_clinic
  ON clinic_doctor_invites(clinic_id, status);

ALTER TABLE clinic_doctor_invites ENABLE ROW LEVEL SECURITY;

-- Clinic owners read + write their own invites.
DROP POLICY IF EXISTS "clinic_invites_owner" ON clinic_doctor_invites;
CREATE POLICY "clinic_invites_owner" ON clinic_doctor_invites
  FOR ALL
  TO authenticated
  USING (clinic_id IN (SELECT id FROM clinics WHERE user_id = auth.uid()))
  WITH CHECK (clinic_id IN (SELECT id FROM clinics WHERE user_id = auth.uid()));

-- Service role full access (anonymous register/onboarding flows).
DROP POLICY IF EXISTS "clinic_invites_service_role" ON clinic_doctor_invites;
CREATE POLICY "clinic_invites_service_role" ON clinic_doctor_invites
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

COMMENT ON TABLE clinic_doctor_invites IS
  'Round 18-C — invite tokens for unregistered doctors. Clinic owner
   issues the invite; doctor onboards via /doctor/onboarding?inviteToken=
   and the completion route creates the clinic_doctors link.';
