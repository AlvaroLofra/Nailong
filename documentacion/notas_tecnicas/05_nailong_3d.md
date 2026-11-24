# Nota técnica 05 · Nailong 3D (visor interactivo, cara deformable, sticker WebP y exportador GLB)

> **Subsistema:** sección `#nailong-3d` de la web (entre «¿Quién es?» y «Stickers»). Decisión de arquitectura: **D-21** (re-esculpido por fases `3D5`–`3D10` hasta cumplir **21/21** métricas medidas contra 15 capturas reales de la serie 3D).
> **Referencias visuales:** `documentacion/referencias_nailong_serie/README.md`, carpeta solo en local y fuera de Git por derechos de autor (D-25) (15 capturas oficiales catalogadas por ángulo, expresión y rasgos anatómicos).
> **Ficheros:** `js/11-nailong3d-geometria.js` · `js/12-nailong3d-escena.js` · `js/13-nailong3d-animacion.js` · `js/14-nailong3d-visor.js` · estilos `.n3d-*` al final de `css/styles.css`.
> **Herramientas de medición y comparación visual (`3D5`):** `herramientas/medir_nailong3d.js` · `herramientas/capturar_3d_cdp.js` · `herramientas/lamina_comparativa.py` · `herramientas/evaluar_3d.py`.
> **Prueba automática:** test 49 de `verify_all.py` (carga diferida, CDN fijada con SRI, estanqueidad, esqueleto y proporciones canónicas en Node; las cifras vivas de vértices y métricas están en [`ESTADO_ACTUAL.md`](../estado_del_proyecto/ESTADO_ACTUAL.md)).

## 1. Qué hace
- Modelo 3D **procedural** de Nailong fiel a la serie CGI de *Seventh Impression* (sin ficheros de modelo binarios en el repo): se calcula en el navegador en ~0,25–0,35 s dentro de un Web Worker.
- Visor con cámara orbital (girar, zoom, teclado `+`/`-`/flechas), respiración bifásica, parpadeo asimétrico, mirada que sigue al puntero y reacciones por zona tocada.
- **5 acciones corporales** (`Salude`, `¡Duang!`, `Baile`, `Sorpresa`, `Siesta`) y **6 caritas icónicas de la serie** (`Sonrisón`, `Carcajada`, `¡Bleh!`, `Puchero`, `Pillo`, `¡Susto!`); estilo «Sticker 3D» (*mochi* mate) o «Dibujo animado» (*cel-shading*).
- **Exportaciones:** foto PNG transparente (`#nailong-3d-foto`), **sticker 512×512 WebP** listo para WhatsApp desde la pose actual (`#nailong-3d-sticker`, mejora `3D3`) y descarga `nailong_3d.glb` con 11 clips horneados.
- **Depuración en vivo (`?3d=debug`):** panel flotante plegable con deslizadores sobre los bloques de `ANATOMIA`, regeneración de malla en el Worker («Aplicar»), «Reset» y «Copiar ANATOMIA»; sin `?3d=debug` no crea DOM ni añade coste.

Analogía: en vez de pegar bolas de plastilina o una pegatina de boca sobre un globo, el cuerpo se esculpe como una «niebla» continua que se congela en una sola piel estanca, y unos músculos virtuales mueven cejas, pómulos, mandíbula y bolsillo oral alrededor de dientes y lengua tridimensionales reales.

## 2. Anatomía canónica (21/21 métricas en rango frente a la serie)
Calibrada sobre las 15 capturas reales de episodios de `referencias_nailong_serie/` (solo en local, D-25). Altura total `H = 1` (1 m en el GLB), pies planos en `y = 0`, cara hacia `+z`. Las cifras medidas vigentes se consultan en [`ESTADO_ACTUAL.md`](../estado_del_proyecto/ESTADO_ACTUAL.md) y el desglose de objetivos en [`PLAN_FIDELIDAD_NAILONG_3D.md`](../estado_del_proyecto/PLAN_FIDELIDAD_NAILONG_3D.md).

| Rasgo | Referencia | Cómo se modela |
|---|---|---|
| Cabeza en «judía inclinada» con voladizo sobre la barriga (`3D10`) | Capturas `05`, `06`, `12`, `13`, `14` | `elipsoide()` / `dElip()` admiten rotación isométrica opcional en el eje X (`rotX`, con coste cero si `rotX = 0`): `craneo` (`-0,22`), `frente` (`-0,14`), `mofletes` (`-0,16`) y `hocico` (`+0,16`). Adelanta la cara sobre la barriga con voladizo en rango `0,10–0,14 H`, coronilla ancha (`≥ 0,76` del ancho máximo), sin «falda» en mofletes y diagonal continua espalda–nuca hasta la cola (`kCuello` / `kCuelloEspalda`). |
| Torso recogido y pancita crema nítida sin halo (`3D6`) | Capturas `05`, `07`, `13`, `14` | Fondo del torso recogido (`0,38–0,42 H`) y ancho de caderas equilibrado (`0,48–0,52 H`); pancita crema con borde nítido (`nucleo: 0,95`, `falda: 1,07`), base elevada sobre la entrepierna y normal frontal afinada para no envolver los costados ni generar halo difuso. |
| Piernas visibles y hueco entrepierna (`3D7`) | Capturas `04`, `05`, `10`, `13`, `15` | Fondo de caderas y barriga elevado para liberar piernas visibles (`0,12–0,14 H`) y hueco entre piernas (`≥ 0,07 H`), manteniendo pies planos en `y = 0`, 3 garritas romas y almohadilla rosa plantar; `pIX`/`pDX` en `js/13` acotados para evitar penetración del suelo al bailar o saltar. |
| Brazos largos en 2 tramos con codo y axila limpia (`3D8`) | Capturas `03`, `06`, `10`, `11`, `13`, `15` | Pose de generación en «A» abierta con 2 tramos (`a → codo → b`) y manopla algo más ancha que la muñeca (`parteLibre` en `0,20–0,24 H`, diámetro medio `0,10–0,12 H`, hombro alto y atrasado). Unión direccional hombro/axila (`k.hombro` / `k.axila`), escudo axilar en pesos de piel (`tauBrazo`) y dos huesos de codo (`codoIzq`/`codoDer`) que eliminan el «efecto aleta» al saludar. |
| Cola larga en 3 tramos casi horizontal (`3D9`) | Capturas `09`, `10`, `11`, `14` | 3 segmentos (`a → m1 → m2 → b`) que sobresalen `0,26–0,30 H` por detrás de la espalda con raíz baja (`y ≈ 0,168`), afinamiento continuo hasta punta roma (`rb = 0,030`) y cadena de 3 huesos (`cola → colaMedia → colaPunta`) con meneo desfasado en curva. |
| Ojos, cara deformable y cavidad bucal 3D | Capturas `01`, `02`, `03`, `08`, `12`, `13` | Ojos grandes y bien encastrados (`r = 0,062`, `hundido = 0,85`, `giro = 0,12`) sin esclerótica saliente en 3/4 ni perfil; párpados abiertos en reposo (`0,98 / -0,98`) y AO palpebral suave. `crearBoca` y `crearCaraDeformable` (ley `pesoMandibula`, cejas, pómulos y bolsillo oral) re-anclados al hocico adelantado de `3D10`, con sonrisita caramelo cerrada (`#8E4B0C`), arco dental limpio y lengua 3D sin *clipping* ni *z-fighting*. |
| Acabado *mochi*, placas dorsales, almohadillas y garras | Capturas `03`, `09`, `10`, `11`, `12`, `15` | Paleta única en `G.COLORES` (`amarillo: #F8C52C`, `crema: #FAF0C8`, `oliva: #8A9244`, `garra: #6B573E`, `rosa: #F5A6AE`); micro-relieve normal 3D *mochi*, rubor adelantado en mejillas, 3 placas oliva en la nuca (`[0,76, 1,18, 1,58]`), almohadillas rosas en palmas/plantas y 3 garras por extremidad (en manos adjuntas a `codoIzq`/`codoDer` con base ortonormal del antebrazo). |

## 3. Arquitectura (4 scripts clásicos, carga diferida `W25`)
1. **`js/11-nailong3d-geometria.js` · núcleo geométrico** (sin Three.js ni DOM; corre en Worker, navegador y Node):
   - SDF con elipsoides (soporte `rotX`), conos redondeados multi-tramo, unión/diferencia polinómica suave, cuello y hombro direccionales y esferas envolventes.
   - **Surface Nets en banda estrecha** estanca (`0` huecos, `0` aristas no-2, `0` triángulos invertidos) en todas las resoluciones (`0,0105` en móvil/Node, `0,0085` en escritorio, `0,0075` alta densidad, proxy `0,026`).
   - Esqueleto de **15 huesos** (`raiz`, `cadera`, `tronco`, `pecho`, `cabeza`, `barriga`, `brazoIzq`, `brazoDer`, `piernaIzq`, `piernaDer`, `cola`, `colaMedia`, `colaPunta`, `codoIzq`, `codoDer`), pesos de piel con escudo axilar y transición en bisectriz de codo, y color por vértice desde `G.COLORES`.
2. **`js/12-nailong3d-escena.js` · escena, cara deformable y materiales**:
   - `crearCaraDeformable` (cejas, pómulos, mandíbula y bolsillo oral sincronizados con el hocico adelantado), `crearBoca`, `crearOjos`, frustum de sombras y sombra de contacto ampliados para la cola larga, garras de mano adjuntas a `codoIzq`/`codoDer` y materiales «suave» (*mochi*), «toon» y «exportar».
3. **`js/13-nailong3d-animacion.js` · animación y expresiones**:
   - Muelles amortiguados a paso fijo (`1/120 s`), canales de codo (`cIX/cIZ/cDX/cDZ`) y cadena de 3 huesos en la cola con desfase de fase, sin desplazamiento artificial del hombro al alzar.
   - Reposo sereno, micro-ocio, 5 acciones, 6 caritas de la serie, reacciones por zona y `hornear()` determinista con **63 tracks por clip** (15 huesos + ojos) en `nailong_3d.glb`.
4. **`js/14-nailong3d-visor.js` · visor y carga bajo demanda (`W25` + `3D3` + `?3d=debug`)**:
   - **Único script 3D incluido en `index.html` (`W25`):** al acercarse a `#nailong-3d` (`IntersectionObserver` a 600 px) o entrar con `?3d=1`/`?3d=debug`/`#nailong-3d`, carga secuencialmente en orden estricto `js/11` → `js/12` → `js/13` (propagando el sufijo `?v=` del propio tag `js/14`) y luego Three.js r147 + OrbitControls con SRI.
   - Gestiona el bucle pausable fuera de pantalla, cámara orbital, regiones táctiles (`regionDe` incluye `codoIzq`/`codoDer` y `colaMedia`), foto PNG, **exportador de sticker 512×512 WebP (`3D3`)** con recorte centrado (margen ~6 %), ajuste de calidad ≤ 100 KB e inyección RIFF/VP8X + chunk `EXIF` de WhatsApp (`sticker-pack-id: nailong.3d.web`; respaldo PNG transparente si el navegador no codifica WebP), exportación `nailong_3d.glb` (11 clips) y panel flotante `?3d=debug`.

## 4. Herramientas de medición y comparación visual (`3D5`)
Todas funcionan con Node 24 y Python 3 + Pillow, **sin Playwright ni paquetes externos**:

| Herramienta | Qué hace |
|---|---|
| `herramientas/medir_nailong3d.js` | Carga `js/11` en memoria sin modificarlo, expone `dTorso/dCabeza/dBrazo/dPierna/dCola` y evalúa las 21 métricas `B1–B5, C1–C2, P1–P2, T1–T3, H1–H6, V1–V3` (`--tabla`, `--json`, `--salida`). Soporta brazo de 1 o 2 tramos y cola de 2–3+ tramos. |
| `herramientas/capturar_3d_cdp.js` | Levanta un servidor HTTP efímero (`127.0.0.1:0`), abre Chrome Headless con SwiftShader WebGL por CDP nativo (`fetch` + `WebSocket`), verifica 0 errores de consola/WebGL y extrae PNGs directos del lienzo en las 7 vistas del Anexo B (y con `--expresiones`, además las 6 caritas y 5 acciones). |
| `herramientas/lamina_comparativa.py` | Empareja las 7 vistas con las capturas locales de la serie (resuelve el repo principal en worktrees con `git rev-parse --git-common-dir` y compone con aviso sin fallar si faltan por D-25). Anota `--medidas` (OK/KO), admite modo `--ab <dirA> <dirB>` (3 columnas) y lámina de expresiones. |
| `herramientas/evaluar_3d.py` | Orden única: `node --check js/11..14` → `medir_nailong3d.js` → `capturar_3d_cdp.js` → `lamina_comparativa.py` (`--etiqueta`, `--expresiones`, `--salida`). Guarda por defecto bajo `documentacion/referencias_nailong_serie/comparativas/<etiqueta>/` (en `.gitignore`, D-25). |

## 5. Cómo retocar sin romper nada
- **Fuente única:** proporciones en `ANATOMIA` y paleta en `COLORES` dentro de `js/11` (consumidos por `js/12`). Puedes prototipar en vivo con `?3d=debug` y copiar el bloque `ANATOMIA`.
- **Ciclo obligado:** tras cualquier cambio en `js/11`–`js/14`, ejecuta `python herramientas/evaluar_3d.py --etiqueta <nombre> --expresiones` y `python verify_all.py`. El test 49 vigila carga diferida, estanqueidad (`huecos = 0`, `no2 = 0`, `inv = 0`, `pesosMal = 0`), 15 huesos y los rangos conseguidos de `3D6`–`3D10`.
- **Sincronización facial:** si mueves el hocico o la mandíbula, mantén alineados `crearBoca` (`y = 0,634`), `pesoMandibula` y los cortes `y/z` de `crearCaraDeformable` en `js/12`, además del rubor en `js/11` y el punto táctil de cabeza en `js/13`.
- **Higiene JS:** cero caracteres CJK y cero etiquetas HTML sueltas en cadenas o comentarios JS (tests 11 y 47 de `verify_all.py`).

## 6. Evolución futura (opcional)
- **Fase 0 (`3D5`) y Fase 1 (`3D6`–`3D10`) completadas** con 21/21 métricas en rango y 0 errores visuales en las 18 vistas.
- Quedan como líneas opcionales/futuras (ver `MEJORAS_PENDIENTES.md` y `PLAN_FIDELIDAD_NAILONG_3D.md`): **`3D11`** (piloto con Blender solo si el usuario decide abrirlo tras revisar visualmente el resultado de Fase 1; reabriría D-21) y **`3D4`** (vista AR, aplazada por el usuario).
