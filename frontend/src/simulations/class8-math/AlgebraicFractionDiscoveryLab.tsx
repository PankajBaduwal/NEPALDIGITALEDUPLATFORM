/**
 * AlgebraicFractionDiscoveryLab.tsx
 * Grade 8 Mathematics – Unit 11: ALGEBRAIC FRACTION (बीजीय भिन्न)
 * Simulation 1: Algebraic Fraction Discovery Lab (बीजीय भिन्न खोजी प्रयोगशाला)
 * Strictly adheres to CDC Nepal Grade 8 Mathematics Curriculum (2023 edition, Unit 11)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Divide, AlertTriangle, CheckCircle, RefreshCw, Award, Scissors, FileQuestion } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'बीजीय भिन्नको सरलीकरण गर्दा कुन प्रक्रिया अनिवार्य गर्नुपर्छ?',
    en: 'What process must be done before simplifying an algebraic fraction?',
    options: [
      { key: 'A', label: 'पहिले अंश र हरको खण्डीकरण गर्ने (Factorize numerator and denominator)' },
      { key: 'B', label: 'जोड वा घटाउमा रहेका पदहरू सिधै काट्ने' },
      { key: 'C', label: 'अंश र हरलाई जोड्ने' },
      { key: 'D', label: 'चलराशि हटाउने' },
    ],
    answer: 'A',
  },
  {
    np: '(x² - 1) / (x² + x) लाई सरलीकरण गर्दा कुन साझा गुणनखण्ड काटिन्छ?',
    en: 'In simplifying (x² - 1) / (x² + x), which common factor is cancelled?',
    options: [
      { key: 'A', label: 'x + 1 [ (x+1)(x-1) / x(x+1) ⇒ (x-1)/x ]' },
      { key: 'B', label: 'x - 1' },
      { key: 'C', label: 'x' },
      { key: 'D', label: 'x²' },
    ],
    answer: 'A',
  },
  {
    np: '(x² - 5x + 6) / (x² - 2x) को सरलीकृत मान कति हुन्छ?',
    en: 'What is the simplified form of (x² - 5x + 6) / (x² - 2x)?',
    options: [
      { key: 'A', label: '(x - 3) / x [ (x-2)(x-3) / x(x-2) ]' },
      { key: 'B', label: '(x - 2) / x' },
      { key: 'C', label: '(x + 3) / x' },
      { key: 'D', label: '(x - 3) / (x - 2)' },
    ],
    answer: 'A',
  },
  {
    np: '(x + 5) / x मा x लाई x सँग काट्न किन मिल्दैन?',
    en: 'Why CANNOT x be cancelled with x in (x + 5) / x?',
    options: [
      { key: 'A', label: 'किनकि अंशमा x गुणनखण्ड होइन, जोडिएको पद (Term) हो' },
      { key: 'B', label: 'किनकि हरमा ५ छैन' },
      { key: 'C', label: 'काट्न मिल्छ, उत्तर ५ हुन्छ' },
      { key: 'D', label: 'किनकि x ऋणात्मक छ' },
    ],
    answer: 'A',
  },
  {
    np: '3a² / 4a³ को सरलीकृत रूप के हुन्छ?',
    en: 'What is the simplified form of 3a² / 4a³?',
    options: [
      { key: 'A', label: '3 / (4a) [ a² साझा काटिन्छ ]' },
      { key: 'B', label: '3a / 4' },
      { key: 'C', label: '3 / 4' },
      { key: 'D', label: '3a⁵ / 4' },
    ],
    answer: 'A',
  },
];

const PRESET_FRACTIONS = [
  {
    id: 1,
    titleNp: '(x² - 1) / (x² + x) [CDC उदाहरण १]',
    titleEn: '(x² - 1) / (x² + x)',
    numExpr: 'x² - 1',
    denExpr: 'x² + x',
    numFact: '(x + 1)(x - 1)',
    denFact: 'x(x + 1)',
    commonFact: 'x + 1',
    finalAns: '(x - 1) / x',
    restriction: 'x ≠ 0, x ≠ -1',
  },
  {
    id: 2,
    titleNp: '(x² - 5x + 6) / (x² - 2x) [CDC उदाहरण २]',
    titleEn: '(x² - 5x + 6) / (x² - 2x)',
    numExpr: 'x² - 5x + 6',
    denExpr: 'x² - 2x',
    numFact: '(x - 2)(x - 3)',
    denFact: 'x(x - 2)',
    commonFact: 'x - 2',
    finalAns: '(x - 3) / x',
    restriction: 'x ≠ 0, x ≠ 2',
  },
  {
    id: 3,
    titleNp: '3a² / 4a³ [एकपदीय गुणनखण्ड]',
    titleEn: '3a² / 4a³ [Monomial]',
    numExpr: '3a²',
    denExpr: '4a³',
    numFact: '3 · a · a',
    denFact: '4 · a · a · a',
    commonFact: 'a²',
    finalAns: '3 / (4a)',
    restriction: 'a ≠ 0',
  },
];

const MISTAKE_CASES = [
  {
    expr: '(x + 5) / x',
    wrong: '= 5 [x र x काटियो]',
    reasonNp: 'गल्ती: अंशमा x गुणनखण्ड (Factor) होइन, जोडिएको पद (Term) हो! पदहरूलाई काट्न मिल्दैन, केवल साझा गुणनखण्ड मात्र काट्न मिल्छ।',
    reasonEn: 'Error: x in the numerator is an added term, not a factor! Terms connected by + or - cannot be cancelled.',
  },
  {
    expr: '(x² + 4) / (x² + 2)',
    wrong: '= 4 / 2 = 2 [x² र x² काटियो]',
    reasonNp: 'गल्ती: x² पदहरूलाई काट्न मिल्दैन किनकि तिनीहरू गुणनका रूपमा छैनन्। यो भिन्न थप सरल हुँदैन।',
    reasonEn: 'Error: You cannot cancel terms connected by addition. This fraction cannot be simplified further.',
  },
];

export const AlgebraicFractionDiscoveryLab: React.FC<{
  onBack?: () => void;
  onBackToLibrary?: () => void;
}> = ({ onBack, onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U11-01',
    chapter: 11,
    titleNp: 'बीजीय भिन्न खोजी प्रयोगशाला (Algebraic Fraction Discovery Lab)',
    titleEn: 'Algebraic Fraction Discovery Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'concept' | 'cancel_steps' | 'spot_mistake' | 'challenge'>('cancel_steps');

  // Selected preset
  const [selectedPreset, setSelectedPreset] = useState(PRESET_FRACTIONS[0]);
  const [isCancelled, setIsCancelled] = useState(false);

  // Spot mistake selection
  const [selectedMistake, setSelectedMistake] = useState(MISTAKE_CASES[0]);

  // Challenge State
  const [chalChoice, setChalChoice] = useState<string | null>(null);
  const [chalFeedback, setChalFeedback] = useState<{ isCorrect: boolean; msg: string } | null>(null);

  const handleCheckChallenge = (choice: string) => {
    setChalChoice(choice);
    if (choice === 'correct') {
      kit.good();
      setChalFeedback({
        isCorrect: true,
        msg: L('उत्कृष्ट! पहिले खण्डीकरण गरेर (x+2) साझा काट्दा (x+3)/x सही छ!', 'Correct! Factorizing yields (x+3)/x!'),
      });
    } else {
      kit.oops();
      setChalFeedback({
        isCorrect: false,
        msg: L('गलत! (x² + 5x + 6)/(x² + 2x) = (x+2)(x+3)/[x(x+2)] = (x+3)/x', 'Incorrect! Factorize numerator and denominator first!'),
      });
    }
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! बीजीय भिन्न भनेको अंश वा हरमा बीजीय व्यञ्जक भएको भिन्न हो। याद राख्नुहोस्: पद होइन, गुणनखण्ड मात्र काटिन्छ!',
        'Hello! An algebraic fraction has algebraic expressions in its numerator or denominator. Remember: cancel factors, never separate terms!'
      )}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('cancel_steps')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'cancel_steps' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Scissors className="w-4 h-4" />
            {L('१. खण्डीकरण र सरलीकरण (Factorize & Cancel)', '1. Factorize & Cancel')}
          </button>
          <button
            onClick={() => setActiveTab('concept')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'concept' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Divide className="w-4 h-4" />
            {L('२. बीजीय भिन्नको अवधारणा (Concept)', '2. Concept')}
          </button>
          <button
            onClick={() => setActiveTab('spot_mistake')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'spot_mistake' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            {L('३. गल्ती पत्ता लगाउनुहोस् (Spot the Mistake)', '3. Spot the Mistake')}
          </button>
          <button
            onClick={() => setActiveTab('challenge')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'challenge' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            {L('४. सरलीकरण चुनौती (Challenge)', '4. Simplification Challenge')}
          </button>
        </div>

        {/* Tab 1: Factorize and Cancel Step-by-Step */}
        {activeTab === 'cancel_steps' && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {PRESET_FRACTIONS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPreset(p);
                    setIsCancelled(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                    selectedPreset.id === p.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {isNe ? p.titleNp : p.titleEn}
                </button>
              ))}
            </div>

            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-6 font-mono">
              <div className="text-center space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  {L('मूल बीजीय भिन्न (Original Expression)', 'Original Expression')}
                </span>
                <div className="text-3xl font-black text-sky-300">
                  <span className="border-b-2 border-slate-400 px-3 pb-1 inline-block">{selectedPreset.numExpr}</span>
                  <div className="pt-1">{selectedPreset.denExpr}</div>
                </div>
              </div>

              {/* Step 1: Factorization */}
              <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-2">
                <div className="text-xs font-bold text-amber-300 font-sans uppercase">
                  {L('चरण १: अंश र हरलाई खण्डीकरण गर्ने (Factorize)', 'Step 1: Factorize Numerator and Denominator')}
                </div>
                <div className="text-xl text-white text-center py-2">
                  <span className="border-b-2 border-slate-500 px-4 pb-1 inline-block">
                    {selectedPreset.numFact}
                  </span>
                  <div className="pt-1">{selectedPreset.denFact}</div>
                </div>
              </div>

              {/* Step 2: Cancellation Action */}
              <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="text-xs font-bold text-emerald-400 font-sans uppercase">
                    {L('चरण २: साझा गुणनखण्ड काट्ने (Cancel Common Factor)', 'Step 2: Cancel Common Factor')}
                  </div>
                  <button
                    onClick={() => setIsCancelled(!isCancelled)}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    {isCancelled ? L('पुनः देखाउने', 'Reset') : L('साझा गुणनखण्ड काट्ने', 'Click to Cancel')}
                  </button>
                </div>

                <div className="text-center text-xl py-3">
                  <div className="border-b-2 border-slate-500 px-4 pb-1 inline-block">
                    {isCancelled ? (
                      <span className="line-through text-rose-400 font-bold opacity-60">
                        {selectedPreset.commonFact}
                      </span>
                    ) : (
                      <span className="bg-emerald-500/20 border border-emerald-400 px-2 py-0.5 rounded text-emerald-300">
                        {selectedPreset.commonFact}
                      </span>
                    )}
                    <span className="ml-2">{selectedPreset.numFact.replace(selectedPreset.commonFact, '').replace('()', '')}</span>
                  </div>
                  <div className="pt-1">
                    {isCancelled ? (
                      <span className="line-through text-rose-400 font-bold opacity-60">
                        {selectedPreset.commonFact}
                      </span>
                    ) : (
                      <span className="bg-emerald-500/20 border border-emerald-400 px-2 py-0.5 rounded text-emerald-300">
                        {selectedPreset.commonFact}
                      </span>
                    )}
                    <span className="ml-2">{selectedPreset.denFact.replace(selectedPreset.commonFact, '').replace('()', '')}</span>
                  </div>
                </div>
              </div>

              {/* Step 3: Final Simplified Form */}
              {isCancelled && (
                <div className="p-5 bg-emerald-950/90 border-2 border-emerald-500 rounded-2xl text-center space-y-1">
                  <div className="text-xs font-bold uppercase text-emerald-300 font-sans">
                    {L('अन्तिम सरलीकृत रूप (Final Simplified Answer)', 'Final Simplified Answer')}
                  </div>
                  <div className="text-3xl font-black text-emerald-300 py-1">
                    = {selectedPreset.finalAns}
                  </div>
                  <div className="text-xs text-slate-400 font-sans">
                    प्रतिबन्ध (Restrictions): {selectedPreset.restriction} (हर शून्य हुन नहुने)
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Concept */}
        {activeTab === 'concept' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
              <h3 className="text-lg font-bold text-slate-800">
                {L('बीजीय भिन्नको परिभाषा (Meaning of Algebraic Fractions)', 'Meaning of Algebraic Fractions')}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {L(
                  'यदि कुनै भिन्नको अंश (Numerator) वा हर (Denominator) वा दुवैमा बीजीय व्यञ्जक (Algebraic Expression) भए त्यस्तो भिन्नलाई बीजीय भिन्न भनिन्छ। जस्तै: a/b, x/(x+1), (3x)/(5y), (x²-1)/(x+1) आदि।',
                  'A fraction containing algebraic expressions in its numerator, denominator, or both is called an algebraic fraction. For example: a/b, x/(x+1), (3x)/(5y), (x²-1)/(x+1).'
                )}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl">
                  <div className="font-bold text-indigo-950 text-sm">{L('अंश (Numerator):', 'Numerator:')}</div>
                  <div className="text-xs text-slate-700 mt-1">भिन्नको माथिल्लो भाग (जस्तै 3x² वा x² - 1)</div>
                </div>
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <div className="font-bold text-emerald-950 text-sm">{L('हर (Denominator):', 'Denominator:')}</div>
                  <div className="text-xs text-slate-700 mt-1">भिन्नको तल्लो भाग (जस्तै x + 1 वा 4a³; यो कहिल्यै शून्य हुनुहुँदैन)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Spot the Mistake */}
        {activeTab === 'spot_mistake' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  {L('विद्यार्थीहरूले गर्ने साझा गल्ती (Common Student Errors)', 'Common Student Errors')}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {L('जोडिएका पदहरूलाई सिधै काट्नु गणितीय अपराध हो! तलको उदाहरण हेर्नुहोस्:', 'Cancelling terms connected by addition/subtraction is mathematically invalid!')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MISTAKE_CASES.map((m, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedMistake(m)}
                    className={`p-5 rounded-2xl border cursor-pointer transition space-y-2 ${
                      selectedMistake.expr === m.expr
                        ? 'bg-rose-50 border-rose-400 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xl font-mono font-black text-slate-800">{m.expr}</div>
                    <div className="text-sm font-mono font-bold text-rose-600">{m.wrong}</div>
                    <div className="text-xs text-slate-600">{isNe ? m.reasonNp : m.reasonEn}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Challenge */}
        {activeTab === 'challenge' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800">
                  {L('सरलीकरण चुनौती (Simplification Challenge)', 'Simplification Challenge')}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {L('व्यञ्जक: (x² + 5x + 6) / (x² + 2x) को सही सरलीकृत रूप कुन हो?', 'What is the correct simplified form of (x² + 5x + 6) / (x² + 2x)?')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => handleCheckChallenge('correct')}
                  className="p-4 rounded-xl border border-slate-200 hover:border-indigo-400 font-mono font-bold text-slate-800 text-center transition hover:bg-slate-50"
                >
                  (x + 3) / x
                </button>
                <button
                  onClick={() => handleCheckChallenge('wrong1')}
                  className="p-4 rounded-xl border border-slate-200 hover:border-indigo-400 font-mono font-bold text-slate-800 text-center transition hover:bg-slate-50"
                >
                  (5x + 6) / 2x
                </button>
                <button
                  onClick={() => handleCheckChallenge('wrong2')}
                  className="p-4 rounded-xl border border-slate-200 hover:border-indigo-400 font-mono font-bold text-slate-800 text-center transition hover:bg-slate-50"
                >
                  (x + 2) / x
                </button>
              </div>

              {chalFeedback && (
                <div
                  className={`p-4 rounded-2xl text-sm font-semibold ${
                    chalFeedback.isCorrect ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {chalFeedback.msg}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default AlgebraicFractionDiscoveryLab;
