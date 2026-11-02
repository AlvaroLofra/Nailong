        /* ==============================================================
           8. BOTONERA DE SONIDOS INTERACTIVA (12 SONIDOS REALES)
        ============================================================== */
        const SOUNDBOARD_TILES = [
            { sticker: 'sticker_18.webp', name: '¡Duang Rebotón!', sound: 'duang', icon: '🍮' },
            { sticker: 'sticker_11.webp', name: '¡Ñam Ñam Crujiente!', sound: 'chomp', icon: '🥟' },
            { sticker: 'sticker_30.webp', name: 'Sorbito Refrescante', sound: 'pop', icon: '🧃' },
            { sticker: 'sticker_9.webp', name: '¡Bleh Burlón!', sound: 'pop', icon: '🤪' },
            { sticker: 'sticker_10.webp', name: 'Maracas Duang', sound: 'maracas', icon: '🪇' },
            { sticker: 'sticker_32.webp', name: '¡Llamita Bebé!', sound: 'fire', icon: '🔥' },
            { sticker: 'sticker_38.webp', name: 'Ronquidito Zzz', sound: 'sleep', icon: '😴' },
            { sticker: 'sticker_13.webp', name: '¡Risa a Carcajadas!', sound: 'laugh', icon: '😆' },
            { sticker: 'sticker_33.webp', name: '¡Capitán Pirata!', sound: 'fanfare', icon: '🏴‍☠️' },
            { sticker: 'sticker_21.webp', name: '¡A Correr Rápido!', sound: 'duang', icon: '🏃' },
            { sticker: 'sticker_28.webp', name: 'Xiao Qi & Colita', sound: 'pop', icon: '👦' },
            { sticker: 'sticker_19.webp', name: '¡Fiesta Victoria!', sound: 'fanfare', icon: '🎉' }
        ];

        function renderSoundboard() {
            const grid = document.getElementById('soundboard-grid');
            grid.innerHTML = SOUNDBOARD_TILES.map((tile, i) => `
                <button onclick="playTileSound('${tile.sound}', this)" class="sound-tile clay-card p-4 sm:p-5 flex flex-col items-center justify-between text-center bg-white/95 hover:bg-nailong-belly border-3 border-nailong-yellow transition-all group">
                    <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-nailong-pale p-2 flex items-center justify-center overflow-hidden mb-2 shadow-inner group-hover:scale-110 transition-transform">
                        <img src="Stickers Nailong/${tile.sticker}" alt="${tile.name}" loading="lazy" decoding="async" class="w-full h-full object-contain">
                    </div>
                    <div>
                        <span class="text-xl mb-1 block">${tile.icon}</span>
                        <h4 class="font-display font-bold text-sm sm:text-base text-amber-950">${tile.name}</h4>
                    </div>
                </button>
            `).join('');
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

        // Disfraces mágicos en el laboratorio
        function setLabCostume(imgFile, labelName) {
            playSound('pop');
            const img = document.getElementById('lab-nailong-img');
            const badge = document.getElementById('lab-status-badge');
            if (img) {
                img.src = 'Stickers Nailong/' + imgFile;
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
