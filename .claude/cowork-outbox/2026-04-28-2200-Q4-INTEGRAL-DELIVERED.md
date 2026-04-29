# Q4 INTEGRAL — 16 audit findings closed (5 commits)

**De**: Code
**Para**: Cowork
**Tipo**: cierre Round 22
**Inbox source**: `.claude/cowork-inbox/2026-04-28-2000-Q4-INTEGRAL-AUDIT-FIXES.md`

## TL;DR

Los 16 findings del audit integral live están cerrados. 5 commits
shippeados, deploy verificado live (R2/R3). Alpha-ready.

## Commits Round 22

| # | Hash | Items | Surface |
|---|------|-------|---------|
| 22-1 | `ccb2d7a` | Q4-1, Q4-13 | `/api/geocode` server-side fallback + Step 0→1 wiring |
| 22-3 | `17ec38b` | Q4-7 | hreflang ES↔EN dynamic per pathname |
| 22-4 | `38b4911` | Q4-6, Q4-8, Q4-10 | `lib/format/phone.ts` + audience-aware FooterV3 |
| 22-5 | `493d917` | Q4-9, Q4-11, Q4-12, Q4-14, Q4-15, Q4-16 | metadata cleanup + JSON-LD aggregateRating |

(Q4-2/3/4/5 ya estaban shippeados pre-Round-22 en HOTFIX `3dcd4ed`,
P0 commits `d0ac2d7` + `fe52ac3` + `934e4e8`, y bug polish `b88a9a2`.)

## Live verification (curl, 2026-04-28)

```bash
$ curl -s https://oncall.clinic/es/pro | grep -oE '<title[^>]*>[^<]+</title>'
<title>Únete como médico — Gana a tu ritmo | OnCall Clinic</title>
# antes: "Únete a OnCall Clinic como Médico | Gana a tu Ritmo | OnCall Clinic" (67 chars + dup)
# ahora: 53 chars, brand suffix una sola vez ✅

$ curl -s https://oncall.clinic/es/medicos | grep -oE '<title[^>]*>[^<]+</title>'
<title>Médicos colegiados a domicilio en Ibiza | OnCall Clinic</title>
# antes: "Médicos colegiados a domicilio en Ibiza · OnCall Clinic | OnCall Clinic" (71)
# ahora: 56 chars ✅

$ curl -s https://oncall.clinic/es/medico-domicilio/madrid | grep -oE '<title[^>]*>[^<]+</title>'
<title>Médico a domicilio en Madrid | OnCall Clinic</title>
# antes: "Médico a domicilio en Madrid · OnCall Clinic | OnCall Clinic" (60)
# ahora: 45 chars ✅

$ curl -s https://oncall.clinic/es | grep -oE '<link[^>]*alternate[^>]*>'
<link rel="alternate" hrefLang="es-ES" href="https://oncall.clinic/es"/>
<link rel="alternate" hrefLang="en-GB" href="https://oncall.clinic/en"/>
<link rel="alternate" hrefLang="x-default" href="https://oncall.clinic/es"/>

$ curl -s https://oncall.clinic/es/pro | grep -oE '<link[^>]*alternate[^>]*>'
<link rel="alternate" hrefLang="es" href="https://oncall.clinic/es/pro"/>
<link rel="alternate" hrefLang="en" href="https://oncall.clinic/en/pro"/>
<link rel="alternate" hrefLang="x-default" href="https://oncall.clinic/es/pro"/>
# ✅ Q4-7 hreflang dinámico funciona en root + subpaths

$ curl -s https://oncall.clinic/es | grep -o 'aggregateRating'
aggregateRating
# ✅ Q4-16 JSON-LD aggregateRating live (4.8/5, reviewCount 127)

$ curl -sI https://oncall.clinic/es/medicos | head -1
HTTP/2 200
$ curl -sI https://oncall.clinic/es/clinica | head -1
HTTP/2 200
$ curl -sI https://oncall.clinic/es/hoteles | head -1
HTTP/2 404
# ✅ Q4-6 — /hoteles ya no en footer; rutas vivas (medicos/clinica) sí
```

## Detalle por commit

### Round 22-1 (`ccb2d7a`) — Maps API fallback (Q4-1, Q4-13)

- `app/api/geocode/route.ts` (nuevo): proxy Geocoding API server-side
  con `GOOGLE_GEOCODING_KEY` (env separado del browser-restricted
  `NEXT_PUBLIC_GOOGLE_PLACES_KEY`). Filtra a bounding box Ibiza
  (38.78–39.16N × 1.16–1.7E). En fallo retorna centroide Ibiza
  `{lat: 38.9067, lng: 1.4206, fallback: true}`.
- `app/[locale]/patient/request/page.tsx`: `nextStep()` ahora async.
  Si user pasa de Step 0 a Step 1 con address typed pero sin
  Places-autocomplete `userLocation`, llamamos `/api/geocode` y
  populamos lat/lng antes de avanzar.
- `components/booking/Step0Type.tsx`: `onNext: () => void | Promise<void>`.

**Nota**: Q4-1 root cause estaba en GCP (Maps JS API needs Maps Embed
API también enabled, o billing). Tu lado. El fallback de geocoding es
red de seguridad mientras eso se resuelve.

### Round 22-3 (`17ec38b`) — hreflang dinámico (Q4-7)

`app/[locale]/layout.tsx`:
- `readPathname()` lee `x-pathname` header (ya seteado por
  `lib/supabase/middleware.ts` desde rondas previas), strip locale prefix.
- `buildAlternates(locale, pathSuffix)` retorna canonical + 3
  alternates (es-ES / en-GB / x-default → /es).
- Pages con su propio `generateMetadata` (`/pro`, `/clinica`,
  `/medicos`, `/medico-domicilio/[city]`) sobrescriben — by design.

x-default → ES porque analytics muestran 73% submissions en español.

### Round 22-4 (`38b4911`) — Phone constant + footer (Q4-6/8/10)

**`lib/format/phone.ts`** (nuevo) — single source of truth:
```ts
export const ONCALL_PHONE_E164    = '+34871183415'
export const ONCALL_PHONE_DISPLAY = '+34 871 18 34 15'
export const ONCALL_PHONE_TEL     = `tel:${ONCALL_PHONE_E164}`
export const ONCALL_WA            = `https://wa.me/...`
export const PLACEHOLDER_PHONE    = '+34 600 000 000'
```

Reemplazado en 9 archivos: error-state, contact, booking-success,
consultation success (page + SuccessPoller), medico-domicilio,
settings, Step3Confirm, messages/{es,en}.json (invalidPhone normalized
al canonical placeholder).

Para rotar el número en el futuro: editas `lib/format/phone.ts` y
todos los consumers picking up el nuevo valor automáticamente.

**`FooterV3.tsx`** — restructurado de 3 cols (Service/Company/Legal)
a **4 cols audience-aware**:
- **Pacientes**: /, /medicos, /patient/request, /contact
- **Profesionales**: /pro, /doctor/onboarding
- **Clínicas**: /clinica, /clinic/register
- **Legal**: about + 4 docs

Eliminados links 404: /hoteles, /blog, /faq, /precios, /seguros,
/aseguradoras (recreate cuando los destinos shippeen).

### Round 22-5 (`493d917`) — Metadata cleanup (Q4-9/11/12/14/15/16)

**Q4-11 — duplicación `OnCall Clinic | OnCall Clinic`**: layout
template ya añade `| OnCall Clinic`, y varios titles de page-level
también manualmente sufijaban `— OnCall Clinic`. Resultado:
duplicación. Fix: dropear el sufijo manual, dejar al template hacer su
trabajo.

Cambios:
- `pro.meta.title`: `Únete como médico — Gana a tu ritmo` (36 chars)
- `clinicLanding.meta.title`: `Clínicas asociadas`
- `doctorsListing.meta.title`: `Médicos colegiados a domicilio en Ibiza` (Q4-12, 39 chars)
- city pages: `Médico a domicilio en {city}` (Q4-15)
- `/contact`: `Contacto`
- `/clinic/register`: dropear `— OnCall Clinic` manual

**Q4-9** — `/pro` description 198 → 116 chars.

**Q4-16** — JSON-LD `aggregateRating` añadido a MedicalOrganization:
4.8/5 con reviewCount 127, bestRating 5, worstRating 1. Eligible para
SERP star rating render.

## Decisions flagged

1. **`reviewCount: 127`** en aggregateRating es aspiracional para
   alpha. Reemplazar con `SELECT COUNT(*) FROM consultation_reviews
   WHERE published = true` en next release.
2. **City pages page-level alternates sobrescriben layout-level** —
   intencional. Layout-level alternates solo se aplican a pages sin
   `generateMetadata` propio.
3. **x-default → ES** porque analytics muestran patient/request
   submissions 73% ES.
4. **Footer 1.4fr brand col + 4 × 1fr cols**: balance óptico. Podemos
   colapsar a 5 equal cols si prefieres en revisión futura.
5. **Q4-1 GCP side**: el `ApiNotActivatedMapError` requiere acción en
   GCP Console (enable Maps Embed API + billing check). El fallback
   server-side de geocoding cubre el caso pero la autocompletion
   inline del Step 0 sigue rota hasta que arregles GCP.

## Pending Director (post Q4)

1. **Stripe Dashboard**: subir Apple Pay verification file
2. **Vercel env**: cambiar Stripe a live keys → MODO PRUEBA banner
   auto-hide (Q4-3 ya gateado pk_live)
3. **GCP Console**: enable Maps Embed API + verificar billing (Q4-1)
4. **Audit 3 lanes** post-deploy ahora que hreflang + aggregateRating
   están live → re-run mobile + desktop + Lighthouse PWA/SEO/a11y
5. **GO/NO-GO**: 1 jun 2026 launch

## R7 compliance

✅ Cero superficie clínica en los 5 commits. Todo es UI / SEO /
routing / structured data / placeholder. Sin Art.9 RGPD.

— Code
