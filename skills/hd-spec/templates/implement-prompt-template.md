<!--
  Prompt de implementación — Framework Hiper-driven (HD)
  Se genera al aprobar el spec y se entrega al humano para copiar y pegar
  en una conversación nueva. La implementación NO arranca en la sesión del spec.
  Reemplazá los placeholders con los datos reales.
-->

# Prompt de implementación — <trabajo>

Copiá el bloque de abajo y pegalo en una conversación nueva.

~~~
Cargá la skill `hd-implement` (o `/hd-implement` si tu harness lo soporta).

Implementá el spec de `<trabajo>`: "<nombre del spec>".

Fuente (no uses la memoria del harness ni la conversación anterior):
- Spec: <ruta>/spec.md
- Prompt: <ruta>/spec-prompt.md (este archivo)
- Ledger: <ruta>/ledger.md
- Planes: <lista de rutas de los planes>

Flujo: <B — código y tests en paralelo, autor de tests independiente | A — tests primero, con auditor>.
Modo: <directo | cambio chico | mega cambio>.
Repos y ramas (push de seguridad: <rama de respaldo hd-backup/<trabajo> | deshabilitado>):
- <repo>: `<rama>`, base `<sha>`, remote `<remote>`
- <repo>: `<rama>`, base `<sha>`, remote `<remote>`

Worktrees: `.git/hd-wt/<trabajo>/`, uno por ola de código y uno por ola de
tests (fuera del árbol de trabajo, invisible a `git status`); symlinks de
dependencias (<node_modules | .venv | target | no aplica>).
No reinstales dependencias en cada worktree.

Verificación: los agentes se autoverifican en su worktree (build + sus tests),
pero solo tu corrida en la rama consolidada es evidencia. En Flujo A, lanzá
un auditor de tests con contexto limpio (plan + spec + diff de tests; nunca
el diff de código) antes del gate.

Orden:
- Baseline: `<comando>` en <repo(s)>.
- Ola 0 (solo si hay contratos nuevos que consumen otras olas): <planes> (sola).
- Ola 1: <planes> — default un plan por ola; paralelo solo si la
  disjunción de footprints es inequívoca.
- Ola N: ...
- Al cerrar: <en mega, cargar `hd-review`; en directo, solo si el diff
  toca contratos>.

No implementes en la sesión donde se creó el spec. No pushees a la rama de trabajo
ni a `main`; el respaldo va a la rama de respaldo. El push final se autoriza en el cierre.
El spec está aprobado por el humano. No re-abras discovery ni spec, y no cambies el alcance.
~~~

## Delta respecto del plan (si aplica)

<!-- Si el prompt ajusta algo del spec o de los planes (por ejemplo, un plan
     menos en un repo, o un orden distinto justificado por un contrato de
     Ola 0), decilo acá en 2-4 líneas. Si no hay delta, borrá esta sección. -->
