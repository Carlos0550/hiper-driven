<!--
  Template de waves.md — Framework Hiper-driven (HD)
  Lo escribe el agente principal al entrar al paquete, antes de la ola 1.
  Es su plan de ejecución: re-derivación, matriz de paralelismo y olas.
  La propuesta de olas del technical spec es una propuesta; este archivo
  es la fuente autoritativa. No cambia el alcance.
-->

# Waves: <trabajo>

- **Agente principal**: <quién conduce>
- **Paquete**: .hd/<trabajo>/
- **Modo**: directo | cambio chico | mega cambio
- **Rama**: <rama> (base: <sha>)
- **Fecha**: <fecha>
- **Estado**: en curso | cerrado

## Re-derivación

<!-- Qué verificó el agente principal por su cuenta, antes de ejecutar. -->

- **Leí**: technical_spec.md, spec.md, plans/, prototype/, ledger.md, review-progress.md
- **Verifiqué en el código**: <entry points, contratos, datos, comandos, consumidores, convenciones>
- **Coincide**: <...>
- **No coincide**: <...> → <decisión / pregunta / enmienda>
- **Footprints**: <ok | ajustes>
- **Baseline**: <sha> — <n> hallazgos (<firmas>)

## Matriz de paralelismo

| Plan | Archivos | Produce | Consume | Depende | Datos | Lockfile / build |
|---|---|---|---|---|---|---|
| plan-01-... | ... | ... | ... | — | no | no |

## Olas

| Ola | Planes | Depende de | Subagentes | Worktrees | Por qué en paralelo | Estado | Commit | Gate | Review |
|---|---|---|---|---|---|---|---|---|---|
| 1 | plan-01 | — | dev-backend | ola1-plan01 | un solo plan | pendiente | — | — | — |

## Ola 0 — contratos

<!-- Solo si hay contratos nuevos que otras olas consumen. Va sola y se
     revisa antes de la Ola 1. Si no hay, "No aplica". -->

- **Aplica**: sí | no
- **Plan(es)**: <...>
- **Contratos**: <...>
- **Revisión**: <veredicto>

## Ola de datos

<!-- Solo si el trabajo mueve datos existentes. Última, sola, nunca en
     paralelo. Antes: confirmación de producción, respaldo y prueba en seco. -->

- **Aplica**: sí | no
- **Plan(es)**: <...>
- **Confirmación del cliente**: <fecha>
- **Respaldo**: <...>
- **Prueba en seco**: <...>
- **Migración escrita por**: subagente implementador
- **Migración aplicada por**: agente principal
- **Resultado**: <...>

## Enmiendas y rulings

<!-- Ruling: decisión técnica del agente principal. Enmienda: cambio de
     alcance aprobado por el cliente, con fecha e impacto. -->

- **Ruling**: <qué> — <por qué> — <qué cuesta si te equivocaste>
- **Enmienda**: <fecha> — <qué> — <aprobación del cliente> — <impacto>

## Estado final

<!-- Cuando todas las olas están cerradas:
     - Olas: <N> cerradas
     - Commits: <shas>
     - Gate final: <resultado>
     - Worktrees: 0
     - Respaldo: <...>
     - Listo para hd-review -->
