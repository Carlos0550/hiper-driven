---
name: hd-review
description: "Fase 4 del framework Hiper-driven (HD), autónoma y en dos subfases en serie. Primero, revisores independientes —uno por ola, tantos como permita el harness, todos en una sola tanda y avisando al humano el costo en tokens— leen el código y escriben solo sus hallazgos; un fixer los corrige, el orquestador commitea y corre el gate. Recién entonces la auditoría visual se reparte en tres tramos: un recon acotado levanta y verifica el entorno, consigue credenciales y decide modo UI o API; entre 2 y 4 auditores prueban áreas disjuntas en paralelo, con presupuesto en turnos; y el orquestador consolida en un solo reporte. Si hay fallos, un fixer los corrige y los mismos recorridos se re-ejecutan enteros. Los revisores y el auditor se despachan con el modelo de mayor calidad disponible según el catálogo y la estrategia de la memoria (premium solo con permiso ya dado). Si sale bien, hd-close se invoca solo. No hay prueba del humano ni tests."
---

# HD — Fase 4: Revisión y auditoría visual

Sos el **orquestador**. Esta fase es la que hace que el trabajo de un LLM sea **confiable** sin tests: dos lecturas independientes del mismo trabajo, **en serie** —primero el código, después el comportamiento—.

No arranca hasta que **TODAS las olas están cerradas** en `hd-implement`.

```
olas cerradas
   │
   ├─ Paso 1 · sub1: revisores de código (uno por ola, todos a la vez) ──→ hallazgos
   │      └─ Paso 2 · si hay: un fixer corrige → commit → gate
   │
   ├─ Paso 3 · sub2: auditoría visual en tres tramos ──→ fallos
   │      ├─ 3.0 recon: entorno, credenciales, modo UI/API, áreas (5 min)
   │      ├─ 3.1 entre 2 y 4 áreas en paralelo (6 min cada una)
   │      └─ 3.2 consolidación (orquestador)
   │      └─ Paso 4 · si hay: un fixer corrige → commit → gate
   │
   └─ Paso 5 · re-prueba: los mismos scripts, completos ──→ Paso 6 · hd-close automático
```

**Por qué en serie y no en paralelo:** el auditor visual tiene que probar el árbol **ya corregido**. Si corre junto con los revisores, prueba bugs que todavía vas a arreglar y su reporte nace viejo. El paralelismo vive **dentro** de sub2, nunca entre sub1 y sub2.

**Por qué en áreas y no un auditor solo:** el costo fijo de auditar no es probar: es levantar el proyecto, autenticarse y descubrir cómo se navega. Un solo agente lo paga una vez por pasada y, con el presupuesto que se le da, se queda sin reloj antes de probar. El recon paga ese costo una sola vez; las áreas prueban en paralelo lo que ya está resuelto.

**No hay humano en esta fase.** Aparece recién cuando el trabajo está cerrado o si hay un freno real. El aviso de tokens del Paso 1 es un aviso, no una pregunta. La app entera, con todos sus roles, tampoco es de esta fase: eso lo corre el humano con `hd-e2e`, fuera de la cadena.

## Subagentes

| Subagente | Qué hace | Qué no hace |
|---|---|---|
| **Orquestador** | Levanta el servidor, despacha, consolida, commitea, corre el gate, decide | **No escribe código de producción** |
| **Revisor** (`revisor-ola-<N>`) | Lee el diff de su ola y escribe hallazgos | No corrige, no ejecuta, no narra |
| **Recon** (`recon-auditoria`) | Verifica el entorno, consigue credenciales, decide modo UI/API, deja el script base y propone las áreas | No audita la feature, no edita el producto |
| **Auditor de área** (`auditor-auditoria-<área>`) | Prueba su área como un humano: UI o API con `curl`/`fetch` | No sale de su área, no edita el producto, no consolida |
| **Fixer** (`fixer-review`, `fixer-visual`) | Corrige todos los hallazgos de una tanda, uno por uno | No rediseña, no amplía alcance, no commitea |

**Independencia:** los revisores no participaron de ninguna ola; el recon y los auditores de área tampoco; el fixer no audita. La corrección la confirma el comportamiento, no el autor.

## Catálogo de modelos: la auditoría va con el mejor

La auditoría con criterio —revisores y auditores por área— es la tarea que más calidad necesita: sin tests, es la única lectura del trabajo.

1. **Leé la estrategia de `.hd/memory.md`**: el modelo por tipo de tarea y los permisos premium se aprobaron en discovery (o con la pregunta única de `hd-implement`). No se vuelve a preguntar.
2. **Consultá el catálogo** con `list_subagent_models` si el harness lo permite, para verificar que los modelos de la estrategia siguen disponibles y elegir el esfuerzo de razonamiento. Si no está disponible, usá el default y anotalo en el ledger. **El catálogo no publica precios**: si hace falta un precio —por ejemplo, para decidir si un modelo supera el umbral de 5 USD/M—, se busca en internet (páginas oficiales); no se le pregunta al provider, y un precio no verificable se trata como desconocido.
3. **Asigná**: revisores y recon y auditores con el de **mayor calidad disponible** (p. ej. Qwen4 u Opus 5.5 si están en el catálogo y permitidos); los fixers con la mejor relación calidad/precio.
4. **Premium (más de 5 USD/M en cualquier precio publicado)**: solo con permiso ya registrado en la memoria. **Esta fase no pregunta**: la excepción de la pregunta única es de `hd-implement`. Sin permiso, usá el mejor dentro del presupuesto y anotá el ruling.
5. **Dispatch explícito**: pasá `provider`, `model` y `reasoning_effort` en cada `subagent`; anotá en el ledger qué modelo llevó cada revisor y el auditor.

## La severidad

La usan los revisores y los auditores, y significa lo mismo de los dos lados:

- **alta** — el flujo no se completa, o se pierden o duplican datos, o un permiso deja hacer lo que no corresponde, o toca dinero o seguridad.
- **media** — el flujo se completa pero el resultado visible es incorrecto, o falta una validación que deja pasar datos malos.
- **baja** — cosmético, texto u orden: el resultado no cambia.

La fija quien reporta. La consolidación puede **subirla**, nunca bajarla: bajarla es descartar un hallazgo, y eso solo con `Ruling:` en el ledger y mención en el cierre. La duda entre dos niveles se resuelve **hacia arriba**. Un `alta` **no se parkea nunca**: se corrige o se frena el trabajo.

## Reglas duras

1. **Sub1 y sub2 van en serie, nunca en paralelo.** Primero todas las lecturas de código; después, con los hallazgos corregidos y el gate verde, el comportamiento. Dentro de sub2, el paralelismo es entre áreas, no entre sub1 y sub2. **El contexto del orquestador no corta esta serie**: si se le acorta, anota el estado en el ledger, delega más y sigue; no entrega la fase en el borde de sub1.
2. **Un revisor por ola, todos los que permita el harness, en una sola tanda.** Nada de cuatro y después otra tanda: se cubre todo el trabajo de una pasada.
3. **El costo en tokens se avisa.** Antes de despachar los revisores, una línea al humano con cuántos agentes se lanzan y por qué; no se espera respuesta.
4. **Los revisores escriben solo hallazgos.** Nada de prosa, nada de arreglos: archivo:línea, severidad, por qué y cómo verificarlo. Su veredicto es una línea.
5. **Cada auditor prueba como un humano, de punta a punta, pero solo su área.** Por la UI si hay frontend; si no, contra la API con `curl`/`fetch`, como con Postman o APIdog: auth real, secuencias completas, errores, permisos y persistencia. **Si el navegador no arranca, cae a modo API** y declara qué parte de la UI quedó sin probar: nunca se declara verde lo que no se probó.
6. **Una corrección por tanda de hallazgos, con todos juntos.** Un hallazgo, un cambio. Nada de refactors colados.
7. **Una sola re-prueba.** Si después de corregir los fallos visuales la re-prueba vuelve a fallar, es **freno real** con diagnóstico. No hay segunda ronda.
8. **La re-prueba es completa**, no solo de lo que falló: la misma feature entera, de nuevo.
9. **Ningún veredicto sin evidencia fresca en este turno.** La salida de build + lint + estándares que corriste vos, y los archivos de hallazgos y de prueba.
10. **El orquestador no escribe producción.** El fix lo hace un subagente.
11. **Sin tests.** Ni los fixers ni el auditor agregan tests; el orquestador no los pide.
12. **Verde no es aprobación humana.** Si la revisión y la re-prueba salen bien, se cierra solo.
13. **El presupuesto está en turnos de herramienta, no solo en minutos.** Cada turno cuesta cerca de un minuto: un tope en reloj no tiene checkpoint y se estira "para terminar de mirar". Agotado el suyo, el agente corta y declara residual.
14. **Tres presupuestos separados.** Recon (5 min / 8 turnos), auditoría por área (6 min / 8 turnos cada una) y corrección del fixer (reloj propio). El reloj del auditor **no** incluye al fixer, al gate ni a la re-prueba.
15. **El alcance es la feature, no la app.** Los flujos que promete el spec y los controles que esos flujos tocan. La app entera, con todos sus roles, es `hd-e2e`, y la corre el humano.
16. **El reparto es por superficies, no por casos.** Entre 2 y 4 áreas disjuntas, todas en una tanda. Si la feature es una sola pantalla indivisible, un solo auditor y el motivo escrito en `review-progress.md`.
17. **La evidencia viaja con el veredicto.** Cada pasada de auditoría commitea sus reportes, scripts, logs y capturas antes de pasar a la corrección. Un veredicto sin evidencia commiteada no existe.
18. **Nada se instala dentro del repo.** Ni el recon ni los auditores: las herramientas van fuera del árbol y lo que haya que tocar en el repo lo hace el orquestador. Un `package-lock.json` que apareció solo es un residuo, no un cambio.
19. **El contexto no es un presupuesto que autorice a cortar.** El orquestador no tiene un tope de contexto que lo habilite a terminar antes: si aprieta, delega más, lee por ruta y sigue. Entregar sub1 y dejar sub2 "para el próximo turno" es la fase a mitad de camino, y no se acepta.
20. **Un comentario en el código es un hallazgo.** Explicativo, TODO, separador o cabecera: se corrige borrándolo, y lo que justificaba va al ledger o al reporte. No se parkea si el archivo ya está en el diff; si no lo está, queda como deuda de limpieza anotada. Excepción: directivas de compilador o linter, shebang y licencia.

## Paso 0 — Estado de cierre

Verificá que el trabajo esté realmente listo para revisarse:

- Todas las olas de `waves.md` en `cerrada`, con commit y gate.
- Worktrees del trabajo eliminados (`git worktree list`).
- Rama limpia: solo pueden quedar artefactos `.hd/` sin commitear.
- `.hd/<trabajo>/` actualizado: `ledger.md`, `waves.md`, `review-progress.md`.
- Respaldo al día si está habilitado.
- El proyecto **se puede levantar**: dependencias instaladas, variables de entorno, seeds o datos de demo, comando de arranque identificado. **Lo levanta el orquestador**, como job en background, antes de despachar el recon: un servidor que arranca un subagente muere con él. Si no arranca, se resuelve antes de lanzar.
- La memoria `.hd/memory.md` al día (el auditor la lee para no inventar datos de prueba que no existen).

Prepará el material por **rutas**:

- diff de cada ola: `.hd/<trabajo>/logs/ola-<N>-diff.patch` (`git diff <base-ola>..<commit-ola>`);
- diff total: `.hd/<trabajo>/logs/cierre-diff.patch` (`git diff <base>..HEAD -- . ':(exclude).hd'`);
- logs de gate de cada ola.

## Paso 1 — Sub1: revisores de código

**Cuántos: uno por ola, todos en una sola tanda.** Lanzá tantos revisores como olas tenga el trabajo, hasta el **máximo de agentes simultáneos que permita el harness**. Consultá ese límite antes de despachar; si no lo podés determinar, lanzá uno por ola y, si el harness rechaza el dispatch, continuá en la tanda siguiente anotándolo en el ledger. No partas las olas en tandas por comodidad: una segunda tanda de revisores cuesta más que la tanda completa.

**Aviso de tokens, antes de despachar** —una línea, sin esperar respuesta:

> "Lanzo <N> revisores en paralelo, uno por ola, para cubrir todo el trabajo en una pasada. Esto consume más tokens que revisar por partes; si preferís que vaya por tandas, decilo ahora."

Anotá en el ledger: `Revisión: <N> revisores en una tanda (<modelo>)`.

Cada `revisor-ola-<N>` recibe, por ruta:

- el diff de su ola;
- el **tablero** de la ola (`reports/ola-<N>-tablero.md`), si existe: dice qué decidió cada agente y por qué;
- `spec.md`, `technical_spec.md`, los planes de esa ola y el prototipo;
- las convenciones del repo y los comandos de verificación;
- la memoria (para no reportar como error algo que el humano decidió);
- el catálogo de `hd-e2e` (`.hd/e2e/casos.md`), si el repo lo tiene: dice qué comportamiento está prometido para cada flujo.

Qué busca, contra el spec, el technical spec y el plan:

1. **Seguridad**: inyecciones, secretos, validaciones faltantes, auth esquivable.
2. **Bugs lógicos**: bordes, flujos incompletos, errores silenciados.
3. **Trampas del lenguaje y librerías**: concurrencia, recursos sin cerrar, errores típicos del stack.
4. **Desviaciones**: todo lo implementado se traza al spec y a un plan; todo lo prometido está implementado. Lo que sobra y lo que falta se reporta.
5. **Comportamiento esperado**: ¿hace lo que dice el plan, con entradas, salidas, casos borde y errores? **Esto reemplaza a los tests.**
6. **Prototipo**: si hay UI, ¿la implementación respeta los flujos, estados y componentes aprobados?
7. **Estándares y calidad**: convenciones, manejo de errores, duplicación evitable, complejidad, dependencias nuevas sin justificar, restos de debug, **comentarios en el código (hallazgo: se borran)**, tests agregados (prohibido).
8. **Footprints**: archivos fuera del plan, archivos compartidos tocados, generados modificados. Un archivo compartido está bien si el tablero declara al dueño de la región y la decisión.
9. **Drift del catálogo de `hd-e2e`**: si el diff cambia comportamiento observable —una ruta, un permiso, un estado, un texto de error, un endpoint, un texto de UI— y no hay un caso nuevo o actualizado en `.hd/e2e/`, es hallazgo. El catálogo quedó viejo y la próxima corrida va a mentir.

**Formato de salida** (`.hd/<trabajo>/reports/revision-ola-<N>.md`):

```md
# Revisión ola <N>
Veredicto: SIN_HALLAZGOS | CON_HALLAZGOS
1. [alta|media|baja] <hallazgo> — archivo:línea — <por qué es un problema> — <cómo verificarlo>
2. ...
```

Nada más. Sin introducción, sin resumen, sin arreglos. El orquestador consolida.

## Paso 2 — Consolidar los hallazgos de código y corregirlos

Cuando terminan **todos** los revisores:

- Leé los reportes (no los pegues en el chat).
- Consolidá una lista única: una fila por hallazgo, deduplicado, ordenado por severidad.
- Volcá el resultado a `review-progress.md` (template en `templates/review-progress-template.md`).
- **Los hallazgos de catálogo no van al fixer**: el `fixer-review` corrige código, no el catálogo. Los casos se agregan o actualizan en `.hd/e2e/` —orquestador, desde el plan— y se commitean con la corrección; si no hubo corrección de código, van en un commit propio: `hd(e2e): <trabajo> — casos de la revisión`.
- **Sin hallazgos → saltá al Paso 3.**
- **Con hallazgos → una corrección**, y después el Paso 3.

La corrección: un solo `fixer-review`, con **todos los hallazgos de código** en un mismo prompt, uno por uno:

- para cada hallazgo: archivo, comportamiento esperado, qué falló y severidad;
- `hd-debug` **obligatorio**: causa raíz primero, un cambio por hipótesis;
- guarda de alcance: un hallazgo, un cambio; si el hallazgo revela un problema más grande, se anota y se reporta, no se expande;
- **sin comentarios**: no agrega ninguno y borra los que el archivo ya traiga, salvo directivas de herramienta, shebang y licencia;
- **no ejecuta scripts** (build, lint, tests, servidores): el gate lo corre el orquestador;
- **no commitea**; reporta en `.hd/<trabajo>/reports/fixer-review.md` del repo principal.

El orquestador:

1. Trabaja en un worktree desde el HEAD de la rama (`.git/hd-wt/<trabajo>/review-fix`).
2. Revisa el diff: que cada hallazgo tenga su cambio y ninguno de más.
3. Consolida (`cherry-pick -n`), commitea `hd(<trabajo>): corrección de revisión` y respalda.
4. Corre **build + lint + estándares** en la rama. Si quedan rojos, **freno real**; no hay segunda corrección.
5. Anota en el ledger y en `review-progress.md` qué hallazgo se corrigió con qué commit.

El código corregido **no se re-revisa**: la re-prueba visual y el gate son la confirmación.

## Paso 3 — Sub2: auditoría visual

Se lanza **solo ahora**: después de que terminaron todos los revisores y, si hubo hallazgos, después de la corrección y con el gate en verde. Nunca antes, nunca en paralelo con el Paso 1, y **nunca se pausa**: ni el contexto del orquestador ni el cambio de turno la cancelan.

Va en tres tramos —**recon → áreas en paralelo → consolidación**— porque el costo fijo de auditar no es probar: es levantar el proyecto, autenticarse y descubrir cómo se navega. Un solo agente lo paga una vez por pasada y, con el presupuesto que se le da, se queda sin reloj antes de probar.

### 3.0 — Recon (presupuesto: 5 min / 8 turnos)

Antes de despachar, el **orquestador** ya levantó el proyecto como job en background con el comando del `technical_spec.md`, comprobó que responde y guardó el estado del árbol: `git status --porcelain > reports/auditoria/arbol-antes.txt`. Después va **un** `recon-auditoria`, que es el único que puede gastar tiempo en descubrir el entorno:

- confirmar que el proyecto quedó vivo, o decir exactamente qué falta (dependencias, env, migración, seed);
- conseguir credenciales reales y sembrar los datos de prueba que el spec necesita;
- **decidir el modo**: `UI` si hay frontend y el navegador arranca; `API` si no hay frontend; `API` con el motivo exacto si el navegador no arranca (sin Docker, `spawn` con `EPERM`, sin display, crash al abrir). La decisión se toma acá, no a mitad de la auditoría;
- escribir el **script base del recorrido**: inicio de sesión y navegación mínima, listo para que las áreas lo usen;
- proponer las **áreas**, cada una con su alcance en una línea y por qué no comparte estado con las otras.

Deja `reports/auditoria/entorno.md` con comando y puerto, URL base, usuarios y cómo se crearon, modo decidido y motivo, ruta del script base y áreas propuestas. **Sin ese archivo no se despacha la auditoría.**

**Nada se instala dentro del repo.** Navegador, `curl`, `jq` y utilidades viven en un directorio de herramientas **fuera del árbol**, declarado en `entorno.md`. Lo que haya que tocar en el repo —dependencias, migración, seed con el CLI del proyecto— lo hace el **orquestador** antes de despachar o cuando el recon lo pide. El recon no commitea y no edita código.

Si agota su presupuesto sin entorno, no se estira: se sigue en modo API con lo que haya o, si tampoco hay API, el veredicto es `NO_VERIFICABLE` y se frena.

### 3.1 — Áreas en paralelo (presupuesto: 6 min / 8 turnos por área)

**Cuántos: entre 2 y 4 `auditor-auditoria-<área>`, todos en un solo mensaje.** Si el trabajo es una sola pantalla o un flujo indivisible, va **un solo auditor** y el motivo queda en `review-progress.md`: partir por partir duplica preparación y fragmenta la evidencia.

El corte es por **superficies que no comparten estado**: pantallas o rutas disjuntas, roles con permisos distintos, o UI para lo que la UI expone y API para lo que no. Nunca por cantidad de casos, y nunca dos áreas sobre el mismo flujo.

Cada auditor recibe, por ruta: `entorno.md`, el script base, **su** área con los flujos y criterios de aceptación del spec, la memoria y el catálogo de `hd-e2e`. **No vuelve a levantar el proyecto ni a autenticarse desde cero**: reusa el servidor y las credenciales del recon.

Qué prueba cada uno **en su área**, en este orden:

1. **Camino principal de su área**, de punta a punta, como el usuario final.
2. **Los controles y operaciones que ese camino toca**: cada botón, formulario, selector y menú del flujo; o cada endpoint, método y parámetro del flujo, con los códigos `400`/`401`/`403`/`404`/`409`/`422`/`5xx` donde correspondan. **El resto de la app no es de esta fase**: es `hd-e2e`.
3. **Auth y permisos** dentro de su área: qué puede y qué no puede hacer el rol que le toca.
4. **Estados y errores**: vacío, carga, error, éxito, permisos insuficientes.
5. **Bordes**: datos raros, campos vacíos, límites, doble click, paginación, duplicados, volver atrás, refrescar.
6. **Persistencia**: lo que se guarda se ve después de recargar, en la sesión siguiente o consultando de nuevo la API.
7. **Consola, red y logs**: errores de consola, requests fallidos, warnings relevantes y los logs del servidor.

Reglas del auditor:

- **No instala nada dentro del repo**, igual que el recon: las herramientas viven fuera del árbol y quedan declaradas en `entorno.md`. Tampoco commitea.
- **No modifica código de producción.** Si para probar hace falta un dato o un usuario, se crea en la base de prueba o con seeds.
- **El catálogo de `hd-e2e` es evidencia, no tarea**: anota qué casos ejercitó y qué caminos descubrió; no lo edita.
- Si el entorno no permite probar algo, lo declara **no verificable**; no lo cuenta como verde.

**Forma de trabajar.** La auditoría es una inspección, no una exploración.

- **Un recorrido, un script.** Cada auditor escribe **un script** (Playwright/CDP headless si es UI; `.sh` con `curl`/`fetch` si es API) que hace todo su camino en una sola pasada: login, flujos, estados, bordes, capturas y volcado de consola/red a un log. Lo corre, lee el resultado y recién ahí mira el material con ojo. **No se hace una captura por turno**: cada turno cuesta cerca de un minuto y veinte capturas sueltas son veinte minutos.
- **El script se guarda** junto con su log: es la evidencia y es lo que corre la re-prueba.
- **Explorar es la excepción, no el método.** Un tramo que no se puede automatizar (captcha, OTP a mano) se hace a mano y se declara.

Deja dos cosas:

- `reports/auditoria/<área>.md` con sus fallos, en el formato de abajo;
- `reports/evidencia/<área>/recorrido.<ext>` y su log. Con una sola área: `reports/evidencia/recorrido.<ext>`.

**Formato del área**:

```md
# Auditoría — <área>
Modo: UI | API (navegador no disponible: <motivo>)
Veredicto: OK | CON_FALLOS
- [alta|media|baja] <flujo> — pasos exactos — esperado — obtenido — evidencia (captura/log/ruta)

## No verificado
- <lo que no se pudo probar en esta área>: residual declarado, no verde

## Casos del catálogo ejercitados
- <ID>: PASA | FALLA | no aplica

## Descubierto (no está en el catálogo)
- <flujo> — pasos exactos — esperado
```

### 3.2 — Consolidación (orquestador, presupuesto: 2 min / 2 turnos)

- Un solo `reports/auditoria-visual.md`: deduplicá por flujo, ordená por severidad y poné el área delante de cada fallo.
- **Veredicto**: `OK` si ninguna área reportó fallos; `CON_FALLOS` si al menos una los reportó; **`NO_VERIFICABLE`** si el recon no consiguió entorno ni modo API. Ese último frena el cierre y se reporta al humano: no es verde.
- **Verificá el árbol**: `git status --porcelain` contra `reports/auditoria/arbol-antes.txt`. Una diferencia **fuera de `.hd/`** es residuo del entorno: se revierte, se anota en el reporte y se corrige donde se originó (el repo no es del auditor).
- **Commiteá la evidencia acá**, con el veredicto y antes de decidir si hay corrección: `hd(<trabajo>): auditoría visual — reportes y evidencia`. Si el trabajo se frena en este punto, lo que prueba por qué queda adentro del repo. Script, log, capturas y reportes; video, nunca.
- Un fallo sin pasos reproducibles no se manda al fixer: se devuelve **una vez** al área que lo reportó.

Cada fallo tiene que poder reproducirse con los pasos escritos. Un "no anda" no sirve.

**Presupuesto de la subfase 2.** Estos presupuestos son de los **subagentes**: son topes de su tramo, no del orquestador. El orquestador no tiene presupuesto de contexto que lo autorice a cortar la fase.

El reloj de cada tramo es propio; el del auditor **no** incluye al fixer, al gate ni a la re-prueba.

| Tramo | Quién | Presupuesto | Si se agota |
|---|---|---|---|
| Recon | `recon-auditoria` | 5 min / 8 turnos | modo API con lo que haya, o `NO_VERIFICABLE` |
| Auditoría | 2-4 `auditor-auditoria-<área>` en paralelo | 6 min / 8 turnos cada uno | corta y declara residual de su área |
| Consolidación | orquestador | 2 min / 2 turnos | consolida con lo que haya |
| Corrección | `fixer-visual` | 10 min / 10 turnos, reloj propio | freno real con diagnóstico |
| Re-prueba | los mismos roles y scripts | el tiempo de los scripts + 5 min / 6 turnos | reporta lo que faltó |

## Paso 4 — Corrección de los fallos visuales

- **Veredicto OK → saltá al Paso 6.**
- **CON_FALLOS → una corrección**, y después el Paso 5.
- **NO_VERIFICABLE → freno real**: se reporta al humano qué no se pudo probar y por qué. No hay corrección posible ni verde.

Un `fixer-visual` con todos los fallos juntos, cada uno con sus pasos de reproducción, `hd-debug` obligatorio, guarda de alcance, sin scripts y sin commitear. **Su presupuesto es propio: 10 minutos o 10 turnos**, y no consume el reloj de la auditoría. Reporta en `.hd/<trabajo>/reports/fixer-visual.md`.

El orquestador repite la mecánica del Paso 2: worktree, revisar el diff, `cherry-pick -n`, commit `hd(<trabajo>): corrección de auditoría visual`, respaldo y **build + lint + estándares**. Rojo → **freno real**.

## Paso 5 — Re-prueba visual

Con el gate verde, lanzá **los mismos roles por área con los mismos scripts** contra el árbol corregido, no solo los fallos:

- primero **re-ejecutá los scripts de la primera pasada** (`reports/evidencia/<área>/recorrido.<ext>`): mismos flujos, mismos controles, mismos estados y bordes, mismas capturas. La re-prueba es barata porque el recorrido ya está escrito;
- después sumá a cada script los pasos de los fallos corregidos en su área, con los pasos originales, y corré **el recorrido entero** de nuevo;
- **presupuesto: el tiempo de los scripts más 5 minutos o 6 turnos por área**, con techo de 10 minutos por área si la primera pasada fue grande. No se re-explora: se re-ejecuta;
- cada área deja `reports/auditoria/<área>-reprueba.md` y el orquestador consolida en `.hd/<trabajo>/reports/auditoria-visual-reprueba.md`, con los logs de los recorridos como evidencia;
- **commiteá la re-prueba** con su veredicto: `hd(<trabajo>): re-prueba visual — veredicto y evidencia`. La evidencia no espera al cierre.

- **OK**: todo verde. Anotá el veredicto en `review-progress.md` y pasá al cierre.
- **CON_FALLOS**: **freno real**. Reportá al humano con diagnóstico: qué falló, qué se intentó y por qué no alcanzó. No hay segunda corrección ni segunda re-prueba automática.

## Paso 6 — Cierre y encadenado

Con los revisores sin hallazgos abiertos, todas las correcciones commiteadas y el gate verde (y la re-prueba visual en OK si hubo corrección visual):

1. Actualizá `review-progress.md`: bloque por ola, bloque de auditoría visual, correcciones y re-prueba, veredicto global.
2. Actualizá el ledger: `Revisión: <N> revisores en una tanda, <n> hallazgos, corregidos <sha>`, `Auditoría visual: OK (<fecha>)`, `Re-prueba: OK | no aplica (sin corrección visual)`, `Gate: build <r>, lint <r>, estándares <r>`.
3. Si alguna área marcó casos ejercitados o descubrió caminos, actualizá `.hd/e2e/casos.md` —IDs nuevos en `NUEVO`, los ejercitados con su fecha y resultado— y commiteá `hd(e2e): <trabajo> — casos de la revisión`. Sin push.
4. **Cargá la skill `hd-close` VOS MISMO** y ejecutá la fase 5. No esperes aprobación humana: la aprobación de producto ocurrió en discovery y el comportamiento lo validó el auditor visual.

## Lo que no se hace en esta fase

- No se lanza el auditor visual en paralelo con los revisores ni antes de corregir: probaría un árbol viejo.
- No se corre la suite de la app entera: eso es `hd-e2e`, que invoca el humano y no forma parte de esta fase.
- No se despacha la auditoría sin `reports/auditoria/entorno.md`: sin entorno y sin credenciales, el auditor explora en vez de inspeccionar.
- No se parte la auditoría en más de cuatro áreas ni por cantidad de casos: más áreas son más preparación y una consolidación que pierde fallos.
- No se entrega la fase en el borde de sub1 ni se deja sub2 "para otro turno" por presupuesto de contexto: la auditoría visual es obligatoria y va en la misma corrida.
- No se le pide al humano que pruebe (el auditor visual lo reemplaza).
- No se invoca `hd-fast-implement` desde acá: la vía rápida es solo para pedidos directos del humano.
- No se re-revisa el código después de la corrección: la re-prueba visual y el gate son la confirmación.
- No se squashéan los commits: el historial por ola se conserva.
- No se descarta un hallazgo en silencio: si es falso positivo, se marca con razón en el ledger.

## Racionalizaciones comunes (y su realidad)

| Excusa | Realidad |
|---|---|
| "El gate ya pasó en cada ola, no hace falta correrlo" | La revisión corrige código: el gate de la rama es evidencia nueva y obligatoria. |
| "Con un revisor alcanza" | Cada ola tiene su revisor y se lanzan todos los que el harness permita, en una sola tanda. Una sola lectura deja huecos. |
| "Lanzo cuatro revisores y después otra tanda" | No: se cubre todo de una pasada. Encadenar tandas cuesta más tokens y más tiempo que lanzar la tanda completa. |
| "El visual en paralelo ahorra tiempo" | No: tiene que probar el árbol corregido. Si corre antes, prueba bugs que ya vas a arreglar. |
| "El auditor visual es caro, lo salteo" | Sin tests, es la única prueba de comportamiento. Sin él, la confianza es fe. |
| "No hay frontend, así que no hay nada que auditar" | Se audita la API con curl/fetch, como un humano con Postman: auth, CRUD, errores, permisos y persistencia. |
| "El navegador no arranca, así que no puedo auditar" | Se audita por API, como un dev con Postman/APIdog, y se declara qué flujos de UI quedaron sin probar. Residual ≠ verde. |
| "Total el navegador falló, cierro con OK igual" | No: se declara el modo API, los residuales de UI y el motivo. El cierre los reporta; no se inventa un verde. |
| "El auditor probó la API y respondió 200" | Un 200 suelto no verifica nada: hacen falta la secuencia completa, los estados, los permisos y la persistencia. |
| "El fixer ya arregló, no hace falta re-probar" | El fixer no ejecuta nada. La re-prueba completa es la única evidencia de que la feature quedó entera. |
| "Re-pruebo solo lo que falló" | Un cambio puede romper otra parte del flujo. Se re-prueba la feature completa: el script entero, no solo el tramo corregido. |
| "Una captura por turno es más ordenada" | Cada turno cuesta cerca de un minuto: veinte capturas sueltas son veinte minutos. Un script recorre todo y saca las veinte en un par de minutos. |
| "La re-prueba completa es volver a explorar" | Es correr el mismo script sobre el árbol corregido: mismos flujos, misma evidencia, una fracción del tiempo. |
| "El presupuesto se estira para terminar de mirar" | Se corta y lo que faltó es residual declarado. Una auditoría de una hora no es más confiable: es la misma evidencia con veinte turnos de por medio. |
| "Una ronda más y converge" | No hay ronda 2: si no converge, el diagnóstico está mal o el problema es estructural. Se reporta. |
| "El auditor visual puede tocar el código un poquito" | No: si toca el producto, deja de ser auditor. |
| "Los revisores pueden corregir lo que encuentran" | No: el que revisa no corrige. El fixer es otro y va después. |
| "Casi conforme con el spec" | Casi = residual. Se reporta con diagnóstico; no hay ronda 2. |
| "Me quedé sin presupuesto de contexto: entrego sub1 y sigo en otro turno" | No: el orquestador no tiene ese presupuesto. Si el contexto aprieta, se delega más y se lee por ruta; cortar en el borde de sub1 deja el trabajo a mitad de camino y la auditoría visual sin correr. |
| "El humano igual va a querer probar" | El humano recibe el trabajo cerrado y un resumen; si quiere probar, prueba, pero no es una puerta del proceso. |
| "Auditar con el modelo default alcanza" | Sin tests, la auditoría es la única lectura del trabajo: va con el mejor modelo disponible y permitido. El premium sin permiso no se usa; se anota el ruling. |
| "Con un auditor para todo alcanza" | El costo fijo de levantar y autenticar se paga una vez: el recon. Las áreas prueban en paralelo lo que ya está resuelto. |
| "Parto la auditoría en diez áreas y termino antes" | Entre 2 y 4, por superficies disjuntas. Más áreas son más preparación duplicada y una consolidación que pierde fallos. |
| "El tope de minutos se cumple solo" | No se cumple: se cumple el de turnos, que tiene checkpoint. 8 turnos por área y se corta. |
| "El auditor audita la app entera, total es chica" | Audita su área: los flujos del spec y los controles que tocan. La app entera es `hd-e2e`. |
| "El fixer entra en el mismo presupuesto" | No: relojes separados. Mezclarlos es lo que hizo que una pasada de 10 minutos se reportara como 70. |
