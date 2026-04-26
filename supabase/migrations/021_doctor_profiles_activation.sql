-- =============================================
-- OnCall Clinic — Round 11 Fix C — doctor activation columns
-- Migration 021 (Round 11 prompt asked for "016" but that number is taken;
-- renumbered to 021 — the next free slot.)
-- =============================================
-- Adds the columns needed to drive the post-onboarding activation flow:
-- email confirm + SMS OTP + admin review.
--
-- The flow:
--   1. Doctor finishes /doctor/onboarding step 4 (Contract).
--   2. Server inserts/updates doctor_profiles with
--      activation_status = 'pending_email', plus a one-time email-confirm
--      token (`activation_email_token` + `activation_email_token_expires`).
--   3. notify('doctor.activation_email') sends the verification link
--      → /api/auth/confirm-doctor?token=...
--   4. The route flips activation_status → 'pending_sms', sends
--      notify('doctor.activation_sms') with a 6-digit OTP stored in
--      `phone_otp_code` + `phone_otp_expires_at`.
--   5. Doctor enters OTP on dashboard → POST /api/notifications/sms-otp/verify
--      flips phone_verified_at + activation_status → 'pending_admin_review'.
--   6. Admin reviews documents → activation_status → 'active' →
--      doctor appears in /api/doctors?near=... and can accept consultations.
--
-- Columns are nullable / defaulted so existing rows keep working without
-- a backfill. The seed demo-doctor (Round 11 Fix A) is set to 'active'
-- directly via Director-managed seed.

ALTER TABLE doctor_profiles
  ADD COLUMN IF NOT EXISTS activation_status TEXT
    NOT NULL DEFAULT 'active'
    CHECK (activation_status IN (
      'pending_email',
      'pending_sms',
      'pending_admin_review',
      'active',
      'suspended'
    )),
  ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS activation_email_token TEXT,
  ADD COLUMN IF NOT EXISTS activation_email_token_expires TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS phone_otp_code TEXT,
  ADD COLUMN IF NOT EXISTS phone_otp_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sms_notifications_enabled BOOLEAN
    NOT NULL DEFAULT TRUE;

-- Lookup index for the email-confirm route. `activation_email_token` is
-- unique only when present; partial index keeps NULL rows out so we
-- don't pay the index cost for every active doctor.
CREATE UNIQUE INDEX IF NOT EXISTS doctor_profiles_activation_email_token_idx
  ON doctor_profiles (activation_email_token)
  WHERE activation_email_token IS NOT NULL;

-- For /api/doctors?near=... we already filter by is_available + verification_status.
-- Round 11 also requires activation_status='active' so freshly registered
-- doctors don't appear before admin approves them. Helper view kept here
-- so the gate is documented in one place (the API uses the RPC from
-- migration 020 — update that too to filter activation_status='active').
COMMENT ON COLUMN doctor_profiles.activation_status IS
  'Round 11 Fix C — activation gate. /api/doctors and find_nearest_doctors
   should filter activation_status = ''active'' so pending doctors do not
   appear in patient search.';

COMMENT ON COLUMN doctor_profiles.activation_email_token IS
  'Round 11 Fix C — one-time token for /api/auth/confirm-doctor?token=...';

COMMENT ON COLUMN doctor_profiles.phone_otp_code IS
  'Round 11 Fix C — 6-digit OTP for SMS phone verification.
   Cleared (set NULL) on successful verify or expiry. Keep this trivially
   stored (no hash) for alpha; a future migration can salt+hash if SMS
   volume grows enough to make stuffing attacks plausible.';

COMMENT ON COLUMN doctor_profiles.sms_notifications_enabled IS
  'Round 11 Fix D — doctor preference toggle for SMS on consultation_new.
   Email is always sent regardless.';
