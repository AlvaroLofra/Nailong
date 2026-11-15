# Bitácora de Sesión — 2026-11-06 (Ocultación temporal y reconstrucción de fidelidad del modelo 3D)

## Qué se pidió
1. Ocultar por completo en la web la sección del modelo 3D (`#nailong-3d` y sus enlaces de navegación) sin eliminar ningún archivo, y hacer `push` a `main`.
2. Elaborar y ejecutar un plan de reconstrucción del modelo 3D procedural (`js/11` a `js/14`) para que sea fiel al Nailong oficial de *Seventh Impression* que aparece en los 95 stickers del repositorio, manteniendo la sección oculta hasta que el usuario indique volver a mostrarla.

## Qué se hizo
- **Ocultación temporal en producción (`c8e5a7e`):**
  - Se añadieron `hidden aria-hidden="true"` a `#nailong-3d` y a los enlaces `a[href="#nailong-3d"]` en `index.html`, regla defensiva `#nailong-3d[hidden], a[href="#nailong-3d"][hidden] { display: none !important; }` en `css/styles.css` y salida temprana `if (!sec || sec.hidden) return;` en `js/14-nailong3d-visor.js` para que no descargue Three.js ni cree el Web Worker mientras esté oculto.
- **Diagnóstico multi-ángulo frente a los stickers (`sticker_2`, `18`, `19`, `20`, `31`, `43`, `47`, `50`, `52`, `75`, `84`, `86`):**
  - Se renderizó una hoja de contacto de 8 vistas (`diag_current_3d.png`) que reveló las causas de la diferencia visual con el personaje original: esferas oscuras de fosas nasales que en los stickers no existen; párpados abultados de color marrón (`r + 0.0028`) que creaban bolsas alrededor del ojo; boca plana pintada a 2 mm sobre el morro; brazos nacidos en pose «T» horizontal que al bajarse deformaban los hombros y colocaban la almohadilla rosa hacia delante en la muñeca; hendidura profunda de cuello en la espalda; y cola recta de un solo cono.
- **Reconstrucción anatómica y de materiales (`js/11`, `js/12`, `js/13`):**
  - **`js/11-nailong3d-geometria.js`:** recalibración de `ANATOMIA` (cráneo abovedado, mofletes bajos llenos adelantados, hocico liso integrado, pecho cónico sin hombros cuadrados, pancita crema amplia y pies cilíndricos); unión cabeza–pecho dependiente de `z` (`tEspalda`) para lograr espalda continua sin hendidura de nuca y pliegue limpio bajo la papada; cola en 2 tramos (`cola1` + `cola2`) curvada hacia arriba con punta redondeada; cuenca ocular asimétrica en `y` que enmarca el ojo en arco «D» sobre el moflete; y rubor cálido melocotón sutil (`#FFA82E`) en las mejillas.
  - **`js/12-nailong3d-escena.js`:** eliminación de las fosas nasales añadidas; párpados al ras del globo (`r + 0.0006`) del mismo color amarillo de la piel; textura de ojo con pupila grande (`PUPILA = 0.67`), iris verde bosque (`ANG_IRIS = 0.90`) con medialuna inferior verde esmeralda luminosa (`#7ED842`) y doble brillo especular; boca 3D en «D» con cavidad burdeos, lengua volumétrica 3D con domo e iluminación y banda dental blanca superior; garritas cónicas (`geoGarra`) orientadas hacia dentro y almohadilla rosa en la cara palmar interna; 3 placas dorsales oliva redondeadas en la nuca; y sombreado subsuperficial cálido hacia miel/ámbar (`GLSL_PIEL_SUAVE_FRAG`) con iluminación de estudio equilibrada.
  - **`js/13-nailong3d-animacion.js`:** recalibración de `BRAZO_NEUTRO` para el brazo generado en pose «A» baja natural y ajuste de las poses (`saludar`, `duang`, `bailar`, `sorpresa`, `siesta`) sin pellizcar los hombros.

## Verificación
- Hoja de contacto de 8 ángulos (`diag_current_3d.png`) renderizada en Chromium headless con WebGL (frente, 3/4, perfil derecho, espalda/placas/cola, primer plano frontal y 3/4 de cara, acción «Sorpresa» y estilo «Dibujo animado»).
- `python verify_all.py`: **51 de 51 comprobaciones en verde** en el PC del usuario (incluido el test 49 de estanqueidad, orientación, altura 1, pies en `y = 0`, pesos de piel y proporciones canónicas).
- Se verificó que `#nailong-3d` y sus botones de menú permanecen ocultos en la página principal (`index.html`).

## NO comprobado / pendiente
- Rendimiento real (60 fps) en GPU de móvil físico, Safari en iPhone, gestos multitáctiles reales y apertura de `nailong_3d.glb` en Blender/Unity/Godot.
- Reintroducir `#nailong-3d` en la web pública cuando el usuario dé el visto bueno.
