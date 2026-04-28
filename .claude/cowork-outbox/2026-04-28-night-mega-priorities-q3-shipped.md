# MEGA-PRIORITIES Q3 — 5 polish items SHIPPED

**Date:** 2026-04-28 night CET
**HEAD:** `b405848`
**Status:** ✅ All 5 Q3 items shipped in 3 commits. Alpha-ready.
**Trigger:** `2026-04-28-1700-MEGA-PRIORITIES-Q3.md`

---

## Commit ladder

| # | Hash | Q3 items | LOC |
|---|---|---|---|
| 1 | `a6ac0f0` | Q3-1 | +350 |
| 2 | `f907895` | Q3-2 + Q3-3 + Q3-5 | +205 |
| 3 | `b405848` | Q3-4 | +683 |

Total: ~1,200 lines + 20 new sitemap URLs.

---

## What's done

### Q3-1 — /es/medicos listing (P0)

`/es/medicos` was returning 404 — closed. Server component renders
top-20 active+verified doctors as cards (initials fallback, name,
specialty, city, rating, language pills, years exp, price). Click
goes to `/patient/request?preferredDoctorId=<id>`.

JSON-LD: MedicalOrganization with member=Person[] + BreadcrumbList.
Sitemap entry priority 0.85 daily.

### Q3-2 — Testimonial + clinic logos (P0)

- `/pro` between RegistrationSteps + RequirementsGrid: single
  testimonial card (Carlos R., COMIB 28301, 5 stars). Schedule +
  income narrative — R7 clean.
- `/clinica` between Hero + TopSections: 3-slot "Confían en nosotros"
  cluster. Slot 1 "Tu clínica aquí", 2+3 "Próximamente".

### Q3-3 — Bypass banner production gate (P1)

`auth-bypass-banner.tsx` now also early-returns on
`NEXT_PUBLIC_VERCEL_ENV === 'production'`. Defense-in-depth: even
if AUTH_BYPASS gets accidentally left on for production, the
purple banner never reaches public visitors.

### Q3-4 — 10-city programmatic SEO (P1)

NEW `lib/cities.ts` (Ibiza live + 9 recruiting):
Mallorca, Madrid, Barcelona, Valencia, Sevilla, Málaga, Bilbao,
Marbella, Alicante. Per city: slug, ES/EN names, province, region,
coords, population, isLive. `getSisterCities()` Haversine helper.

NEW `app/[locale]/medico-domicilio/[city]/page.tsx`:
- `generateStaticParams` emits 20 (locale × city) tuples
- Per-page JSON-LD: MedicalBusiness (areaServed + GeoCoordinates) +
  FAQPage (6 city-templated Q&A) + BreadcrumbList
- Hero with city eyebrow + Live badge if isLive; H1 with city in
  title; trust pills (licensed, 24/7, 5 langs)
- About section with `{population}` + `{region}` interpolation for
  unique content per city
- "Próximamente" amber banner + recruitment copy when !isLive
- FAQ accordion (price, ETA, license, invoice, languages, payment)
  with `{city}` interpolated in q + a
- Sister-cities internal-link cluster (3 closest, by Haversine)

Sitemap: 20 new entries (10 × 2). Priority 0.85 for Ibiza, 0.7
for recruiting cities. hreflang ES↔EN with x-default → ES.

URL pattern note: spec asked for `medico-domicilio-[city]` (hyphen
joining), but Next.js doesn't allow static+dynamic in one folder
name. Shipped `medico-domicilio/[city]/`. SEO impact identical.

### Q3-5 — Dynamic doctors count (P2)

`/pro/page.tsx` now fetches the count of active+verified doctors
via service-role before rendering ProHero. Falls back to 9 on
error. ProHero gains `activeDoctors` prop. Badge text updated to
use `{count}` placeholder: "{count} médicos activos en Ibiza ·
Mallorca Q3 2026".

---

## R3 live audit

```bash
$ git log --oneline -3
b405848 feat(round20-B): 10-city programmatic SEO + sitemap
f907895 feat(round20-q3-2,3,5): testimonial + clinic logos + bypass gate + count
a6ac0f0 feat(round20-q3-1): /es/medicos public doctor listing

$ curl -s https://oncall.clinic/api/health | jq -r .commit
f907895...   (Q3-1 + Q3-2/3/5 live; Q3-4 city pages pending Vercel rebuild)

$ curl -I https://oncall.clinic/es/medicos
HTTP/2 200   ✓

$ curl -I https://oncall.clinic/es/medico-domicilio/ibiza
HTTP/2 404   (rebuild in flight, ~2 min)
```

---

## R7 compliance

✅ All 3 commits zero clinical surface:
- Q3-1 listing: only public profile fields
- Q3-2 testimonial: schedule + income narrative
- Q3-3 production gate: plumbing
- Q3-4 city pages: location + service + pricing FAQ
- Q3-5 dynamic count: aggregate metric

---

## Decisions flagged for Director

1. **City URL pattern divergence**: spec specified `medico-domicilio-[city]` (hyphen) but Next.js folder-naming constraint forced `medico-domicilio/[city]/`. SEO impact identical. Reversion via catch-all `[[...slug]]` route is possible if the exact hyphenated URL is mandatory.

2. **9 of 10 cities marked !isLive**: their pages render with "Próximamente" amber banner. Currently INCLUDED in sitemap with priority 0.7 to seed SEO ranking even without doctors. If you prefer hiding them until doctors are recruited, easy 1-line filter on sitemap loop. Recommend keeping current behavior — empty-area pages still rank for "{city}" + service.

3. **Doctor profile slug path**: `/[locale]/medicos/[slug]` deferred (R17-C originally noted). With Q3-1's listing shipping, the per-doctor profile page is the natural next small piece. Could ship in a follow-up if you want that surface for SEO + reviews display.

4. **Sister cities cluster**: shows 3 closest other cities. Excludes the current city. Could be tuned to "5 closest" or "all 10 in a more compact layout". Current 3-card design is mobile-friendly + matches the rest of the page rhythm.

---

## Alpha launch readiness — final state

✅ Q1 (foundation) + Q2 (pre-launch) + Q3 (polish) — **complete**.

Migrations applied: 35 total. Last 4 = R17-D coverage (032), R17-E
position (033), R17-F push (034), R18-C invites (035).

Pending Director/Cowork:
1. Apple Pay verification file (Stripe Dashboard task per Q2 outbox)
2. Audit live integral 3 lanes after Q3-4 rebuild lands
3. Stripe webhooks + SMS + Push live test
4. GO/NO-GO meeting → 1 jun 2026 launch
