        /* ==============================================================
           5. MURO DE 9 GIFS/ANIMACIONES REALES
        ============================================================== */
        const FEATURED_GIFS = [
            { id: 19, tag: 'GLOTÓN 🍿', title: 'Cine & Palomitas a Granel', desc: 'Nailong en el cine devorando un cubo entero de palomitas a toda máquina.', bg: 'from-amber-100 to-yellow-100' },
            { id: 11, tag: 'RITMO 🪇', title: 'El Baile de las Maracas Duang', desc: 'Moviendo las caderas y haciendo música alegre con maracas de colores.', bg: 'from-yellow-100 to-pink-100' },
            { id: 35, tag: 'AVENTURA 🏴‍☠️', title: 'Capitán Pirata Nailong', desc: 'Con su sombrero corsario y patitas en alto bailando al timón del barco.', bg: 'from-sky-100 to-teal-100' },
            { id: 23, tag: 'ESCAPE 🏃', title: '¡A Correr! ¡Hora del Baño!', desc: 'Huyendo despavorido a toda prisa con carita de susto porque no le gusta el agua fría.', bg: 'from-orange-100 to-amber-100' },
            { id: 31, tag: 'RELAX 🍃', title: 'Haciendo la Croqueta en el Césped', desc: 'Rodando feliz de lado a lado por el prado verde jugando al solecito.', bg: 'from-emerald-100 to-lime-100' },
            { id: 40, tag: 'DORMILÓN 🍼', title: 'Dulce Siesta en la Hamaca', desc: 'Meciéndose plácidamente en su cuna colgante soñando con montañas de nata.', bg: 'from-blue-100 to-sky-100' },
            { id: 6, tag: 'SABROSO 😋', title: '¡Mmm, Lamiéndose los Bigotes!', desc: 'Saboreando el manjar más delicioso del mundo tras acabarse un muslito crujiente.', bg: 'from-rose-100 to-amber-100' },
            { id: 12, tag: 'MASTICANDO 🥟', title: 'El Monstruo de los Bollitos', desc: 'Masticando bollitos al vapor sin parar a velocidad supersónica.', bg: 'from-yellow-100 to-orange-100' },
            { id: 41, tag: 'ALEGRÍA 🕺', title: '¡Saltitos de Pura Victoria!', desc: 'El baile viral dando botes de pura felicidad cuando la merienda está servida.', bg: 'from-purple-100 to-pink-100' }
        ];

        function renderGifWall() {
            const grid = document.getElementById('gif-wall-grid');
            grid.innerHTML = FEATURED_GIFS.map((gif, index) => `
                <button type="button" onclick="openMagicModal(${index})" class="shrink-0 snap-start w-32 sm:w-40 clay-card p-2 cursor-pointer group text-center" aria-label="Abrir en el Visor Mágico: ${gif.title}">
                    <div class="aspect-square rounded-xl bg-gradient-to-br ${gif.bg} border-2 border-nailong-yellow flex items-center justify-center overflow-hidden p-1.5">
                        <img src="Stickers Nailong/sticker_${gif.id}.webp" alt="${gif.title}" loading="lazy" decoding="async" class="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300">
                    </div>
                    <span class="block pt-1.5 font-display font-bold text-[11px] sm:text-xs leading-tight text-amber-950 group-hover:text-nailong-orange transition-colors">${gif.title}</span>
                </button>
            `).join('');
        }

        /* ==============================================================
           6. VISOR MÁGICO MODAL CON VELOCIDAD Y STICKERS ARRASTRABLES
        ============================================================== */
        let currentModalGifIndex = 0;
        let currentModalSpeed = 'normal';

        function openMagicModal(index) {
            playSound('pop');
            currentModalGifIndex = index;
            const gif = FEATURED_GIFS[index];
            const modal = document.getElementById('magic-modal');
            
            document.getElementById('modal-title').textContent = gif.title;
            document.getElementById('modal-badge').textContent = `${gif.tag} • GIF ${index + 1}/9`;
            document.getElementById('modal-description').textContent = gif.desc;
            
            const mainImg = document.getElementById('modal-main-img');
            mainImg.src = `Stickers Nailong/sticker_${gif.id}.webp`;
            setModalSpeed('normal');

            document.getElementById('modal-download-btn').href = `Stickers Nailong/sticker_${gif.id}.webp`;
            document.getElementById('modal-download-btn').download = `nailong_animado_${gif.id}.webp`;
            document.getElementById('modal-stickers-layer').innerHTML = '';

            modal.classList.remove('hidden');
            modal.classList.add('flex');
            modal.style.display = 'flex';
        }

        function closeMagicModal() {
            playSound('pop');
            const modal = document.getElementById('magic-modal');
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            modal.style.display = 'none';
        }

        function nextMagicGif() {
            currentModalGifIndex = (currentModalGifIndex + 1) % FEATURED_GIFS.length;
            openMagicModal(currentModalGifIndex);
        }

        function prevMagicGif() {
            currentModalGifIndex = (currentModalGifIndex - 1 + FEATURED_GIFS.length) % FEATURED_GIFS.length;
            openMagicModal(currentModalGifIndex);
        }

        function setModalSpeed(mode, btnEl) {
            playSound('duang');
            currentModalSpeed = mode;
            const img = document.getElementById('modal-main-img');
            const wrapper = document.getElementById('modal-stage-wrapper');
            const label = document.getElementById('modal-speed-label');

            img.classList.remove('animate-float', 'animate-wiggle', 'scale-110');
            wrapper.classList.remove('ring-4', 'ring-sky-400', 'ring-rose-400');

            document.querySelectorAll('#modal-speed-buttons button').forEach(b => {
                b.className = 'px-2.5 sm:px-3 py-1 rounded-full font-bold text-xs bg-nailong-pale hover:bg-nailong-yellow text-amber-950 transition-all';
            });
            if (btnEl) {
                btnEl.className = 'px-2.5 sm:px-3 py-1 rounded-full font-bold text-xs bg-nailong-orange text-white shadow-sm scale-105 transition-all';
            }

            if (mode === 'slow') {
                img.classList.add('animate-float');
                wrapper.classList.add('ring-4', 'ring-sky-400');
                if (label) label.textContent = '🐢 Cámara Lenta: Observa cada detalle tierno y elástico.';
            } else if (mode === 'turbo') {
                img.classList.add('animate-wiggle', 'scale-110');
                wrapper.classList.add('ring-4', 'ring-rose-400');
                if (label) label.textContent = '🚀 ¡Modo Hiperactivo: Nailong a 200% de energía Duang!';
            } else {
                if (label) label.textContent = '🦖 Velocidad Normal: Ritmo original del sticker.';
            }
        }

        function addModalSticker(emoji) {
            playSound('pop');
            const layer = document.getElementById('modal-stickers-layer');
            const sticker = document.createElement('div');
            sticker.className = 'absolute text-4xl select-none cursor-move hover:scale-125 transition-transform p-1 animate-duang';
            sticker.style.left = `${20 + Math.random() * 55}%`;
            sticker.style.top = `${20 + Math.random() * 50}%`;
            sticker.style.transform = `rotate(${(Math.random() - 0.5) * 30}deg)`;
            sticker.setAttribute('title', '¡Arrastra para colocar o doble clic para quitar!');
            sticker.textContent = emoji;

            makeStickerDraggable(sticker);
            sticker.addEventListener('dblclick', () => {
                playSound('pop');
                sticker.remove();
            });
            // Touch double-tap detection for mobile devices
            let lastTap = 0;
            sticker.addEventListener('touchend', () => {
                const now = Date.now();
                if (now - lastTap < 350) {
                    playSound('pop');
                    sticker.remove();
                }
                lastTap = now;
            });
            layer.appendChild(sticker);
        }

        function clearModalStickers() {
            playSound('pop');
            document.getElementById('modal-stickers-layer').innerHTML = '';
        }

        function makeStickerDraggable(el) {
            let isDragging = false;
            let startX = 0, startY = 0, initialLeft = 0, initialTop = 0;
            el.style.touchAction = 'none';

            const onStart = (clientX, clientY, e) => {
                isDragging = true;
                startX = clientX;
                startY = clientY;
                const pRect = el.parentElement.getBoundingClientRect();
                const eRect = el.getBoundingClientRect();
                initialLeft = eRect.left - pRect.left;
                initialTop = eRect.top - pRect.top;
                el.style.left = `${initialLeft}px`;
                el.style.top = `${initialTop}px`;
                playSound('duang');
                if (e && e.stopPropagation) e.stopPropagation();
            };

            const onMove = (clientX, clientY) => {
                if (!isDragging) return;
                const pRect = el.parentElement.getBoundingClientRect();
                const eRect = el.getBoundingClientRect();
                const dx = clientX - startX;
                const dy = clientY - startY;
                const maxLeft = Math.max(0, pRect.width - eRect.width);
                const maxTop = Math.max(0, pRect.height - eRect.height);
                const newLeft = Math.max(0, Math.min(maxLeft, initialLeft + dx));
                const newTop = Math.max(0, Math.min(maxTop, initialTop + dy));
                el.style.left = `${newLeft}px`;
                el.style.top = `${newTop}px`;
            };

            const onEnd = (e) => {
                if (isDragging) {
                    isDragging = false;
                    if (e && e.stopPropagation) e.stopPropagation();
                }
            };

            // Modern Pointer Events for iOS Safari 13+ and Android Chrome
            el.addEventListener('pointerdown', (e) => {
                onStart(e.clientX, e.clientY, e);
                try { el.setPointerCapture(e.pointerId); } catch(err) {}
                if (e.cancelable) e.preventDefault();
            });
            el.addEventListener('pointermove', (e) => {
                if (isDragging) {
                    onMove(e.clientX, e.clientY);
                    if (e.cancelable) e.preventDefault();
                }
            });
            el.addEventListener('pointerup', onEnd);
            el.addEventListener('pointercancel', onEnd);

            // Touch fallback for older WebKit engines
            el.addEventListener('touchstart', (e) => {
                e.stopPropagation();
                if (e.touches.length > 0) {
                    onStart(e.touches[0].clientX, e.touches[0].clientY, e);
                }
            }, { passive: false });
            // En eventos táctiles el objetivo es siempre el elemento donde empezó el toque:
            // al registrar sobre el propio sticker no quedan listeners huérfanos en window.
            el.addEventListener('touchmove', (e) => {
                if (isDragging && e.touches.length > 0) {
                    if (e.cancelable) e.preventDefault();
                    onMove(e.touches[0].clientX, e.touches[0].clientY);
                }
            }, { passive: false });
            el.addEventListener('touchend', onEnd);
            el.addEventListener('touchcancel', onEnd);
        }

                /* ==============================================================
           6B. LIGHTBOX PARA LA FOTO DEL CREADOR
        ============================================================== */
        function triggerLightboxDuang(event) {
            if (event) event.stopPropagation();
            playSound('duang');

            // Bouncy Spring Squash on Lightbox Image
            const img = document.getElementById('lb-img');
            if (img) {
                img.classList.remove('animate-duang');
                void img.offsetWidth; // Force Reflow
                img.classList.add('animate-duang');
            }

            // Floating Emoji Particles on Photo
            const container = document.getElementById('lb-particles');
            if (container) {
                const badge = document.createElement('div');
                const emojis = ['🍮 ¡DUANG!', '✨', '💛', '🎉', '🦖', '🍗', '⭐'];
                const pick = emojis[Math.floor(Math.random() * emojis.length)];
                badge.className = 'absolute font-display font-bold text-xl sm:text-2xl text-nailong-orange pointer-events-none transition-all duration-700 select-none drop-shadow-md z-30';
                badge.style.left = `${30 + Math.random() * 40}%`;
                badge.style.top = `${35 + Math.random() * 25}%`;
                badge.textContent = pick;
                container.appendChild(badge);

                requestAnimationFrame(() => {
                    badge.style.transform = `translate(${(Math.random() - 0.5) * 120}px, -90px) scale(1.3)`;
                    badge.style.opacity = '0';
                });
                setTimeout(() => badge.remove(), 750);
            }
        }

        function openCreatorLightbox() {
            playSound('fanfare');
            const modal = document.getElementById('photo-lightbox');
            const pContainer = document.getElementById('lb-particles');
            if (pContainer) pContainer.innerHTML = '';
            document.getElementById('lb-badge').textContent = '🌟 CREADOR & NAILONG • FOTO OFICIAL';
            document.getElementById('lb-title').textContent = '¡El Creador de la Página con Nailong!';
            document.getElementById('lb-img').src = 'Stickers Nailong/creador_nailong.webp';
            document.getElementById('lb-caption').textContent = '¡Aquí tenemos al creador de la página con Nailong! Mirad qué amigables son juntos. ¡Una amistad mágica para siempre! 🦖💛';
            const dlBtn = document.getElementById('lb-download-btn');
            if (dlBtn) dlBtn.style.display = 'none'; // Descarga desactivada para la foto del creador
            const lbWhatsapp = document.getElementById('lb-whatsapp-btn');
            if (lbWhatsapp) lbWhatsapp.style.display = 'none';
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            modal.style.display = 'flex';
        }

