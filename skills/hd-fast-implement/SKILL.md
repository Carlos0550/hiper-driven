---
name: hd-fast-implement
description: Vía rápida de Hiper-driven (HD), fuera de la cadena de fases. Usar cuando el humano pide un cambio directo sobre algo ya construido y quiere velocidad, no trazabilidad —renombrar, mover una pieza, ajustar un comportamiento, arreglar un bug, tocar una migración, sumar una dependencia, o una feature que él mismo decide asumir—. Cuatro pasos por cambio: preguntas cortas solo si el pedido es ambiguo, enriquecimiento de contexto, un worker subagente que implementa, y entrega al humano para que pruebe o reciba el OK. No hay auditores, revisores, fixers ni gate: se construye, no se revisa. Cada cambio deja un registro en .hd/fast/ con qué se pidió, cuándo, por qué y qué riesgos tiene haberlo hecho por esta vía. Nada bloquea: si el cambio es grande, riesgoso o son varios objetivos, se anota el riesgo y se sigue, porque la decisión es del humano.
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

**Cada cambio tiene su commit y su registro.** No hay squash, amend ni rebase. Los subagentes no commitean.

**No tiene**: spec, technical spec, planes, rama nueva, worktree, gate, auditoría, artefactos de trabajo. Sí tiene **registro** (paso 2 y 4): sin él no quedaría constancia de qué se pidió y por qué.

## Nada bloquea

Entra **cualquier cambio** sobre algo existente: chico, mediano o grande; de un archivo o de tres repos; un rename, un refactor, un bug, una migración con backfill, una dependencia nueva, un ajuste de auth o pagos, una feature nueva, un rediseño.

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
5. **Abrí el registro antes de editar**: `.hd/fast/<YYYY-MM-DD-HHmm>-<slug>.md` y una fila en `.hd/fast/index.md` (fecha | cambio | commit | riesgo). Así queda guardado qué se pidió y por qué aunque después el contexto se pierda.

```md
# <slug>

**Fecha**: <YYYY-MM-DD HH:mm> (<zona>)
**Pedido**: <lo que dijo el humano, en sus palabras>
**Por qué**: <el objetivo o el motivo; si no lo dijo, lo que se infiere>
**Alcance**: <archivos, módulos o repos>
**Riesgo**: bajo | medio | alto — <motivos de la tabla>
**Decisión**: vía rápida por pedido directo del humano
**Excepción asumida**: <si el cambio es grande o riesgoso, decilo acá>
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

**Commit**: stageá **solo** las rutas del cambio (nunca `git add -A`), mensaje con la convención del repo o `hd-fast: <resumen>`, y anotá el SHA en el registro. Nunca `amend`, `squash`, `rebase`, `reset --hard`, `checkout .` ni `clean`.

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
**No verifiqué**: <lo que no corriste o no probaste>
```

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

## Fin de la vía rápida

Termina cuando el worker entregó, el cambio está commiteado, el registro está completo y el humano recibió "probalo" o "está listo". No hay fase siguiente ni encadenado a otra skill.
