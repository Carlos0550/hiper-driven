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
| Revisión | Auditoría por parche de ola, secuencial | Revisión simple |
| Datos en producción | Preguntar siempre; ola de datos al final, nunca en paralelo, con respaldo y prueba en seco | Preguntar si aplica |

> El umbral no es una checklist rígida. La pregunta real es: **¿puede este trabajo dejar el sistema inconsistente a mitad de camino?** Si la respuesta es sí, es mega cambio.

## Las 5 fases

Todas las fases van **atadas en cadena**: no se salta ninguna, en ninguno de los dos modos. Los handoffs son **automáticos**: al cerrar cada fase, el agente **carga la siguiente skill y continúa en el mismo flujo** — nunca espera a que el usuario la invoque a mano. Las únicas pausas reales son los gates humanos: la confirmación del resumen (discovery), la aprobación del spec y planes (spec), la prueba manual de la fase 4, y el OK final (close).

**Durante la implementación y la revisión, el orquestador no le habla al humano.** Los implementadores y el revisor son colegas de trabajo del orquestador, no su audiencia: lo que encuentran va al ledger y a los artefactos del trabajo. El humano se entera en dos momentos —el **freno real** (un error que obliga a parar todo y esperar su decisión) y el **cierre** (resumen corto con la sección de desviaciones que requieren su decisión).

~~~
hd-discovery --> hd-spec --> hd-implement --> hd-review --> (humano prueba) --> hd-close
   Fase 1        Fase 2      Fase 2 cont.      Fase 3         Fase 4             Fase 5
                                                 (hd-audit: auditoría manual del humano, opcional)
~~~

1. **Discovery** — Destilar la idea primitiva de lo que pide el usuario, investigar el codebase y el contexto (qué está cableado con qué, riesgos, alternativas mejores), y resolver dudas con preguntas **de a una por turno**.
2. **Spec y plan** — Decidir modo, escribir el `spec.md` (qué, por qué, criterios de aceptación, Q&A completo) y partir el trabajo en planes. En mega cambio: planes ordenados en **olas**, con **Ola 0 = contratos** y **paralelismo por default** (cada ola arranca 2 o más planes en paralelo; una ola de un plan solo se justifica con una dependencia dura). Al terminar **cada plan** se consolida en la rama (parche + migraciones si hay), se corren sus tests sobre la rama y **se commitea ese plan como checkpoint propio** — aunque después haya correcciones. El worktree se borra recién con su commit hecho, y la ola siguiente nace de esos commits. Si el trabajo corre en una rama dedicada, ese commit **se sube al remoto** como respaldo (ver *Respaldo remoto*).
3. **Revisión y corrección** — Un agente revisor audita el trabajo contra spec y plan, ola por ola usando los parches guardados en `.hd/<trabajo>/waves/` (seguridad, bugs, trampas del lenguaje, desviaciones). Veredictos en `review-progress.md`. Correcciones con breaker de 5 rondas + adjudicación registrada en el ledger, hasta que todo esté en verde.
4. **Aprobación humana** — Al cerrar la revisión, el trabajo queda **commiteado plan por plan** (un commit por plan, más los de corrección): **no se colapsa ni se aplana**. El humano prueba el comportamiento y, si quiere, revisa commit por commit con la **guía de auditoría manual** (`hd-audit`), que vuelca los commits y las guías de restauración en `.hd/<trabajo>/audit-guia.md`. Los bugs que aparezcan se corrigen con un commit nuevo encima.
5. **Cierre** — Con el OK explícito del humano: limpiar worktrees, verificar que todo quedó commiteado (sin aplanar los commits por plan) y rendir cuenta de los **rulings** tomados. **Nunca push a la rama por defecto o a un PR sin autorización.**

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
    ├── hd-implement/          # Fase 2 cont.: implementadores, worktrees, gates, ledger, commit por plan
    ├── hd-debug/              # Transversal: debugging sistemático (obligatoria en correcciones)
    ├── hd-review/             # Fases 3 y 4: auditoría, breaker, correcciones y gate humano
    │   ├── SKILL.md
    │   └── templates/         # review-progress-template.md (empaquetado)
    ├── hd-audit/              # Fase 4 (opcional): guía de auditoría manual commit por commit
    └── hd-close/              # Fase 5: limpieza, verificación y push con autorización
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
├── spec.md                  # qué, por qué, criterios, Q&A (+ commit base)
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

## Reglas de oro (no negociables)

1. **Ningún spec ni plan contiene lógica ni implementaciones.** Única excepción: firmas exactas, tipos, constantes y formatos cuando son **contrato** (Ola 0). El código lo escribe el implementador; para eso es implementador.
2. **Las preguntas se hacen de a UNA por turno**, siempre con la opción *"Necesito más contexto sobre lo que me estás preguntando antes de decidir"*.
3. **Tests primero, siempre.** El test refleja el comportamiento deseado y llama al código real antes de que exista.
4. **Ola 0 (contratos) va sola y se revisa antes de seguir.** Si el contrato está mal, todo lo que venga después también va a estar mal.
5. **El paralelismo se calcula, no se intuye — y es el diseño por default**: dos planes comparten ola solo si sus archivos son disjuntos, ninguno produce lo que el otro consume, no comparten estado mutable y ninguno depende del otro. Cada ola arranca **2 o más planes en paralelo**; una ola de un plan solo se justifica con una dependencia dura (contratos, datos, output consumido). Es más barato encontrar un error en la ola 1 que en la ola 4.
6. **La ola de datos va última, sola, nunca en paralelo**: confirmación de datos en producción + respaldo + prueba en seco.
7. **Los implementadores no commitean ni ejecutan nada** (ni tests, ni builds, ni migraciones). Solo el orquestador corre tests — en serie por worktree — y su salida es la única evidencia válida; y solo el orquestador commitea (los checkpoints por ola).
8. **Si una ola falla, no se lanza la siguiente.**
9. **La consolidación es por plan y por parches, y cada plan se commitea como checkpoint propio**: al terminar cada plan sus cambios se traen a la rama (migraciones incluidas si hay), se corren sus tests sobre la rama y el orquestador commitea — **siempre, aunque falten correcciones**: el commit marca *estado*, no *aprobación*. Así el trabajo no se acumula sin commitear, la ola siguiente crea sus worktrees desde commits que ya contienen lo anterior, y **cada plan queda trackeable por un commit** en vez de un volcado único e indistinguible.
10. **Nunca, jamás, push a la rama por defecto (`main`), a un PR o a otra rama sin autorización explícita del humano.** El único push automático es el **respaldo por commit** a la rama de trabajo dedicada (ver *Respaldo remoto*).
11. **Ninguna afirmación de éxito sin evidencia fresca en ese turno.** "Debería pasar" está prohibido; una corrida verde solo prueba el árbol donde corrió.
12. **El ledger es la memoria del trabajo** (`.hd/<trabajo>/ledger.md`): estados por plan, evidencias y `Ruling:`s. Sobrevive a la compactación de contexto; el recuerdo del modelo, no.
13. **El loop de correcciones tiene breaker**: 5 rondas máximo, después se adjudica con razón escrita en el ledger — y todos los rulings se le presentan al humano en el cierre. Descartar un hallazgo en silencio está prohibido.
14. **Todo bug pasa por causa raíz** (`hd-debug`): 3 fixes fallidos sobre el mismo problema = cuestionar la arquitectura con el humano, no un cuarto fix.
15. **Los artefactos `.hd/<trabajo>/` van al commit.** Son el registro auditable del trabajo: se commitean con el código y solo quedan fuera si el humano lo pidió explícitamente o si git los ignora. Una decisión ya tomada no se vuelve a consultar.
16. **La historia del trabajo no se reescribe.** Los commits por plan se conservan hasta el push: no se colapsan, no se aplanan y no se resucitan checkpoints. Si el humano quiere un único commit, se lo pide — y se avisa de que eso reescribe la historia.
17. **Durante la ejecución, el orquestador no reporta al humano.** Lo que los implementadores y el revisor encuentran va al ledger y a los artefactos. Al humano se le habla en dos momentos: el **freno real** (un error de planificación que para el trabajo y necesita su decisión — con qué falla, dónde y qué se recomienda) y el **cierre** (resumen corto con la sección de **desviaciones que requieren tu decisión**). Nada de informes por plan, por ola ni por worktree.
18. **Cada commit verificado se versiona en el remoto cuando el trabajo corre en una rama dedicada.** Un corte de luz no puede romper una decena de checkpoints. Es un respaldo, no una aprobación: el commit se sube tal cual, aunque los tests estén rojos.

## Respaldo remoto: el push de seguridad

Un trabajo HD deja en la rama un commit por plan, más los de corrección. Son checkpoints valiosos — y frágiles: un corte de luz a mitad de camino puede romper un commit y con él el trabajo de horas.

Por eso, **si el trabajo corre en una rama creada por y para la implementación** (la rama dedicada que `hd-spec` propone y el humano aprueba), **cada commit verificado se sube al remoto** apenas se hace: uno por plan, uno por ronda de corrección. Es un **respaldo, no una aprobación**: el commit se sube tal cual, aunque los tests estén rojos.

| Pregunta | Respuesta |
|---|---|
| **Dónde** | Solo a la rama de trabajo del repo. **Nunca** a la rama por defecto. |
| **Cuándo** | Después del commit y de sus verificaciones (hd-implement, hd-review). |
| **Cómo** | `git push --set-upstream <remote> <rama>` la primera vez; después, `git push`. **Nunca `--force`.** |
| **Si falla** | No frena el trabajo: queda anotado en el ledger y se reporta en el cierre. El humano decide. |
| **Si el trabajo NO tiene rama dedicada** | Comportamiento actual: nada sale del repo hasta el cierre, con autorización. |

La decisión se toma una sola vez, en `hd-spec`, junto con la rama: queda anotada en el `spec.md` (`push de seguridad: habilitado | deshabilitado`) y es la que leen las fases siguientes.

## Contribuir

HD nace de la práctica diaria; si lo iterás y mejorás, los PRs son bienvenidos. Las skills están escritas en español a propósito (es el idioma de trabajo de su autor); una traducción al inglés es una contribución válida.

## Licencia

[MIT](LICENSE).
