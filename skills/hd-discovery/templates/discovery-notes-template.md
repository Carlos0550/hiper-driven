<!--
  Notas de discovery — Framework Hiper-driven (HD)
  Las escribe el orquestador durante los pasos 1-5.
  NO son el spec: son la materia prima. El spec se escribe en hd-spec.
  No contienen código de producción ni instrucciones de implementación.

  La memoria compartida vive aparte, en .hd/memory.md: acá van los punteros,
  no la copia. Cada hallazgo verificado y cada respuesta tienen su entrada ahí.
-->

# Discovery notes: <trabajo>

- **Humano**: <nombre>
- **Orquestador**: <quién conduce>
- **Fecha de inicio**: <fecha>
- **Estado**: research | preguntas | prototipo | aprobado para el paquete
- **Slug**: <kebab-case>
- **Memoria**: `.hd/memory.md` — <N> entradas nuevas de este trabajo

## Pedido en una frase

<!-- Reformulación del orquestador, confirmada por el humano. -->

## Research automático

- **Agente(s)**: `research-inicial` (<o `research-<área>` si se partió>)
- **Reporte**: `discovery/research-inicial.md`
- **Por qué se partió o no**: <...>
- **Resumen de 5 líneas**: <...>

## Hallazgos verificados a mano

<!-- Solo los que el orquestador abrió y contrastó. Cada uno con su entrada
     en .hd/memory.md ([hecho] ... — fuente: archivo:línea). -->

1. <hallazgo> — `archivo:línea` — <qué implica para el pedido> — memoria: <entrada>
2. ...

## Lo que el research dijo y el código desmiente

<!-- Contradicciones, supuestos inválidos, huecos. Si no hay: "ninguna". -->

- <...>

## Preguntas y respuestas

<!-- Una por turno, en orden. Cada respuesta tiene su entrada [decidido]
     en la memoria; acá va el puntero y el resumen. -->

| # | Pregunta | Respuesta | Memoria |
|---|---|---|---|
| 1 | <...> | <...> | [decidido] ... |

### Preguntas abiertas

<!-- El humano dijo "no sé" o quedó pendiente. No se rellenan con supuestos. -->

- <...>

## Requisitos

### Objetivo y porqué

<!-- Qué problema resuelve, qué duele hoy, qué habilita, por qué ahora. -->

### Actores y flujos

- **Usuarios**: <...>
- **Operación**: <...>
- **Aprueba**: <...>
- **Flujo actual**: <paso a paso>
- **Flujo deseado**: <paso a paso>

### Datos

- **Entra/sale/se guarda**: <...>
- **Volúmenes**: <...>
- **Object storage / DB**: <proveedor, nombres, políticas>
- **Producción**: <hay/no hay; respaldo; prueba en seco; ventana>
- **Datos personales / compliance**: <...>

### Éxito y criterios

- [ ] <criterio verificable>

### Alcance

- **Entra**: <...>
- **No entra**: <...>
- **No se puede romper**: <...>

### Restricciones

- **Stack / arquitectura**: <...>
- **Plazos / presupuesto**: <...>
- **Compatibilidad / entornos**: <...>
- **Compliance / seguridad**: <...>

### Casos borde

- <vacío, error, permisos, concurrencia, límites, datos raros, primera vez>

### Prioridades

- **Imprescindible**: <...>
- **Deseable**: <...>

## Comportamientos nuevos en detalle

<!-- Cada comportamiento nuevo o cambiado, explicado con lujo y detalle en el
     Paso 5 y confirmado por el humano ("¿es esto exactamente lo que se requiere?").
     Lo que no está confirmado acá no entra al spec. -->

| # | Comportamiento | Dispara | Hace | Muestra | Si falla | Qué NO cambia | Confirmado |
|---|---|---|---|---|---|---|---|
| 1 | <...> | <...> | <...> | <...> | <...> | <...> | sí |

## Estrategia de modelos

<!-- Catálogo consultado con list_subagent_models (si el harness lo permite).
     Precios y calidades verificados van a .hd/memory.md como [hecho];
     los permisos premium, como [decidido]. -->

- **Catálogo disponible**: sí | no (default, anotado en memoria)
- **Research**: <modelo> — <por qué>
- **Prototipo / implementación**: <modelo> — <por qué>
- **Auditoría con criterio**: <modelo> — <por qué>
- **Premium aprobados (más de 5 USD/M)**: <modelo, tareas, fecha> | ninguno
- **Memoria**: <punteros a las entradas>

## Prototipo

- **Aplica**: sí | no (<motivo>)
- **Ruta**: `.hd/<trabajo>/prototype/`
- **Equipo** (hasta 5):

| Agente | Pieza / pantalla / estado | Archivos |
|---|---|---|
| `proto-<pieza>` | <...> | <...> |

- **Integración**: <quién escribió el index.html y el CSS base>
- **Cómo abrirlo**: <...>
- **Qué cubre / qué no**: <...>
- **Revisión del orquestador**: <ok | una ronda de ajustes>

## Aprobación del humano

- **Fecha**: <fecha>
- **Comportamientos confirmados**: sí ("¿es esto exactamente lo que se requiere?") | no
- **Aprobó**: resumen | prototipo | ambos
- **Observaciones**: <...>
- **Memoria**: `[decidido] aprobado ...`
- **Siguiente**: hd-spec (automático, sin volver a preguntar)
