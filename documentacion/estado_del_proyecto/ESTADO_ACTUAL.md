# Estado Actual del Proyecto — ¡El Mundo Mágico de Nailong!

> **Regla de Actualización:** Este fichero se **sobrescribe en cada sesión** para reflejar la realidad de AHORA. El historial de sesiones reside en `bitacora_de_sesiones/` y las decisiones técnicas en `DECISIONES.md`.
>
> **Última actualización:** 27/11/2026 (sesión principal «Pendientes versión 4.3» con dos sesiones paralelas, `textos-4-3` y `visor-botonera-4-3`): **web 4.3.0 integrada en `main`** con los textos de los stickers revisados con fotogramas (`T1`, `T2`, `W11`), el lore con fuentes (`guias_y_contexto/LORE_NAILONG.md`), el Visor Mágico con reproductor propio y «Crea tu sticker» (`VM1`–`VM3`), el tráiler horizontal (`V1`) y la botonera rehecha (`B1`, opción B). La app Android no cambia (D-27).
> **Rama activa:** `main`, con la 4.3.0 integrada pero **sin publicar** (sin `push`). Lo publicado en GitHub Pages sigue siendo la web 4.2.0 (`origin/main` = `618b225`), que es el punto de vuelta atrás.
> **Versión actual:** Web `v4.3.0` (sufijo anti-caché `?v=4.3.0`) | Android APK `v4.0.0` (`versionCode 16`; `version.json` sin cambios, D-27).

---

## 1. En una Frase

La web está en **v4.3.0** (integrada en `main`, sin publicar) y la app Android nativa en **v4.0.0** (`versionCode 16`), con **126 cromos oficiales** (97 animados en 4 packs 24/24/24/25 + 29 estáticos en 1 pack = 5 packs oficiales) cuyos textos se revisaron uno a uno con sus fotogramas; el lore de la web sale de un documento con fuentes; el **Visor Mágico** reproduce cualquier sticker animado con velocidad real (0,25×–3×), pausa, al revés y bumerán y permite **crear un sticker de WhatsApp** propio; el tráiler se ve en horizontal en pantallas anchas; la **botonera** tiene 12 sonidos sintetizados distintos. `verify_all.py` tiene **55 comprobaciones** y termina en verde (`55 VERIFICATION TESTS PASSED`); en equipos sin el código de la app Android declara «no comprobada» la parte Android de 5 de ellas.

---

## 2. Cifras Clave del Proyecto (Ground Truth)

| Métrica / Concepto | Valor Verificado |
|---|---|
| **Punto único de entrada web** | `index.html` + `css/styles.css` + `js/` (`tailwind-config.js`, `js/01`–`js/10` y `js/14` en `index.html`; `js/11`–`js/13` y Three.js se cargan bajo demanda desde `js/14` **solo cuando el usuario enciende el 3D**, D-26 + `W25`; 0 dependencias de compilación). |
| **Versiones (D-27)** | Web `4.3.0` en el pie (`#app-version`), `CHANGELOG.md` y los sufijos `?v=4.3.0` de `css/` y `js/`. App `4.0.0` en `version.json`, el banner «v4.0.0 APK» y el APK. `version.json` solo sube con un APK nuevo (si no, la app pediría actualizar sin fin). |
| **Peso de la primera visita (medido el 25/11 en una pestaña nueva a 1.024 y a 375 px, sin encender el 3D)** | Imágenes **641 KB** en 6 peticiones (4.1.0: 1.694 KB en 7), icono de la pestaña **1,7 KB** (antes 398 KB, no aparece en las cifras del navegador), **0 KB** de Font Awesome (antes 286 KB y 3 peticiones a cdnjs) y **0** peticiones a api.qrserver.com (antes 1 en cada visita). Terceros que quedan: Tailwind por CDN (compila en el navegador, `W26`) y Google Fonts. CLS `0` en la carga. |
| **Copias reducidas (`W33`, D-30)** | `Stickers Nailong/mini/`: 4 copias de 192 px nombradas por clave (`dragon-de-leche`, `xiao-qi-colita`, `bombloong`, `escamitas-espalda`; 5–125 KB) + `favicon.webp` (64 px). Las genera y comprueba `herramientas/miniaturas_web.py` (test 53). |
| **Iconos y QR (`W32`, `W34`, D-30)** | 27 iconos SVG (Font Awesome Free 6.5.1, CC BY 4.0) en un bloque generado de `css/styles.css` (16,9 KB sin comprimir; `herramientas/iconos_svg.py`, test 54), con 0 diferencias de posición y tamaño frente a la fuente a 375 y 1.440 px. QR del APK (33×33 módulos) y de «Compartir» (29×29) como SVG fijos de `herramientas/generar_qr.py`, idénticos módulo a módulo a los de api.qrserver.com (tests 22 y 48). |
| **Coste del 3D encendido (medido el 25/11 en Chrome sin interfaz con la gráfica real de este PC)** | Programas de *shader*: **23** en calidad «alta» y **18** en «baja», todos preparados al encender y 0 después (antes 16 + 1 en la intro + 7 al pulsar «Dibujo animado»). Encendido en visitas repetidas **330 ms** («alta», antes 553) y **287 ms** («baja», antes 476); primera visita con la caché de *shaders* vacía 2,75 s / 2,26 s (antes 2,19 / 2,09, pero luego con un tirón de 460–473 ms al cambiar de estilo). En «baja», reposo a **33 imágenes/s** (141–165 al tocarlo). Las llamadas de dibujo (27–29) y triángulos (~96.000) que da three.js no cuentan la pasada de sombra. En móvil real: **no comprobado**. |
| **Prueba del usuario en móvil real** | 25/11/2026, web 4.1.0 en su **Poco X7 Pro** (Android, Chrome): «va bastante bien, ni un tirón ni lagazo». La 4.2.0 aún no se ha probado en un móvil real. |
| **Nailong 3D apagado por defecto (D-26)** | Con la sección en pantalla: **0** peticiones a Three.js y a `js/11`–`js/13` y sin contexto WebGL hasta pulsar «🐣 Ver a Nailong en 3D». «Ocultar» deja el contexto WebGL perdido (`forceContextLoss`) y el `<canvas>` limpio; 0 errores de consola. |
| **Nailong 3D fiel a la serie (`3D5`–`3D10`, `3D12`, `3D13`, `3D18`; `21/21 OK`)** | Malla procedural estanca (`celda = 0,0105`: **`22160`** vértices; `0,0085` escritorio: `33864`; `0,0075`: `43521`; `huecos = 0`). Mide **0,97** (D-29, test 49: 0,96–1,01) con pies en `y = 0`. **15 huesos**, **63 tracks/clip** en GLB (11 clips). Cabeza `H1 0,120`, `H2 0,494`, `H3 0,472`, `H4 0,788`, `H5 0,472`, `H6 0,967`; torso `T1 0,410`, `T2 0,488`, `T3 0,408`; piernas `P1 0,133`, `P2 0,090`; brazos `B1 0,229`, `B2 0,109`, `B3 0,490`, `B4 -0,038`, `B5 OK`; cola `C1 0,275`, `C2 OK`; pancita `V1 0,328×0,347`, `V2 0,336×0,355`, `V3 +0,012`. |
| **Forma de la cara (`3D12` «V1 afinada» y `3D18` frente corta)** | Medida con `herramientas/perfil_cara.py` contra las capturas frontales `08`, `13`, `18` y `26` (media de la serie entre paréntesis): `F0` **`0,456`** (`0,457`), `F1` **`1,296`** (`1,267`), `F2` **`0,877`** (`0,855`), `F3` **`0,965`** (`0,946`; justo en el límite), `F4` **`0,943`** (`0,928`), `O1` **`0,454`** (`0,468`): **6/6**. |
| **Ojos a ras de la cara (`3D13`, D-28)** | Medido con `herramientas/medir_ojos_3d.js`: el globo **nunca sobresale** de la piel (`−0,5 mm` en reposo; `+0,5 mm` como mucho con los ojos muy abiertos), pliegue suave de ~6 mm arriba y abajo. |
| **Copias del Nailong 3D anterior** | `archivo/nailong3d_anteriores/`: el de justo antes de la 4.1 (cara V3 con ojos de bola) y el publicado en la 4.0.0 (18/11), con instrucciones para restaurarlos. |
| **Extras y herramientas 3D (`3D3`, `3D5`, `3D12`, `3D13`, `3D18`)** | Exportador de sticker `512×512` WebP (`≤ 100 KB`, RIFF/VP8X + EXIF WhatsApp; 25,8 KB en «alta»), panel `?3d=debug`, `?calidad=baja|alta`, `Nailong3DVisor.depurar.estado()` (con `programas`, `origenMalla`, `reposo`) y suite `herramientas/medir_nailong3d.js`, `capturar_3d_cdp.js`, `lamina_comparativa.py`, `perfil_cara.py` (`F0`–`F4`, `O1`), `medir_ojos_3d.js` y `evaluar_3d.py`. |
| **Referencias visuales oficiales 3D** | **26 capturas** reales de episodios en `documentacion/referencias_nailong_serie/` (**solo en local**, fuera de Git; D-25) + láminas en `comparativas/` (78 MB tras la limpieza `L3`: `3d12_final`, `3d12_v1_afinada`, `3d13_ojos_lente`, `3d18_frente`, `w32_iconos`, `w33_miniaturas`, `w_optim_3d`, `v4.2_integrada`). |
| **Banco de cromos coleccionables** | Exactamente 126 stickers WebP (512×512 con chunk EXIF WhatsApp: 97 animados + 29 estáticos) + 1 foto optimizada del creador + 1 sticker descatalogado fuera de catálogo (128 archivos en `Stickers Nailong/`), más la subcarpeta `mini/` de la web. |
| **Packs oficiales preconfigurados en Android** | 5 packs: *Nailong animado 1* (24), *Nailong animado 2* (24), *Nailong animado 3* (24), *Nailong animado 4* (25) y *Nailong estático* (29). Total: 126 stickers. |
| **Generador dinámico «Mi Selección»** | Mínimo 3 y máximo 30 stickers por lote, con vista de revisión («Ver (N) ❯»), 97 vistas previas animadas de 192 px (6.9 MB), 29 variantes animadas de los estáticos en `nailong_estaticos_animados` (683.94 KB) y un único pack por importación. |
| **Paquete nativo Android firmado** | `StickersNailong.apk` (41.7 MB / 41.732.353 bytes, firmado con clave *debug* oficial `SHA-256: 04b83add...abb2`, targetSdk 30, versionCode 16, versionName 4.0.0). `IMAGE_DATA_VERSION: '4'` en los 5 packs. |
| **Imágenes fijas por clave (D-22, `W11`)** | 31 claves en `ALL_STICKERS` y funciones `stickerPorClave` / `rutaSticker` (`js/02`): hero, muñeco, laboratorio, minijuego, «¿Quién es Nailong?», Visor, botonera, logo, banner, pie, icono de iPhone, precarga y `og:image`. La ficha de Bombloong es un recorte fijo del #117 (`mini/bombloong.webp`). Ninguna imagen fija depende ya del número del cromo. |
| **Herramientas de clasificación TikTok** | `herramientas/descargar_tiktok_consola.js`, `herramientas/stickers_vistos.json` (61 entradas) y `herramientas/stickers_descartados.npz` (4 descartes: `062`, `063`, `082`, `089`). |
| **Tráiler oficial animado (HyperFrames)** | `video-promo/nailong_trailer_v2.mp4` (1080×1920, 60 fps, 32,0 s, 18,0 MB, `preload="none"`), actualizado el 25/11: «+120» en lugar de «96» en el título de la lluvia de stickers y en la portada del álbum, y la app con los 5 packs y «Stickers animados» / «Stickers estáticos» (textos que no caducan). |
| **Tráiler horizontal para ordenador (HyperFrames, 27/11/2026)** | `video-promo/nailong_trailer_v2_horizontal.mp4` (1920×1080, 60 fps, 32,0 s, 17,1 MB, audio AAC) + `nailong_trailer_v2_horizontal_portada.webp` (960×540). **En la web desde la 4.3.0 (`V1`):** se elige al cargar `js/10` y al desplegar el tráiler con `matchMedia('(min-width: 768px) and (min-aspect-ratio: 1/1)')`; en el móvil en vertical sigue el vertical. Solo se descarga la portada que toca; `preload="none"` y `metadata` al desplegar (botón de pantalla completa activo). Fuentes en `video-promo/horizontal/`. |
| **Botonera de sonidos sintetizados (`B1`, 4.3.0)** | 12 botones con **12 sonidos distintos** en 3 grupos de 4 (voces, risas y llantos, efectos), por clave y con el título de su cromo; 9 sonidos nuevos con Web Audio (opción `B2`-B: sin clips reales). Volumen medio (RMS) 0,032–0,066 y 0,5–1,9 s, medidos sin altavoces. Antes eran 8 sonidos distintos, no 12. |
| **Visor Mágico (`VM1`–`VM3`, 4.3.0)** | Reproductor propio en `<canvas>` sin librerías (`js/05`): velocidad real medida (3× → 45,5 fps en el #17), pausa, paso a paso, al revés, bumerán y barra de tiempo; fotogramas idénticos píxel a píxel a Pillow en #2, #28 y #33; memoria ≤ 48 MB (32 MB en móviles) y liberada al cerrar. Abre los 97 animados del álbum y «¡Sorpréndeme!». «Crea tu sticker»: WebP animado 512×512 con EXIF de WhatsApp, ≤ 500 KB y ≤ 10 s (0 problemas con `normalizar_stickers.problems()`); en Safari, PNG fijo. |
| **Lore y textos (`T1`, `T2`, 4.3.0)** | `documentacion/guias_y_contexto/LORE_NAILONG.md`: fuente única del lore, con cada dato etiquetado por tipo de fuente. Revisión de los 126 textos con fotogramas en `notas_tecnicas/07_revision_textos_stickers.md` (`revision.json` + tiras, ~2,4 MB): 21 OK, 93 retocados, 10 reescritos, 2 con el personaje equivocado. |
| **Suite de pruebas automatizadas (`verify_all.py`)** | **55 comprobaciones** en verde el 27/11/2026 en `main` con la 4.3.0 integrada (adaptadas en la 4.3.0: 40 versión, 47 tráiler horizontal, 51 claves y 53 copias reducidas). Si falta el código de la app Android (`NAILONG_ANDROID_SRC`), la parte Android de los tests 43, 45, 47, 48 y 50 se declara como **NO COMPROBADO**. En este equipo se ejecuta con `py -3 verify_all.py`. |
| **Auditoría de stickers (`normalizar_stickers.py --check`)** | **0 problemas en los 126 stickers (100 % conformes con WhatsApp)**; distancia visual mínima en `1..126` = `21.46` (0 pares `< 20`). |

---

## 3. Qué Está Completado y Verificado

- [x] **Sesión del 27/11/2026, web 4.3.0 (Claude Code; bitácoras `2026-11-27_textos_stickers.md`, `2026-11-27_visor_tráiler_botonera.md` y `2026-11-27_integracion_v4.3.md`):** lore con fuentes; `T1`, `T2`, `W11` (rama `claude/textos-4-3-50d805`); `VM1`–`VM3`, `V1`, `B1` (rama `claude/visor-botonera-4-3-779d6f`); ambas fusionadas en `main` sin conflictos y versión 4.3.0. **Verificación:** `py -3 verify_all.py` → 55 en verde; navegador a 320, 375 y 1.280–1.366 px sin desbordes ni errores de consola (comprobado por las dos sesiones en sus ramas y, ya integrado en `main`, por la sesión del visor, que encontró y arregló la salida de la pantalla completa del tráiler: `9b87958`). Las dos ramas quedan fusionadas del todo (0 commits pendientes).
- [x] **Sesión del 27/11/2026 (Claude Code; bitácora `2026-11-27_trailer_horizontal.md`):** tráiler horizontal 1920×1080 renderizado con HyperFrames; `hyperframes check` sin errores y fotogramas del `.mp4` revisados en las 7 escenas. Sin integrar en la web.
- [x] **Sesiones del 25/11/2026, segunda parte (Claude Code; bitácoras `2026-11-25_optimizaciones_y_v4.2.md` y `2026-11-25_frente_corta_3d18.md`):**
  - **`W33`, `W32`, `W34`:** imágenes reducidas (más icono de pestaña y sprite del minijuego bajo demanda), iconos SVG propios y QR fijos (D-30).
  - **`3D14`–`3D16`:** sin sombra en tiempo real y ~30 fps en reposo en calidad «baja», malla en IndexedDB y *shaders* preparados al encender (D-30); en «alta», 24 vistas y 12 primeros planos de los ojos idénticos píxel a píxel a la 4.1.0.
  - **`3D18`:** frente corta (D-29), integrada desde la rama `claude/nailong3d-frente-631431`.
  - **Tráiler** con «+120» en vez de «96» y los 5 packs sin cifras; **limpieza `L3`** (−37 MB).
  - **Verificación:** `py -3 verify_all.py` → **55 comprobaciones en verde**; `evaluar_3d.py --etiqueta v4.2_integrada --expresiones --cara` → 21/21, 6/6, 24 vistas, 0 errores de consola/WebGL.
- [x] **Sesión del 25/11/2026, primera parte:** cara «V1 afinada», ojos «lente» (`3D13`, D-28) y web 4.1.0 (D-27).
- [x] **Sesión del 24/11/2026 (parte 5 · Claude Code):** `W31`, D-26 y `3D12`.
- [x] **Sesión del 24/11/2026 (parte 4 · Swarm 3D + Web):** `3D5`–`3D10` (`21/21 OK`), `3D3` y `W21`–`W25`, `W27`, `W28`, `W30`.
- [x] **Sesiones del 23/11 y 18/11/2026:** rediseño web móvil-primero y lanzamiento `v4.0.0`.

---

## 4. No Comprobado (Pendiente de Validación Real)

- **La 4.3.0 en móviles reales** (Safari en iPhone y Chrome en Android): el Visor preparando 60–80 fotogramas en un móvil modesto, «Crea tu sticker» (y su PNG de reserva en Safari) y el tráiler horizontal en iPad.
- **Un sticker creado con «Crea tu sticker» importado en WhatsApp real** (Android e iPhone).
- **Cómo suenan los 9 sonidos nuevos de la botonera:** solo se midieron volumen, duración y clics; falta escucharlos.
- **Que el niño del #28 (ficha de Xiao Qi) sea Xiao Qi:** el lore no describe su aspecto.
- **La 4.2.0 en móviles reales** (Safari en iPhone y Chrome en Android): el reposo a ~30 fps y la ausencia de sombra en tiempo real, el tiempo de preparar los *shaders* en un móvil modesto, la caché de la malla en Safari (y en su modo privado) y los iconos con «Alto contraste» de Windows (*forced-colors*).
- **Estilo «dibujo animado» con la cabeza nueva** y el `.glb` (ahora de 0,97 m) en Blender, Unity o Godot.
- **CLS de escritorio tras `W31` con el método de la sesión Swarm.**
- **App Android `v4.0.0` y WhatsApp real:** sin cambios; con `version.json` igual, la app no debería avisar de nada (código Android no disponible en este equipo).
- **Seguridad externa (`H-2` a `H-7`).**

---

## 5. Siguiente Paso

1. **Escuchar la botonera y probar la 4.3.0** en el ordenador y en el móvil (sobre todo «Crea tu sticker» con WhatsApp real).
2. **Publicar la web 4.3.0** con `git push` cuando el usuario lo apruebe (vuelta atrás: `git revert` de los commits nuevos; lo publicado antes es `618b225`).
3. **`B3`:** cuando el usuario descargue los episodios, piloto con uno (y, si se quieren clips reales, decidir `B2-A`, que exige una decisión nueva).
4. **Decisiones del usuario:** `W26` (Tailwind compilado; sería D-31), `L4`–`L6` (limpieza) y el #30 (`T3`).
5. **Pendientes de antes:** `3D17`, licencia del código (`LICENSE`), `documentacion/CREDITOS.md`, `3D11` (Blender) y `3D4` (AR, aplazada).
