// content.jsx — ES/EN copy dictionaries
const COPY = {
  es: {
    nav: { brand: 'OnCall Clinic', lang: 'ES' },
    hero: {
      eyebrow: 'IBIZA · BALEARES',
      title: 'Tu médico,\ndonde estés.',
      sub: 'Médicos verificados a domicilio en Ibiza. Desde 1 hora.',
      cta: 'Solicitar médico',
      ctaSub: 'Respuesta en ~12 min',
      trust: ['Médicos colegiados', 'Seguro RC', 'Pago seguro'],
    },
    how: {
      kicker: 'Cómo funciona',
      title: 'Tres pasos. Sin papeleo.',
      steps: [
        { n: '01', t: 'Describe los síntomas', d: 'Cuéntanos qué sientes en menos de un minuto.' },
        { n: '02', t: 'Elige tu médico', d: 'Ve perfiles verificados, tiempos de llegada y tarifas.' },
        { n: '03', t: 'El médico llega', d: 'Llega a tu hotel, villa o casa. Pago tras la visita.' },
      ],
    },
    services: {
      kicker: 'Servicios',
      title: 'Atención clínica a domicilio.',
      items: [
        { t: 'Medicina General', d: 'Consulta, diagnóstico y receta.', price: 'Desde €150', active: true },
        { t: 'Pediatría', d: 'Niños y lactantes, 24/7.', price: 'Próximamente', active: false },
        { t: 'Fisioterapia', d: 'Sesiones en tu alojamiento.', price: 'Próximamente', active: false },
        { t: 'Enfermería', d: 'Curas, inyecciones y sueros.', price: 'Próximamente', active: false },
      ],
    },
    doctors: {
      kicker: 'Equipo médico',
      title: 'Profesionales colegiados, cerca de ti.',
      eta: '~12 min',
      verified: 'Verificado',
      book: 'Reservar',
      list: [
        { name: 'Dra. Elena Marí', spec: 'Medicina General · 14 años', rating: 4.98, reviews: 312, eta: '~8 min', langs: 'ES · EN · CA' },
        { name: 'Dr. Marc Dubois', spec: 'Medicina Interna · 11 años', rating: 4.96, reviews: 208, eta: '~14 min', langs: 'FR · EN · ES' },
        { name: 'Dra. Sofia Romano', spec: 'Medicina Familiar · 9 años', rating: 4.95, reviews: 187, eta: '~18 min', langs: 'IT · EN · ES' },
      ],
    },
    trust: {
      kicker: 'Qué incluye',
      title: 'Transparencia total.',
      inc: {
        t: 'Incluido en la visita',
        items: ['Consulta presencial', 'Receta electrónica', 'Informe médico PDF', 'Seguimiento 48h'],
      },
      exc: {
        t: 'No incluido',
        items: ['Urgencias vitales → 112', 'Ingresos hospitalarios', 'Pruebas de imagen', 'Cirugía'],
        cta: 'Urgencia vital: llama al 112',
      },
    },
    faq: {
      kicker: 'Preguntas',
      title: 'Lo que suelen preguntarnos.',
      items: [
        { q: '¿Cuánto tarda el médico en llegar?', a: 'El tiempo medio es de 45–60 minutos en Ibiza ciudad, Playa d’en Bossa y San Antonio. En zonas rurales, hasta 90 min.' },
        { q: '¿Cómo se paga?', a: 'Pago seguro con tarjeta tras la visita. Emitimos factura para tu seguro de viaje.' },
        { q: '¿Trabajáis con seguros privados?', a: 'Sí, facilitamos todos los documentos para reembolso (Allianz, AXA, Mapfre, IMG, Cigna y más).' },
        { q: '¿Atendéis en hoteles y villas?', a: 'Sí. Cubrimos toda la isla de Ibiza, incluyendo hoteles, villas, barcos en puerto y apartamentos.' },
        { q: '¿Hay servicio nocturno?', a: 'Sí, 24/7 los 365 días. Recargo nocturno de 22h a 8h.' },
        { q: '¿Qué pasa en una emergencia?', a: 'Si es una emergencia vital, llama inmediatamente al 112. No somos un servicio de urgencias.' },
      ],
    },
    finalCta: {
      title: '¿Necesitas un médico?',
      sub: 'Disponibles 24/7 en toda la isla.',
      cta: 'Solicitar médico ahora',
      or: 'o llámanos',
      phone: '+34 971 000 000',
    },
    footer: {
      brand: 'OnCall Clinic',
      company: 'Ibiza Care SL · CIF B19973569',
      addr: 'Avenida de España 37, 07800 Ibiza',
      links: ['Aviso legal', 'Privacidad', 'Cookies', 'Términos', 'RGPD'],
      copy: '© 2026 Ibiza Care SL. Todos los derechos reservados.',
    },
  },
  en: {
    nav: { brand: 'OnCall Clinic', lang: 'EN' },
    hero: {
      eyebrow: 'IBIZA · BALEARIC ISLANDS',
      title: 'Your doctor,\nwherever you are.',
      sub: 'Verified doctors, house calls across Ibiza. From 1 hour.',
      cta: 'Request a doctor',
      ctaSub: 'Reply in ~12 min',
      trust: ['Licensed physicians', 'Liability insured', 'Secure payment'],
    },
    how: {
      kicker: 'How it works',
      title: 'Three steps. No paperwork.',
      steps: [
        { n: '01', t: 'Describe your symptoms', d: 'Tell us what’s wrong in under a minute.' },
        { n: '02', t: 'Choose your doctor', d: 'See verified profiles, ETAs and transparent fees.' },
        { n: '03', t: 'The doctor arrives', d: 'They come to your hotel, villa or home. Pay after the visit.' },
      ],
    },
    services: {
      kicker: 'Services',
      title: 'Clinical care at your door.',
      items: [
        { t: 'General Medicine', d: 'Consultation, diagnosis and prescription.', price: 'From €150', active: true },
        { t: 'Pediatrics', d: 'Children and infants, 24/7.', price: 'Coming soon', active: false },
        { t: 'Physiotherapy', d: 'Sessions at your stay.', price: 'Coming soon', active: false },
        { t: 'Nursing', d: 'Dressings, injections and IV.', price: 'Coming soon', active: false },
      ],
    },
    doctors: {
      kicker: 'Medical team',
      title: 'Licensed doctors, close to you.',
      eta: '~12 min',
      verified: 'Verified',
      book: 'Book',
      list: [
        { name: 'Dr. Elena Marí', spec: 'General Medicine · 14 yrs', rating: 4.98, reviews: 312, eta: '~8 min', langs: 'ES · EN · CA' },
        { name: 'Dr. Marc Dubois', spec: 'Internal Medicine · 11 yrs', rating: 4.96, reviews: 208, eta: '~14 min', langs: 'FR · EN · ES' },
        { name: 'Dr. Sofia Romano', spec: 'Family Medicine · 9 yrs', rating: 4.95, reviews: 187, eta: '~18 min', langs: 'IT · EN · ES' },
      ],
    },
    trust: {
      kicker: 'What you get',
      title: 'Full transparency.',
      inc: {
        t: 'Included in the visit',
        items: ['In-person consultation', 'Digital prescription', 'PDF medical report', '48h follow-up'],
      },
      exc: {
        t: 'Not included',
        items: ['Life-threatening emergencies → 112', 'Hospital admissions', 'Imaging tests', 'Surgery'],
        cta: 'Life-threatening? Call 112',
      },
    },
    faq: {
      kicker: 'Questions',
      title: 'People often ask us.',
      items: [
        { q: 'How long does the doctor take to arrive?', a: 'Average 45–60 minutes in Ibiza town, Playa d’en Bossa and San Antonio. Up to 90 min in rural areas.' },
        { q: 'How does payment work?', a: 'Secure card payment after the visit. We issue an invoice for your travel insurance.' },
        { q: 'Do you work with private insurance?', a: 'Yes — we provide all documents for reimbursement (Allianz, AXA, Mapfre, IMG, Cigna and more).' },
        { q: 'Do you visit hotels and villas?', a: 'Yes. We cover the whole island, including hotels, villas, boats in port and apartments.' },
        { q: 'Is there a night service?', a: 'Yes, 24/7, 365 days a year. Night surcharge applies 10 pm–8 am.' },
        { q: 'What about a real emergency?', a: 'If it is life-threatening, call 112 immediately. We are not an emergency service.' },
      ],
    },
    finalCta: {
      title: 'Need a doctor?',
      sub: 'Available 24/7 across the island.',
      cta: 'Request a doctor now',
      or: 'or call us',
      phone: '+34 971 000 000',
    },
    footer: {
      brand: 'OnCall Clinic',
      company: 'Ibiza Care SL · CIF B19973569',
      addr: 'Avenida de España 37, 07800 Ibiza',
      links: ['Legal notice', 'Privacy', 'Cookies', 'Terms', 'GDPR'],
      copy: '© 2026 Ibiza Care SL. All rights reserved.',
    },
  },
};

Object.assign(window, { COPY });
