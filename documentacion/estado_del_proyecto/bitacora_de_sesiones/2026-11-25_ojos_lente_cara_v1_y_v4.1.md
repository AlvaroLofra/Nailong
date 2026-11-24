# Bitácora de sesión — 25/11/2026: cara «V1 afinada», ojos «lente» a ras (3D13) y publicación de la web 4.1.0

> **Objetivo:** continuar la sesión del 24/11 (`2026-11-24_cara_3d_barra_y_3d_bajo_demanda.md`): (1) aplicar la cara «V1» que el usuario prefería a la «V3»; (2) corregir los ojos «saltones» para que queden lisos y a ras de la cara, como en la serie; (3) guardar el Nailong anterior y publicar todo en GitHub como versión 4.1.
> **Agente:** Claude Code (Opus), sesión lanzada desde la anterior, con Node, Chrome sin interfaz (CDP) y el navegador integrado.

---

## 1. Cara «V1 afinada» (`3D12`)

- **Punto de partida:** V1 (solo piezas) cumplía la cara (5/5) pero daba 19/21 de proporción: `H4 = 0,748` (coronilla estrecha) y `H6 = 0,979` (mofletes anchos frente al torso).
- **Barrido en Node** (`medir_nailong3d.js` sobre copias de `js/11` con `ANATOMIA` mezclada): `H3`/`H4` van a saltos de 0,004 por la rejilla de medida, así que estrechar solo los mofletes exigía `0,223–0,224`, y entonces la cara se volvía un «cuadrado redondeado» y `F3` quedaba al límite. Mejor: mofletes `0,226` + `k.cabeza 0,104` (`H6 = 0,967`) y `perfilCabeza` solo en la coronilla (`+1,5 %`, `H4 = 0,771`).
- **Lámina** `comparativas/3d12_v1_afinada/lamina_corta_v1_afinada.png` (V1 · V1 afinada · V3 · serie): la afinada conserva la campana de V1.
- **Aprendizaje de herramientas:** con 4 capturas CDP en paralelo SwiftShader pasa de ~11 s a ~10 min por captura; como mucho 2 a la vez.

## 2. Ojos «lente» (`3D13`, D-28)

- **Medido antes de tocar:** el globo asomaba hasta **12,7 mm** de la piel lisa (la estimación previa de 9 mm no contaba la inclinación de la cara). Causas: bola de 62 mm mucho más curva que la cara (radio horizontal ~230 mm, casi plana en vertical); eje del ojo casi al frente mientras la piel mira 24° hacia la sien y 17° hacia arriba; cuenca esférica que dejaba ver el costado de la bola por la sien y un hoyo de 12–20 mm por la nariz y abajo.
- **Variante A (hundir la bola):** con `hundido = 1,1` deja de asomar (0,6 mm), pero el ojo se ve pequeño y metido en un agujero. Descartada (lámina).
- **Variante B (aplicada):** el globo esférico de siempre se lleva a una lente con `z' = a·x + b·y + lente·z` (`lente = 0,25`, pendiente de la piel lisa con `inclinar = [1, 0,8]`). En `js/12`, `marcoOjo` lo descompone por SVD (Jacobi) en giro · escala · giro: nodos TRS válidos en glTF, con párpados, brillo y mirada girando dentro como siempre. En `js/11`, ventana elíptica tallada a lo largo del eje del ojo con fondo bajo la lente (`VENTANA`), desplazada hacia la sien y arriba (`abertura = [0,61, 0,68]`, `centro = [0,12, 0,10]`) para que, como en `08`, `13` y `26`, el iris toque el borde de la nariz y el de abajo.
- **Ajustes vistos en primeros planos:** la pupila salía gris (barniz y reflejo de entorno sobre una superficie casi plana) → material sin barniz (`roughness 0,45`, `envMapIntensity 0,12`, `specularIntensity 0,25`); con `K.cuenca = 0,016` el borde hacía dientes de sierra → se mantiene `0,024`.
- **Efecto en las medidas de cara:** la silueta de la cabeza es idéntica píxel a píxel, pero `perfil_cara.py` usa como línea de los ojos el centro de los píxeles verdes del iris, que con la lente (iluminada por igual) baja 3 px. Todas las `F` se recalculan y `F4` caía a `0,862`. Se llenó la papada (`perfilCabeza` `1,035–1,045` bajo `y = 0,58`), que es lo que le faltaba frente a la serie, y `F4` vuelve a `0,890`. `O1` pasa a `0,454` por el mismo efecto (cajas del iris: −1,8 %).
- **Herramientas nuevas:** `herramientas/medir_ojos_3d.js` (sobresale, asoma fuera de la ventana, pliegue; `--abre`, `--json`) y `capturar_3d_cdp.js --ojos` (12 primeros planos de 900×900).

## 3. Nailong anterior guardado

- `archivo/nailong3d_anteriores/2026-11-24_antes_de_ojos_lente/` (cara V3 + ojos de bola; reconstruido exacto: genera 21/21 y 22.956 vértices como en la bitácora del 24/11) y `2026-11-18_v4.0.0_publicado/` (desde el commit `32816a2`), con `README.md` para restaurarlos. El usuario prefirió no poner un selector en la web.

## 4. Versión 4.1.0 (D-27) y publicación

- La regla 7 exigía la misma versión en la web y en el APK. Como el APK no cambia y la app lee `version.json` para avisar de actualizaciones, la web pasa a `4.1.0` y `version.json`/APK siguen en `4.0.0`. Se adaptan en el mismo cambio los tests 40, 45 y `W7` de `verify_all.py` y la regla 7 de `AGENTS.md`.
- `README.md` (novedades de la v4.1.0, leída antes `GUIA_README.md`), `CHANGELOG.md`, `ESTADO_ACTUAL.md`, `DECISIONES.md` (D-27, D-28), nota técnica 05, mapa de código, Anexos E y F del plan de fidelidad y `MEJORAS_PENDIENTES.md` (propuestas `W32`–`W34`, `3D14`–`3D17` y limpieza `L1`–`L6`).

## 5. Verificación real y «No comprobado»

- **Comprobado:** `py -3 verify_all.py` → **52 comprobaciones en verde** (parte Android «no comprobada» en este equipo); `evaluar_3d.py --etiqueta 3d13_ojos_lente --expresiones --cara` (24 vistas, 0 errores de consola/WebGL, 21/21 y 5/5); `medir_ojos_3d.js` (sobresale `−0,5 mm`, `+0,5 mm` con `--abre 1.06`); 12 primeros planos `--ojos` y estilo «dibujo animado»; medición de peso y coste del 3D en el navegador integrado (sus fps no son fiables: el panel limita la página a ~19 fps con y sin 3D).
- **No comprobado:** móviles reales; `.glb` con los nodos nuevos en Blender/Unity/Godot; reacción de la app Android (sin cambios en `version.json`); CLS con el método de la Swarm.
