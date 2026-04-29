import Link from 'next/link'
import { useTranslations } from 'next-intl'

/**
 * /clinica hero — Round 15 B2B clinic landing.
 *
 * Indigo gradient (#1E1B4B → #4F46E5) per Director's spec. Server
 * component. Title shows three lines with the third gradient-filled.
 * Two CTAs: primary (indigo) + secondary (ghost).
 */
export function ClinicaHero({ locale }: { locale: string }) {
  const t = useTranslations('clinicLanding.hero')

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, #1E1B4B 0%, #312E81 35%, #4F46E5 100%)',
        color: 'white',
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(900px 500px at 85% -10%, rgba(255,255,255,0.06), transparent 60%),
            radial-gradient(700px 400px at 0% 110%, rgba(255,255,255,0.04), transparent 60%)
          `,
        }}
      />

      <div
        className="relative max-w-[1240px] mx-auto"
        style={{
          padding:
            'clamp(48px, 7vw, 110px) clamp(18px, 4vw, 56px) clamp(56px, 8vw, 130px)',
        }}
      >
        <div
          className="inline-flex items-center gap-2 mb-6"
          style={{
            padding: '6px 14px 6px 12px',
            borderRadius: 999,
            fontSize: 11.5,
            letterSpacing: '0.18em',
            background: 'rgba(255,255,255,0.10)',
            border: '1px solid rgba(255,255,255,0.18)',
            color: 'rgba(255,255,255,0.95)',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          {t('badge')}
        </div>

        <h1
          className="font-bold tracking-tight"
          style={{
            fontSize: 'clamp(40px, 6vw, 72px)',
            lineHeight: 1.05,
            letterSpacing: '-0.025em',
            maxWidth: 920,
          }}
        >
          <span className="block">{t('title1')}</span>
          <span className="block">{t('title2')}</span>
          <span
            className="block"
            style={{
              backgroundImage:
                'linear-gradient(90deg, #FCD34D 0%, #FBBF24 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('title3')}
          </span>
          {/* Round 20A-FIX: keyword-rich SEO suffix (visually hidden,
              indexed by search engines). Preserves the marketing visual
              while giving Google a clear topic anchor. */}
          <span className="sr-only">{t('seoSuffix')}</span>
        </h1>

        <p
          className="mt-6 text-white/80"
          style={{
            fontSize: 'clamp(16px, 1.4vw, 19px)',
            lineHeight: 1.55,
            maxWidth: 720,
          }}
        >
          {t('subtitle')}
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            href={`/${locale}/clinic/register`}
            className="inline-flex items-center justify-center font-semibold"
            style={{
              padding: '14px 22px',
              borderRadius: 12,
              background: 'white',
              color: '#1E1B4B',
              fontSize: 15,
              letterSpacing: '-0.2px',
              boxShadow:
                '0 10px 28px -10px rgba(0,0,0,0.45), 0 1px 0 rgba(0,0,0,0.05) inset',
              minHeight: 44,
            }}
          >
            {t('ctaPrimary')}
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center font-medium"
            style={{
              padding: '14px 20px',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.30)',
              background: 'rgba(255,255,255,0.04)',
              color: 'white',
              fontSize: 15,
              letterSpacing: '-0.2px',
              minHeight: 44,
            }}
          >
            {t('ctaSecondary')}
          </a>
          {/* Round 25-4 (Z-4): tertiary anchor CTA — clinic admins
              with questions about the program jump to the B2B form
              at the bottom of the page (Round 22-7 work) instead of
              having to scroll past every section. */}
          <a
            href="#contacto-clinica"
            className="inline-flex items-center justify-center font-medium hover:text-white"
            style={{
              padding: '14px 18px',
              fontSize: 14.5,
              letterSpacing: '-0.2px',
              color: 'rgba(255,255,255,0.8)',
              minHeight: 44,
            }}
          >
            {t('ctaTertiary')}
          </a>
        </div>
      </div>
    </section>
  )
}
