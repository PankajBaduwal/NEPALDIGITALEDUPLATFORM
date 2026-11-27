import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const InfinityApproachingValuesExplorer: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-OPTMATH-G9-U6-01',
    chapter: 6,
    titleNp: 'अनन्त तथा नजिकिँदाको मान अन्वेषक',
    titleEn: 'Infinity and Approaching Values Explorer',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'infinity' | 'divzero' | 'indeterminate' | 'quiz'>('infinity');

  // Activity B: Division by Zero approaching 0
  const [approachSide, setApproachSide] = useState<'right' | 'left'>('right');
  const [denIndex, setDenIndex] = useState<number>(0);
  const positiveSteps = [1, 0.5, 0.1, 0.05, 0.01, 0.001, 0.0001];
  const negativeSteps = [-1, -0.5, -0.1, -0.05, -0.01, -0.001, -0.0001];

  const currentSteps = approachSide === 'right' ? positiveSteps : negativeSteps;
  const currDen = currentSteps[denIndex];
  const quotient = 5 / currDen;

  // Activity C: Indeterminate forms examples
  const [indetExample, setIndetExample] = useState<'x2_minus_4' | 'three_x' | 'x2_over_x'>('x2_minus_4');

  // Activity D: Quiz
  const [qIdx, setQIdx] = useState<number>(0);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);

  const quizItems = [
    {
      qNp: '5 ÷ 0 को गणितीय अर्थ के हो?',
      qEn: 'What is the mathematical meaning of 5 ÷ 0?',
      opts: ['0', '5', 'अपरिभाषित (Undefined)', 'अनन्त (Infinity)'],
      correct: 2,
      expNp: 'शून्यले भाग गर्न सकिँदैन, त्यसैले 5 ÷ 0 अपरिभाषित (Undefined) हुन्छ।',
      expEn: 'Division by zero is undefined in mathematics.',
    },
    {
      qNp: '0 / 0 लाई गणितमा के भनिन्छ?',
      qEn: 'What is 0 / 0 called in mathematics?',
      opts: ['0', '1', 'अनिर्धार्य रूप (Indeterminate form)', 'अनन्त (Infinity)'],
      correct: 2,
      expNp: '0/0 बाट कुनै निश्चित मान प्राप्त हुन नसक्ने भएकोले यसलाई अनिर्धार्य रूप भनिन्छ।',
      expEn: '0/0 cannot be assigned a unique value and is called an indeterminate form.',
    },
    {
      qNp: 'यदि x धनात्मक दिशाबाट ० को नजिकिँदै जान्छ (x → 0⁺) भने 1/x कहाँ पुग्छ?',
      qEn: 'As x approaches 0 from the positive side (x → 0⁺), what does 1/x approach?',
      opts: ['0', '1', '+∞ (धनात्मक अनन्त)', '-∞ (ऋणात्मक अनन्त)'],
      correct: 2,
      expNp: 'हर जति ० नजिकिन्छ, भागफल उति असीमित रूपमा ठूलो हुँदै +∞ पुग्छ।',
      expEn: 'As the denominator approaches 0 from the right, the quotient grows without bound towards +∞.',
    },
  ];

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      mascotGreeting={L(
        'नमस्ते! क्यालकुलसको आधार: अनन्त (Infinity ∞), शून्यले भाग गर्दाको अवस्था, र अनिर्धार्य रूप (0/0 Indeterminate Form) यस प्रयोगशालामा अन्वेषण गर्नुहोस्!',
        'Welcome! Explore the foundation of calculus: Infinity (∞), division by zero, and indeterminate forms!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b pb-2">
          {[
            { id: 'infinity', labelNp: 'क) अनन्तको अवधारणा (Infinity ∞)', labelEn: 'A) Concept of Infinity' },
            { id: 'divzero', labelNp: 'ख) शून्यले भाग गर्दा (Division by Zero)', labelEn: 'B) Division by Zero' },
            { id: 'indeterminate', labelNp: 'ग) अनिर्धार्य रूप (0/0 Indeterminate)', labelEn: 'C) Indeterminate Form' },
            { id: 'quiz', labelNp: 'घ) अभ्यास प्रश्न (Quiz)', labelEn: 'D) Quiz' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                kit.tap();
              }}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs sm:text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {isNe ? tab.labelNp : tab.labelEn}
            </button>
          ))}
        </div>

        {/* TAB A: INFINITY */}
        {activeTab === 'infinity' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="bg-indigo-50 border-l-4 border-indigo-600 p-3 rounded text-sm text-indigo-900">
              <span className="font-bold">{L('अनन्त (Infinity ∞) के हो?', 'What is Infinity (∞)?')}</span>
              <p className="mt-1">
                {L(
                  'अनन्त कुनै वास्तविक संख्या होइन! यो असीमित रूपमा बढ्दै जाने वा बिनाअन्त निरन्तर रहने स्थितिको संकेत हो। जस्तै: प्राकृतिक संख्याहरू १, २, ३, ... अनन्तसम्म जान्छन्।',
                  'Infinity is not a real number! It is a concept describing something unbounded, limitless, or continuing without end.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border rounded-xl space-y-2">
                <div className="font-bold text-slate-800 text-sm">
                  {L('१. धनात्मक अनन्त (+∞):', '1. Positive Infinity (+∞):')}
                </div>
                <div className="font-mono text-xs text-indigo-800">
                  १, १०, १००, १,०००, १०,०००, ... ➔ +∞
                </div>
                <p className="text-xs text-slate-600">
                  {L('कुनै पनि ठूलोभन्दा ठूलो संख्याभन्दा पनि अझ ठूलो हुँदै जाने असीमित मान।', 'Growing larger without any bound.')}
                </p>
              </div>

              <div className="p-4 bg-slate-50 border rounded-xl space-y-2">
                <div className="font-bold text-slate-800 text-sm">
                  {L('२. ऋणात्मक अनन्त (-∞):', '2. Negative Infinity (-∞):')}
                </div>
                <div className="font-mono text-xs text-rose-800">
                  -१, -१०, -१००, -१,०००, -१०,०००, ... ➔ -∞
                </div>
                <p className="text-xs text-slate-600">
                  {L('शून्यबाट बायाँतर्फ निरन्तर घट्दै जाने असीमित सानो मान।', 'Decreasing boundlessly towards the negative side.')}
                </p>
              </div>
            </div>

            {/* Visual Continuous line */}
            <div className="p-4 bg-slate-900 rounded-xl flex flex-col items-center">
              <svg width="100%" height={60} viewBox="0 0 400 60">
                <defs>
                  <marker id="inf-left" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 10 1 L 0 5 L 10 9 z" fill="#38bdf8" />
                  </marker>
                  <marker id="inf-right" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
                  </marker>
                </defs>
                <line x1={30} y1={30} x2={370} y2={30} stroke="#38bdf8" strokeWidth={2} markerStart="url(#inf-left)" markerEnd="url(#inf-right)" />
                <circle cx={200} cy={30} r={4} fill="#fbbf24" />
                <text x={200} y={48} fill="#fbbf24" fontSize="11" textAnchor="middle" fontWeight="bold">0</text>
                <text x={20} y={20} fill="#f43f5e" fontSize="12" fontWeight="bold">-∞</text>
                <text x={370} y={20} fill="#10b981" fontSize="12" fontWeight="bold">+∞</text>
              </svg>
            </div>
          </div>
        )}

        {/* TAB B: DIVISION BY ZERO */}
        {activeTab === 'divzero' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="bg-amber-50 border-l-4 border-amber-600 p-3 rounded text-sm text-amber-900">
              <span className="font-bold">{L('५ ÷ ० किन अपरिभाषित (Undefined) हुन्छ?', 'Why is 5 ÷ 0 Undefined?')}</span>
              <p className="mt-1">
                {L(
                  'जब हर (Denominator) शून्यको नजिकिँदै जान्छ, भागफल ५/x असीमित ठूलो बन्छ। दायाँबाट नजिकिँदा +∞ र बायाँबाट नजिकिँदा -∞ पुग्छ। दुई फरक मानमा पुग्ने हुनाले 5/0 लाई कुनै एउटा संख्या तोक्न सकिँदैन, यो अपरिभाषित हुन्छ!',
                  'As the denominator approaches 0 from the right, the quotient approaches +∞; from the left, it approaches -∞. Hence 5/0 cannot have a single value and is undefined.'
                )}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setApproachSide('right');
                  setDenIndex(0);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold border ${approachSide === 'right' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700'}`}
              >
                {L('धनात्मक दिशाबाट ० तर्फ (x → 0⁺)', 'From positive side (x → 0⁺)')}
              </button>
              <button
                onClick={() => {
                  setApproachSide('left');
                  setDenIndex(0);
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold border ${approachSide === 'left' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-50 text-slate-700'}`}
              >
                {L('ऋणात्मक दिशाबाट ० तर्फ (x → 0⁻)', 'From negative side (x → 0⁻)')}
              </button>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-700 block mb-1">
                {L('हरलाई शून्यको नजिक लैजानुहोस् (Step x towards 0):', 'Move x closer to 0:')}
              </span>
              <input
                type="range"
                min="0"
                max={currentSteps.length - 1}
                value={denIndex}
                onChange={(e) => setDenIndex(parseInt(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            {/* Table of approaching values */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-100 border-b">
                    <th className="p-2 font-bold text-slate-700">{L('हर (x)', 'Denominator (x)')}</th>
                    <th className="p-2 font-bold text-slate-700">{L('भागफल (५ / x)', 'Quotient (5 / x)')}</th>
                    <th className="p-2 font-bold text-slate-700">{L('प्रवृत्ति (Behavior)', 'Trend')}</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSteps.map((step, idx) => (
                    <tr key={idx} className={`border-b ${idx === denIndex ? 'bg-amber-100 font-bold' : ''}`}>
                      <td className="p-2 font-mono">{fmt(step)}</td>
                      <td className="p-2 font-mono text-indigo-700 font-bold">{fmt(5 / step)}</td>
                      <td className="p-2 text-xs text-slate-600">
                        {idx === currentSteps.length - 1 ? (approachSide === 'right' ? '➔ +∞ तर्फ असीमित' : '➔ -∞ तर्फ असीमित') : 'क्रमशः ठूलो हुँदै'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB C: INDETERMINATE FORMS */}
        {activeTab === 'indeterminate' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="bg-emerald-50 border-l-4 border-emerald-600 p-3 rounded text-sm text-emerald-900">
              <span className="font-bold">{L('० / ० लाई किन अनिर्धार्य (Indeterminate) भनिन्छ?', 'Why is 0/0 Indeterminate?')}</span>
              <p className="mt-1">
                {L(
                  'प्रत्यक्ष प्रतिस्थापन गर्दा ०/० आउने फरक-फरक अभिव्यक्तिहरूको सीमा मान (Limit) फरक-फरक संख्या निस्कन सक्छ। त्यसैले ०/० लाई सिधै कुनै निश्चित मान दिन सकिँदैन!',
                  'Different algebraic expressions evaluating to 0/0 on direct substitution approach completely different limiting values. Hence 0/0 is indeterminate.'
                )}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIndetExample('x2_minus_4')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold border ${indetExample === 'x2_minus_4' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700'}`}
              >
                (x² - 4) / (x - 2)
              </button>
              <button
                onClick={() => setIndetExample('three_x')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold border ${indetExample === 'three_x' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700'}`}
              >
                3x / x
              </button>
              <button
                onClick={() => setIndetExample('x2_over_x')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold border ${indetExample === 'x2_over_x' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700'}`}
              >
                x² / x
              </button>
            </div>

            {indetExample === 'x2_minus_4' && (
              <div className="p-4 bg-slate-50 border rounded-xl space-y-2 font-mono text-sm">
                <div className="text-slate-700 font-bold">f(x) = (x² - 4) / (x - 2) (जब x → 2)</div>
                <div className="text-rose-700">१. प्रत्यक्ष मान राख्दा: f(2) = (2² - 4)/(2 - 2) = 0/0 (अनिर्धार्य रूप)</div>
                <div className="text-indigo-800">२. खण्डीकरण गर्दा: ((x - 2)(x + 2)) / (x - 2) = x + 2 (जब x ≠ 2)</div>
                <div className="text-emerald-700 font-bold text-base">➔ सीमा मान (Limiting value) = 2 + 2 = 4</div>
              </div>
            )}

            {indetExample === 'three_x' && (
              <div className="p-4 bg-slate-50 border rounded-xl space-y-2 font-mono text-sm">
                <div className="text-slate-700 font-bold">f(x) = 3x / x (जब x → 0)</div>
                <div className="text-rose-700">१. प्रत्यक्ष मान राख्दा: 3(0) / 0 = 0/0 (अनिर्धार्य रूप)</div>
                <div className="text-indigo-800">२. सरल गर्दा: 3x / x = 3 (जब x ≠ 0)</div>
                <div className="text-emerald-700 font-bold text-base">➔ सीमा मान (Limiting value) = 3</div>
              </div>
            )}

            {indetExample === 'x2_over_x' && (
              <div className="p-4 bg-slate-50 border rounded-xl space-y-2 font-mono text-sm">
                <div className="text-slate-700 font-bold">f(x) = x² / x (जब x → 0)</div>
                <div className="text-rose-700">१. प्रत्यक्ष मान राख्दा: 0² / 0 = 0/0 (अनिर्धार्य रूप)</div>
                <div className="text-indigo-800">२. सरल गर्दा: x² / x = x (जब x ≠ 0)</div>
                <div className="text-emerald-700 font-bold text-base">➔ सीमा मान (Limiting value) = 0</div>
              </div>
            )}
          </div>
        )}

        {/* TAB D: QUIZ */}
        {activeTab === 'quiz' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-bold text-slate-800">
                {L(`प्रश्न ${toNp(qIdx + 1)} / ${toNp(quizItems.length)}`, `Question ${qIdx + 1} of ${quizItems.length}`)}
              </span>
            </div>

            <p className="font-medium text-slate-800 text-base">
              {isNe ? quizItems[qIdx].qNp : quizItems[qIdx].qEn}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quizItems[qIdx].opts.map((opt, i) => {
                const isSelected = selectedAns === i;
                const isCorrect = i === quizItems[qIdx].correct;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedAns(i);
                      if (isCorrect) kit.good();
                      else kit.oops();
                    }}
                    className={`p-3 rounded-xl border text-left font-bold transition-all ${
                      selectedAns === null
                        ? 'bg-slate-50 hover:bg-slate-100 text-slate-800'
                        : isCorrect
                        ? 'bg-emerald-100 border-emerald-400 text-emerald-900'
                        : isSelected
                        ? 'bg-rose-100 border-rose-400 text-rose-900'
                        : 'bg-slate-50 text-slate-400'
                    }`}
                  >
                    {fmt(opt)}
                  </button>
                );
              })}
            </div>

            {selectedAns !== null && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                <div className="text-xs font-bold text-blue-900">{L('व्याख्या:', 'Explanation:')}</div>
                <div className="text-sm text-blue-950 font-mono">
                  {isNe ? quizItems[qIdx].expNp : quizItems[qIdx].expEn}
                </div>
                <button
                  onClick={() => {
                    setSelectedAns(null);
                    setQIdx((prev) => (prev + 1) % quizItems.length);
                  }}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold"
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

export default InfinityApproachingValuesExplorer;
