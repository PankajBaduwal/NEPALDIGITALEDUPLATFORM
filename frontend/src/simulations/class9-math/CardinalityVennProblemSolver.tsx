import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Calculator, Award, ArrowRight, CheckCircle2, RotateCcw, HelpCircle } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'यदि n(A) = ३०, n(B) = २५ र n(A ∩ B) = १० भए n(A ∪ B) को मान कति हुन्छ?',
    en: 'If n(A) = 30, n(B) = 25, and n(A ∩ B) = 10, what is n(A ∪ B)?',
    options: [
      { key: 'A', label: '४५ — (३० + २५ − १० = ४५)' },
      { key: 'B', label: '५५' },
      { key: 'C', label: '६५' },
      { key: 'D', label: '३५' },
    ],
    answer: 'A',
  },
  {
    np: '५० जना विद्यार्थीमा ३० जनाले फुटबल र २५ जनाले भलिबल मन पराउँछन्। ५ जनाले दुवै खेल मन पराउँदैनन् भने दुवै खेल मन पराउने सङ्ख्या कति हुन्छ?',
    en: 'In a group of 50 students, 30 like football, 25 like volleyball, and 5 like neither. How many like both?',
    options: [
      { key: 'A', label: '१० जना — n(F ∪ V) = ४५, अतः ३० + २५ − ४५ = १०' },
      { key: 'B', label: '१५ जना' },
      { key: 'C', label: '५ जना' },
      { key: 'D', label: '२० जना' },
    ],
    answer: 'A',
  },
  {
    np: 'n₀(A) ले कुन भागको सदस्य सङ्ख्या जनाउँछ?',
    en: 'What does n₀(A) represent?',
    options: [
      { key: 'A', label: 'A मा मात्र पर्ने सदस्य सङ्ख्या: n(A − B) = n(A) − n(A ∩ B)' },
      { key: 'B', label: 'A र B दुवैमा पर्ने सदस्य सङ्ख्या' },
      { key: 'C', label: 'A बाहेकका सबै सदस्यहरू' },
      { key: 'D', label: 'B मा मात्र पर्ने सदस्यहरू' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि दुई समूह A र B अलगिएका (Disjoint) छन् भने n(A ∪ B) को सूत्र के हुन्छ?',
    en: 'If sets A and B are disjoint, what is the formula for n(A ∪ B)?',
    options: [
      { key: 'A', label: 'n(A) + n(B)' },
      { key: 'B', label: 'n(A) + n(B) − n(A ∩ B)' },
      { key: 'C', label: 'n(A) − n(B)' },
      { key: 'D', label: 'n(U) − n(A)' },
    ],
    answer: 'A',
  },
];

interface WordProblem {
  id: string;
  titleNp: string;
  scenarioNp: string;
  scenarioEn: string;
  nU: number;
  nA: number;
  nB: number;
  nNeither: number;
  labelA: string;
  labelB: string;
  questionNp: string;
  correctAnswer: number;
  type: 'find_both' | 'find_neither' | 'find_onlyA';
  explanationNp: string;
}

const WORD_PROBLEMS: WordProblem[] = [
  {
    id: 'sports',
    titleNp: 'समस्या १: खेलकुद सर्वेक्षण (Sports Survey)',
    scenarioNp: 'कक्षा ९ का ६० जना विद्यार्थीहरूमा गरिएको सर्वेक्षणमा ३५ जनाले फुटबल (F), ३० जनाले भलिबल (V) र ५ जनाले कुनै पनि खेल मन पराउँदैनन्।',
    scenarioEn: 'In a survey of 60 students, 35 like Football, 30 like Volleyball, and 5 like neither.',
    nU: 60,
    nA: 35,
    nB: 30,
    nNeither: 5,
    labelA: 'फुटबल (F)',
    labelB: 'भलिबल (V)',
    questionNp: 'दुवै खेल मन पराउने विद्यार्थी सङ्ख्या n(F ∩ V) कति होला?',
    correctAnswer: 10,
    type: 'find_both',
    explanationNp:
      'n(F ∪ V) = n(U) − n(F ∪ V)\' = ६० − ५ = ५५। सूत्रानुसार: n(F ∩ V) = n(F) + n(V) − n(F ∪ V) = ३५ + ३० − ५५ = १० जना।',
  },
  {
    id: 'exam',
    titleNp: 'समस्या २: परीक्षा उत्तीर्ण तथ्याङ्क (Exam Results)',
    scenarioNp: '१०० जना विद्यार्थीहरूमा ६५ जना गणितमा, ५५ जना विज्ञानमा र ४० जना दुवै विषयमा उत्तीर्ण भए।',
    scenarioEn: 'Out of 100 students, 65 passed in Math, 55 in Science, and 40 in both.',
    nU: 100,
    nA: 65,
    nB: 55,
    nNeither: 20, // 100 - (25 + 40 + 15) = 20
    labelA: 'गणित (M)',
    labelB: 'विज्ञान (S)',
    questionNp: 'दुवै विषयमा अनुत्तीर्ण हुने विद्यार्थी सङ्ख्या n(M ∪ S)\' कति होला?',
    correctAnswer: 20,
    type: 'find_neither',
    explanationNp:
      'n(M ∪ S) = n(M) + n(S) − n(M ∩ S) = ६५ + ५५ − ४० = ८०। अतः दुवैमा अनुत्तीर्ण = n(U) − n(M ∪ S) = १०० − ८० = २० जना।',
  },
  {
    id: 'beverage',
    titleNp: 'समस्या ३: चिया र कफी (Tea and Coffee)',
    scenarioNp: '८० जनाको समूहमा ५० जनाले चिया (T), ४० जनाले कफी (C) र २० जनाले दुवै पेय मन पराउँछन्।',
    scenarioEn: 'In a group of 80 people, 50 like Tea, 40 like Coffee, and 20 like both.',
    nU: 80,
    nA: 50,
    nB: 40,
    nNeither: 10,
    labelA: 'चिया (T)',
    labelB: 'कफी (C)',
    questionNp: 'चिया मात्र मन पराउने व्यक्तिहरूको सङ्ख्या n₀(T) कति होला?',
    correctAnswer: 30, // 50 - 20 = 30
    type: 'find_onlyA',
    explanationNp:
      'n₀(T) = n(T) − n(T ∩ C) = ५० − २० = ३० जना।',
  },
];

export const CardinalityVennProblemSolver: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U1-03',
    chapter: 1,
    titleNp: 'समूहको गणनात्मकता र समस्या समाधानकर्ता',
    titleEn: 'Cardinality and Venn Diagram Problem Solver',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'interactive' | 'word_problems' | 'three_sets'>('interactive');

  // Interactive 2-Set Cardinality Laboratory State
  const [onlyAVal, setOnlyAVal] = useState<number>(20);
  const [intersectVal, setIntersectVal] = useState<number>(10);
  const [onlyBVal, setOnlyBVal] = useState<number>(15);
  const [neitherVal, setNeitherVal] = useState<number>(5);

  // Derived Values
  const nA = onlyAVal + intersectVal;
  const nB = onlyBVal + intersectVal;
  const nUnion = onlyAVal + intersectVal + onlyBVal;
  const nU = nUnion + neitherVal;

  // Word Problem Solver State
  const [problemIdx, setProblemIdx] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<{ checked: boolean; isCorrect: boolean } | null>(null);

  const curProblem = WORD_PROBLEMS[problemIdx];

  const handleCheckWordProblem = () => {
    const val = parseInt(userAnswer);
    const isCorrect = val === curProblem.correctAnswer;
    if (isCorrect) {
      kit.good();
    } else {
      kit.oops();
    }
    setFeedback({ checked: true, isCorrect });
  };

  const handleNextProblem = () => {
    setProblemIdx((prev) => (prev + 1) % WORD_PROBLEMS.length);
    setUserAnswer('');
    setFeedback(null);
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! समूहको गणनात्मकता n(A), n(B), n(A ∩ B) र n(A ∪ B) को सूत्र प्रयोग गरी व्यावहारिक शाब्दिक समस्याहरू हल गरौं!',
        'Hello! Explore set cardinality formulas and solve real-life Venn diagram word problems step by step!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-800/80 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('interactive')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'interactive' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            🧮 {L('१. गणनात्मकता प्रयोगशाला (Cardinality Lab)', '1. Cardinality Lab')}
          </button>
          <button
            onClick={() => setActiveTab('word_problems')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'word_problems' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            📝 {L('२. शाब्दिक समस्या समाधान (Word Problems)', '2. Word Problems')}
          </button>
          <button
            onClick={() => setActiveTab('three_sets')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'three_sets' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            🔢 {L('३. तीन समूह सूत्र (3-Set Cardinality)', '3. 3-Set Cardinality')}
          </button>
        </div>

        {/* Tab 1: Interactive Cardinality Lab */}
        {activeTab === 'interactive' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Venn Diagram Visualizer with Real-Time Numbers */}
            <div className="lg:col-span-7 bg-white rounded-2xl shadow-lg p-5 border border-slate-200 flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-2 px-1 text-xs">
                <span className="font-bold text-slate-700">
                  संख्यात्मक भेन चित्र (Numerical Venn Diagram)
                </span>
                <span className="font-mono bg-indigo-100 text-indigo-900 px-2.5 py-0.5 rounded-full font-bold">
                  n(U) = {nU}
                </span>
              </div>

              <svg
                width={480}
                height={300}
                className="max-w-full bg-slate-50 rounded-xl border-2 border-slate-300 shadow-inner select-none"
              >
                {/* Universal Set Rectangle */}
                <rect x={10} y={10} width={460} height={280} fill="#f8fafc" stroke="#475569" strokeWidth="2" rx="8" />
                <text x={30} y={35} fontSize="16" fontWeight="900" fill="#334155">
                  U = {nU}
                </text>

                {/* Circle A */}
                <circle cx={180} cy={150} r={95} fill="rgba(59, 130, 246, 0.2)" stroke="#2563eb" strokeWidth="2.5" />
                {/* Circle B */}
                <circle cx={300} cy={150} r={95} fill="rgba(16, 185, 129, 0.2)" stroke="#059669" strokeWidth="2.5" />

                {/* Labels */}
                <text x={120} y={75} fontSize="16" fontWeight="bold" fill="#1d4ed8">
                  A (कुल {nA})
                </text>
                <text x={360} y={75} fontSize="16" fontWeight="bold" fill="#047857">
                  B (कुल {nB})
                </text>

                {/* Region Numbers */}
                {/* Only A: n0(A) */}
                <text x={140} y={155} fontSize="20" fontWeight="900" fill="#1e40af" textAnchor="middle">
                  {onlyAVal}
                </text>
                <text x={140} y={175} fontSize="10" fontWeight="bold" fill="#3b82f6" textAnchor="middle">
                  n₀(A)
                </text>

                {/* Intersection: n(A ∩ B) */}
                <text x={240} y={155} fontSize="22" fontWeight="black" fill="#b45309" textAnchor="middle">
                  {intersectVal}
                </text>
                <text x={240} y={175} fontSize="10" fontWeight="bold" fill="#d97706" textAnchor="middle">
                  n(A ∩ B)
                </text>

                {/* Only B: n0(B) */}
                <text x={340} y={155} fontSize="20" fontWeight="900" fill="#065f46" textAnchor="middle">
                  {onlyBVal}
                </text>
                <text x={340} y={175} fontSize="10" fontWeight="bold" fill="#10b981" textAnchor="middle">
                  n₀(B)
                </text>

                {/* Neither: n(A ∪ B)' */}
                <text x={420} y={265} fontSize="16" fontWeight="bold" fill="#64748b" textAnchor="middle">
                  {neitherVal}
                </text>
                <text x={420} y={280} fontSize="10" fontWeight="semibold" fill="#94a3b8" textAnchor="middle">
                  n(A ∪ B)'
                </text>
              </svg>

              {/* Formula Verification Cards */}
              <div className="w-full mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                  <span className="font-bold text-blue-900 block">१. n(A ∪ B) को सूत्र:</span>
                  <div className="font-mono text-blue-800 font-semibold">
                    n(A) + n(B) − n(A ∩ B)
                    <br />= {nA} + {nB} − {intersectVal} = <b className="text-sm text-blue-900">{nUnion}</b>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                  <span className="font-bold text-emerald-900 block">२. सर्वव्यापक समूह n(U):</span>
                  <div className="font-mono text-emerald-800 font-semibold">
                    n(A ∪ B) + n(A ∪ B)'
                    <br />= {nUnion} + {neitherVal} = <b className="text-sm text-emerald-900">{nU}</b>
                  </div>
                </div>
              </div>
            </div>

            {/* Slider / Value Adjusters */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm">
                भेन चित्रका खण्डहरूको मान परिवर्तन गर्नुहोस्:
              </h3>

              {/* Slider 1: Only A */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>A मात्र — n₀(A):</span>
                  <span className="font-mono text-blue-600">{onlyAVal}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={onlyAVal}
                  onChange={(e) => setOnlyAVal(parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              {/* Slider 2: Intersection */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>साझा भाग — n(A ∩ B):</span>
                  <span className="font-mono text-amber-600">{intersectVal}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={intersectVal}
                  onChange={(e) => setIntersectVal(parseInt(e.target.value))}
                  className="w-full accent-amber-600"
                />
              </div>

              {/* Slider 3: Only B */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>B मात्र — n₀(B):</span>
                  <span className="font-mono text-emerald-600">{onlyBVal}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={onlyBVal}
                  onChange={(e) => setOnlyBVal(parseInt(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              {/* Slider 4: Neither */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>कुनै पनि नपर्ने — n(A ∪ B)':</span>
                  <span className="font-mono text-slate-600">{neitherVal}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={neitherVal}
                  onChange={(e) => setNeitherVal(parseInt(e.target.value))}
                  className="w-full accent-slate-600"
                />
              </div>

              <div className="pt-3 border-t text-xs text-slate-600 space-y-1">
                <div>• n(A) = n₀(A) + n(A ∩ B) = {onlyAVal} + {intersectVal} = <b>{nA}</b></div>
                <div>• n(B) = n₀(B) + n(A ∩ B) = {onlyBVal} + {intersectVal} = <b>{nB}</b></div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Word Problem Step-by-Step Solver */}
        {activeTab === 'word_problems' && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6 border border-slate-200 space-y-5">
            {/* Problem Switcher */}
            <div className="flex gap-2">
              {WORD_PROBLEMS.map((prob, idx) => (
                <button
                  key={prob.id}
                  onClick={() => {
                    setProblemIdx(idx);
                    setUserAnswer('');
                    setFeedback(null);
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition ${
                    problemIdx === idx
                      ? 'bg-amber-600 text-white border-amber-600 shadow'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {prob.titleNp}
                </button>
              ))}
            </div>

            {/* Problem Statement Card */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wide block">
                {curProblem.titleNp}
              </span>
              <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                {curProblem.scenarioNp}
              </p>
              <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs font-bold text-amber-950">
                ❓ {curProblem.questionNp}
              </div>
            </div>

            {/* Answer Input and Check */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="number"
                placeholder="तपाईंको जवाफ (संख्यामा)..."
                value={userAnswer}
                onChange={(e) => {
                  setUserAnswer(e.target.value);
                  setFeedback(null);
                }}
                className="flex-1 p-3 rounded-xl border border-slate-300 font-mono text-sm bg-white"
              />
              <button
                onClick={handleCheckWordProblem}
                disabled={!userAnswer}
                className="py-3 px-6 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md transition"
              >
                जाँच गर्नुहोस् (Check Answer)
              </button>
              {feedback?.isCorrect && (
                <button
                  onClick={handleNextProblem}
                  className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1"
                >
                  अर्को समस्या <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Step-by-Step Solution Breakdown */}
            {feedback && (
              <div
                className={`p-4 rounded-2xl border text-xs space-y-2 ${
                  feedback.isCorrect
                    ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
                    : 'bg-rose-50 text-rose-950 border-rose-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  {feedback.isCorrect ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>🎉 शाबास! तपाईंको हिसाब पूर्ण रूपमा सही छ!</span>
                    </>
                  ) : (
                    <>
                      <HelpCircle className="w-5 h-5 text-rose-600" />
                      <span>❌ उत्तर मिलेन। तलको चरणबद्ध समाधान हेर्नुहोस्:</span>
                    </>
                  )}
                </div>
                <div className="p-3 bg-white/80 rounded-xl border border-slate-200 font-mono leading-relaxed text-slate-800">
                  {curProblem.explanationNp}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Three-Set Cardinality Overview */}
        {activeTab === 'three_sets' && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 border border-slate-200 space-y-4 text-xs">
            <h3 className="font-extrabold text-slate-800 text-base text-center">
              तीन समूहको गणनात्मकता सूत्र र सम्बन्ध
            </h3>

            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2 text-indigo-950">
              <span className="font-bold block">मुख्य सूत्र (Fundamental Formula for 3 Sets):</span>
              <div className="p-3 bg-white rounded border border-indigo-200 font-mono text-center font-bold text-sm text-indigo-700">
                n(A ∪ B ∪ C) = n(A) + n(B) + n(C)
                <br />− n(A ∩ B) − n(B ∩ C) − n(C ∩ A)
                <br />+ n(A ∩ B ∩ C)
              </div>
            </div>

            <div className="space-y-2 text-slate-700 leading-relaxed">
              <p>
                <b>१. केवल एउटा मात्र मन पराउने सदस्यहरूको सङ्ख्या:</b>
              </p>
              <ul className="list-disc list-inside space-y-1 font-mono text-[11px] bg-slate-50 p-2.5 rounded-lg border">
                <li>n₀(A) = n(A) − n(A ∩ B) − n(A ∩ C) + n(A ∩ B ∩ C)</li>
                <li>n₀(B) = n(B) − n(A ∩ B) − n(B ∩ C) + n(A ∩ B ∩ C)</li>
                <li>n₀(C) = n(C) − n(A ∩ C) − n(B ∩ C) + n(A ∩ B ∩ C)</li>
              </ul>

              <p className="pt-2">
                <b>२. जम्मा सर्वव्यापक समूह n(U):</b>
              </p>
              <div className="p-2.5 bg-slate-50 rounded-lg border font-mono text-[11px]">
                n(U) = n(A ∪ B ∪ C) + n(A ∪ B ∪ C)'
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default CardinalityVennProblemSolver;
