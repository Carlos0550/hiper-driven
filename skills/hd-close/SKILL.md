---
name: hd-close
description: Fase 5 (final) del framework Hiper-driven (HD). Usar SOLO cuando el humano aprobó explícitamente el trabajo después de probarlo. Elimina los worktrees, verifica que todo el trabajo quedó en el diff sin stage y commitea en UN único commit —incluidos los artefactos .hd/<trabajo>/— con un mensaje derivado del spec. El respaldo por ola ya está en la rama hd-backup/<trabajo>; el push de la rama de trabajo o de un PR jamás se hace sin autorización explícita del humano. Rinde cuenta de los rulings tomados.
---

# HD — Fase 5: Cierre

**Precondición absoluta**: el humano dijo explícitamente que está todo bien. Ni los tests en verde, ni la revisión aprobada, ni el paso del tiempo reemplazan esa aprobación.

## Decisiones fijas (no se preguntan)

| Decisión | Regla |
|----------|-------|
| Artefactos `.hd/<trabajo>/` en el commit | **Van**: se commitean junto con el código. Solo quedan fuera si el humano lo pidió explícitamente o si git los ignora. **No preguntes.** |
| Push de la rama de trabajo o de un PR | **Nunca** sin autorización explícita del humano (Paso 4). |
| Push de seguridad | **Ya está hecho**: los commits por ola se subieron a `hd-backup/<trabajo>`. No se repite ni se expande a otros destinos. |
| Checkpoints por ola | Ya se colapsaron en hd-review: no se resucitan ni se re-crean. |
| Worktrees residuales | Se borran, verificando antes que no tengan trabajo sin consolidar. |

Una decisión ya tomada no se vuelve a consultar: preguntar por lo que el framework ya resolvió solo le agrega ruido al humano.

## Paso 1 — Confirmar el estado

- Verificá que todos los cambios del trabajo están en la rama **sin stage** (el colapso de hd-review) y que **no quedan worktrees del trabajo**: en mega cambio se borran al consolidar cada ola; si quedó alguno, verificá que no tenga trabajo sin consolidar antes de borrarlo.
- Si encontrás cambios en algún worktree que no están en la rama: FRENÁ y avisá al usuario antes de tocar nada.
- **Si el historial arrastra commits `hd(<trabajo>): ...` por encima de la base, el colapso de hd-review no se hizo**: pará, colapsá primero (`reset --mixed` a la base del spec, con el hash del árbol comparado antes y después) y recién entonces commiteá. Un checkpoint nunca es el commit final.
- El **respaldo** está en `hd-backup/<trabajo>` (local y/o remoto). Verificá que exista; si no existe y el push de seguridad estaba habilitado, anotalo y reportalo (no lo fuerces ahora).

## Paso 2 — Limpiar worktrees

- Eliminá cualquier worktree residual del trabajo (`git worktree list`, luego `git worktree remove` y `git worktree prune`) y confirmá que no queda ninguno. Esto incluye los worktrees del corrector de la fase 4. Normalmente no debería haber ninguno: cada ola borra los suyos al consolidarse y el corrector borra el suyo al terminar.
- **Borrá `.git/hd-wt/<trabajo>/`** si quedó: los worktrees viven ahí, fuera del árbol de trabajo. Al borrar, **no sigas los symlinks de dependencias** (`node_modules`, `.venv`): `rm -rf` sobre un symlink no toca el original, pero verificá antes de disparar.
- Limpiá artefactos temporales de la orquestación si los hubiera (`logs/` se conserva solo si el humano lo pidió; por defecto va fuera del commit).
- Los artefactos `.hd/<nombre-del-trabajo>/` (spec, prompt, planes, ledger, reportes, review-progress) **se conservan y se commitean junto con el código**: son el registro auditable del trabajo. **No preguntes si van incluidos: la decisión ya está tomada.** Hay solo dos exclusiones, y ambas son objetivas:
  - `logs/` **no va**: es salida de proceso, no documento. Asegurate de que `.gitignore` lo cubra (`.hd/*/logs/`).
  - **El humano lo pidió explícitamente** ("no commitees los artefactos", "dejá los `.hd` afuera"): quedan fuera del commit. Asentalo en el ledger y mencioná el motivo en el resumen final.
  - **Git los ignora**: verificá con `git check-ignore -q .hd/<nombre-del-trabajo>/spec.md`. Si están ignorados (típico: `.hd/` en el `.gitignore`), quedan sin trackear y fuera del commit. **No los fuerces** con `git add -f`: el `.gitignore` del repo es una decisión del humano.
  - En cualquier otro caso: se commitean, sin preguntar y sin avisar antes.

## Paso 3 — Commit

- Commiteá **todo el trabajo hecho en UN único commit** (los checkpoints por ola ya se colapsaron en hd-review: no los resucites).
- El stage incluye los artefactos `.hd/<trabajo>/` salvo que estén ignorados o el humano los excluyó (ver Paso 2): no hace falta ningún paso extra ni ninguna confirmación.
- Proponé el mensaje al usuario antes de commitear: derivado del spec (qué se hizo y por qué), siguiendo las convenciones del repo si las tiene.
- Si el repo tiene hooks o convenciones de formato de commit, respetalas.

## Paso 4 — Push: solo con autorización

- **Jamás ejecutes `git push` de la rama de trabajo, de un PR o de `main` sin autorización explícita del humano.**
- **El respaldo ya está hecho**: los commits por ola se subieron a `hd-backup/<trabajo>` durante implement y review. Ese push no se repite ni se reescribe.
- Si el trabajo requiere publicar la rama de trabajo (PR, CI, revisión externa) o mergear a la rama por defecto, pedila y esperá el sí. Si el remoto de la rama de trabajo no existe, el primer push es `git push --set-upstream <remote> <rama>`.
- **Nunca `--force`.** Si el remoto de la rama de trabajo ya tiene los commits por ola (no debería: el respaldo va a `hd-backup`), el push del commit único se rechaza; no lo fuerces, reportalo y que el humano decida.

## Paso 5 — Resumen de cierre

Sos un empleado que terminó el proyecto y le reporta a su jefe: **corto, con lo que importa**.

1. **Qué se hizo** — dos renglones, desde el spec.
2. **Desviaciones que requieren tu decisión** — problemas graves, algo no contemplado que afecta el comportamiento final, fallos conocidos que se ignoraron, residuales aceptados, decisiones que tomaste en su lugar, y lo que quedó fuera de alcance. Cada punto en tres líneas: qué pasó, por qué importa, qué se hizo o qué necesitás. Si no hay nada: *"Sin desviaciones que requieran tu decisión"*.
3. **Estado del trabajo** — modo, cantidad de olas y planes, rama, hash del commit único, worktrees eliminados, artefactos en `.hd/<nombre-del-trabajo>/`, **respaldo**: `hd-backup/<trabajo>` con los commits por ola (local | remoto | no aplica), y push de la rama de trabajo / PR pendiente de autorización (o realizado si se autorizó). Si querés el historial por olas, está en la rama de respaldo.4. **Rulings tomados en tu lugar** — la lista exhaustiva, una línea cada uno.

### Rulings que tomaste en nombre del humano (obligatorio)

Recolectá **TODAS** las líneas `Ruling:` del `ledger.md` (decisiones de adjudicación, hallazgos parkeados, conflictos resueltos, residuales aceptados) y listalas en la sección 4, en el orden en que las tomaste, cada una con **qué cuesta si te equivocaste**. La lista es exhaustiva: si está en el ledger, está en tu mensaje. Es el único lugar donde esas decisiones llegan al humano — él las lee y re-trabaja lo que hayas resuelto mal.

Acá, y solo acá, el trabajo HD se da por terminado.
