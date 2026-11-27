        /* ==============================================================
           8. BOTONERA DE SONIDOS (B1, web 4.3.0): 12 BOTONES, 12 SONIDOS DISTINTOS
           Cada botón apunta a su cromo por CLAVE (D-22) y muestra el título de ALL_STICKERS (js/02);
           el nombre corto describe el sonido, que vive en js/01 (SONIDOS_BOTONERA o playSound).
        ============================================================== */
        const SOUNDBOARD_GRUPOS = [
            { id: 'voces', titulo: '🗣️ Voces' },
            { id: 'risas', titulo: '😂 Risas y llantos' },
            { id: 'efectos', titulo: '✨ Efectos' }
        ];
        const SOUNDBOARD_TILES = [
            { clave: 'gritos-hierba', grupo: 'voces', sonido: 'grito', nombre: 'Grito', icono: '😱' },
            { clave: 'bostezo-arbol', grupo: 'voces', sonido: 'bostezo', nombre: 'Bostezo', icono: '🥱' },
            { clave: 'burla-nyah', grupo: 'voces', sonido: 'nyah', nombre: '¡Nyah, nyah!', icono: '😜' },
            { clave: 'siesta-ronquido', grupo: 'voces', sonido: 'ronquido', nombre: 'Ronquido', icono: '😴' },
            { clave: 'carcajada-movil', grupo: 'risas', sonido: 'carcajada', nombre: 'Carcajada', icono: '🤣' },
            { clave: 'risa-tranquila', grupo: 'risas', sonido: 'laugh', nombre: 'Risita', icono: '😊' },
            { clave: 'llanto-chorros', grupo: 'risas', sonido: 'llanto', nombre: '¡Buaaa!', icono: '😭' },
            { clave: 'ojos-aguados', grupo: 'risas', sonido: 'puchero', nombre: 'Puchero', icono: '🥺' },
            { clave: 'palmas-jardin', grupo: 'efectos', sonido: 'palmas', nombre: 'Palmas', icono: '👏' },
            { clave: 'patata-frita', grupo: 'efectos', sonido: 'crujido', nombre: 'Crujido', icono: '🥔' },
            { clave: 'fiesta-parque', grupo: 'efectos', sonido: 'fanfare', nombre: 'Fanfarria', icono: '🎺' },
            { clave: 'huida-bosque', grupo: 'efectos', sonido: 'run', nombre: 'Carrerita', icono: '🏃' }
        ];

        function renderSoundboard() {
            const grid = document.getElementById('soundboard-grid');
            grid.innerHTML = SOUNDBOARD_GRUPOS.map(g => {
                const botones = SOUNDBOARD_TILES.filter(tile => tile.grupo === g.id).map(tile => {
                    const s = stickerPorClave(tile.clave);
                    if (!s) return '';
                    const titulo = escaparHtml(s.title);
                    return `
                    <button type="button" onclick="playTileSound('${tile.sonido}', this)" aria-label="Sonido: ${tile.nombre}. ${titulo}" class="sound-tile clay-card !rounded-2xl sm:!rounded-3xl p-1.5 sm:p-4 flex sm:flex-col items-center gap-2 sm:gap-1.5 text-left sm:text-center bg-white/95 hover:bg-nailong-belly border-3 border-nailong-yellow transition-all group">
                        <div class="relative w-12 h-12 sm:w-24 sm:h-24 shrink-0 rounded-xl sm:rounded-2xl bg-nailong-pale p-1 sm:p-2 flex items-center justify-center overflow-hidden shadow-inner group-hover:scale-110 transition-transform">
                            <img src="Stickers Nailong/${s.file}" alt="" loading="lazy" decoding="async" class="w-full h-full object-contain">
                            <span class="sm:hidden absolute -bottom-0.5 -right-0.5 text-base leading-none" aria-hidden="true">${tile.icono}</span>
                        </div>
                        <div class="min-w-0">
                            <h4 class="font-display font-bold text-xs sm:text-base text-amber-950 leading-tight"><span class="hidden sm:inline" aria-hidden="true">${tile.icono} </span>${tile.nombre}</h4>
                            <p class="text-[10px] sm:text-xs font-semibold text-amber-800 leading-tight line-clamp-2">${titulo}</p>
                        </div>
                    </button>`;
                }).join('');
                return `
                <div class="space-y-2 sm:space-y-3" role="group" aria-label="${g.titulo.replace(/^\S+\s/, '')}">
                    <h3 class="font-display font-bold text-base sm:text-xl text-amber-950">${g.titulo}</h3>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">${botones}</div>
                </div>`;
            }).join('');
        }

        function playTileSound(soundType, btnEl) {
            playSound(soundType);
            btnEl.classList.remove('animate-duang');
            void btnEl.offsetWidth;
            btnEl.classList.add('animate-duang');
            btnEl.classList.add('is-playing');
            clearTimeout(btnEl._playingTimer);
            btnEl._playingTimer = setTimeout(() => btnEl.classList.remove('is-playing'), 800);
        }

        /* ==============================================================
           9. LABORATORIO DE SUPERPODERES CON NAILONG REAL
        ============================================================== */
        // Pestañas del laboratorio: solo se ve un grupo de controles a la vez (tamaño, color o disfraces)
        function mostrarPestanaLab(nombre) {
            playSound('pop');
            document.querySelectorAll('#poderes .lab-tab').forEach(tab => {
                const activa = tab.id === `lab-tab-${nombre}`;
                tab.setAttribute('aria-selected', activa ? 'true' : 'false');
            });
            document.querySelectorAll('#poderes .lab-panel').forEach(panel => {
                panel.classList.toggle('hidden', panel.id !== `lab-panel-${nombre}`);
            });
        }

        function updatePowerSize(val) {
            const fig = document.getElementById('lab-nailong-figure');
            const label = document.getElementById('power-size-label');
            const scale = val / 100;
            fig.style.transform = `scale(${scale})`;

            if (val < 75) label.textContent = `🐜 Dino Bebé (${val}%)`;
            else if (val > 125) label.textContent = `🏔️ ¡Dino Gigante! (${val}%)`;
            else label.textContent = `🦖 Normal (${val}%)`;
            playSound('duang');
        }

        function setLabColor(hueValue, colorName) {
            playSound('pop');
            const img = document.getElementById('lab-nailong-img');
            const badge = document.getElementById('lab-status-badge');
            badge.textContent = `✨ Color: ${colorName}`;

            img.classList.remove('gif-rainbow');
            if (hueValue === 'rainbow') {
                img.style.filter = '';
                img.classList.add('gif-rainbow');
            } else {
                img.style.filter = `hue-rotate(${hueValue})`;
            }
        }

        function inflateBelly() {
            playSound('duang');
            const img = document.getElementById('lab-nailong-img');
            img.style.transform = 'scale(1.35, 1.2)';
            setTimeout(() => {
                img.style.transform = 'scale(1, 1)';
                playSound('pop');
            }, 600);
        }

        // Lab Fire Breath Canvas Particle System
        let labFireParticles = [];
        let labFireAnimating = false;

        function shootLabFire() {
            playSound('fire');
            const canvas = document.getElementById('lab-fire-canvas');
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;

            const colors = ['#FFD93D', '#FF9F1C', '#FF595E', '#FF8FA3', '#FFE66D'];
            const originX = canvas.width / 2 + 15;
            const originY = canvas.height / 2 - 25;

            for (let i = 0; i < 45; i++) {
                labFireParticles.push({
                    x: originX,
                    y: originY,
                    vx: 3.5 + Math.random() * 8.5,
                    vy: (Math.random() - 0.5) * 5 - 2,
                    r: 8 + Math.random() * 14,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    alpha: 1
                });
            }

            if (!labFireAnimating) {
                labFireAnimating = true;
                animateLabFire();
            }
        }

        function animateLabFire() {
            const canvas = document.getElementById('lab-fire-canvas');
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            labFireParticles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy -= 0.08; // Flame buoyancy rises upwards
                p.r *= 0.96;
                p.alpha -= 0.024;

                ctx.save();
                ctx.globalAlpha = Math.max(0, p.alpha);
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            labFireParticles = labFireParticles.filter(p => p.alpha > 0.02);
            if (labFireParticles.length > 0) {
                requestAnimationFrame(animateLabFire);
            } else {
                labFireAnimating = false;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }

        // Disfraces mágicos en el laboratorio: cada botón pasa la CLAVE de su cromo (W11, D-22)
        function setLabCostume(clave, labelName) {
            playSound('pop');
            const img = document.getElementById('lab-nailong-img');
            const badge = document.getElementById('lab-status-badge');
            const sticker = stickerPorClave(clave);
            if (img && sticker) {
                img.src = 'Stickers Nailong/' + sticker.file;
                img.alt = 'Nailong: ' + sticker.title;
                img.style.transform = 'scale(1.15)';
                setTimeout(() => { img.style.transform = 'scale(1)'; }, 250);
            }
            if (badge) badge.textContent = '🎭 Disfraz: ' + labelName;
        }

        // Lluvia de muslitos de pollo crujiente
        let labChickenAnimating = false;
        let labChickenItems = [];

        function feedLabChicken() {
            playSound('chomp');
            const canvas = document.getElementById('lab-fire-canvas');
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;

            const badge = document.getElementById('lab-status-badge');
            if (badge) badge.textContent = '🍗 ¡Lluvia de Pollo Crujiente!';

            for (let i = 0; i < 15; i++) {
                labChickenItems.push({
                    x: Math.random() * (canvas.width - 60) + 30,
                    y: -30 - Math.random() * 120,
                    vy: 3 + Math.random() * 4,
                    rotation: Math.random() * 360,
                    vRot: (Math.random() - 0.5) * 8,
                    size: 26 + Math.random() * 14,
                    alpha: 1
                });
            }

            const img = document.getElementById('lab-nailong-img');
            if (img) {
                img.style.transform = 'scale(1.28, 1.15)';
                setTimeout(() => { img.style.transform = 'scale(1, 1)'; }, 800);
            }

            if (!labChickenAnimating) {
                labChickenAnimating = true;
                animateLabChicken();
            }
        }

        function animateLabChicken() {
            const canvas = document.getElementById('lab-fire-canvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            labChickenItems.forEach(item => {
                item.y += item.vy;
                item.rotation += item.vRot;
                if (item.y > canvas.height * 0.7) {
                    item.alpha -= 0.05;
                }

                ctx.save();
                ctx.globalAlpha = Math.max(0, item.alpha);
                ctx.translate(item.x, item.y);
                ctx.rotate((item.rotation * Math.PI) / 180);
                ctx.font = Math.round(item.size) + 'px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('🍗', 0, 0);
                ctx.restore();
            });

            labChickenItems = labChickenItems.filter(item => item.alpha > 0.05 && item.y < canvas.height + 40);
            if (labChickenItems.length > 0) {
                requestAnimationFrame(animateLabChicken);
            } else {
                labChickenAnimating = false;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }

        // Gravedad cero espacial
        let labZeroGravityActive = false;
        function toggleLabZeroGravity() {
            const fig = document.getElementById('lab-nailong-figure');
            const badge = document.getElementById('lab-status-badge');
            labZeroGravityActive = !labZeroGravityActive;

            if (labZeroGravityActive) {
                playSound('duang');
                if (fig) fig.classList.add('animate-float');
                if (badge) badge.textContent = '🪐 ¡Modo Gravedad Cero Activo!';
            } else {
                playSound('pop');
                if (fig) fig.classList.remove('animate-float');
                if (badge) badge.textContent = '✨ Modo Normal';
            }
        }
