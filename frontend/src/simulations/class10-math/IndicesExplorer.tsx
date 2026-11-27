import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const IndicesExplorer: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G10-U9-01',
    chapter: 9,
    titleNp: 'घाताङ्कका नियमहरू अन्तरक्रियात्मक अन्वेषक',
    titleEn: 'Laws of Indices Interactive Explorer',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'laws' | 'zeroNegative' | 'fractional' | 'equations' | 'challenge'>('laws');

  // ── 1. LAWS OF INDICES STATE ───────────────────────────────────────────────
  const [selectedLaw, setSelectedLaw] = useState<'product' | 'quotient' | 'powerOfPower' | 'powerOfProduct'>('product');
  const [baseA, setBaseA] = useState<number>(2);
  const [expM, setExpM] = useState<number>(3);
  const [expN, setExpN] = useState<number>(2);

  // ── 2. ZERO & NEGATIVE INDICES STATE ───────────────────────────────────────
  const [descendingBase, setDescendingBase] = useState<number>(2);

  // ── 3. FRACTIONAL INDICES STATE ────────────────────────────────────────────
  const [fracPresetIdx, setFracPresetIdx] = useState<number>(0);
  const fracPresets = [
    { base: 27, m: 2, n: 3, root: 3, final: 9, expr: '27^(2/3) = (∛27)² = 3² = 9' },
    { base: 16, m: 3, n: 4, root: 2, final: 8, expr: '16^(3/4) = (⁴√16)³ = 2³ = 8' },
    { base: 64, m: 2, n: 3, root: 4, final: 16, expr: '64^(2/3) = (∛64)² = 4² = 16' },
    { base: 32, m: 2, n: 5, root: 2, final: 4, expr: '32^(2/5) = (⁵√32)² = 2² = 4' },
    { base: 81, m: 3, n: 4, root: 3, final: 27, expr: '81^(3/4) = (⁴√81)³ = 3³ = 27' },
  ];

  // ── 4. EXPONENTIAL EQUATIONS STATE ─────────────────────────────────────────
  const [selectedEqIdx, setSelectedEqIdx] = useState<number>(0);
  const eqPresets = [
    {
      titleEn: '1. Single Base Matching: 3^(x - 1) = 81',
      titleNp: '1. समान आधार बनाउने: 3^(x - 1) = 81',
      eqStr: '3^(x - 1) = 81',
      step1En: 'Express 81 as a power of 3: 81 = 3⁴',
      step1Np: '81 लाई आधार 3 को घाताङ्कमा रूपान्तरण गर्दा: 81 = 3⁴',
      step2En: '3^(x - 1) = 3⁴',
      step2Np: '3^(x - 1) = 3⁴',
      step3En: 'Equate exponents since bases are equal: x - 1 = 4',
      step3Np: 'आधार समान भएकाले घाताङ्कहरू बराबर गर्दा: x - 1 = 4',
      finalEn: 'x = 4 + 1 = 5',
      finalNp: 'x = 4 + 1 = 5',
      checkEn: 'Check: LHS = 3^(5 - 1) = 3⁴ = 81 = RHS (Verified)',
      checkNp: 'परीक्षण: बायाँ पक्ष = 3^(5 - 1) = 3⁴ = 81 = दायाँ पक्ष (प्रमाणित)',
    },
    {
      titleEn: '2. Decimal Base Conversion: 4^(x - 2) = 0.25',
      titleNp: '2. दशमलव रूपान्तरण: 4^(x - 2) = 0.25',
      eqStr: '4^(x - 2) = 0.25',
      step1En: 'Convert decimal 0.25 to fraction: 0.25 = 25/100 = 1/4 = 4⁻¹',
      step1Np: '0.25 लाई भिन्न र ऋणात्मक घाताङ्कमा बदल्दा: 0.25 = 25/100 = 1/4 = 4⁻¹',
      step2En: '4^(x - 2) = 4⁻¹',
      step2Np: '4^(x - 2) = 4⁻¹',
      step3En: 'Equate exponents: x - 2 = -1',
      step3Np: 'घाताङ्कहरू बराबर गर्दा: x - 2 = -1',
      finalEn: 'x = -1 + 2 = 1',
      finalNp: 'x = -1 + 2 = 1',
      checkEn: 'Check: LHS = 4^(1 - 2) = 4⁻¹ = 1/4 = 0.25 = RHS (Verified)',
      checkNp: 'परीक्षण: बायाँ पक्ष = 4^(1 - 2) = 4⁻¹ = 1/4 = 0.25 = दायाँ पक्ष',
    },
    {
      titleEn: '3. Common Factor Extraction: 2^(x + 1) + 2^x = 24',
      titleNp: '3. साझा खण्ड निकाल्ने: 2^(x + 1) + 2^x = 24',
      eqStr: '2^(x + 1) + 2^x = 24',
      step1En: 'Split 2^(x + 1) as 2^x · 2¹: 2^x · 2 + 2^x · 1 = 24',
      step1Np: '2^(x + 1) लाई 2^x · 2¹ मा टुक्र्याउँदा: 2^x · 2 + 2^x · 1 = 24',
      step2En: 'Factor out 2^x: 2^x (2 + 1) = 24  ⟹  2^x · 3 = 24',
      step2Np: 'साझा 2^x बाहिर निकाल्दा: 2^x (2 + 1) = 24  ⟹  2^x · 3 = 24',
      step3En: 'Divide by 3: 2^x = 24 / 3 = 8 = 2³',
      step3Np: '3 ले भाग गर्दा: 2^x = 24 / 3 = 8 = 2³',
      finalEn: 'Equate exponents: x = 3',
      finalNp: 'घाताङ्क बराबर गर्दा: x = 3',
      checkEn: 'Check: 2^(3 + 1) + 2³ = 2⁴ + 8 = 16 + 8 = 24 (Verified)',
      checkNp: 'परीक्षण: 2⁴ + 2³ = 16 + 8 = 24',
    },
    {
      titleEn: '4. Quadratic Reducible Type: 2^x + 1/(2^x) = 2½',
      titleNp: '4. वर्ग समीकरणमा रूपान्तरण हुने: 2^x + 1/(2^x) = 2½',
      eqStr: '2^x + 1 / 2^x = 5 / 2',
      step1En: 'Let 2^x = y. Then: y + 1/y = 5/2',
      step1Np: 'मानाैँ, 2^x = y। त्यसो भए: y + 1/y = 5/2',
      step2En: 'Multiply by 2y: 2y² + 2 = 5y  ⟹  2y² - 5y + 2 = 0',
      step2Np: '2y ले गुणन गर्दा: 2y² - 5y + 2 = 0',
      step3En: 'Factorize: (2y - 1)(y - 2) = 0  ⟹  y = 2 or y = 1/2',
      step3Np: 'खण्डिकरण गर्दा: (2y - 1)(y - 2) = 0  ⟹  y = 2 अथवा y = 1/2',
      finalEn: 'When y = 2  ⟹  2^x = 2¹  ⟹  x = 1; When y = 1/2  ⟹  2^x = 2⁻¹  ⟹  x = -1',
      finalNp: 'y = 2 हुँदा 2^x = 2¹ ⟹ x = 1; y = 1/2 हुँदा 2^x = 2⁻¹ ⟹ x = -1',
      checkEn: 'Both x = 1 and x = -1 satisfy the equation: 2 + 1/2 = 2.5 (Verified)',
      checkNp: 'x = 1 र x = -1 दुवैले समीकरण सन्तुष्ट गर्छन्: 2 + 1/2 = 2.5',
    },
  ];

  // ── 5. PRACTICE CHALLENGE ──────────────────────────────────────────────────
  const [score, setScore] = useState<number>(0);
  const [quizIdx, setQuizIdx] = useState<number>(0);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const quizQuestions = [
    {
      qEn: 'Simplify: 2³ × 2⁴. According to the Product Law of Indices, what is the result?',
      qNp: 'सरल गर्नुहोस्: 2³ × 2⁴। घाताङ्कको गुणन नियम अनुसार यसको मान कति हुन्छ?',
      options: ['2⁷ = 128', '4⁷ = 16384', '2¹² = 4096', '2¹ = 2'],
      optionsNp: ['2⁷ = 128', '4⁷ = 16384', '2¹² = 4096', '2¹ = 2'],
      correct: 0,
      hintEn: 'Product Law: a^m × a^n = a^(m + n)  ⟹  2^(3 + 4) = 2⁷ = 128.',
      hintNp: 'गुणन नियम: a^m × a^n = a^(m + n)  ⟹  2^(3 + 4) = 2⁷ = 128।',
    },
    {
      qEn: 'What is the value of 5⁰ and 4⁻²?',
      qNp: '5⁰ र 4⁻² को मान कति हुन्छ?',
      options: ['1 and 1/16', '0 and -8', '5 and -16', '1 and -8'],
      optionsNp: ['1 र 1/16', '0 र -8', '5 र -16', '1 र -8'],
      correct: 0,
      hintEn: 'a⁰ = 1 (for a ≠ 0) and a⁻ⁿ = 1/aⁿ. So 5⁰ = 1 and 4⁻² = 1/4² = 1/16.',
      hintNp: 'a⁰ = 1 र a⁻ⁿ = 1/aⁿ। त्यसैले 5⁰ = 1 र 4⁻² = 1/4² = 1/16।',
    },
    {
      qEn: 'Solve the exponential equation: 3^(x - 2) = 27. What is the value of x?',
      qNp: 'घाताङ्कीय समीकरण हल गर्नुहोस्: 3^(x - 2) = 27। x को मान कति हुन्छ?',
      options: ['x = 5', 'x = 3', 'x = 6', 'x = 1'],
      optionsNp: ['x = 5', 'x = 3', 'x = 6', 'x = 1'],
      correct: 0,
      hintEn: '3^(x - 2) = 27 = 3³  ⟹  x - 2 = 3  ⟹  x = 5.',
      hintNp: '3^(x - 2) = 27 = 3³  ⟹  x - 2 = 3  ⟹  x = 5।',
    },
    {
      qEn: 'Evaluate: 64^(2/3). What is the exact value?',
      qNp: 'मान निकाल्नुहोस्: 64^(2/3)। यसको मान कति हुन्छ?',
      options: ['16', '8', '32', '4'],
      optionsNp: ['16', '8', '32', '4'],
      correct: 0,
      hintEn: '64^(2/3) = (∛64)² = 4² = 16.',
      hintNp: '64^(2/3) = (∛64)² = 4² = 16।',
    },
  ];

  const handleSelectAnswer = (idx: number) => {
    setSelectedAns(idx);
    const q = quizQuestions[quizIdx];
    if (idx === q.correct) {
      kit.good();
      setScore((prev) => prev + 10);
      setQuizFeedback(isNe ? 'सटीक उत्तर! धेरै राम्रो।' : 'Correct! Excellent indices reasoning.');
    } else {
      kit.oops();
      setQuizFeedback(isNe ? 'गलत उत्तर। संकेत हेरी पुन: प्रयास गर्नुहोस्।' : 'Incorrect. Check the exponent law and formula.');
    }
  };

  const handleNextQuiz = () => {
    kit.tap();
    setSelectedAns(null);
    setQuizFeedback(null);
    setQuizIdx((prev) => (prev + 1) % quizQuestions.length);
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={10}
      mascotGreeting={L(
        'नमस्ते! कक्षा 10 गणितको एकाइ 9: घाताङ्क (Indices) प्रयोगशालामा स्वागत छ! यहाँ गुणन र भागका नियमहरू, शून्य र ऋणात्मक घाताङ्क, भिन्न घाताङ्क तथा घाताङ्कीय समीकरणहरू प्रत्यक्ष अन्वेषण गर्नुहोस्!',
        'Welcome to Grade 10 Unit 9: Laws of Indices Interactive Explorer! Experiment with product & quotient laws, zero & negative powers, fractional roots, and step-by-step exponential equation solving!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b pb-2">
          {[
            { id: 'laws', labelNp: 'क) घाताङ्कका मूलभूत नियमहरू (Fundamental Laws)', labelEn: 'A) Fundamental Laws' },
            { id: 'zeroNegative', labelNp: 'ख) शून्य तथा ऋणात्मक घाताङ्क (a⁰ & a⁻ⁿ)', labelEn: 'B) Zero & Negative Indices' },
            { id: 'fractional', labelNp: 'ग) भिन्न घाताङ्क तथा मूल (a^(m/n) = ⁿ√aᵐ)', labelEn: 'C) Fractional Indices' },
            { id: 'equations', labelNp: 'घ) घाताङ्कीय समीकरणहरू (Equations Lab)', labelEn: 'D) Exponential Equations' },
            { id: 'challenge', labelNp: 'ङ) अभ्यास चुनौती (Quiz)', labelEn: 'E) Practice Challenge' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                kit.tap();
              }}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs sm:text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-[#167C80] text-white shadow-md'
                  : 'bg-white hover:bg-slate-100 text-[#142D4E] border border-slate-200'
              }`}
            >
              {isNe ? tab.labelNp : tab.labelEn}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 1: FUNDAMENTAL LAWS OF INDICES
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'laws' && (
          <div className="space-y-4">
            {/* Law Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'product', label: 'aᵐ × aⁿ = aᵐ⁺ⁿ', nameNp: '1. गुणन नियम (Product)', nameEn: '1. Product Law' },
                { id: 'quotient', label: 'aᵐ ÷ aⁿ = aᵐ⁻ⁿ', nameNp: '2. भाग नियम (Quotient)', nameEn: '2. Quotient Law' },
                { id: 'powerOfPower', label: '(aᵐ)ⁿ = aᵐⁿ', nameNp: '3. घातको घात (Power of Power)', nameEn: '3. Power of Power' },
                { id: 'powerOfProduct', label: '(ab)ᵐ = aᵐ bᵐ', nameNp: '4. गुणनको घात (Power of Product)', nameEn: '4. Power of Product' },
              ].map((law) => (
                <button
                  key={law.id}
                  onClick={() => {
                    kit.tap();
                    setSelectedLaw(law.id as any);
                  }}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedLaw === law.id
                      ? 'bg-[#142D4E] text-white border-[#142D4E] font-bold shadow-md'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs font-mono font-bold text-amber-400 mb-1">{law.label}</div>
                  <div className="text-xs">{isNe ? law.nameNp : law.nameEn}</div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Visual Display Board */}
              <div className="md:col-span-7 bg-[#142D4E] p-6 rounded-2xl flex flex-col justify-between text-white shadow-md">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  {L('अन्तरक्रियात्मक घाताङ्क विस्तार (Interactive Expansion)', 'Interactive Expansion Board')}
                </span>

                {/* PRODUCT LAW VISUAL */}
                {selectedLaw === 'product' && (
                  <div className="my-4 space-y-4">
                    <div className="p-4 bg-slate-900/70 border border-slate-700 rounded-xl text-center">
                      <div className="text-xs text-slate-400 mb-1">Exponent terms</div>
                      <div className="text-2xl font-mono font-bold text-teal-300">
                        {fmt(baseA)}<sup className="text-amber-400 text-lg">{fmt(expM)}</sup> × {fmt(baseA)}<sup className="text-amber-400 text-lg">{fmt(expN)}</sup>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-900/70 border border-slate-700 rounded-xl space-y-2">
                      <div className="text-xs text-slate-400">Expanded multiplication form (repeated multiplication):</div>
                      <div className="text-sm font-mono text-slate-200 break-words">
                        = ({Array(expM).fill(fmt(baseA)).join(' × ')}) × ({Array(expN).fill(fmt(baseA)).join(' × ')})
                      </div>
                      <div className="text-xs text-emerald-400 font-bold">
                        = {fmt(baseA)}<sup className="text-amber-300">{fmt(expM)} + {fmt(expN)}</sup> = {fmt(baseA)}<sup className="text-amber-300">{fmt(expM + expN)}</sup>
                      </div>
                    </div>

                    <div className="p-3 bg-teal-900/50 border border-teal-500/50 rounded-xl text-center">
                      <span className="text-xs text-teal-200 block">Final numerical value:</span>
                      <span className="text-2xl font-black font-mono text-teal-300">
                        {fmt(Math.pow(baseA, expM + expN))}
                      </span>
                    </div>
                  </div>
                )}

                {/* QUOTIENT LAW VISUAL */}
                {selectedLaw === 'quotient' && (
                  <div className="my-4 space-y-4">
                    <div className="p-4 bg-slate-900/70 border border-slate-700 rounded-xl text-center">
                      <div className="text-xs text-slate-400 mb-1">घाताङ्क भाग</div>
                      <div className="text-2xl font-mono font-bold text-teal-300">
                        {fmt(baseA)}<sup className="text-amber-400 text-lg">{fmt(expM)}</sup> ÷ {fmt(baseA)}<sup className="text-amber-400 text-lg">{fmt(expN)}</sup>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-900/70 border border-slate-700 rounded-xl space-y-2">
                      <div className="text-xs text-slate-400">अंश र हरको विस्तार तथा खण्ड विलोपन:</div>
                      <div className="flex flex-col items-center gap-1 font-mono text-sm">
                        <div className="text-slate-200">{Array(expM).fill(fmt(baseA)).join(' × ')}</div>
                        <div className="w-48 h-0.5 bg-slate-400" />
                        <div className="text-slate-200">{Array(expN).fill(fmt(baseA)).join(' × ')}</div>
                      </div>
                      <div className="text-xs text-emerald-400 font-bold text-center mt-2">
                        = {fmt(baseA)}<sup className="text-amber-300">{fmt(expM)} - {fmt(expN)}</sup> = {fmt(baseA)}<sup className="text-amber-300">{fmt(expM - expN)}</sup>
                      </div>
                    </div>

                    <div className="p-3 bg-teal-900/50 border border-teal-500/50 rounded-xl text-center">
                      <span className="text-xs text-teal-200 block">Final numerical value:</span>
                      <span className="text-2xl font-black font-mono text-teal-300">
                        {fmt(Math.pow(baseA, expM - expN))}
                      </span>
                    </div>
                  </div>
                )}

                {/* POWER OF A POWER */}
                {selectedLaw === 'powerOfPower' && (
                  <div className="my-4 space-y-4">
                    <div className="p-4 bg-slate-900/70 border border-slate-700 rounded-xl text-center">
                      <div className="text-xs text-slate-400 mb-1">घातको घात</div>
                      <div className="text-2xl font-mono font-bold text-teal-300">
                        ({fmt(baseA)}<sup className="text-amber-400 text-base">{fmt(expM)}</sup>)<sup className="text-amber-400 text-lg">{fmt(expN)}</sup>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-900/70 border border-slate-700 rounded-xl space-y-2">
                      <div className="text-xs text-slate-400">विस्तार (घाताङ्कहरूको गुणन):</div>
                      <div className="text-sm font-mono text-slate-200">
                        = {fmt(baseA)}<sup className="text-amber-300">{fmt(expM)} × {fmt(expN)}</sup> = {fmt(baseA)}<sup className="text-amber-300">{fmt(expM * expN)}</sup>
                      </div>
                    </div>

                    <div className="p-3 bg-teal-900/50 border border-teal-500/50 rounded-xl text-center">
                      <span className="text-xs text-teal-200 block">Final numerical value:</span>
                      <span className="text-2xl font-black font-mono text-teal-300">
                        {fmt(Math.pow(baseA, expM * expN))}
                      </span>
                    </div>
                  </div>
                )}

                {/* POWER OF A PRODUCT */}
                {selectedLaw === 'powerOfProduct' && (
                  <div className="my-4 space-y-4">
                    <div className="p-4 bg-slate-900/70 border border-slate-700 rounded-xl text-center">
                      <div className="text-xs text-slate-400 mb-1">गुणनफलको घात</div>
                      <div className="text-2xl font-mono font-bold text-teal-300">
                        ({fmt(baseA)} × 3)<sup className="text-amber-400 text-lg">{fmt(expM)}</sup>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-900/70 border border-slate-700 rounded-xl space-y-2">
                      <div className="text-xs text-slate-400">वित्तीय नियम अनुसार घात वितरण:</div>
                      <div className="text-sm font-mono text-slate-200">
                        = {fmt(baseA)}<sup className="text-amber-300">{fmt(expM)}</sup> × 3<sup className="text-amber-300">{fmt(expM)}</sup>
                      </div>
                    </div>

                    <div className="p-3 bg-teal-900/50 border border-teal-500/50 rounded-xl text-center">
                      <span className="text-xs text-teal-200 block">अन्तिम मान:</span>
                      <span className="text-2xl font-black font-mono text-teal-300">
                        {fmt(Math.pow(baseA * 3, expM))}
                      </span>
                    </div>
                  </div>
                )}

                <div className="w-full flex justify-between text-xs text-slate-400 border-t border-slate-700/60 pt-2">
                  <span>{L('आधार (Base a):', 'Base (a):')} {fmt(baseA)}</span>
                  <span>{L('घाताङ्कहरू (Exponents):', 'Exponents:')} m={fmt(expM)}, n={fmt(expN)}</span>
                </div>
              </div>

              {/* Controls Column */}
              <div className="md:col-span-5 space-y-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
                  <h4 className="font-bold text-sm text-[#142D4E]">
                    {L('आधार र घाताङ्क नियन्त्रक:', 'Base & Exponents Controls:')}
                  </h4>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{L('आधार (Base a):', 'Base (a):')}</span>
                      <span className="text-[#167C80] font-bold font-mono">{fmt(baseA)}</span>
                    </div>
                    <div className="flex gap-2 mt-1">
                      {[2, 3, 5, 10].map((b) => (
                        <button
                          key={b}
                          onClick={() => setBaseA(b)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                            baseA === b ? 'bg-[#167C80] text-white border-[#167C80]' : 'bg-slate-50 text-slate-700'
                          }`}
                        >
                          {fmt(b)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{L('पहिलो घाताङ्क (Exponent m):', 'First Exponent (m):')}</span>
                      <span className="text-amber-600 font-bold font-mono">{fmt(expM)}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={expM}
                      onChange={(e) => setExpM(Number(e.target.value))}
                      className="w-full accent-amber-600"
                    />
                  </div>

                  {selectedLaw !== 'powerOfProduct' && (
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{L('दोस्रो घाताङ्क (Exponent n):', 'Second Exponent (n):')}</span>
                        <span className="text-indigo-600 font-bold font-mono">{fmt(expN)}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="4"
                        step="1"
                        value={expN}
                        onChange={(e) => setExpN(Number(e.target.value))}
                        className="w-full accent-indigo-600"
                      />
                    </div>
                  )}
                </div>

                <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 leading-relaxed">
                  <strong className="block mb-1 font-bold">💡 {L('स्मरण रहोस् (Rule Tip):', 'Rule Tip:')}</strong>
                  {L(
                    'आधार एउटै हुँदा मात्र गुणनमा घाताङ्क जोडिन्छ (aᵐ · aⁿ = aᵐ⁺ⁿ) र भागमा घटाइन्छ (aᵐ ÷ aⁿ = aᵐ⁻ⁿ)। आधार फरक भएमा यो नियम सिधै लागू हुँदैन।',
                    'The product and quotient laws apply only when the base is the same. Exponents are added during multiplication and subtracted during division.'
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 2: ZERO & NEGATIVE INDICES
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'zeroNegative' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-5">
            <div>
              <h4 className="font-bold text-sm text-[#142D4E] mb-1">
                {L('शून्य तथा ऋणात्मक घाताङ्कको सिँढी ढाँचा (Descending Exponent Ladder)', 'Descending Exponent Ladder')}
              </h4>
              <p className="text-xs text-slate-600">
                {L(
                  'घाताङ्क 1 ले घट्दा अघिल्लो मानलाई आधारले भाग गरिन्छ। यस ढाँचाले किन a⁰ = 1 र a⁻ⁿ = 1/aⁿ हुन्छ भन्ने कुरा प्रत्यक्ष प्रमाणित गर्छ।',
                  'As the exponent decreases by 1, the value is divided by the base. This pattern demonstrates why a⁰ = 1 and a⁻ⁿ = 1/aⁿ.'
                )}
              </p>
            </div>

            {/* Base Selector */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 border rounded-xl">
              <span className="text-xs font-bold text-slate-700">{L('आधार (Base a):', 'Base (a):')}</span>
              {[2, 3, 5, 10].map((b) => (
                <button
                  key={b}
                  onClick={() => {
                    kit.tap();
                    setDescendingBase(b);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    descendingBase === b ? 'bg-[#167C80] text-white shadow-sm' : 'bg-white border text-slate-700'
                  }`}
                >
                  {fmt(b)}
                </button>
              ))}
            </div>

            {/* Descending Ladder Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-xs font-mono">
                  <thead className="bg-[#142D4E] text-white font-sans">
                    <tr>
                      <th className="p-2.5 text-left">Power</th>
                      <th className="p-2.5 text-left">Operation</th>
                      <th className="p-2.5 text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    <tr className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-700">{fmt(descendingBase)}³</td>
                      <td className="p-2.5 text-slate-500">{fmt(descendingBase)} × {fmt(descendingBase)} × {fmt(descendingBase)}</td>
                      <td className="p-2.5 text-right font-bold text-slate-800">{fmt(Math.pow(descendingBase, 3))}</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-700">{fmt(descendingBase)}²</td>
                      <td className="p-2.5 text-slate-500">÷ {fmt(descendingBase)}</td>
                      <td className="p-2.5 text-right font-bold text-slate-800">{fmt(Math.pow(descendingBase, 2))}</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-700">{fmt(descendingBase)}¹</td>
                      <td className="p-2.5 text-slate-500">÷ {fmt(descendingBase)}</td>
                      <td className="p-2.5 text-right font-bold text-slate-800">{fmt(descendingBase)}</td>
                    </tr>
                    <tr className="bg-amber-50/80 font-bold">
                      <td className="p-2.5 text-amber-800">{fmt(descendingBase)}⁰</td>
                      <td className="p-2.5 text-amber-700">{fmt(descendingBase)} ÷ {fmt(descendingBase)}</td>
                      <td className="p-2.5 text-right text-base text-amber-800">1 (1)</td>
                    </tr>
                    <tr className="bg-rose-50/80 font-bold">
                      <td className="p-2.5 text-rose-800">{fmt(descendingBase)}⁻¹</td>
                      <td className="p-2.5 text-rose-700">1 ÷ {fmt(descendingBase)}</td>
                      <td className="p-2.5 text-right text-rose-800">1/{fmt(descendingBase)}</td>
                    </tr>
                    <tr className="bg-rose-50/80 font-bold">
                      <td className="p-2.5 text-rose-800">{fmt(descendingBase)}⁻²</td>
                      <td className="p-2.5 text-rose-700">(1/{fmt(descendingBase)}) ÷ {fmt(descendingBase)}</td>
                      <td className="p-2.5 text-right text-rose-800">1/{fmt(descendingBase * descendingBase)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Rules Summary Card */}
              <div className="space-y-3">
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-1">
                  <span className="text-xs font-bold text-amber-900 block font-sans">
                    1. Zero exponent law
                  </span>
                  <div className="text-lg font-mono font-black text-amber-800">a⁰ = 1</div>
                  <p className="text-xs text-amber-900 font-sans mt-1">
                    {L(
                      `कुनै पनि गैर-शून्य संख्याको घात 0 हुँदा यसको मान सधैँ 1 हुन्छ। जस्तै: ${fmt(descendingBase)}⁰ = 1।`,
                      `Any non-zero base raised to the power of 0 equals 1.`
                    )}
                  </p>
                </div>

                <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl space-y-1">
                  <span className="text-xs font-bold text-rose-900 block font-sans">
                    2. Negative exponent law
                  </span>
                  <div className="text-lg font-mono font-black text-rose-800">a⁻ⁿ = 1 / aⁿ  (where a ≠ 0)</div>
                  <p className="text-xs text-rose-900 font-sans mt-1">
                    {L(
                      `ऋणात्मक घाताङ्कले संख्याको व्युत्क्रम (Reciprocal) जनाउँछ। जस्तै: ${fmt(descendingBase)}⁻² = 1/${fmt(descendingBase)}² = 1/${fmt(descendingBase * descendingBase)}।`,
                      `A negative exponent denotes the reciprocal of the power.`
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 3: FRACTIONAL INDICES & ROOTS
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'fractional' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-5">
            <div>
              <h4 className="font-bold text-sm text-[#142D4E] mb-1">
                {L('भिन्न घाताङ्क र करणी मूल (Fractional Exponents & Radical Roots)', 'Fractional Exponents & Radical Roots')}
              </h4>
              <p className="text-xs text-slate-600">
                {L(
                  'भिन्न घाताङ्कमा हर (Denominator n) ले मूल (Root) र अंश (Numerator m) ले घात (Power) जनाउँछ: a^(m/n) = ⁿ√(aᵐ) = (ⁿ√a)ᵐ',
                  'In a fractional exponent, the denominator n indicates the root and the numerator m indicates the power.'
                )}
              </p>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-2">
              {fracPresets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    kit.tap();
                    setFracPresetIdx(idx);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                    fracPresetIdx === idx
                      ? 'bg-[#142D4E] text-white shadow-sm'
                      : 'bg-slate-50 border text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {p.expr.split('=')[0].trim()}
                </button>
              ))}
            </div>

            {/* Active Fractional Breakdown Card */}
            <div className="p-5 bg-teal-50 border border-teal-200 rounded-xl space-y-4 font-mono">
              <div className="text-base font-bold text-teal-900 font-sans border-b border-teal-200 pb-2">
                {fracPresets[fracPresetIdx].expr}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans text-xs">
                <div className="p-3 bg-white border border-teal-200 rounded-lg">
                  <span className="text-slate-400 block text-xs">Step 1: The denominator indicates the root</span>
                  <div className="font-bold font-mono text-teal-800 text-sm mt-0.5">
                    {fmt(fracPresets[fracPresetIdx].n)}√{fmt(fracPresets[fracPresetIdx].base)} = {fmt(fracPresets[fracPresetIdx].root)}
                  </div>
                </div>

                <div className="p-3 bg-white border border-teal-200 rounded-lg">
                  <span className="text-slate-400 block text-xs">Step 2: The numerator indicates the power</span>
                  <div className="font-bold font-mono text-teal-800 text-sm mt-0.5">
                    ({fmt(fracPresets[fracPresetIdx].root)})<sup className="text-amber-600">{fmt(fracPresets[fracPresetIdx].m)}</sup>
                  </div>
                </div>

                <div className="p-3 bg-teal-100 border border-teal-300 rounded-lg">
                  <span className="text-teal-700 block text-xs font-bold">Step 3: Final result</span>
                  <div className="font-bold font-mono text-[#142D4E] text-base mt-0.5">
                    = {fmt(fracPresets[fracPresetIdx].final)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 4: EXPONENTIAL EQUATIONS LABORATORY
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'equations' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-5">
            <div>
              <h4 className="font-bold text-sm text-[#142D4E] mb-1">
                {L('घाताङ्कीय समीकरण समाधान प्रयोगशाला (Exponential Equations Laboratory)', 'Exponential Equations Laboratory')}
              </h4>
              <p className="text-xs text-slate-600">
                {L(
                  'यदि a^x = a^k भए, x = k हुन्छ। पाठ्यपुस्तकका विभिन्न प्रकारका घाताङ्कीय समीकरणहरू तल छानी चरणबद्ध समाधान हेर्नुहोस्।',
                  'If a^x = a^k (where a > 0, a ≠ 1), then x = k. Select textbook equations below to study step-by-step solutions.'
                )}
              </p>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {eqPresets.map((eq, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    kit.tap();
                    setSelectedEqIdx(idx);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedEqIdx === idx
                      ? 'bg-[#167C80] text-white border-[#167C80] font-bold shadow-md'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-xs">{isNe ? eq.titleNp : eq.titleEn}</div>
                </button>
              ))}
            </div>

            {/* Step-by-Step Working Card */}
            <div className="p-4 bg-slate-50 border rounded-xl space-y-3 font-mono text-xs sm:text-sm">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-bold text-base text-[#142D4E]">
                  {eqPresets[selectedEqIdx].eqStr}
                </span>
                <span className="text-xs bg-teal-100 text-teal-800 px-2.5 py-1 rounded-full font-bold font-sans">
                  {isNe ? eqPresets[selectedEqIdx].finalNp : eqPresets[selectedEqIdx].finalEn}
                </span>
              </div>

              <div className="p-3 bg-white border rounded-lg">
                <span className="text-slate-400 block text-xs font-sans">Step 1:</span>
                <span>{isNe ? eqPresets[selectedEqIdx].step1Np : eqPresets[selectedEqIdx].step1En}</span>
              </div>

              <div className="p-3 bg-white border rounded-lg">
                <span className="text-slate-400 block text-xs font-sans">Step 2:</span>
                <span>{isNe ? eqPresets[selectedEqIdx].step2Np : eqPresets[selectedEqIdx].step2En}</span>
              </div>

              <div className="p-3 bg-white border rounded-lg">
                <span className="text-slate-400 block text-xs font-sans">Step 3:</span>
                <span>{isNe ? eqPresets[selectedEqIdx].step3Np : eqPresets[selectedEqIdx].step3En}</span>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <span className="text-emerald-700 block text-xs font-sans font-bold">Verification of the equation:</span>
                <span className="text-emerald-800 font-bold">{isNe ? eqPresets[selectedEqIdx].checkNp : eqPresets[selectedEqIdx].checkEn}</span>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 5: PRACTICE CHALLENGE
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'challenge' && (
          <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#167C80]">
                {L(`प्रश्न ${fmt(quizIdx + 1)} / ${fmt(quizQuestions.length)}`, `Question ${fmt(quizIdx + 1)} of ${fmt(quizQuestions.length)}`)}
              </span>
              <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                {L(`प्राप्ताङ्क: ${fmt(score)}`, `Score: ${fmt(score)}`)}
              </span>
            </div>

            <h3 className="text-base font-bold text-[#142D4E] mb-4">
              {isNe ? quizQuestions[quizIdx].qNp : quizQuestions[quizIdx].qEn}
            </h3>

            <div className="space-y-2.5 mb-5">
              {(isNe && quizQuestions[quizIdx].optionsNp ? quizQuestions[quizIdx].optionsNp : quizQuestions[quizIdx].options).map(
                (opt, oIdx) => {
                  const isSelected = selectedAns === oIdx;
                  const isCorrect = oIdx === quizQuestions[quizIdx].correct;
                  let btnStyle = 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100';

                  if (selectedAns !== null) {
                    if (isSelected && isCorrect) btnStyle = 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold';
                    else if (isSelected && !isCorrect) btnStyle = 'bg-rose-100 border-rose-400 text-rose-900 font-bold';
                    else if (isCorrect) btnStyle = 'bg-emerald-50 border-emerald-300 text-emerald-800';
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectAnswer(oIdx)}
                      disabled={selectedAns !== null}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all ${btnStyle}`}
                    >
                      {opt}
                    </button>
                  );
                }
              )}
            </div>

            {quizFeedback && (
              <div
                className={`p-3.5 rounded-xl mb-4 text-xs ${
                  selectedAns === quizQuestions[quizIdx].correct
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                <div className="font-bold mb-1">{quizFeedback}</div>
                <div>{isNe ? quizQuestions[quizIdx].hintNp : quizQuestions[quizIdx].hintEn}</div>
              </div>
            )}

            {selectedAns !== null && (
              <div className="flex justify-end">
                <button
                  onClick={handleNextQuiz}
                  className="px-5 py-2.5 bg-[#142D4E] text-white rounded-xl text-xs sm:text-sm font-bold shadow hover:bg-slate-800 transition-all"
                >
                  {L('अर्को प्रश्न →', 'Next Question →')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default IndicesExplorer;
