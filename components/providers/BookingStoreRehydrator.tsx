'use client'

import { useEffect } from 'react'
import { useBookingStore } from '@/stores/booking-store'

/**
 * BookingStoreRehydrator — tiny client-only helper that rehydrates the
 * persisted booking store AFTER the component mounts on the client.
 *
 * Required because `booking-store.ts` uses `skipHydration: true` to avoid
 * React hydration mismatches (#418). With that flag, Zustand doesn't read
 * localStorage on its own — we trigger it here, inside a useEffect, so
 * the read happens strictly on the client after the initial paint.
 *
 * Mount this once somewhere in the tree below /[locale]/layout.tsx. It
 * renders nothing.
 */
export function BookingStoreRehydrator() {
  useEffect(() => {
    // zustand exposes persist.rehydrate on the store itself
    void useBookingStore.persist.rehydrate()
  }, [])
  return null
}
