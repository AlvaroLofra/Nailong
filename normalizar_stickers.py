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
  python normalizar_stickers.py --clasificar DIR  # separa las descargas de DIR en _nuevos / _repetidos /
                                                # _dudosos (copias) y crea DIR/_informe.html para revisarlas
  python normalizar_stickers.py --descartar F...  # apunta ficheros que no se quieren: no vuelven a salir como nuevos

Tras --import imprime las lineas esqueleto para ALL_STICKERS de index.html
(falta rellenar title / cat / sound / desc) y avisa de posibles duplicados.
"""
import io
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
LEGACY_MAX = 42            # stickers 1-42: originales que ya funcionan, no se re-codifican
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


LOOP_MSG = 'se reproduce un numero fijo de veces (contador de bucle del ANIM distinto de 0)'


def anim_offset(b):
    """Posicion del chunk ANIM dentro del WebP (None si es estatico)."""
    i = 12
    while i < len(b):
        tag, size = b[i:i + 4], struct.unpack('<I', b[i + 4:i + 8])[0]
        if tag == b'ANIM':
            return i
        i += 8 + size + (size & 1)
    return None


def loop_count(path):
    """Veces que se repite la animacion segun el chunk ANIM (0 = bucle infinito; None = estatico)."""
    b = open(path, 'rb').read()
    i = anim_offset(b)
    return None if i is None else struct.unpack('<H', b[i + 12:i + 14])[0]


def fix_loop(path):
    """Pone el contador de bucle a 0 (infinito) tocando solo esos 2 bytes: no re-codifica la imagen."""
    b = bytearray(open(path, 'rb').read())
    i = anim_offset(b)
    b[i + 12:i + 14] = struct.pack('<H', 0)
    open(path, 'wb').write(bytes(b))


def problems(path, strict=True):
    """Lista de motivos por los que WhatsApp no tomaria el archivo como sticker.
    strict=False omite la estructura de fotogramas (stickers 1-42 originales, que ya funcionan)."""
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
    if n > 1 and loop_count(path) not in (None, 0):
        out.append(LOOP_MSG)
    if strict and n > 1:
        out += structure_problems(path)
    return out


def structure_problems(path):
    """Estructura que WhatsApp acepta en animados: fotogramas a lienzo completo, sin offsets, con ALPH."""
    b = open(path, 'rb').read()
    i, bad_part, no_alpha, frames = 12, 0, 0, 0
    while i < len(b):
        tag, size = b[i:i + 4], struct.unpack('<I', b[i + 4:i + 8])[0]
        if tag == b'ANMF':
            d = b[i + 8:i + 8 + size]
            frames += 1
            x = int.from_bytes(d[0:3], 'little'); y = int.from_bytes(d[3:6], 'little')
            w = int.from_bytes(d[6:9], 'little') + 1; h = int.from_bytes(d[9:12], 'little') + 1
            if x or y or (w, h) != (SIZE, SIZE):
                bad_part += 1
            if b'ALPH' not in d[16:]:
                no_alpha += 1
        i += 8 + size + (size & 1)
    out = []
    if bad_part:
        out.append(f'{bad_part} fotogramas parciales/con offset (deben ser lienzo completo)')
    if no_alpha:
        out.append(f'{no_alpha} fotogramas sin chunk ALPH')
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


def _chunk(tag, payload):
    return tag + struct.pack('<I', len(payload)) + payload + (b'\x00' if len(payload) & 1 else b'')


def _frame_chunks(frame, quality):
    """Codifica un fotograma como WebP estatico (ALPH + VP8) y devuelve esos dos chunks.
    Fuerza un pixel con alfa 254 para que SIEMPRE exista el chunk ALPH, como en los
    stickers que WhatsApp acepta (todos los fotogramas con ALPH + VP8)."""
    f = frame.copy()
    r, g, b, a = f.getpixel((SIZE - 1, SIZE - 1))
    if a == 255:
        f.putpixel((SIZE - 1, SIZE - 1), (r, g, b, 254))
    buf = io.BytesIO()
    f.save(buf, format='WEBP', quality=quality, method=4)
    data, i, keep = buf.getvalue(), 12, []
    while i < len(data):
        tag, size = data[i:i + 4], struct.unpack('<I', data[i + 4:i + 8])[0]
        if tag in (b'ALPH', b'VP8 '):
            keep.append(_chunk(tag, data[i + 8:i + 8 + size]))
        i += 8 + size + (size & 1)
    return b''.join(keep)


def build_animated(frames, durs, quality, exif):
    """WebP animado 'estilo sticker': TODOS los fotogramas a lienzo completo (sin sub-rectangulos,
    sin offsets, sin mezcla entre fotogramas), cada uno con ALPH + VP8. Es la estructura de los
    stickers animados que WhatsApp reconoce; el codificador de Pillow produce fotogramas parciales
    y VP8 sin ALPH que WhatsApp rechaza como sticker."""
    w = h = SIZE
    vp8x = _chunk(b'VP8X', bytes([0x1A, 0, 0, 0]) + (w - 1).to_bytes(3, 'little') + (h - 1).to_bytes(3, 'little'))
    anim = _chunk(b'ANIM', b'\x00\x00\x00\x00' + struct.pack('<H', 0))
    body = vp8x + anim
    for fr, d in zip(frames, durs):
        hdr = (0).to_bytes(3, 'little') * 2 + (w - 1).to_bytes(3, 'little') + (h - 1).to_bytes(3, 'little')             + d.to_bytes(3, 'little') + bytes([3])   # 3 = liberar a fondo + sin mezcla
        body += _chunk(b'ANMF', hdr + _frame_chunks(fr, quality))
    body += _chunk(b'EXIF', exif)
    return b'RIFF' + struct.pack('<I', 4 + len(body)) + b'WEBP' + body


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
            if len(fr) > 1:
                open(tmp, 'wb').write(build_animated(fr, du, q, exif))
            else:
                fr[0].save(tmp, format='WEBP', quality=q, method=4, exif=exif)
            if os.path.getsize(tmp) <= limit:
                os.replace(tmp, dst)
                return len(fr), os.path.getsize(dst) / 1024
        if len(sq) // step < 4:
            raise RuntimeError(f'No se pudo reducir {src} por debajo del limite')
        step += 1  # ultimo recurso: quitar fotogramas alternos


# ---------------------------------------------------------------------------
# Deteccion de repetidos
# ---------------------------------------------------------------------------
# Cada sticker se resume en una "firma": hasta 8 fotogramas repartidos por la animacion,
# llevados a 512x512 (igual que al importar), con la transparencia rellena de blanco y
# reducidos a 32x32 en color. La distancia entre dos firmas es la diferencia media de color
# (0 = identicos, 255 = opuestos), emparejando cada fotograma con el mas parecido del otro.
# Umbrales calibrados con el catalogo real (2026-11-15): una copia reducida a 240 px y
# re-codificada de un sticker queda a <= 14 de su original; los dos stickers distintos mas
# parecidos del catalogo quedan a 21. verify_all.py vigila que ese margen se mantenga.
FIRMA_FOTOGRAMAS = 8
FIRMA_LADO = 32
UMBRAL_REPETIDO = 15       # por debajo: es el mismo sticker
UMBRAL_DUDOSO = 20         # entre ambos: se parece mucho, lo decide una persona
EXT_IMPORTABLES = ('.webp', '.gif', '.png', '.jpg', '.jpeg')
REGISTRO_VISTOS = 'herramientas/stickers_vistos.json'          # huella exacta -> decision
FIRMAS_DESCARTADOS = 'herramientas/stickers_descartados.npz'   # firmas de los que se decidio no incluir
SALIDAS = ('_nuevos', '_repetidos', '_dudosos')


def firma(path):
    """Firma visual de un sticker (matriz fotogramas x 32 x 32 x 3)."""
    im = Image.open(path)
    n = getattr(im, 'n_frames', 1)
    idx = sorted({round(i * (n - 1) / (FIRMA_FOTOGRAMAS - 1)) for i in range(FIRMA_FOTOGRAMAS)}) if n > 1 else [0]
    out = []
    for k in idx:
        im.seek(k)
        f = to_square(im.convert('RGBA'))
        fondo = Image.new('RGBA', f.size, (255, 255, 255, 255))
        fondo.alpha_composite(f)
        out.append(np.asarray(fondo.convert('RGB').resize((FIRMA_LADO, FIRMA_LADO), Image.BILINEAR), dtype=np.float32))
    return np.stack(out)


def distancia(a, b):
    """Distancia entre dos firmas, simetrica: media del mejor emparejamiento en ambos sentidos."""
    d = np.abs(a[:, None] - b[None]).mean(axis=(2, 3, 4))
    return float((d.min(axis=1).mean() + d.min(axis=0).mean()) / 2)


def firmas_conocidas():
    """Firmas de todo lo que ya se conoce: catalogo, descatalogados y descartados.
    Las del catalogo se guardan en una cache temporal (se recalculan si cambia el fichero)."""
    import tempfile
    cache_path = os.path.join(tempfile.gettempdir(), 'nailong_firmas_cache.npz')
    cache = {}
    if os.path.exists(cache_path):
        try:
            with np.load(cache_path) as z:
                cache = {k: z[k] for k in z.files}
        except Exception:
            cache = {}
    conocidas, nueva_cache = {}, {}
    for f in sorted(os.listdir(DIR)):
        if not f.lower().endswith('.webp') or f.startswith('creador'):
            continue
        p = os.path.join(DIR, f)
        st = os.stat(p)
        clave = f'{f}|{st.st_size}|{int(st.st_mtime)}'
        sig = cache[clave] if clave in cache else firma(p)
        nueva_cache[clave] = sig
        conocidas[f] = sig
    try:
        np.savez_compressed(cache_path, **nueva_cache)
    except Exception:
        pass
    if os.path.exists(FIRMAS_DESCARTADOS):
        with np.load(FIRMAS_DESCARTADOS) as z:
            for k in z.files:
                conocidas[f'descartado:{k}'] = z[k].astype(np.float32)
    return conocidas


def mas_parecido(sig, conocidas):
    """(nombre, distancia) del conocido mas parecido, o (None, inf) si no hay ninguno."""
    mejor, dmin = None, float('inf')
    for nombre, otra in conocidas.items():
        d = distancia(sig, otra)
        if d < dmin:
            mejor, dmin = nombre, d
    return mejor, dmin


def sha256(path):
    import hashlib
    return hashlib.sha256(open(path, 'rb').read()).hexdigest()


def leer_registro():
    if os.path.exists(REGISTRO_VISTOS):
        return json.load(open(REGISTRO_VISTOS, encoding='utf-8'))
    return {}


def guardar_registro(reg):
    os.makedirs(os.path.dirname(REGISTRO_VISTOS), exist_ok=True)
    json.dump(reg, open(REGISTRO_VISTOS, 'w', encoding='utf-8'), ensure_ascii=False, indent=1, sort_keys=True)


def clasificar(src_dir):
    """Reparte las descargas de src_dir en _nuevos / _repetidos / _dudosos (copias; no borra los originales)."""
    import html
    import shutil
    from pathlib import Path
    files = sorted(f for f in os.listdir(src_dir)
                   if f.lower().endswith(EXT_IMPORTABLES) and os.path.isfile(os.path.join(src_dir, f)))
    if not files:
        print(f'No hay imagenes ({", ".join(EXT_IMPORTABLES)}) en {src_dir}')
        return
    for sub in SALIDAS:   # las tres carpetas de salida se rehacen en cada pasada
        shutil.rmtree(os.path.join(src_dir, sub), ignore_errors=True)
        os.makedirs(os.path.join(src_dir, sub))
    print(f'Comparando {len(files)} descargas con la coleccion...')
    conocidas = firmas_conocidas()
    registro = leer_registro()
    filas, cuenta = [], dict.fromkeys(SALIDAS, 0)
    for f in files:
        p = os.path.join(src_dir, f)
        h = sha256(p)
        if h in registro:
            destino, parecido, d = '_repetidos', registro[h], 0.0
            motivo = 'descarga identica a una ya revisada'
        else:
            try:
                sig = firma(p)
            except Exception as e:
                print(f'  {f}: no se pudo leer ({e}); se deja como dudoso')
                destino, parecido, d, motivo = '_dudosos', None, float('inf'), 'no se pudo leer'
                sig = None
            if sig is not None:
                parecido, d = mas_parecido(sig, conocidas)
                if d < UMBRAL_REPETIDO:
                    destino, motivo = '_repetidos', 'igual a uno que ya tienes'
                    # Solo se apunta lo que coincide con la coleccion: un repetido dentro del propio
                    # lote no, porque en la siguiente pasada se llevaria por delante al original.
                    if not parecido.startswith('esta carpeta:'):
                        registro[h] = parecido
                    else:
                        motivo = 'repetido dentro de esta misma carpeta'
                elif d < UMBRAL_DUDOSO:
                    destino, motivo = '_dudosos', 'se parece mucho: miralo en el informe'
                else:
                    destino, motivo = '_nuevos', 'no se parece a ninguno'
                    conocidas[f'esta carpeta:{f}'] = sig   # asi un repetido dentro del lote solo entra una vez
        shutil.copy2(p, os.path.join(src_dir, destino, f))
        cuenta[destino] += 1
        filas.append((destino, f, parecido, d, motivo))
    guardar_registro(registro)

    def ruta_conocido(nombre):
        if nombre is None or nombre.startswith('descartado:'):
            return None
        if nombre.startswith('esta carpeta:'):
            return nombre.split(':', 1)[1]
        return Path(DIR, nombre).resolve().as_uri()

    orden = {'_dudosos': 0, '_repetidos': 1, '_nuevos': 2}
    trozos = []
    for destino, f, parecido, d, motivo in sorted(filas, key=lambda r: (orden[r[0]], r[3])):
        ruta = ruta_conocido(parecido)
        img2 = f'<img src="{html.escape(ruta)}" loading="lazy">' if ruta and destino != '_nuevos' else ''
        con = html.escape(parecido or '') if destino != '_nuevos' else ''
        dist = '' if d in (0.0, float('inf')) else f'{d:.1f}'
        trozos.append(f'<tr class="{destino[1:]}"><td>{destino[1:]}</td><td><img src="{html.escape(f)}" loading="lazy"><br>{html.escape(f)}</td>'
                      f'<td>{img2}<br>{con}</td><td>{dist}</td><td>{html.escape(motivo)}</td></tr>')
    informe = os.path.join(src_dir, '_informe.html')
    open(informe, 'w', encoding='utf-8').write(
        '<!doctype html><meta charset="utf-8"><title>Clasificacion de stickers</title>'
        '<style>body{font-family:sans-serif;margin:16px}img{width:140px;height:140px;object-fit:contain;background:#eee}'
        'td{padding:6px 12px;border-bottom:1px solid #ddd;text-align:center}.dudosos{background:#fff3cd}'
        '.repetidos{background:#f1f1f1}.nuevos{background:#e6f6e6}</style>'
        f'<h1>{cuenta["_nuevos"]} nuevos, {cuenta["_repetidos"]} repetidos, {cuenta["_dudosos"]} dudosos</h1>'
        '<p>Distancia: 0 = identicos. Por debajo de '
        f'{UMBRAL_REPETIDO} se da por repetido; entre {UMBRAL_REPETIDO} y {UMBRAL_DUDOSO}, dudoso.</p>'
        '<table><tr><th>Resultado</th><th>Descarga</th><th>Se parece a</th><th>Distancia</th><th>Motivo</th></tr>'
        + ''.join(trozos) + '</table>')
    print(f'\n{cuenta["_nuevos"]} nuevos, {cuenta["_repetidos"]} repetidos, {cuenta["_dudosos"]} dudosos.')
    print(f'Informe con las imagenes lado a lado: {informe}')
    if cuenta['_dudosos']:
        print('Dudosos: abre el informe y mueve a _nuevos los que de verdad sean distintos.')
    print(f'Para anadir los nuevos:      python normalizar_stickers.py --import "{os.path.join(src_dir, "_nuevos")}"')
    print('Para no volver a ver uno:    python normalizar_stickers.py --descartar RUTA_DEL_FICHERO')


def descartar(paths):
    """Apunta ficheros como 'no los quiero': no volveran a salir como nuevos (ni identicos ni re-codificados)."""
    registro = leer_registro()
    firmas = {}
    if os.path.exists(FIRMAS_DESCARTADOS):
        with np.load(FIRMAS_DESCARTADOS) as z:
            firmas = {k: z[k] for k in z.files}
    for p in paths:
        h = sha256(p)
        registro[h] = f'descartado:{os.path.basename(p)}'
        firmas[h[:16]] = np.round(firma(p)).astype(np.uint8)
        print(f'Descartado: {p}')
    guardar_registro(registro)
    np.savez_compressed(FIRMAS_DESCARTADOS, **firmas)


def warn_duplicates(new_ids, all_ids):
    sigs = {i: firma(f'{DIR}/sticker_{i}.webp') for i in all_ids}
    for a in new_ids:
        for b in all_ids:
            if a != b:
                d = distancia(sigs[a], sigs[b])
                if d < UMBRAL_DUDOSO:
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
    if '--clasificar' in args:
        clasificar(args[args.index('--clasificar') + 1])
        return
    if '--descartar' in args:
        descartar(args[args.index('--descartar') + 1:])
        return
    check_only = '--check' in args
    ids = sticker_ids()
    gaps = [i for i in range(1, max(ids) + 1) if i not in ids]
    if gaps:
        print(f'AVISO: faltan numeros en la coleccion: {gaps} (renumerar y actualizar index.html)')

    if '--import' in args:
        src_dir = args[args.index('--import') + 1]
        files = sorted(f for f in os.listdir(src_dir) if f.lower().endswith(EXT_IMPORTABLES))
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
        pr = problems(p, strict=i > LEGACY_MAX)
        if not pr:
            continue
        bad += 1
        if check_only:
            print(f'sticker_{i}: ' + '; '.join(pr))
        elif pr == [LOOP_MSG]:
            fix_loop(p)   # solo el contador: arreglo sin perdida, tambien en los originales 1-42
            print(f'sticker_{i} corregido ({LOOP_MSG}) -> bucle infinito')
        else:
            frames, kb = convert(p, p)
            print(f'sticker_{i} corregido ({"; ".join(pr)}) -> 512x512, {frames} fotogramas, {kb:.0f} KB')
    print(f'{bad} sticker(s) {"con problemas" if check_only else "corregidos"}; {len(ids) - bad} ya correctos.')
    if check_only and bad:
        sys.exit(1)


if __name__ == '__main__':
    main()
