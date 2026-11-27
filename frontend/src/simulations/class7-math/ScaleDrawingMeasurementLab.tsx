/**
 * ScaleDrawingMeasurementLab.tsx
 * Grade 7 Mathematics – Lesson 20: BEARING AND SCALE DRAWING
 * Simulation 3: Scale Drawing and Measurement Lab
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 307-314)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Ruler, Calculator, Check, ArrowRight, Sparkles } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'mapको नाप र जमिनको actual नाप बीचको अनुपातलाई के भनिन्छ?',
    en: 'What is the ratio between the map/drawing measurement and the actual ground measurement called?',
    options: [
      { key: 'A', label: 'Scale ratio' },
      { key: 'B', label: 'Bearing' },
      { key: 'C', label: 'Perimeter' },
      { key: 'D', label: 'Area' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि mapमा 1 cmले 500 m जनाउँछ भने 9 cm mapको दूरीले कति actual दूरी जनाउँछ?',
    en: 'If 1 cm represents 500 m, what is the actual distance for 9 cm on the map?',
    options: [
      { key: 'A', label: '4500 m (4.5 km)' },
      { key: 'B', label: '5000 m' },
      { key: 'C', label: '900 m' },
      { key: 'D', label: '450 m' },
    ],
    answer: 'A',
  },
  {
    np: 'volleyball courtको actual Length 18 m छ। 1 cm = 200 cm (2 m) स्केलमा मापन चित्र बनाउँदा Length कति cm हुन्छ?',
    en: 'A volleyball court is 18 m long. With scale 1 cm = 200 cm (2 m), what is the drawing length?',
    options: [
      { key: 'A', label: '9 cm (18 ÷ 2)' },
      { key: 'B', label: '18 cm' },
      { key: 'C', label: '4.5 cm' },
      { key: 'D', label: '36 cm' },
    ],
    answer: 'A',
  },
  {
    np: 'कोठाको actual नाप 20 ft × 18 ft छ। 1 cm = 2 ft स्केलमा कोठाको मापन चित्रको नाप कति हुन्छ?',
    en: 'A room is 20 ft by 18 ft. At 1 cm = 2 ft, what are the scaled drawing dimensions?',
    options: [
      { key: 'A', label: '10 cm × 9 cm' },
      { key: 'B', label: '20 cm × 18 cm' },
      { key: 'C', label: '5 cm × 4.5 cm' },
      { key: 'D', label: '40 cm × 36 cm' },
    ],
    answer: 'A',
  },
];

type ScaleLabTab = 'volleyball_court' | 'football_ground' | 'room_scale' | 'calculator';

export const ScaleDrawingMeasurementLab: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L20-03',
    chapter: 20,
    titleNp: 'मापन चित्र र नाप प्रयोगशाला (Scale Drawing Lab)',
    titleEn: 'Scale Drawing and Measurement Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [tab, setTab] = useState<ScaleLabTab>('volleyball_court');

  // Interactive Calculator State
  const [calcScale, setCalcScale] = useState<number>(200); // 1 cm = 200 cm
  const [drawingCm, setDrawingCm] = useState<number>(9);
  const [actualMeters, setActualMeters] = useState<number>(18);
  const [calcMode, setCalcMode] = useState<'draw_to_act' | 'act_to_draw'>('draw_to_act');

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! विशाल मैदान वा घरका कोठाहरूलाई कापीमा ठ्याक्कै अनुपात मिलाएर कोर्ने विधि नै मापन चित्र (Scale Drawing) हो!',
        'Hello! Scale drawing represents huge grounds or rooms accurately on paper using a fixed ratio. Let us explore!'
      )}
    >
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 justify-center bg-indigo-50/80 p-2 rounded-2xl border border-indigo-200">
          {[
            { id: 'volleyball_court', np: '1. volleyball court मापन चित्र (Volleyball Court)', en: '1. Volleyball Court' },
            { id: 'football_ground', np: '2. playground मापन चित्र (Ground Scale)', en: '2. Ground Scale' },
            { id: 'room_scale', np: '3. कोठाको मापन चित्र (Room Scale)', en: '3. Room Scale (Feet)' },
            { id: 'calculator', np: '4. मापन चित्र क्यालकुलेटर (Scale Calculator)', en: '4. Scale Calculator' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as ScaleLabTab)}
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

        {/* Tab 1: Volleyball Court */}
        {tab === 'volleyball_court' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-2xl">
              <h3 className="text-base font-bold text-blue-950" style={{ fontFamily: FONT_NP }}>
                {L('पाठ्यपुस्तक उदाहरण: volleyball courtको मापन चित्र:', 'CDC Textbook Example: Volleyball Court Scale Drawing:')}
              </h3>
              <p className="text-slate-700 text-xs md:text-sm mt-1">
                {L(
                  'actual नाप: Length = 18 m (1800 cm), चौडाइ = 9 m (900 cm)। Scale: 1 cm = 200 cm (1 : 200)।',
                  'Actual Dimensions: Length = 18 m (1800 cm), Breadth = 9 m (900 cm). Scale: 1 cm = 200 cm (1 : 200).'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Scaled Visual */}
              <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-6 flex flex-col items-center">
                <svg width="300" height="180" viewBox="0 0 300 180">
                  {/* Volleyball court rectangle (ratio 2:1 -> 240px by 120px) */}
                  <rect x="30" y="30" width="240" height="120" fill="#fef3c7" stroke="#b45309" strokeWidth="3" />

                  {/* Net centerline */}
                  <line x1="150" y1="30" x2="150" y2="150" stroke="#b45309" strokeWidth="2.5" strokeDasharray="4,2" />

                  {/* Attack lines (3m from net -> scaled to 40px) */}
                  <line x1="110" y1="30" x2="110" y2="150" stroke="#d97706" strokeWidth="1.5" />
                  <line x1="190" y1="30" x2="190" y2="150" stroke="#d97706" strokeWidth="1.5" />

                  {/* Dimension labels */}
                  <text x="150" y="22" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#78350f">
                    Scaled length = 9 cm (actual 18 m)
                  </text>
                  <text x="280" y="95" fontSize="11" fontWeight="bold" fill="#78350f">
                    4.5 cm (9 m)
                  </text>
                </svg>

                <div className="text-xs text-amber-900 font-bold mt-2">
                  {L('Scale: 1 cmले 200 cm जनाउँछ (Scale 1 : 200)', 'Scale: 1 cm represents 200 cm (1 : 200)')}
                </div>
              </div>

              {/* Comparison Table */}
              <div className="space-y-3">
                <table className="w-full text-xs border-collapse bg-slate-50 rounded-2xl overflow-hidden border border-slate-200">
                  <thead className="bg-slate-200 text-slate-800 font-bold">
                    <tr>
                      <th className="p-2.5 text-left border-r border-slate-300">{L('भाग (Part)', 'Part')}</th>
                      <th className="p-2.5 border-r border-slate-300">{L('actual नाप (Actual)', 'Actual')}</th>
                      <th className="p-2.5">{L('मापन चित्रको नाप (Drawing)', 'Drawing')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-2.5 font-bold border-r border-slate-200">{L('कोर्टको Length', 'Court Length')}</td>
                      <td className="p-2.5 text-center border-r border-slate-200">18 m (1800 cm)</td>
                      <td className="p-2.5 text-center font-bold text-blue-700">9 cm (1800 ÷ 200)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold border-r border-slate-200">{L('कोर्टको चौडाइ', 'Court Breadth')}</td>
                      <td className="p-2.5 text-center border-r border-slate-200">9 m (900 cm)</td>
                      <td className="p-2.5 text-center font-bold text-blue-700">4.5 cm (900 ÷ 200)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold border-r border-slate-200">{L('जालीदेखि आक्रमण रेखा', 'Attack Line Distance')}</td>
                      <td className="p-2.5 text-center border-r border-slate-200">3 m (300 cm)</td>
                      <td className="p-2.5 text-center font-bold text-blue-700">1.5 cm (300 ÷ 200)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Ground Scale */}
        {tab === 'football_ground' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-emerald-50 border-l-4 border-emerald-600 p-4 rounded-r-2xl">
              <h3 className="text-base font-bold text-emerald-950" style={{ fontFamily: FONT_NP }}>
                {L('पाठ्यपुस्तक उदाहरण: playgroundको मापन चित्र:', 'CDC Example: Playground Scale Drawing:')}
              </h3>
              <p className="text-slate-700 text-xs md:text-sm mt-1">
                {L(
                  'actual नाप: Length = 125 m, चौडाइ = 75 m। Scale: 1 cm = 10 m।',
                  'Actual Ground: Length = 125 m, Breadth = 75 m. Scale: 1 cm represents 10 m.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="bg-emerald-50/40 border border-emerald-200 rounded-2xl p-6 flex flex-col items-center">
                <svg width="300" height="200" viewBox="0 0 300 200">
                  {/* Scaled ground rectangle: 250px by 150px */}
                  <rect x="25" y="25" width="250" height="150" fill="rgba(16, 185, 129, 0.15)" stroke="#059669" strokeWidth="3" />
                  <circle cx="150" cy="100" r="30" fill="none" stroke="#059669" strokeWidth="2" />
                  <line x1="150" y1="25" x2="150" y2="175" stroke="#059669" strokeWidth="2" />

                  <text x="150" y="18" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#065f46">
                    Length = 12.5 cm (125 m)
                  </text>
                  <text x="285" y="105" fontSize="11" fontWeight="bold" fill="#065f46">
                    7.5 cm (75 m)
                  </text>
                </svg>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                  <div className="text-sm font-bold text-slate-800">
                    {L('हिसाब प्रक्रिया (Calculation):', 'Calculation Steps:')}
                  </div>
                  <div className="text-xs text-slate-700 space-y-1">
                    <div>Scale: 1 cm = 10 m</div>
                    <div>Scaled length = 125 m ÷ 10 = <b>12.5 cm</b></div>
                    <div>Scaled breadth = 75 m ÷ 10 = <b>7.5 cm</b></div>
                    <div className="text-emerald-700 font-bold pt-1 border-t border-slate-200">
                      ✓ A rectangle 12.5 cm long and 7.5 cm wide is drawn in the notebook.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Room Scale (Feet) */}
        {tab === 'room_scale' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded-r-2xl">
              <h3 className="text-base font-bold text-purple-950" style={{ fontFamily: FONT_NP }}>
                {L('पाठ्यपुस्तक उदाहरण: कोठाको मापन चित्र (ft एकाइमा):', 'CDC Example: Room Scale Drawing (in Feet):')}
              </h3>
              <p className="text-slate-700 text-xs md:text-sm mt-1">
                {L(
                  'कोठाको actual Length = 20 ft, चौडाइ = 18 ft। Scale: 1 cmले 2 ft जनाउँछ।',
                  'Actual Room: Length = 20 ft, Breadth = 18 ft. Scale: 1 cm represents 2 ft.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="bg-purple-50/40 border border-purple-200 rounded-2xl p-6 flex flex-col items-center">
                <svg width="260" height="230" viewBox="0 0 260 230">
                  <rect x="30" y="30" width="200" height="180" fill="rgba(147, 51, 234, 0.15)" stroke="#7c3aed" strokeWidth="3" />
                  <text x="130" y="20" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#581c87">
                    Length = 10 cm (20 ft)
                  </text>
                  <text x="240" y="125" fontSize="11" fontWeight="bold" fill="#581c87">
                    9 cm (18 ft)
                  </text>
                </svg>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                  <div className="text-sm font-bold text-slate-800">
                    {L('ftबाट cmमा रूपान्तरण:', 'Scale Conversion:')}
                  </div>
                  <div className="text-xs text-slate-700 space-y-1">
                    <div>Scale: 1 cm = 2 ft</div>
                    <div>Drawing length = 20 ft ÷ 2 = <b>10 cm</b></div>
                    <div>Drawing breadth = 18 ft ÷ 2 = <b>9 cm</b></div>
                    <div className="text-purple-700 font-bold pt-1 border-t border-slate-200">
                      ✓ A room map of 10 cm × 9 cm is drawn in the notebook.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Interactive Calculator */}
        {tab === 'calculator' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
              <h3 className="text-base font-bold text-amber-950" style={{ fontFamily: FONT_NP }}>
                {L('मापन चित्र दूरी क्यालकुलेटर (Scale Calculator):', 'Interactive Scale Calculator:')}
              </h3>
              <p className="text-xs text-amber-800 mt-1">
                {L('mapको दूरीबाट actual दूरी वा actual दूरीबाट mapको दूरी तुरुन्त हिसाब गर्नुहोस्।', 'Calculate actual ground distance from drawing measurement or vice versa.')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {L('स्केल छान्नुहोस् (Scale):', 'Choose Scale:')}
                  </label>
                  <select
                    value={calcScale}
                    onChange={(e) => setCalcScale(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                  >
                    <option value={100}>1 cm = 1 m (1 : 100)</option>
                    <option value={200}>1 cm = 2 m (1 : 200 - volleyball court)</option>
                    <option value={500}>1 cm = 5 m (1 : 500)</option>
                    <option value={1000}>1 cm = 10 m (1 : 1000 - playground)</option>
                    <option value={50000}>1 cm = 500 m (1 : 50000 - map)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {L('mapमा नापिएको दूरी (cmमा):', 'Map/Drawing Distance (in cm):')}
                  </label>
                  <input
                    type="number"
                    value={drawingCm}
                    onChange={(e) => setDrawingCm(Number(e.target.value))}
                    className="w-full px-4 py-2 border rounded-xl font-bold text-lg"
                  />
                </div>
              </div>

              {/* Live Output */}
              <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl space-y-3">
                <div className="text-xs font-bold text-emerald-900 uppercase">
                  {L('actual दूरी नतिजा (Actual Distance)', 'Actual Distance Result')}
                </div>
                {(() => {
                  const actualCm = drawingCm * calcScale;
                  const actualM = actualCm / 100;
                  const actualKm = actualM / 1000;
                  return (
                    <div className="space-y-2">
                      <div className="text-3xl font-black text-emerald-900">
                        {actualKm >= 1
                          ? `${toNp(actualKm.toFixed(2))} किमी (${toNp(actualM)} m)`
                          : `${toNp(actualM)} m`}
                      </div>
                      <div className="text-xs text-slate-600 border-t border-emerald-200 pt-2 space-y-1">
                        <div>Formula: actual distance = map distance × scale</div>
                        <div>
                          = {drawingCm} cm × {calcScale} = {actualCm} cm = <b>{actualM} m</b>
                        </div>
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

export default ScaleDrawingMeasurementLab;
