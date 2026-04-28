'use client'

import { useEffect, useRef } from 'react'

/**
 * DoctorPositionWatcher — Round 17-E client island.
 *
 * Mounts on the doctor's check-in page. Starts navigator.geolocation
 * .watchPosition with high-accuracy + 30 s maxAge, POSTs each update
 * to /api/consultations/[id]/location.
 *
 * Throttle: minimum 25 s between successful POSTs (in case the
 * watcher fires more frequently). Cleanup clears the watch on unmount
 * + stops the throttle timer.
 *
 * No UI rendered; this is a pure side-effect component. Place it as
 * a sibling to whatever active consultation screen the doctor has
 * open. Recommend mounting at the top of CheckOutPanel so the
 * tracker only runs while the visit is active.
 */
export function DoctorPositionWatcher({
  consultationId,
  enabled = true,
}: {
  consultationId: string
  enabled?: boolean
}) {
  const lastPostMs = useRef<number>(0)
  const inFlight = useRef(false)

  useEffect(() => {
    if (!enabled) return
    if (typeof navigator === 'undefined' || !navigator.geolocation) return

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now()
        if (inFlight.current) return
        if (now - lastPostMs.current < 25_000) return
        lastPostMs.current = now
        inFlight.current = true
        fetch(`/api/consultations/${consultationId}/location`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        })
          .catch((e) => {
            console.warn('[DoctorPositionWatcher] post failed', e)
          })
          .finally(() => {
            inFlight.current = false
          })
      },
      (err) => {
        console.warn('[DoctorPositionWatcher] geolocation error', err)
      },
      { enableHighAccuracy: true, maximumAge: 30_000, timeout: 60_000 },
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [consultationId, enabled])

  return null
}
