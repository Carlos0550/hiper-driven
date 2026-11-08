# Hiper-driven (HD)

**HD** es un framework de trabajo para agentes de IA basado en dos pilares:

- **SDD — Spec Driven Development**: ningún código se escribe sin un spec que diga *qué*, *por qué* y *cómo se valida*.
- **Verificación en dos capas**. **Estática**: un cambio no está listo si no **compila** limpio y no **cumple los estándares de buenas prácticas** del repo (lint, formato, convenciones, manejo de errores). **Semántica**: lo que el compilador y el linter no pueden ver lo audita un **revisor independiente y obligatorio** contra el spec. **No hay tests**: no se escriben, no se piden y no se aceptan.

El objetivo de HD es simple: **poder confiar en un trabajo hecho 100% por un LLM**. Sin tests, esa confianza no viene de la fe, viene del proceso: specs versionados, planes chicos, diffs chicos que compilan y respetan las convenciones, revisión obligatoria del spec y de cada ola, y prueba humana del comportamiento antes de cerrar. Todo lo que se saca de la red automática de pruebas se compensa con barreras más firmes: **los revisores nunca son opcionales** y el gate estático no se negocia.

---

## Los caminos: spike, directo, cambio chico y mega cambio

Casi todo trabajo entra por una de estas cuatro puertas. El usuario normalmente declara el modo explícito; si no lo hace, **el agente decide y anuncia el modo**, porque de eso depende la calidad del trabajo.

**Spike** (validación): una pregunta de factibilidad o una idea que se está sondeando ("¿se puede…?", "¿qué tal si…?"). Su salida es **una recomendación fundamentada, no código**: nace y muere en `hd-discovery`. Si la respuesta convence, la implementación es un trabajo nuevo que entra por directo, chico o mega.

**Regla del ratchet (unidireccional):** si a mitad de camino aparece complejidad oculta, el trabajo **sube** de categoría (directo → chico → mega). Nada baja de categoría una vez clasificado: "ya casi está" no es un argumento, es una alarma.

| | Directo | Cambio chico | Mega cambio |
|---|---|---|---|
| Señales típicas | 1-2 archivos, sin contratos nuevos, sin datos | Unas pocas piezas acotadas, sin tocar contratos ni datos en masa | Refactor masivo, módulos enteros, contratos compartidos, datos sensibles o en masa |
| Spec | Breve | Breve | `spec.md` completo |
| Planes | Uno, mínimo | Uno solo | Varios, **default un plan por ola** |
| Implementación | Un worktree, un implementador | Un worktree, un implementador | Implementadores por ola en un worktree compartido |
| Verificación | Build + lint + estándares | Build + lint + estándares | Build + lint + estándares por ola |
| Revisión | **Revisor obligatorio** | **Revisor obligatorio** + una corrección simple | Auditoría por ola + **una corrección única** |
| Datos en producción | No aplica: si toca datos, sube a mega | Preguntar si aplica | Preguntar siempre; ola de datos al final, nunca en paralelo, con respaldo y prueba en seco |

> El umbral no es una checklist rígida. La pregunta real es: **¿puede este trabajo dejar el sistema inconsistente a mitad de camino?** Si la respuesta es sí, es mega cambio. Si no, es chico, o directo si no llega a dos archivos con contratos nuevos.

**Los revisores entran siempre.** El de artefactos audita spec y planes antes de implementar; el de código, en todos los modos, también en directo y cambio chico. No hay excepción por tamaño: sin tests, son la única capa que lee semántica.

Fuera de esas cuatro puertas está **`hd-fast-implement`**, la vía rápida para retoques sobre algo ya construido. No es un modo de HD y se explica después de las fases.

## Las 5 fases

Todas las fases van **atadas en cadena**: no se salta ninguna. La **aprobación humana es una sola**: el resumen de discovery. Después, spec, revisión de artefactos, implementación y revisión de código corren en el mismo flujo. La otra pausa es la **prueba humana** al final de la fase 4, cuyo OK habilita el cierre.

**Durante la implementación y la revisión, el orquestador no le habla al humano.** Los agentes son colegas de trabajo, no su audiencia: lo que encuentran va al ledger y a los artefactos. El humano se entera en dos momentos —el **freno real** (un error que obliga a parar todo y esperar su decisión) y el **final** (el handoff para que pruebe el comportamiento y el resumen de cierre).

~~~
hd-discovery --> hd-spec --> hd-implement --> hd-review --> (humano prueba) --> hd-close
   Fase 1        Fase 2       Fase 3           Fase 4            pausa           Fase 5
~~~

1. **Discovery** — Destilar la idea primitiva de lo que pide el usuario, investigar el codebase y el contexto (qué está cableado con qué, riesgos, alternativas mejores, **cómo compila y qué convenciones tiene el repo**), y resolver dudas con preguntas **de a una por turno**.
2. **Spec y plan** — Decidir modo, crear la rama, escribir el `spec.md` (qué, por qué, criterios de aceptación, Q&A completo) y partir el trabajo en planes. En mega cambio: planes ordenados en **olas**, con **Ola 0 = contratos**. Cada plan declara sus archivos de código y fija el **comportamiento esperado** que el revisor va a auditar. Un **revisor de artefactos** audita spec y planes contra lo aprobado en discovery; con una corrección y su confirmación, la implementación sigue en el mismo flujo. No hay aprobación separada del spec ni prompt de handoff.
3. **Implementación** — Por ola: implementadores (solo código) trabajan en un worktree compartido; cada agente se **autoverifica en su worktree** (compila y pasa el lint), pero su salida no es evidencia. Se consolida la ola, se commitea, y el orquestador corre **el gate en la rama**: build + lint + estándares. Si hay fallos nuevos, se hace **una sola corrección**. Con la ola verde se respalda en `hd-backup/<trabajo>`.
4. **Revisión y corrección** — Un agente revisor **siempre** audita cada ola por el diff de su commit (`git show <sha> -- <rutas del plan>`) contra spec y plan, incluido el comportamiento esperado. Veredictos en `review-progress.md`. **Una sola corrección total** para todos los hallazgos de todas las olas; si no alcanza, se reporta al humano. Al final se corre build + lint frescos y se revisa el diff total; **los commits por ola se conservan** como historial.
5. **Prueba humana y cierre** — El humano prueba el comportamiento con los **criterios de aceptación** como checklist; no revisa el diff (la revisión de código ya la hizo el revisor). Con el OK explícito: limpiar automáticamente worktrees y stashes del trabajo, commitear los artefactos que falten, **pushear la rama solo si es nueva** y borrar la rama de respaldo. Los commits por ola no se squashean. **Nunca `--force`; `main` y ramas ajenas no se pushean sin autorización.**

Transversal a todas: **`hd-debug`** (causa raíz antes que fix), obligatoria para cualquier corrección de las fases 3 y 4 y para pedidos directos de bug.

## La vía rápida: `hd-fast-implement`

No todo cambio amerita el framework completo. Para retoques cortos o medianos sobre algo ya construido —renombrar, mover una pieza de sección, corregir un comportamiento puntual, arreglar un bug chico— está `hd-fast-implement`, una **vía rápida fuera de la cadena de 5 fases**.

| | HD (directo, chico o mega) | Vía rápida |
|---|---|---|
| Spec y planes | Sí | No |
| Rama y worktree | Sí | No: trabaja sobre la rama actual |
| Commit | Sí (uno por ola; uno solo en directo y chico) | **No**: deja todo en el árbol de trabajo |
| Revisor independiente | Obligatorio | No: el humano es el revisor |
| Artefactos `.hd/` | Sí | No |
| Verificación | Build + lint + estándares | Sin checks en la iteración; todos los checks en el cierre |
| Para qué | Trabajo que tiene que ser confiable | Retoque que el humano va a probar y commitear |

- **El mismo modelo hace todo**: no hay implementadores, revisores ni correctores (y, como en todo HD, no se escriben tests).
- **Qué deja**: el diff sin commitear y un reporte corto con qué tocó y qué tiene que probar el humano. Los checks se corren recién en el cierre.
- **Qué conserva**: la ley de la evidencia en el cierre (checks frescos, nada de "debería compilar") y `hd-debug` para bugs (causa raíz antes del fix; la reproducción la valida el humano).
- **Cómo cierra**: entre iteraciones no se corren checks; el humano prueba y reporta. Cuando dice que está todo bien, se corren todos los checks del cierre y recién ahí la fase se cierra.

**Cuándo no**: si es un cambio estructural (contratos compartidos, migraciones con backfill, transformación o DML masivo de datos, modelo de auth/permisos, flujo de pagos, cripto o PII), si mezcla varios cambios distintos entre sí o el diff no se puede leer como un solo cambio, o si hay que diseñar algo nuevo. Tocar varios módulos o repos no lo descalifica: un rename mecánico puede cruzarlos. Ahí es HD.

**Migraciones**: las de esquema **sin backfill** entran: borrar un catálogo (tabla), tocar un enum, agregar o quitar columnas, índices o constraints. Un `DROP TABLE`/`DROP COLUMN` es irreversible y el humano lo sabe: esta vía no hace backfill ni rollback de datos. Si la migración necesita backfill, transformar filas o DML masivo, es HD.

**Cuándo se invoca**: se recomienda una **conversación nueva** (contexto limpio), pero no es bloqueante. **Nunca** durante `hd-implement` ni `hd-review`: metería cambios sin commitear en un trabajo que se verifica por ola y se revisa. **Sí** después de `hd-close`, que es el punto natural.

> La vía rápida no da las garantías de HD: no hay revisor independiente y los checks se corren recién en el cierre. La confianza la pone el humano al probar y leer el diff. Si el cambio tiene que ser confiable sin que nadie lo mire, no es fast. Las reglas de oro de este README aplican al trabajo HD; esta vía es explícitamente otra cosa.

## El costo: dónde se va el tiempo

El trabajo HD tarda porque el costo crece con **el contexto del orquestador**, no con el de sus agentes: los agentes nacen limpios y mueren al terminar; el orquestador acumula todo lo que lee. Tres reglas lo mantienen acotado:

- **Autoverificación sin autoridad**: los agentes compilan y pasan el lint para no entregar código roto. Eso ahorra el bucle de relanzamiento, que era el gasto más caro. Pero **solo la corrida del orquestador en la rama consolidada es evidencia**; un verde en un worktree prueba el worktree.
- **Un worktree por ola, no por plan**: los footprints de la ola ya garantizan archivos disjuntos, y las dependencias se enlazan por symlink en vez de reinstalarse.
- **Rutas, no contenido**: los planes, los diffs y los logs se leen por ruta. La salida larga va al log y al contexto solo llegan las líneas de fallo.

Como el flujo ya no hace handoff a una conversación nueva, esa disciplina no es opcional: el ledger y las rutas son lo único que evita que el contexto de discovery, spec, implementación y review crezca sin control.

El diff de un plan no se guarda: se reconstruye con `git show <sha> -- <rutas>`. Se elimina así la mitad de las operaciones de la ola (guardar y reaplicar 2N parches) sin perder un byte de trazabilidad.

## Estructura del repo

~~~
hiper-driven/
├── README.md
├── LICENSE
└── skills/                    # cada skill es autocontenida: copiás la carpeta y listo
    ├── hd-discovery/          # Fase 1
    ├── hd-spec/               # Fase 2: spec, modo, planes y revisión de artefactos
    │   ├── SKILL.md
    │   └── templates/         # spec-template.md + plan-template.md
    ├── hd-implement/          # Fase 3: olas, implementadores, gate estático y commit por ola
    ├── hd-debug/              # Transversal: debugging sistemático
    ├── hd-review/             # Fase 4: auditoría por ola y corrección única
    │   ├── SKILL.md
    │   └── templates/         # review-progress-template.md
    ├── hd-close/              # Fase 5: cierre, push de rama nueva, limpieza y borrado del respaldo
    └── hd-fast-implement/     # Vía rápida (fuera de la cadena): sin commit ni revisores; checks al cierre
~~~

## Instalación

Las skills usan el formato portable `SKILL.md` (frontmatter YAML + markdown), compatible con la mayoría de agentes:

- **Claude Code / agentes con skills nativas**: copiá cada carpeta de `skills/` a tu directorio de skills (p. ej. `~/.claude/skills/`).
- **DeepSeek Harness**: copiá las carpetas a tu directorio de skills y cargalas con la herramienta `skill`.
- **Cualquier otro agente**: el contenido es markdown puro; referenciarlo o pegarlo al inicio del trabajo funciona igual.

Las skills que usan templates los llevan **empaquetados en su propia carpeta** (`<skill>/templates/`, referenciados relativos al SKILL.md): copiando la carpeta de la skill alcanza.

## Artefactos de trabajo

Cada trabajo HD crea un directorio `.hd/<nombre-del-trabajo>/` **en el repo donde se trabaja**:

~~~
.hd/migrar-pagos-a-stripe/
├── spec.md                  # qué, por qué, criterios, Q&A (+ modo, rama, comandos, respaldo y baseline)
├── ledger.md                # memoria del trabajo: estados, evidencias, rulings y SHAs
├── plans/
│   ├── plan-00-contratos.md # Ola 0 (solo si hay contratos nuevos)
│   ├── plan-01-....md       # Ola 1
│   └── ...
├── reports/                 # reportes de los implementadores
└── review-progress.md       # veredictos de spec/planes (fase 2) y de cada ola (fase 4)
~~~

Los worktrees de la orquestación **no viven acá**: van en `.git/hd-wt/<trabajo>/`, fuera del árbol de trabajo, para que `git add -A` no se los lleve al commit. Los `logs/` tampoco se commitean.

El diff de cada plan **no se guarda como archivo**: se reconstruye desde el commit de su ola con `git show <sha> -- <rutas del plan>`. El commit es el artefacto; el parche era un paso manual de más.

Esto deja historial auditable en el propio repo: cualquiera (humano o agente) puede reconstruir *por qué* se hizo lo que se hizo.

**Los artefactos van al commit**: el cierre commitea lo que falte de `.hd/<nombre-del-trabajo>/` (el spec y los planes viajan en el commit de planificación, el ledger en los commits por ola; `review-progress.md` se completa en las fases 2 y 4), sin preguntar. Solo quedan fuera si el humano lo pidió explícitamente o si el repo los ignora (`.gitignore`) — y en ese caso no se fuerzan con `git add -f`.

## Respaldo temporal y push al cerrar

Un trabajo HD deja un commit por ola. Mientras corre, **cada commit de ola se sube a `hd-backup/<trabajo>`** (si hay remote y la rama no es la default): un corte de luz no puede romper el trabajo. Es un respaldo **temporal**.

Al cerrar, `hd-close`:
- pushea la rama de trabajo **solo si es nueva** (creada para este trabajo), nunca `main` ni una rama ajena;
- borra la rama de respaldo cuando el trabajo ya está a salvo (local y remota); si el push falló, no borra nada; si el trabajo no está en el remoto, borra la local y conserva la remota;
- si el push no aplica o falla, no fuerza nada: lo reporta y conserva el respaldo.

| Pregunta | Respuesta |
|---|---|
| **Dónde** | `hd-backup/<trabajo>`, nunca la rama de trabajo ni `main`. |
| **Cuándo** | Después del commit de cada ola y de la corrección única. |
| **Cómo** | `git push <remote> HEAD:refs/heads/hd-backup/<trabajo>`. **Nunca `--force`.** |
| **Si falla** | No frena el trabajo: queda en el ledger y se reporta en el cierre. |
| **Al cerrar** | Se borra; la remota solo si el trabajo ya está en el remoto. |
| **Sin remote o sobre la default** | No hay respaldo: nada sale del repo hasta el cierre. |

## Reglas de oro (no negociables)

1. **Ningún spec ni plan contiene lógica ni implementaciones.** Única excepción: firmas exactas, tipos, constantes y formatos cuando son **contrato** (Ola 0). El código lo escribe el implementador.
2. **Las preguntas se hacen de a UNA por turno**, siempre con la opción *"Necesito más contexto sobre lo que me estás preguntando antes de decidir"*.
3. **El comportamiento esperado va antes que el código.** El plan fija en prosa qué debe hacer el código —entradas, salidas, casos borde, errores— y el revisor audita el código contra ese texto. Sin tests, ese texto es la única fuente de verdad semántica: si el plan no lo dice, el implementador no lo inventa y el revisor no lo adivina.
4. **El framework no escribe tests.** Ni el implementador, ni el corrector, ni el revisor: el trabajo se valida con **build + lint + estándares**. Si un agente propone tests, es alcance no pedido y se rechaza.
5. **Ola 0 (contratos) va sola y se revisa antes de seguir.** Si el contrato está mal, todo lo que venga después también va a estar mal. Si no hay contratos nuevos que otras olas consuman, no hay Ola 0.
6. **El paralelismo se calcula, no se intuye**: dos planes comparten ola solo si sus archivos de código son disjuntos, ninguno produce lo que el otro consume, no comparten estado mutable y ninguno depende del otro. **El default es un plan por ola**; se agrupa solo cuando la disjunción es inequívoca.
7. **La ola de datos va última, sola, nunca en paralelo**: confirmación de datos en producción + respaldo + prueba en seco.
8. **Los agentes se autoverifican en su worktree, pero no tienen autoridad**: pueden compilar y correr el lint para no entregar código roto; **no commitean, no tocan la rama y no aplican migraciones**, y su salida **no es evidencia**. Solo el orquestador corre el gate sobre la rama consolidada y commitea.
9. **Si una ola falla, no se lanza la siguiente.** Se hace **una sola corrección** con `hd-debug`; si después de re-correr el gate la ola sigue roja, es freno real.
10. **La unidad es la ola, no el plan.** Al terminar cada ola se consolida, se commitea la ola, se corre su gate y se borran sus worktrees. No hay commit por plan ni archivos de parche. El commit va **antes** del gate: es la base sobre la que corre la evidencia y sobre la que trabaja el corrector.
11. **Nunca, jamás, push de `main`, de una rama ajena o de un PR sin autorización explícita.** El único push automático es el de la **rama de trabajo nueva** al cerrar (y el respaldo temporal a `hd-backup/<trabajo>` durante el trabajo). Nunca `--force`.
12. **Ninguna afirmación de éxito sin evidencia fresca en ese turno.** "Debería compilar" está prohibido; una corrida verde de build + lint solo prueba el árbol donde corrió.
13. **Los revisores nunca son opcionales.** El de artefactos audita spec y planes antes de implementar; el de código audita cada ola en todos los modos, también en directo y en cambio chico. Son la capa que reemplaza a los tests: saltearlos es el atajo que hunde el framework. **Esto vale para todo trabajo HD**; la vía rápida de `hd-fast-implement` es explícitamente otra cosa y no tiene revisor.
14. **El ledger es la memoria del trabajo** (`.hd/<trabajo>/ledger.md`): estados por ola, evidencias y `Ruling:`s. Sobrevive a la compactación de contexto.
15. **La corrección de la fase 4 es una sola.** Se audita una vez, se juntan los hallazgos y se corrige una vez. Si no alcanza, se reporta al humano con diagnóstico; no se abre otra ronda automática.
16. **Todo bug pasa por causa raíz** (`hd-debug`): 3 fixes fallidos sobre el mismo problema = cuestionar la arquitectura con el humano, no un cuarto fix.
17. **Los artefactos `.hd/<trabajo>/` van al commit.** Se commitean con el trabajo (spec y planes al cerrar la fase 2, ledger por ola, el resto en el cierre) y solo quedan fuera si el humano lo pidió explícitamente o si git los ignora.
18. **Los commits por ola se conservan**: el historial del trabajo es el historial por ola (`hd(<trabajo>): ola N — …`). Nadie los colapsa, los squashea ni los reescribe; el cierre agrega el commit de artefactos por encima.
19. **Durante la ejecución, el orquestador no reporta al humano.** Lo que los agentes encuentran va al ledger. Al humano se le habla en el **freno real** y en el **final** (prueba y cierre).
20. **La única aprobación humana es el resumen de discovery.** El spec no se aprueba por separado: lo audita el revisor de artefactos y la implementación sigue en la misma sesión, sin prompt ni conversación nueva.
21. **El contexto del orquestador es el costo.** Los planes, diffs y logs se pasan por **ruta**, no por contenido; la salida larga va al log y al contexto solo llegan las líneas de fallo. Todo lo que entra al chat se paga en cada turno siguiente.
22. **El cierre deja el repo limpio**: ni un worktree, ni un stash del trabajo. La rama de respaldo se borra cuando el trabajo ya está en el remoto; si el push falló, se conserva. El push automático es solo de la rama nueva; todo lo demás espera autorización.

## Contribuir

HD nace de la práctica diaria; si lo iterás y mejorás, los PRs son bienvenidos. Las skills están escritas en español a propósito (es el idioma de trabajo de su autor); una traducción al inglés es una contribución válida.

## Licencia

[MIT](LICENSE).
