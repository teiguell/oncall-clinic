'use client'

import { useState } from 'react'
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps'
import { MapPin } from 'lucide-react'
import { getGoogleMapsKey } from '@/lib/maps/api-key'

// Round 24-1 (Q4-D-1): APIProvider needs to load the `places` library
// up-front so the sibling <PlacesAutocomplete> on Step 0 sees a ready
// `window.google.maps.places` and doesn't kick off a second script
// load with a possibly-different key. One loader, one key, no
// ApiNotActivatedMapError.
const MAPS_LIBRARIES = ['places' as const]

interface AddressMapProps {
  initialLat?: number
  initialLng?: number
  onChange: (lat: number, lng: number) => void
  className?: string
}

/**
 * AddressMap — Round 7 Fix B (M5).
 *
 * Replaces the stylized "Ibiza, ES" placeholder in Step 2 of the booking
 * flow with a real Google Maps embed using @vis.gl/react-google-maps.
 *
 * Behaviour:
 *   - Defaults to Ibiza centre (38.98, 1.42) if no initial coords.
 *   - Single draggable AdvancedMarker; onDragEnd fires `onChange(lat, lng)`
 *     so the parent can sync the booking store / form state.
 *   - Graceful degrade: if NEXT_PUBLIC_GOOGLE_MAPS_API_KEY isn't set we
 *     render the same SVG placeholder we had before (Cowork P0 priority
 *     was UI fidelity; without a key we keep the old visual quietly).
 *
 * Note: the Map needs a `mapId` to use AdvancedMarker. We hardcode a
 * stable id "address-picker" — Vercel/Google Cloud Map Styles can be
 * applied to that id later without a code change.
 */
export function AddressMap({
  initialLat = 38.98,
  initialLng = 1.42,
  onChange,
  className,
}: AddressMapProps) {
  const [pos, setPos] = useState({ lat: initialLat, lng: initialLng })
  const apiKey = getGoogleMapsKey()

  if (!apiKey) {
    // Graceful degrade — no key configured (e.g. preview build).
    return (
      <div
        className={
          'relative h-[200px] w-full rounded-[14px] overflow-hidden border border-border bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center ' +
          (className || '')
        }
        aria-label="Map unavailable"
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <MapPin className="h-6 w-6" aria-hidden="true" />
          <span className="text-xs">Ibiza, ES</span>
        </div>
      </div>
    )
  }

  return (
    <APIProvider apiKey={apiKey} libraries={MAPS_LIBRARIES}>
      <div
        className={
          'h-[200px] w-full rounded-[14px] overflow-hidden border border-border ' +
          (className || '')
        }
      >
        <Map
          defaultCenter={pos}
          defaultZoom={14}
          gestureHandling="greedy"
          disableDefaultUI
          mapId="address-picker"
        >
          <AdvancedMarker
            position={pos}
            draggable
            onDragEnd={(e) => {
              const lat = e.latLng?.lat()
              const lng = e.latLng?.lng()
              if (typeof lat === 'number' && typeof lng === 'number') {
                setPos({ lat, lng })
                onChange(lat, lng)
              }
            }}
          />
        </Map>
      </div>
    </APIProvider>
  )
}
