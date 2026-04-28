# MEGA-PRIORITIES Q1 (cont) — R16 + R17 batch 2 shipped

**Date:** 2026-04-28 PM CET
**HEAD:** `743bb97`
**Status:** ✅ 5 commits sequential. R3 verified live (R17-E pending Vercel rebuild).
**Trigger:** continuation of `2026-04-28-1330-MEGA-PRIORITIES-Q1.md`

---

## Commit ladder

| # | Hash | Round | LOC | Migration |
|---|---|---|---|---|
| 1 | `62bc84d` | R16-F+G+H | +224 | — |
| 2 | `20fffa2` | R17-B | +667 | 030 |
| 3 | `1241925` | R17-C | +625 | 031 |
| 4 | `91ade5d` | R17-D | +651 | 032 |
| 5 | `743bb97` | R17-E | +159 | 033 |

Total: ~2,300 lines across 5 features + 4 migrations applied via Supabase MCP.

---

## What's done

### Round 16 — fully complete (8/8 sub-tasks)

Combined with prior session (R16-A/D/E shipped in `5c26ece`):

- ✅ R16-A: Google Places autocomplete (Ibiza bounds)
- ✅ R16-B: inline geolocate (built into PlacesAutocomplete)
- ⏸ R16-C: Apple/Google Pay (Director-side Stripe Dashboard task)
- ✅ R16-D: trust badges Step 3
- ✅ R16-E: price preview Step 1
- ✅ R16-F: doctors count preview Step 1 (NEW endpoint)
- ✅ R16-G: skeleton loaders (already shipped via DoctorCardSkeleton)
- ✅ R16-H: humanized error microcopy (12 i18n keys + lib helper)

### Round 17 — 5/6 sub-tasks complete

- ✅ R17-A: doctor welcome wizard (prior session, `1c64bb4`)
- ✅ R17-B: physical check-in/checkout — endpoints + UI + SMS
- ✅ R17-C: public reviews + internal notes + review submit page
- ✅ R17-D: availability + coverage editors
- ✅ R17-E: doctor live geo-position watcher
- ⏸ R17-F: Web Push (deferred — needs Director VAPID env vars)

---

## R3 live audit

```bash
$ curl -s https://oncall.clinic/api/health | jq -r .commit
91ade5d...   (R17-E pending Vercel rebuild ~2 min)

$ curl -s 'https://oncall.clinic/api/doctors/count?lat=38.9067&lng=1.4206&radius_km=25'
{"count":9,"etaRange":"15-75 min"}   ✓ R16-F endpoint LIVE

$ Migrations applied via Supabase MCP:
  029_doctor_welcome_completed (prior session)
  030_consultation_checkin_checkout
  031_reviews_internal_notes_v2
  032_doctor_availability_coverage
  033_consultation_doctor_position
```

---

## R7 compliance — all 5 commits

- ✅ R16-F count endpoint exposes counts + ETA buckets only
- ✅ R17-B SMS = arrival logistics; check-in stores doctor GPS only (operational)
- ✅ R17-C reviews are rating + 500-char operational comment; internal notes route blocks clinical-hint regex (síntoma/diagnóstico/prescrib*/dolor/mg-ml-dosage)
- ✅ R17-D availability + coverage are scheduling/geographic
- ✅ R17-E position scoped to active consultation lifecycle (status gate)

---

## Decisions flagged for Director

### 1. R17-F Web Push needs Director env vars
Spec requires VAPID keys + service worker. Director-side tasks:
1. `npx web-push generate-vapid-keys` → produces public + private
2. Add to Vercel env:
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (public, ships to client)
   - `VAPID_PRIVATE_KEY` (server-only)
   - `VAPID_SUBJECT` (e.g. `mailto:soporte@oncall.clinic`)
After that lands, ~1h Code work to wire `public/sw.js` + push subscription endpoint + `web-push` npm package.

### 2. Internal-notes R7 soft block — false positive risk
The clinical-hint regex `/dolor/i` will reject notes like "el paciente no tenía dolor" or "sin dolor torácico mencionado". The spec is clear that internal notes are operational only, but doctors may legitimately want to record "patient reported no pain in their abdomen as expected" type observations. Two options:
- **a) Keep soft-block as-is**: false positives are acceptable since notes are NOT a clinical record.
- **b) Reduce sensitivity**: drop `dolor` from the blocklist (keep síntoma/diagnóstico/prescrib*/dosage).
Currently shipping (a). Easy to relax if Cowork audit flags false positives.

### 3. R17-E watcher mount scope
Currently mounted in CheckOutPanel only (status='in_progress'). Could also mount on CheckInPanel (status='accepted') so the patient sees live position BEFORE the doctor checks in. Trade-off: more privacy exposure vs better tracking UX. Recommend keeping narrow for now (R7 minimization).

### 4. Public doctor profile page (`/[locale]/medicos/[slug]`)
R17-C delivers the data infrastructure for public reviews (table + RLS public-read policy + submit endpoint), but the actual display page that lists "Dr. García · 4.7 ★ (87 reviews) · 'Recent comment...'" is a separate small piece. Director: priority to ship in next session OR defer to R20-B (SEO Strategic)?

---

## Deferred to next session

- **R17-F Web Push**: see decision #1 (Director env-var blocker)
- **R14F-5b client-side bypass**: still pending from prior session — tracking + doctor dashboard `'use client'` pages need server proxy endpoints for bypass-mode reads
- **Public doctor profile `/[locale]/medicos/[slug]`** with reviews display
- **Welcome wizard auto-redirect**: 2-line addition to `/doctor/layout.tsx` (`if (welcome_completed_at IS NULL) redirect('/welcome')`)
- **R16-C Apple/Google Pay**: Director's Stripe Dashboard task (no code change)
