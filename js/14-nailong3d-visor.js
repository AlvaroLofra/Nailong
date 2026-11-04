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
                siesta: 'Nailong se echa una siesta', pancita: 'Cosquillas en la pancita', mimos: 'Mimos en la cabeza', colita: 'Nailong mueve la colita',
                saltito: 'Nailong da un saltito', despertar: 'Nailong se despierta'
            };
            const SONIDOS = { saludar: 'laugh', duang: 'duang', sorpresa: 'surprise', siesta: 'sleep', pancita: 'duang', mimos: 'pop', colita: 'tail', saltito: 'pop', despertar: 'surprise' };

            const S = {
                estado: 'inactivo', contenedor: null, lienzo: null, renderer: null, escena: null, camara: null, controles: null,
                modelo: null, anim: null, estudio: null, visible: false, raf: 0, ultimo: 0, mediaFrame: 16, ratio: 1, ratioMax: 2,
                calidad: 'alta', reducido: false, pendientes: [], puntero: null, mirarHasta: 0, ultimoToque: null, pantallaCSS: false
            };
            const cargas = {};
            const $ = (id) => document.getElementById(id);

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
            function generarMallas(pedidos) {
                const enHilo = () => pedidos.map((p) => Nailong3DGeometria.generarMalla(p));
                if (!window.Worker || !window.Blob || typeof crearKernelGeometriaNailong !== 'function') return Promise.resolve(enHilo());
                return new Promise((resolver) => {
                    let url = null, w = null, hecho = false;
                    const terminar = (res) => { if (hecho) return; hecho = true; if (w) w.terminate(); if (url) URL.revokeObjectURL(url); resolver(res); };
                    try {
                        const fuente = 'const K = (' + crearKernelGeometriaNailong.toString() + ')();\n' +
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
                    const mallasP = generarMallas([{ celda: S.calidad === 'baja' ? 0.0105 : 0.0085 }, { celda: 0.026, sinColor: true }]);
                    await cargarScript('three');
                    await cargarScript('orbita');
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
                else if (nombre === 'brazoIzq' || nombre === 'brazoDer') region = nombre;
                else if (nombre === 'piernaIzq' || nombre === 'piernaDer') region = 'pie';
                else if (nombre === 'cola' || nombre === 'colaPunta') region = 'cola';
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
                    else if (e.key === 'Enter' || e.key === ' ') { reaccionar('pancita', new THREE.Vector3(0, 0.27, 0.27)); }
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

            function alEvento(tipo, dato) {
                if (tipo === 'sonido') { if (S.anim && S.anim.estado().accion !== 'intro') sonar(dato); }
                else if (tipo === 'texto') burbuja(dato, S.ultimoToque);
                else if (tipo === 'zzz') burbuja('Zzz…', null, true);
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

            // GLB con piel, esqueleto, accesorios, materiales PBR y 5 clips horneados del mismo animador
            function exportarGLB() {
                return new Promise((resolver, rechazar) => {
                    const m = S.modelo, estiloPrevio = m.estilo;
                    pausar();
                    m.setEstilo('exportar');
                    const clips = [['reposo', 3.3], ['saludar', 2.6], ['duang', 1.5], ['bailar', 5.4], ['sorpresa', 2.3]]
                        .map(([n, d]) => Nailong3DAnimacion.hornear(THREE, m, n, d, 30));
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

            /* ---------- Inicio: carga perezosa y pausa fuera de pantalla ---------- */
            function iniciar() {
                S.contenedor = $('nailong-3d-visor');
                S.lienzo = $('nailong-3d-lienzo');
                if (!S.contenedor || !S.lienzo) return;
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
                document.addEventListener('fullscreenchange', actualizarBotonPantalla);
                document.addEventListener('webkitfullscreenchange', actualizarBotonPantalla);
                window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && S.pantallaCSS) pantallaCompleta(); });
                document.addEventListener('visibilitychange', () => { if (document.hidden) pausar(); else reanudar(); });

                if ('IntersectionObserver' in window) {
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
                iniciar, accion, estilo, recentrar, pantallaCompleta, foto, descargarGLB,
                // Para pruebas automáticas (Playwright) y depuración en consola
                depurar: {
                    estado: () => ({ estado: S.estado, calidad: S.calidad, ratio: S.ratio, visible: S.visible, anim: S.anim ? S.anim.estado() : null, estilo: S.modelo ? S.modelo.estilo : null, reducido: S.reducido }),
                    tocarRegion: (region) => cuandoListo(() => reaccionar(region, null)),
                    exportarGLB: () => exportarGLB(),
                    s: S
                }
            };
        })();

        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', Nailong3DVisor.iniciar);
        else Nailong3DVisor.iniciar();
