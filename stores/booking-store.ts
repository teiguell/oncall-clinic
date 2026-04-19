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
  /**
   * Last-submitted booking summary — populated right before the checkout
   * request is sent, so booking-success can render instantly with local
   * data while the server round-trip completes (optimistic UI).
   */
  lastSubmission: {
    serviceType: string
    type: string
    address: string
    symptoms: string
    submittedAt: string
  } | null
  setLocation: (location: string, coords?: { lat: number; lng: number }) => void
  setSymptoms: (symptoms: string) => void
  setPhone: (phone: string) => void
  setConsultationType: (type: 'immediate' | 'scheduled') => void
  setScheduledDate: (date: string) => void
  setLastSubmission: (data: BookingState['lastSubmission']) => void
  reset: () => void
}

export const useBookingStore = create<BookingState>((set) => ({
  location: '',
  coordinates: null,
  symptoms: '',
  phone: '',
  consultationType: null,
  scheduledDate: null,
  lastSubmission: null,
  setLocation: (location, coords) => set({ location, coordinates: coords || null }),
  setSymptoms: (symptoms) => set({ symptoms }),
  setPhone: (phone) => set({ phone }),
  setConsultationType: (consultationType) => set({ consultationType }),
  setScheduledDate: (scheduledDate) => set({ scheduledDate }),
  setLastSubmission: (lastSubmission) => set({ lastSubmission }),
  reset: () =>
    set({
      location: '',
      coordinates: null,
      symptoms: '',
      phone: '',
      consultationType: null,
      scheduledDate: null,
      lastSubmission: null,
    }),
}))
