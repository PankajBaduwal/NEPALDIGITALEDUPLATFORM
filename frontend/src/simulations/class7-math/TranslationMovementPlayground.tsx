/**
 * TranslationMovementPlayground.tsx
 * Grade 7 Mathematics – Lesson 19: TRANSFORMATION
 * Simulation 2: Translation and Movement Playground
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 286-292)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { ArrowRight, Move, ArrowUp, ArrowDown, ArrowLeft, Check, Sparkles } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'कुनै वस्तुलाई यसको आकार र नाप नबदली निश्चित दिशा र परिमाणमा सार्ने क्रियालाई के भनिन्छ?',
    en: 'Moving an object in a fixed direction by a fixed distance without changing its size or shape is called:',
    options: [
      { key: 'A', label: 'Translation' },
      { key: 'B', label: 'Reflection' },
      { key: 'C', label: 'Rotation' },
      { key: 'D', label: 'Symmetry' },
    ],
    answer: 'A',
  },
  {
    np: 'बिन्दु P(2, 3) लाई 4 एकाइ दायाँ (Right) र 3 एकाइ माथि (Up) स्थानान्तरण गर्दा नयाँ बिन्दु P\' को निर्देशाङ्क कति हुन्छ?',
    en: 'If point P(2, 3) is translated 4 units right and 3 units up, what is the new coordinate P\'?',
    options: [
      { key: 'A', label: 'P\'(6, 6)' },
      { key: 'B', label: 'P\'(2, 6)' },
      { key: 'C', label: 'P\'(−2, 0)' },
      { key: 'D', label: 'P\'(8, 9)' },
    ],
    answer: 'A',
  },
  {
    np: 'स्थानान्तरण गर्दा वस्तुका सबै बिन्दुहरू कस्तो दिशा र दूरीमा सर्दछन्?',
    en: 'During translation, all points of the object move:',
    options: [
      { key: 'A', label: 'In the same direction and the same distance' },
      { key: 'B', label: 'In different directions' },
      { key: 'C', label: 'In the opposite direction' },
      { key: 'D', label: 'In a circular way' },
    ],
    answer: 'A',
  },
  {
    np: 'टेबुलमा इरेजरलाई सिधा रेखामा सार्नु वा चिप्लेटीमा बच्चा चिप्लिनु कुन रूपान्तरणको उदाहरण हो?',
    en: 'Sliding an eraser straight on a table or a child sliding down a slide is an example of:',
    options: [
      { key: 'A', label: 'Translation' },
      { key: 'B', label: 'Reflection' },
      { key: 'C', label: 'Tessellation' },
      { key: 'D', label: 'Bearing' },
    ],
    answer: 'A',
  },
];

type TransTab = 'vector_playground' | 'segment_parallel' | 'polygon_trans' | 'real_life';

export const TranslationMovementPlayground: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L19-02',
    chapter: 19,
    titleNp: 'स्थानान्तरण र गति खेलमैदान (Translation Playground)',
    titleEn: 'Translation and Movement Playground',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [tab, setTab] = useState<TransTab>('vector_playground');

  // Vector Displacement
  const [dx, setDx] = useState<number>(4);
  const [dy, setDy] = useState<number>(3);

  // Single Point Start
  const [startX, setStartX] = useState<number>(1);
  const [startY, setStartY] = useState<number>(2);

  // Line Segment Start P(1, 2) and Q(3, 5)
  const p1: [number, number] = [1, 2];
  const q1: [number, number] = [3, 5];

  // Polygon Triangle Start: P(1, 1), Q(4, 1), R(2, 4)
  const triVertices: [number, number][] = [
    [1, 1],
    [4, 1],
    [2, 4],
  ];

  // SVG coordinate transform
  // Domain [-3, 9] x [-3, 9] -> [0, 320] x [0, 320]
  const toX = (x: number) => 80 + x * 22;
  const toY = (y: number) => 240 - y * 22;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते विद्यार्थीहरू! कुनै आकृतिलाई आकार नबदली सिधा सार्ने क्रिया नै स्थानान्तरण हो। परिमाण र दिशा मिलाएर सारौँ!',
        'Hello students! Moving a shape straight without altering size or shape is translation. Let us explore vectors and displacement!'
      )}
    >
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 justify-center bg-indigo-50/80 p-2 rounded-2xl border border-indigo-200">
          {[
            { id: 'vector_playground', np: '1. बिन्दु स्थानान्तरण (Translate Point)', en: '1. Translate Point' },
            { id: 'segment_parallel', np: '2. रेखाखण्ड स्थानान्तरण (Translate Segment)', en: '2. Translate Line Segment' },
            { id: 'polygon_trans', np: '3. त्रिभुज स्थानान्तरण (Translate Triangle)', en: '3. Translate Polygon' },
            { id: 'real_life', np: '4. व्यावहारिक उदाहरण (Real-life Motion)', en: '4. Real-Life Examples' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as TransTab)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
                tab === t.id
                  ? 'bg-indigo-600 text-white shadow-indigo-200 ring-2 ring-indigo-400'
                  : 'bg-white text-slate-700 hover:bg-indigo-100'
              }`}
            >
              {isNe ? t.np : t.en}
            </button>
          ))}
        </div>

        {/* Tab 1: Translate Point */}
        {tab === 'vector_playground' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-2xl">
              <h3 className="text-base font-bold text-blue-950" style={{ fontFamily: FONT_NP }}>
                {L('स्थानान्तरणको सिद्धान्त (Principle of Translation):', 'Principle of Translation:')}
              </h3>
              <p className="text-slate-700 text-xs md:text-sm mt-1">
                {L(
                  'यदि बिन्दु P(x, y) लाई a एकाइ दायाँ/बायाँ र b एकाइ माथि/तल सारियो भने नयाँ प्रतिबिम्ब P\'(x + a, y + b) हुन्छ।',
                  'If point P(x, y) is displaced by vector (a, b), its new position is P\'(x + a, y + b).'
                )}
              </p>
            </div>

            {/* Vector direction controller */}
            <div className="flex flex-wrap items-center justify-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">{L('दायाँ/बायाँ (x-अन्तर):', 'Horizontal (dx):')}</span>
                <input
                  type="range"
                  min="-3"
                  max="5"
                  value={dx}
                  onChange={(e) => setDx(Number(e.target.value))}
                  className="w-24 h-2 bg-blue-200 rounded-lg cursor-pointer"
                />
                <span className="text-xs font-black text-blue-700">{dx >= 0 ? `+${dx}` : dx}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">{L('माथि/तल (y-अन्तर):', 'Vertical (dy):')}</span>
                <input
                  type="range"
                  min="-3"
                  max="5"
                  value={dy}
                  onChange={(e) => setDy(Number(e.target.value))}
                  className="w-24 h-2 bg-emerald-200 rounded-lg cursor-pointer"
                />
                <span className="text-xs font-black text-emerald-700">{dy >= 0 ? `+${dy}` : dy}</span>
              </div>
            </div>

            {/* Visual Grid and Result */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center">
                <svg width="320" height="280" viewBox="0 0 320 280">
                  {/* Grid Lines */}
                  {Array.from({ length: 14 }).map((_, i) => (
                    <g key={i}>
                      <line x1={i * 22 + 14} y1="14" x2={i * 22 + 14} y2="266" stroke="#e2e8f0" strokeWidth="1" />
                      <line x1="14" y1={i * 22 + 14} x2="306" y2={i * 22 + 14} stroke="#e2e8f0" strokeWidth="1" />
                    </g>
                  ))}

                  {/* Axes (Origin at 80, 240) */}
                  <line x1="14" y1="240" x2="306" y2="240" stroke="#334155" strokeWidth="2.5" />
                  <line x1="80" y1="14" x2="80" y2="266" stroke="#334155" strokeWidth="2.5" />
                  <text x="295" y="235" fontSize="11" fontWeight="bold">X</text>
                  <text x="85" y="25" fontSize="11" fontWeight="bold">Y</text>
                  <text x="70" y="255" fontSize="10" fill="#64748b">O</text>

                  {/* Translation Vector Arrow from A to A' */}
                  <line
                    x1={toX(startX)}
                    y1={toY(startY)}
                    x2={toX(startX + dx)}
                    y2={toY(startY + dy)}
                    stroke="#f59e0b"
                    strokeWidth="3"
                    markerEnd="url(#arrow)"
                  />

                  {/* Original Point A */}
                  <circle cx={toX(startX)} cy={toY(startY)} r="5" fill="#2563eb" />
                  <text x={toX(startX) - 25} y={toY(startY) - 8} fontSize="11" fontWeight="bold" fill="#1d4ed8">
                    A({startX}, {startY})
                  </text>

                  {/* Translated Point A' */}
                  <circle cx={toX(startX + dx)} cy={toY(startY + dy)} r="5" fill="#dc2626" />
                  <text x={toX(startX + dx) + 8} y={toY(startY + dy) - 8} fontSize="11" fontWeight="bold" fill="#dc2626">
                    A'({startX + dx}, {startY + dy})
                  </text>
                </svg>
              </div>

              {/* Math step explanation */}
              <div className="space-y-3">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                  <div className="text-sm font-bold text-slate-800">
                    {L('स्थानान्तरण गणना (Calculation):', 'Translation Steps:')}
                  </div>
                  <div className="text-xs text-slate-700 space-y-1">
                    <div>Original point: A({startX}, {startY})</div>
                    <div>Translation amount: dx = {dx}, dy = {dy}</div>
                    <div className="text-sm font-black text-indigo-700 pt-1 border-t border-slate-200">
                      New point A' = ({startX} + {dx}, {startY} + {dy}) = ({toNp(startX + dx)}, {toNp(startY + dy)})
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Translate Line Segment */}
        {tab === 'segment_parallel' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-emerald-50 border-l-4 border-emerald-600 p-4 rounded-r-2xl">
              <h3 className="text-base font-bold text-emerald-950" style={{ fontFamily: FONT_NP }}>
                {L('पाठ्यपुस्तक विधि: रेखाखण्ड PQ को स्थानान्तरण:', 'CDC Method: Translation of Line Segment PQ:')}
              </h3>
              <p className="text-slate-700 text-xs md:text-sm mt-1">
                {L(
                  'रेखाखण्ड PQ का दुवै छेउका बिन्दुहरू P र Q लाई दिएको क्टर ON सँग समानान्तर र बराबर दूरीमा सारी (PP\' = ON र QQ\' = ON) P\' र Q\' लाई जोड्दा नयाँ रेखाखण्ड P\'Q\' बन्छ।',
                  'Draw PP\' and QQ\' parallel and equal in length to vector ON. Joining P\' and Q\' gives the translated line segment P\'Q\'.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center">
                <svg width="320" height="280" viewBox="0 0 320 280">
                  {/* Grid Lines */}
                  {Array.from({ length: 14 }).map((_, i) => (
                    <line key={i} x1={i * 22 + 14} y1="14" x2={i * 22 + 14} y2="266" stroke="#f1f5f9" strokeWidth="1" />
                  ))}

                  {/* Parallel translation vectors PP' and QQ' */}
                  <line
                    x1={toX(p1[0])}
                    y1={toY(p1[1])}
                    x2={toX(p1[0] + dx)}
                    y2={toY(p1[1] + dy)}
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeDasharray="4,3"
                  />
                  <line
                    x1={toX(q1[0])}
                    y1={toY(q1[1])}
                    x2={toX(q1[0] + dx)}
                    y2={toY(q1[1] + dy)}
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeDasharray="4,3"
                  />

                  {/* Original Line Segment PQ */}
                  <line x1={toX(p1[0])} y1={toY(p1[1])} x2={toX(q1[0])} y2={toY(q1[1])} stroke="#2563eb" strokeWidth="3.5" />
                  <circle cx={toX(p1[0])} cy={toY(p1[1])} r="4" fill="#1e40af" />
                  <circle cx={toX(q1[0])} cy={toY(q1[1])} r="4" fill="#1e40af" />
                  <text x={toX(p1[0]) - 15} y={toY(p1[1]) + 15} fontSize="11" fontWeight="bold" fill="#1e40af">P</text>
                  <text x={toX(q1[0]) - 15} y={toY(q1[1]) - 5} fontSize="11" fontWeight="bold" fill="#1e40af">Q</text>

                  {/* Translated Line Segment P'Q' */}
                  <line
                    x1={toX(p1[0] + dx)}
                    y1={toY(p1[1] + dy)}
                    x2={toX(q1[0] + dx)}
                    y2={toY(q1[1] + dy)}
                    stroke="#dc2626"
                    strokeWidth="3.5"
                  />
                  <circle cx={toX(p1[0] + dx)} cy={toY(p1[1] + dy)} r="4" fill="#dc2626" />
                  <circle cx={toX(q1[0] + dx)} cy={toY(q1[1] + dy)} r="4" fill="#dc2626" />
                  <text x={toX(p1[0] + dx) + 8} y={toY(p1[1] + dy) + 15} fontSize="11" fontWeight="bold" fill="#dc2626">P'</text>
                  <text x={toX(q1[0] + dx) + 8} y={toY(q1[1] + dy) - 5} fontSize="11" fontWeight="bold" fill="#dc2626">Q'</text>
                </svg>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                  <div className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    {L('रेखाखण्डका मुख्य गुणहरू:', 'Key Properties of Translated Segment:')}
                  </div>
                  <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4">
                    <li>{L('P\'Q\' को लम्बाइ = PQ को लम्बाइ (लम्बाइ बराबर रहन्छ)', 'Length of P\'Q\' = Length of PQ (congruent)')}</li>
                    <li>{L('P\'Q\' रेखाखण्ड PQ सँग समानान्तर हुन्छ (PQ || P\'Q\')', 'Segment P\'Q\' is parallel to segment PQ')}</li>
                    <li>{L('दुवै शीर्ष समान दिशा र समान परिमाणमा सरेका छन्।', 'Both vertices moved by identical vector displacement.')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Translate Triangle */}
        {tab === 'polygon_trans' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded-r-2xl">
              <h3 className="text-base font-bold text-purple-950" style={{ fontFamily: FONT_NP }}>
                {L('त्रिभुजको स्थानान्तरण (Translation of Triangle):', 'Translation of a Triangle:')}
              </h3>
              <p className="text-slate-700 text-xs md:text-sm mt-1">
                {L(
                  'त्रिभुज △PQR का प्रत्येक तीनवटै शीर्षबिन्दुहरूलाई समान दूरी र समान दिशामा सार्दा नयाँ △P\'Q\'R\' बन्छ।',
                  'Translating all three vertices of △PQR by vector (dx, dy) yields congruent triangle △P\'Q\'R\'.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center">
                <svg width="320" height="280" viewBox="0 0 320 280">
                  {/* Original Triangle */}
                  {(() => {
                    const origPts = triVertices.map((p) => `${toX(p[0])},${toY(p[1])}`).join(' ');
                    const transPts = triVertices.map((p) => `${toX(p[0] + dx)},${toY(p[1] + dy)}`).join(' ');
                    return (
                      <>
                        {/* Connecting arrows */}
                        {triVertices.map((p, idx) => (
                          <line
                            key={idx}
                            x1={toX(p[0])}
                            y1={toY(p[1])}
                            x2={toX(p[0] + dx)}
                            y2={toY(p[1] + dy)}
                            stroke="#f59e0b"
                            strokeWidth="1.5"
                            strokeDasharray="4,3"
                          />
                        ))}

                        <polygon points={origPts} fill="rgba(59, 130, 246, 0.3)" stroke="#2563eb" strokeWidth="3" />
                        <polygon points={transPts} fill="rgba(239, 68, 68, 0.3)" stroke="#dc2626" strokeWidth="3" />

                        {triVertices.map((p, idx) => {
                          const labels = ['P', 'Q', 'R'];
                          return (
                            <g key={idx}>
                              <circle cx={toX(p[0])} cy={toY(p[1])} r="4" fill="#2563eb" />
                              <text x={toX(p[0]) - 15} y={toY(p[1]) - 5} fontSize="11" fontWeight="bold" fill="#1d4ed8">
                                {labels[idx]}
                              </text>
                              <circle cx={toX(p[0] + dx)} cy={toY(p[1] + dy)} r="4" fill="#dc2626" />
                              <text x={toX(p[0] + dx) + 8} y={toY(p[1] + dy) - 5} fontSize="11" fontWeight="bold" fill="#dc2626">
                                {labels[idx]}'
                              </text>
                            </g>
                          );
                        })}
                      </>
                    );
                  })()}
                </svg>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="text-sm font-bold text-slate-800">
                    {L('अनुरूपता (Congruence) प्रमाण:', 'Congruence Proof:')}
                  </div>
                  <div className="text-xs text-slate-700 space-y-1">
                    <div>△PQR ≅ △P'Q'R'</div>
                    <div>Sides: P'Q' = PQ, Q'R' = QR, P'R' = PR</div>
                    <div>Angles: ∠P = ∠P', ∠Q = ∠Q', ∠R = ∠R'</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Real Life Examples */}
        {tab === 'real_life' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-2xl">
              <h3 className="text-base font-bold text-amber-950" style={{ fontFamily: FONT_NP }}>
                {L('पाठ्यपुस्तकका दैनिक जीवनका स्थानान्तरण उदाहरणहरू:', 'CDC Real-Life Translation Examples:')}
              </h3>
              <p className="text-slate-700 text-xs mt-1">
                {L('हाम्रो वरिपरि हुने सिधा गतिको स्थानान्तरणसँग तुलना गर्नुहोस्।', 'Examine everyday straight-line motions that represent mathematical translation.')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  titleNp: '1. टेबुलमाथि इरेजर सार्नु',
                  titleEn: '1. Sliding Eraser on Desk',
                  descNp: 'कापीमा वा टेबुलमाथि इरेजरलाई सिधा तान्दा यसको आकार नबदली सबै भागहरू एकैसाथ सर्छन्।',
                  descEn: 'Moving an eraser across paper translates all its vertices identically.',
                },
                {
                  titleNp: '2. चिप्लेटीमा बच्चा चिप्लिनु',
                  titleEn: '2. Child Sliding Down',
                  descNp: 'चिप्लेटीको सिधा भिरालो सतहबाट बच्चा तल झर्दा निश्चित दिशा र परिमाणमा स्थानान्तरण हुन्छ।',
                  descEn: 'Gliding down a playground slide represents consistent vector displacement.',
                },
                {
                  titleNp: '3. दराज खोल्नु (Drawer)',
                  titleEn: '3. Opening a Drawer',
                  descNp: 'दराजलाई बाहिर तान्दा दराजका चारवटै कुनाहरू बराबर दूरी र समानान्तर दिशामा सर्छन्।',
                  descEn: 'Pulling a drawer outward moves all four corners by the exact same distance.',
                },
              ].map((ex, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                  <div className="font-bold text-sm text-slate-800" style={{ fontFamily: FONT_NP }}>
                    {isNe ? ex.titleNp : ex.titleEn}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isNe ? ex.descNp : ex.descEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default TranslationMovementPlayground;
