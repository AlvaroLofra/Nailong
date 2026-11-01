"""Compone la canción original del tráiler v2 de Nailong y sus efectos de sonido.

Todo se sintetiza aquí (sin samples descargados) para que la música sea propia
del proyecto. La canción dura 29 s a 120 BPM (1 compás = 2 s) y NO es un bucle:

    Intro            0–4 s   caja de música sola
    Estrofa          4–8 s   + bajo saltarín, palmas y colchón de acordes
    Estribillo       8–16 s  melodía principal con xilófono
    Puente          16–20 s  pizzicato juguetón (minijuego)
    Estribillo final 20–26 s el estribillo un tono más alto (re mayor)
    Final           26–29 s  acorde largo que se apaga + campanita

Uso:
    python video-promo/tools/componer_musica_v2.py

Escribe en video-promo/v2/assets/audio/:
    nailong_cancion_v2.wav   la canción (estéreo, 44,1 kHz, 16 bits)
    sfx/*.wav                efectos (boing, pop, campanita, ñam, página, enviado)
"""
from __future__ import annotations

import wave
from pathlib import Path

import numpy as np

SR = 44100
BPM = 120
BEAT = 60 / BPM          # 0,5 s
BAR = 4 * BEAT           # 2 s
DURACION = 29.0

SALIDA = Path(__file__).resolve().parent.parent / "v2" / "assets" / "audio"


# --------------------------------------------------------------------------
# Utilidades
# --------------------------------------------------------------------------
def hz(midi: float) -> float:
    return 440.0 * 2 ** ((midi - 69) / 12)


def nota(nombre: str) -> int:
    """'C5' -> 72, 'F#4' -> 66."""
    base = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}
    alt = 1 if "#" in nombre else -1 if nombre[1] == "b" else 0
    octava = int(nombre[-1])
    return 12 * (octava + 1) + base[nombre[0]] + alt


def envolvente(n: int, ataque: float, caida: float) -> np.ndarray:
    """Ataque lineal corto y caída exponencial (caida = segundos hasta -60 dB)."""
    t = np.arange(n) / SR
    env = np.exp(-6.9 * t / max(caida, 1e-3))
    a = max(1, int(ataque * SR))
    env[:a] *= np.linspace(0, 1, a)
    # Cola de 5 ms a cero para que ninguna nota haga «clic» al cortarse.
    r = min(n, int(0.005 * SR))
    env[-r:] *= np.linspace(1, 0, r)
    return env


def ruido(n: int, semilla: int) -> np.ndarray:
    return np.random.default_rng(semilla).uniform(-1, 1, n)


def paso_bajo(x: np.ndarray, corte: float) -> np.ndarray:
    """Filtro de un polo: suficiente para redondear el ruido y los timbres."""
    a = np.exp(-2 * np.pi * corte / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc
        y[i] = acc
    return y


# --------------------------------------------------------------------------
# Instrumentos (cada uno devuelve una nota mono)
# --------------------------------------------------------------------------
def caja_de_musica(f: float, dur: float) -> np.ndarray:
    n = int((dur + 1.2) * SR)
    t = np.arange(n) / SR
    # Parciales algo inarmónicos, como las púas metálicas de una caja de música.
    x = (np.sin(2 * np.pi * f * t)
         + 0.35 * np.sin(2 * np.pi * f * 3.01 * t) * np.exp(-t * 6)
         + 0.15 * np.sin(2 * np.pi * f * 5.98 * t) * np.exp(-t * 10))
    return x * envolvente(n, 0.002, 1.3)


def xilofono(f: float, dur: float) -> np.ndarray:
    n = int((dur + 0.6) * SR)
    t = np.arange(n) / SR
    # Barra de madera: fundamental + parciales 4x y 10x que mueren muy rápido.
    x = (np.sin(2 * np.pi * f * t)
         + 0.5 * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t * 18)
         + 0.2 * np.sin(2 * np.pi * f * 9.6 * t) * np.exp(-t * 40))
    return x * envolvente(n, 0.001, 0.7)


def pizzicato(f: float, dur: float) -> np.ndarray:
    n = int((dur + 0.3) * SR)
    t = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * f * k * t) / k ** 1.3 * np.exp(-t * 4 * k) for k in range(1, 6))
    return x * envolvente(n, 0.002, 0.35)


def bajo(f: float, dur: float) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    # Triángulo suave + armónicos para que se oiga también en el altavoz del móvil.
    x = (2 / np.pi) * np.arcsin(np.sin(2 * np.pi * f * t))
    x += 0.3 * np.sin(2 * np.pi * f * 2 * t) + 0.15 * np.sin(2 * np.pi * f * 3 * t)
    return x * envolvente(n, 0.004, dur * 1.6)


def colchon(fs: list[float], dur: float) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = np.zeros(n)
    for f in fs:
        # Dos osciladores ligeramente desafinados dan un coro cálido.
        x += np.sin(2 * np.pi * f * t) + np.sin(2 * np.pi * f * 1.004 * t + 1.0)
        x += 0.25 * np.sin(2 * np.pi * 2 * f * t)
    env = np.ones(n)
    a, r = int(0.25 * SR), int(0.35 * SR)
    env[:a] = np.linspace(0, 1, a)
    env[-r:] = np.linspace(1, 0, r)
    return x / len(fs) * env


def bombo(semilla: int = 0) -> np.ndarray:
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    f = 55 + 90 * np.exp(-t * 35)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR)
    return x * envolvente(n, 0.001, 0.22)


def palmas(semilla: int) -> np.ndarray:
    n = int(0.18 * SR)
    x = ruido(n, semilla)
    x = x - paso_bajo(x, 900)               # quita graves: suena a palmada, no a golpe
    env = np.zeros(n)
    # Tres micro-golpes seguidos, como varias manos que no aplauden a la vez.
    for k, d in enumerate((0, 0.009, 0.019)):
        i = int(d * SR)
        env[i:] += envolvente(n - i, 0.0005, 0.12) * (1 - 0.2 * k)
    return x * env


def maraca(semilla: int) -> np.ndarray:
    n = int(0.07 * SR)
    x = ruido(n, semilla)
    x = x - paso_bajo(x, 4000)
    return x * envolvente(n, 0.003, 0.06)


def campanita(f: float = 2093.0, dur: float = 1.6) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 3)
         + 0.25 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 6))
    return x * envolvente(n, 0.001, dur)


# --------------------------------------------------------------------------
# Partitura
# --------------------------------------------------------------------------
# (nota, duración en pulsos). None = silencio.
MOTIVO_INTRO = [("E5", .5), ("G5", .5), ("C6", 1), ("G5", 1), (None, 1),
                ("D5", .5), ("G5", .5), ("B5", .5), ("D6", .5), ("G5", 2)]

ESTROFA = [("C5", .5), ("E5", .5), ("G5", .5), ("E5", .5), ("C5", 1), (None, 1),
           ("D5", .5), ("G5", .5), ("B5", .5), ("G5", .5), ("D5", 1), ("G4", 1)]

ESTRIBILLO = [
    ("E5", .5), ("G5", .5), ("C6", 1), ("G5", .5), ("E5", .5), ("G5", 1),      # Do
    ("A5", .5), ("G5", .5), ("E5", 1), ("C5", 1), ("E5", 1),                   # La m
    ("F5", .5), ("A5", .5), ("C6", 1), ("A5", .5), ("F5", .5), ("A5", 1),      # Fa
    ("G5", 1), ("B5", .5), ("D6", .5), ("G5", 2),                              # Sol
]

# Estribillo final: 3 compases (en Do; luego se sube un tono) que cierran en tónica.
ESTRIBILLO_FINAL = ESTRIBILLO[:11] + [
    ("F5", .5), ("A5", .5), ("C6", 1), ("B5", .5), ("D6", .5), ("B5", 1),      # Fa → Sol (sensible → tónica)
]

PUENTE = [("A5", .5), ("F5", .5), ("C5", .5), ("F5", .5), ("A5", .5), ("C6", .5), ("A5", .5), ("F5", .5),
          ("B5", .5), ("G5", .5), ("D5", .5), ("G5", .5), ("B5", .5), ("D6", .5), ("F6", .5), ("D6", .5)]

# Acordes por compás: (raíz del bajo, notas del colchón), en Do; t = segundo de inicio.
ACORDES = [
    (4,  ["C3", ["C4", "E4", "G4"]]), (6,  ["G2", ["B3", "D4", "G4"]]),
    (8,  ["C3", ["C4", "E4", "G4"]]), (10, ["A2", ["A3", "C4", "E4"]]),
    (12, ["F2", ["A3", "C4", "F4"]]), (14, ["G2", ["B3", "D4", "G4"]]),
    (16, ["F2", ["A3", "C4", "F4"]]), (18, ["G2", ["B3", "D4", "F4"]]),
]
# En re mayor (todo +2 semitonos): Re, Si m, Sol–La (medio compás cada uno).
# (inicio en s, duración en s, acorde)
ACORDES_FINAL = [
    (20, 2, ["C3", ["C4", "E4", "G4"]]), (22, 2, ["A2", ["A3", "C4", "E4"]]),
    (24, 1, ["F2", ["A3", "C4", "F4"]]), (25, 1, ["G2", ["B3", "D4", "G4"]]),
]


class Pista:
    def __init__(self) -> None:
        self.buf = np.zeros((int((DURACION + 2) * SR), 2))

    def poner(self, x: np.ndarray, t: float, gan: float, pan: float = 0.0) -> None:
        i = int(round(t * SR))
        j = min(len(self.buf), i + len(x))
        izq, der = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        self.buf[i:j, 0] += x[: j - i] * gan * izq * 1.414
        self.buf[i:j, 1] += x[: j - i] * gan * der * 1.414


def melodia(p: Pista, frase, t0: float, instr, gan: float, transp: int = 0, pan: float = 0.0) -> None:
    t = t0
    for nom, pulsos in frase:
        dur = pulsos * BEAT
        if nom:
            p.poner(instr(hz(nota(nom) + transp), dur), t, gan, pan)
        t += dur


def acompanamiento(p: Pista, t0: float, compases: float, raiz: str, notas: list[str], transp: int,
                   con_palmas: bool, semilla: int) -> None:
    f_raiz = nota(raiz) + transp
    # Colchón de acordes, bajito y abierto en estéreo.
    p.poner(colchon([hz(nota(n) + transp) for n in notas], compases * BAR), t0, 0.07, -0.3)
    p.poner(colchon([hz(nota(n) + transp + 12) for n in notas], compases * BAR), t0, 0.03, 0.4)
    for k in range(int(compases * 4)):
        t = t0 + k * BEAT
        # Bajo saltarín: raíz en los pulsos 1 y 3, quinta en 2 y 4.
        f = f_raiz if k % 2 == 0 else f_raiz + 7
        p.poner(bajo(hz(f), BEAT * 0.55), t, 0.30)
        if k % 2 == 0:
            p.poner(bombo(), t, 0.45)
        elif con_palmas:
            p.poner(palmas(semilla + k), t, 0.16, 0.15)


def componer() -> np.ndarray:
    p = Pista()
    # Intro: solo caja de música (0–4 s).
    melodia(p, MOTIVO_INTRO, 0.0, caja_de_musica, 0.30, pan=0.1)
    p.poner(campanita(), 0.0, 0.10, -0.2)

    # Estrofa (4–8 s).
    melodia(p, ESTROFA, 4.0, xilofono, 0.26, pan=-0.1)
    for t, (raiz, notas) in ACORDES[:2]:
        acompanamiento(p, t, 1, raiz, notas, 0, con_palmas=True, semilla=int(t * 10))

    # Estribillo (8–16 s): xilófono + caja de música una octava arriba, muy suave.
    melodia(p, ESTRIBILLO, 8.0, xilofono, 0.32)
    melodia(p, ESTRIBILLO, 8.0, caja_de_musica, 0.07, transp=12, pan=0.35)
    for t, (raiz, notas) in ACORDES[2:6]:
        acompanamiento(p, t, 1, raiz, notas, 0, con_palmas=True, semilla=int(t * 10))
    for k in range(16):                       # maracas en corcheas
        p.poner(maraca(500 + k), 8.0 + k * BEAT + BEAT / 2, 0.10, 0.5)

    # Puente (16–20 s): pizzicato ligero, sin palmas; subida hacia el estribillo final.
    melodia(p, PUENTE, 16.0, pizzicato, 0.30, pan=0.15)
    for t, (raiz, notas) in ACORDES[6:8]:
        acompanamiento(p, t, 1, raiz, notas, 0, con_palmas=False, semilla=int(t * 10))
    for k, nom in enumerate(["G5", "A5", "B5", "C6", "D6", "E6", "F#6", "G6"]):   # escalita
        p.poner(caja_de_musica(hz(nota(nom)), 0.12), 19.0 + k * 0.125, 0.10, 0.3)

    # Estribillo final (20–26 s) un tono más alto.
    melodia(p, ESTRIBILLO_FINAL, 20.0, xilofono, 0.34, transp=2)
    melodia(p, ESTRIBILLO_FINAL, 20.0, caja_de_musica, 0.08, transp=14, pan=0.35)
    for t, segundos, (raiz, notas) in ACORDES_FINAL:
        acompanamiento(p, t, segundos / BAR, raiz, notas, 2, con_palmas=True, semilla=int(t * 10))
    for k in range(12):
        p.poner(maraca(700 + k), 20.0 + k * BEAT + BEAT / 2, 0.10, 0.5)

    # Final (26–29 s): acorde de Re mayor que se apaga + arpegio de campanitas.
    final = [hz(nota(n) + 2) for n in ["C4", "E4", "G4", "C5"]]
    p.poner(colchon(final, 2.8), 26.0, 0.10)
    p.poner(bajo(hz(nota("C3") + 2), 2.5), 26.0, 0.30)
    p.poner(bombo(), 26.0, 0.45)
    p.poner(xilofono(hz(nota("C6") + 2), 2.0), 26.0, 0.30)
    for k, nom in enumerate(["C6", "E6", "G6", "C7"]):
        p.poner(campanita(hz(nota(nom) + 2), 2.2), 26.25 + k * 0.12, 0.08, -0.3 + 0.2 * k)

    mezcla = p.buf[: int(DURACION * SR)]
    mezcla = reverb(mezcla)
    # Fundido de salida en el último medio segundo para terminar en silencio limpio.
    r = int(0.5 * SR)
    mezcla[-r:] *= np.linspace(1, 0, r)[:, None]
    return mezcla


def reverb(x: np.ndarray, mezcla: float = 0.18) -> np.ndarray:
    """Sala pequeña: convolución con ruido que decae (distinto en cada canal)."""
    n = int(0.9 * SR)
    t = np.arange(n) / SR
    salida = np.empty_like(x)
    for c in range(2):
        ir = ruido(n, 40 + c) * np.exp(-t * 7.5)
        ir = paso_bajo(ir, 5000)
        ir /= np.sqrt(np.sum(ir ** 2))
        m = len(x[:, c]) + n - 1
        tam = 1 << (m - 1).bit_length()
        wet = np.fft.irfft(np.fft.rfft(x[:, c], tam) * np.fft.rfft(ir, tam), tam)[: len(x)]
        salida[:, c] = x[:, c] + mezcla * wet
    return salida


# --------------------------------------------------------------------------
# Efectos de sonido (2–3 variantes de cada uno para que no suenen repetidos)
# --------------------------------------------------------------------------
def sfx_boing(var: int) -> np.ndarray:
    dur = 0.45
    n = int(dur * SR)
    t = np.arange(n) / SR
    base = (180, 220, 260)[var]
    # Muelle: el tono vibra rápido y sube, como una goma que rebota.
    f = base * (1 + 0.8 * t / dur) * (1 + 0.12 * np.sin(2 * np.pi * 18 * t) * np.exp(-t * 4))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR)
    x += 0.3 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    return x * envolvente(n, 0.003, dur)


def sfx_pop(var: int) -> np.ndarray:
    n = int(0.12 * SR)
    t = np.arange(n) / SR
    f0 = (900, 1100, 1300)[var]
    f = f0 * np.exp(-t * 25) + 300
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * ruido(n, var) * np.exp(-t * 200)
    return x * envolvente(n, 0.0005, 0.1)


def sfx_campanita(var: int) -> np.ndarray:
    return campanita((2093.0, 2349.3)[var], 1.4)


def sfx_nam(var: int) -> np.ndarray:
    # «Ñam»: dos mordisquitos (golpe grave + chasquido).
    n = int(0.35 * SR)
    x = np.zeros(n)
    for k, d in enumerate((0.0, 0.14)):
        i = int(d * SR)
        m = int(0.1 * SR)
        tt = np.arange(m) / SR
        golpe = np.sin(2 * np.pi * (260 - 60 * k + 40 * var) * tt) * np.exp(-tt * 40)
        golpe += 0.4 * paso_bajo(ruido(m, var * 10 + k), 2500) * np.exp(-tt * 60)
        x[i:i + m] += golpe
    return x


def sfx_pagina(var: int) -> np.ndarray:
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    x = ruido(n, 90 + var)
    x = paso_bajo(x - paso_bajo(x, 1500), 7000)
    env = np.sin(np.pi * np.clip(t / 0.3, 0, 1)) ** 2
    return x * env


def sfx_enviado(var: int) -> np.ndarray:
    # Dos notas que suben (sol → re), como el «enviado» de una app de mensajes.
    a = xilofono(hz(79), 0.08)[: int(0.12 * SR)]
    b = xilofono(hz(86), 0.2)
    x = np.zeros(int(0.12 * SR) + len(b))
    x[: len(a)] += a
    x[int(0.09 * SR): int(0.09 * SR) + len(b)] += b
    return x


EFECTOS = {
    "boing": (sfx_boing, 3), "pop": (sfx_pop, 3), "campanita": (sfx_campanita, 2),
    "nam": (sfx_nam, 2), "pagina": (sfx_pagina, 2), "enviado": (sfx_enviado, 1),
}


# --------------------------------------------------------------------------
# Escritura
# --------------------------------------------------------------------------
def normalizar(x: np.ndarray, pico_db: float) -> np.ndarray:
    return x / np.max(np.abs(x)) * 10 ** (pico_db / 20)


def guardar(ruta: Path, x: np.ndarray) -> None:
    ruta.parent.mkdir(parents=True, exist_ok=True)
    if x.ndim == 1:
        x = np.stack([x, x], axis=1)
    datos = (np.clip(x, -1, 1) * 32767).astype("<i2")
    with wave.open(str(ruta), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(datos.tobytes())


def limitar(x: np.ndarray, subida_db: float, techo_db: float) -> np.ndarray:
    """Sube el volumen y aplasta solo los picos que pasarían del techo.

    La envolvente sube al instante con cada golpe y baja en ~80 ms, así la
    ganancia se recupera sin que se note «bombeo».
    """
    x = x * 10 ** (subida_db / 20)
    techo = 10 ** (techo_db / 20)
    pico = np.max(np.abs(x), axis=1)
    caida = np.exp(-1 / (0.08 * SR))
    env = np.empty_like(pico)
    acc = 0.0
    for i, v in enumerate(pico):
        acc = v if v > acc else caida * acc + (1 - caida) * v
        env[i] = acc
    ganancia = np.minimum(1.0, techo / np.maximum(env, 1e-9))
    return np.clip(x * ganancia[:, None], -techo, techo)


def main() -> None:
    # Pico a -3 dB y luego +6 dB con limitador a -2 dB: unos -15 LUFS, nivel de redes con margen para los efectos.
    cancion = limitar(normalizar(componer(), -3.0), 6.0, -2.0)
    guardar(SALIDA / "nailong_cancion_v2.wav", cancion)
    print(f"canción: {SALIDA / 'nailong_cancion_v2.wav'} ({len(cancion) / SR:.1f} s)")
    for nombre, (fn, variantes) in EFECTOS.items():
        for v in range(variantes):
            ruta = SALIDA / "sfx" / f"{nombre}_{v + 1}.wav"
            guardar(ruta, normalizar(fn(v), -3.0))
    print(f"efectos: {sum(v for _, v in EFECTOS.values())} ficheros en {SALIDA / 'sfx'}")


if __name__ == "__main__":
    main()
