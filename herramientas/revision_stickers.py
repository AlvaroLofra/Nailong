"""Revisión de los textos de los stickers mirando sus fotogramas (T1/T2, web 4.3.0).

Todo vive en documentacion/notas_tecnicas/07_revision_textos_stickers/:
- revision.json: por cromo, lo que se ve en orden, subtítulos traducidos, notas (ediciones de fans, marcas de
  agua), segunda opinión a ciegas, fuente del lore y los textos de antes y los aprobados. También los textos de
  fuera del álbum (hero, laboratorio, fichas de «¿Quién es Nailong?»).
- tiras/<n>.webp: fotogramas elegidos por CANTIDAD DE MOVIMIENTO (no por tiempo): el primero, el último, 6 más
  repartidos por el movimiento acumulado y el de antes y después de cada corte de plano (máximo 12).
- ../07_revision_textos_stickers.md: la nota legible (se rehace con «md»).
La hoja HTML interactiva NO se guarda en el repositorio (regla de un solo index.html, D-02/D-15): «hoja» la
crea en una carpeta temporal o en la que se indique.

Uso (desde la carpeta del proyecto):
  py -3 herramientas/revision_stickers.py tiras [N ...]            # (re)hace las tiras y sus datos de movimiento
  py -3 herramientas/revision_stickers.py ver frame N K             # fotograma K a 512 px (carpeta temporal)
  py -3 herramientas/revision_stickers.py ver crop N K x0 y0 x1 y1  # recorte ampliado (coordenadas sobre 512 px)
  py -3 herramientas/revision_stickers.py ver todos N               # todos los fotogramas en rejilla
  py -3 herramientas/revision_stickers.py md                        # rehace la nota .md desde revision.json
  py -3 herramientas/revision_stickers.py hoja [CARPETA]            # hoja HTML con filtros (fuera del repo)
"""
import html
import json
import os
import pathlib
import re
import sys
import tempfile

import numpy as np
from PIL import Image, ImageDraw, ImageFont

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIR_STICKERS = os.path.join(RAIZ, 'Stickers Nailong')
DIR_REV = os.path.join(RAIZ, 'documentacion', 'notas_tecnicas', '07_revision_textos_stickers')
RUTA_JSON = os.path.join(DIR_REV, 'revision.json')
RUTA_MD = os.path.join(RAIZ, 'documentacion', 'notas_tecnicas', '07_revision_textos_stickers.md')
TEMPORAL = os.path.join(tempfile.gettempdir(), 'nailong_revision_stickers')
LADO_TIRA, BASE_SEL, MAX_SEL = 200, 6, 12
CAT = {'caritas': '🤪 Caritas', 'comida': '🍗 Comilonas', 'bailes': '💃 Bailes', 'amigos': '👥 Amigos y Rivales'}
E = html.escape


# ---------- fotogramas ----------
def cargar(n):
    im = Image.open(os.path.join(DIR_STICKERS, f'sticker_{n}.webp'))
    frames, durs = [], []
    for k in range(getattr(im, 'n_frames', 1)):
        im.seek(k)
        frames.append(im.convert('RGBA'))
        durs.append(im.info.get('duration', 0))
    return frames, durs


def _gris(f, lado=96):
    fondo = Image.new('RGBA', f.size, (128, 128, 128, 255))
    fondo.alpha_composite(f)
    return np.asarray(fondo.convert('RGB').resize((lado, lado), Image.BILINEAR), dtype=np.float32)


def _histo(a):
    return np.concatenate([np.histogram(a[..., c], bins=16, range=(0, 256))[0] / a[..., c].size for c in range(3)])


def analizar(frames):
    """Cortes de plano, selección por movimiento y si es un bucle."""
    arr = [_gris(f) for f in frames]
    n = len(arr)
    if n == 1:
        return [], [0], True
    d = [0.0] + [float(np.abs(arr[i] - arr[i - 1]).mean()) for i in range(1, n)]
    hd = [0.0] + [float(np.abs(_histo(arr[i]) - _histo(arr[i - 1])).sum()) for i in range(1, n)]
    med = float(np.median(d[1:])) or 0.1
    cortes = []
    for i in range(1, n):
        vecinos = [d[j] for j in (i - 2, i - 1, i + 1, i + 2) if 1 <= j < n]
        if d[i] > 22 and d[i] > 3.5 * med and d[i] > 2.0 * max(vecinos or [0]) and hd[i] > 0.35:
            cortes.append(i)
    acum = np.cumsum(d)
    sel = {0, n - 1}
    for q in np.linspace(0, acum[-1] or 1.0, BASE_SEL + 2)[1:-1]:
        sel.add(int(np.searchsorted(acum, q)))
    for c in cortes:
        sel.update((c - 1, c))
    sel = sorted(i for i in sel if 0 <= i < n)
    while len(sel) > MAX_SEL:
        fijos = {0, n - 1} | set(cortes)
        hueco = [(acum[b] - acum[a], b) for a, b in zip(sel, sel[1:]) if b not in fijos]
        if not hueco:
            break
        sel.remove(min(hueco)[1])
    bucle = float(np.abs(arr[0] - arr[-1]).mean()) < max(2.5 * med, 6)
    return cortes, sel, bucle


def dibujar_tira(frames, sel, cortes):
    cols = min(6, len(sel))
    filas = (len(sel) + cols - 1) // cols
    t = Image.new('RGB', (cols * LADO_TIRA, filas * (LADO_TIRA + 18)), (236, 236, 236))
    dr = ImageDraw.Draw(t)
    try:
        fnt = ImageFont.truetype('arial.ttf', 13)
    except OSError:
        fnt = ImageFont.load_default()
    for pos, k in enumerate(sel):
        x, y = (pos % cols) * LADO_TIRA, (pos // cols) * (LADO_TIRA + 18)
        cuadro = Image.new('RGBA', (LADO_TIRA, LADO_TIRA), (255, 255, 255, 255))
        cuadro.alpha_composite(frames[k].resize((LADO_TIRA, LADO_TIRA), Image.LANCZOS))
        t.paste(cuadro.convert('RGB'), (x, y + 18))
        etiqueta = f'f{k}/{len(frames) - 1}' + ('  CORTE' if k in cortes else '')
        dr.text((x + 4, y + 2), etiqueta, fill=(190, 0, 0) if k in cortes else (40, 40, 40), font=fnt)
    return t


def cmd_tiras(nums):
    doc = json.load(open(RUTA_JSON, encoding='utf-8'))
    por_id = {s['id']: s for s in doc['stickers']}
    total = len([f for f in os.listdir(DIR_STICKERS) if re.fullmatch(r'sticker_\d+\.webp', f)])
    os.makedirs(os.path.join(DIR_REV, 'tiras'), exist_ok=True)
    for n in nums or range(1, total + 1):
        frames, durs = cargar(n)
        cortes, sel, bucle = analizar(frames)
        dibujar_tira(frames, sel, cortes).save(os.path.join(DIR_REV, 'tiras', f'{n}.webp'), 'WEBP', quality=70, method=6)
        if n in por_id:
            por_id[n].update(fotogramas=len(frames), duracion_ms=int(sum(durs)), cortes=cortes, seleccion=sel, bucle=bucle)
        print(f'#{n}: {len(frames)} fotogramas, cortes {cortes}, {"bucle" if bucle else "no es bucle"}')
    guardar_json(doc)


def guardar_json(doc):
    with open(RUTA_JSON, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(doc, f, ensure_ascii=False, indent=1)
        f.write('\n')


def _blanco(f):
    fondo = Image.new('RGBA', f.size, (255, 255, 255, 255))
    fondo.alpha_composite(f)
    return fondo.convert('RGB')


def cmd_ver(args):
    modo, n = args[0], int(args[1])
    frames, _ = cargar(n)
    os.makedirs(TEMPORAL, exist_ok=True)
    if modo == 'frame':
        k = int(args[2])
        ruta = os.path.join(TEMPORAL, f'{n}_f{k}.png')
        _blanco(frames[k]).save(ruta)
    elif modo == 'crop':
        k, x0, y0, x1, y1 = (int(v) for v in args[2:7])
        r = _blanco(frames[k]).crop((x0, y0, x1, y1))
        esc = max(1, round(512 / max(r.size)))
        ruta = os.path.join(TEMPORAL, f'{n}_f{k}_{x0}_{y0}_{x1}_{y1}.png')
        r.resize((r.size[0] * esc, r.size[1] * esc), Image.LANCZOS).save(ruta)
    elif modo == 'todos':
        lado, cols = 128, 8
        t = Image.new('RGB', (cols * lado, ((len(frames) + cols - 1) // cols) * (lado + 14)), (235, 235, 235))
        d = ImageDraw.Draw(t)
        for k, f in enumerate(frames):
            x, y = (k % cols) * lado, (k // cols) * (lado + 14)
            t.paste(_blanco(f).resize((lado, lado), Image.LANCZOS), (x, y + 14))
            d.text((x + 3, y + 1), f'f{k}', fill=(150, 0, 0))
        ruta = os.path.join(TEMPORAL, f'{n}_todos.png')
        t.save(ruta)
    else:
        raise SystemExit(__doc__)
    print(ruta)


# ---------- nota .md ----------
def _texto(t):
    return f"«{t['title']}» — {t['desc']} *({CAT.get(t['cat'], t['cat'])} · sonido `{t['sound']}`)*"


def cmd_md():
    doc = json.load(open(RUTA_JSON, encoding='utf-8'))
    st = doc['stickers']
    cuenta = {}
    for s in st:
        cuenta[s['veredicto']] = cuenta.get(s['veredicto'], 0) + 1
    L = [
        '# Revisión de los textos de los stickers con sus fotogramas (T1, T2 y W11, web 4.3.0)',
        '',
        f"> **Qué es:** el registro de la revisión del {doc['fecha']}: qué se ve de verdad en cada cromo, en orden, y por qué se cambió su título, "
        'descripción, categoría y sonido de `ALL_STICKERS` (`js/02-datos-stickers.js`). Sirve para no repetir el trabajo y para futuras ideas '
        '(juego «¿Qué está pasando?», sonido sincronizado del Visor, botonera).',
        '>',
        f"> **Numeración:** {doc['numeracion']}",
        '>',
        '> **Datos y herramienta:** `07_revision_textos_stickers/revision.json` y `tiras/`. Se rehacen con `py -3 herramientas/revision_stickers.py` '
        '(`tiras`, `md`, `ver` y `hoja`; la hoja HTML interactiva se crea fuera del repositorio por la regla de un solo `index.html`).',
        '',
        '## Método',
        '- **Fotogramas:** se decodifican todos (Pillow), se mide el cambio entre uno y otro y se detectan los cortes de plano. La tira muestra el primero, '
        'el último, 6 repartidos por la cantidad de movimiento y los de cada corte (máximo 12); así no se pierde el momento clave (p. ej., una carcajada final).',
        '- **Revisión:** cada cromo se miró con su tira, el fotograma a 512 px en los estáticos y recortes ampliados de objetos, ropa y subtítulos (traducidos).',
        '- **Segunda opinión a ciegas:** en los dudosos, otro revisor sin ver el texto contestó una pregunta neutra («¿qué sostiene?», «¿quién va a su lado?»).',
        '- **Lore:** solo con fuente, según `documentacion/guias_y_contexto/LORE_NAILONG.md`.',
        '',
        '## Criterios del texto',
        '- Solo lo que se ve y en orden (inicio → giro → final); nada de motivos inventados (pollo, tarta, horno…).',
        '- Personajes bien identificados o descripción neutra. Bombloong es el dragón azul del cascarón; los recoloreados (#10, #27, #102) se dicen «edición de fans».',
        '- Castellano de España, tierno y variado, con pocos diminutivos; sin títulos repetidos.',
        '- Título de 32 caracteres como máximo; descripción de una frase de unos 140. En el álbum del móvil el título se corta con «…»; la ficha ampliada lo muestra entero.',
        '- Sonido: solo los que existen en `js/01-audio.js`. **No hay sonido de llanto** (pendiente para la botonera, B1).',
        '',
        f"## Decisiones del usuario\n{doc['decisiones_del_usuario']}",
        '',
        '## Resumen',
        ' · '.join(f'{k}: {v}' for k, v in sorted(cuenta.items())),
        '',
        '## Cromo a cromo',
    ]
    for s in st:
        n = s['id']
        info = 'estático' if s['fotogramas'] == 1 else f"{s['fotogramas']} fotogramas · {s['duracion_ms'] / 1000:.1f} s · {'bucle' if s['bucle'] else 'no es bucle'}"
        if s['cortes']:
            info += ' · cortes en ' + ', '.join(f'f{c}' for c in s['cortes'])
        L += ['', f"### #{n} · {s['aprobado']['title']}",
              f'![Fotogramas del #{n}](07_revision_textos_stickers/tiras/{n}.webp)', '',
              f"- **Veredicto:** {s['veredicto']} (confianza {s['confianza']}) · {info}" + (f" · clave `{s['clave']}`" if s['clave'] else '') +
              f' · [sticker](../../Stickers%20Nailong/sticker_{n}.webp)',
              f"- **Qué se ve:** {s['se_ve']}"]
        if s['subtitulos']:
            L.append(f"- **Subtítulos:** {s['subtitulos']}")
        if s['notas']:
            L.append(f"- **Notas:** {s['notas']}")
        if s['lore']:
            L.append(f"- **Lore:** {s['lore']}")
        if s['segunda_opinion']:
            L.append(f"- **Segunda opinión a ciegas** (confianza {s['segunda_opinion']['confianza']}): {s['segunda_opinion']['respuesta']}")
        L.append(f"- **Antes:** {_texto(s['antes'])}")
        L.append(f"- **Ahora:** {_texto(s['aprobado'])}")
    L += ['', '## Fuera del álbum']
    for b in doc['fuera_del_album']:
        L += ['', f"### {b['titulo']}"]
        if b.get('explica'):
            L.append(re.sub(r'<[^>]+>', '', b['explica']).replace('&lt;', '<').replace('&gt;', '>'))
        if b.get('filas'):
            L += ['', '| Qué | Antes | Ahora | Por qué |', '|---|---|---|---|']
            for f in b['filas']:
                L.append('| ' + ' | '.join(str(f.get(k, '')).replace('|', '/') for k in ('que', 'actual', 'propuesto', 'porque')) + ' |')
    with open(RUTA_MD, 'w', encoding='utf-8', newline='\n') as f:
        f.write('\n'.join(L) + '\n')
    print('Nota:', RUTA_MD)


# ---------- hoja HTML (fuera del repositorio) ----------
def _uri(ruta):
    return pathlib.Path(ruta).resolve().as_uri()


def _img_extra(ref):
    """Las imágenes de 'fuera_del_album' se guardaron como rutas de la hoja de revisión original."""
    if not ref:
        return ''
    m = re.fullmatch(r'stickers/(sticker_\d+\.webp)', ref)
    if m:
        return _uri(os.path.join(DIR_STICKERS, m.group(1)))
    if 'bombloong_propuesta.webp' in ref:
        return _uri(os.path.join(DIR_STICKERS, 'mini', 'bombloong.webp'))
    return ''


CSS = '''
:root{--bg:#fffaf0;--card:#fff;--tx:#3b2a12;--mut:#7a6243;--bd:#f1d79a;--chg:#fff3c4;--act:#f7f2ea}
@media (prefers-color-scheme: dark){:root{--bg:#1d1812;--card:#29221a;--tx:#f5ead8;--mut:#c8b593;--bd:#5a4a2c;--chg:#4a3d12;--act:#231d16}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--tx);font:15px/1.45 system-ui,Segoe UI,sans-serif}
.barra{position:sticky;top:0;background:var(--card);border-bottom:2px solid var(--bd);padding:10px 16px;display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.barra h1{font-size:17px;margin:0 12px 0 0}.barra button{border:1px solid var(--bd);background:var(--bg);color:var(--tx);border-radius:999px;padding:5px 12px;cursor:pointer}
.barra button.on{background:#f6c445;color:#3b2a12}main{max-width:1180px;margin:0 auto;padding:12px 16px 60px}
article{background:var(--card);border:1px solid var(--bd);border-radius:14px;margin:0 0 14px;padding:10px 14px}
.cuerpo{display:grid;grid-template-columns:180px 1fr;gap:14px}.cuerpo>img{width:160px;height:160px;object-fit:contain;background:#fdf3d8;border-radius:12px}
.datos{min-width:0}table{border-collapse:collapse;width:100%;table-layout:fixed;font-size:14px}th,td{border:1px solid var(--bd);padding:5px 8px;vertical-align:top;text-align:left;overflow-wrap:anywhere}
th{width:96px;color:var(--mut)}td.act{background:var(--act);color:var(--mut)}td.cambia{background:var(--chg);font-weight:600}td img{width:64px;vertical-align:middle}
.datos p{margin:6px 0;font-size:13.5px}.tira{max-width:100%;border-radius:8px;margin-top:6px}.oculto{display:none}
@media (max-width:900px){.cuerpo{grid-template-columns:1fr}}
'''
JS = '''function filtra(t,b){document.querySelectorAll('.barra button').forEach(x=>x.classList.toggle('on',x===b));
document.querySelectorAll('article.st').forEach(a=>a.classList.toggle('oculto',!(t==='todos'||a.dataset.v===t)));}'''


def cmd_hoja(salida):
    doc = json.load(open(RUTA_JSON, encoding='utf-8'))
    os.makedirs(salida, exist_ok=True)
    partes = []
    for s in doc['stickers']:
        n = s['id']
        filas = ''
        for campo, nombre in (('title', 'Título'), ('desc', 'Descripción'), ('cat', 'Categoría'), ('sound', 'Sonido')):
            a, b = s['antes'][campo], s['aprobado'][campo]
            filas += f'<tr><th>{nombre}</th><td class="act">{E(a)}</td><td class="{"cambia" if a != b else ""}">{E(b)}</td></tr>'
        extra = f'<p><b>Qué se ve:</b> {E(s["se_ve"])}</p>'
        for k, nombre in (('subtitulos', 'Subtítulos'), ('notas', 'Notas'), ('lore', 'Lore')):
            if s[k]:
                extra += f'<p><b>{nombre}:</b> {E(s[k])}</p>'
        if s['segunda_opinion']:
            extra += f'<p><b>Segunda opinión a ciegas:</b> {E(s["segunda_opinion"]["respuesta"])}</p>'
        tira = os.path.join(DIR_REV, 'tiras', f'{n}.webp')
        partes.append(f'''<article class="st" data-v="{E(s["veredicto"])}"><h2>#{n} · {E(s["veredicto"])} (confianza {E(s["confianza"])})</h2>
<div class="cuerpo"><img src="{_uri(os.path.join(DIR_STICKERS, f"sticker_{n}.webp"))}" alt="Sticker {n}" loading="lazy">
<div class="datos"><table><tr><th></th><th>Antes</th><th>Aprobado</th></tr>{filas}</table>{extra}
<img class="tira" src="{_uri(tira)}" alt="Fotogramas del {n}" loading="lazy"></div></div></article>''')
    for b in doc['fuera_del_album']:
        filas = ''
        for f in b.get('filas', []):
            ia, ip = _img_extra(f.get('img_a')), _img_extra(f.get('img_p'))
            filas += (f'<tr><th>{E(f["que"])}</th><td class="act">{f"<img src={chr(34)}{ia}{chr(34)} alt={chr(34)}{chr(34)}> " if ia else ""}{E(f.get("actual", ""))}</td>'
                      f'<td class="cambia">{f"<img src={chr(34)}{ip}{chr(34)} alt={chr(34)}{chr(34)}> " if ip else ""}{E(f.get("propuesto", ""))}</td><td>{E(f.get("porque", ""))}</td></tr>')
        partes.append(f'<article><h2>{E(b["titulo"])}</h2><p>{b.get("explica", "")}</p>' +
                      (f'<table><tr><th>Qué</th><th>Antes</th><th>Ahora</th><th>Por qué</th></tr>{filas}</table>' if filas else '') + '</article>')
    veredictos = sorted({s['veredicto'] for s in doc['stickers']})
    botones = '<button class="on" onclick="filtra(\'todos\',this)">Todos</button>' + ''.join(
        f'<button onclick="filtra(\'{E(v)}\',this)">{E(v)}</button>' for v in veredictos)
    pagina = (f'<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
              f'<title>Revisión de textos</title><style>{CSS}</style></head><body><div class="barra"><h1>{E(doc["revision"])} · {E(doc["fecha"])}</h1>{botones}</div>'
              f'<main>{"".join(partes)}</main><script>{JS}</script></body></html>')
    ruta = os.path.join(salida, 'revision_textos_stickers.html')
    with open(ruta, 'w', encoding='utf-8') as f:
        f.write(pagina)
    print('Hoja:', ruta)


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    orden, args = sys.argv[1], sys.argv[2:]
    if orden == 'tiras':
        cmd_tiras([int(a) for a in args])
    elif orden == 'ver':
        cmd_ver(args)
    elif orden == 'md':
        cmd_md()
    elif orden == 'hoja':
        destino = os.path.abspath(args[0]) if args else TEMPORAL
        if destino == RAIZ or destino.startswith(RAIZ + os.sep):
            raise SystemExit('La hoja HTML va fuera del repositorio (regla de un solo index.html).')
        cmd_hoja(destino)
    else:
        raise SystemExit(__doc__)


if __name__ == '__main__':
    main()
