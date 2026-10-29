#!/usr/bin/env python3
"""Normaliza los stickers de 'Stickers Nailong/' al formato que exige WhatsApp.

WhatsApp solo reconoce un WebP compartido como sticker si es 512x512, pesa
<=100 KB (estatico) / <=500 KB (animado) y lleva el EXIF de WhatsApp
('sticker-pack-id'...). Los stickers descargados de TikTok suelen ser 240x240 y
sin EXIF, por eso llegaban a WhatsApp como imagen suelta.

Uso (desde la carpeta del proyecto):
  python normalizar_stickers.py                 # corrige en sitio los sticker_N.webp que no cumplan
  python normalizar_stickers.py --import DIR    # convierte los .webp/.gif/.png de DIR y los anade
                                                # como sticker_(N+1).webp, sticker_(N+2).webp...
  python normalizar_stickers.py --check         # solo informa, no modifica nada

Tras --import imprime las lineas esqueleto para ALL_STICKERS de index.html
(falta rellenar title / cat / sound / desc) y avisa de posibles duplicados.
"""
import json
import os
import re
import struct
import sys

import numpy as np
from PIL import Image

DIR = 'Stickers Nailong'
SIZE = 512
MAX_STATIC_KB = 100
MAX_ANIM_KB = 500
MIN_FRAME_MS = 20          # WhatsApp exige >= 8 ms; 20 da margen
MAX_TOTAL_MS = 10000       # WhatsApp: animacion <= 10 s
PACK = {
    'sticker-pack-id': 'bc5ea55c-2fd4-43b7-856d-e2898d3563b9',
    'sticker-pack-name': 'Muñeco amarillo',
    'sticker-pack-publisher': '',
    'android-app-store-link': 'https://play.google.com/store/apps/details?id=com.snowcorp.stickerly.android',
    'ios-app-store-link': 'https://itunes.apple.com/app/id1458740001?mt=8',
    'is-from-user-created-pack': 1,
}


def whatsapp_exif():
    """EXIF identico al de los stickers originales (TIFF big-endian con la etiqueta 'WA')."""
    js = json.dumps(PACK, ensure_ascii=False, separators=(',', ':')).replace('/', '\\/').encode('utf-8')
    return b'MM\x00*\x00\x00\x00\x08\x00\x01WA\x00\x07' + struct.pack('>I', len(js)) + b'\x00\x00\x00\x1a\x00\x00\x00\x00' + js


def webp_chunks(path):
    b = open(path, 'rb').read()
    i, out = 12, []
    while i < len(b):
        t, s = b[i:i + 4], struct.unpack('<I', b[i + 4:i + 8])[0]
        out.append(t)
        i += 8 + s + (s & 1)
    return out


def problems(path):
    """Lista de motivos por los que WhatsApp no tomaria el archivo como sticker."""
    out = []
    im = Image.open(path)
    n = getattr(im, 'n_frames', 1)
    kb = os.path.getsize(path) / 1024
    if im.size != (SIZE, SIZE):
        out.append(f'tamano {im.size[0]}x{im.size[1]} (debe ser 512x512)')
    if b'EXIF' not in webp_chunks(path):
        out.append('sin EXIF de WhatsApp')
    if kb > (MAX_ANIM_KB if n > 1 else MAX_STATIC_KB):
        out.append(f'pesa {kb:.0f} KB (limite {MAX_ANIM_KB if n > 1 else MAX_STATIC_KB})')
    return out


def load_frames(path):
    im = Image.open(path)
    frames, durs = [], []
    for k in range(getattr(im, 'n_frames', 1)):
        im.seek(k)
        frames.append(im.convert('RGBA'))
        durs.append(max(im.info.get('duration', 60) or 60, MIN_FRAME_MS))
    return frames, durs


def to_square(frame):
    """Escala (tambien hacia arriba) para caber en 512x512 y centra sobre lienzo transparente (sin deformar)."""
    f = frame.copy()
    scale = min(SIZE / f.width, SIZE / f.height)   # escala hacia arriba o abajo hasta llenar 512
    f = f.resize((max(1, round(f.width * scale)), max(1, round(f.height * scale))), Image.LANCZOS)
    canvas = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    canvas.paste(f, ((SIZE - f.width) // 2, (SIZE - f.height) // 2))
    return canvas


def convert(src, dst):
    """Convierte src a un WebP valido para WhatsApp en dst. Devuelve (frames, KB)."""
    frames, durs = load_frames(src)
    # Limite de 10 s: si se pasa, se aceleran los fotogramas proporcionalmente.
    total = sum(durs)
    if total > MAX_TOTAL_MS:
        durs = [max(MIN_FRAME_MS, int(d * MAX_TOTAL_MS / total)) for d in durs]
    sq = [to_square(f) for f in frames]
    exif = whatsapp_exif()
    limit = (MAX_ANIM_KB if len(sq) > 1 else MAX_STATIC_KB) * 1024 * 0.96
    step = 1
    while True:
        fr = sq[::step]
        du = [sum(durs[i:i + step]) for i in range(0, len(sq), step)]
        for q in (80, 70, 60, 50, 40, 30):
            tmp = dst + '.tmp'
            kw = dict(format='WEBP', quality=q, method=4, exif=exif)
            if len(fr) > 1:
                fr[0].save(tmp, save_all=True, append_images=fr[1:], duration=du, loop=0, **kw)
            else:
                fr[0].save(tmp, **kw)
            if os.path.getsize(tmp) <= limit:
                os.replace(tmp, dst)
                return len(fr), os.path.getsize(dst) / 1024
        if len(sq) // step < 4:
            raise RuntimeError(f'No se pudo reducir {src} por debajo del limite')
        step += 1  # ultimo recurso: quitar fotogramas alternos


def signature(path):
    im = Image.open(path)
    n = getattr(im, 'n_frames', 1)
    sigs = []
    for k in range(0, n, max(1, n // 6)):
        im.seek(k)
        sigs.append(np.array(im.convert('RGBA').resize((24, 24)).convert('L'), dtype=float))
    return sigs


def warn_duplicates(new_ids, all_ids):
    sigs = {i: signature(f'{DIR}/sticker_{i}.webp') for i in all_ids}
    for a in new_ids:
        for b in all_ids:
            if a != b:
                d = min(np.abs(x - y).mean() for x in sigs[a] for y in sigs[b])
                if d < 8:
                    print(f'  AVISO posible duplicado: sticker_{a} ~ sticker_{b} (distancia {d:.1f})')


def sticker_ids():
    ids = []
    for f in os.listdir(DIR):
        m = re.fullmatch(r'sticker_(\d+)\.webp', f)
        if m:
            ids.append(int(m.group(1)))
    return sorted(ids)


def main():
    args = sys.argv[1:]
    check_only = '--check' in args
    ids = sticker_ids()
    gaps = [i for i in range(1, max(ids) + 1) if i not in ids]
    if gaps:
        print(f'AVISO: faltan numeros en la coleccion: {gaps} (renumerar y actualizar index.html)')

    if '--import' in args:
        src_dir = args[args.index('--import') + 1]
        files = sorted(f for f in os.listdir(src_dir) if f.lower().endswith(('.webp', '.gif', '.png')))
        nxt, added = max(ids) + 1, []
        for f in files:
            dst = f'{DIR}/sticker_{nxt}.webp'
            frames, kb = convert(os.path.join(src_dir, f), dst)
            print(f'{f} -> sticker_{nxt}.webp  ({frames} fotogramas, {kb:.0f} KB)')
            added.append((nxt, frames))
            nxt += 1
        if added:
            print('\nAnadir a ALL_STICKERS en index.html (rellenar title/cat/sound/desc) y subir los contadores 74->N:')
            for i, fr in added:
                print(f"{{ id: {i}, file: 'sticker_{i}.webp', frames: {fr}, title: 'TODO', cat: 'caritas', sound: 'pop', desc: 'TODO' }},")
            print()
            warn_duplicates([i for i, _ in added], sticker_ids())
        return

    bad = 0
    for i in ids:
        p = f'{DIR}/sticker_{i}.webp'
        pr = problems(p)
        if not pr:
            continue
        bad += 1
        if check_only:
            print(f'sticker_{i}: ' + '; '.join(pr))
        else:
            frames, kb = convert(p, p)
            print(f'sticker_{i} corregido ({"; ".join(pr)}) -> 512x512, {frames} fotogramas, {kb:.0f} KB')
    print(f'{bad} sticker(s) {"con problemas" if check_only else "corregidos"}; {len(ids) - bad} ya correctos.')
    if check_only and bad:
        sys.exit(1)


if __name__ == '__main__':
    main()
