# Tráiler v2 · versión horizontal (1920×1080)

Proyecto HyperFrames de la versión para ordenador del tráiler. Mismo guion, música y tiempos que el vertical (`../index.html`); solo cambia la colocación de cada escena.

- `assets` es una unión de Windows hacia `../assets` (no se sube a Git). Si falta: `cmd /c mklink /J assets ..\assets`
- Render (los scripts compartidos están fuera de la carpeta, por eso hace falta `--include-outside-files`):
  `npx hyperframes render --include-outside-files --no-best-effort -o ../nailong_trailer_v2_horizontal.mp4`
- Detalles y portada: `documentacion/estado_del_proyecto/bitacora_de_sesiones/2026-11-27_trailer_horizontal.md`
