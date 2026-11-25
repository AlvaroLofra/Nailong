# Bitácora de sesión — 25/11/2026: optimizaciones de la web y del 3D, tráiler «+120» y publicación de la web 4.2.0

> **Objetivo:** aplicar las mejoras aprobadas por el usuario tras medir el peso de la 4.1.0 (`W32`–`W34`, `3D14`–`3D16`), limpiar láminas viejas (`L3`), actualizar el tráiler a «+120» y, a petición del usuario, publicar todo junto con la frente corta de la sesión `nailong3d-frente` (`3D18`) como **web 4.2.0**.
> **Agente:** Claude Code (Opus), sesión `optimizaciones` lanzada desde la de los ojos «lente», en el *checkout* principal (`main`). En paralelo, la sesión `nailong3d-frente` trabajó en su *worktree* (`js/11`, `perfil_cara.py`, test 49 y sus documentos).
> **Prueba previa del usuario:** la 4.1.0 en su Poco X7 Pro (Android): «va bastante bien, ni un tirón ni lagazo».

---

## 1. Método de medida

- **Peso de la página:** una copia exacta de la 4.1.0 (`git archive HEAD`) servida en otro puerto y la versión nueva, cada una en una pestaña nueva y al frente del navegador integrado (en segundo plano el navegador no carga las imágenes diferidas y frena las animaciones), a 1.024×768 y 375×812. Se suman los `encodedBodySize` de Resource Timing; el icono de la pestaña no sale ahí y se miró en el registro del servidor.
- **Hallazgo de medida:** al **recargar** (no en la primera visita) el navegador integrado descargaba antes de tiempo imágenes de la tira de escenas, el álbum y la botonera (hasta 3,7 MB a 375 px). En pestaña nueva no pasa; queda anotado como observación.
- **3D:** Chrome sin interfaz con la gráfica real (`--use-angle=d3d11`, RTX 2060) y perfil nuevo («frío») o repetido; `renderer.info.programs`, contador de `renderer.render` frente a `requestAnimationFrame`, y `capturar_3d_cdp.js` (SwiftShader) para comparar píxel a píxel con la 4.1.0 (`--raiz <copia>`).

## 2. Web (`W33`, `W32`, `W34`)

- **`W33` · Imágenes:** antes, 1.694 KB de imágenes en la primera visita: `sticker_19` (312 KB, imagen principal, se queda), `sticker_2` (500 KB: logo de 48 px, banner y pie), las tarjetas 28/27/31 (617 KB) y el sprite del minijuego `sticker_9` (245 KB, se pedía al cargar `js/08`), más el icono de la pestaña (`sticker_18` entero, 398 KB). Ahora: copias de 192 px por clave en `Stickers Nailong/mini/` (calidad 70, redimensionado en alfa premultiplicado), icono de 64 px y sprite bajo demanda → **641 KB** de imágenes y 1,7 KB de icono. El `sticker_19` del muñeco acompañante y del laboratorio no se tocó: es el mismo fichero que la imagen principal, ya descargado. El resolutor de `data-sticker` respeta las copias. Herramienta `herramientas/miniaturas_web.py`; test 53 (incluye el parecido visual con el detector de repetidos).
- **`W32` · Iconos:** 27 iconos (no 28: la lista tenía 27 nombres). Se descargaron los SVG oficiales de Font Awesome Free 6.5.1 de jsDelivr y se convirtieron en máscaras CSS con las mismas clases. **Primera versión con un fallo cazado por la comparación automática:** la caja medía 1em, pero con la fuente medía una línea (`text-sm` → 20 px), y algunos botones quedaban 4–8 px más bajos. Arreglado con `height: 1lh` y `vertical-align: calc(-0.125em - (1lh - 1em) / 2)` (con respaldo a `1em`): **0 diferencias** de posición o tamaño (±0,3 px) en los 19 iconos visibles a 375 px, en todos a 1.440 px y en los 4 modales; misma altura de página. `flex-shrink: 0` porque la caja ya no tiene contenido. Herramienta `herramientas/iconos_svg.py`; test 54.
- **`W34` · QR:** generador propio (`herramientas/generar_qr.py`, ISO/IEC 18004, sin dependencias). Comprobado contra api.qrserver.com leyendo su imagen: **1.089/1.089** (APK, versión 4) y **841/841** (web, versión 3) módulos iguales, misma máscara (2) y corrección L. El QR de «Compartir» se descargaba en cada visita aunque el modal estuviera cerrado; ahora apunta siempre a la página principal. Tests 22 y 48 regeneran los QR y comparan.

## 3. 3D (`3D14`–`3D16`)

- **Hallazgo:** el primer fotograma ya compilaba los *shaders* dentro de `montar()`, detrás del aviso de carga. Los tirones reales eran 1 programa en la intro (dientes y lengua, ocultos al arrancar; peor fotograma 174 ms) y **7 programas al pulsar «Dibujo animado»** por primera vez (460–473 ms congelado).
- **`3D16`:** los dos ojos comparten programa (clave sin el lado) y `precompilarEstilos` prepara, con el aviso aún delante, los dos estilos y las piezas ocultas (las pinta un instante; el navegador solo enseña el último fotograma). `renderer.compile()` solo no basta: no prepara las sombras. Resultado: 23 programas («alta») o 18 («baja») al encender y **0 después** en las 6 caritas, las 5 acciones y los dos estilos.
- **`3D14`:** en calidad «baja», sin mapa de sombras (ni el suelo de sombras) y ~30 fps cuando nadie lo toca: `enReposo` + `MS_REPOSO = 28 ms`; actividad = puntero, arrastre (también el deslizamiento al soltar), teclado, botones y acciones pedidas por el usuario hasta que terminan; el vigilante de resolución solo mide a ritmo normal. Medido: 33 imágenes/s en reposo frente a 141–165 al tocarlo o bailar; tras el baile vuelve a 33. `?calidad=baja|alta` para las herramientas.
- **`3D15`:** malla en IndexedDB con clave `v1|cyrb53(js/11)|longitud|calidad|celdas`, una sola entrada, espera máxima de 1,5 s y validación; `put()` copia los datos antes de montar. Recuperarla: 9–31 ms frente a 250–450 ms de cálculo.
- **Encendido (frío → repetido):** «alta» 2.192 → 553 ms antes y 2.748 → 330 ms ahora; «baja» 2.094 → 476 ms antes y 2.257 → 287 ms ahora. La primera visita paga los *shaders* del otro estilo por adelantado.
- **Hallazgo:** `renderer.info.render` (llamadas y triángulos) se pone a cero después de la pasada de sombra en three.js r147: las cifras del 25/11 («27 llamadas, ~96.000 triángulos con la pasada de sombra») **no** la incluían.
- **Sin cambios visuales no buscados:** en «alta», 24 vistas (7 + 6 caritas + 5 acciones + 6 de cara) y 12 primeros planos de los ojos idénticos píxel a píxel a la 4.1.0; sticker 3D (25,8 KB), foto (189,7 KB) y `.glb` (4.437 KB) iguales. En «baja», lámina antes/después enviada al usuario (`comparativas/w_optim_3d/lamina_3d14_calidad_baja_antes_despues.png`).

## 4. Tráiler

- `lluvia.html` «¡+120 stickers!» (a 168 px no cabía en una línea y la segunda se montaba sobre «¡y se mueven!»: 140 px), `album.html` «+120 cromos» y `whatsapp.html` con 5 packs. El usuario eligió **B: sin cifras** («Stickers animados» / «Stickers estáticos») entre dos opciones con fotogramas.
- `check` de HyperFrames: 0 errores (los avisos de zona segura y contraste ya estaban en el diseño original). Render con el lanzador de la guía (CLI 0.9.92; la del `package.json`, 0.8.226, queda por debajo del mínimo del lanzador) a 60 fps y 4,4 Mbps: **18,0 MB** (antes 18,2). Las escenas sin cambios coinciden con el vídeo anterior (solo ruido de compresión); la portada es la escena inicial y no cambia. Se mantiene el nombre del fichero. La herramienta añadió `authoringSkill` a `hyperframes.json`; se deshizo.

## 5. Integración y publicación (4.2.0)

- Commit del código (`e776a16`), merge de `claude/nailong3d-frente-631431` (`e6eda92`, sin conflictos: Git combinó `verify_all.py`), commit del vídeo (`18eac8c`) y, después, versión 4.2.0 y documentación.
- Con todo integrado: `verify_all.py` en verde; `evaluar_3d.py --etiqueta v4.2_integrada --expresiones --cara` → 21/21, 6/6 (`F0` 0,456), 24 vistas sin errores e **idénticas píxel a píxel** a las finales de la sesión `nailong3d-frente`; caché y precompilación funcionando con la malla nueva (22.160 vértices).
- **Limpieza `L3`:** borradas solo las 8 entradas aprobadas de `comparativas/` (115 → 78 MB); se conservan `3d12_final`, `3d12_v1_afinada`, `3d13_ojos_lente` y `3d18_frente`.
- Documentación: `DECISIONES.md` (D-30), `ESTADO_ACTUAL.md`, `CHANGELOG.md` (4.2.0), `MEJORAS_PENDIENTES.md`, `README.md` (novedades 4.2.0, tras leer `GUIA_README.md`), notas 05 (rendimiento) y 06 (H-11 resuelta), mapa de código y el mapa de `AGENTS.md` (`mini/` y herramientas nuevas).

## 6. No comprobado

- La 4.2.0 en móviles reales: reposo a ~30 fps, sin sombra en tiempo real, tiempo de preparar *shaders* en un móvil modesto, IndexedDB en Safari (y su modo privado) e iconos con «Alto contraste» de Windows.
- El estilo «dibujo animado» con la cabeza nueva y el `.glb` de 0,97 m en programas externos (de la sesión `nailong3d-frente`).
- La carga temprana de imágenes al recargar, en un móvil real.

## 7. Pendiente (decisiones del usuario, de una en una)

- `W26` (Tailwind compilado; sería D-31), `L4` (ramas y *worktrees* viejos, incluidas remotas; no tocar la de `nailong3d-frente` sin permiso), `L6` (`__pycache__` y `git gc`) y `L1`/`L2`/`L5` (restos del proyecto del vídeo).
