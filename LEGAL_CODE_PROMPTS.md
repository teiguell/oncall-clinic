# OnCall Clinic — Prompts de Implementación Legal
> Ibiza Care SL · Versión 1.0 · Marzo 2026
> Pegar cada prompt directamente en Claude Code para implementar el compliance legal en la app.

---

## CONTEXTO LEGAL (incluir en todos los prompts)

```
CONTEXTO LEGAL DE IBIZA CARE SL:
- Ibiza Care SL es una plataforma tecnológica de INTERMEDIACIÓN, NO un centro sanitario
- NO presta servicios médicos. Los médicos son autónomos independientes con responsabilidad clínica propia
- Base legal: Ley 34/2002 (LSSI), RGPD (UE 2016/679), LOPDGDD, Ley 44/2003, Ley 41/2002
- Los datos de salud son categoría especial — requieren consentimiento explícito previo
- El médico asume toda responsabilidad clínica mediante cláusula de indemnidad (Contrato Afiliación)
```

---

## PROMPT 1 — Páginas legales (Aviso Legal, Privacidad, Cookies, T&C)

```
Crea las siguientes páginas legales estáticas en Next.js para OnCall Clinic (Ibiza Care SL):

CONTEXTO LEGAL: Ibiza Care SL es plataforma de intermediación tecnológica, NO centro sanitario.
Los médicos son autónomos independientes. Datos de salud = categoría especial RGPD.

Archivos a crear:
1. app/legal/aviso-legal/page.tsx
2. app/legal/privacidad/page.tsx
3. app/legal/cookies/page.tsx
4. app/legal/terminos-pacientes/page.tsx
5. app/legal/terminos-medicos/page.tsx

Requisitos de implementación:
- Cada página es un Server Component estático (no necesita "use client")
- Layout limpio con tabla de contenidos con anclas (<a href="#seccion">)
- Última actualización visible en el header de cada página
- Añadir link a todas desde el footer del layout principal (app/layout.tsx)
- El footer debe incluir: Aviso Legal · Privacidad · Cookies · T&C Pacientes · T&C Médicos
- Estilo consistente con el resto de la app (Tailwind, misma tipografía)
- Componente compartido <LegalLayout> con: título, fecha actualización, tabla contenidos, breadcrumb

Contenido clave a incluir en cada página:
- aviso-legal: identificación Ibiza Care SL, naturaleza de intermediación (NO presta servicios médicos),
  propiedad intelectual, jurisdicción Ibiza
- privacidad: responsable tratamiento, datos de salud (categoría especial, consentimiento explícito art.9 RGPD),
  subprocesadores (Supabase, Stripe, Google Maps, Vercel), derechos RGPD (email: legal@oncallclinic.es),
  conservación datos (HC: 5 años, datos cuenta: 3 años post-baja, pago: 5 años)
- cookies: tabla cookies necesarias vs analíticas, gestión preferencias
- terminos-pacientes: plataforma es intermediaria (texto explícito), limitación responsabilidad clínica,
  política cancelación (antes aceptación: 100%, tras aceptación >30min: 80%, <30min: 0%),
  llamar al 112 en emergencias vitales
- terminos-medicos: requiere colegiado COMIB, seguro RC vigente (mínimo 300k€/siniestro), autónomo RETA,
  comisión 15%, indemnidad clínica

Idiomas: crear versión ES y EN para cada página (/legal/en/privacy-policy, etc.)
```

---

## PROMPT 2 — Banner de cookies (RGPD compliant)

```
Crea un banner de cookies RGPD-compliant para OnCall Clinic.

CONTEXTO LEGAL: Obligatorio por RGPD y LSSI. Las cookies de sesión de Supabase y Stripe son
"necesarias" y no requieren consentimiento. Las de analítica (Google Analytics, PostHog) sí requieren
consentimiento previo. Implementar "opt-in", NO "opt-out".

Archivos a crear:
- components/shared/cookie-banner.tsx (componente cliente)
- lib/cookies-consent.ts (utilidades para leer/escribir preferencias)
- app/legal/cookies/page.tsx (ya descrito en Prompt 1)

Comportamiento:
- Mostrar en primera visita si no hay preferencias guardadas
- Tres botones: "Aceptar todo", "Solo necesarias", "Gestionar preferencias"
- "Gestionar preferencias": modal con toggles para cada categoría (Necesarias [siempre ON], Analítica, Marketing)
- Guardar preferencia en localStorage con clave "oncall_cookie_consent" y estructura:
  { version: "1.0", timestamp: ISO_STRING, necessary: true, analytics: boolean, marketing: boolean }
- El banner NO debe bloquear la UI — se muestra como barra inferior fija
- Link a /legal/cookies desde el banner
- Añadir al layout principal (app/layout.tsx) solo en producción:
  if (process.env.NODE_ENV === 'production') mostrar banner
- Si analytics = false, NO cargar scripts de Google Analytics ni PostHog
- Función: window.updateCookieConsent(prefs) para que la página de cookies actualice preferencias

Diseño: estilo consistente con la app, fondo blanco con borde superior, texto pequeño (text-sm),
máximo 2 líneas de texto principal.
```

---

## PROMPT 3 — Aceptación de T&C en registro de paciente

```
Modifica el flujo de registro de pacientes (app/(auth)/register/page.tsx) para añadir aceptación
explícita de términos legales.

CONTEXTO LEGAL CRÍTICO: El RGPD requiere consentimiento EXPLÍCITO y SEPARADO para datos de salud
(categoría especial, art. 9). NO se puede usar un único checkbox para todo. Cada checkbox debe ser
independiente y granular.

Cambios en app/(auth)/register/page.tsx:
Añadir ANTES del botón de submit los siguientes checkboxes independientes (todos obligatorios excepto marketing):

1. [OBLIGATORIO] checkbox "terminos":
   "He leído y acepto los Términos y Condiciones y el Aviso Legal"
   Link: /legal/terminos-pacientes y /legal/aviso-legal

2. [OBLIGATORIO] checkbox "privacidad":
   "He leído y acepto la Política de Privacidad"
   Link: /legal/privacidad

3. [OBLIGATORIO] checkbox "datos_salud":
   "CONSIENTO expresamente el tratamiento de mis datos de salud (categoría especial según RGPD art. 9)
   por parte de Ibiza Care SL con la finalidad de intermediación en servicios sanitarios.
   Puedo revocar este consentimiento en cualquier momento."
   ⚠️ Este checkbox debe ir en color destacado (fondo amarillo claro) y con texto en negrita

4. [OBLIGATORIO] checkbox "intermediacion":
   "Entiendo que Ibiza Care SL es una plataforma tecnológica de intermediación y NO presta servicios
   médicos. La responsabilidad clínica corresponde íntegramente al médico independiente."

5. [OPCIONAL] checkbox "marketing":
   "Acepto recibir comunicaciones comerciales y novedades del servicio"

Lógica de validación con Zod:
- terminos, privacidad, datos_salud, intermediacion: z.literal(true) (obligatorios)
- marketing: z.boolean().optional()

Guardar en Supabase al crear perfil:
En la tabla profiles añadir columna JSONB "consent_log" con:
{
  "terms_accepted_at": ISO_STRING,
  "privacy_accepted_at": ISO_STRING,
  "health_data_consent_at": ISO_STRING,
  "intermediation_understood_at": ISO_STRING,
  "marketing_consent": boolean,
  "ip_address": string,
  "user_agent": string,
  "terms_version": "1.0"
}

Añadir la columna consent_log al schema SQL:
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS consent_log JSONB DEFAULT '{}';

Obtener IP del cliente en la API route de registro para guardarla en el log.
```

---

## PROMPT 4 — Consentimiento informado antes de cada consulta

```
Modifica el paso final del flujo de solicitud de consulta (app/patient/request/page.tsx, Step 3
"Confirmar") para añadir consentimiento informado digital.

CONTEXTO LEGAL: Ley 41/2002 (Autonomía del Paciente) obliga al consentimiento informado previo
a cualquier acto médico. Aunque la responsabilidad es del médico, la plataforma debe facilitar
este proceso y registrar el consentimiento.

En el Step de Confirmación (último paso antes del botón "Solicitar Consulta"):

1. Añadir sección "Consentimiento previo a la consulta" con fondo azul claro y borde

2. Mostrar resumen del servicio solicitado:
   - Tipo de servicio, precio, tipo (urgente/programada)
   - Texto explicativo: "Al confirmar, un médico colegiado e independiente acudirá a tu domicilio.
     Ibiza Care SL es únicamente la plataforma que facilita el contacto."

3. Tres checkboxes OBLIGATORIOS (sin estos no se puede confirmar):
   a) "Consiento que el médico acceda a la información de síntomas que he proporcionado"
   b) "Entiendo que en caso de EMERGENCIA VITAL debo llamar al 112, no usar esta plataforma"
   c) "Acepto las condiciones específicas de este servicio y la política de cancelación"

4. En onSubmit, guardar en la tabla consultations el campo consent_given: true y
   añadir columna: ALTER TABLE consultations ADD COLUMN IF NOT EXISTS consent_given BOOLEAN DEFAULT FALSE;
   También guardar consent_timestamp: NOW() en la fila de consulta.

5. Si el paciente NO marca todos los checkboxes, el botón "Solicitar Consulta" aparece desactivado
   con tooltip: "Debes aceptar las condiciones para continuar"

6. En mobile: los checkboxes deben ser suficientemente grandes (touch target mínimo 44px)
```

---

## PROMPT 5 — Onboarding médico: seguro RC + aceptación contrato

```
Modifica el onboarding de médicos (app/doctor/onboarding/page.tsx) para añadir verificación de
seguro RC y aceptación del contrato de afiliación.

CONTEXTO LEGAL CRÍTICO: El seguro de RC Profesional es OBLIGATORIO para activar al médico.
Sin él, la plataforma tiene responsabilidad por selección negligente.
El contrato de afiliación (con cláusula de indemnidad) debe aceptarse antes de cualquier consulta.

CAMBIOS EN EL SCHEMA SQL (ejecutar en Supabase):
ALTER TABLE doctor_profiles
  ADD COLUMN IF NOT EXISTS rc_insurance_url TEXT,
  ADD COLUMN IF NOT EXISTS rc_insurance_expiry DATE,
  ADD COLUMN IF NOT EXISTS rc_insurance_company TEXT,
  ADD COLUMN IF NOT EXISTS rc_coverage_amount INTEGER, -- en euros
  ADD COLUMN IF NOT EXISTS contract_accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS contract_version TEXT DEFAULT '1.0',
  ADD COLUMN IF NOT EXISTS contract_ip TEXT;

CAMBIOS EN EL FORMULARIO (añadir pasos al onboarding actual):

Paso nuevo: "Seguro de Responsabilidad Civil"
- Campo: Compañía aseguradora (texto libre, obligatorio)
- Campo: Número de póliza (texto, obligatorio)
- Campo: Cobertura por siniestro en euros (number, mínimo 300.000, obligatorio)
- Campo: Fecha de vencimiento (date picker, debe ser futura, obligatorio)
- Upload: Documento del seguro RC en vigor (PDF/imagen, obligatorio)
  - Subir a Supabase Storage bucket "doctor-documents" con path: {user_id}/rc-insurance/{timestamp}
  - Guardar URL en rc_insurance_url
- Texto informativo: "La cobertura mínima requerida es de 300.000€ por siniestro.
  Tu póliza será verificada por el equipo de OnCall Clinic antes de activar tu perfil."
- Validación: si coverage_amount < 300000, mostrar error "La cobertura mínima es de 300.000€"

Paso nuevo: "Contrato de Afiliación" (ÚLTIMO paso, antes de submit)
- Mostrar resumen del contrato en un box scrollable (max-height: 300px, overflow-y: scroll):
  Incluir: naturaleza mercantil (NO laboral), asunción responsabilidad clínica,
  cláusula de indemnidad (texto destacado en rojo), comisión 15%, requisito RC vigente
- Link: "Ver contrato completo" → /legal/terminos-medicos
- Checkbox OBLIGATORIO: "He leído y ACEPTO íntegramente el Contrato de Afiliación con Ibiza Care SL,
  incluyendo la cláusula de asunción de responsabilidad clínica e indemnidad (cláusula 3.4)"
  ⚠️ Estilo: borde rojo, fondo rojo muy claro, texto en negrita

- Al aceptar, guardar en doctor_profiles:
  contract_accepted_at: NOW(), contract_version: "1.0", contract_ip: [IP del cliente]

- Obtener IP en la API route y guardarla como evidencia de la aceptación electrónica

El botón "Enviar solicitud" solo se activa cuando TODOS los campos de RC y el checkbox del contrato
están completados.
```

---

## PROMPT 6 — Panel admin: verificación RC médicos + alertas caducidad

```
Añadir en el panel de administración (app/admin/verifications/page.tsx) las siguientes funcionalidades:

CONTEXTO LEGAL: El admin debe verificar manualmente el seguro RC de cada médico antes de aprobarlos.
Los seguros caducados deben suspender automáticamente al médico.

FUNCIÓN 1 — Verificación manual de RC en el panel de admin:
En la tarjeta de cada médico pendiente mostrar:
- Datos del seguro RC: compañía, número póliza, cobertura, fecha vencimiento
- Botón "Ver documento RC" → abre la URL del documento en nueva pestaña
- Badge de cobertura: VERDE si >= 300.000€, ROJO si < 300.000€
- Badge de vencimiento: VERDE si >3 meses, AMARILLO si 1-3 meses, ROJO si <1 mes o vencido
- Checkbox "RC Verificado manualmente" que el admin debe marcar antes de poder aprobar al médico
- Si RC no verificado, el botón "Aprobar" aparece desactivado con tooltip explicativo

Añadir columna al schema:
ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS rc_verified_by_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS rc_verified_at TIMESTAMPTZ;

FUNCIÓN 2 — Cron job de alertas de RC próximo a vencer:
Crear archivo: app/api/cron/check-rc-expiry/route.ts
- Ejecutar diariamente (configurar en vercel.json como cron job)
- Consultar médicos con rc_insurance_expiry entre HOY y HOY+30 días
- Para cada uno: crear notificación en tabla notifications con tipo "rc_expiry_warning"
  y mensaje "Tu seguro RC vence el [fecha]. Actualízalo para seguir activo en la plataforma."
- Consultar médicos con rc_insurance_expiry < HOY y is_available = TRUE
- Para cada uno: UPDATE doctor_profiles SET is_available = FALSE, verification_status = 'suspended'
  y crear notificación de suspensión automática
- Proteger el endpoint con header: Authorization: Bearer {CRON_SECRET}

Añadir en vercel.json:
{
  "crons": [{"path": "/api/cron/check-rc-expiry", "schedule": "0 8 * * *"}]
}
```

---

## PROMPT 7 — Páginas legales en inglés para turistas

```
Crea versiones en inglés de las páginas legales más críticas para los turistas de Ibiza.

CONTEXTO: ~70% de los usuarios de temporada alta serán turistas internacionales (UK, Alemania, Francia).
Los T&C deben ser comprensibles en inglés. No es necesaria una traducción perfecta jurídica —
sino clara y comprensible para el usuario.

Archivos a crear (espejo EN de las páginas ES):
- app/legal/en/terms-patients/page.tsx
- app/legal/en/privacy-policy/page.tsx
- app/legal/en/cookie-policy/page.tsx

Detección de idioma:
- Usar el header Accept-Language en el layout para detectar idioma del navegador
- Si el idioma principal NO es español, mostrar banner:
  "These Terms are available in English" con link a /legal/en/terms-patients
- Guardar preferencia de idioma en localStorage: "oncall_lang_pref"

Contenido clave EN inglés (adaptar del documento legal ES):
- IMPORTANTE: incluir explícitamente en inglés:
  "Ibiza Care SL is a technology intermediary platform, NOT a healthcare provider.
   Medical services are provided by independent, registered physicians under their
   sole clinical responsibility."
  "In case of a life-threatening emergency, call 112 immediately. Do NOT use this platform."
  "Ibiza Care SL's liability is limited to the amount paid for the consultation."

Añadir selector de idioma ES/EN en el footer de las páginas legales.
```

---

## PROMPT 8 — Registro de auditoría de consentimientos

```
Crea un sistema de auditoría de consentimientos para cumplimiento RGPD.

CONTEXTO LEGAL: El RGPD requiere que la empresa pueda DEMOSTRAR que el usuario consintió
(accountability, art. 5.2). Hay que guardar evidencia del consentimiento con timestamp,
versión del documento e identificación del usuario.

SCHEMA SQL — nueva tabla de auditoría:
CREATE TABLE IF NOT EXISTS consent_audit_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  user_email TEXT, -- guardar email por si se borra el perfil
  consent_type TEXT NOT NULL CHECK (consent_type IN (
    'terms_patient', 'terms_doctor', 'privacy_policy', 'health_data',
    'intermediation_notice', 'consultation_consent', 'marketing',
    'rc_contract', 'cookie_analytics', 'cookie_marketing'
  )),
  consent_given BOOLEAN NOT NULL,
  document_version TEXT NOT NULL DEFAULT '1.0',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: solo service_role puede insertar/leer (no el usuario)
ALTER TABLE consent_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_service_only" ON consent_audit_log
  USING (false) WITH CHECK (false); -- solo service role

-- Índices
CREATE INDEX idx_consent_audit_user ON consent_audit_log(user_id);
CREATE INDEX idx_consent_audit_type ON consent_audit_log(consent_type);
CREATE INDEX idx_consent_audit_created ON consent_audit_log(created_at DESC);

FUNCIÓN HELPER en lib/consent-logger.ts:
- logConsent(userId, email, consentType, given, version, request): Promise<void>
- Usar supabase SERVICE_ROLE_KEY (no el anon key del cliente)
- Esta función se llama desde las API routes de registro, onboarding médico y solicitud consulta

INTEGRAR logConsent en:
1. API de registro de paciente → logear: terms_patient, privacy_policy, health_data, intermediation_notice
2. API de onboarding médico → logear: terms_doctor, rc_contract
3. API de solicitud consulta (onSubmit) → logear: consultation_consent
4. Banner cookies (lib/cookies-consent.ts) → logear: cookie_analytics, cookie_marketing

PANEL ADMIN — nueva sección "Auditoría RGPD":
Añadir en app/admin/dashboard un botón "Exportar auditoría RGPD" que genere un CSV con todos
los registros de consent_audit_log (para responder a inspecciones de AEPD).
```

---

## NOTAS DE IMPLEMENTACIÓN

### Orden recomendado de implementación

```
1. PROMPT 1 → Páginas legales (sin estas no se puede publicar)
2. PROMPT 2 → Banner cookies (requerido antes de cualquier analítica)
3. PROMPT 3 → Aceptación T&C en registro paciente (bloquea registro sin consentimiento)
4. PROMPT 5 → Onboarding médico con RC (bloquea aprobación sin seguro)
8. PROMPT 8 → Sistema auditoría (implementar junto con los anteriores)
4. PROMPT 4 → Consentimiento por consulta
6. PROMPT 6 → Panel admin verificación RC
7. PROMPT 7 → Páginas EN para turistas (antes de temporada alta)
```

### Variables de entorno adicionales para compliance

```bash
# Añadir a .env.local y Vercel
CRON_SECRET=<secret aleatorio para proteger endpoints cron>
NEXT_PUBLIC_LEGAL_VERSION=1.0
NEXT_PUBLIC_TERMS_UPDATED_AT=2026-03-13
COMPANY_NAME="Ibiza Care SL"
COMPANY_EMAIL=legal@oncallclinic.es
COMPANY_ADDRESS="[COMPLETAR], Ibiza, Illes Balears, España"
```

### Principios legales a respetar en el código

```
1. NUNCA mostrar texto que implique que la plataforma "presta servicios médicos"
2. SIEMPRE mostrar "médico independiente" / "independent physician" — nunca "nuestro médico"
3. El mensaje de emergencias (llamar al 112) debe ser visible en el flujo de solicitud
4. Los checkboxes de consentimiento NO pueden estar pre-marcados
5. El consentimiento de datos de salud debe ser checkbox SEPARADO e independiente
6. Cualquier cambio en T&C requiere re-aceptación de todos los usuarios activos
7. Los logs de consentimiento NUNCA se borran (retención mínima = vida de la empresa + 5 años)
```
