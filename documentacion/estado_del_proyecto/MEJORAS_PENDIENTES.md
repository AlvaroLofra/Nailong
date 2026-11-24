# Mejoras pendientes (visuales y de interfaz)

> Lista viva de ideas **no aplicadas**.
> - Las A1–A7 y W1–W5 de la revisión de la v3.3.2 se aplicaron en la **v3.3.3** (ver `CHANGELOG.md`).
> - Las A8–A13 y W6–W7 (junto con el zoom grande centrado con transición y el botón «Ver (N) ❯» para revisar «Mi Selección») se aplicaron en la **v3.5.0** (ver `CHANGELOG.md`).
> - Las mejoras **W9** (frases del muñeco acompañante detectando la sección visible en viewport + frase para `#nailong-3d`) y **W10** (enlace `🧊 3D` y barra de navegación compacta desde `1024 px`) se aplicaron en la **v4.0.0** (ver `CHANGELOG.md` y D-24).

## Web

| # | Qué | Por qué | Esfuerzo |
|---|---|---|---|
| W8 | El aviso de Tailwind en la consola sigue saliendo. | Es propio del CDN; quitarlo exigiría compilar Tailwind (rompe «sin build», D-15). | Medio |
| W11 | Pasar a clave estable (`data-sticker`, D-22) el resto de imágenes fijadas por número: hero y muñeco acompañante (`index.html`, `js/03-hero.js`), disfraces del laboratorio y botonera (`js/07-sonidos-y-laboratorio.js`), visor mágico (`js/05-visor-magico.js`), favicon y `og:image`. Revisar antes con el usuario las que no encajan con su etiqueta: «Bailarín» → 6 (Chef Pastelero), «Superalas» → 90 (DJ con gafitas), «Palomitas» → 55 (Dino disfrazado), «¡Llamita Bebé!» → 32 (*gasp* ofendido). | Así ninguna imagen se desplaza en la próxima renumeración; hoy solo «¿Quién es Nailong?» está protegida. | Bajo–medio |

### Modernización web (plugin `Modern Web Guidance`): cerrada el 2026-11-15

> Evaluadas las propuestas W12–W20. Aplicadas W12, W14, W17 y W19 (esta última solo para Firefox). Descartadas W13, W15, W16, W18 y la reescritura de W20. Motivos en D-23 (`DECISIONES.md`).

| # | Qué | Por qué | Esfuerzo |
|---|---|---|---|
| W21 | Botón visible para pausar las partículas de fondo (resto de W20). | Accesibilidad: animación continua de más de 5 s. Hoy ya se desactivan con `prefers-reduced-motion`. | Bajo |
| W22 | Al abrir un modal, el foco inicial cae en la tarjeta con scroll en vez de en el botón de cerrar. | Poner `autofocus` en el botón de cerrar de cada `<dialog>` y comprobarlo con teclado. | Bajo |

### Rendimiento y accesibilidad: revisión previa a publicar (2026-11-24, `4.0.0-web2`)

> **Cómo se midió:** el Chrome instalado en el equipo, sin interfaz, controlado por CDP desde el servidor local (`python -m http.server`, sin compresión ni HTTP/2), móvil 375×812 con el perfil «Slow 4G» de Lighthouse (150 ms, 1,6 Mbit/s, CPU ×4) y caché desactivada; 3 pasadas. Lighthouse no está instalado en el equipo: son métricas equivalentes medidas con `PerformanceObserver`, no la puntuación oficial. En GitHub Pages (compresión y HTTP/2) la carga real será algo mejor. El contraste se calculó con la fórmula WCAG sobre los estilos computados a 375 y 1024 px.
>
> | Métrica | Móvil lento | Escritorio | Umbral «bueno» |
> |---|---|---|---|
> | FCP | 4,3–4,9 s | 0,38 s | ≤ 1,8 s |
> | **LCP** (imagen principal `sticker_19.webp`) | **8,7–9,1 s** | 0,38 s | ≤ 2,5 s |
> | **TBT** (bloqueo del hilo principal) | **≈ 1,4 s** | 0,12 s | ≤ 0,2 s |
> | CLS | 0,054 | **0,11** | ≤ 0,1 |
> | INP aproximado (4 toques) | 0,5–2,4 s | 0,19 s | ≤ 0,2 s |
> | Transferido en la carga | 2,6–3,0 MB en 31–32 peticiones | 2,9 MB | — |
>
> Accesibilidad sin fallos en: `lang="es"`, `alt` en todas las imágenes, nombre accesible en botones y enlaces, ids únicos y zoom permitido.

| # | Qué | Por qué | Esfuerzo |
|---|---|---|---|
| W23 | **Contraste insuficiente (WCAG AA) en 17 textos.** Texto blanco sobre el naranja de marca `#FF9F1C` (2,05:1; mínimo 4,5:1) en las etiquetas de sección («🧊 NAILONG EN 3D», «🔊 BOTONERA…», «⚡ LABORATORIO…»), «▶️ ¡Jugar Ahora!», «¡Añade tu Foto o Cromo!», los botones de confeti, `#nailong-3d-glb` y las etiquetas «App Android» y «Tráiler»; texto naranja sobre blanco o crema (1,94–2,05:1) en `#game-score`, `#belly-counter` y el titular «Nailong»; blanco sobre verde WhatsApp `#25D366` (1,98:1) y sobre esmeralda `#10B981` en `#nailong-3d-foto` (2,54:1). Otros 12 textos sobre degradados no se pudieron medir automáticamente. | Propuesta: texto marrón oscuro (`amber-950`) sobre el naranja, que conserva el color de marca y supera 7:1, o un naranja más oscuro (`#C2410C`, 5,2:1) solo donde haya texto blanco. Decisión visual del usuario. | Bajo–medio |
| W24 | `sticker_2.webp` (500 KB, animado) se carga sin `loading="lazy"` en el avatar de la marca (`index.html` l. 60) y en el banner de la app (l. 455). | Compite con la imagen principal en la primera carga; con una versión fija pequeña o con carga diferida, el LCP mejora en redes lentas. | Bajo |
| W25 | Los scripts del 3D (`js/11–14`, ≈ 170 KB) se descargan y ejecutan en todas las visitas, aunque el visor se carga bajo demanda. | Cargarlos al acercarse a `#nailong-3d` reduciría el bloqueo inicial. Hay que respetar el orden de carga de los scripts clásicos (D-15). | Medio |
| W26 | El CDN de Tailwind compila el CSS en el navegador y bloquea el primer pintado (≈ 270 ms de script con CPU ×4). | Es la principal causa del FCP lento. Quitarlo exige generar el CSS una vez (relacionado con W8) y choca con «sin build» (D-15): **decisión del usuario**. | Medio–alto |
| W27 | `js/10-inicio.js` ejecuta ≈ 280 ms de script al arrancar con CPU ×4 (≈ 70 ms reales). | Revisar qué se inicializa al cargar y diferir lo que no se ve. | Bajo |
| W28 | CLS de 0,11 en escritorio: a los ~0,4 s se desplazan la columna del héroe, `#historia` y el bocadillo `nailong-speech`. | Reservar el espacio (alto mínimo o `aspect-ratio`) de lo que aparece después de la primera pintada. | Bajo |
| W29 | En móvil lento, un toque en la barra inferior tardó hasta ~2 s en responder mientras arrancaba el visor 3D (hilo principal ocupado). | La medición usa WebGL por software (SwiftShader) y probablemente exagera; **comprobar en un móvil real** antes de actuar. | Medio |
| W30 | El deslizador `#power-size-slider` mide 16 px de alto. | Objetivo táctil por debajo de 24 px (WCAG 2.2, 2.5.8). | Bajo |

**Plan de vuelta atrás para publicar:** la última versión publicada es `origin/main` = `32816a2`. Si algo falla tras el `git push`, se publica la vuelta atrás con `git revert` de los commits nuevos (sin reescribir el historial) y GitHub Pages vuelve a servir el estado anterior en unos minutos.

## Seguridad
Decisiones y acciones pendientes: `notas_tecnicas/06_auditoria_seguridad.md` (H-2 a H-8).

## Nailong 3D
> Las mejoras **3D1** (micro-grano aterciopelado *mochi* / *peach fuzz* en el shader de la piel) y **3D2** (nuevas expresiones de la serie: sonrisón con herradura dental, carcajada `^ ^`, lengua fuera `¡Bleh!`, puchero, ceño pillo y susto) se aplicaron en `4.0.0 · revisión web 2` (ver `CHANGELOG.md` y `notas_tecnicas/05_nailong_3d.md`).

| # | Qué | Por qué | Esfuerzo |
|---|---|---|---|
| 3D3 | Crear un sticker 512×512 WebP desde la pose actual. | Conecta el 3D con la colección de stickers. | Medio |
| 3D4 | Vista en realidad aumentada (`model-viewer`/USDZ). | Ver a Nailong en tu mesa desde el móvil. | Alto |

### Fidelidad a la serie: proporciones (evaluación del 2026-11-24)

> **Plan completo:** [`PLAN_FIDELIDAD_NAILONG_3D.md`](PLAN_FIDELIDAD_NAILONG_3D.md). Contiene las medidas del modelo frente a las capturas, los objetivos numéricos, el mapa de líneas de código afectadas, los riesgos, las herramientas 3D evaluadas con sus fuentes y los scripts para medir y comparar.
>
> **Resumen:**
> - Las cuatro observaciones del usuario se han confirmado con medidas.
> - Brazos, piernas y cola nacen dentro de un torso demasiado profundo (0,54 de la altura frente a ≈0,40 en la serie) y apenas asoman.
> - La cara no sobresale de la barriga, y la pancita tiene un halo que la agranda.
> - La tecnología actual basta para corregirlo. Falta que el agente vea y mida cada cambio contra la serie (3D5).
>
> **Orden obligatorio:** 3D5 → 3D6 → 3D7 → 3D8 → 3D9 → 3D10, con una por sesión y la cabeza siempre sola. 3D11 es opcional y lo decide el usuario. Las medidas usan H = altura total.

| # | Qué | Por qué | Esfuerzo |
|---|---|---|---|
| 3D5 | **Fase 0 · «Ojos» del agente.** Incluye:<br>• herramienta de medidas (`herramientas/medir_nailong3d.js`, a partir del anexo A del plan);<br>• lámina automática «render \| captura» en 7 vistas emparejadas (anexos B y D), con aviso si faltan las capturas, que solo están en local (D-25);<br>• opcional: panel de deslizadores sin dependencias en `?3d=debug`. | Hoy los agentes ajustan números del SDF sin ver el resultado junto a la serie ni medirlo. Con lámina y medidas, cada cambio se compara y se acepta o se rechaza con datos. Es requisito de 3D6 a 3D10. | Bajo–medio |
| 3D6 | **Torso y pancita.**<br>• Fondo del torso de 0,54 a 0,38–0,42 y ancho de 0,58 a 0,48–0,52.<br>• Pancita con borde nítido (sin el halo de `falda: 1.36`), base a ≈0,10 y sin envolver los costados. | Punto 4 del usuario (captura `05`). Comparte causa con el punto 3, porque la barriga tapa el voladizo de la cabeza. El núcleo blanco ya mide como en la serie (0,33 × 0,36); lo que sobra son el halo (borde visible de 0,39 × 0,46, del suelo a la barbilla) y el volumen. | Bajo |
| 3D7 | **Piernas visibles.** Pierna visible de 0,06 a 0,12–0,14 y hueco entre piernas ≥ 0,07. Para ello se sube el fondo del torso, se alarga el muslo y se mantienen los pies planos con 3 garras. | Punto 3 del usuario (capturas `04` y `05`): hoy las piernas están enterradas en la cadera. | Medio |
| 3D8 | **Brazos largos e independientes, con codo.**<br>• Hombro más alto (de 0,43 a 0,47–0,50) y algo más atrás.<br>• Parte libre de 0,12 a 0,20–0,24 y grosor de 0,14 a 0,10–0,12.<br>• Dos tramos con codo (2 huesos más), axila nítida y saludo sin «efecto aleta», que hoy arrastra el costado. | Punto 1 del usuario (capturas `03`, `10`, `11` y `15`). Tiene efecto dominó: 90 usos de canales de brazo en `js/13` (acciones, caritas y reacciones), además de garras, palma rosa, regiones táctiles y el test 49 (número de huesos). | Alto |
| 3D9 | **Cola larga.** Que sobresalga 0,26–0,30 de la espalda (hoy 0,145), casi horizontal, con la raíz gruesa a ≈0,15–0,18 y la punta roma. Opcional: un hueso intermedio para que menee en curva. | Punto 2 del usuario (captura `11`). | Bajo–medio |
| 3D10 | **Cabeza redondeada y adelantada.**<br>• Voladizo de la cara sobre la barriga de 0,00 a 0,10–0,14, adelantando la cabeza sin alargarla.<br>• Coronilla más ancha (de 0,71 a ≥ 0,76 del ancho máximo), mofletes sin «falda» y hocico-mandíbula convexo.<br>• Hay que volver a anclar la boca, la cara deformable y el rubor, y revalidar las 6 caritas. | Punto 3 del usuario (capturas `06`, `12` y `14`). Es el cambio más delicado: boca, cara y caritas dependen de cortes fijos en la cabeza. Se hace solo y al final. | Alto |
| 3D11 | **Piloto opcional con Blender** (gratis, GPL; script `blender -b -P` y conector MCP oficial de Blender) en una rama aparte. Solo si, tras 3D6–3D10, siguen faltando deformaciones o caras de nivel de serie. | Modelado, esqueleto (Rigify) y expresiones (*shape keys* → *morph targets* glTF) de nivel profesional. Reabre D-21 porque la web cargaría un `.glb`, así que es **decisión del usuario**. El conector ejecuta Python del LLM sin protecciones (recomiendan una máquina virtual). | Alto |

## Vídeo promocional
- La versión 2 ya está publicada en la web (`video-promo/nailong_trailer_v2.mp4`).
