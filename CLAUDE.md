# Proyecto Nailong (奶龙) - Contexto, Arquitectura e Instrucciones

Este archivo sirve como guía maestra y contexto técnico para agentes inteligentes (Gemini / Claude) y desarrolladores que trabajen en el proyecto **El Mundo Mágico de Nailong (奶龙)**.

- **Repositorio Oficial:** `https://github.com/AlvaroLofra/Nailong.git`
- **Enlace de Producción (GitHub Pages):** [https://alvarolofra.github.io/Nailong/](https://alvarolofra.github.io/Nailong/)
- **Punto de Entrada Definitivo:** `index.html`

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
   - La colección contiene exactamente 42 cromos numerados (`sticker_1.webp` a `sticker_42.webp`) más las imágenes del creador (`creador_nailong.webp`).
5. **Compatibilidad Móvil Obligatoria:**
   - La interfaz debe funcionar perfectamente en iPhone (Safari iOS con Dynamic Island y barra inferior) y Android (Chrome), respetando `viewport-fit=cover`, safe-area insets y soporte PWA.
6. **Verificación Continua:**
   - Tras cualquier cambio, se DEBE ejecutar la suite de pruebas `python verify_all.py` y comprobar que todos los tests pasen al 100%.

---

## 3. Estructura de Directorios

```text
├── index.html                   # Aplicación web definitiva (SPA autónoma)
├── manifest.json                # Manifiesto para instalación PWA en móviles
├── DOCUMENTACION.md             # Documentación técnica completa de código y arquitectura
├── GEMINI.md                    # Guía de contexto e instrucciones de proyecto (Gemini)
├── CLAUDE.md                    # Guía de contexto e instrucciones de proyecto (Claude)
├── README.md                    # Presentación pública del repositorio
├── verify_all.py                # Suite de pruebas automatizadas (33 comprobaciones)
├── compartir_amigos.py          # Script de servidor LAN en Python con código QR en terminal
├── compartir_amigos.bat         # Archivo de ejecución rápida en Windows
└── Stickers Nailong/            # Banco de 42 cromos en WebP + fotos
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
   - 42 cromos reales categorizados con visor ampliado (Lightbox).
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
    - Renderizado GPU a 60 FPS sobre un canvas de pantalla completa (`#party-canvas`) sin restricciones de contención CSS (`contain: none`).
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
### 📌 Versión 9.0.0 (v9) - Integración de Stickers para WhatsApp & Descarga Universal iOS / Android
- **Botón Directo de WhatsApp en Visor Mágico y Lightbox:** Incorporado botón temático de WhatsApp (`#25D366`) con icono oficial en `#magic-modal` y `#photo-lightbox`. Invoca la Web Share API con el archivo binario WebP para enviar el sticker directamente a cualquier chat o a uno mismo, permitiendo añadirlo a "Favoritos ⭐" en el teclado de WhatsApp en 1 toque.
- **Solución Definitiva a la Descarga en iPhone (iOS Safari):** Resuelto el fallo donde en iPhone no se descargaban los stickers al pulsar "Guardar" (provocado por la restricción del motor WebKit de Safari que ignora el atributo `download` en URLs de archivos). Implementado `forceDownloadSticker()` con conversión binaria `Blob` y llamada nativa a `navigator.share()` que activa la opción "Guardar imagen" directamente en el Carrete (Fotos de Apple) o en la app Archivos.
- **Modal Interactivo de Guardado y Opciones (`#sticker-options-modal`):** Menú Claymorphism emergente que se abre al pulsar "Guardar Sticker", ofreciendo: 1) Usar en WhatsApp, 2) Descargar en el Dispositivo (Fotos / Archivos) y 3) Copiar al Portapapeles (con conversión dinámica a PNG en canvas para compatibilidad con la API de portapapeles de iOS y WhatsApp).
- **Notificaciones Toast Flotantes Duang (`#duang-toast`):** Notificación emergente accesible y animada (`showDuangToast`) que informa al instante sobre el estado de la descarga o la guía para añadir a favoritos en WhatsApp.
- **Explicación Técnica Honesta sobre Packs de WhatsApp:** Información integrada explicando las restricciones de seguridad de Meta/WhatsApp (que impiden que una web inyecte packs masivos sin una app nativa puente) y cómo utilizar alternativas como Sticker.ly o favoritos.
- **Suite de Pruebas Ampliada a 34 Verificaciones:** `verify_all.py` ampliado para validar elementos de WhatsApp, integración de descargas, portapapeles y persistencia.

---

## 6. Comandos de Verificación y Testing

Antes de realizar cualquier commit o push a la rama `main`, ejecutar siempre:

```bash
python verify_all.py
```

Si se introducen cambios de renderizado visual o interacción en el navegador, se puede validar adicionalmente con Chrome Headless mediante la suite interactiva.
