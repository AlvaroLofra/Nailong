"""Iconos de la web como dibujos SVG dentro de css/styles.css (mejora W32).

Antes la web descargaba Font Awesome entero desde cdnjs (CSS de 18 KB + fuentes de 153 y 115 KB)
para usar 27 iconos. Ahora cada icono es una máscara CSS con su dibujo SVG incrustado, y se
conservan las clases de siempre (<i class="fa-solid fa-xmark">), también las que cambia el JS.

Los dibujos son los oficiales de Font Awesome Free 6.5.1 (iconos con licencia CC BY 4.0; la
atribución va en el comentario del bloque generado). Este script los baja de jsDelivr (versión
fijada), los guarda en caché y reescribe el bloque entre las marcas ICONOS-INICIO / ICONOS-FIN.

Uso (solo hace falta red al añadir o cambiar iconos):
  py -3 herramientas/iconos_svg.py            # regenera el bloque de css/styles.css
  py -3 herramientas/iconos_svg.py --check    # comprueba que todos los fa-* usados tienen dibujo
Para añadir un icono: añádelo a ICONOS (estilo, nombre) y vuelve a ejecutar el script.
"""
import os
import re
import sys
import tempfile
import urllib.request

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSS = os.path.join(RAIZ, 'css', 'styles.css')
VERSION = '6.5.1'
BASE = f'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@{VERSION}/svgs'
CACHE = os.path.join(tempfile.gettempdir(), f'nailong_fa_{VERSION}')
INICIO = '/* ICONOS-INICIO (generado por herramientas/iconos_svg.py: no editar a mano) */'
FIN = '/* ICONOS-FIN */'

# (estilo, nombre): los iconos que usan index.html y js/ (31 desde el reproductor del Visor, VM1)
ICONOS = [
    ('solid', n) for n in (
        'arrow-down', 'arrow-left', 'arrow-right', 'arrow-up', 'backward-step', 'bars', 'camera-retro', 'chevron-down',
        'chevron-left', 'chevron-right', 'cloud-arrow-down', 'cloud-arrow-up', 'compress', 'crosshairs',
        'download', 'expand', 'eye-slash', 'forward-step', 'link', 'pause', 'play', 'qrcode', 'share-nodes', 'shuffle', 'volume-high',
        'volume-xmark', 'wand-magic-sparkles', 'xmark')
] + [('regular', 'copy'), ('brands', 'android'), ('brands', 'whatsapp')]


def svg_de(estilo, nombre):
    os.makedirs(CACHE, exist_ok=True)
    ruta = os.path.join(CACHE, f'{estilo}-{nombre}.svg')
    if not os.path.exists(ruta):
        with urllib.request.urlopen(f'{BASE}/{estilo}/{nombre}.svg', timeout=20) as r:
            datos = r.read()
        with open(ruta, 'wb') as f:
            f.write(datos)
    texto = open(ruta, encoding='utf-8').read()
    caja = re.search(r'viewBox="0 0 (\d+) (\d+)"', texto)
    trazos = re.findall(r'<path d="([^"]+)"', texto)
    if not caja or caja.group(2) != '512' or len(trazos) != 1 or re.search(r'[^0-9a-zA-Z .,\-]', trazos[0]):
        raise SystemExit(f'{estilo}/{nombre}.svg no tiene el formato esperado (viewBox 0 0 W 512 y un solo trazo)')
    return int(caja.group(1)), trazos[0]


def bloque():
    lineas = [
        INICIO,
        '/* W32 · Iconos: dibujos de Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com',
        '   License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)',
        '   Copyright 2023 Fonticons, Inc. La caja imita a la del glifo de la fuente: ancho del dibujo, alto de',
        '   una línea (1lh: el line-height de Tailwind si el icono lleva text-*, si no 1em) y el dibujo de 1em',
        '   centrado, con la misma línea base. flex-shrink: 0 porque la caja está vacía (el glifo no se encogía). */',
        '.fa-solid, .fa-regular, .fa-brands {',
        '    display: inline-block; width: var(--fa-ancho, 1em); flex-shrink: 0; font-style: normal; line-height: 1;',
        '    height: 1em; vertical-align: -0.125em;',
        '    height: 1lh; vertical-align: calc(-0.125em - (1lh - 1em) / 2);',
        '    background-color: currentColor;',
        '    -webkit-mask: var(--fa-svg) center / var(--fa-ancho, 1em) 1em no-repeat;',
        '    mask: var(--fa-svg) center / var(--fa-ancho, 1em) 1em no-repeat;',
        '}',
        '@media (forced-colors: active) { .fa-solid, .fa-regular, .fa-brands { forced-color-adjust: none; } }',
    ]
    for estilo, nombre in ICONOS:
        ancho, d = svg_de(estilo, nombre)
        svg = f"%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {ancho} 512'%3E%3Cpath d='{d}'/%3E%3C/svg%3E"
        em = f'{ancho / 512:.4g}em'.replace('0.', '.', 1) if ancho != 512 else '1em'
        lineas.append(f'.fa-{nombre} {{ --fa-ancho: {em}; --fa-svg: url("data:image/svg+xml,{svg}"); }}')
    lineas.append(FIN)
    return '\n'.join(lineas)


def usados():
    textos = [open(os.path.join(RAIZ, 'index.html'), encoding='utf-8').read()]
    for f in sorted(os.listdir(os.path.join(RAIZ, 'js'))):
        textos.append(open(os.path.join(RAIZ, 'js', f), encoding='utf-8').read())
    nombres = set()
    for t in textos:
        nombres |= set(re.findall(r'\bfa-([a-z0-9-]+)', t))
    return nombres - {'solid', 'regular', 'brands'}


def main():
    css = open(CSS, encoding='utf-8').read()
    if '--check' not in sys.argv[1:]:
        nuevo = bloque()
        if INICIO in css:
            css = css[:css.index(INICIO)] + nuevo + css[css.index(FIN) + len(FIN):]
        else:
            css = css.rstrip('\n') + '\n\n' + nuevo + '\n'
        with open(CSS, 'w', encoding='utf-8', newline='\n') as f:
            f.write(css)
        print(f'css/styles.css: {len(ICONOS)} iconos, bloque de {len(nuevo.encode("utf-8")) / 1024:.1f} KB')
    definidos = set(re.findall(r'^\.fa-([a-z0-9-]+) \{ --fa-ancho', css, re.M))
    faltan, sobran = sorted(usados() - definidos), sorted(definidos - usados())
    if faltan:
        print('Iconos usados sin dibujo (añádelos a ICONOS): ' + ', '.join(faltan))
    if sobran:
        print('Iconos con dibujo que ya no se usan (quítalos de ICONOS): ' + ', '.join(sobran))
    print(f'{len(definidos)} iconos definidos; {len(faltan) + len(sobran)} problema(s).')
    if faltan or sobran:
        sys.exit(1)


if __name__ == '__main__':
    main()
