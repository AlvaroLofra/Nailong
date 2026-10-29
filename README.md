# ¡El Mundo Mágico de Nailong (奶龙)! 🦖

Sitio web interactivo y animado dedicado a **Nailong (奶龙)**, el dragón de leche amarillo creado por *Seventh Impression*.

🌐 **Enlace web en vivo:** [https://alvarolofra.github.io/Nailong/](https://alvarolofra.github.io/Nailong/)

---

## Características Principales

- **Hero Interactivo & Contador Duang:** Pancita con físicas elásticas, efectos de sonido y 9 estados de ánimo en vivo.
- **Visor Mágico de Animaciones:** Galería de escenas GIF en bucle con control de velocidad y pegatinas arrastrables.
- **Gran Álbum Polaroid:** Catálogo de 74 cromos auténticos clasificados por categorías, visor a pantalla completa y subida de fotos del usuario con guardado persistente local.
- **Botonera Musical:** 12 casillas con efectos de caricatura sintetizados en tiempo real mediante la Web Audio API.
- **Laboratorio de Superpoderes:** Ajuste de tamaño, modo camaleón con ciclo arcoíris y lanzamiento de llamaradas en canvas.
- **Minijuego "La Gran Comilona":** Juego arcade en HTML5 Canvas con pantalla completa fluida, controles táctiles y teclado.
- **Diseño Mobile-First (PWA):** Adaptación a Dynamic Island, gestos swipe y soporte para instalación en la pantalla de inicio en iOS y Android.

---

## Estructura del Proyecto

```text
├── index.html                   # Aplicación web definitiva (SPA autónoma para GitHub Pages)
├── manifest.json                # Manifiesto PWA para instalación en dispositivos móviles
├── DOCUMENTACION.md             # Documentación técnica de arquitectura, código y registros ADR
├── GEMINI.md                    # Contexto y directrices de desarrollo para modelos Gemini
├── CLAUDE.md                    # Contexto y directrices de desarrollo para modelos Claude
├── verify_all.py                # Suite de pruebas automatizadas (38 verificaciones)
└── Stickers Nailong/            # Banco de 74 cromos en WebP + foto optimizada del creador
```

---

## Historial de Versiones & Notas del Parche

### v1.0.0 - Lanzamiento Inicial
- Lanzamiento de la web interactiva con Hero elástico, Visor Mágico, Álbum Polaroid, Botonera de sonido, Laboratorio y Minijuego.

### v2.0.0 - Compartir y Conectividad Social
- Integración del dominio oficial en GitHub Pages.
- Generador de códigos QR dinámico y modal de compartir con Web Share API.

### v3.0.0 - Consolidación Arquitectónica
- Eliminación de plantillas HTML duplicadas y unificación definitiva en `index.html`.

### v4.0.0 - Sección del Creador y Persistencia Local
- Incorporación de la sección del creador con Nailong (`#creador`).
- Persistencia de fotos de usuario en `localStorage` con compresión en canvas.
- Navegación táctil por deslizamiento horizontal (swipe) en modales.

### v5.0.0 - Optimización GPU del Modo Fiesta
- Reingeniería del motor de confeti con texturas de emojis pre-renderizadas offscreen a 60 FPS constantes.

### v6.0.0 - Rendimiento de Scroll y Muñeco Flotante
- Throttling con `requestAnimationFrame` en mensajes contextuales del muñeco flotante al hacer scroll.
- Eliminación de la descarga directa en la foto del creador para preservar la experiencia integrada.

### v7.0.0 - Pantalla Completa y Correcciones Críticas
- Corrección de visibilidad en el canvas del Modo Fiesta (eliminado `contain: strict;`).
- Corrección del minijuego (`ReferenceError: keysHeld`) y nuevo control lineal continuo rápido.
- Modo pantalla completa fluido en el minijuego con Fullscreen API nativa y fallback CSS.
- Nuevo avatar de cabecera con sticker animado 3D de sonrisa radiante (`sticker_2.webp`).
- Creación de suite de pruebas automatizadas y documentación técnica.

### v8.0.0 - Perfeccionamiento de HUD y Controles Táctiles
- Marcador de puntuación y cronómetro integrados directamente en el canvas del minijuego.
- Muelle de botones táctiles dentro del contenedor para juego en pantalla completa en móviles.
- Aislamiento CSS de apilamiento en pantalla completa y rescalado proporcional de coordenadas.
- Ajuste óptico del avatar circular sin cortes de fotogramas.

### v9.0.0 - Stickers para WhatsApp y Descarga Universal
- Botón directo para compartir stickers en WhatsApp vía Web Share API y guardarlos en favoritos.
- Descarga universal compatible con iOS Safari (Carrete/Fotos) mediante Blob y fallback nativo.
- Modal interactivo con opciones de WhatsApp, guardado en dispositivo y copia al portapapeles.
- Notificaciones toast Duang flotantes en pantalla.

### v10.0.0 - Limpieza y Diagnóstico de Producción
- Eliminación definitiva de scripts auxiliares obsoletos (`.bat`, `.py`) y fotos sin comprimir.
- Verificación completa de ciclo de vida de carga en Chrome con cero errores de consola.

### v11.0.0 - Experiencia Visual, Físicas Duang y Hero Móvil
- Modal de stickers optimizado: supresión de textos explicativos secundarios y ampliación de botones y previsualización.
- Banner prominente en el Gran Álbum informando del guardado y envío a WhatsApp en un clic.
- Lightbox del creador ampliado con físicas elásticas reactivas al botón `¡Hacer Duang!` y partículas flotantes.
- Reordenación responsive del Hero: Nailong visible de inmediato en móviles tras la introducción.
- Suite de pruebas ampliada a 36 verificaciones automatizadas pasando al 100%.

### v12.0.0 - Rendimiento GPU, UX Móvil y Accesibilidad
- Carga diferida de imágenes, álbum paginado («Ver más cromos») y sin filtros de sombra ni desenfoque sobre contenido animado: mucho menos uso de GPU en Chrome y Brave.
- Las fotos que subes ahora se conservan al recargar y se pueden borrar con 🗑️.
- Álbum en 2 columnas en móvil, filtros deslizables, botones del minijuego sin duplicar y mascota menos intrusiva.
- Accesibilidad: movimiento reducido, modales con `role="dialog"` y bloqueo del scroll de fondo.
- Suite de pruebas ampliada a 37 verificaciones automatizadas pasando al 100%.

### v13.0.0 (Actual) - Colección Ampliada a 74 Cromos, Paginación Progresiva y Corrección del Creador
- Incorporación de 32 stickers nuevos (`sticker_43.webp` a `sticker_74.webp`) a `ALL_STICKERS` con títulos infantiles, categorías, efectos de audio y metadatos de fotogramas.
- Renumeración continua sin saltos de numeración (cerrados los huecos 58, 59 y 63; 75 archivos WebP en total).
- Recorte sin pérdidas del texto "GEMESNYA" en `sticker_60.webp` (240×202 px) preservando el personaje completo.
- Corrección de la verificación de foto del creador (`isCreatorItem`), desvinculándola de `id === 43` para habilitar la descarga y envío a WhatsApp del cromo 43.
- Botón «Ver más cromos» ampliado a un paso de +24 cromos en escritorio y tablet (+12 en móvil).
- Suite de pruebas ampliada a 38 verificaciones automatizadas pasando al 100%.

---

*Hecho con cariño para todos los fans de Nailong (奶龙)* 💛
