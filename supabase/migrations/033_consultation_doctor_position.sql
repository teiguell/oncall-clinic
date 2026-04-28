-- =============================================
-- OnCall Clinic — Round 17-E — live doctor geo-position
-- Migration 033
-- =============================================
-- Adds doctor's last-reported position columns to consultations so the
-- patient tracking page can render a live "Dr. en ruta" map pin.
--
-- The doctor's PWA calls navigator.geolocation.watchPosition while a
-- consultation is in 'accepted' or 'in_progress' status, posting to
-- /api/consultations/[id]/location every 30 s. Patient tracking polls
-- the same row every 30 s.
--
-- Privacy: only stored while the consultation is active. On checkout
-- we leave the last position for the receipt UI, but a future cron
-- can clean it after 24 h if desired (not part of this round).

ALTER TABLE consultations
  ADD COLUMN IF NOT EXISTS doctor_position_lat NUMERIC(10, 7),
  ADD COLUMN IF NOT EXISTS doctor_position_lng NUMERIC(10, 7),
  ADD COLUMN IF NOT EXISTS doctor_position_at TIMESTAMPTZ;

COMMENT ON COLUMN consultations.doctor_position_lat IS
  'Round 17-E — doctor''s last reported GPS lat. Updated every ~30 s
   by the doctor app while consultation is accepted or in_progress.';
