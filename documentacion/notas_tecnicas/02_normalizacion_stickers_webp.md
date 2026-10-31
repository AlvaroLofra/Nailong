# Nota Técnica 02: Normalización de Stickers WebP y Formato WhatsApp

> **Subsistema:** Normalizador gráfico de cromos  
> **Script principal:** `normalizar_stickers.py`  
> **Comprobación:** Test 39 en `verify_all.py`

---

## 1. Especificaciones Estrictas de WhatsApp

WhatsApp exige que los archivos de stickers cumplan sin excepción los siguientes parámetros binarios:

| Parámetro | Requisito para Estáticos | Requisito para Animados |
|---|---|---|
| **Dimensiones** | 512 × 512 píxeles exactos | 512 × 512 píxeles exactos |
| **Peso máximo** | $\le$ 100 KB (102.400 bytes) | $\le$ 500 KB (512.000 bytes) |
| **Duración máxima** | N/A | $\le$ 10.000 ms (10 s) |
| **FPS recomendado** | N/A | 8 a 30 FPS |
| **Metadato EXIF** | Chunk EXIF con `sticker-pack-id` | Chunk EXIF con `sticker-pack-id` |
| **Estructura de frames** | Chunk `VP8 ` o `VP8L` | Chunk `VP8X`, `ANIM`, fotogramas `ANMF` con `ALPH` |

---

## 2. El Problema de la Codificación Estándar con Pillow

Al compilar WebP animados con la librería Python `Pillow` estándar:
- Pillow agrupa fotogramas utilizando compresión diferencial o paletas optimizadas.
- La especificación del reproductor nativo de stickers de WhatsApp exige que cada fotograma individual en el chunk `ANMF` posea un chunk de canal alfa `ALPH` completo acompañado de un bloque `VP8 ` de perfil 0.
- Si falta el chunk `ALPH` o la estructura no es canónica, WhatsApp descarta la animación y muestra una imagen estática congelada o un fotograma vacío.

---

## 3. Muxer Binario Dedicado (`build_animated` en `normalizar_stickers.py`)

Para resolver esta limitación, `normalizar_stickers.py` implementa un constructor binario RIFF WebP manual:

1. **Extracción y escalado de frames:**
   Cada fotograma se extrae individualmente, se redimensiona proporcionalmente y se inserta centrado en un lienzo RGBA transparente de 512×512 píxeles.
2. **Codificación de frames independientes:**
   Cada frame se comprime con WebP con compresión con pérdidas pero preservando el canal alfa (`method=6`).
3. **Muxing de bloques RIFF:**
   - Escribe la cabecera `RIFF....WEBP`.
   - Inyecta el chunk de cabecera extendida `VP8X` con los flags `has_animation=1` y `has_alpha=1`.
   - Inyecta el chunk `ANIM` con el color de fondo y el recuento de bucles (`loop_count=0` para bucle infinito).
   - Itera por cada frame ensamblando el chunk `ANMF` con las coordenadas `x=0, y=0, width=512, height=512`, la duración en ms y el sub-bloque con `ALPH` y `VP8 `.
   - Inyecta al final el chunk `EXIF` con el payload de metadatos de WhatsApp.
4. **Verificación de peso dinámico:**
   Si el archivo resultante supera los 500 KB, el script reduce automáticamente la calidad de compresión (90 $\rightarrow$ 80 $\rightarrow$ 70) o decima fotogramas si la tasa de refresco lo permite hasta encajar exactamente dentro del umbral legal de WhatsApp.
