# Mapa de la app — <nombre>

> Lo escribe `hd-e2e` y lo lee todo el que toca el catálogo. Cada afirmación lleva `archivo:línea` o evidencia de ejecución: sin anclaje, no es un hecho.
> Última actualización: <fecha> · Commit: <sha> · Corrida: <run>

## 1. Qué es y cómo se levanta

- Qué hace la app, en dos renglones.
- Stack y piezas (frontend, backend, workers, cron).
- Comando de arranque, puerto, dependencias y variables obligatorias.
- Cómo se sabe que arrancó (healthcheck, log, pantalla).

## 2. Entorno y datos

| Qué | Valor | Cómo se verifica |
|---|---|---|
| App | http://localhost:<puerto> | <comando o pantalla> |
| Base | <motor> en <host>:<puerto>/<base> | `docker compose ps` / `psql` |
| Seeds | <comando> | <qué crea> |
| Mails | Mailpit / MailHog en <url> | <cómo se lee> |
| Storage | MinIO / local en <url> | <bucket> |
| Terceros | <servicio> — <SANDBOX/PRODUCTIVO/DESCONOCIDO> | <señal que lo prueba> |

## 3. Roles y permisos

| Rol | Cómo se crea | Qué puede | Qué no puede | Dónde se valida |
|---|---|---|---|---|
| <rol> | <seeds / admin / DB> | <acciones> | <acciones> | `archivo:línea` |

## 4. Entidades, estados y reglas

| Entidad | Campos clave | Estados | Transiciones válidas | Reglas |
|---|---|---|---|---|
| <entidad> | <campos> | <estados> | <A → B> | <R1, R2> |

Reglas con nombre:

### R1 — <nombre>
- **Qué dice:** <regla de negocio, en una frase testeable>
- **Dónde vive:** `archivo:línea`
- **Cómo se observa:** <qué se ve en pantalla / qué responde la API / qué queda en la base>
- **Qué la rompe:** <entrada o secuencia que la viola>

## 5. Vistas y rutas

| Ruta | Pantalla | Rol | Acciones | Estados (vacío / carga / error) | Archivo |
|---|---|---|---|---|---|
| `/ruta` | <nombre> | <rol> | <botones, formularios> | <qué se ve en cada uno> | `archivo:línea` |

## 6. Endpoints

| Método | Ruta | Auth | Rol | Body / query | Respuestas | Archivo |
|---|---|---|---|---|---|---|
| `POST` | `/api/...` | <token / cookie / pública> | <rol> | <campos> | 200, 400, 401, 403 | `archivo:línea` |

## 7. Flujos críticos

### <flujo>
1. <paso>
2. <paso>

Puntos de falla conocidos: <qué suele romperse y cómo se nota>.

## 8. Qué no se prueba y por qué

| Pieza | Motivo | Quién lo cubre |
|---|---|---|
| <webhook externo> | no hay sandbox | declarado residual |
