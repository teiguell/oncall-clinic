import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Check } from 'lucide-react'
import { PhoneMockPro } from './PhoneMockPro'

/**
 * /pro hero — Round 13 v3 design.
 *
 * Server component. 2-col on md+ (copy left, doctor-app phone mock right);
 * stacks vertical on mobile (copy on top, phone scaled below).
 *
 * - Headline gradient on the third line ("Tus pacientes.")
 * - Floating "Pago recibido +€135 · Stripe" badge — desktop only
 * - Soft radial gradient blue (top-right) + amber (bottom-left)
 * - "ctaSecondary" smooth-scrolls to `#income-calculator` via the anchor.
 */
export function ProHero({
  locale,
  /**
   * Round 20 Q3-5: dynamic count of active doctors. Defaults to 9 (the
   * static value previously hardcoded in the badge text key) when the
   * parent doesn't pass a live count.
   */
  activeDoctors = 9,
}: {
  locale: string
  activeDoctors?: number
}) {
  const t = useTranslations('proV3.hero')
  const trustItems = [t('trustItems.0'), t('trustItems.1'), t('trustItems.2')]

  return (
    <section className="relative overflow-hidden">
      {/* Background — soft blue + amber radials */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(900px 500px at 85% -10%, rgba(59,130,246,0.07), transparent 60%),
            radial-gradient(700px 400px at 0% 100%, rgba(245,158,11,0.06), transparent 60%)
          `,
        }}
      />

      <div
        className="relative max-w-[1240px] mx-auto grid items-center gap-8 md:gap-16"
        style={{
          gridTemplateColumns: '1fr',
          padding: 'clamp(32px, 5vw, 72px) clamp(18px, 4vw, 56px) clamp(40px, 6vw, 80px)',
        }}
      >
        <div className="md:grid md:grid-cols-[1.05fr_0.95fr] md:gap-16 md:items-center">
          <div className="relative z-10 max-w-[640px]">
            {/* "NEW · Activo en Ibiza · Mallorca Q3 2026" badge */}
            <div
              className="inline-flex items-center gap-2 bg-white border border-slate-200 mb-5"
              style={{
                padding: '6px 12px 6px 8px',
                borderRadius: 999,
                fontSize: 12.5,
                fontWeight: 500,
                color: '#374151',
              }}
            >
              <span
                className="font-semibold text-emerald-500 bg-emerald-50"
                style={{
                  padding: '2px 8px',
                  borderRadius: 999,
                  fontSize: 11,
                  letterSpacing: '0.3px',
                }}
              >
                {t('badgeNew')}
              </span>
              {t('badgeText', { count: activeDoctors })}
            </div>

            <h1
              className="font-display text-balance"
              style={{
                fontSize: 'clamp(40px, 5.5vw, 62px)',
                lineHeight: 1.02,
                letterSpacing: '-2px',
                fontWeight: 700,
                color: '#0B1220',
                margin: 0,
              }}
            >
              {t('titleLine1')}
              <br />
              {t('titleLine2')}
              <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                {t('titleLine3')}
              </span>
              {/* Round 20A-FIX: keyword-rich SEO suffix (visually hidden,
                  indexed). Preserves the marketing visual while giving
                  Google a clear topic anchor for "médico domicilio Ibiza". */}
              <span className="sr-only">{t('seoSuffix')}</span>
            </h1>

            <p
              className="text-slate-500 mt-5 mb-7 max-w-[520px]"
              style={{
                fontSize: 'clamp(16px, 1.4vw, 18px)',
                lineHeight: 1.55,
                textWrap: 'pretty' as React.CSSProperties['textWrap'],
              }}
            >
              {t('subtitle')}
            </p>

            <div className="flex flex-wrap gap-3 mb-5">
              <Link
                href={`/${locale}/pro/registro`}
                className="inline-flex items-center justify-center text-white font-semibold"
                style={{
                  padding: '14px 22px',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  fontSize: 15,
                  letterSpacing: '-0.2px',
                  boxShadow:
                    '0 6px 18px -6px rgba(245,158,11,0.55), 0 1px 0 rgba(255,255,255,0.2) inset',
                  minHeight: 44,
                }}
              >
                {t('ctaPrimary')}
              </Link>
              <a
                href="#income-calculator"
                className="inline-flex items-center justify-center bg-white text-[#0B1220] font-semibold border border-slate-200"
                style={{
                  padding: '14px 22px',
                  borderRadius: 12,
                  fontSize: 15,
                  letterSpacing: '-0.2px',
                  minHeight: 44,
                }}
              >
                {t('ctaSecondary')}
              </a>
              {/* Round 25-4 (Z-4): tertiary anchor CTA jumps to the
                  B2B lead form at the bottom of the page. The form
                  was Q4-19 work; pre-Round-25 a doctor with questions
                  had to scroll the entire page to find it, and many
                  bounced before reaching it. The arrow signals the
                  in-page jump (smooth-scroll set globally in
                  globals.css). */}
              <a
                href="#contacto-pro"
                className="inline-flex items-center justify-center text-[#0B1220] font-medium hover:text-[#3B82F6] transition-colors"
                style={{
                  padding: '14px 18px',
                  fontSize: 14.5,
                  letterSpacing: '-0.2px',
                  minHeight: 44,
                }}
              >
                {t('ctaTertiary')}
              </a>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2.5 text-[13.5px] font-medium text-slate-700">
              {trustItems.map((it) => (
                <div key={it} className="inline-flex items-center gap-1.5">
                  <span
                    className="grid place-items-center text-emerald-500 bg-emerald-50 font-bold"
                    aria-hidden="true"
                    style={{ width: 18, height: 18, borderRadius: '50%', fontSize: 11 }}
                  >
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {it}
                </div>
              ))}
            </div>
          </div>

          {/* Phone column */}
          <div className="relative flex justify-center md:justify-end mt-12 md:mt-0">
            <div
              aria-hidden="true"
              className="absolute -inset-5 pointer-events-none"
              style={{
                background:
                  'radial-gradient(closest-side, rgba(59,130,246,.10), transparent 70%)',
                filter: 'blur(30px)',
              }}
            />
            <div className="relative" style={{ transform: 'scale(0.85)', transformOrigin: 'center' }}>
              <PhoneMockPro />
              {/* Floating Pago recibido card — desktop only */}
              <div
                className="hidden md:flex absolute items-center gap-2.5 bg-white border border-[#EEF1F5]"
                style={{
                  left: -8,
                  top: 60,
                  padding: '12px 14px',
                  borderRadius: 14,
                  boxShadow:
                    '0 18px 40px -16px rgba(11,18,32,.18), 0 4px 10px -4px rgba(11,18,32,.06)',
                  transform: 'rotate(-2deg)',
                }}
              >
                <div
                  className="grid place-items-center text-[16px] flex-shrink-0"
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: '#ECFDF5',
                  }}
                >
                  €
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.3px] font-semibold text-slate-500">
                    {t('floatingPagoLabel')}
                  </div>
                  <div className="text-[14px] font-bold tracking-[-0.2px]">
                    {t('floatingPagoValue')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
