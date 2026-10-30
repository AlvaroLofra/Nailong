# Plan: app Android personal para añadir los stickers animados de Nailong a WhatsApp

> **Para:** Gemini 4 Argon (modo boost). **Usuario:** Álvaro (Donde ponga Eva realmente es Álvaro, es solo un detalle). **Redactado:** 2026-10-30 por Claude, con datos medidos y comprobados en esa fecha.
> **Este archivo NO es parte de la web:** no subirlo a git ni al repo `AlvaroLofra/Nailong`. Borrarlo al terminar (fase 8).

---

## 0. Reglas de trabajo para el agente (obligatorias)

1. **Cero invención.** Toda afirmación sobre el estado ("compila", "instalado", "WhatsApp lo acepta") debe ir respaldada por la salida real de un comando o por lo que Eva diga que ve en su móvil. Si no lo has comprobado, escribe «no comprobado». No inventes versiones, rutas, nombres de clases, menús de HyperOS ni comportamientos de WhatsApp.
2. **Fuente de verdad:** el código y el README del repositorio oficial `https://github.com/WhatsApp/stickers` (carpeta `Android/`) y este plan. El archivo `DeepResearch Stickers Animados Web En WhatsApp.md` de esta carpeta **no es fiable** (contiene afirmaciones inventadas): no lo uses como fuente.
3. **Carpeta de la web = solo lectura.** `C:\Users\Administrator\Documents\Claude Code\Misceláneo\Página Nailong\` no se modifica (excepto borrar este plan al final y, con permiso de Eva, una línea de documentación en la fase 8). Todo el trabajo va en `C:\src\nailong_stickers_app\`.
4. **Nada de servicios externos:** no publicar la app, no subirla a GitHub, no usar bots, servidores ni apps de stickers de terceros.
5. **Descargas permitidas:** Android SDK oficial (developer.android.com / dl.google.com), JDK Temurin 17 o 21 (adoptium.net) si hace falta, el repo `github.com/WhatsApp/stickers` y las dependencias que Gradle baje de google()/mavenCentral(). Cualquier otra descarga: preguntar a Eva.
6. **Acciones que hace Álvaro, no el agente:** aceptar licencias del SDK, activar opciones de desarrollador del móvil, instalar el APK, confirmar en WhatsApp.
7. **Puntos de guardado:** al terminar cada fase, actualizar `C:\src\nailong_stickers_app\ESTADO_APP.md` con: fase completada, comandos clave ejecutados y su resultado, siguiente paso, problemas abiertos. Si se agota el uso, la siguiente sesión empieza leyendo ese archivo.
8. **Comandos silenciosos:** usar flags breves (`gradlew.bat assembleDebug -q`, `--console=plain`) y filtrar logs (`findstr`), para no inundar el contexto.
9. **Shell:** Windows 10 Pro, PowerShell 5.1 y Git Bash. Comillas en rutas con espacios.

---

## 1. Objetivo y límites

**Objetivo:** app Android mínima, solo para el móvil de Eva, que añada a WhatsApp los **60 stickers animados** de la web como **2 packs de 30**, conservando la animación.

**Lo que se puede (comprobado en el README y el código oficial):**
- Una app añade **packs completos** mediante el intent `com.whatsapp.intent.action.ENABLE_STICKER_PACK`; WhatsApp muestra un diálogo y Eva confirma.
- 3–30 stickers por pack, todos animados o todos estáticos, máximo 10 packs por app, un botón «Añadir» por pack.

**Lo que NO se puede desde una app (no hay API):**
- **Añadir a Favoritos:** se hace a mano en WhatsApp (pulsar sticker → «Añadir a favoritos»). **Eva acepta hacerlo manualmente uno a uno.**
- **Meterlos en el pack existente «Muñeco amarillo»:** es de otra app o del creador de WhatsApp; ninguna app puede escribir en packs ajenos. Los packs nuevos se llamarán «Muñeco amarillo animado 1» y «Muñeco amarillo animado 2». Prueba opcional en la fase 7 (no prometer el resultado).

---

## 2. Datos de partida (medidos el 2026-10-30)

### 2.1 Stickers
- Origen (solo lectura): `C:\Users\Administrator\Documents\Claude Code\Misceláneo\Página Nailong\Stickers Nailong\sticker_N.webp`, N = 1…82.
- **60 animados (orden de los packs):**
  - **Pack 1 (30):** 2, 5, 6, 7, 9, 10, 11, 12, 14, 15, 19, 20, 21, 23, 24, 25, 26, 27, 30, 31, 32, 33, 35, 40, 41, 43, 44, 45, 46, 47
  - **Pack 2 (30):** 49, 50, 51, 52, 53, 54, 55, 56, 57, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 70, 71, 73, 74, 75, 77, 78, 79, 80, 81, 82
- Todos 512×512 WebP animado con chunks `ANIM`/`ANMF`. Duración total máxima 5000 ms; ningún fotograma de los animados baja de 8 ms; los 5 y 15 tienen solo 2 fotogramas (válidos).
- **Peso:** el límite del validador oficial es `bytes > 500 × 1024 = 512000` ⇒ error. Los más pesados: 2 (499 KB), 12 (479), 61 (476), 6 (474), 59 (468), 55 (456), 32 (453), 65 (452). Todos pasan, pero el 2 va justo: el script de la fase 4 debe comprobar bytes exactos.
- Los archivos llevan un chunk EXIF de WhatsApp (heredado del pack de Sticker.ly). **Copiarlos tal cual, sin re-codificar ni quitar el EXIF.**
- 22 estáticos fuera de alcance. Ojo si algún día se hace un pack estático: los 36, 37 y 39 son WebP de 1 fotograma dentro de contenedor animado con duración 0 ms.
- Títulos y categorías: array `ALL_STICKERS` en `index.html` de la web, una línea por sticker con el formato
  `{ id: 2, file: 'sticker_2.webp', frames: 36, title: 'Sonrisa Radiante 3D', cat: 'bailes', sound: 'laugh', desc: '...' },`
  Categorías: `caritas`, `bailes`, `comida`, `amigos`.

### 2.2 Móvil de Eva
- **POCO X7 Pro**, **Android 16**, **HyperOS 3.0.301.0**, WhatsApp normal (no Business; confirmar con Eva si dudas).

### 2.3 PC
- Windows 10 Pro. Flutter en `C:\src\flutter`. JDK **25** (Temurin) en el PATH ⇒ **demasiado nuevo** para este proyecto (ver 2.4).
- Eva está instalando las herramientas de Android (probablemente Android Studio). **Comprobar, no reinstalar.**

### 2.4 Proyecto de ejemplo oficial (inspeccionado el 2026-10-30, `WhatsApp/stickers`, carpeta `Android/`)
| Elemento | Valor |
|---|---|
| Android Gradle Plugin | 8.5.2 (`Android/build.gradle`) ⇒ necesita **JDK 17 o superior** |
| Gradle wrapper | 8.7 ⇒ ejecuta con JDK hasta **21**, **no con 25** |
| `compileSdkVersion` / `targetSdkVersion` / `minSdkVersion` | 30 / 30 / 15 |
| Dependencias | appcompat 1.3.1, material 1.4.0, Fresco 2.5.0 (`fresco`, `webpsupport`, `animated-webp`, `animated-base`) |
| `aaptOptions { noCompress "webp" }` | **mantener** (si se comprimen los webp, el ContentProvider falla) |
| Assets | `app/src/main/assets/contents.json`, packs en `assets/1/` (estático «Cuppy») y `assets/2/` (animado) |
| Comprobaciones del build | `checkDebug` falla si `applicationId` es `com.example.samplestickerapp` o empieza por `com.whatsapp`; lee `local.properties` (debe existir) |
| Validador (`StickerPackValidator.java`) | identifier `[\w-.,'\s]+` sin `..`, ≤128; `name` y `publisher` no vacíos, ≤128; 3–30 stickers; **1–3 emojis por sticker (obligatorio ≥1)**; 512×512; animado ≤ 500 KB; fotograma ≥ 8 ms; total ≤ 10 000 ms; todo el pack animado si `animated_sticker_pack: true`; tray 24–512 px y ≤ 50 KB; `accessibility_text` animado ≤ 255 caracteres |
| Manifest | ContentProvider exportado con `readPermission="com.whatsapp.sticker.READ"` y `<queries>` para `com.whatsapp` y `com.whatsapp.w4b` (ya correcto, no tocar) |

---

## 3. Fase 1 — Comprobar el entorno Android

**Objetivo:** SDK y JDK listos.

1. Localizar el SDK (Android Studio lo pone en `%LOCALAPPDATA%\Android\Sdk`):
   ```powershell
   $env:ANDROID_HOME; Test-Path "$env:LOCALAPPDATA\Android\Sdk"
   Get-ChildItem "$env:LOCALAPPDATA\Android\Sdk\platforms","$env:LOCALAPPDATA\Android\Sdk\build-tools" -Name
   ```
2. Necesario: `platform-tools`, `platforms;android-30` (el ejemplo compila contra 30; Android Studio suele instalar solo la última) y `build-tools;34.0.0` (la que usa AGP 8.5 por defecto; si Gradle pide otra, instalar la que pida). Con el `sdkmanager` del SDK:
   ```powershell
   & "$env:LOCALAPPDATA\Android\Sdk\cmdline-tools\latest\bin\sdkmanager.bat" "platform-tools" "platforms;android-30" "build-tools;34.0.0"
   ```
   Si no existe `cmdline-tools\latest`, pedir a Eva que lo instale desde Android Studio → *SDK Manager → SDK Tools → Android SDK Command-line Tools*, o instalar esos paquetes desde la pestaña *SDK Platforms* (Android 11.0 / API 30). **Las licencias las acepta Eva** (`sdkmanager --licenses` o el diálogo de Android Studio).
3. JDK para Gradle: si está Android Studio, usar su JBR (normalmente `C:\Program Files\Android\Android Studio\jbr`, JDK 21): comprobar con `& "C:\Program Files\Android\Android Studio\jbr\bin\java.exe" -version`. Si no existe, instalar **Temurin 17** (adoptium.net) **sin** cambiar el JDK 25 del sistema. Se usará solo en este proyecto vía `gradle.properties` (fase 2).
4. `adb` en `...\Sdk\platform-tools\adb.exe` (no hace falta añadirlo al PATH; usar ruta completa).

**Hecho cuando:** existen `platforms\android-30`, una `build-tools` 34.x y un `java -version` 17 o 21 utilizable. Anotar rutas reales en `ESTADO_APP.md`.

---

## 4. Fase 2 — Proyecto base que compila sin cambios

1. ```powershell
   New-Item -ItemType Directory -Force C:\src\nailong_stickers_app
   git clone --depth 1 https://github.com/WhatsApp/stickers.git C:\src\nailong_stickers_app\stickers
   ```
   Proyecto Android: `C:\src\nailong_stickers_app\stickers\Android\` (en adelante `ANDROID\`).
2. Crear `ANDROID\local.properties` (barras dobles o normales):
   ```
   sdk.dir=C\:\\Users\\Administrator\\AppData\\Local\\Android\\Sdk
   ```
   (Usar la ruta real de la fase 1.)
3. Fijar el JDK solo para este proyecto en `ANDROID\gradle.properties` (añadir línea):
   ```
   org.gradle.java.home=C:/Program Files/Android/Android Studio/jbr
   ```
   (o la ruta del Temurin 17).
4. Antes de compilar cambiar ya el `applicationId` (si no, `checkDebug` falla a propósito): en `ANDROID\app\build.gradle`, `applicationId "com.example.samplestickerapp"` → `applicationId "com.eva.nailongstickers"`. **No cambiar `namespace`** (sigue `com.example.samplestickerapp`; el código Java usa ese paquete).
5. Compilar:
   ```powershell
   cd C:\src\nailong_stickers_app\stickers\Android; .\gradlew.bat assembleDebug --console=plain -q
   ```
6. Si falla por versiones, arreglar **solo** la configuración (JDK, SDK instalado, wrapper), nunca la lógica de la app. Anotar el error exacto.

**Hecho cuando:** existe `ANDROID\app\build\outputs\apk\debug\app-debug.apk` con los packs de ejemplo.

---

## 5. Fase 3 — (Opcional pero recomendado) Probar el ejemplo en el móvil

Sirve para separar «problema de instalación/HyperOS» de «problema con nuestros stickers». Si Eva prefiere ahorrar tiempo, saltar a la fase 4 y hacer la instalación una sola vez en la fase 6.

---

## 6. Fase 4 — Generar los assets con un script reproducible

Crear `C:\src\nailong_stickers_app\generar_assets.py` (Python 3, Pillow ya instalado en el PC). Ejecutar con `python -I generar_assets.py`.

**Entradas (constantes al principio del script):**
```python
WEB = r'C:\Users\Administrator\Documents\Claude Code\Misceláneo\Página Nailong'
SRC = WEB + r'\Stickers Nailong'
ASSETS = r'C:\src\nailong_stickers_app\stickers\Android\app\src\main\assets'
PACKS = [
  ('nailong_animados_1', 'Muñeco amarillo animado 1', [2,5,6,7,9,10,11,12,14,15,19,20,21,23,24,25,26,27,30,31,32,33,35,40,41,43,44,45,46,47]),
  ('nailong_animados_2', 'Muñeco amarillo animado 2', [49,50,51,52,53,54,55,56,57,59,60,61,62,63,64,65,66,67,68,70,71,73,74,75,77,78,79,80,81,82]),
]
PUBLISHER = 'Eva'
EMOJIS = {'caritas': ['😊','💛'], 'bailes': ['💃','🎉'], 'comida': ['🍔','😋'], 'amigos': ['🤗','💛']}
```

**Pasos del script:**
1. **Limpiar** `ASSETS`: borrar las carpetas `1/` y `2/` del ejemplo y `contents.json` (solo dentro de `ASSETS`; comprobar la ruta antes de borrar).
2. Leer `ALL_STICKERS` de `WEB\index.html` con una expresión regular sobre líneas `id: N, file: '...', frames: F, title: '...', cat: '...'` para obtener `title` y `cat` de cada id. Si falta algún id, fallar.
3. Para cada pack, carpeta `ASSETS\<identifier>\` — **comprobado:** `StickerContentProvider.java` abre los archivos con `am.openFd(identifier + "/" + fileName)`, así que la carpeta debe llamarse exactamente como el `identifier` (`nailong_animados_1`, `nailong_animados_2`). Copiar con `shutil.copyfile` (bytes idénticos) cada `sticker_N.webp` como `NN_sticker_N.webp` (NN = 01…30, para mantener el orden).
4. **Tray icon** por pack: primer fotograma del primer sticker del pack (2 y 49) → RGBA → `resize((96,96), LANCZOS)` → PNG optimizado `tray.png`; si pesa > 50 KB, reducir colores (`quantize`) hasta ≤ 50 KB.
5. Escribir `ASSETS\contents.json` (UTF-8, `ensure_ascii=False`) con la estructura del ejemplo:
   ```json
   {
     "android_play_store_link": "",
     "ios_app_store_link": "",
     "sticker_packs": [
       {
         "identifier": "nailong_animados_1",
         "name": "Muñeco amarillo animado 1",
         "publisher": "Eva",
         "tray_image_file": "tray.png",
         "image_data_version": "1",
         "avoid_cache": false,
         "animated_sticker_pack": true,
         "publisher_email": "",
         "publisher_website": "",
         "privacy_policy_website": "",
         "license_agreement_website": "",
         "stickers": [
           { "image_file": "01_sticker_2.webp", "emojis": ["💃","🎉"], "accessibility_text": "Sonrisa Radiante 3D" }
         ]
       }
     ]
   }
   ```
   `accessibility_text` = título del sticker (≤ 255 caracteres).
6. **Validación propia antes de compilar** (replicar las reglas de `StickerPackValidator`, sección 2.4), fallando con mensaje claro:
   - 512×512 (`PIL.Image.open().size`), `n_frames > 1`;
   - `os.path.getsize() <= 512000`;
   - duración de cada fotograma ≥ 8 ms y suma ≤ 10 000 ms, **leyendo los chunks `ANMF` del RIFF** (bytes 12–14 del payload del ANMF, little-endian; no fiarse de `Image.info['duration']` de Pillow, que da 0 en estos archivos);
   - 3–30 stickers por pack, 1–3 emojis, tray 96×96 ≤ 50 KB, identifier válido con la regex `[\w\-.,'\s]+`.
7. Imprimir un resumen: pack, nº de stickers, KB máximo, duración máxima.

**Hecho cuando:** el script termina sin errores y el resumen dice 2 packs × 30 stickers. Ejecutarlo dos veces seguidas debe dar el mismo resultado (idempotente).

---

## 7. Fase 5 — Personalizar y compilar

1. `ANDROID\app\src\main\res\values\strings.xml`: `app_name` → «Stickers Nailong».
2. (Opcional) Icono: generar `ic_launcher` desde el primer fotograma del sticker 2 en las carpetas `mipmap-*` (mismos tamaños que los PNG existentes). Si consume mucho tiempo, saltarlo.
3. **No tocar** la lógica Java (ContentProvider, validador, intent), el manifest ni `noCompress "webp"`.
4. Compilar: `.\gradlew.bat assembleDebug --console=plain -q`.
5. Copiar el APK a `C:\src\nailong_stickers_app\StickersNailong.apk`.
6. Guardar el keystore de depuración que ha firmado el APK (`%USERPROFILE%\.android\debug.keystore`): para **actualizar** la app más adelante sin desinstalarla hay que firmar con la misma clave (si se desinstala, WhatsApp pierde los packs). Anotarlo en `ESTADO_APP.md`.

**Hecho cuando:** `StickersNailong.apk` existe. Tamaño esperado ≈ 15–25 MB (stickers ~14 MB + librerías Fresco); **no comprobado**, anotar el real.

---

## 8. Fase 6 — Instalar en el POCO X7 Pro (lo hace Eva, el agente guía)

**Opción A (recomendada, sin cable):**
1. Pasar `StickersNailong.apk` al móvil (cable USB en modo transferencia de archivos, Google Drive o enviárselo a sí misma por WhatsApp como **Documento**).
2. Abrirlo desde la app Archivos (o desde WhatsApp). Android pedirá permitir «Instalar apps desconocidas» para esa app de origen: permitirlo.
3. Avisos esperables: HyperOS/Play Protect pueden advertir que la app es desconocida o que está hecha para una versión antigua de Android (`targetSdk 30`): elegir instalar igualmente. Si HyperOS exige escaneo de seguridad o cuenta Xiaomi, seguir sus pantallas. *(Los textos exactos de los menús de HyperOS 3 no están comprobados: pedir a Eva que diga qué ve.)*

**Opción B (con ADB, útil para ver errores):**
1. En el móvil: Ajustes → Sobre el teléfono → tocar varias veces sobre la versión de HyperOS hasta activar las opciones de desarrollador; luego Ajustes adicionales → Opciones de desarrollador → «Depuración USB» y «Instalar vía USB» (en Xiaomi esta última puede pedir cuenta Xiaomi y SIM). *(Rutas de menú no comprobadas en HyperOS 3.)*
2. `& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" devices` → aceptar la huella en el móvil → `adb install -r C:\src\nailong_stickers_app\StickersNailong.apk`.
3. Comprobación técnica útil: `adb shell getconf PAGE_SIZE` (si diera 16384, las librerías nativas de Fresco 2.5.0 podrían no cargar; lo normal es 4096).

**Hecho cuando:** la app abre y muestra 2 packs. Si sale vacía o con error: `adb logcat -d | findstr /i "sticker IllegalState"` y corregir según el mensaje (casi siempre es una regla del validador: emojis, tray, peso, duración, identifier).

---

## 9. Fase 7 — Añadir a WhatsApp y comprobar (Eva)

1. En la app: entrar en el pack 1 → «Añadir a WhatsApp» → confirmar en el diálogo de WhatsApp. Repetir con el pack 2.
2. WhatsApp → cualquier chat → icono de stickers: deben aparecer 2 pestañas nuevas y los stickers **moverse**.
3. Enviar 2–3 a sí misma (chat «Tú»): deben llegar como **sticker animado**.
4. **Favoritos (manual, uno a uno):** pulsar el sticker en el chat o mantenerlo pulsado en la bandeja → «Añadir a favoritos». *(El gesto exacto puede variar según versión de WhatsApp; Eva confirma.)*
5. **Prueba opcional «Muñeco amarillo»:** pulsar un sticker recibido y ver si aparece una opción tipo «Añadir a paquete de stickers» que deje elegir «Muñeco amarillo». Anotar exactamente lo que ve Eva. Si no aparece, no hay alternativa: se quedan en los packs nuevos.
6. Si WhatsApp dice «hay un problema con este paquete»: `adb logcat -d | findstr /i "whatsapp sticker"`; revisar `contents.json`, carpeta del pack, tray, `animated_sticker_pack`.

**Hecho cuando:** Eva confirma que ve los 60 animados moviéndose en WhatsApp.

---

## 10. Fase 8 — Cierre

1. `ESTADO_APP.md` final: rutas, versión de JDK/SDK usadas, tamaño del APK, resultado de cada prueba de la fase 7.
2. Para el futuro (anotar en `ESTADO_APP.md`): si se añaden stickers a la web, añadir ids a `PACKS`, subir `image_data_version` a "2", recompilar con la misma clave e instalar encima (`adb install -r` o abrir el APK nuevo). Máximo 30 por pack, máximo 10 packs.
3. **Con permiso de Eva**, añadir en `DOCUMENTACION.md` de la web (ADR-08, «Vías de mejora») una línea: «Uso personal: app Android propia basada en el ejemplo oficial `WhatsApp/stickers`, fuera del repo, que añade los 60 animados como 2 packs (comprobado el AAAA-MM-DD)». Ejecutar `python verify_all.py` (debe dar 41/41) antes de cualquier commit y no hacer push sin que Eva lo pida.
4. Borrar este `PLAN_APP_STICKERS_WHATSAPP.md` de la carpeta de la web.

---

## 11. Riesgos y soluciones

| Riesgo | Señal | Solución |
|---|---|---|
| JDK 25 con Gradle 8.7 | error «Unsupported class file major version» o similar | `org.gradle.java.home` → JBR de Android Studio (21) o Temurin 17 |
| Falta API 30 | «Failed to find target with hash string 'android-30'» | instalar `platforms;android-30` |
| `checkDebug` falla | mensaje sobre `com.example.samplestickerapp` | cambiar `applicationId` (fase 2.4); `local.properties` debe existir |
| Ruta con acentos/espacios | errores raros de Gradle/AAPT | trabajar solo en `C:\src\nailong_stickers_app\` |
| Sticker > 500 KB | validador: «animated sticker should be less than 500KB» | hoy ninguno (máx. 499 KB, el 2); si pasa, re-convertir **una copia** con `normalizar_stickers.py` de la web, nunca el original |
| Emojis vacíos | «associate at least 1 emoji» | revisar mapa `EMOJIS` |
| Carpeta de pack mal nombrada | packs vacíos / «cannot open sticker file» | la carpeta en `assets/` debe llamarse igual que el `identifier` (`openFd(identifier + "/" + fileName)`) |
| Instalación bloqueada en HyperOS | aviso de seguridad / «Instalar vía USB» deshabilitado | Opción A (abrir APK desde Archivos) |
| Librerías nativas en páginas de 16 KB | la app se cierra al abrir | `adb shell getconf PAGE_SIZE`; si es 16384, subir Fresco a una versión compatible (investigar, no inventar la versión) |
| Desinstalar la app | los packs desaparecen de WhatsApp | no desinstalar; actualizar encima con la misma clave |
| Favoritos / pack «Muñeco amarillo» | — | sin API: manual (sección 1) |
