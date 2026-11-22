/**
 * CircleCircumferenceAdventure.tsx
 * Grade 7 Mathematics – Lesson 9: PERIMETER, AREA AND VOLUME (परिमिति, क्षेत्रफल र आयतन)
 * Simulation 4: Circle Circumference and Wheel Adventure (2D + Rolling Wheel Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 132-137)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Circle, RotateCw, Bike, ArrowRight, Check } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'कुनै पनि वृत्तको परिधि (Circumference) र व्यास (Diameter) को अनुपात कति बराबर हुन्छ?',
    en: 'What is the ratio of circumference to diameter for any circle?',
    options: [
      { key: 'A', label: 'π (लगभग २२/७ वा ३.१४)' },
      { key: 'B', label: '२π' },
      { key: 'C', label: 'π/२' },
      { key: 'D', label: '४' },
    ],
    answer: 'A',
  },
  {
    np: 'व्यास (d) १४ सेमी (अर्धव्यास r = ७ सेमी) भएको वृत्तको परिधि कति हुन्छ? (π = २२/७)',
    en: 'What is the circumference of a circle with diameter 14 cm (radius 7 cm)? (π = 22/7)',
    options: [
      { key: 'A', label: '४४ सेमी [ २ × (२२/७) × ७ = ४४ सेमी ]' },
      { key: 'B', label: '२२ सेमी' },
      { key: 'C', label: '८८ सेमी' },
      { key: 'D', label: '१५४ सेमी' },
    ],
    answer: 'A',
  },
  {
    np: 'एउटा साइकल १०० पटक पाङ्ग्रा घुम्दा ४४० मिटर दुरी पार गर्छ भने पाङ्ग्राको अर्धव्यास कति हुन्छ?',
    en: 'A cycle travels 440 metres in 100 wheel rotations. What is the wheel radius?',
    options: [
      { key: 'A', label: '०.७ मिटर वा ७० सेमी (१ चक्कर = ४.४m => r = ४.४ ÷ (२×२२/७) = ०.७m)' },
      { key: 'B', label: '१.४ मिटर' },
      { key: 'C', label: '३५ सेमी' },
      { key: 'D', label: '५० सेमी' },
    ],
    answer: 'A',
  },
  {
    np: 'अर्धव्यास (r) बाट परिधि निकाल्ने सही सुत्र कुन हो?',
    en: 'Which is the correct formula to calculate circumference from radius (r)?',
    options: [
      { key: 'A', label: 'C = २πr' },
      { key: 'B', label: 'C = πr²' },
      { key: 'C', label: 'C = २r' },
      { key: 'D', label: 'C = ४πr' },
    ],
    answer: 'A',
  },
];

export const CircleCircumferenceAdventure: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L9-04',
    titleEn: 'Circle Circumference & Wheel Adventure',
    titleNp: 'वृत्तको परिधि र पाङ्ग्रा यात्रा',
    chapter: 9,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'pi-discovery' | 'calc' | 'wheel'>('pi-discovery');

  // Tab 1: Thread unrolling discovery (Coin Diameter)
  const [coinDiameter, setCoinDiameter] = useState<number>(14);
  const coinRadius = coinDiameter / 2;
  const piConstant = 22 / 7;
  const coinCircumference = 2 * piConstant * coinRadius;

  // Tab 2: Formula Calculator
  const [calcRadius, setCalcRadius] = useState<number>(7);
  const calcDiameter = calcRadius * 2;
  const calcCircumference = 2 * (22 / 7) * calcRadius;

  // Tab 3: Bicycle Wheel Rotation (Textbook: 440m in 100 rotations)
  const [totalDistanceM, setTotalDistanceM] = useState<number>(440);
  const [rotations, setRotations] = useState<number>(100);
  const distancePerRotation = totalDistanceM / rotations; // circumference in metres
  const wheelRadiusM = distancePerRotation / (2 * (22 / 7));
  const wheelRadiusCm = wheelRadiusM * 100;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'वृत्तको परिधि र व्यासको अनुपात सधैँ स्थिर (π = २२/७ ≈ ३.१४) हुन्छ: C = २πr = πd!',
        'The ratio of circumference to diameter is always constant (π = 22/7 ≈ 3.14): C = 2πr = πd!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'pi-discovery', np: '१. परिधि र π को खोजी (Discover π)', en: '1. Discover π' },
            { id: 'calc', np: '२. परिधि क्याल्कुलेटर (C = 2πr)', en: '2. Circumference Calc' },
            { id: 'wheel', np: '३. साइकल पाङ्ग्रा चक्कर (Wheel Rotations)', en: '3. Wheel Adventure' },
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

        {/* TAB 1: Discover Pi */}
        {activeTab === 'pi-discovery' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('सिक्कामा धागो बेरेर परिधि र π पत्ता लगाउने', 'Discovering π by Wrapping Thread around a Coin')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'वृत्तको घेराको लम्बाइलाई परिधि (Circumference) भनिन्छ। परिधिलाई व्यासले भाग गर्दा सधैँ स्थिर मान ३.१४ (π) प्राप्त हुन्छ।',
                'The boundary length is Circumference. Dividing Circumference by Diameter always equals constant 3.14 (π).'
              )}
            </p>

            <div style={{ margin: '16px 0' }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                {L('व्यास (Diameter - d): ', 'Diameter (d): ')} {coinDiameter} cm
              </label>
              <input
                type="range"
                min={7}
                max={28}
                step={7}
                value={coinDiameter}
                onChange={(e) => {
                  kit.tap();
                  setCoinDiameter(parseInt(e.target.value));
                }}
                style={{ width: 200 }}
              />
            </div>

            {/* Visual Circle & Thread */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '24px 0',
                background: '#F8FAFC',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                marginBottom: 16,
              }}
            >
              <svg width="240" height="160" viewBox="0 0 240 160">
                {/* Circle */}
                <circle cx="120" cy="80" r={coinRadius * 4} fill="#FEF3C7" stroke="#D97706" strokeWidth="3" />
                {/* Diameter line */}
                <line x1={120 - coinRadius * 4} y1="80" x2={120 + coinRadius * 4} y2="80" stroke="#DC2626" strokeWidth="2" strokeDasharray="4 2" />
                <circle cx="120" cy="80" r="4" fill="#0F172A" />
                <text x="120" y="72" textAnchor="middle" fill="#DC2626" fontWeight="bold" fontSize="11">
                  d = {coinDiameter} cm
                </text>
                <text x="120" y="100" textAnchor="middle" fill="#B45309" fontWeight="bold" fontSize="11">
                  r = {coinRadius} cm
                </text>
              </svg>
            </div>

            {/* Step-by-Step Card */}
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
                <strong>{L('१. धागोले नापेको परिधि (Circumference):', '1. Circumference:')}</strong> C = २ × (२२/७) ×{' '}
                {coinRadius} = <span style={{ fontWeight: 800, color: '#15803D' }}>{coinCircumference.toFixed(1)} cm</span>
              </div>
              <div>
                <strong>{L('२. परिधि र व्यासको अनुपात:', '2. Circumference / Diameter Ratio:')}</strong>
                <br />
                {coinCircumference.toFixed(1)} ÷ {coinDiameter} ={' '}
                <span style={{ fontWeight: 800, color: '#047857', fontSize: 18 }}>
                  {(coinCircumference / coinDiameter).toFixed(2)} ≈ π (पाई)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Calculator */}
        {activeTab === 'calc' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('परिधि क्याल्कुलेटर (Circumference Calculator)', 'Circumference Calculator')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक उदाहरण: अर्धव्यास r = ७ सेमी (व्यास १४ सेमी) भएको वृत्तको परिधि पत्ता लगाउनुहोस्:',
                'Textbook Example: Find circumference of a circle with radius 7 cm (diameter 14 cm):'
              )}
            </p>

            <div style={{ margin: '16px 0' }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#0369A1', display: 'block', marginBottom: 4 }}>
                {L('अर्धव्यास (Radius - r): ', 'Radius (r): ')} {calcRadius} cm
              </label>
              <input
                type="range"
                min={3.5}
                max={35}
                step={3.5}
                value={calcRadius}
                onChange={(e) => {
                  kit.tap();
                  setCalcRadius(parseFloat(e.target.value));
                }}
                style={{ width: 200 }}
              />
            </div>

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
                <strong>{L('व्यास (Diameter):', 'Diameter:')}</strong> d = २r = २ × {calcRadius} = {calcDiameter} cm
              </div>
              <div>
                <strong>{L('परिधि सूत्र (Formula):', 'Circumference Formula:')}</strong> C = २πr = २ × (२२/७) × {calcRadius}
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#3730A3',
                }}
              >
                {L('परिधि (Circumference) = ', 'Circumference = ')} {calcCircumference.toFixed(1)} cm
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Wheel Rotations */}
        {activeTab === 'wheel' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('साइकलको पाङ्ग्रा र चक्कर (Bicycle Wheel Rotation Adventure)', 'Wheel Rotation Adventure')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक उदाहरण: एउटा साइकल १०० पटक पाङ्ग्रा घुम्दा ४४० मिटर दुरी पार गर्छ भने पाङ्ग्राको अर्धव्यास कति हुन्छ?',
                'Textbook Example: A cycle travels 440 m in 100 wheel rotations. Find the radius of the wheel:'
              )}
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '16px 0' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#15803D', display: 'block', marginBottom: 4 }}>
                  {L('पार गरेको दुरी: ', 'Distance Traveled: ')} {totalDistanceM} m
                </label>
                <input
                  type="range"
                  min={220}
                  max={880}
                  step={110}
                  value={totalDistanceM}
                  onChange={(e) => {
                    kit.tap();
                    setTotalDistanceM(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#D97706', display: 'block', marginBottom: 4 }}>
                  {L('चक्कर सङ्ख्या: ', 'Rotations: ')} {rotations} चक्कर
                </label>
                <input
                  type="range"
                  min={50}
                  max={200}
                  step={25}
                  value={rotations}
                  onChange={(e) => {
                    kit.tap();
                    setRotations(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>
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
                <strong>{L('१. १ चक्करमा पार हुने दुरी (परिधि - C):', '1. Distance in 1 rotation (C):')}</strong>
                <br />
                {totalDistanceM} m ÷ {rotations} ={' '}
                <span style={{ fontWeight: 800, color: '#0369A1' }}>{distancePerRotation.toFixed(2)} m</span>
              </div>
              <div>
                <strong>{L('२. परिधिबाट अर्धव्यास (r) निकाल्दा:', '2. Finding radius (r) from C:')}</strong>
                <br />C = २πr ➜ {distancePerRotation.toFixed(2)} = २ × (२२/७) × r
              </div>
              <div>
                r = ({distancePerRotation.toFixed(2)} × ७) ÷ ४४ ={' '}
                <span style={{ fontWeight: 800, color: '#166534' }}>{wheelRadiusM.toFixed(2)} m</span>
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#187C68',
                }}
              >
                {L('पाङ्ग्राको अर्धव्यास = ', 'Wheel Radius = ')} {wheelRadiusCm.toFixed(0)} cm ({wheelRadiusM.toFixed(2)} m)
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default CircleCircumferenceAdventure;
