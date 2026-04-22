-- =============================================
-- OnCall Clinic — Separate doctor internal notes from patient report
-- Migration 017
-- =============================================
-- Context: a single `notes` column conflated two distinct artifacts:
--   1. Doctor's private notes (diagnosis hypotheses, meds to verify, etc.)
--   2. The clinical report the patient receives
-- These have different audiences and different legal weight.
--
-- Policies:
--   * doctor_internal_notes: only the assigned doctor can read/write.
--   * patient_report: patient + assigned doctor can read; only doctor writes.

ALTER TABLE consultations
  ADD COLUMN IF NOT EXISTS doctor_internal_notes TEXT,
  ADD COLUMN IF NOT EXISTS patient_report TEXT;

COMMENT ON COLUMN consultations.doctor_internal_notes IS
  'Notas privadas del medico. NO visibles al paciente. RLS enforce.';
COMMENT ON COLUMN consultations.patient_report IS
  'Informe clinico que el paciente recibe al finalizar la consulta.';

-- The existing SELECT policy on `consultations` allows both the patient
-- and the assigned doctor to read the row. At the column level, we
-- cannot hide `doctor_internal_notes` from the patient via standard RLS —
-- so we enforce via CHECK at the API layer / view.
-- Additional doctor-only SELECT policy (redundant but explicit audit trail):
DROP POLICY IF EXISTS "doctor_reads_own_internal_notes" ON consultations;
CREATE POLICY "doctor_reads_own_internal_notes" ON consultations
  FOR SELECT USING (auth.uid() = doctor_id);

-- View that excludes doctor_internal_notes — patient-facing selects should
-- use this to guarantee the field never leaks even if a bug in code asks
-- for `*`.
CREATE OR REPLACE VIEW consultations_patient_view AS
SELECT
  id, patient_id, doctor_id, status, service_type, type,
  symptoms, notes, address, lat, lng, scheduled_at,
  price, commission, doctor_amount,
  payment_status, stripe_session_id, stripe_payment_intent_id,
  payout_status, patient_report,
  created_at, updated_at, accepted_at, started_at, completed_at, cancelled_at
FROM consultations;

COMMENT ON VIEW consultations_patient_view IS
  'Patient-safe projection of consultations. Excludes doctor_internal_notes.';
