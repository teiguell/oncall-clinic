import { useTranslations } from 'next-intl'
import { MapPin } from 'lucide-react'

// Round 10 — 10 launch cities. Ibiza is live; the other 9 are recruiting.
// City labels stay outside i18n because they're proper nouns identical
// across locales. The status pill ("Activo" / "Reclutando") IS translated.
const CITIES: { name: string; live: boolean }[] = [
  { name: 'Ibiza',          live: true },
  { name: 'Madrid',         live: false },
  { name: 'Barcelona',      live: false },
  { name: 'Valencia',       live: false },
  { name: 'Sevilla',        live: false },
  { name: 'Málaga',         live: false },
  { name: 'Bilbao',         live: false },
  { name: 'Palma',          live: false },
  { name: 'Alicante',       live: false },
  { name: 'San Sebastián',  live: false },
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

        <ul className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {CITIES.map(({ name, live }) => (
            <li
              key={name}
              className={`rounded-xl border p-4 flex flex-col items-center text-center transition-colors ${
                live
                  ? 'border-green-200 bg-green-50'
                  : 'border-slate-200 bg-white hover:border-amber-200'
              }`}
            >
              <MapPin
                className={`h-5 w-5 mb-2 ${live ? 'text-green-600' : 'text-slate-400'}`}
                aria-hidden="true"
              />
              <span className="text-[14px] font-semibold text-navy">{name}</span>
              <span
                className={`mt-1.5 text-[10px] uppercase tracking-wide font-semibold rounded-full px-2 py-0.5 ${
                  live
                    ? 'bg-green-600 text-white'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {live ? t('active') : t('recruiting')}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
