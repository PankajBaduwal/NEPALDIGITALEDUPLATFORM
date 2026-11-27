/**
 * ScientificNotationExplorer.tsx
 * Grade 8 Mathematics – Unit 3: RATIONAL AND IRRATIONAL NUMBERS (परिमेय र अपरिमेय सङ्ख्याहरू)
 * Simulation 6: Scientific Notation Explorer (वैज्ञानिक सङ्केतन अन्वेषक)
 * Strictly adheres to CDC Nepal Grade 8 Mathematics Curriculum (2023 edition, Unit 3)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Globe, ArrowRight, Sparkles, Check, MoveHorizontal, Award } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'वैज्ञानिक सङ्केतन (Scientific Notation) मा सङ्ख्यालाई कुन स्वरूपमा लेखिन्छ?',
    en: 'In which standard form is a number written in scientific notation?',
    options: [
      { key: 'A', label: 'a × १०ⁿ (जहाँ १ ≤ |a| < १० र n पूर्णाङ्क हो)' },
      { key: 'B', label: 'a × १०ⁿ (जहाँ a जुनसुकै सङ्ख्या)' },
      { key: 'C', label: 'a × ५ⁿ' },
      { key: 'D', label: '१० × aⁿ' },
    ],
    answer: 'A',
  },
  {
    np: 'सङ्ख्या ३९००० (39,000) लाई वैज्ञानिक सङ्केतनमा लेख्दा कुन मान सही हुन्छ?',
    en: 'What is the correct scientific notation for 39,000?',
    options: [
      { key: 'A', label: '३.९ × १०⁴ (3.9 × 10⁴)' },
      { key: 'B', label: '३९ × १०³' },
      { key: 'C', label: '०.३९ × १०⁵' },
      { key: 'D', label: '३.९ × १०⁻⁴' },
    ],
    answer: 'A',
  },
  {
    np: 'अति सानो सङ्ख्या ०.०००३७ (0.00037) लाई वैज्ञानिक सङ्केतनमा बदल्दा १० को घात कति हुन्छ?',
    en: 'What is the exponent of 10 when converting 0.00037 into scientific notation?',
    options: [
      { key: 'A', label: '-४ [ ३.७ × १०⁻⁴ ]' },
      { key: 'B', label: '+४' },
      { key: 'C', label: '-५' },
      { key: 'D', label: '-३' },
    ],
    answer: 'A',
  },
  {
    np: 'पाठ्यपुस्तक अनुसार सूर्यबाट वरुण ग्रह (Neptune) को दुरी ४,४९५,०६०,००० किमी को वैज्ञानिक सङ्केतन कुन हो?',
    en: 'According to the textbook planetary distance table, what is the scientific notation for Neptune\'s distance (4,495,060,000 km)?',
    options: [
      { key: 'A', label: '४.४९५०६ × १०⁹ किमी (4.49506 × 10⁹ km)' },
      { key: 'B', label: '४४.९५०६ × १०⁸ किमी' },
      { key: 'C', label: '४.४९५०६ × १०⁷ किमी' },
      { key: 'D', label: '०.४४९५०६ × १०¹⁰ किमी' },
    ],
    answer: 'A',
  },
  {
    np: '६.३ × १०³ (6.3 × 10³) लाई सामान्य दशमलव सङ्ख्यामा रूपान्तरण गर्दा कति हुन्छ?',
    en: 'Converting 6.3 × 10³ to standard decimal form gives:',
    options: [
      { key: 'A', label: '६३०० (6300)' },
      { key: 'B', label: '६३०' },
      { key: 'C', label: '६३०००' },
      { key: 'D', label: '०.०६३' },
    ],
    answer: 'A',
  },
];

const PLANETS = [
  { nameNp: 'बुध (Mercury)', nameEn: 'Mercury', distKm: 57910000, notation: '5.791 × 10⁷' },
  { nameNp: 'शुक्र (Venus)', nameEn: 'Venus', distKm: 108200000, notation: '1.082 × 10⁸' },
  { nameNp: 'पृथ्वी (Earth)', nameEn: 'Earth', distKm: 149600000, notation: '1.496 × 10⁸' },
  { nameNp: 'मङ्गल (Mars)', nameEn: 'Mars', distKm: 227940000, notation: '2.2794 × 10⁸' },
  { nameNp: 'बृहस्पति (Jupiter)', nameEn: 'Jupiter', distKm: 778330000, notation: '7.7833 × 10⁸' },
  { nameNp: 'शनि (Saturn)', nameEn: 'Saturn', distKm: 1429400000, notation: '1.4294 × 10⁹' },
  { nameNp: 'अरुण (Uranus)', nameEn: 'Uranus', distKm: 2870990000, notation: '2.87099 × 10⁹' },
  { nameNp: 'वरुण (Neptune)', nameEn: 'Neptune', distKm: 4495060000, notation: '4.49506 × 10⁹' },
];

export const ScientificNotationExplorer: React.FC<{
  onBack?: () => void;
  onBackToLibrary?: () => void;
}> = ({ onBack, onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U3-04',
    chapter: 3,
    titleNp: 'वैज्ञानिक सङ्केतन अन्वेषक (Scientific Notation Explorer)',
    titleEn: 'Scientific Notation Explorer',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'basics' | 'planets' | 'small' | 'reverse' | 'challenge'>('basics');

  // Tab 1 interactive number
  const [sampleVal, setSampleVal] = useState<number>(39000);

  // Tab 4 reverse exponent slider
  const [reverseCoeff, setReverseCoeff] = useState<number>(6.3);
  const [reverseExp, setReverseExp] = useState<number>(3);

  const formatScientific = (num: number) => {
    if (num === 0) return { a: '0', n: 0 };
    const str = num.toExponential();
    const [coeff, exp] = str.split('e');
    return {
      a: parseFloat(coeff).toFixed(Math.min(4, (coeff.split('.')[1] || '').length)),
      n: parseInt(exp, 10),
    };
  };

  const sci = formatScientific(sampleVal);
  const reverseResult = reverseCoeff * Math.pow(10, reverseExp);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! अति ठूला र अति साना सङ्ख्याहरूलाई १० को घात a × १०ⁿ रूपमा वैज्ञानिक सङ्केतन गर्न सिकौँ!',
        'Hello! Represent very large and tiny quantities conveniently as a × 10ⁿ in scientific notation!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: '#f8fafc', padding: 8, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          {[
            { id: 'basics', labelNp: '१. वैज्ञानिक सङ्केतन अवधारणा', labelEn: '1. Concept & Move Dot', icon: MoveHorizontal },
            { id: 'planets', labelNp: '२. ग्रहहरूको दुरी (पाठ्यपुस्तक तालिका)', labelEn: '2. Planetary Distances', icon: Globe },
            { id: 'small', labelNp: '३. अति साना सङ्ख्याहरू (१०⁻ⁿ)', labelEn: '3. Tiny Numbers (10⁻ⁿ)', icon: Sparkles },
            { id: 'reverse', labelNp: '४. सामान्य दशमलवमा रूपान्तरण', labelEn: '4. Scientific to Decimal', icon: ArrowRight },
            { id: 'challenge', labelNp: '५. अभ्यास चुनौती', labelEn: '5. Quiz Challenge', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  border: 'none',
                  background: active ? '#0284c7' : '#ffffff',
                  color: active ? '#ffffff' : '#334155',
                  boxShadow: active ? '0 2px 4px rgba(2, 132, 199, 0.25)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                <Icon size={16} />
                <span>{isNe ? tab.labelNp : tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Basics & Interactive Dot */}
        {activeTab === 'basics' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0369a1', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <MoveHorizontal size={20} />
              {L('वैज्ञानिक सङ्केतन: a × १०ⁿ (जहाँ १ ≤ a < १०)', 'Scientific Notation: a × 10ⁿ (where 1 ≤ a < 10)')}
            </h3>
            <p style={{ margin: '0 0 14px 0', fontSize: 14, color: '#475569', lineHeight: 1.6 }}>
              {L(
                'दशमलव बिन्दुलाई सारेर बायाँतर्फ ठ्याक्कै एउटा गैर-शून्य अङ्क (१ देखि ९ सम्म) मात्र राखिन्छ। दशमलव बिन्दु बायाँ सार्दा १० को घात धनात्मक (+n) र दायाँ सार्दा ऋणात्मक (-n) हुन्छ।',
                'Move the decimal point until exactly one non-zero digit (1-9) is to its left. Moving left yields positive exponent (+n); moving right yields negative exponent (-n).'
              )}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {[759, 39000, 5000000, 0.00037, 0.000085].map((val) => (
                <button
                  key={val}
                  onClick={() => setSampleVal(val)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: sampleVal === val ? '2px solid #0284c7' : '1px solid #cbd5e1',
                    background: sampleVal === val ? '#e0f2fe' : '#ffffff',
                    color: sampleVal === val ? '#0369a1' : '#334155',
                  }}
                >
                  {val}
                </button>
              ))}
            </div>

            <div style={{ background: '#f0f9ff', padding: 18, borderRadius: 14, border: '1.5px solid #bae6fd' }}>
              <div style={{ fontSize: 13, color: '#0369a1', fontWeight: 700 }}>{L('सामान्य सङ्ख्या (Standard Number):', 'Standard Decimal Number:')}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', margin: '6px 0' }}>{sampleVal}</div>

              <div style={{ fontSize: 13, color: '#0284c7', fontWeight: 700, marginTop: 10 }}>{L('वैज्ञानिक सङ्केतन (Scientific Notation):', 'Scientific Notation:')}</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#0284c7', marginTop: 4 }}>
                {sci.a} × १०{isNe ? toNp(sci.n) : sci.n}
              </div>
              <div style={{ fontSize: 13, color: '#0369a1', marginTop: 6 }}>
                {sci.n >= 0
                  ? L(`दशमलव बिन्दुलाई बायाँतर्फ ${toNp(sci.n)} स्थान सारियो (घात +${toNp(sci.n)})`, `Moved decimal point ${sci.n} places LEFT (exponent +${sci.n})`)
                  : L(`दशमलव बिन्दुलाई दायाँतर्फ ${toNp(Math.abs(sci.n))} स्थान सारियो (घात ${toNp(sci.n)})`, `Moved decimal point ${Math.abs(sci.n)} places RIGHT (exponent ${sci.n})`)}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Planetary Distances from CDC Textbook */}
        {activeTab === 'planets' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0369a1', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Globe size={20} />
              {L('पाठ्यपुस्तक तालिका: सूर्यबाट ग्रहहरूको औसत दुरी', 'CDC Textbook Table: Planetary Distances from Sun')}
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th style={{ padding: 10, border: '1px solid #cbd5e1' }}>{L('ग्रहको नाम (Planet)', 'Planet')}</th>
                    <th style={{ padding: 10, border: '1px solid #cbd5e1' }}>{L('दुरी (किमीमा)', 'Distance (km)')}</th>
                    <th style={{ padding: 10, border: '1px solid #cbd5e1', color: '#0284c7' }}>{L('वैज्ञानिक सङ्केतन (a × १०ⁿ)', 'Scientific Notation')}</th>
                  </tr>
                </thead>
                <tbody>
                  {PLANETS.map((p, idx) => (
                    <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                      <td style={{ padding: 10, border: '1px solid #cbd5e1', fontWeight: 800 }}>{isNe ? p.nameNp : p.nameEn}</td>
                      <td style={{ padding: 10, border: '1px solid #cbd5e1' }}>{isNe ? toNp(p.distKm.toLocaleString()) : p.distKm.toLocaleString()} km</td>
                      <td style={{ padding: 10, border: '1px solid #cbd5e1', fontWeight: 900, color: '#0284c7' }}>
                        {p.notation} km
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Very Small Numbers */}
        {activeTab === 'small' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#16a34a', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={20} />
              {L('अति ठूला र अति साना भौतिक परिमाणहरू', 'Extremely Large & Extremely Small Physical Quantities')}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ background: '#eff6ff', padding: 16, borderRadius: 12, border: '1.5px solid #bfdbfe' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#1e40af' }}>{L('पृथ्वीको पिण्ड (Mass of Earth)', 'Mass of Earth')}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#1d4ed8', marginTop: 4 }}>
                  ५.९७२ × १०²⁴ केजी (kg)
                </div>
                <div style={{ fontSize: 12, color: '#1e3a8a', marginTop: 6 }}>
                  {L('५,९७२,०००,०००,०००,०००,०००,०००,००० केजी (२४ वटा स्थान बायाँ)', '5,972,000,000,000,000,000,000,000 kg')}
                </div>
              </div>

              <div style={{ background: '#fef2f2', padding: 16, borderRadius: 12, border: '1.5px solid #fecaca' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#991b1b' }}>{L('हाइड्रोजन परमाणुको पिण्ड (Hydrogen Atom)', 'Mass of Hydrogen Atom')}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#dc2626', marginTop: 4 }}>
                  १.६७ × १०⁻²⁷ केजी (kg)
                </div>
                <div style={{ fontSize: 12, color: '#991b1b', marginTop: 6 }}>
                  {L('०.००००००००००००००००००००००००००१६७ केजी (२७ स्थान दायाँ)', '0.00000000000000000000000000167 kg')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Reverse Conversion */}
        {activeTab === 'reverse' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0369a1', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ArrowRight size={20} />
              {L('वैज्ञानिक सङ्केतनबाट सामान्य दशमलवमा रूपान्तरण', 'Scientific Notation to Standard Decimal')}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
                  {L('गुणांक a (१ ≤ a < १०):', 'Coefficient a (1 ≤ a < 10):')} {reverseCoeff}
                </label>
                <input
                  type="range"
                  min="1"
                  max="9.9"
                  step="0.1"
                  value={reverseCoeff}
                  onChange={(e) => setReverseCoeff(parseFloat(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer', marginTop: 6 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
                  {L('घात n (Exponent):', 'Exponent n:')} {reverseExp}
                </label>
                <input
                  type="range"
                  min="-5"
                  max="6"
                  step="1"
                  value={reverseExp}
                  onChange={(e) => setReverseExp(parseInt(e.target.value, 10))}
                  style={{ width: '100%', cursor: 'pointer', marginTop: 6 }}
                />
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: 18, borderRadius: 14, border: '1.5px solid #cbd5e1', textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#0369a1' }}>
                {reverseCoeff} × १०{isNe ? toNp(reverseExp) : reverseExp}
              </div>
              <div style={{ fontSize: 18, color: '#64748b', margin: '8px 0' }}>▼ {L('सामान्य रूपमा बदल्दा:', 'Standard Form:')}</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#16a34a' }}>
                {reverseResult}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Challenge */}
        {activeTab === 'challenge' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0369a1', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award size={20} />
              {L('वैज्ञानिक सङ्केतन अभ्यास तथा चुनौती', 'Scientific Notation Quiz Challenge')}
            </h3>
            <p style={{ margin: 0, fontSize: 14, color: '#475569' }}>
              {L(
                'माथि दायाँ कुनामा रहेको "चुनौती (Challenge)" ट्याबबाट ५ वटा आधिकारिक पाठ्यपुस्तकका प्रश्नहरू हल गरी ताराहरू कमाउनुहोस्!',
                'Click "Challenge" mode in the header to take the official CDC curriculum quiz and earn mastery stars!'
              )}
            </p>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default ScientificNotationExplorer;
