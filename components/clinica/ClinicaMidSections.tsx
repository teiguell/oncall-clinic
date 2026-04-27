import { useTranslations } from 'next-intl'
import { Check, X } from 'lucide-react'

/**
 * /clinica mid sections — How it works (4 horizontal steps) +
 * comparison table (6 rows: clínica sola vs con OnCall).
 *
 * Anchor: id="how-it-works" lives on this section so the hero "Ver cómo
 * funciona" CTA scrolls here.
 */
export function ClinicaMidSections() {
  return (
    <>
      <HowItWorks />
      <Comparison />
    </>
  )
}

function HowItWorks() {
  const t = useTranslations('clinicLanding.howItWorks')
  const steps = [0, 1, 2, 3].map((i) => ({
    n: i + 1,
    title: t(`steps.${i}.title`),
    body: t(`steps.${i}.body`),
  }))
  return (
    <section
      id="how-it-works"
      className="bg-white"
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

        <div className="mt-12 relative">
          {/* Desktop progress line — dashed, 75% reach to imply step 4 is the goal */}
          <div
            className="hidden md:block absolute left-[8.33%] right-[8.33%] top-7 border-t-2 border-dashed border-slate-200"
            aria-hidden="true"
          />
          <div className="grid md:grid-cols-4 gap-6 relative">
            {steps.map((s) => (
              <div key={s.n} className="text-center md:text-left">
                <div
                  className="grid place-items-center text-white font-bold mx-auto md:mx-0 mb-4 relative z-10"
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background:
                      'linear-gradient(135deg, #4F46E5 0%, #1E1B4B 100%)',
                    fontSize: 20,
                    boxShadow: '0 8px 22px -8px rgba(79,70,229,0.5)',
                  }}
                >
                  {s.n}
                </div>
                <div
                  className="font-semibold text-[#0B1220] mb-1.5"
                  style={{ fontSize: 17, letterSpacing: '-0.01em' }}
                >
                  {s.title}
                </div>
                <p className="text-slate-600 text-[14.5px] leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function Comparison() {
  const t = useTranslations('clinicLanding.comparison')
  const rows = [0, 1, 2, 3, 4, 5].map((i) => ({
    label: t(`rows.${i}.label`),
    alone: t(`rows.${i}.alone`),
    withUs: t(`rows.${i}.withUs`),
  }))
  return (
    <section
      className="bg-[#FAFBFC]"
      style={{ padding: 'clamp(64px, 8vw, 110px) clamp(18px, 4vw, 56px)' }}
    >
      <div className="max-w-[1080px] mx-auto">
        <h2
          className="font-bold text-[#0B1220]"
          style={{ fontSize: 'clamp(28px, 3.6vw, 44px)', letterSpacing: '-0.02em' }}
        >
          {t('title')}
        </h2>

        <div
          className="mt-8 bg-white border border-slate-200 overflow-hidden"
          style={{ borderRadius: 16 }}
        >
          <div className="grid grid-cols-[1.2fr_1fr_1fr] text-[14.5px]">
            <div
              className="font-semibold text-slate-500 uppercase tracking-wider"
              style={{ padding: '14px 18px', fontSize: 11.5 }}
            />
            <div
              className="font-semibold text-slate-500 uppercase tracking-wider border-l border-slate-200"
              style={{ padding: '14px 18px', fontSize: 11.5 }}
            >
              {t('headers.alone')}
            </div>
            <div
              className="font-semibold uppercase tracking-wider border-l border-slate-200"
              style={{
                padding: '14px 18px',
                fontSize: 11.5,
                color: '#1E1B4B',
                background: 'rgba(79,70,229,0.04)',
              }}
            >
              {t('headers.withUs')}
            </div>
            {rows.map((r, i) => (
              <RowGroup
                key={i}
                label={r.label}
                alone={r.alone}
                withUs={r.withUs}
                isLast={i === rows.length - 1}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function RowGroup({
  label,
  alone,
  withUs,
  isLast,
}: {
  label: string
  alone: string
  withUs: string
  isLast: boolean
}) {
  const borderClass = isLast ? '' : 'border-b border-slate-200'
  return (
    <>
      <div className={`text-slate-700 font-medium ${borderClass}`} style={{ padding: '14px 18px' }}>
        {label}
      </div>
      <div className={`text-slate-600 border-l ${borderClass} border-slate-200`} style={{ padding: '14px 18px' }}>
        <div className="flex gap-2 items-start">
          <X className="h-4 w-4 mt-0.5 text-red-400 flex-shrink-0" aria-hidden="true" />
          <span>{alone}</span>
        </div>
      </div>
      <div
        className={`text-[#0B1220] border-l ${borderClass} border-slate-200`}
        style={{ padding: '14px 18px', background: 'rgba(79,70,229,0.04)' }}
      >
        <div className="flex gap-2 items-start">
          <Check className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" aria-hidden="true" />
          <span>{withUs}</span>
        </div>
      </div>
    </>
  )
}
