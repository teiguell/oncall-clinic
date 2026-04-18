import { create } from 'zustand'
import type { Consultation, ConsultationStatus } from '@/types'

interface ConsultationState {
  activeConsultation: Consultation | null
  consultations: Consultation[]
  doctorLocation: { lat: number; lng: number } | null
  isSearching: boolean

  setActiveConsultation: (c: Consultation | null) => void
  updateStatus: (id: string, status: ConsultationStatus) => void
  setDoctorLocation: (loc: { lat: number; lng: number } | null) => void
  setSearching: (searching: boolean) => void
  addConsultation: (c: Consultation) => void
  setConsultations: (cs: Consultation[]) => void
}

export const useConsultationStore = create<ConsultationState>((set) => ({
  activeConsultation: null,
  consultations: [],
  doctorLocation: null,
  isSearching: false,

  setActiveConsultation: (activeConsultation) => set({ activeConsultation }),
  updateStatus: (id, status) =>
    set((state) => ({
      activeConsultation:
        state.activeConsultation?.id === id
          ? { ...state.activeConsultation, status }
          : state.activeConsultation,
      consultations: state.consultations.map((c) =>
        c.id === id ? { ...c, status } : c
      ),
    })),
  setDoctorLocation: (doctorLocation) => set({ doctorLocation }),
  setSearching: (isSearching) => set({ isSearching }),
  addConsultation: (c) =>
    set((state) => ({ consultations: [c, ...state.consultations] })),
  setConsultations: (consultations) => set({ consultations }),
}))
