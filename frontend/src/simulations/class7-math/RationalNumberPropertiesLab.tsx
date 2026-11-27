/**
 * RationalNumberPropertiesLab.tsx
 * Grade 7 Mathematics – Lesson 4: RATIONAL NUMBER (परिमेय सङ्ख्या)
 * Simulation 6: Rational Number Properties Lab (2D Interactive Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 70-73)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Check, Sparkles, HelpCircle, ArrowRight, RotateCcw } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'परिमेय सङ्ख्यामा गुणनको तत्समक (Multiplicative Identity) कुन हो?',
    en: 'What is the multiplicative identity for rational numbers?',
    options: [
      { key: 'A', label: '१ (किनभने a × १ = a)' },
      { key: 'B', label: '०' },
      { key: 'C', label: '-१' },
      { key: 'D', label: '२' },
    ],
    answer: 'A',
  },
  {
    np: '२/३ को गुणन प्रतिलोम (Multiplicative Inverse / Reciprocal) कति हुन्छ?',
    en: 'What is the multiplicative inverse (reciprocal) of 2/3?',
    options: [
      { key: 'A', label: '३/२ (किनभने २/३ × ३/२ = १)' },
      { key: 'B', label: '-२/३' },
      { key: 'C', label: '१' },
      { key: 'D', label: '०' },
    ],
    answer: 'A',
  },
  {
    np: 'कुन सङ्ख्याको गुणन प्रतिलोम (Multiplicative Inverse) हुँदैन?',
    en: 'Which number does NOT have a multiplicative inverse?',
    options: [
      { key: 'A', label: 'शून्य (०)' },
      { key: 'B', label: '१' },
      { key: 'C', label: '-१' },
      { key: 'D', label: '२' },
    ],
    answer: 'A',
  },
  {
    np: '(१/२ + १/३) + १/४ = १/२ + (१/३ + १/४) कुन गुण हो?',
    en: '(1/2 + 1/3) + 1/4 = 1/2 + (1/3 + 1/4) demonstrates which property?',
    options: [
      { key: 'A', label: 'साहचर्य गुण (Associative Property)' },
      { key: 'B', label: 'क्रमविनिमेय गुण' },
      { key: 'C', label: 'संवृत गुण' },
      { key: 'D', label: 'तत्समक गुण' },
    ],
    answer: 'A',
  },
];

export const RationalNumberPropertiesLab: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L4-02',
    titleEn: 'Rational Number Properties Lab',
    titleNp: 'परिमेय सङ्ख्याका गुणहरू प्रयोगशाला',
    chapter: 4,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'identity' | 'inverse' | 'commutative' | 'associative' | 'closure'>('identity');

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'परिमेय सङ्ख्याका ५ मुख्य गुणहरू छन्: तत्समक, प्रतिलोम, क्रमविनिमेय, साहचर्य, र संवृत। शून्यको गुणन प्रतिलोम हुँदैन!',
        'Explore 5 key rational properties: Identity, Inverse, Commutative, Associative, and Closure. Note that 0 has no reciprocal!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: '#FFFFFF', padding: 8, borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          {[
            { id: 'identity', np: '१. तत्समक गुण (Identity: 0 & 1)', en: '1. Identity (0 & 1)' },
            { id: 'inverse', np: '२. प्रतिलोम गुण (Inverse: + & ×)', en: '2. Inverses (+ & ×)' },
            { id: 'commutative', np: '३. क्रमविनिमेय गुण (Commutative)', en: '3. Commutative' },
            { id: 'associative', np: '४. साहचर्य गुण (Associative)', en: '4. Associative' },
            { id: 'closure', np: '५. संवृत गुण (Closure)', en: '5. Closure' },
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

        {/* ── TAB 1: IDENTITY PROPERTY ─────────────────────── */}
        {activeTab === 'identity' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 11, fontWeight: 800, background: '#CCFBF1', color: '#0F766E', padding: '3px 8px', borderRadius: 6 }}>
              {L('पाठ्यपुस्तक गुण १ (पृष्ठ ७०)', 'Textbook Property 1 (Page 70)')}
            </span>
            <h3 style={{ margin: '6px 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('तत्समक गुण (जोडको तत्समक ० र गुणनको तत्समक १)', 'Identity Property: 0 for Addition, 1 for Multiplication')}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <div style={{ background: '#F0FDFA', border: '2px solid #99F6E4', borderRadius: 16, padding: 18 }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#0F766E', marginBottom: 6 }}>
                  जोडको तत्समक (Additive Identity: ०)
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#134E4A', margin: '8px 0' }}>
                  ३/४ + ० = ३/४
                </div>
                <p style={{ fontSize: 13, color: '#334155', margin: 0 }}>
                  कुनै पनि परिमेय सङ्ख्यामा शून्य जोड्दा मान परिवर्तन हुँदैन: a + ० = a।
                </p>
              </div>

              <div style={{ background: '#DCFCE7', border: '2px solid #86EFAC', borderRadius: 16, padding: 18 }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#166534', marginBottom: 6 }}>
                  गुणनको तत्समक (Multiplicative Identity: १)
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#14532D', margin: '8px 0' }}>
                  ३/४ × १ = ३/४
                </div>
                <p style={{ fontSize: 13, color: '#334155', margin: 0 }}>
                  कुनै पनि परिमेय सङ्ख्यालाई १ ले गुणन गर्दा मान उही रहन्छ: a × १ = a।
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: INVERSE PROPERTY ──────────────────────── */}
        {activeTab === 'inverse' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 11, fontWeight: 800, background: '#FEF3C7', color: '#B45309', padding: '3px 8px', borderRadius: 6 }}>
              {L('पाठ्यपुस्तक गुण २ (पृष्ठ ७१)', 'Textbook Property 2 (Page 71)')}
            </span>
            <h3 style={{ margin: '6px 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('प्रतिलोम गुण (Additive Inverse & Multiplicative Inverse)', 'Inverse Properties: Additive and Reciprocal')}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 16 }}>
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 16, padding: 18 }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#0F766E', marginBottom: 6 }}>
                  १. जोड प्रतिलोम (Additive Inverse)
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', margin: '8px 0' }}>
                  १/२ + (-१/२) = ०
                </div>
                <div style={{ fontSize: 13, color: '#475569' }}>
                  कुनै सङ्ख्या र त्यसको विपरीत सङ्ख्याको जोड सधैं शून्य हुन्छ: a + (-a) = ०।
                </div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 16, padding: 18 }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#0F766E', marginBottom: 6 }}>
                  २. गुणन प्रतिलोम / व्युत्क्रम (Reciprocal)
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', margin: '8px 0' }}>
                  २/३ × ३/२ = १
                </div>
                <div style={{ fontSize: 13, color: '#475569' }}>
                  अंश र हर उल्टाएर गुणन गर्दा १ आउँछ: (a/b) × (b/a) = १ (जहाँ a, b ≠ ०)।
                </div>
              </div>
            </div>

            {/* Zero has no reciprocal warning banner */}
            <div style={{ background: '#FEE2E2', border: '2px solid #DC2626', borderRadius: 14, padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: '#991B1B', marginBottom: 4 }}>
                ⚠️ महत्त्वपूर्ण अपवाद:
              </div>
              <div style={{ fontSize: 13, color: '#7F1D1D' }}>
                शून्य (०) को कुनै पनि गुणन प्रतिलोम हुँदैन, किनभने १/० अपरिभाषित (Undefined) हुन्छ!
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: COMMUTATIVE PROPERTY ──────────────────── */}
        {activeTab === 'commutative' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('क्रमविनिमेय गुण (Commutative Property: a + b = b + a)', 'Commutative Property: a + b = b + a')}
            </h3>
            <div style={{ background: '#F0FDFA', border: '2px solid #99F6E4', borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#0F766E', marginBottom: 8 }}>
                १/२ + १/३ = ३/६ + २/६ = ५/६<br />
                १/३ + १/२ = २/६ + ३/६ = ५/६
              </div>
              <p style={{ fontSize: 13, color: '#334155', margin: 0 }}>
                क्रम परिवर्तन गरेर जोड्दा वा गुणन गर्दा पनि अन्तिम परिणाम समान आउँछ।
              </p>
            </div>
          </div>
        )}

        {/* ── TAB 4: ASSOCIATIVE PROPERTY ──────────────────── */}
        {activeTab === 'associative' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('साहचर्य गुण (Associative Property: (a+b)+c = a+(b+c))', 'Associative Property: Grouping does not change sum')}
            </h3>
            <div style={{ background: '#DCFCE7', border: '2px solid #16A34A', borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#166534', marginBottom: 8 }}>
                (१/२ + १/३) + १/४ = १/२ + (१/३ + १/४) = १३/१२
              </div>
              <p style={{ fontSize: 13, color: '#14532D', margin: 0 }}>
                कोष्ठक सारेर समूह परिवर्तन गर्दा पनि जोड र गुणनको परिणाम उही रहन्छ।
              </p>
            </div>
          </div>
        )}

        {/* ── TAB 5: CLOSURE PROPERTY ──────────────────────── */}
        {activeTab === 'closure' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('संवृत गुण (Closure Property in Q)', 'Closure Property in Rational Numbers')}
            </h3>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 14, color: '#1E293B', lineHeight: 1.8 }}>
                <div>• दुई परिमेय सङ्ख्याहरूको जोड सधैं परिमेय सङ्ख्या नै हुन्छ: a + b ∈ Q</div>
                <div>• दुई परिमेय सङ्ख्याहरूको घटाउ सधैं परिमेय सङ्ख्या नै हुन्छ: a - b ∈ Q</div>
                <div>• दुई परिमेय सङ्ख्याहरूको गुणन सधैं परिमेय सङ्ख्या नै हुन्छ: a × b ∈ Q</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default RationalNumberPropertiesLab;
