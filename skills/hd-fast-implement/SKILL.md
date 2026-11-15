---
name: hd-fast-implement
description: Vía rápida del framework Hiper-driven (HD), fuera de la cadena de 5 fases. Usar para cambios cortos o medianos sobre algo ya construido —renombrar, mover una pieza, ajustar un comportamiento puntual, arreglar un bug chico, crear o ajustar una migración de esquema, sumar una dependencia— cuando el cliente quiere velocidad y no trazabilidad. Tiene tres fases por cambio —preguntas con contexto, implementación por un subagente y auditoría por un subagente—. El agente principal no edita código; escribe el brief, revisa el diff, commitea y corre los checks. Se puede invocar en cualquier conversación o al final de un spec, en la revisión humana, y se invoca automáticamente si el cliente detecta un comportamiento erróneo o pide un cambio. Cada implementación y cada corrección se commitea. Sin spec, sin planes, sin rama nueva, sin worktree y sin artefactos .hd. Los checks estáticos se corren al cierre. No hay tests salvo que el cliente los pida.
---

# HD — Vía rápida: `/hd-fast-implement`

Esta skill **no es una fase de HD**. Es la vía rápida para cambios cortos o medianos sobre algo ya construido. Tiene **tres fases por cambio**:

| Fase | Quién | Qué hace |
|---|---|---|
| **1. Preguntas con contexto** | agente principal | inspecciona el código y, si hace falta, hace 2-3 preguntas |
| **2. Implementación** | subagente `impl-fast` | hace el cambio en el árbol actual y reporta |
| **3. Auditoría** | subagente `auditor-fast` | revisa el commit, busca bugs, ambigüedades, seguridad y fallos |

Si la auditoría encuentra algo, un **subagente `fixer-fast`** corrige; el agente principal revisa el diff y commitea la corrección. La auditoría es **siempre prompt -> subagente**. No es el agente principal revisándose.

**El agente principal no edita código de producción.** Escribe el brief, revisa el diff, commitea y corre los checks. Los cambios los hacen subagentes.

**Cada implementación y cada corrección tienen su propio commit.** No hay squash, amend ni rebase. Los commits los hace el agente principal; los subagentes no commitean.

Se puede invocar:

- en **cualquier conversación**;
- al **final de un spec**, en la revisión humana, cuando el cliente detecta un comportamiento erróneo o pide un cambio chico. El agente principal la invoca automáticamente si el pedido entra en la vía rápida.

**Qué no tiene**: spec, planes, rama nueva, worktree, artefactos `.hd/`, gate por ola ni auditoría de cierre. Los checks estáticos se corren al cierre.

## Qué entra y qué no

Entra **cualquier cambio** sobre algo existente que el cliente pueda probar y revisar, mientras sea **un solo cambio coherente**. No importa cuántos módulos, paquetes o repos toque, ni el dominio, ni el tamaño del diff: importa que no mezcle objetivos.

Ejemplos:

- Renombrar algo y actualizar sus referencias, aunque el nombre atraviese varios módulos o repos.
- Mover una pieza de sección, módulo o pantalla, y actualizar imports/exports donde haga falta.
- Corregir un comportamiento puntual: "esto debe hacer X, no Y".
- Arreglar un bug chico y acotado.
- Ajustar copy, estilos, labels o validaciones simples.
- Un refactor contenido o amplio, mientras siga siendo un solo cambio.
- Un ajuste en auth, permisos o pagos: chico o estructural, entra igual.
- Crear, ajustar o revertir una migración de esquema: borrar un catálogo (tabla), tocar un enum, agregar o quitar una columna, un índice, una constraint o una FK. Un `DROP TABLE`/`DROP COLUMN` pedido por el cliente entra: no hay vuelta atrás de los datos y el cliente lo sabe.
- Una migración **con backfill**: transformar filas, mover datos, `UPDATE`/`INSERT` masivos, poblar una columna a partir de otra. Entra; el reporte dice qué se pierde o qué se reescribe.
- Sumar o quitar una dependencia.
- Sumar tests, si el cliente los pide o el repo los espera.

**No entra** — y son las **únicas tres** razones para quedarse afuera:

- **Son varios cambios distintos entre sí**, o el diff mezcla cambios de distinto tipo y no se puede revisar como un solo cambio.
- **Toca configuración de despliegue, secretos, CI o archivos generados** (`dist/`, `build/`, lockfiles).
- **No podés describir el resultado esperado en dos o tres frases.**

En esos casos, la salida es `hd-discovery` (o terminar la fase en curso y esperar el cierre).

**Nada más bloquea**: ni el dominio, ni el tamaño del diff, ni que haya que diseñar algo nuevo, ni que la migración mueva o borre datos, ni una dependencia nueva, ni los tests, ni el estado de otro trabajo HD, ni un merge o rebase en curso en el repo.

### Alcance: el límite es el cambio, no el mapa

- **No hay límite por módulo, paquete o repo.** Un rename puede atravesar tres módulos o dos repos y seguir siendo un cambio fast: es el mismo cambio, repetido donde hace falta.
- **El número de archivos no decide.** Un ajuste de copy en 20 archivos entra; un cambio de tres archivos que mezcla un fix, un refactor y una feature nueva, no.
- **Lo que decide es la coherencia**: un solo objetivo, un diff que el cliente puede revisar y un resultado que puede probar. Si necesitás un párrafo con varios "además", no es fast.
- **Una migración es un cambio coherente**, con o sin backfill. Si además cambia el modelo de datos de un servicio que la consume, eso ya es otro cambio: partilo o salí a HD.
- **Una dependencia nueva es un cambio coherente** si no arrastra otros objetivos. Si trae un rediseño, eso ya es otro cambio.
- **Si el diff te sorprende a vos mismo**, frená y avisá antes de seguir.

## Antes de tocar nada

1. **Árbol y repos**: mirá el estado de **cada repo** que vas a tocar (`git status --short`) y anotá su `HEAD` (`git rev-parse --short HEAD`): es la base y el punto de retorno.
2. **Rama**: se trabaja sobre la rama actual de cada repo; los commits van ahí. No se crean ramas. Si es la default, decilo en el reporte.
3. **Cambios ajenos**: si hay archivos modificados que no son del cambio, el subagente no los toca y el agente principal no los commitea: stageá solo las rutas del cambio y avisá en el reporte.
4. **Checks de cierre**: identificá los comandos de build, lint y estándares de cada repo (package.json, Makefile, CI, README). **No los corras todavía**: son para el cierre. Si no existen, anotá "no aplica" y decilo en el reporte de cierre; no inventes comandos.
5. **Migraciones**: identificá cómo se genera y cómo se aplica (ORM, carpeta de migraciones, comando). La migración la escribe el subagente; se aplica solo en el entorno que el cliente indique; no contra producción sin autorización explícita. Un `DROP TABLE`/`DROP COLUMN` es irreversible: el cliente lo sabe, pero el reporte tiene que decir qué se pierde.
6. **Alcance**: ubicá el código, leé lo que se va a tocar y a sus consumidores directos. Hacé la lista de archivos, módulos o repos. Si es un solo cambio coherente, seguí; si son varios cambios distintos, salí a HD **antes de editar**.
7. **Si no es un repo git**, no hay diff ni commit: reportá los archivos tocados.

**No hay discovery completo**: el reconocimiento es el mínimo para no romper nada. Pero **primero se mira el código y después se pregunta**, no al revés.

## Fase 1 — Preguntas con contexto

**La regla de oro de esta fase: el código primero.** Antes de preguntar, el agente principal inspecciona:

- el archivo que se va a tocar, sus imports/exports y sus llamadores;
- el patrón que ya usa el repo para hacer algo parecido;
- las convenciones de nombres, errores, formato y estructura;
- el estado de git y los cambios recientes que puedan explicar el pedido.

Con eso, decide:

- **Si el pedido es claro**, no pregunta: pasa a la fase 2.
- **Si es ambiguo o falta un dato que cambia el resultado**, hace **hasta 2-3 preguntas concretas**, con opciones. No es la regla de una por turno de HD: en la vía rápida se puede juntar un par, siempre después de haber mirado el código.
- **No convierte el cambio en una entrevista.** Si la respuesta está en el código, no la pregunta.
- **Si el cliente dice "no sé"**, elige la opción conservadora, lo dice en el reporte y sigue; o hace una pregunta más si de verdad cambia el resultado.

Las preguntas y respuestas quedan en la conversación. La vía rápida no crea artefactos: el reporte final menciona las decisiones.

## Fase 2 — Implementación

**El cambio lo hace un subagente.** El agente principal escribe el brief, despacha, revisa el diff y commitea. No edita código de producción.

### 1. Briefear al subagente `impl-fast`

Pasale:

- el pedido del cliente y el resultado esperado;
- **la lista exacta de archivos** que puede tocar;
- las convenciones del repo y el patrón que tiene que seguir;
- el alcance: un solo cambio, sin refactors colados, sin tests nuevos salvo que el cliente los haya pedido;
- la regla de **no commitear, no tocar la rama, no correr checks**;
- el formato de reporte: estado, archivos tocados, decisiones y autolectura del diff.

El subagente trabaja **en el árbol actual**, no en un worktree. Si el cambio toca un bug, investiga la causa raíz con `hd-debug`, pero no corre builds: la reproducción la aporta el cliente o el hallazgo.

### 2. Revisar el diff

Cuando el subagente termina:

```
git status --short
git diff -- <archivos del cambio>
```

- Verificá que tocó **solo** los archivos del brief y que no hay restos de debug, tests no pedidos ni cambios fuera de alcance.
- Si el diff está mal, **no lo arregles vos**: devolvéselo al subagente con el problema concreto y pedile **una** corrección. Si reincide, frená.
- Si hay cambios ajenos en el árbol, no los mezcles: stageá solo las rutas del cambio.

### 3. Commitear

- Stageá **solo** los archivos del cambio (por ruta, nunca `git add -A` a ciegas).
- Mensaje claro (convención del repo; si no hay, `hd-fast: <resumen>`).
- Anotá el SHA. **No amendees, no squashées, no rebasees.**
- **No corras build, lint, typecheck, tests ni ningún comando de chequeo.** No es que no haga falta: es que el auditor es semántico y los checks se pagan una sola vez, al cierre. No declares que compila ni que pasa el lint: no lo corriste.

El commit de la implementación es la entrada de la auditoría.

## Fase 3 — Auditoría

**Siempre prompt -> subagente.** Después del commit, el agente principal lanza un `auditor-fast` independiente. No participó de la implementación.

### Qué le pasás

- el pedido del cliente y el resultado esperado;
- el **SHA del commit** y su diff (`git show <sha>` o `git diff <padre>..<sha>`);
- las convenciones del repo y el contrato de la vía rápida: sin tests nuevos salvo que el cliente los haya pedido, sin cambio de alcance, sin checks en la iteración;
- qué tiene que buscar.

### Qué busca

1. **Bugs**: condiciones borde, flujos incompletos, errores silenciados, referencias rotas.
2. **Ambigüedades**: comportamiento que el pedido no define y el código resolvió por su cuenta.
3. **Seguridad**: inyecciones, secretos, validaciones faltantes, auth esquivable, permisos.
4. **Fallos posibles que el implementador no contempló**: concurrencia, estados intermedios, datos raros, reintentos, migraciones, compatibilidad.
5. **Alcance**: cambios fuera de lo pedido, refactors colados, tests no pedidos, archivos que no corresponden.
6. **Restos**: debug, código comentado, TODOs sin dueño, temporales.
7. **Datos y despliegue**: migraciones destructivas, DML masivo, configuración, secretos.

El auditor **lee** código y diff; no edita, no commitea, no corre builds ni checks. Devuelve hallazgos con **archivo:línea**, severidad, por qué es un problema y qué habría que verificar. Si no encuentra nada, responde **sin hallazgos** y el cambio queda cerrado.

### Si hay hallazgos

- **Una sola pasada de corrección**, con **todos** los hallazgos juntos, no de a uno.
- La corrección la hace un **subagente `fixer-fast`**, no el agente principal. Si el hallazgo es un bug, `hd-debug` obligatorio: causa raíz primero, un cambio por hipótesis, la reproducción del hallazgo antes y después.
- Cambio mínimo, sin rediseñar, sin ampliar alcance, sin tests nuevos. Reporta en el chat; no commitea.
- El agente principal revisa el diff de la corrección y **commitea**: `hd-fast: corrección — <resumen>`. No amendees el commit anterior.
- Pedile al auditor **una confirmación acotada a los hallazgos**, no una auditoría completa de nuevo.
- Si confirma, el cambio queda cerrado. Si vuelve a denegar, **no hay segunda ronda automática**: reportá al cliente con diagnóstico. Si el mismo problema resiste **3 fixes**, es arquitectura: frená y discutí con el cliente.
- Si la corrección cambia comportamiento, decile al cliente que vuelva a probar.

La auditoría no crea artefactos `.hd/`: la conversación y los mensajes de commit son el registro. El reporte final del cambio resume los hallazgos y cómo se resolvieron.

## Varios pedidos a la vez

La vía rápida está pensada para que el cliente pueda pedir otro cambio **sin esperar a que termine una auditoría**. La regla es simple:

- **Las ediciones son secuenciales**: un solo subagente implementador o fixer edita el árbol por vez. Si el cliente pide otro cambio mientras se está editando, el agente principal termina el cambio atómico actual, lo commitea y después arranca el nuevo. No se mezclan dos cambios en el mismo diff.
- **Las auditorías son paralelas**: la auditoría mira un commit, no el árbol de trabajo. Después de commitear el cambio A, el agente principal puede lanzar al auditor y empezar las preguntas o la implementación del cambio B. El auditor no bloquea.
- **Si la auditoría devuelve hallazgos mientras hay otro cambio en curso**: el agente principal encola la corrección, termina y commitea el cambio en curso, y después despacha el fixer sobre el HEAD actual. Si el cambio posterior ya tocó las mismas líneas, se reconcilia; si el hallazgo ya no aplica, se le dice al auditor y se le pide confirmación.
- **Si los hallazgos llegan mientras se está en las preguntas de otro cambio**: la corrección tiene prioridad; se aplica antes de empezar la nueva implementación. El cliente puede seguir preguntando o pidiendo; no se bloquea.
- **Cada cambio y cada corrección conservan su commit.** No hay squash ni un commit único al final. Si un cambio posterior deja obsoleto un hallazgo anterior, se anota en el reporte.

Mantené una cola corta en la conversación (cambio, estado, SHA). No hace falta un archivo: la vía rápida no deja artefactos.

> **El cliente nunca espera a que termine una auditoría para pedir otro cambio. Lo que no se hace es editar dos cambios a la vez.**

## Cierre: los checks, cuando el cliente da el OK

Las tres fases terminan con la auditoría. **El cierre estático es aparte** y lo dispara el agente principal cuando el cliente dice que está todo bien, que funciona, que está terminado. También puede correrlo el cierre de HD si la vía rápida se invocó al final de un spec.

1. **Corré todos los checks que haya**, en **cada repo tocado**, en este orden:
   - **Build / typecheck** — el comando del repo. Sin errores nuevos.
   - **Lint / formato** — el comando del repo. Sin errores nuevos; los preexistentes con la misma firma se anotan, no se arreglan.
   - **Estándares** — si el repo tiene un comando único de chequeo (`make check`, `pnpm verify`, `npm run check`), corrélo. Si no, el chequeo de convenciones lo hizo el auditor.
2. **Si todo pasa**: reporte de cierre con la evidencia fresca, los commits y los veredictos del auditor. La vía rápida se cierra.
3. **Si algo falla**:
   - si el fallo es del cambio, **despachá un subagente fixer-fast**, que corrija con `hd-debug`, y commiteá la corrección; volvé a correr **todos** los checks;
   - si el fix cambia comportamiento, pasalo por el auditor para una confirmación acotada;
   - si el fallo es preexistente y no lo causaste, reportalo como residual y cerrá con esa salvedad; no lo arregles fuera de alcance;
   - si el fallo es atribuible al cambio y no se puede dejar verde, reportá con diagnóstico: la vía rápida no se cierra.
4. **No hay "verde" antes del cierre.** Durante la iteración no hay evidencia estática: hay código editado por un subagente, commits y una auditoría semántica. El reporte de cierre es el primero que puede decir "build OK / lint OK".

Si hay migraciones, el reporte de cierre dice si quedaron aplicadas o pendientes y en qué entorno. No las corras contra producción sin autorización explícita.

No hay push ni rama nueva. Los commits quedan locales; si la vía rápida se invocó al final de un spec, el cierre de HD pushea la rama si corresponde.

## Invocación desde la revisión humana de un spec

Al final de `hd-review`, cuando el cliente prueba el comportamiento:

- Si reporta un **bug chico** o pide un **cambio** que entra en la vía rápida, **cargá esta skill automáticamente**. No esperes a que el cliente invoque el nombre: el agente principal decide y lo dice.
- La vía rápida trabaja sobre **la misma rama** del trabajo HD, hace sus tres fases y commitea. El auditor de la vía rápida cubre el cambio; no hace falta re-auditar todo el trabajo con el auditor de cierre.
- Registrá los SHAs de los cambios fast en el bloque **Prueba del cliente** de `review-progress.md`.
- Después del cambio, el cliente vuelve a probar. Si aprueba, sigue el cierre de HD; los commits fast se conservan y el cierre los lista.
- Si el pedido **no entra** en la vía rápida (varios objetivos, deploy/secretos/CI/generados, datos o contratos grandes, alcance nuevo), no lo fuerces: seguí con el subagente fixer + auditor de HD, o volvé a discovery.

La vía rápida **complementa** la auditoría de cierre: no la reemplaza para el trabajo anterior, y no necesita que el auditor de cierre vuelva a mirar todo por un cambio chico.

## Si el cambio crece (salida de la vía rápida)

La vía rápida se sale por las mismas tres razones de la puerta de entrada, una vez adentro: el cambio deja de ser **un solo cambio** (varios objetivos distintos, un diff que no se revisa de una vez), empieza a tocar **deploy, secretos, CI o generados**, o deja de poder describirse en **dos o tres frases**.

1. Decí qué creció y por qué ya no es fast.
2. Si todavía no se editó: no edites; ofrecé `hd-discovery`.
3. Si ya se editó: **commiteá los archivos como WIP** (`hd-fast: WIP — <motivo>`) para no perderlo, y mostrá qué quedó (`git log --oneline -n 3`, `git show --stat <sha>`). Ofrecé dos salidas:
   - conservar ese commit y arrancar `hd-discovery` desde ahí (el trabajo HD decide si lo incorpora al spec o lo revierte);
   - revertir ese commit con autorización (`git revert <sha>`) y arrancar HD desde un árbol limpio.
4. **No reviertas ni reescribas historia sin autorización explícita.** Nunca `git checkout .`, `git reset --hard`, `git clean`, `git rebase` ni `git commit --amend`.

Si el cliente insiste en seguir fuera de alcance, es su decisión, pero decilo como **excepción explícita** en el reporte: la vía rápida ya no aplica y no hay garantías HD.

## Relación con las otras skills

| Skill | Relación |
|---|---|
| `hd-discovery` | La salida cuando el cambio cae en una de las tres excepciones. |
| `hd-spec` | No se usa acá: no hay spec, technical spec ni planes. |
| `hd-implement` | No se usa dentro de una ola. Sí después de la entrega, en la revisión humana, sobre la misma rama. |
| `hd-review` | Se invoca desde la prueba del cliente para bugs chicos o cambios; complementa la auditoría de cierre. |
| `hd-close` | Los commits fast se conservan; el cierre los lista, corre los checks si hace falta y pushea la rama si corresponde. |
| `hd-debug` | Para bugs y correcciones de la auditoría: causa raíz primero. |

## Racionalizaciones comunes (y su realidad)

| Excusa | Realidad |
|---|---|
| "Es rapidito, no hace falta mirar el codebase" | El reconocimiento mínimo evita romper un llamador que no viste. Y la fase 1 es código primero: sin mirar, no preguntes. |
| "Pregunto primero y después miro" | Al revés. El código responde la mitad de las dudas y hace mejores las preguntas. |
| "Le mando todas las preguntas juntas" | Hasta 2-3, después de inspeccionar. No es una entrevista ni un discovery. |
| "Hago el cambio yo, total es rápido" | No: el código lo escribe un subagente. El agente principal escribe el brief, revisa el diff y commitea. |
| "Lanzo un subagente para que lo haga más rápido" | El subagente no es un acelerador opcional: es el que implementa. El agente principal no edita producción. |
| "El auditor es el mismo modelo, no hace falta" | La auditoría es un subagente independiente. La autolectura del diff no es una auditoría. |
| "El auditor encontró algo, lo arreglo y listo" | La corrección la hace un subagente fixer; el agente principal revisa y commitea. Sin commit no hay punto de retorno. |
| "Una corrección más y converge" | Una pasada por auditoría. Si no alcanza, el diagnóstico está mal o el problema es estructural: reportá. |
| "El cliente dijo que anda, ya está" | El OK habilita el cierre, pero el cierre corre todos los checks igual. |
| "Los checks fallan, pero el cliente ya aprobó" | No se cierra: se corrige con un subagente, se commitea y se vuelven a correr. |
| "Lo dejo sin commitear hasta el final" | Cada implementación y cada corrección se commitean al terminar. |
| "Commiteo todo junto al final" | No: un commit por implementación y uno por corrección. |
| "Hago amend del commit anterior para no ensuciar el historial" | No: cada iteración es un commit nuevo. |
| "Es un bug, pruebo cambiando X" | `hd-debug`: causa raíz primero, con la reproducción que aporta el cliente. |
| "Creció, pero ya casi está" | "Ya casi" es la alarma, no el argumento: salí a HD. |
| "El auditor puede corregir" | No: el auditor lee y reporta; la corrección la hace un subagente fixer. |
| "El auditor puede pedir tests" | No: la vía rápida no agrega tests salvo que el cliente los pida. |
| "El agente principal puede hacer el fix, total es chico" | No: el código lo escriben subagentes. El agente principal commitea y corre los checks. |

## Reporte de implementación (después de cada cambio)

```
**Cambio**: <2-3 líneas de qué se hizo y por qué>
**Commit**: <sha> — <mensaje>
**Archivos/repos**: <git status --short / git diff --stat, separado por repo>
**Decisiones**: <las preguntas que hiciste y qué elegiste>
**Para probar**: <pasos exactos o caso que el cliente tiene que validar>
**Migración**: no aplica | <archivo, DDL, destructiva sí/no, qué se pierde, cómo aplicarla>
**Checks**: no corridos (por diseño; se corren en el cierre)
**Auditoría**: <en curso | sin hallazgos | hallazgos corregidos (sha)>
**Pendiente / riesgo**: <lo que quedó fuera de alcance o no se pudo verificar>
```

No declares que compila ni que pasa el lint: no lo corriste. Lo único que podés afirmar es qué cambió el subagente, qué commiteaste y qué tiene que probar el cliente.

## Reporte de cierre (después del OK del cliente)

```
**Cambio**: <2-3 líneas de qué se hizo y por qué>
**Commits**: <N> implementaciones y <M> correcciones — último `<sha>` (<mensaje>)
**Archivos/repos**: <git status --short / git diff --stat, separado por repo>
**Migración**: no aplica | <archivo, aplicada en <entorno> | pendiente>
**Auditorías**: <una por cambio, con veredicto: sin hallazgos | corregido | residual>
**Checks de cierre**: Build <resultado> · Lint <resultado> · Estándares <resultado>
**No toqué**: <fuera de alcance / preexistente>
**Riesgo / pendiente**: <lo que el cliente todavía tiene que decidir>
**Siguiente paso**: los commits quedaron locales; el push lo decidís vos (o lo hace el cierre de HD si estabas en un spec).
```

El reporte de cierre es lo que el cliente tiene para decidir. Que sea honesto: lo que no probaste, no lo declares probado; lo que no corrió, no lo declares verde.

## Fin de la vía rápida

La vía rápida termina cuando el cliente aprobó el comportamiento, los checks del cierre corrieron (o su "no aplica" explícito) y cada implementación y cada corrección quedaron commiteadas. No hay fase siguiente. Si estabas en la revisión humana de un spec, seguís con el cierre de HD; si no, el cliente decide.
