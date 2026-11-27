import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';

interface PresetSystem {
  id: string;
  nameNp: string;
  nameEn: string;
  a1: number;
  b1: number;
  c1: number;
  a2: number;
  b2: number;
  c2: number;
}

const PRESETS: PresetSystem[] = [
  {
    id: 'p1',
    nameNp: 'पाठ्यपुस्तक उदाहरण 1: x + y = 5 र x - y = 1',
    nameEn: 'Textbook Example 1: x + y = 5 and x - y = 1',
    a1: 1,
    b1: 1,
    c1: 5,
    a2: 1,
    b2: -1,
    c2: 1,
  },
  {
    id: 'p2',
    nameNp: 'पाठ्यपुस्तक उदाहरण 2: 2x + y = 7 र x - 2y = 1',
    nameEn: 'Textbook Example 2: 2x + y = 7 and x - 2y = 1',
    a1: 2,
    b1: 1,
    c1: 7,
    a2: 1,
    b2: -2,
    c2: 1,
  },
  {
    id: 'p3',
    nameNp: 'समानान्तर रेखा (No Solution): 2x + 3y = 6 र 2x + 3y = 12',
    nameEn: 'Parallel Lines (No Solution): 2x + 3y = 6 and 2x + 3y = 12',
    a1: 2,
    b1: 3,
    c1: 6,
    a2: 2,
    b2: 3,
    c2: 12,
  },
  {
    id: 'p4',
    nameNp: 'संपाती रेखा (Infinite Solutions): x + 2y = 4 र 2x + 4y = 8',
    nameEn: 'Coincident Lines (Infinite): x + 2y = 4 and 2x + 4y = 8',
    a1: 1,
    b1: 2,
    c1: 4,
    a2: 2,
    b2: 4,
    c2: 8,
  },
];

const QUIZ_QUESTIONS = [
  {
    np: 'दुई रैखिक समीकरणका रेखाहरूले एक अर्कालाई प्रतिच्छेदन गर्दा प्रतिच्छेदन बिन्दु (Intersection point) ले के जनाउँछ?',
    en: 'What does the intersection point of two linear graphs represent?',
    options: [
      { key: 'A', label: 'Unique common solution of the equations (x, y)' },
      { key: 'B', label: 'No solution case' },
      { key: 'C', label: 'Infinitely many solutions' },
      { key: 'D', label: 'Slope of the line' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि दुई रेखाहरू समानान्तर (Parallel) छन् भने तिनीहरूको कतिpcs साझा समाधान हुन्छ?',
    en: 'If two lines are parallel, how many shared solutions exist?',
    options: [
      { key: 'A', label: 'No solution' },
      { key: 'B', label: 'One solution' },
      { key: 'C', label: 'Infinitely many solutions' },
      { key: 'D', label: 'Two solutions' },
    ],
    answer: 'A',
  },
  {
    np: 'दुई रेखाहरू एकमाथि अर्को खप्टिएका (Coincident) छन् भने कतिpcs समाधान हुन्छन्?',
    en: 'If two lines are coincident (overlapping), how many solutions exist?',
    options: [
      { key: 'A', label: 'Infinitely many solutions (Infinitely many solutions)' },
      { key: 'B', label: 'Only one' },
      { key: 'C', label: 'Zero' },
      { key: 'D', label: 'Negative' },
    ],
    answer: 'A',
  },
];

export const LinearEquationGraphLab: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U11-01',
    chapter: 11,
    titleNp: 'रैखिक समीकरण लेखाचित्र प्रयोगशाला',
    titleEn: 'Linear Equation Graph Laboratory',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [a1, setA1] = useState<number>(1);
  const [b1, setB1] = useState<number>(1);
  const [c1, setC1] = useState<number>(5);

  const [a2, setA2] = useState<number>(1);
  const [b2, setB2] = useState<number>(-1);
  const [c2, setC2] = useState<number>(1);

  const loadPreset = (p: PresetSystem) => {
    setA1(p.a1);
    setB1(p.b1);
    setC1(p.c1);
    setA2(p.a2);
    setB2(p.b2);
    setC2(p.c2);
  };

  // Solve system using Cramer's rule:
  // a1*x + b1*y = c1
  // a2*x + b2*y = c2
  const D = a1 * b2 - a2 * b1;
  const Dx = c1 * b2 - c2 * b1;
  const Dy = a1 * c2 - a2 * c1;

  let solutionType: 'unique' | 'parallel' | 'coincident' = 'unique';
  let solX: number | null = null;
  let solY: number | null = null;

  if (Math.abs(D) < 1e-6) {
    if (Math.abs(Dx) < 1e-6 && Math.abs(Dy) < 1e-6) {
      solutionType = 'coincident';
    } else {
      solutionType = 'parallel';
    }
  } else {
    solutionType = 'unique';
    solX = Dx / D;
    solY = Dy / D;
  }

  // SVG Coordinate Setup
  // Center is (200, 200), domain is -8 to +8, range is -8 to +8
  const width = 400;
  const height = 400;
  const scale = 20; // 20px per unit
  const cx = width / 2;
  const cy = height / 2;

  const toSvgX = (x: number) => cx + x * scale;
  const toSvgY = (y: number) => cy - y * scale;

  // Calculate points for line 1 (a1*x + b1*y = c1 => y = (c1 - a1*x)/b1)
  const getLinePoints = (a: number, b: number, c: number) => {
    if (Math.abs(b) < 1e-6) {
      // vertical line x = c/a
      const xVal = c / a;
      return {
        x1: toSvgX(xVal),
        y1: toSvgY(-8),
        x2: toSvgX(xVal),
        y2: toSvgY(8),
      };
    }
    const xMin = -8;
    const xMax = 8;
    const yMin = (c - a * xMin) / b;
    const yMax = (c - a * xMax) / b;
    return {
      x1: toSvgX(xMin),
      y1: toSvgY(yMin),
      x2: toSvgX(xMax),
      y2: toSvgY(yMax),
    };
  };

  const line1Points = getLinePoints(a1, b1, c1);
  const line2Points = getLinePoints(a2, b2, c2);

  // Table of values for line 1 and 2
  const xSample = [-2, 0, 2, 4];
  const table1 = xSample.map((x) => ({
    x,
    y: Math.abs(b1) > 1e-6 ? ((c1 - a1 * x) / b1).toFixed(1) : '∞',
  }));
  const table2 = xSample.map((x) => ({
    x,
    y: Math.abs(b2) > 1e-6 ? ((c2 - a2 * x) / b2).toFixed(1) : '∞',
  }));

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! दुई अज्ञात राशि भएका रैखिक समीकरणहरूलाई लेखाचित्र (Graph) मा खिचेर प्रतिच्छेदन बिन्दुबाट समाधान (x, y) पत्ता लगाउनुहोस्!',
        'Welcome! Plot simultaneous linear equations on the coordinate Cartesian grid and find the intersection solution (x, y) dynamically!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Preset Selectors */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => loadPreset(p)}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid #CBD5E1',
                backgroundColor: '#F8FAFC',
                color: '#334155',
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: isNe ? FONT_NP : 'inherit',
                fontWeight: 600,
              }}
            >
              {L(p.nameNp, p.nameEn)}
            </button>
          ))}
        </div>

        {/* Coefficients Control Panel */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            padding: 16,
          }}
        >
          {/* Line 1 Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#2563EB',
                }}
              />
              <strong style={{ fontSize: 14, color: '#1E40AF' }}>
                {L('Line 1:', 'Line 1:')}{' '}
                <span style={{ fontFamily: 'monospace' }}>
                  {a1}x {b1 >= 0 ? `+ ${b1}` : `- ${Math.abs(b1)}`}y = {c1}
                </span>
              </strong>
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
              <label>
                a₁:{' '}
                <input
                  type="number"
                  value={a1}
                  onChange={(e) => setA1(Number(e.target.value) || 0)}
                  style={{ width: 45, padding: '2px 4px' }}
                />
              </label>
              <label>
                b₁:{' '}
                <input
                  type="number"
                  value={b1}
                  onChange={(e) => setB1(Number(e.target.value) || 0)}
                  style={{ width: 45, padding: '2px 4px' }}
                />
              </label>
              <label>
                c₁:{' '}
                <input
                  type="number"
                  value={c1}
                  onChange={(e) => setC1(Number(e.target.value) || 0)}
                  style={{ width: 45, padding: '2px 4px' }}
                />
              </label>
            </div>
          </div>

          {/* Line 2 Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#DC2626',
                }}
              />
              <strong style={{ fontSize: 14, color: '#991B1B' }}>
                {L('Line 2:', 'Line 2:')}{' '}
                <span style={{ fontFamily: 'monospace' }}>
                  {a2}x {b2 >= 0 ? `+ ${b2}` : `- ${Math.abs(b2)}`}y = {c2}
                </span>
              </strong>
            </div>
            <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
              <label>
                a₂:{' '}
                <input
                  type="number"
                  value={a2}
                  onChange={(e) => setA2(Number(e.target.value) || 0)}
                  style={{ width: 45, padding: '2px 4px' }}
                />
              </label>
              <label>
                b₂:{' '}
                <input
                  type="number"
                  value={b2}
                  onChange={(e) => setB2(Number(e.target.value) || 0)}
                  style={{ width: 45, padding: '2px 4px' }}
                />
              </label>
              <label>
                c₂:{' '}
                <input
                  type="number"
                  value={c2}
                  onChange={(e) => setC2(Number(e.target.value) || 0)}
                  style={{ width: 45, padding: '2px 4px' }}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Main Graph & Table Stage */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(340px, 420px) minmax(280px, 1fr)',
            gap: 16,
            alignItems: 'start',
          }}
        >
          {/* SVG Coordinate Grid */}
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
              width={width}
              height={height}
              style={{ overflow: 'hidden', backgroundColor: '#F8FAFC', borderRadius: 8 }}
            >
              <defs>
                <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width={width} height={height} fill="url(#smallGrid)" />

              {/* X and Y Axes */}
              <line x1={0} y1={cy} x2={width} y2={cy} stroke="#64748B" strokeWidth="2" />
              <line x1={cx} y1={0} x2={cx} y2={height} stroke="#64748B" strokeWidth="2" />

              {/* Axis labels & ticks */}
              {[-6, -4, -2, 2, 4, 6].map((u) => (
                <g key={u}>
                  <line
                    x1={toSvgX(u)}
                    y1={cy - 4}
                    x2={toSvgX(u)}
                    y2={cy + 4}
                    stroke="#475569"
                    strokeWidth="1.5"
                  />
                  <text
                    x={toSvgX(u)}
                    y={cy + 15}
                    fontSize="10"
                    fill="#64748B"
                    textAnchor="middle"
                  >
                    {u}
                  </text>
                  <line
                    x1={cx - 4}
                    y1={toSvgY(u)}
                    x2={cx + 4}
                    y2={toSvgY(u)}
                    stroke="#475569"
                    strokeWidth="1.5"
                  />
                  <text
                    x={cx - 10}
                    y={toSvgY(u) + 4}
                    fontSize="10"
                    fill="#64748B"
                    textAnchor="end"
                  >
                    {u}
                  </text>
                </g>
              ))}
              <text x={width - 15} y={cy - 6} fontSize="12" fontWeight="700" fill="#334155">
                X
              </text>
              <text x={cx + 8} y={15} fontSize="12" fontWeight="700" fill="#334155">
                Y
              </text>

              {/* Line 1 (Blue) */}
              <line
                x1={line1Points.x1}
                y1={line1Points.y1}
                x2={line1Points.x2}
                y2={line1Points.y2}
                stroke="#2563EB"
                strokeWidth="2.5"
              />

              {/* Line 2 (Red) */}
              <line
                x1={line2Points.x1}
                y1={line2Points.y1}
                x2={line2Points.x2}
                y2={line2Points.y2}
                stroke="#DC2626"
                strokeWidth="2.5"
                strokeDasharray={solutionType === 'coincident' ? '6,4' : undefined}
              />

              {/* Intersection Point Highlight */}
              {solutionType === 'unique' && solX !== null && solY !== null && (
                <g>
                  {/* Dashed lines to axes */}
                  <line
                    x1={toSvgX(solX)}
                    y1={cy}
                    x2={toSvgX(solX)}
                    y2={toSvgY(solY)}
                    stroke="#059669"
                    strokeDasharray="3,3"
                  />
                  <line
                    x1={cx}
                    y1={toSvgY(solY)}
                    x2={toSvgX(solX)}
                    y2={toSvgY(solY)}
                    stroke="#059669"
                    strokeDasharray="3,3"
                  />
                  {/* Intersect point circle */}
                  <circle
                    cx={toSvgX(solX)}
                    cy={toSvgY(solY)}
                    r="6"
                    fill="#10B981"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                  <text
                    x={toSvgX(solX) + 8}
                    y={toSvgY(solY) - 8}
                    fontSize="12"
                    fontWeight="800"
                    fill="#065F46"
                  >
                    ({solX.toFixed(1)}, {solY.toFixed(1)})
                  </text>
                </g>
              )}
            </svg>
            <div style={{ marginTop: 6, fontSize: 11, color: '#64748B' }}>
              {L('नीलो = रेखा 1 | रातो = रेखा 2 | हरियो बिन्दु = प्रतिच्छेदन बिन्दु', 'Blue = Line 1 | Red = Line 2 | Green dot = Intersection point')}
            </div>
          </div>

          {/* Right: Solution Status & Tables */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Status Banner */}
            <div
              style={{
                padding: 16,
                borderRadius: 12,
                backgroundColor:
                  solutionType === 'unique'
                    ? '#ECFDF5'
                    : solutionType === 'parallel'
                    ? '#FEF2F2'
                    : '#EFF6FF',
                border:
                  solutionType === 'unique'
                    ? '2px solid #6EE7B7'
                    : solutionType === 'parallel'
                    ? '2px solid #FCA5A5'
                    : '2px solid #93C5FD',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>
                {L('समाधानको प्रकार (Nature of Solution):', 'Nature of Solution:')}
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  marginTop: 4,
                  color:
                    solutionType === 'unique'
                      ? '#065F46'
                      : solutionType === 'parallel'
                      ? '#991B1B'
                      : '#1E40AF',
                }}
              >
                {solutionType === 'unique' &&
                  L(
                    `एकल प्रतिच्छेदन बिन्दु: x = ${fmt(solX?.toFixed(1) || '0')}, y = ${fmt(
                      solY?.toFixed(1) || '0'
                    )}`,
                    `Unique Intersection: (x, y) = (${solX?.toFixed(1)}, ${solY?.toFixed(1)})`
                  )}
                {solutionType === 'parallel' &&
                  L('समानान्तर रेखाहरू: कुनै साझा समाधान छैन (No Solution)', 'Parallel Lines: No Solution')}
                {solutionType === 'coincident' &&
                  L(
                    'संपाती रेखाहरू: अनन्त साझा समाधानहरू छन् (Infinitely Many Solutions)',
                    'Coincident Lines: Infinitely Many Solutions'
                  )}
              </div>
            </div>

            {/* Table of Values */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: 14,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 8 }}>
                {L('निर्देशाङ्क तालिका (Tables of Values):', 'Tables of Values:')}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {/* Table 1 */}
                <div style={{ fontSize: 11, color: '#1E40AF' }}>
                  <strong>Line 1</strong>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 4 }}>
                    <thead>
                      <tr style={{ background: '#EFF6FF' }}>
                        <th style={{ border: '1px solid #CBD5E1', padding: 3 }}>x</th>
                        <th style={{ border: '1px solid #CBD5E1', padding: 3 }}>y</th>
                      </tr>
                    </thead>
                    <tbody>
                      {table1.map((r, i) => (
                        <tr key={i} style={{ textAlign: 'center' }}>
                          <td style={{ border: '1px solid #CBD5E1', padding: 2 }}>{fmt(r.x)}</td>
                          <td style={{ border: '1px solid #CBD5E1', padding: 2 }}>{fmt(r.y)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Table 2 */}
                <div style={{ fontSize: 11, color: '#991B1B' }}>
                  <strong>Line 2</strong>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 4 }}>
                    <thead>
                      <tr style={{ background: '#FEF2F2' }}>
                        <th style={{ border: '1px solid #CBD5E1', padding: 3 }}>x</th>
                        <th style={{ border: '1px solid #CBD5E1', padding: 3 }}>y</th>
                      </tr>
                    </thead>
                    <tbody>
                      {table2.map((r, i) => (
                        <tr key={i} style={{ textAlign: 'center' }}>
                          <td style={{ border: '1px solid #CBD5E1', padding: 2 }}>{fmt(r.x)}</td>
                          <td style={{ border: '1px solid #CBD5E1', padding: 2 }}>{fmt(r.y)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};

export default LinearEquationGraphLab;
