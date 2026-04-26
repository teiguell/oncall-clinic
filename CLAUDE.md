# OnCall Clinic — Code Instructions

## Stack
Next.js 14 App Router · Supabase Auth + RLS + RPC · Stripe Checkout marketplace · Vercel · next-intl ES/EN · Zustand persist · Tailwind

## Reglas duras (no negociables)

### R1 — RCA antes de patch
NUNCA editar un archivo sin antes:
1. Reproducir el bug en `npm run dev` con DevTools.
2. Capturar stack trace + componente exacto + file:line.
3. Escribir RCA en `CODE_LOG.md` con: error completo, file, line, root cause.
4. SOLO entonces parchear.

### R2 — Verificación de deploy
Antes de reportar fix landed:
- `git rev-parse HEAD` → hash local
- `curl -s https://oncall.clinic/es | grep -oE 'layout-[a-f0-9]{16}\.js' | head -1` → hash de bundle nuevo
- Confirmar que hash de bundle CAMBIÓ respecto al previo
- Pegar ambos outputs en `CODE_LOG.md`

### R3 — No "fixed" sin live audit
La palabra "fixed" requiere:
- Curl al CDN confirmando hash nuevo (HTTP 200, no 404)
- Probe sin extensiones (Playwright, system Chrome flag `--disable-extensions`, o incógnito)
- Reporte en `CODE_LOG.md` con outputs literales

### R4 — Archivos off-limits (rondas cerradas)
- `components/cookie-consent.tsx` — fixed Round 3 (commit `6fcd020`). Falso positivo de bundle grep si parece sospechoso.
- `components/cookie-consent-loader.tsx` — fixed Round 5 (commit `a1b4833`). Dynamic ssr:false wrapper.
- `stores/booking-store.ts` — fixed Round 3 (commit `719de90`). Auto-rehydrate, noop SSR storage.
- `stores/auth.store.ts` — hardened Round 6 (commit `85607f7`). Preventive SSR-noop, tree-shaken anyway.
- `components/referral-card.tsx` — fixed Round 6 (commit `85607f7`). Mounted-gate canShareNative.
- `app/[locale]/(auth)/login/page.tsx` — fixed Round 6 (commit `85607f7`) + Round 9 Fix F (`1248eaa`). callbackUrl IIFE → lazy fn + ?error=&detail= display.
- **DELETED** `components/booking/Step2Details.tsx` — eliminado en Round 9 (commit `e95d377`). NO recrear. Era el formulario de síntomas (modelo "facilitador con triaje" abandonado, ver R7).

Si encuentras razón fundada para modificar uno: párate, justifica en `CODE_LOG.md` con file+line+por qué, espera respuesta del Director.

### R5 — Sourcemaps en prod
`next.config.js` tiene `productionBrowserSourceMaps: true` desde Round 6 (commit `85607f7`). NO desactivar mientras haya bugs hydration sin diagnosticar.

### R6 — Rutas críticas (verificar en CADA deploy)
End-to-end, en este orden:
- Patient: `/es/login` magic link → `/es/patient/dashboard` → `/es/patient/request` Steps **1→2→3** (3 steps post-Round-9) → Stripe Checkout → success → tracking
- Doctor: `/es/doctor/login` → `/es/doctor/onboarding` → `/es/doctor/dashboard` → aceptar consulta
- Cron + API: `/api/health`, `/api/doctors?near=`, `/api/cron/purge-chat`

### R7 — Modelo intermediario puro (Round 9 pivot)
**OnCall NO recoge datos clínicos.** Es un intermediario tecnológico (LSSI-CE, como Uber para médicos). Específicamente PROHIBIDO:
- ❌ Recoger síntomas, chips clínicos, notas clínicas
- ❌ Pedir consentimiento Art. 9 RGPD (datos de salud / categoría especial)
- ❌ Tratar / persistir información médica del paciente
- ❌ Hacer DPIA de datos de salud

El médico que realiza la visita es el responsable independiente del tratamiento clínico (Art. 9.2.h RGPD — asistencia sanitaria). Cualquier feature que implique recoger datos clínicos en OnCall debe **escalar al Director ANTES de implementar**. Si lo encuentras en un prompt futuro sin justificación explícita: párate y reporta en outbox.

Off-limits adicional (Round 9):
- `components/booking/Step2Details.tsx` — **eliminado**, no recrear (era el formulario de síntomas/chips/notas).
- Chips síntomas, textareas de "describe tus síntomas / notas clínicas" — no reintroducir en ningún componente.

## Aprendizajes documentados (no repetir errores)

### Bundle grep da falsos positivos
`grep -E 'localStorage|window\.|document\.cookie' bundle.js | sort | uniq -c` da hits aunque las refs estén DENTRO de useEffect. Para verificar top-level real usar:
```bash
grep -oE '.{60}localStorage.{120}' bundle.js | head -3
```
Si el match incluye `(0,a.useEffect)(()=>{...localStorage...}` está bien — no es bug.

### Cascade #418 + DOMException = extensiones del navegador
Si auditoría con Chrome muestra `HierarchyRequestError: Only one element on document allowed` o `NotFoundError: removeChild not a child` junto a #418 cascade: probable que sea **extensión del navegador del usuario** inyectando DOM, no bug del código. React por sí solo no lanza esas DOMException.

**Test definitivo (30s)**: reproducir en incógnito o `chromium --disable-extensions`. Si limpio = no es código.

## Comunicación con Director (Cowork)

Sistema híbrido:

| Tipo | Ubicación | Quién escribe |
|---|---|---|
| Mega-prompts grandes (rondas, briefings) | `PROMPT_*.md` en raíz | Director |
| Instrucciones tácticas cortas (status, ack, decisiones) | `.claude/cowork-inbox/<fecha>-<topic>.md` | Director |
| Status updates de Code, decisiones aplicadas | `.claude/cowork-outbox/<fecha>-<topic>.md` | Code |
| Log narrativo de rondas | `CODE_LOG.md` (raíz) | Code |
| Log narrativo de directrices | `DIRECTOR_LOG.md` (raíz) | Director |

**Workflow Round-by-Round**:
1. Al inicio de cada turn: leer `.claude/cowork-inbox/` (mensajes nuevos del Director)
2. Leer último `PROMPT_*.md` activo si lo hay
3. Leer último entry `CODE_LOG.md` para contexto previo
4. Si la tarea dice "RCA": invocar `/rca` (cuando exista) o seguir R1 manualmente antes de tocar nada
5. Tras commit + push: ejecutar bloque verificación de R2 y pegarlo en `CODE_LOG.md`
6. Si la tarea cambia algo crítico, escribir confirmación corta en `.claude/cowork-outbox/`

## Tools allowed sin approval
Bash(git *), Bash(npm *), Bash(curl *), Read, Write, Edit, Grep, Glob

## Versión
Última actualización: 2026-04-26 (post-Round-9). Owner: Tei (Cowork Director).
Pivot vigente: intermediario puro (R7). Booking flow: 3 steps (Tipo+Dirección / Médico / Confirmar+Pagar).
Auth bypass: `lib/auth-bypass.ts` + `components/auth-bypass-banner.tsx` — TEMPORAL alpha audit, env var `NEXT_PUBLIC_AUTH_BYPASS=true`. A eliminar tras alpha launch.
