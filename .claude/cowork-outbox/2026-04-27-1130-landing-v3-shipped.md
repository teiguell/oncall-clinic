# Round 12 — Patient landing v3 (Claude Design handoff) shipped + verified

**En respuesta a**: comando "Landing Paciente v3" + bundle Claude Design `FnU-7fXWOF6sTCUITDB7gw`
**Tipo**: status (shipped + verified live)

## Commit + push

```
7768e6a  feat(round12): patient landing v3 (Claude Design handoff)
```

`git push origin main` → `2d50628..7768e6a` ✓

## Verificación R2

- `/api/health.commit` = `7768e6a044cc9c2757654dcf17fa5a2d04965c32` ✓ matches local HEAD
- Landing page chunk: `app/[locale]/page-c0c550742626526e.js` (NEW, was `page-04fcd2e46af2f1dd.js` antiguo)
- Build output: `/[locale]` SSG ● — 4.87 kB / 133 kB First Load JS (down from 11.3 kB / 140 kB del Round 7)

## Verificación R3 (Playwright + Chrome real, ambos locales)

Mobile (iPhone UA, 390×844) y Desktop (1440×900):

| Sección | Mobile | Desktop |
|---|---|---|
| Hero (eyebrow + H1 + CTA) | ✓ | ✓ |
| Floating badges (Dr. M. Ferrer + 3 médicos cerca) | hidden (correct) | ✓ |
| iPhone mock (address chip + chips + "Confirmar y pagar") | ✓ | ✓ |
| Cómo funciona (3 steps 01/02/03) | ✓ | ✓ |
| Includes / Excludes + 112 pill | ✓ | ✓ |
| ServiceTimeline (preserved) | ✓ | ✓ |
| Testimonials (4/4: Sarah, Markus, Camille, James) | ✓ | ✓ |
| FAQ `<details>` count = 8, `[open]` count = 3 | ✓ | ✓ |
| Final CTA amber (Disfruta de Ibiza) | ✓ | ✓ |
| IntermediaryDisclaimer (preserved) | ✓ | ✓ |
| Footer (Ibiza Care S.L. CIF) | ✓ | ✓ |
| Wrappers preserved (MODO PRUEBA + AUTH BYPASS) | ✓ | ✓ |
| Console errors | **0** | **0** |

## R7 compliance

iPhone mock chips renamed: "Motivo de consulta · Fiebre/Dolor/Garganta/Otitis" (clinical en design original) → **"Tipo de visita · Urgente/Programada/Hoy/Mañana"** (logística no clínica). Coincide con lo que el booking flow real (`/patient/request`) recoge tras el pivot Round 9.

Cero referencias a síntomas, anamnesis, datos clínicos, Art.9 RGPD en todo el copy. Todos los CTAs apuntan a `/[locale]/patient/request` (3-step intermediary funnel).

## Wrappers preservados (Director brief)

✓ AuthBypassBanner (LocaleLayout)
✓ TestModeBanner / MODO PRUEBA banner (LocaleLayout)
✓ CookieConsentLoader (LocaleLayout)
✓ CrispChat widget (LocaleLayout)
✓ ServiceTimeline (embedded between IncludesV3 and TestimonialsV3)
✓ IntermediaryDisclaimer (slim above FooterV3)
✓ BottomTabBarWrapper (unchanged — wired only in patient/doctor layouts)
✓ Auth gate Round 9 P0-A en `/patient/request` (no tocado)

## Arquitectura

- Página ahora es **async server component**. Anteriormente era client component (Round 7) por el mobile menu state.
- Todos los sub-componentes de v3 son server EXCEPTO `LandingNavV3` (client island por el `useState` del menu).
- FAQ usa `<details>/<summary>` nativo + atributo `open` en los primeros 3 — zero JS shipped.
- iPhone mock íntegramente CSS/SVG (no asset binario). Pin pulse vía keyframes `live-dot` ya en globals.css.

## Decisiones tomadas (flagged for Director review)

1. **Phone number**: copia del design tenía placeholder `+34 971 00 00 00`. Reemplazado por `+34 871 18 34 15` (el real, ya en translations). Cambia si lo prefieres distinto.
2. **iPhone mock chips**: cambié de chips clínicos (Fiebre/Dolor/Garganta/Otitis) a chips R7-clean (Urgente/Programada/Hoy/Mañana). Sin esto el landing prometería algo que el flow no entrega tras el pivot Round 9. ¿OK?
3. **Testimonios + "4.8 / 1.247 reseñas"**: números directionales del design source. Replace con review pipeline real cuando esté listo.
4. **Pin step animation**: el design source ciclaba `step` 0/1 cada 4.5s con setInterval. Lo dropped — sin info-loss, solo cosmético. Mantengo pulse del pin con CSS `live-dot`.
5. **Old `landing.*` namespace**: dejado intacto en messages files. Unused por v3 pero harmless. Puedo limpiarlo en sprint posterior si prefieres.

## Próximo

Cowork puede iniciar Round 13 audit visual end-to-end del landing en mobile + desktop. Si el visual diverge del Claude Design source, hago ajustes pixel-precise en commit posterior.
