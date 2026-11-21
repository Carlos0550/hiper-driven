# Catálogo de casos — <app>

> Esta es la suite. No hay test runner: cada caso lo ejecuta un agente como una persona.
> Última actualización: <fecha> · Commit de referencia: <sha> · Casos: <N>

## Convenciones

- **ID** `<AREA>-<NNN>`, inmutable: no se reusa ni se renumera. Un caso que ya no aplica queda `RETIRADO` con el commit que lo sacó.
- **Resultado:** `PASA | FALLA | BLOQUEADO` de la última ejecución; `NUEVO` si nunca se ejecutó y `SIN_VERIFICAR` si cambió después. Ningún caso nace verde.
- **Prioridad:** `critico | alto | normal`.
- **Un caso, un objetivo.** Dos resultados esperados son dos casos; tres roles son tres casos.
- **Esperado observable:** texto en pantalla, estado del componente, código HTTP + cuerpo, fila en la base o mail en la bandeja local. Nunca "funciona bien".

## Índice

| ID | Área | Rol | Prioridad | Título | Último resultado |
|---|---|---|---|---|---|
| AUTH-001 | Auth | usuario | critico | <título> | PASA |

## Casos

### AUTH-001 — <título>

- **Rol:** <rol>
- **Prioridad:** critico
- **Precondición:** <estado del sistema y de la cuenta>
- **Datos:** <qué tiene que existir, con prefijo `e2e-`>
- **Pasos:**
  1. <acción exacta: a dónde entra, qué escribe, qué clickea>
  2. <acción exacta>
- **Esperado:**
  - <qué se ve / qué responde / qué queda guardado>
- **Evasiva:**
  - 401 → <cerrar sesión y re-login; si repite, restablecer por base local>
  - 403 → <verificar rol en la base>
  - 500 → <capturar log y request, un reintento>
  - timeout → <revisar proceso y base, un reintento>
- **Evidencia mínima:** <captura de pantalla + status de endpoint / log>
- **Historial:** <fecha> alta · <fecha> corrección (<motivo>, <commit>)

## Cobertura declarada

| Qué no se cubre | Por qué | Quién lo cubre |
|---|---|---|
| <flujo con proveedor sin sandbox> | sin entorno de prueba | residual declarado, casos `BLOQUEADO` |

## Registro de correcciones

| Fecha | ID | Qué cambió | Evidencia |
|---|---|---|---|
| <fecha> | <ID> | <esperado o pasos> | <commit / archivo:línea / decisión> |
