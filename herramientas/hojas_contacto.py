#!/usr/bin/env python3
"""Hojas de contacto de los stickers: una fila por sticker con 6 fotogramas repartidos por su animacion.

Sirve para revisar de un vistazo que el titulo y la descripcion de ALL_STICKERS
(js/02-datos-stickers.js) describen lo que se ve, tambien en los animados.

Uso (desde la carpeta del proyecto):
  python herramientas/hojas_contacto.py CARPETA_SALIDA [stickers_por_hoja]

Las hojas (hoja_001-005.png ...) se escriben en CARPETA_SALIDA; usar una carpeta temporal, no el repo.
"""
import os
import re
import sys

from PIL import Image, ImageDraw

DIR = 'Stickers Nailong'
FOTOGRAMAS = 6
LADO = 150
MARGEN = 44   # hueco a la izquierda para el numero


def fila(n):
    im = Image.open(f'{DIR}/sticker_{n}.webp')
    total = getattr(im, 'n_frames', 1)
    idx = sorted({round(i * (total - 1) / (FOTOGRAMAS - 1)) for i in range(FOTOGRAMAS)}) if total > 1 else [0]
    tira = Image.new('RGB', (MARGEN + FOTOGRAMAS * LADO, LADO), (245, 245, 245))
    for pos, k in enumerate(idx):
        im.seek(k)
        f = im.convert('RGBA').resize((LADO, LADO), Image.LANCZOS)
        tira.paste(f, (MARGEN + pos * LADO, 0), f)
    d = ImageDraw.Draw(tira)
    d.text((4, 4), f'#{n}', fill=(200, 0, 0))
    d.text((4, 20), f'{total}f', fill=(90, 90, 90))
    return tira


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    salida = sys.argv[1]
    por_hoja = int(sys.argv[2]) if len(sys.argv) > 2 else 5
    os.makedirs(salida, exist_ok=True)
    ids = sorted(int(m.group(1)) for f in os.listdir(DIR) if (m := re.fullmatch(r'sticker_(\d+)\.webp', f)))
    for i in range(0, len(ids), por_hoja):
        grupo = ids[i:i + por_hoja]
        hoja = Image.new('RGB', (MARGEN + FOTOGRAMAS * LADO, LADO * len(grupo) + 2 * (len(grupo) - 1)), (255, 255, 255))
        for j, n in enumerate(grupo):
            hoja.paste(fila(n), (0, j * (LADO + 2)))
        nombre = os.path.join(salida, f'hoja_{grupo[0]:03d}-{grupo[-1]:03d}.png')
        hoja.save(nombre)
        print(nombre)


if __name__ == '__main__':
    main()
