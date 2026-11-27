/**
 * Lesson 13 · Geometric shapes (ज्यामितीय आकार) — flat shapes
 * Flat Shapes Builder — shapes made of sides and corners; tap sides to count them and tap vertices.
 * Pure 2D Implementation for Smart Boards & Desktops.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, rnd, shuffle } from '../class1-math-kit/nepali';
import { fmt, numChoices } from './helpers';

interface Props { onBackToLibrary: () => void; userRole?: string }

const SHAPES = [
  { id: 'triangle', np: 'त्रिभुज', en: 'Triangle', sides: 3, corners: 3, color: '#EF4444', pts: [[140, 40], [50, 190], [230, 190]] },
  { id: 'square', np: 'वर्ग', en: 'Square', sides: 4, corners: 4, color: '#0284C7', pts: [[60, 50], [220, 50], [220, 210], [60, 210]] },
  { id: 'rectangle', np: 'आयत', en: 'Rectangle', sides: 4, corners: 4, color: '#16A34A', pts: [[40, 70], [240, 70], [240, 190], [40, 190]] },
  { id: 'pentagon', np: 'पञ्चभुज', en: 'Pentagon', sides: 5, corners: 5, color: '#F97316', pts: [[140, 40], [230, 105], [195, 205], [85, 205], [50, 105]] },
  { id: 'hexagon', np: 'षड्भुज', en: 'Hexagon', sides: 6, corners: 6, color: '#8B5CF6', pts: [[140, 40], [225, 90], [225, 180], [140, 230], [55, 180], [55, 90]] },
  { id: 'circle', np: 'गोलो (वृत्त)', en: 'Circle', sides: 0, corners: 0, color: '#EAB308', pts: [] },
];

export const FlatShapes: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G2-L13-02',
    chapter: 13,
    titleNp: 'सतही आकार बनाऔँ',
    titleEn: 'Flat Shapes Builder',
  });

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [countedSides, setCountedSides] = useState<number[]>([]);
  const [countedCorners, setCountedCorners] = useState<number[]>([]);

  const curShape = SHAPES[selectedIdx];

  const chooseShape = (idx: number) => {
    setSelectedIdx(idx);
    setCountedSides([]);
    setCountedCorners([]);
    const s = SHAPES[idx];
    kit.say(
      `${s.np} — ${toNp(s.sides)} वटा भुजा (किनारा), ${toNp(s.corners)} वटा कुना`,
      `${s.en}: ${s.sides} sides, ${s.corners} corners`
    );
  };

  const handleTapSide = (i: number) => {
    kit.tap();
    if (countedSides.includes(i)) return;
    const next = [...countedSides, i];
    setCountedSides(next);
    kit.say(`भुजा ${toNp(next.length)}`, `Side ${next.length}`);

    if (next.length === curShape.sides) {
      kit.good(
        `स्याबास! सबै ${toNp(curShape.sides)} वटा भुजा गनियो!`,
        `Counted all ${curShape.sides} sides!`
      );
      kit.star();
    }
  };

  const handleTapCorner = (i: number) => {
    kit.tap();
    if (countedCorners.includes(i)) return;
    const next = [...countedCorners, i];
    setCountedCorners(next);
    kit.say(`कुना ${toNp(next.length)}`, `Corner ${next.length}`);

    if (next.length === curShape.corners) {
      kit.good(
        `स्याबास! सबै ${toNp(curShape.corners)} वटा कुना गनियो!`,
        `Counted all ${curShape.corners} corners!`
      );
      kit.star();
    }
  };

  useEffect(() => {
    chooseShape(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode]);

  // Quiz questions for Challenge Mode
  const questions: QuizQuestion[] = SHAPES.map((s, i) => ({
    np: `${s.np}का कतिवटा सिधा किनारा (भुजा) हुन्छन्?`,
    en: `How many straight sides does a ${s.en} have?`,
    answer: String(s.sides),
    options: numChoices(s.sides, i * 7 + 2, [1, -1, 2, -2]).map((v) => ({
      key: String(v),
      label: toNp(v),
    })),
  }));

  const hud = (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 16,
        padding: '8px 18px',
        border: `2px solid ${curShape.color}`,
        boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
        fontSize: 16,
        fontWeight: 900,
        color: '#26332E',
      }}
    >
      <span style={{ color: curShape.color }}>
        {kit.lang === 'ne' ? curShape.np : curShape.en}
      </span>
      <span style={{ marginLeft: 8, fontSize: 13, color: '#64748B' }}>
        ({toNp(curShape.sides)} {kit.t('भुजा', 'sides')}, {toNp(curShape.corners)} {kit.t('कुना', 'corners')})
      </span>
    </div>
  );

  const panel = kit.mode === 'CHALLENGE' ? (
    <QuizPanel kit={kit} questions={questions} />
  ) : (
    <Controls>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <CBtn
          color="#187C68"
          onClick={() => {
            setCountedSides(Array.from({ length: curShape.sides }, (_, i) => i));
            setCountedCorners(Array.from({ length: curShape.corners }, (_, i) => i));
            kit.good();
          }}
        >
          👁️ {kit.t('सबै देखाऔँ', 'Count All')}
        </CBtn>
        <CBtn
          color="#64748B"
          onClick={() => {
            setCountedSides([]);
            setCountedCorners([]);
          }}
        >
          ↺ {kit.t('खाली गरौँ', 'Reset')}
        </CBtn>
        <CBtn
          color="#0284C7"
          onClick={() => chooseShape((selectedIdx + 1) % SHAPES.length)}
        >
          {kit.t('अर्को आकार', 'Next Shape')} ➜
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
          gap: 16,
        }}
      >
        {/* Shape selector chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {SHAPES.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => chooseShape(idx)}
              style={{
                padding: '6px 14px',
                borderRadius: 12,
                fontWeight: 900,
                fontSize: 14,
                border: `2px solid ${s.color}`,
                cursor: 'pointer',
                background: selectedIdx === idx ? s.color : '#FFFFFF',
                color: selectedIdx === idx ? '#FFFFFF' : '#1E293B',
              }}
            >
              {kit.lang === 'ne' ? s.np : s.en}
            </button>
          ))}
        </div>

        {/* 2D Interactive Shape Canvas */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 24,
            padding: 24,
            border: '2px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <svg width="280" height="260" viewBox="0 0 280 260">
            {curShape.id === 'circle' ? (
              <g>
                <circle cx="140" cy="130" r="90" fill="#FEF9C3" stroke="#EAB308" strokeWidth="6" />
                <text x="140" y="135" textAnchor="middle" fill="#854D0E" fontSize="16" fontWeight="900">
                  {kit.t('घुमाउरो घेरा (कुना छैन)', 'Curved (No corners)')}
                </text>
              </g>
            ) : (
              <g>
                {/* Polygon Surface */}
                <polygon
                  points={curShape.pts.map((p) => p.join(',')).join(' ')}
                  fill={curShape.color}
                  fillOpacity="0.15"
                />

                {/* Sides (Clickable Sticks) */}
                {curShape.pts.map((p, i) => {
                  const nextP = curShape.pts[(i + 1) % curShape.pts.length];
                  const isCounted = countedSides.includes(i);
                  return (
                    <line
                      key={i}
                      x1={p[0]}
                      y1={p[1]}
                      x2={nextP[0]}
                      y2={nextP[1]}
                      stroke={isCounted ? '#16A34A' : curShape.color}
                      strokeWidth={isCounted ? 8 : 5}
                      strokeLinecap="round"
                      onClick={() => handleTapSide(i)}
                      style={{ cursor: 'pointer' }}
                    />
                  );
                })}

                {/* Corners (Clickable Vertex Balls) */}
                {curShape.pts.map((p, i) => {
                  const isCounted = countedCorners.includes(i);
                  return (
                    <circle
                      key={i}
                      cx={p[0]}
                      cy={p[1]}
                      r={isCounted ? 12 : 9}
                      fill={isCounted ? '#DC2626' : '#1E293B'}
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                      onClick={() => handleTapCorner(i)}
                      style={{ cursor: 'pointer' }}
                    />
                  );
                })}
              </g>
            )}
          </svg>

          <div style={{ display: 'flex', gap: 16, fontSize: 13, fontWeight: 800 }}>
            <span style={{ color: '#16A34A' }}>
              ✓ {kit.t('गनिएका भुजा:', 'Sides counted:')} {toNp(countedSides.length)} / {toNp(curShape.sides)}
            </span>
            <span style={{ color: '#DC2626' }}>
              ✓ {kit.t('गनिएका कुना:', 'Corners counted:')} {toNp(countedCorners.length)} / {toNp(curShape.corners)}
            </span>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};
