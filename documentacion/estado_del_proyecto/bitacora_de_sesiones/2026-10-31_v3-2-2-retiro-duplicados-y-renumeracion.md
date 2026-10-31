# 2026-10-31 · v3.2.2: Retiro de stickers duplicados, renumeración continua a 80 y actualización del APK

| Campo | Valor |
|---|---|
| **Fecha** | 2026-10-31 |
| **Quién trabajó** | Gemini / Antigravity, dirigido por el usuario |
| **Rama** | `main` |
| **Versión del producto** | `v3.2.2` (Web `v3.2.2`, APK `versionCode 5` / `versionName "3.2.2"`) |
| **Estado de tests** | 44 de 44 superados (`python verify_all.py`) |

---

## 1. Objetivo
Atender la solicitud del usuario para eliminar dos stickers duplicados identificados en la colección (el par 1/42 y el par 6/14), renumerar de forma continua el catálogo sin dejar huecos en la serie gráfica, y lanzar una actualización terciaria (`v3.2.2`) sincronizando la web oficial, la app nativa Android y toda la base documental.

## 2. Punto de partida
- Catálogo con 82 stickers numerados (`sticker_1.webp`…`sticker_82.webp`) + 1 foto del creador.
- Se verificó que `sticker_1.webp` y `sticker_42.webp` eran 100% idénticos (mismo SHA-256 `ece2de...`, 72 KB).
- Se verificó que `sticker_6.webp` y `sticker_14.webp` contenían la misma escena animada de Nailong saboreando/riendo.
- La aplicación Android (`StickersNailong.apk`) estaba en `v3.2.1` (`versionCode 4`).

## 3. Qué se hizo

### 3.1. Eliminación y Renumeración Continua (D-16)
1. **Selección:**
   - Entre 1 y 42: Se eliminó `sticker_42.webp` para conservar `sticker_1.webp` como cromo #1 de apertura histórica.
   - Entre 6 y 14: Se eliminó `sticker_6.webp` y se conservó `sticker_14.webp`.
2. **Renumeración:**
   - Stickers 1..5: sin cambios (1..5).
   - Stickers 7..41: desplazados -1 (6..40).
   - Stickers 43..82: desplazados -2 (41..80).
   - Resultado: exactamente 80 archivos WebP continuos (`sticker_1.webp`…`sticker_80.webp`) + `creador_nailong.webp`.

### 3.2. Sincronización Web (`js/` e `index.html`)
- **`js/02-datos-stickers.js`:** Actualizado `ALL_STICKERS` a 80 elementos continuos.
- **`js/03-hero.js`:** Remapeados los 9 estados de ánimo; mood `chicken` ahora usa `sticker_13.webp` (la escena animada que antes residía en 6).
- **`js/05-visor-magico.js`:** Remapeadas las 9 escenas virales de `FEATURED_GIFS`.
- **`js/07-sonidos-y-laboratorio.js`:** Remapeadas las 12 casillas de `SOUNDBOARD_TILES` (la casilla de `¡Ñam Ñam Crujiente!` usa `sticker_11.webp`).
- **`js/08-minijuego.js`:** Sprite del jugador actualizado a `sticker_9.webp` (antiguo 10).
- **`index.html` y `manifest.json`:** Favicon e iconos actualizados a `sticker_19.webp` (antiguo 20); insignias, pie y anti-caché actualizados a `v3.2.2` (`?v=3.2.2`).

### 3.3. Aplicación Android (`StickersNailong.apk`)
- **`generar_assets.py`:** Actualizado el reparto de los 3 packs oficiales para sumar 80 stickers exactos:
  - `nailong_animados_1`: 29 stickers animados.
  - `nailong_animados_2`: 30 stickers animados.
  - `nailong_estaticos`: 21 stickers estáticos.
- **Recompilación y Firma:**
  - `versionCode 5` y `versionName "3.2.2"` en `build.gradle`.
  - Recompilado con Gradle 8.7 (`./gradlew.bat assembleRelease`) en 2 minutos.
  - Firmado con `apksigner` con esquemas v1, v2 y v3 mediante el keystore oficial.
  - Copiado a la raíz del repositorio web (`StickersNailong.apk`, 20.3 MB).

### 3.4. Pruebas y Documentación
- `verify_all.py` adaptado a 80 stickers; los 44 tests pasan al 100%.
- Registrado **ADR D-16** en `DECISIONES.md`.
- Actualizados `CHANGELOG.md`, `README.md`, `AGENTS.md`, `00_INDICE.md` y guías.

## 4. Por qué se hizo así
- **Renumeración continua:** Evita huecos numéricos que romperían la iteración de la galería y la convención del proyecto de mantener siempre un rango cerrado `[1..N]`.
- **Distribución de packs:** Al tener 29, 30 y 21 stickers, todos los paquetes respetan estrictamente los límites oficiales de WhatsApp (mínimo 3, máximo 30) y no mezclan tipos estáticos con animados.

## 5. Ficheros tocados
- `Stickers Nailong/`: eliminados 2 archivos y renumerados 76.
- `js/02-datos-stickers.js`, `js/03-hero.js`, `js/05-visor-magico.js`, `js/07-sonidos-y-laboratorio.js`, `js/08-minijuego.js`.
- `index.html`, `manifest.json`, `verify_all.py`, `AGENTS.md`, `CHANGELOG.md`, `README.md`, `StickersNailong.apk`.
- `documentacion/` (`00_INDICE.md`, `DECISIONES.md`, `ESTADO_ACTUAL.md`, `CONTEXTO_PROYECTO.md`, `GUIA_DESARROLLO.md`, notas técnicas).
- Código Android externo: `C:\src\nailong_stickers_app\` (`generar_assets.py`, `build.gradle`).

## 6. Verificación
- `python verify_all.py` → 44/44 superados al 100%.
- `python normalizar_stickers.py --check` → 0 stickers con problemas; 80 ya correctos.
- `apksigner verify --verbose StickersNailong.apk` → V1=true, V2=true, V3=true.

## 7. Qué debe saber explicar el usuario
La colección oficial pasó de 82 a 80 cromos al suprimir dos duplicados innecesarios. Toda la web, la app de Android y el minijuego han sido sincronizados a la perfección con la nueva serie continua de 80 stickers sin que ningún enlace o sonido se haya roto.
