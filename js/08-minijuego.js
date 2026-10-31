        /* ==============================================================
           10. MINIJUEGO: "¡LA GRAN COMILONA DE NAILONG!" (HTML5 CANVAS)
        ============================================================== */
        let gameActive = false;
        let gameScore = 0;
        let gameTimeLeft = 30;
        let gameTimerInterval = null;
        let gameAnimId = null;
        let playerX = 200;
        let playerScaleY = 1;
        let fallingItems = [];
        let scorePopups = [];
        let keysHeld = { left: false, right: false };
        let keyHoldFrames = 0;

        const foodCanvas = document.getElementById('food-game-canvas');
        const foodCtx = foodCanvas.getContext('2d');

        const playerSprite = new Image();
        playerSprite.src = 'Stickers Nailong/sticker_10.webp';

        function resizeGameCanvas() {
            const container = document.getElementById('game-container');
            if (!container) return;
            const rect = container.getBoundingClientRect();
            const oldWidth = foodCanvas.width || rect.width;
            const newWidth = Math.round(rect.width);
            const newHeight = Math.round(rect.height);

            foodCanvas.width = newWidth;
            foodCanvas.height = newHeight;

            if (!gameActive) {
                playerX = foodCanvas.width / 2;
            } else if (oldWidth > 0 && oldWidth !== newWidth) {
                const ratio = newWidth / oldWidth;
                playerX = Math.max(50, Math.min(newWidth - 50, Math.round(playerX * ratio)));
                fallingItems.forEach(item => {
                    item.x = Math.max(45, Math.min(newWidth - 45, Math.round(item.x * ratio)));
                });
            } else {
                playerX = Math.max(50, Math.min(newWidth - 50, playerX));
            }
        }

        /* Funciones de Pantalla Completa Fácil y Fluida */
        function toggleGameFullscreen() {
            const container = document.getElementById('game-container');
            if (!container) return;

            const isNativeFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
            const isCssFs = container.classList.contains('minigame-fullscreen-active');

            if (!isNativeFs && !isCssFs) {
                if (container.requestFullscreen) {
                    container.requestFullscreen().catch(() => enterCssFullscreen(container));
                } else if (container.webkitRequestFullscreen) {
                    container.webkitRequestFullscreen();
                } else {
                    enterCssFullscreen(container);
                }
            } else {
                if (isNativeFs) {
                    if (document.exitFullscreen) {
                        document.exitFullscreen().catch(() => exitCssFullscreen(container));
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    }
                }
                if (isCssFs) {
                    exitCssFullscreen(container);
                }
            }
        }

        function enterCssFullscreen(container) {
            document.body.classList.add('has-minigame-fullscreen');
            container.classList.add('minigame-fullscreen-active');
            document.body.style.overflow = 'hidden';
            updateFullscreenUI(true);
            setTimeout(resizeGameCanvas, 60);
            setTimeout(resizeGameCanvas, 220);
        }

        function exitCssFullscreen(container) {
            document.body.classList.remove('has-minigame-fullscreen');
            container.classList.remove('minigame-fullscreen-active');
            document.body.style.overflow = '';
            updateFullscreenUI(false);
            setTimeout(resizeGameCanvas, 60);
            setTimeout(resizeGameCanvas, 220);
        }

        function updateFullscreenUI(active) {
            const btnText = document.getElementById('game-fullscreen-text');
            const btnIcon = document.getElementById('game-fullscreen-icon');
            const floatText = document.getElementById('game-float-fs-text');
            const floatIcon = document.getElementById('game-float-fs-icon');

            if (active) {
                if (btnText) btnText.textContent = 'Salir Completa';
                if (btnIcon) { btnIcon.className = 'fa-solid fa-compress text-nailong-orange'; }
                if (floatText) floatText.textContent = 'Salir (Esc)';
                if (floatIcon) { floatIcon.className = 'fa-solid fa-compress text-nailong-orange'; }
            } else {
                if (btnText) btnText.textContent = 'Pantalla Completa';
                if (btnIcon) { btnIcon.className = 'fa-solid fa-expand text-nailong-orange'; }
                if (floatText) floatText.textContent = 'Pantalla Completa';
                if (floatIcon) { floatIcon.className = 'fa-solid fa-expand text-nailong-orange'; }
            }
        }

        function setupGameControls() {
            const container = document.getElementById('game-container');
            const updatePlayerPos = (clientX) => {
                const rect = foodCanvas.getBoundingClientRect();
                playerX = Math.max(50, Math.min(foodCanvas.width - 50, clientX - rect.left));
            };

            container.addEventListener('mousemove', (e) => updatePlayerPos(e.clientX));
            container.addEventListener('touchstart', (e) => {
                if (e.touches.length > 0) updatePlayerPos(e.touches[0].clientX);
            }, { passive: true });
            container.addEventListener('touchmove', (e) => {
                if (e.touches.length > 0) {
                    if (e.cancelable) e.preventDefault();
                    updatePlayerPos(e.touches[0].clientX);
                }
            }, { passive: false });

            window.addEventListener('keydown', (e) => {
                if (!gameActive) return;
                const key = e.key ? e.key.toLowerCase() : '';
                if (e.key === 'ArrowLeft' || key === 'a' || e.code === 'ArrowLeft' || e.code === 'KeyA') {
                    keysHeld.left = true;
                    if (e.cancelable) e.preventDefault();
                }
                if (e.key === 'ArrowRight' || key === 'd' || e.code === 'ArrowRight' || e.code === 'KeyD') {
                    keysHeld.right = true;
                    if (e.cancelable) e.preventDefault();
                }
            });

            window.addEventListener('keyup', (e) => {
                const key = e.key ? e.key.toLowerCase() : '';
                if (e.key === 'ArrowLeft' || key === 'a' || e.code === 'ArrowLeft' || e.code === 'KeyA') {
                    keysHeld.left = false;
                }
                if (e.key === 'ArrowRight' || key === 'd' || e.code === 'ArrowRight' || e.code === 'KeyD') {
                    keysHeld.right = false;
                }
            });

            window.addEventListener('blur', () => {
                keysHeld.left = false;
                keysHeld.right = false;
                keyHoldFrames = 0;
            });

            // Fullscreen change listeners
            document.addEventListener('fullscreenchange', () => {
                const isFs = !!document.fullscreenElement;
                updateFullscreenUI(isFs);
                setTimeout(resizeGameCanvas, 60);
                setTimeout(resizeGameCanvas, 200);
            });
            document.addEventListener('webkitfullscreenchange', () => {
                const isFs = !!document.webkitFullscreenElement;
                updateFullscreenUI(isFs);
                setTimeout(resizeGameCanvas, 60);
                setTimeout(resizeGameCanvas, 200);
            });
            window.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    const container = document.getElementById('game-container');
                    if (container && container.classList.contains('minigame-fullscreen-active')) {
                        exitCssFullscreen(container);
                    }
                }
            });

            // Virtual Left/Right buttons for mobile touchscreens (both dock and card buttons)
            const bindButton = (btn, dir) => {
                if (!btn) return;
                const start = (e) => {
                    if (e.cancelable) e.preventDefault();
                    if (e.stopPropagation) e.stopPropagation();
                    if (dir === 'left') { keysHeld.left = true; keysHeld.right = false; }
                    if (dir === 'right') { keysHeld.right = true; keysHeld.left = false; }
                };
                const stop = (e) => {
                    if (e && e.stopPropagation) e.stopPropagation();
                    if (dir === 'left') keysHeld.left = false;
                    if (dir === 'right') keysHeld.right = false;
                };
                btn.addEventListener('touchstart', start, { passive: false });
                btn.addEventListener('touchend', stop);
                btn.addEventListener('touchcancel', stop);
                btn.addEventListener('mousedown', start);
                btn.addEventListener('mouseup', stop);
                btn.addEventListener('mouseleave', stop);
            };

            const leftBtn = document.getElementById('mobile-left-btn');
            const rightBtn = document.getElementById('mobile-right-btn');
            const dockLeftBtn = document.getElementById('dock-left-btn');
            const dockRightBtn = document.getElementById('dock-right-btn');

            bindButton(leftBtn, 'left');
            bindButton(rightBtn, 'right');
            bindButton(dockLeftBtn, 'left');
            bindButton(dockRightBtn, 'right');
        }

        function startMiniGame() {
            playSound('fanfare');
            resizeGameCanvas();
            // Pre-calienta los sprites de comida y bombas para evitar tirones en el primer fotograma
            ['🍗', '🍰', '🍦', '🍼', '🍉', '🍔', '💣'].forEach(em => getEmojiSprite(em, 34));

            // Cancel any previous game animation frame and timer
            if (gameAnimId) {
                cancelAnimationFrame(gameAnimId);
                gameAnimId = null;
            }
            if (gameTimerInterval) {
                clearInterval(gameTimerInterval);
                gameTimerInterval = null;
            }

            gameActive = true;
            gameScore = 0;
            gameTimeLeft = 30;
            fallingItems = [];
            scorePopups = [];
            document.getElementById('game-score').textContent = '0';
            
            const startBtn = document.getElementById('game-start-btn');
            if (startBtn) startBtn.innerHTML = '🔄 Reiniciar Juego';

            const overlay = document.getElementById('game-overlay');
            overlay.classList.add('hidden');
            overlay.classList.remove('flex');
            overlay.style.display = 'none';

            gameTimerInterval = setInterval(() => {
                gameTimeLeft--;
                if (gameTimeLeft <= 0) {
                    endMiniGame();
                }
            }, 1000);

            gameAnimId = requestAnimationFrame(gameLoop);
        }

        function endMiniGame() {
            gameActive = false;
            keysHeld.left = false;
            keysHeld.right = false;
            keyHoldFrames = 0;
            if (gameTimerInterval) {
                clearInterval(gameTimerInterval);
                gameTimerInterval = null;
            }
            if (gameAnimId) {
                cancelAnimationFrame(gameAnimId);
                gameAnimId = null;
            }

            playSound('fanfare');
            triggerPartyMode();

            const startBtn = document.getElementById('game-start-btn');
            if (startBtn) startBtn.innerHTML = '▶️ ¡Jugar Ahora!';

            const overlay = document.getElementById('game-overlay');
            document.getElementById('game-overlay-title').textContent = `¡Tiempo! Comiste ${gameScore} puntos 🎉`;
            document.getElementById('game-overlay-desc').textContent = '¡La barriguita de Nailong está súper redondita, feliz y llena de cosas ricas! ¿Quieres jugar otra partida?';
            overlay.classList.remove('hidden');
            overlay.classList.add('flex');
            overlay.style.display = 'flex';
        }

        function gameLoop() {
            if (!gameActive) return;

            // Desplazamiento lineal constante y rápido (estilo arcade ágil)
            if (keysHeld.left || keysHeld.right) {
                // Velocidad lineal constante rápida (16px a resolución base, escalada proporcionalmente si pantalla completa)
                const moveSpeed = Math.max(16, Math.round(foodCanvas.width * 0.02));
                if (keysHeld.left && !keysHeld.right) {
                    playerX = Math.max(50, playerX - moveSpeed);
                } else if (keysHeld.right && !keysHeld.left) {
                    playerX = Math.min(foodCanvas.width - 50, playerX + moveSpeed);
                }
            }

            foodCtx.clearRect(0, 0, foodCanvas.width, foodCanvas.height);

            // HUD: Time Remaining Pill
            const isNarrow = foodCanvas.width < 440;
            const timePillW = isNarrow ? 112 : 132;
            foodCtx.fillStyle = 'rgba(255, 255, 255, 0.92)';
            foodCtx.beginPath();
            foodCtx.roundRect(14, 14, timePillW, 36, 18);
            foodCtx.fill();
            foodCtx.strokeStyle = '#FFE66D';
            foodCtx.lineWidth = 2;
            foodCtx.stroke();
            foodCtx.fillStyle = '#451a03';
            foodCtx.font = 'bold 14px Fredoka, sans-serif';
            foodCtx.fillText(`⏱️ ${gameTimeLeft}s`, isNarrow ? 24 : 26, 37);

            // HUD: Live Score Pill (Visible in normal and Fullscreen modes)
            const scorePillX = 14 + timePillW + 8;
            const scorePillW = isNarrow ? 112 : 132;
            foodCtx.fillStyle = 'rgba(255, 255, 255, 0.92)';
            foodCtx.beginPath();
            foodCtx.roundRect(scorePillX, 14, scorePillW, 36, 18);
            foodCtx.fill();
            foodCtx.strokeStyle = '#FF9F1C';
            foodCtx.lineWidth = 2;
            foodCtx.stroke();
            foodCtx.fillStyle = '#b45309';
            foodCtx.font = 'bold 14px Fredoka, sans-serif';
            foodCtx.fillText(`⭐ ${gameScore} pts`, scorePillX + (isNarrow ? 14 : 18), 37);

            // Spawn falling foods or Bombloong's bombs with gentle, pleasant speed
            if (Math.random() < 0.048) {
                const goods = [
                    { emoji: '🍗', points: 15, bad: false },
                    { emoji: '🍰', points: 20, bad: false },
                    { emoji: '🍦', points: 10, bad: false },
                    { emoji: '🍼', points: 25, bad: false },
                    { emoji: '🍉', points: 10, bad: false },
                    { emoji: '🍔', points: 15, bad: false },
                    { emoji: '💣', points: -15, bad: true }
                ];
                const pick = goods[Math.floor(Math.random() * goods.length)];
                const isMobile = foodCanvas.width < 540;
                // Gentle speed: mobile falls between 1.2 and 2.1 px/frame; desktop between 1.5 and 2.6 px/frame
                const baseVy = isMobile ? (1.2 + Math.random() * 0.9) : (1.5 + Math.random() * 1.1);
                // Bombs fall slightly slower (20% slower) so players on mobile have ample time to dodge
                const finalVy = pick.bad ? (baseVy * 0.8) : baseVy;

                fallingItems.push({
                    x: 45 + Math.random() * (foodCanvas.width - 90),
                    y: -30,
                    vy: finalVy,
                    ...pick
                });
            }

            // Draw Real Nailong Catcher at bottom
            const py = foodCanvas.height - 52;
            playerScaleY += (1 - playerScaleY) * 0.18;

            foodCtx.save();
            foodCtx.translate(playerX, py);
            foodCtx.scale(2 - playerScaleY, playerScaleY);

            // Draw player sprite image
            const sWidth = 84;
            const sHeight = 84;
            if (playerSprite.complete && playerSprite.naturalWidth > 0) {
                foodCtx.drawImage(playerSprite, -sWidth / 2, -sHeight / 2, sWidth, sHeight);
            } else {
                foodCtx.fillStyle = '#FFD93D';
                foodCtx.beginPath();
                foodCtx.arc(0, 0, 38, 0, Math.PI * 2);
                foodCtx.fill();
            }
            foodCtx.restore();

            // Update & Draw Falling Foods
            foodCtx.font = '34px sans-serif';
            foodCtx.textAlign = 'center';

            for (let i = fallingItems.length - 1; i >= 0; i--) {
                const item = fallingItems[i];
                item.y += item.vy;
                // Sprite pre-rasterizado (evita rasterizar el glifo emoji en cada fotograma)
                const foodSprite = getEmojiSprite(item.emoji, 34);
                foodCtx.drawImage(foodSprite.canvas, item.x - foodSprite.width / 2, item.y - foodSprite.height / 2 - 12);

                // Collision detection with Nailong
                const dx = item.x - playerX;
                const dy = item.y - py;
                if (Math.hypot(dx, dy) < 46) {
                    gameScore = Math.max(0, gameScore + item.points);
                    document.getElementById('game-score').textContent = gameScore;
                    playerScaleY = 0.72; // Elastic squash
                    playSound(item.bad ? 'fire' : 'chomp');

                    // Floating score text popup particle
                    scorePopups.push({
                        x: item.x,
                        y: item.y,
                        text: (item.bad ? '' : '+') + item.points + (item.bad ? ' 💥' : ' ' + item.emoji),
                        color: item.bad ? '#ef4444' : '#15803d',
                        alpha: 1,
                        vy: -2
                    });

                    fallingItems.splice(i, 1);
                    continue;
                }

                if (item.y > foodCanvas.height + 40) {
                    fallingItems.splice(i, 1);
                }
            }

            // Draw Floating Score Popups
            for (let j = scorePopups.length - 1; j >= 0; j--) {
                const p = scorePopups[j];
                p.y += p.vy;
                p.alpha -= 0.025;
                if (p.alpha <= 0) {
                    scorePopups.splice(j, 1);
                    continue;
                }
                foodCtx.save();
                foodCtx.globalAlpha = p.alpha;
                foodCtx.fillStyle = p.color;
                foodCtx.font = 'bold 20px Fredoka, sans-serif';
                foodCtx.fillText(p.text, p.x, p.y);
                foodCtx.restore();
            }

            gameAnimId = requestAnimationFrame(gameLoop);
        }

