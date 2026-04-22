import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

/**
 * Booking store — holds booking state across page navigations.
 *
 * GDPR-aware persistence (see `partialize` below):
 *   ✅ PERSISTED to localStorage: non-medical context needed to resume a flow
 *       after a Magic Link redirect (doctor selection, consultation type,
 *       scheduled date). These are NOT special-category data.
 *   ❌ NOT PERSISTED: `location`, `coordinates`, `symptoms`, `phone`,
 *       `lastSubmission` — these are PII and/or health data (Art. 9 GDPR)
 *       and must live only in memory. If the user reloads mid-flow,
 *       they re-enter them.
 *
 * A TTL (1 hour) auto-clears the persisted slice so stale state doesn't
 * leak forward across sessions / days.
 */

const PERSIST_KEY = 'oncall-booking'
const PERSIST_TTL_MS = 60 * 60 * 1000 // 1 hour

interface BookingState {
  location: string
  coordinates: { lat: number; lng: number } | null
  symptoms: string
  phone: string
  consultationType: 'immediate' | 'scheduled' | null
  scheduledDate: string | null
  /** Doctor explicitly selected by the patient in step 1 (doctor-first flow). */
  selectedDoctorId: string | null
  selectedDoctorName: string | null
  /** Cached consultation price (in cents) of the selected doctor —
   *  so step 2 live-summary and step 3 order-summary can render it without
   *  re-querying Supabase. Set by DoctorSelector via onSelect callback. */
  selectedDoctorPrice: number | null
  selectedDoctorSpecialty: string | null
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
  /** Epoch ms when the persisted slice was last written. TTL-based eviction. */
  _persistedAt: number | null
  setLocation: (location: string, coords?: { lat: number; lng: number }) => void
  setSymptoms: (symptoms: string) => void
  setPhone: (phone: string) => void
  setConsultationType: (type: 'immediate' | 'scheduled') => void
  setScheduledDate: (date: string) => void
  setSelectedDoctor: (id: string | null, name: string | null, priceCents?: number | null, specialty?: string | null) => void
  setLastSubmission: (data: BookingState['lastSubmission']) => void
  reset: () => void
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      location: '',
      coordinates: null,
      symptoms: '',
      phone: '',
      consultationType: null,
      scheduledDate: null,
      selectedDoctorId: null,
      selectedDoctorName: null,
      selectedDoctorPrice: null,
      selectedDoctorSpecialty: null,
      lastSubmission: null,
      _persistedAt: null,
      setLocation: (location, coords) => set({ location, coordinates: coords || null }),
      setSymptoms: (symptoms) => set({ symptoms }),
      setPhone: (phone) => set({ phone }),
      setConsultationType: (consultationType) => set({ consultationType }),
      setScheduledDate: (scheduledDate) => set({ scheduledDate }),
      setSelectedDoctor: (selectedDoctorId, selectedDoctorName, priceCents, specialty) =>
        set({
          selectedDoctorId,
          selectedDoctorName,
          selectedDoctorPrice: typeof priceCents === 'number' ? priceCents : null,
          selectedDoctorSpecialty: specialty ?? null,
          _persistedAt: Date.now(),
        }),
      setLastSubmission: (lastSubmission) => set({ lastSubmission }),
      reset: () =>
        set({
          location: '',
          coordinates: null,
          symptoms: '',
          phone: '',
          consultationType: null,
          scheduledDate: null,
          selectedDoctorId: null,
          selectedDoctorName: null,
          selectedDoctorPrice: null,
          selectedDoctorSpecialty: null,
          lastSubmission: null,
          _persistedAt: null,
        }),
    }),
    {
      name: PERSIST_KEY,
      storage: createJSONStorage(() => localStorage),
      // Only persist non-medical context. Symptoms/location/phone stay in memory.
      partialize: (state) => ({
        consultationType: state.consultationType,
        scheduledDate: state.scheduledDate,
        selectedDoctorId: state.selectedDoctorId,
        selectedDoctorName: state.selectedDoctorName,
        selectedDoctorPrice: state.selectedDoctorPrice,
        selectedDoctorSpecialty: state.selectedDoctorSpecialty,
        _persistedAt: state._persistedAt,
      }),
      // TTL: drop state if older than 1 hour (stale sessions don't leak forward).
      onRehydrateStorage: () => (rehydrated) => {
        if (!rehydrated) return
        const ts = rehydrated._persistedAt
        if (typeof ts === 'number' && Date.now() - ts > PERSIST_TTL_MS) {
          // Clear stale slice — the store's reset is not available here,
          // so wipe localStorage directly.
          try {
            if (typeof window !== 'undefined') {
              window.localStorage.removeItem(PERSIST_KEY)
            }
          } catch {
            // noop
          }
        }
      },
    }
  )
)
