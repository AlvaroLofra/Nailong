#!/usr/bin/env node
'use strict';

/**
 * Mide las proporciones del Nailong 3D procedural (solo lectura, 0 dependencias).
 * Carga js/11-nailong3d-geometria.js en memoria, expone dTorso/dCabeza/dBrazo/dPierna/dCola
 * y calcula B1-B5, C1-C2, P1-P2, T1-T3, H1-H6 y V1-V3 con H = 1 (Plan §3.2 y Anexo A).
 *
 * Uso:
 *   node herramientas/medir_nailong3d.js [js/11-nailong3d-geometria.js] [--json] [--tabla] [--salida archivo.json]
 */

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
    const opts = {
        nucleo: null,
        tabla: false,
        json: false,
        salida: null
    };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--tabla') {
            opts.tabla = true;
        } else if (arg === '--json') {
            opts.json = true;
        } else if (arg === '--salida' && i + 1 < argv.length) {
            opts.salida = argv[++i];
        } else if (arg === '--nucleo' && i + 1 < argv.length) {
            opts.nucleo = argv[++i];
        } else if (arg === '-h' || arg === '--help') {
            console.log('Uso: node herramientas/medir_nailong3d.js [ruta_js11] [--json] [--tabla] [--salida archivo.json]');
            process.exit(0);
        } else if (!arg.startsWith('-') && !opts.nucleo) {
            opts.nucleo = arg;
        }
    }
    if (!opts.tabla && !opts.json) opts.json = true;
    if (!opts.nucleo) {
        const local = path.resolve(process.cwd(), 'js/11-nailong3d-geometria.js');
        const desdeHerr = path.resolve(__dirname, '..', 'js/11-nailong3d-geometria.js');
        opts.nucleo = fs.existsSync(local) ? local : desdeHerr;
    }
    return opts;
}

const r3 = (n) => (n === null || n === undefined || !Number.isFinite(n) ? null : Math.round(n * 1000) / 1000);
const r4 = (n) => (n === null || n === undefined || !Number.isFinite(n) ? null : Math.round(n * 10000) / 10000);

function cargarNucleo(ruta) {
    let src = fs.readFileSync(ruta, 'utf8');
    const reemplazado = src.replace(
        /return\s*\{\s*VERSION:\s*(\d+),/,
        'return { dTorso, dCabeza, dBrazo, dPierna, dCola, VERSION: $1,'
    );
    if (reemplazado === src) {
        throw new Error('No se pudo localizar "return { VERSION: ...," en ' + ruta);
    }
    const K = new Function(reemplazado + '\n;return Nailong3DGeometria;')();
    for (const fn of ['dTorso', 'dCabeza', 'dBrazo', 'dPierna', 'dCola', 'sdf', 'generarMalla']) {
        if (typeof K[fn] !== 'function') {
            throw new Error('No se pudo exponer ' + fn + ' desde el nucleo: revisa el return de js/11');
        }
    }
    return K;
}

/**
 * Encuentra [min, max] en el eje ('x' o 'z') donde fn(x, y, z) < 0 para una altura y dada.
 * Usa busqueda en dos pasos (grueso + refinamiento en banda ±0.024) con precision <= 0.002 H.
 */
function extremos(fn, y, eje, simX = true) {
    const pasoG = 0.016;
    const margen = 0.026;
    const limA = 0.72;
    const limB = 0.80;

    if (eje === 'x' && simX) {
        let aMaxG = -Infinity;
        let bMinG = Infinity, bMaxG = -Infinity;
        for (let a = 0; a <= limA; a += pasoG) {
            for (let b = -limB; b <= limB; b += pasoG) {
                if (fn(a, y, b) < margen) {
                    if (a > aMaxG) aMaxG = a;
                    if (b < bMinG) bMinG = b;
                    if (b > bMaxG) bMaxG = b;
                }
            }
        }
        if (aMaxG === -Infinity) return [Infinity, -Infinity];
        const aIni = Math.max(0, aMaxG - margen);
        const aFin = aMaxG + margen;
        const bIni = Math.max(-limB, bMinG - margen);
        const bFin = Math.min(limB, bMaxG + margen);
        let mx = -Infinity;
        for (let a = aFin; a >= aIni; a -= 0.002) {
            for (let b = bIni; b <= bFin; b += 0.004) {
                if (fn(a, y, b) < 0) {
                    mx = a;
                    break;
                }
            }
            if (mx > -Infinity) break;
        }
        if (mx === -Infinity) {
            for (let a = aIni; a >= 0; a -= 0.002) {
                for (let b = bIni; b <= bFin; b += 0.004) {
                    if (fn(a, y, b) < 0) {
                        mx = a;
                        break;
                    }
                }
                if (mx > -Infinity) break;
            }
        }
        return mx === -Infinity ? [Infinity, -Infinity] : [-mx, mx];
    }

    // Eje Z (o X sin simetria)
    const bStart = (eje === 'z' && simX) ? 0 : -limB;
    let aMinG = Infinity, aMaxG = -Infinity;
    let bMinG = Infinity, bMaxG = -Infinity;
    for (let a = -limA; a <= limA; a += pasoG) {
        for (let b = bStart; b <= limB; b += pasoG) {
            const d = eje === 'x' ? fn(a, y, b) : fn(b, y, a);
            if (d < margen) {
                if (a < aMinG) aMinG = a;
                if (a > aMaxG) aMaxG = a;
                if (b < bMinG) bMinG = b;
                if (b > bMaxG) bMaxG = b;
            }
        }
    }
    if (aMinG === Infinity) return [Infinity, -Infinity];

    const bIni = Math.max(bStart, bMinG - margen);
    const bFin = Math.min(limB, bMaxG + margen);

    let mn = Infinity;
    for (let a = aMinG - margen; a <= aMinG + margen; a += 0.002) {
        for (let b = bIni; b <= bFin; b += 0.004) {
            const d = eje === 'x' ? fn(a, y, b) : fn(b, y, a);
            if (d < 0) {
                mn = a;
                break;
            }
        }
        if (mn < Infinity) break;
    }

    let mx = -Infinity;
    for (let a = aMaxG + margen; a >= aMaxG - margen; a -= 0.002) {
        for (let b = bIni; b <= bFin; b += 0.004) {
            const d = eje === 'x' ? fn(a, y, b) : fn(b, y, a);
            if (d < 0) {
                mx = a;
                break;
            }
        }
        if (mx > -Infinity) break;
    }
    return [mn, mx];
}

/**
 * Caja envolvente 3D precisa (±0.002 H) de una SDF simetrica en X (evaluada en x >= 0).
 */
function caja3DSimetrica(fn, lim) {
    const pasoG = 0.018;
    const margen = 0.028;
    let xMaxG = -Infinity, yMinG = Infinity, yMaxG = -Infinity, zMinG = Infinity, zMaxG = -Infinity;

    for (let x = 0; x <= lim.xMax; x += pasoG) {
        for (let y = lim.yMin; y <= lim.yMax; y += pasoG) {
            for (let z = lim.zMin; z <= lim.zMax; z += pasoG) {
                if (fn(x, y, z) < margen) {
                    if (x > xMaxG) xMaxG = x;
                    if (y < yMinG) yMinG = y;
                    if (y > yMaxG) yMaxG = y;
                    if (z < zMinG) zMinG = z;
                    if (z > zMaxG) zMaxG = z;
                }
            }
        }
    }
    if (xMaxG === -Infinity) {
        return { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
    }

    const xLo = 0, xHi = Math.min(lim.xMax, xMaxG + margen);
    const yLo = Math.max(lim.yMin, yMinG - margen), yHi = Math.min(lim.yMax, yMaxG + margen);
    const zLo = Math.max(lim.zMin, zMinG - margen), zHi = Math.min(lim.zMax, zMaxG + margen);
    const pF = 0.002;
    const pT = 0.006;

    // Refinar xMax (de fuera hacia dentro)
    let xMax = 0;
    for (let x = xHi; x >= xLo; x -= pF) {
        let hit = false;
        for (let y = yLo; y <= yHi && !hit; y += pT) {
            for (let z = zLo; z <= zHi; z += pT) {
                if (fn(x, y, z) < 0) { hit = true; break; }
            }
        }
        if (hit) { xMax = x; break; }
    }

    // Refinar yMin
    let yMin = yHi;
    for (let y = yLo; y <= yHi; y += pF) {
        let hit = false;
        for (let x = xLo; x <= xHi && !hit; x += pT) {
            for (let z = zLo; z <= zHi; z += pT) {
                if (fn(x, y, z) < 0) { hit = true; break; }
            }
        }
        if (hit) { yMin = y; break; }
    }

    // Refinar yMax
    let yMax = yLo;
    for (let y = yHi; y >= yLo; y -= pF) {
        let hit = false;
        for (let x = xLo; x <= xHi && !hit; x += pT) {
            for (let z = zLo; z <= zHi; z += pT) {
                if (fn(x, y, z) < 0) { hit = true; break; }
            }
        }
        if (hit) { yMax = y; break; }
    }

    // Refinar zMin
    let zMin = zHi;
    for (let z = zLo; z <= zHi; z += pF) {
        let hit = false;
        for (let x = xLo; x <= xHi && !hit; x += pT) {
            for (let y = yLo; y <= yHi; y += pT) {
                if (fn(x, y, z) < 0) { hit = true; break; }
            }
        }
        if (hit) { zMin = z; break; }
    }

    // Refinar zMax
    let zMax = zLo;
    for (let z = zHi; z >= zLo; z -= pF) {
        let hit = false;
        for (let x = xLo; x <= xHi && !hit; x += pT) {
            for (let y = yLo; y <= yHi; y += pT) {
                if (fn(x, y, z) < 0) { hit = true; break; }
            }
        }
        if (hit) { zMax = z; break; }
    }

    return { min: [0, yMin, zMin], max: [xMax, yMax, zMax] };
}

/**
 * Extrae la polilinea del brazo (1 o 2 tramos) y sus radios, compatible con:
 *  - brazo = { a, b, ra, rb } (1 tramo actual)
 *  - brazo = { a, codo/m, b, ra, rc/rm, rb } (2 tramos en un solo bloque)
 *  - brazo + antebrazo = { a, b, ra, rb } (2 bloques)
 *  - brazo + ANATOMIA.codo = [x,y,z] o { c/p, r }
 */
function describirBrazo(A, K) {
    const br = A.brazo;
    const puntos = [br.a];
    const radios = [br.ra];
    let tieneCodoGeom = false;

    const codoEnBrazo = br.codo || br.m || null;
    if (Array.isArray(codoEnBrazo)) {
        puntos.push(codoEnBrazo);
        radios.push(br.rc ?? br.rm ?? (br.ra + br.rb) / 2);
        puntos.push(br.b);
        radios.push(br.rb);
        tieneCodoGeom = true;
    } else if (A.antebrazo && Array.isArray(A.antebrazo.a) && Array.isArray(A.antebrazo.b)) {
        puntos.push(br.b);
        radios.push(br.rb);
        puntos.push(A.antebrazo.b);
        radios.push(A.antebrazo.rb);
        tieneCodoGeom = true;
    } else if (A.codo) {
        const pc = Array.isArray(A.codo) ? A.codo : (A.codo.c || A.codo.p || br.b);
        const rc = (typeof A.codo === 'object' && !Array.isArray(A.codo) && A.codo.r) ? A.codo.r : (br.ra + br.rb) / 2;
        puntos.push(pc);
        radios.push(rc);
        puntos.push(br.b);
        radios.push(br.rb);
        tieneCodoGeom = true;
    } else {
        puntos.push(br.b);
        radios.push(br.rb);
    }

    const tieneHuesoCodo = Array.isArray(K.HUESOS) && K.HUESOS.some((h) => /codo/i.test(h.nombre));
    const tramos = puntos.length - 1;

    // Diametro medio ponderado por longitud de cada tramo
    let sumRL = 0, sumL = 0;
    for (let i = 0; i < tramos; i++) {
        const p0 = puntos[i], p1 = puntos[i + 1];
        const L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]);
        const rMed = (radios[i] + radios[i + 1]) / 2;
        sumRL += rMed * L;
        sumL += L;
    }
    const diametroMedio = sumL > 0 ? 2 * (sumRL / sumL) : (br.ra + br.rb);

    return {
        puntos,
        radios,
        tramos,
        tieneCodoGeom,
        tieneHuesoCodo,
        tieneCodo: tieneCodoGeom && tieneHuesoCodo,
        diametroMedio
    };
}

/**
 * Extrae tramos y radios de la cola (compatible con 2, 3 o mas tramos).
 */
function describirCola(A, K) {
    const c = A.cola;
    let puntos = [];
    let radios = [];
    if (Array.isArray(c.puntos) && c.puntos.length >= 2) {
        puntos = c.puntos.map((p) => (Array.isArray(p) ? p : p.p || p.c));
        radios = c.radios ? c.radios.slice() : c.puntos.map((p) => (Array.isArray(p) ? 0.06 : p.r));
    } else {
        puntos.push(c.a);
        radios.push(c.ra);
        if (Array.isArray(c.m1)) {
            puntos.push(c.m1);
            radios.push(c.rm1 ?? c.rm ?? (c.ra + c.rb) * 0.6);
        }
        if (Array.isArray(c.m)) {
            puntos.push(c.m);
            radios.push(c.rm ?? (c.ra + c.rb) * 0.5);
        }
        if (Array.isArray(c.m2)) {
            puntos.push(c.m2);
            radios.push(c.rm2 ?? c.rm ?? (c.ra + c.rb) * 0.35);
        }
        if (Array.isArray(c.c)) {
            puntos.push(c.c);
            radios.push(c.rc ?? (c.ra + c.rb) * 0.4);
        }
        puntos.push(c.b);
        radios.push(c.rb);
    }
    const tramos = puntos.length - 1;
    const huesosCola = Array.isArray(K.HUESOS) ? K.HUESOS.filter((h) => /^cola/i.test(h.nombre)).length : 0;
    return {
        puntos,
        radios,
        tramos,
        huesosCola,
        raizY: puntos[0][1],
        puntaY: puntos[puntos.length - 1][1],
        radioRaiz: radios[0],
        radioMedio: radios.length > 2 ? radios[Math.floor(radios.length / 2)] : (radios[0] + radios[radios.length - 1]) / 2,
        radioPunta: radios[radios.length - 1]
    };
}

function medir(rutaNucleo) {
    const t0 = Date.now();
    const K = cargarNucleo(rutaNucleo);
    const A = K.ANATOMIA;

    const out = {
        version: K.VERSION,
        nucleo: path.relative(process.cwd(), rutaNucleo).replace(/\\/g, '/'),
        huesos: K.HUESOS.length
    };

    // 1) Siluetas ortograficas por altura (Anexo A)
    out.silueta = [];
    for (let y = 0.06; y <= 0.99; y += 0.06) {
        const fx = extremos(K.sdf, y, 'x', true);
        const fz = extremos(K.sdf, y, 'z', true);
        out.silueta.push({
            y: r3(y),
            ancho: r3(fx[1] - fx[0]),
            zDelante: r3(fz[1]),
            zDetras: r3(fz[0])
        });
    }

    // 2) B1-B5 · Brazo (soporta 1 o 2 tramos)
    const sinBrazos = (x, y, z) => {
        const ax = Math.abs(x);
        return Math.min(K.dTorso(ax, y, z), K.dCabeza(ax, y, z), K.dPierna(ax, y, z), K.dPierna(-ax, y, z));
    };
    const infoBrazo = describirBrazo(A, K);
    const pasoBrazo = 0.001;
    let sAcum = 0;
    let sSalida = null;
    let sPunta = 0;

    for (let i = 0; i < infoBrazo.tramos; i++) {
        const p0 = infoBrazo.puntos[i];
        const p1 = infoBrazo.puntos[i + 1];
        const dx = p1[0] - p0[0], dy = p1[1] - p0[1], dz = p1[2] - p0[2];
        const L = Math.hypot(dx, dy, dz);
        if (L < 1e-9) continue;
        const ux = dx / L, uy = dy / L, uz = dz / L;
        const esUltimo = (i === infoBrazo.tramos - 1);
        const maxT = esUltimo ? L + 0.45 : L;
        for (let t = 0; t <= maxT; t += pasoBrazo) {
            const px = p0[0] + ux * t;
            const py = p0[1] + uy * t;
            const pz = p0[2] + uz * t;
            const s = sAcum + t;
            if (sSalida === null && sinBrazos(px, py, pz) > 0) sSalida = s;
            if (K.dBrazo(px, py, pz) < 0) sPunta = Math.max(sPunta, s);
        }
        sAcum += L;
    }

    const parteLibre = sSalida !== null ? Math.max(0, sPunta - sSalida) : 0;
    out.brazo = {
        hombroY: r3(A.brazo.a[1]),
        hombroZ: r3(A.brazo.a[2]),
        diametroMedio: r3(infoBrazo.diametroMedio),
        parteLibre: r3(parteLibre),
        tramos: infoBrazo.tramos,
        tieneCodo: infoBrazo.tieneCodo,
        tieneCodoGeom: infoBrazo.tieneCodoGeom,
        tieneHuesoCodo: infoBrazo.tieneHuesoCodo
    };

    // 3) P1-P2 · Piernas
    let yTorso = null, yEntrepierna = null;
    for (let y = 0; y <= 0.45; y += 0.001) {
        if (yTorso === null && K.dTorso(A.pierna.a[0], y, A.pierna.a[2]) < 0) yTorso = y;
        if (yEntrepierna === null && K.sdf(0, y, A.pierna.a[2]) < 0) yEntrepierna = y;
    }
    out.pierna = {
        visible: r3(yTorso),
        entrepiernaCierraEnY: r3(yEntrepierna)
    };

    // 4) C1-C2 · Cola (soporta 2, 3 o mas tramos)
    const infoCola = describirCola(A, K);
    let zEspalda = null;
    for (let z = 0; z >= -0.6; z -= 0.001) {
        if (K.dTorso(0, infoCola.raizY, z) > 0) {
            zEspalda = z;
            break;
        }
    }
    // Busqueda gruesa + fina de zPunta de dCola en plano de simetria x = 0
    let zPuntaG = 0;
    for (let z = 0; z >= -1.0; z -= 0.012) {
        for (let y = 0.0; y <= 0.55; y += 0.012) {
            if (K.dCola(0, y, z) < 0.02) zPuntaG = Math.min(zPuntaG, z);
        }
    }
    let zPunta = 0;
    for (let z = Math.min(0, zPuntaG + 0.03); z >= Math.max(-1.05, zPuntaG - 0.03); z -= 0.001) {
        for (let y = 0.0; y <= 0.55; y += 0.003) {
            if (K.dCola(0, y, z) < 0) {
                zPunta = Math.min(zPunta, z);
                break;
            }
        }
    }
    const sobresaleCola = zEspalda !== null ? (zEspalda - zPunta) : 0;
    const esbeltezCola = infoCola.radioMedio > 0 ? sobresaleCola / (2 * infoCola.radioMedio) : 0;
    out.cola = {
        sobresale: r3(sobresaleCola),
        raizY: r3(infoCola.raizY),
        puntaY: r3(infoCola.puntaY),
        radioRaiz: r3(infoCola.radioRaiz),
        radioMedio: r3(infoCola.radioMedio),
        radioPunta: r3(infoCola.radioPunta),
        esbeltez: r3(esbeltezCola),
        tramos: infoCola.tramos,
        huesos: infoCola.huesosCola
    };

    // 5) H1-H5 · Cabeza y T1-T3 · Torso
    const cBox = caja3DSimetrica((x, y, z) => K.dCabeza(x, y, z), { xMax: 0.48, yMin: 0.35, yMax: 1.08, zMin: -0.48, zMax: 0.55 });
    const tBox = caja3DSimetrica((x, y, z) => K.dTorso(x, y, z), { xMax: 0.48, yMin: 0.0, yMax: 0.72, zMin: -0.48, zMax: 0.55 });
    const cMin = cBox.min, cMax = cBox.max;
    const tMin = tBox.min, tMax = tBox.max;

    const altoCab = cMax[1] - cMin[1];
    const yCoronilla = cMax[1] - 0.16 * altoCab;
    const anchoCoronilla = extremos((x, y, z) => K.dCabeza(Math.abs(x), y, z), yCoronilla, 'x', true);
    const anchoCabeza = 2 * cMax[0];
    const coronillaSobreMax = anchoCabeza > 0 ? (anchoCoronilla[1] - anchoCoronilla[0]) / anchoCabeza : 0;
    const altoTorso = cMin[1] - Math.max(tMin[1], 0);

    out.cabeza = {
        ancho: r3(anchoCabeza),
        alto: r3(altoCab),
        fondo: r3(cMax[2] - cMin[2]),
        voladizoSobreBarriga: r3(cMax[2] - tMax[2]),
        coronillaSobreMax: r3(coronillaSobreMax),
        yMin: r3(cMin[1]),
        yMax: r3(cMax[1])
    };
    out.torso = {
        fondo: r3(tMax[2] - tMin[2]),
        ancho: r3(2 * tMax[0]),
        alto: r3(altoTorso),
        frenteBarrigaZ: r3(tMax[2]),
        yMin: r3(tMin[1])
    };

    // 6) Malla real (celda 0.0105): altura H, H6 (test 49) y V1-V3 (pancita)
    const m = K.generarMalla({ celda: 0.0105 });
    const P = m.posiciones, C = m.colores, J = m.huesoIndices, nv = P.length / 3;
    const am = K.srgbALineal(K.COLORES.amarillo), cr = K.srgbALineal(K.COLORES.crema);
    const brazosSet = new Set(
        K.HUESOS.map((h, idx) => (/^(brazo|codo)/i.test(h.nombre) ? idx : -1)).filter((i) => i >= 0)
    );

    let yminM = Infinity, ymaxM = -Infinity, cabM = 0, torM = 0;
    for (let v = 0; v < nv; v++) {
        const x = P[v * 3], y = P[v * 3 + 1];
        if (y < yminM) yminM = y;
        if (y > ymaxM) ymaxM = y;
        if (y > 0.62 && y < 0.68) cabM = Math.max(cabM, Math.abs(x));
        if (y > 0.25 && y < 0.32 && !brazosSet.has(J[v * 4])) torM = Math.max(torM, Math.abs(x));
    }
    const h6Ratio = torM > 0 ? cabM / torM : 0;
    out.altura = r3(ymaxM - yminM);
    out.malla = { vertices: nv, triangulos: m.indices.length / 3, huecos: m.estadisticas.huecos, ms: m.estadisticas.ms };
    out.cabeza.ratioCabezaTorso = r3(h6Ratio);

    out.pancita = {};
    for (const [clave, umbral] of [['nucleo90', 0.9], ['borde50', 0.5], ['halo15', 0.15]]) {
        let xmn = 1e9, xmx = -1e9, ymn = 1e9, ymx = -1e9, zmn = 1e9;
        for (let v = 0; v < nv; v++) {
            const fG = (C[v * 3 + 1] - am[1]) / (cr[1] - am[1]);
            const fB = (C[v * 3 + 2] - am[2]) / (cr[2] - am[2]);
            const f = Math.min(fG, fB);
            if (f < umbral || P[v * 3 + 2] < 0) continue;
            const x = P[v * 3], y = P[v * 3 + 1], z = P[v * 3 + 2];
            if (x < xmn) xmn = x;
            if (x > xmx) xmx = x;
            if (y < ymn) ymn = y;
            if (y > ymx) ymx = y;
            if (z < zmn) zmn = z;
        }
        if (xmn > xmx) {
            out.pancita[clave] = { ancho: 0, alto: 0, y: [null, null], zMasAtras: null };
        } else {
            out.pancita[clave] = {
                ancho: r3(xmx - xmn),
                alto: r3(ymx - ymn),
                y: [r3(ymn), r3(ymx)],
                zMasAtras: r3(zmn)
            };
        }
    }

    // 7) Evaluacion estructurada contra objetivos de §3.2 (B1-B5, C1-C2, P1-P2, T1-T3, H1-H6, V1-V3)
    const enRango = (v, lo, hi) => v !== null && v >= lo && v <= hi;
    const p90 = out.pancita.nucleo90;
    const p50 = out.pancita.borde50;
    const p15 = out.pancita.halo15;

    const metricas = {
        B1: {
            id: 'B1',
            nombre: 'Brazo: parte libre',
            valor: out.brazo.parteLibre,
            objetivo: '0.20 - 0.24',
            ok: enRango(out.brazo.parteLibre, 0.20, 0.24)
        },
        B2: {
            id: 'B2',
            nombre: 'Brazo: diametro medio',
            valor: out.brazo.diametroMedio,
            objetivo: '0.10 - 0.12',
            ok: enRango(out.brazo.diametroMedio, 0.10, 0.12)
        },
        B3: {
            id: 'B3',
            nombre: 'Hombro: altura eje Y',
            valor: out.brazo.hombroY,
            objetivo: '0.47 - 0.50',
            ok: enRango(out.brazo.hombroY, 0.47, 0.50)
        },
        B4: {
            id: 'B4',
            nombre: 'Hombro: posicion Z',
            valor: out.brazo.hombroZ,
            objetivo: '-0.05 a -0.02',
            ok: enRango(out.brazo.hombroZ, -0.05, -0.02)
        },
        B5: {
            id: 'B5',
            nombre: 'Codo (2 tramos + hueso)',
            valor: out.brazo.tieneCodo ? '2 tramos + hueso' : `${out.brazo.tramos} tramo, sin hueso`,
            objetivo: '2 tramos + hueso',
            ok: out.brazo.tieneCodo
        },
        C1: {
            id: 'C1',
            nombre: 'Cola: sobresale espalda',
            valor: out.cola.sobresale,
            objetivo: '0.26 - 0.30',
            ok: enRango(out.cola.sobresale, 0.26, 0.30)
        },
        C2: {
            id: 'C2',
            nombre: 'Cola: raiz y esbeltez',
            valor: `y=${out.cola.raizY}, rP=${out.cola.radioPunta}, esb=${out.cola.esbeltez}`,
            objetivo: 'y 0.15-0.18, rP<=0.04, esb>=1.6',
            ok: enRango(out.cola.raizY, 0.15, 0.18) && out.cola.radioPunta <= 0.04 && out.cola.esbeltez >= 1.6
        },
        P1: {
            id: 'P1',
            nombre: 'Pierna: altura visible',
            valor: out.pierna.visible,
            objetivo: '0.12 - 0.14',
            ok: enRango(out.pierna.visible, 0.12, 0.14)
        },
        P2: {
            id: 'P2',
            nombre: 'Piernas: hueco entrepierna Y',
            valor: out.pierna.entrepiernaCierraEnY,
            objetivo: '>= 0.07',
            ok: out.pierna.entrepiernaCierraEnY !== null && out.pierna.entrepiernaCierraEnY >= 0.07
        },
        T1: {
            id: 'T1',
            nombre: 'Torso: fondo Z',
            valor: out.torso.fondo,
            objetivo: '0.38 - 0.42',
            ok: enRango(out.torso.fondo, 0.38, 0.42)
        },
        T2: {
            id: 'T2',
            nombre: 'Torso: ancho sin brazos',
            valor: out.torso.ancho,
            objetivo: '0.48 - 0.52',
            ok: enRango(out.torso.ancho, 0.48, 0.52)
        },
        T3: {
            id: 'T3',
            nombre: 'Torso: alto (entrep.-barbilla)',
            valor: out.torso.alto,
            objetivo: '0.38 - 0.42',
            ok: enRango(out.torso.alto, 0.38, 0.42)
        },
        H1: {
            id: 'H1',
            nombre: 'Voladizo cara sobre barriga',
            valor: out.cabeza.voladizoSobreBarriga,
            objetivo: '0.10 - 0.14',
            ok: enRango(out.cabeza.voladizoSobreBarriga, 0.10, 0.14)
        },
        H2: {
            id: 'H2',
            nombre: 'Cabeza: fondo Z',
            valor: out.cabeza.fondo,
            objetivo: '0.48 - 0.50',
            ok: enRango(out.cabeza.fondo, 0.48, 0.50)
        },
        H3: {
            id: 'H3',
            nombre: 'Cabeza: ancho maximo',
            valor: out.cabeza.ancho,
            objetivo: '0.47 - 0.50',
            ok: enRango(out.cabeza.ancho, 0.47, 0.50)
        },
        H4: {
            id: 'H4',
            nombre: 'Coronilla / ancho max',
            valor: out.cabeza.coronillaSobreMax,
            objetivo: '>= 0.76',
            ok: out.cabeza.coronillaSobreMax >= 0.76
        },
        H5: {
            id: 'H5',
            nombre: 'Cabeza: alto',
            valor: out.cabeza.alto,
            objetivo: '0.47 - 0.50',
            ok: enRango(out.cabeza.alto, 0.47, 0.50)
        },
        H6: {
            id: 'H6',
            nombre: 'Cabeza / torso (test 49)',
            valor: out.cabeza.ratioCabezaTorso,
            objetivo: '0.88 - 0.97',
            ok: enRango(out.cabeza.ratioCabezaTorso, 0.88, 0.97)
        },
        V1: {
            id: 'V1',
            nombre: 'Pancita: nucleo >=90%',
            valor: `${p90.ancho}x${p90.alto} (yMin=${p90.y[0]})`,
            objetivo: '0.31-0.37 x 0.33-0.38, yMin>=0.09',
            ok: enRango(p90.ancho, 0.31, 0.37) && enRango(p90.alto, 0.33, 0.38) && p90.y[0] !== null && p90.y[0] >= 0.09
        },
        V2: {
            id: 'V2',
            nombre: 'Pancita: borde >=50%',
            valor: `${p50.ancho}x${p50.alto} (yMin=${p50.y[0]})`,
            objetivo: '<=0.37 x <=0.38, yMin>=0.06',
            ok: p50.ancho <= 0.37 && p50.alto <= 0.38 && p50.y[0] !== null && p50.y[0] >= 0.06
        },
        V3: {
            id: 'V3',
            nombre: 'Pancita: halo >=15%',
            valor: `${p15.ancho}x${p15.alto} (+${r3(p15.ancho - p50.ancho)} ancho)`,
            objetivo: '<=0.41x0.41 (diff<=0.05)',
            ok: p15.ancho <= 0.41 && p15.alto <= 0.41 && (p15.ancho - p50.ancho) <= 0.05 && (p15.alto - p50.alto) <= 0.05
        }
    };

    const lista = Object.values(metricas);
    const nOk = lista.filter((x) => x.ok).length;
    out.metricas = metricas;
    out.resumen = {
        total: lista.length,
        ok: nOk,
        ko: lista.length - nOk,
        duracionMs: Date.now() - t0
    };

    return out;
}

function formatearTabla(res) {
    const pad = (s, n) => {
        const str = String(s);
        return str.length >= n ? str.slice(0, n) : str + ' '.repeat(n - str.length);
    };
    const lineas = [];
    lineas.push(`=== MEDIDAS NAILONG 3D (VERSION ${res.version}, H=${res.altura}, ${res.huesos} huesos, ${res.malla.vertices} verts, ${res.resumen.duracionMs} ms) ===`);
    lineas.push(`${pad('ID', 4)} | ${pad('Rasgo', 31)} | ${pad('Actual', 28)} | ${pad('Objetivo', 35)} | Estado`);
    lineas.push('-'.repeat(113));
    for (const m of Object.values(res.metricas)) {
        const estado = m.ok ? 'OK' : 'KO';
        lineas.push(`${pad(m.id, 4)} | ${pad(m.nombre, 31)} | ${pad(m.valor, 28)} | ${pad(m.objetivo, 35)} | ${estado}`);
    }
    lineas.push('-'.repeat(113));
    lineas.push(`RESUMEN: ${res.resumen.ok}/${res.resumen.total} OK (${res.resumen.ko} KO) en ${(res.resumen.duracionMs / 1000).toFixed(2)} s`);
    return lineas.join('\n');
}

function main() {
    const opts = parseArgs(process.argv.slice(2));
    const res = medir(opts.nucleo);
    if (opts.salida) {
        fs.mkdirSync(path.dirname(path.resolve(opts.salida)), { recursive: true });
        fs.writeFileSync(opts.salida, JSON.stringify(res, null, 2) + '\n', 'utf8');
    }
    if (opts.tabla) {
        console.log(formatearTabla(res));
    }
    if (opts.json && !opts.tabla) {
        console.log(JSON.stringify(res, null, 2));
    }
}

if (require.main === module) {
    main();
} else {
    module.exports = { medir, formatearTabla };
}
