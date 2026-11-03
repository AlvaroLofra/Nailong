# Guía de Estilo y Redacción del README (Vitrina Pública) 🦖

> **Regla de oro canónica:**
> **«README = vitrina pública (frases cortas, para el usuario final, sin jerga técnica ni código). Lo técnico va en documentacion/.»**
> 
> Esta regla es de obligado cumplimiento para cualquier agente de IA o desarrollador que consulte o edite el fichero `README.md` del repositorio.

---

## 1. Propósito y Dicotomía de la Documentación

El repositorio de Nailong mantiene una separación estricta entre tres piezas documentales con públicos y objetivos distintos:

| Documento | Público objetivo | Tono y Enfoque | Qué contiene | Qué NO contiene |
|---|---|---|---|---|
| **`README.md`** | Visitante de GitHub, fans de Nailong, usuarios de WhatsApp | Alegre, directo, acogedor, sin tecnicismos | Qué es el proyecto, qué puedes hacer, cómo descargarlo/probarlo y las novedades de la versión actual | Cero código, cero árboles de ficheros internos, cero reportes de tests, cero historial acumulativo |
| **`CHANGELOG.md`** | Desarrolladores, mantenedores, curiosos técnicos | Preciso, cronológico, exhaustivo | **Historial técnico completo** de todas las versiones (v1.0.0 a la actual): cambios en código, assets, APK, bugs corregidos | Textos promocionales extensos |
| **`documentacion/`** | Desarrolladores y agentes de IA | Riguroso, analítico, estructurado | Arquitectura, ADRs (`DECISIONES.md`), notas de subsistemas, guías de entorno y bitácoras de sesión | Lenguaje informal de cara al público |

> **Nota sobre el historial interno:** El historial completo de actualizaciones **nunca se pierde**. Vive y se preserva íntegramente en [`CHANGELOG.md`](../../CHANGELOG.md). El `README.md` no debe duplicar ese historial: solo muestra las novedades de la versión vigente y enlaza al changelog.

---

## 2. Diagnóstico Histórico: Lecciones del Proyecto

Un análisis cronológico del `README.md` muestra cómo el estilo original se fue diluyendo con el paso de las versiones. Esta guía rescata los aciertos de las primeras versiones y prohíbe los vicios de las últimas:

### ✅ Qué imitar: La frescura de las primeras versiones (v1.0.0 – v1.2.0)
En los primeros lanzamientos, el texto era pura vitrina:
* *«¡Estreno oficial de la web interactiva de Nailong!»*
* *«Pancita elástica con sonidos divertidos y 9 estados de ánimo en vivo.»*
* *«Visor Mágico de animaciones y Gran Álbum con cromos auténticos.»*
* *«Minijuego arcade para atrapar comida.»*
* **Patrón a seguir:** Frases breves, verbos enérgicos, adjetivos cariñosos («mágico», «elástica», «crujiente»), enfoque 100% en lo que el usuario ve, siente y juega.

### ⚠️ Qué evitar: La dilución intermedia (v2.0.0 – v3.0.0)
Comenzaron a filtrarse nombres de variables, constantes y herramientas internas:
* ❌ *«recorte del texto en sticker_58.webp y desacople de isCreatorItem»*
* ❌ *«Paginación dinámica con GALLERY_STEP»*
* ❌ *«Desarrollo de muxer WebP build_animated y normalizar_stickers.py»*
* ❌ *«(CLIPBOARD_CORNER_RADIUS = 48px)»*
* **Corrección:** Al usuario no le importan las constantes ni los nombres de scripts; le importa que los stickers ahora tienen esquinas transparentes o que el álbum carga más rápido.

### 🚫 Qué erradicar: La sobrecarga técnica tardía (v3.2.1 – v3.4.1)
El README se convirtió en un informe de control de calidad y justificación para programadores:
* ❌ *«Árbol de carpetas con verify_all.py, DOCUMENTACION.md y AGENTS.md»* (archivos que un visitante normal no debe tocar).
* ❌ *«Corrección de la etiqueta del botón de descarga a 20 MB en vez de 26 MB»* (detalles nimios de refactorización).
* ❌ *«version.json (código 11), StickersNailong.apk (31.2 MB) y suite de pruebas superada al 100% (47/47)»* (jerga de testing y empaquetado).
* ❌ 150 líneas de parches acumulados desde v1.0.0 que convertían la portada en un pergamino interminable.

---

## 3. Estructura Obligatoria del `README.md`

El `README.md` debe constar **exclusivamente de las siguientes 6 secciones**, en este orden exacto:

### 1. Cabecera Visual
* Título llamativo con emoji de dragón (ej. `# ¡El Mundo Mágico de Nailong! 🦖`).
* Imagen o GIF centrado de Nailong (habitualmente `Stickers Nailong/sticker_2.webp` a 200 px de ancho).
* Enlace destacado a la web en vivo en GitHub Pages.

### 2. ¿Qué es este rincón mágico?
* 1 o 2 párrafos introductorios explicando de manera afectuosa quién es Nailong (el dragón de leche amarillo de *Seventh Impression*) y la invitación a interactuar con la web y los stickers.

### 3. Características Principales (Lo que puedes disfrutar)
* Lista con viñetas destacando las grandes atracciones de la web:
  - **Hero Interactivo & Contador Duang:** Tocar la pancita elástica y ver sus estados de ánimo.
  - **Colección de 95 Stickers Oficiales:** Cromos auténticos clasificados por estados de ánimo, listos para ver, descargar o copiar.
  - **App Android Nativa para WhatsApp:** Instalación de packs con 1 toque o creador personalizado «Mi Selección».
  - **Visor Mágico de Animaciones:** Tira horizontal con escenas en bucle y pegatinas interactivas.
  - **Tráiler Oficial Animado:** Vídeo musical con físicas elásticas Duang.
  - **Botonera Musical:** Sonidos de caricatura y risas al instante.
  - **Laboratorio de Superpoderes:** Disfraces divertidos, lluvia de pollo crujiente y gravedad cero.
  - **Minijuego "La Gran Comilona":** Juego arcade para atrapar comida.
  - **Rincón del Creador:** Dedicatoria especial y foto junto a Nailong.

### 4. ¿Cómo conseguir los stickers para WhatsApp?
* **En Android (App Oficial):** Enlace directo a `StickersNailong.apk` explicando que con 1 toque se añaden los 4 packs oficiales a WhatsApp.
* **En iPhone / PC (Web Oficial):** Explicación de que desde la web se pueden guardar en el Carrete de iOS o copiar directamente con esquinas transparentes para pegar en chats.

### 5. ✨ Novedades de la Versión (vX.X.X)
* **Solo la versión actual activa.**
* Un subtítulo con el número de versión y su temática general.
* Entre 3 y 5 viñetas breves escritas con el estilo fresco de v1: qué hay de nuevo, qué se mejoró y qué va a notar el usuario.
* **Llamada a la acción hacia el changelog:**
  > *👉 ¿Quieres ver el historial completo de cambios y detalles técnicos? Consulta el [CHANGELOG.md](CHANGELOG.md).*

### 6. Cierre y Créditos
* Mensaje final cariñoso (*Hecho con cariño para todos los fans de Nailong 💛*).
* Mención de autoría: *Desarrollado por Álvaro Lofra* y reconocimiento a *Seventh Impression*.

---

## 4. Lista Negra: Lo que NUNCA debe estar en el `README.md`

| Elemento prohibido en README | Dónde debe vivir en su lugar |
|---|---|
| **Árbol de directorios de desarrollo** (`verify_all.py`, `DOCUMENTACION.md`, `AGENTS.md`) | En `documentacion/00_INDICE.md` o `AGENTS.md` |
| **Historial de versiones antiguas** (v1.0 a versiones previas) | En `CHANGELOG.md` |
| **Nombres de ficheros de código o variables** (`js/02-datos...`, `const`, `var`) | En `documentacion/notas_tecnicas/` |
| **Resultados de tests o suites de verificación** (`N/N pruebas superadas`, asserts) | En `documentacion/estado_del_proyecto/ESTADO_ACTUAL.md` |
| **Detalles internos de compilación/firma del APK** (keystores, zipalign, SHA-256, targetSdk) | En `documentacion/guias_y_contexto/GUIA_DESARROLLO.md` |
| **Justificaciones defensivas o corrección de erratas mínimas** | En la bitácora de la sesión |

---

## 5. Protocolo de Actualización al Publicar Versión

Cada vez que un agente o desarrollador publique una nueva versión del proyecto y deba tocar el `README.md`:

1. **Revisar cifras públicas:** Si cambió el número de stickers (ej. 95), la cantidad de sonidos (ej. 12) o el peso del APK (ej. 31.2 MB), actualízalos en la descripción y características.
2. **Reemplazar el bloque de novedades:** Sustituye el bloque de la sección 5 por las novedades de la versión que se está lanzando. Redáctalas en 3–4 viñetas simples, con lenguaje entusiasta y comprensible para cualquier persona.
3. **Mudar el detalle al Changelog:** Todo el detalle técnico, nombres de archivos, causas raíz y verificaciones van directamente a `CHANGELOG.md`.
4. **Verificación final del README:** Léelo de arriba a abajo. Si contiene una sola palabra de jerga de programador, una ruta interna de archivos o un resultado de tests, bórralo o reescríbelo antes de dar la tarea por completada.
