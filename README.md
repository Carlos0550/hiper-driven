# Hiper-driven (HD)

**HD** es un framework de trabajo con agentes. Un **agente principal** descubre, especifica, orquesta y cierra; los **subagentes** investigan, implementan, revisan, corrigen y auditan. No hay personas ni cargos: hay un agente que conduce y subagentes por tarea.

Dos pilares:

- **SDD — Spec Driven Development**: ningún código se escribe sin un contrato que diga *qué*, *por qué* y *cómo se valida*.
- **Verificación en dos capas**. **Estática**: un cambio no está listo si no **compila** limpio y no **cumple los estándares** del repo (lint, formato, convenciones, manejo de errores). **Semántica**: lo que el compilador y el linter no pueden ver lo auditan **subagentes independientes** contra el spec. **No hay tests**: no se escriben, no se piden y no se aceptan.

El objetivo: **poder confiar en un trabajo hecho 100% por agentes**. Sin tests, esa confianza no viene de la fe: viene de un agente que conduce, subagentes separados, contratos versionados, olas chicas, evidencia fresca y revisores que nunca son opcionales.

---

## Cómo trabaja

```
                         CLIENTE
                            |
                     AGENTE PRINCIPAL
                     (descubre, especifica,
                      orquesta, commitea,
                      corre gates, cierra)
                            |
       +--------------------+--------------------+
       |                    |                    |
  research-<área>      prototipo            qa-artefactos
       |                    |                    |
       +--------------------+--------------------+
                            |
                    implementadores
                    revisores
                    fixers
                    auditores
```

| Quién | Qué hace | Qué no hace |
|---|---|---|
| **Agente principal** | Discovery, contrato, olas, despacho, integración, commits, gates y cierre | **No escribe código de producción** |
| `research-<área>` | Investiga el sistema y devuelve evidencia con archivo:línea | No decide, no edita, no commitea |
| `prototipo` | Arma el prototipo visual en `.hd/<trabajo>/prototype/` | No toca el producto, no implementa |
| `qa-artefactos` | Audita el paquete antes de implementar | No escribe el paquete |
| **Implementador** (`dev-<plan>`) | Escribe código de producción en su worktree | No commitea, no revisa, no escribe tests |
| **Revisor** (`revisor-<ola>`) | Lee el diff de la ola y emite veredicto | No corrige, no participó de la ola |
| **Fixer** (`fixer-<ola>`) | Corrige hallazgos de un gate o de una revisión | No rediseña, no audita, no commitea |
| **Auditor** (`auditor-final`, `auditor-fast`) | Audita el cierre o un cambio de la vía rápida | No participó de la implementación |

**El agente principal conduce; los subagentes hacen.** El agente principal lee código, escribe los artefactos, despacha, revisa diffs, commitea y corre los gates. **Ningún cambio de código de producción lo hace el agente principal**: siempre lo hace un subagente implementador o fixer.

## Una conversación o dos

Por defecto, **todo el flujo va en una sola conversación**: discovery, paquete, implementación, auditoría y cierre. El mismo agente principal conduce las cinco fases.

También podés **cortar después del paquete**: abrís otra conversación y le pasás la ruta `.hd/<trabajo>/`. No es obligatorio. Sirve solo para arrancar la implementación con un contexto más limpio.

**La fuente es el paquete, no el chat.** Aunque la implementación siga en la misma conversación, el agente principal **relee el spec, el technical spec y los planes, y verifica el código** antes de despachar. No implementa de memoria ni hereda suposiciones: el paquete es el contrato.

## Las 5 fases

```
hd-discovery --> hd-spec --> hd-implement --> hd-review --> hd-close
   Fase 1         Fase 2         Fase 3          Fase 4        Fase 5
   entender       contrato       olas            auditoría     cierre
   revisar        + QA           + revisión      + cliente
   aprobar
```

### Fase 1 — Discovery

Tres etapas internas:

1. **Entender y revisar el código involucrado.** El agente principal reformula el pedido y hace una **revisión completa del código directamente involucrado**: archivos que se van a tocar, puntos de entrada, contratos, modelo de datos, consumidores, convenciones y comandos de verificación. Lee y hace grep; no edita. Las preguntas nacen del código, no de la imaginación. Pregunta **de a una por turno**, con la salida *"Necesito más contexto sobre lo que me estás preguntando antes de decidir"*.
2. **Ampliar y cruzar.** Despacha `research-<área>` para cubrir la **superficie de impacto**: backend, frontend, datos, infraestructura, integraciones, por servicio o por módulo. **Verifica a mano** los 3-10 hallazgos que sostienen el diseño y cruza lo que el código dice con lo que el cliente pidió. Si algo no cuadra, vuelve a preguntar. No se cierra hasta que cada requisito esté anclado y cada supuesto confirmado o decidido.
3. **Resumen, prototipo y aprobación.** Entrega un resumen detallado de qué se necesita y cómo se va a implementar. Si hay UI, un `prototipo` arma una referencia estática en `.hd/<trabajo>/prototype/` que refleja la lógica, la vista y los estados nuevos. El cliente aprueba o pide cambios. Si pide cambios de requisito, se vuelve a la etapa 2; si es un ajuste visual, se itera el prototipo.

Un **spike** (validación de una idea) termina en discovery con una recomendación, sin paquete.

### Fase 2 — El paquete de contrato

Con la aprobación del cliente, el agente principal escribe:

- `spec.md`: el contrato con el cliente —qué, por qué, alcance, criterios de aceptación, riesgos, Q&A completo, datos, prototipo—.
- `technical_spec.md`: el brief para la implementación —misión, contexto verificado, qué construir, contratos, mapa de planes y olas, resultado esperado, prototipo, verificación, restricciones, trampas y definición de terminado—.
- `plans/`: un plan por unidad de ejecución, con archivos exactos, interfaces, dependencias y **comportamiento esperado en prosa**.
- `prototype/`: el prototipo aprobado, con README.
- `ledger.md` y `review-progress.md`: memoria y QA.

Un **subagente QA** independiente audita el paquete. Con verde, el agente principal lo commitea, lo respalda y **sigue con la implementación en la misma conversación** (o el cliente abre una nueva si prefiere contexto limpio). El agente principal no implementa: despacha subagentes.

### Fase 3 — Implementación

El agente principal **no confía en el paquete a ciegas**: lo valida, inspecciona el código involucrado, corre el baseline, verifica los footprints y arma las **olas** en `waves.md` pensando en paralelizar. Si algo no le cuadra, pregunta al cliente (una por turno) o frena.

Por ola:

1. **Implementadores** en **worktrees separados, uno por plan**, con contrato: solo código, solo sus archivos, sin tests, sin commits, autoverificación local.
2. **Consolidación**: el agente principal trae el código, commitea la ola y la respalda.
3. **Gate**: build + lint + estándares en la rama.
4. **Revisión**: un subagente revisor independiente audita el diff de la ola contra spec, technical spec, plan y prototipo.
5. **Corrección**: una sola pasada de un subagente fixer por gate o por revisión, con `hd-debug` obligatorio. Si no alcanza, freno real.

Ola 0 (contratos) va sola y se revisa antes de seguir. La ola de datos va última, sola, con respaldo y prueba en seco.

### Fase 4 — Auditoría de cierre y prueba del cliente

Cuando todas las olas están cerradas, un **subagente auditor de cierre** que no participó de ninguna ola mira el **diff completo** contra el spec, el technical spec, los planes y el prototipo. Busca alcance, coherencia entre olas, comportamiento, seguridad, estándares, artefactos y evidencia. Una sola corrección de cierre con un subagente fixer; el auditor confirma los hallazgos. Si sigue rojo, se reporta al cliente con diagnóstico.

Con verde, el agente principal le entrega el trabajo al cliente con **los criterios de aceptación como checklist**. El cliente prueba **comportamiento**, no código. Si encuentra un bug chico o pide un cambio, se invoca `hd-fast-implement` automáticamente; si es grande, un subagente fixer lo corrige y el auditor confirma. Si aprueba, se cierra.

### Fase 5 — Cierre

Con el OK explícito del cliente: limpiar worktrees y stashes, commitear los artefactos que falten, **pushear la rama solo si es nueva**, borrar la rama de respaldo y rendir cuenta de los rulings. Los commits por ola se conservan. **Nunca `--force`; `main` y ramas ajenas no se pushean sin autorización.**

## El paquete de contrato

Todo vive en `.hd/<trabajo>/`:

```
.hd/<trabajo>/
├── spec.md                  # contrato con el cliente
├── technical_spec.md        # brief para la implementación
├── plans/                   # unidades de ejecución, con comportamiento esperado
├── prototype/               # referencia visual (solo si hay UI), con README
├── discovery/               # notas y reportes de research
├── waves.md                 # plan de olas (se escribe en la fase 3)
├── ledger.md                # memoria del trabajo: decisiones, evidencia, rulings
├── review-progress.md       # QA del paquete, revisión por ola y auditoría de cierre
├── reports/                 # reportes de implementadores, revisores y fixers
└── logs/                    # salidas largas de build/lint (no se commitea)
```

| Archivo | Para quién | Qué contiene |
|---|---|---|
| `spec.md` | cliente y revisores | qué, por qué, alcance, criterios verificables, Q&A, riesgos, datos, prototipo, enmiendas |
| `technical_spec.md` | implementación | misión, contexto verificado, contratos, mapa de planes/olas, resultado esperado, verificación, trampas, definición de terminado |
| `plans/` | implementadores y revisores | archivos exactos, interfaces, dependencias, comportamiento esperado, criterios |
| `prototype/` | cliente, revisores e implementadores | referencia visual y de comportamiento; no se copia al producto |
| `discovery/` | agente principal | notas de la entrevista y reportes de research con archivo:línea |
| `waves.md` | agente principal | re-derivación, matriz de paralelismo, olas, enmiendas y rulings |
| `ledger.md` | todos | baseline, olas, evidencia, pushes, rulings, enmiendas |
| `review-progress.md` | todos | QA del paquete, veredictos por ola, auditoría de cierre y prueba del cliente |

Los **worktrees** no viven acá: van en `.git/hd-wt/<trabajo>/`, fuera del árbol de trabajo, para que `git add -A` no se los lleve al commit. Los **logs** tampoco se commitean.

El diff de cada plan **no se guarda como artefacto**: se reconstruye desde el commit de su ola con `git show <sha> -- <rutas>`. El commit es el artefacto.

## Los modos y el tamaño del trabajo

| | Directo | Cambio chico | Mega cambio |
|---|---|---|---|
| Señales típicas | 1-2 archivos, sin contratos nuevos, sin datos | Unas pocas piezas acotadas, un plan | Refactor masivo, módulos enteros, contratos compartidos, datos sensibles o en masa |
| Research | 1 área | 1-2 áreas | 3-6 áreas |
| Spec / technical spec | Breve | Breve | Completo |
| Planes | Uno, mínimo | Uno | Varios |
| Olas | Una | Una | Varias, **default un plan por ola** |
| Prototipo | Si hay UI | Si hay UI | Si hay UI |
| Revisión | 1 revisor de ola + auditor de cierre | 1 revisor de ola + auditor de cierre | Revisor por ola + auditor de cierre |
| Datos en producción | No aplica: si toca datos, sube a mega | Preguntar si aplica | Preguntar siempre; ola de datos al final, sola, con respaldo y prueba en seco |

**El default es el modo más chico que no mienta.** Un trabajo de 1-2 archivos sin contratos nuevos va a directo: la maquinaria de olas no se amortiza. La señal decisiva para mega es **"¿puede dejar el sistema inconsistente a mitad de camino?"**.

**Ratchet (unidireccional):** si a mitad de camino aparece complejidad oculta, el trabajo **sube** de categoría (directo → chico → mega). Nada baja de categoría una vez clasificado: "ya casi está" no es un argumento, es una alarma. El agente principal puede subirlo en discovery o en la fase 3.

## Los gates

| Gate | Quién | Qué mira | Si falla |
|---|---|---|---|
| **G0 — Paquete** | `qa-artefactos` | coherencia con lo aprobado, criterios verificables, planes completos, technical spec suficiente, prototipo, olas, sin lógica ni tests | una corrección del agente principal; si sigue rojo, no se implementa |
| **G1 — Ola (estático)** | agente principal | build + lint + estándares en la rama consolidada, contra el baseline | una corrección con subagente fixer + `hd-debug`; si sigue rojo, freno real |
| **G2 — Ola (semántico)** | `revisor-<ola>` | seguridad, lógica, trampas, desviaciones, comportamiento esperado, prototipo, estándares, footprints | una corrección con subagente fixer; el revisor confirma solo los hallazgos; si sigue rojo, freno real |
| **G3 — Cierre** | `auditor-final` | diff completo: alcance, coherencia entre olas, comportamiento, seguridad, estándares, artefactos, evidencia | una corrección de cierre con subagente fixer; si sigue rojo, reporte al cliente |
| **G4 — Cliente** | cliente | comportamiento contra los criterios de aceptación | cambio chico: `hd-fast-implement`; cambio grande: subagente fixer + `hd-debug` + confirmación del auditor; 3 fallos = arquitectura |

**Los revisores nunca son opcionales.** Sin tests, G0, G2 y G3 son la única lectura semántica del trabajo. La independencia es parte del gate: el que implementa no revisa, el que revisa no corrige, el que corrige no audita el cierre.

## Reglas de oro (no negociables)

1. **El contrato manda.** Ningún código sin paquete aprobado. Ni el spec ni los planes contienen lógica ni implementaciones; única excepción: firmas, tipos, constantes y formatos cuando son contrato (Ola 0).
2. **Las preguntas se hacen de a UNA por turno**, siempre con la opción *"Necesito más contexto sobre lo que me estás preguntando antes de decidir"*.
3. **El comportamiento esperado va antes que el código.** El plan fija en prosa qué debe hacer el código —entradas, salidas, casos borde, errores— y el revisor audita el código contra ese texto. Sin tests, ese texto es la única fuente de verdad semántica.
4. **En HD, el framework no escribe tests.** Ni el implementador, ni el fixer, ni el revisor: el trabajo se valida con **build + lint + estándares** y revisión. Si un agente propone tests, es alcance no pedido y se rechaza. La vía rápida es otra cosa: solo agrega tests si el cliente los pide.
5. **Ola 0 (contratos) va sola y se revisa antes de seguir.** Si el contrato está mal, todo lo que venga después también.
6. **El paralelismo se calcula, no se intuye**: dos planes comparten ola solo si sus archivos son disjuntos, ninguno produce lo que el otro consume, no comparten estado mutable, ninguno depende del otro, no tocan la misma configuración de build y no cambian dependencias/lockfiles. **El default es un plan por ola**; se agrupa solo cuando la disjunción es inequívoca. Máximo ~4 planes por ola.
7. **La ola de datos va última, sola, nunca en paralelo**: confirmación de datos en producción + respaldo + prueba en seco.
8. **El agente principal no escribe código de producción.** Lo escriben los subagentes implementadores y fixers. Los subagentes se autoverifican en su worktree, pero **no tienen autoridad**: no commitean, no tocan la rama y no aplican migraciones; su salida **no es evidencia**. Solo el agente principal corre el gate sobre la rama consolidada y commitea.
9. **Una corrección por gate.** Gate de ola, revisión de ola y auditoría de cierre: una pasada cada uno. Si después de la corrección sigue rojo, es **freno real**. Para bugs, **3 fixes fallidos = cuestionar la arquitectura**, no un cuarto fix.
10. **La unidad es la ola, no el plan.** Al terminar cada ola se consolida, se commitea la ola, se corre su gate, se revisa y se corrigen sus hallazgos. El commit va **antes** del gate: es la base sobre la que corre la evidencia y sobre la que trabaja el fixer.
11. **Nunca, jamás, push de `main`, de una rama ajena o de un PR sin autorización explícita.** El único push automático es el respaldo temporal a `hd-backup/<trabajo>` durante el trabajo, y la **rama de trabajo nueva** al cerrar. Nunca `--force`.
12. **Ninguna afirmación de éxito sin evidencia fresca en ese turno.** "Debería compilar" está prohibido; una corrida verde solo prueba el árbol donde corrió. **Un subagente no es evidencia**: el agente principal verifica el build, el revisor lee el diff y el auditor mira el trabajo completo.
13. **Los revisores nunca son opcionales.** El QA audita el paquete; el revisor audita cada ola; el auditor audita el cierre. En la vía rápida, un `auditor-fast` audita cada cambio. Todos son distintos del autor, y la independencia no se negocia.
14. **El ledger es la memoria del trabajo** (`.hd/<trabajo>/ledger.md`): baseline, olas, evidencias, pushes, enmiendas y `Ruling:`s. Sobrevive a la compactación de contexto.
15. **La corrección de cierre es una sola.** Se audita una vez, se juntan los hallazgos y se corrige una vez. Si no alcanza, se reporta al cliente con diagnóstico.
16. **Todo bug pasa por causa raíz** (`hd-debug`): no se proponen fixes sin investigar; no se apilan fixes.
17. **Los artefactos `.hd/<trabajo>/` van al commit.** Se commitean con el trabajo (el paquete en la fase 2, el resto en el cierre) y solo quedan fuera si el cliente lo pidió explícitamente o si git los ignora.
18. **Los commits por ola se conservan**: el historial del trabajo es el historial por ola (`hd(<trabajo>): ola N — …`). Nadie los colapsa, los squashea ni los reescribe.
19. **El agente principal no le narra el día a día al cliente.** Lo que los subagentes encuentran va al ledger y a `waves.md`. El cliente se entera en el **freno real**, en el **final** y cuando pregunta directamente.
20. **La aprobación de producto es una sola**: el resumen y el prototipo que el cliente aprueba en discovery. El spec no se aprueba por separado: lo audita el QA. La prueba final del cliente es la aceptación.
21. **Una conversación o dos, y la fuente es el paquete.** La implementación puede seguir en la misma conversación o en una nueva. Lo que no se salta es la relectura: el agente principal relee el paquete y verifica el código antes de despachar.
22. **El contexto es el costo.** Los planes, diffs y logs se pasan por **ruta**, no por contenido; la salida larga va al log y al contexto solo llegan las líneas de fallo. Todo lo que entra al chat se paga en cada turno siguiente.
23. **El cierre deja el repo limpio**: ni un worktree, ni un stash del trabajo. La rama de respaldo se borra cuando el trabajo ya está en el remoto; si el push falló, se conserva.

## La vía rápida: `hd-fast-implement`

No todo cambio amerita el flujo completo. Para retoques cortos o medianos sobre algo ya construido —renombrar, mover una pieza, corregir un comportamiento puntual, arreglar un bug chico, ajustar una migración, sumar una dependencia— está `hd-fast-implement`, una **vía rápida fuera de la cadena de 5 fases**.

Tiene **tres fases por cambio**:

1. **Preguntas con contexto**: el agente principal inspecciona el código y, si hace falta, hace 2-3 preguntas.
2. **Implementación**: un **subagente implementador** hace el cambio; el agente principal revisa el diff y commitea.
3. **Auditoría**: un **subagente auditor** revisa el commit; si hay hallazgos, un **subagente fixer** corrige y el agente principal commitea la corrección.

| | HD (flujo completo) | Vía rápida |
|---|---|---|
| Agente principal + subagentes | Sí | Sí: implementación y auditoría por subagentes |
| Spec, technical spec y planes | Sí | No |
| Prototipo | Si hay UI | No |
| Rama y worktree | Sí | No: trabaja sobre la rama actual |
| Commit | Uno por ola | Uno por implementación y uno por corrección |
| Auditoría | Revisores por ola + auditor de cierre | Un auditor subagente por cambio |
| Corrección | Fixers | Subagente fixer |
| Artefactos `.hd/` | Sí | No |
| Verificación | Gates por ola + auditoría de cierre | Auditoría semántica por cambio; checks al cierre |
| Invocación | Al inicio del trabajo | En cualquier conversación o al final de un spec, en la revisión humana |
| Para qué | Trabajo que tiene que ser confiable | Retoque que el cliente va a probar y revisar |

- **El agente principal no edita código**: escribe el brief, revisa el diff, commitea y corre los checks. El cambio lo hace un subagente implementador; la corrección, un subagente fixer.
- **Cada implementación y cada corrección se commitea**; no hay squash.
- **La auditoría no bloquea**: se lanza contra un commit y el agente principal puede recibir otro pedido. Las ediciones son secuenciales: no se editan dos cambios a la vez.
- **Los checks estáticos se corren al cierre**, cuando el cliente dice que está todo bien.
- **Tests**: no se agregan salvo que el cliente los pida; los existentes se respetan y no se corren hasta el cierre.
- **Cuándo no**: solo en tres casos — si mezcla varios cambios distintos entre sí o el diff no se puede leer como un solo cambio, si toca configuración de despliegue, secretos, CI o archivos generados, o si no se puede describir el resultado esperado en dos o tres frases. Ahí es el flujo completo.

La vía rápida **no da las garantías de HD**: hay un auditor por cambio, pero no hay spec, planes, gate por ola ni auditoría de cierre. Los checks se corren recién al cierre. La confianza la sigue poniendo el cliente al probar. Si el cambio tiene que ser confiable sin que nadie lo mire, no es fast.

## El costo: dónde se va el tiempo

El trabajo HD tarda porque el costo crece con **el contexto del agente principal**, no con el de sus subagentes: los subagentes nacen limpios y mueren al terminar; el agente principal acumula lo que lee. Cuatro reglas lo mantienen acotado:

- **Subagentes para el trabajo pesado**: la investigación, la implementación, la revisión y la auditoría las hacen agentes que nacen y mueren. El agente principal conserva el contrato y la evidencia.
- **Autoverificación sin autoridad**: los subagentes compilan y pasan el lint para no entregar código roto. Eso ahorra el bucle de relanzamiento. Pero **solo la corrida del agente principal en la rama consolidada es evidencia**.
- **Un worktree por plan, no por ola**: los footprints de la ola ya garantizan archivos disjuntos, y el aislamiento hace que la autoverificación de un agente no vea los archivos a medio escribir de otro. Las dependencias se enlazan por symlink en vez de reinstalarse.
- **Rutas, no contenido**: los planes, los diffs y los logs se leen por ruta. La salida larga va al log y al contexto solo llegan las líneas de fallo.

El diff de un plan no se guarda como artefacto: se reconstruye con `git show <sha> -- <rutas>`. Se elimina así la mitad de las operaciones de la ola sin perder trazabilidad.

## Respaldo temporal y push al cerrar

Un trabajo HD deja un commit por ola. Mientras corre, **cada commit se sube a `hd-backup/<trabajo>`** (si hay remote y la rama no es la default): un corte de luz no puede romper el trabajo. Es un respaldo **temporal**.

Al cerrar, `hd-close`:

- pushea la rama de trabajo **solo si es nueva** (creada para este trabajo), nunca `main` ni una rama ajena;
- borra la rama de respaldo cuando el trabajo ya está a salvo (local y remota); si el push falló, no borra nada; si el trabajo no está en el remoto, borra la local y conserva la remota;
- si el push no aplica o falla, no fuerza nada: lo reporta y conserva el respaldo.

| Pregunta | Respuesta |
|---|---|
| **Dónde** | `hd-backup/<trabajo>`, nunca la rama de trabajo ni `main`. |
| **Cuándo** | Después del commit del paquete (fase 2) y de cada commit de ola o corrección. |
| **Cómo** | `git push <remote> HEAD:refs/heads/hd-backup/<trabajo>`. **Nunca `--force`.** |
| **Si falla** | No frena el trabajo: queda en el ledger y se reporta en el cierre. |
| **Al cerrar** | Se borra; la remota solo si el trabajo ya está en el remoto. |
| **Sin remote o sobre la default** | No hay respaldo: nada sale del repo hasta el cierre. |

## Estructura del repo

```
hiper-driven/
├── README.md
├── LICENSE
└── skills/                    # cada skill es autocontenida: copiás la carpeta y listo
    ├── hd-discovery/          # Fase 1: entender, revisar código, research, prototipo
    │   ├── SKILL.md
    │   └── templates/         # notas, research, README de prototipo
    ├── hd-spec/               # Fase 2: paquete y QA
    │   ├── SKILL.md
    │   └── templates/         # spec, technical spec, plan
    ├── hd-implement/          # Fase 3: olas, implementadores, revisores, fixers
    │   ├── SKILL.md
    │   └── templates/         # waves.md
    ├── hd-review/             # Fase 4: auditoría de cierre y prueba del cliente
    │   ├── SKILL.md
    │   └── templates/         # review-progress.md
    ├── hd-close/              # Fase 5: cierre, push de rama nueva, limpieza y respaldo
    ├── hd-debug/              # Transversal: causa raíz antes que fix
    └── hd-fast-implement/     # Vía rápida (fuera de la cadena): un agente que orquesta
```

## Instalación

Las skills usan el formato portable `SKILL.md` (frontmatter YAML + markdown), compatible con la mayoría de agentes:

- **Claude Code / agentes con skills nativas**: copiá cada carpeta de `skills/` a tu directorio de skills (p. ej. `~/.claude/skills/`).
- **DeepSeek Harness**: copiá las carpetas a tu directorio de skills y cargalas con la herramienta `skill`.
- **Cualquier otro agente**: el contenido es markdown puro; referenciarlo o pegarlo al inicio del trabajo funciona igual.

Las skills que usan templates los llevan **empaquetados en su propia carpeta** (`<skill>/templates/`, referenciados relativos al SKILL.md): copiando la carpeta de la skill alcanza.

## Contribuir

HD nace de la práctica diaria; si lo iterás y mejorás, los PRs son bienvenidos. Las skills están escritas en español a propósito (es el idioma de trabajo de su autor); una traducción al inglés es una contribución válida.

## Licencia

[MIT](LICENSE).
