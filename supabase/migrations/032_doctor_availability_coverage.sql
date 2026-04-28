-- =============================================
-- OnCall Clinic — Round 17-D — doctor availability + coverage
-- Migration 032
-- =============================================
-- Adds the columns the welcome-wizard step "Tu agenda" + "Tu zona"
-- write to. Both surfaces (R17-D pages /doctor/availability and
-- /doctor/coverage) read/write here.
--
--   availability_schedule  — JSONB, weekly-recurring slots
--                            { mon: [['08:00','14:00']], tue: [], ... }
--                            Empty array per day = unavailable.
--                            null = no schedule set yet (default to
--                            "always available" backwards-compat with
--                            R14 patient bookings).
--
--   coverage_lat/lng       — center of the doctor's preferred service area
--   coverage_radius_km     — radius from coverage_lat/lng. Default 15.
--                            find_nearest_doctors uses this OR the
--                            fixed 25 km param, whichever is tighter.
--   coverage_zones         — text[] of named zones (Eivissa centro,
--                            Sant Antoni, Santa Eulària, Sant Josep,
--                            Sant Joan, Formentera). Optional — zone
--                            tags help the assignment RPC prefer
--                            same-zone matches in future iterations.

ALTER TABLE doctor_profiles
  ADD COLUMN IF NOT EXISTS availability_schedule JSONB,
  ADD COLUMN IF NOT EXISTS coverage_lat NUMERIC(10, 7),
  ADD COLUMN IF NOT EXISTS coverage_lng NUMERIC(10, 7),
  ADD COLUMN IF NOT EXISTS coverage_radius_km INTEGER DEFAULT 15
    CHECK (coverage_radius_km IS NULL OR (coverage_radius_km BETWEEN 1 AND 50)),
  ADD COLUMN IF NOT EXISTS coverage_zones TEXT[] DEFAULT '{}';

COMMENT ON COLUMN doctor_profiles.availability_schedule IS
  'Round 17-D — JSONB weekly schedule. Keys mon..sun, values are
   arrays of [from,to] HH:MM tuples. NULL = always available
   (legacy / pre-R17-D doctors).';

COMMENT ON COLUMN doctor_profiles.coverage_radius_km IS
  'Round 17-D — radius around coverage_lat/lng for assignment.
   Default 15 km (Ibiza fits within 30km diameter so 15km radius
   covers half the island).';

COMMENT ON COLUMN doctor_profiles.coverage_zones IS
  'Round 17-D — named zones from Ibiza: Eivissa centro, Sant Antoni,
   Santa Eulària, Sant Josep, Sant Joan, Formentera.';
