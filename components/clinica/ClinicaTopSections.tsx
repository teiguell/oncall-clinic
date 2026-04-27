import { useTranslations } from 'next-intl'
import { Check, X } from 'lucide-react'

/**
 * /clinica top sections (after hero) — server components composed.
 *
 *   StatsBar       — 4 KPIs (8% comisión, 96.8M turistas, €0 cuota, 2 días cobro)
 *   ProblemSolve   — 2 columns (Sin OnCall vs Con OnCall)
 *   Benefits       — 6 cards 3-col grid
 *   Calculator     — Bruto → Comisión → Neto + monthly/yearly range
 *
 * Combined to keep file count low (Phase 1 ship). Can be split if a
 * design refresh is needed in Round 16.
 */
export function ClinicaTopSections() {
  return (
    <>
      <StatsBar />
      <ProblemSolve />
      <Benefits />
      <Calculator />
    </>
  )
}

function StatsBar() {
  const t = useTranslations('clinicLanding.stats')
  const stats = [
    { v: t('commission.value'), l: t('commission.label') },
    { v: t('tourists.value'), l: t('tourists.label') },
    { v: t('fee.value'), l: t('fee.label') },
    { v: t('payout.value'), l: t('payout.label') },
  ]
  return (
    <section
      className="border-y border-slate-200 bg-white"
      style={{ padding: 'clamp(28px, 4vw, 44px) clamp(18px, 4vw, 56px)' }}
    >
      <div className="max-w-[1240px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4 text-center md:text-left">
        {stats.map((s, i) => (
          <div key={i} className="border-l border-slate-200 first:border-l-0 md:px-2 md:pl-6 first:md:pl-0">
            <div
              className="font-bold text-[#0B1220]"
              style={{ fontSize: 'clamp(28px, 3.2vw, 38px)', letterSpacing: '-0.02em' }}
            >
              {s.v}
            </div>
            <div className="text-slate-600 text-sm mt-1">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function ProblemSolve() {
  const t = useTranslations('clinicLanding.problem')
  const without = [t('without.items.0'), t('without.items.1'), t('without.items.2'), t('without.items.3')]
  const withUs = [t('with.items.0'), t('with.items.1'), t('with.items.2'), t('with.items.3')]
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

        <div className="mt-10 grid md:grid-cols-2 gap-4">
          <div
            className="bg-white border-l-4"
            style={{ borderLeftColor: '#DC2626', borderRadius: 14, padding: '24px 26px' }}
          >
            <div className="text-[#7F1D1D] font-semibold mb-3" style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {t('without.title')}
            </div>
            <ul className="space-y-3">
              {without.map((item, i) => (
                <li key={i} className="flex gap-3 text-slate-700 text-[15px]">
                  <X className="h-5 w-5 mt-0.5 text-red-500 flex-shrink-0" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div
            className="bg-white border-l-4"
            style={{ borderLeftColor: '#16A34A', borderRadius: 14, padding: '24px 26px' }}
          >
            <div className="text-[#14532D] font-semibold mb-3" style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {t('with.title')}
            </div>
            <ul className="space-y-3">
              {withUs.map((item, i) => (
                <li key={i} className="flex gap-3 text-slate-700 text-[15px]">
                  <Check className="h-5 w-5 mt-0.5 text-green-600 flex-shrink-0" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

function Benefits() {
  const t = useTranslations('clinicLanding.benefits')
  const items = [0, 1, 2, 3, 4, 5].map((i) => ({
    title: t(`items.${i}.title`),
    body: t(`items.${i}.body`),
  }))
  return (
    <section
      id="benefits"
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

        <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((b, i) => (
            <div
              key={i}
              className="bg-[#FAFBFC] border border-slate-200"
              style={{ borderRadius: 14, padding: '24px 22px' }}
            >
              <div
                className="font-semibold text-[#0B1220] mb-2"
                style={{ fontSize: 16, letterSpacing: '-0.01em' }}
              >
                {b.title}
              </div>
              <p className="text-slate-600 text-[14.5px] leading-relaxed">{b.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Calculator() {
  const t = useTranslations('clinicLanding.calculator')
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
        <p className="text-slate-600 mt-3 text-[16px]">{t('subtitle')}</p>

        <div
          className="mt-8 bg-white border border-slate-200 grid lg:grid-cols-[1fr_auto_1fr] gap-0 overflow-hidden"
          style={{ borderRadius: 16 }}
        >
          {/* Single consultation breakdown */}
          <div style={{ padding: '28px 28px' }}>
            <div className="text-slate-500 text-sm uppercase tracking-wider mb-4">
              €150 → €138
            </div>
            <Row label={t('rows.gross')} value="€150,00" />
            <Row label={t('rows.commission')} value="−€12,00" muted />
            <div className="border-t border-slate-200 mt-3 pt-3">
              <Row label={t('rows.net')} value="€138,00" bold />
            </div>
          </div>

          <div className="hidden lg:block w-px bg-slate-200" />

          {/* Monthly + yearly range — dark output card */}
          <div
            className="text-white"
            style={{
              padding: '28px 28px',
              background: 'linear-gradient(135deg, #1E1B4B 0%, #4F46E5 100%)',
            }}
          >
            <div className="text-white/70 text-sm uppercase tracking-wider mb-2">
              {t('month')}
            </div>
            <div className="font-bold" style={{ fontSize: 30, letterSpacing: '-0.02em' }}>
              {t('monthRange')}
            </div>
            <p className="text-white/75 text-[13.5px] mt-2">{t('monthBody')}</p>

            <div className="text-white/70 text-sm uppercase tracking-wider mb-2 mt-6">
              {t('year')}
            </div>
            <div className="font-bold" style={{ fontSize: 24, letterSpacing: '-0.02em' }}>
              {t('yearRange')}
            </div>
          </div>
        </div>

        <p className="text-slate-500 text-[13px] mt-4 leading-relaxed">{t('footnote')}</p>
      </div>
    </section>
  )
}

function Row({ label, value, muted, bold }: { label: string; value: string; muted?: boolean; bold?: boolean }) {
  return (
    <div className="flex justify-between items-baseline py-1.5">
      <span className={`text-[14.5px] ${muted ? 'text-slate-500' : 'text-slate-700'}`}>{label}</span>
      <span
        className={`${bold ? 'font-bold text-[#0B1220]' : muted ? 'text-slate-500' : 'text-[#0B1220] font-medium'}`}
        style={bold ? { fontSize: 22, letterSpacing: '-0.02em' } : undefined}
      >
        {value}
      </span>
    </div>
  )
}
