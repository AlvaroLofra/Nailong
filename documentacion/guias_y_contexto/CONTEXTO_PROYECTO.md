# Contexto del Proyecto — ¡El Mundo Mágico de Nailong (奶龙)! 🦖

> **Propósito:** Definir la identidad, público objetivo, universo narrativo y principios de diseño interactivo del proyecto.

---

## 1. ¿Quién es Nailong (奶龙)?
**Nailong** (奶龙, literalmente «Dragón de Leche») es un personaje animado en 3D de color amarillo brillante creado por el estudio de animación chino *Seventh Impression* (第七印象).

### Rasgos Característicos:
- **Personalidad:** Ingenuo, glotón, alegre, curioso y con un humor físico slapstick.
- **Aspecto:** Cuerpo rechoncho y elástico (efecto «Duang-Duang»), panza suave, ojos expresivos y movimientos gelatinosos.
- **Relaciones:** Vive aventuras con su creador y amigos, enfrentándose recurrentemente al villano cómico Bombloong (el dragón esqueleto/robot).
- **Fenómeno Viral:** Se convirtió en un fenómeno global en TikTok, Instagram Reels, Xiaohongshu y WhatsApp a través de clips breves y stickers animados hiper-expresivos.

---

## 2. Público Objetivo y Experiencia de Usuario
- **Público:** Niños, jóvenes y fans del personaje en todo el mundo.
- **Tono y Lenguaje:** Cálido, divertido, estimulante, infantil y accesible. Cero jerga técnica en la interfaz.
- **Estética Visual (Claymorphism):**
  - Botones y tarjetas acolchadas con sombreados interiores y exteriores que simulan plastilina o gomaespuma suave.
  - Paleta cálida y luminosa basada en el color de Nailong:
    - Fondo crema: `#FFFDF0`
    - Tarjeta amarilla pastel: `#FEF9C3`
    - Acento amarillo brillante: `#FFD93D` / `#FACC15`
    - Acento mandarina: `#EA580C`
    - Contraste verde WhatsApp: `#25D366`
- **Físicas «Duang»:** Animaciones CSS con rebote elástico (`cubic-bezier(0.34, 1.56, 0.64, 1)`) al hacer click o tocar elementos clave.

---

## 3. Pilares del Proyecto

| Pilar | Descripción |
|---|---|
| **Interactividad Inmersiva** | El usuario no solo mira fotos; toca la pancita de Nailong, cambia sus expresiones, lanza llamaradas y juega en el minijuego arcade. |
| **Coleccionismo Total** | Álbum completo con 80 cromos auténticos organizados por estados de ánimo, listos para descargar o copiar. |
| **Síntesis en Tiempo Real** | Sonidos de dibujos animados generados algorítmicamente mediante Web Audio API sin descargas de audio externas. |
| **Solución Nativa para WhatsApp** | Aplicación Android nativa independiente (`StickersNailong.apk`) para instalar los 80 stickers animados en el teclado de WhatsApp en 1 click o crear paquetes personalizados con «Mi Selección». |
| **Cero Fricción (Buildless)** | La web no requiere NodeJS, empaquetadores ni compiladores; se sirve directamente desde GitHub Pages. |
