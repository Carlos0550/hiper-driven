# Hiper-driven (HD)

**HD** es un framework de trabajo para agentes de IA basado en dos pilares:

- **SDD — Spec Driven Development**: ningún código se escribe sin un spec que diga *qué*, *por qué* y *cómo se valida*.
- **TDD — Test Driven Development**: el **contrato de comportamiento** se fija antes que el código, y los tests los escribe un **agente distinto del que implementa**, desde ese contrato, sin ver la implementación. Pueden escribirse en paralelo con el código; lo que no se permite es escribirlos después mirando lo que el código hace.

El objetivo de HD es simple: **poder confiar en un trabajo hecho 100% por un LLM**. Confianza que no viene de la fe, sino de un proceso auditable: specs versionados, planes pequeños, contrato antes que código, revisión por ola y aprobación humana obligatoria antes de cerrar.

---

## Los caminos: spike, cambio chico, mega cambio

Casi todo trabajo entra por una de estas tres puertas. El usuario normalmente declara el modo explícito; si no lo hace, **el agente decide y anuncia el modo**, porque de eso depende la calidad del trabajo.

**Spike** (validación): una pregunta de factibilidad o una idea que se está sondeando ("¿se puede…?", "¿qué tal si…?"). Su salida es **una recomendación fundamentada, no código**: nace y muere en `hd-discovery`. Si la respuesta convence, la implementación es un trabajo nuevo que entra por chico o mega.

**Regla del ratchet (unidireccional):** si a mitad de camino aparece complejidad oculta, el trabajo **sube** de categoría (chico → mega). Nada baja de categoría una vez clasificado: "ya casi está" no es un argumento, es una alarma.

| | Mega cambio | Cambio chico |
|---|---|---|
| Señales típicas | Refactor masivo, decenas de archivos grandes, crear/borrar módulos o microservicios enteros, operaciones sobre datos sensibles o en masa | Unas pocas piezas acotadas, sin tocar contratos ni datos en masa |
| Spec | `spec.md` completo | `spec.md` breve |
| Planes | Varios, ordenados en **olas**; una ola puede tener un plan | Uno solo |
| Implementación | Implementador y autor de tests por plan, **dos worktrees** (Flujo B) | B: dos worktrees; A: un implementador directo en la rama |
| Revisión | Auditoría por ola + **una corrección única** + colapso | Una corrección simple + commit |
| Datos en producción | Preguntar siempre; ola de datos al final, nunca en paralelo, con respaldo y prueba en seco | Preguntar si aplica |

> El umbral no es una checklist rígida. La pregunta real es: **¿puede este trabajo dejar el sistema inconsistente a mitad de camino?** Si la respuesta es sí, es mega cambio.

Los specs nuevos usan **Flujo B**. Un trabajo viejo o en vuelo puede indicar `Flujo: A` en su prompt y corre con tests primero por el implementador.

## Las 5 fases

Todas las fases van **atadas en cadena**: no se salta ninguna, en ninguno de los dos modos. La única pausa que no es automática es la aprobación del spec; después, la implementación arranca en una **conversación nueva** con el prompt que deja el spec. Las demás pausas son los gates humanos: la prueba manual de la fase 4 y el OK final.

**Durante la implementación y la revisión, el orquestador no le habla al humano.** Los agentes son colegas de trabajo, no su audiencia: lo que encuentran va al ledger y a los artefactos. El humano se entera en dos momentos —el **freno real** (un error que obliga a parar todo y esperar su decisión) y el **cierre** (resumen corto con las desviaciones que requieren su decisión).

~~~
hd-discovery --> hd-spec --prompt--> hd-implement --> hd-review --> (humano prueba) --> hd-close
   Fase 1        Fase 2                Fase 2 cont.      Fase 3          Fase 4             Fase 5
~~~

1. **Discovery** — Destilar la idea primitiva de lo que pide el usuario, investigar el codebase y el contexto (qué está cableado con qué, riesgos, alternativas mejores), y resolver dudas con preguntas **de a una por turno**.
2. **Spec y plan** — Decidir modo, escribir el `spec.md` (qué, por qué, criterios de aceptación, Q&A completo) y partir el trabajo en planes. En mega cambio: planes ordenados en **olas**, con **Ola 0 = contratos**. Cada plan separa archivos de código y de tests, y fija el **contrato de comportamiento** que el autor de tests va a usar. Al aprobar, se escribe `spec-prompt.md` y se entrega: la implementación arranca en una conversación nueva, no en la sesión del spec.
3. **Implementación** — Por ola: implementadores (solo código) y autores de tests (solo tests, en el commit padre del plan) en paralelo; se consolida la ola, se corren **sus** tests una vez en la rama y, si hay fallos nuevos, se hace **una sola corrección**. Con la ola verde se commitea y se respalda en `hd-backup/<trabajo>`.
4. **Revisión y corrección** — Un agente revisor audita cada ola por sus parches (código + tests) contra spec y plan. Veredictos en `review-progress.md`. **Una sola corrección total** para todos los hallazgos de todas las olas; si no alcanza, se reporta al humano. Al final, los commits por ola **se colapsan** a un único diff sin stage.
5. **Aprobación y cierre** — El humano prueba el comportamiento y revisa el diff. Con el OK explícito: limpiar worktrees, commitear todo en **un único commit** y rendir cuenta de los **rulings**. **Nunca push de la rama de trabajo sin autorización.**

Transversal a todas: **`hd-debug`** (causa raíz antes que fix), obligatoria para cualquier corrección de las fases 3 y 4 y para pedidos directos de bug.

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
    ├── hd-implement/          # Fase 2 cont.: olas, implementadores, autor de tests, gate y commit por ola
    ├── hd-debug/              # Transversal: debugging sistemático
    ├── hd-review/             # Fases 3 y 4: auditoría por ola, corrección única y colapso
    │   ├── SKILL.md
    │   └── templates/         # review-progress-template.md
    └── hd-close/              # Fase 5: commit único, respaldo y push con autorización
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
├── spec.md                  # qué, por qué, criterios, Q&A (+ ramas, comandos, push y baseline)
├── spec-prompt.md           # prompt para implementar en una conversación nueva
├── ledger.md                # memoria del trabajo: estados, evidencias, rulings y SHAs
├── plans/
│   ├── plan-00-contratos.md # Ola 0
│   ├── plan-01-....md       # Ola 1
│   └── ...
├── waves/
│   └── ola1-<plan>.patch    # parche por plan: la evidencia que audita la fase 3
└── review-progress.md       # veredictos de la fase 3
~~~

Esto deja historial auditable en el propio repo: cualquiera (humano o agente) puede reconstruir *por qué* se hizo lo que se hizo.

**Los artefactos van al commit**: en el cierre, `.hd/<nombre-del-trabajo>/` se commitea junto con el código, sin preguntar. Solo quedan fuera si el humano lo pidió explícitamente o si el repo los ignora (`.gitignore`) — y en ese caso no se fuerzan con `git add -f`.

## Push de seguridad: respaldo en `hd-backup/<trabajo>`

Un trabajo HD deja un commit por ola. Son checkpoints valiosos y frágiles. Si el trabajo corre en una rama dedicada, **cada commit de ola se sube a `hd-backup/<trabajo>`** apenas se crea: un corte de luz no puede romper el trabajo.

El respaldo va a **otra rama** a propósito: la rama de trabajo se colapsa en review para que el humano revise un único diff, y si los commits por ola estuvieran pusheados ahí, el commit final no sería fast-forward. `hd-backup/<trabajo>` guarda el historial por ola; la rama de trabajo guarda el diff y el commit único.

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
3. **El contrato de comportamiento va antes que el código.** En Flujo B, los tests los escribe un agente distinto del implementador, desde el plan, en el commit padre del plan y sin ver la implementación. Tests escritos después mirando el código no valen.
4. **Ola 0 (contratos) va sola y se revisa antes de seguir.** Usa tests primero. Si el contrato está mal, todo lo que venga después también va a estar mal.
5. **El paralelismo se calcula, no se intuye**: dos planes comparten ola solo si sus archivos (código y tests) son disjuntos, ninguno produce lo que el otro consume, no comparten estado mutable y ninguno depende del otro. **No fuerces parallelism**: una ola puede tener un solo plan si el trabajo lo pide.
6. **La ola de datos va última, sola, nunca en paralelo**: confirmación de datos en producción + respaldo + prueba en seco. Usa tests primero.
7. **Los agentes no commitean ni ejecutan nada** (ni tests, ni builds, ni migraciones). En B, el implementador escribe solo código y el autor de tests solo tests; en A, el implementador escribe tests primero. Solo el orquestador corre tests y commitea (los checkpoints por ola).
8. **Si una ola falla, no se lanza la siguiente.** Se hace **una sola corrección** con `hd-debug`; si después de re-correr la ola sigue roja, es freno real.
9. **La unidad es la ola, no el plan.** Al terminar cada ola se consolidan sus parches (código + tests), se corre su gate, se commitea la ola y se borran sus worktrees. No hay commit por plan.
10. **Nunca, jamás, push de la rama de trabajo, de un PR o de `main` sin autorización explícita del humano.** El único push automático es el respaldo a `hd-backup/<trabajo>`.
11. **Ninguna afirmación de éxito sin evidencia fresca en ese turno.** "Debería pasar" está prohibido; una corrida verde solo prueba el árbol donde corrió.
12. **El ledger es la memoria del trabajo** (`.hd/<trabajo>/ledger.md`): estados por ola, evidencias y `Ruling:`s. Sobrevive a la compactación de contexto.
13. **La corrección es una sola.** Se audita una vez, se juntan los hallazgos y se corrige una vez. Si no alcanza, se reporta al humano con diagnóstico; no se abre otra ronda automática.
14. **Todo bug pasa por causa raíz** (`hd-debug`): 3 fixes fallidos sobre el mismo problema = cuestionar la arquitectura con el humano, no un cuarto fix.
15. **Los artefactos `.hd/<trabajo>/` van al commit.** Se commitean con el código y solo quedan fuera si el humano lo pidió explícitamente o si git los ignora.
16. **El colapso es la interfaz de revisión**: al cerrar review, los commits por ola se colapsan a un único diff sin stage, con el hash del árbol comparado antes y después. El historial por ola queda en `hd-backup/<trabajo>`.
17. **Durante la ejecución, el orquestador no reporta al humano.** Lo que los agentes encuentran va al ledger. Al humano se le habla en el **freno real** y en el **cierre**.
18. **La implementación arranca con `spec-prompt.md` en una conversación nueva.** El spec no ejecuta su propia implementación: escribe el prompt y se detiene. Copiar y pegar ese bloque es el handoff.

## Contribuir

HD nace de la práctica diaria; si lo iterás y mejorás, los PRs son bienvenidos. Las skills están escritas en español a propósito (es el idioma de trabajo de su autor); una traducción al inglés es una contribución válida.

## Licencia

[MIT](LICENSE).
