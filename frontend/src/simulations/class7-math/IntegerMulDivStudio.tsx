/**
 * IntegerMulDivStudio.tsx
 * Grade 7 Mathematics – Lesson 3: INTEGER
 * Simulation 3: Integer Multiplication and Division Studio (2D Interactive Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 58-63)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Sparkles, HelpCircle, ArrowRight, RotateCcw } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'दुईpcs Negative integerहरूको गुणनफल (Negative × Negative) कस्तो हुन्छ?',
    en: 'What is the product of two negative integers (Negative × Negative)?',
    options: [
      { key: 'A', label: 'Positive integer' },
      { key: 'B', label: 'Negative integer' },
      { key: 'C', label: 'Zero only' },
      { key: 'D', label: 'None of these' },
    ],
    answer: 'A',
  },
  {
    np: '(-4) × (+6) को मान कति हुन्छ?',
    en: 'What is the value of (-4) × (+6)?',
    options: [
      { key: 'A', label: '-24' },
      { key: 'B', label: '+24' },
      { key: 'C', label: '-10' },
      { key: 'D', label: '+2' },
    ],
    answer: 'A',
  },
  {
    np: '(-36) ÷ (-9) को मान कति हुन्छ?',
    en: 'What is the value of (-36) ÷ (-9)?',
    options: [
      { key: 'A', label: '-4' },
      { key: 'B', label: '+4' },
      { key: 'C', label: '-27' },
      { key: 'D', label: '+45' },
    ],
    answer: 'B',
  },
  {
    np: 'a × (b + c) = a × b + a × c कुन नियम हो?',
    en: 'a × (b + c) = a × b + a × c represents which property?',
    options: [
      { key: 'A', label: 'Distributive property' },
      { key: 'B', label: 'Commutative property' },
      { key: 'C', label: 'Associative property' },
      { key: 'D', label: 'Closure property' },
    ],
    answer: 'A',
  },
];

export const IntegerMulDivStudio: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L3-03',
    titleEn: 'Integer Multiplication & Division Studio',
    titleNp: 'पूर्णाङ्कको गुणन र भाग प्रयोगशाला',
    chapter: 3,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'sign_rules' | 'numberline' | 'properties' | 'fact_families'>('sign_rules');

  // Interactive Multiplication Testing
  const [valA, setValA] = useState<number>(-4);
  const [valB, setValB] = useState<number>(3);
  const mulProduct = valA * valB;

  // Fact Families State
  const [ffA, setFfA] = useState<number>(-8);
  const [ffB, setFfB] = useState<number>(-4);
  const ffProd = ffA * ffB; // 32

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'चिन्हका नियमहरू: समान चिन्ह गुणन गर्दा धनात्मक (+) र फरक चिन्ह गुणन गर्दा ऋणात्मक (-) हुन्छ। भागमा पनि यही नियम लागु हुन्छ!',
        'Sign rules: same signs multiply/divide to positive (+), different signs to negative (-). Explore interactive tables!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: '#FFFFFF', padding: 8, borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          {[
            { id: 'sign_rules', np: '1. चिन्हको नियम तालिका', en: '1. Sign Rules Discovery' },
            { id: 'numberline', np: '2. सङ्ख्यारेखामा गुणन', en: '2. Multiplication on Line' },
            { id: 'properties', np: '3. गुणनका गुणहरू (वितरण नियम)', en: '3. Multiplication Properties' },
            { id: 'fact_families', np: '4. गुणन र भाग सम्बन्ध (Fact Families)', en: '4. Division Fact Families' },
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

        {/* ── TAB 1: SIGN RULES DISCOVERY ──────────────────── */}
        {activeTab === 'sign_rules' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 11, fontWeight: 800, background: '#CCFBF1', color: '#0F766E', padding: '3px 8px', borderRadius: 6 }}>
              {L('पाठ्यपुस्तक नियम (पृष्ठ 58)', 'Textbook Sign Rules (Page 58)')}
            </span>
            <h3 style={{ margin: '6px 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('पूर्णाङ्क गुणनमा चिन्हको नियम (Signs Rule in Multiplication)', 'Sign Rules in Integer Multiplication')}
            </h3>

            {/* 4 Core Rule Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 20 }}>
              <div style={{ background: '#DCFCE7', border: '2px solid #16A34A', borderRadius: 14, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#166534', marginBottom: 4 }}>
                  (+) × (+) = (+)
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#14532D' }}>
                  (+3) × (+4) = +12
                </div>
                <div style={{ fontSize: 11, color: '#15803D', marginTop: 4 }}>Same signs ⟹ positive</div>
              </div>

              <div style={{ background: '#DCFCE7', border: '2px solid #16A34A', borderRadius: 14, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#166534', marginBottom: 4 }}>
                  (-) × (-) = (+)
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#14532D' }}>
                  (-3) × (-4) = +12
                </div>
                <div style={{ fontSize: 11, color: '#15803D', marginTop: 4 }}>Same signs ⟹ positive</div>
              </div>

              <div style={{ background: '#FEE2E2', border: '2px solid #DC2626', borderRadius: 14, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#991B1B', marginBottom: 4 }}>
                  (+) × (-) = (-)
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#7F1D1D' }}>
                  (+3) × (-4) = -12
                </div>
                <div style={{ fontSize: 11, color: '#B91C1C', marginTop: 4 }}>Different signs ⟹ negative</div>
              </div>

              <div style={{ background: '#FEE2E2', border: '2px solid #DC2626', borderRadius: 14, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#991B1B', marginBottom: 4 }}>
                  (-) × (+) = (-)
                </div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#7F1D1D' }}>
                  (-3) × (+4) = -12
                </div>
                <div style={{ fontSize: 11, color: '#B91C1C', marginTop: 4 }}>Different signs ⟹ negative</div>
              </div>
            </div>

            {/* Interactive Multiplier */}
            <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 16, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {[-5, -4, -3, 2, 3, 5].map((a) => (
                  <button
                    key={a}
                    onClick={() => {
                      kit.tap();
                      setValA(a);
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: valA === a ? '2px solid #0F766E' : '1px solid #CBD5E1',
                      background: valA === a ? '#F0FDFA' : '#FFFFFF',
                      color: valA === a ? '#0F766E' : '#334155',
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    {a > 0 ? `+${isNe ? toNp(a) : a}` : isNe ? toNp(a) : a}
                  </button>
                ))}
              </div>

              <span style={{ fontSize: 20, fontWeight: 900 }}>×</span>

              <div style={{ display: 'flex', gap: 6 }}>
                {[-4, -2, 2, 3, 4].map((b) => (
                  <button
                    key={b}
                    onClick={() => {
                      kit.tap();
                      setValB(b);
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: valB === b ? '2px solid #0F766E' : '1px solid #CBD5E1',
                      background: valB === b ? '#F0FDFA' : '#FFFFFF',
                      color: valB === b ? '#0F766E' : '#334155',
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    {b > 0 ? `+${isNe ? toNp(b) : b}` : isNe ? toNp(b) : b}
                  </button>
                ))}
              </div>

              <span style={{ fontSize: 20, fontWeight: 900 }}>=</span>

              <span
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: mulProduct > 0 ? '#166534' : mulProduct < 0 ? '#DC2626' : '#0F766E',
                  background: mulProduct > 0 ? '#DCFCE7' : '#FEE2E2',
                  padding: '6px 16px',
                  borderRadius: 10,
                }}
              >
                {mulProduct > 0 ? `+${isNe ? toNp(mulProduct) : mulProduct}` : isNe ? toNp(mulProduct) : mulProduct}
              </span>
            </div>
          </div>
        )}

        {/* ── TAB 2: MULTIPLICATION ON NUMBER LINE ─────────── */}
        {activeTab === 'numberline' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('सङ्ख्या रेखामा दोहोरिएको चालबाट गुणन', 'Multiplication as Repeated Movement on Number Line')}
            </h3>
            <p style={{ fontSize: 13, color: '#475569', margin: '0 0 16px', lineHeight: 1.6 }}>
              {L(
                '(-2) × 3 को अर्थ: शून्यबाट बायाँतर्फ 2-2 एकाइका 3 pcs फड्को मार्ने ⟹ -6 मा पुगिन्छ।',
                '(-2) × 3 means: starting from zero, taking 3 jumps of 2 units to the left ⟹ reaches -6.'
              )}
            </p>

            <div style={{ background: '#F0FDFA', border: '2px solid #99F6E4', borderRadius: 14, padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#0F766E', marginBottom: 6 }}>
                (-2) × 3 = (-2) + (-2) + (-2) = -6
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0D9488' }}>
                {L('3 पटक बायाँतर्फ 2 एकाइ चाल', '3 jumps of 2 units to the left')}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: MULTIPLICATION PROPERTIES ─────────────── */}
        {activeTab === 'properties' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('पूर्णाङ्कको गुणन सम्बन्धी नियमहरू', 'Properties of Integer Multiplication')}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 14, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#0F766E', marginBottom: 4 }}>
                  1. Distributive property
                </div>
                <div style={{ fontSize: 13, color: '#334155' }}>
                  a × (b + c) = (a × b) + (a × c)<br />
                  2 × (3 + 4) = 2 × 7 = 14<br />
                  (2 × 3) + (2 × 4) = 6 + 8 = 14
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 14, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#0F766E', marginBottom: 4 }}>
                  2. Identity of multiplication (1)
                </div>
                <div style={{ fontSize: 13, color: '#334155' }}>
                  a × 1 = a<br />
                  (-8) × 1 = -8
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 14, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#0F766E', marginBottom: 4 }}>
                  3. Multiplication by 0
                </div>
                <div style={{ fontSize: 13, color: '#334155' }}>
                  a × 0 = 0<br />
                  (-15) × 0 = 0
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: 16, borderRadius: 14, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#0F766E', marginBottom: 4 }}>
                  4. Associative property
                </div>
                <div style={{ fontSize: 13, color: '#334155' }}>
                  (a × b) × c = a × (b × c)<br />
                  [2 × (-3)] × 4 = 2 × [(-3) × 4] = -24
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: DIVISION FACT FAMILIES ────────────────── */}
        {activeTab === 'fact_families' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 11, fontWeight: 800, background: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: 6 }}>
              {L('पाठ्यपुस्तक सम्बन्ध (पृष्ठ 62)', 'Textbook Fact Families (Page 62)')}
            </span>
            <h3 style={{ margin: '6px 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('गुणन र भागको प्रत्यक्ष सम्बन्ध (Fact Families)', 'Multiplication and Division Fact Families')}
            </h3>

            <div style={{ background: '#F0FDFA', border: '2px solid #99F6E4', padding: 20, borderRadius: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#0F766E', marginBottom: 8 }}>
                Multiplication fact: (-8) × (-4) = +32
              </div>
              <div style={{ fontSize: 15, color: '#1E293B', lineHeight: 1.8 }}>
                <div>• Division fact 1: 32 ÷ (-8) = <strong>-4</strong> (positive ÷ negative = negative)</div>
                <div>• Division fact 2: 32 ÷ (-4) = <strong>-8</strong> (positive ÷ negative = negative)</div>
              </div>
            </div>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: 18, borderRadius: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#334155' }}>
                💡 Sign rules for division:
              </div>
              <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>
                • (+36) ÷ (+9) = +4<br />
                • (-36) ÷ (-9) = +4<br />
                • (-36) ÷ (+9) = -4<br />
                • (+36) ÷ (-9) = -4
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default IntegerMulDivStudio;
