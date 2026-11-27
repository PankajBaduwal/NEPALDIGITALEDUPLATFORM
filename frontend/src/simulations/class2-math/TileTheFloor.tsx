/**
 * Lesson 10 · Area
 * Tile the Floor — cover a shape with square unit tiles and count them; compare areas.
 * Pure 2D Implementation for Smart Boards & Desktops.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, rnd } from '../class1-math-kit/nepali';
import { fmt, numChoices } from './helpers';

interface Props { onBackToLibrary: () => void; userRole?: string }

const COLS = 7;
const ROWS = 5;

type Shape = number[]; // cell indices

const rect = (w: number, h: number, ox = 1, oy = 1): Shape => {
  const r: number[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      r.push((y + oy) * COLS + x + ox);
    }
  }
  return r;
};

const SHAPES: { np: string; en: string; cells: Shape }[] = [
  { np: 'आयत 3×4', en: 'Rectangle 3×4 (12 units)', cells: rect(4, 3, 1, 1) },
  { np: 'वर्ग 3×3', en: 'Square 3×3 (9 units)', cells: rect(3, 3, 2, 1) },
  { np: 'L आकार (10 एकाइ)', en: 'L Shape (10 units)', cells: [...rect(2, 4, 1, 0), ...rect(2, 1, 3, 3)] },
  { np: 'T आकार (8 एकाइ)', en: 'T Shape (8 units)', cells: [...rect(5, 1, 1, 0), ...rect(1, 3, 3, 1)] },
  { np: 'आयत 2×5', en: 'Rectangle 2×5 (10 units)', cells: rect(5, 2, 1, 1) },
];

export const TileTheFloor: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G2-L10-01',
    chapter: 10,
    titleNp: 'टाइल बिछ्याऔँ (क्षेत्रफल)',
    titleEn: 'Tile the Floor (Area)',
  });

  const [shapeIndex, setShapeIndex] = useState(0);
  const [tiled, setTiled] = useState<Set<number>>(new Set());
  const [li, setLi] = useState(0);

  const curShape = SHAPES[shapeIndex];
  const targetCells = curShape.cells;
  const isFull = targetCells.every((c) => tiled.has(c));

  const toggleCell = (idx: number) => {
    if (!targetCells.includes(idx)) return;
    kit.tap();
    setTiled((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
        if (next.size === targetCells.length) {
          kit.good(
            `स्याबास! सबै ${toNp(targetCells.length)} टाइलहरू भरियो। क्षेत्रफल = ${toNp(targetCells.length)} वर्ग एकाइ।`,
            `Great job! All ${targetCells.length} tiles placed. Area = ${targetCells.length} square units.`
          );
          kit.star();
        }
      }
      return next;
    });
  };

  const fillAll = () => {
    kit.tap();
    setTiled(new Set(targetCells));
    kit.good(
      `क्षेत्रफल = ${toNp(targetCells.length)} वर्ग एकाइ`,
      `Area = ${targetCells.length} square units`
    );
    kit.star();
  };

  const clearAll = () => {
    kit.tap();
    setTiled(new Set());
  };

  const handleNextShape = () => {
    const nextIdx = (shapeIndex + 1) % SHAPES.length;
    setShapeIndex(nextIdx);
    setTiled(new Set());
    const sh = SHAPES[nextIdx];
    kit.say(
      `${sh.np}लाई टाइलले भरौँ र क्षेत्रफल नापौँ।`,
      `Cover the ${sh.en} with tiles to find its area.`
    );
  };

  useEffect(() => {
    if (kit.mode === 'LEARN') {
      const idx = li % SHAPES.length;
      setShapeIndex(idx);
      setTiled(new Set());
      kit.say(
        'आकारमा कतिवटा वर्ग टाइल अटाउँछन्, त्यो नै त्यसको क्षेत्रफल हो।',
        'The number of square tiles that cover a shape is its area.'
      );
    } else if (kit.mode === 'PLAY') {
      setShapeIndex(rnd(0, SHAPES.length - 1));
      setTiled(new Set());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode, li]);

  // Quiz Questions for Challenge Mode
  const questions: QuizQuestion[] = SHAPES.map((sh, i) => ({
    np: `${sh.np.split(' (')[0]}लाई पूरै ढाक्न कतिवटा 1 वर्ग एकाइका टाइल चाहिन्छ?`,
    en: `How many 1-unit square tiles are needed to completely cover ${sh.en.split(' (')[0]}?`,
    answer: String(sh.cells.length),
    options: numChoices(sh.cells.length, i * 11 + 2, [1, -1, 2, -2]).map((v) => ({
      key: String(v),
      label: `${fmt(kit.lang, v)} ${kit.t('टाइल', 'tiles')}`,
    })),
  }));

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
      {kit.t('बिछ्याइएका टाइल', 'Tiles Placed')}:{' '}
      <span style={{ color: isFull ? '#16A34A' : '#0284C7', fontSize: 20 }}>
        {toNp(tiled.size)}
      </span>{' '}
      / {toNp(targetCells.length)} {kit.t('वर्ग एकाइ', 'sq. units')}
    </div>
  );

  const panel = kit.mode === 'CHALLENGE' ? (
    <QuizPanel kit={kit} questions={questions} />
  ) : (
    <Controls>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <CBtn color="#059669" onClick={fillAll}>
          🟩 {kit.t('सबै टाइल भरौँ', 'Fill All Tiles')}
        </CBtn>
        <CBtn color="#EF4444" disabled={tiled.size === 0} onClick={clearAll}>
          ↺ {kit.t('खाली गरौँ', 'Clear')}
        </CBtn>

        {kit.mode === 'LEARN' && (
          <CBtn color="#187C68" onClick={() => { setLi((v) => v + 1); handleNextShape(); }}>
            {kit.t('अर्को आकार', 'Next Shape')} ➜
          </CBtn>
        )}

        {kit.mode === 'PLAY' && (
          <CBtn color="#D97706" onClick={handleNextShape}>
            🎲 {kit.t('नयाँ आकार', 'Random Shape')}
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
            padding: '30px 40px',
            border: '2px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          {/* Shape Title */}
          <div style={{ fontSize: 18, fontWeight: 900, color: '#1E293B' }}>
            {kit.t(curShape.np, curShape.en)}
          </div>

          {/* 7x5 Grid Floor */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${COLS}, 56px)`,
              gridTemplateRows: `repeat(${ROWS}, 56px)`,
              gap: 4,
              background: '#F1F5F9',
              padding: 10,
              borderRadius: 16,
              border: '2px solid #CBD5E1',
            }}
          >
            {Array.from({ length: COLS * ROWS }).map((_, idx) => {
              const isTarget = targetCells.includes(idx);
              const isFilled = tiled.has(idx);

              return (
                <div
                  key={idx}
                  onClick={() => toggleCell(idx)}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 8,
                    cursor: isTarget ? 'pointer' : 'default',
                    border: isTarget ? '2px dashed #0284C7' : '1px solid #E2E8F0',
                    background: isFilled
                      ? '#38BDF8'
                      : isTarget
                        ? '#E0F2FE'
                        : '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                    boxShadow: isFilled ? '0 2px 6px rgba(2, 132, 199, 0.3)' : 'none',
                  }}
                >
                  {isFilled && (
                    <span style={{ fontSize: 15, fontWeight: 900, color: '#FFFFFF' }}>
                      {toNp(Array.from(tiled).indexOf(idx) + 1)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ fontSize: 13, color: '#64748B', fontWeight: 700 }}>
            {kit.t('नीलो घेराभित्र छोएर 1 वर्ग एकाइ टाइल बिछ्याउनुहोस्', 'Tap inside the blue outline to place 1 sq-unit tiles')}
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};
