/**
 * Lesson 21 · Pictograph
 * PictoScale — 2D interactive scaled pictograph where 1 icon stands for 2, 5, or 10 items.
 */
import React, { useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { rnd, shuffle } from '../class1-math-kit/nepali';
import { fmt, near } from './h3';

interface Props { onBackToLibrary: () => void; userRole?: string }

interface FruitCategory {
  id: number;
  np: string;
  en: string;
  emoji: string;
  color: string;
}

const CATS: FruitCategory[] = [
  { id: 0, np: 'स्याउ', en: 'Apple', emoji: '🍎', color: '#EF4444' },
  { id: 1, np: 'केरा', en: 'Banana', emoji: '🍌', color: '#EAB308' },
  { id: 2, np: 'सुन्तला', en: 'Orange', emoji: '🍊', color: '#F97316' },
  { id: 3, np: 'अङ्गुर', en: 'Grapes', emoji: '🍇', color: '#8B5CF6' },
];

const genData = (scale: number): number[] => {
  return CATS.map(() => rnd(1, 6) * scale + (rnd(0, 1) && scale % 2 === 0 ? scale / 2 : 0));
};

export const PictoScale: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G3-L21-01',
    chapter: 21,
    titleNp: 'चित्रचार्ट पढौँ (स्केल अनुसार)',
    titleEn: 'Picture Graph (With Scale)',
  });

  const [scale, setScale] = useState(5);
  const [vals, setVals] = useState<number[]>([15, 25, 10, 20]);

  const maxVal = Math.max(...vals);
  const bestIdx = vals.indexOf(maxVal);

  const applyScale = (newScale: number) => {
    setScale(newScale);
    setVals(genData(newScale));
    kit.tap();
    kit.say(`स्केल: 1 वृत्त = ${newScale}`, `Scale: 1 circle = ${newScale} items`);
  };

  const fresh = () => {
    setVals(genData(scale));
    kit.tap();
  };

  const questions: QuizQuestion[] = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const qScale = [2, 5, 10][i % 3];
      const qVals = genData(qScale);
      const catIdx = i % CATS.length;
      const count = qVals[catIdx];
      const maxI = qVals.indexOf(Math.max(...qVals));

      if (i % 2 === 0) {
        return {
          np: `${CATS[catIdx].np}को जम्मा सङ्ख्या कति छ? (🔵 = ${qScale})`,
          en: `How many ${CATS[catIdx].en.toLowerCase()}s are there? (🔵 = ${qScale})`,
          answer: String(count),
          options: near(count, i + 1, [qScale, -qScale, 1, -1]).map((x) => ({
            key: String(x),
            label: fmt(kit.lang, x),
          })),
        };
      } else {
        return {
          np: 'चित्रचार्ट अनुसार कुन फल सबैभन्दा धेरै छ?',
          en: 'According to the chart, which fruit is the most?',
          answer: String(maxI),
          options: shuffle([0, 1, 2, 3], i + 3).map((idx) => ({
            key: String(idx),
            label: kit.t(CATS[idx].np, CATS[idx].en),
          })),
        };
      }
    });
  }, [kit.lang]);

  return (
    <SimFrame2D
      kit={kit}
      onBack={onBackToLibrary}
      mascotGreeting={kit.t(
        `1 वटा 🔵 चिन्ह = ${scale} वटा फल जनाउँछ। सबैभन्दा धेरै फल: ${CATS[bestIdx].np} (${vals[bestIdx]})`,
        `1 🔵 symbol = ${scale} fruits. Most frequent fruit: ${CATS[bestIdx].en} (${vals[bestIdx]})`
      )}
      questions={questions}
      controls={
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#475569' }}>
            {kit.t('स्केल (Scale):', 'Scale:')}
          </div>
          {[2, 5, 10].map((s) => (
            <button
              key={s}
              onClick={() => applyScale(s)}
              style={{
                padding: '8px 16px',
                borderRadius: 10,
                border: scale === s ? '2px solid #187C68' : '1px solid #CBD5E1',
                background: scale === s ? '#E6F3E9' : '#FFFFFF',
                color: scale === s ? '#187C68' : '#334155',
                fontWeight: 800,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              🔵 = {s}
            </button>
          ))}
          <button
            onClick={fresh}
            style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            🎲 {kit.t('नयाँ तथ्याङ्क', 'Random Data')}
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 720, gap: 16 }}>
        {/* Scale Key Indicator */}
        <div
          style={{
            background: '#FEF3C7',
            border: '2px solid #F59E0B',
            borderRadius: 14,
            padding: '10px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            boxShadow: '0 2px 8px rgba(245,158,11,0.1)',
          }}
        >
          <div style={{ fontSize: 20 }}>🔑</div>
          <div style={{ fontSize: 15, fontWeight: 900, color: '#92400E' }}>
            {kit.t(`सङ्केत (Key): 1 वटा 🔵 = ${scale} वटा फल`, `Key: 1 🔵 = ${scale} fruits`)}
          </div>
        </div>

        {/* Pictograph Chart Table */}
        <div
          style={{
            width: '100%',
            background: '#FFFFFF',
            borderRadius: 18,
            border: '2px solid #E2E8F0',
            padding: '20px 24px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {CATS.map((cat, rIdx) => {
            const val = vals[rIdx];
            const fullCircles = Math.floor(val / scale);
            const hasHalf = val % scale !== 0;

            return (
              <div
                key={cat.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '130px 1fr 70px',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 14px',
                  background: rIdx % 2 === 0 ? '#F8FAFC' : '#FFFFFF',
                  borderRadius: 12,
                  border: '1px solid #E2E8F0',
                }}
              >
                {/* Fruit Label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 24 }}>{cat.emoji}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#1E293B' }}>
                    {kit.t(cat.np, cat.en)}
                  </span>
                </div>

                {/* Symbols Representation */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  {Array.from({ length: fullCircles }).map((_, cIdx) => (
                    <div
                      key={cIdx}
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background: cat.color,
                        border: '2px solid rgba(0,0,0,0.15)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      }}
                      title={`${scale}`}
                    />
                  ))}
                  {hasHalf && (
                    <div
                      style={{
                        width: 13,
                        height: 26,
                        borderTopLeftRadius: 13,
                        borderBottomLeftRadius: 13,
                        background: cat.color,
                        border: '2px solid rgba(0,0,0,0.15)',
                        borderRight: 'none',
                        opacity: 0.85,
                      }}
                      title={`${scale / 2}`}
                    />
                  )}
                </div>

                {/* Exact Count */}
                <div style={{ textAlign: 'right', fontSize: 16, fontWeight: 900, color: cat.color }}>
                  {fmt(kit.lang, val)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SimFrame2D>
  );
};
export default PictoScale;
