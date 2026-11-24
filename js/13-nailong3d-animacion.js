        /* ==============================================================
           17. NAILONG 3D · ANIMACIÓN PROCEDURAL Y EXPRESIONES DE LA SERIE
           Física gelatinosa «Duang», reposo tierno con boca cerrada, micro-gestos
           orgánicos, 6 caritas icónicas de Seventh Impression y horneado GLB.
        ============================================================== */
        const Nailong3DAnimacion = (function () {
            'use strict';
            const PASO = 1 / 120;
            const TAU = Math.PI * 2;

            // Canales animables: [valor neutro de reposo, frecuencia (Hz), amortiguación]
            // En reposo: ojos grandes, redondos y bien abiertos (0.98 / -0.98) y sonrisita dulce cerrada (bocaAbre = 0.02)
            const CANALES = {
                saltoY: [0, 9, 0.85], aplastar: [1, 4.2, 0.30], incX: [0, 3.2, 0.45], incZ: [0, 3.2, 0.42], girY: [0, 2.4, 0.8],
                cadZ: [0, 3, 0.6], cabX: [0, 3, 0.55], cabY: [0, 2.6, 0.7], cabZ: [0, 3, 0.5],
                bIX: [0, 3.4, 0.6], bIY: [0, 3.4, 0.6], bIZ: [0, 3.4, 0.55], bDX: [0, 3.4, 0.6], bDY: [0, 3.4, 0.6], bDZ: [0, 3.4, 0.55],
                cIX: [0, 4.0, 0.6], cIZ: [0, 4.0, 0.58], cDX: [0, 4.0, 0.6], cDZ: [0, 4.0, 0.58],
                pIX: [0, 5, 0.7], pDX: [0, 5, 0.7], colaY: [0, 3.5, 0.35], colaX: [0, 3, 0.6],
                barriga: [0, 4.2, 0.24], pecho: [0, 3, 0.5],
                parpSup: [0.98, 9, 0.9], parpInf: [-0.98, 9, 0.9], parpInclina: [0, 6.2, 0.84], guiñoDer: [0, 8.5, 0.86],
                ojoAbre: [1, 6, 0.65], ojoRisa: [0, 6.5, 0.84],
                bocaAbre: [0.02, 7, 0.82], bocaSonrisa: [0.42, 6, 0.85], bocaRedonda: [0, 6, 0.85],
                bocaPuchero: [0, 6, 0.85], bocaDientes: [0, 6, 0.9], bocaLengua: [1, 7, 0.85], bocaFuera: [0, 6.5, 0.78],
                cejaSubir: [0, 6, 0.82], cejaFruncir: [0, 6, 0.82], cejaTriste: [0, 6, 0.82], pomulo: [0, 6, 0.82]
            };
            // Pose de reposo desde la pose A abierta: hombro relajado con hueco axilar visible y codo flexionado hacia la cintura (13, 14)
            const BRAZO_NEUTRO = { x: -0.04, y: -0.04, z: -0.36 };
            const CODO_NEUTRO = { x: -0.08, y: -0.24, z: -0.30 };
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
            const campana = (t, a, b) => suave((t - a) / 0.14) * (1 - suave((t - b) / 0.20));

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

            /* ---------- Acciones corporales y las 6 Caritas icónicas de la serie ---------- */
            const ACCIONES = {
                intro: {
                    duracion: 1.15,
                    f(t, o, A) {
                        const caida = 0.34;
                        if (t < caida) {
                            const u = t / caida;
                            return { saltoY: 0.40 * (1 - u * u), aplastar: 1.07, bIZ: 0.54, bDZ: -0.54, cIZ: 0.22, cDZ: -0.22, parpSup: 1.06, cejaSubir: 0.45, bocaAbre: 0.32, bocaSonrisa: 0.8 };
                        }
                        if (!A.marcas.aterriza) {
                            A.marcas.aterriza = true;
                            A.impulso('aplastar', -3.2);
                            A.impulso('barriga', 3.8);
                            A.evento('sonido', 'pop');
                            A.parpadear();
                        }
                        const fade = 1 - suave((t - 0.65) / 0.45);
                        return { bocaAbre: 0.02 + 0.44 * fade, bocaSonrisa: 0.42 + 0.50 * fade, bocaDientes: 0.65 * fade, pomulo: 0.55 * fade };
                    }
                },
                // Saludo alegre: inclinación de cabeza de 12°, sonrisa radiante abierta con dentadura blanca y ola de manita
                saludar: {
                    duracion: 2.6,
                    f(t, o, A) {
                        const izq = !o || o.lado !== 'der';
                        const sube = campana(t, 0.0, 2.2);
                        const ola = Math.sin(t * TAU * 3.0) * 0.34 * sube;
                        if (t > 0.35 && !A.marcas.pestaneo) { A.marcas.pestaneo = true; A.parpadear(); }
                        const incCab12Deg = 0.2094;
                        const r = {
                            cabZ: (izq ? -incCab12Deg : incCab12Deg) * sube,
                            cabX: -0.06 * sube,
                            parpInf: -0.98 + 0.34 * sube,
                            parpSup: 0.98,
                            cejaSubir: 0.42 * sube,
                            pomulo: 0.65 * sube,
                            bocaAbre: 0.02 + 0.52 * sube,
                            bocaSonrisa: 0.42 + 0.54 * sube,
                            bocaDientes: 0.82 * sube,
                            incZ: (izq ? -0.06 : 0.06) * sube
                        };
                        if (izq) {
                            r.bIZ = 0.90 * sube + ola * 0.40; r.bIX = -0.06 * sube; r.bIY = 0.30 * sube;
                            r.cIZ = 0.34 * sube + ola * 0.62; r.cIX = 0.08 * sube;
                            r.bDZ = 0.04 * sube; r.bDX = -0.08 * sube; r.cDZ = 0.04 * sube;
                        } else {
                            r.bDZ = -0.90 * sube - ola * 0.40; r.bDX = -0.06 * sube; r.bDY = -0.30 * sube;
                            r.cDZ = -0.34 * sube - ola * 0.62; r.cDX = 0.08 * sube;
                            r.bIZ = -0.04 * sube; r.bIX = -0.08 * sube; r.cIZ = -0.04 * sube;
                        }
                        r.colaY = Math.sin(t * TAU * 1.5) * 0.35 * sube;
                        return r;
                    }
                },
                // Física Duang: anticipación comprimida -> salto estirado -> triple rebote gelatinoso acoplado a la pancita
                duang: {
                    duracion: 1.55,
                    f(t, o, A) {
                        if (t < 0.16) {
                            const u = t / 0.16;
                            return {
                                aplastar: 1.0 - 0.25 * suave(u),
                                barriga: 0.65 * suave(u),
                                bIZ: -0.12 * suave(u), bDZ: 0.12 * suave(u), bIX: 0.08 * suave(u), bDX: 0.08 * suave(u),
                                cIZ: -0.14 * suave(u), cDZ: 0.14 * suave(u),
                                bocaRedonda: 0.72 * suave(u), bocaAbre: 0.26 * suave(u), cejaSubir: 0.38 * suave(u),
                                parpSup: 1.02, cabX: 0.08 * suave(u)
                            };
                        }
                        if (t < 0.56) {
                            const u = (t - 0.16) / 0.40;
                            if (!A.marcas.salta) { A.marcas.salta = true; A.impulso('aplastar', 2.8); }
                            return {
                                saltoY: A.reducido ? 0.03 : 0.18 * 4 * u * (1 - u),
                                aplastar: 1.0 + 0.22 * Math.sin(u * Math.PI),
                                barriga: -0.42 * Math.sin(u * Math.PI),
                                bIZ: 0.96 * Math.sin(u * Math.PI), bDZ: -0.96 * Math.sin(u * Math.PI), bIX: -0.18, bDX: -0.18,
                                cIZ: 0.24 * Math.sin(u * Math.PI), cDZ: -0.24 * Math.sin(u * Math.PI),
                                pIX: (A.reducido ? -0.08 : -0.24) * Math.sin(u * Math.PI), pDX: (A.reducido ? -0.08 : -0.24) * Math.sin(u * Math.PI),
                                bocaAbre: 0.72, bocaSonrisa: 0.94, bocaDientes: 0.75, pomulo: 0.68, cejaSubir: 0.55,
                                parpSup: 1.06, parpInf: -0.94, ojoAbre: 1.05, colaX: -0.30 * Math.sin(u * Math.PI)
                            };
                        }
                        if (!A.marcas.cae1) {
                            A.marcas.cae1 = true;
                            A.impulso('aplastar', -4.2); A.impulso('barriga', 5.4); A.impulso('cabX', 1.8);
                            A.evento('texto', '¡Duang!'); A.evento('sonido', 'pop'); A.parpadear();
                        }
                        const fade = 1 - suave((t - 1.15) / 0.36);
                        if (t >= 0.66 && t < 0.90) {
                            const u2 = (t - 0.66) / 0.24;
                            if (!A.marcas.cae2 && t > 0.86) { A.marcas.cae2 = true; A.impulso('aplastar', -2.2); A.impulso('barriga', 2.8); }
                            return { saltoY: (A.reducido ? 0.01 : 0.052) * 4 * u2 * (1 - u2), aplastar: 1.08, bIZ: 0.40, bDZ: -0.40, cIZ: 0.14, cDZ: -0.14, bocaAbre: 0.54, bocaSonrisa: 0.92, bocaDientes: 0.72, ojoRisa: 0.24, parpInf: -0.72, parpSup: 0.92, pomulo: 0.72 };
                        }
                        if (t >= 0.90 && t < 1.14) {
                            const u3 = (t - 0.90) / 0.24;
                            if (!A.marcas.cae3 && t > 1.10) { A.marcas.cae3 = true; A.impulso('aplastar', -1.2); A.impulso('barriga', 1.6); }
                            return { saltoY: (A.reducido ? 0.004 : 0.020) * 4 * u3 * (1 - u3), aplastar: 1.04, bIZ: 0.20, bDZ: -0.20, cIZ: 0.08, cDZ: -0.08, bocaAbre: 0.38 * fade, bocaSonrisa: 0.42 + 0.50 * fade, bocaDientes: 0.65 * fade, pomulo: 0.60 * fade, parpInf: -0.98 + 0.24 * fade };
                        }
                        return { bocaAbre: 0.02 + 0.26 * fade, bocaSonrisa: 0.42 + 0.46 * fade, bocaDientes: 0.50 * fade, pomulo: 0.45 * fade };
                    }
                },
                // Baile al ritmo de maracas con sonrisón alegre y pómulos subidos
                bailar: {
                    duracion: 5.4,
                    f(t, o, A) {
                        const pulso = 1.55, fase = t * TAU * pulso / 2;
                        const env = campana(t, 0, 5.0);
                        const golpe = Math.abs(Math.sin(fase));
                        const n = Math.floor(t * pulso);
                        if (n !== A.marcas.compas && t < 5.0) { A.marcas.compas = n; A.evento('sonido', 'maracas'); }
                        return {
                            saltoY: A.reducido ? 0 : 0.042 * golpe * env,
                            incZ: Math.sin(fase) * 0.16 * env,
                            girY: Math.sin(fase * 0.5) * 0.36 * env,
                            cadZ: -Math.sin(fase) * 0.18 * env,
                            cabZ: Math.sin(fase + 0.6) * 0.18 * env,
                            cabX: -0.07 * golpe * env,
                            bIZ: (0.86 + Math.sin(fase) * 0.52) * env,
                            bDZ: -(0.86 - Math.sin(fase) * 0.52) * env,
                            bIX: (-0.18 + Math.cos(fase) * 0.12) * env,
                            bDX: (-0.18 - Math.cos(fase) * 0.12) * env,
                            cIZ: (0.18 + Math.sin(fase) * 0.28) * env,
                            cDZ: -(0.18 - Math.sin(fase) * 0.28) * env,
                            pIX: Math.max(0, Math.sin(fase)) * (A.reducido ? -0.08 : -0.30) * env,
                            pDX: Math.max(0, -Math.sin(fase)) * (A.reducido ? -0.08 : -0.30) * env,
                            colaY: Math.sin(fase * 2) * 0.50 * env,
                            colaX: -0.10 * env,
                            parpSup: 0.98 - 0.06 * env,
                            parpInf: -0.98 + 0.32 * env,
                            ojoRisa: 0.18 * golpe * env,
                            cejaSubir: 0.32 * golpe * env,
                            pomulo: 0.70 * env,
                            bocaAbre: 0.02 + (0.40 + 0.20 * golpe) * env,
                            bocaSonrisa: 0.42 + 0.54 * env,
                            bocaDientes: 0.78 * env
                        };
                    }
                },
                // Sorpresa tierna (capturas 05 y 11): manitas en mofletes, ojos muy abiertos y boquita en «o» chiquita
                sorpresa: {
                    duracion: 2.3,
                    f(t, o, A) {
                        if (!A.marcas.salto) {
                            A.marcas.salto = true;
                            A.impulso('incX', -1.5); A.impulso('aplastar', 1.7); A.impulso('barriga', 1.6);
                            A.evento('texto', '¡Uoooh!');
                        }
                        const env = campana(t, 0, 1.95);
                        const temblor = Math.sin(t * TAU * 11) * 0.015 * env;
                        return {
                            saltoY: A.reducido ? 0 : 0.036 * campana(t, 0, 0.28),
                            incX: -0.06 * env,
                            bIX: -0.18 * env, bIY: -0.32 * env, bIZ: 0.86 * env + temblor,
                            bDX: -0.18 * env, bDY: 0.32 * env, bDZ: -0.86 * env - temblor,
                            cIX: -0.18 * env, cIZ: 0.48 * env,
                            cDX: -0.18 * env, cDZ: -0.48 * env,
                            parpSup: 0.98 + 0.10 * env,
                            parpInf: -0.98 - 0.06 * env,
                            cejaSubir: 0.80 * env,
                            ojoAbre: 1.0 + 0.06 * env,
                            bocaRedonda: 0.96 * env,
                            bocaAbre: 0.02 + 0.46 * env,
                            bocaSonrisa: 0.42 * (1 - env),
                            bocaDientes: 0,
                            cabX: -0.08 * env
                        };
                    }
                },
                // Siesta pacífica (sticker_38): párpados cerrados, respiración profunda y burbujas Zzz
                siesta: {
                    duracion: Infinity,
                    f(t, o, A) {
                        const env = suave(t / 1.2);
                        const cicloZzz = Math.floor((t - 0.8) / 4.4);
                        if (cicloZzz !== A.marcas.zzz && t > 1.2) { A.marcas.zzz = cicloZzz; A.evento('zzz'); }
                        const ronquido = 0.06 * Math.max(0, Math.sin(t * TAU / 4.4)) * env;
                        return {
                            parpSup: 0.98 + (PARPADO_CERRADO - 0.98) * env,
                            parpInf: -0.98 + (PARPADO_CERRADO + 0.04 + 0.98) * env,
                            cabX: 0.16 * env, cabZ: 0.22 * env, incZ: 0.06 * env,
                            bIZ: -0.04 * env, bDZ: 0.04 * env, bIX: 0.08 * env, bDX: 0.08 * env,
                            cIZ: -0.08 * env, cDZ: 0.08 * env,
                            bocaAbre: 0.02 + (0.12 + ronquido) * env,
                            bocaRedonda: 0.82 * env,
                            bocaSonrisa: 0.42 * (1 - env)
                        };
                    }
                },

                /* ===== LAS 6 CARITAS ICÓNICAS DE LA SERIE (SEVENTH IMPRESSION) ===== */

                // 1) Sonrisón (capturas 03, 13 y 15): ojos alegres bien abiertos, sonrisa ancha limpia con arco dental blanco
                sonrison: {
                    duracion: 2.5,
                    f(t, o, A) {
                        if (!A.marcas.ok) {
                            A.marcas.ok = true;
                            A.impulso('aplastar', 1.1);
                            A.impulso('barriga', 1.8);
                            A.evento('texto', '¡Jijiji!');
                        }
                        const env = campana(t, 0, 2.15);
                        const balanceo = Math.sin(t * TAU * 1.1) * 0.09 * env;
                        return {
                            cabZ: 0.11 * env + balanceo,
                            cabX: -0.06 * env,
                            incZ: 0.04 * env,
                            parpSup: 0.98 - 0.06 * env,
                            parpInf: -0.98 + 0.40 * env,
                            ojoRisa: 0.20 * env,
                            cejaSubir: 0.38 * env,
                            pomulo: 0.85 * env,
                            bocaAbre: 0.02 + 0.48 * env,
                            bocaSonrisa: 0.42 + 0.68 * env,
                            bocaDientes: 0.95 * env,
                            bocaLengua: 0.85,
                            bIZ: 0.28 * env, bDZ: -0.28 * env, bIX: -0.12 * env, bDX: -0.12 * env,
                            cIZ: 0.14 * env, cDZ: -0.14 * env,
                            colaY: Math.sin(t * TAU * 2.4) * 0.42 * env
                        };
                    }
                },
                // 2) Carcajada (captura 02 / sticker_13): ojos cerrados en arco ^ ^, sonrisa abierta limpia con dientes y lengua dentro
                carcajada: {
                    duracion: 2.7,
                    f(t, o, A) {
                        if (!A.marcas.ok) {
                            A.marcas.ok = true;
                            A.impulso('barriga', 3.4);
                            A.evento('texto', '¡Jajaja!');
                        }
                        const env = campana(t, 0, 2.35);
                        const risa = Math.abs(Math.sin(t * TAU * 4.2));
                        return {
                            saltoY: A.reducido ? 0 : 0.022 * risa * env,
                            aplastar: 1 + (risa - 0.5) * 0.08 * env,
                            barriga: (0.28 + 0.45 * risa) * env,
                            cabX: (-0.14 - 0.05 * risa) * env,
                            cabZ: Math.sin(t * TAU * 1.6) * 0.12 * env,
                            incX: -0.06 * env,
                            parpSup: 0.98 + (-0.06 - 0.98) * env,
                            parpInf: -0.98 + (0.04 + 0.98) * env,
                            ojoRisa: 0.62 * env,
                            cejaSubir: 0.45 * env,
                            pomulo: 0.85 * env,
                            bocaAbre: 0.02 + (0.94 + 0.14 * risa) * env,
                            bocaSonrisa: 0.42 + 0.58 * env,
                            bocaDientes: 0.95 * env,
                            bocaFuera: 0,
                            bIZ: (0.76 + 0.20 * risa) * env, bDZ: -(0.76 + 0.20 * risa) * env,
                            bIX: -0.18 * env, bDX: -0.18 * env,
                            cIZ: (0.24 + 0.14 * risa) * env, cDZ: -(0.24 + 0.14 * risa) * env,
                            colaY: Math.sin(t * TAU * 3.5) * 0.50 * env
                        };
                    }
                },
                // 3) Burla ¡Bleh! (sticker_2 / 9 / 72): guiño travieso con ojo izquierdo bien abierto y lengüita fuera
                burla: {
                    duracion: 2.4,
                    f(t, o, A) {
                        if (!A.marcas.ok) {
                            A.marcas.ok = true;
                            A.impulso('cabZ', -1.0);
                            A.evento('texto', '¡Bleh! 😜');
                        }
                        const env = campana(t, 0, 2.05);
                        const meneoLengua = Math.sin(t * TAU * 4.5) * 0.10 * env;
                        return {
                            cabZ: -0.22 * env,
                            cabY: 0.15 * env,
                            cabX: 0.04 * env,
                            incZ: -0.05 * env,
                            guiñoDer: 0.98 * env,
                            parpSup: 0.98,
                            parpInf: -0.98 + 0.24 * env,
                            cejaSubir: 0.35 * env,
                            pomulo: 0.55 * env,
                            bocaAbre: 0.02 + 0.50 * env,
                            bocaSonrisa: 0.42 + 0.42 * env,
                            bocaDientes: 0.32 * env,
                            bocaFuera: (0.88 + meneoLengua) * env,
                            bDX: -0.18 * env, bDY: 0.26 * env, bDZ: -0.90 * env,
                            cDX: -0.14 * env, cDZ: -0.36 * env,
                            bIZ: 0.24 * env, cIZ: 0.10 * env,
                            colaY: Math.sin(t * TAU * 3.2) * 0.52 * env
                        };
                    }
                },
                // 4) Puchero / Ojitos tiernos (captura 01 frente triste): párpados inclinados / \, ojazos brillantes y boquita hacia abajo
                puchero: {
                    duracion: 2.8,
                    f(t, o, A) {
                        if (!A.marcas.ok) {
                            A.marcas.ok = true;
                            A.impulso('aplastar', -0.9);
                            A.evento('texto', '¿Porfiii? 🥺');
                        }
                        const env = campana(t, 0, 2.45);
                        const puch = Math.sin(t * TAU * 5.5) * 0.015 * env;
                        return {
                            cabX: 0.13 * env,
                            cabZ: 0.16 * env,
                            incX: 0.04 * env,
                            cejaTriste: 0.90 * env,
                            parpInclina: 0.32 * env,
                            parpSup: 0.98 - 0.32 * env,
                            parpInf: -0.98 + 0.16 * env,
                            ojoAbre: 1.0 + 0.05 * env,
                            bocaAbre: 0.02,
                            bocaPuchero: (0.92 + puch) * env,
                            bocaSonrisa: 0.42 * (1 - env) - 0.24 * env,
                            bIX: -0.18 * env, bIY: -0.22 * env, bIZ: 0.14 * env,
                            bDX: -0.18 * env, bDY: 0.22 * env, bDZ: -0.14 * env,
                            cIX: -0.18 * env, cIZ: 0.18 * env,
                            cDX: -0.18 * env, cDZ: -0.18 * env,
                            colaX: 0.18 * env
                        };
                    }
                },
                // 5) Pillo / Ceño fruncido (sticker_7 / 88): ceño travieso \ /, ojos entornados y bracitos delante sin chocar con el pecho
                pillo: {
                    duracion: 2.6,
                    f(t, o, A) {
                        if (!A.marcas.ok) {
                            A.marcas.ok = true;
                            A.impulso('aplastar', 0.9);
                            A.evento('texto', '¡Hmpf!');
                        }
                        const env = campana(t, 0, 2.25);
                        return {
                            cabY: -0.20 * env,
                            cabX: 0.05 * env,
                            cabZ: -0.08 * env,
                            girY: 0.14 * env,
                            incX: -0.04 * env,
                            cejaFruncir: 0.85 * env,
                            parpInclina: -0.28 * env,
                            parpSup: 0.98 - 0.42 * env,
                            parpInf: -0.98 + 0.36 * env,
                            pomulo: 0.30 * env,
                            bocaAbre: 0.02,
                            bocaSonrisa: 0.42 + 0.28 * env,
                            bIX: -0.18 * env, bIY: -0.18 * env, bIZ: 0.22 * env,
                            bDX: -0.18 * env, bDY: 0.18 * env, bDZ: -0.22 * env,
                            cIX: -0.16 * env, cIZ: 0.22 * env,
                            cDX: -0.16 * env, cDZ: -0.22 * env
                        };
                    }
                },
                // 6) Susto / Grito cómico (sticker_96 / 50): ojos como platos, boca abierta redonda adorable con dientes y brazos arriba
                susto: {
                    duracion: 2.2,
                    f(t, o, A) {
                        if (!A.marcas.ok) {
                            A.marcas.ok = true;
                            A.impulso('aplastar', 2.4);
                            A.impulso('cabX', -1.4);
                            A.impulso('incX', -1.5);
                            A.evento('texto', '¡Aaaah! 😱');
                        }
                        const env = campana(t, 0, 1.85);
                        const temblor = Math.sin(t * TAU * 13) * 0.022 * env;
                        return {
                            saltoY: A.reducido ? 0 : 0.055 * campana(t, 0, 0.26),
                            cabX: -0.10 * env,
                            incX: -0.05 * env,
                            cejaSubir: 0.85 * env,
                            parpSup: 0.98 + 0.10 * env,
                            parpInf: -0.98 - 0.06 * env,
                            ojoAbre: 1.0 + 0.06 * env,
                            bocaAbre: 0.02 + (0.94 + temblor * 1.4) * env,
                            bocaRedonda: 0.36 * env,
                            bocaSonrisa: 0.42 * (1 - env),
                            bocaDientes: 0.78 * env,
                            bIZ: 1.06 * env + temblor, bDZ: -1.06 * env - temblor,
                            bIX: -0.18 * env, bDX: -0.18 * env,
                            cIZ: 0.22 * env, cDZ: -0.22 * env,
                            colaX: -0.20 * env
                        };
                    }
                },

                /* ===== REACCIONES TÁCTILES POR ZONA Y MICRO-OCIO ===== */
                mimos: {
                    duracion: 1.65,
                    f(t, o, A) {
                        if (!A.marcas.mimo) { A.marcas.mimo = true; A.impulso('cabZ', ((o && o.lado) || 1) * 0.8); }
                        const env = campana(t, 0, 1.35), lado = (o && o.lado) || 1;
                        return {
                            cabZ: 0.24 * lado * env, cabX: -0.07 * env, incZ: 0.05 * lado * env,
                            parpSup: 0.98 + (-0.05 - 0.98) * env, parpInf: -0.98 + (0.04 + 0.98) * env,
                            ojoRisa: 0.56 * env, pomulo: 0.75 * env,
                            bocaAbre: 0.02 + 0.26 * env, bocaSonrisa: 0.42 + 0.52 * env, bocaDientes: 0.65 * env,
                            bIZ: 0.22 * env, bDZ: -0.22 * env, cIZ: 0.12 * env, cDZ: -0.12 * env, colaY: Math.sin(t * TAU * 2.8) * 0.38 * env
                        };
                    }
                },
                pancita: {
                    duracion: 1.3,
                    f(t, o, A) {
                        if (!A.marcas.ok) {
                            A.marcas.ok = true;
                            A.impulso('barriga', 5.6); A.impulso('aplastar', -2.8); A.impulso('incX', 0.9);
                            A.evento('texto', '¡Duang!'); A.parpadear(true);
                        }
                        const env = campana(t, 0, 1.0);
                        return {
                            parpSup: 0.98 - 0.08 * env, parpInf: -0.98 + 0.38 * env, ojoRisa: 0.28 * env, pomulo: 0.75 * env,
                            bocaAbre: 0.02 + 0.46 * env, bocaSonrisa: 0.42 + 0.54 * env, bocaDientes: 0.80 * env,
                            bIZ: -0.06 * env, bDZ: 0.06 * env, bIX: -0.14 * env, bDX: -0.14 * env,
                            cIX: -0.14 * env, cDX: -0.14 * env,
                            cabZ: 0.08 * Math.sin(t * TAU * 2.2) * env, cabX: -0.06 * env
                        };
                    }
                },
                colita: {
                    duracion: 1.4,
                    f(t, o, A) {
                        if (!A.marcas.cola) { A.marcas.cola = true; A.impulso('barriga', 1.4); }
                        const env = campana(t, 0, 1.15);
                        return {
                            colaY: Math.sin(t * TAU * 4.5) * 0.56 * env, colaX: -0.14 * env + Math.sin(t * TAU * 2.25) * 0.08 * env,
                            girY: 0.22 * env, cabY: 0.52 * env, cabZ: -0.10 * env, cabX: -0.06 * env,
                            cejaSubir: 0.35 * env, pomulo: 0.55 * env,
                            parpInf: -0.98 + 0.30 * env, bocaAbre: 0.02 + 0.28 * env, bocaSonrisa: 0.42 + 0.50 * env, bocaDientes: 0.65 * env
                        };
                    }
                },
                saltito: {
                    duracion: 0.95,
                    f(t, o, A) {
                        if (t < 0.42) {
                            const u = t / 0.42, arco = Math.sin(u * Math.PI), cosquilleo = Math.sin(t * TAU * 9) * (A.reducido ? 0.04 : 0.10) * arco;
                            const baseP = (A.reducido ? -0.08 : -0.30) * arco;
                            return {
                                saltoY: A.reducido ? 0 : 0.075 * 4 * u * (1 - u), pIX: baseP + cosquilleo, pDX: baseP - cosquilleo,
                                aplastar: 1.06, bIZ: 0.44, bDZ: -0.44, cIZ: 0.18, cDZ: -0.18, cejaSubir: 0.45, pomulo: 0.68,
                                bocaAbre: 0.54, bocaSonrisa: 0.92, bocaDientes: 0.75, parpInf: -0.68
                            };
                        }
                        if (!A.marcas.cae) { A.marcas.cae = true; A.impulso('aplastar', -2.4); A.impulso('barriga', 2.4); A.evento('sonido', 'pop'); }
                        const fade = 1 - suave((t - 0.55) / 0.35);
                        return { bocaAbre: 0.02 + 0.32 * fade, bocaSonrisa: 0.42 + 0.46 * fade, bocaDientes: 0.60 * fade };
                    }
                },
                despertar: {
                    duracion: 1.4,
                    f(t, o, A) {
                        if (!A.marcas.ok) { A.marcas.ok = true; A.impulso('aplastar', 1.6); A.impulso('cabX', -1.4); }
                        const env = campana(t, 0, 1.0);
                        return { parpSup: 0.98 + 0.08 * env, cejaSubir: 0.45 * env, ojoAbre: 1 + 0.05 * env, bocaRedonda: 0.72 * env, bocaAbre: 0.02 + 0.40 * env, bIZ: 0.36 * env, bDZ: -0.36 * env, cIZ: 0.14 * env, cDZ: -0.14 * env };
                    }
                },
                mirarAlrededor: {
                    duracion: 3.2,
                    f(t) {
                        const env = campana(t, 0, 2.8);
                        return {
                            cabY: Math.sin(t * TAU / 3.0) * 0.38 * env,
                            cabZ: Math.sin(t * TAU / 3.0) * 0.08 * env,
                            cejaSubir: 0.28 * Math.max(0, Math.sin(t * TAU / 3.0)) * env,
                            colaY: Math.sin(t * 6) * 0.16 * env
                        };
                    }
                },
                curiosidadOcio: {
                    duracion: 2.2,
                    f(t) {
                        const env = campana(t, 0, 1.85);
                        return {
                            cabZ: 0.14 * env, cabX: -0.05 * env,
                            cejaSubir: 0.36 * env, parpSup: 0.98 + 0.06 * env,
                            bocaAbre: 0.02 + 0.12 * env, bocaSonrisa: 0.42 + 0.26 * env, pomulo: 0.30 * env
                        };
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
                let tParpadeo = -1, proxParpadeo = 1.6 + azar() * 2.0, dobleParpadeo = false;
                const A = {
                    reducido: !!op.reducido, marcas: {}, tiempo: 0,
                    impulso(canal, vel) { if (m[canal]) m[canal].vel += vel * (A.reducido ? 0.35 : 1); },
                    parpadear(doble) { tParpadeo = 0; dobleParpadeo = !!doble; },
                    evento(tipo, dato) { if (op.alEvento) op.alEvento(tipo, dato); }
                };
                let accion = null, tAccion = 0, opAccion = null;
                let proxOcio = 8 + azar() * 6;
                let acumulado = 0;
                const toques = [0, 1, 2, 3].map(() => ({ x: 0, y: -5, z: 0, v: 0, vel: 0 }));
                let toqueSig = 0;
                const mirada = { yaw: 0, pitch: 0 };
                const sacada = { yaw: 0, pitch: 0, tarYaw: 0, tarPitch: 0 };
                let proxSacada = 0.9 + azar() * 0.7;
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
                        if (tAccion >= ACCIONES[accion].duracion) {
                            accion = null; A.marcas = {};
                            A.evento('accionFin', null);
                        }
                    }
                    objetivos();
                    Object.keys(m).forEach((k) => {
                        const c = m[k];
                        const a = c.w * c.w * (c.obj - c.v) - 2 * c.z * c.w * c.vel;
                        c.vel += a * dt; c.v += c.vel * dt;
                    });
                    if (tParpadeo >= 0) {
                        tParpadeo += dt;
                        if (tParpadeo > 0.17) {
                            tParpadeo = -1;
                            if (dobleParpadeo) { dobleParpadeo = false; proxParpadeo = 0.12 + azar() * 0.06; }
                            else proxParpadeo = 2.4 + azar() * 3.4;
                        }
                    } else if (accion !== 'siesta') {
                        proxParpadeo -= dt;
                        if (proxParpadeo <= 0) { tParpadeo = 0; dobleParpadeo = azar() < 0.22; }
                    }
                    // Micro-gestos vivos cuando descansa tranquilo
                    if (!accion && op.ocio !== false) {
                        proxOcio -= dt;
                        if (proxOcio <= 0) {
                            proxOcio = 9 + azar() * 7;
                            const r = azar();
                            iniciar(r < 0.45 ? 'mirarAlrededor' : (r < 0.78 ? 'curiosidadOcio' : 'colita'), null);
                        }
                    }
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
                    const desfasePechoRad = (0.35 / durRespira) * TAU;
                    const respBelly = Math.sin(faseResp) + 0.18 * Math.sin(2 * faseResp - 0.45);
                    const respPecho = Math.sin(faseResp - desfasePechoRad) + 0.15 * Math.sin(2 * (faseResp - desfasePechoRad) - 0.45);
                    const ocio = accion === 'bailar' ? 0.3 : 1;
                    const R = (b) => b.userData.reposo;

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

                    const pe = 1 + 0.008 * respPecho * amp + g('pecho');
                    huesos.pecho.scale.set(1 + 0.005 * respPecho * amp, pe, 1 + 0.005 * respPecho * amp);
                    huesos.cabeza.rotation.set(
                        g('cabX') + 0.018 * respPecho * amp + mirada.pitch * 0.26,
                        g('cabY') + mirada.yaw * 0.30,
                        g('cabZ')
                    );

                    const b = g('barriga') * 0.065 + 0.026 * respBelly * amp * (accion === 'siesta' ? 1.8 : 1);
                    huesos.barriga.scale.set(1 + b * 0.60, 1 + b * 0.35, 1 + b);
                    huesos.barriga.position.set(R(huesos.barriga).p.x, R(huesos.barriga).p.y + b * 0.006, R(huesos.barriga).p.z + b * 0.024);

                    const vaivenZ = 0.024 * respBelly * amp * ocio;
                    const vaivenX = -0.010 * respPecho * amp * ocio;
                    // Hombros anclados en su pivote de reposo (sin desplazamiento lineal al alzar: cero efecto aleta)
                    huesos.brazoIzq.position.copy(R(huesos.brazoIzq).p);
                    huesos.brazoDer.position.copy(R(huesos.brazoDer).p);
                    huesos.brazoIzq.rotation.set(BRAZO_NEUTRO.x + g('bIX') + vaivenX, BRAZO_NEUTRO.y + g('bIY'), BRAZO_NEUTRO.z + g('bIZ') + vaivenZ);
                    huesos.brazoDer.rotation.set(BRAZO_NEUTRO.x + g('bDX') + vaivenX, -BRAZO_NEUTRO.y + g('bDY'), -BRAZO_NEUTRO.z + g('bDZ') - vaivenZ);
                    if (huesos.codoIzq && huesos.codoDer) {
                        const vaivenCodoZ = 0.014 * respPecho * amp * ocio;
                        huesos.codoIzq.position.copy(R(huesos.codoIzq).p);
                        huesos.codoDer.position.copy(R(huesos.codoDer).p);
                        huesos.codoIzq.rotation.set(CODO_NEUTRO.x + g('cIX'), CODO_NEUTRO.y, CODO_NEUTRO.z + g('cIZ') + vaivenCodoZ);
                        huesos.codoDer.rotation.set(CODO_NEUTRO.x + g('cDX'), -CODO_NEUTRO.y, -CODO_NEUTRO.z + g('cDZ') - vaivenCodoZ);
                    }

                    huesos.piernaIzq.rotation.set(g('pIX'), 0, 0);
                    huesos.piernaDer.rotation.set(g('pDX'), 0, 0);

                    // Cola larga en cadena de 3 huesos (cola -> colaMedia -> colaPunta) con desfase progresivo y sin atravesar suelo ni piernas
                    const vaivenColaResp = 0.026 * Math.sin(faseResp - 0.55) * amp * ocio;
                    const meneoY = (0.044 * Math.sin(t * TAU / 3.2) + vaivenColaResp) * amp * ocio;
                    const meneoX = (0.016 * Math.sin(t * TAU / 4.1 + 0.8) + 0.010 * respPecho) * amp * ocio;
                    const mediaY = (0.060 * Math.sin(t * TAU / 3.2 - 0.55) + vaivenColaResp * 1.15) * amp * ocio;
                    const mediaX = (0.022 * Math.sin(t * TAU / 4.1 + 0.3) + 0.012 * respPecho) * amp * ocio;
                    const puntaY = (0.076 * Math.sin(t * TAU / 3.2 - 1.10) + vaivenColaResp * 1.30) * amp * ocio;
                    const puntaX = (0.028 * Math.sin(t * TAU / 4.1 - 0.2) + 0.014 * respPecho) * amp * ocio;
                    const cX = g('colaX'), cY = g('colaY');
                    huesos.cola.position.copy(R(huesos.cola).p);
                    huesos.cola.rotation.set(cX * 0.52 + meneoX, cY * 0.48 + meneoY, 0);
                    if (huesos.colaMedia) {
                        huesos.colaMedia.position.copy(R(huesos.colaMedia).p);
                        huesos.colaMedia.rotation.set(cX * 0.34 + mediaX, cY * 0.40 + mediaY, 0);
                    }
                    huesos.colaPunta.position.copy(R(huesos.colaPunta).p);
                    huesos.colaPunta.rotation.set(cX * 0.24 + puntaX, cY * 0.34 + puntaY, 0);

                    // Ojos, párpados volumétricos con inclinación/arco y AO dinámico
                    const sup = g('parpSup'), inf = g('parpInf');
                    const centro = (sup + inf) / 2 * 0.3 + PARPADO_CERRADO * 0.7;
                    const totalYaw = mirada.yaw + sacada.yaw;
                    const totalPitch = mirada.pitch + sacada.pitch;
                    const arcoRisa = g('ojoRisa');
                    const inclina = g('parpInclina');

                    if (modelo.ojos.arquear) modelo.ojos.arquear(arcoRisa);

                    modelo.ojos.forEach((o) => {
                        o.globo.rotation.set(totalPitch * 0.56, (o.giroBase || 0) + totalYaw * 0.52, 0);
                        if (!o.escalaBase) o.escalaBase = { globo: o.globo.scale.clone(), sup: o.sup.scale.clone(), inf: o.inf.scale.clone() };
                        const abre = g('ojoAbre');
                        o.globo.scale.copy(o.escalaBase.globo).multiplyScalar(abre);
                        o.sup.scale.copy(o.escalaBase.sup).multiplyScalar(abre);
                        o.inf.scale.copy(o.escalaBase.inf).multiplyScalar(abre);

                        const lagOjo = o.lado > 0 ? 0 : 0.008;
                        const tOjo = tParpadeo >= 0 ? tParpadeo - lagOjo : -1;
                        const extraGuiño = o.lado < 0 ? Math.min(1, Math.max(0, g('guiñoDer'))) : 0;
                        const cierreSup = Math.max(extraGuiño, evalParpadeo(tOjo, 0.052, 0.092));
                        const cierreInf = Math.max(extraGuiño, evalParpadeo(tOjo - 0.012, 0.046, 0.088));

                        const filoSup = sup + (centro - sup) * cierreSup;
                        const filoInf = inf + (centro + 0.04 - inf) * cierreInf;
                        const incLat = inclina * o.lado; // +inclina = cejas tristes / \ ; -inclina = ceño \ /
                        o.sup.rotation.set(-filoSup, 0, -incLat * 0.85);
                        o.inf.rotation.set(-filoInf, 0, -incLat * 0.30);

                        if (o.uGloboAPivote && o.uOjoAO) {
                            o.globo.updateMatrix();
                            o.uGloboAPivote.value.setFromMatrix4(o.globo.matrix);
                            o.uOjoAO.value.set(filoSup, filoInf, arcoRisa * 0.42, -incLat * 0.70);
                        }
                        if (o.brillos) {
                            o.brillos.forEach((br) => {
                                const arcoB = arcoRisa * 0.42 * (1 - Math.min(1, br.xLat * br.xLat * 1.8));
                                const incB = -incLat * 0.70 * br.xLat;
                                br.malla.visible = (br.elev + br.radio * 0.65 < filoSup + arcoB + incB)
                                    && (br.elev - br.radio * 0.65 > filoInf + arcoB * 0.65 + incB * 0.4);
                            });
                        }
                    });

                    // Cara deformable + Boca 3D con arcos dentales y lengua
                    const forma = {
                        abierta: Math.max(0, g('bocaAbre')),
                        sonrisa: g('bocaSonrisa'),
                        redonda: Math.min(1, Math.max(0, g('bocaRedonda'))),
                        puchero: Math.min(1, Math.max(0, g('bocaPuchero'))),
                        dientes: Math.min(1, Math.max(0, g('bocaDientes'))),
                        lengua: Math.min(1, Math.max(0, g('bocaLengua'))),
                        fuera: Math.min(1.2, Math.max(0, g('bocaFuera'))),
                        cejaSubir: Math.max(0, g('cejaSubir')),
                        cejaFruncir: Math.max(0, g('cejaFruncir')),
                        cejaTriste: Math.max(0, g('cejaTriste')),
                        pomulo: Math.max(0, g('pomulo'))
                    };
                    const f0 = modelo.boca.forma;
                    const deltaBoca = Math.abs(f0.abierta - forma.abierta) + Math.abs(f0.sonrisa - forma.sonrisa)
                        + Math.abs(f0.redonda - forma.redonda) + Math.abs((f0.puchero || 0) - forma.puchero)
                        + Math.abs(f0.dientes - forma.dientes) + Math.abs((f0.fuera || 0) - forma.fuera)
                        + Math.abs((f0.cejaSubir || 0) - forma.cejaSubir) + Math.abs((f0.cejaFruncir || 0) - forma.cejaFruncir)
                        + Math.abs((f0.cejaTriste || 0) - forma.cejaTriste) + Math.abs((f0.pomulo || 0) - forma.pomulo);
                    if (deltaBoca > 0.0025) {
                        modelo.boca.actualizar(forma);
                    }

                    if (modelo.uniformes && modelo.uniformes.uToque) {
                        toques.forEach((q, i) => modelo.uniformes.uToque.value[i].set(q.x, q.y, q.z, q.v));
                    }
                }

                function actualizarMirada(dt) {
                    let yaw = 0, pitch = 0;
                    if (mirarObjetivo && modelo.ojos && modelo.ojos[0]) {
                        const cab = huesos.pecho;
                        const local = cab.worldToLocal(mirarObjetivo.clone());
                        if (!vOjo) vOjo = local.clone();
                        vOjo.copy(huesos.cabeza.position);
                        const po = modelo.ojos[0].pivote.position;
                        vOjo.y += po.y; vOjo.z += po.z;
                        const d = local.sub(vOjo);
                        if (d.z > -0.08) {
                            const distH = Math.hypot(d.x, d.z);
                            yaw = Math.atan2(d.x, Math.max(0.12, d.z));
                            pitch = -Math.atan2(d.y, Math.max(0.15, distH));
                        }
                        yaw = Math.max(-0.62, Math.min(0.62, yaw));
                        pitch = Math.max(-0.36, Math.min(0.32, pitch));
                    }
                    // En «pillo» mira de reojo con picardía
                    if (accion === 'pillo') yaw += 0.34;
                    if (accion === 'burla') yaw -= 0.18;

                    if (accion !== 'siesta') {
                        proxSacada -= dt;
                        if (proxSacada <= 0) {
                            proxSacada = 0.9 + azar() * 0.7;
                            const rad = (1.0 + azar() * 1.0) * (Math.PI / 180);
                            const ang = azar() * TAU;
                            sacada.tarYaw = Math.cos(ang) * rad;
                            sacada.tarPitch = Math.sin(ang) * rad;
                        }
                    } else {
                        sacada.tarYaw = 0; sacada.tarPitch = 0;
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
                        if (!pt && (region === 'pancita' || region === 'cuerpo')) pt = { x: 0, y: 0.28, z: 0.14 };
                        else if (!pt && region === 'cabeza') pt = { x: 0, y: 0.70, z: 0.14 };
                        else if (!pt && region === 'pie') pt = { x: 0.08, y: 0.04, z: 0.08 };
                        else if (!pt && region === 'cola') pt = { x: 0, y: 0.18, z: -0.22 };
                        if (pt) {
                            const q = toques[toqueSig];
                            toqueSig = (toqueSig + 1) % toques.length;
                            q.x = pt.x; q.y = pt.y; q.z = pt.z; q.v = 0;
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

            return { crear, hornear, ACCIONES, CANALES, BRAZO_NEUTRO, CODO_NEUTRO };
        })();
