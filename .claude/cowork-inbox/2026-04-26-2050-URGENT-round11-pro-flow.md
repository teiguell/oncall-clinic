# URGENT — Round 11: Pro flow completo + doctor bypass + notifications

**Tipo**: tasks (round grande, 7 fixes)
**Prioridad**: ALTA — desbloquea audit Cowork del lado profesional + alpha launch
**Espera respuesta en outbox**: sí

## TL;DR

Director Tei pide cubrir el flow profesional COMPLETO: landing /pro → registro → activación email/SMS → dashboard → primera consulta. Mega-prompt completo: [`PROMPT_ROUND11_PRO_FLOW_COMPLETE.md`](../../PROMPT_ROUND11_PRO_FLOW_COMPLETE.md)

## Estado infra (Director ya hecho)

✅ `/pro` redirige a `/es/pro` (defaultLocale ES) — verificado
✅ `/es/pro` SSR funciona (los "500" eran `font-weight:500`, no errores)
✅ **Demo-doctor seedeado en Supabase** — listo para bypass:

```
UUID:    628856ea-4c70-4bfb-b35d-dfd56d95f951
Email:   demo-doctor@oncall.clinic
Profile: role=doctor, full_name='Demo Doctor (Cowork Bypass)'
Doctor:  COMIB 07/12345, RC AXA Demo €600k cobertura,
         verification_status=verified, is_available=true,
         activated_at=NOW, consultation_price=15000 (€150 in cents),
         lat 38.9067 lng 1.4206 (Ibiza centro)
```

## Tareas Round 11 (7 fixes)

| Fix | Scope |
|---|---|
| **A** | Doctor bypass — env var `NEXT_PUBLIC_AUTH_BYPASS_ROLE` (patient/doctor/admin). UUID doctor ya seedeado arriba. Actualizar `lib/auth-bypass.ts` con: `doctor: { id: '628856ea-4c70-4bfb-b35d-dfd56d95f951', email: 'demo-doctor@oncall.clinic', role: 'doctor' }` |
| **B** | Sistema notifications `lib/notifications/` — Resend para email + Twilio para SMS. Templates: doctor.welcome, doctor.activation_sms (OTP), doctor.consultation_new, patient.booking_confirmed |
| **C** | Activación post-onboarding — email verify + SMS OTP + admin review. Migration `016_doctor_profiles_activation.sql` (columnas activation_status, email_verified_at, phone_verified_at) |
| **D** | Push notifications — email instantáneo + SMS opcional + polling dashboard 30s (no Web Push real ahora) |
| **E** | Audit end-to-end con doctor bypass — Cowork lo hace tras Code merge |
| **F** | Polish visual `/es/pro` con criterios marketplaces (Stripe/Uber Pro/Doctolib Pro) — específica en mega-prompt |
| **G** | Polish copy `/es/pro` ES — eliminar "telemedicina"/"datos médicos" (R7 vigente) |

## Env vars nuevas (Director añadirá en Vercel cuando confirmes)

```
NEXT_PUBLIC_AUTH_BYPASS_ROLE=doctor    # opcional, default 'patient'
TWILIO_ACCOUNT_SID=<SID>
TWILIO_AUTH_TOKEN=<token>
TWILIO_FROM_NUMBER=+3491XXXXXXX
```

Si NO quieres usar Twilio (caro: €0.05/SMS): proponer alternativa (WhatsApp Business via 360dialog ~€0.005/msg, o solo email para alpha) en outbox.

## Orden ejecución sugerido

1. Fix A primero (doctor bypass) — desbloquea Cowork audit
2. Fix B + C (notifications + activación) — backend
3. Fix F + G (visual + copy /es/pro) — frontend
4. Fix D (polling dashboard) — incremental
5. Push entre commits. Reporta en outbox cuando bundle live cambie.

## Reglas (recordatorio)

- R7 pivot vigente: NO datos clínicos
- R2: bundle audit obligatorio post-deploy
- R3: live test incognito (Cowork hará Round 12)
- R4: no recrear Step2Details

## Esperando

Cuando termines Round 11 + push, Director:
1. Setea env vars Vercel (Twilio + AUTH_BYPASS_ROLE)
2. Cowork hace Round 12 audit pro flow end-to-end con bypass doctor
