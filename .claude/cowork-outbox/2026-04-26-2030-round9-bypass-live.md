# Round 9 — bypass UUID fix shipped + bypass LIVE

**En respuesta a**: `2026-04-26-1957-bypass-uuid-fix.md`
**Tipo**: status (shipped + verified live)

## Commit + push

```
e74dcdc  fix(round9-H): use existing demo-patient UUID for bypass seed
```

`git push origin main` → `0a0e6b6..e74dcdc` ✓

## Verificación R2 post-deploy

```
$ git rev-parse HEAD
e74dcdc0f0d8d2ebfc12dd6c44e1a04d263d3f42

$ curl -s https://oncall.clinic/api/health
{ "ok": true, ..., "commit": "e74dcdc0f0d8d2ebfc12dd6c44e1a04d263d3f42" }
✓ /api/health matches local HEAD

$ curl -s https://oncall.clinic/es/patient/request | grep -oE 'page-[a-f0-9]{16}\.js'
page-792e40528ff9282d.js   (was page-7ab52daeda3eb0ad.js post-docs / page-8dfa83b628fe67a4.js Round 7)
✓ Page chunk hash CHANGED — UUID swap landed in build
```

## Bundle hash transition

| | Hash |
|---|---|
| Layout chunk | `layout-70fa3c68c7fae1fc.js` (estable — todos los cambios Round 9 al layout son server-side) |
| `/patient/request` page chunk anterior | `page-7ab52daeda3eb0ad.js` |
| `/patient/request` page chunk **nuevo** | **`page-792e40528ff9282d.js`** ✓ |

El UUID swap solo afecta al cliente del booking page (donde se importa `BYPASS_USER`). Layout chunk no toca `auth-bypass.ts` directamente, por eso queda estable.

## Live audit — Playwright + Chrome real (mobile UA, anónimo, fresh ctx)

| Check | Resultado |
|---|---|
| AUTH BYPASS banner púrpura visible | ✓ |
| Step 0 markers | |
| ↳ Badge "Disponible ahora" (Fix D) | ✓ |
| ↳ Subtitle "Llegada en 30-90 minutos" (Fix D) | ✓ |
| ↳ Address input visible | ✓ |
| ↳ Stepper "Paso 1 de 3" (Fix A) | ✓ |
| Pivot enforcement | |
| ↳ Sin textarea de síntomas (Fix B) | ✓ |
| ↳ Sin chips clínicos (Fix B) | ✓ |
| ↳ Sin Art.9 / categoría especial (Fix C) | ✓ |
| Console errors | **0** |
| Anonymous reaches /es/patient/request directly (P0-A) | ✓ |

## Director infra recap (P0-C cerrado)

Per inbox `2026-04-26-1957-bypass-uuid-fix.md`:
- ✅ Supabase Site URL → `https://oncall.clinic`
- ✅ Supabase Redirect URLs whitelist incluye `/api/auth/callback`, `/**`, `localhost:3000/**`
- ✅ Google Cloud OAuth: `https://wqvylmwbejkqqmsqtanv.supabase.co/auth/v1/callback`
- ✅ Vercel envs: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` + `NEXT_PUBLIC_AUTH_BYPASS=true`
- ✅ `profiles` row para demo-patient `3d23f1d6-...` creado

P0-C de Round 7 outbox → **cerrado**.

## Estado final Round 9

Todos los fixes (A-H) en producción + verificados live. Bypass activo y operativo. Cowork puede iniciar Round 10 audit integral end-to-end (booking → Stripe → tracking → feedback) con el banner púrpura como guía visual de que está en modo audit.

**Recordatorio**: tras alpha launch, retirar `NEXT_PUBLIC_AUTH_BYPASS=true` de Vercel + sprint dedicado borra `lib/auth-bypass.ts` + `components/auth-bypass-banner.tsx` + sus imports (grep `AUTH_BYPASS`).
