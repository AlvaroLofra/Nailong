# 📖 Documentación Técnica Completa: ¡El Mundo Mágico de Nailong (奶龙)!

Sitio web interactivo de alto rendimiento para fans del entrañable dragón de leche amarillo **Nailong (奶龙)**, creado por *Seventh Impression*.

- **URL de Producción:** [https://alvarolofra.github.io/Nailong/](https://alvarolofra.github.io/Nailong/)
- **Entrada Definitiva:** `index.html` (Single-Page Application sin dependencias de compilación externa).

---

## 1. Arquitectura General del Proyecto

El proyecto está diseñado bajo una arquitectura de **Single Page Application (SPA) pura y autocontenida**, optimizada para ejecutarse tanto en navegadores de escritorio modernos como en dispositivos móviles (iOS Safari, Android Chrome) con capacidades de **Progressive Web App (PWA)** instalable.

```text
├── index.html                   # Aplicación completa (HTML5, Tailwind CDN, CSS animaciones, JS modular)
├── manifest.json                # Manifiesto PWA para instalación en pantalla de inicio móvil
├── StickersNailong.apk          # Paquete de instalación directa de la App Android nativa (24.6 MB)
├── README.md                    # Descripción general y enlaces públicos
├── DOCUMENTACION.md             # Documentación exhaustiva de código, arquitectura y funcionamiento
├── AGENTS.md                    # Instrucciones canónicas para agentes de IA (CLAUDE.md y GEMINI.md son punteros, D-14)
├── CHANGELOG.md                 # Historial técnico de versiones
├── verify_all.py                # Suite de pruebas automatizadas en Python (44 tests unitarios y estructurales)
└── Stickers Nailong/            # Directorio de recursos gráficos (82 cromos .webp + foto optimizada del creador)
```

---

## 2. Tecnologías y Librerías Utilizadas

1. **HTML5 Semántico:**
   - Estructuración rigurosa por secciones (`header`, `main`, `section`, `footer`).
   - Etiquetas meta avanzadas (`viewport-fit=cover`, `theme-color`, `apple-mobile-web-app-capable`, `og:image`).

2. **Tailwind CSS (v3 CDN) + CSS3 Personalizado:**
   - Paleta de diseño temática:
     - `nailong-yellow`: `#FFD93D` (amarillo piel de Nailong)
     - `nailong-orange`: `#FF9F1C` (naranja mandarina vibrante)
     - `nailong-belly`: `#FFF3B0` (color crema de su pancita)
     - `nailong-cream`: `#FFF9DB` (fondo suave de leche)
     - `nailong-pale`: `#FFFDEB`
   - Efecto visual **Claymorphism** (`.clay-card`, `.clay-btn`): sombreados suaves interiores y exteriores que simulan botones de plastilina o goma blandita.
   - Físicas CSS elásticas mediante curvas `cubic-bezier(0.25, 1, 0.5, 1)`.

3. **Web Audio API Sintetizada (Cero Audio Files Externos):**
   - Todos los efectos de sonido se generan matemáticamente en el navegador utilizando osciladores (`sine`, `triangle`, `square`, `sawtooth`) y nodos de ganancia con rampas exponenciales.
   - 9 bancos de sonido disponibles: `duang`, `pop`, `chomp`, `laugh`, `sleep`, `fire`, `fanfare`, `scale`, `ambient`.

4. **HTML5 Canvas:**
   - **Canvas de Partículas de Fiesta (`#party-canvas`):** Renderizado acelerado por hardware a 60 FPS con blitting de sprites offscreen pre-rasterizados.
   - **Canvas del Minijuego (`#food-game-canvas`):** Bucle de juego a 60 FPS con detección de colisiones por distancia euclidiana, partículas emergentes de puntuación y soporte completo de pantalla completa nativa/CSS.
   - **Canvas de Llamitas del Laboratorio (`#lab-fire-canvas`):** Sistema de emisores de chispas y fuego con atenuación alfa y turbulencia lateral.

---

## 3. Desglose Módulo por Módulo del Código

### 3.1. Floating Navbar ("Nube de Leche")
- **Avatar de Marca:** Contenedor circular con borde y sombra interior que aloja el sticker animado 3D de Nailong (`sticker_2.webp`) con sonrisa radiante. El muñeco llena el círculo con zoom óptico equilibrado (`scale-110 object-center`).
- **Botones de Acción:**
  - Compartir con amigos (abre modal con enlace oficial y código QR).
  - Silenciador global de audio (`toggleMuteAudio`).
  - Lanza-lluvia Modo Fiesta (`triggerPartyMode`).
  - Menú hamburguesa responsivo para móviles, con botón destacado «Descargar la App» (en escritorio, enlace «📲 App»).

### 3.2. Hero Interactivo & Contador Duang
- Al hacer clic o tocar la pancita de Nailong:
  - Se incrementa el contador global de "Duangs".
  - Se reproduce el efecto de sonido `duang`.
  - Se activa la animación CSS `.animate-duang` con deformación de gelatina elástica.
  - Se generan pompas flotantes con emojis que ascienden por la pantalla.
  - Se actualiza dinámicamente el estado de ánimo (9 estados: *Travieso*, *Glotón*, *Bailarín*, etc.).

### 3.3. Muñeco Acompañante Flotante ("Nailong Flotante")
- Avatar fijo en la esquina inferior que acompaña al usuario durante la navegación.
- Diálogos contextuales optimizados mediante `requestAnimationFrame` que reaccionan a la posición de scroll en la página.
- Al tocarlo, emite un rebote y un sonido alegre.

### 3.4. Visor Mágico de GIFs y Escenas
- Tira horizontal con snap (`#gif-wall-grid`, dentro del bloque `#muro-gifs` de la sección `#galeria`) con 9 escenas animadas reales de Nailong, debajo del banner de la app. También se abre desde el lightbox del álbum con «Abrir en el Visor Mágico».
- Modal con reproductor de velocidad variable:
  - 🐢 Lenta (0.5x)
  - 🦖 Normal (1x)
  - 🚀 Rápida (1.5x)
- Capa de pegatinas interactivas arrastrables (`makeStickerDraggable`) con aislamiento de gestos táctiles.
- Navegación táctil con gestos de deslizamiento horizontal (Swipe izquierda/derecha).

### 3.5. Gran Álbum Polaroid (72 Cromos + Creador + Fotos de Usuario)
- Filtros por categorías: *Todos*, *En Movimiento*, *Comilonas*, *Caritas*, *Bailes*, *Amigos*.
- Sistema de subida de fotos del usuario con persistencia en `localStorage`:
  - Compresión y escalado automático en un canvas temporal antes de guardarse en base64 para no saturar la cuota de almacenamiento.
  - Las fotos guardadas se recuperan al abrir la web (`loadUserPhotosFromStorage()` en `window.onload`) y llevan un botón 🗑️ para eliminarlas (con confirmación).
- Paginación progresiva: 12 cromos visibles (`GALLERY_PAGE_SIZE`) y botón «Ver más cromos de Nailong» (`showMoreGallery()`); el Lightbox navega por la lista filtrada completa. Cuadrícula de 2 columnas en móvil.
- Contadores de los filtros calculados desde los datos (`updateFilterCounts()`).
- Tarjeta especial del creador con Nailong (`creador_nailong.webp`), botón de celebración de confeti y descripción cariñosa.

### 3.6. Botonera Musical (Soundboard)
- 12 casillas interactivas con caritas de Nailong y títulos de la serie.
- Generación de sonidos cómicos sintetizados en tiempo real mediante Web Audio.

### 3.7. Laboratorio de Superpoderes
- Deslizador de tamaño (de Dino Bebé al 50% hasta Dino Gigante al 155%).
- Modo Camaleón con filtros CSS `hue-rotate`: Rosa, Azul, Verde, Morado y ciclo animado Arcoíris.
- Lanzador de llamaradas con física de partículas en canvas y botón de inflado de tripita.

### 3.8. Minijuego: "¡La Gran Comilona de Nailong!"
- **Mecánica:** En 30 segundos, el jugador controla a Nailong horizontalmente para atrapar muslitos de pollo (+10 pts), pasteles (+15 pts) y biberones (+5 pts), esquivando las bombas de Bombloong (-15 pts).
- **Controles Universales:**
  - **Teclado:** Flechas izquierda/derecha y teclas `A` / `D`.
  - **Ratón:** Movimiento horizontal continuo sobre el lienzo.
  - **Pantalla táctil:** Deslizamiento directo con el dedo sobre el lienzo (con bloqueo de scroll vertical de página) o botones virtuales en pantalla.
- **Movimiento Lineal Rápido:**
  - El desplazamiento se calcula en cada frame con velocidad lineal constante e inmediata (`Math.max(16, Math.round(foodCanvas.width * 0.02))`), garantizando una respuesta arcade rápida sin demoras de aceleración.
- **Pantalla Completa Fluida:**
  - Botón de pantalla completa en la botonera superior y botón flotante en la esquina superior del canvas.
  - Soporte de la **HTML5 Fullscreen API** con fallback a **CSS Fullscreen** (`.minigame-fullscreen-active`) para navegadores móviles o contextos embebidos.
  - Soporte de la tecla `Escape` para salir fácilmente.
  - Transiciones suaves y redimensionado automático de resolución de dibujado.

### 3.9. Modo Fiesta (Lluvia de Confeti y Muslitos)
- Canvas de cobertura completa sin restricciones de contención CSS (`contain: none`), sincronizado dinámicamente con el tamaño de ventana.
- Pre-renderizado de glifos en lienzos offscreen (`getEmojiSprite`) con cascada de fuentes tipográficas para soporte universal de emojis en color (`Segoe UI Emoji`, `Apple Color Emoji`, `Noto Color Emoji`).
- Blitting GPU a 60 FPS con reciclaje in situ de partículas sin recolección de basura (Zero GC Lag).
- El canvas permanece oculto y a 1×1 px mientras no hay confeti (no consume VRAM en reposo); `triggerPartyMode()` lo muestra y dimensiona, y `animatePartyConfetti()` lo oculta al terminar.

---

## 4. Notas del Parche & Historial de Versiones (Changelog en Tiempo Real)

### 🚀 Versión 1.0.0 (v1) - Lanzamiento Inicial
- Creación de la página interactiva completa con temática de Nailong (奶龙).
- Hero interactivo con físicas Duang de gelatina, contador de clics y sonidos Web Audio.
- Visor Mágico de animaciones con control de velocidad.
- Álbum polaroid con catálogo de 42 cromos auténticos.
- Botonera musical con 12 sonidos de caricatura.
- Laboratorio interactivo con cambio de tamaño, modo camaleón y llamaradas.
- Minijuego Canvas para atrapar comida.

### 🚀 Versión 2.0.0 (v2) - Compartir & Conectividad Social
- Integración de enlace oficial en GitHub Pages (`https://alvarolofra.github.io/Nailong/`).
- Generador dinámico de códigos QR para escaneo instantáneo con móviles.
- Modal de compartir con botón de copia rápida al portapapeles y Web Share API nativa.

### 🚀 Versión 3.0.0 (v3) - Limpieza y Consolidación Arquitectónica
- Eliminación de archivos HTML redundantes (`el_mundo_m_gico_de_nailong.html`, `el_mundo_m_gico_de_nailong v1.html`).
- Consolidación de `index.html` como único archivo de producción y despliegue.

### 🚀 Versión 4.0.0 (v4) - Sección del Creador, LocalStorage & Mejoras Táctiles
- Incorporación de la sección especial dedicada al creador de la web junto a Nailong (`#creador`) con foto optimizada en formato WebP (`creador_nailong.webp`).
- Persistencia local de fotos del usuario mediante `localStorage` con escalado inteligente para optimizar almacenamiento.
- Soporte para eliminar fotos de usuario guardadas.
- Altura del minijuego ampliada hasta 660px y reducción del 20% en la velocidad de caída de las bombas para mejorar el tiempo de reacción.
- Navegación táctil por deslizamiento (swipe horizontal) en el Visor Mágico y en el Lightbox de fotos.

### 🚀 Versión 5.0.0 (v5) - Optimización GPU a 60 FPS del Modo Fiesta
- Reingeniería del motor de confeti mediante pre-renderizado offscreen de texturas de emojis (`getEmojiSprite`).
- Reducción drástica del overhead de cálculo tipográfico por frame, permitiendo renderizado GPU a 60 FPS constantes.

### 🚀 Versión 6.0.0 (v6) - Rendimiento de Scroll & Acompañante
- Implementación de throttling con `requestAnimationFrame` en los mensajes contextuales del muñeco flotante al hacer scroll.
- Eliminación de descarga directa de la foto del creador para preservar la experiencia visual integrada.
- Preparación del sistema de movimiento continuo en el minijuego.

### 🚀 Versión 7.0.0 (v7) - Estabilidad, Deslizador Lineal Rápido y Pantalla Completa
- **Corrección Crítica del Modo Fiesta:** Solucionado el problema donde al hacer clic en el botón de fiesta no caía nada. La causa raíz era la propiedad CSS `contain: strict;` en `#party-canvas`, que provocaba que el navegador colapsara el rectángulo de renderizado a 0x0 píxeles. Eliminado el confinamiento de tamaño y asegurada la visibilidad en pantalla completa.
- **Corrección Crítica del Minijuego:** Solucionado el fallo donde el minijuego había dejado de funcionar por completo. Se identificó y corrigió un `ReferenceError: keysHeld is not defined` que provocaba un fallo silencioso en el primer fotograma de `gameLoop`.
- **Deslizador Lineal y Rápido:** Sustituida la aceleración progresiva lenta por un movimiento lineal continuo y rápido (16px a 21px por frame) para teclado y botones virtuales táctiles, ofreciendo una respuesta ágil estilo arcade clásico.
- **Modo Pantalla Completa Fluido para el Minijuego:** Añadido botón de pantalla completa en la cabecera de controles y botón flotante en la esquina del juego. Compatible con Fullscreen API nativa y fallback CSS (`.minigame-fullscreen-active`), soporte de tecla `Escape`, transiciones suaves de entrada/salida y redimensionado automático de resolución de dibujado.
- **Avatar de Cabecera con Sonrisa Radiante 3D:** Sustituido el avatar anterior por el GIF animado 3D de sonrisa radiante (`sticker_2.webp`), llenando el círculo completo.
- **Suite de Pruebas Ampliada:** Incrementada de 24 a 28 pruebas automatizadas en `verify_all.py`, verificando la ausencia de regresiones, sintaxis limpia y validación de interacción en navegador.

### 🚀 Versión 8.0.0 (v8) - Perfeccionamiento de Pantalla Completa, HUD en Canvas y Encuadre Óptico
- **HUD Integrado de Marcador y Tiempo en Canvas:** Inclusión de una pastilla de puntuación en vivo (`⭐ X pts`) junto a la pastilla de tiempo (`⏱️ Xs`) en la esquina superior del canvas. Permite a los jugadores ver sus puntos en tiempo real tanto en la vista estándar como en el modo pantalla completa.
- **Controles Táctiles Internos en Pantalla Completa (`#game-touch-dock`):** Integración de botones táctiles virtuales dentro del contenedor del juego (`#game-container`), garantizando que al jugar en pantalla completa en móviles o tablets los controles táctiles permanezcan accesibles.
- **Corrección de Aislamiento en Pantalla Completa CSS:** Eliminada la trampa de contexto de apilamiento provocada por las transformaciones CSS en elementos `.reveal-item.visible` (establecido en `transform: none`), y añadida la clase `has-minigame-fullscreen` en `body` para elevar `#game-container` por encima de cualquier otro elemento de la página.
- **Rescalado Dinámico Proporcional de Coordenadas:** `resizeGameCanvas()` escala matemáticamente la posición horizontal del jugador (`playerX`) y la de todos los alimentos en caída activa según la proporción `newWidth / oldWidth` al entrar/salir de pantalla completa o al cambiar la orientación del dispositivo, evitando que el personaje se desplace fuera del lienzo.
- **Encuadre Óptico del Avatar de Cabecera:** Ajuste fino del recorte circular de `sticker_2.webp` para que llene el círculo completo con `object-cover` sin cortar la parte superior de la frente ni los ojos del personaje durante ninguno de sus 36 fotogramas de animación.
- **Efecto Inmediato en Modo Fiesta:** Distribución de las partículas iniciales para que aparezcan de forma instantánea en el campo visual del usuario, sin retrasos de caída desde fuera de pantalla.

### 🚀 Versión 9.0.0 (v9) - Integración de Stickers para WhatsApp & Descarga Universal iOS / Android
- **Botón Directo de WhatsApp en Visor Mágico y Lightbox:** Botón verde temático oficial (`#25D366`) con icono `fa-brands fa-whatsapp` en `#magic-modal` y `#photo-lightbox`. Invoca la Web Share API con el archivo binario WebP para enviar el sticker directamente a cualquier conversación o chat personal, permitiendo guardarlo en 1 toque en "Favoritos ⭐" en el teclado de stickers de WhatsApp.
- **Solución Definitiva a la Descarga en iPhone (iOS Safari):** Corregido el problema reportado en iOS donde al pulsar "Guardar" no se descargaba el archivo (debido a que WebKit en Safari omite el atributo `download` en URLs de archivos). Implementado `forceDownloadSticker()` con conversión binaria `Blob` y llamada nativa a `navigator.share()` que activa la opción "Guardar imagen" directamente en el Carrete (Fotos de Apple) o en la app Archivos, además de descarga directa por Blob URL.
- **Modal Interactivo de Guardado y Opciones (`#sticker-options-modal`):** Menú Claymorphism emergente que se abre al pulsar "Guardar Sticker", ofreciendo: 1) Usar en WhatsApp, 2) Descargar en el Dispositivo (Fotos / Archivos) y 3) Copiar al Portapapeles (con conversión dinámica a PNG en canvas para compatibilidad con la API de portapapeles de iOS y WhatsApp).
- **Notificaciones Toast Flotantes Duang (`#duang-toast`):** Notificación emergente accesible y animada (`showDuangToast`) que informa al instante sobre el estado de la descarga o la guía para añadir a favoritos en WhatsApp.
- **Explicación Técnica Honesta sobre Packs de WhatsApp:** Información integrada explicando las restricciones de seguridad de Meta/WhatsApp (que impiden que una web inyecte packs masivos sin una app nativa puente) y cómo utilizar alternativas como Sticker.ly o favoritos.
- **Suite de Pruebas Ampliada a 35 Verificaciones:** `verify_all.py` ampliado para validar elementos de WhatsApp, integración de descargas, portapapeles, persistencia y gobernanza documental.

### 🚀 Versión 10.0.0 (v10) - Limpieza de Archivos Obsoletos & Verificación de Carga
- **Eliminación de Archivos Obsoletos:** Supresión definitiva de los scripts auxiliares de red local (`compartir_amigos.bat`, `compartir_amigos.py`), la guía previa de hosting (`COMO_HOSTEAR.md`), la imagen residual `stickers_overview.png`, y la fotografía original sin comprimir de 2MB (`Stickers Nailong/Foto nailong yo.jfif`), reemplazada al 100% por la versión optimizada en formato WebP (`creador_nailong.webp`).
- **Verificación de Carga en Navegador:** Validación exhaustiva del ciclo de vida de carga de `index.html` en Chrome headless y servidor HTTP local con 0 errores de consola, 0 excepciones no capturadas y 100% de los elementos visuales renderizados correctamente.
- **Suite de Pruebas Actualizada:** Actualizadas las aserciones de `verify_all.py` para verificar la ausencia de archivos obsoletos y asegurar exactamente 43 elementos en `Stickers Nailong/`.

### 🚀 Versión 11.0.0 (v11) - Experiencia de Guardado, Banner WhatsApp, Lightbox Duang y Hero Móvil
- **Modal de Guardado Limpio y Ampliado:** Eliminada la caja explicativa de restricciones de WhatsApp en `#sticker-options-modal`. Previsualización del sticker ampliada a 176x176px y botones de acción (*WhatsApp*, *Descargar* y *Copiar*) con textos, iconos y espaciado aumentados (`text-base sm:text-lg`, iconos de 48px), ofreciendo una interfaz táctil limpia y directa.
- **Banner Prominente en el Gran Álbum:** Incorporado un cartel estilizado de alto impacto visual en `#galeria` con icono oficial de WhatsApp (`#25D366`) y flecha de descarga, comunicando con máxima claridad que cualquier sticker puede guardarse o enviarse a WhatsApp con un simple toque.
- **Lightbox del Creador y Físicas Duang:** Ampliadas las dimensiones del visor modal a `max-w-3xl` con altura máxima de contenedor de imagen de 500px / 60vh. Implementada la función interactiva `triggerLightboxDuang(event)` que aplica la deformación elástica `.animate-duang` en `#lb-img` y lanza partículas flotantes (`🍮 ¡DUANG!`, `💛`, `✨`, `🎉`), reaccionando tanto al botón como al clic directo sobre la foto.
- **Reordenación Responsiva del Hero en Móviles:** Ajuste del grid responsive en `#inicio` para que en pantallas móviles el muñeco interactivo de Nailong aparezca inmediatamente después del texto de bienvenida (*"Vengo del Planeta Dragón..."*) y justo antes del selector de estados de ánimo, logrando paridad visual con la experiencia de escritorio desde el primer scroll.
- **Suite de Pruebas Ampliada:** Incorporado el Test 36 en `verify_all.py`, certificando el paso del 100% de las 36 comprobaciones automatizadas.

### 🚀 Versión 12.0.0 (v12) - Rendimiento GPU, Bugs del Álbum, UX Móvil y Accesibilidad
- **Rendimiento:** `loading="lazy"` + `decoding="async"` en imágenes secundarias y plantillas (`renderGifWall`, `renderPolaroidGallery`, `renderSoundboard`); `fetchpriority="high"` en `#hero-nailong-img`; eliminados `drop-shadow` del muro de GIFs y del álbum y todos los `backdrop-blur`; álbum paginado de 12 en 12; canvas de fiesta oculto en reposo; emojis del minijuego con sprites (`getEmojiSprite`).
- **Bugs:** carga de fotos de usuario en `window.onload`, botón de borrado con confirmación, aviso si `localStorage` está lleno, semilla numérica para chincheta e inclinación de fotos de usuario, contadores de filtros dinámicos y eliminación de listeners globales táctiles en `makeStickerDraggable()`.
- **UX móvil:** álbum en 2 columnas, filtros y estados de ánimo en carrusel horizontal, `#game-touch-dock` solo en pantalla completa táctil, bocadillo y mascota menos intrusivos, scrollspy en la navbar, feedback visual de la botonera y menos partículas de fondo.
- **Accesibilidad:** `prefers-reduced-motion`, `role="dialog"`/`aria-modal`/`aria-labelledby` en los 4 modales, `aria-label` en botones de icono y bloqueo del scroll de fondo.
- **Suite de Pruebas Ampliada:** Test 37 en `verify_all.py`, certificando el paso del 100 % de las 37 comprobaciones.

---

## 6. Registro Histórico de Decisiones de Arquitectura (ADR)

### 📌 ADR-01: Descarga Universal en iOS (Safari) e Integración de Stickers para WhatsApp
- **Fecha:** 2026-10-29
- **Estado:** Implementado / Aceptado
- **Problema:**
  1. En iPhone (iOS Safari), los enlaces `<a href="..." download>` fallan silenciosamente debido a que el motor WebKit ignora el atributo `download` para URLs de imágenes y assets no originados en el mismo origen directo o esquemas de archivo.
  2. Los usuarios desean una opción para añadir stickers directamente a un pack de stickers de WhatsApp desde la web.
- **Análisis de Viabilidad y Restricciones de Plataforma:**
  - *¿Es posible desde una web inyectar stickers directamente en la base de datos de WhatsApp con 1 clic?* **NO.**
    - En Android, WhatsApp exige una aplicación nativa instalada que implemente un `ContentProvider` registrado con `com.whatsapp.provider.sticker` y responda al intent nativo `com.whatsapp.intent.action.ENABLE_ADD_PACK_TO_WHATSAPP`.
    - En iOS, WhatsApp requiere acceso a un UIPasteboard privado (`net.whatsapp.WhatsApp.stickers`) restringido a binarios nativos de iOS.
    - No existe ningún esquema URI (`whatsapp://...`) ni Web API W3C que permita a un navegador escribir en el almacenamiento interno de WhatsApp.
- **Decisión Adoptada (Estrategia Híbrida de 3 Vías):**
  1. **Envío Directo a WhatsApp vía Web Share API (`navigator.share`):**
     - Se encapsula el archivo WebP en un objeto binario `File` con MIME `image/webp`.
     - Se invoca `navigator.share({ files: [file] })` **sin parámetro `text` mixto** (eliminando el bug de Android donde WhatsApp descarta el archivo de imagen si se pasa texto simultáneamente).
     - El usuario comparte el sticker a cualquier conversación de WhatsApp o a su propio chat («Tú»), lo toca en pantalla y pulsa **«Añadir a favoritos ⭐»**, quedando permanentemente en su teclado de WhatsApp.
  2. **Descarga Universal en Carrete iOS (`forceDownloadSticker`):**
     - Mediante `fetch` y `Blob`, en dispositivos móviles (incluyendo iPadOS detectado vía `MacIntel` + `maxTouchPoints`) se invoca `navigator.share({ files: [file] })`. En iOS Safari esto despliega la hoja nativa con la opción directa del sistema **«Guardar imagen»**, guardándola de inmediato en el Carrete (Fotos de Apple).
     - Si se usa navegador de escritorio o el usuario cancela la hoja, se dispara la descarga directa por Blob URL y un enlace de apertura en pestaña auxiliar.
  3. **Copia Dinámica al Portapapeles (`copyStickerToClipboard`):**
     - Conversión offscreen en canvas a PNG para satisfacer la especificación W3C Clipboard API en navegadores que restringen el pegado de WebP.
  4. **Alternativa de Importación Masiva:**
     - Se documenta en el modal la recomendación de usar la app gratuita **Sticker.ly** buscando "Nailong" para instalar los 82 stickers de golpe.

### 📌 ADR-02: Consolidación Limpia del Repositorio y Diagnóstico de Carga
- **Fecha:** 2026-10-29
- **Estado:** Implementado / Aceptado
- **Problema:** Existencia de scripts de servidor local redundantes tras la publicación oficial en GitHub Pages (`compartir_amigos.bat`, `compartir_amigos.py`, `COMO_HOSTEAR.md`, `stickers_overview.png`, y la foto original de 2MB `Foto nailong yo.jfif`), y necesidad de diagnosticar y validar la carga en navegadores web.
- **Decisión Adoptada:**
  1. Eliminar completamente del árbol de trabajo todos los scripts auxiliares y archivos no utilizados para garantizar un despliegue ligero y sin ambigüedades.
  2. Verificar la carga del sitio con Chrome Headless y servidor HTTP local (`python http.server`), confirmando 0 errores en consola y renderizado completo al 100%.
  3. Documentar y prevenir las causas comunes de problemas de carga en GitHub Pages:
     - **Distinción de mayúsculas:** El repositorio es `Nailong` (con N mayúscula). En GitHub Pages en entornos Linux, `alvarolofra.github.io/nailong/` devuelve 404, mientras que `alvarolofra.github.io/Nailong/` carga perfectamente.
     - **Tiempo de despliegue:** Los pipelines de GitHub Pages tardan típicamente entre 1 y 2 minutos tras el push en publicar los cambios.
     - **Configuración de Pages:** Requiere tener la rama `main` y directorio `/ (root)` activados en `Settings > Pages`.

### 📌 ADR-03: Reordenación Responsiva del Hero en Móviles, Físicas Duang en Lightbox y Optimización del Modal de Descarga
- **Fecha:** 2026-10-29
- **Estado:** Implementado / Aceptado
- **Problema:**
  1. En dispositivos móviles, el avatar interactivo de Nailong quedaba relegado al final de la primera sección (debajo de 9 botones de estados de ánimo y del contador), provocando que el usuario tuviera que hacer scroll prolongado para ver al personaje.
  2. En el visor modal (`#photo-lightbox`), la foto vertical del creador se visualizaba con un tamaño excesivamente reducido y el botón `¡Hacer Duang!` solo emitía sonido sin proporcionar feedback háptico ni visual en pantalla.
  3. En el modal de descarga (`#sticker-options-modal`), el recuadro explicativo de restricciones sobrecargaba visualmente la tarjeta y restaba espacio a los botones de acción primarios.
- **Decisión Adoptada:**
  1. Utilizar un grid CSS responsive desacoplado (`lg:col-span-6 lg:row-start-X`) que reordena de forma nativa los bloques en móvil (Intro ➔ Avatar interactivo ➔ Estados de ánimo ➔ Contador) sin duplicar elementos en el DOM ni alterar la disposición a dos columnas en PC.
  2. Aumentar las dimensiones de `#photo-lightbox` a `max-w-3xl` (con contenedor hasta 500px / 60vh) y dotar al botón `¡Hacer Duang!` y a la propia imagen de interactividad física completa mediante `triggerLightboxDuang()` (activación de clase `.animate-duang` con reflow forzado y generación de partículas flotantes).
  3. Suprimir la advertencia teórica en `#sticker-options-modal` para dar protagonismo total a los tres botones de descarga y a la imagen ampliada del sticker.


### 📌 ADR-04: Rendimiento de GPU en Chrome/Brave, Paginación del Álbum y Tailwind por CDN
- **Fecha:** 2026-10-29
- **Estado:** Implementado / Aceptado
- **Problema:** En Chrome y Brave de escritorio la página se volvía lenta y el proceso de GPU se disparaba (se aliviaba al refrescar). Causas identificadas: decenas de WebP animados decodificándose a la vez (el álbum pintaba los 42 cromos sin `loading="lazy"`), filtros `drop-shadow` recalculados en cada fotograma de cada animación, `backdrop-blur` sobre un fondo que seguía animándose (navbar y modales) y un canvas de pantalla completa siempre reservado en VRAM. Además, 42 tarjetas a una columna obligaban a un scroll excesivo en móvil.
- **Decisión Adoptada:**
  1. Carga diferida (`loading="lazy"`, `decoding="async"`) y paginación del álbum (12 cromos por página) para limitar cuántos WebP animados existen a la vez; `displayedStickers` conserva la lista completa para el Lightbox.
  2. Prohibido usar `drop-shadow` en imágenes animadas de cuadrículas y `backdrop-blur` sobre contenido animado; la profundidad se resuelve con `box-shadow` de los contenedores.
  3. `#party-canvas` oculto y a 1×1 px en reposo; nunca `contain: strict` (colapsa el canvas a 0×0, ver v7).
  4. Móvil primero: álbum a 2 columnas, filtros en carrusel y botones táctiles del juego sin duplicar.
  5. **Se mantiene Tailwind por CDN** (regla *buildless* del proyecto). Compilarlo con Tailwind CLI reduciría ~100 KB de JavaScript en la carga, pero introduce una herramienta de build; se aplaza como decisión de arquitectura aparte.
  6. **Identificación semántica de la foto del creador:** La foto del creador se discrimina por archivo (`file === 'creador_nailong.webp'` vía `isCreatorItem`), suprimiendo el centinela rígido `id: 43` para que el cromo real #43 de Nailong pueda añadirse a `ALL_STICKERS` y descargarse libremente.
- **Medición:** abrir `Shift+Esc` en Chrome y observar el proceso de GPU mientras se hace scroll por el álbum, antes y después.

### 📌 ADR-05: Expansión de Colección a 72 Stickers, Renumeración Continua y Paginación Dinámica
- **Fecha:** 2026-10-29
- **Estado:** Implementado / Aceptado
- **Problema:** El array `ALL_STICKERS` solo contenía 42 cromos mientras existían 32 archivos nuevos WebP en `Stickers Nailong/` con saltos de numeración (faltaban 58, 59 y 63) y un archivo con texto incrustado ("GEMESNYA"). Además, el código trataba `id === 43` como centinela del creador, bloqueando la descarga del nuevo cromo 43, y el botón de paginación avanzaba únicamente de 12 en 12 en pantallas grandes.
- **Decisión Adoptada:**
  1. Recortar sin pérdidas `sticker_62.webp` a 240×202 px para eliminar el texto "GEMESNYA" sin afectar al personaje (renumerado a `sticker_60.webp`).
  2. Renumerar secuencialmente en orden ascendente los archivos para cerrar los huecos (quedando `sticker_1.webp`…`sticker_72.webp` + `creador_nailong.webp`: 73 archivos).
  3. Incorporar los 32 nuevos elementos a `ALL_STICKERS` con títulos en tono infantil, categorías, efectos de Web Audio y conteo verificado de fotogramas.
  4. Desacoplar la foto del creador mediante la función `isCreatorItem(item)` (`item.file === 'creador_nailong.webp'`), eliminando cualquier chequeo por `item.id === 43`.
  5. Ajustar el paso de paginación (`GALLERY_STEP = window.matchMedia('(min-width: 640px)').matches ? 24 : 12`), acelerando la exploración en escritorio (+24) mientras se preserva el consumo móvil (+12).


### 📌 ADR-06: Formato Sticker de WhatsApp y Herramienta `normalizar_stickers.py`
- **Fecha:** 2026-10-29
- **Estado:** Implementado / Aceptado
- **Problema:** Los stickers 43–74 llegaban a WhatsApp como imagen (y los animados se perdían): eran WebP 240×240 / tamaños arbitrarios sin EXIF de WhatsApp. Los 1–42 funcionaban por ser 512×512 con EXIF `sticker-pack-id`.
- **Decisión:** Convertir todo a 512×512 (lienzo transparente, sin deformar), inyectar el EXIF original, limitar peso (≤100 KB estático / ≤500 KB animado) y mantener ≤10 s mediante `normalizar_stickers.py`; el Test 39 de `verify_all.py` impide regresiones. Eliminados los duplicados 48 y 53.
- **Ampliación:** los animados además exigen estructura de fotogramas completos con `ALPH` + VP8 perfil 0 (los generados por Pillow no la cumplían); `normalizar_stickers.py` usa un muxer propio (`build_animated`) y el Test 39 la comprueba.
- **Consecuencias:** Los próximos stickers de TikTok se incorporan con `python normalizar_stickers.py --import CARPETA`. Copiar al portapapeles sigue produciendo PNG estático (limitación del navegador).

### 📌 ADR-07: Segunda Tanda de Stickers (73–82)
- **Fecha:** 2026-10-30
- **Estado:** Implementado / Aceptado
- **Decisión:** Importar la segunda tanda con `normalizar_stickers.py --import` tras comparar con la colección existente: se descartaron 2 duplicados exactos (equivalentes a 71 y 72) y se añadieron 10 (73–82), manteniendo numeración continua y los tests de formato WhatsApp (Test 39). El sticker 75 se recortó para eliminar el subtítulo incrustado.

### 📌 ADR-08: Exportación a WhatsApp: Copiar al Portapapeles con Esquinas Transparentes (v17)
- **Fecha:** 2026-10-30
- **Estado:** Implementado / Aceptado (la vía para stickers animados sigue abierta, ver «Vías de mejora»)

**Contexto.** Tras la v14–v16 (512×512, EXIF de WhatsApp, muxer propio para animados) seguían llegando como imagen todos los animados y algunos estáticos. No existe documentación pública de cómo decide la app de WhatsApp si lo que recibe es sticker o imagen; la única vía oficial para añadir stickers es una app Android con `ContentProvider` + intent `com.whatsapp.intent.action.ENABLE_STICKER_PACK` (o `whatsapp://stickerPack` en iOS), inaccesible desde una web.

**Técnicas usadas.**
1. **Inspección de la estructura RIFF/WebP** de cada sticker (chunks `VP8X` y sus flags, `ALPH`, `VP8 `, `ANIM`, `ANMF`, `EXIF`) con un script de Python, comparando los que funcionan con los que no. Hallazgo: los estáticos que fallaban (8, y también 3, 17, 22, 38) no tienen canal alfa (`VP8X` flag 0x8, sin `ALPH`), y los que funcionaban (1, 58, 69) sí.
2. **Página temporal de pruebas** (`prueba_whatsapp/`, publicada en GitHub Pages sin enlace y con `noindex`, borrada al terminar) con una **matriz de variantes del mismo sticker**: con/sin canal alfa, con borde transparente, con esquinas redondeadas, un único píxel semitransparente, MIME `image/webp.wasticker`, con/sin `title`/`text` en `navigator.share`, codificación Pillow frente al muxer propio, versión ligera (<100 KB) y GIF (fondo blanco, opaco y transparente). Cada variante tenía un código (S0…, A0…, C0…) y Eva anotó en su Android qué llegaba como sticker. Es la única forma fiable: WhatsApp no se puede probar desde el ordenador.
3. **Comprobación automática en el navegador** (Chrome): se interceptó `navigator.clipboard.write` para analizar el PNG que genera la web (tamaño y número de píxeles transparentes) y asegurar que coincide con la variante que funcionó.

**Resultados (Android, Chrome + WhatsApp, 2026-10-30).**

| Vía | Variante | Resultado |
|---|---|---|
| Compartir (Web Share API) | cualquier WebP: original, con alfa, con borde, MIME wasticker, con texto, ligero, otra codificación; incluso el 58 | **imagen** |
| Compartir | GIF del 47 (fondo blanco o transparente) / GIF del 50 (opaco) | **GIF** / imagen |
| Copiar (PNG) | 8 opaco tal cual / con 1 píxel semitransparente | **imagen** |
| Copiar (PNG) | 8 con esquinas redondeadas (r = 48 px, 2178 px transparentes) / con borde transparente de 24 px | **sticker** |
| Copiar (PNG) | 58 (ya transparente) | **sticker** |
| Copiar (PNG) | animado 47 (con transparencia) / animado 50 con esquinas | **sticker quieto** |
| Copiar (PNG) | animado 50 opaco tal cual | **imagen** |

**Conclusiones.**
- «Compartir» no sirve para stickers: WhatsApp trata todo lo recibido por `ACTION_SEND` como foto (o GIF). No depende del archivo, así que no se puede arreglar desde la web.
- «Copiar y pegar» sí: WhatsApp convierte en sticker el PNG pegado **si tiene transparencia visible**. Al pegar, WhatsApp le añade su propio **contorno blanco** (pendiente de confirmar que también ocurre con los stickers que ya eran transparentes, como el 58).
- El portapapeles del navegador solo admite `image/png` (además de `text/plain`/`text/html` y formatos «web custom» que las apps nativas no leen), así que **un sticker animado nunca se puede copiar animado**: se pega el primer fotograma.

**Decisión.**
- `copyStickerToClipboard()` dibuja el sticker en 512×512; si tiene menos de `CLIPBOARD_MIN_TRANSPARENT` (2178) píxeles transparentes, lo vuelve a dibujar recortado con esquinas redondeadas de `CLIPBOARD_CORNER_RADIUS` (48 px). Los que ya tienen transparencia no se tocan.
- «Copiar Sticker» pasa a ser la opción recomendada. El botón de WhatsApp (Web Share) se mantiene, pero sus textos dicen la verdad: llega como foto y para sticker hay que usar «Copiar Sticker». Banner del álbum actualizado.
- Test 41 de `verify_all.py`: recorte condicional con esquinas, ningún texto promete «Añadir a favoritos» y no queda `HANDOFF_WHATSAPP.md`.

**Vías de mejora para los stickers animados** (sin apps ni servicios externos; **no comprobadas**):
1. **WhatsApp Web / escritorio:** enviar el `.webp` animado de 512×512 desde web.whatsapp.com o la app de escritorio arrastrándolo a un chat. Si WhatsApp Web lo envía como sticker animado, en el móvil basta con pulsarlo → «Añadir a favoritos». La web podría tener un botón «Descargar para WhatsApp Web» con instrucciones. Requiere ordenador.
2. **Descargar y compartir desde Archivos/Galería** del móvil: probablemente igual que Web Share (misma vía `ACTION_SEND` ⇒ imagen), pero no se ha probado.
3. **Reenviar un sticker animado ya recibido:** una vez alguien lo tiene como sticker (p. ej. vía 1), se puede reenviar o añadir a favoritos desde el propio WhatsApp.
4. Descartadas: portapapeles (solo PNG), Web Share (siempre imagen/GIF), GIF (llega como GIF). Fuera de alcance por requerir apps: app Android propia con el `ContentProvider` oficial, Sticker.ly/Sticker Maker y paquetes `.wastickers`.

**Pendiente de comprobar** (ronda 3 de pruebas): radio mínimo de esquina que basta (4/8/16/24 px), si el contorno blanco aparece también en stickers ya transparentes, y las vías 1 y 2.

### 📌 ADR-09: App Android Nativa Oficial, ContentProvider Dinámico para «Mi Selección» y Descarga Directa en la Web (v3.0.0)
- **Fecha:** 2026-10-30
- **Estado:** Implementado / Aceptado
- **Problema:** En el navegador web móvil (Chrome en Android y Safari en iOS), WhatsApp no ofrece ninguna API pública para importar stickers directamente a su teclado:
  1. `navigator.share` (`ACTION_SEND`) siempre es tratado por WhatsApp como imagen suelta o GIF, nunca como sticker.
  2. La API del portapapeles (`ClipboardItem`) solo soporta `image/png` estático, perdiendo la animación en los 60 stickers animados de la colección.
  3. La única vía oficial para añadir paquetes completos y stickers animados al teclado de WhatsApp es una aplicación nativa Android que implemente un `ContentProvider` registrado con el permiso `com.whatsapp.sticker.READ` y dispare el Intent `com.whatsapp.intent.action.ENABLE_STICKER_PACK`.
- **Decisión Adoptada:**
  1. **Desarrollo de App Android Nativa (`StickersNailong.apk`):** Basada en la arquitectura oficial de WhatsApp Stickers (`com.eva.nailongstickers`), compilada con Temurin JDK 17 y Gradle 8.7, y firmada con esquemas v1 y v2 (26.6 MB / 26.669.804 bytes).
  2. **3 Packs Oficiales Preconfigurados (82 Stickers):**
     - *Nailong animado 1:* 30 stickers animados (25 originales + 5 ampliados) con icono de bandeja animado (`tray.png`, 96×96).
     - *Nailong animado 2:* 30 stickers animados (30 ampliados) con icono de bandeja temático.
     - *Nailong estático:* 22 stickers estáticos normalizados (≤100 KB, 512×512) con accesibilidad UTF-16 verificada.
  3. **Sistema Innovador «Mi Selección» (`DynamicPackManager.java`):**
     - Permite al usuario tocar cromos de cualquiera de los 3 packs para crear un lote a medida (mínimo 3, máximo 30 stickers) con `ToggleResult` (`ADDED`, `REMOVED`, `LIMIT_REACHED`).
     - **Bifurcación Inteligente:** Detecta si la selección contiene elementos mixtos (WhatsApp rechaza paquetes que mezclan estáticos y animados) y ofrece al usuario importar ambos en dos importaciones consecutivas (encadenadas en `onActivityResult`) o elegir cuál importar.
     - Identificadores incrementales únicos (`seleccion_1`, `seleccion_2`...) para evitar que WhatsApp ignore la importación si detecta un ID repetido.
     - Almacenamiento dinámico en `context.getFilesDir()/selection_packs/<id>/` con metadatos JSON leídos de forma segura con `ByteArrayOutputStream` y bandeja generada dinámicamente según el tipo de pack.
     - Aviso explícito de borrado manual: la app informa al usuario de que los packs creados se gestionan y borran directamente en WhatsApp.
  4. **Ampliación de `StickerContentProvider.java`:**
     - Aislamiento de consultas globales para que la home de la app solo liste los 3 packs oficiales, resolviendo los packs de selección dinámicos bajo demanda por identificador (`metadata/<id>` y `stickers/<id>`).
     - Coincidencia comodín `stickers_asset/*/*` para servir tanto los archivos empaquetados en assets sin comprimir (`noCompress "webp"`) como los archivos dinámicos generados en almacenamiento interno mediante `ParcelFileDescriptor` envuelto en `AssetFileDescriptor` con su longitud exacta.
  5. **Diseño Claymorphism Temático Nailong:**
     - Paleta cálida (#FFFDF0/#FEF9C3/#FFD93D/#EA580C/#25D366), tarjetas Claymorphism con sombreados interiores/exteriores y relieve suave, navegación clara con botones «Ver stickers ❯» y «Añadir a WhatsApp», e indicadores de checkmark interactivos.
  6. **Distribución Directa en la Web:**
     - `StickersNailong.apk` alojado directamente en la raíz web para descarga instantánea.
     - Banner Claymorphism en `#galeria` dentro de `index.html`.
  7. **Suite de Pruebas Ampliada:** Incrementada a 42 comprobaciones completas en `verify_all.py`.

### 📌 ADR-10: Pulido Tipográfico en Botones, Ajuste de Badges y Limpieza de Inspecciones Lint (v3.0.1)
- **Fecha:** 2026-10-30
- **Estado:** Implementado / Aceptado
- **Problema:** En dispositivos con escalado de fuente del sistema (ej. Xiaomi / HyperOS), el botón de la tarjeta de packs transformaba el texto forzadamente a mayúsculas (`textAllCaps="true"` por defecto), provocando que «VER STICKERS ❯» saltara a dos líneas y la segunda línea quedara recortada verticalmente por la altura fija de 44 dp. Asimismo, títulos largos como «Nailong animado 1» se truncaban a «Nailong anim...» por falta de espacio frente a las insignias laterales, y Android Studio reportaba advertencias Lint de márgenes bidireccionales RTL (`layout_marginLeft`/`layout_marginRight`), cadenas no extraídas a XML y compatibilidad de API.
- **Decisión:**
  1. Configurar `android:textAllCaps="false"`, `android:textSize="12sp"`, padding lateral calibrado y protección `android:maxLines="1"` en el botón de navegación.
  2. Reducir padding de insignias a 7dp y ajustar el título a 16sp para visualización completa de los nombres de los 3 packs oficiales.
  3. Resolver todas las inspecciones de Lint en `activity_sticker_pack_list.xml` y `sticker_packs_list_item.xml` añadiendo compatibilidad RTL API 15-17, extrayendo cadenas a `strings.xml` (`@string/my_selection_badge_title`) y anotando `@tools:targetApi="lollipop"`.
  4. Incrementar versión a `v3.0.1` (`versionCode 2`, `versionName "3.0.1"`) y sincronizar la web (`v3.0.1 APK`, pie de página y test 42 de `verify_all.py`).

### 📌 ADR-11: UI Pulida, Tipografía Fredoka, Diálogo Claymorphism con Renombrado Suave y Calibración de Icono Adaptive (v3.1.0)
- **Fecha:** 2026-10-31
- **Estado:** Implementado / Aceptado
- **Problema:** Se identificaron 6 áreas de mejora en la interfaz web y móvil: 1) El badge del álbum en web rompía con bordes cortados en móviles estrechos. 2) La cola de Toasts del sistema Android acumulaba retraso al seleccionar stickers rápido. 3) En la pantalla de detalles, «Pack añadido a WhatsApp» y el texto de ayuda inferior se superponían en la misma coordenada Y cuando el pack ya estaba añadido. 4) La cuadrícula de stickers flotaba sobre el fondo plano sin distinción visual de contenedor. 5) El botón `(i)` de información en la Toolbar carecía de utilidad. 6) El diálogo de aviso de WhatsApp mostraba frases redundantes, carecía de personalización de nombre de pack y el mensaje de éxito final era un Toast tosco de Android. 7) El icono del launcher aparecía con zoom excesivo (recorte en barbilla y frente) en máscaras circulares/squircles de Android.
- **Decisión:**
  1. **Web Móvil:** Badge de galería adaptado con `inline-block`, `rounded-2xl` y `leading-snug` para un salto limpio en 2 líneas sin fragmentación de bordes en pantallas móviles.
  2. **Tipografía Fredoka:** Incorporación nativa de Google Font Fredoka (`res/font/fredoka.xml` con pesos 400, 500, 600 y 700) aplicada globalmente a temas, botones, títulos y diálogos en la app Android.
  3. **Feedback Táctil In-App Instantáneo:** Sustituido el `Toast.makeText` encolado por un `inapp_toast_pill` Claymorphism reactivo con temporizador de desvanecimiento de 1000 ms que actualiza el contador de selección en tiempo real (0 ms de espera).
  4. **Tarjeta Contenedora para Cuadrícula:** Creado `card_stickers_container.xml` (fondo blanco, radio de 20 dp y borde amarillo `#FDE047`) envolviendo la lista de stickers con separación nítida.
  5. **Supresión del Botón «(i)»:** Eliminada la inflación de `toolbar.xml` en `StickerPackDetailsActivity.java`.
  6. **Corrección de Textos Superpuestos:** Reestructurado el layout inferior en un `LinearLayout` vertical secuencial donde el badge de añadido (`badge_already_added.xml`) y el texto de ayuda guardan margen vertical garantizado.
  7. **Diálogo de Importación Claymorphism con Lápiz:** Creado `dialog_import_selection.xml` con campo de texto editable y botón de lápiz ✏️ (`ic_edit_pencil.xml`) para renombrar suavemente el pack antes de enviarlo a WhatsApp, actualizando `DynamicPackManager.createSelectionPack` con el parámetro `customName`.
  8. **Diálogo de Éxito:** Creado `dialog_success_whatsapp.xml` celebratorio con botón Claymorphism.
  9. **Calibración del Icono Adaptive:** Modificado `generate_launcher_icons()` en `generar_assets.py` para aplicar un factor de escala del 72% centrado en la zona segura (*Safe Zone*) de 108 dp, evitando recortes de máscara circular en el launcher.
  10. **Versionado y Pruebas:** Binario `StickersNailong.apk` (24.6 MB) recompilado con `versionCode 3`, `versionName "3.1.0"`, firmado y verificado con 43 tests superados al 100%.

### 📌 ADR-12: Fusión del Muro de GIFs con el Álbum, Botón de App en el Menú y Barra Móvil sin Desbordes (v3.2.0)
- **Fecha:** 2026-10-31
- **Estado:** Implementado / Aceptado
- **Problema:** El muro de GIFs (9 tarjetas, 1 por fila en móvil) y el álbum mostraban casi lo mismo dos veces, alargaban el scroll y enterraban el banner de la app, lo más importante del proyecto. Además la barra superior desbordaba en pantallas estrechas (medido: +12 px a 320 px), dando sensación de zoom y cortando el botón del menú.
- **Decisión:** Se probaron 3 opciones en una subpágina temporal (ya borrada): A carrusel, B cuadrícula, C pestañas. Se eligió **A**: sección única con app → Visor en tira horizontal → álbum, y acceso al Visor desde el lightbox. Menú: botón verde a `#android-app-banner`. Barra: subtítulo `hidden sm:block`, «Fiesta» solo emoji en móvil, reglas `@media (max-width: 359px)` y `overflow-x: clip`.
- **Consecuencias:** `renderGifWall` pinta botones de tira (conserva `loading="lazy"`/`decoding="async"`); `verify_all.py` pasa a 44 tests; versión web `v3.2.0` (APK sin cambios, sigue `v3.1.0`). El zoom en el Poco X7 Pro no se pudo reproducir; queda pendiente de confirmar en el dispositivo.

### 📌 ADR-13: Corrección de Eventos Táctiles en Diálogo de Exportación y Robustecimiento de ContentProvider (v3.2.1)
- **Fecha:** 2026-10-31
- **Estado:** Implementado / Aceptado
- **Problema:** Tras la actualización a v3.1.0, al completar la selección en «Mi Selección» y pulsar el botón verde «Añadir a WhatsApp» en el diálogo emergente `dialog_import_selection.xml`, no se abría el menú nativo de WhatsApp ni ocurría ninguna acción, mientras que la adición de los packs prehechos continuaba funcionando con normalidad. El diagnóstico reveló:
  1. **Intercepción de eventos táctiles:** El botón de confirmación en `dialog_import_selection.xml` y en `dialog_success_whatsapp.xml` era un `FrameLayout` que contenía un `TextView` con estilo `@style/StickerPreviewButtonText`. Dicho estilo hereda de `Widget.MaterialComponents.Button.TextButton`, el cual define por defecto `android:clickable="true"` y `android:focusable="true"`. Al tocar sobre el texto o icono del botón, el `TextView` consumía el evento táctil sin tener asignado un `OnClickListener`, impidiendo que el click llegara al contenedor padre `FrameLayout` (`btn_dialog_confirm`) y provocando que el diálogo no se cerrase ni se ejecutara `addStickerPackToWhatsApp`.
  2. **Compatibilidad en la lectura de archivos por WhatsApp:** Al crearse packs dinámicos en almacenamiento interno (`files/selection_packs/<id>/`), el `ContentProvider` servía los descriptores mediante `AssetFileDescriptor(pfd, 0, dynamicFile.length())`. Si WhatsApp invocaba `openFile(uri, mode)` en lugar de `openAssetFile`, la implementación base de Android intentaba crear una tubería (*pipe*) en segundo plano debido a que la longitud declarada era $\ge 0$.
  3. **Aislamiento y resolución de metadatos en consultas globales:** `getPackForAllStickerPacks` sólo servía los 3 packs oficiales para no poblar la home de la app con selecciones pasadas, pero si WhatsApp realizaba una verificación global de autoridad contra `metadata`, los packs dinámicos no aparecían listados.
- **Decisión:**
  1. Configurar explícitamente `android:clickable="false"`, `android:focusable="false"` y `android:duplicateParentState="true"` en los `TextView` internos de `dialog_import_selection.xml` y `dialog_success_whatsapp.xml`, así como directamente en `@style/StickerPreviewButtonText` en `styles.xml`.
  2. Asignar el `OnClickListener` tanto al `FrameLayout` como al `TextView` interno (`btn_dialog_confirm_text` y `btn_success_dismiss_text`) en `StickerPackListActivity.java` para garantizar disparo inmediato del evento independientemente del punto exacto de pulsación.
  3. Sobrescribir `openFile(Uri, String)` en `StickerContentProvider.java` para retornar directamente el `ParcelFileDescriptor` en modo lectura sin intermediación de pipes, y ajustar `openAssetFile` para usar `AssetFileDescriptor.UNKNOWN_LENGTH`.
  4. En `StickerContentProvider.getPackForAllStickerPacks`, detectar si el paquete solicitante es WhatsApp (`com.whatsapp` o `com.whatsapp.w4b`) para incluir los packs dinámicos en la respuesta global de metadatos manteniendo la home de la app limpia con solo los 3 packs prehechos.
  5. Asegurar valores por defecto vacíos (`""`) en `androidPlayStoreLink` e `iosAppStoreLink` en `DynamicPackManager.java` para garantizar paridad exacta de esquema con los packs oficiales.
  6. Incrementar versión de la aplicación a `v3.2.1` (`versionCode 4`, `versionName "3.2.1"`), actualizar `index.html` (`v3.2.1 APK` en banner y `v3.2.1` en footer), actualizar `verify_all.py` y regenerar/firmar `StickersNailong.apk`.

---

## 7. Instrucciones de Verificación y Testing

Para verificar la integridad completa del proyecto:

```bash
# Ejecutar suite de pruebas unitarias y estructurales (44 tests)
python verify_all.py
```

Salida esperada:
```text
=== ALL 44 VERIFICATION TESTS PASSED SUCCESSFULLY! ===
```
