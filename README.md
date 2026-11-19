# Hiper-driven (HD)

**HD** es un framework de trabajo con agentes. Un **orquestador** descubre, especifica, orquesta, commitea y cierra; los **subagentes** investigan, arman el prototipo, implementan, revisan, auditan visualmente y corrigen. El humano aparece **solo en discovery**: trae el pedido, confirma los comportamientos nuevos y aprueba el resumen y el prototipo. Después, la cadena corre sola hasta el cierre.

Dos pilares:

- **SDD — Spec Driven Development**: ningún código se escribe sin un contrato que diga *qué*, *por qué* y *cómo se valida*.
- **Verificación en tres capas**. **Estática**: build + lint + estándares en cada ola. **Semántica**: revisores independientes leen el diff contra el spec. **Visual**: un auditor levanta el proyecto entero y prueba la feature como un humano, de punta a punta. **No hay tests**: no se escriben, no se piden y no se aceptan.

El objetivo: **poder confiar en un trabajo hecho 100% por agentes**. Sin tests, esa confianza viene de contratos versionados, olas chicas, memoria compartida, evidencia fresca y revisores que nunca son opcionales.

---

## Cómo trabaja

```
                    HUMANO
              (pide y aprueba el prototipo)
                          |
                     ORQUESTADOR
          (descubre, especifica, orquesta,
           commitea, corre gates, cierra)
                          |
     +----------+---------+---------+-----------+
     |          |                   |           |
 research-*  prototipo (≤5)   teams (≤5)   revisores (≤4)
                                 |        + auditor visual
                                 |              |
                              fixers  ←─────────┘
```

| Quién | Qué hace | Qué no hace |
|---|---|---|
| **Orquestador** | Discovery, contrato, olas, despacho, integración, commits, gates y cierre | **No escribe código de producción** |
| `research-<área>` | Investiga el sistema y devuelve evidencia con archivo:línea | No decide, no edita, no commitea |
| `proto-<pieza>` | Arma su parte del prototipo visual (hasta 5 en paralelo) | No toca el producto, no implementa |
| `qa-artefactos` | Audita el paquete antes de implementar | No escribe el paquete |
| **Team** (`dev-<pieza>`) | Implementa su pieza en el worktree compartido de la ola | No sale de sus archivos, **no ejecuta scripts**, no commitea |
| **Revisor** (`revisor-ola-<N>`) | Lee el diff de su ola y escribe hallazgos | No corrige, no ejecuta |
| **Auditor visual** (`auditor-visual`) | Levanta el proyecto y prueba como un humano | No edita el producto |
| **Fixer** (`fixer-*`) | Corrige hallazgos, uno por uno | No rediseña, no audita, no commitea |

**El orquestador conduce; los subagentes hacen.** Ningún cambio de código de producción lo escribe el orquestador: siempre lo hace un implementador o un fixer.

## La memoria del proyecto

`.hd/memory.md` es la memoria compartida del proyecto: hechos verificados y decisiones del humano, en un archivo append-only que **escribe solo el orquestador** y **leen todos los subagentes**.

- Antes de investigar o preguntar, se consulta: lo que ya está ahí no se vuelve a buscar ni se vuelve a preguntar.
- Cada hallazgo verificado entra como `[hecho]` con `archivo:línea`; cada respuesta del humano, como `[decidido]`.
- Si algo cambia, se agrega `[corrección]`; no se reescribe el pasado.
- Se commitea con el paquete y sobrevive a la conversación.

## Una sola conversación, sin humano en el medio

Discovery, paquete, implementación, revisión y cierre son una sola cadena. El humano **no vuelve a aparecer** después de aprobar el resumen y el prototipo: ni para aprobar el spec, ni para probar el comportamiento, ni para dar el OK del cierre. Solo lo despiertan un **freno real** (un cambio de alcance, un contrato roto, un diagnóstico que no converge), la **pregunta única por un modelo premium** sin permiso previo en implementación, o el reporte final.

La fuente es el paquete, no el chat: el orquestador relee el spec, el technical spec y los planes, y verifica el código antes de despachar.

## Las 5 fases

```
hd-discovery --> hd-spec --> hd-implement --> hd-review --> hd-close
   Fase 1         Fase 2       Fase 3          Fase 4        Fase 5
   humano         contrato      teams           revisión      cierre
   aprueba        + QA          + gate          + visual      automático
```

### Fase 1 — Discovery (la única con humano)

El humano invoca la skill con su pedido. El orquestador:

1. **Delega un research automático** (`research-inicial`) que busca todo lo relacionado: qué existe, dónde vive, quién lo consume, qué se rompe si cambia. El reporte vuelve con `archivo:línea`, y el orquestador **verifica a mano** los 3-10 hallazgos que sostienen el diseño.
2. **No asume nada**, de a una pregunta por turno. Lo existente se lee del código y la memoria; lo nuevo se confirma siempre, aunque parezca obvio: el nombre exacto del bucket y si es privado o público, si hay datos en producción, proveedor de object storage o base de datos, entornos, permisos, límites.
3. **Convierte cada hallazgo y cada respuesta en memoria** (`.hd/memory.md`): no se vuelve a buscar ni se vuelve a preguntar.
4. **Arma el prototipo visual con hasta 5 subagentes coordinados**, cada uno dueño de una pieza y sus archivos, con interfaces congeladas y un solo escritor por archivo compartido.
5. **Explica con lujo y detalle cada comportamiento nuevo** —qué lo dispara, qué hace, qué muestra, qué pasa si falla, qué no cambia— y pregunta *"¿es esto exactamente lo que se requiere?"*.
6. **Pide la aprobación del resumen y del prototipo.** El humano no revisa el spec a mano: el resumen final es su contrato real, y el spec es su transcripción fiel. Ese OK es el **último punto de contacto humano**: con la aprobación, carga `hd-spec` y la cadena sigue sola.

Si el harness expone un catálogo de modelos (`list_subagent_models`), discovery lo consulta para saber qué modelos hay —**el catálogo no publica precios**: los precios y la calidad se averiguan buscando en internet, en las páginas oficiales de cada provider—, arma la estrategia por tipo de tarea y la aprueba con el resumen: research con el más barato y/o rápido, implementación con el mejor calidad/precio, auditoría con el de mayor calidad. Los modelos de más de 5 USD por millón de tokens (cualquier precio publicado) solo se usan con permiso explícito del humano.

Un **spike** (validación de una idea) termina en discovery con una recomendación y no genera paquete.

### Fase 2 — El paquete de contrato (autónoma)

Con el resumen aprobado, el orquestador escribe `spec.md`, `technical_spec.md`, los planes, el prototipo, el ledger y el QA. **No vuelve a preguntar**: las dudas se resuelven con la memoria, con el código o con un `Ruling` en el ledger; solo un cambio de alcance lo despierta.

Un **subagente QA** independiente audita el paquete. Con verde, el orquestador commitea el paquete, lo respalda y **sigue con la implementación**, sin pausa.

### Fase 3 — Implementación con teams (autónoma)

El orquestador re-deriva el paquete contra el código, corre el baseline y arma las **olas** en `waves.md`. El modelo cambió:

- **Cada ola es un team de hasta 5 agentes en un mismo worktree**, con archivos disjuntos, interfaces congeladas y un reparto que todos conocen. Cada agente sabe qué hace el otro y no toca sus archivos.
- **Las olas van secuenciales.** Se paraleliza **dentro** de la ola, no entre olas: un daño queda contenido en una ola y no se multiplica.
- **Los agentes no ejecutan scripts**: ni build, ni lint, ni tests, ni servidores, ni git. El orquestador consolida, commitea y corre el gate.
- **Esta fase no tiene revisor.** La revisión independiente es la fase 4.
- **Cada agente lleva el modelo que corresponde a su tarea** según el catálogo y la estrategia aprobada en discovery. Si hace falta un premium (más de 5 USD/M) sin permiso previo, se pregunta **una sola vez** —la única excepción a la autonomía de la fase—; si no, se usa el mejor dentro del presupuesto.

Por ola: team → consolidación → commit → gate (build + lint + estándares) → una corrección con fixer si hace falta → worktree borrado. La ola siguiente espera.

### Fase 4 — Revisión y auditoría visual (autónoma, en paralelo)

Dos subfases que corren al mismo tiempo:

1. **Revisores de código**: hasta 4, uno por ola (agrupando si hay más). Leen el diff contra el spec, el technical spec y el plan, y escriben **solo hallazgos**: sin prosa, sin arreglos, sin ejecutar nada.
2. **Auditor visual**: levanta el proyecto entero y lo prueba como un humano. Inicia sesión, navega hasta la feature, hace click en cada botón, completa formularios, prueba estados y bordes, y verifica que la feature funcione de punta a punta. Si el entorno no permite algo, lo declara no verificable en vez de inventar un verde.

Revisores y auditor visual se despachan con el **modelo de mayor calidad disponible y permitido** de la estrategia: sin tests, su lectura es la garantía. Esta fase no vuelve a preguntar por modelos.

Con todo junto, **un solo fixer** corrige los hallazgos uno por uno (`hd-debug` obligatorio), el orquestador consolida, commitea y corre el gate, y **el mismo auditor visual re-prueba la feature completa**. Si sale bien, se cierra; si no, freno real con diagnóstico. No hay segunda ronda.

### Fase 5 — Cierre (automática)

Cuando la revisión y la re-prueba están en verde: limpiar worktrees y stashes, commitear los artefactos que falten, pushear la rama de trabajo **solo si es nueva**, borrar la rama de respaldo y rendir cuenta de los rulings. Los commits por ola se conservan. **Nunca `--force`; `main` y ramas ajenas no se pushean sin autorización.**

## El paquete de contrato

Todo vive en `.hd/`:

```
.hd/
├── memory.md                # memoria del proyecto: hechos y decisiones (compartida)
└── <trabajo>/
    ├── spec.md              # contrato con el humano
    ├── technical_spec.md    # brief para la implementación
    ├── plans/               # unidades de ejecución, con comportamiento esperado
    ├── prototype/           # referencia visual (solo si hay UI), con README
    ├── discovery/           # notas y reporte de research
    ├── waves.md             # plan de olas y teams (fase 3)
    ├── ledger.md            # decisiones, evidencia, rulings
    ├── review-progress.md   # QA del paquete, revisión, auditoría visual y re-prueba
    ├── reports/             # reportes de implementadores, revisores, auditor y fixers
    └── logs/                # salidas largas de build/lint (no se commitea)
```

| Archivo | Para quién | Qué contiene |
|---|---|---|
| `memory.md` | todos | hechos verificados y decisiones del humano; se consulta antes de investigar o preguntar |
| `spec.md` | humano y revisores | qué, por qué, alcance, criterios verificables, Q&A, riesgos, datos, prototipo, enmiendas |
| `technical_spec.md` | implementación | misión, contexto verificado, contratos, mapa de planes/olas/teams, resultado esperado, verificación, trampas |
| `plans/` | implementadores y revisores | archivos exactos, interfaces, dependencias, comportamiento esperado, criterios |
| `prototype/` | humano, revisores e implementadores | referencia visual y de comportamiento; no se copia al producto |
| `discovery/` | orquestador | notas y reporte de research con archivo:línea |
| `waves.md` | orquestador | re-derivación, teams por ola, olas, enmiendas y rulings |
| `ledger.md` | todos | baseline, olas, evidencia, pushes, rulings, enmiendas |
| `review-progress.md` | todos | QA del paquete, revisión por ola, auditoría visual, corrección y re-prueba |

Los **worktrees** no viven acá: van en `.git/hd-wt/<trabajo>/`, fuera del árbol de trabajo, para que `git add -A` no se los lleve al commit. Los **logs** tampoco se commitean.

## Los modos y el tamaño del trabajo

| | Directo | Cambio chico | Mega cambio |
|---|---|---|---|
| Señales típicas | 1-2 archivos, sin contratos nuevos, sin datos | Unas pocas piezas acotadas, un plan | Refactor masivo, módulos enteros, contratos compartidos, datos sensibles o en masa |
| Research | 1 área | 1 área | 1-3 áreas |
| Spec / technical spec | Breve | Breve | Completo |
| Planes | Uno, mínimo | Uno | Varios |
| Olas | Una, team chico | Una, team chico | Varias, secuenciales; team de hasta 5 por ola |
| Prototipo | Si hay UI | Si hay UI | Si hay UI |
| Revisión | Revisores de ola + auditor visual | Revisores de ola + auditor visual | Revisor por ola + auditor visual |
| Datos en producción | No aplica: si toca datos, sube a mega | Preguntar si aplica | Preguntar siempre; ola de datos al final, sola, con respaldo y prueba en seco |

**El default es el modo más chico que no mienta**, y el team más grande que no se pise. La señal decisiva para mega es **"¿puede dejar el sistema inconsistente a mitad de camino?"**.

**Ratchet (unidireccional):** si aparece complejidad oculta, el trabajo **sube** de categoría (directo → chico → mega). Nada baja: "ya casi está" es una alarma, no un argumento.

## Los gates

| Gate | Quién | Qué mira | Si falla |
|---|---|---|---|
| **G0 — Paquete** | `qa-artefactos` | coherencia con lo aprobado, criterios verificables, planes completos, technical spec suficiente, prototipo, teams, sin lógica ni tests | una corrección; si sigue rojo, no se implementa |
| **G1 — Ola (estático)** | orquestador | build + lint + estándares en la rama consolidada, contra el baseline | una corrección con fixer + `hd-debug`; si sigue rojo, freno real |
| **G2 — Revisión (semántico)** | hasta 4 `revisor-ola-<N>` en paralelo | seguridad, lógica, trampas, desviaciones, comportamiento esperado, prototipo, estándares, footprints | una corrección única con fixer; no hay segunda ronda |
| **G3 — Auditoría visual** | `auditor-visual` | la feature de punta a punta, como un humano: login, navegación, clicks, estados, bordes, persistencia | entra en la misma corrección única; después se re-prueba entera |
| **G4 — Cierre** | orquestador | revisores sin hallazgos abiertos + re-prueba visual OK + gate limpio | freno real con diagnóstico al humano |

**Los revisores y el auditor visual nunca son opcionales.** Sin tests, son la única lectura del trabajo. La independencia es parte del gate: el que implementa no revisa, el que revisa no corrige, el que corrige no audita.

## Reglas de oro (no negociables)

1. **El contrato manda.** Ningún código sin paquete aprobado. Ni el spec ni los planes contienen lógica ni implementaciones; única excepción: firmas, tipos, constantes y formatos cuando son contrato (Ola 0).
2. **Las preguntas se hacen de a UNA por turno**, siempre con la opción *"Necesito más contexto sobre lo que me estás preguntando antes de decidir"*. Solo en discovery, más la pregunta única por modelos premium sin ruling previo en implementación.
3. **No se asume nada.** Lo existente se lee del código y la memoria; lo nuevo se confirma siempre, aunque parezca obvio. Cada comportamiento nuevo se explica con lujo y detalle y se confirma antes de la aprobación; el resumen final es el contrato real del humano.
4. **El comportamiento esperado va antes que el código.** El plan fija en prosa qué debe hacer el código —entradas, salidas, casos borde, errores— y el revisor audita contra ese texto. Sin tests, es la única fuente de verdad semántica.
5. **En HD, el framework no escribe tests.** La vía rápida es otra cosa: solo agrega tests si el humano los pide.
6. **Ola 0 (contratos) va sola y se cierra antes de seguir.**
7. **El paralelismo vive dentro de la ola.** Cada ola es un team de hasta 5 agentes con archivos disjuntos, interfaces congeladas y un solo dueño por archivo compartido. **Las olas van secuenciales**: se paraleliza lo que no se pisa, nunca olas enteras.
8. **La ola de datos va última, sola, nunca en paralelo**: confirmación de datos en producción + respaldo + prueba en seco.
9. **El orquestador no escribe código de producción.** Lo escriben los implementadores y fixers. **Los subagentes no ejecutan scripts**: no compilan, no lintean, no corren tests ni servidores. Solo el orquestador corre el gate y commitea; la única excepción es el auditor visual, que ejecuta para probar.
10. **Una corrección por gate.** Gate de ola, revisión y auditoría visual comparten una sola pasada de corrección. Si después de corregir sigue rojo, es **freno real**. Para bugs, **3 fixes fallidos = cuestionar la arquitectura**.
11. **La unidad es la ola.** Un worktree, un commit, un gate por ola. El commit va **antes** del gate: es la base sobre la que corre la evidencia y trabaja el fixer.
12. **Nunca push de `main`, de una rama ajena o de un PR sin autorización explícita.** El único push automático es el respaldo temporal a `hd-backup/<trabajo>` y la rama de trabajo nueva al cerrar. Nunca `--force`.
13. **Ninguna afirmación de éxito sin evidencia fresca en ese turno.** "Debería compilar" está prohibido; una corrida verde solo prueba el árbol donde corrió.
14. **La independencia no se negocia.** El revisor no implementó su ola; el auditor visual no participó de la implementación; el fixer no audita.
15. **La memoria compartida se consulta y se actualiza.** Nada se busca dos veces ni se pregunta dos veces. Si no está en `.hd/memory.md`, no existe para el subagente.
16. **El ledger es la memoria del trabajo** (`.hd/<trabajo>/ledger.md`): baseline, olas, evidencia, pushes, enmiendas y `Ruling:`s. Sobrevive a la compactación de contexto.
17. **Los artefactos `.hd/` van al commit.** El paquete en la fase 2, el resto en el cierre; solo quedan fuera si el humano lo pidió o si git los ignora.
18. **Los commits por ola se conservan.** Nadie los colapsa, los squashea ni los reescribe.
19. **El orquestador no le narra el día a día al humano.** Lo que encuentra va al ledger y a `waves.md`; el humano recibe el reporte final o un freno real.
20. **La aprobación de producto es una sola**: el resumen y el prototipo que el humano aprueba en discovery. Después no hay aprobaciones: el QA audita el paquete y el auditor visual valida el comportamiento.
21. **Una conversación, y la fuente es el paquete.** Lo que no se salta es la relectura del paquete y la verificación del código antes de despachar.
22. **El contexto es el costo.** Los planes, diffs y logs se pasan por **ruta**, no por contenido; la salida larga va al log y al contexto solo llegan las líneas de fallo.
23. **El cierre deja el repo limpio**: ni un worktree, ni un stash del trabajo. La rama de respaldo se borra cuando el trabajo ya está en el remoto; si el push falló, se conserva.
24. **Cada tarea delegada lleva el modelo que le corresponde** según el catálogo del harness: research el más barato y/o rápido, implementación el mejor calidad/precio, auditoría el de mayor calidad. El catálogo solo lista modelos: **los precios se verifican buscando en internet** (páginas oficiales), nunca consultándole al provider, y un precio no verificable se trata como desconocido. Los premium (más de 5 USD/M en cualquier precio publicado) solo con permiso explícito del humano, registrado en la memoria.

## La vía rápida: `hd-fast-implement`

Para retoques cortos o medianos sobre algo ya construido —renombrar, mover una pieza, corregir un comportamiento puntual, arreglar un bug chico, ajustar una migración, sumar una dependencia— está `hd-fast-implement`, una **vía rápida fuera de la cadena de 5 fases**.

**La invoca el humano**, en cualquier conversación, cuando quiere velocidad y no trazabilidad. HD no la invoca desde ninguna fase: corre autónomo.

Tiene **tres fases por cambio**:

1. **Preguntas con contexto**: el orquestador inspecciona el código y, si hace falta, hace 2-3 preguntas.
2. **Implementación**: un **subagente `impl-fast`** hace el cambio; el orquestador revisa el diff y commitea.
3. **Auditoría**: un **subagente `auditor-fast`** revisa el commit; si hay hallazgos, un **`fixer-fast`** corrige y el orquestador commitea la corrección.

| | HD (flujo completo) | Vía rápida |
|---|---|---|
| Spec, technical spec y planes | Sí | No |
| Prototipo | Si hay UI | No |
| Rama y worktree | Sí | No: trabaja sobre la rama actual |
| Commit | Uno por ola | Uno por implementación y uno por corrección |
| Revisión | Revisores por ola + auditor visual | Un auditor subagente por cambio |
| Artefactos `.hd/` | Sí | No |
| Checks | Gate por ola | Al cierre, cuando el humano da el OK |
| Invocación | Al inicio del trabajo | Pedido directo del humano, en cualquier conversación |
| Para qué | Trabajo que tiene que ser confiable | Retoque que el humano va a probar y revisar |

- **El orquestador no edita código**: escribe el brief, revisa el diff, commitea y corre los checks.
- **Cada subagente lleva el modelo que corresponde a su tarea** según el catálogo del harness: implementación y fixers con el mejor calidad/precio, auditoría con el de mayor calidad. **Los precios se buscan en internet**, nunca consultándole al provider. Los premium (más de 5 USD/M en cualquier precio publicado) solo con permiso del humano; si el proyecto tiene memoria HD previa, sus decisiones se respetan.
- **Cada implementación y cada corrección se commitea**; no hay squash.
- **Los checks estáticos se corren al cierre**, cuando el humano dice que está todo bien.
- **Cuándo no**: solo en tres casos — si mezcla varios cambios distintos entre sí o el diff no se puede leer como un solo cambio, si toca configuración de despliegue, secretos, CI o archivos generados, o si no se puede describir el resultado esperado en dos o tres frases. Ahí es el flujo completo.

La vía rápida **no da las garantías de HD**: hay un auditor por cambio, pero no hay spec, planes, gate por ola ni auditoría visual. La confianza la sigue poniendo el humano al probar.

## El costo: dónde se va el tiempo

El costo crece con **el contexto del orquestador**, no con el de sus subagentes: los subagentes nacen limpios y mueren al terminar; el orquestador acumula lo que lee. Cuatro reglas lo mantienen acotado:

- **Subagentes para el trabajo pesado**: investigación, prototipo, implementación, revisión, auditoría y corrección las hacen agentes que nacen y mueren.
- **Sin scripts en los subagentes**: el team no compila ni lintea; el orquestador corre el gate una vez sobre la rama. Menos ruido en el contexto y una sola fuente de evidencia.
- **Un worktree por ola**: el team entero comparte el árbol y ve el trabajo de sus compañeros; las dependencias se enlazan por symlink en vez de reinstalarse.
- **Rutas, no contenido**: los planes, los diffs y los logs se leen por ruta.

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
    ├── hd-discovery/          # Fase 1: pedido, research automático, memoria, preguntas, prototipo (≤5), aprobación
    │   ├── SKILL.md
    │   └── templates/         # notas, research, README de prototipo
    ├── hd-spec/               # Fase 2: paquete autónomo y QA
    │   ├── SKILL.md
    │   └── templates/         # spec, technical spec, plan
    ├── hd-implement/          # Fase 3: olas secuenciales con teams de hasta 5 en un worktree
    │   ├── SKILL.md
    │   └── templates/         # waves.md
    ├── hd-review/             # Fase 4: revisores por ola + auditor visual + corrección + re-prueba
    │   ├── SKILL.md
    │   └── templates/         # review-progress.md
    ├── hd-close/              # Fase 5: cierre automático, push de rama nueva, limpieza y respaldo
    ├── hd-debug/              # Transversal: causa raíz antes que fix
    └── hd-fast-implement/     # Vía rápida (fuera de la cadena): pedido directo del humano
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
