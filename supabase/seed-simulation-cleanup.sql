-- ============================================
-- CLEANUP simulación E2E
-- Ejecutar POST-simulación para dejar prod limpia
-- ============================================

-- Delete consultations that reference demo doctors or demo patients
DELETE FROM consultation_messages WHERE consultation_id IN (
  SELECT id FROM consultations WHERE doctor_id IN (
    SELECT id FROM doctor_profiles WHERE license_number LIKE 'COMIB-2800%'
  )
);

DELETE FROM consultation_reviews WHERE consultation_id IN (
  SELECT id FROM consultations WHERE doctor_id IN (
    SELECT id FROM doctor_profiles WHERE license_number LIKE 'COMIB-2800%'
  )
);

DELETE FROM refunds WHERE consultation_id IN (
  SELECT id FROM consultations WHERE doctor_id IN (
    SELECT id FROM doctor_profiles WHERE license_number LIKE 'COMIB-2800%'
  )
);

DELETE FROM consultations WHERE doctor_id IN (
  SELECT id FROM doctor_profiles WHERE license_number LIKE 'COMIB-2800%'
) OR patient_id IN (
  SELECT id FROM profiles WHERE email LIKE '%@oncall.clinic' AND email LIKE 'demo-%'
);

-- Delete doctor_profiles + profiles
DELETE FROM doctor_profiles WHERE license_number LIKE 'COMIB-2800%';

DELETE FROM profiles WHERE id IN (
  'd1000000-0000-0000-0000-000000000001'::uuid,
  'd1000000-0000-0000-0000-000000000002'::uuid,
  'd1000000-0000-0000-0000-000000000003'::uuid
);

-- Optional: also remove auth.users entries for demo accounts
-- (requires service_role; run manually from Supabase dashboard if needed)
-- DELETE FROM auth.users WHERE email LIKE '%demo%@oncall.clinic';
