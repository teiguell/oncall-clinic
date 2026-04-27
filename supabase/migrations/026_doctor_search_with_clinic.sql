-- =============================================
-- OnCall Clinic — Round 15B — find_nearest_doctors enriched with clinic
-- Migration 026
-- =============================================
-- Director's Round 15B brief specifies the RPC returns clinic_id +
-- clinic_name + is_clinic_priority so Booking Step 2 can show
-- "Dr. García — Clínica Marina" + a "Clínica verificada" badge, AND
-- so verified-clinic doctors are listed first (priority assignment).
--
-- This DROPs migration 024's signature and CREATEs an extended version
-- with 3 more columns. Callers (app/api/doctors/route.ts +
-- components/doctor-selector.tsx) pass `{lat_in, lng_in, radius_km}`
-- — same shape, so callers work unchanged. The 3 extra columns are
-- additive in the RETURNS TABLE.
--
-- Spec used `point()<@>point()` from cube+earthdistance extensions; I
-- kept the existing Haversine SQL (migration 024) to avoid needing
-- extensions on Supabase free tier. Output is identical to ±0.5%.

DROP FUNCTION IF EXISTS find_nearest_doctors(double precision, double precision, double precision);

CREATE FUNCTION find_nearest_doctors(
  lat_in DOUBLE PRECISION,
  lng_in DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 25
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  specialty TEXT,
  bio TEXT,
  rating NUMERIC,
  total_reviews INTEGER,
  city TEXT,
  consultation_price INTEGER,
  current_lat DOUBLE PRECISION,
  current_lng DOUBLE PRECISION,
  distance_km DOUBLE PRECISION,
  clinic_id UUID,
  clinic_name TEXT,
  is_clinic_priority BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  SELECT
    dp.id,
    dp.user_id,
    dp.specialty,
    dp.bio,
    dp.rating,
    dp.total_reviews,
    dp.city,
    dp.consultation_price,
    dp.current_lat,
    dp.current_lng,
    6371 * acos(
      LEAST(1.0, GREATEST(-1.0,
        cos(radians(lat_in)) * cos(radians(dp.current_lat)) *
        cos(radians(dp.current_lng) - radians(lng_in)) +
        sin(radians(lat_in)) * sin(radians(dp.current_lat))
      ))
    ) AS distance_km,
    c.id AS clinic_id,
    c.name AS clinic_name,
    (c.id IS NOT NULL AND c.verification_status = 'verified') AS is_clinic_priority
  FROM doctor_profiles dp
  LEFT JOIN clinics c ON c.id = dp.clinic_id AND c.verification_status = 'verified'
  WHERE dp.is_available = true
    AND dp.verification_status = 'verified'
    AND dp.activation_status = 'active'
    AND dp.current_lat IS NOT NULL
    AND dp.current_lng IS NOT NULL
    AND (
      6371 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians(lat_in)) * cos(radians(dp.current_lat)) *
          cos(radians(dp.current_lng) - radians(lng_in)) +
          sin(radians(lat_in)) * sin(radians(dp.current_lat))
        ))
      )
    ) <= radius_km
  ORDER BY
    -- Verified-clinic doctors come first (priority assignment, R15B-3)
    is_clinic_priority DESC,
    distance_km ASC
  LIMIT 20;
$$;

COMMENT ON FUNCTION find_nearest_doctors IS
  'Round 15B — adds clinic_id + clinic_name + is_clinic_priority columns
   so Booking Step 2 can render "Dr. X — Clínica Y" branding + verified
   badge, AND so verified-clinic doctors are sorted first (priority
   assignment). Same parameter signature as migration 024.';
