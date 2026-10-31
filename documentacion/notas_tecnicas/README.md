# Notas Técnicas de Subsistemas

> Índice de la documentación técnica profunda por componente del proyecto. Cada nota detalla entradas, salidas, arquitectura interna, peculiaridades de plataforma y causas raíz de fallos resueltos.

---

## Catálogo de Notas Técnicas

| Nota | Subsistema | Componentes Involucrados | Temas Clave |
|---|---|---|---|
| [`01_app_android_whatsapp_stickers.md`](01_app_android_whatsapp_stickers.md) | **App Android Nativa** | `StickerContentProvider`, `DynamicPackManager`, Activities | ContentProvider, Intents de WhatsApp, Mi Selección, control de eventos táctiles. |
| [`02_normalizacion_stickers_webp.md`](02_normalizacion_stickers_webp.md) | **Optimización Gráfica** | `normalizar_stickers.py`, `verify_all.py` | Especificación RIFF WebP, muxer binario de fotogramas, chunks EXIF, compresión. |
| [`03_web_audio_sintetizado.md`](03_web_audio_sintetizado.md) | **Motor de Audio** | `index.html` (Web Audio API) | Síntesis algorítmica por osciladores, modulación FM/AM, ausencia de MP3/WAV. |
| [`04_minijuego_y_rendimiento_gpu.md`](04_minijuego_y_rendimiento_gpu.md) | **Renderizado GPU y Canvas** | `index.html` (Canvas 2D) | Ciclo de 60 FPS, rasterizado offscreen de emojis, pantalla completa y gestión de memoria. |
