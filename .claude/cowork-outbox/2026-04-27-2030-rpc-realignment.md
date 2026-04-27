# find_nearest_doctors RPC realignment + dead-column fix

**Date:** 2026-04-27 20:30 CET
**Status:** ✅ migration 024 applied, RPC verified live (returns 9 doctors)
**Trigger:** Migration 021's explicit comment said `/api/doctors` and `find_nearest_doctors` should filter `activation_status='active'`.

---

## TL;DR

Started as a 1-filter task. Surfaced 2 latent bugs and 1 schema drift:

1. **find_nearest_doctors RPC was failing silently.** Live signature `(patient_lat, patient_lng, ...)` did not match callers' `{ lat_in, lng_in, ... }`. Every call fell through to fallback queries.

2. **/api/doctors fallback was returning `[]` for every call.** Its SELECT included a `night_price` column that does not exist on `doctor_profiles`. Live curl confirms `[]` even with valid coordinates. Not on the booking critical path (the patient UI bypasses this route via direct Supabase client) but a real public-API regression.

3. **Migration 020 file ↔ live DB drift.** The file was never successfully applied — it has a `dp::jsonb` cast Postgres rejects + the same non-existent `night_price` column.

Migration 024 closes all three: drops the live mismatched function, creates a working one matching callers' signature, drops `night_price`, adds the `activation_status='active'` filter, fixes the route's SELECT.

---

## Before / after

### find_nearest_doctors RPC

| | Before (live) | After (migration 024) |
|---|---|---|
| Signature | `(patient_lat, patient_lng, radius_km, specialty_filter)` | `(lat_in, lng_in, radius_km)` ← matches callers |
| Return columns | `(doctor_id, user_id, full_name, specialty, rating, distance_km)` | `(id, user_id, specialty, bio, rating, total_reviews, city, consultation_price, current_lat, current_lng, distance_km)` |
| `activation_status` filter | ❌ | ✅ added |
| Working with current callers | ❌ silent param mismatch | ✅ tested: 9 doctors returned for Ibiza |

### /api/doctors

| | Before | After |
|---|---|---|
| Live response | `[]` (silent failure due to non-existent `night_price`) | Real doctor list |
| `activation_status` filter | ❌ | ✅ |
| Verified live | `curl '/api/doctors?near=38.9067,1.4206'` → `[]` | (will verify after deploy) |

---

## RPC live test

```
SELECT id, user_id, city, consultation_price, distance_km
FROM find_nearest_doctors(38.9067, 1.4206, 50);

→ 9 rows, sorted by distance_km ASC.
   Closest: seed demo-doctor 628856ea-... at 0 km
   Farthest: 13.35 km
```

Eligibility breakdown:
```
available:    9 / 9
verified:     9 / 9
active:       9 / 9   (all default to 'active' from migration 021)
has_location: 9 / 9
rpc_eligible: 9 / 9
```

---

## Files changed

```
NEW:
  supabase/migrations/024_find_nearest_doctors_activation_filter.sql

MODIFIED:
  app/api/doctors/route.ts                     (drop night_price + activation filter)
  app/api/consultations/assign/route.ts        (activation filter)
  components/doctor-selector.tsx               (activation filter)
```

---

## Decisions flagged

### 1. Delete migration 020 file?
It was never applied and 024 supersedes it. Three options:
- **a) Leave as-is.** Cleanest history; file is a historical artifact.
- **b) Add `-- SUPERSEDED BY 024 — DO NOT APPLY`** header. Documents the dead state in-file.
- **c) Delete the file.** Risk: confuses anyone who reads git history of the directory expecting the file to exist when 020 was first committed.

I went with (a). Open to (b) on request.

### 2. `night_price` archaeology
No migration ever created this column. It was a stale SELECT leftover, probably from a half-implemented night-surcharge feature that was abandoned. **No data lost** — the column never existed in production. If you want a night surcharge it's a NEW feature, not a recovery.

### 3. /api/doctors leakage
The route is public + unauthenticated. After this fix it actually returns data — currently all 9 active doctors' `(lat, lng, specialty, price, rating, full_name, avatar)`. Two questions:

- **Intended?** If yes, no change needed (this is what the route was designed to do back in Round 4-ish).
- **PII concern?** `full_name` + `avatar` + approximate `lat/lng` for active medical doctors. Doctors signed up knowing they'd appear in patient search, but the bar for an authenticated patient session vs a public scraper is different. Worth a Director call.

If you want it auth-gated, the patch is a 1-liner:
```ts
if (!user) return NextResponse.json([], { status: 401 })
```

---

## Pending Director (still open from prior outbox)

- Vercel env vars for Twilio (`TWILIO_*` + `SMS_PROVIDER=twilio`)
- Twilio trial → production upgrade ($20)
- 307 vs 308 on /pro alias redirects
