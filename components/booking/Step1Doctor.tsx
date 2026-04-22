'use client'

import { useTranslations, useLocale } from 'next-intl'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DoctorSelector } from '@/components/doctor-selector'

/**
 * Step 1 — Doctor selection (doctor-first flow).
 * Renders the DoctorSelector and a floating CTA on mobile when a doctor
 * is picked. Desktop: inline CTA. Respects iOS safe-area.
 */
export function Step1Doctor({
  selectedDoctorId,
  selectedDoctorName,
  userLocation,
  onNext,
}: {
  selectedDoctorId: string | null
  selectedDoctorName: string | null
  userLocation: { lat: number; lng: number } | null
  onNext: () => void
}) {
  const t = useTranslations('patient')
  const tBooking = useTranslations('booking2')
  const locale = useLocale()

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-[26px] font-bold tracking-[-0.7px] text-foreground leading-tight">
          {t('request.chooseDoctor')}
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          {locale === 'en'
            ? 'Pick the doctor you prefer. You see their price and ETA upfront.'
            : 'Elige el médico que prefieras. Ves su precio y hora de llegada desde el principio.'}
        </p>
      </div>

      <DoctorSelector
        patientLat={userLocation?.lat || 38.9067}
        patientLng={userLocation?.lng || 1.4206}
      />

      {/* Floating CTA — fixed bottom on mobile, inline on desktop.
          Respects safe-area for iPhone notch. */}
      {selectedDoctorId ? (
        <div className="fixed bottom-0 left-0 right-0 md:static md:mt-6 p-4 md:p-0 bg-background/95 backdrop-blur-sm border-t md:border-0 z-40 safe-area-bottom">
          <Button
            type="button"
            className="w-full h-[54px] text-[15px] font-semibold btn-lift"
            onClick={onNext}
          >
            {tBooking('continueWith')} Dr. {(selectedDoctorName || '').split(' ')[0]}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      ) : (
        <div className="sticky bottom-0 -mx-4 px-4 py-3 bg-background/95 backdrop-blur-sm border-t mt-4">
          <Button type="button" className="w-full" size="xl" disabled>
            {t('request.noDoctorSelected')}
          </Button>
        </div>
      )}
      {/* Spacer so content isn't hidden behind the floating CTA on mobile */}
      {selectedDoctorId && <div className="h-20 md:h-0" aria-hidden="true" />}
    </div>
  )
}
