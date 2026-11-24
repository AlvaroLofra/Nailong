# Estado Actual del Proyecto — ¡El Mundo Mágico de Nailong!

> **Regla de Actualización:** Este fichero se **sobrescribe en cada sesión** para reflejar la realidad de AHORA. El historial de sesiones reside en `bitacora_de_sesiones/` y las decisiones técnicas en `DECISIONES.md`.
>
> **Última actualización:** 25/11/2026 (sesión Claude Code: cara «V1 afinada», ojos «lente» a ras de la cara `3D13` y publicación de la **web 4.1.0**). La web 4.1.0 reúne las revisiones web 1 y 2 (rediseño móvil, Nailong 3D fiel a la serie, 3D apagado por defecto D-26, barra superior `W31`) y los cambios del 25/11. La app Android no cambia (D-27).
> **Rama activa:** `main`, publicada en GitHub Pages el 25/11/2026 (antes de la 4.1.0 lo publicado era `32816a2`, del 18/11).
> **Versión actual:** Web `v4.1.0` (sufijo anti-caché `?v=4.1.0`) | Android APK `v4.0.0` (`versionCode 16`; `version.json` sin cambios, D-27).

---

## 1. En una Frase

La web oficial está en **v4.1.0** y la app Android nativa en **v4.0.0** (`versionCode 16`), con **126 cromos oficiales** (97 animados en 4 packs 24/24/24/25 + 29 estáticos en 1 pack = 5 packs oficiales), **Nailong 3D fiel a la serie (`21/21` métricas de proporción y `5/5` de la cara) con ojos lisos a ras de la cara (`3D13`)** que arranca **apagado** y se carga solo al pulsarlo (D-26), exportador de sticker 512×512 WebP (`3D3`), herramientas automáticas de medición y comparación visual (`3D5`, `3D12`, `3D13`), web pulida en accesibilidad AA y rendimiento, y APK firmado de 41.7 MB. `verify_all.py` tiene **52 comprobaciones** y termina en verde (`52 VERIFICATION TESTS PASSED`); en equipos sin el código de la app Android declara «no comprobada» la parte Android de 5 de ellas.

---

## 2. Cifras Clave del Proyecto (Ground Truth)

| Métrica / Concepto | Valor Verificado |
|---|---|
| **Punto único de entrada web** | `index.html` + `css/styles.css` + `js/` (`tailwind-config.js`, `js/01`–`js/10` y `js/14` en `index.html`; `js/11`–`js/13` y Three.js se cargan bajo demanda desde `js/14` **solo cuando el usuario enciende el 3D**, D-26 + `W25`; 0 dependencias de compilación). |
| **Versiones (D-27)** | Web `4.1.0` en el pie (`#app-version`), `CHANGELOG.md` y los sufijos `?v=4.1.0` de `css/` y `js/`. App `4.0.0` en `version.json`, el banner «v4.0.0 APK» y el APK. `version.json` solo sube con un APK nuevo (si no, la app pediría actualizar sin fin). |
| **Barra superior de escritorio (`W31`)** | Sin desborde medido a 1.024, 1.100, 1.279, 1.280, 1.366, 1.440, 1.536 y 1.920 px. Barra hasta `88rem`, enlaces en línea desde `xl` (1.280 px) y menú ☰ por debajo; a 320–375 px el ☰ queda dentro. |
| **Nailong 3D apagado por defecto (D-26)** | Con la sección en pantalla: **0** peticiones a Three.js y a `js/11`–`js/13` y sin contexto WebGL hasta pulsar «🐣 Ver a Nailong en 3D». Encendido en **~0,5–0,8 s** en este PC (GPU real), «Ocultar» deja el contexto WebGL perdido (`forceContextLoss`) y el `<canvas>` limpio; 0 errores de consola. |
| **Peso de la página (medido el 25/11 a 1.024 px, sin encender el 3D)** | ~1,7 MB de imágenes al cargar (sobre todo stickers animados de 512 px usados en tamaño pequeño), 268 KB de fuentes de Font Awesome + 18 KB de su CSS, Tailwind por CDN (compila en el navegador) y CLS `0` en la carga. Propuestas `W26`, `W32`–`W34` en `MEJORAS_PENDIENTES.md`. |
| **Coste del 3D encendido (medido el 25/11 en este PC)** | 27 llamadas de dibujo, ~96.000 triángulos (con la pasada de sombra), 17 programas de *shader*, ~0,3 ms de CPU+GPU por fotograma. En móvil real: **no comprobado** (propuestas `3D14`–`3D16`). |
| **Accesibilidad y rendimiento web (`W21`–`W25`, `W27`–`W28`, `W30`)** | **0 textos** por debajo de WCAG AA (`≥ 4,5:1`) en 320, 375, 768 y 1440 px; **CLS de escritorio `0,0042`** (medido por la sesión Swarm); botón accesible de pausa de partículas (`#particles-toggle-btn`, `W21`); `autofocus` en cerrar en 4/4 `<dialog>` (`W22`); `#power-size-slider` de `31–32 px` (`W30`); arranque diferido (`W27`) y precarga LCP de `sticker_19.webp` (`W24`). |
| **Nailong 3D fiel a la serie (`3D5`–`3D10`, `3D12`, `3D13`; `21/21 OK`)** | Malla procedural estanca en Node (`celda = 0,0105`: **`22540` vértices**, `~0,2 s`; `celda = 0,0085` escritorio: `34442`; `celda = 0,0075`: `44250`, `~0,3 s`; `huecos = 0`, `H = 0,999`, `suelo = 0`). **15 huesos**, **63 tracks/clip** en GLB (11 clips). Cabeza (`H1 = 0,120`, `H2 = 0,494`, `H3 = 0,472`, `H4 = 0,771`, `H5 = 0,500`, `H6 = 0,967`), torso (`T1 = 0,410`, `T2 = 0,488`, `T3 = 0,408`), piernas (`P1 = 0,133`, `P2 = 0,090`), brazos con codo (`B1 = 0,229`, `B2 = 0,109`, `B3 = 0,490`, `B4 = -0,038`, `B5 = OK`), cola en 3 tramos (`C1 = 0,275`, `C2 = OK`) y pancita (`V1 = 0,328×0,347`, `V2 = 0,336×0,355`, `V3 = +0,012`). |
| **Forma frontal de la cara (`3D12`, variante «V1 afinada»)** | Medida con `herramientas/perfil_cara.py` contra las capturas frontales `08`, `13`, `18` y `26` (media de la serie entre paréntesis): `F1` **`1,261`** (`1,267`), `F2` **`0,874`** (`0,855`), `F3` **`0,965`** (`0,946`; justo en el límite del rango), `F4` **`0,890`** (`0,928`), `O1` **`0,454`** (`0,468`). Con los ojos «lente» la línea de referencia de los ojos (centro de los píxeles verdes del iris) baja 3 px aunque el iris está en el mismo sitio; por eso se llenó un poco la papada (Anexo E del plan). |
| **Ojos a ras de la cara (`3D13`, D-28)** | Medido con `herramientas/medir_ojos_3d.js` (Nailong de 1 m): el globo **nunca sobresale** de la piel (`−0,5 mm` en reposo; `+0,5 mm` como mucho con los ojos muy abiertos; antes `12,7 mm`), no rompe el contorno de 3/4 ni de perfil, tamaño visible `0,230 × 0,217` del ancho de la cabeza (antes `0,225 × 0,217`), borde a `0,7–1 mm` a los lados y pliegue suave de `~6 mm` arriba y abajo. Láminas en `referencias_nailong_serie/comparativas/3d13_ojos_lente/` (local, D-25). |
| **Copias del Nailong 3D anterior** | `archivo/nailong3d_anteriores/`: el de justo antes de la 4.1 (cara V3 con ojos de bola, 21/21) y el publicado en la 4.0.0 (18/11), con instrucciones para restaurarlos. |
| **Extras y herramientas 3D (`3D3`, `3D5`, `3D12`, `3D13`)** | Exportador de sticker `512×512` WebP (`≤ 100 KB`, RIFF/VP8X + EXIF WhatsApp, `3D3`), panel flotante `?3d=debug`, `Nailong3DVisor.depurar.reconstruirAnatomia()` para probar proporciones en vivo, y suite `herramientas/medir_nailong3d.js`, `capturar_3d_cdp.js` (7, 18, 24 o más vistas con `--expresiones`, `--cara` y `--ojos`), `lamina_comparativa.py`, `perfil_cara.py`, `medir_ojos_3d.js` y `evaluar_3d.py` (`--cara`). |
| **Referencias visuales oficiales 3D** | **26 capturas** reales de episodios catalogadas en `documentacion/referencias_nailong_serie/` (**solo en local**, fuera de Git; D-25) + láminas comparativas en `referencias_nailong_serie/comparativas/`. |
| **Banco de cromos coleccionables** | Exactamente 126 stickers WebP (512×512 con chunk EXIF WhatsApp: 97 animados + 29 estáticos) + 1 foto optimizada del creador + 1 sticker descatalogado fuera de catálogo (128 archivos en `Stickers Nailong/`). |
| **Packs oficiales preconfigurados en Android** | 5 packs: *Nailong animado 1* (24), *Nailong animado 2* (24), *Nailong animado 3* (24), *Nailong animado 4* (25) y *Nailong estático* (29). Total: 126 stickers. |
| **Generador dinámico «Mi Selección»** | Mínimo 3 y máximo 30 stickers por lote, con vista de revisión («Ver (N) ❯»), 97 vistas previas animadas de 192 px (6.9 MB), 29 variantes animadas de los estáticos en `nailong_estaticos_animados` (683.94 KB) y un único pack por importación. |
| **Paquete nativo Android firmado** | `StickersNailong.apk` (41.7 MB / 41.732.353 bytes, firmado con clave *debug* oficial `SHA-256: 04b83add...abb2`, targetSdk 30, versionCode 16, versionName 4.0.0). `IMAGE_DATA_VERSION: '4'` en los 5 packs. |
| **Imágenes fijas por clave (D-22)** | Las 4 tarjetas de «¿Quién es Nailong?» usan `data-sticker` (`dragon-de-leche` → 2, `xiao-qi-colita` → 28, `bombloong` → 27, `escamitas-espalda` → 31). El resto sigue pendiente en `W11`. |
| **Herramientas de clasificación TikTok** | `herramientas/descargar_tiktok_consola.js`, `herramientas/stickers_vistos.json` (61 entradas) y `herramientas/stickers_descartados.npz` (4 descartes: `062`, `063`, `082`, `089`). |
| **Tráiler oficial animado (HyperFrames)** | `video-promo/nailong_trailer_v2.mp4` (1080×1920, 60 fps, 32.0 s, 17.4 MB, `preload="none"`, audio y SFX sintetizados a 120 BPM). |
| **Botonera de sonidos sintetizados** | 12 casillas con 12 sonidos únicos sintetizados con Web Audio API. |
| **Suite de pruebas automatizadas (`verify_all.py`)** | **52 comprobaciones** en verde el 25/11/2026 (tests 40, 45 y `W7` adaptados a D-27: la web lleva su versión y `version.json` la del APK). Si falta el código de la app Android (`NAILONG_ANDROID_SRC`), la parte Android de los tests 43, 45, 47, 48 y 50 se declara como **NO COMPROBADO**. En este equipo `python` abre la Microsoft Store: se ejecuta con `py -3 verify_all.py`. |
| **Auditoría de stickers (`normalizar_stickers.py --check`)** | **0 problemas en los 126 stickers (100 % conformes con WhatsApp)**; distancia visual mínima en `1..126` = `21.46` (0 pares `< 20`). |

---

## 3. Qué Está Completado y Verificado

- [x] **Sesión del 25/11/2026 (Claude Code; bitácora `2026-11-25_ojos_lente_cara_v1_y_v4.1.md`):**
  - **`3D12` · Cara «V1 afinada»:** sustituye a V3 por preferencia del usuario; 21/21 y 5/5.
  - **`3D13` · Ojos «lente» a ras de la cara (D-28):** el globo ya no sobresale ni rompe el contorno; parpadeo, mirada, 6 caritas y 5 acciones sin atravesamientos; visto bueno del usuario con láminas antes/después.
  - **Copias de seguridad** del Nailong anterior en `archivo/nailong3d_anteriores/`.
  - **Web 4.1.0 (D-27)** con la app y `version.json` en 4.0.0; `AGENTS.md` (regla 7), `verify_all.py`, `CHANGELOG.md` y `README.md` al día.
  - **Verificación:** `py -3 verify_all.py` → **52 comprobaciones en verde** (parte Android «no comprobada» en este equipo); `evaluar_3d.py --etiqueta 3d13_ojos_lente --expresiones --cara` (24 vistas, 0 errores de consola/WebGL).
- [x] **Sesión del 24/11/2026 (parte 5 · Claude Code):** `W31`, D-26 y `3D12` (variante V3, después sustituida).
- [x] **Sesión del 24/11/2026 (parte 4 · Swarm 3D + Web):** `3D5`–`3D10` (`21/21 OK`), `3D3` y `W21`–`W25`, `W27`, `W28`, `W30` (commit `d6c37b6`).
- [x] **Sesión del 24/11/2026 (partes 1–3):** rediseño base 3D (`3D1`–`3D2`), refinamiento sobre 15 capturas reales y plan de fidelidad.
- [x] **Sesión del 23/11/2026:** rediseño web móvil-primero (`4.0.0 · revisión web 1`).
- [x] **Sesión del 18/11/2026:** lanzamiento `v4.0.0` (126 stickers, 5.º pack Android y estreno público de Nailong 3D).

---

## 4. No Comprobado (Pendiente de Validación Real)

- **Dispositivos móviles reales:** Safari en iPhone y Chrome en Android con la 4.1.0 (ojos «lente», encender/ocultar el 3D, rendimiento WebGL del shader *mochi*, respaldo PNG/WebP de `3D3`, `W29`).
- **CLS de escritorio tras `W31` con el método de la sesión Swarm** (el 25/11 dio `0` en la carga a 1.024 px, sin interacción).
- **`.glb` con los ojos nuevos en Blender/Unity/Godot:** los nodos `Nailong_ojoLente` llevan escala no uniforme (válida en glTF), pero no se ha abierto en programas externos.
- **App Android `v4.0.0` y WhatsApp real:** sin cambios en esta sesión; con `version.json` igual, la app no debería avisar de nada (código Android no disponible en este equipo).
- **Seguridad externa (`H-2` a `H-7`).**

---

## 5. Siguiente Paso

1. **Limpieza de la carpeta (`L1`–`L6` en `MEJORAS_PENDIENTES.md`):** decidir qué se borra (lo mayor: ~763 MB de `node_modules` del vídeo y ramas viejas de Git).
2. **Optimización:** `W32` (iconos SVG en lugar de Font Awesome), `W33` (imágenes pequeñas reducidas), `W34` (QR estático) y, para el 3D, `3D14`–`3D16` tras medir en un móvil real; `W26` (Tailwind compilado) sigue siendo **decisión del usuario** (choca con «sin build»).
3. **Probar la 4.1.0 en un móvil real** (iPhone y Android).
4. **Decidir:** licencia del código (`LICENSE`), `documentacion/CREDITOS.md`, `3D11` (Blender) y `3D4` (AR, aplazada).
