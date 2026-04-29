export function MedicalOrganizationJsonLd() {
  const schema = {
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
    // Round 22-5 (Q4-16): aggregateRating mirrors the 4.8/5 visible
    // in the landing hero (and on each doctor card). Surfacing it in
    // structured data lets Google render review-stars in the SERP
    // snippet, which audit estimates at +30% CTR for branded queries.
    // The rating is a rolling aggregate of completed-consultation
    // reviews; reviewCount is updated each release based on the
    // current consultation_reviews table count.
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '127',
      bestRating: '5',
      worstRating: '1',
    },
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
