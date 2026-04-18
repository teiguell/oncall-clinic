import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Stethoscope, ArrowRight, CheckCircle2, Clock, MapPin, CreditCard } from 'lucide-react'

interface ServiceSEOData {
  slug: string
  titleEs: string
  titleEn: string
  descEs: string
  descEn: string
  h1Es: string
  h1En: string
  price: string
  contentEs: string
  contentEn: string
  faqsEs: Array<{ q: string; a: string }>
  faqsEn: Array<{ q: string; a: string }>
  icon: string
}

const SERVICES_SEO: ServiceSEOData[] = [
  {
    slug: 'medico-domicilio-ibiza',
    titleEs: 'Médico a Domicilio en Ibiza — Consulta en 30 min',
    titleEn: 'Home Doctor in Ibiza — Visit in 30 min',
    descEs: 'Médico a domicilio en Ibiza en 30 minutos. Médicos colegiados, verificados y asegurados. Atención 24/7. Pago con tarjeta.',
    descEn: 'Home doctor in Ibiza in 30 minutes. Licensed, verified and insured doctors. 24/7 service. Pay by card.',
    h1Es: 'Médico a Domicilio en Ibiza',
    h1En: 'Home Doctor in Ibiza',
    price: '€120-180',
    icon: '🏥',
    contentEs: 'OnCall Clinic te conecta con médicos colegiados que llegan a tu hotel, villa o domicilio en Ibiza en menos de 30 minutos. Nuestros profesionales sanitarios están verificados, asegurados y hablan español e inglés. Disponible las 24 horas del día, los 7 días de la semana, durante todo el año. Ideal para turistas y residentes que necesitan atención médica urgente sin desplazarse a un centro de salud. Paga con tarjeta al finalizar la consulta, sin necesidad de seguro médico.',
    contentEn: 'OnCall Clinic connects you with licensed doctors who arrive at your hotel, villa or home in Ibiza in under 30 minutes. Our healthcare professionals are verified, insured and speak English and Spanish. Available 24 hours a day, 7 days a week, all year round. Ideal for tourists and residents who need urgent medical attention without travelling to a health centre. Pay by card at the end of the consultation, no health insurance needed.',
    faqsEs: [
      { q: '¿Cuánto tarda en llegar el médico a domicilio en Ibiza?', a: 'El tiempo medio de llegada es de 30 minutos en Ibiza ciudad y hasta 45 minutos en zonas más rurales de la isla.' },
      { q: '¿Cuánto cuesta una visita médica a domicilio?', a: 'El precio de una consulta general a domicilio es de €120-180 dependiendo de si es urgente o programada. El pago se realiza con tarjeta al finalizar.' },
      { q: '¿Los médicos hablan inglés?', a: 'Sí, todos nuestros médicos en Ibiza hablan inglés y español. Muchos también hablan francés y alemán.' },
    ],
    faqsEn: [
      { q: 'How long does a home doctor take in Ibiza?', a: 'Average arrival time is 30 minutes in Ibiza town and up to 45 minutes in more rural areas of the island.' },
      { q: 'How much does a home doctor visit cost?', a: 'A general home consultation costs €120-180 depending on whether it is urgent or scheduled. Payment is by card at the end.' },
      { q: 'Do the doctors speak English?', a: 'Yes, all our doctors in Ibiza speak English and Spanish. Many also speak French and German.' },
    ],
  },
  {
    slug: 'pediatria-domicilio-ibiza',
    titleEs: 'Pediatra a Domicilio en Ibiza — Atención infantil 24h',
    titleEn: 'Home Paediatrician in Ibiza — 24h child care',
    descEs: 'Pediatra a domicilio en Ibiza para tu hijo. Atención pediátrica urgente en tu hotel o villa. Médicos que hablan inglés.',
    descEn: 'Home paediatrician in Ibiza for your child. Urgent paediatric care at your hotel or villa. English-speaking doctors.',
    h1Es: 'Pediatra a Domicilio en Ibiza',
    h1En: 'Home Paediatrician in Ibiza',
    price: '€140-200',
    icon: '👶',
    contentEs: 'Cuando tu hijo enferma durante las vacaciones, OnCall Clinic envía un pediatra colegiado a tu hotel o villa en Ibiza en menos de 30 minutos. Nuestros pediatras están especializados en atención infantil de urgencia: fiebre, gastroenteritis, otitis, reacciones alérgicas y más. Todos hablan inglés y español para comunicarse eficazmente contigo. Paga con tarjeta sin necesidad de seguro.',
    contentEn: 'When your child falls ill on holiday, OnCall Clinic sends a licensed paediatrician to your hotel or villa in Ibiza in under 30 minutes. Our paediatricians specialise in urgent child care: fever, gastroenteritis, ear infections, allergic reactions and more. All speak English and Spanish to communicate effectively. Pay by card, no insurance needed.',
    faqsEs: [
      { q: '¿Tienen pediatras disponibles de noche en Ibiza?', a: 'Sí, nuestro servicio de pediatría a domicilio está disponible 24 horas, incluyendo noches, fines de semana y festivos.' },
      { q: '¿Qué patologías infantiles atienden?', a: 'Atendemos fiebre, gastroenteritis, otitis, infecciones respiratorias, reacciones alérgicas, traumatismos leves y más.' },
      { q: '¿El pediatra puede recetar medicamentos?', a: 'Sí, nuestros pediatras pueden emitir recetas médicas válidas en España y en toda la Unión Europea.' },
    ],
    faqsEn: [
      { q: 'Do you have paediatricians at night in Ibiza?', a: 'Yes, our home paediatric service is available 24 hours, including nights, weekends and bank holidays.' },
      { q: 'What childhood conditions do you treat?', a: 'We treat fever, gastroenteritis, ear infections, respiratory infections, allergic reactions, minor injuries and more.' },
      { q: 'Can the paediatrician prescribe medication?', a: 'Yes, our paediatricians can issue prescriptions valid in Spain and across the European Union.' },
    ],
  },
  {
    slug: 'urgencias-domicilio-ibiza',
    titleEs: 'Urgencias Médicas a Domicilio en Ibiza — 15-30 min',
    titleEn: 'Home Medical Emergencies in Ibiza — 15-30 min',
    descEs: 'Servicio de urgencias médicas a domicilio en Ibiza. Médico de urgencias en tu hotel o villa en 15-30 minutos. 24/7.',
    descEn: 'Home medical emergency service in Ibiza. Emergency doctor at your hotel or villa in 15-30 minutes. 24/7.',
    h1Es: 'Urgencias Médicas a Domicilio en Ibiza',
    h1En: 'Home Medical Emergencies in Ibiza',
    price: '€180-250',
    icon: '🚨',
    contentEs: 'Para situaciones urgentes que no son una emergencia vital (para esas, llama siempre al 112), OnCall Clinic te envía un médico de urgencias a tu ubicación en Ibiza en 15-30 minutos. Nuestros médicos de urgencias están equipados para atender crisis alérgicas, deshidratación severa, fracturas, heridas que requieren sutura, crisis de ansiedad y otras situaciones que necesitan atención inmediata.',
    contentEn: 'For urgent situations that are not life-threatening (for those, always call 112), OnCall Clinic sends an emergency doctor to your location in Ibiza in 15-30 minutes. Our emergency doctors are equipped to handle allergic crises, severe dehydration, fractures, wounds requiring stitches, anxiety attacks and other situations needing immediate attention.',
    faqsEs: [
      { q: '¿Cuándo debo llamar al 112 en lugar de usar OnCall Clinic?', a: 'Llama al 112 para emergencias vitales: infartos, ictus, dificultad respiratoria grave, pérdida de consciencia, hemorragias severas o accidentes graves.' },
      { q: '¿Cómo funciona el servicio de urgencias a domicilio?', a: 'Solicita desde la app, un médico acepta en segundos, y llega a tu ubicación en 15-30 minutos con equipamiento médico de urgencias.' },
      { q: '¿Qué equipamiento llevan los médicos de urgencias?', a: 'Nuestros médicos llevan un maletín de urgencias con pulsioxímetro, tensiómetro, material de sutura, medicación inyectable y oral, y material de curas.' },
    ],
    faqsEn: [
      { q: 'When should I call 112 instead of OnCall Clinic?', a: 'Call 112 for life-threatening emergencies: heart attacks, strokes, severe breathing difficulty, loss of consciousness, severe bleeding or serious accidents.' },
      { q: 'How does the home emergency service work?', a: 'Request from the app, a doctor accepts in seconds, and arrives at your location in 15-30 minutes with emergency medical equipment.' },
      { q: 'What equipment do emergency doctors carry?', a: 'Our doctors carry an emergency kit with pulse oximeter, blood pressure monitor, suture material, injectable and oral medication, and wound care supplies.' },
    ],
  },
  {
    slug: 'iv-drips-ibiza',
    titleEs: 'IV Drips en Ibiza — Hidratación y Vitaminas a Domicilio',
    titleEn: 'IV Drips in Ibiza — Home Hydration & Vitamins',
    descEs: 'IV Drips a domicilio en Ibiza. Hidratación, vitaminas, tratamiento de resaca. Servicio médico profesional en tu hotel o villa.',
    descEn: 'Home IV Drips in Ibiza. Hydration, vitamins, hangover treatment. Professional medical service at your hotel or villa.',
    h1Es: 'IV Drips a Domicilio en Ibiza',
    h1En: 'Home IV Drips in Ibiza',
    price: '€180-250',
    icon: '💧',
    contentEs: 'Los IV Drips (goteros intravenosos) son la forma más rápida de rehidratarte y reponer nutrientes. En Ibiza, nuestro servicio de IV Drips a domicilio es perfecto para recuperarte de la deshidratación, resacas, jet lag o simplemente para un boost de energía y vitaminas. Un profesional sanitario cualificado administra el tratamiento en la comodidad de tu hotel, villa o barco.',
    contentEn: 'IV Drips are the fastest way to rehydrate and replenish nutrients. In Ibiza, our home IV Drip service is perfect for recovering from dehydration, hangovers, jet lag or simply for an energy and vitamin boost. A qualified healthcare professional administers the treatment in the comfort of your hotel, villa or yacht.',
    faqsEs: [
      { q: '¿Cuánto dura un IV Drip?', a: 'Un tratamiento de IV Drip dura entre 30 y 60 minutos dependiendo del tipo de gotero elegido.' },
      { q: '¿Qué tipos de IV Drips ofrecen?', a: 'Ofrecemos hidratación básica, anti-resaca (con vitaminas B y antieméticos), boost de vitaminas, y tratamientos personalizados según necesidades.' },
      { q: '¿Es seguro un IV Drip a domicilio?', a: 'Totalmente. Nuestros profesionales están colegiados, usan material estéril de un solo uso, y siguen protocolos médicos estrictos.' },
    ],
    faqsEn: [
      { q: 'How long does an IV Drip take?', a: 'An IV Drip treatment takes between 30 and 60 minutes depending on the type of drip chosen.' },
      { q: 'What types of IV Drips do you offer?', a: 'We offer basic hydration, anti-hangover (with B vitamins and antiemetics), vitamin boost, and customised treatments.' },
      { q: 'Is a home IV Drip safe?', a: 'Absolutely. Our professionals are licensed, use single-use sterile materials, and follow strict medical protocols.' },
    ],
  },
  {
    slug: 'medico-ingles-ibiza',
    titleEs: 'Médico que Habla Inglés en Ibiza — English Doctor Ibiza',
    titleEn: 'English-Speaking Doctor in Ibiza — Home Visits',
    descEs: 'Médico que habla inglés a domicilio en Ibiza. English-speaking doctor at your hotel or villa. 30 min. Pay by card.',
    descEn: 'English-speaking doctor at your door in Ibiza. Home visits to hotels, villas and yachts. 30 min arrival. Pay by card.',
    h1Es: 'Médico que Habla Inglés en Ibiza',
    h1En: 'English-Speaking Doctor in Ibiza',
    price: '€120-180',
    icon: '🇬🇧',
    contentEs: 'Estar enfermo en el extranjero es estresante, y más si no hablas el idioma local. OnCall Clinic te conecta con médicos en Ibiza que hablan inglés perfectamente. Todos nuestros profesionales son bilingües y muchos también hablan francés, alemán u holandés. Llegan a tu hotel, villa, apartamento o barco en 30 minutos. Paga con tarjeta, sin necesidad de tramitar ningún seguro.',
    contentEn: 'Being ill abroad is stressful, especially if you don\'t speak the local language. OnCall Clinic connects you with doctors in Ibiza who speak perfect English. All our professionals are bilingual and many also speak French, German or Dutch. They arrive at your hotel, villa, apartment or yacht within 30 minutes. Pay by card, no insurance paperwork needed.',
    faqsEs: [
      { q: '¿Todos los médicos hablan inglés?', a: 'Sí, el 100% de nuestros médicos en Ibiza son bilingües español-inglés. Varios también hablan francés, alemán u holandés.' },
      { q: '¿Puedo pedir un médico que hable alemán o francés?', a: 'Sí, al solicitar la consulta puedes indicar tu idioma preferido y buscaremos un médico que lo hable.' },
      { q: '¿El médico puede emitir un informe en inglés?', a: 'Sí, nuestros médicos pueden emitir informes médicos y recetas en inglés, válidos en toda la Unión Europea.' },
    ],
    faqsEn: [
      { q: 'Do all doctors speak English?', a: 'Yes, 100% of our doctors in Ibiza are bilingual Spanish-English. Several also speak French, German or Dutch.' },
      { q: 'Can I request a doctor who speaks German or French?', a: 'Yes, when requesting your consultation you can indicate your preferred language and we\'ll find a doctor who speaks it.' },
      { q: 'Can the doctor issue a report in English?', a: 'Yes, our doctors can issue medical reports and prescriptions in English, valid across the European Union.' },
    ],
  },
]

function getServiceBySlug(slug: string) {
  return SERVICES_SEO.find(s => s.slug === slug)
}

export async function generateStaticParams() {
  return SERVICES_SEO.map(s => ({ servicio: s.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; servicio: string }>
}): Promise<Metadata> {
  const { locale, servicio } = await params
  const service = getServiceBySlug(servicio)
  if (!service) return { title: 'Not Found' }

  const isEn = locale === 'en'
  return {
    title: isEn ? service.titleEn : service.titleEs,
    description: isEn ? service.descEn : service.descEs,
    openGraph: {
      title: isEn ? service.titleEn : service.titleEs,
      description: isEn ? service.descEn : service.descEs,
      type: 'website',
      locale: isEn ? 'en_GB' : 'es_ES',
    },
    alternates: {
      languages: {
        es: `https://oncallclinic.com/es/servicios/${servicio}`,
        en: `https://oncallclinic.com/en/servicios/${servicio}`,
      },
    },
  }
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ locale: string; servicio: string }>
}) {
  const { locale, servicio } = await params
  const service = getServiceBySlug(servicio)
  if (!service) notFound()

  const isEn = locale === 'en'
  const h1 = isEn ? service.h1En : service.h1Es
  const content = isEn ? service.contentEn : service.contentEs
  const faqs = isEn ? service.faqsEn : service.faqsEs
  const ctaText = isEn ? 'Book a doctor now' : 'Pedir médico ahora'
  const priceLabel = isEn ? 'From' : 'Desde'
  const faqTitle = isEn ? 'Frequently asked questions' : 'Preguntas frecuentes'
  const trustItems = isEn
    ? ['English-speaking doctors', 'Real-time GPS tracking', 'Pay by card', 'Available 24/7']
    : ['Médicos que hablan inglés', 'Seguimiento GPS en tiempo real', 'Pago con tarjeta', 'Disponible 24/7']

  // Schema.org MedicalProcedure
  const schemaOrg = {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    name: h1,
    description: isEn ? service.descEn : service.descEs,
    howPerformed: isEn
      ? 'A verified doctor arrives at your location in Ibiza within 30 minutes.'
      : 'Un médico verificado llega a tu ubicación en Ibiza en 30 minutos.',
    procedureType: 'http://schema.org/NoninvasiveProcedure',
    bodyLocation: 'Home / Hotel / Villa',
    preparation: isEn ? 'No preparation needed. Book via app.' : 'Sin preparación. Reserva por la app.',
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <div className="min-h-screen bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">OnCall Clinic</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href={`/${locale}/login`}>
              <Button variant="outline" size="sm">{isEn ? 'Log in' : 'Iniciar sesión'}</Button>
            </Link>
            <Link href={`/${locale}/register`}>
              <Button size="sm">{isEn ? 'Sign up' : 'Registrarse'}</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-white pt-16 pb-20">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <div className="text-6xl mb-6">{service.icon}</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{h1}</h1>
          <p className="text-xl text-gray-600 mb-6">{isEn ? service.descEn : service.descEs}</p>
          <div className="flex items-center justify-center gap-3 mb-8">
            <Badge variant="info" className="text-base px-4 py-1.5">
              {priceLabel} {service.price}
            </Badge>
            <Badge variant="success" className="text-base px-4 py-1.5">
              <Clock className="h-4 w-4 mr-1" />
              {isEn ? '30 min arrival' : '30 min llegada'}
            </Badge>
          </div>
          <Link href={`/${locale}/register`}>
            <Button size="xl" className="gap-2 shadow-xl shadow-blue-500/30">
              {ctaText}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <p className="text-lg text-gray-700 leading-relaxed mb-12">{content}</p>

          {/* Trust signals */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {trustItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
                <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-800">{item}</span>
              </div>
            ))}
          </div>

          {/* How it works */}
          <Card className="border-0 shadow-lg mb-12">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6">{isEn ? 'How it works' : 'Cómo funciona'}</h2>
              <div className="space-y-4">
                {[
                  { icon: <MapPin className="h-5 w-5" />, text: isEn ? '1. Tell us your location (hotel, villa, address)' : '1. Dinos tu ubicación (hotel, villa, dirección)' },
                  { icon: <Stethoscope className="h-5 w-5" />, text: isEn ? '2. Choose this service and describe your symptoms' : '2. Elige este servicio y describe tus síntomas' },
                  { icon: <Clock className="h-5 w-5" />, text: isEn ? '3. A verified doctor arrives in ~30 minutes' : '3. Un médico verificado llega en ~30 minutos' },
                  { icon: <CreditCard className="h-5 w-5" />, text: isEn ? '4. Pay by card when the consultation ends' : '4. Paga con tarjeta al finalizar la consulta' },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50">
                    <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                      {step.icon}
                    </div>
                    <p className="text-gray-700">{step.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* FAQs */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">{faqTitle}</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <details key={i} className="group border rounded-xl p-4 open:shadow-md transition-shadow">
                  <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                    {faq.q}
                    <span className="text-gray-400 group-open:rotate-45 transition-transform text-xl">+</span>
                  </summary>
                  <p className="mt-3 text-gray-600">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center bg-blue-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-3">{isEn ? 'Need this service?' : '¿Necesitas este servicio?'}</h2>
            <p className="text-gray-600 mb-6">{isEn ? 'Sign up and book in under 2 minutes' : 'Regístrate y reserva en menos de 2 minutos'}</p>
            <Link href={`/${locale}/register`}>
              <Button size="xl" className="gap-2">
                {ctaText}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">
            © 2026 OnCall Clinic · Ibiza Care SL · Ibiza, {isEn ? 'Spain' : 'España'}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            🏥 {isEn ? 'Medical services intermediary platform. We are not a medical centre.' : 'Plataforma intermediaria de servicios médicos. No somos un centro médico.'}
          </p>
        </div>
      </footer>
    </div>
  )
}
