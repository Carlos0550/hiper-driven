# Corrida hd-e2e — <fecha> <slug>

## Contexto

- **App:** <nombre> · **Rama:** <rama> · **Commit:** <sha>
- **Árbol:** limpio | sucio (<N> archivos) — un verde sucio no es verde de release
- **Alcance:** completa (<N> casos) | humo (<N>/<M>) | solo mapeo | incremental (<áreas>)
- **Agentes:** <N> mapeadores, <M> ejecutores (<roles>), <K> auditor de catálogo
- **Aprobación del humano:** "<texto exacto>" — <hora>

## Entorno

| Qué | Valor | Verificación |
|---|---|---|
| Base | <motor> en <host>:<puerto>/<base> | local (host resuelto, sin túnel) |
| Respaldo | `.hd/e2e/respaldo/<archivo>` | <tamaño / fecha> |
| Servicios externos | <mailpit, minio, ...> | <url local> |

## Terceros

| Servicio | Variable | Clase | Cómo se verificó | Costo estimado | Confirmación |
|---|---|---|---|---|---|
| Stripe | `STRIPE_SECRET` | SANDBOX | prefijo `sk_test_` | 0 | no requiere |
| <servicio> | <variable> | PRODUCTIVO | <señal> | <X> | "<texto>" — <hora> |

## Veredicto

`VERDE` | `CON_FALLOS (N)` | `INCOMPLETA (M)` — <una línea de por qué>

## Resultado por caso

| ID | Rol | Resultado | Evasiva | Evidencia |
|---|---|---|---|---|
| AUTH-001 | usuario | PASA | — | `evidencia/auth-001.png` |

## Fallos

### <ID> — `BUG_REAL`

- **Pasos exactos:** <reproducibles por otra persona>
- **Esperado / obtenido:** <texto del catálogo vs. lo que pasó>
- **Evidencia:** <captura, request/response, log>
- **Severidad e impacto:** <qué se rompe para quién>
- **Acción:** reportado al humano; no se toca el código

### <ID> — `CATALOGO_MAL` | `DESACTUALIZADO`

- **Qué decía el catálogo:** <texto>
- **Qué se corrigió:** <texto>
- **Prueba:** <commit / archivo:línea / decisión en memoria>

## Correcciones al catálogo

| Fecha | ID | Qué cambió | Evidencia |
|---|---|---|---|

## Descubierto

| Qué | Evidencia | Caso nuevo |
|---|---|---|

## No verificado / bloqueado

| Caso | Motivo | Qué haría falta |
|---|---|---|

## Datos y limpieza

- Creado: <cuentas `e2e-*`, datos>
- Limpiado: <qué se borró>
- Queda: <si algo no se pudo limpiar, por qué>

## Costo

- Agentes: <N> · Casos ejecutados: <N> · Evidencia: <N archivos>

## Próximo paso

<qué decide el humano: arreglar un bug, correr con más cobertura, mapear lo que faltó>
