# Hiper-driven (HD)

**HD** es un framework de trabajo para agentes de IA basado en dos pilares:

- **SDD — Spec Driven Development**: ningún código se escribe sin un spec que diga *qué*, *por qué* y *cómo se valida*.
- **Verificación en dos capas**. **Estática**: un cambio no está listo si no **compila** limpio y no **cumple los estándares de buenas prácticas** del repo (lint, formato, convenciones, manejo de errores). **Semántica**: lo que el compilador y el linter no pueden ver lo audita un **revisor independiente y obligatorio** contra el spec. **No hay tests**: no se escriben, no se piden y no se aceptan.

El objetivo de HD es simple: **poder confiar en un trabajo hecho 100% por un LLM**. Sin tests, esa confianza no viene de la fe, viene del proceso: specs versionados, planes chicos, diffs chicos que compilan y respetan las convenciones, revisión obligatoria por ola y prueba humana del comportamiento antes de cerrar. Todo lo que se saca de la red automática de pruebas se compensa con barreras más firmes: **el revisor nunca es opcional** y el gate estático no se negocia.

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

**El revisor entra en todos los modos, también en directo.** No hay excepción por tamaño: sin tests, es la única capa que lee semántica.

## Las 5 fases

Todas las fases van **atadas en cadena**: no se salta ninguna. Hay dos pausas: la **aprobación del spec** y la **prueba humana** al final de la fase 4, cuyo OK habilita el cierre. Aprobado el spec, la implementación arranca en una **conversación nueva** con el prompt que deja el spec.

**Durante la implementación y la revisión, el orquestador no le habla al humano.** Los agentes son colegas de trabajo, no su audiencia: lo que encuentran va al ledger y a los artefactos. El humano se entera en dos momentos —el **freno real** (un error que obliga a parar todo y esperar su decisión) y el **final** (el handoff para que pruebe el comportamiento y el resumen de cierre).

~~~
hd-discovery --> hd-spec --prompt--> hd-implement --> hd-review --> (humano prueba) --> hd-close
   Fase 1        Fase 2                Fase 3         Fase 4           pausa           Fase 5
~~~

1. **Discovery** — Destilar la idea primitiva de lo que pide el usuario, investigar el codebase y el contexto (qué está cableado con qué, riesgos, alternativas mejores, **cómo compila y qué convenciones tiene el repo**), y resolver dudas con preguntas **de a una por turno**.
2. **Spec y plan** — Decidir modo, escribir el `spec.md` (qué, por qué, criterios de aceptación, Q&A completo) y partir el trabajo en planes. En mega cambio: planes ordenados en **olas**, con **Ola 0 = contratos**. Cada plan declara sus archivos de código y fija el **comportamiento esperado** que el revisor va a auditar. Al aprobar, se escribe `spec-prompt.md` y se entrega: la implementación arranca en una conversación nueva, no en la sesión del spec.
3. **Implementación** — Por ola: implementadores (solo código) trabajan en un worktree compartido; cada agente se **autoverifica en su worktree** (compila y pasa el lint), pero su salida no es evidencia. Se consolida la ola, se commitea, y el orquestador corre **el gate en la rama**: build + lint + estándares. Si hay fallos nuevos, se hace **una sola corrección**. Con la ola verde se respalda en `hd-backup/<trabajo>`.
4. **Revisión y corrección** — Un agente revisor **siempre** audita cada ola por el diff de su commit (`git show <sha> -- <rutas del plan>`) contra spec y plan, incluido el comportamiento esperado. Veredictos en `review-progress.md`. **Una sola corrección total** para todos los hallazgos de todas las olas; si no alcanza, se reporta al humano. Al final se corre build + lint frescos y se revisa el diff total; **los commits por ola se conservan** como historial.
5. **Prueba humana y cierre** — El humano prueba el comportamiento con los **criterios de aceptación** del spec como checklist; no revisa el diff (la revisión de código ya la hizo el revisor). Con el OK explícito: limpiar worktrees, commitear lo que falte (los artefactos `.hd/`) y rendir cuenta de los **rulings**. Los commits por ola no se squashean. **Nunca push de la rama de trabajo sin autorización.**

Transversal a todas: **`hd-debug`** (causa raíz antes que fix), obligatoria para cualquier corrección de las fases 3 y 4 y para pedidos directos de bug.

## El costo: dónde se va el tiempo

El trabajo HD tarda porque el costo crece con **el contexto del orquestador**, no con el de sus agentes: los agentes nacen limpios y mueren al terminar; el orquestador acumula todo lo que lee. Tres reglas lo mantienen acotado:

- **Autoverificación sin autoridad**: los agentes compilan y pasan el lint para no entregar código roto. Eso ahorra el bucle de relanzamiento, que era el gasto más caro. Pero **solo la corrida del orquestador en la rama consolidada es evidencia**; un verde en un worktree prueba el worktree.
- **Un worktree por ola, no por plan**: los footprints de la ola ya garantizan archivos disjuntos, y las dependencias se enlazan por symlink en vez de reinstalarse.
- **Rutas, no contenido**: los planes, los diffs y los logs se leen por ruta. La salida larga va al log y al contexto solo llegan las líneas de fallo.

El diff de un plan no se guarda: se reconstruye con `git show <sha> -- <rutas>`. Se elimina así la mitad de las operaciones de la ola (guardar y reaplicar 2N parches) sin perder un byte de trazabilidad.

## Estructura del repo

~~~
hiper-driven/
├── README.md
├── LICENSE
└── skills/                    # cada skill es autocontenida: copiás la carpeta y listo
    ├── hd-discovery/          # Fase 1
    ├── hd-spec/               # Fase 2: spec, modo, planes, prompt de implementación
    │   ├── SKILL.md
    │   └── templates/         # spec-template.md + plan-template.md + implement-prompt-template.md
    ├── hd-implement/          # Fase 3: olas, implementadores, gate estático y commit por ola
    ├── hd-debug/              # Transversal: debugging sistemático
    ├── hd-review/             # Fase 4: auditoría por ola y corrección única
    │   ├── SKILL.md
    │   └── templates/         # review-progress-template.md
    └── hd-close/              # Fase 5: cierre, artefactos y push con autorización
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
├── spec.md                  # qué, por qué, criterios, Q&A (+ modo, ramas, comandos, push y baseline)
├── spec-prompt.md           # prompt para implementar en una conversación nueva
├── ledger.md                # memoria del trabajo: estados, evidencias, rulings y SHAs
├── plans/
│   ├── plan-00-contratos.md # Ola 0 (solo si hay contratos nuevos)
│   ├── plan-01-....md       # Ola 1
│   └── ...
├── reports/                 # reportes de los implementadores
└── review-progress.md       # veredictos de la fase 4
~~~

Los worktrees de la orquestación **no viven acá**: van en `.git/hd-wt/<trabajo>/`, fuera del árbol de trabajo, para que `git add -A` no se los lleve al commit. Los `logs/` tampoco se commitean.

El diff de cada plan **no se guarda como archivo**: se reconstruye desde el commit de su ola con `git show <sha> -- <rutas del plan>`. El commit es el artefacto; el parche era un paso manual de más.

Esto deja historial auditable en el propio repo: cualquiera (humano o agente) puede reconstruir *por qué* se hizo lo que se hizo.

**Los artefactos van al commit**: el cierre commitea lo que falte de `.hd/<nombre-del-trabajo>/` (el spec, los planes y el ledger ya viajan en los commits de planificación y de ola), sin preguntar. Solo quedan fuera si el humano lo pidió explícitamente o si el repo los ignora (`.gitignore`) — y en ese caso no se fuerzan con `git add -f`.

## Push de seguridad: respaldo en `hd-backup/<trabajo>`

Un trabajo HD deja un commit por ola. Son checkpoints valiosos y frágiles. Si el trabajo corre en una rama dedicada, **cada commit de ola se sube a `hd-backup/<trabajo>`** apenas se crea: un corte de luz no puede romper el trabajo.

El respaldo va a **otra rama** a propósito: la rama de trabajo no se pushea automáticamente, así que `hd-backup/<trabajo>` es la copia remota que sobrevive a un corte de luz. La rama de trabajo conserva esos mismos commits y suma el commit de cierre.

| Pregunta | Respuesta |
|---|---|
| **Dónde** | `hd-backup/<trabajo>`, nunca la rama de trabajo ni `main`. |
| **Cuándo** | Después del commit de cada ola y de la corrección única. |
| **Cómo** | `git push <remote> HEAD:refs/heads/hd-backup/<trabajo>`. **Nunca `--force`.** |
| **Si falla** | No frena el trabajo: queda en el ledger y se reporta en el cierre. |
| **Si no hay rama dedicada** | No hay respaldo: nada sale del repo hasta el cierre, con autorización. |

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
11. **Nunca, jamás, push de la rama de trabajo, de un PR o de `main` sin autorización explícita del humano.** El único push automático es el respaldo a `hd-backup/<trabajo>`.
12. **Ninguna afirmación de éxito sin evidencia fresca en ese turno.** "Debería compilar" está prohibido; una corrida verde de build + lint solo prueba el árbol donde corrió.
13. **El revisor nunca es opcional.** Entra en todos los modos, también en directo y en cambio chico, y audita comportamiento en el diff. Es la capa que reemplaza a los tests: saltearla es el atajo que hunde el framework.
14. **El ledger es la memoria del trabajo** (`.hd/<trabajo>/ledger.md`): estados por ola, evidencias y `Ruling:`s. Sobrevive a la compactación de contexto.
15. **La corrección es una sola.** Se audita una vez, se juntan los hallazgos y se corrige una vez. Si no alcanza, se reporta al humano con diagnóstico; no se abre otra ronda automática.
16. **Todo bug pasa por causa raíz** (`hd-debug`): 3 fixes fallidos sobre el mismo problema = cuestionar la arquitectura con el humano, no un cuarto fix.
17. **Los artefactos `.hd/<trabajo>/` van al commit.** Se commitean con el trabajo (spec y planes al aprobar, ledger por ola, el resto en el cierre) y solo quedan fuera si el humano lo pidió explícitamente o si git los ignora.
18. **Los commits por ola se conservan**: el historial del trabajo es el historial por ola (`hd(<trabajo>): ola N — …`). Nadie los colapsa, los squashea ni los reescribe; el cierre agrega el commit de artefactos por encima.
19. **Durante la ejecución, el orquestador no reporta al humano.** Lo que los agentes encuentran va al ledger. Al humano se le habla en el **freno real** y en el **final** (prueba y cierre).
20. **La implementación arranca con `spec-prompt.md` en una conversación nueva.** El spec no ejecuta su propia implementación: escribe el prompt y se detiene. Copiar y pegar ese bloque es el handoff.
21. **El contexto del orquestador es el costo.** Los planes, diffs y logs se pasan por **ruta**, no por contenido; la salida larga va al log y al contexto solo llegan las líneas de fallo. Todo lo que entra al chat se paga en cada turno siguiente.

## Contribuir

HD nace de la práctica diaria; si lo iterás y mejorás, los PRs son bienvenidos. Las skills están escritas en español a propósito (es el idioma de trabajo de su autor); una traducción al inglés es una contribución válida.

## Licencia

[MIT](LICENSE).
