# Bitácora de sesión — 24/11/2026: Mejoras 3D (3D3, 3D5–3D10) y Web (W21–W25, W27–W28, W30) en modo Swarm

> **Objetivo:** ejecutar el plan completo de fidelidad de Nailong 3D (`PLAN_FIDELIDAD_NAILONG_3D.md`, Fase 0 + Fase 1 hasta `21/21 OK`), añadir el exportador de sticker 512×512 WebP (`3D3`) y resolver en paralelo las mejoras de accesibilidad, contraste WCAG AA y rendimiento web (`W21`–`W25`, `W27`–`W28`, `W30`), trabajando con agentes en *worktrees* aislados y auditoría continua.

---

## 1. Desarrollo por fases

### Fase 0 · «Ojos y regla» del Swarm (`3D5`) — commit `0af046e`
Sin tocar todavía las proporciones del modelo (`js/11`–`js/13`), se construyó la cadena automática de evaluación (0 dependencias externas, sin Playwright):
- `herramientas/medir_nailong3d.js`: carga `js/11` en memoria, expone `dTorso/dCabeza/dBrazo/dPierna/dCola`, mide las 21 métricas `B1–V3` con `H = 1` en ~0,7 s y soporta brazo de 1 o 2 tramos y cola de 2–3+ tramos.
- `herramientas/capturar_3d_cdp.js`: servidor HTTP efímero (`127.0.0.1:0`) + Chrome Headless SwiftShader por CDP nativo (`fetch` + `WebSocket`), capturando las 7 vistas del Anexo B (y con `--expresiones`, las 6 caritas y 5 acciones = 18 vistas) con 0 errores de consola/WebGL.
- `herramientas/lamina_comparativa.py`: empareja las 7 vistas con las capturas locales (con fallback en *worktrees* vía `git rev-parse --git-common-dir` y aviso sin fallar si faltan por D-25), anota `--medidas` (OK/KO) y soporta modo `--ab` de 3 columnas.
- `herramientas/evaluar_3d.py`: orden única (`node --check` → medición → CDP → lámina) en ~23–29 s.
- Panel flotante plegable `?3d=debug` en `js/14-nailong3d-visor.js` (88 deslizadores sobre `ANATOMIA`, regeneración vía Worker + «Copiar ANATOMIA»; coste 0 sin `?3d=debug`).
- **Línea base reproducida:** `1/21 OK` (solo `H6 = 0,909`), coincidiendo con §3.2 del plan.

### Pista Web paralela (`W21`–`W24`, `W27`–`W28`, `W30`) — commit `5bbb870`
En paralelo a la escultura 3D, en ficheros estrictamente disjuntos (`index.html`, `css/styles.css`, `js/tailwind-config.js`, `js/03`, `js/05`, `js/06`, `js/10`):
- **W21:** botón accesible `#particles-toggle-btn` en cabecera + estado sincronizado en `#mobile-menu`, `sessionStorage`, `body.particles-paused` y respeto a `prefers-reduced-motion`.
- **W22:** `autofocus` en el botón «Cerrar» de los 4 `<dialog>` nativos (`magic-modal`, `photo-lightbox`, `sticker-options-modal`, `share-modal`).
- **W23:** contraste WCAG AA (`≥ 4,5:1`) corregido en todos los textos sólidos y sobre degradados (0 fallos en 320, 375, 768 y 1440 px): `text-amber-950` sobre `#FF9F1C` (`7,29:1`), `#C2410C` sobre blanco/crema (`#belly-counter` `5,18:1`, titular `5,08:1`, `#game-score` `4,89:1`), `#052E16` sobre `#25D366` (`7,52:1`) y `bg-emerald-700`/`#15803D` con blanco (`≥ 5,13:1`).
- **W24:** `loading="lazy" decoding="async"` en `sticker_2.webp` del banner de la app, `fetchpriority="low"` en el avatar y `<link rel="preload">` + `fetchpriority="high"` en `#hero-nailong-img` (`sticker_19.webp`).
- **W27:** `diferirArranque()` en `js/10-inicio.js` (`requestIdleCallback` con respaldo `setTimeout`) para lo que está bajo el pliegue.
- **W28:** CLS de escritorio en caché fría reducido de **`0,0943` (`0,11` previo) a `0,0042`** (`0` en móvil/tableta) mediante `overflow-y: scroll`, métricas de fuentes de respaldo (`Fredoka-Fallback`/`Quicksand-Fallback`) y reserva de altos mínimos / `aspect-ratio`.
- **W30:** `#power-size-slider` ampliado de 16 px a `31–32 px` (`h-8`, ≥ 28 px, WCAG 2.2 · 2.5.8).

### Fase 1A · Torso, pancita y piernas (`3D6` y `3D7`) — commits `b092924`, `7fd47e7`, `fd11068`
- Corrección en `medir_nailong3d.js` (`b092924`: `zMin` en `caja3DSimetrica` y exclusión del rosa en la medición de pancita).
- **`3D6` (`7fd47e7`):** torso recogido (`T1 = 0,410`, frente en `z = 0,206`, `T2 = 0,488`) y pancita con borde nítido sin halo (`falda: 1,07`, `V1`–`V3` OK); ajuste del punto táctil de teclado en `js/14` a `z = 0,20`.
- **`3D7` (`fd11068`):** fondo de caderas/barriga elevado (`T3 = 0,402`), piernas visibles (`P1 = 0,133`) y hueco entre piernas (`P2 = 0,090`), con pies planos sobre `y = 0`, almohadilla rosa plantar y rotaciones `pIX`/`pDX` ajustadas en `js/13`. Progreso: **`1/21 → 9/21 OK`**.

### Fase 1B · Competencia A/B de brazos con codo (`3D8`) — ganador Variante B `a22f5a7`
Se lanzaron dos variantes independientes sobre `fd11068` y se compararon con `lamina_comparativa.py --ab` + 11 expresiones:
- **Variante A (`ef3f49c`):** 13/21 OK, `52/52 PASS`, eliminaba el efecto aleta pero dejaba un pequeño pellizco axilar en poses extremas (`Carcajada`, `Susto`).
- **Variante B (`a22f5a7`, ganadora):** pose en «A» abierta con 2 tramos (`a → codo → b`), unión direccional hombro/axila (`k.hombro = 0,042`, `k.axila = 0,020`), **14 huesos** (`codoIzq`/`codoDer`), escudo axilar (`tauBrazo = 0,013`), garras de mano adjuntas a los codos con base ortonormal en `js/12`, canales `cIX..cDZ` y eliminación del desplazamiento lineal del hombro en `js/13`. Hombros suaves sin pellizcos ni efecto aleta en `Saludo` (`03`), `B1–B5` en rango (**`13/21 OK`**).

### Fase 1C · Cola larga en 3 tramos (`3D9`) — commit `67eb637`
- `ANATOMIA.cola` en 3 segmentos (`a → m1 → m2 → b`, `ra = 0,106` hasta punta roma `rb = 0,030`), **15 huesos** (`cola → colaMedia → colaPunta`), frustum de sombra y sombra de contacto ampliados en `js/12`, meneo desfasado en curva en `js/13` (**63 tracks/clip** deterministas en `hornear()`) y `colaMedia` mapeado en `regionDe()` (`js/14`). `C1 = 0,275`, `C2` OK (**`15/21 OK`**).

### Fase 1D · Competencia A/B de cabeza redondeada y adelantada (`3D10`) — ganador Variante B `7cf3406`
Se compitieron dos enfoques sobre `67eb637` para alcanzar `21/21 OK` y re-anclar todo el sistema facial (`crearBoca`, `pesoMandibula`, `crearCaraDeformable`, rubor y placas):
- **Variante A (`81b6d9f`):** primitivas clásicas sin `rotX` (`21/21 OK`, `23052` verts, `H1 = 0,120`, `H4 = 0,775`, `391 ms` en `0,0075`).
- **Variante B (`7cf3406`, ganadora):** soporte isométrico `rotX` en `elipsoide()`/`dElip()` (coste 0 si `rotX = 0`), esculpiendo la cabeza en «judía inclinada» (`craneo -0,22`, `frente -0,14`, `mofletes -0,16`, `hocico +0,16`), `H1 = 0,116`, `H2 = 0,490`, `H3 = 0,484`, `H4 = 0,777`, `H5 = 0,490`, `H6 = 0,959`, `23080` verts (`232 ms` en `0,0105`, `331 ms` en `0,0075`). Ganó en la comparativa `--ab` por perfil orgánico continuo (`05`), coronilla más redonda (`13`, `14`), placas dorsales mejor asentadas y 11 expresiones limpias (**`21/21 OK`**).

### Integración final (`3D3` + `W25`) y cierre documental
- En paralelo al cierre documental: mezcla de `5bbb870` (pista web) con `7cf3406` (modelo 3D `21/21 OK`), implementación de **`3D3`** (botón `#nailong-3d-sticker` y `exportarStickerWebP()` 512×512 ≤ 100 KB con RIFF/VP8X + EXIF WhatsApp) y **`W25`** (carga diferida en orden de `js/11`–`js/13` desde `js/14`).
- Actualización de `05_nailong_3d.md`, `00_mapa_de_codigo.md`, `MEJORAS_PENDIENTES.md`, `ESTADO_ACTUAL.md`, `00_INDICE.md` y esta bitácora.

---

## 2. Evolución medida del modelo 3D (`medir_nailong3d.js`, `H = 1`)

| Bloque | Métricas clave | Base (`v3`) | Final (`3D10` · `7cf3406`) | Objetivo (§3.2) | Estado |
|---|---|---|---|---|---|
| Brazos (`B1–B5`) | Parte libre · grosor · hombro Y/Z · codo | `0,119` · `0,140` · `0,430` / `+0,008` · sin codo | **`0,229` · `0,109` · `0,490` / `-0,038` · 2 tramos+hueso** | `0,20–0,24` · `0,10–0,12` · `0,47–0,50` / `-0,05..-0,02` | **5/5 OK** |
| Cola (`C1–C2`) | Sobresale · raíz Y / punta / esbeltez | `0,145` · `0,178 / 0,034 / 1,007` | **`0,275` · `0,168 / 0,030 / 2,865`** | `0,26–0,30` · `y 0,15–0,18, rP ≤ 0,04, esb ≥ 1,6` | **2/2 OK** |
| Piernas (`P1–P2`) | Altura visible · entrepierna Y | `0,062` · `0,021` | **`0,133` · `0,090`** | `0,12–0,14` · `≥ 0,07` | **2/2 OK** |
| Torso (`T1–T3`) | Fondo Z · ancho X · alto Y | `0,546` · `0,576` · `0,470` | **`0,410` · `0,488` · `0,416`** | `0,38–0,42` · `0,48–0,52` · `0,38–0,42` | **3/3 OK** |
| Cabeza (`H1–H6`) | Voladizo · fondo · ancho · coronilla · alto · cab/tor | `0,004` · `0,528` · `0,536` · `0,709` · `0,510` · `0,909` | **`0,116` · `0,490` · `0,484` · `0,777` · `0,490` · `0,959`** | `0,10–0,14` · `0,48–0,50` · `0,47–0,50` · `≥ 0,76` · `0,47–0,50` · `0,88–0,97` | **6/6 OK** |
| Pancita (`V1–V3`) | Núcleo ≥90 % · borde ≥50 % · halo ≥15 % | `0,331×0,357 (y=0,07)` · `0,390×0,457 (y=0)` · `+0,208` | **`0,328×0,347 (y=0,116)` · `0,336×0,355 (y=0,113)` · `+0,012`** | `yMin ≥ 0,09` · `≤ 0,37×0,38` · `diff ≤ 0,05` | **3/3 OK** |
| **Total** | **Métricas en rango** | **`1/21 OK`** | **`21/21 OK`** | **21/21** | **PASS** |

---

## 3. Verificación real y «No comprobado»

- **Comprobado:**
  - `python verify_all.py`: **52/52 PASS** (test 35 documental y test 49 3D ampliado con 15 huesos y rangos `3D6`–`3D10`; `huecos = 0`, `no2 = 0`, `inv = 0`, `pesosMal = 0`).
  - `python herramientas/evaluar_3d.py --expresiones`: **18 vistas CDP** con 0 errores de consola/WebGL, 0 *clipping* y 0 *z-fighting* en las 6 caritas y 5 acciones.
  - Chrome Headless Web (320, 375, 768, 1440 px): 0 desborde horizontal, 0 textos `< 4,5:1`, CLS escritorio `0,0042`, W21 y W22 verificados.
- **No comprobado:**
  - Dispositivos móviles reales (iPhone Safari y Android Chrome, incl. `W29`).
  - Compilación y prueba real de la app Android en teléfono físico (aunque en este equipo `verify_all.py` verificó los tests 43, 45, 47, 48 y 50 sobre el árbol local, no se recompiló el APK ni se probó en WhatsApp real).
  - Apertura de `nailong_3d.glb` (15 huesos / 63 tracks) en Blender, Unity o Godot.
  - Commit final y `git push` a `main` / GitHub Pages (reservado a petición expresa del usuario).
