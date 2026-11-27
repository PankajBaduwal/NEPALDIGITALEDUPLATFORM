import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Palette, CheckCircle2, RotateCcw, HelpCircle, ArrowRight } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'सममितीय अन्तर (Symmetric Difference) A △ B को सूत्र कुन हो?',
    en: 'What is the formula for symmetric difference A △ B?',
    options: [
      { key: 'A', label: '(A − B) ∪ (B − A) or (A ∪ B) − (A ∩ B)' },
      { key: 'B', label: 'A ∩ B' },
      { key: 'C', label: '(A ∪ B) ∪ (A ∩ B)' },
      { key: 'D', label: 'U − (A ∪ B)' },
    ],
    answer: 'A',
  },
  {
    np: 'भेन चित्रमा (A ∪ B)\' देखाउन कुन भागलाई छायाङ्कन (Shade) गर्नुपर्दछ?',
    en: 'Which region should be shaded in a Venn diagram to represent (A ∪ B)\'?',
    options: [
      { key: 'A', label: 'The part outside circles A and B, inside the universal set U' },
      { key: 'B', label: 'Only the common part between A and B' },
      { key: 'C', label: 'Only circle A' },
      { key: 'D', label: 'Both circles A and B' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि U = {1, 2, 3, 4, 5}, A = {2, 3} र B = {3, 4} भए A △ B को मान कति हुन्छ?',
    en: 'If U = {1, 2, 3, 4, 5}, A = {2, 3} and B = {3, 4}, what is A △ B?',
    options: [
      { key: 'A', label: '{2, 4} / {2, 4}' },
      { key: 'B', label: '{3}' },
      { key: 'C', label: '{2, 3, 4}' },
      { key: 'D', label: '{1, 5}' },
    ],
    answer: 'A',
  },
  {
    np: 'भेन चित्रमा A − B छायाङ्कन गर्दा कुन भाग रङ्ग्याइन्छ?',
    en: 'When shading A - B (only A), which region is shaded?',
    options: [
      { key: 'A', label: 'The part of A where no part of B falls' },
      { key: 'B', label: 'The intersection between A and B' },
      { key: 'C', label: 'The whole of circle B' },
      { key: 'D', label: 'All the outside part' },
    ],
    answer: 'A',
  },
];

interface ShadingChallenge {
  id: string;
  targetNp: string;
  targetEn: string;
  formula: string;
  descNp: string;
  expectedRegions: {
    onlyA: boolean;
    intersect: boolean;
    onlyB: boolean;
    outside: boolean;
  };
}

const SHADING_CHALLENGES: ShadingChallenge[] = [
  {
    id: 'union',
    targetNp: 'A ∪ B',
    targetEn: 'A ∪ B (Union)',
    formula: 'A ∪ B',
    descNp: 'Shade all the parts of set A and set B.',
    expectedRegions: { onlyA: true, intersect: true, onlyB: true, outside: false },
  },
  {
    id: 'intersect',
    targetNp: 'A ∩ B',
    targetEn: 'A ∩ B (Intersection)',
    formula: 'A ∩ B',
    descNp: 'समूह A र B दुवैमा पर्ने साझा भाग मात्र छायाङ्कन गर्नुहोस्।',
    expectedRegions: { onlyA: false, intersect: true, onlyB: false, outside: false },
  },
  {
    id: 'diff_A_B',
    targetNp: 'A − B',
    targetEn: 'A − B (Only A)',
    formula: 'A − B = {x : x ∈ A and x ∉ B}',
    descNp: 'A मा पर्ने तर B मा नपर्ने भाग मात्र छायाङ्कन गर्नुहोस्।',
    expectedRegions: { onlyA: true, intersect: false, onlyB: false, outside: false },
  },
  {
    id: 'diff_B_A',
    targetNp: 'B − A',
    targetEn: 'B − A (Only B)',
    formula: 'B − A = {x : x ∈ B and x ∉ A}',
    descNp: 'B मा पर्ने तर A मा नपर्ने भाग मात्र छायाङ्कन गर्नुहोस्।',
    expectedRegions: { onlyA: false, intersect: false, onlyB: true, outside: false },
  },
  {
    id: 'comp_union',
    targetNp: "(A ∪ B)' वा A ∪ B को पूरक",
    targetEn: "(A ∪ B)' (Complement of Union)",
    formula: "(A ∪ B)' = U − (A ∪ B)",
    descNp: 'A र B दुवै वृत्तभन्दा बाहिरको सर्वव्यापक समूह U को भाग छायाङ्कन गर्नुहोस्।',
    expectedRegions: { onlyA: false, intersect: false, onlyB: false, outside: true },
  },
  {
    id: 'comp_A',
    targetNp: "Ā वा A'",
    targetEn: "A' (Complement of A)",
    formula: "A' = U − A",
    descNp: 'समूह A बाहेकको सबै भाग (B only र बाहिरी भाग) छायाङ्कन गर्नुहोस्।',
    expectedRegions: { onlyA: false, intersect: false, onlyB: true, outside: true },
  },
  {
    id: 'sym_diff',
    targetNp: 'A △ B',
    targetEn: 'A △ B (Symmetric Difference)',
    formula: 'A △ B = (A − B) ∪ (B − A)',
    descNp: 'A only र B onlyको भाग छायाङ्कन गर्नुहोस् (साझा भाग बाहेक)।',
    expectedRegions: { onlyA: true, intersect: false, onlyB: true, outside: false },
  },
  {
    id: 'comp_intersect',
    targetNp: "(A ∩ B)' वा A ∩ B को पूरक",
    targetEn: "(A ∩ B)' (Complement of Intersection)",
    formula: "(A ∩ B)' = U − (A ∩ B)",
    descNp: 'A र B को बीचको साझा भाग बाहेक अन्य सबै भाग छायाङ्कन गर्नुहोस्।',
    expectedRegions: { onlyA: true, intersect: false, onlyB: true, outside: true },
  },
];

export const SetOperationsChallenge: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U1-02',
    chapter: 1,
    titleNp: 'समूहका क्रियाहरू र छायाङ्कन चुनौती',
    titleEn: 'Set Operations Challenge',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'shading' | 'calc_practice'>('shading');

  // Interactive Shading State
  const [challengeIdx, setChallengeIdx] = useState<number>(0);
  const [shadedRegions, setShadedRegions] = useState({
    onlyA: false,
    intersect: false,
    onlyB: false,
    outside: false,
  });
  const [feedback, setFeedback] = useState<{ checked: boolean; isCorrect: boolean } | null>(null);
  const [score, setScore] = useState<number>(0);

  // Calculation Practice State
  const [calcLevel, setCalcLevel] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [calcAnswer, setCalcAnswer] = useState<string>('');
  const [calcFeedback, setCalcFeedback] = useState<string | null>(null);

  const curChallenge = SHADING_CHALLENGES[challengeIdx];

  // Toggle shade region
  const toggleRegion = (region: 'onlyA' | 'intersect' | 'onlyB' | 'outside') => {
    setShadedRegions((prev) => ({ ...prev, [region]: !prev[region] }));
    setFeedback(null);
  };

  const handleCheckShading = () => {
    const isCorrect =
      shadedRegions.onlyA === curChallenge.expectedRegions.onlyA &&
      shadedRegions.intersect === curChallenge.expectedRegions.intersect &&
      shadedRegions.onlyB === curChallenge.expectedRegions.onlyB &&
      shadedRegions.outside === curChallenge.expectedRegions.outside;

    if (isCorrect) {
      kit.good();
      setScore((s) => s + 1);
    } else {
      kit.oops();
    }
    setFeedback({ checked: true, isCorrect });
  };

  const handleNextChallenge = () => {
    setChallengeIdx((prev) => (prev + 1) % SHADING_CHALLENGES.length);
    setShadedRegions({ onlyA: false, intersect: false, onlyB: false, outside: false });
    setFeedback(null);
  };

  const handleResetShading = () => {
    setShadedRegions({ onlyA: false, intersect: false, onlyB: false, outside: false });
    setFeedback(null);
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! भेन चित्रमा समूहका क्रियाहरू (संयोजन, प्रतिच्छेदन, अन्तर र पूरक) प्रत्यक्ष छोएर वा क्लिक गरेर छायाङ्कन (Shading) गर्ने अभ्यास गरौं!',
        'Hello! Tap or click regions on the Venn diagram to shade the requested set operations!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-800/80 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('shading')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'shading' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            🎨 {L('1. भेन चित्र छायाङ्कन चुनौती (Interactive Shading)', '1. Interactive Shading')}
          </button>
          <button
            onClick={() => setActiveTab('calc_practice')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'calc_practice' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            🧮 {L('2. समूह हिसाब अभ्यास (Set Calculations)', '2. Set Calculations')}
          </button>
        </div>

        {/* Tab 1: Interactive Shading Canvas */}
        {activeTab === 'shading' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Venn Interactive Canvas */}
            <div className="lg:col-span-8 bg-white rounded-2xl shadow-lg p-5 border border-slate-200 flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-2 px-1 text-xs">
                <span className="font-bold text-slate-700">
                  {L('चित्रका भागहरूमा क्लिक वा टच गरी रङ्ग्याउनुहोस्:', 'Click or tap regions to toggle shading:')}
                </span>
                <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">
                  Score: {score}
                </span>
              </div>

              <svg
                width={500}
                height={330}
                className="max-w-full bg-slate-50 rounded-2xl border-2 border-slate-300 shadow-inner select-none cursor-pointer"
              >
                {/* Defs for shading diagonal patterns */}
                <defs>
                  <pattern id="shade-stripe" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="0" y2="8" stroke="#f59e0b" strokeWidth="3" />
                  </pattern>
                </defs>

                {/* Region 4: Outside Rectangle U */}
                <rect
                  x={10}
                  y={10}
                  width={480}
                  height={310}
                  fill={shadedRegions.outside ? 'url(#shade-stripe)' : '#f8fafc'}
                  stroke="#334155"
                  strokeWidth="2.5"
                  rx="10"
                  onClick={() => toggleRegion('outside')}
                />
                <text x={30} y={35} fontSize="18" fontWeight="900" fill="#334155" onClick={() => toggleRegion('outside')}>
                  U
                </text>

                {/* Region 1: Only A (Left crescent) */}
                {/* SVG path: circle A minus circle B */}
                <path
                  d="M 190 67 A 95 95 0 1 0 190 253 A 95 95 0 0 1 190 67 Z"
                  fill={shadedRegions.onlyA ? 'url(#shade-stripe)' : 'rgba(59, 130, 246, 0.15)'}
                  stroke="#2563eb"
                  strokeWidth="2.5"
                  onClick={() => toggleRegion('onlyA')}
                  className="transition hover:opacity-80"
                />

                {/* Region 3: Only B (Right crescent) */}
                {/* SVG path: circle B minus circle A */}
                <path
                  d="M 310 67 A 95 95 0 1 1 310 253 A 95 95 0 0 1 310 67 Z"
                  fill={shadedRegions.onlyB ? 'url(#shade-stripe)' : 'rgba(16, 185, 129, 0.15)'}
                  stroke="#059669"
                  strokeWidth="2.5"
                  onClick={() => toggleRegion('onlyB')}
                  className="transition hover:opacity-80"
                />

                {/* Region 2: Central Intersection Overlap A ∩ B */}
                <path
                  d="M 250 82 A 95 95 0 0 1 250 238 A 95 95 0 0 1 250 82 Z"
                  fill={shadedRegions.intersect ? 'url(#shade-stripe)' : 'rgba(234, 179, 8, 0.15)'}
                  stroke="#d97706"
                  strokeWidth="2.5"
                  onClick={() => toggleRegion('intersect')}
                  className="transition hover:opacity-80"
                />

                {/* Set Labels */}
                <text x={125} y={80} fontSize="20" fontWeight="bold" fill="#1d4ed8" pointerEvents="none">
                  A
                </text>
                <text x={375} y={80} fontSize="20" fontWeight="bold" fill="#047857" pointerEvents="none">
                  B
                </text>

                {/* Text prompts inside regions */}
                <text x={155} y={165} fontSize="11" fontWeight="bold" fill="#1e40af" textAnchor="middle" pointerEvents="none">
                  A only
                </text>
                <text x={250} y={165} fontSize="11" fontWeight="bold" fill="#b45309" textAnchor="middle" pointerEvents="none">
                  A ∩ B
                </text>
                <text x={345} y={165} fontSize="11" fontWeight="bold" fill="#065f46" textAnchor="middle" pointerEvents="none">
                  B only
                </text>
                <text x={70} y={295} fontSize="11" fontWeight="bold" fill="#64748b" pointerEvents="none">
                  Outside part (U)
                </text>
              </svg>

              {/* Action Buttons */}
              <div className="w-full flex justify-between items-center mt-4">
                <button
                  onClick={handleResetShading}
                  className="py-2 px-3 text-xs rounded-xl font-bold border border-slate-300 text-slate-600 hover:bg-slate-100 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={handleCheckShading}
                    className="py-2.5 px-6 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
                  >
                    Check answer
                  </button>
                  {feedback?.isCorrect && (
                    <button
                      onClick={handleNextChallenge}
                      className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1 animate-pulse"
                    >
                      अर्को चुनौती <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Challenge Prompts & Solutions */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm space-y-3">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wide block">
                  Challenge #{challengeIdx + 1}
                </span>

                <h3 className="text-xl font-black text-amber-950 font-mono">
                  {curChallenge.targetNp}
                </h3>
                <p className="text-xs text-amber-900 leading-relaxed font-semibold">
                  {curChallenge.descNp}
                </p>

                <div className="p-2.5 bg-white rounded-xl border border-amber-200 text-xs font-mono text-amber-800 font-bold">
                  Formula: {curChallenge.formula}
                </div>
              </div>

              {/* Feedback Alert */}
              {feedback && (
                <div
                  className={`p-4 rounded-2xl border text-xs font-bold space-y-2 ${
                    feedback.isCorrect
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                      : 'bg-rose-50 text-rose-900 border-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm">
                    {feedback.isCorrect ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span>🎉 उत्कृष्ट! तपाईंको छायाङ्कन पूर्ण रूपमा सही छ!</span>
                      </>
                    ) : (
                      <>
                        <HelpCircle className="w-5 h-5 text-rose-600" />
                        <span>❌ मिलेन। सही छायाङ्कनका लागि फेरि प्रयास गर्नुहोस्।</span>
                      </>
                    )}
                  </div>
                  <p className="text-slate-700 font-normal leading-relaxed">
                    <b>व्याख्या:</b> {curChallenge.descNp}
                  </p>
                </div>
              )}

              {/* List of operations quick switch */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-xs space-y-2">
                <span className="font-bold text-slate-700 block">Challenge list:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {SHADING_CHALLENGES.map((ch, idx) => (
                    <button
                      key={ch.id}
                      onClick={() => {
                        setChallengeIdx(idx);
                        handleResetShading();
                      }}
                      className={`p-1.5 rounded-lg border text-left font-mono text-[11px] font-bold transition ${
                        challengeIdx === idx
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {ch.formula}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Calculation Practice */}
        {activeTab === 'calc_practice' && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 border border-slate-200 space-y-5">
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2 text-xs">
              <span className="font-bold text-indigo-900 uppercase">Given data:</span>
              <div className="font-mono text-indigo-800 text-sm space-y-1">
                <div>U = &#123;1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12&#125;</div>
                <div>A = &#123;2, 4, 6, 8, 10, 12&#125; (multiples of 2)</div>
                <div>B = &#123;3, 6, 9, 12&#125; (multiples of 3)</div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-slate-800 text-sm">
                What is the value of the set operations below?
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-700 block">1. A ∩ B:</span>
                  <div className="font-mono text-emerald-700 font-bold text-sm">&#123;6, 12&#125;</div>
                  <span className="text-[11px] text-slate-500">Common multiples of both 2 and 3</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-700 block">2. A − B:</span>
                  <div className="font-mono text-blue-700 font-bold text-sm">&#123;2, 4, 8, 10&#125;</div>
                  <span className="text-[11px] text-slate-500">Removing the common 6 and 12 from A</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-700 block">3. B − A:</span>
                  <div className="font-mono text-amber-700 font-bold text-sm">&#123;3, 9&#125;</div>
                  <span className="text-[11px] text-slate-500">Removing the common 6 and 12 from B</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-700 block">4. A △ B:</span>
                  <div className="font-mono text-purple-700 font-bold text-sm">&#123;2, 3, 4, 8, 9, 10&#125;</div>
                  <span className="text-[11px] text-slate-500">(A − B) ∪ (B − A)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default SetOperationsChallenge;
