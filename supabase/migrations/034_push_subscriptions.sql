-- =============================================
-- OnCall Clinic — Round 17-F — Web Push subscriptions
-- Migration 034
-- =============================================
-- Stores Web Push API subscriptions per user (patient or doctor) so
-- the server can fire `webpush.sendNotification()` when:
--   - doctor accepts a consultation → push to patient
--   - doctor checks in              → push to patient
--   - patient submits a booking     → push to doctor
--   - 30-min visit reminder         → push to either
--
-- Director's brief specified `030_push_subscriptions.sql` but 030/031/
-- 032/033 were taken by R17 work this same day; renumbered to 034.
--
-- Schema:
--   endpoint   — the unique push endpoint URL from PushSubscription
--   keys       — JSONB { p256dh, auth } from PushSubscription.toJSON
--   user_agent — opt informational; helps debug per-browser delivery
--
-- One user can have multiple subscriptions (laptop + phone).
-- DELETE on logout is a follow-up; for alpha launch we keep stale
-- subscriptions and let them naturally fail (web-push returns 410
-- Gone, our send wrapper logs + soft-deletes).

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  keys JSONB NOT NULL,
  user_agent TEXT,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user
  ON push_subscriptions(user_id);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users see + manage their own subscriptions.
DROP POLICY IF EXISTS "users own subscriptions" ON push_subscriptions;
CREATE POLICY "users own subscriptions" ON push_subscriptions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Service role can SELECT to fire pushes from the server.
DROP POLICY IF EXISTS "service role read subscriptions" ON push_subscriptions;
CREATE POLICY "service role read subscriptions" ON push_subscriptions
  FOR ALL
  TO service_role
  USING (TRUE)
  WITH CHECK (TRUE);

COMMENT ON TABLE push_subscriptions IS
  'Round 17-F — Web Push subscriptions. One user can have N rows
   (multiple devices/browsers). Stale 410-Gone subscriptions are
   soft-deleted by lib/push.ts on send error.';

COMMENT ON COLUMN push_subscriptions.keys IS
  'JSONB { p256dh, auth } from PushSubscription.toJSON(). Required
   by webpush.sendNotification.';
