# Chat

_Started 2026-04-19 21:24 UTC_

---

## User

Create a mobile-first interactive prototype (iPhone frame, 390px) for a patient dashboard and real-time doctor tracking screen. App: "OnCall Clinic" by Ibiza Care SL.

Design System: Primary #3B82F6, Success #10B981, Warning #F59E0B, Background #FAFBFC, Font Inter, border-radius 12-16px. Style: clean, premium, trustworthy — like Uber Health meets Doctolib.

Create a MULTI-STATE prototype with these screens navigable via tweaks:

SCREEN 1 — Patient Dashboard (Home):
- Top bar: "Hola, Sarah" + notification bell (1 badge)
- Active consultation card (prominent):
  - Status badge: "Médico en camino" (blue pulse animation)
  - Doctor: "Dra. María García" with avatar + verified badge
  - ETA: "12 min" large green text
  - Mini map preview showing doctor location moving
  - "Ver tracking" button
- Section "Consultas anteriores":
  - 2 past consultation cards with date, doctor, type, rating stars
- Quick actions row: "Nueva consulta", "Mi perfil", "Facturas"
- Bottom tab bar: Home (active), Consultas, Chat, Perfil

SCREEN 2 — Real-Time Tracking:
- Full-width map of Ibiza showing:
  - Doctor position (blue pulsing dot with avatar)
  - Patient location (pin marker)
  - Route line between them
  - ETA overlay: "Dra. García llegará en ~8 min"
- Bottom sheet (draggable):
  - Doctor card: avatar, name, specialty, phone icon, chat icon
  - Status timeline (vertical stepper):
    - "Solicitud confirmada" (check, green, done)
    - "Médico en camino" (car icon, blue, ACTIVE with pulse)
    - "Médico ha llegado" (pin, gray, pending)
    - "Consulta en curso" (stethoscope, gray, pending)
    - "Consulta finalizada" (check, gray, pending)
  - Live ETA updating: "8 min → 6 min → 3 min → Ha llegado!"
  - "Contactar" and "Cancelar" buttons

SCREEN 3 — Consultation Complete:
- Success card with confetti/check animation
- Consultation summary: date, duration "32 min", doctor, diagnosis notes
- Rating component: 5 stars interactive + text review area
- Invoice preview: "€150 — Pagado con Visa ****4242"
- "Descargar factura" button
- "Volver al inicio" button

SCREEN 4 — Chat with Doctor:
- Chat header: Doctor avatar + name + "En línea" green dot
- Chat bubbles:
  - Doctor: "Hola Sarah, estoy de camino. Llegaré en unos 10 minutos."
  - Patient: "Perfecto, estamos en la habitación 412 del Hotel Ushuaia"
  - Doctor: "Entendido. ¿Puedes confirmar los síntomas principales?"
  - Patient: "Fiebre alta desde ayer, dolor de cabeza y náuseas"
  - Doctor: "Gracias. Llevo medicación básica. Nos vemos enseguida."
- Message input with send button and attach icon
- "El médico está escribiendo..." typing indicator

Add tweaks: Language ES/EN, Screen (Dashboard/Tracking/Complete/Chat)

## Assistant

I'll create a premium, interactive patient dashboard prototype for OnCall Clinic. Let me start by planning and setting up the structure.

_[tool: update_todos]_

Noting the reminder — I'll build an original design for "OnCall Clinic" using only the design system provided, not mimicking any specific branded UI.

_[tool: copy_starter_component]_

Good. Now let me build the prototype. I'll use 390px iPhone width as specified.

_[tool: write_file]_

_[tool: write_file]_

Now the doctor avatar and map components (shared across screens):

_[tool: write_file]_

_[tool: write_file]_

_[tool: snip]_

Now the four screens:

_[tool: write_file]_

_[tool: write_file]_

_[tool: snip]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: snip]_

_[tool: write_file]_

_[tool: snip]_

_[tool: done]_

_[tool: snip]_

_[tool: fork_verifier_agent]_

Built a 4-screen interactive prototype (Dashboard → Tracking → Complete → Chat) in a 390px iPhone frame with ES/EN toggle and screen switcher in Tweaks. Live ETA ticks down every 4s, doctor pin moves along the route, typing indicator animates, confetti on the success screen.

Switch screens via the pill buttons below the phone or via the Tweaks panel (top-right toolbar toggle).

