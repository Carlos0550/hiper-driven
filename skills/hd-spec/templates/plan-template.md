<!--
  Template de plan — Framework Hiper-driven (HD)
  REGLA DURA: sin lógica ni implementaciones. Comportamiento esperado: en prosa.
  EXCEPCIÓN (contratos): firmas exactas, nombres de tipos, constantes,
  valores literales y formatos SÍ se fijan acá cuando otras olas los consumen.

  El paralelismo se CALCULA con los campos Archivos/Interfaces/Depende de:
  dos planes comparten ola SOLO si sus archivos son disjuntos, ninguno produce
  lo que el otro consume, no comparten estado mutable, ninguno depende del
  otro, y ninguno corre tests que toquen una base compartida.

  El paralelismo es el DISEÑO POR DEFAULT: cada ola debe poder correr 2 o más
  planes en paralelo. Una ola de un solo plan solo vale con dependencia dura
  (Ola 0 de contratos, ola de datos, o un output que otro plan consume).
-->

# Plan <NN>: <nombre-corto>

- **Ola**: <N>
- **Depende de**: Ola(s) <N-1, ...> — NUNCA de otro plan de su misma ola
- **Paralelo con**: plan NN, plan NN — los demás planes de esta misma ola (se lanzan en paralelo)
- **Toca datos existentes**: sí | no

## Archivos (exactos, sin globs)

- Crea: <ruta/exacta/archivo.ext>
- Modifica: <ruta/exacta/existente.ext>

## Interfaces

- **Consume**: <qué usa de planes anteriores — firmas exactas>
- **Produce**: <qué expone para planes posteriores — firmas exactas, tipos, constantes>

## Objetivo

<!-- Qué queda funcionando cuando este plan termina. Una o dos líneas. -->

## Alcance

<!-- Qué se toca y qué NO se toca (límites explícitos para que
     implementadores paralelos no se pisen). -->

## Comportamiento esperado (base de los tests — TDD)

<!-- Comportamiento observable que los tests unitarios van a fijar ANTES de
     implementar: entradas, salidas, casos borde, errores. En prosa.
     Este apartado es el contrato entre el plan y los tests. -->

## Criterios de aceptación

- [ ] <criterio 1>
- [ ] <criterio 2>

## Notas para el implementador

<!-- Contexto del spec y del codebase: restricciones, convenciones, trampas
     conocidas del lenguaje/librerías. Recordar el contrato HD:
     escribe tests primero (en ese orden), implementa, NO ejecuta nada,
     NO commitea, no toca archivos fuera de este alcance. -->
