# Mejoras pendientes (visuales y de interfaz)

> Lista viva de ideas **no aplicadas**.
> - Las A1–A7 y W1–W5 de la revisión de la v3.3.2 se aplicaron en la **v3.3.3** (ver `CHANGELOG.md`).
> - Las A8–A13 y W6–W7 (junto con el zoom grande centrado con transición y el botón «Ver (N) ❯» para revisar «Mi Selección») se aplicaron en la **v3.5.0** (ver `CHANGELOG.md`).
> - Las mejoras **W9** (frases del muñeco acompañante detectando la sección visible en viewport + frase para `#nailong-3d`) y **W10** (enlace `🧊 3D` y barra de navegación compacta desde `1024 px`) se aplicaron en la **v4.0.0** (ver `CHANGELOG.md` y D-24).
> - Las mejoras **W21** (botón de pausa de partículas), **W22** (`autofocus` en cerrar de los 4 `<dialog>`), **W23** (contraste WCAG AA ≥ 4,5:1 en todos los textos), **W24** (prioridad LCP en `sticker_19.webp` y lazy en `sticker_2.webp`), **W25** (carga diferida de `js/11`–`js/13` desde `js/14`), **W27** (arranque diferido en `js/10-inicio.js`), **W28** (CLS escritorio `0,11 → 0,0042`) y **W30** (área táctil de `#power-size-slider` ≥ 28 px) se aplicaron el **24/11/2026 (sesión Swarm)** (pendiente de commit/push en `main`; ver `bitacora_de_sesiones/2026-11-24_mejoras_3d_y_web_swarm.md`).
> - Las mejoras **3D3** (sticker 512×512 WebP con EXIF WhatsApp desde la pose actual) y **3D5–3D10** (Fase 0 de herramientas de medición/captura CDP/lámina/`?3d=debug` y Fase 1 completa de proporciones de la serie hasta **21/21 OK** con 15 huesos y cabeza en judía inclinada) se aplicaron el **24/11/2026 (sesión Swarm)** (pendiente de commit/push en `main`).

> - El **24/11/2026 (sesión Claude Code)** se aplicaron **W31** (la barra superior de escritorio se salía 10–50 px entre 1.024 y 1.535 px y el botón «¡Fiesta Duang!» quedaba fuera: ahora usa todo el ancho hasta `88rem`, enlaces en línea desde 1.280 px y menú ☰ por debajo), **D-26** (Nailong 3D apagado por defecto con botón «Ocultar») y **3D12** (silueta frontal de la cara en «campana», ver `05_nailong_3d.md`).
> - El **25/11/2026 (sesión Claude Code)** se aplicaron **3D12** en su variante final «V1 afinada» y **3D13** (ojos «lente» a ras de la cara, D-28), y todo lo anterior se publicó como **web 4.1.0** (D-27; la app sigue en 4.0.0).

## Web

| # | Qué | Por qué | Esfuerzo |
|---|---|---|---|
| W8 | El aviso de Tailwind en la consola sigue saliendo. | Es propio del CDN; quitarlo exigiría compilar Tailwind (rompe «sin build», D-15). | Medio |
| W11 | Pasar a clave estable (`data-sticker`, D-22) el resto de imágenes fijadas por número: hero y muñeco acompañante (`index.html`, `js/03-hero.js`), disfraces del laboratorio y botonera (`js/07-sonidos-y-laboratorio.js`), visor mágico (`js/05-visor-magico.js`), favicon y `og:image`. Revisar antes con el usuario las que no encajan con su etiqueta: «Bailarín» → 6 (Chef Pastelero), «Superalas» → 90 (DJ con gafitas), «Palomitas» → 55 (Dino disfrazado), «¡Llamita Bebé!» → 32 (*gasp* ofendido). | Así ninguna imagen se desplaza en la próxima renumeración; hoy solo «¿Quién es Nailong?» está protegida. | Bajo–medio |
| W26 | El CDN de Tailwind compila el CSS en el navegador y bloquea el primer pintado (≈ 270 ms de script con CPU ×4). | Es la principal causa del FCP lento. Quitarlo exige generar el CSS una vez (relacionado con W8) y choca con «sin build» (D-15): **decisión del usuario**. | Medio–alto |
| W29 | En móvil lento, un toque en la barra inferior tardó hasta ~2 s en responder mientras arrancaba el visor 3D (hilo principal ocupado). | **En principio resuelto por D-26** (el 3D ya no arranca solo al hacer scroll, solo al pulsar «Ver a Nailong en 3D»). Falta **comprobarlo en un móvil real**. | Bajo |
| W32 | Font Awesome se descarga entero desde cdnjs (CSS 18 KB + 2 fuentes de 153 y 115 KB) para solo 28 iconos. | Cambiarlo por iconos SVG propios (~10–15 KB) ahorra ~270 KB y 3 peticiones a un tercero en cada primera visita (medido el 25/11 a 1.024 px). | Medio |
| W33 | Imágenes pequeñas servidas con el sticker animado entero de 512 px: el logo de la barra (48 px) y el banner de la app usan `sticker_2.webp` (500 KB) y las 4 tarjetas de «¿Quién es Nailong?» suman ~1,1 MB. | Versiones reducidas (128–192 px) o un fotograma fijo para el logo: ~1–1,3 MB menos en la primera visita (hoy ~1,7 MB de imágenes al cargar). Respetar D-22 (`data-sticker`). | Bajo–medio |
| W34 | El QR de descarga del APK se pide a `api.qrserver.com` (servicio externo que recibe la URL). | La URL es fija: un QR estático en SVG/PNG dentro del repo quita la dependencia y la petición a un tercero. | Bajo |

### Modernización web (plugin `Modern Web Guidance`): cerrada el 2026-11-15
> Evaluadas las propuestas W12–W20. Aplicadas W12, W14, W17 y W19 (esta última solo para Firefox); W21 y W22 aplicadas el 24/11/2026. Descartadas W13, W15, W16, W18 y la reescritura de W20. Motivos en D-23 (`DECISIONES.md`).

**Plan de vuelta atrás para publicar:** antes de la 4.1.0 lo publicado era `origin/main` = `32816a2`. Si algo falla tras un `git push`, se publica la vuelta atrás con `git revert` de los commits nuevos (sin reescribir el historial) y GitHub Pages vuelve a servir el estado anterior en unos minutos. Para recuperar solo el Nailong 3D anterior basta con `archivo/nailong3d_anteriores/` (instrucciones en su `README.md`).

## Seguridad
Decisiones y acciones pendientes: `notas_tecnicas/06_auditoria_seguridad.md` (H-2 a H-8).

## Nailong 3D
> - Las mejoras **3D1** (micro-grano aterciopelado *mochi*) y **3D2** (6 caritas de la serie) se aplicaron en `4.0.0 · revisión web 2`.
> - Las mejoras **3D3** (sticker 512×512 WebP desde la pose actual) y **3D5–3D10** (herramientas automáticas de evaluación + proporciones 21/21 OK de [`PLAN_FIDELIDAD_NAILONG_3D.md`](PLAN_FIDELIDAD_NAILONG_3D.md)) se aplicaron el **24/11/2026** en la sesión Swarm.
> - La mejora **3D12** (forma frontal de la cara: más ancha en los mofletes y más estrecha hacia la coronilla, medida con `herramientas/perfil_cara.py` contra las capturas frontales) se aplicó el **24/11/2026** (sesión Claude Code), junto con **D-26** (3D apagado por defecto).

| # | Qué | Por qué | Esfuerzo |
|---|---|---|---|
| 3D4 | Vista en realidad aumentada (`model-viewer`/USDZ). | Aplazada por el usuario. Ver a Nailong en tu mesa desde el móvil. | Alto |
| 3D14 | Ahorro de batería en móvil: en calidad «baja», quitar la sombra suave en tiempo real (`PCFSoftShadowMap` 1024) y dejar la de contacto, y bajar a 30 fps cuando nadie toca a Nailong. | En este PC el 3D es ligero (27 llamadas de dibujo, ~96.000 triángulos, ~0,3 ms por fotograma), pero en un móvil la sombra duplica el trabajo de la GPU. **Medir antes en un móvil real.** | Bajo–medio |
| 3D15 | Guardar la malla generada (IndexedDB) para no recalcularla en cada visita. | Ahorra ~0,3 s de cálculo al encender el 3D en visitas repetidas (más en móviles lentos); hay que invalidarla al cambiar `ANATOMIA`. | Medio |
| 3D16 | Un solo programa de *shader* para los dos ojos y precompilar con `renderer.compile()` mientras «duerme en su huevo». | Hoy hay 17 programas (el ojo izquierdo y el derecho compilan el mismo *shader* por separado); evitaría un tirón en el primer fotograma. | Bajo |
| 3D17 | Detalles de los ojos «lente» (`3D13`): en estilo «dibujo animado» el ojo del fondo hace una muesca diminuta en la línea de contorno, y los ojos son ~17 % más grandes que en las capturas frontales `08`, `13` y `26`. | No se tocaron porque el usuario no lo pidió; `F3` quedó justo en el límite (`0,965`). | Bajo |
| 3D11 | **Piloto opcional con Blender** (gratis, GPL; script `blender -b -P` y conector MCP oficial de Blender) en una rama aparte. Compuerta abierta **solo tras la revisión visual del usuario** sobre el resultado de 3D6–3D10 (21/21 OK). | Modelado, esqueleto (Rigify) y expresiones (*shape keys* → *morph targets* glTF) de nivel profesional. Reabre D-21 porque la web cargaría un `.glb`, así que es **decisión del usuario**. El conector ejecuta Python del LLM sin protecciones (recomiendan una máquina virtual). | Alto |

## Limpieza de la carpeta (propuesta del 25/11/2026, pendiente del OK del usuario)
| # | Qué | Cuánto | Riesgo |
|---|---|---|---|
| L1 | `video-promo/trailer-3d/remotion/node_modules` (fuera de Git) | ~763 MB en disco | Ninguno para la web; se reinstala con `npm install` si se vuelve a editar el vídeo. |
| L2 | Salidas y renders intermedios del vídeo (`trailer-3d/output`, `remotion/out`, `remotion/public/renders`, `blender/renders`, `.hyperframes`; fuera de Git) | ~16 MB | Ninguno; el vídeo final está en `video-promo/nailong_trailer_v2.mp4`. |
| L3 | Láminas intermedias de `comparativas/` (`3d12_base`, `3d12_v1`, `3d12_v2`, `3d12_v3`, `3d12_cara_ab`, `final_swarm` y las del 24/11; fuera de Git) | ~37 MB | Bajo: se conservan `3d12_final` (antes), `3d12_v1_afinada` y `3d13_ojos_lente`. |
| L4 | Ramas y *worktrees* viejos de Git: 4 *worktrees* de Antigravity que ya no existen (`git worktree prune`), ramas `swarm-*` (4), `nailong-3d-fiel`, `docs/adopcion-pautas-centrales` (ya fusionada) y la remota `claude/bold-brown-ainuog` | — | Medio: varias no están fusionadas; su trabajo se integró en `d6c37b6` y en la 4.1, pero hay que confirmarlo antes de borrarlas. |
| L5 | Fuentes del proyecto del vídeo (HyperFrames y `trailer-3d`, ~24 MB en Git) que GitHub Pages publica aunque la web solo usa el `.mp4` y su portada | ~24 MB por despliegue | Medio: es un cambio de estructura (moverlas a otro repositorio o carpeta); **decisión del usuario**. |
| L6 | `__pycache__/` y `herramientas/__pycache__/` (fuera de Git) y compactar `.git` con `git gc` (188 MB) | < 1 MB / algo de espacio | Ninguno. No se propone reescribir el historial para quitar APK antiguos (rompería los clones). |

## Vídeo promocional
- La versión 2 ya está publicada en la web (`video-promo/nailong_trailer_v2.mp4`).
