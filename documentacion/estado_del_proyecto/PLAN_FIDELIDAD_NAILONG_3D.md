# Plan de fidelidad de Nailong 3D: proporciones de la serie

> **Estado:** pendiente, no se ha aplicado nada. Evaluación del 24/11/2026 (Claude, Opus 5.5) sobre el núcleo `VERSION: 3` de `js/11`, en `main` tras el commit `90b27d5`.
> **Mejoras asociadas:** 3D5 a 3D11 en [`MEJORAS_PENDIENTES.md`](MEJORAS_PENDIENTES.md) (sección «Nailong 3D»).
> **Relacionado:** D-21 (modelo procedural), D-25 (capturas solo en local), nota técnica [`05_nailong_3d.md`](../notas_tecnicas/05_nailong_3d.md) y test 49 de `verify_all.py`.
> **Material local (fuera de Git, D-25):** capturas en `documentacion/referencias_nailong_serie/`, y lámina comparativa y medidas de partida en `documentacion/referencias_nailong_serie/comparativas/`. En otro equipo pueden faltar: los anexos explican cómo regenerarlas.

Analogía: hoy Nailong es «plastilina matemática». Son 13 bolas y conos que se funden (SDF), Surface Nets los congela en una sola piel y Three.js la pinta. La plastilina es buena. El problema es que se ha esculpido con los ojos vendados, a base de «un poco más a la izquierda». Este plan quita la venda (fase 0) y corrige las proporciones con medidas (fase 1).

---

## 0. Cómo retomar (para el próximo agente, Claude o Gemini)

1. Lee este documento entero, la nota 05 y `ESTADO_ACTUAL.md`. No hace falta la conversación original: aquí están todas las medidas, los objetivos y el mapa del código.
2. Si estás en el equipo del usuario, abre la lámina `documentacion/referencias_nailong_serie/comparativas/2026-11-24_modelo_vs_serie.png` y las capturas que cita cada punto.
3. Empieza por la **fase 0** (§5.1). No toques la geometría hasta tener «ojos»: la lámina y las medidas automáticas.
4. Haz una fase o un paso por sesión. La cabeza nunca va a la vez que el cuerpo (§7).
5. Es trabajo medio/grande: aplica el flujo completo de `AGENTS.md` (plan y OK del usuario, `python verify_all.py` en verde, bitácora…). Nada de commit ni push sin que el usuario lo pida.

---

## 1. Resumen

- Las cuatro observaciones del usuario son **correctas** y están medidas (§3).
- **Causa común de los puntos 3 y 4:** el torso es demasiado profundo (0,54 H frente a ≈0,40) y ancho. Además, brazos, piernas y cola nacen **dentro** de él, así que apenas asoman.
- **La tecnología actual basta** (SDF + Surface Nets + Three.js r147): son proporciones y algunos huesos más. Lo que de verdad falta es un bucle de verificación visual y medidas (fase 0). Blender queda como **piloto opcional** (fase 2, §5.3), y es decisión del usuario.

---

## 2. Lo que pidió el usuario (24/11/2026)

1. **Brazos:** en la serie son más largos e independientes del torso, y nacen un poco más atrás y más arriba (capturas `11`, `03`, `10` y `15`).
2. **Cola:** es más larga. La `11` muestra su forma y tamaño reales.
3. **Cabeza:** más redondita. Hoy parece un cilindro o cono que engorda a la altura de la barbilla. La real es larga y está desplazada hacia delante (`06`), mientras que el modelo es «muy lineal». Las **patas** tienen el mismo problema que los brazos (`04`, `05`).
4. **Barriga:** está exagerada, y la parte blanca de la serie es algo más pequeña (`05`).

---

## 3. Diagnóstico medido

### 3.1 Método

- **Modelo.** El núcleo `js/11` se carga en Node exponiendo sus funciones internas en memoria, sin modificar el fichero (script del Anexo A). Las medidas son exactas, con altura total H = 1.
- **Serie.** Se dibujó una cuadrícula sobre las capturas (Anexo C) y cada proporción se refiere a la altura del personaje en esa foto.
  - El margen es de ±15 %, porque cada captura tiene pose, lente y ángulo distintos.
  - En la `11` se corrigió el escorzo de la cola: con la cámara a unos 55° del frente, solo se ve el 82 % de su largo.
- **Renders.** Se hicieron con el navegador integrado de Claude Code sobre `http://localhost:8000/?3d=1`, colocando la cámara con `Nailong3DVisor.depurar.s` (Anexo B). Playwright no está instalado en este equipo, así que no se usó `herramientas/certificar_3d.js`.

### 3.2 Tabla de medidas y objetivos (H = altura total)

| # | Rasgo | Modelo actual | Serie (capturas) | Objetivo propuesto |
|---|---|---|---|---|
| B1 | Brazo: parte libre (desde que sale del cuerpo hasta la punta de la mano) | **0,12** | ≈0,20–0,28 (`04`, `10`, `13`, `15`) | 0,20–0,24 en reposo |
| B2 | Brazo: grosor (diámetro medio) | 0,14 | ≈0,09–0,12 (`10`, `13`, `15`) | 0,10–0,12 |
| B3 | Hombro: altura del eje | 0,43 | ≈0,44–0,50 con los brazos bajados (`05`, `13`, `14`); 0,54–0,56 alzados (`10`, `15`) | 0,47–0,50, justo bajo la mandíbula |
| B4 | Hombro: posición delante-detrás | z = +0,008 (algo por delante del centro del torso) | algo por detrás del centro (`05`: al 38 % desde la espalda) | z ≈ −0,02 a −0,05 |
| B5 | Codo | No existe: un hueso y un cono recto | Visible (`06`, `12`, `13`, `14`) | Dos tramos y un hueso de codo |
| C1 | Cola: cuánto sobresale de la espalda | **0,145** | ≈0,29 (`11`, con el escorzo corregido) | 0,26–0,30 |
| C2 | Cola: raíz y forma | Raíz a y = 0,18, cono corto y gordo | Raíz a ≈0,15–0,18, casi horizontal, se afina hasta una punta roma (`11`, `09`) | Como la serie |
| P1 | Pierna visible (del suelo a donde sale del torso) | **0,06** | ≈0,10–0,15 (`05`, `14`, `15`); muslo visible al levantarla (`04`) | 0,12–0,14 |
| P2 | Hueco entre piernas | Se cierra a y = 0,02 | Visible hasta ≈0,07–0,10 (`10`, `13`, `15`) | ≥ 0,07 |
| T1 | Torso: fondo delante-detrás (a la altura de la barriga) | **0,54** | ≈0,35–0,44 (`05` de perfil; deducido de `06`, `07` y `14`) | 0,38–0,42 |
| T2 | Torso: ancho sin brazos | 0,58 (test 49: ≈0,59) | ≈0,46–0,50 (`10`, `13`, `15`) | 0,48–0,52 |
| T3 | Torso: alto (de la entrepierna a la barbilla) | ≈0,46 | ≈0,40 | ≈0,40 |
| H1 | Voladizo: cara por delante de la barriga | **0,004** | ≈0,10–0,15 (`14` corregido; `05`, que está inclinado) | 0,10–0,14 |
| H2 | Cabeza: fondo delante-detrás | 0,53 | ≈0,48 a la altura de los ojos (`05`) | 0,48–0,50: no alargarla, **adelantarla** |
| H3 | Cabeza: ancho máximo | 0,54 | ≈0,43–0,49 (`13`, `15`, `10`) | 0,47–0,50 |
| H4 | Coronilla: ancho al 16 % superior de la cabeza dividido por el ancho máximo | 0,71 | ≈0,78 (`13`) | ≥ 0,76 |
| H5 | Cabeza: alto (de la barbilla a la coronilla) | 0,51 | ≈0,47–0,50 (`05`, `13`, `14`) | 0,47–0,50 |
| H6 | Cabeza / torso (ancho, como lo mide el test 49) | 0,909 | ≈0,88–0,97 (`13`, `15`, `10`) | 0,88–0,97 |
| V1 | Pancita: núcleo (≥ 90 % crema) | 0,33 × 0,36 (ancho × alto), de y = 0,07 a 0,43 | ≈0,33–0,36 × 0,34–0,37, de y ≈0,10 a 0,44 (`13`, `14`, `15`, `04`) | Se mantiene; subir la base a ≈0,10 |
| V2 | Pancita: borde visible (≥ 50 % crema) | **0,39 × 0,46**, del suelo (y = 0) a la barbilla; envuelve los costados hasta z = 0,008 | Borde nítido, casi igual al núcleo; de perfil es un óvalo estrecho (`05`) | ≤ 0,37 × 0,38, sin llegar al suelo |
| V3 | Pancita: halo (≥ 15 % crema) | 0,60 × 0,48: tiñe todo el frente del torso | Sin halo apreciable | Eliminar |

Matiz del punto 4: el **núcleo** blanco ya mide casi lo mismo que en la serie. Lo que lo agranda a la vista son el halo difuminado (`pancita.falda = 1.36`), el envolvimiento por los costados y una barriga que sobresale demasiado (T1).

### 3.3 Silueta ortográfica del modelo actual (línea base para comparar)

Ancho total de frente (con brazos) y extremos delante y detrás de perfil, por altura. Lo genera el Anexo A; los resultados completos están en `comparativas/2026-11-24_medidas_modelo_v3.json` (local).

| y | Ancho | z delante | z detrás | Qué hay a esa altura |
|---|---|---|---|---|
| 0,06 | 0,516 | 0,160 | −0,204 | Pies (las piernas casi no asoman) |
| 0,18 | 0,552 | 0,266 | −0,382 | Barriga y cola |
| 0,30 | 0,728 | 0,278 | −0,266 | Manos, barriga en su máximo |
| 0,42 | 0,580 | 0,230 | −0,260 | Pecho y brazos |
| 0,48 | 0,472 | 0,188 | −0,248 | Cuello |
| 0,54 | 0,388 | 0,226 | −0,230 | Cuello y barbilla |
| 0,66 | 0,536 | 0,286 | −0,226 | Mofletes (ancho máximo de la cabeza) |
| 0,78 | 0,508 | 0,262 | −0,240 | Ojos y frente |
| 0,90 | 0,412 | 0,210 | −0,200 | Coronilla |
| 0,96 | 0,284 | 0,138 | −0,142 | Coronilla |

En perfil, el frente de la cara (0,286) y el de la barriga (0,278–0,282) están en la misma vertical. Por eso la cabeza no «vuela» sobre el pecho.

### 3.4 Qué se ve en los renders (lámina local, 7 vistas)

- **Frente (frente a `13`):** los brazos son muñones pegados al costado, sin axila. Las piernas casi no se ven y el halo de la pancita va del suelo a la barbilla.
- **Perfil (frente a `05`):** el modelo tiene silueta de bolo o pera, con la cabeza apilada en vertical. La serie es una «judía inclinada»: la espalda baja en diagonal desde la nuca hasta la cola y la cabeza se proyecta hacia delante.
- **Tres cuartos y primer plano (frente a `14` y `12`):** el modelo tiene la cabeza en columna (un cilindro con cúpula y una «falda» en los mofletes). En la serie, el hocico y la mandíbula forman un volumen convexo que se adelanta.
- **Cola (frente a `11`):** muñón corto frente a un cuerno largo que se afina.
- **Saludo (frente a `03`):** al levantar el brazo, el modelo arrastra el costado (**efecto aleta**). Lo causan tres cosas:
  - La unión entre hombro y torso es ancha (`k.hombro = 0.048`).
  - Los pesos de piel automáticos (`tau = 0.022`) reparten la influencia del brazo sobre el torso.
  - Al alzarlo, el hueso del brazo se desplaza para simular el hombro (`js/13` l. 639–641).
- **Espalda (frente a `10`):** las 3 placas están bien situadas. No se ven piernas ni hueco entre ellas, y desde atrás los brazos casi no asoman.

---

## 4. Mapa de impacto en el código (líneas al 24/11/2026)

| Fichero | Qué hay que tocar | Líneas |
|---|---|---|
| [`js/11-nailong3d-geometria.js`](../../js/11-nailong3d-geometria.js) | `ANATOMIA` (de `craneo` a `pancita`), `k` (radios de fusión), `HUESOS` (12), `sdf()` (cuello direccional y unión del hombro), pesos de piel (`tau`) y colores: pancita, rubor (coordenadas fijas), palma (umbrales de y fijos) y planta. Las primitivas son elipsoides **sin giro**: una cabeza en «judía inclinada» pide añadir un giro en x a `elipsoide()`. | 15–39 · 32–37 · 49–62 · 67–80 · 189–216 · 408–458 · 462–476 |
| [`js/12-nailong3d-escena.js`](../../js/12-nailong3d-escena.js) | `pesoMandibula` y `crearCaraDeformable` (cortes fijos y > 0,515 … 0,618 y z > −0,015) y `crearBoca` (anclaje fijo a y = 0,626). Las placas se recolocan solas, por rayos desde el centro del cráneo. Las garras de las manos usan `brazo.a/b` y `mano.c`; las de los pies, `pie.c`. | 423–461 · 615–616 · 1094–1100 · 1102–1130 |
| [`js/13-nailong3d-animacion.js`](../../js/13-nailong3d-animacion.js) | `CANALES` y `BRAZO_NEUTRO`. Hay **90 usos** de canales de brazo (`bIX` … `bDZ`) en acciones, caritas, reposo y reacciones. También el desplazamiento del hombro al alzar, la cola (`cola` y `colaPunta`, 19 usos de `colaX/colaY`) y `hornear()` para los clips del GLB. | 13–26 · 55 y siguientes · 639–654 |
| [`js/14-nailong3d-visor.js`](../../js/14-nailong3d-visor.js) | Regiones táctiles por nombre de hueso: hay que añadir los codos y los huesos nuevos de la cola. | 316–318 |
| [`verify_all.py`](../../verify_all.py) (test 49) | `huesos == 12`, cabeza/torso entre 0,8 y 0,95, torso/altura entre 0,5 y 0,66, pancita entre 0,08 y 0,3, y densidad de malla entre 15 000 y 60 000 vértices. | 540–543 |
| [`herramientas/certificar_3d.js`](../../herramientas/certificar_3d.js) | Vistas canónicas contra **stickers**, no contra la serie. Necesita Playwright, que no está instalado en este equipo; sus capturas son del 11/11. | 46 y siguientes · 364–430 |

---

## 5. Plan por fases

### 5.1 Fase 0 · Ojos y medidas para el agente (3D5)

**Duración estimada:** 1 sesión corta, sin tocar el modelo.

Objetivo: que cada cambio se **vea** junto a la serie y se **mida**, sin depender de la memoria ni del ojo del agente.

1. **`herramientas/medir_nailong3d.js`:** el script del Anexo A convertido en herramienta. Saca en JSON las medidas B1–V3 de §3.2, con su objetivo y una marca de «en rango / fuera de rango».
2. **Lámina automática «render | captura».** Usa las 7 vistas emparejadas del Anexo B y el generador del Anexo D. Hay dos formas de hacer los renders:
   - con el navegador integrado del agente (Claude Code o Antigravity), sin instalar nada;
   - con `certificar_3d.js` adaptado, pero eso exige instalar Playwright, que es una dependencia nueva y hay que preguntar antes.
3. **Las capturas no están en Git (D-25):** si faltan, las herramientas avisan y siguen, sin fallar.
4. **Test 49:** en la fase 0 **no** se añaden comprobaciones que fallen, porque la suite debe seguir en verde. Cada paso de la fase 1 añade la comprobación de la medida que corrige, en el mismo cambio (regla 9 de `AGENTS.md`).
5. **Opcional, a decidir con el usuario:** un panel de deslizadores propio (sin dependencias) en `?3d=debug`. El usuario ajusta los parámetros en vivo y copia los valores; la malla se recalcula en ~0,3 s en el Worker.

**Criterio de aceptación:** una sola orden genera la lámina y la tabla de medidas del estado actual, y reproduce los valores de §3.2.

### 5.2 Fase 1 · Proporciones de la serie (3D6 a 3D10)

**Duración estimada:** 2–3 sesiones. El orden sigue las dependencias, porque todo se ancla al torso.

**Bucle de cada paso:**
1. Cambiar.
2. Pasar `node --check` en `js/11`–`js/14`.
3. Pasar el test 49 (o `python verify_all.py`).
4. Generar la lámina de 7 vistas.
5. Medir y comparar con §3.2.
6. Ajustar y repetir.
7. Al cerrar el paso, añadir al test 49 la comprobación del objetivo conseguido.

**Paso 1 · Torso y pancita (3D6).** Riesgo bajo.
- Meter la barriga (`barriga.c[2]` = 0,05 y `r[2]` = 0,226) hasta un fondo de 0,38–0,42 (T1), con el frente de la barriga en z ≈ 0,20–0,22.
- Estrechar las caderas a 0,48–0,52 (T2).
- Pancita:
  - Bajar `falda` de 1,36 a ≈1,05–1,10 para un borde nítido.
  - Subir la base a ≈0,10 (V1).
  - Limitar cuánto envuelve los costados: subir el umbral de la normal `suavizar(0.04, 0.30, nzN)` o atenuar con |x|.
- Test 49: el cociente cabeza/torso subirá. Hay que pasar el rango a los valores de la serie (≈0,85–1,0) y comprobar que la fracción de pancita sigue por encima de 0,08.
- Cambia dónde se apoyan brazos, piernas y cola; se revisan en los pasos siguientes.

**Paso 2 · Piernas (3D7).** Riesgo medio.
- Subir el fondo de caderas y barriga, que hoy llegan a y ≈ 0,04–0,06, hasta ≈0,11–0,13. Así el torso pasa a medir ≈0,40 de alto (T3).
- Alargar el muslo (`pierna.a/b`), abrir el hueco entre piernas (P2) y conservar los pies planos con 3 garras (se recolocan solas desde `pie.c`).
- Si hace falta, reescalar un poco el cuerpo superior para mantener H = 1.
- Revisar la almohadilla rosa de la planta (umbral y < 0,014), `pIX`/`pDX` en Baile y Duang, y el contacto con el suelo.

**Paso 3 · Brazos con codo (3D8).** Riesgo **alto**, por el efecto dominó en las animaciones.
- Hombro a y ≈ 0,47–0,50 y z ≈ −0,02 a −0,05, con la raíz justo bajo la mandíbula (B3, B4).
- Brazo en dos tramos (brazo y antebrazo), con el codo algo doblado en reposo.
- Diámetro de 0,10–0,12 y la manopla un poco más ancha que la muñeca (B1, B2).
- Unión direccional, como ya hace el cuello (`kCuello`): suave por arriba (hombro redondo) y nítida en la axila, con hueco visible de frente (`13`).
- Dos huesos más (`codoIzq`, `codoDer`), hasta 14. Hay que actualizar `HUESOS`, los pesos de piel (que el brazo influya menos en el costado), las regiones de `js/14` y el test 49.
- Rehacer `BRAZO_NEUTRO` y revisar los 90 usos de canales de brazo en `js/13`. Las manos no deben atravesar la barriga ni la cara en acciones, caritas ni reacciones.
- Revisar también el desplazamiento del hombro al alzar (l. 639–641), las garras y la palma rosa (dependen de `brazo` y `mano`), `hornear()` y los clips del GLB.
- **Criterio:** B1–B5 en rango y el saludo sin efecto aleta (comparado con `03`).

**Paso 4 · Cola (3D9).** Riesgo medio.
- Entre 3 y 4 puntos de control. La raíz, a ≈0,15–0,18 con un radio de 0,10–0,12; un radio medio de ≈0,06 y una punta roma de ≈0,03.
- Casi horizontal, con una curva suave, y que sobresalga 0,26–0,30 (C1, C2).
- Opcional: un hueso más (`colaMedia`, hasta 15) para que menee en curva. Al ser más larga, conviene suavizar las amplitudes del meneo (`js/13` l. 648–654).
- Revisar que no atraviese el suelo ni las piernas al menear, y la región táctil `cola`.

**Paso 5 · Cabeza (3D10).** Riesgo **el más alto**. Va sola y al final.
- No alargarla: **adelantarla** ≈0,04–0,05 respecto al torso, manteniendo la nuca continua con la espalda. La espalda pasa a ser una diagonal larga de la nuca a la cola, como en `05` y `14` (H1, H2).
- Coronilla más ancha (H4 ≥ 0,76) y ancho máximo de 0,47–0,50 (H3).
- Fundir los mofletes para quitar la «falda». Hay dos opciones:
  - subir el radio de fusión o reequilibrar los radios de `mofletes` frente a `craneo`;
  - sustituir cráneo y mofletes por un único elipsoide inclinado (requiere el giro en x de §4).
- Hocico y mandíbula convexos de perfil (`12`).
- Volver a anclar:
  - la boca (y = 0,626 en `crearBoca`);
  - los cortes de la cara deformable (0,515 … 0,618 y z > −0,015);
  - el rubor (coordenadas fijas en `js/11`);
  - la cuenca de los ojos.
  
  La posición del ojo (x 0,108, y 0,73) y las placas se recalculan solas sobre la superficie.
- Volver a validar en primeros planos las 6 caritas y las 5 acciones, sin *clipping* ni *z-fighting*.
- **Criterio:** H1–H6 en rango y caritas limpias.

### 5.3 Fase 2 · Piloto opcional con Blender (3D11)

Es **decisión del usuario**.

- **Cuándo:** solo si, después de la fase 1, siguen faltando deformaciones creíbles (codos, hombros), caras de calidad de serie o acabado.
- **Cómo:**
  - Trabajar en una rama o *worktree* aparte.
  - Un script versionado (p. ej. `herramientas/blender/construir_nailong.py`), ejecutado con `blender -b -P`, construye la malla, el esqueleto (Rigify trae piezas para cola) y las *shape keys* de las caritas, y exporta un GLB. El exportador glTF de Blender exporta *skinning*, *shape keys* como *morph targets* y varias acciones.
  - El visor lo cargaría con el `GLTFLoader` de r147, que es un script clásico y admite *skinning* y *morph targets*.
  - Comparar los dos modelos lado a lado con la misma lámina y las mismas medidas.
- **Qué cambia:** se reabre D-21, que descartó un `.glb` precalculado por falta de trazabilidad, así que haría falta una decisión nueva. El test 49 pasaría a inspeccionar el GLB.
- **Seguridad:** el conector MCP oficial ejecuta el Python que escribe el LLM sin protecciones, y sus autores recomiendan usarlo en una máquina virtual.

---

## 6. Herramientas 3D evaluadas (investigación web del 24/11/2026)

**Por qué la tecnología no es el cuello de botella:**
- Los cuatro problemas son proporciones (números del SDF) y algún hueso de más.
- Lo que limita a un LLM es trabajar sin ver el resultado ni medirlo, y eso se arregla en la fase 0 con cualquier tecnología.
- La técnica actual tiene un techo real en tres sitios: piel automática tosca, caras por desplazamiento de vértices y control indirecto (mover una bola cambia las vecinas). Es lo que podría justificar la fase 2.

| Opción | ¿Gratis? | Qué aporta | Pegas | Veredicto |
|---|---|---|---|---|
| SDF actual + fase 0 | Sí | Todo es texto, se prueba en Node y no hay binarios | Techo de deformaciones y caras | **Ahora** |
| **Blender 5.3** (GPL; estable del 10/11/2026, LTS 5.2) por script `blender -b -P`, con el **conector MCP oficial** de Blender (Blender Lab, GPL; disponible en Claude desde el 28/04/2026 y usable por otros LLM) | Sí | Modelado real, Rigify, *shape keys* → *morph targets* glTF, renders; el LLM ve el visor | Instalador de ~384 MB. La web cargaría un `.glb` (D-21). El MCP ejecuta Python sin protección. En Claude Code y otros clientes se configura a mano | **Piloto opcional** (fase 2) |
| IA de imagen a 3D: TRELLIS y TRELLIS.2 (MIT), TripoSR (MIT), SF3D y SPAR3D (licencia comunitaria de Stability) | Sí, con una gráfica de 6–24 GB o los Spaces de Hugging Face (≈5 min/día con cuenta) | Silueta rápida | Malla sucia, cara pintada en la textura (sin expresiones) y sin esqueleto. Habría que subir capturas de la serie (D-25) | Como mucho, experimento de referencia |
| Hunyuan3D 2.x (Tencent) | — | — | Su licencia comunitaria **no se aplica en la UE, el Reino Unido ni Corea del Sur**: desde España no hay licencia válida | Descartado |
| Meshy, Tripo, Rodin (planes gratuitos) | Parcial | — | Meshy se queda la propiedad (te da CC BY) y puede entrenar con tus imágenes salvo que te niegues por correo. Tripo hace públicas las generaciones gratuitas. Rodin usa tus datos para mejorar el servicio | Descartado |
| Three.js moderno (r187), `<model-viewer>` 4.4 o Babylon | Sí | Renderizado | El motor no es el problema. Pasar de r147 obliga a módulos ES (D-15 abierta); `model-viewer` no permite fijar *morph targets* por API (relevante para 3D4) | Ahora no |
| Auto-rig: Rigify (incluido en Blender), UniRig (MIT, CUDA ≥ 8 GB), Mixamo (solo humanoides) | Sí | Esqueleto y pesos | Solo tienen sentido en la fase 2 | Fase 2 |

**Fuentes** (consultadas el 24/11/2026; el conector oficial se confirmó además en una segunda fuente):
- Blender 5.3: <https://download.blender.org/release/Blender5.3/>
- Blender 5.2 LTS: <https://www.blender.org/releases/5-2/>
- Línea de órdenes de Blender: <https://docs.blender.org/manual/en/5.0/advanced/command_line/arguments.html>
- Exportador glTF: <https://docs.blender.org/manual/en/5.0/addons/import_export/scene_gltf2.html>
- MCP oficial: <https://projects.blender.org/lab/blender_mcp>, <https://academy.claude.com/tutorials/using-the-blender-connector-in-claude> y <https://gamefromscratch.com/blenders-new-corporate-patron-anthropic-ai/>
- MCP de terceros `ahujasid/blender-mcp` (socket sin autenticación; CVE-2026-10688): <https://github.com/ahujasid/blender-mcp>
- Licencia de Hunyuan3D: <https://huggingface.co/tencent/Hunyuan3D-2.1/blob/main/LICENSE>
- TRELLIS.2: <https://github.com/microsoft/TRELLIS.2>
- TripoSR: <https://github.com/VAST-AI-Research/TripoSR>
- Licencia de Stability: <https://stability.ai/community-license-agreement>
- Cuotas de ZeroGPU: <https://huggingface.co/docs/hub/spaces-zerogpu>
- Términos de Meshy: <https://www.meshy.ai/terms-of-use>
- Términos de Tripo: <https://www.tripo3d.ai/terms>
- Términos de Rodin: <https://hyper3d.ai/legal/terms>
- Rigify: <https://docs.blender.org/manual/en/5.0/addons/rigging/rigify/index.html>
- UniRig: <https://github.com/VAST-AI-Research/UniRig>
- Guía de migración de Three.js (r148 retira `examples/js`): <https://github.com/mrdoob/three.js/wiki/Migration-Guide>
- Versiones de Three.js: <https://github.com/mrdoob/three.js/releases>
- model-viewer: <https://modelviewer.dev/> y, sobre *morph targets*, <https://github.com/google/model-viewer/discussions/2614>

Antes de decidir la fase 2, vuelve a comprobar versiones y licencias: cambian a menudo.

---

## 7. Pautas de trabajo para la sesión

- **Una parte por iteración.** La cabeza nunca a la vez que el cuerpo, porque arrastra boca, ojos y caritas.
- **Ningún «hecho» sin lámina y medidas.** Y al cerrar, `python verify_all.py` en verde mostrando el resultado real.
- **Mantener lo que ya funciona:**
  - estanqueidad (`huecos = 0`, `no2 = 0`, `inv = 0`);
  - densidad de malla dentro del rango del test 49;
  - tiempo de malla en el Worker (hoy ≈0,25–0,35 s);
  - shader *mochi*, modo *toon* (el contorno comparte la geometría) y la paleta `G.COLORES` como fuente única.
- **Las partes finas necesitan radios de fusión más pequeños**, para que no salgan membranas. Vigila la punta de la cola y la muñeca: con una celda de 0,0105, una punta de radio 0,03 tiene unas 6 celdas.
- **Cada objetivo conseguido se convierte en una comprobación del test 49**, en el mismo cambio. Nunca se desactiva una comprobación (regla 9).
- **Después de tocar brazos o cabeza**, revisar las 5 acciones, las 6 caritas, las reacciones táctiles y la exportación GLB.
- **Un solo escritor sobre `js/11`–`js/14`**, que son un único conjunto. Si trabajan dos agentes, cada uno en su rama o *worktree*.
- **Al cerrar cada fase:**
  - nota 05 (anatomía, huesos y cómo retocar);
  - bitácora y `ESTADO_ACTUAL.md`;
  - marcar en `MEJORAS_PENDIENTES.md` lo aplicado;
  - `CHANGELOG.md` y sufijo `?v=` si se publica.
- **No subir capturas de la serie a servicios externos**, por D-25 y por los términos de los planes gratuitos.

---

## 8. No comprobado

- Las medidas de la serie son aproximadas (±15 %): pose, lente y ángulo varían en cada captura.
- No se ha probado ningún cambio de proporciones: los objetivos son puntos de partida que hay que calibrar con la lámina.
- Rendimiento en móviles reales (Safari en iPhone y Chrome en Android) tras los cambios.
- Si el conector MCP oficial de Blender funciona en Antigravity o en Claude Code (oficialmente solo viene listo en Claude Desktop) y cuánto ocupa Blender ya instalado.

---

## Anexo A · Script de medición del modelo (Node)

Se usó el 24/11 y reproduce todos los valores «Modelo actual» de §3.2. No modifica `js/11`: lee el fichero, expone en memoria las funciones internas (`dTorso`, `dCabeza`, `dBrazo`, `dPierna`, `dCola`) y mide. Tarda 1–3 minutos.

```text
node medir_nailong3d.js js/11-nailong3d-geometria.js > medidas.json
```

```js
// Mide las proporciones del Nailong 3D procedural (solo lectura).
// Uso: node medir_nailong3d.js js/11-nailong3d-geometria.js
// Carga el núcleo en memoria, expone sus funciones internas sin tocar el fichero y mide con H = 1.
const fs = require('fs');
let src = fs.readFileSync(process.argv[2], 'utf8');
src = src.replace(/return \{\s*VERSION: (\d+),/, 'return { dTorso, dCabeza, dBrazo, dPierna, dCola, VERSION: $1,');
const K = new Function(src + '\n;return Nailong3DGeometria;')();
if (!K.dTorso) throw new Error('No se pudieron exponer dTorso/dCabeza/dBrazo/dPierna/dCola: revisa el return del núcleo');
const A = K.ANATOMIA;
const r3 = (n) => (n === null ? null : Math.round(n * 1000) / 1000);
const out = { version: K.VERSION };

// Siluetas ortográficas por altura: ancho total (con brazos), z delante y z detrás
function extremos(fn, y, eje) {
  let mn = Infinity, mx = -Infinity;
  for (let a = -0.6; a <= 0.6; a += 0.002) for (let b = -0.6; b <= 0.6; b += 0.004) {
    const d = eje === 'x' ? fn(a, y, b) : fn(b, y, a);
    if (d < 0) { mn = Math.min(mn, a); mx = Math.max(mx, a); }
  }
  return [mn, mx];
}
out.silueta = [];
for (let y = 0.06; y <= 0.99; y += 0.06) {
  const fx = extremos(K.sdf, y, 'x'), fz = extremos(K.sdf, y, 'z');
  out.silueta.push({ y: r3(y), ancho: r3(fx[1] - fx[0]), zDelante: r3(fz[1]), zDetras: r3(fz[0]) });
}

// B1-B4 · Brazo: punto donde sale del cuerpo a lo largo de su eje y parte libre hasta la punta de la mano
const sinBrazos = (x, y, z) => { const ax = Math.abs(x); return Math.min(K.dTorso(ax, y, z), K.dCabeza(ax, y, z), K.dPierna(ax, y, z), K.dPierna(-ax, y, z)); };
const a = A.brazo.a, b = A.brazo.b, L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
const u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L, (b[2] - a[2]) / L];
let tSalida = null, tPunta = 0;
for (let t = 0; t <= 0.6; t += 0.001) {
  const p = [a[0] + u[0] * t, a[1] + u[1] * t, a[2] + u[2] * t];
  if (tSalida === null && sinBrazos(p[0], p[1], p[2]) > 0) tSalida = t;
  if (K.dBrazo(p[0], p[1], p[2]) < 0) tPunta = t;
}
out.brazo = { hombroY: a[1], hombroZ: a[2], diametroMedio: r3(A.brazo.ra + A.brazo.rb), parteLibre: r3(tPunta - tSalida) };

// P1-P2 · Piernas: altura visible bajo el torso y altura a la que se cierra el hueco entre piernas
let yTorso = null, yEntrepierna = null;
for (let y = 0; y <= 0.4; y += 0.001) { if (yTorso === null && K.dTorso(A.pierna.a[0], y, A.pierna.a[2]) < 0) yTorso = y; }
for (let y = 0; y <= 0.4; y += 0.001) { if (yEntrepierna === null && K.sdf(0, y, A.pierna.a[2]) < 0) yEntrepierna = y; }
out.pierna = { visible: r3(yTorso), entrepiernaCierraEnY: r3(yEntrepierna) };

// C1 · Cola: cuánto sobresale por detrás del torso
let zEspalda = null, zPunta = 0;
for (let z = 0; z >= -0.6; z -= 0.001) { if (zEspalda === null && K.dTorso(0, A.cola.a[1], z) > 0) zEspalda = z; }
for (let z = 0; z >= -0.8; z -= 0.002) for (let y = 0.02; y <= 0.45; y += 0.004) { if (K.dCola(0, y, z) < 0) zPunta = Math.min(zPunta, z); }
out.cola = { sobresale: r3(zEspalda - zPunta) };

// H1-H5 · Cabeza y T1-T2 · Torso
let cMin = [Infinity, Infinity, Infinity], cMax = [-Infinity, -Infinity, -Infinity], tMin = [Infinity, Infinity, Infinity], tMax = [-Infinity, -Infinity, -Infinity];
for (let x = 0; x <= 0.45; x += 0.004) for (let y = 0; y <= 1.05; y += 0.004) for (let z = -0.45; z <= 0.5; z += 0.004) {
  const p = [x, y, z];
  if (K.dCabeza(x, y, z) < 0) for (let i = 0; i < 3; i++) { cMin[i] = Math.min(cMin[i], p[i]); cMax[i] = Math.max(cMax[i], p[i]); }
  if (K.dTorso(x, y, z) < 0) for (let i = 0; i < 3; i++) { tMin[i] = Math.min(tMin[i], p[i]); tMax[i] = Math.max(tMax[i], p[i]); }
}
const altoCab = cMax[1] - cMin[1], yCoronilla = cMax[1] - 0.16 * altoCab;
const anchoCoronilla = extremos((x, y, z) => K.dCabeza(Math.abs(x), y, z), yCoronilla, 'x');
out.cabeza = { ancho: r3(2 * cMax[0]), alto: r3(altoCab), fondo: r3(cMax[2] - cMin[2]), voladizoSobreBarriga: r3(cMax[2] - tMax[2]), coronillaSobreMax: r3((anchoCoronilla[1] - anchoCoronilla[0]) / (2 * cMax[0])) };
out.torso = { fondo: r3(tMax[2] - tMin[2]), ancho: r3(2 * tMax[0]), frenteBarrigaZ: r3(tMax[2]) };

// V1-V3 · Pancita: extensión del color crema en la malla real (canal azul, el que más separa amarillo y crema)
const m = K.generarMalla({ celda: 0.0105 });
const P = m.posiciones, C = m.colores, nv = P.length / 3;
const am = K.srgbALineal(K.COLORES.amarillo), cr = K.srgbALineal(K.COLORES.crema);
out.pancita = {};
for (const [clave, umbral] of [['nucleo90', 0.9], ['borde50', 0.5], ['halo15', 0.15]]) {
  let xmn = 1e9, xmx = -1e9, ymn = 1e9, ymx = -1e9, zmn = 1e9;
  for (let v = 0; v < nv; v++) {
    const f = (C[v * 3 + 2] - am[2]) / (cr[2] - am[2]);
    if (f < umbral || P[v * 3 + 2] < 0) continue;
    xmn = Math.min(xmn, P[v * 3]); xmx = Math.max(xmx, P[v * 3]); ymn = Math.min(ymn, P[v * 3 + 1]); ymx = Math.max(ymx, P[v * 3 + 1]); zmn = Math.min(zmn, P[v * 3 + 2]);
  }
  out.pancita[clave] = { ancho: r3(xmx - xmn), alto: r3(ymx - ymn), y: [r3(ymn), r3(ymx)], zMasAtras: r3(zmn) };
}
console.log(JSON.stringify(out, null, 1));
```

Si el brazo pasa a dos tramos, la medida B1 debe recorrer los dos segmentos, no solo `brazo.a → brazo.b`.

---

## Anexo B · Vistas emparejadas y cámara del visor

Con el servidor local en marcha y la sección `#nailong-3d` cargada (`?3d=1`), en la consola del navegador:

```js
window.__vista = function (azDeg, elDeg, dist, ty) {   // az 0 = frente; negativo = lado derecho de Nailong
  const S = Nailong3DVisor.depurar.s;
  S.anim.asentar(2.2);
  const az = azDeg * Math.PI / 180, el = elDeg * Math.PI / 180, dh = dist * Math.cos(el);
  S.camara.position.set(dh * Math.sin(az), ty + dist * Math.sin(el), dh * Math.cos(az));
  S.controles.target.set(0, ty, 0);
  S.camara.lookAt(S.controles.target);
  S.controles.update();
  S.renderer.render(S.escena, S.camara);
};
// Saludo con el brazo arriba: S.anim.accion('saludar'); 66 pasos de S.anim.actualizar(1/60, null); después colocar la cámara.
```

| Vista | `__vista(az, el, dist, ty)` | Captura de la serie |
|---|---|---|
| Frente | `(0, 0, 2.6, 0.5)` | `13_frente_sonrisa_manos_barriga.jpg` |
| Perfil | `(-90, 0, 2.6, 0.5)` | `05_perfil_derecho_cuello_barbilla.jpg` |
| Tres cuartos | `(-55, 4, 2.6, 0.5)` | `14_tres_cuartos_manos_cintura.jpg` |
| Cola | `(-140, 6, 2.6, 0.5)` | `11_tres_cuartos_cola_y_palma.jpg` |
| Cabeza (primer plano) | `(-62, 6, 1.55, 0.66)` | `12_primer_plano_cabeza_textura.jpg` |
| Saludo | `(-35, ~2, 2.4, 0.5)` tras la acción | `03_tres_cuartos_saludo_palma_rosa.jpg` |
| Espalda | `(180, 4, 2.6, 0.5)` | `10_espalda_tres_placas.jpg` |

El lienzo mide unos 556 × 552 px en escritorio. Para el render basta una captura recortada del lienzo, por ejemplo con la acción `zoom` del navegador integrado.

---

## Anexo C · Cuadrícula para medir las capturas (Python + Pillow)

Dibuja líneas cada 25 o 50 px con etiquetas en coordenadas originales. Así se leen alturas y anchos y se dividen por la altura del personaje en esa foto.

```python
# Uso: python rejilla.py CARPETA_CAPTURAS CARPETA_SALIDA 05_perfil_derecho_cuello_barbilla.jpg 11_tres_cuartos_cola_y_palma.jpg ...
import sys, os
from PIL import Image, ImageDraw
src_dir, out_dir = sys.argv[1], sys.argv[2]
for nombre in sys.argv[3:]:
    im = Image.open(os.path.join(src_dir, nombre)).convert('RGB')
    w, h = im.size
    esc = max(1.0, 900 / max(w, h))
    im2 = im.resize((int(w * esc), int(h * esc)), Image.LANCZOS)
    d = ImageDraw.Draw(im2)
    paso = 25 if max(w, h) <= 700 else 50
    for x in range(0, w, paso):
        X = int(x * esc); fuerte = (x % (paso * 4) == 0)
        d.line([(X, 0), (X, im2.size[1])], fill=(0, 90, 255) if fuerte else (120, 170, 255), width=2 if fuerte else 1)
        if fuerte: d.text((X + 2, 2), str(x), fill=(0, 0, 160))
    for y in range(0, h, paso):
        Y = int(y * esc); fuerte = (y % (paso * 4) == 0)
        d.line([(0, Y), (im2.size[0], Y)], fill=(255, 40, 40) if fuerte else (255, 150, 150), width=2 if fuerte else 1)
        if fuerte: d.text((2, Y + 2), str(y), fill=(160, 0, 0))
    im2.save(os.path.join(out_dir, 'rej_' + os.path.splitext(nombre)[0] + '.png'))
```

---

## Anexo D · Generador de la lámina «render | captura» (Python + Pillow)

Probado el 24/11. Compone una fila por vista y, si falta un render o una captura, avisa y la omite.

```text
python lamina_comparativa.py salida.png "Frente|render_frente.png|documentacion/referencias_nailong_serie/13_frente_sonrisa_manos_barriga.jpg|Brazos pegados al costado..." "Perfil|render_perfil.png|.../05_perfil_derecho_cuello_barbilla.jpg|..."
```

```python
# Lámina «render actual | captura de la serie», una fila por vista (requiere Pillow).
# Uso: python lamina_comparativa.py salida.png "Título|render.png|captura.jpg|nota" ["..."]
import os
import sys
from PIL import Image, ImageDraw, ImageFont

ALTO = 400


def fuente(t):
    for f in (r"C:\Windows\Fonts\segoeui.ttf", r"C:\Windows\Fonts\arial.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"):
        if os.path.exists(f):
            return ImageFont.truetype(f, t)
    return ImageFont.load_default()


def fila(titulo, render, captura, nota, fT, fC):
    a = Image.open(render).convert("RGB")
    b = Image.open(captura).convert("RGB")
    a = a.resize((int(a.width * ALTO / a.height), ALTO), Image.LANCZOS)
    b = b.resize((int(b.width * ALTO / b.height), ALTO), Image.LANCZOS)
    ancho = max(a.width + b.width + 30, 1100)
    lineas, actual = [], ""
    for palabra in nota.split():
        prueba = (actual + " " + palabra).strip()
        if fC.getlength(prueba) > ancho - 20:
            lineas.append(actual)
            actual = palabra
        else:
            actual = prueba
    lineas.append(actual)
    bloque = Image.new("RGB", (ancho, ALTO + 64 + 26 * len(lineas)), (255, 255, 255))
    d = ImageDraw.Draw(bloque)
    d.text((10, 6), f"{titulo}:  render (izq.)  |  serie, {os.path.basename(captura)} (dcha.)", fill=(40, 40, 40), font=fT)
    bloque.paste(a, (10, 44))
    bloque.paste(b, (20 + a.width, 44))
    for i, linea in enumerate(lineas):
        d.text((10, ALTO + 52 + 26 * i), linea, fill=(150, 30, 30), font=fC)
    return bloque


def main():
    salida, entradas = sys.argv[1], sys.argv[2:]
    fT, fC = fuente(26), fuente(19)
    bloques = []
    for e in entradas:
        titulo, render, captura, nota = (e.split("|") + ["", "", "", ""])[:4]
        if not (os.path.exists(render) and os.path.exists(captura)):
            print(f"AVISO: falta el render o la captura de «{titulo}» (las capturas están solo en local, D-25); se omite.")
            continue
        bloques.append(fila(titulo, render, captura, nota, fT, fC))
    if not bloques:
        sys.exit("No hay ninguna fila completa: nada que componer.")
    total = Image.new("RGB", (max(b.width for b in bloques) + 20, sum(b.height for b in bloques) + 20), (255, 255, 255))
    y = 10
    for b in bloques:
        total.paste(b, (10, y))
        y += b.height
    total.save(salida, optimize=True)
    print(f"Lámina guardada: {salida} {total.size}")


if __name__ == "__main__":
    main()
```

Nota del equipo del usuario: en Git Bash, `python` puede abrir la Microsoft Store. Usa PowerShell o la ruta completa del intérprete.
