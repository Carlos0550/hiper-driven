---
name: hd-review
description: Fase 4 del framework Hiper-driven (HD). La conduce el agente principal cuando todas las olas están cerradas. Un auditor de cierre independiente audita el diff completo contra el spec, el technical spec, los planes y el prototipo; se hace UNA corrección de cierre con un subagente fixer y el auditor confirma. Después el cliente prueba el comportamiento contra los criterios de aceptación. Si aprueba, se carga hd-close. Si el cliente reporta un bug chico o pide un cambio, se invoca hd-fast-implement automáticamente. El auditor es obligatorio en todos los modos. No hay tests.
---

# HD — Fase 4: Auditoría de cierre y prueba del cliente

Esta fase es la que hace que el trabajo de un LLM sea **confiable**. No arranca hasta que TODAS las olas están cerradas. Vos, el **agente principal**, orquestás; un **auditor de cierre independiente** —que no implementó, no revisó y no corrigió ninguna ola— audita el trabajo completo. La corrección de cierre es **una sola**. Después, el cliente prueba el comportamiento.

> **Sin tests, esta fase no es un lujo: es la última lectura semántica del trabajo.** El build y el lint dicen que el código está bien formado; el auditor dice si el trabajo completo hace lo que el spec promete. Por eso entra **siempre**, en todos los modos.

> **Sin loop de auditoría.** No hay rondas automáticas. Se audita, se juntan todos los hallazgos y se corrige una vez. Si no alcanza, se reporta al cliente con diagnóstico: la segunda ronda es una decisión suya, no un automatismo.

**El agente principal no escribe código de producción.** El fix de cierre lo hace un **subagente fixer**; el agente principal consolida, commitea y corre la evidencia.

## Qué se le habla al cliente (y qué no)

**La auditoría es un trabajo interno: no se narra.** El auditor es un colega, no la audiencia del cliente: veredictos, hallazgos y correcciones van a `review-progress.md` y al ledger.

El cliente se entera en dos momentos (y en las preguntas directas que haga):

1. **Freno real**: un contrato roto, una decisión arquitectónica con dos caminos válidos, o el trabajo que quedó rojo después de la corrección de cierre.
2. **Final**: la entrega para que pruebe el comportamiento y, después del OK, el resumen de cierre.

## Ley de hierro de la evidencia

```
NINGÚN VEREDICTO NI AFIRMACIÓN DE ÉXITO SIN EVIDENCIA FRESCA EN ESTE TURNO.
```

- Todo veredicto cita la evidencia: la salida de build + lint + estándares que corriste vos y el diff que leyó el auditor.
- El auditor **lee** código y diffs; no ejecuta builds ni modifica nada. Las corridas las hacés vos y viajan como archivo.
- **La autoverificación del subagente no es evidencia.** Un worktree que compiló no prueba el árbol consolidado.

## Respaldo temporal

Misma regla que en hd-implement: **cada commit verificado se sube a `hd-backup/<trabajo>`** si el spec dice `Respaldo: habilitado` y la rama actual no es la default. Es temporal: `hd-close` lo borra al cerrar. Nunca `--force`; si el push falla, anotá `Push: FALLIDO (<motivo>)`, seguí y reportalo en el cierre.

El commit de la corrección de cierre también se respalda ahí. La rama de trabajo **no** se pushea automáticamente: solo en el cierre, y solo si es nueva.

## Paso 0 — Estado de cierre

Antes de auditar, verificá que el trabajo esté realmente cerrado:

- Todas las olas de `waves.md` en estado `cerrada`, con commit, gate y revisión.
- Worktrees del trabajo eliminados (`git worktree list`).
- Rama limpia: solo pueden quedar artefactos `.hd/` sin commitear.
- `.hd/<trabajo>/` actualizado: `ledger.md`, `waves.md`, `review-progress.md` (usá `templates/review-progress-template.md` para el bloque de cierre).
- Respaldo al día si está habilitado.

Si algo no está cerrado, **no audites**: volvé a la ola que falta o frená.

## Paso 1 — La auditoría de cierre

Lanzá un `auditor-final` independiente. No participó de ninguna ola: no implementó, no revisó, no corrigió, no es el agente principal. **Su veredicto es para el cliente**, no para vos: no lo orientes hacia un resultado.

Pasale por **rutas**, no por contenido:

- `spec.md`, `technical_spec.md`, `plans/`, `prototype/`;
- `waves.md`, `review-progress.md`, `ledger.md`;
- el diff de código completo: `git diff <base>..HEAD -- . ':(exclude).hd'` guardado en `.hd/<trabajo>/logs/cierre-diff.patch` (o los SHAs de cada ola);
- la evidencia de gate de cada ola y la salida fresca de build + lint + estándares que corriste vos.

El auditor busca:

1. **Alcance**: todo lo que el spec y los planes prometen está implementado; nada de lo que está implementado queda fuera del spec. Lo que sobra y lo que falta se reporta.
2. **Coherencia entre olas**: contratos consistentes, sin duplicación, sin código muerto, sin integraciones a medias, sin deuda que una ola dejó a la siguiente.
3. **Comportamiento**: ¿el trabajo completo cumple los criterios de aceptación y el `Comportamiento esperado` de cada plan, con entradas, salidas, casos borde y errores? **Esto reemplaza a los tests.**
4. **Prototipo**: si hay UI, ¿la implementación respeta los flujos, estados, componentes y validaciones aprobados?
5. **Seguridad, lógica y trampas**: inyecciones, secretos, validaciones faltantes, auth esquivable, concurrencia, recursos sin cerrar, errores silenciados, errores típicos del stack.
6. **Estándares y calidad**: convenciones del repo, manejo de errores, duplicación evitable, complejidad innecesaria, dependencias nuevas sin justificar, restos de debug, tests agregados (prohibido).
7. **Artefactos vs realidad**: el spec, el technical spec y los planes describen lo que se hizo; las enmiendas están aprobadas por el cliente; los rulings están registrados; el review-progress está completo.
8. **Evidencia**: cada ola tiene gate y revisión; los commits existen; el respaldo está al día; no hay worktrees ni cambios sueltos.
9. **Independencia**: el auditor no participó de ninguna ola y no tiene conflicto con el resultado.

Veredicto **APROBADO** o **DENEGADO** en `review-progress.md`, bloque `Auditoría de cierre`, con hallazgos por archivo:línea, severidad, clasificación (código / estándares / contrato / infra) y qué falta para pasar a verde. Nada de "LGTM".

## Paso 2 — Corrección de cierre (una sola)

- **Un solo subagente fixer**, en un worktree desde el HEAD de la rama, con **todos** los hallazgos del auditor en un mismo prompt: archivo, comportamiento esperado, qué falló, clasificación. Reporta en `.hd/<trabajo>/reports/fixer-cierre.md` del repo principal.
- **Obligado a seguir `hd-debug`**: causa raíz primero, un cambio por hipótesis. Corrige; no rediseña, no agrega alcance, no escribe tests.
- **Guarda de alcance por hallazgo**: un hallazgo, un cambio. Si el hallazgo revela un problema más grande, se anota y se reporta; no se expande.
- Como todo implementador: **se autoverifica en su worktree, no commitea**. Vos consolidás (`cherry-pick -n` + commit), corrés **build + lint + estándares** en la rama y anexás la salida como evidencia.
- Commit `hd(<trabajo>): corrección de auditoría de cierre`, respaldo, y pedile al auditor **una confirmación acotada a los hallazgos**, no una re-auditoría completa.
- **Una sola pasada.** Si sigue denegado o el gate queda rojo, **freno real** con reporte al cliente. No hay segunda ronda automática.

**El agente principal no escribe el fix.** Si el arreglo parece "de una línea", igual va a un subagente fixer: el agente principal integra, commitea y verifica.

## Paso 3 — Verificación final

Con todo en verde (o adjudicado), verificá el **estado final consolidado**:

1. Los cambios están en la rama, consolidados y commiteados ola por ola. **No los colapses ni los squashees**: son el historial del trabajo y el respaldo en `hd-backup/<trabajo>`.
2. Corré **build + lint + estándares en la rama**, como evidencia final fresca del estado completo. Nada de "ya corrió en cada ola": la última corrida es la que se reporta.
3. Revisá que el diff total (`git diff <base>..HEAD`) no tenga archivos sueltos, restos de debug, tests agregados ni nada fuera del spec.
4. Ledger: `Auditoría: APROBADO; evidencia final: build <resultado>, lint <resultado>, estándares <resultado>`.

## Paso 4 — Entrega al cliente (prueba de comportamiento)

Avisá **breve**: qué se implementó (dos renglones), dónde están los artefactos, cómo se corre y que el historial quedó **como commits por ola** (no se colapsa).

Pasale **los criterios de aceptación del spec como checklist**: sin tests, la prueba del cliente es la verificación final de comportamiento, y la checklist es lo que la vuelve verificable en vez de "mirá si anda".

La prueba es **de comportamiento, no de código**: el cliente no revisa el diff (eso ya lo hizo el auditor); valida que el sistema haga lo que el spec promete. No le pidas que audite el código ni commit por commit.

Si hay UI, decile cómo abrir el prototipo para comparar y qué flujos mirar. Si hay datos o migraciones, decile qué se aplicó y en qué entorno.

### Si el cliente encuentra algo

Clasificá el pedido:

- **Si entra en la vía rápida** —un solo cambio coherente, sin deploy/secretos/CI/generados, describible en dos o tres frases—, **cargá `hd-fast-implement` automáticamente**. La vía rápida trabaja sobre esta misma rama, hace sus tres fases (preguntas con contexto, implementación por un subagente, auditoría por un subagente) y commitea. No lances el fixer ni el `auditor-final` de HD para ese cambio. Registrá los SHAs en el bloque "Prueba del cliente" de `review-progress.md` y devolvé el trabajo al cliente para que vuelva a probar.
- **Si es grande, mezcla objetivos, toca contratos/datos/deploy o es un alcance nuevo**, seguí con el camino HD. Si es un trabajo nuevo, volvé a discovery.

**Camino HD — subagente fixer nuevo, en un worktree desde la rama, obligado a seguir `hd-debug`.** Reporta en `.hd/<trabajo>/reports/fixer-cliente.md` del repo principal. Corregido → el agente principal consolida, corre build + lint + estándares (evidencia fresca), reproduce el caso reportado y **commitea el fix** (`hd(<trabajo>): corrección del cliente`), con su respaldo en `hd-backup/<trabajo>`. El fix vuelve al `auditor-final` para una **confirmación acotada al hallazgo**; después se lo devolvés al cliente. La rama que prueba el cliente es la que se cierra: nada queda sin commitear. Recordá la regla de `hd-debug`: **3 fixes fallidos sobre el mismo problema = cuestionar la arquitectura con el cliente**, no un cuarto fix. En la vía rápida, la regla de 3 fixes es la de `hd-fast-implement`; en el camino HD, la de `hd-debug`.

## Salida

- El cliente dice explícitamente que está todo bien → **cargá la skill `hd-close` VOS MISMO y ejecutá la fase 5** (sin esperar a que la invoquen).
- Los commits de la vía rápida (`hd-fast: ...`) se conservan y el cierre los lista. Si hubo cambios fast, corré su cierre estático (build + lint + estándares) antes de `hd-close`.
- La prueba del cliente SÍ es una pausa: entre tu entrega y su veredicto no avanzás. Una vez que dice "todo bien", el pase a hd-close es automático.
- Nunca avances por inercia ni porque "compila": la aprobación es del cliente, después de probar.

## Racionalizaciones comunes (y su realidad)

| Excusa | Realidad |
|---|---|
| "Una ronda más y converge" | No hay ronda 2: si no converge, el diagnóstico está mal o el problema es estructural. Se reporta. |
| "Re-audito la corrección para estar seguro" | La corrección se valida con build + lint + estándares frescos, la reproducción del hallazgo y una confirmación acotada. Re-auditar todo es el loop que hizo impredecible la fase. |
| "El auditor lo lanza el agente principal, puede ser benévolo" | El auditor no participó de ninguna ola y su veredicto es para el cliente. Si participó, no es auditor. |
| "Sin tests el auditor no tiene contra qué comparar" | Tiene el spec, el technical spec, los planes y su `Comportamiento esperado` en prosa. Ese texto es el oráculo. |
| "En directo son dos archivos, no hace falta auditor" | Sin tests es la única lectura del trabajo completo. La excepción por tamaño es el atajo que hunde el framework. |
| "Pasa el lint, entonces está aprobado" | El lint no lee intención. Aprobar por lint verde es aprobar sin revisar. |
| "Casi conforme con el spec" | Casi = residual. Se reporta con diagnóstico; no hay ronda 2. |
| "Este hallazgo es obviamente falso, lo descarto" | Se marca como falso positivo con razón en el ledger y se reporta. Descartar en silencio está prohibido. |
| "El cliente igual no mira el diff, no hace falta que la rama esté limpia" | El cliente no revisa código, sí prueba comportamiento: la rama que prueba tiene que ser la que se cierra, con todo commiteado y respaldado. |
| "Los commits por ola son ruido: los squasheo al cerrar" | No: son el historial del trabajo y la red de respaldo. Squashearlos reescribe lo que el cliente ya probó. |
| "Pusheo la rama de trabajo para asegurarla" | El respaldo ya está en `hd-backup/<trabajo>`. La rama la pushea `hd-close` si es nueva; si no, espera autorización. |
| "El fix del cliente lo commitea el cierre" | El fix se commitea en el momento: sin commit no hay respaldo ni evidencia de qué se probó. |
| "El fixer ya arregló, no hace falta build" | El fixer es un subagente: su verde no es evidencia. El gate de la rama es el único que vale. |
| "El agente principal puede hacer el fix, total es chico" | No: el código lo escriben subagentes. El agente principal consolida, commitea y corre la evidencia. |
