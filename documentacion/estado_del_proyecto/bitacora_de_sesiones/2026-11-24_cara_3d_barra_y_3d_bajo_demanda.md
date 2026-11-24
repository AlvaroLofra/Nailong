# Bitácora de sesión — 24/11/2026: barra superior (W31), 3D apagado por defecto (D-26) y forma frontal de la cara (3D12)

> **Objetivo:** tres mejoras pedidas por el usuario antes de publicar: (1) poder ocultar el modelo 3D y que no se cargue ni gaste CPU/GPU hasta activarlo con un botón; (2) que la barra superior de escritorio no se quede pequeña ni saque el botón «¡Fiesta Duang!»; (3) acercar la forma frontal de la cabeza a la serie (mofletes más llenos y más estrecha de la frente hacia arriba) sin tocar lo que ya estaba bien.
> **Agente:** Claude Code (Opus) con el navegador integrado (GPU real) y las herramientas de la sesión Swarm.

---

## 1. Herramientas y método

- **Navegador integrado + servidor local:** `.claude/launch.json` (configuración local, fuera de Git) pasa de `python` a `py -3`, porque en este equipo `python` abre la Microsoft Store.
- **Bucle en vivo sin tocar ficheros:** `Nailong3DVisor.depurar.reconstruirAnatomia()` rehace la malla en ~0,4 s; con la cámara colocada en el ángulo de cada captura y la animación congelada se mide la silueta en el propio lienzo. Los valores ganadores se copian después a `js/11`.
- **Medición objetiva de la cara (nuevo, `3D12`):** `herramientas/perfil_cara.py` mide el ancho de la cabeza a cada altura igual en el render y en las capturas frontales `08`, `13`, `18` y `26`, en «alturas de ojo». `capturar_3d_cdp.js --cara` añade 6 vistas con el encuadre de las capturas (`cara_*`) y `evaluar_3d.py --cara` lo encadena todo.
- **Referencias:** el usuario añadió 11 capturas (`16`–`26`, sobre todo de frente). En `19`, `21`, `24` y `25` el fondo amarillo o el recorte falsean la silueta, así que se usan para mirar y no para medir.

## 2. W31 · Barra superior de escritorio

- **Diagnóstico medido:** la fila de la barra necesitaba más ancho del disponible entre 1.024 y 1.535 px: le faltaban 50 px a 1.024, 20 px a 1.280 y 29 px a 1.366–1.440 (la barra estaba limitada a 1.280 px con `max-w-7xl`). Desde 1.536 px cabía.
- **Cambio (`index.html`):** la barra puede crecer hasta `88rem` desde 1.280 px; enlaces en línea desde `xl` con márgenes algo más compactos hasta `2xl`; entre 1.024 y 1.279 px se usa el menú ☰ (los 10 enlaces no caben ni compactados) y la etiqueta «¡Fiesta Duang!» se ve en todos los anchos desde `sm`. De paso se arregló un desborde antiguo a 320 px (el ☰ se cortaba): por debajo de 360 px se oculta el texto «Nailong» del logo.
- **Comprobado:** 0 desborde a 1.024, 1.100, 1.279, 1.280, 1.366, 1.440, 1.536 y 1.920 px (con la fuente Fredoka ya cargada, que cambia las medidas), y el ☰ dentro de la barra a 320, 360 y 375 px; menú ☰ abierto a 1.024 px revisado en captura.

## 3. D-26 · Nailong 3D apagado por defecto y botón «Ocultar»

- **Antes:** el 3D se descargaba y arrancaba al acercarse a la sección (`IntersectionObserver` a 600 px) o al pulsar el enlace `🧊 3D`.
- **Ahora (`js/14`, `index.html`, `css/styles.css`):** cartel «Nailong 3D duerme en su huevo» con «🐣 Ver a Nailong en 3D». Nada se descarga hasta pulsarlo (o pulsar cualquier botón del panel). Nuevo botón «Ocultar» (`apagar()`): para el bucle, suelta `ResizeObserver` y oyentes, libera geometrías/materiales, `renderer.dispose()` + `forceContextLoss()` y cambia el `<canvas>`. El estilo elegido se conserva y el oyente de teclado se enlaza una sola vez. `?3d=1` y `?3d=debug` siguen encendiéndolo al cargar.
- **Comprobado en el navegador:** con la sección en pantalla, 0 peticiones a Three.js y a `js/11`–`js/13` y sin renderer; encendido en 525 ms; tras «Ocultar», contexto WebGL perdido, lienzo nuevo, bucle parado y foco en el botón; reencendido en 421 ms; una flecha gira una sola vez (−0,18 rad); «Salude» con el 3D apagado lo enciende y saluda; estilo «dibujo animado» conservado; 0 errores de consola.
- **`verify_all.py`:** test 49 ampliado (botones `#nailong-3d-cargar` y `#nailong-3d-ocultar`, sin `rootMargin` y con `forceContextLoss`).

## 4. 3D12 · Forma frontal de la cara

| Medida (serie = media de 08, 13, 18 y 26) | Serie | Antes | V1 | V2 | **V3** |
|---|---|---|---|---|---|
| `F1` altura del ancho máximo (`k`) | 1,267 | 0,829 | 1,286 | 1,314 | **1,292** |
| `F2` frente (`k = 0,5`) | 0,855 | 0,907 | 0,854 | 0,854 | **0,854** |
| `F3` sobre los ojos (`k = 0,8`) | 0,946 | 0,994 | 0,953 | 0,946 | **0,949** |
| `F4` bajo los mofletes (`k = 1,7`) | 0,928 | 0,826 | 0,888 | 0,918 | **0,918** |
| `O1` separación de ojos | 0,468 | 0,478 | 0,465 | 0,474 | **0,475** |
| Métricas de proporción (`medir_nailong3d.js`) | — | 21/21 | 19/21 | 21/21 | **21/21** |

- **Diagnóstico:** el modelo era más ancho en las sienes/ojos y se estrechaba bajo la boca; la serie es más ancha en los mofletes y se estrecha hacia la coronilla. Ojos y boca ya estaban bien colocados.
- **Primer intento descartado:** ensanchar mucho los mofletes cumplía la cara pero agrandaba la cabeza frente al cuerpo (`H6` 0,96 → 1,00; en `13`, `24` y `25` ronda 0,94).
- **V1** (solo radios de las piezas) y **V2** (solo curva de anchura en x) cumplían la cara; V1 fallaba `H4`/`H6` y V2 dejaba una marca horizontal en el moflete en 3/4 por el ensanche brusco de la papada.
- **V3 (aplicada, `js/11`):** `ANATOMIA.perfilCabeza` (curva Hermite monótona que solo estrecha de los ojos hacia arriba) + `mofletes` algo más llenos y bajos (`c = [0, 0,646, 0,096]`, `r = [0,223, 0,140, 0,194]`, `k.cabeza = 0,104`) + `ojo.x = 0,097`. Como solo escala x, el perfil lateral, la nuca y las placas (que se colocan en x = 0) no cambian; la papada baja 1 cm (`H5 0,500`, `T3 0,406`, en rango). La esfera envolvente de la cabeza crece con la escala máxima y el rubor sigue al moflete.
- **Comprobado:** `evaluar_3d.py --etiqueta 3d12_final --expresiones --cara` (24 vistas, 0 errores de consola/WebGL, 21/21 y 5/5); láminas `3d12_cara_ab/lamina_cara_actual_v1_v3.png`, `lamina_7vistas_actual_v3.png` y `_expresiones.png` (6 caritas y 5 acciones sin atravesamientos); malla estanca de 22.956 vértices en `verify_all.py`.

## 5. Verificación real y «No comprobado»

- **Comprobado:** `py -3 verify_all.py` → **52 comprobaciones en verde** (parte Android «no comprobada» en este equipo); `node --check` de `js/11`–`js/14`; pruebas en el navegador descritas arriba.
- **No comprobado:**
  - Móviles reales (iPhone Safari y Android Chrome): encender/ocultar el 3D, rendimiento y `W29`.
  - CLS de escritorio tras `W31` (no se volvió a medir).
  - APK, `.glb` en Blender/Unity/Godot y WhatsApp real (sin cambios en esta sesión).
  - Revisión visual del usuario de la cara V3 frente a V1.
- **Sin commit ni push** (pendiente de que el usuario lo pida).
