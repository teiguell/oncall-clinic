import { useTranslations } from 'next-intl'

const ITEM_COUNT = 5
const STATUS_COLORS: Record<string, { dot: string; bg: string; text: string }> = {
  active: { dot: '#10B981', bg: '#ECFDF5', text: '#065F46' },
  soon:   { dot: '#F59E0B', bg: '#FFFBEB', text: '#92400E' },
  future: { dot: '#3B82F6', bg: '#EFF6FF', text: '#1D4ED8' },
}

/**
 * /pro cities — Round 13 v3 design + Round 25-2 (Z-2) tourism pivot.
 *
 * Server component. 5 cards: Ibiza (Activo), Mallorca/Tenerife/Gran
 * Canaria+Fuerteventura (Q3/Q4 2026), and "+3 destinos" 2027 (Costa
 * del Sol / Costa Blanca / Formentera) as the 5th card. Mobile 2-col,
 * desktop 5-col.
 *
 * Round 25-2 swapped the original metro-list (Madrid/Barcelona/
 * Valencia/Sevilla/Málaga) for the Q5 tourism destinations to match
 * the cities pivot landed in Round 23-1. Doctors recruiting on this
 * page now see a roadmap that aligns with the user-facing /es/
 * medico-domicilio/[city] coverage.
 *
 * Status colors per design source: active=emerald, soon=amber,
 * future=blue. Active card gets a soft green→white linear background.
 */
export function CitiesGrid() {
  const t = useTranslations('proV3.cities')

  return (
    <section
      id="cities"
      className="bg-white"
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

        <ul
          className="grid gap-2.5 md:gap-3.5"
          style={{ gridTemplateColumns: 'repeat(2, 1fr)', listStyle: 'none', padding: 0, margin: 0 }}
        >
          <li className="contents md:hidden">
            {Array.from({ length: ITEM_COUNT }, (_, i) => (
              <CityCard key={i} index={i} t={t} />
            ))}
          </li>
          <li
            className="hidden md:grid md:gap-3.5"
            style={{ gridTemplateColumns: 'repeat(5, 1fr)', gridColumn: 'span 2' }}
          >
            {Array.from({ length: ITEM_COUNT }, (_, i) => (
              <CityCard key={i} index={i} t={t} />
            ))}
          </li>
        </ul>
      </div>
    </section>
  )
}

function CityCard({
  index,
  t,
}: {
  index: number
  t: ReturnType<typeof useTranslations>
}) {
  const status = t(`items.${index}.status`) as 'active' | 'soon' | 'future'
  const co = STATUS_COLORS[status] ?? STATUS_COLORS.future
  const isActive = status === 'active'
  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: isActive
          ? 'linear-gradient(165deg, white 0%, #F0FDF4 100%)'
          : 'white',
        border: `1px solid ${isActive ? '#BBF7D0' : '#EEF1F5'}`,
        borderRadius: 16,
        padding: 'clamp(16px, 1.5vw, 20px)',
      }}
    >
      <div
        className="inline-flex items-center gap-1.5 font-semibold mb-3"
        style={{
          background: co.bg,
          color: co.text,
          padding: '4px 10px',
          borderRadius: 999,
          fontSize: 11,
          letterSpacing: '0.2px',
        }}
      >
        <span
          className="rounded-full"
          aria-hidden="true"
          style={{ width: 6, height: 6, background: co.dot }}
        />
        {t(`items.${index}.label`)}
      </div>
      <div
        className="font-bold text-[#0B1220]"
        style={{ fontSize: 'clamp(18px, 1.6vw, 20px)', letterSpacing: '-0.6px' }}
      >
        {t(`items.${index}.name`)}
      </div>
      <div className="text-slate-500 mt-1 leading-[1.45]" style={{ fontSize: 12.5 }}>
        {t(`items.${index}.note`)}
      </div>
    </div>
  )
}
