#!/usr/bin/env node
'use strict';

/**
 * 3D13 · Mide el ojo «lente» del Nailong 3D frente a la piel (solo lectura, 0 dependencias).
 * Carga js/11 dos veces: tal cual y sin tallar la ventana del ojo (piel lisa), y muestrea la superficie del globo
 * llevada a la lente (z' = a·x + b·y + lente·z, igual que marcoOjo en js/12) para responder:
 *   - cuánto sobresale el globo de la piel lisa (objetivo: <= 2-3 mm en un Nailong de 1 m);
 *   - cuántas muestras de la lente asoman fuera de la ventana (las del borde redondeado son normales);
 *   - el pliegue (piel lisa menos lente) a lo largo del borde de la ventana y en el centro.
 *
 * Uso:
 *   node herramientas/medir_ojos_3d.js [js/11-nailong3d-geometria.js] [--abre 1.06] [--json]
 *   --abre escala el globo como la animación al abrir mucho los ojos (susto, sorpresa).
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
let ruta = null, abre = 1, json = false;
for (let i = 0; i < args.length; i++) {
    if (args[i] === '--abre' && i + 1 < args.length) abre = Number(args[++i]) || 1;
    else if (args[i] === '--json') json = true;
    else if (!args[i].startsWith('-')) ruta = args[i];
}
ruta = ruta || path.resolve(__dirname, '..', 'js/11-nailong3d-geometria.js');

const src = fs.readFileSync(ruta, 'utf8');
const cargar = (s) => new Function(s + '\n;return Nailong3DGeometria;')();
const K = cargar(src);
const sinVentana = src.replace(/if \(-hueco > d - K\.cuenca\) d = smax\(d, -hueco, K\.cuenca\);/, '');
if (sinVentana === src) throw new Error('No se encuentra el tallado de la ventana del ojo en ' + ruta);
const K0 = cargar(sinVentana);

const O = K.OJO, r = O.r, A = K.ANATOMIA;
const mm = (v) => Math.round(v * 10000) / 10;            // metros -> mm con 1 decimal (H = 1 m)
const aMundo = (l) => [O.x + l[0] * O.cg + l[2] * O.sg, O.y + l[1], O.z - l[0] * O.sg + l[2] * O.cg];
const lente = (p) => [p[0], p[1], O.a * p[0] + O.b * p[1] + O.lente * p[2]];
const enVentana = (l) => Math.hypot((l[0] - O.centroVentana[0]) / O.ventana[0], (l[1] - O.centroVentana[1]) / O.ventana[1]) <= 1;

// 1) Superficie del globo llevada a la lente
let maxLisa = -Infinity, nFuera = 0, nAsoma = 0, maxAsoma = 0;
for (let it = 0; it <= 120; it++) {
    const th = it / 120 * Math.PI * 0.75;
    for (let ip = 0; ip < 240; ip++) {
        const ph = ip / 240 * 2 * Math.PI, R = r * abre;
        const l = lente([R * Math.sin(th) * Math.cos(ph), R * Math.sin(th) * Math.sin(ph), R * Math.cos(th)]);
        const w = aMundo(l);
        maxLisa = Math.max(maxLisa, K0.sdf(w[0], w[1], w[2]));
        if (!enVentana(l)) {
            nFuera++;
            const d = K.sdf(w[0], w[1], w[2]);
            if (d > 0) { nAsoma++; maxAsoma = Math.max(maxAsoma, d); }
        }
    }
}

// 2) Pliegue en el borde y en el centro (a lo largo del eje local z)
function zPiel(KK, lx, ly) {
    let zA = 0.10, dA = KK.sdf(...aMundo([lx, ly, zA]));
    for (let z = 0.10; z > -0.10; z -= 0.0002) {
        const d = KK.sdf(...aMundo([lx, ly, z]));
        if (d < 0 && dA >= 0) return zA + (z - zA) * (dA / (dA - d));
        zA = z; dA = d;
    }
    return null;
}
const zLente = (x, y) => O.lente * Math.sqrt(Math.max((r * abre) ** 2 - x * x - y * y, 0)) + O.a * x + O.b * y;
const pliegue = {};
for (let ph = 0; ph < 360; ph += 30) {
    const x = O.centroVentana[0] + O.ventana[0] * Math.cos(ph * Math.PI / 180);
    const y = O.centroVentana[1] + O.ventana[1] * Math.sin(ph * Math.PI / 180);
    pliegue[ph] = mm(zPiel(K0, x, y) - zLente(x, y));
}
const centro = mm(zPiel(K0, 0, 0) - zLente(0, 0));

const res = {
    ojo: { lente: O.lente, hundido: A.ojo.hundido, a: +O.a.toFixed(3), b: +O.b.toFixed(3), ventanaMm: O.ventana.map(mm), centroVentanaMm: O.centroVentana.map(mm), kCuenca: A.k.cuenca, abre },
    sobresaleMm: mm(maxLisa),
    asomaFueraDeVentana: { muestras: nAsoma, de: nFuera, maxMm: mm(maxAsoma) },
    plieguePorAnguloMm: pliegue,
    centroBajoPielMm: centro
};
if (json) {
    console.log(JSON.stringify(res, null, 2));
} else {
    console.log(`Ojo «lente»: lente=${O.lente} hundido=${A.ojo.hundido} a=${res.ojo.a} b=${res.ojo.b} ventana=${res.ojo.ventanaMm.join('x')} mm K.cuenca=${A.k.cuenca} abre=${abre}`);
    console.log(`  Sobresale de la piel lisa: ${res.sobresaleMm} mm (negativo = queda por debajo; objetivo <= 2-3 mm)`);
    console.log(`  Fuera de la ventana asoman ${nAsoma}/${nFuera} muestras (máx ${res.asomaFueraDeVentana.maxMm} mm; las del borde redondeado son normales)`);
    console.log('  Pliegue piel lisa - lente en el borde (0 sien, 90 arriba, 180 nariz, 270 abajo): ' + Object.entries(pliegue).map(([k, v]) => `${k}:${v}`).join(' ') + ' mm');
    console.log(`  En el centro la lente queda ${centro} mm bajo la piel lisa`);
}
