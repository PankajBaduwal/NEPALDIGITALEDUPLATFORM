/**
 * Class 4 lesson 12 · Perimeter and area
 * GardenLab — 2D Rectangular Garden exploring Perimeter (boundary walk) and Area (square tiling).
 */
import React, { useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { rnd } from '../class1-math-kit/nepali';
import { fmt, Props, numQ } from './h4';

type Mode = 'P' | 'A';

export const GardenLab: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G4-L12-01',
    chapter: 12,
    titleNp: 'बगैँचा प्रयोगशाला (परिमिति र क्षेत्रफल)',
    titleEn: 'Garden Lab (Perimeter & Area)',
  });

  const [l, setL] = useState(6);
  const [w, setW] = useState(4);
  const [mode, setMode] = useState<Mode>('P');
  const [filledRows, setFilledRows] = useState(4);

  const perimeter = 2 * (l + w);
  const area = l * w;

  const handleWalk = () => {
    setMode('P');
    kit.tap();
    kit.say(
      `परिमिति (Perimeter) = 2 × (लम्बाइ + चौडाइ) = 2 × (${l} + ${w}) = ${perimeter} मिटर`,
      `Perimeter = 2 × (L + W) = 2 × (${l} + ${w}) = ${perimeter} m`
    );
    kit.star();
  };

  const handleTile = () => {
    setMode('A');
    setFilledRows(w);
    kit.tap();
    kit.say(
      `क्षेत्रफल (Area) = लम्बाइ × चौडाइ = ${l} × ${w} = ${area} वर्ग मिटर`,
      `Area = L × W = ${l} × ${w} = ${area} sq m`
    );
    kit.star();
  };

  const questions: QuizQuestion[] = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const ql = rnd(3, 9);
      const qw = rnd(2, 6);
      const qP = 2 * (ql + qw);
      const qA = ql * qw;

      if (i % 2 === 0) {
        return numQ(
          `लम्बाइ ${ql} मिटर र चौडाइ ${qw} मिटर भएको बगैँचाको परिमिति कति हुन्छ?`,
          `What is the perimeter of a garden ${ql} m long and ${qw} m wide?`,
          qP,
          i,
          [2, -2, 4, -4, ql, qw],
          (x) => `${fmt(kit.lang, x)} ${kit.t('मि.', 'm')}`,
          1
        );
      } else {
        return numQ(
          `लम्बाइ ${ql} मिटर र चौडाइ ${qw} मिटर भएको बगैँचाको क्षेत्रफल कति हुन्छ?`,
          `What is the area of a garden ${ql} m long and ${qw} m wide?`,
          qA,
          i + 2,
          [ql, -ql, qw, -qw, qP],
          (x) => `${fmt(kit.lang, x)} ${kit.t('वर्ग मि.', 'sq m')}`,
          1
        );
      }
    });
  }, [kit.lang]);

  return (
    <SimFrame2D
      kit={kit}
      onBack={onBackToLibrary}
      mascotGreeting={
        mode === 'P'
          ? kit.t(
            `परिमिति (Perimeter) = घेराको कुल लम्बाइ = 2 × (${l} + ${w}) = ${perimeter} मिटर`,
            `Perimeter = Total distance around the boundary = 2 × (${l} + ${w}) = ${perimeter} m`
          )
          : kit.t(
            `क्षेत्रफल (Area) = ओगटेको ठाउँ = लम्बाइ × चौडाइ = ${l} × ${w} = ${area} वर्ग मिटर`,
            `Area = Surface covered = Length × Width = ${l} × ${w} = ${area} sq m`
          )
      }
      questions={questions}
      controls={
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={handleWalk}
            style={{
              padding: '8px 18px',
              borderRadius: 10,
              border: mode === 'P' ? '2px solid #EF4444' : '1px solid #CBD5E1',
              background: mode === 'P' ? '#FEE2E2' : '#FFFFFF',
              color: mode === 'P' ? '#DC2626' : '#334155',
              fontWeight: 800,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            🐜 {kit.t('परिमिति (Perimeter)', 'Perimeter (Walk)')}
          </button>
          <button
            onClick={handleTile}
            style={{
              padding: '8px 18px',
              borderRadius: 10,
              border: mode === 'A' ? '2px solid #0EA5E9' : '1px solid #CBD5E1',
              background: mode === 'A' ? '#E0F2FE' : '#FFFFFF',
              color: mode === 'A' ? '#0284C7' : '#334155',
              fontWeight: 800,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            🟩 {kit.t('क्षेत्रफल (Area)', 'Area (Tiles)')}
          </button>
          <button
            onClick={() => l > 2 && setL(l - 1)}
            style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            {kit.t('लम्बाइ', 'L')} −
          </button>
          <button
            onClick={() => l < 10 && setL(l + 1)}
            style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            {kit.t('लम्बाइ', 'L')} +
          </button>
          <button
            onClick={() => w > 2 && setW(w - 1)}
            style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            {kit.t('चौडाइ', 'W')} −
          </button>
          <button
            onClick={() => w < 7 && setW(w + 1)}
            style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            {kit.t('चौडाइ', 'W')} +
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 650, gap: 16 }}>
        {/* Metric Summary Card */}
        <div
          style={{
            background: '#FFFFFF',
            border: '2px solid #E2E8F0',
            borderRadius: 16,
            padding: '12px 28px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            display: 'flex',
            justifyContent: 'space-around',
            width: '100%',
          }}
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>
              {kit.t('लम्बाइ × चौडाइ', 'Length × Width')}
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#1E293B' }}>
              {l} m × {w} m
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#EF4444' }}>
              {kit.t('परिमिति (Perimeter)', 'Perimeter')}
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#EF4444' }}>
              {fmt(kit.lang, perimeter)} {kit.t('मि.', 'm')}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#0EA5E9' }}>
              {kit.t('क्षेत्रफल (Area)', 'Area')}
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#0EA5E9' }}>
              {fmt(kit.lang, area)} {kit.t('वर्ग मि.', 'sq m')}
            </div>
          </div>
        </div>

        {/* 2D Interactive Garden Canvas */}
        <div
          style={{
            position: 'relative',
            background: '#DCFCE7',
            borderRadius: 18,
            border: mode === 'P' ? '4px dashed #EF4444' : '3px solid #15803D',
            padding: '36px 44px',
            boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Top Label */}
          <div
            style={{
              position: 'absolute',
              top: 8,
              fontSize: 12,
              fontWeight: 800,
              color: '#15803D',
              background: '#FFFFFF',
              padding: '2px 10px',
              borderRadius: 6,
            }}
          >
            ↔ {kit.t('लम्बाइ', 'Length')}: {l} m
          </div>

          {/* Left Label */}
          <div
            style={{
              position: 'absolute',
              left: 6,
              top: '50%',
              transform: 'translateY(-50%) rotate(-90deg)',
              fontSize: 12,
              fontWeight: 800,
              color: '#15803D',
              background: '#FFFFFF',
              padding: '2px 10px',
              borderRadius: 6,
            }}
          >
            ↕ {kit.t('चौडाइ', 'Width')}: {w} m
          </div>

          {/* Grid Area Tiles */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${l}, 38px)`,
              gap: 2,
              background: 'rgba(0,0,0,0.08)',
              padding: 2,
              borderRadius: 6,
            }}
          >
            {Array.from({ length: w }).map((_, rIdx) =>
              Array.from({ length: l }).map((__, cIdx) => (
                <div
                  key={`${rIdx}-${cIdx}`}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 4,
                    background:
                      mode === 'A'
                        ? (rIdx + cIdx) % 2 === 0
                          ? '#0284C7'
                          : '#38BDF8'
                        : '#BBF7D0',
                    border: '1px solid rgba(0,0,0,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 700,
                    color: mode === 'A' ? '#FFFFFF' : '#166534',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {mode === 'A' ? '1m²' : ''}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};
export default GardenLab;
