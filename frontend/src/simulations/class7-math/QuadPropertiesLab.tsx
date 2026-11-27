/**
 * QuadPropertiesLab.tsx
 * Grade 7 Mathematics – Lesson 14: PLANE FIGURES
 * Simulation 2: Quadrilateral Properties Laboratory
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 213-222)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Check, ShieldCheck, HelpCircle, Sparkles } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'कुन चतुर्भुजका चारवटै भुजाहरू बराबर र चारवटै कोणहरू 90° (समकोण) हुन्छन्?',
    en: 'Which quadrilateral has all four sides equal and all four angles 90° (Right angles)?',
    options: [
      { key: 'A', label: 'Square' },
      { key: 'B', label: 'Rectangle' },
      { key: 'C', label: 'Parallelogram' },
      { key: 'D', label: 'Trapezium' },
    ],
    answer: 'A',
  },
  {
    np: 'Parallelogram (Parallelogram) का विकर्णहरू (Diagonals) को मुख्य गुण के हो?',
    en: 'What is the key property of the diagonals of a parallelogram?',
    options: [
      { key: 'A', label: 'They bisect each other' },
      { key: 'B', label: 'They are always equal in length' },
      { key: 'C', label: 'They always cross at 90°' },
      { key: 'D', label: 'They never cross' },
    ],
    answer: 'A',
  },
  {
    np: 'Rectangle का विकर्णहरूको सम्बन्धमा कुन भनाइ सत्य छ?',
    en: 'Which statement is TRUE regarding the diagonals of a rectangle?',
    options: [
      { key: 'A', label: 'The diagonals are equal in length (AC = BD)' },
      { key: 'B', label: 'The diagonals are always non-parallel' },
      { key: 'C', label: 'The diagonals cross only at 90°' },
      { key: 'D', label: 'The diagonals are unequal' },
    ],
    answer: 'A',
  },
  {
    np: 'कुन दुई चतुर्भुजहरूका विकर्णहरू आपसमा 90° (समकोण) मा काटिन्छन्?',
    en: 'In which two quadrilaterals do the diagonals bisect each other at 90° (Right angles)?',
    options: [
      { key: 'A', label: 'Square and rhombus' },
      { key: 'B', label: 'Rectangle and parallelogram' },
      { key: 'C', label: 'Trapezium and kite' },
      { key: 'D', label: 'Rectangle and square' },
    ],
    answer: 'A',
  },
];

type QuadType = 'parallelogram' | 'rectangle' | 'square' | 'rhombus';

export const QuadPropertiesLab: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L14-02',
    chapter: 14,
    titleNp: 'चतुर्भुजका गुणहरूको प्रयोगशाला (Quadrilateral Properties Lab)',
    titleEn: 'Quadrilateral Properties Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [selectedQuad, setSelectedQuad] = useState<QuadType>('parallelogram');
  const [showDiagonals, setShowDiagonals] = useState<boolean>(true);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! Parallelogram, आयत, वर्ग र समबाहु चतुर्भुजका भुजाहरू, कोणहरू र विकर्णहरूको जादुमयी गुणहरू हेरौँ!',
        'Hello! Explore the sides, angles, and diagonal properties of parallelograms, rectangles, squares, and rhombuses!'
      )}
    >
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Quad Type Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-indigo-50/80 p-2 rounded-2xl border border-indigo-200">
          {[
            { id: 'parallelogram', np: 'Parallelogram (Parallelogram)', en: 'Parallelogram' },
            { id: 'rectangle', np: 'Rectangle', en: 'Rectangle' },
            { id: 'square', np: 'Square', en: 'Square' },
            { id: 'rhombus', np: 'समबाहु चतुर्भुज (Rhombus)', en: 'Rhombus' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedQuad(item.id as QuadType)}
              className={`p-3 rounded-xl font-bold text-xs transition-all shadow-sm ${
                selectedQuad === item.id
                  ? 'bg-indigo-600 text-white shadow-indigo-200 ring-2 ring-indigo-400'
                  : 'bg-white text-slate-700 hover:bg-indigo-100'
              }`}
            >
              {isNe ? item.np : item.en}
            </button>
          ))}
        </div>

        {/* Visual Lab and Properties */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* SVG Visual */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-center">
              <svg width="320" height="240" viewBox="0 0 320 240">
                {selectedQuad === 'parallelogram' && (
                  <>
                    {/* Points: A(80, 50), B(260, 50), C(220, 190), D(40, 190) */}
                    <polygon
                      points="80,50 260,50 220,190 40,190"
                      fill="rgba(99, 102, 241, 0.2)"
                      stroke="#4f46e5"
                      strokeWidth="3"
                    />
                    {showDiagonals && (
                      <>
                        <line x1="80" y1="50" x2="220" y2="190" stroke="#ef4444" strokeWidth="2" strokeDasharray="4" />
                        <line x1="260" y1="50" x2="40" y2="190" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="4" />
                        <circle cx="150" cy="120" r="4" fill="#0f172a" />
                        <text x="155" y="115" fontSize="12" fontWeight="bold">O</text>
                      </>
                    )}
                    <text x="65" y="45" fontSize="14" fontWeight="bold">A</text>
                    <text x="270" y="45" fontSize="14" fontWeight="bold">B</text>
                    <text x="230" y="205" fontSize="14" fontWeight="bold">C</text>
                    <text x="25" y="205" fontSize="14" fontWeight="bold">D</text>

                    {/* Opposite side tick marks */}
                    <text x="170" y="42" fontSize="11" fill="#4338ca" fontWeight="bold">AB = DC</text>
                    <text x="120" y="205" fontSize="11" fill="#4338ca" fontWeight="bold">DC</text>
                  </>
                )}

                {selectedQuad === 'rectangle' && (
                  <>
                    {/* Points: A(50, 60), B(270, 60), C(270, 180), D(50, 180) */}
                    <polygon
                      points="50,60 270,60 270,180 50,180"
                      fill="rgba(16, 185, 129, 0.2)"
                      stroke="#059669"
                      strokeWidth="3"
                    />
                    {/* 90 deg corner markers */}
                    <path d="M 50 75 L 65 75 L 65 60" fill="none" stroke="#059669" strokeWidth="2" />
                    <path d="M 270 75 L 255 75 L 255 60" fill="none" stroke="#059669" strokeWidth="2" />
                    <path d="M 270 165 L 255 165 L 255 180" fill="none" stroke="#059669" strokeWidth="2" />
                    <path d="M 50 165 L 65 165 L 65 180" fill="none" stroke="#059669" strokeWidth="2" />

                    {showDiagonals && (
                      <>
                        <line x1="50" y1="60" x2="270" y2="180" stroke="#ef4444" strokeWidth="2.5" />
                        <line x1="270" y1="60" x2="50" y2="180" stroke="#ef4444" strokeWidth="2.5" />
                        <circle cx="160" cy="120" r="4" fill="#0f172a" />
                        <text x="165" y="115" fontSize="12" fontWeight="bold">O</text>
                      </>
                    )}
                    <text x="35" y="55" fontSize="14" fontWeight="bold">A</text>
                    <text x="280" y="55" fontSize="14" fontWeight="bold">B</text>
                    <text x="280" y="195" fontSize="14" fontWeight="bold">C</text>
                    <text x="35" y="195" fontSize="14" fontWeight="bold">D</text>
                  </>
                )}

                {selectedQuad === 'square' && (
                  <>
                    {/* Points: A(80, 50), B(220, 50), C(220, 190), D(80, 190) */}
                    <polygon
                      points="80,50 220,50 220,190 80,190"
                      fill="rgba(245, 158, 11, 0.2)"
                      stroke="#d97706"
                      strokeWidth="3"
                    />
                    {/* 90 deg markers */}
                    <path d="M 80 65 L 95 65 L 95 50" fill="none" stroke="#d97706" strokeWidth="2" />
                    <path d="M 220 65 L 205 65 L 205 50" fill="none" stroke="#d97706" strokeWidth="2" />
                    <path d="M 220 175 L 205 175 L 205 190" fill="none" stroke="#d97706" strokeWidth="2" />
                    <path d="M 80 175 L 95 175 L 95 190" fill="none" stroke="#d97706" strokeWidth="2" />

                    {showDiagonals && (
                      <>
                        <line x1="80" y1="50" x2="220" y2="190" stroke="#ef4444" strokeWidth="2.5" />
                        <line x1="220" y1="50" x2="80" y2="190" stroke="#ef4444" strokeWidth="2.5" />
                        <circle cx="150" cy="120" r="4" fill="#0f172a" />
                        <text x="155" y="115" fontSize="12" fontWeight="bold">O (90°)</text>
                      </>
                    )}
                    <text x="65" y="45" fontSize="14" fontWeight="bold">A</text>
                    <text x="230" y="45" fontSize="14" fontWeight="bold">B</text>
                    <text x="230" y="205" fontSize="14" fontWeight="bold">C</text>
                    <text x="65" y="205" fontSize="14" fontWeight="bold">D</text>
                  </>
                )}

                {selectedQuad === 'rhombus' && (
                  <>
                    {/* Points: A(160, 40), B(270, 120), C(160, 200), D(50, 120) */}
                    <polygon
                      points="160,40 270,120 160,200 50,120"
                      fill="rgba(147, 51, 234, 0.2)"
                      stroke="#9333ea"
                      strokeWidth="3"
                    />
                    {showDiagonals && (
                      <>
                        <line x1="160" y1="40" x2="160" y2="200" stroke="#ef4444" strokeWidth="2" strokeDasharray="4" />
                        <line x1="50" y1="120" x2="270" y2="120" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="4" />
                        <circle cx="160" cy="120" r="4" fill="#0f172a" />
                        {/* 90 deg marker at intersection */}
                        <path d="M 160 110 L 170 110 L 170 120" fill="none" stroke="#0f172a" strokeWidth="1.5" />
                        <text x="175" y="115" fontSize="11" fontWeight="bold">90°</text>
                      </>
                    )}
                    <text x="155" y="30" fontSize="14" fontWeight="bold">A</text>
                    <text x="280" y="125" fontSize="14" fontWeight="bold">B</text>
                    <text x="155" y="220" fontSize="14" fontWeight="bold">C</text>
                    <text x="35" y="125" fontSize="14" fontWeight="bold">D</text>
                  </>
                )}
              </svg>

              <button
                onClick={() => setShowDiagonals(!showDiagonals)}
                className="mt-3 px-4 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm"
              >
                {showDiagonals
                  ? L('विकर्णहरू लुकाउनुहोस् (Hide Diagonals)', 'Hide Diagonals')
                  : L('विकर्णहरू देखाउनुहोस् (Show Diagonals)', 'Show Diagonals')}
              </button>
            </div>

            {/* Properties Checklist */}
            <div className="space-y-4">
              <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-200">
                <div className="text-base font-bold text-indigo-950 flex items-center gap-2" style={{ fontFamily: FONT_NP }}>
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  {selectedQuad === 'parallelogram' && L('Parallelogram (Parallelogram) का विशेषताहरू:', 'Parallelogram Properties:')}
                  {selectedQuad === 'rectangle' && L('Rectangle का मुख्य विशेषताहरू:', 'Rectangle Properties:')}
                  {selectedQuad === 'square' && L('Square का मुख्य विशेषताहरू:', 'Square Properties:')}
                  {selectedQuad === 'rhombus' && L('समबाहु चतुर्भुज (Rhombus) का मुख्य विशेषताहरू:', 'Rhombus Properties:')}
                </div>

                <ul className="mt-3 space-y-2 text-xs md:text-sm text-slate-700">
                  {selectedQuad === 'parallelogram' && (
                    <>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>{L('1. सम्मुख भुजाहरू समान्तर र बराबर हुन्छन् (AB = DC, AD = BC)।', '1. Opposite sides are parallel and equal.')}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>{L('2. सम्मुख कोणहरू बराबर हुन्छन् (∠A = ∠C, ∠B = ∠D)।', '2. Opposite angles are equal.')}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>{L('3. विकर्णहरूले एकअर्कालाई समद्विभाजन गर्छन् (AO = OC, BO = OD)।', '3. Diagonals bisect each other.')}</span>
                      </li>
                    </>
                  )}

                  {selectedQuad === 'rectangle' && (
                    <>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>{L('1. सम्मुख भुजाहरू बराबर र समानान्तर हुन्छन्।', '1. Opposite sides are equal and parallel.')}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>{L('2. चारवटै कोणहरू समकोण (90°) हुन्छन्।', '2. All four angles are right angles (90°).')}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>{L('3. दुवै The diagonals are equal in length (AC = BD) र समद्विभाजन गर्छन्।', '3. Diagonals are equal (AC = BD) and bisect each other.')}</span>
                      </li>
                    </>
                  )}

                  {selectedQuad === 'square' && (
                    <>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>{L('1. चारवटै भुजाहरू लम्बाइमा बराबर हुन्छन् (AB = BC = CD = DA)।', '1. All four sides are equal.')}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>{L('2. चारवटै भित्री कोणहरू 90° का हुन्छन्।', '2. All four interior angles are 90°.')}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>{L('3. विकर्णहरू बराबर हुन्छन् र 90° मा समद्विभाजन गर्छन् (AC ⊥ BD)।', '3. Diagonals are equal and perpendicular bisectors (90°).')}</span>
                      </li>
                    </>
                  )}

                  {selectedQuad === 'rhombus' && (
                    <>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>{L('1. चारवटै भुजाहरू बराबर हुन्छन्।', '1. All four sides are equal.')}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>{L('2. सम्मुख कोणहरू बराबर हुन्छन्।', '2. Opposite angles are equal.')}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>{L('3. The diagonals are unequal तर एकअर्कालाई 90° मा समद्विभाजन गर्छन्।', '3. Diagonals bisect each other at right angles (90°).')}</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Comparison Summary Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs border-collapse bg-slate-50 rounded-2xl overflow-hidden border border-slate-200">
              <thead className="bg-slate-200 text-slate-800 font-bold">
                <tr>
                  <th className="p-2.5 text-left border-r border-slate-300">{L('गुण / विशेषता (Properties)', 'Properties')}</th>
                  <th className="p-2.5 border-r border-slate-300">{L('Parallelogram', 'Parallelogram')}</th>
                  <th className="p-2.5 border-r border-slate-300">{L('Rectangle', 'Rectangle')}</th>
                  <th className="p-2.5 border-r border-slate-300">{L('Square', 'Square')}</th>
                  <th className="p-2.5">{L('समबाहु चतुर्भुज (Rhombus)', 'Rhombus')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2.5 text-left font-semibold border-r border-slate-200">{L('चारै भुजा बराबर', 'All sides equal')}</td>
                  <td className="p-2.5 border-r border-slate-200 text-rose-500 font-bold">✕</td>
                  <td className="p-2.5 border-r border-slate-200 text-rose-500 font-bold">✕</td>
                  <td className="p-2.5 border-r border-slate-200 text-emerald-600 font-bold">✓</td>
                  <td className="p-2.5 text-emerald-600 font-bold">✓</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-left font-semibold border-r border-slate-200">{L('सबै कोण 90°', 'All angles 90°')}</td>
                  <td className="p-2.5 border-r border-slate-200 text-rose-500 font-bold">✕</td>
                  <td className="p-2.5 border-r border-slate-200 text-emerald-600 font-bold">✓</td>
                  <td className="p-2.5 border-r border-slate-200 text-emerald-600 font-bold">✓</td>
                  <td className="p-2.5 text-rose-500 font-bold">✕</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-left font-semibold border-r border-slate-200">{L('विकर्णहरू बराबर (AC=BD)', 'Diagonals equal')}</td>
                  <td className="p-2.5 border-r border-slate-200 text-rose-500 font-bold">✕</td>
                  <td className="p-2.5 border-r border-slate-200 text-emerald-600 font-bold">✓</td>
                  <td className="p-2.5 border-r border-slate-200 text-emerald-600 font-bold">✓</td>
                  <td className="p-2.5 text-rose-500 font-bold">✕</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-left font-semibold border-r border-slate-200">{L('विकर्ण 90° मा काटिने', 'Diagonals ⊥ at 90°')}</td>
                  <td className="p-2.5 border-r border-slate-200 text-rose-500 font-bold">✕</td>
                  <td className="p-2.5 border-r border-slate-200 text-rose-500 font-bold">✕</td>
                  <td className="p-2.5 border-r border-slate-200 text-emerald-600 font-bold">✓</td>
                  <td className="p-2.5 text-emerald-600 font-bold">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};

export default QuadPropertiesLab;
