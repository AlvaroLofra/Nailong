import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

export interface WordTimestamp {
  word: string;
  fromMs: number;
  toMs: number;
}

interface SubtitlesProps {
  words: WordTimestamp[];
}

interface PhraseCue {
  id: number;
  fromMs: number;
  toMs: number;
  words: WordTimestamp[];
}

export const Subtitles: React.FC<SubtitlesProps> = ({ words }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentMs = (frame / fps) * 1000;

  // Segmentar palabras en frases cinemáticas estables (evita el temblor y salto de palabras una a una)
  const cues: PhraseCue[] = useMemo(() => {
    const list: PhraseCue[] = [];
    let current: WordTimestamp[] = [];

    for (let i = 0; i < words.length; i++) {
      current.push(words[i]);
      const isPunct = /[.!?]$/.test(words[i].word);
      const nextWord = words[i + 1];
      const gap = nextWord ? nextWord.fromMs - words[i].toMs : 9999;

      if (isPunct || gap > 320 || current.length >= 6) {
        list.push({
          id: list.length,
          fromMs: current[0].fromMs,
          toMs: current[current.length - 1].toMs + 200,
          words: current,
        });
        current = [];
      }
    }

    if (current.length) {
      list.push({
        id: list.length,
        fromMs: current[0].fromMs,
        toMs: current[current.length - 1].toMs + 200,
        words: current,
      });
    }

    return list;
  }, [words]);

  // Encontrar la frase activa para el tiempo actual
  const activeCue = cues.find((c) => currentMs >= c.fromMs && currentMs <= c.toMs);

  if (!activeCue) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 200,
        left: 40,
        right: 40,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        rowGap: '16px',
        columnGap: '14px',
        zIndex: 50,
        pointerEvents: 'none',
      }}
    >
      {activeCue.words.map((item, i) => {
        const isActive = currentMs >= item.fromMs && currentMs <= item.toMs;
        const isPast = currentMs > item.toMs;

        return (
          <span
            key={i}
            style={{
              fontSize: isActive ? '52px' : '48px',
              fontWeight: 800,
              fontFamily: 'Fredoka, Segoe UI, system-ui, sans-serif',
              color: isActive ? '#FFE66D' : isPast ? '#FFFFFF' : 'rgba(255, 255, 255, 0.70)',
              textShadow: isActive
                ? '0 0 24px rgba(255, 230, 109, 0.95), 0 4px 12px rgba(0,0,0,0.95)'
                : '0 4px 12px rgba(0,0,0,0.85)',
              transform: isActive ? 'translateY(-3px)' : 'none',
              margin: '0 6px',
              display: 'inline-block',
              letterSpacing: '0.5px',
            }}
          >
            {item.word}
          </span>
        );
      })}
    </div>
  );
};

