        /* ==============================================================
           17. NAILONG 3D · ANIMACIÓN PROCEDURAL (muelles, reposo, acciones)
           Física gelatinosa «Duang», micro-movimientos orgánicos de reposo,
           poses canónicas fieles a los stickers y horneado determinista para GLB.
        ============================================================== */
        const Nailong3DAnimacion = (function () {
            'use strict';
            const PASO = 1 / 120;
            const TAU = Math.PI * 2;

            // Canales animables: [valor neutro, frecuencia (Hz), amortiguación]
            // Frecuencia ~4.2 Hz y amortiguación ~0.24 en barriga y aplastamiento para oscilación subamortiguada gelatinosa en resonancia Duang
            const CANALES = {
                saltoY: [0, 9, 0.85], aplastar: [1, 4.2, 0.30], incX: [0, 3.2, 0.45], incZ: [0, 3.2, 0.42], girY: [0, 2.4, 0.8],
                cadZ: [0, 3, 0.6], cabX: [0, 3, 0.55], cabY: [0, 2.6, 0.7], cabZ: [0, 3, 0.5],
                bIX: [0, 3.4, 0.6], bIY: [0, 3.4, 0.6], bIZ: [0, 3.4, 0.55], bDX: [0, 3.4, 0.6], bDY: [0, 3.4, 0.6], bDZ: [0, 3.4, 0.55],
                pIX: [0, 5, 0.7], pDX: [0, 5, 0.7], colaY: [0, 3.5, 0.35], colaX: [0, 3, 0.6],
                barriga: [0, 4.2, 0.24], pecho: [0, 3, 0.5],
                parpSup: [0.98, 9, 0.9], parpInf: [-0.98, 9, 0.9], ojoAbre: [1, 6, 0.6],
                bocaAbre: [0.52, 7, 0.8], bocaSonrisa: [0.65, 6, 0.85], bocaRedonda: [0, 6, 0.85], bocaDientes: [0.42, 6, 0.9]
            };
            // Pose visible de los brazos: descansando junto a la pancita con las garritas hacia dentro (stickers 86, 52)
            const BRAZO_NEUTRO = { x: -0.18, y: 0.36, z: -0.38 };
            const PARPADO_CERRADO = -0.04;

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

            // Curva de parpadeo dinámico asimétrico
            function evalParpadeo(t, tCierra, tAbre) {
                if (t <= 0) return 0;
                if (t < tCierra) {
                    const u = t / tCierra;
                    return u * u;
                }
                if (t < tCierra + tAbre) {
                    const u = (t - tCierra) / tAbre;
                    return 1 - u * (2 - u);
                }
                return 0;
            }

            /* ---------- Acciones canónicas fieles a los stickers oficiales ---------- */
            const ACCIONES = {
                intro: {
                    duracion: 1.1,
                    f(t, o, A) {
                        const caida = 0.34;
                        if (t < caida) {
                            const u = t / caida;
                            return { saltoY: 0.42 * (1 - u * u), aplastar: 1.07, bIZ: 0.45, bDZ: -0.45, parpSup: 1.08 };
                        }
                        if (!A.marcas.aterriza) {
                            A.marcas.aterriza = true;
                            A.impulso('aplastar', -3.2);
                            A.impulso('barriga', 3.8);
                            A.evento('sonido', 'pop');
                            A.parpadear();
                        }
                        return { bocaAbre: 0.62, bocaSonrisa: 0.95, bocaDientes: 0.50 };
                    }
                },
                // Saludo alegre: inclinación de cabeza de 12°, sonrisa radiante con franja dental blanca y oscilación de mano fluida (sticker_2)
                saludar: {
                    duracion: 2.6,
                    f(t, o, A) {
                        const izq = !o || o.lado !== 'der';
                        const sube = campana(t, 0.0, 2.2);
                        const ola = Math.sin(t * TAU * 3.0) * 0.34 * sube;
                        if (t > 0.35 && !A.marcas.pestaneo) { A.marcas.pestaneo = true; A.parpadear(); }
                        const incCab12Deg = 0.2094; // 12° exactos
                        const r = {
                            cabZ: (izq ? -incCab12Deg : incCab12Deg) * sube,
                            cabX: -0.06 * sube,
                            parpInf: -0.98 + 0.48 * sube,
                            parpSup: 0.98 - 0.14 * sube,
                            bocaAbre: 0.52 + 0.26 * sube,
                            bocaSonrisa: 1.0,
                            bocaDientes: 0.82 * sube + 0.42 * (1 - sube),
                            bocaRedonda: 0,
                            incZ: (izq ? -0.06 : 0.06) * sube
                        };
                        if (izq) {
                            r.bIZ = 1.48 * sube + ola;
                            r.bIX = -0.24 * sube;
                            r.bIY = -0.28 * sube;
                            r.bDZ = 0.08 * sube;
                            r.bDX = -0.14 * sube;
                        } else {
                            r.bDZ = -1.48 * sube - ola;
                            r.bDX = -0.24 * sube;
                            r.bDY = 0.28 * sube;
                            r.bIZ = -0.08 * sube;
                            r.bIX = -0.14 * sube;
                        }
                        r.colaY = Math.sin(t * TAU * 1.5) * 0.35 * sube;
                        return r;
                    }
                },
                // Física Duang: anticipación comprimida (squash) -> salto estirado (stretch) -> triple rebote gelatinoso amortiguado a ~4.2 Hz acoplado a barriga (sticker_18)
                duang: {
                    duracion: 1.5,
                    f(t, o, A) {
                        // 1. Anticipación comprimida (squash elástico de carga)
                        if (t < 0.16) {
                            const u = t / 0.16;
                            const comp = 1.0 - 0.26 * suave(u); // compresión sy hasta 0.74
                            return {
                                aplastar: comp,
                                barriga: 0.65 * suave(u),
                                bIZ: -0.20 * suave(u), bDZ: 0.20 * suave(u),
                                bIX: -0.26 * suave(u), bDX: -0.26 * suave(u),
                                bocaRedonda: 0.60 * suave(u), bocaAbre: 0.46, bocaSonrisa: 0.50,
                                parpSup: 0.90, parpInf: -0.85, cabX: 0.08 * suave(u)
                            };
                        }
                        // 2. Impulso elástico y salto estirado (stretch leap con adelgazamiento en X/Z)
                        if (t < 0.56) {
                            const u = (t - 0.16) / 0.40;
                            if (!A.marcas.salta) {
                                A.marcas.salta = true;
                                A.impulso('aplastar', 2.8);
                            }
                            const stretch = 1.0 + 0.22 * Math.sin(u * Math.PI);
                            return {
                                saltoY: A.reducido ? 0.03 : 0.18 * 4 * u * (1 - u),
                                aplastar: stretch,
                                barriga: -0.42 * Math.sin(u * Math.PI),
                                bIZ: 1.05 * Math.sin(u * Math.PI), bDZ: -1.05 * Math.sin(u * Math.PI),
                                bIX: -0.30, bDX: -0.30,
                                bocaRedonda: 0.40, bocaAbre: 0.86, bocaSonrisa: 0.98, bocaDientes: 0.56,
                                parpSup: 1.15, parpInf: -1.05, ojoAbre: 1.10,
                                colaX: -0.30 * Math.sin(u * Math.PI)
                            };
                        }
                        // 3. Primer aterrizaje e impacto de pancita (t = 0.56)
                        if (!A.marcas.cae1) {
                            A.marcas.cae1 = true;
                            A.impulso('aplastar', -4.2);
                            A.impulso('barriga', 5.4);
                            A.impulso('cabX', 1.8);
                            A.evento('texto', '¡Duang!');
                            A.evento('sonido', 'pop');
                            A.parpadear();
                        }
                        // 4. Rebote 1 del triple rebote gelatinoso amortiguado a ~4.2 Hz
                        if (t >= 0.66 && t < 0.90) {
                            const u2 = (t - 0.66) / 0.24;
                            if (!A.marcas.cae2 && t > 0.86) {
                                A.marcas.cae2 = true;
                                A.impulso('aplastar', -2.2);
                                A.impulso('barriga', 2.8);
                            }
                            return {
                                saltoY: (A.reducido ? 0.01 : 0.052) * 4 * u2 * (1 - u2),
                                aplastar: 1.08,
                                bIZ: 0.44, bDZ: -0.44,
                                bocaAbre: 0.74, bocaSonrisa: 0.98, bocaDientes: 0.56,
                                parpInf: -0.76, parpSup: 0.95
                            };
                        }
                        // 5. Rebote 2 del triple rebote
                        if (t >= 0.90 && t < 1.14) {
                            const u3 = (t - 0.90) / 0.24;
                            if (!A.marcas.cae3 && t > 1.10) {
                                A.marcas.cae3 = true;
                                A.impulso('aplastar', -1.2);
                                A.impulso('barriga', 1.6);
                            }
                            return {
                                saltoY: (A.reducido ? 0.004 : 0.020) * 4 * u3 * (1 - u3),
                                aplastar: 1.04,
                                bIZ: 0.22, bDZ: -0.22,
                                bocaAbre: 0.66, bocaSonrisa: 0.98, bocaDientes: 0.55,
                                parpInf: -0.72, parpSup: 0.94
                            };
                        }
                        // 6. Rebote 3 y asentamiento final con oscilación residual de gelatina acoplada a barriga
                        return {
                            bocaAbre: 0.62,
                            bocaSonrisa: 0.98,
                            parpInf: -0.68,
                            parpSup: 0.94,
                            bocaDientes: 0.55
                        };
                    }
                },
                // Baile: compás de maracas, alternancia rítmica de patitas, balanceo de cadera y coletazo sincronizado
                bailar: {
                    duracion: 5.4,
                    f(t, o, A) {
                        const pulso = 1.55, fase = t * TAU * pulso / 2;
                        const env = campana(t, 0, 5.0);
                        const golpe = Math.abs(Math.sin(fase));
                        const n = Math.floor(t * pulso);
                        if (n !== A.marcas.compas && t < 5.0) {
                            A.marcas.compas = n;
                            A.evento('sonido', 'maracas');
                        }
                        return {
                            saltoY: A.reducido ? 0 : 0.042 * golpe * env,
                            incZ: Math.sin(fase) * 0.16 * env,
                            girY: Math.sin(fase * 0.5) * 0.36 * env,
                            cadZ: -Math.sin(fase) * 0.18 * env,
                            cabZ: Math.sin(fase + 0.6) * 0.18 * env,
                            cabX: -0.07 * golpe * env,
                            bIZ: (1.05 + Math.sin(fase) * 0.70) * env,
                            bDZ: -(1.05 - Math.sin(fase) * 0.70) * env,
                            bIX: (-0.34 + Math.cos(fase) * 0.14) * env,
                            bDX: (-0.34 - Math.cos(fase) * 0.14) * env,
                            pIX: Math.max(0, Math.sin(fase)) * -0.38 * env,
                            pDX: Math.max(0, -Math.sin(fase)) * -0.38 * env,
                            colaY: Math.sin(fase * 2) * 0.68 * env,
                            colaX: -0.14 * env,
                            parpInf: -0.98 + 0.40 * env,
                            bocaAbre: 0.56 + 0.24 * env,
                            bocaSonrisa: 0.98,
                            bocaDientes: 0.60
                        };
                    }
                },
                // Sorpresa canónica: manitas a los mofletes arropando mejillas con 3 garritas hacia arriba, boca redonda en domo con lengua rosada visible y ojos al 110% (sticker_19)
                sorpresa: {
                    duracion: 2.3,
                    f(t, o, A) {
                        if (!A.marcas.salto) {
                            A.marcas.salto = true;
                            A.impulso('incX', -1.6);
                            A.impulso('aplastar', 1.8);
                            A.impulso('barriga', 1.8);
                            A.evento('texto', '¡Uoooh!');
                        }
                        const env = campana(t, 0, 1.95);
                        const temblor = Math.sin(t * TAU * 11) * 0.016 * env;
                        return {
                            saltoY: A.reducido ? 0 : 0.038 * campana(t, 0, 0.28),
                            incX: -0.06 * env,
                            bIX: -0.52 * env, bIY: -0.84 * env, bIZ: 1.18 * env + temblor,
                            bDX: -0.52 * env, bDY: 0.84 * env, bDZ: -1.18 * env - temblor,
                            parpSup: 1.10,
                            parpInf: -1.10,
                            ojoAbre: 1.10 * env + 1.0 * (1 - env),
                            bocaRedonda: 0.88 * env,
                            bocaAbre: 0.52 + 0.34 * env,
                            bocaSonrisa: 0.35 * (1 - env) + 0.28 * env,
                            bocaDientes: 0.20 * (1 - env),
                            cabX: -0.08 * env
                        };
                    }
                },
                // Siesta: respiración lenta y profunda de 4.4 s con emisión de burbujas zzz, párpados cerrados pacíficamente y cabeza ladeada con ternura (sticker_38)
                siesta: {
                    duracion: Infinity,
                    f(t, o, A) {
                        const env = suave(t / 1.2);
                        const cicloZzz = Math.floor((t - 0.8) / 4.4);
                        if (cicloZzz !== A.marcas.zzz && t > 1.2) {
                            A.marcas.zzz = cicloZzz;
                            A.evento('zzz');
                        }
                        return {
                            parpSup: 0.95 + (PARPADO_CERRADO - 0.95) * env,
                            parpInf: -0.96 + (PARPADO_CERRADO + 0.04 + 0.96) * env,
                            cabX: 0.16 * env,
                            cabZ: 0.22 * env,
                            incZ: 0.06 * env,
                            bIZ: -0.10 * env, bDZ: 0.10 * env,
                            bIX: 0.16 * env, bDX: 0.16 * env,
                            bocaAbre: 0.42 - 0.20 * env,
                            bocaRedonda: 0.72 * env,
                            bocaSonrisa: 0.65 * (1 - env),
                            bocaDientes: 0.38 * (1 - env)
                        };
                    }
                },
                // Mimos en la cabeza: inclinación dulce y mimos suaves
                mimos: {
                    duracion: 1.6,
                    f(t, o, A) {
                        if (!A.marcas.mimo) {
                            A.marcas.mimo = true;
                            A.impulso('cabZ', ((o && o.lado) || 1) * 0.8);
                        }
                        const env = campana(t, 0, 1.3), lado = (o && o.lado) || 1;
                        return {
                            cabZ: 0.24 * lado * env,
                            cabX: -0.08 * env,
                            incZ: 0.05 * lado * env,
                            parpSup: 0.95 - 0.55 * env,
                            parpInf: -0.96 + 0.65 * env,
                            bocaAbre: 0.46 + 0.16 * env,
                            bocaSonrisa: 0.98,
                            bocaDientes: 0.52,
                            bIZ: 0.20 * env, bDZ: -0.20 * env,
                            colaY: Math.sin(t * TAU * 2.8) * 0.38 * env
                        };
                    }
                },
                // Reacción coordinada al tocar la pancita: oscilación subamortiguada, volumen constante y sonrisa alegre
                pancita: {
                    duracion: 1.25,
                    f(t, o, A) {
                        if (!A.marcas.ok) {
                            A.marcas.ok = true;
                            A.impulso('barriga', 5.6);
                            A.impulso('aplastar', -2.8);
                            A.impulso('incX', 0.9);
                            A.evento('texto', '¡Duang!');
                            A.parpadear(true);
                        }
                        const env = campana(t, 0, 0.95);
                        return {
                            parpSup: 0.95 - 0.36 * env,
                            parpInf: -0.96 + 0.52 * env,
                            bocaAbre: 0.44 + 0.32 * env,
                            bocaSonrisa: 0.98,
                            bocaDientes: 0.62,
                            bIZ: -0.16 * env, bDZ: 0.16 * env,
                            bIX: -0.28 * env, bDX: -0.28 * env,
                            cabZ: 0.08 * Math.sin(t * TAU * 2.2) * env,
                            cabX: -0.06 * env
                        };
                    }
                },
                // Meneo rápido feliz de la colita
                colita: {
                    duracion: 1.4,
                    f(t, o, A) {
                        if (!A.marcas.cola) {
                            A.marcas.cola = true;
                            A.impulso('barriga', 1.4);
                        }
                        const env = campana(t, 0, 1.15);
                        return {
                            colaY: Math.sin(t * TAU * 4.5) * 0.78 * env,
                            colaX: -0.22 * env + Math.sin(t * TAU * 2.25) * 0.10 * env,
                            girY: 0.22 * env,
                            cabY: 0.55 * env,
                            cabZ: -0.10 * env,
                            cabX: -0.08 * env,
                            parpInf: -0.96 + 0.45 * env,
                            bocaAbre: 0.48 + 0.14 * env,
                            bocaSonrisa: 0.96,
                            bocaDientes: 0.54
                        };
                    }
                },
                // Cosquillas en patitas con saltito alegre
                saltito: {
                    duracion: 0.9,
                    f(t, o, A) {
                        if (t < 0.42) {
                            const u = t / 0.42;
                            const cosquilleo = Math.sin(t * TAU * 9) * 0.12;
                            return {
                                saltoY: A.reducido ? 0 : 0.075 * 4 * u * (1 - u),
                                pIX: -0.38 + cosquilleo,
                                pDX: -0.38 - cosquilleo,
                                aplastar: 1.06,
                                bIZ: 0.42, bDZ: -0.42,
                                bocaAbre: 0.68,
                                bocaSonrisa: 0.98,
                                bocaDientes: 0.58,
                                parpInf: -0.96 + 0.48
                            };
                        }
                        if (!A.marcas.cae) {
                            A.marcas.cae = true;
                            A.impulso('aplastar', -2.4);
                            A.impulso('barriga', 2.4);
                            A.evento('sonido', 'pop');
                        }
                        return { bocaAbre: 0.52, bocaSonrisa: 0.95, bocaDientes: 0.52 };
                    }
                },
                despertar: {
                    duracion: 1.4,
                    f(t, o, A) {
                        if (!A.marcas.ok) { A.marcas.ok = true; A.impulso('aplastar', 1.6); A.impulso('cabX', -1.4); }
                        const env = campana(t, 0, 1.0);
                        return { parpSup: 0.95 + 0.15 * env, ojoAbre: 1 + 0.05 * env, bocaRedonda: 0.65 * env, bocaAbre: 0.42 + 0.28 * env, bIZ: 0.38 * env, bDZ: -0.38 * env };
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
                let tParpadeo = -1, proxParpadeo = 1.5 + azar() * 2, dobleParpadeo = false;
                const A = {
                    reducido: !!op.reducido, marcas: {}, tiempo: 0,
                    impulso(canal, vel) { if (m[canal]) m[canal].vel += vel * (A.reducido ? 0.35 : 1); },
                    parpadear(doble) { tParpadeo = 0; dobleParpadeo = !!doble; },
                    evento(tipo, dato) { if (op.alEvento) op.alEvento(tipo, dato); }
                };
                let accion = null, tAccion = 0, opAccion = null;
                let proxOcio = 9 + azar() * 6;
                let acumulado = 0;
                const toques = [0, 1, 2, 3].map(() => ({ x: 0, y: -5, z: 0, v: 0, vel: 0 }));
                let toqueSig = 0;
                const mirada = { yaw: 0, pitch: 0 };
                const sacada = { yaw: 0, pitch: 0, tarYaw: 0, tarPitch: 0 };
                let proxSacada = 0.9 + azar() * 0.7; // micro-sacadas suaves de 1° a 2° cada 0.9 - 1.6 s
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
                    // Parpadeo dinámico asimétrico estocástico con posibilidad de doble parpadeo
                    if (tParpadeo >= 0) {
                        tParpadeo += dt;
                        const durParpadeo = 0.17;
                        if (tParpadeo > durParpadeo) {
                            tParpadeo = -1;
                            if (dobleParpadeo) {
                                dobleParpadeo = false;
                                proxParpadeo = 0.12 + azar() * 0.06;
                            } else {
                                proxParpadeo = 2.4 + azar() * 3.4;
                            }
                        }
                    } else if (accion !== 'siesta') {
                        proxParpadeo -= dt;
                        if (proxParpadeo <= 0) {
                            tParpadeo = 0;
                            dobleParpadeo = azar() < 0.22;
                        }
                    }
                    // Pequeñas travesuras cuando se aburre
                    if (!accion && op.ocio !== false) {
                        proxOcio -= dt;
                        if (proxOcio <= 0) { proxOcio = 10 + azar() * 8; iniciar(azar() < 0.6 ? 'mirarAlrededor' : 'colita', null); }
                    }
                    // Abolladuras de piel: muelle subamortiguado que se hunde y rebota gomoso
                    toques.forEach((q) => {
                        const w = TAU * 5.5, z = 0.20;
                        const a = -w * w * q.v - 2 * z * w * q.vel;
                        q.vel += a * dt; q.v += q.vel * dt;
                    });
                }

                function aplicar() {
                    const g = (k) => m[k].v;
                    const t = A.tiempo;
                    const amp = A.reducido ? 0.5 : 1;
                    const durRespira = accion === 'siesta' ? 4.4 : 3.3;
                    const faseResp = t * TAU / durRespira;
                    // Respiración bifásica desfasada: pancita se expande 0.35 s antes que el pecho
                    const desfasePechoRad = (0.35 / durRespira) * TAU;
                    const respBelly = Math.sin(faseResp) + 0.18 * Math.sin(2 * faseResp - 0.45);
                    const respPecho = Math.sin(faseResp - desfasePechoRad) + 0.15 * Math.sin(2 * (faseResp - desfasePechoRad) - 0.45);
                    const ocio = accion === 'bailar' ? 0.3 : 1;
                    const R = (b) => b.userData.reposo;

                    // Raíz: salto, squash & stretch elástico con conservación estricta de volumen (sx = sz = 1 / sqrt(max(0.5, sy)))
                    const raiz = huesos.raiz;
                    const sy = Math.max(0.5, g('aplastar'));
                    const sxz = 1 / Math.sqrt(sy);
                    raiz.position.set(R(raiz).p.x, R(raiz).p.y + Math.max(0, g('saltoY')), R(raiz).p.z);
                    raiz.scale.set(sxz, sy, sxz);
                    raiz.rotation.set(
                        g('incX') + 0.01 * Math.sin(t * TAU / 6.1) * amp * ocio,
                        g('girY') + 0.035 * Math.sin(t * TAU / 7.3) * amp * ocio,
                        g('incZ') + 0.018 * Math.sin(t * TAU / 5.2) * amp * ocio
                    );

                    huesos.cadera.rotation.set(0, 0, g('cadZ'));
                    huesos.tronco.rotation.set(0, 0, -g('incZ') * 0.25);

                    // Pecho y Cabeza
                    const pe = 1 + 0.008 * respPecho * amp + g('pecho');
                    huesos.pecho.scale.set(1 + 0.005 * respPecho * amp, pe, 1 + 0.005 * respPecho * amp);
                    huesos.cabeza.rotation.set(
                        g('cabX') + 0.02 * respPecho * amp + mirada.pitch * 0.28,
                        g('cabY') + mirada.yaw * 0.32,
                        g('cabZ')
                    );

                    // Barriga gelatinosa con conservación de volumen y oscilación subamortiguada acoplada en 3D
                    const b = g('barriga') * 0.065 + 0.026 * respBelly * amp * (accion === 'siesta' ? 1.8 : 1);
                    huesos.barriga.scale.set(1 + b * 0.60, 1 + b * 0.35, 1 + b);
                    huesos.barriga.position.set(R(huesos.barriga).p.x, R(huesos.barriga).p.y + b * 0.006, R(huesos.barriga).p.z + b * 0.024);

                    // Brazos: pose neutra + vaivén orgánico sobre la respiración + rotación de hombros y alzado a mofletes
                    const vaivenZ = 0.028 * respBelly * amp * ocio;
                    const vaivenX = -0.012 * respPecho * amp * ocio;
                    const alzaI = Math.max(0, g('bIZ') - 0.35), alzaD = Math.max(0, -g('bDZ') - 0.35);
                    huesos.brazoIzq.position.set(R(huesos.brazoIzq).p.x - alzaI * 0.042, R(huesos.brazoIzq).p.y + alzaI * 0.038, R(huesos.brazoIzq).p.z + alzaI * 0.054);
                    huesos.brazoDer.position.set(R(huesos.brazoDer).p.x + alzaD * 0.042, R(huesos.brazoDer).p.y + alzaD * 0.038, R(huesos.brazoDer).p.z + alzaD * 0.054);
                    huesos.brazoIzq.rotation.set(BRAZO_NEUTRO.x + g('bIX') + vaivenX, BRAZO_NEUTRO.y + g('bIY'), BRAZO_NEUTRO.z + g('bIZ') + vaivenZ);
                    huesos.brazoDer.rotation.set(BRAZO_NEUTRO.x + g('bDX') + vaivenX, -BRAZO_NEUTRO.y + g('bDY'), -BRAZO_NEUTRO.z + g('bDZ') - vaivenZ);

                    // Piernas
                    huesos.piernaIzq.rotation.set(g('pIX'), 0, 0);
                    huesos.piernaDer.rotation.set(g('pDX'), 0, 0);

                    // Cola: deriva orgánica tridimensional con onda de retraso en la punta y vaivén suave acoplado a la respiración
                    const vaivenColaResp = 0.038 * Math.sin(faseResp - 0.65) * amp * ocio;
                    const meneoY = (0.065 * Math.sin(t * TAU / 3.2) + vaivenColaResp) * amp * ocio;
                    const meneoX = (0.025 * Math.sin(t * TAU / 4.1 + 0.8) + 0.015 * respPecho) * amp * ocio;
                    const puntaY = (0.090 * Math.sin(t * TAU / 3.2 - 0.65) + vaivenColaResp * 1.25) * amp * ocio;
                    const puntaX = (0.035 * Math.sin(t * TAU / 4.1 + 0.3) + 0.020 * respPecho) * amp * ocio;
                    huesos.cola.rotation.set(g('colaX') + meneoX, g('colaY') + meneoY, 0);
                    huesos.colaPunta.rotation.set(g('colaX') * 0.5 + puntaX, (g('colaY') + meneoY) * 0.75 + puntaY, 0);

                    // Ojos: rotación viva con micro-sacadas aleatorias y parpadeo dinámico asimétrico
                    const sup = g('parpSup'), inf = g('parpInf');
                    const centro = (sup + inf) / 2 * 0.3 + PARPADO_CERRADO * 0.7;
                    const totalYaw = mirada.yaw + sacada.yaw;
                    const totalPitch = mirada.pitch + sacada.pitch;

                    modelo.ojos.forEach((o) => {
                        o.globo.rotation.set(totalPitch * 0.58, totalYaw * 0.54, 0);
                        o.globo.scale.setScalar(g('ojoAbre'));

                        const lagOjo = o.lado > 0 ? 0 : 0.008;
                        const tOjo = tParpadeo >= 0 ? tParpadeo - lagOjo : -1;
                        const cierreSup = evalParpadeo(tOjo, 0.052, 0.092);
                        const cierreInf = evalParpadeo(tOjo - 0.012, 0.046, 0.088);

                        o.sup.rotation.x = -(sup + (centro - sup) * cierreSup);
                        o.inf.rotation.x = -(inf + (centro + 0.04 - inf) * cierreInf);
                    });

                    // Boca 3D
                    const forma = {
                        abierta: g('bocaAbre'),
                        sonrisa: g('bocaSonrisa'),
                        redonda: Math.min(1, Math.max(0, g('bocaRedonda'))),
                        dientes: Math.min(1, Math.max(0, g('bocaDientes')))
                    };
                    const f0 = modelo.boca.forma;
                    if (Math.abs(f0.abierta - forma.abierta) + Math.abs(f0.sonrisa - forma.sonrisa) + Math.abs(f0.redonda - forma.redonda) + Math.abs(f0.dientes - forma.dientes) > 0.004) {
                        modelo.boca.actualizar(forma);
                    }

                    // Relieve de onda elástica en el shader de piel al tocar
                    if (modelo.uniformes && modelo.uniformes.uToque) {
                        toques.forEach((q, i) => modelo.uniformes.uToque.value[i].set(q.x, q.y, q.z, q.v));
                    }
                }

                // Seguimiento suave de mirada con micro-sacadas aleatorias biológicas (saltos suaves de 1° a 2° cada 0.9-1.6 s hacia el puntero)
                function actualizarMirada(dt) {
                    let yaw = 0, pitch = 0;
                    if (mirarObjetivo && modelo.ojos && modelo.ojos[0]) {
                        const cab = huesos.pecho;
                        const local = cab.worldToLocal(mirarObjetivo.clone());
                        if (!vOjo) vOjo = local.clone();
                        vOjo.copy(huesos.cabeza.position);
                        vOjo.y += 0.24; vOjo.z += 0.166;   // entre los ojos, en el espacio del pecho
                        const d = local.sub(vOjo);
                        if (d.z > -0.08) {
                            const distH = Math.hypot(d.x, d.z);
                            yaw = Math.atan2(d.x, Math.max(0.12, d.z));
                            pitch = -Math.atan2(d.y, Math.max(0.15, distH));
                        }
                        // Clamps angulares seguros para las proporciones canónicas
                        yaw = Math.max(-0.65, Math.min(0.65, yaw));
                        pitch = Math.max(-0.40, Math.min(0.35, pitch));
                    }

                    // Micro-sacadas suaves biológicas en reposo y seguimiento (saltos de 1° a 2° cada 0.9-1.6 s)
                    if (accion !== 'siesta') {
                        proxSacada -= dt;
                        if (proxSacada <= 0) {
                            proxSacada = 0.9 + azar() * 0.7;
                            const rad = (1.0 + azar() * 1.0) * (Math.PI / 180); // 1° a 2°
                            const ang = azar() * TAU;
                            sacada.tarYaw = Math.cos(ang) * rad;
                            sacada.tarPitch = Math.sin(ang) * rad;
                        }
                    } else {
                        sacada.tarYaw = 0;
                        sacada.tarPitch = 0;
                    }

                    const k = 1 - Math.exp(-dt * 9.5);
                    mirada.yaw += (yaw - mirada.yaw) * k;
                    mirada.pitch += (pitch - mirada.pitch) * k;

                    const kSac = 1 - Math.exp(-dt * 14.0);
                    sacada.yaw += (sacada.tarYaw - sacada.yaw) * kSac;
                    sacada.pitch += (sacada.tarPitch - sacada.pitch) * kSac;
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
                        let pt = punto;
                        if (!pt && (region === 'pancita' || region === 'cuerpo')) {
                            // Punto canónico central de la pancita en reposo
                            pt = { x: 0, y: 0.28, z: 0.14 };
                        } else if (!pt && region === 'cabeza') {
                            pt = { x: 0, y: 0.68, z: 0.08 };
                        } else if (!pt && region === 'pie') {
                            pt = { x: 0.08, y: 0.04, z: 0.08 };
                        } else if (!pt && region === 'cola') {
                            pt = { x: 0, y: 0.18, z: -0.22 };
                        }
                        if (pt) {
                            const q = toques[toqueSig];
                            toqueSig = (toqueSig + 1) % toques.length;
                            q.x = pt.x; q.y = pt.y; q.z = pt.z; q.v = 0;
                            // Impulso de onda elástica táctil diferenciada
                            const fuerzaRegion = (region === 'pancita' || region === 'cuerpo') ? 0.48 : (region === 'pie' ? 0.38 : 0.28);
                            q.vel = (A.reducido ? 0.18 : fuerzaRegion) * ((o && o.fuerza) || 1);
                        }
                        if (accion === 'siesta') return iniciar('despertar');
                        const mapa = { pancita: 'pancita', cabeza: 'mimos', brazoIzq: 'saludar', brazoDer: 'saludar', cola: 'colita', pie: 'saltito', cuerpo: 'pancita' };
                        const nombre = mapa[region] || 'pancita';
                        const opc = Object.assign({}, o || {});
                        if (region === 'brazoIzq') opc.lado = 'izq';
                        if (region === 'brazoDer') opc.lado = 'der';
                        if (region === 'cabeza' && !opc.lado) opc.lado = (azar() < 0.5 ? -1 : 1);
                        return iniciar(nombre, opc);
                    },
                    estado() {
                        return {
                            accion, tiempo: A.tiempo,
                            parpadeo: evalParpadeo(tParpadeo, 0.052, 0.092),
                            barriga: m.barriga.v,
                            aplastar: m.aplastar.v,
                            mirada: { yaw: mirada.yaw + sacada.yaw, pitch: mirada.pitch + sacada.pitch },
                            toque: toques.map((q) => q.v)
                        };
                    },
                    set reducido(v) { A.reducido = !!v; },
                    get reducido() { return A.reducido; },
                    // Reposo instantáneo (sin transiciones): útil antes de hornear
                    asentar(segundos) { for (let t = 0; t < (segundos || 1.5); t += PASO) pasoFijo(PASO); aplicar(); }
                };
                return api;
            }

            /* ---------- Horneado de clips para el GLB (paso fijo reproducible con mulberry32) ---------- */
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
