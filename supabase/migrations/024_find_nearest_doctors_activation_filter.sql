-- =============================================
-- OnCall Clinic — Round 14 follow-up — find_nearest_doctors RPC realignment
-- Migration 024
-- =============================================
-- Goal: add `activation_status = 'active'` filter to the RPC, hiding
-- doctors who haven't completed email/SMS verification + admin review
-- (Round 11 + Round 14-A activation flow).
--
-- During implementation we discovered that migration 020 (the file in
-- supabase/migrations/) was NEVER successfully applied to the production
-- DB:
--   1. It contains a `dp::jsonb` cast that Postgres rejects (cannot cast
--      a row type to jsonb directly — needs to_jsonb(dp.*) or row_to_json).
--   2. It references a `night_price` column that does not exist in
--      doctor_profiles.
--
-- Instead, the live function is an older PL/pgSQL implementation with
-- parameters (patient_lat, patient_lng, radius_km, specialty_filter)
-- and a return shape (doctor_id, user_id, full_name, specialty, rating,
-- distance_km).
--
-- BUT the actual callers pass `{ lat_in, lng_in, radius_km }`:
--   - app/api/doctors/route.ts line 28
--   - components/doctor-selector.tsx line 64
--
-- So the RPC has been silently failing (parameter name mismatch) and
-- both callers fell through to their fallback queries. The components
-- worked because their fallback queries are correct; the API
-- /api/doctors fell through too AND had a broken `night_price` in the
-- SELECT, so it returned [] for every call.
--
-- This migration:
--   1. DROPs the live mismatched function.
--   2. CREATEs a new one matching the callers' parameter names + a
--      practical return shape (just the columns callers actually use).
--   3. Includes activation_status = 'active' in the WHERE clause.
--   4. Drops the broken `night_price` from the return shape (it was the
--      only column doctor_profiles doesn't have).

DROP FUNCTION IF EXISTS find_nearest_doctors(double precision, double precision, double precision, text);
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
  distance_km DOUBLE PRECISION
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
    ) AS distance_km
  FROM doctor_profiles dp
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
  ORDER BY distance_km ASC
  LIMIT 20;
$$;

COMMENT ON FUNCTION find_nearest_doctors IS
  'Returns active + verified + available doctors within radius_km of (lat_in, lng_in),
   sorted by Haversine distance ASC. Round 14 follow-up: activation_status filter
   added; signature realigned with actual callers (app/api/doctors/route.ts,
   components/doctor-selector.tsx); previous PL/pgSQL implementation with
   patient_lat/patient_lng + specialty_filter dropped because nothing was
   passing those parameter names.';
