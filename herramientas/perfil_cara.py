#!/usr/bin/env python3
"""
3D12 · Forma de la cara de Nailong 3D frente a las capturas frontales de la serie.

Mide el ancho de la cabeza a cada altura con el MISMO metodo en el render (canal alfa del PNG)
y en las capturas (pixeles amarillos). La altura se expresa en «alturas de ojo»: k = 0 es la
coronilla y k = 1 la linea de los ojos (centro de los iris verdes), asi la medida no depende del
zoom ni del recorte de cada captura. El ancho se divide por el ancho maximo de la cabeza.

  F0 · frente: distancia coronilla -> linea de los ojos / ancho maximo (3D18; en la serie la cabeza acaba poco despues de los ojos)
  F1 · altura (k) del ancho maximo: la serie es mas ancha en los mofletes, por debajo de los ojos
  F2 · ancho en la frente (k = 0,5)       F3 · ancho justo encima de los ojos (k = 0,8)
  F4 · ancho bajo los mofletes (k = 1,7)  O1 · separacion de los ojos / ancho maximo (no debe cambiar)

Uso:
  python herramientas/perfil_cara.py --renders <dir> [<dir2> <dir3>] --salida <lamina_cara.png>
         [--etiquetas Actual V1 V2] [--json <medidas_cara.json>] [--referencias <dir>]
Los renders salen de: node herramientas/capturar_3d_cdp.js --cara --salida <dir>
"""

import argparse
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parent))
import lamina_comparativa as lc  # noqa: E402  (reutiliza fuentes, filas y busqueda de referencias)

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Capturas frontales sin fondo amarillo que confunda la silueta, con su caja util (x0, x1, y0, y1).
# 19, 21, 24 y 25 se descartan para medir (cabeza cortada arriba o fondo amarillo/naranja), pero se ven en la lamina.
REFS_FRENTE = [
    ("08_frente_neutro_cute.jpg", (0, 985, 0, 640)),
    ("13_frente_sonrisa_manos_barriga.jpg", (0, 648, 0, 520)),
    ("18_primer_plano_puchero_ceno.jpg", (60, 840, 0, 760)),
    ("26_frente_risa_manos_pecho.jpg", (20, 590, 0, 560)),
]

OBJETIVOS = {
    "F0": ("Frente: coronilla-ojos / ancho", 0.43, 0.49),
    "F1": ("Altura del ancho maximo (k)", 1.15, 1.45),
    "F2": ("Ancho en la frente (k=0,5)", 0.83, 0.88),
    "F3": ("Ancho sobre los ojos (k=0,8)", 0.92, 0.965),
    "F4": ("Ancho bajo los mofletes (k=1,7)", 0.88, 1.0),
    "O1": ("Separacion ojos / ancho", 0.445, 0.495),
}

# Filas de la lamina: vista del render (capturar_3d_cdp.js --cara) y capturas de la serie con el mismo encuadre
FILAS = [
    ("cara_frente", "Frente (primer plano)", ["08_frente_neutro_cute.jpg", "18_primer_plano_puchero_ceno.jpg", "26_frente_risa_manos_pecho.jpg"]),
    ("cara_frente_cuerpo", "Frente (cuerpo entero)", ["25_frente_cuerpo_entero_sonrisita.jpg", "13_frente_sonrisa_manos_barriga.jpg"]),
    ("cara_34_suave", "Tres cuartos suave", ["03_tres_cuartos_saludo_palma_rosa.jpg"]),
    ("cara_34", "Tres cuartos (primer plano)", ["12_primer_plano_cabeza_textura.jpg"]),
    ("cara_34_cuerpo", "Tres cuartos (cuerpo)", ["06_tres_cuartos_timido_cuello.jpg", "16_tres_cuartos_mirada_abajo_manos_pecho.jpg"]),
    ("cara_34_izq", "Tres cuartos izquierdo", ["22_tres_cuartos_izq_brazos_abiertos_palmas.jpg"]),
    ("perfil", "Perfil (nuca y placas)", ["05_perfil_derecho_cuello_barbilla.jpg"]),
    ("espalda", "Espalda (placas)", ["10_espalda_tres_placas.jpg"]),
]

K_MUESTRAS = [round(0.1 * i, 1) for i in range(1, 20)]


def _perfil(mascara, iris):
    """Ancho por fila de la mascara y centroide de los iris -> perfil normalizado (k, ancho/ancho_max)."""
    filas = np.where(mascara.any(axis=1))[0]
    if filas.size == 0:
        raise ValueError("silueta vacia")
    anchos = np.zeros(mascara.shape[0], dtype=float)
    for y in filas:
        xs = np.flatnonzero(mascara[y])
        anchos[y] = xs[-1] - xs[0] + 1
    top = int(np.argmax(anchos > 0.04 * anchos.max()))
    ys, xs = np.nonzero(iris)
    if ys.size < 30:
        raise ValueError("no se encuentran los iris verdes")
    y_ojo = float(ys.mean())
    u = y_ojo - top
    lim = min(mascara.shape[0] - 1, int(top + 1.9 * u))
    w_max = float(anchos[top:lim].max())
    k_max = int(np.argmax(anchos[top:lim])) / u
    perfil = {k: round(float(anchos[min(mascara.shape[0] - 1, int(round(top + k * u)))]) / w_max, 3) for k in K_MUESTRAS}
    centro = (xs.min() + xs.max()) / 2
    izq, der = xs[xs < centro], xs[xs >= centro]
    sep = (der.mean() - izq.mean()) / w_max if izq.size and der.size else float("nan")
    return {
        "k_max": round(k_max, 3), "perfil": perfil, "u_sobre_ancho": round(u / w_max, 3),
        "metricas": {"F0": round(u / w_max, 3), "F1": round(k_max, 3), "F2": perfil[0.5], "F3": perfil[0.8], "F4": perfil[1.7], "O1": round(float(sep), 3)},
    }


def perfil_render(ruta_png):
    rgba = np.asarray(Image.open(ruta_png).convert("RGBA")).astype(np.int32)
    r, g, b, a = rgba[..., 0], rgba[..., 1], rgba[..., 2], rgba[..., 3]
    mascara = a > 128
    iris = mascara & (g > 1.25 * r) & (g > 1.25 * b) & (g > 40)
    return _perfil(mascara, iris)


def perfil_referencia(ruta_jpg, caja):
    im = Image.open(ruta_jpg).convert("RGB")
    x0, x1, y0, y1 = caja
    rgb = np.asarray(im).astype(np.float32) / 255.0
    sub = np.zeros(rgb.shape[:2], dtype=bool)
    sub[y0:y1, x0:x1] = True
    hsv = np.asarray(im.convert("HSV")).astype(np.float32) / 255.0
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    mascara = sub & (h >= 0.095) & (h <= 0.17) & (s >= 0.45) & (v >= 0.45)
    # Iris: solo dentro del tramo amarillo de cada fila (el fondo verde de los arboles no cuenta)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    verde = (g > 1.25 * r) & (g > 1.25 * b) & (g > 40 / 255.0)
    dentro = np.zeros_like(mascara)
    for y in np.where(mascara.any(axis=1))[0]:
        xs = np.flatnonzero(mascara[y])
        dentro[y, xs[0]:xs[-1] + 1] = True
    return _perfil(mascara, verde & dentro & sub)


def en_rango(clave, valor):
    _, lo, hi = OBJETIVOS[clave]
    return lo <= valor <= hi


def dibujar_contornos(perfiles, ancho=560, alto=600):
    """Contornos simetricos de la cabeza (x = ±ancho/2, y = k): referencias en naranja, modelos en azul/verde."""
    im = Image.new("RGB", (ancho, alto), (255, 255, 255))
    d = ImageDraw.Draw(im)
    f = lc.cargar_fuente(14)
    cx, y0, esc_y, esc_x = ancho / 2, 40, (alto - 90) / 1.9, (ancho - 80) / 2
    for k, nombre in ((0.0, "coronilla"), (1.0, "ojos"), (1.5, "boca")):
        y = y0 + k * esc_y
        d.line([(20, y), (ancho - 20, y)], fill=(225, 228, 235), width=1)
        d.text((ancho - 20 - f.getlength(nombre), y - 18), nombre, fill=lc.COLOR_SUAVE, font=f)
    for etiqueta, p, color, grosor in perfiles:
        pts = [(0.0, 0.0)] + [(k, p["perfil"][k]) for k in K_MUESTRAS[:-1]]
        der = [(cx + w * esc_x, y0 + k * esc_y) for k, w in pts]
        izq = [(cx - w * esc_x, y0 + k * esc_y) for k, w in pts]
        d.line(der, fill=color, width=grosor, joint="curve")
        d.line(izq, fill=color, width=grosor, joint="curve")
    y = alto - 44
    x = 20
    for etiqueta, _, color, grosor in perfiles:
        if grosor < 3:
            continue
        d.line([(x, y + 9), (x + 26, y + 9)], fill=color, width=4)
        d.text((x + 32, y), etiqueta, fill=lc.COLOR_TEXTO, font=f)
        x += 44 + f.getlength(etiqueta)
    return im


def dibujar_frentes(perfiles, ancho=560, alto=600):
    """3D18 · Contornos con los ojos alineados y la altura en anchos de cabeza: se ve a que altura acaba cada coronilla (F0)."""
    im = Image.new("RGB", (ancho, alto), (255, 255, 255))
    d = ImageDraw.Draw(im)
    f = lc.cargar_fuente(20)
    esc, cx = 400.0, ancho / 2
    y_ojos = alto - 0.50 * esc
    d.line([(20, y_ojos), (ancho - 20, y_ojos)], fill=(225, 228, 235), width=1)
    d.text((ancho - 20 - f.getlength("ojos"), y_ojos - 24), "ojos", fill=lc.COLOR_SUAVE, font=f)
    # La media de la serie va debajo y más gruesa (halo naranja): si un modelo coincide con ella, se ven las dos
    orden = sorted(perfiles, key=lambda q: 0 if q[0].startswith("Serie") else 1)
    for etiqueta, p, color, grosor in orden:
        f0 = p["metricas"]["F0"]
        pts = [(0.0, 0.0)] + [(k, p["perfil"][k]) for k in K_MUESTRAS[:-1]]
        der = [(cx + w * esc / 2, y_ojos + (k - 1) * f0 * esc) for k, w in pts]
        izq = [(cx - w * esc / 2, y_ojos + (k - 1) * f0 * esc) for k, w in pts]
        ancho_linea = 9 if etiqueta.startswith("Serie") else grosor
        d.line(der, fill=color, width=ancho_linea, joint="curve")
        d.line(izq, fill=color, width=ancho_linea, joint="curve")
    y_txt = 10
    for etiqueta, p, color, grosor in perfiles:
        if grosor < 3:
            continue
        d.text((16, y_txt), f"{etiqueta}: {p['metricas']['F0']:.3f}".replace(".", ","), fill=color, font=f)
        y_txt += 26
    return im


def main():
    ap = argparse.ArgumentParser(description="Silueta frontal de la cabeza y altura de la frente: Nailong 3D frente a la serie (3D12, 3D18).")
    ap.add_argument("--renders", required=True, nargs="+", help="1 a 3 directorios con cara_frente.png y demas vistas (capturar_3d_cdp.js --cara)")
    ap.add_argument("--etiquetas", nargs="+", help="Nombre de cada variante (por defecto A, B, C)")
    ap.add_argument("--salida", required=True, help="PNG de la lamina de la cara")
    ap.add_argument("--json", help="Guardar las medidas en este JSON")
    ap.add_argument("--referencias", help="Carpeta de capturas de la serie (por defecto la local, D-25)")
    args = ap.parse_args()
    if len(args.renders) > 3:
        ap.error("Como maximo 3 variantes en --renders.")

    dir_refs = lc.resolver_referencias(args.referencias)
    refs = {}
    if dir_refs:
        for nombre, caja in REFS_FRENTE:
            ruta = dir_refs / nombre
            if ruta.exists():
                try:
                    refs[nombre] = perfil_referencia(ruta, caja)
                except ValueError as e:
                    print(f"AVISO: {nombre}: {e}")
    else:
        print("AVISO: no hay capturas locales de la serie (D-25): se mide solo el modelo.")

    etiquetas = (args.etiquetas or []) + ["A", "B", "C"][len(args.etiquetas or []):]
    variantes = [(etiquetas[i], Path(d)) for i, d in enumerate(args.renders)]
    medidas = {}
    for eti, carpeta in variantes:
        medidas[eti] = perfil_render(carpeta / "cara_frente.png")

    # Tabla en consola
    cab = f"{'Metrica':<38}" + "".join(f"{n[:5]:>8}" for n in refs) + f"{'serie':>8}" + "".join(f"{e[:10]:>12}" for e, _ in variantes) + "  objetivo"
    print(cab)
    resumen = {}
    for clave, (nombre, lo, hi) in OBJETIVOS.items():
        vals_ref = [refs[n]["metricas"][clave] for n in refs]
        media = round(float(np.mean(vals_ref)), 3) if vals_ref else float("nan")
        fila = f"{clave} {nombre:<35}" + "".join(f"{v:>8.3f}" for v in vals_ref) + f"{media:>8.3f}"
        for eti, _ in variantes:
            v = medidas[eti]["metricas"][clave]
            ok = en_rango(clave, v)
            resumen.setdefault(eti, 0)
            resumen[eti] += int(ok)
            fila += f"{v:>9.3f} {'OK' if ok else 'KO'}"
        print(fila + f"  {lo}-{hi}")
    for eti, _ in variantes:
        print(f"Variante {eti}: {resumen[eti]}/{len(OBJETIVOS)} medidas de la cara en rango")

    if args.json:
        Path(args.json).parent.mkdir(parents=True, exist_ok=True)
        with open(args.json, "w", encoding="utf-8") as f:
            json.dump({"objetivos": OBJETIVOS, "referencias": refs, "modelo": medidas, "resumen": resumen}, f, ensure_ascii=False, indent=2, default=str)

    # Lamina: contornos + parejas render/serie
    f_cab, f_tit, f_sub, f_met = lc.cargar_fuente(24, True), lc.cargar_fuente(21, True), lc.cargar_fuente(15), lc.cargar_fuente(15)
    perfiles = [(n[:2], refs[n], (251, 191, 120), 1) for n in refs]
    if refs:
        media = {"perfil": {k: float(np.mean([refs[n]["perfil"][k] for n in refs])) for k in K_MUESTRAS},
                 "metricas": {"F0": float(np.mean([refs[n]["metricas"]["F0"] for n in refs]))}}
        perfiles.append(("Serie (media)", media, (234, 88, 12), 4))
    colores = [(37, 99, 235), (22, 163, 74), (147, 51, 234)]
    for i, (eti, _) in enumerate(variantes):
        perfiles.append((eti, medidas[eti], colores[i], 4))
    graf = dibujar_contornos(perfiles)
    graf_frente = dibujar_frentes(perfiles)
    segs = []
    for eti, _ in variantes:
        for clave in OBJETIVOS:
            v = medidas[eti]["metricas"][clave]
            ok = en_rango(clave, v)
            segs.append((f"{eti} · {clave}: {v} (obj {OBJETIVOS[clave][1]}-{OBJETIVOS[clave][2]}) [{'OK' if ok else 'KO'}]", lc.COLOR_OK if ok else lc.COLOR_KO))
    def escalar(im):
        return im.resize((int(im.width * lc.ALTO_FILA / im.height), lc.ALTO_FILA))

    bloques =[lc.dibujar_fila("Silueta frontal de la cabeza: forma (coronilla = 0, ojos = 1) y frente (ojos alineados, en anchos de cabeza)",
                               [("Forma · serie en naranja, modelo en azul/verde/morado", escalar(graf)),
                                ("Frente (F0) · donde acaba cada coronilla", escalar(graf_frente))], segs, f_tit, f_sub, f_met)]

    for slug, titulo, refs_fila in FILAS:
        columnas = []
        for eti, carpeta in variantes:
            ruta = carpeta / f"{slug}.png"
            if ruta.exists():
                columnas.append((f"Modelo {eti}", lc.abrir_y_escalar(ruta, lc.ALTO_FILA)))
        if not columnas:
            continue
        for nombre in refs_fila:
            ruta = (dir_refs / nombre) if dir_refs else None
            if ruta and ruta.exists():
                columnas.append((f"Serie: {nombre[:2]}", lc.abrir_y_escalar(ruta, lc.ALTO_FILA)))
        bloques.append(lc.dibujar_fila(titulo, columnas, [], f_tit, f_sub, f_met))

    ancho_total = max(b.width for b in bloques) + 20
    titulo = f"Cara de Nailong 3D vs Serie — {' / '.join(e for e, _ in variantes)}"
    sub = "   ".join(f"{e}: {resumen[e]}/{len(OBJETIVOS)} medidas en rango" for e, _ in variantes)
    cabecera = lc.componer_cabecera(ancho_total - 20, titulo, sub, f_cab, f_sub)
    alto_total = cabecera.height + 20 + sum(b.height + 10 for b in bloques) + 10
    total = Image.new("RGB", (ancho_total, alto_total), lc.COLOR_FONDO)
    y = 10
    total.paste(cabecera, (10, y))
    y += cabecera.height + 10
    for b in bloques:
        total.paste(b, (10, y))
        y += b.height + 10
    Path(args.salida).parent.mkdir(parents=True, exist_ok=True)
    total.save(args.salida, optimize=True)
    print(f"Lamina de la cara guardada: {args.salida} {total.size}")


if __name__ == "__main__":
    main()
