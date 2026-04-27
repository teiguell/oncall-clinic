import { useTranslations } from 'next-intl'

const STEP_COUNT = 4

/**
 * /pro registration steps — Round 13 v3 design.
 *
 * Server component. 4 steps in a 4-col grid on md+, single column on
 * mobile. A horizontal progress line behind the badges sits at 75 %
 * (3 of 4 done) — the 4th step ("Acepta tu primera visita") shows a
 * dashed border + muted color signaling "this is the goal, not yet
 * complete".
 *
 * Each step has a numbered badge, a tag-style time pill (⏱ 5 min /
 * 24-48 h / Inmediato), title and short description.
 */
export function RegistrationSteps() {
  const t = useTranslations('proV3.process')
  return (
    <section
      id="how-it-works"
      className="bg-white"
      style={{ padding: 'clamp(56px, 8vw, 100px) clamp(18px, 4vw, 56px)' }}
    >
      <div className="max-w-[1240px] mx-auto">
        <div className="max-w-[720px]" style={{ marginBottom: 'clamp(28px, 4vw, 48px)' }}>
          <div className="text-[12px] font-semibold uppercase tracking-[1px] text-[#3B82F6] mb-2.5">
            {t('kicker')}
          </div>
          <h2
            className="font-display text-balance"
            style={{
              fontSize: 'clamp(32px, 4.5vw, 46px)',
              fontWeight: 700,
              letterSpacing: '-1.4px',
              color: '#0B1220',
              margin: 0,
              lineHeight: 1.05,
            }}
          >
            {t('title')}
          </h2>
        </div>

        <div className="relative">
          {/* Progress line — desktop only. 75% blue → 25% slate dashed (the
              "your first visit" step is the goal, not complete). */}
          <div
            aria-hidden="true"
            className="hidden md:block absolute"
            style={{
              left: 32,
              right: 32,
              top: 28,
              height: 2,
              background:
                'linear-gradient(to right, #3B82F6 0%, #3B82F6 75%, #E5E7EB 75%)',
              borderRadius: 1,
            }}
          />
          <div
            className="grid gap-5 md:gap-6 relative"
            style={{ gridTemplateColumns: 'repeat(1, 1fr)' }}
          >
            <div className="contents md:hidden">
              {Array.from({ length: STEP_COUNT }, (_, i) => (
                <Step key={i} index={i} t={t} />
              ))}
            </div>
            <div
              className="hidden md:grid md:gap-6"
              style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
            >
              {Array.from({ length: STEP_COUNT }, (_, i) => (
                <Step key={i} index={i} t={t} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Step({
  index,
  t,
}: {
  index: number
  t: ReturnType<typeof useTranslations>
}) {
  // Steps 0-2 are "done" (filled blue), step 3 is "goal" (dashed border + muted).
  const isDone = index < STEP_COUNT - 1
  return (
    <div className="relative">
      <div
        className="grid place-items-center font-bold tracking-[-0.4px]"
        aria-hidden="true"
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: isDone
            ? 'linear-gradient(135deg, #3B82F6, #1D4ED8)'
            : 'white',
          border: isDone ? 'none' : '2px dashed #E5E7EB',
          color: isDone ? 'white' : '#6B7280',
          fontSize: 17,
          boxShadow: isDone ? '0 8px 18px -8px rgba(59,130,246,.5)' : 'none',
          marginBottom: 18,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {t(`steps.${index}.n`)}
      </div>
      <div
        className="inline-block bg-slate-100 font-semibold text-[#374151] mb-2.5"
        style={{
          fontSize: 11,
          padding: '3px 8px',
          borderRadius: 6,
          letterSpacing: '-0.1px',
        }}
      >
        ⏱ {t(`steps.${index}.time`)}
      </div>
      <h3
        className="text-[#0B1220] font-semibold m-0"
        style={{ fontSize: 17, letterSpacing: '-0.4px' }}
      >
        {t(`steps.${index}.title`)}
      </h3>
      <p
        className="text-slate-500 leading-[1.5] m-0 mt-1.5"
        style={{ fontSize: 14 }}
      >
        {t(`steps.${index}.desc`)}
      </p>
    </div>
  )
}
