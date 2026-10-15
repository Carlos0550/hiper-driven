---
name: hd-implement
description: Fase 2 (continuación) del framework Hiper-driven (HD). Usar después de hd-spec, con spec y planes aprobados. El orquestador ejecuta los planes ola por ola lanzando implementadores (cada uno en su propio worktree en mega cambio) que escriben tests primero e implementan pero NUNCA ejecutan nada ni commitean; el orquestador corre los tests en serie como única evidencia válida, registra todo en el ledger y frena entre olas.
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

Al arrancar, creá `.hd/<nombre-del-trabajo>/ledger.md` con primera línea `# HD ledger — trabajo: <nombre>`, y registrá ahí, a medida que pasa:

- `Plan NN: completo (ola N — evidencia: <comando> → <resultado>)`
- `Plan NN: corrección, ronda R/5 (<hallazgos resueltos/pendientes>)`
- `Ruling: <qué decidiste> — <por qué> — <qué cuesta si te equivocaste>`

El ledger sobrevive a la compactación de contexto; tu memoria no. **Después de una compactación, creéle al ledger y a git, no a tu recuerdo** — re-lanzar trabajo ya hecho es el fallo más caro de este proceso.

## Modo mega cambio — Ciclo de una ola

1. **Planificá la ola con los footprints de los planes** (Archivos / Interfaces / Depende de): comparten ola solo si sus archivos son disjuntos, nadie produce lo que otro consume, no comparten estado mutable, ninguno depende del otro, y ninguno tiene tests que toquen una base compartida. Ante la duda, serializá.
2. **Un worktree por plan**, nombre con número de ola (`ola1-<plan>`). Nada de trabajo directo en la rama.
3. **Lanzá todos los implementadores de la ola en UN solo mensaje** (paralelo real). Higiene de contexto: cada dispatch lleva SOLO su tarea, las interfaces que consume, las constraints globales, y **rutas a archivos** (spec, plan, reporte) — jamás historia de la sesión pegada en el prompt.
4. Cuando reportan, **informá claramente que la ola terminó** y sus entregables.
5. **Gate de la ola (solo vos):** corré **únicamente los tests unitarios escritos para esa ola**, **en serie, worktree por worktree** (evita choques de puertos, fixtures y bases). Nunca la suite entera. Anexá comando + salida al ledger: esa es LA evidencia.
   - Verde y sin sorpresas → siguiente ola.
   - **Si una ola falla, NO se lanza la siguiente.** Reanudá al implementador con la salida exacta del fallo (nunca edites vos el código); el orquestador que arregla código saltándose la revisión contamina su contexto y su criterio.
6. **Ola 0 va SOLA** y sus contratos se revisan antes de lanzar la Ola 1. **Ola de datos: última, sola, nunca en paralelo**; sin respaldo confirmado + prueba en seco revisada, no arranca.

## Modo cambio chico

Un solo implementador (subagente, o el propio modelo de turno si es muy acotado) **directo en la rama** — sin worktree. Mismo contrato: tests primero, no ejecuta nada, no commitea; el orquestador corre los tests como evidencia.

## Salida

Todas las olas verdes con evidencia en el ledger → informá y hacé handoff: **siguiente fase: `hd-review`**. Los cambios viven sin commitear en los worktrees (mega) o en la rama (chico); eso es lo que hd-review audita y mergea.

## Racionalizaciones comunes (y su realidad)

| Excusa | Realidad |
|--------|----------|
| "Lo arreglo yo, lanzar un agente es overhead" | Los fixes del orquestador contaminan tu contexto y se saltean la revisión. Reanudá al implementador. |
| "Un worktree para un cambio chico es mucho" | En mega cambio, cada implementador tiene su worktree. Sin excepciones. |
| "El implementador corre rapidito el test para chequearse" | El implementador no se chequea; vos lo chequeás. Tu corrida es la evidencia. |
| "El batch es más rápido si salteo el gate de una ola" | El gate es donde se compra barato el error. Ola que falla = ola que frena todo. |
| "El ledger es burocracia" | El ledger es lo que sobrevive a la compactación. Orquestadores sin ledger re-hicieron olas completas. |
| "Los tests pasan, mergeemos" | Tests verdes son necesarios, no suficientes: falta la revisión (hd-review). |
