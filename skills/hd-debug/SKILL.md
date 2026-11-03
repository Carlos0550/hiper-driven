---
name: hd-debug
description: Skill transversal del framework Hiper-driven (HD). Usar ante CUALQUIER bug, build o lint roto, o comportamiento inesperado, y de forma OBLIGATORIA para los correctores de las fases 3 y 4 y para pedidos directos de arreglo. No hay tests (la prueba de un fix es la reproducción original que deja de fallar, más build y lint limpios). Nunca proponer fixes sin investigar la causa raíz primero; 3 fixes fallidos significan cuestionar la arquitectura, no intentar un cuarto.
---

# HD — Debugging sistemático

## Ley de hierro

```
NINGÚN FIX SIN INVESTIGACIÓN DE CAUSA RAÍZ PRIMERO.
```

Si no completaste la Fase 1, no podés proponer fixes. Arreglar síntomas es fracasar con pasos extra.

## Cuándo se usa

- Cualquier bug, build o lint roto, comportamiento inesperado o problema de performance.
- **Obligatoria** para los subagentes correctores de hd-review (fases 3 y 4): no se arregla lo que no se entendió.
- **Especialmente** cuando hay presión ("es un fix rápido", "ya probé dos cosas"): apurarse acá es la forma más lenta de avanzar.

## Fase 1 — Investigación de causa raíz

1. **Leé el error completo.** Stack trace entero, números de línea, códigos. El error suele contener la solución; saltearlo es elegir adivinar.
2. **Reproducí consistentemente.** ¿Pasos exactos? ¿Pasa siempre? Si no es reproducible: juntá más datos, no supongas.
3. **Revisá cambios recientes.** Diff, commits nuevos, dependencias, config, diferencias de entorno.
4. **Instrumentá los límites entre componentes** (API → servicio → DB, CI → build → deploy): logueá qué entra y qué sale de cada capa, corré UNA vez para juntar evidencia de DÓNDE se rompe, y recién ahí investigá ese componente.
5. **Trazá el dato malo hacia atrás.** ¿De dónde salió ese valor? ¿Quién llamó con eso? Seguí la cadena hasta el origen. **Se arregla en la fuente, no en el síntoma.**

## Fase 2 — Análisis de patrón

- Buscá **código similar que funciona** en el mismo codebase. ¿Qué tiene de distinto lo roto? Lista TODAS las diferencias, por chicas que parezcan.
- Si estás siguiendo un patrón de referencia, **leelo completo, no por encima**. Entender la mitad garantiza bugs.

## Fase 3 — Hipótesis y prueba

- **Una sola hipótesis**, escrita y específica: "creo que la causa es X porque Y".
- Cambio **mínimo** para probarla. Una variable por vez. Si no funcionó: hipótesis NUEVA — no apiles fixes.
- Si no sabés, decilo: "no entiendo X". Investigar o preguntar es más rápido que pretender.

## Fase 4 — Implementación del fix

1. **Reproducción ANTES del fix, y la misma reproducción después.** HD no escribe tests: la prueba es un caso concreto y repetible —un comando, un input, unos pasos— que falla hoy y deja de fallar con el fix. Si no podés reproducirlo, o no entendiste la causa (volvé a la Fase 1) o es intermitente y necesitás más instrumentación, no un fix a ciegas. La reproducción queda escrita en el reporte y en el ledger.
2. **Un solo cambio** que ataca la causa raíz. Nada de "ya que estoy" ni refactors colados.
3. **El fix no está listo hasta que build y lint pasan limpios en la rama.** En HD los implementadores/correctores **se autoverifican en su worktree**, pero esa salida no es evidencia: las corridas que cuentan las hace el orquestador **sobre la rama consolidada**.
4. Si el fix **no funciona**: STOP y contá. Menos de 3 intentos → volvé a Fase 1 con la información nueva. **3 o más fixes fallidos = problema de arquitectura**: frená, cuestioná los fundamentos y discutilo con el humano. El cuarto fix sin esa conversación está prohibido.

## Red flags — si te escuchás pensando esto, volvé a Fase 1

- "Un fix rápido ahora, investigo después" / "probemos cambiar X a ver"
- "Varios cambios a la vez y vemos qué pasa" / "lo verifico a ojo y listo"
- "Debe ser X, lo arreglo" / "un intento más" (con 2+ fallos ya hechos)
- Cada fix revela un problema nuevo en otro lugar → **eso es arquitectura, no un bug**

## Señales del humano de que lo estás haciendo mal

- "¿Eso no está pasando?" — asumiste sin verificar.
- "Dejá de adivinar" — estás proponiendo fixes sin entender.
- "¿Estamos trabados?" (frustrado) — tu enfoque no está funcionando; cambiá, no insistas.

| Excusa | Realidad |
|--------|----------|
| "Es simple, no necesita proceso" | Los bugs simples también tienen causa raíz. El proceso es rápido en bugs simples. |
| "Es una emergencia, no hay tiempo" | Sistemático es MÁS RÁPIDO que prueba y error a ciegas. |
| "Escribo un test después de confirmar que anda" | HD no escribe tests. La prueba es la reproducción que fallaba y ya no falla: sin ella escrita, el fix no se puede re-verificar mañana. |
| "Sin tests no puedo probar el fix" | Sí podés: reproducís la falla con un comando o unos pasos, aplicás el fix y repetís la misma reproducción. Es más lento que un test y es lo que hay — por eso el revisor es obligatorio. |

## Cierre

Documentá en el reporte/ledger: causa raíz encontrada, cómo se probó, y qué monitoreo o validación conviene agregar para que no vuelva. Si la investigación concluye que es ambiental/externo, documentá todo lo investigado — y recordá que el 95% de los "no hay causa raíz" son investigaciones incompletas.
