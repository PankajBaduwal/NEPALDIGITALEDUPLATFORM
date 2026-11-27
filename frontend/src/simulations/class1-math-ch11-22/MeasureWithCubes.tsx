/**
 * Chapter 21 · Length
 * Sim 1: Measure with Cubes — Pure 2D Edition
 * 100% 2D SVG / Interactive Measuring – No Three.js/WebGL dependencies.
 */
import React, { useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit';
import { useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

interface ItemToMeasure {
  id: string;
  nameEn: string;
  nameNp: string;
  actualCubes: number;
  icon: string;
}

const ITEMS_TO_MEASURE: ItemToMeasure[] = [
  { id: 'pencil', nameEn: 'Wooden Pencil', nameNp: 'सिसाकलम', actualCubes: 6, icon: '✏️' },
  { id: 'eraser', nameEn: 'Rubber Eraser', nameNp: 'रबर', actualCubes: 3, icon: '🧼' },
  { id: 'spoon', nameEn: 'Kitchen Spoon', nameNp: 'चम्चा', actualCubes: 5, icon: '🥄' },
  { id: 'book', nameEn: 'Notebook', nameNp: 'कापी', actualCubes: 8, icon: '📓' },
];

export const MeasureWithCubes: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G1-CH21-01',
    chapter: 21,
    titleNp: 'क्युबले नापौँ (लम्बाइको नाप)',
    titleEn: 'Measure with Cubes (Length)',
  });

  const [activeItem, setActiveItem] = useState<ItemToMeasure>(ITEMS_TO_MEASURE[0]);
  const [cubesCount, setCubesCount] = useState<number>(0);

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const addCube = () => {
    kit.tap();
    const next = cubesCount + 1;
    setCubesCount(next);

    if (next === activeItem.actualCubes) {
      kit.good(
        `सबास! ${isNe ? activeItem.nameNp : activeItem.nameEn} को लम्बाइ ${toNp(next)} क्युब बराबर छ!`,
        `Perfect! The ${activeItem.nameEn} is exactly ${next} cubes long!`
      );
    }
  };

  const removeCube = () => {
    if (cubesCount <= 0) return;
    kit.tap();
    setCubesCount((c) => c - 1);
  };

  const selectItem = (item: ItemToMeasure) => {
    kit.tap();
    setActiveItem(item);
    setCubesCount(0);
  };

  const quizQuestions: QuizQuestion[] = useMemo(
    () => [
      {
        np: 'लम्बाइ नाप्दा क्युबहरू कसरी राख्नुपर्छ?',
        en: 'How should cubes be placed when measuring length?',
        options: [
          { key: 'touching', label: isNe ? 'खाली ठाउँ नछोडी लहरै' : 'In a straight line without gaps' },
          { key: 'gaps', label: isNe ? 'टाढा टाढा' : 'Far apart with gaps' },
        ],
        answer: 'touching',
      },
      {
        np: 'एउटा सिसाकलम 6 क्युब लामो छ र रबर 3 क्युब। कुन लामो छ?',
        en: 'A pencil is 6 cubes long and an eraser is 3 cubes long. Which is longer?',
        options: [
          { key: 'pencil', label: isNe ? 'सिसाकलम (Pencil)' : 'Pencil' },
          { key: 'eraser', label: isNe ? 'रबर (Eraser)' : 'Eraser' },
        ],
        answer: 'pencil',
      },
    ],
    [isNe]
  );

  return (
    <SimFrame2D
      kit={kit}
      onBack={onBackToLibrary}
      grade={1}
      hud={
        <div
          style={{
            background: '#FFFFFF',
            border: '2px solid #187C68',
            borderRadius: 16,
            padding: '8px 18px',
            boxShadow: '0 4px 12px rgba(24,124,104,0.15)',
            fontWeight: 900,
            fontSize: 20,
            color: '#187C68',
          }}
        >
          📏 {L(`राखिएका क्युब: ${toNp(cubesCount)} वटा`, `Cubes placed: ${cubesCount}`)}
        </div>
      }
      panel={
        kit.mode === 'CHALLENGE' ? (
          <QuizPanel kit={kit} questions={quizQuestions} />
        ) : (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={addCube}
              style={{
                background: '#187C68',
                color: '#FFF',
                border: 'none',
                padding: '12px 22px',
                borderRadius: 14,
                fontSize: 16,
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(24,124,104,0.25)',
              }}
            >
              ➕ {L('1 क्युब थप्नुहोस् (+1)', 'Add 1 Cube (+1)')}
            </button>

            <button
              onClick={removeCube}
              disabled={cubesCount === 0}
              style={{
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                padding: '12px 18px',
                borderRadius: 14,
                fontSize: 14,
                fontWeight: 800,
                cursor: cubesCount === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              ➖ {L('1 क्युब हटाउनुहोस्', 'Remove 1 Cube')}
            </button>

            <button
              onClick={() => setCubesCount(0)}
              style={{
                marginLeft: 'auto',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                padding: '10px 16px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              🔄 {L('पुनः सुरु', 'Reset')}
            </button>
          </div>
        )
      }
    >
      {/* ── 2D Measurement Workbench ───────────────────────────── */}
      <div
        style={{
          width: '100%',
          height: '100%',
          minHeight: 460,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 28,
          padding: 24,
          background: 'linear-gradient(180deg, #E0F2FE 0%, #F5F7F5 60%)',
        }}
      >
        {/* Item Selector Tabs */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          {ITEMS_TO_MEASURE.map((item) => {
            const isSelected = activeItem.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => selectItem(item)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 18px',
                  borderRadius: 14,
                  border: isSelected ? '2px solid #187C68' : '1px solid #CBD5E1',
                  background: isSelected ? '#E6F3E9' : '#FFFFFF',
                  color: isSelected ? '#187C68' : '#334155',
                  fontWeight: 900,
                  fontSize: 14,
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 2px 8px rgba(24,124,104,0.2)' : 'none',
                }}
              >
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span>{isNe ? item.nameNp : item.nameEn}</span>
              </button>
            );
          })}
        </div>

        {/* Measuring Stage Container */}
        <div
          style={{
            width: 'min(760px, 94vw)',
            background: '#FFFFFF',
            borderRadius: 24,
            border: '2px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            padding: '32px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          {/* Object to measure */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 44 }}>{activeItem.icon}</span>
            <div
              style={{
                width: `${activeItem.actualCubes * 50}px`,
                height: 36,
                background: '#E2E8F0',
                borderRadius: 8,
                border: '2px solid #94A3B8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: 13,
                color: '#475569',
              }}
            >
              {isNe ? activeItem.nameNp : activeItem.nameEn}
            </div>
          </div>

          {/* Unit Cubes Line */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 28 }}>🧱</span>
            <div style={{ display: 'flex', gap: 2 }}>
              {Array.from({ length: cubesCount }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 48,
                    height: 48,
                    background: '#10B981',
                    borderRadius: 6,
                    border: '2px solid #059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFF',
                    fontWeight: 900,
                    fontSize: 16,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    animation: 'simPop 0.2s ease',
                  }}
                >
                  {isNe ? toNp(i + 1) : i + 1}
                </div>
              ))}
              {cubesCount === 0 && (
                <div style={{ color: '#94A3B8', fontSize: 13, fontWeight: 700, padding: 12 }}>
                  {L('तलको "+1 क्युब थप्नुहोस्" बटन थिचेर लम्बाइ नाप्नुहोस्!', 'Tap "+1 Add Cube" below to measure the length!')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};
