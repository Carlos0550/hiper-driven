---
name: hd-spec
description: Fase 2 del framework Hiper-driven (HD). Usar después de hd-discovery, con las dudas resueltas. Confirma el modo (mega cambio o cambio chico, con ratchet unidireccional), crea las ramas, escribe el spec.md (qué, por qué, criterios de aceptación, Q&A) y parte el trabajo en planes con firmas de archivo e interfaces exactas que hacen el paralelismo computable. Nunca lógica ni implementaciones en los artefactos. Con el spec aprobado, carga automáticamente hd-implement sin esperar invocación manual.
---

# HD — Fase 2: Spec y plan

Entrada: el resumen del entendimiento y la Q&A de `hd-discovery`. Salida: spec aprobado + planes listos para `hd-implement`.

(Un **spike** nunca llega acá: su salida fue una recomendación en hd-discovery. Si el usuario quiere llevarlo a código, arrancá el flujo completo desde discovery.)

**REGLA DURA: ni el spec ni los planes contienen LÓGICA ni implementaciones.** El código es del implementador; para eso es implementador.
**Única excepción (contratos):** los planes SÍ pueden fijar **firmas exactas, nombres de tipos, constantes, valores literales y formatos** cuando son el contrato que otras olas consumen (eso es precisamente la Ola 0). Firmas: sí. Comportamiento: en prosa. Lógica: nunca.

## Paso 1 — Confirmar el modo

- Si el usuario declaró el modo explícitamente, **respetalo**. Si tu análisis lo contradice fuerte, decilo una vez; si insiste, se hace como dice.
- Si no dijo nada, **decidí vos y anuncialo con el porqué**. Señales de MEGA CAMBIO: refactor de grandes superficies; del orden de 20+ archivos sustanciales; crear o borrar módulos o microservicios enteros; operaciones sobre datos sensibles o en masa; y la señal decisiva: **puede dejar el sistema inconsistente a mitad de camino**.
- Lo demás: **CAMBIO CHICO**.
- **Ratchet (unidireccional):** si en cualquier momento aparece complejidad oculta, el trabajo SUBE de modo: chico → mega. Frená, anuncialo, re-planificá. Nada baja de modo a mitad de camino.

### Si es mega cambio, avisá UNA sola vez:

> En este modo no hay garantía de que todo salga bien a la primera. Por eso el trabajo se parte en pasos chicos que se revisan uno por uno: es más barato encontrar un error en la ola 1 que en la ola 4, cuando ya hay código encima.

## Paso 2 — Ramas (antes de escribir nada)

- Para **cada repo involucrado**: proponé rama nueva basada en la actual; avisá sugiriendo **nombre** y **desde dónde** se crea. Si aprueba: creala. Si no: se trabaja desde donde está.
- En cambio chico la regla es la misma: se propone, el usuario decide.
- **Anotá el commit base de cada repo** (`git rev-parse HEAD` en cuanto la rama queda definida) en el `spec.md` (`commit base: <sha>`) y en el ledger: es el punto exacto desde el que se acumulan los commits del trabajo (uno por plan) y a donde se vuelve si hay que deshacer todo. Sin ese SHA, el trabajo no se puede medir ni restaurar.

## Paso 3 — Escribir el spec

Creá `.hd/<nombre-del-trabajo>/` en el repo principal y escribí `spec.md` siguiendo el template empaquetado en esta skill (`templates/spec-template.md`, relativo a este SKILL.md): resumen del entendimiento, qué, por qué, criterios de aceptación verificables, riesgos y mitigaciones, **Q&A completo**, y el estado de datos en producción si aplica.

En modo **cambio chico**: mismo esqueleto, contenido breve. El rigor no se negocia; la burocracia sí.

## Paso 4 — Partir el trabajo en planes (paralelismo computable)

Un archivo por plan en `.hd/<nombre-del-trabajo>/plans/plan-NN-<nombre>.md` con `templates/plan-template.md`.

**Cada plan DEBE declarar, con valores exactos (sin globs, sin "y archivos relacionados"):**
- **Archivos**: cuáles crea y cuáles modifica.
- **Interfaces**: qué **consume** de planes anteriores y qué **produce** para los posteriores (firmas exactas).
- **Depende de**: qué olas anteriores. Nunca de otro plan de su misma ola.

**Paralelismo por default:** el objetivo de la partición es que **cada ola ejecute 2 o más planes en paralelo**. No es una excepción a justificar: es el diseño normal. Una partición secuencial "porque no me dio la gana" es un defecto de planificación, no una decisión.

**Dos planes son seguros en la misma ola SOLO si TODO se cumple (se calcula, no se intuye):**
1. Sus conjuntos de archivos son **disjuntos**.
2. Lo que uno **produce** no es lo que el otro **consume**.
3. No comparten estado mutable (misma base de datos, lock, puerto, archivo de config, servicio externo).
4. Ninguno **depende** del otro.
5. Ninguno tiene tests que toquen una base de datos compartida.

Si dudás de un par: ese par no va en la misma ola. La duda es sobre **la pareja**, no sobre la ola entera: poné el plan dudoso en otra ola y seguí buscando paralelismo para el resto. Una ola extra es barata; dos implementadores pisándose, no. Si al mergear aparece un conflicto entre planes de la misma ola, la planificación de la ola estuvo mal: serializá y reaprendé el criterio.

**Re-partición antes de presentar (obligatoria):** con los planes ya escritos, hacé una pasada de re-batching: por cada ola que quedó con **un solo plan**, revisá qué plan de otra ola podría entrar (mirando Archivos / Interfaces / Depende de) y mové lo que se pueda. Repetí hasta que no quede ninguna ola de un solo plan sin dependencia dura. **Una ola de un solo plan solo es válida con dependencia dura**, y queda anotada en el plan (`Depende de: Ola N — <motivo>`): la Ola 0 de contratos, la ola de datos, o un plan cuyo output consume otro.

**Estructura de olas (mega cambio):**
1. **Ola 0 — Contratos**: tipos, esquemas, firmas, esqueleto inicial, migraciones. **Va sola y se revisa antes de seguir**: contrato mal = todo lo demás mal.
2. **Olas siguientes**: **2 o más planes en paralelo por default**, independientes entre sí; dependencias solo a olas anteriores. Una ola de un plan solo se justifica con una dependencia dura anotada en el plan.
3. **Ola de datos**: todo lo que mueve datos existentes va en **su propia ola, al final, nunca en paralelo**. Antes de correrla: preguntar si hay datos en producción, pedir confirmación, **exigir respaldo y prueba en seco**.

**Modo cambio chico:** un único `plans/plan-01-<nombre>.md`, breve, mismo esqueleto. Sin olas, sin worktrees.

## Paso 5 — Aprobación y handoff

- Mostrá: modo, spec, y la división en planes/olas.
- **Esperá aprobación explícita** antes de implementar nada. **Esta aprobación es la única pausa del paso.**
- Aprobado → **cargá la skill `hd-implement` VOS MISMO** (herramienta de skills, o leé su SKILL.md) y **empezá a ejecutarla de inmediato**: crear el `ledger.md`, los worktrees de la primera ola, y el dispatch de implementadores. El handoff es una transición automática: no anuncies "siguiente fase: hd-implement" y te quedes quieto.

## Racionalizaciones comunes (y su realidad)

| Excusa | Realidad |
|--------|----------|
| "Es chico, salteamos el spec" | Chico significa spec breve, no ausente. |
| "Estos dos planes seguro no se pisan" | El paralelismo se calcula con Files/Interfaces, no se adivina. |
| "Los separo en olas de un plan para no complicarla" | El paralelismo es el diseño por default. Una ola de un plan sin dependencia dura es una partición mal hecha: re-partí hasta que cada ola pueda correr 2 o más planes. |
| "Esta ola tiene que ir sola, es más simple" | Ir sola se justifica con una dependencia dura (contratos, datos, output consumido), no con comodidad. La comodidad de un plan no cancela el tiempo de los demás. |
| "Pongo el código en el plan así el implementador no se equivoca" | Plan con lógica = implementador redundante y plan envejecido. Firmas exactas sí; lógica nunca. |
| "Ya tenemos plan, empecemos mientras el usuario lo lee" | El gate es la aprobación, no la longitud del spec. Presentar y arrancar en la misma respuesta es saltear el gate. |
| "Creció, pero re-clasificar es perder el trabajo hecho" | El trabajo hecho se conserva; lo que cambia es la maquinaria. El ratchet no tiene reversa. |
