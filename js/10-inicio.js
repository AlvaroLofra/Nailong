        /* ==============================================================
           14. INITIALIZATION, PARTICLES & SCROLL OBSERVER
        ============================================================== */
        const PARTICLES_PAUSED_STORAGE_KEY = 'nailong_particles_paused_v1';
        let bgParticlesPaused = false;
        let bgParticlesCreated = false;

        function prefersReducedMotion() {
            return Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
        }

        function readSavedParticlesPaused() {
            try {
                return sessionStorage.getItem(PARTICLES_PAUSED_STORAGE_KEY) === '1';
            } catch (e) {
                return false;
            }
        }

        function saveParticlesPaused(paused) {
            try {
                sessionStorage.setItem(PARTICLES_PAUSED_STORAGE_KEY, paused ? '1' : '0');
            } catch (e) {}
        }

        function syncParticlesToggleUI() {
            const paused = bgParticlesPaused || prefersReducedMotion();
            document.body.classList.toggle('particles-paused', paused);
            const btn = document.getElementById('particles-toggle-btn');
            const icon = document.getElementById('particles-icon');
            if (btn) {
                btn.setAttribute('aria-pressed', paused ? 'true' : 'false');
                const label = paused ? 'Reanudar partículas de fondo' : 'Pausar partículas de fondo';
                btn.setAttribute('aria-label', label);
                btn.setAttribute('title', label);
                btn.classList.toggle('bg-amber-200', paused);
                btn.classList.toggle('border-amber-500', paused);
                btn.classList.toggle('bg-nailong-belly', !paused);
                btn.classList.toggle('border-nailong-yellow', !paused);
            }
            if (icon) {
                icon.className = paused
                    ? 'fa-solid fa-play text-xs sm:text-sm'
                    : 'fa-solid fa-wand-magic-sparkles text-sm sm:text-base';
            }
            const mobileStatus = document.getElementById('mobile-particles-status');
            if (mobileStatus) {
                mobileStatus.textContent = paused ? 'Pausadas' : 'Activas';
                mobileStatus.className = paused
                    ? 'text-xs bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full font-bold'
                    : 'text-xs bg-nailong-pale text-amber-950 px-2 py-0.5 rounded-full font-bold';
            }
        }

        function initParticlesToggleState() {
            bgParticlesPaused = prefersReducedMotion() || readSavedParticlesPaused();
            syncParticlesToggleUI();
        }

        function toggleBackgroundParticles() {
            if (typeof playSound === 'function') playSound('pop');
            if (prefersReducedMotion()) {
                bgParticlesPaused = true;
                syncParticlesToggleUI();
                if (typeof showDuangToast === 'function') {
                    showDuangToast('Tu dispositivo tiene activado el movimiento reducido.');
                }
                return;
            }
            bgParticlesPaused = !bgParticlesPaused;
            saveParticlesPaused(bgParticlesPaused);
            if (!bgParticlesPaused && !bgParticlesCreated) {
                createBackgroundFloatingParticles();
            }
            syncParticlesToggleUI();
        }

        function createBackgroundFloatingParticles() {
            const container = document.getElementById('bg-particles');
            if (!container || bgParticlesCreated) return;
            if (prefersReducedMotion()) {
                bgParticlesPaused = true;
                syncParticlesToggleUI();
                return;
            }
            const items = ['⭐', '🫧', '🍗', '✨', '🍼', '💛', '🍰'];
            const particleCount = window.innerWidth < 640 ? 10 : 18;
            const frag = document.createDocumentFragment();
            for (let i = 0; i < particleCount; i++) {
                const el = document.createElement('div');
                el.className = 'bg-particle text-xl sm:text-2xl select-none';
                el.textContent = items[i % items.length];
                el.style.left = `${Math.random() * 95}vw`;
                el.style.animationDuration = `${14 + Math.random() * 18}s`;
                el.style.animationDelay = `-${Math.random() * 20}s`;
                frag.appendChild(el);
            }
            container.appendChild(frag);
            bgParticlesCreated = true;
            syncParticlesToggleUI();
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

        // Resalta en la navbar (y en la barra inferior del móvil) la sección que se está viendo
        function setupScrollSpy() {
            const ids = ['inicio', 'historia', 'nailong-3d', 'creador', 'muro-gifs', 'galeria', 'soundboard', 'poderes', 'minijuego'];
            const links = document.querySelectorAll('#desktop-nav-links a[href^="#"]');
            const bottomLinks = document.querySelectorAll('#bottom-nav [data-secciones]');
            if (!(links.length || bottomLinks.length) || !('IntersectionObserver' in window)) return;
            const obs = new IntersectionObserver((entries) => {
                entries.forEach(en => {
                    if (!en.isIntersecting) return;
                    links.forEach(a => {
                        if (a.getAttribute('href') === '#' + en.target.id) a.setAttribute('aria-current', 'true');
                        else a.removeAttribute('aria-current');
                    });
                    bottomLinks.forEach(a => {
                        if (a.dataset.secciones.split(' ').includes(en.target.id)) a.setAttribute('aria-current', 'true');
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

        // Banner de la app: novedades y peso desde version.json (el mismo fichero que consulta la app)
        const APP_SHARE_URL = 'https://alvarolofra.github.io/Nailong/#android-app-banner';

        function setupAppBanner() {
            const copyBtn = document.getElementById('apk-copy-link-btn');
            if (copyBtn) copyBtn.addEventListener('click', shareAppLink);
            // Con file:// fetch falla: se queda el texto fijo del HTML y el bloque de novedades oculto
            fetch('version.json', { cache: 'no-cache' })
                .then(r => r.ok ? r.json() : Promise.reject(r.status))
                .then(info => {
                    const size = document.getElementById('apk-size-label');
                    if (size && info.sizeMB) size.textContent = `${Math.round(info.sizeMB)} MB`;
                    const list = document.getElementById('apk-whats-new-list');
                    const box = document.getElementById('apk-whats-new');
                    if (!list || !box || !Array.isArray(info.notes) || !info.notes.length) return;
                    document.getElementById('apk-whats-new-title').textContent = `Novedades de la v${info.versionName}`;
                    list.replaceChildren(...info.notes.map(n => {
                        const li = document.createElement('li');
                        li.textContent = n;
                        return li;
                    }));
                    box.classList.remove('hidden');
                })
                .catch(() => {});
        }

        // W34: el QR (#apk-qr-img) es un SVG fijo dentro de index.html (herramientas/generar_qr.py), sin red
        function toggleApkQrBox(forceOpen) {
            const box = document.getElementById('apk-qr-box');
            if (!box) return;
            const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : box.classList.contains('hidden');
            box.classList.toggle('hidden', !shouldOpen);
        }

        function closeApkQrBox() {
            playSound('pop');
            toggleApkQrBox(false);
        }

        async function shareAppLink() {
            playSound('pop');
            const label = document.getElementById('apk-copy-link-text');
            const done = (text) => {
                if (!label) return;
                label.textContent = text;
                setTimeout(() => { label.textContent = 'Copiar enlace'; }, 2500);
            };
            const shareData = { title: 'Stickers Nailong para WhatsApp', text: '¡Descarga la app de stickers de Nailong! 🦖', url: APP_SHARE_URL };
            // En el móvil se abre el menú de compartir (WhatsApp incluido); en el ordenador se copia y se muestra el QR directo al APK
            if (navigator.share && window.matchMedia('(pointer: coarse)').matches) {
                try { await navigator.share(shareData); return; } catch (e) { if (e && e.name === 'AbortError') return; }
            }
            toggleApkQrBox();
            try {
                await navigator.clipboard.writeText(APP_SHARE_URL);
                done('✔ ¡Copiado!');
                return;
            } catch (e) {}
            // Respaldo para navegadores sin permiso de portapapeles (igual que en el modal de compartir)
            const ta = document.createElement('textarea');
            ta.value = APP_SHARE_URL;
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            let ok = false;
            try { ok = document.execCommand('copy'); } catch (e) {}
            document.body.removeChild(ta);
            if (ok) done('✔ ¡Copiado!');
            else prompt('Copia este enlace:', APP_SHARE_URL);
        }

        
        /* ==============================================================
           15. TRÁILER: FORMATO (V1), LUZ AMBIENTAL Y PANTALLA COMPLETA
           En pantallas anchas (ordenador, tableta o móvil girado) se ve el tráiler horizontal 16:9;
           en el móvil en vertical, el vertical 9:16 de siempre. Se decide al cargar la página (para
           descargar solo la portada que toca) y otra vez al desplegarlo, si no se está viendo.
        ============================================================== */
        const TRAILER_FORMATOS = {
            vertical: {
                src: 'video-promo/nailong_trailer_v2.mp4',
                portada: 'video-promo/nailong_trailer_v2_portada.webp',
                etiqueta: '📱 Vertical 9:16',
                ambiente: [45, 80]
            },
            horizontal: {
                src: 'video-promo/nailong_trailer_v2_horizontal.mp4',
                portada: 'video-promo/nailong_trailer_v2_horizontal_portada.webp',
                etiqueta: '🖥️ Horizontal 16:9',
                ambiente: [80, 45]
            }
        };
        const TRAILER_CONSULTA_HORIZONTAL = '(min-width: 768px) and (min-aspect-ratio: 1/1)';

        function elegirFormatoTrailer() {
            const box = document.getElementById('video-promo-section');
            const video = document.getElementById('trailer-video');
            if (!box || !video) return;
            const nombre = window.matchMedia && window.matchMedia(TRAILER_CONSULTA_HORIZONTAL).matches ? 'horizontal' : 'vertical';
            if (box.dataset.formato === nombre) return;
            if (box.dataset.formato && !video.paused) return;   // no se corta un vídeo que se está viendo
            const f = TRAILER_FORMATOS[nombre];
            box.dataset.formato = nombre;
            box.classList.toggle('trailer-horizontal', nombre === 'horizontal');
            video.setAttribute('poster', f.portada);
            if (video.getAttribute('src') !== f.src) video.setAttribute('src', f.src);   // preload="none": no descarga nada aún
            const miniatura = document.getElementById('trailer-miniatura');
            if (miniatura && miniatura.getAttribute('src') !== f.portada) miniatura.setAttribute('src', f.portada);
            const canvas = document.getElementById('video-ambient-canvas');
            if (canvas) {
                canvas.width = f.ambiente[0];
                canvas.height = f.ambiente[1];
            }
            const etiqueta = document.getElementById('trailer-formato');
            if (etiqueta) etiqueta.textContent = f.etiqueta;
        }
        elegirFormatoTrailer();   // ya, antes de que el navegador pida la portada o la miniatura

        let trailerAmbientTimer = null;

        function setupTrailerAmbientLight() {
            const video = document.getElementById('trailer-video');
            const canvas = document.getElementById('video-ambient-canvas');
            if (!video || !canvas) return;

            const ctx = canvas.getContext('2d');   // su tamaño (45×80 o 80×45) lo pone elegirFormatoTrailer

            const updateAmbientFrame = () => {
                if (video.paused || video.ended || !video.videoWidth) return;
                try {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                } catch (e) {}
            };

            video.addEventListener('play', () => {
                if (trailerAmbientTimer) clearInterval(trailerAmbientTimer);
                trailerAmbientTimer = setInterval(updateAmbientFrame, 60);
            });

            video.addEventListener('pause', () => {
                if (trailerAmbientTimer) clearInterval(trailerAmbientTimer);
                trailerAmbientTimer = null;
            });

            video.addEventListener('ended', () => {
                if (trailerAmbientTimer) clearInterval(trailerAmbientTimer);
                trailerAmbientTimer = null;
            });

            video.addEventListener('loadeddata', updateAmbientFrame);
            video.addEventListener('seeked', updateAmbientFrame);
        }

        // El tráiler vive plegado en un <details>: el botón «Tráiler» del banner lo despliega antes de saltar a él
        function abrirTrailer() {
            const box = document.getElementById('video-promo-section');
            elegirFormatoTrailer();
            if (box) box.open = true;
        }

        // Al desplegar, se vuelve a elegir el formato (la ventana o el móvil pueden haber girado);
        // al plegarlo, se pausa el vídeo para que no siga sonando oculto
        function setupTrailerFold() {
            const box = document.getElementById('video-promo-section');
            const video = document.getElementById('trailer-video');
            if (!box || !video) return;
            box.addEventListener('toggle', () => {
                if (box.open) elegirFormatoTrailer();
                else if (!video.paused) video.pause();
            });
        }

        function toggleTrailerFullscreen() {
            const container = document.getElementById('video-player-container');
            if (!container) return;
            const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || container.classList.contains('trailer-fullscreen-active'));
            if (!isFs) {
                if (container.requestFullscreen) {
                    container.requestFullscreen().catch(() => container.classList.add('trailer-fullscreen-active'));
                } else if (container.webkitRequestFullscreen) {
                    container.webkitRequestFullscreen();
                } else {
                    container.classList.add('trailer-fullscreen-active');
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen().catch(() => {});
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
                container.classList.remove('trailer-fullscreen-active');
            }
        }

        // W27: difiere tareas fuera del primer pantallazo sin bloquear la interacción inicial
        function diferirArranque(fn, timeout) {
            if (typeof window.requestIdleCallback === 'function') {
                window.requestIdleCallback(fn, { timeout: timeout || 800 });
            } else {
                setTimeout(fn, 1);
            }
        }

        window.onload = function() {
            // Inmediato: visible en el primer pantallazo y gestores globales ligeros
            initParticlesToggleState();
            setupScrollObserver();
            setupScrollSpy();
            setupCompanionAutoHide();
            setupModalBackdrops();
            setupModalScrollLock();

            // Diferido por bloques para no bloquear el hilo principal al arrancar (W27)
            diferirArranque(() => {
                loadUserPhotosFromStorage();
                updateFilterCounts();
                renderGifWall();
                renderPolaroidGallery('all');
            }, 350);

            diferirArranque(() => {
                renderSoundboard();
                setupAppBanner();
                createBackgroundFloatingParticles();
            }, 600);

            diferirArranque(() => {
                resizeGameCanvas();
                setupGameControls();
                setupGameVisibilityPause();
                setupModalSwipeGestures('magic-modal', nextMagicGif, prevMagicGif);
                setupModalSwipeGestures('photo-lightbox', nextLightboxPhoto, prevLightboxPhoto);
                setupTrailerAmbientLight();
                setupTrailerFold();
            }, 900);

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
