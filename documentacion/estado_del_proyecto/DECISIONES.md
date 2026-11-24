# Registro Histórico de Decisiones de Arquitectura (ADR)

> **Solo se añade, no se borra.** Si una decisión cambia, se marca la antigua como *sustituida por D-xx* y se añade una nueva. Cada decisión lleva: qué se decidió, por qué, qué alternativas había, fecha/responsable y consecuencias.
>
> Estados: **Tomada** · **Provisional** (propuesta, falta confirmar) · **Abierta** (sin decidir) · **Sustituida**.

---

## Resumen de Decisiones

| ID | Decisión | Estado | Fecha |
|---|---|---|---|
| **D-01** | Descarga universal en iOS (Safari) e integración híbrida para WhatsApp | Tomada | 2026-10-29 |
| **D-02** | Consolidación del repositorio: `index.html` único y eliminación de scripts locales | Tomada | 2026-10-29 |
| **D-03** | Reordenación responsiva del Hero en móvil y físicas Duang en Lightbox | Tomada | 2026-10-29 |
| **D-04** | Rendimiento GPU: carga diferida, paginación del álbum y Tailwind por CDN | Tomada | 2026-10-29 |
| **D-05** | Expansión de colección a 72 stickers, renumeración continua y paginación dinámica | Tomada | 2026-10-29 |
| **D-06** | Normalización de stickers a estándar WhatsApp 512×512 y herramienta `normalizar_stickers.py` | Tomada | 2026-10-29 |
| **D-07** | Segunda tanda de stickers (73–82) y descarte de duplicados | Tomada | 2026-10-30 |
| **D-08** | Exportación web a WhatsApp: Copiar al portapapeles con esquinas transparentes | Tomada | 2026-10-30 |
| **D-09** | App Android nativa oficial (`StickersNailong.apk`), ContentProvider para «Mi Selección» y descarga web | Tomada | 2026-10-30 |
| **D-10** | Pulido tipográfico en botones Android, ajuste de badges y limpieza de advertencias Lint | Tomada | 2026-10-30 |
| **D-11** | UI pulida, tipografía Fredoka, diálogo Claymorphism con renombrado y calibración de icono adaptive | Tomada | 2026-10-31 |
| **D-12** | Fusión del muro de GIFs con el álbum, botón de app en el menú y barra móvil sin desbordes | Tomada | 2026-10-31 |
| **D-13** | Corrección de eventos táctiles en diálogo de exportación y robustecimiento de ContentProvider | Tomada | 2026-10-31 |
| **D-14** | Adopción de las pautas de la biblioteca central: `AGENTS.md` canónico, changelog fuera de las instrucciones y auditoría con brechas abiertas | Tomada (A–C, E) · D pasa a D-15 | 2026-10-31 |
| **D-15** | `index.html` dividido en marcado + `css/styles.css` + 10 ficheros `js/` (scripts clásicos, sin build) | Tomada | 2026-10-31 |
| **D-16** | Retiro de stickers duplicados (1/42 y 6/14), renumeración continua a 80 y lanzamiento v3.2.2 | Tomada | 2026-10-31 |
| **D-17** | Incorporación de 16 nuevos stickers (80 → 96), 4º pack en app Android y tráiler HyperFrames | Tomada | 2026-11-01 |
| **D-18** | Reparto equilibrado de packs animados (25/24/24), estáticos en un pack, 4 packs visibles y animación en la app (v3.3.1) | Tomada | 2026-11-01 |
| **D-19** | Retiro de sticker 14 (IA), descatalogado, renumeración continua a 95 y actualización terciaria (v3.4.1) | Tomada | 2026-11-03 |
| **D-20** | «Mi Selección» en un único pack (estáticos como animados de 2 fotogramas), identificador único y número visible libre (v3.6.0) | Tomada | 2026-11-03 |
| **D-21** | Nailong 3D: modelo procedural (SDF + Surface Nets) con piel y esqueleto, visor Three.js r147 cargado bajo demanda y exportación GLB | Tomada | 2026-11-04 |
| **D-22** | Imágenes fijas de la web por clave estable (`data-sticker`) y stickers animados siempre en bucle infinito (v3.6.1) | Tomada | 2026-11-06 |
| **D-23** | Modales como `<dialog>` nativo; resto de la modernización web del plugin aplicada solo donde aporta | Tomada | 2026-11-15 |
| **D-24** | Expansión a 126 stickers (31 nuevos de TikTok), 5.º pack oficial en Android y lanzamiento público de Nailong 3D (v4.0.0) | Tomada | 2026-11-18 |
| **D-25** | Capturas de la serie solo en local, ficheros de más de 400 líneas aceptados y parte Android de `verify_all.py` declarada «no comprobada» si falta | Tomada | 2026-11-24 |

---

## D-01 · Descarga universal en iOS (Safari) e integración híbrida para WhatsApp
- **Estado:** Tomada (2026-10-29).
- **Problema:** En iPhone (iOS Safari), `<a href="..." download>` falla silenciosamente con imágenes cross-origin o blob. Además, desde un navegador web no es posible inyectar stickers directamente en la base de datos interna de WhatsApp mediante una simple URL (`whatsapp://`).
- **Decisión:** Estrategia híbrida de 3 vías:
  1. *Web Share API (`navigator.share`):* Se envía el archivo WebP binario puro sin texto mixto para evitar que Android descarte la imagen.
  2. *Descarga universal (`forceDownloadSticker`):* Uso de `fetch` + `Blob` + `navigator.share` en móviles para abrir «Guardar imagen» en el Carrete de iOS.
  3. *Portapapeles (`copyStickerToClipboard`):* Conversión offscreen en canvas a PNG para compatibilidad W3C.
- **Alternativas descartadas:** Inyección directa vía URL scheme (inexistente en la API de WhatsApp para navegadores).
- **Consecuencias:** Se garantizó descarga funcional en Safari iOS y soporte básico de compartir en Android.

---

## D-02 · Consolidación limpia del repositorio (`index.html` definitivo)
- **Estado:** Tomada (2026-10-29).
- **Problema:** Existencia de scripts de servidor local redundantes tras la publicación oficial en GitHub Pages (`compartir_amigos.bat`, `compartir_amigos.py`, `COMO_HOSTEAR.md`, `Foto nailong yo.jfif`).
- **Decisión:** Eliminar todos los scripts auxiliares del árbol de trabajo. Consolidar `index.html` como punto único e indivisible de entrada de producción.
- **Consecuencias:** Despliegue estático ultra-limpio en GitHub Pages con 0 ambigüedades.

---

## D-03 · Reordenación responsiva del Hero en móviles y físicas Duang
- **Estado:** Tomada (2026-10-29).
- **Problema:** En móviles, el avatar interactivo de Nailong quedaba al final de la primera sección (debajo de 9 botones y el contador), obligando a un scroll excesivo. En el lightbox, la foto del creador se veía pequeña y el botón de Duang carecía de animación.
- **Decisión:**
  1. Reordenar el grid con CSS grid desacoplado (`lg:col-span-6 lg:row-start-X`) para mostrar inmediatamente a Nailong en móvil sin duplicar DOM.
  2. Ampliar `#photo-lightbox` a `max-w-3xl` e implementar `triggerLightboxDuang()` con clase elástica `.animate-duang` y partículas.
  3. Simplificar `#sticker-options-modal` retirando textos de advertencia redundantes.
- **Consecuencias:** Mayor retención en la primera impresión móvil y feedback visual inmediato.

---

## D-04 · Rendimiento de GPU: carga diferida, paginación y CDN
- **Estado:** Tomada (2026-10-29).
- **Problema:** En Chrome/Brave de escritorio, la decodificación simultánea de 42 WebP animados y filtros `drop-shadow` / `backdrop-blur` disparaban el consumo de VRAM y ralentizaban la GPU.
- **Decisión:**
  1. Incorporar `loading="lazy"` y `decoding="async"`.
  2. Paginación de 12 en 12 (`GALLERY_PAGE_SIZE`) con botón «Ver más cromos».
  3. Prohibir `drop-shadow` en imágenes animadas y `backdrop-blur` sobre contenido animado (reemplazado por `box-shadow`).
  4. Mantener `#party-canvas` en 1×1 px y oculto en reposo (prohibido `contain: strict;`).
  5. Mantener Tailwind CSS por CDN (regla buildless).
- **Consecuencias:** Consumo de GPU reducido drásticamente y scroll fluido a 60 FPS en equipos modestos.

---

## D-05 · Expansión a 72 stickers, renumeración continua y paginación dinámica
- **Estado:** Tomada (2026-10-29).
- **Problema:** Había 32 WebP nuevos con huecos de numeración (faltaban 58, 59 y 63), un archivo con texto ("GEMESNYA") y el código usaba `id === 43` como centinela del creador, bloqueando el cromo real #43.
- **Decisión:**
  1. Recortar sin pérdidas `sticker_62.webp` para quitar "GEMESNYA" y renumerar a `sticker_60.webp`.
  2. Renumerar secuencialmente de 1 a 72.
  3. Desacoplar al creador usando la función semántica `isCreatorItem(item)`.
  4. Paginación dinámica: +24 en escritorio y +12 en móvil.
- **Consecuencias:** Catálogo unificado y sin colisiones con la sección del creador.

---

## D-06 · Formato Sticker de WhatsApp y herramienta `normalizar_stickers.py`
- **Estado:** Tomada (2026-10-29).
- **Problema:** Los stickers 43–72 se enviaban como fotos normales en WhatsApp porque carecían de dimensiones 512×512 y del chunk EXIF oficial `sticker-pack-id`. Además, los animados de Pillow no cumplían el estándar de fotogramas VP8 perfil 0 con chunk `ALPH`.
- **Decisión:**
  1. Desarrollar `normalizar_stickers.py` con muxer binario propio para WebP animado.
  2. Estandarizar dimensiones exactas de 512×512, peso $\le$100 KB (estático) y $\le$500 KB (animado), duración $\le$10 s e inyección EXIF.
  3. Añadir el Test 39 a `verify_all.py` para prevenir regresiones.
- **Consecuencias:** Conformidad técnica completa con los estándares de stickers de WhatsApp.

---

## D-07 · Segunda tanda de stickers (73–82)
- **Estado:** Tomada (2026-10-30).
- **Problema:** Disponibilidad de un nuevo lote de 12 animaciones de Nailong extraídas de redes sociales.
- **Decisión:** Comparar con la colección actual, descartar 2 duplicados exactos e incorporar 10 stickers normalizados (`sticker_73.webp` a `sticker_82.webp`), recortando el 75 para suprimir subtítulos incrustados.
- **Consecuencias:** Colección ampliada a 82 cromos auténticos verificados.

---

## D-08 · Exportación a WhatsApp vía portapapeles con esquinas transparentes
- **Estado:** Tomada (2026-10-30).
- **Problema:** En navegadores móviles, `ACTION_SEND` siempre entrega los archivos como imagen o GIF a WhatsApp. Al copiar al portapapeles, WhatsApp solo convierte en sticker aquellos PNGs que tienen transparencia.
- **Decisión:**
  1. Si un sticker tiene menos de 2178 píxeles transparentes (`CLIPBOARD_MIN_TRANSPARENT`), `copyStickerToClipboard()` lo recorta automáticamente con esquinas redondeadas de radio 48 px (`CLIPBOARD_CORNER_RADIUS`).
  2. «Copiar Sticker» pasa a ser la opción recomendada en la interfaz web, explicando honestamente que el botón de WhatsApp comparte como foto.
- **Consecuencias:** Los stickers pegados desde el portapapeles son reconocidos por WhatsApp como stickers con contorno blanco nativo.

---

## D-09 · App Android Nativa Oficial (`StickersNailong.apk`), ContentProvider y descarga directa
- **Estado:** Tomada (2026-10-30).
- **Problema:** En web móvil no existe ninguna API pública para instalar stickers animados directamente en el teclado de WhatsApp. La única vía oficial es una app nativa Android con `StickerContentProvider`.
- **Decisión:**
  1. Desarrollar y compilar la app nativa Android oficial (`com.eva.nailongstickers`, 26.6 MB) con 3 packs oficiales (82 stickers).
  2. Implementar «Mi Selección» (`DynamicPackManager.java`): selección libre de 3 a 30 stickers con bifurcación inteligente (separación de animados y estáticos).
  3. Ampliar `StickerContentProvider.java` para servir assets precompilados y packs dinámicos desde almacenamiento interno mediante `AssetFileDescriptor`.
  4. Alojar el APK directamente en la web con banner de descarga Claymorphism.
- **Consecuencias:** Solución definitiva al problema de stickers animados en WhatsApp para Android.

---

## D-10 · Pulido tipográfico en botones Android y limpieza Lint
- **Estado:** Tomada (2026-10-30).
- **Problema:** En dispositivos Xiaomi/HyperOS con fuentes del sistema grandes, `textAllCaps="true"` cortaba el texto de «VER STICKERS ❯». Los títulos largos de packs se truncaban y Android Studio mostraba advertencias Lint.
- **Decisión:** Configurar `android:textAllCaps="false"`, `textSize="12sp"`, ajustar padding de badges a 7dp, extraer cadenas a `strings.xml` y limpiar márgenes bidireccionales RTL.
- **Consecuencias:** Interfaz nítida en cualquier tamaño de fuente de sistema; versión `v3.0.1`.

---

## D-11 · Tipografía Fredoka, UI pulida, diálogo Claymorphism con renombrado suave y calibración de icono
- **Estado:** Tomada (2026-10-31).
- **Problema:** Los Toasts acumulaban retraso, textos de ayuda se solapaban en detalles de pack, la cuadrícula no tenía contenedor diferenciado, el diálogo de aviso no permitía personalizar el nombre del pack y el icono adaptive tenía zoom excesivo cortando barbilla y frente.
- **Decisión:**
  1. Incorporar nativamente la Google Font Fredoka (pesos 400, 500, 600, 700).
  2. Feedback táctil in-app instantáneo (`inapp_toast_pill`) con 0 ms de retraso.
  3. Envolver cuadrícula en tarjeta blanca con borde cálido (`card_stickers_container.xml`).
  4. Suprimir botón `(i)` sin utilidad.
  5. Layout vertical en pantalla de detalles para evitar solapamiento de textos.
  6. Diálogo Claymorphism con campo de renombrado y lápiz ✏️ (`dialog_import_selection.xml`) y diálogo de éxito (`dialog_success_whatsapp.xml`).
  7. Calibrar icono adaptive al 72% de escala centrado en la Safe Zone de 108 dp.
- **Consecuencias:** Experiencia táctil fluida y estética Claymorphism coherente con la web; versión `v3.1.0`.

---

## D-12 · Fusión del muro de GIFs con el álbum y barra móvil sin desbordes
- **Estado:** Tomada (2026-10-31).
- **Problema:** El muro de GIFs duplicaba contenido del álbum, alargaba el scroll y relegaba el banner del APK. En móviles estrechos (320–359 px), la cabecera desbordaba horizontalmente (+12 px).
- **Decisión:** Fusionar el Visor de GIFs como tira horizontal dentro de la sección `#galeria`, añadir acceso al visor desde el Lightbox, agregar botón directo al APK en el menú móvil y recortar desbordes con `@media (max-width: 359px)` y `overflow-x: clip`.
- **Consecuencias:** Scroll más ágil, mayor visibilidad del APK y cero desbordes horizontales; versión `v3.2.0`.

---

## D-13 · Corrección de eventos táctiles en diálogo de exportación y robustecimiento de ContentProvider
- **Estado:** Tomada (2026-10-31).
- **Problema:** Al tocar «Añadir a WhatsApp» en `dialog_import_selection.xml`, no se abría WhatsApp. El `TextView` interno (`@style/StickerPreviewButtonText`) tenía `clickable="true"` por defecto heredado de Material Components y consumía el evento táctil sin tener listener. Además, `StickerContentProvider` requería optimización en `openFile` y consultas globales para WhatsApp.
- **Decisión:**
  1. Fijar `android:clickable="false"`, `android:focusable="false"` y `android:duplicateParentState="true"` en los `TextView` internos de los botones de diálogo.
  2. Asignar listener de click redundante tanto al contenedor `FrameLayout` como al `TextView` interno.
  3. Sobrescribir `openFile` para devolver directamente el `ParcelFileDescriptor` y servir metadatos de packs dinámicos en consultas globales procedentes de WhatsApp.
  4. Sincronizar APK (`v3.2.1`, `versionCode 4`) y web (`v3.2.1`).
- **Consecuencias:** Apertura inmediata y fiable del menú nativo de WhatsApp al confirmar la exportación de selecciones personalizadas.

---

## D-14 · Adopción de las pautas de la biblioteca central (instrucciones de agente, changelog y auditoría)
- **Estado:** **Tomada** (partes A–C, 2026-10-31) · **Tomada** (partes A–C y E) · parte D resuelta en D-15.
- **Problema:** Una auditoría contra la biblioteca central (`GUIA_ARQUITECTURA_Y_CALIDAD_DE_SOFTWARE.md`, `ESTRATEGIA_LLM…`) detectó que `CLAUDE.md` y `GEMINI.md` eran dos copias idénticas de 320 líneas (forzadas por un test de `verify_all.py`), con el changelog completo dentro, una ruta absoluta de la máquina del usuario en un repositorio **público** y el prompt de arranque de la biblioteca incrustado. Un fichero de instrucciones largo se obedece peor, duplicarlo hace que diverjan y la ruta local no debía publicarse.
- **Decisión (A–C, aplicada):**
  - **A.** `AGENTS.md` es la fuente canónica (~55 líneas). `CLAUDE.md` solo importa `@AGENTS.md`; `GEMINI.md` apunta a él. Se sustituye el antiguo requisito «`CLAUDE.md` = `GEMINI.md` byte a byte» por comprobaciones de que son punteros, de que `AGENTS.md` < 200 líneas y de que no hay rutas locales versionadas (tests 33 y 35 de `verify_all.py`, que siguen siendo 44 en total).
  - **B.** El historial de versiones pasa a `CHANGELOG.md` y el mapa de bloques de `index.html` a `documentacion/notas_tecnicas/00_mapa_de_codigo.md`, sin alterar su texto.
  - **C.** La ruta de la biblioteca central y otros datos locales pasan a `CLAUDE.local.md`, ignorado por Git (`.gitignore` nuevo). Se conserva la regla «prohibido copiar ficheros de la biblioteca al proyecto sin autorización del usuario».
- **Opciones descartadas:** mantener las dos copias sincronizadas con un test (frágil y obliga a editar dos veces); enlace simbólico `CLAUDE.md → AGENTS.md` (problemas de permisos en Windows); mantener todo en `CLAUDE.md` (Anthropic recomienda < 200 líneas).
- **D (resuelta en D-15). Estructura de `index.html`:** el nivel del proyecto es **S** y D-02 fija un único `index.html`, hoy de ≈3.800 líneas (≈233 KB). La guía recomienda extraer a módulos (`<script type="module">`, CSS y datos en ficheros) a partir de ~1.500 líneas. Beneficio: menos coste de contexto para los agentes y menos riesgo al editar. Riesgo: tocar el 100 % del front, rutas de `verify_all.py` (varios tests leen `index.html`) y el despliegue en GitHub Pages. Mientras no se decida, rige D-02. Relacionado: Tailwind se carga desde `https://cdn.tailwindcss.com` sin versión fijada (su propio sitio lo desaconseja para producción) y Font Awesome sin `integrity`; ver D-04.
- **Tomada — E (2026-10-31, a petición del usuario). Ficheros de trabajo en el repositorio:** `PLAN_APP_STICKERS_WHATSAPP.md` (su cabecera dice «no subirlo a git; borrarlo al terminar»), `DeepResearch Stickers Animados Web En WhatsApp.md` y `prueba_whatsapp/index.html` (página de prueba temporal) están versionados y no están referenciados en el índice. Resolución: `DeepResearch…md` y `PLAN_APP_STICKERS_WHATSAPP.md` pasan a `archivo/` (con su `README.md`; los agentes no lo leen salvo petición) y `prueba_whatsapp/` se elimina (nada la referencia; sigue en el historial de Git).
- **Consecuencias:** instrucciones de agente cortas y sin duplicación; ninguna ruta local en el repositorio público; historial de versiones separado. Efecto colateral conocido: `DOCUMENTACION.md` mantiene el árbol de ficheros y algunas cifras desactualizadas (se corrigieron las del árbol en esta sesión); su consolidación o retirada queda para una sesión propia.

---

## D-15 · División de `index.html` en marcado + `css/` + `js/` (matiza D-02)
- **Estado:** **Tomada** (2026-10-31, a petición del usuario). Matiza D-02: sigue habiendo **un único HTML** de entrada; ya no contiene el CSS ni el JS.
- **Problema:** `index.html` tenía ≈3.800 líneas (≈233 KB). Cada edición obligaba a un agente a cargar o buscar en un fichero enorme (más tokens, más riesgo de tocar lo que no toca). La guía de arquitectura recomienda extraer a partir de ~1.500 líneas.
- **Decisión:** extraer a `css/styles.css` (estilos), `js/tailwind-config.js` (configuración de Tailwind) y 10 ficheros `js/NN-tema.js`, uno por bloque funcional ya existente. El contenido se movió **sin modificarlo** (comprobado: la concatenación de los `js/` es idéntica byte a byte al script original, y `styles.css` al `<style>` original). Se cargan como scripts clásicos, en orden, al final de `<body>`, con `?v=3.2.1` para evitar cachés viejas.
- **Funciona en GitHub Pages:** es hosting estático y las rutas son relativas; no hay build ni cambios de despliegue. Comprobado en local con `python -m http.server`: 0 errores de consola, `ALL_STICKERS` = 82, álbum, lightbox y contador responden. **No comprobado:** el sitio ya publicado (la división solo está en la rama hasta fusionar en `main`).
- **Opciones descartadas:** módulos ES (`import`/`export`): exigirían reescribir el ámbito global (los `onclick` del HTML y las funciones compartidas) con más riesgo y sin beneficio inmediato; un bundler (rompe la regla buildless).
- **Consecuencias:** `verify_all.py` construye el «código fuente completo» concatenando `index.html` + `css/` + `js/` y falla si hay un fichero sin cargar, una referencia rota o un `<script>` inline; el chequeo de sintaxis con Node pasa a ser por fichero. Seguimos en 44 comprobaciones. Si más adelante se quiere ES Modules, será una decisión nueva.
- **Resuelta en parte (2026-11-01, v3.3.3, con OK del usuario):** Tailwind fijado a `https://cdn.tailwindcss.com/3.4.17` (la misma versión que servía sin fijar; no admite `integrity` porque ese CDN no envía cabeceras CORS) y Font Awesome 6.5.1 con `integrity` SHA-512 + `crossorigin`. Se descarta compilar Tailwind (rompería «sin build»), así que el aviso de consola del CDN de Tailwind seguirá saliendo. **Sigue abierta:** convertir `js/` en módulos ES.

---

## D-16 · Retiro de stickers duplicados (1/42 y 6/14), renumeración continua a 80 y versión v3.2.2
- **Estado:** **Tomada** (2026-10-31, a petición del usuario).
- **Problema:** Se identificaron dos duplicaciones en el catálogo: `sticker_1` y `sticker_42` eran idénticos byte a byte (SHA-256 idéntico); y `sticker_6` duplicaba la animación de `sticker_14` (misma escena de Nailong relamiéndose/riendo).
- **Decisión:**
  1. Eliminar `sticker_42.webp` (conservando `sticker_1.webp` como cromo inicial de apertura) y eliminar `sticker_6.webp` (conservando `sticker_14.webp`).
  2. Renumerar secuencialmente sin saltos el catálogo de 1 a 80 (`sticker_1.webp`…`sticker_80.webp` + `creador_nailong.webp`: 81 archivos).
  3. Remapear las referencias en la web (`js/02-datos-stickers.js`, `js/03-hero.js`, `js/05-visor-magico.js`, `js/07-sonidos-y-laboratorio.js`, `js/08-minijuego.js`, `index.html` y `manifest.json`).
  4. Actualizar los 3 packs de la app Android nativa en `generar_assets.py`: *Nailong animado 1* (29 stickers), *Nailong animado 2* (30 stickers) y *Nailong estático* (21 stickers), totalizando 80 stickers y cumpliendo el límite de 3 a 30 por pack.
  5. Recompilar `StickersNailong.apk` (`versionCode 5`, `versionName "3.2.2"`, 20.3 MB), firmarlo y alojarlo en la web con badge `v3.2.2 APK` y pie `v3.2.2`.
- **Consecuencias:** Colección depurada sin elementos redundantes; suite `verify_all.py` adaptada a 80 stickers manteniendo 44/44 tests en verde.

---

## D-17 · Incorporación de 16 nuevos stickers (80 → 96), 4º pack en Android y tráiler HyperFrames
- **Estado:** **Tomada** (2026-11-01, a petición del usuario).
- **Problema:** Existían 16 stickers procedentes de TikTok en bruto (`Stickers Nailong/stickers_tiktok_temporal`, numerados 126–141) pendientes de incorporación oficial. Además, el tráiler animado promocional en `video-promo/` presentaba un fallo de renderizado con fotograma roto a los 6.2s en headless render, carecía de banda sonora y las cifras del catálogo estaban desfasadas.
- **Decisión:**
  1. *Normalización e Importación de Stickers:* Se procesaron los 16 stickers brutos con `normalizar_stickers.py --import` hacia `Stickers Nailong/sticker_81.webp` … `sticker_96.webp` (512×512, EXIF oficial de WhatsApp `sticker-pack-id`, peso ≤500 KB animados y ≤100 KB estáticos). Se eliminó la carpeta temporal residual. Se mapearon en `js/02-datos-stickers.js` con nombres, etiquetas emocionales y sonidos temáticos en español.
  2. *Reestructuración de Packs Android (v3.3.0):* Al pasar de 80 a 96 stickers (73 animados y 23 estáticos), se superaba el límite estricto de 30 stickers por pack de WhatsApp. Se dividió la colección en 4 paquetes oficiales: *Nailong Animados 1* (30 stickers), *Nailong Animados 2* (30 stickers), *Nailong Animados 3* (13 stickers) y *Nailong Estáticos* (23 stickers). Se actualizó `generar_assets.py`, `build.gradle` (`versionCode 6`, `versionName "3.3.0"`), se compiló con Gradle y se firmó `StickersNailong.apk` (28.7 MB).
  3. *Corrección y Renderizado de Tráiler HyperFrames:* Se diagnosticó que la manipulación dinámica en caliente del atributo `src` en `scene2.html` producía fallos de decodificación asíncrona en el motor headless de renderizado. Se resolvió creando ambos nodos (`#e2-dragon` y `#e2-dragon-party`) pre-renderizados en el DOM e intercambiando visibilidad de forma síncrona con GSAP `tl.set()`. Se compuso y sintetizó la banda sonora original `video-promo/assets/audio/nailong_theme.wav` (escala pentatónica de Do Mayor, 17.0s) vinculada con `<audio id="bgm">`. Se renderizó el tráiler final en MP4 (1080×1920, 30fps) y se integró en la web en `#video-promo-section`.
  4. *Sincronización Web y Verificación:* Actualización de contadores a 96, cache busters a `?v=3.3.0`, badges y footer a `v3.3.0`. Actualización de `verify_all.py` (comprobaciones de 96 stickers correlativos y versiones).
- **Consecuencias:** Colección completa de 96 cromos auténticos funcionales en web y WhatsApp; app Android nativa con 4 packs; tráiler de lanzamiento impecable integrado en la web.

---

## D-18 · Packs equilibrados, 4 packs visibles y animación en la app Android (v3.3.1)
- **Estado:** **Tomada** (2026-11-01, a petición del usuario).
- **Problema:** (1) Los packs animados se llenaban por orden de llegada (30/30/13), quedando uno casi vacío. (2) En el móvil del usuario solo se veían 3 packs: el cuarto («Nailong estático») quedaba cortado bajo el pliegue de la pantalla; el APK sí lo traía. (3) Dentro de un pack, los stickers animados se veían quietos porque `setImageURI` de Fresco no reproduce la animación.
- **Decisión:** estáticos juntos en un pack (23) y los 73 animados repartidos en orden numérico en 3 packs (25/24/24); reproducción automática en bucle con `setAutoPlayAnimations(true)`; lista de packs más compacta y «Mi Selección» sin botones cuando está vacía; `image_data_version` 1 → 2 para esquivar la caché de WhatsApp.
- **Alternativas descartadas:** dividir por tema (comida y amigos son demasiado pequeñas); mover ficheros a subcarpetas (no aporta a la app y obligaría a tocar la web y `verify_all.py`).
- **Consecuencias:** versión 3.3.1 / `versionCode 7`. Los stickers 5 y 14 (2 fotogramas) y 26 (5) siguen en packs animados por contar como animados. Pendiente: probar la importación en WhatsApp y en el POCO X7 Pro.

---

## D-19 · Retiro de sticker 14 (IA), descatalogado, renumeración continua a 95 y actualización terciaria (v3.4.1)
- **Estado:** **Tomada** (2026-11-03, a petición del usuario).
- **Problema:** El sticker número 14 del catálogo oficial (`sticker_14.webp`) fue identificado como una imagen generada por IA con contenido no acorde ni representativo del tono oficial e infantil de la serie *Seventh Impression*.
- **Decisión:**
  1. *Descatalogado sin eliminación física:* No borrar el archivo para preservar la trazabilidad, pero cambiar su nombre en `Stickers Nailong/` a `descatalogado_sticker_14.webp` para que quede formalmente fuera del catálogo activo.
  2. *Renumeración continua (1 a 95):* Reasignar secuencialmente sin saltos todos los stickers posteriores: `sticker_15.webp` a `sticker_96.webp` pasan a ser `sticker_14.webp` a `sticker_95.webp` (95 cromos activos en total + `creador_nailong.webp`).
  3. *Sincronización web:* Actualizar `js/02-datos-stickers.js` retirando la entrada 14 y ajustando los identificadores de 14 a 95; remapear los estados de ánimo en `js/03-hero.js`, `FEATURED_GIFS` en `js/05-visor-magico.js`, `SOUNDBOARD_TILES` en `js/07-sonidos-y-laboratorio.js`, `manifest.json`, disfraces y referencias en `index.html`. Actualizar contadores y cache-busters a `?v=3.4.1`.
  4. *Reequilibrio de packs y app Android:* En `generar_assets.py`, reestructurar los paquetes a 95 stickers: *Nailong animado 1* (24), *Nailong animado 2* (24), *Nailong animado 3* (24) y *Nailong estático* (23). Incrementar `IMAGE_DATA_VERSION = '3'` para refrescar la caché de WhatsApp. Recompilar `StickersNailong.apk` (`versionCode 11`, `versionName "3.4.1"`, 31.2 MB), firmarlo y alojarlo en la web con badge `v3.4.1 APK` y pie `v3.4.1`.
- **Consecuencias:** Catálogo 100% auténtico y depurado de contenido generado por IA; reparto perfecto de 24/24/24 stickers animados por pack cumpliendo estrictamente con WhatsApp; suite `verify_all.py` superada al 100% (47/47).

---

## D-20 · «Mi Selección» en un único pack, identificador único y número visible libre (v3.6.0)
- **Estado:** **Tomada** (2026-11-03, a petición del usuario).
- **Problema:** (1) WhatsApp exige packs 100 % animados o 100 % estáticos, así que una selección mixta obligaba a un diálogo («animados, estáticos o ambos») y a crear 2 packs. (2) El contador `selection_counter` solo sumaba: tras borrar packs salían «Selección 10», «11»… sin haber más.
- **Decisión:**
  1. *Un solo pack:* si la selección tiene algún animado, el pack es animado y cada estático entra con su variante de 2 fotogramas idénticos de 500 ms (`assets/nailong_estaticos_animados/`, generada con `generar_estaticos_animados.py` reutilizando el muxer de `normalizar_stickers.py`). Si todo es estático, el pack sigue siendo estático. Los 4 packs oficiales no cambian. Desaparecen el diálogo de selección mixta y el flujo de «segundo pack».
  2. *Identificador único, número visible libre:* el identificador es `seleccion_<hora en segundos>` y nunca se reutiliza; el número del nombre («Mi Selección», «Mi Selección 2»…) es el menor libre entre los packs que existen (`selection_number` en `metadata.json`; en packs antiguos se deduce de `seleccion_N`). Se elimina `KEY_COUNTER`.
- **Alternativas descartadas:** mantener el diálogo de selección mixta (confuso para el usuario); reutilizar el número como identificador (WhatsApp podría confundir un pack nuevo con otro ya añadido que se borró solo en la app); guardar solo un contador menor (no resuelve el desfase tras borrar).
- **Consecuencias:** versión 3.6.0 / `versionCode 14`; el APK crece unos 0,6 MB por las 23 variantes. El validador interno (`StickerPackValidator`) ya exige más de un fotograma en packs animados, así que cada pack mixto se valida al crearlo. **No comprobado:** importación de un pack mixto en un WhatsApp real (aceptación, estáticos quietos y envío); queda pendiente de probar en el móvil.

---

## D-21 · Nailong 3D: modelo procedural, visor Three.js r147 bajo demanda y exportación GLB
- **Estado:** **Tomada** (2026-11-04, a petición del usuario: modelo 3D interactivo fiel a los stickers, en la web y exportable a `.glb`).
- **Problema:** No había ningún modelo 3D usable. El intento de Blender del tráiler (`video-promo/trailer-3d/blender/render_nailong_eevee.py`) juntaba esferas sueltas (costuras visibles) y tenía rasgos que no salen en los stickers (cuernos, coloretes, ojos negros). Además, la web es *buildless* con scripts clásicos (D-15) y no admite subcarpetas en `js/` ni `<script>` en línea (test 1).
- **Decisión:**
  1. *Modelo procedural, no un fichero de modelo:* campo de distancia con signo (elipsoides y conos redondeados con fusión suave) medido sobre los stickers 86, 43, 18, 20, 84, 52 y 31, mallado con Surface Nets en banda estrecha en una sola piel estanca, con pesos de piel calculados desde el propio campo y un esqueleto de 12 huesos. Accesorios (ojos con iris verde, párpados, boca, orificios nasales, 3 placas oliva, garras, almohadillas) anclados a la superficie con trazado de rayos.
  2. *Three.js r147 como scripts clásicos, bajo demanda:* última versión con `build/three.min.js` y `examples/js/` (OrbitControls, GLTFExporter), así que no abre la decisión de módulos ES de D-15. Se carga desde jsDelivr con SRI (respaldo unpkg con el mismo SRI) solo cuando la sección se acerca a la pantalla; el exportador, solo al pulsar «Descargar». La malla se calcula en un Web Worker creado desde un Blob con el código del núcleo.
  3. *Animación procedural con muelles a paso fijo:* un único animador mueve el visor y hornea los 5 clips del GLB.
  4. *Ubicación y versión (decididas por el usuario):* sección `#nailong-3d` entre «¿Quién es?» y «Stickers»; **sin subir versión** (sigue v3.6.0, el CHANGELOG lo anota en «Sin publicar») para no hacer creer a la app que hay un APK nuevo; botón de descarga `.glb` público.
- **Alternativas descartadas:** reutilizar el script de Blender (rasgos y costuras incorrectos, y exige Blender); un `.glb` precalculado en el repo (binario sin trazabilidad de las proporciones; el procedural se prueba en `verify_all.py`); Three.js moderno con `import()` y mapa de importación (abre D-15 y exige `<script type="importmap">` en línea); controles de cámara propios (OrbitControls está muy probado en táctil); compilar la geometría en el hilo principal (bloquearía el scroll ~0,4 s).
- **Consecuencias:** cuatro ficheros nuevos `js/11`–`js/14` (cargados tras `js/10-inicio.js`, con `?v=` de la versión vigente), estilos `.n3d-*`, test 49 en `verify_all.py` y nota técnica `notas_tecnicas/05_nailong_3d.md`. El manejador de pantalla completa del minijuego pasa a mirar solo su propio contenedor (antes reaccionaba a cualquier elemento a pantalla completa). En el menú de escritorio el enlace «🧊 3D» se muestra desde 1280 px para no empeorar el ancho a 1024 px. **No comprobado:** rendimiento real en GPU de móvil (las pruebas usaron SwiftShader, que es CPU), Safari/iPhone real, gestos de dos dedos reales, la carga desde jsDelivr en producción y abrir el GLB en Blender/Unity/Godot.

---

## D-22 · Imágenes fijas por clave estable y stickers animados siempre en bucle (v3.6.1)
- **Estado:** **Tomada** (2026-11-06, a petición del usuario).
- **Problema:** (1) `sticker_6` se reproducía una sola vez y se congelaba en la web y en el zoom de la app: su chunk `ANIM` traía un contador de bucle 1 (el resto, 0 = infinito). La cuadrícula de la app no lo mostraba porque usa las vistas previas de 192 px, generadas aparte con bucle 0; el zoom y WhatsApp usan el fichero original. Nadie comprobaba ese contador. (2) Las 4 tarjetas de «¿Quién es Nailong?» apuntaban a `sticker_N.webp` por número; tras las renumeraciones de D-16 y D-19 quedaron desplazadas (Xiao Qi mostraba la croqueta, Bombloong a Xiao Qi y «Escamitas» el *gasp*), porque ninguna prueba ligaba la imagen a su texto.
- **Decisión:**
  1. *Bucle:* `normalizar_stickers.py` detecta un contador ≠ 0 en cualquier animado (también en los originales 1–42) y, si es el único problema, lo pone a 0 tocando solo esos 2 bytes (sin re-codificar). Test 50 de `verify_all.py`: todos los WebP animados de la web y de `assets/` de la app tienen bucle infinito.
  2. *Clave estable:* los cromos usados fuera de la galería llevan `clave` en `ALL_STICKERS` (`js/02-datos-stickers.js`) y la imagen de `index.html` se marca con `data-sticker="<clave>"`. Al renumerar, la clave viaja con su cromo (igual que el título). `aplicarStickersFijos()` corrige el `src` en ejecución y el test 51 falla si el `src` escrito no coincide con el fichero de su clave. Se mantiene el `src` escrito para que la imagen cargue aunque falle el JS.
- **Alternativas descartadas:** volver a corregir los números a mano (se desplazarían en la próxima renumeración); nombrar los ficheros por clave en vez de por número (rompe la numeración continua de D-05 y el álbum); dejar solo el `src` resuelto por JS (sin imagen si el script falla) o solo el test (avisa, pero no corrige en producción).
- **Consecuencias:** versión terciaria 3.6.1 / `versionCode 15` (APK con el sticker corregido e `image_data_version` 4 del pack *Nailong animado 1* para que WhatsApp lo refresque). Por ahora solo las 4 tarjetas usan clave; pasar el resto de referencias fijas (hero, laboratorio, botonera…) queda en `MEJORAS_PENDIENTES.md` (W11). **No comprobado:** el sticker en un WhatsApp real ni la app instalada en un móvil.

---

## D-23 · Modales como `<dialog>` nativo y criba de la modernización web
- **Estado:** **Tomada** (2026-11-15, a petición del usuario: «implementamos las que sean positivas solo»).
- **Problema:** una auditoría automática (plugin *Modern Web Guidance*) propuso 9 cambios (W12–W20) sin comprobar qué hacía ya la página. Los modales cerraban con `Escape` y clic fuera, pero no atrapaban el foco ni lo devolvían al cerrar.
- **Decisión:**
  1. *W12:* los 4 modales son `<dialog>` abiertos con `showModal()`. El `<dialog>` ocupa toda la pantalla y sigue siendo el telón oscuro, de modo que el cierre por clic fuera no depende de `closedby` ni de `::backdrop`. La visibilidad la siguen mandando `hidden`/`flex` y `style.display`; `abrirDialogo()`/`cerrarDialogo()` solo añaden el comportamiento nativo. `Escape` se atiende en el evento `cancel`.
  2. *Aviso flotante:* `showDuangToast()` cuelga el aviso del `<dialog>` abierto, porque la capa superior del navegador tapa todo lo demás.
  3. *W14, W17, W19:* aparición con `@starting-style` (solo opacidad), tráiler con `preload="none"`, `scrollbar-color` solo en Firefox.
- **Alternativas descartadas:**
  - *W13 (bloqueo de scroll solo con CSS):* soporte muy reciente; habría que mantener el bloqueo actual como respaldo y no se eliminaría nada.
  - *W15 (`content-visibility`):* medido en `#galeria`, el cálculo de diseño tarda lo mismo con y sin ella; añade riesgo de recortes y de saltos de ancla sin ganancia.
  - *W16 (animaciones ligadas al scroll):* cambia la sensación (la aparición avanzaría y retrocedería con el dedo) y la animación actual ya es barata.
  - *W18 (prioridades de carga):* ya estaba hecho (tiras con `loading="lazy"`, QR sin `src` hasta abrirse).
  - *W19 tal como venía:* habría quitado la barra de scroll «gordita» en Chrome y Edge.
  - *W20 (reescritura a `no-preference`):* sin efecto visible y con riesgo de regresiones.
- **Consecuencias:** `verify_all.py` exige 4 `<dialog>` con `aria-labelledby`, `showModal()` y el evento `cancel`, y prohíbe escuchadores manuales de `Escape` para cerrar modales. La regla crítica 6 de `AGENTS.md` se actualiza. Todo lo que deba verse encima de un modal tiene que vivir dentro de él. Sin publicar ni cambio de versión.

---

## D-24 · Expansión a 126 stickers (31 nuevos de TikTok), 5.º pack oficial en Android y lanzamiento público de Nailong 3D (v4.0.0)
- **Estado:** **Tomada** (2026-11-18, a petición del usuario).
- **Problema:**
  1. Había un lote de 92 archivos descargados de TikTok (`Stickers Nailong/TEMPORAL NUEVOS/tiktok_1714_001..092.webp`) pendiente de filtrar sin duplicar cromos existentes ni reintroducir descartes antiguos; varios cromos nuevos traían subtítulos incrustados, marcas de agua o bandas negras, y `herramientas/descargar_tiktok_consola.js` mostraba múltiples avisos en consola por URLs caducadas o bloqueadas por CORS de `performance.getEntriesByType('resource')`.
  2. Con 31 nuevos stickers (25 animados + 6 estáticos), el catálogo sube de 95 a 126 (97 animados + 29 estáticos): 97 animados superan el tope estricto de 3 packs de 30 de WhatsApp, y `generar_estaticos_animados.py` solo contemplaba 23 estáticos.
  3. **Nailong en 3D** (D-21) seguía oculto tras `body:not(.n3d-ver)` / `?3d=1`, mientras quedaban abiertas las mejoras `W9` (umbrales fijos en píxeles desfasados del muñeco acompañante) y `W10` (desborde en la barra de navegación a 1024 px al incluir el enlace 3D).
- **Decisión:**
  1. *Análisis de los 92 archivos de TikTok e importación a 126:* de los 92 ficheros se separaron 31 nuevos (`001..020` → `96..115` y `030..040` → `116..126` en orden cronológico), 57 repetidos (registrados por SHA-256 en `herramientas/stickers_vistos.json`) y 4 descartes históricos (`062`, `063`, `082`, `089`, registrados con `--descartar` en `herramientas/stickers_descartados.npz` y `stickers_vistos.json`; `062` con marca `@bubu.yuni` se probó brevemente como `sticker_127` y se volvió a descartar al comprobar en la app que es el mismo clip en formato vertical `240×320` que `sticker_68.webp`). Se recortaron limpiamente 5 cromos desde los originales y se re-normalizaron (`104` 6 % inf., `105` 10 % inf. para retirar `热热热` completo, `106` 10,4 % inf. para retirar `轮到我吃咯` completo, `120` 18 px sup./inf. sin bandas negras, `121` 7 % inf.), dejando intactos `111`, `117` y `125` para no mutilar garras, patas o muñeca. Se mantuvo la distancia visual mínima en `1..126` en `21.46` ($\ge$ `UMBRAL_DUDOSO = 20`) y se mejoró `herramientas/descargar_tiktok_consola.js` (`document.images`, `{ credentials: 'omit' }`, resumen único sin `console.warn` por fallo).
  2. *5.º pack cronológico en Android y 29 estáticos animados (`v4.0.0`, `versionCode 16`):* en `generar_assets.py` se mantiene el reparto cronológico añadiendo `nailong_animados_4` (25 stickers: los nuevos animados `98..126`) tras `_1` (24), `_2` (24) y `_3` (24), y ampliando `nailong_estaticos` a 29; `IMAGE_DATA_VERSION` sube a `'4'`. Se actualiza `generar_estaticos_animados.py` para generar y validar los 29 WebP de 2 fotogramas en `assets/nailong_estaticos_animados/` (`683.94 KB`).
  3. *Publicación oficial de Nailong en 3D y mejoras W9/W10:* se elimina la ocultación CSS `body:not(.n3d-ver)` y el uso de `localStorage` en `js/14-nailong3d-visor.js`; la sección `#nailong-3d` es visible para todos con carga perezosa (`IntersectionObserver` a 600 px) y pausa fuera de pantalla, conservando el arranque inmediato cuando hay `?3d=1` o `#nailong-3d`. Se aplican `W9` (`COMPANION_SECTION_PHRASES` en `js/04-navegacion.js` con `getBoundingClientRect().top` y frase 3D) y `W10` (enlace `🧊 3D` visible desde `lg` y menú compactado en `1024–1536 px`).
- **Alternativas descartadas:** mantener `tiktok_1714_062` (repetido de `sticker_68.webp`); recortar o descartar `111`, `117` o `125` (recortarlos mutilaba al personaje); redistribuir todos los packs animados rompiendo la composición de los 3 primeros; mantener Nailong 3D oculto tras `?3d=1`.
- **Consecuencias:** versión mayor `v4.0.0` (`versionCode 16`, `41.7 MB` / `41.732.353 bytes`), 126 stickers en web y app, 5 packs oficiales, `verify_all.py` y documentación sincronizados. **No comprobado:** la app `v4.0.0` corregida y el 5.º pack en móvil real y WhatsApp, Safari/iPhone y Firefox reales, lector de pantalla y carga en producción desde GitHub Pages / jsDelivr.

---

## D-25 · Capturas de la serie fuera de Git, ficheros grandes aceptados y verificación sin la app Android
- **Estado:** **Tomada** (2026-11-24, a petición del usuario, tras revisar el proyecto con la biblioteca de pautas del 22/11).
- **Contexto y problema:**
  1. La revisión web 2 guardó 15 capturas de episodios oficiales (`documentacion/referencias_nailong_serie/`, 1,4 MB) para calibrar el 3D. Tienen derechos de *Seventh Impression* y el repositorio es público.
  2. La biblioteca de pautas pide anotar por qué un fichero pasa de ~400 líneas. Hoy lo superan `index.html`, `css/styles.css`, `js/06`, `js/08`, `js/11`, `js/12`, `js/13`, `js/14`, `verify_all.py` y `normalizar_stickers.py`.
  3. `verify_all.py` se detenía en el test 43 en cualquier equipo sin el código de la app Android (`C:\src\nailong_stickers_app`), así que dejaba de ser una orden única que termina.
- **Decisión:**
  1. Las capturas se quedan **solo en local** (`.gitignore`). La documentación las nombra como ruta, sin enlaces que se romperían en GitHub.
  2. Se **aceptan** los ficheros grandes: cada uno es un bloque funcional único (D-15), son scripts clásicos sin *build* y dividirlos más obligaría a reordenar la carga y el ámbito global (ver la decisión abierta de módulos ES en D-15). Se revisará si un fichero pasa de ~1.500 líneas o mezcla responsabilidades.
  3. La ruta Android pasa a `ANDROID_SRC` (sobrescribible con `NAILONG_ANDROID_SRC`). Si no existe, la parte Android de los tests 43, 45, 47, 48 y 50 se salta y se lista como **NO COMPROBADO** al final.
- **Alternativas descartadas:** subir las capturas al repositorio público (riesgo de derechos de autor); dividir ahora `js/12` (riesgo alto, sin beneficio inmediato); quitar las comprobaciones Android (se perderían en el equipo que sí tiene la app).
- **Consecuencias:** quien clone el repositorio no verá las capturas; el catálogo vive en el equipo del usuario. `verify_all.py` termina siempre y dice qué no pudo comprobar. **Confirmación:** `python verify_all.py` en verde y `git status` sin `referencias_nailong_serie/`.
