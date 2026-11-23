---
name: hd-fast-implement
description: "Vía rápida de Hiper-driven (HD), fuera de la cadena de fases. Usar cuando el humano pide un cambio directo sobre algo ya construido y quiere velocidad, no trazabilidad —renombrar, mover una pieza, ajustar un comportamiento, arreglar un bug, tocar una migración, sumar una dependencia, o una feature que él mismo decide asumir—. Cuatro pasos por cambio: preguntas cortas solo si el pedido es ambiguo, enriquecimiento de contexto, un worker subagente que implementa, y entrega al humano para que pruebe o reciba el OK. No hay auditores, revisores, fixers ni gate: se construye, no se revisa. Cada cambio deja un registro en .hd/fast/ con qué se pidió, cuándo, por qué y qué riesgos tiene haberlo hecho por esta vía. Nada bloquea: si el cambio es grande, riesgoso o son varios objetivos, se anota el riesgo y se sigue, porque la decisión es del humano."
---

# HD — Vía rápida: `/hd-fast-implement`

Esta skill **no es una fase de HD**. Es la vía rápida para cambiar algo que ya existe, cuando el humano quiere velocidad y no trazabilidad. El humano asume el riesgo de que acá hay mucha menos planificación: si el cambio es importante o delicado, la responsabilidad es suya, no del modelo.

| Paso | Quién | Qué hace |
|---|---|---|
| **1. Preguntas cortas** | orquestador | si el pedido es ambiguo, 1-2 preguntas sobre el porqué o el resultado buscado |
| **2. Enriquecimiento de contexto** | orquestador | lee el código, las convenciones, git y la memoria; abre el registro del cambio |
| **3. Worker** | subagente `worker-fast` | hace el cambio en el árbol actual y reporta |
| **4. Entrega** | orquestador | commitea, cierra el registro y le pide al humano que pruebe (o le da el OK) |

**No hay revisión.** No hay auditor, ni revisor, ni fixer, ni gate, ni corrección automática, ni segunda pasada. El cambio lo escribe un subagente, el orquestador lo commitea y se lo entrega al humano. La confianza la pone él al probar.

**El orquestador no edita código de producción.** Escribe el brief, delega, revisa que el diff sea el del pedido, commitea y entrega.

**Ningún comentario en el código.** Ni el worker ni el orquestador escriben comentarios: ni explicativos, ni TODOs, ni separadores, ni cabeceras. Lo que haya que explicar va al registro del cambio. Si el worker toca un archivo con comentarios, los borra en ese mismo cambio —salvo directivas de herramienta, shebang y licencia— y lo anota en el reporte.

**Cada cambio tiene su commit y su registro.** No hay squash, amend ni rebase. Los subagentes no commitean.

**No tiene**: spec, technical spec, planes, rama nueva, worktree, gate, auditoría, artefactos de trabajo. Sí tiene **registro** (paso 2 y 4): sin él no quedaría constancia de qué se pidió y por qué.

## Nada bloquea

Entra **cualquier cambio** sobre algo existente: chico, mediano o grande; de un archivo o de tres repos; un rename, un refactor, un bug (también uno que devolvió una corrida de `hd-e2e`), una migración con backfill, una dependencia nueva, un ajuste de auth o pagos, una feature nueva, un rediseño.

**No hay puerta de entrada.** Si el cambio es grande, riesgoso o mezcla objetivos, no se frena ni se deriva: se **registra el riesgo** y se sigue. La decisión de ir por la vía rápida es del humano y el modelo no la revierte. Una sola vez, y sin insistir, podés ofrecer `hd-discovery` si el cambio te parece que pide contrato; si dice que no, seguí y anotá `excepción asumida: <motivo>`.

Lo único que no se negocia es la **seguridad de ejecución**, no el alcance: no se aplican migraciones ni comandos contra producción sin que el humano lo autorice, y no se reescribe historia de git.

### Riesgos que se registran (no bloquean)

| Señal | Por qué importa |
|---|---|
| Migración destructiva o `UPDATE`/`INSERT` masivo | No hay vuelta atrás de los datos |
| Auth, permisos o pagos | Un error es un agujero, no un bug visual |
| Toca varios repos o módulos | El diff deja de revisarse de una vez |
| Dependencia nueva | Cambia el lockfile y el build de todos |
| Feature nueva o rediseño | Se decidió sin spec ni prototipo |
| Deploy, secretos, CI o generados | Riesgo operativo, no de código |
| Árbol inestable (HD a medio consolidar, merge/rebase en curso) | El commit puede mezclar trabajo ajeno |
| El humano no lo puede probar | Sin revisión ni prueba, no queda verificación de nada |

## Paso 1 — Preguntas cortas

Preguntá **solo si el pedido es demasiado ambiguo**, y solo para entender **por qué** quiere el cambio o **qué quiere lograr**. Una o dos preguntas, en un mismo mensaje.

- No preguntes lo que el código responde: eso es el paso 2, no una pregunta.
- No preguntes detalles de implementación: eso lo decide el worker.
- Si el pedido ya dice qué y para qué, **no preguntes nada**.
- Si el humano dice "no sé", elegí la opción conservadora y anotalo en el registro.

## Paso 2 — Enriquecimiento de contexto

Es el paso que evita romper algo. Antes de delegar:

1. **Código y repos**: estado de cada repo (`git status --short`), `HEAD` (`git rev-parse --short HEAD`) y rama actual (no se crean ramas). Mirá el archivo que se va a tocar, sus llamadores, el patrón que ya usa el repo y las convenciones. Si hay archivos modificados que no son del cambio, el worker no los toca y vos no los commiteás. Si no es un repo git, no hay commit: se reportan las rutas tocadas.
2. **Memoria**: si el proyecto tiene `.hd/memory.md`, leela para no contradecir decisiones ya tomadas (convenciones, migraciones, modelos). La vía rápida **lee** la memoria, no la escribe.
3. **Migraciones**: si hay, identificá cómo se generan y dónde se aplican. La escribe el worker; se aplica solo donde el humano diga.
4. **Modelo del worker**: si el harness expone `list_subagent_models`, consultalo y elegí la **mejor relación calidad/precio**. Los precios se buscan en internet (páginas oficiales), nunca al provider. Premium (más de 5 USD/M publicado) solo con permiso del humano, una vez por modelo. Sin permiso, el mejor dentro del presupuesto y anotalo. Despachá siempre con `provider`, `model` y `reasoning_effort` explícitos.
5. **Catálogo de `hd-e2e`**: si el repo tiene `.hd/e2e/casos.md`, leé los casos del área que se va a tocar: dicen qué está prometido, qué se va a ver afectado y qué casos quedan viejos con el cambio.
6. **Abrí el registro antes de editar**: `.hd/fast/<YYYY-MM-DD-HHmm>-<slug>.md` y una fila en `.hd/fast/index.md` (fecha | cambio | commit | riesgo). Así queda guardado qué se pidió y por qué aunque después el contexto se pierda.

```md
# <slug>

**Fecha**: <YYYY-MM-DD HH:mm> (<zona>)
**Pedido**: <lo que dijo el humano, en sus palabras>
**Por qué**: <el objetivo o el motivo; si no lo dijo, lo que se infiere>
**Alcance**: <archivos, módulos o repos>
**Riesgo**: bajo | medio | alto — <motivos de la tabla>
**Decisión**: vía rápida por pedido directo del humano
**Excepción asumida**: <si el cambio es grande o riesgoso, decilo acá>
**Catálogo e2e**: <caso nuevo / actualizado / sin cambios — motivo>
```

Si `.hd/` está ignorado por git, el registro se escribe igual y se avisa que queda local.

## Paso 3 — Delegar el worker

Despachá un `worker-fast` (nombre por pieza, p. ej. `worker-auth`) con:

- el pedido y **por qué** se hace;
- la **lista exacta de archivos** que puede tocar;
- las convenciones del repo y el patrón a seguir;
- el alcance: un solo objetivo, sin refactors colados, sin tests nuevos salvo que el humano los pida;
- las prohibiciones: **no commitear, no tocar la rama, no ejecutar scripts** (build, lint, tests, migraciones, servidores);
- el formato de reporte: estado, archivos tocados, decisiones, dudas.

Trabaja **en el árbol actual**, no en un worktree. Si el cambio es un bug, investiga la causa raíz con `hd-debug` antes de tocar nada.

Cuando termina: `git status --short` y `git diff -- <rutas>`. Verificá que tocó lo del brief y que no quedaron restos de debug ni cambios fuera del pedido. Si está mal, devolveselo **una vez** con el problema concreto; no lo arregles vos.

**Commit**: stageá **solo** las rutas del cambio (nunca `git add -A`), mensaje con la convención del repo o `hd-fast: <resumen>`, y anotá el SHA en el registro. Si el cambio altera comportamiento observable, antes de commitear actualizá el catálogo de `hd-e2e` (ver *El catálogo de `hd-e2e`*) y stagealo con el mismo commit: es parte del cambio, no un extra. Nunca `amend`, `squash`, `rebase`, `reset --hard`, `checkout .` ni `clean`.

## Paso 4 — Entregar

Dos formas, según el cambio:

- **"Probalo"**: pasos exactos para que el humano reproduzca y valide (qué abrir, qué clickear, qué caso raro probar).
- **"Está listo"**: cuando el cambio es trivial o autoexplicativo y no hay nada que probar.

Antes de decir nada: completá el registro (`**Commit**`, `**Resultado**`, riesgos que aparecieron) y la fila del índice.

**Honestidad, no gate**: no declares que compila ni que pasa el lint si no lo corriste, y no digas "probado" si lo probó el worker. Si el humano pide checks o el repo los espera antes de entregar, corrélos y reportá la salida tal cual.

```
**Cambio**: <2-3 líneas de qué se hizo y por qué>
**Commit**: <sha> — <mensaje>
**Archivos**: <git status --short / diff --stat, por repo>
**Riesgo**: <bajo/medio/alto + el motivo que importa>
**Para probar**: <pasos exactos> | nada que probar
**Registro**: .hd/fast/<archivo>.md
**Catálogo**: <caso nuevo / actualizado / sin cambios — motivo>
**No verifiqué**: <lo que no corriste o no probaste>
```

## El catálogo de `hd-e2e`

La vía rápida es donde más se desincroniza el catálogo, porque nadie revisa. Por eso el cambio también lo deja al día — **sin convertirlo en gate**:

- **Cuándo**: si el cambio altera comportamiento observable (ruta, permiso, estado, texto de error, endpoint, texto de UI) y el repo tiene `.hd/e2e/`. Si no lo tiene, no se crea: eso no es tarea de esta vía.
- **Quién**: lo escribe el orquestador, no el `worker-fast`. El worker sigue con su alcance y su prohibición de tests.
- **Qué**: el caso nuevo o el que cambió, con el esperado que pidió el humano. Si el pedido es vago, el caso lleva el esperado más concreto que se pueda sostener y una nota `esperado a confirmar` en su historial.
- **Estado**: entra como `NUEVO`; el tocado vuelve a `SIN_VERIFICAR`. Nunca se marca verde: acá no se ejecuta nada.
- **Contradicción**: si el cambio deja viejo un caso existente, ese caso se actualiza con el registro del cambio como evidencia, o se deja rojo a propósito y se dice en el registro. No se borra.
- **Commit**: va en el mismo commit del cambio. Si el cambio se revierte, se revierte el caso.
- **No bloquea**: si no se puede actualizar —no hay `.hd/e2e/`, el pedido es demasiado vago—, se anota `catálogo: sin cambios — <motivo>` en el registro y se sigue. Nada se frena por esto.

Y al revés: si el cambio **arregla un bug** que devolvió una corrida de `hd-e2e`, el registro anota el ID del caso y el próximo run es el que lo valida. Acá no se declara arreglado.

## Varios pedidos a la vez

- **Las ediciones son secuenciales**: un solo worker edita el árbol por vez. Si el humano pide otro cambio mientras uno está en curso, terminá y commiteá el actual y después arrancá el nuevo.
- **Un commit y un registro por cambio.** Nada se mezcla en el mismo diff.
- Podés contestar, preguntar o planear el siguiente mientras el worker trabaja.

## Relación con las otras skills

| Skill | Relación |
|---|---|
| `hd-discovery` | Se ofrece una sola vez si el cambio pide contrato. No es obligatoria: el humano decide. |
| `hd-spec` | No se usa acá: no hay spec, technical spec ni planes. |
| `hd-implement` | No se usa acá. HD no invoca la vía rápida. |
| `hd-review` | No se usa acá: la vía rápida no tiene revisión. |
| `hd-close` | Conserva los commits `hd-fast: ...` y los lista; si hay cambios fast posteriores a la revisión, corre los checks antes de cerrar. |
| `hd-debug` | Para bugs: causa raíz primero, un cambio por hipótesis. |
| `hd-e2e` | Comparten el catálogo: la vía rápida lo mantiene al día (caso `NUEVO`, sin ejecutar). La suite completa la corre solo el humano. |

## Racionalizaciones comunes (y su realidad)

| Excusa | Realidad |
|---|---|
| "Pregunto todo antes de mirar el código" | El código responde la mitad. Preguntá solo el porqué, y solo si el pedido es ambiguo. |
| "Es ambiguo, hago un discovery chiquito" | No: 1-2 preguntas cortas y se delega. |
| "El cambio es grande, lo derivo a HD" | No lo decidís vos. Se registra el riesgo y se sigue si el humano quiere. |
| "Lo hago yo, total es rápido" | No: el código lo escribe un subagente. El orquestador delega y commitea. |
| "Reviso el cambio antes de entregar" | Revisás que el diff sea el pedido, no si está bien implementado: no hay auditor en esta vía. |
| "Le pido a otro agente que lo audite" | No hay auditores. Eso es `hd-review` o un pedido explícito del humano. |
| "Lo dejo sin commitear" | No: un commit por cambio, y el SHA va al registro. |
| "Commiteo todo junto" / "hago amend" | No: un commit por cambio y sin reescribir historia. |
| "No hace falta registrar, está en el chat" | El chat se pierde. El registro dice qué se pidió, cuándo, por qué y qué riesgo tiene. |
| "Registro después, cuando termine" | Se abre antes de editar: si el cambio crece, el "por qué" original ya no se reconstruye. |
| "Corro build y lint para asegurarme" | Si querés, corrélos y reportá la salida. Lo que no podés es declararlos verdes sin haberlos corrido. |
| "El worker dice que compila, lo repito" | La palabra del worker no es evidencia. |
| "La vía rápida no toca el catálogo" | Si cambió el comportamiento, el catálogo queda viejo y la próxima corrida miente. Se actualiza acá, sin ejecutarlo. |
| "Actualizo el caso y lo marco verde" | Acá no se ejecuta nada: entra `NUEVO` o `SIN_VERIFICAR`. El verde lo pone una corrida. |
| "Es un cambio chico, no hace falta caso" | Chico no es invisible: si cambia lo que ve el usuario, el caso se escribe. |

## Fin de la vía rápida

Termina cuando el worker entregó, el cambio está commiteado, el registro está completo y el humano recibió "probalo" o "está listo". No hay fase siguiente ni encadenado a otra skill.
