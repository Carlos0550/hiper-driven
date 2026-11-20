---
name: hd-review
description: "Fase 4 del framework Hiper-driven (HD), autónoma y en dos subfases en serie. Primero, revisores independientes —uno por ola, tantos como permita el harness, todos en una sola tanda y avisando al humano el costo en tokens— leen el código y escriben solo sus hallazgos; un fixer los corrige, el orquestador commitea y corre el gate. Recién entonces un auditor visual levanta el proyecto entero y prueba la feature como un humano: por la UI si hay frontend, o con curl/fetch contra la API —como con Postman o APIdog— si no lo hay. Si la auditoría visual encuentra fallos, un fixer los corrige y el mismo auditor re-prueba la feature completa. Los revisores y el auditor se despachan con el modelo de mayor calidad disponible según el catálogo y la estrategia de la memoria (premium solo con permiso ya dado). Si sale bien, hd-close se invoca solo. No hay prueba del humano ni tests."
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
   ├─ Paso 3 · sub2: auditor visual (UI, o API con curl/fetch) ──→ fallos
   │      └─ Paso 4 · si hay: un fixer corrige → commit → gate
   │
   └─ Paso 5 · re-prueba visual completa ──→ Paso 6 · hd-close automático
```

**Por qué en serie y no en paralelo:** el auditor visual tiene que probar el árbol **ya corregido**. Si corre junto con los revisores, prueba bugs que todavía vas a arreglar y su reporte nace viejo.

**No hay humano en esta fase.** Aparece recién cuando el trabajo está cerrado o si hay un freno real. El aviso de tokens del Paso 1 es un aviso, no una pregunta.

## Subagentes

| Subagente | Qué hace | Qué no hace |
|---|---|---|
| **Orquestador** | Coordina, consolida, commitea, corre el gate, decide | **No escribe código de producción** |
| **Revisor** (`revisor-ola-<N>`) | Lee el diff de su ola y escribe hallazgos | No corrige, no ejecuta, no narra |
| **Auditor visual** (`auditor-visual`) | Levanta el proyecto y lo prueba como un humano: UI o API con `curl`/`fetch` | No edita el producto |
| **Fixer** (`fixer-review`, `fixer-visual`) | Corrige todos los hallazgos de una tanda, uno por uno | No rediseña, no amplía alcance, no commitea |

**Independencia:** los revisores no participaron de ninguna ola; el auditor visual tampoco; el fixer no audita. La corrección la confirma el comportamiento, no el autor.

## Catálogo de modelos: la auditoría va con el mejor

La auditoría con criterio —revisores y auditor visual— es la tarea que más calidad necesita: sin tests, es la única lectura del trabajo.

1. **Leé la estrategia de `.hd/memory.md`**: el modelo por tipo de tarea y los permisos premium se aprobaron en discovery (o con la pregunta única de `hd-implement`). No se vuelve a preguntar.
2. **Consultá el catálogo** con `list_subagent_models` si el harness lo permite, para verificar que los modelos de la estrategia siguen disponibles y elegir el esfuerzo de razonamiento. Si no está disponible, usá el default y anotalo en el ledger. **El catálogo no publica precios**: si hace falta un precio —por ejemplo, para decidir si un modelo supera el umbral de 5 USD/M—, se busca en internet (páginas oficiales); no se le pregunta al provider, y un precio no verificable se trata como desconocido.
3. **Asigná**: revisores y auditor visual con el de **mayor calidad disponible** (p. ej. Qwen4 u Opus 5.5 si están en el catálogo y permitidos); los fixers con la mejor relación calidad/precio.
4. **Premium (más de 5 USD/M en cualquier precio publicado)**: solo con permiso ya registrado en la memoria. **Esta fase no pregunta**: la excepción de la pregunta única es de `hd-implement`. Sin permiso, usá el mejor dentro del presupuesto y anotá el ruling.
5. **Dispatch explícito**: pasá `provider`, `model` y `reasoning_effort` en cada `subagent`; anotá en el ledger qué modelo llevó cada revisor y el auditor.

## Reglas duras

1. **Sub1 y sub2 van en serie, nunca en paralelo.** Primero todas las lecturas de código; después, con los hallazgos corregidos y el gate verde, el comportamiento.
2. **Un revisor por ola, todos los que permita el harness, en una sola tanda.** Nada de cuatro y después otra tanda: se cubre todo el trabajo de una pasada.
3. **El costo en tokens se avisa.** Antes de despachar los revisores, una línea al humano con cuántos agentes se lanzan y por qué; no se espera respuesta.
4. **Los revisores escriben solo hallazgos.** Nada de prosa, nada de arreglos: archivo:línea, severidad, por qué y cómo verificarlo. Su veredicto es una línea.
5. **El auditor visual prueba como un humano, de punta a punta.** Por la UI si hay frontend; si no, contra la API con `curl`/`fetch`, como con Postman o APIdog: auth real, secuencias completas, errores, permisos y persistencia. **Si el navegador no arranca, cae a modo API** y declara qué parte de la UI quedó sin probar: nunca se declara verde lo que no se probó.
6. **Una corrección por tanda de hallazgos, con todos juntos.** Un hallazgo, un cambio. Nada de refactors colados.
7. **Una sola re-prueba.** Si después de corregir los fallos visuales la re-prueba vuelve a fallar, es **freno real** con diagnóstico. No hay segunda ronda.
8. **La re-prueba es completa**, no solo de lo que falló: la misma feature entera, de nuevo.
9. **Ningún veredicto sin evidencia fresca en este turno.** La salida de build + lint + estándares que corriste vos, y los archivos de hallazgos y de prueba.
10. **El orquestador no escribe producción.** El fix lo hace un subagente.
11. **Sin tests.** Ni los fixers ni el auditor agregan tests; el orquestador no los pide.
12. **Verde no es aprobación humana.** Si la revisión y la re-prueba salen bien, se cierra solo.

## Paso 0 — Estado de cierre

Verificá que el trabajo esté realmente listo para revisarse:

- Todas las olas de `waves.md` en `cerrada`, con commit y gate.
- Worktrees del trabajo eliminados (`git worktree list`).
- Rama limpia: solo pueden quedar artefactos `.hd/` sin commitear.
- `.hd/<trabajo>/` actualizado: `ledger.md`, `waves.md`, `review-progress.md`.
- Respaldo al día si está habilitado.
- El proyecto **se puede levantar**: dependencias instaladas, variables de entorno, seeds o datos de demo, comando de arranque identificado. Si no se puede, el auditor visual lo va a declarar y eso es rojo: resolvelo antes de lanzar.
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
- la memoria (para no reportar como error algo que el humano decidió).

Qué busca, contra el spec, el technical spec y el plan:

1. **Seguridad**: inyecciones, secretos, validaciones faltantes, auth esquivable.
2. **Bugs lógicos**: bordes, flujos incompletos, errores silenciados.
3. **Trampas del lenguaje y librerías**: concurrencia, recursos sin cerrar, errores típicos del stack.
4. **Desviaciones**: todo lo implementado se traza al spec y a un plan; todo lo prometido está implementado. Lo que sobra y lo que falta se reporta.
5. **Comportamiento esperado**: ¿hace lo que dice el plan, con entradas, salidas, casos borde y errores? **Esto reemplaza a los tests.**
6. **Prototipo**: si hay UI, ¿la implementación respeta los flujos, estados y componentes aprobados?
7. **Estándares y calidad**: convenciones, manejo de errores, duplicación evitable, complejidad, dependencias nuevas sin justificar, restos de debug, tests agregados (prohibido).
8. **Footprints**: archivos fuera del plan, archivos compartidos tocados, generados modificados. Un archivo compartido está bien si el tablero declara al dueño de la región y la decisión.

**Formato de salida** (`.hd/<trabajo>/reports/revision-ola-<N>.md`):

```md
# Revisión ola <N>
Veredicto: SIN_HALLAZGOS | CON_HALLAZGOS
1. [severidad] <hallazgo> — archivo:línea — <por qué es un problema> — <cómo verificarlo>
2. ...
```

Nada más. Sin introducción, sin resumen, sin arreglos. El orquestador consolida.

## Paso 2 — Consolidar los hallazgos de código y corregirlos

Cuando terminan **todos** los revisores:

- Leé los reportes (no los pegues en el chat).
- Consolidá una lista única: una fila por hallazgo, deduplicado, ordenado por severidad.
- Volcá el resultado a `review-progress.md` (template en `templates/review-progress-template.md`).
- **Sin hallazgos → saltá al Paso 3.**
- **Con hallazgos → una corrección**, y después el Paso 3.

La corrección: un solo `fixer-review`, con **todos** los hallazgos en un mismo prompt, uno por uno:

- para cada hallazgo: archivo, comportamiento esperado, qué falló y severidad;
- `hd-debug` **obligatorio**: causa raíz primero, un cambio por hipótesis;
- guarda de alcance: un hallazgo, un cambio; si el hallazgo revela un problema más grande, se anota y se reporta, no se expande;
- **no ejecuta scripts** (build, lint, tests, servidores): el gate lo corre el orquestador;
- **no commitea**; reporta en `.hd/<trabajo>/reports/fixer-review.md` del repo principal.

El orquestador:

1. Trabaja en un worktree desde el HEAD de la rama (`.git/hd-wt/<trabajo>/review-fix`).
2. Revisa el diff: que cada hallazgo tenga su cambio y ninguno de más.
3. Consolida (`cherry-pick -n`), commitea `hd(<trabajo>): corrección de revisión` y respalda.
4. Corre **build + lint + estándares** en la rama. Si quedan rojos, **freno real**; no hay segunda corrección.
5. Anota en el ledger y en `review-progress.md` qué hallazgo se corrigió con qué commit.

El código corregido **no se re-revisa**: la re-prueba visual y el gate son la confirmación.

## Paso 3 — Sub2: auditor visual

Se lanza **solo ahora**: después de que terminaron todos los revisores y, si hubo hallazgos, después de la corrección y con el gate en verde. Nunca antes, nunca en paralelo con el Paso 1.

Su trabajo es sentarse como un humano y probar la feature de punta a punta.

Brief:

- El proyecto, cómo levantarlo y qué entorno usar (dev/staging local, docker, seeds).
- La feature y los flujos que el spec promete, con los criterios de aceptación.
- **Qué probar: UI o API.**
  - Si hay frontend: la UI, click por click.
  - Si no hay frontend: la **API como un humano con Postman o APIdog**, con `curl` o `fetch` contra el servidor. Auth real (login, token, refresh), secuencias completas de punta a punta (`POST` → `GET` → `PATCH` → `DELETE`), códigos de estado, validaciones, permisos, paginación y persistencia consultando después. Un endpoint suelto que responde 200 no es una feature.
  - Si hay UI pero la feature tiene partes que la UI no expone, se prueban por API además de la UI.
  - **Si el navegador no arranca** (sin Docker, headless bloqueado por el sandbox —`spawn` con `EPERM`—, faltan dependencias del sistema, no hay display, crash al abrir): **no se declara la auditoría imposible**. Se pasa a **modo API** y se prueba todo lo que la API exponga, como un dev con Postman o APIdog. El reporte dice `Modo: API (navegador no disponible: <motivo exacto>)` y lista **qué flujos de UI quedaron sin probar** (clicks, estados visuales, responsive, consola del cliente): esos son **residuales declarados**, no verdes. Un intento de arreglar el entorno es válido (instalar deps, usar `--headless`, otro puerto) pero si no hay navegador, la API es la evidencia. Si además no hay API, ahí sí es `no verificable` y se reporta como tal.
- **Puede instalar o crear lo que necesite para trabajar bien** (dependencias, navegador automatizado, `curl`, `jq`, `httpie`, datos de demo). Preferí instalaciones efímeras o fuera del repo; si algo queda instalado en el repo, anotalo y limpialo al terminar.
- **No modifica código de producción.** Si para probar hace falta un dato o un usuario, lo crea en la base de prueba o con seeds, no en el código.
- Puede ejecutar comandos y navegar (o pegarle a la API): es la excepción a la regla de "sin scripts", porque su evidencia es el comportamiento.
- Si el entorno no permite probar algo, lo declara **explícitamente** en el reporte como no verificable; no lo cuenta como verde.

Qué prueba, en este orden:

1. **Arranque**: levanta el proyecto entero, sin atajos, como lo haría un humano.
2. **Auth y permisos**: inicia sesión o consigue el token; verifica qué puede y qué no puede hacer.
3. **Camino principal**: recorre la feature completa —UI o API— y la usa como el usuario final.
4. **Todos los controles / todas las operaciones**: cada botón, link, formulario, selector y menú; o cada endpoint, método y parámetro de la feature.
5. **Estados y errores**: vacío, carga, error, éxito, permisos insuficientes; y en API los códigos `400`/`401`/`403`/`404`/`409`/`422`/`5xx` donde correspondan.
6. **Bordes**: datos raros, campos vacíos, límites, doble click, paginación, duplicados, volver atrás, refrescar.
7. **Persistencia**: lo que se guarda, se ve después de recargar, en la sesión siguiente o consultando de nuevo la API.
8. **Consola, red y logs**: errores de consola, requests fallidos, warnings relevantes, y los logs del servidor.

**Formato de salida** (`.hd/<trabajo>/reports/auditoria-visual.md`):

```md
# Auditoría visual
Modo: UI | API (navegador no disponible: <motivo>)
Veredicto: OK | CON_FALLOS
- [severidad] <flujo> — pasos exactos — esperado — obtenido — evidencia (captura/log/ruta)

## No verificado
- <flujos de UI que el modo API no cubre>: residual declarado, no verde
```

Cada fallo tiene que poder reproducirse con los pasos escritos. Un "no anda" no sirve.

## Paso 4 — Corrección de los fallos visuales

- **Veredicto OK → saltá al Paso 6.**
- **CON_FALLOS → una corrección**, y después el Paso 5.

Un `fixer-visual` con todos los fallos juntos, cada uno con sus pasos de reproducción, `hd-debug` obligatorio, guarda de alcance, sin scripts y sin commitear. Reporta en `.hd/<trabajo>/reports/fixer-visual.md`.

El orquestador repite la mecánica del Paso 2: worktree, revisar el diff, `cherry-pick -n`, commit `hd(<trabajo>): corrección de auditoría visual`, respaldo y **build + lint + estándares**. Rojo → **freno real**.

## Paso 5 — Re-prueba visual

Con el gate verde, lanzá **el mismo auditor visual** a probar **la feature completa de nuevo**, no solo los fallos:

- mismos flujos, mismos controles, mismos estados y bordes que la primera pasada;
- además, los casos que fallaron, con los pasos originales;
- reporte nuevo en `.hd/<trabajo>/reports/auditoria-visual-reprueba.md`.

- **OK**: todo verde. Anotá el veredicto en `review-progress.md` y pasá al cierre.
- **CON_FALLOS**: **freno real**. Reportá al humano con diagnóstico: qué falló, qué se intentó y por qué no alcanzó. No hay segunda corrección ni segunda re-prueba automática.

## Paso 6 — Cierre y encadenado

Con los revisores sin hallazgos abiertos, todas las correcciones commiteadas y el gate verde (y la re-prueba visual en OK si hubo corrección visual):

1. Actualizá `review-progress.md`: bloque por ola, bloque de auditoría visual, correcciones y re-prueba, veredicto global.
2. Actualizá el ledger: `Revisión: <N> revisores en una tanda, <n> hallazgos, corregidos <sha>`, `Auditoría visual: OK (<fecha>)`, `Re-prueba: OK | no aplica (sin corrección visual)`, `Gate: build <r>, lint <r>, estándares <r>`.
3. **Cargá la skill `hd-close` VOS MISMO** y ejecutá la fase 5. No esperes aprobación humana: la aprobación de producto ocurrió en discovery y el comportamiento lo validó el auditor visual.

## Lo que no se hace en esta fase

- No se lanza el auditor visual en paralelo con los revisores ni antes de corregir: probaría un árbol viejo.
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
| "Re-pruebo solo lo que falló" | Un cambio puede romper otra parte del flujo. Se re-prueba la feature completa. |
| "Una ronda más y converge" | No hay ronda 2: si no converge, el diagnóstico está mal o el problema es estructural. Se reporta. |
| "El auditor visual puede tocar el código un poquito" | No: si toca el producto, deja de ser auditor. |
| "Los revisores pueden corregir lo que encuentran" | No: el que revisa no corrige. El fixer es otro y va después. |
| "Casi conforme con el spec" | Casi = residual. Se reporta con diagnóstico; no hay ronda 2. |
| "El humano igual va a querer probar" | El humano recibe el trabajo cerrado y un resumen; si quiere probar, prueba, pero no es una puerta del proceso. |
| "Auditar con el modelo default alcanza" | Sin tests, la auditoría es la única lectura del trabajo: va con el mejor modelo disponible y permitido. El premium sin permiso no se usa; se anota el ruling. |
