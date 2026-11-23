---
name: hd-logic-comprehension
description: "Skill suelta de Hiper-driven (HD), fuera de la cadena de fases y sin rama, worktree, spec, olas ni tests. Se activa SIEMPRE que el humano pida entender o explicar cómo funciona algo —un flujo de pago, un checkout, una feature, un módulo, una integración, un bug—, aunque no nombre la skill: «explicame», «cómo funciona», «entendé esto», «de qué depende», «qué pasa si falla». Traza el código real de punta a punta, arma el mapa de capas y dependencias, el flujo paso a paso, las reglas de negocio, los casos borde y los hallazgos (bugs, validaciones faltantes, riesgos) con archivo:línea, y entrega una web estática HTML/CSS/JS en .hd/logic/<fecha>-<slug>/ que lo explica visualmente. Es solo lectura: no modifica código de producción, no arregla lo que encuentra y no pushea; si el humano pide arreglar, eso es hd-debug o hd-fast-implement."
---

# HD — Lupa: comprensión de lógica

**Qué es.** Una skill suelta, **fuera de la cadena de fases**. Convierte un pedido de «entendé esto» en una web estática que explica el flujo real, sus reglas, sus bordes y lo que está mal. No crea contrato, no abre rama, no arma olas, no revisa y no arregla: **lee el código y lo explica**.

**Se activa con el pedido, no con el nombre.** Si el humano dice «explicame», «cómo funciona», «entendé», «mapeá», «de qué depende», «qué pasa si», «por qué se comporta así», «qué validaciones faltan» o pide onboarding sobre una parte de la app, **esta skill se carga y se ejecuta**. No esperes a que la nombre.

**Regla de oro: entender no es tocar.** La única escritura permitida es la carpeta del mapa en `.hd/logic/<fecha>-<slug>/`. El código de producción, las migraciones, la configuración y los tests no se tocan. Si encontrás un bug, se documenta; si el humano pide arreglarlo, eso es `hd-debug` o `hd-fast-implement`, no esta skill.

## Qué NO es

- No es discovery: no pregunta para construir un contrato ni aprueba nada.
- No es `hd-review`: no es un gate, no corrige y no audita la app.
- No es `hd-debug`: no busca la causa raíz de un fix ni aplica uno.
- No es `hd-e2e`: no levanta la app ni ejecuta flujos; esta skill es lectura estática.
- No es una fase HD: no escribe `spec.md`, `technical_spec.md`, planes, `waves.md`, ledger ni review-progress.

## Paso 0 — Delimitar el pedido

- Repetí el pedido en una frase: **qué flujo**, **desde dónde hasta dónde**, **qué incluye y qué no**. El alcance va en la página.
- Si el humano nombró algo concreto («el flujo de pago con tarjeta»), ese es el alcance. Si dijo algo ancho («pagos»), tomá el **camino principal de compra** y listá suscripciones, reembolsos y otros caminos como **fuera de alcance** en Límites.
- Si la ambigüedad cambia por completo el trabajo, hacé **una sola pregunta corta**; si no, decidí y anotalo.
- Leé `.hd/memory.md` y, si existe, el `spec.md` y el `technical_spec.md` del trabajo: lo que ya está verificado no se vuelve a investigar ni se pregunta.
- Anotá rama, commit y fecha: la página los muestra.

## Paso 1 — Trazar el flujo real

- Buscá **todas las entradas**, no solo la que nombró el humano: rutas, controllers, handlers, webhooks, jobs, CLI y eventos de UI.
- Seguí la cadena de llamadas hasta la base, la cola o el servicio externo. En cada salto, anotá **`archivo:línea`**.
- Leé las guardas, condiciones, reintentos, transacciones, idempotencia y llamadas asíncronas. Ahí viven los casos borde.
- Reconstruí las **transiciones de estado** (qué estados existen, quién los cambia, qué los dispara).
- No confíes en el nombre de una función ni en el README: leé lo que hace. Si el README y el código discrepan, manda el código y anotá la discrepancia.
- Si el flujo cruza varios repos o módulos, trazá igual y usá la ruta de cada repo en la página.
- Si el flujo es enorme, acotá: camino principal + bordes que tocan **dinero, permisos o datos**. Lo no leído va a Límites.

## Paso 2 — Mapear capas y dependencias

Armá el mapa con estas capas (adaptá los nombres al proyecto, no las inventes):

| Capa | Qué muestra |
|---|---|
| **Entrada** | UI, rutas HTTP, webhooks, jobs, CLI: dónde nace el flujo. |
| **Aplicación** | Casos de uso y orquestación: quién valida, quién cobra, quién escribe. |
| **Dominio** | Entidades, estados, reglas y cálculos. |
| **Datos** | Tablas, colecciones, colas, outbox y qué se persiste. |
| **Externos** | Servicios de terceros, contratos y qué se les pide. |

Para cada pieza: **ruta, rol, qué entra y qué sale**. Para cada flecha: **quién llama a quién, con qué dato y si es síncrono o por evento**.

Después, el impacto:

- **Quién depende de esto**: paneles, jobs, emails, analytics, soporte, otros módulos.
- **Qué se rompe si cambia**: contratos, estados, tablas, eventos, pantallas.
- **Qué datos toca**: PII, datos financieros, secretos, stock, permisos; dónde están los límites de confianza.

## Paso 3 — Buscar lo que no se ve

### Reglas de negocio

Escribí **lo que el código aplica**, no lo que la documentación promete. Cada regla lleva:

- el texto de la regla,
- el tipo (cálculo, validación, permiso, límite, idempotencia, seguridad, alcance),
- **`archivo:línea`**,
- qué pasa si se rompe.

### Casos borde

Recorré, como mínimo: vacío/nulo, duplicados, doble clic, fallo parcial, timeout, reintento, concurrencia, orden expirada, permisos y roles, límites y cuotas, replay de webhooks, reembolsos y contracargos, montos en cero o negativos, redondeo y moneda, recuperación después de un corte. Para cada caso:

- **esperado**,
- **actual** (lo que hace el código hoy),
- **estado**: `cubierto`, `dudoso`, `roto` o `no-verificado`,
- **evidencia** con `archivo:línea`.

### Hallazgos

Cada hallazgo es un bug, una **validación faltante**, un riesgo o deuda. Lleva:

- tipo y **severidad** (alta: pierde dinero, datos o seguridad, o deja el sistema inconsistente; media: comportamiento incorrecto visible; baja: deuda),
- **confianza** (alta: seguiste el código y el caso se cae; media: hay una condición que no pudiste confirmar; baja: olor o deuda),
- evidencia `archivo:línea`,
- impacto concreto,
- sugerencia de arreglo **sin aplicarla**.

**Un hallazgo sin `archivo:línea` no entra.** No infles la lista para llenar la página: si no encontrás nada, la página dice «no se encontraron problemas con la evidencia leída» y Límites explica qué no se pudo verificar.

## Paso 4 — Armar la web

La página vive en `.hd/logic/<fecha>-<slug>/` y tiene **tres archivos**:

```
.hd/logic/<fecha>-<slug>/
├── index.html   # estructura y secciones
├── styles.css   # estilos (claro y oscuro automáticos)
└── app.js       # window.HD_MAPA con los datos + render
```

- Copiá los tres archivos de `templates/mapa-logica/` (relativo a este SKILL.md).
- Editá **solo `app.js`**: reemplazá `window.HD_MAPA` con los datos reales. Los campos están documentados en el encabezado.
- Poné `demo: false` o borrá la clave. Si queda `demo: true`, la página muestra el cartel de ejemplo y **no sirve**.
- Escribí en el idioma del humano; si no es español, traducí también los textos fijos de `index.html`, el `lang` y el cartel de `app.js`.

**Contenido obligatorio, en este orden:**

1. **El mapa**: las capas y sus piezas, y las conexiones clave. Cada caja con ruta y rol.
2. **El flujo**: el camino principal paso a paso, con entradas, datos que toca, decisiones, caminos alternativos y errores.
3. **Reglas de negocio**: con evidencia y consecuencia.
4. **Casos borde**: esperado, actual, estado y evidencia.
5. **Hallazgos**: filtrables por tipo, ordenados por severidad.
6. **Impacto**: quién depende, qué se rompe si cambia, qué datos toca.
7. **Archivos clave**: ruta, capa y rol.
8. **Límites**: qué no se leyó, qué es inferencia, qué no se verificó.

Reglas de la página:

- **Visual, no un muro de texto.** El flujo es un diagrama/stepper; los hallazgos se escanean en segundos; el detalle va plegado.
- **No vuelques código.** Fragmentos cortos solo si aclaran; el camino y las reglas son lo importante.
- **Sin red**: sin CDN, fuentes externas, imágenes remotas ni `fetch()` de archivos locales.
- **Cada afirmación del mapa se sostiene con código.** Si no pudiste verificarla, va a Límites.
- **No es el producto**: no se copia al repo de la app, no se publica, no se sirve.

## Paso 5 — Verificar la página

- Abrí `index.html` (doble clic o el navegador disponible) y recorré las ocho secciones.
- Probá los filtros de hallazgos y los acordeones del flujo; consola sin errores; ningún pedido a la red.
- `node --check .hd/logic/<fecha>-<slug>/app.js` si hay Node.
- Volvé a leer en el código **las tres afirmaciones que más importan** (la entrada del flujo, la regla principal y el hallazgo de severidad alta). Si no se sostienen, corregí la página.
- Si el navegador no arranca: validá el JS, revisá el HTML y **decilo**; no declares la página verificada.

## Paso 6 — Entregar

- Un párrafo: **qué hace el flujo**, los **2-3 hallazgos** más importantes y la **ruta de la página**. No pegues la página en el chat.
- Decí explícitamente qué **no se pudo verificar** (los Límites).
- Si el humano pide arreglar lo encontrado, **no lo hagas acá**: cargá `hd-debug` o `hd-fast-implement` y dejá el mapa como evidencia.

## Git

- Si el repo usa git, `.hd/` no está ignorado y el humano no pidió lo contrario, commiteá **solo** la carpeta nueva `.hd/logic/<fecha>-<slug>/` con un mensaje `hd(logic): ...`. No pushees.
- Si hay cambios ajenos en el working tree, no los toques ni los commitees.
- Si `.hd/` está ignorado, dejá la página local y reportá la ruta; no uses `git add -f`.
- Si el humano pidió no tocar git, no lo hagas.

## Si el código es grande

- Repartí la lectura en subagentes por área (entradas, dominio, datos/externos) **solo si el harness lo permite**; cada uno devuelve `archivo:línea`, no prosa.
- Consolidá vos: la conclusión, la severidad y la página no se delegan.
- Priorizá el camino principal y los bordes de dinero, permisos y datos; el resto va a Límites.

## Prohibido

- Modificar código de producción, migraciones, configuración o tests.
- Crear rama, worktree, spec, planes, ledger, olas, QA, revisión o commits de producto.
- Ejecutar migraciones, cobros, requests que muten datos o levantar la app.
- Instalar dependencias o usar red para «entender» lo que el repo no dice.
- Inventar reglas, casos o bugs; o presentar una inferencia como hecho.
- Pushear.
- Preguntar más de una vez o preguntar lo que el código y la memoria ya responden.

La página es el entregable; el chat solo la resume. Si el humano no puede entender el flujo en cinco minutos, la página no está terminada.
