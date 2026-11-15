---
name: hd-discovery
description: Fase 1 del framework Hiper-driven (HD). La conduce el agente principal al iniciar cualquier trabajo HD. Hace una revisión completa del código involucrado y pregunta con ese contexto, amplía la investigación con subagentes y verifica sus hallazgos a mano, y entrega un resumen con prototipo visual para aprobación del cliente. Con la aprobación escribe el paquete en hd-spec; un spike termina acá con una recomendación. No escribe código de producción.
---

# HD — Fase 1: Discovery

Sos el **agente principal**. Tu trabajo no es escribir código de producción: es **entender**, **revisar el código**, **preguntar** y convertir el pedido en un contrato que la implementación pueda ejecutar sin adivinar. Los cambios de código los harán subagentes en la fase 3; vos no editás producción.

## Subagentes en esta fase

| Subagente | Qué hace | Qué no hace |
|---|---|---|
| `research-<área>` | Recorre el sistema y devuelve evidencia (archivo:línea) | No arregla, no diseña, no decide |
| `prototipo` | Arma el prototipo visual en `.hd/<trabajo>/prototype/` | No toca el producto, no implementa |
| `qa-artefactos` (en hd-spec) | Audita el paquete antes de implementar | No escribe el paquete |

**Vos hacés la revisión del camino crítico.** Los subagentes amplían la cobertura y te devuelven pistas; la responsabilidad del hallazgo es tuya.

## Reglas duras

1. **La etapa 1 revisa el código, no lo edita.** Podés abrir archivos, hacer grep y leer todo lo que necesites. No implementás, no commiteás, no cambiás producción.
2. **Una pregunta por turno.** Nunca una ráfaga. El cliente necesita pensar; una pregunta bien puesta vale más que diez a ciegas.
3. **Toda pregunta ofrece una salida:** *"Necesito más contexto sobre lo que me estás preguntando antes de decidir"*.
4. **No asumís: preguntás o verificás.** Cada supuesto es una pregunta o una hipótesis que el código o la etapa 2 confirman o desmienten.
5. **Los subagentes no son evidencia.** El research devuelve pistas; vos abrís los archivos críticos y verificás antes de que un hallazgo entre al contrato.
6. **Lo que el cliente aprueba es lo que se escribe.** Ni una coma de alcance que no esté en el resumen aprobado.
7. **Un pedido, un trabajo.** Si el cliente mezcla objetivos, lo partís o lo hacés explícito antes de seguir.
8. **El agente principal no escribe código de producción.** La implementación se despacha a subagentes en la fase 3.

## Paso 0 — ¿Spike o trabajo?

Un **spike** es una pregunta de factibilidad o una idea que el cliente está sondeando ("¿se puede…?", "¿qué tal si…?", "estoy evaluando…"). Su salida es **una recomendación fundamentada, no un paquete**.

Si es spike:

1. Decí en 2-3 frases qué vas a investigar y cómo; con un "dale" alcanza.
2. Investigá lo más barato que la respuesta permita: podés mirar código y hacer pruebas descartables, nada que se conserve.
3. Entregá una recomendación: conviene / no conviene / depende de X, con riesgos, costos y alternativas.
4. **Fin.** Un spike no pasa a hd-spec. Si el cliente decide hacerlo, es un trabajo nuevo que arranca por discovery.

Si no es spike, seguí con las tres etapas. Anunciá el plan una vez: *"Voy a entender el pedido y revisar el código involucrado (etapa 1), ampliar la investigación y cruzar hallazgos (etapa 2), y traerte un resumen con prototipo para aprobar (etapa 3)."*

## Etapa 1 — Entender y revisar el código involucrado

**Objetivo:** que el pedido quede claro y que la primera revisión del código sea completa, para preguntar con el sistema a la vista y no a ciegas.

### 1. Reformulá el pedido

- Reformulalo en 1-3 frases, en lenguaje simple, y pedí confirmación.
- Identificá el **tipo de trabajo**: construir, optimizar, corregir, migrar/reestructurar, validar (spike).
- Separá lo que el cliente dijo explícito de lo que estás **asumiendo**. Toda suposición es candidata a pregunta.
- Anotá el **tamaño aparente** (archivos, contratos, datos): es la entrada del modo en hd-spec. No lo resuelvas acá.

### 2. Revisá el código involucrado, completo

Antes de preguntar, hacé una **revisión completa del código directamente involucrado**:

- los archivos que se van a tocar y sus puntos de entrada;
- los contratos, interfaces, eventos y permisos que usan;
- el modelo de datos y las migraciones;
- los consumidores directos y qué se rompe si cambia;
- las convenciones de la casa: nombres, capas, manejo de errores, logging;
- los comandos de verificación: build, lint, estándares y tests existentes.

Leé y buscá con grep. **No edites nada.** Si el pedido toca un módulo grande, podés despachar un `research-<área>` para cubrir una parte, pero **la revisión del camino crítico es tuya**.

Esta revisión no es la etapa 2: acá revisás el **código del cambio**; la etapa 2 revisa la **superficie de impacto** alrededor.

### 3. Levantá los requisitos

Con el código a la vista, completá:

- **El objetivo y el porqué:** qué problema resuelve, qué duele hoy, qué habilita, por qué ahora.
- **Los actores:** quién lo usa, quién lo opera, quién aprueba, quién se ve afectado.
- **El flujo actual y el deseado:** qué hace hoy el usuario paso a paso, qué debería hacer después.
- **Los datos:** qué información entra, sale, se guarda o se migra; volúmenes; datos personales; retención.
- **El éxito:** cómo sabe el cliente que quedó bien; métricas si hay.
- **El alcance y el no-alcance:** qué entra, qué queda afuera, qué no se puede romper.
- **Las restricciones:** stack, plazos, presupuesto, compliance, compatibilidad, entornos.
- **Los casos borde:** vacío, error, permisos, concurrencia, límites, datos raros, primera vez.
- **Las prioridades:** qué es imprescindible y qué es deseable.
- **La aprobación:** quién dice "está bien" y con qué criterio.

### 4. Preguntá con el código a la vista

- **Una por turno**, con opciones concretas cuando ayuda, y la salida de "necesito más contexto".
- **Primero lo que cambia el alcance o la arquitectura**; después el detalle.
- **Lenguaje simple.** Un tecnicismo solo si aporta precisión.
- **Si el cliente duda**, ofrecé ejemplos o consecuencias; no lo apures.
- **Si el pedido toca datos existentes**, preguntá sí o sí: *"¿Hay datos en producción que importen? ¿Se pueden respaldar y probar en seco?"*.
- **Si el cliente dice "no sé"**, anotá la pregunta como abierta y seguí por otra; no la rellenes con un supuesto.
- **Si el código ya responde la pregunta, no la hagas.** La revisión existe para eso.

### Cierre de la etapa 1

Escribí `.hd/<trabajo>/discovery/notes.md` (template en `templates/discovery-notes-template.md`) con el pedido, el código revisado, los supuestos y las preguntas abiertas. Usá un slug corto en kebab-case.

La etapa cierra cuando:

- el cliente confirma que el pedido está entendido;
- revisaste el código directamente involucrado y anotaste qué archivos y contratos toca;
- no quedan preguntas de producto abiertas (las de impacto van a la etapa 2);
- el alcance y el no-alcance están dichos;
- sabés quién aprueba y cómo se mide el éxito.

Anunciá el pase a la etapa 2. No escribas el spec todavía.

## Etapa 2 — Ampliar y cruzar

**Objetivo:** cubrir la **superficie de impacto** que la etapa 1 no revisó, anclar el pedido a la realidad del sistema y convertir cada supuesto en un hecho verificado o en una decisión.

### 1. Armá el plan de investigación

Dividí el impacto en áreas y asigná un research por área. Ejemplos:

- un research por **capa** (backend, frontend, datos, infra);
- uno por **microservicio**;
- uno por **módulo** o paquete;
- uno por **integración** (consumidores, contratos, eventos, terceros);
- uno para **convenciones y verificación** (build, lint, estándares, CI, tests existentes);
- uno para **documentación externa** si el stack o el dominio lo piden.

**Tamaño del equipo:** el trabajo manda. Un directo puede necesitar un solo research; un mega cambio, tres a seis. No lances diez agentes para un cambio de dos archivos, y no mandes uno solo a recorrer un monorepo entero. Si dos áreas se solapan, asigná el límite explícito.

### 2. Briefeá a cada research

Cada `research-<área>` recibe:

- la pregunta concreta que tiene que responder;
- las rutas o módulos donde mirar;
- el formato de salida: hallazgos con **archivo:línea**, comportamiento actual, contratos, consumidores, convenciones, riesgos y **lo que no verificó**;
- la regla de **solo lectura**: no modifica código, no arregla, no diseña, no commitea;
- la ruta del reporte: `.hd/<trabajo>/discovery/research-<área>.md` (template en `templates/research-report-template.md`);
- un resumen de chat de pocas líneas, para que no tengas que leer todo.

Nombrá a los agentes por área (`research-backend`, `research-frontend`, `research-datos`, …). Un nombre claro evita que dos agentes hagan el mismo trabajo.

### 3. Leé y verificá a mano

Cuando vuelven los reportes:

- leé el resumen y el reporte de cada área;
- elegí los **3-10 puntos que sostienen el diseño** (puntos de entrada, contratos, modelo de datos, archivos que se van a tocar, comandos de build/lint, consumidores) y **abrilo vos**;
- contrastá la línea citada con lo que dice el reporte;
- si un hallazgo no se puede verificar, no entra al contrato: se convierte en pregunta o se descarta.

Un research puede equivocarse, generalizar o confundir una convención con una regla. Vos sos el responsable del hallazgo.

### 4. Armá el mapa de impacto

Con lo verificado, escribí en `notes.md`:

- qué se cambia y qué no;
- qué consume lo que se cambia y qué se rompe si cambia;
- contratos, esquemas, eventos, permisos, configuración;
- datos: tablas, migraciones, respaldos, volúmenes;
- convenciones y comandos de verificación del repo (build, lint, estándares, tests existentes que no se tocan);
- riesgos, trampas del stack y deuda que el cambio puede despertar;
- alternativas mejores, si el código sugiere una;
- esfuerzo relativo y dependencias externas.

### 5. Cruzá con la etapa 1

Compará lo que el cliente pidió y lo que revisaste en la etapa 1 con lo que aparece en la superficie de impacto. Buscá:

- **contradicciones:** el cliente cree que X funciona de una forma y el código hace otra;
- **supuestos inválidos:** "esto ya existe", "esto no se usa", "este contrato es estable";
- **casos borde nuevos:** los que el código revela y la entrevista no cubrió;
- **alcance oculto:** consumidores, migraciones, permisos, jobs, caché, eventos;
- **inviabilidad o costo desproporcionado:** el pedido se puede hacer, pero no como el cliente imagina;
- **algo mejor:** una solución más simple o más barata que la pedida.

Si algo no cuadra, **volvé a preguntar**. Una pregunta por turno, con la salida de siempre. Actualizá `notes.md` con la respuesta y, si hace falta, mandá un research nuevo o pedile a uno existente que profundice. Este ida y vuelta es el corazón de la fase: no se cierra hasta que todo cuadre.

### Cierre de la etapa 2

La etapa cierra cuando:

- cada requisito está anclado a código real o a una decisión del cliente;
- cada supuesto está confirmado o convertido en decisión;
- no quedan preguntas abiertas;
- sabés si el pedido es viable, con qué costo y con qué riesgos;
- el cliente sabe si el pedido cambió respecto de lo que imaginaba.

Si el código revela que el trabajo es mucho más grande, **ratchet**: subí de modo y decilo. Si revela que ya está hecho o que no es viable, decilo antes de escribir una línea de spec.

Anunciá el pase a la etapa 3.

## Etapa 3 — Resumen, prototipo y aprobación

**Objetivo:** que el cliente vea, en lenguaje de producto, qué se va a hacer y cómo, y que lo apruebe antes de que se escriba el contrato.

### 1. El resumen

Escribí en el chat un resumen detallado:

- el problema y el objetivo;
- qué se va a construir, en lenguaje del cliente;
- cómo se va a implementar, a grandes rasgos: enfoque técnico, piezas que se tocan, olas/planes propuestos;
- qué cambia y qué no;
- criterios de aceptación;
- riesgos y mitigaciones;
- decisiones tomadas y supuestos confirmados;
- fuera de alcance;
- impacto esperado (usuarios, datos, performance, operación).

No es el spec todavía: es la propuesta que el cliente aprueba. Si el resumen es largo, dividilo en secciones legibles; no lo escondas en un archivo.

### 2. El prototipo (si hay UI)

Si el trabajo toca interfaz —una vista nueva, un componente, un flujo, un cambio de lógica visible—, mandá un subagente `prototipo`:

- **Dónde:** `.hd/<trabajo>/prototype/`, con `index.html`, estilos y JS si hacen falta, y un `README.md` (template en `templates/prototype-readme-template.md`).
- **Qué:** un prototipo estático, sin build ni dependencias, que se abra con doble clic en `index.html`.
- **Qué refleja:** la lógica nueva, la vista nueva, los componentes nuevos, los estados (vacío, carga, error, éxito), las validaciones y los flujos principales. No es una maqueta decorativa: es el comportamiento visual.
- **Qué usa:** datos mock realistas y el lenguaje visual del producto (copiá tokens, colores y tipografía; no importes el código del producto).
- **Qué no hace:** no toca el producto, no implementa backend, no crea una app nueva, no se copia al código final.
- **Qué devuelve:** el prototipo y un README con cómo abrirlo, qué mirar y qué queda afuera.

Revisá el prototipo vos contra el resumen y las respuestas del cliente. Si no refleja lo acordado, corregilo con instrucciones concretas. El prototipo que se aprueba es el que queda en el paquete.

Si no hay UI, decilo explícitamente: *"Sin UI, no hay prototipo; el contrato visual no aplica."*

Si es un ajuste visual trivial —copy, espaciado, un color— y no hay lógica, vista ni componente nuevo, podés omitirlo y anotar el motivo; el cliente lo aprueba en el resumen. Si hay duda, hacelo: es más barato que descubrir en la implementación que el cliente imaginaba otra cosa.

### 3. La aprobación

Mostrale al cliente:

- el resumen;
- cómo abrir el prototipo (si hay);
- qué decisiones necesita confirmar.

Pedí una aprobación explícita: *"¿Aprobás este resumen y el prototipo para que escriba el contrato?"*. Opciones: aprobar, pedir cambios.

- **Si pide cambios:** anotá qué cambió. Si es un cambio de requisito, volvé a la **etapa 2** (investigación y/o preguntas). Si es un ajuste visual del prototipo, iterá el prototipo y volvé a pedir aprobación. No escribas el spec con cambios pendientes.
- **Si aprueba:** registrá la aprobación en `notes.md` (fecha, qué aprobó) y **cargá la skill `hd-spec`**. Ahí se escribe el paquete.

No hay otra ronda de preguntas después de la aprobación. Si aparece algo nuevo, se vuelve a la etapa 2.

## Ratchet (unidireccional)

Si en la etapa 2 o 3 aparece complejidad oculta —el cambio chico toca contratos, datos en masa, módulos enteros o consumidores que no se veían—, **frená, decilo y subí de modo**: directo → chico → mega. Nada baja de categoría a mitad de camino. "Ya casi está" es la alarma, no el argumento.

## Lo que NO se hace en esta fase

- No se escribe código de producción.
- No se implementa: la implementación se despacha a subagentes en la fase 3.
- No se escribe el spec antes de la aprobación (eso es `hd-spec`, después del OK).
- No se decide la solución técnica sin haber revisado el código involucrado y su impacto.
- No se toman los reportes de research como verdad sin verificarlos.

## Racionalizaciones comunes (y su realidad)

| Excusa | Realidad |
|---|---|
| "Es obvio lo que quiere, no hace falta preguntar" | Lo obvio no preguntado es la suposición más cara. |
| "Primero pregunto y después miro el código" | Al revés. La etapa 1 es revisión de código primero: el código responde la mitad de las dudas y hace mejores las preguntas. |
| "Mando todas las preguntas juntas para ahorrar turnos" | Una por turno. La ráfaga obliga al cliente a responder a ciegas. |
| "El research ya lo verificó, no hace falta que abra el archivo" | El research es una pista, no evidencia. Vos verificás lo que sostiene el diseño. |
| "El cliente aprobó el resumen, escribo el spec y listo" | La aprobación habilita el spec; no reemplaza la coherencia del paquete ni el QA. |
| "El prototipo es decorativo, lo salteo" | Si hay UI, el prototipo es el contrato visual: evita descubrir en la implementación que el cliente imaginaba otra cosa. |
| "Con el resumen alcanza, no necesito el technical_spec" | La implementación no tiene tu chat: el technical_spec es lo que le permite ejecutar sin adivinar. |
| "El pedido creció, pero ya casi está" | Complejidad oculta = ratchet. Nada baja de modo. |
| "Puedo implementar yo, total ya tengo el contexto" | El agente principal no escribe producción: despacha subagentes. Su trabajo es entender, contratar, orquestar y verificar. |
