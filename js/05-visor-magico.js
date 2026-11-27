        /* ==============================================================
           5. TIRA DE ESCENAS DEL VISOR MÁGICO
           Cada escena solo guarda su etiqueta y su fondo: el título y la descripción se
           leen de ALL_STICKERS (js/02), así no vuelven a desincronizarse (VM2).
        ============================================================== */
        const FEATURED_GIFS = [
            { id: 17, tag: 'GLOTÓN 🍿', bg: 'from-amber-100 to-yellow-100' },
            { id: 10, tag: 'ARCOÍRIS 🌈', bg: 'from-yellow-100 to-pink-100' },
            { id: 33, tag: 'FIESTA 🦁', bg: 'from-sky-100 to-teal-100' },
            { id: 21, tag: 'ESCAPE 🏃', bg: 'from-orange-100 to-amber-100' },
            { id: 29, tag: 'RELAX 🍃', bg: 'from-emerald-100 to-lime-100' },
            { id: 38, tag: 'DORMILÓN 🍼', bg: 'from-blue-100 to-sky-100' },
            { id: 13, tag: 'RISAS 😝', bg: 'from-rose-100 to-amber-100' },
            { id: 11, tag: 'PUCHERO 🥺', bg: 'from-yellow-100 to-orange-100' },
            { id: 39, tag: 'ALEGRÍA 🕺', bg: 'from-purple-100 to-pink-100' }
        ];

        // Cromo de ALL_STICKERS que corresponde a una escena de la tira
        function stickerDeEscena(gif) {
            return ALL_STICKERS.find(s => s.id === gif.id) || null;
        }

        // ¿Se mueve? (cromos del catálogo con más de un fotograma; las fotos del usuario no)
        function esStickerAnimado(item) {
            return Boolean(item && !item.customUrl && item.frames > 1 && /^sticker_\d+\.webp$/.test(item.file || ''));
        }

        function renderGifWall() {
            const grid = document.getElementById('gif-wall-grid');
            grid.innerHTML = FEATURED_GIFS.map((gif, index) => {
                const s = stickerDeEscena(gif);
                if (!s) return '';
                const titulo = escaparHtml(s.title);
                return `
                <button type="button" onclick="openMagicModal(${index})" class="shrink-0 snap-start w-32 sm:w-40 clay-card p-2 cursor-pointer group text-center" aria-label="Abrir en el Visor Mágico: ${titulo}">
                    <div class="aspect-square rounded-xl bg-gradient-to-br ${gif.bg} border-2 border-nailong-yellow flex items-center justify-center overflow-hidden p-1.5">
                        <img src="Stickers Nailong/${s.file}" alt="${titulo}" loading="lazy" decoding="async" class="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300">
                    </div>
                    <span class="block pt-1.5 font-display font-bold text-[11px] sm:text-xs leading-tight text-amber-950 group-hover:text-[#C2410C] transition-colors">${titulo}</span>
                </button>`;
            }).join('');
        }

        /* ==============================================================
           6. VISOR MÁGICO: CUALQUIER STICKER ANIMADO (VM2) CON REPRODUCTOR PROPIO (VM1)
        ============================================================== */
        /* Los 4 modales son <dialog> nativos: showModal() atrapa el foco, deja inerte el fondo y
           devuelve el foco al cerrar. La visibilidad sigue mandándola hidden/flex + style.display,
           así el resto del código (flechas, bloqueo de scroll) no cambia. */
        function abrirDialogo(modal) {
            if (modal && typeof modal.showModal === 'function' && !modal.open) modal.showModal();
        }

        function cerrarDialogo(modal) {
            if (modal && typeof modal.close === 'function' && modal.open) modal.close();
        }

        // Lista que recorren ◀ ▶: las 9 escenas de la tira o todos los cromos animados del álbum
        let visorLista = [];          // [{ s: cromo de ALL_STICKERS, tag: etiqueta de escena o null }]
        let visorEscenas = false;
        let currentModalGifIndex = 0;

        function stickerActualVisor() {
            const entrada = visorLista[currentModalGifIndex];
            return entrada ? entrada.s : null;
        }

        // Desde la tira de escenas
        function openMagicModal(index) {
            visorLista = FEATURED_GIFS.map(g => ({ s: stickerDeEscena(g), tag: g.tag })).filter(e => e.s);
            visorEscenas = true;
            mostrarEnVisor(index);
        }

        // Desde el álbum (lightbox) o «Sorpréndeme»: se recorren todos los cromos animados
        function abrirVisorConSticker(item) {
            visorLista = ALL_STICKERS.filter(esStickerAnimado).map(s => ({ s, tag: null }));
            visorEscenas = false;
            const i = visorLista.findIndex(e => e.s === item || (item && e.s.id === item.id));
            mostrarEnVisor(i >= 0 ? i : 0);
        }

        function sorprendeme() {
            const animados = ALL_STICKERS.filter(esStickerAnimado);
            if (!animados.length) return;
            const modal = document.getElementById('magic-modal');
            const actual = modal && modal.open ? stickerActualVisor() : null;
            let elegido = animados[Math.floor(Math.random() * animados.length)];
            if (animados.length > 1) {
                while (elegido === actual) elegido = animados[Math.floor(Math.random() * animados.length)];
            }
            abrirVisorConSticker(elegido);
        }

        function mostrarEnVisor(index) {
            const n = visorLista.length;
            if (!n) return;
            playSound('pop');
            currentModalGifIndex = ((index % n) + n) % n;
            const { s, tag } = visorLista[currentModalGifIndex];
            const modal = document.getElementById('magic-modal');
            const yaAbierto = modal.open;

            document.getElementById('modal-title').textContent = s.title;
            document.getElementById('modal-badge').textContent = visorEscenas
                ? `${tag} • ${currentModalGifIndex + 1}/${n}`
                : `#${s.id} • ${currentModalGifIndex + 1}/${n}`;
            document.getElementById('modal-description').textContent = s.desc;

            const url = `Stickers Nailong/${s.file}`;
            const descarga = document.getElementById('modal-download-btn');
            descarga.href = url;
            descarga.download = `nailong_animado_${s.id}.webp`;
            document.getElementById('modal-stickers-layer').innerHTML = '';

            modal.classList.remove('hidden');
            modal.classList.add('flex');
            modal.style.display = 'flex';
            abrirDialogo(modal);
            prepararEventosVisor(modal);
            // Al abrir de nuevo, velocidad normal y hacia delante; al pasar de cromo se conserva lo elegido
            if (!yaAbierto) reiniciarAjustesVisor();
            cargarEnReproductor(url, s.title);
        }

        function closeMagicModal() {
            playSound('pop');
            const modal = document.getElementById('magic-modal');
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            modal.style.display = 'none';
            cerrarDialogo(modal);
            soltarVisor();
        }

        function nextMagicGif() {
            mostrarEnVisor(currentModalGifIndex + 1);
        }

        function prevMagicGif() {
            mostrarEnVisor(currentModalGifIndex - 1);
        }

        /* ==============================================================
           6A. REPRODUCTOR PROPIO DE WEBP ANIMADO (VM1)
           Un <img> no deja cambiar la velocidad de un WebP animado. Aquí se lee el fichero
           (RIFF), se separan sus fotogramas (ANMF), se decodifica cada uno con
           createImageBitmap (o con un <img> si el navegador no puede) a tamaño de pantalla y
           se componen en un <canvas> respetando su desplazamiento, su fusión y su borrado.
           Con los fotogramas ya compuestos, la velocidad, la pausa, el paso a paso, la marcha
           atrás y el bumerán son reales. Al cerrar se libera toda la memoria.
           Sin ImageDecoder (WebCodecs): no está comprobado en Safari de iPhone.
        ============================================================== */
        const VISOR_VELOCIDADES = [0.25, 0.5, 1, 1.5, 2, 3];
        const VISOR_BYTES_MAX = 48 * 1024 * 1024;        // tope de memoria de los fotogramas compuestos
        const VISOR_BYTES_MAX_MOVIL = 32 * 1024 * 1024;  // en móviles (táctiles o con poca RAM), menos
        const VISOR_LADO_MIN = 96;
        const VISOR_DECODIFICANDO_A_LA_VEZ = 4;

        const reproductorVisor = {
            fotogramas: [],      // [{ img: ImageBitmap o <canvas>, dur: ms, inicio: ms }]
            total: 0,            // duración de una vuelta (ms)
            indice: 0,
            acumulado: 0,
            ultimo: 0,
            raf: 0,
            turno: 0,            // cambia en cada carga: descarta trabajos viejos
            listo: false,
            reproduciendo: false,
            velocidad: 1,
            marchaAtras: false,
            bumeran: false,
            sentido: 1,
            abortar: null,
            ctx: null
        };

        // --- Lector del contenedor WebP (RIFF) ---
        function leerWebPAnimado(buffer) {
            const bytes = new Uint8Array(buffer);
            if (bytes.length < 20) return null;
            const vista = new DataView(buffer);
            const cuatro = p => String.fromCharCode(bytes[p], bytes[p + 1], bytes[p + 2], bytes[p + 3]);
            const u24 = p => bytes[p] | (bytes[p + 1] << 8) | (bytes[p + 2] << 16);
            if (cuatro(0) !== 'RIFF' || cuatro(8) !== 'WEBP') return null;

            const fin = Math.min(bytes.length, 8 + vista.getUint32(4, true));
            let ancho = 0, alto = 0, p = 12;
            const fotogramas = [];
            while (p + 8 <= fin) {
                const tipo = cuatro(p);
                const tam = vista.getUint32(p + 4, true);
                const datos = p + 8;
                if (datos + tam > fin) break;
                if (tipo === 'VP8X' && tam >= 10) {
                    ancho = 1 + u24(datos + 4);
                    alto = 1 + u24(datos + 7);
                } else if (tipo === 'ANMF' && tam > 16) {
                    const w = 1 + u24(datos + 6);
                    const h = 1 + u24(datos + 9);
                    const banderas = bytes[datos + 15];
                    fotogramas.push({
                        x: 2 * u24(datos), y: 2 * u24(datos + 3), w, h,
                        dur: u24(datos + 12),
                        borrar: (banderas & 1) === 1,     // al terminar, su rectángulo vuelve a transparente
                        mezclar: (banderas & 2) === 0,    // se funde con lo de debajo; si no, lo sustituye
                        archivo: webpDeFotograma(bytes, datos + 16, datos + tam, w, h)
                    });
                }
                p = datos + tam + (tam & 1);
            }
            if (!ancho || !alto || !fotogramas.length) return null;
            return { ancho, alto, fotogramas };
        }

        // Envuelve los datos de un fotograma (ALPH + VP8, o VP8/VP8L) en un .webp que se decodifica solo
        function webpDeFotograma(bytes, ini, fin, w, h) {
            const datos = bytes.subarray(ini, fin);
            const conAlfa = datos.length > 4 && datos[0] === 0x41 && datos[1] === 0x4C && datos[2] === 0x50 && datos[3] === 0x48; // 'ALPH'
            const extra = conAlfa ? 18 : 0;
            const cab = new Uint8Array(12 + extra);
            const v = new DataView(cab.buffer);
            cab.set([0x52, 0x49, 0x46, 0x46], 0);   // 'RIFF'
            v.setUint32(4, 4 + extra + datos.length, true);
            cab.set([0x57, 0x45, 0x42, 0x50], 8);   // 'WEBP'
            if (conAlfa) {
                // Un canal alfa aparte solo es válido dentro de un WebP extendido (VP8X con la bandera de alfa)
                cab.set([0x56, 0x50, 0x38, 0x58], 12);  // 'VP8X'
                v.setUint32(16, 10, true);
                cab[20] = 0x10;
                const w1 = w - 1, h1 = h - 1;
                cab[24] = w1 & 255; cab[25] = (w1 >> 8) & 255; cab[26] = (w1 >> 16) & 255;
                cab[27] = h1 & 255; cab[28] = (h1 >> 8) & 255; cab[29] = (h1 >> 16) & 255;
            }
            return new Blob([cab, datos], { type: 'image/webp' });
        }

        // --- Decodificación y composición ---
        async function decodificarFotograma(archivo, ancho, alto) {
            if (typeof createImageBitmap === 'function') {
                try {
                    const bmp = await createImageBitmap(archivo, { resizeWidth: ancho, resizeHeight: alto, resizeQuality: 'high' });
                    return { fuente: bmp, soltar: () => bmp.close() };
                } catch (e) {
                    try {
                        const bmp = await createImageBitmap(archivo);
                        return { fuente: bmp, soltar: () => bmp.close() };
                    } catch (e2) { /* se intenta con <img> */ }
                }
            }
            const url = URL.createObjectURL(archivo);
            const img = new Image();
            img.src = url;
            try {
                if (img.decode) await img.decode();
                else await new Promise((ok, mal) => { img.onload = ok; img.onerror = mal; });
            } catch (e) {
                URL.revokeObjectURL(url);
                throw e;
            }
            return { fuente: img, soltar: () => URL.revokeObjectURL(url) };
        }

        async function instantaneaLienzo(lienzo) {
            if (typeof createImageBitmap === 'function') {
                try { return await createImageBitmap(lienzo); } catch (e) { /* copia en <canvas> */ }
            }
            const copia = document.createElement('canvas');
            copia.width = lienzo.width;
            copia.height = lienzo.height;
            copia.getContext('2d').drawImage(lienzo, 0, 0);
            return copia;
        }

        function soltarFotogramas(lista) {
            (lista || []).forEach(f => {
                const img = f && f.img;
                if (!img) return;
                if (typeof img.close === 'function') img.close();
                else { img.width = 0; img.height = 0; }
            });
        }

        // Lado (px) al que se decodifica: el de la pantalla, sin pasar del original ni del tope de memoria
        function ladoDeDecodificacion(info) {
            const caja = document.getElementById('modal-content-holder');
            let css = 256;
            if (caja) {
                const est = getComputedStyle(caja);
                const w = caja.clientWidth - parseFloat(est.paddingLeft) - parseFloat(est.paddingRight);
                const h = caja.clientHeight - parseFloat(est.paddingTop) - parseFloat(est.paddingBottom);
                if (w > 0 && h > 0) css = Math.min(w, h);
            }
            const dpr = Math.min(window.devicePixelRatio || 1, 3);
            const mayor = Math.max(info.ancho, info.alto);
            const movil = (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) || (navigator.deviceMemory && navigator.deviceMemory <= 4);
            const tope = movil ? VISOR_BYTES_MAX_MOVIL : VISOR_BYTES_MAX;
            const porMemoria = Math.floor(Math.sqrt(tope / (4 * info.fotogramas.length)));
            return Math.max(VISOR_LADO_MIN, Math.min(mayor, Math.ceil(css * dpr), porMemoria));
        }

        async function componerFotogramas(info, lado, turno) {
            const R = reproductorVisor;
            const escala = lado / Math.max(info.ancho, info.alto);
            const lienzo = document.createElement('canvas');
            lienzo.width = Math.max(1, Math.round(info.ancho * escala));
            lienzo.height = Math.max(1, Math.round(info.alto * escala));
            const ctx = lienzo.getContext('2d');
            const n = info.fotogramas.length;
            const rect = info.fotogramas.map(f => {
                const x0 = Math.round(f.x * escala), y0 = Math.round(f.y * escala);
                return { x0, y0, w: Math.max(1, Math.round((f.x + f.w) * escala) - x0), h: Math.max(1, Math.round((f.y + f.h) * escala) - y0) };
            });
            // Se decodifican unos pocos por delante mientras se compone en orden
            const pendientes = new Map();
            const pedir = i => {
                if (i < n && !pendientes.has(i)) pendientes.set(i, decodificarFotograma(info.fotogramas[i].archivo, rect[i].w, rect[i].h));
            };
            const listos = [];
            let inicio = 0;
            try {
                for (let i = 0; i < n; i++) {
                    for (let k = i; k < i + VISOR_DECODIFICANDO_A_LA_VEZ; k++) pedir(k);
                    const dec = await pendientes.get(i);
                    pendientes.delete(i);
                    if (turno !== R.turno) { dec.soltar(); throw new Error('cancelado'); }
                    const f = info.fotogramas[i];
                    if (i > 0 && info.fotogramas[i - 1].borrar) {
                        const r = rect[i - 1];
                        ctx.clearRect(r.x0, r.y0, r.w, r.h);
                    }
                    if (!f.mezclar) ctx.clearRect(rect[i].x0, rect[i].y0, rect[i].w, rect[i].h);
                    ctx.drawImage(dec.fuente, rect[i].x0, rect[i].y0, rect[i].w, rect[i].h);
                    dec.soltar();
                    const dur = f.dur > 10 ? f.dur : 100;   // como los navegadores: 0–10 ms cuentan como 100 ms
                    listos.push({ img: await instantaneaLienzo(lienzo), dur, inicio });
                    inicio += dur;
                    if (turno !== R.turno) throw new Error('cancelado');
                    mostrarCargaVisor(i + 1, n);
                }
            } catch (e) {
                pendientes.forEach(pr => pr.then(d => d.soltar(), () => {}));
                soltarFotogramas(listos);
                lienzo.width = 0; lienzo.height = 0;
                if (turno !== R.turno) return null;
                throw e;
            }
            lienzo.width = 0; lienzo.height = 0;
            return listos;
        }

        // --- Carga, liberación y bucle ---
        async function cargarEnReproductor(url, titulo) {
            soltarVisor();
            const R = reproductorVisor;
            const turno = R.turno;
            const img = document.getElementById('modal-main-img');
            const lienzo = document.getElementById('modal-player-canvas');
            const quieto = prefersReducedMotion();
            // Mientras se preparan los fotogramas se ve el sticker de siempre (con movimiento reducido, nada se mueve)
            img.src = url;
            img.alt = titulo;
            img.classList.remove('hidden');
            img.classList.toggle('invisible', quieto);
            lienzo.setAttribute('aria-label', titulo);
            activarControlesVisor(false);
            mostrarCargaVisor(0, 0);
            const aborto = typeof AbortController === 'function' ? new AbortController() : null;
            R.abortar = aborto;
            try {
                const resp = await fetch(url, aborto ? { signal: aborto.signal } : undefined);
                if (!resp.ok) throw new Error('HTTP ' + resp.status);
                const buffer = await resp.arrayBuffer();
                if (turno !== R.turno) return;
                const info = leerWebPAnimado(buffer);
                if (!info) throw new Error('El fichero no tiene fotogramas animados');
                const fotogramas = await componerFotogramas(info, ladoDeDecodificacion(info), turno);
                if (!fotogramas) return;
                if (turno !== R.turno) { soltarFotogramas(fotogramas); return; }

                R.fotogramas = fotogramas;
                R.total = fotogramas.reduce((t, f) => t + f.dur, 0);
                R.listo = true;
                R.abortar = null;
                R.acumulado = 0;
                R.sentido = R.marchaAtras ? -1 : 1;
                R.indice = R.marchaAtras ? fotogramas.length - 1 : 0;
                lienzo.width = fotogramas[0].img.width;
                lienzo.height = fotogramas[0].img.height;
                R.ctx = lienzo.getContext('2d');
                pintarFotogramaVisor();
                lienzo.classList.remove('hidden');
                img.classList.add('hidden');
                img.removeAttribute('src');   // deja de decodificar la animación nativa
                ocultarCargaVisor();
                activarControlesVisor(true);
                const barra = document.getElementById('visor-barra');
                if (barra) barra.max = String(fotogramas.length - 1);
                actualizarBarraVisor();
                if (quieto) pausarVisor(); else reproducirVisor();
            } catch (e) {
                if (turno !== R.turno) return;
                R.abortar = null;
                img.classList.remove('invisible');
                ocultarCargaVisor();
                ponerEtiquetaVisor('🦖 Aquí la animación va a su ritmo: este navegador no deja controlarla.');
            }
        }

        // Para la animación y suelta toda la memoria de fotogramas (al cerrar o al cambiar de cromo)
        function soltarVisor() {
            const R = reproductorVisor;
            R.turno++;
            if (R.abortar) {
                try { R.abortar.abort(); } catch (e) { /* ya terminada */ }
                R.abortar = null;
            }
            cancelAnimationFrame(R.raf);
            R.raf = 0;
            R.reproduciendo = false;
            R.listo = false;
            soltarFotogramas(R.fotogramas);
            R.fotogramas = [];
            R.total = 0;
            R.ctx = null;
            const lienzo = document.getElementById('modal-player-canvas');
            if (lienzo) {
                lienzo.width = 0;
                lienzo.height = 0;
                lienzo.classList.add('hidden');
            }
            const modal = document.getElementById('magic-modal');
            if (modal && !modal.open) {
                const img = document.getElementById('modal-main-img');
                if (img) img.removeAttribute('src');
            }
        }

        function pintarFotogramaVisor() {
            const R = reproductorVisor;
            const f = R.fotogramas[R.indice];
            if (!R.ctx || !f) return;
            R.ctx.clearRect(0, 0, R.ctx.canvas.width, R.ctx.canvas.height);
            R.ctx.drawImage(f.img, 0, 0);
        }

        function avanzarVisor() {
            const R = reproductorVisor;
            const n = R.fotogramas.length;
            if (n < 2) return;
            let sig = R.indice + R.sentido;
            if (sig < 0 || sig >= n) {
                if (R.bumeran) {
                    R.sentido = -R.sentido;
                    sig = R.indice + R.sentido;
                } else {
                    sig = (sig + n) % n;
                }
            }
            R.indice = sig;
        }

        function bucleVisor(ahora) {
            const R = reproductorVisor;
            if (!R.reproduciendo || !R.listo) return;
            const dt = Math.min(250, Math.max(0, ahora - R.ultimo));   // al volver de otra pestaña no da saltos
            R.ultimo = ahora;
            R.acumulado += dt * R.velocidad;
            let cambia = false;
            let vueltas = 0;
            while (R.acumulado >= R.fotogramas[R.indice].dur && vueltas++ < 200) {
                R.acumulado -= R.fotogramas[R.indice].dur;
                avanzarVisor();
                cambia = true;
            }
            if (cambia) {
                pintarFotogramaVisor();
                actualizarBarraVisor();
            }
            R.raf = requestAnimationFrame(bucleVisor);
        }

        function reproducirVisor() {
            const R = reproductorVisor;
            if (!R.listo) return;
            R.reproduciendo = true;
            R.ultimo = performance.now();
            cancelAnimationFrame(R.raf);
            R.raf = requestAnimationFrame(bucleVisor);
            actualizarEstadoVisor();
        }

        function pausarVisor() {
            const R = reproductorVisor;
            R.reproduciendo = false;
            cancelAnimationFrame(R.raf);
            R.raf = 0;
            actualizarEstadoVisor();
        }

        function alternarPausaVisor() {
            if (!reproductorVisor.listo) return;
            playSound('pop');
            if (reproductorVisor.reproduciendo) pausarVisor(); else reproducirVisor();
        }

        // ◀▮ / ▮▶: un fotograma atrás o adelante (y se queda en pausa para mirarlo con calma)
        function pasoFotogramaVisor(paso) {
            const R = reproductorVisor;
            const n = R.fotogramas.length;
            if (!R.listo || !n) return;
            playSound('pop');
            pausarVisor();
            R.indice = ((R.indice + paso) % n + n) % n;
            R.acumulado = 0;
            pintarFotogramaVisor();
            actualizarBarraVisor();
        }

        function buscarFotogramaVisor(valor) {
            const R = reproductorVisor;
            if (!R.listo) return;
            if (R.reproduciendo) pausarVisor();
            R.indice = Math.max(0, Math.min(R.fotogramas.length - 1, parseInt(valor, 10) || 0));
            R.acumulado = 0;
            pintarFotogramaVisor();
            actualizarBarraVisor();
        }

        function ponerVelocidadVisor(velocidad) {
            const R = reproductorVisor;
            if (VISOR_VELOCIDADES.indexOf(velocidad) < 0) return;
            playSound('duang');
            R.velocidad = velocidad;
            actualizarEstadoVisor();
        }

        function alternarMarchaAtrasVisor() {
            const R = reproductorVisor;
            playSound('pop');
            R.marchaAtras = !R.marchaAtras;
            R.sentido = R.bumeran ? -R.sentido : (R.marchaAtras ? -1 : 1);
            actualizarEstadoVisor();
        }

        function alternarBumeranVisor() {
            const R = reproductorVisor;
            playSound('pop');
            R.bumeran = !R.bumeran;
            if (!R.bumeran) R.sentido = R.marchaAtras ? -1 : 1;
            actualizarEstadoVisor();
        }

        function reiniciarAjustesVisor() {
            const R = reproductorVisor;
            R.velocidad = 1;
            R.marchaAtras = false;
            R.bumeran = false;
            R.sentido = 1;
            actualizarEstadoVisor();
        }

        // --- Interfaz del reproductor ---
        function formatoSegundos(ms) {
            return (ms / 1000).toFixed(1).replace('.', ',');
        }

        function actualizarBarraVisor() {
            const R = reproductorVisor;
            const barra = document.getElementById('visor-barra');
            const tiempo = document.getElementById('visor-tiempo');
            const f = R.fotogramas[R.indice];
            if (!f) return;
            const n = R.fotogramas.length;
            if (barra) {
                barra.value = String(R.indice);
                barra.setAttribute('aria-valuetext', `Fotograma ${R.indice + 1} de ${n} (${formatoSegundos(f.inicio)} de ${formatoSegundos(R.total)} segundos)`);
            }
            if (tiempo) tiempo.textContent = `${formatoSegundos(f.inicio)}/${formatoSegundos(R.total)} s`;
        }

        const VISOR_TEXTO_VELOCIDAD = {
            0.25: '🐌 ×0,25: supercámara lenta.',
            0.5: '🐢 ×0,5: cámara lenta para ver cada detalle.',
            1: '🦖 ×1: el ritmo original del sticker.',
            1.5: '🐇 ×1,5: un poquito más deprisa.',
            2: '🚀 ×2: ¡el doble de rápido!',
            3: '⚡ ×3: ¡modo hiperactivo!'
        };

        function ponerEtiquetaVisor(texto) {
            const label = document.getElementById('modal-speed-label');
            if (label) label.textContent = texto;
        }

        function actualizarEstadoVisor() {
            const R = reproductorVisor;
            document.querySelectorAll('#modal-speed-buttons [data-velocidad]').forEach(b => {
                b.setAttribute('aria-pressed', parseFloat(b.dataset.velocidad) === R.velocidad ? 'true' : 'false');
            });
            const reves = document.getElementById('visor-btn-reves');
            const bumeran = document.getElementById('visor-btn-bumeran');
            if (reves) reves.setAttribute('aria-pressed', R.marchaAtras ? 'true' : 'false');
            if (bumeran) bumeran.setAttribute('aria-pressed', R.bumeran ? 'true' : 'false');
            const play = document.getElementById('visor-btn-play');
            if (play) {
                play.setAttribute('aria-label', R.reproduciendo ? 'Pausar' : 'Reproducir');
                play.title = R.reproduciendo ? 'Pausar (tecla K)' : 'Reproducir (tecla K)';
                const icono = play.querySelector('i');
                if (icono) icono.className = R.reproduciendo ? 'fa-solid fa-pause' : 'fa-solid fa-play';
            }
            if (!R.listo) return;
            const extras = [R.marchaAtras ? 'al revés' : '', R.bumeran ? 'en bumerán' : ''].filter(Boolean).join(' y ');
            let texto = VISOR_TEXTO_VELOCIDAD[R.velocidad] || '';
            if (extras) texto += ` Ahora va ${extras}.`;
            if (!R.reproduciendo) texto = `⏸ En pausa (${String(R.velocidad).replace('.', ',')}×): pulsa ▶ o toca el dibujo para seguir.`;
            ponerEtiquetaVisor(texto);
        }

        function activarControlesVisor(activos) {
            document.querySelectorAll('#visor-controles button, #visor-controles input').forEach(el => { el.disabled = !activos; });
            if (!activos) {
                const barra = document.getElementById('visor-barra');
                const tiempo = document.getElementById('visor-tiempo');
                if (barra) { barra.max = '0'; barra.value = '0'; }
                if (tiempo) tiempo.textContent = '…';
            }
            actualizarEstadoVisor();
        }

        function mostrarCargaVisor(hechos, total) {
            const caja = document.getElementById('modal-player-loading');
            if (!caja) return;
            caja.classList.remove('hidden');
            caja.textContent = total ? `✨ Preparando fotogramas… ${Math.round(100 * hechos / total)} %` : '✨ Preparando fotogramas…';
            if (!hechos) ponerEtiquetaVisor('✨ Preparando los fotogramas para controlar la velocidad…');
        }

        function ocultarCargaVisor() {
            const caja = document.getElementById('modal-player-loading');
            if (caja) caja.classList.add('hidden');
        }

        // Una sola vez: tocar el dibujo pausa o sigue, y el diálogo libera la memoria al cerrarse por cualquier vía
        function prepararEventosVisor(modal) {
            if (modal.dataset.visorListo) return;
            modal.dataset.visorListo = '1';
            modal.addEventListener('close', () => soltarVisor());
            const capa = document.getElementById('modal-stickers-layer');
            if (capa) capa.addEventListener('click', e => { if (e.target === capa) alternarPausaVisor(); });
        }

        // Atajos del reproductor: K o espacio (fuera de botones y campos), «,» y «.» fotograma a fotograma
        function teclaVisor(e) {
            const modal = document.getElementById('magic-modal');
            if (!modal || !modal.open || e.ctrlKey || e.metaKey || e.altKey) return false;
            const enControl = e.target && e.target.closest && e.target.closest('button, a, input, select, textarea');
            if (e.key === 'k' || e.key === 'K' || (e.key === ' ' && !enControl)) {
                e.preventDefault();
                alternarPausaVisor();
                return true;
            }
            if (e.key === ',' || e.key === '.') {
                e.preventDefault();
                pasoFotogramaVisor(e.key === ',' ? -1 : 1);
                return true;
            }
            return false;
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
                badge.className = 'absolute font-display font-bold text-xl sm:text-2xl text-[#C2410C] pointer-events-none transition-all duration-700 select-none drop-shadow-md z-30';
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
            abrirDialogo(modal);
        }

