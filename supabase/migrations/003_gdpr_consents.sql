CREATE TABLE consent_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL CHECK (consent_type IN (
    'health_data_processing',
    'geolocation_tracking',
    'analytics',
    'marketing_communications',
    'profiling'
  )),
  granted BOOLEAN NOT NULL,
  ip_address INET,
  user_agent TEXT,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

CREATE INDEX idx_consent_user ON consent_log(user_id);
CREATE INDEX idx_consent_type ON consent_log(user_id, consent_type);
ALTER TABLE consent_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own consents" ON consent_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own consents" ON consent_log FOR INSERT WITH CHECK (auth.uid() = user_id);
