---
name: hd-e2e
description: "Skill suelta de Hiper-driven (HD), fuera de la cadena de fases y que invoca únicamente el humano, nunca otra skill. Es el reemplazo de una suite de tests por una persona real. La primera corrida lanza varios agentes que mapean la lógica de negocio, los endpoints, las vistas y los roles, y escriben en .hd/e2e/ el mapa de la app y el catálogo de todos los casos de uso —rol, precondición, pasos exactos, resultado esperado y acción evasiva ante 401, 403, 404, 409, 422, 429, 500, timeouts y estados de UI—. Las corridas siguientes actualizan el catálogo de forma incremental contra git y ejecutan los casos como cada rol real (admin, usuario, staff), de punta a punta por la UI o contra la API. Cualquier desvío del resultado previsto es un caso fallido, que se clasifica en catálogo mal escrito, catálogo desactualizado o bug real. Corrige el catálogo con evidencia y entrega los bugs al humano sin tocar código de producción. Antes de cada corrida pide confirmación explícita por el consumo de tokens. Comprueba que las credenciales de terceros (pagos, mails, storage, IA) sean de sandbox y frena ante cualquier servicio productivo, desconocido o con costo hasta que el humano lo confirme por servicio. Solo corre contra entornos locales, nunca contra una base remota o de producción, y puede escribir scripts de utilidad (respaldo, usuarios, seeds) siempre que sean locales."
---

# HD — `hd-e2e`: la suite que es una persona

HD no escribe tests. `hd-e2e` es lo que los reemplaza cuando el humano quiere la app entera probada como la probaría él: **sin test runner, sin asserts y sin mocks** — un catálogo de casos de uso, escrito en prosa, que un agente ejecuta contra la aplicación real, con roles reales, en un entorno local.

**No es una fase.** No está en la cadena `discovery → spec → implement → review → close`, ninguna otra skill la encadena y `hd-close` no la espera. **La invoca únicamente el humano**, cuando quiere saber si la app sigue funcionando o antes de un release.

| | `hd-review` sub2 | `hd-e2e` |
|---|---|---|
| La invoca | `hd-review`, automático | solo el humano |
| Alcance | la feature del trabajo | la app entera |
| Contra qué | el spec y el prototipo | el catálogo de casos (la suite) |
| Roles | el de la feature | todos (admin, usuario, staff, los que existan) |
| Qué deja | auditoría de la feature | catálogo actualizado + reporte por caso |
| Código de producción | no lo toca | no lo toca |
| Cuándo | una vez por trabajo | cuando el humano lo pide |

Coexisten: sub2 mira la feature que se acaba de construir; `hd-e2e` mira el sistema completo y su regresión. Ninguna reemplaza a la otra.

## La corrida, de punta a punta

```
HUMANO pide la corrida
  │
  ├─ 0 · preflight ......... app levanta, DB local, roles existen ──→ si no, FRENO
  ├─ 0b · confirmación ..... alcance, agentes, costo, mutaciones ──→ sin "sí", no hay corrida
  │
  ├─ 1 · catálogo .......... primera vez: mapeo completo con varios agentes
  │                          después: incremental contra git
  ├─ 2 · QA del catálogo ... todo caso tiene rol, pasos, esperado y evasiva
  ├─ 3 · ejecución ......... una persona por rol, click por click o request por request
  ├─ 4 · triaje ............ catálogo mal | desactualizado | bug real
  ├─ 5 · re-ejecución ...... solo los casos corregidos
  └─ 6 · reporte + commit del catálogo
```

## Subagentes

| Subagente | Qué hace | Qué no hace |
|---|---|---|
| **Orquestador** | Preflight, confirmación, consolidación, triaje, corrección del catálogo, commits | No ejecuta casos, no escribe código |
| **Mapeador** (`mapeador-negocio`, `mapeador-api`, `mapeador-vistas`, `mapeador-roles`) | Lee el sistema y escribe su parte del mapa y los casos propuestos | No escribe datos, no consolida |
| **Ejecutor** (`e2e-<rol>`) | Entra como ese rol y usa la app como una persona, caso por caso | No edita el catálogo, no arregla código |
| **Auditor de catálogo** (`auditor-catalogo`) | Revisa que el catálogo cubra el mapa y tenga todo lo obligatorio | No ejecuta casos |

**Independencia:** el que escribe el caso no lo ejecuta; el que lo ejecuta no lo corrige; el que lo corrige no decide que está verde. El verde lo dice la evidencia de la ejecución.

## Reglas duras

1. **Solo el humano la invoca.** Ninguna fase, ni `hd-close`, ni `hd-fast-implement` la encadenan. Si el humano no la pidió, no corre.
2. **Confirmación explícita antes de cada corrida.** Alcance, agentes, costo, entorno, datos que se van a tocar y respaldo. Sin un "sí" del humano no se ejecuta nada — ni el mapeo.
3. **Solo local.** La app y la base se resuelven a la máquina donde corre el agente. Una base remota, un túnel SSH o un host con dominio son remotos, aunque el `.env` diga `development`.
4. **Terceros: sandbox o confirmación.** Pagos, mails, SMS, storage, mapas, IA y cualquier API externa se usan en modo de prueba, verificado por su propia señal —prefijo de la key, dashboard o endpoint de test—, no por el nombre de la variable. Si una credencial parece productiva, no se puede probar que sea sandbox o puede generar costos, **se frena** y se pide confirmación explícita servicio por servicio.
5. **El catálogo es la suite.** Un caso sin ID, rol, precondición, pasos, esperado observable y evasiva no existe y no se ejecuta.
6. **Desvío = fallo.** Si el resultado difiere de lo que prevé el catálogo, el caso es rojo. "Casi", "funciona igual" y "debería andar" no existen.
7. **La evasión restaura la precondición, no tapa el bug.** Se aplica, se registra y se sigue. Si después de la evasión el caso vuelve a fallar, es rojo.
8. **Tres salidas y ninguna cuarta.** Cada fallo es `CATALOGO_MAL`, `DESACTUALIZADO` o `BUG_REAL`. En la duda, `BUG_REAL`.
9. **El ejecutor no edita el catálogo.** El que falla no certifica su propio fallo: corrige el orquestador, con evidencia.
10. **Los bugs no se arreglan acá.** Se reportan con pasos exactos, esperado, obtenido, severidad y evidencia. El humano decide `hd-debug`, `hd-fast-implement` o un trabajo HD.
11. **Nunca código de producción.** Sí scripts de utilidad en `.hd/e2e/utilidades/` (respaldo, usuarios, seeds, limpieza), idempotentes y con nombres de prueba identificables.
12. **Antes de mutar, respaldo; después, limpieza selectiva.** Un restore completo puede borrar el trabajo del humano: no se hace sin permiso.
13. **Cada corrida commitea el catálogo y su reporte. Nunca push.**
14. **El árbol se declara.** Un verde sobre código sin commitear no es un verde de release.
15. **No se declara verde lo que no se ejecutó.** `BLOQUEADO` y "no verificado" son estados del reporte, no aprobaciones.
16. **El humano no prueba: la corrida lo reemplaza.** El veredicto es evidencia para su decisión, no una pregunta.
17. **Nada de tests.** Ni el catálogo se convierte en specs de Playwright, ni se agregan unit tests "de paso". La suite es texto.

## Seguridad de datos: solo local, y hay que probarlo

### Qué cuenta como local

- loopback (`localhost`, `127.0.0.1`, `::1`);
- un contenedor del mismo docker compose, publicado en el host;
- una base embebida en el repo (sqlite, pglite, duckdb);
- un servicio del compose sin publicar, siempre que el agente corra en esa misma máquina.

### Qué se prohíbe

- Cualquier host que no sea loopback ni un contenedor local: dominios, IPs privadas de la LAN, cloud (`rds.amazonaws.com`, Supabase, Neon, Railway, PlanetScale, Atlas).
- Un túnel SSH o port-forward: el host es `localhost` pero la base es remota.
- Credenciales de producción en el `.env`, aunque apunten a local.
- `NODE_ENV=production` o el build de producción como entorno de prueba.
- Pagos reales, mails o SMS a destinatarios reales y storage productivo **sin confirmación explícita** (ver *Terceros*).

### Terceros: sandbox o confirmación

La app habla con Stripe, un SMTP, un bucket, un proveedor de IA o de mapas. Una key productiva en una corrida de prueba cobra, manda mails a gente real o toca datos de clientes. Por eso **cada credencial de terceros se inventaría y se clasifica antes de ejecutar**:

| Clase | Qué hacer |
|---|---|
| `SANDBOX` | se usa, con la evidencia de por qué es sandbox |
| `DUDOSO` | se frena y se confirma |
| `PRODUCTIVO` | se frena y se confirma |
| `DESCONOCIDO` | se trata como productivo |

Inventario: cada variable de entorno, config, compose y bundle de frontend (`NEXT_PUBLIC_*`, `VITE_*`, `PUBLIC_*`) que apunte a un servicio externo. El nombre de la variable no prueba nada: `STRIPE_SECRET` puede ser live.

| Servicio | Señal de sandbox | Señal de productivo o dudoso |
|---|---|---|
| Stripe | keys `sk_test_` / `pk_test_`, dashboard en modo test | `sk_live_` / `pk_live_`, modo live |
| Mercado Pago | credenciales `TEST-...`, usuarios de prueba | credenciales de aplicación productiva |
| PayPal | `sandbox.paypal.com`, app de sandbox | live |
| Twilio | SID de prueba, números mágicos de test | número real, saldo real |
| Mails / SMTP | MailHog, Mailpit, SMTP local, dominio de prueba | proveedor real con dominio propio |
| Storage | MinIO / LocalStack, bucket `*-test` | bucket productivo, IAM amplio |
| IA (LLMs) | key de proyecto de prueba con límite de gasto | key productiva sin límite |
| Firebase | emuladores, proyecto `*-dev` | proyecto productivo |
| OAuth (Google, GitHub…) | app de prueba, client de desarrollo | app productiva |
| Mapas, geo, analytics | key restringida de prueba o deshabilitado en local | key con billing, property productiva |

Reglas:

- **Freno, no advertencia.** Ante `DUDOSO`, `PRODUCTIVO` o `DESCONOCIDO`, la corrida se detiene y se avisa con el servicio, la variable, qué acción lo usaría y el costo estimado. Se sigue solo con un "sí" explícito para **ese** servicio.
- **Costo desconocido = costo real.** Si no se puede estimar cuánto cuesta la acción (tokens, requests, mails), se declara "costo desconocido" y se trata como productivo.
- **Sin sandbox, el caso se bloquea.** Si el humano no confirma, los casos que dependen de ese servicio quedan `BLOQUEADO`; el resto de la suite se ejecuta igual.
- **Nada de "una pruebita".** No hay cobros de un dólar, ni un mail a la casilla del humano, ni un upload a un bucket real para "ver si anda".
- **Si el sandbox pide tarjeta o trial con costo**, también se frena: el gasto lo decide el humano.
- **El reporte lo deja por escrito**: servicio, variable (nunca el valor), cómo se verificó, costo estimado y confirmación con hora.

### Cómo se prueba (antes de tocar nada)

1. Resolvé el **DSN efectivo**, no el string: `DATABASE_URL`, `DB_HOST`, `PGHOST`, el compose, la config del ORM.
2. Mostralo en el reporte con el host resuelto y el nombre de la base.
3. Si el host no es loopback ni un servicio local del compose, **frená** y preguntá. No hay excepción "porque es staging".
4. Igual con la app: el server escucha en loopback o en un puerto local; si la URL apunta a un dominio, no es local.
5. Verificá que no haya túneles activos (`ssh -L`) hacia esa base.

### Mutaciones

- **Cuentas**: `e2e-*`, emails `e2e+<rol>@local.test`.
- **Datos**: solo los que el caso necesita, con prefijo detectable (`e2e-`, `E2E-`).
- **Antes de la primera mutación**: dump a `.hd/e2e/respaldo/<fecha>-<hora>.sql` (git-ignored).
- **Después**: borrar solo el namespace `e2e-*`. El resto de la base es del humano.
- Si la app tiene su propio hashing de contraseñas, usá su helper o su seed; no inventes hashes.

### Scripts de utilidad

La skill puede escribir los scripts que necesite para armar el entorno, en `.hd/e2e/utilidades/` y versionados con el catálogo:

- **respaldo** — dump de la base local antes de mutar (pg_dump, mysqldump, copia del sqlite).
- **crear-usuarios** — cuentas `e2e-*` con el rol que declara el catálogo, reusando el hashing de la app.
- **sembrar-datos** — los datos mínimos de cada flujo, con prefijo `e2e-`.
- **limpiar-datos** — borra solo el namespace `e2e-*`.

Reglas: idempotentes, con `--dry-run`, que se nieguen a correr si el DSN no es local, sin secretos adentro (leen de `.env` o de `credenciales.env`) y nunca dentro del código de la app ni del deploy. El ejecutor puede correrlos: son parte de la prueba, no del producto.

## La estructura en disco

```
.hd/e2e/
├── app-map.md              # mapa del sistema (roles, vistas, endpoints, reglas, flujos)
├── casos.md                # la suite: IDs estables, pasos, esperado, evasivas
├── estado.md               # commit base, última corrida, bugs abiertos
├── credenciales.env        # git-ignored
├── utilidades/             # scripts de respaldo, usuarios, seeds, limpieza
├── respaldo/               # dumps locales (git-ignored)
└── runs/
    └── <fecha>-<slug>/
        ├── reporte.md
        ├── ejecucion-<rol>.md
        └── evidencia/      # capturas, requests, logs (git-ignored)
```

**Regla de escala:** si `casos.md` pasa de ~400 líneas, se parte en `casos/<area>.md` y `casos.md` queda como índice; los IDs no cambian.

`.gitignore` mínimo:

```
.hd/e2e/credenciales.env
.hd/e2e/respaldo/
.hd/e2e/runs/*/evidencia/
```

## El catálogo: la suite

### IDs

`<AREA>-<NNN>` (`AUTH-001`, `ADMIN-014`, `VENTAS-007`). Inmutables: no se reusan ni se renumeran. Un caso que ya no aplica queda `RETIRADO` con el commit que lo sacó.

### Un caso, un objetivo

Si el caso tiene dos resultados esperados, son dos casos. Si necesita tres roles, son tres casos.

### Campos obligatorios

Rol, prioridad, precondición, datos, pasos exactos, esperado observable, evasiva y evidencia mínima.

"Observable" es texto en pantalla, estado del componente, código HTTP + cuerpo, fila en la base o mail en la bandeja local. No "funciona bien".

### Quién lo mantiene

El catálogo no se actualiza solo cuando alguien corre la suite: entre corridas se queda viejo. Lo mantienen las fases que ya tocan el comportamiento:

| Quién | Qué aporta | Cuándo |
|---|---|---|
| `hd-implement` | escribe los casos de lo que la ola cambia, **desde el plan**, y los commitea con la ola | cada ola |
| `hd-fast-implement` | deja el caso de su cambio en `NUEVO`, sin ejecutarlo | cada cambio directo |
| `hd-review` | el revisor marca el drift (cambió el comportamiento y no el caso); el auditor marca qué casos ejercitó y qué caminos descubrió | al cerrar el trabajo |
| `hd-e2e` | ejecuta el catálogo entero, lo corrige con evidencia y decide el veredicto | cuando el humano lo pide |

La regla que lo sostiene: **el que escribe el caso no lo ejecuta, y el que lo ejecuta no escribe el esperado mirando la app**. El esperado sale del plan aprobado; si el código hace otra cosa, es un bug que la ejecución va a encontrar, no un esperado que hay que ajustar.

Estados de un caso: `NUEVO` (nadie lo ejecutó todavía), `SIN_VERIFICAR` (cambió y hay que re-ejecutarlo), `PASA` / `FALLA` / `BLOQUEADO` (resultado de la última ejecución) y `RETIRADO` (ya no aplica). **Ningún caso nace verde.**

### Cobertura

- Cada rol del mapa tiene su caso de login y sus recorridos propios.
- Cada vista del mapa aparece en al menos un caso, o está declarada excluida con motivo.
- Cada endpoint aparece en al menos un caso (camino feliz y un error de permisos), o excluido.
- Los flujos críticos del mapa tienen su caso de punta a punta, no por partes.

### Evasivas (obligatorias por caso)

| Síntoma | Causa probable | Acción evasiva | ¿Tapa un bug? |
|---|---|---|---|
| 401 al entrar | sesión vieja o token vencido | cerrar sesión, borrar cookies, re-login | no |
| 401 a mitad de un paso | token vencido | refresh y reintentar el paso | no |
| 401 con credenciales correctas | auth roto, rate limit o cuenta bloqueada | restablecer la contraseña por la base local (solo local), re-login y un reintento | no: se registra y si repite es rojo |
| 403 | rol insuficiente o permiso mal puesto | verificar el rol real de la cuenta en la base; si el caso es de un rol que debería poder, es rojo | — |
| 404 | ruta mal o recurso que no existe | verificar la ruta en el `app-map` y crear el recurso con seed | no |
| 409 | conflicto con datos de corridas previas | limpiar el namespace `e2e-*` y reintentar | no, y se anota |
| 400/422 | payload fuera del contrato | corregir el payload contra el `app-map` y reintentar | no |
| 429 | rate limit | backoff y un reintento; si sigue, es entorno y el caso queda `BLOQUEADO` | no |
| 5xx | bug o dato corrupto | capturar log del server y el request, un reintento; si repite, es rojo | **nunca** |
| timeout | app colgada o base lenta | revisar procesos y base, un reintento; dos timeouts, rojo | no |
| pantalla en blanco | build roto o error de consola | consola, red y log del server; reiniciar; si persiste, rojo | no |

La evasiva se escribe **antes** de ejecutar, no se improvisa. Si aparece un síntoma sin evasiva prevista, el ejecutor para ese caso, lo marca `BLOQUEADO` y lo reporta.

## Paso 0 — Preflight

Antes de pedir confirmación, juntá los hechos. Es barato y evita confirmar sobre supuestos:

- cómo se levanta la app (comando, docker, puerto) y si levanta de verdad;
- dónde está la base, con el host resuelto, y si es local;
- si hay seeds y qué roles existen;
- si hay `.hd/e2e/`: catálogo, `estado.md`, último commit base;
- si la rama está sucia y qué archivos;
- qué servicios externos toca (mails, storage, pagos, IA, mapas) y **en qué modo está cada credencial** (ver *Terceros*): sin ese inventario no hay confirmación.

Si algo del preflight falla —la app no levanta, la base no es local, no hay forma de crear los roles—, **frená acá**: no hay confirmación sobre un entorno que no está listo.

## Paso 0b — Confirmación (bloqueante)

Nada de esto arranca sin un "sí". El mensaje, corto y con números:

```
Corrida hd-e2e — <app> @ <commit> (<rama>)
Modo: mapeo + corrida (primera vez) | corrida incremental (N áreas desde <commit>)
Agentes: 4 mapeadores + 3 ejecutores (admin, usuario, staff)
Casos: 0 (primera vez) | 128 completos | 14 de humo
Entorno: local — app en :3000, base postgres en localhost:5432
Datos: crea cuentas e2e-*, siembra 2 pedidos, respaldo previo en .hd/e2e/respaldo/
Terceros: Stripe sandbox (sk_test_), SMTP local (Mailpit), S3 MinIO — sin costo
          | PENDIENTE: <servicio> productivo, costo estimado <X> — necesito tu OK
Costo: es la corrida más cara del framework — varios agentes leyendo la app entera y uno por rol ejecutando.
¿Arranco? (sí | no | solo mapeo)
```

- Si dice **solo mapeo**, la corrida termina en el Paso 2: entrega el catálogo y no ejecuta nada.
- Si no contesta, **no hay corrida**. No se asume el sí.
- Si hay terceros dudosos o productivos, la corrida **no arranca** hasta que confirmes servicio por servicio o aceptes que sus casos queden `BLOQUEADO`.
- La aprobación se guarda en el reporte, con hora y texto.

## Paso 1 — El catálogo

### Primera vez: mapeo completo

Tantos mapeadores como áreas, hasta 5, en una sola tanda, con el modelo más barato que sea capaz de leer código (son lecturas largas, no juicio fino):

| Mapeador | Qué levanta |
|---|---|
| `mapeador-negocio` | entidades, estados, transiciones válidas, reglas, invariantes y qué datos mínimos necesita cada flujo |
| `mapeador-api` | endpoints, métodos, auth, permisos, validaciones, códigos, paginación y contratos |
| `mapeador-vistas` | rutas y pantallas, formularios, acciones, navegación y estados vacío/carga/error |
| `mapeador-roles` | matriz rol × acción, dónde se valida (UI y backend), cómo se crean y se asignan |
| `mapeador-datos` | seeds, fixtures, qué hace falta para probar cada flujo y cómo limpiar |

Cada uno escribe **dos archivos por área**: `.hd/e2e/mapa/<area>.md` (el mapa) y `.hd/e2e/mapa/casos-propuestos/<area>.md` (los casos que propone, todavía sin ID). Leen código, base **en solo lectura** y la app si hace falta; no escriben datos ni ejecutan acciones que muten.

El orquestador consolida en `app-map.md` y `casos.md`: deduplica, asigna IDs, ordena por área y rol, y descarta lo que el mapa no sostiene.

### Después: incremental contra git

1. Leé `estado.md`: commit base de la última corrida.
2. `git diff --name-only <base>..HEAD` y `git log --oneline <base>..HEAD`.
3. Mapeá archivos a áreas con los anclajes del `app-map.md`.
4. Re-mapeá solo esas áreas, con uno o dos mapeadores.
5. Agregá los casos de lo nuevo; marcá `RETIRADO` lo que se fue, con el commit.
6. Si el diff toca el núcleo (auth, permisos, modelos, migraciones, contratos compartidos), la corrida es **completa**, no humo: el núcleo arrastra todo.
7. Si el commit base no existe (force push, rebase), mapeo completo y lo declarás.

### Descubierto durante la ejecución

Si un ejecutor encuentra un comportamiento que el catálogo no tenía, lo anota como `DESCUBIERTO` con la evidencia. El orquestador lo convierte en caso nuevo y lo ejecuta en esa misma corrida si el ejecutor puede volver al punto; si no, queda como `NUEVO` para la próxima. No se inventa un caso a mitad de camino y se da por pasado.

## Paso 2 — QA del catálogo

Antes de ejecutar, el catálogo se audita a sí mismo. Con menos de ~60 casos lo hace el orquestador; con más, un `auditor-catalogo`.

- ¿Cada caso tiene los campos obligatorios y un esperado observable?
- ¿Cada rol del mapa tiene login y recorridos propios?
- ¿Cada vista y cada endpoint del mapa aparece en un caso o está excluido con motivo?
- ¿Hay IDs repetidos, pasos que dependen de otro caso sin decirlo, o precondiciones imposibles?
- ¿Las evasivas cubren 401, 403, 404, 409, 422, 429, 5xx y timeout?
- ¿Los datos de prueba se pueden crear y limpiar sin tocar datos del humano?

Rojo en el QA se corrige antes de ejecutar. Un catálogo roto ejecuta mentiras.

## Paso 3 — Ejecución

**Un ejecutor por rol**, cada uno con su sesión real y su parte del catálogo.

**Paralelismo:** por defecto, los roles van en serie cuando comparten datos (casi siempre). En paralelo solo si el `app-map` demuestra aislamiento (tenants, namespaces) o los casos son de lectura. Dos ejecutores pisando la misma entidad es un falso rojo garantizado.

Cada ejecutor recibe:

- el catálogo filtrado por su rol, con IDs;
- las credenciales (ruta al `.env`, nunca el contenido en el prompt);
- cómo se levanta y dónde;
- la tabla de evasivas;
- su carpeta de evidencia;
- la prohibición explícita de editar el catálogo o el código.

Cómo se ejecuta, en orden:

1. **Entra como esa persona**: por la UI si hay frontend; si no, con el token de esa cuenta contra la API. Si el rol tiene 2FA, se resuelve con el código local (seed TOTP) o el bypass de desarrollo documentado en el mapa; si no hay, `BLOQUEADO`.
2. **Recorre los casos en orden**, sin saltear pasos ni "adaptar" el flujo. Si un paso no se puede hacer, el caso es `BLOQUEADO` y se reporta por qué.
3. **Como humano**: en UI, teclado y mouse, volver atrás, refrescar, doble click, campos vacíos, datos raros. En API, secuencia completa (`POST` → `GET` → `PATCH` → `DELETE`), no un request suelto.
4. **Registra**: resultado por caso, evasiva usada y evidencia (captura, request/response, log).
5. **No arregla nada**, ni siquiera un typo.

**Forma de trabajar: un recorrido por rol, no un turno por caso.**

- **Un script recorre los casos.** El ejecutor escribe `recorrido-<rol>` (Playwright/CDP si es UI; `curl`/`fetch` si es API) que entra con la cuenta del rol, ejecuta sus casos en orden, guarda la evidencia de cada uno y vuelca consola, red y códigos a un log. Lo corre, lee el resultado y arma la tabla. **Un caso por turno son ~20 minutos por cada veinte casos**: cada turno cuesta cerca de un minuto.
- **El script se versiona** en `.hd/e2e/utilidades/recorrido-<rol>.<ext>`: la próxima corrida del mismo rol lo reusa, y la re-ejecución del Paso 5 sale casi gratis.
- **Presupuesto por caso**: si un caso no resuelve en ~2 minutos de reloj después de aplicar su evasiva, queda `BLOQUEADO` con el motivo escrito y el ejecutor sigue con el siguiente. No se investiga un caso media hora: se reporta y se decide.
- **Descubrir un camino nuevo no alarga la corrida**: se anota como `DESCUBIERTO` con lo que se vio y queda para el catálogo.

Formato (`.hd/e2e/runs/<fecha>/ejecucion-<rol>.md`):

```md
# Ejecución — rol <rol>
Sesión: <cuenta> · Inicio: <hora> · Fin: <hora>

| ID | Resultado | Esperado | Obtenido | Evasiva | Evidencia |
|---|---|---|---|---|---|
| AUTH-001 | PASA | ... | ... | — | evidencia/auth-001.png |
| ADMIN-004 | FALLA | ... | ... | re-login | evidencia/admin-004.png |
```

`PASA | FALLA | BLOQUEADO`. Nada más.

## Paso 4 — Triaje

Por cada `FALLA`:

1. Leé el caso y el `app-map.md`.
2. Buscá la decisión: `.hd/memory.md` (`[decidido]`), `spec.md` si existe, el registro de correcciones del catálogo.
3. Buscá el cambio: `git log -S`, `git log -- <archivo>`, `git blame` del área.
4. Clasificá:

| Clase | Cuándo | Qué se hace |
|---|---|---|
| `CATALOGO_MAL` | el esperado contradice una decisión registrada, o los pasos no pueden funcionar (ruta, selector, payload) | corregir el caso con la prueba y re-ejecutarlo |
| `DESACTUALIZADO` | hay un commit que decidió el cambio de comportamiento y el caso no lo siguió | actualizar el esperado citando el commit y re-ejecutarlo |
| `BUG_REAL` | la app se desvía de su propio contrato, o no hay evidencia de que el cambio haya sido decidido | reportarlo; no se toca |

**En la duda, `BUG_REAL`.** Un falso rojo se discute; un falso verde se descubre en producción. Y un cambio de comportamiento sin commit ni decisión que lo respalde no es "desactualizado": es un bug que alguien metió sin darse cuenta.

Correcciones del catálogo: las hace el orquestador, con una fila en el registro:

```
| <fecha> | <ID> | <qué cambió> | <commit o archivo:línea o decisión en memoria> |
```

Un caso que ya no existe se marca `RETIRADO` con el commit que lo sacó; no se borra.

## Paso 5 — Re-ejecución

Solo los casos corregidos, con el mismo ejecutor del rol y sobre el mismo entorno.

- Pasan: la corrección era buena y el catálogo queda confiable.
- Vuelven a fallar: la corrección estaba mal. Una segunda y última corrección; si vuelve a fallar, es `BUG_REAL` y se reporta. No hay tercera.

## Paso 6 — Reporte, commit y entrega

1. Escribí `runs/<fecha>/reporte.md` con el template.
2. Actualizá `estado.md`: commit base nuevo, fecha, casos y bugs abiertos con sus IDs.
3. Commiteá el catálogo y el reporte: `hd(e2e): corrida <fecha> — <verde|N fallos>`. **Nunca push.**
4. Entregá al humano, corto: veredicto, bugs reales con severidad, correcciones al catálogo, no verificado y costo. Y qué tiene que decidir.

Veredictos:

| Veredicto | Cuándo |
|---|---|
| `VERDE` | todos los casos `PASA` |
| `CON_FALLOS` | hay al menos un `BUG_REAL` |
| `INCOMPLETA` | algo quedó `BLOQUEADO` o no verificado |

Se pueden combinar: `CON_FALLOS (3) · INCOMPLETA (2)`. **Ninguno de los tres es una aprobación del humano**: es evidencia para que decida. Una corrida de humo se reporta como `VERDE (humo 14/128)` y no es un verde de suite.

## Modelos

- **Mapeadores**: el más barato y/o rápido que pueda leer código; son lecturas largas, no juicio fino.
- **Ejecutores**: el mejor **calidad/precio**; tienen que reconocer un desvío, no solo hacer clicks.
- **Triaje y corrección**: el de **mayor calidad disponible y permitido**; acá se decide si algo es un bug.
- Si hay `.hd/memory.md`, se lee la estrategia ya aprobada y no se vuelve a preguntar. Si no hay memoria, se propone en la confirmación.
- **Premium** (más de 5 USD/M en cualquier precio publicado): solo con permiso ya registrado. **Esta skill no lo pregunta**: si no hay permiso, se usa el mejor dentro del presupuesto y se anota el ruling.
- El catálogo de modelos no publica precios: si hace falta uno, se busca en las páginas oficiales.

## Lo que no se hace en esta skill

- No se escriben tests, ni specs de Playwright, ni unit tests "de paso".
- No se arregla código de producción ni se propone un fix más allá de la reproducción.
- No se corre contra producción, staging remoto ni datos reales.
- No se usan credenciales productivas ni se generan costos sin confirmación explícita por servicio.
- No la encadena otra skill; no se invoca sola.
- No se declara verde lo que no se ejecutó.
- No se reusan IDs ni se borran casos: se retiran.
- No se borran datos del humano: se limpia el namespace de prueba.
- No se reemplaza a `hd-review`: sub2 sigue auditando la feature de cada trabajo.
- No hay "modo rápido" por defecto: la corrida es el catálogo entero. `humo` existe solo si el humano lo pide, y el reporte lo declara.

## Racionalizaciones comunes (y su realidad)

| Excusa | Realidad |
|---|---|
| "La app no tiene frontend, pruebo la API y listo" | La API es evidencia válida para lo que expone; la UI sin probar se declara, no se aprueba. |
| "El 401 era el token, lo salteo" | Se evade y se registra. Si después de evadir vuelve a fallar, es rojo. |
| "Casi funciona, el botón está pero tarda" | Casi = rojo. El esperado dice estado y tiempo, no intención. |
| "Ese caso ya fallaba antes, lo marco conocido" | Un fallo conocido es un bug abierto en `estado.md`, no un pase. |
| "Cada caso merece su turno para mirarlo bien" | Un turno cuesta cerca de un minuto; veinte casos sueltos son veinte minutos. El script recorre los veinte y deja la misma evidencia en un par de minutos. |
| "El caso es raro, lo investigo hasta entenderlo" | Dos minutos y evasiva aplicada: si sigue raro, `BLOQUEADO` con el motivo. La corrida no se detiene por un caso. |
| "El catálogo estaba mal, lo borro" | Se corrige con evidencia o se retira con el commit; el ID no se borra. |
| "Cambió el código, actualizo el esperado" | Solo si hay un commit o una decisión que lo respalde. Si no, es bug. |
| "Es una base de desarrollo, puedo borrar todo" | La base local es del humano: respaldo y limpieza por namespace. |
| "Un restore del dump deja todo limpio" | Puede borrar trabajo del humano. Se pide permiso. |
| "Es local, no hace falta respaldo" | El respaldo es lo que hace reversible la corrida. |
| "Con un ejecutor alcanza, cambio de usuario entre casos" | Cada rol, su sesión: los permisos se prueban desde adentro. |
| "La primera corrida ya está, no hace falta re-mapear" | Sin incremental por git, el catálogo envejece y los verdes mienten. |
| "Lo probé por API, la UI seguro anda" | No es evidencia. Se declara no verificado. |
| "Verde con el árbol sucio es lo mismo" | No: no sabés qué código probaste. Se declara. |
| "Lo arreglo de paso, es un cambio chico" | Esta skill no escribe producción. El bug se reporta. |
| "Con confirmar una vez alcanza para todas las corridas" | La confirmación es por corrida: el costo y el entorno cambian. |
| "La key dice test, seguro es de prueba" | El nombre de la variable no prueba nada: prefijo, dashboard o endpoint de test. |
| "Un cobro de un dólar no es nada" | Es plata del humano y una transacción real. Sin sandbox, el caso queda bloqueado. |
| "El mail de prueba lo mando a mi casilla" | Un envío real puede costar y salir del sandbox. SMTP local o no se envía. |
| "El proveedor de IA es barato, nadie lo va a notar" | Consume saldo real del humano. Si la key no está limitada, es productiva. |
