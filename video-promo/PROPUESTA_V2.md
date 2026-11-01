# Propuesta: tráiler v2 de Nailong

> **Estado:** propuesta pendiente de aprobación. Todavía no se ha construido ni renderizado nada.
> **Qué sustituiría:** el tráiler actual (`nailong_trailer_oficial.mp4`, 17 s, 4 escenas), que **no se toca** hasta que el nuevo esté aprobado.

---

## 1. La idea en una frase

Un vídeo vertical de **unos 29 segundos** en el que Nailong salta por un **cielo de cuento** y nos enseña su mundo: saluda, nos deja tocarle la pancita, llueven sus stickers, se abre el álbum, jugamos, lo mandamos por WhatsApp y nos invita a jugar.

**Lo que queremos que recuerde quien lo vea:** «Hay una web y una app gratis de Nailong con un montón de stickers que se mueven, y se puede jugar».

**Por qué así:** el vídeo actual va bien de contenido, pero es lento (escenas de 4–5 s) y el fondo amarillo plano lo hace monótono. En TikTok o Reels se decide en un segundo si seguir mirando; por eso la v2 cambia de plano cada 1–2 s, como un dibujo animado infantil que no para quieto.

---

## 2. Ficha técnica

| Concepto | Valor |
|---|---|
| Formato | Vertical 1080 × 1920, 30 fotogramas por segundo |
| Duración | ~29 s (7 escenas, planos de 1–2 s) |
| Herramienta | HyperFrames (el mismo sistema que el tráiler actual: páginas web animadas con GSAP que se convierten en vídeo) |
| Tipografía | **Fredoka** (redondita, infantil). Hay que descargar el fichero de la fuente (licencia libre OFL) a `video-promo/assets/fonts/` → **pido permiso antes** |
| Música | Melodía original nueva, sin bucle, con principio, estribillo y final (ver §6) |
| Zona segura | Todo texto entre los píxeles 168 y 1330 de alto, para que no lo tapen los botones de TikTok/Reels |

---

## 3. El estilo visual («el cielo de Nailong»)

Piensa en un cuento ilustrado para niños pequeños: colores pastel, todo blandito, todo rebota.

- **Fondo:** cielo azul clarito que se degrada a amarillo crema abajo. Tres capas de **nubes blancas** que se mueven a distinta velocidad (las de delante más rápido), lo que da sensación de profundidad, como mirar por la ventanilla de un coche.
- **Arcoíris:** aparece dibujándose de un lado a otro en la escena 1 y vuelve en el final.
- **Texto que bota:** cada letra cae desde arriba por separado y rebota al aterrizar, una detrás de otra (0,04 s entre letras). Letras blancas con borde naranja grueso, como pegatinas.
- **Stickers con «squash & stretch»:** al entrar, cada sticker se estira mientras cae, se aplasta al tocar el suelo y recupera la forma con un rebotito. Es el truco clásico de los dibujos animados para que algo parezca blandito y vivo (como una pelota de goma).
- **Adornos:** estrellitas que destellan y burbujas que suben. Pocos y con motivo (salen cuando pasa algo), no flotando todo el rato, para que no parezca una plantilla.
- **Transiciones:** dos tipos, alternados para no repetir:
  - **Barrido de nube:** una nube enorme cruza la pantalla y, al pasar, ya estamos en la escena siguiente.
  - **Barrido de pancita:** la pancita crema de Nailong crece desde el centro hasta llenar la pantalla y se abre a la escena nueva.
- **Paleta** (la de la web): amarillo `#FFE66D`, crema `#FFFBEA`, naranja `#FF8A00`, azul cielo `#BDE6FF`, rosa arcoíris `#FFB3C7`.

**Lo que evitamos a propósito:** los desenfoques (`blur`) y las sombras difuminadas grandes que usa el tráiler actual. Son muy pesados para la gráfica integrada de este equipo (el pantallazo azul que acaba de haber vino justo de saturarla) y además no aportan al estilo «dibujo plano».

---

## 4. Storyboard (7 escenas)

La música va a 120 pulsos por minuto: un compás = 2 s. Las escenas empiezan en compás para que los cambios caigan con la música.

| # | Tiempo | Escena | Qué se ve | Sonido |
|---|---|---|---|---|
| 1 | 0,0 – 3,5 s | **Nailong saluda** | Fotograma 0 (miniatura del vídeo): Nailong ya está en el centro, sobre el cielo. Saluda con los brazos (sticker 58). El arcoíris se dibuja detrás. Rebota letra a letra: **«¡Hola! Soy Nailong»**. A los 2 s, plano más cerrado de su cara sonriendo (sticker 2). | Intro: campanita en el primer fotograma, «boing» cuando aterriza el texto |
| 2 | 3,5 – 7,5 s | **Pancita elástica** | Barrido de nube. Un dedito (círculo blanco) toca la pancita (sticker 19): se aplasta y rebota como gelatina, 3 toques al ritmo. Salen «+1 +2 +3» en burbujas. Texto: **«¡Tócame la pancita!»**. Último toque: risa (sticker 13). | Un «boing» por toque, con tono que sube en cada uno |
| 3 | 7,5 – 12,0 s | **Lluvia de stickers** | Empieza el estribillo. Caen 12 stickers animados desde arriba, en cascada, y aterrizan con aplastamiento por toda la pantalla, cada uno moviéndose. Texto grande: **«¡96 stickers!»** y debajo **«¡y se mueven!»**. | Un «pop» por sticker que aterriza (3 variantes alternadas) |
| 4 | 12,0 – 16,0 s | **El álbum se abre** | Barrido de pancita. Un álbum de tapas naranjas se abre como un libro (giro 3D de la tapa). Las páginas pasan rápido (3 pasadas, 0,5 s cada una) y se ven las casillas llenándose de cromos. Texto: **«¡Colecciónalos todos!»**. | «Fruuup» de página en cada pasada y campanita al completarse |
| 5 | 16,0 – 20,0 s | **Minijuego** | Barrido de nube. Pantalla de **«¡La Gran Comilona!»**: una cesta va de lado a lado atrapando comida que cae; una bomba pasa de largo. Nailong comiendo palomitas (sticker 18) celebra en la esquina. Marcador que sube: 10 → 20 → 30. Texto: **«¡Juega y gana!»**. | «Ñam» al atrapar cada cosa, mini fanfarria al final |
| 6 | 20,0 – 24,0 s | **La app con WhatsApp** | Estribillo final. Un móvil entra rebotando. Dentro, la app de stickers con los **4 packs**; se pulsa «Añadir a WhatsApp» y aparece un chat donde llega un sticker de Nailong riendo (sticker 72) como mensaje. Texto: **«¡Mándalos por WhatsApp!»**. | «Pop» al pulsar, sonido de mensaje enviado al llegar |
| 7 | 24,0 – 29,0 s | **¡Juega ya!** | Barrido de pancita. Nailong da un salto gigante con los brazos arriba (sticker 44), vuelve el arcoíris y salen estrellitas. Texto que bota: **«¡Juega ya!»**. Debajo, en una píldora blanca: **alvarolofra.github.io/Nailong/** y **«Gratis · Web y app Android»**. Se mantiene quieto los últimos 2 s para que dé tiempo a leer la dirección. | Final de la canción con acorde largo + campanita |

> Las frases son propuesta: si prefieres otros textos, se cambian sin tocar nada más. Todas son afirmaciones verdaderas del proyecto (96 stickers, 4 packs, gratis, minijuego «La Gran Comilona»).

---

## 5. Stickers animados que usaría

He revisado los 96 uno a uno. Me quedo solo con **animados** y **sin texto incrustado** (varios traen subtítulos de TikTok, como «Stop!» o letras chinas, que quedarían raros).

| Escena | Sticker | Nombre en la web | Por qué |
|---|---|---|---|
| 1 Saludo | **58** | Saludando por el Caminito | Cuerpo entero, brazos arriba: el saludo más claro |
| 1 Saludo | **2** | Sonrisa Radiante 3D | Primer plano de cara para el segundo plano |
| 2 Pancita | **19** | Paseo Saltarín Duang | Se le ve la pancita botar |
| 2 Pancita | **13** | Risas a Carcajadas | La reacción al último toque |
| 3 Lluvia | **10** | Baile de las Maracas Duang | |
| 3 Lluvia | **9** | Haciendo Burlitas ¡Bleh! | |
| 3 Lluvia | **20** | ¡Uoooh! ¡Qué Sorpresa! | |
| 3 Lluvia | **34** | El Baile del Capitán Pirata | |
| 3 Lluvia | **47** | ¡Gritos de Alegría en el Jardín! | |
| 3 Lluvia | **63** | Corazoncito Brillante | |
| 3 Lluvia | **64** | Sandía en la Tumbona | |
| 3 Lluvia | **77** | ¡Sonrisa de Dientes Brillantes! | |
| 3 Lluvia | **79** | Susto de Medianoche | |
| 3 Lluvia | **87** | Pasmado en el Parque | |
| 3 Lluvia | **91** | DJ Nailong con Gafitas de Fiesta | |
| 3 Lluvia | **92** | Viaje Mágico en Autobús | |
| 4 Álbum | 24, 25, 31, 60, 75 | (rellenan las casillas) | Variedad de colores de fondo |
| 5 Minijuego | **18** | Atracón de Palomitas en el Cine | Encaja con «comilona» |
| 6 WhatsApp | **72** | ¡Qué Risa Bajo el Cielo Azul! | El sticker «enviado» en el chat |
| 7 Final | **44** | ¡Brazos Arriba, a Bailar! | Celebración final |

Descartados por traer texto incrustado: 40, 54, 55, 62, 65, 80, 94, 96 (y 43 por bandas negras).

---

## 6. Música y efectos

**Qué falla en la actual:** `nailong_theme.wav` es un bucle corto que se repite durante 17 s sin principio ni final; por eso suena a «tono de móvil».

**Propuesta (lo que se pidió):** una canción original de ~29 s escrita por un script en `video-promo/tools/` que genera el `.wav`. No se descarga nada.

| Parte | Tiempo | Cómo suena |
|---|---|---|
| Intro | 0 – 4 s | Caja de música sola (campanitas), tocando las 4 primeras notas de la melodía |
| Estrofa | 4 – 8 s | Entra un bajo saltarín y palmas suaves |
| Estribillo | 8 – 16 s | La melodía principal completa, con xilófono y acordes alegres (do mayor) |
| Puente | 16 – 20 s | Más ligero y juguetón para el minijuego (notas cortitas, «pizzicato») |
| Estribillo final | 20 – 26 s | El estribillo otra vez, un tono más alto, para que suba la emoción |
| Final | 26 – 29 s | Acorde largo que se apaga + campanita. Termina, no se corta |

- **Sin bucle:** cada parte es distinta; solo el estribillo se repite una vez, como en cualquier canción.
- **Efectos sincronizados** (boing, pop, campanita, ñam, página, mensaje enviado): también sintetizados, con 2–3 variantes de cada uno para que no suenen a copia, y colocados para sonar justo un fotograma después de su animación (así lo percibe el oído como simultáneo).
- **Volumen:** música de fondo más baja y efectos un poco por encima; mezcla final a nivel estándar de redes (−14 LUFS), medida con la herramienta de HyperFrames.

**Aviso honesto:** la guía de HyperFrames desaconseja componer música con código, porque yo no puedo escucharla: solo puedo medir que está bien hecha técnicamente (volumen, que no sature, que los golpes caigan donde deben), no si suena bonita. Hay dos caminos:

- **A (recomendado, lo que se pidió):** canción sintetizada con el script. Gratis, sin cuentas. Mejora segura respecto al bucle actual, porque tendrá estructura y varios instrumentos; tú la escuchas y me dices qué cambiar (más rápida, más dulce…), y se regenera en segundos.
- **B:** buscar una canción infantil en el catálogo de música de HeyGen (más de 10.000 temas, gratis pero requiere iniciar sesión con `npx hyperframes auth login`). Sonaría más «profesional», pero no sería original del proyecto.

---

## 7. Cómo se construiría (resumen técnico)

- Mismo esquema que el tráiler actual: `video-promo/index.html` raíz + una escena por fichero en `compositions/`. Para no pisar el tráiler actual, el v2 iría en una carpeta propia **`video-promo/v2/`**.
- **Stickers animados (riesgo técnico a comprobar primero):** HyperFrames graba el vídeo fotograma a fotograma «parando el tiempo»; un WebP animado normal sigue su propio reloj y podría salir congelado o a saltos. Solución prevista: convertir cada sticker elegido en una tira de fotogramas y que la animación los avance al compás del vídeo. Lo probaría con un solo sticker antes de hacer el resto. **No comprobado todavía.**
- **Cuidado con la gráfica del equipo:** nada de desenfoques, ni canvas/WebGL, ni partículas por cientos; nubes y estrellas como formas planas. Antes del render final, una prueba corta (3 s, calidad borrador). Si aun así la gráfica sufre, existe el render en la nube de HyperFrames (requiere cuenta).
- Antes de enseñarte nada: `npx hyperframes check` (errores) y capturas de cada escena revisadas por mí; después, vista previa para que la veas tú. Solo se renderiza el MP4 cuando la apruebes.

---

## 8. Lo que necesito que decidas

1. **¿Te vale el storyboard?** (escenas, orden, textos).
2. **Música:** A (sintetizada, como se pidió) o B (catálogo HeyGen).
3. **Permiso para descargar la fuente Fredoka** (Google Fonts, licencia libre) a `video-promo/assets/fonts/`.
4. **¿Carpeta `video-promo/v2/`** para el nuevo vídeo (recomendado) o sustituir los ficheros actuales?
