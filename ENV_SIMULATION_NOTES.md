# Simulation Env Var Notes

Variables a verificar en Vercel Dashboard → Settings → Environment Variables
antes de simular y restaurar después.

## Para simular

| Variable | Valor para simulación | Valor en producción real |
|---|---|---|
| `NEXT_PUBLIC_TEST_MODE` | `true` | `false` |
| `STRIPE_SECRET_KEY` | `sk_test_…` (Stripe Dashboard → Test mode) | `sk_live_…` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_…` | `pk_live_…` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` del endpoint test | `whsec_…` del endpoint live |

## Dónde obtener las keys test

Stripe Dashboard → **Developers** → **API keys** → toggle "Test mode" (arriba a la derecha). Las keys test siempre empiezan por `sk_test_` y `pk_test_`.

## Webhook test

Si quieres probar webhooks reales:
1. Stripe Dashboard → Developers → Webhooks → Add endpoint (en modo test)
2. URL: `https://oncall.clinic/api/stripe/webhooks`
3. Events: `payment_intent.succeeded`, `checkout.session.completed`, `charge.refunded`
4. Copiar el signing secret → `STRIPE_WEBHOOK_SECRET` en Vercel

## Después de simular

1. Restaurar `NEXT_PUBLIC_TEST_MODE=false`
2. Restaurar keys `sk_live_…` / `pk_live_…` (si se tenían configuradas)
3. Ejecutar `supabase/seed-simulation-cleanup.sql` en Supabase SQL Editor
4. Redeploy

## Seguridad

- `/demo` se protege a nivel de render con `process.env.NEXT_PUBLIC_TEST_MODE !== 'true'` → retorna "Demo mode is not active" en prod.
- Los doctores demo usan `license_number` con prefijo `COMIB-2800` para identificarlos fácilmente en el cleanup.
- Las cuentas auth demo (`demo-patient@oncall.clinic` / `demo-doctor@oncall.clinic`) quedan en `auth.users` tras la simulación; borrarlas manualmente desde Supabase → Authentication → Users si se desea.
