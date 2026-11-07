---
name: hd-close
description: Fase 5 (final) del framework Hiper-driven (HD). Usar SOLO cuando el humano aprobó explícitamente el trabajo después de probarlo. Elimina automáticamente los worktrees y los stashes del trabajo, verifica que el código quedó commiteado ola por ola, commitea en un commit de cierre lo que falte (artefactos .hd/<trabajo>/) y pushea la rama de trabajo solo si es nueva; después borra la rama de respaldo hd-backup/<trabajo>. Nunca usa --force ni pushea main o ramas ajenas. Rinde cuenta de los rulings tomados.
---

# HD — Fase 5: Cierre

**Precondición absoluta**: el humano dijo explícitamente que está todo bien. Ni el build en verde, ni la revisión aprobada, ni el paso del tiempo reemplazan esa aprobación.

## Decisiones fijas (no se preguntan)

| Decisión | Regla |
|----------|-------|
| Artefactos `.hd/<trabajo>/` en el commit | **Van**: se commitean en el commit de cierre (lo que no haya viajado ya en los commits de planificación y de ola). Solo quedan fuera si el humano lo pidió explícitamente o si git los ignora. **No preguntes.** |
| Push de la rama de trabajo | **Automático solo si la rama es nueva** (creada para este trabajo) y no es la default. Si es existente, ajena o default, no se pushea: solo con autorización explícita. |
| Rama de respaldo `hd-backup/<trabajo>` | **Se borra al cerrar** cuando el trabajo ya está en el remoto (local y remota). Si el push falló, no se borra nada; si el trabajo no está en el remoto, se borra la local y se conserva la remota. |
| Worktrees | **Se eliminan todos**: no queda ninguno. |
| Stashes | Si el trabajo usó stashes (con nombre `hd(<trabajo>)` o registrados en el ledger), se dropean. |
| Checkpoints por ola | **Se conservan**: son el historial del trabajo; el cierre no los colapsa ni los squashea. |
| `--force` | **Nunca.** |

Una decisión ya tomada no se vuelve a consultar: preguntar por lo que el framework ya resolvió solo le agrega ruido al humano.

## Paso 1 — Confirmar el estado

- El humano dijo que está todo bien (precondición).
- Leé del `spec.md`, por repo: `Rama` (y si es nueva), `Remote` y `commit base`.
- Verificá que el **código** está commiteado en la rama (los commits por ola) y que lo único pendiente, si hay algo, son artefactos `.hd/`. `git status` no debe mostrar cambios de código sin commitear.
- Si encontrás cambios de código en un worktree que no están en la rama: FRENÁ y avisá al usuario antes de tocar nada.
- Mirá `git worktree list` y `git stash list` para saber qué hay que limpiar.

## Paso 2 — Limpieza automática

- **Worktrees**: antes de borrar, verificá que ninguno tenga cambios sin consolidar (`git -C <wt> status --short`); si hay, FRENÁ. Después eliminá todos los del trabajo (`git worktree remove --force` + `git worktree prune`) y confirmá con `git worktree list` que no queda **ninguno** del trabajo.
- **Directorio**: borrá `.git/hd-wt/<trabajo>/` si quedó, sin seguir los symlinks de dependencias.
- **Stashes**: dropeá los del trabajo —los que tengan mensaje `hd(<trabajo>)` y los anotados en el ledger (`Stash:`)—. Dropealos por su mensaje, no por ref (las refs se corren). `git stash list` no debe mostrar ninguno del trabajo; no toques stashes ajenos, y si queda alguno sin relación, reportalo.
- **Temporales**: limpiá `logs/` salvo que el humano haya pedido conservarlos.

## Paso 3 — Commit de cierre

- Commiteá **lo que falte**: los artefactos `.hd/<trabajo>/` que no hayan viajado (por ejemplo `review-progress.md` y el ledger actualizado) y cualquier ajuste sin commitear. **No squashees**: los commits por ola del código se conservan tal cual.
- El stage incluye los artefactos `.hd/<trabajo>/`, con tres exclusiones objetivas: `logs/` no va; si el humano pidió excluirlos, no van; si git los ignora, quedan fuera y **no los fuerces** con `git add -f`.
- Proponé el mensaje al usuario antes de commitear: derivado del spec y siguiendo las convenciones del repo.
- Si el repo tiene hooks o convenciones de formato de commit, respetalas.

## Paso 4 — Push automático (solo rama nueva)

- Para cada repo, si el spec dice `Rama: <nombre> (nueva)`, no es la default y hay remote: `git push --set-upstream <remote> <rama>` (o `git push <remote> HEAD:<rama>`). **Es automático: no pidas autorización.**
- Si la rama es existente, ajena o default: **no pushees**. Queda pendiente; el humano puede autorizarlo después.
- **Nunca `--force`.** Si el remoto tiene historia distinta o el push falla: reportalo, no fuerces y **no borres la rama de respaldo** en el paso siguiente.

## Paso 5 — Borrar la rama de respaldo

- Si el push del Paso 4 **falló**: no borres nada (ni local ni remota); reportalo.
- Si el push no aplicaba y la rama de trabajo **no está en el remoto**: borrá la local y **conservá la remota** (es la única copia remota); reportalo.
- Si el trabajo **ya está en el remoto** (push ok o rama ya publicada): borrá la local (`git branch -D hd-backup/<trabajo>`) y la remota (`git push <remote> --delete hd-backup/<trabajo>`).
- Si la rama de respaldo no existe, no es un error: anotá `no aplica`.
- Verificá que no queda `hd-backup/<trabajo>` donde correspondía.

## Paso 6 — Resumen de cierre

Sos un empleado que terminó el proyecto y le reporta a su jefe: **corto, con lo que importa**.

1. **Qué se hizo** — dos renglones, desde el spec.
2. **Desviaciones que requieren tu decisión** — problemas graves, algo no contemplado que afecta el comportamiento final, fallos conocidos que se ignoraron, residuales aceptados, decisiones que tomaste en su lugar, y lo que quedó fuera de alcance. Cada punto en tres líneas: qué pasó, por qué importa, qué se hizo o qué necesitás. Si no hay nada: *"Sin desviaciones que requieran tu decisión"*.
3. **Estado del trabajo** — modo, cantidad de olas y planes, rama, hash del commit de cierre, commits por ola (N, el historial del trabajo), worktrees eliminados (0), stashes dropeados (N), **push**: hecho (rama nueva `<nombre>`) | no aplica (rama existente/default) | falló (<motivo>) | pendiente de autorización, **respaldo**: borrado (local | local y remoto) | conservado y por qué, y artefactos en `.hd/<nombre-del-trabajo>/`.
4. **Rulings tomados en tu lugar** — la lista exhaustiva, una línea cada uno.

### Rulings que tomaste en nombre del humano (obligatorio)

Recolectá **TODAS** las líneas `Ruling:` del `ledger.md` (decisiones de adjudicación, hallazgos parkeados, conflictos resueltos, residuales aceptados) y listalas en la sección 4, en el orden en que las tomaste, cada una con **qué cuesta si te equivocaste**. La lista es exhaustiva: si está en el ledger, está en tu mensaje. Es el único lugar donde esas decisiones llegan al humano — él las lee y re-trabaja lo que hayas resuelto mal.

Acá, y solo acá, el trabajo HD se da por terminado.
