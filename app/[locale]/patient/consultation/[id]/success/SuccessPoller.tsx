'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Loader2, Clock, Phone } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ONCALL_PHONE_TEL } from '@/lib/format/phone'

/**
 * SuccessPoller — client component rendered when the consultation row
 * exists but payment_status is still 'pending' (webhook latency after
 * Stripe Checkout success redirect). Polls every 3s for up to 30s, then
 * shows a "still processing, contact us" fallback.
 */
export function SuccessPoller({
  consultationId,
  locale,
}: {
  consultationId: string
  locale: string
}) {
  const t = useTranslations('consultation.success')
  const router = useRouter()
  const [attempts, setAttempts] = useState(0)
  const maxAttempts = 10 // 10 × 3s = 30s budget

  useEffect(() => {
    if (attempts >= maxAttempts) return
    const supabase = createClient()
    const handle = setTimeout(async () => {
      const { data } = await supabase
        .from('consultations')
        .select('payment_status')
        .eq('id', consultationId)
        .maybeSingle()
      if (data?.payment_status === 'paid') {
        router.refresh()
      } else {
        setAttempts(a => a + 1)
      }
    }, 3000)
    return () => clearTimeout(handle)
  }, [attempts, consultationId, router])

  const exhausted = attempts >= maxAttempts

  return (
    <div className="space-y-6">
      <div className="mx-auto w-[84px] h-[84px] rounded-full bg-blue-50 flex items-center justify-center">
        {exhausted ? (
          <Clock className="h-10 w-10 text-blue-600" aria-hidden="true" />
        ) : (
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin" aria-hidden="true" />
        )}
      </div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {exhausted ? t('stillProcessingTitle') : t('processingTitle')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {exhausted ? t('stillProcessingDesc') : t('processingDesc')}
        </p>
      </div>
      {exhausted && (
        <>
          <a
            href={ONCALL_PHONE_TEL}
            className="inline-flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors min-h-[44px]"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            {t('callSupport')}
          </a>
          <a
            href={`/${locale}/patient/dashboard`}
            className="inline-flex items-center justify-center gap-2 w-full h-12 rounded-xl border border-border text-foreground font-medium hover:bg-muted transition-colors min-h-[44px]"
          >
            {t('backToDashboard')}
          </a>
        </>
      )}
    </div>
  )
}
