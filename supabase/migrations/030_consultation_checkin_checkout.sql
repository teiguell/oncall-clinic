-- =============================================
-- OnCall Clinic — Round 17-B — physical check-in/check-out
-- Migration 030
-- =============================================
-- Adds the columns needed to track when a doctor physically arrives
-- at the patient's address and when they finish the visit:
--
--   checkin_at, checkin_lat, checkin_lng  — set by /api/consultations/[id]/checkin
--   checkout_at                            — set by /api/consultations/[id]/checkout
--
-- Status flow:
--   pending → accepted → in_progress (on check-in) → completed (on check-out)
--
-- check-in fires a Twilio SMS to the patient ("Tu médico ha llegado")
-- with template_key='patient.doctor_arrived' (template added in R17-B
-- alongside this migration in messages/{es,en}.json).
--
-- check-out delegates to /api/consultations/[id]/complete (R18A) to
-- run the Path A/B payment routing AND triggers a review-token SMS to
-- the patient (R17-C handles the review submit page).

ALTER TABLE consultations
  ADD COLUMN IF NOT EXISTS checkin_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS checkin_lat NUMERIC(10, 7),
  ADD COLUMN IF NOT EXISTS checkin_lng NUMERIC(10, 7),
  ADD COLUMN IF NOT EXISTS checkout_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_consultations_checkin
  ON consultations(checkin_at)
  WHERE checkin_at IS NOT NULL;

COMMENT ON COLUMN consultations.checkin_at IS
  'Round 17-B — set when the doctor presses "Marcar llegada" on the
   in-app check-in screen. Triggers SMS to patient + flips
   status=in_progress.';

COMMENT ON COLUMN consultations.checkin_lat IS
  'Round 17-B — doctor''s GPS lat at check-in time. Used to detect
   abuse (check-in from far from the patient address).';

COMMENT ON COLUMN consultations.checkout_at IS
  'Round 17-B — set when the doctor presses "Finalizar visita". Calls
   /api/consultations/[id]/complete (R18A) for payment routing.';
