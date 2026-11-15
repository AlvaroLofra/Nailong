# Bitácora de Sesión — 2026-11-15 (mejoras web, detector de repetidos, textos fieles y auditoría de seguridad)

## Qué se pidió
1. Evaluar las mejoras W12–W20 propuestas por el plugin *Modern Web Guidance* e implementar solo las positivas.
2. Un mecanismo para saber qué stickers descargados de TikTok ya están en la colección.
3. Que los textos de cada sticker describan lo que se ve, mirando varios fotogramas de los animados.
4. Revisar la seguridad de la app Android, incluida la actualización semiautomática.

## Qué se hizo

**Paso previo:** el trabajo 3D pendiente se confirmó en dos commits propios (código y documentación).

**Mejoras web (D-23):**
- W12: los 4 modales son `<dialog>` nativos abiertos con `showModal()`. El foco queda atrapado, el fondo inerte y el foco vuelve al botón de origen. `Escape` llega por el evento `cancel`; se eliminaron los 4 escuchadores manuales. La visibilidad sigue con `hidden`/`flex`, así que flechas, gestos y bloqueo de scroll no cambian.
- El aviso flotante (`#duang-toast`) se cuelga del modal abierto, porque un `<dialog>` se pinta por encima de toda la página.
- W14: aparición suave con `@starting-style` (solo opacidad, respeta `prefers-reduced-motion`).
- W17: tráiler con `preload="none"`. W19: `scrollbar-color` solo para Firefox.
- W15 se probó y **se descartó**: con `content-visibility` en `#galeria`, el cálculo de diseño tarda lo mismo (≈2 ms con y sin ella; la página tiene ≈850 nodos).
- Descartadas sin implementar: W13, W16, W18 y la reescritura de W20 (motivos en D-23).

**Detector de repetidos:** `normalizar_stickers.py --clasificar CARPETA` y `--descartar`. Detalle en la nota técnica 02 §5. Test 52.

**Textos:** revisados los 95 stickers con hojas de contacto de 6 fotogramas (`herramientas/hojas_contacto.py`). Reescritas 41 fichas de `ALL_STICKERS` y 8 escenas del Visor Mágico (`FEATURED_GIFS`). Tabla completa al final.

**Seguridad:** informe en `notas_tecnicas/06_auditoria_seguridad.md`. Se corrigió un fallo menor de la web (el nombre de una foto subida se pintaba sin escapar). Lo demás son acciones del usuario o cambios que exigen APK nuevo.

## Verificación
- `python verify_all.py`: 52 comprobaciones en verde.
- Navegador (Chromium, escritorio y 375 px): los 4 modales abren y cierran con botón, clic fuera y `Escape`; tabulador sin salir del modal; foco devuelto; aviso visible sobre el modal; consola sin errores.
- Detector: carpeta de prueba con copias a 240 px, un fichero duplicado y una imagen nueva, en varias pasadas y tras descartar.
- Fallo de la web: carga maliciosa en `localStorage`, no se ejecuta.

## No comprobado
- Safari/iPhone y Firefox reales; lector de pantalla.
- El detector con descargas reales de TikTok.
- La app en un móvil y la configuración de la cuenta de GitHub.

## Pendiente
- **Publicación preparada, falta el `git push`:** revisión solo de la web. La versión visible y el APK siguen en la v3.6.1; el sufijo anti-caché pasa a `?v=3.6.1-web1` para que los navegadores no sigan con el JS antiguo. `verify_all.py` y la regla 7 de `AGENTS.md` admiten ese sufijo `-webN`.
- Los textos de la app Android (`contents.json`) no se han tocado.
- Etiquetas del laboratorio y la botonera que no encajan con su imagen: siguen en W11.
- Decisiones de seguridad H-2 a H-7 de la nota técnica 06.

## Textos: antes y después

Un `=` significa que ese campo no cambió. Entre paréntesis, cambios de categoría, sonido o etiqueta.

| # | Título antes | Título ahora | Descripción antes | Descripción ahora |
|---|---|---|---|---|
| 2 | Sonrisa Radiante 3D | Lengua Fuera y Ojos Locos (cat: bailes → caritas) (sound: laugh → bleh) | Nailong hablando alegremente con sus grandes ojitos verdes llenos de curiosidad. | Saca la lengua, mueve la cabecita y pone los ojos en blanco: ¡la burla más simpática del valle! |
| 4 | Escuchando Atento | = | Sentadito en silencio escuchando las explicaciones de los inventos de Xiao Qi. | De perfil y con los bracitos cruzados, mirando de reojo muy atento a lo que pasa a su lado. |
| 5 | ¡Gran Sonrisa! | = | Primer plano súper alegre con la boquita abierta llena de entusiasmo infantil. | Primer plano con los ojos saltones y la boca abierta de par en par, ¡entre la risa y el asombro! |
| 6 | Chef Pastelero Nailong | = | Con gorrito de cocinero frotándose las patitas listo para amasar galletitas dulces. | Con su gorro blanco de cocinero y las patitas juntas, parpadea muy serio esperando a que el pastel salga del horno. |
| 7 | Mirada Pilla | Mirada de Reojo | Mirando de reojo con cara de estar tramando una dulce travesura. | Mirando de lado con los ojos entornados y cara de pocos amigos: aquí hay algo que no le convence. |
| 8 | ¡Sáquenme de Aquí! | = | Tras las rejas dramático con carita de sorpresa cómica estilo película de acción. | Agarrado a los barrotes: primero se asombra, luego pide ayuda con la patita y al final apoya la cabeza haciendo pucheros. |
| 10 | Baile de las Maracas Duang | Baile Arcoíris con Bolas de Colores | Moviendo la cintura y sacudiendo dos bolas de colores al ritmo de la fiesta. | Con una bola de colores en cada patita, baila mientras cambia de color como un camaleón: amarillo, verde, naranja... |
| 11 | Comilona de Pasteles | Morritos Mirando al Cielo (cat: comida → caritas) (sound: chomp → pop) | Masticando bollitos sin parar a toda velocidad, ¡nada puede detenerlo! | Se incorpora poco a poco, levanta la cabecita y se queda mirando hacia arriba con la boquita torcida en un puchero. |
| 13 | Risas a Carcajadas | = | Riendo sin parar con la lengua fuera y los ojitos cerrados de pura felicidad. | Riendo con la boca abierta, la lengua fuera y los ojos en blanco mientras saluda con la patita. |
| 14 | Día Soleado en la Tumbona | Ojitos Tiernos junto a la Tumbona (cat: bailes → caritas) (sound: sleep → duang) | Tomando el solecito con una mirada tierna y relajada en la playa. | De pie junto a la tumbona de rayas, ladea la cabeza con ojitos tiernos como pidiendo un favor. |
| 15 | Siesta Panza Abajo | Siesta con la Lengua Fuera | Tumbado completamente plano en el suelo durmiendo como un flan derretido. | Tumbado en el suelo como un flan derretido, dormido del todo y con la lengüita asomando. |
| 16 | Empacho Feliz | = | Tumbado boca arriba con la barriga llena mirando al techo en coma dulce. | Echado hacia atrás con la barriga llena, la boca abierta y la lengua fuera, en pleno coma dulce. |
| 17 | Atracón de Palomitas en el Cine | Palomitas y Risas en el Sofá | Sentado en la butaca devorando palomitas a toda máquina sin pestañear. | Sentado en el sofá con su caja de palomitas, se ríe tanto que acaba revolcándose de lado a lado. |
| 18 | Paseo Saltarín Duang | Bailecito Saltarín Duang | Caminando alegremente al aire libre mientras su barriguita bota como gelatina. | Bailando en el jardín con los bracitos abiertos y una sonrisa, mientras su barriguita bota como gelatina. |
| 19 | ¡Uoooh! ¡Qué Sorpresa! | ¡Uoooh! ¡Qué Ilusión! | Agarrándose los mofletes con las dos patitas asombrado de emoción. | Se lleva las patitas a los mofletes ilusionado y acaba riéndose con los ojos cerrados de pura emoción. |
| 20 | ¡Ay mi Tripita! | ¡Ups! Patitas en la Boca | Mirando preocupado mientras se sostiene su redonda barriga después de comer. | De pie con las dos patitas tapándose la boca y los ojos muy abiertos: ¡se le ha escapado algo! |
| 21 | ¡A Correr! ¡Sálvese Quien Pueda! | = (sound: duang → run) | Huyendo en estampida con ojos desorbitados y patitas veloces porque toca bañarse. | Corriendo por el bosque con la boca abierta de puro susto y las patitas a toda velocidad. |
| 22 | Puchero con Brazos Cruzados | Enfadado Diciendo que No | Enfadadito moviendo la cabeza: "¡Pues ahora no te doy de mi pastel!". | Con el ceño fruncido, niega con la cabeza y con las patitas: "¡Que no, que no y que no!". |
| 24 | Paseo por la Colina | Bailecito en el Prado | Caminando por el prado verde saludando a todos los vecinos del valle. | Saluda con la patita, se frota la barriguita y abre los brazos: todo un bailecito sobre el prado verde. |
| 28 | Xiao Qi y la Colita de Nailong | Xiao Qi y el Nailong Perezoso | El inventor Xiao Qi tirando de su colita mientras Nailong hace el vago en el suelo. | Xiao Qi empuja con todas sus fuerzas a un Nailong tirado en el suelo con la lengua fuera, que no piensa moverse. |
| 30 | Relajo con Refresco Fresquito | Lata de Refresco y Mucha Espuma (sound: pop → slurp) | Sentado en el sofá disfrutando de su bebida fría con pajita. | Sentado en el sofá con su lata verde: bebe con tantas ganas que acaba con toda la espuma derramada por la barriguita. |
| 31 | Las Tres Escamitas de la Espalda | = | Vista trasera mostrando sus tres adorables placas dorsales verdes de dragón. | Empieza enseñando sus tres placas verdes de la espalda y se gira para bailar con su collar dorado bajo los focos. |
| 33 | El Baile del Capitán Pirata | Baile con Gorro de León | Bailando alegremente con su sombrero de dos picos y actitud corsaria. | Bailando con la lengua fuera y un gorro blanco y peludo de la danza del león, ¡pura fiesta! |
| 36 | Mmm... ¿Qué Comemos Hoy? | = | Dedo en la barbilla pensando en un menú delicioso lleno de pasteles y pollo. | Con el dedito en la boca y los ojos entornados, pensando en un menú delicioso lleno de pasteles y pollo. |
| 39 | ¡Saltitos de Pura Alegría! | ¡Baile de Pura Alegría! | Botando arriba y abajo con los brazos en alto celebrando que la comida está lista. | Bailando por toda la casa con los brazos en alto y una sonrisa enorme, celebrando que la comida está lista. |
| 40 | Cantando con la Boquita en "O" | De la Sonrisa a la Carcajada | Primer plano de su carita gordita abriendo y cerrando la boca como si cantara su canción favorita. | Primer plano de su carita gordita: sonríe, pone morritos y termina soltando una carcajada enorme. |
| 53 | Sentadito en el Sofá | = | Repantigado en el sofá verde, rascándose la barriguita y mirando a lo lejos muy tranquilo. | Repantigado en el sofá verde rascándose la barriguita, hasta que levanta la patita y saluda con una gran sonrisa. |
| 67 | Cabeceando de Sueño | Del Sueño al Grito (sound: sleep → duang) | Cierra los ojitos, apoya la patita en la mejilla y ¡zzz! casi se queda dormido. | Empieza adormilado con la patita en la mejilla, abre los ojos poco a poco y, de repente, ¡pega un grito enorme con el brazo en alto! |
| 71 | ¡Qué Risa Bajo el Cielo Azul! | = | Riendo con la boca bien abierta y una patita en la mejilla, ¡no puede parar de reír! | Empieza riendo con la boca bien abierta y acaba con las patitas en los mofletes poniendo morritos de sorpresa. |
| 72 | ¡Nyah, Nyah! Lengua Fuera | = (sound: pop → bleh) | Se tapa un ojito con la patita y saca la lengua para burlarse con mucha gracia: "¡Nyah, nyah!". | Se baja el párpado con la patita y saca la lengua para burlarse con mucha gracia: "¡Nyah, nyah!". |
| 80 | Siesta de Lado en la Camita | = | Tumbado de lado descansando tras un buen banquete, con los ojitos entrecerrados y pura tranquilidad. | Tumbado de lado sobre la mantita verde, se le cierran los ojos y acaba roncando con la boca abierta y una burbujita. |
| 81 | ¡Mira mi Colita Gordita! | ¡Morritos Pintados! (cat: bailes → caritas) (sound: duang → laugh) | De espaldas enseñando sus escamitas de dragón y girándose de repente para sonreír. | Se da la vuelta y... ¡sorpresa! Lleva los labios pintados de rosa, pone morritos y hasta saca la lengüita. |
| 82 | Asombro Curioso de Bebé Dragón | Ojos en Blanco | Con la boquita entreabierta y los ojazos verdes fijos mirando un nuevo invento misterioso. | Primero se sorprende con la boquita en "o", luego pone los ojos en blanco y termina mirando de reojo con cara de "no me lo creo". |
| 85 | Curioso en la Hierba | Gritos en la Hierba (sound: pop → duang) | Asomando su redonda cabecita entre el césped verde con una mirada dulce e inocente. | Sobre el césped mira muy tranquilo... y de pronto abre la boca de par en par para soltar un grito, ¡una y otra vez! |
| 86 | Pasmado en el Parque | Del Pasmo a la Rabieta (cat: bailes → caritas) (sound: fanfare → duang) | De pie en el prado con las patitas abiertas y la boca en forma de "o", completamente alucinado. | Empieza pasmado con la boquita en "o", sale corriendo a grito pelado y acaba tirado en el césped con una rabieta. |
| 89 | Soñando con Nubes Dulces | Charla con Aires de Importancia (sound: sleep → pop) | Mirando hacia el cielo azul soleado mientras imagina tartas gigantes voladoras. | Bajo el cielo azul gira la cabecita y habla con los ojos entornados, dándose aires de saberlo todo. |
| 90 | DJ Nailong con Gafitas de Fiesta | = | Con gafas moradas de sol bajo las luces de la pista de baile dándolo todo como una estrella. | Baila con sus gafas moradas bajo las luces de la pista y al final se las quita para seguir con los ojos cerrados, como una estrella. |
| 91 | Viaje Mágico en Autobús | Destellos Dorados de Ilusión (sound: pop → laugh) | Sentado junto a la ventanilla con destellos dorados mágicos a su alrededor, soñando despierto. | Entre destellos dorados, empieza con los ojos cerrados como cantando y acaba con una sonrisa enorme de ilusión. |
| 92 | Sonrisa Pícara de Barriguita Llena | Sonrisa Pícara y Besito (cat: comida → caritas) | Enseñando los dientecitos con una sonrisa traviesa y tocándose la tripita bien saciada. | Sonríe pícaro enseñando los dientes con las patitas en la tripita y termina lanzando un besito con corazón. |
| 93 | ¡Manzana Deliciosa! | = | Sosteniendo una manzana roja y abriendo la boca emocionado ante un snack tan rico y sano. | Con una manzana roja en la patita: se ríe, se tapa la boca al dar un bocado y le sale un corazoncito de lo rica que está. |
| 95 | El Chichón Travieso | = | Con un gracioso chichón en la cabecita y ojitos llorosos cómicos tras tropezar jugando. | Con un chichón en la cabecita y los ojitos hinchados de llorar, pide perdón muy bajito tras su travesura. |
| Visor 17 | Cine & Palomitas a Granel | Palomitas & Risas en el Sofá | Nailong en el cine devorando un cubo entero de palomitas a toda máquina. | Nailong en el sofá con su caja de palomitas, riéndose tanto que acaba revolcándose. |
| Visor 10 | El Baile de las Maracas Duang | El Baile Arcoíris Duang (tag: RITMO 🪇 → ARCOÍRIS 🌈) | Moviendo las caderas y haciendo música alegre con maracas de colores. | Bailando con una bola de colores en cada patita mientras cambia de color como un camaleón. |
| Visor 33 | Capitán Pirata Nailong | Baile con Gorro de León (tag: AVENTURA 🏴‍☠️ → FIESTA 🦁) | Con su sombrero corsario y patitas en alto bailando al timón del barco. | Con la lengua fuera y un gorro blanco y peludo de la danza del león, bailando sin parar. |
| Visor 21 | ¡A Correr! ¡Hora del Baño! | ¡A Correr! ¡Sálvese Quien Pueda! | Huyendo despavorido a toda prisa con carita de susto porque no le gusta el agua fría. | Huyendo despavorido por el bosque con la boca abierta y carita de susto. |
| Visor 38 | Dulce Siesta en la Hamaca | = | Meciéndose plácidamente en su cuna colgante soñando con montañas de nata. | Durmiendo plácidamente en su hamaca blanca, soñando con montañas de nata. |
| Visor 13 | ¡Mmm, Lamiéndose los Bigotes! | ¡Carcajadas con la Lengua Fuera! (tag: SABROSO 😋 → RISAS 😝) | Saboreando el manjar más delicioso del mundo tras acabarse un muslito crujiente. | Riendo con la boca abierta, la lengua fuera y los ojos en blanco mientras saluda con la patita. |
| Visor 11 | El Monstruo de los Bollitos | Morritos Mirando al Cielo (tag: MASTICANDO 🥟 → PUCHERO 🥺) | Masticando bollitos al vapor sin parar a velocidad supersónica. | Se incorpora poco a poco y se queda mirando hacia arriba con la boquita torcida en un puchero. |
| Visor 39 | ¡Saltitos de Pura Victoria! | ¡Baile de Pura Alegría! | El baile viral dando botes de pura felicidad cuando la merienda está servida. | El baile viral por toda la casa con los brazos en alto cuando la merienda está servida. |
