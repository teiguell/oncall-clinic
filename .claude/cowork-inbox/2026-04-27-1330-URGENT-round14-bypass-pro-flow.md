# URGENT Round 14 — Bypass middleware + /pro/registro + SMS Twilio MVP

**De**: Cowork (Director ops)
**Para**: Code
**Tipo**: 3 entregables (2 bugs P0 + 1 feature confirmada)
**Audit live ejecutado**: 2026-04-27 12:30 con Chrome MCP, deploy `GN1jivmV6` (Round 13 + AUTH_BYPASS_ROLE=doctor)

---

## Bug P0 #1 — Middleware NO aplica `getBypassUser()` en route guards

### Reproducción

1. Vercel env vars: `NEXT_PUBLIC_AUTH_BYPASS=true` + `NEXT_PUBLIC_AUTH_BYPASS_ROLE=doctor` ✓ activas
2. `AuthBypassBanner` muestra correctamente `(DOCTOR)` ✓
3. Navego a `https://oncall.clinic/es/doctor/dashboard`
4. **Resultado**: redirect a `/es/login?next=/es/doctor/dashboard` ❌
5. **Esperado**: render del doctor dashboard como demo-doctor

### Root cause

`lib/supabase/middleware.ts:44`:

```ts
const { data: { user } } = await supabase.auth.getUser()
```

NO importa ni llama `getBypassUser()` desde `lib/auth-bypass.ts`. Cuando no hay sesión real:
- `user` = null
- middleware redirect a `/login`
- el bypass solo aplicó al banner UI (componente client-side) y a `/api/stripe/checkout/route.ts` (Round 9 Fix H)

El bypass está **parcialmente implementado**. Round 11 Fix A creó el role-aware mapping pero NO lo cableó al middleware ni a los layouts protegidos.

### Fix solicitado

Modificar `lib/supabase/middleware.ts` para usar bypass cuando aplica:

```ts
import { getBypassUser, AUTH_BYPASS_ROLE } from '@/lib/auth-bypass'

// ...
const { data: { user: realUser } } = await supabase.auth.getUser()
const bypassUser = getBypassUser()
const user = realUser ?? bypassUser  // bypass solo si no hay sesión real

// Y para el role lookup posterior (líneas 94-99): si user es bypass,
// el role viene de bypass.user_metadata.role en vez de profile.role
const role = realUser
  ? (await supabase.from('profiles').select('role').eq('id', realUser.id).single())?.data?.role
  : bypassUser?.role  // 'doctor' | 'patient' | 'admin'
```

### Acceptance criteria

Tras fix:
- `/es/doctor/dashboard` carga el doctor dashboard con `NEXT_PUBLIC_AUTH_BYPASS_ROLE=doctor` (sin redirect a login)
- `/es/patient/dashboard` carga patient dashboard con `=patient`
- `/es/login` con bypass activo: si user va al login con bypass, redirige al dashboard del role
- Logout desde menu user: limpia cookies pero bypass sigue siendo el fallback (no rompe la app)
- Real session sigue ganando sobre bypass (no regression)

---

## Bug P0 #2 — `/es/pro/registro` no existe (CTA del landing pro lleva a página blanca)

### Reproducción

1. Navego a `https://oncall.clinic/es/pro/registro`
2. **Resultado**: pantalla blanca, sin contenido renderizado
3. **Esperado**: formulario onboarding médico (paso 1 de 3-4)

### Root cause

`app/[locale]/pro/` solo contiene `page.tsx` (el landing). NO existe `app/[locale]/pro/registro/page.tsx` ni rutas anidadas del onboarding pro. El landing v3 tiene CTAs "Empezar registro · 5 min" que no llevan a ningún lado funcional.

### Decisión Director (escalar tras este inbox)

Tei va a decidir entre:

| Opción | Esfuerzo | Resultado |
|---|---|---|
| A. Build completo `/es/pro/registro` (3-4 pasos onboarding) | 1 sprint | Onboarding nativo en app |
| B. Redirect quick a `/es/doctor/login?signup=1` | 30 min | Reusa flow doctor existente |

**Recomendación Cowork**: B para alpha (rápido), A en Q3 (mejor UX dedicada para captación).

Mientras Tei decide, **NO ejecutar fix**. Esperar `2026-04-27-XXXX-pro-registro-decision.md` en inbox.

### Mientras tanto: parche de seguridad

Para evitar pantalla blanca, crear un placeholder mínimo en `/es/pro/registro/page.tsx`:

```tsx
import { redirect } from 'next/navigation'
export default function ProRegistroPlaceholder({ params }: { params: { locale: string } }) {
  redirect(`/${params.locale}/doctor/login?signup=1`)
}
```

Esto cubre Opción B temporalmente. Si Director elige Opción A más adelante, se reemplaza.

---

## Feature confirmada — SMS Twilio MVP

### Decisión Director (confirmada por Tei en chat 27-abr 13:15)

SMS = feature de calidad necesaria. Provider: **Twilio España** (~€0.06-0.08/SMS).

### 3 momentos críticos para SMS (no email)

| Trigger | Evento | Destino | Plantilla |
|---|---|---|---|
| Médico activa cuenta | OTP verificación móvil | doctor.phone | `OnCall: tu código de activación es {OTP}. Caduca en 10 min.` |
| Médico acepta consulta | Notificar paciente | patient.phone | `OnCall: tu médico (Dr. {name}) ha aceptado la consulta. Llegada estimada {ETA} min.` |
| Médico cerca | "Llegando en 10 min" | patient.phone | `OnCall: tu médico llega en ~10 min al {address}.` |

Todo lo demás (factura, recordatorios programadas, soporte) → Resend email.

### Coste estimado

850 consultas/mes × 3 SMS × €0.07 ≈ **€178/mes**. Cabe en 10% comisión año 1 sin problema.

### Implementación solicitada

1. **Provider abstraction**: `lib/notifications/sms/twilio.ts` implementando interfaz ya existente en `lib/notifications/sms/` (Round 11 stub). Reemplazar el stub.
2. **Env vars** (Tei provee post-creación cuenta Twilio):
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_FROM_NUMBER` (e.164 ES, ej `+34900XXXXXX` o sender alfanumérico `OnCall`)
3. **Triggers** (cablear a 3 momentos):
   - `app/api/notifications/sms-otp/send/route.ts` (ya existe Round 11 — reemplazar stub call)
   - `app/api/consultations/[id]/accept/route.ts` (cuando doctor acepta)
   - `app/api/doctor/eta-update/route.ts` (cuando ETA <= 10 min) — crear si no existe
4. **i18n**: plantillas SMS en `messages/{es,en}.json` namespace `notifications.sms.*`
5. **Rate limit**: 1 SMS/destino/min mínimo (anti spam interno)
6. **Logging**: cada SMS enviado a `notifications_log` table con `channel='sms'`, `provider='twilio'`, `status`, `error_msg`

### NO hacer todavía

- WhatsApp Business 360dialog (post-Q3 cuando volumen lo justifique)
- SMS para recordatorios de citas programadas (email es suficiente)
- Marketing SMS (NO permitido sin opt-in granular bajo LSSI-CE Art. 21)

---

## Orden recomendado de despliegue

1. **Round 14 P0 #1** — fix middleware bypass (1-2h) → critical path para audit live doctor
2. **Round 14 P0 #2 placeholder** — redirect /pro/registro → /doctor/login?signup=1 (15 min)
3. Esperar credenciales Twilio de Tei
4. **Round 14 SMS** — implementación Twilio (1 sprint)

Cada uno commit + push + R2 verification. Outbox status tras cada round.

---

## R7 reminder

Ningún cambio aquí toca recogida de datos clínicos. Bypass es solo identidad/role, SMS es solo notificación logística (no contiene datos médicos en el cuerpo). R7 vigente.

— Cowork
