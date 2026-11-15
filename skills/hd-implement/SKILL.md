---
name: hd-implement
description: Fase 3 del framework Hiper-driven (HD). La conduce el agente principal en la misma conversación donde se escribió el paquete o en una nueva. Reconstruye el contexto, verifica el spec, el technical spec y los planes contra el código, arma las olas en waves.md pensando en paralelizar y despacha implementadores, revisores y fixers. El agente principal no escribe código de producción; escribe artefactos, revisa diffs, commitea y corre el gate. Cada ola se consolida, se commitea, pasa el gate, se revisa y se corrige una vez. Al terminar carga hd-review. No hay tests.
---

# HD — Fase 3: Implementación

Sos el **agente principal**. Recibís un paquete escrito antes, en esta misma conversación o en otra. Aunque tengas el chat a mano, **la fuente es el paquete**: releelo y verificá el código. Tu trabajo es reconstruir el contexto, verificar que el contrato se sostiene contra el código real, armar las olas y dirigir a los subagentes. **No escribís código de producción**: escribís artefactos, despachás, integrás, commiteás y corrés la evidencia.

## Entrada: la ruta del paquete

Si no te dan la ruta, pedila. No empieces desde un pedido vago: eso es discovery.

Validá que exista `.hd/<trabajo>/` con:

- `spec.md` y `technical_spec.md`;
- al menos un plan en `plans/`;
- `ledger.md`;
- `review-progress.md` con el bloque `Paquete (fase 2)` en **APROBADO**;
- el prototipo, si el spec dice que hay UI;
- la rama del spec, con el commit del paquete.

Si falta algo, el QA está denegado o el paquete es de una versión vieja sin `technical_spec.md`, **frená**: completá el paquete con `hd-spec` antes de implementar. No improvises el contrato.

Leé primero `technical_spec.md`, después `spec.md`, los planes, el README del prototipo, el ledger y el veredicto de QA. Si el technical spec no alcanza, abrí `discovery/` (notas y reportes), pero no lo leas todo por defecto. Por **ruta**, sin pegar todo en el chat.

## Subagentes

| Subagente | Qué hace | Qué no hace |
|---|---|---|
| **Agente principal** | Re-deriva, arma olas, despacha, integra, commitea, corre el gate, decide rulings | **No escribe código de producción** |
| **Implementador** (`dev-<plan>`) | Implementa su plan en su worktree | No commitea, no toca la rama, no escribe tests, no sale de sus archivos |
| **Revisor** (`revisor-<ola>`) | Lee el diff de la ola y emite veredicto | No corrige, no ejecuta builds, no participó de la ola |
| **Fixer** (`fixer-<ola>`) | Corrige los hallazgos de un gate o de una revisión | No rediseña, no escribe tests, no commitea, no amplía alcance |
| **Auditor de cierre** (`auditor-final`, en hd-review) | Audita el trabajo completo antes del cliente | No participó de ninguna ola |

**Independencia:** el que implementa no revisa, el que revisa no corrige, el que corrige no audita el cierre. El agente principal no reemplaza a ninguno: si hay que escribir código de producción, se despacha un subagente.

## Reglas duras

1. **No hay tests.** Ni unitarios, ni de integración, ni "uno chiquito". La verificación es build + lint + estándares, y la revisión semántica. Si el repo ya tenía tests, no los rompés ni los borrás, pero no agregás ninguno.
2. **Ninguna afirmación de éxito sin evidencia fresca en este turno.** "Compila" exige la salida del build que corriste vos, en la rama consolidada. La autoverificación del subagente no es evidencia.
3. **No le narrás el día a día al cliente.** Lo que encontrás va al ledger y a `waves.md`. Le hablás en un **freno real**, en el **final** y cuando te pregunta directamente.
4. **El agente principal no escribe código de producción.** Lo escriben los subagentes implementadores y fixers. El agente principal escribe artefactos, revisa diffs, commitea y corre el gate.
5. **Una corrección por gate.** Gate de ola: una. Revisión de ola: una. Auditoría de cierre: una. Si después de la corrección sigue rojo, es **freno real**, no una tercera pasada.
6. **La unidad es la ola.** Un commit por ola, un gate por ola, una revisión por ola. Los commits por ola se conservan.
7. **El alcance es del cliente.** Vos decidís lo técnico (orden, olas, interfaces internas, estrategia de worktrees); no cambiás el producto ni el alcance. Si hace falta, enmienda con el cliente.
8. **El paralelismo se calcula.** No se intuye. Default: un plan por ola.
9. **Nunca `--force`, nunca push a `main` ni a una rama ajena.** El único push automático es el respaldo a `hd-backup/<trabajo>` durante el trabajo, y la rama nueva al cerrar.

## Paso 0 — Re-derivación (antes de tocar nada)

El paquete se escribió antes, en esta conversación o en otra. Tu primer trabajo no es ejecutarlo: es **verificarlo**.

1. **Leé el paquete completo** por rutas: technical spec, spec, planes, prototipo, ledger, QA y, si hace falta, `discovery/`.
2. **Inspeccioná el código involucrado**: entry points, contratos, consumidores, modelo de datos, configuración, build/lint/estándares, convenciones de la casa. Podés usar un `research-<área>` para breadth, pero **vos verificás el camino crítico**: los archivos que los planes tocan y las interfaces que consumen.
3. **Contrastá las afirmaciones del paquete con el código**: ¿los archivos existen? ¿las firmas son las que dice? ¿los consumidores son todos? ¿el modelo de datos es ese? ¿los comandos de verificación son esos? ¿el prototipo refleja la UI actual?
4. **Revisá los footprints**: archivos disjuntos, interfaces producir/consumir, dependencias, lockfiles, configuración de build, generados, migraciones, estado mutable compartido.
5. **Buscá huecos**: contexto que el paquete no tenía, casos borde que el código revela, contratos que no cierran, deuda que va a morder.

Escribí todo en `.hd/<trabajo>/waves.md` (template en `templates/waves-template.md`), sección **Re-derivación**: qué verificaste, qué coincide, qué no, qué decidiste.

### Si algo no cuadra

- **Decisión técnica** (orden, ola, interfaz interna, estrategia de worktree): la tomás vos, la anotás como `Ruling: <qué> — <por qué> — <qué cuesta si te equivocaste>` en el ledger y en `waves.md`.
- **Duda de contexto** (el código no coincide con el spec, falta un dato, hay dos caminos válidos): preguntale al cliente. **Una pregunta por turno**, con opciones y la salida *"Necesito más contexto sobre lo que me estás preguntando antes de decidir"*. No adivines.
- **Cambio de alcance o de producto**: lo aprueba el cliente. Si lo aprueba, escribí una **Enmienda** en `spec.md` (fecha, qué, por qué, impacto) y en `waves.md`, y actualizá el plan afectado con un anexo. Si es un trabajo nuevo o mucho más grande, **no lo absorbas**: mandá al cliente a discovery.
- **Paquete inconsistente**: si el QA aprobó algo que el código desmiente, frená y reportá; no ejecutes un contrato roto.

## Paso 1 — Modo y ratchet

Confirmá el modo del spec. Si la realidad es más grande, **subí**: directo → chico → mega. Nunca bajes. Anunciálo una vez en `waves.md`.

- **Directo / cambio chico**: una sola ola.
- **Mega cambio**: varias olas, Ola 0 si hay contratos, ola de datos al final.

## Paso 2 — Rama, base y baseline

- **Rama**: verificá que estés en la rama del spec. Si no, y el árbol está limpio, cambiate; si no existe, frená. Nunca trabajes sobre la default.
- **Base**: el commit del paquete. Verificá que `git status` esté limpio y que `HEAD` sea el commit base (o el último commit del trabajo si retomás).
- **Baseline**: con el árbol limpio, corré **build, lint y estándares una vez** y registrá los fallos conocidos (nombre + firma). En la rama, no en un worktree.
  - Si el baseline **no compila** en los módulos que el trabajo toca: **freno real**.
  - Si el lint falla en una porción grande del repo (más de ~20% de los archivos): el baseline no sirve como oráculo; **freno real**.
  - Si el repo no tiene build/lint/estándares: `no aplica` y se anota; la ola no puede declarar verde esa capa, se reporta.
- Anotá en el ledger: `Baseline: <sha> — <n> hallazgos (<firmas>)`.

### Si el trabajo toca varios repos

- Cada repo tiene su rama, su base, su remote y su baseline; anotá todo por repo en el spec, el ledger y `waves.md`.
- Un plan no debería tocar dos repos; si lo hace, partilo o justificalo como un cambio de contrato coordinado.
- El gate se corre en cada repo tocado; una ola está verde solo si todos sus repos están verdes.
- Los worktrees y los commits se hacen por repo.

## Paso 3 — `waves.md`: el plan de olas

**La propuesta de olas del paquete es una propuesta.** La fuente autoritativa es tu `waves.md`. Podés re-olear, reordenar y partir tareas dentro de un plan; no podés cambiar el alcance ni los archivos de un plan sin enmienda.

Armá la matriz:

| Plan | Archivos | Produce | Consume | Depende | Datos | Lockfile / build |
|---|---|---|---|---|---|---|

Reglas:

- **Ola 0 — contratos**: solo si hay contratos nuevos que otras olas consumen. Va sola y se revisa antes de lanzar la Ola 1.
- **Default: un plan por ola.** Agrupá en paralelo solo si se cumple TODO: archivos disjuntos, sin producir/consumir entre ellos, sin estado mutable compartido, sin dependencia, sin tocar la misma configuración de build/lint, sin cambios de dependencias o lockfiles.
- **Dependencias y lockfiles**: un plan que agrega/cambia dependencias va **solo**, en su propia ola, y la instalación la hace el agente principal antes de despachar (una instalación a la vez).
- **Generados y archivos compartidos** (barrels, rutas, registros, configuración): si dos planes tocan el mismo archivo, no van en paralelo.
- **Máximo ~4 planes por ola.** Más que eso no se integra ni se revisa bien, aunque los archivos sean disjuntos. Si hay más, partí en olas secuenciales.
- **Ola de datos**: todo lo que mueve datos existentes va al final, sola, nunca en paralelo. Antes: confirmación de datos en producción del cliente, respaldo y prueba en seco.
- **Si dudás, serializá.** Una ola serial extra es barata; un paralelismo mal calculado cuesta una corrección y contamina el resultado.

Anotá cada ola con: planes, depende de, subagentes, worktrees, por qué va en paralelo, estado, commit, gate y revisión. Actualizá el archivo a medida que avanzás.

## Paso 4 — El ciclo de una ola

### 1. Preparar los worktrees

**Un worktree por plan** (no por ola): cada implementador trabaja aislado y su autoverificación no ve los archivos a medio escribir de otro.

```
git worktree add --detach .git/hd-wt/<trabajo>/ola<N>-plan<NN> <base-de-la-ola>
```

- Los worktrees viven en `.git/hd-wt/<trabajo>/`, nunca dentro del árbol: un worktree bajo `.hd/` aparece como directorio sin trackear y `git add -A` se lo lleva.
- **Symlinks de dependencias** en vez de reinstalar: `node_modules`, `.venv`, `vendor`, `target/`.
- Todos los worktrees de la ola salen de la **misma base** (el HEAD de la rama en el momento del dispatch). Anotá los SHAs.
- Si la ola cambia dependencias, no es una ola paralela: el agente principal instala y commitea el lockfile antes, o el plan va solo.

### 2. Despachar a los implementadores

Lanzá todos los agentes de la ola en **un solo mensaje**, cada uno con **rutas**, no con contenido: su plan, el spec, el technical spec, el README del prototipo, el worktree y los contratos de ola 0. Nada de historia de la sesión.

**Contrato del implementador:**

1. Escribe **solo código de producción**, solo en los archivos de su plan. No crea tests, scripts de verificación que queden en el repo, ni archivos fuera de su footprint.
2. Implementa según su plan + el spec + el technical spec + los contratos. No rediseña, no "mejora" fuera del plan, no cambia el alcance.
3. Respeta las convenciones del repo: linter, formatter, nombres, estructura, manejo de errores.
4. **Se autoverifica en su worktree, y solo ahí**: compila/typechea y corre el lint sobre sus archivos. **No commitea, no toca la rama, no aplica migraciones, no levanta servicios.** Su salida no es evidencia.
5. **No deja restos**: nada de `console.log`/`print` de debug, código comentado, TODOs sin dueño ni temporales.
6. Si el plan no dice qué pasa en un caso borde, **reporta `NECESITA_CONTEXTO`**; no inventa comportamiento ni un test que lo fije.
7. Reporta en `.hd/<trabajo>/reports/plan-NN.md` del repo principal (no en el worktree): estado (`LISTO` / `LISTO_CON_DUDAS` / `NECESITA_CONTEXTO` / `TRABADO`), archivos tocados, decisiones y la salida de su autoverificación (comandos y resultado, en 5 líneas).

Nombrá a cada agente `dev-<plan>` (`dev-plan-01`, …) o por especialidad (`dev-backend`, `dev-frontend`). Un nombre claro evita que dos agentes se pisen.

### 3. Revisar reportes y footprints

Antes de traer nada:

```
git -C <wt> status --short
```

Contrastá contra los `Archivos` del plan. Si un implementador tocó un archivo fuera de su plan, creó tests o dejó restos, es violación de contrato: corregilo **una sola vez**. Si reincide, **freno real**.

### 4. Consolidar la ola

- **Commit de transporte por worktree**: el agente principal stagea **solo los archivos del plan** (creados, modificados y eliminados) y commitea en el worktree. Los subagentes no commitean; el commit de transporte es del agente principal.
- **Traé el código sin commitear**: `git cherry-pick -n <sha-wip>` por plan, en orden de plan. Cherry-pick y no merge: los worktrees salieron de la misma base y el merge siempre diverge. Como los archivos son disjuntos por contrato, no conflictúa; si conflictúa, la ola estuvo mal planificada: **frená y re-oleá**.
- **Commit de la ola**: `hd(<trabajo>): ola N — <qué entró>` (código + ledger + waves). **Va antes del gate, no después**: es la base real del gate y del fixer si algo falla. Lo hace el agente principal.
- **Respaldo**: si está habilitado, subí el commit a `hd-backup/<trabajo>` inmediatamente después del commit, antes del gate. Es un respaldo, no una aprobación. Si falla, anotá y seguí.

### 5. Gate de la ola

Corré en la rama consolidada, en este orden, con la salida a log:

1. **Build / typecheck**: el comando `Build:` del spec. Si no compila, la ola no existe.
2. **Lint / formato**: el comando `Lint:`. Sin errores nuevos; los del baseline con la misma firma se ignoran.
3. **Estándares**: si el repo tiene un comando único de chequeo (`make check`, `pnpm verify`, `npm run check`), ese es el gate. Si no, lo que el linter no puede decidir lo audita el revisor.

**Si hay fallos nuevos**:

- Triageá: código mal vs convención mal vs entorno.
- Lanzá **UNA** corrección: un `fixer-<ola>` en un worktree desde el HEAD de la ola, con **todos** los fallos, la ruta del plan y `hd-debug` obligatorio. Causa raíz primero; un cambio por hipótesis; no rediseña, no agrega alcance, no escribe tests, no commitea. Reporta en `.hd/<trabajo>/reports/fixer-<ola>-gate.md` del repo principal.
- Consolidá con `cherry-pick -n`, commit `hd(<trabajo>): ola N — corrección de gate`, respaldá ese commit y re-corré el gate **una vez**.
- Si sigue rojo: **freno real**. No hay segunda corrección.

### 6. Revisión de la ola

Con el gate verde, lanzá un `revisor-<ola>` **independiente**: no implementó esta ola, no la corrigió, no es el agente principal.

Pasale por rutas: el SHA de la ola (y el de la corrección si hubo), las rutas de los planes, el spec, el technical spec, el prototipo, el estándar del repo y los logs del gate. Si el revisor no puede ejecutar git, dejale el diff en `.hd/<trabajo>/logs/ola-N-diff.patch` (`git diff <base>..<commit> -- <rutas>`) y pasale la ruta. El revisor **lee**, no corrige, no corre builds.

El revisor busca, contra spec, technical spec y plan:

1. **Seguridad**: inyecciones, secretos, validaciones faltantes, auth esquivable.
2. **Bugs lógicos**: bordes, flujos incompletos, errores silenciados.
3. **Trampas del lenguaje y librerías**: concurrencia, recursos sin cerrar, errores típicos del stack.
4. **Desviaciones**: todo lo implementado se traza al spec y a un plan; todo lo prometido está implementado. Lo que sobra y lo que falta se reporta.
5. **Comportamiento esperado**: ¿hace lo que dice el plan, con entradas, salidas, casos borde y errores? **Esto reemplaza a los tests.**
6. **Prototipo**: si hay UI, ¿la implementación respeta los flujos, estados y componentes aprobados?
7. **Estándares y calidad**: convenciones, manejo de errores, duplicación evitable, complejidad, dependencias nuevas sin justificar, restos de debug, tests agregados (prohibido).
8. **Footprints**: archivos fuera del plan, archivos compartidos tocados, generados modificados.

Veredicto **APROBADO** o **DENEGADO** en `review-progress.md`, bloque de la ola, con hallazgos por archivo:línea, severidad y qué falta para pasar a verde. Nada de "LGTM".

**Si deniega**:

- Un solo `fixer-<ola>` con **todos** los hallazgos en un mismo prompt, `hd-debug` obligatorio, guarda de alcance (un hallazgo, un cambio; nada de refactors colados). No escribe tests. Reporta en `.hd/<trabajo>/reports/fixer-<ola>-review.md` del repo principal.
- Consolidá, commit `hd(<trabajo>): ola N — corrección de revisión`, respaldá, re-corré el gate y pedile al revisor **una confirmación acotada a los hallazgos**, no una re-auditoría completa.
- Si sigue denegado o el gate vuelve a fallar: **freno real**. No hay segunda ronda.

### 7. Cerrar la ola

- Actualizá el ledger: `Ola N: base <sha>`, `worktrees`, `autoverificación`, `consolidada <sha>`, `gate <resultado>`, `review <veredicto>`, `corrección <sha>`, `Push: ...`.
- Actualizá `waves.md`: estado `cerrada`, commit, gate, review.
- Borrá los worktrees de la ola (`git worktree remove --force` + `git worktree prune`). Ningún worktree sobrevive a su ola.
- Pasá a la siguiente ola.

**Si una ola no cierra, no se lanza la siguiente.** La dependencia no es solo de archivos: es de evidencia. La ola siguiente espera a que la anterior tenga gate verde, revisión aprobada y worktrees borrados.

## Ola 0 y ola de datos

- **Ola 0 (contratos)**: va sola, con un implementador y su worktree, y se revisa antes de lanzar la Ola 1. Los contratos son código: no los escribe el agente principal.
- **Ola de datos**: última, sola, nunca en paralelo. Antes de aplicar nada: confirmación del cliente de que hay datos en producción, respaldo verificado y prueba en seco. **La migración la escribe un subagente implementador; la aplica el agente principal**, nunca un subagente, después del respaldo y la prueba en seco. Si no hay respaldo o prueba en seco, no arranca.

## Evidencia, contexto y ledger

**Ley de hierro:**

```
NINGUNA AFIRMACIÓN DE ÉXITO SIN EVIDENCIA FRESCA EN ESTE TURNO.
```

- "Compila" exige la salida del build que corriste vos, en la rama consolidada. "Pasa el lint" exige lo mismo. Prohibido "debería compilar", "seguro anda", "compiló antes" o "el agente dice que está limpio".
- **La autoverificación del subagente no es evidencia.** Es un filtro para no construir sobre algo roto. El árbol que importa es el consolidado.

**Presupuesto de contexto:**

- No leas parches, reportes ni logs completos. Leé el reporte de un agente solo si necesitás su estado; para el resto, usá `git status`/`git diff --stat` contra sus footprints.
- Redirigí toda salida larga a `.hd/<trabajo>/logs/<ola>-<paso>.log` y al contexto traé solo las líneas de fallo.
- No pegues el plan entero en el prompt del agente: pasale la ruta. El agente lee; vos no.
- Cuando el trabajo supera las tres olas, **el ledger es tu memoria**: releelo en vez de confiar en el historial.

**Ledger** (`.hd/<trabajo>/ledger.md`): anotá baseline, olas, worktrees, autoverificación, consolidación, gate, review, correcciones, pushes, enmiendas y rulings. Sobrevive a la compactación; tu memoria no. Después de una compactación, creéle al ledger y a git.

## Enmiendas y rulings

- **`Ruling:`** es una decisión técnica que tomaste en nombre del cliente: qué, por qué y qué cuesta si te equivocaste. Va al ledger y al cierre.
- **`Enmienda:`** es un cambio de alcance aprobado por el cliente: fecha, qué cambió, por qué, impacto y aprobación. Va en `spec.md` y en `waves.md`. Si el cambio es grande, no es una enmienda: es un trabajo nuevo que arranca por discovery.

## Salida

Todas las olas cerradas con evidencia en el ledger → **cargá la skill `hd-review` VOS MISMO** y arrancá la fase 4 en el mismo flujo. No hay gate humano acá: la auditoría de cierre y la prueba del cliente vienen después.

Los cambios están en la rama **como un commit por ola**, los worktrees borrados y los commits respaldados en `hd-backup/<trabajo>`. Eso es lo que audita `hd-review`, por SHA.

## Racionalizaciones comunes (y su realidad)

| Excusa | Realidad |
|---|---|
| "El paquete está aprobado, ejecuto y listo" | El paquete se escribió antes. La re-derivación es tu primer trabajo: si el código lo desmiente, frenás. |
| "Ya tengo el chat, no hace falta releer el paquete" | La fuente es el paquete. El chat no es el contrato. |
| "Confío en el research de discovery" | El research es una pista; vos verificás el camino crítico. |
| "Sin tests no verificamos nada" | Verificás build + lint + estándares y la revisión semántica. Es menos red automática y más lectura: por eso el revisor es obligatorio. |
| "Escribo un test rápido, total ayuda" | El framework no escribe tests. Un test suelto sin suite, sin convención y sin dueño es deuda. |
| "Como el agente compila, el build de la rama sobra" | El worktree del agente no es la rama. Su verde no es evidencia. |
| "Pasa el lint, entonces está bien" | El lint no lee intención. Eso lo audita el revisor. |
| "Un worktree por ola rinde más" | Un worktree por plan aísla la autoverificación. El worktree compartido hace que un agente vea los archivos a medio escribir del otro. |
| "Los dos planes son disjuntos, seguro van en paralelo" | El paralelismo se calcula con archivos, interfaces, estado mutable, dependencias y build. Ante la duda, serializá. |
| "Una ola de un plan es un defecto" | No: es el default sano. El defecto es forzar paralelismo. |
| "Una corrección más y converge" | Una por gate. Si no alcanza, el diagnóstico está mal o el problema es estructural: freno real. |
| "Lo arreglo yo, lanzar un agente es overhead" | El agente principal no escribe producción. Despachá un fixer. |
| "El revisor puede corregir lo que encuentra" | El que revisa no corrige: pierde independencia. El fixer es otro. |
| "El push falló, freno el trabajo" | Es un respaldo. Anotá y seguí. |
| "El build no corre en este entorno, sigo igual" | Sin baseline no sabés qué estaba roto antes: el rojo no es atribuible y el verde no es evidencia. Freno real. |
| "Le paso al revisor el reporte completo del agente" | Tu contexto se paga en cada turno. Rutas, no contenido. |
| "El cliente preguntó por el estado, le cuento todo" | Se le responde lo que pregunta, breve; el día a día va al ledger. |
