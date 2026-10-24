<!--
  Template de plan — Framework Hiper-driven (HD)
  REGLA DURA: sin lógica ni implementaciones. Comportamiento esperado: en prosa.
  EXCEPCIÓN (contratos): firmas exactas, nombres de tipos, constantes,
  valores literales y formatos SÍ se fijan acá cuando otras olas los consumen.

  FLUJO B: el implementador escribe SOLO código; el autor de tests escribe
  SOLO los archivos de "Crea (tests)". Los dos footprints son disjuntos.
  El autor de tests trabaja en el commit PADRE del plan, sin ver la
  implementación.

  El paralelismo se CALCULA con Archivos/Interfaces/Depende de.
  Una ola puede tener un solo plan: no inventes planes de relleno.
-->

# Plan <NN>: <nombre-corto>

- **Ola**: <N>
- **Depende de**: Ola(s) <N-1, ...> — NUNCA de otro plan de su misma ola
- **Toca datos existentes**: sí | no

## Archivos (exactos, sin globs)

- **Crea (código)**: <ruta/exacta/archivo.ext>
- **Modifica (código)**: <ruta/exacta/existente.ext>
- **Crea (tests)**: <ruta/exacta/test_archivo.ext> | no aplica
- **Base de tests**: el commit padre del plan (lo fija el orquestador; el autor de tests no ve la implementación)

## Interfaces

- **Consume**: <qué usa de planes anteriores — firmas exactas>
- **Produce**: <qué expone para planes posteriores — firmas exactas, tipos, constantes>

## Objetivo

<!-- Qué queda funcionando cuando este plan termina. Una o dos líneas. -->

## Alcance

<!-- Qué se toca y qué NO se toca (límites explícitos para que
     implementadores y autores de tests paralelos no se pisen). -->

## Contrato de comportamiento (fuente de los tests)

<!-- FLUJO B: este apartado es la ÚNICA fuente del autor de tests.
     Tiene que incluir, en prosa:
     - entradas y salidas exactas;
     - casos borde;
     - errores y códigos;
     - qué NO se testea (para que el autor no invente).
     Si falta algo, el plan no está listo. -->

## Criterios de aceptación

- [ ] <criterio 1>
- [ ] <criterio 2>

## Notas para el implementador y el autor de tests

<!-- Contexto del spec y del codebase: restricciones, convenciones, trampas
     conocidas del lenguaje/librerías.

     FLUJO B:
     - Implementador: SOLO código de producción, NO tests, NO ejecuta,
       NO commitea, no toca archivos de "Crea (tests)".
     - Autor de tests: SOLO los tests de "Crea (tests)", desde este plan y
       las interfaces, en el commit padre del plan. NO lee la implementación,
       NO ejecuta, NO commitea.

     FLUJO A (legacy): el implementador escribe tests primero. -->
