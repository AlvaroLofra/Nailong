# ¡El Mundo Mágico de Nailong (奶龙)! 🦖✨

Sitio web interactivo y animado dedicado a **Nailong (奶龙)**, el dragón de leche amarillo más famoso y viral de la animación 3D china creado por *Seventh Impression*.

🌐 **Enlace web en vivo:** [https://alvarolofra.github.io/Nailong/](https://alvarolofra.github.io/Nailong/)

---

## 🌟 Características de la Web

- 🦖 **Hero Interactivo & Contador Duang:** Haz clic o toca la pancita de gelatina de Nailong para hacerle cosquillas con físicas elásticas, efectos de sonido y 9 estados de ánimo en tiempo real.
- 🎬 **Muro de GIFs Virales:** 9 animaciones en bucle con el **Visor Mágico** interactivo (control de velocidad 🐢/🚀 y estampador de pegatinas arrastrables).
- 📸 **Gran Álbum Polaroid:** Catálogo completo de sus 42 fotos y stickers animados clasificados por categorías (*En Movimiento*, *Comilonas*, *Caritas*, *Bailes*, *Amigos*) con visor a pantalla completa y subida de fotos personalizadas.
- 🔊 **Botonera Musical (Soundboard):** 12 pads animados con sonidos de caricatura sintetizados mediante la Web Audio API.
- ⚡ **Laboratorio de Superpoderes:** Cambia su tamaño (de bebé a gigante), activa el modo camaleón con ciclo arcoíris y lanza llamaradas de partículas.
- 🍗 **Minijuego "La Gran Comilona":** Juego arcade en HTML5 Canvas para atrapar comida y esquivar bombas, adaptado a teclado, ratón y controles táctiles para móviles.
- 📱 **Diseño 100% Mobile First (iOS y Android):** Compatible con Dynamic Island, notches, gestos de swipe y soporte como PWA (*Añadir a la pantalla de inicio*).

---

## 📂 Estructura del Proyecto

```text
├── index.html                   # Página principal interactiva definitiva (GitHub Pages)
├── manifest.json                # Web App Manifest para PWA (móviles)
├── DOCUMENTACION.md             # Documentación técnica completa y detallada de todo el código
├── GEMINI.md                    # Contexto e instrucciones del proyecto para modelos Gemini
├── CLAUDE.md                    # Contexto e instrucciones del proyecto para modelos Claude
├── verify_all.py                # Suite de pruebas automatizadas (34 tests)
├── Stickers Nailong/            # Colección de los 42 stickers reales (.webp)
├── compartir_amigos.bat         # Launcher 1-clic para compartir por Wi-Fi local
├── compartir_amigos.py          # Servidor LAN local en Python
└── COMO_HOSTEAR.md              # Guía de despliegue y alojamiento
```

---

## 📋 Historial de Versiones & Notas del Parche

- **v1.0.0**: Lanzamiento inicial de la web interactiva con todas las secciones principales.
- **v2.0.0**: Integración de enlace oficial a GitHub Pages y código QR interactivo.
- **v3.0.0**: Consolidación arquitectónica definitiva en `index.html`.
- **v4.0.0**: Sección dedicada del creador (`#creador`), persistencia en LocalStorage y swipe táctil.
- **v5.0.0**: Optimización a 60 FPS del Modo Fiesta con texturas GPU offscreen.
- **v6.0.0**: Throttling de scroll con `requestAnimationFrame` y pulido de físicas.
- **v7.0.0**:
  - 修复 / Arreglo crítico de visibilidad del Modo Fiesta (eliminado `contain: strict;`).
  - 修复 / Arreglo crítico del Minijuego (corrección de `ReferenceError: keysHeld is not defined`).
  - ⚡ Deslizador lineal continuo y rápido para control arcade ágil.
  - 🖥️ Modo Pantalla Completa fluido para el Minijuego (Fullscreen API + fallback CSS + soporte Escape).
  - 🦖 Nuevo avatar de cabecera con sticker animado 3D de sonrisa radiante (`sticker_2.webp`) llenando el círculo.
  - 📖 Creación de `DOCUMENTACION.md`, `GEMINI.md` y `CLAUDE.md`.
  - 🧪 28 pruebas automatizadas en `verify_all.py`.
- **v8.0.0**:
  - 📊 Marcador de puntos y cronómetro HUD integrados en el canvas del minijuego para visibilidad en pantalla completa.
  - 📱 Muelle de botones táctiles integrado (`#game-touch-dock`) para jugar en pantalla completa en móviles y tablets.
  - 🚀 Corrección de aislamiento CSS en pantalla completa (eliminación de trampas de apilamiento en elementos visibles).
  - 📐 Rescalado dinámico proporcional de coordenadas (`playerX` y alimentos) al redimensionar la pantalla.
  - 🎨 Encuadre óptico perfeccionado del avatar 3D en la cabecera sin recortes de frente en ningún fotograma.
  - 🎉 Efecto visual de confeti y muslitos instantáneo en el modo fiesta desde el primer fotograma.
- **v9.0.0 (Actual)**:
  - 💬 **Botón de WhatsApp integrado:** Envío de stickers directo a WhatsApp vía Web Share API para guardar en "Favoritos ⭐" en 1 toque.
  - 🍏 **Solución definitiva a descargas en iPhone (iOS Safari):** Corrección de la omisión del atributo `download` en WebKit mediante guardado en Fotos / Carrete nativo y fallback Blob URL.
  - 🗂️ **Modal de Opciones de Guardado:** Menú accesible con opciones para WhatsApp, descarga a Fotos/Archivos y copia al portapapeles.
  - 🍞 **Notificaciones Toast Duang:** Feedback visual interactivo en pantalla para guiar en las descargas y favoritos.
  - 🧪 **34 pruebas automatizadas** en `verify_all.py`.

---

*Hecho con cariño para todos los fans de Nailong (奶龙)* 💛🍼
