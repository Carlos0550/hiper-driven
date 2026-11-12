---
name: hd-fast-implement
description: Vía rápida del framework Hiper-driven (HD), fuera de la cadena de 5 fases. Usar para cambios cortos o medianos sobre algo ya construido —renombrar, mover una pieza, ajustar un comportamiento puntual, arreglar un bug chico, crear o ajustar una migración de esquema, sumar una dependencia— cuando el humano quiere velocidad y no trazabilidad; sin spec, sin planes, sin rama, con un commit por iteración, sin revisores ni correctores. El mismo modelo hace todos los cambios y los commitea iteración por iteración. Entre iteraciones NO se corren builds, lints ni checks; el humano prueba. Cuando el humano da el OK final, recién ahí se corre todo y se cierra. Solo tres cosas la dejan afuera: varios cambios distintos entre sí (un diff que no se revisa como un solo cambio), tocar deploy, secretos, CI o archivos generados, o no poder describir el resultado esperado en dos o tres frases. Si cae en una de esas tres, va a hd-discovery.
---

# HD — Vía rápida: `/hd-fast-implement`

Esta skill **no es una fase de HD**. Es una puerta lateral para cambios cortos o medianos sobre algo que ya está construido: renombrar, mover una pieza de sección, corregir un comportamiento puntual, arreglar un bug chico, crear o ajustar una migración de esquema (con o sin backfill), sumar o quitar una dependencia. Cambia el código y deja **un commit por iteración**; no escribe spec ni planes, no crea ramas ni worktrees, no lanza revisores ni correctores, y no deja artefactos `.hd/`.

**El mismo modelo hace todo**: lee, edita, revisa su diff y reporta.

> **El precio es explícito**: sin revisor independiente, la confianza la pone el humano al probar el comportamiento. Los checks estáticos no se corren entre iteraciones: se corren todos al final, cuando el humano da el OK. Si el cambio tiene que ser confiable sin que nadie lo mire, no es fast: es HD.

## Ley de hierro

```
CADA ITERACIÓN TERMINA EN UN COMMIT: SI ALGO SE ROMPE, SE SABE EN CUÁL.
ENTRE ITERACIONES NO SE CORREN CHECKS: EL HUMANO PRUEBA.
EL CIERRE NO SE DECLARA SIN TODOS LOS CHECKS QUE EXISTAN (O SU "NO APLICA" EXPLÍCITO).
```

- **Cada iteración termina en un commit.** Stageá solo los archivos de esa iteración, commiteá con un mensaje claro y anotá el SHA. No dejes una iteración sin commit.
- **No reescribas la historia**: nada de `git commit --amend`, squash ni rebase. Cada iteración es un commit nuevo; el commit es el punto de retorno.
- **El commit es local**: no pusheás. Si algo se rompe, el humano compara contra el commit anterior y se corrige en una iteración nueva.
- **Durante la iteración** no corrés build, lint, typecheck, tests ni ningún comando de chequeo. No es que no haga falta: es que el humano es el tester y los checks se pagan una sola vez, al final.
- **Durante la iteración** no afirmes que compila, que pasa el lint o que "debería andar". No lo corriste; no lo sabés. Decí qué cambiaste y qué tiene que probar el humano.
- **El cierre** se dispara con el OK del humano ("está todo bien", "funciona", "listo"). Recién ahí corrés **todos** los checks del repo y reportás la evidencia fresca.

## Puerta de entrada: ¿entra o no?

Entra **cualquier cambio** sobre algo existente que el humano pueda probar y revisar, mientras sea **un solo cambio coherente**. No importa cuántos módulos, paquetes o repos toque, ni el dominio, ni el tamaño del diff: importa que no mezcle objetivos.

Ejemplos:

- Renombrar algo y actualizar sus referencias, aunque el nombre atraviese varios módulos o repos.
- Mover una pieza de sección, módulo o pantalla, y actualizar imports/exports donde haga falta.
- Corregir un comportamiento puntual: "esto debe hacer X, no Y".
- Arreglar un bug chico y acotado.
- Ajustar copy, estilos, labels o validaciones simples.
- Un refactor contenido o amplio, mientras siga siendo un solo cambio.
- Un ajuste en auth, permisos o pagos: chico o estructural, entra igual.
- Crear, ajustar o revertir una migración de esquema: borrar un catálogo (tabla), tocar un enum (agregar un valor o quitar uno que queda sin uso), agregar o quitar una columna, un índice, una constraint o una FK. Un `DROP TABLE`/`DROP COLUMN` pedido por el humano entra: no hay vuelta atrás de los datos y el humano lo sabe.
- Una migración **con backfill**: transformar filas, mover datos, `UPDATE`/`INSERT` masivos, poblar una columna a partir de otra. Entra; el reporte dice qué se pierde o qué se reescribe.
- Sumar o quitar una dependencia.
- Sumar tests, si el humano los pide o el repo los espera.

**No entra** — y son las **únicas tres** razones para quedarse afuera:

- **Son varios cambios distintos entre sí**, o el diff mezcla cambios de distinto tipo y no se puede revisar como un solo cambio.
- **Toca configuración de despliegue, secretos, CI o archivos generados** (`dist/`, `build/`, lockfiles).
- **No podés describir el resultado esperado en dos o tres frases.**

En esos casos, la salida es `hd-discovery` (o terminar la fase en curso y esperar el cierre).

**Nada más bloquea**: ni el dominio (auth, pagos, criptografía, datos personales), ni el tamaño del diff, ni que haya que diseñar algo nuevo, ni que la migración mueva o borre datos, ni una dependencia nueva, ni los tests, ni el estado de otro trabajo HD, ni un merge o rebase en curso en el repo.

### Alcance: el límite es el cambio, no el mapa

- **No hay límite por módulo, paquete o repo.** Un rename puede atravesar tres módulos o dos repos y seguir siendo un cambio fast: es el mismo cambio, repetido donde hace falta.
- **El número de archivos no decide.** Un ajuste de copy en 20 archivos entra; un cambio de tres archivos que mezcla un fix, un refactor y una feature nueva, no.
- **Lo que decide es la coherencia**: un solo objetivo, un diff que el humano puede revisar y un resultado que puede probar. Si necesitás un párrafo con varios "además", no es fast.
- **Una migración es un cambio coherente**, con o sin backfill. Si además cambia el modelo de datos de un servicio que la consume, eso ya es otro cambio: partilo o salí a HD.
- **Una dependencia nueva es un cambio coherente** si no arrastra otros objetivos. Si trae un rediseño, eso ya es otro cambio.
- **Si el diff te sorprende a vos mismo**, frená y avisá antes de seguir.

### Antes de tocar nada

1. **Árbol y repos**: mirá el estado de **cada repo** que vas a tocar (`git status --short`) y anotá su `HEAD` (`git rev-parse --short HEAD`): es la base y el punto de retorno.
2. **Rama**: trabajás sobre la rama actual de cada repo; los commits van ahí. No creás ramas. Si es la default, decilo en el reporte.
3. **Cambios ajenos**: si hay archivos modificados que no son tuyos, no los commitees ni los reviertas: stageá solo tus rutas y avisá en el reporte.
4. **Checks de cierre**: identificá los comandos de build, lint y estándares de cada repo (package.json, Makefile, CI, README). **No los corras todavía**: son para el cierre. Si no existen, anotá "no aplica" y decilo en el reporte de cierre; no inventes comandos.
5. **Migraciones**: identificá cómo se genera y cómo se aplica (ORM, carpeta de migraciones, comando). Corréla solo en el entorno que el humano indique; no contra producción sin autorización explícita. Un `DROP TABLE`/`DROP COLUMN` es irreversible: el humano lo sabe, pero el reporte de iteración tiene que decir qué se pierde.
6. **Alcance**: ubicá el código, leé lo que vas a tocar y a sus consumidores directos. Hacé la lista de archivos, módulos o repos que pensás tocar. Si es un solo cambio coherente, seguí; si son varios cambios distintos, salí a HD **antes de editar**.
7. **Si no es un repo git**, no hay diff ni commit: reportá los archivos tocados.

No hay discovery completo: el reconocimiento es el mínimo para no romper nada. Si falta un dato que cambia el resultado, hacé **una** pregunta y seguí; no conviertas el cambio en una entrevista.

## El trabajo

1. **Leé antes de editar**: el archivo que vas a tocar, sus imports/exports, sus llamadores y el patrón que ya usa el repo. No inventes convenciones.
2. **Cambio mínimo.** Un cambio, un objetivo. Nada de "ya que estoy": ni reformateos masivos, ni renombres colaterales, ni refactors no pedidos, ni comentarios decorativos.
3. **Seguí las convenciones de la casa**: nombres, estructura, manejo de errores, imports, formato. Un cambio que respeta el pedido pero rompe el estilo del repo no está listo.
4. **Renombrar o mover**: buscá **todas** las referencias (código, strings, docs, configs, tests existentes) y actualizalas. El build no ve las referencias en strings; como no vas a compilar en la iteración, la búsqueda es tu red. Verificá con una búsqueda del nombre viejo antes de dar por cerrado.
5. **Comportamiento**: ubicá el punto exacto donde se decide el comportamiento. No parchees el síntoma en la capa de arriba si la causa está abajo.
6. **Migraciones**: escribí la migración completa, esquema y datos. Si es destructiva (`DROP TABLE`, `DROP COLUMN`, `DROP TYPE` o quitar un valor de enum) o hace DML masivo, decí en el reporte de iteración qué se pierde o se reescribe y que no hay rollback de datos. No la apliques sin autorización; si hay que aplicarla para probar, la corrés solo en el entorno que el humano indique.
7. **Bug**: `hd-debug` manda para la causa raíz, pero **la reproducción la aporta o la corre el humano**, no vos: no corrés checks en la iteración. Pedile el caso, los pasos o el log; investigá leyendo el código y el reporte. Si no hay reproducción, no arregles a ciegas. **Tres fixes fallidos reportados por el humano sobre el mismo problema = frená y cuestioná la arquitectura con el humano.**
8. **Tests**: si el repo ya tiene tests y tu cambio rompe referencias, actualizá esas referencias. Si el humano pidió tests nuevos, escribilos; no los corras: el cierre decide.
9. **Sin restos**: nada de `console.log`/`print` de debug, código comentado, TODOs sin dueño, archivos temporales ni backups `.bak`.
10. **No toques lo que no pediste.** Si encontrás otro bug o una mejora obvia, anotala y reportala; no la arregles de paso: eso ya es otro cambio.
11. **Autolectura del diff antes de reportar (por iteración)**: leé tu propio diff completo (`git diff -- <tus archivos>`). Buscá cambios fuera de alcance, restos de debug, referencias rotas, formato ruidoso y cualquier cosa que no puedas explicar. **No es un check ni un revisor**: es leer, y es la última pasada antes de que el humano pruebe. Corregí lo que encuentres antes de reportar.
12. **Commiteá la iteración**: stageá **solo** los archivos de este cambio (por ruta, nunca `git add -A` a ciegas), con un mensaje claro (convención del repo; si no hay, `hd-fast: <resumen>`). Anotá el SHA para el reporte. **No amendees, no squashées, no rebasees**: cada iteración es un commit nuevo.

## Cierre: todos los checks, al final

**Disparador único**: el humano dice que está todo bien, que funciona, que está terminado. Antes de eso la fase sigue abierta y no corrés checks.

Cuando el humano da el OK:

1. **Corré todos los checks que haya**, en **cada repo tocado**, en este orden:
   - **Build / typecheck** — el comando del repo. Sin errores nuevos.
   - **Lint / formato** — el comando del repo. Sin errores nuevos; los preexistentes con la misma firma se anotan, no se arreglan.
   - **Estándares** — si el repo tiene un comando único de chequeo (`make check`, `pnpm verify`, `npm run check`), corrélo. Si no, el chequeo de convenciones lo hiciste al leer el diff.
2. **Si todo pasa**: reporte de cierre con la evidencia fresca y el diff. La fase se cierra.
3. **Si algo falla**:
   - si el fallo es tuyo, corregí, commiteá la corrección como una iteración nueva y volvé a correr **todos** los checks;
   - si el fix cambia comportamiento, pedile al humano que vuelva a probar antes de cerrar;
   - si el fallo es preexistente y no lo causaste, reportalo como residual y cerrá con esa salvedad; no lo arregles fuera de alcance;
   - si el fallo es atribuible a tu cambio y no se puede dejar verde, reportá con diagnóstico: la fase no se cierra.
4. **No hay "verde" antes del cierre.** Durante la iteración no hay evidencia estática: hay código editado y una prueba humana pendiente. El reporte de cierre es el primero que puede decir "build OK / lint OK".

Si corregís algo en el cierre, commiteá la corrección y volvé a hacer la autolectura del diff antes de reportar.

Si hay migraciones, el reporte de cierre dice si quedaron aplicadas o pendientes y en qué entorno. No las corras contra producción sin autorización explícita.

No hay push ni rama. Los checks del cierre corren sobre el árbol actual; si no hay cambios desde el último commit, ese commit es el estado validado.

## Entrega: un commit por iteración

- **Cada iteración termina en un commit.** Stageá solo los archivos de esa iteración, con un mensaje claro (convención del repo; si no hay, `hd-fast: <resumen>`). No dejes cambios sin commitear y no arrastres cambios ajenos: si un archivo mezcla, avisá.
- **No pusheás, no creás rama, worktree ni stash.** El commit es local.
- **No creás artefactos `.hd/`**: ni spec, ni plan, ni ledger, ni review-progress, ni reporte de agente. El reporte es el mensaje final.
- **No lanzás revisores ni correctores.** Si un check del cierre falla, lo corregís vos en la misma pasada; no hay un segundo agente.
- **No hay push ni respaldo remoto**: el commit local es el punto de retorno. Decilo en el reporte de cierre.
- Si el humano pide pushear o reescribir la historia (amend, squash, rebase), **eso ya no es esta skill**: avisá y hacelo solo con un pedido explícito, fuera de este flujo.

Lo único que hacés es leer, buscar, editar en alcance (incluida la migración), revisar tu diff, commitear la iteración y, en el cierre, correr los checks.

### Reporte de iteración (después de cada cambio)

```
**Cambio**: <2-3 líneas de qué se hizo y por qué>
**Commit**: <sha> — <mensaje>
**Archivos/repos**: <git status --short / git diff --stat, separado por repo>
**Para probar**: <pasos exactos o caso que el humano tiene que validar>
**Migración**: no aplica | <archivo, DDL, destructiva sí/no, qué se pierde, cómo aplicarla>
**Checks**: no corridos (por diseño; se corren en el cierre)
**Pendiente / riesgo**: <lo que quedó fuera de alcance o no se pudo verificar>
```

No declares que compila ni que pasa el lint: no lo corriste. Lo único que podés afirmar es qué cambiaste y qué tiene que probar el humano.

### Reporte de cierre (después del OK del humano)

```
**Cambio**: <2-3 líneas de qué se hizo y por qué>
**Commits**: <N> iteraciones — último `<sha>` (<mensaje>)
**Archivos/repos**: <git status --short / git diff --stat, separado por repo>
**Migración**: no aplica | <archivo, aplicada en <entorno> | pendiente>
**Checks de cierre**: Build <resultado> · Lint <resultado> · Estándares <resultado>
**No toqué**: <fuera de alcance / preexistente>
**Riesgo / pendiente**: <lo que el humano todavía tiene que decidir>
**Siguiente paso**: los commits quedaron locales; el push lo decidís vos.
```

Sin revisor, el reporte de cierre es lo que el humano tiene para decidir. Que sea honesto: lo que no probaste, no lo declares probado; lo que no corrió, no lo declares verde.

## Si el cambio crece (salida de la vía rápida)

La vía rápida se sale por las mismas tres razones de la puerta de entrada, una vez adentro: el cambio deja de ser **un solo cambio** (varios objetivos distintos, un diff que no se revisa de una vez), empieza a tocar **deploy, secretos, CI o generados**, o deja de poder describirse en **dos o tres frases**.

1. Decí qué creció y por qué ya no es fast.
2. Si todavía no editaste: no edites; ofrecé `hd-discovery`.
3. Si ya editaste: **commiteá tus archivos como WIP** (`hd-fast: WIP — <motivo>`) para no perderlo, y mostrá qué quedó (`git log --oneline -n 3`, `git show --stat <sha>`). Ofrecé dos salidas:
   - conservar ese commit y arrancar `hd-discovery` desde ahí (el trabajo HD decide si lo incorpora al spec o lo revierte);
   - revertir ese commit con autorización (`git revert <sha>`) y arrancar HD desde un árbol limpio.
4. **No reviertas ni reescribas historia sin autorización explícita.** Nunca `git checkout .`, `git reset --hard`, `git clean`, `git rebase` ni `git commit --amend`.

Si el humano insiste en seguir fuera de alcance, es su decisión, pero decilo como **excepción explícita** en el reporte: la vía rápida ya no aplica y no hay garantías HD.

## Relación con las otras skills

| Skill | Relación |
|---|---|
| `hd-discovery` | La salida cuando el cambio cae en una de las tres excepciones. |
| `hd-spec` | No se usa acá: no hay spec ni planes. |
| `hd-implement` | Esta skill no se prohíbe ahí; su texto propio todavía la declara prohibida en fase 3 — decisión pendiente. |
| `hd-review` | Ídem: el texto de `hd-review` todavía la declara prohibida en fase 4. |
| `hd-close` | Después del cierre es el punto natural para un retoque fast. |
| `hd-debug` | Para bugs: causa raíz primero. La reproducción la aporta o la corre el humano; vos no corrés checks en la iteración. |

## Racionalizaciones comunes (y su realidad)

| Excusa | Realidad |
|---|---|
| "Es rapidito, no hace falta mirar el codebase" | El reconocimiento mínimo evita romper un llamador que no viste. |
| "Toco varios módulos o repos, seguro no es fast" | Un solo cambio coherente puede atravesar módulos y repos. Lo único que no entra es mezclar cambios distintos. |
| "Ya que estoy, ordeno esto otro" | El diff deja de ser legible y el humano no puede separar qué pidió de qué regalaste. |
| "Corro el build rápido para ver si compila" | Entre iteraciones no se corren checks. El humano prueba; los checks se pagan una vez, en el cierre. |
| "El humano dijo que anda, ya está" | El OK habilita el cierre, pero el cierre corre todos los checks igual. |
| "Los checks fallan, pero el humano ya aprobó" | No se cierra: se corrige y se vuelven a correr. |
| "Lo dejo sin commitear hasta el final" | Cada iteración se commitea al terminar; dejarlo para el final borra el punto de retorno. |
| "Commiteo todo junto al final" | No: un commit por iteración, con solo sus archivos. |
| "Hago amend del commit anterior para no ensuciar el historial" | No: cada iteración es un commit nuevo. |
| "Es un bug, pruebo cambiando X" | `hd-debug`: causa raíz primero, con la reproducción que aporta el humano. |
| "Creció, pero ya casi está" | "Ya casi" es la alarma, no el argumento. |
| "Lanzo un subagente para que lo haga más rápido" | El mismo modelo hace todo. Delegar es otra vía, no esta. |

## Fin de la vía rápida

La vía rápida termina cuando el humano aprobó el comportamiento, los checks del cierre corrieron (o su "no aplica" explícito) y cada iteración quedó commiteada. No hay fase siguiente ni handoff automático. El humano decide.
