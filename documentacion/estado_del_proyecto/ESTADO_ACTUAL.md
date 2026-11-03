# Estado Actual del Proyecto — ¡El Mundo Mágico de Nailong!

> **Regla de Actualización:** Este fichero se **sobrescribe en cada sesión** para reflejar la realidad de AHORA. El historial de sesiones reside en `bitacora_de_sesiones/` y las decisiones técnicas en `DECISIONES.md`.
>
> **Última actualización:** 03/11/2026 (v3.5.1: «Mi Selección» siempre en un único pack —los estáticos entran como animados de 2 fotogramas—, desaparece el diálogo de selección mixta, identificador único y número visible libre al nombrar los packs; APK versionCode 13 de 31.8 MB. Pendiente de probar en un WhatsApp real).
> **Rama activa:** `main`.
> **Versión actual de producción:** Web `v3.5.1` | Android APK `v3.5.1` (`versionCode 13`).

---

## 1. En una Frase

La web oficial y la app Android nativa se encuentran sincronizadas en la versión **v3.5.1** (`versionCode 13`), con **95 cromos oficiales** en 4 packs equilibrados (24/24/24/23), mejoras visuales e interactivas (zoom grande centrado con animación, revisión de «Mi Selección», etiqueta «⭐ Tuyo», vistas previas de 192 px para packs personalizados y código QR de descarga en escritorio, y «Mi Selección» en un único pack con numeración libre), APK firmado de 31.8 MB y las **48 de 48 comprobaciones** superadas al 100%.

---

## 2. Cifras Clave del Proyecto (Ground Truth)

| Métrica / Concepto | Valor Verificado |
|---|---|
| **Punto único de entrada web** | `index.html` + `css/styles.css` + `js/` (10 ficheros modulares, 0 dependencias de compilación). |
| **Banco de cromos coleccionables** | Exactamente 95 stickers WebP (512×512 con chunk EXIF WhatsApp) + 1 foto optimizada del creador + 1 sticker descatalogado fuera de catálogo. |
| **Packs oficiales preconfigurados en Android** | 4 packs: *Nailong animado 1* (24), *Nailong animado 2* (24), *Nailong animado 3* (24) y *Nailong estático* (23). Total: 95 stickers. |
| **Generador dinámico «Mi Selección»** | Mínimo 3 y máximo 30 stickers por lote, con vista de revisión («Ver (N) ❯»), vistas previas animadas de 192 px y un único pack por importación (si hay animados, los estáticos van como animados de 2 fotogramas). |
| **Paquete nativo Android firmado** | `StickersNailong.apk` (31.8 MB / 31.820.990 bytes, firmado con clave *debug* oficial `SHA-256: 04b83add...abb2`, targetSdk 30, versionCode 13, versionName 3.5.1). |
| **Tráiler oficial animado (HyperFrames)** | `video-promo/nailong_trailer_v2.mp4` (1080×1920, 60 fps, 32.0s, 17.4 MB, audio y SFX sintetizados a 120 BPM). |
| **Botonera de sonidos sintetizados** | 12 casillas con 12 sonidos únicos sintetizados con Web Audio API (`duang`, `chomp`, `slurp`, `bleh`, `maracas`, `fire`, `sleep`, `laugh`, `pirate`, `run`, `tail`, `fanfare`). |
| **Laboratorio de superpoderes** | Tamaño dinámico, modo camaleón, 6 disfraces mágicos, llamitas, hinchado de tripita, lluvia de pollo crujiente y gravedad cero espacial. |
| **Suite de pruebas automatizadas (`verify_all.py`)** | **48 de 48 comprobaciones superadas con éxito (100%)**. |
| **Auditoría de stickers (`normalizar_stickers.py --check`)** | **0 problemas en los 95 stickers (100% conformes con WhatsApp)**. |

---

## 3. Qué Está Completado y Verificado

- [x] **«Mi Selección» en un único pack y numeración libre (v3.5.1, `versionCode 13`, ver D-20):**
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
- [x] **Mejoras en la Web (`v3.5.0`, sufijos `?v=` ahora en `3.5.1`):**
  - **W6:** Al pulsar «Copiar enlace» en ordenador dentro del banner de la app, además de copiar la URL al portapapeles se despliega una tarjetita *clay* (`#apk-qr-box`) con el código QR apuntando a la descarga directa de `StickersNailong.apk`.
  - **W7:** Sufijos anti-caché `?v=` actualizados en todas las referencias a `css/` y `js/`, y blindados automáticamente con el test 48 de `verify_all.py`.
- [x] **Verificación completa:**
  - `verify_all.py`: **48 de 48 pruebas superadas al 100%**.
  - `normalizar_stickers.py --check`: **95 de 95 stickers conformes**.
