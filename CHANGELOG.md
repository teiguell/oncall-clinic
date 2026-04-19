# Changelog

All notable changes to OnCall Clinic will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.5.0] — 2026-04-19 — Sprint 5: Pricing legal refactor + intermediary disclaimer + FAQ

### Added
- Migration 014: `doctor_profiles.consultation_price` INTEGER with technical guard-rails (€50-€500) for **doctor-set free pricing** (LSSI-CE + Ley 15/2007 Defensa Competencia compliance). Platform publishes a recommended range only; doctors set their own price.
- `lib/regional-pricing.ts` refactor: `REGIONAL_PRICING` with `recommendedRange` + `nightSurchargeRecommended` (non-binding). Removed `DOCTOR_ADJUSTMENT_RANGE` and `calculateConsultationPrice`.
- `components/intermediary-disclaimer.tsx`: reusable component with 3 variants (`footer`, `inline`, `card`). LEGALLY REQUIRED per LSSI-CE intermediation status.
- FAQ section on landing (6 Q&A, accordion with `<details>`): arrival time, services, payment, cancellation, verification, emergencies. Bilingual ES/EN.
- Privacy policy §6bis: automated decisions (Art. 22 GDPR) — "no decisions based solely on automated processing".

### Changed
- Intermediary disclaimer added to: landing footer + "For doctors" section.
- Doctor's consultation price is now set freely in `doctor_profiles.consultation_price` (replaces the ±30% adjustment model from migration 013).

### Fixed
- Previous `calculateConsultationPrice` inline callers removed (only `isNightOrHoliday` helper retained for future surcharge logic).

### Legal compliance
- STS 805/2020 (Glovo) + Ley 15/2007 (Defensa Competencia): doctors set their own price; platform cannot fix prices.
- Art. 22 RGPD: explicit declaration of no fully-automated legal-effect decisions.
- LSSI-CE intermediation: disclaimer visible in 2 landing locations (footer + forDoctors section); extendable to booking confirm, register, legal pages via `IntermediaryDisclaimer` component.

## [0.4.0] — 2026-04-19 — Sprint 4: Fixes + E2E Simulation Readiness

### Added
- `/api/consultations/assign` endpoint: broadcasts pending consultations to nearby doctors via `find_nearest_doctors` RPC; first-accept-wins race semantics via notifications.
- `scripts/seed-test-users.ts` for E2E manual testing: 3 doctors (Martínez Ibiza, Ruiz Santa Eulalia, Wilson San Antonio) + 1 patient + pre-seeded completed consultation with 5★ review.
- Doctor dashboard action buttons: accept → on route → arrived → complete (updates `started_at`, `completed_at` + triggers consultation_status_history).
- Migration 013: `doctor_profiles.activated_at` + `price_adjustment` (±30%) for dynamic commission and per-doctor price.
- `lib/pricing.ts` + `lib/regional-pricing.ts`: Year 1 promo 10% commission, standard 15%, night/holiday 1.30x surcharge.
- Payout route now recalculates commission dynamically using `doctor.activated_at`.
- `@keyframes fadeSlideUp` + `.page-enter` + `.btn-hover` global utilities.
- Input `htmlFor` auto-wiring via `React.useId()` fallback (WCAG 1.3.1).

### Changed
- **SERVICES reduced to 4 items** (active: general_medicine; coming soon: pediatrics, physio, nursing). Removed cardiology, emergency, gynecology, dermatology, traumatology, internal_medicine.
- **Removed urgent multiplier** — all consultations are flat-price; adjustments applied at payout time via doctor's `price_adjustment` + night surcharge.
- Booking service cards: disabled + "Coming soon" badge + `cursor-not-allowed` for inactive services.
- All hardcoded "85%" / "15%" removed from user-facing i18n (patient-facing price breakdown shows no commission split).
- `forDoctors.benefit1Desc`: "Get paid directly to your account. Reduced commission in your first year."
- Cookie consent: dual check (cookie + localStorage) for better browser compatibility; banner shows after 800ms.

### Fixed
- Landing `COMIB` references removed from 9 user-facing i18n keys → "Médicos colegiados verificados" / "Verified licensed doctors".
- DPO email `teiguell.med@gmail.com` → `dpo@oncall.clinic` globally.
- Domain `oncallclinic.com` → `oncall.clinic` globally (sed across app, components, messages, lib, public).
- Footer FAQ link `/register` → `#como-funciona`.
- Privacy intro: added LOPDGDD (Ley Orgánica 3/2018) reference alongside GDPR.
- Withdrawal rights in Terms: added period (14 days), Art. 103.a exception, practice, model form (RDL 1/2007 Annex B).
- DPIA (Art. 35 GDPR) in Privacy: documented 8 technical measures (TLS 1.3, AES-256, RLS, pseudonymization, audits, training, doc verification, erasure).
- CAIB health registry notice in landing footer.



## [0.3.0] — 2026-04-19 — Sprint 3: Legal compliance, UI premium, versioning

### Added
- **Version badge** fixed top-right on every page with animated pulse dot.
- **CHANGELOG.md** following Keep a Changelog spec.
- Cookie consent banner (Art. 22.2 LSSI-CE) with Accept all / Reject non-essential / Configure options; 13-month expiry per AEPD recommendation.
- **Aviso Legal** page (`/legal/aviso-legal`) with full LSSI-CE Art. 10 disclosure: CIF B19973569, C/ Lugo 11 Sant Josep, Registro Mercantil Eivissa IB-21129, CNAE 8690, DPO contact.
- **Right of withdrawal** section in Terms (Art. 71 + 103.a LGDCU) with model withdrawal form (RDL 1/2007 Annex B).
- **DPIA section** in Privacy Policy (Art. 35 GDPR): encryption in transit/rest, role-based access control, pseudonymization, AEPD-available report.
- **CAIB registry notice** in footer: "Registro de Centros Sanitarios Illes Balears en trámite".
- Design tokens: warm palette (`#FAFBFC` bg, `#475569` muted-fg WCAG 4.62:1), Inter + Plus Jakarta Sans, font-scale 12-60px, shadow/radius/animation tokens.
- Skip-to-content link (WCAG 2.4.1), `:focus-visible` rings (WCAG 2.4.7), iOS no-zoom inputs (16px), `prefers-reduced-motion` support.
- TrustBadges component (COMIB / Insurance / GDPR / English), pill-success/warning/info/neutral utilities.
- Skeleton variants: `DoctorCardSkeleton`, `ConsultationCardSkeleton`, `TrackingMapSkeleton`.
- DoctorCard component (Zocdoc-style) with avatar/rating/ETA/COMIB badge.
- PageWrapper + fadeSlideUp page-enter animation.
- Zustand booking store + AuthModal (Google OAuth + magic link) for deferred registration scaffolding.
- Personalized greeting in dashboards based on time of day.
- Progress bar animation in booking flow steps.
- OG image meta tags for WhatsApp/social sharing.

### Changed
- **Landing copy**: removed "urgencias en minutos" / "30 min" references; all wording now "desde 1 hora".
- Services section: 1 active (General Medicine) + 3 coming soon (Pediatrics, Physiotherapy, Nursing). Removed Cardiology, Emergency, Internal Medicine.
- Removed fake stats (+500 doctors, 4.9★ rating without real reviews) per Ley 3/1991 LCD.
- Removed hardcoded "cientos de médicos verificados" → "nuestros médicos verificados".
- Whitespace compacted: `py-24/py-32` → `py-16 md:py-20`.
- Input font-size: `text-base md:text-sm` (16px on mobile prevents iOS auto-zoom).
- Button base includes `btn-hover` (translateY + shadow on hover).
- Middleware: merge `x-next-intl-locale` headers from intl response into Supabase response (fix `/en` falling back to default locale).
- Delete-account: soft-delete → hard-delete per RGPD Art. 17 with 10-step FK-safe cascade + IP-captured consent revocation.
- Payout flow: remove duplicate commission calculation; single source of truth at consultation creation.

### Fixed
- `doctor_profiles.verification_status` unified to `'verified'` (migration 010); was mismatched between `'approved'` (migration 001) and `'verified'` (migration 008) → no doctor appeared in `public_doctors` view.
- `check_rc_expiry()` trigger inserted into `notifications.message` instead of `notifications.body` (migration 009 fix).
- Reviews FK: `doctor_id → doctor_profiles(id)` (was `→ profiles(id)`).
- Refunds: `ON DELETE CASCADE` on `consultation_id`.
- Chat RLS: restricted UPDATE to `read_at` only (immutable content via `WITH CHECK`).
- Referral code: UNIQUE partial index + collision retry loop (8-char codes).
- Payout audit log table (admin-only RLS) + inserts on success/failure.
- Navbar i18n: replaced hardcoded `locale === 'en' ? ... : ...` ternaries with `t()`.
- Coordinates defaults: Madrid (40.4168, -3.7038) → Ibiza (38.9067, 1.4206).

### Security
- Rate limiting on API routes (checkout 5/min, consent 10/min, delete-account 2/min) via in-memory Map.
- Security headers: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` camera/mic off + geo self.
- Input sanitization on checkout route: trim + max-length on address, symptoms, notes.
- Hard-delete account with IP-captured consent revocation for audit trail.

### Infrastructure
- Node 20.x forced via `engines`, `.node-version`, `.nvmrc` to fix Vercel deploy failures (Node 24 incompatible with Next.js 14.2.35).
- 12 SQL migrations (`001_initial_schema` → `012_fix_chat_rls`).

## [0.2.0] — 2026-04-17 — Sprint 2: Design system, legal pages, i18n

### Added
- Legal pages: `/legal/terms`, `/legal/privacy`, `/legal/cookies` with real LSSI-CE, LGDCU, Ley 7/2014 content.
- Next-intl middleware + ES/EN i18n with perfect parity.
- Mobile hamburger menu with accessible toggle.
- HTML landmarks (`<header>`, `<main>`, `<nav aria-label>`).
- Dynamic name placeholder in register based on selected role.
- Stronger password policy (12+ chars, uppercase, number).
- Patient profile, doctor profile, settings pages (all client components).
- Doctor consultations page with Supabase Realtime.
- Stripe Checkout flow (test mode + real mode with metadata-driven verify endpoint).
- Booking success page with auto-redirect.
- Test mode banner (sticky amber) controlled by `NEXT_PUBLIC_TEST_MODE`.

### Changed
- Landing: removed Ibiza-specific copy to be internationally generic.
- CTA primary `/register` → `/patient/request`.
- Service icons corrected (Brain → Thermometer, Phone → Dumbbell).

### Fixed
- i18n middleware bug: `/en` URLs were serving Spanish content (intl headers stripped by Supabase session refresh).
- Hrefs pointing to `#` replaced with real routes.

## [0.1.0] — 2026-04-15 — Sprint 1: MVP base

### Added
- Next.js 14 + App Router + next-intl scaffold.
- Supabase auth + RLS + 9 SQL migrations (profiles, doctor_profiles, consultations, payouts, notifications, reviews, referrals, consent_log, RC expiry trigger).
- Stripe Connect Express (15% platform commission).
- Role-based dashboards (patient, doctor, admin).
- Consultation tracking with Google Maps (@vis.gl/react-google-maps).
- Real-time chat (consultation_messages + Supabase channels).
- Crisp live chat widget.
- Seed script with Ibiza-specific test data (5 patients, 5 doctors, 22 consultations).

[Unreleased]: https://github.com/teiguell/oncall-clinic/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/teiguell/oncall-clinic/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/teiguell/oncall-clinic/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/teiguell/oncall-clinic/releases/tag/v0.1.0
