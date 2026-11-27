/**
 * GeometricalIdentitiesSquareLab.tsx
 * Grade 7 Mathematics – Lesson 11: ALGEBRAIC EXPRESSION
 * Simulation 4: Geometrical Identities – (a + b)² and (a - b)² (2D Interactive Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 161-164)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Square, Grid, Calculator, ArrowRight, Check } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'ज्यामितीय रूपमा भुजा (a + b) भएको ठूलो वर्गको क्षेत्रफल कति बराबर हुन्छ?',
    en: 'Geometrically, what is the area of a large square with side (a + b)?',
    options: [
      { key: 'A', label: 'a² + 2ab + b² [ (a + b)² = a² + 2ab + b² ]' },
      { key: 'B', label: 'a² + b²' },
      { key: 'C', label: 'a² - 2ab + b²' },
      { key: 'D', label: '4ab' },
    ],
    answer: 'A',
  },
  {
    np: 'सर्वसमिका (a - b)² को विस्तार कुन हो?',
    en: 'What is the expansion of identity (a - b)²?',
    options: [
      { key: 'A', label: 'a² - 2ab + b²' },
      { key: 'B', label: 'a² - b²' },
      { key: 'C', label: 'a² + 2ab - b²' },
      { key: 'D', label: 'a² - 2ab - b²' },
    ],
    answer: 'A',
  },
  {
    np: 'सर्वसमिका प्रयोग गरी 12² को मान सजिलै कसरी निकालिन्छ?',
    en: 'How is 12² calculated conveniently using an identity?',
    options: [
      { key: 'A', label: '(10 + 2)² = 100 + 40 + 4 = 144' },
      { key: 'B', label: '10² + 2² = 104' },
      { key: 'C', label: '12 × 12 = 24' },
      { key: 'D', label: '(15 - 3)² = 225' },
    ],
    answer: 'A',
  },
  {
    np: 'सर्वसमिका प्रयोग गरी 98² को मान कसरी निकालिन्छ?',
    en: 'How is 98² calculated using an identity?',
    options: [
      { key: 'A', label: '(100 - 2)² = 10,000 - 400 + 4 = 9,604' },
      { key: 'B', label: '100² - 2² = 9,996' },
      { key: 'C', label: '90² + 8² = 8,164' },
      { key: 'D', label: '9,800' },
    ],
    answer: 'A',
  },
];

export const GeometricalIdentitiesSquareLab: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L11-04',
    titleEn: 'Geometrical Identities – (a + b)² and (a - b)²',
    titleNp: 'ज्यामितीय सर्वसमिका – (a + b)² र (a - b)²',
    chapter: 11,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'plus-square' | 'minus-square' | 'numerical'>('plus-square');

  // Sliders for a and b
  const [valA, setValA] = useState<number>(4);
  const [valB, setValB] = useState<number>(2);

  // Numerical Square Challenger
  const [selectedNum, setSelectedNum] = useState<number>(12);
  const NUM_CASES = [
    { num: 12, formula: '(10 + 2)²', expanded: '100 + 40 + 4', ans: 144 },
    { num: 88, formula: '(90 - 2)²', expanded: '8100 - 360 + 4', ans: 7744 },
    { num: 98, formula: '(100 - 2)²', expanded: '10000 - 400 + 4', ans: 9604 },
    { num: 999, formula: '(1000 - 1)²', expanded: '1000000 - 2000 + 1', ans: 998001 },
  ];

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        '(a + b)² भनेको a² वर्ग, दुईओटा ab आयत र एउटा b² वर्ग मिलेर बनेको कुल क्षेत्रफल हो: a² + 2ab + b²!',
        '(a + b)² represents a large square split into 4 parts: square a², two rectangles ab, and square b²!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'plus-square', np: '1. ज्यामितीय (a + b)²', en: '1. Geometric (a + b)²' },
            { id: 'minus-square', np: '2. ज्यामितीय (a - b)²', en: '2. Geometric (a - b)²' },
            { id: 'numerical', np: '3. सङ्ख्याको वर्ग गणना (12², 98²)', en: '3. Numerical Squares' },
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

        {/* TAB 1: (a + b)² */}
        {activeTab === 'plus-square' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('ज्यामितीय विधिद्वारा (a + b)² को प्रमाणीकरण', 'Geometrical Derivation of (a + b)²')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'भुजा (a + b) भएको ठूलो वर्ग 4 भागमा बाँडिन्छ: a² (वर्ग), ab, ab र b² (वर्ग)।',
                'Square of side (a + b) is partitioned into 4 regions: a², ab, ab, and b².'
              )}
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '16px 0' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#0369A1' }}>Side a: {valA}</label>
                <input
                  type="range"
                  min={2}
                  max={6}
                  value={valA}
                  onChange={(e) => setValA(parseInt(e.target.value))}
                  style={{ width: 140, display: 'block', marginTop: 4 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#15803D' }}>Side b: {valB}</label>
                <input
                  type="range"
                  min={1}
                  max={4}
                  value={valB}
                  onChange={(e) => setValB(parseInt(e.target.value))}
                  style={{ width: 140, display: 'block', marginTop: 4 }}
                />
              </div>
            </div>

            {/* Visual SVG Dissection */}
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
              <svg width="240" height="240" viewBox="0 0 240 240">
                {/* a^2 square (top-left) */}
                <rect x="20" y="20" width={valA * 25} height={valA * 25} fill="#93C5FD" stroke="#1D4ED8" strokeWidth="2" />
                <text x={20 + (valA * 25) / 2} y={20 + (valA * 25) / 2 + 5} textAnchor="middle" fontWeight="bold" fill="#1E3A8A" fontSize="14">
                  a² = {valA * valA}
                </text>

                {/* ab rectangle (top-right) */}
                <rect x={20 + valA * 25} y="20" width={valB * 25} height={valA * 25} fill="#BBF7D0" stroke="#15803D" strokeWidth="2" />
                <text x={20 + valA * 25 + (valB * 25) / 2} y={20 + (valA * 25) / 2 + 5} textAnchor="middle" fontWeight="bold" fill="#14532D" fontSize="12">
                  ab = {valA * valB}
                </text>

                {/* ab rectangle (bottom-left) */}
                <rect x="20" y={20 + valA * 25} width={valA * 25} height={valB * 25} fill="#BBF7D0" stroke="#15803D" strokeWidth="2" />
                <text x={20 + (valA * 25) / 2} y={20 + valA * 25 + (valB * 25) / 2 + 5} textAnchor="middle" fontWeight="bold" fill="#14532D" fontSize="12">
                  ab = {valA * valB}
                </text>

                {/* b^2 square (bottom-right) */}
                <rect x={20 + valA * 25} y={20 + valA * 25} width={valB * 25} height={valB * 25} fill="#FDE68A" stroke="#B45309" strokeWidth="2" />
                <text x={20 + valA * 25 + (valB * 25) / 2} y={20 + valA * 25 + (valB * 25) / 2 + 5} textAnchor="middle" fontWeight="bold" fill="#78350F" fontSize="12">
                  b² = {valB * valB}
                </text>
              </svg>
            </div>

            {/* Identity Formula Card */}
            <div
              style={{
                background: '#ECFDF5',
                padding: 16,
                borderRadius: 10,
                border: '1px solid #6EE7B7',
                lineHeight: 2,
              }}
            >
              <div>
                <strong>{L('जम्मा क्षेत्रफल (Total Area):', 'Total Area:')}</strong> (a + b)² = a² + ab + ab + b²
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: '#065F46',
                  marginTop: 4,
                }}
              >
                (a + b)² = a² + 2ab + b²
              </div>
              <div style={{ color: '#047857', fontSize: 14 }}>
                = {valA * valA} + 2({valA * valB}) + {valB * valB} = {valA * valA + 2 * valA * valB + valB * valB}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: (a - b)² */}
        {activeTab === 'minus-square' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('ज्यामितीय विधिद्वारा (a - b)² को प्रमाणीकरण', 'Geometrical Derivation of (a - b)²')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'भुजा a भएको ठूलो वर्ग a² बाट दुईओटा ab आयत घटाउँदा b² दोहोरो घट्छ, त्यसैले b² थपिन्छ:',
                'Subtracting two ab rectangles from a² removes b² twice, so b² is added back:'
              )}
            </p>

            <div
              style={{
                background: '#FEF2F2',
                padding: 16,
                borderRadius: 10,
                border: '1px solid #FECACA',
                lineHeight: 2,
                margin: '16px 0',
              }}
            >
              <div>
                <strong>{L('सर्वसमिका:', 'Identity:')}</strong> (a - b)² = a² - 2ab + b²
              </div>
              <div style={{ fontSize: 14, color: '#991B1B' }}>
                = {valA * valA} - 2({valA * valB}) + {valB * valB} = {valA * valA - 2 * valA * valB + valB * valB}
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#B91C1C',
                }}
              >
                ({valA} - {valB})² = ({valA - valB})² = {Math.pow(valA - valB, 2)}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Numerical Square Challenge */}
        {activeTab === 'numerical' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('सर्वसमिका प्रयोग गरी सङ्ख्याको वर्ग निकाल्ने (12², 88², 98², 999²)', 'Numerical Squares via Identities')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तकका उदाहरणहरू: सजिलो पूर्ण दश वा सयको आधारमा (a + b)² वा (a - b)² प्रयोग गरौँ:',
                'Textbook Examples: Convenient rounding using (a + b)² or (a - b)²:'
              )}
            </p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '14px 0' }}>
              {NUM_CASES.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    kit.tap();
                    setSelectedNum(item.num);
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: selectedNum === item.num ? '#187C68' : '#F1F5F9',
                    color: selectedNum === item.num ? '#FFF' : '#334155',
                  }}
                >
                  {item.num}²
                </button>
              ))}
            </div>

            {(() => {
              const cur = NUM_CASES.find((c) => c.num === selectedNum)!;
              return (
                <div
                  style={{
                    background: '#F8FAFC',
                    padding: 16,
                    borderRadius: 10,
                    border: '1px solid #CBD5E1',
                    lineHeight: 2,
                    marginTop: 16,
                  }}
                >
                  <div>
                    <strong>{L('1. रूपान्तरण:', '1. Split:')}</strong> {cur.num}² = {cur.formula}
                  </div>
                  <div>
                    <strong>{L('2. विस्तार गर्दा:', '2. Expanding identity:')}</strong> {cur.expanded}
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 24,
                      fontWeight: 800,
                      color: '#187C68',
                    }}
                  >
                    {cur.num}² = {cur.ans.toLocaleString()}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default GeometricalIdentitiesSquareLab;
