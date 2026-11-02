# 2026-11-03 · Guía Canónica de Estilo del README (Vitrina Pública) y Saneamiento

## Qué se pidió
1. Confirmar si existía en el proyecto una guía de instrucciones sobre cómo redactar y mantener el `README.md` de GitHub.
2. Fijar una guía oficial y canónica para evitar que con cada versión se siga diluyendo el estilo del README.
3. Asegurar que quede referenciado explícitamente el principio: *«README = vitrina pública (frases cortas, para el usuario final, sin jerga técnica ni código). Lo técnico va en documentacion/.»* cada vez que se ordene actualizar el README.
4. Analizar el README histórico dando más valor al estilo fresco y directo de las primeras versiones (v1.0.0 a v1.2.0) y menos valor a los vicios técnicos de las últimas versiones.
5. Preservar íntegramente el historial de actualizaciones técnico como parte de la documentación del proyecto.

## Qué se hizo
- **Creación de la Guía Oficial (`documentacion/guias_y_contexto/GUIA_README.md`):**
  - Documento canónico que define la dicotomía: `README.md` (vitrina pública y alegre para usuarios/fans), `CHANGELOG.md` (historial técnico completo y exhaustivo) y `documentacion/` (base técnica de arquitectura y notas).
  - Análisis detallado de las lecciones del proyecto: virtudes a emular de v1.0.0–v1.2.0 (frases cortas, verbos activos, beneficios directos, vocabulario tierno) frente a los vicios a erradicar de versiones tardías (árboles de ficheros internos, nombres de variables o funciones, métricas de testing interno, justificaciones defensivas).
  - Estructura fija y obligatoria de 6 secciones para el `README.md`: 1. Cabecera visual, 2. ¿Qué es este rincón mágico?, 3. Características principales, 4. ¿Cómo conseguir los stickers para WhatsApp? (Android/Web), 5. ✨ Novedades de la versión (solo la versión actual, en 3–4 viñetas simples) con enlace directo a `CHANGELOG.md`, 6. Créditos y agradecimientos.
  - Lista negra expresa de elementos prohibidos en el README.
  - Protocolo paso a paso para actualizar el README al publicar una nueva versión.
- **Blindaje en las Instrucciones Maestras (`AGENTS.md`):**
  - Regla 8 reforzada con la obligación ineludible de consultar y aplicar `documentacion/guias_y_contexto/GUIA_README.md` cada vez que se redacte o actualice el README.
  - Ajustado el *Definition of Done* en `Sesiones de trabajo` para separar el alcance del `README.md` del de `CHANGELOG.md`.
  - Actualizada la regla 4 a 95 cromos oficiales (sincronizada con v3.4.1).
- **Actualización del Índice Maestro (`documentacion/00_INDICE.md`):**
  - Indexada `guias_y_contexto/GUIA_README.md` en la tabla de contenidos y reforzada la regla de redacción en el apartado de dicotomía documental.
- **Saneamiento Completo del `README.md`:**
  - Rediseñado y depurado según la nueva guía canónica: eliminados árboles de directorios internos (`verify_all.py`, `DOCUMENTACION.md`, etc.), eliminada jerga de código (`build_animated`, `GALLERY_STEP`, `CLIPBOARD_CORNER_RADIUS`, `versionCode 11`, `47/47 pruebas`), y reemplazado el historial acumulativo de 150 líneas por un bloque limpio y alegre de la versión actual v3.4.1 con llamada a la acción hacia `CHANGELOG.md`.

## Comprobado
- `python verify_all.py`: **47 de 47 comprobaciones superadas al 100%**.
- Trazabilidad y preservación: el 100% del historial técnico de todas las versiones (v1.0.0 a v3.4.1) continúa intacto en `CHANGELOG.md`.
