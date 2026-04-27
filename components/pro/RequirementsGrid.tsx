import { useTranslations } from 'next-intl'

const ITEM_COUNT = 6

/**
 * /pro requirements — Round 13 v3 design.
 *
 * Server component. 3-col grid on md+, 1-col on mobile. Each card has
 * a small "tag" icon (DOC / RC / RETA / MOV / 8h / ES) instead of a
 * Lucide glyph — this matches the v3 design's tag-style ID badges.
 * No hover lift on the server side; CSS hover is enough for the
 * subtle visual feedback the design specifies.
 */
export function RequirementsGrid() {
  const t = useTranslations('proV3.requirements')
  return (
    <section
      id="requirements"
      className="bg-[#FAFBFC]"
      style={{ padding: 'clamp(56px, 8vw, 100px) clamp(18px, 4vw, 56px)' }}
    >
      <div className="max-w-[1240px] mx-auto">
        <div className="max-w-[720px]" style={{ marginBottom: 'clamp(28px, 4vw, 44px)' }}>
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

        <div
          className="grid gap-3 md:gap-4"
          style={{ gridTemplateColumns: 'repeat(1, 1fr)' }}
        >
          <div className="contents md:hidden">
            {Array.from({ length: ITEM_COUNT }, (_, i) => (
              <ReqCard key={i} index={i} t={t} />
            ))}
          </div>
          <div
            className="hidden md:grid md:gap-4"
            style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
          >
            {Array.from({ length: ITEM_COUNT }, (_, i) => (
              <ReqCard key={i} index={i} t={t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function ReqCard({
  index,
  t,
}: {
  index: number
  t: ReturnType<typeof useTranslations>
}) {
  return (
    <div
      className="bg-white border border-[#EEF1F5] flex gap-3.5 items-start hover:border-[#3B82F6] hover:-translate-y-0.5 transition-[border-color,transform] duration-200"
      style={{ borderRadius: 18, padding: 22 }}
    >
      <div
        className="grid place-items-center bg-[#EFF6FF] text-[#1D4ED8] font-bold flex-shrink-0"
        style={{
          width: 42,
          height: 42,
          borderRadius: 11,
          fontSize: 11,
          letterSpacing: '-0.3px',
        }}
        aria-hidden="true"
      >
        {t(`items.${index}.tag`)}
      </div>
      <div>
        <div
          className="text-[#0B1220] font-semibold"
          style={{ fontSize: 15.5, letterSpacing: '-0.3px' }}
        >
          {t(`items.${index}.title`)}
        </div>
        <div
          className="text-slate-500 mt-1 leading-[1.5]"
          style={{ fontSize: 13.5 }}
        >
          {t(`items.${index}.desc`)}
        </div>
      </div>
    </div>
  )
}
