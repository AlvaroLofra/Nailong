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

        // Contextual Speech as user scrolls (Optimizado con rAF para scroll a 60fps constante)
        let companionScrollTicking = false;
        window.addEventListener('scroll', () => {
            if (!companionScrollTicking) {
                requestAnimationFrame(() => {
                    const pos = window.scrollY;
                    const speech = document.getElementById('companion-speech');
                    if (speech) {
                        const speechBefore = speech.textContent;
                        if (pos < 600) {
                            speech.textContent = '"¡Tócame para un Duang! 💛"';
                        } else if (pos < 1300) {
                            speech.textContent = '"¡Ese de la foto es mi amigo Xiao Qi! 🌟"';
                        } else if (pos < 2200) {
                            speech.textContent = '"¡Mira mis animaciones en el Visor Mágico! 🎬"';
                        } else if (pos < 3400) {
                            speech.textContent = '"¡Tengo 80 cromos míos en el álbum! 📸"';
                        } else if (pos < 4400) {
                            speech.textContent = '"¡Toca la botonera para hacerme reír! 🔊"';
                        } else if (pos < 5400) {
                            speech.textContent = '"¡Lánzame llamitas en el laboratorio! 🔥"';
                        } else {
                            speech.textContent = '"¡Vamos a comer muslos de pollo al juego! 🍗"';
                        }
                        if (speech.textContent !== speechBefore) flashCompanionSpeech(4000);
                    }
                    companionScrollTicking = false;
                });
                companionScrollTicking = true;
            }
        }, { passive: true });

