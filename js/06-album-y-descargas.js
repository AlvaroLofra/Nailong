        /* ==============================================================
           7. GRAN ÁLBUM POLAROID (80 FOTOS REALES) + LIGHTBOX
        ============================================================== */
        let activeFilter = 'all';
        let currentLightboxIndex = 0;
        let displayedStickers = [];

        // Paginación progresiva: displayedStickers guarda la lista completa filtrada (el lightbox navega por ella);
        // solo se pintan las primeras galleryVisibleCount tarjetas para no decodificar 80 WebP a la vez.
        const GALLERY_PAGE_SIZE = 12;
        const GALLERY_STEP = 24;
        let galleryVisibleCount = GALLERY_PAGE_SIZE;

        function renderPolaroidGallery(filter = 'all') {
            activeFilter = filter;
            const grid = document.getElementById('polaroid-grid');

            if (filter === 'all') {
                displayedStickers = [...ALL_STICKERS];
            } else if (filter === 'animated') {
                displayedStickers = ALL_STICKERS.filter(s => s.frames > 2);
            } else {
                displayedStickers = ALL_STICKERS.filter(s => s.cat === filter);
            }

            const pinColors = ['bg-rose-400', 'bg-sky-400', 'bg-amber-400', 'bg-emerald-400', 'bg-purple-400', 'bg-pink-400', 'bg-orange-400'];
            const tilts = ['-rotate-2', 'rotate-2', '-rotate-1', 'rotate-1', 'rotate-3', '-rotate-3'];

            grid.innerHTML = displayedStickers.slice(0, galleryVisibleCount).map((item, idx) => {
                // Las fotos de usuario tienen id de texto ('user_...'): se usa el índice como semilla
                const seed = Number.isFinite(Number(item.id)) ? Number(item.id) : idx;
                const pin = pinColors[seed % pinColors.length];
                const tilt = tilts[seed % tilts.length];
                const isAnim = item.frames > 2;
                const imgSrc = item.customUrl ? item.customUrl : `Stickers Nailong/${item.file}`;

                return `
                    <div class="polaroid ${tilt} relative flex flex-col justify-between cursor-pointer group" onclick="openPhotoLightbox(${idx})">
                        <!-- Colored Pin -->
                        <div class="w-5 h-5 rounded-full ${pin} border-2 border-white shadow mx-auto -mt-6 mb-2"></div>

                        <!-- Sticker Photo Box -->
                        <div class="relative w-full h-36 sm:h-52 rounded-2xl bg-gradient-to-br from-amber-50 to-nailong-pale flex items-center justify-center p-2 sm:p-3 border-2 border-nailong-pale overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-300">
                            <img src="${imgSrc}" alt="${item.title}" loading="lazy" decoding="async" class="max-h-full max-w-full object-contain">
                            ${isAnim ? `
                                <span class="absolute top-2 left-2 bg-amber-950/80 text-nailong-yellow text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                                    <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                    <span>ANIMADO</span>
                                </span>
                            ` : ''}
                            ${item.customUrl ? `
                                <span class="absolute top-2 left-2 bg-nailong-orange text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                                    🌟 ¡TU FOTO!
                                </span>
                            ` : ''}
                            ${item.isUserPhoto ? `
                                <button type="button" onclick="deleteUserPhoto('${item.id}', event)" aria-label="Borrar mi foto"
                                        class="absolute top-2 right-2 z-20 w-10 h-10 rounded-full bg-white/95 border-2 border-rose-300 text-lg shadow flex items-center justify-center hover:bg-rose-100">🗑️</button>
                            ` : ''}
                        </div>

                        <div class="pt-3 space-y-1 text-center">
                            <span class="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">${item.customUrl ? 'CROMO PERSONAL' : `CROMO #${item.id}`}</span>
                            <h4 class="font-display font-bold text-sm sm:text-lg text-amber-950 leading-snug group-hover:text-nailong-orange transition-colors">
                                ${item.title}
                            </h4>
                            <p class="text-[11px] sm:text-xs font-semibold text-amber-800/85 line-clamp-2">
                                ${item.desc}
                            </p>
                        </div>
                    </div>
                `;
            }).join('');

            updateLoadMoreButton();
        }

        function updateLoadMoreButton() {
            const wrap = document.getElementById('gallery-load-more-wrap');
            const btn = document.getElementById('gallery-load-more');
            if (!wrap || !btn) return;
            const remaining = displayedStickers.length - galleryVisibleCount;
            if (remaining > 0) {
                btn.textContent = `🦖 ¡Ver más cromos de Nailong! (+${Math.min(GALLERY_STEP, remaining)})`;
                wrap.classList.remove('hidden');
            } else {
                wrap.classList.add('hidden');
            }
        }

        function showMoreGallery() {
            playSound('pop');
            galleryVisibleCount += GALLERY_STEP;
            renderPolaroidGallery(activeFilter);
        }

        function filterGallery(category, btnEl) {
            playSound('pop');
            document.querySelectorAll('#gallery-filters .gallery-filter-btn').forEach(b => {
                b.className = 'gallery-filter-btn bg-white hover:bg-nailong-pale text-amber-900 font-display font-bold px-4 py-2 rounded-full text-sm border-2 border-nailong-yellow transition-all';
            });
            if (btnEl) {
                btnEl.className = 'gallery-filter-btn bg-nailong-yellow text-amber-950 font-display font-bold px-4 py-2 rounded-full text-sm border-2 border-amber-500 shadow-sm transition-all';
            }
            galleryVisibleCount = GALLERY_PAGE_SIZE;
            renderPolaroidGallery(category);
            if (btnEl && btnEl.scrollIntoView) {
                btnEl.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
            }
        }

        function isCreatorItem(item) {
            return Boolean(item && item.file === 'creador_nailong.webp');
        }

        function openPhotoLightbox(index) {
            playSound('duang');
            currentLightboxIndex = index;
            const item = displayedStickers[index];
            const modal = document.getElementById('photo-lightbox');
            const pContainer = document.getElementById('lb-particles');
            if (pContainer) pContainer.innerHTML = '';
            const imgSrc = item.customUrl ? item.customUrl : `Stickers Nailong/${item.file}`;

            document.getElementById('lb-badge').textContent = item.customUrl ? 'CROMO PERSONAL' : `CROMO #${item.id} • ${item.frames > 2 ? 'ANIMADO' : 'FOTO CLÁSICA'}`;
            document.getElementById('lb-title').textContent = item.title;
            document.getElementById('lb-img').src = imgSrc;
            document.getElementById('lb-caption').textContent = item.desc;
            
            const dlBtn = document.getElementById('lb-download-btn');
            const lbWhatsapp = document.getElementById('lb-whatsapp-btn');
            if (dlBtn) {
                if (isCreatorItem(item)) {
                    dlBtn.style.display = 'none';
                    if (lbWhatsapp) lbWhatsapp.style.display = 'none';
                } else {
                    dlBtn.style.display = 'inline-flex';
                    if (lbWhatsapp) lbWhatsapp.style.display = 'inline-flex';
                    dlBtn.href = imgSrc;
                    dlBtn.download = item.customUrl ? `${item.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png` : `nailong_cromo_${item.id}.webp`;
                }
            }

            const visorBtn = document.getElementById('lb-visor-btn');
            if (visorBtn) visorBtn.style.display = featuredGifIndexOf(item) >= 0 ? 'inline-flex' : 'none';

            modal.classList.remove('hidden');
            modal.classList.add('flex');
            modal.style.display = 'flex';
        }

        // Posición del sticker en el Visor Mágico (-1 si no es una de sus 9 escenas)
        function featuredGifIndexOf(item) {
            if (!item || item.customUrl) return -1;
            return FEATURED_GIFS.findIndex(g => g.id === item.id);
        }

        function openVisorFromLightbox() {
            const idx = featuredGifIndexOf(displayedStickers[currentLightboxIndex]);
            if (idx < 0) return;
            closePhotoLightbox();
            openMagicModal(idx);
        }

        function closePhotoLightbox() {
            playSound('pop');
            const modal = document.getElementById('photo-lightbox');
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            modal.style.display = 'none';
        }

        function nextLightboxPhoto() {
            if (displayedStickers.length === 0) return;
            currentLightboxIndex = (currentLightboxIndex + 1) % displayedStickers.length;
            openPhotoLightbox(currentLightboxIndex);
        }

        function prevLightboxPhoto() {
            if (displayedStickers.length === 0) return;
            currentLightboxIndex = (currentLightboxIndex - 1 + displayedStickers.length) % displayedStickers.length;
            openPhotoLightbox(currentLightboxIndex);
        }

        // Keyboard arrows navigation for modals
        window.addEventListener('keydown', (e) => {
            const lb = document.getElementById('photo-lightbox');
            if (lb && !lb.classList.contains('hidden') && lb.style.display !== 'none') {
                if (e.key === 'ArrowRight') nextLightboxPhoto();
                if (e.key === 'ArrowLeft') prevLightboxPhoto();
                if (e.key === 'Escape') closePhotoLightbox();
            }
            const modal = document.getElementById('magic-modal');
            if (modal && !modal.classList.contains('hidden') && modal.style.display !== 'none') {
                if (e.key === 'ArrowRight') nextMagicGif();
                if (e.key === 'ArrowLeft') prevMagicGif();
                if (e.key === 'Escape') closeMagicModal();
            }
            const sm = document.getElementById('share-modal');
            if (sm && !sm.classList.contains('hidden') && sm.style.display !== 'none') {
                if (e.key === 'Escape') closeShareModal();
            }
            const som = document.getElementById('sticker-options-modal');
            if (som && !som.classList.contains('hidden') && som.style.display !== 'none') {
                if (e.key === 'Escape') closeStickerOptionsModal();
            }
        });

        /* ==============================================================
           7B. STICKER DOWNLOAD, WHATSAPP & CLIPBOARD INTEGRATION
        ============================================================== */
        let toastTimer = null;
        function showDuangToast(msg) {
            const toast = document.getElementById('duang-toast');
            const toastText = document.getElementById('duang-toast-text');
            if (!toast || !toastText) return;
            toastText.textContent = msg;
            toast.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
            toast.classList.add('opacity-100', 'translate-y-0');
            if (toastTimer) clearTimeout(toastTimer);
            toastTimer = setTimeout(() => {
                toast.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
                toast.classList.remove('opacity-100', 'translate-y-0');
            }, 3600);
        }

        let currentStickerOptTarget = null;

        function openStickerOptionsModal(url, filename, title) {
            playSound('pop');
            currentStickerOptTarget = { url, filename, title };
            const modal = document.getElementById('sticker-options-modal');
            if (!modal) return;
            
            const titleEl = document.getElementById('sticker-opt-title');
            const previewEl = document.getElementById('sticker-opt-preview');
            if (titleEl) titleEl.textContent = title || 'Sticker de Nailong';
            if (previewEl) previewEl.src = url;

            modal.classList.remove('hidden');
            modal.classList.add('flex');
            modal.style.display = 'flex';
        }

        function closeStickerOptionsModal() {
            playSound('pop');
            const modal = document.getElementById('sticker-options-modal');
            if (!modal) return;
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            modal.style.display = 'none';
        }

        function handleModalDownload(event) {
            if (event && event.preventDefault) event.preventDefault();
            const gif = FEATURED_GIFS[currentModalGifIndex];
            if (!gif) return;
            const url = `Stickers Nailong/sticker_${gif.id}.webp`;
            const filename = `nailong_animado_${gif.id}.webp`;
            const title = `${gif.title} - Nailong`;
            openStickerOptionsModal(url, filename, title);
        }

        function shareCurrentModalStickerToWhatsApp() {
            const gif = FEATURED_GIFS[currentModalGifIndex];
            if (!gif) return;
            const url = `Stickers Nailong/sticker_${gif.id}.webp`;
            const filename = `nailong_animado_${gif.id}.webp`;
            const title = `${gif.title} - Nailong`;
            shareStickerDirectToWhatsApp(url, filename, title);
        }

        function handleLightboxDownload(event) {
            if (event && event.preventDefault) event.preventDefault();
            const item = displayedStickers[currentLightboxIndex];
            if (!item || isCreatorItem(item)) return;
            const url = item.customUrl ? item.customUrl : `Stickers Nailong/${item.file}`;
            const filename = item.customUrl ? `${item.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png` : `nailong_cromo_${item.id}.webp`;
            const title = `${item.title} - Nailong`;
            openStickerOptionsModal(url, filename, title);
        }

        function shareCurrentLightboxToWhatsApp() {
            const item = displayedStickers[currentLightboxIndex];
            if (!item || isCreatorItem(item)) return;
            const url = item.customUrl ? item.customUrl : `Stickers Nailong/${item.file}`;
            const filename = item.customUrl ? `${item.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png` : `nailong_cromo_${item.id}.webp`;
            const title = `${item.title} - Nailong`;
            shareStickerDirectToWhatsApp(url, filename, title);
        }

        async function executeStickerAction(action) {
            if (!currentStickerOptTarget) return;
            const { url, filename, title } = currentStickerOptTarget;

            if (action === 'whatsapp') {
                closeStickerOptionsModal();
                await shareStickerDirectToWhatsApp(url, filename, title);
            } else if (action === 'download') {
                closeStickerOptionsModal();
                await forceDownloadSticker(url, filename, title);
            } else if (action === 'copy') {
                closeStickerOptionsModal();
                await copyStickerToClipboard(url);
            }
        }

        async function forceDownloadSticker(url, filename, title) {
            playSound('duang');
            const isIOS = (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) && !window.MSStream;
            const isMobile = isIOS || /Android/i.test(navigator.userAgent);

            try {
                const res = await fetch(url);
                const blob = await res.blob();
                const file = new File([blob], filename, { type: blob.type || 'image/webp' });

                // On mobile (especially iOS Safari), navigator.share with files allows direct "Guardar imagen" (Camera Roll)
                if (isMobile && navigator.canShare && navigator.canShare({ files: [file] })) {
                    showDuangToast('💡 En el menú nativo pulsa «Guardar imagen» para guardarla en tu Carrete de fotos.');
                    try {
                        await navigator.share({
                            files: [file],
                            title: title || 'Sticker de Nailong'
                        });
                        showDuangToast('✨ ¡Sticker guardado con éxito!');
                        return;
                    } catch (shareErr) {
                        if (shareErr.name === 'AbortError') {
                            // User dismissed share menu; proceed with blob trigger fallback
                        }
                    }
                }

                // Direct in-browser blob download
                const blobUrl = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(blobUrl);
                }, 4000);

                if (isIOS) {
                    showDuangToast('📥 Pulsa «Descargar» en la barra de Safari para abrir el archivo.');
                } else {
                    showDuangToast('📥 ¡Descarga completada con éxito!');
                }
            } catch (e) {
                console.warn('Fallback direct download triggered:', e);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.target = '_blank';
                document.body.appendChild(a);
                a.click();
                setTimeout(() => document.body.removeChild(a), 2000);
                showDuangToast('💡 Mantén pulsada la imagen para guardarla en Fotos.');
            }
        }

        async function shareStickerDirectToWhatsApp(url, filename, title) {
            playSound('duang');
            try {
                const res = await fetch(url);
                const blob = await res.blob();
                const file = new File([blob], filename, { type: blob.type || 'image/webp' });

                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    showDuangToast('📲 Elige WhatsApp: llegará como foto. Para enviarlo como sticker usa «Copiar Sticker».');
                    await navigator.share({
                        files: [file],
                        title: title || 'Sticker Nailong'
                    });
                } else {
                    // Browser without file share support (desktop PC / laptop)
                    const blobUrl = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = blobUrl;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(() => {
                        document.body.removeChild(a);
                        URL.revokeObjectURL(blobUrl);
                    }, 4000);

                    showDuangToast('📥 Sticker descargado. Arrástralo a WhatsApp Web (web.whatsapp.com) para enviarlo.');
                }
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.warn('WhatsApp share error:', err);
                    showDuangToast('💡 Usa el botón Descargar y comparte el archivo en WhatsApp.');
                }
            }
        }

        // Esquinas de radio 48 px = 2178 píxeles transparentes: cantidad comprobada en WhatsApp.
        const CLIPBOARD_CORNER_RADIUS = 48;
        const CLIPBOARD_MIN_TRANSPARENT = 2178;

        function countTransparentPixels(ctx) {
            const data = ctx.getImageData(0, 0, 512, 512).data;
            let n = 0;
            for (let i = 3; i < data.length; i += 4) if (data[i] < 255) n++;
            return n;
        }

        async function copyStickerToClipboard(url) {
            playSound('pop');
            showDuangToast('⏳ Preparando sticker para copiar...');
            try {
                const res = await fetch(url);
                const blob = await res.blob();
                const blobUrl = URL.createObjectURL(blob);

                const img = new Image();
                img.crossOrigin = 'anonymous';
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = blobUrl;
                });
                URL.revokeObjectURL(blobUrl);

                // WhatsApp solo pega como sticker un PNG con transparencia visible: los opacos
                // (y un solo píxel transparente) llegan como foto (probado en Android, ver ADR-08).
                // Si el sticker apenas tiene transparencia, se recortan esquinas redondeadas.
                const canvas = document.createElement('canvas');
                canvas.width = canvas.height = 512;
                const ctx = canvas.getContext('2d');
                const scale = Math.min(512 / (img.naturalWidth || 512), 512 / (img.naturalHeight || 512));
                const w = (img.naturalWidth || 512) * scale, h = (img.naturalHeight || 512) * scale;
                const draw = () => ctx.drawImage(img, (512 - w) / 2, (512 - h) / 2, w, h);
                draw();
                if (countTransparentPixels(ctx) < CLIPBOARD_MIN_TRANSPARENT) {
                    ctx.clearRect(0, 0, 512, 512);
                    ctx.save();
                    ctx.beginPath();
                    if (ctx.roundRect) ctx.roundRect(0, 0, 512, 512, CLIPBOARD_CORNER_RADIUS);
                    else ctx.rect(0, 0, 512, 512);
                    ctx.clip();
                    draw();
                    ctx.restore();
                }

                canvas.toBlob(async (pngBlob) => {
                    if (!pngBlob) {
                        showDuangToast('💡 Mantén pulsada la imagen para copiarla.');
                        return;
                    }
                    try {
                        if (navigator.clipboard && window.ClipboardItem) {
                            await navigator.clipboard.write([
                                new ClipboardItem({ 'image/png': pngBlob })
                            ]);
                            playSound('fanfare');
                            showDuangToast('✨ ¡Copiado! Mantén pulsado en el chat de WhatsApp y pulsa «Pegar»: llegará como sticker (los animados, quietos).');
                        } else {
                            showDuangToast('💡 En tu móvil, mantén pulsada la imagen para copiarla.');
                        }
                    } catch (clipErr) {
                        console.warn('Clipboard write failed:', clipErr);
                        showDuangToast('💡 Mantén pulsada la imagen en pantalla para copiarla.');
                    }
                }, 'image/png');
            } catch (e) {
                console.warn('Copy failed:', e);
                showDuangToast('💡 No se pudo copiar. Usa la opción Descargar.');
            }
        }

        const USER_PHOTOS_STORAGE_KEY = 'nailong_saved_user_photos_v1';

        function loadUserPhotosFromStorage() {
            try {
                const raw = localStorage.getItem(USER_PHOTOS_STORAGE_KEY);
                if (!raw) return;
                const saved = JSON.parse(raw);
                if (Array.isArray(saved) && saved.length > 0) {
                    saved.forEach(photo => {
                        if (!ALL_STICKERS.some(s => String(s.id) === String(photo.id))) {
                            ALL_STICKERS.unshift(photo);
                        }
                    });
                    updateFilterCounts();
                }
            } catch(e) {
                console.warn('Error al cargar fotos de localStorage:', e);
            }
        }

        function saveUserPhotosToStorage() {
            try {
                const userPhotos = ALL_STICKERS.filter(s => s.isUserPhoto);
                localStorage.setItem(USER_PHOTOS_STORAGE_KEY, JSON.stringify(userPhotos));
            } catch(e) {
                console.warn('LocalStorage error:', e);
                showDuangToast('No caben más fotos en este navegador 😢');
            }
        }

        function deleteUserPhoto(photoId, e) {
            if (e && e.stopPropagation) e.stopPropagation();
            if (!confirm('¿Borrar esta foto de tu álbum?')) return;
            playSound('pop');
            ALL_STICKERS = ALL_STICKERS.filter(s => String(s.id) !== String(photoId));
            saveUserPhotosToStorage();
            updateFilterCounts();
            renderPolaroidGallery(activeFilter);
        }

        // Los contadores de los filtros se calculan desde los datos reales de ALL_STICKERS
        const FILTER_LABELS = {
            all: '✨ Todas las Fotos',
            animated: '🎬 En Movimiento',
            comida: '🍗 Comilonas',
            caritas: '🤪 Caritas & Pucheros',
            bailes: '💃 Bailes & Travesuras',
            amigos: '👥 Xiao Qi y Bombloong'
        };

        function updateFilterCounts() {
            Object.keys(FILTER_LABELS).forEach(key => {
                const btn = document.querySelector(`#gallery-filters button[data-filter="${key}"]`);
                if (!btn) return;
                let count;
                if (key === 'all') count = ALL_STICKERS.length;
                else if (key === 'animated') count = ALL_STICKERS.filter(st => st.frames > 2).length;
                else count = ALL_STICKERS.filter(st => st.cat === key).length;
                btn.textContent = `${FILTER_LABELS[key]} (${count})`;
            });
        }

        function handleUserPhotoUpload(event) {
            const files = event.target.files;
            if (!files || !files.length) return;

            Array.from(files).forEach((file, i) => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const tempImg = new Image();
                    tempImg.onload = function() {
                        const maxDim = 900;
                        let w = tempImg.naturalWidth || tempImg.width;
                        let h = tempImg.naturalHeight || tempImg.height;
                        if (w > maxDim || h > maxDim) {
                            if (w > h) {
                                h = Math.round((h * maxDim) / w);
                                w = maxDim;
                            } else {
                                w = Math.round((w * maxDim) / h);
                                h = maxDim;
                            }
                        }
                        const canvas = document.createElement('canvas');
                        canvas.width = w;
                        canvas.height = h;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(tempImg, 0, 0, w, h);
                        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);

                        const newId = 'user_' + Date.now() + '_' + i;
                        const newPhoto = {
                            id: newId,
                            file: '',
                            customUrl: compressedBase64,
                            frames: 1,
                            title: file.name.replace(/\.[^/.]+$/, '').slice(0, 24) || '¡Tu Foto Especial!',
                            cat: 'caritas',
                            sound: 'fanfare',
                            isUserPhoto: true,
                            desc: '¡Foto guardada en tu álbum local de Nailong!'
                        };

                        ALL_STICKERS.unshift(newPhoto);
                        saveUserPhotosToStorage();

                        document.querySelectorAll('#gallery-filters .gallery-filter-btn').forEach(b => {
                            b.className = 'gallery-filter-btn bg-white hover:bg-nailong-pale text-amber-900 font-display font-bold px-4 py-2 rounded-full text-sm border-2 border-nailong-yellow transition-all';
                        });
                        const allBtn = document.querySelector('#gallery-filters button[data-filter="all"]');
                        if (allBtn) {
                            allBtn.className = 'gallery-filter-btn bg-nailong-yellow text-amber-950 font-display font-bold px-4 py-2 rounded-full text-sm border-2 border-amber-500 shadow-sm transition-all';
                        }
                        updateFilterCounts();

                        renderPolaroidGallery('all');
                        playSound('fanfare');
                        triggerPartyMode();
                    };
                    tempImg.src = e.target.result;
                };
                reader.readAsDataURL(file);
            });
            event.target.value = '';
        }

