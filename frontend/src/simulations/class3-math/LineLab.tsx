/**
 * Lesson 9 · Lines (रेखा)
 * Line Lab — horizontal, vertical, slanting, curved, parallel and intersecting lines with real-world analogies.
 * Pure 2D Implementation for Smart Boards & Desktops.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { rnd, shuffle } from '../class1-math-kit/nepali';

interface Props { onBackToLibrary: () => void; userRole?: string }

const KINDS = [
  { id: 'horizontal', np: 'तेर्सो रेखा', en: 'Horizontal line', note: ['सुतेको रेखा — जमिनजस्तै समथर', 'Lies flat, like the ground or horizon'], what: '🪢', color: '#0284C7' },
  { id: 'vertical', np: 'ठाडो रेखा', en: 'Vertical line', note: ['उभिएको रेखा — खम्बाजस्तै सीधा', 'Stands straight up, like a pole'], what: '🏮', color: '#16A34A' },
  { id: 'slanting', np: 'ढल्केको रेखा', en: 'Slanting line', note: ['नसुतेको न उभिएको — भर्‍याङजस्तै ढल्केको', 'Neither flat nor upright — like a leaning ladder'], what: '🪜', color: '#F97316' },
  { id: 'curved', np: 'बाङ्गो रेखा', en: 'Curved line', note: ['सीधा छैन — पुल वा इन्द्रेणीजस्तै घुमाउरो', 'Not straight — bends like a rainbow or wave'], what: '🌈', color: '#8B5CF6' },
  { id: 'parallel', np: 'समानान्तर रेखा', en: 'Parallel lines', note: ['रेलको पटरीजस्तै — सधैँ समान दूरीमा, कहिल्यै नभेटिने', 'Like railway tracks — always equal distance, never meet'], what: '🛤️', color: '#EC4899' },
  { id: 'intersecting', np: 'काटिने रेखा', en: 'Intersecting lines', note: ['चोकको बाटोजस्तै — एक ठाउँमा काटिने रेखा', 'Like a crossroads — they cross at a common point'], what: '✖️', color: '#EF4444' },
];

export const LineLab: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G3-L9-01',
    chapter: 9,
    titleNp: 'रेखा प्रयोगशाला',
    titleEn: 'Line Lab',
  });

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [playAnswered, setPlayAnswered] = useState(false);

  const curKind = KINDS[selectedIdx];

  const chooseLine = (idx: number, speak = true) => {
    setSelectedIdx(idx);
    setPlayAnswered(false);
    if (speak) {
      kit.say(
        `${KINDS[idx].np} — ${KINDS[idx].note[0]}`,
        `${KINDS[idx].en}: ${KINDS[idx].note[1]}`
      );
    }
  };

  const handleGuess = (idx: number) => {
    if (playAnswered) return;
    if (idx === selectedIdx) {
      setPlayAnswered(true);
      kit.good('शानदार! सही रेखा चिन्नुभयो!', 'Great job! Correct line type!');
      kit.star();
    } else {
      kit.oops('फेरि ध्यान दिएर रेखाको दिशा र आकार हेरौँ', 'Look closely at the direction of the line.');
    }
  };

  useEffect(() => {
    if (kit.mode === 'LEARN') {
      chooseLine(0);
    } else if (kit.mode === 'PLAY') {
      const r = rnd(0, KINDS.length - 1);
      setSelectedIdx(r);
      setPlayAnswered(false);
      kit.say('यो कुन प्रकारको रेखा हो?', 'What kind of line is this?');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode]);

  // Quiz Questions for Challenge Mode
  const questions: QuizQuestion[] = KINDS.map((k, i) => {
    const wrong = shuffle(
      KINDS.filter((_, idx) => idx !== i),
      i + 4
    ).slice(0, 2);
    const opts = shuffle([k, ...wrong], i * 7 + 3);

    return {
      np: `${k.note[0]} कुन रेखा हो?`,
      en: `Which line ${k.note[1].toLowerCase()}?`,
      answer: k.id,
      options: opts.map((item) => ({
        key: item.id,
        label: kit.t(item.np, item.en),
      })),
    };
  });

  const hud = kit.mode === 'CHALLENGE' ? null : (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 16,
        padding: '8px 18px',
        border: `2px solid ${curKind.color}`,
        boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 900, color: curKind.color }}>
        {curKind.what} {kit.t(curKind.np, curKind.en)}
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>
        {kit.t(curKind.note[0], curKind.note[1])}
      </div>
    </div>
  );

  const panel = kit.mode === 'CHALLENGE' ? (
    <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => {
      const idx = KINDS.findIndex((k) => k.id === q.answer);
      if (idx !== -1) chooseLine(idx, false);
    }} />
  ) : (
    <Controls>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {KINDS.map((k, i) => (
          <CBtn
            key={k.id}
            color={i === selectedIdx && kit.mode === 'LEARN' ? k.color : '#64748B'}
            onClick={() => (kit.mode === 'LEARN' ? chooseLine(i) : handleGuess(i))}
          >
            {k.what} {kit.t(k.np, k.en)}
          </CBtn>
        ))}
      </div>
    </Controls>
  );

  return (
    <SimFrame2D kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} grade={3}>
      <div
        style={{
          width: '100%',
          height: '100%',
          minHeight: 380,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 24,
            padding: 30,
            border: '2px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            maxWidth: 600,
            width: '100%',
          }}
        >
          {/* 2D SVG Line Visualizer */}
          <svg width="400" height="220" viewBox="0 0 400 220">
            {curKind.id === 'horizontal' && (
              <g>
                <line x1="40" y1="110" x2="360" y2="110" stroke={curKind.color} strokeWidth="6" strokeLinecap="round" />
                <circle cx="40" cy="110" r="8" fill={curKind.color} />
                <circle cx="360" cy="110" r="8" fill={curKind.color} />
                <text x="200" y="90" textAnchor="middle" fill="#64748B" fontSize="13" fontWeight="800">
                  {kit.t('तेर्सो (समथर)', 'Flat / Horizontal')}
                </text>
              </g>
            )}

            {curKind.id === 'vertical' && (
              <g>
                <line x1="200" y1="20" x2="200" y2="200" stroke={curKind.color} strokeWidth="6" strokeLinecap="round" />
                <circle cx="200" cy="20" r="8" fill={curKind.color} />
                <circle cx="200" cy="200" r="8" fill={curKind.color} />
                <text x="240" y="115" fill="#64748B" fontSize="13" fontWeight="800">
                  {kit.t('ठाडो', 'Upright / Vertical')}
                </text>
              </g>
            )}

            {curKind.id === 'slanting' && (
              <g>
                <line x1="60" y1="180" x2="340" y2="40" stroke={curKind.color} strokeWidth="6" strokeLinecap="round" />
                <circle cx="60" cy="180" r="8" fill={curKind.color} />
                <circle cx="340" cy="40" r="8" fill={curKind.color} />
                <text x="210" y="95" textAnchor="middle" fill="#64748B" fontSize="13" fontWeight="800">
                  {kit.t('ढल्केको', 'Slanting')}
                </text>
              </g>
            )}

            {curKind.id === 'curved' && (
              <g>
                <path d="M 50 160 Q 200 10 350 160" stroke={curKind.color} strokeWidth="6" fill="none" strokeLinecap="round" />
                <circle cx="50" cy="160" r="8" fill={curKind.color} />
                <circle cx="350" cy="160" r="8" fill={curKind.color} />
                <text x="200" y="150" textAnchor="middle" fill="#64748B" fontSize="13" fontWeight="800">
                  {kit.t('बाङ्गो रेखा', 'Curved line')}
                </text>
              </g>
            )}

            {curKind.id === 'parallel' && (
              <g>
                <line x1="40" y1="80" x2="360" y2="80" stroke={curKind.color} strokeWidth="5" strokeLinecap="round" />
                <line x1="40" y1="140" x2="360" y2="140" stroke={curKind.color} strokeWidth="5" strokeLinecap="round" />
                {/* Ties */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <line key={i} x1={70 + i * 36} y1="75" x2={70 + i * 36} y2="145" stroke="#94A3B8" strokeWidth="2.5" />
                ))}
                <text x="200" y="55" textAnchor="middle" fill="#64748B" fontSize="13" fontWeight="800">
                  {kit.t('कहिले नभेटिने (समानान्तर)', 'Never meet (Parallel)')}
                </text>
              </g>
            )}

            {curKind.id === 'intersecting' && (
              <g>
                <line x1="60" y1="40" x2="340" y2="180" stroke="#0284C7" strokeWidth="5" strokeLinecap="round" />
                <line x1="60" y1="180" x2="340" y2="40" stroke="#EF4444" strokeWidth="5" strokeLinecap="round" />
                {/* Intersection Point */}
                <circle cx="200" cy="110" r="10" fill="#F59E0B" stroke="#B45309" strokeWidth="2.5" />
                <text x="200" y="145" textAnchor="middle" fill="#1E293B" fontSize="13" fontWeight="900">
                  {kit.t('काटिने विन्दु (Intersection)', 'Intersection Point')}
                </text>
              </g>
            )}
          </svg>
        </div>
      </div>
    </SimFrame2D>
  );
};
