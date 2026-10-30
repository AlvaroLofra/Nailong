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
   - La colección contiene exactamente 82 cromos numerados (`sticker_1.webp` a `sticker_82.webp`) más las imágenes del creador (`creador_nailong.webp`).
5. **Compatibilidad Móvil Obligatoria:**
   - La interfaz debe funcionar perfectamente en iPhone (Safari iOS con Dynamic Island y barra inferior) y Android (Chrome), respetando `viewport-fit=cover`, safe-area insets y soporte PWA.
6. **Verificación Continua:**
   - Tras cualquier cambio, se DEBE ejecutar la suite de pruebas `python verify_all.py` y comprobar que todos los tests pasen al 100%.

---

## 3. Estructura de Directorios

```text
├── index.html                   # Aplicación web definitiva (SPA autónoma)
├── manifest.json                # Manifiesto para instalación PWA en móviles
├── StickersNailong.apk          # Paquete de instalación directa de la App Android nativa (27.5 MB)
├── DOCUMENTACION.md             # Documentación técnica completa de código, ADRs y arquitectura
├── GEMINI.md                    # Guía de contexto, gobernanza y reglas de desarrollo (Gemini)
├── CLAUDE.md                    # Guía de contexto, gobernanza y reglas de desarrollo (Claude)
├── README.md                    # Presentación pública del repositorio
├── verify_all.py                # Suite de pruebas automatizadas (42 comprobaciones)
└── Stickers Nailong/            # Banco de 82 cromos en WebP + foto optimizada del creador
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

---

## 5. Historial de Actualizaciones y Notas del Parche (Changelog en Tiempo Real)

### 📌 Ciclo v1.0.0 – v1.5.0: Arquitectura Base, Interacción y Optimizaciones Web

#### v1.0.0 (Lanzamiento Inicial)
- Creación de la web interactiva con temática de Nailong (奶龙).
- Hero interactivo con físicas elásticas, contador de clics y Web Audio API.
- Visor Mágico de animaciones con control de velocidad.
- Álbum polaroid con catálogo de 42 cromos auténticos.
- Botonera musical con 12 sonidos de caricatura.
- Laboratorio interactivo con cambio de tamaño, modo camaleón y llamaradas.
- Minijuego Canvas para atrapar comida.

#### v1.1.0 (Compartir, QR y Consolidación Arquitectónica)
- Integración de enlace oficial en GitHub Pages (`https://alvarolofra.github.io/Nailong/`).
- Generador dinámico de códigos QR para escaneo instantáneo con móviles.
- Modal de compartir con botón de copia rápida al portapapeles y Web Share API nativa.
- Consolidación definitiva de `index.html` como único archivo de producción y despliegue (eliminación de duplicados y variantes redundantes).

#### v1.2.0 (Sección del Creador, LocalStorage y Optimización GPU a 60 FPS)
- Incorporación de la sección especial dedicada al creador de la web junto a Nailong (`#creador`) con foto optimizada en formato WebP (`creador_nailong.webp`).
- Persistencia local de fotos del usuario mediante `localStorage` con escalado inteligente y opción de borrado.
- Navegación táctil por deslizamiento (swipe horizontal) en el Visor Mágico y en el Lightbox de fotos.
- Reingeniería del motor de confeti del Modo Fiesta mediante pre-renderizado offscreen de texturas de emojis (`getEmojiSprite`) a 60 FPS constantes.
- Throttling con `requestAnimationFrame` en los mensajes contextuales del acompañante flotante.

#### v1.3.0 (Estabilidad Arcade, Pantalla Completa y HUD Integrado)
- **Correcciones Críticas de Estabilidad:** Solución al colapso de renderizado del Modo Fiesta (`contain: strict;` eliminado) y corrección de `ReferenceError: keysHeld is not defined` en el minijuego.
- **Deslizador Arcade Lineal y Rápido:** Movimiento lineal continuo y ágil (16px a 21px por frame) para teclado y botones táctiles virtuales.
- **Pantalla Completa Fluida:** Doble botón de pantalla completa con soporte de Fullscreen API nativa, fallback CSS (`.minigame-fullscreen-active`), soporte de tecla `Escape` y redimensionado de resolución de dibujado.
- **HUD en Canvas y Controles Táctiles Integrados:** Marcador y tiempo en vivo integrados en canvas (`#food-game-canvas`) y dock táctil (`#game-touch-dock`) accesible en pantalla completa.
- **Escalado Proporcional y Avatar de Cabecera:** Rescalado matemático dinámico de coordenadas (`resizeGameCanvas`) y encuadre óptico del avatar animado 3D (`sticker_2.webp`).

#### v1.4.0 (Integración Móvil WhatsApp, Descargas Universales y Físicas Duang)
- **Botón Directo y Descarga Universal:** Botón de WhatsApp (`#25D366`) con Web Share API y función `forceDownloadSticker()` con conversión binaria `Blob` compatible con Safari iOS (Carrete) y Android.
- **Modal de Opciones y Toasts Duang:** Menú Claymorphism emergente (`#sticker-options-modal`) y notificaciones flotantes animadas (`#duang-toast`).
- **Limpieza de Archivos Residuales:** Supresión de scripts auxiliares de red local y unificación visual con `creador_nailong.webp`.
- **Lightbox del Creador Ampliado con Físicas Duang:** Foto vertical del creador ampliada (`max-w-3xl`) con botón reactivo `.animate-duang` y partículas (`triggerLightboxDuang`).
- **Hero Móvil Prioritario:** Reordenación responsive para mostrar inmediatamente a Nailong al entrar en móviles.

#### v1.5.0 (Rendimiento GPU, Álbum Paginado, UX Móvil y Accesibilidad)
- **Rendimiento GPU:** Carga diferida (`loading="lazy"`, `decoding="async"`) en imágenes fuera de pantalla, eliminación de filtros `drop-shadow` en cuadrículas animadas y de `backdrop-blur` en menús y modales.
- **Álbum Paginado:** Paginación de 12 en 12 (`GALLERY_PAGE_SIZE`) con botón «Ver más cromos» preservando la lista completa en Lightbox.
- **Canvas de Fiesta Bajo Demanda:** `#party-canvas` se mantiene oculto y en 1×1 px mientras no hay confeti activo.
- **Minijuego Optimizado:** Sprites de emojis pre-rasterizados (`getEmojiSprite(emoji, 34)`).
- **UX Móvil y Accesibilidad:** Cuadrícula de 2 columnas en móvil, filtros en carrusel horizontal, soporte de `prefers-reduced-motion`, modales accesibles (`role="dialog"`, `aria-modal`) y bloqueo de scroll de fondo (`body.modal-open`).

---

### 📌 Ciclo v2.0.0 – v2.3.0: Expansión a 82 Stickers y Normalización Técnica WhatsApp

#### v2.0.0 (Colección Ampliada a 72 Cromos y Renumeración Continua)
- **Colección Ampliada:** Integración de 30 nuevos stickers de Nailong (`sticker_43.webp` a `sticker_72.webp`) en `ALL_STICKERS` con títulos infantiles, categorías y Web Audio.
- **Renumeración Continua:** Eliminación de huecos en la serie gráfica y recorte sin pérdidas de `sticker_58.webp` (eliminación del texto «GEMESNYA»).
- **Desacople de Centinela del Creador:** Reemplazo de la regla fija `item.id === 43` por `isCreatorItem(item)`, liberando el sticker 43 para descarga libre.
- **Paginación Dinámica:** Incorporación de `GALLERY_STEP` para avance ágil en el álbum.

#### v2.1.0 (Normalización Técnica WhatsApp 512×512 y Herramienta de Mantenimiento)
- **Normalización Estricta para WhatsApp:** Diagnóstico de compatibilidad: WhatsApp requiere dimensiones exactas de **512×512**, peso ≤100 KB (estático) o ≤500 KB (animado), duración ≤10 s y chunk EXIF `sticker-pack-id`.
- **Muxer WebP Propio para Animados:** Estructura de fotogramas completos con `ALPH` + VP8 perfil 0 mediante muxer binario dedicado en `normalizar_stickers.py` para cumplir los requisitos de WhatsApp.
- **Herramienta `normalizar_stickers.py`:** Utilidad para conversión, inyección EXIF, verificación (`--check`) e importación de nuevos lotes (`--import`).
- **Limpieza de Duplicados:** Eliminación de duplicados (48 y 53) y consolidación secuencial.

#### v2.2.0 (Segunda Tanda: Expansión a 82 Cromos Auténticos)
- **Expansión a 82 Stickers:** Adición de 10 nuevos stickers animados (`sticker_73.webp` a `sticker_82.webp`) normalizados con EXIF de WhatsApp.
- **Filtro de Duplicados y Recorte:** Descarte de duplicados exactos y recorte del sticker 75 para eliminar subtítulos de vídeo.

#### v2.3.0 (Paginación +24 Universal, Portapapeles con Transparencia y Cierre Web)
- **Paginación Unificada:** `GALLERY_STEP = 24` fijo para todos los dispositivos. Limpieza de texto de recuento de fotogramas en la interfaz y versionado visible en el footer.
- **Diagnóstico Experimental WhatsApp Web:** Identificación de que la Web Share API en navegadores móviles siempre entrega archivos como imagen o GIF a través de `ACTION_SEND`.
- **Solución Portapapeles:** Implementación en `copyStickerToClipboard()` de esquinas redondeadas transparentes (`CLIPBOARD_CORNER_RADIUS = 48px`) para stickers casi opacos (< `CLIPBOARD_MIN_TRANSPARENT`), permitiendo que al pegar en WhatsApp se reconozcan como stickers con contorno blanco nativo.
- **Ajuste de Expectativas:** Transparencia honesta en la interfaz indicando que el botón de WhatsApp envía como foto y recomendando «Copiar Sticker».

---

### 📌 Versión 3.0.0 (v3.0.0) - App Android Nativa Oficial, «Mi Selección» y Descarga Directa

- **App Nativa Android Oficial (`StickersNailong.apk`):**
  - Desarrollo y compilación del paquete de aplicación nativa Android independiente (`C:\src\nailong_stickers_app\StickersNailong.apk`, 27.5 MB), firmado con esquemas v1 y v2.
  - Implementación sobre la arquitectura oficial de WhatsApp Stickers mediante `StickerContentProvider` con permisos `com.whatsapp.sticker.READ` y disparo del Intent nativo `com.whatsapp.intent.action.ENABLE_STICKER_PACK`.
  - Sin dependencias de servicios externos ni empaquetadores de terceros: funcionamiento 100% autónomo y local.

- **3 Packs Oficiales Preconfigurados (82 Stickers):**
  1. **Nailong animado 1:** 30 stickers animados optimizados (antiguos 1–42 + parte de la tanda 43–72) con icono de bandeja animado (`tray.png`, 96×96).
  2. **Nailong animado 2:** 30 stickers animados optimizados (tandas 43–72 y 73–82) con icono de bandeja temático.
  3. **Nailong estático:** 22 stickers estáticos normalizados (≤100 KB, 512×512) con accesibilidad UTF-16 rigurosamente validada.

- **Sistema Innovador «Mi Selección»:**
  - Capacidad para que el usuario navegue por los 3 packs oficiales y marque stickers sueltos de forma interactiva (toque sobre la imagen para seleccionar con checkmark visual, pulsación larga para previsualización ampliada).
  - Selector flexible: mínimo 3 y máximo 30 stickers por exportación (límites estrictos de WhatsApp).
  - Barra de herramientas reactiva con contador de stickers seleccionados en tiempo real, botón para desmarcar todo y botón «Añadir a WhatsApp».
  - **Bifurcación Inteligente por Contenido Mixto:** Detección automática cuando la selección contiene stickers animados y estáticos combinados (WhatsApp prohíbe terminantemente mezclar ambos tipos en un mismo pack). Diálogo guiado que ofrece al usuario: 1) Importar solo los animados, 2) Importar solo los estáticos, o 3) Importar ambos tipos en dos packs independientes consecutivos.
  - Aviso explícito al usuario informando de que los packs creados deben eliminarse manualmente desde WhatsApp si ya no se desean.
  - Identificadores incrementales únicos (`seleccion_1`, `seleccion_2`...) para garantizar que WhatsApp registre cada selección como un pack completamente nuevo sin ignorar la importación.

- **Servicio de Archivos Dinámico en Almacenamiento Interno:**
  - `DynamicPackManager.java`: Creación y gestión de directorios dinámicos en almacenamiento interno (`context.getFilesDir()/selection_packs/<identifier>/`), copiado de archivos `.webp`, generación automática del archivo de metadatos `metadata.json` y del icono de bandeja `tray.png`.
  - `StickerContentProvider.java`: Ampliación del ContentProvider con coincidencia de comodín (`stickers_asset/*/*`) para servir los archivos dinámicos desde almacenamiento interno mediante `ParcelFileDescriptor` envuelto en `AssetFileDescriptor`, manteniendo el servicio sin comprimir de los assets precompilados.

- **Rediseño Claymorphism Temático Nailong en la App Android:**
  - Identidad gráfica unificada con la web oficial: paleta cálida con fondo crema suave (`#FFFDF0`), tarjetas amarillo pastel (`#FEF9C3`), acentos ámbar (`#FFD93D`), detalles naranja mandarina (`#EA580C`) y verde oficial WhatsApp (`#25D366`).
  - Tarjetas Claymorphism táctiles con sombreados suaves y relieve visual.
  - Insignias dinámicas de tipo («✨ 30 animados», «🎨 22 estáticos», «⭐ Mi Selección»).
  - Cada fila de pack incluye botón secundario «Ver stickers ❯» para navegar a la carpeta y botón principal «Añadir a WhatsApp».

- **Descarga Directa e Integración en la Web Oficial:**
  - Copia directa de `StickersNailong.apk` en la raíz de producción de la web oficial.
  - Banner Claymorphism destacado en la sección `#galeria` de `index.html` con enlace de descarga directa del APK, botón de acción destacado y guía de instalación para Android.
  - Actualización del indicador visible de versión en el pie de página a `v3.0.0`.

- **Suite de Pruebas Ampliada a 42 Comprobaciones:**
  - `verify_all.py` ampliado para validar físicamente la presencia del binario APK (>20 MB), la integración del banner Claymorphism en la web, la versión `v3.0.0` y la integridad estructural de toda la plataforma.

---

## 6. Comandos de Verificación y Testing

Antes de realizar cualquier commit o push a la rama `main`, ejecutar siempre:

```bash
python verify_all.py
```

Si se introducen cambios de renderizado visual o interacción en el navegador, se puede validar adicionalmente con Chrome Headless mediante la suite interactiva.
