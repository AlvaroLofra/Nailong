        /* ==============================================================
           11. MODO FIESTA DUANG-DUANG ULTRA OPTIMIZADO (GPU BLITTING 60FPS)
        ============================================================== */
        let partyParticles = [];
        let partyRunning = false;
        let lastPartySoundTime = 0;
        const EMOJI_SPRITES = {};

        // Pre-renderiza glifos de emojis en lienzos offscreen para renderizado GPU instantáneo sin recalcular fuentes
        function getEmojiSprite(emoji, size = 32) {
            const key = `${emoji}_${size}`;
            if (EMOJI_SPRITES[key]) return EMOJI_SPRITES[key];

            const c = document.createElement('canvas');
            c.width = size + 8;
            c.height = size + 8;
            const ctx = c.getContext('2d');
            ctx.font = `${size}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", -apple-system, BlinkMacSystemFont, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(emoji, c.width / 2, c.height / 2);
            EMOJI_SPRITES[key] = { canvas: c, width: c.width, height: c.height };
            return EMOJI_SPRITES[key];
        }

        function triggerPartyMode() {
            const now = Date.now();
            if (now - lastPartySoundTime > 200) {
                playSound('fanfare');
                lastPartySoundTime = now;
            }

            const canvas = document.getElementById('party-canvas');
            if (!canvas) return;
            if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }

            const icons = ['🍗', '💛', '✨', '🍼', '🍰', '🎉', '🦖', '🍮', '⭐'];
            const SIZES = [26, 32, 40];
            const isMobile = window.innerWidth < 640;
            // Capacidad máxima de partículas activas sin ninguna caída de FPS
            const MAX_PARTICLES = isMobile ? 90 : 140;
            const spawnCount = isMobile ? 36 : 50;

            // Pre-calentar sprites
            icons.forEach(ic => {
                SIZES.forEach(sz => getEmojiSprite(ic, sz));
            });

            for (let i = 0; i < spawnCount; i++) {
                const icon = icons[Math.floor(Math.random() * icons.length)];
                const size = SIZES[Math.floor(Math.random() * SIZES.length)];
                const sprite = getEmojiSprite(icon, size);

                const initialY = (i < spawnCount * 0.4) 
                    ? (10 + Math.random() * (canvas.height * 0.35)) 
                    : (-30 - Math.random() * 220);

                const newParticle = {
                    x: Math.random() * canvas.width,
                    y: initialY,
                    vx: (Math.random() - 0.5) * 4.0,
                    vy: 3.2 + Math.random() * 4.8,
                    rot: Math.random() * 360,
                    vrot: (Math.random() - 0.5) * 5.5,
                    sprite: sprite
                };

                if (partyParticles.length < MAX_PARTICLES) {
                    partyParticles.push(newParticle);
                } else {
                    // Si se spammea el botón, recicla partículas desde arriba manteniendo la lluvia constante sin sobrecargar
                    const replaceIdx = i % partyParticles.length;
                    partyParticles[replaceIdx] = newParticle;
                }
            }

            canvas.style.display = 'block';
            if (!partyRunning) {
                partyRunning = true;
                requestAnimationFrame(animatePartyConfetti);
            }
        }

        function animatePartyConfetti() {
            const canvas = document.getElementById('party-canvas');
            if (!canvas) {
                partyRunning = false;
                return;
            }
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const bottomLimit = canvas.height + 50;

            for (let i = partyParticles.length - 1; i >= 0; i--) {
                const p = partyParticles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.rot += p.vrot;

                if (p.y > bottomLimit) {
                    partyParticles[i] = partyParticles[partyParticles.length - 1];
                    partyParticles.pop();
                    continue;
                }

                // Ultra-rápido: setTransform directo sin save/restore stack (cero overhead durante scroll)
                const rad = (p.rot * Math.PI) / 180;
                const cos = Math.cos(rad);
                const sin = Math.sin(rad);
                ctx.setTransform(cos, sin, -sin, cos, p.x, p.y);
                ctx.drawImage(p.sprite.canvas, -p.sprite.width / 2, -p.sprite.height / 2);
            }

            ctx.resetTransform();

            if (partyParticles.length > 0) {
                requestAnimationFrame(animatePartyConfetti);
            } else {
                partyRunning = false;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // Libera el búfer y oculta el canvas cuando cae la última partícula
                canvas.style.display = 'none';
                canvas.width = 1;
                canvas.height = 1;
            }
        }

                /* ==============================================================
           12. SHARE MODAL FOR FRIENDS (GITHUB PAGES LIVE)
        ============================================================== */
        const NAILONG_OFFICIAL_URL = 'https://alvarolofra.github.io/Nailong/';

        function getLiveShareUrl() {
            if (window.location.protocol.startsWith('http') && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
                return window.location.href;
            }
            return NAILONG_OFFICIAL_URL;
        }

        function openShareModal() {
            playSound('pop');
            const modal = document.getElementById('share-modal');
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            modal.style.display = 'flex';

            const shareUrl = getLiveShareUrl();
            const urlText = document.getElementById('share-url-text');
            if (urlText) {
                urlText.textContent = shareUrl;
            }

            // Dynamically update QR Code with live URL
            try {
                const qrImg = document.getElementById('share-qr-code');
                if (qrImg) {
                    qrImg.onerror = function() {
                        this.onerror = null;
                        this.style.display = 'none';
                        const parent = this.parentElement;
                        if (parent && !parent.querySelector('.qr-fallback-msg')) {
                            const msg = document.createElement('div');
                            msg.className = 'qr-fallback-msg text-xs text-amber-800 font-bold p-2 text-center';
                            msg.textContent = '📱 Escanea el código QR o copia el enlace de arriba.';
                            parent.appendChild(msg);
                        }
                    };
                    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;
                }
            } catch(e) {}
        }

        function closeShareModal() {
            playSound('pop');
            const modal = document.getElementById('share-modal');
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            modal.style.display = 'none';
        }

        async function triggerNativeShare() {
            playSound('fanfare');
            const shareUrl = getLiveShareUrl();
            const shareData = {
                title: '¡El Mundo Mágico de Nailong (奶龙)! 🦖✨',
                text: '¡Mira la página fan interactiva de Nailong con fotos reales, stickers animados, sonidos duang y minijuego!',
                url: shareUrl
            };

            const canNativeShare = navigator.share && (!navigator.canShare || navigator.canShare(shareData));
            if (canNativeShare) {
                try {
                    await navigator.share(shareData);
                } catch(err) {
                    // User cancelled share or aborted
                }
            } else {
                copyCurrentShareLink();
            }
        }

        function copyCurrentShareLink() {
            playSound('duang');
            const urlToCopy = getLiveShareUrl();
            const showSuccess = () => {
                const btnText = document.getElementById('copy-btn-text');
                if (btnText) {
                    const oldText = btnText.textContent;
                    btnText.textContent = '✔ ¡Enlace Copiado!';
                    setTimeout(() => { btnText.textContent = oldText; }, 2500);
                }
            };

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(urlToCopy).then(showSuccess).catch(() => fallbackCopy(urlToCopy));
            } else {
                fallbackCopy(urlToCopy);
            }

            function fallbackCopy(text) {
                try {
                    const ta = document.createElement('textarea');
                    ta.value = text;
                    ta.style.position = 'fixed';
                    ta.style.left = '-9999px';
                    document.body.appendChild(ta);
                    ta.focus();
                    ta.select();
                    const successful = document.execCommand('copy');
                    document.body.removeChild(ta);
                    if (successful) {
                        showSuccess();
                        return;
                    }
                } catch(e) {}
                prompt('Copia este enlace para tus amigos:', text);
            }
        }

/* ==============================================================
           13. MOBILE TOUCH SWIPE GESTURES FOR MODALS
        ============================================================== */
        function setupModalSwipeGestures(modalId, onNext, onPrev) {
            const modal = document.getElementById(modalId);
            if (!modal) return;
            let touchStartX = 0;
            let touchStartY = 0;
            let touchStartTime = 0;

            modal.addEventListener('touchstart', (e) => {
                // Ignore touches on draggable stickers, buttons, links, inputs, or sliders
                if (e.target.closest('#modal-stickers-layer, button, a, input, select, textarea, [data-no-swipe]')) {
                    touchStartX = 0;
                    touchStartY = 0;
                    touchStartTime = 0;
                    return;
                }
                if (e.touches.length === 1) {
                    touchStartX = e.touches[0].clientX;
                    touchStartY = e.touches[0].clientY;
                    touchStartTime = Date.now();
                }
            }, { passive: true });

            modal.addEventListener('touchend', (e) => {
                if (!touchStartTime) return;
                const duration = Date.now() - touchStartTime;
                // Only consider intentional flicks under 650ms
                if (duration > 650) return;

                if (e.changedTouches.length === 1) {
                    const touchEndX = e.changedTouches[0].clientX;
                    const touchEndY = e.changedTouches[0].clientY;
                    const deltaX = touchEndX - touchStartX;
                    const deltaY = touchEndY - touchStartY;

                    // Predominantly horizontal swipe > 50px with high horizontal dominance
                    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.8) {
                        if (deltaX < 0) {
                            onNext();
                        } else {
                            onPrev();
                        }
                    }
                }
                touchStartTime = 0;
            }, { passive: true });
        }

        // Setup backdrop tap-to-close for all mobile modals
        function setupModalBackdrops() {
            const modals = [
                { id: 'magic-modal', close: closeMagicModal },
                { id: 'photo-lightbox', close: closePhotoLightbox },
                { id: 'share-modal', close: closeShareModal },
                { id: 'sticker-options-modal', close: closeStickerOptionsModal }
            ];
            modals.forEach(({ id, close }) => {
                const el = document.getElementById(id);
                if (!el) return;
                el.addEventListener('click', (e) => {
                    if (e.target === el) {
                        close();
                    }
                });
            });
        }

