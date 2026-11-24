# Estado Actual del Proyecto — ¡El Mundo Mágico de Nailong!

> **Regla de Actualización:** Este fichero se **sobrescribe en cada sesión** para reflejar la realidad de AHORA. El historial de sesiones reside en `bitacora_de_sesiones/` y las decisiones técnicas en `DECISIONES.md`.
>
> **Última actualización:** 24/11/2026 (cierre de sesión Swarm 3D + Web). Completadas en modo Swarm las mejoras **3D5–3D10** del [`PLAN_FIDELIDAD_NAILONG_3D.md`](PLAN_FIDELIDAD_NAILONG_3D.md) (de `1/21` a **`21/21` métricas 3D en rango**, con 15 huesos, 63 tracks/clip y cabeza en «judía inclinada» con `rotX`), **`3D3`** (exportación de sticker `512×512` WebP con EXIF WhatsApp desde la pose actual) y el bloque de mejoras web **`W21`–`W25`, `W27`–`W28` y `W30`** (contraste WCAG AA con 0 fallos, CLS de escritorio `0,0042`, botón de pausa de partículas, carga diferida de `js/11`–`js/13` y optimización de arranque). Commiteado en `main` (`d6c37b6`), pendiente de `git push` cuando el usuario lo pida.
> **Rama activa:** `main` (último publicado en GitHub Pages: `origin/main` = `32816a2`; commits locales del 24/11: `90b27d5`, `d63cf3f`, `8a6ba76`, `88b1716`, `d6c37b6` y cierre documental).
> **Versión actual:** Web `v4.0.0` (sufijo anti-caché `?v=4.0.0-web2`) | Android APK `v4.0.0` (`versionCode 16`).

---

## 1. En una Frase

La web oficial y la app Android nativa están en **v4.0.0** (`versionCode 16`), con **126 cromos oficiales** (97 animados en 4 packs 24/24/24/25 + 29 estáticos en 1 pack = 5 packs oficiales), **Nailong 3D re-esculpido al 100 % de las proporciones de la serie (`21/21 OK`)** con 15 huesos, exportador de sticker 512×512 WebP (`3D3`) y herramientas automáticas de medición y comparación visual (`3D5`), web pulida en accesibilidad AA y rendimiento (`CLS 0,0042`, carga diferida `W25`) y APK firmado de 41.7 MB. `verify_all.py` tiene **52 comprobaciones** y termina en verde (`ALL 52 VERIFICATION TESTS PASSED SUCCESSFULLY!`); en equipos sin el código de la app Android declara «no comprobada» la parte Android de 5 de ellas.

---

## 2. Cifras Clave del Proyecto (Ground Truth)

| Métrica / Concepto | Valor Verificado |
|---|---|
| **Punto único de entrada web** | `index.html` + `css/styles.css` + `js/` (`tailwind-config.js`, `js/01`–`js/10` y `js/14` en `index.html`; `js/11`–`js/13` cargados bajo demanda en orden desde `js/14`, mejora `W25`; 0 dependencias de compilación). |
| **Accesibilidad y rendimiento web (`W21`–`W25`, `W27`–`W28`, `W30`)** | **0 textos** por debajo de WCAG AA (`≥ 4,5:1`) en 320, 375, 768 y 1440 px; **0 desborde horizontal** en los 4 anchos; **CLS de escritorio `0,0042`** (`≤ 0,05`, desde `0,11`) y móvil/tableta `0`; botón accesible de pausa de partículas (`#particles-toggle-btn`, `W21`); `autofocus` en cerrar en 4/4 `<dialog>` (`W22`); `#power-size-slider` de `31–32 px` (`W30`); arranque diferido (`W27`) y precarga LCP de `sticker_19.webp` (`W24`). |
| **Nailong 3D fiel a la serie (`3D5`–`3D10`, `21/21 OK`)** | Malla procedural estanca en Node (`celda = 0,0105`: **`23080` vértices**, `232 ms`; `celda = 0,0075`: `45368` vértices, `331 ms`; `huecos = 0`, `no2 = 0`, `inv = 0`, `pesosMal = 0`, `H = 0,997`, `suelo = 0`). **15 huesos** (`codoIzq`, `codoDer`, `colaMedia`), **63 tracks/clip** en GLB (11 clips). Cabeza en «judía inclinada» con `rotX` (`H1 = 0,116`, `H2 = 0,490`, `H3 = 0,484`, `H4 = 0,777`, `H5 = 0,490`, `H6 = 0,959`), torso (`T1 = 0,410`, `T2 = 0,488`, `T3 = 0,416`), piernas (`P1 = 0,133`, `P2 = 0,090`), brazos con codo (`B1 = 0,229`, `B2 = 0,109`, `B3 = 0,490`, `B4 = -0,038`, `B5 = OK`), cola en 3 tramos (`C1 = 0,275`, `C2 = OK`) y pancita sin halo (`V1 = 0,328×0,347`, `V2 = 0,336×0,355`, `V3 = +0,012`). |
| **Extras y herramientas 3D (`3D3`, `3D5`)** | Exportador de sticker `512×512` WebP (`≤ 100 KB`, RIFF/VP8X + EXIF WhatsApp, `3D3`), panel flotante `?3d=debug` (88 deslizadores + Worker + «Copiar ANATOMIA»), y suite `herramientas/medir_nailong3d.js`, `capturar_3d_cdp.js` (Chrome Headless CDP, 0 deps, 7 u 18 vistas), `lamina_comparativa.py` (incl. `--ab` y fallback D-25) y `evaluar_3d.py`. |
| **Referencias visuales oficiales 3D** | 15 capturas reales de episodios archivadas y catalogadas en `documentacion/referencias_nailong_serie/` (**solo en local**, fuera de Git; D-25) + láminas comparativas generadas en `referencias_nailong_serie/comparativas/`. |
| **Banco de cromos coleccionables** | Exactamente 126 stickers WebP (512×512 con chunk EXIF WhatsApp: 97 animados + 29 estáticos) + 1 foto optimizada del creador + 1 sticker descatalogado fuera de catálogo (128 archivos en `Stickers Nailong/`). |
| **Packs oficiales preconfigurados en Android** | 5 packs: *Nailong animado 1* (24), *Nailong animado 2* (24), *Nailong animado 3* (24), *Nailong animado 4* (25) y *Nailong estático* (29). Total: 126 stickers. |
| **Generador dinámico «Mi Selección»** | Mínimo 3 y máximo 30 stickers por lote, con vista de revisión («Ver (N) ❯»), 97 vistas previas animadas de 192 px (6.9 MB), 29 variantes animadas de los estáticos en `nailong_estaticos_animados` (683.94 KB) y un único pack por importación. |
| **Paquete nativo Android firmado** | `StickersNailong.apk` (41.7 MB / 41.732.353 bytes, firmado con clave *debug* oficial `SHA-256: 04b83add...abb2`, targetSdk 30, versionCode 16, versionName 4.0.0). `IMAGE_DATA_VERSION: '4'` en los 5 packs. |
| **Imágenes fijas por clave (D-22)** | Las 4 tarjetas de «¿Quién es Nailong?» usan `data-sticker` (`dragon-de-leche` → 2, `xiao-qi-colita` → 28, `bombloong` → 27, `escamitas-espalda` → 31). El resto sigue pendiente en `W11`. |
| **Herramientas de clasificación TikTok** | `herramientas/descargar_tiktok_consola.js`, `herramientas/stickers_vistos.json` (61 entradas) y `herramientas/stickers_descartados.npz` (4 descartes: `062`, `063`, `082`, `089`). |
| **Tráiler oficial animado (HyperFrames)** | `video-promo/nailong_trailer_v2.mp4` (1080×1920, 60 fps, 32.0 s, 17.4 MB, `preload="none"`, audio y SFX sintetizados a 120 BPM). |
| **Botonera de sonidos sintetizados** | 12 casillas con 12 sonidos únicos sintetizados con Web Audio API. |
| **Suite de pruebas automatizadas (`verify_all.py`)** | **52 comprobaciones** en verde el 24/11/2026 (test 49 ampliado con `huesos == 15` y todos los rangos de `3D6`–`3D10`). Si falta el código de la app Android (`NAILONG_ANDROID_SRC`), la parte Android de los tests 43, 45, 47, 48 y 50 se declara como **NO COMPROBADO**. |
| **Auditoría de stickers (`normalizar_stickers.py --check`)** | **0 problemas en los 126 stickers (100 % conformes con WhatsApp)**; distancia visual mínima en `1..126` = `21.46` (0 pares `< 20`). |

---

## 3. Qué Está Completado y Verificado

- [x] **Sesión del 24/11/2026 (parte 4 · Swarm 3D + Web; bitácora `2026-11-24_mejoras_3d_y_web_swarm.md`):**
  - **Fase 0 (`3D5`):** herramientas automáticas sin Playwright ni dependencias externas (`medir_nailong3d.js`, `capturar_3d_cdp.js`, `lamina_comparativa.py`, `evaluar_3d.py`) y panel flotante `?3d=debug`.
  - **Fase 1 (`3D6`–`3D10`):** ejecutada paso a paso con competencias A/B visuales en `3D8` (brazos con codo, ganadora Variante B) y `3D10` (cabeza redondeada y adelantada con `rotX` en judía inclinada, ganadora Variante B). Progreso verificado: `1/21 → 9/21 → 13/21 → 15/21 → 21/21 OK`, con 18 vistas CDP limpias (0 *clipping*, 0 *z-fighting*, 0 errores consola/WebGL) y test 49 actualizado en cada paso.
  - **Pista Web (`W21`–`W24`, `W27`–`W28`, `W30`):** contraste WCAG AA completo (0 fallos en 320–1440 px), CLS de escritorio reducido a `0,0042`, pausa de partículas accesible, `autofocus` en los 4 `<dialog>`, prioridad LCP, arranque diferido y deslizador táctil ≥ 28 px.
  - **Integración final (`3D3` + `W25`):** botón y exportador de sticker `512×512` WebP con EXIF WhatsApp desde la pose 3D y carga diferida de `js/11`–`js/13` desde `js/14`.
  - **Verificación:** `python verify_all.py` (**52 comprobaciones** en verde; en equipos sin `C:\src\nailong_stickers_app` la parte Android de 5 de ellas se declara «no comprobada») y `python herramientas/evaluar_3d.py --expresiones` en verde con **21/21 OK**.
- [x] **Sesión del 24/11/2026 (partes 1–3):** rediseño base 3D (`3D1`–`3D2`), refinamiento sobre 15 capturas reales (`90b27d5`, `d63cf3f`, `8a6ba76`) y diagnóstico/plan de fidelidad (`PLAN_FIDELIDAD_NAILONG_3D.md`).
- [x] **Sesión del 23/11/2026:** rediseño web móvil-primero (`4.0.0 · revisión web 1`).
- [x] **Sesión del 18/11/2026:** lanzamiento `v4.0.0` (126 stickers, 5.º pack Android y estreno público de Nailong 3D).

---

## 4. No Comprobado (Pendiente de Validación Real)

- **Dispositivos móviles reales:** Safari en iPhone (zona segura con `#bottom-nav`, rendimiento WebGL del shader *mochi*, respaldo PNG/WebP de `3D3`) y Chrome en Android real (incl. validación real de `W29`).
- **Compilación y prueba real del APK Android:** en este equipo `verify_all.py` valida el código fuente local de la app (tests 43, 45, 47, 48 y 50; en otros equipos sin `NAILONG_ANDROID_SRC` esas 5 partes se declaran «no comprobadas»), pero no se ha recompilado ni probado el APK en un teléfono real en esta sesión.
- **Apertura de `nailong_3d.glb` (15 huesos, 11 clips / 63 tracks) en software externo:** Blender, Unity o Godot.
- **App `v4.0.0` y 5.º pack en WhatsApp real, y seguridad externa (`H-2` a `H-7`).**

---

## 5. Siguiente Paso

1. **Revisión visual del usuario y commit/push en `main`:** revisar las láminas finales (`21/21 OK` + expresiones) y decidir si se integran los commits en `main`, se actualiza `CHANGELOG.md` / sufijo `?v=4.0.0-web3` y se publica en GitHub Pages (`git push`).
2. **Decidir compuerta `3D11` (piloto opcional con Blender):** solo si el usuario considera que falta algo tras ver el modelo `21/21 OK` (reabriría D-21).
3. **Decidir antes de publicar:** licencia del código (`LICENSE`), `documentacion/CREDITOS.md` y si se elimina la rama local antigua `nailong-3d-fiel`.
4. **Pendientes menores opcionales:** `W11` (claves `data-sticker` en el resto de imágenes fijas), `W29` (comprobar en móvil real), `W8`/`W26` (solo si se replantea D-15) y `3D4` (AR, aplazada).
