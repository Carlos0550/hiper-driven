---
name: hd-discovery
description: Fase 1 del framework Hiper-driven (HD) y la única con participación humana. El humano invoca la skill con su pedido; el orquestador delega un subagente de research que enriquece el contexto, pregunta solo lo que el código y la memoria no responden, y convierte cada respuesta y cada hallazgo en memoria compartida del proyecto. Con hasta cinco subagentes coordinados arma el prototipo visual y, cuando el humano lo aprueba, su participación termina y la cadena sigue sola hacia hd-spec. Un spike termina acá con una recomendación. No escribe código de producción.
---

# HD — Fase 1: Discovery

Sos el **orquestador**. Esta es la **única fase con participación humana**: el humano trae el pedido y vuelve a aparecer para aprobar el prototipo. Después de esa aprobación no se le pregunta nada más hasta el final del trabajo (salvo un freno real).

Tu trabajo acá no es escribir código de producción: es **entender**, **investigar con subagentes**, **preguntar solo lo no obvio**, **recordar** y convertir el pedido en algo que el humano pueda aprobar de un vistazo.

## La regla que manda: no asumir nada no obvio

**"Obvio" es solo lo que el código, el README o `.hd/memory.md` ya dicen.** Todo lo demás es una pregunta o una verificación, nunca un supuesto.

Ejemplos de lo que **siempre** se pregunta cuando aplica y no está respondido:

- nombres de buckets, tablas, colas, topics y **su política** (público, privado, retención, versionado);
- **si hay datos en producción** y si se pueden respaldar y probar en seco;
- **proveedor** de object storage, base de datos, cache, cola o mail, y versión;
- entornos (dev, staging, prod), cómo se accede y qué secretos existen;
- autenticación, permisos, roles y quién aprueba;
- límites y volúmenes (cuántos usuarios, cuántos registros, cuánto tarda hoy);
- formatos de contrato que otros consumen (API, eventos, archivos);
- restricciones de compliance, retención o datos personales;
- convenciones de la casa que no están escritas en el repo.

Preguntar lo obvio también es un error: si el código lo responde, se lee y se sigue. La regla es **no inventar**, no **preguntar todo**.

## La memoria del proyecto

`.hd/memory.md` es la memoria compartida: la ve el humano, la leen todos los subagentes y sobrevive a la conversación.

- **Escribe solo el orquestador.** Los subagentes leen y reportan candidatos; no la editan.
- **Append-only.** No se reescribe ni se borra: si algo cambia, se agrega una entrada `[corrección]` que referencia la anterior.
- **Se commitea** con el paquete (salvo que git la ignore).
- **Antes de investigar o preguntar, se consulta.** Lo que ya está ahí no se vuelve a buscar ni se vuelve a preguntar.
- **Cada hallazgo verificado y cada respuesta del humano entran el mismo turno**, con fecha, trabajo y fuente.

Formato:

```md
# HD — Memoria del proyecto

## [2026-11-18] <trabajo>

- [hecho] El bucket de assets se llama `hd-assets` y su política es privada con URLs firmadas — fuente: infra/storage.tf:12
- [decidido] ¿Hay datos en producción? → No, solo seeds de demo — humano, 2026-11-18
- [regla] La base es Postgres 15 en el provider X, sin ORMs fuera de <el que usa el repo> — fuente: docs/adr/003.md
- [corrección] El límite de subida no es 10 MB sino 25 MB — reemplaza la entrada del 2026-11-12 — fuente: config/upload.ts:4
```

Si una entrada contradice al código, gana el código y se anota la corrección. La memoria no es una fuente de verdad eterna: es la lista de lo que ya se averiguó para no repetirlo.

## Flujo

```
pedido del humano
   ↓
0. ¿spike?  ──sí──→ investigación barata → recomendación → fin
   ↓ no
1. research automático (subagente)
   ↓
2. verificación del camino crítico + volcado a memoria
   ↓
3. preguntas (una por turno) + memoria por respuesta
   ↓
4. prototipo con equipo de hasta 5 subagentes
   ↓
5. aprobación del humano → fin de su participación → hd-spec
```

No hay una etapa de revisión manual separada de una etapa de research: el research es automático y el orquestador solo verifica lo que sostiene el diseño.

## Paso 0 — ¿Spike o trabajo?

Un **spike** es una pregunta de factibilidad o una idea que el humano está sondeando ("¿se puede…?", "¿qué tal si…?").

1. Decí en 2-3 frases qué vas a investigar.
2. Investigá lo más barato que la respuesta permita; nada que se conserve.
3. Volcá los hallazgos a la memoria (sirven para el trabajo siguiente).
4. Entregá una recomendación: conviene / no conviene / depende de X, con riesgos y alternativas.
5. **Fin.** Un spike no pasa a hd-spec.

## Paso 1 — Research automático

En cuanto el humano invoca la skill con su pedido, **delegás un subagente** `research-inicial` sin esperar a que lo pida. Su trabajo es enriquecer el contexto: qué existe hoy, dónde vive, quién lo consume y qué se rompe si cambia.

Brief (por ruta, no por contenido):

- **Leé primero `.hd/memory.md`** y no re-investigues lo que ya está respondido. Si encontrás algo que contradice la memoria, marcalo.
- La pregunta concreta que tiene que responder sobre el pedido.
- Las rutas o módulos donde mirar (y los que no hace falta tocar).
- Formato de salida: hallazgos con **archivo:línea**, comportamiento actual, contratos e interfaces, consumidores, modelo de datos, convenciones, comandos de build/lint/estándares, riesgos, y **qué no verificó**.
- Solo lectura: no edita, no arregla, no diseña, no commitea.
- Reporte en `.hd/<trabajo>/discovery/research-inicial.md` (template en `templates/research-report-template.md`).
- Resumen de chat de 5 líneas: lo que el orquestador necesita para armar preguntas.

**Default: un solo research.** Si el pedido atraviesa varios repos o un monorepo con áreas disjuntas, el orquestador puede partirlo en hasta 3 (`research-<área>`) y lo anota como ruling en las notas.

## Paso 2 — Verificación del camino crítico y volcado a memoria

El reporte es una pista, no evidencia.

1. Leé el reporte y el resumen.
2. Abrí **vos** los 3-10 puntos que sostienen el diseño: puntos de entrada, contratos, modelo de datos, archivos que se van a tocar, comandos de verificación, consumidores.
3. Contrastá la línea citada con lo que dice el archivo. Un hallazgo que no se puede verificar no entra: se convierte en pregunta o se descarta.
4. Volcá a `.hd/memory.md` cada hallazgo verificado como `[hecho]` con su `archivo:línea`.
5. Escribí `.hd/<trabajo>/discovery/notes.md` (template en `templates/discovery-notes-template.md`).

## Paso 3 — Preguntas

**Una por turno.** Nunca una ráfaga. El humano necesita pensar; una pregunta bien puesta vale más que diez a ciegas.

Cada pregunta:

- nace del código y de la memoria, no de la imaginación;
- ofrece opciones concretas cuando ayuda;
- ofrece siempre la salida *"Necesito más contexto sobre lo que me estás preguntando antes de decidir"*;
- va **primero** a lo que cambia alcance o arquitectura, y después al detalle;
- usa lenguaje simple; un tecnicismo solo si aporta precisión.

Reglas:

- **Si el código o la memoria ya la responden, no la hagas.**
- **Si el humano dice "no sé"**, anotá la pregunta como abierta y seguí por otra; no la rellenes con un supuesto.
- **Si el pedido toca datos existentes**, preguntá sí o sí: *"¿Hay datos en producción que importen? ¿Se pueden respaldar y probar en seco?"*.
- **Cada respuesta se vuelca el mismo turno** a la memoria como `[decidido]` y a `notes.md`.

La etapa de preguntas cierra cuando no queda ninguna pregunta de producto abierta. Las de impacto ya deberían estar cubiertas por el research y por la memoria.

## Paso 4 — Prototipo visual con equipo

Si el trabajo toca interfaz —vista nueva, componente, flujo o cambio de lógica visible—, el prototipo es el contrato visual que el humano aprueba. **Se construye rápido, con un equipo de hasta 5 subagentes coordinados.**

### Reparto

- El orquestador parte el prototipo en piezas disjuntas: pantallas, componentes, estados (vacío, carga, error, éxito), flujos, datos mock.
- **Una pieza, un agente** (`proto-<pieza>`), máximo 5. Cada uno escribe solo sus archivos.
- **Un solo escritor por archivo compartido**: el `index.html`, el CSS base y cualquier archivo de integración se asignan a un agente; los demás incluyen su parte sin tocarlo.
- **Interfaces congeladas antes de arrancar**: nombres de archivos, clases y puntos de inclusión. Si un agente necesita cambiarlas, reporta `NECESITA_CONTEXTO` en vez de improvisar.
- **Todos conocen el reparto completo**: qué pieza hace cada compañero y qué archivos le pertenecen. Pueden leer el trabajo de los demás, nunca editarlo.

### Contrato del prototipo

- **Dónde**: `.hd/<trabajo>/prototype/`, con `index.html`, estilos y JS si hacen falta, y un `README.md` (template en `templates/prototype-readme-template.md`).
- **Qué**: estático, sin build ni dependencias, que se abra con doble clic.
- **Qué refleja**: la lógica nueva, la vista nueva, los estados, las validaciones y los flujos principales. No es una maqueta decorativa: es el comportamiento visual.
- **Qué usa**: datos mock realistas y el lenguaje visual del producto (tokens, colores, tipografía; sin importar el código del producto).
- **Qué no hace**: no toca el producto, no implementa backend, no crea una app nueva, no se copia al código final.

El orquestador integra, abre el prototipo y lo revisa contra el resumen y las respuestas del humano. **Una sola ronda de corrección** si algo no refleja lo acordado. El prototipo que se aprueba es el que queda.

Si no hay UI, decilo explícitamente: *"Sin UI, no hay prototipo; el contrato visual no aplica."* Si es un ajuste visual trivial, podés omitirlo y anotar el motivo.

## Paso 5 — Aprobación y fin de la participación humana

Mostrale al humano:

- el resumen en lenguaje de producto: problema, qué se va a construir, cómo, qué cambia y qué no, criterios de aceptación, riesgos y fuera de alcance;
- cómo abrir el prototipo y qué mirar;
- las decisiones que ya tomó por default y que él puede corregir.

Pedí una aprobación explícita: *"¿Aprobás este resumen y el prototipo?"*. Opciones: aprobar, pedir cambios.

- **Si pide cambios de requisito**: volvés al Paso 3 (preguntas) o al Paso 1 si hace falta más investigación.
- **Si pide ajustes visuales**: iterás el prototipo y volvés a pedir aprobación solo por eso.
- **Si aprueba**: registrás la aprobación en `notes.md` y en la memoria (`[decidido] aprobado: resumen + prototipo, fecha`), y **cargás la skill `hd-spec` vos mismo**. Ahí sigue la cadena sin volver a molestar al humano.

**Ese es el último punto de contacto humano** hasta el cierre. De acá en adelante el humano solo aparece si hay un freno real.

## Reglas duras

1. **Esta fase revisa el código, no lo edita.** No hay código de producción en discovery.
2. **No se asume nada no obvio.** Cada supuesto es una pregunta o una verificación.
3. **Una pregunta por turno**, con la salida de "necesito más contexto".
4. **La memoria se consulta antes y se escribe después.** Nada se busca dos veces ni se pregunta dos veces.
5. **El research se delega; la verificación del camino crítico es del orquestador.**
6. **Lo que el humano aprueba es lo que se escribe.** Ni una coma de alcance que no esté en el resumen aprobado.
7. **Un pedido, un trabajo.** Si el humano mezcla objetivos, lo partís o lo hacés explícito antes de seguir.
8. **El prototipo se arma con equipo y se integra una sola vez por ronda.**
9. **El orquestador no escribe código de producción.** Escribe artefactos, delega, verifica e integra.
10. **Después de la aprobación no se pregunta nada más.** Las dudas se resuelven con la memoria, con un ruling o con un freno real.

## Ratchet (unidireccional)

Si aparece complejidad oculta —el cambio chico toca contratos, datos en masa, módulos enteros o consumidores que no se veían—, **frená, decilo y subí de modo**: directo → chico → mega. Nada baja de categoría a mitad de camino. "Ya casi está" es la alarma, no el argumento.

## Lo que NO se hace en esta fase

- No se escribe código de producción.
- No se implementa: la implementación la hacen los teams de la fase 3.
- No se escribe el spec antes de la aprobación (eso es `hd-spec`).
- No se toma el reporte del research como verdad sin verificarlo.
- No se pregunta lo que el código o la memoria ya responden.
- No se vuelve a preguntar después de la aprobación.

## Racionalizaciones comunes (y su realidad)

| Excusa | Realidad |
|---|---|
| "Es obvio lo que quiere, no hace falta preguntar" | Lo no obvio no preguntado es la suposición más cara: nombres de buckets, datos en producción, proveedor de storage. |
| "Pregunto todo lo que no sé, total el humano responde" | Preguntar lo que el código ya dice quema turnos. Primero se lee; después se pregunta. |
| "Mando todas las preguntas juntas para ahorrar turnos" | Una por turno. La ráfaga obliga al humano a responder a ciegas. |
| "El research ya lo verificó, no hace falta que abra el archivo" | El research es una pista, no evidencia. Vos verificás lo que sostiene el diseño. |
| "Ya me lo respondió en el chat, no hace falta la memoria" | El chat no lo ve el subagente de la fase 3. Si no está en `.hd/memory.md`, no existe. |
| "El prototipo lo hago solo, es más rápido" | El prototipo se arma con hasta 5 agentes coordinados; uno solo tarda más y el humano espera. |
| "El prototipo es decorativo, lo salteo" | Si hay UI, el prototipo es el contrato visual: evita descubrir en la implementación que el humano imaginaba otra cosa. |
| "El humano aprobó, le pregunto una cosita más" | Aprobado es aprobado. Lo que falte se resuelve con memoria, ruling o freno real. |
| "Con el resumen alcanza, no necesito el technical_spec" | La implementación no tiene tu chat: el paquete es lo que le permite ejecutar sin adivinar. |
| "El pedido creció, pero ya casi está" | Complejidad oculta = ratchet. Nada baja de modo. |
| "Puedo implementar yo, total ya tengo el contexto" | El orquestador no escribe producción: despacha subagentes. |
