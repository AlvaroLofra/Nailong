# Mejoras pendientes (visuales y de interfaz)

> Lista viva de ideas **no aplicadas**.
> - Las A1–A7 y W1–W5 de la revisión de la v3.3.2 se aplicaron en la **v3.3.3** (ver `CHANGELOG.md`).
> - Las A8–A13 y W6–W7 (junto con el zoom grande centrado con transición y el botón «Ver (N) ❯» para revisar «Mi Selección») se aplicaron en la **v3.5.0** (ver `CHANGELOG.md`).
> - Las mejoras **W9** (frases del muñeco acompañante detectando la sección visible en viewport + frase para `#nailong-3d`) y **W10** (enlace `🧊 3D` y barra de navegación compacta desde `1024 px`) se aplicaron en la **v4.0.0** (ver `CHANGELOG.md` y D-24).
> - Las mejoras **W21** (botón de pausa de partículas), **W22** (`autofocus` en cerrar de los 4 `<dialog>`), **W23** (contraste WCAG AA ≥ 4,5:1 en todos los textos), **W24** (prioridad LCP en `sticker_19.webp` y lazy en `sticker_2.webp`), **W25** (carga diferida de `js/11`–`js/13` desde `js/14`), **W27** (arranque diferido en `js/10-inicio.js`), **W28** (CLS escritorio `0,11 → 0,0042`) y **W30** (área táctil de `#power-size-slider` ≥ 28 px) se aplicaron el **24/11/2026 (sesión Swarm)** (ver `bitacora_de_sesiones/2026-11-24_mejoras_3d_y_web_swarm.md`).
> - Las mejoras **3D3** (sticker 512×512 WebP con EXIF WhatsApp desde la pose actual) y **3D5–3D10** (Fase 0 de herramientas de medición/captura CDP/lámina/`?3d=debug` y Fase 1 completa de proporciones de la serie hasta **21/21 OK** con 15 huesos y cabeza en judía inclinada) se aplicaron el **24/11/2026 (sesión Swarm)**.

> - El **24/11/2026 (sesión Claude Code)** se aplicaron **W31** (la barra superior de escritorio se salía 10–50 px entre 1.024 y 1.535 px y el botón «¡Fiesta Duang!» quedaba fuera: ahora usa todo el ancho hasta `88rem`, enlaces en línea desde 1.280 px y menú ☰ por debajo), **D-26** (Nailong 3D apagado por defecto con botón «Ocultar») y **3D12** (silueta frontal de la cara en «campana», ver `05_nailong_3d.md`).
> - El **25/11/2026 (sesión Claude Code)** se aplicaron **3D12** en su variante final «V1 afinada» y **3D13** (ojos «lente» a ras de la cara, D-28), y todo lo anterior se publicó como **web 4.1.0** (D-27; la app sigue en 4.0.0).
> - El **25/11/2026 (sesiones `optimizaciones` y `nailong3d-frente`)** se aplicaron **W32** (iconos SVG propios en lugar de Font Awesome), **W33** (copias reducidas de las imágenes pequeñas, más el icono de la pestaña y el sprite del minijuego bajo demanda), **W34** (QR fijos), **3D14** (sin sombra en tiempo real y ~30 fps en reposo en calidad «baja»), **3D15** (malla en IndexedDB), **3D16** (*shaders* compartidos y preparados al encender), **3D18** (frente corta, D-29), la limpieza **L3** y el tráiler con «¡+120 stickers!»; todo se publicó como **web 4.2.0** (D-30; la app sigue en 4.0.0). Ver `bitacora_de_sesiones/2026-11-25_optimizaciones_y_v4.2.md` y `2026-11-25_frente_corta_3d18.md`.

## Web 4.3.0 (planificada el 27/11/2026; sin empezar)

> **Decidido por el usuario el 27/11/2026:** la web 4.3.0 consistirá principalmente en **T1–T2** (textos de los stickers y lore), **VM1–VM3** (Visor Mágico), **B1–B3** (botonera) y **V1** (tráiler horizontal: el vídeo ya está hecho, falta integrarlo; ver «Vídeo promocional»).
> **Orden propuesto:** textos → Visor (independiente; puede ir en paralelo en otra rama) → botonera (espera a la decisión `B2` y a los episodios).
> **Punto de partida:** plan hecho con una muestra de 22 stickers revisados con fotogramas y el lore buscado en internet; los datos clave se comprobaron en la web oficial. No se ha cambiado nada todavía.

### Hallazgos
- **Bombloong mal identificado.** Según la web oficial (<https://www.nailoong.com/ipStar/bombloong/>), 暴暴龙 / Bombloong es un dragón **azul** «de cascarón de huevo» (蓝色蛋壳龙), bajito, regordete y con alitas: un asesino del espacio que quiere acabar con Nailong. El #27 (imagen de su ficha en «¿Quién es Nailong?», `clave: 'bombloong'`) es **Nailong teñido de morado**, una edición de fans. Los morados de la serie son sus secuaces, los 小紫兵 («soldaditos morados»). El Bombloong real ya está en la colección: el dragón azul del cascarón del **#117**.
- **Textos reutilizados que no cuadran con su sticker** (amplía `W11`):
  - Botonera: «¡Ñam Ñam Crujiente!» (#11, no come), «¡Llamita Bebé!» (#32, cara de mosqueo) y «¡Capitán Pirata!» (#33, gorro de la danza del león; también en el hero y en los disfraces).
  - Hero: «bollitos» (#11) y «muslito de pollo» (#13, lengua fuera y sin pollo).
  - Disfraces: «Superalas» (#90, gafas de DJ), «Palomitas» (#55, capucha de dinosaurio) y «Bailarín» (#6, gorro blanco y quieto).
- **Álbum:** describe bien en general, pero rellena con contexto inventado (#6 «esperando a que el pastel salga del horno») y se le escapan detalles pequeños (#38: al ampliarlo lleva un **cóctel**, no «una cunita entre nubes de nata»). Algunos stickers llevan subtítulos chinos incrustados (#117: 俩在这干嘛呢, «¿Qué hacéis aquí vosotros dos?»).
- **Lore de «¿Quién es Nailong?»:**
  - **Verificado en la web oficial** (<https://www.nailoong.com/ipStar/Nailong/>): creador «龙爸» 谢承恩 (Xie Chengen); productora 第七印象 (Seventh Impression); nacido en 2019 y popular desde 2020; 180 cm, 2 toneladas, cumpleaños el 22 de enero; «dragón alienígena bebé», glotón, al que le gusta comer, dormir, hacerse el mono y bailar. Grafía oficial: «Nailoong».
  - **Edad:** según el usuario, en el primer episodio el propio Nailong dice tener **3 años y medio**. Falta comprobar si cambia en temporadas posteriores (China.com dice 3 y la Wikipedia china, 5). La ficha dice hoy «3 añitos».
  - **Sin fuente fiable** (solo blogs o wikis de fans): «cayó de su nave espacial», «Xiao Qi lo adoptó» y «tira de su colita», la comida favorita (pollo), cambiar de tamaño o de color, y las placas de la espalda como rasgo oficial (se ven en los stickers, pero la web oficial no las cita). Escupir fuego sí sale en prensa.
  - El meme «大笑奶龙» (Nailong riéndose a carcajadas) es un montaje de fans hecho con IA que el estudio rechaza: no presentarlo como oficial.
- **Visor Mágico:** el botón de velocidad nunca ha funcionado. `setModalSpeed` (`js/05-visor-magico.js`) solo pone efectos CSS al `<img>` («Lento» flota y «Turbo» tiembla); la velocidad interna de un WebP animado no se puede cambiar desde CSS ni JS.
- **Botonera:** sus 12 botones solo usan 8 sonidos distintos (`pop` ×3, `duang` ×2, `fanfare` ×2); `run` y `slurp` existen y no se usan. `ESTADO_ACTUAL.md` dice «12 sonidos únicos»: hay que corregirlo.

### T1 · Textos de los stickers (esfuerzo medio–alto)
- **Qué se revisa:** título, descripción, categoría y sonido de cada cromo (`js/02`); las 9 escenas del Visor (`js/05`); la botonera (`js/07`); los estados de ánimo del hero (`js/03`); los disfraces y el color «Morado Bombloong» del laboratorio (`index.html`); las fichas de «¿Quién es?»; y el lore suelto (pie, «bombas de Bombloong» del minijuego, frases del muñeco acompañante).
- **Una sola fuente:** el Visor, la botonera y el hero leerán el título y la descripción de `ALL_STICKERS`, para que no vuelvan a desincronizarse. Absorbe `W11`.
- **Fotogramas de los animados:**
  - Decodificar todos los fotogramas (Pillow), medir el cambio entre uno y otro y detectar los cortes de plano.
  - Elegir 6 fotogramas más 1 por corte (máximo 12), repartidos por cantidad de movimiento y no por tiempo, más el primero, el último y el de después de cada corte. En el #99 así se capta la carcajada que el reparto uniforme de `herramientas/hojas_contacto.py` se salta.
  - Recortes ampliados de objetos y textos.
  - Comparar el primer y el último fotograma para saber si es un bucle.
  - En los dudosos, una pasada con todos los fotogramas y una segunda opinión a ciegas (un subagente que no ve el texto).
- **Criterios:**
  - Solo lo que se ve y en orden (inicio → giro → final).
  - Personajes bien identificados o, si hay duda, descripción neutra.
  - Lore solo con fuente (web oficial > Wikipedia > prensa > wikis de fans; los blogs no cuentan).
  - Las ediciones de fans se dicen como tales (recoloreados #10, #27 y #102).
  - Castellano de España, tierno y variado: menos «patitas» y diminutivos, sin títulos repetidos.
  - Título de unos 32 caracteres como máximo y descripción de una frase de unos 140, comprobados a 320 px.
- **Propuesta al usuario:** hoja de revisión HTML local **fuera del repositorio** (regla de un solo `index.html`). Cada sticker con su animación, su tira de fotogramas, el texto actual frente al propuesto, un veredicto (OK, retocar, reescribir o personaje equivocado), la confianza y la fuente del lore. El usuario aprueba y se aplica todo de una vez.

### T2 · Fichas de «¿Quién es Nailong?» y nota de lore (esfuerzo bajo–medio)
- La ficha de Bombloong pasa a usar un recorte del #117. Hay que ajustar su clave (D-22) y su copia `mini/` (`herramientas/miniaturas_web.py`), y revisar los tests 51 y 53.
- El #27 se renombra como edición de fans. No se quita, porque cambiaría los packs de la app.
- Poner la edad de 3 años y medio si se confirma, y quitar lo que no tenga fuente.
- Nota de lore con sus fuentes en `documentacion/notas_tecnicas/`.

### VM · Visor Mágico
- **VM1 · Reproductor propio en `<canvas>` (esfuerzo medio).** Es el arreglo del botón de velocidad y la base de VM2 y VM3.
  - Un lector de WebP pequeño en JS, sin dependencias ni build: separa los fotogramas (`ANMF`), los decodifica con `createImageBitmap` y los pinta respetando su desplazamiento, fusión y borrado.
  - Controles: pausa, velocidad real de 0,25× a 3×, fotograma a fotograma, marcha atrás, bumerán y barra de tiempo.
  - Decodificar a tamaño de pantalla y liberar la memoria al cerrar (móviles).
  - `ImageDecoder` (WebCodecs) sería más corto, pero no está comprobado en Safari de iPhone: no usarlo como única vía.
- **VM2 · Cualquier sticker animado en el Visor (esfuerzo bajo).** Abrirlo desde el álbum (hoy solo las 9 escenas), con un botón «sorpréndeme».
- **VM3 · Ideas para que la sección sea protagonista (elegir; esfuerzo medio–alto).**
  - **«Crea tu sticker»:** texto estilo meme, emojis, recorte del tramo y velocidad, y exportarlo como sticker animado de WhatsApp de 512×512 con EXIF y de 500 KB como máximo. En Android, sí; en iPhone, solo imagen fija, porque Safari no crea WebP (no comprobado).
  - **Juego «¿Qué está pasando?»:** el sticker a cámara lenta y 3 títulos para adivinar cuál es.
  - **Sonido sincronizado** con el momento clave de cada sticker, que sale del análisis de T1.
  - Recomendado: VM1 y VM2 primero; luego «Crea tu sticker».

### B · Botonera
- **B1 · Rehacer la botonera (esfuerzo bajo–medio).** Un sonido distinto y coherente por botón, nombres que cuadren con su sticker y grupos (voces, risas y llantos, efectos).
- **B2 · Decisión del usuario: ¿sonidos reales de la serie?** Decidir con los candidatos de B3 delante.
  - **A) Clips reales de 0,5 a 3 s.** Lo más auténtico, pero rompe la regla 3 de `AGENTS.md` (solo audio sintetizado; haría falta una decisión nueva). Además, el estudio se reserva todos los derechos y ha actuado contra copias y memes; GitHub atiende avisos de derechos de autor y podría retirar el repositorio.
  - **B) Recrearlos con Web Audio**, usando los clips solo como referencia de tono y ritmo. Sin riesgo; bien para efectos, mal para la voz (sonaría robótica).
  - **C) Imitaciones grabadas por el usuario** y procesadas. Sin problema de derechos, pero también exige cambiar la regla 3.
- **B3 · Analizar episodios descargados por el usuario (esfuerzo medio–alto).**
  - **Fuente:** episodios guardados en una carpeta fuera del repositorio. Mejor del canal oficial («Nailoong official» en YouTube, o Bilibili) y con Nailong hablando; algunos stickers llevan la marca de Bilibili.
  - **Pasos:**
    1. ffmpeg (ya instalado) saca el audio y los fotogramas.
    2. faster-whisper transcribe el chino con marcas de tiempo, para buscar «我是奶龙», «我才是奶龙», risas y llantos.
    3. Un clasificador PANNs marca risa, llanto, ronquido, masticar o «boing».
    4. Opcional: Demucs para separar la voz de la música.
    5. Recortes con el volumen igualado y una hoja de escucha local con su traducción.
  - **Extra:** localizar con OpenCV la escena original de cada sticker, para tener su contexto real, el diálogo y el sonido exacto (sirve a T1, VM3 y B1).
  - **Herramientas:** unos 2–3 GB, instaladas aparte del proyecto y solo con permiso.
  - **No comprobado:** el tiempo de proceso y la tasa de acierto. Hacer primero un episodio piloto.

## Web

| # | Qué | Por qué | Esfuerzo |
|---|---|---|---|
| W8 | El aviso de Tailwind en la consola sigue saliendo. | Es propio del CDN; quitarlo exigiría compilar Tailwind (rompe «sin build», D-15). | Medio |
| W11 | Pasar a clave estable (`data-sticker`, D-22) el resto de imágenes fijadas por número: hero y muñeco acompañante (`index.html`, `js/03-hero.js`), disfraces del laboratorio y botonera (`js/07-sonidos-y-laboratorio.js`), visor mágico (`js/05-visor-magico.js`) y `og:image`. Revisar antes con el usuario las que no encajan con su etiqueta: «Bailarín» → 6 (Chef Pastelero), «Superalas» → 90 (DJ con gafitas), «Palomitas» → 55 (Dino disfrazado), «¡Llamita Bebé!» → 32 (*gasp* ofendido). **Pasa a la web 4.3.0 dentro de `T1`.** | Así ninguna imagen se desplaza en la próxima renumeración. Hoy están protegidas «¿Quién es Nailong?» y, desde la 4.2.0, el logo, el banner y el pie (usan la copia `mini/dragon-de-leche.webp`, D-30). | Bajo–medio |
| W26 | El CDN de Tailwind compila el CSS en el navegador y bloquea el primer pintado (≈ 270 ms de script con CPU ×4). | Es la principal causa del FCP lento que queda tras la 4.2.0. Quitarlo exige generar el CSS una vez (relacionado con W8) y choca con «sin build» (D-15): **decisión del usuario**; si se aprueba sería D-31. | Medio–alto |
| W29 | En móvil lento, un toque en la barra inferior tardó hasta ~2 s en responder mientras arrancaba el visor 3D (hilo principal ocupado). | **En principio resuelto por D-26** (el 3D solo arranca al pulsarlo) y aliviado por `3D15`/`3D16`. El usuario probó la 4.1.0 en su Poco X7 Pro sin tirones; falta un móvil modesto. | Bajo |

### Modernización web (plugin `Modern Web Guidance`): cerrada el 2026-11-15
> Evaluadas las propuestas W12–W20. Aplicadas W12, W14, W17 y W19 (esta última solo para Firefox); W21 y W22 aplicadas el 24/11/2026. Descartadas W13, W15, W16, W18 y la reescritura de W20. Motivos en D-23 (`DECISIONES.md`).

**Plan de vuelta atrás para publicar:** antes de la 4.2.0 lo publicado era `origin/main` = `90a22f8` (web 4.1.0). Si algo falla tras un `git push`, se publica la vuelta atrás con `git revert` de los commits nuevos (sin reescribir el historial) y GitHub Pages vuelve a servir el estado anterior en unos minutos. Para recuperar solo el Nailong 3D anterior basta con `archivo/nailong3d_anteriores/` (instrucciones en su `README.md`).

## Seguridad
Decisiones y acciones pendientes: `notas_tecnicas/06_auditoria_seguridad.md` (H-2 a H-10; H-11 resuelta en la 4.2.0).

## Nailong 3D
> - Las mejoras **3D1** (micro-grano aterciopelado *mochi*) y **3D2** (6 caritas de la serie) se aplicaron en `4.0.0 · revisión web 2`.
> - Las mejoras **3D3** (sticker 512×512 WebP desde la pose actual) y **3D5–3D10** (herramientas automáticas de evaluación + proporciones 21/21 OK de [`PLAN_FIDELIDAD_NAILONG_3D.md`](PLAN_FIDELIDAD_NAILONG_3D.md)) se aplicaron el **24/11/2026** en la sesión Swarm.
> - La mejora **3D12** (forma frontal de la cara: más ancha en los mofletes y más estrecha hacia la coronilla, medida con `herramientas/perfil_cara.py` contra las capturas frontales) se aplicó el **24/11/2026** (sesión Claude Code), junto con **D-26** (3D apagado por defecto).
> - Las mejoras **3D14**–**3D16** (ahorro en móviles, caché de la malla y *shaders*, D-30) y **3D18** (frente corta: la coronilla baja 2,8 cm y Nailong mide 0,97, D-29) se aplicaron el **25/11/2026** y se publicaron en la web 4.2.0.

| # | Qué | Por qué | Esfuerzo |
|---|---|---|---|
| 3D4 | Vista en realidad aumentada (`model-viewer`/USDZ). | Aplazada por el usuario. Ver a Nailong en tu mesa desde el móvil. | Alto |
| 3D17 | Detalles de los ojos «lente» (`3D13`): en estilo «dibujo animado» el ojo del fondo hace una muesca diminuta en la línea de contorno, y los ojos son ~17 % más grandes que en las capturas frontales `08`, `13` y `26`. | No se tocaron porque el usuario no lo pidió; `F3` quedó justo en el límite (`0,965`). | Bajo |
| 3D11 | **Piloto opcional con Blender** (gratis, GPL; script `blender -b -P` y conector MCP oficial de Blender) en una rama aparte. Compuerta abierta **solo tras la revisión visual del usuario** sobre el resultado de 3D6–3D10 (21/21 OK). | Modelado, esqueleto (Rigify) y expresiones (*shape keys* → *morph targets* glTF) de nivel profesional. Reabre D-21 porque la web cargaría un `.glb`, así que es **decisión del usuario**. El conector ejecuta Python del LLM sin protecciones (recomiendan una máquina virtual). | Alto |

## Limpieza de la carpeta (propuesta del 25/11/2026; `L3` hecha el 25/11)
| # | Qué | Cuánto | Riesgo |
|---|---|---|---|
| L1 | `video-promo/trailer-3d/remotion/node_modules` (fuera de Git) | ~763 MB en disco | Ninguno para la web; se reinstala con `npm install` si se vuelve a editar el vídeo. |
| L2 | Salidas y renders intermedios del vídeo (`trailer-3d/output`, `remotion/out`, `remotion/public/renders`, `blender/renders`, `video-promo/renders`, `.hyperframes` y, desde el 27/11, `video-promo/horizontal/.hyperframes`; fuera de Git) | ~16 MB | Ninguno; los vídeos finales están en `video-promo/nailong_trailer_v2.mp4` y `nailong_trailer_v2_horizontal.mp4`. |
| ~~L3~~ | ~~Láminas intermedias de `comparativas/`~~ **Hecha el 25/11/2026:** se borraron `3d12_base`, `3d12_v1`, `3d12_v2`, `3d12_v3`, `3d12_cara_ab`, `final_swarm` y las dos del 24/11 (115 → 78 MB). Se conservan `3d12_final`, `3d12_v1_afinada`, `3d13_ojos_lente`, `3d18_frente` y las de la 4.2.0. | −37 MB | — |
| L4 | Ramas y *worktrees* viejos de Git: 4 *worktrees* de Antigravity que ya no existen (`git worktree prune`), ramas `swarm-*` (4), `nailong-3d-fiel`, `docs/adopcion-pautas-centrales` (ya fusionada, local y remota) y la remota `claude/bold-brown-ainuog` | — | Medio: varias no están fusionadas; su trabajo se integró en `d6c37b6` y en la 4.1, pero hay que confirmarlo antes de borrarlas. La rama `claude/nailong3d-frente-631431` ya está fusionada en la 4.2.0. |
| L5 | Fuentes del proyecto del vídeo (HyperFrames y `trailer-3d`, ~24 MB en Git) que GitHub Pages publica aunque la web solo usa el `.mp4` y su portada | ~24 MB por despliegue | Medio: es un cambio de estructura (moverlas a otro repositorio o carpeta); **decisión del usuario**. |
| L6 | `__pycache__/` y `herramientas/__pycache__/` (fuera de Git) y compactar `.git` con `git gc` | < 1 MB / algo de espacio | Ninguno. No se propone reescribir el historial para quitar APK antiguos (rompería los clones). |

## Vídeo promocional
- El tráiler v2 de la web (`video-promo/nailong_trailer_v2.mp4`) se actualizó el 25/11/2026: «¡+120 stickers!», «+120 cromos» y los 5 packs de la app con «Stickers animados» / «Stickers estáticos» (textos que no caducan al añadir stickers).
- El **27/11/2026** se hizo la **versión horizontal** del tráiler para ordenador (`video-promo/nailong_trailer_v2_horizontal.mp4` + `_portada.webp`; fuentes en `video-promo/horizontal/`). Ver `bitacora_de_sesiones/2026-11-27_trailer_horizontal.md`.

| # | Qué | Por qué | Esfuerzo |
|---|---|---|---|
| V1 | **Integrar el tráiler horizontal en la web (irá en la web 4.3.0, decidido por el usuario el 27/11/2026).** En escritorio, reproductor 16:9 con el `.mp4` horizontal y su portada; en móvil, el vertical de siempre. Elegir la fuente desde `js/` (p. ej. `matchMedia` al pulsar «Ver tráiler», sin `<script>` inline) y ajustar la caja `#video-player-container` (hoy vertical: `w-48 h-80`), el lienzo `#video-ambient-canvas` y el botón de pantalla completa. Mantener `preload="none"`. Al publicar: versión 4.3.0 en el pie, `CHANGELOG.md`, `ESTADO_ACTUAL.md` y sufijos `?v=4.3.0` (D-27), y `verify_all.py` (el test 47 ya exige el `.mp4` vertical y su portada: añadir ahí el horizontal y su portada). | Hoy en ordenador se ve el vídeo vertical dentro de una caja estrecha; el horizontal aprovecha la pantalla y añade un QR de la web en el final. | Bajo–medio |
