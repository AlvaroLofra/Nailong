# Mapa de código de la web (`index.html`, `css/`, `js/`)

> **Propósito:** saltar directamente al fichero correcto sin búsquedas ciegas. Desde D-15 (2026-10-31) el antiguo `index.html` de ≈3.800 líneas está dividido en marcado + CSS + 10 ficheros JS. Trasladado desde `CLAUDE.md`/`GEMINI.md` el 2026-10-31 (D-14).
> **Mantenimiento:** si cambia la estructura de `index.html`, actualiza este mapa en la misma sesión. Para localizar una función: `grep -n "function nombre" js/*.js`.

## Bloques funcionales

## Qué vive en cada fichero

| Fichero | Contenido (bloques de la lista de abajo) | Líneas aprox. |
|---|---|---|
| `index.html` | Marcado de todas las secciones; carga `css/` y `js/` (con `?v=` anti-caché) | 1.060 |
| `css/styles.css` | Estilos propios: variables, Claymorphism, animaciones, pantalla completa del minijuego | 370 |
| `js/tailwind-config.js` | Paleta y fuentes de Tailwind (se carga justo tras el CDN) | 27 |
| `js/01-audio.js` | 1 · Web Audio (síntesis, desbloqueo en iOS) | 170 |
| `js/02-datos-stickers.js` | 2 · `ALL_STICKERS` (82 cromos) y datos | 90 |
| `js/03-hero.js` | 3 · Hero, contador Duang y estados de ánimo | 110 |
| `js/04-navegacion.js` | 4 · Navegación móvil y muñeco acompañante | 110 |
| `js/05-visor-magico.js` | 5–6 · Tira de escenas y Visor Mágico | 265 |
| `js/06-album-y-descargas.js` | 7–7B · Álbum polaroid, lightbox, descarga/WhatsApp/portapapeles | 600 |
| `js/07-sonidos-y-laboratorio.js` | 8–9 · Botonera de sonidos y Laboratorio de superpoderes | 145 |
| `js/08-minijuego.js` | 10 · Minijuego «La Gran Comilona» | 435 |
| `js/09-modo-fiesta.js` | 11 · Modo Fiesta (confeti en canvas) | 310 |
| `js/10-inicio.js` | 14 · Inicialización, scrollspy, bloqueo de scroll y `window.onload` | 95 |

Reglas: son **scripts clásicos** que comparten el ámbito global (sin `import`/`export`), así que el **orden de carga importa** y es el de la tabla. Al añadir un fichero, regístralo en `index.html`; `verify_all.py` falla si hay un `.js`/`.css` sin cargar o una referencia rota.

## Bloques funcionales

El código está estructurado en 14 bloques funcionales organizados:

1. **Configuración y Estilos:**
   - Tailwind CSS CDN + paleta personalizada (`nailong-yellow`, `nailong-orange`, `nailong-belly`, etc.).
   - Estilos Claymorphism blandos (`.clay-card`, `.clay-btn`) y animaciones elásticas Duang.
   - Reglas para pantalla completa del minijuego (`#game-container:fullscreen`, `.minigame-fullscreen-active`).

2. **Cabecera Flotante ("Nube de Leche"):**
   - Logotipo con el sticker animado 3D de sonrisa radiante (`sticker_2.webp`) llenando el círculo mediante zoom calibrado (`scale-110 object-center`).
   - Botón de compartir con amigos (modal con enlace y código QR).
   - Botón de silenciar audio global.
   - Botón de Modo Fiesta para activar lluvia de confeti.
   - Menú móvil desplegable.

3. **Hero Interactivo & Contador Duang:**
   - Pancita interactiva con contador reactivo, generación de burbujas flotantes y alternancia dinámica de estados de ánimo.

4. **Muñeco Acompañante Flotante:**
   - Widget flotante en la esquina inferior con diálogos contextuales controlados por `requestAnimationFrame` según la posición del scroll.

5. **Visor Mágico de Animaciones:**
   - Tira horizontal de 9 escenas GIF virales dentro de la sección «Stickers» (`#galeria`, ancla `#muro-gifs`), justo debajo del banner de la app; el lightbox del álbum ofrece «Abrir en el Visor Mágico» para esas escenas.
   - Modal con control de velocidad (0.5x, 1x, 1.5x), gestos táctiles de deslizamiento (swipe horizontal) y pegatinas arrastrables.

6. **Gran Álbum Polaroid de Cromos:**
   - 82 cromos reales categorizados con visor ampliado (Lightbox), paginados con el botón «Ver más cromos» y cuadrícula de 2 columnas en móvil.
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

## Anclas y puntos de entrada clave

| Qué | Fichero · símbolo |
|---|---|
| Datos de los 82 cromos | `js/02-datos-stickers.js` · `ALL_STICKERS` |
| Álbum paginado | `js/06-album-y-descargas.js` · `renderPolaroidGallery`, `GALLERY_PAGE_SIZE`, `GALLERY_STEP`, `showMoreGallery` |
| Muro/tira de escenas y Visor Mágico | `js/05-visor-magico.js` y `js/06-…` · `renderGifWall`, `featuredGifIndexOf`, `openVisorFromLightbox` |
| Descarga y compartir stickers | `js/06-album-y-descargas.js` · `forceDownloadSticker`, `shareStickerDirectToWhatsApp`, `copyStickerToClipboard`, `#sticker-options-modal` |
| Audio | `js/01-audio.js`, `js/07-…` · `renderSoundboard`, `audioCtx` (osciladores Web Audio) |
| Minijuego | `js/08-minijuego.js` · `#food-game-canvas`, `resizeGameCanvas`, `getEmojiSprite` |
| Modo Fiesta | `js/09-modo-fiesta.js` · `#party-canvas` |
| Modales y bloqueo de scroll | `js/10-inicio.js` · `setupModalBackdrops`, `setupModalScrollLock`, `body.modal-open` |
| Arranque | `js/10-inicio.js` · `window.onload = function()` |

> Esta tabla se ha construido con los nombres que `verify_all.py` ya comprueba; el número de línea no se fija porque cambia con cada edición.
