# Nota Técnica 02: Normalización de Stickers WebP y Formato WhatsApp

> **Subsistema:** Normalizador gráfico de cromos  
> **Script principal:** `normalizar_stickers.py`  
> **Comprobación:** Tests 39 y 50 en `verify_all.py`

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

---

## 4. Bucle infinito (contador del chunk `ANIM`, v3.6.1, D-22)

Los bytes 4–5 del contenido del chunk `ANIM` guardan cuántas veces se repite la animación: **0 = para siempre**. Un sticker que llega de fuera con otro valor (como `sticker_6`, que traía un 1) se reproduce una vez y se congela en el navegador, en el zoom de la app (Fresco respeta el contador) y en WhatsApp.

- `--check` lo informa como problema en cualquier animado, también en los originales 1–42.
- Sin `--check`, si es el único problema, `fix_loop()` reescribe solo esos 2 bytes: la imagen no se re-codifica ni pierde calidad.
- El test 50 lo comprueba en `Stickers Nailong/` y en `assets/` de la app (incluidas las vistas previas y las variantes animadas de los estáticos).
- Si se cambia un sticker que ya está en la app, hay que subir `image_data_version` de su pack en `contents.json` para que WhatsApp lo refresque.

## 5. Detector de repetidos (`--clasificar` y `--descartar`, 2026-11-15)

**Para qué:** al bajar stickers de TikTok se descargan todos una y otra vez; el detector separa los que ya están en la colección de los nuevos, sin llevar la cuenta a mano.

```bash
python normalizar_stickers.py --clasificar "ruta/a/descargas"     # reparte copias en _nuevos, _repetidos, _dudosos
python normalizar_stickers.py --import "ruta/a/descargas/_nuevos" # añade los nuevos al catálogo
python normalizar_stickers.py --descartar "ruta/a/uno.webp"       # «este no lo quiero»: no vuelve a salir como nuevo
```

- No borra ni mueve las descargas originales: las tres subcarpetas contienen **copias** y se rehacen en cada pasada.
- `_informe.html` (dentro de la carpeta de descargas) muestra cada descarga junto al sticker con el que coincide. Los **dudosos** hay que mirarlos ahí y mover a `_nuevos` los que de verdad sean distintos.
- Un sticker repetido dentro de la propia carpeta entra una sola vez en `_nuevos`.

**Cómo compara (`firma()` y `distancia()`):**
- Firma: hasta 8 fotogramas repartidos por la animación, llevados a 512×512 con `to_square()` (igual que al importar), transparencia rellena de blanco, reducidos a 32×32 en color.
- Distancia: diferencia media de color (0 = idénticos), emparejando cada fotograma con el más parecido del otro sticker, en los dos sentidos. Un solo fotograma parecido no basta, así dos stickers de la misma escena no se confunden.
- Umbrales (`UMBRAL_REPETIDO`, `UMBRAL_DUDOSO`): por debajo del primero, repetido; entre ambos, dudoso. Calibrados con el catálogo real; el margen medido se imprime en la salida del test del detector en `verify_all.py`.
- Se compara contra el catálogo, los `descatalogado_*.webp` y los descartados.

**Memoria entre pasadas:**
- `herramientas/stickers_vistos.json`: huella exacta (SHA-256) de cada descarga ya reconocida como repetida o descartada. Una descarga idéntica se resuelve al instante.
- `herramientas/stickers_descartados.npz`: firmas de los descartados, para reconocerlos aunque lleguen re-codificados.
- Ambos ficheros se crean con el primer uso. Las firmas del catálogo se guardan en una caché de la carpeta temporal del sistema (la primera pasada tarda unos 20 s; las siguientes, casi nada).

**No comprobado:** descargas reales de TikTok (las pruebas usan copias reducidas generadas aquí). Si un original real saliera como «dudoso» de forma habitual, hay que subir `UMBRAL_REPETIDO` sin superar el margen que vigila el test.
