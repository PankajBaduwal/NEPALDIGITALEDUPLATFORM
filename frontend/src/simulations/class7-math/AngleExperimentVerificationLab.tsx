/**
 * AngleExperimentVerificationLab.tsx
 * Grade 7 Mathematics – Lesson 13: LINES AND ANGLES (रेखाहरू र कोणहरू)
 * Simulation 4: Angle Experiment and Verification Lab (प्रयोगात्मक परीक्षण प्रयोगशाला)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 196-204)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Eye, CheckCircle2, RotateCcw, Plus, Check } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'प्रयोगात्मक विधिबाट शीर्षाभिमुख कोणहरू बराबर हुन्छन् भनी प्रमाणित गर्न कम्तीमा कतिवटा फरक चित्रहरू बनाइ परीक्षण गर्नुपर्छ?',
    en: 'To experimentally verify that vertically opposite angles are equal, at least how many figures should be drawn and tested?',
    options: [
      { key: 'A', label: 'कम्तीमा २ वा ३ वटा फरक चित्रहरू' },
      { key: 'B', label: 'एउटा मात्र' },
      { key: 'C', label: 'कुनै पनि चित्र आवश्यक छैन' },
      { key: 'D', label: '१० वटा' },
    ],
    answer: 'A',
  },
  {
    np: 'सीधा रेखामा बनेका दुई सन्निकट कोणहरूको नाप जोड्दा सधैं कति डिग्री हुन्छ?',
    en: 'What is always the sum of two adjacent angles formed on a straight line?',
    options: [
      { key: 'A', label: '१८०° (ऋजु कोण)' },
      { key: 'B', label: '९०°' },
      { key: 'C', label: '३६०°' },
      { key: 'D', label: '१२०°' },
    ],
    answer: 'A',
  },
  {
    np: 'एउटा बिन्दुको वरिपरि बनेका सबै सन्निकट कोणहरूको योगफल कति हुन्छ?',
    en: 'What is the sum of all adjacent angles formed around a single point (Complete Angle)?',
    options: [
      { key: 'A', label: '३६०° (पूर्ण कोण / Complete Angle)' },
      { key: 'B', label: '१८०°' },
      { key: 'C', label: '९०°' },
      { key: 'D', label: '२७०°' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि सीधा रेखामा बनेका दुई सन्निकट कोणमध्ये एउटा ७०° छ भने अर्को कोण कति हुन्छ?',
    en: 'If one of two adjacent angles on a straight line is 70°, what is the other angle?',
    options: [
      { key: 'A', label: '११०° (१८०° - ७०°)' },
      { key: 'B', label: '२०°' },
      { key: 'C', label: '७०°' },
      { key: 'D', label: '२९०°' },
    ],
    answer: 'A',
  },
];

type ExpType = 'vert_opposite' | 'straight_line' | 'point_complete';

interface TableRow {
  figNo: number;
  valA: number;
  valB: number;
  valC?: number;
  valD?: number;
  sumOrEqual: string;
}

export const AngleExperimentVerificationLab: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L13-04',
    chapter: 13,
    titleNp: 'कोणको प्रयोगात्मक परीक्षण प्रयोगशाला (Angle Experiment Lab)',
    titleEn: 'Angle Experiment Verification Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeExp, setActiveExp] = useState<ExpType>('vert_opposite');

  // Dynamic slider angle
  const [sliderAngle, setSliderAngle] = useState<number>(55);
  const [pointAngles, setPointAngles] = useState<[number, number, number]>([80, 110, 90]);

  // Recorded Table rows for student experimentation
  const [records, setRecords] = useState<TableRow[]>([
    { figNo: 1, valA: 45, valB: 45, valC: 135, valD: 135, sumOrEqual: '∠POR = ∠QOS = 45°' },
  ]);

  const handleRecordData = () => {
    if (activeExp === 'vert_opposite') {
      const newRow: TableRow = {
        figNo: records.length + 1,
        valA: sliderAngle,
        valB: sliderAngle,
        valC: 180 - sliderAngle,
        valD: 180 - sliderAngle,
        sumOrEqual: `∠POR = ∠QOS = ${sliderAngle}°`,
      };
      setRecords([...records, newRow]);
    } else if (activeExp === 'straight_line') {
      const newRow: TableRow = {
        figNo: records.length + 1,
        valA: sliderAngle,
        valB: 180 - sliderAngle,
        sumOrEqual: `${sliderAngle}° + ${180 - sliderAngle}° = 180°`,
      };
      setRecords([...records, newRow]);
    } else {
      const a1 = pointAngles[0];
      const a2 = pointAngles[1];
      const a3 = pointAngles[2];
      const a4 = 360 - (a1 + a2 + a3);
      const newRow: TableRow = {
        figNo: records.length + 1,
        valA: a1,
        valB: a2,
        valC: a3,
        valD: a4,
        sumOrEqual: `${a1}° + ${a2}° + ${a3}° + ${a4}° = 360°`,
      };
      setRecords([...records, newRow]);
    }
  };

  const switchExperiment = (exp: ExpType) => {
    setActiveExp(exp);
    setRecords([]);
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'साथीहरू! पाठ्यपुस्तकका ३ वटा मुख्य प्रयोगात्मक कार्यहरू (Experiments) प्रत्यक्ष नापेर र तालिका भरेर प्रमाणित गरौँ!',
        'Friends! Let us experimentally verify the 3 major geometric angle theorems directly with measurement tables!'
      )}
    >
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Experiment Navigation Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              id: 'vert_opposite',
              titleNp: 'प्रयोग १: शीर्षाभिमुख कोणहरू बराबर',
              titleEn: 'Exp 1: Vertically Opposite Equal',
              descNp: 'आपसमा काटिने रेखाहरूको परीक्षण',
              descEn: 'Intersecting straight lines',
            },
            {
              id: 'straight_line',
              titleNp: 'प्रयोग २: ऋजु रेखाका सन्निकट कोण = १८०°',
              titleEn: 'Exp 2: Straight Line Adjacent = 180°',
              descNp: 'सीधा रेखामा बनेका कोणहरूको योग',
              descEn: 'Linear pair adjacent sum',
            },
            {
              id: 'point_complete',
              titleNp: 'प्रयोग ३: एउटा बिन्दु वरिपरि = ३६०°',
              titleEn: 'Exp 3: Around a Point = 360°',
              descNp: 'पूर्ण कोणको प्रयोगात्मक परीक्षण',
              descEn: 'Complete turn verification',
            },
          ].map((exp) => (
            <button
              key={exp.id}
              onClick={() => switchExperiment(exp.id as ExpType)}
              className={`p-4 rounded-2xl text-left border-2 transition-all shadow-sm ${
                activeExp === exp.id
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-100 ring-2 ring-indigo-300'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50'
              }`}
            >
              <div className="font-bold text-sm" style={{ fontFamily: FONT_NP }}>
                {isNe ? exp.titleNp : exp.titleEn}
              </div>
              <div
                className={`text-xs mt-1 ${
                  activeExp === exp.id ? 'text-indigo-100' : 'text-slate-500'
                }`}
              >
                {isNe ? exp.descNp : exp.descEn}
              </div>
            </button>
          ))}
        </div>

        {/* Experiment 1: Vertically Opposite Angles */}
        {activeExp === 'vert_opposite' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-2xl">
              <h3 className="text-lg font-bold text-blue-950" style={{ fontFamily: FONT_NP }}>
                {L(
                  'प्रयोगात्मक कार्य १: दुईवटा सीधा रेखाहरू आपसमा काटिँदा बन्ने शीर्षाभिमुख कोणहरू बराबर हुन्छन् भनी प्रयोगात्मक रूपमा परीक्षण गर्नुहोस्।',
                  'Experimental Activity 1: Verify experimentally that vertically opposite angles formed when two straight lines intersect are equal.'
                )}
              </h3>
              <p className="text-xs text-blue-800 mt-1">
                {L(
                  'विधि: रेखा PQ र RS लाई बिन्दु O मा काट्ने गरी खिच्नुहोस् र प्रोटेक्टरले ∠POR र ∠QOS नाप्नुहोस्।',
                  'Method: Draw intersecting lines PQ and RS at O, measure ∠POR and ∠QOS with a protractor.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Dynamic Diagram */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center">
                <svg width="320" height="240" viewBox="0 0 320 240">
                  {(() => {
                    const cx = 160;
                    const cy = 120;
                    const rad = (sliderAngle * Math.PI) / 180;
                    const len = 110;

                    const px1 = cx - len;
                    const py1 = cy;
                    const px2 = cx + len;
                    const py2 = cy;

                    const rx1 = cx - len * Math.cos(rad);
                    const ry1 = cy + len * Math.sin(rad);
                    const rx2 = cx + len * Math.cos(rad);
                    const ry2 = cy - len * Math.sin(rad);

                    return (
                      <>
                        {/* Shaded opposite sectors */}
                        <path
                          d={`M ${cx} ${cy} L ${cx + 40} ${cy} A 40 40 0 0 0 ${cx + 40 * Math.cos(rad)} ${cy - 40 * Math.sin(rad)} Z`}
                          fill="rgba(37, 99, 235, 0.35)"
                        />
                        <path
                          d={`M ${cx} ${cy} L ${cx - 40} ${cy} A 40 40 0 0 0 ${cx - 40 * Math.cos(rad)} ${cy + 40 * Math.sin(rad)} Z`}
                          fill="rgba(37, 99, 235, 0.35)"
                        />

                        {/* Lines */}
                        <line x1={px1} y1={py1} x2={px2} y2={py2} stroke="#334155" strokeWidth="3" />
                        <text x={px1 - 15} y={py1 + 5} fontSize="13" fontWeight="bold">P</text>
                        <text x={px2 + 6} y={py2 + 5} fontSize="13" fontWeight="bold">Q</text>

                        <line x1={rx1} y1={ry1} x2={rx2} y2={ry2} stroke="#0f766e" strokeWidth="3" />
                        <text x={rx1 - 10} y={ry1 + 15} fontSize="13" fontWeight="bold">S</text>
                        <text x={rx2 + 5} y={ry2 - 5} fontSize="13" fontWeight="bold">R</text>

                        <circle cx={cx} cy={cy} r="4" fill="#ef4444" />
                        <text x={cx + 6} y={cy + 16} fontSize="13" fontWeight="bold" fill="#ef4444">O</text>

                        {/* Angle readings */}
                        <text x={cx + 45} y={cy - 10} fontSize="13" fontWeight="bold" fill="#1e40af">
                          {sliderAngle}°
                        </text>
                        <text x={cx - 75} y={cy + 20} fontSize="13" fontWeight="bold" fill="#1e40af">
                          {sliderAngle}°
                        </text>
                      </>
                    );
                  })()}
                </svg>

                <div className="w-full mt-3">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {L(`चित्रको कोण बदल्नुहोस् (Change Angle): ${toNp(sliderAngle)}°`, `Adjust Intersecting Angle: ${sliderAngle}°`)}
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="150"
                    value={sliderAngle}
                    onChange={(e) => setSliderAngle(Number(e.target.value))}
                    className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Action and Observation */}
              <div className="space-y-4">
                <button
                  onClick={handleRecordData}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md"
                >
                  <Plus className="w-5 h-5" />
                  {L('तालिकामा नयाँ अवलोकन रेकर्ड गर्नुहोस् (Record Data)', 'Record in Observation Table')}
                </button>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <div className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    {L('निष्कर्ष (Conclusion):', 'Conclusion:')}
                  </div>
                  <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                    {L(
                      'माथिको तालिकाबाट प्रमाणित हुन्छ कि दुई सीधा रेखाहरू आपसमा काटिँदा बन्ने शीर्षाभिमुख कोणहरू बराबर हुन्छन् अर्थात् ∠POR = ∠QOS र ∠POS = ∠ROQ।',
                      'The experimental observation confirms that vertically opposite angles are always equal: ∠POR = ∠QOS and ∠POS = ∠ROQ.'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* CDC Observation Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse bg-slate-50 rounded-2xl overflow-hidden border border-slate-200">
                <thead className="bg-slate-200 text-slate-800 font-bold">
                  <tr>
                    <th className="p-3 border-r border-slate-300">{L('चित्र नं. (Fig No.)', 'Fig No.')}</th>
                    <th className="p-3 border-r border-slate-300">∠POR</th>
                    <th className="p-3 border-r border-slate-300">∠QOS</th>
                    <th className="p-3 border-r border-slate-300">∠POS</th>
                    <th className="p-3 border-r border-slate-300">∠ROQ</th>
                    <th className="p-3">{L('परिणाम / निष्कर्ष (Result)', 'Result')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {records.map((r, idx) => (
                    <tr key={idx} className="hover:bg-indigo-50/50">
                      <td className="p-3 border-r border-slate-200 font-bold">{toNp(r.figNo)}</td>
                      <td className="p-3 border-r border-slate-200 font-semibold text-blue-700">{toNp(r.valA)}°</td>
                      <td className="p-3 border-r border-slate-200 font-semibold text-blue-700">{toNp(r.valB)}°</td>
                      <td className="p-3 border-r border-slate-200 text-amber-700">{toNp(r.valC ?? 0)}°</td>
                      <td className="p-3 border-r border-slate-200 text-amber-700">{toNp(r.valD ?? 0)}°</td>
                      <td className="p-3 font-bold text-emerald-700">✓ {r.sumOrEqual}</td>
                    </tr>
                  ))}
                  {records.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-400">
                        {L('रेकर्ड गर्न माथिको बटन थिच्नुहोस्।', 'Click record button to add experimental measurements.')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Experiment 2: Straight Line Adjacent Angles */}
        {activeExp === 'straight_line' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-amber-50 border-l-4 border-amber-600 p-4 rounded-r-2xl">
              <h3 className="text-lg font-bold text-amber-950" style={{ fontFamily: FONT_NP }}>
                {L(
                  'प्रयोगात्मक कार्य २: सीधा रेखामा बनेका दुई सन्निकट कोणहरूको योगफल १८०° हुन्छ भनी प्रयोगात्मक रूपमा परीक्षण गर्नुहोस्।',
                  'Experimental Activity 2: Verify experimentally that the sum of adjacent angles on a straight line is 180°.'
                )}
              </h3>
              <p className="text-xs text-amber-800 mt-1">
                {L(
                  'विधि: सीधा रेखा AB खिच्नुहोस्, त्यसमा किरण OC खडा गर्नुहोस्। ∠AOC र ∠BOC नापेर जोड्नुहोस्।',
                  'Method: Draw straight line AB, draw ray OC, measure and add ∠AOC and ∠BOC.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center">
                <svg width="320" height="200" viewBox="0 0 320 200">
                  {(() => {
                    const cx = 160;
                    const cy = 160;
                    const rad = (sliderAngle * Math.PI) / 180;
                    const ocx = cx + 120 * Math.cos(rad);
                    const ocy = cy - 120 * Math.sin(rad);

                    return (
                      <>
                        <line x1="30" y1={cy} x2="290" y2={cy} stroke="#1e293b" strokeWidth="3" />
                        <text x="15" y={cy + 5} fontSize="13" fontWeight="bold">A</text>
                        <text x="300" y={cy + 5} fontSize="13" fontWeight="bold">B</text>

                        {/* Angle Sectors */}
                        <path
                          d={`M ${cx} ${cy} L ${cx + 45} ${cy} A 45 45 0 0 0 ${cx + 45 * Math.cos(rad)} ${cy - 45 * Math.sin(rad)} Z`}
                          fill="rgba(245, 158, 11, 0.3)"
                        />
                        <path
                          d={`M ${cx} ${cy} L ${cx + 45 * Math.cos(rad)} ${cy - 45 * Math.sin(rad)} A 45 45 0 0 0 ${cx - 45} ${cy} Z`}
                          fill="rgba(59, 130, 246, 0.3)"
                        />

                        <line x1={cx} y1={cy} x2={ocx} y2={ocy} stroke="#d97706" strokeWidth="4" />
                        <text x={ocx + 5} y={ocy - 5} fontSize="13" fontWeight="bold" fill="#d97706">C</text>

                        <circle cx={cx} cy={cy} r="4" fill="#ef4444" />
                        <text x={cx - 5} y={cy + 20} fontSize="13" fontWeight="bold">O</text>

                        <text x={cx + 50} y={cy - 15} fontSize="13" fontWeight="bold" fill="#b45309">
                          {sliderAngle}°
                        </text>
                        <text x={cx - 85} y={cy - 15} fontSize="13" fontWeight="bold" fill="#1e40af">
                          {180 - sliderAngle}°
                        </text>
                      </>
                    );
                  })()}
                </svg>

                <div className="w-full mt-3">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {L(`किरण OC को झुकाव बदल्नुहोस्: ${toNp(sliderAngle)}°`, `Adjust Ray OC Angle: ${sliderAngle}°`)}
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="160"
                    value={sliderAngle}
                    onChange={(e) => setSliderAngle(Number(e.target.value))}
                    className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleRecordData}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md"
                >
                  <Plus className="w-5 h-5" />
                  {L('तालिकामा रेकर्ड गर्नुहोस् (Record Data)', 'Record Data in Table')}
                </button>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="text-sm font-bold text-slate-800">
                    {L('प्रयोगात्मक जोड (Calculation):', 'Experimental Sum:')}
                  </div>
                  <div className="text-lg font-black text-amber-700">
                    ∠BOC + ∠AOC = {toNp(sliderAngle)}° + {toNp(180 - sliderAngle)}° = {toNp(180)}°
                  </div>
                  <div className="text-xs text-emerald-700 font-bold">
                    ✓ {L('सधैं १८०° (ऋजु कोण) प्रमाणित भयो।', 'Always equals 180° (Straight Angle). Verified.')}
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse bg-slate-50 rounded-2xl overflow-hidden border border-slate-200">
                <thead className="bg-slate-200 text-slate-800 font-bold">
                  <tr>
                    <th className="p-3 border-r border-slate-300">{L('चित्र नं. (Fig No.)', 'Fig No.')}</th>
                    <th className="p-3 border-r border-slate-300">∠BOC</th>
                    <th className="p-3 border-r border-slate-300">∠AOC</th>
                    <th className="p-3">{L('योगफल ∠BOC + ∠AOC (Sum)', 'Sum ∠BOC + ∠AOC')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {records.map((r, idx) => (
                    <tr key={idx} className="hover:bg-amber-50/50">
                      <td className="p-3 border-r border-slate-200 font-bold">{toNp(r.figNo)}</td>
                      <td className="p-3 border-r border-slate-200 font-semibold text-amber-700">{toNp(r.valA)}°</td>
                      <td className="p-3 border-r border-slate-200 font-semibold text-blue-700">{toNp(r.valB)}°</td>
                      <td className="p-3 font-bold text-emerald-700">✓ {r.sumOrEqual}</td>
                    </tr>
                  ))}
                  {records.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-slate-400">
                        {L('रेकर्ड गर्न माथिको बटन थिच्नुहोस्।', 'Click record button to add experimental measurements.')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Experiment 3: Point Complete Angle 360° */}
        {activeExp === 'point_complete' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded-r-2xl">
              <h3 className="text-lg font-bold text-purple-950" style={{ fontFamily: FONT_NP }}>
                {L(
                  'प्रयोगात्मक कार्य ३: एउटा बिन्दुको वरिपरि बन्ने सबै सन्निकट कोणहरूको योगफल ३६०° हुन्छ भनी प्रयोगात्मक रूपमा परीक्षण गर्नुहोस्।',
                  'Experimental Activity 3: Verify experimentally that the sum of angles formed around a point is 360° (Complete Angle).'
                )}
              </h3>
              <p className="text-xs text-purple-800 mt-1">
                {L(
                  'विधि: एउटा बिन्दु O बाट चारवटा किरणहरू खिची चारवटै कोण नाप्नुहोस् र तिनीहरूको योगफल ३६०° भएको हेर्नुहोस्।',
                  'Method: Draw 4 rays from point O, measure all 4 angles, and verify that their sum equals 360°.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center">
                <svg width="260" height="260" viewBox="0 0 260 260">
                  {(() => {
                    const cx = 130;
                    const cy = 130;
                    const a1 = pointAngles[0];
                    const a2 = pointAngles[1];
                    const a3 = pointAngles[2];
                    const a4 = 360 - (a1 + a2 + a3);

                    const angles = [0, a1, a1 + a2, a1 + a2 + a3, 360];
                    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

                    return (
                      <>
                        {/* 4 sectors */}
                        {[0, 1, 2, 3].map((i) => {
                          const startRad = (angles[i] * Math.PI) / 180;
                          const endRad = (angles[i + 1] * Math.PI) / 180;
                          const x1 = cx + 70 * Math.cos(startRad);
                          const y1 = cy - 70 * Math.sin(startRad);
                          const x2 = cx + 70 * Math.cos(endRad);
                          const y2 = cy - 70 * Math.sin(endRad);
                          const largeArc = angles[i + 1] - angles[i] > 180 ? 1 : 0;
                          return (
                            <path
                              key={i}
                              d={`M ${cx} ${cy} L ${x1} ${y1} A 70 70 0 ${largeArc} 0 ${x2} ${y2} Z`}
                              fill={colors[i]}
                              opacity={0.35}
                            />
                          );
                        })}

                        {/* Ray lines */}
                        {angles.slice(0, 4).map((ang, i) => {
                          const rad = (ang * Math.PI) / 180;
                          return (
                            <line
                              key={i}
                              x1={cx}
                              y1={cy}
                              x2={cx + 95 * Math.cos(rad)}
                              y2={cy - 95 * Math.sin(rad)}
                              stroke="#334155"
                              strokeWidth="2.5"
                            />
                          );
                        })}
                        <circle cx={cx} cy={cy} r="5" fill="#ef4444" />
                        <text x={cx - 15} y={cy - 8} fontSize="12" fontWeight="bold">O</text>
                      </>
                    );
                  })()}
                </svg>

                <div className="w-full mt-3 space-y-2">
                  <div className="text-xs font-bold text-slate-700">
                    {L('तीन कोणहरू परिवर्तन गर्नुहोस्:', 'Adjust First 3 Angles:')}
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="110"
                    value={pointAngles[0]}
                    onChange={(e) => setPointAngles([Number(e.target.value), pointAngles[1], pointAngles[2]])}
                    className="w-full h-1.5 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="range"
                    min="50"
                    max="120"
                    value={pointAngles[1]}
                    onChange={(e) => setPointAngles([pointAngles[0], Number(e.target.value), pointAngles[2]])}
                    className="w-full h-1.5 bg-emerald-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="range"
                    min="50"
                    max="110"
                    value={pointAngles[2]}
                    onChange={(e) => setPointAngles([pointAngles[0], pointAngles[1], Number(e.target.value)])}
                    className="w-full h-1.5 bg-amber-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleRecordData}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md"
                >
                  <Plus className="w-5 h-5" />
                  {L('तालिकामा रेकर्ड गर्नुहोस् (Record Data)', 'Record in Table')}
                </button>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl space-y-2">
                  <div className="text-sm font-bold text-purple-900">
                    {L('चारै कोणहरूको योगफल:', 'Sum of all four angles:')}
                  </div>
                  {(() => {
                    const a1 = pointAngles[0];
                    const a2 = pointAngles[1];
                    const a3 = pointAngles[2];
                    const a4 = 360 - (a1 + a2 + a3);
                    return (
                      <div className="text-base font-black text-purple-950">
                        {toNp(a1)}° + {toNp(a2)}° + {toNp(a3)}° + {toNp(a4)}° = {toNp(360)}°
                      </div>
                    );
                  })()}
                  <div className="text-xs text-purple-700 font-bold">
                    ✓ {L('पूर्ण कोण (Complete Angle) = ३६०° प्रमाणित भयो।', 'Complete Angle = 360° Verified.')}
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse bg-slate-50 rounded-2xl overflow-hidden border border-slate-200">
                <thead className="bg-slate-200 text-slate-800 font-bold">
                  <tr>
                    <th className="p-3 border-r border-slate-300">{L('चित्र नं.', 'Fig No.')}</th>
                    <th className="p-3 border-r border-slate-300">∠१</th>
                    <th className="p-3 border-r border-slate-300">∠२</th>
                    <th className="p-3 border-r border-slate-300">∠३</th>
                    <th className="p-3 border-r border-slate-300">∠४</th>
                    <th className="p-3">{L('योगफल (Sum = 360°)', 'Sum')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {records.map((r, idx) => (
                    <tr key={idx} className="hover:bg-purple-50/50">
                      <td className="p-3 border-r border-slate-200 font-bold">{toNp(r.figNo)}</td>
                      <td className="p-3 border-r border-slate-200 text-blue-700 font-semibold">{toNp(r.valA)}°</td>
                      <td className="p-3 border-r border-slate-200 text-emerald-700 font-semibold">{toNp(r.valB)}°</td>
                      <td className="p-3 border-r border-slate-200 text-amber-700 font-semibold">{toNp(r.valC ?? 0)}°</td>
                      <td className="p-3 border-r border-slate-200 text-purple-700 font-semibold">{toNp(r.valD ?? 0)}°</td>
                      <td className="p-3 font-bold text-emerald-700">✓ {r.sumOrEqual}</td>
                    </tr>
                  ))}
                  {records.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-400">
                        {L('रेकर्ड गर्न माथिको बटन थिच्नुहोस्।', 'Click record button to add experimental measurements.')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default AngleExperimentVerificationLab;
