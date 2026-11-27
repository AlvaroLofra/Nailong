# Demo animada de la app (banner de descarga) · 864×1920 → 432×960

Proyecto HyperFrames de la mini demo que se ve dentro del marco de móvil del banner `#android-app-banner`. Es una **recreación** de las pantallas reales de la app (layouts, colores, textos y fuente Fredoka del código Android), no una grabación: lista de packs → «Nailong animado 1» → 3 stickers a «Mi Selección» → Importar → nombre del pack → hoja de WhatsApp → «¡Añadido a WhatsApp!». La hoja de WhatsApp sigue una captura real del usuario (tema oscuro); sus textos están traducidos del inglés.

- **Recursos** (`assets/`, fuera de Git): se generan desde `Stickers Nailong/` (y la Fredoka de la app, si está su código) con
  `py -3 video-promo/app-demo/tools/preparar_assets.py`
- **Comprobar:** `npx hyperframes check` (con el lanzador de la skill) desde esta carpeta.
- **Render** (el ffmpeg de este equipo no trae el filtro `setparams` que usa el render a MP4, así que se sacan PNG y se codifica aparte):
  1. `npx hyperframes render --format png-sequence -o renders/fotogramas`
  2. Desde `video-promo/`:
     `ffmpeg -framerate 30 -i app-demo/renders/fotogramas/frame_%06d.png -vf "scale=432:960:flags=lanczos,format=yuv420p" -r 24 -c:v libx264 -preset veryslow -tune animation -crf 36 -g 1000 -keyint_min 1000 -profile:v high -movflags +faststart -an nailong_app_demo.mp4`
  3. Portada (primer fotograma, igual al último: el bucle no salta): `frame_000001.png` a 432×960, WebP calidad 78 → `nailong_app_demo_portada.webp`.
- `verify_all.py` (test DA1) exige ≤ 600 KB para el MP4 y ≤ 80 KB para la portada.
- Detalles y decisiones: `documentacion/estado_del_proyecto/bitacora_de_sesiones/2026-11-27_demo_app_banner.md`
