/**
 * Lesson 4 · Comparison of numbers
 * Number Seesaw — the bigger number pulls its side down. Choose >, < or =.
 * Pure 2D Implementation for Smart Boards & Desktops.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { rnd, shuffle } from '../class1-math-kit/nepali';
import { fmt } from './helpers';

interface Props { onBackToLibrary: () => void; userRole?: string }

const PAIRS = [
  [345, 298],
  [512, 521],
  [407, 407],
  [680, 86],
  [199, 201],
  [750, 705],
];

const SYM = (a: number, b: number) => (a > b ? '>' : a < b ? '<' : '=');

export const NumberSeesaw: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G2-L4-01',
    chapter: 4,
    titleNp: 'सङ्ख्याको झुला (तुलना)',
    titleEn: 'Number Seesaw (Comparing Numbers)',
  });

  const [a, setA] = useState(345);
  const [b, setB] = useState(298);
  const [li, setLi] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);

  const applyPair = (x: number, y: number) => {
    setA(x);
    setB(y);
    setPicked(null);
  };

  useEffect(() => {
    if (kit.mode === 'LEARN') {
      const [x, y] = PAIRS[li % PAIRS.length];
      applyPair(x, y);
      kit.say(
        x === y
          ? `${fmt('ne', x)} र ${fmt('ne', y)} बराबर छन्।`
          : `${fmt('ne', Math.max(x, y))} ठूलो छ, ${fmt('ne', Math.min(x, y))} सानो।`,
        x === y
          ? `${x} and ${y} are equal.`
          : `${Math.max(x, y)} is greater than ${Math.min(x, y)}.`
      );
    } else if (kit.mode === 'PLAY') {
      applyPair(a, b);
      kit.say('सङ्ख्या बदल्नुहोस् र झुला कता ढल्किन्छ हेर्नुहोस्।', 'Change the numbers and observe which side tilts down.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode, li]);

  const stepVal = (side: 'a' | 'b', delta: number) => {
    kit.tap();
    if (side === 'a') {
      setA((v) => Math.max(0, Math.min(999, v + delta)));
    } else {
      setB((v) => Math.max(0, Math.min(999, v + delta)));
    }
  };

  const handleGuess = (symbol: string) => {
    const correct = SYM(a, b);
    setPicked(symbol);
    if (symbol === correct) {
      kit.good(
        `स्याबास! ${fmt('ne', a)} ${symbol} ${fmt('ne', b)} सही हो!`,
        `Correct! ${a} ${symbol} ${b}`
      );
      kit.star();
    } else {
      kit.oops('फेरि ध्यान दिएर हेरौँ, ठूलो सङ्ख्याको पल्ला तल जान्छ', 'Look carefully! The heavier/greater side tilts down.');
    }
  };

  // Seesaw tilt angle
  const tiltAngle = a === b ? 0 : a > b ? 12 : -12;

  // Quiz questions for Challenge Mode
  const data = useMemo(() => Array.from({ length: 6 }, () => {
    const same = rnd(0, 3) === 0;
    const x = rnd(50, 990);
    const y = same ? x : x + rnd(-40, 40);
    return { x, y: Math.max(10, Math.min(999, y)) };
  }), []);

  const questions: (QuizQuestion & { x: number; y: number })[] = data.map((d) => ({
    np: `${fmt('ne', d.x)} ___ ${fmt('ne', d.y)} मा कुन चिह्न मिल्छ?`,
    en: `Which sign completes ${d.x} ___ ${d.y}?`,
    x: d.x,
    y: d.y,
    answer: SYM(d.x, d.y),
    options: ['>', '<', '='].map((s) => ({ key: s, label: s })),
  }));

  const hud = (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 16,
        padding: '8px 18px',
        border: '2px solid #187C68',
        boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
        fontSize: 22,
        fontWeight: 900,
        color: '#26332E',
      }}
    >
      <span style={{ color: '#0284C7' }}>{fmt(kit.lang, a)}</span>{' '}
      <span style={{ color: '#187C68', padding: '0 6px' }}>{SYM(a, b)}</span>{' '}
      <span style={{ color: '#E11D48' }}>{fmt(kit.lang, b)}</span>
    </div>
  );

  const panel = kit.mode === 'CHALLENGE' ? (
    <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => applyPair(q.x, q.y)} />
  ) : (
    <Controls>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Comparison guess buttons */}
        <div style={{ display: 'inline-flex', gap: 6 }}>
          {['>', '=', '<'].map((sym) => {
            const isRight = picked && sym === SYM(a, b);
            const isWrong = picked === sym && sym !== SYM(a, b);
            return (
              <button
                key={sym}
                type="button"
                onClick={() => handleGuess(sym)}
                style={{
                  width: 50,
                  height: 48,
                  borderRadius: 12,
                  fontSize: 24,
                  fontWeight: 900,
                  border: 'none',
                  cursor: 'pointer',
                  background: isRight ? '#16A34A' : isWrong ? '#DC2626' : '#187C68',
                  color: '#FFFFFF',
                  boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
                }}
              >
                {sym}
              </button>
            );
          })}
        </div>

        {/* Adjust A */}
        <div style={{ display: 'inline-flex', gap: 4, background: '#EFF6FF', padding: '4px 8px', borderRadius: 10, border: '1px solid #BFDBFE' }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#0284C7', alignSelf: 'center', marginRight: 4 }}>
            {kit.t('बायाँ', 'Left')}:
          </span>
          <CBtn color="#0284C7" onClick={() => stepVal('a', 10)}>+10</CBtn>
          <CBtn color="#0284C7" onClick={() => stepVal('a', -10)}>-10</CBtn>
        </div>

        {/* Adjust B */}
        <div style={{ display: 'inline-flex', gap: 4, background: '#FFF1F2', padding: '4px 8px', borderRadius: 10, border: '1px solid #FECDD3' }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#E11D48', alignSelf: 'center', marginRight: 4 }}>
            {kit.t('दायाँ', 'Right')}:
          </span>
          <CBtn color="#E11D48" onClick={() => stepVal('b', 10)}>+10</CBtn>
          <CBtn color="#E11D48" onClick={() => stepVal('b', -10)}>-10</CBtn>
        </div>

        {kit.mode === 'LEARN' && (
          <CBtn color="#187C68" onClick={() => setLi((v) => v + 1)}>
            {kit.t('अर्को जोडी', 'Next Pair')} ➜
          </CBtn>
        )}

        {kit.mode === 'PLAY' && (
          <CBtn color="#D97706" onClick={() => applyPair(rnd(50, 950), rnd(50, 950))}>
            🎲 {kit.t('नयाँ सङ्ख्या', 'Random Pair')}
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
            width: '100%',
            maxWidth: 820,
            background: '#FFFFFF',
            borderRadius: 24,
            padding: '40px 30px',
            border: '2px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Seesaw SVG */}
          <svg width="680" height="260" viewBox="0 0 680 260">
            {/* Ground */}
            <line x1="20" y1="230" x2="660" y2="230" stroke="#CBD5E1" strokeWidth="4" strokeLinecap="round" />

            {/* Fulcrum (Center Triangle Support) */}
            <polygon points="340,140 300,230 380,230" fill="#64748B" stroke="#334155" strokeWidth="3" />
            <circle cx="340" cy="140" r="10" fill="#F59E0B" stroke="#B45309" strokeWidth="3" />

            {/* Tilting Beam and Platforms */}
            <g
              transform={`rotate(${tiltAngle} 340 140)`}
              style={{ transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            >
              {/* Wooden Plank Beam */}
              <rect x="60" y="132" width="560" height="16" rx="8" fill="#FBBF24" stroke="#D97706" strokeWidth="3" />

              {/* Left Pedestal & Box */}
              <g transform="translate(100, 40)">
                <rect x="0" y="0" width="110" height="92" rx="12" fill="#E0F2FE" stroke="#0284C7" strokeWidth="3" />
                <text x="55" y="44" textAnchor="middle" fill="#0284C7" fontSize="24" fontWeight="900">
                  {fmt(kit.lang, a)}
                </text>
                <text x="55" y="70" textAnchor="middle" fill="#64748B" fontSize="12" fontWeight="700">
                  {kit.t('बायाँ पल्ला', 'Left Pan')}
                </text>
              </g>

              {/* Right Pedestal & Box */}
              <g transform="translate(470, 40)">
                <rect x="0" y="0" width="110" height="92" rx="12" fill="#FFE4E6" stroke="#E11D48" strokeWidth="3" />
                <text x="55" y="44" textAnchor="middle" fill="#E11D48" fontSize="24" fontWeight="900">
                  {fmt(kit.lang, b)}
                </text>
                <text x="55" y="70" textAnchor="middle" fill="#64748B" fontSize="12" fontWeight="700">
                  {kit.t('दायाँ पल्ला', 'Right Pan')}
                </text>
              </g>

              {/* Center Sign Indicator on Beam */}
              <circle cx="340" cy="115" r="22" fill="#FFFFFF" stroke="#187C68" strokeWidth="3" />
              <text x="340" y="124" textAnchor="middle" fill="#187C68" fontSize="24" fontWeight="900">
                {SYM(a, b)}
              </text>
            </g>
          </svg>

          <div style={{ marginTop: 16, fontSize: 14, fontWeight: 800, color: '#64748B', textAlign: 'center' }}>
            {a > b
              ? kit.t(`👈 ${fmt('ne', a)} ठूलो भएकोले बायाँतिर झुला तल गयो`, `👈 Left side tilted down because ${a} > ${b}`)
              : a < b
                ? kit.t(`👉 ${fmt('ne', b)} ठूलो भएकोले दायाँतिर झुला तल गयो`, `👉 Right side tilted down because ${b} > ${a}`)
                : kit.t('⚖️ दुवै सङ्ख्या बराबर भएकोले झुला सन्तुलित छ', '⚖️ Both numbers are equal, so seesaw is balanced')}
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};
