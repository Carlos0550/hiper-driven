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

Flujo: <B — código y tests en paralelo, autor de tests independiente | A — tests primero, legacy>.
Repos y ramas (push de seguridad: <rama de respaldo hd-backup/<trabajo> | deshabilitado>):
- <repo>: `<rama>`, base `<sha>`, remote `<remote>`
- <repo>: `<rama>`, base `<sha>`, remote `<remote>`

Orden:
- Baseline: `<comando>` en <repo(s)>.
- Ola 0: <planes> (sola).
- Ola 1: <planes> en paralelo (o uno solo, si el trabajo lo pide).
- Ola N: ...
- Al cerrar todas las olas: cargar `hd-review` automáticamente.

No implementes en la sesión donde se creó el spec. No pushees a la rama de trabajo
ni a `main`; el respaldo va a la rama de respaldo. El push final se autoriza en el cierre.
El spec está aprobado por el humano. No re-abras discovery ni spec, y no cambies el alcance.
~~~

## Delta respecto del plan (si aplica)

<!-- Si el prompt ajusta algo del spec o de los planes (por ejemplo, un plan
     menos en un repo, o un orden distinto justificado por un contrato de
     Ola 0), decilo acá en 2-4 líneas. Si no hay delta, borrá esta sección. -->
