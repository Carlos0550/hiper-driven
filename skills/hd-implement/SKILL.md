---
name: hd-implement
description: Fase 2 (continuación) del framework Hiper-driven (HD). Usar después de hd-spec, con spec y planes aprobados. El orquestador ejecuta los planes ola por ola lanzando implementadores (cada uno en su propio worktree en mega cambio) que escriben tests primero e implementan pero NUNCA ejecutan nada ni commitean; el orquestador corre los tests en serie como única evidencia válida, registra todo en el ledger, commitea cada plan consolidado como checkpoint propio —siempre, aunque después haya correcciones— (los implementadores nunca commitean) y frena entre olas. Al terminar todas las olas, carga automáticamente hd-review sin esperar invocación manual.
---

# HD — Implementación (olas, implementadores y TDD)

Entrada: `spec.md` + planes aprobados. Vos (el modelo de turno) sos el **orquestador**: no implementás planes de un mega cambio con tus propias manos; coordinás implementadores y sos dueño de TODA la verificación.

## Ley de hierro de la evidencia

```
NINGUNA AFIRMACIÓN DE ÉXITO SIN EVIDENCIA FRESCA EN ESTE TURNO.
```

- "Los tests pasan" exige la salida del comando de tests que VOS corriste recién, con el resultado a la vista.
- Prohibido "debería pasar", "seguro funciona", "pasaron antes en la sesión". Una corrida verde solo prueba el árbol donde corrió, en el momento en que corrió.
- La salida del implementador ("está listo") no es evidencia. La evidencia es tu corrida.

## Contrato del implementador (subagente)

1. **Escribe los tests unitarios PRIMERO** — en ese orden en su trabajo — y deben tener criterio: reflejan el comportamiento deseado del plan y **llaman al código real** (que aún no existe o falla). Prohibido escribirlos después: eso es testear el happy path.
2. Implementa según **su plan + el spec** (+ contratos de Ola 0). Nada de rediseñar, "mejorar" cosas fuera del plan, ni tocar archivos fuera de su alcance.
3. **NO ejecuta NADA.** Ni tests, ni builds, ni migraciones, ni scripts, ni servidores. La verificación es del orquestador — por eso un implementador **nunca necesita `.env`, bases de datos ni servicios** (los worktrees no copian archivos untracked, y eso está bien).
4. **NO commitea. Nunca.**
5. Reporta por **archivo de reporte**, no en el aire: estado (LISTO / LISTO_CON_DUDAS / NECESITA_CONTEXTO / TRABADO), archivos tocados, y qué tests escribió para qué comportamiento.

## El ledger (memoria que sobrevive a la compactación)

Al arrancar, creá `.hd/<nombre-del-trabajo>/ledger.md` con primera línea `# HD ledger — trabajo: <nombre>` y el **commit base** anotado en el spec (`Base: <sha>` — es el punto desde el que se acumulan los commits del trabajo, uno por plan), y registrá ahí, a medida que pasa:

- `Plan NN: completo (ola N — evidencia: <comando> → <resultado>)`
- `Plan NN: corrección, ronda R/5 (<hallazgos resueltos/pendientes>)`
- `Plan NN: commit <sha> (ola N — <qué entró>)`
- `Ola N: verde (<N> planes, <N> commits, HEAD <sha>)`
- `Ruling: <qué decidiste> — <por qué> — <qué cuesta si te equivocaste>`

El ledger sobrevive a la compactación de contexto; tu memoria no. **Después de una compactación, creéle al ledger y a git, no a tu recuerdo** — re-lanzar trabajo ya hecho es el fallo más caro de este proceso.

## Modo mega cambio — Ciclo de una ola

1. **La ola corre en paralelo por default**: todos los planes de la ola se lanzan **en el mismo mensaje** (paralelo real). Solo la Ola 0 y la ola de datos van solas, y es por diseño. Si la ola quedó con un solo plan, no la ejecutes "en serie" como si fuera normal: avisá y re-planificá (hd-spec).
2. **Planificá la ola con los footprints de los planes** (Archivos / Interfaces / Depende de): comparten ola solo si sus archivos son disjuntos, nadie produce lo que otro consume, no comparten estado mutable, ninguno depende del otro, y ninguno tiene tests que toquen una base compartida. Ante la duda, serializá **esa pareja** (a otra ola), no la ola entera.
3. **Un worktree por plan**, creado **desde la rama principal de trabajo ya consolidada** (que incluye los commits de los planes anteriores — la ola N+1 necesita ver el trabajo de la ola N), con nombre que empieza por el número de ola (`ola1-<plan>`). Nada de trabajo directo en la rama por parte de implementadores.
4. **Lanzá todos los implementadores de la ola en UN solo mensaje** (paralelo real). Higiene de contexto: cada dispatch lleva SOLO su tarea, las interfaces que consume, las constraints globales, y **rutas a archivos** (spec, plan, reporte) — jamás historia de la sesión pegada en el prompt.
5. Cuando reportan, **informá claramente que la ola terminó** y sus entregables.
6. **Gate por plan (solo vos):** corré **únicamente los tests unitarios escritos para ese plan**, **en su worktree**, **en serie, plan por plan** (evita choques de puertos, fixtures y bases). Nunca la suite entera. Anexá comando + salida al ledger: esa es LA evidencia.
   - **Si un plan falla, NO se avanza a la ola siguiente.** Reanudá al implementador con la salida exacta del fallo (nunca edites vos el código); el orquestador que arregla código contamina su contexto y su criterio.
7. **Consolidación POR PLAN (obligatoria, en este orden, por cada plan de la ola, uno por uno):**
   a. **Guardá el parche del worktree** en `.hd/<nombre-del-trabajo>/waves/ola<N>-<plan>.patch` — es la evidencia que audita hd-review (los worktrees se borran; los parches quedan).
   b. **Traé los cambios a la rama principal de trabajo**: aplicá el parche, resolviendo conflictos. Todo entra **sin stage**: el commit del plan es el paso e.
   c. **Si el plan incluye migraciones, aplicalas vos** (el orquestador). Un implementador jamás corre migraciones. En la ola de datos: respaldo confirmado + prueba en seco ANTES de aplicar nada.
   d. **Corré los tests de ese plan sobre la rama** (ya con lo commiteado de los planes anteriores): así detectás los choques entre planes de la misma ola que los worktrees aislados no ven.
   e. **Commité EL PLAN (checkpoint) — SIEMPRE**: `git add -A` + commit con mensaje derivado del spec (`hd(<trabajo>): plan NN — <qué entró>`), respetando las convenciones del repo. Lo hace el **orquestador** — el contrato del implementador no cambia. **Se commitea aunque los tests estén rojos o el plan haya quedado con correcciones pendientes**: el commit certifica "este plan ya está en la rama y es trazable", NO "este plan está aprobado". Así cada plan queda trackeable por un commit, en lugar de un volcado único donde no se sabe qué tocó cada cosa. (El `git add -A` se lleva también los artefactos de `.hd/<trabajo>/` (spec, ledger, planes, parches): son el registro auditable y van al repo por defecto — solo quedan fuera si el humano lo pidió explícitamente o si git los ignora (no los fuerces con `git add -f`).)
   f. **Borrá el worktree de ese plan** (`git worktree remove` + `git worktree prune`), ya con su commit hecho. Ningún worktree sobrevive a su plan.
   g. Ledger: `Plan NN: commit <sha> (ola N — parche aplicado, migraciones: sí | no, tests en rama: verde | rojo, <qué entró>)`.
8. **Cierre de ola:** con todos los planes de la ola ya commiteados, re-corré **los tests de TODA la ola sobre la rama** (integración de la ola). Si fallan, es porque dos planes de la misma ola se pisan: se corrige (con `hd-debug` si es bug) y la corrección se commitea **por encima** (`hd(<trabajo>): plan NN — corrección de integración`), sin aplanar los commits ya hechos. Con la ola verde: ledger `Ola N: verde (<N> planes, <N> commits, HEAD <sha>)`.

   La rama puede quedar roja entre commit y commit: es lo esperable (el commit marca *estado*, no *aprobación*). Lo que sigue prohibido es afirmar que algo está verde sin correr los tests en ese turno.
9. **Ola 0 va SOLA** y sus contratos se revisan antes de lanzar la Ola 1. **Ola de datos: última, sola, nunca en paralelo**; sin respaldo confirmado + prueba en seco revisada, no arranca.


## Modo cambio chico

Un solo implementador (subagente, o el propio modelo de turno si es muy acotado) **directo en la rama** — sin worktree. Mismo contrato: tests primero, no ejecuta nada, no commitea; el orquestador corre los tests como evidencia y, con todo verde, commitea el **checkpoint único** del cambio chico (misma regla: commitea el orquestador; ese commit queda en la rama y hd-review lo audita como cualquier otro).

## Salida

Todas las olas verdes con evidencia en el ledger → **cargá la skill `hd-review` VOS MISMO y arrancá la fase 3 en el mismo flujo** — acá NO hay gate humano, la revisión arranca en cuanto termina la última ola. En mega cambio, los cambios de TODAS las olas ya están consolidados en la rama **como un commit por plan** (más los commits de corrección que hayan hecho falta), los worktrees ya fueron borrados, y los parches de cada plan quedaron en `.hd/<nombre-del-trabajo>/waves/` — eso es lo que hd-review audita. En cambio chico, el trabajo está en la rama con su commit único de checkpoint.

## Racionalizaciones comunes (y su realidad)

| Excusa | Realidad |
|--------|----------|
| "Lo arreglo yo, lanzar un agente es overhead" | Los fixes del orquestador contaminan tu contexto y se saltean la revisión. Reanudá al implementador. |
| "Un worktree para un cambio chico es mucho" | En mega cambio, cada implementador tiene su worktree. Sin excepciones. |
| "El implementador corre rapidito el test para chequearse" | El implementador no se chequea; vos lo chequeás. Tu corrida es la evidencia. |
| "El batch es más rápido si salteo el gate de una ola" | El gate es donde se compra barato el error. Ola que falla = ola que frena todo. |
| "El ledger es burocracia" | El ledger es lo que sobrevive a la compactación. Orquestadores sin ledger re-hicieron olas completas. |
| "Los tests pasan, mergeemos" | Tests verdes son necesarios, no suficientes: falta la revisión (hd-review). |
| "El worktree de la ola siguiente sale igual sin commitear" | Un worktree se crea desde el **commit** de la rama, no desde tu árbol de trabajo: sin el commit del plan, el implementador de la ola N+1 no ve nada de lo ya hecho. |
| "Commiteé la ola, ya está listo" | El commit por plan certifica que el plan está en la rama, no que esté aprobado: la aprobación es del humano, en el gate de la fase 4. |
| "Mejor un commit por ola que un commit por plan" | Un commit por plan deja claro qué tocó cada uno, y es lo que el humano audita commit por commit (hd-audit). El commit por ola borra esa traza. |
| "Esta ola tiene un solo plan, la hago yo" | Una ola de un plan sin dependencia dura es una partición mal hecha: re-planificá para correr 2 o más en paralelo. Si es la Ola 0 o la de datos, entonces va sola y listo. |
