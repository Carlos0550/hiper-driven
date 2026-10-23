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
     de todas las olas en la rama y congelar los commits del trabajo —NO se
     colapsan: quedan uno por plan, con la lista de SHAs y el hash del árbol
     (git write-tree) anotados en el ledger— y avisar al humano (Fase 4),
     preguntándole si quiere la guía de auditoría manual (hd-audit).
     Algo en rojo: lanzar corrección y re-revisar antes de avanzar. -->
