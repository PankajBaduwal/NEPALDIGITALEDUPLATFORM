/**
 * PerimeterTriangleExplorer.tsx
 * Grade 7 Mathematics – Lesson 9: PERIMETER, AREA AND VOLUME
 * Simulation 1: Perimeter and Triangle Explorer (2D + Interactive Triangle Geometry)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 112-117)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Triangle, Ruler, Fence, Calculator, RefreshCw, Check } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'त्रिभुजको परिमिति (Perimeter of a Triangle) निकाल्ने सुत्र कुन हो?',
    en: 'What is the formula for the perimeter of a triangle?',
    options: [
      { key: 'A', label: 'Sum of all three sides (P = a + b + c)' },
      { key: 'B', label: '2 × (length + breadth)' },
      { key: 'C', label: 'length × breadth' },
      { key: 'D', label: '1/2 × base × height' },
    ],
    answer: 'A',
  },
  {
    np: 'एउटा त्रिभुजका भुजाहरू 8 cm, 12 cm र 6 cm छन् भने यसको परिमिति कति हुन्छ?',
    en: 'The sides of a triangle are 8 cm, 12 cm, and 6 cm. What is its perimeter?',
    options: [
      { key: 'A', label: '26 cm (8 + 12 + 6 = 26 cm)' },
      { key: 'B', label: '24 cm' },
      { key: 'C', label: '28 cm' },
      { key: 'D', label: '30 cm' },
    ],
    answer: 'A',
  },
  {
    np: 'त्रिभुजाकार जग्गाको परिमिति 400 m छ। दुई भुजाहरू 120 m र 180 m भए तेस्रो भुजा कति हुन्छ?',
    en: 'The perimeter of triangular land is 400 m. If two sides are 120 m and 180 m, what is the third side?',
    options: [
      { key: 'A', label: '100 m [ 400 - (120 + 180) = 100 m ]' },
      { key: 'B', label: '150 m' },
      { key: 'C', label: '80 m' },
      { key: 'D', label: '120 m' },
    ],
    answer: 'A',
  },
  {
    np: '10 मि, 12 मि र 14 मि भुजाहरू भएको खेतलाई 5 Perimeter काँडेतारले घेर्न कति तार र प्रति m Rs 20 का दरले कति खर्च लाग्छ?',
    en: 'A triangular field (10m, 12m, 14m) is fenced 5 times. Wire needed and cost at Rs 20/m are:',
    options: [
      { key: 'A', label: '180 m of wire and Rs 3,600 cost (P = 36 m, wire = 36×5 = 180 m, cost = 180×20 = Rs 3,600)' },
      { key: 'B', label: '36 m of wire and Rs 720 cost' },
      { key: 'C', label: '150 m of wire and Rs 3,000 cost' },
      { key: 'D', label: '200 m of wire and Rs 4,000 cost' },
    ],
    answer: 'A',
  },
];

export const PerimeterTriangleExplorer: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L9-01',
    titleEn: 'Perimeter and Triangle Explorer',
    titleNp: 'परिमिति र त्रिभुज अन्वेषक',
    chapter: 9,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'discover' | 'missing-side' | 'fencing'>('discover');

  // Tab 1: Interactive Triangle sides (Textbook: 8, 12, 6 cm)
  const [sideA, setSideA] = useState<number>(8);
  const [sideB, setSideB] = useState<number>(12);
  const [sideC, setSideC] = useState<number>(6);
  const perimeter = sideA + sideB + sideC;

  // Triangle inequality check
  const isValidTriangle = sideA + sideB > sideC && sideB + sideC > sideA && sideA + sideC > sideB;

  // Tab 2: Missing Side (Textbook: P = 400, a = 120, c = 180 => b = 100)
  const [totalP, setTotalP] = useState<number>(400);
  const [knownA, setKnownA] = useState<number>(120);
  const [knownC, setKnownC] = useState<number>(180);
  const calculatedB = totalP - (knownA + knownC);

  // Tab 3: Vegetable Field Fencing (Textbook: 10m, 12m, 14m, 5 rounds @ Rs 20/m)
  const [fSideA, setFSideA] = useState<number>(10);
  const [fSideB, setFSideB] = useState<number>(12);
  const [fSideC, setFSideC] = useState<number>(14);
  const [rounds, setRounds] = useState<number>(5);
  const [costPerMeter, setCostPerMeter] = useState<number>(20);

  const fieldPerimeter = fSideA + fSideB + fSideC;
  const totalWireNeeded = fieldPerimeter * rounds;
  const totalFencingCost = totalWireNeeded * costPerMeter;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'त्रिभुजको परिमिति भनेको तीनओटै भुजाहरूको लम्बाइको जोड हो (P = a + b + c)!',
        'The perimeter of a triangle is the total boundary length: P = a + b + c!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'discover', np: '1. परिमिति खोजी (P = a + b + c)', en: '1. Discover Perimeter' },
            { id: 'missing-side', np: '2. अज्ञात भुजा पत्ता लगाउने (Missing Side)', en: '2. Find Missing Side' },
            { id: 'fencing', np: '3. तरकारी बारी काँडेतार घेराबन्दी (Field Fencing)', en: '3. Fencing & Cost' },
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

        {/* TAB 1: Discover Perimeter */}
        {activeTab === 'discover' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('त्रिभुजको परिमिति खोजी र गणना (Perimeter of Triangle)', 'Triangle Perimeter Discovery')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक उदाहरण: त्रिभुज ABC मा AB = 8 cm, BC = 12 cm र CA = 6 cm छन्। तीन भुजाहरू परिवर्तन गरी परिमिति हेर्नुहोस्:',
                'Textbook Example: In triangle ABC, AB = 8 cm, BC = 12 cm, and CA = 6 cm. Adjust sides to explore perimeter:'
              )}
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '16px 0' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#DC2626', display: 'block', marginBottom: 4 }}>
                  {L('भुजा AB (a): ', 'Side AB (a): ')} {sideA} cm
                </label>
                <input
                  type="range"
                  min={3}
                  max={20}
                  value={sideA}
                  onChange={(e) => {
                    kit.tap();
                    setSideA(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#2563EB', display: 'block', marginBottom: 4 }}>
                  {L('भुजा BC (b): ', 'Side BC (b): ')} {sideB} cm
                </label>
                <input
                  type="range"
                  min={3}
                  max={20}
                  value={sideB}
                  onChange={(e) => {
                    kit.tap();
                    setSideB(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#15803D', display: 'block', marginBottom: 4 }}>
                  {L('भुजा CA (c): ', 'Side CA (c): ')} {sideC} cm
                </label>
                <input
                  type="range"
                  min={3}
                  max={20}
                  value={sideC}
                  onChange={(e) => {
                    kit.tap();
                    setSideC(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>
            </div>

            {/* Visual SVG Triangle Diagram */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '20px 0',
                background: '#F8FAFC',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                marginBottom: 16,
              }}
            >
              <svg width="320" height="180" viewBox="0 0 320 180">
                {/* Triangle Coordinates */}
                <polygon
                  points="160,30 60,150 260,150"
                  fill={isValidTriangle ? '#ECFDF5' : '#FEF2F2'}
                  stroke={isValidTriangle ? '#10B981' : '#EF4444'}
                  strokeWidth="3"
                />

                {/* Vertices */}
                <circle cx="160" cy="30" r="5" fill="#187C68" />
                <text x="160" y="20" textAnchor="middle" fontWeight="bold" fontSize="13" fill="#0F172A">A</text>

                <circle cx="60" cy="150" r="5" fill="#187C68" />
                <text x="45" y="160" textAnchor="middle" fontWeight="bold" fontSize="13" fill="#0F172A">B</text>

                <circle cx="260" cy="150" r="5" fill="#187C68" />
                <text x="275" y="160" textAnchor="middle" fontWeight="bold" fontSize="13" fill="#0F172A">C</text>

                {/* Side Labels */}
                <text x="100" y="85" fill="#DC2626" fontWeight="bold" fontSize="12">c = {sideA} cm</text>
                <text x="160" y="170" fill="#2563EB" fontWeight="bold" fontSize="12" textAnchor="middle">a = {sideB} cm</text>
                <text x="220" y="85" fill="#15803D" fontWeight="bold" fontSize="12">b = {sideC} cm</text>
              </svg>
            </div>

            {/* Formula Card */}
            <div
              style={{
                background: '#F0FDF4',
                padding: 16,
                borderRadius: 10,
                border: '1px solid #BBF7D0',
                lineHeight: 2,
              }}
            >
              <div>
                <strong>{L('परिमिति सुत्र (Formula):', 'Perimeter Formula:')}</strong> P = AB + BC + CA = a + b + c
              </div>
              <div>
                <strong>{L('मान राख्दा:', 'Substituting values:')}</strong> P = {sideA} cm + {sideB} cm + {sideC} cm
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#166534',
                }}
              >
                {L('जम्मा परिमिति (Perimeter) = ', 'Total Perimeter = ')} {perimeter} cm
              </div>
              {!isValidTriangle && (
                <div style={{ color: '#DC2626', fontSize: 13, marginTop: 4 }}>
                  ⚠️ {L('कुनै दुई भुजाको जोड तेस्रो भुजाभन्दा ठूलो हुनुपर्छ।', 'Sum of any two sides must exceed the third side.')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Missing Side */}
        {activeTab === 'missing-side' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('अज्ञात भुजा पत्ता लगाउने (Find the Unknown Side)', 'Find the Unknown Side')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक उदाहरण: त्रिभुजाकार जग्गाको परिमिति 400 m छ। दुई भुजाहरू 120 m र 180 m भए तेस्रो भुजा पत्ता लगाउनुहोस्:',
                'Textbook Example: Triangular land perimeter = 400 m. If two sides are 120 m and 180 m, find the third side:'
              )}
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '16px 0' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#0369A1', display: 'block', marginBottom: 4 }}>
                  {L('जम्मा परिमिति (Perimeter): ', 'Perimeter: ')} {totalP} m
                </label>
                <input
                  type="range"
                  min={200}
                  max={600}
                  step={50}
                  value={totalP}
                  onChange={(e) => {
                    kit.tap();
                    setTotalP(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#DC2626', display: 'block', marginBottom: 4 }}>
                  {L('पहिलो भुजा (a): ', 'First Side (a): ')} {knownA} m
                </label>
                <input
                  type="range"
                  min={40}
                  max={200}
                  step={10}
                  value={knownA}
                  onChange={(e) => {
                    kit.tap();
                    setKnownA(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#15803D', display: 'block', marginBottom: 4 }}>
                  {L('तेस्रो भुजा (c): ', 'Third Side (c): ')} {knownC} m
                </label>
                <input
                  type="range"
                  min={40}
                  max={200}
                  step={10}
                  value={knownC}
                  onChange={(e) => {
                    kit.tap();
                    setKnownC(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>
            </div>

            {/* Step-by-Step Card */}
            <div
              style={{
                background: '#EEF2FF',
                padding: 16,
                borderRadius: 10,
                border: '1px solid #C7D2FE',
                lineHeight: 2,
              }}
            >
              <div>
                <strong>{L('1. सम्बन्ध:', '1. Relation:')}</strong> P = a + b + c
              </div>
              <div>
                <strong>{L('2. मान राख्दा:', '2. Substituting values:')}</strong> {totalP} = {knownA} + b + {knownC}
              </div>
              <div>
                <strong>{L('3. जोड्दा:', '3. Adding known sides:')}</strong> {totalP} = b + {knownA + knownC}
              </div>
              <div>
                <strong>{L('4. पक्षान्तर गर्दा:', '4. Solving for b:')}</strong> b = {totalP} - {knownA + knownC}
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 22,
                  fontWeight: 800,
                  color: calculatedB > 0 ? '#3730A3' : '#DC2626',
                }}
              >
                {calculatedB > 0
                  ? `${L('दोस्रो भुजा (b) = ', 'Second Side (b) = ')} ${calculatedB} m`
                  : L('अवैध मान: दुई भुजाको जोड परिमितिभन्दा बढी हुन सक्दैन!', 'Invalid values: sides exceed perimeter!')}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Field Fencing */}
        {activeTab === 'fencing' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('त्रिभुजाकार तरकारी बारी काँडेतार घेराबन्दी (Field Fencing & Cost)', 'Field Fencing and Cost')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक उदाहरण: 10 मि, 12 मि र 14 मि भुजाहरू भएको त्रिभुजाकार तरकारी खेतलाई 5 Perimeter काँडेतारले घेर्न कति तार र प्रति m Rs 20 का दरले कति खर्च लाग्छ?',
                'Textbook Example: A vegetable plot (10m, 12m, 14m) is fenced 5 rounds. Find total wire needed and cost at Rs 20/m:'
              )}
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '16px 0' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                  {L('Perimeter सङ्ख्या (Fencing Rounds): ', 'Rounds: ')} {rounds} Perimeter
                </label>
                <input
                  type="range"
                  min={1}
                  max={8}
                  value={rounds}
                  onChange={(e) => {
                    kit.tap();
                    setRounds(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#D97706', display: 'block', marginBottom: 4 }}>
                  {L('प्रति m दर (Rate per m): ', 'Rate per m: ')} Rs {costPerMeter}
                </label>
                <input
                  type="range"
                  min={10}
                  max={50}
                  step={5}
                  value={costPerMeter}
                  onChange={(e) => {
                    kit.tap();
                    setCostPerMeter(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 16,
                marginTop: 16,
              }}
            >
              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 10, border: '1px solid #CBD5E1' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>
                  {L('1. खेतको परिमिति (1 Perimeter तार)', '1. Perimeter (1 Round Wire)')}
                </span>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', marginTop: 4 }}>
                  {fieldPerimeter} m
                </div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                  10m + 12m + 14m = 36m
                </div>
              </div>

              <div style={{ background: '#EFF6FF', padding: 16, borderRadius: 10, border: '1px solid #BFDBFE' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#1E40AF' }}>
                  {L(`2. ${rounds} Perimeterका लागि आवश्यक तार`, `2. Wire for ${rounds} Rounds`)}
                </span>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#2563EB', marginTop: 4 }}>
                  {totalWireNeeded} m
                </div>
                <div style={{ fontSize: 12, color: '#1E3A8A', marginTop: 2 }}>
                  {fieldPerimeter}m × {rounds} Perimeter
                </div>
              </div>

              <div style={{ background: '#ECFDF5', padding: 16, borderRadius: 10, border: '2px solid #10B981' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#065F46' }}>
                  {L('3. जम्मा घेराबन्दी खर्च (Total Cost)', '3. Total Cost')}
                </span>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#047857', marginTop: 4 }}>
                  Rs {totalFencingCost.toLocaleString()}
                </div>
                <div style={{ fontSize: 12, color: '#065F46', marginTop: 2 }}>
                  {totalWireNeeded}m × Rs {costPerMeter}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default PerimeterTriangleExplorer;
