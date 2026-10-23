---
name: hd-close
description: Fase 5 (final) del framework Hiper-driven (HD). Usar SOLO cuando el humano aprobó explícitamente el trabajo después de probarlo. Elimina los worktrees creados, verifica que todo el trabajo quedó commiteado —un commit por plan, más los de corrección— con los artefactos .hd/<trabajo>/ incluidos por defecto (salvo que el humano los excluya o que git los ignore), rinde cuenta de los rulings tomados y jamás hace push a la rama por defecto o a un PR sin autorización explícita del humano (el respaldo por commit a la rama de trabajo lo hace el framework solo).
---

# HD — Fase 5: Cierre

**Precondición absoluta**: el humano dijo explícitamente que está todo bien. Ni los tests en verde, ni la revisión aprobada, ni el paso del tiempo reemplazan esa aprobación.

## Decisiones fijas (no se preguntan)

| Decisión | Regla |
|----------|-------|
| Artefactos `.hd/<trabajo>/` en el commit | **Van**: se commitean junto con el código. Solo quedan fuera si el humano lo pidió explícitamente o si git los ignora. **No preguntes.** |
| Push a la rama por defecto, a un PR o a otra rama | **Nunca** sin autorización explícita del humano (Paso 4). |
| Push de seguridad (cada commit verificado a la rama de trabajo) | **Lo hace el framework solo**, sin preguntar, si hd-spec decidió rama dedicada (`push de seguridad: habilitado`). Es un respaldo, no una aprobación: nunca a la rama por defecto. |
| Commits por plan | Ya están en la rama (hd-implement y hd-review): no se aplanan ni se re-crean, salvo pedido explícito del humano. |
| Historia reescrita | **No**: no se reescribe la historia del trabajo (ni `reset --soft` ni squash) sin que el humano lo pida. |
| Worktrees residuales | Se borran, verificando antes que no tengan trabajo sin consolidar. |
| Chatter durante la ejecución | **No**: al humano se le habla solo en el freno real (algo que frena el trabajo y necesita su decisión) y en el cierre. |

Una decisión ya tomada no se vuelve a consultar: preguntar por lo que el framework ya resolvió solo le agrega ruido al humano.

## Paso 1 — Confirmar el estado

- Verificá que todos los cambios del trabajo están en la rama (sin stage o ya staged) y que **no quedan worktrees del trabajo**: en mega cambio se borran al consolidar cada plan; si quedó alguno (proceso abandonado a mitad), verificá que no tenga trabajo sin consolidar antes de borrarlo.
- Si encontrás cambios en algún worktree que no están en la rama: FRENÁ y avisá al usuario antes de tocar nada.
- **El historial debe traer los commits por plan** (`hd(<trabajo>): plan NN — ...`): es lo que dejaron hd-implement y hd-review. Si faltan (trabajo sin consolidar), consolidá antes de cerrar. **No aplanes la historia**: cada plan queda con su commit, que es lo que el humano audita.
- **Verificá el estado del respaldo remoto**: si el trabajo corrió en rama dedicada con push de seguridad habilitado, la rama de trabajo debería tener todos sus commits en el remoto (`git log <remote>/<rama>..HEAD` vacío). Si quedó algo sin subir (push fallido, corte de luz, credenciales), **no lo subas por tu cuenta**: anotalo y reportalo en el resumen (sección 3) — el humano decide si autoriza el push ahora.

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

## Paso 4 — Push: nunca sin autorización (salvo el respaldo ya hecho)

- **Jamás ejecutes `git push` sin autorización explícita del humano.** Ni "para probar", ni "temporal", ni a otra rama remota. Tampoco a la rama por defecto (`main`) ni apertura de PR: eso es otra autorización.
- **Lo que ya NO se autoriza acá es el push de seguridad**: los commits verificados del trabajo ya se subieron a la rama de trabajo durante hd-implement y hd-review (si la rama era dedicada). Ese respaldo ya está hecho: no se repite, no se reescribe y no se expande a otros destinos.
- Si el trabajo requiere push a otra rama (PR, CI, revisión externa) o merge a la rama por defecto, pedila y esperá el sí.
- Si quedó algún commit sin subir (push fallido), reportalo en el resumen: el humano decide si autoriza el push ahora.

## Paso 5 — Resumen de cierre

Sos un empleado que terminó el proyecto y le reporta a su jefe: **corto, con lo que importa**. Nada de informe por plan, nada de biblia.

El resumen tiene estas secciones, en este orden:

1. **Qué se hizo** — dos renglones, desde el spec.
2. **Desviaciones que requieren tu decisión** — la sección que importa. Solo cosas que el humano tiene que saber o decidir:
   - problemas graves, o algo que quedó sin resolver;
   - algo que **no estaba contemplado en el spec o en los planes** y que afecta el comportamiento final;
   - decisiones que tomaste en su lugar y que cambian lo que va a ver;
   - lo que quedó fuera de alcance a propósito, y por qué.

   Cada punto, en tres líneas: qué pasó, por qué importa, qué se hizo (o qué necesitás de él). Si no hay nada que decidir, decilo en una línea: *"Sin desviaciones que requieran tu decisión"*.
3. **Estado del trabajo** — modo (mega cambio / cambio chico), cuántas olas y planes, rama, commits del trabajo (N: uno por plan, más los de corrección), worktrees eliminados, artefactos en `.hd/<nombre-del-trabajo>/` (commiteados; fuera del commit solo si el humano los excluyó o si git los ignora), **respaldo remoto**: push de seguridad a `<rama>` — todos los commits arriba | N commits sin subir (<motivo>) | no aplica (el trabajo corrió sobre `<rama por defecto>`), y push a la rama por defecto / PR pendiente de autorización (o realizado si se autorizó).
4. **Rulings tomados en tu lugar** — la lista exhaustiva, una línea cada uno (ver la sección de abajo).

El detalle por plan, los conteos de tests, los veredictos y las salidas de comandos están en `.hd/<nombre-del-trabajo>/` (ledger, review-progress, audit-guia): **decís dónde están, no los pegás**.


### Rulings que tomaste en nombre del humano (obligatorio)

Recolectá **TODAS** las líneas `Ruling:` del `ledger.md` (decisiones de adjudicación, hallazgos parkeados, conflictos resueltos) y listalas en la sección 4 del resumen, en el orden en que las tomaste, cada una con **qué cuesta si te equivocaste**. La lista es exhaustiva: si está en el ledger, está en tu mensaje, pero **una línea por ruling**: es un inventario, no un informe. Los rulings que **afectan el comportamiento final** van además en la sección 2, porque esos sí requieren una decisión del humano.

Es el único lugar donde esas decisiones llegan al humano — él las lee y re-trabaja lo que hayas resuelto mal. Un ruling que muere con la sesión fue una decisión tomada en secreto.

Acá, y solo acá, el trabajo HD se da por terminado.
