---
name: hd-spec
description: Fase 2 del framework Hiper-driven (HD). Usar después de hd-discovery, con las dudas ya resueltas. Decide el modo de trabajo (mega cambio o cambio chico), crea las ramas, escribe el spec.md (qué, por qué, criterios de aceptación, Q&A) y parte el trabajo en planes ordenados en olas, sin escribir nunca código ni snippets en los artefactos.
---

# HD — Fase 2: Spec y plan

Entrada: el resumen del entendimiento y la Q&A de `hd-discovery`. Salida: un spec aprobado + planes listos para `hd-implement`.

**REGLA DURA: ni el spec ni los planes llevan snippets de código, ni el código exacto que los implementadores deben escribir.** El código es responsabilidad del implementador; para eso es implementador. En los artefactos se describe **comportamiento esperado**, en prosa.

## Paso 1 — Decidir el modo

- Si el usuario declaró el modo explícitamente ("esto es un mega cambio" / "son un par de cambios"), **respetalo**. Si tu análisis lo contradice fuerte, decilo una vez; si insiste, se hace como dice.
- Si no dijo nada, **decidí vos y anuncialo con el porqué**. Señales de MEGA CAMBIO:
  - Refactor de grandes superficies de código.
  - Tocar muchos archivos (como referencia: del orden de 20+ archivos sustanciales).
  - Crear o borrar módulos o microservicios enteros.
  - Operaciones sobre datos sensibles o en masa.
  - Cualquier trabajo que pueda **dejar el sistema inconsistente a mitad de camino** — esta es la señal decisiva.
- Lo que no cae en eso: **CAMBIO CHICO**.

### Si es mega cambio, avisá UNA sola vez:

> En este modo no hay garantía de que todo salga bien a la primera. Por eso el trabajo se parte en pasos chicos que se revisan uno por uno: es más barato encontrar un error en la ola 1 que en la ola 4, cuando ya hay código encima.

## Paso 2 — Ramas (antes de escribir nada)

- Para **cada repo involucrado**: proponé una rama nueva basada en la rama actual. Dale aviso al usuario sugiriendo **nombre de la rama** y **desde dónde se crea**.
- Si el usuario aprueba: creala. Si no: se trabaja desde donde está.
- En cambio chico la regla es la misma: se propone, el usuario decide.

## Paso 3 — Escribir el spec

Creá el directorio de trabajo `.hd/<nombre-del-trabajo>/` en el repo principal y escribí `.hd/<nombre-del-trabajo>/spec.md` siguiendo `templates/spec-template.md`:

- **Resumen del entendimiento**: lo que entendiste después de toda la fase de preguntas y respuestas.
- **Qué** se va a hacer y **por qué**.
- **Criterios de aceptación** verificables (se responden con sí/no).
- **Riesgos y mitigaciones**.
- **Q&A completo**: cada pregunta de la fase de discovery con su respuesta.
- Si toca datos: estado de la pregunta sobre producción, respaldo y prueba en seco.

En modo **cambio chico**: mismo archivo, mismo esqueleto, contenido breve. El rigor no se negocia; la burocracia sí.

## Paso 4 — Partir el trabajo en planes

### Modo mega cambio: planes en olas

Escribí un archivo por plan en `.hd/<nombre-del-trabajo>/plans/plan-NN-<nombre>.md` siguiendo `templates/plan-template.md`, y ordenalos así:

1. **Ola 0 — Contratos.** Define todo lo que los demás planes comparten: tipos, esquemas, firmas, estructura/esqueleto inicial, migraciones. **Esta ola va sola y se revisa antes de seguir**, porque si el contrato está mal, todo lo que venga después también va a estar mal.
2. **Olas siguientes.** Los planes de una misma ola **no dependen entre sí** y corren en paralelo. Un plan **solo puede depender de olas anteriores**, nunca de otro plan de su misma ola.
3. **Ola de datos.** Todo lo que mueve datos que ya existen va en su **propia ola, al final, y nunca en paralelo**. Antes de correrla: preguntar al usuario si hay datos en producción, pedir confirmación, y **exigir respaldo y una prueba en seco**.

**Regla de paralelismo** — un plan es seguro para correr en paralelo SOLO si cumple TODO esto:
- Sus tareas son independientes de las de los otros planes de su ola (no se pisan en archivos ni en módulos).
- Ninguna tarea incluye ejecutar tests que toquen una base de datos.

Si dudás: no lo pongas en paralelo. Una ola extra es barata; dos implementadores pisándose, no.

**Cada plan incluye**: número de ola, dependencias (solo olas anteriores), objetivo, alcance (qué se toca y qué NO se toca), comportamiento esperado que los tests van a fijar primero (TDD), criterios de aceptación y notas para el implementador.

### Modo cambio chico: un solo plan

Un único `plans/plan-01-<nombre>.md`, breve, con el mismo esqueleto. Sin olas, sin worktrees.

## Paso 5 — Aprobación y handoff

- Mostrá al usuario: modo elegido, spec, y la división en planes/olas.
- **Esperá su aprobación explícita** antes de implementar nada.
- Aprobado → anunciá el handoff: **siguiente fase: `hd-implement`**.
