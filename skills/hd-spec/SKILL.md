---
name: hd-spec
description: Fase 2 del framework Hiper-driven (HD). Usar después de hd-discovery, con las dudas resueltas. Confirma el modo (directo, cambio chico o mega cambio, con ratchet unidireccional), crea las ramas, escribe el spec.md (qué, por qué, criterios de aceptación, Q&A) y parte el trabajo en planes con contrato de comportamiento y archivos de tests separados. Al aprobar, escribe spec-prompt.md y se detiene; la implementación arranca en una conversación nueva, no en la misma sesión. Nunca lógica ni implementaciones en los artefactos.
---

# HD — Fase 2: Spec y plan

Entrada: el resumen del entendimiento y la Q&A de `hd-discovery`. Salida: `spec.md` + planes + `spec-prompt.md` listos para implementar en una conversación nueva.

(Un **spike** nunca llega acá: su salida fue una recomendación en hd-discovery. Si el usuario quiere llevarlo a código, arrancá el flujo completo desde discovery.)

**REGLA DURA: ni el spec ni los planes contienen LÓGICA ni implementaciones.** El código es del implementador; para eso es implementador.
**Única excepción (contratos):** los planes SÍ pueden fijar **firmas exactas, nombres de tipos, constantes, valores literales y formatos** cuando son el contrato que otras olas consumen (eso es precisamente la Ola 0). Firmas: sí. Comportamiento: en prosa. Lógica: nunca.

**Un solo spec.** No hay cadena de specs ni numeración `spec-1`, `spec-2`. Si el trabajo es grande, se parte en **olas y planes**; el spec sigue siendo uno. La implementación arranca en una conversación nueva con el prompt; no se ejecuta en la sesión donde se planificó.

## Paso 1 — Confirmar el modo

- Si el usuario declaró el modo explícitamente, **respetalo**. Si tu análisis lo contradice fuerte, decilo una vez; si insiste, se hace como dice.
- Si no dijo nada, **decidí vos y anuncialo con el porqué**, con esta escalera:

| | Directo | Cambio chico | Mega cambio |
|---|---|---|---|
| **Cuándo** | 1-2 archivos, sin contratos nuevos que otros consuman, sin datos | Unas pocas piezas acotadas, un plan | 20+ archivos, módulos enteros, contratos compartidos, datos sensibles |
| **Olas** | ninguna | ninguna | varias |
| **Worktrees** | uno | dos (B) o uno (A) | dos por ola |
| **Tests** | A + auditor | B, o A + auditor | B, salvo Ola 0 y datos |
| **Revisor** | solo si toca contratos | auditoría simple | por ola |

- **El default es el más chico que no mienta.** Un trabajo que entra en 1-2 archivos y no cambia contratos va a **directo**: la maquinaria de olas no se amortiza con un plan, y el gate y la evidencia son los mismos.
- Señales de **MEGA CAMBIO**: refactor de grandes superficies; del orden de 20+ archivos sustanciales; crear o borrar módulos o microservicios enteros; operaciones sobre datos sensibles o en masa; y la señal decisiva: **puede dejar el sistema inconsistente a mitad de camino**.
- **Ratchet (unidireccional):** si en cualquier momento aparece complejidad oculta, el trabajo SUBE de modo: directo → chico → mega. Frená, anuncialo, re-planificá. Nada baja de modo a mitad de camino.

### Si es mega cambio, avisá UNA sola vez:

> En este modo no hay garantía de que todo salga bien a la primera. Por eso el trabajo se parte en pasos chicos que se revisan uno por uno: es más barato encontrar un error en la ola 1 que en la ola 4, cuando ya hay código encima.

## Paso 2 — Ramas (antes de escribir nada)

- Para **cada repo involucrado**: proponé rama nueva basada en la actual; avisá sugiriendo **nombre** y **desde dónde** se crea. Si aprueba: creala. Si no: se trabaja desde donde está.
- En cambio chico la regla es la misma: se propone, el usuario decide.
- **Anotá el commit base de cada repo** (`git rev-parse HEAD` en cuanto la rama queda definida) en el `spec.md` (`commit base: <sha>`) y en el ledger: es el punto exacto al que `hd-review` colapsa los commits del trabajo al final. Sin ese SHA, el colapso no se puede hacer con precisión.
- **Anotá los comandos de verificación del repo**: `Build:` (build/typecheck), `Suite:` (suite completa), `Tests:` (comando dirigido a los tests de una ola) y **`Suite prerequisites:`** (Docker Compose, base de datos, servicios). Los usa `hd-implement` para el baseline, el gate por ola y la verificación final.
- **Push de seguridad — decidilo acá, junto con la rama.** El respaldo va a una **rama de respaldo** (`hd-backup/<trabajo>`), no a la rama de trabajo: los commits por ola se suben ahí apenas se crean, y la rama de trabajo se colapsa limpia al final. Si el humano aprueba la rama dedicada → **`push de seguridad: habilitado (rama de respaldo: hd-backup/<trabajo>)`**. Si se trabaja sobre la rama por defecto (`main`/`master`) o sobre una rama ajena → **`push de seguridad: deshabilitado`**: nada sale del repo hasta el cierre.
  - Anotá el flag en el `spec.md` y en el ledger, **por repo**: `Rama de trabajo: <nombre> (push de seguridad: habilitado — respaldo en hd-backup/<trabajo> | deshabilitado — <motivo>)`.
  - Verificá que el repo tiene remote (`git remote -v`) y anotá cuál (`Remote: origin`). Si **no hay remote**, el push de seguridad no se puede hacer: anotá `deshabilitado — el repo no tiene remote` y seguí igual.

## Paso 3 — Escribir el spec

Creá `.hd/<nombre-del-trabajo>/` en el repo principal y escribí **`spec.md`** siguiendo el template empaquetado en esta skill (`templates/spec-template.md`, relativo a este SKILL.md): resumen del entendimiento, qué, por qué, criterios de aceptación verificables, riesgos y mitigaciones, **Q&A completo**, y el estado de datos en producción si aplica.

En modo **directo**: mismo esqueleto, contenido mínimo. En **cambio chico**: mismo esqueleto, contenido breve. El rigor no se negocia; la burocracia sí.

## Paso 4 — Partir el trabajo en planes

Un archivo por plan en `.hd/<nombre-del-trabajo>/plans/plan-NN-<nombre>.md` con `templates/plan-template.md`.

**Cada plan DEBE declarar, con valores exactos (sin globs, sin "y archivos relacionados"):**
- **Archivos**: cuáles crea y modifica (código) y cuáles crea (tests); los dos conjuntos, separados.
- **Interfaces**: qué **consume** de planes anteriores y qué **produce** para los posteriores (firmas exactas).
- **Depende de**: qué olas anteriores. Nunca de otro plan de su misma ola.

**El paralelismo se calcula, no se intuye.** Dos planes son seguros en la misma ola SOLO si:
1. Sus archivos de **código** y de **tests** son disjuntos.
2. Lo que uno **produce** no es lo que el otro **consume**.
3. No comparten estado mutable (misma base de datos, lock, puerto, archivo de config, servicio externo).
4. Ninguno **depende** del otro.
5. Ninguno tiene tests que toquen una base de datos compartida.

**El default es un plan por ola.** Agrupá dos o más planes en una ola solo cuando **todos** los criterios de arriba se cumplan sin dudas. Ante la duda, serializá. Una ola serial extra es barata; un paralelismo mal calculado cuesta una corrección y contamina el resultado. **No fuerces parallelism**: lo que no se permite es que dos planes de la misma ola se pisen, ni un plan de relleno.

**Estructura de olas (mega cambio):**
1. **Ola 0 — Contratos** (solo si hay contratos nuevos que otras olas consumen): tipos, esquemas, firmas, esqueleto inicial, migraciones. **Va sola y se revisa antes de seguir**: contrato mal = todo lo demás mal. Usa **tests primero** (no autor de tests separado) **y auditor de tests**.
2. **Olas siguientes**: planes independientes entre sí. **Default: un plan por ola.** Agrupá en paralelo solo cuando la matriz de footprints sea inequívoca; la ola serial es más barata que la ola mal planificada.
3. **Ola de datos**: todo lo que mueve datos existentes va en **su propia ola, al final, nunca en paralelo**. Antes: confirmar datos en producción, **respaldo y prueba en seco**. Usa **tests primero** y auditor.

Si no hay contratos nuevos que consuman otras olas, **no inventes una Ola 0**.

**Modo cambio chico:** un único `plans/plan-01-<nombre>.md`, breve, mismo esqueleto. Sin olas.

**Modo directo:** un único `plans/plan-01-<nombre>.md`, mínimo. Sin olas, sin Ola 0 (si el trabajo no define contratos nuevos). Si al escribirlo aparecen contratos compartidos o más de dos archivos, **subí de modo** — el ratchet es unidireccional.

## Paso 5 — Aprobación y prompt

- Mostrá: modo, spec y la división en planes/olas.
- **Esperá aprobación explícita** antes de implementar nada. **Esta aprobación es la única pausa del paso.**
- Con la aprobación: actualizá `Estado: aprobado`, escribí **`spec-prompt.md`** con `templates/implement-prompt-template.md`, y commiteá `spec.md` + planes + prompt como checkpoint de planificación (`hd(<trabajo>): spec y planes aprobados`). Ese commit se colapsa en review.
- **Entregá el prompt al humano**: "Pegá este bloque en una conversación nueva para implementar". **No cargues `hd-implement` en esta sesión**: la implementación no se ejecuta donde se planificó.
- El prompt lleva: spec, planes, ledger, ramas/base, push de seguridad (rama de respaldo), flujo (B o A), baseline, orden de olas y la ruta de la evidencia. La ruta del spec la da el prompt: si un trabajo viejo usa `spec-2.md`, el prompt lo dice y el skill lo respeta.

## Continuidad: cómo retoma la conversación de implementación

La fuente es `.hd/<trabajo>/`: el prompt, el `spec.md`, los planes y el ledger. El prompt es la entrada; no hace falta la conversación anterior ni la memoria del harness. Si el prompt no existe, se genera uno mínimo desde el spec antes de arrancar.

**No inventes archivos de memoria paralelos** (`memory/facts.md`, `INDEX.md`, etc.) para guardar el estado del trabajo. Si el harness tiene memoria, que apunte al ledger y al spec, no que los reemplace.

## Racionalizaciones comunes (y su realidad)

| Excusa | Realidad |
|--------|----------|
| "Es chico, salteamos el spec" | Chico significa spec breve, no ausente. |
| "Es chico, pero lo mando a mega por las dudas" | La maquinaria de olas no se amortiza con un plan: mandalo a directo o a chico. El gate y la evidencia no cambian. |
| "Estos dos planes seguro no se pisan" | El paralelismo se calcula con Archivos/Interfaces, no se adivina. |
| "Una ola de un plan es un defecto" | No: es el default. Una ola de un plan es válida siempre; el defecto es forzar paralelismo. |
| "Todo trabajo real es mega, por las dudas" | El criterio es "¿puede dejar el sistema inconsistente a mitad de camino?", no el tamaño percibido. Si no puede, es chico o directo. |
| "Pongo el código en el plan así el implementador no se equivoca" | Plan con lógica = implementador redundante y plan envejecido. Firmas exactas sí; lógica nunca. |
| "Ya tenemos plan, empecemos mientras el usuario lo lee" | El gate es la aprobación, no la longitud del spec. |
| "Puedo implementar acá mismo, el spec está fresco" | La sesión de spec y la de implementación son distintas: el prompt es el handoff. Mezclar contextos es lo que el prompt evita. |
| "Parto el trabajo en dos specs" | No: un spec, un prompt. Si es grande, se parte en olas y planes. |
| "Creció, pero re-clasificar es perder el trabajo hecho" | El trabajo hecho se conserva; lo que cambia es la maquinaria. El ratchet no tiene reversa. |
