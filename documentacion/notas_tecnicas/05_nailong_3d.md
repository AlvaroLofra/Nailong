# Nota técnica 05 · Nailong 3D (visor interactivo y exportador GLB)

> **Subsistema:** sección `#nailong-3d` de la web (entre «¿Quién es?» y «Stickers»). Decisión de arquitectura: **D-21**.
> **Ficheros:** `js/11-nailong3d-geometria.js` · `js/12-nailong3d-escena.js` · `js/13-nailong3d-animacion.js` · `js/14-nailong3d-visor.js` · estilos `.n3d-*` al final de `css/styles.css`.
> **Prueba automática:** test 49 de `verify_all.py` (estructura, CDN fijada con SRI y prueba funcional del núcleo en Node).

## 1. Qué hace
- Modelo 3D **procedural** de Nailong (no hay ficheros de modelo en el repo): se calcula en el navegador en ~0,3–0,5 s dentro de un Web Worker.
- Visor con cámara orbital (girar, zoom, sin desplazamiento lateral), respiración, parpadeo, mirada que sigue al puntero y reacciones por zona tocada.
- Botones: saludar, ¡duang!, bailar, sorpresa, siesta; estilo «Sticker 3D» o «Dibujo animado»; recentrar, pantalla completa, foto PNG con fondo transparente y descarga del modelo `nailong_3d.glb`.

Analogía: en vez de pegar bolas de plastilina (costuras visibles), se describe la figura como una «niebla» de formas que se funden entre sí y después se «congela» su superficie en una sola piel.

## 2. Anatomía canónica (de dónde sale cada medida)
Se midió sobre los stickers, no de memoria. Altura total = 1 (1 m en el GLB), pies en y = 0, cara hacia +z.

| Rasgo | Referencia | Cómo se modela |
|---|---|---|
| Silueta de pera alta, cabeza fundida sin cuello, papada que asoma sobre el pecho | sticker_86, sticker_43, sticker_18 | Elipsoides de cráneo, mofletes, frente y hocico unidos con fusión suave; unión cabeza–pecho con radio pequeño (`k.cuello`) para conservar el pliegue de la mandíbula |
| Hocico redondo que avanza | sticker_20, sticker_75 | Elipsoide `hocico` adelantado |
| Pancita crema grande con borde suave | sticker_86, sticker_43 | Color por vértice con óvalo frontal (`ANATOMIA.pancita`) + bulto `barriga` |
| Ojos grandes y separados: esclerótica blanca, iris verde con aro oscuro, pupila negra, brillo | sticker_50, sticker_47, sticker_2 | Globo con textura pintada por píxel sobre la esfera (iris circular sin distorsión), cuenca restada en el campo, párpados superior e inferior con borde oscuro («rayita» al cerrar), dos brillos fijos a la cabeza |
| 3 placas dorsales oliva (la 1.ª asoma en la coronilla) | sticker_31, sticker_52, sticker_84 | Tres elipsoides oliva anclados a la superficie por la línea media de la nuca (no hay cuernos) |
| Brazos gruesos con 3 garritas marrones y almohadilla rosa | sticker_86, sticker_43, sticker_52 | Cono redondeado + mano; garras y almohadilla ancladas con `trazarRayo` |
| Piernas cortas con 3 uñas por pie | sticker_86, sticker_10 | Cono + pie con planta plana (intersección suave con y = 0) |
| Cola cónica con punta, hacia atrás y abajo | sticker_52, sticker_84 | Cono redondeado de radio decreciente |

Los colores (sRGB) están en `COLORES` del núcleo y se pasan a lineal para WebGL y glTF. La geometría se genera en **pose «A»** (brazos separados) para que las manos no se fundan con la tripa; la pose visible baja los brazos con el esqueleto (`BRAZO_NEUTRO`).

## 3. Arquitectura (4 scripts clásicos, orden de carga 11 → 14)
1. **`js/11` · núcleo geométrico** (sin THREE ni DOM; corre en Worker, navegador y Node):
   - Campo de distancia con signo (SDF) a base de elipsoides y conos redondeados, unión/diferencia suaves polinómicas y esferas envolventes para no evaluar partes lejanas (mismo resultado, la mitad de cálculo).
   - **Surface Nets en banda estrecha**: rejilla gruesa (×4) para localizar la superficie y rejilla fina solo cerca de ella; un vértice por celda que corta, un cuadrilátero por arista cruzada, proyección de Newton y normales desde el gradiente (tetraedro de 4 muestras).
   - Pesos de piel desde el propio campo: suavizado exponencial de la distancia a cada grupo (cabeza, torso repartido por altura en cadera/tronco/pecho, pancita por máscara, brazos, piernas, cola en 2 tramos); 4 huesos por vértice.
   - `generarMalla({ celda })`, `anclarEnSuperficie`, `trazarRayo`. Celda 0,0085 (≈41 k vértices) en equipos potentes y 0,0105 (≈27 k) en móviles; malla proxy de 0,026 (≈4 k) para los toques.
   - `crearKernelGeometriaNailong` es una función global: js/14 la convierte en texto para crear el Worker desde un Blob (no hace falta un fichero extra, que el test 1 exigiría cargar en `index.html`).
2. **`js/12` · escena**: `SkinnedMesh` + 12 huesos; accesorios rígidos hijos de su hueso; boca como calcomanía curvada sobre un mapa de altura del hocico (se recalcula solo cuando cambia la expresión); materiales «suave» (`MeshPhysicalMaterial` con *sheen*), «toon» (`MeshToonMaterial` de 4 tonos + contorno por casco invertido) y «exportar» (`MeshStandardMaterial`, para que el GLB no declare extensiones vacías); abolladura gaussiana al tocar inyectada con `onBeforeCompile` (posición y normal); estudio con entorno PMREM propio, luz principal con sombra PCF suave, relleno, contraluz y sombra de contacto.
3. **`js/13` · animación**: canales con **muelles amortiguados a paso fijo** (1/120 s) — saltos, aplastamiento con volumen constante, inclinaciones, cabeza, brazos, piernas, cola, pancita, párpados y boca. Capas de reposo (respiración, balanceo, parpadeo aleatorio a veces doble, travesuras al aburrirse), acciones con línea de tiempo y reacciones (`tocar(región, punto)`). Es determinista (azar con semilla), así que `hornear()` reutiliza el mismo animador para generar los clips del GLB.
4. **`js/14` · visor**: carga Three.js bajo demanda, crea el renderer y la cámara, conecta controles, toques, botones, pantalla completa, foto y exportación, y se autoinicia (no toca `window.onload`).

## 4. Carga, rendimiento y móvil
- **Three.js r147** (`three@0.147.0`): última versión con `build/three.min.js` y `examples/js/` (OrbitControls, GLTFExporter) como scripts clásicos, coherente con D-15 (sin módulos). Se pide a jsDelivr con **SRI** (`sha384`, calculado sobre los mismos bytes del paquete npm) y, si falla, a unpkg con el mismo SRI. El exportador solo se descarga al pulsar «Descargar modelo 3D».
- `IntersectionObserver` con margen de 600 px: nada se descarga hasta que la sección se acerca. Otro observador pausa el bucle fuera de pantalla; `visibilitychange` lo pausa con la pestaña oculta.
- Calidad automática por `pointer: coarse`, núcleos y memoria (`decidirCalidad`): malla y mapa de sombras más ligeros y `pixelRatio` ≤ 1,5 en móvil (≤ 2 en escritorio). Si la media de fotograma supera ~22 ms, baja la resolución interna en pasos de 0,25 (mínimo 1×), tras 90 fotogramas de calentamiento.
- Táctil: `touch-action: pan-y` en la página (arrastre horizontal gira, vertical hace scroll, pellizco acerca) y `none` a pantalla completa. Pantalla completa con la API y respaldo CSS `.n3d-pantalla-css`; la cámara conserva el encuadre al cambiar la proporción.
- `prefers-reduced-motion`: sin intro, sin saltos y con impulsos y respiración reducidos.
- Respaldo: sin WebGL o si la CDN falla, mensaje dentro del visor (con botón de reintentar solo cuando sirve).
- El hover usa la malla proxy (≈4 k triángulos) con un límite de una consulta cada 90 ms.

## 5. Interacción
- Región tocada = hueso dominante del triángulo del proxy: cabeza → mimos; pancita → «Duang» (suma al contador «Cosquillas en su pancita» del inicio); brazo → saluda con ese brazo; cola → meneo; pie → saltito; si duerme, se despierta.
- La abolladura se coloca en el espacio de reposo con coordenadas baricéntricas sobre el triángulo deformado.
- Teclado (visor enfocado): flechas giran, `+`/`-` acercan, Intro o espacio hacen cosquillas. Región `aria-live` que anuncia cada acción.
- Sonidos con `playSound()` de `js/01-audio.js` (respeta el silencio global); solo suenan las acciones que inicia el usuario, nunca la intro ni las travesuras de reposo.

## 6. GLB exportado (`nailong_3d.glb`)
- glTF 2.0 binario: piel con 12 articulaciones, accesorios como nodos hijos de sus huesos, colores por vértice, textura del ojo, materiales PBR estándar con nombre (`Nailong_cuerpo`, `Nailong_placa`…) y brillos sin iluminación (`KHR_materials_unlit`).
- 5 clips horneados a 30 fps: `reposo`, `saludar`, `duang`, `bailar`, `sorpresa`. Se exporta en la pose de reposo.
- El contorno del estilo dibujo, la malla proxy y la abolladura (shader) no se exportan.
- Comprobado reimportándolo con `GLTFLoader` r147. **No comprobado:** abrirlo en Blender, Unity o Godot.

## 7. Cómo retocar sin romper nada
- Proporciones: `ANATOMIA` en js/11 (cada línea indica su sticker de referencia). El test 49 vigila estanqueidad, orientación, altura 1 con pies en el suelo y las relaciones cabeza/torso y torso/altura.
- Si una cuenca, garra o placa produce aristas no estancas, suele ser un borde demasiado fino: sube su radio de fusión (`k`).
- Expresiones y poses: `ACCIONES` y `CANALES` en js/13. Los ángulos de brazo para llevar las manos a un punto se calcularon con cuaterniones (`setFromUnitVectors` + giro de la palma) y se guardaron como desplazamientos sobre `BRAZO_NEUTRO`.
- Depuración: `Nailong3DVisor.depurar.estado()` en la consola.
