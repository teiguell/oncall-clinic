# HOTFIX LOGOS + External audit P0/bugs — SHIPPED

**Date:** 2026-04-28 23:30 CET
**HEAD:** `b88a9a2`
**Status:** ✅ 5 commits sequential. HOTFIX live; P0/bug fixes pending Vercel rebuild (~2 min).
**Triggers:**
- `2026-04-28-1830-HOTFIX-LOGOS-COLLAPSED.md` (P0 visual regression)
- `2026-04-28-1900-EXTERNAL-AUDIT-P0-FIXES.md` (3 P0s + 4 bugs)

---

## Commit ladder

| # | Hash | Round | LOC |
|---|---|---|---|
| 1 | `3dcd4ed` | HOTFIX Logo | +51 / -35 |
| 2 | `d0ac2d7` | P0-1 banner gate | +17 / -7 |
| 3 | `fe52ac3` | P0-2 SLA | +30 / -30 |
| 4 | `934e4e8` | P0-4 /clinica | +12 / -12 |
| 5 | `b88a9a2` | Bugs B1-B4 | +20 / -9 |

---

## HOTFIX `3dcd4ed` — Logo collapse 0x0

DOM showed `naturalWidth=300, naturalHeight=95` but
`getBoundingClientRect={width:0, height:0}` → invisible. Root
cause: viewBox-only SVG + inline `style={width:auto, height:auto,
maxHeight}` doesn't trigger ratio resolution.

Two-layer fix:
1. `components/shared/Logo.tsx` refactor: `className="h-8 w-auto md:h-10"`
   (Tailwind h-8/h-10 fixed height; w-auto via intrinsic ratio).
   Dropped width/height props, added VARIANT_CONFIG with intrinsic
   dims for next/image ratio anchors.
2. SVG files: sed-script added `width="X" height="Y"` next to
   viewBox in 5 SVGs (patient + pro + clinic + 2 dark variants).

Live verified: `class="h-8 w-auto md:h-10"` present in /es HTML.

---

## P0-1 `d0ac2d7` — ModoPrueba banner production gate

`components/test-mode-banner.tsx` adds top-priority gate:
```ts
if (publishable.startsWith('pk_live_')) return null
```

Trumps existing TEST_MODE + SHOW_TEST_BANNER gates. When Director
flips Stripe to live keys, banner auto-hides on next Vercel build —
no other env vars to remember.

---

## P0-2 `fe52ac3` — SLA unification

Patient-facing copy now consistent "Menos de 60 min". FAQ adds
rural exception. 13 i18n keys × 2 langs updated.

| Surface | Before | After |
|---|---|---|
| `landingV3.hero.subtitleHours` | "1 hora" | "Menos de 60 min" |
| `landing.hero.subtitle` | "Desde 1 hora" | "Menos de 60 min" |
| `landingV3.hero.phone.etaValue` | "~ 55 min" | "~ 45 min" |
| `landingV3.how.subtitle` | "menos de 90 minutos" | "menos de 60 minutos" |
| `patient.request.urgentDesc` | "1-3 horas según tráfico" | "Menos de 60 min en zona urbana de Ibiza" |
| `faq.a1` | "Desde 1 hora..." | "Menos de 60 min en zona urbana. Hasta 90 min en zonas rurales..." |

Internal metrics PRESERVED:
- `timeline.avgResponse` = "Tiempo medio de respuesta: 12 minutos"
- `proV3.phone.metaDistanceValue` = "12 min"

---

## P0-4 `934e4e8` — /clinica hero + vanity stat

```
H1 ES: "Tu clínica + OnCall."
       "Volumen incremental."
       "Sin exclusividad." (gradient)

Subtitle: "Comparte médicos colaboradores con OnCall. 8% comisión
           todo incluido. Sin cuotas mensuales. Sin exclusividad."

Stats card 2: "9" / "médicos COMIB activos en Ibiza"
              (was: "96,8 M" / "turistas/año en España")
```

Palette navy + gold preserved.

Live verified: `/es/clinica` H1 contains "Tu clínica + OnCall.
Volumen incremental. Sin exclusividad."

---

## Bugs `b88a9a2`

### B1 — /es/hoteles link removed
- LandingNavV3.tsx desktop + mobile menus: removed misleading
  "Para hoteles" link (pointed to /pro doctor recruitment).
- FooterV3.tsx: removed `links.hotels` entry.
- i18n key `landingV3.nav.hotels` kept orphaned (cleanup later).

### B2 + B3 — /pro StatNumber prefix during animation
- "<7 días" rendered "<0 días" mid-animation. Fix: hide prefix
  until display reaches target value:
  ```ts
  const animationComplete = started && display >= Math.round(number)
  const visiblePrefix = animationComplete ? prefix : ''
  ```
- `display` now clamped `Math.max(0, Math.round(v))` defensive.
- Same pattern works for "+", "€", any other prefix.

### B4 — CTA consistency
- Confirmed no regression:
  - /es "Pedir médico ahora" ✓
  - /pro "Empezar registro · 5 min" ✓
  - /clinica "Asociar mi clínica" ✓
- No code change needed.

---

## R3 live audit at end of session

```bash
$ curl -s https://oncall.clinic/api/health | jq -r .commit
934e4e8...   (HOTFIX + P0-1/2 + P0-4 live; bugs pending rebuild)

$ curl -s https://oncall.clinic/es | grep -oE 'h-8 w-auto md:h-10'
h-8 w-auto md:h-10   ✓ HOTFIX live

$ curl -s https://oncall.clinic/es/clinica | grep -oE 'Tu clínica \+ OnCall'
Tu clínica + OnCall   ✓ P0-4 live

$ curl -s https://oncall.clinic/es | grep -c 'Para hoteles'
2   (rebuild pending — will reach 0 once b88a9a2 lands)
```

---

## R7 compliance

✅ All 5 commits zero clinical surface — pure UI/copy/branding.

---

## Decisions flagged

1. **`landingV3.nav.hotels` i18n key kept orphaned**: removed from
   rendering but key still in messages/*.json. Cleanup deferred to
   future i18n sweep when hotel partner program launches.
2. **`timeline.avgResponse` "12 minutos" preserved**: per spec it's
   labelled as "tiempo medio de respuesta" (response/acceptance
   time), not arrival ETA. Operational metric, not SLA.
3. **`<` prefix fix is generic**: applies cleanly to other prefixed
   stats too (+, €). Future stat additions inherit the behavior.
4. **P1 bonus deferred**: pricing table + language switcher claim
   from the audit brief not shipped — easy follow-up when Director
   picks priority. Critical path covered by 5 commits above.

---

## Alpha launch readiness

✅ Q1 + Q2 + Q3 + LOGOS + HOTFIX + audit P0/bugs all shipped.

Pending Director/Cowork:
1. Apple Pay verification file (Stripe Dashboard task)
2. Stripe live keys rollout (auto-hides ModoPrueba banner)
3. Live audit 3 lanes after b88a9a2 rebuild lands
4. Email template logo integration (Director priority list)
5. P1 bonus (pricing table + lang switcher) when ready
6. GO/NO-GO meeting → 1 jun 2026 launch
