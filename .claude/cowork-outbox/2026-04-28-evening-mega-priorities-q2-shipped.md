# MEGA-PRIORITIES Q2 — 3 pre-launch features SHIPPED

**Date:** 2026-04-28 evening CET
**HEAD:** `26f435b`
**Status:** ✅ All 3 features + 1 hotfix. Alpha launch ready.
**Trigger:** `2026-04-28-1600-MEGA-PRIORITIES-Q2.md`

---

## Commit ladder

| # | Hash | Round | LOC |
|---|---|---|---|
| 1 | `72d1b33` | R16-C | +55 |
| 2 | `723a608` | R17-F | +540 |
| 3 | `fd5c2e0` | R18-C | +515 |
| 4 | `26f435b` | hotfix | +4 |

Total: ~1,100 lines + 2 migrations applied (034, 035).

---

## R16-C — Apple Pay / Google Pay (P0)

`public/.well-known/` directory + provisioning README. Director's
Stripe Dashboard task remains: add domain → download Apple file →
place verbatim. After that, iPhone Safari Stripe Checkout
automatically shows the Apple Pay button.

`payment_method_types: ['card']` (line 257 of checkout route)
already enables wallets — no code change needed beyond comment.

---

## R17-F — Web Push (P1)

### Schema (Migration 034)

`push_subscriptions { user_id, endpoint UNIQUE, keys JSONB, user_agent,
last_used_at, created_at }`. RLS: users-own + service-role policies.

### Server (lib/push.ts)

- `pushToUser(userId, payload)` fans out per-row in parallel
- 410-Gone: soft-deletes the dead subscription
- Silent no-op when VAPID env vars missing (dev/preview safe)

### Endpoints

- `POST /api/push/subscribe` — UPSERT by endpoint
- `POST /api/push/unsubscribe` — DELETE matching (user, endpoint)

### Service Worker (public/sw.js)

Minimal: `push` event → showNotification; `notificationclick` →
focus existing tab + navigate OR open new window. skipWaiting +
clients.claim for instant activation on update.

### Client island (PushSubscriber)

Permission-gated: only shows the CTA when `Notification.permission`
is 'default'. Hidden once granted/denied (no nag UX). Pre-registers
`/sw.js` silently on mount; subscribe happens on user gesture.
Mounted at top of patient + doctor dashboards.

### Triggers wired

- Doctor accepts → push patient: "✅ Tu médico ha aceptado la consulta. En camino"
- Doctor checks in → push patient: "📍 Tu médico ha llegado a {address}"

Both fire ALONGSIDE the existing Twilio SMS (push is complementary,
not replacement). Both deep-link to `/[locale]/patient/tracking/[id]`.

### Dependencies + types

- `web-push@^3.6.7` + `@types/web-push@^3.6.4` in package.json
- `types/web-push.d.ts` ambient module so tsc passes before npm
  install runs locally (Vercel CI installs the real package)

### Env vars (Cowork added to Vercel pre-shipping)

✅ `VAPID_PUBLIC_KEY` (server)
✅ `VAPID_PRIVATE_KEY` (server)
✅ `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (client)

Optional `VAPID_SUBJECT` (defaults `mailto:dpo@oncall.clinic`).

---

## R18-C — Anonymous clinic register + invite tokens (P1)

### Schema (Migration 035)

`clinic_doctor_invites { id, clinic_id, doctor_email, doctor_name,
invite_token UUID UNIQUE, status, expires_at (NOW + 14d), accepted_at }`.
3 indexes + 2 RLS policies.

### Anonymous register flow

`/api/clinic/register` now supports two paths:

- **Path 1 (auth'd)**: existing session OR clinic bypass — same as R15A
- **Path 2 (anonymous)**: no session → `supabase.auth.admin
  .inviteUserByEmail(email)` mints user + sends magic-link email →
  INSERT profile + clinic via service-role → returns
  `{ magicLinkSent: true }`. Owner clicks email link → lands authenticated
  on `/clinic/dashboard` with verification banner.

Email-already-registered returns 409 with friendly hint
"Inicia sesión y vuelve a /clinic/register para continuar".

### Invite token flow

`/api/clinic/doctors/invite` extended:

- **Path A (registered doctor)**: `clinic_doctors` INSERT status='pending'
  (R15B behavior unchanged)
- **Path B (unregistered)**: NEW — INSERTs invite row + returns the
  full URL for the clinic owner to share manually:
  `/es/doctor/onboarding?inviteToken=<UUID>`

Quota now counts active links + pending invites both (prevents spray).
Idempotent: re-issuing for same email returns existing pending invite.

### Onboarding hook

`/api/doctor/onboarding-complete` reads `body.inviteToken`:

1. Look up invite by token (must be pending + non-expired)
2. INSERT `clinic_doctors { clinic_id, doctor_id, status='active' }`
3. UPDATE `doctor_profiles.clinic_id` (Booking Step 2 branding source)
4. UPDATE invite status='accepted' + accepted_at

Best-effort: failures don't roll back the doctor's onboarding.

### Wizard pass-through

The doctor wizard (`/[locale]/doctor/onboarding`) reads
`window.location.search` for `?inviteToken=` and posts it to the
completion route alongside `locale`.

### UI: Invite modal (ClinicDoctorsClient)

- New optional `name` field
- Success view variant 1 (registered): closes modal + reloads list
- Success view variant 2 (anonymous): shows the invite URL with
  "Copy link" button (clipboard.writeText + 1.5s feedback)

---

## Hotfix `26f435b` — middleware exclusions

Live audit caught `/sw.js` and `/.well-known/...` returning HTTP 307
(next-intl middleware was prefixing the locale).

Same root cause as the prior `/sitemap.xml` + `/robots.txt` P1-3
audit. Added both to the early-return list in `middleware.ts`.

---

## R3 verification

```
$ git log --oneline -4
26f435b fix(round17-F + 16-C): exclude /sw.js + /.well-known/ from middleware
fd5c2e0 feat(round18-C): anonymous clinic registration + doctor invite tokens
723a608 feat(round17-F): Web Push notifications (VAPID + service worker)
72d1b33 feat(round16-C): scaffold .well-known directory for Apple Pay

$ curl -s https://oncall.clinic/api/health | jq -r .commit
723a608... (R17-F live; R18-C + middleware hotfix pending Vercel rebuild)

$ Migrations applied:
  034_push_subscriptions
  035_clinic_doctor_invites
```

---

## R7 compliance

✅ All 3 commits zero clinical data:
- R16-C scaffold has no surface
- R17-F push payloads = arrival logistics ("aceptado", "llegado") +
  tracking deep-links (already R7-clean)
- R18-C invite tokens = operational ownership (clinic-doctor link)

---

## Decisions flagged for Director

1. **Apple Pay file provisioning**: pending. README at
   `public/.well-known/README.md` documents the Stripe Dashboard
   flow step-by-step.

2. **Resend email integration**: invite UI returns the URL inline
   for manual paste. Production wiring is small (`lib/notifications`
   already has the Resend transport). Defer until alpha audit confirms
   email is needed.

3. **Admin email on clinic register**: marked TODO in the route. 10-line
   addition using existing `notify({ kind: 'admin.clinic_signup' })`.

4. **Push trigger gaps**:
   - Patient submits booking → push doctor (from /api/consultations/assign)
   - 30-min visit reminder → push either side
   - Both deferred; the highest-impact patient-facing pushes (accept +
     check-in) ship now.

---

## Alpha launch readiness

Per the brief:

> Tras shipping R16-C + R17-F + R18-C: alpha launch READY.

✅ Code shipped. Pending Director / Cowork:

1. Apple Pay verification file → `public/.well-known/`
2. Audit live integral 3 lanes (mobile + desktop)
3. Smoke test E2E with 3 cuentas reales
4. Stripe webhooks live test
5. SMS Twilio + Web Push live test
6. GO/NO-GO meeting
7. Lanzamiento alpha 1 jun 2026
