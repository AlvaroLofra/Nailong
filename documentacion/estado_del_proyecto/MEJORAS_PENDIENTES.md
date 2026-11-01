# Mejoras pendientes (visuales y de interfaz)

> Lista viva de ideas **no aplicadas** detectadas en la revisión a fondo del 2026-11-01 (v3.3.2). Los fallos internos encontrados en esa revisión ya se corrigieron (ver `CHANGELOG.md` → 3.3.2). Al aplicar una mejora, bórrala de aquí y anótala en el CHANGELOG.

## App Android

| # | Qué | Por qué | Esfuerzo |
|---|---|---|---|
| A1 | Si cancelas «Añadir a WhatsApp», sale «actualiza WhatsApp» (`StickerPackNotAddedMessageFragment`, heredado del ejemplo de Meta). | El mensaje confunde: no hace falta actualizar nada. Mejor «No se añadió el pack. ¿Probar otra vez?». | Bajo |
| A2 | No hay forma de borrar los packs de «Mi Selección» antiguos dentro de la app. | Cada importación crea una carpeta nueva (`selection_packs/seleccion_N`) que se queda para siempre. Una pantalla «Mis packs» con papelera solucionaría el espacio. | Medio |
| A3 | El aviso de versión nueva podría mostrar el peso de la descarga y la fecha. | Así el usuario sabe si le conviene descargar con datos móviles. Requiere añadir `sizeMB` a `version.json`. | Bajo |
| A4 | Tocar el número de versión de abajo podría buscar actualizaciones a mano. | Ahora solo se comprueba al abrir la app. | Bajo |
| A5 | El icono 🔄 del aviso «App actualizada» se ve como un botón gris del sistema. | Una ilustración de Nailong (un sticker o el `tray.png`) encaja mejor con el estilo. | Bajo |
| A6 | Mantener pulsado para ampliar un sticker solo se explica en el texto de abajo. | Poco descubrible: un aviso la primera vez que se abre un pack ayudaría. | Bajo |
| A7 | Mientras se prepara «Mi Selección» sale un diálogo de texto simple («Preparando tu pack… ✨»). | Funciona, pero un diálogo con el estilo *clay* y una barra de progreso quedaría más integrado. | Bajo |

## Web

| # | Qué | Por qué | Esfuerzo |
|---|---|---|---|
| W1 | El banner de la app podría enseñar las novedades de `version.json` («Novedades de la 3.3.2»). | Ya existe el texto; reutilizarlo evita escribirlo dos veces. | Bajo |
| W2 | La etiqueta «Descargar APK (26 MB)» se escribe a mano. | Es fácil olvidarla al publicar. Se podría sacar de `version.json` o comprobar en `verify_all.py`. | Bajo |
| W3 | Aviso de Tailwind por CDN en la consola. | Es la decisión abierta D-15 (fijar versiones del CDN o compilar). | Medio |
| W4 | El minijuego sigue animándose aunque el usuario haya hecho scroll y no se vea. | Pausarlo fuera de pantalla (IntersectionObserver) ahorraría batería. Ahora solo se pausa el reloj con la pestaña oculta. | Bajo |
| W5 | Botón «Copiar enlace de la app» junto a la descarga del APK. | Para compartir la app por WhatsApp sin pasar por la web. | Bajo |

## Vídeo promocional
- La versión 2 se trabaja aparte (`video-promo/PROPUESTA_V2.md`).
