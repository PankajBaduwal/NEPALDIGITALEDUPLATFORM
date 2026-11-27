/**
 * Lesson 2 · Time — the clock
 * Clock Workshop — o'clock, half past, quarter past and quarter to on an interactive 2D clock.
 * Pure 2D Implementation for Smart Boards & Desktops.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { enName, npName, toNp, shuffle, rnd } from '../class1-math-kit/nepali';

interface Props { onBackToLibrary: () => void; userRole?: string }

const MINS = [0, 15, 30, 45];
const phrase = (h: number, m: number, lang: 'ne' | 'en') => {
  const h2 = h % 12 || 12;
  const nx = (h % 12) + 1 > 12 ? 1 : (h % 12) + 1;
  if (lang === 'en') {
    return m === 0 ? `${enName(h2)} o'clock` : m === 15 ? `quarter past ${enName(h2)}` : m === 30 ? `half past ${enName(h2)}` : `quarter to ${enName(nx)}`;
  }
  return m === 0 ? `${npName(h2)} बजे` : m === 15 ? `सवा ${npName(h2)}` : m === 30 ? `साढे ${npName(h2)}` : `पौने ${npName(nx)}`;
};

export const ClockWorkshop: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G2-L2-01',
    chapter: 2,
    titleNp: 'घडी कार्यशाला (समय)',
    titleEn: 'Clock Workshop (Telling Time)',
  });

  const [hour, setHour] = useState(3);
  const [min, setMin] = useState(0);
  const [target, setTarget] = useState<{ h: number; m: number } | null>(null);
  const [li, setLi] = useState(0);

  const setTime = (hh: number, mm: number, speak = true) => {
    const validH = ((hh % 12) + 12) % 12 || 12;
    const validM = ((mm % 60) + 60) % 60;
    setHour(validH);
    setMin(validM);
    if (speak) kit.say(phrase(validH, validM, 'ne'), phrase(validH, validM, 'en'));
  };

  const nextTarget = () => {
    const t = { h: rnd(1, 12), m: MINS[rnd(0, 3)] };
    setTarget(t);
    setTime(12, 0, false);
    kit.say(`घडीमा ${phrase(t.h, t.m, 'ne')} बनाऔँ।`, `Make the clock show ${phrase(t.h, t.m, 'en')}.`);
  };

  const checkPlay = () => {
    if (!target) return;
    if ((hour % 12 || 12) === (target.h % 12 || 12) && min === target.m) {
      kit.good('स्याबास! घडी मिलाउनुभयो!', 'Well done! You matched the time!');
      kit.star();
      setTimeout(nextTarget, 1400);
    } else {
      kit.oops('छोटो सुई घण्टा, लामो सुई मिनेट हो। फेरि प्रयास गरौँ!', 'Short hand = hour, long hand = minutes. Try again!');
    }
  };

  const STEPS: [number, number][] = [
    [3, 0], [3, 15], [3, 30], [3, 45],
    [7, 0], [9, 30], [11, 15], [5, 45],
  ];

  useEffect(() => {
    if (kit.mode === 'LEARN') {
      const [a, b] = STEPS[li % STEPS.length];
      setTime(a, b);
    } else if (kit.mode === 'PLAY') {
      nextTarget();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode, li]);

  // Angles for clock hands
  const minuteAngle = min * 6; // 360 / 60
  const hourAngle = (hour % 12) * 30 + (min / 60) * 30; // 360 / 12 + fraction

  // Quiz questions for Challenge
  const data = useMemo(() => Array.from({ length: 8 }, () => ({ h: rnd(1, 12), m: MINS[rnd(0, 3)] })), []);
  const questions: (QuizQuestion & { h: number; m: number })[] = data.map((d, i) => {
    const key = (hh: number, mm: number) => `${hh}:${mm}`;
    const wrong = new Set<string>();
    let g = 0;
    while (wrong.size < 2 && g++ < 60) {
      const w = key(rnd(1, 12), MINS[rnd(0, 3)]);
      if (w !== key(d.h, d.m)) wrong.add(w);
    }
    return {
      np: 'घडीमा कति बजेको छ?',
      en: 'What time does the clock show?',
      h: d.h,
      m: d.m,
      answer: key(d.h, d.m),
      options: shuffle([key(d.h, d.m), ...Array.from(wrong)], i * 13 + 2).map((k) => {
        const [hh, mm] = k.split(':').map(Number);
        return { key: k, label: phrase(hh, mm, kit.lang) };
      }),
    };
  });

  const hud = (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 16,
        padding: '8px 18px',
        border: '2px solid #187C68',
        boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
        textAlign: 'center',
      }}
    >
      {kit.mode === 'PLAY' && target ? (
        <div>
          <span style={{ fontSize: 13, color: '#64748B' }}>{kit.t('लक्ष्य समय', 'Target')}:</span>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#D97706' }}>
            🎯 {phrase(target.h, target.m, kit.lang)}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#187C68' }}>
            {kit.lang === 'ne' ? toNp(hour % 12 || 12) : hour % 12 || 12}:{String(kit.lang === 'ne' ? toNp(min) : min).padStart(2, kit.lang === 'ne' ? '0' : '0')}
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#26332E' }}>
            {phrase(hour, min, kit.lang)}
          </div>
        </div>
      )}
    </div>
  );

  const panel = kit.mode === 'CHALLENGE' ? (
    <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => setTime(q.h, q.m, false)} />
  ) : (
    <Controls>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <CBtn color="#0284C7" onClick={() => setTime(hour + 1, min)}>
          +1 {kit.t('घण्टा', 'hour')}
        </CBtn>
        <CBtn color="#0284C7" onClick={() => setTime(hour - 1, min)}>
          -1 {kit.t('घण्टा', 'hour')}
        </CBtn>
        <CBtn color="#10B981" onClick={() => setTime(hour, min + 15)}>
          +15 {kit.t('मिनेट', 'mins')}
        </CBtn>
        <CBtn color="#10B981" onClick={() => setTime(hour, min - 15)}>
          -15 {kit.t('मिनेट', 'mins')}
        </CBtn>

        {kit.mode === 'LEARN' && (
          <CBtn color="#187C68" onClick={() => setLi((v) => v + 1)}>
            {kit.t('अर्को समय', 'Next Time')} ➜
          </CBtn>
        )}

        {kit.mode === 'PLAY' && (
          <CBtn color="#D97706" onClick={checkPlay}>
            ✓ {kit.t('जाँचौँ', 'Check Answer')}
          </CBtn>
        )}
      </div>
    </Controls>
  );

  return (
    <SimFrame2D kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} grade={2}>
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
            boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
            border: '2px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          {/* SVG Analog Clock */}
          <svg width="280" height="280" viewBox="0 0 280 280">
            {/* Outer Rim */}
            <circle cx="140" cy="140" r="130" fill="#F8FAFC" stroke="#187C68" strokeWidth="8" />
            <circle cx="140" cy="140" r="122" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />

            {/* 60 Minute Tick Marks */}
            {Array.from({ length: 60 }).map((_, i) => {
              const ang = (i * 6 * Math.PI) / 180;
              const isMajor = i % 5 === 0;
              const r1 = isMajor ? 104 : 112;
              const r2 = 120;
              const x1 = 140 + Math.sin(ang) * r1;
              const y1 = 140 - Math.cos(ang) * r1;
              const x2 = 140 + Math.sin(ang) * r2;
              const y2 = 140 - Math.cos(ang) * r2;
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isMajor ? '#1E293B' : '#94A3B8'}
                  strokeWidth={isMajor ? 3 : 1.2}
                />
              );
            })}

            {/* 12 Hour Numbers */}
            {Array.from({ length: 12 }).map((_, i) => {
              const hNum = i + 1;
              const ang = (hNum * 30 * Math.PI) / 180;
              const r = 90;
              const x = 140 + Math.sin(ang) * r;
              const y = 140 - Math.cos(ang) * r + 7;
              return (
                <text
                  key={hNum}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  fill="#1E293B"
                  fontSize="20"
                  fontWeight="900"
                >
                  {kit.lang === 'ne' ? toNp(hNum) : hNum}
                </text>
              );
            })}

            {/* Hour Hand (Short & Blue) */}
            <g transform={`rotate(${hourAngle} 140 140)`}>
              <line x1="140" y1="140" x2="140" y2="76" stroke="#0284C7" strokeWidth="7" strokeLinecap="round" />
            </g>

            {/* Minute Hand (Long & Red) */}
            <g transform={`rotate(${minuteAngle} 140 140)`}>
              <line x1="140" y1="140" x2="140" y2="48" stroke="#EF4444" strokeWidth="4.5" strokeLinecap="round" />
            </g>

            {/* Center Cap */}
            <circle cx="140" cy="140" r="7" fill="#187C68" />
            <circle cx="140" cy="140" r="3" fill="#FFFFFF" />
          </svg>

          {/* Quick preset chips */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#64748B', alignSelf: 'center', marginRight: 4 }}>
              {kit.t('द्रुत चयन', 'Quick select')}:
            </span>
            {[
              { l: ':00', m: 0 },
              { l: ':15', m: 15 },
              { l: ':30', m: 30 },
              { l: ':45', m: 45 },
            ].map((chip) => (
              <button
                key={chip.m}
                type="button"
                onClick={() => setTime(hour, chip.m)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 800,
                  border: '1px solid #CBD5E1',
                  background: min === chip.m ? '#E0F2FE' : '#F8FAFC',
                  color: min === chip.m ? '#0284C7' : '#475569',
                  cursor: 'pointer',
                }}
              >
                {chip.l}
              </button>
            ))}
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};
