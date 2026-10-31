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
                }
            } catch (e) {
                // Audio autoplay fallback
            }
        }

