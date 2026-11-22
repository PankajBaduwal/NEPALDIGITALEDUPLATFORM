/**
 * Lesson 1 · Time 1 (समय १) — hour and minute
 * Minute Clock — read any time on an interactive 2D clock: o'clock, half past, quarter past, quarter to and every minute in between.
 * Pure 2D Implementation for Smart Boards & Desktops.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { enName, npName, shuffle, rnd, toNp } from '../class1-math-kit/nepali';
import { fmt } from './h3';

interface Props { onBackToLibrary: () => void; userRole?: string }

const nxt = (h: number) => (h % 12) + 1;
const phrase = (h: number, m: number, lang: 'ne' | 'en') => {
  const h2 = h % 12 || 12;
  if (lang === 'en') {
    return m === 0
      ? `${enName(h2)} o'clock`
      : m === 15
        ? `quarter past ${enName(h2)}`
        : m === 30
          ? `half past ${enName(h2)}`
          : m === 45
            ? `quarter to ${enName(nxt(h2))}`
            : `${m} minutes past ${enName(h2)}`;
  }
  return m === 0
    ? `${npName(h2)} बजे`
    : m === 15
      ? `सवा ${npName(h2)}`
      : m === 30
        ? `साढे ${npName(h2)}`
        : m === 45
          ? `पौने ${npName(nxt(h2))}`
          : `${npName(h2)} बजेर ${toNp(m)} मिनेट`;
};

const STEPS: [number, number][] = [
  [10, 0],
  [3, 30],
  [7, 15],
  [5, 45],
  [11, 24],
  [2, 50],
  [8, 7],
];

export const ClockMinutes: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G3-L1-01',
    chapter: 1,
    titleNp: 'मिनेट घडी (समय १)',
    titleEn: 'Minute Clock (Time 1)',
  });

  const [h, setH] = useState(10);
  const [m, setM] = useState(0);
  const [li, setLi] = useState(0);

  const setClock = (hh: number, mm: number, speak = true) => {
    const H = ((hh - 1 + 12) % 12) + 1;
    const M = ((mm % 60) + 60) % 60;
    setH(H);
    setM(M);
    if (speak) kit.say(phrase(H, M, 'ne'), phrase(H, M, 'en'));
  };

  const bumpMinutes = (dm: number) => {
    const totalM = (h % 12) * 60 + m + dm;
    const wrappedM = ((totalM % 720) + 720) % 720;
    setClock(Math.floor(wrappedM / 60) || 12, wrappedM % 60);
  };

  useEffect(() => {
    if (kit.mode === 'LEARN') {
      const [a, b] = STEPS[li % STEPS.length];
      setClock(a, b);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode, li]);

  // Clock Hand angles
  const minuteAngle = m * 6;
  const hourAngle = (h % 12) * 30 + (m / 60) * 30;

  // Quiz questions for Challenge Mode
  const data = useMemo(() => Array.from({ length: 8 }, () => ({
    h: rnd(1, 12),
    m: [0, 15, 30, 45, rnd(1, 59), rnd(1, 59)][rnd(0, 5)],
  })), []);

  const questions: (QuizQuestion & { h: number; m: number })[] = data.map((d, i) => {
    const key = (hh: number, mm: number) => `${hh}:${mm}`;
    const wrong = new Set<string>();
    let g = 0;
    while (wrong.size < 2 && g++ < 80) {
      const w = key(rnd(0, 1) ? d.h : rnd(1, 12), rnd(0, 1) ? d.m : rnd(0, 59));
      if (w !== key(d.h, d.m)) wrong.add(w);
    }
    return {
      np: 'घडीमा कति बजेको छ?',
      en: 'What time does the clock show?',
      h: d.h,
      m: d.m,
      answer: key(d.h, d.m),
      options: shuffle([key(d.h, d.m), ...Array.from(wrong)], i * 11 + 3).map((k) => {
        const [hh, mm] = k.split(':').map(Number);
        return {
          key: k,
          label: `${fmt(kit.lang, hh)}:${fmt(kit.lang, String(mm).padStart(2, '0'))}`,
        };
      }),
    };
  });

  const hud = kit.mode === 'CHALLENGE' ? null : (
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
      <div style={{ fontSize: 26, fontWeight: 900, color: '#187C68' }}>
        {fmt(kit.lang, h)}:{fmt(kit.lang, String(m).padStart(2, '0'))}
      </div>
      <div style={{ fontSize: 13, fontWeight: 800, color: '#26332E' }}>
        {phrase(h, m, kit.lang)}
      </div>
    </div>
  );

  const panel = kit.mode === 'CHALLENGE' ? (
    <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => setClock(q.h, q.m, false)} />
  ) : (
    <Controls>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <CBtn color="#0284C7" onClick={() => bumpMinutes(60)}>+१ {kit.t('घण्टा', 'hour')}</CBtn>
        <CBtn color="#0284C7" onClick={() => bumpMinutes(-60)}>-१ {kit.t('घण्टा', 'hour')}</CBtn>
        <CBtn color="#10B981" onClick={() => bumpMinutes(5)}>+५ {kit.t('मिनेट', 'min')}</CBtn>
        <CBtn color="#10B981" onClick={() => bumpMinutes(-5)}>-५ {kit.t('मिनेट', 'min')}</CBtn>
        <CBtn color="#8B5CF6" onClick={() => bumpMinutes(1)}>+१ {kit.t('मिनेट', 'min')}</CBtn>
        <CBtn color="#8B5CF6" onClick={() => bumpMinutes(-1)}>-१ {kit.t('मिनेट', 'min')}</CBtn>

        {kit.mode === 'LEARN' && (
          <CBtn color="#187C68" onClick={() => setLi((v) => v + 1)}>
            {kit.t('अर्को समय', 'Next')} ➜
          </CBtn>
        )}
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
            boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          {/* SVG Clock with All 60 Minute Ticks */}
          <svg width="280" height="280" viewBox="0 0 280 280">
            <circle cx="140" cy="140" r="130" fill="#F8FAFC" stroke="#187C68" strokeWidth="8" />
            <circle cx="140" cy="140" r="122" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />

            {/* 60 Minute Ticks */}
            {Array.from({ length: 60 }).map((_, i) => {
              const ang = (i * 6 * Math.PI) / 180;
              const isMajor = i % 5 === 0;
              const r1 = isMajor ? 104 : 112;
              const r2 = 120;
              return (
                <line
                  key={i}
                  x1={140 + Math.sin(ang) * r1}
                  y1={140 - Math.cos(ang) * r1}
                  x2={140 + Math.sin(ang) * r2}
                  y2={140 - Math.cos(ang) * r2}
                  stroke={isMajor ? '#1E293B' : '#94A3B8'}
                  strokeWidth={isMajor ? 3 : 1.2}
                />
              );
            })}

            {/* 12 Hour Numbers */}
            {Array.from({ length: 12 }).map((_, i) => {
              const num = i + 1;
              const ang = (num * 30 * Math.PI) / 180;
              const r = 90;
              return (
                <text
                  key={num}
                  x={140 + Math.sin(ang) * r}
                  y={140 - Math.cos(ang) * r + 7}
                  textAnchor="middle"
                  fill="#1E293B"
                  fontSize="20"
                  fontWeight="900"
                >
                  {kit.lang === 'ne' ? toNp(num) : num}
                </text>
              );
            })}

            {/* Hour Hand */}
            <g transform={`rotate(${hourAngle} 140 140)`}>
              <line x1="140" y1="140" x2="140" y2="76" stroke="#0284C7" strokeWidth="7" strokeLinecap="round" />
            </g>

            {/* Minute Hand */}
            <g transform={`rotate(${minuteAngle} 140 140)`}>
              <line x1="140" y1="140" x2="140" y2="48" stroke="#EF4444" strokeWidth="4.5" strokeLinecap="round" />
            </g>

            <circle cx="140" cy="140" r="7" fill="#187C68" />
            <circle cx="140" cy="140" r="3" fill="#FFFFFF" />
          </svg>
        </div>
      </div>
    </SimFrame2D>
  );
};
