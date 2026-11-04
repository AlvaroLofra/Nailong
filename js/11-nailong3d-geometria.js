        /* ==============================================================
           15. NAILONG 3D · NÚCLEO GEOMÉTRICO (SDF + SURFACE NETS)
           Sin dependencias (ni Three.js ni DOM): se ejecuta en un Web Worker,
           en el hilo principal o en Node (verify_all.py lo prueba allí).
           Idea: Nailong se describe como una «niebla» de formas (elipsoides y
           conos redondeados) que se funden con unión suave; después se extrae
           la superficie con Surface Nets en una sola malla estanca, sin costuras.
           Ejes: y arriba, z hacia delante (cara), x hacia su izquierda. Altura 1.
        ============================================================== */
        function crearKernelGeometriaNailong() {
            'use strict';

            // Proporciones canónicas medidas sobre los stickers (altura total = 1):
            // frente sticker_86 / 43 / 18 · espalda 84 / 52 / 31 · perfil 20 / 75 · cara 47 / 50.
            const ANATOMIA = {
                craneo:   { c: [0, 0.764, -0.018], r: [0.229, 0.242, 0.214] },   // cúpula alta (86)
                mofletes: { c: [0, 0.640, 0.000],  r: [0.252, 0.146, 0.222] },   // papada ancha que asoma sobre el pecho (86, 47)
                hocico:   { c: [0, 0.648, 0.100],  r: [0.180, 0.112, 0.162] },   // hocico redondo hacia delante (20, 75)
                frente:   { c: [0, 0.826, 0.030],  r: [0.190, 0.128, 0.170] },   // frente lisa entre los ojos (47)
                pecho:    { c: [0, 0.452, -0.012], r: [0.250, 0.124, 0.210] },   // hombros (86)
                caderas:  { c: [0, 0.292, -0.016], r: [0.274, 0.254, 0.250] },   // pera: lo más ancho a la altura de la tripa
                barriga:  { c: [0, 0.262, 0.048],  r: [0.242, 0.214, 0.224] },   // pancita que sobresale (20, 86)
                // Pose de reposo en «A» (brazos separados) para que las manos no se fundan con la tripa;
                // la pose visible los baja con el esqueleto.
                brazo:    { a: [0.232, 0.468, 0.010], b: [0.392, 0.358, 0.050], ra: 0.092, rb: 0.074 },
                mano:     { c: [0.404, 0.348, 0.054], r: [0.070, 0.074, 0.072] },
                pierna:   { a: [0.166, 0.170, 0.000], b: [0.172, 0.064, 0.022], ra: 0.104, rb: 0.090 },
                pie:      { c: [0.172, 0.050, 0.046], r: [0.096, 0.052, 0.114] },
                cola:     { a: [0, 0.205, -0.190], b: [0, 0.042, -0.448], ra: 0.112, rb: 0.014 },   // cono con punta (52)
                ojo:      { x: 0.124, y: 0.802, r: 0.054, hundido: 0.50 },       // separados y saltones (86, 50)
                k: {        // radios de fusión (cuanto mayor, más «derretido»)
                    cabeza: 0.075, frente: 0.09, hocico: 0.085, torso: 0.11, barriga: 0.09,
                    cuello: 0.042, brazo: 0.055, mano: 0.04, pierna: 0.05, pie: 0.05, cola: 0.065,
                    cuenca: 0.03, planta: 0.022
                },
                pancita: { cy: 0.258, rx: 0.180, ry: 0.196, borde: 0.16 }   // óvalo crema del frente (86, 43)
            };

            // Colores en sRGB (se convierten a lineal para WebGL/glTF)
            const COLORES = {
                amarillo: '#F2B42A', crema: '#FFEDC0', oliva: '#8A8F4A', garra: '#7A4C2A',
                rosa: '#F3A0A8', iris: '#3E9F47', irisAro: '#1C5426', irisClaro: '#9AD66A',
                pupila: '#0B0F0B', esclera: '#FFFFFF', boca: '#4B1714', lengua: '#E8707E', dientes: '#FFFDF7'
            };

            // Esqueleto (posición de reposo, padre). Los índices son los de la piel.
            const HUESOS = [
                { nombre: 'raiz',     p: [0, 0, 0],                 padre: -1 },
                { nombre: 'cadera',   p: [0, 0.160, -0.016],        padre: 0 },
                { nombre: 'tronco',   p: [0, 0.320, -0.016],        padre: 1 },
                { nombre: 'pecho',    p: [0, 0.465, -0.012],        padre: 2 },
                { nombre: 'cabeza',   p: [0, 0.560, -0.006],        padre: 3 },
                { nombre: 'barriga',  p: [0, 0.270, -0.070],        padre: 2 },
                { nombre: 'brazoIzq', p: ANATOMIA.brazo.a.slice(),  padre: 3 },
                { nombre: 'brazoDer', p: [-ANATOMIA.brazo.a[0], ANATOMIA.brazo.a[1], ANATOMIA.brazo.a[2]], padre: 3 },
                { nombre: 'piernaIzq', p: ANATOMIA.pierna.a.slice(), padre: 1 },
                { nombre: 'piernaDer', p: [-ANATOMIA.pierna.a[0], ANATOMIA.pierna.a[1], ANATOMIA.pierna.a[2]], padre: 1 },
                { nombre: 'cola',     p: ANATOMIA.cola.a.slice(),   padre: 1 },
                { nombre: 'colaPunta', p: [0, (ANATOMIA.cola.a[1] + ANATOMIA.cola.b[1]) / 2, (ANATOMIA.cola.a[2] + ANATOMIA.cola.b[2]) / 2], padre: 10 }
            ];
            const H = {};
            HUESOS.forEach((h, i) => { H[h.nombre] = i; });

            /* ---------- Primitivas con constantes precalculadas ---------- */
            function elipsoide(def, espejo) {
                const cx = espejo ? -def.c[0] : def.c[0];
                return { cx, cy: def.c[1], cz: def.c[2], rx: def.r[0], ry: def.r[1], rz: def.r[2],
                    ix: 1 / def.r[0], iy: 1 / def.r[1], iz: 1 / def.r[2], rmin: Math.min(def.r[0], def.r[1], def.r[2]) };
            }
            function conoRedondo(def, espejo) {
                const s = espejo ? -1 : 1;
                const ax = def.a[0] * s, ay = def.a[1], az = def.a[2];
                const bx = def.b[0] * s, by = def.b[1], bz = def.b[2];
                const bax = bx - ax, bay = by - ay, baz = bz - az;
                const l2 = bax * bax + bay * bay + baz * baz;
                const rr = def.ra - def.rb;
                return { ax, ay, az, bax, bay, baz, l2, rr, a2: l2 - rr * rr, il2: 1 / l2, r1: def.ra, r2: def.rb };
            }
            function dElip(x, y, z, e) {
                const px = (x - e.cx) * e.ix, py = (y - e.cy) * e.iy, pz = (z - e.cz) * e.iz;
                const k0 = Math.sqrt(px * px + py * py + pz * pz);
                const qx = px * e.ix, qy = py * e.iy, qz = pz * e.iz;
                const k1 = Math.sqrt(qx * qx + qy * qy + qz * qz);
                return k1 > 1e-9 ? k0 * (k0 - 1) / k1 : -e.rmin;
            }
            // Cono redondeado de Inigo Quilez (una sola raíz cuadrada)
            function dCono(x, y, z, c) {
                const pax = x - c.ax, pay = y - c.ay, paz = z - c.az;
                const yy = pax * c.bax + pay * c.bay + paz * c.baz;
                const zz = yy - c.l2;
                const wx = pax * c.l2 - c.bax * yy, wy = pay * c.l2 - c.bay * yy, wz = paz * c.l2 - c.baz * yy;
                const x2 = wx * wx + wy * wy + wz * wz;
                const y2 = yy * yy * c.l2, z2 = zz * zz * c.l2;
                const k = Math.sign(c.rr) * c.rr * c.rr * x2;
                if (Math.sign(zz) * c.a2 * z2 > k) return Math.sqrt(x2 + z2) * c.il2 - c.r2;
                if (Math.sign(yy) * c.a2 * y2 < k) return Math.sqrt(x2 + y2) * c.il2 - c.r1;
                return (Math.sqrt(x2 * c.a2 * c.il2) + yy * c.rr) * c.il2 - c.r1;
            }
            // Unión y diferencia suaves (polinómicas)
            function smin(a, b, k) {
                const h = Math.max(k - Math.abs(a - b), 0) / k;
                return Math.min(a, b) - h * h * k * 0.25;
            }
            function smax(a, b, k) {
                const h = Math.max(k - Math.abs(a - b), 0) / k;
                return Math.max(a, b) + h * h * k * 0.25;
            }

            const A = ANATOMIA, K = ANATOMIA.k;
            const P = {
                craneo: elipsoide(A.craneo), mofletes: elipsoide(A.mofletes), hocico: elipsoide(A.hocico), frente: elipsoide(A.frente),
                pecho: elipsoide(A.pecho), caderas: elipsoide(A.caderas), barriga: elipsoide(A.barriga),
                brazo: conoRedondo(A.brazo), mano: elipsoide(A.mano),
                pierna: conoRedondo(A.pierna), pie: elipsoide(A.pie),
                cola: conoRedondo(A.cola)
            };

            function dCabezaBase(x, y, z) {   // x ya en valor absoluto
                let d = dElip(x, y, z, P.craneo);
                d = smin(d, dElip(x, y, z, P.mofletes), K.cabeza);
                d = smin(d, dElip(x, y, z, P.frente), K.frente);
                return smin(d, dElip(x, y, z, P.hocico), K.hocico);
            }

            // Posición del globo ocular: se apoya en la superficie de la cara y se hunde una fracción del radio
            const OJO = (function () {
                let z = 0.6;
                for (let i = 0; i < 200; i++) {
                    const d = dCabezaBase(A.ojo.x, A.ojo.y, z);
                    if (d < 1e-5) break;
                    z -= Math.max(d, 1e-4);
                }
                return { x: A.ojo.x, y: A.ojo.y, z: z - A.ojo.r * A.ojo.hundido, r: A.ojo.r };
            })();
            const R_CUENCA = OJO.r + 0.0055;

            const dCabeza = dCabezaBase;
            function dTorso(x, y, z) {
                let d = dElip(x, y, z, P.caderas);
                d = smin(d, dElip(x, y, z, P.pecho), K.torso);
                return smin(d, dElip(x, y, z, P.barriga), K.barriga);
            }
            function dBrazo(x, y, z) { return smin(dCono(x, y, z, P.brazo), dElip(x, y, z, P.mano), K.mano); }
            function dPierna(x, y, z) { return smin(dCono(x, y, z, P.pierna), dElip(x, y, z, P.pie), K.pie); }

            // Esferas envolventes por parte: si una parte está más lejos que (distancia actual + radio de fusión),
            // no cambia el resultado y no se evalúa (mismo campo, la mitad de cálculo).
            function esferaEnvolvente(elips, conos) {
                const s = [];
                elips.forEach(e => s.push([e.c[0], e.c[1], e.c[2], Math.max(e.r[0], e.r[1], e.r[2])]));
                conos.forEach(c => { s.push([c.a[0], c.a[1], c.a[2], c.ra]); s.push([c.b[0], c.b[1], c.b[2], c.rb]); });
                const mn = [0, 1, 2].map(i => Math.min(...s.map(q => q[i] - q[3])));
                const mx = [0, 1, 2].map(i => Math.max(...s.map(q => q[i] + q[3])));
                const c = [0, 1, 2].map(i => (mn[i] + mx[i]) / 2);
                const r = Math.max(...s.map(q => Math.hypot(q[0] - c[0], q[1] - c[1], q[2] - c[2]) + q[3]));
                return { x: c[0], y: c[1], z: c[2], r };
            }
            const ENV = {
                cabeza: esferaEnvolvente([A.craneo, A.mofletes, A.frente, A.hocico], []),
                torso: esferaEnvolvente([A.caderas, A.pecho, A.barriga], []),
                brazo: esferaEnvolvente([A.mano], [A.brazo]),
                pierna: esferaEnvolvente([A.pie], [A.pierna]),
                cola: esferaEnvolvente([], [A.cola])
            };
            function cota(e, x, y, z) {
                const dx = x - e.x, dy = y - e.y, dz = z - e.z;
                return Math.sqrt(dx * dx + dy * dy + dz * dz) - e.r;
            }

            // Campo de distancia completo del cuerpo (simétrico en x)
            function sdf(x, y, z) {
                const ax = x < 0 ? -x : x;
                const cT = cota(ENV.torso, ax, y, z), cC = cota(ENV.cabeza, ax, y, z);
                let d;
                if (cT < cC) { d = dTorso(ax, y, z); if (cC < d + K.cuello) d = smin(d, dCabeza(ax, y, z), K.cuello); }
                else { d = dCabeza(ax, y, z); if (cT < d + K.cuello) d = smin(dTorso(ax, y, z), d, K.cuello); }
                if (cota(ENV.brazo, ax, y, z) < d + K.brazo) d = smin(d, dBrazo(ax, y, z), K.brazo);
                if (cota(ENV.pierna, ax, y, z) < d + K.pierna) d = smin(d, dPierna(ax, y, z), K.pierna);
                if (cota(ENV.cola, ax, y, z) < d + K.cola) d = smin(d, dCono(ax, y, z, P.cola), K.cola);
                const ex = ax - OJO.x, ey = y - OJO.y, ez = z - OJO.z;
                const s = R_CUENCA - Math.sqrt(ex * ex + ey * ey + ez * ez);
                if (s > d - K.cuenca) d = smax(d, s, K.cuenca);
                return y < K.planta - d ? smax(d, -y, K.planta) : d;
            }

            // Distancias por grupo (para los pesos de la piel). Orden: cabeza, torso, brazoI, brazoD, piernaI, piernaD, cola
            function sdfGrupos(x, y, z, out) {
                const ax = x < 0 ? -x : x;
                out[0] = dCabeza(ax, y, z);
                out[1] = dTorso(ax, y, z);
                const bI = dBrazo(x, y, z), bD = dBrazo(-x, y, z);
                out[2] = bI; out[3] = bD;
                out[4] = dPierna(x, y, z); out[5] = dPierna(-x, y, z);
                out[6] = dCono(ax, y, z, P.cola);
                return out;
            }

            // Gradiente por tetraedro (4 evaluaciones)
            function gradiente(x, y, z, e, out) {
                const a = sdf(x + e, y - e, z - e), b = sdf(x - e, y - e, z + e);
                const c = sdf(x - e, y + e, z - e), d = sdf(x + e, y + e, z + e);
                out[0] = a - b - c + d; out[1] = -a - b + c + d; out[2] = -a + b - c + d;
                const l = Math.hypot(out[0], out[1], out[2]) || 1;
                out[0] /= l; out[1] /= l; out[2] /= l;
                return out;
            }

            // Proyecta un punto sobre la superficie y devuelve punto + normal
            function anclarEnSuperficie(x, y, z) {
                const g = [0, 0, 0];
                for (let i = 0; i < 12; i++) {
                    const d = sdf(x, y, z);
                    gradiente(x, y, z, 0.0015, g);
                    x -= d * g[0]; y -= d * g[1]; z -= d * g[2];
                    if (Math.abs(d) < 2e-6) break;
                }
                gradiente(x, y, z, 0.0015, g);
                return { p: [x, y, z], n: [g[0], g[1], g[2]] };
            }

            // Lanza un rayo desde fuera (sphere tracing). Devuelve el punto de impacto o null.
            function trazarRayo(ox, oy, oz, dx, dy, dz, tMax) {
                const l = Math.hypot(dx, dy, dz); dx /= l; dy /= l; dz /= l;
                let t = 0;
                for (let i = 0; i < 256 && t < (tMax || 3); i++) {
                    const d = sdf(ox + dx * t, oy + dy * t, oz + dz * t);
                    if (d < 1e-5) return anclarEnSuperficie(ox + dx * t, oy + dy * t, oz + dz * t);
                    t += Math.max(d * 0.9, 1e-4);
                }
                return null;
            }

            function srgbALineal(hex) {
                const n = parseInt(hex.slice(1), 16);
                return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => {
                    v /= 255;
                    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
                });
            }
            function suavizar(e0, e1, x) {
                const t = Math.min(Math.max((x - e0) / (e1 - e0), 0), 1);
                return t * t * (3 - 2 * t);
            }

            function limites(margen) {
                const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
                const añadir = (x, y, z, r) => {
                    [x, -x].forEach(xx => {
                        const v = [xx, y, z];
                        for (let i = 0; i < 3; i++) { mn[i] = Math.min(mn[i], v[i] - r); mx[i] = Math.max(mx[i], v[i] + r); }
                    });
                };
                [A.craneo, A.mofletes, A.hocico, A.frente, A.pecho, A.caderas, A.barriga, A.mano, A.pie].forEach(e =>
                    añadir(e.c[0], e.c[1], e.c[2], Math.max(e.r[0], e.r[1], e.r[2])));
                [A.brazo, A.pierna, A.cola].forEach(c => { añadir(c.a[0], c.a[1], c.a[2], c.ra); añadir(c.b[0], c.b[1], c.b[2], c.rb); });
                mn[1] = Math.max(mn[1], 0);
                for (let i = 0; i < 3; i++) { mn[i] -= margen; mx[i] += margen; }
                return { mn, mx };
            }

            /* ---------- Surface Nets en banda estrecha ---------- */
            const ESQUINAS = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
            const ARISTAS = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];

            function generarMalla(opciones) {
                const t0 = Date.now();
                const h = (opciones && opciones.celda) || 0.0075;
                const conColor = !(opciones && opciones.sinColor);
                const F = 4;                         // celdas finas por celda gruesa
                const HG = h * F;
                const lim = limites(2.5 * HG);
                const ncx = Math.ceil((lim.mx[0] - lim.mn[0]) / HG), ncy = Math.ceil((lim.mx[1] - lim.mn[1]) / HG), ncz = Math.ceil((lim.mx[2] - lim.mn[2]) / HG);
                const ox = lim.mn[0], oy = lim.mn[1], oz = lim.mn[2];
                const gx = ncx + 1, gy = ncy + 1, gz = ncz + 1;
                const gruesa = new Float32Array(gx * gy * gz);
                for (let k = 0; k < gz; k++) for (let j = 0; j < gy; j++) for (let i = 0; i < gx; i++)
                    gruesa[i + gx * (j + gy * k)] = sdf(ox + i * HG, oy + j * HG, oz + k * HG);

                const nx = ncx * F + 1, ny = ncy * F + 1, nz = ncz * F + 1;
                const fina = new Float32Array(nx * ny * nz).fill(NaN);
                const banda = 2.2 * HG;
                const cercana = new Uint8Array(ncx * ncy * ncz);
                let evaluados = 0;
                for (let ck = 0; ck < ncz; ck++) for (let cj = 0; cj < ncy; cj++) for (let ci = 0; ci < ncx; ci++) {
                    let minAbs = Infinity;
                    for (let c = 0; c < 8; c++) {
                        const v = gruesa[(ci + ESQUINAS[c][0]) + gx * ((cj + ESQUINAS[c][1]) + gy * (ck + ESQUINAS[c][2]))];
                        minAbs = Math.min(minAbs, Math.abs(v));
                    }
                    if (minAbs > banda) continue;
                    cercana[ci + ncx * (cj + ncy * ck)] = 1;
                    for (let k = ck * F; k <= ck * F + F; k++) for (let j = cj * F; j <= cj * F + F; j++) for (let i = ci * F; i <= ci * F + F; i++) {
                        const idx = i + nx * (j + ny * k);
                        if (fina[idx] === fina[idx]) continue;   // ya evaluado (no es NaN)
                        fina[idx] = sdf(ox + i * h, oy + j * h, oz + k * h);
                        evaluados++;
                    }
                }

                // 1) Un vértice por celda que corta la superficie (media de los cruces en sus aristas)
                const celdaVert = new Int32Array((nx - 1) * (ny - 1) * (nz - 1)).fill(-1);
                const pos = [], celdas = [];
                const val = new Float64Array(8);
                for (let ck = 0; ck < ncz; ck++) for (let cj = 0; cj < ncy; cj++) for (let ci = 0; ci < ncx; ci++) {
                    if (!cercana[ci + ncx * (cj + ncy * ck)]) continue;
                    for (let k = ck * F; k < ck * F + F; k++) for (let j = cj * F; j < cj * F + F; j++) for (let i = ci * F; i < ci * F + F; i++) {
                        let mascara = 0;
                        for (let c = 0; c < 8; c++) {
                            const v = fina[(i + ESQUINAS[c][0]) + nx * ((j + ESQUINAS[c][1]) + ny * (k + ESQUINAS[c][2]))];
                            val[c] = v;
                            if (v < 0) mascara |= (1 << c);
                        }
                        if (mascara === 0 || mascara === 255) continue;
                        let sx = 0, sy = 0, sz = 0, n = 0;
                        for (let e = 0; e < 12; e++) {
                            const a = ARISTAS[e][0], b = ARISTAS[e][1];
                            if (((mascara >> a) & 1) === ((mascara >> b) & 1)) continue;
                            const t = val[a] / (val[a] - val[b]);
                            sx += ESQUINAS[a][0] + t * (ESQUINAS[b][0] - ESQUINAS[a][0]);
                            sy += ESQUINAS[a][1] + t * (ESQUINAS[b][1] - ESQUINAS[a][1]);
                            sz += ESQUINAS[a][2] + t * (ESQUINAS[b][2] - ESQUINAS[a][2]);
                            n++;
                        }
                        celdaVert[i + (nx - 1) * (j + (ny - 1) * k)] = pos.length / 3;
                        pos.push(ox + (i + sx / n) * h, oy + (j + sy / n) * h, oz + (k + sz / n) * h);
                        celdas.push(i, j, k);
                    }
                }

                // 2) Un cuadrilátero por cada arista de la rejilla que cruza la superficie
                const cnx = nx - 1, cny = ny - 1;
                const cv = (i, j, k) => celdaVert[i + cnx * (j + cny * k)];
                const ind = [];
                let huecos = 0;
                const quad = (a, b, c, d, dentro) => {
                    if (a < 0 || b < 0 || c < 0 || d < 0) { huecos++; return; }
                    if (!dentro) { const t = b; b = d; d = t; }
                    const d1 = dist2(a, c), d2 = dist2(b, d);
                    if (d1 <= d2) ind.push(a, b, c, a, c, d);
                    else ind.push(a, b, d, b, c, d);
                };
                const dist2 = (a, b) => {
                    const dx = pos[a * 3] - pos[b * 3], dy = pos[a * 3 + 1] - pos[b * 3 + 1], dz = pos[a * 3 + 2] - pos[b * 3 + 2];
                    return dx * dx + dy * dy + dz * dz;
                };
                for (let v = 0; v < celdas.length / 3; v++) {
                    const i = celdas[v * 3], j = celdas[v * 3 + 1], k = celdas[v * 3 + 2];
                    const v0 = fina[i + nx * (j + ny * k)];
                    const dentro = v0 < 0;
                    if (j > 0 && k > 0 && (fina[(i + 1) + nx * (j + ny * k)] < 0) !== dentro)
                        quad(v, cv(i, j - 1, k), cv(i, j - 1, k - 1), cv(i, j, k - 1), dentro);
                    if (k > 0 && i > 0 && (fina[i + nx * ((j + 1) + ny * k)] < 0) !== dentro)
                        quad(v, cv(i, j, k - 1), cv(i - 1, j, k - 1), cv(i - 1, j, k), dentro);
                    if (i > 0 && j > 0 && (fina[i + nx * (j + ny * (k + 1))] < 0) !== dentro)
                        quad(v, cv(i - 1, j, k), cv(i - 1, j - 1, k), cv(i, j - 1, k), dentro);
                }

                // 3) Proyección exacta sobre la superficie y normales desde el gradiente
                const nv = pos.length / 3;
                const posiciones = new Float32Array(nv * 3), normales = new Float32Array(nv * 3);
                const g = [0, 0, 0], eg = h * 0.35;
                for (let v = 0; v < nv; v++) {
                    let x = pos[v * 3], y = pos[v * 3 + 1], z = pos[v * 3 + 2];
                    const x0 = x, y0 = y, z0 = z;
                    const d = sdf(x, y, z);
                    gradiente(x, y, z, eg, g);
                    x -= d * g[0]; y -= d * g[1]; z -= d * g[2];
                    const mx = x - x0, my = y - y0, mz = z - z0, m = Math.hypot(mx, my, mz), tope = 0.6 * h;
                    if (m > tope) { x = x0 + mx * tope / m; y = y0 + my * tope / m; z = z0 + mz * tope / m; }
                    gradiente(x, y, z, eg, g);
                    posiciones[v * 3] = x; posiciones[v * 3 + 1] = y; posiciones[v * 3 + 2] = z;
                    normales[v * 3] = g[0]; normales[v * 3 + 1] = g[1]; normales[v * 3 + 2] = g[2];
                }

                // 4) Pesos de piel (4 huesos por vértice) y color por vértice
                const huesoIndices = new Uint16Array(nv * 4), huesoPesos = new Float32Array(nv * 4);
                const colores = conColor ? new Float32Array(nv * 3) : null;
                const cAmarillo = srgbALineal(COLORES.amarillo), cCrema = srgbALineal(COLORES.crema);
                const dg = new Float64Array(7), w = new Float64Array(HUESOS.length);
                const tau = 0.022;
                const cola = P.cola;
                const pz = A.pancita;
                for (let v = 0; v < nv; v++) {
                    const x = posiciones[v * 3], y = posiciones[v * 3 + 1], z = posiciones[v * 3 + 2];
                    sdfGrupos(x, y, z, dg);
                    let dmin = Infinity;
                    for (let q = 0; q < 7; q++) dmin = Math.min(dmin, dg[q]);
                    const s = [];
                    let st = 0;
                    for (let q = 0; q < 7; q++) { s[q] = Math.exp(-Math.max(0, dg[q] - dmin) / tau); st += s[q]; }
                    for (let q = 0; q < 7; q++) s[q] /= st;
                    w.fill(0);
                    w[H.cabeza] = s[0];
                    // Torso: cadera → tronco → pecho según la altura; la pancita con su propio hueso
                    const bC = HUESOS[H.cadera].p[1], bT = HUESOS[H.tronco].p[1], bP = HUESOS[H.pecho].p[1];
                    let wc = 0, wt = 0, wp = 0;
                    if (y <= bC) wc = 1;
                    else if (y <= bT) { wt = (y - bC) / (bT - bC); wc = 1 - wt; }
                    else if (y <= bP) { wp = (y - bT) / (bP - bT); wt = 1 - wp; }
                    else wp = 1;
                    const eb = Math.pow(x / 0.245, 2) + Math.pow((y - 0.262) / 0.215, 2) + Math.pow((z - 0.13) / 0.2, 2);
                    const mb = suavizar(1.0, 0.3, eb) * (z > 0 ? 1 : 0) * 0.85;
                    w[H.barriga] = s[1] * mb;
                    w[H.cadera] = s[1] * (1 - mb) * wc; w[H.tronco] = s[1] * (1 - mb) * wt; w[H.pecho] = s[1] * (1 - mb) * wp;
                    w[H.brazoIzq] = s[2]; w[H.brazoDer] = s[3]; w[H.piernaIzq] = s[4]; w[H.piernaDer] = s[5];
                    const tc = Math.min(Math.max(((x - cola.ax * (x < 0 ? -1 : 1)) * cola.bax + (y - cola.ay) * cola.bay + (z - cola.az) * cola.baz) * cola.il2, 0), 1);
                    const t2 = suavizar(0.3, 0.7, tc);
                    w[H.cola] = s[6] * (1 - t2); w[H.colaPunta] = s[6] * t2;
                    // Los 4 mayores, normalizados
                    const orden = [];
                    for (let b = 0; b < w.length; b++) if (w[b] > 1e-4) orden.push(b);
                    orden.sort((a, b) => w[b] - w[a]);
                    let suma = 0;
                    for (let q = 0; q < 4 && q < orden.length; q++) suma += w[orden[q]];
                    for (let q = 0; q < 4; q++) {
                        if (q < orden.length) { huesoIndices[v * 4 + q] = orden[q]; huesoPesos[v * 4 + q] = w[orden[q]] / suma; }
                    }
                    if (colores) {
                        const nz = normales[v * 3 + 2];
                        const e2 = Math.sqrt(Math.pow(x / pz.rx, 2) + Math.pow((y - pz.cy) / pz.ry, 2));
                        const m = suavizar(1 + pz.borde * 0.5, 1 - pz.borde * 0.5, e2) * suavizar(0.05, 0.3, nz) * suavizar(0.45, 0.75, s[1]) * (z > 0 ? 1 : 0);
                        for (let c = 0; c < 3; c++) colores[v * 3 + c] = cAmarillo[c] + (cCrema[c] - cAmarillo[c]) * m;
                    }
                }

                const indices = new Uint32Array(ind);
                return {
                    posiciones, normales, colores, indices, huesoIndices, huesoPesos,
                    estadisticas: { vertices: nv, triangulos: indices.length / 3, celda: h, evaluaciones: evaluados + gx * gy * gz, huecos, ms: Date.now() - t0 }
                };
            }

            return {
                VERSION: 1, ANATOMIA, COLORES, HUESOS, H, OJO,
                sdf, anclarEnSuperficie, trazarRayo, generarMalla, srgbALineal
            };
        }

        const Nailong3DGeometria = crearKernelGeometriaNailong();
