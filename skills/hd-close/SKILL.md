---
name: hd-close
description: Fase 5 (final) del framework Hiper-driven (HD). Usar SOLO cuando el humano aprobó explícitamente el trabajo después de probarlo. Elimina los worktrees creados, commitea en UN único commit todo el trabajo —incluidos los artefactos .hd/<trabajo>/, que van por defecto salvo que el humano los excluya o que git los ignore— (los checkpoints por ola ya fueron colapsados en hd-review) con un mensaje derivado del spec, y jamás hace push sin autorización explícita del humano.
---

# HD — Fase 5: Cierre

**Precondición absoluta**: el humano dijo explícitamente que está todo bien. Ni los tests en verde, ni la revisión aprobada, ni el paso del tiempo reemplazan esa aprobación.

## Decisiones fijas (no se preguntan)

| Decisión | Regla |
|----------|-------|
| Artefactos `.hd/<trabajo>/` en el commit | **Van**: se commitean junto con el código. Solo quedan fuera si el humano lo pidió explícitamente o si git los ignora. **No preguntes.** |
| Push | **Nunca** sin autorización explícita del humano (Paso 4). |
| Checkpoints por ola | Ya se colapsaron en hd-review: no se resucitan ni se re-crean. |
| Worktrees residuales | Se borran, verificando antes que no tengan trabajo sin consolidar. |

Una decisión ya tomada no se vuelve a consultar: preguntar por lo que el framework ya resolvió solo le agrega ruido al humano.

## Paso 1 — Confirmar el estado

- Verificá que todos los cambios del trabajo están en la rama (sin stage o ya staged) y que **no quedan worktrees del trabajo**: en mega cambio se borran al consolidar cada ola; si quedó alguno (proceso abandonado a mitad), verificá que no tenga trabajo sin consolidar antes de borrarlo.
- Si encontrás cambios en algún worktree que no están en la rama: FRENÁ y avisá al usuario antes de tocar nada.
- **Si el historial arrastra commits `hd(<trabajo>): ...`, el colapso de hd-review no se hizo**: pará, colapsá primero (`reset --mixed` a la base del spec, con el hash del árbol comparado antes y después) y recién entonces commiteá. Un checkpoint nunca es el commit final.

## Paso 2 — Limpiar worktrees

- Eliminá cualquier worktree residual del trabajo y confirmá con `git worktree list` que no queda ninguno (`git worktree prune` para limpiar registros obsoletos). Normalmente no debería haber ninguno: cada ola borra los suyos al consolidarse.
- Limpiá artefactos temporales de la orquestación si los hubiera (parches aplicados, archivos de staging intermedios).
- Los artefactos `.hd/<nombre-del-trabajo>/` (spec, planes, ledger, review-progress) **se conservan y se commitean junto con el código**: son el registro auditable del trabajo; sin ellos, el commit no se puede reconstruir ni auditar. **No preguntes si van incluidos: la decisión ya está tomada.** Hay solo dos exclusiones, y ambas son objetivas:
  - **El humano lo pidió explícitamente** ("no commitees los artefactos", "dejá los `.hd` afuera"): quedan fuera del commit. Asentalo en el ledger y mencioná el motivo en el resumen final.
  - **Git los ignora**: verificá con `git check-ignore -q .hd/<nombre-del-trabajo>/spec.md`. Si están ignorados (típico: `.hd/` en el `.gitignore`), quedan sin trackear y fuera del commit. **No los fuerces** con `git add -f`: el `.gitignore` del repo es una decisión del humano.
  - En cualquier otro caso: se commitean, sin preguntar y sin avisar antes.

## Paso 3 — Commit

- Commiteá **todo el trabajo hecho en UN único commit** (los checkpoints por ola ya se colapsaron en hd-review: no los resucites).
- El stage incluye los artefactos `.hd/<trabajo>/` salvo que estén ignorados o el humano los excluyó (ver Paso 2): no hace falta ningún paso extra ni ninguna confirmación.
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
- Si alguna vez querés el historial por olas, el SHA previo al colapso está en el ledger (`git reset --hard <sha>`): no vuelve solo, y descarta lo corregido después.
- Estado: worktrees eliminados, artefactos en `.hd/<nombre-del-trabajo/>` (commiteados con el trabajo; fuera del commit solo si el humano los excluyó o si git los ignora — decilo si es el caso), push pendiente de autorización (o realizado si se autorizó).

### Rulings que tomaste en nombre del humano (obligatorio)

Antes de borrar nada, recolectá **TODAS** las líneas `Ruling:` del `ledger.md` (decisiones de adjudicación, hallazgos parkeados, conflictos resueltos) y listalas acá, en el orden en que las tomaste, cada una con **qué cuesta si te equivocaste**. La lista es exhaustiva: si está en el ledger, está en tu mensaje. Es el único lugar donde esas decisiones llegan al humano — él las lee y re-trabaja lo que hayas resuelto mal. Un ruling que muere con la sesión fue una decisión tomada en secreto.

Acá, y solo acá, el trabajo HD se da por terminado.
