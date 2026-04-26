# Round 10 — /[locale]/pro doctor-acquisition landing shipped

**En respuesta a**: PROMPT — Implementar Landing /pro para Profesionales
**Tipo**: status (shipped + verified live)

## Commit + push

```
b1e2512  feat(round10): /[locale]/pro doctor-acquisition landing — ES principal + EN
```

`git push origin main` → `43b8717..b1e2512` ✓

## Verificación R2 + R3

```
$ git rev-parse HEAD
b1e25128045c13366c714ed128d45102c59aecd5

$ curl -s https://oncall.clinic/api/health
{ "ok": true, ..., "commit": "b1e25128045c13366c714ed128d45102c59aecd5" } ✓

$ curl -s -o /dev/null -w "%{http_code}" https://oncall.clinic/es/pro
200 ✓

$ curl -s -o /dev/null -w "%{http_code}" https://oncall.clinic/en/pro
200 ✓
```

### Hreflang + canonical (live HTML, post-cache-bust)

```
<link rel="canonical" href="https://oncall.clinic/es/pro"/>
<link rel="alternate" hrefLang="es" href="https://oncall.clinic/es/pro"/>
<link rel="alternate" hrefLang="en" href="https://oncall.clinic/en/pro"/>
<link rel="alternate" hrefLang="x-default" href="https://oncall.clinic/es/pro"/>
```

✓ **x-default → /es/pro** (no /en/pro), as the prompt required.

### JSON-LD schemas (server-rendered)

- 1× WebPage schema (name, description, url, inLanguage, isPartOf)
- 1× FAQPage schema (5 first questions, mapped from `pro.faq.questions[0..4]`)

Verificable en View Source de cualquiera de los dos locales.

## Build verification

```
├ ● /[locale]/pro                                2.21 kB         115 kB
├   ├ /es/pro
├   └ /en/pro
```

Tipo `●` = SSG prerendered as static HTML at build time. Both locales generated.

## Live audit (Playwright + system Chrome, mobile UA, ambos locales)

| Check | /es/pro | /en/pro |
|---|---|---|
| HTTP status | 200 | 200 |
| `<title>` matches meta | ✓ | ✓ |
| Sticky nav rendered | ✓ | ✓ |
| Hero h1 present | ✓ | ✓ |
| Stats "96.8 M turistas" visible | ✓ | ✓ |
| Income calculator (€150 / €135) | ✓ | ✓ |
| Ibiza city in cities grid | ✓ | ✓ |
| FAQ `<details>` accordions | ✓ (7 items) | ✓ (7 items) |
| `/doctor/register` CTA links | 4 | 4 |
| JSON-LD scripts | 4 | 4 |
| Console errors | **0** | **0** |

JSON-LD count = 4 because layout adds 2 site-wide schemas (MedicalOrganization + FAQPage for the patient FAQ) and the page adds 2 more (WebPage + FAQPage for /pro). All four valid.

## Notas para el Director

### ⚠️ Reference HTML files no encontrados

Los archivos `LANDING_PRO_PROFESIONALES_ES.html` y `LANDING_PRO_PROFESIONALES.html` mencionados en el prompt **no existían en disco** al momento de la tarea (ni en repo, ni en archive/, ni en Downloads, ni en claude-design-exports). Búsqueda exhaustiva sin resultado.

Implementación basada en la **especificación estructural del prompt** que sí contiene:
- Numbers exactos (10 ciudades, 96.8M, €150 → €135, comisión 10%/15% all-inclusive con IVA + Stripe, rango €675-4.050/mes, time badges 5/5/3-5d/10/10 min)
- Section list completa (11 secciones en el orden exacto)
- Lista de 6 benefits, 6 requirements, 10 cities, 7 FAQ topics
- Color tokens
- Legal note del footer

**Por favor revisa el copy en `/es/pro` y `/en/pro` y dime si necesita ajustes** — todas las cadenas viven en `messages/{es,en}.json` bajo `pro.*` namespace, fácil de editar en un commit posterior sin tocar componentes.

### Decisiones técnicas tomadas

- **ProFAQ usa native `<details>/<summary>`** en lugar de useState client-component como sugería el prompt. Razón: misma UX (toggle on click, accessible, multiple-open), 0 JS shipped, mismo patrón que `BookingFaq` ya en producción. Si prefieres exclusivo (single-open accordion), pásame el deseo y lo convierto.
- **CitiesGrid usa 5 cols desktop / 2 cols mobile** (no 4 cols porque 10 ciudades dividen mejor en 5+5).
- **Phone field** en checkout NO se persiste en DB (no hay columna). Pasa solo a Stripe metadata. Esto sigue de Round 9 — no es nuevo de este round.
- **Tailwind**: registré `navy: '#1B3A5C'` como color custom. Los demás (teal-600, teal-100, teal-700, green-600, amber-600) coinciden con defaults Tailwind exactos.
- **Sitemap**: `/pro` añadido con priority 0.9 changeFrequency weekly, hreflang triplet correcto.

## Próximo

1. **Revisión copy** Director — flag si algo diverge del HTML aprobado.
2. Una vez aprobado, integrar link al `/pro` desde landing principal `/es` y `/en` (footer + nav "Para médicos") — siguiente commit cuando confirmes.
3. CRO posterior: A/B variants del income calculator + city-specific landing pages (e.g. `/es/pro/madrid`).
