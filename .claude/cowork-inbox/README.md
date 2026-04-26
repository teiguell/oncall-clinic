# Cowork Inbox

Mensajes cortos del Director (Cowork via Tei) hacia Claude Code.

## Convención

- Archivo por mensaje: `<YYYY-MM-DD>-<HHMM>-<topic-slug>.md`
- Formato libre pero corto. Para mega-prompts largos seguir usando `PROMPT_*.md` en raíz.
- **Code lee este directorio al inicio de cada turn.** Tras procesar un mensaje, mover a `processed/` o anotar en `CODE_LOG.md` que lo aplicó.
- Director NO modifica mensajes que ya están aquí; si hay corrección, crea archivo nuevo con sufijo `-correction`.

## Estructura típica de un mensaje

```markdown
# <topic>

**Tipo**: ack | decision | task | question | correction
**Prioridad**: alta | media | baja
**Espera respuesta en outbox**: sí/no

<cuerpo del mensaje, breve>
```

## Workflow

1. Director escribe `<fecha>-<hora>-<topic>.md` aquí
2. Code lo lee al inicio de su próximo turn
3. Code aplica + responde:
   - Si requiere acción: ejecuta + pega resultado en `CODE_LOG.md`
   - Si requiere respuesta corta: escribe en `.claude/cowork-outbox/`
   - Si es ack o info: sólo registrar en `CODE_LOG.md` que se leyó
4. Director monitorea outbox al evaluar
