<!--
  Template de waves.md — Framework Hiper-driven (HD)
  Lo escribe el orquestador al entrar al paquete, antes de la ola 1.
  Es su plan de ejecución: re-derivación, teams y olas.
  La propuesta del technical spec es una propuesta; este archivo es la
  fuente autoritativa. No cambia el alcance.

  MODELO DE EJECUCIÓN:
  - Las olas van SECUENCIALES: una ola no se lanza hasta que la anterior
    está cerrada (commit, gate verde, worktree borrado). Así el daño queda
    contenido en una ola y no se multiplica.
  - El paralelismo vive DENTRO de la ola: un team de 2 a 5 agentes en un
    mismo worktree, trabajando A LA VEZ como un equipo. Cada uno tiene una
    zona (archivos + regiones) y todos escriben sus decisiones en el tablero
    de la ola. El reparto se corta para que las piezas arranquen juntas: si
    hay agentes esperando, el corte está mal y se re-corta antes de despachar.
  - Los agentes del team NO ejecutan scripts ni commitean. El orquestador
    corre el gate y commitea.
  - Cada agente se despacha con el modelo del catálogo que corresponde a su
    tarea (research barato, implementación calidad/precio, auditoría el mejor);
    los premium (más de 5 USD/M) solo con permiso del humano en la memoria.
-->

# Waves: <trabajo>

- **Orquestador**: <quién conduce>
- **Paquete**: .hd/<trabajo>/
- **Memoria**: .hd/memory.md
- **Modo**: directo | cambio chico | mega cambio
- **Rama**: <rama> (base: <sha>)
- **Fecha**: <fecha>
- **Estado**: en curso | cerrado

## Re-derivación

<!-- Qué verificó el orquestador por su cuenta, antes de ejecutar. -->

- **Leí**: technical_spec.md, spec.md, plans/, prototype/, ledger.md, review-progress.md, .hd/memory.md
- **Verifiqué en el código**: <entry points, contratos, datos, comandos, consumidores, convenciones>
- **Coincide**: <...>
- **No coincide**: <...> → <ruling / enmienda / freno real>
- **Footprints**: <ok | ajustes>
- **Baseline**: <sha> — <n> hallazgos (<firmas>)

## Estrategia de modelos

<!-- La estrategia aprobada en discovery vive en .hd/memory.md ([decidido]).
     Si el harness no expone list_subagent_models, default y ruling.
     El catálogo no publica precios: se buscan en internet (páginas oficiales).
     Premium (más de 5 USD/M en cualquier precio publicado): solo con permiso;
     sin ruling previo, una única pregunta al humano (excepción de la fase 3). -->

- **Catálogo consultado**: sí | no (default, ruling)
- **Research**: <modelo>
- **Implementación / fixers**: <modelo>
- **Auditoría (fase 4)**: <modelo>
- **Premium aprobados**: <modelo, tareas, fecha> | ninguno
- **Pregunta única premium**: <fecha, respuesta> | no hizo falta

## Matriz de teams por ola

<!-- Cada ola es un worktree y un team que trabaja en paralelo. Zonas
     precisas: qué crea, qué modifica y en qué región, qué comparte.
     Dos agentes pueden compartir archivo si son dueños de regiones distintas. -->

| Ola | Agente | Crea | Modifica (archivo:región) | Compartido (dueño / consume) | Modelo | Produce | Consume | Depende de | Datos | Lockfile / build |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | dev-<zona> | ... | ... | ... | <provider/model> | ... | ... | — | no | no |
| 1 | dev-<zona> | ... | ... | ... | <provider/model> | ... | ... | — | no | no |

<!-- Diagnóstico del corte: ¿cuántas piezas arrancan sin esperar a nadie?
     Si son menos de dos, no es un team: re-cortá. -->

**Arrancan juntas**: <n> de <total> — <nota si hubo que re-cortar>

## Olas

| Ola | Team | Depende de | Worktree | Base | Estado | Commit | Gate | Tablero |
|---|---|---|---|---|---|---|---|---|
| 0 | <team> | — | ola-0 | <sha> | pendiente | — | — | — |
| 1 | <team> | — | ola-1 | <sha> | pendiente | — | — | — |

## Tablero de la ola

<!-- Obligatorio por ola. El orquestador lo crea en la raíz del worktree antes
     de despachar y lo copia al cerrar. Formato de cada entrada, una línea:

     HH:mm | <agente> | <archivo:región> | <qué hice o decidí> | <por qué> | <impacto en el resto>

     El tablero no se commitea en el worktree: se copia a
     reports/ola-<N>-tablero.md y se borra antes del commit de transporte.

     Al cerrar la ola, resumí acá: agentes LISTO, agentes TRABADO y por qué,
     correcciones cruzadas y conflictos resueltos. -->

- **Ola 0**: .git/hd-wt/<trabajo>/ola-0/.hd-ola-0.board.md → reports/ola-0-tablero.md
- **Ola 1**: .git/hd-wt/<trabajo>/ola-1/.hd-ola-1.board.md → reports/ola-1-tablero.md

## Ola 0 — contratos

<!-- Solo si hay contratos nuevos que otras olas consumen. Va sola (sin team),
     con un agente o team mínimo, y se cierra antes de la Ola 1: commit + gate.
     La Ola 1 se despacha enseguida; no hay pausa ni revisión humana.
     Si no hay, "No aplica". -->

- **Aplica**: sí | no
- **Plan(es)**: <...>
- **Contratos**: <...>
- **Gate**: <resultado>

## Ola de datos

<!-- Solo si el trabajo mueve datos existentes. Última, sola, nunca en
     paralelo. Antes: confirmación de producción del humano, respaldo y
     prueba en seco. -->

- **Aplica**: sí | no
- **Plan(es)**: <...>
- **Confirmación del humano**: <fecha>
- **Respaldo**: <...>
- **Prueba en seco**: <...>
- **Migración escrita por**: subagente implementador
- **Migración aplicada por**: orquestador
- **Resultado**: <...>

## Enmiendas y rulings

<!-- Ruling: decisión técnica del orquestador, en nombre del humano.
     Enmienda: cambio de alcance aprobado por el humano, con fecha e impacto. -->

- **Ruling**: <qué> — <por qué> — <qué cuesta si te equivocaste>
- **Enmienda**: <fecha> — <qué> — <aprobación del humano> — <impacto>

## Estado final

<!-- Cuando todas las olas están cerradas:
     - Olas: <N> cerradas
     - Teams: <N agentes en total>, <n> tableros archivados en reports/
     - Paralelismo: <n> piezas arrancaron juntas por ola; <n> TRABADO por espera>
     - Commits: <shas>
     - Gate final: <resultado>
     - Worktrees: 0
     - Respaldo: <...>
     - Listo para hd-review -->
