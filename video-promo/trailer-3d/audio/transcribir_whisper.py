"""Transcriptor milimétrico palabra por palabra usando Whisper-cli (Velorn).

Lee el audio generado (locucion_trailer.wav) y produce:
1. locucion_trailer.json (timestamps en bruto por token BPE)
2. locucion_trailer_palabras.json (palabras completas con timestamps precisos y corrección fonética "Nailong")
3. locucion_trailer.srt (subtítulos estándar sincronizados)
"""
import os
import sys
import json
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = BASE_DIR / "output"
INPUT_WAV = OUTPUT_DIR / "locucion_trailer.wav"
OUTPUT_BASE = OUTPUT_DIR / "locucion_trailer"

APPDATA = os.environ.get("APPDATA", "")
WHISPER_DIR = Path(APPDATA) / "velorn" / "caption-engine"
WHISPER_EXE = WHISPER_DIR / "bin" / "Release" / "whisper-cli.exe"
WHISPER_MODEL = WHISPER_DIR / "models" / "ggml-large-v3-turbo.bin"

def parse_time_to_ms(ts_str):
    """Convierte formato HH:MM:SS,mmm a milisegundos enteros."""
    h, m, rest = ts_str.split(':')
    s, ms = rest.split(',')
    return int(h) * 3600000 + int(m) * 60000 + int(s) * 1000 + int(ms)

def procesar_palabras(json_file):
    """Reconstruye palabras completas a partir de tokens BPE de Whisper y corrige 'Nylon' -> 'Nailong'."""
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    words = []
    for seg in data.get('transcription', []):
        curr_word = ''
        from_ms = 0
        to_ms = 0
        for tok in seg.get('tokens', []):
            t = tok.get('text', '')
            if t.startswith('[_'):
                continue
            if not tok.get('timestamps') or not tok['timestamps'].get('from'):
                continue
            t_from = parse_time_to_ms(tok['timestamps']['from'])
            t_to = parse_time_to_ms(tok['timestamps']['to'])

            # En BPE, un espacio inicial ' ' indica inicio de palabra nueva
            if t.startswith(' '):
                if curr_word.strip():
                    words.append({'word': curr_word.strip(), 'fromMs': from_ms, 'toMs': to_ms})
                curr_word = t
                from_ms = t_from
                to_ms = t_to
            else:
                if not curr_word:
                    curr_word = t
                    from_ms = t_from
                    to_ms = t_to
                else:
                    curr_word += t
                    to_ms = t_to
        if curr_word.strip():
            words.append({'word': curr_word.strip(), 'fromMs': from_ms, 'toMs': to_ms})

    # Corrección fonética de nombres propios y URLs que Whisper transcribe fonéticamente
    for w in words:
        w['word'] = w['word'].replace('Nylon', 'Nailong').replace('nylon', 'Nailong')
        w['word'] = w['word'].replace('alvarolofra.jitube.yo', 'alvarolofra.github.io')

    palabras_file = OUTPUT_DIR / "locucion_trailer_palabras.json"
    with open(palabras_file, 'w', encoding='utf-8') as f:
        json.dump(words, f, indent=2, ensure_ascii=False)

    print(f"[Whisper] Palabras reconstruidas: {len(words)} palabras guardadas en {palabras_file.name}")
    return palabras_file

def transcribir():
    if not WHISPER_EXE.exists():
        sys.exit(f"ERROR: No se encuentra whisper-cli en {WHISPER_EXE}")
    if not WHISPER_MODEL.exists():
        sys.exit(f"ERROR: No se encuentra modelo Whisper en {WHISPER_MODEL}")
    if not INPUT_WAV.exists():
        sys.exit(f"ERROR: No se encuentra archivo de audio en {INPUT_WAV}. Ejecuta primero generar_locucion.py")

    print(f"[Whisper] Procesando {INPUT_WAV}")
    print(f"[Whisper] Modelo: {WHISPER_MODEL.name}")
    print(f"[Whisper] Idioma: es | Salida: {OUTPUT_BASE}.[json|srt]")

    cmd = [
        str(WHISPER_EXE),
        "-m", str(WHISPER_MODEL),
        "-l", "es",
        "-osrt",
        "-ojf",
        "-of", str(OUTPUT_BASE),
        "-f", str(INPUT_WAV)
    ]

    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print("[Whisper] Error en transcripción:")
        print(res.stderr)
        sys.exit(res.returncode)

    json_file = OUTPUT_DIR / "locucion_trailer.json"
    srt_file = OUTPUT_DIR / "locucion_trailer.srt"
    
    # Corregir SRT también
    if srt_file.exists():
        srt_content = srt_file.read_text(encoding='utf-8')
        srt_content = srt_content.replace('Nylon', 'Nailong').replace('nylon', 'Nailong')
        srt_file.write_text(srt_content, encoding='utf-8')

    palabras_file = procesar_palabras(json_file)

    print(f"[Whisper] Transcripción completada exitosamente:")
    print(f"  - JSON tokens: {json_file.name} ({json_file.stat().st_size} bytes)")
    print(f"  - JSON palabras: {palabras_file.name} ({palabras_file.stat().st_size} bytes)")
    print(f"  - SRT subtítulos: {srt_file.name} ({srt_file.stat().st_size} bytes)")
    return json_file, palabras_file, srt_file

if __name__ == "__main__":
    transcribir()
