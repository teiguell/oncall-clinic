import { useTranslations } from 'next-intl'
import { Star } from 'lucide-react'
import { SectionHeader } from './SectionHeader'

const ITEM_COUNT = 4

/**
 * Tourist testimonials — 4 cards with flag avatar + quote in source
 * language (UK/DE/FR). Server component.
 *
 * Reviews are illustrative. Numbers (4.8/5, 1.247 reseñas) are
 * directional — replace with real review-system aggregates when the
 * production review pipeline lands.
 */
export function TestimonialsV3() {
  const t = useTranslations('landingV3.testimonials')
  return (
    <section
      className="bg-[#FAFBFC]"
      style={{ padding: 'clamp(56px, 8vw, 110px) clamp(22px, 6vw, 80px)' }}
    >
      <div className="max-w-[1180px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <SectionHeader eyebrow={t('eyebrow')} title={t('title')} sub={t('subtitle')} />
          <div className="hidden md:flex items-center gap-3.5 text-[13px] text-slate-600">
            <span className="inline-flex gap-px">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
              ))}
            </span>
            <strong className="text-[#0B1220]">{t('ratingShort')}</strong>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 md:gap-5 mt-7 md:mt-12">
          {Array.from({ length: ITEM_COUNT }, (_, i) => (
            <article
              key={i}
              className="bg-white border border-[#EEF2F6] flex flex-col gap-3.5 shadow-[0_1px_0_rgba(11,18,32,.02),0_8px_30px_-16px_rgba(11,18,32,.08)]"
              style={{ borderRadius: 20, padding: 'clamp(22px, 3vw, 28px)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="grid place-items-center text-xl flex-shrink-0"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 999,
                    background: 'linear-gradient(135deg, #EEF4FF, #FFF7E6)',
                  }}
                  aria-hidden="true"
                >
                  {t(`items.${i}.flag`)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[15px] text-[#0B1220] truncate">
                    {t(`items.${i}.name`)}
                  </div>
                  <div className="text-[12.5px] text-slate-500 truncate">
                    {t(`items.${i}.where`)}
                  </div>
                </div>
                <div className="inline-flex gap-px flex-shrink-0">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                  ))}
                </div>
              </div>
              <p
                className="m-0 text-[#1E293B]"
                style={{ fontSize: 16, lineHeight: 1.55, textWrap: 'pretty' as React.CSSProperties['textWrap'] }}
              >
                &ldquo;{t(`items.${i}.quote`)}&rdquo;
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
