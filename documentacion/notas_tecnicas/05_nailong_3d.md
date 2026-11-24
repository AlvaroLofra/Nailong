# Nota técnica 05 · Nailong 3D (visor interactivo, cara deformable y exportador GLB)

> **Subsistema:** sección `#nailong-3d` de la web (entre «¿Quién es?» y «Stickers»). Decisión de arquitectura: **D-21** (rediseñado y refinado en `v4.0.0 · revisión web 2` contrastando los cromos oficiales y 15 capturas reales de episodios de la serie 3D).
> **Referencias visuales:** `documentacion/referencias_nailong_serie/README.md`, carpeta solo en local y fuera de Git por derechos de autor (D-25) (15 capturas oficiales catalogadas por ángulo, expresión y rasgos anatómicos).
> **Ficheros:** `js/11-nailong3d-geometria.js` · `js/12-nailong3d-escena.js` · `js/13-nailong3d-animacion.js` · `js/14-nailong3d-visor.js` · estilos `.n3d-*` al final de `css/styles.css`.
> **Prueba automática:** test 49 de `verify_all.py` (estructura, CDN fijada con SRI y prueba funcional de estanqueidad y proporciones en Node).

## 1. Qué hace
- Modelo 3D **procedural** de Nailong fiel a la serie CGI de *Seventh Impression* (sin ficheros de modelo binarios en el repo): se calcula en el navegador en ~0,25–0,35 s dentro de un Web Worker.
- Visor con cámara orbital (girar, zoom, teclado `+`/`-`/flechas), respiración bifásica, parpadeo asimétrico, mirada que sigue al puntero y reacciones por zona tocada.
- **5 acciones corporales** (`Salude`, `¡Duang!`, `Baile`, `Sorpresa`, `Siesta`) y **6 caritas icónicas de la serie** (`Sonrisón`, `Carcajada`, `¡Bleh!`, `Puchero`, `Pillo`, `¡Susto!`); estilo «Sticker 3D» (*mochi* mate) o «Dibujo animado» (*cel-shading*); foto PNG transparente y descarga `nailong_3d.glb` con 11 clips.

Analogía: en vez de pegar bolas de plastilina o una pegatina de boca sobre un globo, el cuerpo se esculpe como una «niebla» continua que se congela en una sola piel estanca, y unos músculos virtuales mueven cejas, pómulos, mandíbula y bolsillo oral alrededor de dientes y lengua tridimensionales reales.

## 2. Anatomía canónica (de dónde sale cada medida)
Calibrada sobre las 15 capturas reales de episodios de `referencias_nailong_serie/` (solo en local) y los cromos oficiales. Altura total = 1 (1 m en el GLB), pies en `y = 0`, cara hacia `+z`.

| Rasgo | Referencia | Cómo se modela |
|---|---|---|
| Separación cabeza–cuello–hombros, voladizo frontal de barbilla y nuca continua | Capturas `01`, `05`, `06`, `08`, `13`, `14` | `kCuello` direccional: cintura nítida en frente y costados (`y = 0,52..0,56`) que separa cabeza, cuello y hombros con un voladizo (*overhang*) frontal de barbilla de `~0,10` sobre el pecho, manteniendo la curva dorsal espalda–nuca suave y continua en perfil. |
| Cara completamente lisa (sin bulto nasal ni arcos superciliares prominentes) | Capturas `05`, `06`, `08`, `12` | Se eliminan `arcoCeja`, `naricita`, `menton` y `hoyuelo` de la SDF para conservar el perfil limpio y adorable de la serie; las cejas expresivas se deforman solo al gesticular mediante `crearCaraDeformable`. |
| Ojos grandes, redondos y bien abiertos en reposo | Capturas `08`, `12`, `13`, `14` | Cuenca redonda compacta (`r = 0,064`, `giro = 0,08`, `hundido = 0,81`) sin esclerótica triangular en 3/4 ni perfil; párpados muy abiertos en reposo (`parpSup = 0,98`, `parpInf = -0,98`, sin repisa oscura), iris esmeralda grande (`ANG_IRIS = 0,78`, `PUPILA = 0,66`), reflejo blanco nítido arriba-derecha y AO palpebral suave. |
| Sonrisita dulce en reposo y cavidad bucal 3D limpia al abrir | Capturas `02`, `03`, `07`, `08`, `13`, `15` | Anclaje en `y = 0,626` con sonrisita cerrada limpia en tono caramelo cálido (`#8E4B0C`). Al abrir, `crearCaraDeformable` aplica la ley compartida `pesoMandibula` acotada a `y > 0,515` (sin tirar del cuello ni pecho) y hunde un bolsillo oral estricto sin *z-fighting* ni *clipping*, alojando arco dental blanco uniforme (sin colmillos) y lengua 3D (`bocaFuera = 0` en `carcajada`, fuera solo en `burla`). |
| Piel amarillo cálido con acabado mate aterciopelado (*mochi*) y pancita crema | Capturas `08`, `12`, `13` | Paleta fuente única en `G.COLORES` (`amarillo: #F8C52C`, `crema: #FAF0C8`); micro-perturbación 3D de la normal (`GLSL_MOCHI_NORMAL` en `vPosReposo`), *sheen* suave, rubor melocotón difuso en mejillas y pancita crema amplia y limpia (`pancita ≈ 0,135`). |
| Almohadillas rosa pálido en palmas y plantas + 3 garras cortas romas | Capturas `02`, `03`, `05`, `08`, `11`, `13`, `15` | Almohadillas ovaladas rosa pálido (`#F5A6AE`) pintadas por vértice en las plantas de los pies y en la cara palmar (ocultas en la muñeca en reposo, visibles al saludar o en `¡Bleh!`); 3 garras cortas y redondeadas marrón-oliva (`#6B573E`) por mano y por pie. |
| 3 placas dorsales verde-oliva en nuca y cola cónica baja | Capturas `05`, `09`, `10`, `11`, `14` | Exactamente 3 placas redondeadas suaves (`#8A9244`) en la curva alta de la nuca (`ang = 0,72 / 1,16 / 1,58`; espalda media y baja lisa) y cola cónica baja que curva suavemente hacia atrás-arriba. |

## 3. Arquitectura (4 scripts clásicos, orden de carga 11 → 14)
1. **`js/11` · núcleo geométrico** (`VERSION: 3`, sin THREE ni DOM; corre en Worker, navegador y Node):
   - SDF con elipsoides, conos redondeados, unión/diferencia polinómica suave, cuello direccional y esferas envolventes.
   - **Surface Nets en banda estrecha** con `0` huecos, `0` aristas no-2 y `0` triángulos invertidos en todas las resoluciones (`0,0105` en móvil/Node = `25738` vértices; `0,0085` en escritorio; proxy `0,026`).
   - Pesos de piel para los **12 huesos** y paleta canónica en `G.COLORES` (amarillo cálido, pancita crema, rubor de mejillas y almohadillas rosa pálido en palmas y plantas).
2. **`js/12` · escena, cara deformable y materiales**:
   - `crearCaraDeformable`: pre-indexa solo los vértices faciales (`y > 0,515` para mandíbula/boca, con `updateRange` acotado y salida inmediata si no hay cambio) para mover cejas, pómulos, mandíbula y bolsillo oral cóncavo sin deformar el cuello; `Nailong_contorno` comparte la misma geometría.
   - `crearBoca`: malla anular igualada al shader *mochi* de la piel con falda compacta (`1,07×`), sonrisita cerrada caramelo cálido (`#8E4B0C`), bóveda burdeos profunda, arco dental superior limpio sin colmillos y lengua 3D con surco central.
   - `crearOjos`: párpados abiertos en reposo (`0,98 / -0,98`), arqueo `^ ^` (`arquear`), inclinación lateral y shader `inyectarOjoAO` suave fijo respecto al pivote.
   - Materiales «suave» (*mochi* con micro-bump normal 3D y onda táctil), «toon» (4 bandas + casco invertido alineado con `G.COLORES`) y «exportar» (`MeshStandardMaterial`).
3. **`js/13` · animación y expresiones**: muelles amortiguados a paso fijo (`1/120 s`) para cuerpo, ojos/párpados (`guiñoDer`, `ojoRisa`, `parpInclina`) y cara/boca. Incluye reposo sereno, micro-curiosidad de ocio, las 5 acciones, reacciones por región tocada y las **6 caritas de la serie** (`sonrison`, `carcajada`, `burla`, `puchero`, `pillo`, `susto`) calibradas al reposo abierto y sin roces de brazos en el pecho, además de `hornear()` determinista.
4. **`js/14` · visor**: carga perezosa de Three.js r147 con SRI (`IntersectionObserver` a 600 px), pausa fuera de pantalla, resaltado del chip activo, foto PNG y exportación `nailong_3d.glb` con **11 clips horneados**.

## 4. Cómo retocar sin romper nada
- Proporciones: `ANATOMIA` y `COLORES` en `js/11` (fuente única consumida por `js/12`). El test 49 de `verify_all.py` vigila estanqueidad (`huecos == 0`, `no2 == 0`, `inv == 0`), 12 huesos, altura ≈ 1 sobre `y = 0`, relaciones cabeza/torso (`0,8..0,95`) y torso/altura (`0,5..0,66`), y proporción de pancita crema (`0,08..0,3`).
- Si ajustas la profundidad de `Nailong_boca` (`profMax`), mantén sincronizada la ley `pesoMandibula` (`y > 0,515`) y el bolsillo oral en `crearCaraDeformable` para evitar *z-fighting* o que el cráneo asome dentro del paladar.
- Cero caracteres CJK y cero etiquetas HTML sueltas en comentarios JS (lo comprueban los tests 11 y 47 de `verify_all.py`).

## 5. Limitaciones conocidas y plan de mejora (24/11/2026)
Las medidas, los objetivos y el orden de trabajo están en [`../estado_del_proyecto/PLAN_FIDELIDAD_NAILONG_3D.md`](../estado_del_proyecto/PLAN_FIDELIDAD_NAILONG_3D.md) (mejoras 3D5–3D11). Resumen frente a las capturas de la serie (H = altura total):
- **Brazos:** nacen dentro del pecho (`brazo.a` en x = 0,176) y solo asoman 0,12 H, cuando en la serie asoman ≈0,20–0,28. No tienen codo: hay un hueso por brazo. Al alzarlos arrastran el costado («efecto aleta»), por la unión ancha `k.hombro` y por los pesos de piel con `tau = 0.022`.
- **Piernas y cola:** las piernas asoman 0,06 H (serie ≈0,10–0,15) y no hay hueco entre ellas. La cola sobresale 0,145 H (serie ≈0,29).
- **Torso y cabeza:**
  - El torso tiene 0,54 H de fondo (serie ≈0,40).
  - El voladizo de ~0,10 de la §2 es sobre el **pecho**; sobre la barriga es 0,00, porque la barriga sobresale tanto como la cara.
  - La coronilla es estrecha: 0,71 del ancho máximo, frente a ≈0,78 en la serie.
- **Pancita:** el núcleo crema mide como en la serie, pero el halo (`falda: 1.36`) la extiende del suelo a la barbilla y la hace envolver los costados.
- **Antes de retocar:** aplica la fase 0 del plan (lámina «render | captura» y medidas automáticas) y sigue su orden. La cabeza va siempre sola y al final, porque la boca, la cara deformable y el rubor dependen de cortes fijos en `js/11` y `js/12`.
