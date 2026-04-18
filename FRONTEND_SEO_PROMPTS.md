# OnCall Clinic — Frontend + SEO Prompts

UX copy, design system, SEO y páginas principales.
Stack: Next.js 14 App Router · Tailwind · Radix UI · next-intl

---

## PROMPT 10 — Landing Page Premium (Hero + SEO + ES+EN)

```
Rediseña completamente app/page.tsx (landing page) de OnCall Clinic para el mercado de Ibiza con foco en turistas internacionales y residentes. Objetivo: primera impresión de aplicación premium de salud, como si fuera la web de Airbnb pero para medicina.

### Cambios en el HERO (sección superior):

Reemplaza el hero actual por:
- Fondo: gradiente profundo azul marino → azul cielo (#0F172A → #0EA5E9), con overlay de imagen de Ibiza si está disponible
- Badge: "🏝️ Disponible en Ibiza · English speaking doctors"
- H1 (ES): "Tu médico en casa.\nDonde estés en Ibiza."
- H1 (EN): "Your doctor,\nat your door in Ibiza."
- Subtítulo (ES): "Médicos verificados a domicilio en 30 minutos. En español o en inglés. Paga con tarjeta, sin burocracia."
- Subtítulo (EN): "Verified doctors at your hotel, villa or home in 30 minutes. English-speaking. Pay by card, no insurance needed."
- CTA primario: "Pedir médico ahora" / "Book a doctor now"
- CTA secundario: "Soy médico / I'm a doctor"
- Trust signals debajo de los CTAs:
  - ✓ Sin tarjeta requerida para registrarse / No credit card to sign up
  - ✓ Médicos colegiados y verificados / GMC/CME verified doctors
  - ✓ Seguimiento GPS en tiempo real / Real-time GPS tracking
  - ✓ Disponible 24/7 / Available 24/7

### Stats bar (fondo oscuro, entre hero y siguiente sección):
- "30 min" → "Tiempo medio de llegada / Avg. arrival time"
- "4.9 ★" → "Valoración pacientes / Patient rating"
- "100%" → "Médicos colegiados / Registered doctors"
- "24/7" → "Siempre disponible / Always available"

### Sección "Cómo funciona" — mejorar iconografía y copy:
Paso 1: Cuéntanos dónde estás / Tell us where you are
  - "Tu hotel, villa o domicilio. Detectamos tu ubicación o escríbela a mano." / "Your hotel, villa or address. We detect your location or you type it."
Paso 2: Elige el tipo de consulta / Choose your consultation
  - "Urgencia inmediata (30 min) o cita programada. Selecciona el motivo." / "Immediate (30 min) or scheduled. Tell us why you need a doctor."
Paso 3: El médico llega a ti / Doctor comes to you
  - "Sigue en el mapa cómo se acerca. Paga con tarjeta al finalizar." / "Track on the map as they approach. Pay by card when done."

### Sección de servicios — actualizar para Ibiza:
Añadir servicio "IV Drips & Wellness" con icono de gota y texto "Hidratación, vitaminas, resaca. El complemento perfecto para Ibiza."
Añadir "English-speaking doctors" como feature card.
Quitar "Neurología" del listado inicial (poco probable en home visit urgente).

### Sección "Para médicos" — mejorar copy:
H2: "¿Eres médico o profesional sanitario?" / "Are you a healthcare professional?"
Subtítulo: "Únete a la red de OnCall Clinic en Ibiza. Trabaja cuando quieras, cobra al momento."
Cards:
  - 💶 "Cobra al instante" / "Instant payment" — "Stripe te transfiere el 85% de cada consulta automáticamente."
  - 🗓️ "Tú decides cuándo" / "Work your schedule" — "Sin guardias obligatorias. Activa/desactiva disponibilidad desde la app."
  - 🌍 "Red internacional" / "International network" — "Atiende a pacientes de toda Europa desde Ibiza."

### Testimonios — actualizar para Ibiza:
1. Sarah M., Brighton — ★★★★★ — "I had severe food poisoning at 2am. A doctor arrived at my villa in 25 minutes. Incredible service. Worth every penny."
2. Javier R., Madrid — ★★★★★ — "Mi hija tuvo fiebre alta el primer día de vacaciones. En media hora había un pediatra en nuestra villa. Salvaron nuestras vacaciones."
3. Thomas K., Berlin — ★★★★★ — "English-speaking doctor, real-time tracking, paid by card. Exactly what you need when you're sick abroad."

### Footer mejorado:
- Añadir columna "Servicios": Medicina general, Pediatría, Urgencias, IV Drips, Cardiología
- Añadir columna "Para médicos": Únete, Cómo funciona, Ganancias, FAQ
- Añadir columna "Legal": Aviso legal, Privacidad, Cookies, T&C
- Copyright: "© 2026 OnCall Clinic · Ibiza Care SL · Ibiza, España"
- Añadir: "🏥 Plataforma intermediaria de servicios médicos. No somos un centro médico."
```

---

## PROMPT 11 — SEO Completo (Meta, Schema, Sitemap, Open Graph)

```
Implementa SEO técnico exquisito en toda la app de OnCall Clinic. Objetivo: posicionar en "médico domicilio Ibiza", "home doctor Ibiza", "doctor on demand Ibiza" y términos relacionados.

### 1. Layout raíz (app/layout.tsx) — Metadata global:

Añade en el export const metadata de Next.js 14:

```typescript
export const metadata: Metadata = {
  metadataBase: new URL('https://oncallclinic.com'),
  title: {
    default: 'OnCall Clinic — Médico a Domicilio en Ibiza | Home Doctor Ibiza',
    template: '%s | OnCall Clinic Ibiza',
  },
  description: 'Médico a domicilio en Ibiza en 30 minutos. English-speaking verified doctors at your hotel or villa. Book now, pay by card. Available 24/7.',
  keywords: [
    'médico a domicilio Ibiza', 'home doctor Ibiza', 'doctor on demand Ibiza',
    'médico urgencias Ibiza', 'pediatra domicilio Ibiza', 'English doctor Ibiza',
    'IV drip Ibiza', 'doctor at hotel Ibiza', 'médico hotel Ibiza',
    'teleconsulta Ibiza', 'médico villa Ibiza', 'visita médica domicilio Baleares'
  ],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    alternateLocale: 'en_GB',
    url: 'https://oncallclinic.com',
    siteName: 'OnCall Clinic',
    title: 'OnCall Clinic — Médico a Domicilio en Ibiza en 30 minutos',
    description: 'Verified doctors at your door in Ibiza. English-speaking. Book by app, track in real-time, pay by card.',
    images: [{
      url: '/og-image.jpg', // 1200x630px
      width: 1200,
      height: 630,
      alt: 'OnCall Clinic — Home Doctor Ibiza',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OnCall Clinic — Médico a Domicilio Ibiza',
    description: 'Doctor at your door in Ibiza in 30 minutes. Book now.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: {
    canonical: 'https://oncallclinic.com',
    languages: {
      'es': 'https://oncallclinic.com/es',
      'en': 'https://oncallclinic.com/en',
    },
  },
}
```

### 2. Schema.org structured data (en app/page.tsx o layout):

Añade un componente <JsonLd> que inserte estos schemas:

**MedicalOrganization:**
```json
{
  "@context": "https://schema.org",
  "@type": "MedicalOrganization",
  "name": "OnCall Clinic",
  "description": "Plataforma de médicos a domicilio en Ibiza",
  "url": "https://oncallclinic.com",
  "logo": "https://oncallclinic.com/logo.png",
  "telephone": "+34-XXX-XXX-XXX",
  "address": { "@type": "PostalAddress", "addressLocality": "Ibiza", "addressRegion": "Islas Baleares", "addressCountry": "ES" },
  "geo": { "@type": "GeoCoordinates", "latitude": 38.9067, "longitude": 1.4206 },
  "areaServed": { "@type": "City", "name": "Ibiza" },
  "availableLanguage": ["Spanish", "English"],
  "openingHoursSpecification": { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], "opens": "00:00", "closes": "23:59" }
}
```

**FAQPage** (preguntas frecuentes para rich snippets):
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "¿Cuánto tarda el médico en llegar?", "acceptedAnswer": { "@type": "Answer", "text": "El tiempo medio de llegada es de 30 minutos en Ibiza ciudad y hasta 45 minutos en zonas más remotas." } },
    { "@type": "Question", "name": "Do you have English-speaking doctors?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, all our doctors in Ibiza speak English. Many also speak French and German." } },
    { "@type": "Question", "name": "¿Puedo pagar con tarjeta?", "acceptedAnswer": { "@type": "Answer", "text": "Sí, aceptamos todas las tarjetas de crédito y débito a través de Stripe. No necesitas efectivo." } },
    { "@type": "Question", "name": "¿Necesito seguro médico?", "acceptedAnswer": { "@type": "Answer", "text": "No. El pago es directo, sin necesidad de seguro médico. El precio incluye la visita completa." } },
    { "@type": "Question", "name": "¿Está disponible las 24 horas?", "acceptedAnswer": { "@type": "Answer", "text": "Sí, OnCall Clinic está disponible las 24 horas del día, los 7 días de la semana, los 365 días del año." } }
  ]
}
```

### 3. Crea app/sitemap.ts:
```typescript
import { MetadataRoute } from 'next'
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://oncallclinic.com', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: 'https://oncallclinic.com/en', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: 'https://oncallclinic.com/register', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://oncallclinic.com/login', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://oncallclinic.com/legal/aviso-legal', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: 'https://oncallclinic.com/legal/privacidad', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: 'https://oncallclinic.com/legal/terminos', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: 'https://oncallclinic.com/legal/cookies', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: 'https://oncallclinic.com/servicios/medico-domicilio-ibiza', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: 'https://oncallclinic.com/servicios/pediatria-domicilio-ibiza', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://oncallclinic.com/servicios/iv-drips-ibiza', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://oncallclinic.com/servicios/urgencias-domicilio-ibiza', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
  ]
}
```

### 4. Crea app/robots.ts:
```typescript
import { MetadataRoute } from 'next'
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/', '/patient/tracking/'] },
    sitemap: 'https://oncallclinic.com/sitemap.xml',
  }
}
```

### 5. Páginas de servicios SEO (landing pages por keyword):

Crea app/servicios/[servicio]/page.tsx con generateMetadata dinámico para estas rutas:
- /servicios/medico-domicilio-ibiza
- /servicios/pediatria-domicilio-ibiza
- /servicios/urgencias-domicilio-ibiza
- /servicios/iv-drips-ibiza
- /servicios/medico-ingles-ibiza

Cada página tiene: H1 con la keyword exacta, 200 palabras de contenido relevante, precio orientativo, CTA de reserva, FAQ con 3 preguntas específicas del servicio, y Schema de MedicalProcedure.
```

---

## PROMPT 12 — Design System Premium (Ibiza Medical Luxury)

```
Crea un design system visual coherente para OnCall Clinic que refleje: confianza médica + lifestyle premium de Ibiza. Actualiza tailwind.config.ts y globals.css.

### Paleta de colores (tailwind.config.ts):
```typescript
colors: {
  brand: {
    50:  '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // primary blue
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a', // deep navy
    950: '#172554',
  },
  teal: {
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
  },
  medical: {
    green:  '#16a34a',
    red:    '#dc2626',
    amber:  '#d97706',
    slate:  '#1e293b',
  }
}
```

### Tipografía:
- Fuente principal: Inter (Google Fonts, ya incluida en Next.js)
- H1: font-size 4.5rem (72px), font-weight 800, letter-spacing -0.03em, line-height 1.05
- H2: font-size 2.5rem (40px), font-weight 700, letter-spacing -0.02em
- H3: font-size 1.5rem (24px), font-weight 600
- Body: font-size 1rem (16px), line-height 1.7, color #374151

### Componente HeroSection premium:
Crea components/landing/HeroSection.tsx con:
- Fondo: bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900
- Partículas/decoración: círculos SVG difusos en azul/teal con opacity 0.15 (CSS animation float)
- Badge pill animado (pulse suave): "🟢 Médicos disponibles ahora · Ibiza"
- Título con text-transparent bg-clip-text para el texto de colores
- Trust bar con 4 iconos CheckCircle en fila, texto blanco
- Botón CTA primario: bg-white text-blue-900 hover:bg-blue-50 shadow-2xl shadow-white/10 rounded-full px-8 py-4
- Botón CTA secundario: border border-white/30 text-white hover:bg-white/10 rounded-full px-8 py-4

### Componente FeatureCard premium:
Crea components/landing/FeatureCard.tsx con:
- Glassmorphism suave: bg-white/80 backdrop-blur-sm border border-white/60
- Icon container: gradiente de la paleta brand, shadow-lg shadow-blue-500/20
- Hover: translateY(-4px) con transición suave 300ms
- Número decorativo en fondo: font-size 8rem, opacity 0.03, position absolute

### Componente StatsBar:
Crea components/landing/StatsBar.tsx con:
- Fondo oscuro: bg-slate-900
- 4 stats en fila con separador vertical
- Número: text-4xl font-black text-white
- Label: text-sm text-slate-400 uppercase tracking-widest

### Componente TrustBadge:
Crea components/landing/TrustBadge.tsx para el footer:
- Logos (SVG inline): "Pago seguro Stripe" · "RGPD compliant" · "Colegio de Médicos"
- Estilo: filter grayscale opacity-50 hover:opacity-100 transition

### Gradiente global (globals.css):
```css
.gradient-hero {
  background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0ea5e9 100%);
}
.gradient-primary {
  background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%);
}
.glass-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.6);
}
.text-gradient {
  background: linear-gradient(135deg, #60a5fa, #2dd4bf);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Animaciones CSS:
```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.5); }
}
.animate-float { animation: float 6s ease-in-out infinite; }
.animate-pulse-dot { animation: pulse-dot 2s ease-in-out infinite; }
```
```

---

## PROMPT 13 — Patient Dashboard UX Mejorado

```
Rediseña app/patient/dashboard/page.tsx para que sea intuitivo, funcional y visualmente premium.

### Layout objetivo:
- Header con saludo personalizado: "Buenos días, María 👋" / "Good morning, Sarah 👋"
- Subtítulo: "¿Cómo podemos ayudarte hoy?" / "How can we help you today?"
- CTA flotante sticky en mobile: botón rojo pulsante "🚨 URGENCIA" siempre visible

### Sección principal — Quick Actions:
4 tiles grandes (2x2 grid en mobile, 4 en row en desktop):
1. 🚨 "Urgencia ahora" / "Emergency now" — rojo — subtexto "Médico en ~30 min"
2. 📅 "Programar cita" / "Schedule visit" — azul — subtexto "Elige día y hora"
3. 💧 "IV Drips & Wellness" — teal — subtexto "Hidratación y vitaminas"
4. 💬 "Teleconsulta" / "Video call" — púrpura — subtexto "Disponible en 5 min"

### Sección "Tu próxima consulta":
Si hay consulta activa/pendiente: card grande con estado, nombre del médico, tiempo estimado, botón "Seguir en mapa"
Si no: empty state elegante — "No tienes consultas próximas. ¿Te encuentras bien?" con CTA

### Sección "Historial reciente" (últimas 3):
Mini cards con: tipo, médico, fecha, badge estado, precio pagado, botón "Ver resumen"

### Bottom navigation (mobile):
4 tabs: 🏠 Inicio | 📋 Historial | 👤 Perfil | ❓ Ayuda

### UX copy importante:
- Estado "pending": "🔍 Buscando médico disponible..." / "Searching for available doctor..."
- Estado "accepted": "✅ Médico confirmado — en camino" / "Doctor confirmed — on the way"
- Estado "arrived": "🚪 El médico ha llegado" / "Your doctor has arrived"
- Estado "completed": "✅ Consulta completada. ¿Cómo fue?" / "Consultation complete. How was it?"
- Estado "cancelled": "❌ Consulta cancelada. ¿Necesitas ayuda?" / "Consultation cancelled. Need help?"
- Error de pago: "Tu pago no se pudo procesar. Inténtalo con otra tarjeta o contacta con soporte." / "Payment couldn't be processed. Try another card or contact support."
- Sin médicos disponibles: "No hay médicos disponibles en este momento. Te avisamos en cuanto uno esté libre, o prueba la teleconsulta." / "No doctors available right now. We'll notify you when one is free, or try a video call."
```

---

## PROMPT 14 — Doctor Dashboard UX Mejorado

```
Rediseña app/doctor/dashboard/page.tsx para que sea eficiente para el médico trabajando en campo.

### Principios UX para el médico:
- Información crítica first: hay solicitudes pendientes o no
- Mínimos taps para aceptar/rechazar
- Datos de ganancias siempre visibles
- Modo offline-aware (indicador de conexión)

### Header:
- Toggle de disponibilidad prominente con switch XL: "Disponible / No disponible" — verde/gris
- Cuando está disponible: indicador pulsante verde "🟢 Activo — recibiendo solicitudes"
- Indicador de balance del día: "Hoy: €X,XX ganados"

### Solicitud entrante (máxima prioridad visual):
Card con fondo azul oscuro + sonido/vibración:
- "⚡ Nueva solicitud urgente"
- Tipo de consulta + síntomas resumidos (3 líneas)
- Distancia: "2.3 km · ~8 min en coche"
- Precio que recibirás: "Cobrarás €X" (85% prominente)
- Botones: "✅ Aceptar" (verde, grande) | "❌ Rechazar" (rojo, pequeño)
- Contador regresivo: "Expira en 45s" con barra de progreso

### Sección ganancias (no tocar, mejorar visual):
- Gráfico de barras simple 7 días (usar recharts)
- Total del mes, total histórico
- Próximo pago Stripe con fecha estimada

### UX copy:
- Sin solicitudes: "Todo tranquilo por ahora. Estás disponible y listo para recibir pacientes."
- Primera vez: "Bienvenido a OnCall Clinic. Activa tu disponibilidad para empezar a recibir solicitudes."
- RC próxima a vencer: "⚠️ Tu RC Insurance vence en X días. Actualízala para no ser suspendido automáticamente."
- RC vencida: "🔴 Tu RC está vencida. Tu cuenta está suspendida temporalmente. Actualiza tu documentación."
```

---

## PROMPT 15 — Tracking Page UX (GPS Real-time)

```
Mejora app/patient/tracking/[id]/page.tsx para que sea la pantalla más impresionante de la app — el momento de mayor ansiedad del paciente.

### Objetivo UX:
Reducir la ansiedad del paciente con información clara, visual y tranquilizadora.

### Layout:
- 60% de la pantalla: mapa con marker del médico (imagen de avatar circular) + marker del paciente
- 40% inferior: información de estado con card deslizable hacia arriba (bottom sheet)

### Bottom sheet — información del médico:
Card con foto del médico (o avatar inicial), nombre, especialidad, valoración (★), badges de idiomas (ES/EN/DE/FR)

### Progreso de 5 pasos con iconos:
1. ✅ "Solicitud enviada" / "Request sent"
2. ✅ "Médico confirmado" / "Doctor confirmed"  
3. 🔄 "En camino — X minutos" / "On the way — X minutes" (animado mientras está activo)
4. ⏳ "Ha llegado" / "Arrived"
5. ⏳ "Consulta completada" / "Consultation complete"

### Información en tiempo real:
- ETA dinámico: "Llega en aprox. 12 minutos" (actualizado cada 30s) / "Arrives in approx. 12 minutes"
- Distancia: "1.8 km"
- Número de teléfono del médico (visible solo cuando está accepted/en camino): "Llamar al médico"

### Mensajes de estado tranquilizadores:
- En camino: "Tu médico está en camino. Puedes ir preparando: lista de medicamentos actuales, síntomas desde cuándo y cualquier documento médico relevante."
- Llegó: "Tu médico ha llegado. Por favor, baja o abre la puerta."
- En consulta: "La consulta está en curso."
- Emergencia 112 siempre visible: "Si es una emergencia grave, llama al 112 inmediatamente."
```

---

## UX COPY — Tabla de microcopy ES+EN para toda la app

| Contexto | Español | English |
|----------|---------|---------|
| Nav — Inicio | Inicio | Home |
| Nav — Servicios | Servicios | Services |
| Nav — Historial | Historial | History |
| Nav — Perfil | Mi perfil | My profile |
| CTA principal | Pedir médico ahora | Book a doctor now |
| CTA doctor | Soy médico, unirme | I'm a doctor, join |
| CTA urgencia | Urgencia ahora | Emergency now |
| Loading genérico | Cargando... | Loading... |
| Loading médicos | Buscando médicos disponibles... | Finding available doctors... |
| Error 404 | Página no encontrada. ¿Volvemos al inicio? | Page not found. Go back home? |
| Error 500 | Algo fue mal. Estamos en ello. | Something went wrong. We're on it. |
| Auth — login | Bienvenido de nuevo | Welcome back |
| Auth — register | Crea tu cuenta gratis | Create your free account |
| Auth — forgot pw | ¿Olvidaste tu contraseña? | Forgot your password? |
| Auth — email sent | Te hemos enviado un enlace | We've sent you a link |
| Form — required | Campo obligatorio | Required field |
| Form — email invalid | Email no válido | Invalid email address |
| Form — phone invalid | Teléfono no válido (incluye prefijo) | Invalid phone (include country code) |
| Payment — success | ¡Pago realizado! | Payment successful! |
| Payment — declined | Tarjeta rechazada. Intenta con otra. | Card declined. Try another card. |
| Payment — processing | Procesando pago... | Processing payment... |
| Booking — confirm | Confirmar solicitud | Confirm request |
| Booking — cancel | Cancelar consulta | Cancel consultation |
| Cancel — warning | Una vez aceptado por el médico, la cancelación puede tener cargo. | Once the doctor accepts, cancellation may incur a fee. |
| Rating — prompt | ¿Cómo fue tu consulta con el Dr./Dra. X? | How was your consultation with Dr. X? |
| Rating — thanks | ¡Gracias por tu valoración! | Thanks for your review! |
| RC — expiry warning | Tu seguro RC vence en X días | Your RC insurance expires in X days |
| RC — expired | RC vencida. Cuenta suspendida temporalmente. | RC expired. Account temporarily suspended. |
| Empty — history | Aún no tienes consultas. ¡Esperamos que no las necesites! | No consultations yet. Hope you stay healthy! |
| Empty — doctors | No hay médicos disponibles en este momento. | No doctors available right now. |
| Cookie banner | Usamos cookies para mejorar tu experiencia. | We use cookies to improve your experience. |
| Cookie — accept | Aceptar todas | Accept all |
| Cookie — reject | Solo necesarias | Essential only |
| GDPR consent | Al registrarte aceptas nuestros términos y política de privacidad. | By signing up you agree to our terms and privacy policy. |

---

## Notas de implementación

- **Prioridad 1**: PROMPT 11 (SEO) — impacto en adquisición orgánica inmediato
- **Prioridad 2**: PROMPT 10 (Landing Ibiza) — primera impresión del producto
- **Prioridad 3**: PROMPT 12 (Design System) — coherencia visual
- **Prioridad 4**: PROMPT 15 (Tracking GPS) — diferenciador competitivo #1
- **Prioridad 5**: PROMPT 13 y 14 (Dashboards) — experiencia del usuario post-registro
