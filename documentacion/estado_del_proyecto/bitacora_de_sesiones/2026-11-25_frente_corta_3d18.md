# Bitácora de sesión — 25/11/2026: frente más corta del Nailong 3D (`3D18`, D-29)

> **Objetivo:** reducir la «frente» del Nailong 3D (distancia de la línea de los ojos a la coronilla) para que se parezca a la serie, sin perder la cara «V1 afinada» ni los ojos «lente» aprobados el mismo día. Petición del usuario: «el Nailong real tiene menos frente y la cabeza no se expande tanto por arriba».
> **Agente:** Claude Code (Opus), sesión lanzada desde la de los ojos «lente», en el *worktree* `nailong3d-frente` (rama `claude/nailong3d-frente-631431`, creada desde `main` = `90a22f8`). En paralelo, la sesión `optimizaciones` trabajaba en `main` con `index.html`, `css/`, `js/12`, `js/14`, `ESTADO_ACTUAL.md`, `CHANGELOG.md`, `MEJORAS_PENDIENTES.md` y `README.md`, que aquí no se tocan.

---

## 1. Medido antes de tocar

- **Nueva medida `F0`** en `herramientas/perfil_cara.py`: distancia de la coronilla a la línea de los ojos (centro de los píxeles verdes del iris) dividida por el ancho máximo de la cabeza, con el mismo método que `F1`–`F4`. Serie: `08` 0,414 · `13` 0,486 · `18` 0,474 · `26` 0,455 (media **0,457**). Modelo: **0,516** (+13 %). Objetivo: 0,43–0,49.
- **La captura nueva que aportó el usuario ya estaba en el catálogo:** es idéntica, byte a byte, a `26_frente_risa_manos_pecho.jpg` (mismo SHA-256). No se añadió como `27`. Mide 0,455, no ~0,40 como se había estimado a ojo.
- **Qué fija la coronilla:** la unión suave de `craneo` (cima ~0,98) y `frente` (~0,97) con `k.frente = 0,105`, que la lleva a `y = 0,998`. La curva `perfilCabeza` solo toca el eje x, así que no cambia la altura.

## 2. Variantes (Node + renders reales)

- **Prototipo sin tocar ficheros:** copias de `js/11` con `ANATOMIA` mezclada (como `construirFuenteKernel` en `js/14`), medidas con `medir_nailong3d.js` y `medir_ojos_3d.js`, más una silueta frontal en perspectiva calculada en Node para estimar `F0`. Las fotos salieron de copias de la web en el *scratchpad*, con `capturar_3d_cdp.js --raiz <copia> --cara`: 13 vistas en ~10–20 s, sin errores, con 2 capturas a la vez.
- **Bajar las piezas** (`craneo`/`frente`: centros y radios): baja la coronilla, pero ensancha los mofletes (`H6 = 0,973`, fuera de rango) y cambia un poco la inclinación del ojo. Descartado.
- **Aplastar solo la cúpula** (nuevo `ANATOMIA.cupula`): por encima de `y = desde` la cabeza se mide en `y' = y + (aplasta − 1)·∫suavizado`, y la distancia se divide por la pendiente. Desde `0,76` hacia arriba, `F2` (0,881) y `F3` (0,969) se salían de rango. Desde `0,70` cruzaba el ojo y cambiaba su inclinación (`b` de −0,263 a −0,273). Desde **`0,74`** (justo encima del centro del ojo, `0,734`) todo queda en rango y el ojo no cambia.
- **Lámina para decidir:** `comparativas/3d18_frente/lamina_corta_frente.png` (hoy · A · B con `08`, `26`, `12`, `13`, `05` y `10`) y `lamina_frente_cara.png` (completa, con la silueta «frente» nueva).

| | Hoy | A (`aplasta 1,09`) | **B (`aplasta 1,15`, elegida)** |
|---|---|---|---|
| Coronilla | `0,998` | −1,8 cm | **−2,8 cm** |
| `F0` (renders) | `0,516` | `0,478` | **`0,456`** |
| Altura (malla `0,0105`) | `0,999` | `0,981` (test 49 sin cambios) | **`0,970`** (test 49 a 0,96–1,01, D-29) |
| `H5` / `H4` | `0,500` / `0,771` | `0,482` / `0,780` | **`0,472` / `0,788`** |

- **Re-escalar a altura 1** (×1,031) se explicó al usuario y se descartó: según el cálculo, `H2` (0,509), `B3` (0,505), `T1` (0,423) y `T3` (0,421) se saldrían de rango.

## 3. Decisión del usuario y cambios

- El usuario eligió **B** («Aplica B (−2,8 cm)») → **D-29**.
- `js/11-nailong3d-geometria.js`: `ANATOMIA.cupula = { desde: 0.74, hasta: 0.82, aplasta: 1.15 }` y `dCabeza` con la cúpula aplastada (la de antes pasa a `dCabezaSinCupula`).
- `herramientas/perfil_cara.py`: medida `F0` con su objetivo, figura «frente» (ojos alineados, altura en anchos de cabeza) en la lámina, la captura `26` en la fila de frente y títulos de perfil/espalda neutros. `herramientas/evaluar_3d.py`: solo la ayuda (`F0-F4`).
- `verify_all.py`, test 49: altura `0,96–1,01` (antes `1 ± 0,02`), con el comentario de D-29.
- Documentación: D-29 en `DECISIONES.md`, Anexo G en `PLAN_FIDELIDAD_NAILONG_3D.md`, nota técnica 05 (altura 0,97, fila de la frente, `F0`, cómo retocar) y esta bitácora.

## 4. Verificación real

- `node herramientas/medir_nailong3d.js --tabla` → **21/21 OK** (`H = 0,970`; `H4 = 0,788`, `H5 = 0,472`; el resto, igual que antes).
- `node herramientas/medir_ojos_3d.js` → sobresale **−0,5 mm** (`+0,5 mm` con `--abre 1.06`), igual que antes; pliegue arriba 6,0 mm (antes 6,3); `a = −0,315`, `b = −0,263` sin cambios.
- `py -3 herramientas/evaluar_3d.py --etiqueta 3d18_frente --expresiones --cara --salida <comparativas/3d18_frente/final>` → 24 vistas, **0 errores de consola/WebGL**, 21/21 y **6/6** medidas de la cara: `F0 0,456`, `F1 1,296`, `F2 0,877`, `F3 0,965` (en el límite, como antes), `F4 0,943`, `O1 0,454`.
- `node herramientas/capturar_3d_cdp.js --ojos` → 12 primeros planos revisados: parpadeo, carcajada, burla, puchero, susto, siesta y sonrisón sin atravesamientos.
- Malla: **22.160** vértices (`0,0105`), 33.864 (`0,0085`) y 43.521 (`0,0075`), 0 huecos en las tres resoluciones; en el test 49, `no2 = 0`, `inv = 0` y `pesosMal = 0`.
- `py -3 verify_all.py` → **52 comprobaciones en verde** (parte Android de 5 «no comprobada»: falta el código de la app en este equipo).

## 5. No comprobado

- Estilo «dibujo animado» con la cabeza nueva, móviles reales y el `.glb` (ahora de 0,97 m) en Blender, Unity o Godot.

## 6. Para la sesión principal (al integrar)

- **`ESTADO_ACTUAL.md`:** malla `22160` / `33864` / `43521` vértices; `H = 0,970`; `H4 = 0,788`, `H5 = 0,472`; cara `F0 0,456` (serie 0,457), `F1 1,296`, `F2 0,877`, `F3 0,965`, `F4 0,943`, `O1 0,454` (6/6); ojos igual (pliegue de arriba ~6 mm). Las demás cifras 3D no cambian.
- **`CHANGELOG.md` / `MEJORAS_PENDIENTES.md`:** `3D18` · frente más corta (la coronilla baja 2,8 cm; Nailong 3D mide 0,97, D-29).
- Láminas y renders, solo en local (D-25): `documentacion/referencias_nailong_serie/comparativas/3d18_frente/`.
