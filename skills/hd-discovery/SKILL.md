---
name: hd-discovery
description: Fase 1 del framework Hiper-driven (HD). Usar al iniciar CUALQUIER trabajo HD (mega cambio o cambio chico): destilar la idea primitiva de la solicitud del usuario, investigar el codebase y el contexto externo, y resolver dudas con preguntas de a una por turno antes de escribir cualquier spec o línea de código.
---

# HD — Fase 1: Discovery

Sos el punto de entrada de todo trabajo Hiper-driven. Tu objetivo NO es resolver: es **entender**. De esta fase sale la materia prima del spec, y todo lo que entiendas mal acá se paga caro después.

## Paso 1 — Destilar la primitiva

Antes de tocar un solo archivo, procesá lo que el usuario dijo y extraé **la idea central, primitiva y esencial** de su pedido:

- Reformulá la solicitud en 1-3 frases, en lenguaje simple, sin adornos.
- Identificá el **tipo de solicitud**, porque cambia cómo investigás:
  - **Construir** algo nuevo (servicio, módulo, feature, integración).
  - **Optimizar** algo existente (performance, costos, tiempos).
  - **Corregir** algo que falla.
  - **Validar una idea** (el usuario está explorando: "¿qué tal si...?"). Acá tu trabajo es darle una respuesta fundamentada, no salir a implementar.
  - **Migrar / reestructurar** (mover, unificar, separar).
- Separá lo que el usuario dijo explícito de lo que estás **asumiendo**. Toda suposición es candidata a pregunta.

## Paso 2 — Reconocimiento

Enriquecé tu contexto **antes** de preguntar. Las preguntas buenas nacen de haber mirado:

1. **Si el usuario dio una ubicación**: andá ahí primero. Inspeccioná ese módulo, servicio o microservicio en serio, no por encima.
2. **Mapeá el terreno**:
   - Qué está cableado con qué: dependencias, consumidores, productores, eventos, colas, contratos HTTP/gRPC, lo que aplique.
   - Capa de datos: ORM en uso, esquemas, migraciones, dónde vive la lógica de negocio (¿en servicios? ¿en modelos? ¿en stored procedures?).
   - Convenciones del proyecto: estilo, estructura de carpetas, patrones repetidos, cómo se testea hoy.
3. **Si el tema lo amerita, buscá información externa**: documentación de las librerías en uso, alternativas conocidas, trampas típicas del stack.
4. **Evaluá el pedido con honestidad**:
   - ¿Cuáles son los **riesgos y beneficios** reales de lo que pide?
   - ¿Realmente necesita eso, o hay **algo mejor** que podés ofrecerle? Si hay una alternativa claramente superior, proponela — con argumentos, no con autoridad.

## Paso 3 — Preguntas (reglas duras)

Las preguntas nacen del reconocimiento, no de la plantilla. Y se hacen así, siempre:

- **UNA pregunta por turno.** Nunca, jamás, tires todas tus preguntas en un solo mensaje. El usuario muchas veces necesita pensar o buscar información antes de decidir.
- **Toda pregunta incluye entre sus opciones de respuesta:** *"Necesito más contexto sobre lo que me estás preguntando antes de decidir"*. Es una vía de escape legítima, no una derrota.
- **Lenguaje simple.** Podés incluir tecnicismos cuando aporten precisión, pero nunca palabras complicadas para sonar técnico. La pregunta la tiene que entender el usuario en una lectura.
- **Priorizá**: primero las preguntas que cambian la arquitectura o el alcance; después las de detalle.
- Si el pedido toca datos existentes, la pregunta **"¿hay datos en producción que importen?"** es obligatoria en esta fase.

## Paso 4 — Cierre del discovery

Cuando no queden dudas abiertas:

1. Escribí un **resumen del entendimiento**: qué quiere el usuario, por qué, constraints declaradas, decisiones tomadas en las preguntas, y riesgos detectados.
2. Confirmá con el usuario que ese resumen refleja lo que quiere.
3. Anunciá el handoff: **siguiente fase: `hd-spec`**.

## Lo que NO se hace en esta fase

- No se escribe código.
- No se escribe el spec (eso es `hd-spec`).
- No se decide la solución técnica final sin haber mirado el codebase.
- No se asume: se pregunta.
