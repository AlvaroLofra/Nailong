        /* ==============================================================
           3. HERO SECTION INTERACTIVITY (BELLY DUANG & MOODS)
        ============================================================== */
        let bellyPokes = 0;
        const heroQuotes = [
            "¡Duang~ Duang~! ¡Jajaja, qué cosquillas tan ricas! 💛",
            "¡Mi pancita está llena de leche calentita y muslitos de pollo! 🍗",
            "¡Soy el dragón más tierno y rebotón de todo el universo! ✨",
            "¡Oye! ¡Si me tocas tanto la pancita me entrará hambre de tarta! 🍰",
            "¡Xiao Qi dice que mi barriga rebota como un flan gigante! 🍮",
            "¡Duang! ¡Mira cómo tiembla mi gelatina amarilla! 🦖",
            "¡Ñam ñam! ¿Tienes un poco de pollo frito para compartir? 🍗",
            "¡Amo a todos mis pequeños fans! ¡Sois los mejores! 💖"
        ];

        function pokeHeroBelly(event) {
            bellyPokes++;
            playSound('duang');

            // Update Belly Counter
            document.getElementById('belly-counter').textContent = `${bellyPokes} ¡Duangs!`;

            // Bouncy Spring Squash on Real Image
            const img = document.getElementById('hero-nailong-img');
            const wrapper = document.getElementById('hero-nailong-wrapper');
            img.classList.remove('animate-duang');
            wrapper.classList.remove('animate-duang');
            void img.offsetWidth; // Reflow
            img.classList.add('animate-duang');
            wrapper.classList.add('animate-duang');

            // Check Milestones
            const speech = document.getElementById('nailong-speech');
            if (bellyPokes === 5) {
                playSound('laugh');
                speech.textContent = '"¡Jajaja! ¡5 Duangs seguidos! ¡Me muero de risa! 💛🎉"';
                triggerPartyMode();
            } else if (bellyPokes === 10) {
                playSound('fanfare');
                speech.textContent = '"¡10 Duangs! 🍗 ¡Te has ganado un súper festín de pollo crujiente!"';
                triggerPartyMode();
            } else if (bellyPokes === 25) {
                playSound('fanfare');
                speech.textContent = '"¡25 Duangs! 🏆 ¡Eres oficialmente el Fan #1 de Nailong!"';
                triggerPartyMode();
            } else {
                speech.textContent = `"${heroQuotes[bellyPokes % heroQuotes.length]}"`;
            }

            speech.classList.add('scale-105');
            setTimeout(() => speech.classList.remove('scale-105'), 220);

            // Floating Emoji Particle Bursts
            const container = document.getElementById('belly-particles');
            const badge = document.createElement('div');
            const emojis = ['💛', '✨', '🍗', '💖', '🍼', '🍮', '¡DUANG!'];
            const pick = emojis[Math.floor(Math.random() * emojis.length)];
            badge.className = 'absolute font-display font-bold text-xl sm:text-2xl text-nailong-orange pointer-events-none transition-all duration-700 select-none';
            badge.style.left = `${30 + Math.random() * 40}%`;
            badge.style.top = `${35 + Math.random() * 25}%`;
            badge.textContent = pick;
            container.appendChild(badge);

            requestAnimationFrame(() => {
                badge.style.transform = `translate(${(Math.random() - 0.5) * 110}px, -95px) scale(1.3)`;
                badge.style.opacity = '0';
            });
            setTimeout(() => badge.remove(), 750);
        }

        const moodData = {
            happy: { sticker: 'sticker_20.webp', sound: 'laugh', speech: '¡Estoy súper feliz y saltarín hoy! 😄💛' },
            popcorn: { sticker: 'sticker_19.webp', sound: 'chomp', speech: '¡Ñam ñam! ¡Devorando palomitas en el cine! 🍿✨' },
            maracas: { sticker: 'sticker_11.webp', sound: 'maracas', speech: '¡Moviendo las caderas con mis maracas mágicas! 🪇💃' },
            pirate: { sticker: 'sticker_35.webp', sound: 'fanfare', speech: '¡Al abordaje, grumetes! ¡Soy el Capitán Nailong! 🏴‍☠️' },
            sleep: { sticker: 'sticker_40.webp', sound: 'sleep', speech: 'Zzz... soñando en mi hamaca con lagos de natillas... 😴🫧' },
            scared: { sticker: 'sticker_23.webp', sound: 'duang', speech: '¡Socorro! ¡Xiao Qi me persigue con la esponja del baño! 🏃💨' },
            drama: { sticker: 'sticker_24.webp', sound: 'duang', speech: '¡Hmpf! ¡Pues ahora no te doy de mi tarta favorita! 🥺💧' },
            pastry: { sticker: 'sticker_12.webp', sound: 'chomp', speech: '¡Ñam, masticando bollitos dulces a toda velocidad! 🥟😋' },
            chicken: { sticker: 'sticker_6.webp', sound: 'chomp', speech: '¡Mmm, qué delicia de muslito de pollo frito! ¡Mi comida favorita! 🍗😋' }
        };

        function setHeroMood(moodKey, btnEl) {
            const data = moodData[moodKey];
            if (!data) return;

            playSound(data.sound);

            // Highlight Active Button
            document.querySelectorAll('#hero-mood-buttons .mood-btn').forEach(b => {
                b.className = 'mood-btn px-3.5 py-1.5 rounded-2xl font-display font-bold text-xs sm:text-sm bg-white border-2 border-nailong-yellow text-amber-900 shadow-sm hover:scale-105 transition-all';
            });
            if (btnEl) {
                btnEl.className = 'mood-btn px-3.5 py-1.5 rounded-2xl font-display font-bold text-xs sm:text-sm bg-nailong-yellow border-2 border-amber-500 text-amber-950 shadow-sm scale-105 transition-all';
            }

            // Swap Real Animated Image
            const img = document.getElementById('hero-nailong-img');
            img.src = `Stickers Nailong/${data.sticker}`;
            img.classList.remove('animate-duang');
            void img.offsetWidth;
            img.classList.add('animate-duang');

            // Update Speech
            document.getElementById('nailong-speech').textContent = `"${data.speech}"`;
        }

