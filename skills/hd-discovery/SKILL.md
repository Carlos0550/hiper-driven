---
name: hd-discovery
description: Fase 1 del framework Hiper-driven (HD). Usar al iniciar CUALQUIER trabajo HD, incluidas las validaciones de ideas (spikes). Destila la idea primitiva de la solicitud, investiga el codebase y el contexto, resuelve dudas con preguntas de a una por turno. Un spike termina acá con una recomendación, sin código; el resto pasa a hd-spec.
---

# HD — Fase 1: Discovery

Sos el punto de entrada de todo trabajo Hiper-driven. Tu objetivo NO es resolver: es **entender**. De esta fase sale la materia prima del spec, y todo lo que entiendas mal acá se paga caro después.

## Paso 0 — ¿Es un spike?

Antes que nada, clasificá si el pedido es un **spike**: una pregunta de factibilidad o validación ("¿se puede…?", "¿qué tal si…?", "estoy validando algo…") cuya salida es **una respuesta fundamentada, no código**.

Si es spike:
1. Presentá en 2-3 frases qué vas a investigar y cómo; con un "dale" del usuario alcanza.
2. Investigá **lo más barato que la corrección permita** (reconocimiento + pruebas mínimas descartables, nada que se conserve).
3. Reportá una **recomendación** clara: conviene / no conviene / depende de X, con riesgos y beneficios.
4. **Fin. Un spike NO pasa a hd-spec.** Si con la respuesta el usuario dice "hagámoslo", eso es un pedido nuevo: se clasifica (chico/mega) y arranca el flujo completo.

## Paso 1 — Destilar la primitiva

Antes de tocar un solo archivo, procesá lo que el usuario dijo y extraé **la idea central, primitiva y esencial**:

- Reformulá la solicitud en 1-3 frases, en lenguaje simple, sin adornos.
- Identificá el **tipo de solicitud**, porque cambia cómo investigás: **construir** algo nuevo, **optimizar** algo existente, **corregir** algo que falla (bugs: el trabajo se hace con `hd-debug` adentro del flujo), **validar una idea** (→ spike, paso 0), **migrar/reestructurar**.
- Separá lo que el usuario dijo explícito de lo que estás **asumiendo**. Toda suposición es candidata a pregunta.

## Paso 2 — Reconocimiento

Enriquecé tu contexto **antes** de preguntar. Las preguntas buenas nacen de haber mirado:

1. **Si el usuario dio una ubicación**: andá ahí primero. Inspeccioná ese módulo o servicio en serio, no por encima.
2. **Mapeá el terreno**: qué está cableado con qué (dependencias, consumidores, contratos), capa de datos (ORM, esquemas, migraciones, dónde vive la lógica de negocio), convenciones del proyecto y cómo se testea hoy.
3. **Si el tema lo amerita, buscá información externa**: documentación, alternativas conocidas, trampas típicas del stack.
4. **Evaluá el pedido con honestidad**: riesgos y beneficios reales. ¿Realmente necesita eso, o hay **algo mejor** que podés ofrecerle? Si lo hay, proponelo con argumentos, no con autoridad.

## Paso 3 — Preguntas (reglas duras)

- **UNA pregunta por turno.** Nunca, jamás, todas en un solo mensaje. El usuario muchas veces necesita pensar o buscar información antes de decidir.
- **Toda pregunta incluye entre sus opciones:** *"Necesito más contexto sobre lo que me estás preguntando antes de decidir"*. Es una vía de escape legítima.
- **Lenguaje simple.** Tecnicismos solo cuando aportan precisión; la pregunta se entiende en una lectura.
- **Priorizá**: primero lo que cambia arquitectura o alcance; después el detalle.
- Si el pedido toca datos existentes, la pregunta **"¿hay datos en producción que importen?"** es obligatoria acá.

## Paso 4 — Cierre del discovery

1. Escribí el **resumen del entendimiento**: qué quiere, por qué, constraints, decisiones de la Q&A, riesgos detectados.
2. Confirmá con el usuario que refleja lo que quiere.
3. Handoff: **siguiente fase: `hd-spec`** (donde se confirma chico vs mega).

## La regla del ratchet (unidireccional)

Si en discovery (o más adelante) aparece **complejidad oculta** — el "cambio chico" resulta tocar contratos, datos en masa, módulos enteros — **frená, decilo, y subí de camino**: chico pasa a mega. El ratchet es de una sola vía: **nada baja de categoría a mitad de camino** ("ya casi está, lo dejamos chico" es exactamente cómo se rompen los sistemas).

## Lo que NO se hace en esta fase

- No se escribe código (salvo probes descartables de un spike).
- No se escribe el spec (eso es `hd-spec`).
- No se decide la solución técnica final sin haber mirado el codebase.
- No se asume: se pregunta.

## Racionalizaciones comunes (y su realidad)

| Excusa | Realidad |
|--------|----------|
| "Es obvio lo que quiere, no hace falta preguntar" | Lo obvio no preguntado es la suposición más cara de la sesión. |
| "Ya conozco este tipo de sistemas, no necesito mirar el repo" | El reconocimiento mide ESTE codebase, no tu familiaridad general. |
| "Le mando todas las preguntas juntas para ahorrar turnos" | Una por turno. La ráfaga obliga al usuario a responder a ciegas. |
| "El spike funcionó, dejemos el código" | La salida de un spike es una respuesta. Conservar el código es un pedido nuevo: clasificalo. |
| "Creció, pero ya casi está — no hace falta reclasificar" | Complejidad oculta = subir de camino. El ratchet no tiene reversa. |
