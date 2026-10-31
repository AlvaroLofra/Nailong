        /* ==============================================================
           14. INITIALIZATION, PARTICLES & SCROLL OBSERVER
        ============================================================== */
        function createBackgroundFloatingParticles() {
            const container = document.getElementById('bg-particles');
            const items = ['⭐', '🫧', '🍗', '✨', '🍼', '💛', '🍰'];
            if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            const particleCount = window.innerWidth < 640 ? 10 : 18;
            for (let i = 0; i < particleCount; i++) {
                const el = document.createElement('div');
                el.className = 'bg-particle text-xl sm:text-2xl select-none';
                el.textContent = items[i % items.length];
                el.style.left = `${Math.random() * 95}vw`;
                el.style.animationDuration = `${14 + Math.random() * 18}s`;
                el.style.animationDelay = `-${Math.random() * 20}s`;
                container.appendChild(el);
            }
        }

        function setupScrollObserver() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, { threshold: 0.05 });

            document.querySelectorAll('.reveal-item').forEach(el => observer.observe(el));
        }

        // Resalta en la navbar la sección que se está viendo
        function setupScrollSpy() {
            const ids = ['inicio', 'historia', 'creador', 'muro-gifs', 'galeria', 'soundboard', 'poderes', 'minijuego'];
            const links = document.querySelectorAll('#desktop-nav-links a[href^="#"]');
            if (!links.length || !('IntersectionObserver' in window)) return;
            const obs = new IntersectionObserver((entries) => {
                entries.forEach(en => {
                    if (!en.isIntersecting) return;
                    links.forEach(a => {
                        if (a.getAttribute('href') === '#' + en.target.id) a.setAttribute('aria-current', 'true');
                        else a.removeAttribute('aria-current');
                    });
                });
            }, { rootMargin: '-40% 0px -55% 0px' });
            ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });
        }

        // Bloquea el scroll de fondo mientras haya algún modal abierto (sin tocar el flujo de pantalla completa)
        function setupModalScrollLock() {
            const els = ['magic-modal', 'photo-lightbox', 'sticker-options-modal', 'share-modal']
                .map(id => document.getElementById(id)).filter(Boolean);
            const sync = () => {
                const open = els.some(el => getComputedStyle(el).display !== 'none');
                document.body.classList.toggle('modal-open', open);
            };
            const mo = new MutationObserver(sync);
            els.forEach(el => mo.observe(el, { attributes: true, attributeFilter: ['class', 'style'] }));
            sync();
        }

        window.onload = function() {
            loadUserPhotosFromStorage();
            updateFilterCounts();
            renderGifWall();
            renderPolaroidGallery('all');
            renderSoundboard();
            createBackgroundFloatingParticles();
            setupScrollObserver();
            resizeGameCanvas();
            setupGameControls();
            setupModalSwipeGestures('magic-modal', nextMagicGif, prevMagicGif);
            setupModalSwipeGestures('photo-lightbox', nextLightboxPhoto, prevLightboxPhoto);
            setupModalBackdrops();
            setupScrollSpy();
            setupCompanionAutoHide();
            setupModalScrollLock();
            // El canvas de fiesta solo se dimensiona mientras hay confeti activo (ahorra VRAM en reposo)
            const initParty = () => {
                const pc = document.getElementById('party-canvas');
                if (pc && partyRunning) {
                    pc.width = window.innerWidth;
                    pc.height = window.innerHeight;
                }
            };
            window.addEventListener('resize', () => {
                resizeGameCanvas();
                initParty();
            });
            window.addEventListener('orientationchange', () => {
                setTimeout(() => {
                    resizeGameCanvas();
                    initParty();
                }, 150);
            });
        };
