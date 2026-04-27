-- =============================================
-- OnCall Clinic — Round 14 follow-up — eta_sms_sent_at strict idempotency
-- Migration 023
-- =============================================
-- Round 14-C trigger #3 (POST /api/doctor/eta-update) fires the
-- "tu médico llega en ~10 min" SMS when the doctor's location stream
-- reports etaMin <= 10. Soft idempotency was provided by the 60-s
-- rate limit on notifications_log, but a chatty location stream that
-- hovers around 10 min can still race past the rate-limit window
-- (e.g. minute 11 → minute 9 → minute 11 → minute 9 within 70 s).
--
-- This column gives strict "exactly once when crossing the threshold"
-- semantics: the route sets eta_sms_sent_at = NOW() after a successful
-- send, and short-circuits all subsequent calls for that consultation.
-- Cleared (NULL) on consultation reset / new visit, but in practice
-- consultations are append-only so the column simply stays set.

ALTER TABLE consultations
  ADD COLUMN IF NOT EXISTS eta_sms_sent_at TIMESTAMPTZ;

COMMENT ON COLUMN consultations.eta_sms_sent_at IS
  'Round 14 follow-up — set when the patient "doctor arriving in ~10 min"
   SMS has fired for this consultation. Used by /api/doctor/eta-update
   to short-circuit duplicate sends (strict once-per-consultation
   idempotency, vs the 60-s soft rate limit on notifications_log).';
