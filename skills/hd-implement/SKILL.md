---
name: hd-implement
description: Fase 2 (continuación) del framework Hiper-driven (HD). Usar después de hd-spec, con spec y planes aprobados. Ejecuta los planes ola por ola lanzando implementadores (cada uno en su propio worktree en modo mega cambio), con TDD estricto, y frena entre olas para correr solo los tests nuevos y revisar antes de seguir.
---

# HD — Implementación (olas, implementadores y TDD)

Entrada: `spec.md` + planes aprobados por el usuario. Vos (el modelo de turno) sos el **orquestador**: no implementás los planes de un mega cambio con tus propias manos, los hacen implementadores.

## TDD — Regla dura para TODO implementador

1. Los **tests unitarios se escriben PRIMERO** y se pueden correr solos.
2. El test debe tener criterio: es el **reflejo del comportamiento deseado** descrito en el plan, escrito **antes** del código real.
3. El test **siempre llama al servicio o código involucrado** (aunque todavía no exista o falle).
4. **Prohibido escribir el test después de implementar**: eso es testear siempre el happy path. Un test escrito después no vale como evidencia.

## Modo mega cambio — Ejecución por olas

### Reglas de cada implementador (subagente)

- Trabaja en su **propio worktree, SIEMPRE**. Nada de trabajo directo en la rama.
- El nombre del worktree **empieza con el número de la ola**: `ola1-<nombre-del-plan>`, `ola2-<nombre-del-plan>`, etc.
- Recibe como contexto: **el spec + su plan** (+ contratos de la Ola 0 si aplican). Implementa basado en esas instrucciones.
- **NO hace commits. Nunca.**
- **NO ejecuta scripts que no sean tests unitarios propios.** Nada de builds completos, migraciones reales, seeds, ni suites enteras de testing.
- Se abstiene a IMPLEMENTAR: no rediseña, no "mejora" cosas fuera de su plan, no toca archivos fuera de su alcance.

### Ciclo de una ola

1. **Anunciá el inicio de la ola** y qué planes la componen.
2. Lanzá **un implementador por plan**, todos en paralelo (cada uno con su worktree).
3. Cuando terminan todos, **informá claramente que la ola terminó** y cuáles fueron sus entregables.
4. **Gate de la ola**: corré **únicamente los tests unitarios escritos por los implementadores de esa ola** — nunca la suite entera de testing — y revisá los resultados.
   - Tests en verde + revisión sin sorpresas → se lanza la siguiente ola.
   - **Si una ola falla, NO se lanza la siguiente.** Se corrige primero (mismo implementador o uno nuevo, según el caso). Es más barato encontrar un error en la ola 1 que en la ola 4, cuando ya hay código encima.

### Reglas especiales

- **Ola 0 (contratos) va SOLA.** Al terminar, se revisa lo definido (tipos, esquemas, firmas, esqueleto, migraciones) antes de lanzar la Ola 1. Si el contrato está mal, todo lo que venga después también va a estar mal.
- **Ola de datos (la última, si existe) va SOLA y nunca en paralelo.** Antes de lanzarla: confirmar con el usuario que el respaldo está hecho y que hay una prueba en seco (dry run) ejecutada y revisada. Sin eso, la ola no arranca.

## Modo cambio chico — Un implementador, sin worktrees

- Un solo implementador (puede ser un subagente o el propio modelo de turno si el cambio es muy acotado), trabajando **directo en la rama**.
- Mismas reglas TDD: test primero, test con criterio, test que llama al código real.
- Mismas prohibiciones: sin commits, sin scripts que no sean tests unitarios.

## Salida

- Todas las olas terminadas y verdes (o el plan único terminado) → informá al usuario y anunciá el handoff: **siguiente fase: `hd-review`**.
- Recordá: los cambios viven **sin commitear** en los worktrees (mega) o en la rama (chico). Eso es lo que `hd-review` va a auditar y mergear.
