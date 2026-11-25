# Nota Técnica 06: Auditoría de seguridad de la app y la web (2026-11-15)

> **Qué es:** revisión del código de la app Android, del APK publicado, de la actualización semiautomática y de la web. Las cifras de versión citadas son las del día de la auditoría; las vigentes están en `ESTADO_ACTUAL.md`.
> **Qué no es:** una garantía. Ninguna auditoría demuestra que algo sea «totalmente seguro»; esta dice qué se miró, qué se encontró y qué no se pudo comprobar.

## Resumen

- **No se ha encontrado ninguna vía para que un tercero ataque a quien usa la app o la web.** La app pide un único permiso (Internet), no guarda datos personales y no acepta contenido de fuera.
- **El punto débil no es el código, sino las dos «llaves» del proyecto:** la clave con la que se firma el APK y la cuenta de GitHub que publica la web. Quien tenga las dos puede hacer llegar una actualización falsa a los móviles. Hoy ambas dependen de un solo ordenador y una sola cuenta.
- Se ha corregido en esta sesión un fallo menor de la web (H-1).

Analogía: la app es una casa con una sola puerta y bien cerrada. El riesgo está en cuántas copias hay de la llave y dónde se guardan.

## Cómo funciona la actualización (y por qué es razonablemente segura)

1. La app descarga `version.json` de la web oficial por HTTPS (`UpdateChecker.java`).
2. Si el `versionCode` publicado es mayor que el instalado, muestra un aviso con las novedades (como texto plano, no HTML).
3. Solo acepta enlaces de descarga que empiecen por `https://alvarolofra.github.io/`; cualquier otro se ignora.
4. Al pulsar «Descargar», abre el enlace en el navegador. La app **no instala nada por sí misma**.
5. Android solo deja instalar el APK encima del existente si está firmado **con la misma clave** y su número de versión no es menor.

El paso 5 es la protección de verdad: aunque alguien cambiase `version.json` o el APK de la web, un APK firmado con otra clave no se instala sobre la app.

## Hallazgos

Gravedad: **alta** = puede dañar a los usuarios; **media** = puede dejar el proyecto sin poder actualizarse o exige varias condiciones; **baja** = mejora recomendable; **informativa** = correcto, se anota.

### Acción tuya (no requiere tocar código)

| # | Hallazgo | Gravedad | Riesgo práctico | Qué hacer |
|---|---|---|---|---|
| H-2 | El APK se firma con el almacén de claves *debug* de este PC (`%USERPROFILE%\.android\debug.keystore`), cuya contraseña es la pública por defecto de Android. Hay una copia (`debug.keystore.bak`) en la carpeta de la app, **en el mismo disco**. | Media | **Si se pierde** (avería, reinstalación de Windows), no se podrá publicar ninguna actualización que se instale encima: todos tendrían que desinstalar y reinstalar. **Si alguien la copia**, puede firmar un APK que Android acepte como actualización legítima (le faltaría hacérselo llegar al usuario: ver H-3). | Guardar una copia del fichero fuera de este ordenador (USB o gestor de contraseñas). No subirlo nunca a GitHub ni a nubes compartidas. |
| H-3 | La web, `version.json` y el APK se publican desde una sola cuenta de GitHub. | Media | Quien entre en la cuenta puede cambiar el APK descargable (afecta a **instalaciones nuevas**) y las novedades del aviso. A los ya instalados solo les afectaría si además tiene la clave de H-2. | Activar la verificación en dos pasos en GitHub y revisar qué aplicaciones y tokens tienen acceso. **No comprobado desde aquí.** |
| H-4 | El código fuente de la app (`C:\src\nailong_stickers_app`) no está bajo control de versiones ni tiene copia conocida. | Media (disponibilidad) | Una avería de disco deja el proyecto sin poder recompilar la app. | Hacer copia de seguridad de la carpeta o crear un repositorio **privado**. |

### Corregido en esta sesión (web, sin APK nuevo)

| # | Hallazgo | Gravedad | Detalle |
|---|---|---|---|
| H-1 | El álbum pintaba con `innerHTML`, sin escapar, el nombre de las fotos que sube el usuario y lo guardado en `localStorage`. | Baja | Un fichero con un nombre preparado (o un `localStorage` manipulado) podía ejecutar código en la página. Solo afectaba al propio usuario en su navegador: la web no tiene cuentas ni comparte esas fotos. Arreglo en `js/06-album-y-descargas.js`: `escaparHtml()` al pintar y `esFotoGuardadaValida()` al cargar. Probado con una carga maliciosa: no se ejecuta y la foto inválida se descarta. |

### Requieren APK nuevo (decisión tuya; ninguno es urgente)

| # | Hallazgo | Gravedad | Detalle y propuesta |
|---|---|---|---|
| H-5 | Clave de firma *debug* (ver H-2). | Media | Se puede pasar a una clave propia con contraseña mediante **rotación de clave** (`apksigner rotate`, esquema v3): los móviles con Android 9 o superior aceptan el cambio sin reinstalar; los anteriores siguen validando con la clave antigua, que por tanto hay que conservar igualmente. Reduce el riesgo de copia, no el de pérdida. Valorar solo si la app crece en usuarios. |
| H-6 | Fresco 2.5.0 (biblioteca de imágenes de 2021) incluye un descodificador WebP antiguo. | Baja | Las versiones antiguas de `libwebp` tienen fallos conocidos al abrir imágenes maliciosas. **Aquí no es explotable**: la app solo abre sus propios stickers, empaquetados en el APK. Actualizar Fresco cuando se recompile por otro motivo. *Versión exacta de `libwebp` incluida: no comprobada.* |
| H-7 | `targetSdkVersion 30` y `minSdkVersion 15`. | Baja | No es una vulnerabilidad. Android va subiendo el mínimo que acepta instalar y Play Protect avisa de apps antiguas; conviene subir el objetivo en una versión futura (exige declarar `android:exported` en la actividad de entrada y probar en móvil). En Android 4.x la comprobación de versión puede fallar en silencio por TLS antiguo. |
| H-8 | La comprobación de actualización lee la respuesta sin límite de tamaño. | Informativa | Solo importaría si la web oficial estuviera ya comprometida. Poner un tope (unos pocos KB) es trivial cuando se toque `UpdateChecker.java`. |

### Riesgos aceptados de la web (no se cambian)

| # | Hallazgo | Gravedad | Por qué se deja |
|---|---|---|---|
| H-9 | Tailwind se carga como script desde su CDN, sin comprobación de integridad. | Baja | Si ese CDN sirviera código malicioso, se ejecutaría en la página. La versión está fijada, pero ese servicio no admite huella de integridad; evitarlo exige compilar Tailwind, lo que rompe la regla «sin build» (D-15). La web no maneja datos sensibles. |
| H-10 | No hay política de seguridad de contenido (CSP). | Baja | GitHub Pages no permite cabeceras propias y la página usa manejadores `onclick` en el HTML, así que una CSP por `<meta>` tendría que permitir casi todo y no protegería. |
| H-11 | ~~El código QR se genera en un servicio externo (`api.qrserver.com`).~~ **Resuelta en la web 4.2.0 (`W34`, D-30):** los dos QR son SVG fijos dentro de `index.html` y ya no se pide nada a ese servicio. | Informativa | — |

## Lo que está bien (comprobado)

**En el APK publicado** (`aapt dump badging` y `apksigner verify --print-certs` sobre `StickersNailong.apk`):
- No es depurable. Un solo permiso: `INTERNET`.
- Firmado con los esquemas v1, v2 y v3 por un único firmante (certificado RSA de 2048 bits, huella SHA-256 `04b83add…abb2`, la misma documentada en `GUIA_DESARROLLO.md`), válido hasta 2056.
- `allowBackup` desactivado.

**En el código de la app:**
- Ninguna pantalla es accesible desde otras apps salvo la de inicio.
- El proveedor de contenido (`StickerContentProvider`) solo permite leer, exige el permiso de lectura de WhatsApp y rechaza rutas que intenten salir de su carpeta (`isInside()` con rutas canónicas, `DynamicPackManager.java`). Insertar, modificar y borrar no están implementados.
- Las novedades de `version.json` se muestran con `setText` (texto plano).
- La comprobación del enlace del APK incluye la barra final, así que un dominio parecido (`alvarolofra.github.io.otro.com`) no pasa.
- El tráfico sin cifrar está bloqueado por defecto (objetivo ≥ API 28) y la compilación *release* lleva ofuscación.

**En la web:**
- Three.js se carga con huella de integridad (SRI). Desde la 4.2.0 (`W32`, D-30) Font Awesome ya no se descarga: los iconos son SVG dentro de `css/styles.css`, así que hay un tercero menos que pueda servir código o fuentes.
- No hay claves, contraseñas ni almacenes de claves en el repositorio ni en su historial (`git ls-files`, `git log --all`). `.gitignore` excluye `.env` y `CLAUDE.local.md`.
- El resto de usos de `innerHTML` pintan datos fijos del propio código.

## No comprobado

- La app en un móvil real y el flujo completo de actualización de extremo a extremo.
- La configuración de la cuenta de GitHub (dos pasos, tokens, protección de rama, quién tiene acceso).
- La versión exacta de `libwebp` dentro de Fresco 2.5.0 y la versión de Fresco que lo corrige.
- Análisis dinámico del APK (interceptar tráfico, pruebas con herramientas de pentesting): la revisión ha sido de código y de metadatos del binario.
- Dependencias transitivas de AndroidX/Material (no se ha pasado un escáner de vulnerabilidades).
