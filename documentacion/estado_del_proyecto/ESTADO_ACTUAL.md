# Estado Actual del Proyecto — ¡El Mundo Mágico de Nailong!

> **Regla de Actualización:** Este fichero se **sobrescribe en cada sesión** para reflejar la realidad de AHORA. El historial de sesiones reside en `bitacora_de_sesiones/` y las decisiones técnicas en `DECISIONES.md`.
>
> **Última actualización:** 03/11/2026 (sin versión nueva, solo documentación: guía de estilo del README en `GUIA_README.md`, saneamiento de README.md, y revisión de pautas: `DOCUMENTACION.md` reducido a puntero, cifras obsoletas retiradas de las guías y test 35 que las detecta. Último release: v3.4.1, retiro del sticker 14 de IA, 95 cromos, packs 24/24/24/23, APK versionCode 11 de 31.2 MB).
> **Rama activa:** `main`.
> **Versión actual de producción:** Web `v3.4.1` | Android APK `v3.4.1` (`versionCode 11`).

---

## 1. En una Frase

La web oficial y la app Android nativa se encuentran sincronizadas en la versión **v3.4.1**, con el catálogo oficial depurado a **95 cromos reales** (tras retirar y descatalogar el antiguo sticker 14 de IA), packs oficiales de Android reequilibrados (24/24/24/23), binario APK firmado de 31.2 MB y las 47/47 comprobaciones de verificación superadas al 100%.

---

## 2. Cifras Clave del Proyecto (Ground Truth)

| Métrica / Concepto | Valor Verificado |
|---|---|
| **Punto único de entrada web** | `index.html` + `css/styles.css` + `js/` (10 ficheros modulares, 0 dependencias de compilación). |
| **Banco de cromos coleccionables** | Exactamente 95 stickers WebP (512×512 con chunk EXIF WhatsApp) + 1 foto optimizada del creador + 1 sticker descatalogado fuera de catálogo. |
| **Packs oficiales preconfigurados en Android** | 4 packs: *Nailong animado 1* (24), *Nailong animado 2* (24), *Nailong animado 3* (24) y *Nailong estático* (23). Total: 95 stickers. |
| **Generador dinámico «Mi Selección»** | Mínimo 3 y máximo 30 stickers por lote, con bifurcación inteligente por tipo mixto. |
| **Paquete nativo Android firmado** | `StickersNailong.apk` (31.2 MB / 31.204.172 bytes, firmado con clave *debug* oficial `SHA-256: 04b83add...abb2`, targetSdk 30, versionCode 11, versionName 3.4.1). |
| **Tráiler oficial animado (HyperFrames)** | `video-promo/nailong_trailer_v2.mp4` (1080×1920, 60 fps, 32.0s, 17.4 MB, audio y SFX sintetizados a 120 BPM). |
| **Botonera de sonidos sintetizados** | 12 casillas con 12 sonidos únicos sintetizados con Web Audio API (`duang`, `chomp`, `slurp`, `bleh`, `maracas`, `fire`, `sleep`, `laugh`, `pirate`, `run`, `tail`, `fanfare`). |
| **Laboratorio de superpoderes** | Tamaño dinámico, modo camaleón, 6 disfraces mágicos, llamitas, hinchado de tripita, lluvia de pollo crujiente y gravedad cero espacial. |
| **Suite de pruebas automatizadas (`verify_all.py`)** | **47 de 47 comprobaciones superadas con éxito (100%)**. |
| **Auditoría de stickers (`normalizar_stickers.py --check`)** | **0 problemas en los 95 stickers (100% conformes con WhatsApp)**. |

---

## 3. Qué Está Completado y Verificado

- [x] **Retiro y descatalogado del antiguo sticker 14:**
  - Archivo original conservado en disco como `Stickers Nailong/descatalogado_sticker_14.webp` sin borrar para trazabilidad.
  - Renumeración continua secuencial de `sticker_15.webp` a `sticker_96.webp` pasando a ser `sticker_14.webp` a `sticker_95.webp`.
  - Catálogo activo: exactamente 95 cromos (`sticker_1.webp` a `sticker_95.webp`) + `creador_nailong.webp`.
- [x] **Sincronización Web v3.4.1:**
  - `js/02-datos-stickers.js` actualizado con los 95 stickers oficiales.
  - Remapeadas las referencias en `js/03-hero.js` (estados de ánimo), `js/05-visor-magico.js` (`FEATURED_GIFS`), `js/07-sonidos-y-laboratorio.js` (`SOUNDBOARD_TILES`), `js/04-navegacion.js`, `js/06-album-y-descargas.js`, `manifest.json` e `index.html`.
  - Cache-busters de scripts y estilos actualizados a `?v=3.4.1`, pie con `v3.4.1` y badge con `v3.4.1 APK`.
- [x] **App Android nativa v3.4.1 (`versionCode 11`):**
  - Reajuste en `generar_assets.py` con 4 packs perfectamente balanceados: 24, 24, 24 y 23 stickers (total 95).
  - Vistas previas animadas y tray icons regenerados con éxito; `IMAGE_DATA_VERSION = '3'`.
  - `build.gradle` actualizado con `versionCode 11` y `versionName "3.4.1"`.
  - Compilada en release con Gradle, alineada con `zipalign`, firmada con la clave debug oficial y copiada a la raíz de la web (`StickersNailong.apk`, 31.2 MB).
  - Sincronizado `version.json` con fecha `2026-11-03`, código 11, versión 3.4.1 y tamaño de 31.2 MB.
- [x] **Guía canónica de estilo del README (GUIA_README.md):**
  - Creada documentacion/guias_y_contexto/GUIA_README.md con la dicotomía estricta: README.md (vitrina pública y amigable), CHANGELOG.md (historial técnico completo preservado) y documentacion/ (base técnica).
  - Regla 8 de AGENTS.md reforzada con mandato canónico obligatorio hacia la guía.
  - README.md saneado eliminando árboles de directorios internos, jerga técnica y parches históricos acumulados, adoptando el estilo fresco de v1.0.0.
- [x] **Verificación completa:**
  - `verify_all.py`: **47 de 47 pruebas superadas al 100%**.
  - `normalizar_stickers.py --check`: **95 de 95 stickers conformes**.
