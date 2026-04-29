/**
 * Programmatic-SEO city seed — Round 23-1 (Q5-1) tourism pivot.
 *
 * Round 20-B originally seeded 10 generic Spanish cities (Madrid,
 * Barcelona, Sevilla, Bilbao, …). Strategic chat in Round 23 found
 * the product-market fit is **international tourism**, not residents
 * of Iberian metros — OnCall is "house call for tourists in Spain",
 * not "Doctolib generic". So we replaced the metro list with 8 high-
 * tourist-volume destinations: islands + costas. Old slugs are now
 * 301-redirected from `next.config.js` (see redirects map there).
 *
 * Generates `/[locale]/medico-domicilio/[city]` pages (16 URLs total,
 * 8 cities × 2 locales). Each page renders a city-scoped landing
 * with H1 + meta + JSON-LD MedicalBusiness + FAQPage + sister-cities
 * cluster.
 *
 * `slug` is URL-safe ASCII (e.g. `gran-canaria`, `costa-del-sol`).
 * `name` is the display name with diacritics. `lat/lng` populate the
 * GeoCoordinates JSON-LD block.
 *
 * `isLive` flag distinguishes:
 *   - true (Ibiza): doctors actively serve here
 *   - false (rest): "próximamente / coming soon" + recruiting waitlist
 *
 * Optional `zones`, `hotels`, `languagesExtra`, `eta` enrich the
 * landing copy — used by future hero / FAQ / "served zones" blocks.
 */

export interface City {
  slug: string
  name: { es: string; en: string }
  province: string
  region: string
  lat: number
  lng: number
  /** Approximate population (city, island, or coastal strip). */
  population: number
  /** True if doctors actively serve this city today. False = recruiting/coming soon. */
  isLive: boolean
  /** Optional hyperlocal zone names rendered on the landing. */
  zones?: string[]
  /** Optional notable hotels / resorts to anchor doctor-near-hotel SEO. */
  hotels?: string[]
  /** ISO 639-1 codes beyond ES + EN that local doctors commonly speak. */
  languagesExtra?: string[]
  /** Realistic ETA range string for the hero (e.g. "30-90 min"). */
  eta?: string
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
    zones: [
      'Ibiza ciudad',
      'Playa d\'en Bossa',
      'Sant Antoni',
      'Santa Eulària',
      'Talamanca',
      'Es Canar',
      'Cala Tarida',
    ],
    hotels: [
      'Ushuaïa Ibiza',
      'Hard Rock Hotel Ibiza',
      'Nobu Hotel Ibiza Bay',
      'Six Senses Ibiza',
      'Hotel Torre del Mar',
      'ME Ibiza',
    ],
    languagesExtra: ['DE', 'FR', 'IT', 'NL'],
    eta: '<60 min Ibiza urbana',
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
    zones: [
      'Palma',
      'Magaluf',
      'Alcúdia',
      'Cala d\'Or',
      'Pollença',
      'Sóller',
      'Port d\'Andratx',
    ],
    hotels: [
      'St. Regis Mardavall',
      'Jumeirah Port Soller',
      'Castillo Hotel Son Vida',
      'Cap Rocat',
      'Iberostar Grand Portals Nous',
      'Hotel Es Princep',
    ],
    languagesExtra: ['DE', 'EN', 'FR', 'IT'],
    eta: '30-90 min',
  },
  {
    slug: 'tenerife',
    name: { es: 'Tenerife', en: 'Tenerife' },
    province: 'Santa Cruz de Tenerife',
    region: 'Islas Canarias',
    lat: 28.2916,
    lng: -16.6291,
    population: 917_841,
    isLive: false,
    zones: [
      'Costa Adeje',
      'Playa de las Américas',
      'Los Cristianos',
      'Santa Cruz capital',
      'Puerto de la Cruz',
      'La Laguna',
    ],
    hotels: [
      'Bahía del Duque',
      'Iberostar Anthelia',
      'Hotel Botánico',
      'Royal Hideaway Corales',
      'Iberostar Heritage Grand Mencey',
      'Ritz-Carlton Abama',
    ],
    languagesExtra: ['EN', 'DE', 'NL', 'NO'],
    eta: '30-90 min',
  },
  {
    slug: 'gran-canaria',
    name: { es: 'Gran Canaria', en: 'Gran Canaria' },
    province: 'Las Palmas',
    region: 'Islas Canarias',
    lat: 27.9202,
    lng: -15.5474,
    population: 865_756,
    isLive: false,
    zones: [
      'Maspalomas',
      'Playa del Inglés',
      'Puerto Rico',
      'Las Palmas capital',
      'Mogán',
      'Meloneras',
    ],
    hotels: [
      'Lopesan Costa Meloneras',
      'Bohemia Suites & Spa',
      'Seaside Palm Beach',
      'Hotel Cordial Mogán Playa',
      'Sheraton Salobre',
      'Hotel Riu Palace Oasis',
    ],
    languagesExtra: ['EN', 'DE', 'NL', 'NO', 'SV'],
    eta: '30-90 min',
  },
  {
    slug: 'fuerteventura',
    name: { es: 'Fuerteventura', en: 'Fuerteventura' },
    province: 'Las Palmas',
    region: 'Islas Canarias',
    lat: 28.3587,
    lng: -14.0537,
    population: 119_732,
    isLive: false,
    zones: [
      'Corralejo',
      'Costa Calma',
      'Morro Jable',
      'Caleta de Fuste',
      'Jandía',
      'Puerto del Rosario',
    ],
    hotels: [
      'Gran Hotel Atlantis Bahía Real',
      'Iberostar Playa Gaviotas',
      'Robinson Club Esquinzo Playa',
      'Hotel Riu Palace Tres Islas',
      'H10 Tindaya',
      'Barceló Castillo Beach Resort',
    ],
    languagesExtra: ['EN', 'DE', 'NL'],
    eta: '30-90 min',
  },
  {
    slug: 'costa-del-sol',
    name: { es: 'Costa del Sol', en: 'Costa del Sol' },
    province: 'Málaga',
    region: 'Andalucía',
    lat: 36.5097,
    lng: -4.8826,
    // Coastal strip Málaga + Marbella + Estepona + Mijas + Fuengirola
    // + Torremolinos + Benalmádena. Approx. served population in the
    // tourism-heavy strip is ~600 000.
    population: 600_000,
    isLive: false,
    zones: [
      'Marbella',
      'Puerto Banús',
      'Estepona',
      'Mijas',
      'Fuengirola',
      'Torremolinos',
      'Benalmádena',
      'Málaga capital',
      'Nerja',
    ],
    hotels: [
      'Marbella Club',
      'Puente Romano Beach Resort',
      'Don Carlos Resort',
      'Anantara Villa Padierna',
      'Kempinski Hotel Bahía',
      'Gran Hotel Miramar Málaga',
    ],
    languagesExtra: ['EN', 'DE', 'FR', 'RU', 'AR'],
    eta: '30-90 min',
  },
  {
    slug: 'costa-blanca',
    name: { es: 'Costa Blanca', en: 'Costa Blanca' },
    province: 'Alicante',
    region: 'Comunidad Valenciana',
    lat: 38.3452,
    lng: -0.481,
    // Coastal strip Alicante + Benidorm + Calpe + Altea + Jávea +
    // Dénia + Torrevieja + Orihuela Costa. Approx. served population
    // is ~700 000.
    population: 700_000,
    isLive: false,
    zones: [
      'Benidorm',
      'Alicante capital',
      'Calpe',
      'Altea',
      'Jávea',
      'Dénia',
      'Torrevieja',
      'Orihuela Costa',
    ],
    hotels: [
      'Gran Hotel Bali Benidorm',
      'Hotel Meliá Villaitana',
      'Hospes Amerigo Alicante',
      'Hotel SH Villa Gadea',
      'Hotel Riu Palace Bonanza Playa',
    ],
    languagesExtra: ['EN', 'NL', 'NO', 'DE'],
    eta: '30-90 min',
  },
  {
    slug: 'formentera',
    name: { es: 'Formentera', en: 'Formentera' },
    province: 'Illes Balears',
    region: 'Islas Baleares',
    lat: 38.7135,
    lng: 1.4339,
    population: 12_216,
    isLive: false,
    zones: [
      'La Savina',
      'Es Pujols',
      'Sant Francesc',
      'Migjorn',
      'Cala Saona',
    ],
    hotels: [
      'Hotel Cala Saona',
      'Hotel Es Marès',
      'Gecko Hotel & Beach Club',
      'Five Flowers Hotel',
      'Hotel Bocchoris',
    ],
    languagesExtra: ['EN', 'IT', 'DE', 'FR'],
    // Ferry from Ibiza adds ~30 min + crossing time to the doctor's ETA
    eta: '60-120 min (incluye ferry desde Ibiza)',
  },
]

export function getCity(slug: string): City | undefined {
  return CITIES.find((c) => c.slug === slug)
}

/**
 * Sister-cities helper — used in the internal-linking footer of each
 * city page so search engines see a cluster of related local pages.
 * Returns the 3 closest other cities by Haversine distance.
 *
 * Edge case: only 8 cities total + Canary islands far from peninsular
 * coastas (~1500 km), so for a Canary slug the "closest 3" includes
 * the other Canaries first (good cluster) and then the Balearic
 * islands (Mallorca/Ibiza/Formentera). For peninsula slugs (Costa
 * del Sol, Costa Blanca) the Balearics come first. That's fine for
 * SEO clustering — every page links to 3 others, no orphans.
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
