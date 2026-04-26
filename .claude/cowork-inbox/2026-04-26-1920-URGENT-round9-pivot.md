# URGENT — Round 9: Pivot Intermediario Puro + 8 fixes

**Tipo**: tasks (cambio arquitectura + bugs)
**Prioridad**: ALTA — Director ha hecho audit live Round 8 y reporta 7 problemas, uno de ellos cambio de modelo
**Espera respuesta en outbox**: sí

## TL;DR — pivot estratégico

OnCall pasa a **modelo intermediario puro** (Uber-for-doctors).

- ❌ **No** recoger síntomas
- ❌ **No** chips clínicos
- ❌ **No** notas opcionales
- ❌ **No** consentimiento Art. 9 RGPD
- ✅ Solo: contacto + dirección + médico + pago

Mega-prompt completo: [`PROMPT_ROUND9_INTERMEDIARIO_PURO.md`](../../PROMPT_ROUND9_INTERMEDIARIO_PURO.md)

## 8 fixes en Round 9

| # | Fix | Tipo |
|---|---|---|
| A | Comprimir 4 → 3 steps (Doctolib-style) | Arquitectura |
| B | Eliminar síntomas + chips + notas + Step3 detalles | Cambio modelo |
| C | Eliminar consentimiento Art. 9 RGPD + privacy doc | Legal/UX |
| D | Reescribir copy Urgente: "Disponible ahora · Llegada 30-90 min" | UX |
| E | Forzar light mode en `<html>` (dark mode roto landing mobile) | Visual |
| F | Debug + fix Google OAuth (sigue sin funcionar) | Auth |
| G | Botón "Confirmar y pagar" no funciona — handler completo + toast errores | Auth/Stripe |
| H | **NUEVO**: Auth bypass mode `NEXT_PUBLIC_AUTH_BYPASS=true` para Cowork audit live | Dev tooling |

## Orden sugerido de ejecución

1. **Fix F + G** primero (login + pago) → desbloquea Cowork para validar
2. **Fix B + A + C** (eliminar síntomas/Step3 + comprimir + Art.9) → cambio modelo
3. **Fix D + E** (copy + light mode) → UX polish
4. **Fix H último** (auth bypass) — solo activar tras confirmar F + G live

Splitea en 4-6 commits temáticos. Push entre cada uno.

## Reglas (recordatorio)

- Bundle audit obligatorio post-deploy (R2 CLAUDE.md)
- Live test EN INCÓGNITO o Playwright `--disable-extensions` (R3)
- NO recrear los archivos eliminados (Step2Details.tsx, etc.) en futuros rounds
- Toast en cada error del botón pago — no silent failures

## CLAUDE.md update

Tras Round 9 cerrado, actualizar `CLAUDE.md` con:
- R7 (NUEVA): "OnCall NO recoge síntomas, chips, notas clínicas. Modelo intermediario puro. Cualquier feature que implique recogida de datos clínicos debe escalar al Director antes de implementar."
- R4 off-limits: añadir `components/booking/Step2Details.tsx` (eliminado) y los chips obsoletos.
