---
name: hd-close
description: Fase 5 (final) del framework Hiper-driven (HD). Usar SOLO cuando el humano aprobó explícitamente el trabajo después de probarlo. Elimina los worktrees creados, commitea todo el trabajo hecho con un mensaje derivado del spec, y jamás hace push sin autorización explícita del humano.
---

# HD — Fase 5: Cierre

**Precondición absoluta**: el humano dijo explícitamente que está todo bien. Ni los tests en verde, ni la revisión aprobada, ni el paso del tiempo reemplazan esa aprobación.

## Paso 1 — Confirmar el estado

- Verificá que todos los cambios del trabajo están en la rama (sin stage o ya staged) y que ningún worktree tiene trabajo sin migrar.
- Si encontrás cambios huérfanos en algún worktree: FRENÁ y avisá al usuario antes de tocar nada.

## Paso 2 — Limpiar worktrees

- Eliminá **todos los worktrees creados** para este trabajo (`git worktree remove` y verificación con `git worktree list`).
- Limpiá artefactos temporales de la orquestación si los hubiera (parches aplicados, archivos de staging intermedios).
- Los artefactos `.hd/<nombre-del-trabajo>/` (spec, planes, review-progress) **se conservan**: son el registro auditable del trabajo. Preguntale al usuario si quiere commitearlos junto con el código o dejarlos fuera del commit.

## Paso 3 — Commit

- Commiteá **todo el trabajo hecho**.
- Proponé el mensaje al usuario antes de commitear: derivado del spec (qué se hizo y por qué), siguiendo las convenciones del repo si las tiene.
- Si el repo tiene hooks o convenciones de formato de commit, respetalas.

## Paso 4 — NUNCA push

- **Jamás ejecutes `git push` sin autorización explícita del humano.** Ni "para probar", ni "temporal", ni a otra rama remota.
- Si el trabajo requiere push (PR, CI, revisión externa), pedila y esperá el sí.

## Paso 5 — Resumen de cierre

Cerrá con un resumen corto que incluya:

- Qué se hizo (uno o dos renglones, desde el spec).
- Modo en que se trabajó (mega cambio / cambio chico) y cuántas olas/planes.
- Rama donde quedó el commit y hash del commit.
- Estado: worktrees eliminados, artefactos en `.hd/<nombre-del-trabajo>/`, push pendiente de autorización (o realizado si se autorizó).

### Rulings que tomaste en nombre del humano (obligatorio)

Antes de borrar nada, recolectá **TODAS** las líneas `Ruling:` del `ledger.md` (decisiones de adjudicación, hallazgos parkeados, conflictos resueltos) y listalas acá, en el orden en que las tomaste, cada una con **qué cuesta si te equivocaste**. La lista es exhaustiva: si está en el ledger, está en tu mensaje. Es el único lugar donde esas decisiones llegan al humano — él las lee y re-trabaja lo que hayas resuelto mal. Un ruling que muere con la sesión fue una decisión tomada en secreto.

Acá, y solo acá, el trabajo HD se da por terminado.
