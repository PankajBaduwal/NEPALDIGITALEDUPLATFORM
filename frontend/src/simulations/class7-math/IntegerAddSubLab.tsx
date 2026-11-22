/**
 * IntegerAddSubLab.tsx
 * Grade 7 Mathematics – Lesson 3: INTEGER (पूर्णाङ्क)
 * Simulation 2: Integer Addition and Subtraction Lab (2D Interactive Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 51-57)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Plus, Minus, ArrowRight, RotateCcw, Check, Sparkles, Navigation } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: '(-५) + (+३) को मान कति हुन्छ? (+ र - जोडी रद्द गर्दा)',
    en: 'What is (-5) + (+3)? (By cancelling positive and negative pairs)',
    options: [
      { key: 'A', label: '-२' },
      { key: 'B', label: '+२' },
      { key: 'C', label: '-८' },
      { key: 'D', label: '+८' },
    ],
    answer: 'A',
  },
  {
    np: 'बसपार्कबाट २० किमी पूर्व गई १३ किमी पश्चिम फर्किँदा हालको स्थान कति हुन्छ?',
    en: 'Traveling 20 km East from bus park and returning 13 km West results in what position?',
    options: [
      { key: 'A', label: '+७ किमी पूर्व (+7 km East)' },
      { key: 'B', label: '-७ किमी पश्चिम' },
      { key: 'C', label: '+३३ किमी' },
      { key: 'D', label: '० किमी' },
    ],
    answer: 'A',
  },
  {
    np: 'a + b = b + a कुन गुण (Property) हो?',
    en: 'a + b = b + a demonstrates which property?',
    options: [
      { key: 'A', label: 'क्रमविनिमेय गुण (Commutative Property)' },
      { key: 'B', label: 'साहचर्य गुण (Associative Property)' },
      { key: 'C', label: 'संवृत गुण (Closure Property)' },
      { key: 'D', label: 'प्रतिलोम गुण (Additive Inverse)' },
    ],
    answer: 'A',
  },
  {
    np: '(-४) - (-५) को मान कति हुन्छ? (घटाउलाई जोडमा बदल्दा: -४ + ५)',
    en: 'What is (-4) - (-5)? (Converting subtraction to addition: -4 + 5)',
    options: [
      { key: 'A', label: '-९' },
      { key: 'B', label: '+१' },
      { key: 'C', label: '-१' },
      { key: 'D', label: '+९' },
    ],
    answer: 'B',
  },
];

export const IntegerAddSubLab: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L3-02',
    titleEn: 'Integer Addition & Subtraction Lab',
    titleNp: 'पूर्णाङ्कको जोड र घटाउ प्रयोगशाला',
    chapter: 3,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'counters' | 'numberline' | 'buspark' | 'properties'>('counters');

  // ── Tab 1: Positive/Negative Card Counters ───────────────────
  const [negCount, setNegCount] = useState<number>(5); // e.g. -5
  const [posCount, setPosCount] = useState<number>(3); // e.g. +3
  const cancelledPairs = Math.min(negCount, posCount);
  const remainingNeg = negCount - cancelledPairs;
  const remainingPos = posCount - cancelledPairs;
  const counterResult = remainingPos - remainingNeg;

  // ── Tab 2: Number Line Addition/Subtraction ──────────────────
  const [lineStart, setLineStart] = useState<number>(2);
  const [lineDelta, setLineDelta] = useState<number>(4);
  const lineEnd = lineStart + lineDelta;

  // ── Tab 3: Bus Park Direction ────────────────────────────────
  const [eastKm, setEastKm] = useState<number>(20);
  const [westKm, setWestKm] = useState<number>(13);
  const busParkResult = eastKm - westKm;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'धनात्मक र ऋणात्मक कार्डहरू जोडी बनेपछि रद्द भएर शून्य हुन्छन्! सङ्ख्या रेखामा दायाँ जोडिन्छ र बायाँ घटाइन्छ।',
        'Positive and negative pairs cancel out to zero! On a number line, moving right adds and moving left subtracts.'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: '#FFFFFF', padding: 8, borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          {[
            { id: 'counters', np: '१. कार्ड जोडी मोडल (+ र -)', en: '1. Counter Model (+ & -)' },
            { id: 'numberline', np: '२. सङ्ख्यारेखाबाट जोड/घटाउ', en: '2. Number Line Add/Sub' },
            { id: 'buspark', np: '३. व्यवहारिक बसपार्क पूर्व/पश्चिम', en: '3. Bus Park East/West' },
            { id: 'properties', np: '४. जोडका गणितीय गुणहरू', en: '4. Properties of Addition' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                kit.tap();
                setActiveTab(tab.id as any);
              }}
              style={{
                flex: '1 1 auto',
                padding: '10px 14px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === tab.id ? '#0F766E' : '#F8FAFC',
                color: activeTab === tab.id ? '#FFFFFF' : '#334155',
                transition: 'all 0.15s ease',
              }}
            >
              {isNe ? tab.np : tab.en}
            </button>
          ))}
        </div>

        {/* ── TAB 1: COUNTER MODEL ─────────────────────────── */}
        {activeTab === 'counters' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, background: '#CCFBF1', color: '#0F766E', padding: '3px 8px', borderRadius: 6 }}>
                  {L('पाठ्यपुस्तक मोडल (पृष्ठ ५१-५२)', 'Textbook Counter Model (Pages 51-52)')}
                </span>
                <h3 style={{ margin: '6px 0 0', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
                  {L('धनात्मक (+) र ऋणात्मक (-) कार्ड जोडी बनाएर शून्य (०) बनाउने विधि', 'Pairing Positive (+) & Negative (-) Counters to Cancel to Zero')}
                </h3>
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#0F766E' }}>
                (-{isNe ? toNp(negCount) : negCount}) + (+{isNe ? toNp(posCount) : posCount}) ={' '}
                <strong style={{ color: counterResult > 0 ? '#16A34A' : counterResult < 0 ? '#DC2626' : '#0F766E' }}>
                  {counterResult > 0 ? `+${isNe ? toNp(counterResult) : counterResult}` : isNe ? toNp(counterResult) : counterResult}
                </strong>
              </div>
            </div>

            {/* Adjustment Controls */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
              <div style={{ background: '#FEE2E2', padding: 14, borderRadius: 12, border: '1px solid #FCA5A5' }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#DC2626' }}>
                  {L('ऋणात्मक (-) कार्डहरू:', 'Negative (-) Cards:')} {isNe ? toNp(negCount) : negCount}
                </span>
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  <button onClick={() => setNegCount(Math.max(0, negCount - 1))} style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: '#FFFFFF', fontWeight: 900, cursor: 'pointer' }}>-</button>
                  <button onClick={() => setNegCount(Math.min(10, negCount + 1))} style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: '#FFFFFF', fontWeight: 900, cursor: 'pointer' }}>+</button>
                </div>
              </div>

              <div style={{ background: '#DCFCE7', padding: 14, borderRadius: 12, border: '1px solid #86EFAC' }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#166534' }}>
                  {L('धनात्मक (+) कार्डहरू:', 'Positive (+) Cards:')} {isNe ? toNp(posCount) : posCount}
                </span>
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  <button onClick={() => setPosCount(Math.max(0, posCount - 1))} style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: '#FFFFFF', fontWeight: 900, cursor: 'pointer' }}>-</button>
                  <button onClick={() => setPosCount(Math.min(10, posCount + 1))} style={{ padding: '4px 10px', borderRadius: 6, border: 'none', background: '#FFFFFF', fontWeight: 900, cursor: 'pointer' }}>+</button>
                </div>
              </div>
            </div>

            {/* Visual Counters Area */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 20 }}>
              {/* Cancelled Pairs */}
              <div style={{ background: '#F8FAFC', padding: 18, borderRadius: 14, border: '2px dashed #94A3B8' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#475569', marginBottom: 10 }}>
                  ⚡ {L(`रद्द भएका जोडीहरू (${toNp(cancelledPairs)} वटा = ०):`, `Cancelled Pairs (${cancelledPairs} pairs = 0):`)}
                </div>
                {cancelledPairs > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {Array.from({ length: cancelledPairs }).map((_, i) => (
                      <div key={i} style={{ display: 'flex', gap: 2, background: '#E2E8F0', padding: 6, borderRadius: 8 }}>
                        <span style={{ padding: '4px 8px', background: '#DC2626', color: '#FFF', borderRadius: 4, fontWeight: 900, fontSize: 11 }}>-</span>
                        <span style={{ padding: '4px 8px', background: '#16A34A', color: '#FFF', borderRadius: 4, fontWeight: 900, fontSize: 11 }}>+</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: 12, color: '#64748B' }}>{L('कुनै जोडी रद्द भएको छैन।', 'No overlapping pairs.')}</span>
                )}
              </div>

              {/* Remaining Unpaired Cards */}
              <div style={{ background: '#F0FDFA', padding: 18, borderRadius: 14, border: '2px solid #99F6E4' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#0F766E', marginBottom: 10 }}>
                  ✨ {L('बाँकी रहेका कार्डहरू (अन्तिम परिणाम):', 'Remaining Cards (Result):')}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {remainingNeg > 0 &&
                    Array.from({ length: remainingNeg }).map((_, i) => (
                      <span key={i} style={{ padding: '8px 12px', background: '#DC2626', color: '#FFF', borderRadius: 8, fontWeight: 900, fontSize: 14 }}>
                        -
                      </span>
                    ))}
                  {remainingPos > 0 &&
                    Array.from({ length: remainingPos }).map((_, i) => (
                      <span key={i} style={{ padding: '8px 12px', background: '#16A34A', color: '#FFF', borderRadius: 8, fontWeight: 900, fontSize: 14 }}>
                        +
                      </span>
                    ))}
                  {remainingNeg === 0 && remainingPos === 0 && (
                    <span style={{ fontSize: 18, fontWeight: 900, color: '#0F766E' }}>० (Zero)</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: NUMBER LINE ADDITION & SUBTRACTION ─────── */}
        {activeTab === 'numberline' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('सङ्ख्या रेखामा चाल देखाएर जोड र घटाउ गर्ने', 'Number Line Movement for Addition and Subtraction')}
            </h3>

            {/* Presets */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              {[
                { start: 2, delta: 4, label: '(+2) + (+4) = +6' },
                { start: 6, delta: -2, label: '(+6) + (-2) = +4' },
                { start: 2, delta: -7, label: '(+2) + (-7) = -5' },
                { start: -3, delta: -5, label: '(-3) + (-5) = -8' },
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    kit.tap();
                    setLineStart(p.start);
                    setLineDelta(p.delta);
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 10,
                    border: lineStart === p.start && lineDelta === p.delta ? '2px solid #0F766E' : '1px solid #CBD5E1',
                    background: lineStart === p.start && lineDelta === p.delta ? '#F0FDFA' : '#FFFFFF',
                    color: lineStart === p.start && lineDelta === p.delta ? '#0F766E' : '#334155',
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Steps Visual explanation */}
            <div style={{ background: '#F0FDFA', border: '2px solid #99F6E4', borderRadius: 14, padding: 18 }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#0F766E', marginBottom: 6 }}>
                १. सुरुवाती बिन्दु: {isNe ? toNp(lineStart) : lineStart}
              </div>
              <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.6 }}>
                २. {lineDelta >= 0 ? `${isNe ? toNp(lineDelta) : lineDelta} एकाइ दायाँ (Right)` : `${isNe ? toNp(Math.abs(lineDelta)) : Math.abs(lineDelta)} एकाइ बायाँ (Left)`} सर्दा पुगिने स्थान: <strong>{isNe ? toNp(lineEnd) : lineEnd}</strong>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: BUS PARK DIRECTION CHALLENGE ───────────── */}
        {activeTab === 'buspark' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <div style={{ background: '#FEF3C7', border: '2px solid #F59E0B', borderRadius: 16, padding: 18, marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#B45309', textTransform: 'uppercase', marginBottom: 4 }}>
                🚌 {L('पाठ्यपुस्तक व्यवहारिक उदाहरण (पृष्ठ ५०)', 'Textbook Practical Example (Page 50)')}
              </div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#92400E', lineHeight: 1.5 }}>
                "{L('एउटा बसपार्कलाई शून्य (०) मान्दा पूर्वतर्फ २० किमी यात्रा गरी फेरि पश्चिमतर्फ १३ किमी फर्किँदा हालको स्थान कति हुन्छ?', 'Taking the bus park as zero (0), a person travels 20 km East and then returns 13 km West. Find the position relative to bus park.')}"
              </h3>
            </div>

            <div style={{ background: '#F8FAFC', padding: 18, borderRadius: 14, border: '1px solid #E2E8F0', marginBottom: 16 }}>
              <div style={{ fontSize: 14, color: '#1E293B', lineHeight: 1.6 }}>
                <div>• {L('पूर्व दिशालाई धनात्मक (+) मान्दा:', 'East as positive (+):')} +{isNe ? toNp(eastKm) : eastKm} {L('किमी', 'km')}</div>
                <div>• {L('पश्चिम दिशालाई ऋणात्मक (-) मान्दा:', 'West as negative (-):')} -{isNe ? toNp(westKm) : westKm} {L('किमी', 'km')}</div>
              </div>
            </div>

            <div style={{ background: '#DCFCE7', border: '2px solid #16A34A', padding: 18, borderRadius: 14 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#166534' }}>
                हालको स्थान = (+२०) + (-१३) = <strong>+७ किमी (बसपार्कबाट पूर्वतर्फ ७ किमी)</strong>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: PROPERTIES OF ADDITION ────────────────── */}
        {activeTab === 'properties' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('पूर्णाङ्कहरूको जोड सम्बन्धी गुणहरू (Properties of Addition)', 'Properties of Integer Addition')}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 14, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#0F766E', marginBottom: 4 }}>
                  १. संवृत गुण (Closure Property)
                </div>
                <div style={{ fontSize: 13, color: '#475569' }}>
                  दुई पूर्णाङ्कहरूको जोड सधैं पूर्णाङ्क नै हुन्छ।<br />
                  ३ + (-५) = -२ ∈ ℤ
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 14, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#0F766E', marginBottom: 4 }}>
                  २. क्रमविनिमेय गुण (Commutative)
                </div>
                <div style={{ fontSize: 13, color: '#475569' }}>
                  a + b = b + a<br />
                  ४ + (-२) = (-२) + ४ = २
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 14, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#0F766E', marginBottom: 4 }}>
                  ३. साहचर्य गुण (Associative)
                </div>
                <div style={{ fontSize: 13, color: '#475569' }}>
                  (a + b) + c = a + (b + c)<br />
                  [२ + (-३)] + ४ = २ + [(-३) + ४] = ३
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 14, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#0F766E', marginBottom: 4 }}>
                  ४. विपरीत/प्रतिलोम (Additive Inverse)
                </div>
                <div style={{ fontSize: 13, color: '#475569' }}>
                  a + (-a) = ०<br />
                  ७ + (-७) = ०
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default IntegerAddSubLab;
