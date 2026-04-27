-- =============================================
-- OnCall Clinic — Round 18A — Stripe deferred for individual doctors
-- Migration 027
-- =============================================
-- Director's decision (Opción G + SPEC_ROUND18B_DEFERRED_STRIPE):
--   Stripe Connect is removed from the doctor onboarding wizard.
--   Doctors complete a 3-step wizard (Personal → Docs → Contract) and
--   start accepting consultations IMMEDIATELY. Their share of each
--   consultation is held in `pending_payouts` until they configure
--   Stripe Connect (post-first-visit, in-dashboard banner).
--
-- If they configure Stripe within 90 days → retroactive transfers
-- of all pending rows. After 90 days → automatic refund to patient
-- (cron `/api/cron/refund-stale-payouts`, daily at 02:00).
--
-- Why this exists:
--   The Stripe Connect Express flow takes ~10 min + 24-48 h KYC. That
--   is critical conversion friction for new doctors who just want to
--   "be listed and accept calls". Deferring it lets them ship to the
--   patient pool same day; the funds wait.
--
-- Clinics (Round 15B) keep Stripe Connect IN the wizard — multi-doctor
-- accounting requires it from day 1. This deferral applies to
-- INDIVIDUAL doctors only.

CREATE TABLE IF NOT EXISTS pending_payouts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES doctor_profiles(id) ON DELETE CASCADE,
  consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,

  -- All amounts in cents
  amount_cents INTEGER NOT NULL,        -- Total patient paid
  commission_cents INTEGER NOT NULL,    -- OnCall fee (or clinic fee for clinic doctors)
  net_cents INTEGER NOT NULL,           -- amount - commission (what the doctor will receive)

  status TEXT NOT NULL DEFAULT 'pending_doctor_setup'
    CHECK (status IN ('pending_doctor_setup', 'transferred', 'refunded', 'failed')),

  -- Lifecycle
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  transferred_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  refund_reason TEXT,
  stripe_transfer_id TEXT,

  -- 90-day deadline for the doctor to set up Stripe before automatic refund
  refund_deadline TIMESTAMPTZ NOT NULL,

  UNIQUE(consultation_id)
);

CREATE INDEX IF NOT EXISTS idx_pending_payouts_doctor_status
  ON pending_payouts(doctor_id, status);

CREATE INDEX IF NOT EXISTS idx_pending_payouts_refund_deadline
  ON pending_payouts(refund_deadline)
  WHERE status = 'pending_doctor_setup';

-- doctor_profiles columns:
--   stripe_onboarded_at: set by webhook account.updated when
--     charges_enabled + payouts_enabled flip true. Used by
--     /api/consultations/[id]/complete to choose Path A vs Path B.
--   stripe_setup_dismissed_at: optional UX — doctor clicks "remind me
--     later" on the dashboard banner; stops the banner appearing for 7
--     days. Round 18A scope: column added but UI gating deferred.
ALTER TABLE doctor_profiles
  ADD COLUMN IF NOT EXISTS stripe_onboarded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stripe_setup_dismissed_at TIMESTAMPTZ;

-- RLS: doctors see their own pending_payouts only.
ALTER TABLE pending_payouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "doctor_own_payouts" ON pending_payouts;
CREATE POLICY "doctor_own_payouts" ON pending_payouts
  FOR SELECT
  TO authenticated
  USING (doctor_id IN (SELECT id FROM doctor_profiles WHERE user_id = auth.uid()));

-- Service role can insert/update/delete (cron + complete-consultation
-- + webhook all run as service role).
DROP POLICY IF EXISTS "service_role_full_access" ON pending_payouts;
CREATE POLICY "service_role_full_access" ON pending_payouts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE pending_payouts IS
  'Round 18A — Stripe deferred for individual doctors. Doctor share of
   each consultation is held here until they configure Stripe Connect.
   Retroactive transfer on account.updated webhook; auto-refund after
   90 days via /api/cron/refund-stale-payouts. Clinics not affected.';

COMMENT ON COLUMN pending_payouts.refund_deadline IS
  'Round 18A — created_at + 90 days. Cron refunds the patient after this.';

COMMENT ON COLUMN doctor_profiles.stripe_onboarded_at IS
  'Round 18A — timestamp when account.updated webhook confirmed
   charges_enabled + payouts_enabled. Used by complete-consultation
   to route Path A (immediate transfer) vs Path B (pending_payouts).';
