import { createServiceRoleClient } from '@/lib/supabase/service'

interface AggregateRating {
  ratingValue: string
  reviewCount: string
}

/**
 * Round 24-2 (Q4-D-2): pull the live aggregate from
 * `consultation_reviews` (is_public = true) so reviewCount + ratingValue
 * track reality, not the placeholder "127" we shipped in 22-5.
 *
 * Returns `null` when the count is below Google's 5-review minimum
 * for SERP star eligibility (Search Central → "Review snippet" docs).
 * In that case the JSON-LD omits `aggregateRating` entirely so we
 * don't get flagged for low-volume rating manipulation.
 *
 * Service-role client bypasses RLS for this read-only aggregate.
 * Errors degrade silently to `null` — the homepage must always
 * render.
 */
async function fetchAggregateRating(): Promise<AggregateRating | null> {
  try {
    const supabase = createServiceRoleClient()
    const { data, error } = await supabase
      .from('consultation_reviews')
      .select('rating')
      .eq('is_public', true)
    if (error || !data) return null
    const count = data.length
    if (count < 5) return null // Google requires ≥5 to show stars
    const sum = data.reduce((s, r) => s + (typeof r.rating === 'number' ? r.rating : 0), 0)
    const avg = sum / count
    // Format with one decimal — schema.org accepts both '4.6' and 4.6,
    // but string is the conservative default per Google examples.
    return {
      ratingValue: avg.toFixed(1),
      reviewCount: String(count),
    }
  } catch {
    return null
  }
}

export async function MedicalOrganizationJsonLd() {
  const aggregate = await fetchAggregateRating()
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    name: 'OnCall Clinic',
    description: 'Plataforma de médicos a domicilio en Ibiza. Home doctor service in Ibiza.',
    url: 'https://oncall.clinic',
    logo: 'https://oncall.clinic/logo.png',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Ibiza',
      addressRegion: 'Islas Baleares',
      addressCountry: 'ES',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 38.9067,
      longitude: 1.4206,
    },
    // Round 23-3 (Q5-4) tourism pivot: declare all 8 served regions.
    // City for actual cities (Ibiza, Mallorca, Tenerife, Gran Canaria,
    // Fuerteventura, Formentera) and AdministrativeArea for the costa
    // strips (Costa del Sol, Costa Blanca) which are coastal regions
    // spanning multiple municipalities. Mirrors lib/cities.ts.
    areaServed: [
      { '@type': 'City', name: 'Ibiza' },
      { '@type': 'City', name: 'Mallorca' },
      { '@type': 'City', name: 'Tenerife' },
      { '@type': 'City', name: 'Gran Canaria' },
      { '@type': 'City', name: 'Fuerteventura' },
      { '@type': 'AdministrativeArea', name: 'Costa del Sol' },
      { '@type': 'AdministrativeArea', name: 'Costa Blanca' },
      { '@type': 'City', name: 'Formentera' },
    ],
    availableLanguage: ['Spanish', 'English'],
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday',
        'Friday', 'Saturday', 'Sunday',
      ],
      opens: '00:00',
      closes: '23:59',
    },
  }

  // Round 24-2 (Q4-D-2): only include aggregateRating when the live
  // count is ≥5 (Google's threshold). Below that, omit the property —
  // the rest of the org schema still renders, but no SERP stars.
  if (aggregate) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: aggregate.ratingValue,
      reviewCount: aggregate.reviewCount,
      bestRating: '5',
      worstRating: '1',
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function FAQPageJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Cuánto tarda el médico en llegar?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'El tiempo estimado de llegada es desde 1 hora, dependiendo de la ubicación y disponibilidad del médico.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do you have English-speaking doctors?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, all our doctors in Ibiza speak English. Many also speak French and German.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Puedo pagar con tarjeta?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sí, aceptamos todas las tarjetas de crédito y débito a través de Stripe. No necesitas efectivo.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Necesito seguro médico?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. El pago es directo, sin necesidad de seguro médico. El precio incluye la visita completa.',
        },
      },
      {
        '@type': 'Question',
        name: '¿Está disponible las 24 horas?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sí, OnCall Clinic está disponible las 24 horas del día, los 7 días de la semana, los 365 días del año.',
        },
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
