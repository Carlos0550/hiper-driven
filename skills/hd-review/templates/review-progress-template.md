<!--
  Template de progreso de revisión — Framework Hiper-driven (HD)
  Un bloque por OLA (los parches de código y de tests viven en
  .hd/<trabajo>/waves/). Se analiza SECUENCIALMENTE.
  La corrección es UNA sola para todas las olas; no hay re-revisión.
-->

# Progreso de revisión: <nombre-del-trabajo>

- **Fecha de revisión**: <fecha>
- **Spec de referencia**: .hd/<nombre-del-trabajo>/spec.md
- **Flujo**: A | B

## Ola <N> — APROBADO | DENEGADO

**Plan(es) revisado(s)**: plan-NN, ...
**Parches**: `ola<N>-<plan>.patch` (código) + `ola<N>-<plan>-tests.patch` (tests)

### Hallazgos

<!-- Buscar, en este orden:
     1. Vulnerabilidades / huecos de seguridad
     2. Bugs lógicos
     3. Trampas del lenguaje o librerías
     4. Desviaciones entre spec/plan y lo implementado
     5. Calidad de los tests: en Flujo B, que vengan del Contrato de
        comportamiento y no de la implementación (sin importar internals
        ni replicar la estructura del código).
-->

1. <hallazgo> — clasificación: código | test | infra | contrato — severidad: alta | media | baja

### Por qué se aprueba / se deniega

<!-- Justificación clara del veredicto. Si se deniega: qué debe corregirse
     para pasar a verde, punto por punto. -->

---

<!-- Repetir el bloque por cada ola, en orden de revisión. -->

## Corrección única

<!-- TODOS los hallazgos de TODAS las olas en un solo corrector, con
     hd-debug obligatorio y guarda de alcance (código no toca tests;
     test no toca código). Una sola pasada.
     Verde: commit hd(<trabajo>): corrección única + push a hd-backup/<trabajo>.
     Rojo: reporte al humano con diagnóstico. NO hay ronda 2. -->

- Resultado: verde (commit <sha>) | residual (reporte al humano)

## Veredicto global

<!-- Verde: correr el set de tests de todas las olas en la rama, colapsar los
     commits (reset --mixed a la base, con el hash del árbol verificado antes y
     después; anotar HEAD previo y hd-backup/<trabajo>), y avisar al humano.
     Rojo después de la corrección: freno real, reporte al humano; no se re-revisa. -->
