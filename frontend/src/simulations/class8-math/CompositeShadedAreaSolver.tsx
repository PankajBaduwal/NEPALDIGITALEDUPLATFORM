/**
 * CompositeShadedAreaSolver.tsx
 * Grade 8 Mathematics – Unit 8: AREA AND VOLUME
 * Simulation 3: Composite Shapes and Shaded Area Solver
 * Strictly adheres to CDC Nepal Grade 8 Mathematics Curriculum (2023 edition, Unit 8)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Layers, MapPin, DollarSign, Award, CheckCircle, RefreshCw, Grid, Home } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: '240 फिट लम्बाइ र 180 फिट चौडाइ भएको जग्गाभित्र 16 फिट भुजा भएको वर्गाकार पोखरी छ भने पोखरीबाहेकको जग्गाको क्षेत्रफल कति हुन्छ?',
    en: 'A field is 240 ft by 180 ft. Inside is a square pond of side 16 ft. What is the area excluding the pond?',
    options: [
      { key: 'A', label: '42,944 sq ft [ 43,200 - 256 = 42,944 ]' },
      { key: 'B', label: '43,200 sq ft' },
      { key: 'C', label: '42,000 sq ft' },
      { key: 'D', label: '43,456 sq ft' },
    ],
    answer: 'A',
  },
  {
    np: '14 cm भुजा भएको वर्गभित्र ठूलो वृत्त (व्यास = 14 cm) हटाइएको Shaded भागको क्षेत्रफल कति हुन्छ (π = 22/7)?',
    en: 'In a square of side 14 cm, a circle of diameter 14 cm is removed. What is the shaded area (π = 22/7)?',
    options: [
      { key: 'A', label: '42 sq cm [ 196 - 154 = 42 ]' },
      { key: 'B', label: '56 sq cm' },
      { key: 'C', label: '28 sq cm' },
      { key: 'D', label: '35 sq cm' },
    ],
    answer: 'A',
  },
  {
    np: 'आयत र त्रिभुज जोडिएर बनेको संयुक्त आकृतिको कुल क्षेत्रफल कसरी निकालिन्छ?',
    en: 'How is the total area of a composite shape made of a rectangle and a triangle calculated?',
    options: [
      { key: 'A', label: 'Area of rectangle + area of triangle (sum of component areas)' },
      { key: 'B', label: 'Area of rectangle - area of triangle' },
      { key: 'C', label: 'Area of rectangle × area of triangle' },
      { key: 'D', label: 'Sum of the perimeters of both' },
    ],
    answer: 'A',
  },
  {
    np: 'एउटा कोठाको क्षेत्रफल 40 sq m छ। प्रति sq m Rs. 150 का दरले कार्पेट बिछ्याउँदा कति खर्च लाग्छ?',
    en: 'A room area is 40 m². If carpeting costs Rs. 150 per m², what is the total cost?',
    options: [
      { key: 'A', label: 'Rs. 6,000 [ 40 × 150 = 6,000 ]' },
      { key: 'B', label: 'Rs. 5,000' },
      { key: 'C', label: 'Rs. 4,500' },
      { key: 'D', label: 'Rs. 6,500' },
    ],
    answer: 'A',
  },
  {
    np: 'कुनै जग्गाको चारैतिर काँडेतार लगाउँदा खर्च निकाल्न कुन मान आवश्यक पर्छ?',
    en: 'Which measurement is required to calculate the cost of fencing around a plot of land?',
    options: [
      { key: 'A', label: 'Perimeter of the land (in length units)' },
      { key: 'B', label: 'Area of the land (in square units)' },
      { key: 'C', label: 'Volume of the land' },
      { key: 'D', label: 'Weight of the soil' },
    ],
    answer: 'A',
  },
];

export const CompositeShadedAreaSolver: React.FC<{
  onBack?: () => void;
  onBackToLibrary?: () => void;
}> = ({ onBack, onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U8-03',
    chapter: 8,
    titleNp: 'संयुक्त आकृति र Shaded क्षेत्रफल (Composite Shapes & Shaded Area)',
    titleEn: 'Composite Shapes and Shaded Area Solver',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'shaded' | 'field_pond' | 'costing' | 'village_map'>('field_pond');

  // Tab 1: Shaded Region (Square with Circle removed)
  const [sqSide, setSqSide] = useState<number>(14);
  const sqArea = sqSide * sqSide;
  const circleRadius = sqSide / 2;
  const circleArea = (22 / 7) * circleRadius * circleRadius;
  const shadedDiffArea = sqArea - circleArea;

  // Tab 2: CDC Field Excluding Pond
  const [fieldLength, setFieldLength] = useState<number>(240);
  const [fieldBreadth, setFieldBreadth] = useState<number>(180);
  const [pondSide, setPondSide] = useState<number>(16);

  const totalFieldArea = fieldLength * fieldBreadth;
  const pondArea = pondSide * pondSide;
  const remainingFieldArea = totalFieldArea - pondArea;

  // Tab 3: Practical Costing
  const [costArea, setCostArea] = useState<number>(120); // 120 sq meters
  const [carpetRate, setCarpetRate] = useState<number>(250); // Rs 250 per sq m
  const [fencePerimeter, setFencePerimeter] = useState<number>(44); // 44 m
  const [fenceRate, setFenceRate] = useState<number>(180); // Rs 180 per meter

  const totalCarpetCost = costArea * carpetRate;
  const totalFenceCost = fencePerimeter * fenceRate;

  // Tab 4: Village Map Interactive Features
  const [selectedVillageSpot, setSelectedVillageSpot] = useState<'school' | 'pond' | 'water_tank' | 'chautari'>('school');

  const VILLAGE_SPOTS = {
    school: { nameNp: 'School ground', shape: 'Rectangle', l: 60, b: 40, area: 2400, unit: 'm²' },
    pond: { nameNp: 'Fish pond', shape: 'Circle', r: 14, area: (22 / 7) * 14 * 14, unit: 'm²' },
    water_tank: { nameNp: 'Water tank plot', shape: 'Square', s: 10, area: 100, unit: 'm²' },
    chautari: { nameNp: 'Public chautari (resting place)', shape: 'Octagon / Composite', area: 150, unit: 'm²' },
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! व्यावहारिक जीवनमा खेत, कोठा वा खेलमैदानका मिश्रित आकृतिहरूको Shaded क्षेत्रफल निकाल्ने सीप सिकौं!',
        'Hello! Let us learn how to calculate remaining and shaded areas in composite fields, rooms, and village plots!'
      )}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('field_pond')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'field_pond' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Grid className="w-4 h-4" />
            {L('1. पोखरीबाहेकको जग्गा (CDC 240×180 ft)', '1. Field Excluding Pond')}
          </button>
          <button
            onClick={() => setActiveTab('shaded')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'shaded' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            {L('2. Shaded क्षेत्र (Shaded Regions)', '2. Shaded Region Models')}
          </button>
          <button
            onClick={() => setActiveTab('costing')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'costing' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            {L('3. कार्पेटिङ र तारबार खर्च (Practical Costing)', '3. Costing & Flooring')}
          </button>
          <button
            onClick={() => setActiveTab('village_map')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'village_map' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            {L('4. गाउँको नक्सा परियोजना (Village Map Project)', '4. Village Map Project')}
          </button>
        </div>

        {/* Tab 1: Field Excluding Pond (CDC Example) */}
        {activeTab === 'field_pond' && (
          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* SVG Field with Pond */}
              <div className="w-full h-64 bg-slate-800 rounded-2xl flex items-center justify-center p-4 relative overflow-hidden">
                <svg viewBox="0 0 320 220" className="w-full h-full">
                  {/* Outer Field */}
                  <rect x="20" y="20" width="280" height="180" fill="#15803d" stroke="#22c55e" strokeWidth="3" rx="6" />
                  <text x="160" y="16" fill="#86efac" fontSize="11" textAnchor="middle" fontWeight="bold">
                    Length = {toNp(fieldLength)} ft
                  </text>
                  <text x="12" y="115" fill="#86efac" fontSize="11" textAnchor="end" fontWeight="bold">
                    Breadth = {toNp(fieldBreadth)} ft
                  </text>

                  {/* Inner Square Pond */}
                  <rect x="130" y="80" width="60" height="60" fill="#0284c7" stroke="#38bdf8" strokeWidth="2.5" rx="4" />
                  <text x="160" y="115" fill="#ffffff" fontSize="10" textAnchor="middle" fontWeight="bold">
                    {L('पोखरी', 'Pond')}
                  </text>
                  <text x="160" y="130" fill="#e0f2fe" fontSize="9" textAnchor="middle">
                    {toNp(pondSide)} × {toNp(pondSide)} ft
                  </text>
                </svg>
              </div>

              {/* Step-by-Step Calculation */}
              <div className="space-y-4">
                <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 text-xs font-mono space-y-2 text-slate-300">
                  <div className="text-amber-400 font-bold text-sm uppercase">{L('CDC पाठ्यपुस्तक कार्यविधि:', 'CDC Calculation Steps:')}</div>
                  <div>1. Total area of the land = length × breadth = {toNp(fieldLength)} × {toNp(fieldBreadth)} = <b className="text-emerald-400 font-sans text-sm">{toNp(totalFieldArea.toLocaleString())} sq ft</b></div>
                  <div>2. Area of the square pond = l² = {toNp(pondSide)} × {toNp(pondSide)} = <b className="text-sky-400 font-sans text-sm">{toNp(pondArea)} sq ft</b></div>
                  <div className="text-amber-300 text-base font-bold pt-2 border-t border-slate-700 font-sans">
                    3. Remaining area excluding the pond = {toNp(totalFieldArea.toLocaleString())} - {toNp(pondArea)} = <span className="text-2xl text-emerald-400 font-black">{toNp(remainingFieldArea.toLocaleString())}</span> sq ft
                  </div>
                </div>

                {/* Sliders */}
                <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-300 block mb-1">Land length: {toNp(fieldLength)} ft</label>
                      <input type="range" min="100" max="400" step="10" value={fieldLength} onChange={(e) => setFieldLength(Number(e.target.value))} className="w-full accent-green-500" />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-300 block mb-1">Land breadth: {toNp(fieldBreadth)} ft</label>
                      <input type="range" min="80" max="300" step="10" value={fieldBreadth} onChange={(e) => setFieldBreadth(Number(e.target.value))} className="w-full accent-green-500" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1">Side of the pond: {toNp(pondSide)} ft</label>
                    <input type="range" min="8" max="50" step="2" value={pondSide} onChange={(e) => setPondSide(Number(e.target.value))} className="w-full accent-sky-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Shaded Region Models */}
        {activeTab === 'shaded' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800">
                  {L('वर्गभित्र वृत्त हटाइएको Shaded भाग (Square minus Circle)', 'Square with Circle Removed')}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {L(
                    'Shaded भागको क्षेत्रफल = बाहिरी वर्गको क्षेत्रफल - भित्री वृत्तको क्षेत्रफल (π = 22/7)',
                    'Shaded Area = Area of Outer Square - Area of Inner Circle (π = 22/7)'
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* SVG Shaded Corners */}
                <div className="w-full h-64 bg-slate-900 rounded-2xl flex items-center justify-center p-4">
                  <svg viewBox="0 0 240 240" className="w-48 h-48">
                    {/* Shaded Square */}
                    <rect x="20" y="20" width="200" height="200" fill="#f59e0b" stroke="#d97706" strokeWidth="2" />
                    {/* Unshaded Circle cut out */}
                    <circle cx="120" cy="120" r="100" fill="#0f172a" stroke="#fff" strokeWidth="2" />
                    <text x="120" y="115" fill="#94a3b8" fontSize="10" textAnchor="middle">
                      {L('वृत्त (हटाएको)', 'Circle (Cut Out)')}
                    </text>
                    <text x="120" y="130" fill="#94a3b8" fontSize="9" textAnchor="middle">
                      d = {toNp(sqSide)} cm
                    </text>
                    {/* Corner text */}
                    <text x="45" y="45" fill="#fff" fontSize="9" fontWeight="bold">Shaded</text>
                    <text x="195" y="45" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="end">Shaded</text>
                  </svg>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs font-mono space-y-2 text-slate-700">
                    <div className="font-bold text-indigo-900 font-sans">{L('गणना चरणहरू:', 'Calculation Steps:')}</div>
                    <div>1. Area of the square = a² = {toNp(sqSide)} × {toNp(sqSide)} = <b className="text-amber-700">{toNp(sqArea)} cm²</b></div>
                    <div>2. Radius of the circle r = a/2 = {toNp(circleRadius.toFixed(1))} cm</div>
                    <div>3. Area of the circle = πr² = (22/7) × {toNp(circleRadius.toFixed(1))}² = <b className="text-sky-700">{toNp(circleArea.toFixed(1))} cm²</b></div>
                    <div className="text-base text-emerald-700 font-bold font-sans pt-2 border-t border-slate-200">
                      4. Shaded area = {toNp(sqArea)} - {toNp(circleArea.toFixed(1))} = <span className="text-2xl font-black">{toNp(shadedDiffArea.toFixed(1))}</span> cm²
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">
                      {L('वर्गको भुजा परिवर्तन गर्नुहोस् (Square Side a):', 'Square Side (a):')} {toNp(sqSide)} cm
                    </label>
                    <input
                      type="range"
                      min="7"
                      max="28"
                      step="3.5"
                      value={sqSide}
                      onChange={(e) => setSqSide(Number(e.target.value))}
                      className="w-full accent-amber-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Practical Costing */}
        {activeTab === 'costing' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800">
                  {L('क्षेत्रफलमा आधारित लागत हिसाब (Flooring & Fencing Cost)', 'Flooring & Fencing Cost Calculations')}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {L(
                    'महत्त्वपूर्ण नियम: कार्पेट/रङ/टायल लगाउँदा क्षेत्रफल (वर्ग एकाइ) सँग दर गुणन गरिन्छ, तर काँडेतार लगाउँदा परिमिति (लम्बाइ एकाइ) सँग दर गुणन गरिन्छ।',
                    'Crucial rule: Surface covering uses Area (sq units), whereas boundary fencing uses Perimeter (length units).'
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Carpeting / Flooring */}
                <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200 space-y-3">
                  <div className="font-bold text-emerald-950 text-sm">{L('1. कोठामा कार्पेट बिछ्याउने खर्च', '1. Carpeting Expense')}</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">{L('क्षेत्रफल (m²):', 'Area (m²):')}</label>
                      <input
                        type="number"
                        value={costArea}
                        onChange={(e) => setCostArea(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-1.5 border rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">{L('दर (Rs./m²):', 'Rate (Rs/m²):')}</label>
                      <input
                        type="number"
                        value={carpetRate}
                        onChange={(e) => setCarpetRate(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-1.5 border rounded-xl font-bold"
                      />
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-emerald-300">
                    <div className="text-[11px] text-slate-500">{L('जम्मा कार्पेट खर्च (A × Rate):', 'Total Carpet Cost:')}</div>
                    <div className="text-2xl font-black text-emerald-700">Rs. {toNp(totalCarpetCost.toLocaleString())}</div>
                  </div>
                </div>

                {/* Fencing */}
                <div className="bg-indigo-50/70 p-5 rounded-2xl border border-indigo-200 space-y-3">
                  <div className="font-bold text-indigo-950 text-sm">{L('2. जग्गाको चारैतिर काँडेतार खर्च', '2. Fencing Boundary Expense')}</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">{L('परिमिति (m):', 'Perimeter (m):')}</label>
                      <input
                        type="number"
                        value={fencePerimeter}
                        onChange={(e) => setFencePerimeter(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-1.5 border rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block mb-1">{L('दर (Rs./m):', 'Rate (Rs/m):')}</label>
                      <input
                        type="number"
                        value={fenceRate}
                        onChange={(e) => setFenceRate(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-1.5 border rounded-xl font-bold"
                      />
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-indigo-300">
                    <div className="text-[11px] text-slate-500">{L('जम्मा तारबार खर्च (P × Rate):', 'Total Fencing Cost:')}</div>
                    <div className="text-2xl font-black text-indigo-700">Rs. {toNp(totalFenceCost.toLocaleString())}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Village Map Project */}
        {activeTab === 'village_map' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-800">
                  {L('गाउँको नक्सा क्षेत्रफल परियोजना (CDC Village Map Project)', 'Village Map Area Project')}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {L('नक्सामा चिनो लगाइएका सार्वजनिक स्थानहरू छान्नुहोस् र क्षेत्रफल हिसाब गर्नुहोस्:', 'Click on marked village landmarks to calculate their areas:')}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(VILLAGE_SPOTS).map(([k, spot]) => (
                  <button
                    key={k}
                    onClick={() => setSelectedVillageSpot(k as any)}
                    className={`p-4 rounded-2xl border text-left transition ${
                      selectedVillageSpot === k
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-bold">{spot.nameNp}</div>
                    <div className="text-[11px] opacity-80 mt-1">{spot.shape}</div>
                    <div className="text-sm font-black mt-2">{toNp(spot.area.toFixed(0))} {spot.unit}</div>
                  </button>
                ))}
              </div>

              <div className="p-5 bg-slate-900 text-white rounded-2xl font-mono text-xs space-y-2">
                <div className="text-amber-400 font-bold text-sm">
                  {VILLAGE_SPOTS[selectedVillageSpot].nameNp} - {L('क्षेत्रफल विवरण', 'Area Details')}
                </div>
                <div>• Geometrical shape: {VILLAGE_SPOTS[selectedVillageSpot].shape}</div>
                <div>• Total area covered: <b className="text-emerald-400 text-sm">{toNp(VILLAGE_SPOTS[selectedVillageSpot].area.toFixed(1))} {VILLAGE_SPOTS[selectedVillageSpot].unit}</b></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default CompositeShadedAreaSolver;
