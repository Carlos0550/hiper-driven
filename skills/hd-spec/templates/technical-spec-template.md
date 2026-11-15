<!--
  Template de technical spec — Framework Hiper-driven (HD)
  Lo escribe el agente principal para la implementación.
  Es la entrada de la fase 3: la implementación no tiene el chat de discovery.
  REGLA DURA: sin lógica ni implementaciones. Contratos (firmas, tipos,
  constantes, formatos): sí. Código: nunca.
  NO HAY TESTS: la verificación es build + lint + estándares + revisión.
-->

# Technical spec: <nombre-del-trabajo>

- **Para**: la implementación (agente principal y subagentes)
- **De**: el agente principal
- **Paquete**: .hd/<trabajo>/
- **Spec**: .hd/<trabajo>/spec.md
- **Planes**: .hd/<trabajo>/plans/
- **Prototipo**: .hd/<trabajo>/prototype/ | no aplica
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
| spec.md | contrato con el cliente | segundo |
| plans/ | unidades de ejecución | después |
| prototype/ | referencia visual | si hay UI |
| discovery/ | notas y research | para dudas de contexto |

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

## Mapa de planes y olas (propuesta)

<!-- La propuesta del agente principal. Se puede re-olear, nunca cambiar
     el alcance. La fuente autoritativa de las olas es waves.md, que se
     escribe en la fase 3. -->

| Plan | Ola propuesta | Objetivo | Depende de | Archivos | Especialidad sugerida |
|---|---|---|---|---|---|
| plan-01-... | 1 | ... | — | ... | backend |

## Resultado esperado

<!-- Qué va a poder hacer el cliente, qué cambia en el sistema y qué NO
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
- **Chequeos manuales**: <qué mira el cliente al final>

## Restricciones y convenciones

<!-- Stack, capas, nombres, estructura, manejo de errores, logging,
     seguridad, performance, compatibilidad, accesibilidad, i18n. -->

## Trampas conocidas

<!-- Lo que el research encontró y puede morder: acoplamientos, deuda,
     comportamientos raros, dependencias frágiles. -->

## Fuera de alcance

<!-- Explícito, para que la implementación no lo absorba. -->

## Definición de terminado

- Build + lint + estándares limpios en la rama, con evidencia fresca.
- Cada ola consolidada, commiteada, con gate verde y revisión independiente.
- Auditoría de cierre aprobada.
- Cliente probó el comportamiento contra los criterios de aceptación.
- Sin tests: no se escriben, no se piden, no se aceptan.

## Preguntas abiertas

<!-- No debería haber. Si hay, el paquete no está listo: volvé a la
     etapa 2 de discovery. -->

## Riesgos y mitigaciones

<!-- Los del spec, con el detalle técnico que la implementación necesita. -->
