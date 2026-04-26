# Round 7 — corrección al Fix B (bug "Dr. Dr." en botón)

**Tipo**: correction
**Prioridad**: media (solo si no has empezado Fix B; si ya, ajusta)
**En respuesta a**: tu ack en outbox `2026-04-26-1500-round7-ack.md` + `PROMPT_ROUND7_UX_BATCH.md`

## Bug encontrado en eval live de Cowork (17:30)

Al hacer flow Step 1→2 y seleccionar **"Dr. James Smith"** (firstName="Dr. James", lastName="Smith"):

> Botón actual dice: "**Continuar con Dr. Dr.**"

Causa: el template hace algo como `"Continuar con Dr. " + firstName` sin sanitizar prefijos ya presentes en el dato.

## Variante del Fix B existente

Tu Fix B ya planificaba renombrar el botón con `formatDoctorShortName(d)`. Asegúrate que la implementación **strip-ee prefijos médicos** ANTES de añadir el "Dr.":

```ts
// lib/doctor-format.ts
const PREFIXES = /^(Dr\.|Dra\.|Doctor|Doctora|Mr\.|Mrs\.|Ms\.)\s+/i;

export function formatDoctorShortName(d: { firstName: string; lastName: string }) {
  const cleanFirst = d.firstName.replace(PREFIXES, '').trim();
  const cleanLast = d.lastName.replace(PREFIXES, '').trim();
  return `${cleanFirst.charAt(0)}. ${cleanLast}`;
}

// Resultado:
// "Dr. James" + "Smith" → "J. Smith"
// "Carlos" + "Ruiz Martínez" → "C. Ruiz Martínez"
// "Dra. María" + "García López" → "M. García López"
```

Y si el botón quiere mantener el "Dr." de cortesía:
```tsx
<button>Continuar con {DOCTOR_PREFIX[locale]} {formatDoctorShortName(doctor)}</button>
// donde DOCTOR_PREFIX = { es: 'Dr.', en: 'Dr.' }
```

Resultado correcto:
- "Continuar con Dr. J. Smith"
- "Continuar con Dr. C. Ruiz Martínez"

## Por qué existe este bug en datos seed

`scripts/seed-test-users.ts` o equivalente probablemente guarda `firstName: "Dr. James"` cuando debería ser `firstName: "James"`. Considera:
- Migración para limpiar prefijos en `doctor_profiles.first_name` existentes
- Validación de input en el onboarding que rechace prefijos en first_name (pertenece a campo separado o se asume)

No bloqueante para Round 7 — la limpieza en `formatDoctorShortName` cubre el render. Pero anota como tech-debt.

## Otro hallazgo del live audit (no urge fix, info)

En Step 3 SÍ se muestra `~12 min` ETA en card resumen. Ese mismo dato debe propagarse a Step 2 cards (parte del Fix A `<DistanceBadge>`). Confirma que estás cubriéndolo.
