<!--
  Notas de discovery — Framework Hiper-driven (HD)
  Las escribe el agente principal durante las etapas 1-3.
  NO es el spec: es la materia prima. El spec aprobado se escribe en hd-spec.
  No contiene código de producción ni instrucciones de implementación.
-->

# Discovery notes: <trabajo>

- **Cliente**: <nombre>
- **Agente principal**: <quién conduce>
- **Fecha de inicio**: <fecha>
- **Estado**: etapa 1 | etapa 2 | etapa 3 | aprobado para el paquete
- **Slug**: <kebab-case>

## Pedido en una frase

<!-- La reformulación del agente principal, confirmada por el cliente. -->

## Objetivo y porqué

<!-- Qué problema resuelve, qué duele hoy, qué habilita, por qué ahora. -->

## Alcance

### Entra

- <...>

### No entra

- <...>

### No se puede romper

- <...>

## Actores y flujos

- **Usuarios**: <...>
- **Operación**: <...>
- **Aprueba**: <...>
- **Flujo actual**: <paso a paso>
- **Flujo deseado**: <paso a paso>

## Datos

- **Entra/sale/se guarda**: <...>
- **Volúmenes**: <...>
- **Datos personales / compliance**: <...>
- **Producción**: <hay/no hay; respaldo; prueba en seco; ventana>

## Éxito y criterios

<!-- Cómo sabe el cliente que quedó bien. Candidatos a criterios de aceptación. -->

- [ ] <...>

## Restricciones

- **Stack / arquitectura**: <...>
- **Plazos / presupuesto**: <...>
- **Compatibilidad / entornos**: <...>
- **Compliance / seguridad**: <...>

## Casos borde

<!-- Vacío, error, permisos, concurrencia, límites, datos raros, primera vez. -->

- <...>

## Prioridades

- **Imprescindible**: <...>
- **Deseable**: <...>

## Supuestos (candidatos a pregunta)

<!-- Todo lo que el agente principal asumió y todavía no confirmó. -->

- <...>

## Revisión de código — etapa 1

<!-- La revisión completa del código directamente involucrado. -->

- **Archivos y puntos de entrada**: <...>
- **Contratos / interfaces**: <...>
- **Modelo de datos / migraciones**: <...>
- **Consumidores directos**: <...>
- **Convenciones y comandos**: <build/lint/estándares>
- **Riesgos y trampas**: <...>
- **Qué NO se revisó (va a la etapa 2)**: <...>

## Preguntas y respuestas — etapa 1

<!-- Una por turno. Registro completo, con fecha si ayuda. -->

1. **P:** <pregunta>
   **R:** <respuesta>

## Investigación — etapa 2

### Áreas y agentes

| Área | Agente | Reporte | Estado |
|---|---|---|---|
| <área> | `research-<área>` | `discovery/research-<área>.md` | pendiente |

### Hallazgos que cambiaron el pedido

- <hallazgo> — <archivo:línea> — <qué cambió>

### Mapa de impacto

- **Se cambia**: <...>
- **Consumen**: <...>
- **Contratos / datos**: <...>
- **Convenciones y verificación**: <build/lint/estándares>
- **Riesgos / trampas**: <...>
- **Alternativas**: <...>

### Preguntas y respuestas — etapa 2

1. **P:** <pregunta>
   **R:** <respuesta>

## Resumen para aprobación — etapa 3

<!-- El resumen que se le presenta al cliente. Debe coincidir con el
     "Resumen del entendimiento" del spec. -->

- **Qué se va a hacer**: <...>
- **Cómo**: <enfoque, piezas, olas propuestas>
- **Qué cambia / qué no**: <...>
- **Criterios de aceptación**: <...>
- **Riesgos**: <...>
- **Fuera de alcance**: <...>

## Prototipo

- **Aplica**: sí | no (<motivo>)
- **Ruta**: `.hd/<trabajo>/prototype/`
- **Cómo abrirlo**: <...>
- **Qué cubre**: <...>
- **Qué queda afuera**: <...>
- **Revisión del agente principal**: <ok | ajustes>

## Aprobación del cliente

- **Fecha**: <fecha>
- **Aprobó**: resumen | prototipo | ambos
- **Observaciones**: <...>
