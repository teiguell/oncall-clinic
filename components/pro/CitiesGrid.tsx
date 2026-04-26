import { useTranslations } from 'next-intl'
import { MapPin } from 'lucide-react'

/**
 * /pro cities — Round 11 Fix F.6 layout.
 *
 * 4 named cities (Ibiza live + Mallorca / Madrid / Barcelona Q3-Q4 2026)
 * plus a single "+6 ciudades 2027" tile so the page promises a roadmap
 * without committing to specific cities we haven't planned yet.
 */
type CityStatus = 'live' | 'soon' | 'roadmap'
type City = { name: string; status: CityStatus; eta?: string }

const CITIES: City[] = [
  { name: 'Ibiza',     status: 'live' },
  { name: 'Mallorca',  status: 'soon', eta: 'Q3 2026' },
  { name: 'Madrid',    status: 'soon', eta: 'Q4 2026' },
  { name: 'Barcelona', status: 'soon', eta: 'Q4 2026' },
]

export function CitiesGrid() {
  const t = useTranslations('pro.cities')
  return (
    <section id="cities" className="bg-white">
      <div className="container mx-auto px-4 py-16 md:py-20 max-w-5xl">
        <div className="text-center mb-12">
          <span className="inline-block text-[11px] uppercase tracking-[0.18em] font-semibold text-teal-700 mb-3">
            {t('overline')}
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-navy tracking-[-0.02em] text-balance">
            {t('title')}
          </h2>
          <p className="mt-3 text-base text-slate-600 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <ul className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CITIES.map(({ name, status, eta }) => {
            const isLive = status === 'live'
            return (
              <li
                key={name}
                className={`rounded-xl border p-4 flex flex-col items-center text-center transition-colors ${
                  isLive
                    ? 'border-green-200 bg-green-50'
                    : 'border-slate-200 bg-white hover:border-amber-200'
                }`}
              >
                <MapPin
                  className={`h-5 w-5 mb-2 ${isLive ? 'text-green-600' : 'text-slate-400'}`}
                  aria-hidden="true"
                />
                <span className="text-[14px] font-semibold text-navy">{name}</span>
                <span
                  className={`mt-1.5 text-[10px] uppercase tracking-wide font-semibold rounded-full px-2 py-0.5 ${
                    isLive
                      ? 'bg-green-600 text-white'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {isLive ? t('active') : eta || t('recruiting')}
                </span>
              </li>
            )
          })}
        </ul>

        {/* 2027 roadmap tile — single line spanning the grid */}
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-center">
          <span className="text-[13px] font-medium text-slate-500">
            {t('soon2027')}
          </span>
        </div>
      </div>
    </section>
  )
}
