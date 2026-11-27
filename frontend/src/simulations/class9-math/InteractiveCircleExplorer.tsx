import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface Point {
  x: number;
  y: number;
}

const QUIZ_QUESTIONS = [
  {
    np: 'वृत्तको केन्द्रबाट परिधिसम्मको दुरीलाई के भनिन्छ?',
    en: 'What is the distance from the centre of a circle to any point on its circumference called?',
    options: [
      { key: 'A', label: 'Radius' },
      { key: 'B', label: 'Diameter' },
      { key: 'C', label: 'Chord' },
      { key: 'D', label: 'Arc' },
    ],
    answer: 'A',
  },
  {
    np: 'वृत्तको सबैभन्दा लामो जीवा (Longest Chord) कुन हो?',
    en: 'What is the longest possible chord in any circle?',
    options: [
      { key: 'A', label: 'Diameter (passing through the centre)' },
      { key: 'B', label: 'Radius' },
      { key: 'C', label: 'Arc' },
      { key: 'D', label: 'Tangent' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि वृत्तको Radius 7 cm भए यसको परिधि (Circumference) कति हुन्छ? (π = 22/7)',
    en: 'If the radius of a circle is 7 cm, what is its circumference? (π = 22/7)',
    options: [
      { key: 'A', label: '44 cm (2πr = 2 × 22/7 × 7 = 44)' },
      { key: 'B', label: '22 cm' },
      { key: 'C', label: '14 cm' },
      { key: 'D', label: '154 cm' },
    ],
    answer: 'A',
  },
];

export const InteractiveCircleExplorer: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U16-01',
    chapter: 16,
    titleNp: 'अन्तरक्रियात्मक वृत्त अन्वेषक: अङ्गहरू र नाप',
    titleEn: 'Interactive Circle Explorer: Parts & Measurements',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  // Circle center (SVG 460x320)
  const cx = 230;
  const cy = 160;

  // Radius slider (in cm: 4 to 8 cm, where 22px = 1cm)
  const pxPerCm = 22;
  const [radiusCm, setRadiusCm] = useState<number>(6);
  const rPx = radiusCm * pxPerCm;

  // Chord endpoints angle in radians on circumference
  // Angle for point C and point D
  const [angC, setAngC] = useState<number>(0.6); // radians
  const [angD, setAngD] = useState<number>(2.5); // radians

  // Display toggles
  const [showRadius, setShowRadius] = useState<boolean>(true);
  const [showDiameter, setShowDiameter] = useState<boolean>(true);
  const [showChord, setShowChord] = useState<boolean>(true);
  const [showPerpendicular, setShowPerpendicular] = useState<boolean>(true);

  // Dragging point C or D
  const [draggingPoint, setDraggingPoint] = useState<'C' | 'D' | null>(null);

  // Positions on circle
  const pC: Point = { x: cx + rPx * Math.cos(angC), y: cy + rPx * Math.sin(angC) };
  const pD: Point = { x: cx + rPx * Math.cos(angD), y: cy + rPx * Math.sin(angD) };

  // Midpoint of chord CD is M
  const pM: Point = { x: (pC.x + pD.x) / 2, y: (pC.y + pD.y) / 2 };

  // Length of chord CD in cm
  const chordLenPx = Math.hypot(pD.x - pC.x, pD.y - pC.y);
  const chordLenCm = (chordLenPx / pxPerCm).toFixed(1);

  // Distance from center to chord OM in cm
  const perpDistPx = Math.hypot(pM.x - cx, pM.y - cy);
  const perpDistCm = (perpDistPx / pxPerCm).toFixed(1);

  // Diameter in cm
  const diameterCm = (radiusCm * 2).toFixed(1);
  // Circumference 2*pi*r
  const circumCm = (2 * Math.PI * radiusCm).toFixed(1);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggingPoint) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const angle = Math.atan2(mouseY - cy, mouseX - cx);

    if (draggingPoint === 'C') setAngC(angle);
    else if (draggingPoint === 'D') setAngD(angle);
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! वृत्तको केन्द्र, Radius, व्यास, जीवा र केन्द्रबाट जीवामा खिचिएको लम्बको दुरी प्रत्यक्ष तन्काएर सबैभन्दा लामो जीवा (व्यास) को रहस्य पत्ता लगाउनुहोस्!',
        'Welcome! Explore the center, radius, diameter, chords, and perpendicular distance from the center. Discover that diameter is the longest possible chord!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Controls Bar */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            padding: 14,
            display: 'grid',
            gridTemplateColumns: 'minmax(200px, 1fr) minmax(280px, 1.4fr)',
            gap: 16,
            alignItems: 'center',
          }}
        >
          {/* Radius Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#334155' }}>
              <span>{L('Radius (Radius r):', 'Radius r:')}</span>
              <strong style={{ color: '#0F766E' }}>{fmt(radiusCm)} cm</strong>
            </div>
            <input
              type="range"
              min={4}
              max={7.5}
              step={0.5}
              value={radiusCm}
              onChange={(e) => setRadiusCm(Number(e.target.value))}
              style={{ width: '100%', marginTop: 6, accentColor: '#0D9488' }}
            />
          </div>

          {/* Layer Visibility Toggles */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', color: '#166534' }}>
              <input type="checkbox" checked={showRadius} onChange={(e) => setShowRadius(e.target.checked)} />
              {L('Radius', 'Radius')}
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', color: '#1E40AF' }}>
              <input type="checkbox" checked={showDiameter} onChange={(e) => setShowDiameter(e.target.checked)} />
              {L('Diameter', 'Diameter')}
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', color: '#92400E' }}>
              <input type="checkbox" checked={showChord} onChange={(e) => setShowChord(e.target.checked)} />
              {L('जीवा (Chord CD)', 'Chord CD')}
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', color: '#DC2626' }}>
              <input type="checkbox" checked={showPerpendicular} onChange={(e) => setShowPerpendicular(e.target.checked)} />
              {L('लम्ब (Perpendicular OM)', 'Perp OM')}
            </label>
          </div>
        </div>

        {/* Main Interactive Circle Stage */}
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
              onMouseUp={() => setDraggingPoint(null)}
              onMouseLeave={() => setDraggingPoint(null)}
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: 8,
                userSelect: 'none',
                cursor: draggingPoint ? 'grabbing' : 'default',
              }}
            >
              {/* Grid Background */}
              <defs>
                <pattern id="circGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#F1F5F9" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width={460} height={320} fill="url(#circGrid)" />

              {/* Main Circle Circumference */}
              <circle
                cx={cx}
                cy={cy}
                r={rPx}
                fill="#F0FDFA"
                fillOpacity="0.5"
                stroke="#0D9488"
                strokeWidth="2.5"
              />

              {/* Diameter line (Horizontal through center) */}
              {showDiameter && (
                <g>
                  <line
                    x1={cx - rPx}
                    y1={cy}
                    x2={cx + rPx}
                    y2={cy}
                    stroke="#3B82F6"
                    strokeWidth="2"
                    strokeDasharray="4,4"
                  />
                  <circle cx={cx - rPx} cy={cy} r="3" fill="#3B82F6" />
                  <circle cx={cx + rPx} cy={cy} r="3" fill="#3B82F6" />
                  <text x={cx - rPx - 14} y={cy + 4} fontSize="11" fontWeight="700" fill="#1D4ED8">
                    X
                  </text>
                  <text x={cx + rPx + 6} y={cy + 4} fontSize="11" fontWeight="700" fill="#1D4ED8">
                    Y
                  </text>
                  <text x={cx + 10} y={cy - 8} fontSize="10" fill="#1D4ED8" fontWeight="600">
                    d = {fmt(diameterCm)} cm
                  </text>
                </g>
              )}

              {/* Radius line (from O to (cx, cy - rPx)) */}
              {showRadius && (
                <g>
                  <line x1={cx} y1={cy} x2={cx} y2={cy - rPx} stroke="#16A34A" strokeWidth="2.5" />
                  <circle cx={cx} cy={cy - rPx} r="4" fill="#16A34A" />
                  <text x={cx + 6} y={cy - rPx / 2} fontSize="11" fontWeight="700" fill="#15803D">
                    r = {fmt(radiusCm)} cm
                  </text>
                </g>
              )}

              {/* Chord CD */}
              {showChord && (
                <g>
                  <line x1={pC.x} y1={pC.y} x2={pD.x} y2={pD.y} stroke="#D97706" strokeWidth="3" />
                  {/* Draggable point C */}
                  <g
                    onMouseDown={() => setDraggingPoint('C')}
                    style={{ cursor: 'grab' }}
                  >
                    <circle cx={pC.x} cy={pC.y} r="8" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2" />
                    <text x={pC.x + 10} y={pC.y + 4} fontSize="12" fontWeight="800" fill="#B45309">
                      C
                    </text>
                  </g>
                  {/* Draggable point D */}
                  <g
                    onMouseDown={() => setDraggingPoint('D')}
                    style={{ cursor: 'grab' }}
                  >
                    <circle cx={pD.x} cy={pD.y} r="8" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2" />
                    <text x={pD.x + 10} y={pD.y + 4} fontSize="12" fontWeight="800" fill="#B45309">
                      D
                    </text>
                  </g>
                  <text
                    x={(pC.x + pD.x) / 2}
                    y={(pC.y + pD.y) / 2 + 16}
                    fontSize="11"
                    fontWeight="800"
                    fill="#B45309"
                    textAnchor="middle"
                  >
                    CD = {fmt(chordLenCm)} cm
                  </text>
                </g>
              )}

              {/* Perpendicular from O to CD */}
              {showPerpendicular && (
                <g>
                  <line
                    x1={cx}
                    y1={cy}
                    x2={pM.x}
                    y2={pM.y}
                    stroke="#DC2626"
                    strokeWidth="2"
                    strokeDasharray="3,3"
                  />
                  <circle cx={pM.x} cy={pM.y} r="4" fill="#DC2626" />
                  <text x={pM.x - 12} y={pM.y - 6} fontSize="11" fontWeight="800" fill="#B91C1C">
                    M
                  </text>
                  <text
                    x={(cx + pM.x) / 2 - 14}
                    y={(cy + pM.y) / 2}
                    fontSize="10"
                    fontWeight="700"
                    fill="#B91C1C"
                  >
                    OM = {fmt(perpDistCm)} cm
                  </text>
                </g>
              )}

              {/* Center point O */}
              <circle cx={cx} cy={cy} r="5" fill="#0F766E" stroke="#FFFFFF" strokeWidth="1.5" />
              <text x={cx - 14} y={cy + 14} fontSize="12" fontWeight="800" fill="#0F766E">
                O
              </text>
            </svg>

            <div style={{ marginTop: 6, fontSize: 11, color: '#64748B', textAlign: 'center' }}>
              💡 {L('जीवाका बिन्दुहरू C र D लाई परिधिमा घुमाएर जीवा र लम्बको सम्बन्ध हेर्नुहोस्।', 'Drag chord endpoints C and D along circumference to observe chord length and distance OM.')}
            </div>
          </div>

          {/* Right Panel: Measurements & Key Insights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Live Data Summary Card */}
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
              <strong style={{ fontSize: 13, color: '#1E293B' }}>
                {L('वृत्तका नापहरू (Measurements):', 'Circle Measurements:')}
              </strong>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12 }}>
                <div style={{ backgroundColor: '#F0FDF4', padding: 8, borderRadius: 6, color: '#166534' }}>
                  <strong>{L('Radius (r):', 'Radius:')}</strong> {fmt(radiusCm)} cm
                </div>
                <div style={{ backgroundColor: '#EFF6FF', padding: 8, borderRadius: 6, color: '#1E40AF' }}>
                  <strong>{L('व्यास (d = 2r):', 'Diameter:')}</strong> {fmt(diameterCm)} cm
                </div>
                <div style={{ backgroundColor: '#FFFBEB', padding: 8, borderRadius: 6, color: '#92400E' }}>
                  <strong>{L('जीवाको लम्बाइ (CD):', 'Chord CD:')}</strong> {fmt(chordLenCm)} cm
                </div>
                <div style={{ backgroundColor: '#FEF2F2', padding: 8, borderRadius: 6, color: '#991B1B' }}>
                  <strong>{L('केन्द्रबाट लम्ब दुरी:', 'Perp Distance (OM):')}</strong> {fmt(perpDistCm)} cm
                </div>
              </div>
              <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>
                <strong>{L('परिधि (Circumference = 2πr):', 'Circumference (2πr):')}</strong>{' '}
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0F766E' }}>
                  {fmt(circumCm)} cm
                </span>
              </div>
            </div>

            {/* Core Mathematical Relationship Card */}
            <div
              style={{
                backgroundColor: '#ECFDF5',
                borderRadius: 10,
                border: '1px solid #A7F3D0',
                padding: 12,
                fontSize: 12,
                color: '#065F46',
                lineHeight: 1.5,
              }}
            >
              <strong>{L('📌 प्रमुख नियमहरू (Key Discoveries):', 'Key Discoveries:')}</strong>
              <div style={{ marginTop: 4 }}>
                • <strong>{L('सबैभन्दा लामो जीवा:', 'Longest Chord:')}</strong>{' '}
                {Number(perpDistCm) < 0.3
                  ? L(
                      'जीवा केन्द्र O बाट जाँदा यसको लम्बाइ ठ्याक्कै Diameter बराबर अधिकतम हुन्छ!',
                      'Chord passes through centre O: it becomes the diameter (maximum length)!'
                    )
                  : L(
                      'केन्द्रबाट टाढा जाँदा जीवाको लम्बाइ घट्दै जान्छ।',
                      'As perpendicular distance OM increases, chord length decreases.'
                    )}
              </div>
              <div>
                • <strong>{L('लम्ब र समद्विभाजन:', 'Perpendicular & Bisection:')}</strong>{' '}
                {L(
                  'केन्द्रबाट जिवामा खिचेको लम्बले जीवालाई दुई बराबर भागमा बाँड्दछ (CM = MD)।',
                  'Perpendicular from center to chord bisects it into two equal halves (CM = MD).'
                )}
              </div>
            </div>

            {/* Pythagorean Triangle Inside Circle */}
            <div
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: 10,
                border: '1px solid #E2E8F0',
                padding: 12,
                fontSize: 12,
              }}
            >
              <div style={{ fontWeight: 700, color: '#334155' }}>
                📐 {L('पाइथागोरस सम्बन्ध (Right Triangle △OMC):', 'Pythagorean Relation in △OMC:')}
              </div>
              <div style={{ fontFamily: 'monospace', color: '#0F766E', marginTop: 4 }}>
                OC² = OM² + MC² ⇒ r² = OM² + (CD / 2)²
              </div>
              <div style={{ color: '#64748B', marginTop: 2 }}>
                {fmt(radiusCm)}² = {fmt(perpDistCm)}² + ({fmt((Number(chordLenCm) / 2).toFixed(1))})²
              </div>
            </div>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};

export default InteractiveCircleExplorer;
