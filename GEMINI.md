# Proyecto Nailong (奶龙) - Contexto, Arquitectura e Instrucciones

Este archivo sirve como guía maestra y contexto técnico para agentes inteligentes (Gemini / Claude) y desarrolladores que trabajen en el proyecto **El Mundo Mágico de Nailong (奶龙)**.

- **Repositorio Oficial:** `https://github.com/AlvaroLofra/Nailong.git`
- **Enlace de Producción (GitHub Pages):** [https://alvarolofra.github.io/Nailong/](https://alvarolofra.github.io/Nailong/)
- **Punto de Entrada Definitivo:** `index.html`

---

## 🏛️ 0. Protocolo de Gobernanza y Conexión con la Biblioteca Central

Actúa como asistente senior de desarrollo e ingeniería para este proyecto.

Antes de proponer código, realizar cambios o crear archivos, debes conectarte a la biblioteca central de metodologías, directrices y plantillas que reside en la siguiente ruta absoluta del equipo:

`C:\Users\Administrator\Documents\Claude Code\Documentos, Herramientas e Información General`

Sigue estrictamente este protocolo de inicialización:

### 1. Inspección y Orientación (Lectura en Cascada):
- Lee el índice maestro: `C:\Users\Administrator\Documents\Claude Code\Documentos, Herramientas e Información General\00_INDICE_GENERAL.md`.
- Consulta las directrices de la biblioteca que encajen con el objetivo de esta sesión:
  * Si es arquitectura, metodología o estructura del repo: `GUIA_MAESTRA_DESARROLLO_Y_PROYECTOS.md`.
  * Si es desarrollo de código o uso de LLMs: `ESTRATEGIA_LLM_OPTIMIZACION_TOKENS_Y_SESIONES.md`.
  * Si es interfaz de usuario, diseño web o frontend: `Herramientras UI UX/DESIGN.md` y `CLAUDE.md.snippet`.
  * Si es preparación académica, estudio o defensa oral: `GUIA_PEDAGOGICA_Y_DEFENSA_ACADEMICA.md`.
  * Si requiere vídeo programático con React: consulta las extensiones en `Skills/Remotion/`.
  * Si requiere maquetación o informes formales: `Plantillas y Blueprints/Plantillas Word y PDF/`.

### 2. Regla Estricta de Autorización para Transferencia de Archivos:
- TIENES TERMINANTEMENTE PROHIBIDO copiar, mover o duplicar archivos, plantillas (como `CLAUDE.md`, `DESIGN.md`, plantillas Word/PDF) o carpetas de skills desde la biblioteca central a este proyecto SIN AUTORIZACIÓN EXPRESA DEL USUARIO.
- Si detectas que este proyecto necesita una plantilla o skill concreta, enumérala brevemente y pregunta:
  «He detectado que para este proyecto convendría importar [fichero/plantilla/skill] desde la biblioteca central. ¿Me autorizas a copiarlo a este directorio de trabajo?»
- Espera la respuesta del usuario antes de realizar cualquier copia.

### 3. Reglas Operativas Obligatorias Durante Toda la Sesión:
- **Sesión Quirúrgica:** 1 sesión = 1 tarea acotada. Prohibido hacer búsquedas ciegas (`grep` en todo el disco) si puedes acceder por rutas directas.
- **Comandos Silenciosos:** Ejecuta comprobaciones con flags breves que no inunden el contexto de tokens (ej. `python verify_all.py`, `git status -s`, `pytest -q`).
- **Ground Truth (Cero Invención):** Si un dato, artículo, métrica o versión no se puede verificar en tiempo real contra su fuente primaria, márcalo explícitamente como «no comprobado». Los cálculos matemáticos y de fechas se delegan en código determinista, nunca en el LLM.
- **Definition of Done:** Al terminar la tarea, genera o actualiza el registro de estado actual, documenta las decisiones tomadas (ADR) y haz un resumen conciso de handoff.

### 4. Protocolo de Respuesta Inicial:
- Responde en 3-4 líneas confirmando que has consultado la biblioteca central, resumiendo el estado del proyecto actual según lo que ves y preguntando por qué tarea concreta empezamos hoy (o solicitando autorización si necesitas importar alguna plantilla clave).

---

## 1. Visión General del Proyecto

La aplicación es un sitio web inmersivo, responsivo y de alto rendimiento dedicado a **Nailong (奶龙)**, el dragón de leche amarillo creado por *Seventh Impression*. Ofrece una experiencia interactiva para niños y fans con fotos reales, animaciones en bucle, cromos coleccionables, minijuegos y efectos de sonido en tiempo real.

---

## 2. Principios y Reglas Críticas de Desarrollo

1. **Punto Único de Entrada (`index.html`):**
   - No crear archivos HTML secundarios ni duplicados (como `el_mundo_m_gico_de_nailong.html` o variantes `v1`). Todo vive en `index.html`.
2. **Cero Dependencias de Construcción (Buildless):**
   - La aplicación no utiliza empaquetadores como Webpack, Vite ni frameworks con compilación. Funciona directamente al servirse como archivo estático.
   - Tailwind CSS se carga vía CDN oficial configurado en el `<head>`.
3. **Web Audio Sintetizada:**
   - No añadir archivos de audio pesados (`.mp3`, `.wav`) en el árbol de archivos. Los sonidos se sintetizan algorítmicamente mediante la **Web Audio API** (`audioCtx.createOscillator()`).
4. **Optimización de Recursos Gráficos:**
   - Todas las imágenes y animaciones de stickers están en formato WebP dentro de `Stickers Nailong/`.
   - La colección contiene exactamente 72 cromos numerados (`sticker_1.webp` a `sticker_72.webp`) más las imágenes del creador (`creador_nailong.webp`).
5. **Compatibilidad Móvil Obligatoria:**
   - La interfaz debe funcionar perfectamente en iPhone (Safari iOS con Dynamic Island y barra inferior) y Android (Chrome), respetando `viewport-fit=cover`, safe-area insets y soporte PWA.
6. **Verificación Continua:**
   - Tras cualquier cambio, se DEBE ejecutar la suite de pruebas `python verify_all.py` y comprobar que todos los tests pasen al 100%.

---

## 3. Estructura de Directorios

```text
├── index.html                   # Aplicación web definitiva (SPA autónoma)
├── manifest.json                # Manifiesto para instalación PWA en móviles
├── DOCUMENTACION.md             # Documentación técnica completa de código, ADRs y arquitectura
├── GEMINI.md                    # Guía de contexto, gobernanza y reglas de desarrollo (Gemini)
├── CLAUDE.md                    # Guía de contexto, gobernanza y reglas de desarrollo (Claude)
├── README.md                    # Presentación pública del repositorio
├── verify_all.py                # Suite de pruebas automatizadas (38 comprobaciones)
└── Stickers Nailong/            # Banco de 72 cromos en WebP + foto optimizada del creador
```

---

## 4. Arquitectura y Módulos del Código (`index.html`)

El archivo `index.html` está estructurado en 14 bloques funcionales organizados:

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
   - Galería de 9 escenas GIF virales.
   - Modal con control de velocidad (0.5x, 1x, 1.5x), gestos táctiles de deslizamiento (swipe horizontal) y pegatinas arrastrables.

6. **Gran Álbum Polaroid de Cromos:**
   - 72 cromos reales categorizados con visor ampliado (Lightbox), paginados de 12 en 12 con el botón «Ver más cromos» y cuadrícula de 2 columnas en móvil.
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

---

## 5. Historial de Actualizaciones y Notas del Parche (Changelog en Tiempo Real)

### 📌 Versión 1.0.0 (v1) - Lanzamiento Inicial
- Creación de la web interactiva con temática de Nailong (奶龙).
- Hero interactivo con físicas elásticas, contador de clics y Web Audio API.
- Visor Mágico de animaciones con control de velocidad.
- Álbum polaroid con catálogo de 42 cromos auténticos.
- Botonera musical con 12 sonidos de caricatura.
- Laboratorio interactivo con cambio de tamaño, modo camaleón y llamaradas.
- Minijuego Canvas para atrapar comida.

### 📌 Versión 2.0.0 (v2) - Compartir & Conectividad Social
- Integración de enlace oficial en GitHub Pages (`https://alvarolofra.github.io/Nailong/`).
- Generador dinámico de códigos QR para escaneo instantáneo con móviles.
- Modal de compartir con botón de copia rápida al portapapeles y Web Share API nativa.

### 📌 Versión 3.0.0 (v3) - Limpieza y Consolidación Arquitectónica
- Eliminación de archivos HTML redundantes (`el_mundo_m_gico_de_nailong.html`, `el_mundo_m_gico_de_nailong v1.html`).
- Consolidación de `index.html` como único archivo de producción y despliegue.

### 📌 Versión 4.0.0 (v4) - Sección del Creador, LocalStorage & Mejoras Táctiles
- Incorporación de la sección especial dedicada al creador de la web junto a Nailong (`#creador`) con foto optimizada en formato WebP (`creador_nailong.webp`).
- Persistencia local de fotos del usuario mediante `localStorage` con escalado inteligente para optimizar almacenamiento.
- Soporte para eliminar fotos de usuario guardadas.
- Altura del minijuego ampliada hasta 660px y reducción del 20% en la velocidad de caída de las bombas para mejorar el tiempo de reacción.
- Navegación táctil por deslizamiento (swipe horizontal) en el Visor Mágico y en el Lightbox de fotos.

### 📌 Versión 5.0.0 (v5) - Optimización GPU a 60 FPS del Modo Fiesta
- Reingeniería del motor de confeti mediante pre-renderizado offscreen de texturas de emojis (`getEmojiSprite`).
- Reducción drástica del overhead de cálculo tipográfico por frame, permitiendo renderizado GPU a 60 FPS constantes.

### 📌 Versión 6.0.0 (v6) - Rendimiento de Scroll & Acompañante
- Implementación de throttling con `requestAnimationFrame` en los mensajes contextuales del muñeco flotante al hacer scroll.
- Eliminación de descarga directa de la foto del creador para preservar la experiencia visual integrada.
- Preparación del sistema de movimiento continuo en el minijuego.

### 📌 Versión 7.0.0 (v7) - Estabilidad, Deslizador Lineal Rápido y Pantalla Completa
- **Corrección Crítica del Modo Fiesta:** Solucionado el problema donde al hacer clic en el botón de fiesta no caía nada. La causa raíz era la propiedad CSS `contain: strict;` en `#party-canvas`, que provocaba que el navegador colapsara el rectángulo de renderizado a 0x0 píxeles. Eliminado el confinamiento de tamaño y asegurada la visibilidad en pantalla completa.
- **Corrección Crítica del Minijuego:** Solucionado el fallo donde el minijuego había dejado de funcionar por completo. Se identificó y corrigió un `ReferenceError: keysHeld is not defined` que provocaba un fallo silencioso en el primer fotograma de `gameLoop`.
- **Deslizador Lineal y Rápido:** Sustituida la aceleración progresiva lenta por un movimiento lineal continuo y rápido (16px a 21px por frame) para teclado y botones virtuales táctiles, ofreciendo una respuesta ágil estilo arcade clásico.
- **Modo Pantalla Completa Fluido para el Minijuego:** Añadido botón de pantalla completa en la cabecera de controles y botón flotante en la esquina del juego. Compatible con Fullscreen API nativa y fallback CSS (`.minigame-fullscreen-active`), soporte de tecla `Escape`, transiciones suaves de entrada/salida y redimensionado automático de resolución de dibujado.
- **Avatar de Cabecera con Sonrisa Radiante 3D:** Sustituido el avatar anterior por el GIF animado 3D de sonrisa radiante (`sticker_2.webp`), llenando el círculo completo.
- **Suite de Pruebas Ampliada:** Incrementada de 24 a 28 pruebas automatizadas en `verify_all.py`, verificando la ausencia de regresiones, sintaxis limpia y validación de interacción en navegador.

### 📌 Versión 8.0.0 (v8) - Perfeccionamiento de Pantalla Completa, HUD en Canvas y Encuadre Óptico
- **HUD Integrado de Marcador y Tiempo en Canvas:** Inclusión de una pastilla de puntuación en vivo (`⭐ X pts`) junto a la pastilla de tiempo (`⏱️ Xs`) en la esquina superior del canvas, permitiendo ver los puntos en tiempo real tanto en la vista estándar como en el modo pantalla completa.
- **Controles Táctiles Internos en Pantalla Completa (`#game-touch-dock`):** Integración de botones táctiles virtuales dentro del contenedor del juego (`#game-container`), garantizando que al jugar en pantalla completa en móviles o tablets los controles táctiles permanezcan accesibles.
- **Corrección de Aislamiento en Pantalla Completa CSS:** Eliminada la trampa de contexto de apilamiento provocada por las transformaciones CSS en elementos `.reveal-item.visible` (establecido en `transform: none`), y añadida la clase `has-minigame-fullscreen` en `body` para elevar `#game-container` por encima de cualquier otro elemento de la página.
- **Rescalado Dinámico Proporcional de Coordenadas:** `resizeGameCanvas()` escala matemáticamente la posición horizontal del jugador (`playerX`) y la de todos los alimentos en caída activa según la proporción `newWidth / oldWidth` al entrar/salir de pantalla completa o al cambiar la orientación del dispositivo, evitando que el personaje se desplace fuera del lienzo.
- **Encuadre Óptico del Avatar de Cabecera:** Ajuste fino del recorte circular de `sticker_2.webp` para que llene el círculo completo con `object-cover` sin cortar la parte superior de la frente ni los ojos del personaje durante ninguno de sus 36 fotogramas de animación.

### 📌 Versión 9.0.0 (v9) - Integración de Stickers para WhatsApp, Descarga Universal iOS / Android y Gobernanza Central
- **Botón Directo de WhatsApp en Visor Mágico y Lightbox:** Incorporado botón temático de WhatsApp (`#25D366`) con icono oficial en `#magic-modal` y `#photo-lightbox`. Invoca la Web Share API con el archivo binario WebP puro para enviar el sticker directamente a cualquier chat o a uno mismo, permitiendo añadirlo a "Favoritos ⭐" en el teclado de WhatsApp en 1 toque.
- **Solución Definitiva a la Descarga en iPhone (iOS Safari):** Resuelto el fallo donde en iPhone no se descargaban los stickers al pulsar "Guardar" (provocado por la restricción del motor WebKit de Safari que ignora el atributo `download` en URLs de archivos). Implementado `forceDownloadSticker()` con conversión binaria `Blob` y llamada nativa a `navigator.share()` que activa la opción "Guardar imagen" directamente en el Carrete (Fotos de Apple) o en la app Archivos, con detección ampliada para iPadOS (`MacIntel` + `maxTouchPoints`).
- **Modal Interactivo de Guardado y Opciones (`#sticker-options-modal`):** Menú Claymorphism emergente que se abre al pulsar "Guardar Sticker", ofreciendo: 1) Usar en WhatsApp, 2) Descargar en el Dispositivo (Fotos / Archivos) y 3) Copiar al Portapapeles (con conversión dinámica a PNG en canvas para compatibilidad con la API de portapapeles de iOS y WhatsApp).
- **Notificaciones Toast Flotantes Duang (`#duang-toast`):** Notificación emergente accesible y animada (`showDuangToast`) que informa al instante sobre el estado de la descarga o la guía para añadir a favoritos en WhatsApp.
- **Alineación de Gobernanza con la Biblioteca Central:** Integración formal del protocolo de inicialización en cascada, regla estricta de autorización previa para transferencia de plantillas y reglas de sesiones quirúrgicas en `GEMINI.md`, `CLAUDE.md` y registro ADR en `DOCUMENTACION.md`.
- **Suite de Pruebas Ampliada a 35 Verificaciones:** `verify_all.py` ampliado para validar elementos de WhatsApp, integración de descargas, portapapeles, persistencia y gobernanza documental.

### 📌 Versión 10.0.0 (v10) - Limpieza de Archivos Obsoletos y Verificación de Carga
- **Eliminación de Archivos Obsoletos:** Supresión definitiva de los scripts auxiliares de red local (`compartir_amigos.bat`, `compartir_amigos.py`), la guía previa de hosting (`COMO_HOSTEAR.md`), la imagen residual `stickers_overview.png`, y la fotografía original sin comprimir de 2MB (`Stickers Nailong/Foto nailong yo.jfif`), reemplazada al 100% por la versión optimizada en formato WebP (`creador_nailong.webp`).
- **Verificación de Carga en Navegador:** Validación exhaustiva del ciclo de vida de carga de `index.html` en Chrome headless y servidor HTTP local con 0 errores de consola, 0 excepciones no capturadas y 100% de los elementos visuales renderizados correctamente.
- **Suite de Pruebas Actualizada:** Actualizadas las aserciones de `verify_all.py` para verificar la ausencia de archivos obsoletos y asegurar exactamente 43 elementos en `Stickers Nailong/`.

### 📌 Versión 11.0.0 (v11) - Experiencia de Guardado, Banner WhatsApp, Lightbox Duang y Hero Móvil
- **Modal de Guardado Limpio y Botones Grandes:** Supresión del bloque de texto explicativo sobre restricciones en `#sticker-options-modal`. Previsualización del sticker ampliada a 176x176px y botones de acción (*WhatsApp*, *Descargar* y *Copiar*) con textos e iconos aumentados (`text-base sm:text-lg`, iconos de 48px).
- **Banner Prominente en el Gran Álbum:** Cartel de alto impacto en `#galeria` con icono temático de WhatsApp (`#25D366`) y descarga, comunicando que cualquier sticker puede guardarse o enviarse a WhatsApp con un solo toque.
- **Lightbox del Creador Ampliado con Físicas Duang:** Foto vertical del creador ampliada hasta 500px / 60vh (`max-w-3xl`) y botón `¡Hacer Duang!` reactivo con animación elástica `.animate-duang` y ráfaga de emojis flotantes (`triggerLightboxDuang`).
- **Hero Móvil Inmediato:** Reordenación responsive del Hero en `#inicio` para que el dragón Nailong sea visible de inmediato al entrar en la página en móviles, justo tras la introducción y antes de los estados de ánimo.
- **Suite de Pruebas Ampliada a 36 Comprobaciones:** `verify_all.py` ampliado para validar físicamente el banner de WhatsApp, el rebote Duang en lightbox, la eliminación del texto obsoleto y el nuevo flujo responsive.

### 📌 Versión 12.0.0 (v12) - Rendimiento GPU, Bugs del Álbum, UX Móvil y Accesibilidad
- **Rendimiento (GPU en Chrome/Brave):** `loading="lazy"` y `decoding="async"` en todas las imágenes fuera del primer pantallazo y en las plantillas del muro de GIFs, el álbum y la botonera (`fetchpriority="high"` en el Nailong del Hero). Eliminados los `drop-shadow` del muro de GIFs y del álbum y todos los `backdrop-blur` (navbar, 4 modales, overlay del juego, botón de pantalla completa), que obligaban a recalcular filtros sobre contenido animado en cada fotograma.
- **Álbum paginado:** `renderPolaroidGallery()` pinta 12 cromos (`GALLERY_PAGE_SIZE`) y el botón `#gallery-load-more` (`showMoreGallery()`) añade 12 más; `displayedStickers` conserva la lista completa para que el Lightbox navegue por todos los cromos. Los filtros reinician la paginación.
- **Canvas de fiesta bajo demanda:** `#party-canvas` empieza oculto, se dimensiona y muestra solo al lanzar el confeti y se oculta y reduce a 1×1 al caer la última partícula. Nunca usar `contain: strict` (regresión de v7).
- **Minijuego:** los emojis que caen se dibujan con sprites pre-rasterizados (`getEmojiSprite(emoji, 34)`, precalentados en `startMiniGame()`) en lugar de `fillText` en cada fotograma.
- **Bugs corregidos:** (1) `loadUserPhotosFromStorage()` se invoca ahora en `window.onload`, por lo que las fotos subidas persisten al recargar; (2) botón 🗑️ para borrar fotos propias (con confirmación) y aviso con toast si el almacenamiento está lleno; (3) las fotos de usuario (id de texto) ya no generan clases `undefined` en chincheta e inclinación; (4) contadores de filtros calculados desde los datos (`updateFilterCounts()`), sin cifras fijas erróneas (`43+`, `Creador (5)`); (5) los listeners táctiles de `makeStickerDraggable()` se registran sobre el propio sticker y ya no se acumulan en `window`.
- **UX móvil (mobile-first):** álbum en 2 columnas con tarjeta compacta; filtros del álbum y estados de ánimo del Hero como carrusel horizontal deslizable (reglas CSS sobre `.gallery-filter-btn` / `.mood-btn` para no depender del `className` que reescribe el JS); `#game-touch-dock` oculto por defecto y visible solo en pantalla completa táctil (sin botones duplicados); el bocadillo del compañero flotante desaparece a los 4 s en móvil y la mascota se oculta mientras `#game-container` está en pantalla; scrollspy en la navbar de escritorio (`aria-current`); halo `is-playing` en la botonera; 10 partículas de fondo en móvil en lugar de 18.
- **Accesibilidad:** `@media (prefers-reduced-motion: reduce)`, `role="dialog"` + `aria-modal` + `aria-labelledby` en los 4 modales, `aria-label` en botones de icono y bloqueo del scroll de fondo con un modal abierto (`setupModalScrollLock()`, clase `body.modal-open`).
- **Suite de Pruebas Ampliada a 37 Comprobaciones:** nuevo Test 37 en `verify_all.py` que blinda todo lo anterior, y ventana de búsqueda del avatar del header ampliada de 15.000 a 25.000 caracteres.
- **Decisiones diferidas:** Tailwind sigue cargándose por CDN (proyecto *buildless*), el cromo del creador sigue fuera de `ALL_STICKERS` y no se añade Service Worker.

### 📌 Versión 13.0.0 (v13) - Incorporación de Stickers 43–72, Paginación Progresiva y Corrección del Creador
- **Colección Ampliada a 72 Cromos:** Integración de los 30 nuevos stickers de Nailong (`sticker_43.webp` a `sticker_72.webp`) en `ALL_STICKERS` con títulos en tono infantil, asignación temática de categorías (`caritas`, `bailes`, `comida`, `amigos`), efectos de audio Web Audio y recuento preciso de frames.
- **Renumeración Continua:** Eliminación de huecos en la serie gráfica (antiguos huecos 58, 59 y 63 resueltos mediante reasignación secuencial ascendente hasta 72 stickers + imagen del creador: 73 archivos WebP en total).
- **Recorte sin Pérdidas de Texto Foráneo:** Eliminación del rótulo «GEMESNYA» en `sticker_58.webp` mediante recorte sin pérdidas a 240×202 píxeles conservando íntegro el personaje con sus manos y expresión.
- **Corrección de Centinela del Creador:** Desacoplamiento de la verificación de la foto del creador (`isCreatorItem`), eliminando la regla rígida `item.id === 43` que impedía guardar o compartir por WhatsApp el nuevo cromo #43.
- **Paginación Dinámica Adaptativa:** Incorporación de `GALLERY_STEP` (+24 cromos por clic en escritorio/tablet y +12 en móvil) en el botón «Ver más cromos», optimizando la fluidez de exploración sin sobrecargar el renderizado en terminales móviles.
- **Suite de Pruebas Ampliada:** Incrementada a 38 comprobaciones en `verify_all.py` (validación de stickers 1..72, dimensiones de `sticker_60.webp`, ausencia de saltos o residuales, presencia de `GALLERY_STEP` y desvinculación total de `id === 43`).

### 📌 Versión 14.0.0 (v14) - Stickers Compatibles con WhatsApp y Herramienta de Normalización
- **Causa raíz:** los stickers descargados de TikTok (43–74 originales) eran WebP de 240×240 (o de tamaños arbitrarios) y sin EXIF de WhatsApp, por lo que WhatsApp los recibía como imagen suelta y los animados se rompían. WhatsApp solo reconoce un sticker si es **512×512**, pesa **≤100 KB** (estático) o **≤500 KB** (animado), dura ≤10 s y lleva el EXIF `sticker-pack-id` (los antiguos 1–42 ya cumplían).
- **`normalizar_stickers.py`:** convierte a 512×512 sobre lienzo transparente (sin deformar), inyecta el EXIF de WhatsApp (idéntico byte a byte al de los originales), ajusta calidad/peso (si hace falta quita fotogramas alternos: el Test 39 comprueba que `frames` de `ALL_STICKERS` coincide con el archivo) y avisa de huecos de numeración y posibles duplicados. Uso: `python normalizar_stickers.py` (corrige en sitio), `--check` (solo informa) y `--import CARPETA` (convierte y añade con el siguiente número libre, imprimiendo las líneas esqueleto de `ALL_STICKERS`).
- **Flujo para nuevos stickers de TikTok:** copiarlos a una carpeta temporal fuera de `Stickers Nailong/` → `python normalizar_stickers.py --import CARPETA` → rellenar `title/cat/sound/desc` en `ALL_STICKERS` → actualizar los contadores de cromos → `python verify_all.py`.
- **Limpieza:** eliminados los duplicados 48 (versión recortada del 45) y 53 (fotograma estático del 59 animado); renumeración continua hasta **72 stickers** (+ creador = 73 archivos).
- **Copiar al portapapeles:** limitación del navegador (solo admite PNG): copia una imagen fija. Para enviar como sticker usar el botón de WhatsApp.
- **Suite de Pruebas:** 39 comprobaciones; el Test 39 falla si algún sticker no es 512×512, no lleva EXIF o supera el peso.

---

## 6. Comandos de Verificación y Testing

Antes de realizar cualquier commit o push a la rama `main`, ejecutar siempre:

```bash
python verify_all.py
```

Si se introducen cambios de renderizado visual o interacción en el navegador, se puede validar adicionalmente con Chrome Headless mediante la suite interactiva.
