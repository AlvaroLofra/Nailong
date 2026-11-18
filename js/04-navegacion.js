        /* ==============================================================
           4. MOBILE NAVIGATION & COMPANION
        ============================================================== */
        function toggleMobileMenu() {
            playSound('pop');
            const menu = document.getElementById('mobile-menu');
            const icon = document.getElementById('mobile-menu-icon');
            if (menu.classList.contains('hidden')) {
                menu.classList.remove('hidden');
                icon.className = 'fa-solid fa-xmark text-lg';
            } else {
                menu.classList.add('hidden');
                icon.className = 'fa-solid fa-bars text-lg';
            }
        }

        let companionVisible = true;
        let companionPokes = 0;
        const companionPhrases = [
            "¡Duang~! ¡Qué cosquillas! 💛",
            "¡Sigue bajando, hay más comida abajo! 🍗",
            "¡Mira qué fotos tan chulas mías! 📸",
            "¿Has probado la botonera de sonidos? 🔊",
            "¡Cuidado con las bombas de Bombloong! 💣",
            "¡Tócame otra vez, me encanta rodar! 🍮"
        ];

        function toggleCompanion() {
            companionVisible = !companionVisible;
            const el = document.getElementById('floating-companion');
            if (el) el.style.display = companionVisible ? 'flex' : 'none';
            const statusBadge = document.getElementById('mobile-companion-status');
            if (statusBadge) {
                statusBadge.textContent = companionVisible ? 'Visible' : 'Oculto';
                statusBadge.className = companionVisible ? 'text-xs bg-nailong-pale px-2 py-0.5 rounded-full font-bold' : 'text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold';
            }
            playSound('pop');
        }

        // En móvil el bocadillo solo se muestra unos segundos para no tapar el contenido
        let companionSpeechTimer = null;
        function flashCompanionSpeech(ms) {
            const speech = document.getElementById('companion-speech');
            if (!speech) return;
            speech.style.transition = 'opacity 0.4s';
            speech.style.opacity = '1';
            clearTimeout(companionSpeechTimer);
            if (window.innerWidth < 640) {
                companionSpeechTimer = setTimeout(() => { speech.style.opacity = '0'; }, ms);
            }
        }

        function setupCompanionAutoHide() {
            const comp = document.getElementById('floating-companion');
            const game = document.getElementById('game-container');
            if (comp && game && 'IntersectionObserver' in window) {
                new IntersectionObserver((entries) => {
                    entries.forEach(en => comp.classList.toggle('companion-hidden-by-game', en.isIntersecting));
                }, { threshold: 0.25 }).observe(game);
            }
            updateCompanionScrollSpeech(false);
            flashCompanionSpeech(4000);
        }

        function pokeCompanion() {
            companionPokes++;
            playSound('duang');
            const img = document.getElementById('companion-img');
            img.style.transform = 'rotate(360deg) scale(1.2)';
            setTimeout(() => { img.style.transform = 'none'; }, 400);

            const speech = document.getElementById('companion-speech');
            speech.textContent = `"${companionPhrases[companionPokes % companionPhrases.length]}"`;
            flashCompanionSpeech(2500);
            speech.classList.add('scale-110');
            setTimeout(() => speech.classList.remove('scale-110'), 250);
        }

        // Frases del muñeco según la sección visible en pantalla (W9, rAF a 60fps)
        const COMPANION_SECTION_PHRASES = [
            { id: 'minijuego', text: '"¡Vamos a comer muslos de pollo al juego! 🍗"' },
            { id: 'poderes', text: '"¡Lánzame llamitas en el laboratorio! 🔥"' },
            { id: 'soundboard', text: '"¡Toca la botonera para hacerme reír! 🔊"' },
            { id: 'polaroid-grid', text: '"¡Tengo 126 cromos míos en el álbum! 📸"' },
            { id: 'muro-gifs', text: '"¡Mira mis animaciones en el Visor Mágico! 🎬"', requireVisibleBand: true },
            { id: 'galeria', text: '"¡Tengo 126 cromos míos en el álbum! 📸"' },
            { id: 'nailong-3d', text: '"¡Gírame en 3D y hazme cosquillas en la pancita! 🧊"' },
            { id: 'historia', text: '"¡Ese de la foto es mi amigo Xiao Qi! 🌟"' },
            { id: 'inicio', text: '"¡Tócame para un Duang! 💛"' }
        ];

        function getCompanionScrollPhrase() {
            const triggerY = window.innerHeight * 0.42;
            for (const entry of COMPANION_SECTION_PHRASES) {
                const el = document.getElementById(entry.id);
                if (!el) continue;
                const rect = el.getBoundingClientRect();
                if (rect.height === 0 && rect.width === 0) continue;
                if (entry.requireVisibleBand && rect.bottom < triggerY * 0.5) continue;
                if (rect.top <= triggerY) return entry.text;
            }
            return COMPANION_SECTION_PHRASES[COMPANION_SECTION_PHRASES.length - 1].text;
        }

        function updateCompanionScrollSpeech(shouldFlash = true) {
            const speech = document.getElementById('companion-speech');
            if (!speech) return;
            const speechBefore = speech.textContent;
            const nextSpeech = getCompanionScrollPhrase();
            if (nextSpeech !== speechBefore) {
                speech.textContent = nextSpeech;
                if (shouldFlash) flashCompanionSpeech(4000);
            }
        }

        let companionScrollTicking = false;
        window.addEventListener('scroll', () => {
            if (!companionScrollTicking) {
                requestAnimationFrame(() => {
                    updateCompanionScrollSpeech(true);
                    companionScrollTicking = false;
                });
                companionScrollTicking = true;
            }
        }, { passive: true });

