# Mapa de código de la web (`index.html`, `css/`, `js/`)

> **Propósito:** saltar directamente al fichero correcto sin búsquedas ciegas. Desde D-15 (2026-10-31) el antiguo `index.html` de ≈3.800 líneas está dividido en marcado + CSS + ficheros JS numerados (10 originales y, desde la sesión del 2026-11-04, 4 más del visor 3D, D-21). Trasladado desde `CLAUDE.md`/`GEMINI.md` el 2026-10-31 (D-14).
> **Mantenimiento:** si cambia la estructura de `index.html`, actualiza este mapa en la misma sesión. Para localizar una función: `grep -n "function nombre" js/*.js`.

## Qué vive en cada fichero

| Fichero | Contenido (bloques de la lista de abajo) | Líneas aprox. |
|---|---|---|
| `index.html` | Marcado de todas las secciones; carga `css/` y `js/` (con `?v=` anti-caché) | 1.276 |
| `css/styles.css` | Estilos propios: variables, Claymorphism, animaciones, pantalla completa del minijuego y del visor 3D (`.n3d-*`) | 561 |
| `js/tailwind-config.js` | Paleta y fuentes de Tailwind (se carga justo tras el CDN) | 27 |
| `js/01-audio.js` | 1 · Web Audio (síntesis, desbloqueo en iOS) | 242 |
| `js/02-datos-stickers.js` | 2 · `ALL_STICKERS` (catálogo de cromos; `clave` estable en los usados fuera del álbum) y `aplicarStickersFijos()` (resuelve `data-sticker`, D-22) | 143 |
| `js/03-hero.js` | 3 · Hero, contador Duang y estados de ánimo | 107 |
| `js/04-navegacion.js` | 4 · Navegación móvil y muñeco acompañante (`COMPANION_SECTION_PHRASES`, W9) | 131 |
| `js/05-visor-magico.js` | 5–6 · Tira de escenas y Visor Mágico | 279 |
| `js/06-album-y-descargas.js` | 7–7B · Álbum polaroid, lightbox, descarga/WhatsApp/portapapeles | 616 |
| `js/07-sonidos-y-laboratorio.js` | 8–9 · Botonera de sonidos y Laboratorio de superpoderes | 261 |
| `js/08-minijuego.js` | 10 · Minijuego «La Gran Comilona» | 463 |
| `js/09-modo-fiesta.js` | 11 · Modo Fiesta (confeti en canvas) | 319 |
| `js/10-inicio.js` | 14 · Inicialización, scrollspy, bloqueo de scroll, banner de la app (`version.json`, «Copiar enlace» + tarjeta QR `#apk-qr-box` en escritorio) y `window.onload` | 261 |
| `js/11-nailong3d-geometria.js` | 15 · Núcleo 3D sin dependencias (`VERSION: 3`): `ANATOMIA` serie CGI, SDF, Surface Nets, pesos de piel y color por vértice (también en Worker y Node) | 499 |
| `js/12-nailong3d-escena.js` | 16 · Escena 3D: `SkinnedMesh`, `crearCaraDeformable` (cejas/pómulos/mandíbula), cavidad bucal 3D con doble herradura dental y lengua, ojos con AO de párpado y shader *mochi* | 1.218 |
| `js/13-nailong3d-animacion.js` | 17 · Animación 3D: muelles, reposo tierno, 5 acciones, 6 caritas de la serie (`sonrison`, `carcajada`, `burla`, `puchero`, `pillo`, `susto`), reacciones y horneado GLB | 857 |
| `js/14-nailong3d-visor.js` | 18 · Visor 3D: carga perezosa de Three.js r147 (SRI), bucle, cámara, toques, chips de acciones y caritas, foto PNG y GLB con 11 clips; se autoinicia | 665 |

Reglas: son **scripts clásicos** que comparten el ámbito global (sin `import`/`export`), así que el **orden de carga importa** y es el de la tabla. Al añadir un fichero, regístralo en `index.html`; `verify_all.py` falla si hay un `.js`/`.css` sin cargar o una referencia rota.

## Bloques funcionales

El código está estructurado en 14 bloques funcionales organizados:

1. **Configuración y Estilos:**
   - Tailwind CSS CDN + paleta personalizada (`nailong-yellow`, `nailong-orange`, `nailong-belly`, etc.).
   - Estilos Claymorphism blandos (`.clay-card`, `.clay-btn`) y animaciones elásticas Duang.
   - Reglas para pantalla completa del minijuego (`#game-container:fullscreen`, `.minigame-fullscreen-active`).

2. **Cabecera Flotante ("Nube de Leche"):**
   - Logotipo con el sticker animado 3D de sonrisa radiante (`sticker_2.webp`) llenando el círculo mediante zoom calibrado (`scale-110 object-center`).
   - Enlaces de escritorio compactados desde `lg` (1024 px, mejora W10), incluido `🧊 3D` visible para todos desde `v4.0.0`.
   - Botón de compartir con amigos (modal con enlace y código QR).
   - Botón de silenciar audio global.
   - Botón de Modo Fiesta para activar lluvia de confeti.
   - Menú móvil desplegable.

3. **Hero Interactivo & Contador Duang:**
   - Pancita interactiva con contador reactivo, generación de burbujas flotantes y alternancia dinámica de estados de ánimo.

4. **Muñeco Acompañante Flotante:**
   - Widget flotante en la esquina inferior con diálogos contextuales controlados por `requestAnimationFrame` según la sección visible en viewport (`COMPANION_SECTION_PHRASES` con `getBoundingClientRect().top`, mejora W9, incluida la frase de `#nailong-3d`).

5. **Visor Mágico de Animaciones:**
   - Tira horizontal de 9 escenas GIF virales dentro de la sección «Stickers» (`#galeria`, ancla `#muro-gifs`), justo debajo del banner de la app; el lightbox del álbum ofrece «Abrir en el Visor Mágico» para esas escenas.
   - Modal con control de velocidad (0.5x, 1x, 1.5x), gestos táctiles de deslizamiento (swipe horizontal) y pegatinas arrastrables.

6. **Gran Álbum Polaroid de Cromos:**
   - Cromos reales categorizados con visor ampliado (Lightbox), paginados con el botón «Ver más cromos» y cuadrícula de 2 columnas en móvil.
   - Sección especial del creador de la web con Nailong (`#creador`).
   - Subida de fotos del usuario con compresión en canvas y guardado persistente en `localStorage`.

7. **Botonera de Sonidos (Soundboard):**
   - 12 casillas con efectos de audio sintetizados en tiempo real mediante osciladores.

8. **Laboratorio de Superpoderes:**
   - Ajuste de tamaño por control deslizante.
   - Modo Camaleón con selector de color y ciclo arcoíris.
   - Lanzamiento de llamaradas con física de partículas en canvas.

9. **Minijuego: "¡La Gran Comilona de Nailong!":**
   - Canvas interactivo de 60 FPS con reloj de 30 segundos, generación de alimentos y bombas de Bombloong.
   - **Desplazador lineal rápido:** El personaje se mueve a velocidad constante lineal (16px a 21px por frame) para un control arcade ágil sin demoras ni inercias lentas.
   - **Pantalla completa fluida:** Doble botón (en barra de controles y botón flotante en canvas) compatible con Fullscreen API nativa y fallback CSS (`.minigame-fullscreen-active`), compatible con tecla `Escape`.
   - Compatibilidad completa con ratón, teclado (`ArrowLeft`/`ArrowRight`/`A`/`D`) y toques táctiles.

10. **Modo Fiesta Duang-Duang:**
    - Renderizado GPU a 60 FPS sobre un canvas de pantalla completa (`#party-canvas`) sin restricciones de contención CSS (`contain: none`). El canvas permanece oculto (`display: none`, 1×1 px) mientras no hay confeti activo y solo se dimensiona al lanzar la fiesta.
    - Sprites de emojis pre-rasterizados en lienzos offscreen con cascada tipográfica (`Segoe UI Emoji`, `Apple Color Emoji`, `Noto Color Emoji`) para visualización universal a color.

11. **Compartir & Conectividad Social:**
    - Modal con código QR generado en tiempo real y enlace en vivo a GitHub Pages.

12. **Nailong 3D (sección `#nailong-3d`, entre «¿Quién es?» y «Stickers», publicada en v4.0.0):**
    - Visible para todos por defecto (`n3d-ver`), con carga perezosa a 600 px (`IntersectionObserver`), pausa fuera de pantalla y arranque inmediato con `?3d=1`/`#nailong-3d`.
    - Modelo procedural fiel a los stickers, cámara orbital, reacciones por zona, acciones, estilo sticker/dibujo, foto PNG y descarga `.glb`. Detalle en `05_nailong_3d.md`.

## Anclas y puntos de entrada clave

| Qué | Fichero · símbolo |
|---|---|
| Datos de los cromos | `js/02-datos-stickers.js` · `ALL_STICKERS` (revisar textos: `herramientas/hojas_contacto.py`) |
| Fotos del usuario (datos no fiables) | `js/06-album-y-descargas.js` · `escaparHtml`, `esFotoGuardadaValida` |
| Álbum paginado | `js/06-album-y-descargas.js` · `renderPolaroidGallery`, `GALLERY_PAGE_SIZE`, `GALLERY_STEP`, `showMoreGallery` |
| Muro/tira de escenas y Visor Mágico | `js/05-visor-magico.js` y `js/06-…` · `renderGifWall`, `featuredGifIndexOf`, `openVisorFromLightbox` |
| Descarga y compartir stickers | `js/06-album-y-descargas.js` · `forceDownloadSticker`, `shareStickerDirectToWhatsApp`, `copyStickerToClipboard`, `#sticker-options-modal` |
| Audio | `js/01-audio.js`, `js/07-…` · `renderSoundboard`, `audioCtx` (osciladores Web Audio) |
| Minijuego | `js/08-minijuego.js` · `#food-game-canvas`, `resizeGameCanvas`, `getEmojiSprite` |
| Modo Fiesta | `js/09-modo-fiesta.js` · `#party-canvas` |
| Modales (`<dialog>` nativo, D-23) y bloqueo de scroll | `js/05-visor-magico.js` · `abrirDialogo`, `cerrarDialogo`; `js/09-modo-fiesta.js` · `setupModalBackdrops` (clic fuera y evento `cancel`); `js/10-inicio.js` · `setupModalScrollLock`, `body.modal-open` |
| Arranque | `js/10-inicio.js` · `window.onload = function()` |
| Barra de accesos inferior (móvil, `< lg`) | `index.html` · `#bottom-nav` (`data-secciones`); `css/styles.css` · `.bottom-nav-item`; `js/10-inicio.js` · `setupScrollSpy` (marca la zona activa); `js/04-navegacion.js` · `openMobileMenuFromBottom` |
| Tráiler plegable | `index.html` · `<details id="video-promo-section">`; `js/10-inicio.js` · `abrirTrailer`, `setupTrailerFold` |
| Pestañas del laboratorio | `index.html` · `.lab-tab` / `.lab-panel`; `js/07-sonidos-y-laboratorio.js` · `mostrarPestanaLab` |
| Carruseles de móvil | `css/styles.css` · `.carrusel-movil` («¿Quién es?»), `.carrusel-chips` (acciones 3D) |
| Nailong 3D | `js/11`…`js/14` · `Nailong3DGeometria`, `Nailong3DEscena`, `Nailong3DAnimacion`, `Nailong3DVisor` (autoinicio con `DOMContentLoaded`) |

> Esta tabla se ha construido con los nombres que `verify_all.py` ya comprueba; el número de línea no se fija porque cambia con cada edición.
