---
name: hd-review
description: Fases 3 y 4 del framework Hiper-driven (HD). Usar cuando todas las olas terminaron. Un revisor distinto audita cada ola por su parche guardado (código + tests, secuencial, contra spec y plan), registra veredictos con evidencia en review-progress.md, corre UNA sola corrección total con hd-debug obligatorio y verifica con tests frescos. Si no alcanza, reporta al humano con diagnóstico en vez de abrir otra ronda. Después colapsa todos los commits del trabajo a un único diff sin stage para la aprobación humana, y atiende los bugs que el humano reporte.
---

# HD — Fase 3: Revisión, corrección única y colapso

Esta fase es la que hace que el trabajo de un LLM sea **confiable**. No arranca hasta que TODAS las olas terminaron. Vos orquestás; un **subagente revisor distinto del que implementó** audita. La corrección es **una sola** para todo el trabajo.

> **Sin loop de revisión.** No hay 5 rondas por unidad ni re-revisión después de cada corrección. Se audita, se juntan todos los hallazgos y se corrige una vez. Si no alcanza, se reporta al humano con diagnóstico: la segunda ronda es una decisión suya, no un automatismo.

## Qué se le habla al humano (y qué no)

**La revisión es un trabajo interno: no se narra.** El revisor es tu colega de trabajo, no su audiencia: veredictos, hallazgos y correcciones van a `review-progress.md` y al ledger.

- El humano se entera en dos momentos, y solo en esos dos:
  1. **Freno real**: un contrato roto, una decisión arquitectónica con dos caminos válidos, o **el trabajo que quedó rojo después de la corrección única**.
  2. **Cierre**: el resumen final, con la sección de desviaciones que requieren su decisión.
- Todo lo demás —veredicto APROBADO/DENEGADO, hallazgos ya corregidos, conteos de tests— **se escribe y no se dice**.

## Ley de hierro de la evidencia

```
NINGÚN VEREDICTO NI AFIRMACIÓN DE ÉXITO SIN EVIDENCIA FRESCA EN ESTE TURNO.
```

- Todo veredicto cita la evidencia: la salida de tests que VOS corriste recién y el diff leído por el revisor. "Los tests pasaron en la ola" no es evidencia de la corrección de ahora.
- El revisor **lee** código y diffs; no ejecuta tests. Las corridas las hacés vos y viajan como archivo.

## Push de seguridad (rama de respaldo)

Misma regla que en hd-implement: **cada commit verificado se sube a `hd-backup/<trabajo>`** si el spec dice `push de seguridad: habilitado` y la rama actual no es la default. Es un **respaldo, no una aprobación**. Nunca `--force`; si el push falla, anotá `Push: FALLIDO (<motivo>)`, seguí y reportalo en el cierre.

El commit de la corrección única también se respalda ahí antes del colapso. La rama de trabajo **no** se pushea: se colapsa y se commitea recién en el cierre, con autorización.

## Paso 1 — Auditoría por ola

Lanzá el revisor con contexto completo por **rutas de archivo** (spec, planes, y los parches de la ola: código y tests, más los reportes de implementación y de tests), nunca historia pegada en el prompt. Analizá las olas **de a una, en orden, nunca en paralelo** (los hallazgos de una iluminan a la siguiente).

**La unidad de revisión es la ola**, no el plan ni el worktree: los worktrees ya fueron borrados al consolidar cada ola, y sus parches quedaron en `.hd/<nombre-del-trabajo>/waves/ola<N>-<plan>.patch` y `...-tests.patch`. En cambio chico, la unidad es el plan único.

El revisor busca, contra spec y plan:

1. **Vulnerabilidades y huecos de seguridad**: inyecciones, secretos expuestos, validaciones faltantes, auth esquivable.
2. **Bugs lógicos**: condiciones borde, flujos incompletos, errores silenciados.
3. **Trampas del lenguaje y librerías**: concurrencia mal manejada, recursos sin cerrar, errores típicos del stack.
4. **Desviaciones**: todo lo implementado debe trazarse al spec y a un plan; todo lo prometido debe estar implementado. Lo que sobre y lo que falte se reporta.
5. **Calidad de tests**: existen, llaman al código real, fijan el comportamiento del plan (no triviales, no solo happy path). En Flujo B, además: que el test se haya escrito desde el `Contrato de comportamiento` y no desde la implementación (sin importar internals ni replicar la estructura del código).

## Paso 2 — Veredictos con evidencia

`.hd/<nombre-del-trabajo>/review-progress.md` (template empaquetado en esta skill, `templates/review-progress-template.md`):

- Un bloque por ola, con veredicto **APROBADO** o **DENEGADO** y el porqué concreto — no un "LGTM".
- Denegado incluye: qué debe corregirse para pasar a verde, punto por punto.
- Los hallazgos se agrupan por plan cuando la ola tiene varios.

## Paso 3 — Corrección única

- **Un solo subagente corrector**, directo en la rama de trabajo, sin worktree nuevo, con **todos los hallazgos de todas las olas en un mismo prompt**: archivo, comportamiento esperado, qué falló y la clasificación (código / test / infra).
- **Obligado a seguir `hd-debug`**: causa raíz primero, un cambio por hipótesis. Corrige; no rediseña ni agrega alcance.
- Como todo implementador: **no ejecuta nada, no commitea** — vos corrés los tests y anexás la salida como evidencia.
- **Guarda de alcance por hallazgo**: si el hallazgo es de **código**, el corrector no toca los tests; si es de **test**, no toca el código de producción. Nunca los dos para el mismo hallazgo. Un test mal escrito se corrige contra el plan, no se debilita ni se borra.
- **Una sola pasada**: no hay ronda 2 automática.

**Verificación de la corrección (vos):**

1. Corré los tests que fallaban + el set de tests de todas las olas.
2. **Verde** → commit `hd(<trabajo>): corrección única`, push a `hd-backup/<trabajo>`, ledger `Corrección única (verde — <sha>)` → Paso 4.
3. **Rojo** → **no hay segunda ronda**. Re-triageá el residual y escribí el **reporte al humano**:
   - qué se implementó (dos renglones);
   - los fallos conocidos del baseline que se ignoraron;
   - cada fallo residual, con nombre, esperado vs actual y diagnóstico (test mal / código mal / infra / estructural);
   - qué se intentó y por qué no alcanzó;
   - qué recomendás: corregir (una nueva tarea acotada, autorizada por él) o ignorar (ruling).
   
   Esto es un **freno real**: el trabajo se detiene y espera su decisión.

## Paso 4 — Verificación final y colapso

Con todo en verde (o adjudicado), verificá el **estado final consolidado**:

1. Los cambios ya están en la rama, consolidados y commiteados ola por ola.
2. Corré **el set de tests unitarios de todas las olas, en la rama**, como evidencia final fresca del estado completo. No la suite entera ajena al trabajo.
3. Revisá que el diff total (base → árbol de trabajo) no tenga archivos sueltos, restos de debug, ni nada fuera del spec.
4. **Colapsá los commits del trabajo** (un colapso por repo, cada uno a su `commit base` del spec). Los checkpoints por ola fueron andamiaje: el humano revisa un diff, no un historial.
   a. **Anotá `git rev-parse HEAD` en el ledger ANTES de tocar nada** (`Colapso: HEAD previo <sha>`). También está en `hd-backup/<trabajo>`: esa rama es la red de seguridad.
   b. **Sacá la foto del contenido**: `git add -A && git write-tree` → anotá el hash; `git reset` para dejarlo sin stage otra vez.
   c. `git reset --mixed <commit base>` → los commits del trabajo desaparecen de la rama y **todos los cambios quedan en el árbol de trabajo, sin stage**.
   d. **Repetí la foto y comprobá que es idéntica** (`git add -A && git write-tree` → `git reset`): mismo hash antes y después = el colapso no cambió ni un byte. Los dos hashes van al ledger.
   e. Ledger: `Colapso: N commits → diff único sin stage (HEAD previo <sha>; respaldo en hd-backup/<trabajo>)`.
   
   Resultado obligatorio: **todo presente, SIN STAGE y SIN COMMITS del trabajo por encima de la base.** El diff único sin stage ES la interfaz de revisión del humano.

## Paso 5 — Handoff al humano (Fase 4)

Avisá **breve**: qué se implementó (dos renglones), dónde están los artefactos, que los checkpoints por ola ya fueron colapsados y que todo quedó **sin stage, como un diff único**, para probar el comportamiento y revisar a mano. **Sin el detalle plan por plan.**

**No ofrezcas una guía de auditoría commit por commit**: no hay commits por plan; la interfaz es el diff.

### Si el humano encuentra algo

**Subagente corrector NUEVO, directo en la rama, obligado a seguir `hd-debug`.** Corregido → vos corré los tests involucrados (evidencia fresca) → devolvéselo al humano, otra vez **sin stage**. Los arreglos de la fase 4 **no se commitean**: el humano está revisando ese mismo diff y quien commitea es `hd-close`, al final. Recordá la regla de hd-debug: **3 fixes fallidos sobre el mismo problema = cuestionar la arquitectura con el humano**, no un cuarto fix.

## Salida

- El humano dice explícitamente que está todo bien → **cargá la skill `hd-close` VOS MISMO y ejecutá la fase 5** (sin esperar a que la invoquen).
- La fase 4 SÍ es una pausa: entre tu handoff y el veredicto del humano no avanzás. Una vez que dice "todo bien", el pase a hd-close es automático.
- Nunca avances por inercia ni porque "los tests pasan": la aprobación es del humano.

## Racionalizaciones comunes (y su realidad)

| Excusa | Realidad |
|--------|----------|
| "Una ronda más y converge" | No hay ronda 2: si no converge, el diagnóstico está mal o el problema es estructural. Se reporta. |
| "Re-reviso la corrección para estar seguro" | La corrección se valida con tests frescos y el diff de la corrección. Re-revisar todo es el loop que hizo impredecible la fase. |
| "Reviso plan por plan, es más fino" | La unidad es la ola. Los planes ya están agrupados por afinidad y sus parches se auditan juntos. |
| "Casi conforme con el spec" | Casi = residual. Se reporta con diagnóstico; no hay ronda 2. |
| "Este hallazgo es obviamente falso, lo descarto" | Se marca como falso positivo con razón en el ledger y se reporta. Descartar en silencio está prohibido. |
| "Corrijo el test para que pase" | Si el hallazgo es de código, no se toca el test; si es de test, no se toca el código. Debilitar el test es hacer pasar el problema. |
| "El colapso es un detalle mecánico" | Colapsar sin comparar el hash del árbol antes y después es la única forma de perder trabajo en silencio; sin el HEAD previo anotado, los commits se van con el reflog. |
| "Dejo los commits por ola, total el diff se ve igual" | La interfaz de revisión es un diff, no un historial: commits sin colapsar hacen que el humano revise por partes lo que se pensó como un todo. |
| "Pusheo la rama de trabajo para asegurarla" | El respaldo ya está en `hd-backup/<trabajo>`. La rama de trabajo se pushea en el cierre, con autorización. |
| "El test lo escribió otro agente, seguro es independiente" | Independiente del implementador, no del plan. Si el test contradice el contrato de comportamiento, es un hallazgo del test. |
