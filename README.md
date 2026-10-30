# ¡El Mundo Mágico de Nailong (奶龙)! 🦖

Sitio web interactivo y animado dedicado a **Nailong (奶龙)**, el dragón de leche amarillo creado por *Seventh Impression*.

🌐 **Enlace web en vivo:** [https://alvarolofra.github.io/Nailong/](https://alvarolofra.github.io/Nailong/)

---

## Características Principales

- **Hero Interactivo & Contador Duang:** Pancita con físicas elásticas, efectos de sonido y 9 estados de ánimo en vivo.
- **Visor Mágico de Animaciones:** Galería de escenas GIF en bucle con control de velocidad y pegatinas arrastrables.
- **Gran Álbum Polaroid:** Catálogo de 82 cromos auténticos clasificados por categorías, visor a pantalla completa y subida de fotos del usuario con guardado persistente local.
- **Botonera Musical:** 12 casillas con efectos de caricatura sintetizados en tiempo real mediante la Web Audio API.
- **Laboratorio de Superpoderes:** Ajuste de tamaño, modo camaleón con ciclo arcoíris y lanzamiento de llamaradas en canvas.
- **Minijuego "La Gran Comilona":** Juego arcade en HTML5 Canvas con pantalla completa fluida, controles táctiles y teclado.
- **Diseño Mobile-First (PWA):** Adaptación a Dynamic Island, gestos swipe y soporte para instalación en la pantalla de inicio en iOS y Android.

---

## Estructura del Proyecto

```text
├── index.html                   # Aplicación web definitiva (SPA autónoma para GitHub Pages)
├── manifest.json                # Manifiesto PWA para instalación en dispositivos móviles
├── StickersNailong.apk          # Paquete de instalación directa de la App Android nativa (26.6 MB)
├── DOCUMENTACION.md             # Documentación técnica de arquitectura, código y registros ADR
├── GEMINI.md                    # Contexto y directrices de desarrollo para modelos Gemini
├── CLAUDE.md                    # Contexto y directrices de desarrollo para modelos Claude
├── verify_all.py                # Suite de pruebas automatizadas (42 verificaciones)
└── Stickers Nailong/            # Banco de 82 cromos en WebP + foto optimizada del creador
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

### 📌 Versión 3.0.0 (Actual) — App Android Nativa Oficial, «Mi Selección» y Descarga Directa

- **App Nativa Android (`StickersNailong.apk`, 26.6 MB):**
  - Aplicación Android nativa autónoma compilada y firmada con esquemas v1 y v2.
  - Integración oficial con WhatsApp mediante `StickerContentProvider` con permisos `com.whatsapp.sticker.READ` y disparo del Intent `ENABLE_STICKER_PACK`.
- **3 Packs Oficiales Preconfigurados (82 Stickers):**
  - **Nailong animado 1:** 30 stickers animados con icono de bandeja animado.
  - **Nailong animado 2:** 30 stickers animados con icono de bandeja temático.
  - **Nailong estático:** 22 stickers estáticos normalizados con etiquetas de accesibilidad.
- **Sistema «Mi Selección»:**
  - Selección interactiva de cromos sueltos (mínimo 3, máximo 30) entre cualquier pack mediante toques con checkmark visual.
  - Detección inteligente de selecciones mixtas (separación de animados y estáticos para cumplir las restricciones de WhatsApp).
  - Almacenamiento y servicio dinámico en memoria interna (`context.getFilesDir()/selection_packs/`) con identificadores incrementales únicos (`seleccion_1`, `seleccion_2`...).
- **Diseño Claymorphism Temático Nailong:**
  - Interfaz cálida en tonos crema, amarillo pastel, ámbar y naranja mandarina con tarjetas Claymorphism en relieve.
  - Insignias dinámicas de tipo, selector de carpetas («Ver stickers ❯») y botones de importación directa a WhatsApp.
- **Descarga Directa en la Web:**
  - Banner Claymorphism destacado en `#galeria` dentro de la web oficial para descargar `StickersNailong.apk` con 1 toque.
  - Suite de pruebas automatizadas actualizada a 42 comprobaciones completas.

---

*Hecho con cariño para todos los fans de Nailong (奶龙)* 💛
