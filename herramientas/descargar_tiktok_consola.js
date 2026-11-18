/*
 * Recopilador de stickers de TikTok Web para la consola del navegador (Brave / Chrome).
 *
 * Uso:
 *   1. Envia los stickers a tu propio chat en TikTok Web y abre la conversacion.
 *   2. Abre DevTools (F12 -> Consola), pega este script entero y pulsa Enter.
 *   3. Haz scroll despacio por todo el chat para que se carguen todos los stickers.
 *   4. Pulsa el boton amarillo "Descargar N stickers" (arriba a la derecha).
 *      Si Brave pide permiso para descargas multiples, pulsa "Permitir".
 *   5. Mueve los archivos descargados de Descargas a una carpeta de trabajo y ejecuta:
 *        python normalizar_stickers.py --clasificar "ruta/a/tu/carpeta"
 */
(() => {
    if (performance.setResourceTimingBufferSize) {
        try { performance.setResourceTimingBufferSize(2000); } catch {}
    }

    const ahora = new Date();
    const lote = String(ahora.getHours()).padStart(2, '0') + String(ahora.getMinutes()).padStart(2, '0');
    const urlsImagenes = new Map();
    const urlsRed = new Map();
    let indiceRed = 0;
    let ultimoTotal = -1;
    let descargando = false;

    const esUrlSticker = (url) =>
        typeof url === 'string' &&
        url.startsWith('http') &&
        (url.includes('video2sticker') || url.includes('photo-comment') || url.includes('.awebp'));

    const recolectar = () => {
        const imgs = document.images;
        for (let i = 0; i < imgs.length; i++) {
            const url = imgs[i].currentSrc || imgs[i].src;
            if (!esUrlSticker(url)) continue;
            const clave = url.split('?')[0];
            urlsImagenes.set(clave, url);
            urlsRed.delete(clave);
        }
        const red = performance.getEntriesByType('resource');
        for (let i = indiceRed; i < red.length; i++) {
            const url = red[i].name;
            if (!esUrlSticker(url)) continue;
            const clave = url.split('?')[0];
            if (!urlsImagenes.has(clave) && !urlsRed.has(clave)) {
                urlsRed.set(clave, url);
            }
        }
        indiceRed = red.length;

        const total = urlsImagenes.size + urlsRed.size;
        if (!descargando && total !== ultimoTotal) {
            ultimoTotal = total;
            btnDescargar.textContent = `📥 Descargar ${ultimoTotal} stickers`;
        }
    };

    const sha256Hex = async (buf) => {
        const hash = await crypto.subtle.digest('SHA-256', buf);
        return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
    };

    const detectarExtension = (buf) => {
        const u = new Uint8Array(buf.slice(0, 12));
        if (u[0] === 0x89 && u[1] === 0x50 && u[2] === 0x4E && u[3] === 0x47) return 'png';
        if (u[0] === 0x47 && u[1] === 0x49 && u[2] === 0x46) return 'gif';
        if (u[0] === 0xFF && u[1] === 0xD8 && u[2] === 0xFF) return 'jpg';
        return 'webp';
    };

    const viejo = document.getElementById('nailong-tk-panel');
    if (viejo) viejo.remove();
    if (window.__nailongTkTimer) clearInterval(window.__nailongTkTimer);

    const panel = document.createElement('div');
    panel.id = 'nailong-tk-panel';
    Object.assign(panel.style, {
        position: 'fixed', top: '16px', right: '16px', zIndex: '2147483647',
        display: 'flex', gap: '8px', padding: '10px 12px', borderRadius: '14px',
        background: '#1c1917', color: '#fff', fontFamily: 'sans-serif', fontSize: '14px',
        boxShadow: '0 8px 24px rgba(0,0,0,.35)', alignItems: 'center'
    });

    const btnDescargar = document.createElement('button');
    Object.assign(btnDescargar.style, {
        background: '#ffd93d', color: '#1c1917', fontWeight: '700',
        border: 'none', borderRadius: '10px', padding: '8px 12px', cursor: 'pointer'
    });

    const btnCerrar = document.createElement('button');
    btnCerrar.textContent = '✕';
    btnCerrar.title = 'Cerrar panel';
    Object.assign(btnCerrar.style, {
        background: '#44403c', color: '#fff', border: 'none',
        borderRadius: '10px', padding: '8px 10px', cursor: 'pointer'
    });

    panel.append(btnDescargar, btnCerrar);
    document.body.appendChild(panel);

    window.__nailongTkTimer = setInterval(recolectar, 1000);
    recolectar();

    const limpiar = () => {
        clearInterval(window.__nailongTkTimer);
        window.__nailongTkTimer = null;
        panel.remove();
    };
    btnCerrar.onclick = limpiar;

    const descargarTodo = async () => {
        if (descargando) return;
        descargando = true;
        recolectar();

        const candidatos = [
            ...Array.from(urlsImagenes.values(), (url) => ({ url, origen: 'img' })),
            ...Array.from(urlsRed.values(), (url) => ({ url, origen: 'red' }))
        ];
        const hashesVistos = new Set();
        let guardados = 0;
        let duplicados = 0;
        let procesados = 0;
        let erroresImg = 0;
        let erroresRed = 0;

        console.log(`📥 Procesando ${candidatos.length} URLs únicas (${urlsImagenes.size} de imágenes, ${urlsRed.size} de red; lote ${lote})...`);

        for (const { url, origen } of candidatos) {
            procesados++;
            try {
                const res = await fetch(url, { credentials: 'omit' });
                if (!res.ok) {
                    if (origen === 'img') erroresImg++; else erroresRed++;
                    btnDescargar.textContent = `⏳ ${procesados}/${candidatos.length}`;
                    continue;
                }
                const buf = await res.arrayBuffer();
                const h = await sha256Hex(buf);
                if (hashesVistos.has(h)) {
                    duplicados++;
                    btnDescargar.textContent = `⏳ ${procesados}/${candidatos.length}`;
                    continue;
                }
                hashesVistos.add(h);
                guardados++;

                const ext = detectarExtension(buf);
                const nombre = `tiktok_${lote}_${String(guardados).padStart(3, '0')}.${ext}`;
                const blobUrl = URL.createObjectURL(new Blob([buf]));
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = nombre;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(blobUrl);

                btnDescargar.textContent = `⏳ ${procesados}/${candidatos.length}`;
                await new Promise((r) => setTimeout(r, 300));
            } catch {
                if (origen === 'img') erroresImg++; else erroresRed++;
                btnDescargar.textContent = `⏳ ${procesados}/${candidatos.length}`;
            }
        }

        descargando = false;
        ultimoTotal = -1;
        const errores = erroresImg + erroresRed;
        const detalleErrores = errores ? ` (${erroresImg} de imágenes, ${erroresRed} de red)` : '';
        console.log(`🎉 Terminado (lote ${lote}): ${guardados} descargados en Descargas (tiktok_${lote}_*.webp), ${duplicados} duplicados ignorados, ${errores} fallos${detalleErrores}.`);
        btnDescargar.textContent = `✅ ${guardados} listos (reintentar)`;
    };

    btnDescargar.onclick = descargarTodo;
    window.descargarStickersTikTok = descargarTodo;

    console.log('🦖 Capturador de Nailong activo.');
    console.log('1) Haz scroll despacio por el chat hasta ver TODOS los stickers.');
    console.log('2) Pulsa el botón amarillo "📥 Descargar N stickers" (o ejecuta descargarStickersTikTok()).');
    console.log('3) Si Brave pide permiso para "descargas múltiples", pulsa Permitir (y si se bloqueó alguno, vuelve a pulsar el botón).');
})();
