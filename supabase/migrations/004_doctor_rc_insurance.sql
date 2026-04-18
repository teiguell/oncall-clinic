ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS rc_insurance_company TEXT;
ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS rc_insurance_policy_number TEXT;
ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS rc_insurance_coverage_amount DECIMAL(12,2);
ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS rc_insurance_expiry_date DATE;
ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS rc_insurance_document_url TEXT;
ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS reta_registration_number TEXT;
ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS reta_document_url TEXT;
ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS comib_license_number TEXT;
ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS comib_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS contract_accepted_at TIMESTAMPTZ;
ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS contract_version TEXT;
ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{es}';
ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS years_experience INTEGER;
ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS payout_speed TEXT DEFAULT 'instant' CHECK (payout_speed IN ('instant', 'standard'));

CREATE TABLE rc_expiry_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES doctor_profiles(id),
  alert_type TEXT CHECK (alert_type IN ('30_days', '15_days', '7_days', 'expired')),
  sent_at TIMESTAMPTZ DEFAULT NOW()
);
