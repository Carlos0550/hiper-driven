# Hiper-driven (HD)

**HD** es un framework de trabajo para agentes de IA basado en dos pilares:

- **SDD — Spec Driven Development**: ningún código se escribe sin un spec que diga *qué*, *por qué* y *cómo se valida*.
- **TDD — Test Driven Development**: los tests unitarios se escriben **antes** que el código, como reflejo del comportamiento deseado. Nunca al revés (testear después es testear solo el *happy path*).

El objetivo de HD es simple: **poder confiar en un trabajo hecho 100% por un LLM**. Confianza que no viene de la fe, sino de un proceso auditable: specs versionados, planes pequeños, tests primero, revisión independiente y aprobación humana obligatoria antes de cerrar.

---

## Los caminos: spike, cambio chico, mega cambio

Casi todo trabajo entra por una de estas tres puertas. El usuario normalmente declara el modo explícito; si no lo hace, **el agente decide y anuncia el modo**, porque de eso depende la calidad del trabajo.

**Spike** (validación): una pregunta de factibilidad o una idea que se está sondeando ("¿se puede…?", "¿qué tal si…?"). Su salida es **una recomendación fundamentada, no código**: nace y muere en `hd-discovery`. Si la respuesta convence, la implementación es un trabajo nuevo que entra por chico o mega.

**Regla del ratchet (unidireccional):** si a mitad de camino aparece complejidad oculta, el trabajo **sube** de categoría (chico → mega). Nada baja de categoría una vez clasificado: "ya casi está" no es un argumento, es una alarma.

| | Mega cambio | Cambio chico |
|---|---|---|
| Señales típicas | Refactor masivo, decenas de archivos grandes, crear/borrar módulos o microservicios enteros, operaciones sobre datos sensibles o en masa | Unas pocas piezas acotadas, sin tocar contratos ni datos en masa |
| Spec | `spec.md` completo | `spec.md` breve |
| Planes | Varios, ordenados en **olas** | Uno solo |
| Implementación | Implementadores en paralelo, **cada uno en su worktree** | Un solo implementador, directo en la rama |
| Revisión | Auditoría por worktree, secuencial | Revisión simple |
| Datos en producción | Preguntar siempre; ola de datos al final, nunca en paralelo, con respaldo y prueba en seco | Preguntar si aplica |

> El umbral no es una checklist rígida. La pregunta real es: **¿puede este trabajo dejar el sistema inconsistente a mitad de camino?** Si la respuesta es sí, es mega cambio.

## Las 5 fases

Todas las fases van **atadas en cadena**: no se salta ninguna, en ninguno de los dos modos.

~~~
hd-discovery --> hd-spec --> hd-implement --> hd-review --> (humano prueba) --> hd-close
   Fase 1        Fase 2      Fase 2 cont.      Fase 3         Fase 4             Fase 5
~~~

1. **Discovery** — Destilar la idea primitiva de lo que pide el usuario, investigar el codebase y el contexto (qué está cableado con qué, riesgos, alternativas mejores), y resolver dudas con preguntas **de a una por turno**.
2. **Spec y plan** — Decidir modo, escribir el `spec.md` (qué, por qué, criterios de aceptación, Q&A completo) y partir el trabajo en planes. En mega cambio: planes ordenados en **olas**, con **Ola 0 = contratos**.
3. **Revisión y corrección** — Un agente revisor audita el trabajo contra spec y plan (seguridad, bugs, trampas del lenguaje, desviaciones). Veredictos registrados en `review-progress.md`. Correcciones hasta que todo esté en verde.
4. **Aprobación humana** — Todo el trabajo queda **sin stage y sin commits** para que el humano pruebe el comportamiento y revise a mano. Los bugs que aparezcan se corrigen.
5. **Cierre** — Con el OK explícito del humano: limpiar worktrees, commitear todo, y rendir cuenta de los **rulings** tomados. **Nunca push sin autorización.**

Transversal a todas: **`hd-debug`** (causa raíz antes que fix), obligatoria para cualquier corrección de las fases 3 y 4 y para pedidos directos de bug.

## Estructura del repo

~~~
hiper-driven/
├── README.md
├── LICENSE
└── skills/                    # cada skill es autocontenida: copiás la carpeta y listo
    ├── hd-discovery/          # Fase 1
    ├── hd-spec/               # Fase 2: spec, modo, planes, olas
    │   ├── SKILL.md
    │   └── templates/         # spec-template.md + plan-template.md (empaquetados)
    ├── hd-implement/          # Fase 2 cont.: implementadores, worktrees, gates, ledger
    ├── hd-debug/              # Transversal: debugging sistemático (obligatoria en correcciones)
    ├── hd-review/             # Fases 3 y 4: auditoría, breaker, merge por parches, correcciones
    │   ├── SKILL.md
    │   └── templates/         # review-progress-template.md (empaquetado)
    └── hd-close/              # Fase 5: limpieza y commit
~~~

## Instalación

Las skills usan el formato portable `SKILL.md` (frontmatter YAML + markdown), compatible con la mayoría de agentes:

- **Claude Code / agentes con skills nativas**: copiá cada carpeta de `skills/` a tu directorio de skills (p. ej. `~/.claude/skills/`).
- **DeepSeek Harness**: copiá las carpetas a tu directorio de skills y cargalas con la herramienta `skill`.
- **Cualquier otro agente**: el contenido es markdown puro; referenciarlo o pegarlo al inicio del trabajo funciona igual.

Las skills que usan templates los llevan **empaquetados en su propia carpeta** (`<skill>/templates/`, referenciados relativos al SKILL.md): copiando la carpeta de la skill alcanza — no hay archivos sueltos que copiar ni sincronizar.

## Artefactos de trabajo

Cada trabajo HD crea un directorio `.hd/<nombre-del-trabajo>/` **en el repo donde se trabaja**:

~~~
.hd/migrar-pagos-a-stripe/
├── spec.md                  # qué, por qué, criterios, Q&A
├── plans/
│   ├── plan-00-contratos.md # Ola 0
│   ├── plan-01-....md       # Ola 1
│   └── ...
└── review-progress.md       # veredictos de la fase 3
~~~

Esto deja historial auditable en el propio repo: cualquiera (humano o agente) puede reconstruir *por qué* se hizo lo que se hizo.

## Reglas de oro (no negociables)

1. **Ningún spec ni plan contiene lógica ni implementaciones.** Única excepción: firmas exactas, tipos, constantes y formatos cuando son **contrato** (Ola 0). El código lo escribe el implementador; para eso es implementador.
2. **Las preguntas se hacen de a UNA por turno**, siempre con la opción *"Necesito más contexto sobre lo que me estás preguntando antes de decidir"*.
3. **Tests primero, siempre.** El test refleja el comportamiento deseado y llama al código real antes de que exista.
4. **Ola 0 (contratos) va sola y se revisa antes de seguir.** Si el contrato está mal, todo lo que venga después también va a estar mal.
5. **El paralelismo se calcula, no se intuye**: dos planes comparten ola solo si sus archivos son disjuntos, ninguno produce lo que el otro consume, no comparten estado mutable y ninguno depende del otro. Es más barato encontrar un error en la ola 1 que en la ola 4.
6. **La ola de datos va última, sola, nunca en paralelo**: confirmación de datos en producción + respaldo + prueba en seco.
7. **Los implementadores no commitean ni ejecutan nada** (ni tests, ni builds, ni migraciones). Solo el orquestador corre tests — en serie por worktree — y su salida es la única evidencia válida.
8. **Si una ola falla, no se lanza la siguiente.**
9. **El merge local se hace por parches, sin commits**: todo queda sin stage para la aprobación humana.
10. **Nunca, jamás, push sin autorización explícita del humano.**
11. **Ninguna afirmación de éxito sin evidencia fresca en ese turno.** "Debería pasar" está prohibido; una corrida verde solo prueba el árbol donde corrió.
12. **El ledger es la memoria del trabajo** (`.hd/<trabajo>/ledger.md`): estados por plan, evidencias y `Ruling:`s. Sobrevive a la compactación de contexto; el recuerdo del modelo, no.
13. **El loop de correcciones tiene breaker**: 5 rondas máximo, después se adjudica con razón escrita en el ledger — y todos los rulings se le presentan al humano en el cierre. Descartar un hallazgo en silencio está prohibido.
14. **Todo bug pasa por causa raíz** (`hd-debug`): 3 fixes fallidos sobre el mismo problema = cuestionar la arquitectura con el humano, no un cuarto fix.

## Contribuir

HD nace de la práctica diaria; si lo iterás y mejorás, los PRs son bienvenidos. Las skills están escritas en español a propósito (es el idioma de trabajo de su autor); una traducción al inglés es una contribución válida.

## Licencia

[MIT](LICENSE).
