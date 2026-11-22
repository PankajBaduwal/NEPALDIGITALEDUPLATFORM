/**
 * ScaleDrawingMeasurementLab.tsx
 * Grade 7 Mathematics – Lesson 20: BEARING AND SCALE DRAWING (दिगंश र मापन चित्र)
 * Simulation 3: Scale Drawing and Measurement Lab (मापन चित्र र नाप प्रयोगशाला)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 307-314)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Ruler, Calculator, Check, ArrowRight, Sparkles } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'नक्साको नाप र जमिनको वास्तविक नाप बीचको अनुपातलाई के भनिन्छ?',
    en: 'What is the ratio between the map/drawing measurement and the actual ground measurement called?',
    options: [
      { key: 'A', label: 'स्केल / मापन अनुपात (Scale)' },
      { key: 'B', label: 'दिगंश' },
      { key: 'C', label: 'परिमिति' },
      { key: 'D', label: 'क्षेत्रफल' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि नक्सामा १ सेमीले ५०० मिटर जनाउँछ भने ९ सेमी नक्साको दूरीले कति वास्तविक दूरी जनाउँछ?',
    en: 'If 1 cm represents 500 m, what is the actual distance for 9 cm on the map?',
    options: [
      { key: 'A', label: '४५०० मिटर (४.५ किमी)' },
      { key: 'B', label: '५००० मिटर' },
      { key: 'C', label: '९०० मिटर' },
      { key: 'D', label: '४५० मिटर' },
    ],
    answer: 'A',
  },
  {
    np: 'भलिबल कोर्टको वास्तविक लम्बाइ १८ मिटर छ। १ सेमी = २०० सेमी (२ मिटर) स्केलमा मापन चित्र बनाउँदा लम्बाइ कति सेमी हुन्छ?',
    en: 'A volleyball court is 18 m long. With scale 1 cm = 200 cm (2 m), what is the drawing length?',
    options: [
      { key: 'A', label: '९ सेमी (१८ ÷ २)' },
      { key: 'B', label: '१८ सेमी' },
      { key: 'C', label: '४.५ सेमी' },
      { key: 'D', label: '३६ सेमी' },
    ],
    answer: 'A',
  },
  {
    np: 'कोठाको वास्तविक नाप २० फिट × १८ फिट छ। १ सेमी = २ फिट स्केलमा कोठाको मापन चित्रको नाप कति हुन्छ?',
    en: 'A room is 20 ft by 18 ft. At 1 cm = 2 ft, what are the scaled drawing dimensions?',
    options: [
      { key: 'A', label: '१० सेमी × ९ सेमी' },
      { key: 'B', label: '२० सेमी × १८ सेमी' },
      { key: 'C', label: '५ सेमी × ४.५ सेमी' },
      { key: 'D', label: '४० सेमी × ३६ सेमी' },
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
            { id: 'volleyball_court', np: '१. भलिबल कोर्ट मापन चित्र (Volleyball Court)', en: '1. Volleyball Court' },
            { id: 'football_ground', np: '२. खेलमैदान मापन चित्र (Ground Scale)', en: '2. Ground Scale' },
            { id: 'room_scale', np: '३. कोठाको मापन चित्र (Room Scale)', en: '3. Room Scale (Feet)' },
            { id: 'calculator', np: '४. मापन चित्र क्यालकुलेटर (Scale Calculator)', en: '4. Scale Calculator' },
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
                {L('पाठ्यपुस्तक उदाहरण: भलिबल कोर्टको मापन चित्र:', 'CDC Textbook Example: Volleyball Court Scale Drawing:')}
              </h3>
              <p className="text-slate-700 text-xs md:text-sm mt-1">
                {L(
                  'वास्तविक नाप: लम्बाइ = १८ मिटर (१८०० सेमी), चौडाइ = ९ मिटर (९०० सेमी)। स्केल: १ सेमी = २०० सेमी (१ : २००)।',
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
                    मापन लम्बाइ = ९ सेमी (वास्तविक १८ मिटर)
                  </text>
                  <text x="280" y="95" fontSize="11" fontWeight="bold" fill="#78350f">
                    ४.५ सेमी (९ मिटर)
                  </text>
                </svg>

                <div className="text-xs text-amber-900 font-bold mt-2">
                  {L('स्केल: १ सेमीले २०० सेमी जनाउँछ (Scale 1 : 200)', 'Scale: 1 cm represents 200 cm (1 : 200)')}
                </div>
              </div>

              {/* Comparison Table */}
              <div className="space-y-3">
                <table className="w-full text-xs border-collapse bg-slate-50 rounded-2xl overflow-hidden border border-slate-200">
                  <thead className="bg-slate-200 text-slate-800 font-bold">
                    <tr>
                      <th className="p-2.5 text-left border-r border-slate-300">{L('भाग (Part)', 'Part')}</th>
                      <th className="p-2.5 border-r border-slate-300">{L('वास्तविक नाप (Actual)', 'Actual')}</th>
                      <th className="p-2.5">{L('मापन चित्रको नाप (Drawing)', 'Drawing')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-2.5 font-bold border-r border-slate-200">{L('कोर्टको लम्बाइ', 'Court Length')}</td>
                      <td className="p-2.5 text-center border-r border-slate-200">१८ मिटर (१८०० सेमी)</td>
                      <td className="p-2.5 text-center font-bold text-blue-700">९ सेमी (१८०० ÷ २००)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold border-r border-slate-200">{L('कोर्टको चौडाइ', 'Court Breadth')}</td>
                      <td className="p-2.5 text-center border-r border-slate-200">९ मिटर (९०० सेमी)</td>
                      <td className="p-2.5 text-center font-bold text-blue-700">४.५ सेमी (९०० ÷ २००)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold border-r border-slate-200">{L('जालीदेखि आक्रमण रेखा', 'Attack Line Distance')}</td>
                      <td className="p-2.5 text-center border-r border-slate-200">३ मिटर (३०० सेमी)</td>
                      <td className="p-2.5 text-center font-bold text-blue-700">१.५ सेमी (३०० ÷ २००)</td>
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
                {L('पाठ्यपुस्तक उदाहरण: खेलमैदानको मापन चित्र:', 'CDC Example: Playground Scale Drawing:')}
              </h3>
              <p className="text-slate-700 text-xs md:text-sm mt-1">
                {L(
                  'वास्तविक नाप: लम्बाइ = १२५ मिटर, चौडाइ = ७५ मिटर। स्केल: १ सेमी = १० मिटर।',
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
                    लम्बाइ = १२.५ सेमी (१२५ मिटर)
                  </text>
                  <text x="285" y="105" fontSize="11" fontWeight="bold" fill="#065f46">
                    ७.५ सेमी (७५ मिटर)
                  </text>
                </svg>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                  <div className="text-sm font-bold text-slate-800">
                    {L('हिसाब प्रक्रिया (Calculation):', 'Calculation Steps:')}
                  </div>
                  <div className="text-xs text-slate-700 space-y-1">
                    <div>स्केल: १ सेमी = १० मिटर</div>
                    <div>मापन लम्बाइ = १२५ मिटर ÷ १० = <b>१२.५ सेमी</b></div>
                    <div>मापन चौडाइ = ७५ मिटर ÷ १० = <b>७.५ सेमी</b></div>
                    <div className="text-emerald-700 font-bold pt-1 border-t border-slate-200">
                      ✓ कापीमा १२.५ सेमी लम्बाइ र ७.५ सेमी चौडाइको आयत बनाइन्छ।
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
                {L('पाठ्यपुस्तक उदाहरण: कोठाको मापन चित्र (फिट एकाइमा):', 'CDC Example: Room Scale Drawing (in Feet):')}
              </h3>
              <p className="text-slate-700 text-xs md:text-sm mt-1">
                {L(
                  'कोठाको वास्तविक लम्बाइ = २० फिट, चौडाइ = १८ फिट। स्केल: १ सेमीले २ फिट जनाउँछ।',
                  'Actual Room: Length = 20 ft, Breadth = 18 ft. Scale: 1 cm represents 2 ft.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="bg-purple-50/40 border border-purple-200 rounded-2xl p-6 flex flex-col items-center">
                <svg width="260" height="230" viewBox="0 0 260 230">
                  <rect x="30" y="30" width="200" height="180" fill="rgba(147, 51, 234, 0.15)" stroke="#7c3aed" strokeWidth="3" />
                  <text x="130" y="20" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#581c87">
                    लम्बाइ = १० सेमी (२० फिट)
                  </text>
                  <text x="240" y="125" fontSize="11" fontWeight="bold" fill="#581c87">
                    ९ सेमी (१८ फिट)
                  </text>
                </svg>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                  <div className="text-sm font-bold text-slate-800">
                    {L('फिटबाट सेमीमा रूपान्तरण:', 'Scale Conversion:')}
                  </div>
                  <div className="text-xs text-slate-700 space-y-1">
                    <div>स्केल: १ सेमी = २ फिट</div>
                    <div>चित्रको लम्बाइ = २० फिट ÷ २ = <b>१० सेमी</b></div>
                    <div>चित्रको चौडाइ = १८ फिट ÷ २ = <b>९ सेमी</b></div>
                    <div className="text-purple-700 font-bold pt-1 border-t border-slate-200">
                      ✓ कापीमा १० सेमी × ९ सेमीको कोठाको नक्सा बन्छ।
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
                {L('नक्साको दूरीबाट वास्तविक दूरी वा वास्तविक दूरीबाट नक्साको दूरी तुरुन्त हिसाब गर्नुहोस्।', 'Calculate actual ground distance from drawing measurement or vice versa.')}
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
                    <option value={100}>१ सेमी = १ मिटर (१ : १००)</option>
                    <option value={200}>१ सेमी = २ मिटर (१ : २०० - भलिबल कोर्ट)</option>
                    <option value={500}>१ सेमी = ५ मिटर (१ : ५००)</option>
                    <option value={1000}>१ सेमी = १० मिटर (१ : १००० - खेलमैदान)</option>
                    <option value={50000}>१ सेमी = ५०० मिटर (१ : ५०००० - नक्सा)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {L('नक्सामा नापिएको दूरी (सेमीमा):', 'Map/Drawing Distance (in cm):')}
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
                  {L('वास्तविक दूरी नतिजा (Actual Distance)', 'Actual Distance Result')}
                </div>
                {(() => {
                  const actualCm = drawingCm * calcScale;
                  const actualM = actualCm / 100;
                  const actualKm = actualM / 1000;
                  return (
                    <div className="space-y-2">
                      <div className="text-3xl font-black text-emerald-900">
                        {actualKm >= 1
                          ? `${toNp(actualKm.toFixed(2))} किमी (${toNp(actualM)} मिटर)`
                          : `${toNp(actualM)} मिटर`}
                      </div>
                      <div className="text-xs text-slate-600 border-t border-emerald-200 pt-2 space-y-1">
                        <div>सूत्र: वास्तविक दूरी = नक्साको दूरी × स्केल</div>
                        <div>
                          = {drawingCm} सेमी × {calcScale} = {actualCm} सेमी = <b>{actualM} मिटर</b>
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
