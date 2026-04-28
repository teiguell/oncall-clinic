/**
 * 10-city seed for programmatic SEO — Round 20-B / Q3-4.
 *
 * Generates `/[locale]/medico-domicilio/[city]/` pages (20 URLs total
 * = 10 cities × 2 locales). Each page renders a city-scoped landing
 * with H1 + meta + JSON-LD MedicalBusiness + FAQPage.
 *
 * The `slug` is URL-safe ASCII (Ibiza → 'ibiza', Málaga → 'malaga').
 * `name` is the display name with diacritics (Málaga, Sevilla).
 * `coordinates` and `province` populate the JSON-LD areaServed +
 * GeoCoordinates blocks for local SEO.
 *
 * `isLive` flag distinguishes:
 *   - true (Ibiza): doctors actively serve here
 *   - false (rest): "próximamente" / "coming soon" + recruiting waitlist
 *
 * Add more cities by appending entries here; sitemap + dynamic route
 * pick them up automatically via generateStaticParams.
 */

export interface City {
  slug: string
  name: { es: string; en: string }
  province: string
  region: string
  lat: number
  lng: number
  /** Approximate municipal population (for unique-content paragraph). */
  population: number
  /** True if doctors actively serve this city today. False = recruiting/coming soon. */
  isLive: boolean
}

export const CITIES: City[] = [
  {
    slug: 'ibiza',
    name: { es: 'Ibiza', en: 'Ibiza' },
    province: 'Illes Balears',
    region: 'Islas Baleares',
    lat: 38.9067,
    lng: 1.4206,
    population: 50_643,
    isLive: true,
  },
  {
    slug: 'mallorca',
    name: { es: 'Mallorca', en: 'Mallorca' },
    province: 'Illes Balears',
    region: 'Islas Baleares',
    lat: 39.6953,
    lng: 3.0176,
    population: 923_608,
    isLive: false,
  },
  {
    slug: 'madrid',
    name: { es: 'Madrid', en: 'Madrid' },
    province: 'Madrid',
    region: 'Comunidad de Madrid',
    lat: 40.4168,
    lng: -3.7038,
    population: 3_223_334,
    isLive: false,
  },
  {
    slug: 'barcelona',
    name: { es: 'Barcelona', en: 'Barcelona' },
    province: 'Barcelona',
    region: 'Cataluña',
    lat: 41.3851,
    lng: 2.1734,
    population: 1_620_343,
    isLive: false,
  },
  {
    slug: 'valencia',
    name: { es: 'Valencia', en: 'Valencia' },
    province: 'Valencia',
    region: 'Comunidad Valenciana',
    lat: 39.4699,
    lng: -0.3763,
    population: 791_413,
    isLive: false,
  },
  {
    slug: 'sevilla',
    name: { es: 'Sevilla', en: 'Seville' },
    province: 'Sevilla',
    region: 'Andalucía',
    lat: 37.3891,
    lng: -5.9845,
    population: 685_645,
    isLive: false,
  },
  {
    slug: 'malaga',
    name: { es: 'Málaga', en: 'Málaga' },
    province: 'Málaga',
    region: 'Andalucía',
    lat: 36.7213,
    lng: -4.4214,
    population: 579_076,
    isLive: false,
  },
  {
    slug: 'bilbao',
    name: { es: 'Bilbao', en: 'Bilbao' },
    province: 'Vizcaya',
    region: 'País Vasco',
    lat: 43.263,
    lng: -2.935,
    population: 346_405,
    isLive: false,
  },
  {
    slug: 'marbella',
    name: { es: 'Marbella', en: 'Marbella' },
    province: 'Málaga',
    region: 'Andalucía',
    lat: 36.5101,
    lng: -4.8825,
    population: 147_958,
    isLive: false,
  },
  {
    slug: 'alicante',
    name: { es: 'Alicante', en: 'Alicante' },
    province: 'Alicante',
    region: 'Comunidad Valenciana',
    lat: 38.3452,
    lng: -0.481,
    population: 339_375,
    isLive: false,
  },
]

export function getCity(slug: string): City | undefined {
  return CITIES.find((c) => c.slug === slug)
}

/**
 * Sister-cities helper — used in the internal-linking footer of each
 * city page so search engines see a cluster of related local pages.
 * Returns the 3 closest other cities by Haversine distance.
 */
export function getSisterCities(slug: string, n = 3): City[] {
  const me = getCity(slug)
  if (!me) return CITIES.slice(0, n)
  const EARTH = 6371
  const sorted = CITIES.filter((c) => c.slug !== me.slug)
    .map((c) => {
      const dLat = ((c.lat - me.lat) * Math.PI) / 180
      const dLng = ((c.lng - me.lng) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((me.lat * Math.PI) / 180) *
          Math.cos((c.lat * Math.PI) / 180) *
          Math.sin(dLng / 2) ** 2
      const km = 2 * EARTH * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      return { city: c, km }
    })
    .sort((a, b) => a.km - b.km)
    .map((x) => x.city)
  return sorted.slice(0, n)
}
