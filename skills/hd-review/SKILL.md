---
name: hd-review
description: Fases 3 y 4 del framework Hiper-driven (HD). Usar cuando todas las olas terminaron (mega cambio) o la implementación está lista (cambio chico). Audita el trabajo contra spec y plan worktree por worktree (secuencial), registra veredictos en review-progress.md, lanza correcciones hasta dejar todo en verde, mergea por parches SIN commits dejando todo sin stage para la aprobación humana, y atiende los bugs que el humano reporte durante su prueba.
---

# HD — Fase 3: Revisión y corrección + soporte a Fase 4

Esta fase es la que hace que el trabajo de un LLM sea **confiable**. No se ejecuta hasta que TODAS las olas estén terminadas (mega) o la implementación lista (chico). Vos orquestás; un **subagente revisor distinto del que implementó** audita.

## Paso 1 — Auditoría secuencial

Lanzá el subagente revisor con contexto completo: **spec + planes + ubicación de los worktrees**. Analizá los worktrees **de a uno, en orden, nunca en paralelo** (los hallazgos de uno pueden iluminar al siguiente).

El revisor busca, contra el spec y el plan:

1. **Vulnerabilidades y huecos de seguridad**: inyecciones, secretos expuestos, validaciones faltantes, auth/authz esquivable, superficies nuevas sin proteger.
2. **Bugs lógicos**: condiciones borde, off-by-one, flujos incompletos, errores silenciados.
3. **Trampas del lenguaje y librerías en uso**: concurrencia mal manejada, recursos sin cerrar, errores típicos del stack (p. ej. los famosos problemas de spawn de greenlets en Python/gevent, contexto async perdido, transacciones sin commit/rollback correcto).
4. **Desviaciones e inconsistencias**: todo lo implementado debe poder trazarse al spec y a un plan; todo lo prometido en spec/plan debe estar implementado. Lo que sobre y lo que falte se reporta.
5. **Calidad de los tests**: verificar que los tests existen, llaman al código real, y efectivamente fijan el comportamiento del plan (no tests triviales ni solo happy path).

## Paso 2 — Veredictos

Creá `.hd/<nombre-del-trabajo>/review-progress.md` con `templates/review-progress-template.md`:

- Un bloque **por worktree** (por unidad de revisión en cambio chico), en el orden en que se revisaron.
- Cada bloque termina con veredicto **APROBADO** o **DENEGADO** y **el porqué**: la justificación clara, no un "LGTM".
- Si se deniega: qué debe corregirse para pasar a verde, punto por punto.

## Paso 3 — Correcciones (loop)

- Worktree denegado → lanzá un **subagente corrector** sobre ESE worktree, con los hallazgos concretos. El corrector corrige; no rediseña, no agrega alcance.
- Re-revisá ese worktree y actualizá su bloque en `review-progress.md`.
- Repetí hasta que **todos los worktrees estén en verde**.

## Paso 4 — Merge local (por parches, SIN commits)

Con todo en verde, unificá el trabajo en la rama creada en `hd-spec`:

1. En cada worktree, extraé los cambios como parche (`git diff` y equivalentes: incluye archivos nuevos y borrados).
2. Aplicá los parches **de a uno** sobre la rama de trabajo, resolviendo conflictos si aparecen.
3. Resultado obligatorio: **todos los cambios presentes, SIN STAGE y SIN NINGÚN COMMIT.**

Nada de `git merge` de ramas ni commits intermedios: el diff único sin stage ES la interfaz de revisión del humano en la fase 4.

## Paso 5 — Handoff al humano (Fase 4)

Avisá claramente:

- Qué se implementó (resumen por plan/ola).
- Dónde quedaron los artefactos (`.hd/<nombre-del-trabajo>/`, incluido `review-progress.md`).
- Que todo está **sin stage para que pruebe el comportamiento y revise el código a mano**.

### Si el humano encuentra algo

Si reporta un error, un bug, o logs con errores:

- Lanzá un **subagente corrector NUEVO, directo en la rama, SIN worktree nuevo**, con la descripción del problema y el contexto necesario.
- Corregido → corré los tests involucrados y devolvé el trabajo al humano, otra vez todo sin stage.

## Salida

- El humano dice explícitamente que está todo bien → handoff: **siguiente fase: `hd-close`**.
- Nunca avances a `hd-close` por inercia ni porque "los tests pasan": la aprobación es del humano.
