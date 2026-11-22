/**
 * Lesson 5 · Ascending and descending order (बढ्दो र घट्दो क्रम)
 * Order the Rockets — tap rockets from smallest to biggest (ascending) or biggest to smallest (descending).
 * Pure 2D Implementation for Smart Boards & Desktops.
 */
import React, { useEffect, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { rnd, shuffle, toNp } from '../class1-math-kit/nepali';
import { big } from './h3';

interface Props { onBackToLibrary: () => void; userRole?: string }

const ROCKET_COLORS = ['#EF4444', '#F97316', '#EAB308', '#10B981', '#0EA5E9'];

const generateFiveNumbers = (count = 5): number[] => {
  const set = new Set<number>();
  while (set.size < count) {
    set.add(rnd(1200, 98000));
  }
  return Array.from(set);
};

export const OrderRockets: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G3-L5-01',
    chapter: 5,
    titleNp: 'रकेट मिलाऔँ',
    titleEn: 'Order the Rockets',
  });

  const [vals, setVals] = useState<number[]>(() => generateFiveNumbers());
  const [isAscending, setIsAscending] = useState(true);
  const [picked, setPicked] = useState<number[]>([]);

  const freshRockets = (asc: boolean) => {
    const list = generateFiveNumbers();
    setVals(list);
    setPicked([]);
    setIsAscending(asc);
    kit.say(
      asc ? 'सबैभन्दा सानो सङ्ख्या भएको रकेटबाट सुरु गरौँ।' : 'सबैभन्दा ठूलो सङ्ख्या भएको रकेटबाट सुरु गरौँ।',
      asc ? 'Start with the smallest rocket.' : 'Start with the biggest rocket.'
    );
  };

  const sortedVals = [...vals].sort((a, b) => (isAscending ? a - b : b - a));

  const handleTapRocket = (num: number) => {
    if (picked.includes(num)) return;
    const nextExpected = sortedVals[picked.length];

    if (num === nextExpected) {
      kit.tap();
      const nextPicked = [...picked, num];
      setPicked(nextPicked);
      kit.say(`${toNp(num.toLocaleString('en-US'))}`, `${num.toLocaleString('en-US')}`);

      if (nextPicked.length === vals.length) {
        kit.good('शानदार! सबै रकेटहरू सही क्रममा मिलाउनुभयो!', 'Great job! All rockets ordered correctly!');
        kit.star();
      }
    } else {
      kit.oops(
        isAscending ? 'अझै सानो सङ्ख्या भएको रकेट बाँकी छ!' : 'अझै ठूलो सङ्ख्या भएको रकेट बाँकी छ!',
        isAscending ? 'Pick the smallest rocket left!' : 'Pick the largest rocket left!'
      );
    }
  };

  const autoOrder = () => {
    setPicked([...sortedVals]);
    kit.good('सही क्रम हेर्नुहोस्!', 'See the correct order!');
  };

  useEffect(() => {
    freshRockets(isAscending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode]);

  // Quiz Questions for Challenge Mode
  const questions: QuizQuestion[] = [
    {
      np: 'सङ्ख्याहरू १२,०००; ५४,०००; ३२,००० लाई बढ्दो क्रममा मिलाउँदा कुन सही हुन्छ?',
      en: 'Which order is ascending for 12000, 54000, 32000?',
      answer: '12000, 32000, 54000',
      options: [
        { key: '12000, 32000, 54000', label: '१२,००० < ३२,००० < ५४,०००' },
        { key: '54000, 32000, 12000', label: '५४,००० < ३२,००० < १२,०००' },
        { key: '32000, 12000, 54000', label: '३२,००० < १२,००० < ५४,०००' },
      ],
    },
    {
      np: 'सङ्ख्याहरू ८०,०००; ९५,०००; ४५,००० मा सबैभन्दा ठूलो सङ्ख्या कुन हो?',
      en: 'Which is the largest among 80000, 95000, 45000?',
      answer: '95000',
      options: [
        { key: '95000', label: '९५,०००' },
        { key: '80000', label: '८०,०००' },
        { key: '45000', label: '४५,०००' },
      ],
    },
    {
      np: '६५,४०० र ६५,०४० मा कुन सङ्ख्या ठूलो छ?',
      en: 'Which is greater: 65400 or 65040?',
      answer: '65400',
      options: [
        { key: '65400', label: '६५,४००' },
        { key: '65040', label: '६५,०४०' },
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
      <span style={{ color: isAscending ? '#059669' : '#DC2626' }}>
        {isAscending ? kit.t('बढ्दो (सानो ➜ ठूलो)', 'Ascending') : kit.t('घट्दो (ठूलो ➜ सानो)', 'Descending')}
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
          onClick={() => freshRockets(true)}
          style={{
            padding: '8px 16px',
            borderRadius: 12,
            border: 'none',
            cursor: 'pointer',
            fontWeight: 800,
            background: isAscending ? '#187C68' : '#E2E8F0',
            color: isAscending ? '#FFFFFF' : '#334155',
          }}
        >
          🚀 {kit.t('बढ्दो क्रम (सानो ➜ ठूलो)', 'Ascending')}
        </button>
        <button
          type="button"
          onClick={() => freshRockets(false)}
          style={{
            padding: '8px 16px',
            borderRadius: 12,
            border: 'none',
            cursor: 'pointer',
            fontWeight: 800,
            background: !isAscending ? '#187C68' : '#E2E8F0',
            color: !isAscending ? '#FFFFFF' : '#334155',
          }}
        >
          🛬 {kit.t('घट्दो क्रम (ठूलो ➜ सानो)', 'Descending')}
        </button>

        <CBtn color="#8B5CF6" onClick={autoOrder}>
          👁️ {kit.t('सही क्रम देखाऔँ', 'Show Order')}
        </CBtn>
        <CBtn color="#D97706" onClick={() => freshRockets(isAscending)}>
          🎲 {kit.t('नयाँ रकेटहरू', 'Random')}
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
        {/* Rockets Launchpad */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            gap: 20,
            width: '100%',
            maxWidth: 900,
            flexWrap: 'wrap',
            minHeight: 280,
          }}
        >
          {vals.map((num, idx) => {
            const isPicked = picked.includes(num);
            const rank = picked.indexOf(num) + 1;
            const color = ROCKET_COLORS[idx % ROCKET_COLORS.length];

            return (
              <div
                key={num}
                onClick={() => handleTapRocket(num)}
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
                {/* Launched Order Badge */}
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
                    }}
                  >
                    ✓ {toNp(rank)}
                  </div>
                )}

                {/* SVG 2D Rocket */}
                <svg width="100" height="180" viewBox="0 0 100 180">
                  {/* Nose Cone */}
                  <polygon points="50,10 20,60 80,60" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.5" />
                  {/* Rocket Body */}
                  <rect x="22" y="60" width="56" height="80" rx="8" fill={color} stroke="#1E293B" strokeWidth="2.5" />
                  {/* Fins */}
                  <polygon points="22,100 2,140 22,130" fill="#334155" />
                  <polygon points="78,100 98,140 78,130" fill="#334155" />
                  {/* Exhaust Flame if launched */}
                  {isPicked && (
                    <polygon points="35,140 50,175 65,140" fill="#F59E0B" opacity="0.9" />
                  )}
                  {/* Porthole */}
                  <circle cx="50" cy="85" r="14" fill="#E0F2FE" stroke="#1E293B" strokeWidth="2" />
                </svg>

                {/* Number Card beneath rocket */}
                <div
                  style={{
                    background: '#FFFFFF',
                    border: `2px solid ${color}`,
                    borderRadius: 10,
                    padding: '4px 8px',
                    fontSize: 14,
                    fontWeight: 900,
                    color: '#1E293B',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                    marginTop: -6,
                  }}
                >
                  {toNp(num.toLocaleString('en-US'))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SimFrame2D>
  );
};
