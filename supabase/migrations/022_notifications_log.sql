-- =============================================
-- OnCall Clinic — Round 14 — notifications_log
-- Migration 022
-- =============================================
-- Audit log for every notification dispatched (email + SMS + future push).
-- Required by the Director's Round 14 brief so we can:
--   - Debug delivery failures (Twilio error codes 21608, 21610, 30007)
--   - Enforce per-recipient rate limits (1 SMS / phone / minute)
--   - Trace which template fired for which user (compliance, audits)
--
-- The recipient address (email / phone) is stored as-is for now. If the
-- volume grows enough to make this a privacy concern, a future migration
-- can swap to a salted SHA-256 hash; the rate-limit query can use the
-- hash too.

CREATE TABLE IF NOT EXISTS notifications_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Channel + provider
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'push')),
  provider TEXT NOT NULL,            -- 'resend', 'twilio', 'stub', 'twilio-stub'

  -- Routing
  to_address TEXT NOT NULL,          -- email or E.164 phone
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Template
  template_key TEXT NOT NULL,        -- e.g. 'doctor.activation_sms'
  locale TEXT NOT NULL DEFAULT 'es' CHECK (locale IN ('es', 'en')),

  -- Outcome
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'skipped', 'rate_limited')),
  provider_message_id TEXT,          -- Twilio msg.sid / Resend id
  error_code TEXT,                   -- Twilio numeric or our internal label
  error_message TEXT,

  -- Timing
  sent_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Hot path: rate-limit lookup ("did we send to this `to_address` in the
-- last 60 seconds?"). Composite index on (to_address, sent_at desc).
CREATE INDEX IF NOT EXISTS notifications_log_to_sent_idx
  ON notifications_log (to_address, sent_at DESC);

-- Audit path: per-user history.
CREATE INDEX IF NOT EXISTS notifications_log_user_idx
  ON notifications_log (user_id, sent_at DESC)
  WHERE user_id IS NOT NULL;

-- Diagnostic path: filter by status + channel to find failure spikes.
CREATE INDEX IF NOT EXISTS notifications_log_status_idx
  ON notifications_log (status, channel, sent_at DESC);

COMMENT ON TABLE notifications_log IS
  'Round 14 — every notification dispatch (email, SMS) is logged here.
   Used for: rate limiting (60s/recipient minimum), debugging Twilio
   error codes, compliance audits.';

COMMENT ON COLUMN notifications_log.to_address IS
  'Email or E.164 phone, stored verbatim in alpha. Future migration may
   swap to SHA-256(salt + value) if volume creates a privacy concern.';

-- RLS: only the service role writes here; admins can read.
ALTER TABLE notifications_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service role full access" ON notifications_log;
CREATE POLICY "service role full access"
  ON notifications_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "admins can read" ON notifications_log;
CREATE POLICY "admins can read"
  ON notifications_log
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
  ));

-- The user can read their own notification history (audit transparency).
DROP POLICY IF EXISTS "self read" ON notifications_log;
CREATE POLICY "self read"
  ON notifications_log
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
