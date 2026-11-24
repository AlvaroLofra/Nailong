# 2026-11-24 · Evaluación de la fidelidad de Nailong 3D frente a la serie y de las herramientas 3D

| Campo | Valor |
|---|---|
| **Quién trabajó** | Claude (Opus 5.5), dirigido por el usuario. En paralelo, otra sesión hizo los commits del día y la revisión previa a publicar (W23–W30). |
| **Rama** | `main`; la documentación de esta sesión está sin commit. |
| **Versión del producto** | `v4.0.0 · revisión web 2`, sin cambios de producto. |
| **Verificación** | `python verify_all.py`: las 52 en verde. La parte Android de 5 tests queda «no comprobada», porque falta el código de la app en este equipo. |

## Objetivo
El usuario señaló cuatro diferencias del Nailong 3D con la serie:
- brazos cortos y pegados al torso;
- cola corta;
- cabeza en forma de cilindro o cono, y patas enterradas;
- barriga exagerada.

También preguntó si la tecnología 3D actual limita a los LLM y qué alternativas gratuitas existen. Pidió una evaluación sin tocar nada y, después, dejarla documentada para continuar.

## Qué se hizo
1. Se revisaron las 15 capturas de la serie y el código del 3D (`js/11`–`js/14`, test 49 y `herramientas/certificar_3d.js`).
2. Se renderizaron 7 vistas del modelo actual en el navegador integrado de Claude Code, con la cámara fijada mediante `Nailong3DVisor.depurar.s`. Se compusieron en una lámina «render | captura», que está en local: `documentacion/referencias_nailong_serie/comparativas/2026-11-24_modelo_vs_serie.png`.
3. Se midió el modelo en Node con el script del anexo A del plan. El resultado está en local, en `comparativas/2026-11-24_medidas_modelo_v3.json`. Las capturas se midieron con una cuadrícula (anexo C).
4. Se investigaron las alternativas con fuentes, mediante un subagente de búsqueda web: Blender con su conector MCP oficial, IA de imagen a 3D, servicios comerciales gratuitos, auto-rig, Three.js moderno y `<model-viewer>`. El conector MCP oficial de Blender se confirmó además en una segunda fuente.
5. Se documentó todo:
   - [`PLAN_FIDELIDAD_NAILONG_3D.md`](../PLAN_FIDELIDAD_NAILONG_3D.md), nuevo, con medidas, objetivos, mapa de código, fases, herramientas, pautas y scripts;
   - las mejoras 3D5–3D11 en `MEJORAS_PENDIENTES.md`;
   - la §5 nueva de la nota 05;
   - `ESTADO_ACTUAL.md` y `00_INDICE.md`.

## Hallazgos principales
- Las cuatro observaciones del usuario son correctas (H = altura total):

  | Rasgo | Modelo | Serie |
  |---|---|---|
  | Brazos (parte que asoma) | 0,12 | ≈0,20–0,28 |
  | Piernas visibles | 0,06 | ≈0,10–0,15 |
  | Cola (cuánto sobresale) | 0,145 | ≈0,29 |
  | Cara por delante de la barriga | 0,00 | ≈0,10–0,15 |
  | Fondo del torso | 0,54 | ≈0,40 |

- La pancita tiene un núcleo crema correcto (0,33 × 0,36), pero el halo la estira hasta un borde visible de 0,39 × 0,46, del suelo a la barbilla.
- **Causa común:** el torso es demasiado profundo y ancho, y las extremidades y la cola nacen dentro de él.
- **La tecnología actual basta** para corregirlo. El cuello de botella es que el agente no ve ni mide cada cambio contra la serie: eso lo resuelve la fase 0 (3D5).
- Hay un «efecto aleta» al saludar: el brazo arrastra el costado porque la unión del hombro es ancha y la piel automática reparte su peso sobre el torso.

## Alternativas descartadas
- **Cambiar ya a Blender:** reabre D-21 y no hace falta para los cuatro puntos. Queda como piloto opcional (3D11), a decidir por el usuario.
- **IA de imagen a 3D y planes gratuitos comerciales:**
  - la cara queda pintada, sin expresiones, y no hay esqueleto;
  - la licencia de Hunyuan3D no se aplica en la UE;
  - habría que subir capturas con derechos (D-25), y algunos servicios publican o reutilizan lo generado.
- **Three.js moderno o `<model-viewer>`:** no resuelven las proporciones y pasar de r147 abre D-15.
- **Añadir ya al test 49 comprobaciones que fallen:** la suite dejaría de estar en verde. Se añaden paso a paso en la fase 1.

## Coordinación entre sesiones
- La otra sesión hizo los commits `90b27d5`, `d63cf3f` y `8a6ba76` (sin push), pasó las capturas a `.gitignore` (D-25) y luego añadió W23–W30 sin commit.
- Antes de editar `MEJORAS_PENDIENTES.md` y `ESTADO_ACTUAL.md` se confirmó con ella que no los tocaría. Sus cambios se han conservado tal cual.
- A petición suya se anotó en `ESTADO_ACTUAL.md` §5 la decisión del usuario de aplazar W23–W30 a la próxima sesión, antes del `git push`.

## No comprobado
- Las medidas de la serie son aproximadas (±15 %), porque pose, lente y ángulo cambian en cada captura.
- No se ha probado ningún cambio de proporciones. Los objetivos del plan son puntos de partida que hay que calibrar con la lámina.
- Si el conector MCP oficial de Blender funciona en Antigravity o en Claude Code (oficialmente solo viene listo en Claude Desktop).

## Cómo retomar
Leer el §0 de [`PLAN_FIDELIDAD_NAILONG_3D.md`](../PLAN_FIDELIDAD_NAILONG_3D.md) y empezar por 3D5 (fase 0). Hay que hacer una mejora por sesión y dejar la cabeza (3D10) siempre sola y al final.

## Verificación
Salida de `python verify_all.py` al cerrar la sesión: `52 VERIFICATION TESTS PASSED, 5 WITH THEIR ANDROID PART NOT CHECKED`. El test 35 (índice y cifras obsoletas en los documentos estables) y el test 49 (estanqueidad del 3D, con 25738 vértices) están en verde. Esta sesión no ha modificado código.
