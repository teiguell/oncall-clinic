-- =============================================
-- OnCall Clinic - RC Expiry Check Function
-- Migration 009
-- =============================================
-- This function checks RC insurance expiry dates and:
--   - Inserts alerts into rc_expiry_alerts
--   - Creates notifications for the doctor
--   - Suspends doctors with expired RC
-- Should be executed daily via Supabase Edge Function cron or pg_cron.

CREATE OR REPLACE FUNCTION check_rc_expiry()
RETURNS void AS $$
DECLARE
  doc RECORD;
BEGIN
  -- 30 days warning
  FOR doc IN
    SELECT id, user_id FROM doctor_profiles
    WHERE rc_insurance_expiry_date = CURRENT_DATE + INTERVAL '30 days'
      AND id NOT IN (SELECT doctor_id FROM rc_expiry_alerts WHERE alert_type = '30_days')
  LOOP
    INSERT INTO rc_expiry_alerts (doctor_id, alert_type) VALUES (doc.id, '30_days');
    INSERT INTO notifications (user_id, type, title, body, read)
    VALUES (
      doc.user_id, 'rc_expiry', 'RC Insurance',
      'Tu póliza RC vence en 30 días. Renuévala para seguir operando.',
      false
    );
  END LOOP;

  -- 15 days warning
  FOR doc IN
    SELECT id, user_id FROM doctor_profiles
    WHERE rc_insurance_expiry_date = CURRENT_DATE + INTERVAL '15 days'
      AND id NOT IN (SELECT doctor_id FROM rc_expiry_alerts WHERE alert_type = '15_days')
  LOOP
    INSERT INTO rc_expiry_alerts (doctor_id, alert_type) VALUES (doc.id, '15_days');
    INSERT INTO notifications (user_id, type, title, body, read)
    VALUES (
      doc.user_id, 'rc_expiry', 'RC Insurance URGENTE',
      'Tu póliza RC vence en 15 días. Sin póliza vigente no podrás recibir consultas.',
      false
    );
  END LOOP;

  -- 7 days critical
  FOR doc IN
    SELECT id, user_id FROM doctor_profiles
    WHERE rc_insurance_expiry_date = CURRENT_DATE + INTERVAL '7 days'
      AND id NOT IN (SELECT doctor_id FROM rc_expiry_alerts WHERE alert_type = '7_days')
  LOOP
    INSERT INTO rc_expiry_alerts (doctor_id, alert_type) VALUES (doc.id, '7_days');
    INSERT INTO notifications (user_id, type, title, body, read)
    VALUES (
      doc.user_id, 'rc_expiry', 'RC Insurance CRÍTICO',
      'Tu póliza RC vence en 7 días. RENUEVA AHORA o tu cuenta será suspendida.',
      false
    );
  END LOOP;

  -- Expired: suspend doctor
  FOR doc IN
    SELECT id, user_id FROM doctor_profiles
    WHERE rc_insurance_expiry_date < CURRENT_DATE
      AND id NOT IN (SELECT doctor_id FROM rc_expiry_alerts WHERE alert_type = 'expired')
  LOOP
    INSERT INTO rc_expiry_alerts (doctor_id, alert_type) VALUES (doc.id, 'expired');
    UPDATE doctor_profiles SET verification_status = 'suspended' WHERE id = doc.id;
    INSERT INTO notifications (user_id, type, title, body, read)
    VALUES (
      doc.user_id, 'rc_expiry', 'CUENTA SUSPENDIDA',
      'Tu póliza RC ha expirado. Tu cuenta ha sido suspendida hasta que subas una póliza vigente.',
      false
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Note: Schedule this function daily via:
-- SELECT cron.schedule('check-rc-expiry', '0 8 * * *', 'SELECT check_rc_expiry()');
-- (requires pg_cron extension enabled in Supabase)
