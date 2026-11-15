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
| W11 | Pasar a clave estable (`data-sticker`, D-22) el resto de imágenes fijadas por número: hero y muñeco acompañante (`index.html`, `js/03-hero.js`), disfraces del laboratorio y botonera (`js/07-sonidos-y-laboratorio.js`), visor mágico (`js/05-visor-magico.js`), favicon y `og:image`. Revisar antes con el usuario las que no encajan con su etiqueta: «Bailarín» → 6 (Chef Pastelero), «Superalas» → 90 (DJ con gafitas), «Palomitas» → 55 (Dino disfrazado), «¡Llamita Bebé!» → 32 (*gasp* ofendido). | Así ninguna imagen se desplaza en la próxima renumeración; hoy solo «¿Quién es Nailong?» está protegida. | Bajo–medio |

### Modernización web (propuestas por Google Antigravity + plugin `Modern Web Guidance`, 2026-11-14)

> Ideas propuestas mediante auditoría con este sistema (Google Antigravity) y el plugin **Modern Web Guidance** (`modern-web-guidance`, revisión 2026-11-14). Pendientes de revisión e implementación; no se ha modificado código.

| # | Qué | Por qué | Esfuerzo |
|---|---|---|---|
| W12 | Migrar los 4 modales (`#magic-modal`, `#photo-lightbox`, `#sticker-options-modal`, `#share-modal` en `index.html`) de `<div role="dialog" aria-modal="true">` a `<dialog>` nativo con `showModal()` y `closedby="any"` (sustituyendo `setupModalBackdrops()` en `js/09-modo-fiesta.js:305`, con respaldo por coordenadas para Safari). | El navegador gestiona de forma nativa la capa superior (*top layer*), trampa de foco, fondo `inert`, cierre con `Esc`/gesto atrás y clic en el telón sin listeners manuales. *(Revisar antes si `verify_all.py` comprueba `role="dialog"` explícito).* | Medio |
| W13 | Bloquear el scroll bajo modales solo con CSS (`overscroll-behavior: contain` en `dialog:modal` y `overflow: hidden; overscroll-behavior: contain` en `dialog::backdrop`). | Elimina `body.modal-open { overflow: hidden; }` (`css/styles.css`) y `setupModalScrollLock()` con `MutationObserver` (`js/10-inicio.js`), evitando saltos de diseño al desaparecer la barra de scroll. | Bajo |
| W14 | Animar la entrada y salida de los modales en el *top layer* con CSS moderno (`@starting-style`, `overlay`, `transition-behavior: allow-discrete`). | Permite transiciones suaves al abrir y cerrar `<dialog>` nativo sin coordinar temporizadores en JS. | Bajo |
| W15 | Diferir el renderizado de secciones pesadas bajo el pliegue (`#galeria`, `#soundboard`, `#poderes`, `#minijuego`, `#creador`) mediante `content-visibility: auto` y `contain-intrinsic-size`. | Evita calcular layout y pintura iniciales del álbum completo y tarjetas hasta que el usuario se acerca haciendo scroll, acelerando la carga inicial. | Bajo |
| W16 | Migrar las apariciones de `.reveal-item` (`css/styles.css`, `setupScrollObserver()` en `js/10-inicio.js`) a Scroll-Driven Animations en CSS (`animation-timeline: view()` y `animation-range: entry` bajo `@supports`), dejando `IntersectionObserver` solo como respaldo. | Ejecuta la animación en el hilo compositor fuera del hilo principal JS en navegadores compatibles. | Bajo |
| W17 | Añadir `loading="lazy"` y atributos enteros `width` y `height` explícitos al tráiler `#trailer-video` (`index.html`), manteniendo un respaldo con `IntersectionObserver` para Firefox/Safari. | Evita descargar el póster y las cabeceras del MP4 antes de que el usuario llegue a esa sección y previene cambios de diseño (*CLS*). | Bajo |
| W18 | Ajustar prioridades de carga de imágenes: añadir `loading="lazy"` en las tiras del Visor Mágico (`js/05-visor-magico.js`) y `fetchpriority="low"` en imágenes inicialmente ocultas (`#apk-qr-img` y modales), manteniendo `fetchpriority="high"` solo en `#hero-nailong-img`. | Reserva ancho de banda prioritario para el héroe por encima del pliegue y reduce competencia de red. | Bajo |
| W19 | Estandarizar la barra de scroll con `scrollbar-color` y `scrollbar-width` (`css/styles.css`), envolviendo las reglas `::-webkit-scrollbar` en `@supports not (scrollbar-color: auto)` y verificando contraste `>= 3:1`. | Garantiza soporte uniforme en Firefox y Safari además de Chromium. | Bajo |
| W20 | Invertir el manejo de movimiento reducido a enfoque *opt-in* (`@media (prefers-reduced-motion: no-preference)`) en `css/styles.css` y valorar un control visible para pausar animaciones continuas de más de 5 s (partículas/bucles). | Refuerza accesibilidad y cumplimiento de `prefers-reduced-motion` desde el inicio sin depender de anulaciones posteriores. | Bajo–medio |

## Nailong 3D
| # | Qué | Por qué | Esfuerzo |
|---|---|---|---|
| 3D1 | Pelusilla aterciopelada (*peach fuzz*) en el shader de la piel. | Los stickers tienen un ligero pelo que el *sheen* solo imita. | Medio |
| 3D2 | Más expresiones: lengua fuera, bostezo, risa con ojos cerrados (^ ^). | Hay muchos stickers con esas caras. | Medio |
| 3D3 | Crear un sticker 512×512 WebP desde la pose actual. | Conecta el 3D con la colección de stickers. | Medio |
| 3D4 | Vista en realidad aumentada (`model-viewer`/USDZ). | Ver a Nailong en tu mesa desde el móvil. | Alto |

## Vídeo promocional
- La versión 2 ya está publicada en la web (`video-promo/nailong_trailer_v2.mp4`).
