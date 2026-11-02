// Ayudantes de animación compartidos por las escenas del tráiler v2.
// Todo se coloca en la línea de tiempo (tl) a segundos fijos: nada de relojes propios.

// Texto que bota letra a letra. Agrupa por palabras para que no se partan al saltar de línea.
window.nlLetras = function (tl, el, inicio, paso) {
  paso = paso || 0.045;
  if (!el.dataset.partido) {
    const palabras = el.textContent.trim().split(" ");
    el.textContent = "";
    palabras.forEach((p, i) => {
      const caja = document.createElement("span");
      caja.className = "palabra";
      for (const ch of p) {
        const l = document.createElement("span");
        l.className = "letra";
        l.textContent = ch;
        caja.appendChild(l);
      }
      el.appendChild(caja);
      if (i < palabras.length - 1) el.appendChild(document.createTextNode(" "));
    });
    el.dataset.partido = "1";
  }
  const letras = el.querySelectorAll(".letra");
  letras.forEach((l, i) => {
    tl.fromTo(l, { y: -320, opacity: 0, scaleX: 0.8, scaleY: 1.3 },
      { y: 0, opacity: 1, scaleX: 1, scaleY: 1, duration: 0.45, ease: "bounce.out" }, inicio + i * paso);
  });
  return inicio + letras.length * paso + 0.45;
};

// Entrada con squash & stretch: cae estirado, se aplasta al tocar suelo y rebota a su forma.
// «aterriza» es el segundo exacto del golpe (ahí va el sonido).
window.nlBotar = function (tl, el, aterriza, opciones) {
  const o = Object.assign({ desde: -1500, giro: 0, caida: 0.35 }, opciones);
  tl.fromTo(el, { y: o.desde, rotation: o.giro * 2, scaleX: 0.82, scaleY: 1.25, transformOrigin: "50% 100%" },
    { y: 0, rotation: o.giro, duration: o.caida, ease: "power2.in" }, aterriza - o.caida);
  tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.04 }, aterriza - o.caida);
  tl.fromTo(el, { scaleX: 0.82, scaleY: 1.25 },
    { scaleX: 1.24, scaleY: 0.78, duration: 0.08, ease: "power2.out", immediateRender: false }, aterriza);
  tl.fromTo(el, { scaleX: 1.24, scaleY: 0.78 },
    { scaleX: 1, scaleY: 1, duration: 0.6, ease: "elastic.out(1.1, 0.35)", immediateRender: false }, aterriza + 0.08);
};

// Toque en la pancita: se aplasta como gelatina y vuelve con rebote.
window.nlGelatina = function (tl, el, t, fuerza) {
  const f = fuerza || 1;
  tl.fromTo(el, { scaleX: 1, scaleY: 1 },
    { scaleX: 1 + 0.14 * f, scaleY: 1 - 0.16 * f, duration: 0.09, ease: "power2.out", immediateRender: false, transformOrigin: "50% 100%" }, t);
  tl.fromTo(el, { scaleX: 1 + 0.14 * f, scaleY: 1 - 0.16 * f },
    { scaleX: 1, scaleY: 1, duration: 0.65, ease: "elastic.out(1.2, 0.3)", immediateRender: false }, t + 0.09);
};

// Estrellitas que destellan: aparecen girando, brillan un momento y desaparecen.
window.nlDestellos = function (tl, contenedor, t) {
  const estrellas = contenedor.querySelectorAll(".estrella");
  estrellas.forEach((s, i) => {
    const t0 = t + i * 0.05;
    tl.fromTo(s, { scale: 0, rotation: -120, opacity: 1 },
      { scale: 1, rotation: 0, duration: 0.3, ease: "back.out(3)" }, t0);
    tl.fromTo(s, { scale: 1, opacity: 1 },
      { scale: 0, opacity: 0, duration: 0.3, ease: "power2.in", immediateRender: false }, t0 + 0.55);
  });
};

// Respiración suave de un personaje en reposo (repeticiones finitas).
window.nlRespirar = function (tl, el, inicio, duracion) {
  const ciclo = 1.0;
  tl.fromTo(el, { scaleX: 1, scaleY: 1 },
    { scaleX: 1.02, scaleY: 1.04, duration: ciclo / 2, ease: "sine.inOut", yoyo: true,
      repeat: Math.max(0, Math.floor(duracion / (ciclo / 2)) - 1), immediateRender: false, transformOrigin: "50% 100%" }, inicio);
};
