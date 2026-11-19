<!--
  Template de progreso de revisión — Framework Hiper-driven (HD)
  Bloques: "Paquete (fase 2)" (lo escribe el QA de artefactos) y el bloque
  de la fase 4 (revisores por ola + auditoría visual + corrección + re-prueba).
  La fase 4 corre en dos subfases en paralelo: revisores de código (máx. 4)
  y auditor visual. Los revisores escriben SOLO hallazgos en su archivo;
  el orquestador consolida acá.

  No hay prueba del humano ni tests: la evidencia es build + lint +
  estándares, la revisión semántica y la prueba de comportamiento de punta
  a punta del auditor visual.
-->

# Progreso de revisión: <nombre-del-trabajo>

- **Fecha de revisión**: <fecha>
- **Spec de referencia**: .hd/<nombre-del-trabajo>/spec.md
- **Technical spec**: .hd/<nombre-del-trabajo>/technical_spec.md
- **Modo**: directo | cambio chico | mega cambio

## Paquete (fase 2) — APROBADO | DENEGADO

<!-- Lo escribe el QA de artefactos en hd-spec. La fase 3 no lo reescribe. -->

**Auditado**: spec.md + technical_spec.md + plans/ + prototype/ + discovery/ + ledger.md + .hd/memory.md
**Hallazgos**:

1. <hallazgo> — <archivo> — <qué falta para pasar a verde>

**Por qué**: <justificación del veredicto>

---

# Revisión (fase 4)

## Ola <N> — SIN_HALLAZGOS | CON_HALLAZGOS

**Revisor**: revisor-ola-<N>
**Reporte de hallazgos**: .hd/<trabajo>/reports/revision-ola-<N>.md
**Diff revisado**: <ruta del patch> — <sha base>..<sha ola>

### Hallazgos

<!-- Los revisores escriben solo hallazgos; el orquestador los consolida
     acá, deduplicados y ordenados por severidad.
     Buscar: seguridad, bugs lógicos, trampas del lenguaje, desviaciones
     spec/plan, comportamiento esperado, prototipo, estándares, footprints. -->

1. [severidad] <hallazgo> — archivo:línea — <por qué> — <cómo verificarlo>

---

<!-- Repetir el bloque por cada ola revisada. Si hay más de 4 olas, un
     revisor puede cubrir olas consecutivas: anotarlo. -->

## Auditoría visual — OK | CON_FALLOS

**Auditor**: auditor-visual
**Reporte**: .hd/<trabajo>/reports/auditoria-visual.md
**Entorno**: <cómo se levantó, qué se instaló, datos usados>

### Fallos

1. [severidad] <flujo> — <pasos> — <esperado> — <obtenido> — <evidencia>

### No verificable

<!-- Lo que el entorno no permitió probar. No cuenta como verde. -->

- <...>

## Corrección de la revisión

- **Fixer**: fixer-review
- **Hallazgos asignados**: <N> (revisores + auditor visual)
- **Reporte**: .hd/<trabajo>/reports/fixer-review.md
- **Commit**: <sha>
- **Gate en la rama**: build <r> · lint <r> · estándares <r> — logs <rutas>

| # | Hallazgo | Cambio | Estado |
|---|---|---|---|
| 1 | <...> | <archivo> | corregido |

## Re-prueba visual — OK | CON_FALLOS

**Reporte**: .hd/<trabajo>/reports/auditoria-visual-reprueba.md
**Alcance**: feature completa, no solo los fallos.

### Resultado

- **Flujos re-probados**: <...>
- **Fallos restantes**: <ninguno | ...>

## Veredicto global

<!-- Verde: revisores sin hallazgos abiertos + re-prueba visual OK + gate
     limpio. El orquestador carga hd-close automáticamente, sin humano.
     Rojo después de la corrección: freno real, reporte al humano con
     diagnóstico. No hay segunda ronda. -->
