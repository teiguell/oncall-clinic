import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowRight, Phone, ShieldCheck, Lock, Clock, Star, Check } from 'lucide-react'
import { IPhoneMock } from './IPhoneMock'

/**
 * /v3 Hero — Med-Mediterranean trust palette.
 *
 * Server component. Mobile-first; iPhone mock collapses below the
 * copy block on screens <md, and sits to the right with -2deg rotation
 * + glow + floating badges on md+.
 *
 * Floating badges (desktop only):
 *  • "Dr. M. Ferrer · llega en 38 min" — left
 *  • "3 médicos cerca" — right
 */
export function HeroV3({ locale }: { locale: string }) {
  const t = useTranslations('landingV3.hero')
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: `
          radial-gradient(900px 500px at 88% -10%, rgba(245,158,11,.18), transparent 60%),
          radial-gradient(700px 600px at 0% 30%, rgba(59,130,246,.16), transparent 60%),
          linear-gradient(180deg, #FFFCF5 0%, #FAFBFC 60%)
        `,
      }}
    >
      {/* Subtle dot grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(11,18,32,.05) 1px, transparent 0)',
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(60% 60% at 50% 30%, black, transparent)',
          WebkitMaskImage: 'radial-gradient(60% 60% at 50% 30%, black, transparent)',
        }}
      />

      <div className="relative max-w-[1280px] mx-auto px-[22px] md:px-[80px] py-[32px] md:py-[72px] flex flex-col md:grid md:grid-cols-[1.05fr_.95fr] gap-[36px] md:gap-[56px] items-center">
        {/* Copy column */}
        <div>
          {/* Eyebrow */}
          <div
            className="inline-flex items-center gap-2 bg-white border border-slate-200 shadow-sm"
            style={{
              padding: '6px 12px 6px 8px',
              borderRadius: 999,
              fontSize: 12.5,
              fontWeight: 600,
              color: '#0B1220',
            }}
          >
            <span
              className="grid place-items-center text-white text-[11px]"
              style={{ width: 18, height: 18, borderRadius: 999, background: '#10B981' }}
              aria-hidden="true"
            >
              ●
            </span>
            {t('eyebrow')}
          </div>

          <h1
            className="font-display text-balance"
            style={{
              margin: '16px 0 0',
              fontSize: 'clamp(40px, 6vw, 68px)',
              lineHeight: 1.04,
              letterSpacing: '-0.035em',
              fontWeight: 700,
              color: '#0B1220',
            }}
          >
            {t('title1')}
            <br />
            {t('title2')}
          </h1>

          <p
            className="text-slate-600"
            style={{
              margin: '16px 0 0',
              fontSize: 'clamp(17px, 1.4vw, 21px)',
              lineHeight: 1.45,
              maxWidth: 520,
              textWrap: 'pretty' as React.CSSProperties['textWrap'],
            }}
          >
            {t('subtitle', {
              hours: t('subtitleHours'),
            })}
          </p>

          {/* CTA cluster */}
          <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <Link
              href={`/${locale}/patient/request`}
              className="inline-flex items-center justify-center gap-2.5 text-white font-bold"
              style={{
                height: 56,
                padding: '0 26px',
                borderRadius: 14,
                background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
                fontSize: 17,
                letterSpacing: '-0.01em',
                boxShadow:
                  '0 14px 30px -10px rgba(59,130,246,.55), 0 2px 0 rgba(255,255,255,.2) inset',
              }}
            >
              {t('ctaPrimary')}
              <ArrowRight className="h-[18px] w-[18px]" aria-hidden="true" />
            </Link>
            <a
              href={`tel:${t('phoneCta').replace(/\s/g, '')}`}
              className="inline-flex items-center justify-center gap-2 bg-white text-[#0B1220] font-semibold border border-slate-200"
              style={{
                height: 56,
                padding: '0 22px',
                borderRadius: 14,
                fontSize: 15.5,
                letterSpacing: '-0.01em',
              }}
            >
              <Phone className="h-[15px] w-[15px] text-[#3B82F6]" aria-hidden="true" />
              {t('phoneCta')}
            </a>
          </div>

          {/* Trust line */}
          <div className="mt-5 md:mt-8 flex flex-wrap items-center gap-2.5 md:gap-3.5 text-[12.5px] text-slate-500">
            <span className="inline-flex items-center gap-1 font-semibold text-[#0B1220]">
              <span className="inline-flex gap-px">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-[13px] w-[13px] fill-amber-400 text-amber-400" aria-hidden="true" />
                ))}
              </span>
              {t('trustRating')}
            </span>
            <Dot />
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-[13px] w-[13px] text-[#3B82F6]" aria-hidden="true" />
              {t('trustComib')}
            </span>
            <Dot />
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-[13px] w-[13px] text-[#3B82F6]" aria-hidden="true" />
              {t('trustStripe')}
            </span>
            <Dot />
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-[13px] w-[13px] text-[#3B82F6]" aria-hidden="true" />
              {t('trust247')}
            </span>
          </div>
        </div>

        {/* Phone column */}
        <div className="relative flex justify-center items-center">
          <div
            aria-hidden="true"
            className="absolute -inset-5 rounded-[60px]"
            style={{
              background: 'radial-gradient(50% 50% at 50% 50%, rgba(59,130,246,.18), transparent 70%)',
              filter: 'blur(20px)',
            }}
          />
          <div className="relative md:rotate-[-2deg]">
            <IPhoneMock />
            {/* Floating badges — desktop only */}
            <div
              className="hidden md:flex absolute items-center gap-2.5 bg-white shadow-[0_16px_30px_-10px_rgba(11,18,32,.18)]"
              style={{
                left: -42,
                bottom: 70,
                padding: '10px 14px',
                borderRadius: 14,
                transform: 'rotate(2deg)',
              }}
            >
              <div className="grid place-items-center w-9 h-9 rounded-full bg-emerald-50">
                <Check className="h-5 w-5 text-emerald-500" aria-hidden="true" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500">{t('floatingDoctor')}</div>
                <div className="text-[13.5px] font-bold text-[#0B1220]">{t('floatingEta')}</div>
              </div>
            </div>
            <div
              className="hidden md:flex absolute items-center gap-2 bg-white shadow-[0_16px_30px_-10px_rgba(11,18,32,.18)]"
              style={{
                right: -54,
                top: 50,
                padding: '8px 12px',
                borderRadius: 12,
                transform: 'rotate(3deg)',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <span
                className="rounded-full"
                style={{
                  width: 8,
                  height: 8,
                  background: '#10B981',
                  boxShadow: '0 0 0 4px rgba(16,185,129,.18)',
                }}
                aria-hidden="true"
              />
              {t('floatingNearby')}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Dot() {
  return (
    <span
      aria-hidden="true"
      className="inline-block bg-slate-300 rounded-full"
      style={{ width: 3, height: 3 }}
    />
  )
}
