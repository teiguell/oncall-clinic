-- =============================================
-- OnCall Clinic — Complete KYC fields for seed doctors
-- Migration 016
-- =============================================
-- Context: the 3 demo doctors (d1000000-0000-0000-0000-00000000000[1,2,3])
-- were seeded earlier without COMIB licence / RC insurance / REGCESS
-- fields. E2E simulation requires these filled with deterministic TEST
-- values so the doctor can pass the KYC gate and accept requests.

UPDATE doctor_profiles SET
  comib_license_number = CASE id::text
    WHEN 'd1000000-0000-0000-0000-000000000001' THEN '07/90001'
    WHEN 'd1000000-0000-0000-0000-000000000002' THEN '07/90002'
    WHEN 'd1000000-0000-0000-0000-000000000003' THEN '07/90003'
    ELSE comib_license_number
  END,
  comib_verified = true,
  rc_insurance_company = 'Seed Insurance Co (TEST)',
  rc_insurance_policy_number = 'SEED-RC-000' || substr(id::text, -1),
  rc_insurance_coverage_amount = 1500000,
  rc_insurance_expiry_date = NOW() + INTERVAL '1 year',
  contract_accepted_at = NOW(),
  contract_version = '1.0',
  reta_registration_number = 'SEED-RETA-' || substr(id::text, -1)
WHERE id::text LIKE 'd1000000-%';
