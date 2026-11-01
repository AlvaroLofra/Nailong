# Estado Actual del Proyecto — ¡El Mundo Mágico de Nailong (奶龙)!

> **Regla de Actualización:** Este fichero se **sobrescribe en cada sesión** para reflejar la realidad de AHORA. El historial de sesiones reside en `bitacora_de_sesiones/` y las decisiones técnicas en `DECISIONES.md`.
>
> **Última actualización:** 01/11/2026 (v3.3.3: mejoras de interfaz A1–A7 y W1–W5, botones con sus colores y packs de «Mi Selección» borrables) — Incorporación de 16 nuevos stickers oficiales (80 → 96), 4º pack en app Android, tráiler oficial con HyperFrames y lanzamiento v3.3.0 (D-17).
> **Rama activa:** `main` (sincronizada con `origin/main`).
> **Versión actual de producción:** Web `v3.3.3` | Android APK `v3.3.3` (`versionCode 9`).

---

## 1. En una Frase

La web oficial y la app Android nativa se encuentran sincronizadas en la versión **v3.3.3**, con un catálogo ampliado a 96 cromos oficiales (73 animados y 23 estáticos) distribuidos en 4 packs de WhatsApp, tráiler oficial promocional HyperFrames integrado con música original y las 46/46 pruebas de verificación superadas al 100%.

---

## 2. Cifras Clave del Proyecto (Ground Truth)

| Métrica / Concepto | Valor Verificado |
|---|---|
| **Punto único de entrada web** | `index.html` + `css/styles.css` + `js/` (10 ficheros modulares, 0 dependencias de compilación). |
| **Banco de cromos coleccionables** | Exactamente 96 stickers WebP (512×512 con chunk EXIF WhatsApp) + 1 foto optimizada del creador. |
| **Packs oficiales preconfigurados en Android** | 4 packs: *Nailong animado 1* (25), *Nailong animado 2* (24), *Nailong animado 3* (24) y *Nailong estático* (23). Total: 96 stickers. |
| **Generador dinámico «Mi Selección»** | Mínimo 3 y máximo 30 stickers por lote, con bifurcación inteligente por tipo mixto. |
| **Paquete nativo Android firmado** | `StickersNailong.apk` (31 MB / 31.056.681 bytes, firmado con esquemas v1, v2 y v3 con la clave *debug* de la máquina, targetSdk 30, versionCode 8, versionName 3.3.2). |
| **Tráiler oficial animado (HyperFrames)** | `video-promo/nailong_trailer_oficial.mp4` (1080×1920, 30 fps, 17.0s, audio C-major pentatonic sintetizado). |
| **Botonera de sonidos sintetizados** | 12 casillas con síntesis Web Audio en tiempo real (0 archivos `.mp3`/`.wav`). |
| **Escenas virales en el Visor Mágico** | 9 animaciones WebP seleccionadas en bucle con control de velocidad (0.5x, 1x, 1.5x). |
| **Suite de pruebas automatizadas (`verify_all.py`)** | **46 de 46 comprobaciones superadas con éxito (100%)**. |
| **Auditoría de stickers (`normalizar_stickers.py --check`)** | **0 problemas en los 96 stickers (100% conformes con WhatsApp)**. |

---

## 3. Qué Está Completado y Verificado

- [x] **Normalización e Integración de 16 Nuevos Stickers (D-17):**
  - Procesamiento e importación de los archivos brutos de TikTok (antiguos 126–141) con `normalizar_stickers.py --import` hacia `sticker_81.webp`…`sticker_96.webp`.
  - Normalización técnica garantizada: 512×512 píxeles, metadatos EXIF oficiales de WhatsApp (`sticker-pack-id`), pesos optimizados (≤500 KB animados, ≤100 KB estáticos).
  - Eliminación de la carpeta temporal `Stickers Nailong/stickers_tiktok_temporal`.
  - Catálogo completo en `js/02-datos-stickers.js` con nombres descriptivos, etiquetas de búsqueda, emociones y sonidos asignados.
- [x] **Mejoras de interfaz (v3.3.3):** reintentar al cancelar en WhatsApp, borrar packs de «Mi Selección» con pulsación larga, peso y fecha en el aviso de versión nueva, búsqueda manual tocando la versión, pista de pulsación larga, diálogos *clay*; en la web, novedades y peso desde `version.json`, «Copiar enlace», minijuego pausado fuera de pantalla y CDN con versión fijada. Probado en el emulador y en el navegador a 320/375/700/1280 px. **No comprobado:** «Reintentar» tras cancelar en WhatsApp (el emulador no tiene WhatsApp). Nuevas ideas en `MEJORAS_PENDIENTES.md`.
- [x] **Revisión a fondo de app y web (v3.3.2):** arranque sin validación duplicada, lista sin recargas dobles, «Mi Selección» en segundo plano y persistente, ContentProvider protegido contra `../`, versión visible en la app y minijuego sin reasignar el lienzo. Mejoras visuales apuntadas en `MEJORAS_PENDIENTES.md`.
- [x] **Avisos de versión nueva (v3.3.2):** la web publica `version.json`; la app lo consulta al abrirse y, si hay un `versionCode` mayor, muestra la versión y sus novedades con botón «Descargar» (abre el APK en el navegador). Comprobado el 2026-11-01 contra la web publicada: una compilación de prueba con `versionCode 8` mostró «¡Nueva versión 3.3.3!» con peso, fecha y novedades.
- [x] **v3.3.2:** decodificación de los stickers animados al tamaño de la celda, sin reinicios de animación al volver o seleccionar, animaciones pausadas al salir y aviso único tras actualizar («pulsa Actualizar en WhatsApp»). Aviso probado en el emulador; **fluidez en un móvil real no comprobada**.
- [x] **Corrección v3.3.1 (D-18):** packs animados equilibrados (25/24/24) + estático (23), los 4 packs caben en pantalla y los stickers se animan en bucle dentro de cada pack. Probado en emulador Android 37.
- [x] **Aplicación Nativa Android (`StickersNailong.apk` v3.3.0):**
  - Reconfiguración de `generar_assets.py` con 4 packs que respetan el límite de WhatsApp: *Nailong animado 1* (25), *Nailong animado 2* (24), *Nailong animado 3* (24) y *Nailong estático* (23).
  - Generación de `contents.json` y recursos adaptados.
  - Actualización de `build.gradle` a `versionCode 6`, `versionName "3.3.0"`.
  - Compilación exitosa con Gradle (`gradlew assembleDebug`), firmado y verificado con `apksigner` (esquemas v1 y v2).
  - Copia sincronizada del binario resultante a la raíz web (`StickersNailong.apk`, 28.7 MB).
- [x] **Tráiler Promocional HyperFrames (`video-promo/`):**
  - Diagnóstico y solución definitiva del fotograma roto a los 6.2s: sustitución de cambio dinámico de atributo `src` por nodos pre-renderizados en el DOM con cambio instantáneo y determinista vía GSAP `tl.set()`.
  - Síntesis de banda sonora original saltarina en Do Mayor (`nailong_theme.wav`, 17.0s) vinculada con `<audio id="bgm">`.
  - Actualización de textos en escenas a 96 stickers y badge v3.3.0.
  - Verificación con `npx hyperframes check` (0 errores en lint, layout, motion, contrast, craft).
  - Renderizado completo a MP4 (1080×1920, 30 fps) con mezcla de audio impecable.
  - Integración del reproductor en la web (`#video-promo-section`) y botón «Ver Tráiler 🎬» en el banner principal.
- [x] **Web SPA y Verificación:**
  - Sincronización de cache busters `?v=3.3.0`, textos y contadores a 96 cromos.
  - Actualización de la suite `verify_all.py` (comprobación de 96 stickers correlativos y versión v3.3.0). Las 44 pruebas pasan en verde (100%).

---

## 4. Qué Está Pendiente o Próximos Pasos

- [ ] Fijar versiones CDN (Tailwind sin versión, Font Awesome sin `integrity`) y valorar módulos ES si el proyecto crece (D-15, abierta).
- [ ] Validación manual en dispositivo físico por parte del usuario de la exportación a WhatsApp de los 4 nuevos packs oficiales.

---

## 5. Bloqueos o Dudas Abiertas

Ninguno. La suite pasa al 100% y la sincronización entre web, Android APK y tráiler promocional está completada.
