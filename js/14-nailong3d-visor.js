        /* ==============================================================
           18. NAILONG 3D · VISOR EN LA WEB (sección #nailong-3d)
           Three.js r147 (último con scripts clásicos) se descarga SOLO cuando la
           sección se acerca a la pantalla. El bucle se pausa fuera de pantalla y
           con la pestaña oculta. Se autoinicia: no toca window.onload.
        ============================================================== */
        const Nailong3DVisor = (function () {
            'use strict';
            const VERSION_THREE = '0.147.0';
            const BASES_CDN = ['https://cdn.jsdelivr.net/npm/three@' + VERSION_THREE + '/', 'https://unpkg.com/three@' + VERSION_THREE + '/'];
            // SRI calculado sobre los mismos ficheros del paquete npm que sirven las CDN
            const SCRIPTS = {
                three: { ruta: 'build/three.min.js', sri: 'sha384-vV17nr/rMaJqmeZkFUzXLpHdQ+ME5QHKdydaqqN+3Ga39RJlNrTatJxHwGV4ml2C' },
                orbita: { ruta: 'examples/js/controls/OrbitControls.js', sri: 'sha384-I0DMsfimAPIqWT8lF+oA997gRgdUi3jhidoTq3fN0zmn35smXZukD01FLnsPRU9i' },
                exportador: { ruta: 'examples/js/exporters/GLTFExporter.js', sri: 'sha384-fz8UmA1wT7KrA88we2948dh8iOo318hFy6/Azeb0sQov7fG1qhPIdOpCOwin+Fd7' }
            };
            const OBJETIVO = [0, 0.47, 0];
            const NOMBRES = {
                saludar: 'Nailong te saluda', duang: '¡Duang! Nailong rebota', bailar: 'Nailong baila', sorpresa: 'Nailong se sorprende',
                siesta: 'Nailong se echa una siesta', sonrison: 'Nailong presume de sonrisón', carcajada: 'Nailong se parte de risa',
                burla: '¡Bleh! Nailong saca la lengua', puchero: 'Nailong pone ojitos tiernos de puchero',
                pillo: 'Nailong frunce el ceño con picardía', susto: '¡Susto! Nailong abre la bocaza',
                pancita: 'Cosquillas en la pancita', mimos: 'Mimos en la cabeza', colita: 'Nailong mueve la colita',
                saltito: 'Nailong da un saltito', despertar: 'Nailong se despierta'
            };
            const SONIDOS = {
                saludar: 'laugh', duang: 'duang', sorpresa: 'surprise', siesta: 'sleep',
                sonrison: 'laugh', carcajada: 'laugh', burla: 'bleh', puchero: 'duang', pillo: 'pop', susto: 'surprise',
                pancita: 'duang', mimos: 'pop', colita: 'tail', saltito: 'pop', despertar: 'surprise'
            };

            const S = {
                estado: 'inactivo', contenedor: null, lienzo: null, renderer: null, escena: null, camara: null, controles: null,
                modelo: null, anim: null, estudio: null, visible: false, raf: 0, ultimo: 0, mediaFrame: 16, ratio: 1, ratioMax: 2,
                calidad: 'alta', reducido: false, pendientes: [], puntero: null, mirarHasta: 0, ultimoToque: null, pantallaCSS: false
            };
            const cargas = {};
            const $ = (id) => document.getElementById(id);

            // W25: conserva el sufijo ?v= de js/14 para cargar js/11-13 bajo demanda en orden estricto
            const SUFIJO_VERSION = (function () {
                try {
                    const actual = document.currentScript || document.querySelector('script[src*="14-nailong3d-visor.js"]');
                    const src = actual ? (actual.getAttribute('src') || '') : '';
                    const idx = src.indexOf('?');
                    return idx >= 0 ? src.slice(idx) : '';
                } catch (_) { return ''; }
            })();
            const MODULOS_3D = [
                { ruta: 'js/11-nailong3d-geometria.js', listo: () => typeof Nailong3DGeometria !== 'undefined' },
                { ruta: 'js/12-nailong3d-escena.js', listo: () => typeof Nailong3DEscena !== 'undefined' },
                { ruta: 'js/13-nailong3d-animacion.js', listo: () => typeof Nailong3DAnimacion !== 'undefined' }
            ];

            function cargarScriptLocal(ruta) {
                if (cargas[ruta]) return cargas[ruta];
                cargas[ruta] = new Promise((resolver, rechazar) => {
                    const s = document.createElement('script');
                    s.src = ruta + SUFIJO_VERSION;
                    s.async = false;
                    s.onload = () => resolver();
                    s.onerror = () => { delete cargas[ruta]; rechazar(new Error('No se pudo cargar ' + ruta)); };
                    document.head.appendChild(s);
                });
                return cargas[ruta];
            }

            async function cargarModulos3D() {
                for (let i = 0; i < MODULOS_3D.length; i++) {
                    if (!MODULOS_3D[i].listo()) {
                        await cargarScriptLocal(MODULOS_3D[i].ruta);
                    }
                }
            }

            function cargarScript(clave) {
                if (cargas[clave]) return cargas[clave];
                const def = SCRIPTS[clave];
                cargas[clave] = new Promise((resolver, rechazar) => {
                    const intentar = (i) => {
                        if (i >= BASES_CDN.length) { delete cargas[clave]; rechazar(new Error('No se pudo cargar ' + def.ruta)); return; }
                        const s = document.createElement('script');
                        s.src = BASES_CDN[i] + def.ruta;
                        s.integrity = def.sri;
                        s.crossOrigin = 'anonymous';
                        s.onload = () => resolver();
                        s.onerror = () => { s.remove(); intentar(i + 1); };
                        document.head.appendChild(s);
                    };
                    intentar(0);
                });
                return cargas[clave];
            }

            function hayWebGL() {
                try {
                    const c = document.createElement('canvas');
                    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
                } catch (e) { return false; }
            }

            function decidirCalidad() {
                const tactil = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
                const nucleos = navigator.hardwareConcurrency || 4;
                const memoria = navigator.deviceMemory || 4;
                const baja = tactil || nucleos <= 4 || memoria <= 4;
                S.calidad = baja ? 'baja' : 'alta';
                S.ratioMax = baja ? 1.5 : 2;
            }

            /* ---------- Geometría en un Web Worker (sin fichero extra: se crea desde el código del núcleo) ---------- */
            function generarMallas(pedidos, fuenteKernel) {
                const enHilo = () => {
                    const K = fuenteKernel ? (new Function('return (' + fuenteKernel + ')()'))() : Nailong3DGeometria;
                    return pedidos.map((p) => K.generarMalla(p));
                };
                if (!window.Worker || !window.Blob || typeof crearKernelGeometriaNailong !== 'function') return Promise.resolve(enHilo());
                return new Promise((resolver) => {
                    let url = null, w = null, hecho = false;
                    const terminar = (res) => { if (hecho) return; hecho = true; if (w) w.terminate(); if (url) URL.revokeObjectURL(url); resolver(res); };
                    try {
                        const srcKernel = fuenteKernel || crearKernelGeometriaNailong.toString();
                        const fuente = 'const K = (' + srcKernel + ')();\n' +
                            'self.onmessage = function (e) { const r = e.data.map(function (p) { return K.generarMalla(p); });\n' +
                            'const t = []; r.forEach(function (m) { [m.posiciones, m.normales, m.colores, m.indices, m.huesoIndices, m.huesoPesos].forEach(function (a) { if (a) t.push(a.buffer); }); });\n' +
                            'self.postMessage(r, t); };';
                        url = URL.createObjectURL(new Blob([fuente], { type: 'text/javascript' }));
                        w = new Worker(url);
                        w.onmessage = (e) => terminar(e.data);
                        w.onerror = () => terminar(enHilo());
                        w.postMessage(pedidos);
                        setTimeout(() => { if (!hecho) terminar(enHilo()); }, 20000);
                    } catch (e) { terminar(enHilo()); }
                });
            }

            /* ---------- Arranque ---------- */
            function mostrarCarga(texto, conBoton) {
                const caja = $('nailong-3d-carga');
                if (!caja) return;
                caja.classList.remove('hidden');
                const t = $('nailong-3d-carga-texto');
                if (t) t.textContent = texto;
                const b = $('nailong-3d-cargar');
                if (b) b.classList.toggle('hidden', !conBoton);
            }

            function fallo(texto, reintentable) {
                S.estado = 'error';
                mostrarCarga(texto, reintentable !== false);
                const caja = $('nailong-3d-carga');
                if (caja) caja.classList.add('n3d-error');
            }

            async function arrancar() {
                if (S.estado === 'cargando' || S.estado === 'listo') return;
                if (!hayWebGL()) { fallo('Tu navegador no puede mostrar gráficos 3D (WebGL). ¡Pero tienes todos los stickers más abajo! 💛', false); return; }
                S.estado = 'cargando';
                const caja = $('nailong-3d-carga');
                if (caja) caja.classList.remove('n3d-error');
                mostrarCarga('Despertando a Nailong 3D…', false);
                try {
                    decidirCalidad();
                    // W25: Three.js y los modulos locales js/11 -> 12 -> 13 se cargan bajo demanda en paralelo
                    const threeP = cargarScript('three').then(() => cargarScript('orbita'));
                    await cargarModulos3D();
                    const mallasP = generarMallas([{ celda: S.calidad === 'baja' ? 0.0105 : 0.0085 }, { celda: 0.026, sinColor: true }]);
                    await threeP;
                    const mallas = await mallasP;
                    montar(mallas[0], mallas[1]);
                    S.estado = 'listo';
                    if (caja) caja.classList.add('hidden');
                    S.contenedor.classList.add('n3d-listo');
                    if (!S.reducido) S.anim.accion('intro');
                    S.pendientes.splice(0).forEach((f) => f());
                    reanudar();
                } catch (e) {
                    console.warn('[Nailong 3D]', e);
                    fallo('No se ha podido cargar el visor 3D. Revisa tu conexión y vuelve a intentarlo.');
                }
            }

            function montar(malla, proxy) {
                THREE.ColorManagement.legacyMode = false;
                const renderer = new THREE.WebGLRenderer({ canvas: S.lienzo, antialias: true, alpha: true, powerPreference: 'high-performance' });
                renderer.outputEncoding = THREE.sRGBEncoding;
                renderer.toneMapping = THREE.NoToneMapping;
                renderer.shadowMap.enabled = true;
                renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                renderer.setClearColor(0x000000, 0);
                S.renderer = renderer;
                S.escena = new THREE.Scene();
                S.camara = new THREE.PerspectiveCamera(28, 1, 0.05, 30);
                S.modelo = Nailong3DEscena.crearModelo(THREE, malla, proxy);
                S.escena.add(S.modelo.grupo);
                S.estudio = Nailong3DEscena.crearEstudio(THREE, renderer, S.escena, S.calidad);
                S.anim = Nailong3DAnimacion.crear(S.modelo, { reducido: S.reducido, alEvento: alEvento });
                S.anim.asentar(0.5);

                const c = new THREE.OrbitControls(S.camara, S.lienzo);
                c.target.set(OBJETIVO[0], OBJETIVO[1], OBJETIVO[2]);
                c.enableDamping = true; c.dampingFactor = 0.08;
                c.enablePan = false;
                c.minDistance = 1.35; c.maxDistance = 4.4;
                c.minPolarAngle = 0.28; c.maxPolarAngle = 1.72;
                c.rotateSpeed = 0.75; c.zoomSpeed = 0.8;
                c.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
                S.controles = c;
                ajustarTouchAction();
                c.addEventListener('start', () => { S.lienzo.classList.add('n3d-arrastrando'); });
                c.addEventListener('end', () => { S.lienzo.classList.remove('n3d-arrastrando'); });

                redimensionar(true);
                if (window.ResizeObserver) new ResizeObserver(() => redimensionar(false)).observe(S.contenedor);
                else window.addEventListener('resize', () => redimensionar(false));
                S.lienzo.addEventListener('webglcontextlost', (e) => { e.preventDefault(); pausar(); fallo('El visor 3D se ha detenido. Pulsa para recargarlo.'); S.estado = 'perdido'; });
                configurarPuntero();
            }

            /* ---------- Cámara y tamaño ---------- */
            function distanciaIdeal(aspecto) {
                const t = Math.tan(THREE.MathUtils.degToRad(S.camara.fov / 2));
                return Math.max(0.64 / t, 0.5 / (t * Math.min(aspecto, 1.2)));
            }

            function colocarCamara(aspecto) {
                const d = distanciaIdeal(aspecto);
                S.distBase = d;
                S.controles.maxDistance = Math.max(4.4, d * 1.6);
                S.camara.position.set(Math.sin(0.32) * d, OBJETIVO[1] + 0.22, Math.cos(0.32) * d);
                S.controles.target.set(OBJETIVO[0], OBJETIVO[1], OBJETIVO[2]);
                S.controles.update();
            }

            function redimensionar(inicial) {
                if (!S.renderer) return;
                const w = Math.max(1, S.contenedor.clientWidth), h = Math.max(1, S.contenedor.clientHeight);
                S.ratio = Math.min(window.devicePixelRatio || 1, S.ratioMax);
                S.renderer.setPixelRatio(S.ratio);
                S.renderer.setSize(w, h, false);
                S.camara.aspect = w / h;
                S.camara.updateProjectionMatrix();
                if (inicial) colocarCamara(w / h);
                else if (S.distBase) {
                    // Si cambia la proporción (girar el móvil, pantalla completa), se conserva el encuadre
                    const nueva = distanciaIdeal(w / h);
                    if (Math.abs(nueva / S.distBase - 1) > 0.01) {
                        const off = S.camara.position.clone().sub(S.controles.target).multiplyScalar(nueva / S.distBase);
                        S.camara.position.copy(S.controles.target).add(off);
                        S.controles.maxDistance = Math.max(4.4, nueva * 1.6);
                        S.controles.update();
                        S.distBase = nueva;
                    }
                }
                renderizar();
            }

            function recentrar() {
                if (S.estado !== 'listo') return;
                const desde = S.camara.position.clone();
                const aspecto = S.camara.aspect, d = distanciaIdeal(aspecto);
                S.distBase = d;
                const hacia = new THREE.Vector3(Math.sin(0.32) * d, OBJETIVO[1] + 0.22, Math.cos(0.32) * d);
                const t0 = performance.now(), dur = S.reducido ? 1 : 650;
                const paso = () => {
                    const u = Math.min(1, (performance.now() - t0) / dur), e = 1 - Math.pow(1 - u, 3);
                    S.camara.position.lerpVectors(desde, hacia, e);
                    S.controles.update();
                    if (u < 1) requestAnimationFrame(paso);
                };
                paso();
                anunciar('Cámara recentrada');
            }

            /* ---------- Bucle ---------- */
            function renderizar() {
                if (S.renderer && S.escena && S.camara) S.renderer.render(S.escena, S.camara);
            }

            function bucle(ahora) {
                S.raf = 0;
                if (!S.visible || document.hidden || S.estado !== 'listo') return;
                const dt = S.ultimo ? Math.min((ahora - S.ultimo) / 1000, 0.1) : 1 / 60;
                S.ultimo = ahora;
                S.controles.update();
                S.anim.actualizar(dt, { mirar: objetivoMirada() });
                renderizar();
                vigilarRendimiento(dt);
                S.raf = requestAnimationFrame(bucle);
            }

            function reanudar() {
                if (S.raf || S.estado !== 'listo' || !S.visible || document.hidden) return;
                S.ultimo = 0;
                S.raf = requestAnimationFrame(bucle);
            }
            function pausar() { if (S.raf) cancelAnimationFrame(S.raf); S.raf = 0; }

            // Si el móvil no llega a ~45 fps, baja la resolución interna poco a poco (mínimo 1x)
            function vigilarRendimiento(dt) {
                S.frames = (S.frames || 0) + 1;
                if (S.frames < 90) return;   // los primeros fotogramas compilan shaders
                S.mediaFrame = S.mediaFrame * 0.95 + dt * 1000 * 0.05;
                if (S.mediaFrame > 22 && S.ratio > 1 && performance.now() - (S.ultimoAjuste || 0) > 2500) {
                    S.ultimoAjuste = performance.now();
                    S.ratioMax = Math.max(1, S.ratio - 0.25);
                    redimensionar(false);
                }
            }

            /* ---------- Mirada, toques y reacciones ---------- */
            function objetivoMirada() {
                if (S.puntero && performance.now() < S.mirarHasta) return S.puntero;
                return S.camara.position;
            }

            function rayoDesde(ev) {
                const r = S.lienzo.getBoundingClientRect();
                const ndc = new THREE.Vector2(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
                const ray = new THREE.Raycaster();
                ray.setFromCamera(ndc, S.camara);
                return ray;
            }

            function puntoDeMirada(ray) {
                // Plano frente a Nailong, perpendicular a la cámara, a la altura de su cara
                const normal = S.camara.position.clone().sub(S.controles.target).normalize();
                const plano = new THREE.Plane().setFromNormalAndCoplanarPoint(normal, new THREE.Vector3(0, 0.78, 0).addScaledVector(normal, 0.45));
                const p = new THREE.Vector3();
                return ray.ray.intersectPlane(plano, p) ? p : null;
            }

            function regionDe(hit) {
                const g = S.modelo.proxy.geometry;
                const si = g.attributes.skinIndex, sw = g.attributes.skinWeight;
                const suma = {};
                [hit.face.a, hit.face.b, hit.face.c].forEach((v) => {
                    for (let k = 0; k < 4; k++) {
                        const b = [si.getX(v), si.getY(v), si.getZ(v), si.getW(v)][k], w = [sw.getX(v), sw.getY(v), sw.getZ(v), sw.getW(v)][k];
                        suma[b] = (suma[b] || 0) + w;
                    }
                });
                let mejor = 0, peso = -1;
                Object.keys(suma).forEach((b) => { if (suma[b] > peso) { peso = suma[b]; mejor = +b; } });
                const nombre = Nailong3DGeometria.HUESOS[mejor].nombre;
                // Punto en el espacio de reposo (para la abolladura): baricéntricas sobre el triángulo deformado
                const pos = g.attributes.position;
                const A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3();
                S.modelo.proxy.boneTransform(hit.face.a, A); S.modelo.proxy.boneTransform(hit.face.b, B); S.modelo.proxy.boneTransform(hit.face.c, C);
                const local = S.modelo.proxy.worldToLocal(hit.point.clone());
                const bar = new THREE.Triangle(A, B, C).getBarycoord(local, new THREE.Vector3());
                const reposo = new THREE.Vector3()
                    .addScaledVector(new THREE.Vector3().fromBufferAttribute(pos, hit.face.a), bar.x)
                    .addScaledVector(new THREE.Vector3().fromBufferAttribute(pos, hit.face.b), bar.y)
                    .addScaledVector(new THREE.Vector3().fromBufferAttribute(pos, hit.face.c), bar.z);
                let region = 'cuerpo';
                if (nombre === 'cabeza') region = 'cabeza';
                else if (nombre === 'brazoIzq' || nombre === 'codoIzq') region = 'brazoIzq';
                else if (nombre === 'brazoDer' || nombre === 'codoDer') region = 'brazoDer';
                else if (nombre === 'piernaIzq' || nombre === 'piernaDer') region = 'pie';
                else if (nombre === 'cola' || nombre === 'colaMedia' || nombre === 'colaPunta') region = 'cola';
                else if (reposo.z > 0.02) region = 'pancita';
                return { region, reposo };
            }

            function tocarEn(ev) {
                const ray = rayoDesde(ev);
                const hits = ray.intersectObject(S.modelo.proxy, false);
                const p = puntoDeMirada(ray);
                if (p) { S.puntero = p; S.mirarHasta = performance.now() + 1600; }
                if (!hits.length) return false;
                const r = S.lienzo.getBoundingClientRect();
                S.ultimoToque = { x: ev.clientX - r.left, y: ev.clientY - r.top };
                const { region, reposo } = regionDe(hits[0]);
                reaccionar(region, reposo);
                return true;
            }

            function reaccionar(region, reposo) {
                const antes = S.anim.estado().accion;
                S.anim.tocar(region, reposo || null);
                const ahora = S.anim.estado().accion;
                if (ahora) sonar(SONIDOS[ahora]);
                if (ahora && ahora !== antes) anunciar(NOMBRES[ahora] || '');
                if (region === 'pancita' || region === 'cuerpo') sumarDuang();
            }

            function sumarDuang() {
                // Comparte el contador «Cosquillas en su pancita» del inicio (js/03-hero.js)
                if (typeof bellyPokes === 'number') {
                    bellyPokes++;
                    const c = $('belly-counter');
                    if (c) c.textContent = `${bellyPokes} ¡Duangs!`;
                }
            }

            function configurarPuntero() {
                let abajo = null, ultimoHover = 0;
                S.lienzo.addEventListener('pointerdown', (e) => {
                    abajo = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId };
                });
                S.lienzo.addEventListener('pointerup', (e) => {
                    if (!abajo || abajo.id !== e.pointerId) return;
                    const mov = Math.hypot(e.clientX - abajo.x, e.clientY - abajo.y), dur = performance.now() - abajo.t;
                    abajo = null;
                    if (mov < 8 && dur < 450 && S.estado === 'listo') tocarEn(e);
                });
                S.lienzo.addEventListener('pointercancel', () => { abajo = null; });
                S.lienzo.addEventListener('pointermove', (e) => {
                    if (e.pointerType !== 'mouse' || S.estado !== 'listo') return;
                    const ahora = performance.now();
                    const ray = rayoDesde(e);
                    const p = puntoDeMirada(ray);
                    if (p) { S.puntero = p; S.mirarHasta = ahora + 2500; }
                    if (ahora - ultimoHover > 90 && !e.buttons) {
                        ultimoHover = ahora;
                        S.lienzo.style.cursor = ray.intersectObject(S.modelo.proxy, false).length ? 'pointer' : 'grab';
                    }
                });
                S.lienzo.addEventListener('pointerleave', () => { S.mirarHasta = 0; });
                // Teclado: flechas giran, +/- acercan, Intro o espacio = cosquillas
                S.contenedor.addEventListener('keydown', (e) => {
                    if (S.estado !== 'listo') return;
                    const c = S.controles, off = S.camara.position.clone().sub(c.target);
                    const esf = new THREE.Spherical().setFromVector3(off);
                    let usado = true;
                    if (e.key === 'ArrowLeft') esf.theta -= 0.18;
                    else if (e.key === 'ArrowRight') esf.theta += 0.18;
                    else if (e.key === 'ArrowUp') esf.phi = Math.max(c.minPolarAngle, esf.phi - 0.12);
                    else if (e.key === 'ArrowDown') esf.phi = Math.min(c.maxPolarAngle, esf.phi + 0.12);
                    else if (e.key === '+' || e.key === '=') esf.radius = Math.max(c.minDistance, esf.radius * 0.88);
                    else if (e.key === '-' || e.key === '_') esf.radius = Math.min(c.maxDistance, esf.radius / 0.88);
                    else if (e.key === 'Enter' || e.key === ' ') { reaccionar('pancita', new THREE.Vector3(0, 0.27, 0.20)); }
                    else usado = false;
                    if (usado) {
                        e.preventDefault();
                        if (e.key.startsWith('Arrow') || e.key === '+' || e.key === '=' || e.key === '-' || e.key === '_') {
                            S.camara.position.copy(c.target).add(new THREE.Vector3().setFromSpherical(esf));
                            c.update();
                        }
                    }
                });
            }

            /* ---------- Eventos de la animación: sonidos, burbujas y anuncios ---------- */
            function sonar(tipo) {
                if (tipo && typeof playSound === 'function') { try { playSound(tipo); } catch (e) { /* sin audio */ } }
            }

            function marcarAccionActiva(nombre) {
                document.querySelectorAll('[data-n3d-accion]').forEach((b) => {
                    const activo = !!nombre && b.getAttribute('data-n3d-accion') === nombre;
                    b.classList.toggle('n3d-activo', activo);
                });
            }

            function alEvento(tipo, dato) {
                if (tipo === 'sonido') { if (S.anim && S.anim.estado().accion !== 'intro') sonar(dato); }
                else if (tipo === 'texto') burbuja(dato, S.ultimoToque);
                else if (tipo === 'zzz') burbuja('Zzz…', null, true);
                else if (tipo === 'accion') marcarAccionActiva(dato);
                else if (tipo === 'accionFin') marcarAccionActiva(null);
            }

            function posicionCabeza() {
                const p = new THREE.Vector3();
                S.modelo.huesos.cabeza.getWorldPosition(p);
                p.y += 0.5;
                p.project(S.camara);
                return { x: (p.x + 1) / 2 * S.contenedor.clientWidth, y: (1 - p.y) / 2 * S.contenedor.clientHeight };
            }

            function burbuja(texto, en, suave) {
                const capa = $('nailong-3d-burbujas');
                if (!capa || !texto) return;
                if (!suave) capa.querySelectorAll('.n3d-burbuja:not(.n3d-burbuja-zzz)').forEach((prev) => prev.remove());
                const pos = en || posicionCabeza();
                const b = document.createElement('span');
                b.className = 'n3d-burbuja' + (suave ? ' n3d-burbuja-zzz' : '');
                b.textContent = texto;
                b.style.left = Math.max(40, Math.min(S.contenedor.clientWidth - 40, pos.x)) + 'px';
                b.style.top = Math.max(40, pos.y - 20) + 'px';
                capa.appendChild(b);
                setTimeout(() => b.remove(), 1600);
            }

            function anunciar(texto) {
                const e = $('nailong-3d-estado');
                if (e && texto) e.textContent = texto;
            }

            /* ---------- Acciones públicas (botones) ---------- */
            function cuandoListo(f) {
                if (S.estado === 'listo') { f(); return; }
                S.pendientes.push(f);
                arrancar();
            }

            function accion(nombre) {
                S.ultimoToque = null;
                cuandoListo(() => {
                    S.anim.accion(nombre);
                    const a = S.anim.estado().accion;
                    sonar(SONIDOS[a]);
                    anunciar(NOMBRES[a] || '');
                    if (a === 'duang') sumarDuang();
                });
            }

            function estilo(nombre) {
                cuandoListo(() => {
                    S.modelo.setEstilo(nombre === 'toon' ? 'toon' : 'suave');
                    document.querySelectorAll('[data-n3d-estilo]').forEach((b) => {
                        const activo = b.getAttribute('data-n3d-estilo') === S.modelo.estilo;
                        b.setAttribute('aria-pressed', activo ? 'true' : 'false');
                        b.classList.toggle('n3d-activo', activo);
                    });
                    anunciar(nombre === 'toon' ? 'Estilo dibujo animado' : 'Estilo sticker 3D');
                    renderizar();
                });
            }

            function enPantallaCompleta() {
                const fe = document.fullscreenElement || document.webkitFullscreenElement;
                return fe === S.contenedor || S.pantallaCSS;
            }

            function ajustarTouchAction() {
                // En la página: el dedo en vertical hace scroll y en horizontal gira; a pantalla completa, control total
                if (S.lienzo) S.lienzo.style.touchAction = enPantallaCompleta() ? 'none' : 'pan-y';
            }

            function actualizarBotonPantalla() {
                const activo = enPantallaCompleta();
                const b = $('nailong-3d-pantalla');
                if (b) {
                    b.setAttribute('aria-label', activo ? 'Salir de pantalla completa' : 'Ver a pantalla completa');
                    b.innerHTML = activo ? '<i class="fa-solid fa-compress"></i>' : '<i class="fa-solid fa-expand"></i>';
                }
                ajustarTouchAction();
                setTimeout(() => redimensionar(false), 80);
            }

            function pantallaCompleta() {
                const c = S.contenedor;
                if (!c) return;
                if (enPantallaCompleta()) {
                    if (S.pantallaCSS) { S.pantallaCSS = false; c.classList.remove('n3d-pantalla-css'); document.body.classList.remove('n3d-sin-scroll'); actualizarBotonPantalla(); }
                    else if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
                    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
                    return;
                }
                const css = () => { S.pantallaCSS = true; c.classList.add('n3d-pantalla-css'); document.body.classList.add('n3d-sin-scroll'); actualizarBotonPantalla(); };
                if (c.requestFullscreen) c.requestFullscreen().catch(css);
                else if (c.webkitRequestFullscreen) c.webkitRequestFullscreen();
                else css();
            }

            function descargarBlob(blob, nombre) {
                const tactil = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
                const fichero = window.File ? new File([blob], nombre, { type: blob.type }) : null;
                if (tactil && fichero && navigator.canShare && navigator.canShare({ files: [fichero] })) {
                    navigator.share({ files: [fichero], title: 'Nailong 3D' }).catch(() => {});
                    return;
                }
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = nombre;
                document.body.appendChild(a); a.click(); a.remove();
                setTimeout(() => URL.revokeObjectURL(url), 4000);
            }

            function aviso(texto) {
                if (typeof showDuangToast === 'function') { try { showDuangToast(texto); return; } catch (e) { /* sin toast */ } }
                anunciar(texto);
            }

            function foto() {
                cuandoListo(() => {
                    renderizar();
                    S.lienzo.toBlob((blob) => {
                        if (!blob) { aviso('No se pudo guardar la foto 😢'); return; }
                        descargarBlob(blob, 'nailong_3d.png');
                        aviso('📸 ¡Foto de Nailong 3D guardada!');
                    }, 'image/png');
                });
            }

            /* ---------- 3D3: Sticker 512x512 WebP transparente con EXIF de WhatsApp (<= 100 KB) ---------- */
            const STICKER_TAM = 512;
            const STICKER_MAX_BYTES = 100 * 1024;

            function crearChunkRiff(tag, payload) {
                const pad = payload.length & 1;
                const out = new Uint8Array(8 + payload.length + pad);
                for (let i = 0; i < 4; i++) out[i] = tag.charCodeAt(i);
                const len = payload.length;
                out[4] = len & 0xFF; out[5] = (len >>> 8) & 0xFF; out[6] = (len >>> 16) & 0xFF; out[7] = (len >>> 24) & 0xFF;
                out.set(payload, 8);
                return out;
            }

            function construirExifWhatsApp() {
                const json = JSON.stringify({
                    'sticker-pack-id': 'nailong.3d.web',
                    'sticker-pack-name': 'Nailong 3D',
                    'sticker-pack-publisher': 'El Mundo Mágico de Nailong'
                }).replace(/\//g, '\\/');
                const jsBytes = new TextEncoder().encode(json);
                const n = jsBytes.length;
                const exif = new Uint8Array(26 + n);
                exif.set([
                    0x4D, 0x4D, 0x00, 0x2A, 0x00, 0x00, 0x00, 0x08,
                    0x00, 0x01, 0x57, 0x41, 0x00, 0x07,
                    (n >>> 24) & 0xFF, (n >>> 16) & 0xFF, (n >>> 8) & 0xFF, n & 0xFF,
                    0x00, 0x00, 0x00, 0x1A, 0x00, 0x00, 0x00, 0x00
                ], 0);
                exif.set(jsBytes, 26);
                return exif;
            }

            function esCabeceraWebP(bytes) {
                return bytes.length >= 12 &&
                    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
                    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
            }

            function inyectarExifWhatsAppWebP(bytes, ancho, alto) {
                let flags = 0;
                const iccp = [], imagen = [], otros = [];
                let off = 12;
                while (off + 8 <= bytes.length) {
                    const tag = String.fromCharCode(bytes[off], bytes[off + 1], bytes[off + 2], bytes[off + 3]);
                    const size = (bytes[off + 4] | (bytes[off + 5] << 8) | (bytes[off + 6] << 16) | (bytes[off + 7] << 24)) >>> 0;
                    const payload = bytes.subarray(off + 8, Math.min(bytes.length, off + 8 + size));
                    if (tag === 'VP8X' && payload.length >= 1) {
                        flags = payload[0];
                    } else if (tag === 'ICCP') {
                        iccp.push(crearChunkRiff(tag, payload));
                        flags |= 0x20;
                    } else if (tag === 'ALPH' || tag === 'VP8 ' || tag === 'VP8L') {
                        imagen.push(crearChunkRiff(tag, payload));
                        if (tag === 'ALPH' || tag === 'VP8L') flags |= 0x10;
                    } else if (tag !== 'EXIF') {
                        otros.push(crearChunkRiff(tag, payload));
                    }
                    off += 8 + size + (size & 1);
                }
                flags = (flags & ~0x02) | 0x18; // Alpha + EXIF activos, estatico
                const w1 = ancho - 1, h1 = alto - 1;
                const vp8xPayload = new Uint8Array([
                    flags, 0, 0, 0,
                    w1 & 0xFF, (w1 >>> 8) & 0xFF, (w1 >>> 16) & 0xFF,
                    h1 & 0xFF, (h1 >>> 8) & 0xFF, (h1 >>> 16) & 0xFF
                ]);
                const chunks = [crearChunkRiff('VP8X', vp8xPayload), ...iccp, ...imagen, crearChunkRiff('EXIF', construirExifWhatsApp()), ...otros];
                let bodyLen = 0;
                chunks.forEach((c) => { bodyLen += c.length; });
                const riff = new Uint8Array(12 + bodyLen);
                riff.set([0x52, 0x49, 0x46, 0x46], 0);
                const riffSize = 4 + bodyLen;
                riff[4] = riffSize & 0xFF; riff[5] = (riffSize >>> 8) & 0xFF; riff[6] = (riffSize >>> 16) & 0xFF; riff[7] = (riffSize >>> 24) & 0xFF;
                riff.set([0x57, 0x45, 0x42, 0x50], 8);
                let pos = 12;
                chunks.forEach((c) => { riff.set(c, pos); pos += c.length; });
                return riff;
            }

            function canvasABlob(canvas, tipo, calidad) {
                return new Promise((resolver) => {
                    try { canvas.toBlob((b) => resolver(b), tipo, calidad); } catch (_) { resolver(null); }
                });
            }

            function renderizarLienzoSticker512() {
                renderizar();
                const sw = S.lienzo.width, sh = S.lienzo.height;
                const tmp = document.createElement('canvas');
                tmp.width = sw; tmp.height = sh;
                const tctx = tmp.getContext('2d', { willReadFrequently: true });
                tctx.clearRect(0, 0, sw, sh);
                tctx.drawImage(S.lienzo, 0, 0);
                const data = tctx.getImageData(0, 0, sw, sh).data;
                let minX = sw, minY = sh, maxX = -1, maxY = -1;
                for (let y = 0; y < sh; y++) {
                    const row = y * sw * 4;
                    for (let x = 0; x < sw; x++) {
                        if (data[row + x * 4 + 3] > 12) {
                            if (x < minX) minX = x;
                            if (x > maxX) maxX = x;
                            if (y < minY) minY = y;
                            if (y > maxY) maxY = y;
                        }
                    }
                }
                if (maxX < minX || maxY < minY) { minX = 0; minY = 0; maxX = sw - 1; maxY = sh - 1; }
                const bw = maxX - minX + 1, bh = maxY - minY + 1;
                const margen = Math.round(STICKER_TAM * 0.06);
                const caja = STICKER_TAM - margen * 2;
                const esc = Math.min(caja / bw, caja / bh);
                const dw = Math.max(1, Math.round(bw * esc)), dh = Math.max(1, Math.round(bh * esc));
                const dx = Math.round((STICKER_TAM - dw) / 2), dy = Math.round((STICKER_TAM - dh) / 2);

                const out = document.createElement('canvas');
                out.width = STICKER_TAM; out.height = STICKER_TAM;
                const octx = out.getContext('2d');
                octx.clearRect(0, 0, STICKER_TAM, STICKER_TAM);
                octx.imageSmoothingEnabled = true;
                octx.imageSmoothingQuality = 'high';
                octx.drawImage(tmp, minX, minY, bw, bh, dx, dy, dw, dh);
                return out;
            }

            async function exportarStickerWebP() {
                if (S.estado !== 'listo') {
                    await new Promise((resolver) => cuandoListo(resolver));
                }
                const out = renderizarLienzoSticker512();
                const calidades = [0.92, 0.85, 0.76, 0.66, 0.55, 0.42];
                let mejor = null;
                for (let i = 0; i < calidades.length; i++) {
                    const raw = await canvasABlob(out, 'image/webp', calidades[i]);
                    if (!raw) break;
                    const bytes = new Uint8Array(await raw.arrayBuffer());
                    if (raw.type !== 'image/webp' || !esCabeceraWebP(bytes)) {
                        const png = raw.type === 'image/png' ? raw : await canvasABlob(out, 'image/png');
                        if (!png) throw new Error('No se pudo codificar el sticker');
                        return { blob: png, formato: 'png', nombre: 'nailong_3d_sticker.png', bytes: png.size, ancho: STICKER_TAM, alto: STICKER_TAM };
                    }
                    const conExif = inyectarExifWhatsAppWebP(bytes, STICKER_TAM, STICKER_TAM);
                    const blobWebP = new Blob([conExif], { type: 'image/webp' });
                    mejor = { blob: blobWebP, formato: 'webp', nombre: 'nailong_3d_sticker.webp', bytes: conExif.byteLength, ancho: STICKER_TAM, alto: STICKER_TAM, calidad: calidades[i] };
                    if (conExif.byteLength <= STICKER_MAX_BYTES) return mejor;
                }
                if (mejor) return mejor;
                const pngFallback = await canvasABlob(out, 'image/png');
                if (!pngFallback) throw new Error('No se pudo codificar el sticker');
                return { blob: pngFallback, formato: 'png', nombre: 'nailong_3d_sticker.png', bytes: pngFallback.size, ancho: STICKER_TAM, alto: STICKER_TAM };
            }

            function descargarSticker() {
                cuandoListo(async () => {
                    const boton = $('nailong-3d-sticker');
                    if (boton) { boton.disabled = true; boton.classList.add('opacity-60'); }
                    anunciar('Creando sticker 512×512…');
                    try {
                        const res = await exportarStickerWebP();
                        descargarBlob(res.blob, res.nombre);
                        if (res.formato === 'webp') {
                            aviso('🧩 ¡Sticker 512×512 WebP de Nailong 3D guardado!');
                        } else {
                            aviso('🧩 Tu navegador no codifica WebP: guardado en PNG 512×512 transparente.');
                        }
                    } catch (e) {
                        console.warn('[Nailong 3D] sticker', e);
                        aviso('No se pudo crear el sticker 😢');
                    } finally {
                        if (boton) { boton.disabled = false; boton.classList.remove('opacity-60'); }
                    }
                });
            }

            function descargarGLB() {
                cuandoListo(async () => {
                    const boton = $('nailong-3d-glb');
                    if (boton) { boton.disabled = true; boton.classList.add('opacity-60'); }
                    anunciar('Preparando el modelo 3D…');
                    try {
                        await cargarScript('exportador');
                        const blob = await exportarGLB();
                        descargarBlob(blob, 'nailong_3d.glb');
                        aviso('🧊 ¡Modelo 3D descargado! Ábrelo en Blender o en cualquier visor glTF.');
                    } catch (e) {
                        console.warn('[Nailong 3D] exportación', e);
                        aviso('No se pudo exportar el modelo 😢');
                    } finally {
                        if (boton) { boton.disabled = false; boton.classList.remove('opacity-60'); }
                    }
                });
            }

            // GLB con piel, esqueleto, accesorios, materiales PBR y clips horneados del mismo animador
            function exportarGLB() {
                return new Promise((resolver, rechazar) => {
                    const m = S.modelo, estiloPrevio = m.estilo;
                    pausar();
                    m.setEstilo('exportar');
                    const clips = [
                        ['reposo', 3.3], ['saludar', 2.6], ['duang', 1.55], ['bailar', 5.4], ['sorpresa', 2.3],
                        ['sonrison', 2.5], ['carcajada', 2.7], ['burla', 2.4], ['puchero', 2.8], ['pillo', 2.6], ['susto', 2.2]
                    ].map(([n, d]) => Nailong3DAnimacion.hornear(THREE, m, n, d, 30));
                    Nailong3DAnimacion.crear(m, { ocio: false }).asentar(1.2);   // exporta en la pose de reposo
                    m.grupo.updateMatrixWorld(true);
                    const fin = () => { m.setEstilo(estiloPrevio); reanudar(); };
                    try {
                        new THREE.GLTFExporter().parse(m.grupo, (res) => {
                            fin();
                            resolver(new Blob([res], { type: 'model/gltf-binary' }));
                        }, (err) => { fin(); rechazar(err); }, { binary: true, animations: clips, onlyVisible: true });
                    } catch (e) { fin(); rechazar(e); }
                });
            }

            function esActivo3D() {
                try {
                    const s = window.location.search || '';
                    const h = window.location.hash || '';
                    if (/[\?&]3d(=[^\&]*)?(&|$)/i.test(s)) return true;
                    if (/#.*3d/i.test(h)) return true;
                } catch (_) {}
                return false;
            }

            function esDebug3D() {
                try {
                    return /[\?&]3d=debug(&|$)/i.test(window.location.search || '');
                } catch (_) {
                    return false;
                }
            }

            /* ---------- Panel flotante ligero ?3d=debug (solo se crea cuando la URL pide 3d=debug) ---------- */
            function clonarDatos(obj) {
                return JSON.parse(JSON.stringify(obj));
            }

            function construirFuenteKernel(anatomiaNueva) {
                const src = crearKernelGeometriaNailong.toString();
                const mezcla = '\n(function(dst,src){function f(a,b){for(const k in b){if(Array.isArray(b[k]))a[k]=b[k].slice();' +
                    'else if(b[k]&&typeof b[k]==="object"&&a[k]&&typeof a[k]==="object")f(a[k],b[k]);else a[k]=b[k];}}f(dst,src);})(ANATOMIA,' +
                    JSON.stringify(anatomiaNueva) + ');\n';
                return src.replace('const COLORES =', mezcla + 'const COLORES =');
            }

            function liberarModelo(modelo) {
                if (!modelo || !modelo.grupo) return;
                const geos = new Set();
                const mats = new Set();
                modelo.grupo.traverse((o) => {
                    if (o.geometry) geos.add(o.geometry);
                    if (o.material) {
                        if (Array.isArray(o.material)) o.material.forEach((m) => mats.add(m));
                        else mats.add(o.material);
                    }
                });
                geos.forEach((g) => { try { g.dispose(); } catch (_) {} });
                mats.forEach((m) => { try { m.dispose(); } catch (_) {} });
                if (modelo.texOjo && modelo.texOjo.dispose) { try { modelo.texOjo.dispose(); } catch (_) {} }
            }

            async function reconstruirConAnatomia(anatomiaNueva) {
                if (S.estado !== 'listo' || !S.escena || !window.THREE) return null;
                const t0 = performance.now();
                const fuente = construirFuenteKernel(anatomiaNueva);
                const celda = S.calidad === 'baja' ? 0.0105 : 0.0085;
                const mallas = await generarMallas([{ celda }, { celda: 0.026, sinColor: true }], fuente);
                const kernelNuevo = (new Function('return (' + fuente + ')()'))();
                Object.assign(Nailong3DGeometria, kernelNuevo);
                const estiloPrevio = S.modelo ? S.modelo.estilo : 'suave';
                const anterior = S.modelo;
                if (anterior && anterior.grupo) S.escena.remove(anterior.grupo);
                const nuevo = Nailong3DEscena.crearModelo(THREE, mallas[0], mallas[1]);
                if (estiloPrevio && estiloPrevio !== 'suave') nuevo.setEstilo(estiloPrevio);
                S.modelo = nuevo;
                S.escena.add(S.modelo.grupo);
                S.anim = Nailong3DAnimacion.crear(S.modelo, { reducido: S.reducido, alEvento: alEvento });
                S.anim.asentar(0.5);
                if (anterior) liberarModelo(anterior);
                renderizar();
                return { ms: Math.round(performance.now() - t0), vertices: mallas[0].estadisticas.vertices };
            }

            function montarPanelDebug() {
                if (!esDebug3D() || $('nailong-3d-debug-panel')) return;
                const baseOriginal = clonarDatos(Nailong3DGeometria.ANATOMIA);
                let borrador = clonarDatos(baseOriginal);
                const entradas = [];

                const crear = (tag, estilos, texto) => {
                    const el = document.createElement(tag);
                    if (estilos) Object.assign(el.style, estilos);
                    if (texto !== undefined) el.textContent = texto;
                    return el;
                };

                const raiz = crear('aside', {
                    position: 'fixed', right: '14px', bottom: '14px', zIndex: '9999',
                    width: '320px', maxWidth: 'calc(100vw - 28px)', maxHeight: '78vh',
                    display: 'flex', flexDirection: 'column',
                    background: '#FFFDF7', color: '#24292F',
                    border: '2px solid #D97706', borderRadius: '14px',
                    boxShadow: '0 10px 28px rgba(0,0,0,0.22)',
                    fontFamily: 'ui-monospace, Consolas, monospace', fontSize: '12px'
                });
                raiz.id = 'nailong-3d-debug-panel';

                const cab = crear('header', {
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 10px', background: '#FEF3C7', borderBottom: '1px solid #F59E0B',
                    borderRadius: '12px 12px 0 0', gap: '8px'
                });
                const tit = crear('strong', { fontSize: '12px', color: '#92400E' }, 'Nailong 3D Debug (?3d=debug)');
                const btnPlegar = crear('button', {
                    padding: '3px 8px', borderRadius: '6px', border: '1px solid #D97706',
                    background: '#FFFFFF', color: '#92400E', cursor: 'pointer', fontWeight: '700', fontSize: '11px'
                }, 'Plegar');
                btnPlegar.type = 'button';
                cab.appendChild(tit);
                cab.appendChild(btnPlegar);
                raiz.appendChild(cab);

                const cuerpo = crear('div', {
                    display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: '1 1 auto'
                });

                const barra = crear('div', {
                    display: 'flex', gap: '6px', padding: '8px 10px',
                    borderBottom: '1px solid #FDE68A', background: '#FFFBEB', flexWrap: 'wrap'
                });
                const estiloBtn = (bg, fg, bd) => ({
                    padding: '5px 9px', borderRadius: '7px', border: '1px solid ' + bd,
                    background: bg, color: fg, cursor: 'pointer', fontWeight: '700', fontSize: '11px'
                });
                const btnAplicar = crear('button', estiloBtn('#D97706', '#FFFFFF', '#B45309'), 'Aplicar');
                btnAplicar.type = 'button';
                const btnCopiar = crear('button', estiloBtn('#FFFFFF', '#1F2937', '#CBD5E1'), 'Copiar ANATOMIA');
                btnCopiar.type = 'button';
                const btnReset = crear('button', estiloBtn('#FFFFFF', '#991B1B', '#FCA5A5'), 'Reset');
                btnReset.type = 'button';
                const estadoTxt = crear('span', { width: '100%', fontSize: '11px', color: '#78350F', marginTop: '2px' }, 'Listo para ajustar parametros.');
                barra.appendChild(btnAplicar);
                barra.appendChild(btnCopiar);
                barra.appendChild(btnReset);
                barra.appendChild(estadoTxt);
                cuerpo.appendChild(barra);

                const lista = crear('div', { overflowY: 'auto', padding: '6px 10px 10px', flex: '1 1 auto' });

                const definirBloques = (an) => {
                    const bloques = [];
                    const elip = (clave, nombre) => {
                        if (!an[clave] || !an[clave].c || !an[clave].r) return;
                        const campos = [
                            ['c', 1, 'cy', -0.1, 1.05], ['c', 2, 'cz', -0.35, 0.35],
                            ['r', 0, 'rx', 0.03, 0.40], ['r', 1, 'ry', 0.03, 0.40], ['r', 2, 'rz', 0.03, 0.40]
                        ];
                        if (an[clave].c[0] !== 0) campos.unshift(['c', 0, 'cx', 0.0, 0.48]);
                        bloques.push({ clave, nombre, campos });
                    };
                    const cono = (clave, nombre) => {
                        if (!an[clave] || !an[clave].a || !an[clave].b) return;
                        const campos = [
                            ['a', 0, 'ax', 0.0, 0.45], ['a', 1, 'ay', 0.0, 0.70], ['a', 2, 'az', -0.45, 0.35],
                            ['b', 0, 'bx', 0.0, 0.55], ['b', 1, 'by', 0.0, 0.70], ['b', 2, 'bz', -0.65, 0.35],
                            ['ra', null, 'ra', 0.02, 0.20], ['rb', null, 'rb', 0.015, 0.16]
                        ];
                        if (Array.isArray(an[clave].m)) {
                            campos.splice(6, 0, ['m', 1, 'my', 0.0, 0.60], ['m', 2, 'mz', -0.55, 0.25]);
                            if (typeof an[clave].rm === 'number') campos.push(['rm', null, 'rm', 0.02, 0.16]);
                        }
                        if (Array.isArray(an[clave].codo)) {
                            campos.splice(6, 0, ['codo', 0, 'cx', 0.0, 0.50], ['codo', 1, 'cy', 0.0, 0.65], ['codo', 2, 'cz', -0.35, 0.35]);
                        }
                        bloques.push({ clave, nombre, campos });
                    };
                    elip('craneo', 'Craneo');
                    elip('frente', 'Frente');
                    elip('mofletes', 'Mofletes');
                    elip('hocico', 'Hocico');
                    elip('pecho', 'Pecho');
                    elip('caderas', 'Caderas');
                    elip('barriga', 'Barriga');
                    cono('brazo', 'Brazo');
                    elip('mano', 'Mano');
                    cono('pierna', 'Pierna');
                    elip('pie', 'Pie');
                    cono('cola', 'Cola');
                    if (an.pancita) {
                        bloques.push({
                            clave: 'pancita', nombre: 'Pancita',
                            campos: [
                                ['cy', null, 'cy', 0.10, 0.45], ['rx', null, 'rx', 0.08, 0.30], ['ry', null, 'ry', 0.08, 0.30],
                                ['nucleo', null, 'nucleo', 0.40, 1.10], ['falda', null, 'falda', 0.90, 1.60]
                            ]
                        });
                    }
                    if (an.k) {
                        const kCampos = ['cabeza', 'torso', 'barriga', 'cuello', 'cuelloEspalda', 'hombro', 'brazo', 'pierna', 'cola']
                            .filter((ck) => typeof an.k[ck] === 'number')
                            .map((ck) => [ck, null, ck, 0.008, 0.18]);
                        bloques.push({ clave: 'k', nombre: 'Fusiones (k)', campos: kCampos });
                    }
                    return bloques;
                };

                const leerValor = (obj, clave, prop, idx) => (idx === null ? obj[clave][prop] : obj[clave][prop][idx]);
                const escribirValor = (obj, clave, prop, idx, val) => {
                    if (idx === null) obj[clave][prop] = val;
                    else obj[clave][prop][idx] = val;
                };

                definirBloques(borrador).forEach((bl, bi) => {
                    const det = crear('details', {
                        borderBottom: '1px solid #F3F4F6', padding: '4px 0'
                    });
                    if (bi < 2) det.open = true;
                    const sum = crear('summary', {
                        cursor: 'pointer', fontWeight: '700', color: '#92400E', padding: '3px 0', userSelect: 'none'
                    }, bl.nombre);
                    det.appendChild(sum);

                    bl.campos.forEach(([prop, idx, etiq, mn, mx]) => {
                        const vIni = leerValor(borrador, bl.clave, prop, idx);
                        if (typeof vIni !== 'number') return;
                        const minR = Math.min(mn, vIni - 0.1);
                        const maxR = Math.max(mx, vIni + 0.1);

                        const fila = crear('label', {
                            display: 'grid', gridTemplateColumns: '56px 1fr 48px',
                            alignItems: 'center', gap: '6px', margin: '4px 0'
                        });
                        const nom = crear('span', { color: '#4B5563' }, etiq);
                        const rango = document.createElement('input');
                        rango.type = 'range';
                        rango.min = String(Math.round(minR * 1000) / 1000);
                        rango.max = String(Math.round(maxR * 1000) / 1000);
                        rango.step = '0.002';
                        rango.value = String(vIni);
                        rango.style.width = '100%';
                        rango.style.accentColor = '#D97706';
                        const num = crear('span', { textAlign: 'right', color: '#111827', fontVariantNumeric: 'tabular-nums' }, vIni.toFixed(3));

                        rango.addEventListener('input', () => {
                            const v = Math.round(parseFloat(rango.value) * 1000) / 1000;
                            escribirValor(borrador, bl.clave, prop, idx, v);
                            num.textContent = v.toFixed(3);
                        });
                        entradas.push({ rango, num, clave: bl.clave, prop, idx });
                        fila.appendChild(nom);
                        fila.appendChild(rango);
                        fila.appendChild(num);
                        det.appendChild(fila);
                    });

                    lista.appendChild(det);
                });

                cuerpo.appendChild(lista);
                raiz.appendChild(cuerpo);
                document.body.appendChild(raiz);

                let plegado = false;
                btnPlegar.addEventListener('click', () => {
                    plegado = !plegado;
                    cuerpo.style.display = plegado ? 'none' : 'flex';
                    btnPlegar.textContent = plegado ? 'Abrir' : 'Plegar';
                });

                const ejecutarAplicar = async () => {
                    btnAplicar.disabled = true;
                    btnReset.disabled = true;
                    estadoTxt.textContent = 'Regenerando malla en Worker...';
                    try {
                        const info = await reconstruirConAnatomia(borrador);
                        if (info) estadoTxt.textContent = 'Aplicado: ' + info.vertices + ' verts en ' + info.ms + ' ms';
                        else estadoTxt.textContent = 'Visor no listo todavia.';
                    } catch (err) {
                        console.warn('[Nailong 3D debug]', err);
                        estadoTxt.textContent = 'Error al reconstruir: ' + (err.message || err);
                    } finally {
                        btnAplicar.disabled = false;
                        btnReset.disabled = false;
                    }
                };

                btnAplicar.addEventListener('click', ejecutarAplicar);

                btnReset.addEventListener('click', () => {
                    borrador = clonarDatos(baseOriginal);
                    entradas.forEach((e) => {
                        const v = leerValor(borrador, e.clave, e.prop, e.idx);
                        e.rango.value = String(v);
                        e.num.textContent = v.toFixed(3);
                    });
                    ejecutarAplicar();
                });

                btnCopiar.addEventListener('click', async () => {
                    const texto = 'const ANATOMIA = ' + JSON.stringify(borrador, null, 4) + ';';
                    let copiado = false;
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        try { await navigator.clipboard.writeText(texto); copiado = true; } catch (_) {}
                    }
                    if (!copiado) {
                        const ta = document.createElement('textarea');
                        ta.value = texto;
                        ta.style.position = 'fixed';
                        ta.style.opacity = '0';
                        document.body.appendChild(ta);
                        ta.select();
                        try { copiado = document.execCommand('copy'); } catch (_) {}
                        ta.remove();
                    }
                    estadoTxt.textContent = copiado ? 'ANATOMIA copiada al portapapeles.' : 'No se pudo copiar; ver consola.';
                    if (!copiado) console.log(texto);
                });
            }

            /* ---------- Inicio: carga perezosa y pausa fuera de pantalla ---------- */
            function iniciar() {
                if (S.iniciado) return;
                S.contenedor = $('nailong-3d-visor');
                S.lienzo = $('nailong-3d-lienzo');
                if (!S.contenedor || !S.lienzo) return;
                S.iniciado = true;
                document.body.classList.add('n3d-ver');
                const sec = $('nailong-3d');
                const esInmediato3D = esActivo3D();
                if (esInmediato3D && sec && (window.location.hash.toLowerCase().includes('3d') || window.location.search.toLowerCase().includes('3d'))) {
                    setTimeout(() => sec.scrollIntoView({ behavior: 'smooth', block: 'start' }), 250);
                }
                const mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
                S.reducido = !!(mq && mq.matches);
                if (mq && mq.addEventListener) mq.addEventListener('change', (e) => { S.reducido = e.matches; if (S.anim) S.anim.reducido = e.matches; });

                const cargar = $('nailong-3d-cargar');
                if (cargar) cargar.addEventListener('click', () => { if (S.estado === 'perdido') location.reload(); else arrancar(); });
                document.querySelectorAll('[data-n3d-accion]').forEach((b) => b.addEventListener('click', () => accion(b.getAttribute('data-n3d-accion'))));
                document.querySelectorAll('[data-n3d-estilo]').forEach((b) => b.addEventListener('click', () => estilo(b.getAttribute('data-n3d-estilo'))));
                const enlazar = (id, f) => { const b = $(id); if (b) b.addEventListener('click', f); };
                enlazar('nailong-3d-recentrar', recentrar);
                enlazar('nailong-3d-pantalla', () => cuandoListo(pantallaCompleta));
                enlazar('nailong-3d-foto', foto);
                enlazar('nailong-3d-glb', descargarGLB);
                enlazar('nailong-3d-sticker', descargarSticker);
                document.addEventListener('fullscreenchange', actualizarBotonPantalla);
                document.addEventListener('webkitfullscreenchange', actualizarBotonPantalla);
                window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && S.pantallaCSS) pantallaCompleta(); });
                document.addEventListener('visibilitychange', () => { if (document.hidden) pausar(); else reanudar(); });

                if (esInmediato3D) {
                    S.visible = true;
                    if (esDebug3D()) cuandoListo(montarPanelDebug);
                    else arrancar();
                } else if ('IntersectionObserver' in window) {
                    // Se descarga cuando falta poco para verlo…
                    const cerca = new IntersectionObserver((entradas) => {
                        if (entradas.some((e) => e.isIntersecting)) { cerca.disconnect(); arrancar(); }
                    }, { rootMargin: '600px 0px' });
                    cerca.observe(S.contenedor);
                    // …y solo se anima mientras está en pantalla
                    new IntersectionObserver((entradas) => {
                        entradas.forEach((e) => { S.visible = e.isIntersecting; if (S.visible) reanudar(); else pausar(); });
                    }, { threshold: 0.01 }).observe(S.contenedor);
                } else {
                    S.visible = true;
                    arrancar();
                }
            }

            return {
                iniciar, accion, estilo, recentrar, pantallaCompleta, foto, descargarGLB, descargarSticker, exportarStickerWebP,
                // Para pruebas automáticas (Playwright) y depuración en consola
                depurar: {
                    estado: () => ({ estado: S.estado, calidad: S.calidad, ratio: S.ratio, visible: S.visible, anim: S.anim ? S.anim.estado() : null, estilo: S.modelo ? S.modelo.estilo : null, reducido: S.reducido }),
                    tocarRegion: (region) => cuandoListo(() => reaccionar(region, null)),
                    exportarGLB: () => exportarGLB(),
                    exportarStickerWebP: () => exportarStickerWebP(),
                    reconstruirAnatomia: (anatomia) => reconstruirConAnatomia(anatomia),
                    s: S
                }
            };
        })();

        window.addEventListener('hashchange', () => {
            if (!document.body.classList.contains('n3d-ver')) {
                Nailong3DVisor.iniciar();
            }
        });
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', Nailong3DVisor.iniciar);
        else Nailong3DVisor.iniciar();
