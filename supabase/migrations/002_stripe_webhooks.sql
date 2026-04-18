-- =============================================
-- OnCall Clinic - Stripe Webhooks & Refunds
-- Migration 002
-- =============================================

-- Stripe webhook event log (idempotency)
CREATE TABLE stripe_webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_id TEXT NOT NULL UNIQUE,
  payload JSONB,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'processed'
);

CREATE INDEX idx_webhook_event_id ON stripe_webhook_logs(event_id);

-- Refunds table
CREATE TABLE refunds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  reason TEXT,
  stripe_refund_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  requested_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_refund_consultation ON refunds(consultation_id);
CREATE INDEX idx_refund_status ON refunds(status);

-- Add scheduled_payout_at if not exists
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS scheduled_payout_at TIMESTAMPTZ;

-- RLS for refunds
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_webhook_logs ENABLE ROW LEVEL SECURITY;

-- Patients can see their own refunds
CREATE POLICY "refunds_patient_select" ON refunds FOR SELECT
  USING (consultation_id IN (
    SELECT id FROM consultations WHERE patient_id = auth.uid()
  ));

-- Admins manage via service role (bypasses RLS automatically)

-- Webhook logs: service role only (no user access)
-- No SELECT policy = only service role can read
