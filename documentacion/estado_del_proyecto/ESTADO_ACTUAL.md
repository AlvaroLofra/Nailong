# Estado Actual del Proyecto — ¡El Mundo Mágico de Nailong!

> **Regla de Actualización:** Este fichero se **sobrescribe en cada sesión** para reflejar la realidad de AHORA. El historial de sesiones reside en `bitacora_de_sesiones/` y las decisiones técnicas en `DECISIONES.md`.
>
> **Última actualización:** 18/11/2026 (lanzamiento **v4.0.0** preparado en `main` local, **pendiente de `git push`**: 127 stickers tras incorporar 32 nuevos de TikTok —incluido el rescate de `sticker_127.webp`—, 5.º pack oficial en Android, estreno público de **Nailong en 3D**, mejoras `W9` y `W10`, y APK firmado de 42.9 MB).
> **Rama activa:** `main`.
> **Versión actual:** Web `v4.0.0` | Android APK `v4.0.0` (`versionCode 16`). Pendiente de `git push` a `main` (GitHub Pages).

---

## 1. En una Frase

La web oficial y la app Android nativa suben a la versión **v4.0.0** (`versionCode 16`), con **127 cromos oficiales** (98 animados en 4 packs 24/24/24/26 + 29 estáticos en 1 pack = 5 packs oficiales), estreno oficial de **Nailong en 3D** visible para todos con carga perezosa, mejoras `W9`/`W10` y APK firmado de 42.9 MB. `verify_all.py` tiene **52 comprobaciones** adaptadas a 127 stickers y `v4.0.0`.

---

## 2. Cifras Clave del Proyecto (Ground Truth)

| Métrica / Concepto | Valor Verificado |
|---|---|
| **Punto único de entrada web** | `index.html` + `css/styles.css` + `js/` (14 ficheros modulares más `tailwind-config.js`, 0 dependencias de compilación, todos con `?v=4.0.0`). |
| **Nailong 3D (publicado en v4.0.0)** | Sección `#nailong-3d` visible para todos (enlace `🧊 3D` desde `lg` y menú móvil); malla procedural estanca de ≈41 k vértices (≈27 k en móvil) generada en ≈0,3–0,5 s en un Web Worker, piel de 12 huesos, 5 acciones, 2 estilos; Three.js r147 por CDN con SRI bajo demanda (`IntersectionObserver` a 600 px) y pausa fuera de pantalla; GLB con 5 clips. |
| **Banco de cromos coleccionables** | Exactamente 127 stickers WebP (512×512 con chunk EXIF WhatsApp: 98 animados + 29 estáticos) + 1 foto optimizada del creador + 1 sticker descatalogado fuera de catálogo (129 archivos en `Stickers Nailong/`). |
| **Packs oficiales preconfigurados en Android** | 5 packs: *Nailong animado 1* (24), *Nailong animado 2* (24), *Nailong animado 3* (24), *Nailong animado 4* (26) y *Nailong estático* (29). Total: 127 stickers. |
| **Generador dinámico «Mi Selección»** | Mínimo 3 y máximo 30 stickers por lote, con vista de revisión («Ver (N) ❯»), 98 vistas previas animadas de 192 px (7.0 MB), 29 variantes animadas de los estáticos en `nailong_estaticos_animados` (683.94 KB) y un único pack por importación. |
| **Paquete nativo Android firmado** | `StickersNailong.apk` (42.9 MB / 42.874.074 bytes, firmado con clave *debug* oficial `SHA-256: 04b83add...abb2`, targetSdk 30, versionCode 16, versionName 4.0.0). `IMAGE_DATA_VERSION: '4'` en los 5 packs. |
| **Imágenes fijas por clave (D-22)** | Las 4 tarjetas de «¿Quién es Nailong?» usan `data-sticker` (`dragon-de-leche` → 2, `xiao-qi-colita` → 28, `bombloong` → 27, `escamitas-espalda` → 31). El resto de referencias fijas sigue por número (W11 en `MEJORAS_PENDIENTES.md`). |
| **Herramientas de clasificación TikTok** | `herramientas/descargar_tiktok_consola.js` (prioriza `document.images`, `credentials: 'omit'`, resumen limpio), `herramientas/stickers_vistos.json` (61 entradas: 3 descartes históricos + 57 repetidos mapeados + 1 rescatado como `sticker_127.webp`) y `herramientas/stickers_descartados.npz` (3 descartes). |
| **Tráiler oficial animado (HyperFrames)** | `video-promo/nailong_trailer_v2.mp4` (1080×1920, 60 fps, 32.0s, 17.4 MB, `preload="none"`, audio y SFX sintetizados a 120 BPM). |
| **Botonera de sonidos sintetizados** | 12 casillas con 12 sonidos únicos sintetizados con Web Audio API (`duang`, `chomp`, `slurp`, `bleh`, `maracas`, `fire`, `sleep`, `laugh`, `pirate`, `run`, `tail`, `fanfare`). |
| **Laboratorio de superpoderes** | Tamaño dinámico, modo camaleón, 6 disfraces mágicos, llamitas, hinchado de tripita, lluvia de pollo crujiente y gravedad cero espacial. |
| **Suite de pruebas automatizadas (`verify_all.py`)** | **52 comprobaciones**, actualizadas para 127 stickers y `v4.0.0` (incluidas las que leen el código Android de `C:\src`). |
| **Auditoría de stickers (`normalizar_stickers.py --check`)** | **0 problemas en los 127 stickers (100% conformes con WhatsApp)**; distancia visual mínima en `1..127` = `21.46` (0 pares `< 20`). |

---

## 3. Qué Está Completado y Verificado

- [x] **Sesión del 18/11/2026 — Lanzamiento `v4.0.0` (127 stickers, 5.º pack Android y estreno de Nailong 3D, en `main` local, pendiente de `git push`):**
  - **Catálogo de stickers (`96..127`, D-24):** clasificados 92 archivos descargados de TikTok: 32 nuevos incorporados en orden cronológico (`26` animados + `6` estáticos: `96`, `97`, `111`, `115`, `120`, `125`), 57 repetidos registrados por SHA-256 en `herramientas/stickers_vistos.json` y 3 descartes históricos registrados en `herramientas/stickers_descartados.npz` (61 entradas totales en `stickers_vistos.json` tras rescatar `062` como `sticker_127.webp`). Recortados limpiamente desde los originales 6 cromos con subtítulos, marcas o bandas (`104` 6% inf., `105` 10% inf., `106` 10.4% inf., `120` 18 px sup./inf., `121` 7% inf., `127` ~8% / 26 px inf. para quitar `@bubu.yuni`); conservados intactos `111`, `117` y `125`. Metadatos completos en `js/02-datos-stickers.js` y mejorado `herramientas/descargar_tiktok_consola.js`.
  - **Web y Nailong 3D (`W9`, `W10`):** eliminada la regla `body:not(.n3d-ver)` en `css/styles.css` y el uso de `localStorage` en `js/14-nailong3d-visor.js` para mostrar Nailong 3D a todos con carga perezosa (`rootMargin: '600px 0px'`) y pausa fuera de pantalla (arranque inmediato con `?3d=1`/`#nailong-3d`). En `index.html`, enlace `🧊 3D` visible desde `lg` y menú compactado en `1024–1536 px` (`W10`). En `js/04-navegacion.js`, frases del muñeco por sección visible en viewport (`COMPANION_SECTION_PHRASES` con `getBoundingClientRect().top`, `W9`) y nueva frase 3D. Contadores a `127`, badge `v4.0.0 APK`, pie `v4.0.0`, etiqueta `43 MB` y 16 sufijos `?v=4.0.0`.
  - **App Android (`StickersNailong.apk` v4.0.0, `versionCode 16`):** 5 packs cronológicos en `generar_assets.py` (24/24/24/26 + 29 estáticos), `IMAGE_DATA_VERSION = '4'`, 29 variantes en `nailong_estaticos_animados` (`generar_estaticos_animados.py --check`: `29/29 OK`, `683.94 KB`), 98 vistas previas de 192 px (`7.0 MB`), compilado release, alineado, firmado (`04b83add...abb2`), copiado a raíz (`42.874.074 bytes` / `42.9 MB`) y sincronizado con `version.json`.
  - **Documentación y pruebas:** `verify_all.py` actualizado a 127 stickers y `v4.0.0`; actualizados `README.md`, `GUIA_README.md`, `CHANGELOG.md`, `DECISIONES.md` (D-24), `MEJORAS_PENDIENTES.md`, `01_app_android_whatsapp_stickers.md`, `00_mapa_de_codigo.md`, `00_INDICE.md` y bitácora del `18/11`.
  - **Comprobado en código, stickers y APK:** `normalizar_stickers.py --check` (`127/127` sin problemas), distancia mínima `21.46` (`sticker_127` a `37.60`), `generar_estaticos_animados.py --check` (`29/29`), `apksigner verify --print-certs`, `node -c`, balance HTML, Playwright en Chromium (SwiftShader) para barra de navegación `320–1536 px`, carga perezosa 3D y frases W9 (en `126`), y suite `verify_all.py` (**52 comprobaciones**).
- [x] **Sesión del 15/11/2026 (revisión web 1 — modales `<dialog>` D-23, textos, escapado de fotos, `--clasificar` y auditoría de seguridad):** consolidada en `main` junto con `v4.0.0` (detalle en `bitacora_de_sesiones/2026-11-15_...` y `notas_tecnicas/06_auditoria_seguridad.md`).

---

## 4. No Comprobado (Pendiente de Validación Real)

- **App `v4.0.0` y 5.º pack en móvil real y WhatsApp:** instalación del APK actualizado encima de versiones anteriores, aceptación de los 5 packs (incluido *Nailong animado 4* y los 29 estáticos) y envío real de stickers en WhatsApp; importación real de packs mixtos de «Mi Selección».
- **Navegadores y dispositivos reales:** Safari en iPhone, Firefox real y lector de pantalla (navegación, `<dialog>` nativos y región `aria-live` del visor 3D).
- **Rendimiento 3D y red en producción:** 60 fps reales en GPU móvil, gestos táctiles reales de dos dedos, carga de Three.js desde jsDelivr/unpkg tras el `git push` a GitHub Pages y apertura del `.glb` exportado en Blender/Unity/Godot.
- **Seguridad y operación externa:** configuración de 2FA/accesos en GitHub y copia de seguridad externa de la clave de firma y de `C:\src\nailong_stickers_app` (`notas_tecnicas/06_auditoria_seguridad.md`, H-2 a H-7).
