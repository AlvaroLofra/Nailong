# ¡El Mundo Mágico de Nailong (奶龙)! 🦖

<p align="center">
  <img src="Stickers%20Nailong/sticker_2.webp" alt="Nailong animado" width="200" />
</p>

Sitio web interactivo y animado dedicado a **Nailong (奶龙)**, el dragón de leche amarillo creado por *Seventh Impression*.

🌐 **Enlace web en vivo:** [https://alvarolofra.github.io/Nailong/](https://alvarolofra.github.io/Nailong/)

---

## Características Principales

- **Hero Interactivo & Contador Duang:** Pancita con físicas elásticas, efectos de sonido y 9 estados de ánimo en vivo.
- **Visor Mágico de Animaciones:** Tira deslizable de 9 escenas GIF en bucle con control de velocidad y pegatinas arrastrables.
- **Sección «Stickers» + Gran Álbum Polaroid:** descarga de la app Android primero, Visor Mágico en tira y catálogo de 80 cromos auténticos clasificados por categorías, visor a pantalla completa y subida de fotos del usuario con guardado persistente local.
- **Botonera Musical:** 12 casillas con efectos de caricatura sintetizados en tiempo real mediante la Web Audio API.
- **Laboratorio de Superpoderes:** Ajuste de tamaño, modo camaleón con ciclo arcoíris y lanzamiento de llamaradas en canvas.
- **Minijuego "La Gran Comilona":** Juego arcade en HTML5 Canvas con pantalla completa fluida, controles táctiles y teclado.
- **Encuentro con el Creador:** Rincón especial al pie de la página con foto y dedicatoria junto a Nailong.
- **Diseño Mobile-First (PWA):** Adaptación a Dynamic Island, gestos swipe y soporte para instalación en la pantalla de inicio en iOS y Android.

---

## Estructura del Proyecto

```text
├── index.html                   # Aplicación web definitiva (SPA autónoma para GitHub Pages)
├── manifest.json                # Manifiesto PWA para instalación en dispositivos móviles
├── StickersNailong.apk          # Paquete de instalación directa de la App Android nativa (20.3 MB)
├── DOCUMENTACION.md             # Documentación técnica de arquitectura, código y registros ADR
├── AGENTS.md                    # Instrucciones de desarrollo para agentes de IA (CLAUDE.md y GEMINI.md apuntan a él)
├── CHANGELOG.md                 # Historial de versiones
├── verify_all.py                # Suite de pruebas automatizadas (44 verificaciones)
└── Stickers Nailong/            # Banco de 80 cromos en WebP + foto optimizada del creador
```

---

## Historial de Versiones & Notas del Parche

### 📌 Ciclo v1.0.0 – v1.5.0: Ciclo Inicial y Optimizaciones Web

#### v1.0.0 — Lanzamiento Inicial
- ¡Estreno oficial de la web interactiva de Nailong!
- Pancita elástica con sonidos Web Audio y 9 estados de ánimo interactivos.
- Visor Mágico de animaciones y Gran Álbum con 42 cromos auténticos.
- Botonera de sonidos divertidos y laboratorio interactivo de superpoderes.
- Minijuego arcade en canvas para atrapar comida.

#### v1.1.0 — Compartir, QR y Consolidación
- Estreno del enlace oficial en vivo en GitHub Pages.
- Botón de compartir con amigos y código QR interactivo para móviles.
- Consolidación de `index.html` como único archivo de producción y despliegue.

#### v1.2.0 — Sección del Creador y Optimización GPU
- Nueva sección especial: ¡el creador de la web junto a Nailong!
- Subida de fotos del usuario con persistencia en `localStorage`.
- Control táctil gestual (swipe horizontal) en visor y álbum.
- Motor de confeti a 60 FPS con sprites pre-rasterizados offscreen.

#### v1.3.0 — Pantalla Completa y Modo Arcade
- Modo pantalla completa fluido en el minijuego (doble botón y soporte tecla `Escape`).
- Movimiento arcade lineal rápido (16px a 21px por frame) en teclado y controles táctiles.
- HUD integrado en canvas con puntuación y tiempo en vivo.
- Avatar animado 3D de cabecera con la gran sonrisa de Nailong (`sticker_2.webp`).

#### v1.4.0 — Stickers Móviles y Físicas Duang
- Integración con WhatsApp y función universal de guardado para iPhone (Carrete) y Android.
- Menú Claymorphism emergente de opciones y avisos Toast flotantes.
- Foto del creador ampliada con botón interactivo de rebote elástico `.animate-duang`.
- Prioridad responsive en móvil: Nailong aparece inmediatamente en el Hero.

#### v1.5.0 — Rendimiento GPU, Álbum Paginado y Accesibilidad
- Carga diferida (`loading="lazy"`) y supresión de filtros `drop-shadow` y `backdrop-blur`.
- Álbum paginado con botón «Ver más cromos» (12 iniciales + 12 por clic).
- Álbum en 2 columnas en móviles, filtros en carrusel deslizable y controles táctiles no duplicados.
- Soporte para accesibilidad y modo de movimiento reducido (`prefers-reduced-motion`).

---

### 📌 Ciclo v2.0.0 – v2.3.0: Expansión a 82 Stickers y Normalización WhatsApp

#### v2.0.0 — Colección Ampliada a 72 Cromos
- 30 nuevos stickers animados incorporados a la colección oficial.
- Renumeración secuencial continua y recorte del texto foráneo en `sticker_58.webp`.
- Desacople definitivo de la foto del creador (`isCreatorItem`).
- Paginación dinámica con paso adaptativo (`GALLERY_STEP`).

#### v2.1.0 — Normalización Técnica WhatsApp y Muxer Animado
- Normalización rigurosa de formato: 512×512, peso estricto (≤100 KB estático / ≤500 KB animado) y chunk EXIF de WhatsApp inyectado.
- Desarrollo de muxer WebP animado propio (`build_animated`) para compatibilidad WhatsApp.
- Herramienta interna `normalizar_stickers.py` para mantenimiento, auditoría e importación.

#### v2.2.0 — Segunda Tanda: Expansión a 82 Stickers
- 10 nuevos stickers animados añadidos para alcanzar los 82 cromos coleccionables.
- Descarte de duplicados y optimización gráfica.

#### v2.3.0 — Paginación +24 y Portapapeles con Transparencia
- Paginación fija de +24 cromos en todos los dispositivos.
- «Copiar Sticker» optimizado con esquinas redondeadas transparentes (`CLIPBOARD_CORNER_RADIUS = 48px`): al pegarse en WhatsApp se reconoce como sticker con contorno blanco nativo.
- Claridad técnica en la interfaz y versionado visible en el pie de página.

---

### 📌 Ciclo v3.0.0 – v3.2.3: App Android Nativa Oficial, «Mi Selección» y Experiencia Pulida

#### v3.0.0 — App Android Oficial y «Mi Selección»
- Estreno de la aplicación nativa oficial para Android (`StickersNailong.apk`).
- 3 packs oficiales con los 82 stickers para añadir a WhatsApp (2 animados y 1 estático).
- Creador personalizado «Mi Selección»: toca cualquier sticker para armar tu propio pack a medida.
- Separación inteligente de stickers animados y estáticos con importación guiada.
- Tarjetas táctiles Claymorphism y banner de descarga directa con 1 toque en la web.

#### v3.0.1 — Ajustes Visuales y Tipográficos
- Botones adaptados para evitar saltos de línea con fuentes grandes del sistema.
- Títulos de los packs ampliados para mostrar el nombre completo sin cortes.
- Compatibilidad visual y márgenes optimizados para todas las pantallas Android.

#### v3.1.0 — Tipografía Fredoka, Renombrado y Mejoras Visuales
- Tipografía oficial Fredoka integrada en toda la app para un estilo más tierno y redondeado.
- Diálogo para renombrar tu pack de «Mi Selección» con botón de lápiz antes de exportarlo.
- Aviso visual instantáneo al seleccionar stickers, sin esperas ni avisos acumulados.
- Cuadrícula de stickers enmarcada en una tarjeta limpia con borde amarillo cálido.
- Mensaje festivo de confirmación al añadir el pack a WhatsApp.
- Icono de la app centrado y calibrado para lucir perfecto en cualquier lanzador de Android.

#### v3.2.0 — Sección de Stickers Unificada y Barra Móvil Optimizada
- Sección de stickers unificada: app, tira horizontal del Visor Mágico y álbum Polaroid juntos.
- Botón en el visor ampliado del álbum para abrir directamente las 9 escenas virales en el Visor Mágico.
- Acceso directo a la descarga de la app en la barra superior y en el menú móvil.
- Cabecera compactada para pantallas móviles estrechas sin desbordes laterales.

#### v3.2.1 — Exportación a WhatsApp Fluida y Reorganización Web
- Solucionada la apertura del menú de WhatsApp al exportar desde «Mi Selección».
- Respuesta táctil inmediata al pulsar los botones en las ventanas de confirmación y éxito.
- Entrega de archivos de stickers más rápida y directa a WhatsApp en cualquier dispositivo.
- Reorganización de la web: sección del creador con Nailong ubicada al final de la página.
- Paquete `StickersNailong.apk` actualizado y verificado al 100% con 44 pruebas de calidad.

#### v3.2.2 — Colección Optimizada a 80 Stickers y Sincronización Total
- Retiro de stickers duplicados: eliminados los duplicados `sticker_6` y `sticker_42`.
- Renumeración continua del catálogo completo a exactamente 80 cromos oficiales.
- Sincronización de estados de ánimo, sonidos, Visor Mágico y minijuego en la web.
- Actualización de la app Android (`StickersNailong.apk` v3.2.2) con los tres paquetes oficiales optimizados.

#### v3.2.3 (Actual) — Corrección de Peso de APK y Cifras en la Web
- Corrección de la etiqueta del botón de descarga del APK en la web oficial: muestra el peso real de 20 MB (en lugar del valor histórico de 26 MB).
- Actualización de textos informativos: cifra ajustada a 80 stickers oficiales (59 animados + 21 estáticos) en el banner de la app y filtros del álbum.

---

*Hecho con cariño para todos los fans de Nailong (奶龙)* 💛
