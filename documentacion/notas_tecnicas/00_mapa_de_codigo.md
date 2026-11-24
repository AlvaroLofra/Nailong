# Mapa de código de la web (`index.html`, `css/`, `js/`)

> **Propósito:** saltar directamente al fichero correcto sin búsquedas ciegas. Desde D-15 (2026-10-31) el antiguo `index.html` de ≈3.800 líneas está dividido en marcado + CSS + ficheros JS numerados (10 originales y, desde la sesión del 2026-11-04, 4 más del visor 3D, D-21). Trasladado desde `CLAUDE.md`/`GEMINI.md` el 2026-10-31 (D-14).
> **Mantenimiento:** si cambia la estructura de `index.html`, actualiza este mapa en la misma sesión. Para localizar una función: `grep -n "function nombre" js/*.js`.

## Qué vive en cada fichero

| Fichero | Contenido (bloques de la lista de abajo) | Líneas aprox. |
|---|---|---|
| `index.html` | Marcado de todas las secciones; carga `css/`, `js/01`–`js/10` y `js/14` (con `?v=` anti-caché; `js/11`–`js/13` se cargan bajo demanda desde `js/14`, mejora W25); botón de pausa de partículas `#particles-toggle-btn` (W21), `autofocus` en los 4 `<dialog>` (W22) y botón `#nailong-3d-sticker` (3D3) | 1.290 |
| `css/styles.css` | Estilos propios: variables, Claymorphism, animaciones, `body.particles-paused` (W21), contraste WCAG AA (W23), reservas de espacio anti-CLS (W28), objetivo táctil del deslizador `#power-size-slider` ≥ 28 px (W30) y estilos `.n3d-*` | 610 |
| `js/tailwind-config.js` | Paleta y fuentes de Tailwind con métricas de respaldo anti-CLS (se carga justo tras el CDN) | 30 |
| `js/01-audio.js` | 1 · Web Audio (síntesis, desbloqueo en iOS) | 242 |
| `js/02-datos-stickers.js` | 2 · `ALL_STICKERS` (catálogo de cromos; `clave` estable en los usados fuera del álbum) y `aplicarStickersFijos()` (resuelve `data-sticker`, D-22) | 143 |
| `js/03-hero.js` | 3 · Hero, contador Duang, estados de ánimo y control de pausa de partículas de fondo (`#particles-toggle-btn`, `sessionStorage`, W21) | 145 |
| `js/04-navegacion.js` | 4 · Navegación móvil y muñeco acompañante (`COMPANION_SECTION_PHRASES`, W9) | 131 |
| `js/05-visor-magico.js` | 5–6 · Tira de escenas y Visor Mágico | 279 |
| `js/06-album-y-descargas.js` | 7–7B · Álbum polaroid, lightbox, descarga/WhatsApp/portapapeles | 616 |
| `js/07-sonidos-y-laboratorio.js` | 8–9 · Botonera de sonidos y Laboratorio de superpoderes | 261 |
| `js/08-minijuego.js` | 10 · Minijuego «La Gran Comilona» | 463 |
| `js/09-modo-fiesta.js` | 11 · Modo Fiesta (confeti en canvas) | 319 |
| `js/10-inicio.js` | 14 · Inicialización escalonada (`diferirArranque` con `requestIdleCallback`, W27), scrollspy, bloqueo de scroll, banner de la app (`version.json`, «Copiar enlace» + QR `#apk-qr-box`) y `window.onload` | 280 |
| `js/11-nailong3d-geometria.js` | 15 · Núcleo 3D sin dependencias (carga diferida por `js/14`, W25): `ANATOMIA` 21/21 OK con `rotX` (judía inclinada), SDF, Surface Nets estanca, **15 huesos** (`codoIzq/codoDer`, `colaMedia`), pesos de piel con escudo axilar y color por vértice (Worker y Node) | 561 |
| `js/12-nailong3d-escena.js` | 16 · Escena 3D (carga diferida por `js/14`, W25): `SkinnedMesh`, `crearCaraDeformable` y `crearBoca` re-anclados al hocico adelantado, ojos con AO de párpado, garras adjuntas a `codoIzq/codoDer`, frustum de sombra ampliado y shader *mochi* | 1.218 |
| `js/13-nailong3d-animacion.js` | 17 · Animación 3D (carga diferida por `js/14`, W25): muelles, canales de codo (`cIX..cDZ`), cola en 3 huesos desfasados, 5 acciones, 6 caritas de la serie, reacciones y horneado GLB determinista (63 tracks/clip) | 896 |
| `js/14-nailong3d-visor.js` | 18 · Visor 3D (en `index.html`, se autoinicia): carga bajo demanda en orden de `js/11` → `js/12` → `js/13` (W25) y Three.js r147 (SRI), bucle, cámara, regiones táctiles (incl. codos y `colaMedia`), foto PNG, **sticker 512×512 WebP con EXIF WhatsApp (`3D3`)**, GLB con 11 clips y **panel flotante `?3d=debug` (`3D5`)** | 1.050 |

Reglas: son **scripts clásicos** que comparten el ámbito global (sin `import`/`export`), así que el **orden de carga importa** y es el de la tabla. `js/01`–`js/10` y `js/14` se declaran en `index.html`; `js/11`–`js/13` los carga `js/14` dinámicamente en orden estricto al acercarse a `#nailong-3d` (`W25`). Al añadir un fichero, regístralo en `index.html` (o en el cargador de `js/14`); `verify_all.py` falla si hay un `.js`/`.css` sin cargar o una referencia rota.

## Bloques funcionales

El código está estructurado en 12 bloques funcionales visibles:

1. **Configuración y Estilos:**
   - Tailwind CSS CDN fijado + paleta personalizada con contraste WCAG AA verificado (W23) y fuentes con métricas de respaldo anti-CLS (W28).
   - Estilos Claymorphism blandos (`.clay-card`, `.clay-btn`) y animaciones elásticas Duang.
   - Reglas para pantalla completa del minijuego (`#game-container:fullscreen`, `.minigame-fullscreen-active`) y pausa de partículas (`body.particles-paused`, W21).

2. **Cabecera Flotante ("Nube de Leche"):**
   - Logotipo con el sticker animado 3D de sonrisa radiante (`sticker_2.webp`, `decoding="async" fetchpriority="low"`, W24) llenando el círculo mediante zoom calibrado (`scale-110 object-center`).
   - Enlaces de escritorio compactados desde `lg` (1024 px, mejora W10), incluido `🧊 3D` visible para todos desde `v4.0.0`.
   - Botón discreto para pausar/reanudar las partículas flotantes (`#particles-toggle-btn`, sincronizado con `#mobile-menu`, W21).
   - Botón de compartir con amigos (modal con enlace y código QR), silencio de audio global, Modo Fiesta y menú móvil desplegable.

3. **Hero Interactivo & Contador Duang:**
   - Pancita interactiva con contador reactivo (`#belly-counter` en contraste AA), imagen principal precargada (`fetchpriority="high"`, W24), reserva de espacio anti-CLS (W28) y alternancia dinámica de estados de ánimo.

4. **Muñeco Acompañante Flotante:**
   - Widget flotante en la esquina inferior con diálogos contextuales controlados por `requestAnimationFrame` según la sección visible en viewport (`COMPANION_SECTION_PHRASES` con `getBoundingClientRect().top`, mejora W9, incluida la frase de `#nailong-3d`).

5. **Visor Mágico de Animaciones:**
   - Tira horizontal de 9 escenas GIF virales dentro de la sección «Stickers» (`#galeria`, ancla `#muro-gifs`), justo debajo del banner de la app; el lightbox del álbum ofrece «Abrir en el Visor Mágico» para esas escenas.
   - Modal `<dialog>` con `autofocus` en cerrar (W22), control de velocidad (0.5x, 1x, 1.5x), gestos táctiles de deslizamiento y pegatinas arrastrables.

6. **Gran Álbum Polaroid de Cromos:**
   - Cromos reales categorizados con visor ampliado (Lightbox), paginados con el botón «Ver más cromos» y cuadrícula de 2 columnas en móvil.
   - Sección especial del creador de la web con Nailong (`#creador`).
   - Subida de fotos del usuario con compresión en canvas y guardado persistente en `localStorage`.

7. **Botonera de Sonidos (Soundboard):**
   - 12 casillas con efectos de audio sintetizados en tiempo real mediante osciladores.

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
    - Modal `<dialog>` con `autofocus` en cerrar (W22), código QR generado en tiempo real y enlace en vivo a GitHub Pages.

12. **Nailong 3D (sección `#nailong-3d`, entre «¿Quién es?» y «Stickers»):**
    - Carga perezosa a 600 px (`IntersectionObserver`): descarga `js/11`–`js/13` bajo demanda (W25) + Three.js r147 (SRI), con arranque inmediato en `?3d=1`, `?3d=debug` o `#nailong-3d`.
    - Modelo procedural 21/21 OK fiel a la serie (15 huesos, codos, cola en 3 tramos, cabeza en judía inclinada), cámara orbital, 5 acciones, 6 caritas, estilo sticker/dibujo, foto PNG, **sticker 512×512 WebP (`3D3`)**, descarga `.glb` (11 clips / 63 tracks) y **panel `?3d=debug` (`3D5`)**. Detalle en `05_nailong_3d.md`.

## Anclas y puntos de entrada clave

| Qué | Fichero · símbolo |
|---|---|
| Datos de los cromos | `js/02-datos-stickers.js` · `ALL_STICKERS` (revisar textos: `herramientas/hojas_contacto.py`) |
| Pausa de partículas de fondo (W21) | `index.html` · `#particles-toggle-btn`; `css/styles.css` · `body.particles-paused`; `js/03-hero.js` / `js/10-inicio.js` |
| Fotos del usuario (datos no fiables) | `js/06-album-y-descargas.js` · `escaparHtml`, `esFotoGuardadaValida` |
| Álbum paginado | `js/06-album-y-descargas.js` · `renderPolaroidGallery`, `GALLERY_PAGE_SIZE`, `GALLERY_STEP`, `showMoreGallery` |
| Muro/tira de escenas y Visor Mágico | `js/05-visor-magico.js` y `js/06-…` · `renderGifWall`, `featuredGifIndexOf`, `openVisorFromLightbox` |
| Descarga y compartir stickers | `js/06-album-y-descargas.js` · `forceDownloadSticker`, `shareStickerDirectToWhatsApp`, `copyStickerToClipboard`, `#sticker-options-modal` |
| Audio | `js/01-audio.js`, `js/07-…` · `renderSoundboard`, `audioCtx` (osciladores Web Audio) |
| Minijuego | `js/08-minijuego.js` · `#food-game-canvas`, `resizeGameCanvas`, `getEmojiSprite` |
| Modo Fiesta | `js/09-modo-fiesta.js` · `#party-canvas` |
| Modales (`<dialog>` nativo, D-23, W22) y bloqueo de scroll | `js/05-visor-magico.js` · `abrirDialogo`, `cerrarDialogo`; `js/09-modo-fiesta.js` · `setupModalBackdrops`; `js/10-inicio.js` · `setupModalScrollLock`, `body.modal-open` |
| Arranque diferido (W27) | `js/10-inicio.js` · `window.onload`, `diferirArranque` |
| Barra de accesos inferior (móvil, `< lg`) | `index.html` · `#bottom-nav` (`data-secciones`); `css/styles.css` · `.bottom-nav-item`; `js/10-inicio.js` · `setupScrollSpy`; `js/04-navegacion.js` · `openMobileMenuFromBottom` |
| Tráiler plegable | `index.html` · `<details id="video-promo-section">`; `js/10-inicio.js` · `abrirTrailer`, `setupTrailerFold` |
| Pestañas del laboratorio | `index.html` · `.lab-tab` / `.lab-panel`; `js/07-sonidos-y-laboratorio.js` · `mostrarPestanaLab` |
| Carruseles de móvil | `css/styles.css` · `.carrusel-movil` («¿Quién es?»), `.carrusel-chips` (acciones 3D) |
| Nailong 3D (carga diferida W25, sticker 3D3, `?3d=debug`) | `js/11`…`js/14` · `Nailong3DGeometria`, `Nailong3DEscena`, `Nailong3DAnimacion`, `Nailong3DVisor` (`#nailong-3d-sticker`, `exportarStickerWebP`, `montarPanelDebug`) |

> Esta tabla se ha construido con los nombres que `verify_all.py` ya comprueba; el número de línea no se fija porque cambia con cada edición.
