# 2026-10-31 · Adopción de las pautas de la biblioteca central (D-14)

| Campo | Valor |
|---|---|
| **Fecha** | 2026-10-31 |
| **Quién trabajó** | Claude (Sonnet 5.5), dirigido por el usuario |
| **Rama** | `docs/adopcion-pautas-centrales` (sin commit todavía) |
| **Versión del producto** | `v3.2.1` (sin cambios en web ni APK) |
| **Estado de tests** | 44 de 44 superados (`python verify_all.py`) |

---

## 1. Objetivo
Revisar y reescribir la biblioteca central de pautas (agnóstica de proyecto, para Claude Code y Antigravity) y aplicarla a este proyecto, corrigiendo las desviaciones introducidas por ediciones previas de Gemini.

## 2. Punto de partida
- `CLAUDE.md` y `GEMINI.md`: 320 líneas idénticas (un test lo exigía), con el changelog y el mapa de código dentro, el prompt de arranque de la biblioteca incrustado y una ruta absoluta de la máquina del usuario en un repo público.
- Sin `.gitignore`. Ficheros de trabajo versionados (`PLAN_APP_STICKERS_WHATSAPP.md`, `DeepResearch…md`, `prueba_whatsapp/`).

## 3. Qué se hizo
1. **Biblioteca central** (fuera de este repo): nueva `GUIA_ARQUITECTURA_Y_CALIDAD_DE_SOFTWARE.md`, `ESTRATEGIA_LLM…` reescrita (flujo con agentes, equivalencias Claude Code ↔ Antigravity verificadas en documentación oficial el 2026-10-31), prompts A–D, plantillas `AGENTS.md` y checklists; versión anterior archivada.
2. **Este proyecto (D-14):** `AGENTS.md` canónico; `CLAUDE.md`/`GEMINI.md` punteros; `CHANGELOG.md` y `00_mapa_de_codigo.md` con el contenido desplazado (texto de versiones sin alterar); `CLAUDE.local.md` + `.gitignore`; tests 33 y 35 de `verify_all.py` sustituidos por comprobaciones equivalentes al nuevo patrón; índice, README y `DOCUMENTACION.md` (solo su árbol) actualizados.

## 4. Alternativas descartadas
Mantener dos copias sincronizadas · enlace simbólico (permisos en Windows) · reescribir `index.html` en módulos (decisión de producto de mayor riesgo: queda abierta, D-14 D).

## 5. Ficheros tocados
`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `CHANGELOG.md`, `.gitignore` (nuevos o reescritos) · `documentacion/notas_tecnicas/00_mapa_de_codigo.md` (nuevo) · `documentacion/00_INDICE.md`, `estado_del_proyecto/ESTADO_ACTUAL.md`, `estado_del_proyecto/DECISIONES.md` · `README.md`, `DOCUMENTACION.md` (árbol) · `verify_all.py`. `CLAUDE.local.md` existe pero no se versiona.

## 6. Verificación
`python verify_all.py` → «ALL 44 VERIFICATION TESTS PASSED». **No comprobado:** que Claude Code resuelva `@AGENTS.md` en una sesión nueva en esta máquina (la versión instalada puede variar); si no lo hiciera, copiar el contenido de `AGENTS.md` a `CLAUDE.md`.

## 7. Pendiente y siguiente paso
Ver `ESTADO_ACTUAL.md` §4: commit y fusión, y decisión sobre D-14 partes D y E. Nota: el commit histórico anterior sigue conteniendo la ruta local en `CLAUDE.md`/`GEMINI.md` (solo una ruta de carpeta, sin credenciales); no se reescribe el historial.

## 8. Qué debe saber explicar el usuario
Las instrucciones de agente se mantienen cortas y en un único fichero para que los agentes las obedezcan mejor y no diverjan; lo histórico va al changelog y lo personal a `CLAUDE.local.md`.
