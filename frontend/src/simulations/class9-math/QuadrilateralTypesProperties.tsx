import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface Point {
  x: number;
  y: number;
}

const dist = (p1: Point, p2: Point) => Math.hypot(p2.x - p1.x, p2.y - p1.y);

// Angle at p2 between p1 and p3 in degrees
const angleAt = (p1: Point, p2: Point, p3: Point): number => {
  const d12 = dist(p1, p2);
  const d23 = dist(p2, p3);
  const d13 = dist(p1, p3);
  if (d12 === 0 || d23 === 0) return 0;
  const cosVal = (d12 * d12 + d23 * d23 - d13 * d13) / (2 * d12 * d23);
  const clamped = Math.max(-1, Math.min(1, cosVal));
  return (Math.acos(clamped) * 180) / Math.PI;
};

// Check if vector p1->p2 is parallel to p3->p4
const isParallel = (p1: Point, p2: Point, p3: Point, p4: Point): boolean => {
  const dx1 = p2.x - p1.x;
  const dy1 = p2.y - p1.y;
  const dx2 = p4.x - p3.x;
  const dy2 = p4.y - p3.y;
  const cross = Math.abs(dx1 * dy2 - dy1 * dx2);
  const len1 = Math.hypot(dx1, dy1);
  const len2 = Math.hypot(dx2, dy2);
  if (len1 === 0 || len2 === 0) return false;
  return cross / (len1 * len2) < 0.08; // small sine value
};

const QUIZ_QUESTIONS = [
  {
    np: 'चतुर्भुजका चारवटै भित्री कोणहरूको योगफल कति हुन्छ?',
    en: 'What is the sum of all four interior angles of a quadrilateral?',
    options: [
      { key: 'A', label: '360°' },
      { key: 'B', label: '180°' },
      { key: 'C', label: '540°' },
      { key: 'D', label: '720°' },
    ],
    answer: 'A',
  },
  {
    np: 'कुन चतुर्भुजका चारै भुजाहरू They are equal र विकर्णहरू परस्पर लम्ब (90°) मा समद्विभाजित हुन्छन्?',
    en: 'In which quadrilateral are all four sides equal and diagonals bisect each other at 90°?',
    options: [
      { key: 'A', label: 'Rhombus and square' },
      { key: 'B', label: 'Rectangle' },
      { key: 'C', label: 'Trapezium' },
      { key: 'D', label: 'Kite' },
    ],
    answer: 'A',
  },
  {
    np: 'समानान्तर चतुर्भुज (Parallelogram) का आसन्न कोणहरू (Adjacent angles) बीचको सम्बन्ध के हुन्छ?',
    en: 'What is the relationship between adjacent angles of a parallelogram?',
    options: [
      { key: 'A', label: 'Mutually supplementary (sum = 180°)' },
      { key: 'B', label: 'They are equal' },
      { key: 'C', label: 'They are zero' },
      { key: 'D', label: 'They are less than 90°' },
    ],
    answer: 'A',
  },
];

export const QuadrilateralTypesProperties: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U14-01',
    chapter: 14,
    titleNp: 'चतुर्भुज अन्वेषक: प्रकार र विशेषताहरू',
    titleEn: 'Quadrilateral Explorer: Types & Properties',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  // Vertices of Quadrilateral ABCD on 460x320 SVG
  const [pA, setPA] = useState<Point>({ x: 100, y: 70 });
  const [pB, setPB] = useState<Point>({ x: 340, y: 70 });
  const [pC, setPC] = useState<Point>({ x: 380, y: 250 });
  const [pD, setPD] = useState<Point>({ x: 140, y: 250 });
  const [draggingVertex, setDraggingVertex] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [showDiagonals, setShowDiagonals] = useState<boolean>(true);

  // Side lengths (25px = 1cm)
  const pxToCm = 25;
  const sideAB = dist(pA, pB) / pxToCm;
  const sideBC = dist(pB, pC) / pxToCm;
  const sideCD = dist(pC, pD) / pxToCm;
  const sideDA = dist(pD, pA) / pxToCm;

  // Diagonals AC and BD
  const diagAC = dist(pA, pC) / pxToCm;
  const diagBD = dist(pB, pD) / pxToCm;

  // Interior angles
  const angA = angleAt(pD, pA, pB);
  const angB = angleAt(pA, pB, pC);
  const angC = angleAt(pB, pC, pD);
  const angD = angleAt(pC, pD, pA);
  const angleSum = Math.round(angA + angB + angC + angD);

  // Parallel pairs: AB with CD, BC with DA
  const parAB_CD = isParallel(pA, pB, pD, pC);
  const parBC_DA = isParallel(pB, pC, pA, pD);

  // Equal sides check
  const tol = 0.3;
  const all4SidesEq =
    Math.abs(sideAB - sideBC) < tol &&
    Math.abs(sideBC - sideCD) < tol &&
    Math.abs(sideCD - sideDA) < tol;
  const oppSidesEq =
    Math.abs(sideAB - sideCD) < tol && Math.abs(sideBC - sideDA) < tol;
  const all4Angles90 =
    Math.abs(angA - 90) < 3 &&
    Math.abs(angB - 90) < 3 &&
    Math.abs(angC - 90) < 3 &&
    Math.abs(angD - 90) < 3;

  // Automatic Classification
  let typeTitleNp = 'साधारण चतुर्भुज (General Quadrilateral)';
  let typeTitleEn = 'General Quadrilateral';
  let typeColor = '#64748B';

  if (all4SidesEq && all4Angles90) {
    typeTitleNp = 'वर्ग (Square)';
    typeTitleEn = 'Square';
    typeColor = '#059669';
  } else if (all4Angles90 && oppSidesEq) {
    typeTitleNp = 'Rectangle';
    typeTitleEn = 'Rectangle';
    typeColor = '#2563EB';
  } else if (all4SidesEq && parAB_CD && parBC_DA) {
    typeTitleNp = 'रोम्बस (Rhombus)';
    typeTitleEn = 'Rhombus';
    typeColor = '#7C3AED';
  } else if (parAB_CD && parBC_DA) {
    typeTitleNp = 'समानान्तर चतुर्भुज (Parallelogram)';
    typeTitleEn = 'Parallelogram';
    typeColor = '#0D9488';
  } else if (parAB_CD || parBC_DA) {
    typeTitleNp = 'Trapezium';
    typeTitleEn = 'Trapezium';
    typeColor = '#D97706';
  }

  // Presets
  const applyPreset = (preset: 'square' | 'rect' | 'rhombus' | 'parallelogram' | 'trapezium') => {
    if (preset === 'square') {
      setPA({ x: 140, y: 80 });
      setPB({ x: 320, y: 80 });
      setPC({ x: 320, y: 260 });
      setPD({ x: 140, y: 260 });
    } else if (preset === 'rect') {
      setPA({ x: 100, y: 90 });
      setPB({ x: 360, y: 90 });
      setPC({ x: 360, y: 240 });
      setPD({ x: 100, y: 240 });
    } else if (preset === 'rhombus') {
      setPA({ x: 230, y: 60 });
      setPB({ x: 350, y: 170 });
      setPC({ x: 230, y: 280 });
      setPD({ x: 110, y: 170 });
    } else if (preset === 'parallelogram') {
      setPA({ x: 140, y: 80 });
      setPB({ x: 360, y: 80 });
      setPC({ x: 320, y: 240 });
      setPD({ x: 100, y: 240 });
    } else if (preset === 'trapezium') {
      setPA({ x: 160, y: 80 });
      setPB({ x: 300, y: 80 });
      setPC({ x: 380, y: 240 });
      setPD({ x: 80, y: 240 });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggingVertex) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(20, Math.min(440, e.clientX - rect.left));
    const y = Math.max(20, Math.min(300, e.clientY - rect.top));

    if (draggingVertex === 'A') setPA({ x, y });
    else if (draggingVertex === 'B') setPB({ x, y });
    else if (draggingVertex === 'C') setPC({ x, y });
    else if (draggingVertex === 'D') setPD({ x, y });
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! चार शीर्षबिन्दुहरू A, B, C, D लाई तानेर समानान्तर चतुर्भुज, आयत, वर्ग, रोम्बस वा समलम्ब चतुर्भुज बनाउनुहोस् र तिनीहरूका भुजाहरू, कोणहरू तथा विकर्णहरूको सम्बन्ध पत्ता लगाउनुहोस्!',
        'Welcome! Manipulate vertices A, B, C, D to explore parallelograms, rectangles, rhombuses, squares, and trapeziums in real time!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Presets Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          <button
            onClick={() => applyPreset('parallelogram')}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: '1px solid #CBD5E1',
              backgroundColor: '#F8FAFC',
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            🔷 {L('समानान्तर चतुर्भुज (Parallelogram)', 'Parallelogram')}
          </button>
          <button
            onClick={() => applyPreset('rect')}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: '1px solid #CBD5E1',
              backgroundColor: '#F8FAFC',
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            ▯ {L('Rectangle', 'Rectangle')}
          </button>
          <button
            onClick={() => applyPreset('square')}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: '1px solid #CBD5E1',
              backgroundColor: '#F8FAFC',
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            ⏹ {L('वर्ग (Square)', 'Square')}
          </button>
          <button
            onClick={() => applyPreset('rhombus')}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: '1px solid #CBD5E1',
              backgroundColor: '#F8FAFC',
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            💠 {L('रोम्बस (Rhombus)', 'Rhombus')}
          </button>
          <button
            onClick={() => applyPreset('trapezium')}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: '1px solid #CBD5E1',
              backgroundColor: '#F8FAFC',
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            ⏢ {L('Trapezium', 'Trapezium')}
          </button>
        </div>

        {/* Main Stage Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 480px) minmax(280px, 1fr)',
            gap: 16,
            alignItems: 'start',
          }}
        >
          {/* SVG Geometry Board */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              border: '1px solid #CBD5E1',
              padding: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <svg
              width={460}
              height={320}
              onMouseMove={handleMouseMove}
              onMouseUp={() => setDraggingVertex(null)}
              onMouseLeave={() => setDraggingVertex(null)}
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: 8,
                cursor: draggingVertex ? 'grabbing' : 'default',
                userSelect: 'none',
              }}
            >
              {/* Grid Background */}
              <defs>
                <pattern id="quadGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#F1F5F9" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width={460} height={320} fill="url(#quadGrid)" />

              {/* Diagonals AC & BD */}
              {showDiagonals && (
                <g>
                  <line
                    x1={pA.x}
                    y1={pA.y}
                    x2={pC.x}
                    y2={pC.y}
                    stroke="#94A3B8"
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                  />
                  <line
                    x1={pB.x}
                    y1={pB.y}
                    x2={pD.x}
                    y2={pD.y}
                    stroke="#94A3B8"
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                  />
                </g>
              )}

              {/* Quadrilateral Polygon */}
              <polygon
                points={`${pA.x},${pA.y} ${pB.x},${pB.y} ${pC.x},${pC.y} ${pD.x},${pD.y}`}
                fill="#F0FDFA"
                fillOpacity="0.75"
                stroke={typeColor}
                strokeWidth="2.5"
              />

              {/* Side Length Labels */}
              <text x={(pA.x + pB.x) / 2} y={(pA.y + pB.y) / 2 - 8} fontSize="11" fill="#0F766E" fontWeight="700" textAnchor="middle">
                AB = {fmt(sideAB.toFixed(1))} cm
              </text>
              <text x={(pB.x + pC.x) / 2 + 10} y={(pB.y + pC.y) / 2} fontSize="11" fill="#0F766E" fontWeight="700">
                BC = {fmt(sideBC.toFixed(1))} cm
              </text>
              <text x={(pC.x + pD.x) / 2} y={(pC.y + pD.y) / 2 + 16} fontSize="11" fill="#0F766E" fontWeight="700" textAnchor="middle">
                CD = {fmt(sideCD.toFixed(1))} cm
              </text>
              <text x={(pD.x + pA.x) / 2 - 20} y={(pD.y + pA.y) / 2} fontSize="11" fill="#0F766E" fontWeight="700" textAnchor="end">
                DA = {fmt(sideDA.toFixed(1))} cm
              </text>

              {/* Angle Labels */}
              <text x={pA.x + 14} y={pA.y + 18} fontSize="11" fill="#1E40AF" fontWeight="800">
                {fmt(angA.toFixed(0))}°
              </text>
              <text x={pB.x - 28} y={pB.y + 18} fontSize="11" fill="#1E40AF" fontWeight="800">
                {fmt(angB.toFixed(0))}°
              </text>
              <text x={pC.x - 28} y={pC.y - 10} fontSize="11" fill="#1E40AF" fontWeight="800">
                {fmt(angC.toFixed(0))}°
              </text>
              <text x={pD.x + 14} y={pD.y - 10} fontSize="11" fill="#1E40AF" fontWeight="800">
                {fmt(angD.toFixed(0))}°
              </text>

              {/* Draggable Vertices */}
              {[
                { id: 'A', p: pA, color: '#3B82F6' },
                { id: 'B', p: pB, color: '#10B981' },
                { id: 'C', p: pC, color: '#F59E0B' },
                { id: 'D', p: pD, color: '#EC4899' },
              ].map((v) => (
                <g key={v.id} style={{ cursor: 'grab' }}>
                  <circle
                    cx={v.p.x}
                    cy={v.p.y}
                    r="9"
                    fill={v.color}
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    onMouseDown={() => setDraggingVertex(v.id as any)}
                  />
                  <text
                    x={v.p.x}
                    y={v.p.y - 12}
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight="800"
                    fill="#1E293B"
                  >
                    {v.id}
                  </text>
                </g>
              ))}
            </svg>

            <div style={{ marginTop: 6, fontSize: 11, color: '#64748B', textAlign: 'center' }}>
              💡 {L('शीर्षबिन्दुहरू A, B, C, D लाई माउसले तानेर विभिन्न आकार बनाउनुहोस्।', 'Drag vertices A, B, C, D to observe live shape classification.')}
            </div>
          </div>

          {/* Right Panel: Identified Type & Properties */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Classification Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: `2px solid ${typeColor}`,
                padding: 14,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>
                {L('पहिचान गरिएको चतुर्भुज (Identified Type):', 'Identified Quadrilateral:')}
              </span>
              <div style={{ fontSize: 18, fontWeight: 800, color: typeColor }}>
                {L(typeTitleNp, typeTitleEn)}
              </div>
            </div>

            {/* Angle Sum Property */}
            <div
              style={{
                backgroundColor: '#F0FDF4',
                borderRadius: 10,
                border: '1px solid #86EFAC',
                padding: 12,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: '#166534' }}>
                {L('चार कोणहरूको योगफल (Angle Sum):', 'Interior Angle Sum:')}
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 800, color: '#065F46', marginTop: 4 }}>
                ∠A + ∠B + ∠C + ∠D = {fmt(angA.toFixed(0))}° + {fmt(angB.toFixed(0))}° +{' '}
                {fmt(angC.toFixed(0))}° + {fmt(angD.toFixed(0))}° = {fmt(angleSum)}°
              </div>
            </div>

            {/* Diagonals Info */}
            <div
              style={{
                backgroundColor: '#EFF6FF',
                borderRadius: 10,
                border: '1px solid #BFDBFE',
                padding: 12,
                fontSize: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: '#1E40AF' }}>
                  {L('विकर्णहरू (Diagonals AC & BD):', 'Diagonals AC & BD:')}
                </strong>
                <label style={{ fontSize: 11, color: '#1D4ED8', display: 'flex', gap: 4 }}>
                  <input
                    type="checkbox"
                    checked={showDiagonals}
                    onChange={(e) => setShowDiagonals(e.target.checked)}
                  />
                  {L('देखाउने', 'Show')}
                </label>
              </div>
              {showDiagonals && (
                <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#1E3A8A', marginTop: 4 }}>
                  AC = {fmt(diagAC.toFixed(1))} cm | BD = {fmt(diagBD.toFixed(1))} cm
                  {Math.abs(diagAC - diagBD) < tol && (
                    <div style={{ color: '#059669', fontWeight: 700, marginTop: 2 }}>
                      ✓ Both diagonals are equal (AC = BD)!
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Parallel Sides Indicator */}
            <div
              style={{
                backgroundColor: '#FFFBEB',
                borderRadius: 10,
                border: '1px solid #FCD34D',
                padding: 12,
                fontSize: 12,
                color: '#92400E',
                lineHeight: 1.5,
              }}
            >
              <strong>{L('समानान्तर भुजाहरूको अवस्था:', 'Parallel Sides Status:')}</strong>
              <div>• AB and CD: {parAB_CD ? 'Parallel (//) ✓' : 'Not parallel'}</div>
              <div>• BC and DA: {parBC_DA ? 'Parallel (//) ✓' : 'Not parallel'}</div>
            </div>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};

export default QuadrilateralTypesProperties;
