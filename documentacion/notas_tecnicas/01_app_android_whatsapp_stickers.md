# Nota Técnica 01: App Android Nativa y WhatsApp Stickers ContentProvider

> **Subsistema:** Aplicación Android (`com.eva.nailongstickers`)  
> **Ubicación del código fuente:** `C:\src\nailong_stickers_app\stickers\Android`  
> **Binario de producción:** `StickersNailong.apk` (24.6 MB)

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
