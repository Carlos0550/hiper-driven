<!--
  Reporte de research — Framework Hiper-driven (HD)
  Lo escribe un subagente de solo lectura para el orquestador.
  No arregla, no diseña, no commitea. Devuelve evidencia, no opiniones.
  ANTES DE EMPEZAR: lee .hd/memory.md y no re-investigues lo que ya está.
  El orquestador verifica a mano los hallazgos que sostienen el diseño y los
  vuelca a la memoria como [hecho] con archivo:línea.
-->

# Research: <área>

- **Trabajo**: <trabajo>
- **Agente**: `research-<área>`
- **Fecha**: <fecha>
- **Alcance**: <rutas, módulos, servicios>
- **Método**: <lectura, grep, búsqueda de referencias, documentación>

## Respuesta corta

<!-- 3-6 líneas: qué encontró y qué implica para el pedido. -->

## Hallazgos

<!-- Cada hallazgo con evidencia verificable: archivo:línea. -->

1. **<hallazgo>** — `ruta/archivo.ext:NN` — <qué hace hoy> — <por qué importa>
2. ...

## Contratos y consumidores

- **Contratos / interfaces**: <...>
- **Consumidores**: <...>
- **Eventos / jobs / integraciones**: <...>
- **Qué se rompe si cambia**: <...>

## Datos

- **Modelo / tablas / esquemas**: <...>
- **Migraciones existentes**: <...>
- **Volúmenes / retención**: <...>
- **Riesgos de datos**: <...>

## Convenciones y verificación

- **Build / typecheck**: <comando>
- **Lint / formato**: <comando>
- **Estándares**: <comando o "no aplica">
- **Tests existentes**: <dónde están; no se tocan>
- **Convenciones de la casa**: <nombres, capas, manejo de errores>

## Riesgos y trampas

- <...>

## Lo que NO verifiqué

<!-- Obligatorio: el research declara sus límites. El orquestador decide qué hacer
     con lo que quedó afuera. -->

- <...>

## Preguntas para el orquestador

<!-- Solo preguntas; no decisiones. -->

- <...>
