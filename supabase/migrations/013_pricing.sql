-- =============================================
-- OnCall Clinic - Dynamic pricing
-- Migration 013
-- =============================================
-- Adds activated_at and price_adjustment columns to doctor_profiles
-- to support the Year 1 promotional commission (10% for the first 12
-- months since the doctor's activation date, then 15% standard) and
-- per-doctor price adjustments (±30% over the regional base price).

ALTER TABLE doctor_profiles
  ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ DEFAULT NOW();

-- Backfill for existing rows
UPDATE doctor_profiles
SET activated_at = created_at
WHERE activated_at IS NULL;

ALTER TABLE doctor_profiles
  ADD COLUMN IF NOT EXISTS price_adjustment DECIMAL(3,2) DEFAULT 0.00
  CHECK (price_adjustment >= -0.30 AND price_adjustment <= 0.30);

-- Index for queries that filter doctors by commission tier
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_activated_at
  ON doctor_profiles(activated_at);
