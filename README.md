# Hiper-driven (HD)

**HD** es un framework de trabajo para agentes de IA basado en dos pilares:

- **SDD — Spec Driven Development**: ningún código se escribe sin un spec que diga *qué*, *por qué* y *cómo se valida*.
- **TDD — Test Driven Development**: los tests unitarios se escriben **antes** que el código, como reflejo del comportamiento deseado. Nunca al revés (testear después es testear solo el *happy path*).

El objetivo de HD es simple: **poder confiar en un trabajo hecho 100% por un LLM**. Confianza que no viene de la fe, sino de un proceso auditable: specs versionados, planes pequeños, tests primero, revisión independiente y aprobación humana obligatoria antes de cerrar.

---

## Los dos modos

Casi todo trabajo entra por una de estas dos puertas. El usuario normalmente lo declara explícito ("esto es un mega cambio", "son un par de cambios"); si no lo hace, **el agente decide y anuncia el modo**, porque de eso depende la calidad del trabajo.

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
5. **Cierre** — Con el OK explícito del humano: limpiar worktrees, commitear todo. **Nunca push sin autorización.**

## Estructura del repo

~~~
hiper-driven/
├── README.md
├── LICENSE
├── skills/
│   ├── hd-discovery/SKILL.md    # Fase 1
│   ├── hd-spec/SKILL.md         # Fase 2: spec, modo, planes, olas
│   ├── hd-implement/SKILL.md    # Fase 2 cont.: implementadores, worktrees, gates
│   ├── hd-review/SKILL.md       # Fases 3 y 4: auditoría, merge por parches, correcciones
│   └── hd-close/SKILL.md        # Fase 5: limpieza y commit
└── templates/
    ├── spec-template.md
    ├── plan-template.md
    └── review-progress-template.md
~~~

## Instalación

Las skills usan el formato portable `SKILL.md` (frontmatter YAML + markdown), compatible con la mayoría de agentes:

- **Claude Code / agentes con skills nativas**: copiá cada carpeta de `skills/` a tu directorio de skills (p. ej. `~/.claude/skills/`).
- **DeepSeek Harness**: copiá las carpetas a tu directorio de skills y cargalas con la herramienta `skill`.
- **Cualquier otro agente**: el contenido es markdown puro; referenciarlo o pegarlo al inicio del trabajo funciona igual.

Los templates de `templates/` los lee el agente al escribir artefactos; copiarlos junto a las skills o dejarlos en el repo donde trabajes.

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

1. **Ningún spec ni plan contiene snippets de código.** El código exacto es responsabilidad del implementador; para eso es implementador.
2. **Las preguntas se hacen de a UNA por turno**, siempre con la opción *"Necesito más contexto sobre lo que me estás preguntando antes de decidir"*.
3. **Tests primero, siempre.** El test refleja el comportamiento deseado y llama al código real antes de que exista.
4. **Ola 0 (contratos) va sola y se revisa antes de seguir.** Si el contrato está mal, todo lo que venga después también va a estar mal.
5. **Los planes de una misma ola son independientes entre sí.** Un plan solo puede depender de olas anteriores. Es más barato encontrar un error en la ola 1 que en la ola 4.
6. **La ola de datos va última, sola, nunca en paralelo**: confirmación de datos en producción + respaldo + prueba en seco.
7. **Los implementadores no commitean** ni corren scripts que no sean tests unitarios.
8. **Si una ola falla, no se lanza la siguiente.**
9. **El merge local se hace por parches, sin commits**: todo queda sin stage para la aprobación humana.
10. **Nunca, jamás, push sin autorización explícita del humano.**

## Contribuir

HD nace de la práctica diaria; si lo iterás y mejorás, los PRs son bienvenidos. Las skills están escritas en español a propósito (es el idioma de trabajo de su autor); una traducción al inglés es una contribución válida.

## Licencia

[MIT](LICENSE).
