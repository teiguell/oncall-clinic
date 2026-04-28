import { useTranslations } from 'next-intl'
import { Quote, Star } from 'lucide-react'

/**
 * ProTestimonial — Round 20 Q3-2.
 *
 * Single testimonial card on /pro between RegistrationSteps and
 * RequirementsGrid. Goal: social proof to nudge undecided doctors
 * past the wizard friction.
 *
 * Currently 1 quote; can grow to a 3-card carousel as more real
 * doctors come on board (post-alpha).
 *
 * R7: testimonial body is purely operational (schedule + income),
 * no clinical content.
 */
export function ProTestimonial() {
  const t = useTranslations('proV3.testimonial')
  return (
    <section
      className="bg-white"
      style={{ padding: 'clamp(56px, 7vw, 96px) clamp(18px, 4vw, 56px)' }}
    >
      <div className="max-w-[920px] mx-auto">
        <div
          className="relative bg-gradient-to-br from-slate-50 to-white border border-slate-200"
          style={{ padding: 'clamp(28px, 4vw, 44px)', borderRadius: 20 }}
        >
          <Quote
            className="absolute text-amber-300/60"
            style={{ top: 18, left: 20, width: 36, height: 36 }}
            aria-hidden="true"
          />

          <p
            className="font-display text-[#0B1220] leading-relaxed"
            style={{
              fontSize: 'clamp(18px, 2vw, 22px)',
              letterSpacing: '-0.01em',
              paddingLeft: 12,
              paddingTop: 26,
            }}
          >
            "{t('quote')}"
          </p>

          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-200">
            <div
              className="grid place-items-center text-white font-bold flex-shrink-0"
              aria-hidden="true"
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                fontSize: 18,
              }}
            >
              {t('initials')}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-[#0B1220] text-[14.5px]">
                {t('author')}
              </div>
              <div className="text-[12.5px] text-slate-500">{t('role')}</div>
            </div>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
