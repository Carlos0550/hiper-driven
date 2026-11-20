<!--
  Template de plan — Framework Hiper-driven (HD)
  REGLA DURA: sin lógica ni implementaciones. Comportamiento esperado: en prosa.
  EXCEPCIÓN (contratos): firmas exactas, nombres de tipos, constantes,
  valores literales y formatos se fijan acá cuando otras olas los consumen.

  NO HAY TESTS. El plan no declara archivos de tests ni flujos A/B:
  el implementador escribe solo código, y el "Comportamiento esperado"
  es lo que el revisor audita después, leyendo el diff contra este texto.

  El plan es la unidad de trabajo de un agente dentro del team de su ola.
  El paralelismo se CALCULA con Archivos/Interfaces/Depende de: dos piezas
  comparten ola solo si no se pisan. Máximo 5 agentes por team.
-->

# Plan <NN>: <nombre-corto>

- **Ola**: <N>
- **Team**: <agente> — <pieza que implementa>
- **Comparte ola con**: <plan-NN / pieza | ninguno> — <por qué no se pisan: archivos o regiones disjuntas (si comparten archivo, cada uno es dueño de una región), sin interfaces cruzadas, sin estado mutable compartido>
- **Depende de**: Ola(s) <N-1, ...> — NUNCA de otra pieza de su misma ola
- **Toca datos existentes**: sí | no
- **Especialidad sugerida**: backend | frontend | datos | infra | full-stack

## Archivos (exactos, sin globs)

- **Crea (código)**: <ruta/exacta/archivo.ext>
- **Modifica (código)**: <ruta/exacta/existente.ext>
- **Elimina (código)**: <ruta/exacta/existente.ext> | no aplica

## Interfaces

- **Consume**: <qué usa de olas anteriores — firmas exactas>
- **Produce**: <qué expone para otras piezas del team o para olas posteriores — firmas exactas, tipos, constantes>

## Objetivo

<!-- Qué queda funcionando cuando este plan termina. Una o dos líneas. -->

## Alcance

<!-- Qué se toca y qué NO se toca. Los límites son para que los agentes del
     mismo team no se pisen: cada uno conoce los archivos de los demás. -->

## Comportamiento esperado (fuente de la auditoría)

<!-- Este apartado es lo que el revisor compara contra el código.
     Tiene que incluir, en prosa:
     - entradas y salidas exactas;
     - casos borde;
     - errores y códigos;
     - qué NO cambia (para que el implementador no invente alcance).
     Si falta algo, el plan no está listo: el revisor va a denegar por
     comportamiento no especificado, y la corrección va a ser adivinanza. -->

## Criterios de aceptación

- [ ] <criterio 1>
- [ ] <criterio 2>

## Notas para el implementador

<!-- Contexto del spec y del codebase: restricciones, convenciones, trampas
     conocidas del lenguaje/librerías, interfaces congeladas con el resto
     del team.

     Contrato del team (no negociable):
     - trabaja en el worktree compartido de la ola, en sus archivos y en
       ningún otro; puede leer lo de sus compañeros, nunca editarlo;
     - NO ejecuta scripts de ningún tipo: ni build, ni lint, ni tests, ni
       migraciones, ni servidores. El orquestador corre la evidencia.
     - no commitea, no toca git, no crea archivos de verificación;
     - no escribe tests: si el plan no dice qué pasa en un caso borde,
       reporta NECESITA_CONTEXTO; no inventa comportamiento. -->
