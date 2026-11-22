/**
 * LawsOfIndicesStudio.tsx
 * Grade 7 Mathematics – Lesson 10: INDICES (घाताङ्क)
 * Simulation 2: Laws of Indices and Simplification Studio (2D Interactive Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 140-143)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Sparkles, Divide, X, ArrowRight, Check } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'एउटै आधार भएका घाताङ्कीय पदहरूको गुणन गर्दा घाताङ्कहरू के गरिन्छ? (aᵐ × aⁿ = ?)',
    en: 'When multiplying powers with the same base, what is done to the exponents? (aᵐ × aⁿ = ?)',
    options: [
      { key: 'A', label: 'घाताङ्कहरू जोडिन्छ: aᵐ⁺ⁿ' },
      { key: 'B', label: 'घाताङ्कहरू घटाइन्छ: aᵐ⁻ⁿ' },
      { key: 'C', label: 'घाताङ्कहरू गुणन गरिन्छ: aᵐⁿ' },
      { key: 'D', label: 'आधारहरू जोडिन्छ' },
    ],
    answer: 'A',
  },
  {
    np: 'एउटै आधार भएका घाताङ्कीय पदहरूको भाग गर्दा घाताङ्कहरू के गरिन्छ? (aᵐ ÷ aⁿ = ? जहाँ a ≠ 0)',
    en: 'When dividing powers with the same base, what is done to the exponents? (aᵐ ÷ aⁿ = ? for a ≠ 0)',
    options: [
      { key: 'A', label: 'घाताङ्कहरू घटाइन्छ: aᵐ⁻ⁿ' },
      { key: 'B', label: 'घाताङ्कहरू जोडिन्छ: aᵐ⁺ⁿ' },
      { key: 'C', label: 'शून्य हुन्छ' },
      { key: 'D', label: '१ हुन्छ' },
    ],
    answer: 'A',
  },
  {
    np: 'कुनै पनि शून्य बाहेकको सङ्ख्याको घात शून्य भएमा (a⁰ = ?) त्यसको मान कति हुन्छ? (जहाँ a ≠ 0)',
    en: 'What is the value of any non-zero number raised to the zero power (a⁰ = ? for a ≠ 0)?',
    options: [
      { key: 'A', label: '१ (One)' },
      { key: 'B', label: '० (Zero)' },
      { key: 'C', label: 'a' },
      { key: 'D', label: 'अनन्त (Infinity)' },
    ],
    answer: 'A',
  },
  {
    np: '१०a⁴ × १५a⁵ ÷ ७५a⁸ को सरल मान कति हुन्छ?',
    en: 'What is the simplified value of 10a⁴ × 15a⁵ ÷ 75a⁸?',
    options: [
      { key: 'A', label: '२a [ (१५०a⁹) ÷ (७५a⁸) = २a ]' },
      { key: 'B', label: '२a²' },
      { key: 'C', label: '२' },
      { key: 'D', label: '५a' },
    ],
    answer: 'A',
  },
];

export const LawsOfIndicesStudio: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L10-02',
    titleEn: 'Laws of Indices & Simplification Studio',
    titleNp: 'घाताङ्कका नियमहरू र सरलीकरण प्रयोगशाला',
    chapter: 10,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'mul-law' | 'div-law' | 'zero-power' | 'simplification'>('mul-law');

  // Law 1: Multiplication (a^m * a^n = a^(m+n))
  const [mulM, setMulM] = useState<number>(2);
  const [mulN, setMulN] = useState<number>(3);

  // Law 2: Division (a^m / a^n = a^(m-n))
  const [divM, setDivM] = useState<number>(5);
  const [divN, setDivN] = useState<number>(2);

  // Law 3: Zero power (a^p / a^p = a^0 = 1)
  const [zeroBase, setZeroBase] = useState<number>(5);
  const [zeroP, setZeroP] = useState<number>(3);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'घाताङ्कका ३ आधारभूत नियमहरू: गुणनमा घात जोडिन्छ (aᵐ × aⁿ = aᵐ⁺ⁿ), भागमा घात घटाइन्छ (aᵐ ÷ aⁿ = aᵐ⁻ⁿ), र a⁰ = १ हुन्छ!',
        '3 Laws of Indices: Multiply adds powers (aᵐ × aⁿ = aᵐ⁺ⁿ), Divide subtracts powers (aᵐ ÷ aⁿ = aᵐ⁻ⁿ), and a⁰ = 1!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'mul-law', np: '१. गुणनको नियम (aᵐ × aⁿ = aᵐ⁺ⁿ)', en: '1. Multiplication Law' },
            { id: 'div-law', np: '२. भागको नियम (aᵐ ÷ aⁿ = aᵐ⁻ⁿ)', en: '2. Division Law' },
            { id: 'zero-power', np: '३. शून्य घातको नियम (a⁰ = 1)', en: '3. Zero Power Law' },
            { id: 'simplification', np: '४. सरलीकरण कार्यशाला (Simplification)', en: '4. Simplification' },
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

        {/* TAB 1: Multiplication Law */}
        {activeTab === 'mul-law' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('नियम १ – समान आधार भएका पदहरूको गुणन (Multiplication Law)', 'Law 1 – Multiplication Law')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक उदाहरण: a² × a³ लाई विस्तार गर्दा (a × a) × (a × a × a) = a⁵ हुन्छ। अर्थात् घातहरू जोडिन्छन्: aᵐ × aⁿ = aᵐ⁺ⁿ।',
                'Textbook Example: a² × a³ = (a × a) × (a × a × a) = a⁵. Exponents are added: aᵐ × aⁿ = aᵐ⁺ⁿ.'
              )}
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '16px 0' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#0369A1', display: 'block', marginBottom: 4 }}>
                  पहिलो घात (m): {mulM}
                </label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={mulM}
                  onChange={(e) => {
                    kit.tap();
                    setMulM(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#15803D', display: 'block', marginBottom: 4 }}>
                  दोस्रो घात (n): {mulN}
                </label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={mulN}
                  onChange={(e) => {
                    kit.tap();
                    setMulN(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>
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
                <strong>{L('१. दिइएको अभिव्यक्ति:', '1. Given Expression:')}</strong> a<sup>{mulM}</sup> × a<sup>{mulN}</sup>
              </div>
              <div>
                <strong>{L('२. विस्तार गर्दा:', '2. Expanding Factors:')}</strong> (
                {Array.from({ length: mulM }).map(() => 'a').join(' × ')} ) × ({' '}
                {Array.from({ length: mulN }).map(() => 'a').join(' × ')} )
              </div>
              <div>
                <strong>{L('३. जम्मा factors गन्दा:', '3. Total factors:')}</strong> {mulM} + {mulN} = {mulM + mulN} पटक a
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 24,
                  fontWeight: 800,
                  color: '#166534',
                }}
              >
                a<sup>{mulM}</sup> × a<sup>{mulN}</sup> = a<sup>{mulM} + {mulN}</sup> = a<sup>{mulM + mulN}</sup>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Division Law */}
        {activeTab === 'div-law' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('नियम २ – समान आधार भएका पदहरूको भाग (Division Law)', 'Law 2 – Division Law')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक उदाहरण: a⁵ ÷ a² गर्दा अंश र छेदका साझा गुणनखण्डहरू काटिन्छन्: a⁵⁻² = a³। नियम: aᵐ ÷ aⁿ = aᵐ⁻ⁿ (जहाँ a ≠ 0)।',
                'Textbook Example: a⁵ ÷ a² cancels common factors: a⁵⁻² = a³. Rule: aᵐ ÷ aⁿ = aᵐ⁻ⁿ (for a ≠ 0).'
              )}
            </p>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '16px 0' }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#0369A1', display: 'block', marginBottom: 4 }}>
                  अंशको घात (m): {divM}
                </label>
                <input
                  type="range"
                  min={2}
                  max={6}
                  value={divM}
                  onChange={(e) => {
                    kit.tap();
                    const newM = parseInt(e.target.value);
                    setDivM(newM);
                    if (divN >= newM) setDivN(newM - 1);
                  }}
                  style={{ width: 140 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#DC2626', display: 'block', marginBottom: 4 }}>
                  छेदको घात (n): {divN}
                </label>
                <input
                  type="range"
                  min={1}
                  max={divM}
                  value={divN}
                  onChange={(e) => {
                    kit.tap();
                    setDivN(parseInt(e.target.value));
                  }}
                  style={{ width: 140 }}
                />
              </div>
            </div>

            {/* Calculations Card */}
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
                <strong>{L('१. भाग रूप:', '1. Division Form:')}</strong> a<sup>{divM}</sup> ÷ a<sup>{divN}</sup> = a
                <sup>{divM}</sup> / a<sup>{divN}</sup>
              </div>
              <div>
                <strong>{L('२. साझा a हरू काट्दा:', '2. Cancelling common factors:')}</strong> छेदका {divN} वटा a ले अंशका{' '}
                {divN} वटा a काट्छ
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 24,
                  fontWeight: 800,
                  color: '#3730A3',
                }}
              >
                a<sup>{divM}</sup> ÷ a<sup>{divN}</sup> = a<sup>{divM} - {divN}</sup> = a<sup>{divM - divN}</sup>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Zero Power Law */}
        {activeTab === 'zero-power' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('नियम ३ – शून्य घातको नियम (Law of Zero Power: a⁰ = 1)', 'Law of Zero Power (a⁰ = 1)')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तक प्रमाण: a³ ÷ a³ = a³⁻³ = a⁰ हुन्छ। तर कुनै सङ्ख्यालाई सोही सङ्ख्याले भाग गर्दा १ हुन्छ (a³/a³ = १)। त्यसैले a⁰ = १ (जहाँ a ≠ 0)।',
                'Proof: a³ ÷ a³ = a³⁻³ = a⁰. Any quantity divided by itself equals 1. Therefore a⁰ = 1 (for a ≠ 0).'
              )}
            </p>

            <div style={{ margin: '16px 0' }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                {L('आधार सङ्ख्या (Non-zero base - a): ', 'Base (a): ')} {zeroBase}
              </label>
              <input
                type="range"
                min={1}
                max={25}
                value={zeroBase}
                onChange={(e) => {
                  kit.tap();
                  setZeroBase(parseInt(e.target.value));
                }}
                style={{ width: 200 }}
              />
            </div>

            <div
              style={{
                background: '#ECFDF5',
                padding: 16,
                borderRadius: 10,
                border: '2px solid #10B981',
                lineHeight: 2,
              }}
            >
              <div>
                <strong>{L('१. घाताङ्कको भाग नियम अनुसार:', '1. By Division Law:')}</strong> {zeroBase}³ ÷ {zeroBase}³ ={' '}
                {zeroBase}<sup>३ - ३</sup> = {zeroBase}⁰
              </div>
              <div>
                <strong>{L('२. अङ्कगणित अनुसार:', '2. By Arithmetic:')}</strong> {zeroBase}³ ÷ {zeroBase}³ ={' '}
                {Math.pow(zeroBase, 3)} ÷ {Math.pow(zeroBase, 3)} = १
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 26,
                  fontWeight: 800,
                  color: '#065F46',
                }}
              >
                {zeroBase}⁰ = १ (One)
              </div>
              <div style={{ fontSize: 13, color: '#047857', marginTop: 2 }}>
                💡 <strong>{L('नोट:', 'Note:')}</strong> ०⁰ (शून्यको घात शून्य) गणितमा अपरिभाषित हुन्छ, त्यसैले नियममा a ≠ ० हुनुपर्छ।
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Simplification */}
        {activeTab === 'simplification' && (
          <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
              {L('घाताङ्कका नियमहरू प्रयोग गरी सरलीकरण (Simplification Workspace)', 'Simplification Workspace')}
            </h3>
            <p style={{ color: '#64748B', fontSize: 14 }}>
              {L(
                'पाठ्यपुस्तकका प्रतिनिधि प्रश्नहरूलाई चरणबद्ध रूपमा हल गरौँ:',
                'Step-by-step simplification of textbook exercises:'
              )}
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 16,
                marginTop: 16,
              }}
            >
              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 10, border: '1px solid #CBD5E1' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#0369A1' }}>
                  {L('उदाहरण १: १०a⁴ × १५a⁵ ÷ ७५a⁸', 'Example 1: 10a⁴ × 15a⁵ ÷ 75a⁸')}
                </span>
                <div style={{ fontSize: 14, lineHeight: 1.8, marginTop: 8 }}>
                  <div>= (१० × १५ × a⁴⁺⁵) ÷ ७५a⁸</div>
                  <div>= १५०a⁹ ÷ ७५a⁸</div>
                  <div>= (१५० ÷ ७५) × a⁹⁻⁸</div>
                  <div style={{ fontWeight: 800, color: '#187C68', fontSize: 16, marginTop: 4 }}>
                    = २a¹ = <strong>२a</strong>
                  </div>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 10, border: '1px solid #CBD5E1' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#4338CA' }}>
                  {L('उदाहरण २: x⁵y⁵ ÷ x²y²', 'Example 2: x⁵y⁵ ÷ x²y²')}
                </span>
                <div style={{ fontSize: 14, lineHeight: 1.8, marginTop: 8 }}>
                  <div>= (x⁵ ÷ x²) × (y⁵ ÷ y²)</div>
                  <div>= x⁵⁻² × y⁵⁻²</div>
                  <div style={{ fontWeight: 800, color: '#3730A3', fontSize: 16, marginTop: 4 }}>
                    = <strong>x³y³</strong>
                  </div>
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 10, border: '1px solid #CBD5E1' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#B45309' }}>
                  {L('उदाहरण ३: (३a)⁴ × (३a)³ × (३a)⁻⁷', 'Example 3: (3a)⁴ × (3a)³ × (3a)⁻⁷')}
                </span>
                <div style={{ fontSize: 14, lineHeight: 1.8, marginTop: 8 }}>
                  <div>= (३a)⁴⁺³⁺⁽⁻⁷⁾</div>
                  <div>= (३a)⁷⁻⁷ = (३a)⁰</div>
                  <div style={{ fontWeight: 800, color: '#059669', fontSize: 16, marginTop: 4 }}>
                    = <strong>१ (One)</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default LawsOfIndicesStudio;
