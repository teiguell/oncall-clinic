# Twilio env vars completas — Round 14 SMS desbloqueado

**De**: Cowork (Director ops)
**Para**: Code
**Tipo**: actualización inbox + go-ahead SMS implementación
**Referencia**: `2026-04-27-1330-URGENT-round14-bypass-pro-flow.md` sección "Feature SMS Twilio MVP"

## Vercel env vars añadidas (Sensitive, Production + Preview)

| Variable | Valor (referencia) | Notas |
|---|---|---|
| `TWILIO_ACCOUNT_SID` | `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (redacted — full value in Vercel) | Account SID |
| `TWILIO_AUTH_TOKEN` | `[oculto en Vercel — 32 chars hex]` | Auth Token primary |
| `TWILIO_MESSAGING_SERVICE_SID` | `MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (redacted — full value in Vercel) | Messaging Service "OnCall Clinic — Notifications" |

> **Note**: real SID/Service-SID values redacted from this committed
> document because GitHub's secret-scanning rejected the push. The
> actual values live only in Vercel env vars and in Director's local
> inbox copy. Do NOT paste real Twilio identifiers into committed
> markdown — use this redacted reference instead.

**Server-side env vars** (no NEXT_PUBLIC_) → no requieren redeploy. Disponibles en runtime.

## Decisión sender (FROM)

❌ **NO usar parámetro `from`** con número Twilio. Tei no compró número (cuenta trial + complejidad regulatory bundle ES).

✅ **Usar `messagingServiceSid`** en client.messages.create():

```ts
import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

await client.messages.create({
  messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,  // NO 'from'
  to: doctorPhone,  // E.164 +34...
  body: 'OnCall: tu código de activación es 123456. Caduca en 10 min.',
})
```

El Messaging Service automáticamente selecciona el sender alfanumérico **"OnCall"** para destinos en España.

## Limitaciones cuenta trial

Tei aún en trial Twilio ($11.875 saldo):

- ✅ SMS solo se entregan a **Verified Caller IDs**. Único verificado actualmente: **+34 681 XX XX XX (redacted — see Director's local copy)** (móvil de Tei).
- ❌ Cualquier `to` no verificado → Twilio devuelve error 21608 (`The 'To' phone number provided is not yet verified`).
- ⚠️ Para audit Cowork live de SMS: usar `+34 681 XX XX XX (redacted — see Director's local copy)` como destino test en demo doctor profile.
- ⚠️ Para go-live producción: Tei debe upgrade trial → cuenta paid ($20 mín deposit).

## Implementación SMS solicitada

Stub en `lib/notifications/sms/twilio.ts` (Round 11 placeholder) → reemplazar por implementación real:

```ts
// lib/notifications/sms/twilio.ts
import twilio from 'twilio'
import type { SmsProvider, SmsResult } from './types'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

export const twilioProvider: SmsProvider = {
  async send({ to, body, idempotencyKey }): Promise<SmsResult> {
    try {
      const msg = await client.messages.create({
        messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID!,
        to,
        body,
      })
      return { ok: true, providerMessageId: msg.sid }
    } catch (e: unknown) {
      const err = e as { code?: number; message?: string }
      // 21608 = unverified number (trial limitation)
      // 21610 = recipient unsubscribed (STOP)
      // 30007 = blocked carrier
      return {
        ok: false,
        errorCode: err.code?.toString() ?? 'unknown',
        errorMessage: err.message ?? 'unknown',
      }
    }
  },
}
```

## Triggers a cablear (3 momentos críticos)

| Trigger | Endpoint existente | Plantilla SMS |
|---|---|---|
| Médico activa cuenta (OTP) | `app/api/notifications/sms-otp/send/route.ts` (Round 11) | `OnCall: tu código de activación es {code}. Caduca en 10 min.` |
| Médico acepta consulta | `app/api/consultations/[id]/accept/route.ts` | `OnCall: Dr. {name} ha aceptado tu consulta. Llegada estimada {eta} min.` |
| Médico cerca (ETA ≤ 10 min) | crear `app/api/doctor/eta-update/route.ts` si no existe | `OnCall: tu médico llega en ~10 min al {address}.` |

Plantillas en `messages/{es,en}.json` namespace `notifications.sms.*` con interpolación `{var}`.

## Logging obligatorio

Cada SMS enviado → INSERT en `notifications_log`:
- `channel = 'sms'`
- `provider = 'twilio'`
- `to_phone` (cifrado o hash si compliance)
- `template_key`
- `status = 'sent' | 'failed'`
- `error_code` (si fallo)
- `provider_message_id` (msg.sid de Twilio)

## Test de smoke recomendado

Post-deploy Round 14, llamar `/api/notifications/sms-otp/send` con `phone=+34681920109` (móvil Tei verificado) → debe llegar SMS desde sender "OnCall" con código OTP.

## Round 14 desbloqueado completo

Tras esto, Code tiene todo para arrancar:
- Bug P0 #1 (middleware bypass) → ya en inbox URGENT
- Bug P0 #2 (`/pro/registro` redirect a `/doctor/onboarding` Opción A) → ya en inbox decisión
- SMS Twilio MVP → este documento

Orden de commits sugerido (independientes):
1. `feat(round14-A)`: middleware bypass — fix `lib/supabase/middleware.ts` para usar `getBypassUser()`
2. `feat(round14-B)`: `/pro/registro` + `/pro/login` + `/pro/dashboard` redirects → `/doctor/*`
3. `feat(round14-C)`: Twilio SMS implementation + 3 triggers cableados

Cada commit + push + R2 verification + outbox status.

— Cowork
