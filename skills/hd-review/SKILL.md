---
name: hd-review
description: Fases 3 y 4 del framework Hiper-driven (HD). Usar cuando todas las olas terminaron (mega cambio) o la implementación está lista (cambio chico). Un revisor distinto del que implementó audita cada ola por su parche guardado (secuencial, contra spec y plan), registra veredictos con evidencia en review-progress.md, corre un loop de correcciones en la rama con breaker de 5 rondas (checkpoint por ronda verificada) y adjudicación en el ledger, colapsa todos los commits del trabajo a un único diff sin stage (reset --mixed a la base, con el hash del árbol verificado antes y después) para la aprobación humana, y atiende los bugs que el humano reporte (correctores obligados a usar hd-debug).
---

# HD — Fase 3: Revisión y corrección + soporte a Fase 4

Esta fase es la que hace que el trabajo de un LLM sea **confiable**. No arranca hasta que TODAS las olas terminaron (mega) o la implementación está lista (chico). Vos orquestás; un **subagente revisor distinto del que implementó** audita.

## Ley de hierro de la evidencia

```
NINGÚN VEREDICTO NI AFIRMACIÓN DE ÉXITO SIN EVIDENCIA FRESCA EN ESTE TURNO.
```

- Todo veredicto cita la evidencia: la salida de tests que VOS corriste recién y el diff leído por el revisor. "Los tests pasaron en la ola" no es evidencia de la corrección de ahora.
- El revisor **lee** código y diffs; no ejecuta tests. Las corridas las hacés vos y viajan como archivo.

## Paso 1 — Auditoría secuencial

Lanzá el revisor con contexto completo por **rutas de archivo** (spec, plan, y el parche de cada unidad), nunca historia pegada en el prompt. Analizá las unidades **de a una, en orden, nunca en paralelo** (los hallazgos de una iluminan a la siguiente).

**La unidad de revisión es la ola/plan**, no el worktree: los worktrees ya fueron borrados al consolidar cada ola (hd-implement), y sus parches quedaron en `.hd/<nombre-del-trabajo>/waves/ola<N>-<plan>.patch`. El revisor audita esos parches contra la rama consolidada. En cambio chico, la unidad es el plan único (diff de la rama).

El revisor busca, contra spec y plan:

1. **Vulnerabilidades y huecos de seguridad**: inyecciones, secretos expuestos, validaciones faltantes, auth esquivable.
2. **Bugs lógicos**: condiciones borde, flujos incompletos, errores silenciados.
3. **Trampas del lenguaje y librerías**: concurrencia mal manejada, recursos sin cerrar, errores típicos del stack (p. ej. spawn de greenlets en Python/gevent, contexto async perdido, transacciones sin cerrar).
4. **Desviaciones**: todo lo implementado debe trazarse al spec y a un plan; todo lo prometido debe estar implementado. Lo que sobre y lo que falte se reporta.
5. **Calidad de tests**: existen, llaman al código real, fijan el comportamiento del plan (no triviales, no solo happy path).

## Paso 2 — Veredictos con evidencia

`.hd/<nombre-del-trabajo>/review-progress.md` (template empaquetado en esta skill, `templates/review-progress-template.md`):

- Un bloque por unidad (ola/plan), en orden de revisión, con veredicto **APROBADO** o **DENEGADO** y **el porqué** concreto — no un "LGTM".
- Denegado incluye: qué debe corregirse para pasar a verde, punto por punto.

## Paso 3 — Correcciones (loop con breaker)

- Unidad denegada → **subagente corrector directo en la rama de trabajo** (los cambios ya están consolidados ahí; no hay worktree que sobreviva), con los hallazgos concretos, **obligado a seguir `hd-debug`** (causa raíz primero, un cambio por hipótesis). Corrige; no rediseña ni agrega alcance. Como todo implementador: no ejecuta nada, no commitea — vos re-corres los tests de esa unidad y anexás la salida como evidencia.
- **Verde → commité el checkpoint de la ronda** (`hd(<trabajo>): ola N — corrección ronda R`, o el plan en cambio chico) y anotá el SHA en el ledger. El loop dura hasta 5 rondas: ningún tramo se queda sin red, y todos estos commits se colapsan igual al final.
- Re-revisá esa unidad y actualizá su bloque.

**Breaker — máximo 5 rondas de corrección por unidad:**
- Rondas 1-3: reanudá al corrector original (su contexto conoce el código y sus propias decisiones).
- Rondas 4-5: **agente nuevo** con el reporte de lo ya intentado ("un corrector anterior lo intentó N veces; ahora es tuyo") — un loop que sobrevive 3 reanudaciones suele significar que el agente no ve su propio problema.
- **Si la ronda 5 cierra con hallazgos abiertos, dejá de lanzar agentes y adjudicá vos**, hallazgo por hallazgo, con el spec como autoridad:
  - **Controvertible o falso positivo** → parkeado: `Ruling: <por qué el código se queda>` en el ledger.
  - **Real pero sin peso estructural** (nada downstream depende de eso) → parkeado como diferido, con razón escrita.
  - **Real y estructural** → definí el cambio mínimo que desbloquea, lanzá la corrección final, y registrá el ruling.
- **Toda adjudicación entra al ledger. Un descarte silencioso está prohibido** — esas decisiones las tomaste en nombre del humano y van a la lista final de hd-close.

## Paso 4 — Verificación final y colapso de los commits

Con todo en verde (o adjudicado), verificá el **estado final consolidado**:

1. Los cambios ya están en la rama (consolidados y commiteados ola por ola en hd-implement) — acá no se mergea nada nuevo.
2. Corré **el set de tests unitarios de todas las olas, en la rama**, como evidencia final fresca del estado completo (sigue prohibida la suite entera ajena al trabajo).
3. Revisá que el diff total (base → árbol de trabajo) no tenga archivos sueltos, restos de debug, ni nada fuera del spec.
4. **Colapsá los commits del trabajo** (un colapso por repo, cada uno a su `commit base` del spec). Los checkpoints por ola fueron andamiaje: el humano revisa un diff, no un historial.
   a. **Anotá `git rev-parse HEAD` en el ledger ANTES de tocar nada** (`Colapso: HEAD previo <sha>`): es la única puerta de vuelta a los checkpoints por ola. Un `reset` sin ese SHA anotado es trabajo que se va con el reflog.
   b. **Sacá la foto del contenido**: `git add -A && git write-tree` → anotá el hash; `git reset` para dejarlo sin stage otra vez.
   c. `git reset --mixed <commit base>` → los commits del trabajo desaparecen de la rama y **todos los cambios quedan en el árbol de trabajo, sin stage** (el reset mueve HEAD y el índice; no toca un solo archivo).
   d. **Repetí la foto y comprobá que es idéntica** (`git add -A && git write-tree` → `git reset`): mismo hash antes y después = el colapso no cambió ni un byte. Sin esa comparación, "no se perdió nada" es una afirmación sin respaldo. Los dos hashes van al ledger.
   e. Ledger: `Colapso: N commits → diff único sin stage (HEAD previo <sha>: recuperable con git reset --hard <sha>, descarta lo no commiteado)`.
Resultado obligatorio: **todo presente, SIN STAGE y SIN COMMITS del trabajo por encima de la base.** El diff único sin stage ES la interfaz de revisión del humano.

## Paso 5 — Handoff al humano (Fase 4)

Avisá: qué se implementó (resumen por plan/ola), dónde están los artefactos (`.hd/<nombre-del-trabajo>/`), que **los checkpoints por ola ya fueron colapsados** y que todo quedó **sin stage, como un diff único, para probar comportamiento y revisar a mano** (el SHA previo al colapso queda en el ledger por si querés volver a esa historia).

### Si el humano encuentra algo

**Subagente corrector NUEVO, directo en la rama, SIN worktree nuevo, obligado a seguir `hd-debug`.** Corregido → vos corré los tests involucrados (evidencia fresca) → devolvéselo al humano, otra vez todo sin stage. Los arreglos de la fase 4 **no se commitean**: el humano está revisando ese mismo diff y quien commitea es hd-close, al final. Recordá la regla de hd-debug: **3 fixes fallidos sobre el mismo problema = cuestionar la arquitectura con el humano, no un cuarto fix.**

## Salida

- El humano dice explícitamente que está todo bien → **cargá la skill `hd-close` VOS MISMO y ejecutá la fase 5** (sin esperar a que la invoquen).
- La fase 4 SÍ es una pausa: entre tu handoff y el veredicto del humano no avanzás. Pero una vez que dice "todo bien", el pase a hd-close es automático — no otro anuncio huérfano.
- Nunca avances por inercia ni porque "los tests pasan": la aprobación es del humano.

## Racionalizaciones comunes (y su realidad)

| Excusa | Realidad |
|--------|----------|
| "Casi conforme con el spec" | Casi = no conforme. Se corrige, o se adjudica en el breaker. Esas son las únicas dos salidas. |
| "Una ronda más y converge" | Pasado el breaker, las rondas no convergen: la falla es estructural. Adjudicá. |
| "Este hallazgo es obviamente falso, lo descarto" | Adjudicar es decidir con razón escrita en el ledger. Descartar en silencio está prohibido. |
| "La corrección fue chica, salteo la re-revisión" | Las correcciones no revisadas son como entran las regresiones. |
| "Las revisiones enlentecen" | El loop sin revisiones es churn no verificado. Las revisiones son los frenos y la dirección. |
| "Reviso las olas en paralelo, es más rápido" | Secuencial. El hallazgo de la ola 1 muchas veces ES la explicación de la ola 2. |
| "El colapso es un detalle mecánico" | Colapsar sin comparar el hash del árbol antes y después es la única forma de perder trabajo en silencio; y sin el HEAD previo anotado, los checkpoints por ola se van con el reflog. |
| "Dejo los commits por ola, total el diff se ve igual" | La interfaz de revisión es un diff, no un historial: commits sin colapsar hacen que el humano revise por partes lo que se pensó como un todo. |
