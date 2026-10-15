---
name: hd-debug
description: Skill transversal del framework Hiper-driven (HD). Usar ante CUALQUIER bug, test que falla o comportamiento inesperado, y de forma OBLIGATORIA para los correctores de las fases 3 y 4 y para pedidos directos de arreglo. Nunca proponer fixes sin investigar la causa raíz primero; 3 fixes fallidos significan cuestionar la arquitectura, no intentar un cuarto.
---

# HD — Debugging sistemático

## Ley de hierro

```
NINGÚN FIX SIN INVESTIGACIÓN DE CAUSA RAÍZ PRIMERO.
```

Si no completaste la Fase 1, no podés proponer fixes. Arreglar síntomas es fracasar con pasos extra.

## Cuándo se usa

- Cualquier bug, test que falla, comportamiento inesperado, problema de performance o build roto.
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

1. **Test que reproduce la falla ANTES del fix** (red-green: el orquestador verifica que el test falla sin el fix y pasa con él — en HD los implementadores/correctores no ejecutan nada; las corridas y sus salidas las hace el orquestador).
2. **Un solo cambio** que ataca la causa raíz. Nada de "ya que estoy" ni refactors colados.
3. Si el fix **no funciona**: STOP y contá. Menos de 3 intentos → volvé a Fase 1 con la información nueva. **3 o más fixes fallidos = problema de arquitectura**: frená, cuestioná los fundamentos y discutilo con el humano. El cuarto fix sin esa conversación está prohibido.

## Red flags — si te escuchás pensando esto, volvé a Fase 1

- "Un fix rápido ahora, investigo después" / "probemos cambiar X a ver"
- "Varios cambios a la vez y corremos los tests" / "salteo el test, lo verifico a mano"
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
| "Escribo el test después de confirmar que anda" | Los fixes sin test no se quedan. El test primero es la prueba. |

## Cierre

Documentá en el reporte/ledger: causa raíz encontrada, cómo se probó, y qué monitoreo o validación conviene agregar para que no vuelva. Si la investigación concluye que es ambiental/externo, documentá todo lo investigado — y recordá que el 95% de los "no hay causa raíz" son investigaciones incompletas.
