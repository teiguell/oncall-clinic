# OnCall Clinic — Project Log

Registro de trabajo de todos los grupos. El Director de Proyecto lee este archivo para coordinar.

---

### 2026-04-14 — Grupo Estrategia — Documentación fundacional del proyecto
**Estado:** ✅ Completado
**Resumen:** Creación de todos los documentos estratégicos y prompts para Claude Code. Definición de visión, modelo de negocio, arquitectura técnica y roadmap de 14 STEPs.
**Entregables:**
- `MASTER_STRATEGY.md` — Estrategia maestra + 14 STEPs priorizados para Claude Code
- `FRONTEND_SEO_PROMPTS.md` — 6 prompts (10-15): landing Ibiza, SEO, design system, dashboards, tracking GPS
- `ADMIN_AI_PROMPTS.md` — 6 prompts (16-21): admin IA, verificación docs, reclamaciones, chat, finanzas
- `LEGAL_CODE_PROMPTS.md` — 8 prompts (1-8): páginas legales, GDPR, cookies, RC insurance, consent audit
- `OnCall Clinic — Plan de Proyecto.docx` — Plan ejecutivo 4 fases
- `Ibiza Care SL — Pack Legal OnCall Clinic.docx` — 7 documentos legales (T&C, privacidad, contrato médicos, DPA)
- `OnCall Clinic — Competitive Intelligence Brief.docx` — Análisis competitivo global + Ibiza
**Bloqueos/Dependencias:** Ninguno
**Próximos pasos:** Ejecutar STEPs en Claude Code en orden

---

### 2026-04-14 — Grupo Frontend — STEP 1: i18n ES+EN con next-intl
**Estado:** ✅ Completado
**Resumen:** Implementación completa de internacionalización con next-intl v3.22. Routing /[locale]/, archivos de traducción, middleware, LanguageSwitcher. useTranslations importado en las 13 páginas.
**Entregables:**
- `/i18n/routing.ts` — Config locales es/en, prefix always
- `/i18n/request.ts` — getRequestConfig con carga dinámica de mensajes
- `/messages/es.json` + `/messages/en.json` — Traducciones completas
- `/components/shared/language-switcher.tsx` — Selector ES/EN con banderas
- `/middleware.ts` — Integración next-intl + Supabase auth
- `/app/[locale]/` — Todas las rutas migradas bajo [locale]
**Bloqueos/Dependencias:** Verificar que TODOS los strings estén reemplazados (no solo importados)
**Próximos pasos:** Auditoría final de strings hardcodeados

---

### 2026-04-14 — Grupo Frontend — STEP 2: SEO técnico
**Estado:** ✅ Completado
**Resumen:** SEO completo implementado: metadata global Ibiza-focused, Schema.org JSON-LD, sitemap 17 URLs, robots.txt, páginas SEO de servicios.
**Entregables:**
- `/app/[locale]/layout.tsx` — Metadata global (OpenGraph, Twitter, keywords Ibiza)
- `/components/seo/json-ld.tsx` — MedicalOrganization + FAQPage Schema.org
- `/app/sitemap.ts` — 17 URLs ES+EN + servicios
- `/app/robots.ts` — Disallow admin/api/tracking
- `/app/[locale]/servicios/[servicio]/page.tsx` — Landing SEO por servicio con generateMetadata
**Bloqueos/Dependencias:** Ninguno
**Próximos pasos:** STEP 3 (Landing premium Ibiza) + STEP 4 (RC Insurance legal)

---

### 2026-04-14 — Grupo Legal — Pack legal completo redactado
**Estado:** ✅ Completado
**Resumen:** 7 documentos legales redactados para Ibiza Care SL como intermediaria marketplace. Normativa: Ley 44/2003, Ley 41/2002, RGPD (UE 2016/679), LOPDGDD, LSSI-CE (Ley 34/2002), RD 1277/2003.
**Entregables:**
- `Ibiza Care SL — Pack Legal OnCall Clinic.docx` (7 docs + checklist abogado)
- `LEGAL_CODE_PROMPTS.md` (8 prompts para implementar en código)
- Tarea programada `oncall-legal-review` (revisión semanal lunes 09:00)
**Bloqueos/Dependencias:** Datos de Ibiza Care SL pendientes: NIF, domicilio, datos Registro Mercantil (campos [COMPLETAR])
**Próximos pasos:** STEP 4 (RC Insurance onboarding) + STEP 5 (GDPR consent)

---

### 2026-04-14 — Grupo Inteligencia Competitiva — Análisis global completado
**Estado:** ✅ Completado
**Resumen:** Análisis de 15+ competidores globales, españoles y locales Ibiza. Hallazgo crítico: ibiza.care ya opera como marca en Ibiza (riesgo trademark). OnCall es el único con 4 dimensiones: visita física + app + pago digital + bilingüe.
**Entregables:**
- `OnCall Clinic — Competitive Intelligence Brief.docx` (487 párrafos, matriz features, roadmap)
**Bloqueos/Dependencias:** ⚠️ Verificar trademark ibiza.care vs Ibiza Care SL en OEPM
**Próximos pasos:** Actualización trimestral del brief (junio 2026 antes de temporada alta)

---

### 2026-04-14 — Grupo A (Product Builder) — 6 decisiones de producto que desbloquean Grupos B, C, D
**Estado:** ✅ Completado
**Resumen:** Resolución de las 6 decisiones bloqueantes de producto. Stack técnico confirmado, flujo de reserva definido (6 estados + webhooks Stripe), panel de privacidad RGPD especificado, onboarding médico en 5 pasos (COMIB + RC €300k + RETA + contrato + Stripe Connect), ratings confirmadas para MVP, y Crisp elegido como soporte.
**Entregables:**
- `GRUPO_A_DECISIONES.md` — 6 decisiones completas con diagramas de flujo, tablas de campos y SQL
**Desbloqueos:**
- ✅ Decisión 1 (Stack) → Desbloquea Grupo B (Frontend) + Grupo C (Backend)
- ✅ Decisión 2 (Booking flow) → Desbloquea Grupo C (Backend) + Grupo B (Frontend)
- ✅ Decisión 3 (Privacidad RGPD) → Desbloquea Grupo D (Legal) + Grupo B (Frontend)
- ✅ Decisión 4 (Onboarding médico) → Desbloquea Grupo C (Backend) + Grupo D (Legal)
- ✅ Decisión 5 (Ratings MVP) → Desbloquea Grupo B (Frontend)
- ✅ Decisión 6 (Crisp soporte) → Desbloquea Grupo B (Frontend)
**Bloqueos/Dependencias:** 4 preguntas pendientes para Director (timeline real, presupuesto APIs, datos Ibiza Care SL, prioridad Stripe vs chat)
**Próximos pasos:** Ejecutar STEP 3 (Landing Premium Ibiza) + STEP 4 (RC Insurance onboarding)
