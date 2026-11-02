# Pipeline Audiovisual Tráiler Híbrido 3D: «Nailong presenta sus stickers»

> **Formato:** Vertical 1080×1920 (9:16), 30 fps, ~24.4 s (732 fotogramas).  
> **Destino:** TikTok, Instagram Reels, YouTube Shorts, Estados de WhatsApp.  
> **Arquitectura:** Híbrida local optimizada para GPU de 4 GB VRAM (RTX 3050 Ti):
> - **Locución:** TTS Kokoro v1.0 local (`ef_dora`, speed 1.15) en CPU (`C:\src\tts_local\tts.bat`).
> - **Subtítulos y sincronía:** Whisper-cli de Velorn (`ggml-large-v3-turbo.bin`) con marcas de tiempo palabra por palabra y corrección fonética de nombres propios («Nailong»).
> - **Personaje 3D:** Blender 5.2.3 LTS headless (motor Eevee, fondo transparente RGBA, cámara vertical calibrada y anatomía completa).
> - **Chat WhatsApp interactivo:** Componente nativo React determinista para Remotion + maqueta HTML/GSAP para previsualización independiente.
> - **Montaje y renderizado:** Remotion (React video-as-code) con assets estáticos en `public/`.

---

## 1. Estructura de Componentes

```text
video-promo/trailer-3d/
├── README.md                           # Documentación maestra del pipeline
├── guion/
│   ├── guion.json                      # Metadatos de escenas, tiempos, stickers y SFX
│   └── guion_locucion.txt              # Texto limpio para el motor TTS
├── audio/
│   ├── generar_locucion.py             # Automatización de voz Kokoro (C:\src\tts_local\tts.bat)
│   ├── transcribir_whisper.py          # Transcripción milimétrica y reconstrucción de palabras
│   ├── output/
│   │   ├── locucion_trailer.wav        # Audio locutado (24.4s, 44.1kHz, 16-bit)
│   │   ├── locucion_trailer.json       # Marcas de tiempo en bruto por tokens BPE
│   │   ├── locucion_trailer_palabras.json # 74 palabras limpias con timestamps y corrección "Nailong"
│   │   └── locucion_trailer.srt        # Subtítulos estándar en 4 bloques
│   └── sfx/                            # Efectos de sonido (boing, campanita, pop, nam...)
├── blender/
│   ├── render_nailong_eevee.py         # Script headless para render RGBA con alfa y cámara calibrada
│   ├── modelos/                        # Destino para modelo externo de Sketchfab (opcional)
│   └── renders/
│       ├── nailong_saludo_alfa.png     # Render de pose con fondo 100% transparente (RGBA)
│       └── secuencia/                  # Secuencias de animación exportadas (opcional con --anim)
├── hyperframes/
│   ├── whatsapp_chat.html              # Mockup animado de WhatsApp con stickers WebP reales
│   └── estilos_chat.css                # Estilos de interfaz WhatsApp adaptados a 1080x1920
└── remotion/
    ├── package.json                    # Dependencias de Remotion y React
    ├── public/                         # Assets estáticos servidos vía staticFile()
    │   ├── audio/                      # Audio de voz locutado
    │   ├── renders/                    # Renders 3D con canal alfa
    │   └── stickers/                   # Stickers WebP oficiales de WhatsApp
    └── src/
        ├── index.ts                    # Registro de la composición
        ├── Root.tsx                    # Composición NailongTrailer3D (1080x1920 @ 30fps, 732 frames)
        ├── Main.tsx                    # Timeline determinista de 4 escenas y chat React
        └── Subtitles.tsx               # Subtítulos cinéticos palabra por palabra sincronizados
```

---

## 2. Ejecución y Comprobaciones

### 1. Generar la locución TTS
```powershell
python video-promo/trailer-3d/audio/generar_locucion.py
```
Invoca `C:\src\tts_local\tts.bat` con el modelo Kokoro v1.0, voz `ef_dora` a velocidad 1.15.

### 2. Transcribir con Whisper y reconstruir palabras
```powershell
python video-promo/trailer-3d/audio/transcribir_whisper.py
```
Ejecuta `whisper-cli.exe` de Velorn con `ggml-large-v3-turbo.bin`, fusiona los tokens sub-palabra BPE en 74 palabras completas con timestamps precisos y corrige fonéticamente «Nylon» por «Nailong».

### 3. Renderizar poses 3D en Blender con fondo transparente
Fotograma estático de pose:
```powershell
& "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" -b -P video-promo/trailer-3d/blender/render_nailong_eevee.py
```
Secuencia animada de saludo (opcional):
```powershell
& "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" -b -P video-promo/trailer-3d/blender/render_nailong_eevee.py -- --anim --frames 30
```

---

## 3. Estado Verificado
- [x] Motor TTS Kokoro v1.0 probado y operativo (24.4s de audio en 14.1s en CPU).
- [x] Whisper-cli comprobado con modelo turbo + algoritmo de fusión de palabras (74 palabras en `locucion_trailer_palabras.json`).
- [x] Motor Blender 5.2.3 LTS Eevee comprobado headless: escena limpia sin primitivas residuales, cámara vertical calibrada a 7.2m (24.9% de ocupación en pantalla, márgenes limpios y fondo 100% alfa).
- [x] Chat de WhatsApp modelado como componente nativo React en Remotion (`useCurrentFrame()`), garantizando renderizado determinista fotograma a fotograma sin desincronizaciones de iframes.
- [x] Carpeta `remotion/public/` poblada con assets locales listos para `staticFile()`.
- [x] Suite de pruebas del proyecto `verify_all.py`: 46/46 pruebas superadas (100% verde).
