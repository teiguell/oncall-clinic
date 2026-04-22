-- =============================================
-- OnCall Clinic — Consent consolidation (user_consents is canonical)
-- Migration 019
-- =============================================
-- Context: we now keep a single row per user in `user_consents` (current
-- state, quick lookup). The legacy `consent_log` (migration 003) was an
-- append-only audit trail. This migration:
--   1. Backfills `user_consents` from any historical `consent_log` rows
--      (most-recent grant wins per consent_type per user).
--   2. Marks `consent_log` as deprecated via COMMENT; keeps the table in
--      place for audit but stops writing to it from new code.
--
-- Column mapping (consent_log.consent_type → user_consents.*):
--   health_data_processing   → health_data
--   geolocation_tracking     → geolocation
--   analytics                → analytics
--   marketing_communications → marketing
--   profiling                → profiling

INSERT INTO user_consents (
  user_id,
  health_data,
  geolocation,
  analytics,
  marketing,
  profiling,
  consented_at,
  ip_address,
  user_agent,
  version
)
SELECT
  user_id,
  COALESCE(bool_or(consent_type = 'health_data_processing'   AND granted), false),
  COALESCE(bool_or(consent_type = 'geolocation_tracking'     AND granted), false),
  COALESCE(bool_or(consent_type = 'analytics'                AND granted), false),
  COALESCE(bool_or(consent_type = 'marketing_communications' AND granted), false),
  COALESCE(bool_or(consent_type = 'profiling'                AND granted), false),
  MAX(granted_at),
  (array_agg(ip_address ORDER BY granted_at DESC))[1],
  (array_agg(user_agent ORDER BY granted_at DESC))[1],
  'v1.0-migrated'
FROM consent_log
WHERE user_id IS NOT NULL
GROUP BY user_id
ON CONFLICT (user_id) DO NOTHING;

COMMENT ON TABLE consent_log IS
  'DEPRECATED 2026-04-23 — use user_consents (single-row-per-user current state).
   Append-only historical audit preserved; no new writes expected from app code.';
