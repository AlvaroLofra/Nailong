# Nota Técnica 03: Motor de Audio Sintetizado con Web Audio API

> **Subsistema:** Efectos de sonido en tiempo real  
> **Implementación:** `index.html` (Javascript nativo)  
> **Dependencias externas de audio:** 0 archivos (`.mp3` y `.wav` prohibidos)

---

## 1. Principio de Cero Dependencias de Audio
Para garantizar tiempos de carga instantáneos en redes móviles y evitar transferencias de megabytes innecesarias, **todos los efectos de sonido del sitio se sintetizan proceduralmente en el cliente** mediante osciladores matemáticos de la Web Audio API:

```javascript
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
```

---

## 2. Tipos de Síntesis Utilizados

### 2.1. Rebote Elástico «Duang»
Simula el sonido caricaturesco de una panza o cuerpo de goma gelatinosa rebotando:
- **Oscilador:** Onda senoidal (`sine`).
- **Envolvente de Frecuencia:** Curva exponencial rápida descendente y ascendente (`exponentialRampToValueAtTime`) que simula la compresión y descompresión física del aire.
- **Envolvente de Ganancia:** Decaimiento rápido amortiguado.

```javascript
function playDuangSound() {
    if (audioMuted) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    const now = audioCtx.currentTime;
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.22);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
}
```

### 2.2. Botonera de Sonidos (Soundboard de 12 Efectos)
La sección `#sonidos` implementa 12 timbres distintos combinando tipos de ondas y modulaciones:
1. **Risa de Dragón:** Modulación de frecuencia (FM) a alta velocidad en onda triangular.
2. **Pedito Duang:** Onda de diente de sierra (`sawtooth`) con filtro paso bajo barriendo hacia graves.
3. **Llamarada Mágica:** Ruido blanco generado en búfer con filtro paso banda modulado en envolvente.
4. **Comida / Ñam:** Dos tonos senoidales en rápida alternancia con caída de tono.
5. **Victoria / Fanfarria:** Acorde mayor arpegiado en micro-intervalos con osciladores múltiples.

---

## 3. Manejo de Políticas de Autoplay de Navegadores
Los navegadores modernos suspenden el `AudioContext` hasta la primera interacción del usuario (`click` o `touchstart`):
- Se implementa reanudación perezosa (`audioCtx.resume()`) en el primer toque de cualquier botón interactivo.
- Se proporciona un botón global de silenciado (`#mute-btn`) en la cabecera con persistencia en memoria durante la sesión.
