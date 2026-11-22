<!--
  Template de progreso de revisión — Framework Hiper-driven (HD)
  Bloques: "Paquete (fase 2)" (lo escribe el QA de artefactos) y el bloque
  de la fase 4 (revisores por ola + auditoría visual + corrección + re-prueba).
  La fase 4 corre en dos subfases EN SERIE: primero revisores de código
  (uno por ola, todos los que permita el harness, en una sola tanda) y,
  después de corregir y con el gate verde, la auditoría visual en tres
  tramos: recon (entorno, credenciales, modo UI o API), entre 2 y 4 áreas
  en paralelo (UI, o API con curl/fetch si no hay frontend) y consolidación.
  Los revisores escriben SOLO hallazgos en su archivo; el orquestador
  consolida acá.

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

<!-- Repetir el bloque por cada ola revisada. Se lanza un revisor por ola,
     todos a la vez, hasta el máximo de agentes simultáneos del harness.
     Si el harness no alcanza, se cubren olas consecutivas en tandas y se
     anota acá. -->

## Auditoría visual — OK | CON_FALLOS | NO_VERIFICABLE

**Recon**: recon-auditoria — .hd/<trabajo>/reports/auditoria/entorno.md
**Modo**: UI | API (navegador no disponible: <motivo>) — decidido en el recon
**Entorno**: <comando de arranque, puerto, usuarios, seeds, qué se instaló>
**Presupuesto usado**: recon <min/turnos> · auditorías <min/turnos por área> · consolidación <min/turnos>

### Áreas

| Área | Auditor | Alcance | Veredicto | Presupuesto usado |
|---|---|---|---|---|
| <área> | auditor-auditoria-<área> | <flujos que cubre> | OK | CON_FALLOS | <min/turnos> |

<!-- Si el trabajo era una sola pantalla indivisible, va un solo auditor y acá
     se escribe el motivo. Nunca más de 4 áreas ni un corte por cantidad de casos. -->

**Reporte consolidado**: .hd/<trabajo>/reports/auditoria-visual.md
**Evidencia**: .hd/<trabajo>/reports/evidencia/<área>/recorrido.<ext>

### Fallos

1. [severidad] <flujo> — <pasos> — <esperado> — <obtenido> — <evidencia>

### No verificable

<!-- NO_VERIFICABLE (el recon no consiguió entorno ni modo API) frena el
     cierre y se reporta al humano: no es verde y no hay corrección posible.
     Lo que el entorno no permitió probar tampoco cuenta como verde.
     Si la auditoría corrió en modo API porque el navegador no arrancó,
     acá van los flujos de UI sin probar (clicks, estados visuales,
     responsive, consola del cliente) y el motivo. -->

- <...>

## Corrección de los hallazgos de código

<!-- Solo si los revisores devolvieron hallazgos. Corre antes del auditor
     visual: el visual prueba el árbol ya corregido. -->

- **Fixer**: fixer-review
- **Hallazgos asignados**: <N>
- **Reporte**: .hd/<trabajo>/reports/fixer-review.md
- **Commit**: <sha>
- **Gate en la rama**: build <r> · lint <r> · estándares <r> — logs <rutas>

| # | Hallazgo | Cambio | Estado |
|---|---|---|---|
| 1 | <...> | <archivo> | corregido |

## Corrección de la auditoría visual

<!-- Solo si la auditoría devolvió fallos. Una sola pasada. -->

- **Fixer**: fixer-visual
- **Fallos asignados**: <N>
- **Reporte**: .hd/<trabajo>/reports/fixer-visual.md
- **Commit**: <sha>
- **Gate en la rama**: build <r> · lint <r> · estándares <r> — logs <rutas>

| # | Fallo | Cambio | Estado |
|---|---|---|---|
| 1 | <...> | <archivo> | corregido |

## Re-prueba visual — OK | CON_FALLOS

**Reporte**: .hd/<trabajo>/reports/auditoria-visual-reprueba.md
**Alcance**: feature completa, no solo los fallos: los mismos roles y los mismos scripts por área.
**Presupuesto usado**: <tiempo de los scripts + min/turnos por área>

### Resultado

- **Flujos re-probados**: <...>
- **Fallos restantes**: <ninguno | ...>

## Veredicto global

<!-- Verde: revisores sin hallazgos abiertos + re-prueba visual OK + gate
     limpio. El orquestador carga hd-close automáticamente, sin humano.
     Rojo después de la corrección: freno real, reporte al humano con
     diagnóstico. No hay segunda ronda. -->
