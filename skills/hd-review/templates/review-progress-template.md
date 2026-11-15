<!--
  Template de progreso de revisión — Framework Hiper-driven (HD)
  Bloques: "Paquete (fase 2)" (lo escribe el QA de artefactos), un bloque
  por OLA (lo escribe el revisor de la ola) y "Auditoría de cierre" (lo
  escribe el auditor final). Se analiza SECUENCIALMENTE.
  En la fase 4, la corrección de cierre es UNA sola; no hay re-auditoría.
  El auditor es OBLIGATORIO en todos los modos.
  No hay tests: la evidencia es build + lint + estándares, y el
  comportamiento lo auditan los revisores contra el spec y los planes.
-->

# Progreso de revisión: <nombre-del-trabajo>

- **Fecha de revisión**: <fecha>
- **Spec de referencia**: .hd/<nombre-del-trabajo>/spec.md
- **Technical spec**: .hd/<nombre-del-trabajo>/technical_spec.md
- **Modo**: directo | cambio chico | mega cambio

## Paquete (fase 2) — APROBADO | DENEGADO

<!-- Lo escribe el QA de artefactos en hd-spec. La fase 3 no lo reescribe. -->

**Auditado**: spec.md + technical_spec.md + plans/ + prototype/ + discovery/ + ledger.md
**Hallazgos**:

1. <hallazgo> — <archivo> — <qué falta para pasar a verde>

**Por qué**: <justificación del veredicto>

---

## Ola <N> — APROBADO | DENEGADO

**Plan(es) revisado(s)**: plan-NN, ...
**Commit de la ola**: <sha> — diff: `git diff <base>..<sha> -- <rutas del plan>`

### Gate

- **Build**: <resultado> — log: <ruta>
- **Lint**: <resultado> — log: <ruta>
- **Estándares**: <resultado> — log: <ruta>
- **Fallos del baseline ignorados**: <firmas>

### Hallazgos

<!-- Buscar, en este orden:
     1. Seguridad
     2. Bugs lógicos
     3. Trampas del lenguaje / librerías
     4. Desviaciones entre spec/technical spec/plan y lo implementado
     5. Comportamiento esperado (entradas, salidas, bordes, errores)
     6. Prototipo (si hay UI)
     7. Estándares y calidad
     8. Footprints y tests agregados
-->

1. <hallazgo> — archivo:línea — clasificación: código | estándares | contrato | infra | comportamiento — severidad: alta | media | baja

### Por qué se aprueba / se deniega

<!-- Justificación clara. Si se deniega: qué debe corregirse para pasar a
     verde, punto por punto. -->

### Correcciones de la ola

| Tipo | Commit | Resultado | Confirmación |
|---|---|---|---|
| gate | <sha> | verde / residual | — (el agente principal re-corre el gate) |
| revisión | <sha> | verde / residual | resuelto / pendiente |

---

<!-- Repetir el bloque por cada ola, en orden. -->

## Auditoría de cierre — APROBADO | DENEGADO

<!-- La escribe el auditor final en hd-review. No participó de ninguna ola.
     Mira el trabajo completo, no ola por ola. -->

**Auditado**: diff de código completo (base..HEAD, sin .hd) + spec + technical spec + planes + prototipo + waves.md + ledger.md
**Evidencia**: build <resultado> · lint <resultado> · estándares <resultado> · logs <rutas>

### Hallazgos

1. <hallazgo> — archivo:línea — clasificación: código | estándares | contrato | infra | comportamiento — severidad: alta | media | baja

### Por qué se aprueba / se deniega

<!-- Si se deniega: qué debe corregirse para pasar a verde, punto por punto. -->

### Corrección de cierre

- **Commit**: <sha>
- **Resultado**: verde | residual
- **Confirmación del auditor**: <resuelto | pendiente>

## Prueba del cliente

- **Fecha**: <fecha>
- **Resultado**: aprobado | con observaciones
- **Observaciones**: <...>
- **Fixes del cliente**: <sha(s)> | no aplica
- **Cambios fast durante la prueba**: <sha(s)> | no aplica

## Veredicto global

<!-- Verde: el cliente aprobó el comportamiento y el trabajo está listo
     para hd-close. Los commits por ola se conservan.
     Rojo después de la corrección: freno real, reporte al cliente. -->
