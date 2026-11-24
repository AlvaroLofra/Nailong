# 2026-11-24 · Revisión de la documentación de la revisión web 2 y ajustes de pautas

| Campo | Valor |
|---|---|
| **Quién trabajó** | Claude (Opus 5.5), dirigido por el usuario, después de la sesión de Gemini del mismo día |
| **Rama** | `main` (sin commit) |
| **Versión del producto** | `v4.0.0 · revisión web 2` (sin cambios de producto en esta sesión) |
| **Verificación** | `python verify_all.py` → 52 en verde; la parte Android de 5 tests, «no comprobada» (falta el código de la app en este equipo) |

## Objetivo
Comparar el proyecto con la biblioteca central de pautas (revisada el 22/11, adoptada aquí el 31/10, D-14), comprobar la documentación que dejó Gemini y aplicar las mejoras que no dependen de una decisión del usuario.

## Qué se hizo
1. **Documentación de Gemini, corregida:**
   - `CHANGELOG.md`: la entrada de la revisión web 2 describía la primera pasada (`VERSION: 2`, `arcoCeja`, `naricita`, `ANG_IRIS = 0,67`, plantas cacao), que la segunda pasada retiró. Reescrita con el estado final (`VERSION: 3`, cara lisa, `ANG_IRIS = 0,78`, almohadillas rosas).
   - `notas_tecnicas/00_mapa_de_codigo.md`: `VERSION: 2` → `3`, y recuento de líneas de los 16 ficheros actualizado (iban desfasados desde hace varias sesiones).
   - `ESTADO_ACTUAL.md`: decía «52 comprobaciones en verde», pero la suite se detenía en el test 43. Corregido y añadida la sección «Siguiente paso», que faltaba.
2. **`verify_all.py`:** la ruta de la app Android pasa a una constante (`ANDROID_SRC`, con posible sobrescritura por `NAILONG_ANDROID_SRC`). Si no existe, la parte Android de los tests 43, 45, 47, 48 y 50 se salta y se lista como **NO COMPROBADO**, en vez de abortar. Así la suite vuelve a ser una orden única que termina.
3. **`AGENTS.md`:** regla para varios agentes a la vez (un escritor por conjunto de ficheros; ramas o *worktrees*) y enlace a la guía de modelos de la biblioteca.
4. **`CLAUDE.local.md`** (no versionado): ruta de la biblioteca corregida (apuntaba a un usuario que no existe en este equipo).

## Alternativas descartadas
- Quitar las comprobaciones Android de `verify_all.py`: se perdería la verificación en el equipo que sí tiene el código.
- Hacer commit del trabajo de Gemini sin pedirlo: lo prohíbe `AGENTS.md`.

5. **D-25** (a petición del usuario): las capturas de la serie se quedan solo en local (`.gitignore`; sin enlaces rotos en la documentación), se aceptan los ficheros de más de 400 líneas con su motivo y se registra el nuevo comportamiento de `verify_all.py`.
6. **Coordinación:** antes de hacer los commits se confirmó con la otra sesión abierta (planificación del 3D) que solo leía y no editaba ficheros.

## Pendiente (decisiones del usuario)
Ver `ESTADO_ACTUAL.md` §5: licencia y créditos; lista de publicación (Lighthouse y contraste) antes del `git push`; si se borra la rama local `nailong-3d-fiel` (2 commits del 23/11 que no están en `main`; parece un intento anterior).
