---
name: hd-spec
description: Fase 2 del framework Hiper-driven (HD). Usar después de hd-discovery, con las dudas resueltas. Confirma el modo (directo, cambio chico o mega cambio, con ratchet unidireccional), crea la rama, escribe el spec.md (qué, por qué, criterios de aceptación, Q&A) y parte el trabajo en planes con comportamiento esperado, interfaces y footprints de código. Un revisor independiente audita spec y planes; con una corrección y su confirmación, la implementación sigue en el mismo flujo. No hay tests (la verificación es build + lint + estándares, y el comportamiento lo audita el revisor). Nunca lógica ni implementaciones en los artefactos.
---

# HD — Fase 2: Spec y plan

Entrada: el resumen del entendimiento y la Q&A de `hd-discovery`. Salida: `spec.md` + planes + `review-progress.md` (con el veredicto de artefactos), listos para implementar en el mismo flujo.

(Un **spike** nunca llega acá: su salida fue una recomendación en hd-discovery. Si el usuario quiere llevarlo a código, arrancá el flujo completo desde discovery.)

**REGLA DURA: ni el spec ni los planes contienen LÓGICA ni implementaciones.** El código es del implementador; para eso es implementador.
**Única excepción (contratos):** los planes SÍ pueden fijar **firmas exactas, nombres de tipos, constantes, valores literales y formatos** cuando son el contrato que otras olas consumen (eso es precisamente la Ola 0). Firmas: sí. Comportamiento: en prosa. Lógica: nunca.

**Un solo spec.** No hay cadena de specs ni numeración `spec-1`, `spec-2`. Si el trabajo es grande, se parte en **olas y planes**; el spec sigue siendo uno. La implementación sigue en la misma sesión, en cadena: no hay prompt ni conversación nueva.

**No hay tests.** HD no escribe tests: ni el spec los pide, ni los planes los declaran, ni el implementador los crea. Lo que el plan fija es el **comportamiento esperado en prosa** (entradas, salidas, casos borde, errores) y los **criterios de aceptación**; el revisor audita el código contra ese texto. Si en discovery apareció una suite existente, se respeta y no se toca, pero el trabajo no agrega tests.

## Paso 1 — Decidir el modo

- Si el usuario declaró el modo explícitamente, **respetalo**. Si tu análisis lo contradice fuerte, decilo una vez; si insiste, se hace como dice.
- Si no dijo nada, **decidí vos y anuncialo con el porqué**, con esta escalera:

| | Directo | Cambio chico | Mega cambio |
|---|---|---|---|
| **Cuándo** | 1-2 archivos, sin contratos nuevos que otros consuman, sin datos | Unas pocas piezas acotadas, un plan | 20+ archivos, módulos enteros, contratos compartidos, datos sensibles |
| **Olas** | ninguna | ninguna | varias |
| **Worktrees** | uno | uno | uno por ola |
| **Verificación** | build + lint + estándares | build + lint + estándares | build + lint + estándares por ola |
| **Revisor de código** | obligatorio | obligatorio | obligatorio, por ola |

El **revisor de artefactos** entra siempre, en los tres modos, al terminar los planes.

- **El default es el más chico que no mienta.** Un trabajo que entra en 1-2 archivos y no cambia contratos va a **directo**: la maquinaria de olas no se amortiza con un plan, y el gate y la evidencia son los mismos.
- Señales de **MEGA CAMBIO**: refactor de grandes superficies; del orden de 20+ archivos sustanciales; crear o borrar módulos o microservicios enteros; operaciones sobre datos sensibles o en masa; y la señal decisiva: **puede dejar el sistema inconsistente a mitad de camino**.
- **Ratchet (unidireccional):** si en cualquier momento aparece complejidad oculta, el trabajo SUBE de modo: directo → chico → mega. Frená, anuncialo, re-planificá. Nada baja de modo a mitad de camino.

### Si es mega cambio, avisá UNA sola vez:

> En este modo no hay garantía de que todo salga bien a la primera. Por eso el trabajo se parte en pasos chicos que se revisan uno por uno: es más barato encontrar un error en la ola 1 que en la ola 4, cuando ya hay código encima.

## Paso 2 — Ramas (antes de escribir nada)

- **Rama**: si el humano ya indicó una, usala. Si no, y estás en la rama default, **creá `hd/<trabajo>`** desde ahí; si ya estás en una rama no-default, usá esa. Anunciálo en una línea: la aprobación del trabajo ya ocurrió en el resumen de discovery, no hay una segunda pausa acá. Nunca trabajes sobre `main`/default salvo que el humano lo haya pedido. La regla es la misma en los tres modos.
- **Anotá en el spec y en el ledger, por repo**: `Rama: <nombre> (nueva | existente | default)`, `base: <rama>`, `commit base: <sha>` (la referencia del diff total y del historial por ola) y `Remote: <origin> | sin remote`.
- **Anotá los comandos de verificación del repo**: `Build:` (build/typecheck), `Lint:` (lint + formato) y, si existe, `Estándares:` (el comando único de chequeo del repo: `make check`, `pnpm verify`, `npm run check`). Los usa `hd-implement` para el baseline y el gate por ola. Si el repo no tiene alguno, se anota `no aplica` — nunca se inventa.
- **Respaldo temporal — se deriva de la rama, no se pregunta aparte.** Si hay remote y la rama de trabajo no es la default, `hd-backup/<trabajo>` queda habilitado: los commits por ola se suben ahí apenas se crean. Es **temporal**: `hd-close` la borra al cerrar. Si se trabaja sobre la default o sobre una rama ajena → `Respaldo: no aplica (<motivo>)`.
  - Anotá el flag en el `spec.md` y en el ledger, **por repo**: `Respaldo: habilitado (hd-backup/<trabajo>) | no aplica — <motivo>`.
  - Verificá que el repo tiene remote (`git remote -v`) y anotá cuál (`Remote: origin`). Si **no hay remote**, no hay respaldo: anotá `no aplica — el repo no tiene remote` y seguí igual.

## Paso 3 — Escribir el spec

Creá `.hd/<nombre-del-trabajo>/` en el repo principal y escribí **`spec.md`** siguiendo el template empaquetado en esta skill (`templates/spec-template.md`, relativo a este SKILL.md): resumen del entendimiento, qué, por qué, criterios de aceptación verificables, riesgos y mitigaciones, **Q&A completo**, y el estado de datos en producción si aplica.

Los **criterios de aceptación** no son decoración: sin tests, son la checklist con la que el humano prueba el trabajo al final de la fase 4 y el respaldo del revisor cuando el plan se queda corto. Cada criterio tiene que poder responderse con **sí/no** y con evidencia mirando el sistema.

En modo **directo**: mismo esqueleto, contenido mínimo. En **cambio chico**: mismo esqueleto, contenido breve. El rigor no se negocia; la burocracia sí.

## Paso 4 — Partir el trabajo en planes

Un archivo por plan en `.hd/<nombre-del-trabajo>/plans/plan-NN-<nombre>.md` con `templates/plan-template.md`.

**Cada plan DEBE declarar, con valores exactos (sin globs, sin "y archivos relacionados"):**
- **Archivos**: cuáles crea, cuáles modifica y cuáles elimina (todos de código; no hay archivos de tests).
- **Interfaces**: qué **consume** de planes anteriores y qué **produce** para los posteriores (firmas exactas).
- **Depende de**: qué olas anteriores. Nunca de otro plan de su misma ola.
- **Comportamiento esperado**: en prosa — entradas y salidas exactas, casos borde, errores y códigos, y qué NO cambia. Es la fuente del revisor: si falta algo, el plan no está listo.

**El paralelismo se calcula, no se intuye.** Dos planes son seguros en la misma ola SOLO si:
1. Sus archivos de **código** son disjuntos.
2. Lo que uno **produce** no es lo que el otro **consume**.
3. No comparten estado mutable (misma base de datos, lock, puerto, archivo de config, servicio externo).
4. Ninguno **depende** del otro.
5. Ninguno toca la configuración que el otro necesita para compilar o pasar el lint (build, tsconfig, linter, formatter, CI).

**El default es un plan por ola.** Agrupá dos o más planes en una ola solo cuando **todos** los criterios de arriba se cumplan sin dudas. Ante la duda, serializá. Una ola serial extra es barata; un paralelismo mal calculado cuesta una corrección y contamina el resultado. **No fuerces paralelismo**: lo que no se permite es que dos planes de la misma ola se pisen, ni un plan de relleno.

**Estructura de olas (mega cambio):**
1. **Ola 0 — Contratos** (solo si hay contratos nuevos que otras olas consumen): tipos, esquemas, firmas, esqueleto inicial, migraciones. **Va sola y se revisa antes de seguir**: contrato mal = todo lo demás mal.
2. **Olas siguientes**: planes independientes entre sí. **Default: un plan por ola.** Agrupá en paralelo solo cuando la matriz de footprints sea inequívoca; la ola serial es más barata que la ola mal planificada.
3. **Ola de datos**: todo lo que mueve datos existentes va en **su propia ola, al final, nunca en paralelo**. Antes: confirmar datos en producción, **respaldo y prueba en seco**.

Si no hay contratos nuevos que consuman otras olas, **no inventes una Ola 0**.

**Modo cambio chico:** un único `plans/plan-01-<nombre>.md`, breve, mismo esqueleto. Sin olas.

**Modo directo:** un único `plans/plan-01-<nombre>.md`, mínimo. Sin olas, sin Ola 0 (si el trabajo no define contratos nuevos). Si al escribirlo aparecen contratos compartidos o más de dos archivos, **subí de modo** — el ratchet es unidireccional.

## Paso 5 — Revisión de spec y planes

Antes de implementar, un **revisor independiente de artefactos** audita el spec y los planes. Es un subagente distinto del orquestador (que es el autor) y **no ejecuta comandos**: lee los archivos.

Pasale **rutas**: `spec.md` y cada plan. El revisor busca, contra el resumen/Q&A de discovery:

1. **Coherencia con lo aprobado**: el spec no inventa alcance ni contradice el resumen/Q&A.
2. **Criterios de aceptación verificables**: cada uno se responde sí/no mirando el sistema.
3. **Planes completos**: archivos exactos y disjuntos, interfaces produce/consume consistentes, dependencias por ola correctas.
4. **Comportamiento esperado**: entradas, salidas, casos borde, errores y qué no cambia; sin huecos que obliguen al implementador a adivinar.
5. **Sin lógica ni implementaciones**: solo contratos (firmas, tipos, constantes, formatos) cuando son Ola 0.
6. **Estructura**: Ola 0 sola si hay contratos, datos al final y en solitario, paralelismo justificado por footprints.
7. **Modo correcto** (ratchet) y riesgos/datos cubiertos.
8. **Implementable**: rutas, comandos Build/Lint/Estándares, rama y base anotados.

Veredicto **APROBADO** o **DENEGADO** con evidencia en `.hd/<trabajo>/review-progress.md`, bloque `Spec y planes` (veredicto, hallazgos con archivo y qué falta para pasar a verde).

**Corrección (una sola):** si hay hallazgos, corregí los artefactos —un hallazgo, un cambio; sin ampliar alcance— y pedile al revisor **una confirmación acotada a los hallazgos**, no una re-auditoría completa. Verde → seguí. Si sigue rojo → **freno real** con diagnóstico.

Con el veredicto verde, commiteá `hd(<trabajo>): spec y planes` (spec, planes y `review-progress.md`) y **cargá la skill `hd-implement` VOS MISMO**, en el mismo flujo. Nada de entregar prompts ni abrir una conversación nueva.

## Continuidad

La fuente es `.hd/<trabajo>/`: `spec.md`, los planes, `review-progress.md` y el ledger. La implementación arranca en la misma sesión al terminar la revisión de artefactos; no hay prompt ni handoff. Si el trabajo se retoma tras una compactación, releé esos archivos y el ledger, no tu memoria.

**No inventes archivos de memoria paralelos** (`memory/facts.md`, `INDEX.md`, etc.) para guardar el estado del trabajo. Si el harness tiene memoria, que apunte al ledger y al spec, no que los reemplace.

## Racionalizaciones comunes (y su realidad)

| Excusa | Realidad |
|--------|----------|
| "Es chico, salteamos el spec" | Chico significa spec breve, no ausente. |
| "Es chico, pero lo mando a mega por las dudas" | La maquinaria de olas no se amortiza con un plan: mandalo a directo o a chico. El gate y la evidencia no cambian. |
| "Estos dos planes seguro no se pisan" | El paralelismo se calcula con Archivos/Interfaces, no se adivina. |
| "Una ola de un plan es un defecto" | No: es el default sano. El defecto es forzar paralelismo. |
| "Todo trabajo real es mega, por las dudas" | El criterio es "¿puede dejar el sistema inconsistente a mitad de camino?", no el tamaño percibido. Si no puede, es chico o directo. |
| "Pongo el código en el plan así el implementador no se equivoca" | Plan con lógica = implementador redundante y plan envejecido. Firmas exactas sí; lógica nunca. |
| "Sin tests, el comportamiento esperado es opcional" | Es lo único que el revisor tiene para comparar. Sin él, la auditoría es a ciegas y la corrección, adivinanza. |
| "Agrego unos tests al plan, total no molestan" | El framework no escribe tests. Un test sin suite, sin convención y sin dueño es deuda con forma de red de seguridad. |
| "Ya tenemos plan, empecemos ya" | El gate es el revisor de artefactos: un spec denegado no se implementa. |
| "El spec ya está aprobado en el resumen, no hace falta auditarlo" | La aprobación cubre el qué; el revisor cubre la coherencia, los huecos y la implementabilidad. |
| "El spec lo escribí yo, lo reviso yo mismo" | El revisor de artefactos es distinto del autor: la autorevisión no es evidencia. |
| "Parto el trabajo en dos specs" | No: un spec. Si es grande, se parte en olas y planes. |
| "Creció, pero re-clasificar es perder el trabajo hecho" | El trabajo hecho se conserva; lo que cambia es la maquinaria. El ratchet no tiene reversa. |
