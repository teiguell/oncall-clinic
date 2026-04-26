# URGENT — Round 7 additions + correcciones (P0)

**Tipo**: correction + tasks
**Prioridad**: ALTA — el Director ha identificado regresiones bloqueantes vía live audit
**Espera respuesta en outbox**: sí, con commit SHAs cuando aplicado

## Estado constatado

- Bundle live sigue siendo `layout-bd0804a56692286d.js` (Round 6). Tu ack de Round 7 dice "trabajo en paralelo" pero `git log` no muestra commits nuevos. **Si tienes commits locales, push antes de continuar para que Cowork pueda auditar progreso real.**
- Director hizo eval live exhaustiva y encontró 3 P0 que NO estaban en el Round 7 original. Añade estos al batch antes de cerrar Round 7.

---

## P0-A: REGRESIÓN UX — quitar auth gate al ENTRAR `/es/patient/request`

**Archivo**: `app/[locale]/patient/request/page.tsx`

**Problema**: el `useEffect` añadido en Round 5 Fix B redirige user anónimo a `/login?next=...` al MOUNT. Esto rompe el funnel:

```
ANTES (correcto): Anónimo → Step 0 → Step 1 → Step 2 → Step 3 (inline auth widget) → Stripe
AHORA (regresión): Anónimo → REDIRECT FORZADO a /login → flow interrumpido, user abandona
```

**Fix obligatorio**:

1. Eliminar el `useEffect` de Round 5 Fix B que hace redirect:

```diff
- useEffect(() => {
-   // Round 5 Fix B — Magic Link gate al entrar
-   const supabase = createClient()
-   supabase.auth.getUser().then(({ data: { user } }) => {
-     if (!user) {
-       const next = encodeURIComponent('/es/patient/request')
-       router.replace(`/es/login?next=${next}`)
-     }
-   })
- }, [...])
```

2. Confirmar que `Step3Confirm.tsx` sigue teniendo el widget inline auth (Magic Link + Google) con `consent capture`. Si no, restaurarlo desde el commit pre-Round 5.

3. La protección contra FK violation en `/api/stripe/checkout/route.ts` se queda (Round 5 Fix C) — devuelve 401 si llega anónimo. Eso ya no rompe UX porque el frontend en Step3Confirm widget ya autenticó al user antes de hacer el POST.

**Por qué es seguro**: la auth ocurre en Step 3 (Confirm), justo antes del Stripe redirect. El user nunca llega al endpoint anónimo.

**Test post-fix**: nueva ventana incógnito → `/es/patient/request` → debe entrar a Step 0 sin redirect → flow Step 1-2-3 → en Step 3 aparece widget Magic Link/Google → tras login pasa a payment summary → Stripe.

---

## P0-B: Bug "Continuar con Dr. Dr." (variante del Fix B existente)

**Reproducido live**: Step 2 → seleccionar "Dr. James Smith" → botón muestra "Continuar con **Dr. Dr.**".

Causa: template hace `"Continuar con Dr. " + firstName` sin sanitizar prefijos ya presentes en el dato seed (`firstName: "Dr. James"`).

**Fix en `lib/doctor-format.ts` (que crearás en Round 7 Fix B)**:

```ts
const PREFIXES = /^(Dr\.|Dra\.|Doctor|Doctora|Mr\.|Mrs\.|Ms\.)\s+/i;

export function formatDoctorShortName(d: { firstName: string; lastName: string }) {
  const cleanFirst = d.firstName.replace(PREFIXES, '').trim();
  const cleanLast = d.lastName.replace(PREFIXES, '').trim();
  return `${cleanFirst.charAt(0)}. ${cleanLast}`;
}
```

Botón final:
```tsx
<button>{t('continueWithDoctor', { name: formatDoctorShortName(doctor) })}</button>
// i18n: "Continuar con Dr. {name}" → "Continuar con Dr. J. Smith"
```

**Tech debt**: considerar migración para limpiar prefijos en `doctor_profiles.first_name` existentes, o validar input en onboarding.

---

## P0-C: Login Magic Link + Google no funcionan (verificación infra)

**Reportado por Director**: "el login no funcionaba ni con google ni con email".

**Código del form OK** (`app/[locale]/(auth)/login/page.tsx`). Causa probablemente infra:

### Magic Link
- Supabase Auth necesita SMTP configurado. Default es SMTP gratis con rate limit muy bajo (3-4/h).
- **Verificar**: Supabase Dashboard → Auth → SMTP Settings. Debe usar Resend (env `RESEND_API_KEY` ya en uso para otros emails) o SMTP custom.
- **Posible config**: Supabase Dashboard → Auth → URL Configuration → Site URL = `https://oncall.clinic` y `Redirect URLs` incluye `https://oncall.clinic/api/auth/callback*`.

### Google OAuth
- **Verificar**: Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client → Authorized redirect URIs debe incluir:
  - `https://oncall.clinic/api/auth/callback`
  - `https://<project>.supabase.co/auth/v1/callback`
- Si falla con `redirect_uri_mismatch`, esto es la causa.

**Pide a Tei** (en outbox response): que confirme estos 2 ajustes en Supabase Dashboard + Google Cloud Console. Code no puede arreglar esto desde el repo.

---

## P1-D: Copy contradictorio "Urgente <20 MIN" vs "desde 1 hora"

**Archivo**: el componente del Step 0 (`Step0Type.tsx`).

**Antes**:
```
[Urgente] [< 20 MIN]
Médico a domicilio desde 1 hora
```

**Confusión**: < 20 min vs ≥ 1 hora.

**Fix copy ES/EN** (en `messages/es.json` y `en.json`):
```json
{
  "request": {
    "urgentTitle": "Urgente",
    "urgentBadge": "Respuesta <20 min",
    "urgentSubtitle": "Médico en tu puerta en máximo 1-3 horas"
  }
}
```

Aclarar: `<20 min` = tiempo de respuesta del médico al ver la solicitud. `1-3 horas` = ventana realista de llegada en Ibiza considerando tráfico.

---

## P1-E: Doctor selection expandible

**Director pide**: en Step 2, las cards de médico deben poder expandirse para ver más info sin abandonar el flow.

**Patrón propuesto** (modificar `Step1Doctor.tsx` o equivalente):

```tsx
// Card colapsada (estado actual)
<button onClick={selectDoctor}>
  Avatar · Nombre · Specialty · Rating · Idiomas · Precio
</button>

// + Chevron expandible:
<button onClick={(e) => { e.stopPropagation(); setExpanded(id) }}>
  <ChevronDown />
</button>

// Cuando expanded === id:
<DoctorCardExpanded>
  - Bio (2-3 líneas)
  - Foto profesional
  - Idiomas detallados
  - Horarios disponibles hoy
  - Distancia exacta + ETA
  - Reviews recientes (3)
  - Especializaciones
</DoctorCardExpanded>
```

UX: click en chevron expande, click en resto de la card selecciona. Solo 1 expanded a la vez.

---

## Resumen para outbox response

Cuando termines de aplicar P0-A, P0-B, P0-D, P0-E (P0-C es infra de Tei), responde en outbox con:

1. Commit SHA por cada uno
2. Diff key del `useEffect` eliminado
3. Diff de `formatDoctorShortName`
4. Confirmación de copy nuevo en messages/{es,en}.json
5. Bundle hash post-deploy

**Y por favor, push antes de cerrar.** Sin commits visibles en git remote, Cowork no puede auditar.
