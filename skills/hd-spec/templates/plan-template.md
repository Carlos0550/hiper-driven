<!--
  Template de plan — Framework Hiper-driven (HD)
  REGLA DURA: sin lógica ni implementaciones. Comportamiento esperado: en prosa.
  EXCEPCIÓN (contratos): firmas exactas, nombres de tipos, constantes,
  valores literales y formatos SÍ se fijan acá cuando otras olas los consumen.

  NO HAY TESTS. El plan no declara archivos de tests ni flujos A/B:
  el implementador escribe solo código, y el "Comportamiento esperado"
  es lo que el revisor audita después, leyendo el diff contra este texto.

  El paralelismo se CALCULA con Archivos/Interfaces/Depende de. El default
  es UN plan por ola: agrupá solo cuando la disjunción sea inequívoca.
-->

# Plan <NN>: <nombre-corto>

- **Ola**: <N>
- **Depende de**: Ola(s) <N-1, ...> — NUNCA de otro plan de su misma ola
- **Toca datos existentes**: sí | no

## Archivos (exactos, sin globs)

- **Crea (código)**: <ruta/exacta/archivo.ext>
- **Modifica (código)**: <ruta/exacta/existente.ext>
- **Elimina (código)**: <ruta/exacta/existente.ext> | no aplica

## Interfaces

- **Consume**: <qué usa de planes anteriores — firmas exactas>
- **Produce**: <qué expone para planes posteriores — firmas exactas, tipos, constantes>

## Objetivo

<!-- Qué queda funcionando cuando este plan termina. Una o dos líneas. -->

## Alcance

<!-- Qué se toca y qué NO se toca (límites explícitos para que los
     implementadores paralelos no se pisen). -->

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
     conocidas del lenguaje/librerías.

     El implementador se AUTOVERIFICA en su worktree — compila/typechea y
     pasa el lint sobre sus archivos. Su salida NO es evidencia: no commitea,
     no toca la rama, no aplica migraciones.

     Y no escribe tests: si el plan no dice qué pasa en un caso borde,
     reporta NECESITA_CONTEXTO; no inventa comportamiento ni un test que
     lo fije. -->
