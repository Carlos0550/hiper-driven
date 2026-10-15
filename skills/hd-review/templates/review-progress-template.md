<!--
  Template de progreso de revisión — Framework Hiper-driven (HD)
  Un bloque por worktree (o por unidad de revisión en cambio chico).
  Se analiza SECUENCIALMENTE. Cada bloque termina con un veredicto.
-->

# Progreso de revisión: <nombre-del-trabajo>

- **Fecha de revisión**: <fecha>
- **Spec de referencia**: .hd/<nombre-del-trabajo>/spec.md

## Worktree: <nombre-del-worktree> — APROBADO | DENEGADO

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

<!-- Repetir el bloque por cada worktree, en orden de revisión. -->

## Veredicto global

<!-- Todo en verde: proceder al merge local por parches (sin commits).
     Algo en rojo: lanzar corrección y re-revisar antes de mergear. -->
