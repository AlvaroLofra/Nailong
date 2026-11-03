# Nota Técnica 01: App Android Nativa y WhatsApp Stickers ContentProvider

> **Subsistema:** Aplicación Android (`com.eva.nailongstickers`)  
> **Ubicación del código fuente:** fuera de este repo; la ruta de esta máquina está en `CLAUDE.local.md` (subcarpeta `stickers\Android`)  
> **Binario de producción:** `StickersNailong.apk` (versión, peso y nº de stickers vigentes: ver `ESTADO_ACTUAL.md`; 4 packs oficiales)

---

## 1. Arquitectura de Integración con WhatsApp
WhatsApp en Android requiere que las aplicaciones que proporcionan stickers implementen un `ContentProvider` registrado con el permiso de lectura de WhatsApp:

```xml
<provider
    android:name="com.eva.nailongstickers.StickerContentProvider"
    android:authorities="com.eva.nailongstickers.stickercontentprovider"
    android:enabled="true"
    android:exported="true"
    android:readPermission="com.whatsapp.sticker.READ" />
```

### Flujo de Importación:
1. La aplicación emite un Intent explícito a WhatsApp:
   ```java
   Intent intent = new Intent();
   intent.setAction("com.whatsapp.intent.action.ENABLE_STICKER_PACK");
   intent.putExtra(EXTRA_STICKER_PACK_ID, identifier);
   intent.putExtra(EXTRA_STICKER_PACK_AUTHORITY, AUTHORITY);
   intent.putExtra(EXTRA_STICKER_PACK_NAME, packName);
   context.startActivityForResult(intent, ADD_PACK_REQUEST_CODE);
   ```
2. WhatsApp se comunica en segundo plano con el `ContentProvider` de la app a través de la URI de autoridad para obtener los metadatos del paquete (`metadata/<id>`) y verificar el hash SHA-256 de los assets.
3. WhatsApp solicita individualmente cada archivo WebP mediante `stickers_asset/<id>/<file.webp>` usando `openAssetFile` u `openFile`.
4. El sistema presenta el diálogo del sistema «¿Deseas añadir este paquete a WhatsApp?».

---

## 2. Subsistema «Mi Selección» (`DynamicPackManager.java`)

### Reto Técnico:
WhatsApp no permite mezclar stickers animados y estáticos en un mismo paquete. Además, exige un mínimo de 3 y un máximo de 30 stickers por paquete, y requiere que cada nuevo paquete tenga un `identifier` incremental no repetido (`seleccion_1`, `seleccion_2`...).

### Solución Implementada:
- **Estructura en Almacenamiento Interno:**
  Los packs de selección se generan en el directorio privado de la aplicación:
  `context.getFilesDir()/selection_packs/<identifier>/`
- **Generación de Metadatos al Vuelo:**
  Se crea un `metadata.json` con los stickers seleccionados, calculando tamaños de archivo y generando la bandeja correspondiente (`tray.png`).
- **Bifurcación Mixta:**
  Si el usuario selecciona stickers animados y estáticos combinados, la app detecta la colisión y ofrece dividirlos en dos packs independientes que se envían consecutivamente a WhatsApp mediante callbacks encadenados en `onActivityResult`.

---

## 3. Descriptores de Archivo en `StickerContentProvider.java`

Para soportar tanto los assets precompilados en la carpeta `assets/` del APK como los archivos dinámicos generados en `filesDir`:

```java
@Override
public AssetFileDescriptor openAssetFile(@NonNull Uri uri, @NonNull String mode) throws FileNotFoundException {
    final int match = MATCHER.match(uri);
    if (match == STICKERS_ASSET) {
        List<String> pathSegments = uri.getPathSegments();
        String packId = pathSegments.get(pathSegments.size() - 2);
        String fileName = pathSegments.get(pathSegments.size() - 1);
        
        // Si pertenece a un pack dinámico en filesDir:
        File dynamicFile = DynamicPackManager.getPackAssetFile(getContext(), packId, fileName);
        if (dynamicFile != null && dynamicFile.exists()) {
            ParcelFileDescriptor pfd = ParcelFileDescriptor.open(dynamicFile, ParcelFileDescriptor.MODE_READ_ONLY);
            return new AssetFileDescriptor(pfd, 0, AssetFileDescriptor.UNKNOWN_LENGTH);
        }
        // Si pertenece a los assets de fábrica:
        return getImageAsset(uri);
    }
    return super.openAssetFile(uri, mode);
}

@Override
public ParcelFileDescriptor openFile(@NonNull Uri uri, @NonNull String mode) throws FileNotFoundException {
    // Retorno directo para clientes que consultan openFile directamente sin intermediación de tuberías
    AssetFileDescriptor afd = openAssetFile(uri, mode);
    if (afd != null) {
        return afd.getParcelFileDescriptor();
    }
    return super.openFile(uri, mode);
}
```

---

## 4. Control de Eventos Táctiles en Diálogos (Lección Aprendida D-13)

### Causa Raíz del Bloqueo en v3.1.0:
En `dialog_import_selection.xml`, el botón de confirmación utilizaba un `FrameLayout` contenedor con un `TextView` interior estilizado con `@style/StickerPreviewButtonText`.
Dicho estilo heredaba de `Widget.MaterialComponents.Button.TextButton`, que declara por defecto:
- `android:clickable="true"`
- `android:focusable="true"`

Al pulsar sobre el texto del botón, el `TextView` consumía el evento `MotionEvent` en `dispatchTouchEvent`, pero como carecía de listener propio, el evento moría sin propagarse al contenedor `FrameLayout`.

### Solución Definitiva:
1. Desactivación explícita de interactividad en el `TextView` interno:
   ```xml
   android:clickable="false"
   android:focusable="false"
   android:duplicateParentState="true"
   ```
2. Redundancia de registro de eventos en el código Java:
   ```java
   View.OnClickListener confirmListener = v -> {
       dialog.dismiss();
       processPackExport(finalPackName);
   };
   btnConfirm.setOnClickListener(confirmListener);
   if (tvConfirmText != null) {
       tvConfirmText.setOnClickListener(confirmListener);
   }
   ```


## Reparto en packs oficiales y animación (v3.3.1)
- **Reparto:** los estáticos van todos juntos en `nailong_estaticos` (23). Los 73 animados se dividen en orden de número en `nailong_animados_1` (25), `_2` (24) y `_3` (24). Se define en `PACKS` de `C:\src
ailong_stickers_app\generar_assets.py`, que exige cubrir los IDs 1..96 sin duplicados.
- **Animación en el detalle de un pack:** `StickerPreviewAdapter` crea un `DraweeController` de Fresco con `setAutoPlayAnimations(true)` (antes `setImageURI`, que muestra solo el primer fotograma).
- **Lista de packs:** `activity_sticker_pack_list.xml` y `sticker_packs_list_item.xml` tienen márgenes reducidos y los botones de «Mi Selección» se ocultan con 0 elementos, para que los 4 packs entren a la vez en pantalla (el cuarto quedaba cortado bajo el pliegue).
- **Caché de WhatsApp:** si se reordena el contenido de un pack, hay que subir `IMAGE_DATA_VERSION` en `generar_assets.py` (hoy `'2'`).
- **Comprobado en el emulador `Medium_Phone_API_37.0` (1080×2400):** los 4 packs visibles; el detalle del pack 1 muestra 25 stickers y las capturas separadas 0,7 s difieren (se mueven). **No comprobado:** la importación real a WhatsApp y el POCO X7 Pro.

## Rendimiento de los packs animados y aviso de actualización (v3.3.2)
- **Por qué iba lento:** cada sticker animado se decodificaba a 512×512 aunque la celda es mucho más pequeña, y `notifyDataSetChanged()` en `onResume` creaba controladores nuevos, así que todas las animaciones se reiniciaban a la vez.
- **Fresco (`StickerApplication`):** `ImagePipelineConfig` con `setDownsampleEnabled(true)` y `experiment().setShouldDownscaleFrameToDrawableDimensions(true)`.
- **`StickerPreviewAdapter`:** `ImageRequestBuilder` + `ResizeOptions(cellSize, cellSize)`. El controlador solo se cambia si cambia la URI (se guarda en el tag `R.id.sticker_preview`). `PAYLOAD_SELECTION` refresca solo el check. `setAnimationsRunning(bool)` pausa o reanuda los `Animatable` visibles.
- **`StickerPackDetailsActivity`:** `onResume` → `refreshSelectionChecks()` + reanudar. `onPause` → pausar (el botón atrás ya no compite con unos 25 decodificadores).
- **`StickerPackListAdapter`:** las miniaturas usan `ResizeOptions` con el tamaño del `ImageView`.
- **Aviso tras actualizar (`StickerPackListActivity.maybeShowUpdateTip`):** guarda `last_version_code` en `nailong_app_prefs`. Si no existe (versiones ≤ 3.3.1), considera actualización cuando `firstInstallTime != lastUpdateTime`. Layout `dialog_update_tip.xml`, textos `update_tip_*` en `strings.xml`.
- **Comprobado en el emulador:** actualizando de 3.3.1 a 3.3.2 sale el aviso, y al reabrir no se repite. El pack 1 se abre con los 25 stickers. **No comprobado:** la fluidez en un móvil real (el emulador usa GPU por software y no sirve para medirla; además, el equipo sufrió un pantallazo azul de la gráfica integrada durante la prueba), y el botón «Actualizar» dentro de WhatsApp.

## Aviso de versión nueva (`UpdateChecker`, v3.3.2)
- **Fuente:** `version.json` en la raíz de la web (GitHub Pages) con `versionCode`, `versionName`, `apkUrl` y `notes`. Se eligió la web y no la API de GitHub Releases porque el APK ya se publica ahí, no hay límite de peticiones y no hace falta crear releases.
- **App:** `StickerPackListActivity.onCreate` llama a `UpdateChecker.check(this)` (AsyncTask, timeout de 5 s, `?t=` anti-caché). Solo se acepta un `apkUrl` HTTPS de `alvarolofra.github.io`. Si `versionCode` > `BuildConfig.VERSION_CODE`, sale `dialog_update_available.xml` con «Más tarde» y «Descargar» (`ACTION_VIEW` al APK: lo descarga el navegador y Android ofrece instalar encima). Sin red o con un error, no aparece nada.
- **Por qué el navegador y no la instalación desde la propia app:** instalar desde la app exige el permiso `REQUEST_INSTALL_PACKAGES`, un `FileProvider` y gestionar la descarga. El navegador lo resuelve sin permisos extra y el usuario ve el proceso habitual de Android.
- **Al publicar versión:** subir `versionCode`/`versionName` en `build.gradle` y en `version.json` y escribir las `notes` en lenguaje sencillo. `verify_all.py` (test 45) comprueba que coinciden con el pie de la web y con `build.gradle`.

## Revisión a fondo (v3.3.2)
- **Arranque:** `StickerPackLoader.fetchStickerPacks` valida con `StickerPackValidator` solo si `BuildConfig.DEBUG`; `EntryActivity` ya no repite la validación. Los tamaños se leen con `openAssetFileDescriptor().getLength()` (`fetchStickerAssetSize`), con lectura completa solo como respaldo.
- **Lista:** `onResume` no llama a `notifyDataSetChanged()`; `WhiteListCheckAsyncTask.onPostExecute` ya refresca. `recalculateColumnCount` evita dividir entre cero con una sola miniatura por fila.
- **Mi Selección:** `createPacksInBackground` (un `ExecutorService` de un hilo) crea y valida los packs fuera del hilo principal; si falla, `DynamicPackManager.deleteDynamicPack` borra lo creado. La selección se guarda en `nailong_dynamic_packs` → `current_selection` (JSON) en cada cambio y se recupera en `DynamicPackManager.init` desde `StickerApplication`. `pendingSecondPack*` e `isImportingSelection` van en `onSaveInstanceState`.
- **Seguridad:** `getDynamicPackFile`/`getDynamicPackByIdentifier` comprueban con `getCanonicalPath` que la ruta queda dentro de `files/selection_packs/`.
- **Versión visible:** `app_version_label` en `activity_sticker_pack_list.xml`, rellenado con `BuildConfig.VERSION_NAME`.
- **Vistas previas (`assets/previews/<pack>/<fichero>`):** `generar_assets.py → generate_previews()` (192 px, WebP animado calidad 50) se ejecuta al final de `main()`, y también se puede lanzar sola: `python -c "import generar_assets as g; g.generate_previews()"`. `StickerPreviewAdapter.getGridUri` usa `asset:///previews/...` si existe y, si no, el original. `StickerPackListAdapter` hace lo mismo con las miniaturas de los packs animados. Medido en el emulador (RTX 3050 Ti) dentro del pack 1, en reposo: ver la bitácora.

## Mejoras de interfaz (v3.3.3)
- **Botones:** el tema es `Theme.MaterialComponents.Light`, que tiñe el fondo de todo `Button` con `colorPrimary` (amarillo). Cualquier `Button` con `android:background` propio necesita `app:backgroundTint="@null"`, o se verá amarillo.
- **Lista de packs:** va en un `NestedScrollView` (con `ScrollView` el `RecyclerView` no volvía a medirse al añadir packs). Los packs de «Mi Selección» los añade `StickerPackListActivity.addSelectionPacksToList()` desde `DynamicPackManager.getDynamicPacks()`, ordenados por número; el ContentProvider solo se los enseña a WhatsApp. `refreshPackList()` notifica y vuelve a pedir el layout.
- **Borrar:** pulsación larga en un pack `seleccion_N` (`DynamicPackManager.isSelectionPack`) → `dialog_delete_pack.xml` → `deleteDynamicPack`.
- **Cancelar en WhatsApp:** `AddStickerPackActivity` guarda el último id/nombre enviado (también en `onSaveInstanceState`) y `StickerPackNotAddedMessageFragment` ofrece «Reintentar». `StickerPackListActivity.onActivityResult` solo da el import por bueno con `RESULT_OK`.
- **UpdateChecker:** `UpdateInfo` añade `sizeMB`/`date` (`sizeText()`, `dateText()`). `Listener` tiene `onNoUpdate()` y `onCheckFailed()` por defecto; solo los usa la búsqueda manual (tocar `app_version_label`).
- **Pistas únicas:** `nailong_app_prefs` → `last_version_code` (aviso tras actualizar) y `long_press_hint_shown` (pista de ampliar, en `StickerPackDetailsActivity`).

## Zoom central animado, revisión de «Mi Selección» y mejoras A8–A13 (v3.5.0)
- **Zoom central con transición (`StickerPackDetailsActivity`, `StickerPreviewAdapter`):**
  - Al mantener pulsado un sticker, `zoomSticker(Sticker, View anchorView, String sourcePackId)` muestra `#sticker_zoom_overlay` (`clickable="true"`, `focusable="true"`, fondo `#B31C1917`), bloqueando cualquier toque accidental sobre el `RecyclerView`.
  - La tarjeta `#sticker_zoom_card` (`230dp × 230dp` para `#sticker_details_expanded_sticker`, con `RoundingParams.fromCornersRadius(18dp).setOverlayColor(#FFFDF0)`) calcula el desplazamiento entre el centro de `anchorView` y el centro del contenedor y anima `translationX`, `translationY`, `scaleX` y `scaleY` con `OvershootInterpolator(1.05f)` (240 ms al abrir, 160 ms al cerrar).
  - Se cierra tocando cualquier zona fuera de la tarjeta, pulsando `#btn_close_zoom` («✕ Cerrar vista ampliada») o con el botón Atrás (`onBackPressed()`).
  - En la parte superior del detalle aparece siempre el banner `#zoom_top_banner_hint_view` («🔍 Mantén pulsado un sticker para hacer zoom · Toca para elegir»).
- **Revisión en vivo de «Mi Selección» (`EXTRA_IS_CURRENT_SELECTION`):**
  - En `activity_sticker_pack_list.xml`, la botonera de «Mi Selección» agrupa en una fila superior «🗑️ Vaciar» (`btn_clay_danger.xml`, rojo suave) y «Ver (N) ❯» (`btn_clay_cream.xml`, crema con borde naranja), dejando «Importar a WhatsApp» debajo a ancho completo.
  - Al pulsar «Ver (N) ❯», `StickerPackListActivity.openCurrentSelectionReview()` construye un `StickerPack` temporal en memoria con las referencias `packId/fileName` actuales y abre `StickerPackDetailsActivity` con `EXTRA_IS_CURRENT_SELECTION = true`. El usuario puede hacer zoom o tocar stickers para desmarcarlos en vivo; si vacía todos, la pantalla se cierra automáticamente.
- **Mejoras A8–A13:**
  - **A8:** `update_tip_image` usa `RoundingParams.fromCornersRadius(20dp).setOverlayColor(#FFFDF0).setBorder(#F59E0B, 2dp)` para redondear todos los fotogramas del WebP animado en Fresco.
  - **A9:** El icono `+` del botón «Añadir» en cada fila se tiñe de blanco (`Color.WHITE`).
  - **A10:** El botón de confirmación en `dialog_import_selection.xml` usa el texto corto «Añadir» (`14sp`).
  - **A11:** `DynamicPackManager.createSinglePack` copia la miniatura animada de 192 px desde `assets/previews/<sourcePack>/<sourceFile>` a `files/selection_packs/<id>/previews/<targetFile>`, y `StickerPreviewAdapter` / `StickerPackListAdapter` la usan mediante `DynamicPackManager.getSelectionPreviewFile(...)`.
  - **A12:** Las tarjetas de packs creados por el usuario muestran fondo crema (`card_clay_selection.xml`), la insignia «⭐ Tuyo» (`#sticker_pack_yours_badge`) y el aviso «🗑️ Mantén pulsado para borrar este pack» (`#sticker_pack_delete_hint`).
  - **A13:** `btn_clay_secondary.xml` usa `@color/nailong_yellow_creamy` (`#FDE68A`) para destacar sobre el fondo blanco de las tarjetas de packs.

## «Mi Selección» en un único pack y numeración libre (v3.6.0)
- **Un solo pack siempre:** `StickerPackListActivity.importSelection()` toma toda la selección. Si hay algún animado el pack es animado; si todo es estático, estático. Desaparecen el diálogo de selección mixta, `importBothSubpacks` y el flujo de «segundo pack» (strings `mixed_selection_*` e `import_*_option` retiradas).
- **Estáticos dentro de un pack animado:** `DynamicPackManager.createSelectionPack` sustituye `nailong_estaticos/<f>` por `nailong_estaticos_animados/<f>` (WebP de 2 fotogramas idénticos de 500 ms, 512×512, EXIF de WhatsApp, 11–64 KB, 0,58 MB en total). Se generan con `generar_estaticos_animados.py` (en este repo; lee la ruta de la app desde `CLAUDE.local.md` y admite `--check`). Esa carpeta no está en `contents.json`: no es un pack oficial. No tienen vista previa de 192 px; se descodifican a 512 px, que con 2 fotogramas es ligero.
- **Validación:** `StickerPackValidator` rechaza en un pack animado cualquier sticker de un solo fotograma, así que todo pack mixto se valida al crearlo. La aceptación en un WhatsApp real **no está comprobada**.
- **Identificador y número:** el identificador es `seleccion_<hora en segundos>` (nunca se reutiliza, para que WhatsApp no confunda un pack nuevo con uno ya añadido y borrado solo en la app). El número del nombre sale de `nextFreeSelectionNumber`: el menor libre (desde 1) entre los packs existentes, guardado como `selection_number` en `metadata.json`; en los packs antiguos (`seleccion_1`, `_2`…) se deduce del identificador. Nombre por defecto: «Mi Selección», «Mi Selección 2»… (`suggestDefaultName`). El orden de la lista es por creación (`selectionOrder`).

