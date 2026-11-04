# Estado Actual del Proyecto — ¡El Mundo Mágico de Nailong!

> **Regla de Actualización:** Este fichero se **sobrescribe en cada sesión** para reflejar la realidad de AHORA. El historial de sesiones reside en `bitacora_de_sesiones/` y las decisiones técnicas en `DECISIONES.md`.
>
> **Última actualización:** 04/11/2026 (nueva sección web **Nailong en 3D**, D-21, todavía «Sin publicar» y sin cambio de versión; antes, v3.6.0: «Mi Selección» en un único pack, pendiente de probar en un WhatsApp real).
> **Rama activa:** `main` (el trabajo 3D está en la rama `claude/bold-brown-ainuog`, pendiente de fusionar).
> **Versión actual de producción:** Web `v3.6.0` | Android APK `v3.6.0` (`versionCode 14`).

---

## 1. En una Frase

La web oficial y la app Android nativa se encuentran sincronizadas en la versión **v3.6.0** (`versionCode 14`), con **95 cromos oficiales** en 4 packs equilibrados (24/24/24/23) y APK firmado de 31.8 MB. Sobre esa versión, sin publicar todavía, la web estrena **Nailong en 3D**: modelo procedural fiel a los stickers, interactivo y exportable a `.glb`. `verify_all.py` tiene ahora **49 comprobaciones** (ver § 3 sobre lo que no se pudo ejecutar fuera del PC del usuario).

---

## 2. Cifras Clave del Proyecto (Ground Truth)

| Métrica / Concepto | Valor Verificado |
|---|---|
| **Punto único de entrada web** | `index.html` + `css/styles.css` + `js/` (14 ficheros modulares más `tailwind-config.js`, 0 dependencias de compilación). |
| **Nailong 3D (sin publicar)** | Sección `#nailong-3d`; malla procedural estanca de ≈41 k vértices (≈27 k en móvil) generada en ≈0,3–0,5 s en un Web Worker, piel de 12 huesos, 5 acciones, 2 estilos; Three.js r147 por CDN con SRI solo bajo demanda; GLB de ≈3,1 MB con 5 clips. |
| **Banco de cromos coleccionables** | Exactamente 95 stickers WebP (512×512 con chunk EXIF WhatsApp) + 1 foto optimizada del creador + 1 sticker descatalogado fuera de catálogo. |
| **Packs oficiales preconfigurados en Android** | 4 packs: *Nailong animado 1* (24), *Nailong animado 2* (24), *Nailong animado 3* (24) y *Nailong estático* (23). Total: 95 stickers. |
| **Generador dinámico «Mi Selección»** | Mínimo 3 y máximo 30 stickers por lote, con vista de revisión («Ver (N) ❯»), vistas previas animadas de 192 px y un único pack por importación (si hay animados, los estáticos van como animados de 2 fotogramas). |
| **Paquete nativo Android firmado** | `StickersNailong.apk` (31.8 MB / 31.820.990 bytes, firmado con clave *debug* oficial `SHA-256: 04b83add...abb2`, targetSdk 30, versionCode 14, versionName 3.6.0). |
| **Tráiler oficial animado (HyperFrames)** | `video-promo/nailong_trailer_v2.mp4` (1080×1920, 60 fps, 32.0s, 17.4 MB, audio y SFX sintetizados a 120 BPM). |
| **Botonera de sonidos sintetizados** | 12 casillas con 12 sonidos únicos sintetizados con Web Audio API (`duang`, `chomp`, `slurp`, `bleh`, `maracas`, `fire`, `sleep`, `laugh`, `pirate`, `run`, `tail`, `fanfare`). |
| **Laboratorio de superpoderes** | Tamaño dinámico, modo camaleón, 6 disfraces mágicos, llamitas, hinchado de tripita, lluvia de pollo crujiente y gravedad cero espacial. |
| **Suite de pruebas automatizadas (`verify_all.py`)** | **49 comprobaciones.** En la sesión del 04/11 (contenedor Linux) pasaron todas salvo las aserciones que leen el código Android de `C:\src` (tests 43, 45, 47 y 48, en parte), que no existe allí: **pendiente de pasarla completa en el PC del usuario**. |
| **Auditoría de stickers (`normalizar_stickers.py --check`)** | **0 problemas en los 95 stickers (100% conformes con WhatsApp)**. |

---

## 3. Qué Está Completado y Verificado

- [x] **Nailong en 3D (sin publicar, D-21, nota técnica `05_nailong_3d.md`):**
  - Modelo procedural (SDF + Surface Nets) medido sobre los stickers: pera alta con papada, hocico, pancita crema, ojos con iris verde y párpados, 3 placas oliva, garras, almohadillas rosas y cola cónica. Malla estanca y proporciones vigiladas por el test 49.
  - Visor con cámara orbital, mirada, respiración, parpadeo, reacciones por zona con abolladura elástica, acciones (saludar, ¡duang!, bailar, sorpresa, siesta), estilo sticker/dibujo, pantalla completa, foto PNG y descarga `.glb`; carga perezosa, pausa fuera de pantalla, calidad adaptativa y `prefers-reduced-motion`.
  - Comprobado en Chromium headless (SwiftShader) a 1280, 375 y 320 px: toques por zona, botones, contador de la pancita del inicio, estilo dibujo, foto, GLB (glTF 2.0, 1 piel, 12 articulaciones, 5 clips, reimportado con `GLTFLoader`), pantalla completa sin afectar al minijuego, pausa fuera de pantalla, sin desbordamiento horizontal y respaldos (movimiento reducido, sin WebGL y CDN caída).
  - **No comprobado:** 60 fps en una GPU de móvil real, Safari/iPhone, gestos reales de dos dedos, la carga desde jsDelivr en producción y abrir el GLB en Blender/Unity/Godot.
- [x] **«Mi Selección» en un único pack y numeración libre (v3.6.0, `versionCode 14`, ver D-20):**
  - Eliminados el diálogo de selección mixta y el flujo de «segundo pack»: «Importar a WhatsApp» abre directamente el diálogo de nombre.
  - 23 variantes animadas de 2 fotogramas de los estáticos (`generar_estaticos_animados.py`, 593 KB en total, todas conformes con los requisitos de WhatsApp según la tabla del script). Solo se usan si la selección incluye algún animado.
  - Identificador de pack único (`seleccion_<hora>`) y número visible libre («Mi Selección», «Mi Selección 2»…), que se libera al borrar.
  - **No comprobado:** importar un pack mixto en un WhatsApp real (aceptación, estáticos quietos, envío) ni ejecutar la app en emulador/móvil tras este cambio; solo compila, firma y pasa `verify_all.py`.
- [x] **Mejoras de interfaz y rendimiento en la App Android (`StickersNailong.apk` v3.5.0, `versionCode 12`):**
  - **Zoom grande centrado con transición suave:** Al mantener pulsado un sticker dentro de un pack, viaja con animación elástica (`OvershootInterpolator`) desde su celda hasta el centro de la pantalla (230×230 dp) sobre un overlay completo (`#sticker_zoom_overlay`) que bloquea toques accidentales a la cuadrícula inferior, incluye el botón «✕ Cerrar vista ampliada» y permite salir tocando en cualquier parte. Además, un banner superior fijo recuerda que mantener pulsado amplía el sticker.
  - **Revisión de «Mi Selección» («Ver (N) ❯»):** En la tarjeta «Mi Selección», los botones «🗑️ Vaciar» (en tono rojizo clay) y «Ver (N) ❯» (en crema con texto naranja) se sitúan juntos de izquierda a derecha, con «Importar a WhatsApp» debajo. «Ver (N) ❯» abre la cuadrícula de los stickers seleccionados para revisarlos, ampliarlos con zoom o desmarcarlos.
  - **A8:** Esquinas redondeadas (`RoundingParams` con `setOverlayColor("#FFFDF0")`) en el Nailong animado del aviso «¡App actualizada!».
  - **A9:** Icono «+» teñido de blanco nítido sobre el botón verde «Añadir a WhatsApp».
  - **A10:** Botón del diálogo «Personaliza tu pack» acortado a «Añadir» (14sp) para evitar recortes en pantallas estrechas.
  - **A11:** Al crear un pack animado en «Mi Selección», se copian también las vistas previas ligeras de 192 px a `selection_packs/<id>/previews/` para que abrir el pack o mostrar sus miniaturas no descodifique a 512×512 px.
  - **A12:** Los packs creados por el usuario se distinguen en la lista con fondo crema cálido (`card_clay_selection`), insignia «⭐ Tuyo» y recordatorio «🗑️ Mantén pulsado para borrar este pack».
  - **A13:** El botón «Ver stickers ❯» usa un tono amarillo cremoso intermedio (`#FDE68A`, `nailong_yellow_creamy`) con mayor contraste sobre las tarjetas blancas.
- [x] **Mejoras en la Web (`v3.5.0`, sufijos `?v=` ahora en `3.6.0`):**
  - **W6:** Al pulsar «Copiar enlace» en ordenador dentro del banner de la app, además de copiar la URL al portapapeles se despliega una tarjetita *clay* (`#apk-qr-box`) con el código QR apuntando a la descarga directa de `StickersNailong.apk`.
  - **W7:** Sufijos anti-caché `?v=` actualizados en todas las referencias a `css/` y `js/`, y blindados automáticamente con el test 48 de `verify_all.py`.
- [x] **Verificación:**
  - `verify_all.py`: 49 comprobaciones; el 04/11 se ejecutaron en Linux todas salvo las aserciones con rutas `C:\src` (código Android fuera del repo). Falta ejecutarla completa en el PC del usuario.
  - `normalizar_stickers.py --check`: **95 de 95 stickers conformes**.
