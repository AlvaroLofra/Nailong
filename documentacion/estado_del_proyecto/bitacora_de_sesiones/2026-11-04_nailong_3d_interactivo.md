# Bitácora de Sesión — 2026-11-04 (Nailong 3D interactivo y exportador GLB)

## Qué se pidió
Un modelo 3D de Nailong fiel a la anatomía y estética de los stickers, integrado en la web como experiencia interactiva (girar, zoom, micro-animaciones, reacciones al tocar) y/o exportable a `.glb`, con buen rendimiento y aspecto cuidado.

## Decisiones del usuario (antes de empezar)
- Sección propia **justo después de «¿Quién es?»**.
- **Sin subir versión** (sigue v3.6.0; CHANGELOG en «Sin publicar»).
- Botón de descarga `.glb` **público**.

## Qué se hizo
- **Estudio de referencias:** se miraron los stickers 86, 43, 18 (frente), 84, 52, 31 (espalda), 20, 75 (perfil) y 47, 50, 2 (cara). Hallazgos que corrigen el intento de Blender del tráiler: iris verde (no ojos negros), 3 placas dorsales oliva (no cuernos), sin coloretes, garritas marrones en manos y pies, almohadilla rosa en la palma y cola cónica.
- **Núcleo geométrico (`js/11`)**: SDF con fusión suave + Surface Nets en banda estrecha + pesos de piel; esferas envolventes para no evaluar partes lejanas (de ~0,9 s a ~0,35 s). Se corrigieron aristas no estancas en el borde de las cuencas de los ojos subiendo su radio de fusión.
- **Escena (`js/12`)**, **animación (`js/13`)** y **visor (`js/14`)** según la nota técnica `05_nailong_3d.md`.
- **Bucle de fidelidad:** 5 rondas de hojas de contacto (frente, ¾, perfil, espalda junto a los stickers): color más ámbar y sin *tone mapping* ACES (desaturaba el amarillo), cabeza algo más estrecha y abovedada, ojos más grandes con párpados, brazos más gruesos, placas más grandes, torso más esbelto. La pose «Sorpresa» lleva las patitas a los mofletes como el sticker 19 (ángulos calculados con cuaterniones).
- **Integración:** sección `#nailong-3d`, enlaces de menú (escritorio desde 1280 px), *scrollspy*, estilos `.n3d-*`. Arreglo en `js/08-minijuego.js`: su `fullscreenchange` cambiaba su botón a «Salir Completa» con cualquier pantalla completa (también la del 3D o la del tráiler).
- **Test 49** en `verify_all.py` y documentación (D-21, nota técnica 05, mapa de código, índices, AGENTS, CHANGELOG, README, mejoras pendientes, estado actual).

## Verificación
- Núcleo en Node: malla estanca (0 aristas sin pareja, 0 triángulos invertidos), altura 1 con pies en y = 0, pesos que suman 1.
- Chromium headless con SwiftShader (Three.js servido desde el paquete npm, porque la CDN está bloqueada en el contenedor) a 1280, 375 y 320 px: sin errores de JavaScript; toques por zona, botones, contador del inicio, estilo dibujo, foto, GLB (glTF 2.0, 1 piel de 12 articulaciones, 5 clips; reimportado con `GLTFLoader`), pantalla completa sin afectar al minijuego, pausa fuera de pantalla, sin desbordamiento horizontal y los tres respaldos (movimiento reducido, sin WebGL, CDN caída).
- `verify_all.py`: ejecutado con un envoltorio que omite solo las aserciones con rutas `C:\src` (código Android, que no existe en el contenedor); todo lo demás en verde.

## NO comprobado / pendiente
- Ejecutar `python verify_all.py` completo en el PC del usuario.
- Rendimiento real (60 fps) en una GPU de móvil: SwiftShader es CPU y no sirve como medida.
- Safari en iPhone, gestos reales de dos dedos y la carga desde jsDelivr en producción (el SRI se calculó sobre los mismos ficheros del paquete npm).
- Abrir `nailong_3d.glb` en Blender, Unity o Godot.
- Ideas sin aplicar en `MEJORAS_PENDIENTES.md` (W9, W10 y 3D1–3D4).
