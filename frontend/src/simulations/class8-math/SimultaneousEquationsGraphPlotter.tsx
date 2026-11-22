/**
 * SimultaneousEquationsGraphPlotter.tsx
 * Grade 8 Mathematics – Unit 12: SIMULTANEOUS & QUADRATIC EQUATIONS (युगपत र द्विघात समीकरण)
 * Simulation 1: Simultaneous Equations Graph Plotter (युगपत समीकरण रेखाचित्र प्लटर)
 * Strictly adheres to CDC Nepal Grade 8 Mathematics Curriculum (2023 edition, Unit 12)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { TrendingUp, CheckCircle, RefreshCw, Award, Move, Table } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'ग्राफीय विधिबाट युगपत समीकरण हल गर्दा दुई रेखा काटिएको बिन्दु (Intersection Point) ले के जनाउँछ?',
    en: 'When solving simultaneous equations graphically, what does the intersection point of two lines represent?',
    options: [
      { key: 'A', label: 'समीकरणको हल: (x, y) को मान (The unique solution to both equations)' },
      { key: 'B', label: 'समीकरणको योगफल' },
      { key: 'C', label: 'कुनै अर्थ हुँदैन' },
      { key: 'D', label: 'y-अक्षको बिन्दु मात्र' },
    ],
    answer: 'A',
  },
  {
    np: 'x + y = 6 र x - y = 2 को प्रतिच्छेदन बिन्दु कुन हो?',
    en: 'What is the intersection point of x + y = 6 and x - y = 2?',
    options: [
      { key: 'A', label: '(4, 2) [ 4 + 2 = 6 र 4 - 2 = 2 ]' },
      { key: 'B', label: '(3, 3)' },
      { key: 'C', label: '(5, 1)' },
      { key: 'D', label: '(2, 4)' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि दुई समीकरणका रेखाहरू समानान्तर (Parallel) भए त्यसको कतिवटा हल हुन्छ?',
    en: 'If the lines of two linear equations are parallel, how many solutions exist?',
    options: [
      { key: 'A', label: 'कुनै पनि हल हुँदैन (No solution: रेखा कहिल्यै काटिँदैनन्)' },
      { key: 'B', label: 'एउटा मात्र हल' },
      { key: 'C', label: 'अनगिन्ती हल' },
      { key: 'D', label: 'दुईवटा हल' },
    ],
    answer: 'A',
  },
  {
    np: 'समीकरण x + y = 6 मा x = 2 राख्दा y को मान कति हुन्छ?',
    en: 'In equation x + y = 6, when x = 2, what is the value of y?',
    options: [
      { key: 'A', label: '४ [ y = ६ - २ = ४ ]' },
      { key: 'B', label: '२' },
      { key: 'C', label: '८' },
      { key: 'D', label: '६' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि दुई रेखाहरू एकमाथि अर्को खप्टिएका (Coincident Lines) छन् भने हलको संख्या के हुन्छ?',
    en: 'If two lines are coincident (overlapping), how many solutions exist?',
    options: [
      { key: 'A', label: 'अनगिन्ती हल (Infinitely many solutions)' },
      { key: 'B', label: 'शून्य हल' },
      { key: 'C', label: 'एउटा मात्र हल' },
      { key: 'D', label: 'दुईवटा हल' },
    ],
    answer: 'A',
  },
];

const PRESETS = [
  {
    nameNp: 'x + y = 6 र x - y = 2 (CDC मुख्य पाठ्यपुस्तक उदाहरण)',
    nameEn: 'x + y = 6 & x - y = 2',
    eq1: { a: 1, b: 1, c: 6, label: 'x + y = 6' },
    eq2: { a: 1, b: -1, c: 2, label: 'x - y = 2' },
    solX: 4,
    solY: 2,
    table1: [{ x: 0, y: 6 }, { x: 2, y: 4 }, { x: 4, y: 2 }, { x: 6, y: 0 }],
    table2: [{ x: 0, y: -2 }, { x: 2, y: 0 }, { x: 4, y: 2 }, { x: 6, y: 4 }],
  },
  {
    nameNp: '2x + y = 7 र x - y = 2',
    nameEn: '2x + y = 7 & x - y = 2',
    eq1: { a: 2, b: 1, c: 7, label: '2x + y = 7' },
    eq2: { a: 1, b: -1, c: 2, label: 'x - y = 2' },
    solX: 3,
    solY: 1,
    table1: [{ x: 1, y: 5 }, { x: 2, y: 3 }, { x: 3, y: 1 }, { x: 4, y: -1 }],
    table2: [{ x: 1, y: -1 }, { x: 2, y: 0 }, { x: 3, y: 1 }, { x: 4, y: 2 }],
  },
];

export const SimultaneousEquationsGraphPlotter: React.FC<{
  onBack?: () => void;
  onBackToLibrary?: () => void;
}> = ({ onBack, onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U12-01',
    chapter: 12,
    titleNp: 'युगपत समीकरण रेखाचित्र प्लटर (Simultaneous Equations Graph Plotter)',
    titleEn: 'Simultaneous Equations Graph Plotter',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'graph' | 'tables' | 'line_types'>('graph');
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);

  // Coordinate plane mapping
  // Origin (0,0) mapped to SVG (150, 150), scale = 16px per unit
  const mapX = (x: number) => 150 + x * 16;
  const mapY = (y: number) => 150 - y * 16;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! ग्राफमा दुई सरल रेखाहरू जुन बिन्दुमा काटिन्छन्, त्यही बिन्दुका निर्देशांक (x, y) नै युगपत समीकरणका हल हुन्!',
        'Hello! The point of intersection on the coordinate graph gives the exact simultaneous solution (x, y)!'
      )}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('graph')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'graph' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            {L('१. रेखाचित्र र प्रतिच्छेदन (Graph & Intersection)', '1. Graph & Intersection')}
          </button>
          <button
            onClick={() => setActiveTab('tables')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'tables' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Table className="w-4 h-4" />
            {L('२. मान तालिका निर्माण (Value Tables)', '2. Value Tables')}
          </button>
          <button
            onClick={() => setActiveTab('line_types')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'line_types' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Move className="w-4 h-4" />
            {L('३. रेखाहरूका सम्बन्धहरू (१ हल, शून्य हल, अनगिन्ती हल)', '3. Types of Solutions')}
          </button>
        </div>

        {/* Tab 1: Graph & Intersection */}
        {activeTab === 'graph' && (
          <div className="space-y-6">
            {/* Preset Selector */}
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPreset(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                    selectedPreset.nameEn === p.nameEn
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {isNe ? p.nameNp : p.nameEn}
                </button>
              ))}
            </div>

            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* SVG Coordinate Grid */}
              <div className="w-full h-80 bg-slate-950 rounded-2xl flex items-center justify-center p-2 relative overflow-hidden border border-slate-800">
                <svg viewBox="0 0 300 300" className="w-full h-full">
                  {/* Grid lines */}
                  {Array.from({ length: 19 }).map((_, i) => {
                    const coord = i * 16 + 6;
                    return (
                      <React.Fragment key={i}>
                        <line x1={coord} y1="0" x2={coord} y2="300" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                        <line x1="0" y1={coord} x2="300" y2={coord} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                      </React.Fragment>
                    );
                  })}

                  {/* Axes */}
                  <line x1="0" y1="150" x2="300" y2="150" stroke="#94a3b8" strokeWidth="2" />
                  <line x1="150" y1="0" x2="150" y2="300" stroke="#94a3b8" strokeWidth="2" />
                  <text x="290" y="145" fill="#94a3b8" fontSize="10" fontWeight="bold">X</text>
                  <text x="155" y="15" fill="#94a3b8" fontSize="10" fontWeight="bold">Y</text>

                  {/* Line 1 (Blue) */}
                  <line
                    x1={mapX(-2)}
                    y1={mapY((selectedPreset.eq1.c - selectedPreset.eq1.a * -2) / selectedPreset.eq1.b)}
                    x2={mapX(8)}
                    y2={mapY((selectedPreset.eq1.c - selectedPreset.eq1.a * 8) / selectedPreset.eq1.b)}
                    stroke="#38bdf8"
                    strokeWidth="3"
                  />

                  {/* Line 2 (Pink) */}
                  <line
                    x1={mapX(-2)}
                    y1={mapY((selectedPreset.eq2.c - selectedPreset.eq2.a * -2) / selectedPreset.eq2.b)}
                    x2={mapX(8)}
                    y2={mapY((selectedPreset.eq2.c - selectedPreset.eq2.a * 8) / selectedPreset.eq2.b)}
                    stroke="#ec4899"
                    strokeWidth="3"
                  />

                  {/* Points on Line 1 */}
                  {selectedPreset.table1.map((pt, idx) => (
                    <circle key={`l1-${idx}`} cx={mapX(pt.x)} cy={mapY(pt.y)} r="3" fill="#38bdf8" />
                  ))}

                  {/* Points on Line 2 */}
                  {selectedPreset.table2.map((pt, idx) => (
                    <circle key={`l2-${idx}`} cx={mapX(pt.x)} cy={mapY(pt.y)} r="3" fill="#ec4899" />
                  ))}

                  {/* Intersection point Highlight */}
                  <circle
                    cx={mapX(selectedPreset.solX)}
                    cy={mapY(selectedPreset.solY)}
                    r="7"
                    fill="#fbbf24"
                    stroke="#fff"
                    strokeWidth="2"
                    className="animate-pulse"
                  />
                  <text
                    x={mapX(selectedPreset.solX) + 10}
                    y={mapY(selectedPreset.solY) - 10}
                    fill="#fbbf24"
                    fontSize="12"
                    fontWeight="black"
                  >
                    ({selectedPreset.solX}, {selectedPreset.solY})
                  </text>
                </svg>
              </div>

              {/* Solution Card & Verification */}
              <div className="space-y-4">
                <div className="p-5 bg-slate-800 rounded-2xl border border-slate-700 space-y-3 font-mono">
                  <div className="text-xs font-bold uppercase text-amber-400 font-sans">
                    {L('समीकरणहरू र प्रतिच्छेदन बिन्दु:', 'Equations & Solution:')}
                  </div>
                  <div className="text-sm">
                    • रेखा १ (नीलो): <span className="text-sky-400 font-bold">{selectedPreset.eq1.label}</span><br />
                    • रेखा २ (गुलाबी): <span className="text-pink-400 font-bold">{selectedPreset.eq2.label}</span>
                  </div>

                  <div className="p-4 bg-emerald-950/90 border border-emerald-500 rounded-xl text-center space-y-1">
                    <div className="text-xs uppercase text-emerald-400 font-bold font-sans">
                      प्रतिच्छेदन बिन्दुबाट प्राप्त हल:
                    </div>
                    <div className="text-3xl font-black text-amber-400">
                      x = {toNp(selectedPreset.solX)}, y = {toNp(selectedPreset.solY)}
                    </div>
                  </div>

                  {/* Verification */}
                  <div className="text-xs text-slate-300 font-sans space-y-1 pt-2 border-t border-slate-700">
                    <div className="font-bold text-emerald-400">जाँच (Verification):</div>
                    <div>१. पहिलो समीकरणमा: {selectedPreset.eq1.a}×{selectedPreset.solX} + {selectedPreset.eq1.b}×{selectedPreset.solY} = {selectedPreset.eq1.c} ✓</div>
                    <div>२. दोस्रो समीकरणमा: {selectedPreset.eq2.a}×{selectedPreset.solX} + ({selectedPreset.eq2.b})×{selectedPreset.solY} = {selectedPreset.eq2.c} ✓</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Value Tables */}
        {activeTab === 'tables' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800">
                  {L('ग्राफीय विधिमा मान तालिका निर्माण (Preparing Value Tables)', 'Preparing Value Tables')}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {L('x को मान आफ्नै रोजाइमा राखेर y को मान निकाल्ने र क्रमजोडी (x, y) बनाउने:', 'Choose arbitrary x values to compute corresponding y values and form ordered pairs (x, y):')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
                {/* Table 1 */}
                <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl space-y-3">
                  <div className="font-bold text-sky-900 font-sans text-sm">
                    समीकरण १: {selectedPreset.eq1.label} ⇒ y = {selectedPreset.eq1.c} - {selectedPreset.eq1.a !== 1 ? `${selectedPreset.eq1.a}x` : 'x'}
                  </div>
                  <table className="w-full text-center bg-white rounded-xl overflow-hidden border border-sky-100">
                    <thead>
                      <tr className="bg-sky-200/60 font-bold text-sky-900">
                        <th className="p-2">x</th>
                        {selectedPreset.table1.map((p, i) => (
                          <td key={i} className="p-2">{toNp(p.x)}</td>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="font-bold text-sky-700 border-t border-sky-100">
                        <th className="p-2 bg-sky-100/50">y</th>
                        {selectedPreset.table1.map((p, i) => (
                          <td key={i} className="p-2">{toNp(p.y)}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Table 2 */}
                <div className="p-4 bg-pink-50 border border-pink-200 rounded-2xl space-y-3">
                  <div className="font-bold text-pink-900 font-sans text-sm">
                    समीकरण २: {selectedPreset.eq2.label} ⇒ y = x - {selectedPreset.eq2.c}
                  </div>
                  <table className="w-full text-center bg-white rounded-xl overflow-hidden border border-pink-100">
                    <thead>
                      <tr className="bg-pink-200/60 font-bold text-pink-900">
                        <th className="p-2">x</th>
                        {selectedPreset.table2.map((p, i) => (
                          <td key={i} className="p-2">{toNp(p.x)}</td>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="font-bold text-pink-700 border-t border-pink-100">
                        <th className="p-2 bg-pink-100/50">y</th>
                        {selectedPreset.table2.map((p, i) => (
                          <td key={i} className="p-2">{toNp(p.y)}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Line Types & Solutions */}
        {activeTab === 'line_types' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800">
                  {L('रेखाहरूको प्रकृति र हलहरूको संख्या (Nature of Solutions)', 'Nature of Solutions in Simultaneous Equations')}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-2">
                  <div className="font-bold text-emerald-950 text-sm">१. प्रतिच्छेदी रेखाहरू (Intersecting)</div>
                  <div className="text-xs text-slate-600">• दुई रेखा एउटा बिन्दुमा काटिन्छन्।</div>
                  <div className="text-xs font-bold text-emerald-700">• अद्वितीय हल (Unique Solution: 1 Solution)</div>
                </div>

                <div className="p-5 bg-amber-50 border border-amber-300 rounded-2xl space-y-2">
                  <div className="font-bold text-amber-950 text-sm">२. समानान्तर रेखाहरू (Parallel Lines)</div>
                  <div className="text-xs text-slate-600">• दुई रेखा कहिल्यै काटिँदैनन्।</div>
                  <div className="text-xs font-bold text-amber-700">• कुनै पनि हल हुँदैन (No Solution)</div>
                </div>

                <div className="p-5 bg-purple-50 border border-purple-300 rounded-2xl space-y-2">
                  <div className="font-bold text-purple-950 text-sm">३. खप्टिएका रेखाहरू (Coincident Lines)</div>
                  <div className="text-xs text-slate-600">• दुवै समीकरणले एउटै रेखा जनाउँछन्।</div>
                  <div className="text-xs font-bold text-purple-700">• अनगिन्ती हल (Infinitely Many Solutions)</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default SimultaneousEquationsGraphPlotter;
