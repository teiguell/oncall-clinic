-- =============================================
-- OnCall Clinic — Chat 24h retention (logistics-only)
-- Migration 018
-- =============================================
-- The in-consultation chat is a LOGISTICS channel (ETA, address notes, arrival
-- confirmation). It is NOT a clinical record. We retain messages for 24h and
-- hard-delete older rows. This aligns with the "non-clinical" positioning,
-- minimises data footprint (GDPR storage limitation), and reduces the attack
-- surface of any breach.

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Unschedule any prior job with the same name before re-scheduling (idempotent)
SELECT cron.unschedule('purge_chat_24h')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'purge_chat_24h');

SELECT cron.schedule(
  'purge_chat_24h',
  '0 * * * *',
  $$DELETE FROM consultation_messages WHERE created_at < NOW() - INTERVAL '24 hours'$$
);

-- Reinforce RLS: even if the cron lags, SELECTs only return the last 24h.
DROP POLICY IF EXISTS "chat_24h_window" ON consultation_messages;
CREATE POLICY "chat_24h_window" ON consultation_messages
  FOR SELECT
  USING (
    created_at > NOW() - INTERVAL '24 hours'
    AND EXISTS (
      SELECT 1 FROM consultations c
      WHERE c.id = consultation_messages.consultation_id
        AND (c.patient_id = auth.uid() OR c.doctor_id = auth.uid())
    )
  );

COMMENT ON POLICY "chat_24h_window" ON consultation_messages IS
  'Logistics-only chat: patient/doctor see only their own consultation messages
   from the last 24h. pg_cron job purge_chat_24h hard-deletes older rows hourly.';
