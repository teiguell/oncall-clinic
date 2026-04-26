/**
 * ETA helper — Round 7 Fix A (M1, M3).
 *
 * Estimates doctor arrival time in minutes from straight-line distance.
 * Ibiza city avg = 30 km/h with traffic. Min 5 min floor (the doctor still
 * needs to grab keys, walk to car, etc. — instantaneous ETA isn't credible).
 *
 * Returns undefined if distance is missing so callers can hide the ETA chip
 * gracefully instead of showing "0 min" or "NaN min".
 */
export function estimatedEta(distanceKm: number | null | undefined): number | undefined {
  if (distanceKm == null || !Number.isFinite(distanceKm)) return undefined
  return Math.max(5, Math.round((distanceKm / 30) * 60))
}
