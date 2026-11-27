import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';

interface EquationPreset {
  id: string;
  nameEn: string;
  nameNp: string;
  type: 'common' | 'trinomial' | 'squares';
  eqStr: string;
  a: number;
  b: number;
  c: number;
  factorStr: string;
  stepsEn: string[];
  stepsNp: string[];
  roots: number[];
}

const PRESETS: EquationPreset[] = [
  {
    id: 'p1',
    nameEn: 'Common Factor: x² - 2x = 0',
    nameNp: 'साझा गुणनखण्ड: x² - 2x = 0',
    type: 'common',
    eqStr: 'x² - 2x = 0',
    a: 1,
    b: -2,
    c: 0,
    factorStr: 'x(x - 2) = 0',
    stepsEn: [
      'Identify common term "x" in x² and -2x',
      'Factor out x: x(x - 2) = 0',
      'Apply Zero-Product Property: either x = 0 or x - 2 = 0',
      'Roots are: x = 0 or x = 2'
    ],
    stepsNp: [
      'x² र -2x बाट साझा पद "x" पहिचान गर्नुहोस्',
      'x साझा लिनुहोस्: x(x - 2) = 0',
      'शून्य गुणन नियम प्रयोग गर्नुहोस्: या त x = 0 वा x - 2 = 0',
      'मूलहरू (Roots) हुन्: x = 0 वा x = 2'
    ],
    roots: [0, 2]
  },
  {
    id: 'p2',
    nameEn: 'Trinomial: x² - 6x + 8 = 0',
    nameNp: 'त्रिपदीय: x² - 6x + 8 = 0',
    type: 'trinomial',
    eqStr: 'x² - 6x + 8 = 0',
    a: 1,
    b: -6,
    c: 8,
    factorStr: '(x - 2)(x - 4) = 0',
    stepsEn: [
      'Find two numbers whose product is +8 and sum is -6: (-2) and (-4)',
      'Split middle term: x² - 2x - 4x + 8 = 0',
      'Group terms: x(x - 2) - 4(x - 2) = 0',
      'Common binomial: (x - 2)(x - 4) = 0',
      'Zero-Product Property: x = 2 or x = 4'
    ],
    stepsNp: [
      'गुणनफल +8 र जोड -6 हुने दुई संख्या खोज्नुहोस्: (-2) र (-4)',
      'मध्य पद टुक्राउनुहोस्: x² - 2x - 4x + 8 = 0',
      'समूह बनाउनुहोस्: x(x - 2) - 4(x - 2) = 0',
      'साझा द्विपदीय: (x - 2)(x - 4) = 0',
      'शून्य गुणन नियम: x = 2 वा x = 4'
    ],
    roots: [2, 4]
  },
  {
    id: 'p3',
    nameEn: 'Trinomial: x² + 5x + 6 = 0',
    nameNp: 'त्रिपदीय: x² + 5x + 6 = 0',
    type: 'trinomial',
    eqStr: 'x² + 5x + 6 = 0',
    a: 1,
    b: 5,
    c: 6,
    factorStr: '(x + 2)(x + 3) = 0',
    stepsEn: [
      'Find two numbers with product 6 and sum 5: 2 and 3',
      'Split middle term: x² + 2x + 3x + 6 = 0',
      'Group: x(x + 2) + 3(x + 2) = 0',
      'Factored form: (x + 2)(x + 3) = 0',
      'Roots: x = -2 or x = -3'
    ],
    stepsNp: [
      'गुणनफल 6 र जोड 5 हुने दुई संख्या: 2 र 3',
      'मध्य पद विभाजन: x² + 2x + 3x + 6 = 0',
      'समूह: x(x + 2) + 3(x + 2) = 0',
      'गुणनखण्ड रूप: (x + 2)(x + 3) = 0',
      'मूलहरू: x = -2 वा x = -3'
    ],
    roots: [-2, -3]
  },
  {
    id: 'p4',
    nameEn: 'Difference of Squares: x² - 9 = 0',
    nameNp: 'वर्गहरूको भिन्नता: x² - 9 = 0',
    type: 'squares',
    eqStr: 'x² - 9 = 0',
    a: 1,
    b: 0,
    c: -9,
    factorStr: '(x - 3)(x + 3) = 0',
    stepsEn: [
      'Recognize form a² - b² = (a - b)(a + b) where a = x, b = 3',
      'Rewrite as: x² - 3² = 0',
      'Factorize: (x - 3)(x + 3) = 0',
      'Zero-Product Property: x - 3 = 0 or x + 3 = 0',
      'Roots: x = 3 or x = -3'
    ],
    stepsNp: [
      'a² - b² = (a - b)(a + b) को रूप पहिचान गर्नुहोस् जहाँ a = x, b = 3',
      'यसरी लेख्नुहोस्: x² - 3² = 0',
      'गुणनखण्ड: (x - 3)(x + 3) = 0',
      'शून्य गुणन नियम: x - 3 = 0 वा x + 3 = 0',
      'मूलहरू: x = 3 वा x = -3'
    ],
    roots: [3, -3]
  },
  {
    id: 'p5',
    nameEn: 'Difference of Squares: 4x² - 25 = 0',
    nameNp: 'वर्गहरूको भिन्नता: 4x² - 25 = 0',
    type: 'squares',
    eqStr: '4x² - 25 = 0',
    a: 4,
    b: 0,
    c: -25,
    factorStr: '(2x - 5)(2x + 5) = 0',
    stepsEn: [
      'Write as: (2x)² - 5² = 0',
      'Factorize: (2x - 5)(2x + 5) = 0',
      'Set each factor to zero: 2x - 5 = 0 => x = 5/2 (2.5)',
      '2x + 5 = 0 => x = -5/2 (-2.5)',
      'Roots: x = 2.5 or x = -2.5'
    ],
    stepsNp: [
      '(2x)² - 5² = 0 को रूपमा लेख्नुहोस्',
      'गुणनखण्ड गर्नुहोस्: (2x - 5)(2x + 5) = 0',
      'प्रत्येक गुणनखण्डलाई शून्यसँग बराबर गर्नुहोस्: 2x - 5 = 0 => x = 5/2 (2.5)',
      '2x + 5 = 0 => x = -5/2 (-2.5)',
      'मूलहरू: x = 2.5 वा x = -2.5'
    ],
    roots: [2.5, -2.5]
  }
];

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'एक चल x भएको द्विघात समीकरणको प्रमाणिक रूप (standard form) कुन हो?',
    en: 'What is the standard form of a quadratic equation in one variable x?',
    options: [
      { key: 'A', label: 'ax + b = 0' },
      { key: 'B', label: 'ax² + bx + c = 0 (a ≠ 0)' },
      { key: 'C', label: 'ax³ + bx² + c = 0' },
      { key: 'D', label: 'a/x + b = 0' }
    ],
    answer: 'B'
  },
  {
    np: 'शून्य गुणन नियम अनुसार यदि (x - 3)(x + 5) = 0 भए:',
    en: 'According to the Zero-Product Property, if (x - 3)(x + 5) = 0, then:',
    options: [
      { key: 'A', label: 'x = 3 and x = 5' },
      { key: 'B', label: 'x = -3 or x = 5' },
      { key: 'C', label: 'x = 3 or x = -5' },
      { key: 'D', label: 'x = 0' }
    ],
    answer: 'C'
  },
  {
    np: 'समीकरण x² - 4x = 0 का मूलहरू (roots) के के हुन्?',
    en: 'What are the roots of the equation x² - 4x = 0?',
    options: [
      { key: 'A', label: 'x = 0, 4' },
      { key: 'B', label: 'x = 2, -2' },
      { key: 'C', label: 'x = 4, -4' },
      { key: 'D', label: 'x = 0, -4' }
    ],
    answer: 'A'
  },
  {
    np: 'यदि द्विघात समीकरणका मूलहरू 2 र 3 हुन् भने त्यो समीकरण कुन हो?',
    en: 'If the roots of a quadratic equation are 2 and 3, what is the equation?',
    options: [
      { key: 'A', label: 'x² + 5x + 6 = 0' },
      { key: 'B', label: 'x² - 5x + 6 = 0' },
      { key: 'C', label: 'x² - 6x + 5 = 0' },
      { key: 'D', label: 'x² - x - 6 = 0' }
    ],
    answer: 'B'
  }
];

export const QuadraticEquationFactorizationLab: React.FC<{
  onBack?: () => void;
  onBackToLibrary?: () => void;
}> = ({ onBack, onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U12-02',
    chapter: 12,
    titleNp: 'द्विघात समीकरण गुणनखण्ड प्रयोगशाला',
    titleEn: 'Quadratic Equation Factorization Lab'
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'methods' | 'custom' | 'reverse'>('methods');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('p2');

  // Custom equation roots builder
  const [root1, setRoot1] = useState<number>(2);
  const [root2, setRoot2] = useState<number>(5);

  // Test root input in explore mode
  const [testRootInput, setTestRootInput] = useState<string>('');
  const [testResult, setTestResult] = useState<{ evaluated: number; isRoot: boolean } | null>(null);

  const activePreset = PRESETS.find((p) => p.id === selectedPresetId) || PRESETS[0];

  const handleTestRoot = () => {
    const val = parseFloat(testRootInput);
    if (isNaN(val)) return;
    const { a, b, c } = activePreset;
    const evaluated = a * val * val + b * val + c;
    const isRoot = Math.abs(evaluated) < 0.001;
    setTestResult({ evaluated, isRoot });
    if (isRoot) {
      kit.good();
    } else {
      kit.oops();
    }
  };

  // Reverse formed equation
  const formedB = -(root1 + root2);
  const formedC = root1 * root2;
  const formedSignB = formedB >= 0 ? `+ ${formedB}` : `- ${Math.abs(formedB)}`;
  const formedSignC = formedC >= 0 ? `+ ${formedC}` : `- ${Math.abs(formedC)}`;
  const formedEqStr = `x² ${formedSignB}x ${formedSignC} = 0`;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! द्विघात समीकरण (Quadratic Equation) लाई गुणनखण्ड विधिबाट हल गर्न र मूलहरू पत्ता लगाउन सिक्नुहोस्!',
        'Welcome! Learn how to solve quadratic equations using factorization and discover their roots!'
      )}
    >
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-800/80 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('methods')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all ${
              activeTab === 'methods'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            {L('पाठ्यपुस्तक विधिहरू (Textbook Methods)', 'Textbook Factorization Methods')}
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all ${
              activeTab === 'custom'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            {L('संख्या रेखा र मूल जाँच (Roots & Number Line)', 'Roots & Number Line Verifier')}
          </button>
          <button
            onClick={() => setActiveTab('reverse')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all ${
              activeTab === 'reverse'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            {L('मूलबाट समीकरण निर्माण (Roots to Equation)', 'Form Equation from Roots')}
          </button>
        </div>

        {/* Tab 1: Textbook Factorization Methods */}
        {activeTab === 'methods' && (
          <div className="space-y-6">
            {/* Header concept card */}
            <div className="p-4 bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 rounded-xl border border-amber-500/30">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📐</span>
                <div>
                  <h3 className="font-bold text-amber-300 text-lg">
                    {L('द्विघात समीकरण र शून्य गुणन नियम', 'Quadratic Equation & Zero-Product Property')}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    {L(
                      'प्रमाणिक रूप: ax² + bx + c = 0। यदि A × B = 0 हुन्छ भने A = 0 वा B = 0 हुन्छ।',
                      'Standard form: ax² + bx + c = 0 (where a ≠ 0). If A × B = 0, then A = 0 or B = 0.'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Presets Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                {L('पाठ्यपुस्तकका उदाहरणहरू चयन गर्नुहोस्:', 'Select Textbook Example:')}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPresetId(p.id);
                      setTestResult(null);
                      setTestRootInput('');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedPresetId === p.id
                        ? 'bg-amber-500/20 border-amber-400 text-white shadow-md shadow-amber-500/10'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-mono text-sm font-bold text-amber-300">{p.eqStr}</div>
                    <div className="text-xs text-slate-400 mt-1">{isNe ? p.nameNp : p.nameEn}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Method Breakdown & Steps */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Factorization Steps */}
              <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-700 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                    {L('चरणबद्ध समाधान', 'Step-by-Step Factoring')}
                  </span>
                  <span className="font-mono px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded text-xs border border-amber-500/30">
                    {activePreset.eqStr}
                  </span>
                </div>

                <div className="space-y-3">
                  {(isNe ? activePreset.stepsNp : activePreset.stepsEn).map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-sm text-slate-200">{step}</p>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl">
                  <div className="text-xs font-semibold text-emerald-400">
                    {L('प्राप्त मूलहरू (Roots found):', 'Final Roots Found:')}
                  </div>
                  <div className="font-mono font-bold text-lg text-emerald-300 mt-1">
                    x = {activePreset.roots.join(' ' + L('वा', 'or') + ' x = ')}
                  </div>
                </div>
              </div>

              {/* Visual Factor Card & Number Line */}
              <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-700 space-y-5 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs uppercase font-bold text-slate-400 mb-3 tracking-wider">
                    {L('गुणनखण्ड रूपान्तरण कार्ड', 'Factor Form Visual')}
                  </h4>
                  <div className="p-4 bg-slate-800/90 rounded-xl border border-amber-500/20 text-center space-y-3">
                    <div className="text-xs text-slate-400">
                      {L('गुणनखण्डित समीकरण (Factored Equation):', 'Factored Equation:')}
                    </div>
                    <div className="text-2xl font-mono font-bold text-amber-300 bg-slate-950/60 py-3 rounded-lg border border-slate-800">
                      {activePreset.factorStr}
                    </div>
                    <div className="text-xs text-slate-300 italic">
                      {L('दुवै गुणनखण्डलाई शून्यसँग बराबर गरी x को मान पत्ता लगाइन्छ।', 'Setting each factor to zero yields the distinct solutions.')}
                    </div>
                  </div>
                </div>

                {/* Mini Number Line */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400 mb-2 flex justify-between">
                    <span>{L('संख्या रेखामा मूलहरू', 'Roots on Number Line')}</span>
                    <span className="text-amber-400 font-mono">
                      x ∈ {'{' + activePreset.roots.join(', ') + '}'}
                    </span>
                  </div>
                  <svg viewBox="-8 0 16 4" className="w-full h-16">
                    {/* Main Axis */}
                    <line x1="-7" y1="2" x2="7" y2="2" stroke="#64748b" strokeWidth="0.15" />
                    {/* Ticks */}
                    {[-6, -4, -2, 0, 2, 4, 6].map((tick) => (
                      <g key={tick}>
                        <line x1={tick} y1="1.7" x2={tick} y2="2.3" stroke="#94a3b8" strokeWidth="0.1" />
                        <text x={tick} y="3.3" fontSize="0.7" fill="#94a3b8" textAnchor="middle">
                          {tick}
                        </text>
                      </g>
                    ))}
                    {/* Highlight Roots */}
                    {activePreset.roots.map((r, i) => (
                      <g key={i}>
                        <circle cx={r} cy="2" r="0.4" fill="#f59e0b" stroke="#ffffff" strokeWidth="0.1" />
                        <text x={r} y="1.2" fontSize="0.8" fontWeight="bold" fill="#f59e0b" textAnchor="middle">
                          x={r}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Roots & Number Line Verifier */}
        {activeTab === 'custom' && (
          <div className="space-y-6">
            <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-700 space-y-4">
              <h3 className="font-bold text-slate-200">
                {L('समीकरणमा मान प्रतिस्थापन गरी मूल जाँच गर्नुहोस्', 'Verify a Value in the Equation by Substitution')}
              </h3>
              <p className="text-xs text-slate-400">
                {L(
                  'समीकरणमा x को मान हाल्दा यदि बायाँ पक्ष (LHS) = 0 हुन्छ भने त्यो मान उक्त समीकरणको मूल हो।',
                  'If substituting a value of x makes the equation equal to 0, that value is a genuine root.'
                )}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-slate-300 font-mono font-bold">{activePreset.eqStr} :</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400 font-mono">x = </span>
                  <input
                    type="number"
                    step="any"
                    value={testRootInput}
                    onChange={(e) => setTestRootInput(e.target.value)}
                    placeholder="e.g. 2"
                    className="w-28 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:border-amber-400 outline-none"
                  />
                  <button
                    onClick={handleTestRoot}
                    className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition-all"
                  >
                    {L('जाँच गर्नुहोस्', 'Test Root')}
                  </button>
                </div>
              </div>

              {testResult && (
                <div
                  className={`p-4 rounded-xl border ${
                    testResult.isRoot
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                  }`}
                >
                  <div className="font-bold text-sm">
                    {testResult.isRoot
                      ? L('✅ सही! यो मान समीकरणको वास्तविक मूल (Root) हो!', '✅ Correct! This value is a valid root!')
                      : L('❌ गलत! समीकरणको मान 0 भएन (Not equal to 0)', '❌ Incorrect! The expression does not equal 0')}
                  </div>
                  <div className="font-mono text-xs mt-1 text-slate-300">
                    LHS = {activePreset.a} × ({testRootInput})² + ({activePreset.b}) × ({testRootInput}) + ({activePreset.c}) ={' '}
                    <span className="font-bold text-white">{testResult.evaluated.toFixed(3)}</span>
                    {testResult.isRoot ? ' = RHS (0)' : ' ≠ 0'}
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Number line exploration */}
            <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-700 space-y-4">
              <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                {L('मूलहरूको अन्तरक्रियात्मक संख्या रेखा', 'Interactive Roots Number Line')}
              </h4>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <svg viewBox="-10 0 20 5" className="w-full h-24">
                  <line x1="-9" y1="2.5" x2="9" y2="2.5" stroke="#475569" strokeWidth="0.2" />
                  {[-8, -6, -4, -2, 0, 2, 4, 6, 8].map((t) => (
                    <g key={t}>
                      <line x1={t} y1="2.1" x2={t} y2="2.9" stroke="#94a3b8" strokeWidth="0.1" />
                      <text x={t} y="4.2" fontSize="0.9" fill="#94a3b8" textAnchor="middle">
                        {t}
                      </text>
                    </g>
                  ))}
                  {activePreset.roots.map((r, i) => (
                    <g key={i}>
                      <circle cx={r} cy="2.5" r="0.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="0.15" />
                      <text x={r} y="1.5" fontSize="0.9" fontWeight="bold" fill="#38bdf8" textAnchor="middle">
                        Root: {r}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Form Equation from Roots */}
        {activeTab === 'reverse' && (
          <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-700 space-y-5">
            <div>
              <h3 className="font-bold text-slate-200 text-lg">
                {L('मूलहरू दिएको अवस्थामा द्विघात समीकरण बनाउने विधि', 'Form Quadratic Equation from Given Roots')}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {L(
                  'यदि मूलहरू α र β हुन् भने: (x - α)(x - β) = 0 अर्थात् x² - (मूलहरूको जोड)x + (मूलहरूको गुणनफल) = 0',
                  'If roots are α and β: (x - α)(x - β) = 0, which expands to x² - (sum of roots)x + (product of roots) = 0'
                )}
              </p>
            </div>

            {/* Sliders / Inputs for Root 1 and Root 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">
                <label className="text-xs text-slate-400 block mb-1">
                  {L('पहिलो मूल (First Root) α:', 'First Root α:')}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="-8"
                    max="8"
                    value={root1}
                    onChange={(e) => setRoot1(parseInt(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <span className="font-mono font-bold text-lg text-amber-300 w-10 text-center">{root1}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700">
                <label className="text-xs text-slate-400 block mb-1">
                  {L('दोस्रो मूल (Second Root) β:', 'Second Root β:')}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="-8"
                    max="8"
                    value={root2}
                    onChange={(e) => setRoot2(parseInt(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <span className="font-mono font-bold text-lg text-amber-300 w-10 text-center">{root2}</span>
                </div>
              </div>
            </div>

            {/* Derivation Steps */}
            <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-3 font-mono">
              <div className="text-xs text-slate-400 font-sans uppercase tracking-wider font-semibold">
                {L('समीकरण निर्माण प्रक्रिया (Formation Steps):', 'Equation Formation Steps:')}
              </div>
              <div className="text-slate-300 text-sm">
                1. (x - ({root1}))(x - ({root2})) = 0
              </div>
              <div className="text-slate-300 text-sm">
                2. x² - ({root1} + {root2})x + ({root1} × {root2}) = 0
              </div>
              <div className="text-slate-300 text-sm">
                3. x² - ({root1 + root2})x + ({root1 * root2}) = 0
              </div>
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 font-bold text-lg text-center mt-2">
                {formedEqStr}
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default QuadraticEquationFactorizationLab;
