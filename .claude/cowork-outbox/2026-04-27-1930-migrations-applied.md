# Migrations 021 + 022 + 023 — APPLIED

**Date:** 2026-04-27 19:30 CET
**Status:** ✅ all 3 applied via Supabase MCP, verified live

---

## Audit summary

The Round 14 outbox flagged migrations 021 + 022 as pending DB push.
Investigation against `mcp__supabase__list_migrations` revealed a wider
gap: 6 local migration files (013, 014, 015, 020, 021, 022) had no
tracking row in DB. But schema inspection showed 4 of them were
already applied via direct DDL (likely via Supabase Studio or earlier
manual `db push`), just missing migration tracking:

| File | DB tracking | Schema state | Action |
|---|---|---|---|
| `013_pricing.sql` | none | applied | leave alone (already in schema) |
| `014_doctor_free_pricing.sql` | none | applied | leave alone |
| `015_user_consents.sql` | none | applied | leave alone |
| `020_find_nearest_doctors_rpc.sql` | none | applied | leave alone |
| `021_doctor_profiles_activation.sql` | none | **missing** | **applied today** |
| `022_notifications_log.sql` | none | **missing** | **applied today** |

Plus a NEW migration to close a Round 14 punted decision:

| File | Purpose |
|---|---|
| `023_consultations_eta_sms_sent_at.sql` | strict once-per-consultation idempotency for the patient "doctor arriving in ~10 min" SMS |

---

## What changed in production DB

### `doctor_profiles` (migration 021)

Added 8 columns + 1 partial unique index:

| Column | Type | Default |
|---|---|---|
| `activation_status` | TEXT NOT NULL | `'active'` (5-value enum check) |
| `email_verified_at` | TIMESTAMPTZ | null |
| `phone_verified_at` | TIMESTAMPTZ | null |
| `activation_email_token` | TEXT | null |
| `activation_email_token_expires` | TIMESTAMPTZ | null |
| `phone_otp_code` | TEXT | null |
| `phone_otp_expires_at` | TIMESTAMPTZ | null |
| `sms_notifications_enabled` | BOOLEAN NOT NULL | `TRUE` |

**Backfill:** 9 existing doctors all default to `activation_status='active'` — correct, they pre-date the activation flow (Round 11) and shouldn't be hidden from patients.

The existing seed demo-doctor (`628856ea-4c70-4bfb-b35d-dfd56d95f951`) is unaffected and visible.

### `notifications_log` (migration 022) — NEW table

12 columns. 3 indexes (rate-limit hot path + per-user history + status diagnostic). 3 RLS policies (service-role full, admin SELECT, self SELECT). RLS enabled.

The Round 14-C SMS triggers (`/api/notifications/sms-otp/send`, `/api/consultations/[id]/accept`, `/api/doctor/eta-update`) now persist real audit rows. Previously the `logNotification()` calls were fail-open silent because the table didn't exist.

### `consultations.eta_sms_sent_at` (migration 023, NEW) — strict idempotency

Closes the punted decision from `2026-04-27-1830-round14-shipped.md`:

> The doctor ETA update endpoint uses the 60s rate limit as a soft idempotency guarantee. For strict "fire exactly once when crossing the 10-min threshold" semantics we'd need a `consultations.eta_sms_sent_at` column.

**Done.** Routes update:

```ts
// app/api/doctor/eta-update/route.ts
if (consultation.eta_sms_sent_at) {
  return NextResponse.json({ ok: true, sent: false, status: 'skipped' })
}
// ... fire SMS ...
if (result.ok && !result.skipped) {
  await supabase.from('consultations')
    .update({ eta_sms_sent_at: new Date().toISOString() })
    .eq('id', consultationId)
}
```

The chatty-stream case (doctor crosses 10 → 11 → 9 → 11 within the rate-limit window) now blocks duplicate sends at the consultation level. The 60-s rate limit on `notifications_log` still catches cross-consultation collisions (same patient phone, two visits stacked).

---

## Verification

```
$ mcp__supabase__list_migrations  | tail -5
20260424214902 rename_user_consents_health_data_processing_to_health_data
20260427115146 021_doctor_profiles_activation       ← NEW
20260427115152 022_notifications_log                 ← NEW
20260427115317 023_consultations_eta_sms_sent_at     ← NEW

doctor_profiles.activation_status:  9 rows, all 'active'
notifications_log: 12 cols, 4 idx, 3 policies, RLS enabled
consultations.eta_sms_sent_at: present, nullable
```

`tsc --noEmit` — 0 errors.

---

## Director — pending action items

These are unchanged from the Round 14 outbox; documenting again for closure tracking:

1. **Vercel env vars** for Twilio go-live (no code change needed):
   ```
   TWILIO_ACCOUNT_SID = ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN  = <secret>
   TWILIO_MESSAGING_SERVICE_SID = MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   SMS_PROVIDER = twilio
   ```
   Without these the provider stays in stub mode. Stub now logs full rows to `notifications_log` (status='sent', provider='stub') so you can verify the trigger plumbing without spending Twilio credit.

2. **Twilio trial → production upgrade** ($20 deposit). First real patient SMS to an unverified number will fail with error code 21608 until upgrade. The failure is now visible in `notifications_log` (status='failed', error_code='21608').

3. **307 vs 308 on /pro alias redirects** — still pending decision (docs note in `lib/...`).
