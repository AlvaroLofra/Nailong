# Estado Actual del Proyecto — ¡El Mundo Mágico de Nailong!

> **Regla de Actualización:** Este fichero se **sobrescribe en cada sesión** para reflejar la realidad de AHORA. El historial de sesiones reside en `bitacora_de_sesiones/` y las decisiones técnicas en `DECISIONES.md`.
>
> **Última actualización:** 24/11/2026 (noche). **Evaluación de la fidelidad de Nailong 3D frente a la serie y de las herramientas 3D** (solo documentación, sin cambios de producto). Las 4 observaciones del usuario (brazos, cola, cabeza y patas, barriga) quedan medidas y planificadas en [`PLAN_FIDELIDAD_NAILONG_3D.md`](PLAN_FIDELIDAD_NAILONG_3D.md), con las mejoras 3D5–3D11 de `MEJORAS_PENDIENTES.md`. La revisión previa a publicar (W23–W30) se aplaza a la próxima sesión.
> Antes, el mismo día: **refinamiento anatómico y *cute* de Nailong 3D sobre 15 capturas reales de la serie** (`4.0.0 · revisión web 2`, con commit en `main`, acumulado sobre el rediseño móvil-primero del 23/11): archivadas las 15 referencias oficiales en `documentacion/referencias_nailong_serie/`, re-esculpida la separación cabeza–cuello–hombros con voladizo frontal de barbilla y cara lisa (`VERSION: 3` en `js/11`), ojos grandes y abiertos en reposo, sonrisita dulce caramelo, 6 caritas sin *clipping* ni *z-fighting*, almohadillas rosa pálido en palmas/plantas, 3 placas oliva en nuca y garras cortas romas, conservando el shader mate *mochi*. Pendiente el `git push` a `main`.
> **Rama activa:** `main`.
> **Versión actual:** Web `v4.0.0` (sufijo anti-caché `?v=4.0.0-web2`) | Android APK `v4.0.0` (`versionCode 16`). Commits hechos en `main` (`90b27d5`, `d63cf3f`, `8a6ba76`); pendiente el `git push` (GitHub Pages).

---

## 1. En una Frase

La web oficial y la app Android nativa están en la versión **v4.0.0** (`versionCode 16`), con **126 cromos oficiales** (97 animados en 4 packs 24/24/24/25 + 29 estáticos en 1 pack = 5 packs oficiales), **Nailong en 3D refinado sobre 15 capturas reales de episodios de *Seventh Impression*** (anatomía adorable con cuello y voladizo de barbilla, ojos abiertos dulces, cara deformable, shader *mochi* mate, 5 acciones y 6 caritas), rediseño web móvil-primero y APK firmado de 41.7 MB. `verify_all.py` tiene **52 comprobaciones** y termina en verde; en este equipo declara «no comprobada» la parte Android de 5 de ellas porque falta el código de la app.

---

## 2. Cifras Clave del Proyecto (Ground Truth)

| Métrica / Concepto | Valor Verificado |
|---|---|
| **Punto único de entrada web** | `index.html` + `css/styles.css` + `js/` (14 ficheros modulares más `tailwind-config.js`, 0 dependencias de compilación, todos con `?v=4.0.0-web2`). |
| **Diseño móvil (revisiones web 1 y 2)** | Barra de accesos fija abajo (`#bottom-nav`, `< lg`), carruseles en «¿Quién es?» y en las tiras de acciones/caritas 3D, tráiler plegado en `<details>`, álbum con 6 cromos iniciales en móvil y 8 en escritorio, botonera de 3 columnas y laboratorio con pestañas. Altura medida en móvil (375×812): 9,66 pantallas; cero desborde horizontal en 320, 375, 768 y 1440 px. |
| **Nailong 3D refinado sobre la serie (`VERSION: 3`)** | Sección `#nailong-3d` con carga perezosa (`IntersectionObserver` a 600 px); malla procedural estanca (`25738` vértices en Node/móvil, `0` huecos, `0` aristas no-2, `0` invertidos, `altura = 1,0024`, `cab/tor = 0,909`, `tor = 0,593`, `pancita = 0,135`) en un Web Worker, 12 huesos, cara lisa sin bulto nasal, ojos grandes abiertos en reposo (`parpSup = 0,98`), sonrisita caramelo cálido, almohadillas rosa pálido en palmas/plantas, 3 placas oliva en nuca, shader *mochi* mate, 5 acciones + 6 caritas de la serie, 2 estilos y exportación `nailong_3d.glb` (11 clips). |
| **Referencias visuales oficiales 3D** | 15 capturas reales de episodios archivadas y catalogadas en `documentacion/referencias_nailong_serie/` (**solo en local**, fuera de Git; D-25) (`01_frente_triste.jpg` a `15_frente_celebracion_almohadillas.jpg` + `README.md`). |
| **Banco de cromos coleccionables** | Exactamente 126 stickers WebP (512×512 con chunk EXIF WhatsApp: 97 animados + 29 estáticos) + 1 foto optimizada del creador + 1 sticker descatalogado fuera de catálogo (128 archivos en `Stickers Nailong/`). |
| **Packs oficiales preconfigurados en Android** | 5 packs: *Nailong animado 1* (24), *Nailong animado 2* (24), *Nailong animado 3* (24), *Nailong animado 4* (25) y *Nailong estático* (29). Total: 126 stickers. |
| **Generador dinámico «Mi Selección»** | Mínimo 3 y máximo 30 stickers por lote, con vista de revisión («Ver (N) ❯»), 97 vistas previas animadas de 192 px (6.9 MB), 29 variantes animadas de los estáticos en `nailong_estaticos_animados` (683.94 KB) y un único pack por importación. |
| **Paquete nativo Android firmado** | `StickersNailong.apk` (41.7 MB / 41.732.353 bytes, firmado con clave *debug* oficial `SHA-256: 04b83add...abb2`, targetSdk 30, versionCode 16, versionName 4.0.0). `IMAGE_DATA_VERSION: '4'` en los 5 packs. |
| **Imágenes fijas por clave (D-22)** | Las 4 tarjetas de «¿Quién es Nailong?» usan `data-sticker` (`dragon-de-leche` → 2, `xiao-qi-colita` → 28, `bombloong` → 27, `escamitas-espalda` → 31). El resto de referencias fijas sigue por número (W11 en `MEJORAS_PENDIENTES.md`). |
| **Herramientas de clasificación TikTok** | `herramientas/descargar_tiktok_consola.js`, `herramientas/stickers_vistos.json` (61 entradas) y `herramientas/stickers_descartados.npz` (4 descartes: `062`, `063`, `082`, `089`). |
| **Tráiler oficial animado (HyperFrames)** | `video-promo/nailong_trailer_v2.mp4` (1080×1920, 60 fps, 32.0s, 17.4 MB, `preload="none"`, audio y SFX sintetizados a 120 BPM). |
| **Botonera de sonidos sintetizados** | 12 casillas con 12 sonidos únicos sintetizados con Web Audio API (`duang`, `chomp`, `slurp`, `bleh`, `maracas`, `fire`, `sleep`, `laugh`, `pirate`, `run`, `tail`, `fanfare`). |
| **Laboratorio de superpoderes** | Tamaño dinámico, modo camaleón, 6 disfraces mágicos, llamitas, hinchado de tripita, lluvia de pollo crujiente y gravedad cero espacial. |
| **Suite de pruebas automatizadas (`verify_all.py`)** | **52 comprobaciones**; ejecución completa en verde el 24/11/2026. Si falta el código de la app Android (ruta por defecto en el propio script, o variable `NAILONG_ANDROID_SRC`), la parte Android de los tests 43, 45, 47, 48 y 50 se salta y se lista al final como **NO COMPROBADO**, en vez de detener la suite. |
| **Auditoría de stickers (`normalizar_stickers.py --check`)** | **0 problemas en los 126 stickers (100% conformes con WhatsApp)**; distancia visual mínima en `1..126` = `21.46` (0 pares `< 20`). |

---

## 3. Qué Está Completado y Verificado

- [x] **Sesión del 24/11/2026 (parte 3): evaluación de fidelidad 3D y de herramientas** (solo documentación; bitácora `2026-11-24_evaluacion_fidelidad_3d_y_herramientas.md`):
  - Se renderizaron 7 vistas del modelo actual en el navegador y se compararon con las capturas de la serie. La lámina es local, en `referencias_nailong_serie/comparativas/`.
  - Se midieron el modelo en Node y las capturas con cuadrícula.
  - Resultados: los brazos asoman 0,12 de la altura (≈0,20–0,28 en la serie), las piernas 0,06 (≈0,10–0,15) y la cola 0,145 (≈0,29). El voladizo de la cara sobre la barriga es 0,00 (≈0,10–0,15) y el torso tiene 0,54 de fondo (≈0,40). La pancita tiene el núcleo correcto, pero un halo que la agranda.
  - Se investigaron alternativas 3D gratuitas (Blender con conector MCP oficial, IA de imagen a 3D, Three.js moderno) y se dejó todo en [`PLAN_FIDELIDAD_NAILONG_3D.md`](PLAN_FIDELIDAD_NAILONG_3D.md).
- [x] **Sesión del 24/11/2026 (parte 2) — Refinamiento anatómico y *cute* de Nailong 3D sobre 15 capturas reales (`4.0.0 · revisión web 2`, en `main` sin commit):**
  - Archivadas y catalogadas las 15 capturas oficiales de episodios en `documentacion/referencias_nailong_serie/` (enlazadas en `documentacion/00_INDICE.md`).
  - Re-esculpido `js/11-nailong3d-geometria.js` (`VERSION: 3`): cuello direccional con separación nítida cabeza–cuello–hombros y voladizo frontal de barbilla (`~0,10`) manteniendo la nuca dorsal continua, cara lisa sin bulto nasal ni arcos superciliares prominentes, cuenca ocular redonda compacta (`giro = 0,08`), cola cónica baja, paleta fuente única en `G.COLORES` y almohadillas rosa pálido en palmas y plantas.
  - Afinados `js/12-nailong3d-escena.js` y `js/13-nailong3d-animacion.js`: ojos grandes y abiertos en reposo (`parpSup = 0,98`, iris esmeralda grande, sin repisa oscura), sonrisita cerrada dulce en caramelo cálido (`#8E4B0C`), boca abierta y 6 caritas limpias sin *clipping* ni *z-fighting*, 3 placas verde-oliva en nuca y garras cortas romas, conservando el shader mate *mochi* y el modo *toon*.
  - Verificado visualmente en **12/12 vistas WebGL reales** en Chrome Headless (`0` errores de consola WebGL), sintaxis Node (`node --check`) en verde en `js/11..14`, Test 49 estanco (`25738` vértices, `huecos = 0`, `no2 = 0`, `inv = 0`, `pesosMal = 0`) y todos los tests del repo en `verify_all.py` en verde (salvo las rutas de `C:\src\nailong_stickers_app`).
- [x] **Sesión del 24/11/2026 (parte 1) — Rediseño base de Nailong 3D:** deformador facial 3D, cavidad bucal 3D, shader *mochi* (`3D1`) y tira de 6 caritas de la serie (`3D2`).
- [x] **Sesión del 23/11/2026 — Rediseño web móvil-primero (`4.0.0 · revisión web 1`):** barra inferior `#bottom-nav`, secciones compactadas y tráiler plegable en `<details>`.
- [x] **Sesión del 18/11/2026 — Lanzamiento `v4.0.0` (126 stickers, 5.º pack Android y estreno público de Nailong 3D, pendiente de `git push`).**

---

## 4. No Comprobado (Pendiente de Validación Real)

- **Dispositivos móviles reales:** Safari en iPhone (zona segura con `#bottom-nav` y rendimiento WebGL del shader *mochi*) y Chrome en Android real.
- **Parte Android de `verify_all.py` (tests 43, 45, 47, 48 y 50):** el código de la app no está en este equipo; la suite lo declara al terminar.
- **Apertura de `nailong_3d.glb` (11 clips) en software externo:** Blender, Unity o Godot (validado a nivel glTF 2.0 en navegador).
- **App `v4.0.0` y 5.º pack en WhatsApp real, y seguridad externa (`H-2` a `H-7`).**

---

## 5. Siguiente Paso

1. **Commits del 24/11 hechos** en `main` (`90b27d5` feat 3D, `d63cf3f` test, `8a6ba76` docs y D-25), sin push. Quedan **sin commit** los documentos posteriores: W23–W30 en `MEJORAS_PENDIENTES.md` y la documentación del plan de fidelidad 3D (este fichero, `PLAN_FIDELIDAD_NAILONG_3D.md`, 3D5–3D11, nota 05, índice y bitácora). Se hará cuando el usuario lo pida.
2. **Decidir antes de publicar:** licencia del código (`LICENSE`) y `documentacion/CREDITOS.md` (origen de stickers, personaje, Three.js, Font Awesome y fuentes). Las capturas de la serie ya se quedan solo en local (D-25).
3. **Revisión previa a publicar, hecha el 24/11** (resultados en `MEJORAS_PENDIENTES.md`, W23–W30): en móvil lento, LCP ≈ 9 s y TBT ≈ 1,4 s (lejos de lo recomendado); 17 textos sin contraste AA, sobre todo blanco sobre el naranja de marca. Vuelta atrás anotada (`origin/main` = `32816a2`). Falta decidir si se corrige antes del `git push` (W23, W24 y W28 son baratas) o se publica y se corrige después. **Decisión del usuario del 24/11** (comunicada por la sesión de revisión previa a publicar): W23–W30 se aplazan y se retoman en la próxima sesión, antes del `git push`.
4. Decidir si se borra la rama local `nailong-3d-fiel` (2 commits del 23/11 que no están en `main`).
5. **Nailong 3D, fidelidad a la serie:** seguir [`PLAN_FIDELIDAD_NAILONG_3D.md`](PLAN_FIDELIDAD_NAILONG_3D.md).
   - Primero la fase 0 (3D5: lámina «render | captura» y medidas automáticas).
   - Después 3D6 → 3D7 → 3D8 → 3D9 → 3D10, una por sesión y con la cabeza siempre sola.
   - 3D11 (piloto con Blender) solo si el usuario lo decide, porque reabre D-21.
