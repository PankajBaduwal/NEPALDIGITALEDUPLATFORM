/**
 * CoordinateGraphBuilder.tsx
 * Grade 7 Mathematics – Lesson 12: EQUATION, INEQUALITY AND GRAPH
 * Simulation 3: Coordinate Graph and Linear Graph Builder (2D Interactive Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 180-186)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Grid, TrendingUp, Compass, ArrowRight, Check } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'बिन्दु B(-3, 5) कार्तेसियन समतल (Cartesian plane) को कुन चतुर्थांश (Quadrant) मा पर्छ?',
    en: 'In which quadrant does point B(-3, 5) lie on the Cartesian plane?',
    options: [
      { key: 'A', label: 'Second quadrant (-, +)' },
      { key: 'B', label: 'First quadrant (+, +)' },
      { key: 'C', label: 'Third quadrant (-, -)' },
      { key: 'D', label: 'Fourth quadrant (+, -)' },
    ],
    answer: 'A',
  },
  {
    np: 'समीकरण 3x + y = 6 (y = 6 - 3x) मा यदि x = 1 भए y को मान कति हुन्छ?',
    en: 'In equation 3x + y = 6 (y = 6 - 3x), if x = 1, what is y?',
    options: [
      { key: 'A', label: '3 [ y = 6 - 3(1) = 3 ]' },
      { key: 'B', label: '0' },
      { key: 'C', label: '6' },
      { key: 'D', label: '-3' },
    ],
    answer: 'A',
  },
  {
    np: 'समीकरणको ग्राफ बनाउँदा प्राप्त हुने सरल रेखा कुन अक्षहरूमा आधारित हुन्छ?',
    en: 'On which axes is a linear equation graph drawn?',
    options: [
      { key: 'A', label: 'Horizontal X-axis and vertical Y-axis' },
      { key: 'B', label: 'X-axis only' },
      { key: 'C', label: 'Z-axis' },
      { key: 'D', label: 'Angle line' },
    ],
    answer: 'A',
  },
  {
    np: 'मूलPoint (Origin) का निर्देशाङ्कहरू के हुन्?',
    en: 'What are the coordinates of the origin?',
    options: [
      { key: 'A', label: '(0, 0)' },
      { key: 'B', label: '(1, 1)' },
      { key: 'C', label: '(0, 1)' },
      { key: 'D', label: '(1, 0)' },
    ],
    answer: 'A',
  },
];

export const CoordinateGraphBuilder: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L12-03',
    titleEn: 'Coordinate Graph & Linear Graph Builder',
    titleNp: 'निर्देशाङ्क ग्राफ र रेखीय ग्राफ निर्माण',
    chapter: 12,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'quadrants' | 'linear-graph'>('quadrants');

  // Tab 1: Quadrants & Points
  const [pointX, setPointX] = useState<number>(3);
  const [pointY, setPointY] = useState<number>(4);

  const getQuadrant = (x: number, y: number) => {
    if (x > 0 && y > 0) return L('पहिलो चतुर्थांश (Quadrant I)', 'Quadrant I (+, +)');
    if (x < 0 && y > 0) return L('दोस्रो चतुर्थांश (Quadrant II)', 'Quadrant II (-, +)');
    if (x < 0 && y < 0) return L('तेस्रो चतुर्थांश (Quadrant III)', 'Quadrant III (-, -)');
    if (x > 0 && y < 0) return L('चौथो चतुर्थांश (Quadrant IV)', 'Quadrant IV (+, -)');
    return L('अक्षमा (On Axis / Origin)', 'On Axis / Origin');
  };

  // Tab 2: 3x + y = 6 (y = 6 - 3x)
  const LINE_POINTS = [
    { x: 0, y: 6 },
    { x: 1, y: 3 },
    { x: 2, y: 0 },
  ];

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'निर्देशाङ्क समतलमा तेर्सो X-अक्ष र ठाडो Y-अक्ष हुन्छन्। चार चतुर्थांशहरूमा बिन्दुहरू (x, y) अंकित गरी सरल रेखा ग्राफ बनाइन्छ!',
        'Cartesian plane has horizontal X-axis and vertical Y-axis. Plotting (x, y) pairs creates straight line graphs!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'quadrants', np: '1. चार चतुर्थांश र बिन्दुहरू (Quadrants)', en: '1. Quadrants & Points' },
            { id: 'linear-graph', np: '2. रेखीय समीकरण ग्राफ: 3x + y = 6', en: '2. Linear Graph (3x+y=6)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                kit.tap();
                setActiveTab(tab.id as any);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer',
                background: activeTab === tab.id ? '#187C68' : '#E2E8F0',
                color: activeTab === tab.id ? '#FFF' : '#334155',
                transition: 'all 0.2s',
              }}
            >
              {L(tab.np, tab.en)}
            </button>
          ))}
        </div>

        {/* TAB 1: Quadrants & Points */}
        {activeTab === 'quadrants' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('कार्तेसियन समतल र चार चतुर्थांशहरू', 'Cartesian Plane & Four Quadrants')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'स्लाइडर सारेर Point (x, y) को स्थान परिवर्तन गर्नुहोस् र चतुर्थांश पहिचान गर्नुहोस्:',
                'Move sliders to change (x, y) and observe the quadrant:'
              )}
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '16px 0' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#0369A1' }}>x-coordinate: {pointX}</label>
                <input
                  type="range"
                  min={-5}
                  max={5}
                  value={pointX}
                  onChange={(e) => {
                    kit.tap();
                    setPointX(parseInt(e.target.value));
                  }}
                  style={{ width: 140, display: 'block', marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#15803D' }}>y-coordinate: {pointY}</label>
                <input
                  type="range"
                  min={-5}
                  max={5}
                  value={pointY}
                  onChange={(e) => {
                    kit.tap();
                    setPointY(parseInt(e.target.value));
                  }}
                  style={{ width: 140, display: 'block', marginTop: 4 }}
                />
              </div>
            </div>

            {/* SVG Coordinate Grid */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '16px 0',
                background: '#F8FAFC',
                borderRadius: 12,
                border: '1px solid #CBD5E1',
                margin: '16px 0',
              }}
            >
              <svg width="280" height="280" viewBox="0 0 280 280">
                {/* Grid Lines */}
                {Array.from({ length: 11 }).map((_, i) => (
                  <React.Fragment key={i}>
                    <line x1={i * 25 + 15} y1="15" x2={i * 25 + 15} y2="265" stroke="#E2E8F0" strokeWidth="1" />
                    <line x1="15" y1={i * 25 + 15} x2="265" y2={i * 25 + 15} stroke="#E2E8F0" strokeWidth="1" />
                  </React.Fragment>
                ))}

                {/* Axes */}
                <line x1="15" y1="140" x2="265" y2="140" stroke="#334155" strokeWidth="2" />
                <line x1="140" y1="15" x2="140" y2="265" stroke="#334155" strokeWidth="2" />
                <text x="260" y="135" fontSize="11" fontWeight="bold" fill="#334155">X</text>
                <text x="145" y="25" fontSize="11" fontWeight="bold" fill="#334155">Y</text>

                {/* Quadrant Watermarks */}
                <text x="200" y="75" fill="#CBD5E1" fontSize="16" fontWeight="bold">I (+,+)</text>
                <text x="60" y="75" fill="#CBD5E1" fontSize="16" fontWeight="bold">II (-,+)</text>
                <text x="60" y="215" fill="#CBD5E1" fontSize="16" fontWeight="bold">III (-,-)</text>
                <text x="200" y="215" fill="#CBD5E1" fontSize="16" fontWeight="bold">IV (+,-)</text>

                {/* Active Plotted Point */}
                {(() => {
                  const cx = 140 + pointX * 25;
                  const cy = 140 - pointY * 25;
                  return (
                    <>
                      <circle cx={cx} cy={cy} r="6" fill="#DC2626" />
                      <text x={cx + 8} y={cy - 6} fontSize="12" fontWeight="bold" fill="#991B1B">
                        ({pointX}, {pointY})
                      </text>
                    </>
                  );
                })()}
              </svg>
            </div>

            <div
              style={{
                background: '#ECFDF5',
                padding: 14,
                borderRadius: 8,
                border: '1px solid #6EE7B7',
                fontSize: 15,
                fontWeight: 700,
                color: '#065F46',
                textAlign: 'center',
              }}
            >
              Point ({pointX}, {pointY}) ➜ {getQuadrant(pointX, pointY)}
            </div>
          </div>
        )}

        {/* TAB 2: Linear Graph 3x + y = 6 */}
        {activeTab === 'linear-graph' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('रेखीय समीकरणको ग्राफ: 3x + y = 6 (y = 6 - 3x)', 'Linear Equation Graph: 3x + y = 6')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक पृष्ठ 185 को उदाहरण: मान तालिका बनाई बिन्दुहरू जोडेर सीधा रेखा खिचौँ:',
                'Textbook Page 185 Example: Table of values plotted to form a straight line:'
              )}
            </p>

            <div style={{ overflowX: 'auto', margin: '14px 0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                <thead>
                  <tr style={{ background: '#F1F5F9' }}>
                    <th style={{ padding: 8, border: '1px solid #CBD5E1' }}>x</th>
                    <th style={{ padding: 8, border: '1px solid #CBD5E1' }}>y = 6 - 3x</th>
                    <th style={{ padding: 8, border: '1px solid #CBD5E1' }}>{L('क्रमित युग्म (x, y)', 'Ordered Pair')}</th>
                  </tr>
                </thead>
                <tbody>
                  {LINE_POINTS.map((pt) => (
                    <tr key={pt.x} style={{ background: '#FFF' }}>
                      <td style={{ padding: 8, border: '1px solid #CBD5E1', fontWeight: 'bold' }}>{pt.x}</td>
                      <td style={{ padding: 8, border: '1px solid #CBD5E1' }}>{pt.y}</td>
                      <td style={{ padding: 8, border: '1px solid #CBD5E1', color: '#187C68', fontWeight: 'bold' }}>
                        ({pt.x}, {pt.y})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Straight line SVG graph */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '16px 0',
                background: '#F8FAFC',
                borderRadius: 12,
                border: '1px solid #CBD5E1',
                margin: '16px 0',
              }}
            >
              <svg width="280" height="240" viewBox="0 0 280 240">
                {/* Axes */}
                <line x1="20" y1="200" x2="260" y2="200" stroke="#334155" strokeWidth="2" />
                <line x1="60" y1="20" x2="60" y2="220" stroke="#334155" strokeWidth="2" />
                <text x="250" y="195" fontSize="11" fill="#334155">X</text>
                <text x="65" y="30" fontSize="11" fill="#334155">Y</text>

                {/* Graph Line */}
                <line x1="60" y1="50" x2="210" y2="200" stroke="#2563EB" strokeWidth="3" />

                {/* Plotted points */}
                <circle cx="60" cy="50" r="5" fill="#DC2626" />
                <text x="70" y="50" fontSize="11" fontWeight="bold" fill="#1E40AF">(0, 6)</text>

                <circle cx="135" cy="125" r="5" fill="#DC2626" />
                <text x="145" y="125" fontSize="11" fontWeight="bold" fill="#1E40AF">(1, 3)</text>

                <circle cx="210" cy="200" r="5" fill="#DC2626" />
                <text x="210" y="190" fontSize="11" fontWeight="bold" fill="#1E40AF">(2, 0)</text>
              </svg>
            </div>

            <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#1E40AF' }}>
              The graph of a linear equation is always a straight line.
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default CoordinateGraphBuilder;
