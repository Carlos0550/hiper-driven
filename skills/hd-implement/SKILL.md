---
name: hd-implement
description: Fase 2 (continuación) del framework Hiper-driven (HD). Usar desde el prompt de implementación de un spec aprobado. El orquestador ejecuta los planes ola por ola; en Flujo B lanza por plan un implementador (solo código) y un autor de tests independiente (tests desde el plan, en el commit padre del plan, sin ver la implementación); en Flujo A (legacy) el implementador escribe tests primero. Ningún agente ejecuta nada ni commitea. El orquestador consolida cada ola, corre sus tests una vez, hace una sola corrección si hace falta, commitea la ola y la respalda en la rama de respaldo. Al terminar todas las olas carga hd-review automáticamente.
---

# HD — Implementación (olas, implementadores, autor de tests y evidencia)

Entrada: `spec.md` + `spec-prompt.md` + planes aprobados. Vos (el modelo de turno) sos el **orquestador**: no implementás ni escribís tests con tus propias manos; coordinás agentes y sos dueño de TODA la verificación. Si el prompt no existe, generá uno mínimo desde el spec antes de arrancar y anotalo; no improvises el alcance.

> **La unidad es la OLA, no el plan.** Se consolidan, se commitean y se revisan olas. Un plan no tiene commit propio ni gate propio. Eso mantiene el volumen de operaciones proporcional a las olas, no a la cantidad de planes.

> **Flujo B (default).** El implementador escribe **solo código**; un **autor de tests distinto** escribe los tests desde el contrato de comportamiento del plan, en el commit **padre** del plan, sin ver la implementación. Corren en paralelo. **Flujo A** es solo para specs viejos o en vuelo: el implementador escribe tests primero.

Si el spec trae muchos planes, agrupalos en **olas**; no lo partas en specs. Un spec es uno.

## Qué se le habla al humano (y qué no)

**Durante la ejecución no le escribís al humano.** Tus agentes son colegas de trabajo, no su audiencia: lo que encuentran va al ledger, no al chat.

- Cada hallazgo, build roto, test que falla o "esto no era así": **al ledger**. Nada de informes por plan, por ola ni por worktree.
- **El humano se entera en dos momentos, y solo en esos dos:**
  1. **Freno real**: algo que te obliga a **parar todo el trabajo y esperar su decisión** (build o tests que no se arreglan en una corrección, error de contrato, baseline imposible de correr, datos en riesgo, spec sin aprobar). Ahí sí, y con detalle: qué pasó, qué falla, dónde y qué recomendás hacer.
  2. **Cierre**: el resumen final, con la sección de desviaciones que requieren su decisión.
- Todo lo demás se resuelve entre vos y tus agentes, y queda escrito. Un problema que no frena el trabajo **no se consulta**: se anota y se reporta al cierre.

## Ley de hierro de la evidencia

```
NINGUNA AFIRMACIÓN DE ÉXITO SIN EVIDENCIA FRESCA EN ESTE TURNO.
```

- "Los tests pasan" exige la salida del comando de tests que VOS corriste recién, con el resultado a la vista.
- Prohibido "debería pasar", "seguro funciona", "pasaron antes en la sesión". Una corrida verde solo prueba el árbol donde corrió, en el momento en que corrió.
- La salida del implementador o del autor de tests ("está listo") no es evidencia. La evidencia es tu corrida.

## Push de seguridad (respaldo en rama aparte)

Los commits por ola viven en la rama de trabajo hasta el cierre: un corte de luz puede romperlos. Para blindarlos, **cada commit de ola se sube a una rama de respaldo**, no a la rama de trabajo:

> **Se pushea si y solo si** el spec dice `push de seguridad: habilitado` para ese repo **y** la rama actual no es la rama por defecto.

**Rama de respaldo:** `hd-backup/<trabajo>`. El push es `git push <remote> HEAD:refs/heads/hd-backup/<trabajo>`. Así la rama de trabajo queda libre para el colapso de review y el commit único de close; los commits por ola quedan recuperables en la rama de respaldo.

- **Es un respaldo, no una aprobación**: se sube el commit tal cual, aunque los tests de la ola estén rojos.
- **Nunca `--force`**: si el remoto está adelantado o divergido, el push se rechaza; anotá el fallo y seguí.
- **Un push fallido NO frena el trabajo**: credenciales, red, hook, remoto caído. Anotá `Push: FALLIDO (<motivo>)` y seguí.
- **Nunca a la rama de trabajo ni a `main`**: la rama de trabajo se pushea recién en el cierre, con autorización explícita.
- Si el repo no tiene remote o el spec dice `deshabilitado`: no hay push; anotá `push: no aplica`.

## Flujo del spec: B o A

- `Flujo: B` (default) → implementador sin tests + autor de tests. Es el flujo de los specs nuevos.
- `Flujo: A` (legacy) → el implementador escribe tests primero. Es solo para specs viejos o en vuelo, y lo dice el prompt.
- **No mezcles flujos en un mismo spec.** La Ola 0 y la ola de datos usan **A aunque el spec sea B**: los contratos y los datos irreversibles se escriben con tests primero.

## Contrato del implementador — Flujo B

1. **Escribe SOLO código de producción.** No crea ni modifica tests: los archivos de `Crea (tests)` son del autor de tests. Si toca uno, es una violación de contrato.
2. Implementa según **su plan + el spec + los contratos de Ola 0**. Nada de rediseñar, "mejorar" cosas fuera del plan, ni tocar archivos fuera de su alcance.
3. **NO ejecuta NADA.** Ni tests, ni builds, ni migraciones, ni scripts, ni servidores.
4. **NO commitea. Nunca.**
5. Reporta por **archivo de reporte** en `.hd/<trabajo>/reports/plan-NN.md`: estado (LISTO / LISTO_CON_DUDAS / NECESITA_CONTEXTO / TRABADO), archivos tocados y decisiones de implementación.

## Contrato del autor de tests — Flujo B

1. **Escribe SOLO los tests declarados en `Crea (tests)` del plan.** No toca código de producción.
2. **Fuente**: el plan (sobre todo `Contrato de comportamiento` e `Interfaces`), el spec, los contratos de Ola 0 y el código que existe en el **commit padre del plan**. **No lee la implementación del plan**: no está en su worktree, y no la busca en otro lado.
3. **NO ejecuta NADA.** Ni tests, ni builds, ni scripts. Los corre el orquestador.
4. **NO commitea. Nunca.**
5. **No inventa comportamiento**: si el plan no dice qué pasa en un caso borde, lo reporta como `NECESITA_CONTEXTO`; no lo deduce del código. Un test que inventa una regla es un falso positivo caro.
6. Reporta por **archivo de reporte** en `.hd/<trabajo>/reports/plan-NN-tests.md`: tests escritos, comportamientos cubiertos, casos que el plan no cubre y dudas.

## Contrato del implementador — Flujo A (legacy)

1. **Escribe los tests unitarios PRIMERO** — en ese orden en su trabajo — y deben tener criterio: reflejan el comportamiento deseado del plan y **llaman al código real**. Prohibido escribirlos después: eso es testear el happy path.
2. Implementa según **su plan + el spec** (+ contratos de Ola 0). Nada de rediseñar ni tocar archivos fuera de su alcance.
3. **NO ejecuta NADA.** Ni tests, ni builds, ni migraciones, ni scripts, ni servidores.
4. **NO commitea. Nunca.**
5. Reporta por **archivo de reporte** en `.hd/<trabajo>/reports/plan-NN.md`: estado, archivos tocados y qué tests escribió para qué comportamiento.

## El ledger (memoria que sobrevive a la compactación)

Al arrancar, creá `.hd/<nombre-del-trabajo>/ledger.md` con primera línea `# HD ledger — trabajo: <nombre>` y el **commit base** anotado en el spec (`Base: <sha>` — es el destino del colapso final de hd-review), la **rama de trabajo**, el **flujo** (`Flujo: A | B`), la **rama de respaldo** y los **fallos conocidos** del baseline. Registrá ahí, a medida que pasa:

- `Baseline: <sha> — <N> fallos conocidos (<firmas>)`
- `Plan NN: base de tests <sha> (padre del plan)`
- `Plan NN: tests autor (<archivos>, <comportamientos>)`
- `Plan NN: completo (ola N — evidencia: <comando> → <resultado>)`
- `Ola N: commit <sha> (parches aplicados, tests en rama: verde, corrección: sí | no)`
- `Ola N: corrección (<hallazgos resueltos>)`
- `Push: hd-backup/<trabajo> ← <sha> (ok | FALLIDO: <motivo> | no aplica)`
- `Ruling: <qué decidiste> — <por qué> — <qué cuesta si te equivocaste>`

El ledger sobrevive a la compactación de contexto; tu memoria no. **Después de una compactación, creéle al ledger y a git, no a tu recuerdo** — re-lanzar trabajo ya hecho es el fallo más caro de este proceso.

## Baseline (una vez, antes de la ola 1)

Con el **árbol limpio** y la rama en `Base`, corré la suite completa **una vez** y registrá los fallos conocidos (nombre + firma del error). No uses un worktree nuevo: no copia dependencias ni archivos untracked.

```
git status                 # limpio
git rev-parse HEAD         # == Base
# correr el comando de Suite del spec
```

- Si el baseline falla en los módulos que el spec va a tocar: **freno real** antes de implementar.
- Si falla una porción grande de la suite (más de ~20%): el baseline no sirve como oráculo; **freno real**.
- Los fallos del baseline se ignoran durante el trabajo, pero se arrastran: son los `Known failures`.
- **`Known failures: 0` solo es válido si la suite corrió entera.** Si no corrió, es `desconocido` y la suite no se puede declarar verde; se reporta.
- Si el repo no tiene suite, anotá `Suite: no aplica` y seguí.

## Modo mega cambio — Ciclo de una ola (Flujo B)

1. **Planificá la ola con los footprints de los planes** (Archivos / Interfaces / Depende de): comparten ola solo si sus archivos de **código** y de **tests** son disjuntos, nadie produce lo que otro consume, no comparten estado mutable, ninguno depende del otro, y ninguno tiene tests que toquen una base compartida. **Una ola puede tener un solo plan** si el trabajo lo pide; no inventes planes de relleno. Nada de re-partir a la fuerza.
2. **Dos worktrees por plan, desde el mismo commit base** (el HEAD de la rama en el momento del dispatch):
   - `ola<N>-<plan>` — implementador.
   - `ola<N>-<plan>-tests` — autor de tests, en el **commit padre del plan**. Ese SHA se anota en el ledger. El autor de tests no ve la implementación porque físicamente no está en su worktree.
3. **Lanzá los pares en UN solo mensaje**: por cada plan, un implementador y un autor de tests. El implementador recibe el plan + rutas de código; el autor de tests recibe el plan + `Crea (tests)` + interfaces + la ruta de su worktree. Nada de historia de la sesión en los prompts.
4. **Consolidación de la OLA (obligatoria, en este orden):**
   a. **Guardá los parches** de cada plan: `waves/ola<N>-<plan>.patch` (código) y `waves/ola<N>-<plan>-tests.patch` (tests).
   b. **Traé el código a la rama**: aplicá los parches de código de la ola. Si un conflicto no es trivial, la planificación de la ola estuvo mal (archivos no disjuntos): resolvé lo mínimo o frená y re-partí.
   c. **Traé los tests**: aplicá los parches de tests. Si un parche de tests toca código, es una violación del autor de tests: no lo apliques, corregí al agente **una sola vez** y repetí. Si un parche de código tocó un archivo de `Crea (tests)`, es una violación del implementador: igual. Si reincide, **freno real**.
   d. **Chequeo de build y colección en la rama**: corré build/typecheck y la colección de tests. Si el build falla: revertí los parches, relanzá al implementador **una sola vez** con el error exacto y repetí desde (b). Si la colección falla: relanzá al autor de tests **una sola vez**. Si el segundo intento tampoco compila, **freno real**.
   e. **Gate de la ola**: corré **solo los tests de esta ola** en la rama, una vez, en serie. Esa es LA evidencia. Los fallos que ya estaban en el baseline con la misma firma se ignoran.
      - **Si hay fallos nuevos**: triageá (test mal vs código mal, contra el `Contrato de comportamiento`), lanzá **UNA sola corrección** con todos los hallazgos, con `hd-debug` obligatorio, y re-corré la ola una vez. Si sigue rojo, **freno real**: no hay segunda corrección.
      - **Si la ola está verde**: seguí.
   f. **Si la ola incluye migraciones, aplicalas vos**. En la ola de datos: respaldo confirmado + prueba en seco ANTES de aplicar nada.
   g. **Commité la ola (checkpoint)**: `git add -A` + `hd(<trabajo>): ola N — <qué entró>` (código + tests + parches + ledger). Lo hace el orquestador. Se commitea con el gate verde; si el humano autorizó un residual, anotalo.
   h. **Subí el commit a la rama de respaldo** (`hd-backup/<trabajo>`) si el push de seguridad está habilitado. Si falla, anotá y seguí.
   i. **Borrá los dos worktrees** de cada plan (`git worktree remove` + `git worktree prune`). Ningún worktree sobrevive a su ola.
   j. Ledger: `Ola N: commit <sha> (...)` y `Push: ...`.
5. **Ola 0 va SOLA** y sus contratos se revisan antes de lanzar la Ola 1. **Ola de datos: última, sola, nunca en paralelo**; sin respaldo + prueba en seco, no arranca. **Las dos usan el contrato A** (tests primero) aunque el spec sea B.

## Ciclo de una ola (Flujo A, legacy)

Un worktree por plan (`ola<N>-<plan>`), el implementador escribe tests primero y código después. El gate de la ola corre los tests en serie worktree por worktree (como en b9d6cb5), con **una sola corrección** si falla; después se consolida la ola, se commitea y se respalda igual que en B. No hay autor de tests separado.

## Modo cambio chico

- **Flujo B**: mismo mecanismo que mega con un solo plan: dos worktrees (`cambio-<nombre>` y `cambio-<nombre>-tests`), parches, gate y commit único.
- **Flujo A**: un solo implementador, directo en la rama, tests primero.
- El orquestador corre el gate, hace una corrección si hace falta, commitea el checkpoint único, lo respalda en `hd-backup/<trabajo>` y sigue con `hd-review`.

## Salida

Todas las olas verdes con evidencia en el ledger → **cargá la skill `hd-review` VOS MISMO y arrancá la fase 3 en el mismo flujo** — acá NO hay gate humano. Los cambios están en la rama **como un commit por ola**, los worktrees borrados, los parches en `.hd/<trabajo>/waves/` y los commits respaldados en `hd-backup/<trabajo>`. Eso es lo que hd-review audita.

## Racionalizaciones comunes (y su realidad)

| Excusa | Realidad |
|--------|----------|
| "El implementador escribe los tests más rápido" | El que implementa fija el comportamiento que su código ya resuelve. El autor de tests trabaja desde el plan y no ve la implementación. |
| "El autor de tests puede mirar el código, total no lo copia" | Si lo mira, lo ratifica. La barrera es física: worktree en el commit padre del plan. |
| "Un agente más por plan es más caro" | Corre en paralelo con el implementador; el costo es un agente, no una vuelta del loop. |
| "El test del autor falla, seguro el código está mal" | Triage contra el plan: puede ser el test. |
| "Una ola de un plan es un defecto" | No: es válida si el trabajo lo pide. El defecto es forzar un plan de relleno. |
| "Hago un commit por plan para tener más traza" | La traza es el commit por ola y los parches por plan. El commit por plan multiplica operaciones sin agregar unidad de revisión. |
| "Corro los tests del plan en su worktree" | Los tests del autor no están en el worktree del implementador. El gate corre la ola en la rama, una vez. |
| "Una corrección más y converge" | Una sola corrección por ola. Si no alcanza, es freno real: el diagnóstico está mal o el problema es estructural. |
| "Lo arreglo yo, lanzar un agente es overhead" | Los fixes del orquestador contaminan tu contexto y se saltean la revisión. Reanudá al agente. |
| "El ledger es burocracia" | El ledger es lo que sobrevive a la compactación. |
| "El worktree de la ola siguiente sale igual sin commitear" | Un worktree se crea desde el **commit** de la rama, no desde tu árbol de trabajo. |
| "Pusheo la rama de trabajo para asegurarla" | El respaldo va a `hd-backup/<trabajo>`. La rama de trabajo se pushea en el cierre, con autorización. |
| "El push falló, freno el trabajo" | Un push fallido no frena el trabajo: es un respaldo. Anotá y seguí. |
| "La suite no corre en este entorno, sigo con los tests nuevos" | Sin baseline no sabés qué fallaba antes: el rojo no es atribuible y el verde no es evidencia. Es freno real. |
