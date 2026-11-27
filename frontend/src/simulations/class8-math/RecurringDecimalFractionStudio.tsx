/**
 * RecurringDecimalFractionStudio.tsx
 * Grade 8 Mathematics – Unit 3: RATIONAL AND IRRATIONAL NUMBERS
 * Simulation 5: Recurring Decimal to Fraction Conversion Studio
 * Strictly adheres to CDC Nepal Grade 8 Mathematics Curriculum (2023 edition, Unit 3)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Calculator, ArrowRight, Check, Award, RotateCcw, Layers } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'दोहोरिने दशमलव 0.3333... (0.3̄) लाई भिन्न (Fraction a/b) मा रूपान्तरण गर्दा कति हुन्छ?',
    en: 'Converting recurring decimal 0.3333... (0.3̄) into a fraction yields:',
    options: [
      { key: 'A', label: '1/3 [ 9x = 3 ⇒ x = 3/9 = 1/3 ]' },
      { key: 'B', label: '3/10' },
      { key: 'C', label: '3/100' },
      { key: 'D', label: '1/9' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि दशमलवमा दुईpcs अङ्कहरू दोहोरिएका छन् (जस्तै 0.414141...) भने समीकरणलाई कतिले गुणन गर्नुपर्छ?',
    en: 'If two digits repeat in a recurring decimal (like 0.4141...), which multiplier is used?',
    options: [
      { key: 'A', label: 'By 100 (10² = 100, because two digits repeat)' },
      { key: 'B', label: 'By 10' },
      { key: 'C', label: 'By 1000' },
      { key: 'D', label: 'By 5' },
    ],
    answer: 'A',
  },
  {
    np: 'दोहोरिने दशमलव 0.414141... (0.41̄) को भिन्न रूप कुन हो?',
    en: 'What is the fractional form of recurring decimal 0.414141... (0.41̄)?',
    options: [
      { key: 'A', label: '41/99 (41/99)' },
      { key: 'B', label: '41/100' },
      { key: 'C', label: '41/90' },
      { key: 'D', label: '14/99' },
    ],
    answer: 'A',
  },
  {
    np: 'दोहोरिने दशमलव 0.6666... (0.6̄) लाई सरल भिन्नमा रूपान्तरण गर्दा कति आउँछ?',
    en: 'Converting 0.6666... (0.6̄) into lowest terms gives:',
    options: [
      { key: 'A', label: '2/3 [ 9x = 6 ⇒ x = 6/9 = 2/3 ]' },
      { key: 'B', label: '6/10' },
      { key: 'C', label: '3/5' },
      { key: 'D', label: '1/6' },
    ],
    answer: 'A',
  },
  {
    np: 'के प्रत्येक दोहोरिने दशमलव (Recurring Decimal) एक परिमेय सङ्ख्या (Rational Number) हो?',
    en: 'Is every recurring decimal a rational number?',
    options: [
      { key: 'A', label: 'Yes, because it can always be converted to a fraction a/b' },
      { key: 'B', label: 'No, it is irrational' },
      { key: 'C', label: 'Zero only' },
      { key: 'D', label: 'Integers only' },
    ],
    answer: 'A',
  },
];

const PRESETS = [
  { label: '0.333... (0.3̄)', repeat: '3', numDigits: 1 },
  { label: '0.4141... (0.41̄)', repeat: '41', numDigits: 2 },
  { label: '0.666... (0.6̄)', repeat: '6', numDigits: 1 },
  { label: '0.1212... (0.12̄)', repeat: '12', numDigits: 2 },
  { label: '0.142857...', repeat: '142857', numDigits: 6 },
];

export const RecurringDecimalFractionStudio: React.FC<{
  onBack?: () => void;
  onBackToLibrary?: () => void;
}> = ({ onBack, onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U3-03',
    chapter: 3,
    titleNp: 'दोहोरिने दशमलव भिन्नमा रूपान्तरण (Recurring Decimal to Fraction)',
    titleEn: 'Recurring Decimal to Fraction Conversion Studio',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'walkthrough' | 'interactive' | 'missing' | 'challenge'>('walkthrough');

  // Tab 1 walkthrough preset
  const [walkthroughPreset, setWalkthroughPreset] = useState(PRESETS[0]);

  // Tab 2 custom repeating string
  const [customRepeat, setCustomRepeat] = useState<string>('7');

  // Tab 3 Missing step state
  const [missingStep, setMissingStep] = useState<{ mult: string; sub: string }>({ mult: '', sub: '' });
  const [missingFeedback, setMissingFeedback] = useState<string | null>(null);

  // Greatest Common Divisor helper
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

  const calculateFraction = (rep: string) => {
    const k = rep.length;
    const numerator = parseInt(rep, 10) || 0;
    const denominator = Math.pow(10, k) - 1;
    const divisor = gcd(numerator, denominator);
    return {
      k,
      power: Math.pow(10, k),
      rawNum: numerator,
      rawDen: denominator,
      simplifiedNum: numerator / divisor,
      simplifiedDen: denominator / divisor,
    };
  };

  const currentWalk = calculateFraction(walkthroughPreset.repeat);
  const currentCustom = calculateFraction(customRepeat);

  const checkMissingStep = () => {
    if (missingStep.mult.trim() === '10' && missingStep.sub.trim() === '9') {
      kit.good();
      setMissingFeedback(L('स्याबास! By 10 गुणन गर्दा 10x = 3.333... र घटाउँदा 9x = 3 हुन्छ।', 'Correct! Multiplying by 10 gives 10x = 3.333... and subtracting gives 9x = 3.'));
    } else {
      kit.oops();
      setMissingFeedback(L('मिलेन! 1 अङ्क दोहोरिँदा By 10 गुणन गर्नुपर्छ र 10x - x = 9x हुन्छ।', 'Incorrect! For 1 repeating digit, multiply by 10; 10x - x = 9x.'));
    }
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! दोहोरिने दशमलवलाई बीजगणितीय विधिबाट भिन्न a/b मा रूपान्तरण गर्न सिकौँ!',
        'Hello! Convert non-terminating recurring decimals into rational fractions a/b algebraically!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: '#f8fafc', padding: 8, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          {[
            { id: 'walkthrough', labelNp: '1. पाठ्यपुस्तकका उदाहरणहरू (Step-by-Step)', labelEn: '1. Textbook Walkthrough', icon: Calculator },
            { id: 'interactive', labelNp: '2. विद्यार्थी नियन्त्रित रूपान्तरक', labelEn: '2. Interactive Converter', icon: ArrowRight },
            { id: 'missing', labelNp: '3. हराएको चरण भर्ने तालिम', labelEn: '3. Find Missing Step', icon: Layers },
            { id: 'challenge', labelNp: '4. अभ्यास चुनौती', labelEn: '4. Conversion Quiz', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setMissingFeedback(null);
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

        {/* Tab 1: Textbook Walkthrough */}
        {activeTab === 'walkthrough' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#0369a1', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calculator size={20} />
              {L('पाठ्यपुस्तकका दोहोरिने दशमलव रूपान्तरण चरणहरू', 'Step-by-Step Algebraic Conversion Method')}
            </h3>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setWalkthroughPreset(p)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: walkthroughPreset.label === p.label ? '2px solid #0284c7' : '1px solid #cbd5e1',
                    background: walkthroughPreset.label === p.label ? '#e0f2fe' : '#ffffff',
                    color: walkthroughPreset.label === p.label ? '#0369a1' : '#334155',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Step-by-Step Algebraic Box */}
            <div style={{ background: '#f8fafc', padding: 18, borderRadius: 14, border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 14, color: '#475569' }}>
                {L(`मानौँ, x = 0.${walkthroughPreset.repeat}${walkthroughPreset.repeat}... ------- (समीकरण 1)`, `Let x = 0.${walkthroughPreset.repeat}${walkthroughPreset.repeat}... ------- (Equation 1)`)}
              </div>

              <div style={{ fontSize: 14, color: '#475569' }}>
                {L(
                  `यहाँ ${toNp(currentWalk.k)} pcs अङ्क दोहोरिएकाले दुवैतर्फ 10^${toNp(currentWalk.k)} = ${toNp(currentWalk.power)} ले गुणन गर्दा:`,
                  `Since ${currentWalk.k} digit(s) repeat, multiplying both sides by 10^${currentWalk.k} = ${currentWalk.power}:`
                )}
                <div style={{ fontWeight: 800, color: '#0369a1', marginTop: 4 }}>
                  {currentWalk.power}x = {walkthroughPreset.repeat}.{walkthroughPreset.repeat}{walkthroughPreset.repeat}... ------- {L('', '(Equation 2)')}
                </div>
              </div>

              <div style={{ fontSize: 14, color: '#475569' }}>
                {L('समीकरण (2) बाट समीकरण (1) घटाउँदा:', 'Subtracting Equation (1) from Equation (2):')}
                <div style={{ fontWeight: 800, color: '#16a34a', marginTop: 4 }}>
                  {currentWalk.power}x - x = {walkthroughPreset.repeat}.{walkthroughPreset.repeat}... - 0.{walkthroughPreset.repeat}...
                </div>
                <div style={{ fontWeight: 800, color: '#15803d', marginTop: 2 }}>
                  {currentWalk.rawDen}x = {currentWalk.rawNum}
                </div>
              </div>

              <div style={{ background: '#ecfdf5', padding: 14, borderRadius: 10, border: '1.5px solid #a7f3d0' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#065f46' }}>
                  {L('अन्तिम भिन्न (Final Rational Fraction a/b):', 'Final Reduced Fraction a/b:')}
                </div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#047857', marginTop: 4 }}>
                  x = {isNe ? toNp(currentWalk.simplifiedNum) : currentWalk.simplifiedNum} / {isNe ? toNp(currentWalk.simplifiedDen) : currentWalk.simplifiedDen}
                  {currentWalk.simplifiedDen !== currentWalk.rawDen && `  [ simplifying ${currentWalk.rawNum}/${currentWalk.rawDen} ]`}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Interactive Converter */}
        {activeTab === 'interactive' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#16a34a', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ArrowRight size={20} />
              {L('स्वतन्त्र दोहोरिने दशमलव रूपान्तरक', 'Student Controlled Recurring Converter')}
            </h3>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
              <label style={{ fontSize: 14, fontWeight: 700, color: '#334155' }}>
                {L('दोहोरिने अङ्कहरू (Repeating digits) टाइप गर्नुहोस्:', 'Enter repeating block:')}
              </label>
              <input
                type="text"
                value={customRepeat}
                maxLength={6}
                onChange={(e) => setCustomRepeat(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="e.g. 7, 25, 123"
                style={{ padding: '8px 12px', fontSize: 16, borderRadius: 8, border: '1.5px solid #cbd5e1', width: 140, fontWeight: 800 }}
              />
            </div>

            {customRepeat.length > 0 && (
              <div style={{ background: '#f0fdf4', padding: 16, borderRadius: 12, border: '1.5px solid #bbf7d0' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#166534' }}>
                  0.{customRepeat}{customRepeat}... = {isNe ? toNp(currentCustom.simplifiedNum) : currentCustom.simplifiedNum} / {isNe ? toNp(currentCustom.simplifiedDen) : currentCustom.simplifiedDen}
                </div>
                <div style={{ fontSize: 13, color: '#15803d', marginTop: 6 }}>
                  {currentCustom.power}x - x = {currentCustom.rawNum} ⇒ {currentCustom.rawDen}x = {currentCustom.rawNum}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Missing Step */}
        {activeTab === 'missing' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0369a1', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers size={20} />
              {L('हराएको चरण भर्ने तालिम: 0.333... = ?', 'Fill in the Missing Steps: 0.333... = ?')}
            </h3>

            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>1. x = 0.3333...</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                2. Number to multiply both sides by:{' '}
                <input
                  type="text"
                  value={missingStep.mult}
                  onChange={(e) => setMissingStep({ ...missingStep, mult: e.target.value })}
                  placeholder="?"
                  style={{ width: 50, padding: '4px 8px', borderRadius: 6, border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 800 }}
                />{' '}
                [ 10x = 3.333... ]
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                3. Subtracting:{' '}
                <input
                  type="text"
                  value={missingStep.sub}
                  onChange={(e) => setMissingStep({ ...missingStep, sub: e.target.value })}
                  placeholder="?"
                  style={{ width: 50, padding: '4px 8px', borderRadius: 6, border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 800 }}
                />{' '}
                x = 3
              </div>

              <button
                onClick={checkMissingStep}
                style={{
                  alignSelf: 'start',
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: '#0284c7',
                  color: '#ffffff',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  marginTop: 6,
                }}
              >
                {L('जाँच्नुहोस्', 'Verify')}
              </button>

              {missingFeedback && (
                <div style={{ padding: 10, borderRadius: 8, background: missingFeedback.includes('स्याबास') || missingFeedback.includes('Correct') ? '#dcfce7' : '#fee2e2', color: missingFeedback.includes('स्याबास') || missingFeedback.includes('Correct') ? '#166534' : '#991b1b', fontWeight: 700, fontSize: 13 }}>
                  {missingFeedback}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Challenge */}
        {activeTab === 'challenge' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0369a1', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award size={20} />
              {L('दोहोरिने दशमलव अभ्यास चुनौती', 'Conversion Challenge Quiz')}
            </h3>
            <p style={{ margin: 0, fontSize: 14, color: '#475569' }}>
              {L(
                'माथि दायाँ कुनामा रहेको "चुनौती (Challenge)" ट्याबबाट 5 pcs आधिकारिक पाठ्यपुस्तकका बहु-वैकल्पिक प्रश्नहरू हल गर्नुहोस् र ताराहरू कमाउनुहोस्!',
                'Click the "Challenge" mode in the top header to take the official CDC curriculum quiz and earn mastery stars!'
              )}
            </p>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default RecurringDecimalFractionStudio;
