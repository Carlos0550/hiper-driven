---
name: hd-implement
description: Fase 2 (continuación) del framework Hiper-driven (HD). Usar desde el prompt de implementación de un spec aprobado. El orquestador ejecuta los planes ola por ola; en Flujo B lanza por ola un implementador por plan (solo código) en un worktree compartido y un autor de tests independiente por plan (tests desde el plan, en el commit padre, sin ver la implementación); en Flujo A (legacy) o en directo el implementador escribe tests primero y un auditor de tests con contexto limpio revisa esos tests. Los agentes se autoverifican en su worktree, pero solo la corrida del orquestador en la rama consolidada es evidencia, y solo él commitea. El orquestador consolida la ola, la commitea, corre su gate y hace una sola corrección si hace falta.
---

# HD — Implementación (olas, worktrees, autores de tests y evidencia)

Entrada: `spec.md` + `spec-prompt.md` + planes aprobados. Vos (el modelo de turno) sos el **orquestador**: no implementás ni escribís tests con tus propias manos; coordinás agentes y sos dueño de TODA la evidencia. Si el prompt no existe, generá uno mínimo desde el spec antes de arrancar y anotalo; no improvises el alcance.

> **La unidad es la OLA, no el plan.** Se consolidan, se commitean y se revisan olas. Un plan no tiene commit propio ni gate propio.

> **Flujo B (default).** El implementador escribe **solo código**; un **autor de tests distinto** escribe los tests desde el contrato de comportamiento del plan, en el commit **padre**, sin ver la implementación. Corren en paralelo. **Flujo A** es solo para specs viejos o en vuelo, y es obligatorio en **directo**, **Ola 0** y **ola de datos**: el implementador escribe tests primero y un **auditor de tests** independiente los revisa después.

> **El paralelismo es caro y el serial no.** Un plan por ola es lo normal; agrupá planes solo cuando el cálculo de footprints lo autorice sin dudas.

## Qué se le habla al humano (y qué no)

**Durante la ejecución no le escribís al humano.** Tus agentes son colegas de trabajo, no su audiencia: lo que encuentran va al ledger, no al chat.

- Cada hallazgo, build roto, test que falla o "esto no era así": **al ledger**. Nada de informes por plan, por ola ni por worktree.
- **El humano se entera en dos momentos, y solo en esos dos:**
  1. **Freno real**: algo que te obliga a **parar todo el trabajo y esperar su decisión** (build o tests que no se arreglan en una corrección, error de contrato, baseline imposible de correr, datos en riesgo, spec sin aprobar). Ahí sí, y con detalle: qué pasó, qué falla, dónde y qué recomendás hacer.
  2. **Cierre**: el resumen final, con la sección de desviaciones que requieren su decisión.
- Todo lo demás se resuelve entre vos y tus agentes, y queda escrito. Un problema que no frena el trabajo **no se consulta**: se anota y se reporta al cierre.

## Ley de hierro de la evidencia

```
NINGUNA AFIRMACIÓN DE ÉXITO SIN EVIDENCIA FRESCA EN ESTE TURNO.
```

- "Los tests pasan" exige la salida del comando de tests que VOS corriste recién, **en la rama consolidada**, con el resultado a la vista.
- Prohibido "debería pasar", "seguro funciona", "pasaron antes en la sesión", "el agente dice que compila". Una corrida verde solo prueba el árbol donde corrió, en el momento en que corrió.
- **La autoverificación del agente no es evidencia.** Es un filtro: evita construir sobre algo que no compila. El árbol que importa es el consolidado; el worktree de un agente no lo es.
- **La excepción del autor de tests**: su worktree está en el commit padre, así que ni autoverificando puede ratificar el código nuevo. Corre sus tests para confirmar que colectan contra las interfaces que ya existen; eso es todo lo que puede afirmar.

## Presupuesto de contexto (la regla que más tiempo ahorra)

El costo del trabajo crece con **tu** contexto, no con el de tus agentes: ellos nacen limpios y mueren al terminar; vos acumulás. Todo lo que traés al chat se paga en cada turno siguiente.

- **No leas parches, reportes ni logs completos.** Leé el reporte del agente solo si necesitás su estado; para el resto, usá `git status`/`git diff --stat` contra sus footprints.
- **Redirigí toda salida larga** a `.hd/<trabajo>/logs/<ola>-<paso>.log` y al contexto traé solo las líneas de fallo (`grep -E "FAIL|error|✗" | head -40`).
- **No pegues el plan entero en el prompt del agente**: pasale la ruta. El agente lee; vos no.
- Cuando el trabajo supera las tres olas, **el ledger es tu memoria**: releelo en vez de confiar en el historial.

## Push de seguridad (respaldo en rama aparte)

Los commits por ola viven en la rama de trabajo hasta el cierre: un corte de luz puede romperlos. Para blindarlos, **cada commit de ola se sube a una rama de respaldo**, no a la rama de trabajo:

> **Se pushea si y solo si** el spec dice `push de seguridad: habilitado` para ese repo **y** la rama actual no es la rama por defecto.

**Rama de respaldo:** `hd-backup/<trabajo>`. El push es `git push <remote> HEAD:refs/heads/hd-backup/<trabajo>`. Así la rama de trabajo queda libre para el colapso de review y el commit único de close; los commits por ola quedan recuperables en la rama de respaldo.

- **Es un respaldo, no una aprobación**: se sube el commit tal cual, aunque los tests de la ola estén rojos.
- **Nunca `--force`**: si el remoto está adelantado o divergido, el push se rechaza; anotá el fallo y seguí.
- **Un push fallido NO frena el trabajo**: credenciales, red, hook, remoto caído. Anotá `Push: FALLIDO (<motivo>)` y seguí.
- **Nunca a la rama de trabajo ni a `main`**: la rama de trabajo se pushea recién en el cierre, con autorización explícita.

## Los tres modos

| Modo | Olas | Worktrees | Tests | Revisor |
|---|---|---|---|---|
| **Directo** | ninguna (un solo paso) | uno, solo si el implementador escribe tests | A + auditor de tests | solo si el diff toca contratos |
| **Cambio chico** | ninguna (un solo plan) | dos (B) o uno (A) | B, o A + auditor | sí, auditoría simple |
| **Mega cambio** | varias | dos por ola | B, salvo Ola 0 y datos | sí, por ola |

**El directo no es "chico sin rigor"**: es el mismo gate, la misma evidencia y la misma revisión simple. Lo que no tiene es la maquinaria de olas, que un trabajo de uno o dos archivos no amortiza.

## Flujo del spec: B o A

- `Flujo: B` (default) → implementador sin tests + autor de tests. Es el flujo de los specs nuevos.
- `Flujo: A` (legacy) → el implementador escribe tests primero. Es solo para specs viejos o en vuelo, y lo dice el prompt.
- **No mezcles flujos en un mismo spec.** Los modos **directo**, la **Ola 0** y la **ola de datos** usan **A siempre**: los contratos y los datos irreversibles se escriben con tests primero. En A, el **auditor de tests es obligatorio** (ver abajo).

## Contrato del implementador — Flujo B

1. **Escribe SOLO código de producción.** No crea ni modifica tests: los archivos de `Crea (tests)` son del autor de tests. Si toca uno, es una violación de contrato.
2. Implementa según **su plan + el spec + los contratos de Ola 0**. Nada de rediseñar, "mejorar" cosas fuera del plan, ni tocar archivos fuera de su alcance.
3. **Se autoverifica en su worktree, y solo ahí**: instala symlinks, compila/typechea, corre los tests que ya existían para sus archivos. **No commitea, no toca la rama, no aplica migraciones, no levanta servicios.** Nada de lo que corra es evidencia: es para no entregar código que no compila.
4. **NO commitea. Nunca.**
5. Reporta por **archivo de reporte** en `.hd/<trabajo>/reports/plan-NN.md`: estado (LISTO / LISTO_CON_DUDAS / NECESITA_CONTEXTO / TRABADO), archivos tocados, decisiones de implementación y **la salida de su autoverificación** (comando y resultado, en 5 líneas).

## Contrato del autor de tests — Flujo B

1. **Escribe SOLO los tests declarados en `Crea (tests)` del plan.** No toca código de producción.
2. **Fuente**: el plan (sobre todo `Contrato de comportamiento` e `Interfaces`), el spec, los contratos de Ola 0 y el código que existe en el **commit padre del plan**. **No lee la implementación del plan**: no está en su worktree, y no la busca en otro lado.
3. **Se autoverifica en su worktree**: corre sus tests para confirmar que **colectan** contra las interfaces que ya existen. Un test que no colecta es un test que no sirve. **No commitea, no toca la rama.** Sus verdes no son evidencia del código nuevo, porque el código nuevo no está ahí.
4. **No inventa comportamiento**: si el plan no dice qué pasa en un caso borde, lo reporta como `NECESITA_CONTEXTO`; no lo deduce del código. Un test que inventa una regla es un falso positivo caro.
5. Reporta en `.hd/<trabajo>/reports/plan-NN-tests.md`: tests escritos, comportamientos cubiertos, casos que el plan no cubre, dudas y la salida de colección.

## Contrato del implementador — Flujo A (legacy, directo, Ola 0, datos)

1. **Escribe los tests unitarios PRIMERO** — en ese orden en su trabajo — y deben tener criterio: reflejan el comportamiento deseado del plan y **llaman al código real**. Prohibido escribirlos después: eso es testear el happy path.
2. Implementa según **su plan + el spec** (+ contratos de Ola 0). Nada de rediseñar ni tocar archivos fuera de su alcance.
3. **Se autoverifica en su worktree**: compila y corre sus propios tests. En A el que escribe los tests también escribió el código, así que **sus verdes no prueban que los tests sean buenos** — por eso existe el auditor (abajo).
4. **NO commitea. Nunca.** No aplica migraciones ni levanta servicios.
5. Reporta en `.hd/<trabajo>/reports/plan-NN.md`: estado, archivos tocados, qué test cubre qué comportamiento y la salida de su autoverificación.

## El auditor de tests (obligatorio en A)

En Flujo B la independencia es **física**: el autor de tests no ve la implementación. En A no existe esa barrera, y el que implementa tiende a escribir tests que pasan por construcción. La compensación es un **auditor con contexto limpio** — no vio la implementación, no conoce el código — que audita **los tests**, no el código:

- Recibe: el plan (contrato de comportamiento), el spec, el diff de **tests** (`git diff <base> -- <Crea (tests)>`) y la salida del gate del orquestador. **Nunca el diff de código.**
- Busca: tests triviales (asserts vacíos, `expect(true)`, mocks del sujeto bajo prueba), tests que replican la estructura del código en vez de fijar el contrato, casos borde del plan no cubiertos y tests que pasan por construcción.
- **Reporta; no edita.** Lo que encuentra va al ledger como hallazgo; si es grave y el gate ya está verde, se lo pasa a la corrección única de `hd-review` con clasificación `test`.

## El ledger (memoria que sobrevive a la compactación)

Al arrancar, creá `.hd/<nombre-del-trabajo>/ledger.md` con primera línea `# HD ledger — trabajo: <nombre>` y el **commit base** anotado en el spec (`Base: <sha>` — es el destino del colapso final de hd-review), la **rama de trabajo**, el **modo**, el **flujo** (`Flujo: A | B`), la **rama de respaldo** y los **fallos conocidos** del baseline. Registrá ahí, a medida que pasa:

- `Baseline: <sha> — <N> fallos conocidos (<firmas>)`
- `Ola N: base de tests <sha> (padre de la ola)`
- `Ola N: tests autor (<archivos>, <comportamientos>)`
- `Ola N: autoverificación (<agente> → <comando> → <resultado>)`
- `Ola N: consolidada (worktree <sha> → rama) — evidencia: <comando> → <resultado>`
- `Ola N: commit <sha> (tests en rama: verde, corrección: sí | no)`
- `Auditoría de tests: <hallazgos | sin hallazgos>`
- `Push: hd-backup/<trabajo> ← <sha> (ok | FALLIDO: <motivo> | no aplica)`
- `Ruling: <qué decidiste> — <por qué> — <qué cuesta si te equivocaste>`

El ledger sobrevive a la compactación de contexto; tu memoria no. **Después de una compactación, creéle al ledger y a git, no a tu recuerdo** — re-lanzar trabajo ya hecho es el fallo más caro de este proceso.

## Baseline (una vez, antes de la ola 1)

Con el **árbol limpio** y la rama en `Base`, corré la suite completa **una vez** y registrá los fallos conocidos (nombre + firma del error). En la rama, no en un worktree nuevo.

```
git status                 # limpio
git rev-parse HEAD         # == Base
# correr el comando de Suite del spec
```

- Si el baseline falla en los módulos que el spec va a tocar: **freno real** antes de implementar.
- Si falla una porción grande de la suite (más de ~20%): el baseline no sirve como oráculo; **freno real**.
- Los fallos del baseline se ignoran durante el trabajo, pero se arrastran: son los `Known failures`.
- **`Known failures: 0` solo es válido si la suite corrió entera.** Si no corrió, es `desconocido` y la suite no se puede declarar verde; se reporta.
- Si el repo no tiene suite, anotá `Suite: no aplica` y seguí.

## Cómo se arma un worktree (sin pagar dos veces la instalación)

Por ola, no por plan:

```
git worktree add --detach .git/hd-wt/<trabajo>/ola<N> <Base-de-la-ola>
git worktree add --detach .git/hd-wt/<trabajo>/ola<N>-tests <Base-de-la-ola>   # solo Flujo B
```

- **Los worktrees viven en `.git/hd-wt/<trabajo>/`**, no dentro del árbol de trabajo: un worktree bajo `.hd/` aparece como directorio sin trackear y `git add -A` se lo lleva al commit. Bajo `.git/` es invisible a `git status`, y `git worktree list` los muestra igual.
- **Symlinks de dependencias en vez de reinstalar**: `node_modules`, `.venv`, `vendor`, `target/`. Un symlink al del repo principal evita N instalaciones por ola. Si el agente necesita instalar algo nuevo, que lo haga ahí y lo anote en su reporte.
- **Un worktree por ola para código**, no por plan: los footprints de los planes de una ola ya garantizan archivos disjuntos, así que no pueden pisarse. Todos los implementadores de la ola escriben en el mismo worktree, cada uno en sus archivos.
- **Un worktree por plan para tests** en Flujo B: la barrera física del autor de tests es el punto entero del flujo, y no se negocia.

## Modo mega cambio — Ciclo de una ola (Flujo B)

1. **Planificá la ola con los footprints de los planes** (Archivos / Interfaces / Depende de): comparten ola solo si sus archivos de **código** y de **tests** son disjuntos, nadie produce lo que otro consume, no comparten estado mutable, ninguno depende del otro, y ninguno tiene tests que toquen una base compartida. **Default: un plan por ola.** Agrupá solo cuando la matriz sea inequívoca; ante la duda, serializá.
2. **Dos worktrees desde el mismo commit base** (el HEAD de la rama en el momento del dispatch), con symlinks de dependencias:
   - `ola<N>` — todos los implementadores de la ola.
   - `ola<N>-tests` — todos los autores de tests de la ola, en el **commit padre**. Ese SHA se anota en el ledger. Ningún autor de tests ve la implementación porque físicamente no está en su worktree.
3. **Lanzá todos los agentes de la ola en UN solo mensaje**, cada uno con **rutas**, no con contenido: su plan, el spec, los contratos de Ola 0 y la ruta de su worktree. Nada de historia de la sesión en los prompts.
4. **Consolidación de la OLA (obligatoria, en este orden):**
   a. **Chequeá los footprints antes de traer nada**: `git -C <wt> status --short` contra `Archivos` del plan. Si un implementador tocó un archivo de `Crea (tests)`, o un autor de tests tocó código, es violación de contrato: corregí al agente **una sola vez**. Si reincide, **freno real**. Estás reemplazando al parche como detector, así que hacelo siempre.
   b. **Traé el código**: el worktree commitea su trabajo (`git -C <wt-code> add -A && git -C <wt-code> commit -m "wip ola N"`) y vos lo traés **sin commit**: `git cherry-pick -n <sha-wip-code>`. Cherry-pick y no `merge --ff-only`: los dos worktrees salieron de la misma base, así que el segundo merge siempre diverge. Como los archivos son disjuntos por contrato, el cherry-pick no conflictúa; si conflictúa, la ola estuvo mal planificada: **frená y re-partí**.
   c. **Traé los tests**: mismo procedimiento desde el worktree de tests, también `cherry-pick -n`. Sus archivos también son disjuntos.
   d. **Commité la ola (checkpoint)**: `hd(<trabajo>): ola N — <qué entró>` (código + tests + ledger). **Va antes del gate, no después**: el commit es la base real sobre la que corre el gate y sobre la que trabaja el corrector si algo falla. Lo hace el orquestador.
   e. **Subí el commit a la rama de respaldo** (`hd-backup/<trabajo>`) si el push de seguridad está habilitado. **Inmediatamente después del commit, antes del gate**: es un respaldo, no una aprobación — se sube tal cual, aunque la ola todavía no haya sido verificada. Si falla, anotá y seguí.
   f. **Build en la rama**: corré build/typecheck una vez, con salida a log. Es el único build de la ola. Si falla, el error ya viajó desde la autoverificación del agente; si igual falla en la rama, relanzá al agente responsable **una sola vez** con el error exacto. Si el segundo intento tampoco compila, **freno real**.
   g. **Gate de la ola**: corré **solo los tests de esta ola** en la rama, una vez, en serie. Esa es LA evidencia. Los fallos que ya estaban en el baseline con la misma firma se ignoran.
      - **Si hay fallos nuevos**: triageá (test mal vs código mal, contra el `Contrato de comportamiento`), lanzá **UNA sola corrección** en un worktree desde el HEAD, con todos los hallazgos y `hd-debug` obligatorio; consolidá con `cherry-pick -n` y commit `hd(<trabajo>): ola N — corrección`, respaldá ese commit también, y re-corré la ola **una vez**. Si sigue rojo, **freno real**: no hay segunda corrección.
      - **Si la ola está verde**: seguí.
   h. **Si la ola incluye migraciones, aplicalas vos**. En la ola de datos: respaldo confirmado + prueba en seco ANTES de aplicar nada.
   i. **Borrá los worktrees de la ola** (`git worktree remove --force` + `git worktree prune`). Ningún worktree sobrevive a su ola.
   j. Ledger: `Ola N: commit <sha> (...)`, la evidencia del gate y `Push: ...`.
   
   El diff por plan **no se guarda**: se reconstruye con `git show <sha> -- <rutas del plan>`, que es exactamente lo que el revisor necesita. Si la ola tuvo corrección, son dos commits; el revisor recibe ambos.
5. **Ola 0 va SOLA** y sus contratos se revisan antes de lanzar la Ola 1. **Ola de datos: última, sola, nunca en paralelo**; sin respaldo + prueba en seco, no arranca. **Las dos usan A** (tests primero) aunque el spec sea B, y **las dos llevan auditor de tests**. La Ola 0 además puede saltarse el worktree: es escritura de contratos, y un worktree extra no aporta barrera.

## Ciclo de una ola (Flujo A, legacy)

Un worktree por ola (`ola<N>`), el implementador escribe tests primero y código después y se autoverifica. Consolidación igual que en B pero sin worktree de tests: `cherry-pick -n`, commit, respaldo, build y gate. **Antes del gate, lanzá el auditor de tests** con el diff de tests, el plan y la salida del build — nunca el diff de código. Sus hallazgos van al ledger y, si son de test, a la corrección única de `hd-review`.

## Modo cambio chico

- **Flujo B**: mismo mecanismo que mega con un solo plan: dos worktrees (`cambio` y `cambio-tests`), consolidación con `cherry-pick -n`, commit, gate y respaldo.
- **Flujo A**: un solo worktree (`cambio`), tests primero, **auditor de tests obligatorio** antes del gate.
- El orquestador corre el gate, hace una corrección si hace falta, commitea el checkpoint único, lo respalda en `hd-backup/<trabajo>` y sigue con `hd-review`.

## Modo directo

Un trabajo de uno o dos archivos, sin contratos nuevos que otros consuman y sin datos. La maquinaria de olas no amortiza, pero **el rigor es el mismo**.

- **Un solo worktree**, un implementador en **Flujo A** con sus tests primero.
- **Auditor de tests obligatorio** con contexto limpio, antes del gate.
- **Un gate** sobre todo lo tocado (build + tests), una corrección única si falla, **un commit** y respaldo. Es el mismo ciclo de consolidación que el modo chico, con un solo plan.
- **El revisor de `hd-review` entra solo si el diff toca contratos** (firmas públicas, esquemas, formatos compartidos, migraciones) o si el auditor marcó un hallazgo alto. Si no, el trabajo pasa directo al gate humano con el diff de su único commit.

## Salida

Todas las olas verdes con evidencia en el ledger → **cargá la skill `hd-review` VOS MISMO y arrancá la fase 3 en el mismo flujo** — acá NO hay gate humano. Los cambios están en la rama **como un commit por ola** (o uno solo en directo y chico), los worktrees borrados y los commits respaldados en `hd-backup/<trabajo>`. Eso es lo que hd-review audita, por SHA.

**Excepción — modo directo sin contratos**: si el diff no toca contratos y el auditor no marcó nada alto, no cargues `hd-review`. Presentale al humano el diff del único commit y pasá directo al gate de la fase 4: un revisor de agente para dos archivos sin contratos es ceremonia sin valor. Si el humano lo pide, se corre igual.

## Racionalizaciones comunes (y su realidad)

| Excusa | Realidad |
|--------|----------|
| "El implementador escribe los tests más rápido" | El que implementa fija el comportamiento que su código ya resuelve. En B el autor de tests no ve la implementación; en A lo compensa el auditor. |
| "El autor de tests puede mirar el código, total no lo copia" | Si lo mira, lo ratifica. La barrera es física: worktree en el commit padre. |
| "Ya que el agente compila, el build de la rama sobra" | El worktree del agente no es la rama. Su verde no es evidencia; el build de la rama es barato y el único que vale. |
| "En A los tests quedan bien porque pasan" | Pasar no prueba nada: el que escribió el código escribió los tests. Para eso está el auditor con contexto limpio. |
| "Un worktree por plan rinde más aislamiento" | Los footprints de la ola ya garantizan disjunción. El aislamiento que importa es el del autor de tests, y ese sigue siendo por plan. |
| "Guardo los parches por plan por si acaso" | `git show <sha> -- <rutas>` reconstruye el mismo diff. Guardar 2N archivos es trabajo que no produce información. |
| "Reinstalo dependencias en cada worktree, es más limpio" | Son decenas de minutos por ola. Symlink y listo. |
| "Una ola de un plan es un defecto" | No: es el default sano. El defecto es forzar paralelismo. |
| "Una corrección más y converge" | Una sola corrección por ola. Si no alcanza, es freno real. |
| "Lo arreglo yo, lanzar un agente es overhead" | Los fixes del orquestador contaminan tu contexto y se saltean la revisión. Reanudá al agente. |
| "El push falló, freno el trabajo" | Es un respaldo. Anotá y seguí. |
| "La suite no corre en este entorno, sigo con los tests nuevos" | Sin baseline no sabés qué fallaba antes: el rojo no es atribuible y el verde no es evidencia. Es freno real. |
| "Le paso al revisor el reporte completo del agente" | Tu contexto se paga en cada turno. Rutas, no contenido. |
