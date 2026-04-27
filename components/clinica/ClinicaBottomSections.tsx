import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Check } from 'lucide-react'

/**
 * /clinica bottom sections — Requirements (6-item checklist) + Cities
 * (10 cards) + FAQ (6 details) + final CTA (indigo gradient + trust).
 *
 * The final CTA's primary button targets /clinic/register; secondary
 * targets /clinic/login. Both are public routes (excluded from the
 * Round 14 middleware bypass).
 */
export function ClinicaBottomSections({ locale }: { locale: string }) {
  return (
    <>
      <Requirements />
      <Cities />
      <FAQ />
      <FinalCTA locale={locale} />
    </>
  )
}

function Requirements() {
  const t = useTranslations('clinicLanding.requirements')
  const items = [0, 1, 2, 3, 4, 5].map((i) => t(`items.${i}`))
  return (
    <section
      className="bg-white"
      style={{ padding: 'clamp(64px, 8vw, 110px) clamp(18px, 4vw, 56px)' }}
    >
      <div className="max-w-[1080px] mx-auto">
        <h2
          className="font-bold text-[#0B1220]"
          style={{ fontSize: 'clamp(28px, 3.6vw, 44px)', letterSpacing: '-0.02em' }}
        >
          {t('title')}
        </h2>
        <p className="text-slate-600 mt-3 text-[16px]">{t('subtitle')}</p>

        <ul className="mt-8 grid md:grid-cols-2 gap-3">
          {items.map((item, i) => (
            <li
              key={i}
              className="flex gap-3 text-slate-700 bg-[#FAFBFC] border border-slate-200"
              style={{ padding: '14px 16px', borderRadius: 12, fontSize: 14.5 }}
            >
              <Check className="h-5 w-5 mt-0.5 text-green-600 flex-shrink-0" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Cities() {
  const t = useTranslations('clinicLanding.cities')
  // 10 cities pulled from i18n by index 0..9
  const cityIdx = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  return (
    <section
      className="bg-[#FAFBFC]"
      style={{ padding: 'clamp(64px, 8vw, 110px) clamp(18px, 4vw, 56px)' }}
    >
      <div className="max-w-[1240px] mx-auto">
        <h2
          className="font-bold text-[#0B1220]"
          style={{ fontSize: 'clamp(28px, 3.6vw, 44px)', letterSpacing: '-0.02em' }}
        >
          {t('title')}
        </h2>
        <p className="text-slate-600 mt-3 text-[16px]">{t('subtitle')}</p>

        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {cityIdx.map((i) => {
            const status = t(`items.${i}.status`) as 'active' | 'recruiting' | 'soon'
            const styles = {
              active: { bg: '#16A34A', label: t('labels.active') },
              recruiting: { bg: '#F59E0B', label: t('labels.recruiting') },
              soon: { bg: '#94A3B8', label: t('labels.soon') },
            }[status] ?? { bg: '#94A3B8', label: t('labels.soon') }
            return (
              <div
                key={i}
                className="bg-white border border-slate-200"
                style={{ padding: '16px 14px', borderRadius: 12 }}
              >
                <div
                  className="font-semibold text-[#0B1220]"
                  style={{ fontSize: 15, letterSpacing: '-0.01em' }}
                >
                  {t(`items.${i}.name`)}
                </div>
                <div
                  className="inline-flex items-center gap-1.5 mt-2"
                  style={{
                    fontSize: 11,
                    padding: '3px 8px',
                    borderRadius: 999,
                    background: 'rgba(0,0,0,0.04)',
                    color: '#475569',
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      display: 'inline-block',
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: styles.bg,
                    }}
                  />
                  {styles.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function FAQ() {
  const t = useTranslations('clinicLanding.faq')
  const items = [0, 1, 2, 3, 4, 5].map((i) => ({
    q: t(`items.${i}.q`),
    a: t(`items.${i}.a`),
  }))
  return (
    <section
      id="faq"
      className="bg-white"
      style={{ padding: 'clamp(64px, 8vw, 110px) clamp(18px, 4vw, 56px)' }}
    >
      <div className="max-w-[920px] mx-auto">
        <h2
          className="font-bold text-[#0B1220] mb-8"
          style={{ fontSize: 'clamp(28px, 3.6vw, 44px)', letterSpacing: '-0.02em' }}
        >
          {t('title')}
        </h2>

        <div className="space-y-3">
          {items.map((item, i) => (
            <details
              key={i}
              className="group bg-[#FAFBFC] border border-slate-200"
              style={{ borderRadius: 12 }}
              open={i === 0}
            >
              <summary
                className="cursor-pointer list-none flex justify-between items-center gap-4"
                style={{ padding: '18px 20px', fontSize: 16, fontWeight: 600, color: '#0B1220' }}
              >
                <span>{item.q}</span>
                <span
                  className="text-[#4F46E5] transition-transform group-open:rotate-45"
                  aria-hidden="true"
                  style={{ fontSize: 22, lineHeight: 1, fontWeight: 300 }}
                >
                  +
                </span>
              </summary>
              <div
                className="text-slate-600 leading-relaxed"
                style={{ padding: '0 20px 18px', fontSize: 14.5 }}
              >
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function FinalCTA({ locale }: { locale: string }) {
  const t = useTranslations('clinicLanding.ctaFinal')
  const trust = [t('trust.0'), t('trust.1'), t('trust.2'), t('trust.3')]
  return (
    <section
      style={{
        padding: 'clamp(72px, 9vw, 130px) clamp(18px, 4vw, 56px)',
        background:
          'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4F46E5 100%)',
      }}
    >
      <div className="max-w-[1000px] mx-auto text-center text-white">
        <h2
          className="font-bold tracking-tight"
          style={{ fontSize: 'clamp(32px, 4.4vw, 56px)', letterSpacing: '-0.025em', lineHeight: 1.1 }}
        >
          {t('title')}
        </h2>
        <p className="mt-4 text-white/80" style={{ fontSize: 'clamp(15px, 1.4vw, 18px)', maxWidth: 720, marginInline: 'auto' }}>
          {t('subtitle')}
        </p>

        <div className="mt-9 flex flex-wrap gap-3 justify-center">
          <Link
            href={`/${locale}/clinic/register`}
            className="inline-flex items-center justify-center font-semibold"
            style={{
              padding: '14px 26px',
              borderRadius: 12,
              background: 'white',
              color: '#1E1B4B',
              fontSize: 15.5,
              letterSpacing: '-0.2px',
              boxShadow: '0 12px 32px -10px rgba(0,0,0,0.55)',
              minHeight: 46,
            }}
          >
            {t('ctaPrimary')}
          </Link>
          <Link
            href={`/${locale}/clinic/login`}
            className="inline-flex items-center justify-center font-medium"
            style={{
              padding: '14px 22px',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.30)',
              background: 'rgba(255,255,255,0.04)',
              color: 'white',
              fontSize: 15.5,
              letterSpacing: '-0.2px',
              minHeight: 46,
            }}
          >
            {t('ctaSecondary')}
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 justify-center text-white/65 text-[13px]">
          {trust.map((t, i) => (
            <span key={i} className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.45)' }}
              />
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
