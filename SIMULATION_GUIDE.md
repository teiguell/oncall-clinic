# Guía de Simulación E2E — OnCall Clinic

## Requisitos previos
1. `NEXT_PUBLIC_TEST_MODE=true` en Vercel env vars
2. Stripe en modo test (`sk_test_…` / `pk_test_…`) — ver `ENV_SIMULATION_NOTES.md`
3. Seed data ejecutado en Supabase (`supabase/seed-simulation.sql`)
4. Deploy actualizado en Vercel tras cambiar env vars

## Cómo simular

### Preparación (una vez)
1. Vercel Dashboard → Project → Settings → Environment Variables:
   - Establecer `NEXT_PUBLIC_TEST_MODE=true`
   - Verificar que `STRIPE_SECRET_KEY` empieza por `sk_test_`
   - Verificar que `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` empieza por `pk_test_`
2. Supabase → SQL Editor → ejecutar `supabase/seed-simulation.sql`
3. Vercel → Redeploy (para que el banner y el bypass de checkout tomen efecto)

### Simulación desde móvil

1. Abre `https://oncall.clinic/es/demo` en tu móvil
2. **Pestaña 1 (Paciente)** — Chrome normal:
   - Toca "Paciente Turista"
   - Selecciona tipo de consulta → servicio → dirección y síntomas
   - Elige un doctor de la lista (DoctorSelector)
   - Confirma y paga (tarjeta `4242 4242 4242 4242`, exp 12/30, CVC `123`)
   - Verás la pantalla de confirmación con tus datos **inmediatamente**
3. **Pestaña 2 (Doctor)** — Chrome incógnito:
   - Abre `https://oncall.clinic/es/demo`
   - Toca "Doctor García"
   - Verás la solicitud en el dashboard → **Aceptar**
   - Pulsa "En camino" → "📍 Simular movimiento" (varias veces) → "He llegado" → "Finalizar consulta"
4. **Vuelve a Pestaña 1** (Paciente):
   - El tracking se actualiza en tiempo real
   - Al completar puedes valorar al doctor

### Tarjeta de prueba Stripe (si se usa Stripe real)
- Número: `4242 4242 4242 4242`
- Expiry: cualquier fecha futura (e.g. `12/30`)
- CVC: cualquier 3 dígitos (e.g. `123`)
- Nombre: cualquiera

### Limpieza post-simulación
1. Supabase → SQL Editor → ejecutar `supabase/seed-simulation-cleanup.sql`
2. Vercel → establecer `NEXT_PUBLIC_TEST_MODE=false`
3. Redeploy

## Notas
- La página `/demo` **sólo funciona** con `NEXT_PUBLIC_TEST_MODE=true`. En producción (false) muestra un mensaje neutro.
- Las cuentas demo (`demo-patient@oncall.clinic`, `demo-doctor@oncall.clinic`) se crean automáticamente en la primera visita a `/demo` si no existen.
- El botón "Simular movimiento" sólo aparece en modo test y actualiza `doctor_profiles.current_lat/lng` directamente (sin GPS real).
