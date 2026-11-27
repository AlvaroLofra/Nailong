"""Copias reducidas de los stickers que la web muestra en pequeño (mejora W33).

La web enseñaba el sticker entero de 512 px (hasta 500 KB) en huecos de 48-112 px: el logo de
la barra, el banner de la app, el pie y las 4 tarjetas de «¿Quién es Nailong?». Este script crea
copias de 192 px en 'Stickers Nailong/mini/' (animadas si el original lo es, en bucle infinito).

- Cada copia se llama como la CLAVE de su cromo en ALL_STICKERS (js/02-datos-stickers.js), igual
  que data-sticker (D-22): al renumerar los cromos la clave viaja con su dibujo y la copia sigue
  siendo correcta. Se generan las que pide index.html ('Stickers Nailong/mini/<clave>.webp').
- 'mini/favicon.webp': icono de la pestaña de 64 px (primer fotograma del sticker 18, que era el
  icono hasta ahora y pesaba 398 KB).
- RECORTES: copias que no son el sticker entero, sino un trozo fijo de uno de sus fotogramas.
  Bombloong solo asoma por el borde de su sticker (el dragón azul del cascarón, T2), así que su
  ficha usa ese trozo ampliado y quieto.
- Los 126 stickers oficiales no se tocan (normalizar_stickers.py --check sigue igual).

Uso:
  py -3 herramientas/miniaturas_web.py           # (re)genera las copias que faltan o han cambiado
  py -3 herramientas/miniaturas_web.py --check   # solo comprueba (lo usa verify_all.py)
"""
import io
import os
import re
import sys

from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, RAIZ)
import normalizar_stickers as ns  # noqa: E402  (firma/distancia visual del detector de repetidos)

DIR = os.path.join(RAIZ, 'Stickers Nailong')
DIR_MINI = os.path.join(DIR, 'mini')
LADO = 192                 # px: nítido en huecos de hasta ~96 px con pantallas de densidad 2
CALIDAD_ANIMADA = 70       # WebP con pérdida: a este tamaño no se notan los artefactos
CALIDAD_FIJA = 85
FAVICON = ('favicon', 'sticker_18.webp', 64)
PESO_MAX_KB = 200          # aviso de seguridad: una copia de 192 px nunca debería pasar de aquí
# clave -> (fotograma, (x0, y0, x1, y1) sobre el sticker de 512 px). La copia sale fija (1 fotograma).
RECORTES = {'bombloong': (26, (0, 205, 175, 380))}


def claves_de_catalogo():
    with open(os.path.join(RAIZ, 'js', '02-datos-stickers.js'), encoding='utf-8') as f:
        return dict(re.findall(r"clave: '([a-z0-9-]+)', file: '(sticker_\d+\.webp)'", f.read()))


def pedidas_por_la_web():
    with open(os.path.join(RAIZ, 'index.html'), encoding='utf-8') as f:
        return sorted(set(re.findall(r'Stickers Nailong/mini/([a-z0-9-]+)\.webp', f.read())))


def objetivos():
    """[(nombre, fichero_origen, lado)] de todas las copias que necesita la web."""
    claves = claves_de_catalogo()
    res = []
    for nombre in pedidas_por_la_web():
        if nombre == FAVICON[0]:
            res.append(FAVICON)
        elif nombre in claves:
            res.append((nombre, claves[nombre], LADO))
        else:
            raise SystemExit(f"index.html usa mini/{nombre}.webp pero '{nombre}' no es una clave de ALL_STICKERS")
    return res


def reducir(origen, lado, solo_primero=False, recorte=None):
    im = Image.open(origen)
    n = 1 if (solo_primero or recorte) else getattr(im, 'n_frames', 1)
    fotogramas, duraciones = [], []
    for k in range(n):
        im.seek(recorte[0] if recorte else k)
        f = im.convert('RGBA')
        if recorte:
            f = f.crop(recorte[1])
        # En alfa premultiplicado ('RGBa') para que los bordes transparentes no se oscurezcan
        f = f.convert('RGBa').resize((lado, lado), Image.LANCZOS).convert('RGBA')
        fotogramas.append(f)
        duraciones.append(im.info.get('duration', 66))
    b = io.BytesIO()
    if len(fotogramas) > 1:
        fotogramas[0].save(b, 'WEBP', save_all=True, append_images=fotogramas[1:], duration=duraciones,
                           loop=0, quality=CALIDAD_ANIMADA, method=6)
    else:
        fotogramas[0].save(b, 'WEBP', quality=CALIDAD_FIJA, method=6)
    return b.getvalue()


def comprobar(nombre, origen, lado):
    """Lista de problemas de una copia (vacía si está bien)."""
    ruta = os.path.join(DIR_MINI, nombre + '.webp')
    if not os.path.exists(ruta):
        return [f'falta mini/{nombre}.webp (ejecuta: py -3 herramientas/miniaturas_web.py)']
    pr = []
    im = Image.open(ruta)
    if im.size != (lado, lado):
        pr.append(f'mide {im.size[0]}x{im.size[1]} y debe medir {lado}x{lado}')
    kb = os.path.getsize(ruta) / 1024
    if kb > PESO_MAX_KB:
        pr.append(f'pesa {kb:.0f} KB (máximo {PESO_MAX_KB})')
    if nombre in RECORTES:
        if getattr(im, 'n_frames', 1) != 1:
            pr.append('un recorte debe ser una imagen fija')
        ref = io.BytesIO(reducir(os.path.join(DIR, origen), lado, recorte=RECORTES[nombre]))
        d = ns.distancia(ns.firma(ruta), ns.firma(ref))
        if d >= ns.UMBRAL_REPETIDO:
            pr.append(f'ya no coincide con su recorte de {origen} (distancia {d:.1f}): ¿se renumeró? regenera las copias')
    elif nombre != FAVICON[0]:
        n_orig = getattr(Image.open(os.path.join(DIR, origen)), 'n_frames', 1)
        if getattr(im, 'n_frames', 1) != n_orig:
            pr.append(f'tiene {getattr(im, "n_frames", 1)} fotogramas y {origen} {n_orig}')
        if n_orig > 1 and im.info.get('loop', 0) != 0:
            pr.append('la animación no se repite en bucle')
        d = ns.distancia(ns.firma(ruta), ns.firma(os.path.join(DIR, origen)))
        if d >= ns.UMBRAL_REPETIDO:
            pr.append(f'ya no se parece a {origen} (distancia {d:.1f}): ¿se renumeró? regenera las copias')
    return pr


def main():
    solo_check = '--check' in sys.argv[1:]
    malas = 0
    for nombre, origen, lado in objetivos():
        if not solo_check:
            os.makedirs(DIR_MINI, exist_ok=True)
            datos = reducir(os.path.join(DIR, origen), lado, solo_primero=(nombre == FAVICON[0]),
                            recorte=RECORTES.get(nombre))
            ruta = os.path.join(DIR_MINI, nombre + '.webp')
            anterior = open(ruta, 'rb').read() if os.path.exists(ruta) else None
            if datos != anterior:
                with open(ruta, 'wb') as f:
                    f.write(datos)
                print(f'mini/{nombre}.webp <- {origen}: {lado}x{lado}, {len(datos) / 1024:.1f} KB')
        pr = comprobar(nombre, origen, lado)
        if pr:
            malas += 1
            print(f'mini/{nombre}.webp: ' + '; '.join(pr))
    sobrantes = [f for f in os.listdir(DIR_MINI)] if os.path.isdir(DIR_MINI) else []
    sobrantes = [f for f in sobrantes if f[:-5] not in {o[0] for o in objetivos()}]
    if sobrantes:
        malas += 1
        print('Copias que ya no usa index.html (bórralas): ' + ', '.join(sobrantes))
    print(f'{len(objetivos())} copia(s) reducida(s); {malas} con problemas.')
    if malas:
        sys.exit(1)


if __name__ == '__main__':
    main()
