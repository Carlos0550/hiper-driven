---
name: hd-review
description: Fase 4 del framework Hiper-driven (HD). Usar cuando todas las olas terminaron. Un revisor distinto audita cada ola por el diff de su commit (código, secuencial, contra spec y plan, incluido el comportamiento esperado), registra veredictos con evidencia en review-progress.md, corre UNA sola corrección total con hd-debug obligatorio y verifica con build + lint frescos. El revisor es obligatorio en TODOS los modos, también en directo y en cambio chico. Si no alcanza, reporta al humano con diagnóstico en vez de abrir otra ronda. Al final entrega el trabajo al humano para que pruebe el comportamiento contra los criterios de aceptación; los commits por ola se conservan. Atiende también los bugs que el humano reporte.
---

# HD — Fase 4: Revisión y corrección única

Esta fase es la que hace que el trabajo de un LLM sea **confiable**. No arranca hasta que TODAS las olas terminaron. Vos orquestás; un **subagente revisor distinto del que implementó** audita. La corrección es **una sola** para todo el trabajo.

> **Sin tests, esta fase no es un lujo: es la única lectura semántica del trabajo.** El build y el lint dicen que el código está bien formado; el revisor dice si hace lo que el spec pide. Por eso entra **siempre**, en todos los modos, sin excepción por tamaño.

> **Sin loop de revisión.** No hay 5 rondas por unidad ni re-revisión después de cada corrección. Se audita, se juntan todos los hallazgos y se corrige una vez. Si no alcanza, se reporta al humano con diagnóstico: la segunda ronda es una decisión suya, no un automatismo.

## Qué se le habla al humano (y qué no)

**La revisión es un trabajo interno: no se narra.** El revisor es tu colega de trabajo, no su audiencia: veredictos, hallazgos y correcciones van a `review-progress.md` y al ledger.

- El humano se entera en dos momentos, y solo en esos dos:
  1. **Freno real**: un contrato roto, una decisión arquitectónica con dos caminos válidos, o **el trabajo que quedó rojo después de la corrección única**.
  2. **Final**: el handoff para que pruebe el comportamiento y, después del OK, el resumen de cierre con las desviaciones que requieren su decisión.
- Todo lo demás —veredicto APROBADO/DENEGADO, hallazgos ya corregidos, conteos de lint— **se escribe y no se dice**.

## Ley de hierro de la evidencia

```
NINGÚN VEREDICTO NI AFIRMACIÓN DE ÉXITO SIN EVIDENCIA FRESCA EN ESTE TURNO.
```

- Todo veredicto cita la evidencia: la salida de build + lint que VOS corriste recién y el diff leído por el revisor. "Compiló en la ola" no es evidencia de la corrección de ahora.
- El revisor **lee** código y diffs; no ejecuta comandos. Las corridas las hacés vos y viajan como archivo.
- **La autoverificación del agente no es evidencia.** Un worktree que compiló no prueba el árbol consolidado.

## Presupuesto de contexto

El revisor lee el diff completo y lo resume en hallazgos; **vos no leés el diff**. Si necesitás orientarte, `git diff --stat` y los hallazgos del revisor alcanzan. La salida del build y del lint va al log y al contexto solo sus líneas de fallo. Cada byte que traés al chat se paga en todos los turnos siguientes.

## Respaldo temporal (rama de respaldo)

Misma regla que en hd-implement: **cada commit verificado se sube a `hd-backup/<trabajo>`** si el spec dice `Respaldo: habilitado` y la rama actual no es la default. Es un **respaldo temporal**: `hd-close` la borra al cerrar. Nunca `--force`; si el push falla, anotá `Push: FALLIDO (<motivo>)`, seguí y reportalo en el cierre.

El commit de la corrección única también se respalda ahí. La rama de trabajo **no** se pushea automáticamente: solo en el cierre, y solo si es nueva.

## Paso 1 — Auditoría por ola

Lanzá el revisor con contexto completo por **rutas de archivo** (spec, planes y el **SHA del commit de la ola**), nunca historia pegada en el prompt. Analizá las olas **de a una, en orden, nunca en paralelo** (los hallazgos de una iluminan a la siguiente).

**La unidad de revisión es la ola**, no el plan ni el worktree: los worktrees ya fueron borrados al consolidar cada ola. El parche de cada plan no se guarda: **se reconstruye** con `git show <sha-de-la-ola> -- <rutas del plan>`, que es exactamente el diff que hay que auditar. En cambio chico y en directo, la unidad es el único commit.

**En todos los modos el revisor entra.** En directo y en cambio chico el alcance es más corto (un solo commit, un solo bloque de `review-progress.md`), no menos profundo. No hay excepción por "dos archivos": sin tests, este es el único lugar donde alguien lee el comportamiento.

El revisor busca, contra spec y plan:

1. **Vulnerabilidades y huecos de seguridad**: inyecciones, secretos expuestos, validaciones faltantes, auth esquivable.
2. **Bugs lógicos**: condiciones borde, flujos incompletos, errores silenciados.
3. **Trampas del lenguaje y librerías**: concurrencia mal manejada, recursos sin cerrar, errores típicos del stack.
4. **Desviaciones**: todo lo implementado debe trazarse al spec y a un plan; todo lo prometido debe estar implementado. Lo que sobre y lo que falte se reporta.
5. **Comportamiento esperado**: ¿el código hace lo que el `Comportamiento esperado` del plan dice, incluyendo entradas, salidas, casos borde y errores? **Este punto reemplaza a los tests**: es la auditoría semántica y es obligatoria en cada ola.
6. **Estándares y calidad**: convenciones del repo (nombres, estructura, capas), manejo de errores consistente con la casa, duplicación evitable, complejidad innecesaria, dependencias nuevas sin justificar, y restos de debug (`console.log`, código comentado, TODOs huérfanos).

## Paso 2 — Veredictos con evidencia

`.hd/<nombre-del-trabajo>/review-progress.md` (template empaquetado en esta skill, `templates/review-progress-template.md`). Si la fase 2 ya dejó el bloque `Spec y planes`, conservalo y agregá los bloques de ola después:

- Un bloque por ola, con veredicto **APROBADO** o **DENEGADO** y el porqué concreto — no un "LGTM".
- Denegado incluye: qué debe corregirse para pasar a verde, punto por punto.
- Los hallazgos se agrupan por plan cuando la ola tiene varios.

## Paso 3 — Corrección única

- **Un solo subagente corrector**, en un worktree desde el HEAD de la rama, con **todos los hallazgos de todas las olas en un mismo prompt**: archivo, comportamiento esperado, qué falló y la clasificación (código / estándares / infra).
- **Obligado a seguir `hd-debug`**: causa raíz primero, un cambio por hipótesis. Corrige; no rediseña ni agrega alcance.
- **No escribe tests**: ni para "cubrir" el hallazgo, ni como red de seguridad. Si un hallazgo es de comportamiento, se corrige el código.
- Como todo implementador: **se autoverifica en su worktree, no commitea**. Vos consolidás (`cherry-pick -n` + commit), corrés **build + lint** en la rama y anexás la salida como evidencia. El worktree del corrector se borra al terminar.
- **Guarda de alcance por hallazgo**: un hallazgo, un cambio. Nada de refactors colados ni de "aprovecho y ordeno". Si el hallazgo revela un problema más grande, se anota y se reporta; no se expande la corrección.
- **Una sola pasada**: no hay ronda 2 automática.

**Verificación de la corrección (vos):**

1. Corré `Build:` y `Lint:` en la rama, y reproducí **la falla original** (comando, input o pasos del hallazgo) para confirmar que ya no ocurre.
2. **Verde** → commit `hd(<trabajo>): corrección única`, push a `hd-backup/<trabajo>`, ledger `Corrección única (verde — <sha>)` → Paso 4.
3. **Rojo** → **no hay segunda ronda**. Re-triageá el residual y escribí el **reporte al humano**:
   - qué se implementó (dos renglones);
   - los fallos conocidos del baseline que se ignoraron;
   - cada fallo residual, con nombre, esperado vs actual y diagnóstico (código mal / estándares / entorno / estructural);
   - qué se intentó y por qué no alcanzó;
   - qué recomendás: corregir (una nueva tarea acotada, autorizada por él) o ignorar (ruling).
   
   Esto es un **freno real**: el trabajo se detiene y espera su decisión.

## Paso 4 — Verificación final

Con todo en verde (o adjudicado), verificá el **estado final consolidado**:

1. Los cambios ya están en la rama, consolidados y commiteados ola por ola. **No los colapses ni los squashees**: son el historial del trabajo y el respaldo en `hd-backup/<trabajo>`.
2. Corré **build + lint en la rama**, como evidencia final fresca del estado completo. Nada de "ya corrió en cada ola": la última corrida es la que se reporta.
3. Revisá que el diff total (`git diff <commit base>..HEAD`) no tenga archivos sueltos, restos de debug, ni nada fuera del spec.
4. Ledger: `Review: <N> olas verdes; evidencia final: build <resultado>, lint <resultado>`.

## Paso 5 — Handoff al humano (prueba de comportamiento)

Avisá **breve**: qué se implementó (dos renglones), dónde están los artefactos, y que el historial quedó **como commits por ola** (no se colapsa). **Sin el detalle plan por plan.**

Pasale **los criterios de aceptación del spec como checklist**: sin tests, la prueba del humano es la verificación final de comportamiento, y la checklist es lo que la vuelve verificable en vez de "mirá si anda".

La prueba es **de comportamiento, no de código**: el humano no revisa el diff (eso ya lo hizo el revisor); valida que el sistema haga lo que el spec promete. No le pidas que audite el código ni commit por commit.

### Si el humano encuentra algo

**Subagente corrector NUEVO, en un worktree desde la rama, obligado a seguir `hd-debug`.** Corregido → consolidás, corrés build + lint (evidencia fresca), reproducís el caso reportado y **commiteás el fix** (`hd(<trabajo>): corrección fase 4`), con su respaldo en `hd-backup/<trabajo>` → devolvéselo al humano. La rama que prueba el humano es la que se cierra: nada queda sin commitear. Recordá la regla de hd-debug: **3 fixes fallidos sobre el mismo problema = cuestionar la arquitectura con el humano**, no un cuarto fix.

## Salida

- El humano dice explícitamente que está todo bien → **cargá la skill `hd-close` VOS MISMO y ejecutá la fase 5** (sin esperar a que la invoquen).
- La prueba humana SÍ es una pausa: entre tu handoff y el veredicto del humano no avanzás. Una vez que dice "todo bien", el pase a hd-close es automático.
- Nunca avances por inercia ni porque "compila": la aprobación es del humano, después de probar.

## Racionalizaciones comunes (y su realidad)

| Excusa | Realidad |
|--------|----------|
| "Una ronda más y converge" | No hay ronda 2: si no converge, el diagnóstico está mal o el problema es estructural. Se reporta. |
| "Re-reviso la corrección para estar seguro" | La corrección se valida con build + lint frescos, la reproducción del hallazgo y el diff de la corrección. Re-revisar todo es el loop que hizo impredecible la fase. |
| "Reviso plan por plan, es más fino" | La unidad es la ola. Los planes ya están agrupados por afinidad y su diff se audita junto. |
| "Sin tests el revisor no tiene contra qué comparar" | Tiene el spec, el plan y su `Comportamiento esperado` en prosa. Ese texto es el oráculo; si es vago, el hallazgo es del plan y se reporta. |
| "En directo son dos archivos, no hace falta revisor" | Sin tests es la única lectura del diff. La excepción por tamaño es el atajo que hunde el framework. |
| "Pasa el lint, entonces está aprobado" | El lint no lee intención. Aprobar por lint verde es aprobar sin revisar. |
| "El revisor necesita el parche guardado" | `git show <sha> -- <rutas del plan>` reconstruye el mismo diff. El commit es el artefacto; el archivo de parche era un paso manual de más. |
| "Casi conforme con el spec" | Casi = residual. Se reporta con diagnóstico; no hay ronda 2. |
| "Este hallazgo es obviamente falso, lo descarto" | Se marca como falso positivo con razón en el ledger y se reporta. Descartar en silencio está prohibido. |
| "El humano igual no mira el diff, no hace falta que la rama esté limpia" | El humano no revisa código, sí prueba comportamiento: la rama que prueba tiene que ser la que se cierra, con todo commiteado y respaldado. |
| "Los commits por ola son ruido: los squasheo al cerrar" | No: son el historial del trabajo y la red de respaldo. Squashearlos reescribe lo que el humano ya probó y lo que está en `hd-backup/<trabajo>`. |
| "Pusheo la rama de trabajo para asegurarla" | El respaldo ya está en `hd-backup/<trabajo>`. La rama de trabajo la pushea `hd-close` automáticamente si es nueva; si no, espera autorización. |
| "El fix de la prueba humana lo commitea el cierre" | El fix se commitea en el momento: sin commit no hay respaldo ni evidencia de qué se probó, y la rama que se cierra tiene que ser la misma que se probó. |
| "El corrector ya arregló, no hace falta build" | El corrector es un agente: su verde no es evidencia. El build de la rama es barato y es el único que vale. |
