# 2026-10-31 · v3.2.1: Corrección de WhatsApp en Mi Selección, Reorganización Web y Documentación Modular

| Campo | Valor |
|---|---|
| **Fecha** | 2026-10-31 |
| **Quién trabajó** | Desarrollador con Claude & Antigravity (sesión local en Windows) |
| **Rama** | `main` |
| **Versión final** | `v3.2.1` (APK `versionCode 4`, `versionName "3.2.1"` / Web `v3.2.1`) |
| **Estado de tests** | 44 de 44 tests superados al 100% en `verify_all.py` |

---

## 1. Objetivo de la Sesión
1. **Solucionar el bloqueo de exportación a WhatsApp:** Al pulsar «Añadir a WhatsApp» tras personalizar un lote en «Mi Selección», no ocurría ninguna acción y el menú nativo de WhatsApp no se abría, mientras que los packs prehechos funcionaban con normalidad.
2. **Reorganización de la web oficial:** Trasladar la sección del creador con Nailong (`#creador`) debajo del minijuego arcade (`#minijuego`), justo antes del pie de página, ajustando los enlaces de navegación en desktop y móvil.
3. **Estilo directo en notas de parche de `README.md`:** Reestructurar las notas de versión para que sean cortas, directas, claras y orientadas al usuario final, eliminando justificaciones internas, código y explicaciones defensivas.
4. **Modularización de la documentación técnica:** Reorganizar la carpeta `documentacion/` según el modelo modular de ingeniería UEM (`00_INDICE.md`, `estado_del_proyecto/`, `guias_y_contexto/`, `notas_tecnicas/`).
5. **Generalización a la biblioteca central:** Extraer las directrices de documentación modular y dicotomía vitrina pública vs. base técnica hacia `GUIA_MAESTRA_DESARROLLO_Y_PROYECTOS.md`.

---

## 2. Punto de partida
- La aplicación Android estaba en `v3.1.0` y la web en `v3.2.0`.
- El diálogo de importación personalizado (`dialog_import_selection.xml`) se mostraba en pantalla, pero pulsar sobre el texto o icono del botón no disparaba el Intent `com.whatsapp.intent.action.ENABLE_STICKER_PACK`.
- La sección `#creador` estaba ubicada en la cabecera del álbum de cromos en `index.html`.
- `README.md` contenía notas de parche detalladas con código técnico interno y reflexiones de depuración en los ciclos 3.x.

---

## 3. Qué se hizo

### 3.1. Corrección Android: Consumo de eventos táctiles y ContentProvider (D-13)
1. **Intercepción de eventos táctiles:**
   - En `dialog_import_selection.xml` y `dialog_success_whatsapp.xml`, los `TextView` internos de los botones (`@style/StickerPreviewButtonText`) heredaban `clickable="true"` de Material Components. Al tocar el texto, éste consumía el evento sin tener asignado un listener.
   - Se configuró explícitamente `android:clickable="false"`, `android:focusable="false"` y `android:duplicateParentState="true"`.
   - En `StickerPackListActivity.java`, se asignó redundancia de click registrando listeners tanto en el contenedor `FrameLayout` como en el `TextView` interno.
2. **Descriptores de archivo en `StickerContentProvider`:**
   - Se sobrescribió `openFile(Uri, String)` retornando directamente el `ParcelFileDescriptor` en modo solo lectura (`MODE_READ_ONLY`) para prevenir la creación de tuberías (*pipes*) fallidas si WhatsApp invoca `openFile`.
   - Se ajustó `openAssetFile` para utilizar `AssetFileDescriptor.UNKNOWN_LENGTH`.
3. **Visibilidad de metadatos dinámicos:**
   - Se modificó `getPackForAllStickerPacks` para que, cuando el llamante sea WhatsApp (`com.whatsapp` o `com.whatsapp.w4b`), se incluyan los packs dinámicos en la lista global de metadatos, manteniendo la home de la app filtrada exclusivamente a los 3 packs prehechos.
4. **Recompilación y firma:**
   - Incremento a `versionCode 4` / `versionName "3.2.1"`. Recompilado con Gradle 8.7 y firmado con apksigner (esquemas v1 y v2), generando `StickersNailong.apk` (24.6 MB).

### 3.2. Reorganización en la Web Oficial (`index.html`)
- Se extrajo el bloque `<section id="creador">` y se reubicó directamente debajo de `<section id="minijuego">`, justo antes del cierre de `</main>`.
- Se reordenó la barra de navegación de escritorio (`#desktop-nav-links`) y el menú móvil desplegable (`#mobile-menu`), ubicando el enlace «Creador» al final de la secuencia temática.
- Se actualizó el banner de descarga a `v3.2.1 APK` y el pie de página a `v3.2.1`.

### 3.3. Reescritura del `README.md` (Vitrina Pública)
- Se reescribieron las notas de los ciclos v3.0.0, v3.0.1, v3.1.0, v3.2.0 y v3.2.1 en viñetas directas, cortas y sin tecnicismos internos.
- Se añadió la característica «Encuentro con el Creador» al listado principal de funcionalidades.

### 3.4. Estandarización de `documentacion/`
- Creación de `documentacion/00_INDICE.md` como mapa maestro de lectura y catálogo de inventario con regla de edición.
- Creación de `documentacion/estado_del_proyecto/ESTADO_ACTUAL.md` (resumen en una frase, cifras ground truth, tareas terminadas y pendientes).
- Creación de `documentacion/estado_del_proyecto/DECISIONES.md` (registro ADR estructurado D-01 a D-13).
- Creación de guías de contexto y notas técnicas especializadas.

---

## 4. Por qué se hizo así
- **Doble registro de listener (FrameLayout + TextView):** Garantiza que cualquier punto de la superficie táctil del botón, independientemente de la densidad de píxeles o del comportamiento de subclases de Material Components, capture el toque y ejecute el callback.
- **Detección de paquete solicitante en ContentProvider:** WhatsApp necesita validar la existencia del pack contra la autoridad `metadata`, pero la app debe mostrar una interfaz despejada con solo los 3 packs de fábrica. Filtrar por `callingPackage` resuelve limpiamente ambas necesidades.
- **Sección `#creador` al pie:** El contenido central del proyecto es Nailong y sus stickers. Mover la sección del creador al pie preserva el valor del homenaje sin restar protagonismo a la galería ni al minijuego.

---

## 5. Ficheros Creados, Modificados o Movidos

| Fichero | Acción | Descripción del Cambio |
|---|---|---|
| `index.html` | Modificado | Reubicación de `#creador` bajo `#minijuego`, orden de navbar/menú y versiones v3.2.1. |
| `README.md` | Modificado | Rediseño de notas de parche a estilo directo y sin tecnicismos internos. |
| `StickersNailong.apk` | Modificado | APK recompilado con arreglos táctiles y ContentProvider (24.6 MB). |
| `documentacion/00_INDICE.md` | Creado | Índice general y tabla de inventario con regla de mantenimiento. |
| `documentacion/estado_del_proyecto/ESTADO_ACTUAL.md` | Creado | Instantánea del estado actual del proyecto (ground truth). |
| `documentacion/estado_del_proyecto/DECISIONES.md` | Creado | Registro histórico de decisiones ADR D-01 a D-13. |
| `documentacion/estado_del_proyecto/bitacora_de_sesiones/2026-10-31_v3-2-1-fix-whatsapp-y-reorganizacion.md` | Creado | Esta bitácora de sesión. |
| `documentacion/guias_y_contexto/*` | Creado | Guías de contexto de producto y metodología de desarrollo. |
| `documentacion/notas_tecnicas/*` | Creado | Notas técnicas de subsistemas (Android, WebP, Audio, GPU). |
| `GEMINI.md` / `CLAUDE.md` | Modificado | Incorporación de la regla de estilo de notas de parche y estructura documental. |

---

## 6. Resultado de Pruebas y Verificación
- Ejecución de `python verify_all.py`:
  - 44 de 44 comprobaciones superadas con éxito (100%).
  - Estructura HTML íntegra, elementos de minijuego, audio, álbum, banner y presencia de APK validados.
