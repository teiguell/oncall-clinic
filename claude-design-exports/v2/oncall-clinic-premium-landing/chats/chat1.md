# Chat

_Started 2026-04-19 21:10 UTC_

---

## User

Design a mobile-first premium landing page for OnCall Clinic — a medical house-call app in Ibiza, Spain. The app connects tourists and residents with verified doctors who visit your hotel, villa, or home.

Brand: Premium healthcare meets Mediterranean warmth. Colors: Primary #3B82F6 (blue), Success #10B981 (green), Accent #F59E0B (warm amber), Background #FAFBFC. Font: Inter. Border radius: 12-16px (rounded-card feel).

Sections (scrollable single page):
1. HERO: Large headline "Tu médico, donde estés" / "Your doctor, wherever you are". Subline: "Médicos verificados a domicilio en Ibiza. Desde 1 hora." Prominent CTA button "Solicitar médico" in primary blue. Subtle gradient background (white to very light blue). Trust line below: "Médicos colegiados · Seguro RC · Pago seguro"
2. HOW IT WORKS: 3-step horizontal cards with icons (1. Describe symptoms 2. Choose your doctor 3. Doctor arrives). Clean, minimal icons.
3. SERVICES: 4 cards — General Medicine (active, €150), Pediatrics, Physiotherapy, Nursing (last 3 with "Coming soon" badge). Card style: white with subtle shadow, rounded.
4. DOCTOR PREVIEW: 3 doctor cards Zocdoc-style — photo placeholder circle, name, specialty, rating stars, "Verified" green badge, response time "~12 min". Premium feel.
5. TRUST SECTION: Two cards side by side — emerald "What's included" (consultation, prescription, report, follow-up) and rose "What's NOT included" (emergencies → call 112).
6. FAQ: 6 questions in accordion style.
7. CTA FINAL: "¿Necesitas un médico?" + button + phone number fallback.
8. FOOTER: Ibiza Care SL · CIF B19973569 · Links to legal pages · Language switcher ES/EN.

Style: Think Uber Health meets Zocdoc meets premium Ibiza hotel website. White space generous, typography hierarchy clear, high contrast WCAG AA. Touch targets 44px minimum. No stock photos — use abstract shapes, gradients, and icons instead.

## Assistant

I'll design a premium mobile-first landing page for OnCall Clinic. Let me plan this out and build it.

_[tool: update_todos]_

I'll design a premium mobile-first landing page for OnCall Clinic. Since this is mobile-first, I'll render it inside an iOS frame for context, with the page scrollable within. Let me set up the scaffold.

_[tool: copy_starter_component]_

Good. Now let me design the system. I'll note the aesthetic direction:

**System I'll commit to:**
- Brand: OnCall Clinic (healthcare) — but I'll design original UI, not copying any real medical app
- Primary #3B82F6, Success #10B981, Accent #F59E0B, BG #FAFBFC
- Inter, with display tightening via letter-spacing
- Cards: 16px radius, soft shadow `0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(15,23,42,0.04)`
- Hero gradient: subtle white → oklch(97% 0.02 230) with a warm accent orb for Mediterranean feel
- Placeholder imagery = abstract shapes + gradients, never stock photos
- Mobile viewport: 402×874 inside iOS frame, but the page itself is a full mobile landing, so I'll also expose a "full-bleed mobile" view via Tweaks (with/without device frame, language ES/EN)

Let me split into files for maintainability.

_[tool: write_file]_

_[tool: write_file]_

Now the main landing components:

_[tool: write_file]_

_[tool: snip]_

Now the main app file:

_[tool: write_file]_

_[tool: done]_

_[tool: snip]_

_[tool: fork_verifier_agent]_

Delivered the mobile-first OnCall Clinic landing.

**What's in it:**
- All 8 sections (hero, how it works, services, doctors, trust, FAQ, final CTA, footer)
- Full ES/EN copy, switchable from the footer or Tweaks panel
- Booking sheet animated in from the bottom on any primary CTA
- Accordion FAQ, verified-doctor badges, 44px+ touch targets, WCAG-AA contrast
- Abstract gradient "Ibiza orb" in the hero — no stock photos
- Inter font, 12–16px radii, shadow system, brand palette honored

**Tweaks panel (toolbar toggle):**
- Language ES / EN
- Frame: iPhone device vs. full-bleed mobile
- Accent vibe: warm / cool / rose

## User

A background task has completed. Here are the results:

## Assistant

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: done]_

Fixed the status bar overlap — hero top padding bumped to 76px so content clears the dynamic island.

