---
name: hd-review
description: Fases 3 y 4 del framework Hiper-driven (HD). Usar cuando todas las olas terminaron (mega cambio) o la implementación está lista (cambio chico). Un revisor distinto del que implementó audita cada ola por su parche guardado (secuencial, contra spec y plan), registra veredictos con evidencia en review-progress.md, corre un loop de correcciones en la rama con breaker de 5 rondas (checkpoint por ronda verificada) y adjudicación en el ledger, congela los commits del trabajo (uno por plan, sin colapsarlos) con el hash del árbol verificado, abre el gate humano de la fase 4 (con auditoría manual opcional vía hd-audit) y atiende los bugs que el humano reporte (correctores obligados a usar hd-debug).
---

# HD — Fase 3: Revisión y corrección + soporte a Fase 4

Esta fase es la que hace que el trabajo de un LLM sea **confiable**. No arranca hasta que TODAS las olas terminaron (mega) o la implementación está lista (chico). Vos orquestás; un **subagente revisor distinto del que implementó** audita.

## Ley de hierro de la evidencia

```
NINGÚN VEREDICTO NI AFIRMACIÓN DE ÉXITO SIN EVIDENCIA FRESCA EN ESTE TURNO.
```

- Todo veredicto cita la evidencia: la salida de tests que VOS corriste recién y el diff leído por el revisor. "Los tests pasaron en la ola" no es evidencia de la corrección de ahora.
- El revisor **lee** código y diffs; no ejecuta tests. Las corridas las hacés vos y viajan como archivo.

## Push de seguridad (respaldo remoto de cada commit)

Misma regla que en hd-implement: **cada commit verificado se sube al remoto si el trabajo corre en una rama dedicada creada para la implementación** (doble guarda: flag `push de seguridad: habilitado` en el spec + la rama actual no es la rama por defecto). Es un **respaldo, no una aprobación**: se sube aunque el test siga rojo. Nunca `--force`; si el push falla, anotá `Push: FALLIDO (<motivo>)` en el ledger, **seguí** con la revisión y reportalo en el cierre (hd-close).

**Durante la auditoría manual (hd-audit) no se pushea**: la rama se pone atrás a propósito para que el humano revise commit por commit, y el remoto ya tiene la cadena completa — un push forzado borraría el respaldo. Cuando hd-audit restaura la rama, el push sigue como antes.

## Qué se le habla al humano (y qué no)

**La revisión es un trabajo interno: no se narra.** El revisor es tu colega de trabajo, no su audiencia: veredictos, hallazgos y adjudicaciones van a `review-progress.md` y al ledger.

- El humano se entera en dos momentos, y solo en esos dos:
  1. **Freno real**: algo que **obliga a parar el trabajo y esperar su decisión** (un contrato roto que invalida las olas siguientes, una decisión arquitectónica con dos caminos válidos, un hallazgo que cambia el alcance). Ahí sí, y con detalle: qué pasó, qué falla, dónde y qué recomendás hacer.
  2. **Cierre**: el resumen final, con la sección de desviaciones que requieren su decisión.
- Todo lo demás —veredictos APROBADO/DENEGADO, conteos de tests, hallazgos ya corregidos, rulings ya adjudicados— **se escribe y no se dice**. Si no requiere una decisión del humano, no interrumpe.

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
- Este archivo **es** el informe de la revisión: **no se lo leas al humano durante la revisión**. Se entrega en el cierre.

## Paso 3 — Correcciones (loop con breaker)

- Unidad denegada → **subagente corrector directo en la rama de trabajo** (los cambios ya están consolidados ahí; no hay worktree que sobreviva), con los hallazgos concretos, **obligado a seguir `hd-debug`** (causa raíz primero, un cambio por hipótesis). Corrige; no rediseña ni agrega alcance. Como todo implementador: no ejecuta nada, no commitea — vos re-corres los tests de esa unidad y anexás la salida como evidencia.
- **Verde → commité el checkpoint de la ronda** (`hd(<trabajo>): plan NN — corrección ronda R`, o el plan en cambio chico) y anotá el SHA en el ledger. El loop dura hasta 5 rondas: ningún tramo se queda sin red, y todos estos commits **se quedan en la rama**: son parte de la traza que el humano audita. Cada checkpoint de ronda verificada también se sube con el **push de seguridad**, si corresponde.
- Re-revisá esa unidad y actualizá su bloque.

**Breaker — máximo 5 rondas de corrección por unidad:**
- Rondas 1-3: reanudá al corrector original (su contexto conoce el código y sus propias decisiones).
- Rondas 4-5: **agente nuevo** con el reporte de lo ya intentado ("un corrector anterior lo intentó N veces; ahora es tuyo") — un loop que sobrevive 3 reanudaciones suele significar que el agente no ve su propio problema.
- **Si la ronda 5 cierra con hallazgos abiertos, dejá de lanzar agentes y adjudicá vos**, hallazgo por hallazgo, con el spec como autoridad:
  - **Controvertible o falso positivo** → parkeado: `Ruling: <por qué el código se queda>` en el ledger.
  - **Real pero sin peso estructural** (nada downstream depende de eso) → parkeado como diferido, con razón escrita.
  - **Real y estructural** → definí el cambio mínimo que desbloquea, lanzá la corrección final, y registrá el ruling.
- **Toda adjudicación entra al ledger. Un descarte silencioso está prohibido** — esas decisiones las tomaste en nombre del humano y van a la lista final de hd-close.
- **Una adjudicación que frena el trabajo o cambia el alcance sí se le cuenta al humano en el momento** (freno real): contale qué se decidió, por qué y qué alternativas había. Las demás, al ledger.

## Paso 4 — Verificación final y congelación de los commits

Con todo en verde (o adjudicado), verificá el **estado final consolidado**:

1. Los cambios ya están en la rama (consolidados y commiteados plan por plan en hd-implement) — acá no se mergea nada nuevo.
2. Corré **el set de tests unitarios de todas las olas, en la rama**, como evidencia final fresca del estado completo (sigue prohibida la suite entera ajena al trabajo).
3. Revisá que el diff total (base → árbol de trabajo) no tenga archivos sueltos, restos de debug, ni nada fuera del spec.
4. **Congelá los commits del trabajo: NO se colapsan.** Los commits por plan (y los de corrección) **se quedan en la rama**, uno por plan: esa es la traza que el humano audita.
   a. Anotá en el ledger la lista completa: `Commits: <N> (base <sha> → HEAD <sha>)`, con el SHA y el plan de cada uno. Esa lista es el punto de partida de la auditoría manual (hd-audit).
   b. **Sacá la foto del contenido**: `git add -A && git write-tree` → anotá el hash; `git reset` para dejarlo sin stage otra vez. Ese hash es el que tiene que coincidir al final del trabajo.
   c. Verificá que `git status` está limpio: no queda nada sin commitear.
   d. Si el árbol tiene cambios sin commitear, no los aplanes ni los descartes: commitealos (`hd(<trabajo>): ajustes de revisión`), sumá ese SHA a la lista y subilo con el **push de seguridad**, si corresponde.

Resultado obligatorio: **todo presente, commiteado, con un commit por plan y la lista de SHAs en el ledger.** Nada se colapsa ni se aplana: la rama es la interfaz de revisión del humano, y el diff completo se lee igual (`git diff <base>..HEAD`) si lo prefiere.


## Paso 5 — Handoff al humano (Fase 4)

Avisá **breve**: qué se implementó (dos renglones), dónde están los artefactos (`.hd/<nombre-del-trabajo>/`), que el trabajo quedó **commiteado plan por plan** (un commit por plan, más los de corrección) y que ya está todo en la rama para probar el comportamiento y revisar a mano. **Sin el detalle plan por plan**: ese detalle existe, pero va al archivo y al resumen final.

**Preguntá UNA vez, acá:** *"¿Querés que te arme una guía para auditar el código commit por commit?"* (skill `hd-audit`).

- **Sí** → cargá la skill `hd-audit` vos mismo: arma `.hd/<nombre-del-trabajo>/audit-guia.md` con todos los commits del trabajo y las guías de restauración, y el humano audita a su ritmo. Cuando termine (apruebe o pida cambios), los commits vuelven a su lugar y seguís desde ahí.
- **No** → el humano prueba el comportamiento y aprueba (o deniega con el detalle) como siempre.


### Si el humano encuentra algo

**Subagente corrector NUEVO, directo en la rama, SIN worktree nuevo, obligado a seguir `hd-debug`.** Corregido → vos corré los tests involucrados (evidencia fresca) → **commiteá el arreglo** (`hd(<trabajo>): plan NN — corrección fase 4`) → **subilo** con el push de seguridad (si corresponde) → devolvéselo al humano. Los arreglos de la fase 4 **se commitean**: la traza por plan se mantiene y el humano puede auditar también la corrección. Recordá la regla de hd-debug: **3 fixes fallidos sobre el mismo problema = cuestionar la arquitectura con el humano, no un cuarto fix.**

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
| "El colapso es un detalle mecánico" | Ya no hay colapso: el trabajo queda commiteado plan por plan. Lo que sí importa es dejar anotados en el ledger el HEAD y la foto del árbol (`git write-tree`): sin eso, no se puede probar que no se perdió nada. |
| "Dejo los commits por ola, total el diff se ve igual" | Cada commit es un plan: el humano puede revisarlo por partes, y si quiere el todo, `git diff <base>..HEAD`. La traza por plan es justo lo que hace auditable el trabajo. |
| "El humano no pidió guía, no se la ofrezco" | La pregunta es UNA y es parte del handoff: la guía de `hd-audit` le ahorra reconstruir a mano qué commit hizo qué, y le da el mapa para devolver los commits a su lugar. |
| "Le paso el veredicto de cada plan, así va enterado" | Va enterado por el resumen final. El detalle por plan no requiere ninguna decisión suya: se escribe y no se dice. |
| "Durante la auditoría la rama quedó atrás, la pusheo para igualarla" | Durante la auditoría no se pushea: el remoto ya tiene la cadena completa y la rama está atrás a propósito. hd-audit la restaura y el push de seguridad sigue después. |
| "Un hallazgo importante hay que reportarlo ya" | Si no frena el trabajo, al ledger. Si frena el trabajo, ese es el freno real: ahí sí se habla, con qué falla, dónde y qué recomendás. |
