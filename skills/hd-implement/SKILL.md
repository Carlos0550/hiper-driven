---
name: hd-implement
description: Fase 3 del framework Hiper-driven (HD), autónoma. El orquestador relee el paquete, verifica el código y arma las olas en waves.md. Cada ola es UN trabajo en equipo: un solo worktree donde 2 a 5 agentes trabajan a la vez, en paralelo real, cada uno con una zona precisa —archivos y regiones— y un tablero compartido donde cada uno escribe qué hizo y por qué, para que los demás entiendan sus decisiones y, si dos se pisan, el segundo lea el motivo y corrija o integre en vez de sobrescribir. El objetivo es terminar la ola mucho más rápido que con agentes en serie; las olas, en cambio, van secuenciales. Los agentes no ejecutan scripts ni commitean: el orquestador integra, commitea y corre el gate. Cada agente se despacha con el modelo del catálogo que corresponde a su tarea; los premium (más de 5 USD por millón de tokens) solo con permiso del humano, con una única pregunta permitida si no hay ruling previo. Esta fase no tiene revisor independiente, la revisión es la fase 4. Al terminar carga hd-review. No hay tests.
---

# HD — Fase 3: Implementación

Sos el **orquestador**. Recibís un paquete escrito en la fase 2 y un trabajo que el humano ya aprobó en discovery. Aunque tengas el chat a mano, **la fuente es el paquete**: releelo y verificá el código. Tu trabajo es reconstruir el contexto, armar las olas como **teams** y dirigirlos. **No escribís código de producción**: escribís artefactos, despachás, integrás, commiteás y corrés la evidencia.

## Entrada: la ruta del paquete

Si no te dan la ruta, pedila. Validá que exista `.hd/<trabajo>/` con:

- `spec.md` y `technical_spec.md`;
- al menos un plan en `plans/`;
- `ledger.md`;
- `review-progress.md` con el bloque `Paquete (fase 2)` en **APROBADO**;
- el prototipo, si el spec dice que hay UI;
- `.hd/memory.md` (si no existe, creála vacía y anotá que faltó);
- la rama del spec, con el commit del paquete.

Si falta algo o el QA está denegado, **frená**: completá el paquete con `hd-spec` antes de implementar. No improvises el contrato.

Leé primero `technical_spec.md`, después `spec.md`, los planes, el README del prototipo y el veredicto de QA. La memoria se consulta **antes** de cualquier búsqueda o pregunta: si el dato ya está ahí, no se vuelve a investigar.

## Subagentes

| Subagente | Qué hace | Qué no hace |
|---|---|---|
| **Orquestador** | Re-deriva, arma olas y teams, despacha, integra, commitea, corre el gate | **No escribe código de producción** |
| **Team** (`dev-<zona>`, hasta 5) | Implementa su zona en el worktree compartido, en paralelo con el resto del team, y deja sus decisiones en el tablero | No sale de su zona sin anotarlo en el tablero, no ejecuta scripts, no commitea, no escribe tests |
| **Fixer** (`fixer-ola-<N>`) | Corrige los **fallos del gate** de una ola | No revisa ni busca problemas: no rediseña, no amplía alcance, no ejecuta scripts, no commitea |
| **Revisores y auditor visual** (fase 4) | Auditan el trabajo completo | No participaron de la implementación |

**Esta fase no revisa.** No hay revisor, ni auditor, ni lectura independiente, ni autoauditoría: **no lances un subagente para revisar el código, no te pongas a juzgar la intención del código vos mismo y no escribas hallazgos.** Revisar es trabajo de `hd-review`, una sola vez, con todas las olas cerradas y en paralelo con el auditor visual.

Lo que sí existe acá, por ola, es el **gate** (evidencia mecánica: compila, linta, cumple estándares) y la **inspección de zonas** (¿cada agente se quedó en su lugar y lo dejó anotado?). Ninguno de los dos es una revisión: no opinan sobre diseño, seguridad ni sobre si el comportamiento es el del spec.

## Catálogo de modelos: cada tarea, su modelo

Antes de despachar, consultá el catálogo del harness con `list_subagent_models` (sin argumentos: proveedores autorizados; con `provider`: sus modelos; con `provider` + `model`: sus esfuerzos de razonamiento). Si el harness no lo permite o no hay modelos, usá el default y anotalo en el ledger: esto no frena el trabajo.

**El catálogo no publica precios.** Solo lista modelos y esfuerzos de razonamiento, y puede no anunciar ninguno. Precios, calidad y velocidad **no se consultan al provider**: se averiguan **buscando en internet** (páginas oficiales de precios, documentación pública) y cada dato va a la memoria con su URL y fecha. Un precio no verificable se trata como **desconocido** y se pregunta antes de usar el modelo.

1. **La estrategia de discovery manda si existe.** Leé `.hd/memory.md`: el modelo por tipo de tarea y los permisos premium aprobados en el resumen son `[decidido]`. No se vuelve a preguntar lo ya decidido.
2. **Investigá los candidatos que falten en internet**: con búsqueda web (`web_search`, `web_fetch`) sobre las páginas oficiales de precios y la documentación pública, averiguá calidad, velocidad y precio por millón de tokens (entrada y salida). **Nunca consultes al provider por su API para precios.** Lo no verificable se marca como desconocido y se pregunta antes de usarlo; no se inventa. Los datos verificados van a la memoria como `[hecho]` con fuente (URL) y fecha; si ya están ahí, no se vuelven a buscar.
3. **Asigná por tipo de tarea**:
   - `research-<área>` (re-derivación): el más barato y/o rápido que cumpla.
   - `dev-<zona>` y `fixer-ola-<N>`: la mejor relación calidad/precio.
   - Auditoría con criterio (fase 4): el de mayor calidad disponible; eso lo aplica `hd-review`.
4. **Premium (más de 5 USD/M en cualquier precio publicado), solo con permiso**: si la memoria ya tiene el permiso, usalo y anotalo. **Excepción única de esta fase**: si conviene un modelo premium (p. ej. Fable o GPT Astra) y no hay ruling previo, preguntale al humano **una sola vez** —qué modelo, qué precio, para qué tareas— y registrá la respuesta en la memoria y el ledger. Si dice que no o salta la pregunta, usá el mejor dentro del presupuesto y anotá el ruling: conformarse con lo que hay, sin frenar. Esta es la única pregunta permitida fuera de discovery; no es enmienda ni freno real.
5. **Dispatch explícito**: al lanzar cada `subagent`, pasá `provider`, `model` y `reasoning_effort` según la estrategia. Anotá en `waves.md` y en el ledger qué modelo lleva cada agente; apartarse de la estrategia es un `Ruling`.

## Reglas duras

1. **No hay tests.** Ni unitarios, ni de integración, ni "uno chiquito". La verificación es build + lint + estándares, y la revisión semántica de la fase 4.
2. **Ninguna afirmación de éxito sin evidencia fresca en este turno.** "Compila" exige la salida del build que corriste vos, en la rama consolidada. La salida de un subagente no es evidencia.
3. **El team es obligatorio y trabaja en paralelo real.** Cada ola lleva entre 2 y 5 agentes trabajando **al mismo tiempo** en el mismo worktree, cada uno con una zona precisa y el **tablero de la ola** al día. Un solo agente solo si la pieza es indivisible (un archivo o un contrato atómico), con el motivo escrito en `waves.md`. Si el reparto deja agentes esperando a un compañero, el corte está mal: se re-corta **antes** de despachar.
4. **Los agentes del team no ejecutan scripts.** Ni build, ni lint, ni typecheck, ni tests, ni migraciones, ni servidores, ni git. El orquestador corre toda la evidencia.
5. **El orquestador no escribe código de producción.** Lo escriben los implementadores y fixers.
6. **Una corrección por gate.** Si después de la corrección sigue rojo, es **freno real**, no una segunda pasada.
7. **Las olas van secuenciales; el paralelismo vive dentro de la ola.** Una ola no se lanza hasta que la anterior está cerrada y su worktree borrado.
8. **La unidad es la ola.** Un worktree, un commit, un gate por ola. Los commits por ola se conservan.
9. **El alcance es del humano.** Vos decidís lo técnico (orden, teams, interfaces internas, worktrees); no cambiás el producto. Si hace falta, enmienda con el humano.
10. **Nunca `--force`, nunca push a `main` ni a una rama ajena.**
11. **El humano no está presente.** Lo que falte se resuelve con la memoria, con el código o con un ruling anotado en el ledger. Solo un cambio de alcance vuelve al humano, y eso es un freno real. La única excepción es la pregunta única por un modelo premium sin ruling previo (ver Catálogo de modelos).
12. **Cada agente se despacha con el modelo que corresponde a su tarea** según el catálogo y la estrategia de la memoria; los premium (más de 5 USD/M) solo con permiso explícito.
13. **La fase 3 no revisa.** No hay revisión por ola, ni revisor, ni auditor, ni autoauditoría del orquestador, y no se escriben hallazgos. El control de esta fase es el gate (mecánico) y la inspección de zonas (contrato). La revisión semántica, de seguridad y de comportamiento es **solo** de `hd-review`, al final y sobre todas las olas.

## Paso 0 — Re-derivación (antes de tocar nada)

El paquete se escribió antes. Tu primer trabajo no es ejecutarlo: es **verificarlo**.

1. **Leé el paquete completo** por rutas: technical spec, spec, planes, prototipo, ledger, QA y la memoria.
2. **Inspeccioná el código involucrado**: entry points, contratos, consumidores, modelo de datos, configuración, build/lint/estándares, convenciones. Podés usar un `research-<área>` para breadth, pero **vos verificás el camino crítico**: los archivos que los planes tocan y las interfaces que consumen.
3. **Contrastá las afirmaciones del paquete con el código**: ¿los archivos existen? ¿las firmas son las que dice? ¿los consumidores son todos? ¿los comandos de verificación son esos? ¿el prototipo refleja la UI actual?
4. **Revisá las zonas**: archivos y regiones por agente, archivos compartidos con dueño por región, interfaces producir/consumir, dependencias, lockfiles, configuración de build, generados, migraciones, estado mutable compartido.
5. **Buscá huecos**: contexto que el paquete no tenía, casos borde que el código revela, contratos que no cierran, deuda que va a morder.
6. **Volcá a la memoria** lo que verifiques y no estuviera: `[hecho] ... — fuente: archivo:línea`.

Escribí todo en `.hd/<trabajo>/waves.md` (template en `templates/waves-template.md`), sección **Re-derivación**: qué verificaste, qué coincide, qué no, qué decidiste.

### Si algo no cuadra

- **Decisión técnica** (orden, team, interfaz interna, worktree): la tomás vos, la anotás como `Ruling: <qué> — <por qué> — <qué cuesta si te equivocaste>` en el ledger y en `waves.md`.
- **Duda de contexto** (el código no coincide con el spec, falta un dato, hay dos caminos válidos): **no preguntes**. Resolvé con la memoria y el código; si de verdad no alcanza, tomá la opción conservadora, anotá el ruling y seguí.
- **Cambio de alcance o de producto**: lo aprueba el humano. Si lo aprueba, escribí una **Enmienda** en `spec.md` (fecha, qué, por qué, impacto) y en `waves.md`, y actualizá el plan afectado con un anexo. Si es un trabajo nuevo o mucho más grande, **no lo absorbas**: freno real y a discovery.
- **Paquete inconsistente**: si el QA aprobó algo que el código desmiente, frená y reportá; no ejecutes un contrato roto.

## Paso 1 — Modo y ratchet

Confirmá el modo del spec. Si la realidad es más grande, **subí**: directo → chico → mega. Nunca bajes. Anunciálo una vez en `waves.md`.

- **Directo / cambio chico**: una sola ola, con un team chico.
- **Mega cambio**: varias olas secuenciales, Ola 0 si hay contratos, ola de datos al final.

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

## Paso 3 — `waves.md`: olas y teams

**La propuesta del paquete es una propuesta.** La fuente autoritativa es tu `waves.md`. Podés re-olear, rearmar teams y partir tareas dentro de un plan; no podés cambiar el alcance ni los archivos de un plan sin enmienda.

La forma de trabajar cambió: **el paralelismo vive dentro de la ola.** Cada ola es un worktree único donde 2 a 5 agentes trabajan a la vez sobre el mismo proyecto, como un equipo: cada uno tiene su parte, sabe qué hace el otro y deja sus decisiones escritas.

Armá la matriz:

| Ola | Agente | Zona (crea / modifica región) | Modelo | Interfaces (produce / consume) | Depende de | Datos | Lockfile / build |
|---|---|---|---|---|---|---|---|

Reglas:

- **Olas secuenciales.** Se lanza una ola cuando la anterior está cerrada: commit hecho, gate verde, worktree borrado. Es más fácil contener un daño en una ola que en cinco a la vez.
- **Ola 0 — contratos**: solo si hay contratos nuevos que otras olas consumen. Va sola, con un team mínimo (o un agente), y se cierra antes de lanzar la Ola 1.
- **Team por ola**: 2 a 5 agentes cuando el trabajo se puede partir; un solo agente si la pieza es indivisible, con el motivo escrito.
- **El corte es por piezas que arrancan juntas.** Antes de despachar, contá cuántas piezas pueden empezar **sin esperar a nadie**. Si son menos de dos, no hay team: es una fila. Re-cortá por otra dimensión (por archivo, por pantalla, por endpoint, por zona del árbol) hasta que haya trabajo simultáneo. Una pieza que depende de otra va en la misma zona que su dependencia o en la ola siguiente; nunca como agente que espera sentado.
- **Zonas, no archivos sueltos.** Por agente: qué archivos **crea**, qué archivos **modifica y en qué región** (símbolo, función, bloque, con su ancla), qué archivos **comparte y con quién**, y qué **no toca**. Dos agentes pueden compartir un archivo si cada uno es dueño de una región distinta y declarada; lo que no puede pasar es que dos editen la misma región sin que quede escrito.
- **Tablero obligatorio.** El orquestador crea `<worktree>/.hd-ola-<N>.board.md` antes de despachar, con el mapa del team, y todos lo leen y lo escriben. Sin tablero no hay team.
- **Interfaces congeladas antes del dispatch.** Lo que un agente produce y otro consume se fija en el brief; si un agente necesita cambiarlo, lo anota en el tablero y adapta, en vez de improvisar en silencio.
- **Dependencias y lockfiles**: un plan que agrega o cambia dependencias va **solo**, en su propia ola, y la instalación la hace el orquestador antes de despachar.
- **Generados y archivos compartidos** (barrels, rutas, registros, configuración): un dueño por región, declarado en el tablero.
- **Máximo 5 agentes por team.** Más que eso no se coordina bien. Si hay más piezas, no las apiles en una ola con cola: partí en olas secuenciales.
- **Ola de datos**: todo lo que mueve datos existentes va al final, sola, nunca en paralelo. Antes: confirmación de datos en producción del humano, respaldo y prueba en seco.

Anotá cada ola con: team, zonas, interfaces, modelo por agente, depende de, worktree, estado, commit, gate y tablero. Actualizá el archivo a medida que avanzás.

### El team: un proyecto, varias manos a la vez

La ola no es "varios agentes en serie, cada uno con su archivo". Es un **trabajo en equipo**: un solo proyecto (el worktree), varias personas trabajando al mismo tiempo en partes chicas y distintas, y una pizarra donde cada una deja escrito qué hizo y por qué. Si dos se pisan, el segundo lee el motivo del primero y **corrige o integra**, no sobrescribe a ciegas.

**1. El reparto es preciso o no es reparto.** Nada de "tocá el módulo de usuarios". Cada agente recibe:

| Agente | Crea | Modifica (región exacta) | Compartido | No toca |
|---|---|---|---|---|
| `dev-api` | — | `src/api/users.ts` (completo) | `src/api/routes.ts` → bloque `usersRoutes` (dueño) | `src/ui/**` |
| `dev-db` | `migrations/20261120_nick.sql` | `src/db/schema.ts` → `usersTable` | — | `src/api/**`, `src/ui/**` |
| `dev-ui` | `src/ui/Profile.tsx` | `src/ui/api.ts` → `fetchUser` | `src/api/routes.ts` (solo consume) | `src/db/**` |

**2. El tablero.** Archivo en la raíz del worktree, no commiteado. El orquestador lo abre con el mapa del team, las zonas y las interfaces congeladas. Cada agente **lee todo al empezar** y **agrega una línea** cuando:

- toma una decisión que afecta a otro (cambió una firma, un nombre, un formato);
- necesita tocar un archivo o una región que no es suya;
- encuentra el código distinto de lo que decía su plan;
- **corrige el trabajo de otro agente**;
- termina: estado y qué quedó pendiente.

Formato, una línea por entrada:

```
HH:mm | <agente> | <archivo:región> | <qué hice o decidí> | <por qué> | <impacto en el resto>
```

**3. Protocolo de choque.** Los agentes trabajan a la vez: se ven el código en vivo, no hay turnos.

- **Antes de escribir en un archivo compartido, releelo.** Si cambió desde que lo leíste, integrá tu cambio sobre lo que hay; no lo sobrescribas.
- Si el otro ya resolvió lo tuyo de otra forma y **funciona**: no lo pises; anotá la diferencia en el tablero y seguí con tu zona.
- Si lo que hizo el otro **está roto o contradice su zona**: podés corregirlo. Leé primero su entrada para entender por qué lo hizo, hacé el cambio mínimo y anotá `corrijo <archivo:región> de <agente>: <qué estaba mal> — <qué hice>`.
- **La última decisión escrita manda.** Una decisión que no está en el tablero no existe: si la tomaste, la escribís igual.
- Si después de leer el tablero quedan dos caminos válidos para la misma región, decide el **dueño de la región** y lo anota; el otro consume.

**4. Todos arrancan juntos.** El dispatch va en **un solo mensaje** con todos los agentes de la ola, y el brief lo dice explícito: *"arrancá ya, sin esperar a nadie; si tu zona depende de un compañero, programá contra la interfaz congelada y anotá la dependencia en el tablero"*.

**5. Se mide.** Al cerrar la ola, el orquestador lee el tablero y cuenta: cuántos terminaron `LISTO`, cuántos `TRABADO` y por qué. Un `TRABADO` por esperar a un compañero es un error de corte: va al ledger y se corrige en la ola siguiente.

## Paso 4 — El ciclo de una ola

### 1. Preparar el worktree

**Un worktree por ola** (no por plan): el team entero trabaja ahí.

```
git worktree add --detach .git/hd-wt/<trabajo>/ola-<N> <base-de-la-ola>
```

- Los worktrees viven en `.git/hd-wt/<trabajo>/`, nunca dentro del árbol: un worktree bajo `.hd/` aparece como directorio sin trackear y `git add -A` se lo lleva.
- **Symlinks de dependencias** en vez de reinstalar: `node_modules`, `.venv`, `vendor`, `target/`.
- Todos los agentes de la ola salen de la **misma base** (el HEAD de la rama en el momento del dispatch). Anotá el SHA.
- **Creá el tablero** `<worktree>/.hd-ola-<N>.board.md` antes de despachar: mapa del team, zonas, interfaces congeladas y la regla de releer antes de escribir. Vive en la raíz del worktree y no se commitea: al cerrar la ola se copia a `.hd/<trabajo>/reports/ola-<N>-tablero.md`.
- Si la ola cambia dependencias, no lleva team paralelo: el orquestador instala y commitea el lockfile antes, o el plan va solo.

### 2. Despachar al team

Lanzá todos los agentes de la ola en **un solo mensaje**, cada uno con **rutas**, no con contenido, y con el **modelo de la estrategia** (`provider`, `model` y `reasoning_effort` explícitos en el `subagent`).

**Brief de cada agente** (`dev-<zona>`):

1. Su plan, el spec, el technical spec, el README del prototipo y los contratos de Ola 0 — por ruta.
2. **El mapa del team y el tablero**: quién es cada compañero, qué zona tiene, qué produce y qué consume, y la ruta del tablero. Todos saben qué están haciendo los demás.
3. **Su zona exacta**: qué crea, qué modifica y en qué región, qué comparte y con quién, y qué no toca.
4. **Las interfaces congeladas**: qué consume de sus compañeros y qué produce, con firmas exactas.
5. El worktree absoluto de la ola y la base SHA.
6. La memoria `.hd/memory.md` (leerla antes de empezar).
7. Su ruta de reporte: `.hd/<trabajo>/reports/ola-<N>-<agente>.md` del repo principal.
8. **Arrancá ya, sin esperar a nadie.**

**Contrato del agente**:

1. Escribe **solo código de producción**, solo en su zona: lo que crea y lo que modifica según el reparto. No crea tests, scripts, archivos de verificación ni nada fuera de lo declarado.
2. Implementa según su plan + el spec + el technical spec + las interfaces. No rediseña, no "mejora" fuera del plan, no cambia el alcance.
3. **Trabaja en paralelo, no espera.** Si su zona depende de un archivo que todavía no existe, programa contra la interfaz congelada y anota la dependencia en el tablero.
4. **El tablero es obligatorio**: lo lee entero al empezar y agrega una línea en cada decisión, choque, corrección o al terminar. Lo que no está escrito, no pasó.
5. **Antes de escribir en un archivo compartido, lo relee.** Si cambió desde que lo leyó, integra su cambio sobre lo que hay; no sobrescribe el trabajo de un compañero.
6. **Puede corregir la zona de otro** solo si lo que encontró está roto o contradice lo declarado: lee primero su entrada del tablero para entender el motivo, hace el cambio mínimo y lo anota como `corrijo <archivo:región> de <agente>: <qué estaba mal> — <qué hice>`. No corrige por estilo ni por gusto.
7. Respeta las convenciones del repo: linter, formatter, nombres, estructura, manejo de errores.
8. **No ejecuta scripts de ningún tipo**: ni build, ni lint, ni typecheck, ni tests, ni migraciones, ni servidores, ni git. No commitea, no toca la rama.
9. **No deja restos**: nada de `console.log` de debug, código comentado, TODOs sin dueño ni temporales.
10. Si el plan no dice qué pasa en un caso borde, **reporta `NECESITA_CONTEXTO`**; no inventa comportamiento.
11. Reporta estado (`LISTO` / `LISTO_CON_DUDAS` / `NECESITA_CONTEXTO` / `TRABADO`), archivos tocados, decisiones y qué parte de su zona quedó pendiente.

Nombrá a cada agente por su zona (`dev-api`, `dev-db`, `dev-ui`, `dev-migracion`). Un nombre claro evita que dos hagan lo mismo.

### 3. Inspeccionar antes de integrar

```
git -C <wt> status --short
git -C <wt> diff --stat
```

- **Leé el tablero**: es la fuente de qué decidió cada agente y por qué.
- El chequeo ya no es "tocó un archivo ajeno = violación" sino **"todo archivo o región fuera de su zona tiene que estar explicado en el tablero"**. Sin entrada, es violación de contrato: se devuelve **una vez** a ese agente. Si reincide, freno real.
- Si dos agentes corrigieron la misma región en sentidos opuestos, manda la última entrada escrita; si no cierra, lo resolvés vos con un `Ruling:` y lo anotás.
- Buscá restos (debug, código comentado, TODOs), tests o scripts no pedidos, generados y archivos de otro plan.
- Revisá los reportes solo si necesitás el estado; para el resto, alcanza con `git status`, `diff --stat` y el tablero.

### 4. Consolidar la ola

- **Copiá el tablero** a `.hd/<trabajo>/reports/ola-<N>-tablero.md` y borralo del worktree: el archivo de coordinación no se commitea, pero sus decisiones quedan como artefacto.
- **Commit de transporte**: el orquestador stagea **solo los archivos de los planes** (creados, modificados y eliminados), nunca el tablero, y commitea en el worktree. Los agentes no commitean.
- **Traé el código sin commitear**: `git cherry-pick -n <sha-wip>` en la rama. Cherry-pick y no merge: el worktree salió de la base de la ola. Si conflictúa, hubo dos versiones del mismo archivo sin nota en el tablero: **frená y revisá la ola** antes de seguir.
- **Commit de la ola**: `hd(<trabajo>): ola N — <qué entró>` (código + ledger + waves). **Va antes del gate, no después**: es la base real del gate y del fixer si algo falla.
- **Respaldo**: si está habilitado, subí el commit a `hd-backup/<trabajo>` inmediatamente después del commit, antes del gate. Si falla, anotá y seguí.

### 5. Gate de la ola

Corré en la rama consolidada, en este orden, con la salida a log:

1. **Build / typecheck**: el comando `Build:` del spec. Si no compila, la ola no existe.
2. **Lint / formato**: el comando `Lint:`. Sin errores nuevos; los del baseline con la misma firma se ignoran.
3. **Estándares**: si el repo tiene un comando único de chequeo (`make check`, `pnpm verify`, `npm run check`), ese es el gate.

**Si hay fallos nuevos**:

- Triageá: código mal vs convención mal vs entorno.
- Lanzá **UNA** corrección: un `fixer-ola-<N>` desde el HEAD de la ola, con **todos** los fallos, la ruta del plan y `hd-debug` obligatorio. Causa raíz primero; un cambio por hipótesis; no rediseña, no agrega alcance, no escribe tests y **no ejecuta scripts**: la reproducción y el gate los corre el orquestador. Reporta en `.hd/<trabajo>/reports/fixer-ola-<N>-gate.md`.
- Consolidá con `cherry-pick -n`, commit `hd(<trabajo>): ola N — corrección de gate`, respaldá y re-corré el gate **una vez**.
- Si sigue rojo: **freno real**. No hay segunda corrección.

### 6. Cerrar la ola

- Actualizá el ledger: `Ola N: base <sha>`, `team`, `zonas`, `worktree`, `consolidada <sha>`, `gate <resultado>`, `corrección <sha>`, `estado por agente (LISTO/TRABADO y por qué)`, `Push: ...`.
- Actualizá `waves.md`: estado `cerrada`, commit y gate.
- Borrá el worktree de la ola (`git worktree remove --force` + `git worktree prune`). Ningún worktree sobrevive a su ola.
- Pasá a la siguiente ola.

**Si una ola no cierra, no se lanza la siguiente.** La dependencia no es solo de archivos: es de evidencia. La ola siguiente espera a que la anterior tenga gate verde y worktree borrado.

## Ola 0 y ola de datos

- **Ola 0 (contratos)**: va sola, con un team mínimo o un agente, y se cierra antes de lanzar la Ola 1. Los contratos son código: no los escribe el orquestador.
- **Ola de datos**: última, sola, nunca en paralelo. Antes de aplicar nada: confirmación del humano de que hay datos en producción, respaldo verificado y prueba en seco. **La migración la escribe un subagente implementador; la aplica el orquestador**, nunca un subagente, después del respaldo y la prueba en seco. Si no hay respaldo o prueba en seco, no arranca.

## Evidencia, contexto y ledger

**Ley de hierro:**

```
NINGUNA AFIRMACIÓN DE ÉXITO SIN EVIDENCIA FRESCA EN ESTE TURNO.
```

- "Compila" exige la salida del build que corriste vos, en la rama consolidada. "Pasa el lint" exige lo mismo.
- **Los agentes no ejecutan scripts**: su palabra no es evidencia ni siquiera como filtro. El único verde es el gate del orquestador.

**Presupuesto de contexto:**

- No leas reportes completos. Leé el tablero y el reporte de un agente solo si necesitás su estado; para el resto, usá `git status`/`git diff --stat` contra sus zonas.
- Redirigí toda salida larga a `.hd/<trabajo>/logs/<ola>-<paso>.log` y al contexto traé solo las líneas de fallo.
- No pegues el plan entero en el prompt del agente: pasale la ruta.
- Cuando el trabajo supera las tres olas, **el ledger es tu memoria**: releelo en vez de confiar en el historial.

**Ledger** (`.hd/<trabajo>/ledger.md`): anotá baseline, olas, teams, worktrees, consolidación, gate, correcciones, pushes, estrategia de modelos, permisos premium, enmiendas y rulings. Después de una compactación, creéle al ledger y a git.

## Enmiendas y rulings

- **`Ruling:`** es una decisión técnica que tomaste en nombre del humano: qué, por qué y qué cuesta si te equivocaste. Va al ledger y al cierre.
- **`Enmienda:`** es un cambio de alcance aprobado por el humano: fecha, qué cambió, por qué, impacto y aprobación. Va en `spec.md` y en `waves.md`. Si el cambio es grande, no es una enmienda: es un trabajo nuevo que arranca por discovery.

## Salida

Todas las olas cerradas con evidencia en el ledger → **cargá la skill `hd-review` VOS MISMO** y arrancá la fase 4 en el mismo flujo. No hay pausa humana acá.

Los cambios están en la rama **como un commit por ola**, los worktrees borrados y los commits respaldados en `hd-backup/<trabajo>`.

## Racionalizaciones comunes (y su realidad)

| Excusa | Realidad |
|---|---|
| "El paquete está aprobado, ejecuto y listo" | El paquete se escribió antes. La re-derivación es tu primer trabajo: si el código lo desmiente, frenás. |
| "Ya tengo el chat, no hace falta releer el paquete" | La fuente es el paquete. El chat no es el contrato. |
| "Confío en el research de discovery" | El research es una pista; vos verificás el camino crítico. |
| "Con un agente por ola es más simple" | El default es un team de 2 a 5 trabajando a la vez: la ola se termina más rápido y el daño sigue contenido en la ola. |
| "Hago varias olas en paralelo y gano tiempo" | Varias olas a la vez multiplican el daño y la integración. Se paraleliza dentro de la ola, no entre olas. |
| "Dos agentes en el mismo worktree se pisan" | Se pisan si no hay reparto. Zonas exactas, tablero al día y releer antes de escribir: el paralelismo se busca, no se evita. |
| "El tablero es burocracia" | Es lo único que evita el choque silencioso: sin tablero, el segundo agente sobrescribe sin saber por qué el primero hizo eso. |
| "Si un agente espera, es problema suyo" | Un agente esperando es una ola más lenta y un corte mal hecho: se re-corta el reparto antes de despachar. |
| "Un archivo, un dueño, siempre" | No: dos agentes pueden compartir un archivo con regiones distintas y declaradas. Lo prohibido es editar la misma región sin dejarlo escrito. |
| "El agente puede correr el build para verificar" | No: los agentes del team no ejecutan scripts. El gate lo corre el orquestador en la rama. |
| "Sin tests no verificamos nada" | Verificás build + lint + estándares y, en la fase 4, revisores independientes y un auditor visual de punta a punta. |
| "Escribo un test rápido, total ayuda" | El framework no escribe tests. Un test suelto sin suite y sin dueño es deuda. |
| "Como el agente compila, el build de la rama sobra" | El worktree del agente no es la rama, y además no corre scripts. Su verde no existe como evidencia. |
| "Pasa el lint, entonces está bien" | El lint no lee intención. Eso lo auditan los revisores de la fase 4. |
| "Reviso rápido antes de consolidar, total es un agente" | No: la fase 3 no revisa. Gate e inspección de zonas nada más; la revisión es la fase 4. |
| "Lanzo un revisor por ola para no acumular" | No: se revisa una sola vez, al final, con todas las olas cerradas. Acá no se lanza ningún revisor. |
| "El orquestador lee el diff y opina, es lo mismo" | El orquestador inspecciona contrato (zonas, restos, tablero), no calidad ni intención. Opinar ya es revisar, y eso no se hace acá. |
| "Una corrección más y converge" | Una por gate. Si no alcanza, el diagnóstico está mal o el problema es estructural: freno real. |
| "Lo arreglo yo, lanzar un agente es overhead" | El orquestador no escribe producción. Despachá un fixer. |
| "El push falló, freno el trabajo" | Es un respaldo. Anotá y seguí. |
| "El build no corre en este entorno, sigo igual" | Sin baseline no sabés qué estaba roto antes: el rojo no es atribuible y el verde no es evidencia. Freno real. |
| "El humano preguntó por el estado, le cuento todo" | No está en el loop. Lo que encontrás va al ledger y a `waves.md`; el humano lee el resumen final. |
| "Todos los agentes con el modelo default, total funciona" | El catálogo existe para aprovecharlo: research barato y/o rápido, implementación y fixers calidad/precio, auditoría el mejor. |
| "El modelo premium es mejor, lo uso y listo" | Más de 5 USD/M en cualquier precio publicado exige permiso explícito. Sin ruling previo se pregunta una sola vez; si no, el mejor dentro del presupuesto. |
| "Preguntar por modelos rompe la autonomía de la fase" | Es la única excepción, una sola vez, y solo si la memoria no tiene ruling. Todo lo demás sigue autónomo. |
