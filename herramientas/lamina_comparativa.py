#!/usr/bin/env python3
"""
Generador de laminas comparativas «render | captura de la serie» y «render A | render B | serie»
para Nailong 3D (Plan de Fidelidad, Fase 0 · Anexo D).

Uso:
  python herramientas/lamina_comparativa.py --renders <dir> --salida <lamina.png> [--medidas <medidas.json>] [--referencias <dir>] [--etiqueta <texto>] [--expresiones]
  python herramientas/lamina_comparativa.py --ab <dirA> <dirB> --salida <lamina_ab.png> [--etiqueta-a A] [--etiqueta-b B] [--medidas <medidasB.json>] [--medidas-a <medidasA.json>]
"""

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ALTO_FILA = 400
FONDO_ESTUDIO = (255, 250, 238)
COLOR_FONDO = (252, 252, 253)
COLOR_TEXTO = (32, 36, 44)
COLOR_SUAVE = (95, 102, 114)
COLOR_BORDE = (218, 222, 230)
COLOR_OK = (21, 128, 61)
COLOR_KO = (185, 28, 28)

LANCZOS = getattr(Image, "Resampling", Image).LANCZOS

# 7 vistas exactas del Anexo B emparejadas con las capturas locales (D-25) y sus metricas clave
VISTAS_BASE = [
    ("frente",       "Frente",                "13_frente_sonrisa_manos_barriga.jpg",   ["T2", "H3", "H4", "H6", "P1", "P2", "V1", "V2", "V3"]),
    ("perfil",       "Perfil",                "05_perfil_derecho_cuello_barbilla.jpg", ["T1", "T3", "H1", "H2", "H5", "B3", "B4"]),
    ("tres_cuartos", "Tres cuartos",          "14_tres_cuartos_manos_cintura.jpg",     ["B1", "B2", "B5", "H1", "V2"]),
    ("cola",         "Cola",                  "11_tres_cuartos_cola_y_palma.jpg",      ["C1", "C2"]),
    ("cabeza",       "Cabeza (primer plano)", "12_primer_plano_cabeza_textura.jpg",    ["H1", "H2", "H3", "H4", "H5"]),
    ("saludo",       "Saludo",                "03_tres_cuartos_saludo_palma_rosa.jpg", ["B1", "B2", "B3", "B4", "B5"]),
    ("espalda",      "Espalda",               "10_espalda_tres_placas.jpg",            ["T2", "P1", "P2", "C1"]),
]

VISTAS_EXPRESIONES = [
    ("expr_sonrison",  "Carita: Sonrison"),
    ("expr_carcajada", "Carita: Carcajada"),
    ("expr_burla",     "Carita: Burla (Bleh)"),
    ("expr_puchero",   "Carita: Puchero"),
    ("expr_pillo",     "Carita: Pillo"),
    ("expr_susto",     "Carita: Susto"),
    ("acc_saludar",    "Accion: Saludar"),
    ("acc_duang",      "Accion: Duang"),
    ("acc_bailar",     "Accion: Bailar"),
    ("acc_sorpresa",   "Accion: Sorpresa"),
    ("acc_siesta",     "Accion: Siesta"),
]


def cargar_fuente(tam, negrita=False):
    candidatas = (
        [r"C:\Windows\Fonts\segoeuib.ttf", r"C:\Windows\Fonts\arialbd.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"]
        if negrita
        else [r"C:\Windows\Fonts\segoeui.ttf", r"C:\Windows\Fonts\arial.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]
    )
    for ruta in candidatas:
        if os.path.exists(ruta):
            return ImageFont.truetype(ruta, tam)
    return ImageFont.load_default()


def resolver_referencias(ruta_explicita=None):
    """Busca la carpeta local de referencias de la serie, con fallback al repo comun en worktrees."""
    candidatos = []
    if ruta_explicita:
        candidatos.append(Path(ruta_explicita))
    candidatos.append(Path.cwd() / "documentacion" / "referencias_nailong_serie")
    candidatos.append(Path(__file__).resolve().parent.parent / "documentacion" / "referencias_nailong_serie")

    # Fallback para git worktrees: resolver el directorio comun (.git del repo principal)
    try:
        res = subprocess.run(
            ["git", "rev-parse", "--git-common-dir"],
            capture_output=True,
            text=True,
            encoding="utf-8",
            check=False,
        )
        if res.returncode == 0 and res.stdout.strip():
            common = Path(res.stdout.strip())
            if not common.is_absolute():
                common = (Path.cwd() / common).resolve()
            else:
                common = common.resolve()
            repo_principal = common.parent if common.name == ".git" else common
            candidatos.append(repo_principal / "documentacion" / "referencias_nailong_serie")
    except Exception:
        pass

    for c in candidatos:
        if c.is_dir() and any(c.glob("*.jpg")):
            return c
    return None


def abrir_y_escalar(ruta, alto, fondo=FONDO_ESTUDIO):
    im = Image.open(ruta)
    if im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info):
        rgba = im.convert("RGBA")
        base = Image.new("RGBA", rgba.size, (*fondo, 255))
        base.alpha_composite(rgba)
        im = base.convert("RGB")
    else:
        im = im.convert("RGB")
    ancho = max(1, int(round(im.width * alto / im.height)))
    return im.resize((ancho, alto), LANCZOS)


def crear_placeholder(ancho, alto, mensaje, f_texto):
    im = Image.new("RGB", (ancho, alto), (242, 243, 246))
    d = ImageDraw.Draw(im)
    d.rectangle([(0, 0), (ancho - 1, alto - 1)], outline=COLOR_BORDE, width=2)
    d.line([(0, 0), (ancho, alto)], fill=(228, 230, 236), width=1)
    d.line([(ancho, 0), (0, alto)], fill=(228, 230, 236), width=1)
    lineas = mensaje.split("\n")
    y = alto // 2 - len(lineas) * 12
    for lin in lineas:
        w = d.textlength(lin, font=f_texto)
        d.text(((ancho - w) / 2, y), lin, fill=COLOR_SUAVE, font=f_texto)
        y += 24
    return im


def envolver_segmentos(segmentos, ancho_max, f_texto):
    """Envuelve pares (texto, color) en lineas que quepan en ancho_max."""
    lineas = []
    actual = []
    x = 0.0
    sep = "   |   "
    w_sep = f_texto.getlength(sep)
    for txt, col in segmentos:
        w = f_texto.getlength(txt)
        extra = w_sep if actual else 0.0
        if actual and x + extra + w > ancho_max:
            lineas.append(actual)
            actual = [(txt, col)]
            x = w
        else:
            if actual:
                actual.append((sep, COLOR_SUAVE))
                x += w_sep
            actual.append((txt, col))
            x += w
    if actual:
        lineas.append(actual)
    return lineas


def construir_segmentos_metricas(claves, medidas, medidas_a=None):
    if not medidas or "metricas" not in medidas:
        return []
    m_b = medidas["metricas"]
    m_a = medidas_a["metricas"] if (medidas_a and "metricas" in medidas_a) else None
    segs = []
    for k in claves:
        if k not in m_b:
            continue
        item = m_b[k]
        ok = bool(item.get("ok"))
        marca = "OK" if ok else "KO"
        val_b = item.get("valor")
        obj = item.get("objetivo", "")
        if m_a and k in m_a:
            val_a = m_a[k].get("valor")
            txt = f"{k}: {val_a} -> {val_b} (obj {obj}) [{marca}]"
        else:
            txt = f"{k}: {val_b} (obj {obj}) [{marca}]"
        segs.append((txt, COLOR_OK if ok else COLOR_KO))
    return segs


def dibujar_fila(titulo, columnas, segmentos_metricas, f_tit, f_sub, f_met):
    """
    columnas: lista de tuplas (etiqueta_columna, PIL.Image)
    """
    margen = 14
    gap = 14
    ancho_imgs = sum(img.width for _, img in columnas) + gap * (len(columnas) - 1)
    ancho = max(ancho_imgs + 2 * margen, 1140)
    lineas_met = envolver_segmentos(segmentos_metricas, ancho - 2 * margen, f_met) if segmentos_metricas else []
    alto_met = (10 + 25 * len(lineas_met)) if lineas_met else 6
    alto = 40 + 24 + ALTO_FILA + alto_met + 12

    bloque = Image.new("RGB", (ancho, alto), (255, 255, 255))
    d = ImageDraw.Draw(bloque)
    d.rectangle([(0, 0), (ancho - 1, alto - 1)], outline=COLOR_BORDE, width=1)
    d.rectangle([(1, 1), (ancho - 2, 38)], fill=(246, 247, 250))
    d.text((margen, 7), titulo, fill=COLOR_TEXTO, font=f_tit)

    x = margen
    y_sub = 42
    y_img = 64
    for eti, img in columnas:
        d.text((x, y_sub), eti, fill=COLOR_SUAVE, font=f_sub)
        bloque.paste(img, (x, y_img))
        d.rectangle([(x, y_img), (x + img.width - 1, y_img + img.height - 1)], outline=COLOR_BORDE, width=1)
        x += img.width + gap

    y_m = y_img + ALTO_FILA + 10
    for lin in lineas_met:
        xm = margen
        for txt, col in lin:
            d.text((xm, y_m), txt, fill=col, font=f_met)
            xm += f_met.getlength(txt)
        y_m += 25

    return bloque


def componer_cabecera(ancho, titulo, subtitulo, f_tit, f_sub):
    alto = 78 if subtitulo else 50
    cab = Image.new("RGB", (ancho, alto), (255, 249, 232))
    d = ImageDraw.Draw(cab)
    d.rectangle([(0, 0), (ancho - 1, alto - 1)], outline=(235, 206, 128), width=1)
    d.text((16, 10), titulo, fill=COLOR_TEXTO, font=f_tit)
    if subtitulo:
        d.text((16, 46), subtitulo, fill=COLOR_SUAVE, font=f_sub)
    return cab


def componer_expresiones(dir_renders, salida_expr, etiqueta, f_tit, f_sub):
    presentes = []
    for slug, nombre in VISTAS_EXPRESIONES:
        ruta = Path(dir_renders) / f"{slug}.png"
        if ruta.exists():
            presentes.append((nombre, ruta))
    if not presentes:
        return None

    cols = 4
    alto_tile = 280
    tiles = [(nom, abrir_y_escalar(r, alto_tile)) for nom, r in presentes]
    w_tile = max(im.width for _, im in tiles)
    gap = 16
    margen = 16
    filas = (len(tiles) + cols - 1) // cols
    ancho_total = margen * 2 + cols * w_tile + (cols - 1) * gap
    alto_celda = alto_tile + 34
    alto_total = 70 + margen + filas * alto_celda + (filas - 1) * gap + margen

    lienzo = Image.new("RGB", (ancho_total, alto_total), COLOR_FONDO)
    cab = componer_cabecera(
        ancho_total - 20,
        f"Expresiones (6 caritas) y Acciones (5) — {etiqueta}",
        f"{len(tiles)} capturas de validacion (clipping y z-fighting)",
        f_tit,
        f_sub,
    )
    lienzo.paste(cab, (10, 10))
    d = ImageDraw.Draw(lienzo)

    for idx, (nom, im) in enumerate(tiles):
        r, c = divmod(idx, cols)
        x = margen + c * (w_tile + gap)
        y = 92 + r * (alto_celda + gap)
        d.rectangle([(x - 1, y - 1), (x + w_tile, y + alto_celda)], fill=(255, 255, 255), outline=COLOR_BORDE, width=1)
        d.text((x + 6, y + 6), nom, fill=COLOR_TEXTO, font=f_sub)
        ox = x + (w_tile - im.width) // 2
        lienzo.paste(im, (ox, y + 30))

    Path(salida_expr).parent.mkdir(parents=True, exist_ok=True)
    lienzo.save(salida_expr, optimize=True)
    print(f"Lamina de expresiones guardada: {salida_expr} {lienzo.size}")
    return salida_expr


def main():
    parser = argparse.ArgumentParser(description="Compone laminas comparativas de Nailong 3D contra capturas de la serie.")
    parser.add_argument("--renders", help="Directorio con los PNG renderizados (frente.png, perfil.png, ...)")
    parser.add_argument("--ab", nargs=2, metavar=("DIR_A", "DIR_B"), help="Modo 3 columnas: render A | render B | captura serie")
    parser.add_argument("--salida", required=True, help="Ruta de salida PNG de la lamina principal")
    parser.add_argument("--referencias", help="Directorio de capturas de la serie (opcional; fallback automatico)")
    parser.add_argument("--medidas", help="Archivo JSON generado por medir_nailong3d.js")
    parser.add_argument("--medidas-a", help="Medidas JSON del render A (solo para modo --ab)")
    parser.add_argument("--etiqueta", default="actual", help="Etiqueta para la cabecera de la lamina")
    parser.add_argument("--etiqueta-a", default="Antes (A)", help="Etiqueta columna A en modo --ab")
    parser.add_argument("--etiqueta-b", default="Despues (B)", help="Etiqueta columna B en modo --ab")
    parser.add_argument("--expresiones", action="store_true", help="Componer tambien la lamina de expresiones/acciones si existen")
    parser.add_argument("--salida-expresiones", help="Ruta PNG de salida para la lamina de expresiones")
    args = parser.parse_args()

    if not args.renders and not args.ab:
        parser.error("Indica --renders <dir> o --ab <dirA> <dirB>.")

    dir_refs = resolver_referencias(args.referencias)
    if dir_refs:
        print(f"Referencias de la serie encontradas en: {dir_refs}")
    else:
        print("AVISO: no se encontraron las capturas locales de la serie (D-25). Se compone la lamina con aviso sin fallar.")

    medidas = None
    if args.medidas and os.path.exists(args.medidas):
        with open(args.medidas, "r", encoding="utf-8") as f:
            medidas = json.load(f)
    medidas_a = None
    if args.medidas_a and os.path.exists(args.medidas_a):
        with open(args.medidas_a, "r", encoding="utf-8") as f:
            medidas_a = json.load(f)

    f_cab = cargar_fuente(24, negrita=True)
    f_tit = cargar_fuente(21, negrita=True)
    f_sub = cargar_fuente(15, negrita=False)
    f_met = cargar_fuente(15, negrita=False)

    bloques = []
    faltan_refs = 0

    for slug, titulo, archivo_ref, claves_met in VISTAS_BASE:
        columnas = []
        if args.ab:
            ruta_a = Path(args.ab[0]) / f"{slug}.png"
            ruta_b = Path(args.ab[1]) / f"{slug}.png"
            if not ruta_a.exists() and not ruta_b.exists():
                print(f"AVISO: falta {slug}.png en A y B; se omite fila «{titulo}».")
                continue
            img_a = abrir_y_escalar(ruta_a, ALTO_FILA) if ruta_a.exists() else crear_placeholder(380, ALTO_FILA, f"Falta A\n{slug}.png", f_sub)
            img_b = abrir_y_escalar(ruta_b, ALTO_FILA) if ruta_b.exists() else crear_placeholder(380, ALTO_FILA, f"Falta B\n{slug}.png", f_sub)
            columnas.append((args.etiqueta_a, img_a))
            columnas.append((args.etiqueta_b, img_b))
        else:
            ruta_r = Path(args.renders) / f"{slug}.png"
            if not ruta_r.exists():
                print(f"AVISO: falta el render {ruta_r}; se omite fila «{titulo}».")
                continue
            columnas.append((f"Render ({args.etiqueta})", abrir_y_escalar(ruta_r, ALTO_FILA)))

        ruta_ref = (dir_refs / archivo_ref) if dir_refs else None
        if ruta_ref and ruta_ref.exists():
            columnas.append((f"Serie: {archivo_ref}", abrir_y_escalar(ruta_ref, ALTO_FILA)))
        else:
            faltan_refs += 1
            columnas.append(("Serie (sin captura local, D-25)", crear_placeholder(400, ALTO_FILA, f"Sin captura local (D-25)\n{archivo_ref}", f_sub)))

        segs = construir_segmentos_metricas(claves_met, medidas, medidas_a)
        bloques.append(dibujar_fila(titulo, columnas, segs, f_tit, f_sub, f_met))

    if not bloques:
        sys.exit("Error: no se encontro ningun render valido para componer la lamina.")

    ancho_total = max(b.width for b in bloques) + 20
    subtitulo_partes = []
    if medidas and "resumen" in medidas:
        r = medidas["resumen"]
        subtitulo_partes.append(f"Nucleo v{medidas.get('version', '?')} · H={medidas.get('altura', '?')} · {medidas.get('huesos', '?')} huesos · {r['ok']}/{r['total']} metricas OK")
    if args.ab:
        subtitulo_partes.append(f"Comparativa A/B: {args.etiqueta_a} vs {args.etiqueta_b}")
    if faltan_refs:
        subtitulo_partes.append(f"{faltan_refs} vistas sin captura local (D-25)")

    titulo_cab = f"Nailong 3D vs Serie — {args.etiqueta}"
    cab = componer_cabecera(ancho_total - 20, titulo_cab, "  |  ".join(subtitulo_partes), f_cab, f_sub)

    alto_total = cab.height + 20 + sum(b.height + 10 for b in bloques) + 10
    total = Image.new("RGB", (ancho_total, alto_total), COLOR_FONDO)
    y = 10
    total.paste(cab, (10, y))
    y += cab.height + 10
    for b in bloques:
        total.paste(b, (10, y))
        y += b.height + 10

    salida_path = Path(args.salida)
    salida_path.parent.mkdir(parents=True, exist_ok=True)
    total.save(salida_path, optimize=True)
    print(f"Lamina comparativa guardada: {salida_path} {total.size}")

    if args.expresiones:
        dir_src_expr = args.ab[1] if args.ab else args.renders
        salida_expr = args.salida_expresiones or str(salida_path.with_name(salida_path.stem + "_expresiones.png"))
        componer_expresiones(dir_src_expr, salida_expr, args.etiqueta, f_cab, f_sub)


if __name__ == "__main__":
    main()
