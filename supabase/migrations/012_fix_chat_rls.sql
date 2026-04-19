-- =============================================
-- OnCall Clinic - Sprint 3 QA fixes
-- Migration 012
-- =============================================
-- Covers: B5 (chat RLS), B4 (referral UNIQUE INDEX), B6 (payout audit),
-- P16 (reviews FK + refunds ON DELETE CASCADE)

-- =============================================
-- B5: Restrict chat UPDATE to read_at only
-- =============================================
-- The old policy allowed updating ANY column (including content).
-- Lock it down so only read_at can change; all other fields must match
-- the existing row (effectively immutable).
DROP POLICY IF EXISTS "Participants mark read" ON consultation_messages;

CREATE POLICY "Participants mark read" ON consultation_messages FOR UPDATE
  USING (
    consultation_id IN (
      SELECT id FROM consultations
      WHERE patient_id = auth.uid()
         OR doctor_id IN (SELECT id FROM doctor_profiles WHERE user_id = auth.uid())
    )
  )
  WITH CHECK (
    content       = (SELECT content       FROM consultation_messages m2 WHERE m2.id = consultation_messages.id)
    AND sender_id       = (SELECT sender_id       FROM consultation_messages m2 WHERE m2.id = consultation_messages.id)
    AND sender_role     = (SELECT sender_role     FROM consultation_messages m2 WHERE m2.id = consultation_messages.id)
    AND consultation_id = (SELECT consultation_id FROM consultation_messages m2 WHERE m2.id = consultation_messages.id)
    AND created_at      = (SELECT created_at      FROM consultation_messages m2 WHERE m2.id = consultation_messages.id)
  );

-- =============================================
-- B4 reinforcement: UNIQUE INDEX on referral_code
-- =============================================
-- Migration 010 added a retry loop, but the DB constraint was implicit via
-- the UNIQUE column modifier in 007. This partial index makes it explicit
-- and excludes NULLs (in case any rows predate the trigger).
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_referral_code_unique
  ON profiles(referral_code) WHERE referral_code IS NOT NULL;

-- =============================================
-- B6: Payout audit logging
-- =============================================
CREATE TABLE IF NOT EXISTS payout_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payout_id UUID,
  consultation_id UUID REFERENCES consultations(id),
  doctor_id UUID,
  action TEXT NOT NULL CHECK (action IN ('initiated', 'completed', 'failed', 'retried')),
  amount INTEGER,
  currency TEXT DEFAULT 'eur',
  stripe_transfer_id TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payout_audit_consultation ON payout_audit_log(consultation_id);
CREATE INDEX IF NOT EXISTS idx_payout_audit_doctor ON payout_audit_log(doctor_id);
ALTER TABLE payout_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can read the audit log
DROP POLICY IF EXISTS "Admin read payout audit" ON payout_audit_log;
CREATE POLICY "Admin read payout audit" ON payout_audit_log FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- P16 QA Fix: refunds.consultation_id ON DELETE CASCADE
-- =============================================
-- Migration 002 already has this, but be idempotent for clean re-runs.
ALTER TABLE refunds DROP CONSTRAINT IF EXISTS refunds_consultation_id_fkey;
ALTER TABLE refunds ADD CONSTRAINT refunds_consultation_id_fkey
  FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON DELETE CASCADE;

-- Note: Migration 006 already has reviews.doctor_id → doctor_profiles(id).
-- No fix needed for the `reviews` table; the P16 audit reported an outdated state.
