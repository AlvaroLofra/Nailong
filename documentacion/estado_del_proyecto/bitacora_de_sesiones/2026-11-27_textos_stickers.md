# Bitácora de sesión — 27/11/2026: textos de los stickers, fichas de «¿Quién es Nailong?» e imágenes por clave (T1, T2 y W11, web 4.3.0)

> **Objetivo:** revisar con sus fotogramas el título, la descripción, la categoría y el sonido de todos los cromos (`T1`), rehacer las fichas de «¿Quién es Nailong?» con lore con fuente (`T2`) y pasar a clave estable las imágenes fijadas por número (`W11`).
> **Agente:** Claude Code (Opus), sesión `textos-4-3` en su *worktree* (rama `claude/textos-4-3-50d805`), lanzada desde la sesión principal «Pendientes versión 4.3». En paralelo, la sesión `visor-botonera-4-3` (Visor, tráiler horizontal y botonera) en su propia rama.
> **Fuente de lore:** `documentacion/guias_y_contexto/LORE_NAILONG.md`, escrito por la sesión principal en el *checkout* principal (sin commit cuando se usó; no está en esta rama).

---

## 1. Revisión de los cromos (`T1`)

- **Fotogramas:** script con Pillow que decodifica todos los fotogramas, mide el cambio entre uno y otro, detecta cortes de plano (#17, #100, #102, #118 y #121) y elige el primero, el último, 6 por cantidad de movimiento y los de cada corte (máximo 12). Queda como `herramientas/revision_stickers.py tiras`.
- **Revisión:** 6 subagentes en paralelo (21 cromos cada uno) con tira, fotograma a 512 px en los estáticos, recortes ampliados y traducción de subtítulos (chino, inglés e indonesio). Después, **segunda opinión a ciegas** (2 subagentes sin ver ningún texto) sobre 20 dudosos: coincidió en lo esencial; se ajustaron #6, #14, #29, #65 y #118 (el final del #118 se comprobó fotograma a fotograma: se estampa contra un poste y resbala hasta salir de plano).
- **Resultado:** 21 OK, 93 retocar, 10 reescribir y 2 con el personaje equivocado (#27, que no es Bombloong, y #118, donde el acompañante es Bombloong y no Xiao Qi).
- **Hallazgos destacados:**
  - **#11** no es la serie: es un **muñeco antiestrés real** al que le hunden la cabeza (lo usan el Visor, «PUCHERO», y la botonera).
  - **#30:** la lata es de **cerveza Mahou** (edición de fans). El usuario decidió dejarla de momento con texto neutro («lata verde»).
  - **#38** lleva un cóctel azul con cereza; **#55** es una capucha de cocodrilo; **#90** son gafas moradas de fiesta (sin alas ni mesa de DJ); **#13** es una burla, no una carcajada; **#29** patalea bocarriba, no hace la croqueta.
  - Muchos cromos parecen de fans (marcas de agua de TikTok, Bilibili, «jojo_stickers», «Monn», «K.K», subtítulos indonesios, posible IA en #8, #19, #94, #116, #124, #125 y #126). Se apunta en las notas; en la descripción solo se dice en los recoloreados (#10, #27, #102).
- **Aplicado en `js/02`:** 126 textos, categorías (caritas 88, bailes 25, comida 7, amigos 6) y sonidos variados con los que ya existían (`surprise`, `bleh`, `tail`, `run`…). Contadores fijos de los filtros de `index.html` al día (los calcula `updateFilterCounts`; los de antes estaban desfasados: «En Movimiento (73)» eran 97). Filtro «amigos» → «👥 Amigos y Rivales».
- **Registro completo** (lo pidió el usuario: «mantenlo en el proyecto»): `documentacion/notas_tecnicas/07_revision_textos_stickers.md` + carpeta `07_revision_textos_stickers/` (`revision.json` y `tiras/*.webp`, 2,7 MB). La hoja HTML interactiva **no** se guarda en el repositorio (regla de un solo `index.html`): `py -3 herramientas/revision_stickers.py hoja` la crea en una carpeta temporal.

## 2. Hero, laboratorio, muñeco, minijuego y pie (`T1`)

- **Hero:** los 9 estados de ánimo apuntan a su cromo por clave y toman de `ALL_STICKERS` la imagen, el texto alternativo y el sonido; las frases cuadran con lo que se ve. Cambios: Feliz → #19 (antes repetía el #17), Maracas → Arcoíris (#10), Pirata → León (#33), Puchero → #114 (el #22 era un «¡bah!»), Glotón → #106 (patata frita; el #11 era el muñeco antiestrés), Pollo Rico → Sandía (#63; en el #13 no hay pollo). Fuera dos frases sin fuente («leche calentita y muslitos de pollo», «Xiao Qi dice…»).
- **Entradilla del hero:** «Vengo del Planeta Dragón, tengo 3 añitos, huelo a leche calentita» → «Vengo de otro planeta, tengo 3 años y medio» (el «Planeta Dragón» no tiene fuente; el lore habla de otro planeta y de un «Pueblo Dragón» donde viven).
- **Laboratorio:** «Morado Bombloong» → «Morado Lavanda»; disfraces por clave: Alegre (#19), León (#33), Gafas (#90), Cocodrilo (#55), Soldado (#5) y Pajarita (#103). El emoji 🪖 salía como un cuadrado en Windows 10: se usa 🎖️.
- **Muñeco:** «¡Ese es Xiao Qi, mi mejor amigo!». «Bombas de Bombloong» (muñeco y minijuego) se mantienen: es la ficción del juego y cuadra con su papel de enemigo número uno.
- **Minijuego:** el cartel «¡Nailong tiene mucha hambre!» usa el #106 (comiendo) en vez del #10.
- **Pie:** «Nailong Fan Club Oficial» → «Club de Fans de Nailong». **Banner de la app:** quitado «Oficial» («Stickers de Nailong para WhatsApp», «126 stickers»): el lore pide que el proyecto no parezca oficial.

## 3. «¿Quién es Nailong?» (`T2`)

- **Entradilla:** el estudio produce; lo creó Xie Chengen.
- **Nailong:** «3 AÑOS Y MEDIO» (confirmado por el usuario: lo oyó en el primer episodio; el lore cita el episodio 1 de la 2.ª temporada, minuto 1:46) y texto con datos oficiales; fuera la nave espacial y la «tripa de goma».
- **Xiao Qi:** mejor amigo, chico terrícola inventor, la máquina del tiempo y su miedo a las criaturas grandes; fuera «lo adoptó» y «la colita». **No comprobado:** que el niño del #28 (imagen de la ficha) sea Xiao Qi; el lore no describe su aspecto.
- **Bombloong:** imagen = **recorte fijo del #117** (fotograma 26, `(0, 205, 175, 380)`), elegido por el usuario (opción A; la B era un recorte del #118). Clave `bombloong` movida del #27 al #117; `herramientas/miniaturas_web.py` admite `RECORTES` y comprueba el recorte. Tarjeta en azul, «VILLANO ADORABLE» y texto oficial.
- **Curiosidades:** creador («papá dragón»), cumpleaños, fuego y muslos de pollo como motivo recurrente; fuera las placas como rasgo oficial, cambiar de tamaño y el pollo «favorito».
- **#27:** «Nailong Teñido de Morado», presentado como edición de fans (sigue en el álbum y en los packs de la app).

## 4. Imágenes por clave (`W11`)

- 31 claves en `ALL_STICKERS`, acordadas con la sesión del Visor y la botonera en la carpeta de notas compartida: las 9 del Visor (`palomitas-sofa`, `baile-arcoiris`, `gorro-de-leon`, `huida-bosque`, `pataleo-camino`, `siesta-hamaca`, `burla-lengua`, `muneco-antiestres`, `baile-alegria`; tres renombradas tras la revisión para que describan lo que se ve) y las de la futura botonera (`gritos-hierba`, `bostezo-arbol`, `burla-nyah`, `siesta-ronquido`, `carcajada-movil`, `risa-tranquila`, `llanto-chorros`, `ojos-aguados`, `palmas-jardin`, `patata-frita`, `fiesta-parque`; el #30, la cerveza, no lleva clave).
- Funciones nuevas en `js/02`: `stickerPorClave(clave)` y `rutaSticker(clave)`. Las usan el hero, el laboratorio y el sprite del minijuego; **el Visor y la botonera deberían usarlas también** (no definir otras iguales: son scripts clásicos con ámbito global).
- `data-sticker` en hero, muñeco, laboratorio, cartel del minijuego, insignia del creador y pie, y también en `<link>`/`<meta>` (icono de iPhone, precarga, `og:image`, `twitter:image`), donde no se resuelve al cargar pero lo vigila el test.
- **Tests:** el 51 comprueba también la cabecera, que la precarga sea la misma imagen que el hero y que todas las claves usadas en el código existan; el 53 deduce de las claves qué stickers no deben cargarse enteros en las tarjetas.

## 5. Verificación

- `py -3 verify_all.py`: **55 de 55 en verde** (en este equipo también pasaron las partes Android).
- Navegador integrado a 320, 375 y 1.280 px: sin desbordes horizontales, sin errores de consola; los 9 estados de ánimo, los 6 disfraces y el color cambian imagen, texto alternativo y sonido; fichas y ficha ampliada del #117 correctas.
- **No comprobado:** en iPhone real ni en Android real; el sonido no se ha escuchado (solo se comprueba que se llama con el tipo correcto); que el emoji 🎖️ se vea en todos los sistemas.

## 6. Lo que debe hacer la integración (sesión principal)

- **No he tocado** (por reparto): `?v=` de `index.html`, versión del pie, `version.json`, APK, `CHANGELOG.md`, `ESTADO_ACTUAL.md`, `MEJORAS_PENDIENTES.md`, `DECISIONES.md`, `00_INDICE.md`, `README.md`. Al publicar la 4.3.0:
  - Subir los sufijos `?v=` (cambian `js/02`, `js/03`, `js/04`, `js/06`, `js/07`, `js/08`).
  - `00_INDICE.md`: añadir `notas_tecnicas/07_revision_textos_stickers.md` (y `LORE_NAILONG.md`).
  - `MEJORAS_PENDIENTES.md`: `T1`, `T2` y `W11` hechas (la botonera y el Visor los migra la otra sesión).
  - `CHANGELOG.md` / `ESTADO_ACTUAL.md`: textos revisados, fichas con lore, Bombloong azul, imágenes por clave y «sin “Oficial”» en el pie y el banner.
- **Para la sesión del Visor y la botonera** (también en la carpeta de notas compartida): usar `stickerPorClave`/`rutaSticker`; los textos de los 9 cromos del Visor ya están corregidos en `ALL_STICKERS`; la botonera sigue con «¡Ñam Ñam Crujiente!» (#11), «Sorbito Refrescante» (#30, cerveza), «¡Llamita Bebé!» (#32), «¡Capitán Pirata!» (#33) y «Xiao Qi & Colita» (#28); no existe ningún sonido de llanto.
- **Conflicto posible al integrar:** `index.html` lo tocamos las dos ramas (yo: cabecera, hero, fichas, banner de la app, laboratorio, minijuego, pie; la otra: `#magic-modal` y quizá la botonera). `js/06` también: yo solo `FILTER_LABELS`.

## 7. Ideas y pendientes (no aplicados)

- **Títulos cortados en el móvil:** en el álbum a 320 px solo caben unos 12–14 caracteres (`line-clamp-1`); con `line-clamp-2` en móvil se leerían enteros (cambia la altura de las tarjetas: comprobar CLS).
- **`og:image` con URL relativa:** muchos servicios necesitan una URL absoluta (`https://alvarolofra.github.io/Nailong/...`) para la vista previa al compartir. No comprobado.
- **«Tráiler oficial»** en la sección del tráiler: es «nuestro» tráiler, no del estudio; valorar otra palabra (es zona de la otra sesión).
- **Posible dato para el lore (sin fuente, solo hipótesis):** el dragón oscuro de ojos rojos del #100 podría ser el «Nailong malvado» (黑化奶龙) que cita Baidu [W1]. No se ha escrito en la web.
- **Ideas para `VM3`:** `revision.json` guarda para cada cromo qué pasa en cada tramo de fotogramas: sirve para el juego «¿Qué está pasando?» y para sincronizar sonidos con el momento clave.
