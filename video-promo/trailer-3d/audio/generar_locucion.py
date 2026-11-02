"""Generador automático de locución TTS para el tráiler de Nailong.

Utiliza el TTS local de Kokoro v1.0 instalado en C:\\src\\tts_local\\
Voz por defecto: ef_dora (animada, aguda, neutra)
"""
import os
import sys
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
ROOT_TRAILER = BASE_DIR.parent
GUION_TXT = ROOT_TRAILER / "guion" / "guion_locucion.txt"
OUTPUT_DIR = BASE_DIR / "output"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_WAV = OUTPUT_DIR / "locucion_trailer.wav"

TTS_BAT = Path(r"C:\src\tts_local\tts.bat")

def generar(voz="ef_dora", velocidad=1.15):
    if not TTS_BAT.exists():
        sys.exit(f"ERROR: No se encuentra tts.bat en {TTS_BAT}")
    if not GUION_TXT.exists():
        sys.exit(f"ERROR: No se encuentra el guion en {GUION_TXT}")

    print(f"[TTS] Leyendo guion: {GUION_TXT}")
    print(f"[TTS] Motor: Kokoro v1.0 | Voz: {voz} | Velocidad: {velocidad}")
    print(f"[TTS] Salida: {OUTPUT_WAV}")

    cmd = [
        str(TTS_BAT),
        "-f", str(GUION_TXT),
        "-o", str(OUTPUT_WAV),
        "--motor", "kokoro",
        "--voz", voz,
        "--velocidad", str(velocidad)
    ]

    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print("[TTS] Error en generación:")
        print(res.stderr)
        sys.exit(res.returncode)

    print("[TTS] Generación completada con éxito.")
    print(res.stdout.strip())
    print(f"[TTS] Archivo generado: {OUTPUT_WAV} ({OUTPUT_WAV.stat().st_size} bytes)")
    return OUTPUT_WAV

if __name__ == "__main__":
    voz = sys.argv[1] if len(sys.argv) > 1 else "ef_dora"
    vel = float(sys.argv[2]) if len(sys.argv) > 2 else 1.15
    generar(voz=voz, velocidad=vel)
