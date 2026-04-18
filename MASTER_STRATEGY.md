# OnCall Clinic — Master Strategy & Claude Code Instructions
## "La mejor app de intermediación de servicios sanitarios del mundo"

**Visión:** Plataforma Uber-like de médicos a domicilio. Ibiza como laboratorio → España → Europa.
**Usuario primario:** Turista europeo (UK/DE/NL) en Ibiza. Paga €150-200 con tarjeta. No habla español.
**Diferenciador #1:** GPS tracking del médico en tiempo real + Chat post-consulta 24h.
**Comisión:** 15% plataforma / 85% médico via Stripe Connect.
**App:** Web app Next.js (responsive, mobile-first). Bilingüe ES+EN. Sin PWA por ahora.

---

## INSTRUCCIONES PARA CLAUDE CODE — CÓMO USARLAS

1. Abre tu terminal en el directorio del proyecto: `/oncall-clinic`
2. Cada PROMPT está numerado y es **autocontenido** — cópialo entero a Claude Code
3. **Orden de prioridad:** Ejecuta en el orden indicado. Cada prompt depende del anterior.
4. Después de cada prompt: revisa que la app compila (`npm run build`), no hay errores TypeScript, y el resultado visual es el esperado.

---

## SPRINT 1 — MVP LANZABLE (Hacer YA, en este orden)

### ▶ STEP 1 — i18n ES+EN (base de todo lo demás)
**Archivo:** `FRONTEND_SEO_PROMPTS.md` → PROMPT 9
**Por qué primero:** Sin esto, la mitad del mercado objetivo (turistas angloparlantes) no puede usar la app.
**Comando para Claude Code:**
```
Lee el archivo FRONTEND_SEO_PROMPTS.md en el directorio del proyecto y ejecuta el PROMPT 9 completo para implementar next-intl con soporte ES+EN en Next.js 14 App Router.
```

### ▶ STEP 2 — SEO técnico completo
**Archivo:** `FRONTEND_SEO_PROMPTS.md` → PROMPT 11
**Por qué segundo:** El SEO necesita estar en la base antes de construir las páginas.
**Comando para Claude Code:**
```
Lee el archivo FRONTEND_SEO_PROMPTS.md y ejecuta el PROMPT 11 completo: metadata global, schema.org MedicalOrganization + FAQPage, sitemap.ts, robots.ts y páginas de servicios SEO para Ibiza.
```

### ▶ STEP 3 — Landing Page Premium Ibiza
**Archivo:** `FRONTEND_SEO_PROMPTS.md` → PROMPT 10 + PROMPT 12
**Por qué:** Primera impresión del producto. Orientada al turista europeo.
**Comando para Claude Code:**
```
Lee el archivo FRONTEND_SEO_PROMPTS.md y ejecuta PRIMERO el PROMPT 12 (design system, globals.css, componentes premium) y LUEGO el PROMPT 10 (rediseño landing page para Ibiza con foco en turistas europeos). Asegúrate de que los textos en inglés están integrados con next-intl. El turista abre esta web desde el navegador del móvil del hotel — debe verse perfecta en mobile sin instalar nada.
```

### ▶ STEP 4 — RC Insurance en onboarding médico (LEGAL CRÍTICO)
**Archivo:** `LEGAL_CODE_PROMPTS.md` → PROMPT 5
**Por qué:** Sin esto, la plataforma tiene responsabilidad legal. Es la prioridad legal #1.
**Comando para Claude Code:**
```
Lee el archivo LEGAL_CODE_PROMPTS.md y ejecuta el PROMPT 5 completo: añadir campos de RC Insurance al onboarding de médicos, validación de mínimo €300.000, contrato de afiliación con cláusula de indemnidad. Incluye la migración de Supabase necesaria.
```

### ▶ STEP 5 — Consentimiento GDPR en registro de pacientes
**Archivo:** `LEGAL_CODE_PROMPTS.md` → PROMPT 3
**Comando para Claude Code:**
```
Lee el archivo LEGAL_CODE_PROMPTS.md y ejecuta el PROMPT 3 completo: 5 checkboxes separados de consentimiento RGPD en el registro de pacientes, tabla consent_log en Supabase, IP logging.
```

### ▶ STEP 6 — GPS Tracking Uber-like mejorado
**Archivo:** `FRONTEND_SEO_PROMPTS.md` → PROMPT 15
**Por qué:** ES EL diferenciador #1 del producto. Debe ser la pantalla más impresionante.
**Comando para Claude Code:**
```
Lee el archivo FRONTEND_SEO_PROMPTS.md y ejecuta el PROMPT 15 completo: rediseño del tracking de consultas con mapa 60%, bottom sheet 40%, ETA dinámico, perfil médico con foto y rating, mensajes tranquilizadores en ES+EN, botón 112 siempre visible.
```

### ▶ STEP 7 — Mobile-first responsive optimization
**Por qué:** El turista usa la web desde el móvil del hotel. Debe funcionar perfectamente sin instalar nada.
**Comando para Claude Code:**
```
Optimiza OnCall Clinic como web app mobile-first responsive:
1. Revisa todos los breakpoints de Tailwind en las páginas principales (landing, dashboard paciente, tracking, dashboard médico). Asegúrate de que la experiencia en pantallas de 375px-428px (iPhones) es perfecta.
2. Implementa bottom navigation sticky en mobile para pacientes: 🏠 Inicio | 📋 Historial | 👤 Perfil | ❓ Ayuda
3. Implementa bottom navigation sticky en mobile para médicos: 🏠 Panel | 📋 Consultas | 💰 Ganancias | 👤 Perfil
4. Botón flotante de urgencia en mobile (sticky bottom-right, rojo, pulsante) que siempre está visible en el dashboard del paciente
5. Touch targets: todos los botones interactivos deben tener mínimo 44x44px (WCAG)
6. Viewport meta tag correcto: <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
7. Prueba: todas las páginas deben verse bien en Chrome DevTools responsive mode (iPhone 14, Galaxy S23, iPad)
```

---

## SPRINT 2 — DIFERENCIADORES (Después del MVP)

### ▶ STEP 8 — Chat post-consulta médico-paciente
**Por qué:** Feature estrella única. Ninguna app de salud en España lo tiene bien implementado.
**Comando para Claude Code:**
```
Implementa el sistema de chat post-consulta en OnCall Clinic usando Supabase Realtime:

1. Crea la tabla en Supabase:
CREATE TABLE consultation_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  sender_role TEXT CHECK (sender_role IN ('patient', 'doctor')),
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- RLS: solo participantes de la consulta pueden leer/escribir
-- El chat se bloquea automáticamente 48 horas después de consultation.completed_at

2. Crea app/consultation/[id]/chat/page.tsx:
- Header: foto médico + nombre + "Disponible 48h post-consulta"
- Burbuja de mensajes estilo WhatsApp (médico derecha, paciente izquierda)
- Input con envío en Enter y botón enviar
- Realtime subscription a consultation_messages para this consultation_id
- Indicador de "leído" (checkmark doble)
- Cuando quedan menos de 6 horas: banner "Este chat cierra en X horas"
- Cuando está cerrado: "Este chat ha expirado. Para una nueva consulta, reserva una visita."

3. Notificación push cuando el médico responde (usar Supabase Edge Function + Web Push API)
4. Añadir badge de mensajes no leídos en el dashboard del paciente
5. En ES: "Chat con tu médico" | EN: "Chat with your doctor"
```

### ▶ STEP 9 — Admin Panel con IA
**Archivo:** `ADMIN_AI_PROMPTS.md` → PROMPT 21 (navegación) + PROMPT 17 (verificación IA)
**Comando para Claude Code:**
```
Lee el archivo ADMIN_AI_PROMPTS.md y ejecuta:
1. PRIMERO el PROMPT 21: rediseña la navegación completa del admin (sidebar, header con búsqueda global, badges dinámicos)
2. LUEGO el PROMPT 17: sistema de verificación de documentos médicos con IA (tabla Supabase, API route con Claude Vision para analizar RC insurance y licencia médica, UI de revisión con semáforo)
Necesitas la variable de entorno ANTHROPIC_API_KEY=sk-ant-[tu-key]
```

### ▶ STEP 10 — Sistema de Reclamaciones
**Archivo:** `ADMIN_AI_PROMPTS.md` → PROMPT 18
**Comando para Claude Code:**
```
Lee el archivo ADMIN_AI_PROMPTS.md y ejecuta el PROMPT 18 completo: sistema de reclamaciones con tabla Supabase, triaje automático con IA (prioridad urgente/alta/media/baja), borrador de respuesta IA, workflow de resolución, emails automáticos al paciente y al médico.
```

### ▶ STEP 11 — Dashboards paciente y médico mejorados
**Archivo:** `FRONTEND_SEO_PROMPTS.md` → PROMPT 13 + PROMPT 14
**Comando para Claude Code:**
```
Lee el archivo FRONTEND_SEO_PROMPTS.md y ejecuta:
- PROMPT 13: rediseño patient dashboard con quick actions (urgencia/programada/IV drips/teleconsulta), floating CTA urgencia en mobile, estados de consulta con copy ES+EN
- PROMPT 14: rediseño doctor dashboard con toggle disponibilidad prominente, card de solicitud entrante con countdown 45s, gráfico de ganancias recharts
```

---

## SPRINT 3 — ESCALABILIDAD (Cuando haya tracción)

### ▶ STEP 12 — Servicios adicionales: IV Drips & Fisioterapia
**Comando para Claude Code:**
```
Añade dos nuevas categorías de servicio a OnCall Clinic:

1. En la tabla consultations, añade a service_type el enum: 'iv_drip', 'physio'
2. Migración Supabase: ALTER TYPE service_type ADD VALUE 'iv_drip'; ADD VALUE 'physio';
3. Actualiza app/patient/request/page.tsx para mostrar las nuevas categorías:
   - 💧 "IV Drip & Wellness" — €180 — "Hidratación, vitaminas, tratamiento resaca" | "Hydration, vitamins, hangover treatment"
   - 🦵 "Fisioterapia" — €120 — "Valoración y tratamiento domicilio" | "Assessment and home treatment"
4. Actualiza el catálogo de servicios en la landing page con estas nuevas categorías
5. Crea páginas SEO en /servicios/iv-drips-ibiza y /servicios/fisioterapia-domicilio-ibiza
```

### ▶ STEP 13 — Sistema de reviews y reputación
**Comando para Claude Code:**
```
Implementa el sistema completo de ratings y reviews en OnCall Clinic:

1. Tabla en Supabase:
CREATE TABLE consultation_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consultation_id UUID REFERENCES consultations(id) UNIQUE,
  patient_id UUID REFERENCES profiles(id),
  doctor_id UUID REFERENCES profiles(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Trigger que actualiza doctor_profiles.average_rating automáticamente

2. En app/patient/tracking/[id]/page.tsx: cuando status=completed, mostrar modal de rating con 5 estrellas + comment opcional + botón "Enviar valoración" | "Submit review"

3. En app/doctor/profile/[id]/page.tsx: mostrar rating medio, número de reviews, últimas 3 reviews públicas

4. En la búsqueda de médicos: mostrar rating y número de consultas
5. Reviews con menos de 3 estrellas generan una notificación al admin automáticamente
```

### ▶ STEP 14 — Pasaporte médico digital (QR)
**Comando para Claude Code:**
```
Implementa el pasaporte médico digital para pacientes en OnCall Clinic:

1. Añade campos a la tabla profiles:
   - allergies TEXT[] 
   - chronic_conditions TEXT[]
   - current_medications TEXT[]
   - blood_type TEXT
   - emergency_contact JSONB
   - medical_passport_enabled BOOLEAN DEFAULT false

2. Crea app/patient/medical-passport/page.tsx:
   - Formulario para rellenar datos médicos básicos
   - Toggle para activar el pasaporte público
   - Vista previa del QR

3. Crea app/passport/[patient_id]/page.tsx (pública, sin auth):
   - Muestra datos básicos: nombre, grupo sanguíneo, alergias, medicación actual
   - Solo visible si medical_passport_enabled = true
   - Diseño tipo tarjeta de emergencia, imprimible
   - Metadata: "Medical Emergency Card — OnCall Clinic"

4. En el doctor dashboard, cuando acepta una consulta, muestra botón "Ver pasaporte médico del paciente" si está activado

5. Genera QR code (usa qrcode.react) con la URL del pasaporte
6. Añade a la sección "Mi perfil": "🩺 Pasaporte Médico Digital" con badge "Protege tu salud en viajes"
```

---

## VARIABLES DE ENTORNO — Checklist completo

Crea/actualiza `.env.local` con:
```bash
# Supabase (ya existente)
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe (ya existente)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Google Maps (ya existente)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...

# Anthropic Claude (NUEVO — para admin IA)
ANTHROPIC_API_KEY=sk-ant-...

# Email transaccional (NUEVO)
RESEND_API_KEY=re_...

# App URL (NUEVO — para SEO y emails)
NEXT_PUBLIC_APP_URL=https://oncallclinic.com

# Admin email (NUEVO)
ADMIN_EMAIL=admin@oncallclinic.com

# (PWA/Push desactivado por ahora — se añadirá cuando haya app nativa)
```

---

## ARQUITECTURA OBJETIVO (para ser el mejor del mundo)

```
OnCall Clinic
├── PACIENTE
│   ├── Landing ES+EN (SEO exquisito para Ibiza)
│   ├── Registro con GDPR consent (5 checkboxes)
│   ├── Dashboard con 4 quick actions
│   ├── Flujo reserva 4 pasos (tipo, síntomas, ubicación, pago)
│   ├── GPS Tracking Uber-like (EL diferenciador)
│   ├── Chat post-consulta 48h (feature estrella)
│   ├── Historial de consultas + resúmenes
│   ├── Pasaporte médico digital (QR)
│   └── Perfil + preferencias de idioma
│
├── MÉDICO / PROFESIONAL
│   ├── Onboarding con RC Insurance (legal crítico)
│   ├── Dashboard con toggle disponibilidad
│   ├── Solicitudes entrantes con countdown 45s
│   ├── Mapa de pacientes en zona
│   ├── Historial de consultas y ganancias
│   ├── Chat con pacientes (48h post-consulta)
│   └── Dashboard financiero Stripe
│
├── ADMIN
│   ├── Dashboard + AI daily briefing
│   ├── Verificación docs con IA (Claude Vision)
│   ├── Sistema de reclamaciones con IA
│   ├── Chat asistente IA (Claude Sonnet)
│   ├── Dashboard financiero
│   ├── Gestión médicos (RC expiry tracking)
│   └── Configuración plataforma
│
└── INFRA
    ├── Next.js 14 Web App (responsive, mobile-first)
    ├── Supabase (DB + Auth + Realtime + Storage)
    ├── Stripe Connect (pagos + payouts automáticos)
    ├── Google Maps (geocoding + routing)
    ├── Claude API (admin IA + doc verification)
    ├── Resend (emails transaccionales)
    ├── Vercel (hosting + edge functions)
    └── Email notifications (Resend — sin push notifications por ahora)
```

---

## KPIs DE ÉXITO (para medir si somos los mejores)

| Métrica | Target MVP | Target 6 meses | Target mundial |
|---------|-----------|----------------|----------------|
| Tiempo de llegada médico | < 45 min | < 30 min | < 20 min |
| Rating medio plataforma | 4.5★ | 4.8★ | 4.9★ |
| Tasa de conversión landing | > 3% | > 5% | > 8% |
| NPS pacientes | > 40 | > 60 | > 70 |
| Tasa reclamaciones | < 5% | < 2% | < 1% |
| Médicos activos Ibiza | 10 | 30 | 100 |
| Tiempo de verificación médico | 48h manual | 24h semi-auto | 2h IA |
| Retención pacientes (2ª consulta) | > 20% | > 35% | > 50% |

---

## PRÓXIMA SESIÓN CON CLAUDE CODE

Copia y pega esto a Claude Code para empezar inmediatamente:

```
Estoy construyendo OnCall Clinic, una plataforma Uber-like de médicos a domicilio en Ibiza. 
El proyecto ya existe en Next.js 14 con Supabase y Stripe. 

Para esta sesión, quiero ejecutar el STEP 1 del archivo MASTER_STRATEGY.md: 
implementar i18n ES+EN con next-intl.

Lee primero el archivo FRONTEND_SEO_PROMPTS.md y busca el PROMPT 9.
Luego ejecútalo completamente. El usuario primario es turista europeo (UK/DE/NL) 
que no habla español, así que el inglés es crítico desde el día 1.

Cuando termines, ejecuta npm run build para verificar que no hay errores.
```
