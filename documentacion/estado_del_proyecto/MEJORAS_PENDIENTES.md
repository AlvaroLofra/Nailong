# Mejoras pendientes (visuales y de interfaz)

> Lista viva de ideas **no aplicadas**. Las A1–A7 y W1–W5 de la revisión de la v3.3.2 se aplicaron en la **v3.3.3** (ver `CHANGELOG.md`). Estas son las que salieron al probarlas en el emulador y en el navegador el 2026-11-01. Al aplicar una, bórrala de aquí y anótala en el CHANGELOG.

## App Android

| # | Qué | Por qué | Esfuerzo |
|---|---|---|---|
| A8 | La imagen del aviso «¡App actualizada!» tiene esquinas rectas. | Con esquinas redondeadas (`RoundingParams` de Fresco) encajaría con las tarjetas *clay*. | Bajo |
| A9 | El «+» del botón verde «Añadir a WhatsApp» es verde azulado sobre verde. | Se distingue poco; mejor blanco como el texto. | Bajo |
| A10 | En el diálogo «Personaliza tu pack», el botón se corta («Añadir a What…»). | En pantallas normales no cabe el texto: acortarlo a «Añadir» o bajar el tamaño de letra. | Bajo |
| A11 | Al abrir un pack de «Mi Selección» los stickers animados se descodifican a 512 px. | No tienen vistas previas de 192 px (se crean al vuelo). Con 30 animados podría volver el tirón; se podrían generar miniaturas al crear el pack. | Medio |
| A12 | Los packs de «Mi Selección» no se distinguen de los oficiales en la lista. | Una etiqueta «Tuyo» o un color distinto ayudaría, y recordaría que se pueden borrar. | Bajo |
| A13 | «Ver stickers» pasó de amarillo a crema con borde (el diseño real del botón, que el tema tapaba). | Revisar si gusta más así o si se prefiere el amarillo; ahora es una decisión de estilo, no un fallo. | Bajo |

## Web

| # | Qué | Por qué | Esfuerzo |
|---|---|---|---|
| W6 | En el ordenador, «Copiar enlace» podría enseñar también un QR. | Así se escanea con el móvil y se descarga la app directamente. Ya hay un QR en el modal de compartir que se puede reutilizar. | Bajo |
| W7 | Si se cambia un `js/` sin cambiar el `?v=`, el navegador sigue usando el viejo. | Pasó al probar la v3.3.3. Recordatorio de proceso: cambiar el `?v=` en cada publicación (ya lo exige AGENTS.md). | — |
| W8 | El aviso de Tailwind en la consola sigue saliendo. | Es propio del CDN; quitarlo exigiría compilar Tailwind (rompe «sin build», D-15). | Medio |

## Vídeo promocional
- La versión 2 ya está publicada en la web (`video-promo/nailong_trailer_v2.mp4`). Detalles en `video-promo/PROPUESTA_V2.md`.
