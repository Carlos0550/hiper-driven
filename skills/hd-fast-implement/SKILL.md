---
name: hd-fast-implement
description: Vía rápida del framework Hiper-driven (HD), fuera de la cadena de 5 fases. Usar para cambios cortos o medianos sobre algo ya construido —renombrar, mover una pieza, ajustar un comportamiento puntual, arreglar un bug chico— cuando el humano quiere velocidad y no trazabilidad; sin spec, sin planes, sin rama, sin commit, sin revisores ni correctores. El mismo modelo hace todos los cambios y los deja en el árbol de trabajo. Entre iteraciones NO se corren builds, lints ni checks; el humano prueba. Cuando el humano da el OK final, recién ahí se corre todo y se cierra. Nunca invocar durante hd-implement o hd-review; sí después de hd-close. Si el cambio crece, se sale de la vía rápida y va a hd-discovery.
---

# HD — Vía rápida: `/hd-fast-implement`

Esta skill **no es una fase de HD**. Es una puerta lateral para retoques cortos o medianos sobre algo que ya está construido: renombrar, mover una pieza de sección, corregir un comportamiento puntual, arreglar un bug chico. Cambia el código y lo deja **sin commitear**; no escribe spec ni planes, no crea ramas ni worktrees, no lanza revisores ni correctores, y no deja artefactos `.hd/`.

**El mismo modelo hace todo**: lee, edita, revisa su diff y reporta. No delega en subagentes.

> **El precio es explícito**: sin revisor independiente, la confianza la pone el humano al probar el comportamiento. Los checks estáticos no se corren entre iteraciones: se corren todos al final, cuando el humano da el OK. Si el cambio tiene que ser confiable sin que nadie lo mire, no es fast: es HD.

## Ley de hierro

```
ENTRE ITERACIONES NO SE CORREN CHECKS: EL HUMANO PRUEBA.
EL CIERRE NO SE DECLARA SIN TODOS LOS CHECKS QUE EXISTAN (O SU "NO APLICA" EXPLÍCITO).
```

- **Durante la iteración** no corrés build, lint, typecheck, tests ni ningún comando de chequeo. No es que no haga falta: es que el humano es el tester y los checks se pagan una sola vez, al final.
- **Durante la iteración** no afirmes que compila, que pasa el lint o que "debería andar". No lo corriste; no lo sabés. Decí qué cambiaste y qué tiene que probar el humano.
- **El cierre** se dispara con el OK del humano ("está todo bien", "funciona", "listo"). Recién ahí corrés **todos** los checks del repo y reportás la evidencia fresca.
- Si el humano reporta que algo falla, corregís y volvés a esperar su prueba. Los checks siguen esperando al cierre.

## Puerta de entrada: ¿entra o no?

**Entra** si es **un solo cambio coherente** sobre algo existente, que el humano puede probar y revisar. No importa cuántos módulos, paquetes o repos toque: importa que sea el mismo cambio y que no mezcle objetivos.

Ejemplos:

- Renombrar algo y actualizar sus referencias, aunque el nombre atraviese varios módulos o repos.
- Mover una pieza de sección, módulo o pantalla, y actualizar imports/exports donde haga falta.
- Corregir un comportamiento puntual: "esto debe hacer X, no Y".
- Arreglar un bug chico y acotado.
- Ajustar copy, estilos, labels o validaciones simples.
- Un refactor chico y contenido, sin cambiar contratos.
- Un ajuste chico en auth, permisos o pagos que no cambie el modelo ni el flujo, solo un detalle acotado.

**No entra** si cae en cualquiera de estos:

- Hay que diseñar algo nuevo: un flujo, una entidad, una pantalla, un contrato.
- Cambia un contrato: APIs públicas, tipos compartidos, esquemas, formatos que otros consumen. **Un rename interno que actualiza todas las referencias no es un cambio de contrato**; un rename de una API pública que consumen otros repos o clientes externos, sí.
- Hay migraciones, backfills, cambios de esquema u **operaciones de datos en masa** sobre datos existentes.
- Cambia **estructuralmente** el modelo de auth/permisos, el flujo de pagos, la criptografía o el tratamiento de datos personales. (Un detalle chico en auth o pagos sí entra; cambiar el modelo o el flujo, no.)
- Son **varios cambios distintos** entre sí, o el diff mezcla cambios de distinto tipo y no se puede revisar como un solo cambio.
- Toca configuración de despliegue, secretos o CI, archivos generados (`dist/`, `build/`, lockfiles) o una dependencia nueva.
- El repo está en medio de un merge, rebase o cherry-pick.
- El trabajo HD está en `hd-implement` o `hd-review`.
- No podés describir el resultado esperado en dos o tres frases.

En esos casos, la salida es `hd-discovery` (o terminar la fase en curso y esperar el cierre).

### Alcance: el límite es el cambio, no el mapa

- **No hay límite por módulo, paquete o repo.** Un rename puede atravesar tres módulos o dos repos y seguir siendo un cambio fast: es el mismo cambio, repetido donde hace falta.
- **El número de archivos no decide.** Un ajuste de copy en 20 archivos entra; un cambio de tres archivos que mezcla un fix, un refactor y una feature nueva, no.
- **Lo que decide es la coherencia**: un solo objetivo, un diff que el humano puede revisar y un resultado que puede probar. Si necesitás un párrafo con varios "además", no es fast.
- **Si el diff te sorprende a vos mismo**, frená y avisá antes de seguir.

### Antes de tocar nada

1. **Conversación**: se recomienda una **conversación nueva** (contexto limpio, sin historial de otra tarea). Es una recomendación, no un bloqueo: si el humano ya la invocó acá, decilo una vez y seguí si dice que sí.
2. **Estado HD**: si hay un trabajo HD en fase 3 o 4, o el humano viene de `hd-implement`/`hd-review`, **frená**. Explicá que la vía rápida dejaría cambios sin commitear dentro de un trabajo que se verifica y se revisa por ola, y ofrecé esperar al cierre. **Después de `hd-close` es el punto natural.** Durante `hd-discovery` o `hd-spec` de un trabajo en curso, desaconsejalo: el cambio quedaría fuera de lo aprobado y podría colarse en sus commits; ofrecé incluirlo en el trabajo o esperar.
3. **Árbol y repos**: mirá el estado de **cada repo** que vas a tocar (`git status --short`). Si hay cambios sin commitear que no son tuyos, no los toques, no los commitees, no los reviertas: preguntá una vez si podés trabajar encima. Si hay merge/rebase/cherry-pick en curso, frená. Si no es un repo git, no hay diff ni commit: reportá los archivos tocados.
4. **Rama**: trabajás sobre la rama actual de cada repo. No creás ramas. Si es la default, decilo en el reporte.
5. **Checks de cierre**: identificá los comandos de build, lint y estándares de cada repo (package.json, Makefile, CI, README). **No los corras todavía**: son para el cierre. Si no existen, anotá "no aplica" y decilo en el reporte de cierre; no inventes comandos.
6. **Alcance**: ubicá el código, leé lo que vas a tocar y a sus consumidores directos. Hacé la lista de archivos, módulos o repos que pensás tocar. Si es un solo cambio coherente, seguí; si son varios cambios distintos, salí a HD **antes de editar**.

No hay discovery completo: el reconocimiento es el mínimo para no romper nada. Si falta un dato que cambia el resultado, hacé **una** pregunta y seguí; no conviertas el cambio en una entrevista.

## El trabajo

1. **Leé antes de editar**: el archivo que vas a tocar, sus imports/exports, sus llamadores y el patrón que ya usa el repo. No inventes convenciones.
2. **Cambio mínimo.** Un cambio, un objetivo. Nada de "ya que estoy": ni reformateos masivos, ni renombres colaterales, ni refactors no pedidos, ni comentarios decorativos.
3. **Seguí las convenciones de la casa**: nombres, estructura, manejo de errores, imports, formato. Un cambio que respeta el pedido pero rompe el estilo del repo no está listo.
4. **Renombrar o mover**: buscá **todas** las referencias (código, strings, docs, configs, tests existentes) y actualizalas. El build no ve las referencias en strings; como no vas a compilar en la iteración, la búsqueda es tu red. Verificá con una búsqueda del nombre viejo antes de dar por cerrado.
5. **Comportamiento**: ubicá el punto exacto donde se decide el comportamiento. No parchees el síntoma en la capa de arriba si la causa está abajo.
6. **Bug**: `hd-debug` manda para la causa raíz, pero **la reproducción la aporta o la corre el humano**, no vos: no corrés checks en la iteración. Pedile el caso, los pasos o el log; investigá leyendo el código y el reporte. Si no hay reproducción, no arregles a ciegas. **Tres fixes fallidos reportados por el humano sobre el mismo problema = frená y cuestioná la arquitectura con el humano.**
7. **Sin tests nuevos.** Si el repo ya tiene tests y tu cambio rompe referencias, actualizá solo esas referencias (no agregues casos) y decilo. No los corras: el cierre decide.
8. **Sin dependencias nuevas** sin preguntar. Una dependencia nueva suele ser señal de que el cambio no era fast.
9. **Sin restos**: nada de `console.log`/`print` de debug, código comentado, TODOs sin dueño, archivos temporales ni backups `.bak`.
10. **No toques lo que no pediste.** Si encontrás otro bug o una mejora obvia, anotala y reportala; no la arregles de paso.
11. **Autolectura del diff antes de reportar (por iteración)**: leé tu propio diff completo (`git diff -- <tus archivos>`). Buscá cambios fuera de alcance, restos de debug, referencias rotas, formato ruidoso y cualquier cosa que no puedas explicar. **No es un check ni un revisor**: es leer, y es la última pasada antes de que el humano pruebe. Corregí lo que encuentres antes de reportar.

## Cierre: todos los checks, al final

**Disparador único**: el humano dice que está todo bien, que funciona, que está terminado. Antes de eso la fase sigue abierta y no corrés checks.

Cuando el humano da el OK:

1. **Corré todos los checks que haya**, en **cada repo tocado**, en este orden:
   - **Build / typecheck** — el comando del repo. Sin errores nuevos.
   - **Lint / formato** — el comando del repo. Sin errores nuevos; los preexistentes con la misma firma se anotan, no se arreglan.
   - **Estándares** — si el repo tiene un comando único de chequeo (`make check`, `pnpm verify`, `npm run check`), corrélo. Si no, el chequeo de convenciones lo hiciste al leer el diff.
2. **Si todo pasa**: reporte de cierre con la evidencia fresca y el diff. La fase se cierra.
3. **Si algo falla**:
   - si el fallo es tuyo, corregí y volvé a correr **todos** los checks;
   - si el fix cambia comportamiento, pedile al humano que vuelva a probar antes de cerrar;
   - si el fallo es preexistente y no lo causaste, reportalo como residual y cerrá con esa salvedad; no lo arregles fuera de alcance;
   - si el fallo es atribuible a tu cambio y no se puede dejar verde, reportá con diagnóstico: la fase no se cierra.
4. **No hay "verde" antes del cierre.** Durante la iteración no hay evidencia estática: hay código editado y una prueba humana pendiente. El reporte de cierre es el primero que puede decir "build OK / lint OK".

Si corregís algo en el cierre, volvé a hacer la autolectura del diff antes de reportar.

No hay commit, no hay push, no hay rama. Los checks del cierre corren sobre el árbol de trabajo tal como quedó.

## Entrega: sin commit

- **No commiteás, no hacés `git add`, no pusheás y no creás rama, worktree ni stash.**
- **No creás artefactos `.hd/`**: ni spec, ni plan, ni ledger, ni review-progress, ni reporte de agente. El reporte es el mensaje final.
- **No lanzás revisores ni correctores.** Si un check del cierre falla, lo corregís vos en la misma pasada; no hay un segundo agente.
- **No hay respaldo**: lo que no commitees se puede perder. Decilo en el reporte de cierre.
- Si el humano pide commitear o pushear, **eso ya no es esta skill**: avisá y hacelo solo como un pedido explícito, fuera de este flujo.

Lo único que hacés es leer, buscar, editar en alcance, revisar tu diff y, en el cierre, correr los checks.

### Reporte de iteración (después de cada cambio)

```
**Cambio**: <2-3 líneas de qué se hizo y por qué>
**Archivos/repos**: <git status --short / git diff --stat, separado por repo>
**Para probar**: <pasos exactos o caso que el humano tiene que validar>
**Checks**: no corridos (por diseño; se corren en el cierre)
**Pendiente / riesgo**: <lo que quedó fuera de alcance o no se pudo verificar>
```

No declares que compila ni que pasa el lint: no lo corriste. Lo único que podés afirmar es qué cambiaste y qué tiene que probar el humano.

### Reporte de cierre (después del OK del humano)

```
**Cambio**: <2-3 líneas de qué se hizo y por qué>
**Archivos/repos**: <git status --short / git diff --stat, separado por repo>
**Checks de cierre**: Build <resultado> · Lint <resultado> · Estándares <resultado>
**No toqué**: <fuera de alcance / preexistente>
**Riesgo / pendiente**: <lo que el humano todavía tiene que decidir>
**Siguiente paso**: queda sin commitear. Commiteá vos.
```

Sin revisor, el reporte de cierre es lo que el humano tiene para decidir. Que sea honesto: lo que no probaste, no lo declares probado; lo que no corrió, no lo declares verde.

## Si el cambio crece (salida de la vía rápida)

En cuanto aparezca complejidad oculta —varios objetivos distintos, un contrato compartido, un cambio estructural de auth/pagos/datos, un módulo entero, un diseño nuevo— **frená**. No hay ratchet hacia arriba dentro de la vía rápida: se **sale a HD**.

1. Decí qué creció y por qué ya no es fast.
2. Si todavía no editaste: no edites; ofrecé `hd-discovery`.
3. Si ya editaste: mostrá exactamente qué quedó tocado (`git status --short`, `git diff --stat`) y ofrecé dos salidas:
   - conservar los cambios y arrancar `hd-discovery` con ese estado (el trabajo HD decide si los incorpora al spec o los descarta antes del baseline);
   - revertir **solo tus archivos** y arrancar HD desde un árbol limpio.
4. **No reviertas sin autorización explícita.** Nunca `git checkout .`, `git reset --hard` ni `git clean`.

Si el humano insiste en seguir fuera de alcance, es su decisión, pero decilo como **excepción explícita** en el reporte: la vía rápida ya no aplica y no hay garantías HD.

## Relación con las otras skills

| Skill | Relación |
|---|---|
| `hd-discovery` | La salida cuando el cambio no entra en fast. |
| `hd-spec` | No se usa acá: no hay spec ni planes. |
| `hd-implement` | **Prohibido** invocar fast durante esta fase, en cualquier modo. |
| `hd-review` | **Prohibido** invocar fast durante esta fase. |
| `hd-close` | Después del cierre es el punto natural para un retoque fast. |
| `hd-debug` | Obligatoria para bugs: causa raíz primero. La reproducción la aporta o la corre el humano; vos no corrés checks en la iteración. |

## Fronteras (qué no se cruza)

| Prohibido | Por qué |
|---|---|
| Commit, `git add`, push | El humano revisa y decide; un commit sin revisor parece aprobado. |
| Rama, worktree, stash | Si necesita infraestructura de trabajo, es HD. |
| Spec, plan, `.hd/` | Si necesita trazabilidad, es HD. |
| Revisor, corrector o subagente | El mismo modelo hace todo; el humano es el revisor. |
| Tests nuevos | El framework no escribe tests. |
| Build, lint o checks durante la iteración | Se corren todos juntos en el cierre, con el OK del humano. |
| Refactors colaterales o arreglar lo preexistente | El diff tiene que ser atribuible al pedido. |

## Racionalizaciones comunes (y su realidad)

| Excusa | Realidad |
|---|---|
| "Es rapidito, no hace falta mirar el codebase" | El reconocimiento mínimo evita romper un llamador que no viste. |
| "Toco varios módulos o repos, seguro no es fast" | Un solo cambio coherente puede atravesar módulos y repos. Lo que no entra es mezclar cambios distintos. |
| "Es auth/pagos, seguro no es fast" | El dominio no decide. Un detalle chico entra; cambiar el modelo de permisos o el flujo de pagos, no. |
| "Ya que estoy, ordeno esto otro" | El diff deja de ser legible y el humano no puede separar qué pidió de qué regalaste. |
| "Corro el build rápido para ver si compila" | Entre iteraciones no se corren checks. El humano prueba; los checks se pagan una vez, en el cierre. |
| "El humano dijo que anda, ya está" | El OK habilita el cierre, pero el cierre corre todos los checks igual. |
| "Los checks fallan, pero el humano ya aprobó" | No se cierra: se corrige y se vuelven a correr. Si el fix cambia comportamiento, el humano prueba de nuevo. |
| "Lo commiteo para no perderlo" | Sin commit es parte del contrato. Si el humano quiere commit, lo hace él o lo pide fuera de la skill. |
| "Es un bug, pruebo cambiando X" | `hd-debug`: causa raíz primero, con la reproducción que aporta el humano. Probar a ciegas es la forma lenta de la vía rápida. |
| "Creció, pero ya casi está" | La vía rápida no tiene ratchet hacia arriba: se sale. "Ya casi" es la alarma, no el argumento. |
| "Una dependencia nueva no es para tanto" | Un cambio que necesita dependencias nuevas ya no es un retoque: es HD. |
| "Escribo un test para estar seguro" | El framework no escribe tests. La seguridad viene de la prueba humana y de los checks del cierre. |
| "Lanzo un subagente para que lo haga más rápido" | El mismo modelo hace todo. Delegar es otra vía, no esta. |
| "La fase 3 está trabada, pero esto es de una línea" | Prohibido. Meter cambios sin commitear en un trabajo que se verifica por ola contamina la evidencia y la revisión. |
| "El humano ya dijo que está bien, commiteo" | "Está bien" es aprobación de comportamiento, no autorización para saltarte el contrato de la skill. |

## Fin de la vía rápida

La vía rápida termina cuando el humano aprobó el comportamiento y los checks del cierre corrieron (o su "no aplica" explícito). No hay fase siguiente, no hay handoff automático y no hay commit. El humano decide.
