/**
 * NumberClassificationLab.tsx
 * Grade 8 Mathematics – Unit 3: RATIONAL AND IRRATIONAL NUMBERS
 * Simulation 3: Rational and Irrational Number Classification Lab
 * Strictly adheres to CDC Nepal Grade 8 Mathematics Curriculum (2023 edition, Unit 3)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Network, Filter, PieChart, Layers, CheckCircle2, HelpCircle } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'दुई पूर्णाङ्कहरू a र b को अनुपात a/b को रूपमा व्यक्त गर्न सकिने सङ्ख्यालाई के भनिन्छ?',
    en: 'A number that can be expressed in the form a/b where a and b are integers and b ≠ 0 is called:',
    options: [
      { key: 'A', label: 'Rational number' },
      { key: 'B', label: 'Irrational number' },
      { key: 'C', label: 'Imaginary number' },
      { key: 'D', label: 'Undefined number' },
    ],
    answer: 'A',
  },
  {
    np: 'तलका मध्ये कुन सङ्ख्या Irrational number हो?',
    en: 'Which of the following is an irrational number?',
    options: [
      { key: 'A', label: '√2 (Non-terminating non-recurring: 1.4142135...)' },
      { key: 'B', label: '0.25 (Terminating decimal = 1/4)' },
      { key: 'C', label: '0.3333... (Recurring decimal = 1/3)' },
      { key: 'D', label: '-7 (-7/1)' },
    ],
    answer: 'A',
  },
  {
    np: 'समाप्त हुने दशमलव (Terminating) र दोहोरिने दशमलव (Recurring) कुन वर्गका सङ्ख्या हुन्?',
    en: 'Terminating decimals and recurring decimals both belong to which category?',
    options: [
      { key: 'A', label: 'Rational numbers (because they can be written as a fraction a/b)' },
      { key: 'B', label: 'Irrational numbers' },
      { key: 'C', label: 'Natural numbers only' },
      { key: 'D', label: 'Negative integers only' },
    ],
    answer: 'A',
  },
  {
    np: 'सङ्ख्या समूहहरूको सम्बन्ध N ⊆ W ⊆ Z ⊆ Q ⊆ R मा Q ले कुन समूहलाई जनाउँछ?',
    en: 'In the nested number set relation N ⊆ W ⊆ Z ⊆ Q ⊆ R, what does Q represent?',
    options: [
      { key: 'A', label: 'Set of rational numbers' },
      { key: 'B', label: 'Set of integers' },
      { key: 'C', label: 'Natural number' },
      { key: 'D', label: 'Irrational number' },
    ],
    answer: 'A',
  },
  {
    np: 'परिमेय सङ्ख्या (Q) र Irrational number (Q\') दुवै मिलेर कुन सङ्ख्या समूह बन्दछ?',
    en: 'Together, the disjoint sets of Rational (Q) and Irrational (Q\') numbers form:',
    options: [
      { key: 'A', label: 'Set of real numbers (R = Q ∪ Q\')' },
      { key: 'B', label: 'Natural number' },
      { key: 'C', label: 'Whole number' },
      { key: 'D', label: 'Zero only' },
    ],
    answer: 'A',
  },
];

interface NumberCard {
  id: string;
  display: string;
  type: 'rational' | 'irrational';
  category: 'natural' | 'whole' | 'integer' | 'rational' | 'irrational';
  decimalType: 'terminating' | 'recurring' | 'non_recurring';
  explanationNp: string;
  explanationEn: string;
}

const SAMPLE_NUMBERS: NumberCard[] = [
  { id: '1', display: '5/2', type: 'rational', category: 'rational', decimalType: 'terminating', explanationNp: 'दुई पूर्णाङ्क 5 र 2 को अनुपात हो (2.5)', explanationEn: 'Ratio of integers 5 and 2 (terminating 2.5)' },
  { id: '2', display: '-7', type: 'rational', category: 'integer', decimalType: 'terminating', explanationNp: '-7 = -7/1, पूर्णाङ्क भएकाले परिमेय हो', explanationEn: '-7 = -7/1, integer so it is rational' },
  { id: '3', display: '0', type: 'rational', category: 'whole', decimalType: 'terminating', explanationNp: '0 = 0/1', explanationEn: '0 = 0/1 where denominator 1 ≠ 0' },
  { id: '4', display: '0.25', type: 'rational', category: 'rational', decimalType: 'terminating', explanationNp: 'समाप्त हुने दशमलव = 25/100 = 1/4', explanationEn: 'Terminating decimal = 25/100 = 1/4' },
  { id: '5', display: '0.333...', type: 'rational', category: 'rational', decimalType: 'recurring', explanationNp: 'दोहोरिने दशमलव = 1/3', explanationEn: 'Recurring decimal 0.333... = 1/3' },
  { id: '6', display: '0.4141...', type: 'rational', category: 'rational', decimalType: 'recurring', explanationNp: 'दोहोरिने दशमलव = 41/99', explanationEn: 'Recurring decimal 0.4141... = 41/99' },
  { id: '7', display: '√2', type: 'irrational', category: 'irrational', decimalType: 'non_recurring', explanationNp: '1.4142135... समाप्त पनि नहुने र नदोहोरिने', explanationEn: '1.4142135... non-terminating and non-recurring' },
  { id: '8', display: '√3', type: 'irrational', category: 'irrational', decimalType: 'non_recurring', explanationNp: '1.7320508... समाप्त पनि नहुने र नदोहोरिने', explanationEn: '1.7320508... non-terminating and non-recurring' },
  { id: '9', display: '√5', type: 'irrational', category: 'irrational', decimalType: 'non_recurring', explanationNp: '2.2360679... Irrational number', explanationEn: '2.2360679... non-terminating radical' },
  { id: '10', display: 'π', type: 'irrational', category: 'irrational', decimalType: 'non_recurring', explanationNp: '3.14159265... Irrational number', explanationEn: '3.14159265... non-terminating non-recurring' },
];

export const NumberClassificationLab: React.FC<{
  onBack?: () => void;
  onBackToLibrary?: () => void;
}> = ({ onBack, onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U3-01',
    chapter: 3,
    titleNp: 'परिमेय र Irrational number वर्गीकरण (Number Classification)',
    titleEn: 'Rational and Irrational Classification Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'discover' | 'decimals' | 'venn' | 'challenge'>('discover');

  // Selected number for explanation
  const [selectedNum, setSelectedNum] = useState<NumberCard>(SAMPLE_NUMBERS[0]);

  // Tab 2: Decimal classifier
  const [decimalFilter, setDecimalFilter] = useState<'all' | 'terminating' | 'recurring' | 'non_recurring'>('all');

  // Tab 4: Interactive Challenge
  const [challengeIdx, setChallengeIdx] = useState<number>(0);
  const [userChoice, setUserChoice] = useState<'rational' | 'irrational' | null>(null);
  const [challengeFeedback, setChallengeFeedback] = useState<string | null>(null);

  const handleClassify = (choice: 'rational' | 'irrational') => {
    setUserChoice(choice);
    const curr = SAMPLE_NUMBERS[challengeIdx];
    if (choice === curr.type) {
      kit.good();
      setChallengeFeedback(L(`स्याबास! ${curr.display} ${choice === 'rational' ? 'परिमेय' : 'अपरिमेय'} सङ्ख्या हो। कारण: ${curr.explanationNp}`, `Correct! ${curr.display} is ${choice}. Reason: ${curr.explanationEn}`));
    } else {
      kit.oops();
      setChallengeFeedback(L(`मिलेन! ${curr.display} ${curr.type === 'rational' ? 'परिमेय' : 'अपरिमेय'} सङ्ख्या हो। कारण: ${curr.explanationNp}`, `Incorrect! ${curr.display} is ${curr.type}. Reason: ${curr.explanationEn}`));
    }
  };

  const nextChallenge = () => {
    setChallengeIdx((i) => (i + 1) % SAMPLE_NUMBERS.length);
    setUserChoice(null);
    setChallengeFeedback(null);
  };

  const filteredDecimals = decimalFilter === 'all'
    ? SAMPLE_NUMBERS
    : SAMPLE_NUMBERS.filter((n) => n.decimalType === decimalFilter);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! परिमेय (a/b) र अपरिमेय (√2, √3) सङ्ख्याहरू, दशमलवका प्रकारहरू र भेनचित्रको सम्बन्ध सिकौँ!',
        'Hello! Explore rational (a/b) & irrational (√2, √3) numbers, decimal forms, and real number Venn diagrams!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: '#f8fafc', padding: 8, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          {[
            { id: 'discover', labelNp: '1. परिमेय र अपरिमेय परिचय', labelEn: '1. Rational vs Irrational', icon: Network },
            { id: 'decimals', labelNp: '2. दशमलवका तीन प्रकारहरू', labelEn: '2. 3 Decimal Categories', icon: Filter },
            { id: 'venn', labelNp: '3. सङ्ख्या समूहहरूको भेनचित्र (N⊆W⊆Z⊆Q⊆R)', labelEn: '3. Number Sets Venn Diagram', icon: Layers },
            { id: 'challenge', labelNp: '4. वर्गीकरण अभ्यास चुनौती', labelEn: '4. Classification Challenge', icon: CheckCircle2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setChallengeFeedback(null);
                }}
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

        {/* Tab 1: Discover Rational & Irrational */}
        {activeTab === 'discover' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#0369a1', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Network size={20} />
              {L('परिमेय र Irrational numberको गणितीय परिभाषा', 'Mathematical Definitions of Rational and Irrational Numbers')}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              {/* Rational Box */}
              <div style={{ background: '#f0fdf4', padding: 14, borderRadius: 12, border: '1.5px solid #bbf7d0' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#166534' }}>
                  {L('परिमेय सङ्ख्या (Rational Numbers - Q)', 'Rational Numbers (Q)')}
                </div>
                <div style={{ fontSize: 13, color: '#15803d', marginTop: 4, lineHeight: 1.6 }}>
                  {L(
                    'a र b दुई पूर्णाङ्कहरू (Integers) हुन् जहाँ b ≠ 0, यस्ता दुई पूर्णाङ्कको अनुपात a/b को रूपमा लेख्न सकिने सङ्ख्या।',
                    'A number that can be expressed in the form a/b where a, b ∈ Z and b ≠ 0.'
                  )}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#166534', marginTop: 6 }}>
                  {L('उदाहरण: 5/2, -7, 0, 2.13, 0.333..., 0.75', 'Examples: 5/2, -7, 0, 2.13, 0.333..., 0.75')}
                </div>
              </div>

              {/* Irrational Box */}
              <div style={{ background: '#fef2f2', padding: 14, borderRadius: 12, border: '1.5px solid #fecaca' }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#991b1b' }}>
                  {L('Irrational number (Irrational Numbers - Q\')', 'Irrational Numbers (Q\')')}
                </div>
                <div style={{ fontSize: 13, color: '#b91c1c', marginTop: 4, lineHeight: 1.6 }}>
                  {L(
                    'दुई पूर्णाङ्कहरूको अनुपात a/b को रूपमा व्यक्त गर्न नसकिने, समाप्त पनि नहुने र नदोहोरिने दशमलव मान भएका सङ्ख्या।',
                    'Numbers that cannot be written as a/b. Their decimal forms are non-terminating and non-recurring.'
                  )}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#991b1b', marginTop: 6 }}>
                  {L('उदाहरण: √2, √3, √5, π', 'Examples: √2, √3, √5, π')}
                </div>
              </div>
            </div>

            {/* Clickable Number Cards */}
            <div style={{ fontSize: 14, fontWeight: 700, color: '#334155', marginBottom: 8 }}>
              {L('सङ्ख्या कार्ड छानेर विश्लेषण हेर्नुहोस्:', 'Select a number card to inspect its classification:')}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {SAMPLE_NUMBERS.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setSelectedNum(n)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    fontWeight: 800,
                    fontSize: 15,
                    cursor: 'pointer',
                    border: selectedNum.id === n.id ? '2px solid #0284c7' : '1px solid #cbd5e1',
                    background: n.type === 'rational' ? '#f0fdf4' : '#fef2f2',
                    color: n.type === 'rational' ? '#166534' : '#991b1b',
                  }}
                >
                  {n.display}
                </button>
              ))}
            </div>

            {/* Selected Card Explanation */}
            <div style={{ background: '#f8fafc', padding: 14, borderRadius: 12, border: '1px solid #cbd5e1' }}>
              <div style={{ fontSize: 13, color: '#64748b' }}>{L('छानिएको सङ्ख्या:', 'Selected Number:')}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: selectedNum.type === 'rational' ? '#166534' : '#991b1b', marginTop: 2 }}>
                {selectedNum.display} ({selectedNum.type === 'rational' ? L('परिमेय सङ्ख्या', 'Rational') : L('Irrational number', 'Irrational')})
              </div>
              <div style={{ fontSize: 14, color: '#334155', marginTop: 6 }}>
                <strong>{L('कारण:', 'Reason:')}</strong> {isNe ? selectedNum.explanationNp : selectedNum.explanationEn}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Three Decimal Types */}
        {activeTab === 'decimals' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0369a1', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Filter size={20} />
              {L('दशमलवका तीन प्रकार र परिमेय/अपरिमेय सम्बन्ध', 'Three Decimal Forms & Rational/Irrational Relation')}
            </h3>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {[
                { id: 'all', labelNp: 'सबै (All)', labelEn: 'All' },
                { id: 'terminating', labelNp: '1. समाप्त हुने (Terminating - Rational)', labelEn: 'Terminating' },
                { id: 'recurring', labelNp: '2. दोहोरिने (Recurring - Rational)', labelEn: 'Recurring' },
                { id: 'non_recurring', labelNp: '3. समाप्त नहुने र नदोहोरिने (Irrational)', labelEn: 'Non-recurring' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setDecimalFilter(f.id as any)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                    border: decimalFilter === f.id ? '2px solid #0284c7' : '1px solid #cbd5e1',
                    background: decimalFilter === f.id ? '#e0f2fe' : '#ffffff',
                    color: decimalFilter === f.id ? '#0369a1' : '#334155',
                  }}
                >
                  {isNe ? f.labelNp : f.labelEn}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              {filteredDecimals.map((n) => (
                <div
                  key={n.id}
                  style={{
                    background: n.type === 'rational' ? '#f0fdf4' : '#fef2f2',
                    border: `1.5px solid ${n.type === 'rational' ? '#bbf7d0' : '#fecaca'}`,
                    padding: 12,
                    borderRadius: 10,
                  }}
                >
                  <div style={{ fontSize: 18, fontWeight: 900, color: n.type === 'rational' ? '#166534' : '#991b1b' }}>
                    {n.display}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginTop: 4 }}>
                    {n.decimalType === 'terminating' && L('समाप्त हुने दशमलव', 'Terminating Decimal')}
                    {n.decimalType === 'recurring' && L('दोहोरिने दशमलव', 'Recurring Decimal')}
                    {n.decimalType === 'non_recurring' && L('समाप्त नहुने र नदोहोरिने', 'Non-terminating & Non-recurring')}
                  </div>
                  <div style={{ fontSize: 12, color: '#334155', marginTop: 4 }}>
                    {isNe ? n.explanationNp : n.explanationEn}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Venn Diagram */}
        {activeTab === 'venn' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0369a1', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers size={20} />
              {L('सङ्ख्या समूहहरूको सम्बन्ध र भेनचित्र (N ⊆ W ⊆ Z ⊆ Q ⊆ R)', 'Set Relations & Venn Diagram (N ⊆ W ⊆ Z ⊆ Q ⊆ R)')}
            </h3>
            <p style={{ margin: '0 0 14px 0', fontSize: 13, color: '#475569' }}>
              {L(
                'वास्तविक सङ्ख्या (R) भित्र परिमेय (Q) र अपरिमेय (Q\') दुईpcs विलगित (Disjoint) समूहहरू हुन्छन्। परिमेयभित्र क्रमशः Z, W र N समेटिएका हुन्छन्।',
                'Real numbers (R) are partitioned into Rational (Q) and Irrational (Q\'). Inside Q lie Z, W, and N nested.'
              )}
            </p>

            {/* Visual Nested Boxes representing Venn Diagram */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
              {/* Rational Hierarchy Box */}
              <div style={{ background: '#f0fdf4', border: '2.5px solid #16a34a', borderRadius: 16, padding: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#166534', marginBottom: 8 }}>
                  Q: Rational numbers
                </div>
                {/* Z Box */}
                <div style={{ background: '#dcfce7', border: '2px solid #22c55e', borderRadius: 12, padding: 12, marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#15803d' }}>
                    Z: Integers (...-2, -1, 0, 1, 2...)
                  </div>
                  {/* W Box */}
                  <div style={{ background: '#bbf7d0', border: '2px solid #16a34a', borderRadius: 10, padding: 10, marginTop: 6 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#14532d' }}>
                      W: Whole numbers (0, 1, 2, 3...)
                    </div>
                    {/* N Box */}
                    <div style={{ background: '#86efac', border: '2px solid #15803d', borderRadius: 8, padding: 8, marginTop: 6 }}>
                      <div style={{ fontSize: 12, fontWeight: 900, color: '#052e16' }}>
                        N: Natural numbers (1, 2, 3, 4...)
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#166534', fontWeight: 700 }}>
                  Fractions: 5/2, -3/4, 2.5, 0.333...
                </div>
              </div>

              {/* Irrational Disjoint Box */}
              <div style={{ background: '#fef2f2', border: '2.5px solid #ef4444', borderRadius: 16, padding: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#991b1b', marginBottom: 8 }}>
                  Q': Irrational numbers
                </div>
                <div style={{ fontSize: 13, color: '#b91c1c', lineHeight: 1.6 }}>
                  • √2 ≈ 1.4142...<br />
                  • √3 ≈ 1.7320...<br />
                  • √5 ≈ 2.2360...<br />
                  • π ≈ 3.1415...
                </div>
                <div style={{ marginTop: 12, padding: 8, background: '#ffffff', borderRadius: 8, border: '1px solid #fca5a5', fontSize: 11, color: '#7f1d1d' }}>
                  {L('Q ∩ Q\' = ∅ (आपसमा कुनै साझा सदस्य हुँदैनन्)', 'Q ∩ Q\' = ∅ (Disjoint sets)')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Challenge */}
        {activeTab === 'challenge' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0369a1', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 size={20} />
              {L('सङ्ख्या वर्गीकरण तालिम तथा चुनौती', 'Classification Quiz Challenge')}
            </h3>

            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #cbd5e1', marginBottom: 14 }}>
              <div style={{ fontSize: 14, color: '#64748b' }}>
                {L(`प्रश्न ${toNp(challengeIdx + 1)} / ${toNp(SAMPLE_NUMBERS.length)}:`, `Problem ${challengeIdx + 1} of ${SAMPLE_NUMBERS.length}:`)}
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', margin: '8px 0' }}>
                {L(`सङ्ख्या "${SAMPLE_NUMBERS[challengeIdx].display}" के हो?`, `Is "${SAMPLE_NUMBERS[challengeIdx].display}" Rational or Irrational?`)}
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button
                  onClick={() => handleClassify('rational')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 8,
                    background: '#16a34a',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: 14,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {L('परिमेय सङ्ख्या (Rational)', 'Rational')}
                </button>
                <button
                  onClick={() => handleClassify('irrational')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 8,
                    background: '#dc2626',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: 14,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {L('Irrational number (Irrational)', 'Irrational')}
                </button>
              </div>

              {challengeFeedback && (
                <div style={{ marginTop: 14, padding: 12, borderRadius: 8, background: challengeFeedback.includes('स्याबास') || challengeFeedback.includes('Correct') ? '#dcfce7' : '#fee2e2', color: challengeFeedback.includes('स्याबास') || challengeFeedback.includes('Correct') ? '#166534' : '#991b1b', fontWeight: 700, fontSize: 13 }}>
                  {challengeFeedback}
                </div>
              )}

              {userChoice !== null && (
                <button
                  onClick={nextChallenge}
                  style={{
                    marginTop: 12,
                    padding: '8px 16px',
                    borderRadius: 8,
                    background: '#0284c7',
                    color: '#ffffff',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {L('अर्को सङ्ख्या →', 'Next Number →')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default NumberClassificationLab;
