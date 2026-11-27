/**
 * IndicesDiscoveryExpansionLab.tsx
 * Grade 7 Mathematics – Lesson 10: INDICES
 * Simulation 1: Indices Discovery and Expansion Lab (2D Interactive Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 138-140)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Zap, Hash, ArrowRight, RefreshCw, Check } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'घाताङ्कीय रूप 3⁵ (3⁵) मा आधार (Base) र घात (Power) कुन-कुन हुन्?',
    en: 'In index form 3⁵, which are the Base and the Power?',
    options: [
      { key: 'A', label: 'Base = 3, Power = 5' },
      { key: 'B', label: 'Base = 5, Power = 3' },
      { key: 'C', label: 'Both are bases' },
      { key: 'D', label: 'Base = 15' },
    ],
    answer: 'A',
  },
  {
    np: '4 × 4 × 4 × 4 × 4 × 4 लाई घाताङ्क रूपमा कसरी लेखिन्छ?',
    en: 'How is 4 × 4 × 4 × 4 × 4 × 4 written in index form?',
    options: [
      { key: 'A', label: '4⁶ (4⁶)' },
      { key: 'B', label: '4 × 6' },
      { key: 'C', label: '6⁴' },
      { key: 'D', label: '24' },
    ],
    answer: 'A',
  },
  {
    np: '(-2)⁴ को मान कति हुन्छ?',
    en: 'What is the value of (-2)⁴?',
    options: [
      { key: 'A', label: '+16 [ (-2) × (-2) × (-2) × (-2) = +16 ]' },
      { key: 'B', label: '-16' },
      { key: 'C', label: '+8' },
      { key: 'D', label: '-8' },
    ],
    answer: 'A',
  },
  {
    np: '5³ को विस्तारित रूप (Expanded Form) कुन हो?',
    en: 'What is the expanded form of 5³?',
    options: [
      { key: 'A', label: '5 × 5 × 5 = 125' },
      { key: 'B', label: '5 × 3 = 15' },
      { key: 'C', label: '3 × 3 × 3 × 3 × 3' },
      { key: 'D', label: '5 + 5 + 5 = 15' },
    ],
    answer: 'A',
  },
];

export const IndicesDiscoveryExpansionLab: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L10-01',
    titleEn: 'Indices Discovery and Expansion Lab',
    titleNp: 'घाताङ्क खोजी र विस्तार प्रयोगशाला',
    chapter: 10,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'repeated' | 'identify' | 'expand'>('repeated');

  // Tab 1: Repeated Multiplication
  const [baseVal, setBaseVal] = useState<number>(3);
  const [exponentVal, setExponentVal] = useState<number>(4);
  const calculatedVal = Math.pow(baseVal, exponentVal);

  // Tab 2: Identify Base & Power examples
  const IDENTIFY_EXAMPLES = [
    { expr: '3⁵', base: '3', power: '5', npText: '3 multiplied 5 times' },
    { expr: '2³', base: '2', power: '3', npText: '2 लाई 3 times गुणन गरिएको' },
    { expr: '5⁴', base: '5', power: '4', npText: '5 लाई 4 times गुणन गरिएको' },
    { expr: 'x⁴', base: 'x', power: '4', npText: 'चल x लाई 4 times गुणन गरिएको' },
    { expr: '(-3y)⁶', base: '-3y', power: '6', npText: '(-3y) लाई 6 times गुणन गरिएको' },
  ];
  const [selectedIdentify, setSelectedIdentify] = useState<number>(0);

  // Tab 3: Negative Base Expansion
  const [negBase, setNegBase] = useState<number>(-2);
  const [negExp, setNegExp] = useState<number>(4);
  const negVal = Math.pow(negBase, negExp);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'कुनै सङ्ख्यालाई बारम्बार गुणन गर्दा घाताङ्क रूप बन्छ: आधार (Base) तल र घात (Power) माथि लेखिन्छ!',
        'Repeated multiplication forms index notation: Base at bottom, Power at top!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'repeated', np: '1. बारम्बार गुणन र घाताङ्क', en: '1. Repeated Multiplication' },
            { id: 'identify', np: '2. आधार र घात पहिचान', en: '2. Base & Power' },
            { id: 'expand', np: '3. विस्तार र मान गणना', en: '3. Expansion & Value' },
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

        {/* TAB 1: Repeated Multiplication */}
        {activeTab === 'repeated' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('बारम्बार गुणनबाट घाताङ्क रूप निर्माण (Repeated Multiplication)', 'Repeated Multiplication')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'एउटै सङ्ख्यालाई times-times गुणन गर्दा संक्षिप्त रूपमा घाताङ्क (Index Notation) प्रयोग गरिन्छ।',
                'Repeatedly multiplying the same number is written compactly using index notation.'
              )}
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '16px 0' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#0369A1', display: 'block', marginBottom: 4 }}>
                  {L('आधार सङ्ख्या (Base): ', 'Base: ')} {baseVal}
                </label>
                <input
                  type="range"
                  min={2}
                  max={6}
                  value={baseVal}
                  onChange={(e) => {
                    kit.tap();
                    setBaseVal(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#D97706', display: 'block', marginBottom: 4 }}>
                  {L('गुणन सङ्ख्या / घात (Power): ', 'Power: ')} {exponentVal} times
                </label>
                <input
                  type="range"
                  min={1}
                  max={6}
                  value={exponentVal}
                  onChange={(e) => {
                    kit.tap();
                    setExponentVal(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>
            </div>

            {/* Visual Multiplication Cards */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                flexWrap: 'wrap',
                padding: 16,
                background: '#F8FAFC',
                borderRadius: 10,
                border: '1px solid #E2E8F0',
                margin: '16px 0',
              }}
            >
              {Array.from({ length: exponentVal }).map((_, i) => (
                <React.Fragment key={i}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 8,
                      background: '#3B82F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFF',
                      fontSize: 20,
                      fontWeight: 800,
                      boxShadow: '0 2px 4px rgba(59,130,246,0.3)',
                    }}
                  >
                    {baseVal}
                  </div>
                  {i < exponentVal - 1 && (
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#94A3B8' }}>×</span>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Index Notation Box */}
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
                <strong>{L('घाताङ्क रूप (Index Form):', 'Index Form:')}</strong>{' '}
                <span style={{ fontSize: 28, fontWeight: 800, color: '#166534' }}>
                  {baseVal}
                  <sup style={{ fontSize: 18, color: '#D97706' }}>{exponentVal}</sup>
                </span>
              </div>
              <div style={{ fontSize: 14, color: '#15803D' }}>
                {L(
                  `अर्थ: आधार ${baseVal} लाई ${exponentVal} times आपसमा गुणन गर्दा = ${calculatedVal.toLocaleString()}`,
                  `Meaning: Multiplying base ${baseVal} a total of ${exponentVal} times = ${calculatedVal.toLocaleString()}`
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Identify Base & Power */}
        {activeTab === 'identify' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('आधार (Base) र घात (Power/Exponent) पहिचान', 'Identify Base and Power')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तकका उदाहरणहरू छानेर आधार र घात पहिचान गर्नुहोस्:',
                'Select textbook examples to inspect base and exponent:'
              )}
            </p>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '14px 0' }}>
              {IDENTIFY_EXAMPLES.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    kit.tap();
                    setSelectedIdentify(idx);
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: selectedIdentify === idx ? '#187C68' : '#F1F5F9',
                    color: selectedIdentify === idx ? '#FFF' : '#334155',
                  }}
                >
                  {item.expr}
                </button>
              ))}
            </div>

            {(() => {
              const cur = IDENTIFY_EXAMPLES[selectedIdentify];
              return (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: 16,
                    marginTop: 16,
                  }}
                >
                  <div style={{ background: '#EFF6FF', padding: 16, borderRadius: 10, border: '2px solid #93C5FD' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#1D4ED8' }}>
                      {L('आधार (Base)', 'Base')}
                    </span>
                    <div style={{ fontSize: 26, fontWeight: 800, color: '#1E40AF', marginTop: 4 }}>
                      {cur.base}
                    </div>
                    <div style={{ fontSize: 12, color: '#1E3A8A', marginTop: 2 }}>
                      {L('गुणन गरिने मुख्य सङ्ख्या वा चल', 'The repeated factor')}
                    </div>
                  </div>

                  <div style={{ background: '#FFFBEB', padding: 16, borderRadius: 10, border: '2px solid #FCD34D' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#B45309' }}>
                      {L('घात (Power / Exponent)', 'Power / Exponent')}
                    </span>
                    <div style={{ fontSize: 26, fontWeight: 800, color: '#92400E', marginTop: 4 }}>
                      {cur.power}
                    </div>
                    <div style={{ fontSize: 12, color: '#78350F', marginTop: 2 }}>
                      {L('कति times गुणन गरिएको सङ्ख्या', 'Number of times repeated')}
                    </div>
                  </div>

                  <div style={{ background: '#ECFDF5', padding: 16, borderRadius: 10, border: '1px solid #6EE7B7' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#065F46' }}>
                      {L('अर्थ (Explanation)', 'Explanation')}
                    </span>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#047857', marginTop: 6 }}>
                      {cur.npText}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 3: Expansion & Values */}
        {activeTab === 'expand' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('घाताङ्कको विस्तार र मान (Expansion and Numerical Value)', 'Expansion and Numerical Value')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक उदाहरण: (-2)⁴ को विस्तार र मान निकाल्ने विधि (ऋणात्मक आधारको जोड घात भए धनात्मक र बिजोर भए ऋणात्मक हुन्छ):',
                'Textbook Example: (-2)⁴ expansion. Even power of negative is positive; odd power is negative:'
              )}
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '16px 0' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#DC2626', display: 'block', marginBottom: 4 }}>
                  {L('आधार: ', 'Base: ')} {negBase}
                </label>
                <button
                  onClick={() => {
                    kit.tap();
                    setNegBase(negBase === -2 ? -3 : negBase === -3 ? 5 : -2);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  Change ({negBase})
                </button>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#4338CA', display: 'block', marginBottom: 4 }}>
                  {L('घात (Exponent): ', 'Exponent: ')} {negExp}
                </label>
                <input
                  type="range"
                  min={1}
                  max={6}
                  value={negExp}
                  onChange={(e) => {
                    kit.tap();
                    setNegExp(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>
            </div>

            {/* Calculations Card */}
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
                <strong>{L('विस्तार (Expansion):', 'Expansion:')}</strong>{' '}
                {Array.from({ length: negExp })
                  .map(() => `(${negBase})`)
                  .join(' × ')}
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 22,
                  fontWeight: 800,
                  color: negVal >= 0 ? '#166534' : '#DC2626',
                }}
              >
                ({negBase})<sup>{negExp}</sup> = {negVal}
              </div>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>
                {negExp % 2 === 0
                  ? L('घात जोड (Even) भएकोले नतिजा धनात्मक (+) भयो।', 'Even power results in positive (+) sign.')
                  : L('घात बिजोर (Odd) भएकोले नतिजा ऋणात्मक (-) भयो।', 'Odd power results in negative (-) sign.')}
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default IndicesDiscoveryExpansionLab;
