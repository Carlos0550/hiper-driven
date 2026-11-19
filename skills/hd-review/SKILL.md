---
name: hd-review
description: Fase 4 del framework Hiper-driven (HD), autónoma y en dos subfases en paralelo. Hasta cuatro revisores independientes, uno por ola, leen el código y escriben solo sus hallazgos; al mismo tiempo un auditor visual levanta el proyecto entero y prueba la feature como un humano, click por click, de punta a punta. Con todo junto, un solo fixer corrige los hallazgos uno por uno, el orquestador commitea y corre el gate, y el mismo auditor visual vuelve a probar la feature completa. Los revisores y el auditor se despachan con el modelo de mayor calidad disponible según el catálogo y la estrategia de la memoria (premium solo con permiso ya dado). Si sale bien, hd-close se invoca solo. No hay prueba del humano ni tests.
---

# HD — Fase 4: Revisión y auditoría visual

Sos el **orquestador**. Esta fase es la que hace que el trabajo de un LLM sea **confiable** sin tests: dos lecturas independientes del mismo trabajo, una de código y una de comportamiento, en paralelo.

No arranca hasta que **TODAS las olas están cerradas** en `hd-implement`.

```
olas cerradas
   ├── sub1: revisores por ola (máx. 4, en paralelo) ──→ hallazgos por escrito
   └── sub2: auditor visual (proyecto entero, como un humano) ──→ fallos por escrito
                                   ↓
                    un solo fixer corrige todo, uno por uno
                                   ↓
                    gate del orquestador en la rama
                                   ↓
                    el mismo auditor visual re-prueba la feature completa
                                   ↓
                          verde → hd-close automático
```

**No hay humano en esta fase.** El humano aparece recién cuando el trabajo está cerrado, o si hay un freno real.

## Subagentes

| Subagente | Qué hace | Qué no hace |
|---|---|---|
| **Orquestador** | Coordina, consolida, commitea, corre el gate, decide | **No escribe código de producción** |
| **Revisor** (`revisor-ola-<N>`, hasta 4) | Lee el diff de su ola y escribe hallazgos | No corrige, no ejecuta, no narra |
| **Auditor visual** (`auditor-visual`) | Levanta el proyecto y lo prueba como un humano | No edita el producto |
| **Fixer** (`fixer-review`) | Corrige todos los hallazgos, uno por uno | No rediseña, no amplía alcance, no commitea |

**Independencia:** los revisores no participaron de ninguna ola; el auditor visual tampoco; el fixer no audita. La corrección es una sola y la confirma el comportamiento, no el autor.

## Catálogo de modelos: la auditoría va con el mejor

La auditoría con criterio —revisores y auditor visual— es la tarea que más calidad necesita: sin tests, es la única lectura del trabajo.

1. **Leé la estrategia de `.hd/memory.md`**: el modelo por tipo de tarea y los permisos premium se aprobaron en discovery (o con la pregunta única de `hd-implement`). No se vuelve a preguntar.
2. **Consultá el catálogo** con `list_subagent_models` si el harness lo permite, para verificar que los modelos de la estrategia siguen disponibles y elegir el esfuerzo de razonamiento. Si no está disponible, usá el default y anotalo en el ledger.
3. **Asigná**: revisores y auditor visual con el de **mayor calidad disponible** (p. ej. Qwen4 u Opus 5.5 si están en el catálogo y permitidos); `fixer-review` con la mejor relación calidad/precio.
4. **Premium (más de 5 USD/M en cualquier precio publicado)**: solo con permiso ya registrado en la memoria. **Esta fase no pregunta**: la excepción de la pregunta única es de `hd-implement`. Sin permiso, usá el mejor dentro del presupuesto y anotá el ruling.
5. **Dispatch explícito**: pasá `provider`, `model` y `reasoning_effort` en cada `subagent`; anotá en el ledger qué modelo llevó cada revisor y el auditor.

## Reglas duras

1. **Sub1 y sub2 corren en paralelo.** Los revisores leen código mientras el auditor visual prueba el sistema. No se serializan.
2. **Los revisores escriben solo hallazgos.** Nada de prosa, nada de arreglos: archivo:línea, severidad, por qué y cómo verificarlo. Su veredicto es una línea.
3. **El auditor visual prueba como un humano, de punta a punta.** Login, navegación, clicks, formularios, estados de error: si la feature no se puede recorrer entera, no está verificada.
4. **Un solo fixer, con todos los hallazgos juntos.** Un hallazgo, un cambio. Nada de refactors colados.
5. **Una sola corrección.** Si después de corregir y re-probar sigue rojo, es **freno real** con diagnóstico. No hay segunda ronda.
6. **La re-prueba es completa**, no solo de lo que falló: la misma feature entera, de nuevo.
7. **Ningún veredicto sin evidencia fresca en este turno.** La salida de build + lint + estándares que corriste vos, y los archivos de hallazgos y de prueba.
8. **El orquestador no escribe producción.** El fix lo hace un subagente.
9. **Sin tests.** Ni el fixer ni el auditor agregan tests; el orquestador no los pide.
10. **Verde no es aprobación humana.** Si la revisión y la re-prueba salen bien, se cierra solo.

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

## Paso 1 — Sub1: revisores por ola

Lanzá **hasta 4 revisores en paralelo**, uno por ola. Si hay más de 4 olas, agrupá olas consecutivas en un revisor y decilo en el brief.

Cada `revisor-ola-<N>` recibe, por ruta:

- el diff de su ola;
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
8. **Footprints**: archivos fuera del plan, archivos compartidos tocados, generados modificados.

**Formato de salida** (`.hd/<trabajo>/reports/revision-ola-<N>.md`):

```md
# Revisión ola <N>
Veredicto: SIN_HALLAZGOS | CON_HALLAZGOS
1. [severidad] <hallazgo> — archivo:línea — <por qué es un problema> — <cómo verificarlo>
2. ...
```

Nada más. Sin introducción, sin resumen, sin arreglos. El orquestador consolida.

## Paso 2 — Sub2: auditor visual (en paralelo con sub1)

Lanzá `auditor-visual` **al mismo tiempo** que los revisores. Su trabajo es sentarse como un humano y probar la feature de punta a punta.

Brief:

- El proyecto, cómo levantarlo y qué entorno usar (dev/staging local, docker, seeds).
- La feature y los flujos que el spec promete, con los criterios de aceptación.
- **Puede instalar o crear lo que necesite para trabajar bien** (dependencias, navegador automatizado, datos de demo). Preferí instalaciones efímeras o fuera del repo; si algo queda instalado en el repo, anotalo y limpialo al terminar.
- **No modifica código de producción.** Si para probar hace falta un dato o un usuario, lo crea en la base de prueba o con seeds, no en el código.
- Puede ejecutar comandos y navegar: es la excepción a la regla de "sin scripts", porque su evidencia es el comportamiento.
- Si el entorno no permite probar algo, lo declara **explícitamente** en el reporte como no verificable; no lo cuenta como verde.

Qué prueba, en este orden:

1. **Arranque**: levanta el proyecto entero, sin atajos, como lo haría un humano.
2. **Camino principal**: inicia sesión, navega hasta la feature, la usa.
3. **Todos los controles**: cada botón, link, formulario, selector y menú de la feature.
4. **Estados**: vacío, carga, error, éxito, permisos insuficientes.
5. **Bordes**: datos raros, campos vacíos, límites, doble click, volver atrás, refrescar.
6. **Persistencia**: lo que se guarda, se ve después de recargar y en la sesión siguiente.
7. **Consola y red**: errores de consola, requests fallidos, warnings relevantes.

**Formato de salida** (`.hd/<trabajo>/reports/auditoria-visual.md`):

```md
# Auditoría visual
Veredicto: OK | CON_FALLOS
- [severidad] <flujo> — pasos exactos — esperado — obtenido — evidencia (captura/log/ruta)
```

Cada fallo tiene que poder reproducirse con los pasos escritos. Un "no anda" no sirve.

## Paso 3 — Consolidar

Cuando **ambos** terminan:

- Leé los reportes (no los pegues en el chat).
- Consolidá una lista única de hallazgos: revisores + auditor visual, deduplicados, ordenados por severidad.
- Volcá el resultado a `review-progress.md` (template en `templates/review-progress-template.md`).
- Si no hay hallazgos y el veredicto visual es OK: **saltá al Paso 6** (cierre).
- Si hay hallazgos: seguí al Paso 4.

## Paso 4 — La corrección (una sola)

Un solo `fixer-review`, con **todos** los hallazgos en un mismo prompt, uno por uno:

- para cada hallazgo: archivo, comportamiento esperado, qué falló, severidad y los pasos de reproducción del auditor visual;
- `hd-debug` **obligatorio**: causa raíz primero, un cambio por hipótesis;
- guarda de alcance: un hallazgo, un cambio; si el hallazgo revela un problema más grande, se anota y se reporta, no se expande;
- **no ejecuta scripts** (build, lint, tests, servidores): la reproducción la aporta el auditor visual y el gate lo corre el orquestador;
- **no commitea**; reporta en `.hd/<trabajo>/reports/fixer-review.md` del repo principal.

El orquestador:

1. Trabaja en un worktree desde el HEAD de la rama (`.git/hd-wt/<trabajo>/review-fix`).
2. Revisa el diff: que cada hallazgo tenga su cambio y ninguno de más.
3. Consolida (`cherry-pick -n`), commitea `hd(<trabajo>): corrección de revisión` y respalda.
4. Corre **build + lint + estándares** en la rama. Si quedan rojos, **freno real**; no hay segunda corrección.
5. Anota en el ledger y en `review-progress.md` qué hallazgo se corrigió con qué commit.

## Paso 5 — Re-prueba visual

Con el gate verde, lanzá **el mismo auditor visual** a probar **la feature completa de nuevo**, no solo los fallos:

- mismos flujos, mismos controles, mismos estados y bordes que la primera pasada;
- además, los casos que fallaron, con los pasos originales;
- reporte nuevo en `.hd/<trabajo>/reports/auditoria-visual-reprueba.md`.

- **OK**: todo verde. Anotá el veredicto en `review-progress.md` y pasá al cierre.
- **CON_FALLOS**: **freno real**. Reportá al humano con diagnóstico: qué falló, qué se intentó y por qué no alcanzó. No hay segunda corrección ni segunda re-prueba automática.

## Paso 6 — Cierre y encadenado

Con revisores sin hallazgos abiertos y re-prueba visual OK:

1. Actualizá `review-progress.md`: bloque por ola, bloque de auditoría visual, corrección y re-prueba, veredicto global.
2. Actualizá el ledger: `Revisión: <N> revisores, <n> hallazgos, corregidos <sha>`, `Auditoría visual: OK (<fecha>)`, `Gate: build <r>, lint <r>, estándares <r>`.
3. **Cargá la skill `hd-close` VOS MISMO** y ejecutá la fase 5. No esperes aprobación humana: la aprobación de producto ocurrió en discovery y el comportamiento lo validó el auditor visual.

## Lo que no se hace en esta fase

- No se le pide al humano que pruebe (el auditor visual lo reemplaza).
- No se invoca `hd-fast-implement` desde acá: la vía rápida es solo para pedidos directos del humano.
- No se re-audita todo después de la corrección: la re-prueba visual y el gate son la confirmación.
- No se squashéan los commits: el historial por ola se conserva.
- No se descarta un hallazgo en silencio: si es falso positivo, se marca con razón en el ledger.

## Racionalizaciones comunes (y su realidad)

| Excusa | Realidad |
|---|---|
| "El gate ya pasó en cada ola, no hace falta correrlo" | La revisión corrige código: el gate de la rama es evidencia nueva y obligatoria. |
| "Con un revisor alcanza" | Cada ola tiene su revisor; hasta cuatro en paralelo. Una sola lectura deja huecos. |
| "El auditor visual es caro, lo salteo" | Sin tests, es la única prueba de comportamiento. Sin él, la confianza es fe. |
| "El auditor probó la API y respondió 200" | Una feature no es un endpoint: es login, navegación, clicks, estados y persistencia. |
| "El fixer ya arregló, no hace falta re-probar" | El fixer no ejecuta nada. La re-prueba completa es la única evidencia de que la feature quedó entera. |
| "Re-pruebo solo lo que falló" | Un cambio puede romper otra parte del flujo. Se re-prueba la feature completa. |
| "Una ronda más y converge" | No hay ronda 2: si no converge, el diagnóstico está mal o el problema es estructural. Se reporta. |
| "El auditor visual puede tocar el código un poquito" | No: si toca el producto, deja de ser auditor. |
| "Los revisores pueden corregir lo que encuentran" | No: el que revisa no corrige. El fixer es otro y va después. |
| "Casi conforme con el spec" | Casi = residual. Se reporta con diagnóstico; no hay ronda 2. |
| "El humano igual va a querer probar" | El humano recibe el trabajo cerrado y un resumen; si quiere probar, prueba, pero no es una puerta del proceso. |
| "Auditar con el modelo default alcanza" | Sin tests, la auditoría es la única lectura del trabajo: va con el mejor modelo disponible y permitido. El premium sin permiso no se usa; se anota el ruling. |
