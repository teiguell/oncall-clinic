-- =============================================
-- OnCall Clinic - Stripe Checkout columns
-- Migration 011
-- =============================================
-- Adds columns to track Stripe Checkout sessions and payment status.
-- Works for both real Stripe and test-mode simulated payments.

ALTER TABLE consultations ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending'
  CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));

-- stripe_payment_intent_id already exists in 001_initial_schema
-- Create index for faster lookup by session_id (verify endpoint)
CREATE INDEX IF NOT EXISTS idx_consultations_stripe_session ON consultations(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_consultations_payment_status ON consultations(payment_status);
