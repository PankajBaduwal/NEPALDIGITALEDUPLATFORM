/**
 * CuboidCubeSurfaceAreaLab.tsx
 * Grade 7 Mathematics – Lesson 9: PERIMETER, AREA AND VOLUME (परिमिति, क्षेत्रफल र आयतन)
 * Simulation 2: Cuboid and Cube Surface Area Lab (3D + 2D Net Unfolding Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 118-124)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Box, Layers, Maximize2, Calculator, RefreshCw, Check } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'घनाभ (Cuboid) को जम्मा कतिवटा सतहहरू (Faces) हुन्छन् र तिनीहरू कस्ता आकारका हुन्छन्?',
    en: 'How many faces does a cuboid have, and what shape are they?',
    options: [
      { key: 'A', label: '६ वटा आयताकार सतहहरू (6 rectangular faces)' },
      { key: 'B', label: '६ वटा वर्गाकार सतहहरू' },
      { key: 'C', label: '४ वटा आयताकार सतहहरू' },
      { key: 'D', label: '८ वटा सतहहरू' },
    ],
    answer: 'A',
  },
  {
    np: 'लम्बाइ (l), चौडाइ (b) र उचाइ (h) भएको घनाभको जम्मा पृष्ठीय क्षेत्रफल (TSA) को सुत्र कुन हो?',
    en: 'What is the formula for the Total Surface Area (TSA) of a cuboid?',
    options: [
      { key: 'A', label: 'TSA = २(lb + bh + lh)' },
      { key: 'B', label: 'TSA = l × b × h' },
      { key: 'C', label: 'TSA = ६a²' },
      { key: 'D', label: 'TSA = ४(l + b + h)' },
    ],
    answer: 'A',
  },
  {
    np: 'लम्बाइ ४ सेमी, चौडाइ ३ सेमी र उचाइ २ सेमी भएको घनाभको कुल पृष्ठीय क्षेत्रफल कति हुन्छ?',
    en: 'What is the total surface area of a cuboid with length 4 cm, breadth 3 cm, and height 2 cm?',
    options: [
      { key: 'A', label: '५२ वर्ग सेमी [ २ × (१२ + ६ + ८) = ५२ cm² ]' },
      { key: 'B', label: '२४ वर्ग सेमी' },
      { key: 'C', label: '४८ वर्ग सेमी' },
      { key: 'D', label: '६४ वर्ग सेमी' },
    ],
    answer: 'A',
  },
  {
    np: 'भुजा ३.५ सेमी भएको एउटा घन (Cube) को जम्मा पृष्ठीय क्षेत्रफल कति हुन्छ?',
    en: 'What is the total surface area of a cube with edge length 3.5 cm?',
    options: [
      { key: 'A', label: '७३.५ वर्ग सेमी (६ × ३.५² = ६ × १२.२५ = ७३.५ cm²)' },
      { key: 'B', label: '४२.८७५ वर्ग सेमी' },
      { key: 'C', label: '८४ वर्ग सेमी' },
      { key: 'D', label: '४९ वर्ग सेमी' },
    ],
    answer: 'A',
  },
];

export const CuboidCubeSurfaceAreaLab: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L9-02',
    titleEn: 'Cuboid and Cube Surface Area Lab',
    titleNp: 'घनाभ र घनको पृष्ठीय क्षेत्रफल प्रयोगशाला',
    chapter: 9,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'cuboid' | 'net' | 'cube'>('cuboid');

  // Cuboid dimensions (Textbook: l=4, b=3, h=2 cm)
  const [cuboidL, setCuboidL] = useState<number>(4);
  const [cuboidB, setCuboidB] = useState<number>(3);
  const [cuboidH, setCuboidH] = useState<number>(2);

  const areaLB = cuboidL * cuboidB;
  const areaBH = cuboidB * cuboidH;
  const areaLH = cuboidL * cuboidH;
  const cuboidTSA = 2 * (areaLB + areaBH + areaLH);

  // Cube dimensions (Textbook: a=3.5 cm)
  const [cubeEdge, setCubeEdge] = useState<number>(3.5);
  const oneFaceArea = cubeEdge * cubeEdge;
  const cubeTSA = 6 * oneFaceArea;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'घनाभमा ६ वटा आयताकार सतहहरू हुन्छन्: TSA = २(lb + bh + lh), र घनमा ६ वटा बराबर वर्गाकार सतहहरू: TSA = ६a²!',
        'A cuboid has 6 rectangular faces: TSA = 2(lb + bh + lh); a cube has 6 equal squares: TSA = 6a²!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'cuboid', np: '१. घनाभको क्षेत्रफल (Cuboid TSA)', en: '1. Cuboid TSA' },
            { id: 'net', np: '२. घनाभको जाली खोल्ने (2D Net Unfolding)', en: '2. 2D Net Unfolding' },
            { id: 'cube', np: '३. घनको क्षेत्रफल (Cube TSA = 6a²)', en: '3. Cube TSA' },
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

        {/* TAB 1: Cuboid TSA */}
        {activeTab === 'cuboid' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('घनाभको जम्मा पृष्ठीय क्षेत्रफल (Total Surface Area of Cuboid)', 'Total Surface Area of Cuboid')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक उदाहरण: लम्बाइ ४ सेमी, चौडाइ ३ सेमी र उचाइ २ सेमी भएको घनाभको कुल पृष्ठीय क्षेत्रफल निकाल्नुहोस्:',
                'Textbook Example: Find TSA of cuboid with length 4 cm, breadth 3 cm, and height 2 cm:'
              )}
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '16px 0' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#0369A1', display: 'block', marginBottom: 4 }}>
                  {L('लम्बाइ (Length - l): ', 'Length (l): ')} {cuboidL} cm
                </label>
                <input
                  type="range"
                  min={2}
                  max={10}
                  value={cuboidL}
                  onChange={(e) => {
                    kit.tap();
                    setCuboidL(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#15803D', display: 'block', marginBottom: 4 }}>
                  {L('चौडाइ (Breadth - b): ', 'Breadth (b): ')} {cuboidB} cm
                </label>
                <input
                  type="range"
                  min={2}
                  max={10}
                  value={cuboidB}
                  onChange={(e) => {
                    kit.tap();
                    setCuboidB(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#D97706', display: 'block', marginBottom: 4 }}>
                  {L('उचाइ (Height - h): ', 'Height (h): ')} {cuboidH} cm
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={cuboidH}
                  onChange={(e) => {
                    kit.tap();
                    setCuboidH(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>
            </div>

            {/* Isometric 3D Visual Box representation */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '24px 0',
                background: '#F8FAFC',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                marginBottom: 16,
              }}
            >
              <svg width="260" height="180" viewBox="0 0 260 180">
                {/* Front Face (l x h) */}
                <rect x="50" y="80" width={cuboidL * 18} height={cuboidH * 20} fill="#93C5FD" stroke="#1D4ED8" strokeWidth="2" opacity="0.85" />
                <text x={50 + (cuboidL * 18) / 2} y={80 + (cuboidH * 20) / 2} fill="#1E3A8A" fontSize="11" fontWeight="bold" textAnchor="middle">
                  l × h = {areaLH} cm²
                </text>

                {/* Top Face (l x b) */}
                <polygon
                  points={`50,80 ${50 + cuboidB * 10},${80 - cuboidB * 8} ${50 + cuboidL * 18 + cuboidB * 10},${80 - cuboidB * 8} ${50 + cuboidL * 18},80`}
                  fill="#BBF7D0"
                  stroke="#15803D"
                  strokeWidth="2"
                  opacity="0.85"
                />
                <text x={50 + (cuboidL * 18) / 2 + 10} y={80 - (cuboidB * 8) / 2} fill="#14532D" fontSize="11" fontWeight="bold" textAnchor="middle">
                  l × b = {areaLB} cm²
                </text>

                {/* Right Face (b x h) */}
                <polygon
                  points={`${50 + cuboidL * 18},80 ${50 + cuboidL * 18 + cuboidB * 10},${80 - cuboidB * 8} ${50 + cuboidL * 18 + cuboidB * 10},${80 + cuboidH * 20 - cuboidB * 8} ${50 + cuboidL * 18},${80 + cuboidH * 20}`}
                  fill="#FDE68A"
                  stroke="#B45309"
                  strokeWidth="2"
                  opacity="0.85"
                />
                <text x={50 + cuboidL * 18 + 15} y={80 + (cuboidH * 20) / 2} fill="#78350F" fontSize="10" fontWeight="bold">
                  b × h = {areaBH}
                </text>
              </svg>
            </div>

            {/* Calculations Breakdown */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div style={{ background: '#F0FDF4', padding: 12, borderRadius: 8, border: '1px solid #BBF7D0' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#15803D' }}>
                  {L('माथिल्लो र तल्लो सतह (Top & Bottom)', 'Top & Bottom (2 faces)')}
                </span>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#166534', marginTop: 2 }}>
                  २ × (l × b) = २ × {areaLB} = {2 * areaLB} cm²
                </div>
              </div>

              <div style={{ background: '#EFF6FF', padding: 12, borderRadius: 8, border: '1px solid #BFDBFE' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#1D4ED8' }}>
                  {L('अगाडि र पछाडिको सतह (Front & Back)', 'Front & Back (2 faces)')}
                </span>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#1E40AF', marginTop: 2 }}>
                  २ × (l × h) = २ × {areaLH} = {2 * areaLH} cm²
                </div>
              </div>

              <div style={{ background: '#FFFBEB', padding: 12, borderRadius: 8, border: '1px solid #FDE68A' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#B45309' }}>
                  {L('दायाँ र बायाँको सतह (Left & Right)', 'Left & Right (2 faces)')}
                </span>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#92400E', marginTop: 2 }}>
                  २ × (b × h) = २ × {areaBH} = {2 * areaBH} cm²
                </div>
              </div>
            </div>

            <div
              style={{
                background: '#ECFDF5',
                padding: 16,
                borderRadius: 10,
                border: '2px solid #10B981',
                lineHeight: 1.8,
              }}
            >
              <div>
                <strong>{L('कुल पृष्ठीय क्षेत्रफल (TSA) सूत्र:', 'Total Surface Area Formula:')}</strong> TSA = २(lb + bh + lh)
              </div>
              <div>
                TSA = २ × ({areaLB} + {areaBH} + {areaLH}) = २ × {areaLB + areaBH + areaLH}
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#065F46',
                  marginTop: 4,
                }}
              >
                {L('जम्मा पृष्ठीय क्षेत्रफल (TSA) = ', 'Total Surface Area = ')} {cuboidTSA} cm²
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Net Unfolding */}
        {activeTab === 'net' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('घनाभको २D जाली (2D Net of Cuboid)', '2D Net Unfolding of Cuboid')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'घनाभलाई खोलेर समतलमा फैलाउँदा ६ वटा आयतहरू प्राप्त हुन्छन्। यी ६ वटै आयतको क्षेत्रफल जोड्दा जम्मा पृष्ठीय क्षेत्रफल प्राप्त हुन्छ।',
                'Unfolding a cuboid yields 6 rectangular faces. Summing their areas gives the total surface area.'
              )}
            </p>

            {/* Visual SVG Net */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '20px 0',
                background: '#F8FAFC',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                margin: '16px 0',
              }}
            >
              <svg width="340" height="220" viewBox="0 0 340 220">
                {/* Top face */}
                <rect x="130" y="20" width="80" height="40" fill="#BBF7D0" stroke="#16A34A" strokeWidth="1.5" />
                <text x="170" y="45" fontSize="10" fontWeight="bold" fill="#14532D" textAnchor="middle">Top (lb)</text>

                {/* Left face */}
                <rect x="70" y="60" width="60" height="50" fill="#FDE68A" stroke="#D97706" strokeWidth="1.5" />
                <text x="100" y="90" fontSize="10" fontWeight="bold" fill="#78350F" textAnchor="middle">Left (bh)</text>

                {/* Front face */}
                <rect x="130" y="60" width="80" height="50" fill="#93C5FD" stroke="#2563EB" strokeWidth="1.5" />
                <text x="170" y="90" fontSize="10" fontWeight="bold" fill="#1E3A8A" textAnchor="middle">Front (lh)</text>

                {/* Right face */}
                <rect x="210" y="60" width="60" height="50" fill="#FDE68A" stroke="#D97706" strokeWidth="1.5" />
                <text x="240" y="90" fontSize="10" fontWeight="bold" fill="#78350F" textAnchor="middle">Right (bh)</text>

                {/* Bottom face */}
                <rect x="130" y="110" width="80" height="40" fill="#BBF7D0" stroke="#16A34A" strokeWidth="1.5" />
                <text x="170" y="135" fontSize="10" fontWeight="bold" fill="#14532D" textAnchor="middle">Bottom (lb)</text>

                {/* Back face */}
                <rect x="130" y="150" width="80" height="50" fill="#93C5FD" stroke="#2563EB" strokeWidth="1.5" />
                <text x="170" y="180" fontSize="10" fontWeight="bold" fill="#1E3A8A" textAnchor="middle">Back (lh)</text>
              </svg>
            </div>

            <div style={{ textAlign: 'center', fontSize: 15, fontWeight: 700, color: '#0F172A' }}>
              TSA = lb + lb + bh + bh + lh + lh = 2(lb + bh + lh)
            </div>
          </div>
        )}

        {/* TAB 3: Cube TSA */}
        {activeTab === 'cube' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('घनको जम्मा पृष्ठीय क्षेत्रफल (Cube TSA = 6a²)', 'Total Surface Area of Cube')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक उदाहरण: भुजा ३.५ सेमी भएको घनको कुल पृष्ठीय क्षेत्रफल निकाल्नुहोस् (घनका सबै ६ वटा सतहहरू बराबर वर्ग हुन्छन्):',
                'Textbook Example: Find TSA of a cube with side 3.5 cm (all 6 faces are equal squares of area a²):'
              )}
            </p>

            <div style={{ margin: '16px 0' }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                {L('घनको भुजाको लम्बाइ (Edge - a): ', 'Cube Edge (a): ')} {cubeEdge} cm
              </label>
              <input
                type="range"
                min={1}
                max={10}
                step={0.5}
                value={cubeEdge}
                onChange={(e) => {
                  kit.tap();
                  setCubeEdge(parseFloat(e.target.value));
                }}
                style={{ width: 200 }}
              />
            </div>

            {/* Step-by-Step Card */}
            <div
              style={{
                background: '#F8FAFC',
                padding: 16,
                borderRadius: 10,
                border: '1px solid #CBD5E1',
                lineHeight: 2,
              }}
            >
              <div>
                <strong>{L('१. एउटा वर्गाकार सतहको क्षेत्रफल:', '1. Area of 1 square face:')}</strong> a² = {cubeEdge} ×{' '}
                {cubeEdge} = <span style={{ fontWeight: 800, color: '#0369A1' }}>{oneFaceArea.toFixed(2)} cm²</span>
              </div>
              <div>
                <strong>{L('२. जम्मा ६ वटा सतहको क्षेत्रफल:', '2. Area of 6 identical faces:')}</strong> ६ × a² = ६ ×{' '}
                {oneFaceArea.toFixed(2)}
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#187C68',
                }}
              >
                {L('घनको जम्मा पृष्ठीय क्षेत्रफल (TSA) = ', 'Cube Total Surface Area = ')} {cubeTSA.toFixed(2)} cm²
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default CuboidCubeSurfaceAreaLab;
