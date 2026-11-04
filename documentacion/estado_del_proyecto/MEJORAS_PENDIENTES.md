# Mejoras pendientes (visuales y de interfaz)

> Lista viva de ideas **no aplicadas**.
> - Las A1–A7 y W1–W5 de la revisión de la v3.3.2 se aplicaron en la **v3.3.3** (ver `CHANGELOG.md`).
> - Las A8–A13 y W6–W7 (junto con el zoom grande centrado con transición y el botón «Ver (N) ❯» para revisar «Mi Selección») se aplicaron en la **v3.5.0** (ver `CHANGELOG.md`).

## Web

| # | Qué | Por qué | Esfuerzo |
|---|---|---|---|
| W8 | El aviso de Tailwind en la consola sigue saliendo. | Es propio del CDN; quitarlo exigiría compilar Tailwind (rompe «sin build», D-15). | Medio |
| W9 | Las frases del muñeco acompañante (`js/04-navegacion.js`) dependen de umbrales fijos de scroll en píxeles; con la sección 3D nueva quedan desplazadas (p. ej. habla del Visor Mágico estando en el 3D). | Pasar a detectar la sección visible (como el *scrollspy*) y añadir una frase para el 3D. | Bajo |
| W10 | A 1024–1100 px el menú de escritorio ya no cabía antes de la sección 3D (con la fuente de respaldo del entorno de pruebas; no comprobado con Fredoka real). | Compactar el menú en `lg` o pasar algún enlace a un submenú. | Bajo |

## Nailong 3D
| # | Qué | Por qué | Esfuerzo |
|---|---|---|---|
| 3D1 | Pelusilla aterciopelada (*peach fuzz*) en el shader de la piel. | Los stickers tienen un ligero pelo que el *sheen* solo imita. | Medio |
| 3D2 | Más expresiones: lengua fuera, bostezo, risa con ojos cerrados (^ ^). | Hay muchos stickers con esas caras. | Medio |
| 3D3 | Crear un sticker 512×512 WebP desde la pose actual. | Conecta el 3D con la colección de stickers. | Medio |
| 3D4 | Vista en realidad aumentada (`model-viewer`/USDZ). | Ver a Nailong en tu mesa desde el móvil. | Alto |

## Vídeo promocional
- La versión 2 ya está publicada en la web (`video-promo/nailong_trailer_v2.mp4`).
