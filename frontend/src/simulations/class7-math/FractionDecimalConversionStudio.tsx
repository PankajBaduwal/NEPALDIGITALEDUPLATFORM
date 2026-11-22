/**
 * FractionDecimalConversionStudio.tsx
 * Grade 7 Mathematics – Lesson 4: RATIONAL NUMBER (परिमेय सङ्ख्या)
 * Simulation 7: Fraction and Decimal Conversion Studio (2D Interactive Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 73-76)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Sparkles, HelpCircle, ArrowRight, RotateCcw } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'सान्त दशमलव (Terminating Decimal) को विशेषता कुन हो?',
    en: 'What is the characteristic of a terminating decimal?',
    options: [
      { key: 'A', label: 'दशमलव पछिका अङ्कहरू सीमित संख्यामा टुङ्गिन्छन् (जस्तै ०.२५)' },
      { key: 'B', label: 'दशमलव पछिका अङ्कहरू अनन्तसम्म दोहोरिन्छन्' },
      { key: 'C', label: 'सधैं शून्य मात्र आउँछ' },
      { key: 'D', label: 'कुनै पनि होइन' },
    ],
    answer: 'A',
  },
  {
    np: '०.३३३... (0.3̄) लाई भिन्नमा रूपान्तरण गर्दा कति हुन्छ?',
    en: 'Converting 0.333... (0.3̄) into a fraction gives what value?',
    options: [
      { key: 'A', label: '१/३ (९x = ३ ⟹ x = ३/९ = १/३)' },
      { key: 'B', label: '३/१०' },
      { key: 'C', label: '१/९' },
      { key: 'D', label: '३/१००' },
    ],
    answer: 'A',
  },
  {
    np: '०.७५ लाई सरल भिन्न (Lowest terms) मा रूपान्तरण गर्दा कति हुन्छ?',
    en: 'What is 0.75 in simplified lowest terms fraction?',
    options: [
      { key: 'A', label: '३/४ (७५/१०० = ३/४)' },
      { key: 'B', label: '७/५' },
      { key: 'C', label: '१/२' },
      { key: 'D', label: '४/३' },
    ],
    answer: 'A',
  },
  {
    np: '१/२ र ५/६ को ठीक बीचको परिमेय सङ्ख्या निकाल्ने सुत्र कुन हो?',
    en: 'Which method finds the rational number exactly midway between 1/2 and 5/6?',
    options: [
      { key: 'A', label: 'औसत विधि: (१/२ + ५/६) ÷ २ = २/३' },
      { key: 'B', label: 'गुणन विधि: १/२ × ५/६' },
      { key: 'C', label: 'घटाउ विधि: ५/६ - १/२' },
      { key: 'D', label: 'कुनै पनि होइन' },
    ],
    answer: 'A',
  },
];

export const FractionDecimalConversionStudio: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L4-03',
    titleEn: 'Fraction & Decimal Conversion Studio',
    titleNp: 'भिन्न र दशमलव रूपान्तरण प्रयोगशाला',
    chapter: 4,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [activeTab, setActiveTab] = useState<'terminating_recurring' | 'dec_to_frac' | 'recurring_frac' | 'between_rationals'>('terminating_recurring');

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'भिन्नलाई दशमलवमा बदल्दा सान्त (Terminating) वा दोहोरिने (Recurring) दशमलव बन्दछ। बीचको परिमेय सङ्ख्या औसत विधिबाट पत्ता लगाइन्छ!',
        'Converting fractions results in terminating or recurring decimals. Midpoint rational numbers are found using the average method!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: '#FFFFFF', padding: 8, borderRadius: 16, border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          {[
            { id: 'terminating_recurring', np: '१. सान्त र दोहोरिने दशमलव', en: '1. Terminating vs Recurring' },
            { id: 'dec_to_frac', np: '२. सान्त दशमलवबाट भिन्न (०.७५ = ३/४)', en: '2. Terminating to Fraction' },
            { id: 'recurring_frac', np: '३. दोहोरिने दशमलवबाट भिन्न (१०x - x)', en: '3. Recurring to Fraction (10x - x)' },
            { id: 'between_rationals', np: '४. दुई परिमेय सङ्ख्याको बीचको सङ्ख्या', en: '4. Between Two Rationals' },
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

        {/* ── TAB 1: TERMINATING VS RECURRING ──────────────── */}
        {activeTab === 'terminating_recurring' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 11, fontWeight: 800, background: '#CCFBF1', color: '#0F766E', padding: '3px 8px', borderRadius: 6 }}>
              {L('पाठ्यपुस्तक वर्गीकरण (पृष्ठ ७३-७४)', 'Textbook Types (Pages 73-74)')}
            </span>
            <h3 style={{ margin: '6px 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('सान्त दशमलव (Terminating) र दोहोरिने दशमलव (Recurring) को तुलना', 'Terminating vs. Non-Terminating Recurring Decimals')}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {/* Terminating */}
              <div style={{ background: '#DCFCE7', border: '2px solid #16A34A', borderRadius: 16, padding: 18 }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#166534', marginBottom: 8 }}>
                  १. सान्त दशमलव (Terminating Decimals)
                </div>
                <div style={{ fontSize: 14, color: '#14532D', lineHeight: 1.8 }}>
                  • १/२ = <strong>०.५</strong> (शेष ० आयो)<br />
                  • १/४ = <strong>०.२५</strong> (शेष ० आयो)<br />
                  • १/८ = <strong>०.१२५</strong> (निश्चित स्थानमा टुङ्गियो)
                </div>
              </div>

              {/* Recurring */}
              <div style={{ background: '#FEF3C7', border: '2px solid #F59E0B', borderRadius: 16, padding: 18 }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#92400E', marginBottom: 8 }}>
                  २. दोहोरिने दशमलव (Non-terminating Recurring)
                </div>
                <div style={{ fontSize: 14, color: '#78350F', lineHeight: 1.8 }}>
                  • १/३ = <strong>०.३३३... (0.3̄)</strong><br />
                  • ४/११ = <strong>०.३६३६... (0.36̄)</strong><br />
                  • २/७ = <strong>०.२८५७१४२८५७१४...</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: TERMINATING TO FRACTION ───────────────── */}
        {activeTab === 'dec_to_frac' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('सान्त दशमलवलाई सरल भिन्नमा रूपान्तरण गर्ने विधि', 'Converting Terminating Decimals to Simplified Fractions')}
            </h3>

            <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 16, border: '1px solid #E2E8F0', marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#0F766E', marginBottom: 8 }}>
                उदाहरण १: ०.७५
              </div>
              <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.8 }}>
                <div>• दशमलवपछि २ स्थान भएकोले हरमा १०० लेख्दा: <strong>७५/१००</strong></div>
                <div>• २५ ले अंश र हर दुवैलाई भाग गर्दा: (७५ ÷ २५) / (१०० ÷ २५) = <strong>३/४</strong></div>
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 16, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#0F766E', marginBottom: 8 }}>
                उदाहरण २: ०.१२५
              </div>
              <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.8 }}>
                <div>• दशमलवपछि ३ स्थान भएकोले हरमा १००० लेख्दा: <strong>१२५/१०००</strong></div>
                <div>• १२५ ले भाग गर्दा: <strong>१/८</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: RECURRING TO FRACTION ─────────────────── */}
        {activeTab === 'recurring_frac' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 11, fontWeight: 800, background: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: 6 }}>
              {L('पाठ्यपुस्तक बीजीय विधि (पृष्ठ ७५)', 'Textbook Algebraic Method (Page 75)')}
            </span>
            <h3 style={{ margin: '6px 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('१०x - x घटाउ विधिद्वारा ०.३३३... लाई भिन्नमा बदल्ने', 'Converting 0.333... into Fraction using 10x - x')}
            </h3>

            <div style={{ background: '#F0FDFA', border: '2px solid #99F6E4', padding: 20, borderRadius: 16 }}>
              <div style={{ fontSize: 14, color: '#134E4A', lineHeight: 2 }}>
                <div>मानौँ, x = ०.३३३... --------- (समीकरण १)</div>
                <div>दुवैतर्फ १० ले गुणन गर्दा: १०x = ३.३३३... --------- (समीकरण २)</div>
                <div>समीकरण (२) बाट (१) घटाउँदा: १०x - x = ३.३३३... - ०.३३३...</div>
                <div>९x = ३</div>
                <div>x = ३/९</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#0F766E', marginTop: 6 }}>
                  x = <strong>१/३</strong> (अन्तिम सरल भिन्न)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: BETWEEN TWO RATIONAL NUMBERS ──────────── */}
        {activeTab === 'between_rationals' && (
          <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 20, border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: 11, fontWeight: 800, background: '#FEF3C7', color: '#B45309', padding: '3px 8px', borderRadius: 6 }}>
              {L('पाठ्यपुस्तक औसत विधि (पृष्ठ ७५-७६)', 'Textbook Average Method (Pages 75-76)')}
            </span>
            <h3 style={{ margin: '6px 0 16px', fontSize: 18, fontWeight: 900, color: '#0F172A' }}>
              {L('१/२ र ५/६ को बीचमा पर्ने दुईवटा परिमेय सङ्ख्याहरू पत्ता लगाउने', 'Finding Two Rational Numbers Between 1/2 and 5/6')}
            </h3>

            <div style={{ background: '#F8FAFC', padding: 20, borderRadius: 16, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 14, color: '#1E293B', lineHeight: 2 }}>
                <div><strong>पहिलो सङ्ख्या (औसत):</strong> (१/२ + ५/६) ÷ २ = (३/६ + ५/६) ÷ २ = (८/६) ÷ २ = ४/६ = <strong>२/३</strong></div>
                <div><strong>दोस्रो सङ्ख्या:</strong> (१/२ र २/३ को औसत) = (१/२ + २/३) ÷ २ = (३/६ + ४/६) ÷ २ = (७/६) ÷ २ = <strong>७/१२</strong></div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#0F766E', marginTop: 10 }}>
                  ✓ १/२ र ५/६ को बीचका दुई परिमेय सङ्ख्याहरू: <strong>७/१२ र २/३</strong> हुन्।
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default FractionDecimalConversionStudio;
