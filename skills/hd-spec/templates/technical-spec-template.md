<!--
  Template de technical spec — Framework Hiper-driven (HD)
  Lo escribe el orquestador para la implementación.
  Es la entrada de la fase 3: la implementación no tiene el chat de discovery.
  REGLA DURA: sin lógica ni implementaciones. Contratos (firmas, tipos,
  constantes, formatos): sí. Código: nunca.
  NO HAY TESTS: la verificación es build + lint + estándares + revisión.
-->

# Technical spec: <nombre-del-trabajo>

- **Para**: la implementación (orquestador y teams de subagentes)
- **De**: el orquestador
- **Paquete**: .hd/<trabajo>/
- **Spec**: .hd/<trabajo>/spec.md
- **Planes**: .hd/<trabajo>/plans/
- **Prototipo**: .hd/<trabajo>/prototype/ | no aplica
- **Memoria**: .hd/memory.md
- **Modo**: directo | cambio chico | mega cambio
- **Fecha**: <fecha>

## Misión

<!-- Dos o tres frases: qué tiene que lograr este trabajo y por qué.
     La implementación tiene que poder repetirlo sin leer el resto. -->

## Mapa del paquete

<!-- Qué es cada archivo y en qué orden leerlo. -->

| Archivo | Qué contiene | Cuándo leerlo |
|---|---|---|
| technical_spec.md | este brief | primero |
| spec.md | contrato con el humano | segundo |
| plans/ | unidades de ejecución | después |
| prototype/ | referencia visual | si hay UI |
| discovery/ | notas y research | para dudas de contexto |
| .hd/memory.md | hechos verificados y decisiones del humano | antes de preguntar cualquier cosa |

## Contexto y arquitectura

<!-- El mapa de impacto verificado. Rutas, no relatos.
     - Entry points y flujo actual.
     - Contratos, interfaces, eventos, permisos.
     - Consumidores y qué se rompe si cambia.
     - Modelo de datos, migraciones, volúmenes.
     - Convenciones y comandos de verificación.
     - Deuda, riesgos y trampas. -->

## Qué hay que construir

<!-- Por área o por pieza, en prosa. Qué comportamiento nuevo existe,
     qué se modifica, qué se elimina. Sin lógica. -->

## Contratos (Ola 0)

<!-- Solo si hay contratos nuevos que otras olas consumen.
     Firmas exactas, nombres de tipos, constantes, valores literales y
     formatos. Nada de implementación.
     Si no hay, "No aplica". -->

## Mapa de planes, olas y teams (propuesta)

<!-- La propuesta del orquestador. Se puede re-olear y rearmar teams,
     nunca cambiar el alcance. La fuente autoritativa es waves.md, que se
     escribe en la fase 3. Las olas van secuenciales; el paralelismo vive
     dentro de la ola, en el team (máximo 5 agentes en un worktree). -->

| Plan | Ola propuesta | Team (agente → pieza) | Objetivo | Depende de | Archivos |
|---|---|---|---|---|---|
| plan-01-... | 1 | dev-<zona> | ... | — | ... |

## Resultado esperado

<!-- Qué va a poder hacer el humano, qué cambia en el sistema y qué NO
     cambia. En lenguaje verificable. -->

## Prototipo

<!-- Ruta, cómo abrirlo, qué cubre (flujos, estados, validaciones) y qué
     queda afuera. Si no hay UI: "No aplica (<motivo>)". -->

## Verificación

- **Build**: <comando> | no aplica
- **Lint**: <comando> | no aplica
- **Estándares**: <comando> | no aplica
- **Baseline**: pendiente (se corre antes de la ola 1)
- **Tests existentes**: <dónde están; no se tocan>
- **Chequeos manuales**: <qué prueba el auditor visual al final>

## Restricciones y convenciones

<!-- Stack, capas, nombres, estructura, manejo de errores, logging,
     seguridad, performance, compatibilidad, accesibilidad, i18n. -->

## Trampas conocidas

<!-- Lo que el research encontró y puede morder: acoplamientos, deuda,
     comportamientos raros, dependencias frágiles. -->

## Fuera de alcance

<!-- Explícito, para que la implementación no lo absorba. -->

## Definición de terminado

- Build + lint + estándares limpios en la rama, con evidencia fresca del orquestador.
- Cada ola consolidada, commiteada y con gate verde.
- Revisores independientes por ola sin hallazgos abiertos.
- Auditor visual probó la feature completa de punta a punta, y la re-probó después de la corrección.
- Sin tests: no se escriben, no se piden, no se aceptan.

## Preguntas abiertas

<!-- No debería haber. Se resuelven con la memoria, con el código o con
     un ruling en el ledger. Solo un cambio de alcance vuelve al humano. -->

## Riesgos y mitigaciones

<!-- Los del spec, con el detalle técnico que la implementación necesita. -->
