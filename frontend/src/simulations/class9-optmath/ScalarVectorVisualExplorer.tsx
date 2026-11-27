import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const ScalarVectorVisualExplorer: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-OPTMATH-G9-U4-01',
    chapter: 4,
    titleNp: 'स्केलर तथा भेक्टर दृश्य अन्वेषक',
    titleEn: 'Scalar and Vector Visual Explorer',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'classify' | 'representation' | 'types' | 'points' | 'challenge'>('classify');

  // Activity A: Classification
  const quantities = [
    { nameEn: 'Distance', nameNp: 'दुरी', type: 'scalar', descEn: 'Only magnitude (e.g. 50 m)', descNp: 'केवल परिमाण (जस्तै: 50 m)' },
    { nameEn: 'Displacement', nameNp: 'विस्थापन', type: 'vector', descEn: 'Magnitude and specific direction (e.g. 50 m North)', descNp: 'परिमाण र निश्चित दिशा (जस्तै: 50 m उत्तर)' },
    { nameEn: 'Speed', nameNp: 'चाल', type: 'scalar', descEn: 'Rate of distance covered without direction (e.g. 40 km/h)', descNp: 'दिशा नतोकिएको पार गरिएको दुरीको दर' },
    { nameEn: 'Velocity', nameNp: 'वेग', type: 'vector', descEn: 'Displacement per unit time in a specified direction', descNp: 'निश्चित दिशामा प्रति एकाइ समयमा भएको विस्थापन' },
    { nameEn: 'Force', nameNp: 'बल', type: 'vector', descEn: 'Push or pull with magnitude and direction (e.g. 10 N East)', descNp: 'परिमाण र दिशा भएको बाह्य प्रभाव (जस्तै: 10 न्युटन पूर्व)' },
    { nameEn: 'Acceleration', nameNp: 'प्रवेग', type: 'vector', descEn: 'Rate of change of velocity', descNp: 'वेग परिवर्तनको दर' },
    { nameEn: 'Temperature', nameNp: 'तापक्रम', type: 'scalar', descEn: 'Degree of hotness or coldness without direction', descNp: 'दिशा नहुने तातो वा चिसोपनको मात्रा' },
    { nameEn: 'Work', nameNp: 'कार्य', type: 'scalar', descEn: 'Scalar dot product of force and displacement (Joules)', descNp: 'बल र विस्थापनको अदिश गुणनफल (जुल)' },
    { nameEn: 'Energy', nameNp: 'ऊर्जा', type: 'scalar', descEn: 'Capacity to do work without direction', descNp: 'कार्य गर्न सक्ने क्षमता' },
    { nameEn: 'Density', nameNp: 'घनत्व', type: 'scalar', descEn: 'Mass per unit volume (kg/m³)', descNp: 'प्रति एकाइ आयतनको पिण्ड' },
    { nameEn: 'Area', nameNp: 'क्षेत्रफल', type: 'scalar', descEn: 'Extent of a 2D surface', descNp: 'द्वि-आयामी सतहको विस्तार' },
    { nameEn: 'Volume', nameNp: 'आयतन', type: 'scalar', descEn: 'Amount of 3D space enclosed', descNp: 'त्रि-आयामी वस्तुले ओगटेको ठाउँ' },
  ];
  const [userAnswers, setUserAnswers] = useState<Record<string, 'scalar' | 'vector'>>({});

  // Activity B: Representation (Row vs Column)
  const [vecX, setVecX] = useState<number>(4);
  const [vecY, setVecY] = useState<number>(3);
  const [notation, setNotation] = useState<'column' | 'row'>('column');

  // Activity C: Types of Vectors
  const [vectorType, setVectorType] = useState<'equal' | 'negative' | 'like' | 'unlike' | 'zero' | 'position'>('equal');

  // Activity D: Coordinate Representation AB
  const [ptA, setPtA] = useState<{ x: number; y: number }>({ x: 1, y: 1 });
  const [ptB, setPtB] = useState<{ x: number; y: number }>({ x: 5, y: 4 });
  const [reversedDir, setReversedDir] = useState<boolean>(false);

  // SVG coordinate plane settings
  const svgW = 380;
  const svgH = 340;
  const originX = 190;
  const originY = 170;
  const scale = 22;

  const toSvgX = (x: number) => originX + x * scale;
  const toSvgY = (y: number) => originY - y * scale;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      mascotGreeting={L(
        'नमस्ते! ऐच्छिक गणित एकाइ 4 भेक्टर (Vector) मा स्वागत छ! यहाँ स्केलर र भेक्टरका प्रकार, स्तम्भ र पङ्क्ति रूप, र बिन्दुहरूको भेक्टर अन्वेषण गर्नुहोस्।',
        'Welcome to Unit 4: Vector! Explore scalar and vector physical quantities, vector representations, and types of vectors!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b pb-2">
          {[
            { id: 'classify', labelNp: 'क) स्केलर वा भेक्टर वर्गीकरण', labelEn: 'A) Scalar or Vector?' },
            { id: 'representation', labelNp: 'ख) भेक्टरको रूप (स्तम्भ/पङ्क्ति)', labelEn: 'B) Vector Representation' },
            { id: 'types', labelNp: 'ग) भेक्टरका प्रकारहरू', labelEn: 'C) Types of Vectors' },
            { id: 'points', labelNp: 'घ) बिन्दुहरूबाट भेक्टर (AB)', labelEn: 'D) Vector from Points (AB)' },
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

        {/* TAB A: CLASSIFICATION */}
        {activeTab === 'classify' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-3 rounded text-sm text-blue-900">
              <span className="font-bold">{L('परिभाषा: ', 'Definitions: ')}</span>
              {L(
                'स्केलर राशि (Scalar Quantity): परिमाण मात्र हुने, दिशा नहुने भौतिक राशि (जस्तै: दुरी, चाल, तापक्रम)। भेक्टर राशि (Vector Quantity): परिमाण र निश्चित दिशा दुवै हुने राशि (जस्तै: विस्थापन, वेग, बल)।',
                'Scalar: A physical quantity having only magnitude and no specific direction. Vector: A physical quantity having both magnitude and direction.'
              )}
            </div>

            <h3 className="font-semibold text-slate-800 text-base">
              {L('पाठ्यपुस्तकका भौतिक राशिहरूको वर्गीकरण गर्नुहोस्:', 'Classify physical quantities from the textbook:')}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {quantities.map((q) => {
                const answered = userAnswers[q.nameEn];
                const isCorrect = answered === q.type;
                return (
                  <div key={q.nameEn} className="p-3 bg-slate-50 border rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-800">{isNe ? q.nameNp : q.nameEn}</span>
                        {answered && (
                          <span className={`text-xs px-2 py-0.5 rounded font-bold ${isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {isCorrect ? L('सही ✓', 'Correct ✓') : L('गलत ✕', 'Incorrect ✕')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mb-2">{isNe ? q.descNp : q.descEn}</p>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => {
                          setUserAnswers((prev) => ({ ...prev, [q.nameEn]: 'scalar' }));
                          if (q.type === 'scalar') kit.good();
                          else kit.oops();
                        }}
                        className={`flex-1 py-1 text-xs rounded font-medium border transition-all ${
                          answered === 'scalar'
                            ? q.type === 'scalar'
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-rose-600 text-white border-rose-600'
                            : 'bg-white hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        {L('स्केलर (Scalar)', 'Scalar')}
                      </button>
                      <button
                        onClick={() => {
                          setUserAnswers((prev) => ({ ...prev, [q.nameEn]: 'vector' }));
                          if (q.type === 'vector') kit.good();
                          else kit.oops();
                        }}
                        className={`flex-1 py-1 text-xs rounded font-medium border transition-all ${
                          answered === 'vector'
                            ? q.type === 'vector'
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-rose-600 text-white border-rose-600'
                            : 'bg-white hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        {L('भेक्टर (Vector)', 'Vector')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB B: REPRESENTATION */}
        {activeTab === 'representation' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="md:col-span-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-semibold text-slate-800 mb-2">{L('निर्देशाङ्क समतलमा भेक्टर दृश्य:', 'Vector on Coordinate Plane:')}</h3>
              <svg width="100%" height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="bg-slate-900 rounded-xl">
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
                  </marker>
                </defs>
                {/* Grid */}
                {Array.from({ length: 17 }).map((_, i) => {
                  const x = i - 8;
                  const sx = toSvgX(x);
                  return <line key={`gx-${i}`} x1={sx} y1={10} x2={sx} y2={svgH - 10} stroke="#334155" strokeWidth={x === 0 ? 2 : 0.6} />;
                })}
                {Array.from({ length: 15 }).map((_, i) => {
                  const y = i - 7;
                  const sy = toSvgY(y);
                  return <line key={`gy-${i}`} x1={10} y1={sy} x2={svgW - 10} y2={sy} stroke="#334155" strokeWidth={y === 0 ? 2 : 0.6} />;
                })}
                {/* Axis labels */}
                <text x={svgW - 20} y={originY - 6} fill="#94a3b8" fontSize="11" fontWeight="bold">X</text>
                <text x={originX + 8} y={20} fill="#94a3b8" fontSize="11" fontWeight="bold">Y</text>
                <text x={originX - 12} y={originY + 14} fill="#94a3b8" fontSize="10">O</text>

                {/* Vector Components Triangle */}
                <line x1={originX} y1={originY} x2={toSvgX(vecX)} y2={originY} stroke="#f59e0b" strokeWidth={2} strokeDasharray="4" />
                <line x1={toSvgX(vecX)} y1={originY} x2={toSvgX(vecX)} y2={toSvgY(vecY)} stroke="#10b981" strokeWidth={2} strokeDasharray="4" />

                {/* Main Vector Arrow */}
                <line
                  x1={originX}
                  y1={originY}
                  x2={toSvgX(vecX)}
                  y2={toSvgY(vecY)}
                  stroke="#38bdf8"
                  strokeWidth={3.5}
                  markerEnd="url(#arrow)"
                />
                <circle cx={toSvgX(vecX)} cy={toSvgY(vecY)} r={5} fill="#38bdf8" />

                {/* Coordinates label */}
                <text x={toSvgX(vecX) + 8} y={toSvgY(vecY) - 8} fill="#f1f5f9" fontSize="12" fontWeight="bold">
                  P({fmt(vecX)}, {fmt(vecY)})
                </text>
              </svg>
            </div>

            <div className="md:col-span-6 bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-800 text-base">{L('कम्पोनेन्ट नियन्त्रक (Components):', 'Vector Controls:')}</h3>
              
              <div>
                <div className="flex justify-between text-sm mb-1 font-medium">
                  <span className="text-amber-700">{L('तेर्सो कम्पोनेन्ट (x-component):', 'Horizontal (x):')} {fmt(vecX)}</span>
                </div>
                <input
                  type="range"
                  min="-7"
                  max="7"
                  value={vecX}
                  onChange={(e) => setVecX(parseInt(e.target.value))}
                  className="w-full accent-amber-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1 font-medium">
                  <span className="text-emerald-700">{L('ठाडो कम्पोनेन्ट (y-component):', 'Vertical (y):')} {fmt(vecY)}</span>
                </div>
                <input
                  type="range"
                  min="-6"
                  max="6"
                  value={vecY}
                  onChange={(e) => setVecY(parseInt(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div className="pt-2">
                <span className="text-xs font-semibold text-slate-500 uppercase">{L('संकेत ढाँचा रोज्नुहोस्:', 'Select Notation:')}</span>
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => setNotation('column')}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-semibold border ${notation === 'column' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700'}`}
                  >
                    {L('स्तम्भ रूप (Column Vector)', 'Column Vector')}
                  </button>
                  <button
                    onClick={() => setNotation('row')}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-semibold border ${notation === 'row' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700'}`}
                  >
                    {L('पङ्क्ति रूप (Row Vector)', 'Row Vector')}
                  </button>
                </div>
              </div>

              {/* Mathematical Display */}
              <div className="p-4 bg-slate-50 border rounded-xl flex items-center justify-around text-center">
                <div>
                  <div className="text-xs text-slate-500 mb-1">{L('भेक्टर अभिव्यक्ति:', 'Vector Expression:')}</div>
                  {notation === 'column' ? (
                    <div className="inline-flex items-center text-lg font-mono font-bold text-indigo-900 bg-white px-3 py-2 rounded-lg border shadow-xs">
                      <span>a⃗ = </span>
                      <span className="text-2xl font-light ml-1">(</span>
                      <div className="flex flex-col mx-1 leading-tight text-center">
                        <span className="text-amber-700">{fmt(vecX)}</span>
                        <span className="text-emerald-700">{fmt(vecY)}</span>
                      </div>
                      <span className="text-2xl font-light">)</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center text-lg font-mono font-bold text-indigo-900 bg-white px-3 py-2 rounded-lg border shadow-xs">
                      a⃗ = ({fmt(vecX)}, {fmt(vecY)})
                    </div>
                  )}
                </div>

                <div className="border-l pl-4 text-left">
                  <div className="text-xs text-slate-500">{L('परिमाण (Magnitude):', 'Magnitude:')}</div>
                  <div className="text-lg font-bold text-slate-800 font-mono">
                    |a⃗| = √({fmt(vecX)}² + {fmt(vecY)}²) = {fmt(Math.sqrt(vecX ** 2 + vecY ** 2).toFixed(2))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB C: TYPES OF VECTORS */}
        {activeTab === 'types' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {[
                { id: 'equal', np: 'बराबर भेक्टर', en: 'Equal Vectors' },
                { id: 'negative', np: 'विपरीत/ऋणात्मक भेक्टर', en: 'Negative Vectors' },
                { id: 'like', np: 'समान दिशा (Like)', en: 'Like Vectors' },
                { id: 'unlike', np: 'विपरित दिशा (Unlike)', en: 'Unlike Vectors' },
                { id: 'zero', np: 'शून्य भेक्टर (Zero)', en: 'Zero Vector' },
                { id: 'position', np: 'स्थिति भेक्टर (Position)', en: 'Position Vector' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setVectorType(t.id as any);
                    kit.tap();
                  }}
                  className={`py-2 px-2 text-xs rounded-lg font-semibold border transition-all ${
                    vectorType === t.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {isNe ? t.np : t.en}
                </button>
              ))}
            </div>

            {/* Visualizer for types */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-6 bg-slate-900 rounded-xl p-3 flex justify-center">
                <svg width={340} height={260} viewBox="0 0 340 260">
                  <defs>
                    <marker id="arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
                    </marker>
                    <marker id="arrow-emerald" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="#34d399" />
                    </marker>
                  </defs>

                  {/* Examples depending on vectorType */}
                  {vectorType === 'equal' && (
                    <>
                      <line x1={40} y1={90} x2={160} y2={50} stroke="#38bdf8" strokeWidth={3} markerEnd="url(#arrow-blue)" />
                      <text x={100} y={40} fill="#38bdf8" fontSize="12" fontWeight="bold">a⃗ = (4, 2)</text>
                      <line x1={60} y1={190} x2={180} y2={150} stroke="#34d399" strokeWidth={3} markerEnd="url(#arrow-emerald)" />
                      <text x={120} y={140} fill="#34d399" fontSize="12" fontWeight="bold">b⃗ = (4, 2)</text>
                    </>
                  )}
                  {vectorType === 'negative' && (
                    <>
                      <line x1={40} y1={80} x2={170} y2={80} stroke="#38bdf8" strokeWidth={3} markerEnd="url(#arrow-blue)" />
                      <text x={95} y={65} fill="#38bdf8" fontSize="12" fontWeight="bold">a⃗ = (4, 0)</text>
                      <line x1={170} y1={170} x2={40} y2={170} stroke="#34d399" strokeWidth={3} markerEnd="url(#arrow-emerald)" />
                      <text x={95} y={195} fill="#34d399" fontSize="12" fontWeight="bold">-a⃗ = (-4, 0)</text>
                    </>
                  )}
                  {vectorType === 'like' && (
                    <>
                      <line x1={40} y1={70} x2={130} y2={40} stroke="#38bdf8" strokeWidth={3} markerEnd="url(#arrow-blue)" />
                      <text x={80} y={35} fill="#38bdf8" fontSize="11" fontWeight="bold">a⃗ = (3, 1)</text>
                      <line x1={40} y1={180} x2={220} y2={120} stroke="#34d399" strokeWidth={3} markerEnd="url(#arrow-emerald)" />
                      <text x={130} y={115} fill="#34d399" fontSize="11" fontWeight="bold">b⃗ = 2a⃗ = (6, 2)</text>
                    </>
                  )}
                  {vectorType === 'unlike' && (
                    <>
                      <line x1={40} y1={80} x2={140} y2={50} stroke="#38bdf8" strokeWidth={3} markerEnd="url(#arrow-blue)" />
                      <text x={85} y={45} fill="#38bdf8" fontSize="11" fontWeight="bold">a⃗</text>
                      <line x1={250} y1={140} x2={50} y2={200} stroke="#34d399" strokeWidth={3} markerEnd="url(#arrow-emerald)" />
                      <text x={145} y={220} fill="#34d399" fontSize="11" fontWeight="bold">b⃗ (विपरीत दिशा)</text>
                    </>
                  )}
                  {vectorType === 'zero' && (
                    <>
                      <circle cx={170} cy={130} r={8} fill="#f59e0b" />
                      <text x={140} y={110} fill="#fbbf24" fontSize="13" fontWeight="bold">0⃗ = (0, 0)</text>
                      <text x={105} y={160} fill="#94a3b8" fontSize="11">परिमाण = 0, दिशा अनिर्धारित</text>
                    </>
                  )}
                  {vectorType === 'position' && (
                    <>
                      <line x1={50} y1={210} x2={220} y2={60} stroke="#38bdf8" strokeWidth={3} markerEnd="url(#arrow-blue)" />
                      <circle cx={50} cy={210} r={4} fill="#e2e8f0" />
                      <text x={35} y={225} fill="#e2e8f0" fontSize="12" fontWeight="bold">O(0, 0)</text>
                      <circle cx={220} cy={60} r={5} fill="#38bdf8" />
                      <text x={225} y={60} fill="#38bdf8" fontSize="12" fontWeight="bold">P(x, y)</text>
                      <text x={110} y={120} fill="#93c5fd" fontSize="12" fontWeight="bold">OP⃗</text>
                    </>
                  )}
                </svg>
              </div>

              <div className="md:col-span-6 space-y-3">
                <h4 className="font-bold text-slate-800 text-lg">
                  {vectorType === 'equal' && L('बराबर भेक्टर (Equal Vectors)', 'Equal Vectors')}
                  {vectorType === 'negative' && L('विपरीत वा ऋणात्मक भेक्टर (Negative Vectors)', 'Negative Vectors')}
                  {vectorType === 'like' && L('समान भेक्टरहरू (Like Vectors)', 'Like Vectors')}
                  {vectorType === 'unlike' && L('असमान वा विपरित दिशाका भेक्टरहरू (Unlike Vectors)', 'Unlike Vectors')}
                  {vectorType === 'zero' && L('शून्य भेक्टर (Zero or Null Vector)', 'Zero or Null Vector')}
                  {vectorType === 'position' && L('स्थिति भेक्टर (Position Vector)', 'Position Vector')}
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {vectorType === 'equal' &&
                    L(
                      'दुई भेक्टरहरूको परिमाण (magnitude) बराबर र दिशा (direction) एउटै छ भने तिनीहरूलाई बराबर भेक्टर भनिन्छ: a⃗ = b⃗।',
                      'Vectors that have the same magnitude and the exact same direction are equal vectors: a⃗ = b⃗.'
                    )}
                  {vectorType === 'negative' &&
                    L(
                      'दुई भेक्टरहरूको परिमाण बराबर तर दिशा ठ्याक्कै विपरित भएमा एउटालाई अर्कोको ऋणात्मक भेक्टर भनिन्छ: b⃗ = -a⃗।',
                      'Vectors having equal magnitudes but opposite directions are negative of each other: b⃗ = -a⃗.'
                    )}
                  {vectorType === 'like' &&
                    L(
                      'परिमाण फरक भए तापनि एउटै दिशा भएका भेक्टरहरूलाई समान (Like) भेक्टर भनिन्छ।',
                      'Vectors having the same direction regardless of their magnitudes are called like vectors.'
                    )}
                  {vectorType === 'unlike' &&
                    L(
                      'समा cutsन्तर भएर पनि एकअर्काको विपरीत दिशामा रहेका भेक्टरहरूलाई Unlike भेक्टर भनिन्छ।',
                      'Parallel vectors pointing in opposite directions are called unlike vectors.'
                    )}
                  {vectorType === 'zero' &&
                    L(
                      'शुरुको बिन्दु र अन्तिम बिन्दु एउटै भएको, परिमाण शून्य भएको भेक्टरलाई शून्य भेक्टर (0⃗) भनिन्छ। यसको दिशा निश्चित हुँदैन।',
                      'A vector whose initial and terminal points coincide has magnitude 0 and is called a zero vector.'
                    )}
                  {vectorType === 'position' &&
                    L(
                      'मूलबिन्दु O(0,0) बाट कुनै बिन्दु P सम्म जोडिएको भेक्टर OP⃗ लाई बिन्दु P को स्थिति भेक्टर (Position Vector) भनिन्छ।',
                      'A vector starting from origin O(0,0) to point P is called the position vector of P, denoted as OP⃗ = p⃗.'
                    )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB D: COORDINATE REPRESENTATION AB */}
        {activeTab === 'points' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-semibold text-slate-800 text-base">
              {L('दुई बिन्दुहरू A(x₁, y₁) र B(x₂, y₂) बाट भेक्टर निर्माण:', 'Vector between two points A(x₁, y₁) and B(x₂, y₂):')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              <div className="md:col-span-6 bg-slate-900 rounded-xl p-3 flex justify-center">
                <svg width={350} height={280} viewBox="0 0 350 280">
                  <defs>
                    <marker id="arrow-pt" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1 L 10 5 L 0 9 z" fill={reversedDir ? '#f43f5e' : '#38bdf8'} />
                    </marker>
                  </defs>
                  {/* Grid */}
                  {Array.from({ length: 15 }).map((_, i) => (
                    <line key={i} x1={i * 24 + 10} y1={10} x2={i * 24 + 10} y2={270} stroke="#334155" strokeWidth={0.5} />
                  ))}
                  {Array.from({ length: 11 }).map((_, i) => (
                    <line key={i} x1={10} y1={i * 24 + 10} x2={340} y2={i * 24 + 10} stroke="#334155" strokeWidth={0.5} />
                  ))}

                  {/* Draw points and arrow */}
                  {(() => {
                    const ax = 50 + ptA.x * 32;
                    const ay = 240 - ptA.y * 30;
                    const bx = 50 + ptB.x * 32;
                    const by = 240 - ptB.y * 30;

                    const startX = reversedDir ? bx : ax;
                    const startY = reversedDir ? by : ay;
                    const endX = reversedDir ? ax : bx;
                    const endY = reversedDir ? ay : by;

                    return (
                      <>
                        <line x1={startX} y1={startY} x2={endX} y2={endY} stroke={reversedDir ? '#f43f5e' : '#38bdf8'} strokeWidth={3.5} markerEnd="url(#arrow-pt)" />
                        <circle cx={ax} cy={ay} r={5} fill="#fbbf24" />
                        <text x={ax - 15} y={ay - 10} fill="#fbbf24" fontSize="12" fontWeight="bold">A({fmt(ptA.x)}, {fmt(ptA.y)})</text>
                        <circle cx={bx} cy={by} r={5} fill="#34d399" />
                        <text x={bx + 8} y={by - 10} fill="#34d399" fontSize="12" fontWeight="bold">B({fmt(ptB.x)}, {fmt(ptB.y)})</text>
                      </>
                    );
                  })()}
                </svg>
              </div>

              <div className="md:col-span-6 space-y-3">
                <div className="flex gap-4">
                  <div className="flex-1 bg-slate-50 p-3 rounded-xl border">
                    <span className="text-xs font-bold text-amber-700">Point A(x₁, y₁):</span>
                    <div className="flex gap-2 mt-1">
                      <input type="number" min="-2" max="6" value={ptA.x} onChange={(e) => setPtA({ ...ptA, x: parseInt(e.target.value) || 0 })} className="w-16 p-1 border rounded text-center text-sm font-bold" />
                      <input type="number" min="-2" max="6" value={ptA.y} onChange={(e) => setPtA({ ...ptA, y: parseInt(e.target.value) || 0 })} className="w-16 p-1 border rounded text-center text-sm font-bold" />
                    </div>
                  </div>
                  <div className="flex-1 bg-slate-50 p-3 rounded-xl border">
                    <span className="text-xs font-bold text-emerald-700">Point B(x₂, y₂):</span>
                    <div className="flex gap-2 mt-1">
                      <input type="number" min="-2" max="7" value={ptB.x} onChange={(e) => setPtB({ ...ptB, x: parseInt(e.target.value) || 0 })} className="w-16 p-1 border rounded text-center text-sm font-bold" />
                      <input type="number" min="-2" max="7" value={ptB.y} onChange={(e) => setPtB({ ...ptB, y: parseInt(e.target.value) || 0 })} className="w-16 p-1 border rounded text-center text-sm font-bold" />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setReversedDir(!reversedDir);
                    kit.tap();
                  }}
                  className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl font-bold text-xs sm:text-sm"
                >
                  {reversedDir ? L('दिशा उल्टाउनुहोस्: AB⃗ हेर्नुहोस्', 'Reverse to AB⃗') : L('दिशा उल्टाउनुहोस्: BA⃗ हेर्नुहोस्', 'Reverse to BA⃗')}
                </button>

                {/* Calculation */}
                {(() => {
                  const dx = reversedDir ? ptA.x - ptB.x : ptB.x - ptA.x;
                  const dy = reversedDir ? ptA.y - ptB.y : ptB.y - ptA.y;
                  const vecName = reversedDir ? 'BA⃗' : 'AB⃗';
                  return (
                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl space-y-1">
                      <div className="font-mono text-sm text-indigo-950 font-bold">
                        {vecName} = (x₂ - x₁, y₂ - y₁)
                      </div>
                      <div className="font-mono text-xs text-indigo-800">
                        = ({fmt(reversedDir ? ptA.x : ptB.x)} - {fmt(reversedDir ? ptB.x : ptA.x)}, {fmt(reversedDir ? ptA.y : ptB.y)} - {fmt(reversedDir ? ptB.y : ptA.y)})
                      </div>
                      <div className="font-mono text-base font-bold text-indigo-900">
                        = ({fmt(dx)}, {fmt(dy)}) = {reversedDir ? '-AB⃗' : 'AB⃗'}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default ScalarVectorVisualExplorer;
