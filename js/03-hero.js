        /* ==============================================================
           3. HERO SECTION INTERACTIVITY (BELLY DUANG & MOODS)
        ============================================================== */
        let bellyPokes = 0;
        const heroQuotes = [
            "¡Duang~ Duang~! ¡Jajaja, qué cosquillas tan ricas! 💛",
            "¡Con la tripa llena se rebota muchísimo mejor! 🍮",
            "¡Soy el dragón más tierno y rebotón de todo el universo! ✨",
            "¡Oye! ¡Si me tocas tanto la pancita me entrará hambre de tarta! 🍰",
            "¡Mi barriga rebota como un flan gigante! 🍮",
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
            badge.className = 'absolute font-display font-bold text-xl sm:text-2xl text-[#C2410C] pointer-events-none transition-all duration-700 select-none';
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

        // Cada estado de ánimo apunta a su cromo por CLAVE (W11, D-22): la imagen, su texto alternativo y el
        // sonido salen de ALL_STICKERS, así que no se desincronizan si se renumeran o se corrigen los textos.
        // La frase es de Nailong en primera persona y describe lo que se ve en ese cromo (T1).
        const moodData = {
            happy: { clave: 'ilusion', speech: '¡Qué ilusión! ¡Hoy estoy contentísimo! 😄💛' },
            popcorn: { clave: 'palomitas-sofa', speech: '¡Jajaja! ¡Con palomitas en el sofá todo da más risa! 🍿' },
            rainbow: { clave: 'baile-arcoiris', speech: '¡Bota que bota con mis bolas de colores! 🌈' },
            lion: { clave: 'gorro-de-leon', speech: '¡Grrr! ¡Con mi cabeza de león bailo la danza del león! 🦁' },
            hammock: { clave: 'siesta-hamaca', speech: 'Aaah... meciéndome en la hamaca con mi cóctel azul... 😌🍹' },
            run: { clave: 'huida-bosque', speech: '¡Patas, para qué os quiero! ¡Que me pillan! 🏃💨' },
            pout: { clave: 'ojos-aguados', speech: 'Snif... ¿me das un abrazo? 🥺💧' },
            snack: { clave: 'patata-frita', speech: '¡Ñam! ¡Una patata frita crujiente para mí solito! 😋' },
            watermelon: { clave: 'sandia-tumbona', speech: '¡Qué fresquita está la sandía en la playa! 🍉😎' }
        };

        function setHeroMood(moodKey, btnEl) {
            const data = moodData[moodKey];
            const sticker = data && stickerPorClave(data.clave);
            if (!sticker) return;

            playSound(sticker.sound);

            // Highlight Active Button
            document.querySelectorAll('#hero-mood-buttons .mood-btn').forEach(b => {
                b.className = 'mood-btn px-3.5 py-1.5 rounded-2xl font-display font-bold text-xs sm:text-sm bg-white border-2 border-nailong-yellow text-amber-900 shadow-sm hover:scale-105 transition-all';
            });
            if (btnEl) {
                btnEl.className = 'mood-btn px-3.5 py-1.5 rounded-2xl font-display font-bold text-xs sm:text-sm bg-nailong-yellow border-2 border-amber-500 text-amber-950 shadow-sm scale-105 transition-all';
            }

            // Swap Real Animated Image
            const img = document.getElementById('hero-nailong-img');
            img.src = `Stickers Nailong/${sticker.file}`;
            img.alt = `Nailong: ${sticker.title}`;
            img.classList.remove('animate-duang');
            void img.offsetWidth;
            img.classList.add('animate-duang');

            // Update Speech
            document.getElementById('nailong-speech').textContent = `"${data.speech}"`;
        }

