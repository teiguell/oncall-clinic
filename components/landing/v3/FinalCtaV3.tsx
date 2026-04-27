import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowRight, Phone, ShieldCheck, Lock, Star, Clock } from 'lucide-react'

/**
 * Final CTA — amber→orange gradient with white-glassmorphic trust pills.
 * Server component. Mirrors hero CTA layout but inverted color palette
 * for visual closure of the page.
 */
export function FinalCtaV3({ locale }: { locale: string }) {
  const t = useTranslations('landingV3.finalCta')
  return (
    <section
      className="relative overflow-hidden"
      style={{
        padding: 'clamp(56px, 8vw, 110px) clamp(22px, 6vw, 80px)',
        background: `
          radial-gradient(700px 400px at 80% 110%, rgba(245,158,11,.35), transparent 60%),
          radial-gradient(600px 500px at 0% 0%, rgba(251,146,60,.25), transparent 55%),
          linear-gradient(135deg, #FFF7E6 0%, #FED7AA 100%)
        `,
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(11,18,32,.08) 1px, transparent 0)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(80% 80% at 50% 50%, black, transparent)',
          WebkitMaskImage: 'radial-gradient(80% 80% at 50% 50%, black, transparent)',
        }}
      />

      <div className="relative max-w-[920px] mx-auto text-center">
        <div
          className="inline-flex items-center gap-2"
          style={{
            padding: '6px 14px',
            borderRadius: 999,
            background: 'rgba(255,255,255,.7)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(245,158,11,.3)',
            fontSize: 12.5,
            fontWeight: 600,
            color: '#92400E',
          }}
        >
          <span
            aria-hidden="true"
            className="rounded-full bg-amber-500"
            style={{ width: 6, height: 6 }}
          />
          {t('badge')}
        </div>

        <h2
          className="font-display text-balance"
          style={{
            margin: '18px 0 0',
            fontSize: 'clamp(36px, 5vw, 60px)',
            lineHeight: 1.02,
            letterSpacing: '-0.035em',
            fontWeight: 700,
            color: '#0B1220',
          }}
        >
          {t('title1')}
          <br />
          {t('title2')}
        </h2>
        <p
          className="mx-auto mt-4 text-[#78350F]"
          style={{
            maxWidth: 560,
            fontSize: 'clamp(16px, 1.4vw, 19px)',
            lineHeight: 1.5,
            textWrap: 'pretty' as React.CSSProperties['textWrap'],
          }}
        >
          {t('subtitle')}
        </p>

        <div className="mt-7 md:mt-9 flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link
            href={`/${locale}/patient/request`}
            className="inline-flex items-center justify-center gap-2.5 text-white font-bold w-full sm:w-auto"
            style={{
              height: 56,
              padding: '0 30px',
              borderRadius: 14,
              background: 'linear-gradient(135deg, #0B1220, #1E293B)',
              fontSize: 17,
              letterSpacing: '-0.01em',
              boxShadow: '0 14px 30px -10px rgba(11,18,32,.4)',
            }}
          >
            {t('ctaPrimary')}
            <ArrowRight className="h-[18px] w-[18px]" aria-hidden="true" />
          </Link>
          <a
            href={`tel:${t('phoneCta').replace(/\s/g, '')}`}
            className="inline-flex items-center justify-center gap-2 text-[#0B1220] font-semibold w-full sm:w-auto"
            style={{
              height: 56,
              padding: '0 24px',
              borderRadius: 14,
              background: 'rgba(255,255,255,.6)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(11,18,32,.1)',
              fontSize: 15.5,
              letterSpacing: '-0.01em',
            }}
          >
            <Phone className="h-[15px] w-[15px]" aria-hidden="true" />
            {t('phoneCta')}
          </a>
        </div>

        {/* Trust badges */}
        <div className="mt-8 md:mt-12 flex flex-wrap gap-2.5 md:gap-4 justify-center items-center">
          {[
            { icon: ShieldCheck, color: '#3B82F6', label: t('trustComib') },
            { icon: Lock, color: '#3B82F6', label: t('trustStripe') },
            { icon: Star, color: '#F59E0B', label: t('trustRating'), starFill: true },
            { icon: Clock, color: '#3B82F6', label: t('trust247') },
          ].map(({ icon: Icon, color, label, starFill }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 font-semibold text-[#0B1220]"
              style={{
                padding: '8px 14px',
                borderRadius: 999,
                background: 'rgba(255,255,255,.7)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(11,18,32,.06)',
                fontSize: 12.5,
              }}
            >
              <Icon
                className={`h-[13px] w-[13px] ${starFill ? 'fill-amber-400' : ''}`}
                style={{ color }}
                aria-hidden="true"
              />
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
