import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const IBIZA_FALLBACK = { lat: 38.9067, lng: 1.4206, name: 'Ibiza' } as const

const IBIZA_BOUNDS = {
  // Generous bounding box: includes Eivissa city, Sant Antoni, Santa
  // Eulària, Sant Joan, Es Vedrà, plus a buffer for nearby villas.
  swLat: 38.78,
  swLng: 1.16,
  neLat: 39.16,
  neLng: 1.7,
} as const

function withinIbiza(lat: number, lng: number): boolean {
  return (
    lat >= IBIZA_BOUNDS.swLat &&
    lat <= IBIZA_BOUNDS.neLat &&
    lng >= IBIZA_BOUNDS.swLng &&
    lng <= IBIZA_BOUNDS.neLng
  )
}

/**
 * GET /api/geocode?address=<text> — Round 22-1 (Q4-13).
 *
 * Server-side geocoding fallback for the patient booking flow. Used
 * when the user types an address WITHOUT picking a Google Places
 * Autocomplete suggestion (or when the Maps JS API itself errors out
 * — see Q4-1).
 *
 * Strategy:
 *   1. If `NEXT_PUBLIC_GOOGLE_PLACES_KEY` (also valid as Geocoding key
 *      since both share GCP Maps Platform) is set, call Google's
 *      Geocoding REST API with the raw address + region=es bias.
 *      Filter results to ones inside the Ibiza bounding box; return
 *      the first match.
 *   2. If no result is inside Ibiza OR the request fails, return
 *      the Ibiza centroid (38.9067, 1.4206) with `fallback: true`
 *      so the UI can show a yellow "Confirma dirección exacta"
 *      warning. The booking still proceeds with a sensible default
 *      lat/lng for the broadcast RPC.
 *   3. If no API key is configured, just return the centroid.
 *
 * This endpoint is public (no auth) — same threat model as
 * `/api/doctors/count` (a small read-only endpoint that helps the
 * booking funnel; no PII).
 *
 * Response shape:
 *   { lat, lng, formattedAddress?, fallback: boolean, source: 'google' | 'fallback' }
 */
interface GeocodeResult {
  lat: number
  lng: number
  formattedAddress?: string
  fallback: boolean
  source: 'google' | 'fallback'
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const address = (url.searchParams.get('address') ?? '').trim()

  if (!address) {
    return NextResponse.json({ error: 'address_required', code: 'bad_request' }, { status: 400 })
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY ?? process.env.GOOGLE_GEOCODING_KEY
  if (!apiKey) {
    return NextResponse.json<GeocodeResult>({
      ...IBIZA_FALLBACK,
      formattedAddress: undefined,
      fallback: true,
      source: 'fallback',
    })
  }

  try {
    // Google Geocoding API: use region=es bias + components=country:ES
    // so "Hotel Ushuaïa" doesn't match an "Ushuaïa" street in Argentina.
    const params = new URLSearchParams({
      address,
      region: 'es',
      components: 'country:ES',
      key: apiKey,
    })
    const resp = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`,
      { signal: AbortSignal.timeout(5_000) },
    )
    if (!resp.ok) throw new Error(`geocode_status_${resp.status}`)
    const data = (await resp.json()) as {
      status?: string
      results?: Array<{
        formatted_address?: string
        geometry?: { location?: { lat?: number; lng?: number } }
      }>
    }
    if (data.status !== 'OK' || !data.results?.length) {
      throw new Error(`geocode_no_results_${data.status ?? 'unknown'}`)
    }

    // Prefer first result inside Ibiza bounds; if none, fall through to fallback.
    for (const r of data.results) {
      const lat = r.geometry?.location?.lat
      const lng = r.geometry?.location?.lng
      if (typeof lat === 'number' && typeof lng === 'number' && withinIbiza(lat, lng)) {
        return NextResponse.json<GeocodeResult>({
          lat,
          lng,
          formattedAddress: r.formatted_address,
          fallback: false,
          source: 'google',
        })
      }
    }
    // Result was outside Ibiza: better to show fallback + warning than
    // route a doctor to mainland Spain.
    return NextResponse.json<GeocodeResult>({
      ...IBIZA_FALLBACK,
      formattedAddress: data.results[0].formatted_address,
      fallback: true,
      source: 'fallback',
    })
  } catch (e) {
    console.warn('[geocode] failed, returning Ibiza centroid:', e instanceof Error ? e.message : e)
    return NextResponse.json<GeocodeResult>({
      ...IBIZA_FALLBACK,
      fallback: true,
      source: 'fallback',
    })
  }
}
