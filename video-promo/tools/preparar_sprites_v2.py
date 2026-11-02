"""Prepara los stickers del tráiler v2 para HyperFrames.

HyperFrames graba el vídeo «parando el tiempo» en cada fotograma, pero un WebP
animado dentro de un <img> sigue su propio reloj y saldría congelado o a saltos.
Por eso cada sticker animado se convierte en una HOJA DE FOTOGRAMAS (sprite):
todos sus fotogramas en una cuadrícula dentro de una sola imagen. El vídeo
elige qué casilla enseñar según el tiempo, así cada render es idéntico.

Uso:
    python video-promo/tools/preparar_sprites_v2.py

Escribe en video-promo/v2/assets/:
    sprites/sticker_N.webp   hojas de fotogramas
    stills/sticker_N.webp    una imagen fija (para el álbum y la app)
    js/sprites.js            datos de cada hoja + ayudante nlSprite()
"""
from __future__ import annotations

import json
import math
from pathlib import Path

from PIL import Image, ImageSequence

RAIZ = Path(__file__).resolve().parents[2]
ORIGEN = RAIZ / "Stickers Nailong"
DESTINO = RAIZ / "video-promo" / "assets"

# Tamaño de cada casilla según lo grande que se vea el sticker en pantalla.
PROTAGONISTAS = {2: 512, 58: 512, 92: 512, 19: 512, 13: 512, 44: 512, 72: 384, 9: 384}
LLUVIA = {n: 300 for n in (10, 20, 24, 47, 60, 63, 64, 77, 79, 87, 91)}
FIJOS = [24, 25, 31, 60, 75, 92, 10, 13, 20, 34, 44, 47, 58, 63, 64, 72, 77, 79, 91, 1, 2, 3, 4, 5, 6, 8, 9, 11, 14]

AYUDANTE = """
// Avanza una hoja de fotogramas al ritmo del vídeo: el fotograma visible es
// función del tiempo de la línea de tiempo, nunca de un reloj propio.
window.nlSprite = function (tl, el, id, inicio, duracion) {
  const s = window.NAILONG_SPRITES[id];
  const filas = Math.ceil(s.frames / s.cols);
  el.style.backgroundImage = "url('assets/sprites/sticker_" + id + ".webp')";
  el.style.backgroundSize = (s.cols * 100) + "% " + (filas * 100) + "%";
  const pintar = (f) => {
    const i = Math.floor(f) % s.frames;
    const x = s.cols > 1 ? (i % s.cols) / (s.cols - 1) * 100 : 0;
    const y = filas > 1 ? Math.floor(i / s.cols) / (filas - 1) * 100 : 0;
    el.style.backgroundPosition = x + "% " + y + "%";
  };
  pintar(0);
  const reloj = { f: 0 };
  tl.fromTo(reloj, { f: 0 }, {
    f: duracion * s.fps, duration: duracion, ease: "none",
    onUpdate: () => pintar(reloj.f),
  }, inicio);
};
"""


def hoja(n: int, lado: int) -> dict:
    im = Image.open(ORIGEN / f"sticker_{n}.webp")
    fotos, duraciones = [], []
    for fr in ImageSequence.Iterator(im):
        fotos.append(fr.convert("RGBA").resize((lado, lado), Image.LANCZOS))
        duraciones.append(fr.info.get("duration", 100) or 100)
    cols = math.ceil(math.sqrt(len(fotos)))
    filas = math.ceil(len(fotos) / cols)
    lienzo = Image.new("RGBA", (cols * lado, filas * lado), (0, 0, 0, 0))
    for i, f in enumerate(fotos):
        lienzo.paste(f, ((i % cols) * lado, (i // cols) * lado))
    (DESTINO / "sprites").mkdir(parents=True, exist_ok=True)
    lienzo.save(DESTINO / "sprites" / f"sticker_{n}.webp", quality=82, method=4)
    fps = round(1000 / (sum(duraciones) / len(duraciones)), 2)
    return {"frames": len(fotos), "cols": cols, "fps": fps}


def fijo(n: int) -> None:
    im = Image.open(ORIGEN / f"sticker_{n}.webp")
    try:
        im.seek(getattr(im, "n_frames", 1) // 2)    # un fotograma con expresión
    except EOFError:
        pass
    (DESTINO / "stills").mkdir(parents=True, exist_ok=True)
    im.convert("RGBA").resize((256, 256), Image.LANCZOS).save(
        DESTINO / "stills" / f"sticker_{n}.webp", quality=85)


def main() -> None:
    datos = {}
    for n, lado in {**PROTAGONISTAS, **LLUVIA}.items():
        datos[n] = hoja(n, lado)
        print(f"sticker_{n}: {datos[n]['frames']} fotogramas, {datos[n]['fps']} fps")
    for n in FIJOS:
        fijo(n)
    (DESTINO / "js").mkdir(parents=True, exist_ok=True)
    (DESTINO / "js" / "sprites.js").write_text(
        "// Generado por video-promo/tools/preparar_sprites_v2.py — no editar a mano.\n"
        f"window.NAILONG_SPRITES = {json.dumps(datos)};\n" + AYUDANTE, encoding="utf-8")
    print(f"{len(datos)} hojas y {len(FIJOS)} imágenes fijas en {DESTINO}")


if __name__ == "__main__":
    main()
