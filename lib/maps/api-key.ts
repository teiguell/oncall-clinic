/**
 * Google Maps API key resolver — Round 24-1 (Q4-D-1).
 *
 * Single source of truth for the public Google Maps key used across:
 *   - components/booking/PlacesAutocomplete.tsx (Places Autocomplete)
 *   - components/shared/address-map.tsx        (@vis.gl APIProvider)
 *   - app/[locale]/patient/tracking/[id]/page.tsx (live tracking Map)
 *   - app/[locale]/patient/request/page.tsx     (reverse-geocode fetch)
 *
 * Pre-Round-24 each consumer read its own env var (PLACES_KEY for the
 * autocomplete, MAPS_API_KEY for the Map embed). When both rendered
 * on the same page (Step 0 of the booking flow) the browser tried to
 * load `https://maps.googleapis.com/maps/api/js?key=…` TWICE with
 * different keys, and Google's loader threw `ApiNotActivatedMapError`
 * for the second load if the keys had different API allow-lists in
 * GCP. The audit confirmed the PLACES_KEY has Maps JS + Places +
 * Geocoding all enabled, while the MAPS_API_KEY only had Geocoding.
 *
 * The fix: every consumer now calls `getGoogleMapsKey()` and we prefer
 * `NEXT_PUBLIC_GOOGLE_PLACES_KEY` (the verified-good key) with
 * `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` as fallback. Same physical key
 * used by every consumer → only one script tag → no conflict.
 *
 * Server-side equivalent for Geocoding REST (no JS): see
 * `app/api/geocode/route.ts` which reads either env directly.
 */

export function getGoogleMapsKey(): string | undefined {
  // Both keys are public (NEXT_PUBLIC_*) so they ship to the browser.
  // Prefer PLACES_KEY because the Q4-1 audit confirmed it has the
  // full API allow-list. MAPS_API_KEY remains usable as fallback for
  // installs that haven't migrated their Vercel env yet.
  const places = process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY
  const maps = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  return places || maps || undefined
}
