"""Prepara los recursos de la demo animada de la app (video-promo/app-demo/assets/).

La demo recrea las pantallas de la app Android con HTML. HyperFrames graba el vídeo
«parando el tiempo» en cada fotograma, y un WebP animado dentro de un <img> seguiría
su propio reloj. Por eso cada sticker animado del pack que se abre en la demo se
convierte en una HOJA DE FOTOGRAMAS (sprite) y el vídeo elige qué casilla enseñar
según el tiempo (mismo truco que el tráiler, video-promo/tools/preparar_sprites_v2.py).

Todo lo que escribe es derivado y se regenera con este script, así que la carpeta
assets/ no se sube a Git (ver ../.gitignore).

Uso (desde la raíz del repositorio):
    py -3 video-promo/app-demo/tools/preparar_assets.py

Escribe en video-promo/app-demo/assets/:
    sprites/sticker_N.webp   hojas de fotogramas del pack «Nailong animado 1»
    stills/sticker_N.webp    imágenes fijas (miniaturas de la lista: la app enseña el 1.er fotograma)
    icono_app.png            icono de la app (como lo genera generar_assets.py: sticker 2, fotograma 0, marco amarillo)
    fonts/                   Fredoka (la de la app si está su código; si no, la del tráiler)
    js/sprites.js            datos de cada hoja + ayudante nlSprite()
"""
from __future__ import annotations

import json
import math
import os
import shutil
from pathlib import Path

from PIL import Image, ImageSequence

RAIZ = Path(__file__).resolve().parents[3]
ORIGEN = RAIZ / "Stickers Nailong"
DESTINO = RAIZ / "video-promo" / "app-demo" / "assets"
FUENTES_TRAILER = RAIZ / "video-promo" / "assets" / "fonts"
ANDROID = Path(os.environ.get("NAILONG_ANDROID_SRC", r"C:\src\nailong_stickers_app"))
FUENTES_APP = ANDROID / "stickers" / "Android" / "app" / "src" / "main" / "res" / "font"

# Reparto real de los packs (PACKS de generar_assets.py en el código de la app).
PACK_1 = [2, 5, 6, 8, 9, 10, 11, 13, 17, 18, 19, 21, 22, 23, 24, 25, 28, 29, 30, 31, 33, 38, 39, 40]
PACK_2 = [41, 42, 43, 44, 46, 47, 48, 49]
PACK_3 = [68, 70, 71, 72, 74, 75, 76, 77]
PACK_4 = [98, 99, 100, 101, 102, 103, 104, 105]
ESTATICOS = [1, 3, 4, 7, 12, 14, 15, 16]

LADO_SPRITE = 192   # casilla de 80 dp × 2,4 px/dp con zoom: de sobra para un vídeo de 432 px de ancho
LADO_FIJO = 128     # miniaturas de 50 dp de la lista
MAX_FOTOGRAMAS = 72

AYUDANTE = """
// Avanza una hoja de fotogramas al ritmo del vídeo: el fotograma visible es
// función del tiempo de la línea de tiempo, nunca de un reloj propio.
// «desfase» arranca cada sticker en un fotograma distinto (como en la app, donde no van sincronizados).
window.nlSprite = function (tl, el, id, inicio, duracion, desfase) {
  const s = window.NAILONG_SPRITES[id];
  const filas = Math.ceil(s.frames / s.cols);
  const f0 = (desfase || 0) * s.frames;
  el.style.backgroundImage = "url('assets/sprites/sticker_" + id + ".webp')";
  el.style.backgroundSize = (s.cols * 100) + "% " + (filas * 100) + "%";
  // Tope de 10 cambios por segundo: en celdas tan pequeñas no se nota y el MP4 pesa bastante menos.
  const TOPE = 10;
  const pintar = (f) => {
    const t = Math.floor(((f - f0) / s.fps) * TOPE) / TOPE;
    const i = Math.floor(f0 + t * s.fps) % s.frames;
    const x = s.cols > 1 ? (i % s.cols) / (s.cols - 1) * 100 : 0;
    const y = filas > 1 ? Math.floor(i / s.cols) / (filas - 1) * 100 : 0;
    el.style.backgroundPosition = x + "% " + y + "%";
  };
  pintar(f0);
  const reloj = { f: f0 };
  tl.fromTo(reloj, { f: f0 }, {
    f: f0 + duracion * s.fps, duration: duracion, ease: "none",
    onUpdate: () => pintar(reloj.f),
  }, inicio);
};
"""


def hoja(n: int) -> dict:
    im = Image.open(ORIGEN / f"sticker_{n}.webp")
    fotos, duraciones = [], []
    for fr in ImageSequence.Iterator(im):
        fotos.append(fr.convert("RGBA").resize((LADO_SPRITE, LADO_SPRITE), Image.LANCZOS))
        duraciones.append(fr.info.get("duration", 100) or 100)
    # Los muy largos se reparten a saltos regulares para que la hoja no sea enorme;
    # se conserva la duración total (fps más bajos, mismo ritmo).
    paso = math.ceil(len(fotos) / MAX_FOTOGRAMAS)
    total_ms = sum(duraciones)
    fotos = fotos[::paso]
    cols = math.ceil(math.sqrt(len(fotos)))
    filas = math.ceil(len(fotos) / cols)
    lienzo = Image.new("RGBA", (cols * LADO_SPRITE, filas * LADO_SPRITE), (0, 0, 0, 0))
    for i, f in enumerate(fotos):
        lienzo.paste(f, ((i % cols) * LADO_SPRITE, (i // cols) * LADO_SPRITE))
    lienzo.save(DESTINO / "sprites" / f"sticker_{n}.webp", quality=80, method=4)
    fps = round(len(fotos) * 1000 / total_ms, 3) if total_ms else 10
    return {"frames": len(fotos), "cols": cols, "fps": fps}


def fijo(n: int) -> None:
    im = Image.open(ORIGEN / f"sticker_{n}.webp")
    im.seek(0)   # la lista de la app enseña el primer fotograma (sin autoplay)
    im.convert("RGBA").resize((LADO_FIJO, LADO_FIJO), Image.LANCZOS).save(
        DESTINO / "stills" / f"sticker_{n}.webp", quality=85, method=4)


def icono() -> None:
    """Icono adaptativo de la app tal como lo pinta Android (y se ve en las capturas del móvil):
    fondo #FFD93D, primer plano = fotograma 0 del sticker 2 al 76 % de un lienzo de 108 dp,
    recortado en círculo a los 72 dp visibles (generar_assets.py → ic_launcher_foreground.png)."""
    from PIL import ImageDraw
    im = Image.open(ORIGEN / "sticker_2.webp")
    im.seek(0)
    lado = 192
    lienzo_108 = round(lado * 108 / 72)          # el lienzo adaptativo completo
    cara = im.convert("RGBA").resize((round(lienzo_108 * 0.76),) * 2, Image.LANCZOS)
    capa = Image.new("RGBA", (lienzo_108, lienzo_108), (255, 217, 61, 255))
    off = (lienzo_108 - cara.size[0]) // 2
    capa.paste(cara, (off, off + max(1, round(lienzo_108 * 0.015))), cara)
    corte = (lienzo_108 - lado) // 2
    capa = capa.crop((corte, corte, corte + lado, corte + lado))
    mascara = Image.new("L", (lado, lado), 0)
    ImageDraw.Draw(mascara).ellipse((0, 0, lado - 1, lado - 1), fill=255)
    icono = Image.new("RGBA", (lado, lado), (0, 0, 0, 0))
    icono.paste(capa, (0, 0), mascara)
    icono.save(DESTINO / "icono_app.png")


def fuentes() -> str:
    destino = DESTINO / "fonts"
    destino.mkdir(parents=True, exist_ok=True)
    if (FUENTES_APP / "fredoka_regular.ttf").exists():
        for nombre in ("fredoka_regular.ttf", "fredoka_medium.ttf", "fredoka_semibold.ttf", "fredoka_bold.ttf"):
            shutil.copy2(FUENTES_APP / nombre, destino / nombre)
        return "app"
    # Sin el código de la app: la Fredoka del tráiler (no trae 400; el texto normal sale en 500).
    for f in FUENTES_TRAILER.glob("*.woff2"):
        shutil.copy2(f, destino / f.name)
    return "trailer"


def main() -> None:
    for sub in ("sprites", "stills", "js"):
        (DESTINO / sub).mkdir(parents=True, exist_ok=True)
    datos = {}
    for n in PACK_1:
        datos[str(n)] = hoja(n)
        print(f"sprite sticker_{n}: {datos[str(n)]}")
    for n in PACK_1[:6] + PACK_2[:6] + PACK_3[:6] + PACK_4[:6] + ESTATICOS[:6]:
        fijo(n)
    icono()
    origen_fuentes = fuentes()
    (DESTINO / "js" / "sprites.js").write_text(
        "// Generado por video-promo/app-demo/tools/preparar_assets.py — no editar a mano.\n"
        f"window.NAILONG_SPRITES = {json.dumps(datos)};\n"
        f"window.NAILONG_FUENTES = {json.dumps(origen_fuentes)};\n" + AYUDANTE,
        encoding="utf-8")
    print(f"Listo en {DESTINO} (fuentes: {origen_fuentes})")


if __name__ == "__main__":
    main()
