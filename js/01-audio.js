        /* ==============================================================
           1. WEB AUDIO API SYNTHESIZER (NO EXTERNAL AUDIO FILES NEEDED)
        ============================================================== */
        let audioCtx = null;
        let isMuted = false;

        function initAudio() {
            if (!audioCtx) {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (AudioContextClass) {
                    audioCtx = new AudioContextClass();
                }
            }
            if (audioCtx && audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
        }

        // Auto unlock AudioContext on first gesture (guarantees iOS Safari & Android audio unlock)
        const unlockAudio = () => {
            initAudio();
            if (audioCtx) {
                try {
                    const buf = audioCtx.createBuffer(1, 1, 22050);
                    const src = audioCtx.createBufferSource();
                    src.buffer = buf;
                    src.connect(audioCtx.destination);
                    src.start(0);
                } catch(e) {}
            }
            ['pointerdown', 'touchstart', 'click', 'keydown'].forEach(ev => {
                document.removeEventListener(ev, unlockAudio);
            });
        };
        ['pointerdown', 'touchstart', 'click', 'keydown'].forEach(ev => {
            document.addEventListener(ev, unlockAudio, { passive: true });
        });

        // Resume audio on visibility change if iOS suspended it
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && audioCtx && audioCtx.state === 'suspended' && !isMuted) {
                audioCtx.resume();
            }
        });

        function toggleAudioMute() {
            isMuted = !isMuted;
            const icon = document.getElementById('sound-icon');
            if (isMuted) {
                icon.className = 'fa-solid fa-volume-xmark text-lg text-rose-500';
            } else {
                icon.className = 'fa-solid fa-volume-high text-lg text-amber-800';
                playSound('pop');
            }
        }

        function playSound(type) {
            if (isMuted) return;
            try {
                initAudio();
                if (!audioCtx) return;

                const now = audioCtx.currentTime;
                if (SONIDOS_BOTONERA[type]) {
                    SONIDOS_BOTONERA[type](audioCtx, now, audioCtx.destination);
                    return;
                }
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);

                if (type === 'duang') {
                    // Cute elastic "Duang~" boing sound
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(220, now);
                    osc.frequency.exponentialRampToValueAtTime(560, now + 0.12);
                    osc.frequency.exponentialRampToValueAtTime(290, now + 0.25);
                    osc.frequency.exponentialRampToValueAtTime(450, now + 0.38);
                    gain.gain.setValueAtTime(0.32, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
                    osc.start(now);
                    osc.stop(now + 0.42);
                } else if (type === 'pop') {
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(450, now);
                    osc.frequency.exponentialRampToValueAtTime(880, now + 0.09);
                    gain.gain.setValueAtTime(0.24, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
                    osc.start(now);
                    osc.stop(now + 0.11);
                } else if (type === 'chomp') {
                    // Double crunch bite (ñam-ñam)
                    [0, 0.09].forEach(offset => {
                        const o = audioCtx.createOscillator();
                        const g = audioCtx.createGain();
                        o.type = 'sawtooth';
                        o.frequency.setValueAtTime(320, now + offset);
                        o.frequency.exponentialRampToValueAtTime(680, now + offset + 0.07);
                        g.gain.setValueAtTime(0.22, now + offset);
                        g.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.08);
                        o.connect(g);
                        g.connect(audioCtx.destination);
                        o.start(now + offset);
                        o.stop(now + offset + 0.08);
                    });
                } else if (type === 'fire') {
                    // Crackly flame whoosh
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(720, now);
                    osc.frequency.exponentialRampToValueAtTime(160, now + 0.38);
                    gain.gain.setValueAtTime(0.28, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
                    osc.start(now);
                    osc.stop(now + 0.4);
                } else if (type === 'laugh') {
                    // Giggling chuckle melody
                    const freqs = [520, 640, 520, 700, 580];
                    freqs.forEach((f, idx) => {
                        const o = audioCtx.createOscillator();
                        const g = audioCtx.createGain();
                        o.type = 'sine';
                        o.frequency.setValueAtTime(f, now + idx * 0.07);
                        g.gain.setValueAtTime(0.2, now + idx * 0.07);
                        g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.08);
                        o.connect(g);
                        g.connect(audioCtx.destination);
                        o.start(now + idx * 0.07);
                        o.stop(now + idx * 0.07 + 0.08);
                    });
                } else if (type === 'sleep') {
                    // Peaceful breathing lullaby tone
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(330, now);
                    osc.frequency.exponentialRampToValueAtTime(220, now + 0.48);
                    gain.gain.setValueAtTime(0.18, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.52);
                    osc.start(now);
                    osc.stop(now + 0.52);
                } else if (type === 'maracas') {
                    // Shaker rattle emulation
                    for (let i = 0; i < 4; i++) {
                        const o = audioCtx.createOscillator();
                        const g = audioCtx.createGain();
                        o.type = 'square';
                        o.frequency.setValueAtTime(750 + Math.random() * 400, now + i * 0.08);
                        g.gain.setValueAtTime(0.09, now + i * 0.08);
                        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.05);
                        o.connect(g);
                        g.connect(audioCtx.destination);
                        o.start(now + i * 0.08);
                        o.stop(now + i * 0.08 + 0.05);
                    }
                } else if (type === 'fanfare') {
                    // Triumphant brass chords
                    const notes = [523.25, 659.25, 783.99, 1046.50];
                    notes.forEach((freq, idx) => {
                        const o = audioCtx.createOscillator();
                        const g = audioCtx.createGain();
                        o.type = 'triangle';
                        o.frequency.setValueAtTime(freq, now + idx * 0.1);
                        g.gain.setValueAtTime(0.22, now + idx * 0.1);
                        g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.28);
                        o.connect(g);
                        g.connect(audioCtx.destination);
                        o.start(now + idx * 0.1);
                        o.stop(now + idx * 0.1 + 0.28);
                    });
                } else if (type === 'slurp') {
                    // Funny straw slurp / drink sound
                    const oscSlurp = audioCtx.createOscillator();
                    const gainSlurp = audioCtx.createGain();
                    oscSlurp.type = 'sine';
                    oscSlurp.frequency.setValueAtTime(400, now);
                    oscSlurp.frequency.linearRampToValueAtTime(800, now + 0.08);
                    oscSlurp.frequency.exponentialRampToValueAtTime(250, now + 0.22);
                    oscSlurp.frequency.exponentialRampToValueAtTime(650, now + 0.35);
                    gainSlurp.gain.setValueAtTime(0.22, now);
                    gainSlurp.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
                    oscSlurp.connect(gainSlurp);
                    gainSlurp.connect(audioCtx.destination);
                    oscSlurp.start(now);
                    oscSlurp.stop(now + 0.36);
                } else if (type === 'bleh') {
                    // Comic tongue stick-out / raspberry
                    [0, 0.07, 0.14].forEach((offset, idx) => {
                        const o = audioCtx.createOscillator();
                        const g = audioCtx.createGain();
                        o.type = 'sawtooth';
                        o.frequency.setValueAtTime(idx % 2 === 0 ? 190 : 260, now + offset);
                        g.gain.setValueAtTime(0.25, now + offset);
                        g.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.06);
                        o.connect(g);
                        g.connect(audioCtx.destination);
                        o.start(now + offset);
                        o.stop(now + offset + 0.06);
                    });
                } else if (type === 'pirate') {
                    // Pirate cannonball boing / fanfare
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(140, now);
                    osc.frequency.exponentialRampToValueAtTime(320, now + 0.1);
                    osc.frequency.exponentialRampToValueAtTime(110, now + 0.35);
                    gain.gain.setValueAtTime(0.3, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
                    osc.start(now);
                    osc.stop(now + 0.38);
                } else if (type === 'run') {
                    // Cartoon rapid footsteps / skitter
                    [0, 0.06, 0.12, 0.18, 0.24].forEach((offset, idx) => {
                        const o = audioCtx.createOscillator();
                        const g = audioCtx.createGain();
                        o.type = 'triangle';
                        o.frequency.setValueAtTime(380 + (idx % 2) * 120, now + offset);
                        g.gain.setValueAtTime(0.2, now + offset);
                        g.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.045);
                        o.connect(g);
                        g.connect(audioCtx.destination);
                        o.start(now + offset);
                        o.stop(now + offset + 0.045);
                    });
                } else if (type === 'tail') {
                    // Elastic tail whoosh-boing
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(600, now);
                    osc.frequency.exponentialRampToValueAtTime(180, now + 0.15);
                    osc.frequency.exponentialRampToValueAtTime(420, now + 0.28);
                    gain.gain.setValueAtTime(0.26, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
                    osc.start(now);
                    osc.stop(now + 0.32);
                } else if (type === 'surprise') {
                    // Comic curious surprise squeak
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(280, now);
                    osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
                    gain.gain.setValueAtTime(0.22, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
                    osc.start(now);
                    osc.stop(now + 0.24);
                }
            } catch (e) {
                // Audio autoplay fallback
            }
        }

        /* ==============================================================
           1B. SONIDOS DE LA BOTONERA (B1, web 4.3.0)
           Uno distinto y coherente con cada botón. Sintetizados con Web Audio (regla 3 de AGENTS.md;
           el usuario eligió la opción B2-B «recrearlos» mientras decide si usar clips reales).
           Cada sonido es una función (contexto, instante, destino): así playSound los toca en vivo y
           se pueden renderizar sin altavoces (OfflineAudioContext) para medir su volumen.
           Vocales de dibujo: un diente de sierra pasa por dos filtros de «formante» (F1 y F2);
           moviendo esos filtros se pasa de una vocal a otra (a → o → u en el bostezo, u → a en el «buaaa»).
        ============================================================== */
        const VOCALES = { a: [1000, 1500], e: [550, 2100], i: [400, 2700], o: [700, 1100], u: [450, 900], m: [300, 1000] };
        const buffersRuido = new WeakMap();

        function ruidoBlanco(ctx) {
            let b = buffersRuido.get(ctx);
            if (!b) {
                b = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
                const d = b.getChannelData(0);
                for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
                buffersRuido.set(ctx, b);
            }
            return b;
        }

        // Ráfaga de ruido filtrado: palmas, crujidos, ronquidos y sorbidos
        function rafagaRuido(ctx, destino, t, dur, tipoFiltro, frec, q, volumen, ataque) {
            const src = ctx.createBufferSource();
            src.buffer = ruidoBlanco(ctx);
            const f = ctx.createBiquadFilter();
            f.type = tipoFiltro;
            f.frequency.setValueAtTime(frec, t);
            f.Q.value = q;
            const g = ctx.createGain();
            g.gain.value = 0.0001;   // sin esto vale 1 hasta su primer evento y se cuela un clic al arrancar
            const a = ataque || 0.004;
            g.gain.setValueAtTime(0.0001, t);
            g.gain.exponentialRampToValueAtTime(volumen, t + a);
            g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
            src.connect(f);
            f.connect(g);
            g.connect(destino);
            src.start(t, Math.random() * 0.5);
            src.stop(t + dur + 0.02);
            return f;
        }

        /* «Voz» de dibujo: tonos = [[s, Hz], ...] (rampa entre puntos), vocales = [[s, 'a'], ...];
           vibrato = velocidad del temblor en Hz y temblor = su profundidad (proporción del tono) */
        function vozDibujo(ctx, destino, t, dur, tonos, vocales, volumen, vibrato, temblor) {
            const osc = ctx.createOscillator();
            osc.type = 'sawtooth';
            tonos.forEach(([s, hz], i) => {
                if (i === 0) osc.frequency.setValueAtTime(hz, t + s);
                else osc.frequency.linearRampToValueAtTime(hz, t + s);
            });
            const lfo = ctx.createOscillator();
            const lfoG = ctx.createGain();
            lfo.frequency.value = vibrato || 6;
            lfoG.gain.value = tonos[0][1] * (temblor || 0.03);
            lfo.connect(lfoG);
            lfoG.connect(osc.frequency);
            const f1 = ctx.createBiquadFilter();
            const f2 = ctx.createBiquadFilter();
            f1.type = 'bandpass';
            f2.type = 'bandpass';
            f1.Q.value = 5;
            f2.Q.value = 7;
            vocales.forEach(([s, v], i) => {
                const [a, b] = VOCALES[v];
                if (i === 0) {
                    f1.frequency.setValueAtTime(a, t + s);
                    f2.frequency.setValueAtTime(b, t + s);
                } else {
                    f1.frequency.linearRampToValueAtTime(a, t + s);
                    f2.frequency.linearRampToValueAtTime(b, t + s);
                }
            });
            const g2 = ctx.createGain();
            g2.gain.value = 0.6;
            const salida = ctx.createGain();
            salida.gain.value = 0.0001;
            salida.gain.setValueAtTime(0.0001, t);
            salida.gain.exponentialRampToValueAtTime(volumen, t + Math.min(0.04, dur / 4));
            salida.gain.setValueAtTime(volumen, t + dur * 0.7);
            salida.gain.exponentialRampToValueAtTime(0.0001, t + dur);
            osc.connect(f1);
            osc.connect(f2);
            f1.connect(salida);
            f2.connect(g2);
            g2.connect(salida);
            salida.connect(destino);
            osc.start(t);
            lfo.start(t);
            osc.stop(t + dur + 0.02);
            lfo.stop(t + dur + 0.02);
        }

        function tonoSimple(ctx, destino, t, dur, tipo, desde, hasta, volumen) {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            g.gain.value = 0.0001;
            o.type = tipo;
            o.frequency.setValueAtTime(desde, t);
            o.frequency.exponentialRampToValueAtTime(hasta, t + dur);
            g.gain.setValueAtTime(volumen, t);
            g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
            o.connect(g);
            g.connect(destino);
            o.start(t);
            o.stop(t + dur + 0.02);
        }

        const SONIDOS_BOTONERA = {
            // Voces
            grito(ctx, t, d) {   // «¡Aaaah!»… se calla… «¡AAAAH!» (como el #85)
                vozDibujo(ctx, d, t, 0.42, [[0, 470], [0.07, 640], [0.42, 580]], [[0, 'a']], 0.5, 9, 0.025);
                vozDibujo(ctx, d, t + 0.62, 0.55, [[0, 520], [0.08, 720], [0.55, 620]], [[0, 'a']], 0.55, 10, 0.03);
            },
            bostezo(ctx, t, d) {   // «aaa-ooo-uh» que baja de tono
                vozDibujo(ctx, d, t, 1.35, [[0, 330], [0.5, 310], [1.35, 185]], [[0, 'a'], [0.6, 'o'], [1.3, 'u']], 0.42, 4, 0.02);
            },
            nyah(ctx, t, d) {   // la cancioncilla burlona «nya-nya-nya-nya-nya»
                [[0, 784], [0.2, 659], [0.4, 880], [0.6, 784], [0.8, 659]].forEach(([s, hz], i) => {
                    vozDibujo(ctx, d, t + s, i === 4 ? 0.3 : 0.17, [[0, hz * 0.94], [0.04, hz]], [[0, 'i'], [0.05, 'a']], 0.36, 7, 0.01);
                });
            },
            ronquido(ctx, t, d) {   // ronquido con temblor, soplido y la pompa que explota
                const f = rafagaRuido(ctx, d, t, 0.95, 'bandpass', 180, 2, 0.9, 0.35);
                f.frequency.linearRampToValueAtTime(320, t + 0.9);
                const ronco = ctx.createOscillator();
                const roncoG = ctx.createGain();
                const temblor = ctx.createOscillator();
                const temblorG = ctx.createGain();
                ronco.type = 'sawtooth';
                ronco.frequency.setValueAtTime(70, t);
                ronco.frequency.linearRampToValueAtTime(95, t + 0.9);
                temblor.frequency.value = 28;
                temblorG.gain.value = 0.12;
                roncoG.gain.value = 0.0001;
                roncoG.gain.setValueAtTime(0.0001, t);
                roncoG.gain.exponentialRampToValueAtTime(0.14, t + 0.3);
                roncoG.gain.exponentialRampToValueAtTime(0.0001, t + 0.95);
                temblor.connect(temblorG);
                temblorG.connect(roncoG.gain);
                ronco.connect(roncoG);
                roncoG.connect(d);
                ronco.start(t);
                temblor.start(t);
                ronco.stop(t + 1);
                temblor.stop(t + 1);
                rafagaRuido(ctx, d, t + 1.05, 0.55, 'highpass', 1800, 0.7, 0.18, 0.12);
                tonoSimple(ctx, d, t + 1.65, 0.08, 'sine', 500, 1400, 0.35);
            },
            // Risas y llantos
            carcajada(ctx, t, d) {   // «¡JA-JA-JA-JA-JA-JA!» que va bajando
                for (let i = 0; i < 6; i++) {
                    const s = i * 0.14;
                    const hz = 520 - i * 28;
                    rafagaRuido(ctx, d, t + s, 0.05, 'highpass', 1500, 0.7, 0.08);
                    vozDibujo(ctx, d, t + s + 0.02, 0.1, [[0, hz * 1.08], [0.1, hz]], [[0, 'a']], 0.42, 8, 0.01);
                }
            },
            llanto(ctx, t, d) {   // «¡Buaaaa!» con hipido
                vozDibujo(ctx, d, t, 1.25, [[0, 360], [0.25, 540], [1.0, 480], [1.25, 330]], [[0, 'u'], [0.25, 'a']], 0.45, 7, 0.06);
                vozDibujo(ctx, d, t + 1.4, 0.6, [[0, 420], [0.15, 520], [0.6, 360]], [[0, 'u'], [0.15, 'a']], 0.38, 8, 0.07);
            },
            puchero(ctx, t, d) {   // «mmm-hmm» tembloroso y un sorbido de nariz
                vozDibujo(ctx, d, t, 0.75, [[0, 560], [0.75, 400]], [[0, 'm'], [0.5, 'u']], 0.42, 11, 0.04);
                const f = rafagaRuido(ctx, d, t + 0.85, 0.22, 'highpass', 2500, 0.8, 0.28, 0.12);
                f.frequency.linearRampToValueAtTime(4000, t + 1.05);
            },
            // Efectos
            palmas(ctx, t, d) {   // clap, clap, clap-clap
                [0, 0.25, 0.5, 0.62].forEach(s => {
                    [0, 0.009, 0.018].forEach(m => rafagaRuido(ctx, d, t + s + m, 0.012, 'bandpass', 1300, 1.2, 1.1, 0.001));
                    rafagaRuido(ctx, d, t + s + 0.02, 0.13, 'bandpass', 1100, 1, 0.85, 0.002);
                });
            },
            crujido(ctx, t, d) {   // tres mordiscos crujientes a la patata frita
                [0, 0.2, 0.4].forEach(s => {
                    for (let k = 0; k < 4; k++) {
                        rafagaRuido(ctx, d, t + s + k * 0.018 + Math.random() * 0.008, 0.025 + Math.random() * 0.02, 'bandpass', 2600 + Math.random() * 1600, 0.9, 0.6, 0.001);
                    }
                });
            }
        };
