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
> - El **27/11/2026** (sesiones `textos-4-3` y `visor-botonera-4-3`, integradas por la sesión principal) se aplicaron **T1**, **T2** y **W11** (textos de los stickers, fichas con lore e imágenes por clave), **VM1–VM3** (reproductor propio, cualquier sticker en el Visor y «Crea tu sticker»), **V1** (tráiler horizontal) y **B1** (botonera con 12 sonidos distintos; **B2** = opción B, sintetizados), más el lore con fuentes (`guias_y_contexto/LORE_NAILONG.md`). Todo forma la **web 4.3.0** (la app sigue en 4.0.0). Ver `bitacora_de_sesiones/2026-11-27_textos_stickers.md`, `2026-11-27_visor_tráiler_botonera.md` y `2026-11-27_integracion_v4.3.md`.

## Pendiente tras la web 4.3.0

| # | Qué | Por qué | Esfuerzo |
|---|---|---|---|
| B3 | **Analizar episodios descargados por el usuario** (ffmpeg → faster-whisper → PANNs → recortes con hoja de escucha; extra: localizar con OpenCV la escena original de cada sticker). Episodios fuera del repositorio; herramientas (~2–3 GB) fuera del proyecto y solo con permiso; primero un episodio piloto. | Contexto real, diálogo y sonido exacto de cada sticker (sirve a los textos, al Visor y a la botonera). **Espera a que el usuario descargue los episodios.** | Medio–alto |
| B2-A | Pasar la botonera a **clips reales** de la serie. | El usuario quiere sonidos reales cuando tenga los episodios. Rompe la regla 3 y tiene riesgo de derechos de autor (`LORE_NAILONG.md` §8): necesita una decisión nueva (texto propuesto en la bitácora `2026-11-27_visor_tráiler_botonera.md` §6). | Medio |
| VM4 | Las otras ideas de `VM3`: juego «¿Qué está pasando?» (el sticker a cámara lenta y 3 títulos) y sonido sincronizado con el momento clave. | `notas_tecnicas/07_revision_textos_stickers/revision.json` ya guarda qué pasa en cada tramo de fotogramas. | Medio |
| W35 | Títulos del álbum cortados en el móvil: a 320 px caben 12–14 caracteres (`line-clamp-1`); con `line-clamp-2` se leerían enteros. | Comprobar el CLS, porque cambia la altura de las tarjetas. | Bajo |
| W36 | `og:image` y `twitter:image` con URL relativa: muchos servicios piden una absoluta para la vista previa al compartir. | No comprobado. | Bajo |
| W37 | Copias reducidas `mini/<clave>.webp` para los 12 cromos de la botonera (pesan ~3,3 MB). | Como `W33`. | Bajo |
| T3 | #30 (lata de cerveza de una marca real, edición de fans): el usuario lo dejó de momento con texto neutro. | Decidir si se queda en la colección. | Bajo |

## Web

| # | Qué | Por qué | Esfuerzo |
|---|---|---|---|
| W8 | El aviso de Tailwind en la consola sigue saliendo. | Es propio del CDN; quitarlo exigiría compilar Tailwind (rompe «sin build», D-15). | Medio |
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

- **`V1` hecho en la web 4.3.0:** en pantallas anchas se ve el tráiler horizontal y en el móvil en vertical, el de siempre.
