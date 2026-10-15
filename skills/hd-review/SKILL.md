---
name: hd-review
description: Fases 3 y 4 del framework Hiper-driven (HD). Usar cuando todas las olas terminaron (mega cambio) o la implementación está lista (cambio chico). Un revisor distinto del que implementó audita worktree por worktree (secuencial, contra spec y plan), registra veredictos con evidencia en review-progress.md, corre un loop de correcciones con breaker de 5 rondas y adjudicación registrada en el ledger, mergea por parches SIN commits dejando todo sin stage para la aprobación humana, y atiende los bugs que el humano reporte (correctores obligados a usar hd-debug).
---

# HD — Fase 3: Revisión y corrección + soporte a Fase 4

Esta fase es la que hace que el trabajo de un LLM sea **confiable**. No arranca hasta que TODAS las olas terminaron (mega) o la implementación está lista (chico). Vos orquestás; un **subagente revisor distinto del que implementó** audita.

## Ley de hierro de la evidencia

```
NINGÚN VEREDICTO NI AFIRMACIÓN DE ÉXITO SIN EVIDENCIA FRESCA EN ESTE TURNO.
```

- Todo veredicto cita la evidencia: la salida de tests que VOS corriste recién y el diff leído por el revisor. "Los tests pasaron en la ola" no es evidencia de la corrección de ahora.
- El revisor **lee** código y diffs; no ejecuta tests. Las corridas las hacés vos y viajan como archivo.

## Paso 1 — Auditoría secuencial

Lanzá el revisor con contexto completo por **rutas de archivo** (spec, plan, diff de cada worktree como archivo generado con `git diff`), nunca historia pegada en el prompt. Analizá worktrees **de a uno, en orden, nunca en paralelo** (los hallazgos de uno iluminan al siguiente).

El revisor busca, contra spec y plan:

1. **Vulnerabilidades y huecos de seguridad**: inyecciones, secretos expuestos, validaciones faltantes, auth esquivable.
2. **Bugs lógicos**: condiciones borde, flujos incompletos, errores silenciados.
3. **Trampas del lenguaje y librerías**: concurrencia mal manejada, recursos sin cerrar, errores típicos del stack (p. ej. spawn de greenlets en Python/gevent, contexto async perdido, transacciones sin cerrar).
4. **Desviaciones**: todo lo implementado debe trazarse al spec y a un plan; todo lo prometido debe estar implementado. Lo que sobre y lo que falte se reporta.
5. **Calidad de tests**: existen, llaman al código real, fijan el comportamiento del plan (no triviales, no solo happy path).

## Paso 2 — Veredictos con evidencia

`.hd/<nombre-del-trabajo>/review-progress.md` (template empaquetado en esta skill, `templates/review-progress-template.md`):

- Un bloque por worktree, en orden de revisión, con veredicto **APROBADO** o **DENEGADO** y **el porqué** concreto — no un "LGTM".
- Denegado incluye: qué debe corregirse para pasar a verde, punto por punto.

## Paso 3 — Correcciones (loop con breaker)

- Worktree denegado → **subagente corrector sobre ESE worktree** con los hallazgos concretos, **obligado a seguir `hd-debug`** (causa raíz primero, un cambio por hipótesis). Corrige; no rediseña ni agrega alcance. Como todo implementador: no ejecuta nada, no commitea — vos re-corres los tests y anexás la salida.
- Re-revisá ese worktree y actualizá su bloque.

**Breaker — máximo 5 rondas de corrección por worktree:**
- Rondas 1-3: reanudá al corrector original (su contexto conoce el código y sus propias decisiones).
- Rondas 4-5: **agente nuevo** con el reporte de lo ya intentado ("un corrector anterior lo intentó N veces; ahora es tuyo") — un loop que sobrevive 3 reanudaciones suele significar que el agente no ve su propio problema.
- **Si la ronda 5 cierra con hallazgos abiertos, dejá de lanzar agentes y adjudicá vos**, hallazgo por hallazgo, con el spec como autoridad:
  - **Controvertible o falso positivo** → parkeado: `Ruling: <por qué el código se queda>` en el ledger.
  - **Real pero sin peso estructural** (nada downstream depende de eso) → parkeado como diferido, con razón escrita.
  - **Real y estructural** → definí el cambio mínimo que desbloquea, lanzá la corrección final, y registrá el ruling.
- **Toda adjudicación entra al ledger. Un descarte silencioso está prohibido** — esas decisiones las tomaste en nombre del humano y van a la lista final de hd-close.

## Paso 4 — Merge local (por parches, SIN commits)

Con todo en verde (o adjudicado): extraé los cambios de cada worktree como parche (`git diff` y equivalentes: incluye archivos nuevos y borrados), aplicalos **de a uno** sobre la rama de trabajo resolviendo conflictos. Resultado obligatorio: **todo presente, SIN STAGE y SIN NINGÚN COMMIT.** El diff único sin stage ES la interfaz de revisión del humano.

## Paso 5 — Handoff al humano (Fase 4)

Avisá: qué se implementó (resumen por plan/ola), dónde están los artefactos (`.hd/<nombre-del-trabajo>/`), y que todo está **sin stage para probar comportamiento y revisar a mano**.

### Si el humano encuentra algo

**Subagente corrector NUEVO, directo en la rama, SIN worktree nuevo, obligado a seguir `hd-debug`.** Corregido → vos corré los tests involucrados (evidencia fresca) → devolvéselo al humano, otra vez todo sin stage. Recordá la regla de hd-debug: **3 fixes fallidos sobre el mismo problema = cuestionar la arquitectura con el humano, no un cuarto fix.**

## Salida

- El humano dice explícitamente que está todo bien → handoff: **siguiente fase: `hd-close`**.
- Nunca avances por inercia ni porque "los tests pasan": la aprobación es del humano.

## Racionalizaciones comunes (y su realidad)

| Excusa | Realidad |
|--------|----------|
| "Casi conforme con el spec" | Casi = no conforme. Se corrige, o se adjudica en el breaker. Esas son las únicas dos salidas. |
| "Una ronda más y converge" | Pasado el breaker, las rondas no convergen: la falla es estructural. Adjudicá. |
| "Este hallazgo es obviamente falso, lo descarto" | Adjudicar es decidir con razón escrita en el ledger. Descartar en silencio está prohibido. |
| "La corrección fue chica, salteo la re-revisión" | Las correcciones no revisadas son como entran las regresiones. |
| "Las revisiones enlentecen" | El loop sin revisiones es churn no verificado. Las revisiones son los frenos y la dirección. |
| "Reviso los worktrees en paralelo, es más rápido" | Secuencial. El hallazgo del worktree 1 muchas veces ES la explicación del worktree 2. |
