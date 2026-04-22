'use client'

import { useTranslations, useLocale } from 'next-intl'
import { Zap, Calendar, ShieldCheck, CheckCircle } from 'lucide-react'
import type { ConsultationType } from '@/types'

/**
 * Step 0 — Consultation Type (Urgent vs Scheduled).
 * Selecting a type advances to Step 1 automatically.
 */
export function Step0Type({
  type,
  onSelect,
}: {
  type: ConsultationType
  onSelect: (next: ConsultationType) => void
}) {
  const t = useTranslations('patient')
  const locale = useLocale()

  return (
    <div className="space-y-4">
      <div className="mb-6">
        {/* Availability eyebrow with pulsing green dot */}
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 mb-3">
          <span
            aria-hidden="true"
            className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 live-dot"
            style={{ boxShadow: '0 0 0 4px rgba(16,185,129,0.15)' }}
          />
          <span className="text-[11px] font-semibold tracking-[0.04em] text-emerald-700">
            {t('request.availabilityEyebrow')}
          </span>
        </div>
        <h2 className="text-[26px] font-bold tracking-[-0.7px] text-foreground leading-tight">
          {t('request.whatType')}
        </h2>
        <p className="text-muted-foreground text-sm mt-2">{t('request.whatTypeDesc')}</p>
      </div>

      {/* Urgent option */}
      <button
        type="button"
        onClick={() => onSelect('urgent')}
        className={`w-full p-4 rounded-2xl border text-left transition-all hover:shadow-md ${
          type === 'urgent' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border bg-card'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div className="h-[52px] w-[52px] rounded-[14px] bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Zap className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground text-[15.5px] tracking-tight">
                {t('request.urgent')}
              </h3>
              <span className="text-[9.5px] font-bold tracking-[0.04em] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                &lt; 20 MIN
              </span>
            </div>
            <p className="text-muted-foreground text-[12.5px] leading-snug mt-0.5">
              {t('request.urgentDesc')}
            </p>
            <span className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-emerald-500 live-dot"
                style={{ boxShadow: '0 0 0 3px rgba(16,185,129,0.15)' }}
              />
              {t('request.availableNow')}
            </span>
          </div>
          <div
            className={`h-[22px] w-[22px] rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all ${
              type === 'urgent' ? 'bg-primary border-primary' : 'border-border'
            }`}
            aria-hidden="true"
          >
            {type === 'urgent' && <CheckCircle className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
          </div>
        </div>
      </button>

      {/* Scheduled option */}
      <button
        type="button"
        onClick={() => onSelect('scheduled')}
        className={`w-full p-4 rounded-2xl border text-left transition-all hover:shadow-md ${
          type === 'scheduled' ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border bg-card'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div className="h-[52px] w-[52px] rounded-[14px] bg-gradient-to-br from-blue-50 to-blue-100 text-primary flex items-center justify-center flex-shrink-0">
            <Calendar className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-[15.5px] tracking-tight">
              {t('request.scheduled')}
            </h3>
            <p className="text-muted-foreground text-[12.5px] leading-snug mt-0.5">
              {t('request.scheduledDesc')}
            </p>
          </div>
          <div
            className={`h-[22px] w-[22px] rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all ${
              type === 'scheduled' ? 'bg-primary border-primary' : 'border-border'
            }`}
            aria-hidden="true"
          >
            {type === 'scheduled' && <CheckCircle className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
          </div>
        </div>
      </button>

      {/* Trust strip */}
      <div className="mt-4 p-3 px-3.5 bg-card rounded-xl border border-border flex items-center gap-2.5">
        <ShieldCheck className="h-[18px] w-[18px] text-emerald-600 flex-shrink-0" aria-hidden="true" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          {locale === 'en'
            ? 'Licensed doctors · Reimbursable by your insurer'
            : 'Médicos colegiados · Reembolso a tu aseguradora'}
        </p>
      </div>
    </div>
  )
}
