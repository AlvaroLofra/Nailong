# Mapa de código de la web (`index.html`, `css/`, `js/`)

> **Propósito:** saltar directamente al fichero correcto sin búsquedas ciegas. Desde D-15 (2026-10-31) el antiguo `index.html` de ≈3.800 líneas está dividido en marcado + CSS + ficheros JS numerados (10 originales y, desde la sesión del 2026-11-04, 4 más del visor 3D, D-21). Trasladado desde `CLAUDE.md`/`GEMINI.md` el 2026-10-31 (D-14).
> **Mantenimiento:** si cambia la estructura de `index.html`, actualiza este mapa en la misma sesión. Para localizar una función: `grep -n "function nombre" js/*.js`.

## Qué vive en cada fichero

| Fichero | Contenido (bloques de la lista de abajo) | Líneas aprox. |
|---|---|---|
| `index.html` | Marcado de todas las secciones; carga `css/`, `js/01`–`js/10` y `js/14` (con `?v=` anti-caché; `js/11`–`js/13` se cargan bajo demanda desde `js/14`, mejora W25); botón de pausa de partículas `#particles-toggle-btn` (W21), `autofocus` en los 4 `<dialog>` (W22), botón `#nailong-3d-sticker` (3D3), botones `#nailong-3d-cargar` / `#nailong-3d-ocultar` del 3D apagado por defecto (D-26), cabecera que pasa al menú ☰ por debajo de 1.280 px (W31), icono de pestaña y copias reducidas de `Stickers Nailong/mini/` en logo, banner, pie y tarjetas (W33) y QR fijos en SVG `#apk-qr-img` / `#share-qr-code` (W34); en el banner de la app, demo animada `#apk-demo` con `<video id="apk-demo-video">` sin autoplay (DA1); en `#magic-modal`, lienzo `#modal-player-canvas` y controles `#visor-controles` del reproductor (VM1) | 1.356 |
| `css/styles.css` | Estilos propios: variables, Claymorphism, animaciones, `body.particles-paused` (W21), contraste WCAG AA (W23), reservas de espacio anti-CLS (W28), objetivo táctil del deslizador `#power-size-slider` ≥ 28 px (W30), estilos `.n3d-*` (incl. `.n3d-cargando` y controles ocultos con el 3D apagado, D-26), controles del reproductor del Visor `.visor-ctrl` / `.visor-vel` (VM1), panel «Crea tu sticker» `#visor-creador` (VM3), tráiler horizontal `.trailer-horizontal` (V1), marco de móvil de la demo de la app `.apk-demo-*` (DA1) y, al final, el bloque generado de los 31 iconos SVG (`ICONOS-INICIO` … `ICONOS-FIN`, clases `fa-*`, W32) | 711 |
| `js/tailwind-config.js` | Paleta y fuentes de Tailwind con métricas de respaldo anti-CLS (se carga justo tras el CDN) | 30 |
| `js/01-audio.js` | 1 · Web Audio (síntesis, desbloqueo en iOS); 1B · sonidos de la botonera (B1: `SONIDOS_BOTONERA`, voz de dibujo con formantes `vozDibujo`, ruido filtrado `rafagaRuido`) | 431 |
| `js/02-datos-stickers.js` | 2 · `ALL_STICKERS` (catálogo de cromos: título, descripción, categoría y sonido revisados con fotogramas en la 4.3.0, T1; `clave` estable en los usados fuera del álbum), `stickerPorClave()` / `rutaSticker()` (W11: el hero, el laboratorio, el minijuego y el Visor buscan sus cromos por clave y leen de aquí sus textos) y `aplicarStickersFijos()` (resuelve `data-sticker`, D-22; respeta las copias `mini/<clave>.webp`, W33) | 157 |
| `js/03-hero.js` | 3 · Hero, contador Duang, estados de ánimo (`moodData` por clave de cromo: imagen, texto alternativo y sonido salen de `ALL_STICKERS`, W11) y control de pausa de partículas de fondo (`#particles-toggle-btn`, `sessionStorage`, W21) | 112 |
| `js/04-navegacion.js` | 4 · Navegación móvil y muñeco acompañante (`COMPANION_SECTION_PHRASES`, W9) | 131 |
| `js/05-visor-magico.js` | 5–6 · Tira de escenas y Visor Mágico; 6A · reproductor propio de WebP animado en `<canvas>` (VM1: `leerWebPAnimado`, `componerFotogramas`, `soltarVisor`) y Visor abierto con cualquier cromo animado (VM2: `abrirVisorConSticker`, `sorprendeme`); 6C · «Crea tu sticker» (VM3: `crearStickerVisor`, `montarWebPAnimado`, `estimarAjusteCreador`) | 1.346 |
| `js/06-album-y-descargas.js` | 7–7B · Álbum polaroid, lightbox, descarga/WhatsApp/portapapeles | 616 |
| `js/07-sonidos-y-laboratorio.js` | 8–9 · Botonera de sonidos (B1: `SOUNDBOARD_GRUPOS`, `SOUNDBOARD_TILES` por clave) y Laboratorio de superpoderes | 281 |
| `js/08-minijuego.js` | 10 · Minijuego «La Gran Comilona»; el sprite del jugador se pide al acercarse al juego o al empezar (`cargarSpriteJugador`, W33) | 474 |
| `js/09-modo-fiesta.js` | 11 · Modo Fiesta (confeti en canvas) y modal de compartir (el QR es un SVG fijo de `index.html`, W34) | 302 |
| `js/10-inicio.js` | 14 · Inicialización escalonada (`diferirArranque` con `requestIdleCallback`, W27), scrollspy, bloqueo de scroll, banner de la app (`version.json`, «Copiar enlace» + caja del QR fijo `#apk-qr-box`, W34; demo animada `setupAppDemo`, DA1) y `window.onload` | 359 |
| `js/11-nailong3d-geometria.js` | 15 · Núcleo 3D sin dependencias (carga diferida por `js/14`, W25): `ANATOMIA` 21/21 OK con `rotX` (judía inclinada) y `perfilCabeza` (cara «V1 afinada», 3D12: `escalaCabezaX` / `dCabeza`), cúpula aplastada de la frente (3D18: `CUPULA`, `dCabezaSinCupula`), ojo «lente» a ras (3D13: `OJO` con cizalla `a`/`b` y `lente`, ventana `VENTANA` tallada en `sdf()`), SDF, Surface Nets estanca, **15 huesos** (`codoIzq/codoDer`, `colaMedia`), pesos de piel con escudo axilar y color por vértice (Worker y Node) | 636 |
| `js/12-nailong3d-escena.js` | 16 · Escena 3D (carga diferida por `js/14`, W25): `SkinnedMesh`, `crearCaraDeformable` y `crearBoca` re-anclados al hocico adelantado, ojos «lente» (3D13: `marcoOjo` descompone la cizalla en giro · escala · giro para el `.glb`; párpados, brillo y mirada giran dentro de `Nailong_ojoInterno`) con AO de párpado en un programa compartido por los dos ojos (3D16), garras adjuntas a `codoIzq/codoDer`, frustum de sombra ampliado (sin sombra en tiempo real en calidad «baja», 3D14) y shader *mochi* | 1.269 |
| `js/13-nailong3d-animacion.js` | 17 · Animación 3D (carga diferida por `js/14`, W25): muelles, canales de codo (`cIX..cDZ`), cola en 3 huesos desfasados, 5 acciones, 6 caritas de la serie, reacciones y horneado GLB determinista (63 tracks/clip) | 896 |
| `js/14-nailong3d-visor.js` | 18 · Visor 3D (en `index.html`, se autoinicia **apagado**, D-26): al pulsar «Ver a Nailong en 3D» carga en orden `js/11` → `js/12` → `js/13` (W25) y Three.js r147 (SRI); `apagar()` («Ocultar») libera la GPU; bucle con ~30 fps en reposo en calidad «baja» (`enReposo`, 3D14), malla en IndexedDB (`obtenerMallas`, 3D15), *shaders* preparados al encender (`precompilarEstilos`, 3D16), cámara, regiones táctiles (incl. codos y `colaMedia`), foto PNG, **sticker 512×512 WebP con EXIF WhatsApp (`3D3`)**, GLB con 11 clips y **panel flotante `?3d=debug` (`3D5`)** | 1.377 |

Reglas: son **scripts clásicos** que comparten el ámbito global (sin `import`/`export`), así que el **orden de carga importa** y es el de la tabla. `js/01`–`js/10` y `js/14` se declaran en `index.html`; `js/11`–`js/13` los carga `js/14` dinámicamente en orden estricto cuando el usuario enciende el 3D (`W25`, D-26). Al añadir un fichero, regístralo en `index.html` (o en el cargador de `js/14`); `verify_all.py` falla si hay un `.js`/`.css` sin cargar o una referencia rota.

## Bloques funcionales

El código está estructurado en 12 bloques funcionales visibles:

1. **Configuración y Estilos:**
   - Tailwind CSS CDN fijado + paleta personalizada con contraste WCAG AA verificado (W23) y fuentes con métricas de respaldo anti-CLS (W28).
   - Estilos Claymorphism blandos (`.clay-card`, `.clay-btn`) y animaciones elásticas Duang.
   - Reglas para pantalla completa del minijuego (`#game-container:fullscreen`, `.minigame-fullscreen-active`) y pausa de partículas (`body.particles-paused`, W21).

2. **Cabecera Flotante ("Nube de Leche"):**
   - Logotipo con el sticker animado 3D de sonrisa radiante (copia de 192 px de `sticker_2.webp`, `Stickers Nailong/mini/dragon-de-leche.webp`, W33; `decoding="async" fetchpriority="low"`, W24) llenando el círculo mediante zoom calibrado (`scale-110 object-center`).
   - Enlaces de escritorio en línea desde `xl` (1.280 px) y barra hasta `88rem`; entre 1.024 y 1.279 px se usa el menú ☰ porque los 10 enlaces no caben (W31, sustituye al compactado de W10). Por debajo de 360 px se oculta el texto «Nailong» del logo para que quepa el ☰.
   - Botón discreto para pausar/reanudar las partículas flotantes (`#particles-toggle-btn`, sincronizado con `#mobile-menu`, W21).
   - Botón de compartir con amigos (modal con enlace y código QR), silencio de audio global, Modo Fiesta y menú móvil desplegable.

3. **Hero Interactivo & Contador Duang:**
   - Pancita interactiva con contador reactivo (`#belly-counter` en contraste AA), imagen principal precargada (`fetchpriority="high"`, W24), reserva de espacio anti-CLS (W28) y alternancia dinámica de estados de ánimo.

4. **Muñeco Acompañante Flotante:**
   - Widget flotante en la esquina inferior con diálogos contextuales controlados por `requestAnimationFrame` según la sección visible en viewport (`COMPANION_SECTION_PHRASES` con `getBoundingClientRect().top`, mejora W9, incluida la frase de `#nailong-3d`).

5. **Visor Mágico de Animaciones:**
   - Tira horizontal de 9 escenas dentro de la sección «Stickers» (`#galeria`, ancla `#muro-gifs`), justo debajo del banner de la app, con botón «¡Sorpréndeme!». `FEATURED_GIFS` solo guarda etiqueta y fondo: título y descripción salen de `ALL_STICKERS` (VM2). El lightbox del álbum ofrece «Abrir en el Visor Mágico» en **todos** los cromos animados (`esStickerAnimado`).
   - Modal `<dialog>` con `autofocus` en cerrar (W22), gestos táctiles de deslizamiento (salvo sobre `#visor-controles`, `data-no-swipe`) y pegatinas arrastrables.
   - **«Crea tu sticker» (VM3, 4.3.0):** panel `<details id="visor-creador">`: tramo (`marcarTramoCreador`; el reproductor solo repite ese trozo, `limitesVisor`), texto tipo meme dibujado en el lienzo (`dibujarTextoMeme`) y emojis del escenario (`emojisDelEscenario`). `crearStickerVisor` recompone a 512 px, codifica cada fotograma con `canvas.toBlob('image/webp')` y monta un WebP animado con EXIF de WhatsApp (`montarWebPAnimado`, `exifWhatsAppCreador`) con los límites de `normalizar_stickers.py` (≤ 500 KB, ≤ 10 s, ≥ 20 ms; `estimarAjusteCreador` elige calidad y fotogramas con una muestra). Esquinas transparentes para forzar `ALPH`. Sin WebP (Safari): PNG fijo (`crearImagenFijaCreador`). El resultado se comparte con `openStickerOptionsModal`.
   - **Reproductor propio (VM1, 4.3.0):** lee el RIFF del `.webp`, separa los fotogramas `ANMF`, los decodifica con `createImageBitmap` a tamaño de pantalla (reserva `<img>`; sin `ImageDecoder`) y los compone en `#modal-player-canvas` respetando desplazamiento, fusión y borrado. Velocidad real 0,25×–3× (`VISOR_VELOCIDADES`), pausa, fotograma a fotograma, al revés, bumerán y barra `#visor-barra`. Tope de memoria 48 MB (32 MB en móviles); `soltarVisor` libera todo al cerrar o cambiar de cromo. Con `prefers-reduced-motion` arranca en pausa.

6. **Gran Álbum Polaroid de Cromos:**
   - Cromos reales categorizados con visor ampliado (Lightbox), paginados con el botón «Ver más cromos» y cuadrícula de 2 columnas en móvil.
   - Sección especial del creador de la web con Nailong (`#creador`).
   - Subida de fotos del usuario con compresión en canvas y guardado persistente en `localStorage`.

7. **Botonera de Sonidos (Soundboard):**
   - 12 botones en 3 grupos de 4 (voces, risas y llantos, efectos), **cada uno con su propio sonido** sintetizado (B1, 4.3.0). Cada botón apunta a su cromo por clave (`stickerPorClave`) y muestra su título de `ALL_STICKERS`; el nombre corto y el icono describen el sonido.
   - Sonidos en `js/01` (`SONIDOS_BOTONERA`: grito, bostezo, nyah, ronquido, carcajada, llanto, puchero, palmas y crujido; más `laugh`, `fanfare` y `run` de `playSound`). Cada uno es una función `(contexto, instante, destino)` que también se puede renderizar sin altavoces con `OfflineAudioContext` para medir su volumen. Las ganancias nacen a 0,0001 para que no salte un clic.

8. **Laboratorio de Superpoderes:**
   - Ajuste de tamaño por control deslizante (`#power-size-slider` con área táctil ≥ 28 px, W30).
   - Modo Camaleón con selector de color y ciclo arcoíris.
   - Lanzamiento de llamaradas con física de partículas en canvas.

9. **Minijuego: "¡La Gran Comilona de Nailong!":**
   - Canvas interactivo de 60 FPS con reloj de 30 segundos, generación de alimentos y bombas de Bombloong.
   - **Desplazador lineal rápido:** movimiento arcade constante con soporte para ratón, teclado (`ArrowLeft`/`ArrowRight`/`A`/`D`) y controles táctiles en pantalla completa.

10. **Modo Fiesta Duang-Duang:**
    - Renderizado GPU a 60 FPS sobre `#party-canvas` (oculto `display: none` mientras no hay confeti activo) con sprites de emojis pre-rasterizados.

11. **Compartir & Conectividad Social:**
    - Modal `<dialog>` con `autofocus` en cerrar (W22), código QR fijo en SVG hacia la página principal (W34) y enlace en vivo a GitHub Pages.

12. **Nailong 3D (sección `#nailong-3d`, entre «¿Quién es?» y «Stickers»):**
    - **Apagado por defecto (D-26):** el visor muestra «Nailong 3D duerme en su huevo» y no descarga nada hasta pulsar «🐣 Ver a Nailong en 3D» (o cualquier botón del panel); entonces carga `js/11`–`js/13` (W25) + Three.js r147 (SRI). «Ocultar» (`apagar()`) para el bucle y suelta el contexto WebGL. `?3d=1` y `?3d=debug` lo encienden al cargar (herramientas); `#nailong-3d` solo lleva a la sección. Encendido, se pausa fuera de pantalla (`IntersectionObserver`).
    - Modelo procedural 21/21 OK fiel a la serie (15 huesos, codos, cola en 3 tramos, cabeza en judía inclinada y silueta frontal en campana, 3D12), cámara orbital, 5 acciones, 6 caritas, estilo sticker/dibujo, foto PNG, **sticker 512×512 WebP (`3D3`)**, descarga `.glb` (11 clips / 63 tracks) y **panel `?3d=debug` (`3D5`)**. Detalle en `05_nailong_3d.md`.

## Anclas y puntos de entrada clave

| Qué | Fichero · símbolo |
|---|---|
| Datos de los cromos | `js/02-datos-stickers.js` · `ALL_STICKERS`, `stickerPorClave`, `rutaSticker` (revisión de textos con fotogramas: `notas_tecnicas/07_revision_textos_stickers.md` y `herramientas/revision_stickers.py`) |
| Pausa de partículas de fondo (W21) | `index.html` · `#particles-toggle-btn`; `css/styles.css` · `body.particles-paused`; `js/03-hero.js` / `js/10-inicio.js` |
| Fotos del usuario (datos no fiables) | `js/06-album-y-descargas.js` · `escaparHtml`, `esFotoGuardadaValida` |
| Álbum paginado | `js/06-album-y-descargas.js` · `renderPolaroidGallery`, `GALLERY_PAGE_SIZE`, `GALLERY_STEP`, `showMoreGallery` |
| Muro/tira de escenas y Visor Mágico | `js/05-visor-magico.js` y `js/06-…` · `renderGifWall`, `stickerDeEscena`, `abrirVisorConSticker`, `sorprendeme`, `openVisorFromLightbox`; reproductor: `leerWebPAnimado`, `componerFotogramas`, `cargarEnReproductor`, `soltarVisor`, `teclaVisor` (atajos K/espacio, «,» y «.») |
| Descarga y compartir stickers | `js/06-album-y-descargas.js` · `forceDownloadSticker`, `shareStickerDirectToWhatsApp`, `copyStickerToClipboard`, `#sticker-options-modal` |
| Audio | `js/01-audio.js`, `js/07-…` · `renderSoundboard`, `audioCtx` (osciladores Web Audio), `SONIDOS_BOTONERA`, `vozDibujo`, `rafagaRuido` |
| Minijuego | `js/08-minijuego.js` · `#food-game-canvas`, `resizeGameCanvas`, `getEmojiSprite` |
| Modo Fiesta | `js/09-modo-fiesta.js` · `#party-canvas` |
| Modales (`<dialog>` nativo, D-23, W22) y bloqueo de scroll | `js/05-visor-magico.js` · `abrirDialogo`, `cerrarDialogo`; `js/09-modo-fiesta.js` · `setupModalBackdrops`; `js/10-inicio.js` · `setupModalScrollLock`, `body.modal-open` |
| Arranque diferido (W27) | `js/10-inicio.js` · `window.onload`, `diferirArranque` |
| Cabecera de escritorio (W31) | `index.html` · `#desktop-nav-links` (`xl:flex`), `#mobile-menu-btn` / `#mobile-menu` (`xl:hidden`), `#party-mode-btn` |
| Barra de accesos inferior (móvil, `< lg`) | `index.html` · `#bottom-nav` (`data-secciones`); `css/styles.css` · `.bottom-nav-item`; `js/10-inicio.js` · `setupScrollSpy`; `js/04-navegacion.js` · `openMobileMenuFromBottom` |
| Tráiler plegable | `index.html` · `<details id="video-promo-section">` (bloque propio debajo del banner de la app, tras el separador «Y además», borde cielo; DA1); `js/10-inicio.js` · `abrirTrailer`, `setupTrailerFold`, `elegirFormatoTrailer` (V1: horizontal 16:9 en pantallas anchas con `TRAILER_CONSULTA_HORIZONTAL`, vertical en móvil; pone `src`, portada, miniatura y tamaño del lienzo ambiental); `css/styles.css` · `.trailer-horizontal` |
| Demo animada de la app en el banner (DA1) | `index.html` · `#apk-demo`, `#apk-demo-video`, `#apk-demo-btn`, botón «Ver la demo» `#apk-demo-ver` (solo móvil; sustituye al antiguo «Tráiler» del banner); `css/styles.css` · `.apk-demo-movil` / `.apk-demo-pantalla` (hueco 9:20); `js/10-inicio.js` · `setupAppDemo`, `APP_DEMO_SOLO_AL_TOCAR` (sola y sin sonido mientras se ve en el ordenador; al tocarla en el móvil y con «reducir movimiento»); vídeo `video-promo/nailong_app_demo.mp4` + portada, fuentes de HyperFrames en `video-promo/app-demo/` |
| Pestañas del laboratorio | `index.html` · `.lab-tab` / `.lab-panel`; `js/07-sonidos-y-laboratorio.js` · `mostrarPestanaLab` |
| Carruseles de móvil | `css/styles.css` · `.carrusel-movil` («¿Quién es?»), `.carrusel-chips` (acciones 3D) |
| Copias reducidas de stickers (W33) | `Stickers Nailong/mini/<clave>.webp` (+ `favicon.webp`), generadas y comprobadas por `herramientas/miniaturas_web.py` (test 53); `mini/bombloong.webp` es un recorte fijo de su cromo (`RECORTES`, T2) |
| Iconos SVG (W32) | `css/styles.css` · bloque `ICONOS-INICIO`/`ICONOS-FIN` (clases `fa-*`), generado por `herramientas/iconos_svg.py` (test 54) |
| QR fijos (W34) | `index.html` · `#apk-qr-img`, `#share-qr-code` (`data-qr-url`), generados por `herramientas/generar_qr.py --html` (tests 22 y 48) |
| Rendimiento 3D (3D14–3D16) | `js/14` · `decidirCalidad` (`?calidad=`), `enReposo`/`marcarActividad`, `obtenerMallas`, `precompilarEstilos`; `js/12` · `crearEstudio` (`conSombra`), `inyectarOjoAO` (test 55) |
| Nailong 3D (apagado por defecto D-26, carga diferida W25, sticker 3D3, `?3d=debug`, cara 3D12, ojos 3D13) | `js/11`…`js/14` · `Nailong3DGeometria` (`perfilCabeza`, `escalaCabezaX`, `OJO`, `VENTANA`), `marcoOjo` en `js/12`, `Nailong3DEscena`, `Nailong3DAnimacion`, `Nailong3DVisor` (`arrancar`, `apagar`, `#nailong-3d-sticker`, `exportarStickerWebP`, `montarPanelDebug`) |

> Esta tabla se ha construido con los nombres que `verify_all.py` ya comprueba; el número de línea no se fija porque cambia con cada edición.
