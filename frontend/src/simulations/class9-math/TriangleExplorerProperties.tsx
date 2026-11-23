import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface Point {
  x: number;
  y: number;
}

const dist = (p1: Point, p2: Point) => Math.hypot(p2.x - p1.x, p2.y - p1.y);

// Calculate angle at vertex p2 between p1 and p3 in degrees
const angleAt = (p1: Point, p2: Point, p3: Point): number => {
  const d12 = dist(p1, p2);
  const d23 = dist(p2, p3);
  const d13 = dist(p1, p3);
  if (d12 === 0 || d23 === 0) return 0;
  const cosVal = (d12 * d12 + d23 * d23 - d13 * d13) / (2 * d12 * d23);
  const clamped = Math.max(-1, Math.min(1, cosVal));
  return (Math.acos(clamped) * 180) / Math.PI;
};

const QUIZ_QUESTIONS = [
  {
    np: 'त्रिभुजका तीनवटै भित्री कोणहरूको योगफल सधैं कति हुन्छ?',
    en: 'What is the sum of all three interior angles of any triangle?',
    options: [
      { key: 'A', label: '180°' },
      { key: 'B', label: '360°' },
      { key: 'C', label: '90°' },
      { key: 'D', label: '270°' },
    ],
    answer: 'A',
  },
  {
    np: 'त्रिभुजको कुनै एक बाहिरी कोण (Exterior angle) र यसका अनासन्न भित्री कोणहरू बीचको सम्बन्ध के हुन्छ?',
    en: 'What is the relation between an exterior angle of a triangle and its opposite interior angles?',
    options: [
      { key: 'A', label: 'बाहिरी कोण अनासन्न भित्री कोणहरूको योगफल बराबर हुन्छ (Ext = Int₁ + Int₂)' },
      { key: 'B', label: 'बाहिरी कोण भित्री कोण भन्दा सानो हुन्छ' },
      { key: 'C', label: 'बाहिरी कोण र भित्री कोणको अन्तर बराबर हुन्छ' },
      { key: 'D', label: 'कुनै सम्बन्ध हुँदैन' },
    ],
    answer: 'A',
  },
  {
    np: 'त्रिभुजको असमानता नियम (Triangle Inequality) अनुसार कुनै दुई भुजाको योगफल तेस्रो भुजा भन्दा के हुनुपर्छ?',
    en: 'According to triangle inequality, the sum of any two sides of a triangle must be:',
    options: [
      { key: 'A', label: 'तेस्रो भुजा भन्दा सधैं ठूलो (>)' },
      { key: 'B', label: 'तेस्रो भुजा भन्दा सानो (<)' },
      { key: 'C', label: 'तेस्रो भुजा बराबर (=)' },
      { key: 'D', label: 'कुनै पनि' },
    ],
    answer: 'A',
  },
];

export const TriangleExplorerProperties: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U13-01',
    chapter: 13,
    titleNp: 'त्रिभुज अन्वेषक: गुण र वर्गीकरण',
    titleEn: 'Triangle Explorer: Properties & Classification',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  // Vertices of Triangle ABC on 460x340 SVG
  const [pA, setPA] = useState<Point>({ x: 230, y: 50 });
  const [pB, setPB] = useState<Point>({ x: 90, y: 270 });
  const [pC, setPC] = useState<Point>({ x: 370, y: 270 });
  const [draggingVertex, setDraggingVertex] = useState<'A' | 'B' | 'C' | null>(null);
  const [showExterior, setShowExterior] = useState<boolean>(true);
  const [showInequality, setShowInequality] = useState<boolean>(true);

  // Side lengths (in scaled cm, where 25px = 1cm)
  const pxToCm = 25;
  const sideC = dist(pA, pB) / pxToCm; // AB
  const sideA = dist(pB, pC) / pxToCm; // BC
  const sideB = dist(pC, pA) / pxToCm; // CA

  // Interior angles
  const angA = angleAt(pB, pA, pC);
  const angB = angleAt(pA, pB, pC);
  const angC = angleAt(pA, pC, pB);
  const angleSum = Math.round(angA + angB + angC);

  // Classify by sides
  let sideTypeNp = 'विषमबाहु (Scalene)';
  let sideTypeEn = 'Scalene';
  const tol = 0.2;
  const eqAB = Math.abs(sideC - sideA) < tol;
  const eqBC = Math.abs(sideA - sideB) < tol;
  const eqCA = Math.abs(sideB - sideC) < tol;

  if (eqAB && eqBC) {
    sideTypeNp = 'समबाहु (Equilateral)';
    sideTypeEn = 'Equilateral';
  } else if (eqAB || eqBC || eqCA) {
    sideTypeNp = 'समद्विबाहु (Isosceles)';
    sideTypeEn = 'Isosceles';
  }

  // Classify by angles
  let angleTypeNp = 'न्यूनकोण (Acute-angled)';
  let angleTypeEn = 'Acute-angled';
  const maxAng = Math.max(angA, angB, angC);
  if (Math.abs(maxAng - 90) < 1.5) {
    angleTypeNp = 'समकोण (Right-angled)';
    angleTypeEn = 'Right-angled';
  } else if (maxAng > 90.5) {
    angleTypeNp = 'अधिककोण (Obtuse-angled)';
    angleTypeEn = 'Obtuse-angled';
  }

  // Largest and Smallest Angle & Opposite Side
  const anglesArr = [
    { name: 'A', val: angA, oppSideName: 'BC (a)', oppVal: sideA },
    { name: 'B', val: angB, oppSideName: 'CA (b)', oppVal: sideB },
    { name: 'C', val: angC, oppSideName: 'AB (c)', oppVal: sideC },
  ];
  anglesArr.sort((x, y) => x.val - y.val);
  const smallest = anglesArr[0];
  const largest = anglesArr[2];

  // Exterior angle at C: extend BC past C
  const extLength = 80;
  const dxBC = pC.x - pB.x;
  const dyBC = pC.y - pB.y;
  const lenBC = Math.hypot(dxBC, dyBC) || 1;
  const pD = {
    x: pC.x + (dxBC / lenBC) * extLength,
    y: pC.y + (dyBC / lenBC) * extLength,
  };
  const exteriorAngleC = 180 - angC;
  const remoteInteriorSum = angA + angB;

  // Presets
  const applyPreset = (type: 'equilateral' | 'right' | 'isosceles' | 'obtuse') => {
    if (type === 'equilateral') {
      setPA({ x: 230, y: 70 });
      setPB({ x: 110, y: 277 });
      setPC({ x: 350, y: 277 });
    } else if (type === 'right') {
      setPA({ x: 120, y: 80 });
      setPB({ x: 120, y: 270 });
      setPC({ x: 360, y: 270 });
    } else if (type === 'isosceles') {
      setPA({ x: 230, y: 60 });
      setPB({ x: 130, y: 270 });
      setPC({ x: 330, y: 270 });
    } else if (type === 'obtuse') {
      setPA({ x: 100, y: 110 });
      setPB({ x: 190, y: 270 });
      setPC({ x: 380, y: 270 });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggingVertex) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(20, Math.min(440, e.clientX - rect.left));
    const y = Math.max(20, Math.min(320, e.clientY - rect.top));

    if (draggingVertex === 'A') setPA({ x, y });
    else if (draggingVertex === 'B') setPB({ x, y });
    else if (draggingVertex === 'C') setPC({ x, y });
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! शीर्षबिन्दुहरूलाई तानेर विभिन्न त्रिभुजहरू (समबाहु, समद्विबाहु, समकोण आदि) बनाउनुहोस् र तीन भित्री कोणको योगफल १८०° तथा बाहिरी कोणको सम्बन्ध प्रत्यक्ष जाँच्नुहोस्!',
        'Welcome! Drag the vertices to explore triangle classifications, side lengths, the 180° interior angle sum, and the exterior angle theorem!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Presets Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          <button
            onClick={() => applyPreset('equilateral')}
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
            🔺 {L('समबाहु (Equilateral)', 'Equilateral')}
          </button>
          <button
            onClick={() => applyPreset('right')}
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
            📐 {L('समकोण (Right-angled)', 'Right-angled')}
          </button>
          <button
            onClick={() => applyPreset('isosceles')}
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
            🔺 {L('समद्विबाहु (Isosceles)', 'Isosceles')}
          </button>
          <button
            onClick={() => applyPreset('obtuse')}
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
            📐 {L('अधिककोण (Obtuse)', 'Obtuse')}
          </button>
        </div>

        {/* Main Interactive Stage */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 480px) minmax(280px, 1fr)',
            gap: 16,
            alignItems: 'start',
          }}
        >
          {/* Interactive SVG Geometry Board */}
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
              height={340}
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
                <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#F1F5F9" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width={460} height={340} fill="url(#gridPattern)" />

              {/* Extended line for exterior angle at C */}
              {showExterior && (
                <g>
                  <line
                    x1={pC.x}
                    y1={pC.y}
                    x2={pD.x}
                    y2={pD.y}
                    stroke="#D97706"
                    strokeWidth="2"
                    strokeDasharray="4,4"
                  />
                  <circle cx={pD.x} cy={pD.y} r="3" fill="#D97706" />
                  <text x={pD.x + 6} y={pD.y + 4} fontSize="11" fill="#B45309" fontWeight="700">
                    D
                  </text>
                  <text
                    x={pC.x + 18}
                    y={pC.y - 12}
                    fontSize="11"
                    fill="#B45309"
                    fontWeight="800"
                  >
                    {fmt(exteriorAngleC.toFixed(0))}°
                  </text>
                </g>
              )}

              {/* Triangle Polygon Fill & Stroke */}
              <polygon
                points={`${pA.x},${pA.y} ${pB.x},${pB.y} ${pC.x},${pC.y}`}
                fill="#EFF6FF"
                fillOpacity="0.7"
                stroke="#2563EB"
                strokeWidth="2.5"
              />

              {/* Side Length Labels */}
              {/* c = AB */}
              <text
                x={(pA.x + pB.x) / 2 - 25}
                y={(pA.y + pB.y) / 2}
                fontSize="11"
                fill="#1E40AF"
                fontWeight="700"
              >
                c = {fmt(sideC.toFixed(1))} cm
              </text>
              {/* a = BC */}
              <text
                x={(pB.x + pC.x) / 2 - 20}
                y={(pB.y + pC.y) / 2 + 18}
                fontSize="11"
                fill="#1E40AF"
                fontWeight="700"
              >
                a = {fmt(sideA.toFixed(1))} cm
              </text>
              {/* b = CA */}
              <text
                x={(pC.x + pA.x) / 2 + 10}
                y={(pC.y + pA.y) / 2}
                fontSize="11"
                fill="#1E40AF"
                fontWeight="700"
              >
                b = {fmt(sideB.toFixed(1))} cm
              </text>

              {/* Interior Angle Labels */}
              <text x={pA.x - 12} y={pA.y + 24} fontSize="11" fill="#047857" fontWeight="800">
                {fmt(angA.toFixed(0))}°
              </text>
              <text x={pB.x + 16} y={pB.y - 8} fontSize="11" fill="#047857" fontWeight="800">
                {fmt(angB.toFixed(0))}°
              </text>
              <text x={pC.x - 34} y={pC.y - 8} fontSize="11" fill="#047857" fontWeight="800">
                {fmt(angC.toFixed(0))}°
              </text>

              {/* Draggable Vertex Circles */}
              {[
                { id: 'A', p: pA, color: '#3B82F6' },
                { id: 'B', p: pB, color: '#10B981' },
                { id: 'C', p: pC, color: '#F59E0B' },
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
              💡 {L('शीर्षबिन्दुहरू A, B, C लाई माउस वा औंलाले तानेर आकार बदल्नुहोस्।', 'Drag vertices A, B, C with mouse or touch to manipulate the triangle.')}
            </div>
          </div>

          {/* Right Panel: Measurements, Classification & Properties */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Classification Badge Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: 14,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>
                {L('त्रिभुजको वर्गीकरण (Classification):', 'Triangle Classification:')}
              </span>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <span
                  style={{
                    backgroundColor: '#ECFDF5',
                    color: '#065F46',
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 800,
                    border: '1px solid #A7F3D0',
                  }}
                >
                  📐 {L(sideTypeNp, sideTypeEn)}
                </span>
                <span
                  style={{
                    backgroundColor: '#EFF6FF',
                    color: '#1D4ED8',
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 800,
                    border: '1px solid #BFDBFE',
                  }}
                >
                  🎯 {L(angleTypeNp, angleTypeEn)}
                </span>
              </div>
            </div>

            {/* Sum of Angles Property */}
            <div
              style={{
                backgroundColor: '#F0FDF4',
                borderRadius: 10,
                border: '1px solid #86EFAC',
                padding: 12,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: '#166534' }}>
                {L('भित्री कोणहरूको योगफल (Angle Sum Property):', 'Interior Angle Sum:')}
              </div>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: 16,
                  fontWeight: 800,
                  color: '#065F46',
                  marginTop: 4,
                }}
              >
                ∠A + ∠B + ∠C = {fmt(angA.toFixed(0))}° + {fmt(angB.toFixed(0))}° +{' '}
                {fmt(angC.toFixed(0))}° = {fmt(angleSum)}°
              </div>
            </div>

            {/* Exterior Angle Relationship */}
            <div
              style={{
                backgroundColor: '#FFFBEB',
                borderRadius: 10,
                border: '1px solid #FCD34D',
                padding: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: 12, color: '#92400E' }}>
                  {L('बाहिरी कोण सम्बन्ध (Exterior Angle Theorem):', 'Exterior Angle Theorem:')}
                </strong>
                <label style={{ fontSize: 11, color: '#B45309', display: 'flex', gap: 4 }}>
                  <input
                    type="checkbox"
                    checked={showExterior}
                    onChange={(e) => setShowExterior(e.target.checked)}
                  />
                  {L('देखाउने', 'Show')}
                </label>
              </div>
              {showExterior && (
                <div
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 13,
                    color: '#B45309',
                    marginTop: 6,
                    lineHeight: 1.5,
                  }}
                >
                  <div>बाहिरी ∠ACD = {fmt(exteriorAngleC.toFixed(0))}°</div>
                  <div>
                    अनासन्न भित्री कोण (∠A + ∠B) = {fmt(angA.toFixed(0))}° + {fmt(angB.toFixed(0))}° ={' '}
                    {fmt(remoteInteriorSum.toFixed(0))}°
                  </div>
                  <div style={{ color: '#047857', fontWeight: 700, marginTop: 2 }}>
                    ✓ बाहिरी कोण = अनासन्न भित्री कोणहरूको योगफल!
                  </div>
                </div>
              )}
            </div>

            {/* Triangle Inequality */}
            <div
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: 10,
                border: '1px solid #E2E8F0',
                padding: 12,
                fontSize: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: '#334155' }}>
                  {L('त्रिभुज असमानता नियम (Triangle Inequality):', 'Triangle Inequality Theorem:')}
                </strong>
                <label style={{ fontSize: 11, color: '#64748B', display: 'flex', gap: 4 }}>
                  <input
                    type="checkbox"
                    checked={showInequality}
                    onChange={(e) => setShowInequality(e.target.checked)}
                  />
                  {L('देखाउने', 'Show')}
                </label>
              </div>
              {showInequality && (
                <div style={{ marginTop: 6, color: '#475569', lineHeight: 1.6 }}>
                  <div>
                    a + b = {fmt((sideA + sideB).toFixed(1))} &gt; c ({fmt(sideC.toFixed(1))}) ✓
                  </div>
                  <div>
                    b + c = {fmt((sideB + sideC).toFixed(1))} &gt; a ({fmt(sideA.toFixed(1))}) ✓
                  </div>
                  <div>
                    c + a = {fmt((sideC + sideA).toFixed(1))} &gt; b ({fmt(sideB.toFixed(1))}) ✓
                  </div>
                </div>
              )}
            </div>

            {/* Largest/Smallest Angle vs Opposite Side */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 10,
                border: '1px solid #E2E8F0',
                padding: 10,
                fontSize: 12,
                color: '#475569',
              }}
            >
              <strong>{L('कोण र सम्मुख भुजाको सम्बन्ध:', 'Angle & Opposite Side Relation:')}</strong>
              <div style={{ marginTop: 4 }}>
                • {L('सबैभन्दा ठूलो कोण:', 'Largest Angle:')} ∠{largest.name} ({fmt(largest.val.toFixed(0))}°) → {L('सम्मुख भुजा सबभन्दा लामो:', 'Opposite Side Longest:')} {largest.oppSideName} ({fmt(largest.oppVal.toFixed(1))} cm)
              </div>
              <div>
                • {L('सबैभन्दा सानो कोण:', 'Smallest Angle:')} ∠{smallest.name} ({fmt(smallest.val.toFixed(0))}°) → {L('सम्मुख भुजा सबभन्दा छोटो:', 'Opposite Side Shortest:')} {smallest.oppSideName} ({fmt(smallest.oppVal.toFixed(1))} cm)
              </div>
            </div>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};

export default TriangleExplorerProperties;
