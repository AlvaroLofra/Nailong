import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from 'remotion';
import { Subtitles, WordTimestamp } from './Subtitles';
import wordsData from '../../audio/output/locucion_trailer_palabras.json';

const words: WordTimestamp[] = wordsData as WordTimestamp[];

// Componente React nativo y determinista para la simulación del chat de WhatsApp
const WhatsAppChat: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animaciones controladas frame a frame con spring
  const headerSpring = spring({ frame, fps, config: { damping: 14 } });
  const msg1Spring = spring({ frame: frame - 15, fps, config: { damping: 12 } });
  const st1Spring = spring({ frame: frame - 35, fps, config: { damping: 10 } });
  const st2Spring = spring({ frame: frame - 70, fps, config: { damping: 10 } });
  const st3Spring = spring({ frame: frame - 105, fps, config: { damping: 10 } });
  const st4Spring = spring({ frame: frame - 140, fps, config: { damping: 10 } });

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        backgroundColor: '#0B141A',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Segoe UI, Helvetica, Arial, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Fondo de patrón de chat WhatsApp */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.08,
          backgroundImage:
            'radial-gradient(#25D366 1px, transparent 1px), radial-gradient(#128C7E 1px, #0B141A 1px)',
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 20px 20px',
        }}
      />

      {/* Cabecera WhatsApp */}
      <div
        style={{
          height: 180,
          backgroundColor: '#1F2C34',
          display: 'flex',
          alignItems: 'center',
          padding: '0 36px',
          zIndex: 10,
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          transform: `translateY(${interpolate(headerSpring, [0, 1], [-180, 0])}px)`,
        }}
      >
        <span style={{ fontSize: '48px', color: '#8696A0', marginRight: '24px' }}>←</span>
        <img
          src={staticFile('stickers/sticker_2.webp')}
          alt="Avatar"
          style={{
            width: 90,
            height: 90,
            borderRadius: '50%',
            backgroundColor: '#FFE66D',
            objectFit: 'cover',
            marginRight: '24px',
            border: '3px solid #25D366',
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '42px', fontWeight: 'bold', color: '#E9EDEF' }}>Nailong 奶龙 💛</div>
          <div style={{ fontSize: '28px', color: '#25D366', marginTop: '4px' }}>en línea</div>
        </div>
        <div style={{ fontSize: '38px', color: '#8696A0', display: 'flex', gap: '30px' }}>
          <span>📹</span>
          <span>📞</span>
          <span>⋮</span>
        </div>
      </div>

      {/* Cuerpo del chat */}
      <div
        style={{
          flex: 1,
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          zIndex: 5,
        }}
      >
        {/* Mensaje de texto 1 */}
        {frame >= 15 && (
          <div
            style={{
              alignSelf: 'flex-start',
              backgroundColor: '#1F2C34',
              borderRadius: '24px',
              borderTopLeftRadius: '4px',
              padding: '24px 32px',
              maxWidth: '80%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              transform: `scale(${msg1Spring})`,
              transformOrigin: 'top left',
            }}
          >
            <div style={{ fontSize: '38px', color: '#E9EDEF', lineHeight: 1.3 }}>
              ¡Mira lo que te mando por fin a WhatsApp! 👇🎉
            </div>
            <div style={{ fontSize: '24px', color: '#8696A0', textAlign: 'right', marginTop: '10px' }}>
              12:00
            </div>
          </div>
        )}

        {/* Fila de Stickers en cuadrícula dinámica */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '20px' }}>
          {/* Sticker 1: Duang */}
          {frame >= 35 && (
            <div
              style={{
                alignSelf: 'flex-start',
                backgroundColor: 'rgba(31, 44, 52, 0.65)',
                borderRadius: '30px',
                padding: '20px',
                textAlign: 'center',
                transform: `scale(${st1Spring}) rotate(${interpolate(st1Spring, [0, 1], [-15, 0])}deg)`,
              }}
            >
              <img
                src={staticFile('stickers/sticker_19.webp')}
                alt="Sticker 19 Duang"
                style={{ width: 280, height: 280, objectFit: 'contain' }}
              />
              <div style={{ fontSize: '24px', color: '#8696A0', textAlign: 'right' }}>12:00</div>
            </div>
          )}

          {/* Sticker 2: Maracas */}
          {frame >= 70 && (
            <div
              style={{
                alignSelf: 'flex-start',
                backgroundColor: 'rgba(31, 44, 52, 0.65)',
                borderRadius: '30px',
                padding: '20px',
                textAlign: 'center',
                transform: `scale(${st2Spring}) rotate(${interpolate(st2Spring, [0, 1], [15, 0])}deg)`,
              }}
            >
              <img
                src={staticFile('stickers/sticker_10.webp')}
                alt="Sticker 10 Maracas"
                style={{ width: 280, height: 280, objectFit: 'contain' }}
              />
              <div style={{ fontSize: '24px', color: '#8696A0', textAlign: 'right' }}>12:01</div>
            </div>
          )}

          {/* Sticker 3: Sandía */}
          {frame >= 105 && (
            <div
              style={{
                alignSelf: 'flex-start',
                backgroundColor: 'rgba(31, 44, 52, 0.65)',
                borderRadius: '30px',
                padding: '20px',
                textAlign: 'center',
                transform: `scale(${st3Spring}) rotate(${interpolate(st3Spring, [0, 1], [-12, 0])}deg)`,
              }}
            >
              <img
                src={staticFile('stickers/sticker_64.webp')}
                alt="Sticker 64 Sandia"
                style={{ width: 280, height: 280, objectFit: 'contain' }}
              />
              <div style={{ fontSize: '24px', color: '#8696A0', textAlign: 'right' }}>12:01</div>
            </div>
          )}

          {/* Sticker 4: Risas */}
          {frame >= 140 && (
            <div
              style={{
                alignSelf: 'flex-start',
                backgroundColor: 'rgba(31, 44, 52, 0.65)',
                borderRadius: '30px',
                padding: '20px',
                textAlign: 'center',
                transform: `scale(${st4Spring}) rotate(${interpolate(st4Spring, [0, 1], [12, 0])}deg)`,
              }}
            >
              <img
                src={staticFile('stickers/sticker_13.webp')}
                alt="Sticker 13 Risas"
                style={{ width: 280, height: 280, objectFit: 'contain' }}
              />
              <div style={{ fontSize: '24px', color: '#8696A0', textAlign: 'right' }}>12:02</div>
            </div>
          )}
        </div>
      </div>

      {/* Barra inferior de entrada de texto */}
      <div
        style={{
          height: 140,
          padding: '0 30px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          zIndex: 10,
        }}
      >
        <div
          style={{
            flex: 1,
            height: 90,
            backgroundColor: '#1F2C34',
            borderRadius: '50px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 30px',
            gap: '20px',
            fontSize: '36px',
            color: '#8696A0',
          }}
        >
          <span>😊</span>
          <span style={{ flex: 1, color: '#8696A0', fontSize: '32px' }}>Mensaje</span>
          <span>📎</span>
          <span>📷</span>
        </div>
        <div
          style={{
            width: 90,
            height: 90,
            borderRadius: '50%',
            backgroundColor: '#00A884',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '38px',
            color: '#FFF',
          }}
        >
          🎤
        </div>
      </div>
    </div>
  );
};

export const MainTrailer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Escena 1: 0 a 150 frames (0.0s - 5.0s) -> Gancho 3D Saludo
  // Escena 2: 151 a 345 frames (5.0s - 11.5s) -> WhatsApp Chat y Stickers reales
  // Escena 3: 346 a 510 frames (11.5s - 17.0s) -> 4 Packs Oficiales y Mi Selección
  // Escena 4: 511 a 732 frames (17.0s - 24.4s) -> Celebración 3D y CTA Final

  return (
    <AbsoluteFill style={{ backgroundColor: '#FFFDF0', overflow: 'hidden' }}>
      {/* Audio principal de voz Kokoro sincronizado */}
      <Audio src={staticFile('audio/locucion_trailer.wav')} volume={1.0} />

      {/* Música de fondo alegre de Nailong con entrada y salida gradual */}
      <Audio
        src={staticFile('audio/nailong_bgm.wav')}
        volume={(f) =>
          interpolate(f, [0, 15, 690, 732], [0, 0.22, 0.22, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
        }
      />

      {/* Fondo degradado suave */}
      <AbsoluteFill
        style={{
          background: 'linear-gradient(180deg, #BDE6FF 0%, #FFF4BD 65%, #FFE66D 100%)',
        }}
      />

      {/* Escena 1: Saludo 3D Nailong con render Blender Eevee transparente */}
      <Sequence from={0} durationInFrames={150}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <div
            style={{
              position: 'absolute',
              top: 160,
              fontSize: '56px',
              fontWeight: 900,
              color: '#FF8A00',
              textShadow: '0 4px 0 #FFF, 0 8px 24px rgba(255,138,0,0.35)',
              fontFamily: 'Fredoka, system-ui, sans-serif',
              textAlign: 'center',
              letterSpacing: '1px',
            }}
          >
            ⭐ ¡EL MUNDO MÁGICO DE NAILONG! ⭐
          </div>
          {/* Render 3D de Nailong generado en Blender Eevee con canal alfa */}
          <img
            src={staticFile('renders/nailong_saludo_alfa.png')}
            alt="Nailong Saludo 3D"
            style={{
              width: 820,
              height: 1450,
              objectFit: 'contain',
              marginTop: '80px',
              filter: 'drop-shadow(0 25px 40px rgba(255, 138, 0, 0.45))',
              transform: `scale(${spring({ frame, fps, config: { damping: 10 } })})`,
            }}
          />
        </AbsoluteFill>
      </Sequence>

      {/* Escena 2: WhatsApp Chat Animado (100% determinista frame a frame) */}
      <Sequence from={150} durationInFrames={195}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
          <WhatsAppChat />
        </AbsoluteFill>
      </Sequence>

      {/* Escena 3: 4 Packs Oficiales y Mi Selección */}
      <Sequence from={345} durationInFrames={165}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '60px' }}>
          <div
            style={{
              fontSize: '62px',
              fontWeight: 900,
              color: '#EA580C',
              fontFamily: 'Fredoka, system-ui, sans-serif',
              textAlign: 'center',
              marginBottom: '40px',
              textShadow: '0 3px 0 #FFF',
            }}
          >
            📲 4 PACKS OFICIALES (96 STICKERS)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '30px', width: '100%' }}>
            <div style={{ background: '#FFF', padding: '24px', borderRadius: '30px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
              <img src={staticFile('stickers/sticker_19.webp')} style={{ width: 220, height: 220, objectFit: 'contain' }} alt="Pack 1" />
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1E293B', marginTop: '12px', fontFamily: 'Fredoka, Segoe UI, system-ui, sans-serif' }}>Animado 1 (25)</div>
            </div>
            <div style={{ background: '#FFF', padding: '24px', borderRadius: '30px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
              <img src={staticFile('stickers/sticker_10.webp')} style={{ width: 220, height: 220, objectFit: 'contain' }} alt="Pack 2" />
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1E293B', marginTop: '12px', fontFamily: 'Fredoka, Segoe UI, system-ui, sans-serif' }}>Animado 2 (24)</div>
            </div>
            <div style={{ background: '#FFF', padding: '24px', borderRadius: '30px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
              <img src={staticFile('stickers/sticker_44.webp')} style={{ width: 220, height: 220, objectFit: 'contain' }} alt="Pack 3" />
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1E293B', marginTop: '12px', fontFamily: 'Fredoka, Segoe UI, system-ui, sans-serif' }}>Animado 3 (24)</div>
            </div>
            <div style={{ background: '#FFF', padding: '24px', borderRadius: '30px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
              <img src={staticFile('stickers/sticker_1.webp')} style={{ width: 220, height: 220, objectFit: 'contain' }} alt="Pack 4" />
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1E293B', marginTop: '12px', fontFamily: 'Fredoka, Segoe UI, system-ui, sans-serif' }}>Estático (23)</div>
            </div>
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Escena 4: Cierre, Celebración y Descarga APK */}
      <Sequence from={510} durationInFrames={222}>
        <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '60px' }}>
          <img
            src={staticFile('stickers/sticker_44.webp')}
            style={{
              width: 500,
              height: 500,
              objectFit: 'contain',
              filter: 'drop-shadow(0 20px 30px rgba(255, 138, 0, 0.45))',
            }}
            alt="Celebración"
          />
          <div
            style={{
              fontSize: '56px',
              fontWeight: 900,
              color: '#008069',
              fontFamily: 'Fredoka, system-ui, sans-serif',
              marginTop: '30px',
              textShadow: '0 3px 0 #FFF',
            }}
          >
            ¡DESCARGA GRATIS LA APP!
          </div>
          <div
            style={{
              fontSize: '38px',
              background: '#FFFFFF',
              padding: '18px 42px',
              borderRadius: '50px',
              color: '#FF8A00',
              fontWeight: 'bold',
              marginTop: '24px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            alvarolofra.github.io/Nailong
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Capa de subtítulos sincronizados palabra a palabra con Whisper */}
      <Subtitles words={words} />
    </AbsoluteFill>
  );
};
