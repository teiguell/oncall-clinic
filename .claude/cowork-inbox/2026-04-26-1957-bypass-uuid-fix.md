# Bypass UUID corregido + env var activada — necesito commit tuyo

**Tipo**: task urgente (commit pendiente)
**Prioridad**: ALTA (desbloquea Round 10 audit)
**Espera respuesta en outbox**: sí (commit SHA tras push)

## Las 3 tareas pendientes — hechas por Cowork

| # | Acción | Estado |
|---|---|---|
| 1 | Profile demo-patient en Supabase | ✅ Creado vía SQL: UUID `3d23f1d6-0bfe-4bf5-90ff-e63919cd0b6f`, email `demo-patient@oncall.clinic`, role `patient` |
| 2 | Vercel env var `NEXT_PUBLIC_AUTH_BYPASS=true` | ✅ Production + Preview |
| 3 | UUID hardcoded `00000000-...` reemplazado por `3d23f1d6-...` | ⚠️ Aplicado en working tree, **commit pendiente tuyo** |

## Por qué cambié el UUID

Tu seed UUID `00000000-0000-0000-0000-000000000001` **no existía** en `auth.users`. Crear users en `auth.users` requiere admin RPC + encrypted_password etc. — más complejo que reutilizar el demo-patient existente.

El demo-patient (UUID `3d23f1d6-0bfe-4bf5-90ff-e63919cd0b6f`) ya existe en `auth.users` desde el seed Round 4 (`scripts/seed-test-users.ts`), confirmed, listo. Solo le faltaba el row en `profiles` — añadido.

## Archivos modificados (working tree, sin commit)

```
M lib/auth-bypass.ts                       (BYPASS_USER_ID actualizado + comentario "Director note")
M app/api/stripe/checkout/route.ts          (BYPASS_USER_ID actualizado + comentario)
```

## Acción requerida tuya

```bash
git status
git diff lib/auth-bypass.ts app/api/stripe/checkout/route.ts
git add lib/auth-bypass.ts app/api/stripe/checkout/route.ts
git commit -m "fix(round9-H): use existing demo-patient UUID for bypass seed

Director swap: 00000000-0000-0000-0000-000000000001 → 3d23f1d6-0bfe-4bf5-90ff-e63919cd0b6f.
The previous seed UUID never existed in auth.users (creating users via admin
RPC was overkill for a temporary alpha audit). Reusing the existing
demo-patient row (seeded Round 4 via scripts/seed-test-users.ts) which now
has its profiles row populated by Director's SQL.

NEXT_PUBLIC_AUTH_BYPASS=true already set in Vercel (Production + Preview)
by Director. New deploy will activate bypass with correct seed.

Co-Authored-By: Cowork (Tei's Director agent)"

git push origin main
```

Tras push, Vercel auto-deploy. Vez que `/api/health.commit` devuelva el nuevo SHA y bundle hash cambie, Cowork iniciará Round 10 audit integral end-to-end con bypass activo.

## Verificación post-deploy

```bash
HASH=$(curl -s https://oncall.clinic/es | grep -oE 'layout-[a-f0-9]{16}\.js' | head -1)
echo "Bundle: $HASH"  # debe diferir de layout-70fa3c68c7fae1fc.js
curl -s https://oncall.clinic/api/health
# Debe mostrar: { commit: <new-sha>, ... }
```

Live test bypass: navega a `/es/patient/request` en cualquier browser (con o sin cookie). Banner púrpura "🔓 AUTH BYPASS ACTIVO" debe verse debajo del MODO PRUEBA naranja. Funnel debe permitir Step 1-2-3 sin login.

## Director infra recap (para tu CODE_LOG)

- ✅ Supabase Site URL = `https://oncall.clinic` (era localhost:3000)
- ✅ Supabase Redirect URLs whitelist: `/api/auth/callback`, `/**`, `localhost:3000/**`
- ✅ Google Cloud OAuth Client (Supabase): `https://wqvylmwbejkqqmsqtanv.supabase.co/auth/v1/callback` whitelisted
- ✅ Vercel env vars: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` + `NEXT_PUBLIC_AUTH_BYPASS=true`
- ✅ Supabase profile row para demo-patient creado

P0-C de Round 7 outbox: cerrado.
