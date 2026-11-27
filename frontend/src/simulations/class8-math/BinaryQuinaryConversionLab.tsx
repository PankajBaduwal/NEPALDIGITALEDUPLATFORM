/**
 * BinaryQuinaryConversionLab.tsx
 * Grade 8 Mathematics – Unit 2: WHOLE NUMBERS
 * Simulation 2: Binary and Quinary Conversion Lab
 * Strictly adheres to CDC Nepal Grade 8 Mathematics Curriculum (2023 edition, Unit 2)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Repeat, ArrowRight, Check, RotateCcw, Award, HelpCircle, Layers } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'दशमलव सङ्ख्या 25 (25₁₀) लाई द्विआधार सङ्ख्यामा रूपान्तरण गर्दा कति हुन्छ?',
    en: 'What is the binary representation of decimal number 25₁₀?',
    options: [
      { key: 'A', label: '11001₂ (11001₂)' },
      { key: 'B', label: '10101₂ (10101₂)' },
      { key: 'C', label: '11100₂ (11100₂)' },
      { key: 'D', label: '10011₂ (10011₂)' },
    ],
    answer: 'A',
  },
  {
    np: 'लगातार भाग विधि (Repeated Division Method) मा Remainderहरू (Remainders) लाई कुन क्रममा लेखिन्छ?',
    en: 'In repeated division method, in which order are the remainders recorded to form the number?',
    options: [
      { key: 'A', label: 'From bottom to top (last remainder first)' },
      { key: 'B', label: 'From top to bottom' },
      { key: 'C', label: 'In any order' },
      { key: 'D', label: 'Only the first remainder' },
    ],
    answer: 'A',
  },
  {
    np: 'दशमलव सङ्ख्या 432 (432₁₀) लाई पञ्चआधारमा रूपान्तरण गर्दा कति आउँछ?',
    en: 'Converting decimal number 432₁₀ into quinary (Base 5) yields:',
    options: [
      { key: 'A', label: '3212₅ (3212₅)' },
      { key: 'B', label: '2123₅ (2123₅)' },
      { key: 'C', label: '4320₅ (4320₅)' },
      { key: 'D', label: '1234₅ (1234₅)' },
    ],
    answer: 'A',
  },
  {
    np: 'द्विआधार सङ्ख्या 10011₂ (10011₂) लाई पञ्चआधारमा रूपान्तरण गर्दा कति हुन्छ?',
    en: 'Converting binary 10011₂ to quinary (via decimal 19₁₀) gives:',
    options: [
      { key: 'A', label: '34₅ [ 19₁₀ = 3 × 5 + 4 = 34₅ ]' },
      { key: 'B', label: '43₅' },
      { key: 'C', label: '24₅' },
      { key: 'D', label: '14₅' },
    ],
    answer: 'A',
  },
  {
    np: 'पञ्चआधार सङ्ख्या 234₅ (234₅) को दशमलव मान कति हुन्छ?',
    en: 'What is the decimal value of the quinary number 234₅?',
    options: [
      { key: 'A', label: '69₁₀ [ 2 × 25 + 3 × 5 + 4 × 1 = 69 ]' },
      { key: 'B', label: '50₁₀' },
      { key: 'C', label: '59₁₀' },
      { key: 'D', label: '74₁₀' },
    ],
    answer: 'A',
  },
];

interface DivisionStep {
  dividend: number;
  divisor: number;
  quotient: number;
  remainder: number;
}

export const BinaryQuinaryConversionLab: React.FC<{
  onBack?: () => void;
  onBackToLibrary?: () => void;
}> = ({ onBack, onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U2-02',
    chapter: 2,
    titleNp: 'द्विआधार र पञ्चआधार रूपान्तरण प्रयोगशाला (Conversion Lab)',
    titleEn: 'Binary and Quinary Conversion Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'dec2bin' | 'bin2dec' | 'dec2quin' | 'quin2dec' | 'bridge' | 'challenge'>('dec2bin');

  // Tab 1: Dec to Bin input
  const [decInput1, setDecInput1] = useState<number>(25);

  // Tab 2: Bin to Dec input
  const [binInput2, setBinInput2] = useState<string>('100101');

  // Tab 3: Dec to Quin input
  const [decInput3, setDecInput3] = useState<number>(432);

  // Tab 4: Quin to Dec input
  const [quinInput4, setQuinInput4] = useState<string>('234');

  // Tab 5: Bridge binary input
  const [bridgeBin, setBridgeBin] = useState<string>('10011');

  // Tab 6: Challenge state
  const [challengeIdx, setChallengeIdx] = useState<number>(0);
  const [challengeUserAns, setChallengeUserAns] = useState<string>('');
  const [challengeFeedback, setChallengeFeedback] = useState<string | null>(null);

  const CHALLENGE_PROBLEMS = [
    {
      promptNp: 'दशमलव सङ्ख्या 21 (21₁₀) लाई द्विआधारमा बदल्नुहोस्:',
      promptEn: 'Convert decimal 21₁₀ to binary:',
      ans: '10101',
      base: 2,
      hintNp: '21 ÷ 2 गर्दै Remainderहरू तलबाट माथि पढ्नुहोस् (16 + 4 + 1 = 21)',
      hintEn: '21 = 16 + 4 + 1 = 10101₂',
    },
    {
      promptNp: 'द्विआधार सङ्ख्या 1101₂ (1101₂) लाई दशमलवमा बदल्नुहोस्:',
      promptEn: 'Convert binary 1101₂ to decimal:',
      ans: '13',
      base: 10,
      hintNp: '1 × 8 + 1 × 4 + 0 × 2 + 1 × 1 = 13',
      hintEn: '1*8 + 1*4 + 0*2 + 1*1 = 13₁₀',
    },
    {
      promptNp: 'दशमलव सङ्ख्या 69 (69₁₀) लाई पञ्चआधारमा बदल्नुहोस्:',
      promptEn: 'Convert decimal 69₁₀ to quinary:',
      ans: '234',
      base: 5,
      hintNp: '69 ÷ 5 गर्दै Remainderहरू तलबाट माथि पढ्नुहोस्',
      hintEn: '69 = 2*25 + 3*5 + 4 = 234₅',
    },
    {
      promptNp: 'पञ्चआधार सङ्ख्या 34₅ (34₅) लाई दशमलवमा बदल्नुहोस्:',
      promptEn: 'Convert quinary 34₅ to decimal:',
      ans: '19',
      base: 10,
      hintNp: '3 × 5 + 4 × 1 = 15 + 4 = 19',
      hintEn: '3*5 + 4*1 = 19₁₀',
    },
  ];

  // Helper: Division steps
  const getDivisionSteps = (num: number, base: number): DivisionStep[] => {
    const steps: DivisionStep[] = [];
    let curr = num;
    if (curr === 0) {
      steps.push({ dividend: 0, divisor: base, quotient: 0, remainder: 0 });
      return steps;
    }
    while (curr > 0) {
      const rem = curr % base;
      const q = Math.floor(curr / base);
      steps.push({ dividend: curr, divisor: base, quotient: q, remainder: rem });
      curr = q;
    }
    return steps;
  };

  const dec2binSteps = getDivisionSteps(decInput1, 2);
  const dec2binResult = dec2binSteps.map((s) => s.remainder).reverse().join('') || '0';

  const dec2quinSteps = getDivisionSteps(decInput3, 5);
  const dec2quinResult = dec2quinSteps.map((s) => s.remainder).reverse().join('') || '0';

  // Binary to decimal calculation
  const bin2decValue = binInput2
    .split('')
    .reduce((acc, bit, idx, arr) => acc + (bit === '1' ? Math.pow(2, arr.length - 1 - idx) : 0), 0);

  // Quinary to decimal calculation
  const quin2decValue = quinInput4
    .split('')
    .reduce((acc, digit, idx, arr) => acc + parseInt(digit, 10) * Math.pow(5, arr.length - 1 - idx), 0);

  // Bridge binary -> dec -> quinary
  const bridgeDec = bridgeBin
    .split('')
    .reduce((acc, bit, idx, arr) => acc + (bit === '1' ? Math.pow(2, arr.length - 1 - idx) : 0), 0);
  const bridgeQuinSteps = getDivisionSteps(bridgeDec, 5);
  const bridgeQuin = bridgeQuinSteps.map((s) => s.remainder).reverse().join('') || '0';

  const checkChallenge = () => {
    const p = CHALLENGE_PROBLEMS[challengeIdx];
    if (challengeUserAns.trim() === p.ans) {
      kit.good();
      setChallengeFeedback(L('उत्कृष्ट! तपाईंको उत्तर पूर्ण सही छ!', 'Excellent! Your answer is completely correct!'));
    } else {
      kit.oops();
      setChallengeFeedback(L(`मिलेन! सही उत्तर ${p.ans} हो। संकेत: ${p.hintNp}`, `Incorrect! Correct answer is ${p.ans}. Hint: ${p.hintEn}`));
    }
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! दशमलव, द्विआधार (2) र पञ्चआधार (5) बीच रूपान्तरण गर्न लगातार भाग विधि र विस्तारित रूप अभ्यास गरौँ!',
        'Hello! Practice repeated division and expanded form conversions between Decimal, Binary, and Quinary!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: '#f8fafc', padding: 8, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          {[
            { id: 'dec2bin', labelNp: '1. दशमलव → द्विआधार', labelEn: '1. Dec → Bin', icon: Repeat },
            { id: 'bin2dec', labelNp: '2. द्विआधार → दशमलव', labelEn: '2. Bin → Dec', icon: ArrowRight },
            { id: 'dec2quin', labelNp: '3. दशमलव → पञ्चआधार', labelEn: '3. Dec → Quin', icon: Repeat },
            { id: 'quin2dec', labelNp: '4. पञ्चआधार → दशमलव', labelEn: '4. Quin → Dec', icon: ArrowRight },
            { id: 'bridge', labelNp: '5. द्विआधार ↔ पञ्चआधार', labelEn: '5. Bin ↔ Quin Bridge', icon: Layers },
            { id: 'challenge', labelNp: '6. रूपान्तरण चुनौती', labelEn: '6. Challenge Quiz', icon: Award },
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

        {/* Tab 1: Decimal to Binary (Repeated Division by 2) */}
        {activeTab === 'dec2bin' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0369a1', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Repeat size={20} />
              {L('दशमलवबाट द्विआधारमा रूपान्तरण (2 ले लगातार भाग विधि)', 'Decimal to Binary (Repeated Division by 2)')}
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: 14, color: '#475569' }}>
              {L(
                'दिइएको दशमलव सङ्ख्यालाई 2 ले लगातार भाग गर्दै प्रत्येक चरणको Remainder (Remainder) दायाँतर्फ टिप्नुहोस्। अन्त्यमा Remainderहरू तलबाट माथितर्फ लेख्दा द्विआधार सङ्ख्या प्राप्त हुन्छ।',
                'Divide repeatedly by 2, write remainders on the right, and read the remainders from bottom to top.'
              )}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <label style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>
                {L('दशमलव सङ्ख्या छान्नुहोस्:', 'Choose Decimal Number:')}
              </label>
              {[25, 13, 37, 45, 59, 100].map((n) => (
                <button
                  key={n}
                  onClick={() => setDecInput1(n)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: decInput1 === n ? '2px solid #0284c7' : '1px solid #cbd5e1',
                    background: decInput1 === n ? '#e0f2fe' : '#ffffff',
                    color: decInput1 === n ? '#0369a1' : '#334155',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {isNe ? toNp(n) : n}
                </button>
              ))}
            </div>

            {/* Division Table */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 420px) 1fr', gap: 20, alignItems: 'start' }}>
              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 12, border: '1px solid #cbd5e1' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9' }}>
                      <th style={{ padding: 8, borderBottom: '2px solid #cbd5e1' }}>{L('भाजक', 'Divisor')}</th>
                      <th style={{ padding: 8, borderBottom: '2px solid #cbd5e1' }}>{L('भाज्य / भागफल', 'Quotient')}</th>
                      <th style={{ padding: 8, borderBottom: '2px solid #cbd5e1', color: '#c2410c' }}>{L('Remainder (Remainder)', 'Remainder')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dec2binSteps.map((step, idx) => (
                      <tr key={idx} style={{ background: idx === dec2binSteps.length - 1 ? '#dcfce7' : 'transparent' }}>
                        <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0', fontWeight: 800, color: '#0369a1' }}>2</td>
                        <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0', fontWeight: 700 }}>
                          {isNe ? toNp(step.dividend) : step.dividend}
                        </td>
                        <td style={{ padding: 8, borderBottom: '1px solid #e2e8f0', fontWeight: 800, color: '#ea580c' }}>
                          — {isNe ? toNp(step.remainder) : step.remainder}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td style={{ padding: 8, fontWeight: 800, color: '#0369a1' }}></td>
                      <td style={{ padding: 8, fontWeight: 900, color: '#166534' }}>0</td>
                      <td style={{ padding: 8, color: '#15803d', fontWeight: 800 }}>{L('↑ तलबाट माथि', '↑ Read Upwards')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Result & Steps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ background: '#ecfdf5', padding: 16, borderRadius: 12, border: '1.5px solid #a7f3d0' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#065f46' }}>
                    {L('रूपान्तरण नतिजा (Final Result):', 'Final Result:')}
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: '#047857', marginTop: 4 }}>
                    {isNe ? toNp(decInput1) : decInput1}₁₀ = {dec2binResult}₂
                  </div>
                  <div style={{ fontSize: 13, color: '#064e3b', marginTop: 6 }}>
                    {L(
                      `Remainderहरू तलबाट माथि क्रम मिलाउँदा: ${dec2binSteps.map((s) => s.remainder).reverse().join('')}`,
                      `Remainders ordered from bottom to top: ${dec2binSteps.map((s) => s.remainder).reverse().join('')}`
                    )}
                  </div>
                </div>

                <div style={{ background: '#f0f9ff', padding: 14, borderRadius: 10, border: '1px solid #bae6fd', fontSize: 13, color: '#0369a1', lineHeight: 1.6 }}>
                  <strong>{L('जाँच्ने विधि (Verification):', 'Verification:')}</strong><br />
                  {dec2binResult.split('').map((b, i, arr) => `${b} × 2^${arr.length - 1 - i}`).join(' + ')} = {decInput1}₁₀
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Binary to Decimal (Expanded Form) */}
        {activeTab === 'bin2dec' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#16a34a', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ArrowRight size={20} />
              {L('द्विआधारबाट दशमलवमा रूपान्तरण (विस्तारित रूप विधि)', 'Binary to Decimal (Expanded Form Method)')}
            </h3>
            <p style={{ margin: '0 0 14px 0', fontSize: 14, color: '#475569' }}>
              {L(
                'द्विआधार सङ्ख्याका प्रत्येक अङ्कलाई दायाँबाट बायाँतर्फ 2 को घात (2⁰, 2¹, 2², 2³, ...) ले गुणन गरी जोड्नुहोस्:',
                'Multiply each binary digit by powers of 2 starting from the right (2⁰, 2¹, 2², 2³, ...), then sum them up:'
              )}
            </p>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{L('पाठ्यपुस्तकका उदाहरणहरू:', 'Textbook Examples:')}</span>
              {['100101', '10101', '11001', '1101', '1111'].map((b) => (
                <button
                  key={b}
                  onClick={() => setBinInput2(b)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: binInput2 === b ? '2px solid #16a34a' : '1px solid #cbd5e1',
                    background: binInput2 === b ? '#dcfce7' : '#ffffff',
                    color: binInput2 === b ? '#15803d' : '#334155',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {b}₂
                </button>
              ))}
            </div>

            {/* Step-by-step expansion */}
            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #cbd5e1', marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 10 }}>
                {L('विस्तारित गणना प्रक्रिया:', 'Step-by-Step Expansion:')}
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#16a34a', lineHeight: 1.8 }}>
                {binInput2}₂ ={' '}
                {binInput2
                  .split('')
                  .map((bit, idx, arr) => `(${bit} × 2^${arr.length - 1 - idx})`)
                  .join(' + ')}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginTop: 8 }}>
                = {binInput2
                  .split('')
                  .map((bit, idx, arr) => `${bit === '1' ? Math.pow(2, arr.length - 1 - idx) : 0}`)
                  .join(' + ')}
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#0f766e', marginTop: 10 }}>
                = {isNe ? toNp(bin2decValue) : bin2decValue}₁₀
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Decimal to Quinary (Repeated Division by 5) */}
        {activeTab === 'dec2quin' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#ea580c', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Repeat size={20} />
              {L('दशमलवबाट पञ्चआधारमा रूपान्तरण (5 ले लगातार भाग विधि)', 'Decimal to Quinary (Repeated Division by 5)')}
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: 14, color: '#475569' }}>
              {L(
                'दशमलव सङ्ख्यालाई 5 ले लगातार भाग गर्दै प्रत्येक चरणको Remainder दायाँतर्फ राख्नुहोस् र अन्त्यमा Remainderहरू तलबाट माथितर्फ लेख्नुहोस्:',
                'Divide repeatedly by 5, record the remainders, and read from bottom to top:'
              )}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <label style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>
                {L('सङ्ख्या छान्नुहोस्:', 'Choose Number:')}
              </label>
              {[432, 69, 19, 125, 234].map((n) => (
                <button
                  key={n}
                  onClick={() => setDecInput3(n)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: decInput3 === n ? '2px solid #ea580c' : '1px solid #cbd5e1',
                    background: decInput3 === n ? '#ffedd5' : '#ffffff',
                    color: decInput3 === n ? '#c2410c' : '#334155',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {isNe ? toNp(n) : n}₁₀
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 420px) 1fr', gap: 20, alignItems: 'start' }}>
              <div style={{ background: '#fff7ed', padding: 14, borderRadius: 12, border: '1px solid #fed7aa' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                  <thead>
                    <tr style={{ background: '#ffedd5' }}>
                      <th style={{ padding: 8, borderBottom: '2px solid #fed7aa' }}>{L('भाजक', 'Divisor')}</th>
                      <th style={{ padding: 8, borderBottom: '2px solid #fed7aa' }}>{L('भागफल', 'Quotient')}</th>
                      <th style={{ padding: 8, borderBottom: '2px solid #fed7aa', color: '#c2410c' }}>{L('Remainder', 'Remainder')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dec2quinSteps.map((step, idx) => (
                      <tr key={idx} style={{ background: idx === dec2quinSteps.length - 1 ? '#fef3c7' : 'transparent' }}>
                        <td style={{ padding: 8, borderBottom: '1px solid #fed7aa', fontWeight: 800, color: '#c2410c' }}>5</td>
                        <td style={{ padding: 8, borderBottom: '1px solid #fed7aa', fontWeight: 700 }}>
                          {isNe ? toNp(step.dividend) : step.dividend}
                        </td>
                        <td style={{ padding: 8, borderBottom: '1px solid #fed7aa', fontWeight: 800, color: '#b45309' }}>
                          — {isNe ? toNp(step.remainder) : step.remainder}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td style={{ padding: 8, fontWeight: 800, color: '#c2410c' }}></td>
                      <td style={{ padding: 8, fontWeight: 900, color: '#b45309' }}>0</td>
                      <td style={{ padding: 8, color: '#9a3412', fontWeight: 800 }}>{L('↑ तलबाट माथि', '↑ Read Upwards')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ background: '#fff7ed', padding: 16, borderRadius: 12, border: '1.5px solid #fdba74' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#9a3412' }}>
                    {L('पञ्चआधार नतिजा (Final Result):', 'Final Quinary Result:')}
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: '#c2410c', marginTop: 4 }}>
                    {isNe ? toNp(decInput3) : decInput3}₁₀ = {dec2quinResult}₅
                  </div>
                  <div style={{ fontSize: 13, color: '#7c2d12', marginTop: 6 }}>
                    {L(
                      `Remainderहरू तलबाट माथि: ${dec2quinSteps.map((s) => s.remainder).reverse().join('')}`,
                      `Remainders ordered bottom to top: ${dec2quinSteps.map((s) => s.remainder).reverse().join('')}`
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Quinary to Decimal (Expanded Form) */}
        {activeTab === 'quin2dec' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#c2410c', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ArrowRight size={20} />
              {L('पञ्चआधारबाट दशमलवमा रूपान्तरण (विस्तारित रूप विधि)', 'Quinary to Decimal (Expanded Form Method)')}
            </h3>
            <p style={{ margin: '0 0 14px 0', fontSize: 14, color: '#475569' }}>
              {L(
                'पञ्चआधार सङ्ख्याका प्रत्येक अङ्कलाई दायाँबाट 5 को घात (5⁰, 5¹, 5², 5³, ...) ले गुणन गरी जोड्नुहोस्:',
                'Multiply each quinary digit by powers of 5 starting from the right (5⁰, 5¹, 5², 5³, ...):'
              )}
            </p>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{L('पाठ्यपुस्तकका उदाहरणहरू:', 'Textbook Examples:')}</span>
              {['234', '3212', '34', '144', '1023'].map((q) => (
                <button
                  key={q}
                  onClick={() => setQuinInput4(q)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: quinInput4 === q ? '2px solid #ea580c' : '1px solid #cbd5e1',
                    background: quinInput4 === q ? '#ffedd5' : '#ffffff',
                    color: quinInput4 === q ? '#c2410c' : '#334155',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {q}₅
                </button>
              ))}
            </div>

            <div style={{ background: '#fff7ed', padding: 16, borderRadius: 12, border: '1.5px solid #fed7aa' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#9a3412', marginBottom: 8 }}>
                {L('विस्तारित गणना प्रक्रिया:', 'Expansion Process:')}
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#c2410c', lineHeight: 1.8 }}>
                {quinInput4}₅ ={' '}
                {quinInput4
                  .split('')
                  .map((d, idx, arr) => `(${d} × 5^${arr.length - 1 - idx})`)
                  .join(' + ')}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginTop: 8 }}>
                = {quinInput4
                  .split('')
                  .map((d, idx, arr) => `${parseInt(d, 10) * Math.pow(5, arr.length - 1 - idx)}`)
                  .join(' + ')}
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#9a3412', marginTop: 10 }}>
                = {isNe ? toNp(quin2decValue) : quin2decValue}₁₀
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Binary to Quinary via Decimal */}
        {activeTab === 'bridge' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#7c3aed', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers size={20} />
              {L('द्विआधारबाट पञ्चआधारमा रूपान्तरण (दशमलवलाई पुल बनाएर)', 'Binary to Quinary via Decimal Bridge')}
            </h3>
            <p style={{ margin: '0 0 14px 0', fontSize: 14, color: '#475569' }}>
              {L(
                'पाठ्यपुस्तकको विधि: पहिले द्विआधारलाई दशमलवमा बदल्ने (चरण 1), र प्राप्त दशमलवलाई 5 ले भाग गरी पञ्चआधारमा बदल्ने (चरण 2)।',
                'Textbook 2-step method: First convert binary to decimal (Step 1), then convert that decimal to quinary by dividing by 5 (Step 2).'
              )}
            </p>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{L('द्विआधार सङ्ख्या छान्नुहोस्:', 'Choose Binary:')}</span>
              {['10011', '10101', '11001', '1111'].map((b) => (
                <button
                  key={b}
                  onClick={() => setBridgeBin(b)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: bridgeBin === b ? '2px solid #7c3aed' : '1px solid #cbd5e1',
                    background: bridgeBin === b ? '#f3e8ff' : '#ffffff',
                    color: bridgeBin === b ? '#7c3aed' : '#334155',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {b}₂
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              {/* Step 1 */}
              <div style={{ background: '#eff6ff', padding: 14, borderRadius: 12, border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#1e40af' }}>
                  {L('चरण 1: द्विआधार → दशमलव', 'Step 1: Binary → Decimal')}
                </div>
                <div style={{ fontSize: 14, color: '#1e3a8a', marginTop: 8 }}>
                  {bridgeBin}₂ = {bridgeBin.split('').map((b, i, arr) => `(${b}×2^${arr.length - 1 - i})`).join('+')}
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#1d4ed8', marginTop: 8 }}>
                  = {isNe ? toNp(bridgeDec) : bridgeDec}₁₀
                </div>
              </div>

              {/* Step 2 */}
              <div style={{ background: '#fff7ed', padding: 14, borderRadius: 12, border: '1px solid #fed7aa' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#c2410c' }}>
                  {L('चरण 2: दशमलव → पञ्चआधार (5 ले भाग)', 'Step 2: Decimal → Quinary (÷ 5)')}
                </div>
                <div style={{ fontSize: 14, color: '#7c2d12', marginTop: 8 }}>
                  {bridgeDec} ÷ 5 = {Math.floor(bridgeDec / 5)} Remainder {bridgeDec % 5}
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#ea580c', marginTop: 8 }}>
                  = {bridgeQuin}₅
                </div>
              </div>
            </div>

            <div style={{ background: '#f5f3ff', padding: 16, borderRadius: 12, border: '2px solid #ddd6fe', textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#6d28d9' }}>{L('अन्तिम नतिजा (Final Output):', 'Final Output:')}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#7c3aed', marginTop: 4 }}>
                {bridgeBin}₂ = {bridgeQuin}₅
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Conversion Challenge */}
        {activeTab === 'challenge' && (
          <div style={{ background: '#ffffff', padding: 20, borderRadius: 16, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#0369a1', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award size={20} />
              {L('सङ्ख्या रूपान्तरण तालिम तथा चुनौती', 'Number Conversion Challenge')}
            </h3>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {CHALLENGE_PROBLEMS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setChallengeIdx(idx);
                    setChallengeUserAns('');
                    setChallengeFeedback(null);
                  }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: challengeIdx === idx ? '2px solid #0284c7' : '1px solid #cbd5e1',
                    background: challengeIdx === idx ? '#e0f2fe' : '#ffffff',
                    color: challengeIdx === idx ? '#0369a1' : '#334155',
                  }}
                >
                  {L(`प्रश्न ${toNp(idx + 1)}`, `Problem ${idx + 1}`)}
                </button>
              ))}
            </div>

            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #cbd5e1', marginBottom: 16 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#1e293b' }}>
                {isNe ? CHALLENGE_PROBLEMS[challengeIdx].promptNp : CHALLENGE_PROBLEMS[challengeIdx].promptEn}
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 14 }}>
                <input
                  type="text"
                  value={challengeUserAns}
                  onChange={(e) => setChallengeUserAns(e.target.value)}
                  placeholder={L('उत्तर यहाँ लेख्नुहोस्...', 'Type answer here...')}
                  style={{
                    padding: '10px 14px',
                    fontSize: 16,
                    borderRadius: 8,
                    border: '1.5px solid #cbd5e1',
                    width: 220,
                  }}
                />
                <button
                  onClick={checkChallenge}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 8,
                    background: '#0284c7',
                    color: '#ffffff',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {L('जाँच्नुहोस्', 'Submit')}
                </button>
              </div>

              {challengeFeedback && (
                <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: challengeFeedback.includes('उत्कृष्ट') || challengeFeedback.includes('Excellent') ? '#dcfce7' : '#fee2e2', color: challengeFeedback.includes('उत्कृष्ट') || challengeFeedback.includes('Excellent') ? '#166534' : '#991b1b', fontWeight: 700, fontSize: 14 }}>
                  {challengeFeedback}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default BinaryQuinaryConversionLab;
