        /* ==============================================================
           17. NAILONG 3D · ANIMACIÓN PROCEDURAL (muelles, reposo, acciones)
           Todo se calcula con muelles amortiguados a paso fijo: el mismo código
           mueve el visor en vivo y «hornea» los clips que se exportan al GLB.
        ============================================================== */
        const Nailong3DAnimacion = (function () {
            'use strict';
            const PASO = 1 / 120;
            const TAU = Math.PI * 2;

            // Canales animables: [valor neutro, frecuencia (Hz), amortiguación]
            const CANALES = {
                saltoY: [0, 9, 0.85], aplastar: [1, 4.2, 0.32], incX: [0, 3.2, 0.45], incZ: [0, 3.2, 0.42], girY: [0, 2.4, 0.8],
                cadZ: [0, 3, 0.6], cabX: [0, 3, 0.55], cabY: [0, 2.6, 0.7], cabZ: [0, 3, 0.5],
                bIX: [0, 3.4, 0.6], bIY: [0, 3.4, 0.6], bIZ: [0, 3.4, 0.55], bDX: [0, 3.4, 0.6], bDY: [0, 3.4, 0.6], bDZ: [0, 3.4, 0.55],
                pIX: [0, 5, 0.7], pDX: [0, 5, 0.7], colaY: [0, 3.5, 0.35], colaX: [0, 3, 0.6],
                barriga: [0, 3.6, 0.22], pecho: [0, 3, 0.5],
                parpSup: [0.44, 9, 0.9], parpInf: [-0.74, 9, 0.9], ojoAbre: [1, 6, 0.6],
                bocaAbre: [0.12, 7, 0.8], bocaSonrisa: [0.75, 6, 0.85], bocaRedonda: [0, 6, 0.85], bocaDientes: [0, 6, 0.9]
            };
            // Pose visible de los brazos (el modelo se genera en «A»)
            const BRAZO_NEUTRO = { x: -0.44, y: 0.36, z: -0.74 };
            const PARPADO_CERRADO = -0.06;

            function aleatorio(semilla) {   // mulberry32: reproducible al hornear
                let a = semilla >>> 0;
                return function () {
                    a |= 0; a = a + 0x6D2B79F5 | 0;
                    let t = Math.imul(a ^ a >>> 15, 1 | a);
                    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
                    return ((t ^ t >>> 14) >>> 0) / 4294967296;
                };
            }
            const suave = (x) => { const t = Math.min(Math.max(x, 0), 1); return t * t * (3 - 2 * t); };
            const campana = (t, a, b) => suave((t - a) / 0.12) * (1 - suave((t - b) / 0.18));

            /* ---------- Acciones: función del tiempo → objetivos de los canales ---------- */
            const ACCIONES = {
                intro: {
                    duracion: 1.1,
                    f(t, o, A) {
                        const caida = 0.34;
                        if (t < caida) { const u = t / caida; return { saltoY: 0.42 * (1 - u * u), aplastar: 1.07, bIZ: 0.5, bDZ: -0.5, parpSup: 0.7 }; }
                        if (!A.marcas.aterriza) { A.marcas.aterriza = true; A.impulso('aplastar', -2.6); A.impulso('barriga', 2.2); A.evento('sonido', 'pop'); }
                        return { bocaAbre: 0.35, bocaSonrisa: 1 };
                    }
                },
                saludar: {
                    duracion: 2.6,
                    f(t, o) {
                        const izq = !o || o.lado !== 'der';
                        const sube = campana(t, 0.0, 2.2);
                        const ola = Math.sin(t * TAU * 2.6) * 0.34 * sube;
                        const r = { cabZ: (izq ? -0.12 : 0.12) * sube, cabX: -0.05 * sube, parpInf: -0.74 + 0.32 * sube, bocaAbre: 0.12 + 0.38 * sube, bocaSonrisa: 1, incZ: (izq ? -0.04 : 0.04) * sube };
                        if (izq) { r.bIZ = 2.05 * sube + ola; r.bIX = 0.35 * sube; r.bIY = -0.3 * sube; }
                        else { r.bDZ = -2.05 * sube - ola; r.bDX = 0.35 * sube; r.bDY = 0.3 * sube; }
                        r.colaY = Math.sin(t * TAU * 1.3) * 0.25 * sube;
                        return r;
                    }
                },
                duang: {
                    duracion: 1.5,
                    f(t, o, A) {
                        if (t < 0.15) return { aplastar: 0.84, bIZ: -0.15, bDZ: 0.15, bocaRedonda: 0.6, bocaAbre: 0.4 };
                        if (t < 0.62) {
                            const u = (t - 0.15) / 0.47;
                            if (!A.marcas.salta) { A.marcas.salta = true; A.impulso('aplastar', 2.4); }
                            return { saltoY: A.reducido ? 0.02 : 0.15 * 4 * u * (1 - u), aplastar: 1.09, bIZ: 1.15, bDZ: -1.15, bIX: -0.3, bDX: -0.3, bocaRedonda: 1, bocaAbre: 0.85, parpSup: 0.75, ojoAbre: 1.06, colaX: -0.35 };
                        }
                        if (!A.marcas.cae) { A.marcas.cae = true; A.impulso('aplastar', -3.2); A.impulso('barriga', 3.4); A.impulso('cabX', 1.6); A.evento('texto', '¡Duang!'); }
                        return { bocaAbre: 0.5, bocaSonrisa: 1, parpInf: -0.4, bocaDientes: 0.6 };
                    }
                },
                bailar: {
                    duracion: 5.4,
                    f(t, o, A) {
                        const pulso = 1.55, fase = t * TAU * pulso / 2;
                        const env = campana(t, 0, 5.0);
                        const golpe = Math.abs(Math.sin(fase));
                        const n = Math.floor(t * pulso);
                        if (n !== A.marcas.compas && t < 5.0) { A.marcas.compas = n; A.evento('sonido', 'maracas'); }
                        return {
                            saltoY: A.reducido ? 0 : 0.035 * golpe * env, incZ: Math.sin(fase) * 0.14 * env, girY: Math.sin(fase * 0.5) * 0.35 * env,
                            cadZ: -Math.sin(fase) * 0.1 * env, cabZ: Math.sin(fase + 0.6) * 0.16 * env, cabX: -0.06 * golpe * env,
                            bIZ: (1.25 + Math.sin(fase) * 0.85) * env, bDZ: -(1.25 - Math.sin(fase) * 0.85) * env, bIX: -0.4 * env, bDX: -0.4 * env,
                            pIX: Math.max(0, Math.sin(fase)) * -0.3 * env, pDX: Math.max(0, -Math.sin(fase)) * -0.3 * env,
                            colaY: Math.sin(fase * 2) * 0.5 * env, parpInf: -0.74 + 0.36 * env, bocaAbre: 0.12 + 0.4 * env, bocaSonrisa: 1, bocaDientes: 0.5 * env
                        };
                    }
                },
                sorpresa: {
                    duracion: 2.3,
                    f(t, o, A) {
                        if (!A.marcas.salto) { A.marcas.salto = true; A.impulso('incX', -1.6); A.impulso('aplastar', 1.8); A.impulso('barriga', 1.5); A.evento('texto', '¡Uoooh!'); }
                        const env = campana(t, 0, 1.9);
                        return {
                            saltoY: A.reducido ? 0 : 0.03 * campana(t, 0, 0.25), incX: -0.08 * env,
                            bIX: -1.73 * env, bIY: -1.42 * env, bIZ: -0.19 * env, bDX: -1.73 * env, bDY: 1.42 * env, bDZ: 0.19 * env,   // patitas a los mofletes (sticker 19)
                            parpSup: 0.44 + 0.38 * env, parpInf: -0.74 - 0.22 * env, ojoAbre: 1 + 0.08 * env,
                            bocaRedonda: env, bocaAbre: 0.12 + 0.75 * env, bocaSonrisa: 0.75 - 0.75 * env, cabX: -0.08 * env
                        };
                    }
                },
                siesta: {
                    duracion: Infinity,
                    f(t, o, A) {
                        const env = suave(t / 1.2);
                        if (Math.floor(t / 3.2) !== A.marcas.zzz && t > 1) { A.marcas.zzz = Math.floor(t / 3.2); A.evento('zzz'); }
                        return {
                            parpSup: 0.44 + (PARPADO_CERRADO - 0.44) * env, parpInf: -0.74 + (PARPADO_CERRADO + 0.03 + 0.74) * env,
                            cabX: 0.2 * env, cabZ: 0.14 * env, incZ: 0.04 * env, bIZ: -0.12 * env, bDZ: 0.12 * env, bIX: 0.15 * env, bDX: 0.15 * env,
                            bocaAbre: 0.12 + 0.18 * env, bocaRedonda: 0.6 * env, bocaSonrisa: 0.75 - 0.6 * env
                        };
                    }
                },
                mimos: {
                    duracion: 1.6,
                    f(t, o) {
                        const env = campana(t, 0, 1.3), lado = (o && o.lado) || 1;
                        return { cabZ: 0.2 * lado * env, cabX: -0.06 * env, parpSup: 0.44 - 0.3 * env, parpInf: -0.74 + 0.62 * env, bocaAbre: 0.12 + 0.3 * env, bocaSonrisa: 1, bIZ: 0.3 * env, bDZ: -0.3 * env, colaY: Math.sin(t * 14) * 0.3 * env };
                    }
                },
                pancita: {
                    duracion: 1.2,
                    f(t, o, A) {
                        if (!A.marcas.ok) { A.marcas.ok = true; A.impulso('barriga', 4.2); A.impulso('aplastar', -1.8); A.impulso('incX', 0.9); A.evento('texto', '¡Duang!'); }
                        const env = campana(t, 0, 0.9);
                        return { parpSup: 0.44 - 0.2 * env, parpInf: -0.74 + 0.5 * env, bocaAbre: 0.12 + 0.55 * env, bocaSonrisa: 1, bocaDientes: 0.7 * env, bIZ: -0.2 * env, bDZ: 0.2 * env, bIX: -0.35 * env, bDX: -0.35 * env };
                    }
                },
                colita: {
                    duracion: 1.4,
                    f(t) {
                        const env = campana(t, 0, 1.1);
                        return { colaY: Math.sin(t * TAU * 3.2) * 0.65 * env, colaX: -0.2 * env, girY: 0.12 * env, cabY: 0.45 * env, cabZ: -0.08 * env, parpInf: -0.74 + 0.3 * env, bocaAbre: 0.3 * env, bocaSonrisa: 1 };
                    }
                },
                saltito: {
                    duracion: 0.9,
                    f(t, o, A) {
                        if (t < 0.4) { const u = t / 0.4; return { saltoY: A.reducido ? 0 : 0.07 * 4 * u * (1 - u), pIX: -0.25, pDX: -0.25, aplastar: 1.05, bIZ: 0.4, bDZ: -0.4 }; }
                        if (!A.marcas.cae) { A.marcas.cae = true; A.impulso('aplastar', -2); A.impulso('barriga', 1.6); }
                        return { bocaAbre: 0.3, bocaSonrisa: 1 };
                    }
                },
                despertar: {
                    duracion: 1.4,
                    f(t, o, A) {
                        if (!A.marcas.ok) { A.marcas.ok = true; A.impulso('aplastar', 1.6); A.impulso('cabX', -1.4); }
                        const env = campana(t, 0, 1.0);
                        return { parpSup: 0.44 + 0.3 * env, ojoAbre: 1 + 0.06 * env, bocaRedonda: 0.8 * env, bocaAbre: 0.12 + 0.5 * env, bIZ: 0.5 * env, bDZ: -0.5 * env };
                    }
                },
                mirarAlrededor: {
                    duracion: 3.2,
                    f(t) {
                        const env = campana(t, 0, 2.8);
                        return { cabY: Math.sin(t * TAU / 3.0) * 0.4 * env, cabZ: Math.sin(t * TAU / 3.0) * 0.06 * env, colaY: Math.sin(t * 6) * 0.15 * env };
                    }
                }
            };

            function crear(modelo, opciones) {
                const op = opciones || {};
                const huesos = modelo.huesos;
                const azar = aleatorio(op.semilla || 7);
                const m = {};
                Object.keys(CANALES).forEach((k) => {
                    const [v, f, z] = CANALES[k];
                    m[k] = { v, vel: 0, obj: v, w: TAU * f, z };
                });
                const A = {
                    reducido: !!op.reducido, marcas: {}, tiempo: 0,
                    impulso(canal, vel) { if (m[canal]) m[canal].vel += vel * (A.reducido ? 0.35 : 1); },
                    evento(tipo, dato) { if (op.alEvento) op.alEvento(tipo, dato); }
                };
                let accion = null, tAccion = 0, opAccion = null;
                let parpadeo = 0, proxParpadeo = 1.5 + azar() * 2, dobleParpadeo = false, tParpadeo = -1;
                let proxOcio = 9 + azar() * 6;
                let acumulado = 0;
                const toques = [0, 1, 2, 3].map(() => ({ x: 0, y: -5, z: 0, v: 0, vel: 0 }));
                let toqueSig = 0;
                const mirada = { yaw: 0, pitch: 0 };
                let mirarObjetivo = null, vOjo = null;
                const tmp = {};

                function iniciar(nombre, o) {
                    if (!ACCIONES[nombre]) return false;
                    accion = nombre; tAccion = 0; opAccion = o || null; A.marcas = {};
                    A.evento('accion', nombre);
                    return true;
                }

                function objetivos() {
                    Object.keys(CANALES).forEach((k) => { tmp[k] = CANALES[k][0]; });
                    if (accion) {
                        const def = ACCIONES[accion];
                        Object.assign(tmp, def.f(tAccion, opAccion, A));
                    }
                    Object.keys(tmp).forEach((k) => { if (m[k]) m[k].obj = tmp[k]; });
                }

                function pasoFijo(dt) {
                    A.tiempo += dt;
                    if (accion) {
                        tAccion += dt;
                        if (tAccion >= ACCIONES[accion].duracion) { accion = null; A.marcas = {}; }
                    }
                    objetivos();
                    Object.keys(m).forEach((k) => {
                        const c = m[k];
                        const a = c.w * c.w * (c.obj - c.v) - 2 * c.z * c.w * c.vel;
                        c.vel += a * dt; c.v += c.vel * dt;
                    });
                    // Parpadeo aleatorio (a veces doble)
                    if (tParpadeo >= 0) {
                        tParpadeo += dt;
                        const d = 0.16;
                        parpadeo = tParpadeo < d / 2 ? tParpadeo / (d / 2) : Math.max(0, 1 - (tParpadeo - d / 2) / (d / 2));
                        if (tParpadeo >= d) {
                            tParpadeo = -1; parpadeo = 0;
                            if (dobleParpadeo) { dobleParpadeo = false; proxParpadeo = 0.12; }
                            else proxParpadeo = 2.2 + azar() * 3.6;
                        }
                    } else if (accion !== 'siesta') {
                        proxParpadeo -= dt;
                        if (proxParpadeo <= 0) { tParpadeo = 0; dobleParpadeo = azar() < 0.22; }
                    }
                    // Pequeñas travesuras cuando se aburre
                    if (!accion && op.ocio !== false) {
                        proxOcio -= dt;
                        if (proxOcio <= 0) { proxOcio = 10 + azar() * 8; iniciar(azar() < 0.6 ? 'mirarAlrededor' : 'colita', null); }
                    }
                    // Abolladuras: muelle subamortiguado (se hunde y rebota como gelatina)
                    toques.forEach((q) => {
                        const w = TAU * 5.5, z = 0.18;
                        const a = -w * w * q.v - 2 * z * w * q.vel;
                        q.vel += a * dt; q.v += q.vel * dt;
                    });
                }

                function aplicar() {
                    const g = (k) => m[k].v;
                    const t = A.tiempo;
                    const amp = A.reducido ? 0.5 : 1;
                    const respira = Math.sin(t * TAU / (accion === 'siesta' ? 4.2 : 3.3));
                    const ocio = accion === 'bailar' ? 0.3 : 1;
                    const R = (b) => b.userData.reposo;
                    // Raíz: salto, aplastamiento con volumen constante e inclinación desde el suelo
                    const raiz = huesos.raiz;
                    const s = Math.max(0.6, g('aplastar'));
                    raiz.position.set(R(raiz).p.x, R(raiz).p.y + Math.max(0, g('saltoY')), R(raiz).p.z);
                    raiz.scale.set(1 / Math.sqrt(s), s, 1 / Math.sqrt(s));
                    raiz.rotation.set(g('incX') + 0.01 * Math.sin(t * TAU / 6.1) * amp * ocio, g('girY') + 0.035 * Math.sin(t * TAU / 7.3) * amp * ocio, g('incZ') + 0.018 * Math.sin(t * TAU / 5.2) * amp * ocio);
                    huesos.cadera.rotation.set(0, 0, g('cadZ'));
                    huesos.tronco.rotation.set(0, 0, -g('incZ') * 0.25);
                    const pe = 1 + 0.006 * respira * amp + g('pecho');
                    huesos.pecho.scale.set(1 + 0.004 * respira * amp, pe, 1 + 0.004 * respira * amp);
                    huesos.cabeza.rotation.set(g('cabX') + 0.02 * respira * amp + mirada.pitch * 0.35, g('cabY') + mirada.yaw * 0.4, g('cabZ'));
                    const b = g('barriga') * 0.06 + 0.024 * respira * amp * (accion === 'siesta' ? 1.8 : 1);
                    huesos.barriga.scale.set(1 + b * 0.55, 1 + b * 0.3, 1 + b);
                    // Brazos: pose visible + canales (y un vaivén leve al respirar)
                    const vaiven = 0.03 * respira * amp * ocio;
                    huesos.brazoIzq.rotation.set(BRAZO_NEUTRO.x + g('bIX'), BRAZO_NEUTRO.y + g('bIY'), BRAZO_NEUTRO.z + g('bIZ') + vaiven);
                    huesos.brazoDer.rotation.set(BRAZO_NEUTRO.x + g('bDX'), -BRAZO_NEUTRO.y + g('bDY'), -BRAZO_NEUTRO.z + g('bDZ') - vaiven);
                    huesos.piernaIzq.rotation.set(g('pIX'), 0, 0);
                    huesos.piernaDer.rotation.set(g('pDX'), 0, 0);
                    const meneo = 0.06 * Math.sin(t * TAU / 2.6) * amp;
                    huesos.cola.rotation.set(g('colaX'), g('colaY') + meneo, 0);
                    huesos.colaPunta.rotation.set(g('colaX') * 0.5, (g('colaY') + meneo) * 0.8, 0);
                    // Ojos: mirada (solo el globo gira), párpados y apertura
                    const sup = g('parpSup'), inf = g('parpInf');
                    const cierre = Math.max(parpadeo, 0);
                    const centro = (sup + inf) / 2 * 0.3 + PARPADO_CERRADO * 0.7;
                    modelo.ojos.forEach((o) => {
                        o.globo.rotation.set(mirada.pitch * 0.65, mirada.yaw * 0.6, 0);
                        o.globo.scale.setScalar(g('ojoAbre'));
                        o.sup.rotation.x = -(sup + (centro - sup) * cierre);
                        o.inf.rotation.x = -(inf + (centro + 0.04 - inf) * cierre);
                    });
                    // Boca (solo se recalcula si cambia)
                    const forma = { abierta: g('bocaAbre'), sonrisa: g('bocaSonrisa'), redonda: Math.min(1, Math.max(0, g('bocaRedonda'))), dientes: Math.min(1, Math.max(0, g('bocaDientes'))) };
                    const f0 = modelo.boca.forma;
                    if (Math.abs(f0.abierta - forma.abierta) + Math.abs(f0.sonrisa - forma.sonrisa) + Math.abs(f0.redonda - forma.redonda) + Math.abs(f0.dientes - forma.dientes) > 0.004) modelo.boca.actualizar(forma);
                    // Abolladuras al shader
                    if (modelo.uniformes) {
                        toques.forEach((q, i) => modelo.uniformes.uToque.value[i].set(q.x, q.y, q.z, q.v));
                    }
                }

                function actualizarMirada(dt) {
                    let yaw = 0, pitch = 0;
                    if (mirarObjetivo && modelo.ojos[0]) {
                        const cab = huesos.pecho;
                        const local = cab.worldToLocal(mirarObjetivo.clone());
                        if (!vOjo) vOjo = local.clone();
                        vOjo.copy(huesos.cabeza.position);
                        vOjo.y += 0.24; vOjo.z += 0.166;   // entre los ojos, en el espacio del pecho
                        const d = local.sub(vOjo);
                        yaw = Math.atan2(d.x, d.z);
                        pitch = -Math.atan2(d.y, Math.hypot(d.x, d.z));
                        yaw = Math.max(-0.75, Math.min(0.75, yaw));
                        pitch = Math.max(-0.5, Math.min(0.5, pitch));
                    }
                    const k = 1 - Math.exp(-dt * 10);
                    mirada.yaw += (yaw - mirada.yaw) * k;
                    mirada.pitch += (pitch - mirada.pitch) * k;
                }

                const api = {
                    actualizar(dt, ctx) {
                        mirarObjetivo = ctx && ctx.mirar ? ctx.mirar : null;
                        acumulado += Math.min(dt, 0.1);
                        let n = 0;
                        while (acumulado >= PASO && n < 24) { pasoFijo(PASO); acumulado -= PASO; n++; }
                        actualizarMirada(Math.min(dt, 0.1));
                        aplicar();
                    },
                    accion(nombre, o) {
                        if (accion === 'siesta' && nombre !== 'siesta') return iniciar('despertar');
                        return iniciar(nombre, o);
                    },
                    tocar(region, punto, o) {
                        if (punto) {
                            const q = toques[toqueSig]; toqueSig = (toqueSig + 1) % toques.length;
                            q.x = punto.x; q.y = punto.y; q.z = punto.z; q.v = 0; q.vel = (A.reducido ? 0.12 : 0.32) * ((o && o.fuerza) || 1);
                        }
                        if (accion === 'siesta') return iniciar('despertar');
                        const mapa = { pancita: 'pancita', cabeza: 'mimos', brazoIzq: 'saludar', brazoDer: 'saludar', cola: 'colita', pie: 'saltito', cuerpo: 'pancita' };
                        const nombre = mapa[region] || 'pancita';
                        const opc = Object.assign({}, o || {});
                        if (region === 'brazoIzq') opc.lado = 'izq';
                        if (region === 'brazoDer') opc.lado = 'der';
                        return iniciar(nombre, opc);
                    },
                    estado() {
                        return { accion, tiempo: A.tiempo, parpadeo, barriga: m.barriga.v, aplastar: m.aplastar.v, mirada: { yaw: mirada.yaw, pitch: mirada.pitch }, toque: toques.map((q) => q.v) };
                    },
                    set reducido(v) { A.reducido = !!v; },
                    get reducido() { return A.reducido; },
                    // Reposo instantáneo (sin transiciones): útil antes de hornear
                    asentar(segundos) { for (let t = 0; t < (segundos || 1.5); t += PASO) pasoFijo(PASO); aplicar(); }
                };
                return api;
            }

            /* ---------- Horneado de clips para el GLB ---------- */
            function hornear(THREE, modelo, nombre, duracion, fps) {
                const objetivos = [];
                Object.values(modelo.huesos).forEach((b) => objetivos.push(b));
                modelo.ojos.forEach((o) => objetivos.push(o.globo, o.sup, o.inf));
                const guardado = objetivos.map((o) => ({ p: o.position.clone(), q: o.quaternion.clone(), s: o.scale.clone() }));
                const anim = crear(modelo, { semilla: 11, ocio: false });
                anim.asentar(1.2);
                if (nombre !== 'reposo') anim.accion(nombre);
                const n = Math.round(duracion * fps) + 1;
                const tiempos = new Float32Array(n);
                const datos = objetivos.map(() => ({ p: new Float32Array(n * 3), q: new Float32Array(n * 4), s: new Float32Array(n * 3) }));
                for (let i = 0; i < n; i++) {
                    if (i > 0) anim.actualizar(1 / fps, null);
                    tiempos[i] = i / fps;
                    objetivos.forEach((o, j) => {
                        o.position.toArray(datos[j].p, i * 3);
                        o.quaternion.toArray(datos[j].q, i * 4);
                        o.scale.toArray(datos[j].s, i * 3);
                    });
                }
                const pistas = [];
                objetivos.forEach((o, j) => {
                    pistas.push(new THREE.QuaternionKeyframeTrack(o.name + '.quaternion', tiempos, datos[j].q));
                    pistas.push(new THREE.VectorKeyframeTrack(o.name + '.position', tiempos, datos[j].p));
                    pistas.push(new THREE.VectorKeyframeTrack(o.name + '.scale', tiempos, datos[j].s));
                });
                objetivos.forEach((o, j) => { o.position.copy(guardado[j].p); o.quaternion.copy(guardado[j].q); o.scale.copy(guardado[j].s); });
                return new THREE.AnimationClip(nombre, duracion, pistas);
            }

            return { crear, hornear, ACCIONES, CANALES, BRAZO_NEUTRO };
        })();
