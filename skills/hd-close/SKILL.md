---
name: hd-close
description: Fase 5 (final) del framework Hiper-driven (HD), automática y sin intervención humana. La ejecuta el orquestador cuando hd-review cerró en verde, con los revisores sin hallazgos abiertos y la re-prueba visual OK. Elimina los worktrees y stashes del trabajo, verifica que el código quedó commiteado ola por ola, commitea en un commit de cierre los artefactos .hd/<trabajo>/ que falten (spec, technical spec, planes, prototipo, waves, ledger, review-progress) y la memoria compartida y pushea la rama de trabajo solo si es nueva; después borra la rama de respaldo hd-backup/<trabajo>. Nunca usa --force ni pushea main o ramas ajenas. Rinde cuenta de los rulings tomados.
---

# HD — Fase 5: Cierre

**Precondición absoluta**: `hd-review` cerró en verde. Es decir, los revisores no dejaron hallazgos abiertos, el fixer de revisión corrigió lo que había, el gate de la rama está limpio y el auditor visual re-probó la feature completa con veredicto OK. **Nadie tiene que aprobar nada**: la aprobación de producto ocurrió en discovery y el comportamiento lo validó el auditor visual.

## Decisiones fijas (no se preguntan)

| Decisión | Regla |
|---|---|
| Artefactos `.hd/<trabajo>/` en el commit | **Van**: se commitean en el commit de cierre lo que no haya viajado ya en el commit del paquete y en los commits de ola. Solo quedan fuera si el humano lo pidió explícitamente o si git los ignora. **No preguntes.** |
| Push de la rama de trabajo | **Automático solo si la rama es nueva** (creada para este trabajo) y no es la default. Si es existente, ajena o default, no se pushea: solo con autorización explícita. |
| Rama de respaldo `hd-backup/<trabajo>` | **Se borra al cerrar** cuando el trabajo ya está en el remoto (local y remota). Si el push falló, no se borra nada; si el trabajo no está en el remoto, se borra la local y se conserva la remota. |
| Worktrees | **Se eliminan todos**: no queda ninguno. |
| Stashes | Si el trabajo usó stashes (con nombre `hd(<trabajo>)` o registrados en el ledger), se dropean. |
| Checkpoints por ola | **Se conservan**: son el historial del trabajo; el cierre no los colapsa ni los squashea. Los commits de la vía rápida (`hd-fast: ...`) también se conservan. |
| Cambios fast posteriores a la revisión | **Se conservan** y se listan en el resumen. Si los hay, el cierre corre **build + lint + estándares** antes de terminar; si fallan, no se cierra. |
| `--force` | **Nunca.** |

Una decisión ya tomada no se vuelve a consultar: preguntar por lo que el framework ya resolvió solo le agrega ruido al humano.

## Paso 1 — Confirmar el estado

- `hd-review` cerró en verde (precondición): revisores sin hallazgos abiertos, corrección commiteada y re-prueba visual OK.
- Leé del `spec.md` y del `technical_spec.md`, por repo: `Rama` (y si es nueva), `Remote`, `commit base` y `Respaldo`.
- Verificá que el **código** está commiteado en la rama (los commits por ola) y que lo único pendiente, si hay algo, son artefactos `.hd/`. `git status` no debe mostrar cambios de código sin commitear.
- Verificá que `review-progress.md` tiene el veredicto global en verde, con el bloque de revisión por ola, la corrección y la re-prueba visual.
- Si encontrás cambios de código en un worktree que no están en la rama: **FRENÁ** y avisá al humano antes de tocar nada.
- Mirá `git worktree list` y `git stash list` para saber qué hay que limpiar.
- Buscá commits `hd-fast: ...` posteriores a la revisión (solo pueden venir de un pedido directo del humano en otra conversación). Si hay, anotalos: el cierre corre los checks antes de terminar y los lista en el resumen.

## Paso 2 — Limpieza automática

- **Worktrees**: antes de borrar, verificá que ninguno tenga cambios sin consolidar (`git -C <wt> status --short`); si hay, **FRENÁ**. Después eliminá todos los del trabajo (`git worktree remove --force` + `git worktree prune`) y confirmá con `git worktree list` que no queda **ninguno** del trabajo.
- **Directorio**: borrá `.git/hd-wt/<trabajo>/` si quedó, sin seguir los symlinks de dependencias.
- **Stashes**: dropeá los del trabajo —los que tengan mensaje `hd(<trabajo>)` y los anotados en el ledger (`Stash:`)—. Dropealos por su mensaje, no por ref (las refs se corren). `git stash list` no debe mostrar ninguno del trabajo; no toques stashes ajenos, y si queda alguno sin relación, reportalo.
- **Temporales**: limpiá `logs/` salvo que el humano haya pedido conservarlos.

## Paso 3 — Commit de cierre

- Si hubo cambios fast posteriores a la revisión, corré **build + lint + estándares** antes de commitear. Si fallan, corregí con un subagente fixer, commiteá la corrección (o frená); no cierres con checks rojos.
- Commiteá **lo que falte**: los artefactos `.hd/<trabajo>/` que no hayan viajado (por ejemplo `review-progress.md`, `waves.md` y el ledger actualizado) y cualquier ajuste sin commitear. **No squashees**: los commits por ola del código se conservan tal cual.
- El stage incluye los artefactos `.hd/<trabajo>/`, con tres exclusiones objetivas: `logs/` no va; si el humano pidió excluirlos, no van; si git los ignora, quedan fuera y **no los fuerces** con `git add -f`.
- Escribí el mensaje vos: derivado del spec y siguiendo las convenciones del repo. No hay a quién proponérselo: el humano no está en el loop.
- Si el repo tiene hooks o convenciones de formato de commit, respetalas.
- Anotá el SHA del commit de cierre en el ledger.

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

El orquestador le entrega el proyecto al humano, **corto y con lo que importa**. Es un reporte, no una pregunta: el trabajo ya está cerrado.

1. **Qué se hizo** — dos renglones, desde el spec.
2. **Desviaciones que requieren tu decisión** — problemas graves, algo no contemplado que afecta el comportamiento final, fallos conocidos que se ignoraron, residuales aceptados, decisiones que tomaste en su lugar, y lo que quedó fuera de alcance. Cada punto en tres líneas: qué pasó, por qué importa, qué se hizo o qué necesitás. Si no hay nada: *"Sin desviaciones que requieran tu decisión"*. El humano puede corregir después; el cierre ya está hecho.
3. **Estado del trabajo** — modo, cantidad de olas y planes, rama, hash del commit de cierre, commits por ola (N, el historial del trabajo), cambios fast (N, commits `hd-fast: ...`), worktrees eliminados (0), stashes dropeados (N), **push**: hecho (rama nueva `<nombre>`) | no aplica (rama existente/default) | falló (<motivo>) | pendiente de autorización, **respaldo**: borrado (local | local y remoto) | conservado y por qué, **artefactos** en `.hd/<nombre-del-trabajo>/` (spec, technical spec, planes, prototipo, waves, ledger, review-progress) más `.hd/memory.md`, y **revisión**: <N> revisores sin hallazgos abiertos, auditoría visual OK y re-prueba OK (<fecha>).
4. **Rulings tomados en tu lugar** — la lista exhaustiva, una línea cada uno.

### Rulings que tomaste en nombre del humano (obligatorio)

Recolectá **TODAS** las líneas `Ruling:` del `ledger.md` (decisiones de adjudicación, hallazgos parkeados, conflictos resueltos, residuales aceptados) y listalas en la sección 4, en el orden en que las tomaste, cada una con **qué cuesta si te equivocaste**. La lista es exhaustiva: si está en el ledger, está en tu mensaje. Es el único lugar donde esas decisiones llegan al humano — él las lee y re-trabaja lo que hayas resuelto mal.

Acá, y solo acá, el trabajo HD se da por terminado.
