# Nota Técnica 04: Minijuego Canvas a 60 FPS y Optimización de Rendimiento GPU

> **Subsistema:** Motor de físicas de alimentos, partículas y aceleración gráfica  
> **Implementación:** `index.html` (Canvas 2D, CSS Transforms)  
> **Comprobación:** Pruebas 32 a 36 en `verify_all.py`

---

## 1. Ciclo de Ejecución Arcade a 60 FPS
El minijuego «¡La Gran Comilona de Nailong!» (`#food-game-canvas`) utiliza un bucle de animación gobernado por `requestAnimationFrame` desacoplado del refresco del monitor mediante cálculo de delta time:

- **Duración:** Partidas de 30 segundos cronometradas en tiempo real.
- **Generación de Entidades:** Frecuencia aleatoria controlada para spawn de alimentos positivos (sandías 🍉, hamburguesas 🍔, galletas 🍪, leche 🥛) y bombas negativas de Bombloong 💣.
- **Físicas y Colisiones:** Detección de colisiones circular (radio euclidiano) para maximizar la tasa de cálculo por frame.

---

## 2. Movimiento Lineal Continuo Rápido
A diferencia de los controles basados en inercia con aceleración suave que producían lentitud en móviles:
- El personaje se desplaza a velocidad lineal constante (16 px a 21 px por frame).
- El estado de las teclas y botones táctiles se mantiene en un conjunto reactivo `keysHeld`.
- La respuesta a las flechas (`ArrowLeft`/`ArrowRight`), teclas (`A`/`D`) y botones táctiles del dock virtual (`#btn-left`, `#btn-right`) es inmediata sin rampas de aceleración lentas.

---

## 3. Pre-rasterizado Offscreen de Emojis (`getEmojiSprite`)

Renderizar texto o emojis directamente en un loop de 60 FPS con `ctx.fillText(emoji, x, y)` genera sobrecarga de GPU y renderizado inconsistente según el sistema operativo:

### Solución Implementada:
- Se mantiene una caché de lienzos fuera de pantalla (*offscreen canvas*).
- Al arrancar, cada emoji se dibuja una única vez en su propio lienzo auxiliar a alta resolución con fuentes de respaldo universales (`Segoe UI Emoji`, `Apple Color Emoji`, `Noto Color Emoji`).
- En cada fotograma del juego o de la fiesta de confeti, se dibuja el sprite pre-rasterizado mediante `ctx.drawImage(sprite, ...)`, operación acelerada por hardware nativo en cualquier GPU móvil.

---

## 4. Gestión del Canvas de Fiesta (`#party-canvas`) y Pantalla Completa

### Prevención de Fugas de VRAM:
- `#party-canvas` cubre el 100% de la ventana (`position: fixed; inset: 0; pointer-events: none`).
- Para evitar que los navegadores móviles reserven texturas de varios megapíxeles continuamente en la GPU, el canvas se mantiene en dimensiones `1×1 px` con `display: none`.
- Solo al presionar el botón «Modo Fiesta» o al ganar una partida, el canvas se redimensiona a las dimensiones reales de la ventana (`window.innerWidth`, `window.innerHeight`) y se inicia el loop de confeti, apagándose y ocultándose automáticamente tras finalizar la animación.

### Pantalla Completa Dual:
- Se implementa compatibilidad nativa mediante Fullscreen API (`container.requestFullscreen()`).
- Para navegadores iOS o WebView que restringen Fullscreen API, se implementa una clase de respaldo CSS `.minigame-fullscreen-active` que fija el contenedor a `position: fixed; inset: 0; z-index: 9999;` garantizando pantalla completa universal en cualquier dispositivo.
