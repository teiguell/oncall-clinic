-- =============================================
-- OnCall Clinic — Round 17-C — public reviews + internal notes
-- Migration 031
-- =============================================
-- Two new tables:
--
--   consultation_reviews         — patient-submitted public reviews
--                                  (rating 1-5 + optional comment, link
--                                  in checkout SMS)
--   consultation_internal_notes  — doctor-side ops note attached to a
--                                  visit. R7 vigente: operativa NO
--                                  clínica. Examples allowed:
--                                    - "Atendido sin incidencias"
--                                    - "Dirección incorrecta, llegué 15 min tarde"
--                                    - "Recomendé farmacia 24 h"
--                                  R7 forbidden:
--                                    - síntomas, diagnóstico, prescripción
--                                  This is NOT a clinical history surface.
--
-- review_token: a column on consultation_reviews used to authenticate
-- the patient's review submission via /[locale]/review/[token] without
-- requiring login (the token is sent only via SMS so possession ≈ auth).
-- The token is unique per consultation; the table also stores
-- consultation_id directly so we can dual-use either as the URL
-- parameter (R17-B fired SMS uses consultation_id; this migration's
-- reviews route accepts both for backward compat).

-- consultation_reviews already exists (migration 006_reviews.sql).
-- This migration ALTERs the existing table to add R17-C-specific
-- columns: review_token (for SMS unauth submission) + submitted_at
-- (replaces created_at as the customer-facing timestamp).
ALTER TABLE consultation_reviews
  ADD COLUMN IF NOT EXISTS review_token UUID UNIQUE DEFAULT uuid_generate_v4(),
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ DEFAULT NOW();

UPDATE consultation_reviews
SET submitted_at = created_at
WHERE submitted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_consultation_reviews_doctor
  ON consultation_reviews(doctor_id, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_consultation_reviews_token
  ON consultation_reviews(review_token);

COMMENT ON COLUMN consultation_reviews.review_token IS
  'Round 17-C — token sent in checkout SMS for unauth review submission.';

-- Internal notes (doctor-only)
CREATE TABLE IF NOT EXISTS consultation_internal_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctor_profiles(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_internal_notes_doctor
  ON consultation_internal_notes(doctor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_internal_notes_consultation
  ON consultation_internal_notes(consultation_id);

ALTER TABLE consultation_internal_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "internal_notes_select_doctor_own" ON consultation_internal_notes;
CREATE POLICY "internal_notes_select_doctor_own" ON consultation_internal_notes
  FOR SELECT
  TO authenticated
  USING (doctor_id IN (SELECT id FROM doctor_profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "internal_notes_insert_doctor" ON consultation_internal_notes;
CREATE POLICY "internal_notes_insert_doctor" ON consultation_internal_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (doctor_id IN (SELECT id FROM doctor_profiles WHERE user_id = auth.uid()));

COMMENT ON TABLE consultation_reviews IS
  'Round 17-C — patient public reviews submitted via /review/[token] after
   checkout. Rating 1-5 + optional comment. R7 compliant: operational
   feedback only, no clinical content.';

COMMENT ON TABLE consultation_internal_notes IS
  'Round 17-C — doctor operational notes per visit. R7 vigente: NO
   síntomas, NO diagnóstico, NO prescripción. Solo operativa
   (incidencias logísticas, observaciones de proceso).';
