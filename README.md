# ¡El Mundo Mágico de Nailong (奶龙)! 🦖

Sitio web interactivo y animado dedicado a **Nailong (奶龙)**, el dragón de leche amarillo creado por *Seventh Impression*.

🌐 **Enlace web en vivo:** [https://alvarolofra.github.io/Nailong/](https://alvarolofra.github.io/Nailong/)

---

## Características Principales

- **Hero Interactivo & Contador Duang:** Pancita con físicas elásticas, efectos de sonido y 9 estados de ánimo en vivo.
- **Visor Mágico de Animaciones:** Galería de escenas GIF en bucle con control de velocidad y pegatinas arrastrables.
- **Gran Álbum Polaroid:** Catálogo de 82 cromos auténticos clasificados por categorías, visor a pantalla completa y subida de fotos del usuario con guardado persistente local.
- **Botonera Musical:** 12 casillas con efectos de caricatura sintetizados en tiempo real mediante la Web Audio API.
- **Laboratorio de Superpoderes:** Ajuste de tamaño, modo camaleón con ciclo arcoíris y lanzamiento de llamaradas en canvas.
- **Minijuego "La Gran Comilona":** Juego arcade en HTML5 Canvas con pantalla completa fluida, controles táctiles y teclado.
- **Diseño Mobile-First (PWA):** Adaptación a Dynamic Island, gestos swipe y soporte para instalación en la pantalla de inicio en iOS y Android.

---

## Estructura del Proyecto

```text
├── index.html                   # Aplicación web definitiva (SPA autónoma para GitHub Pages)
├── manifest.json                # Manifiesto PWA para instalación en dispositivos móviles
├── DOCUMENTACION.md             # Documentación técnica de arquitectura, código y registros ADR
├── GEMINI.md                    # Contexto y directrices de desarrollo para modelos Gemini
├── CLAUDE.md                    # Contexto y directrices de desarrollo para modelos Claude
├── verify_all.py                # Suite de pruebas automatizadas (40 verificaciones)
└── Stickers Nailong/            # Banco de 82 cromos en WebP + foto optimizada del creador
```

---

## Historial de Versiones & Notas del Parche

### v1.0.0 - Lanzamiento Inicial
- ¡Estreno oficial de la web interactiva de Nailong!
- Pancita elástica con sonidos y estados de ánimo interactivos.
- Visor Mágico de animaciones y Gran Álbum con 42 cromos.
- Botonera de sonidos divertidos y laboratorio de superpoderes.
- Minijuego arcade para atrapar comida.

### v2.0.0 - Compartir y Amigos
- ¡Llegamos a la web! Estreno del enlace oficial en línea.
- Nuevo botón para compartir la web al instante con tus amigos.
- Código QR interactivo para escanear y abrir desde cualquier móvil.

### v3.0.0 - Optimización General
- Gran optimización de rendimiento para una carga mucho más rápida.
- Mejoras de estabilidad general en toda la web.

### v4.0.0 - Sección del Creador y Galería Propia
- Nueva sección especial: ¡el creador de la web junto a Nailong!
- Ahora puedes subir tus fotos y se guardan automáticamente en tu dispositivo.
- Control gestual en móviles: desliza el dedo hacia los lados para cambiar de cromo o escena.

### v5.0.0 - Nuevo Motor para el Modo Fiesta
- Nuevo motor gráfico para la lluvia de confeti: ¡ahora funciona a 60 FPS súper fluidos!
- Efectos visuales más suaves y optimizados sin ralentizar la pantalla.

### v6.0.0 - Acompañante Nailong Mejorado
- Nailong flotante optimizado: ahora te acompaña y comenta con animaciones más suaves al navegar.
- Mejoras visuales y retoques en la sección del creador.

### v7.0.0 - Pantalla Completa y Modo Arcade
- ¡Nuevo modo pantalla completa en el minijuego para jugar a lo grande!
- Controles del minijuego renovados: movimiento mucho más rápido y ágil estilo arcade.
- Se corrige el error que detenía el minijuego inesperadamente.
- Se soluciona el problema donde a veces no caía confeti en el Modo Fiesta.
- Nuevo avatar animado en 3D en la cabecera con la gran sonrisa de Nailong.

### v8.0.0 - Mejoras en el Minijuego y Modo Móvil
- Marcador de puntos y cronómetro visibles en todo momento dentro de la partida.
- Nuevos botones táctiles integrados para jugar cómodamente en pantalla completa desde el móvil.
- Mejor adaptación del minijuego al girar la pantalla o cambiar de resolución.
- El avatar de la barra superior ahora se ve centrado y nítido en todo momento.

### v9.0.0 - Stickers para WhatsApp y Descarga Universal
- ¡Botón directo de WhatsApp! Envía cualquier sticker a un chat con 1 toque para guardarlo en Favoritos ⭐.
- Descarga directa de stickers totalmente compatible con iPhone, iPad y Android.
- Nuevo menú rápido con opciones: enviar a WhatsApp, descargar o copiar al portapapeles.
- Nuevos avisos flotantes animados al guardar o copiar stickers.

### v10.0.0 - Optimización y Rendimiento
- Reducción en los tiempos de carga gracias a la optimización de archivos.
- Mayor fluidez y compatibilidad garantizada en todos los navegadores.

### v11.0.0 - Mejoras Visuales y Físicas Duang
- Ventana de stickers más limpia, con vista previa ampliada y botones más grandes y accesibles.
- Nuevo cartel destacado en el álbum explicando cómo guardar stickers en WhatsApp.
- Foto del creador ampliada con botón interactivo de rebote elástico y explosión de emojis.
- Nailong ahora aparece en grande nada más entrar en la página en dispositivos móviles.
- Mejoras de estabilidad general en toda la web.

### v12.0.0 - Rendimiento, UX Móvil y Accesibilidad
- El rendimiento general mejora hasta un 50%: animaciones más fluidas y menor consumo de batería.
- Álbum paginado con botón «Ver más cromos» para explorar la colección cómodamente.
- Tus fotos personalizadas ya no se pierden al recargar y ahora puedes eliminarlas con el botón 🗑️.
- Mejor experiencia en smartphones: álbum en 2 columnas, filtros deslizables y controles táctiles más limpios.
- Opciones de accesibilidad añadidas y soporte para modo de movimiento reducido.

### v13.0.0 - Colección Ampliada a 72 Cromos
- ¡30 nuevos cromos animados añadidos al Gran Álbum con divertidos sonidos y categorías!
- Catálogo ampliado hasta los 72 stickers coleccionables.
- El botón «Ver más cromos» ahora muestra más stickers a la vez en PC y tablets.
- Se corrige un problema que impedía descargar y compartir uno de los cromos de la colección.
- Retoques visuales y mayor nitidez en varios stickers.

### v14.0.0 - Stickers Compatibles con WhatsApp
- Primeros pasos para enviar los stickers a WhatsApp con su formato oficial (512×512).
- Limpieza de cromos repetidos y ampliación del catálogo oficial.

### v15.0.0 - Segunda Tanda de Stickers
- ¡10 nuevos stickers animados añadidos a la colección!
- El álbum alcanza ya los 82 cromos oficiales listos para coleccionar y enviar a WhatsApp.

### v16.0.0 (Actual) - Álbum más ágil y mejoras para WhatsApp
- El botón «Ver más cromos» ahora carga 24 cromos de golpe también en el móvil.
- Tarjetas y visor más limpios: se quita el número de fotogramas de los stickers animados.
- Nueva marca de versión discreta al final de la página.
- Stickers animados reconstruidos con una estructura más compatible con WhatsApp y nueva herramienta interna para importar stickers de TikTok.

---

*Hecho con cariño para todos los fans de Nailong (奶龙)* 💛
