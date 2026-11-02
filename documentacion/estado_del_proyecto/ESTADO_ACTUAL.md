# Estado Actual del Proyecto — ¡El Mundo Mágico de Nailong!

> **Regla de Actualización:** Este fichero se **sobrescribe en cada sesión** para reflejar la realidad de AHORA. El historial de sesiones reside en `bitacora_de_sesiones/` y las decisiones técnicas en `DECISIONES.md`.
>
> **Última actualización:** 02/11/2026 (v3.4.0: tráiler oficial v2 con demo interactiva de app en HyperFrames a 60fps/32s, pantalla completa 9:16 con luz ambiental, 12 sonidos únicos en botonera, laboratorio ampliado, velocidad calibrada en minijuego, crédito de autoría «Desarrollado por Álvaro Lofra» y eliminación total de caracteres chinos en web, app y vídeo).
> **Rama activa:** `main`.
> **Versión actual de producción:** Web `v3.4.0` | Android APK `v3.4.0` (`versionCode 10`).

---

## 1. En una Frase

La web oficial y la app Android nativa se encuentran sincronizadas en la versión **v3.4.0**, con un tráiler oficial animado v2 generado con HyperFrames (32.0s, 60fps) con demo interactiva de la app, reproductor web con luz ambiental en tiempo real (Ambilight) y relación 9:16 íntegra, supresión total de caracteres chinos, autoría «Desarrollado por Álvaro Lofra», 12 sonidos únicos en la botonera, nuevos superpoderes y las 47/47 comprobaciones de verificación superadas al 100%.

---

## 2. Cifras Clave del Proyecto (Ground Truth)

| Métrica / Concepto | Valor Verificado |
|---|---|
| **Punto único de entrada web** | `index.html` + `css/styles.css` + `js/` (10 ficheros modulares, 0 dependencias de compilación). |
| **Banco de cromos coleccionables** | Exactamente 96 stickers WebP (512×512 con chunk EXIF WhatsApp) + 1 foto optimizada del creador. |
| **Packs oficiales preconfigurados en Android** | 4 packs: *Nailong animado 1* (25), *Nailong animado 2* (24), *Nailong animado 3* (24) y *Nailong estático* (23). Total: 96 stickers. |
| **Generador dinámico «Mi Selección»** | Mínimo 3 y máximo 30 stickers por lote, con bifurcación inteligente por tipo mixto. |
| **Paquete nativo Android firmado** | `StickersNailong.apk` (31.1 MB / 31.065.097 bytes, firmado con clave *debug* oficial `SHA-256: 04b83add...abb2`, targetSdk 30, versionCode 10, versionName 3.3.4). |
| **Tráiler oficial animado (HyperFrames)** | `video-promo/nailong_trailer_v2.mp4` (1080×1920, 60 fps, 32.0s, 17.4 MB, audio y SFX sintetizados a 120 BPM). |
| **Botonera de sonidos sintetizados** | 12 casillas con 12 sonidos únicos sintetizados con Web Audio API (`duang`, `chomp`, `slurp`, `bleh`, `maracas`, `fire`, `sleep`, `laugh`, `pirate`, `run`, `tail`, `fanfare`). |
| **Laboratorio de superpoderes** | Tamaño dinámico, modo camaleón, 6 disfraces mágicos, llamitas, hinchado de tripita, lluvia de pollo crujiente y gravedad cero espacial. |
| **Suite de pruebas automatizadas (`verify_all.py`)** | **47 de 47 comprobaciones superadas con éxito (100%)**. |
| **Auditoría de stickers (`normalizar_stickers.py --check`)** | **0 problemas en los 96 stickers (100% conformes con WhatsApp)**. |

---

## 3. Qué Está Completado y Verificado

- [x] **Tráiler oficial animado v2 (`video-promo/`):**
  - Limpieza completa de la carpeta `video-promo/` retirando bocetos obsoletos y versiones antiguas; consolidada la v2 en la raíz de `video-promo/` manteniendo intacto `trailer-3d/`.
  - Reestructuración de escenas: Saludo (`sticker_2.webp`) -> Pancita -> Minijuego (inmediatamente tras "tócame la pancita") -> 96 stickers -> Álbum coleccionable -> App y WhatsApp -> Pantalla final.
  - Mayor protagonismo a la app: mini-demo interactiva (7.0s) con vista de la pantalla principal, botón «+ Añadir», navegación dentro de la carpeta, selección de 3 stickers individuales con checks y contador dinámico `1/30` -> `2/30` -> `3/30`, pulsación de «Importar a WhatsApp» y posterior transición a la conversación de WhatsApp con `sticker_72` intacta.
  - Pantalla final con el crédito «Desarrollado por Álvaro Lofra» en tipografía Fredoka mediana.
  - Decoraciones exteriores (flores y burbujas SVG) y transiciones elásticas.
  - Renderizado exitoso a 1080×1920, 60 fps, 32.0s (`nailong_trailer_v2.mp4`) y extracción de portada en fotograma 0 (`nailong_trailer_v2_portada.webp`).
- [x] **Reproductor web con luz ambiental y pantalla completa 9:16:**
  - Reglas CSS para evitar que en modo pantalla completa en ordenador se corte el formato vertical 9:16 a 16:9 (`object-fit: contain !important;`).
  - Efecto de luz ambiental en tiempo real (Ambilight) mediante canvas dinámico que proyecta los tonos vivos del vídeo en los laterales y botón de activación directa.
- [x] **Botonera musical y Laboratorio de superpoderes:**
  - Botonera ampliada con 12 sintetizadores Web Audio independientes y representativos del universo de Nailong.
  - Laboratorio enriquecido con 6 disfraces interactivos (`setLabCostume`), lluvia de muslitos de pollo crujiente (`feedLabChicken`) y gravedad cero espacial (`toggleLabZeroGravity`).
- [x] **Minijuego arcade calibrado:**
  - Velocidad lineal al usar las flechas del teclado suavizada (`Math.max(10, Math.round(foodCanvas.width * 0.013))`) para un manejo ágil pero no excesivamente rápido ni incontrolable.
- [x] **Eliminación total de caracteres chinos:**
  - Verificada la ausencia de cualquier carácter chino (`[\u4e00-\u9fff]`) en `index.html`, `manifest.json`, `js/`, en el código fuente de la app Android (`C:\src\nailong_stickers_app`) y en el tráiler, manteniendo redacciones 100% naturales en español.
- [x] **App Android nativa v3.4.0 (`versionCode 10`):**
  - Muestra `v3.4.0 · Desarrollado por Álvaro Lofra` en la pantalla principal.
  - Eliminadas las carpetas de recursos chinos `values-zh-rCN` y `values-zh-rTW`.
  - Compilada en release con Gradle, alineada con `zipalign`, firmada con la clave debug oficial y copiada a la raíz de la web (`StickersNailong.apk`, 31.1 MB).
  - Sincronizado `version.json` con fecha, notas y peso real.
- [x] **Verificación completa:**
  - `verify_all.py`: 47 de 47 pruebas superadas al 100%.
  - `normalizar_stickers.py --check`: 96 de 96 stickers correctos.
