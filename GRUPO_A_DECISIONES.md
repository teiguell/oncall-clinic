# GRUPO A — Product Builder: Decisiones que Desbloquean a Todos
**Fecha:** 2026-04-14
**Estado:** DEFINITIVO — no revisable sin aprobación del Director

---

## DECISIÓN 1 — Stack Definitivo → DESBLOQUEA GRUPO B

| Capa | Tecnología | Versión | Estado |
|------|-----------|---------|--------|
| Framework | Next.js (App Router) | 14.2.x | ✅ Implementado |
| Runtime | React + TypeScript | 18.3 / 5.x | ✅ Implementado |
| Base de datos | Supabase (Postgres + PostGIS) | SDK 2.99 | ✅ Schema deployed |
| Auth | Supabase Auth (JWT + RLS) | SSR 0.9 | ✅ Implementado |
| Realtime | Supabase Realtime | - | ✅ Habilitado en consultations, doctor_profiles, notifications |
| Pagos | Stripe Connect Express | SDK 20.x | ✅ Implementado (paymentIntent + transfers + payouts) |
| Mapas | Google Maps (@vis.gl/react-google-maps) | 1.7 | ✅ Implementado |
| Estado cliente | Zustand | 5.x | ✅ Implementado (consultation.store) |
| Formularios | React Hook Form + Zod | 7.71 / 3.x | ✅ Implementado |
| UI | Tailwind CSS + Radix UI + Lucide | 4.x | ✅ Implementado |
| i18n | next-intl | 3.22 | ✅ Implementado (ES+EN) |
| Hosting | Vercel | - | 🔄 Pendiente deploy |
| Email | Resend | - | 🔴 Por instalar |
| IA Admin | Anthropic Claude API | Sonnet/Haiku/Opus | 🔴 Por integrar |

**CONFIRMADO: El stack NO cambia. Grupo B puede construir sobre esto.**

---

## DECISIÓN 2 — Flujo de Booking (paso a paso) + Webhooks → DESBLOQUEA GRUPO B

### Flujo Paciente: Solicitud de Consulta

```
PASO 1 — Tipo de consulta
├── 🚨 Urgente (médico en ~30 min, multiplier x1.5-2.0)
└── 📅 Programada (elige fecha + hora)

PASO 2 — Servicio
├── Medicina General ............ €150
├── Pediatría ................... €170
├── Urgencias ................... €200
├── Enfermería .................. €100
└── (futuro: IV Drips €180, Fisio €120)

PASO 3 — Síntomas + Ubicación
├── Textarea: describir síntomas (min 20 chars)
├── Geolocalización automática (navigator.geolocation)
├── Fallback: input dirección manual
└── Reverse geocoding → dirección legible

PASO 4 — Confirmación + Pago
├── Resumen: tipo, servicio, precio, ubicación
├── Stripe Payment Element (card, Apple Pay, Google Pay)
├── Crear PaymentIntent (amount_cents, consultation_id)
├── Al confirmar pago → INSERT consultation (status: 'pending')
└── Redirect → /patient/tracking/[id]
```

### Secuencia completa de estados + webhooks

```
┌─────────────────────────────────────────────────────────────────┐
│ ESTADO              ACCIÓN                    WEBHOOK/TRIGGER    │
├─────────────────────────────────────────────────────────────────┤
│ 1. pending          Paciente paga             stripe: payment_   │
│                     Buscar médicos cercanos    intent.succeeded  │
│                     (find_nearest_doctors)     → Notif a médicos │
│                                                                  │
│ 2. accepted         Médico acepta             supabase: realtime │
│                     doctor_id asignado         UPDATE consultat.  │
│                     accepted_at = NOW()        → Notif paciente  │
│                                                                  │
│ 3. in_progress      Médico en camino          supabase: realtime │
│                     GPS tracking activo        UPDATE doctor_     │
│                     started_at = NOW()         profiles (lat/lng) │
│                                                → Push ETA update │
│                                                                  │
│ 4. arrived          Médico llega              supabase: realtime │
│                     Botón "He llegado"         UPDATE consultat.  │
│                                                → Notif paciente  │
│                                                                  │
│ 5. completed        Médico finaliza           stripe: transfer   │
│                     completed_at = NOW()       processPayout()   │
│                     Trigger payout 85%         → Email resumen   │
│                     Chat 48h se activa         → Abrir rating    │
│                                                                  │
│ 6. cancelled        Paciente o médico         stripe: refund     │
│    (alternativo)    cancellation_reason        (si < 5 min)      │
│                     cancelled_at = NOW()       → Notif a ambos   │
└─────────────────────────────────────────────────────────────────┘
```

### Stripe Webhooks que Grupo B debe implementar

| Webhook | Acción |
|---------|--------|
| `payment_intent.succeeded` | Confirmar consulta, notificar médicos cercanos |
| `payment_intent.payment_failed` | Marcar como fallido, notificar paciente |
| `transfer.created` | Actualizar payout_status = 'processing' |
| `transfer.paid` | Actualizar payout_status = 'completed', payout_at |
| `transfer.failed` | Alertar admin, reintentar, actualizar payout_status = 'failed' |
| `account.updated` | Actualizar stripe_onboarded en doctor_profiles |

### Endpoint webhook: `POST /api/stripe/webhook`

```
1. Verificar signature con STRIPE_WEBHOOK_SECRET
2. Switch por event.type
3. Actualizar Supabase con service_role key (bypassa RLS)
4. Loguear en consultation_status_history
```

### Política de cancelación

| Momento | Cargo |
|---------|-------|
| Antes de aceptar médico | 0% — refund completo |
| Después de aceptar, médico no en camino | 20% — cargo administrativo |
| Médico ya en camino | 50% — compensación desplazamiento |
| Médico ha llegado | 100% — no refund |

### Timeout automático

| Evento | Timeout | Acción |
|--------|---------|--------|
| Sin médico acepta | 10 min | Cancelar, refund 100%, sugerir teleconsulta |
| Médico no llega | 60 min post-accept | Alerta admin, reasignar |
| Médico acepta pero no marca "en camino" | 5 min | Reminder push |

---

## DECISIÓN 3 — Panel de Privacidad + Consentimiento Granular → DESBLOQUEA GRUPO C

### Tabla Supabase: `consent_audit_log` (NUEVA)

```sql
CREATE TABLE consent_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  granted BOOLEAN NOT NULL,
  version TEXT NOT NULL,        -- ej: 'v1.0'
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- NUNCA se borra. Exportable CSV para AEPD.
```

### Campos en `profiles` (añadir):

```sql
ALTER TABLE profiles ADD COLUMN consent_log JSONB DEFAULT '{}';
-- Estructura:
-- {
--   "terms_accepted": true,
--   "terms_version": "v1.0",
--   "terms_at": "2026-04-14T...",
--   "privacy_accepted": true,
--   "health_data_consent": true,
--   "intermediation_notice": true,
--   "marketing_consent": false
-- }
```

### 5 Checkboxes en Registro de Paciente (OBLIGATORIOS excepto marketing)

| # | Checkbox | Obligatorio | Normativa |
|---|----------|------------|-----------|
| 1 | Acepto los Términos y Condiciones | ✅ Sí | LSSI-CE art. 10 |
| 2 | Acepto la Política de Privacidad | ✅ Sí | RGPD art. 6.1.a |
| 3 | Consiento el tratamiento de datos de salud | ✅ Sí | RGPD art. 9.2.a |
| 4 | Entiendo que la plataforma es intermediaria, no un centro médico | ✅ Sí | Ley 44/2003 art. 4 |
| 5 | Acepto comunicaciones comerciales (email) | ❌ Opcional | LSSI-CE art. 21 |

### Panel de Privacidad en Perfil (`/patient/profile/privacy`)

```
┌─────────────────────────────────────────────┐
│ 🔒 Tu Privacidad                            │
│                                              │
│ Consentimientos activos:                     │
│ ✅ Términos y condiciones (v1.0, 14/04/2026)│
│ ✅ Política de privacidad (v1.0, 14/04/2026)│
│ ✅ Datos de salud (v1.0, 14/04/2026)        │
│ ✅ Intermediación (v1.0, 14/04/2026)        │
│ ❌ Marketing — [Activar]                     │
│                                              │
│ [📥 Descargar mis datos]    (RGPD art. 20)  │
│ [🗑️ Solicitar eliminación]  (RGPD art. 17)  │
│ [📧 Contactar DPO]                          │
└─────────────────────────────────────────────┘
```

### Derechos ARCO-POL implementados:

| Derecho | Implementación |
|---------|---------------|
| Acceso (art. 15) | Botón "Descargar mis datos" → JSON export |
| Rectificación (art. 16) | Editar perfil directamente |
| Supresión (art. 17) | "Solicitar eliminación" → ticket a admin |
| Portabilidad (art. 20) | Export CSV/JSON de consultas + datos |
| Oposición (art. 21) | Revocar marketing consent |
| Limitación (art. 18) | Desactivar cuenta sin borrar |

---

## DECISIÓN 4 — Flujo Onboarding Médico (COMIB + RC + RETA) → DESBLOQUEA GRUPO C

### Flujo de alta paso a paso

```
PASO 1 — Datos personales
├── Nombre completo
├── Email
├── Teléfono (con prefijo +34)
├── DNI/NIE
└── Foto profesional (Supabase Storage)

PASO 2 — Datos profesionales (COMIB)
├── Número de colegiación COMIB (Colegio Oficial de Médicos de Islas Baleares)
│   └── Formato: 07/XXXXX (07 = código provincial Baleares)
├── Especialidad (select)
├── Bio profesional (max 300 chars)
├── Idiomas: ES, EN, DE, FR (multiselect — mínimo ES+EN para Ibiza)
└── Años de experiencia

PASO 3 — Documentación legal
├── 📄 Título de colegiación (PDF/imagen) → Supabase Storage
│   └── Verificación: admin revisa → futuro: Claude Vision
├── 📄 Póliza RC profesional (PDF/imagen) → Supabase Storage
│   ├── Compañía aseguradora (input text)
│   ├── Número de póliza (input text)
│   ├── Fecha vencimiento (date picker)
│   ├── Importe cobertura (number — mínimo €300.000)
│   └── ⚠️ Si < €300.000 → bloquear registro con mensaje error
├── 📄 Certificado alta en RETA (Régimen Especial Trabajo Autónomo)
│   └── O declaración responsable de estar al corriente
└── 📄 DNI/NIE (ambas caras) → Supabase Storage

PASO 4 — Contrato de afiliación
├── Mostrar contrato completo (scroll obligatorio)
├── Cláusula de indemnidad EN ROJO: "El profesional asume 100% de la 
│   responsabilidad clínica por los actos médicos realizados"
├── Checkbox: "He leído y acepto el contrato de afiliación" (obligatorio)
├── Guardar: contract_accepted_at, contract_version, contract_ip
└── Firma digital: nombre completo tecleado como firma

PASO 5 — Stripe Connect Onboarding
├── Crear cuenta Express: createDoctorStripeAccount()
├── Redirect a Stripe onboarding link
├── Return URL → /doctor/earnings?connected=true
└── Actualizar stripe_onboarded = true
```

### Campos a añadir a `doctor_profiles` (migración):

```sql
ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS
  rc_insurance_url TEXT,
  rc_insurance_expiry DATE,
  rc_insurance_company TEXT,
  rc_insurance_policy_number TEXT,
  rc_coverage_amount INTEGER,         -- en euros
  reta_certificate_url TEXT,
  reta_status TEXT DEFAULT 'pending' CHECK (reta_status IN ('pending', 'verified', 'exempt')),
  dni_url TEXT,
  languages TEXT[] DEFAULT '{"es"}',
  years_experience INTEGER,
  contract_accepted_at TIMESTAMPTZ,
  contract_version TEXT,
  contract_ip INET;
```

### Estado de verificación del médico:

```
pending  → Acaba de registrarse, documentación subida
          ↓ Admin revisa (o IA en futuro)
approved → Puede recibir consultas, toggle disponibilidad activo
          ↓ Si RC caduca o problema
suspended → No puede recibir consultas, se notifica por email
          ↓ Si infracción grave
rejected → Cuenta deshabilitada permanentemente
```

### Cron job: `/api/cron/check-rc-expiry` (diario 08:00)

```
1. SELECT doctors WHERE rc_insurance_expiry <= NOW() + INTERVAL '7 days'
   AND verification_status = 'approved'
2. Si expira en < 7 días → email warning al médico
3. Si ya expirada → UPDATE verification_status = 'suspended'
4. Notificar al admin
```

---

## DECISIÓN 5 — Ratings/Reviews en MVP → DESBLOQUEA GRUPO D

**DECISIÓN: SÍ, incluir en MVP. Razón: es trust signal crítico para turistas que no conocen a los médicos.**

### Implementación MVP (mínimo viable):

| Componente | MVP | Post-MVP |
|------------|-----|----------|
| Rating 1-5 estrellas | ✅ | ✅ |
| Comentario texto (opcional) | ✅ | ✅ |
| Mostrar rating medio en perfil médico | ✅ | ✅ |
| Reviews públicas visibles | ❌ (solo rating) | ✅ |
| Respuesta del médico al review | ❌ | ✅ |
| Moderación de reviews | ❌ | ✅ |
| Alerta admin si rating < 3 | ✅ | ✅ |

### Flujo de rating:

```
1. Consulta status = 'completed'
2. Modal aparece automáticamente: "¿Cómo fue tu consulta con Dr. X?"
3. 5 estrellas clickables + textarea opcional
4. Guardar en consultations.rating + consultations.review
5. Trigger: UPDATE doctor_profiles SET 
   rating = (SELECT AVG(rating) FROM consultations WHERE doctor_id = X AND rating IS NOT NULL),
   total_reviews = total_reviews + 1
6. Si rating <= 2 → INSERT notification para admin (type: 'low_rating_alert')
```

### Campo ya existe en schema: `consultations.rating` + `consultations.review` ✅

---

## DECISIÓN 6 — Soporte In-App: Crisp → DESBLOQUEA GRUPO D

**DECISIÓN: Crisp. No Intercom.**

| Criterio | Crisp | Intercom |
|----------|-------|----------|
| Precio MVP | Gratis (2 agentes) | $74/mes |
| Chat en vivo | ✅ | ✅ |
| Chatbot básico | ✅ (gratis) | ✅ (de pago) |
| SDK Next.js | `@crisp/react-crisp` | más complejo |
| Widget bilingüe | ✅ (auto detect) | ✅ |
| Knowledge base | ✅ (gratis) | de pago |
| Mobile responsive | ✅ | ✅ |
| WhatsApp integration | ✅ (Pro, €25/mes) | ✅ (de pago) |

**Razones:**
1. **Gratis para MVP** — no gastamos en soporte hasta que haya volumen
2. **Widget auto-detección idioma** — perfecto para turistas ES+EN
3. **SDK sencillo** — un `<CrispChat>` component en layout.tsx
4. **WhatsApp** — si los turistas prefieren WhatsApp, upgrade a Pro por €25/mes

### Implementación:

```typescript
// components/shared/crisp-chat.tsx
'use client'
import { Crisp } from 'crisp-sdk-web'
import { useEffect } from 'react'

export function CrispChat() {
  useEffect(() => {
    Crisp.configure('YOUR_WEBSITE_ID')
    // Auto-set language based on locale
    Crisp.setLocale(document.documentElement.lang === 'en' ? 'en' : 'es')
  }, [])
  return null
}

// En app/[locale]/layout.tsx:
<CrispChat />
```

---

## RESUMEN DE DESBLOQUEOS

| Grupo | Decisión | Estado |
|-------|----------|--------|
| **Grupo B** (Backend) | ✅ Stack confirmado + flujo booking + webhooks Stripe | **DESBLOQUEADO** |
| **Grupo C** (Legal/Compliance) | ✅ Panel privacidad + consent granular + onboarding médico COMIB/RC/RETA | **DESBLOQUEADO** |
| **Grupo D** (Ops/Soporte) | ✅ Ratings en MVP (solo estrellas) + Crisp para soporte | **DESBLOQUEADO** |

---

## PREGUNTAS PENDIENTES PARA EL DIRECTOR

1. **NIF de Ibiza Care SL** — Grupo C necesita esto para completar los documentos legales
2. **Trademark ibiza.care** — ¿Se ha verificado en OEPM? (ver Competitive Brief)
3. **Primer lote de médicos** — ¿Tenemos contacto con el COMIB para captar los primeros 10 médicos?
4. **Dominio** — ¿oncallclinic.com está registrado?
