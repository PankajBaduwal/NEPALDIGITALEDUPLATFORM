import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';

interface ProblemScenario {
  id: string;
  type: 'simultaneous' | 'quadratic';
  titleEn: string;
  titleNp: string;
  category: string;
  storyEn: string;
  storyNp: string;
  variableDefsEn: string[];
  variableDefsNp: string[];
  equationsEn: string[];
  equationsNp: string[];
  methodStepsEn: string[];
  methodStepsNp: string[];
  solutionTextEn: string;
  solutionTextNp: string;
  solutionVals: { x: number; y?: number };
}

const SCENARIOS: ProblemScenario[] = [
  {
    id: 's1',
    type: 'simultaneous',
    titleEn: 'Sum and Difference of Numbers',
    titleNp: 'दुई संख्याहरूको जोड र अन्तर',
    category: 'Numbers',
    storyEn: 'The sum of two numbers is 16 and their difference is 4. Find the two numbers.',
    storyNp: 'दुई संख्याहरूको जोड 16 छ र तिनीहरूको फरक 4 छ। ती दुई संख्याहरू पत्ता लगाउनुहोस्।',
    variableDefsEn: ['Let the larger number = x', 'Let the smaller number = y'],
    variableDefsNp: ['ठूलो संख्या = x मानौं', 'सानो संख्या = y मानौं'],
    equationsEn: ['Equation (1): x + y = 16', 'Equation (2): x - y = 4'],
    equationsNp: ['समीकरण (1): x + y = 16', 'समीकरण (2): x - y = 4'],
    methodStepsEn: [
      'Add equation (1) and (2): (x + y) + (x - y) = 16 + 4',
      '2x = 20 => x = 10',
      'Substitute x = 10 into equation (1): 10 + y = 16 => y = 6',
      'Check: 10 + 6 = 16 and 10 - 6 = 4. Verified!'
    ],
    methodStepsNp: [
      'समीकरण (1) र (2) जोड्दा: (x + y) + (x - y) = 16 + 4',
      '2x = 20 => x = 10',
      'x = 10 समीकरण (1) मा राख्दा: 10 + y = 16 => y = 6',
      'जाँच: 10 + 6 = 16 र 10 - 6 = 4। प्रमाणित भयो!'
    ],
    solutionTextEn: 'The larger number is 10 and the smaller number is 6.',
    solutionTextNp: 'ठूलो संख्या 10 र सानो संख्या 6 हुन्।',
    solutionVals: { x: 10, y: 6 }
  },
  {
    id: 's2',
    type: 'simultaneous',
    titleEn: 'Stationery Shopping: Notebooks & Pens',
    titleNp: 'स्टेशनरी किनमेल: कापी र कलम',
    category: 'Shopping & Cost',
    storyEn: 'The cost of 2 notebooks and 3 pens is Rs. 140. The cost of 3 notebooks and 2 pens is Rs. 160. Find the cost of 1 notebook and 1 pen.',
    storyNp: '2 pcs कापी र 3 pcs कलमको जम्मा मूल्य Rs. 140 पर्छ। 3 pcs कापी र 2 pcs कलमको जम्मा मूल्य Rs. 160 पर्छ। एउटा कापी र एउटा कलमको मूल्य कति पर्ला?',
    variableDefsEn: ['Cost of 1 notebook = x', 'Cost of 1 pen = y'],
    variableDefsNp: ['1 pcs कापीको मूल्य = x', '1 pcs कलमको मूल्य = y'],
    equationsEn: ['Equation (1): 2x + 3y = 140', 'Equation (2): 3x + 2y = 160'],
    equationsNp: ['समीकरण (1): 2x + 3y = 140', 'समीकरण (2): 3x + 2y = 160'],
    methodStepsEn: [
      'Multiply Eq(1) by 3: 6x + 9y = 420',
      'Multiply Eq(2) by 2: 6x + 4y = 320',
      'Subtract: (6x + 9y) - (6x + 4y) = 420 - 320 => 5y = 100 => y = 20',
      'Substitute y = 20 into Eq(1): 2x + 3(20) = 140 => 2x = 80 => x = 40'
    ],
    methodStepsNp: [
      'समीकरण (1) लाई 3 ले गुणन गर्दा: 6x + 9y = 420',
      'समीकरण (2) लाई 2 ले गुणन गर्दा: 6x + 4y = 320',
      'घटाउँदा: (6x + 9y) - (6x + 4y) = 420 - 320 => 5y = 100 => y = 20',
      'y = 20 समीकरण (1) मा राख्दा: 2x + 3(20) = 140 => 2x = 80 => x = 40'
    ],
    solutionTextEn: '1 Notebook costs Rs. 40 and 1 Pen costs Rs. 20.',
    solutionTextNp: '1 pcs कापीको मूल्य Rs. 40 र 1 pcs कलमको मूल्य Rs. 20 पर्छ।',
    solutionVals: { x: 40, y: 20 }
  },
  {
    id: 's3',
    type: 'simultaneous',
    titleEn: 'Father and Son Age Problem',
    titleNp: 'बुबा र छोराको उमेर समस्या',
    category: 'Ages',
    storyEn: 'The present age of a father is 4 times the age of his son. The sum of their ages is 50 years. Find their present ages.',
    storyNp: 'बुबाको हालको उमेर छोराको उमेरको 4 गुणा छ। तिनीहरूको उमेरको जोड 50 वर्ष छ भने दुवैको हालको उमेर पत्ता लगाउनुहोस्।',
    variableDefsEn: ['Let son’s age = y years', 'Father’s age = x years'],
    variableDefsNp: ['छोराको उमेर = y वर्ष', 'बुबाको उमेर = x वर्ष'],
    equationsEn: ['Equation (1): x = 4y', 'Equation (2): x + y = 50'],
    equationsNp: ['समीकरण (1): x = 4y', 'समीकरण (2): x + y = 50'],
    methodStepsEn: [
      'Substitute x = 4y into Equation (2): 4y + y = 50',
      '5y = 50 => y = 10 years (son)',
      'Father: x = 4(10) = 40 years',
      'Check: 40 + 10 = 50 and 40 = 4 × 10. Verified!'
    ],
    methodStepsNp: [
      'समीकरण (2) मा x = 4y प्रतिस्थापन गर्दा: 4y + y = 50',
      '5y = 50 => y = 10 वर्ष (छोरा)',
      'बुबाको उमेर: x = 4(10) = 40 वर्ष',
      'जाँच: 40 + 10 = 50 र 40 = 4 × 10। प्रमाणित भयो!'
    ],
    solutionTextEn: 'Father is 40 years old and son is 10 years old.',
    solutionTextNp: 'बुबाको उमेर 40 वर्ष र छोराको उमेर 10 वर्ष छ।',
    solutionVals: { x: 40, y: 10 }
  },
  {
    id: 's4',
    type: 'quadratic',
    titleEn: 'Rectangular Garden Dimensions',
    titleNp: 'आयताकार बगैँचाको लम्बाइ र चौडाइ',
    category: 'Geometry / Area',
    storyEn: 'The length of a rectangular garden is 3 m more than its breadth. If the area of the garden is 40 sq m, find its length and breadth.',
    storyNp: 'एउटा आयताकार बगैँचाको लम्बाइ त्यसको चौडाइभन्दा 3 m बढी छ। यदि बगैँचाको क्षेत्रफल 40 sq m भए, लम्बाइ र चौडाइ कति होला?',
    variableDefsEn: ['Let breadth = x m', 'Length = (x + 3) m'],
    variableDefsNp: ['चौडाइ = x m', 'लम्बाइ = (x + 3) m'],
    equationsEn: ['Area = Length × Breadth = 40', 'x(x + 3) = 40 => x² + 3x - 40 = 0'],
    equationsNp: ['क्षेत्रफल = लम्बाइ × चौडाइ = 40', 'x(x + 3) = 40 => x² + 3x - 40 = 0'],
    methodStepsEn: [
      'Quadratic equation: x² + 3x - 40 = 0',
      'Split middle term: 8 × (-5) = -40 and 8 - 5 = 3',
      'x² + 8x - 5x - 40 = 0 => x(x + 8) - 5(x + 8) = 0',
      '(x - 5)(x + 8) = 0 => x = 5 or x = -8',
      'Since breadth cannot be negative, x = 5 m',
      'Length = x + 3 = 5 + 3 = 8 m'
    ],
    methodStepsNp: [
      'द्विघात समीकरण: x² + 3x - 40 = 0',
      'मध्य पद विभाजन: 8 × (-5) = -40 र 8 - 5 = 3',
      'x² + 8x - 5x - 40 = 0 => x(x + 8) - 5(x + 8) = 0',
      '(x - 5)(x + 8) = 0 => x = 5 वा x = -8',
      'लम्बाइ वा चौडाइ ऋणात्मक हुन नसक्ने भएकाले, x = 5 m',
      'लम्बाइ = x + 3 = 5 + 3 = 8 m'
    ],
    solutionTextEn: 'Breadth is 5 m and Length is 8 m (Area = 5 × 8 = 40 m²).',
    solutionTextNp: 'चौडाइ 5 m र लम्बाइ 8 m छ (क्षेत्रफल = 5 × 8 = 40 sq m)।',
    solutionVals: { x: 5, y: 8 }
  }
];

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'यदि दुई संख्याहरूको जोड 10 र फरक 2 भए ती संख्याहरू के के हुन्?',
    en: 'If the sum of two numbers is 10 and difference is 2, what are the numbers?',
    options: [
      { key: 'A', label: '7 and 3' },
      { key: 'B', label: '6 and 4' },
      { key: 'C', label: '8 and 2' },
      { key: 'D', label: '5 and 5' }
    ],
    answer: 'B'
  },
  {
    np: 'लम्बाइ वा उमेरसम्बन्धी समस्यामा ऋणात्मक मूल (जस्तै x = -8) किन अमान्य गरिन्छ?',
    en: 'Why do we discard negative roots (e.g. x = -8) in geometric word problems for length or age?',
    options: [
      { key: 'A', label: 'A negative number has no square' },
      { key: 'B', label: 'Physical length and age cannot be negative' },
      { key: 'C', label: 'The zero multiplication rule does not allow it' },
      { key: 'D', label: 'It is an imaginary number' }
    ],
    answer: 'B'
  },
  {
    np: '2x + y = 7 र x - y = 2 बाट y हटाउन के गर्नुपर्छ?',
    en: 'To eliminate y from 2x + y = 7 and x - y = 2, we should:',
    options: [
      { key: 'A', label: 'Add both equations' },
      { key: 'B', label: 'Subtract the equations' },
      { key: 'C', label: 'Multiply by 0' },
      { key: 'D', label: 'Divide by 2' }
    ],
    answer: 'A'
  }
];

export const EquationSolverRealLifeChallenge: React.FC<{
  onBack?: () => void;
  onBackToLibrary?: () => void;
}> = ({ onBack, onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U12-03',
    chapter: 12,
    titleNp: 'समीकरण व्यावहारिक समस्या समाधान',
    titleEn: 'Real-Life Equation Solver Challenge'
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('s1');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [userAnswerX, setUserAnswerX] = useState<string>('');
  const [userAnswerY, setUserAnswerY] = useState<string>('');
  const [verdict, setVerdict] = useState<string | null>(null);

  const activeScenario = SCENARIOS.find((s) => s.id === selectedScenarioId) || SCENARIOS[0];

  const handleCheckAnswer = () => {
    const xVal = parseFloat(userAnswerX);
    const yVal = parseFloat(userAnswerY);

    const xCorrect = Math.abs(xVal - activeScenario.solutionVals.x) < 0.01;
    let yCorrect = true;
    if (activeScenario.solutionVals.y !== undefined) {
      yCorrect = Math.abs(yVal - activeScenario.solutionVals.y) < 0.01;
    }

    if (xCorrect && yCorrect) {
      setVerdict('correct');
      kit.good();
    } else {
      setVerdict('incorrect');
      kit.oops();
    }
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! दैनिक जीवनका समस्याहरूलाई समीकरणमा ढालेर समाधान गर्न सिक्नुहोस्!',
        'Hello! Learn to translate everyday situations into simultaneous and quadratic equations!'
      )}
    >
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Scenario Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
            {L('व्यावहारिक समस्या चयन गर्नुहोस्:', 'Select Real-Life Scenario:')}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedScenarioId(s.id);
                  setCurrentStep(0);
                  setVerdict(null);
                  setUserAnswerX('');
                  setUserAnswerY('');
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedScenarioId === s.id
                    ? 'bg-amber-500/20 border-amber-400 text-white shadow-md shadow-amber-500/10'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="text-xs text-amber-400 font-semibold">{s.category}</div>
                <div className="font-bold text-sm text-slate-100 mt-1">{isNe ? s.titleNp : s.titleEn}</div>
                <div className="text-xs px-2 py-0.5 rounded-full inline-block mt-2 bg-slate-900 border border-slate-700 text-slate-400">
                  {s.type === 'simultaneous' ? L('युगपत (Simultaneous)', 'Simultaneous') : L('द्विघात (Quadratic)', 'Quadratic')}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Problem Story Card */}
        <div className="p-5 bg-gradient-to-br from-slate-900 via-slate-900/90 to-amber-950/30 rounded-2xl border border-amber-500/30 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📖</span>
            <div>
              <h3 className="font-bold text-amber-300 text-lg">{isNe ? activeScenario.titleNp : activeScenario.titleEn}</h3>
              <p className="text-sm text-slate-200 mt-1">{isNe ? activeScenario.storyNp : activeScenario.storyEn}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
              <span className="text-xs font-semibold text-slate-400 block mb-1">
                {L('चल राशिहरू (Variables):', 'Defined Variables:')}
              </span>
              <ul className="text-xs text-amber-200 space-y-1 font-mono">
                {(isNe ? activeScenario.variableDefsNp : activeScenario.variableDefsEn).map((v, i) => (
                  <li key={i}>• {v}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
              <span className="text-xs font-semibold text-slate-400 block mb-1">
                {L('प्राप्त समीकरणहरू (Formed Equations):', 'Formed Equations:')}
              </span>
              <ul className="text-xs text-emerald-300 space-y-1 font-mono">
                {(isNe ? activeScenario.equationsNp : activeScenario.equationsEn).map((eq, i) => (
                  <li key={i}>• {eq}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Interactive Step-by-Step Solver */}
        <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-700 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-200 text-sm">
              {L('चरणबद्ध समाधान प्रक्रिया', 'Step-by-Step Solution Procedure')}
            </h4>
            <div className="flex gap-2">
              <button
                disabled={currentStep === 0}
                onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 disabled:opacity-40"
              >
                {L('पछाडि', 'Previous')}
              </button>
              <button
                disabled={currentStep >= (isNe ? activeScenario.methodStepsNp : activeScenario.methodStepsEn).length - 1}
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-xs text-white font-semibold disabled:opacity-40"
              >
                {L('अर्को चरण', 'Next Step')}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {(isNe ? activeScenario.methodStepsNp : activeScenario.methodStepsEn).slice(0, currentStep + 1).map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 animate-fadeIn"
              >
                <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="text-sm text-slate-200 font-mono">{step}</div>
              </div>
            ))}
          </div>

          {currentStep >= (isNe ? activeScenario.methodStepsNp : activeScenario.methodStepsEn).length - 1 && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl">
              <div className="text-xs uppercase font-bold text-emerald-400">
                {L('अन्तिम उत्तर (Final Solution):', 'Final Solution:')}
              </div>
              <div className="text-emerald-200 text-sm font-semibold mt-1">
                {isNe ? activeScenario.solutionTextNp : activeScenario.solutionTextEn}
              </div>
            </div>
          )}
        </div>

        {/* Practice & Verification Studio */}
        <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-700 space-y-4">
          <h4 className="font-bold text-slate-200 text-sm">
            {L('आफैं प्रयास गर्नुहोस् र उत्तर जाँच्नुहोस्', 'Try It Yourself & Verify')}
          </h4>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-300 font-mono">
                {activeScenario.type === 'simultaneous' ? 'x = ' : L('चौडाइ/मान x = ', 'Breadth/x = ')}
              </span>
              <input
                type="number"
                value={userAnswerX}
                onChange={(e) => setUserAnswerX(e.target.value)}
                placeholder="x"
                className="w-24 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:border-amber-400 outline-none"
              />
            </div>

            {activeScenario.solutionVals.y !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-300 font-mono">
                  {activeScenario.type === 'simultaneous' ? 'y = ' : L('लम्बाइ y = ', 'Length y = ')}
                </span>
                <input
                  type="number"
                  value={userAnswerY}
                  onChange={(e) => setUserAnswerY(e.target.value)}
                  placeholder="y"
                  className="w-24 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:border-amber-400 outline-none"
                />
              </div>
            )}

            <button
              onClick={handleCheckAnswer}
              className="px-5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition-all"
            >
              {L('जाँच गर्नुहोस्', 'Check Answer')}
            </button>
          </div>

          {verdict && (
            <div
              className={`p-3 rounded-xl border text-sm font-bold ${
                verdict === 'correct'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}
            >
              {verdict === 'correct'
                ? L('🎉 बधाई छ! तपाईंको उत्तर सही छ!', '🎉 Congratulations! Your answer is correct!')
                : L('❌ उत्तर मिलेन! कृपया माथिको चरणबद्ध विधि हेर्नुहोस्।', '❌ Incorrect! Please check the steps above.')}
            </div>
          )}
        </div>
      </div>
    </SimFrame2D>
  );
};
export default EquationSolverRealLifeChallenge;
