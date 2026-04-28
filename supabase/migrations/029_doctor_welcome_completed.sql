-- =============================================
-- OnCall Clinic — Round 17-A — doctor welcome tour completion flag
-- Migration 029
-- =============================================
-- Adds doctor_profiles.welcome_completed_at — set by
-- /api/doctor/welcome-complete after a doctor finishes (or skips) the
-- 5-card welcome tour at /[locale]/doctor/welcome.
--
-- The /welcome page checks this column on render and redirects to
-- /dashboard if non-null, so returning doctors don't see the tour
-- twice. Setting it via SKIP also counts as "completed" — we only
-- care that the doctor saw the tour once.

ALTER TABLE doctor_profiles
  ADD COLUMN IF NOT EXISTS welcome_completed_at TIMESTAMPTZ;

COMMENT ON COLUMN doctor_profiles.welcome_completed_at IS
  'Round 17-A — set when the doctor finishes (or skips) the 5-card
   welcome tour. NULL = first-login redirect to /welcome. Non-null =
   straight to /dashboard.';
