/**
 * Lesson 4 · Number patterns
 * Pattern Train — wagons follow an arithmetic rule (add or subtract); find the missing wagon number!
 * Pure 2D Implementation for Smart Boards & Desktops.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { rnd, toNp } from '../class1-math-kit/nepali';
import { big, fmt, near } from './h3';

interface Props { onBackToLibrary: () => void; userRole?: string }
interface Pat { start: number; step: number; hide: number }

const mkPattern = (): Pat => {
  const step = [2, 3, 5, 10, 25, 100, 250, 1000][rnd(0, 7)] * (rnd(0, 2) ? 1 : -1);
  const start = step > 0 ? rnd(1, 40) * (Math.abs(step) >= 100 ? 10 : 1) : rnd(0, 20) * Math.abs(step) + Math.abs(step) * 8;
  return { start, step, hide: rnd(1, 5) };
};

const getSequence = (p: Pat) => Array.from({ length: 7 }, (_, i) => p.start + p.step * i);

const WAGON_COLORS = ['#EF4444', '#F97316', '#EAB308', '#10B981', '#06B6D4', '#3B82F6', '#8B5CF6'];

export const PatternTrain: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G3-L4-01',
    chapter: 4,
    titleNp: 'ढाँचा रेल',
    titleEn: 'Pattern Train',
  });

  const [pat, setPat] = useState<Pat>({ start: 5, step: 5, hide: 3 });
  const [revealed, setRevealed] = useState(false);
  const [selectedGuess, setSelectedGuess] = useState<number | null>(null);

  const seq = getSequence(pat);
  const answer = seq[Math.max(0, pat.hide)];

  const ruleText = pat.step > 0 ? `+${pat.step}` : `−${Math.abs(pat.step)}`;

  const newTrain = (hide = true) => {
    const p = mkPattern();
    if (!hide) p.hide = -1;
    setPat(p);
    setRevealed(!hide);
    setSelectedGuess(null);
    kit.say(
      `ढाँचाको नियम: हरेक पटक ${p.step > 0 ? 'जोड्ने' : 'घटाउने'} ${toNp(Math.abs(p.step))}`,
      `Rule: ${p.step > 0 ? 'add' : 'subtract'} ${Math.abs(p.step)} each time`
    );
  };

  const handlePickOption = (val: number) => {
    setSelectedGuess(val);
    if (val === answer) {
      setRevealed(true);
      kit.good('शानदार! ढाँचा पत्ता लगाउनुभयो!', 'Great job! Pattern matched!');
      kit.star();
    } else {
      kit.oops(`नियम ${ruleText} हो। फेरि प्रयास गरौँ!`, `The rule is ${ruleText}. Try again!`);
    }
  };

  useEffect(() => {
    if (kit.mode === 'LEARN') {
      newTrain(false);
    } else if (kit.mode === 'PLAY') {
      newTrain(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode]);

  const options = useMemo(() => {
    return near(answer, pat.start + 4, [Math.abs(pat.step), -Math.abs(pat.step), 2 * Math.abs(pat.step), 1, -1]);
  }, [answer, pat.start, pat.step]);

  // Quiz Questions for Challenge Mode
  const quizData = useMemo(() => Array.from({ length: 6 }, () => {
    const p = mkPattern();
    return { p, s: getSequence(p) };
  }), []);

  const questions: QuizQuestion[] = quizData.map((d) => {
    const hiddenVal = d.s[d.p.hide];
    const displaySeq = d.s.map((v, i) => (i === d.p.hide ? '?' : toNp(v))).join(', ');
    return {
      np: `ढाँचा ${displaySeq} मा '?' को ठाउँमा कुन सङ्ख्या आउँछ?`,
      en: `In sequence ${displaySeq}, what number replaces '?'?`,
      answer: String(hiddenVal),
      options: near(hiddenVal, d.p.start + 7, [Math.abs(d.p.step), -Math.abs(d.p.step), 10]).map((v) => ({
        key: String(v),
        label: toNp(v),
      })),
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
        fontSize: 16,
        fontWeight: 900,
        color: '#26332E',
      }}
    >
      {kit.t('ढाँचाको नियम', 'Pattern Rule')}:{' '}
      <span style={{ color: '#059669', fontSize: 18 }}>{toNp(ruleText)}</span>
    </div>
  );

  const panel = kit.mode === 'CHALLENGE' ? (
    <QuizPanel kit={kit} questions={questions} />
  ) : (
    <Controls>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Choices if wagon is hidden */}
        {!revealed && (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#26332E' }}>
              {kit.t('? को उत्तर छान्नुहोस्:', 'Choose ? value:')}
            </span>
            {options.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handlePickOption(val)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 900,
                  border: 'none',
                  cursor: 'pointer',
                  background: selectedGuess === val ? (val === answer ? '#16A34A' : '#DC2626') : '#0284C7',
                  color: '#FFFFFF',
                }}
              >
                {toNp(val)}
              </button>
            ))}
          </div>
        )}

        <CBtn color="#8B5CF6" onClick={() => setRevealed(true)}>
          👁️ {kit.t('उत्तर देखाऔँ', 'Reveal')}
        </CBtn>
        <CBtn color="#D97706" onClick={() => newTrain(kit.mode === 'PLAY')}>
          🎲 {kit.t('नयाँ रेल', 'New Train')}
        </CBtn>
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
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          gap: 20,
        }}
      >
        {/* 2D Train on Tracks */}
        <div
          style={{
            width: '100%',
            maxWidth: 960,
            background: '#FFFFFF',
            borderRadius: 24,
            padding: '40px 24px',
            border: '2px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
            overflowX: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Engine & Wagons Row */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, minWidth: 800 }}>
            {/* Locomotive Engine */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: 24, marginBottom: -6 }}>💨</span>
              <svg width="90" height="74" viewBox="0 0 90 74">
                <rect x="10" y="20" width="70" height="38" rx="6" fill="#1E293B" />
                <rect x="50" y="6" width="28" height="20" rx="4" fill="#334155" />
                <circle cx="28" cy="62" r="10" fill="#64748B" stroke="#0F172A" strokeWidth="2" />
                <circle cx="62" cy="62" r="10" fill="#64748B" stroke="#0F172A" strokeWidth="2" />
                <polygon points="10,40 0,46 10,52" fill="#F59E0B" />
              </svg>
            </div>

            {/* 7 Wagons */}
            {seq.map((val, idx) => {
              const isHidden = !revealed && idx === pat.hide;
              const color = WAGON_COLORS[idx % WAGON_COLORS.length];

              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {/* Step difference connector badge */}
                  {idx > 0 && (
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 900,
                        color: '#64748B',
                        background: '#F1F5F9',
                        borderRadius: 4,
                        padding: '1px 4px',
                        marginBottom: 4,
                      }}
                    >
                      {toNp(ruleText)}
                    </div>
                  )}

                  {/* Wagon SVG */}
                  <svg width="86" height="74" viewBox="0 0 86 74">
                    <rect
                      x="4"
                      y="16"
                      width="78"
                      height="42"
                      rx="8"
                      fill={isHidden ? '#FEF3C7' : color}
                      stroke={isHidden ? '#D97706' : '#1E293B'}
                      strokeWidth="2.5"
                    />
                    <text
                      x="43"
                      y="44"
                      textAnchor="middle"
                      fill={isHidden ? '#B45309' : '#FFFFFF'}
                      fontSize="16"
                      fontWeight="900"
                    >
                      {isHidden ? '?' : toNp(val)}
                    </text>
                    {/* Wheels */}
                    <circle cx="24" cy="62" r="8" fill="#475569" stroke="#1E293B" strokeWidth="2" />
                    <circle cx="62" cy="62" r="8" fill="#475569" stroke="#1E293B" strokeWidth="2" />
                  </svg>
                </div>
              );
            })}
          </div>

          {/* Railway Tracks SVG */}
          <svg width="100%" height="24" viewBox="0 0 860 24" style={{ maxWidth: 860, marginTop: -6 }}>
            <line x1="10" y1="6" x2="850" y2="6" stroke="#475569" strokeWidth="3" />
            <line x1="10" y1="18" x2="850" y2="18" stroke="#475569" strokeWidth="3" />
            {Array.from({ length: 42 }).map((_, i) => (
              <line key={i} x1={20 + i * 20} y1="2" x2={20 + i * 20} y2="22" stroke="#94A3B8" strokeWidth="2.5" />
            ))}
          </svg>
        </div>
      </div>
    </SimFrame2D>
  );
};
