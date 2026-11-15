<!--
  Template de spec — Framework Hiper-driven (HD)
  Lo escribe el agente principal en hd-spec, después de la aprobación del cliente.
  REGLA DURA: no contiene snippets de código ni la implementación.
  Comportamiento esperado y contratos: sí. Lógica: nunca.
  NO HAY TESTS: la verificación es build + lint + estándares, y el
  comportamiento lo auditan los revisores contra este spec y los planes.
-->

# Spec: <nombre-del-trabajo>

- **Cliente**: <nombre>
- **Agente principal**: <quién conduce>
- **Modo**: directo | cambio chico | mega cambio
- **Rama**: <rama-de-trabajo> (base: <rama-base>, commit base: <sha>) — nueva | existente | default — por repo involucrado
- **Remote**: <origin> | sin remote — por repo involucrado
- **Respaldo**: habilitado (rama de respaldo: hd-backup/<trabajo>) | no aplica (<motivo>) — por repo involucrado
- **Build**: <comando de build o typecheck> | no aplica
- **Lint**: <comando de lint y formato> | no aplica
- **Estándares**: <comando único de chequeo: make check | pnpm verify | npm run check> | no aplica
- **Worktrees**: .git/hd-wt/<trabajo>/ — symlinks de dependencias: <node_modules | .venv | target | no aplica>
- **Baseline**: pendiente (se corre antes de la ola 1) | <sha> — <n> hallazgos preexistentes
- **Prototipo**: .hd/<trabajo>/prototype/ | no aplica (<motivo>)
- **Technical spec**: .hd/<trabajo>/technical_spec.md
- **QA de artefactos**: review-progress.md (bloque "Paquete (fase 2)")
- **Fecha**: <fecha>
- **Estado**: aprobado por el cliente en la etapa 3 de discovery; paquete auditado

## Resumen del entendimiento

<!-- El resumen que el cliente aprobó, con sus palabras y las del agente
     principal. Debe ser idéntico al de la etapa 3. Si cambió, no es el
     mismo trabajo. -->

## Qué se va a hacer

<!-- El alcance concreto: qué se crea, qué se modifica, qué se elimina.
     Sin código. Comportamiento e interfaces en prosa. -->

## Por qué

<!-- La motivación del cliente: qué problema resuelve, qué dolor quita,
     qué habilita. -->

## Alcance

### Entra

- <...>

### No entra

- <...>

### No se puede romper

- <...>

## Criterios de aceptación

<!-- Lista verificable. Cada criterio se responde sí/no mirando el sistema
     (no leyendo el código). Sin tests, esta lista es la checklist con la
     que el cliente prueba el trabajo y el último respaldo del revisor. -->

- [ ] <criterio 1>
- [ ] <criterio 2>

## Riesgos y mitigaciones

<!-- Datos, contratos rotos, consumidores afectados, performance, seguridad,
     despliegue. Qué puede salir mal y cómo se mitiga. -->

## Decisiones y supuestos

<!-- Lo que se decidió en la Q&A y lo que se confirmó en la investigación.
     Los supuestos que quedaron abiertos no deberían existir: si hay, el
     paquete no está listo. -->

## Preguntas y respuestas (Q&A)

<!-- Registro COMPLETO de la etapa 1 y de la etapa 2: cada pregunta hecha
     (de a una por turno) y la respuesta del cliente. -->

### Etapa 1 — Entender y revisar el código

1. **P:** <pregunta>
   **R:** <respuesta>

### Etapa 2 — Ampliar y cruzar

1. **P:** <pregunta>
   **R:** <respuesta>

## Datos en producción

<!-- Solo si el trabajo toca datos existentes:
     ¿hay datos en producción? ¿respaldo hecho? ¿prueba en seco? ¿ventana?
     ¿rollback? Respuestas del cliente, con fecha. -->

## Prototipo

<!-- Si hay UI: ruta, cómo abrirlo, qué flujos/estados cubre, qué queda afuera.
     Si no hay UI: "No aplica (<motivo>)". -->

## Enmiendas

<!-- Vacío al crear. Se usa solo si el cliente aprueba un cambio de
     alcance durante la ejecución. Cada enmienda: fecha, qué cambió, por qué,
     impacto y aprobación del cliente. -->

## Aprobación

- **Fecha**: <fecha>
- **Aprobó**: resumen | prototipo | ambos
- **QA de artefactos**: APROBADO (<fecha>)
- **Observaciones**: <...>
