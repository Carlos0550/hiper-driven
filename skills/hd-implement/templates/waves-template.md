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
    mismo worktree, con archivos disjuntos e interfaces congeladas.
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
     Premium (más de 5 USD/M en cualquier precio publicado): solo con permiso;
     sin ruling previo, una única pregunta al humano (excepción de la fase 3). -->

- **Catálogo consultado**: sí | no (default, ruling)
- **Research**: <modelo>
- **Implementación / fixers**: <modelo>
- **Auditoría (fase 4)**: <modelo>
- **Premium aprobados**: <modelo, tareas, fecha> | ninguno
- **Pregunta única premium**: <fecha, respuesta> | no hizo falta

## Matriz de teams por ola

<!-- Cada ola es un worktree y un team. Archivos disjuntos por contrato:
     si dos piezas necesitan el mismo archivo, no comparten ola. -->

| Ola | Agente | Pieza | Modelo | Archivos | Produce | Consume | Interfaz congelada | Datos | Lockfile / build |
|---|---|---|---|---|---|---|---|---|---|
| 1 | dev-<pieza> | ... | <provider/model> | ... | ... | ... | ... | no | no |
| 1 | dev-<pieza> | ... | <provider/model> | ... | ... | ... | ... | no | no |

## Olas

| Ola | Team | Depende de | Worktree | Base | Estado | Commit | Gate |
|---|---|---|---|---|---|---|---|
| 0 | <team> | — | ola-0 | <sha> | pendiente | — | — |
| 1 | <team> | — | ola-1 | <sha> | pendiente | — | — |

## Ola 0 — contratos

<!-- Solo si hay contratos nuevos que otras olas consumen. Va sola, con un
     team mínimo o un agente, y se cierra antes de la Ola 1.
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
     - Teams: <N agentes en total>
     - Commits: <shas>
     - Gate final: <resultado>
     - Worktrees: 0
     - Respaldo: <...>
     - Listo para hd-review -->
