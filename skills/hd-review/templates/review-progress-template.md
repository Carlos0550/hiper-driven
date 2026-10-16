<!--
  Template de progreso de revisión — Framework Hiper-driven (HD)
  Un bloque por unidad de revisión (ola/plan; los parches viven en
  .hd/<trabajo>/waves/). Se analiza SECUENCIALMENTE.
  Cada bloque termina con un veredicto.
-->

# Progreso de revisión: <nombre-del-trabajo>

- **Fecha de revisión**: <fecha>
- **Spec de referencia**: .hd/<nombre-del-trabajo>/spec.md

## Unidad: ola<N>-<plan-NN> (<archivo .patch auditado>) — APROBADO | DENEGADO

**Plan(s) revisado(s)**: plan-NN, ...

### Hallazgos

<!-- Buscar, en este orden:
     1. Vulnerabilidades / huecos de seguridad
     2. Bugs lógicos
     3. Trampas del lenguaje o librerías (concurrencia, recursos sin cerrar,
        errores típicos del stack, p. ej. spawn de greenlets en Python/gevent)
     4. Desviaciones o inconsistencias entre spec/plan y lo implementado
-->

1. <hallazgo> — severidad: alta | media | baja

### Por qué se aprueba / se deniega

<!-- Justificación clara del veredicto. Si se deniega: qué debe corregirse
     para pasar a verde. -->

---

<!-- Repetir el bloque por cada unidad, en orden de revisión. -->

## Veredicto global

<!-- Todo en verde (o adjudicado con rulings en el ledger): correr los tests
     de todas las olas en la rama, colapsar los commits del trabajo
     (reset --mixed a la base, con el hash del árbol verificado antes y
     después) y avisar al humano (Fase 4).
     Algo en rojo: lanzar corrección y re-revisar antes de avanzar. -->
