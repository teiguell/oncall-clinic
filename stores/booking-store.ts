import { create } from 'zustand'

/**
 * Booking store — holds in-memory booking state so the user can fill steps 1-3
 * (location, symptoms, type) BEFORE signing in. On step 4 (payment) an auth
 * modal takes over; once authenticated, this store hands the data to the
 * checkout API.
 *
 * NOT persisted to localStorage (medical data, GDPR) — lives only for the
 * duration of the session.
 */

interface BookingState {
  location: string
  coordinates: { lat: number; lng: number } | null
  symptoms: string
  phone: string
  consultationType: 'immediate' | 'scheduled' | null
  scheduledDate: string | null
  setLocation: (location: string, coords?: { lat: number; lng: number }) => void
  setSymptoms: (symptoms: string) => void
  setPhone: (phone: string) => void
  setConsultationType: (type: 'immediate' | 'scheduled') => void
  setScheduledDate: (date: string) => void
  reset: () => void
}

export const useBookingStore = create<BookingState>((set) => ({
  location: '',
  coordinates: null,
  symptoms: '',
  phone: '',
  consultationType: null,
  scheduledDate: null,
  setLocation: (location, coords) => set({ location, coordinates: coords || null }),
  setSymptoms: (symptoms) => set({ symptoms }),
  setPhone: (phone) => set({ phone }),
  setConsultationType: (consultationType) => set({ consultationType }),
  setScheduledDate: (scheduledDate) => set({ scheduledDate }),
  reset: () =>
    set({
      location: '',
      coordinates: null,
      symptoms: '',
      phone: '',
      consultationType: null,
      scheduledDate: null,
    }),
}))
