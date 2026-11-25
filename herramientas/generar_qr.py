"""Genera códigos QR estáticos en SVG sin dependencias (mejora W34: la web ya no los pide a api.qrserver.com).

Sigue la norma ISO/IEC 18004 (mismo algoritmo que la referencia pública de Project Nayuki):
codificación en modo byte, Reed-Solomon sobre GF(256), patrones fijos, zigzag de datos,
8 máscaras con la puntuación de penalización estándar e información de formato BCH.
Comprobado el 25/11/2026: con corrección L (la de api.qrserver.com) los QR de la web salen
idénticos módulo a módulo a los que daba ese servicio (1.089/1.089 y 841/841).

Uso:
  py -3 herramientas/generar_qr.py URL --html apk-qr-img --etiqueta "Código QR ..."   # <svg> para index.html
  py -3 herramientas/generar_qr.py URL --ecc M --margen 2 --salida qr.svg
  py -3 herramientas/generar_qr.py URL --matriz        # imprime la matriz (1 = oscuro) para comparar
verify_all.py (tests 22 y 48) regenera los QR de index.html con este script y comprueba que coinciden.
"""
import argparse
import sys

# Tablas de la norma (índice = versión; el 0 no se usa)
ECC_POR_BLOQUE = {
    'L': [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    'M': [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
    'Q': [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    'H': [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
}
NUM_BLOQUES = {
    'L': [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
    'M': [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
    'Q': [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
    'H': [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
}
BITS_FORMATO_ECC = {'L': 1, 'M': 0, 'Q': 3, 'H': 2}


def modulos_datos_brutos(ver):
    r = (16 * ver + 128) * ver + 64
    if ver >= 2:
        n = ver // 7 + 2
        r -= (25 * n - 10) * n - 55
        if ver >= 7:
            r -= 36
    return r


def palabras_datos(ver, ecc):
    return modulos_datos_brutos(ver) // 8 - ECC_POR_BLOQUE[ecc][ver] * NUM_BLOQUES[ecc][ver]


def posiciones_alineacion(ver):
    if ver == 1:
        return []
    n = ver // 7 + 2
    tam = ver * 4 + 17
    paso = 26 if ver == 32 else (ver * 4 + n * 2 + 1) // (n * 2 - 2) * 2
    res = [6] + [0] * (n - 1)
    pos = tam - 7
    for i in range(n - 1, 0, -1):
        res[i] = pos
        pos -= paso
    return res


def gf_mul(x, y):
    z = 0
    for i in range(7, -1, -1):
        z = (z << 1) ^ ((z >> 7) * 0x11D)
        z ^= ((y >> i) & 1) * x
    return z


def rs_divisor(grado):
    res = [0] * (grado - 1) + [1]
    raiz = 1
    for _ in range(grado):
        for j in range(grado):
            res[j] = gf_mul(res[j], raiz)
            if j + 1 < grado:
                res[j] ^= res[j + 1]
        raiz = gf_mul(raiz, 0x02)
    return res


def rs_resto(datos, divisor):
    res = [0] * len(divisor)
    for b in datos:
        factor = b ^ res.pop(0)
        res.append(0)
        for i, c in enumerate(divisor):
            res[i] ^= gf_mul(c, factor)
    return res


class QR:
    def __init__(self, texto, ecc='M', mascara=None):
        datos = texto.encode('utf-8')
        self.ecc = ecc
        for ver in range(1, 41):
            bits_cuenta = 8 if ver <= 9 else 16
            if 4 + bits_cuenta + 8 * len(datos) <= palabras_datos(ver, ecc) * 8:
                break
        else:
            raise ValueError('El texto no cabe en un QR')
        self.ver = ver
        self.tam = ver * 4 + 17
        # Flujo de bits: modo byte (0100) + longitud + datos + terminador + relleno
        bits = []
        def poner(valor, n):
            bits.extend((valor >> i) & 1 for i in range(n - 1, -1, -1))
        poner(0b0100, 4)
        poner(len(datos), bits_cuenta)
        for b in datos:
            poner(b, 8)
        capacidad = palabras_datos(ver, ecc) * 8
        poner(0, min(4, capacidad - len(bits)))
        poner(0, (-len(bits)) % 8)
        relleno = 0xEC
        while len(bits) < capacidad:
            poner(relleno, 8)
            relleno ^= 0xEC ^ 0x11
        palabras = [int(''.join(map(str, bits[i:i + 8])), 2) for i in range(0, len(bits), 8)]
        self.palabras = self._con_ecc(palabras)
        self.m = [[False] * self.tam for _ in range(self.tam)]
        self.fija = [[False] * self.tam for _ in range(self.tam)]
        self._patrones()
        self._colocar(self.palabras)
        if mascara is None:
            mejor, mascara = None, 0
            for k in range(8):
                self._aplicar_mascara(k)
                self._formato(k)
                p = self._penalizacion()
                if mejor is None or p < mejor:
                    mejor, mascara = p, k
                self._aplicar_mascara(k)   # deshace (XOR)
        self.mascara = mascara
        self._aplicar_mascara(mascara)
        self._formato(mascara)

    # --- Reed-Solomon y entrelazado ---
    def _con_ecc(self, datos):
        ver, ecc = self.ver, self.ecc
        nb, le = NUM_BLOQUES[ecc][ver], ECC_POR_BLOQUE[ecc][ver]
        brutas = modulos_datos_brutos(ver) // 8
        cortos = nb - brutas % nb
        largo_corto = brutas // nb
        div = rs_divisor(le)
        bloques, k = [], 0
        for i in range(nb):
            n = largo_corto - le + (0 if i < cortos else 1)
            dat = datos[k:k + n]
            k += n
            blq = dat + rs_resto(dat, div)
            if i < cortos:
                blq.insert(len(dat), 0)
            bloques.append(blq)
        res = []
        for i in range(len(bloques[0])):
            for j, blq in enumerate(bloques):
                if i != largo_corto - le or j >= cortos:
                    res.append(blq[i])
        return res

    # --- Patrones fijos ---
    def _fijar(self, x, y, oscuro):
        self.m[y][x] = oscuro
        self.fija[y][x] = True

    def _patrones(self):
        t = self.tam
        for i in range(t):
            self._fijar(6, i, i % 2 == 0)
            self._fijar(i, 6, i % 2 == 0)
        for cx, cy in ((3, 3), (t - 4, 3), (3, t - 4)):
            for dy in range(-4, 5):
                for dx in range(-4, 5):
                    x, y = cx + dx, cy + dy
                    if 0 <= x < t and 0 <= y < t:
                        d = max(abs(dx), abs(dy))
                        self._fijar(x, y, d not in (2, 4))
        al = posiciones_alineacion(self.ver)
        n = len(al)
        for i in range(n):
            for j in range(n):
                if (i == 0 and j == 0) or (i == 0 and j == n - 1) or (i == n - 1 and j == 0):
                    continue
                for dy in range(-2, 3):
                    for dx in range(-2, 3):
                        self._fijar(al[i] + dx, al[j] + dy, max(abs(dx), abs(dy)) != 1)
        self._formato(0)
        if self.ver >= 7:
            r = self.ver
            for _ in range(12):
                r = (r << 1) ^ ((r >> 11) * 0x1F25)
            bits = self.ver << 12 | r
            for i in range(18):
                b = (bits >> i) & 1 == 1
                a, c = t - 11 + i % 3, i // 3
                self._fijar(a, c, b)
                self._fijar(c, a, b)

    def _formato(self, mascara):
        datos = BITS_FORMATO_ECC[self.ecc] << 3 | mascara
        r = datos
        for _ in range(10):
            r = (r << 1) ^ ((r >> 9) * 0x537)
        bits = (datos << 10 | r) ^ 0x5412
        b = lambda i: (bits >> i) & 1 == 1
        t = self.tam
        for i in range(6):
            self._fijar(8, i, b(i))
        self._fijar(8, 7, b(6))
        self._fijar(8, 8, b(7))
        self._fijar(7, 8, b(8))
        for i in range(9, 15):
            self._fijar(14 - i, 8, b(i))
        for i in range(8):
            self._fijar(t - 1 - i, 8, b(i))
        for i in range(8, 15):
            self._fijar(8, t - 15 + i, b(i))
        self._fijar(8, t - 8, True)

    # --- Datos en zigzag ---
    def _colocar(self, palabras):
        t, i, total = self.tam, 0, len(palabras) * 8
        derecha = t - 1
        while derecha >= 1:
            if derecha == 6:
                derecha = 5
            for vert in range(t):
                for j in range(2):
                    x = derecha - j
                    subiendo = ((derecha + 1) & 2) == 0
                    y = t - 1 - vert if subiendo else vert
                    if not self.fija[y][x] and i < total:
                        self.m[y][x] = (palabras[i >> 3] >> (7 - (i & 7))) & 1 == 1
                        i += 1
            derecha -= 2

    def _aplicar_mascara(self, k):
        f = [
            lambda x, y: (x + y) % 2 == 0,
            lambda x, y: y % 2 == 0,
            lambda x, y: x % 3 == 0,
            lambda x, y: (x + y) % 3 == 0,
            lambda x, y: (x // 3 + y // 2) % 2 == 0,
            lambda x, y: x * y % 2 + x * y % 3 == 0,
            lambda x, y: (x * y % 2 + x * y % 3) % 2 == 0,
            lambda x, y: ((x + y) % 2 + x * y % 3) % 2 == 0,
        ][k]
        for y in range(self.tam):
            for x in range(self.tam):
                if not self.fija[y][x] and f(x, y):
                    self.m[y][x] = not self.m[y][x]

    # --- Penalización estándar (N1=3, N2=3, N3=40, N4=10) ---
    def _penalizacion(self):
        t, m, res = self.tam, self.m, 0

        def anadir(hist, largo):
            if hist[0] == 0:
                largo += t
            hist.insert(0, largo)
            hist.pop()

        def contar(hist):
            n = hist[1]
            nucleo = n > 0 and hist[2] == n and hist[3] == n * 3 and hist[4] == n and hist[5] == n
            return (1 if nucleo and hist[0] >= n * 4 and hist[6] >= n else 0) + (1 if nucleo and hist[6] >= n * 4 and hist[0] >= n else 0)

        def terminar(color, largo, hist):
            if color:
                anadir(hist, largo)
                largo = 0
            largo += t
            anadir(hist, largo)
            return contar(hist)

        for eje in range(2):
            for a in range(t):
                color, largo, hist = False, 0, [0] * 7
                for b in range(t):
                    v = m[a][b] if eje == 0 else m[b][a]
                    if v == color:
                        largo += 1
                        if largo == 5:
                            res += 3
                        elif largo > 5:
                            res += 1
                    else:
                        anadir(hist, largo)
                        if not color:
                            res += contar(hist) * 40
                        color, largo = v, 1
                res += terminar(color, largo, hist) * 40
        for y in range(t - 1):
            for x in range(t - 1):
                c = m[y][x]
                if c == m[y][x + 1] == m[y + 1][x] == m[y + 1][x + 1]:
                    res += 3
        oscuros = sum(sum(1 for v in fila if v) for fila in m)
        total = t * t
        k = (abs(oscuros * 20 - total * 10) + total - 1) // total - 1
        res += k * 10
        return res

    def trazo(self, margen=2):
        """Módulos oscuros como tramos horizontales de 1 de grosor (path SVG compacto)."""
        trazos = []
        for y, fila in enumerate(self.m):
            x = 0
            while x < self.tam:
                if fila[x]:
                    ini = x
                    while x < self.tam and fila[x]:
                        x += 1
                    trazos.append(f'M{ini + margen} {y + margen}.5h{x - ini}')
                else:
                    x += 1
        return ''.join(trazos)

    def svg(self, margen=2, etiqueta=None):
        n = self.tam + 2 * margen
        titulo = f'<title>{etiqueta}</title>' if etiqueta else ''
        return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {n} {n}" shape-rendering="crispEdges">{titulo}'
                f'<path fill="#fff" d="M0 0h{n}v{n}H0z"/><path stroke="#000" d="{self.trazo(margen)}"/></svg>')

    def svg_html(self, texto, ident, etiqueta, clase='w-full h-full', margen=2):
        """<svg> para incrustar en index.html (data-qr-url guarda lo que codifica, para los tests)."""
        n = self.tam + 2 * margen
        return (f'<svg id="{ident}" class="{clase}" viewBox="0 0 {n} {n}" role="img" aria-label="{etiqueta}" '
                f'data-qr-url="{texto}" shape-rendering="crispEdges"><path fill="#fff" d="M0 0h{n}v{n}H0z"/>'
                f'<path stroke="#000" d="{self.trazo(margen)}"/></svg>')

    def matriz(self):
        return [''.join('1' if v else '0' for v in fila) for fila in self.m]


def main():
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')   # el <svg> lleva tildes (aria-label) y va a index.html en UTF-8
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('texto')
    ap.add_argument('--ecc', default='L', choices='LMQH', help='corrección de errores (L, como api.qrserver.com)')
    ap.add_argument('--mascara', type=int, choices=range(8))
    ap.add_argument('--margen', type=int, default=2)
    ap.add_argument('--salida')
    ap.add_argument('--matriz', action='store_true')
    ap.add_argument('--html', metavar='ID', help='imprime un <svg id="ID"> listo para index.html')
    ap.add_argument('--etiqueta', default='Código QR', help='texto accesible (aria-label) del <svg>')
    a = ap.parse_args()
    qr = QR(a.texto, a.ecc, a.mascara)
    if a.html:
        sys.stdout.write(qr.svg_html(a.texto, a.html, a.etiqueta, margen=a.margen) + '\n')
        return
    if a.matriz:
        print(f'version {qr.ver} ecc {qr.ecc} mascara {qr.mascara} tam {qr.tam}')
        print('\n'.join(qr.matriz()))
        return
    svg = qr.svg(a.margen, a.texto)
    if a.salida:
        with open(a.salida, 'w', encoding='utf-8') as f:
            f.write(svg)
        print(f'{a.salida}: version {qr.ver}, ecc {qr.ecc}, mascara {qr.mascara}, {qr.tam}x{qr.tam} modulos, {len(svg)} bytes')
    else:
        sys.stdout.write(svg)


if __name__ == '__main__':
    main()
