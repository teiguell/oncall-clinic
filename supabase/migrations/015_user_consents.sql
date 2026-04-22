-- =============================================
-- OnCall Clinic — GDPR Consent Recapture (user_consents)
-- Migration 015
-- =============================================
-- Context: Magic Link + Google OAuth flow lost the 5 consent checkboxes
-- that /register used to capture. This table stores the CURRENT consent
-- state per user (single row). The immutable audit log lives in
-- `consent_log` (migration 003) and is untouched.
--
-- Compliance:
--   - RGPD Art. 7 (demostrable consent) + Art. 9.2.a (health data)
--   - LOPDGDD 3/2018 (Spain transposition)
--   - Granular: no bundled consent, each flag independent

CREATE TABLE IF NOT EXISTS user_consents (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  health_data BOOLEAN NOT NULL DEFAULT FALSE,
  geolocation BOOLEAN NOT NULL DEFAULT FALSE,
  analytics BOOLEAN DEFAULT FALSE,
  marketing BOOLEAN DEFAULT FALSE,
  profiling BOOLEAN DEFAULT FALSE,
  consented_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  version TEXT NOT NULL DEFAULT '1.0'
);

ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users can read own consents" ON user_consents;
CREATE POLICY "users can read own consents"
  ON user_consents FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users can insert own consents" ON user_consents;
CREATE POLICY "users can insert own consents"
  ON user_consents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users can update own consents" ON user_consents;
CREATE POLICY "users can update own consents"
  ON user_consents FOR UPDATE
  USING (auth.uid() = user_id);
