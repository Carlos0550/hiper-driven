---
name: hd-audit
description: Fase 4 (opcional) del framework Hiper-driven (HD). Usar SOLO durante la revisión humana, cuando el humano pidió revisar el código a mano. Toma los commits del trabajo (uno por plan), vuelca su detalle en .hd/<trabajo>/audit-guia.md con guías exactas para restaurar cada commit con sus modificaciones, y deja la rama lista para que el humano audite a su ritmo. Al terminar la auditoría, restaura los commits a su lugar para seguir iterando los cambios o para pushear con autorización.
---

# HD — Auditoría manual del humano (Fase 4)

**Cuándo**: únicamente en la fase de revisión humana, cuando hd-review abre el gate y el humano responde que **sí quiere revisar el código a mano**. En cualquier otro momento esta skill no aplica: sin trabajo commiteado no hay qué auditar, y sin gate humano no hay a quién devolverle el resultado. Si se invoca fuera de ese momento, **no hagas nada**: avisá y seguí el flujo que corresponda.

**Qué resuelve**: el trabajo llega commiteado en una cadena de commits (uno por plan, más los de corrección). El humano quiere revisar esa cadena commit por commit, y para eso necesita un mapa: qué commit hizo qué, cómo verlo sin tocar la rama y cómo devolver los commits a su lugar cuando termine —apruebe o pida cambios—.

## Precondiciones (verificalas, no las asumas)

1. La implementación terminó: la rama tiene los commits del trabajo (`hd(<trabajo>): plan NN — ...`).
2. El gate humano de la fase 4 está abierto (hd-review ya corrió la auditoría y la verificación final).
3. La rama de trabajo está en el HEAD del trabajo y el árbol está limpio (`git status`).

Si alguna falla: **no hagas nada**. Avisá qué precondición falta y seguí el flujo normal (hd-review → gate de aprobación → hd-close).

## Paso 1 — Snapshot de los commits

- `git log --oneline <commit base>..HEAD` → la lista de commits del trabajo, en orden.
- Por commit: SHA, mensaje, plan/ola, archivos tocados (`git show --stat <sha>`) y hash del árbol (`git rev-parse <sha>^{tree}`).
- Anotá el snapshot en el ledger: `Auditoría manual: snapshot <N> commits (base <sha> → HEAD <sha>, árbol <hash>)`.
- Guardá el **SHA final (HEAD)** como ancla de restauración: es a donde vuelve la rama.

## Paso 2 — Generar la guía de auditoría

Escribí `.hd/<nombre-del-trabajo>/audit-guia.md` (es un artefacto del trabajo: va al repo como los demás) con:

1. **Contexto**: repo, rama, commit base, HEAD, cantidad de commits, fecha, y de qué plan es cada commit.
2. **Tabla de commits**: SHA corto | plan | ola | qué entró | archivos tocados | qué mirar.
3. **Detalle por commit**: qué cambió (diffstat + el diff completo si es manejable; si el diff es enorme, diffstat + el comando exacto para verlo) y los comandos para auditarlo sin salir de la rama:
   - `git show <sha>` — el commit completo, con su diff.
   - `git show --stat <sha>` — solo el resumen de archivos.
   - `git diff <base>..<sha>` — el acumulado hasta ese commit.
   - `git log -p <base>..HEAD` — toda la cadena de una vez.
4. **Guías de restauración** (el corazón de la guía):
   - **Volver al estado completo del trabajo**: `git reset --hard <sha-final>` — la rama vuelve al último commit, con todos los cambios de todos los planes.
   - **Revisar un commit puntual**: `git reset --hard <sha>` (deja la rama en ese commit) o `git show <sha>` (no mueve nada).
   - **Reaplicar un commit sobre otra base**: `git cherry-pick <sha>`.
   - **Deshacer sin reescribir historia**: `git revert <sha>`.
   - **Copiar un archivo de un commit**: `git checkout <sha> -- <ruta>`.
   - **Recuperar un commit que quedó colgando**: `git reflog` — los SHA de la tabla son la red de seguridad.
5. **Qué hacer al terminar**:
   - **Aprobó** → la rama queda en `<sha-final>` y se puede pedir autorización de push.
   - **Pidió cambios** → la rama queda en `<sha-final>` y se sigue con el loop de correcciones de hd-review: cada corrección es un commit nuevo encima. La guía se regenera con los commits nuevos.

## Paso 3 — Entregar la guía y dejar auditar

- Pasale la ruta de la guía y decile qué contiene (cuántos commits, qué cubre). **No lo apures**: el humano marca el ritmo.
- Mientras audita: no toques la rama, no commitees, no corras nada que mueva el árbol. Solo respondé lo que pregunte.
- **No pushees nada durante la auditoría**: la rama está puesta atrás a propósito y el remoto ya tiene la cadena completa de commits; un push (forzado o no) puede desalinear el respaldo. El push de seguridad se reanuda cuando la rama vuelve a su lugar.

## Paso 4 — Restaurar los commits (cuando el humano termina)

- `git status` + `git log --oneline <base>..HEAD`: ¿la rama se movió? ¿quedaron cambios sin commitear?
- **Si el humano dejó cambios sin commitear: no los borres.** `git stash push -m "hd(<trabajo>): cambios del humano post-auditoría"` y avisale dónde quedó (o commitealos, si te lo pide).
- **Si la rama quedó atrás** (el humano hizo `reset` o `checkout` para inspeccionar): `git reset --hard <sha-final>` → vuelven todos los commits, cada uno en su lugar.
- **Verificá** que el árbol quedó igual al del snapshot: `git rev-parse HEAD^{tree}` contra el hash anotado en el Paso 1. Mismo hash = no se perdió nada. Si difiere, **paralo y avisá**: no sigas como si nada.
- **El remoto quedó con la cadena completa**: no hagas push para "igualar" la rama. Si el trabajo sigue con correcciones (hd-review), cada commit nuevo se sube con el push de seguridad.
- Ledger: `Auditoría manual: restaurados <N> commits (HEAD <sha>, árbol <hash>)`.

## Salida

- **Aprobó** → los commits por plan quedan en su lugar → hd-close (que pide autorización de push; nunca push sin sí).
- **Pidió cambios** → los commits quedan en su lugar → hd-review (loop de correcciones con `hd-debug` obligatorio): cada corrección es un commit nuevo encima → al cerrar la ronda, se regenera la guía con los commits nuevos.

## Racionalizaciones comunes (y su realidad)

| Excusa | Realidad |
|--------|----------|
| "El humano ya lo vio en el diff, no necesita guía" | La guía es lo que le devuelve los commits a su lugar: sin el mapa de SHAs, restaurar la rama es adivinar. |
| "Le meto todos los diffs completos, son gigantic" | Si el diff no es manejable: diffstat + el comando exacto. La guía tiene que servir para auditar, no para leerse de corrido. |
| "La invoco cuando se me ocurre, es útil" | Solo en la fase de revisión humana: antes no hay commits del trabajo que auditar, después ya no hay gate humano al que devolverle el resultado. |
