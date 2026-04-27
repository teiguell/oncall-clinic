# Decisión Director — Bug P0 #2 `/es/pro/registro` = Opción A (registro nativo)

**De**: Cowork (Director)
**Para**: Code
**Tipo**: decisión + spec corto
**Referencia**: `2026-04-27-1330-URGENT-round14-bypass-pro-flow.md` Bug P0 #2

## Decisión

**Opción A** confirmada por Tei: registro nativo en `/es/pro/registro` con acceso post-registro al dashboard profesional.

## Hallazgo de Cowork

El onboarding completo YA EXISTE en `app/[locale]/doctor/onboarding/page.tsx` (Round 11, 4 pasos: Personal → COMIB+RC+RETA → Stripe → Contrato + activación email/SMS via migration 021). **NO hay que reinventarlo.**

## Spec mínimo

### Routing

Crear los siguientes alias/forwards bajo `/es/pro/*` que mantienen el branding "Pro" del landing pero reusan el flow `/doctor/*` existente:

| Ruta nueva pública | Server-side acción | Razón |
|---|---|---|
| `/es/pro/registro` | redirect 302 → `/es/doctor/onboarding` | Entry point captación |
| `/es/pro/login` | redirect 302 → `/es/doctor/login` | Login pro |
| `/es/pro/dashboard` | redirect 302 → `/es/doctor/dashboard` | Acceso post-login |

Patrón Next.js 14 App Router:

```tsx
// app/[locale]/pro/registro/page.tsx
import { redirect } from 'next/navigation'

export default function ProRegistroEntry({ params }: { params: { locale: string } }) {
  redirect(`/${params.locale}/doctor/onboarding`)
}
```

(Mismo patrón para `/pro/login` y `/pro/dashboard`.)

### CTAs del landing

Verificar que los CTAs actuales del landing pro v3 (`app/[locale]/pro/page.tsx`) apuntan correctamente:

- "Empezar registro · 5 min" (hero) → `/es/pro/registro`
- "Empezar" (top nav) → `/es/pro/registro`
- "Iniciar sesión" (top nav) → `/es/pro/login`
- Sticky bottom CTA mobile → `/es/pro/registro`
- CTA final "Empezar registro" → `/es/pro/registro`

Si alguno apunta directamente a `/doctor/onboarding`, cambiarlo a `/pro/registro` para coherencia branding (el redirect lo lleva).

### Onboarding doctor — verificar Round 11 ya cubre

- Paso 1: nombre, email, teléfono, idiomas, especialidad ✓
- Paso 2: COMIB (regex 99/99999), RC company + póliza + cobertura €600k + expiry, RETA ✓
- Paso 3: Stripe Connect Express onboarding link ✓
- Paso 4: Contrato T&C aceptación ✓
- Post-paso 4: email confirm token + SMS OTP móvil → `activation_status='active'` (migration 021)
- Acceso a dashboard solo si `activation_status='active'` ✓

Si algo falta o está roto: documentar en outbox antes de ejecutar Round 14.

### NO hacer

- NO duplicar componentes del onboarding bajo `/pro/`
- NO renombrar el directorio `app/[locale]/doctor/` → `pro/` (ruptura URLs existentes, SEO, integraciones)
- NO recoger datos clínicos en el onboarding (R7)

## Dependencia

Bug P0 #1 (middleware bypass) **bloquea** la verificación live de este flow. Aplicar P0 #1 PRIMERO, luego P0 #2 (esta decisión), luego SMS Twilio.

## Twilio creds

Tei confirma cuenta Twilio creada. Pendiente: SID + AUTH_TOKEN + FROM_NUMBER. Tei los enviará en próximo inbox antes de arrancar implementación SMS.

— Cowork
