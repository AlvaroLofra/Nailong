#!/usr/bin/env node
'use strict';

/**
 * Capturador automatico de vistas del visor Nailong 3D via Chrome Headless + CDP
 * (Node 24 puro: http, child_process, fetch y WebSocket nativos; 0 dependencias externas).
 *
 * Uso:
 *   node herramientas/capturar_3d_cdp.js --salida <dir> [--raiz <dir>] [--expresiones] [--chrome <ruta>]
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

const CHROME_POR_DEFECTO = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium'
].filter(Boolean);

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.webp': 'image/webp',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.mp4': 'video/mp4',
    '.woff2': 'font/woff2'
};

// 7 vistas exactas del Anexo B del Plan de Fidelidad
const VISTAS_BASE = [
    { nombre: 'frente',       az: 0,    el: 0, dist: 2.6,  ty: 0.5 },
    { nombre: 'perfil',       az: -90,  el: 0, dist: 2.6,  ty: 0.5 },
    { nombre: 'tres_cuartos', az: -55,  el: 4, dist: 2.6,  ty: 0.5 },
    { nombre: 'cola',         az: -140, el: 6, dist: 2.6,  ty: 0.5 },
    { nombre: 'cabeza',       az: -62,  el: 6, dist: 1.55, ty: 0.66 },
    { nombre: 'saludo',       az: -35,  el: 2, dist: 2.4,  ty: 0.5, accion: 'saludar', pasos: 66 },
    { nombre: 'espalda',      az: 180,  el: 4, dist: 2.6,  ty: 0.5 }
];

// 6 caritas (primer plano) + 5 acciones (plano medio) para validar clipping y z-fighting
const VISTAS_EXPRESIONES = [
    { nombre: 'expr_sonrison',  az: -12, el: 3, dist: 1.48, ty: 0.68, accion: 'sonrison',  pasos: 60 },
    { nombre: 'expr_carcajada', az: -12, el: 3, dist: 1.48, ty: 0.68, accion: 'carcajada', pasos: 54 },
    { nombre: 'expr_burla',     az: -12, el: 3, dist: 1.48, ty: 0.68, accion: 'burla',     pasos: 60 },
    { nombre: 'expr_puchero',   az: -12, el: 3, dist: 1.48, ty: 0.68, accion: 'puchero',   pasos: 66 },
    { nombre: 'expr_pillo',     az: -12, el: 3, dist: 1.48, ty: 0.68, accion: 'pillo',     pasos: 60 },
    { nombre: 'expr_susto',     az: -12, el: 3, dist: 1.48, ty: 0.68, accion: 'susto',     pasos: 48 },
    { nombre: 'acc_saludar',    az: -22, el: 4, dist: 2.35, ty: 0.50, accion: 'saludar',   pasos: 66 },
    { nombre: 'acc_duang',      az: -22, el: 4, dist: 2.75, ty: 0.62, accion: 'duang',     pasos: 24 },
    { nombre: 'acc_bailar',     az: -22, el: 4, dist: 2.35, ty: 0.50, accion: 'bailar',    pasos: 78 },
    { nombre: 'acc_sorpresa',   az: -22, el: 4, dist: 2.35, ty: 0.50, accion: 'sorpresa',  pasos: 54 },
    { nombre: 'acc_siesta',     az: -22, el: 4, dist: 2.35, ty: 0.50, accion: 'siesta',    pasos: 96 }
];

function parseArgs(argv) {
    const opts = {
        raiz: process.cwd(),
        salida: path.resolve(process.cwd(), 'documentacion/referencias_nailong_serie/comparativas/renders_cdp'),
        expresiones: false,
        chrome: null,
        timeout: 90000,
        query: '3d=1'
    };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--raiz' && i + 1 < argv.length) opts.raiz = path.resolve(argv[++i]);
        else if (a === '--salida' && i + 1 < argv.length) opts.salida = path.resolve(argv[++i]);
        else if (a === '--chrome' && i + 1 < argv.length) opts.chrome = argv[++i];
        else if (a === '--timeout' && i + 1 < argv.length) opts.timeout = Number(argv[++i]) || 90000;
        else if (a === '--query' && i + 1 < argv.length) opts.query = argv[++i].replace(/^\?/, '');
        else if (a === '--expresiones') opts.expresiones = true;
        else if (a === '-h' || a === '--help') {
            console.log('Uso: node herramientas/capturar_3d_cdp.js --salida <dir> [--raiz <dir>] [--expresiones] [--chrome <ruta>]');
            process.exit(0);
        }
    }
    if (!opts.chrome) {
        opts.chrome = CHROME_POR_DEFECTO.find((p) => fs.existsSync(p));
    }
    if (!opts.chrome || !fs.existsSync(opts.chrome)) {
        throw new Error('No se encontro Chrome. Usa --chrome <ruta> o CHROME_PATH.');
    }
    return opts;
}

function iniciarServidorEstatico(raiz) {
    return new Promise((resolve, reject) => {
        const raizAbs = path.resolve(raiz);
        const server = http.createServer((req, res) => {
            try {
                const urlObj = new URL(req.url, 'http://127.0.0.1');
                let rel = decodeURIComponent(urlObj.pathname);
                if (rel === '/' || rel === '') rel = '/index.html';
                const destino = path.resolve(raizAbs, '.' + rel);
                if (!destino.startsWith(raizAbs)) {
                    res.writeHead(403);
                    res.end('Forbidden');
                    return;
                }
                if (!fs.existsSync(destino) || fs.statSync(destino).isDirectory()) {
                    res.writeHead(404);
                    res.end('Not Found');
                    return;
                }
                const ext = path.extname(destino).toLowerCase();
                res.writeHead(200, {
                    'Content-Type': MIME[ext] || 'application/octet-stream',
                    'Cache-Control': 'no-store'
                });
                fs.createReadStream(destino).pipe(res);
            } catch (e) {
                res.writeHead(500);
                res.end(String(e));
            }
        });
        server.on('error', reject);
        server.listen(0, '127.0.0.1', () => {
            const addr = server.address();
            resolve({ server, port: addr.port });
        });
    });
}

function lanzarChrome(rutaChrome, userDataDir) {
    return new Promise((resolve, reject) => {
        const args = [
            '--headless=new',
            '--remote-debugging-port=0',
            '--use-gl=angle',
            '--use-angle=swiftshader',
            '--enable-unsafe-swiftshader',
            '--ignore-gpu-blocklist',
            '--no-first-run',
            '--no-default-browser-check',
            '--disable-background-timer-throttling',
            '--disable-renderer-backgrounding',
            '--disable-backgrounding-occluded-windows',
            '--window-size=1280,900',
            `--user-data-dir=${userDataDir}`,
            'about:blank'
        ];
        const proc = spawn(rutaChrome, args, { stdio: ['ignore', 'pipe', 'pipe'] });
        let stderrBuf = '';
        let resuelto = false;
        const timer = setTimeout(() => {
            if (!resuelto) {
                resuelto = true;
                try { proc.kill('SIGKILL'); } catch (_) {}
                reject(new Error('Timeout esperando DevTools de Chrome. Stderr:\n' + stderrBuf));
            }
        }, 25000);

        proc.stderr.on('data', (chunk) => {
            const txt = chunk.toString('utf8');
            stderrBuf += txt;
            const m = stderrBuf.match(/DevTools listening on (ws:\/\/127\.0\.0\.1:(\d+)\/[^\s]+)/);
            if (m && !resuelto) {
                resuelto = true;
                clearTimeout(timer);
                resolve({ proc, wsBrowser: m[1], debugPort: Number(m[2]) });
            }
        });
        proc.on('error', (err) => {
            if (!resuelto) {
                resuelto = true;
                clearTimeout(timer);
                reject(err);
            }
        });
        proc.on('exit', (code) => {
            if (!resuelto) {
                resuelto = true;
                clearTimeout(timer);
                reject(new Error(`Chrome salio prematuramente (code=${code}). Stderr:\n${stderrBuf}`));
            }
        });
    });
}

async function conectarCDP(wsUrl) {
    const ws = new WebSocket(wsUrl);
    await new Promise((resolve, reject) => {
        ws.addEventListener('open', resolve, { once: true });
        ws.addEventListener('error', (e) => reject(new Error('Error WebSocket CDP: ' + (e.message || e.type))), { once: true });
    });

    let seq = 0;
    const pendientes = new Map();
    const oyentes = new Map();

    ws.addEventListener('message', (ev) => {
        const msg = JSON.parse(String(ev.data));
        if (msg.id && pendientes.has(msg.id)) {
            const p = pendientes.get(msg.id);
            pendientes.delete(msg.id);
            if (msg.error) p.reject(new Error(`CDP ${p.method}: ${msg.error.message}`));
            else p.resolve(msg.result);
        } else if (msg.method && oyentes.has(msg.method)) {
            for (const fn of oyentes.get(msg.method)) fn(msg.params);
        }
    });

    function send(method, params = {}) {
        const id = ++seq;
        return new Promise((resolve, reject) => {
            pendientes.set(id, { resolve, reject, method });
            ws.send(JSON.stringify({ id, method, params }));
        });
    }

    function on(method, fn) {
        if (!oyentes.has(method)) oyentes.set(method, []);
        oyentes.get(method).push(fn);
    }

    async function evalJS(expression) {
        const res = await send('Runtime.evaluate', {
            expression,
            returnByValue: true,
            awaitPromise: true
        });
        if (res.exceptionDetails) {
            const desc = res.exceptionDetails.exception?.description || res.exceptionDetails.text || 'Error JS';
            throw new Error('Runtime.evaluate error: ' + desc);
        }
        return res.result ? res.result.value : undefined;
    }

    function close() {
        try { ws.close(); } catch (_) {}
    }

    return { send, on, evalJS, close };
}

async function obtenerWsPagina(debugPort) {
    const t0 = Date.now();
    while (Date.now() - t0 < 10000) {
        const resp = await fetch(`http://127.0.0.1:${debugPort}/json/list`);
        const lista = await resp.json();
        const pag = lista.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
        if (pag) return pag.webSocketDebuggerUrl;
        await new Promise((r) => setTimeout(r, 150));
    }
    throw new Error('No se encontro target de pagina en Chrome CDP');
}

async function esperarListo(cdp, timeoutMs) {
    const t0 = Date.now();
    while (Date.now() - t0 < timeoutMs) {
        const estado = await cdp.evalJS(`(function(){
            if (typeof Nailong3DVisor === 'undefined' || !Nailong3DVisor.depurar) return null;
            return Nailong3DVisor.depurar.estado();
        })()`);
        if (estado && estado.estado === 'listo') return estado;
        if (estado && estado.estado === 'error') {
            throw new Error('Nailong3DVisor entro en estado "error" al cargar.');
        }
        await new Promise((r) => setTimeout(r, 200));
    }
    throw new Error(`Timeout (${timeoutMs} ms) esperando Nailong3DVisor.depurar.estado().estado === 'listo'`);
}

function esErrorWebGL(texto) {
    return /webgl|shader|glsl|three|context.?lost|framebuffer|invalid_operation|invalid_enum/i.test(texto);
}

async function capturarVista(cdp, vista, rutaPng) {
    const expr = `(function(){
        const S = Nailong3DVisor.depurar.s;
        if (S.raf) { cancelAnimationFrame(S.raf); S.raf = 0; }
        S.visible = false;
        S.anim = Nailong3DAnimacion.crear(S.modelo, { ocio: false, semilla: 11, reducido: false });
        S.anim.asentar(2.2);
        ${vista.accion ? `
        S.anim.accion(${JSON.stringify(vista.accion)});
        for (let i = 0; i < ${vista.pasos}; i++) S.anim.actualizar(1 / 60, null);
        ` : ''}
        const az = ${vista.az} * Math.PI / 180;
        const el = ${vista.el} * Math.PI / 180;
        const dist = ${vista.dist};
        const ty = ${vista.ty};
        const dh = dist * Math.cos(el);
        S.camara.position.set(dh * Math.sin(az), ty + dist * Math.sin(el), dh * Math.cos(az));
        S.controles.target.set(0, ty, 0);
        S.camara.lookAt(S.controles.target);
        S.controles.update();
        S.renderer.render(S.escena, S.camara);
        const gl = S.renderer.getContext();
        const glErr = gl ? gl.getError() : 0;
        return {
            dataUrl: S.lienzo.toDataURL('image/png'),
            width: S.lienzo.width,
            height: S.lienzo.height,
            glErr
        };
    })()`;

    const res = await cdp.evalJS(expr);
    if (!res || !res.dataUrl || !res.dataUrl.startsWith('data:image/png;base64,')) {
        throw new Error(`Fallo al extraer PNG del lienzo en vista "${vista.nombre}"`);
    }
    const buf = Buffer.from(res.dataUrl.slice('data:image/png;base64,'.length), 'base64');
    fs.writeFileSync(rutaPng, buf);
    return { width: res.width, height: res.height, bytes: buf.length, glErr: res.glErr };
}

async function main() {
    const t0 = Date.now();
    const opts = parseArgs(process.argv.slice(2));
    fs.mkdirSync(opts.salida, { recursive: true });

    const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nailong3d-cdp-'));
    let server = null;
    let chromeProc = null;
    let cdp = null;

    const erroresConsola = [];
    const erroresWebGL = [];

    try {
        const srv = await iniciarServidorEstatico(opts.raiz);
        server = srv.server;
        const url = `http://127.0.0.1:${srv.port}/?${opts.query}`;

        const chrome = await lanzarChrome(opts.chrome, userDataDir);
        chromeProc = chrome.proc;

        const wsPag = await obtenerWsPagina(chrome.debugPort);
        cdp = await conectarCDP(wsPag);

        await cdp.send('Page.enable');
        await cdp.send('Runtime.enable');
        await cdp.send('Log.enable');

        cdp.on('Runtime.consoleAPICalled', (p) => {
            const texto = (p.args || []).map((a) => a.value ?? a.description ?? '').join(' ');
            if (p.type === 'error') {
                erroresConsola.push(texto);
                if (esErrorWebGL(texto)) erroresWebGL.push(texto);
            } else if (p.type === 'warning' && esErrorWebGL(texto)) {
                erroresWebGL.push(texto);
            }
        });
        cdp.on('Runtime.exceptionThrown', (p) => {
            const texto = p.exceptionDetails?.exception?.description || p.exceptionDetails?.text || 'Exception';
            erroresConsola.push(texto);
            if (esErrorWebGL(texto)) erroresWebGL.push(texto);
        });
        cdp.on('Log.entryAdded', (p) => {
            const e = p.entry || {};
            if (e.level === 'error') {
                const texto = `[${e.source || 'log'}] ${e.text || ''}`;
                erroresConsola.push(texto);
                if (esErrorWebGL(texto)) erroresWebGL.push(texto);
            }
        });

        await cdp.send('Page.navigate', { url });
        const estadoInicial = await esperarListo(cdp, opts.timeout);

        const vistas = opts.expresiones ? [...VISTAS_BASE, ...VISTAS_EXPRESIONES] : VISTAS_BASE;
        const capturas = [];
        for (const v of vistas) {
            const rutaPng = path.join(opts.salida, `${v.nombre}.png`);
            const info = await capturarVista(cdp, v, rutaPng);
            if (info.glErr !== 0) {
                erroresWebGL.push(`gl.getError()=${info.glErr} en vista ${v.nombre}`);
            }
            capturas.push({
                nombre: v.nombre,
                archivo: path.basename(rutaPng),
                width: info.width,
                height: info.height,
                bytes: info.bytes
            });
        }

        const resumen = {
            url: `/?${opts.query}`,
            raiz: opts.raiz,
            salida: opts.salida,
            calidad: estadoInicial.calidad,
            ratio: estadoInicial.ratio,
            vistasCapturadas: capturas.length,
            capturas,
            erroresConsola,
            erroresWebGL,
            duracionMs: Date.now() - t0
        };
        fs.writeFileSync(path.join(opts.salida, 'captura_meta.json'), JSON.stringify(resumen, null, 2) + '\n', 'utf8');

        console.log(`Capturadas ${capturas.length} vistas en ${opts.salida} (${(resumen.duracionMs / 1000).toFixed(2)} s, consola=${erroresConsola.length} err, WebGL=${erroresWebGL.length} err)`);
        if (erroresWebGL.length > 0 || erroresConsola.length > 0) {
            console.error('ERRORES DETECTADOS EN CHROME:');
            for (const e of [...erroresWebGL, ...erroresConsola]) console.error('  -', e);
            process.exitCode = 1;
        }
    } finally {
        if (cdp) cdp.close();
        if (chromeProc && !chromeProc.killed) {
            try { chromeProc.kill(); } catch (_) {}
            await new Promise((r) => setTimeout(r, 300));
            try { if (chromeProc.exitCode === null) chromeProc.kill('SIGKILL'); } catch (_) {}
        }
        if (server) {
            await new Promise((r) => server.close(r));
        }
        try {
            fs.rmSync(userDataDir, { recursive: true, force: true });
        } catch (_) {}
    }
}

main().catch((err) => {
    console.error('[capturar_3d_cdp] Error fatal:', err.message || err);
    process.exit(1);
});
