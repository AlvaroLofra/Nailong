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
            ocultarResultadoCreador();
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
        const VISOR_DECODIFICANDO_A_LA_VEZ = 8;

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
            ctx: null,
            info: null,          // fotogramas del fichero (para «Crea tu sticker», VM3)
            desde: 0,            // tramo elegido en «Crea tu sticker»
            hasta: 0
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

        /* Recorre los fotogramas 0…ultimo en orden y los compone en un lienzo de `lado` px respetando
           desplazamiento, fusión y borrado; llama a cadaUno(i, lienzo) con cada uno ya compuesto.
           Lo usan el reproductor (a tamaño de pantalla) y «Crea tu sticker» (a 512 px). */
        async function recorrerComposicion(info, lado, ultimo, sigue, cadaUno) {
            const escala = lado / Math.max(info.ancho, info.alto);
            const lienzo = document.createElement('canvas');
            lienzo.width = Math.max(1, Math.round(info.ancho * escala));
            lienzo.height = Math.max(1, Math.round(info.alto * escala));
            const ctx = lienzo.getContext('2d');
            const rect = info.fotogramas.map(f => {
                const x0 = Math.round(f.x * escala), y0 = Math.round(f.y * escala);
                return { x0, y0, w: Math.max(1, Math.round((f.x + f.w) * escala) - x0), h: Math.max(1, Math.round((f.y + f.h) * escala) - y0) };
            });
            // Se decodifican unos pocos por delante mientras se compone en orden
            const pendientes = new Map();
            const pedir = i => {
                if (i > ultimo || pendientes.has(i)) return;
                const pr = decodificarFotograma(info.fotogramas[i].archivo, rect[i].w, rect[i].h);
                pr.catch(() => {});   // el error se recoge al esperarlo, no como rechazo suelto
                pendientes.set(i, pr);
            };
            try {
                for (let i = 0; i <= ultimo; i++) {
                    for (let k = i; k < i + VISOR_DECODIFICANDO_A_LA_VEZ; k++) pedir(k);
                    const dec = await pendientes.get(i);
                    pendientes.delete(i);
                    if (!sigue()) { dec.soltar(); throw new Error('cancelado'); }
                    const f = info.fotogramas[i];
                    if (i > 0 && info.fotogramas[i - 1].borrar) {
                        const r = rect[i - 1];
                        ctx.clearRect(r.x0, r.y0, r.w, r.h);
                    }
                    if (!f.mezclar) ctx.clearRect(rect[i].x0, rect[i].y0, rect[i].w, rect[i].h);
                    ctx.drawImage(dec.fuente, rect[i].x0, rect[i].y0, rect[i].w, rect[i].h);
                    dec.soltar();
                    await cadaUno(i, lienzo);
                    if (!sigue()) throw new Error('cancelado');
                }
            } finally {
                pendientes.forEach(pr => pr.then(d => d.soltar(), () => {}));
                lienzo.width = 0;
                lienzo.height = 0;
            }
        }

        async function componerFotogramas(info, lado, turno) {
            const R = reproductorVisor;
            const n = info.fotogramas.length;
            const listos = [];
            let inicio = 0;
            try {
                await recorrerComposicion(info, lado, n - 1, () => turno === R.turno, async (i, lienzo) => {
                    const f = info.fotogramas[i];
                    const dur = f.dur > 10 ? f.dur : 100;   // como los navegadores: 0–10 ms cuentan como 100 ms
                    listos.push({ img: await instantaneaLienzo(lienzo), dur, inicio });
                    inicio += dur;
                    if (turno === R.turno) mostrarCargaVisor(i + 1, n);
                });
            } catch (e) {
                soltarFotogramas(listos);
                if (turno !== R.turno) return null;
                throw e;
            }
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
                R.info = info;
                R.desde = 0;
                R.hasta = fotogramas.length - 1;
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
                actualizarTramoCreador();
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
            R.info = null;
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
            if (creadorVisor.activo) dibujarTextoMeme(R.ctx, R.ctx.canvas.width, R.ctx.canvas.height);
        }

        // Siguiente fotograma dentro del tramo (todo el sticker, o el elegido en «Crea tu sticker»)
        function avanzarVisor() {
            const R = reproductorVisor;
            const [a, b] = limitesVisor();
            if (b <= a) { R.indice = a; return; }
            if (R.indice < a || R.indice > b) { R.indice = R.sentido > 0 ? a : b; return; }
            let sig = R.indice + R.sentido;
            if (sig < a || sig > b) {
                if (R.bumeran) {
                    R.sentido = -R.sentido;
                    sig = R.indice + R.sentido;
                } else {
                    sig = R.sentido > 0 ? a : b;
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
            if (creadorVisor.activo) actualizarTramoCreador();
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
            modal.addEventListener('close', () => { soltarVisor(); ocultarResultadoCreador(); });
            const capa = document.getElementById('modal-stickers-layer');
            if (capa) capa.addEventListener('click', e => { if (e.target === capa) alternarPausaVisor(); });
        }

        // Atajos del reproductor: K o espacio (fuera de botones y campos), «,» y «.» fotograma a fotograma
        function teclaVisor(e) {
            const modal = document.getElementById('magic-modal');
            if (!modal || !modal.open || e.ctrlKey || e.metaKey || e.altKey) return false;
            if (e.target && e.target.closest && e.target.closest('input, textarea, select')) return false;   // escribiendo
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

        /* ==============================================================
           6C. «CREA TU STICKER» (VM3)
           Tramo, texto tipo meme, emojis del escenario, velocidad, al revés y bumerán →
           WebP animado de 512×512 con el EXIF de WhatsApp, de 500 KB como máximo, 10 s como
           máximo y fotogramas de 20 ms como mínimo (las mismas reglas que normalizar_stickers.py).
           Cada fotograma se codifica con canvas.toBlob('image/webp') y aquí se montan todos en un
           WebP animado (VP8X + ANIM + ANMF + EXIF). Si pesa demasiado, se baja la calidad o se
           quitan fotogramas y se vuelve a intentar. Safari no sabe crear WebP: allí sale una
           imagen fija (PNG) del fotograma que se ve.
        ============================================================== */
        const CREADOR_TAM = 512;
        const CREADOR_MAX_BYTES = 500 * 1024;
        const CREADOR_MAX_MS = 10000;
        const CREADOR_MIN_MS = 20;
        const CREADOR_FOTOGRAMAS_OBJETIVO = 80;   // como los stickers más largos del álbum
        const creadorVisor = { activo: false, texto: '', posicion: 'abajo', urlResultado: null, nombre: '', ocupado: false };

        function limitesVisor() {
            const R = reproductorVisor;
            const n = R.fotogramas.length;
            if (!creadorVisor.activo || !n) return [0, Math.max(0, n - 1)];
            return [Math.min(R.desde, n - 1), Math.min(R.hasta, n - 1)];
        }

        // --- Panel ---
        function alternarCreadorVisor(abierto) {
            creadorVisor.activo = Boolean(abierto);
            actualizarTramoCreador();
            pintarFotogramaVisor();
            if (abierto) playSound('pop');
        }

        function ponerTextoCreador(texto) {
            creadorVisor.texto = String(texto || '').slice(0, 28);
            pintarFotogramaVisor();
        }

        function ponerPosicionCreador(posicion) {
            playSound('pop');
            creadorVisor.posicion = posicion === 'arriba' ? 'arriba' : 'abajo';
            document.querySelectorAll('#visor-creador [data-posicion]').forEach(b => {
                b.setAttribute('aria-pressed', b.dataset.posicion === creadorVisor.posicion ? 'true' : 'false');
            });
            pintarFotogramaVisor();
        }

        // «Empieza aquí» / «Acaba aquí» / «Todo»: el tramo se marca con el fotograma que se está viendo
        function marcarTramoCreador(extremo) {
            const R = reproductorVisor;
            const n = R.fotogramas.length;
            if (!R.listo || !n) return;
            playSound('pop');
            if (extremo === 'inicio') {
                R.desde = R.indice;
                if (R.hasta < R.desde) R.hasta = n - 1;
            } else if (extremo === 'fin') {
                R.hasta = R.indice;
                if (R.desde > R.hasta) R.desde = 0;
            } else {
                R.desde = 0;
                R.hasta = n - 1;
            }
            actualizarTramoCreador();
        }

        function actualizarTramoCreador() {
            const R = reproductorVisor;
            const etiqueta = document.getElementById('creador-tramo');
            const barra = document.getElementById('visor-barra');
            const n = R.fotogramas.length;
            if (!R.listo || !n) {
                if (etiqueta) etiqueta.textContent = '…';
                if (barra) barra.style.background = '';
                return;
            }
            const fin = R.fotogramas[R.hasta];
            const plan = ajustarSecuencia(secuenciaCreador(), 1);
            if (etiqueta) {
                etiqueta.textContent = `${formatoSegundos(R.fotogramas[R.desde].inicio)}–${formatoSegundos(fin.inicio + fin.dur)} s del original · tu sticker durará ${formatoSegundos(plan.total)} s` +
                    (plan.recortado ? ' (máximo de WhatsApp: se corta a 10 s)' : '');
            }
            if (barra) {
                if (creadorVisor.activo && n > 1) {
                    // El tramo se pinta en la barra (el centro del tirador va de 14 px a 100 % − 14 px)
                    const pos = i => `calc(14px + (100% - 28px) * ${(i / (n - 1)).toFixed(4)})`;
                    barra.style.background = `linear-gradient(to right, #FFF3B0 ${pos(R.desde)}, #FFBF69 ${pos(R.desde)}, #FFBF69 ${pos(R.hasta)}, #FFF3B0 ${pos(R.hasta)})`;
                } else {
                    barra.style.background = '';
                }
            }
        }

        function ponerEstadoCreador(texto) {
            const el = document.getElementById('creador-estado');
            if (el) el.textContent = texto;
        }

        function ocultarResultadoCreador() {
            const caja = document.getElementById('creador-resultado');
            const vista = document.getElementById('creador-vista');
            if (caja) caja.classList.add('hidden');
            if (vista) vista.removeAttribute('src');
            if (creadorVisor.urlResultado) URL.revokeObjectURL(creadorVisor.urlResultado);
            creadorVisor.urlResultado = null;
            if (!creadorVisor.ocupado) ponerEstadoCreador('');
        }

        function mostrarResultadoCreador(res, s) {
            ocultarResultadoCreador();
            creadorVisor.urlResultado = URL.createObjectURL(res.blob);
            creadorVisor.nombre = `nailong_mi_sticker_${s.id}.${res.animado ? 'webp' : 'png'}`;
            const kb = Math.round(res.blob.size / 1024);
            document.getElementById('creador-vista').src = creadorVisor.urlResultado;
            let texto;
            if (res.animado) {
                texto = `✅ ¡Listo! ${kb} KB · ${formatoSegundos(res.total)} s · ${res.fotogramas} fotogramas`;
                if (res.recortado) texto += ' · cortado a 10 s';
                if (res.blob.size > CREADOR_MAX_BYTES) texto += ' · ⚠️ pasa de 500 KB y WhatsApp puede rechazarlo: acorta el tramo';
            } else {
                texto = `🖼️ Imagen fija (${kb} KB): este navegador no sabe crear stickers animados.`;
            }
            document.getElementById('creador-info').textContent = texto;
            document.getElementById('creador-resultado').classList.remove('hidden');
            ponerEstadoCreador('');
        }

        function compartirStickerCreado() {
            if (!creadorVisor.urlResultado) return;
            openStickerOptionsModal(creadorVisor.urlResultado, creadorVisor.nombre, 'Mi sticker de Nailong');
        }

        // --- Dibujo del texto y de los emojis ---
        function dibujarTextoMeme(ctx, ancho, alto) {
            const texto = creadorVisor.texto.trim().toUpperCase();
            if (!texto) return;
            const fuente = t => `700 ${t}px Fredoka, Fredoka-Fallback, sans-serif`;
            let tam = Math.round(alto * 0.12);
            ctx.save();
            ctx.font = fuente(tam);
            const maxAncho = ancho * 0.92;
            const medida = ctx.measureText(texto).width;
            if (medida > maxAncho) {
                tam = Math.max(Math.round(alto * 0.05), Math.floor(tam * maxAncho / medida));
                ctx.font = fuente(tam);
            }
            const arriba = creadorVisor.posicion === 'arriba';
            ctx.textAlign = 'center';
            ctx.textBaseline = arriba ? 'top' : 'bottom';
            ctx.lineJoin = 'round';
            ctx.lineWidth = Math.max(2, tam * 0.2);
            ctx.strokeStyle = '#2B1700';
            ctx.fillStyle = '#FFFFFF';
            const y = arriba ? alto * 0.04 : alto * 0.965;
            ctx.strokeText(texto, ancho / 2, y);
            ctx.fillText(texto, ancho / 2, y);
            ctx.restore();
        }

        // Emojis arrastrados sobre el dibujo, en proporción (0–1) a la imagen que se ve en el lienzo
        function emojisDelEscenario() {
            const lienzo = document.getElementById('modal-player-canvas');
            const capa = document.getElementById('modal-stickers-layer');
            if (!lienzo || !capa || lienzo.classList.contains('hidden')) return [];
            const r = lienzo.getBoundingClientRect();
            const lado = Math.min(r.width, r.height);
            if (!lado) return [];
            const x0 = r.left + (r.width - lado) / 2;
            const y0 = r.top + (r.height - lado) / 2;
            return [...capa.children].map(el => {
                const e = el.getBoundingClientRect();
                const giro = /rotate\(([-\d.]+)deg\)/.exec(el.style.transform || '');
                return {
                    emoji: el.textContent,
                    x: (e.left + e.width / 2 - x0) / lado,
                    y: (e.top + e.height / 2 - y0) / lado,
                    tam: parseFloat(getComputedStyle(el).fontSize) / lado,
                    giro: giro ? parseFloat(giro[1]) * Math.PI / 180 : 0
                };
            }).filter(e => e.emoji && e.x > -0.2 && e.x < 1.2 && e.y > -0.2 && e.y < 1.2);
        }

        function dibujarEmojis(ctx, lado, emojis) {
            emojis.forEach(e => {
                ctx.save();
                ctx.translate(e.x * lado, e.y * lado);
                ctx.rotate(e.giro);
                ctx.font = `${Math.round(e.tam * lado)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(e.emoji, 0, 0);
                ctx.restore();
            });
        }

        function pintarSalidaCreador(salida, compuesto, emojis) {
            const ctx = salida.getContext('2d');
            ctx.clearRect(0, 0, CREADOR_TAM, CREADOR_TAM);
            ctx.drawImage(compuesto, Math.round((CREADOR_TAM - compuesto.width) / 2), Math.round((CREADOR_TAM - compuesto.height) / 2));
            dibujarTextoMeme(ctx, CREADOR_TAM, CREADOR_TAM);
            dibujarEmojis(ctx, CREADOR_TAM, emojis);
            // Esquinas transparentes (como los PNG copiados, test 41): así el navegador guarda siempre el canal
            // alfa (ALPH) en cada fotograma, que WhatsApp exige en los animados aunque el sticker sea opaco
            const e = 2, l = CREADOR_TAM - e;
            ctx.clearRect(0, 0, e, e);
            ctx.clearRect(l, 0, e, e);
            ctx.clearRect(0, l, e, e);
            ctx.clearRect(l, l, e, e);
        }

        // --- Orden y duración de los fotogramas ---
        function secuenciaCreador() {
            const R = reproductorVisor;
            const [a, b] = limitesVisor();
            let orden = [];
            for (let i = a; i <= b; i++) orden.push(i);
            if (R.marchaAtras) orden.reverse();
            if (R.bumeran && orden.length > 2) orden = orden.concat(orden.slice(1, -1).reverse());
            return orden.map(i => ({ i, dur: R.fotogramas[i].dur / R.velocidad }));
        }

        /* Se queda con 1 de cada `paso` fotogramas (puede ser fraccionario: 1,25 quita 1 de cada 5, repartidos)
           sumando su tiempo, funde los de menos de 20 ms y corta a 10 s */
        function ajustarSecuencia(secuencia, paso) {
            const saltada = [];
            for (let pos = 0; Math.floor(pos) < secuencia.length; pos += paso) {
                const k = Math.floor(pos);
                const fin = Math.max(k + 1, Math.min(secuencia.length, Math.floor(pos + paso)));
                let dur = 0;
                for (let j = k; j < fin; j++) dur += secuencia[j].dur;
                saltada.push({ i: secuencia[k].i, dur });
            }
            const fundida = [];
            let actual = null;
            saltada.forEach(f => {
                if (actual && actual.dur < CREADOR_MIN_MS) { actual.dur += f.dur; return; }
                actual = { i: f.i, dur: f.dur };
                fundida.push(actual);
            });
            const fotogramas = [];
            let total = 0;
            for (const f of fundida) {
                const dur = Math.max(CREADOR_MIN_MS, Math.round(f.dur));
                if (total + dur > CREADOR_MAX_MS) break;
                fotogramas.push({ i: f.i, dur });
                total += dur;
            }
            return { fotogramas, total, recortado: fotogramas.length < fundida.length };
        }

        // --- Codificación y montaje del WebP animado ---
        function lienzoABlob(lienzo, tipo, calidad) {
            return new Promise(ok => {
                try { lienzo.toBlob(b => ok(b), tipo, calidad); } catch (e) { ok(null); }
            });
        }

        function sabeCrearWebP() {
            try {
                const c = document.createElement('canvas');
                c.width = 1;
                c.height = 1;
                return c.toDataURL('image/webp').indexOf('data:image/webp') === 0;
            } catch (e) {
                return false;
            }
        }

        function trozoRiff(tipo, datos) {
            const pad = datos.length & 1;
            const out = new Uint8Array(8 + datos.length + pad);
            for (let k = 0; k < 4; k++) out[k] = tipo.charCodeAt(k);
            new DataView(out.buffer).setUint32(4, datos.length, true);
            out.set(datos, 8);
            return out;
        }

        function unirBytes(partes) {
            const out = new Uint8Array(partes.reduce((t, p) => t + p.length, 0));
            let p = 0;
            partes.forEach(x => { out.set(x, p); p += x.length; });
            return out;
        }

        function bytes24(v) {
            return [v & 255, (v >> 8) & 255, (v >> 16) & 255];
        }

        // Datos de imagen (ALPH + VP8, o VP8L) de un WebP fijo hecho por el navegador
        function imagenDeWebPFijo(bytes) {
            const partes = [];
            let p = 12;
            while (p + 8 <= bytes.length) {
                const tipo = String.fromCharCode(bytes[p], bytes[p + 1], bytes[p + 2], bytes[p + 3]);
                const tam = (bytes[p + 4] | (bytes[p + 5] << 8) | (bytes[p + 6] << 16) | (bytes[p + 7] << 24)) >>> 0;
                if (tipo === 'ALPH' || tipo === 'VP8 ' || tipo === 'VP8L') partes.push(trozoRiff(tipo, bytes.subarray(p + 8, p + 8 + tam)));
                p += 8 + tam + (tam & 1);
            }
            if (!partes.length) throw new Error('El navegador no ha creado un WebP válido');
            return unirBytes(partes);
        }

        // EXIF de WhatsApp: TIFF con la etiqueta 0x5741 y el JSON del pack (mismo formato que el sticker 3D)
        function exifWhatsAppCreador() {
            const json = JSON.stringify({
                'sticker-pack-id': 'nailong.visor.web',
                'sticker-pack-name': 'Mis stickers de Nailong',
                'sticker-pack-publisher': 'El Mundo Mágico de Nailong'
            }).replace(/\//g, '\\/');
            const datos = new TextEncoder().encode(json);
            const n = datos.length;
            const exif = new Uint8Array(26 + n);
            exif.set([
                0x4D, 0x4D, 0x00, 0x2A, 0x00, 0x00, 0x00, 0x08,
                0x00, 0x01, 0x57, 0x41, 0x00, 0x07,
                (n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255,
                0x00, 0x00, 0x00, 0x1A, 0x00, 0x00, 0x00, 0x00
            ], 0);
            exif.set(datos, 26);
            return exif;
        }

        function montarWebPAnimado(fotogramas, codificados) {
            const m1 = CREADOR_TAM - 1;
            const vp8x = trozoRiff('VP8X', new Uint8Array([0x02 | 0x08 | 0x10, 0, 0, 0, ...bytes24(m1), ...bytes24(m1)]));  // animado + EXIF + alfa
            const anim = trozoRiff('ANIM', new Uint8Array([0, 0, 0, 0, 0, 0]));   // fondo transparente y bucle infinito
            const anmf = fotogramas.map(f => trozoRiff('ANMF', unirBytes([
                new Uint8Array([0, 0, 0, 0, 0, 0, ...bytes24(m1), ...bytes24(m1), ...bytes24(f.dur), 0x02]),   // lienzo entero, sin fundir ni borrar
                codificados.get(f.i)[0]
            ])));
            const cuerpo = unirBytes([vp8x, anim, ...anmf, trozoRiff('EXIF', exifWhatsAppCreador())]);
            const cab = new Uint8Array(12);
            cab.set([0x52, 0x49, 0x46, 0x46], 0);
            new DataView(cab.buffer).setUint32(4, 4 + cuerpo.length, true);
            cab.set([0x57, 0x45, 0x42, 0x50], 8);
            return unirBytes([cab, cuerpo]);
        }

        // Codifica los fotogramas `indices` (compuestos a 512 px con texto y emojis) a cada una de las `calidades`
        async function codificarFotogramasCreador(indices, calidades, emojis, sigue, alAvanzar) {
            const R = reproductorVisor;
            const necesarios = new Set(indices);
            const ultimo = Math.max(...indices);
            const salida = document.createElement('canvas');
            salida.width = CREADOR_TAM;
            salida.height = CREADOR_TAM;
            const codificados = new Map();
            try {
                await recorrerComposicion(R.info, CREADOR_TAM, ultimo, sigue, async (i, compuesto) => {
                    if (necesarios.has(i)) {
                        pintarSalidaCreador(salida, compuesto, emojis);
                        const versiones = [];
                        for (const calidad of calidades) {
                            const blob = await lienzoABlob(salida, 'image/webp', calidad);
                            if (!blob || blob.type !== 'image/webp') throw new Error('Sin WebP');
                            versiones.push(imagenDeWebPFijo(new Uint8Array(await blob.arrayBuffer())));
                        }
                        codificados.set(i, versiones);
                    }
                    alAvanzar(i + 1, ultimo + 1);
                });
            } finally {
                salida.width = 0;
                salida.height = 0;
            }
            return codificados;
        }

        /* Elige calidad y fotogramas antes de la pasada completa: codifica una muestra de 12 fotogramas a
           calidad 0,72 y 0,42 y estima el peso (crece con la calidad de forma aproximadamente exponencial). */
        async function estimarAjusteCreador(plan, paso, emojis, sigue) {
            const indices = [...new Set(plan.fotogramas.map(f => f.i))].sort((a, b) => a - b);
            if (indices.length <= 16) return { calidad: 0.72, paso };
            const muestra = [];
            for (let k = 0; k < 12; k++) muestra.push(indices[Math.floor(k * (indices.length - 1) / 11)]);
            const medidas = await codificarFotogramasCreador([...new Set(muestra)], [0.72, 0.42], emojis, sigue,
                (hechos, total) => ponerEstadoCreador(`✨ Calculando el peso… ${Math.round(100 * hechos / total)} %`));
            let s72 = 0, s42 = 0;
            muestra.forEach(i => { s72 += medidas.get(i)[0].length; s42 += medidas.get(i)[1].length; });
            s72 = s72 / muestra.length * plan.fotogramas.length;
            s42 = s42 / muestra.length * plan.fotogramas.length;
            const objetivo = CREADOR_MAX_BYTES * 0.9;
            if (s72 <= objetivo) return { calidad: 0.72, paso };
            // Modelo: log(peso) lineal con la calidad. Se baja la calidad hasta 0,35 antes de quitar fotogramas
            const pendiente = Math.log(s72 / s42) / 0.3;
            if (!(pendiente > 0)) return s42 <= objetivo ? { calidad: 0.42, paso } : { calidad: 0.42, paso: paso * s42 / objetivo };
            const calidad = 0.42 + Math.log(objetivo / s42) / pendiente;
            if (calidad >= 0.35) return { calidad: Math.min(0.72, calidad), paso };
            const s35 = s42 * Math.exp(pendiente * (0.35 - 0.42));
            return { calidad: 0.35, paso: paso * s35 / objetivo };
        }

        // Corta la secuencia a 10 s antes de aligerarla (si no, se quitarían fotogramas que luego se tiran)
        function cortarSecuenciaA10s(secuencia) {
            const out = [];
            let total = 0;
            for (const f of secuencia) {
                const dur = Math.max(CREADOR_MIN_MS, f.dur);
                if (total + dur > CREADOR_MAX_MS) break;
                out.push(f);
                total += dur;
            }
            return { secuencia: out, recortado: out.length < secuencia.length };
        }

        async function crearWebPAnimadoCreador(emojis, sigue) {
            const corte = cortarSecuenciaA10s(secuenciaCreador());
            const secuencia = corte.secuencia;
            let paso = Math.max(1, secuencia.length / CREADOR_FOTOGRAMAS_OBJETIVO);
            const ajuste = await estimarAjusteCreador(ajustarSecuencia(secuencia, paso), paso, emojis, sigue);
            let calidad = ajuste.calidad;
            paso = ajuste.paso;
            let mejor = null;
            for (let intento = 1; intento <= 3; intento++) {
                const plan = ajustarSecuencia(secuencia, paso);
                const indices = [...new Set(plan.fotogramas.map(f => f.i))];
                const aviso = intento > 1 ? ` (ajustando el peso, intento ${intento})` : '';
                const codificados = await codificarFotogramasCreador(indices, [calidad], emojis, sigue,
                    (hechos, total) => ponerEstadoCreador(`✨ Creando tu sticker… ${Math.round(100 * hechos / total)} %${aviso}`));
                const bytes = montarWebPAnimado(plan.fotogramas, codificados);
                const res = { blob: new Blob([bytes], { type: 'image/webp' }), animado: true, fotogramas: plan.fotogramas.length, total: plan.total, recortado: corte.recortado || plan.recortado };
                if (!mejor || res.blob.size < mejor.blob.size) mejor = res;
                if (bytes.length <= CREADOR_MAX_BYTES) return res;
                // La estimación se quedó corta: menos calidad (hasta 0,3) o, si ya no se puede, menos fotogramas
                const proporcion = CREADOR_MAX_BYTES / bytes.length;
                if (proporcion >= 0.8 && calidad > 0.35) calidad = Math.max(0.3, calidad - 0.12);
                else paso = paso / Math.max(0.34, proporcion * 0.95);
            }
            return mejor;
        }

        // Safari: imagen fija (PNG) del fotograma que se ve, con el texto y los emojis
        async function crearImagenFijaCreador(emojis, sigue) {
            const R = reproductorVisor;
            const objetivo = R.indice;
            const salida = document.createElement('canvas');
            salida.width = CREADOR_TAM;
            salida.height = CREADOR_TAM;
            let blob = null;
            try {
                await recorrerComposicion(R.info, CREADOR_TAM, objetivo, sigue, async (i, compuesto) => {
                    if (i !== objetivo) return;
                    pintarSalidaCreador(salida, compuesto, emojis);
                    blob = await lienzoABlob(salida, 'image/png');
                });
            } finally {
                salida.width = 0;
                salida.height = 0;
            }
            if (!blob) throw new Error('Sin PNG');
            return { blob, animado: false };
        }

        async function crearStickerVisor() {
            const R = reproductorVisor;
            if (!R.listo || !R.info || creadorVisor.ocupado) return;
            const s = stickerActualVisor();
            const turno = R.turno;
            const boton = document.getElementById('creador-crear');
            const estabaReproduciendo = R.reproduciendo;
            creadorVisor.ocupado = true;
            if (boton) boton.disabled = true;
            playSound('pop');
            pausarVisor();
            ocultarResultadoCreador();
            ponerEstadoCreador('✨ Creando tu sticker…');
            const emojis = emojisDelEscenario();
            try {
                if (document.fonts && document.fonts.load) {
                    try { await document.fonts.load('700 48px Fredoka'); } catch (e) { /* se usa la fuente de reserva */ }
                }
                const sigue = () => turno === R.turno;
                const res = sabeCrearWebP() ? await crearWebPAnimadoCreador(emojis, sigue) : await crearImagenFijaCreador(emojis, sigue);
                if (turno !== R.turno || !res) return;
                mostrarResultadoCreador(res, s);
                playSound('fanfare');
            } catch (e) {
                if (turno === R.turno) ponerEstadoCreador('😿 No se ha podido crear el sticker. Prueba con un tramo más corto.');
            } finally {
                creadorVisor.ocupado = false;
                if (boton) boton.disabled = false;
                if (estabaReproduciendo && turno === R.turno) reproducirVisor();
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

