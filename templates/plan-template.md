<!--
  Template de plan — Framework Hiper-driven (HD)
  REGLA DURA: sin snippets de código. Comportamiento esperado: sí. Código: nunca.
  Un plan es seguro para correr en paralelo SOLO si:
    - sus tareas son independientes de los otros planes de su misma ola, Y
    - ninguna tarea incluye ejecutar tests que toquen una base de datos.
-->

# Plan <NN>: <nombre-corto>

- **Ola**: <N>
- **Depende de**: Ola(s) <N-1, ...> — NUNCA de otro plan de su misma ola
- **Paralelizable**: sí | no (y por qué)
- **Toca datos existentes**: sí | no

## Objetivo

<!-- Qué queda funcionando cuando este plan termina. Una o dos líneas. -->

## Alcance

<!-- Qué archivos/módulos probablemente se tocan, qué se crea,
     qué NO se toca (límites explícitos para que implementadores
     paralelos no se pisen en archivos ni en testing). -->

## Comportamiento esperado (base de los tests — TDD)

<!-- Describir el comportamiento observable que los tests unitarios van a
     fijar ANTES de implementar: entradas, salidas, casos borde, errores.
     Este apartado es el contrato entre el plan y los tests. -->

## Criterios de aceptación

- [ ] <criterio 1>
- [ ] <criterio 2>

## Notas para el implementador

<!-- Contexto que el implementador necesita del spec y del codebase:
     restricciones, convenciones del proyecto, trampas conocidas del
     lenguaje/librerías. Recordar: solo tests unitarios propios,
     sin commits, sin otros scripts. -->
