import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Profile } from '@/types'

/**
 * Auth store — currently DEAD CODE (zero importers across the repo as of
 * Round 6). Kept for future use if/when we move from server-validated
 * sessions back to a client-cached profile.
 *
 * Round 6 (2026-04-25) hardening — even though no component subscribes
 * today, the prior config was a textbook hydration footgun:
 *   - persist() defaults to localStorage with auto-rehydrate on import
 *   - SSR has no localStorage → user = null, isLoading = true
 *   - First CSR render rehydrates from localStorage → user = {...}
 *   - Same anti-pattern that bit booking-store.ts in Round 3
 *
 * Fix: SSR returns a noop storage (zero read/write on server), CSR
 * returns real localStorage. Identical defaults SSR vs first-CSR render
 * → no #418 even if a component starts subscribing tomorrow.
 */
interface AuthState {
  user: Profile | null
  isLoading: boolean
  setUser: (user: Profile | null) => void
  setLoading: (loading: boolean) => void
  signOut: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      signOut: () => set({ user: null }),
    }),
    {
      name: 'oncall-auth',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          }
        }
        return localStorage
      }),
      partialize: (state) => ({ user: state.user }),
    }
  )
)
