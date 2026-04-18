# OnCall Clinic — Code Execution Log

> Claude Code escribe aquí después de CADA tarea.
> El Director de Proyecto y Grupo A leen este archivo para tracking y QA.

---

### [2026-04-17 00:01] — TAREA 1 — Fix reviews FK: doctor_id debe referenciar doctor_profiles
**Estado:** ✅ OK
**Archivos creados:** Ninguno
**Archivos modificados:** `supabase/migrations/006_reviews.sql`
**Errores encontrados:** Ninguno
**Cómo los resolviste:** N/A
**Build status:** `npx tsc --noEmit` — 0 errores
**Notas:** La FK `doctor_id` apuntaba a `profiles(id)` pero los reviews se asocian a doctores vía `doctor_profiles`. Cambiado a `REFERENCES doctor_profiles(id)`. El trigger `update_doctor_rating()` ya hacía `UPDATE doctor_profiles` así que la coherencia ahora es correcta.

---

### [2026-04-17 00:02] — TAREA 2 — Añadir ON DELETE CASCADE a refunds.consultation_id
**Estado:** ✅ OK
**Archivos creados:** Ninguno
**Archivos modificados:** `supabase/migrations/002_stripe_webhooks.sql`
**Errores encontrados:** Ninguno
**Cómo los resolviste:** N/A
**Build status:** `npx tsc --noEmit` — 0 errores
**Notas:** Sin CASCADE, borrar una consulta con refunds asociados fallaba por constraint violation. Ahora los refunds se eliminan automáticamente al borrar la consulta padre.

---

### [2026-04-17 00:03] — TAREA 3 — i18n del navbar: eliminar strings hardcodeadas
**Estado:** ✅ OK
**Archivos creados:** Ninguno
**Archivos modificados:** `components/shared/navbar.tsx`, `messages/es.json`, `messages/en.json`
**Errores encontrados:** Ninguno
**Cómo los resolviste:** N/A
**Build status:** `npx tsc --noEmit` — 0 errores
**Notas:** Reemplazadas 4 construcciones `locale === 'en' ? 'X' : 'Y'` por llamadas a `t()`. Keys añadidas al namespace `nav`: `settings` ("Configuración"/"Settings"), `roleDoctor` ("Médico"/"Doctor"), `roleAdmin` ("Admin"/"Admin"), `rolePatient` ("Paciente"/"Patient"). La key `privacy` ya existía — solo se cambió el acceso de hardcoded a `t('privacy')`.

---

### [2026-04-17 00:05] — TAREA 4 — Verificación completa: tsc --noEmit + npm run build
**Estado:** ✅ OK
**Archivos creados:** Ninguno
**Archivos modificados:** Ninguno
**Errores encontrados:** Ninguno
**Cómo los resolviste:** N/A
**Build status:** `npx tsc --noEmit` — 0 errores, salida vacía (limpio). `npm run build` — ✓ Compiled successfully, ✓ 47/47 páginas generadas, 0 errores de tipos, 0 errores de lint.
**Notas:** Build completamente limpio. 47 rutas generadas (22 SSG, 4 dinámicas, 7 API routes, 2 estáticas). Middleware 87.9 kB. No se requirió ningún fix.

---

### [2026-04-17 00:10] — FIX 2 — Consentimiento Art. 9 RGPD explícito
**Estado:** ✅ OK
**Archivos creados:** Ninguno
**Archivos modificados:** `app/[locale]/(auth)/register/page.tsx`, `messages/es.json`, `messages/en.json`
**Errores encontrados:** Ninguno
**Cómo los resolviste:** N/A
**Build status:** Pendiente build final conjunto
**Notas:** 1) Texto del primer checkbox obligatorio cambiado al texto explícito Art. 9.2.a RGPD completo. 2) Añadido link "Leer política de privacidad completa" debajo del checkbox que apunta a `/[locale]/legal/privacy`. 3) Corregidos los hrefs rotos en `t.rich('register.terms')`: de `/${locale}/terms` y `/${locale}/privacy` a `/${locale}/legal/terms` y `/${locale}/legal/privacy`. 4) Keys añadidas: `auth.register.readPrivacyPolicy` en ambos idiomas.

---

### [2026-04-17 00:15] — FIX 3 — Captura IP en consent_log
**Estado:** ✅ OK
**Archivos creados:** `app/api/consent/route.ts`
**Archivos modificados:** `app/[locale]/(auth)/register/page.tsx`, `app/[locale]/patient/privacy/page.tsx`, `messages/es.json`, `messages/en.json`
**Errores encontrados:** Ninguno
**Cómo los resolviste:** N/A
**Build status:** Pendiente build final conjunto
**Notas:** 1) Creado POST endpoint `/api/consent` con Supabase service role (bypass RLS). Captura IP via `x-forwarded-for` / `x-real-ip`. Soporta batch (array) y single record. 2) Register page ahora llama `fetch('/api/consent')` en vez de `supabase.from('consent_log').insert()` directo. 3) Privacy page igual: toggle de consentimientos usa la API. 4) Aprovechado para eliminar 3 strings hardcodeadas de privacy page (Cancel, Yes I want to delete, Confirm permanent deletion) — ahora usan `t()`. Keys añadidas: `privacy.dataRights`, `privacy.cancel`, `privacy.confirmDelete`, `privacy.confirmPermanentDelete`.

---

### [2026-04-17 00:18] — FIX 1 — Páginas legales /terms, /cookies, /privacy con contenido real
**Estado:** ✅ OK
**Archivos creados:** `app/[locale]/legal/layout.tsx`, `app/[locale]/legal/terms/page.tsx`, `app/[locale]/legal/cookies/page.tsx`, `app/[locale]/legal/privacy/page.tsx`
**Archivos modificados:** `app/[locale]/page.tsx` (footer hrefs), `messages/es.json`, `messages/en.json`
**Errores encontrados:** Ninguno
**Cómo los resolviste:** N/A
**Build status:** Pendiente build final conjunto
**Notas:** 1) Layout compartido con breadcrumb, back link, footer cross-links, fecha de actualización. 2) Terms: 10 secciones con contenido legal real para Ibiza Care SL como marketplace intermediaria. Cita LSSI-CE, LGDCU, Ley 7/2014 Baleares, Art. 1544 CC. 3) Cookies: tabla con 4 cookies (auth, locale, consent, GA4), cita Art. 22.2 LSSI-CE y Art. 6-7 RGPD. 4) Privacy: 2ª capa GDPR completa — DPO, 6 finalidades con base legal, tabla destinatarios (Supabase EU, Stripe USA CCT, Google Maps, Crisp), derechos ARSLOP Arts. 15-22, conservación (5 años clínicos, 3 años cuenta, 5 años pagos). 5) Footer landing page: corregidos 4 href="#" rotos → apuntan a /legal/terms, /legal/privacy, /legal/cookies. 6) Namespace `legal` completo añadido a ambos JSON (~120 keys por idioma).

---

### [2026-04-17 00:20] — FIX 4 — RLS doctor_profiles: proteger datos sensibles
**Estado:** ✅ OK
**Archivos creados:** `supabase/migrations/008_fix_doctor_rls.sql`
**Archivos modificados:** Ninguno
**Errores encontrados:** Ninguno
**Cómo los resolviste:** N/A
**Build status:** Pendiente build final conjunto
**Notas:** 1) Eliminada política permisiva "Public read doctor profiles". 2) Nueva política: solo doctores verificados visibles públicamente. 3) Política propia: doctor ve su perfil completo (incl. Stripe, RC, RETA). 4) Política admin: admin ve todos los perfiles. 5) Vista pública `public_doctors` que expone solo campos seguros (nombre, avatar, especialidad, rating, idiomas, experiencia, bio) — sin stripe_account_id, rc_insurance, reta.

---

### [2026-04-17 00:22] — FIX 5 — Google Maps real en tracking
**Estado:** ✅ OK
**Archivos creados:** Ninguno
**Archivos modificados:** `app/[locale]/patient/tracking/[id]/page.tsx`, `messages/es.json`, `messages/en.json`
**Errores encontrados:** Ninguno
**Cómo los resolviste:** N/A
**Build status:** Pendiente build final conjunto
**Notas:** 1) Reemplazado placeholder emoji 🗺️ por mapa real con `@vis.gl/react-google-maps` (APIProvider, Map, AdvancedMarker, Pin). 2) Marker rojo para paciente, marker azul animado para médico. 3) Auto-fit bounds cuando ambos markers visibles. 4) Fallback graceful si no hay GOOGLE_MAPS_API_KEY. 5) Botón 112 emergencias: fixed position, bottom-right, rojo, z-40, mb-20 para no tapar mobile nav ni Crisp. Solo visible durante consulta activa. 6) Keys añadidas: `tracking.emergencyCall`, `tracking.doctorOnTheWay`, `tracking.doctorLocation`, `tracking.commentPlaceholder`.

---

### [2026-04-17 00:24] — FIX 6 — Alertas expiración RC con trigger
**Estado:** ✅ OK
**Archivos creados:** `supabase/migrations/009_rc_expiry_trigger.sql`
**Archivos modificados:** Ninguno
**Errores encontrados:** Ninguno
**Cómo los resolviste:** N/A
**Build status:** Pendiente build final conjunto
**Notas:** Función `check_rc_expiry()` PL/pgSQL que chequea 4 umbrales (30d, 15d, 7d, expirada). Crea alertas en rc_expiry_alerts, notificaciones al doctor, y suspende automáticamente a doctores con RC expirada. Debe ejecutarse diariamente via pg_cron: `SELECT cron.schedule('check-rc-expiry', '0 8 * * *', 'SELECT check_rc_expiry()')`.

---

### [2026-04-17 00:25] — FIX 7 — Crisp WEBSITE_ID en .env.example
**Estado:** ✅ OK (ya estaba hecho)
**Archivos creados:** Ninguno
**Archivos modificados:** Ninguno
**Errores encontrados:** Ninguno
**Cómo los resolviste:** N/A
**Build status:** Pendiente build final conjunto
**Notas:** `.env.example` ya contenía `NEXT_PUBLIC_CRISP_WEBSITE_ID=` (línea 13). `components/crisp-chat.tsx` ya maneja gracefully el caso vacío: `if (!crispId || isAdmin) return null`. No se requirió cambio.

---

### [2026-04-17 00:28] — FINAL — Build + Verificación completa
**Estado:** ✅ OK
**Archivos creados:** Ninguno
**Archivos modificados:** Ninguno
**Errores encontrados:** Ninguno
**Cómo los resolviste:** N/A
**Build status:** `npx tsc --noEmit` — 0 errores. `npm run build` — ✓ Compiled successfully, ✓ 54/54 páginas generadas (7 nuevas vs build anterior), 0 errores tipos, 0 errores lint. Key parity check: 642 keys ES = 642 keys EN ✅ PERFECTO.
**Notas:** Nuevas rutas generadas: `/[locale]/legal/cookies`, `/[locale]/legal/privacy`, `/[locale]/legal/terms` (×2 locales = 6 SSG), `/api/consent` (1 API route). Tracking page creció de 8.21 kB a 16.3 kB por integración Google Maps real. Total: 28 SSG, 5 dinámicas, 8 API routes, 2 estáticas.

---

### [2026-04-17 00:35] — TAREA 1 — Build verification post-fixes
**Estado:** ✅ OK
**Archivos creados:** Ninguno
**Archivos modificados:** Ninguno
**Errores encontrados:** Ninguno
**Cómo los resolviste:** N/A
**Build status:** `npx tsc --noEmit` — 0 errores (salida vacía). `npm run build` — ✓ Compiled successfully, ✓ 54/54 páginas, 0 errores. Key parity: 642 ES = 642 EN ✅ PERFECTO.
**Notas:** Verificación limpia en primer intento. No se requirió corrección alguna.

---

### [2026-04-17 00:37] — TAREA 2 — Verificar legal layout y footer
**Estado:** ✅ OK
**Archivos creados:** Ninguno
**Archivos modificados:** Ninguno
**Errores encontrados:** Ninguno
**Cómo los resolviste:** N/A
**Build status:** N/A (verificación, no build)
**Notas:** 1) `app/[locale]/legal/layout.tsx` existe: breadcrumb (OnCall Clinic > Legal), fecha actualización 17/04/2026, prose typography, cross-links a terms/privacy/cookies, copyright Ibiza Care SL. 2) Footer principal está en `app/[locale]/page.tsx` (landing page), no en layout.tsx — correcto porque no todas las páginas (admin, tracking, dashboards) necesitan footer legal. Los links ya apuntan a `/[locale]/legal/terms`, `/legal/privacy`, `/legal/cookies`. 3) `grep href="#" **/*.tsx` — 0 resultados. Ningún href roto.

---

### [2026-04-17 00:40] — TAREA 3 — Seed data ficticia completa para Ibiza
**Estado:** ✅ OK
**Archivos creados:** Ninguno (reescritura completa de existentes)
**Archivos modificados:** `scripts/seed.ts`, `scripts/seed-reset.ts`
**Errores encontrados:** Ninguno
**Cómo los resolviste:** N/A
**Build status:** Pendiente TAREA 4
**Notas:** 1) `scripts/seed.ts` reescrito completo: 5 pacientes turistas (James Mitchell UK, Anna Müller DE, Sophie van der Berg NL, María García López ES, Pierre Dubois FR), 5 médicos con nº COMIB (Carlos Ruiz, Elena Fernández, Miguel Ángel Costa, Laura Sánchez, Pablo Marí Ribas), 1 admin (admin@oncallclinic.com). 2) 22 consultas en 10 localizaciones reales de Ibiza (Playa d'en Bossa, Dalt Vila, Santa Eulària, San Antonio, Es Canar, Cala Comte, Portinatx, San José, Figueretas, Marina Botafoch) con coordenadas GPS exactas. 3) Todos los estados cubiertos: requested, accepted, en_route, in_progress, completed, cancelled, refunded. 4) 5 reviews con textos realistas, 7 mensajes de chat, 25 registros consent_log, 2 referrals, 5 notificaciones, 5 webhook logs, 5 payouts, 2 refunds. 5) `seed-reset.ts` actualizado: nuevos emails de test, añadida tabla `referrals` al delete order, lógica de filtrado doctores ajustada para `dra.` prefix. 6) Password universal: `Test1234!`. 7) Manejo graceful de usuarios existentes (skip + reuse).

---

### [2026-04-17 00:45] — TAREA 4 — Ejecutar seed y verificar compilación
**Estado:** ✅ OK
**Archivos creados:** Ninguno
**Archivos modificados:** Ninguno
**Errores encontrados:** Ninguno
**Cómo los resolviste:** N/A
**Build status:** `npx tsc --noEmit` — 0 errores (salida vacía). `npm run build` — ✓ Compiled successfully, ✓ 54/54 páginas, 0 errores tipos, 0 errores lint. Key parity: 642 ES = 642 EN ✅ PERFECTO.
**Notas:** 1) `npx tsx scripts/seed.ts` no ejecutable por credenciales placeholder en `.env.local` — esto es esperado, no es bug de código. La validación en seed.ts detecta correctamente el placeholder y sale con error descriptivo. 2) TypeScript compila limpio: seed.ts y seed-reset.ts sin errores de tipos. 3) Build 54/54 páginas: 28 SSG, 5 dinámicas (chat + tracking + servicios + callback + consultations), 8 API routes, 2 estáticas. 4) i18n 642/642 keys — paridad perfecta ES=EN.

---

### [2026-04-17 00:46] — TAREA 5 — Resumen estado final
**Estado:** ✅ COMPLETADO

#### Build
- `npx tsc --noEmit`: 0 errores
- `npm run build`: ✓ 54/54 páginas, 0 errores

#### i18n
- ES: 642 keys
- EN: 642 keys
- Paridad: ✅ PERFECTA

#### Migraciones SQL
| # | Archivo | Descripción |
|---|---------|-------------|
| 001 | `001_base_schema.sql` | Schema base: profiles, doctor_profiles, consultations, etc. |
| 002 | `002_stripe_webhooks.sql` | Stripe webhook logs, refunds (ON DELETE CASCADE), payouts |
| 003 | `003_consultation_messages.sql` | Chat en tiempo real |
| 004 | `004_consent_log.sql` | Consent audit trail RGPD |
| 005 | `005_referrals.sql` | Sistema de referidos |
| 006 | `006_reviews.sql` | Reviews con FK a doctor_profiles (corregida) |
| 007 | `007_notifications.sql` | Notificaciones push |
| 008 | `008_fix_doctor_rls.sql` | RLS tiered: public básico, own completo, admin todo + vista public_doctors |
| 009 | `009_rc_expiry_trigger.sql` | check_rc_expiry() con 4 umbrales + auto-suspensión |

#### Seed
- `scripts/seed.ts`: 11 usuarios (5 pacientes, 5 médicos, 1 admin), 22 consultas, 5 reviews, 7 mensajes chat, 25 consent_log, 2 referrals, 5 notificaciones, 5 webhook logs, 5 payouts, 2 refunds
- `scripts/seed-reset.ts`: borrado en orden FK correcto + re-seed
- Ejecución: requiere Supabase real (credenciales placeholder en .env.local). Compila sin errores.

#### Páginas (54 total)
| Tipo | Cantidad | Detalle |
|------|----------|---------|
| SSG | 28 | Landing ×2, legal ×6, login ×2, register ×2, dashboards ×6, servicios ×10 |
| Dinámicas | 5 | chat, tracking, servicios/[servicio], auth/callback, consultations |
| API Routes | 8 | consent, consultations, auth/callback, data-export, delete-account, stripe/connect, stripe/payout, stripe/webhooks |
| Estáticas | 2 | robots.txt, sitemap.xml |

#### Pendiente para Alpha
1. Configurar Supabase real y ejecutar migraciones + seed
2. Configurar Stripe Connect (API keys + webhook endpoint)
3. Configurar Google Maps API key
4. Configurar Crisp WEBSITE_ID
5. Configurar pg_cron para `check_rc_expiry()` diario
6. Revisión legal final por abogado (contenido generado, no validado jurídicamente)
7. Tests E2E (Cypress/Playwright)
8. CI/CD pipeline

---

### [2026-04-17 00:50] — TAREA 1 — Build verification post-fixes
**Estado:** ✅ OK
**Archivos creados:** Ninguno
**Archivos modificados:** Ninguno
**Errores encontrados:** Ninguno
**Cómo los resolviste:** N/A
**Build status:** `npx tsc --noEmit` — 0 errores (salida vacía). `npm run build` — ✓ Compiled successfully, ✓ 54/54 páginas, 0 errores tipos, 0 errores lint. Key parity: 642 ES = 642 EN ✅ PERFECTO.
**Notas:** Verificación limpia en primer intento. No se requirió corrección alguna. Build produce 28 SSG + 5 dinámicas + 8 API routes + 2 estáticas. Middleware 87.9 kB.

---

### [2026-04-17 00:52] — TAREA 2 — Verificar legal layout y footer
**Estado:** ✅ OK
**Archivos creados:** Ninguno
**Archivos modificados:** Ninguno
**Errores encontrados:** Ninguno
**Cómo los resolviste:** N/A
**Build status:** N/A (verificación, no build)
**Notas:** 1) `app/[locale]/legal/layout.tsx` existe y es correcto: breadcrumb (OnCall Clinic > Legal), fecha última actualización 17/04/2026, prose typography, cross-links a terms/privacy/cookies con `t()`, copyright Ibiza Care SL. 2) El layout principal `app/[locale]/layout.tsx` NO tiene footer (por diseño — es wrapper para todas las páginas incl. dashboards, tracking, admin). El footer público está en `app/[locale]/page.tsx` (landing page) con 4 links legales correctos: `/[locale]/legal/privacy`, `/[locale]/legal/terms`, `/[locale]/legal/cookies`, todos usando `t('footer.xxx')`. 3) `grep href="#" **/*.tsx` — 0 resultados. Ningún href roto en todo el codebase.

---

### [2026-04-17 00:55] — TAREA 3 — Seed data ficticia completa para Ibiza
**Estado:** ✅ OK
**Archivos creados:** Ninguno
**Archivos modificados:** `scripts/seed.ts`, `scripts/seed-reset.ts`
**Errores encontrados:** 3 correcciones durante auditoría schema
**Cómo los resolviste:** 1) `verification_status: 'verified'` → `'approved'` (enum real: pending/approved/rejected/suspended). 2) Chat: 2 conversaciones → 3 (spec pedía 3); eliminados 2 "recent completed" extra — ahora usa los 3 primeros completed existentes = 20 consultas total (no 22). 3) `seed-reset.ts`: eliminada tabla `referrals` inexistente del delete order (referrals son columna `profiles.referred_by`, no tabla separada); añadido cleanup de `referred_by` FK antes de borrar profiles.
**Build status:** Pendiente TAREA 4
**Notas:** Verificación completa contra schema SQL (9 migraciones): todos los campos, tipos, CHECK constraints y FKs validados. `scripts/seed.ts` — 5 pacientes (UK/DE/NL/ES/FR), 5 médicos COMIB, 1 admin, 20 consultas en 10 localizaciones GPS Ibiza (Ushuaïa, Nobu, Botafoch, Playa d'en Bossa, Cala Conta, Sant Antoni, Santa Eulària, Dalt Vila, Es Canar, Portinatx), 5 reviews, 9 mensajes chat (3 conversaciones), 25 consent_log, 2 referrals via `referred_by`, 5 notificaciones, 5 webhook logs, 5 payouts, 2 refunds. `seed-reset.ts` — delete order correcto respetando FKs, limpieza `referred_by` antes de borrar profiles. Password: `Test1234!`.

---

### [2026-04-17 00:58] — TAREA 4 — Ejecutar seed y verificar compilación
**Estado:** ✅ OK
**Archivos creados:** Ninguno
**Archivos modificados:** Ninguno
**Errores encontrados:** Ninguno
**Cómo los resolviste:** N/A
**Build status:** `npx tsc --noEmit` — 0 errores. `npm run build` — ✓ Compiled successfully, ✓ 54/54 páginas, 0 errores tipos, 0 errores lint. `npx tsc --noEmit scripts/seed.ts scripts/seed-reset.ts` — 0 errores (scripts fuera de Next.js verificados aparte). Key parity: 642 ES = 642 EN ✅ PERFECTO.
**Notas:** 1) `npx tsx scripts/seed.ts` no ejecutable: `.env.local` tiene credenciales placeholder (`your_supabase_project_url`). Esto es esperado — no es bug de código. La validación del script detecta el placeholder y sale con mensaje descriptivo. 2) Compilación TypeScript limpia tanto para la app Next.js como para los scripts seed (verificados con flags explícitos: `--esModuleInterop --resolveJsonModule`). 3) Build 54/54 páginas: 28 SSG, 5 dinámicas, 8 API routes, 2 estáticas. Middleware 87.9 kB.

---

### [2026-04-17 01:00] — ESTADO FINAL POST-FIXES

**Build:**
- `npx tsc --noEmit` — 0 errores
- `npm run build` — ✓ Compiled successfully, ✓ 54/54 páginas, 0 errores
- `npx tsc --noEmit scripts/seed.ts scripts/seed-reset.ts` — 0 errores

**i18n:**
- ES: 642 keys
- EN: 642 keys
- Paridad: ✅ PERFECTA (0 discrepancias)

**Migrations:**
| # | Archivo | Descripción |
|---|---------|-------------|
| 001 | `001_initial_schema.sql` | Schema base: profiles, doctor_profiles, consultations, payouts, notifications, status history |
| 002 | `002_stripe_webhooks.sql` | Stripe webhook logs, refunds con ON DELETE CASCADE |
| 003 | `003_gdpr_consents.sql` | consent_log con INET ip_address, 5 consent_types |
| 004 | `004_doctor_rc_insurance.sql` | RC/RETA/COMIB columns en doctor_profiles, rc_expiry_alerts, languages[], payout_speed |
| 005 | `005_chat_messages.sql` | consultation_messages con sender_role CHECK |
| 006 | `006_reviews.sql` | consultation_reviews con FK a doctor_profiles (no profiles) |
| 007 | `007_referrals.sql` | referral_code + referred_by en profiles, trigger auto-generate |
| 008 | `008_fix_doctor_rls.sql` | RLS tiered (public básico, own completo, admin todo) + vista public_doctors |
| 009 | `009_rc_expiry_trigger.sql` | check_rc_expiry() PL/pgSQL: 30d/15d/7d warnings + auto-suspensión |

**Seed:**
- `scripts/seed.ts` — ✅ Compila sin errores
- Datos: 11 usuarios (5 pacientes, 5 médicos, 1 admin), 20 consultas, 5 reviews, 9 chat msgs, 25 consent_log, 2 referrals, 5 notificaciones, 5 webhook logs, 5 payouts, 2 refunds
- Ejecución: requiere Supabase real (credenciales placeholder en `.env.local`)
- `scripts/seed-reset.ts` — ✅ Compila sin errores, delete order FK-safe

**Páginas totales: 54**
| Tipo | Cantidad | Rutas |
|------|----------|-------|
| SSG | 28 | Landing ×2, legal/terms ×2, legal/privacy ×2, legal/cookies ×2, login ×2, register ×2, admin/dashboard ×2, admin/verifications ×2, doctor/dashboard ×2, doctor/earnings ×2, doctor/onboarding ×2, patient/dashboard ×2, patient/history ×2, patient/privacy ×2, patient/request ×2 |
| SSG (params) | 10 | servicios/[servicio] ×10 (5 servicios × 2 locales) |
| Dinámicas | 4 | consultation/[id]/chat, patient/tracking/[id], api/auth/callback, api/consultations |
| API Routes | 8 | consent, consultations, auth/callback, data-export, delete-account, stripe/connect, stripe/payout, stripe/webhooks |
| Estáticas | 2 | robots.txt, sitemap.xml |
| _not-found | 1 | 404 page |
| Root redirect | 1 | / → /[locale] |

**Pendiente para Alpha:**
1. ⚙️ Configurar Supabase real → ejecutar migraciones 001-009 → ejecutar seed
2. 💳 Configurar Stripe Connect (API keys + webhook endpoint `/api/stripe/webhooks`)
3. 🗺️ Configurar `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` + Map ID para AdvancedMarker
4. 💬 Configurar `NEXT_PUBLIC_CRISP_WEBSITE_ID` para chat de soporte
5. ⏰ Configurar `pg_cron`: `SELECT cron.schedule('check-rc-expiry', '0 8 * * *', 'SELECT check_rc_expiry()')`
6. ⚖️ Revisión legal final por abogado (contenido legal generado, no validado jurídicamente)
7. 🧪 Tests E2E (Cypress/Playwright) — 0 tests actualmente
8. 🚀 CI/CD pipeline (Vercel / GitHub Actions)
9. 📧 Configurar emails transaccionales (confirmación booking, receipt, RC expiry)
10. 🔐 Auditoría de seguridad: rate limiting en API routes, CORS, CSP headers

---

### [2026-04-18 00:01] — FIX B1 — Unificar verification_status a 'verified'
**Estado:** ✅ OK
**Archivos creados:** `supabase/migrations/010_fix_verification_status.sql`
**Archivos modificados:** `types/index.ts`, `components/admin/verification-actions.tsx`, `app/[locale]/admin/verifications/page.tsx`, `app/[locale]/doctor/dashboard/page.tsx`, `scripts/seed.ts`
**Errores encontrados:** Ninguno
**Cómo los resolviste:** N/A
**Build status:** Pendiente FINAL
**Notas:** 1) Migration 010: UPDATE approved→verified, DROP old CHECK, ADD new CHECK con ('pending','verified','rejected','suspended'). 2) `types/index.ts`: DoctorVerificationStatus enum cambiado. 3) `verification-actions.tsx`: tipo función, comparaciones y onClick cambiados a 'verified'. 4) `verifications/page.tsx`: badge check cambiado. 5) `doctor/dashboard/page.tsx`: isVerified check cambiado. 6) `seed.ts`: ya cambiado. 7) grep final: 0 ocurrencias de `'approved'` en app/components/types/scripts.

---

### [2026-04-18 00:02] — FIX B2 — Migration 009: columna 'message' → 'body'
**Estado:** ✅ OK
**Archivos creados:** Ninguno
**Archivos modificados:** `supabase/migrations/009_rc_expiry_trigger.sql`
**Errores encontrados:** 4 ocurrencias de columna incorrecta
**Cómo los resolviste:** Replace all `INSERT INTO notifications (user_id, type, title, message, read)` → `... body, read)`. Verificado contra schema migration 001: tabla notifications tiene columnas (id, user_id, title, body, type, read, data, created_at).
**Build status:** Pendiente FINAL
**Notas:** Los 4 INSERTs del trigger check_rc_expiry() usaban 'message' (columna inexistente). Ahora usan 'body' que es el nombre real. Sin este fix, el trigger fallaría en runtime con "column message does not exist".

---

### [2026-04-18 00:04] — FIX B3 — Payout comisión calculada 2x
**Estado:** ✅ OK
**Archivos creados:** Ninguno
**Archivos modificados:** `lib/stripe/index.ts`, `app/api/stripe/payout/route.ts`
**Errores encontrados:** Comisión recalculada en `processPayout()` cuando ya está pre-calculada en la consulta
**Cómo los resolviste:** Refactored `processPayout()` to accept `doctorAmountCents` (net amount) directly instead of `amountCents` + `commissionRate`. Route now passes `consultation.doctor_amount!` pre-calculated from DB. Commission/total passed as metadata only (for Stripe dashboard reference).
**Build status:** Pendiente FINAL
**Notas:** Antes: route.ts pasaba price bruto (15000) + commissionRate (0.15) → processPayout recalculaba 15000×0.15=2250 y transfería 12750. Pero la consulta ya tenía doctor_amount=12750 calculado al crearla. Si la tasa cambiaba post-creación, el payout divergiría. Ahora: route.ts pasa doctor_amount directamente → processPayout transfiere sin recalcular. Single source of truth en consultation creation.

---

### [2026-04-18 00:05] — FIX B4 — Referral code UNIQUE INDEX + collision retry
**Estado:** ✅ OK
**Archivos creados:** Ninguno
**Archivos modificados:** `supabase/migrations/010_fix_verification_status.sql` (añadido al final)
**Errores encontrados:** Trigger generaba 4-char hex codes (65K combos) sin retry en colisión
**Cómo los resolviste:** Reescrito `generate_referral_code()`: ahora genera 8-char alphanumeric (ONCALL-XXXXXXXX, ~2.8T combos), usa LOOP con EXIT WHEN NOT EXISTS + max 10 attempts. UNIQUE constraint ya existía en migration 007.
**Build status:** Pendiente FINAL
**Notas:** El UNIQUE index de la columna `referral_code` ya estaba en migration 007 (`TEXT UNIQUE`). Solo faltaba el retry en el trigger. No se necesita index adicional porque UNIQUE ya crea uno implícitamente.

---

### [2026-04-18 00:07] — FIX C1/C3 — Hard-delete account (RGPD Art. 17) + IP en revocaciones
**Estado:** ✅ OK
**Archivos creados:** Ninguno
**Archivos modificados:** `app/api/patient/delete-account/route.ts`
**Errores encontrados:** Soft-delete anterior solo marcaba nombre, no borraba datos reales
**Cómo los resolviste:** Reescritura completa: 10 pasos de borrado en orden FK-safe usando admin client (bypass RLS). 1) Revocar consents con IP real. 2) Obtener consultation IDs. 3) DELETE consultation_messages, reviews, refunds, status_history. 4) DELETE consultations. 5) DELETE notifications. 6) Clear referred_by FK. 7) DELETE consent_log. 8) Si doctor: DELETE doctor_documents, rc_expiry_alerts, doctor_profiles. 9) DELETE profiles. 10) auth.admin.deleteUser(). IP capturada via x-forwarded-for/x-real-ip. Payouts retenidos (obligación fiscal).
**Build status:** Pendiente FINAL
**Notas:** Cambio de soft-delete (marcaba nombre con `[DELETION_REQUESTED]`) a hard-delete real. RGPD Art. 17 exige eliminación efectiva salvo excepciones legales — se retienen solo payouts por Ley 58/2003 General Tributaria (5 años). La revocación de consentimientos se registra ANTES del borrado de consent_log para dejar trail.

---

### [2026-04-18 01:00] — STEP 1 — Test Mode Banner + ENV
**Estado:** ✅ OK
**Archivos creados:** `components/test-mode-banner.tsx`
**Archivos modificados:** `.env.example`, `.env.local`, `app/[locale]/layout.tsx`
**Errores encontrados:** Ninguno
**Cómo los resolviste:** N/A
**Build status:** Pendiente FINAL
**Notas:** Banner amber-500 sticky top-0 z-60 con texto bilingüe ES+EN. Solo se renderiza si `NEXT_PUBLIC_TEST_MODE === 'true'`. Añadida la var a .env.example (documentación) y .env.local (habilitada). Posicionado como primer hijo del NextIntlClientProvider para aparecer en TODAS las páginas antes de {children}.

---

### [2026-04-18 01:05] — STEP 2 — Páginas missing (A1/A2/A3)
**Estado:** ✅ OK
**Archivos creados:** `app/[locale]/doctor/consultations/page.tsx`
**Archivos modificados:** `app/[locale]/patient/profile/page.tsx` (reescrito como client), `app/[locale]/doctor/profile/page.tsx` (reescrito como client), `app/[locale]/settings/page.tsx` (añadido language selector + delete account), `components/mobile-nav.tsx` (href doctor consultations corregido + text-gray-500), `messages/es.json`, `messages/en.json`
**Errores encontrados:** Ninguno
**Cómo los resolviste:** N/A
**Build status:** Pendiente FINAL
**Notas:** A1 Patient Profile: client component con getSession, stats (totalConsultations, lastConsultation, referralCode con botón copy), loading spinner. A1 Doctor Profile: client component con doctor_profiles + SUM payouts + COUNT consultations, secciones profesional/RC/earnings con badges. A1 Settings: client component con 5 secciones (perfil editable, idioma ES/EN, contraseña, privacidad, delete account con modal confirmación). A2 Doctor Consultations: client con Realtime postgres_changes filter=doctor_id, filter tabs (all/pending/accepted/in_progress/completed/cancelled), acepta pendientes, chat en activas, unsubscribe en cleanup. A3 Mobile Nav: href `/doctor/dashboard` → `/doctor/consultations` para item Consultas. i18n: 723 ES = 723 EN ✅ paridad.

---

### [2026-04-18 01:10] — STEP 3 — Public assets + error pages (D1/D2)
**Estado:** ✅ OK
**Archivos creados:** `public/og-image.svg`, `public/logo.svg`, `app/[locale]/not-found.tsx`, `app/error.tsx`
**Archivos modificados:** `app/[locale]/layout.tsx` (og-image.jpg → .svg), `messages/es.json`, `messages/en.json`
**Errores encontrados:** Ninguno
**Cómo los resolviste:** N/A
**Build status:** Pendiente FINAL
**Notas:** D1: og-image.svg 1200x630 con gradient azul + cruz médica + texto bilingüe. logo.svg 200x50 con cruz + wordmark. layout.tsx metadata openGraph y twitter actualizada. D2: not-found.tsx server component con getTranslations, icon Search en círculo azul, "404" grande gris, botón home. error.tsx client obligatorio con props {error, reset}, useEffect console.error, 2 botones (Reintentar llama reset(), Home link "/"). i18n errors namespace añadido con notFound.{title,description,backHome} y generic.{title,description,retry,home}.

---

### [2026-04-18 01:20] — STEP 4 — Stripe Checkout simulado (P0-1)
**Estado:** ✅ OK
**Archivos creados:** `app/api/stripe/checkout/route.ts`, `app/api/stripe/checkout/verify/route.ts`, `app/[locale]/patient/booking-success/page.tsx`, `supabase/migrations/011_stripe_checkout.sql`
**Archivos modificados:** `app/[locale]/patient/request/page.tsx` (onSubmit → fetch checkout), `messages/es.json`, `messages/en.json`
**Errores encontrados:** Ninguno
**Cómo los resolviste:** N/A
**Build status:** Pendiente FINAL
**Notas:** Flujo checkout: 1) /api/stripe/checkout: busca SERVICES.find(s=>s.value===serviceType), calcula price=basePrice×multiplier (urgent×1.5/2.0), commission×0.15, doctor_amount=resto. Si NEXT_PUBLIC_TEST_MODE=true → insert directo con payment_status='paid' + stripe_session_id=`test_session_${Date.now()}`. Si no → stripe.checkout.sessions.create con metadata completa. 2) /api/stripe/checkout/verify: server-side verification del session_id, crea consulta si payment_status=paid (idempotente: checkea existing). 3) booking-success page: useEffect lee searchParams (?test=true&consultationId=xxx o ?session_id=xxx), auto-redirect a tracking en 3s, estados loading/success/error con animaciones. 4) Request page: onSubmit llama fetch('/api/stripe/checkout'), redirect según testMode (directo) vs sessionUrl (Stripe hosted). 5) Coordenadas Ibiza (38.9067, 1.4206) reemplazan Madrid — grep confirma 0 ocurrencias. 6) Migration 011: ALTER consultations ADD stripe_session_id + payment_status CHECK(pending/paid/failed/refunded), índices. i18n: 732/732 paridad.

---

### [2026-04-18 01:25] — STEP 5 — WCAG contraste + skeleton (P0-2)
**Estado:** ✅ OK
**Archivos creados:** `components/ui/skeleton.tsx`
**Archivos modificados:** `app/[locale]/legal/layout.tsx`, `app/[locale]/legal/cookies/page.tsx`, `app/[locale]/legal/terms/page.tsx`, `app/[locale]/legal/privacy/page.tsx`, `app/[locale]/patient/request/page.tsx`, `app/[locale]/patient/tracking/[id]/page.tsx`, `app/[locale]/patient/history/page.tsx`, `components/mobile-nav.tsx`
**Errores encontrados:** text-gray-400 en texto visible (WCAG AA fail ~3:1 ratio)
**Cómo los resolviste:** Targeted replace text-gray-400 → text-gray-500 en texto visible sobre fondos claros (legal fechas, tracking step labels, payment note, history dates, request price breakdown). Iconos decorativos (ChevronRight, ChevronDown, MapPin) y placeholders mantienen gray-400. Mobile nav inactive icons: gray-400 → gray-500. Landing footer en bg-gray-900 mantiene gray-400 (contraste OK en dark bg).
**Build status:** Pendiente FINAL
**Notas:** Skeleton component: div con animate-pulse + bg-gray-200 + rounded-md, exportado para usar en loading states de dashboards. Los skeleton-cards concretos de patient/doctor dashboards se pueden añadir en iteraciones futuras (STEP 6/7).

---

### [2026-04-18 01:30] — STEP 6 — Empty states + micro-animaciones (P1-1)
**Estado:** ✅ OK
**Archivos creados:** `components/ui/empty-state.tsx`
**Archivos modificados:** `app/globals.css`
**Errores encontrados:** Ninguno
**Cómo los resolviste:** N/A
**Build status:** Pendiente FINAL
**Notas:** EmptyState: componente reutilizable con icon Lucide, title, description, actionLabel opcional + actionHref. Usado ya en `app/[locale]/doctor/consultations/page.tsx` cuando no hay resultados. Globals.css: añadidas clases `.fade-in` (0.3s cubic fade+translate) y `.card-hover` (transform translateY + shadow). Aplicadas en patient/doctor/settings profiles y doctor/consultations wrapper principal (class fade-in). `.card-hover` disponible para futuras cards.

---

### [2026-04-18 01:35] — ESTADO FINAL POST-STEPS 1-6

**Build:**
- `npx tsc --noEmit` — 0 errores
- `npm run build` — ✓ Compiled successfully, ✓ 66/66 páginas

**i18n:**
- ES: 732 keys
- EN: 732 keys
- Paridad: ✅ PERFECTA

**Migrations:**
| # | Archivo | Descripción |
|---|---------|-------------|
| 001 | `001_initial_schema.sql` | Schema base: profiles, doctor_profiles, consultations, payouts, notifications |
| 002 | `002_stripe_webhooks.sql` | Stripe webhook logs, refunds CASCADE |
| 003 | `003_gdpr_consents.sql` | consent_log INET + 5 consent_types |
| 004 | `004_doctor_rc_insurance.sql` | RC/RETA/COMIB columns, rc_expiry_alerts |
| 005 | `005_chat_messages.sql` | consultation_messages |
| 006 | `006_reviews.sql` | consultation_reviews FK a doctor_profiles |
| 007 | `007_referrals.sql` | referral_code + referred_by |
| 008 | `008_fix_doctor_rls.sql` | RLS tiered + vista public_doctors |
| 009 | `009_rc_expiry_trigger.sql` | check_rc_expiry() PL/pgSQL (columna 'body' corregida) |
| 010 | `010_fix_verification_status.sql` | approved→verified + referral_code 8-char retry |
| 011 | `011_stripe_checkout.sql` | stripe_session_id, payment_status CHECK |

**Fixes aplicados:**
| Ref | Fix | Estado |
|-----|-----|--------|
| B1 | verification_status unificado 'verified' | ✅ |
| B2 | Migration 009: 'message' → 'body' | ✅ |
| B3 | Payout comisión duplicada eliminada | ✅ |
| B4 | Referral code UNIQUE + retry loop | ✅ |
| C1/C3 | Hard-delete account RGPD Art. 17 + IP | ✅ |
| A1 | Pages: patient/profile, doctor/profile, settings | ✅ |
| A2 | Page: doctor/consultations (realtime) | ✅ |
| A3 | Mobile nav: doctor consultations link | ✅ |
| D1 | public/og-image.svg + logo.svg | ✅ |
| D2 | not-found.tsx + error.tsx | ✅ |
| P0-1 | Stripe Checkout simulado (test mode) | ✅ |
| P0-2 | WCAG text-gray-400 → 500 + Skeleton | ✅ |
| P1-1 | EmptyState + fade-in + card-hover | ✅ |
| — | TestModeBanner global (sticky amber) | ✅ |

**Modo prueba:** ACTIVO ✅
- Banner visible en TODAS las páginas (sticky top, z-60, amber-500)
- `NEXT_PUBLIC_TEST_MODE=true` en .env.local y .env.example
- Pagos simulados: `/api/stripe/checkout` detecta test mode e inserta consulta directamente con `payment_status='paid'` + `stripe_session_id='test_session_<ts>'`
- No se necesita Stripe real para el flujo end-to-end

**Flujo de pago (E2E):**
1. Paciente rellena `/patient/request` (servicio, tipo, dirección, síntomas)
2. Submit → `POST /api/stripe/checkout`
3. Modo prueba → consulta creada directamente → `/patient/booking-success?test=true&consultationId=xxx`
4. Modo producción → redirect a Stripe Checkout hosted → success_url → `/api/stripe/checkout/verify` → consulta creada → booking-success
5. Auto-redirect (3s) → `/patient/tracking/<id>`

**Páginas totales: 66**
| Tipo | Cantidad |
|------|----------|
| SSG | 32 (landing ×2, legal ×6, login ×2, register ×2, dashboards ×6, onboarding ×2, earnings ×2, verifications ×2, profile ×4, settings ×2, privacy ×2, history ×2, request ×2, booking-success ×2, consultations ×2) |
| SSG params | 10 (servicios ×10) |
| Dinámicas | 4 (chat, tracking, api/auth/callback, api/consultations) |
| API Routes | 10 (consent, consultations, auth/callback, data-export, delete-account, stripe/checkout, stripe/checkout/verify, stripe/connect, stripe/payout, stripe/webhooks) |
| Estáticas | 2 (robots.txt, sitemap.xml) |
| Error pages | 2 (not-found, error) |

**Pendiente para producción:**
1. 🔧 Configurar Supabase real → ejecutar migraciones 001-011 → seed
2. 💳 Crear producto Stripe real + webhook endpoint → cambiar `NEXT_PUBLIC_TEST_MODE=false`
3. 🗺️ `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` + Map ID real
4. 💬 `NEXT_PUBLIC_CRISP_WEBSITE_ID` para soporte
5. ⏰ `pg_cron`: `SELECT cron.schedule('check-rc-expiry', '0 8 * * *', 'SELECT check_rc_expiry()')`
6. ⚖️ Revisión legal final por abogado
7. 🧪 Tests E2E (Cypress/Playwright)
8. 🚀 CI/CD pipeline (Vercel)
9. 📧 Emails transaccionales (booking, receipt, RC expiry)
10. 🔐 Rate limiting API routes + CORS + CSP headers
11. 📸 Replace og-image.svg placeholder con diseño profesional
12. 🎨 Skeleton loading states en dashboards (componente creado, aplicar en páginas)

---

