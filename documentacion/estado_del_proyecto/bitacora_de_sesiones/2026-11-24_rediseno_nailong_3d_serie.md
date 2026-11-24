# Bitácora de sesión — 2026-11-24 (rediseño integral de Nailong 3D fiel a la serie CGI)

## Qué se pidió
Mejorar a fondo el diseño 3D de Nailong para acercarlo a cómo luce en la serie real de *Seventh Impression* en textura, detalles, expresión y cara, tomando como referencia la carpeta con los 126 stickers oficiales y los *Shorts* del canal oficial `https://www.youtube.com/@Nailoongofficial`.

## Diagnóstico frente a la serie real (`@Nailoongofficial` Shorts `1cuNJaC13oo`, `aOg4vr3GT9M`, `vfOQGj1wTsU` y stickers)
1. **Boca plana sobre morro convexo:** `crearBoca` proyectaba una lámina casi plana sobre una esfera cerrada, sin cavidad 3D real, sin caída mandibular, sin piquito labial ni naricita de botón amarilla, y sin la doble herradura dental blanca de `sticker_5` / `sticker_96` / `vfOQGj1wTsU`.
2. **Ojos y cejas:** ojos demasiado juntos y abiertos mostrando blanco sobre el iris (aspecto asustado), casquete fino con costura sobre la frente, ausencia de sombra de contacto del párpado sobre la esclera y frente rígida sin cejas carnosas deformables.
3. **Textura y color:** amarillo yema saturado con brillo plástico y altas luces quemadas en frente y barriga, frente al amarillo natilla mate con micro-poro aterciopelado (*mochi* / vinilo suave) de la serie.
4. **Silueta y postizos:** muescas laterales en el cuello visto de espaldas, dos óvalos rosas flotando sobre las muñecas, garras diminutas pegadas y 3 bolas verde oscuro en vez de escamitas triangulares redondeadas mostaza-oliva y cola curvada hacia arriba.

## Decisiones confirmadas con el usuario
1. **Expresión neutra en reposo:** sonrisita tierna cerrada con hoyuelos y párpado superior relajado rozando el borde alto del iris, desplegando la cavidad 3D al gesticular o tocarle.
2. **Interfaz de expresiones:** añadir una tira compacta de **😊 Caritas de la serie** en chips deslizables en móvil (sin disparar la altura de la página) y rejilla en escritorio.
3. **Alcance:** rediseño integral en los 5 frentes directamente sobre `main`.

## Qué se hizo (`4.0.0 · revisión web 2`)
- **`js/11-nailong3d-geometria.js` (`VERSION: 2`):**
  - Cabeza *mochi* con arco supraciliar carnoso (`arcoCeja`), almohadilla del morro, `naricita` amarilla sin agujeros y hoyuelos C-infinito en comisuras.
  - Cuello continuo en espalda y costados (`kCuello = 0,106`) y pliegue suave solo bajo la barbilla frontal (`tBarbilla`).
  - Manoplas anchas con rubor palmar al ras por color de vértice (eliminados los óvalos rosas de las muñecas), planta cacao bajo los pies, pancita crema con núcleo limpio (`pancita ≈ 0,133`) y falda difusa, y cola erguida en 2 tramos.
  - `0` huecos, `0` aristas no-2 y `0` triángulos invertidos en todas las resoluciones (`0,026`, `0,0105`, `0,0085` y `0,0075`).
- **`js/12-nailong3d-escena.js`:**
  - `crearCaraDeformable`: deforma en 3D los vértices del rostro (~3,5 k vértices con `updateRange` acotado) para mover cejas de carne, pómulos, mandíbula inferior y un bolsillo cóncavo profundo tras la apertura bucal.
  - `crearBoca`: bóveda anular cóncava con rodete labial y falda `1,24×`, **doble herradura dental cerámica** (`Nailong_dientesSup`, `Nailong_dientesInf`) curvada hacia atrás (`rz = 0,036`) y **lengua 3D con surco central** (`Nailong_lengua`).
  - `crearOjos`: iris esmeralda calibrado (`ANG_IRIS = 0,67`, `PUPILA = 0,56`), párpados con grosor palpebral real, arqueo feliz `^ ^` (`arquear`) y oclusión ambiental dinámica en `inyectarOjoAO`.
  - Shader *mochi* (`3D1`): perturbación 3D bicapa de la normal antes de iluminar (`GLSL_MOCHI_NORMAL`) + compresión suave de altas luces.
  - 3 garras cónicas cacao espaciadas por mano/pie y 3 escamitas dorsales triangulares-redondeadas (`geoPlaca`) mostaza-oliva.
- **`js/13`, `js/14`, `index.html`, `css/styles.css` y `herramientas/certificar_3d.js` (`3D2`):**
  - Reposo sereno, micro-curiosidad de ocio y **6 nuevas caritas** (`Sonrisón`, `Carcajada`, `¡Bleh!`, `Puchero`, `Pillo`, `¡Susto!`) en el panel lateral y en pantalla completa; resaltado del botón activo, limpieza de burbujas previas, 11 clips horneados en `nailong_3d.glb` y sufijo `?v=4.0.0-web2`.

## Verificación (parte 1)
- **Geometría y suite `verify_all.py`:** pasan las **52 comprobaciones** (aislando solo las lecturas de `C:\src\nailong_stickers_app`, ausente en este equipo).
- **Navegador integrado (WebGL):** `0` errores de consola; iteradas y verificadas en primer plano (`×2` y `×3`) todas las vistas (frente, 3/4, perfil 90°, espalda 180°, modo *toon* y las 6 caritas); cero desborde horizontal a 320, 375, 768 y 1440 px (altura móvil: `9,66` pantallas); descarga `.glb` (`4.773.988 bytes`) validada con cabecera `glTF` v2 y sus 11 clips.

---

## Refinamiento anatómico y *cute* sobre 15 capturas reales de la serie (parte 2)

### Motivo del ajuste
Al revisar el primer rediseño frente a 15 capturas reales de episodios 3D de Nailong aportadas por el usuario (archivadas ahora en `documentacion/referencias_nailong_serie/`), se detectaron desviaciones respecto a la ternura y silueta oficial: cuello fundido tipo bolo sin voladizo frontal de barbilla, párpados demasiado caídos con repisa marrón y pupila pequeña en reposo (aspecto somnoliento/monstruoso), esclerótica triangular en 3/4 y perfil, *z-fighting*/*clipping* bucal en `sonrison`/`carcajada`/`susto`, bulto nasal/supraciliar inexistente en la serie y plantas cacao en vez de almohadillas rosa pálido.

### Qué se hizo
- **Archivo de referencias (`documentacion/referencias_nailong_serie/`):**
  - Copiadas, renombradas y verificadas visualmente las 15 capturas oficiales (`01_frente_triste.jpg` a `15_frente_celebracion_almohadillas.jpg`), redactado el catálogo anatómico en `README.md` y enlazado en `documentacion/00_INDICE.md`.
- **`js/11-nailong3d-geometria.js` (`VERSION: 3`):**
  - Eliminados `arcoCeja`, `naricita`, `menton` y `hoyuelo` de la SDF para dejar una cara 100 % lisa y tierna.
  - `kCuello` direccional: cintura nítida en frente y costados (`y = 0,52..0,56`) con separación real cabeza–cuello–hombros y voladizo (*overhang*) frontal de barbilla (`~0,10`) sobre el pecho, manteniendo la curva dorsal espalda–nuca continua.
  - Cuenca ocular redonda compacta (`r = 0,064`, `giro = 0,08`, `hundido = 0,81`) eliminando el pico triangular de esclerótica en 3/4 y perfil.
  - Cola cónica más baja con curva suave, paleta fuente única actualizada en `G.COLORES` (`amarillo: #F8C52C`, `crema: #FAF0C8`, `oliva: #8A9244`, `garra: #6B573E`, `rosa: #F5A6AE`) y almohadillas **rosa pálido** en plantas de los pies y palmas (ajustadas en `y = 0,276..0,299` para quedar ocultas en muñeca en reposo y visibles al saludar o en `burla`).
- **`js/12-nailong3d-escena.js` y `js/13-nailong3d-animacion.js`:**
  - **Ojos en reposo:** restaurada la apertura amplia y tierna (`parpSup = 0,98`, `parpInf = -0,98`), eliminada la repisa marrón `#B86614`, suavizado el AO palpebral, ampliado el iris esmeralda (`ANG_IRIS = 0,78`, `PUPILA = 0,66`) y 1 reflejo especular blanco nítido arriba-derecha.
  - **Boca y caritas sin *clipping* ni *z-fighting*:** anclaje en `y = 0,626`, sonrisita cerrada más ancha y arqueada en caramelo cálido legible (`#8E4B0C`), falda compacta (`1,07×`) igualada al shader *mochi* de la piel, ley compartida `pesoMandibula` acotada a `y > 0,515`, arco dental blanco sin colmillos, lengua dentro en `carcajada` (`bocaFuera = 0`, fuera solo en `burla`), `susto` en «o» limpia y eliminado el micro-hilito superior en `sonrison`.
  - **Detalles y animaciones:** las 6 caritas recalibradas al reposo abierto y sin roces de brazos en el pecho; 3 placas dorsales verde-oliva redondeadas (`#8A9244`) bajadas a la nuca (`ang = 0,72 / 1,16 / 1,58`); garras cortas y romas (`#6B573E`, también en modo *toon*). Conservado el shader mate *mochi* y la paleta cálida.

### Verificación final
- **12/12 vistas WebGL reales** (Chrome Headless CDP: frente, 3/4, perfil 90°, espalda 180°, primer plano, modo *toon* y las 6 caritas) auditadas ANTES vs DESPUÉS en 2 rondas frente a las 15 capturas oficiales: `0` errores de consola WebGL, silueta cabeza–cuello–hombros y voladizo de barbilla limpios, ojos tiernos abiertos, 6 caritas sin *clipping* ni *z-fighting*.
- **Geometría y pruebas automáticas:** `node --check` en verde en `js/11..14`; Test 49 de `verify_all.py` en verde (`25738` vértices, `huecos = 0`, `no2 = 0`, `inv = 0`, `pesosMal = 0`, `12` huesos, `altura = 1,0024`, `cab/tor = 0,909`, `tor = 0,593`, `pancita = 0,135`); tests 1–44, 50 (web stickers), 51 y 52 en verde (solo se detiene en L395 de `verify_all.py` por no existir `C:\src\nailong_stickers_app` en este equipo).
- **No comprobado:** iPhone/Android reales y apertura del `.glb` en Blender/Unity/Godot.

## Qué queda
- Probar en móvil real.
- Commit y `git push` cuando el usuario lo pida.
