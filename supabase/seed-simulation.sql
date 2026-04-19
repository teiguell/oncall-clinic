-- ============================================
-- SEED DATA PARA SIMULACIÓN E2E
-- Ejecutar en Supabase SQL Editor (PRODUCCIÓN) con TEST_MODE activo
-- Todos los user_ids empiezan con d1000000 (doctores) para fácil limpieza
-- ============================================

-- Doctores: insertar en profiles
INSERT INTO profiles (id, email, full_name, role, phone, avatar_url) VALUES
  ('d1000000-0000-0000-0000-000000000001'::uuid, 'dra.garcia.demo@oncall.clinic', 'Dra. María García López', 'doctor', '+34612000001', NULL),
  ('d1000000-0000-0000-0000-000000000002'::uuid, 'dr.martinez.demo@oncall.clinic', 'Dr. Carlos Martínez Ruiz', 'doctor', '+34612000002', NULL),
  ('d1000000-0000-0000-0000-000000000003'::uuid, 'dr.smith.demo@oncall.clinic',   'Dr. James Smith',           'doctor', '+34612000003', NULL)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role      = EXCLUDED.role,
  phone     = EXCLUDED.phone;

-- Doctor profiles con coordenadas GPS reales de Ibiza
INSERT INTO doctor_profiles (
  user_id, license_number, specialty, bio, is_available, verification_status,
  current_lat, current_lng, rating, total_reviews, commission_rate,
  stripe_account_id, stripe_onboarded, city, address,
  languages, years_experience, rc_insurance_company, rc_insurance_expiry_date,
  contract_accepted_at, contract_version, consultation_price
) VALUES
  ('d1000000-0000-0000-0000-000000000001'::uuid, 'COMIB-28001', 'general_medicine',
   'Médica de familia con 12 años de experiencia. Especialista en urgencias no vitales y atención turística. Bilingüe ES/EN.',
   true, 'verified', 38.9067, 1.4206, 4.9, 187, 0.10,
   'acct_demo_001', true, 'Ibiza', 'Marina Botafoch',
   ARRAY['es','en'], 12, 'AXA', '2027-06-30',
   NOW(), '1.0', 15000),
  ('d1000000-0000-0000-0000-000000000002'::uuid, 'COMIB-28002', 'general_medicine',
   'Médico generalista con experiencia en turismo sanitario. Atención personalizada. Bilingüe ES/EN.',
   true, 'verified', 38.9186, 1.4328, 4.7, 134, 0.10,
   'acct_demo_002', true, 'Ibiza', 'Playa den Bossa',
   ARRAY['es','en'], 10, 'Zurich', '2027-09-15',
   NOW(), '1.0', 14000),
  ('d1000000-0000-0000-0000-000000000003'::uuid, 'COMIB-28003', 'general_medicine',
   'Sports medicine specialist. 8 years in Ibiza. Fluent EN/ES/DE. House calls across the island.',
   true, 'verified', 38.9789, 1.2973, 4.8, 92, 0.10,
   'acct_demo_003', true, 'San Antonio', 'West End',
   ARRAY['en','es','de'], 8, 'MPS', '2027-12-01',
   NOW(), '1.0', 18000)
ON CONFLICT (user_id) DO UPDATE SET
  is_available         = EXCLUDED.is_available,
  verification_status  = EXCLUDED.verification_status,
  current_lat          = EXCLUDED.current_lat,
  current_lng          = EXCLUDED.current_lng,
  rating               = EXCLUDED.rating,
  total_reviews        = EXCLUDED.total_reviews,
  consultation_price   = EXCLUDED.consultation_price;
