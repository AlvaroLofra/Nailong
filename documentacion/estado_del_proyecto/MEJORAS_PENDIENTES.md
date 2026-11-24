# Mejoras pendientes (visuales y de interfaz)

> Lista viva de ideas **no aplicadas**.
> - Las A1–A7 y W1–W5 de la revisión de la v3.3.2 se aplicaron en la **v3.3.3** (ver `CHANGELOG.md`).
> - Las A8–A13 y W6–W7 (junto con el zoom grande centrado con transición y el botón «Ver (N) ❯» para revisar «Mi Selección») se aplicaron en la **v3.5.0** (ver `CHANGELOG.md`).
> - Las mejoras **W9** (frases del muñeco acompañante detectando la sección visible en viewport + frase para `#nailong-3d`) y **W10** (enlace `🧊 3D` y barra de navegación compacta desde `1024 px`) se aplicaron en la **v4.0.0** (ver `CHANGELOG.md` y D-24).
> - Las mejoras **W21** (botón de pausa de partículas), **W22** (`autofocus` en cerrar de los 4 `<dialog>`), **W23** (contraste WCAG AA ≥ 4,5:1 en todos los textos), **W24** (prioridad LCP en `sticker_19.webp` y lazy en `sticker_2.webp`), **W25** (carga diferida de `js/11`–`js/13` desde `js/14`), **W27** (arranque diferido en `js/10-inicio.js`), **W28** (CLS escritorio `0,11 → 0,0042`) y **W30** (área táctil de `#power-size-slider` ≥ 28 px) se aplicaron el **24/11/2026 (sesión Swarm)** (pendiente de commit/push en `main`; ver `bitacora_de_sesiones/2026-11-24_mejoras_3d_y_web_swarm.md`).
> - Las mejoras **3D3** (sticker 512×512 WebP con EXIF WhatsApp desde la pose actual) y **3D5–3D10** (Fase 0 de herramientas de medición/captura CDP/lámina/`?3d=debug` y Fase 1 completa de proporciones de la serie hasta **21/21 OK** con 15 huesos y cabeza en judía inclinada) se aplicaron el **24/11/2026 (sesión Swarm)** (pendiente de commit/push en `main`).

## Web

| # | Qué | Por qué | Esfuerzo |
|---|---|---|---|
| W8 | El aviso de Tailwind en la consola sigue saliendo. | Es propio del CDN; quitarlo exigiría compilar Tailwind (rompe «sin build», D-15). | Medio |
| W11 | Pasar a clave estable (`data-sticker`, D-22) el resto de imágenes fijadas por número: hero y muñeco acompañante (`index.html`, `js/03-hero.js`), disfraces del laboratorio y botonera (`js/07-sonidos-y-laboratorio.js`), visor mágico (`js/05-visor-magico.js`), favicon y `og:image`. Revisar antes con el usuario las que no encajan con su etiqueta: «Bailarín» → 6 (Chef Pastelero), «Superalas» → 90 (DJ con gafitas), «Palomitas» → 55 (Dino disfrazado), «¡Llamita Bebé!» → 32 (*gasp* ofendido). | Así ninguna imagen se desplaza en la próxima renumeración; hoy solo «¿Quién es Nailong?» está protegida. | Bajo–medio |
| W26 | El CDN de Tailwind compila el CSS en el navegador y bloquea el primer pintado (≈ 270 ms de script con CPU ×4). | Es la principal causa del FCP lento. Quitarlo exige generar el CSS una vez (relacionado con W8) y choca con «sin build» (D-15): **decisión del usuario**. | Medio–alto |
| W29 | En móvil lento, un toque en la barra inferior tardó hasta ~2 s en responder mientras arrancaba el visor 3D (hilo principal ocupado). | La medición usó WebGL por software (SwiftShader) y probablemente exagera; **comprobar en un móvil real** antes de actuar. | Medio |

### Modernización web (plugin `Modern Web Guidance`): cerrada el 2026-11-15
> Evaluadas las propuestas W12–W20. Aplicadas W12, W14, W17 y W19 (esta última solo para Firefox); W21 y W22 aplicadas el 24/11/2026. Descartadas W13, W15, W16, W18 y la reescritura de W20. Motivos en D-23 (`DECISIONES.md`).

**Plan de vuelta atrás para publicar:** la última versión publicada es `origin/main` = `32816a2`. Si algo falla tras el `git push`, se publica la vuelta atrás con `git revert` de los commits nuevos (sin reescribir el historial) y GitHub Pages vuelve a servir el estado anterior en unos minutos.

## Seguridad
Decisiones y acciones pendientes: `notas_tecnicas/06_auditoria_seguridad.md` (H-2 a H-8).

## Nailong 3D
> - Las mejoras **3D1** (micro-grano aterciopelado *mochi*) y **3D2** (6 caritas de la serie) se aplicaron en `4.0.0 · revisión web 2`.
> - Las mejoras **3D3** (sticker 512×512 WebP desde la pose actual) y **3D5–3D10** (herramientas automáticas de evaluación + proporciones 21/21 OK de [`PLAN_FIDELIDAD_NAILONG_3D.md`](PLAN_FIDELIDAD_NAILONG_3D.md)) se aplicaron el **24/11/2026** en la sesión Swarm.

| # | Qué | Por qué | Esfuerzo |
|---|---|---|---|
| 3D4 | Vista en realidad aumentada (`model-viewer`/USDZ). | Aplazada por el usuario. Ver a Nailong en tu mesa desde el móvil. | Alto |
| 3D11 | **Piloto opcional con Blender** (gratis, GPL; script `blender -b -P` y conector MCP oficial de Blender) en una rama aparte. Compuerta abierta **solo tras la revisión visual del usuario** sobre el resultado de 3D6–3D10 (21/21 OK). | Modelado, esqueleto (Rigify) y expresiones (*shape keys* → *morph targets* glTF) de nivel profesional. Reabre D-21 porque la web cargaría un `.glb`, así que es **decisión del usuario**. El conector ejecuta Python del LLM sin protecciones (recomiendan una máquina virtual). | Alto |

## Vídeo promocional
- La versión 2 ya está publicada en la web (`video-promo/nailong_trailer_v2.mp4`).
