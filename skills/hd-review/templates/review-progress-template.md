<!--
  Template de progreso de revisión — Framework Hiper-driven (HD)
  Un bloque por etapa: "Spec y planes" (lo escribe la fase 2) y un bloque
  por OLA. El diff se reconstruye desde el commit de la ola
  (git show <sha> -- <rutas del plan>); no se guardan archivos de parche.
  Se analiza SECUENCIALMENTE.
  En la fase 4, la corrección es UNA sola para todas las olas; no hay re-revisión.
  El revisor es OBLIGATORIO en todos los modos: en directo y en cambio chico
  hay un solo bloque de ola, pero el bloque no se saltea.
  No hay tests: la evidencia es build + lint, y el comportamiento lo
  audita el revisor contra el spec y el plan.
-->

# Progreso de revisión: <nombre-del-trabajo>

- **Fecha de revisión**: <fecha>
- **Spec de referencia**: .hd/<nombre-del-trabajo>/spec.md
- **Modo**: directo | cambio chico | mega cambio

<!-- Si el archivo se crea en la fase 2, el primer bloque es:

## Spec y planes (fase 2) — APROBADO | DENEGADO

**Auditado**: spec.md + plans/...
**Hallazgos**: ...
**Por qué**: ...

La fase 4 no lo reescribe: agrega los bloques de ola después. -->

## Ola <N> — APROBADO | DENEGADO

**Plan(es) revisado(s)**: plan-NN, ...
**Commit de la ola**: `<sha>` — diff por plan: `git show <sha> -- <rutas del plan>`

### Hallazgos

<!-- Buscar, en este orden:
     1. Vulnerabilidades / huecos de seguridad
     2. Bugs lógicos
     3. Trampas del lenguaje o librerías
     4. Desviaciones entre spec/plan y lo implementado
     5. Comportamiento esperado: ¿el código hace lo que el plan dice
        (entradas, salidas, casos borde, errores)? Esto REEMPLAZA a los tests.
     6. Estándares y calidad: convenciones del repo, manejo de errores,
        duplicación evitable, complejidad innecesaria, dependencias nuevas
        sin justificar, restos de debug.
-->

1. <hallazgo> — clasificación: código | estándares | infra | contrato | comportamiento — severidad: alta | media | baja

### Por qué se aprueba / se deniega

<!-- Justificación clara del veredicto. Si se deniega: qué debe corregirse
     para pasar a verde, punto por punto. -->

---

<!-- Repetir el bloque por cada ola, en orden de revisión. -->

## Corrección única

<!-- TODOS los hallazgos de TODAS las olas en un solo corrector, con
     hd-debug obligatorio y guarda de alcance (un hallazgo, un cambio;
     nada de refactors colados). No escribe tests. Una sola pasada.
     Verde: commit hd(<trabajo>): corrección única + push a hd-backup/<trabajo>.
     Rojo: reporte al humano con diagnóstico. NO hay ronda 2. -->

- Resultado: verde (commit <sha>) | residual (reporte al humano)
- Evidencia: build <resultado> · lint <resultado> · reproducción del hallazgo <resultado>

## Veredicto global

<!-- Verde: correr build + lint en la rama (evidencia fresca final), revisar el
     diff total (sin archivos sueltos ni restos de debug) y avisar al humano
     para que pruebe el comportamiento con los criterios de aceptación como
     checklist. Los commits por ola se conservan: no se colapsan.
     Rojo después de la corrección: freno real, reporte al humano; no se re-revisa. -->
