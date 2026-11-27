/**
 * Lesson 12 · Fraction
 * Fraction Pizza — cut a pizza into equal slices, shade/eat slices, and read the fraction (½, ⅓, ¼, ¾ …).
 * Pure 2D Implementation for Smart Boards & Desktops.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { rnd, shuffle, toNp } from '../class1-math-kit/nepali';
import { fmt } from './helpers';

interface Props { onBackToLibrary: () => void; userRole?: string }

const FRACTION_NAMES: Record<string, [string, string]> = {
  '1/2': ['आधा', 'one half'],
  '1/3': ['एक तिहाइ', 'one third'],
  '2/3': ['दुई तिहाइ', 'two thirds'],
  '1/4': ['एक चौथाइ', 'one quarter'],
  '2/4': ['दुई चौथाइ (आधा)', 'two quarters (half)'],
  '3/4': ['तीन चौथाइ', 'three quarters'],
  '4/4': ['पूरा एक', 'one whole'],
};

export const FractionPizza: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G2-L12-01',
    chapter: 12,
    titleNp: 'भिन्न पिज्जा',
    titleEn: 'Fraction Pizza',
  });

  const [parts, setParts] = useState(4); // denominator: 2, 3, 4, 6
  const [shaded, setShaded] = useState<number[]>([0]); // shaded slice indices
  const [li, setLi] = useState(0);

  const fracKey = `${shaded.length}/${parts}`;
  const fracName = FRACTION_NAMES[fracKey] || [`${toNp(shaded.length)}/${toNp(parts)}`, `${shaded.length}/${parts}`];

  const toggleSlice = (i: number) => {
    kit.tap();
    const next = shaded.includes(i) ? shaded.filter((x) => x !== i) : [...shaded, i];
    setShaded(next);
    const key = `${next.length}/${parts}`;
    const name = FRACTION_NAMES[key];
    if (name) {
      kit.say(`${name[0]}`, `${name[1]}`);
    }
  };

  const setPizzaParts = (p: number) => {
    kit.tap();
    setParts(p);
    setShaded([0]);
    kit.say(`${toNp(p)} बराबर भाग लगाइयो`, `Cut into ${p} equal parts`);
  };

  const LEARN_STEPS: [number, number[]][] = [
    [2, [0]], // 1/2
    [4, [0]], // 1/4
    [4, [0, 1]], // 2/4 = 1/2
    [4, [0, 1, 2]], // 3/4
    [3, [0]], // 1/3
    [3, [0, 1]], // 2/3
  ];

  useEffect(() => {
    if (kit.mode === 'LEARN') {
      const [p, s] = LEARN_STEPS[li % LEARN_STEPS.length];
      setParts(p);
      setShaded(s);
      const name = FRACTION_NAMES[`${s.length}/${p}`];
      if (name) {
        kit.say(
          `${toNp(s.length)}/${toNp(p)} अर्थात् ${name[0]}। पिज्जाको टुक्रा छोएर हेरौँ।`,
          `${s.length}/${p} means ${name[1]}. Tap a slice to toggle.`
        );
      }
    } else if (kit.mode === 'PLAY') {
      setParts([2, 3, 4][rnd(0, 2)]);
      setShaded([0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode, li]);

  // Quiz questions for Challenge Mode
  const questions: QuizQuestion[] = [
    {
      np: 'पिज्जालाई 2 बराबर भागमा बाँडेर 1 भाग लिँदा कुन भिन्न बन्छ?',
      en: 'What fraction is 1 slice out of 2 equal slices?',
      answer: '1/2',
      options: [
        { key: '1/2', label: '1/2' },
        { key: '1/4', label: '1/4' },
        { key: '2/3', label: '2/3' },
      ],
    },
    {
      np: 'पिज्जालाई 4 बराबर भागमा बाँडेर 1 भाग लिँदा के भनिन्छ?',
      en: 'What is 1 slice out of 4 equal slices called?',
      answer: '1/4',
      options: [
        { key: '1/4', label: '1/4' },
        { key: '1/2', label: '1/2' },
        { key: '3/4', label: '3/4' },
      ],
    },
    {
      np: '4 बराबर भागमध्ये 3 भाग छायाँ पारिएको छ भने भिन्न कति हो?',
      en: 'If 3 out of 4 equal parts are shaded, what is the fraction?',
      answer: '3/4',
      options: [
        { key: '3/4', label: '3/4' },
        { key: '1/4', label: '1/4' },
        { key: '2/4', label: '2/4' },
      ],
    },
    {
      np: '3 बराबर भागमध्ये 2 भाग खाँदा बाँकी भाग कति रहन्छ?',
      en: 'If 2 out of 3 equal parts are eaten, how much remains?',
      answer: '1/3',
      options: [
        { key: '1/3', label: '1/3' },
        { key: '2/3', label: '2/3' },
        { key: '3/3', label: '3/3' },
      ],
    },
  ];

  const hud = (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 16,
        padding: '8px 18px',
        border: '2px solid #187C68',
        boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1, fontWeight: 900, fontSize: 24, color: '#0284C7' }}>
        <span style={{ borderBottom: '2.5px solid currentColor', padding: '0 4px 2px' }}>{toNp(shaded.length)}</span>
        <span style={{ paddingTop: 2 }}>{toNp(parts)}</span>
      </div>
      <div style={{ fontSize: 16, fontWeight: 900, color: '#26332E' }}>
        {kit.lang === 'ne' ? fracName[0] : fracName[1]}
      </div>
    </div>
  );

  const panel = kit.mode === 'CHALLENGE' ? (
    <QuizPanel kit={kit} questions={questions} />
  ) : (
    <Controls>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: '#26332E' }}>
          {kit.t('बराबर भाग संख्या:', 'Equal parts:')}
        </span>
        {[2, 3, 4, 6].map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPizzaParts(p)}
            style={{
              padding: '6px 14px',
              borderRadius: 10,
              fontWeight: 900,
              fontSize: 14,
              border: 'none',
              cursor: 'pointer',
              background: parts === p ? '#187C68' : '#E2E8F0',
              color: parts === p ? '#FFFFFF' : '#334155',
            }}
          >
            {kit.lang === 'ne' ? `${toNp(p)} भाग` : `${p} slices`}
          </button>
        ))}

        <CBtn color="#059669" onClick={() => setShaded(Array.from({ length: parts }, (_, i) => i))}>
          🍕 {kit.t('सबै छान्ने (1 पूरा)', 'Select All')}
        </CBtn>
        <CBtn color="#EF4444" onClick={() => setShaded([])}>
          ↺ {kit.t('खाली गरौँ', 'Clear')}
        </CBtn>

        {kit.mode === 'LEARN' && (
          <CBtn color="#187C68" onClick={() => setLi((v) => v + 1)}>
            {kit.t('अर्को भिन्न', 'Next')} ➜
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
          flexDirection: 'column',
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
          }}
        >
          {/* Interactive SVG Pizza */}
          <svg width="280" height="280" viewBox="0 0 280 280">
            {/* Outer Plate */}
            <circle cx="140" cy="140" r="135" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="4" />
            {/* Pizza Crust */}
            <circle cx="140" cy="140" r="118" fill="#FDE68A" stroke="#D97706" strokeWidth="5" />

            {/* Slices */}
            {Array.from({ length: parts }).map((_, i) => {
              const startAngle = (i * 2 * Math.PI) / parts - Math.PI / 2;
              const endAngle = ((i + 1) * 2 * Math.PI) / parts - Math.PI / 2;
              const r = 110;
              const x1 = 140 + r * Math.cos(startAngle);
              const y1 = 140 + r * Math.sin(startAngle);
              const x2 = 140 + r * Math.cos(endAngle);
              const y2 = 140 + r * Math.sin(endAngle);

              const largeArcFlag = 1 / parts > 0.5 ? 1 : 0;
              const pathD = `M 140 140 L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
              const isShaded = shaded.includes(i);

              return (
                <g key={i} onClick={() => toggleSlice(i)} style={{ cursor: 'pointer' }}>
                  <path
                    d={pathD}
                    fill={isShaded ? '#EF4444' : '#FBBF24'}
                    stroke="#B45309"
                    strokeWidth="2.5"
                    style={{
                      transition: 'all 0.2s ease',
                      opacity: isShaded ? 0.95 : 0.8,
                    }}
                  />
                  {/* Toppings in slice */}
                  {(() => {
                    const midAng = (startAngle + endAngle) / 2;
                    const tx = 140 + (r * 0.6) * Math.cos(midAng);
                    const ty = 140 + (r * 0.6) * Math.sin(midAng);
                    return (
                      <circle
                        cx={tx}
                        cy={ty}
                        r="6"
                        fill={isShaded ? '#991B1B' : '#DC2626'}
                        stroke="#7F1D1D"
                        strokeWidth="1.5"
                      />
                    );
                  })()}
                </g>
              );
            })}

            {/* Center Pin */}
            <circle cx="140" cy="140" r="8" fill="#D97706" />
          </svg>

          <div style={{ fontSize: 13, color: '#64748B', fontWeight: 800 }}>
            {kit.t('पिज्जाको टुक्रा छोएर भिन्न बदल्नुहोस्', 'Tap a slice to shade or unshade')}
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};
