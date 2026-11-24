# Estado Actual del Proyecto — ¡El Mundo Mágico de Nailong!

> **Regla de Actualización:** Este fichero se **sobrescribe en cada sesión** para reflejar la realidad de AHORA. El historial de sesiones reside en `bitacora_de_sesiones/` y las decisiones técnicas en `DECISIONES.md`.
>
> **Última actualización:** 24/11/2026. **Refinamiento anatómico y *cute* de Nailong 3D sobre 15 capturas reales de la serie** (`4.0.0 · revisión web 2`, sin commit, acumulado sobre el rediseño móvil-primero del 23/11): archivadas las 15 referencias oficiales en `documentacion/referencias_nailong_serie/`, re-esculpida la separación cabeza–cuello–hombros con voladizo frontal de barbilla y cara lisa (`VERSION: 3` en `js/11`), ojos grandes y abiertos en reposo, sonrisita dulce caramelo, 6 caritas sin *clipping* ni *z-fighting*, almohadillas rosa pálido en palmas/plantas, 3 placas oliva en nuca y garras cortas romas, conservando el shader mate *mochi*. Pendiente commit y `git push` a `main`.
> **Rama activa:** `main`.
> **Versión actual:** Web `v4.0.0` (sufijo anti-caché `?v=4.0.0-web2`) | Android APK `v4.0.0` (`versionCode 16`). Pendiente de commit y `git push` a `main` (GitHub Pages).

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

1. **Commit** de la revisión web 2 (Gemini) y de los ajustes de pautas del 24/11 (`verify_all.py`, `AGENTS.md`, documentación), cuando el usuario lo pida.
2. **Decidir antes de publicar:** licencia del código (`LICENSE`) y `documentacion/CREDITOS.md` (origen de stickers, personaje, Three.js, Font Awesome y fuentes). Las capturas de la serie ya se quedan solo en local (D-25).
3. **Lista de publicación** de la biblioteca de pautas (M5, checklist 2) antes del `git push` de `v4.0.0`: Lighthouse en móvil (LCP ≤ 2,5 s · INP ≤ 200 ms · CLS ≤ 0,1), contraste WCAG AA y commit de vuelta atrás anotado.
4. Decidir si se borra la rama local `nailong-3d-fiel` (2 commits del 23/11 que no están en `main`).
