# OnCall Clinic — Admin Panel + IA Prompts

Backend de administración: fácil acceso, gestión del día a día, IA para documentación y clientes.
Stack: Next.js 14 App Router · Supabase · Claude API (Anthropic) · Vercel Edge Functions

---

## ARQUITECTURA DEL ADMIN PANEL

```
/admin
  ├── dashboard/          ← Vista general + IA daily briefing
  ├── doctors/            ← Lista médicos + estado RC
  ├── verifications/      ← Cola de verificación de documentos (con IA)
  ├── patients/           ← Gestión de pacientes
  ├── complaints/         ← Sistema de reclamaciones (con IA)
  ├── consultations/      ← Consultas en tiempo real + histórico
  ├── finance/            ← Ingresos, comisiones, pagos
  ├── ai-assistant/       ← Chat admin con IA
  └── settings/           ← Configuración plataforma
```

---

## PROMPT 16 — Admin Dashboard con AI Daily Briefing

```
Mejora app/admin/dashboard/page.tsx añadiendo un sistema de AI Daily Briefing que resuma automáticamente el estado de la plataforma cada mañana.

### 1. Crea la API route app/api/admin/ai-briefing/route.ts:

```typescript
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  
  // Fetch today's data
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const [
    { count: todayConsultations },
    { count: pendingVerifications },
    { data: activeComplaints },
    { data: expiringRC },
    { data: todayRevenue },
  ] = await Promise.all([
    supabase.from('consultations').select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString()),
    supabase.from('doctor_profiles').select('*', { count: 'exact', head: true })
      .eq('verification_status', 'pending'),
    supabase.from('complaints').select('id, status, priority, created_at')
      .in('status', ['open', 'in_review']).order('priority', { ascending: false }).limit(5),
    supabase.from('doctor_profiles').select('full_name:profiles(full_name), rc_insurance_expiry')
      .lte('rc_insurance_expiry', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
      .eq('verification_status', 'approved'),
    supabase.from('consultations').select('commission')
      .eq('status', 'completed').gte('created_at', today.toISOString()),
  ])

  const revenue = (todayRevenue || []).reduce((sum, c) => sum + (c.commission || 0), 0)
  
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  
  const prompt = `Eres el asistente de operaciones de OnCall Clinic, plataforma de médicos a domicilio en Ibiza.
  
Datos de hoy (${new Date().toLocaleDateString('es-ES')}):
- Consultas hoy: ${todayConsultations}
- Ingresos de comisiones hoy: €${(revenue / 100).toFixed(2)}
- Verificaciones médicos pendientes: ${pendingVerifications}
- Reclamaciones abiertas: ${activeComplaints?.length || 0}
- Médicos con RC próxima a vencer (<7 días): ${expiringRC?.length || 0}

Genera un briefing ejecutivo en español en 3-4 párrafos cortos:
1. Estado general de la plataforma hoy
2. Acciones urgentes (si las hay)
3. Tendencias o puntos de atención
4. Una recomendación para el día

Sé directo, conciso y orientado a acciones. No uses markdown extenso.`

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 400,
    messages: [{ role: 'user', content: prompt }]
  })

  return NextResponse.json({
    briefing: message.content[0].type === 'text' ? message.content[0].text : '',
    generatedAt: new Date().toISOString(),
    data: { todayConsultations, pendingVerifications, revenue, activeComplaints: activeComplaints?.length || 0, expiringRC: expiringRC?.length || 0 }
  })
}
```

### 2. En el admin dashboard, añade componente AIDailyBriefing:

Card al top del dashboard con:
- Header: "🤖 Resumen IA del día — [fecha]" con botón "Actualizar"
- Loading skeleton mientras carga
- Texto del briefing con fuente legible
- Badges de alertas: 🔴 "X reclamaciones abiertas" | 🟡 "X docs pendientes" | 🟠 "X RC próximas a vencer"
- Se regenera automáticamente al cargar el dashboard si el briefing tiene más de 4 horas

### 3. Añade sección "Quick Actions IA" al dashboard:
4 botones que abren modales con IA:
- "📋 Redactar respuesta reclamación" → abre modal con IA
- "✅ Revisar documento médico" → abre modal con IA
- "📊 Analizar tendencias semana" → genera reporte IA
- "📧 Comunicación masiva médicos" → redacta email con IA
```

---

## PROMPT 17 — Sistema de Verificación IA de Documentos Médicos

```
Crea un sistema completo en app/admin/verifications/ para que el administrador verifique la documentación de médicos con asistencia de IA.

### 1. Crea la tabla de verificación (nueva migración Supabase):

```sql
-- migrations/003_verification_ai.sql

CREATE TABLE doctor_verification_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_profile_id UUID REFERENCES doctor_profiles(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id),
  
  -- Documentos
  license_url TEXT,
  rc_insurance_url TEXT,
  id_document_url TEXT,
  
  -- AI Analysis
  ai_license_analysis JSONB,     -- { valid: bool, number: string, expiry: date, issuer: string, confidence: number, issues: string[] }
  ai_rc_analysis JSONB,          -- { valid: bool, coverage_amount: number, expiry: date, company: string, confidence: number, issues: string[] }
  ai_overall_recommendation TEXT, -- 'approve' | 'reject' | 'manual_review'
  ai_notes TEXT,
  ai_analyzed_at TIMESTAMPTZ,
  
  -- Human review
  human_decision TEXT CHECK (human_decision IN ('approved', 'rejected', 'more_info')),
  human_notes TEXT,
  rejection_reason TEXT,
  reviewed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de reclamaciones
CREATE TABLE complaints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consultation_id UUID REFERENCES consultations(id),
  patient_id UUID REFERENCES profiles(id),
  doctor_id UUID REFERENCES profiles(id),
  
  type TEXT NOT NULL CHECK (type IN ('medical_quality', 'billing', 'no_show', 'behavior', 'delay', 'other')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'pending_response', 'resolved', 'closed')),
  
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- AI
  ai_summary TEXT,
  ai_suggested_action TEXT,
  ai_priority_reason TEXT,
  ai_draft_response TEXT,
  
  -- Resolution
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id),
  
  -- Metadata
  patient_notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Crea app/api/admin/analyze-document/route.ts:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: NextRequest) {
  const { documentUrl, documentType, doctorName } = await request.json()
  
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  
  // Fetch document as base64
  const imageResponse = await fetch(documentUrl)
  const buffer = await imageResponse.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')
  const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg'
  
  const prompts = {
    medical_license: `Analiza este documento de licencia médica/colegiación española. 
    Extrae y verifica:
    1. ¿Es un documento oficial de un Colegio de Médicos español? (sí/no)
    2. Número de colegiado
    3. Nombre del médico (¿coincide con "${doctorName}"?)
    4. Fecha de expedición
    5. Estado: ¿activo/caducado?
    6. Especialidad indicada (si la hay)
    7. Issues detectados (ilegible, caducado, nombre no coincide, etc.)
    8. Confianza de tu análisis (0-100)
    
    Responde en JSON: { valid, license_number, doctor_name, issue_date, active, specialty, issues, confidence, recommendation }`,
    
    rc_insurance: `Analiza este documento de seguro de responsabilidad civil médica.
    Extrae y verifica:
    1. ¿Es una póliza RC válida para práctica médica en España?
    2. Nombre del asegurado (¿coincide con "${doctorName}"?)
    3. Compañía aseguradora
    4. Fecha de inicio y vencimiento
    5. ¿Está vigente hoy (${new Date().toISOString().split('T')[0]})?
    6. Cobertura en euros (debe ser mínimo €300.000)
    7. ¿Cubre visitas domiciliarias?
    8. Issues detectados
    9. Confianza (0-100)
    
    Responde en JSON: { valid, insured_name, company, start_date, expiry_date, active, coverage_amount, covers_home_visits, issues, confidence, recommendation }`
  }
  
  const message = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 800,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/webp', data: base64 }
        },
        { type: 'text', text: prompts[documentType as keyof typeof prompts] }
      ]
    }]
  })
  
  const text = message.content[0].type === 'text' ? message.content[0].text : '{}'
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: 'Could not parse', raw: text }
  
  return NextResponse.json({ analysis, documentType })
}
```

### 3. Página app/admin/verifications/page.tsx — rediseño con IA:

Layout:
- Tabs: "Pendientes (X)" | "En revisión IA" | "Aprobados hoy" | "Rechazados"
- Cada card de médico tiene:
  - Foto + nombre + especialidad
  - Fecha de solicitud
  - Documentos subidos con preview thumbnail
  - Botón "🤖 Analizar con IA" → llama a la API y muestra resultado inline
  - After IA analysis: tarjetas de resultado con semáforo (verde/amarillo/rojo)
  - Botones finales: "✅ Aprobar" | "⚠️ Solicitar más info" | "❌ Rechazar"
  - Campo de notas libre (se guarda en human_notes)

### 4. Página app/admin/doctors/page.tsx — gestión completa:

- Lista con filtros: activos/suspendidos/pendientes RC vencida
- Cada fila: foto, nombre, especialidad, RC expiry (badge rojo si <30 días), rating medio, consultas mes, estado
- Acciones inline: ver perfil, enviar alerta RC, suspender/reactivar, ver documentos
- Banner superior si hay médicos con RC vencida: "🔴 X médicos suspendidos por RC vencida. Ver lista →"
```

---

## PROMPT 18 — Sistema de Reclamaciones con IA

```
Crea un sistema completo de gestión de reclamaciones en app/admin/complaints/ con IA para triaje y sugerencia de respuestas.

### 1. Crea app/api/admin/ai-complaint/route.ts:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: NextRequest) {
  const { complaintText, complaintType, consultationData } = await request.json()
  
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    system: `Eres el sistema de gestión de reclamaciones de OnCall Clinic, plataforma de médicos a domicilio en Ibiza. 
Tu rol es analizar reclamaciones de pacientes y ayudar al equipo de operaciones a resolverlas.
Siempre responde en JSON con esta estructura exacta:
{
  "priority": "urgent|high|medium|low",
  "priority_reason": "por qué esta prioridad",
  "summary": "resumen de 1-2 líneas de la reclamación",
  "suggested_action": "acción concreta recomendada",
  "draft_response": "borrador de respuesta al paciente en español e inglés",
  "escalate": boolean,
  "escalation_reason": "si escalate=true, por qué",
  "estimated_resolution_hours": number
}`,
    messages: [{
      role: 'user',
      content: `Reclamación recibida:
Tipo: ${complaintType}
Texto: ${complaintText}
Datos consulta: ${JSON.stringify(consultationData)}

Analiza y genera la respuesta JSON.`
    }]
  })
  
  const text = message.content[0].type === 'text' ? message.content[0].text : '{}'
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {}
  
  return NextResponse.json(analysis)
}
```

### 2. Página app/admin/complaints/page.tsx:

Layout:
- Header con contadores: 🔴 Urgentes (X) | 🟠 Alta prioridad (X) | 🟡 Media (X) | 🟢 Resueltas hoy (X)
- Filtros: por tipo, por estado, por prioridad, por fecha
- Lista de reclamaciones con:
  - Badge de prioridad (color)
  - Paciente + consulta asociada
  - Tipo de reclamación
  - Resumen IA (si ya analizado)
  - Tiempo abierta
  - Estado actual

### 3. Página app/admin/complaints/[id]/page.tsx — detalle:

- Información completa de la reclamación
- Timeline de la consulta (cronología de estados)
- Datos del médico y paciente
- Card "Análisis IA":
  - Prioridad sugerida con justificación
  - Acción recomendada
  - Borrador de respuesta (con botón "Usar este borrador" → copia al textarea)
  - ¿Escalar? con razón
- Sección respuesta manual:
  - Textarea con el borrador IA pre-cargado (editable)
  - Selector de estado: "en revisión / esperando respuesta del médico / resuelto"
  - Botón "Enviar respuesta al paciente" (manda email via Resend/Sendgrid)
  - Botón "Añadir nota interna" (no visible para el paciente)

### 4. Email automático de reclamación (API route):

Cuando se crea una reclamación:
- Al paciente: acuse de recibo + número de ticket + plazo de resolución (48h)
- Al admin: alerta con resumen IA y prioridad
- Al médico (si es pertinente): notificación de reclamación con instrucciones

Template (ES+EN):
"Hemos recibido tu reclamación #[ID]. Nuestro equipo la revisará en un plazo máximo de 48 horas. Número de referencia: OCC-[ID]."
```

---

## PROMPT 19 — Admin AI Chat Assistant

```
Crea app/admin/ai-assistant/page.tsx — un chat de IA para el administrador que puede consultar datos de la plataforma y recibir ayuda contextual.

### Funcionalidades del chat:
El administrador puede preguntar cosas como:
- "¿Cuántas consultas hubo esta semana?"
- "Dame los médicos con peor rating"
- "Resume las reclamaciones del último mes"
- "¿Cuáles son los médicos con RC próxima a vencer?"
- "Redacta un email para los médicos de Ibiza sobre la nueva tarifa"
- "Ayúdame a responder esta reclamación: [pega texto]"

### Implementación (app/api/admin/ai-chat/route.ts):

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const { messages, action } = await request.json()
  
  const supabase = await createClient()
  
  // Fetch context data for the AI
  const [
    { count: totalPatients },
    { count: totalDoctors },
    { count: pendingComplaints },
    { count: pendingVerifications },
    { data: weekStats },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'patient'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'doctor'),
    supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('doctor_profiles').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
    supabase.from('consultations').select('status, commission, created_at')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
  ])
  
  const weekRevenue = (weekStats || []).filter(c => c.status === 'completed')
    .reduce((sum, c) => sum + (c.commission || 0), 0)
  
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  
  const systemPrompt = `Eres el asistente de operaciones de OnCall Clinic, plataforma de médicos a domicilio en Ibiza.

DATOS ACTUALES DE LA PLATAFORMA:
- Pacientes registrados: ${totalPatients}
- Médicos activos: ${totalDoctors}
- Reclamaciones abiertas: ${pendingComplaints}
- Verificaciones pendientes: ${pendingVerifications}
- Ingresos de comisiones esta semana: €${(weekRevenue / 100).toFixed(2)}
- Consultas esta semana: ${weekStats?.length || 0}

Eres experto en:
- Operaciones de plataformas médicas digitales
- Derecho sanitario español (Ley 44/2003, Ley 41/2002, RGPD)
- Gestión de reclamaciones médicas
- Relaciones con profesionales médicos
- Comunicación con pacientes

Responde siempre en español. Sé directo y orientado a acciones. Si el administrador pide redactar comunicaciones, hazlo en formato listo para copiar-pegar.`

  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    system: systemPrompt,
    messages: messages
  })
  
  // Return as stream
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          controller.enqueue(new TextEncoder().encode(chunk.delta.text))
        }
      }
      controller.close()
    }
  })
  
  return new NextResponse(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Transfer-Encoding': 'chunked' }
  })
}
```

### UI del chat (app/admin/ai-assistant/page.tsx):
- Layout tipo ChatGPT pero con marca OnCall
- Sidebar con sugerencias rápidas: "Resumen del día" | "Médicos con problemas" | "Reclamaciones urgentes" | "Redactar comunicación"
- Burbujas de chat con markdown rendering (usar react-markdown)
- Indicador de "escribiendo..." animado
- Botón para copiar la respuesta al clipboard
- Historial de conversación en la sesión (no persistente)
```

---

## PROMPT 20 — Admin Dashboard Financiero

```
Crea app/admin/finance/page.tsx — panel financiero completo para que el administrador controle los ingresos en tiempo real.

### Sección KPIs principales (4 cards en fila):
1. 💰 "Ingresos hoy" — €X,XX en comisiones
2. 📈 "Ingresos este mes" — €X,XXX | badge "+X% vs mes anterior"
3. 💳 "Consultas pendientes de pago" — X consultas
4. 🏦 "Próximo pago Stripe a médicos" — fecha estimada + importe

### Gráfico de ingresos (recharts AreaChart):
- Eje X: últimos 30 días
- Área 1 (azul): comisiones plataforma (15%)
- Área 2 (verde semitransparente): ingresos totales de consultas
- Tooltip: "Día X: X consultas · €XX comisión"

### Tabla de transacciones recientes:
Columnas: Fecha | Paciente | Médico | Tipo | Importe total | Comisión (15%) | Estado pago | Stripe ID
Filtros: por rango de fechas, por estado, por tipo de consulta

### Sección de pagos a médicos:
Lista de próximos payouts pendientes con:
- Médico | Consultas pendientes | Importe a pagar | Fecha estimada Stripe
- Botón "Forzar payout" (solo admin) — llama a Stripe Connect API

### Exportación:
- "📊 Exportar CSV" — mes seleccionado
- "📄 Generar factura mensual Ibiza Care SL" — genera un documento con el resumen para contabilidad
```

---

## PROMPT 21 — Navegación Admin Mejorada

```
Rediseña la navegación del admin panel para que sea profesional y fácil de usar, inspirada en paneles como Stripe Dashboard o Vercel.

### Sidebar izquierdo (desktop):
Logo OnCall Clinic con badge "Admin"
Secciones con iconos:
- 📊 Dashboard — badge con alertas pendientes
- 👥 Pacientes
- 🩺 Médicos — badge X pendientes verificación
- ✅ Verificaciones — badge X con colores urgencia
- 🚨 Reclamaciones — badge X abiertas (rojo si urgentes)
- 📋 Consultas — badge X activas (pulsante)
- 💰 Finanzas
- 🤖 Asistente IA
- ⚙️ Configuración

Footer del sidebar:
- Avatar + nombre del admin
- "Cerrar sesión"

### Header top bar:
- Buscador global: busca por nombre de paciente, médico, ID consulta, número RC
- Campana de notificaciones con dropdown (reclamaciones urgentes, RC vencidas, verificaciones)
- Fecha y hora actual (importante para operaciones)

### Mobile (bottom nav o hamburger):
En mobile, las secciones más usadas en bottom nav: Dashboard | Reclamaciones | Médicos | IA

### Color scheme del admin:
Diferente de la landing (más corporativo):
- Background: #F8FAFC (gris muy claro)
- Sidebar: #1E293B (slate oscuro)
- Sidebar texto activo: #38BDF8 (sky blue)
- Cards: bg-white shadow-sm border border-slate-100
- Danger badges: bg-red-100 text-red-700
- Success badges: bg-green-100 text-green-700
```

---

## Variables de entorno necesarias para el admin IA

Añade a .env.local:

```bash
# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-...

# Email para notificaciones admin
ADMIN_EMAIL=admin@oncallclinic.com
RESEND_API_KEY=re_...   # o SENDGRID_API_KEY

# Stripe (ya existente)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Resumen de capacidades IA del admin

| Feature | IA Model | Frecuencia | Acción |
|---------|----------|------------|--------|
| Daily briefing | claude-haiku-4-5 | Diario 8:00 AM | Auto-generado en dashboard |
| Verificación documentos | claude-opus-4-6 | Por solicitud | Análisis visual de docs |
| Triaje reclamaciones | claude-sonnet-4-6 | Al crear reclamación | Auto-priorización + borrador |
| Chat asistente | claude-sonnet-4-6 | On-demand | Streaming en tiempo real |
| Análisis financiero | claude-haiku-4-5 | Semanal | Resumen + tendencias |
| Alerta RC vencida | Sin IA (cron job) | Diario | Email automático al médico |
| Respuesta reclamación | claude-sonnet-4-6 | Por solicitud | Borrador editable para admin |

---

## Prioridades de implementación admin

1. **PROMPT 17** — Verificación IA documentos → reduce carga operativa inmediata
2. **PROMPT 21** — Navegación mejorada → primer acceso al admin mucho más profesional
3. **PROMPT 18** — Sistema reclamaciones → crítico para gestión diaria y legal
4. **PROMPT 16** — Daily briefing IA → supervisión sin esfuerzo
5. **PROMPT 19** — Chat IA → potencia las capacidades del administrador
6. **PROMPT 20** — Dashboard financiero → control de ingresos
