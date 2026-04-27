# URGENT — Round 14 · 2 bugs P0 bloqueando audit live pro flow

**De**: Cowork (Director audit Round 13)
**Fecha**: 2026-04-27 13:30
**Severidad**: P0 — bloquea audit doctor end-to-end + funnel registro pro
**Detectado durante**: audit live post-deploy bypass=doctor

---

## Bug 1 — Bypass NO cubre middleware (route guards)

### Reproducción

```
Vercel env: NEXT_PUBLIC_AUTH_BYPASS=true + NEXT_PUBLIC_AUTH_BYPASS_ROLE=doctor (commit d9d81b0 + nuevo deploy GN1jivmV6)
1. Logout (Cerrar sesión)
2. Navegar https://oncall.clinic/es/doctor/dashboard
Resultado: redirige a /es/login?next=%2Fes%2Fdoctor%2Fdashboard
Esperado: dashboard doctor renderizado con sesión simulada demo-doctor
```

### Root cause

`lib/supabase/middleware.ts:44` llama `supabase.auth.getUser()` directamente y, cuando `user === null`, dispara redirect a `/login`. **NO importa ni llama** `getBypassUser()` de `lib/auth-bypass.ts`.

Round 11 Fix A introdujo `getBypassUser()` con role-aware mapping (patient/doctor/admin) — pero solo se integró en `app/api/stripe/checkout/route.ts:34`. El middleware sigue ciego al bypass → para Cowork las rutas `/doctor/*` y `/patient/*` (excepto `/patient/request`) son inaccesibles sin sesión real.

Banner UI (`AuthBypassBanner`) lee `NEXT_PUBLIC_AUTH_BYPASS_ROLE` correctamente y muestra "DOCTOR" — solo el middleware está roto.

### Fix mínimo

```typescript
// lib/supabase/middleware.ts línea ~44
import { getBypassUser, AUTH_BYPASS_ROLE } from '@/lib/auth-bypass'

const { data: { user: realUser } } = await supabase.auth.getUser()
const bypassUser = getBypassUser()
const user = realUser ?? bypassUser

// Si bypass: profile.role debe venir del bypass user, no de DB
const profileRole = realUser
  ? (await fetchProfileRole(realUser.id))
  : (bypassUser?.role ?? null)
```

Aplicar mismo patrón en cualquier otro layout/handler que haga route protection vía `getUser()`. Buscar:
```
grep -rn "supabase.auth.getUser" app/ lib/ | grep -v node_modules
```

### Verificación post-fix

Con `AUTH_BYPASS_ROLE=doctor`:
- ✓ /es/doctor/dashboard → renderiza (no redirect)
- ✓ /es/doctor/onboarding → renderiza
- ✓ Avatar dropdown muestra "demo-doctor@oncall.clinic" + chip "Doctor"

Con `AUTH_BYPASS_ROLE=patient`:
- ✓ /es/patient/dashboard → renderiza (regression test)

---

## Bug 2 — Ruta `/es/pro/registro` no existe (CTA roto)

### Reproducción

```
1. Navegar https://oncall.clinic/es/pro
2. Click "Empezar registro · 5 min" (CTA primario hero)
Resultado: pantalla blanca (404 silencioso)
Esperado: formulario onboarding doctor 4 pasos (registro / docs / verificación / primera visita)
```

### Root cause

`app/[locale]/pro/` contiene SOLO `page.tsx` (landing). NO existe `app/[locale]/pro/registro/page.tsx`. La landing v3 promete "Empezar registro" pero el destino no está implementado.

### Fix

Crear `app/[locale]/pro/registro/page.tsx` con flujo onboarding:
1. **Paso 1** — Datos personales: nombre, COMIB, email, teléfono
2. **Paso 2** — Documentos: upload COMIB cert + RC (con seguro AXA/Mapfre/etc) + IBAN
3. **Paso 3** — Stripe Connect onboarding (link a Stripe Connect Express)
4. **Paso 4** — Verificación: email OTP + SMS OTP + admin approval (24-48h)
5. Redirige a `/es/doctor/dashboard` cuando `activation_status === 'verified'`

Usar el dispatcher de notifications ya existente (`lib/notifications/*`) + migration 021 ya aplicada (`activation_status`, `email_verified_at`, `phone_verified_at`).

Alternativa rápida (si registro completo va a tomar sprint dedicado): redirigir CTA `/es/pro` → `/es/doctor/login?signup=1` con magic link + onboarding posterior. **Decisión Director**.

---

## Decisión SMS provider — Twilio MVP confirmado

Análisis Cowork (vs WhatsApp Business 360dialog vs email-only):

| Momento | Canal | Justificación |
|---|---|---|
| OTP activación médico | **Twilio SMS** | Doctor sin OnCall app instalada todavía |
| "Médico aceptó tu visita" | **SMS + Push** | Paciente con fiebre no abre email |
| "Médico llegando 10 min" | **SMS + Push** | Crítico tiempo-real |
| Confirmación booking + factura | **Email Resend** | Detalle largo, archivable |
| Recordatorio cita programada | **WhatsApp** (Q3) | Migrar cuando volumen justifique €0.04 vs €0.07 |

Coste MVP estimado: 850 visitas × 3 SMS × €0.07 = **€178/mes** → cubre 10% comisión sin problema.

### Implementación

`lib/notifications/sms.ts` — actualmente stub. Reemplazar stub por Twilio real:

```typescript
import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!,
)

export async function sendSMS(to: string, body: string) {
  return client.messages.create({
    from: process.env.TWILIO_FROM_NUMBER!, // +34 número alfanumérico Spain
    to, // E.164 format
    body, // ≤160 caracteres ASCII (Spain GSM-7), sino split
  })
}
```

Env vars Vercel necesarias:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER` (alfanumérico "OnCall" si Twilio lo aprueba para España)

Tei activará cuenta Twilio. Pedirá las 3 credentials.

---

## Orden trabajo Round 14

1. **P0 Bug 1**: Fix middleware bypass (1-2h)
2. **P0 Bug 2**: Crear `/es/pro/registro` (sprint o redirect rápido — Director decide)
3. **P1**: Implementar Twilio en `lib/notifications/sms.ts` (1h, espera credentials)
4. **R2/R3 verification**: tras Bug 1 fix, audit live doctor flow completo

Ack en outbox cuando Bug 1 fixed (Cowork verificará live antes de aprobar Bug 2).
