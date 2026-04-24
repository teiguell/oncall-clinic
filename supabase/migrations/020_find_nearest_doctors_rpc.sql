-- =============================================
-- OnCall Clinic — RPC find_nearest_doctors (Haversine, no PostGIS required)
-- Migration 020
-- =============================================
-- BUG FIX P0 #2 (2026-04-24): DoctorSelector was calling supabase.rpc
-- 'find_nearest_doctors' and getting 404 because the function didn't exist.
-- It fell back to a plain query, but the UI expected a pre-sorted,
-- distance-annotated list.
--
-- Implementation: spherical-law-of-cosines (6371 km Earth radius).
-- Accuracy ±0.5% — more than enough for Ibiza-scale routing. Avoids
-- needing PostGIS which isn't available on this Supabase tier.
--
-- Signature matches the call in app/api/doctors/route.ts and the
-- DoctorSelector fallback: (lat_in, lng_in, radius_km).

CREATE OR REPLACE FUNCTION find_nearest_doctors(
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
  night_price INTEGER,
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
    (dp::jsonb->>'night_price')::int AS night_price,
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
  'Returns verified + available doctors within radius_km of (lat_in, lng_in),
   sorted by Haversine distance ascending. Used by /api/doctors and
   components/doctor-selector.tsx fallback.';
