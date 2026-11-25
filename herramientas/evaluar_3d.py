#!/usr/bin/env python3
"""
Orden unica de evaluacion completa de Nailong 3D (Fase 0 · mejora 3D5):
  1) node --check js/11..14
  2) node herramientas/medir_nailong3d.js --salida <dir>/medidas.json --tabla
  3) node herramientas/capturar_3d_cdp.js --salida <dir>/renders [--expresiones]
  4) python herramientas/lamina_comparativa.py --renders <dir>/renders --medidas <dir>/medidas.json --salida <dir>/lamina_<etiqueta>.png [--expresiones]
  5) con --cara: python herramientas/perfil_cara.py (silueta frontal de la cara, F0-F4 y O1; mejoras 3D12 y 3D18)

Uso:
  python herramientas/evaluar_3d.py --etiqueta fase0_base [--expresiones] [--cara] [--salida <dir>] [--referencias <dir>]
"""

import argparse
import os
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

SCRIPTS_3D = [
    "js/11-nailong3d-geometria.js",
    "js/12-nailong3d-escena.js",
    "js/13-nailong3d-animacion.js",
    "js/14-nailong3d-visor.js",
]


def ejecutar_paso(titulo, cmd, cwd):
    print(f"\n[{titulo}]", flush=True)
    t0 = time.perf_counter()
    res = subprocess.run(cmd, cwd=cwd)
    dt = time.perf_counter() - t0
    if res.returncode != 0:
        raise SystemExit(f"FALLO en «{titulo}» (exit={res.returncode}, {dt:.2f} s)")
    print(f"OK ({dt:.2f} s)", flush=True)
    return dt


def main():
    parser = argparse.ArgumentParser(description="Evaluacion automatica completa de Nailong 3D.")
    parser.add_argument("--etiqueta", default=datetime.now().strftime("%Y-%m-%d_%H%M%S"), help="Etiqueta para nombrar la carpeta y lamina")
    parser.add_argument("--expresiones", action="store_true", help="Capturar tambien las 6 caritas y 5 acciones")
    parser.add_argument("--cara", action="store_true", help="3D12: vistas de la cara y medidas F1-F4/O1 frente a las capturas frontales")
    parser.add_argument("--salida", help="Directorio de salida (por defecto documentacion/referencias_nailong_serie/comparativas/<etiqueta>)")
    parser.add_argument("--referencias", help="Directorio opcional con las capturas locales de la serie")
    parser.add_argument("--raiz", default=os.getcwd(), help="Directorio raiz del proyecto")
    args = parser.parse_args()

    raiz = Path(args.raiz).resolve()
    herr = Path(__file__).resolve().parent
    salida = Path(args.salida).resolve() if args.salida else (raiz / "documentacion" / "referencias_nailong_serie" / "comparativas" / args.etiqueta)
    dir_renders = salida / "renders"
    archivo_medidas = salida / "medidas.json"
    archivo_lamina = salida / f"lamina_{args.etiqueta}.png"

    salida.mkdir(parents=True, exist_ok=True)
    t_total = time.perf_counter()
    tiempos = {}

    # 1) Sintaxis JS (js/11..14)
    print("[1/4 · Sintaxis Node (--check) en js/11..14]", flush=True)
    t0 = time.perf_counter()
    for script in SCRIPTS_3D:
        ruta_js = raiz / script
        if not ruta_js.exists():
            raise SystemExit(f"No existe {ruta_js}")
        res = subprocess.run(["node", "--check", str(ruta_js)], cwd=raiz)
        if res.returncode != 0:
            raise SystemExit(f"Error de sintaxis en {script}")
    tiempos["sintaxis"] = time.perf_counter() - t0
    print(f"OK · {len(SCRIPTS_3D)} ficheros sin errores ({tiempos['sintaxis']:.2f} s)", flush=True)

    # 2) Medicion geometrica (B1-V3)
    tiempos["medidas"] = ejecutar_paso(
        "2/4 · Medicion geometrica (medir_nailong3d.js)",
        ["node", str(herr / "medir_nailong3d.js"), str(raiz / "js/11-nailong3d-geometria.js"), "--salida", str(archivo_medidas), "--tabla"],
        cwd=raiz,
    )

    # 3) Capturas Headless CDP
    cmd_cdp = [
        "node",
        str(herr / "capturar_3d_cdp.js"),
        "--raiz", str(raiz),
        "--salida", str(dir_renders),
    ]
    if args.expresiones:
        cmd_cdp.append("--expresiones")
    if args.cara:
        cmd_cdp.append("--cara")
    tiempos["cdp"] = ejecutar_paso("3/4 · Captura de vistas via Chrome Headless CDP", cmd_cdp, cwd=raiz)

    # 4) Lamina comparativa
    cmd_lam = [
        sys.executable,
        str(herr / "lamina_comparativa.py"),
        "--renders", str(dir_renders),
        "--medidas", str(archivo_medidas),
        "--salida", str(archivo_lamina),
        "--etiqueta", args.etiqueta,
    ]
    if args.referencias:
        cmd_lam.extend(["--referencias", args.referencias])
    if args.expresiones:
        cmd_lam.append("--expresiones")
    tiempos["lamina"] = ejecutar_paso("4/4 · Composicion de lamina comparativa", cmd_lam, cwd=raiz)

    # 5) 3D12 · Silueta frontal de la cara frente a las capturas frontales de la serie (opcional)
    archivo_cara = salida / f"lamina_{args.etiqueta}_cara.png"
    if args.cara:
        cmd_cara = [
            sys.executable,
            str(herr / "perfil_cara.py"),
            "--renders", str(dir_renders),
            "--etiquetas", args.etiqueta,
            "--salida", str(archivo_cara),
            "--json", str(salida / "medidas_cara.json"),
        ]
        if args.referencias:
            cmd_cara.extend(["--referencias", args.referencias])
        tiempos["cara"] = ejecutar_paso("5/5 · Silueta frontal de la cara (perfil_cara.py)", cmd_cara, cwd=raiz)

    total_s = time.perf_counter() - t_total
    print("\n=== EVALUACION 3D COMPLETADA ===")
    print(f"  Etiqueta:   {args.etiqueta}")
    print(f"  Medidas:    {archivo_medidas}")
    print(f"  Renders:    {dir_renders}")
    print(f"  Lamina:     {archivo_lamina}")
    if args.expresiones:
        print(f"  Expresiones:{salida / f'lamina_{args.etiqueta}_expresiones.png'}")
    if args.cara:
        print(f"  Cara:       {archivo_cara}")
    print(
        f"  Tiempos:    sintaxis={tiempos['sintaxis']:.2f}s · medidas={tiempos['medidas']:.2f}s · "
        f"cdp={tiempos['cdp']:.2f}s · lamina={tiempos['lamina']:.2f}s · TOTAL={total_s:.2f}s"
    )


if __name__ == "__main__":
    main()
