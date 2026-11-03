# Changelog — El Mundo Mágico de Nailong (奶龙)

Historial técnico de versiones. Formato inspirado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/); versionado [SemVer](https://semver.org/lang/es/).
Las notas **para el público** están en [`README.md`](README.md); las decisiones de arquitectura, en [`documentacion/estado_del_proyecto/DECISIONES.md`](documentacion/estado_del_proyecto/DECISIONES.md).

> Este contenido se trasladó el 2026-10-31 desde `CLAUDE.md`/`GEMINI.md` (D-14) sin modificar el texto de las versiones, para que los ficheros de instrucciones de los agentes sigan siendo cortos.

## [3.5.0] — 2026-11-03
Actualización secundaria (`v3.5.0`, `versionCode 12`): aplicación de las mejoras pendientes de interfaz y experiencia (`A8`–`A13`, `W6`–`W7`), nuevo zoom central con transición animada en los packs de la app Android y pantalla dedicada para revisar los stickers de «Mi Selección».

- **App Android (`StickersNailong.apk` v3.5.0, `versionCode 12`):**
  - **Zoom ampliado en el centro con transición (`StickerPackDetailsActivity`, `StickerPreviewAdapter`):**
    - Al mantener pulsado cualquier sticker dentro de un pack, ahora se amplía en grande (`230dp × 230dp`) en el centro de la pantalla dentro de una tarjeta *clay* con animación elástica (`OvershootInterpolator`) desde su celda original hasta el centro.
    - Capa superpuesta a pantalla completa (`#sticker_zoom_overlay`, `clickable="true"`, `focusable="true"`) que oscurece el fondo y bloquea los toques accidentales sobre la cuadrícula para que tocar fuera cierre el zoom sin seleccionar ni deseleccionar stickers.
    - Añadido botón inferior explícito **«✕ Cerrar vista ampliada»** (`#btn_close_zoom`), cierre al tocar cualquier punto fuera de la tarjeta o con el botón Atrás del sistema, y banner fijo superior **«🔍 Mantén pulsado un sticker para hacer zoom · Toca para elegir»** (`#zoom_top_banner_hint_view`).
  - **Revisión y botonera de «Mi Selección» (`activity_sticker_pack_list.xml`, `StickerPackListActivity`):**
    - Nuevo botón **«Ver (N) ❯»** (`#btn_view_selection`, fondo crema con borde naranja `btn_clay_cream.xml`) situado junto a **«🗑️ Vaciar»** de izquierda a derecha en la fila superior, con **«Importar a WhatsApp»** a ancho completo debajo.
    - El botón **«🗑️ Vaciar»** pasa a un tono rojizo/anaranjado de alerta (`btn_clay_danger.xml`).
    - Al pulsar **«Ver (N) ❯»**, se abre la cuadrícula interactiva con los stickers seleccionados hasta el momento (`EXTRA_IS_CURRENT_SELECTION`), permitiendo hacerles zoom con pulsación larga o tocarlos para quitarlos de la selección en vivo.
  - **Mejoras visuales y de rendimiento (`A8`–`A13`):**
    - **A8:** Esquinas redondeadas reales en el WebP animado del diálogo «¡App actualizada!» (`dialog_update_tip.xml`) usando `RoundingParams.fromCornersRadius(20dp).setOverlayColor(#FFFDF0)` en Fresco.
    - **A9:** El icono `+` del botón «Añadir» en la lista de packs se tiñe de blanco puro (`setColorFilter(Color.WHITE)`), destacando sobre el fondo verde WhatsApp.
    - **A10:** El botón de confirmación de `dialog_import_selection.xml` pasa a **«Añadir»** (`14sp`) para que nunca se corte en pantallas estrechas.
    - **A11:** Al crear un pack de «Mi Selección», `DynamicPackManager` copia también las vistas previas ligeras de 192 px desde `assets/previews/<pack>/<archivo>` a `files/selection_packs/<id>/previews/`, reduciendo el uso de CPU y memoria al mostrar packs personalizados.
    - **A12:** Los packs creados con «Mi Selección» se distinguen en la lista principal con fondo crema cálido (`card_clay_selection.xml`), insignia naranja **«⭐ Tuyo»** (`badge_yours_clay.xml`) y el recordatorio discreto **«🗑️ Mantén pulsado para borrar este pack»**.
    - **A13:** El botón «Ver stickers ❯» (`btn_clay_secondary.xml`) estrena un amarillo cremoso intermedio (`#FDE68A`, `nailong_yellow_creamy`) con mayor contraste sobre las tarjetas blancas.
- **Web (`index.html`, `js/10-inicio.js`, `verify_all.py`):**
  - **W6:** En ordenador, al pulsar **«Copiar enlace»** (`#apk-copy-link-btn`) en el banner del APK, además de copiar la URL al portapapeles se despliega una tarjeta *clay* (`#apk-qr-box`) con el código QR directo a `StickersNailong.apk` para escanearlo con la cámara del móvil.
  - **W7:** El test 45 de `verify_all.py` ahora comprueba que todas las referencias locales a `css/styles.css` y `js/*.js` en `index.html` lleven exactamente el sufijo `?v=<versionName>` vigente (`?v=3.5.0`), más el nuevo test 48 que verifica la tarjeta QR del APK.
- **Verificación:**
  - `verify_all.py`: 48 de 48 pruebas superadas al 100%.

## [3.4.1] — 2026-11-03
Actualización terciaria: retiro y descatalogado del antiguo sticker 14 (generado por IA), renumeración correlativa sin saltos a 95 cromos oficiales y reequilibrio de los 4 packs de la app Android nativa.

- **Catálogo de Stickers (`Stickers Nailong/`):**
  - Retirado del catálogo oficial el antiguo `sticker_14.webp` (generado por IA y desalineado con la estética oficial). Conservado en disco con el nombre `descatalogado_sticker_14.webp`.
  - Renumeración correlativa secuencial de los stickers 15 a 96 pasando a ser 14 a 95 (`sticker_1.webp` a `sticker_95.webp` + `creador_nailong.webp`), conformando exactamente 95 cromos activos sin saltos.
- **Web:**
  - Actualizado `js/02-datos-stickers.js` reflejando los 95 cromos reales y sus fotogramas exactos.
  - Remapeadas las referencias en `js/03-hero.js` (estados de ánimo), `js/05-visor-magico.js` (`FEATURED_GIFS`), `js/07-sonidos-y-laboratorio.js` (`SOUNDBOARD_TILES`), `js/04-navegacion.js`, `js/06-album-y-descargas.js`, `manifest.json` e `index.html`.
  - Actualizados contadores a 95 cromos, badge `v3.4.1 APK`, pie de página `v3.4.1` y cache-busters `?v=3.4.1`.
- **App Android (`StickersNailong.apk` v3.4.1, `versionCode 11`):**
  - Reajustados los 4 paquetes en `generar_assets.py`: *Nailong animado 1* (24), *Nailong animado 2* (24), *Nailong animado 3* (24) y *Nailong estático* (23), totalizando 95 stickers.
  - Incrementado `IMAGE_DATA_VERSION = '3'` para forzar la actualización de caché en WhatsApp.
  - Actualizado `build.gradle` con `versionCode 11` y `versionName "3.4.1"`.
  - Recompilada en release con Gradle, alineada con `zipalign`, firmada con la clave debug oficial y copiada a la raíz web (`StickersNailong.apk`, 31.2 MB).
  - Sincronizado `version.json` con fecha `2026-11-03`, código 11, versión 3.4.1 y 31.2 MB.
- **Verificación:**
  - `verify_all.py` adaptado a 95 stickers y v3.4.1: 47 de 47 pruebas superadas al 100%.
  - `normalizar_stickers.py --check`: 95 de 95 stickers conformes con WhatsApp.

## [3.4.0] — 2026-11-02
Evolución completa del tráiler oficial con HyperFrames, eliminación total de caracteres chinos en web, app y vídeo, incorporación del crédito «Desarrollado por Álvaro Lofra», mejoras en la botonera y laboratorio, y pantalla completa con luz ambiental.

- **Tráiler oficial v2 (`video-promo/nailong_trailer_v2.mp4`):**
  - Consolidada la estructura de `video-promo/`: eliminados bocetos obsoletos y vídeos antiguos de v1; `v2` pasa a la raíz preservando `trailer-3d/` intacto.
  - Mayor protagonismo a la app nativa: escena demo enriquecida (7.0s) mostrando la pantalla principal, pulsación del botón «+ Añadir» de un pack predeterminado, entrada a la carpeta, selección de 3 stickers individuales (con feedback visual de checks y contador dinámico `1/30` -> `2/30` -> `3/30`) e importación a WhatsApp.
  - Conservado intacto el fragmento de la conversación de WhatsApp con Nailong riéndose (`sticker_72`) y doble check azul.
  - Orden cronológico optimizado a 32s (16 compases a 120 BPM): Saludo -> Pancita -> Minijuego (inmediatamente tras "tócame la pancita") -> 96 stickers -> Álbum coleccionable -> App y WhatsApp -> Pantalla final.
  - Fotograma 0 y portada actualizados con `sticker_2.webp`.
  - Pantalla final con el crédito «Desarrollado por Álvaro Lofra» en tipografía Fredoka mediana.
  - Fondo con decoraciones exteriores (burbujas y flores SVG) y transiciones elásticas nube/pancita.
- **Web:**
  - **Vídeo en pantalla completa sin cortes y luz ambiental:** reglas CSS (`object-fit: contain !important;`) para evitar recortes 16:9 en pantallas panorámicas. Contenedor con efecto ambilight en tiempo real (`#video-ambient-canvas`) y botón «📺 Pantalla Completa con Luz Ambiental».
  - **Botonera musical:** 12 sonidos únicos sintetizados con Web Audio API (añadidos `slurp`, `bleh`, `pirate`, `run`, `tail`, `surprise`).
  - **Laboratorio de superpoderes:** nuevos trajes interactivos (Alegre, Pirata, Superalas, Palomitas, Bailarín, Bebé), lluvia de muslitos de pollo crujiente (`feedLabChicken()`) y modo gravedad cero espacial (`toggleLabZeroGravity()`).
  - **Minijuego:** velocidad de desplazamiento con las flechas del teclado suavizada a un ritmo arcade más cómodo y preciso (`Math.max(10, Math.round(foodCanvas.width * 0.013))`).
  - **Pie de página:** añadido el crédito `v3.3.4 · Desarrollado por Álvaro Lofra`.
  - **Eliminación de caracteres chinos:** supresión de `(奶龙)`, `(小七)`, `(暴暴龙)` en títulos, encabezados, metadatos, `manifest.json` y scripts JavaScript.
- **App Android (`StickersNailong.apk` v3.3.4, `versionCode 10`):**
  - Eliminación de todas las carpetas y recursos en chino (`values-zh-rCN`, `values-zh-rTW`, `contents.json` y `strings.xml`).
  - Etiqueta de versión actualizada con autoría: `v3.3.4 · Desarrollado por Álvaro Lofra` en la pantalla principal.
  - Recompilada con Gradle en release, alineada con `zipalign` y firmada con la clave debug oficial (`SHA-256: 04b83add...abb2`).
  - Sincronizado `version.json` (31.1 MB, 2026-11-02).

## [3.3.3] — 2026-11-01
Se aplican las mejoras de interfaz apuntadas en la revisión de la 3.3.2 (A1–A7, W1–W5) y se corrigen los fallos que salieron al probarlas.

- **App Android (`StickersNailong.apk` v3.3.3, `versionCode 9`):**
  - **A1:** al cancelar en WhatsApp ya no sale «actualiza WhatsApp», sino «El pack no se añadió» con los botones **Reintentar** y **Cerrar** (`StickerPackNotAddedMessageFragment.newInstance(id, nombre)`). Si no hay WhatsApp instalado, el aviso lo dice claro.
  - **A2:** los packs de «Mi Selección» aparecen al final de la lista (también tras reiniciar la app) y se borran manteniéndolos pulsados, con un diálogo *clay* que avisa de que dejarán de funcionar en WhatsApp (`dialog_delete_pack.xml`, `DynamicPackManager.deleteDynamicPack`). Al crear uno, un aviso explica cómo borrarlo. Los packs oficiales no se pueden borrar.
  - **A3:** el aviso de versión nueva muestra el peso y la fecha («31 MB · 1 nov 2026»). `version.json` añade `sizeMB` y `date`.
  - **A4:** tocar el número de versión busca actualizaciones a mano: el número cambia a «Buscando actualizaciones…» y luego dice «Ya tienes la última versión ✨», «No se pudo comprobar» o abre el aviso de versión nueva (`UpdateChecker.Listener.onNoUpdate/onCheckFailed`).
  - **A5:** el aviso «¡App actualizada!» enseña un Nailong animado (vista previa de 192 px) en vez del icono 🔄.
  - **A6:** la primera vez que se abre un pack sale una pista: «Toca para elegir · mantén pulsado para ampliar».
  - **A7:** «Preparando tu pack…» usa un diálogo *clay* con indicador de progreso naranja (`dialog_progress_clay.xml`).
  - **Fallos encontrados al probar:**
    - Los `Button` con fondo propio salían teñidos del amarillo del tema Material (`colorPrimary`): «Importar a WhatsApp» se veía amarillo con letras blancas y los botones de los diálogos nuevos, invisibles. Ahora llevan `app:backgroundTint="@null"` y muestran sus colores (verde, crema con borde).
    - La lista de packs, dentro de un `ScrollView`, no crecía al añadir un pack (el quinto quedaba recortado). Pasa a `NestedScrollView`.
    - Si se cancelaba en WhatsApp al importar «Mi Selección», la app vaciaba la selección y felicitaba igualmente. Ahora solo lo hace si WhatsApp confirma (`RESULT_OK`).
    - La comprobación de WhatsApp sustituía la lista del adaptador por una copia, y añadir o borrar packs las desincronizaba.
    - Las miniaturas de los packs de «Mi Selección» salían vacías (buscaban una vista previa que no existe). Además, ahora se ordenan por número (`seleccion_2` antes que `seleccion_10`).
    - El subtítulo «Mi Selección: N / 30» usa el límite real (`MAX_STICKERS`).
- **Web:**
  - **W1:** el banner de la app muestra «Novedades de la v3.3.3», leídas de `version.json` (lo mismo que enseña la app).
  - **W2:** el peso del botón «Descargar APK» sale de `version.json`; el test 46 de `verify_all.py` comprueba que la etiqueta, `sizeMB` y el fichero real coinciden.
  - **W3 (D-15):** Tailwind fijado a `cdn.tailwindcss.com/3.4.17` (sin `integrity`: ese CDN no envía CORS) y Font Awesome 6.5.1 con `integrity` SHA-512.
  - **W4:** el minijuego se pausa (dibujo y reloj) si haces scroll y deja de verse, y sigue al volver (`IntersectionObserver`).
  - **W5:** botón «Copiar enlace» junto a la descarga: en móvil abre el menú de compartir; en ordenador copia el enlace (con respaldo para navegadores sin permiso de portapapeles).
  - Banner reorganizado: en escritorio los tres botones van en columna para no estrujar el texto.
- **Verificación:** `verify_all.py` pasa a 46 comprobaciones.

## [3.3.2] — 2026-11-01
Los packs animados van fluidos y, tras actualizar, la app explica cómo refrescar el pack en WhatsApp sin borrarlo.

- **App Android (`StickersNailong.apk` v3.3.2, `versionCode 8`):**
  - Rendimiento: Fresco decodifica los fotogramas al tamaño de la celda (`setShouldDownscaleFrameToDrawableDimensions` + `setDownsampleEnabled` y `ResizeOptions`), no a 512×512. Antes, unos 25 animados a 512 px saturaban la CPU.
  - Ya no se recargan todos los stickers al volver a la pantalla ni al marcar uno: solo se refresca el check (payload `PAYLOAD_SELECTION`) y la animación no se reinicia.
  - Las animaciones se pausan en `onPause`, para que el botón atrás responda al momento, y se reanudan en `onResume`.
  - Las miniaturas de la lista de packs también se decodifican a su tamaño real.
  - Aviso nuevo (`dialog_update_tip.xml`): la primera vez que se abre tras una actualización, recuerda que en WhatsApp basta con pulsar «Actualizar» en el pack. No aparece en una instalación nueva.
  - Avisos de versión nueva: al abrirse, la app lee `https://alvarolofra.github.io/Nailong/version.json` (`UpdateChecker`, 5 s de timeout, silencioso sin red). Si el `versionCode` es mayor, muestra un diálogo con la versión, las novedades y el botón «Descargar», que abre el APK en el navegador. Se añade el permiso `INTERNET`.
  - Firmado con la misma clave que las versiones publicadas (keystore *debug* de la máquina), para que se instale encima sin desinstalar.
  - Número de versión pequeño al final de la lista de packs (sale de `BuildConfig.VERSION_NAME`, igual que el pie de la web).
  - **Vistas previas ligeras (la causa real del lag):** aunque Fresco pintara pequeño, seguía descodificando cada fotograma a 512×512 (25 animados a la vez → CPU al 200 %). `generar_assets.py` crea ahora `assets/previews/<pack>/` con copias animadas de 192 px, que usan la cuadrícula y las miniaturas de la lista. WhatsApp y la vista ampliada siguen usando los originales.
  - **Revisión a fondo (correcciones internas):**
    - Arranque más rápido: la validación de los 96 stickers, que descodificaba todos los fotogramas, solo se ejecuta en debug y ya no se repite dos veces (`StickerPackLoader` + `EntryActivity`). El tamaño de cada sticker se lee del descriptor y no cargando ~22 MB en memoria.
    - Volver a la lista de packs ya no reconstruye dos veces las 20 miniaturas (`notifyDataSetChanged` redundante en `onResume`).
    - «Mi Selección» se crea y valida en segundo plano, con un aviso «Preparando tu pack…», en vez de congelar la pantalla. Si algo falla, se borra la carpeta a medias.
    - La selección se guarda: sobrevive a que Android cierre la app mientras estás en WhatsApp. El estado del import de 2 packs también se conserva si la pantalla se recrea.
    - Seguridad: el ContentProvider (exportado para WhatsApp) rechaza rutas que intenten salir de `selection_packs/` (`../`).
    - Tocar la imagen de un sticker ya lo añade a «Mi Selección» (antes solo funcionaba el circulito: la imagen, al tener pulsación larga, se quedaba con el toque).
    - Protegida una división entre cero al calcular las miniaturas por fila en pantallas muy estrechas.
- **Web:** versión `v3.3.2`, sufijos `?v=` y etiqueta del APK (31 MB).
  - Minijuego: el lienzo ya no se reasigna en cada `resize` si el tamaño no cambia (en móvil saltaba al hacer scroll) y el reloj de la partida se para con la pestaña en segundo plano.
- **Mejoras visuales pendientes** anotadas en `documentacion/estado_del_proyecto/MEJORAS_PENDIENTES.md`.
- **README:** el historial anida los parches (x.y.Z) dentro de su versión menor.

## [3.3.1] — 2026-11-01
Corrección de la app Android: ya se ven los 4 packs a la vez, los stickers se animan dentro de cada pack y los packs animados quedan equilibrados.

- **App Android (`StickersNailong.apk` v3.3.1, `versionCode 7`):**
  - Los stickers animados se reproducen en bucle al abrir un pack (Fresco con `setAutoPlayAnimations`).
  - Pantalla principal más compacta: el pack «Nailong estático» (el cuarto) quedaba cortado por debajo de los tres animados; ahora los 4 caben en pantalla. «Mi Selección» oculta sus botones mientras no haya nada seleccionado.
  - Reparto equilibrado: *Nailong animado 1* (25), *animado 2* (24), *animado 3* (24) y *Nailong estático* (23). Los estáticos siguen en un solo pack.
  - `image_data_version` pasa de 1 a 2 para que WhatsApp no conserve la versión antigua de los packs reordenados.
- **Web:** solo cambia el número de versión (`v3.3.1`) y los sufijos `?v=` anti-caché.

## [3.3.0] — 2026-11-01
Incorporación oficial de 16 nuevos cromos (80 → 96 stickers), partición en 4 packs oficiales de WhatsApp en la app Android nativa (`v3.3.0`), tráiler promocional oficial de lanzamiento animado con HyperFrames y banda sonora original.

- **Stickers oficiales (96 cromos):**
  - Incorporación y normalización técnica de 16 nuevos stickers procedentes de TikTok (antiguos 126–141) con identificadores secuenciales `sticker_81.webp` hasta `sticker_96.webp`.
  - Normalización con `normalizar_stickers.py`: resolución 512×512, chunk EXIF oficial de WhatsApp (`sticker-pack-id`), pesos estrictos (≤500 KB animados, ≤100 KB estáticos).
  - Eliminación definitiva del directorio temporal `Stickers Nailong/stickers_tiktok_temporal`.
  - Catálogo completo en `js/02-datos-stickers.js` con nombres, emociones, descripciones y efectos sonoros temáticos en español.
- **App Android Nativa (`StickersNailong.apk` v3.3.0):**
  - Actualización de versión: `versionCode 6`, `versionName "3.3.0"`.
  - Creación del 4º pack oficial para WhatsApp: `nailong_animados_3` (13 stickers animados), respetando el límite estricto de WhatsApp (máx. 30 por pack, sin mezclar animados y estáticos).
  - Distribución final de los 96 stickers: *Nailong Animados 1* (30), *Nailong Animados 2* (30), *Nailong Animados 3* (13) y *Nailong Estáticos* (23).
  - Recompilación con Gradle del binario firmado `StickersNailong.apk` (28.7 MB), verificado con `apksigner`.
- **Tráiler Oficial de Lanzamiento con HyperFrames:**
  - Corrección de renderizado en Escena 2 (sustitución de asignación dinámica de `src` por nodos pre-renderizados en el DOM con alternancia síncrona vía GSAP `tl.set()`), eliminando el fotograma roto a los 6.2s.
  - Composición y síntesis de la banda sonora original `video-promo/assets/audio/nailong_theme.wav` (escala pentatónica de Do Mayor, 17.0s de duración) sincronizada mediante `<audio id="bgm">`.
  - Actualización de métricas a 96 stickers en todas las escenas y badge de versión v3.3.0.
  - Validación con `npx hyperframes check` (0 errores en lint, layout, motion, contrast, craft).
  - Renderizado en MP4 (1080×1920 a 30 fps) en `video-promo/nailong_trailer_oficial.mp4`.
  - Integración en la web mediante el bloque `#video-promo-section` con reproductor responsive y botón en el banner principal.
- **Suite de Pruebas:**
  - Actualización de `verify_all.py` para validar los 96 stickers correlativos sin huecos ni archivos huérfanos, y versionado v3.3.0. 44/44 pruebas superadas con éxito.

## [3.2.3] — 2026-10-31
Última versión publicada. Corrección de la etiqueta del peso del APK en la web (20 MB).

## [3.2.2] — 2026-10-31 Retiro de duplicados 1/42 y 6/14, renumeración continua a 80 stickers y APK sincronizado.

## [3.2.1] — 2026-10-31
División de `index.html` en marcado + `css/styles.css` + `js/` (D-15) e instrucciones de agente canónicas (`AGENTS.md`, D-14).

---

## Historial completo (de la más antigua a la más reciente)

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
  - Desarrollo y compilación del paquete de aplicación nativa Android independiente (`C:\src\nailong_stickers_app\StickersNailong.apk`, 26.6 MB), firmado con esquemas v1 y v2.
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
  - `verify_all.py` ampliado para validar físicamente la presencia del binario APK (>20 MB), la integración del banner Claymorphism en la web, la versión `v3.0.1` y la integridad estructural de toda la plataforma.

---

### 📌 Versión 3.0.1 (v3.0.1) - Pulido Tipográfico, Ajuste de Badges y Limpieza de Inspecciones Lint
- **Ajuste Tipográfico en Botones:** Incorporación de `android:textAllCaps="false"` y ajuste de `textSize="12sp"` con padding lateral calibrado en el botón «Ver stickers ❯», resolviendo el salto a doble línea y corte inferior en dispositivos con fuentes de gran escala (ej. Xiaomi / HyperOS).
- **Encuadre de Título:** Reducción de padding en badges y ajuste a 16sp para que títulos como «Nailong animado 1» se muestren íntegros sin truncarse con puntos suspensivos.
- **Limpieza Completa de Inspecciones Lint:** Resolución de avisos de márgenes bidireccionales RTL (`layout_marginLeft`/`layout_marginRight`), extracción de cadenas a recursos XML (`@string/my_selection_badge_title`) y etiquetas de compatibilidad de API para dejar Android Studio sin avisos en rojo.
- **Sincronización Web y Documentación:** Actualizado el banner web a `v3.0.1 APK`, pie de página a `v3.0.1` y verificación con 42 comprobaciones completas.

---

### 📌 Versión 3.1.0 (v3.1.0) - UI Pulida, Tipografía Fredoka, Diálogo Claymorphism con Renombrado y Calibración de Icono
- **Ajuste Responsivo Web Móvil:** Badge del álbum fotográfico (`#galeria`) optimizado como bloque fluido (`inline-block rounded-2xl`) con ajuste de salto limpio en 2 líneas sin solapamiento de bordes en pantallas estrechas.
- **Tipografía Fredoka Nativamente Integrada:** Integración de la familia tipográfica oficial Fredoka (`res/font/fredoka.xml`, pesos 400, 500, 600 y 700) aplicada a toda la aplicación Android para unificar la estética divertida y redondeada con la web.
- **Feedback Táctil Instantáneo In-App:** Supresión de colas de Toasts del sistema mediante un banner/píldora reactivo `inapp_toast_pill` en `StickerPackDetailsActivity` que actualiza el contador de selección en tiempo real (0 ms de espera).
- **Cuadrícula en Tarjeta Contenedora:** Diseño de `card_stickers_container.xml` envolviendo la lista de stickers con fondo blanco y borde amarillo cálido `#FDE047`.
- **Eliminación del Botón «(i)»:** Supresión de la acción y menú `toolbar.xml` en la pantalla de detalles.
- **Corrección de Textos Superpuestos:** Reestructuración de la barra de acciones inferior para garantizar separación vertical nítida entre el badge de pack añadido y el texto de ayuda.
- **Diálogo Claymorphism con Renombrado Suave (Lápiz ✏️):** Nueva interfaz `dialog_import_selection.xml` sin iconos de advertencia alarmistas, con campo editable y botón de lápiz temático para renombrar el pack dinámico antes de exportarlo a WhatsApp.
- **Diálogo de Éxito Festivo:** Notificación `dialog_success_whatsapp.xml` celebratoria con estilo Claymorphism.
- **Calibración de Icono Adaptive:** Modificación de `generate_launcher_icons()` para centrar el primer plano al 72% del lienzo de 108 dp, resolviendo el corte de barbilla y frente en máscaras circulares del launcher.
- **Suite de Pruebas Ampliada a 43 Comprobaciones:** Actualizado `verify_all.py` a 43 tests automáticos superados al 100%.

---

### 📌 Versión 3.2.0 (v3.2.0) - Sección «Stickers» Unificada, Botón de App en el Menú y Barra Móvil Corregida
- **Fusión Muro de GIFs + Álbum:** una única sección `#galeria` con el orden: banner de la app (APK) → tira horizontal del Visor Mágico (9 escenas, ancla `#muro-gifs`) → aviso de WhatsApp → filtros → álbum. Se elimina la sección independiente del muro (9 tarjetas grandes, una por fila en móvil).
- **Acceso al Visor desde el Álbum:** el lightbox muestra «🔍 Abrir en el Visor Mágico» en los stickers que son una de las 9 escenas (`featuredGifIndexOf`, `openVisorFromLightbox`).
- **Botón de la App en la Navegación:** botón verde «📲 Descargar la App (Android)» en el menú móvil y «📲 App» en la barra de escritorio, ambos hacia `#android-app-banner`.
- **Barra Superior sin Desbordes:** subtítulo solo en pantallas anchas, «Fiesta» como emoji en móvil, botones reducidos por debajo de 360 px y `overflow-x: clip` en `html` (medido: a 320 px desbordaba 12 px).
- **Pruebas:** `verify_all.py` ampliado a 44 comprobaciones y pie de página `v3.2.0` (la insignia del APK sigue en `v3.1.0 APK`: el binario no cambia).

---

### 📌 Versión 3.2.1 (v3.2.1) - Corrección de Eventos Táctiles en Diálogo y Robustecimiento de ContentProvider
- **Corrección de Eventos Táctiles en Diálogos:** Resuelto el problema por el cual al pulsar «Añadir a WhatsApp» en `dialog_import_selection.xml`, no se abría el menú nativo de WhatsApp. La causa fue la captura interna del click por parte del `TextView` hijo (que heredaba `clickable="true"` de `Widget.MaterialComponents.Button.TextButton`), impidiendo el disparo del listener del botón contenedor. Se ha configurado `android:clickable="false"`, `android:focusable="false"` y se ha blindado la invocación enlazando el listener tanto al contenedor como a la vista hija en `StickerPackListActivity.java`.
- **Robustecimiento de `StickerContentProvider`:**
  - Sobrescritura de `openFile(Uri, String)` para servir directamente los descriptores `ParcelFileDescriptor` en modo lectura sin crear pipes intermediarios.
  - Ajuste en `openAssetFile` para devolver `AssetFileDescriptor.UNKNOWN_LENGTH` en archivos dinámicos generados en almacenamiento interno.
  - Detección del paquete solicitante (`com.whatsapp` / `com.whatsapp.w4b`) en `getPackForAllStickerPacks` para resolver positivamente cualquier verificación global de metadatos de WhatsApp manteniendo la lista principal de la app limpia.
  - Paridad de esquema con valores por defecto vacíos en `androidPlayStoreLink` e `iosAppStoreLink` en `DynamicPackManager.java`.
- **Sincronización Web y Binario:** Recompilación del APK firmado `StickersNailong.apk` (24.6 MB, `versionCode 4`, `versionName "3.2.1"`), actualización de insignia `v3.2.1 APK`, pie de página `v3.2.1` y suite de verificación pasando las 44 pruebas al 100%.
- **Reorganización Web:** Reubicación de la sección del creador con Nailong (`#creador`) debajo del minijuego (`#minijuego`) al pie de la página, manteniendo la navegación intacta.
- **Estandarización Documental UEM y Dicotomía de Estilo:** Separación estricta entre la vitrina pública (`README.md`, notas de parche directas, cortas y sin tecnicismos) y la base técnica modular en `documentacion/` (`00_INDICE.md`, `estado_del_proyecto/`, `guias_y_contexto/`, `notas_tecnicas/`).

---

### 📌 Versión 3.2.2 (v3.2.2) - Retiro de Duplicados, Renumeración Continua a 80 Stickers y Actualización del APK
- **Eliminación de Stickers Duplicados:** Detección y retiro de dos duplicados redundantes:
  - Eliminado el duplicado estático `sticker_42.webp` (idéntico byte a byte a `sticker_1.webp`, preservando el cromo inicial #1).
  - Eliminado `sticker_6.webp` (duplicado de la animación de `sticker_14.webp`, conservando esta última).
- **Renumeración Continua del Catálogo (1..80):** Reordenación secuencial ascendente sin saltos numéricos, garantizando una colección de exactamente 80 stickers oficiales y 1 foto del creador.
- **Sincronización Web:**
  - Actualización de `ALL_STICKERS` en `js/02-datos-stickers.js` a 80 cromos.
  - Remapeo de referencias en `heroMoods` (`js/03-hero.js`), `FEATURED_GIFS` (`js/05-visor-magico.js`), `SOUNDBOARD_TILES` (`js/07-sonidos-y-laboratorio.js`), sprite del minijuego (`js/08-minijuego.js`), favicons (`index.html` y `manifest.json`) y cache-busting `?v=3.2.2`.
- **Actualización de la App Android (`StickersNailong.apk`):**
  - Ajuste de `generar_assets.py` con los nuevos lotes de packs: *Nailong animado 1* (29 stickers), *Nailong animado 2* (30 stickers) y *Nailong estático* (21 stickers), totalizando 80 stickers.
  - Recompilación con Gradle (`versionCode 5`, `versionName "3.2.2"`), firmado con apksigner (esquemas v1, v2 y v3) y copia del binario (20.3 MB / 21.315.677 bytes) a la raíz del repositorio web.
- **Pruebas Automatizadas:** `verify_all.py` actualizado a 80 stickers, verificando que los 44 tests continúen superándose al 100%.

---

### 📌 Versión 3.2.3 (v3.2.3) - Corrección de Peso del APK en la Web
- **Botón de Descarga Web:** Corrección de la etiqueta textual del botón de descarga en `index.html` a `Descargar APK (20 MB)`, reflejando con exactitud el peso real del binario `StickersNailong.apk` (20.3 MB / 21.315.677 bytes) tras la optimización del catálogo a 80 stickers.
- **Sincronización:** Actualizado el pie de página y la insignia a `v3.2.3` con cache-busting `?v=3.2.3`.

