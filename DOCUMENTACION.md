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
├── README.md                    # Descripción general y enlaces públicos
├── DOCUMENTACION.md             # Documentación exhaustiva de código, arquitectura y funcionamiento
├── GEMINI.md                    # Contexto e instrucciones técnicas para modelos Gemini
├── CLAUDE.md                    # Contexto e instrucciones técnicas para modelos Claude
├── verify_all.py                # Suite de pruebas automatizadas en Python (33 tests unitarios y estructurales)
├── compartir_amigos.py          # Servidor HTTP local multi-interfaz con generación de QR en consola
├── compartir_amigos.bat         # Launcher rápido para Windows (doble clic)
└── Stickers Nailong/            # Directorio de recursos gráficos (42 cromos .webp + fotos del creador)
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
  - Menú hamburguesa responsivo para móviles.

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
- Galería con 9 escenas animadas reales de Nailong.
- Modal con reproductor de velocidad variable:
  - 🐢 Lenta (0.5x)
  - 🦖 Normal (1x)
  - 🚀 Rápida (1.5x)
- Capa de pegatinas interactivas arrastrables (`makeStickerDraggable`) con aislamiento de gestos táctiles.
- Navegación táctil con gestos de deslizamiento horizontal (Swipe izquierda/derecha).

### 3.5. Gran Álbum Polaroid (42 Cromos + Creador + Fotos de Usuario)
- Filtros por categorías: *Todos*, *En Movimiento*, *Comilonas*, *Caritas*, *Bailes*, *Amigos*.
- Sistema de subida de fotos del usuario con persistencia en `localStorage`:
  - Compresión y escalado automático en un canvas temporal antes de guardarse en base64 para no saturar la cuota de almacenamiento.
  - Opción de eliminar fotos de usuario guardadas.
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
     - Se documenta en el modal la recomendación de usar la app gratuita **Sticker.ly** buscando "Nailong" para instalar los 42 stickers de golpe.

---

## 7. Instrucciones de Verificación y Testing

Para verificar la integridad completa del proyecto:

```bash
# Ejecutar suite de pruebas unitarias y estructurales (35 tests)
python verify_all.py
```

Salida esperada:
```text
=== ALL 35 VERIFICATION TESTS PASSED SUCCESSFULLY! ===
```
