#!/usr/bin/env python3
"""Genera variantes animadas (2 fotogramas idénticos) para los 23 stickers estáticos de Nailong.

Permite que en «Mi Selección», si el usuario mezcla stickers animados y estáticos,
todos los stickers seleccionados puedan empaquetarse en un ÚNICO pack animado
100% conforme con las exigencias de WhatsApp (que exige que todos los stickers
de un pack animado tengan más de un fotograma y formato WebP animado).

Reutiliza el muxer y la estructura de fotogramas validada de normalizar_stickers.py.
"""
import argparse
import os
import re
import struct
import sys
from PIL import Image

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

import normalizar_stickers as ns

# Parámetros conformes con la especificación de WhatsApp
SIZE = 512
FRAME_COUNT = 2
FRAME_DURATION_MS = 500  # 500 ms por fotograma -> 1000 ms total (1.0 s)
MAX_FILE_KB = 500
MIN_FRAME_MS = 8
MAX_TOTAL_MS = 10000
QUALITY = 80


def find_app_dir(explicit_dir=None):
    if explicit_dir and os.path.isdir(explicit_dir):
        return explicit_dir
    local_md = os.path.join(os.path.dirname(__file__), 'CLAUDE.local.md')
    if os.path.exists(local_md):
        with open(local_md, 'r', encoding='utf-8') as f:
            for line in f:
                if 'nailong_stickers_app' in line:
                    m = re.search(r'([A-Za-z]:\\[^\s`]+|/[^\s`]+)', line)
                    if m and os.path.isdir(m.group(1)):
                        return m.group(1)
    raise RuntimeError("No se encontró el directorio de la app Android. Usa --app-dir <ruta> o configúralo en CLAUDE.local.md.")


def inspect_webp(path):
    """Inspecciona a fondo un archivo WebP para validar los requisitos de WhatsApp."""
    b = open(path, 'rb').read()
    im = Image.open(path)
    n_frames = getattr(im, 'n_frames', 1)
    w, h = im.size
    kb = len(b) / 1024

    # Extraer chunks y duraciones de ANMF
    chunks = []
    durations = []
    i = 12
    has_exif = False
    has_anim = False
    anmf_full_frame = True
    anmf_has_alph = True

    while i < len(b):
        tag = b[i:i + 4]
        size = struct.unpack('<I', b[i + 4:i + 8])[0]
        chunks.append(tag)
        if tag == b'EXIF':
            has_exif = True
        elif tag == b'ANIM':
            has_anim = True
        elif tag == b'ANMF':
            d = b[i + 8:i + 8 + size]
            dur = int.from_bytes(d[12:15], 'little')
            durations.append(dur)
            x = int.from_bytes(d[0:3], 'little')
            y = int.from_bytes(d[3:6], 'little')
            fw = int.from_bytes(d[6:9], 'little') + 1
            fh = int.from_bytes(d[9:12], 'little') + 1
            if x != 0 or y != 0 or (fw, fh) != (SIZE, SIZE):
                anmf_full_frame = False
            if b'ALPH' not in d[16:]:
                anmf_has_alph = False
        i += 8 + size + (size & 1)

    exif_valid = b'sticker-pack-id' in b
    total_dur_ms = sum(durations)

    # Validaciones individuales
    checks = {
        'dims_512': (w == SIZE and h == SIZE),
        'frames_gt_1': (n_frames > 1 and len(durations) > 1),
        'size_le_500kb': (kb <= MAX_FILE_KB),
        'frame_dur_ge_8ms': all(d >= MIN_FRAME_MS for d in durations) if durations else False,
        'total_dur_le_10s': (total_dur_ms <= MAX_TOTAL_MS),
        'has_exif_pack_id': (has_exif and exif_valid),
        'anmf_full_frame': anmf_full_frame,
        'anmf_has_alph': anmf_has_alph,
    }
    all_ok = all(checks.values()) and (len(ns.problems(path, strict=True)) == 0)

    return {
        'filename': os.path.basename(path),
        'bytes': len(b),
        'kb': kb,
        'frames': n_frames,
        'durations': durations,
        'total_dur_ms': total_dur_ms,
        'dims': f"{w}x{h}",
        'checks': checks,
        'all_ok': all_ok,
    }


def generate(app_dir=None, check_only=False):
    base_app = find_app_dir(app_dir)
    src_dir = os.path.join(base_app, 'stickers', 'Android', 'app', 'src', 'main', 'assets', 'nailong_estaticos')
    dst_dir = os.path.join(base_app, 'stickers', 'Android', 'app', 'src', 'main', 'assets', 'nailong_estaticos_animados')

    if not os.path.isdir(src_dir):
        raise RuntimeError(f"No existe la carpeta de origen: {src_dir}")

    files = sorted([f for f in os.listdir(src_dir) if f.endswith('.webp')])
    if len(files) != 23:
        print(f"AVISO: Se esperaban 23 stickers estáticos, encontrados {len(files)}.")

    os.makedirs(dst_dir, exist_ok=True)
    results = []
    total_bytes = 0

    exif = ns.whatsapp_exif()

    for idx, f in enumerate(files, 1):
        src_path = os.path.join(src_dir, f)
        dst_path = os.path.join(dst_dir, f)

        if not check_only:
            im = Image.open(src_path)
            sq = ns.to_square(im)
            # 2 fotogramas idénticos para que visualmente permanezca completamente quieto
            frames = [sq, sq]
            durs = [FRAME_DURATION_MS, FRAME_DURATION_MS]
            data = ns.build_animated(frames, durs, quality=QUALITY, exif=exif)
            with open(dst_path, 'wb') as out_f:
                out_f.write(data)

        info = inspect_webp(dst_path)
        results.append(info)
        total_bytes += info['bytes']

    return results, total_bytes, dst_dir


def print_table(results, total_bytes, dst_dir):
    print("\n" + "=" * 90)
    print("REPORTE DE GENERACIÓN Y VALIDACIÓN: VARIANTES ANIMADAS DE STICKERS ESTÁTICOS")
    print("=" * 90)
    print(f"Carpeta destino: {dst_dir}")
    print(f"Total stickers procesados: {len(results)} (admitidos por pack animado: máx. 30)")
    print(f"Peso total real en assets: {total_bytes:,} bytes ({total_bytes / 1024:.2f} KB / {total_bytes / (1024 * 1024):.2f} MB)")
    print("-" * 90)
    print(f"{'#':<3} {'Fichero':<20} {'Tamaño':<10} {'Frames':<7} {'Duración':<12} {'512x512':<8} {'<=500KB':<8} {'EXIF WA':<8} {'Estado':<6}")
    print("-" * 90)

    all_passed = True
    for idx, r in enumerate(results, 1):
        c = r['checks']
        status = "✔ OK" if r['all_ok'] else "❌ FALLO"
        if not r['all_ok']:
            all_passed = False
        dur_str = f"{r['total_dur_ms']}ms (2x{r['durations'][0]}ms)"
        print(f"{idx:<3} {r['filename']:<20} {r['kb']:>6.1f} KB  {r['frames']:<7} {dur_str:<12} "
              f"{'✔' if c['dims_512'] else '❌':<8} {'✔' if c['size_le_500kb'] else '❌':<8} "
              f"{'✔' if c['has_exif_pack_id'] else '❌':<8} {status}")

    print("-" * 90)
    if all_passed:
        print("✔ TODOS LOS 23 STICKERS CUMPLEN EL 100% DE REQUISITOS TÉCNICOS DE WHATSAPP.")
    else:
        print("❌ AL MENOS UN STICKER NO HA SUPERADO LAS COMPROBACIONES.")
    print("=" * 90 + "\n")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Generar variantes animadas de 2 fotogramas para stickers estáticos")
    parser.add_argument('--app-dir', help="Ruta a nailong_stickers_app", default=None)
    parser.add_argument('--check', action='store_true', help="Solo comprobar sin volver a generar")
    args = parser.parse_args()

    results, total_bytes, dst_dir = generate(args.app_dir, check_only=args.check)
    print_table(results, total_bytes, dst_dir)
