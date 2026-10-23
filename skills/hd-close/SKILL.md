---
name: hd-close
description: Fase 5 (final) del framework Hiper-driven (HD). Usar SOLO cuando el humano aprobó explícitamente el trabajo después de probarlo. Elimina los worktrees creados, verifica que todo el trabajo quedó commiteado —un commit por plan, más los de corrección— con los artefactos .hd/<trabajo>/ incluidos por defecto (salvo que el humano los excluya o que git los ignore), rinde cuenta de los rulings tomados y jamás hace push sin autorización explícita del humano.
---

# HD — Fase 5: Cierre

**Precondición absoluta**: el humano dijo explícitamente que está todo bien. Ni los tests en verde, ni la revisión aprobada, ni el paso del tiempo reemplazan esa aprobación.

## Decisiones fijas (no se preguntan)

| Decisión | Regla |
|----------|-------|
| Artefactos `.hd/<trabajo>/` en el commit | **Van**: se commitean junto con el código. Solo quedan fuera si el humano lo pidió explícitamente o si git los ignora. **No preguntes.** |
| Push | **Nunca** sin autorización explícita del humano (Paso 4). |
| Commits por plan | Ya están en la rama (hd-implement y hd-review): no se aplanan ni se re-crean, salvo pedido explícito del humano. |
| Historia reescrita | **No**: no se reescribe la historia del trabajo (ni `reset --soft` ni squash) sin que el humano lo pida. |
| Worktrees residuales | Se borran, verificando antes que no tengan trabajo sin consolidar. |

Una decisión ya tomada no se vuelve a consultar: preguntar por lo que el framework ya resolvió solo le agrega ruido al humano.

## Paso 1 — Confirmar el estado

- Verificá que todos los cambios del trabajo están en la rama (sin stage o ya staged) y que **no quedan worktrees del trabajo**: en mega cambio se borran al consolidar cada plan; si quedó alguno (proceso abandonado a mitad), verificá que no tenga trabajo sin consolidar antes de borrarlo.
- Si encontrás cambios en algún worktree que no están en la rama: FRENÁ y avisá al usuario antes de tocar nada.
- **El historial debe traer los commits por plan** (`hd(<trabajo>): plan NN — ...`): es lo que dejaron hd-implement y hd-review. Si faltan (trabajo sin consolidar), consolidá antes de cerrar. **No aplanes la historia**: cada plan queda con su commit, que es lo que el humano audita.

## Paso 2 — Limpiar worktrees

- Eliminá cualquier worktree residual del trabajo y confirmá con `git worktree list` que no queda ninguno (`git worktree prune` para limpiar registros obsoletos). Normalmente no debería haber ninguno: cada ola borra los suyos al consolidarse.
- Limpiá artefactos temporales de la orquestación si los hubiera (parches aplicados, archivos de staging intermedios).
- Los artefactos `.hd/<nombre-del-trabajo>/` (spec, planes, ledger, review-progress) **se conservan y se commitean junto con el código**: son el registro auditable del trabajo; sin ellos, el commit no se puede reconstruir ni auditar. **No preguntes si van incluidos: la decisión ya está tomada.** Hay solo dos exclusiones, y ambas son objetivas:
  - **El humano lo pidió explícitamente** ("no commitees los artefactos", "dejá los `.hd` afuera"): quedan fuera del commit. Asentalo en el ledger y mencioná el motivo en el resumen final.
  - **Git los ignora**: verificá con `git check-ignore -q .hd/<nombre-del-trabajo>/spec.md`. Si están ignorados (típico: `.hd/` en el `.gitignore`), quedan sin trackear y fuera del commit. **No los fuerces** con `git add -f`: el `.gitignore` del repo es una decisión del humano.
  - En cualquier otro caso: se commitean, sin preguntar y sin avisar antes.

## Paso 3 — Commit

- **El trabajo ya está commiteado**: un commit por plan (más los de corrección y de auditoría), hechos por el orquestador en hd-implement y hd-review. Acá no hay nada que commitear salvo que el árbol tenga cambios sueltos.
- **Si quedó algo sin commitear** (cambios del humano, ajustes posteriores a la auditoría, notas de la guía): commitealo con un mensaje derivado del spec y proponé ese mensaje antes de commitear.
- **No aplanes los commits por plan** salvo que el humano lo pida explícitamente (convención de repos que exigen un único commit: `git reset --soft <commit base>` + un commit nuevo, avisando que esa operación reescribe la historia del trabajo).
- El stage incluye los artefactos `.hd/<trabajo>/` salvo que estén ignorados o el humano los excluyó (ver Paso 2): no hace falta ningún paso extra ni ninguna confirmación.
- Si el repo tiene hooks o convenciones de formato de commit, respetalas.

## Paso 4 — NUNCA push

- **Jamás ejecutes `git push` sin autorización explícita del humano.** Ni "para probar", ni "temporal", ni a otra rama remota.
- Si el trabajo requiere push (PR, CI, revisión externa), pedila y esperá el sí.

## Paso 5 — Resumen de cierre

Cerrá con un resumen corto que incluya:

- Qué se hizo (uno o dos renglones, desde el spec).
- Modo en que se trabajó (mega cambio / cambio chico) y cuántas olas/planes.
- Rama donde quedó el commit y hash del commit.
- El historial del trabajo quedó en la rama: `git log --oneline <commit base>..HEAD` lo muestra entero (un commit por plan, más los de corrección), y cada commit se audita con `git show <sha>`.
- Estado: worktrees eliminados, artefactos en `.hd/<nombre-del-trabajo/>` (commiteados con el trabajo; fuera del commit solo si el humano los excluyó o si git los ignora — decilo si es el caso), commits del trabajo: N (uno por plan, más los de corrección), push pendiente de autorización (o realizado si se autorizó).

### Rulings que tomaste en nombre del humano (obligatorio)

Antes de borrar nada, recolectá **TODAS** las líneas `Ruling:` del `ledger.md` (decisiones de adjudicación, hallazgos parkeados, conflictos resueltos) y listalas acá, en el orden en que las tomaste, cada una con **qué cuesta si te equivocaste**. La lista es exhaustiva: si está en el ledger, está en tu mensaje. Es el único lugar donde esas decisiones llegan al humano — él las lee y re-trabaja lo que hayas resuelto mal. Un ruling que muere con la sesión fue una decisión tomada en secreto.

Acá, y solo acá, el trabajo HD se da por terminado.
