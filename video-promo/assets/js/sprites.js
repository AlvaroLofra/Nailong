// Generado por video-promo/tools/preparar_sprites_v2.py — no editar a mano.
window.NAILONG_SPRITES = {"2": {"frames": 36, "cols": 6, "fps": 14.99}, "58": {"frames": 48, "cols": 7, "fps": 16.0}, "92": {"frames": 32, "cols": 6, "fps": 16.0}, "19": {"frames": 69, "cols": 9, "fps": 15.15}, "13": {"frames": 19, "cols": 5, "fps": 12.05}, "44": {"frames": 21, "cols": 5, "fps": 16.03}, "72": {"frames": 19, "cols": 5, "fps": 15.97}, "9": {"frames": 12, "cols": 4, "fps": 12.5}, "10": {"frames": 14, "cols": 4, "fps": 12.5}, "20": {"frames": 60, "cols": 8, "fps": 12.2}, "24": {"frames": 14, "cols": 4, "fps": 12.05}, "47": {"frames": 39, "cols": 7, "fps": 7.99}, "60": {"frames": 48, "cols": 7, "fps": 16.0}, "63": {"frames": 48, "cols": 7, "fps": 16.0}, "64": {"frames": 41, "cols": 7, "fps": 16.02}, "77": {"frames": 24, "cols": 5, "fps": 16.0}, "79": {"frames": 31, "cols": 6, "fps": 15.98}, "87": {"frames": 40, "cols": 7, "fps": 16.0}, "91": {"frames": 41, "cols": 7, "fps": 16.02}};

// Avanza una hoja de fotogramas al ritmo del vídeo: el fotograma visible es
// función del tiempo de la línea de tiempo, nunca de un reloj propio.
window.nlSprite = function (tl, el, id, inicio, duracion) {
  const s = window.NAILONG_SPRITES[id];
  const filas = Math.ceil(s.frames / s.cols);
  el.style.backgroundImage = "url('assets/sprites/sticker_" + id + ".webp')";
  el.style.backgroundSize = (s.cols * 100) + "% " + (filas * 100) + "%";
  const pintar = (f) => {
    const i = Math.floor(f) % s.frames;
    const x = s.cols > 1 ? (i % s.cols) / (s.cols - 1) * 100 : 0;
    const y = filas > 1 ? Math.floor(i / s.cols) / (filas - 1) * 100 : 0;
    el.style.backgroundPosition = x + "% " + y + "%";
  };
  pintar(0);
  const reloj = { f: 0 };
  tl.fromTo(reloj, { f: 0 }, {
    f: duracion * s.fps, duration: duracion, ease: "none",
    onUpdate: () => pintar(reloj.f),
  }, inicio);
};
