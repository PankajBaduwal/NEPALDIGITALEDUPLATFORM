/**
 * Lesson 4 · Comparison of numbers — ascending and descending order
 * Order the Balloons — tap the balloons from smallest to biggest (or biggest to smallest).
 * Pure 2D Implementation for Smart Boards & Desktops.
 */
import React, { useEffect, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { rnd, shuffle, toNp } from '../class1-math-kit/nepali';
import { fmt } from './helpers';

interface Props { onBackToLibrary: () => void; userRole?: string }
type Dir = 'UP' | 'DOWN';

const BALLOON_COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

export const OrderBalloons: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G2-L4-02',
    chapter: 4,
    titleNp: 'बेलुन मिलाऔँ (क्रम)',
    titleEn: 'Order the Balloons (Ascending / Descending)',
  });

  const [dir, setDir] = useState<Dir>('UP');
  const [nums, setNums] = useState<number[]>([]);
  const [picked, setPicked] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState(0);

  const fresh = (d: Dir) => {
    const set = new Set<number>();
    while (set.size < 5) set.add(rnd(100, 999));
    const list = shuffle(Array.from(set));
    setNums(list);
    setPicked([]);
    setMistakes(0);
    kit.say(
      d === 'UP'
        ? 'सबैभन्दा सानोदेखि ठूलोसम्म बेलुन छोऔँ (बढ्दो क्रम)।'
        : 'सबैभन्दा ठूलोदेखि सानोसम्म बेलुन छोऔँ (घट्दो क्रम)।',
      d === 'UP'
        ? 'Tap balloons from smallest to biggest (ascending).'
        : 'Tap balloons from biggest to smallest (descending).'
    );
  };

  const sortedNums = [...nums].sort((p, q) => (dir === 'UP' ? p - q : q - p));

  const handleTap = (val: number) => {
    if (picked.includes(val)) return;
    const nextExpected = sortedNums[picked.length];
    if (val === nextExpected) {
      kit.tap();
      const nextPicked = [...picked, val];
      setPicked(nextPicked);
      kit.say(`${fmt(kit.lang, val)}`, `${val}`);

      if (nextPicked.length === nums.length) {
        kit.good('शानदार! सबै बेलुनहरू सही क्रममा मिलाउनुभयो!', 'Great job! Ordered all balloons correctly!');
        kit.star();
      }
    } else {
      kit.oops(
        dir === 'UP' ? 'अझै सानो सङ्ख्या बाँकी छ!' : 'अझै ठूलो सङ्ख्या बाँकी छ!',
        dir === 'UP' ? 'There is a smaller number!' : 'There is a greater number!'
      );
      setMistakes((v) => v + 1);
    }
  };

  const autoOrder = () => {
    setPicked([...sortedNums]);
    kit.good('सही क्रम हेर्नुहोस्!', 'See the correct order!');
  };

  useEffect(() => {
    fresh(dir);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dir, kit.mode]);

  // Quiz Questions for Challenge
  const questions: QuizQuestion[] = [
    {
      np: 'सङ्ख्याहरू 125, 340, 210 लाई बढ्दो क्रम (सानोबाट ठूलो) मा मिलाउँदा कुन सही हुन्छ?',
      en: 'Which shows 125, 340, 210 in ascending order (smallest to largest)?',
      answer: '125, 210, 340',
      options: [
        { key: '125, 210, 340', label: '125, 210, 340' },
        { key: '340, 210, 125', label: '340, 210, 125' },
        { key: '210, 125, 340', label: '210, 125, 340' },
      ],
    },
    {
      np: 'सङ्ख्याहरू 500, 850, 320 लाई घट्दो क्रम (ठूलोबाट सानो) मा मिलाउँदा कुन सही हुन्छ?',
      en: 'Which shows 500, 850, 320 in descending order (largest to smallest)?',
      answer: '850, 500, 320',
      options: [
        { key: '850, 500, 320', label: '850, 500, 320' },
        { key: '320, 500, 850', label: '320, 500, 850' },
        { key: '500, 850, 320', label: '500, 850, 320' },
      ],
    },
    {
      np: '450, 405, 540 मा सबैभन्दा सानो सङ्ख्या कुन हो?',
      en: 'Which is the smallest number among 450, 405, 540?',
      answer: '405',
      options: [
        { key: '405', label: '405' },
        { key: '450', label: '450' },
        { key: '540', label: '540' },
      ],
    },
    {
      np: '780, 708, 807 मा सबैभन्दा ठूलो सङ्ख्या कुन हो?',
      en: 'Which is the greatest number among 780, 708, 807?',
      answer: '807',
      options: [
        { key: '807', label: '807' },
        { key: '780', label: '780' },
        { key: '708', label: '708' },
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
        fontSize: 16,
        fontWeight: 900,
        color: '#26332E',
      }}
    >
      {kit.t('क्रम', 'Order')}:{' '}
      <span style={{ color: dir === 'UP' ? '#059669' : '#DC2626' }}>
        {dir === 'UP' ? kit.t('बढ्दो (सानो ➜ ठूलो)', 'Ascending (Small ➜ Big)') : kit.t('घट्दो (ठूलो ➜ सानो)', 'Descending (Big ➜ Small)')}
      </span>
    </div>
  );

  const panel = kit.mode === 'CHALLENGE' ? (
    <QuizPanel kit={kit} questions={questions} />
  ) : (
    <Controls>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => { setDir('UP'); fresh('UP'); }}
          style={{
            padding: '8px 16px',
            borderRadius: 12,
            border: 'none',
            cursor: 'pointer',
            fontWeight: 800,
            background: dir === 'UP' ? '#187C68' : '#E2E8F0',
            color: dir === 'UP' ? '#FFFFFF' : '#334155',
          }}
        >
          📈 {kit.t('बढ्दो क्रम (सानो ➜ ठूलो)', 'Ascending')}
        </button>
        <button
          type="button"
          onClick={() => { setDir('DOWN'); fresh('DOWN'); }}
          style={{
            padding: '8px 16px',
            borderRadius: 12,
            border: 'none',
            cursor: 'pointer',
            fontWeight: 800,
            background: dir === 'DOWN' ? '#187C68' : '#E2E8F0',
            color: dir === 'DOWN' ? '#FFFFFF' : '#334155',
          }}
        >
          📉 {kit.t('घट्दो क्रम (ठूलो ➜ सानो)', 'Descending')}
        </button>

        <CBtn color="#8B5CF6" onClick={autoOrder}>
          👁️ {kit.t('सही क्रम देखाऔँ', 'Show Order')}
        </CBtn>
        <CBtn color="#64748B" onClick={() => fresh(dir)}>
          🎲 {kit.t('नयाँ बेलुनहरू', 'New Balloons')}
        </CBtn>
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
        {/* Floating Balloons Container */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: 24,
            width: '100%',
            maxWidth: 880,
            flexWrap: 'wrap',
            minHeight: 280,
          }}
        >
          {nums.map((val, idx) => {
            const isPicked = picked.includes(val);
            const pickRank = picked.indexOf(val) + 1;
            const color = BALLOON_COLORS[idx % BALLOON_COLORS.length];

            return (
              <div
                key={val}
                onClick={() => handleTap(val)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: isPicked ? 'default' : 'pointer',
                  transform: isPicked ? 'translateY(-30px)' : 'none',
                  transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  position: 'relative',
                }}
              >
                {/* Picked order badge */}
                {isPicked && (
                  <div
                    style={{
                      background: '#16A34A',
                      color: '#FFFFFF',
                      borderRadius: '50%',
                      width: 28,
                      height: 28,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: 14,
                      marginBottom: 6,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    }}
                  >
                    ✓ {toNp(pickRank)}
                  </div>
                )}

                {/* SVG Balloon */}
                <svg width="110" height="150" viewBox="0 0 110 150">
                  {/* Balloon Oval */}
                  <ellipse
                    cx="55"
                    cy="60"
                    rx="48"
                    ry="55"
                    fill={color}
                    opacity={isPicked ? 0.9 : 1}
                    filter="drop-shadow(0 6px 12px rgba(0,0,0,0.15))"
                  />
                  {/* Balloon Shine */}
                  <ellipse cx="40" cy="40" rx="14" ry="20" fill="#FFFFFF" opacity="0.35" transform="rotate(-20 40 40)" />
                  {/* Balloon Knot */}
                  <polygon points="50,115 60,115 55,122" fill={color} />
                  {/* Balloon String */}
                  <path d="M55 122 Q58 135 52 148" stroke="#94A3B8" strokeWidth="2" fill="none" />
                  {/* Number Text */}
                  <text
                    x="55"
                    y="68"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="22"
                    fontWeight="900"
                    style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                  >
                    {fmt(kit.lang, val)}
                  </text>
                </svg>
              </div>
            );
          })}
        </div>

        {/* Selected sequence breadcrumbs */}
        <div
          style={{
            marginTop: 24,
            background: '#FFFFFF',
            borderRadius: 14,
            padding: '10px 20px',
            border: '1.5px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 800, color: '#64748B' }}>
            {kit.t('तपाईंको क्रम:', 'Selected:')}
          </span>
          {picked.length === 0 ? (
            <span style={{ fontSize: 13, color: '#94A3B8', fontStyle: 'italic' }}>
              {kit.t('', '(Tap balloons to order)')}
            </span>
          ) : (
            picked.map((v, i) => (
              <span key={v} style={{ fontWeight: 900, color: '#187C68', fontSize: 16 }}>
                {fmt(kit.lang, v)}
                {i < picked.length - 1 && ' ➔ '}
              </span>
            ))
          )}
        </div>
      </div>
    </SimFrame2D>
  );
};
