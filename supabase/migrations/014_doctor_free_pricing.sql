-- =============================================
-- OnCall Clinic — Doctor free pricing (LSSI-CE compliant)
-- Migration 014
-- =============================================
-- Legal context: Ley 15/2007 (Defensa Competencia) + STS 805/2020 (Glovo)
-- A technology intermediary CANNOT set prices for independent professionals.
-- Doctors MUST freely set their own consultation price; the platform only
-- publishes a recommended range for orientation.

-- Replace the ±30% adjustment model with a free price column:
--   - 5000c (€50) min and 50000c (€500) max are TECHNICAL guard-rails, not
--     commercial constraints (prevent clearly-broken values).
--   - Default 15000c = €150 (mid-point of recommended Ibiza range).
ALTER TABLE doctor_profiles
  ADD COLUMN IF NOT EXISTS consultation_price INTEGER DEFAULT 15000;

ALTER TABLE doctor_profiles DROP CONSTRAINT IF EXISTS consultation_price_range;
ALTER TABLE doctor_profiles ADD CONSTRAINT consultation_price_range
  CHECK (consultation_price IS NULL OR (consultation_price >= 5000 AND consultation_price <= 50000));

-- Backfill using any existing price_adjustment to preserve current effective
-- prices for doctors that already set an adjustment.
UPDATE doctor_profiles
SET consultation_price = GREATEST(5000, LEAST(50000, ROUND(15000 * (1 + COALESCE(price_adjustment, 0)))))
WHERE consultation_price IS NULL OR consultation_price = 15000;
