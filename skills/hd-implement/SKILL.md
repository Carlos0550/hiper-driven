---
name: hd-implement
description: Fase 3 del framework Hiper-driven (HD). Usar al cerrar la fase 2, con spec y planes revisados. El orquestador ejecuta los planes ola por ola; lanza por ola los implementadores (solo código) en un worktree compartido. Los agentes se autoverifican en su worktree (compilan y pasan el lint), pero solo la corrida del orquestador en la rama consolidada es evidencia, y solo él commitea. El orquestador consolida la ola, la commitea, corre su gate (build + lint + estándares) y hace una sola corrección si hace falta. No hay tests (el framework no los escribe).
---

# HD — Fase 3: Implementación (olas, worktrees y evidencia estática)

Entrada: `spec.md` + planes + `review-progress.md` (con el veredicto de artefactos) + ledger. Vos (el modelo de turno) sos el **orquestador**: no implementás con tus propias manos; coordinás agentes y sos dueño de TODA la evidencia.

> **La unidad es la OLA, no el plan.** Se consolidan, se commitean y se revisan olas. Un plan no tiene commit propio ni gate propio.

> **El paralelismo es caro y el serial no.** Un plan por ola es lo normal; agrupá planes solo cuando el cálculo de footprints lo autorice sin dudas.

## Regla dura: no hay tests

Este framework **no escribe tests**: ni unitarios, ni de integración, ni "aunque sea uno para verificar". La verificación es **build + lint + estándares** (lo automático) y **el revisor** (lo semántico). Si el repo ya tenía tests, no los rompés y no los borrás, pero **no agregás ninguno**; si un agente propone escribirlos, es alcance no pedido: lo rechazás y lo anotás en el ledger.

- No se pide "un test que reproduzca el bug": se pide **una reproducción** (comando, input o pasos) que falle y después no.
- No se declara nada "verde" por una corrida de tests ajena al trabajo.

## Qué se le habla al humano (y qué no)

**Durante la ejecución no le escribís al humano.** Tus agentes son colegas de trabajo, no su audiencia: lo que encuentran va al ledger, no al chat.

- Cada hallazgo, build roto, error de lint o "esto no era así": **al ledger**. Nada de informes por plan, por ola ni por worktree.
- **El humano se entera en dos momentos, y solo en esos dos:**
  1. **Freno real**: algo que te obliga a **parar todo el trabajo y esperar su decisión** (build o lint que no se arreglan en una corrección, error de contrato, baseline imposible de correr, datos en riesgo, spec sin aprobar). Ahí sí, y con detalle: qué pasó, qué falla, dónde y qué recomendás hacer.
  2. **Final**: el handoff para que pruebe el comportamiento y, después del OK, el resumen de cierre con las desviaciones que requieren su decisión.
- Todo lo demás se resuelve entre vos y tus agentes, y queda escrito. Un problema que no frena el trabajo **no se consulta**: se anota y se reporta al cierre.

## Ley de hierro de la evidencia

```
NINGUNA AFIRMACIÓN DE ÉXITO SIN EVIDENCIA FRESCA EN ESTE TURNO.
```

- "Compila" exige la salida del build que VOS corriste recién, **en la rama consolidada**, con el resultado a la vista. "Pasa el lint" exige lo mismo del comando de lint.
- Prohibido "debería compilar", "seguro anda", "compiló antes en la sesión", "el agente dice que está limpio". Una corrida verde solo prueba el árbol donde corrió, en el momento en que corrió.
- **La autoverificación del agente no es evidencia.** Es un filtro: evita construir sobre algo roto. El árbol que importa es el consolidado; el worktree de un agente no lo es.

## Presupuesto de contexto (la regla que más tiempo ahorra)

El costo del trabajo crece con **tu** contexto, no con el de tus agentes: ellos nacen limpios y mueren al terminar; vos acumulás. Todo lo que traés al chat se paga en cada turno siguiente.

- **No leas parches, reportes ni logs completos.** Leé el reporte del agente solo si necesitás su estado; para el resto, usá `git status`/`git diff --stat` contra sus footprints.
- **Redirigí toda salida larga** a `.hd/<trabajo>/logs/<ola>-<paso>.log` y al contexto traé solo las líneas de fallo (`grep -E "error|warning|✗" | head -40`).
- **No pegues el plan entero en el prompt del agente**: pasale la ruta. El agente lee; vos no.
- Cuando el trabajo supera las tres olas, **el ledger es tu memoria**: releelo en vez de confiar en el historial.

## Respaldo temporal (`hd-backup/<trabajo>`)

Los commits por ola viven en la rama de trabajo hasta el cierre: un corte de luz puede romperlos. Para blindarlos, **cada commit de ola se sube a una rama de respaldo**, no a la rama de trabajo:

> **Se pushea si y solo si** el spec dice `Respaldo: habilitado` para ese repo **y** la rama actual no es la rama por defecto.

**Rama de respaldo:** `hd-backup/<trabajo>`. El push es `git push <remote> HEAD:refs/heads/hd-backup/<trabajo>`. Es **temporal**: `hd-close` la borra al cerrar. Mientras dure el trabajo, los commits por ola quedan recuperables aunque la rama de trabajo se pierda.

- **Es un respaldo, no una aprobación**: se sube el commit tal cual, aunque el gate de la ola todavía no haya pasado.
- **Nunca `--force`**: si el remoto está adelantado o divergido, el push se rechaza; anotá el fallo y seguí.
- **Un push fallido NO frena el trabajo**: credenciales, red, hook, remoto caído. Anotá `Push: FALLIDO (<motivo>)` y seguí.
- **Nunca a la rama de trabajo ni a `main`**: la rama de trabajo la pushea `hd-close`, y solo si es nueva.

## Los tres modos

| Modo | Olas | Worktrees | Verificación | Revisor de código |
|---|---|---|---|---|
| **Directo** | ninguna (un solo paso) | uno | build + lint + estándares | **obligatorio** |
| **Cambio chico** | ninguna (un solo plan) | uno | build + lint + estándares | **obligatorio** (auditoría simple) |
| **Mega cambio** | varias | uno por ola | build + lint + estándares por ola | **obligatorio** por ola |

**El directo no es "chico sin rigor"**: es el mismo gate, la misma evidencia y la misma auditoría. Lo que no tiene es la maquinaria de olas, que un trabajo de uno o dos archivos no amortiza.

## Contrato del implementador

1. **Escribe SOLO código de producción.** No crea tests, no crea scripts de verificación que queden en el repo, no toca archivos fuera de los `Archivos` de su plan.
2. Implementa según **su plan + el spec + los contratos de Ola 0**. Nada de rediseñar, "mejorar" cosas fuera del plan, ni cambiar el alcance.
3. **Respeta los estándares del repo**: el linter y el formatter configurados, las convenciones de nombres y estructura, el manejo de errores de la casa. Un cambio que compila pero rompe las convenciones no está listo.
4. **Se autoverifica en su worktree, y solo ahí**: instala symlinks, compila/typechea y corre el lint sobre sus archivos. **No commitea, no toca la rama, no aplica migraciones, no levanta servicios.** Nada de lo que corra es evidencia: es para no entregar código que no compila.
5. **NO commitea. Nunca.**
6. **No deja restos**: nada de `console.log`/`print` de debug, código comentado, TODOs sin dueño ni archivos temporales.
7. Reporta por **archivo de reporte** en `.hd/<trabajo>/reports/plan-NN.md`: estado (LISTO / LISTO_CON_DUDAS / NECESITA_CONTEXTO / TRABADO), archivos tocados, decisiones de implementación y **la salida de su autoverificación** (comandos y resultado, en 5 líneas).

## El gate: build, lint y estándares

El gate de una ola son tres corridas **en la rama consolidada**, en este orden, con la salida a log:

1. **Build / typecheck** — el comando `Build:` del spec. Si no compila, la ola no existe.
2. **Lint / formato** — el comando `Lint:` del spec. **Sin errores nuevos**: los que ya estaban en el baseline con la misma firma se ignoran.
3. **Estándares** — si el repo tiene un comando único de chequeo (`make check`, `pnpm verify`, `npm run check`), ese es el gate. Si no, lo que el linter no puede decidir (convenciones de la casa, manejo de errores, duplicación evidente) lo audita el **revisor** en la fase 4: vos no leés el diff.

Una ola está **verde** cuando las tres corridas pasan (o sus fallos están en el baseline) y el revisor no encontró nada que la deniegue.

## El ledger (memoria que sobrevive a la compactación)

Al arrancar, creá `.hd/<nombre-del-trabajo>/ledger.md` con primera línea `# HD ledger — trabajo: <nombre>` y el **commit base** anotado en el spec (`Base: <sha>` — referencia del trabajo y de su historial), la **rama de trabajo**, el **modo**, la **rama de respaldo** y los **fallos conocidos** del baseline. Registrá ahí, a medida que pasa:

- `Baseline: <sha> — <N> hallazgos de build/lint preexistentes (<firmas>)`
- `Ola N: base <sha> (padre de la ola)`
- `Ola N: autoverificación (<agente> → <comando> → <resultado>)`
- `Ola N: consolidada (worktree <sha> → rama) — evidencia: build <resultado>, lint <resultado>`
- `Ola N: commit <sha> (gate: verde | fallos en baseline | corrección: sí | no)`
- `Push: hd-backup/<trabajo> ← <sha> (ok | FALLIDO: <motivo> | no aplica)`
- `Stash: <ref> — <motivo> (se dropea en el cierre)`
- `Ruling: <qué decidiste> — <por qué> — <qué cuesta si te equivocaste>`

Si usás `git stash`, nombralo `hd(<trabajo>): <motivo>` y anotalo en el ledger; `hd-close` dropea los stashes del trabajo. Nunca dejes un stash sin nombre ni registro.

El ledger sobrevive a la compactación de contexto; tu memoria no. **Después de una compactación, creéle al ledger y a git, no a tu recuerdo** — re-lanzar trabajo ya hecho es el fallo más caro de este proceso.

## Baseline (una vez, antes de la ola 1)

Con el **árbol limpio** y la rama en `Base`, corré **build y lint una vez** y registrá los fallos conocidos (nombre + firma del error). En la rama, no en un worktree nuevo.

```
git status                 # limpio
git rev-parse HEAD         # == Base
# correr Build: y Lint: del spec
```

- Si el baseline **no compila** en los módulos que el spec va a tocar: **freno real** antes de implementar.
- Si el lint falla en una porción grande del repo (más de ~20% de los archivos): el baseline no sirve como oráculo; **freno real**.
- Los fallos del baseline se ignoran durante el trabajo, pero se arrastran: son los `Known failures`.
- **`Known failures: 0` solo es válido si build y lint corrieron enteros.** Si no corrieron, es `desconocido` y la ola no se puede declarar verde; se reporta.
- Si el repo no tiene build ni lint, anotá `Verificación: no aplica` y seguí.

## Cómo se arma un worktree (sin pagar dos veces la instalación)

Por ola, no por plan:

```
git worktree add --detach .git/hd-wt/<trabajo>/ola<N> <Base-de-la-ola>
```

- **Los worktrees viven en `.git/hd-wt/<trabajo>/`**, no dentro del árbol de trabajo: un worktree bajo `.hd/` aparece como directorio sin trackear y `git add -A` se lo lleva al commit. Bajo `.git/` es invisible a `git status`, y `git worktree list` los muestra igual.
- **Symlinks de dependencias en vez de reinstalar**: `node_modules`, `.venv`, `vendor`, `target/`. Un symlink al del repo principal evita N instalaciones por ola. Si el agente necesita instalar algo nuevo, que lo haga ahí y lo anote en su reporte.
- **Un worktree por ola**, no por plan: los footprints de los planes de una ola ya garantizan archivos disjuntos, así que no pueden pisarse. Todos los implementadores de la ola escriben en el mismo worktree, cada uno en sus archivos.

## Modo mega cambio — Ciclo de una ola

1. **Planificá la ola con los footprints de los planes** (Archivos / Interfaces / Depende de): comparten ola solo si sus archivos de **código** son disjuntos, nadie produce lo que otro consume, no comparten estado mutable y ninguno depende del otro. **Default: un plan por ola.** Agrupá solo cuando la matriz sea inequívoca; ante la duda, serializá.
2. **Un worktree desde el HEAD de la rama** en el momento del dispatch, con symlinks de dependencias: `ola<N>`. Ese SHA se anota en el ledger.
3. **Lanzá todos los agentes de la ola en UN solo mensaje**, cada uno con **rutas**, no con contenido: su plan, el spec, los contratos de Ola 0 y la ruta de su worktree. Nada de historia de la sesión en los prompts.
4. **Consolidación de la OLA (obligatoria, en este orden):**
   a. **Chequeá los footprints antes de traer nada**: `git -C <wt> status --short` contra `Archivos` del plan. Si un implementador tocó un archivo fuera de su plan, o creó tests, es violación de contrato: corregí al agente **una sola vez**. Si reincide, **freno real**.
   b. **Traé el código**: el worktree commitea su trabajo (`git -C <wt> add -A && git -C <wt> commit -m "wip ola N"`) y vos lo traés **sin commit**: `git cherry-pick -n <sha-wip>`. Cherry-pick y no `merge --ff-only`: los worktrees salieron de la misma base, así que el merge siempre diverge. Como los archivos son disjuntos por contrato, el cherry-pick no conflictúa; si conflictúa, la ola estuvo mal planificada: **frená y re-partí**.
   c. **Commité la ola (checkpoint)**: `hd(<trabajo>): ola N — <qué entró>` (código + ledger). **Va antes del gate, no después**: el commit es la base real sobre la que corre el gate y sobre la que trabaja el corrector si algo falla. Lo hace el orquestador.
   d. **Subí el commit a la rama de respaldo** (`hd-backup/<trabajo>`) si el respaldo está habilitado. **Inmediatamente después del commit, antes del gate**: es un respaldo, no una aprobación. Si falla, anotá y seguí.
   e. **Build en la rama**: corré `Build:` una vez, con salida a log. Es el único build de la ola. Si falla, relanzá al agente responsable **una sola vez** con el error exacto. Si el segundo intento tampoco compila, **freno real**.
   f. **Lint en la rama**: corré `Lint:` una vez. Los fallos que ya estaban en el baseline con la misma firma se ignoran; los nuevos son hallazgos.
   g. **Gate de la ola**: build + lint + estándares sobre la rama. Esa es LA evidencia.
      - **Si hay fallos nuevos**: triageá (código mal vs convención mal vs entorno), lanzá **UNA sola corrección** en un worktree desde el HEAD, con todos los hallazgos y `hd-debug` obligatorio; consolidá con `cherry-pick -n` y commit `hd(<trabajo>): ola N — corrección`, respaldá ese commit también, y re-corré el gate **una vez**. Si sigue rojo, **freno real**: no hay segunda corrección.
      - **Si la ola está verde**: seguí.
   h. **Si la ola incluye migraciones, aplicalas vos**. En la ola de datos: respaldo confirmado + prueba en seco ANTES de aplicar nada.
   i. **Borrá el worktree de la ola** (`git worktree remove --force` + `git worktree prune`). Ningún worktree sobrevive a su ola.
   j. Ledger: `Ola N: commit <sha> (...)`, la evidencia del gate y `Push: ...`.

   El diff por plan **no se guarda**: se reconstruye con `git show <sha> -- <rutas del plan>`, que es exactamente lo que el revisor necesita. Si la ola tuvo corrección, son dos commits; el revisor recibe ambos.
5. **Ola 0 va SOLA** y sus contratos se revisan antes de lanzar la Ola 1. **Ola de datos: última, sola, nunca en paralelo**; sin respaldo + prueba en seco, no arranca. La Ola 0 además puede saltarse el worktree: es escritura de contratos, y un worktree extra no aporta barrera.

## Modo cambio chico

- Un solo plan, un solo worktree (`cambio`), un implementador.
- Consolidación con `cherry-pick -n`, commit, gate (build + lint + estándares) y respaldo.
- El orquestador hace una corrección si hace falta, commitea el trabajo, lo respalda en `hd-backup/<trabajo>` y sigue con `hd-review` (**el revisor entra siempre**).

## Modo directo

Un trabajo de uno o dos archivos, sin contratos nuevos que otros consuman y sin datos. La maquinaria de olas no amortiza, pero **el rigor es el mismo**.

- **Un solo worktree**, un implementador.
- **Gate completo** sobre todo lo tocado (build + lint + estándares), una corrección única si falla, **un commit** y respaldo.
- **El revisor de `hd-review` entra siempre**, también acá. Sin tests, es la única capa que mira comportamiento: dos archivos sin contratos siguen siendo dos archivos que nadie leyó. El revisor recibe el diff del único commit y una auditoría corta alcanza.

## Salida

Todas las olas verdes con evidencia en el ledger → **cargá la skill `hd-review` VOS MISMO y arrancá la fase 4 en el mismo flujo** — acá NO hay gate humano. Los cambios están en la rama **como un commit por ola** (o uno solo en directo y chico), el worktree borrado y los commits respaldados en `hd-backup/<trabajo>`. Eso es lo que hd-review audita, por SHA.

## Racionalizaciones comunes (y su realidad)

| Excusa | Realidad |
|--------|----------|
| "Sin tests no verificamos nada" | Verificamos build + lint + estándares, y el revisor audita el comportamiento contra el plan. Es menos red automática y más lectura: por eso el revisor es obligatorio. |
| "Escribo un test rápido, total ayuda" | El framework no escribe tests. Un test suelto sin suite, sin convención y sin dueño es deuda, no red de seguridad. |
| "Como el agente compila, el build de la rama sobra" | El worktree del agente no es la rama. Su verde no es evidencia; el build de la rama es barato y el único que vale. |
| "Pasa el lint, así que está bien" | El lint no lee semántica: no sabe si el código hace lo que el plan pide. Eso lo audita el revisor. |
| "En directo son dos archivos, el revisor es ceremonia" | Sin tests, es la única lectura del diff. Dos archivos sin contratos siguen pudiendo romper el comportamiento. |
| "Un worktree por plan rinde más aislamiento" | Los footprints de la ola ya garantizan disjunción. Un worktree por plan es instalación repetida sin barrera nueva. |
| "Guardo los parches por plan por si acaso" | `git show <sha> -- <rutas>` reconstruye el mismo diff. Guardar N archivos es trabajo que no produce información. |
| "Reinstalo dependencias en cada worktree, es más limpio" | Son decenas de minutos por ola. Symlink y listo. |
| "Una ola de un plan es un defecto" | No: es el default sano. El defecto es forzar paralelismo. |
| "Una corrección más y converge" | Una sola corrección por ola. Si no alcanza, es freno real. |
| "Lo arreglo yo, lanzar un agente es overhead" | Los fixes del orquestador contaminan tu contexto y se saltean la revisión. Reanudá al agente. |
| "El push falló, freno el trabajo" | Es un respaldo. Anotá y seguí. |
| "El build no corre en este entorno, sigo igual" | Sin baseline no sabés qué estaba roto antes: el rojo no es atribuible y el verde no es evidencia. Es freno real. |
| "Le paso al revisor el reporte completo del agente" | Tu contexto se paga en cada turno. Rutas, no contenido. |
