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
            const ids = ['inicio', 'historia', 'nailong-3d', 'creador', 'muro-gifs', 'galeria', 'soundboard', 'poderes', 'minijuego'];
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

        function toggleApkQrBox(forceOpen) {
            const box = document.getElementById('apk-qr-box');
            const img = document.getElementById('apk-qr-img');
            if (!box) return;
            const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : box.classList.contains('hidden');
            if (shouldOpen) {
                if (img && !img.getAttribute('src') && img.dataset.qrSrc) {
                    img.setAttribute('src', img.dataset.qrSrc);
                }
                box.classList.remove('hidden');
            } else {
                box.classList.add('hidden');
            }
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
           15. LUZ AMBIENTAL Y PANTALLA COMPLETA DEL TRÁILER (9:16)
        ============================================================== */
        let trailerAmbientTimer = null;

        function setupTrailerAmbientLight() {
            const video = document.getElementById('trailer-video');
            const canvas = document.getElementById('video-ambient-canvas');
            if (!video || !canvas) return;

            const ctx = canvas.getContext('2d');
            canvas.width = 45;
            canvas.height = 80;

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
            setupGameVisibilityPause();
            setupAppBanner();
            setupModalSwipeGestures('magic-modal', nextMagicGif, prevMagicGif);
            setupModalSwipeGestures('photo-lightbox', nextLightboxPhoto, prevLightboxPhoto);
            setupModalBackdrops();
            setupScrollSpy();
            setupCompanionAutoHide();
            setupTrailerAmbientLight();
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
