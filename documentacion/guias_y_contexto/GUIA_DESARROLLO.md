# Guía de Desarrollo y Operaciones

> **Propósito:** Instrucciones paso a paso para ejecutar, probar, modificar y desplegar la web oficial y la aplicación nativa Android.

---

## 1. Entorno de Desarrollo y Requisitos

### Requisitos Mínimos:
- **Python 3.10+**: Para ejecutar la suite de pruebas (`verify_all.py`), herramientas de optimización (`normalizar_stickers.py`) o servidor HTTP local.
- **Navegador Moderno**: Chrome, Brave, Safari (iOS/macOS) o Firefox.
- **Java JDK 17+ y Android SDK** *(solo si se recompila el APK nativo)*: Temurin JDK 17, `ANDROID_HOME` configurado.

---

## 2. Servir la Web en Local
La web es 100% buildless (HTML5 + Tailwind CDN + Vanilla JS). Para servirla localmente:

```bash
# Iniciar servidor ligero en el puerto 8000
python -m http.server 8000
```
Abrir `http://localhost:8000/` en el navegador.

---

## 3. Ejecución de la Suite de Pruebas
Antes de realizar cualquier commit o entrega, es **obligatorio** verificar que la suite automatizada pase al 100%:

```bash
python verify_all.py
```

### Qué valida la suite (45 comprobaciones):
1. Integridad del punto único de entrada (`index.html`) sin duplicados residuales.
2. Presencia de los 96 stickers en `Stickers Nailong/` (`sticker_1.webp` a `sticker_96.webp`) y de `creador_nailong.webp`.
3. Normalización estricta de stickers WebP (512×512, EXIF WhatsApp, límites de peso y duración).
4. Presencia del binario APK Android (`StickersNailong.apk` > 20 MB).
5. Sincronización de versiones visibles (v3.3.2 en web y footer).
6. Elementos interactivos del DOM, canvas de minijuego, motor de audio y banner de descarga.

---

## 4. Flujo de Trabajo con Stickers (`normalizar_stickers.py`)

Para incorporar nuevos stickers o comprobar el catálogo actual:

```bash
# Validar el formato de todos los stickers existentes
python normalizar_stickers.py --check

# Importar y normalizar un nuevo lote de imágenes desde una carpeta externa
python normalizar_stickers.py --import "ruta/a/carpeta_nuevos"
```

El script se encarga automáticamente de:
- Escalar y centrar en lienzo transparente de 512×512 píxeles sin deformación.
- Comprimir a $\le$100 KB para estáticos y $\le$500 KB para animados.
- Muxear fotogramas WebP con chunks `VP8X`, `ANIM`, `ANMF` y `ALPH`.
- Inyectar el bloque de metadatos EXIF con `sticker-pack-id`.

---

## 5. Compilación y Firma de la App Android (`StickersNailong.apk`)

El código fuente del proyecto Android reside en `C:\src\nailong_stickers_app\stickers\Android`.

```bash
cd "C:\src\nailong_stickers_app\stickers\Android"

# Compilar release con Gradle
./gradlew assembleRelease

# Alinear y firmar (build-tools 34.0.0 en %LOCALAPPDATA%\Android\Sdk\build-tools)
# OJO: las versiones publicadas están firmadas con el keystore *debug* de esta máquina
# (CN=Android Debug, SHA-256 04b83add…abb2). Hay que firmar SIEMPRE con esa misma clave;
# si cambia, Android no deja instalar la actualización encima de la versión anterior.
zipalign -f -p 4 app/build/outputs/apk/release/app-release-unsigned.apk aligned.apk
apksigner sign --ks "%USERPROFILE%\.android\debug.keystore" \
  --ks-pass pass:android --ks-key-alias androiddebugkey --key-pass pass:android \
  --out "C:\src\nailong_stickers_app\StickersNailong.apk" aligned.apk
apksigner verify --print-certs "C:\src\nailong_stickers_app\StickersNailong.apk"

# Al publicar versión: actualizar version.json (versionCode, versionName y notes en lenguaje sencillo).
# La app instalada lo consulta al abrirse y ofrece descargar el APK nuevo.

# Copiar el binario firmado a la raíz de la web
cp "C:\src\nailong_stickers_app\StickersNailong.apk" "C:\Users\Administrator\Documents\Claude Code\Misceláneo\Página Nailong\StickersNailong.apk"
```

---

## 6. Despliegue en GitHub Pages
El despliegue está automatizado con GitHub Pages desde la rama `main` y directorio raíz `/`:

```bash
# Comprobar estado silencioso
git status -s

# Añadir cambios, commitear y subir
git add .
git commit -m "feat/fix: descripción clara del cambio"
git push origin main
```
El pipeline de GitHub Pages publica la versión en producción en 1-2 minutos:
👉 [https://alvarolofra.github.io/Nailong/](https://alvarolofra.github.io/Nailong/)
