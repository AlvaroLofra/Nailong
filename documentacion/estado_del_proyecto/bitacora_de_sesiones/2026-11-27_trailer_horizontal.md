# 2026-11-27 · Tráiler horizontal para ordenador

**Herramienta:** Claude Code (skill de HyperFrames, CLI 0.9.101) · **Rama:** `main` (sin commits) · **Web:** sigue en 4.2.0

## Qué se pidió
Una versión horizontal del vídeo promocional, con el mismo contenido, pensada para verla en ordenador. El usuario eligió **rehacer la colocación de las escenas** (opción A) frente a poner el vertical con un marco a los lados (opción B), y pidió usar la skill de HyperFrames. Integrarla en la web queda **para la 4.3.0** (mejora `V1`).

## Qué se hizo
- **Proyecto nuevo** `video-promo/horizontal/` (HyperFrames, 1920×1080, 60 fps, 32 s). El vertical (`video-promo/index.html` y `compositions/`) no se tocó.
- **Recursos compartidos sin duplicar:** `video-promo/horizontal/assets` es una unión (*junction*) de Windows hacia `../assets` (13 MB de sprites, fotos, música, efectos y fuentes). Está en el `.gitignore` de la carpeta.
- **Mismo guion, sonido y tiempos:** el `index.html` raíz se derivó del vertical cambiando solo el tamaño; música y ~40 efectos con los mismos segundos.
- **Escenas recolocadas a lo ancho:**
  - Saludo, pancita, app y final: personaje o móvil a un lado y títulos al otro.
  - Minijuego: pantalla de juego apaisada (1320×720) y recorridos más largos.
  - Lluvia: cuadrícula de 6×2 con los mismos 12 stickers y «pops».
  - Álbum: título en una línea y el libro al 85 % con el sello encima.
  - App y WhatsApp: el móvil y el dedito van dentro de un marco escalado al 90 %, así los recorridos del dedo no hubo que recalcularlos.
  - Final: **QR de la web nuevo**, generado con `herramientas/generar_qr.py` (es el mismo que usa la web para «Compartir»), y «¡Escanéame con el móvil!».
  - Fondo (capas de 3000 px) y transiciones (muro de nube de 2600 px; pancita centrada en 960,540) adaptados.
- **Resultado:** `video-promo/nailong_trailer_v2_horizontal.mp4` (1920×1080, 60 fps, 32,0 s, 17,1 MB, AAC; volumen medio −18,1 dB, pico −1,0 dB) y `nailong_trailer_v2_horizontal_portada.webp` (960×540, fotograma de 2,9 s).
- **Vista previa:** entrada `trailer-horizontal` en `.claude/launch.json` (puerto 3002).

## Verificación
- `hyperframes check`: 0 errores. Avisos de contraste en los títulos blancos con borde naranja y en «Gratis · Web y app Android»: es el mismo estilo que el vertical y se dejó igual.
- Capturas de cada escena (`hyperframes snapshot`) y hoja de 9 fotogramas sacada del `.mp4` final: textos completos, stickers animados visibles, nube y pancita tapan toda la pantalla en los cortes.
- `py -3 verify_all.py` → `55 VERIFICATION TESTS PASSED, 5 WITH THEIR ANDROID PART NOT CHECKED` (la parte Android de los tests 43, 45, 47, 48 y 50 no se comprueba porque el código de la app no está en este equipo; como siempre).
- **No comprobado:** que el QR del vídeo se lea con un móvil real desde la pantalla; reproducción del `.mp4` en Safari.

## Problema encontrado y cómo se resolvió
El primer render falló: HyperFrames sirve el proyecto desde su carpeta y, por la unión, los scripts `assets/js/sprites.js` y `nailong.js` quedan «fuera del proyecto»; por seguridad solo incluye `.js` externos si se le pide. Solución: renderizar con `--include-outside-files` (son ficheros propios del repositorio) y `--no-best-effort` (falla en vez de sacar un vídeo a medias).

## Cómo retomar
- Recrear la unión si se clona el repositorio en otro equipo (desde `video-promo/horizontal/`): `cmd /c mklink /J assets ..\assets`.
- Vista previa: `preview_start` con `trailer-horizontal`, o `npx hyperframes preview` en `video-promo/horizontal/`.
- Render (desde `video-promo/horizontal/`): `npx hyperframes render --include-outside-files --no-best-effort -o ../nailong_trailer_v2_horizontal.mp4`.
- Portada (desde `video-promo/`): `ffmpeg -ss 2.9 -i nailong_trailer_v2_horizontal.mp4 -frames:v 1 -vf scale=960:540 -c:v libwebp -quality 80 nailong_trailer_v2_horizontal_portada.webp`.
- Si se cambia el vertical (textos, stickers, tiempos), repetir el cambio en `video-promo/horizontal/compositions/` y volver a renderizar los dos.

## Qué queda
- **`V1` (web 4.3.0):** reproductor 16:9 con el horizontal en escritorio y el vertical en móvil; adaptar el test 47 de `verify_all.py`.
- Sin commits: falta guardar en Git `video-promo/horizontal/`, el `.mp4` y la portada, y esta documentación, cuando el usuario lo pida.
