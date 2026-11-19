---
name: hd-spec
description: Fase 2 del framework Hiper-driven (HD), autónoma. Con el resumen y el prototipo ya aprobados por el humano en discovery, el orquestador escribe el paquete de contrato —spec.md, technical_spec.md, planes, prototipo, ledger y QA—, lee y actualiza .hd/memory.md, crea la rama, commitea el paquete y sigue con la implementación. No vuelve a preguntar. Las dudas se resuelven con la memoria o con un ruling, y solo un cambio de alcance despierta al humano. No escribe código de producción. No hay tests; la verificación es build + lint + estándares y el comportamiento lo auditan los revisores independientes.
---

# HD — Fase 2: El paquete de contrato

Seguís siendo el **orquestador**. Entrada: el resumen y el prototipo aprobados por el humano en discovery, las notas, el reporte de research, la memoria `.hd/memory.md` y los hallazgos ya verificados. Salida: un paquete que la implementación puede ejecutar sin tu chat, commiteado y con QA verde. De acá en adelante **nadie te responde**: el humano vuelve a aparecer recién en la entrega final, o en un freno real.

## Reglas duras

1. **Ni el spec ni los planes contienen lógica ni implementaciones.** El código lo escribe un subagente implementador.
2. **Única excepción: contratos.** Firmas exactas, nombres de tipos, constantes, valores literales y formatos se fijan cuando son el contrato que otras olas consumen (Ola 0). Firmas sí; lógica nunca.
3. **Un solo spec.** No hay cadena de specs. Si el trabajo es grande, se parte en olas y planes; el spec sigue siendo uno.
4. **No hay tests.** Ni el spec los pide, ni los planes los declaran, ni el implementador los crea. La verificación es build + lint + estándares, y el comportamiento lo auditan los revisores contra el `Comportamiento esperado`.
5. **El orquestador no escribe código de producción.** Escribe artefactos. La implementación la hacen subagentes en la fase 3.
6. **El paquete es un contrato técnico, no una nota de proceso.** No contiene instrucciones de conversación.
7. **No le preguntás nada al humano.** Lo que falta se resuelve leyendo el código, con la memoria o con un ruling anotado en el ledger. La única excepción es un **cambio de alcance**, que vuelve al humano como freno real.
8. **La memoria se actualiza, no se ignora.** `.hd/memory.md` es la fuente compartida: el paquete la referencia, la incorpora al commit y el QA verifica que no se contradigan.

## El paquete

Todo vive en `.hd/<trabajo>/`, en el repo donde se trabaja:

```
.hd/<trabajo>/
├── spec.md                 # el contrato con el humano: qué, por qué, alcance, criterios, Q&A
├── technical_spec.md       # el brief para la implementación: qué hacer, cómo encaja, resultado, prototipo
├── plans/                  # un archivo por plan, con archivos, interfaces y comportamiento esperado
├── prototype/              # prototipo visual (solo si hay UI), con README
├── discovery/              # notas y reportes de research
├── waves.md                # lo escribe el orquestador en la fase 3: su plan de olas
├── ledger.md               # memoria del trabajo: decisiones, evidencia, rulings
└── review-progress.md      # QA del paquete (fase 2) y revisión (fase 4)
```

La memoria vive en `.hd/memory.md`, compartida por todos los trabajos del repo.

## Paso 1 — Modo y tamaño del trabajo

El modo define la maquinaria, no el rigor. Viene definido desde discovery; si el código o el impacto lo contradicen fuerte, **subí de modo (ratchet)**, anotalo como ruling y seguí. No consultes.

| | Directo | Cambio chico | Mega cambio |
|---|---|---|---|
| **Señales** | 1-2 archivos, sin contratos nuevos, sin datos | Unas pocas piezas acotadas, un plan | 20+ archivos, módulos enteros, contratos compartidos, datos sensibles o en masa |
| **Research** | 1 área | 1 área | 1-3 áreas |
| **Planes** | 1 | 1 | Varios |
| **Olas** | 1 | 1 | Varias |
| **Prototipo** | Si hay UI | Si hay UI | Si hay UI |
| **Revisión** | Revisor de ola + auditor visual | Revisor de ola + auditor visual | Revisor por ola + auditor visual |
| **Datos** | No aplica | Preguntar | Ola final, sola, con respaldo y prueba en seco |

**El default es el más chico que no mienta.** Un trabajo de 1-2 archivos sin contratos nuevos va a directo: la maquinaria de olas no se amortiza.

**Señales de mega cambio:** refactor de grandes superficies; del orden de 20+ archivos sustanciales; crear o borrar módulos o servicios enteros; operaciones sobre datos sensibles o en masa; y la señal decisiva: **puede dejar el sistema inconsistente a mitad de camino**.

**Ratchet (unidireccional):** si aparece complejidad oculta, el trabajo sube: directo → chico → mega. Nada baja. Si la implementación descubre después que era más grande, también sube.

Si es mega cambio, anotá UNA vez en el ledger (y en el reporte final) que:

> En este modo no hay garantía de que todo salga bien a la primera. Por eso el trabajo se parte en olas chicas que se revisan una por una: es más barato encontrar un error en la ola 1 que en la ola 4, cuando ya hay código encima.

Anotá el modo en el spec, en el technical spec y en el ledger.

## Paso 2 — Rama, respaldo y comandos (antes de escribir)

- **Rama**: si discovery ya fijó una, usala. Si no, y estás en la rama default, creá `hd/<trabajo>` desde ahí; si ya estás en una rama no-default, usá esa. Anunciálo en una línea: la aprobación del trabajo ya ocurrió en discovery, no hay una segunda pausa acá. Nunca trabajes sobre la default salvo que el humano lo haya pedido.
- **Anotá por repo**: `Rama: <nombre> (nueva | existente | default)`, `base: <rama>`, `commit base: <sha>` y `Remote: <origin> | sin remote`.
- **Comandos de verificación**: `Build:`, `Lint:` y, si existe, `Estándares:` (`make check`, `pnpm verify`, `npm run check`). Si el repo no tiene alguno, `no aplica`; no lo inventes. Los usa el orquestador para el baseline y el gate.
- **Respaldo temporal**: si hay remote y la rama de trabajo no es la default, `hd-backup/<trabajo>` queda habilitado. Es temporal: `hd-close` lo borra al cerrar. Si se trabaja sobre la default o una rama ajena, `Respaldo: no aplica (<motivo>)`.
- **`.hd/` ignorado**: si el repo lo ignora, el paquete no se versiona. Anotalo en el ledger y seguí; no lo fuerces con `git add -f`.
- **Worktrees**: van en `.git/hd-wt/<trabajo>/`, no dentro del árbol. Anotá qué dependencias se linkean (`node_modules`, `.venv`, `vendor`, `target/`).

Anotá el baseline como `pendiente (se corre antes de la ola 1)`: lo corre el orquestador.

## Paso 3 — `spec.md`: el contrato con el humano

Usá `templates/spec-template.md`. Es el documento que el humano puede leer y que los revisores usan como fuente de verdad. Debe incluir:

- **Resumen del entendimiento** con las palabras del humano y del orquestador, **idéntico al resumen aprobado**. Si cambiaste algo, no es el mismo trabajo: volvé a discovery (preguntas) y pedí la aprobación de nuevo.
- **Qué se va a hacer** y **por qué**.
- **Alcance**: lo que entra, lo que no entra y lo que no se puede romper.
- **Criterios de aceptación** verificables: cada uno se responde sí/no mirando el sistema, no leyendo el código. Sin tests, esta lista es la checklist con la que el humano prueba el trabajo al final y el último respaldo del revisor.
- **Riesgos y mitigaciones**: datos, contratos rotos, consumidores, performance, seguridad, despliegue.
- **Decisiones y supuestos**: lo que se decidió en la Q&A y lo que se confirmó en la investigación.
- **Q&A completo**: todas las preguntas y respuestas de discovery, con sus respuestas. Sin recortes. Cada respuesta tiene su entrada `[decidido]` en `.hd/memory.md`.
- **Memoria**: qué entradas nuevas dejó el trabajo y cuáles son la fuente de las decisiones del spec.
- **Datos en producción**: si aplica, respaldo, prueba en seco, ventana y rollback.
- **Prototipo**: ruta, cómo abrirlo, qué cubre (o `no aplica` con motivo).
- **`technical_spec.md`**: ruta y una línea de qué contiene.
- **Enmiendas**: vacío al crear. Se usa solo si el humano aprueba un cambio de alcance durante la ejecución, con fecha, qué, por qué e impacto.
- **Aprobación**: fecha, qué aprobó el humano (resumen y prototipo) y que el paquete pasó el QA.

## Paso 4 — `technical_spec.md`: el brief para la implementación

Usá `templates/technical-spec-template.md`. **Este documento es la entrada de la implementación.** Los subagentes de implementación no tienen tu chat: todo lo que necesiten para ejecutar tiene que estar acá o en los archivos que referenciás. Vos lo relees en la fase 3; los subagentes lo consultan.

Debe incluir:

- **Misión**: qué tiene que lograr el trabajo, en dos o tres frases.
- **Mapa del paquete**: qué es cada archivo y en qué orden leerlo.
- **Contexto y arquitectura**: el mapa de impacto verificado —entry points, contratos, consumidores, datos, convenciones, build/lint, riesgos—. Con rutas, no con relatos.
- **Qué hay que construir**: por área o por pieza, en prosa. Sin lógica.
- **Contratos (Ola 0)**: si hay contratos nuevos que otras olas consumen, firmas exactas, tipos, constantes y formatos. Sin implementación.
- **Mapa de planes y olas**: una tabla con plan, ola propuesta, team sugerido (agente → archivos), objetivo, depende de y especialidad. Es una **propuesta**: el orquestador puede re-olear y rearmar teams, nunca cambiar el alcance.
- **Resultado esperado**: qué va a poder hacer el humano y qué va a cambiar en el sistema; qué NO cambia.
- **Prototipo**: ruta exacta, cómo abrirlo, qué cubre y qué no. Si no hay UI, decilo.
- **Verificación**: comandos de build, lint y estándares; baseline pendiente; tests existentes que no se tocan; chequeos manuales.
- **Restricciones y convenciones**: stack, capas, nombres, manejo de errores, logging, seguridad, performance, compatibilidad.
- **Trampas conocidas**: lo que el research encontró y puede morder.
- **Fuera de alcance**: explícito, para que la implementación no lo absorba.
- **Definición de terminado**: build + lint + estándares, revisores independientes por ola, auditoría visual de punta a punta y re-prueba. Sin tests.
- **Preguntas abiertas**: no debería haber. Si hay, el paquete no está listo.

## Paso 5 — Los planes

Un archivo por plan en `.hd/<trabajo>/plans/plan-NN-<nombre>.md`, con `templates/plan-template.md`.

Cada plan declara, con valores exactos (sin globs, sin "y archivos relacionados"):

- **Archivos**: cuáles crea, modifica y elimina. Todos de código; no hay archivos de tests.
- **Interfaces**: qué **consume** de planes anteriores y qué **produce** para posteriores, con firmas exactas.
- **Depende de**: qué olas anteriores. Nunca de otro plan de su misma ola.
- **Comportamiento esperado**: en prosa —entradas y salidas exactas, casos borde, errores y códigos, qué NO cambia—. Es la fuente del revisor: si falta algo, el plan no está listo.
- **Criterios de aceptación** del plan.
- **Especialidad sugerida** y **con quién comparte team** (el cálculo del orquestador; la implementación lo verifica).

**El paralelismo se calcula, no se intuye.** Dos piezas pueden ir en el mismo team (misma ola, mismo worktree) SOLO si:

1. sus archivos de código son disjuntos;
2. lo que uno produce no es lo que el otro consume;
3. no comparten estado mutable (misma base de datos, lock, puerto, archivo de config, servicio externo);
4. ninguno depende del otro;
5. ninguno toca la configuración que el otro necesita para compilar o pasar el lint;
6. ninguno cambia dependencias o lockfiles (eso se serializa: una instalación a la vez).

**El default es la ola más chica que termina el trabajo, con el team más grande que no se pise.** Agrupá piezas solo cuando todos los criterios se cumplan sin dudas. Ante la duda, serializá. **No fuerces paralelismo.** Un team no lleva más de **5 agentes**: más que eso no se integra ni se revisa bien, aunque los archivos sean disjuntos. Si hay más, partí en olas secuenciales.

**Estructura de olas (mega cambio):**

1. **Ola 0 — Contratos** (solo si hay contratos nuevos que otras olas consumen): tipos, esquemas, firmas, esqueleto inicial, migraciones de contrato. **Va sola y se revisa antes de seguir**: contrato mal = todo lo demás mal.
2. **Olas siguientes**: secuenciales. Cada ola lleva un team de hasta 5 agentes; el paralelismo vive dentro de la ola, no entre olas.
3. **Ola de datos**: todo lo que mueve datos existentes va en **su propia ola, al final, nunca en paralelo**. Antes: confirmar datos en producción, respaldo y prueba en seco.

Si no hay contratos nuevos que consuman otras olas, no inventes una Ola 0.

**Modo cambio chico:** un único `plans/plan-01-<nombre>.md`, breve, mismo esqueleto, una sola ola con un team chico.
**Modo directo:** un único plan mínimo, una sola ola, sin Ola 0 (salvo que el trabajo defina un contrato nuevo; ahí subí de modo).

## Paso 6 — El prototipo

Si hay UI, el prototipo ya se construyó y se aprobó en discovery. Antes de cerrar el paquete:

- verificá que esté en `.hd/<trabajo>/prototype/` con su `README.md`;
- verificá que abra sin build ni dependencias;
- verificá que refleje el resumen aprobado (flujos, estados, validaciones);
- si el humano pidió cambios visuales después de la aprobación, actualizalo y volvé a pedir OK solo por eso.

Si no hay UI, o si es un ajuste visual trivial que decidiste omitir, el spec y el technical spec dicen `Prototipo: no aplica (<motivo>)`. No inventes un prototipo para un cambio de backend.

El prototipo **no se copia al producto**: es una referencia visual y de comportamiento. Los implementadores lo implementan de nuevo con el stack y las convenciones del repo.

## Paso 7 — El ledger

Creá `.hd/<trabajo>/ledger.md` con primera línea `# HD ledger — trabajo: <nombre>`. Anotá:

- `Orquestador: <quién conduce>`, `Modo: ...`, `Rama: ...`, `Base: <sha>`, `Remote: ...`, `Respaldo: ...`
- `Memoria: .hd/memory.md (<N> entradas nuevas)`
- `Build: ...`, `Lint: ...`, `Estándares: ...`
- `Discovery: research y verificación cerrados (<fecha>)`
- `Discovery: research <áreas>; verificado a mano`
- `Decisión: ... — ...` (las que tomaste en nombre del humano)
- `Prototipo: ... | no aplica`
- `Paquete: QA APROBADO (<fecha>)`
- `Paquete: commit <sha>`

## Paso 8 — QA del paquete

Antes de commitear, un **subagente independiente** `qa-artefactos` audita el paquete. No es el orquestador, no es un research, no es el prototipo: es un revisor distinto, y **no ejecuta comandos**: lee archivos.

Pasale **rutas**: `spec.md`, `technical_spec.md`, cada plan, el prototipo, las notas, la memoria y el ledger. El QA busca:

1. **Coherencia con lo aprobado**: el spec no inventa alcance ni contradice el resumen, la Q&A o el prototipo.
2. **Criterios verificables**: cada criterio se responde sí/no mirando el sistema.
3. **Coherencia interna**: spec, technical spec y planes dicen lo mismo; no hay contradicciones entre ellos.
4. **Planes completos**: archivos exactos y disjuntos, interfaces produce/consume consistentes, dependencias por ola correctas, comportamiento esperado sin huecos.
5. **Technical spec suficiente**: la implementación puede ejecutar sin adivinar. Si falta contexto, se deniega.
6. **Prototipo**: existe si hay UI, abre, refleja el spec y tiene README; no se copia al producto.
7. **Sin lógica ni implementaciones**: solo contratos (firmas, tipos, constantes, formatos) cuando son Ola 0.
8. **Olas y teams**: Ola 0 sola si hay contratos, datos al final y en solitario, olas secuenciales, team de hasta 5 agentes con archivos disjuntos y un solo dueño por archivo compartido.
9. **Modo correcto** (ratchet) y riesgos/datos cubiertos.
10. **Implementable**: rutas, comandos Build/Lint/Estándares, rama, base y respaldo anotados.
11. **Sin tests** pedidos ni declarados.
12. **Memoria coherente**: el paquete no contradice `.hd/memory.md`, y las decisiones del spec tienen su entrada con fuente.

Veredicto **APROBADO** o **DENEGADO** en `.hd/<trabajo>/review-progress.md`, bloque `Paquete (fase 2)`, con hallazgos, archivo y qué falta para pasar a verde.

**Corrección (una sola):** si hay hallazgos, corregí los artefactos —un hallazgo, un cambio; sin ampliar alcance— y pedile al QA **una confirmación acotada a los hallazgos**, no una re-auditoría completa. Verde → seguí. Si sigue rojo → **freno real**: el paquete no se implementa y se lo decís al humano con diagnóstico.

## Paso 9 — Commit y respaldo del paquete

Con el QA verde:

- Commiteá el paquete: `hd(<trabajo>): contrato — spec, technical spec, planes y prototipo`. Incluí `spec.md`, `technical_spec.md`, `plans/`, `prototype/`, `discovery/`, `ledger.md`, `review-progress.md` y `.hd/memory.md`. Excluí `logs/` y lo que git ignore.
- **No fuerces** archivos ignorados con `-f`.
- Si el respaldo está habilitado, subí el commit a `hd-backup/<trabajo>`: `git push <remote> HEAD:refs/heads/hd-backup/<trabajo>`. Nunca `--force`. Si falla, anotá `Push: FALLIDO (<motivo>)` y seguí.
- Anotá en el ledger `Paquete: commit <sha>` y el resultado del push.
- Verificá que el árbol de trabajo quedó limpio (salvo los logs) y que la rama es la que dice el spec.

## Paso 10 — Seguir con la implementación

Con el paquete commiteado y el QA verde, **la implementación sigue en esta misma conversación**:

1. Decile al humano, en una línea y sin pedirle nada, dónde está el paquete y que sigue la implementación.
2. **Cargá la skill `hd-implement` VOS MISMO** y pasale la ruta `.hd/<trabajo>/`.
3. El mismo orquestador sigue, ahora orquestando la implementación: relee el paquete, verifica el código, arma las olas y despacha subagentes. No escribe código de producción.
4. Si la conversación se corta, el trabajo se retoma en otra pasando la ruta: el paquete es la fuente y no hace falta que el humano esté presente.

**No hay una transición obligatoria.** El paquete no contiene instrucciones de conversación: es un contrato técnico. La fuente sigue siendo el paquete, no la memoria del chat: releelo y verificá el código antes de despachar.

## Continuidad

La fuente es `.hd/<trabajo>/`: spec, technical spec, planes, prototipo, notas, ledger y review-progress. Si el trabajo se retoma tras una compactación, releé esos archivos, no tu memoria. No inventes archivos de memoria paralelos.

## Racionalizaciones comunes (y su realidad)

| Excusa | Realidad |
|---|---|
| "Es chico, salteamos el technical spec" | La implementación no tiene tu chat. Sin technical spec, adivina; con él, ejecuta. |
| "El spec ya está aprobado, no hace falta el QA" | La aprobación cubre el qué; el QA cubre la coherencia, los huecos y la implementabilidad. |
| "El QA lo reviso yo mismo" | El QA es un subagente distinto del autor: la autorevisión no es evidencia. |
| "Pongo el código en el plan así el implementador no se equivoca" | Plan con lógica = implementador redundante y plan envejecido. Firmas exactas sí; lógica nunca. |
| "Sin tests, el comportamiento esperado es opcional" | Es lo único que los revisores tienen para comparar. Sin él, la auditoría es a ciegas. |
| "Estos dos planes seguro no se pisan" | El paralelismo se calcula con archivos, interfaces y estado compartido, no se adivina. |
| "Un team de un solo agente es un defecto" | No: si la pieza es indivisible, un agente es lo correcto. El defecto es forzar paralelismo. |
| "Todo trabajo real es mega, por las dudas" | El criterio es "¿puede dejar el sistema inconsistente a mitad de camino?", no el tamaño percibido. |
| "Implemento un cachito mientras espero" | El orquestador no escribe código de producción: la implementación la hacen subagentes. |
| "El humano ya aprobó, no hay más preguntas" | La aprobación habilita el paquete; no reemplaza la coherencia ni el QA. |
| "Me falta un dato, le pregunto al humano" | Se resuelve con la memoria, el código o un ruling. Solo un cambio de alcance lo despierta. |
| "La implementación se retoma en otra conversación" | Se puede, pasando la ruta del paquete. Lo que no se salta es la relectura y la verificación del código. |
| "Total ya tengo el chat, no hace falta releer el paquete" | La fuente es el paquete. El chat no es el contrato; releelo antes de despachar. |
