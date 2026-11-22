import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { ZoomIn, ZoomOut, CheckCircle, Calculator, RefreshCw } from 'lucide-react';

type TabMode = 'discovery' | 'congruent_vs_similar' | 'proportions' | 'unknown_solver';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'समरूप त्रिभुजहरू (Similar Triangles) को मुख्य विशेषता कुन हो?',
    en: 'What is the primary characteristic of similar triangles?',
    options: [
      { key: 'A', label: 'संगत कोण बराबर र संगत भुजाहरू समानुपातिक हुनु (Equal angles & proportional sides)' },
      { key: 'B', label: 'क्षेत्रफल बराबर हुनु' },
      { key: 'C', label: 'सबै भुजा बराबर हुनु' },
      { key: 'D', label: 'दुवै समकोण हुनु' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि दुई त्रिभुज △ABC र △PQR समरूप भए (△ABC ~ △PQR), कुन सम्बन्ध सही छ?',
    en: 'If △ABC is similar to △PQR (△ABC ~ △PQR), which relation is correct?',
    options: [
      { key: 'A', label: 'AB/PQ = BC/QR = AC/PR' },
      { key: 'B', label: 'AB + PQ = BC + QR' },
      { key: 'C', label: 'AB × PQ = BC × QR' },
      { key: 'D', label: 'कुनै पनि होइन' },
    ],
    answer: 'A',
  },
  {
    np: 'के सबै सर्वाङ्गसम त्रिभुजहरू समरूप पनि हुन्छन्?',
    en: 'Are all congruent triangles also similar?',
    options: [
      { key: 'A', label: 'हो, सबै सर्वाङ्गसम त्रिभुजहरू समरूप हुन्छन् (k = 1)' },
      { key: 'B', label: 'होइन, कहिल्यै हुँदैनन्' },
      { key: 'C', label: 'समबाहु त्रिभुजमा मात्र' },
      { key: 'D', label: 'भन्न सकिँदैन' },
    ],
    answer: 'A',
  }
];

export const SimilarFiguresSimilarityLab: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U15-03',
    chapter: 15,
    titleNp: 'समरूप आकृति र त्रिभुज समरूपता प्रयोगशाला',
    titleEn: 'Similar Figures and Triangle Similarity Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<TabMode>('discovery');

  // Scale factor k for Similar Figures Discovery (0.6x to 2.0x)
  const [scaleK, setScaleK] = useState<number>(1.5);

  // Unknown Side Solver Challenge:
  // Given AB = 6, PQ = 3 (ratio = 2:1), BC = 10, QR = x => x = 5
  const [userAnswerX, setUserAnswerX] = useState<string>('');
  const [solverVerdict, setSolverVerdict] = useState<string | null>(null);

  const handleCheckUnknown = () => {
    const val = parseFloat(userAnswerX);
    if (Math.abs(val - 5) < 0.01) {
      setSolverVerdict('correct');
      kit.good();
    } else {
      setSolverVerdict('incorrect');
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
        'नमस्ते! आकार (Shape) उस्तै तर नाप (Size) सानो वा ठूलो हुने समरूप आकृतिहरू र भुजाहरूको समानुपात पत्ता लगाऔं!',
        'Hello! Explore similar figures with the same shape, varying scale factors, and proportional corresponding sides!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-800/80 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('discovery')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'discovery' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            {L('१. समरूप आकृति खोजी (Scale Factor k)', '1. Similar Figures & Scale Factor')}
          </button>
          <button
            onClick={() => setActiveTab('congruent_vs_similar')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'congruent_vs_similar' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            {L('२. सर्वाङ्गसम vs समरूप (Comparison)', '2. Congruent vs Similar')}
          </button>
          <button
            onClick={() => setActiveTab('proportions')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'proportions' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            {L('३. संगत भुजाहरूको अनुपात (Side Ratios)', '3. Corresponding Side Ratios')}
          </button>
          <button
            onClick={() => setActiveTab('unknown_solver')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'unknown_solver' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            {L('४. अज्ञात भुजा समाधान (Find Unknown Side)', '4. Solve Unknown Side')}
          </button>
        </div>

        {/* Tab 1: Similar Figures & Scale Factor */}
        {activeTab === 'discovery' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-amber-300 text-base">
                  {L('समरूप आकृतिहरू (Same Shape, Scaled Size: k)', 'Similar Figures: Same Shape, Scaled Size')}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {L('आकार (Shape) हुबहु उही रहन्छ तर नाप (Size) विस्तार (Enlargement) वा संकुचन (Reduction) हुन्छ।', 'Figures have identical shape and angles, but sides are enlarged or reduced by scale factor k.')}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-semibold uppercase">
                  {L('मापन अनुपात (Scale Factor k):', 'Scale Factor k:')}
                </span>
                <span className="font-mono font-bold text-lg text-amber-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                  {scaleK.toFixed(1)}x
                </span>
              </div>
            </div>

            {/* Slider */}
            <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-800">
              <input
                type="range"
                min="0.6"
                max="2.0"
                step="0.1"
                value={scaleK}
                onChange={(e) => setScaleK(parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>0.6x (Reduction / संकुचन)</span>
                <span>1.0x (Exact Match / सर्वाङ्गसम)</span>
                <span>2.0x (Enlargement / विस्तार)</span>
              </div>
            </div>

            {/* Side-by-Side SVG Canvas */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-center">
              <svg viewBox="0 0 520 250" className="w-full max-w-2xl h-64 select-none">
                <defs>
                  <pattern id="gridSim" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="520" height="250" fill="url(#gridSim)" />

                {/* Base Triangle: △ABC (Scale 1.0) */}
                <g transform="translate(60, 40)">
                  <polygon points="0,140 120,140 40,30" fill="rgba(56, 189, 248, 0.15)" stroke="#38bdf8" strokeWidth="3" />
                  <text x="-15" y="150" fill="#38bdf8" fontSize="12" fontWeight="bold">A</text>
                  <text x="125" y="150" fill="#38bdf8" fontSize="12" fontWeight="bold">B</text>
                  <text x="35" y="20" fill="#38bdf8" fontSize="12" fontWeight="bold">C</text>
                  <text x="60" y="170" fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle">
                    △ABC (मूल त्रिकोण)
                  </text>
                  <text x="60" y="130" fill="#94a3b8" fontSize="10" textAnchor="middle">आधार = ६ सेमी</text>
                </g>

                {/* Scaled Triangle: △PQR (Scale k) */}
                {(() => {
                  const bWidth = 120 * scaleK;
                  const topX = 40 * scaleK;
                  const topY = 140 - (110 * scaleK);
                  return (
                    <g transform="translate(260, 40)">
                      <polygon
                        points={`0,140 ${bWidth},140 ${topX},${topY}`}
                        fill="rgba(245, 158, 11, 0.2)"
                        stroke="#f59e0b"
                        strokeWidth="3"
                      />
                      <text x="-15" y="150" fill="#f59e0b" fontSize="12" fontWeight="bold">P</text>
                      <text x={bWidth + 5} y="150" fill="#f59e0b" fontSize="12" fontWeight="bold">Q</text>
                      <text x={topX} y={topY - 10} fill="#f59e0b" fontSize="12" fontWeight="bold">R</text>
                      <text x={bWidth / 2} y="170" fill="#f59e0b" fontSize="12" fontWeight="bold" textAnchor="middle">
                        △PQR (समरूप: {scaleK.toFixed(1)}x)
                      </text>
                      <text x={bWidth / 2} y="130" fill="#94a3b8" fontSize="10" textAnchor="middle">
                        आधार = {(6 * scaleK).toFixed(1)} सेमी
                      </text>
                    </g>
                  );
                })()}
              </svg>
            </div>
          </div>
        )}

        {/* Tab 2: Congruent vs Similar Comparison */}
        {activeTab === 'congruent_vs_similar' && (
          <div className="space-y-4 p-5 bg-slate-900/90 rounded-2xl border border-slate-700">
            <h3 className="font-bold text-amber-300 text-base">
              {L('सर्वाङ्गसमता र समरूपता बीचको फरक (Congruency vs Similarity)', 'Difference Between Congruency and Similarity')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
                <div className="text-sky-400 font-bold text-sm flex items-center gap-2">
                  <span>📐</span>
                  <span>{L('सर्वाङ्गसम (Congruent: ≅)', 'Congruent Figures (≅)')}</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                  <li>{L('उही आकार (Same Shape) र उही नाप (Same Size)', 'Exact same shape and exact same size')}</li>
                  <li>{L('सबै संगत कोणहरू बराबर (Equal angles)', 'All corresponding angles are equal')}</li>
                  <li>{L('सबै संगत भुजाहरू हुबहु बराबर (Equal sides: k = 1)', 'All corresponding sides are equal (ratio = 1)')}</li>
                  <li>{L('एकअर्कामाथि ठ्याक्कै खप्टिन्छन्।', 'They overlap each other completely.')}</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
                <div className="text-amber-400 font-bold text-sm flex items-center gap-2">
                  <span>🔍</span>
                  <span>{L('समरूप (Similar: ~)', 'Similar Figures (~)')}</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                  <li>{L('उही आकार (Same Shape) तर नाप फरक हुन सक्ने', 'Same shape, but size can be different')}</li>
                  <li>{L('सबै संगत कोणहरू बराबर हुन्छन् (Equal angles)', 'All corresponding angles remain equal')}</li>
                  <li>{L('संगत भुजाहरू समानुपातिक हुन्छन् (Proportional sides)', 'Corresponding sides are proportional')}</li>
                  <li>{L('सबै सर्वाङ्गसम आकृतिहरू समरूप हुन्, तर सबै समरूप आकृतिहरू सर्वाङ्गसम होइनन्।', 'All congruent figures are similar, but not all similar figures are congruent.')}</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Corresponding Side Ratios */}
        {activeTab === 'proportions' && (
          <div className="space-y-4 p-5 bg-slate-900/90 rounded-2xl border border-slate-700">
            <h3 className="font-bold text-amber-300 text-base">
              {L('संगत भुजाहरूको समानुपातिक सम्बन्ध', 'Proportionality of Corresponding Sides')}
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              {L('यदि △ABC ~ △PQR भएमा संगत भुजाहरूको अनुपात सधैं स्थिर (समानुपातिक) हुन्छ:', 'If △ABC ~ △PQR, the ratios of their corresponding sides are constant:')}
            </p>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center font-mono text-lg text-emerald-400">
              AB / PQ = BC / QR = AC / PR = k
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-800 rounded-xl text-center">
                <div className="text-xs text-slate-400">AB / PQ</div>
                <div className="font-mono font-bold text-amber-300 mt-1">६ / ३ = २.०</div>
              </div>
              <div className="p-3 bg-slate-800 rounded-xl text-center">
                <div className="text-xs text-slate-400">BC / QR</div>
                <div className="font-mono font-bold text-amber-300 mt-1">१० / ५ = २.०</div>
              </div>
              <div className="p-3 bg-slate-800 rounded-xl text-center">
                <div className="text-xs text-slate-400">AC / PR</div>
                <div className="font-mono font-bold text-amber-300 mt-1">८ / ४ = २.०</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Unknown Side Solver Challenge */}
        {activeTab === 'unknown_solver' && (
          <div className="space-y-4 p-5 bg-slate-900/90 rounded-2xl border border-slate-700">
            <h3 className="font-bold text-amber-300 text-base">
              {L('समानुपात प्रयोग गरी अज्ञात भुजा पत्ता लगाउनुहोस्', 'Solve for Unknown Side Using Proportions')}
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              {L(
                'दिइएको छ: △ABC ~ △PQR। भुजा AB = ६ सेमी, PQ = ३ सेमी र BC = १० सेमी छन् भने QR = x को मान कति हुन्छ?',
                'Given: △ABC ~ △PQR. Side AB = 6 cm, PQ = 3 cm, and BC = 10 cm. Find the value of QR = x cm.'
              )}
            </p>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-sm text-slate-200 space-y-2">
              <div>१. समानुपात सूत्र: AB / PQ = BC / QR</div>
              <div>२. मान राख्दा: ६ / ३ = १० / x</div>
              <div>३. २ = १० / x ⇒ २x = १० ⇒ x = ?</div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-300">x =</span>
              <input
                type="number"
                value={userAnswerX}
                onChange={(e) => setUserAnswerX(e.target.value)}
                placeholder="5"
                className="w-24 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:border-amber-400 outline-none"
              />
              <span className="text-xs text-slate-400">सेमी (cm)</span>
              <button
                onClick={handleCheckUnknown}
                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition-all"
              >
                {L('जाँच गर्नुहोस्', 'Check Answer')}
              </button>
            </div>

            {solverVerdict && (
              <div
                className={`p-3 rounded-xl border text-sm font-bold ${
                  solverVerdict === 'correct'
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                }`}
              >
                {solverVerdict === 'correct'
                  ? L('🎉 सही उत्तर! x = ५ सेमी (किनकि ६/३ = १०/५ = २)', '🎉 Correct! x = 5 cm (since 6/3 = 10/5 = 2)')
                  : L('❌ मिलेन! कृपया ६/३ = १०/x हल गर्नुहोस्: २x = १० ⇒ x = ५', '❌ Incorrect! Solve 2x = 10 => x = 5 cm')}
              </div>
            )}
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default SimilarFiguresSimilarityLab;
