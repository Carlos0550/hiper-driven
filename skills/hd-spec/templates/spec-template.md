<!--
  Template de spec — Framework Hiper-driven (HD)
  REGLA DURA: este documento NO debe contener snippets de código,
  ni el código exacto que los implementadores deben escribir.
  Comportamiento esperado: sí. Código: nunca.

  NO HAY TESTS: la verificación es build + lint + estándares, y el
  comportamiento lo audita el revisor contra este spec y el plan.
-->

# Spec: <nombre-del-trabajo>

- **Modo**: directo | cambio chico | mega cambio
- **Rama**: <rama-de-trabajo> (base: <rama-base>, commit base: <sha>) — nueva | existente | default — por repo involucrado
- **Remote**: <origin> | sin remote — por repo involucrado
- **Respaldo**: habilitado (rama de respaldo: hd-backup/<trabajo>) | no aplica (<motivo>) — por repo involucrado
- **Build**: <comando de build o typecheck> | no aplica
- **Lint**: <comando de lint y formato> | no aplica
- **Estándares**: <comando único de chequeo: make check | pnpm verify | npm run check> | no aplica
- **Worktrees**: `.git/hd-wt/<trabajo>/` — symlinks de dependencias: <node_modules | .venv | target | no aplica>
- **Baseline**: pendiente (se corre antes de la ola 1) | <sha> — <n> hallazgos de build/lint preexistentes
- **Revisión de artefactos**: review-progress.md (bloque "Spec y planes")
- **Fecha**: <fecha>
- **Estado**: aprobado en el resumen de discovery

## Resumen del entendimiento

<!-- 3-6 líneas: qué entendió el agente después de toda la fase de discovery,
     escrito en lenguaje simple, con las palabras del usuario si es posible. -->

## Qué se va a hacer

<!-- El alcance concreto: qué se crea, qué se modifica, qué se elimina.
     Sin código. Comportamiento e interfaces en prosa. -->

## Por qué

<!-- La motivación del usuario: qué problema resuelve, qué dolor quita,
     qué habilita. -->

## Criterios de aceptación

<!-- Lista verificable. Cada criterio debe poder responderse con sí/no
     mirando el sistema (no leyendo el código). Sin tests, esta lista es
     la checklist con la que el humano prueba el trabajo al final de la fase 4
     y el último respaldo del revisor. -->
- [ ] <criterio 1>
- [ ] <criterio 2>

## Riesgos y mitigaciones

<!-- Lo que puede salir mal (datos, contratos rotos, consumidores afectados,
     performance) y cómo se mitiga cada cosa. -->

## Preguntas y respuestas (Q&A)

<!-- Registro COMPLETO de la fase de discovery: cada pregunta hecha
     (de a una por turno) y la respuesta del usuario. -->
1. **P:** <pregunta>
   **R:** <respuesta del usuario>

## Datos en producción

<!-- Solo si el trabajo toca datos existentes:
     ¿hay datos en producción? ¿respaldo hecho? ¿prueba en seco hecha?
     Respuestas del usuario, con fecha. -->
