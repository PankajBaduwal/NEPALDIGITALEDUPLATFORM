/**
 * DecimalCalculationStudio.tsx
 * Grade 7 Mathematics – Lesson 5: FRACTION AND DECIMAL
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
    np: 'दशमलव Multiplication 3.6 × 5.8 को मान कति हुन्छ?',
    en: 'What is the product of 3.6 × 5.8?',
    options: [
      { key: 'A', label: '20.88' },
      { key: 'B', label: '208.8' },
      { key: 'C', label: '2.088' },
      { key: 'D', label: '2088' },
    ],
    answer: 'A',
  },
  {
    np: '8.97 + 23.2 जोड्दा दशमलव बिन्दु मिलाएर जोड्दा कति हुन्छ?',
    en: 'What is 8.97 + 23.2 after aligning decimal points?',
    options: [
      { key: 'A', label: '32.17' },
      { key: 'B', label: '31.17' },
      { key: 'C', label: '11.29' },
      { key: 'D', label: '24.07' },
    ],
    answer: 'A',
  },
  {
    np: '7.5 + {6.72 ÷ 2.8 × (3.59 - 1.49)} को सरलीकरण गर्दा सुरुमा कुन काम गर्नुपर्छ?',
    en: 'In simplifying 7.5 + {6.72 ÷ 2.8 × (3.59 - 1.49)}, which operation is done first?',
    options: [
      { key: 'A', label: 'Smaller bracket (3.59 - 1.49 = 2.10)' },
      { key: 'B', label: 'Addition (7.5 + 6.72)' },
      { key: 'C', label: 'Multiplication' },
      { key: 'D', label: 'None of these' },
    ],
    answer: 'A',
  },
  {
    np: '6.72 ÷ 2.8 भाग गर्दा भाजकलाई पूर्ण सङ्ख्या बनाउन दुवैलाई कतिले Multiplication गर्नुपर्छ?',
    en: 'In 6.72 ÷ 2.8, to make the divisor a whole number, both numbers should be multiplied by:',
    options: [
      { key: 'A', label: '10 (67.2 ÷ 28 = 2.4)' },
      { key: 'B', label: '100' },
      { key: 'C', label: '1' },
      { key: 'D', label: '1000' },
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
            { id: 'alignment', np: '1. दशमलव बिन्दु संरेखण जोडघटाउ', en: '1. Decimal Alignment Add/Sub' },
            { id: 'multiplication', np: '2. दशमलव Multiplication', en: '2. Decimal Multiplication' },
            { id: 'division', np: '3. दशमलव भाग (भाजक सार्ने)', en: '3. Decimal Division' },
            { id: 'simplification', np: '4. कोष्ठक सरलीकरण (7.5 + {...})', en: '4. Bracket Simplification' },
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
              {L('पाठ्यपुस्तक उदाहरण (पृष्ठ 83)', 'Textbook Example (Page 83)')}
            </span>
            <h3 style={{ margin: '6px 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('दशमलव बिन्दु ठाडो रूपमा मिलाएर जोड गर्ने: 8.97 + 23.2', 'Vertical Decimal Alignment: 8.97 + 23.2')}
            </h3>

            <div style={{ background: '#F8FAFC', padding: 24, borderRadius: 16, border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'center' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 24, fontWeight: 900, color: '#0F172A', textAlign: 'right', lineHeight: 1.6 }}>
                <div>&nbsp;&nbsp;08.97</div>
                <div>+ 23.20</div>
                <div style={{ width: '100%', height: 3, background: '#0F766E', margin: '4px 0' }} />
                <div style={{ color: '#0F766E' }}>&nbsp;&nbsp;32.17</div>
              </div>
            </div>

            <p style={{ textAlign: 'center', fontSize: 13, color: '#64748B', marginTop: 12 }}>
              💡 {L('खाली स्थानमा शून्य (0) थपेर दुवैलाई बराबर दशमलव स्थान (2 स्थान) बनाइएको छ।', 'A trailing zero (0) was added to 23.20 to balance the two decimal places.')}
            </p>
          </div>
        )}

        {/* ── TAB 2: DECIMAL MULTIPLICATION ────────────────── */}
        {activeTab === 'multiplication' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 11, fontWeight: 800, background: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: 6 }}>
              {L('पाठ्यपुस्तक उदाहरण (पृष्ठ 84)', 'Textbook Example (Page 84)')}
            </span>
            <h3 style={{ margin: '6px 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('3.6 × 5.8 को Multiplication', 'Decimal Multiplication: 3.6 × 5.8 (Counting Decimal Places)')}
            </h3>

            <div style={{ background: '#F0FDFA', border: '2px solid #99F6E4', borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 15, color: '#134E4A', lineHeight: 2 }}>
                <div>Step 1: Remove the decimal point temporarily: 36 × 58</div>
                <div>Step 2: Multiply normally: 36 × 58 = <strong>2088</strong></div>
                <div>Step 3: Count the decimal places: 3.6 has 1 place + 5.8 has 1 place = <strong>Total 2 places</strong></div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#0F766E', marginTop: 8 }}>
                  ⟹ 3.6 × 5.8 = <strong>20.88</strong> (place the decimal point 2 places from the right)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: DECIMAL DIVISION ──────────────────────── */}
        {activeTab === 'division' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 11, fontWeight: 800, background: '#FEF3C7', color: '#B45309', padding: '3px 8px', borderRadius: 6 }}>
              {L('पाठ्यपुस्तक उदाहरण (पृष्ठ 84)', 'Textbook Example (Page 84)')}
            </span>
            <h3 style={{ margin: '6px 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('6.72 ÷ 2.8 भाग गर्ने विधि (भाजकलाई पूर्ण सङ्ख्या बनाउने)', 'Decimal Division: 6.72 ÷ 2.8 (Making Divisor Whole Number)')}
            </h3>

            <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 16, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 15, color: '#1E293B', lineHeight: 2 }}>
                <div>• The divisor 2.8 has 1 place after the decimal point.</div>
                <div>• Multiply both divisor and dividend by 10: (6.72 × 10) ÷ (2.8 × 10) = <strong>67.2 ÷ 28</strong></div>
                <div>• Dividing 67.2 by 28:</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#0F766E', margin: '8px 0' }}>
                  67.2 ÷ 28 = <strong>2.4</strong>
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
                📋 {L('पाठ्यपुस्तक मुख्य सरलीकरण उदाहरण (पृष्ठ 85)', 'Textbook Master Simplification Example (Page 85)')}
              </div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#134E4A' }}>
                7.5 + {'{'} 6.72 ÷ 2.8 × (3.59 - 1.49) {'}'}
              </h3>
            </div>

            {/* Stepper Display */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <div style={{ background: bodmasStep >= 1 ? '#DCFCE7' : '#F8FAFC', padding: 14, borderRadius: 12, border: '1px solid #CBD5E1' }}>
                <strong>Step 1:</strong> (3.59 - 1.49) = <strong>2.10</strong><br />
                = 7.5 + {'{'} 6.72 ÷ 2.8 × 2.10 {'}'}
              </div>

              {bodmasStep >= 2 && (
                <div style={{ background: bodmasStep >= 2 ? '#DCFCE7' : '#F8FAFC', padding: 14, borderRadius: 12, border: '1px solid #CBD5E1' }}>
                  <strong>चरण 2:</strong> 6.72 ÷ 2.8 = <strong>2.4</strong><br />
                  = 7.5 + {'{'} 2.4 × 2.10 {'}'}
                </div>
              )}

              {bodmasStep >= 3 && (
                <div style={{ background: bodmasStep >= 3 ? '#DCFCE7' : '#F8FAFC', padding: 14, borderRadius: 12, border: '1px solid #CBD5E1' }}>
                  <strong>चरण 3:</strong> 2.4 × 2.10 = <strong>5.04</strong><br />
                  = 7.5 + 5.04
                </div>
              )}

              {bodmasStep >= 4 && (
                <div style={{ background: '#DCFCE7', border: '2px solid #16A34A', padding: 16, borderRadius: 12 }}>
                  <strong>चरण 4:</strong> 7.50 + 5.04 = <strong style={{ fontSize: 20, color: '#166534' }}>12.54</strong>
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
                {bodmasStep < 4 ? L('अर्को चरण समाधान गर्नुहोस्', 'Solve Next Step') : L('पुनः सुRs गर्नुहोस्', 'Restart')}
              </button>

              <div style={{ fontSize: 13, color: '#64748B' }}>
                {L(`चरण ${toNp(bodmasStep)} / 4`, `Step ${bodmasStep} / 4`)}
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default DecimalCalculationStudio;
