/**
 * DecimalCalculationStudio.tsx
 * Grade 7 Mathematics – Lesson 5: FRACTION AND DECIMAL (भिन्न र दशमलव)
 * Simulation 10: Decimal Calculation and Simplification Studio (2D Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 83-85)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { ArrowRight, RotateCcw, Check, Sparkles, HelpCircle } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'दशमलव गुणन ३.६ × ५.८ को मान कति हुन्छ?',
    en: 'What is the product of 3.6 × 5.8?',
    options: [
      { key: 'A', label: '२०.८८ (दशमलवपछि २ स्थान)' },
      { key: 'B', label: '२०८.८' },
      { key: 'C', label: '२.०८८' },
      { key: 'D', label: '२०८८' },
    ],
    answer: 'A',
  },
  {
    np: '८.९७ + २३.२ जोड्दा दशमलव बिन्दु मिलाएर जोड्दा कति हुन्छ?',
    en: 'What is 8.97 + 23.2 after aligning decimal points?',
    options: [
      { key: 'A', label: '३२.१७' },
      { key: 'B', label: '३१.१७' },
      { key: 'C', label: '११.२९' },
      { key: 'D', label: '२४.०७' },
    ],
    answer: 'A',
  },
  {
    np: '७.५ + {६.७२ ÷ २.८ × (३.५९ - १.४९)} को सरलीकरण गर्दा सुरुमा कुन काम गर्नुपर्छ?',
    en: 'In simplifying 7.5 + {6.72 ÷ 2.8 × (3.59 - 1.49)}, which operation is done first?',
    options: [
      { key: 'A', label: 'सानो कोष्ठक (३.५९ - १.४९ = २.१०)' },
      { key: 'B', label: 'जोड (७.५ + ६.७२)' },
      { key: 'C', label: 'गुणन' },
      { key: 'D', label: 'कुनै पनि होइन' },
    ],
    answer: 'A',
  },
  {
    np: '६.७२ ÷ २.८ भाग गर्दा भाजकलाई पूर्ण सङ्ख्या बनाउन दुवैलाई कतिले गुणन गर्नुपर्छ?',
    en: 'In 6.72 ÷ 2.8, to make the divisor a whole number, both numbers should be multiplied by:',
    options: [
      { key: 'A', label: '१० (६७.२ ÷ २८ = २.४)' },
      { key: 'B', label: '१००' },
      { key: 'C', label: '१' },
      { key: 'D', label: '१०००' },
    ],
    answer: 'A',
  },
];

export const DecimalCalculationStudio: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L5-03',
    titleEn: 'Decimal Calculation & Simplification',
    titleNp: 'दशमलव गणना र सरलीकरण प्रयोगशाला',
    chapter: 5,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'alignment' | 'multiplication' | 'division' | 'simplification'>('alignment');

  // Simplification Stepper State
  const [bodmasStep, setBodmasStep] = useState<number>(1);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'दशमलव जोड र घटाउमा दशमलव बिन्दुहरू ठाडो रूपमा सिधा मिलाउनुपर्छ। सरलीकरणमा सानो ( ), त्यसपछि मझौला { }, अनि ठूलो [ ] कोष्ठकको काम गरिन्छ!',
        'Always align decimal points vertically when adding or subtracting. Follow the bracket order: small ( ), curly { }, and square [ ]!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: '#FFFFFF', padding: 8, borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          {[
            { id: 'alignment', np: '१. दशमलव बिन्दु संरेखण जोडघटाउ', en: '1. Decimal Alignment Add/Sub' },
            { id: 'multiplication', np: '२. दशमलव गुणन (स्थान गणना)', en: '2. Decimal Multiplication' },
            { id: 'division', np: '३. दशमलव भाग (भाजक सार्ने)', en: '3. Decimal Division' },
            { id: 'simplification', np: '४. कोष्ठक सरलीकरण (७.५ + {...})', en: '4. Bracket Simplification' },
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

        {/* ── TAB 1: DECIMAL ALIGNMENT ─────────────────────── */}
        {activeTab === 'alignment' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 11, fontWeight: 800, background: '#CCFBF1', color: '#0F766E', padding: '3px 8px', borderRadius: 6 }}>
              {L('पाठ्यपुस्तक उदाहरण (पृष्ठ ८३)', 'Textbook Example (Page 83)')}
            </span>
            <h3 style={{ margin: '6px 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('दशमलव बिन्दु ठाडो रूपमा मिलाएर जोड गर्ने: ८.९७ + २३.२', 'Vertical Decimal Alignment: 8.97 + 23.2')}
            </h3>

            <div style={{ background: '#F8FAFC', padding: 24, borderRadius: 16, border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'center' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 24, fontWeight: 900, color: '#0F172A', textAlign: 'right', lineHeight: 1.6 }}>
                <div>&nbsp;&nbsp;०८.९७</div>
                <div>+ २३.२०</div>
                <div style={{ width: '100%', height: 3, background: '#0F766E', margin: '4px 0' }} />
                <div style={{ color: '#0F766E' }}>&nbsp;&nbsp;३२.१७</div>
              </div>
            </div>

            <p style={{ textAlign: 'center', fontSize: 13, color: '#64748B', marginTop: 12 }}>
              💡 {L('खाली स्थानमा शून्य (०) थपेर दुवैलाई बराबर दशमलव स्थान (२ स्थान) बनाइएको छ।', 'A trailing zero (0) was added to 23.20 to balance the two decimal places.')}
            </p>
          </div>
        )}

        {/* ── TAB 2: DECIMAL MULTIPLICATION ────────────────── */}
        {activeTab === 'multiplication' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 11, fontWeight: 800, background: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: 6 }}>
              {L('पाठ्यपुस्तक उदाहरण (पृष्ठ ८४)', 'Textbook Example (Page 84)')}
            </span>
            <h3 style={{ margin: '6px 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('३.६ × ५.८ को गुणन (दशमलव स्थान गणना विधि)', 'Decimal Multiplication: 3.6 × 5.8 (Counting Decimal Places)')}
            </h3>

            <div style={{ background: '#F0FDFA', border: '2px solid #99F6E4', borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 15, color: '#134E4A', lineHeight: 2 }}>
                <div>चरण १: दशमलव बिन्दु अस्थायी रूपमा हटाउँदा: ३६ × ५८</div>
                <div>चरण २: सामान्य गुणन गर्दा: ३६ × ५८ = <strong>२०८८</strong></div>
                <div>चरण ३: दशमलव पछिका स्थान गन्दा: ३.६ मा १ स्थान + ५.८ मा १ स्थान = <strong>जम्मा २ स्थान</strong></div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#0F766E', marginTop: 8 }}>
                  ⟹ ३.६ × ५.८ = <strong>२०.८८</strong> (दायाँबाट २ स्थान अगाडि दशमलव राख्दा)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: DECIMAL DIVISION ──────────────────────── */}
        {activeTab === 'division' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 11, fontWeight: 800, background: '#FEF3C7', color: '#B45309', padding: '3px 8px', borderRadius: 6 }}>
              {L('पाठ्यपुस्तक उदाहरण (पृष्ठ ८४)', 'Textbook Example (Page 84)')}
            </span>
            <h3 style={{ margin: '6px 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('६.७२ ÷ २.८ भाग गर्ने विधि (भाजकलाई पूर्ण सङ्ख्या बनाउने)', 'Decimal Division: 6.72 ÷ 2.8 (Making Divisor Whole Number)')}
            </h3>

            <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 16, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 15, color: '#1E293B', lineHeight: 2 }}>
                <div>• भाजक २.८ मा दशमलवपछि १ स्थान छ।</div>
                <div>• भाजक र भाज्य दुवैलाई १० ले गुणन गर्दा: (६.७२ × १०) ÷ (२.८ × १०) = <strong>६७.२ ÷ २८</strong></div>
                <div>• २८ ले ६७.२ लाई भाग गर्दा:</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#0F766E', margin: '8px 0' }}>
                  ६७.२ ÷ २८ = <strong>२.४</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: BRACKET SIMPLIFICATION ────────────────── */}
        {activeTab === 'simplification' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <div style={{ background: '#F0FDFA', border: '2px solid #99F6E4', borderRadius: 16, padding: 18, marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#0F766E', textTransform: 'uppercase', marginBottom: 4 }}>
                📋 {L('पाठ्यपुस्तक मुख्य सरलीकरण उदाहरण (पृष्ठ ८५)', 'Textbook Master Simplification Example (Page 85)')}
              </div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#134E4A' }}>
                ७.५ + {'{'} ६.७२ ÷ २.८ × (३.५९ - १.४९) {'}'}
              </h3>
            </div>

            {/* Stepper Display */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <div style={{ background: bodmasStep >= 1 ? '#DCFCE7' : '#F8FAFC', padding: 14, borderRadius: 12, border: '1px solid #CBD5E1' }}>
                <strong>चरण १ (सानो कोष्ठक):</strong> (३.५९ - १.४९) = <strong>२.१०</strong><br />
                = ७.५ + {'{'} ६.७२ ÷ २.८ × २.१० {'}'}
              </div>

              {bodmasStep >= 2 && (
                <div style={{ background: bodmasStep >= 2 ? '#DCFCE7' : '#F8FAFC', padding: 14, borderRadius: 12, border: '1px solid #CBD5E1' }}>
                  <strong>चरण २ (भाग):</strong> ६.७२ ÷ २.८ = <strong>२.४</strong><br />
                  = ७.५ + {'{'} २.४ × २.१० {'}'}
                </div>
              )}

              {bodmasStep >= 3 && (
                <div style={{ background: bodmasStep >= 3 ? '#DCFCE7' : '#F8FAFC', padding: 14, borderRadius: 12, border: '1px solid #CBD5E1' }}>
                  <strong>चरण ३ (गुणन):</strong> २.४ × २.१० = <strong>५.०४</strong><br />
                  = ७.५ + ५.०४
                </div>
              )}

              {bodmasStep >= 4 && (
                <div style={{ background: '#DCFCE7', border: '2px solid #16A34A', padding: 16, borderRadius: 12 }}>
                  <strong>चरण ४ (जोड - अन्तिम उत्तर):</strong> ७.५० + ५.०४ = <strong style={{ fontSize: 20, color: '#166534' }}>१२.५४</strong>
                </div>
              )}
            </div>

            {/* Stepper Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => {
                  kit.tap();
                  if (bodmasStep < 4) setBodmasStep(bodmasStep + 1);
                  else setBodmasStep(1);
                }}
                style={{
                  padding: '10px 18px',
                  borderRadius: 10,
                  border: 'none',
                  background: '#0F766E',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                {bodmasStep < 4 ? L('अर्को चरण समाधान गर्नुहोस्', 'Solve Next Step') : L('पुनः सुरु गर्नुहोस्', 'Restart')}
              </button>

              <div style={{ fontSize: 13, color: '#64748B' }}>
                {L(`चरण ${toNp(bodmasStep)} / ४`, `Step ${bodmasStep} / 4`)}
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default DecimalCalculationStudio;
