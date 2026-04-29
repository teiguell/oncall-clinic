'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { MapPin, Loader2 } from 'lucide-react'
import { getGoogleMapsKey } from '@/lib/maps/api-key'

/**
 * PlacesAutocomplete — Round 16-A.
 *
 * Drop-in replacement for the plain address `<input>` in Step 1 that
 * uses Google Places Autocomplete restricted to Ibiza bounds. Tourists
 * typing "Ushuaïa" / "Hard Rock" / "Hotel Pacha" get hotel suggestions
 * with real lat/lng coords, eliminating the address-typo failure mode
 * (~30% of audit drop-offs per Cowork).
 *
 * Falls back to a plain text input if NEXT_PUBLIC_GOOGLE_PLACES_KEY is
 * missing OR the script fails to load — production stays functional.
 *
 * The component lazy-loads the Maps JS API on first focus to avoid
 * shipping it on every page that imports this file. Once loaded, it
 * stays cached on `window.google` so subsequent mounts are instant.
 *
 * Bounds: Ibiza SW (38.85, 1.20) → NE (39.10, 1.65). strictBounds=true
 * so the dropdown only shows places inside the island.
 */

// Minimal Google Maps Places types for the slice we use.
type LatLngLiteral = { lat: number; lng: number }
interface PlaceGeometry {
  location: { lat(): number; lng(): number }
}
interface PlaceResult {
  formatted_address?: string
  geometry?: PlaceGeometry
  name?: string
}
interface AutocompleteService {
  getPlace(): PlaceResult
  addListener(eventName: string, handler: () => void): void
}
interface MapsBounds {
  // Constructor only — no methods used directly.
  _empty?: never
}
interface MapsNamespace {
  places: {
    Autocomplete: new (
      input: HTMLInputElement,
      options: {
        componentRestrictions?: { country: string }
        bounds?: MapsBounds
        strictBounds?: boolean
        fields?: string[]
        types?: string[]
      },
    ) => AutocompleteService
  }
  LatLngBounds: new (sw: LatLngLiteral, ne: LatLngLiteral) => MapsBounds
  Geocoder: new () => {
    geocode(
      req: { location: LatLngLiteral },
      cb: (results: Array<{ formatted_address: string }> | null) => void,
    ): void
  }
}
declare global {
  interface Window {
    google?: { maps: MapsNamespace }
    __oncall_places_loading__?: Promise<void>
  }
}

interface PlacesAutocompleteProps {
  defaultValue?: string
  placeholder?: string
  locale: 'es' | 'en'
  onSelect: (place: { address: string; lat: number; lng: number; name?: string }) => void
  onChange?: (value: string) => void
  /** Optional: invoked when geolocation reverse-geocodes to an address. */
  onGeolocate?: (place: { address: string; lat: number; lng: number }) => void
  className?: string
  /** "form-input" mode (no decoration) vs "icon" mode (MapPin prefix). Default 'icon'. */
  variant?: 'icon' | 'plain'
}

const IBIZA_SW: LatLngLiteral = { lat: 38.85, lng: 1.2 }
const IBIZA_NE: LatLngLiteral = { lat: 39.1, lng: 1.65 }

/**
 * Loads the Google Maps Places library exactly once per page session.
 * Subsequent calls return the cached promise so multiple
 * <PlacesAutocomplete> instances don't trigger N script tags.
 */
function loadPlacesScript(locale: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  // If a sibling component already loaded the API (typically the
  // <APIProvider> in <AddressMap> with libraries=['places']), bail out.
  if (window.google?.maps?.places) return Promise.resolve()
  if (window.__oncall_places_loading__) return window.__oncall_places_loading__

  // Round 24-1 (Q4-D-1): use the consolidated key resolver so this
  // loader matches the @vis.gl APIProvider's key — otherwise the
  // browser refuses the second script load and throws
  // ApiNotActivatedMapError on the first key Google sees.
  const apiKey = getGoogleMapsKey()
  if (!apiKey) {
    return Promise.reject(new Error('Google Maps API key missing'))
  }

  window.__oncall_places_loading__ = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=${locale}`
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Google Maps script failed to load'))
    document.head.appendChild(script)
  })

  return window.__oncall_places_loading__
}

export function PlacesAutocomplete({
  defaultValue = '',
  placeholder,
  locale,
  onSelect,
  onChange,
  onGeolocate,
  className = '',
  variant = 'icon',
}: PlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState(defaultValue)
  const [autocomplete, setAutocomplete] = useState<AutocompleteService | null>(null)
  const [scriptError, setScriptError] = useState<string | null>(null)
  const [geolocating, setGeolocating] = useState(false)

  // Lazy-load the Places script when the input is first focused or as
  // soon as the component mounts (whichever comes first).
  const ensureScript = useCallback(async () => {
    try {
      await loadPlacesScript(locale)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'script_error'
      setScriptError(msg)
      console.warn('[PlacesAutocomplete] script load failed:', msg)
    }
  }, [locale])

  useEffect(() => {
    void ensureScript()
  }, [ensureScript])

  // Initialise the Autocomplete instance once the script + ref are ready.
  useEffect(() => {
    if (autocomplete || scriptError) return
    if (!inputRef.current || !window.google?.maps?.places) return

    const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'es' },
      bounds: new window.google.maps.LatLngBounds(IBIZA_SW, IBIZA_NE),
      strictBounds: true,
      fields: ['formatted_address', 'geometry', 'name'],
      types: ['establishment', 'geocode'],
    })
    ac.addListener('place_changed', () => {
      const place = ac.getPlace()
      if (!place.geometry?.location) return
      const lat = place.geometry.location.lat()
      const lng = place.geometry.location.lng()
      const address = place.formatted_address ?? place.name ?? value
      setValue(address)
      onChange?.(address)
      onSelect({ address, lat, lng, name: place.name })
    })
    setAutocomplete(ac)
  }, [autocomplete, scriptError, value, onChange, onSelect])

  /**
   * Click handler for the inline geolocate button. Falls back to the
   * existing `detectLocation` callback if reverse-geocode fails.
   */
  const handleGeolocate = async () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return
    setGeolocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        try {
          await ensureScript()
          if (window.google?.maps) {
            const geocoder = new window.google.maps.Geocoder()
            geocoder.geocode({ location: { lat, lng } }, (results) => {
              const formatted = results?.[0]?.formatted_address
              if (formatted) {
                setValue(formatted)
                onChange?.(formatted)
                onGeolocate?.({ address: formatted, lat, lng })
                onSelect({ address: formatted, lat, lng })
              } else {
                onGeolocate?.({ address: `${lat},${lng}`, lat, lng })
              }
              setGeolocating(false)
            })
            return
          }
        } catch {
          // fall through
        }
        // Fallback: pass coords without reverse-geocode
        onGeolocate?.({ address: `${lat},${lng}`, lat, lng })
        setGeolocating(false)
      },
      () => setGeolocating(false),
      { enableHighAccuracy: true, timeout: 7000 },
    )
  }

  const baseInputClasses =
    variant === 'icon'
      ? 'w-full bg-white border border-slate-200 rounded-xl pl-10 pr-24 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary'
      : 'w-full bg-white border border-slate-200 rounded-xl px-3 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary'

  return (
    <div className={`relative ${className}`}>
      {variant === 'icon' && (
        <MapPin
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"
          aria-hidden="true"
        />
      )}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          onChange?.(e.target.value)
        }}
        placeholder={placeholder}
        autoComplete="off"
        className={baseInputClasses}
      />
      <button
        type="button"
        onClick={handleGeolocate}
        disabled={geolocating}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-600 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors disabled:opacity-50"
        aria-label={locale === 'en' ? 'Use my location' : 'Usar mi ubicación'}
      >
        {geolocating ? <Loader2 className="h-3 w-3 animate-spin" /> : (locale === 'en' ? 'My location' : 'Mi ubicación')}
      </button>
    </div>
  )
}
