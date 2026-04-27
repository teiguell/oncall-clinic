import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowRight } from 'lucide-react'

/**
 * /pro final CTA — Round 13 v3 design.
 *
 * Dark navy gradient card centered in a white section, with two radial
 * gradient glows (amber top-right, blue bottom-left). Headline "Tu
 * primera visita esta semana." + outline secondary CTA "Hablar con el
 * equipo →".
 *
 * Plus a sticky mobile-only bottom bar that reads "Únete a OnCall ·
 * Empezar registro" — kept reachable while scrolling. The sticky bar
 * is hidden on md+.
 */
export function ProCTA({ locale }: { locale: string }) {
  const t = useTranslations('proV3.finalCta')
  const sticky = useTranslations('proV3').raw('stickyMobile') as string

  return (
    <>
      <section
        className="bg-white border-t border-[#EEF1F5]"
        style={{ padding: 'clamp(56px, 8vw, 100px) clamp(18px, 4vw, 56px) clamp(120px, 12vw, 100px)' }}
      >
        <div
          className="relative overflow-hidden mx-auto text-white"
          style={{
            maxWidth: 1080,
            background: 'linear-gradient(165deg, #0B1220 0%, #1F2937 100%)',
            borderRadius: 24,
            padding: 'clamp(36px, 5vw, 64px) clamp(24px, 4vw, 56px)',
          }}
        >
          <div
            aria-hidden="true"
            className="absolute pointer-events-none"
            style={{
              top: -100,
              right: -80,
              width: 360,
              height: 360,
              borderRadius: '50%',
              background:
                'radial-gradient(closest-side, rgba(245,158,11,0.25), transparent 70%)',
            }}
          />
          <div
            aria-hidden="true"
            className="absolute pointer-events-none"
            style={{
              bottom: -120,
              left: -60,
              width: 300,
              height: 300,
              borderRadius: '50%',
              background:
                'radial-gradient(closest-side, rgba(59,130,246,0.18), transparent 70%)',
            }}
          />
          <div className="relative max-w-[680px]">
            <div
              className="font-semibold uppercase tracking-[1.5px] text-amber-500 mb-4"
              style={{ fontSize: 12 }}
            >
              {t('eyebrow')}
            </div>
            <h2
              className="font-display text-balance"
              style={{
                fontSize: 'clamp(34px, 5vw, 52px)',
                fontWeight: 700,
                letterSpacing: '-1.6px',
                margin: 0,
                lineHeight: 1.04,
              }}
            >
              {t('title')}
            </h2>
            <p
              className="mt-4 text-white/65 max-w-[540px]"
              style={{ fontSize: 'clamp(15px, 1.4vw, 17px)', lineHeight: 1.55 }}
            >
              {t('subtitle')}
            </p>
            <div className="flex flex-wrap gap-3 mt-7">
              <Link
                href={`/${locale}/pro/registro`}
                className="inline-flex items-center justify-center text-white font-semibold"
                style={{
                  padding: '14px 22px',
                  borderRadius: 12,
                  background:
                    'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  fontSize: 15,
                  letterSpacing: '-0.2px',
                  boxShadow:
                    '0 6px 18px -6px rgba(245,158,11,0.55), 0 1px 0 rgba(255,255,255,0.2) inset',
                  minHeight: 44,
                }}
              >
                {t('ctaPrimary')}
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="inline-flex items-center justify-center text-white font-semibold border"
                style={{
                  padding: '14px 22px',
                  borderRadius: 12,
                  background: 'transparent',
                  borderColor: 'rgba(255,255,255,0.2)',
                  fontSize: 15,
                  minHeight: 44,
                }}
              >
                {t('ctaSecondary')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky mobile-only registration CTA. Hidden on md+. */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/92 backdrop-blur border-t border-[#EEF1F5] safe-area-bottom"
        style={{ padding: 14 }}
      >
        <Link
          href={`/${locale}/pro/registro`}
          className="inline-flex items-center justify-center gap-2 w-full text-white font-semibold"
          style={{
            padding: '16px 0',
            borderRadius: 12,
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            fontSize: 15,
            letterSpacing: '-0.2px',
            boxShadow:
              '0 6px 18px -6px rgba(245,158,11,0.55), 0 1px 0 rgba(255,255,255,0.2) inset',
            minHeight: 44,
          }}
        >
          {sticky}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </>
  )
}
