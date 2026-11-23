import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';

const QUIZ_QUESTIONS = [
  {
    np: 'प्रिज्मको आयतन (Volume of a Prism) को सामान्य सूत्र के हो?',
    en: 'What is the general formula for the volume of a prism?',
    options: [
      { key: 'A', label: 'V = आधारको परिमिति × उचाइ (P × h)' },
      { key: 'B', label: 'V = आधारको क्षेत्रफल × उचाइ (A × h)' },
      { key: 'C', label: 'V = २A + P × h' },
      { key: 'D', label: 'V = १/३ × A × h' },
    ],
    answer: 'B',
  },
  {
    np: 'पाठ्यपुस्तक अनुसार १ घन मिटर (१ m³) मा कति लिटर पानी अटाउँछ?',
    en: 'According to the CDC textbook, how many liters of water are contained in 1 cubic meter (1 m³)?',
    options: [
      { key: 'A', label: '१०० लिटर' },
      { key: 'B', label: '५०० लिटर' },
      { key: 'C', label: '१,००० लिटर (1,000 Liters)' },
      { key: 'D', label: '१०,००० लिटर' },
    ],
    answer: 'C',
  },
  {
    np: 'कति घन सेन्टिमिटर (cm³) बराबर १ लिटर पानी हुन्छ?',
    en: 'How many cubic centimeters (cm³) equal 1 liter of water?',
    options: [
      { key: 'A', label: '१०० cm³' },
      { key: 'B', label: '१,००० cm³ (1,000 cm³ = 1 L)' },
      { key: 'C', label: '१०,००० cm³' },
      { key: 'D', label: '५०० cm³' },
    ],
    answer: 'B',
  },
  {
    np: '२ मिटर लम्बाइ, १.५ मिटर चौडाइ र १ मिटर उचाइ भएको आयताकार पानी ट्याङ्कीको कुल क्षमता कति लिटर हुन्छ?',
    en: 'What is the capacity in liters of a rectangular tank measuring 2m × 1.5m × 1m?',
    options: [
      { key: 'A', label: '३,००० लिटर (२ × १.५ × १ = ३ m³ = ३,००० लिटर)' },
      { key: 'B', label: '१,५०० लिटर' },
      { key: 'C', label: '४,५०० लिटर' },
      { key: 'D', label: '२,००० लिटर' },
    ],
    answer: 'A',
  },
];

export const PrismVolumeWaterTankDesigner: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U6-03',
    chapter: 6,
    titleNp: 'प्रिज्मको आयतन तथा पानी ट्याङ्की डिजाइन',
    titleEn: 'Prism Volume and Water Tank Designer',
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'tank' | 'flow' | 'problems'>('tank');
  const [tankShape, setTankShape] = useState<'rect' | 'cube' | 'tri'>('rect');

  // --- Rectangular Tank Dimensions (in meters) ---
  const [tankL, setTankL] = useState<number>(2.5); // meters
  const [tankB, setTankB] = useState<number>(1.6); // meters
  const [tankH, setTankH] = useState<number>(1.5); // meters

  // --- Water Level Slider (0% empty to 100% full) ---
  const [waterFillPct, setWaterFillPct] = useState<number>(65); // %

  // --- Pump Flow Rate (Liters per minute) ---
  const [pumpFlowLpm, setPumpFlowLpm] = useState<number>(50); // L/min

  // Calculations
  let baseAreaSqM = 0;
  let totalVolumeCubicM = 0;

  if (tankShape === 'rect') {
    baseAreaSqM = tankL * tankB;
    totalVolumeCubicM = baseAreaSqM * tankH;
  } else if (tankShape === 'cube') {
    baseAreaSqM = tankL * tankL;
    totalVolumeCubicM = tankL * tankL * tankL;
  } else {
    // Right-angled triangular base prism
    baseAreaSqM = (tankL * tankB) / 2;
    totalVolumeCubicM = baseAreaSqM * tankH;
  }

  const totalCapacityLiters = Math.round(totalVolumeCubicM * 1000);
  const currentWaterLiters = Math.round((totalCapacityLiters * waterFillPct) / 100);
  const remainingLiters = totalCapacityLiters - currentWaterLiters;

  // Time to fill remaining with pump (in minutes)
  const timeToFillRemainingMin = pumpFlowLpm > 0 ? Math.round((remainingLiters / pumpFlowLpm) * 10) / 10 : 0;

  // Practical textbook family consumption
  const familyDailyUseLiters = 450; // 5 members @ 90 L/day
  const daysOfWater = (currentWaterLiters / familyDailyUseLiters).toFixed(1);

  // Challenge mode
  const [probIndex, setProbIndex] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const tankProblems = [
    {
      titleNp: 'समस्या १: छतको पानी ट्याङ्कीको लिटर क्षमता',
      titleEn: 'Problem 1: Overhead Tank Liter Capacity',
      descNp: 'एउटा घरको छतमा २.० मिटर लम्बाइ, १.२ मिटर चौडाइ र १.० मिटर उचाइ भएको आयताकार सिमेन्ट ट्याङ्की बनाइएको छ। सो ट्याङ्कीमा कति लिटर पानी अटाउँछ?',
      descEn: 'A rectangular rooftop tank measures 2.0m long, 1.2m wide, and 1.0m high. What is its water capacity in liters?',
      correct: 2400,
      solutionNp: 'आयतन V = २.० × १.२ × १.० = २.४ m³। १ m³ = १,००० लिटर हुनाले कुल क्षमता = २.४ × १,००० = २,४०० लिटर।',
      solutionEn: 'Volume V = 2.0 × 1.2 × 1.0 = 2.4 m³. Since 1 m³ = 1,000 liters, capacity = 2.4 × 1,000 = 2,400 liters.',
    },
    {
      titleNp: 'समस्या २: पानी भर्न लाग्ने समय',
      titleEn: 'Problem 2: Time to Fill Tank with Pump',
      descNp: '३,००० लिटर क्षमता भएको खाली ट्याङ्कीमा प्रति मिनेट ६० लिटर पानी तान्ने मोटर पम्पले पानी भर्दा ट्याङ्की भरिन कति मिनेट लाग्छ?',
      descEn: 'A 3,000 liter empty tank is filled by a pump with flow rate 60 liters/minute. How many minutes will it take to fill completely?',
      correct: 50,
      solutionNp: 'समय = कुल लिटर / प्रवाह दर = ३,००० / ६० = ५० मिनेट।',
      solutionEn: 'Time = Total Liters / Flow Rate = 3,000 / 60 = 50 minutes.',
    },
    {
      titleNp: 'समस्या ३: परिवारको पानी उपभोग अवधि',
      titleEn: 'Problem 3: Family Consumption Duration',
      descNp: 'एउटा परिवारले दैनिक ५०० लिटर पानी खर्च गर्छ। २,००० लिटर पानी भएको ट्याङ्कीको पानी सो परिवारलाई कति दिन पुग्छ?',
      descEn: 'A family consumes 500 liters of water daily. For how many days will 2,000 liters of water last?',
      correct: 4,
      solutionNp: 'दिन संख्या = २,००० लिटर / ५०० लिटर = ४ दिन।',
      solutionEn: 'Number of days = 2,000 liters / 500 liters = 4 days.',
    },
  ];

  const currProb = tankProblems[probIndex];

  const handleCheckChallenge = () => {
    const val = parseFloat(userAnswer.trim());
    if (isNaN(val)) return;
    if (Math.abs(val - currProb.correct) <= 1) {
      kit.good();
      setFeedback('correct');
    } else {
      kit.oops();
      setFeedback('incorrect');
    }
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! प्रिज्मको आयतन (V = A × h), पानी ट्याङ्कीको लिटर क्षमता (१ m³ = १,००० लिटर) र पानीको स्तर सिमुलेशन सिकौं!',
        'Welcome! Explore prism volume (V = A × h), tank capacity in liters (1 m³ = 1,000 L), and water fill simulation!'
      )}
    >
      <div className="space-y-6" style={{ fontFamily: isNe ? FONT_NP : 'inherit' }}>
        {/* Navigation Tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl max-w-xl mx-auto shadow-inner">
          <button
            onClick={() => setActiveTab('tank')}
            className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'tank'
                ? 'bg-cyan-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span>🚰</span>
            <span>{L('१. पानी ट्याङ्की डिजाइनर', '1. Tank Designer')}</span>
          </button>
          <button
            onClick={() => setActiveTab('flow')}
            className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'flow'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span>⏱️</span>
            <span>{L('२. मोटर पम्प तथा उपभोग', '2. Pump & Usage')}</span>
          </button>
          <button
            onClick={() => setActiveTab('problems')}
            className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'problems'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span>🎯</span>
            <span>{L('३. पाठ्यपुस्तक समस्या चुनौती', '3. Word Problems')}</span>
          </button>
        </div>

        {activeTab === 'tank' && (
          /* =========================================================================
             WATER TANK DESIGNER
             ========================================================================= */
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/40 dark:to-blue-950/30 p-5 rounded-2xl border border-cyan-200 dark:border-cyan-800">
              <h2 className="text-xl font-bold text-cyan-900 dark:text-cyan-200 mb-2 flex items-center gap-2">
                <span>🚰</span>
                <span>{L('प्रिज्मको आयतन तथा पानी ट्याङ्की क्षमता', 'Prism Volume & Water Tank Capacity')}</span>
              </h2>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {L(
                  'प्रिज्मको आयतन = आधारको क्षेत्रफल × उचाइ (V = A × h)। १ घन मिटर (m³) मा १,००० लिटर पानी अटाउँछ र १,००० घन सेन्टिमिटर (cm³) मा १ लिटर पानी अटाउँछ।',
                  'Volume of a prism = Base Area × Height (V = A × h). 1 cubic meter (m³) contains 1,000 liters, and 1,000 cm³ equals 1 liter.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controls */}
              <div className="lg:col-span-5 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-4">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg border-b pb-2">
                  {L('ट्याङ्कीको आकार तथा नाप', 'Tank Shape & Dimensions')}
                </h3>

                {/* Tank Shape Selector */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setTankShape('rect')}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                      tankShape === 'rect' ? 'bg-cyan-600 text-white border-cyan-600 shadow' : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {L('आयताकार', 'Rectangular')}
                  </button>
                  <button
                    onClick={() => setTankShape('cube')}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                      tankShape === 'cube' ? 'bg-cyan-600 text-white border-cyan-600 shadow' : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {L('घनाकार (Cube)', 'Cube')}
                  </button>
                  <button
                    onClick={() => setTankShape('tri')}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                      tankShape === 'tri' ? 'bg-cyan-600 text-white border-cyan-600 shadow' : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {L('त्रिभुजाकार', 'Triangular')}
                  </button>
                </div>

                {/* Length */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{L('लम्बाइ l (Length):', 'Length (l):')}</span>
                    <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{tankL} m</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="5.0"
                    step="0.1"
                    value={tankL}
                    onChange={(e) => setTankL(parseFloat(e.target.value))}
                    className="w-full accent-cyan-600 cursor-pointer"
                  />
                </div>

                {/* Breadth (if not cube) */}
                {tankShape !== 'cube' && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{L('चौडाइ b (Breadth):', 'Breadth (b):')}</span>
                      <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{tankB} m</span>
                    </div>
                    <input
                      type="range"
                      min="0.8"
                      max="3.5"
                      step="0.1"
                      value={tankB}
                      onChange={(e) => setTankB(parseFloat(e.target.value))}
                      className="w-full accent-cyan-600 cursor-pointer"
                    />
                  </div>
                )}

                {/* Height (if not cube) */}
                {tankShape !== 'cube' && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{L('उचाइ h (Height):', 'Height (h):')}</span>
                      <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{tankH} m</span>
                    </div>
                    <input
                      type="range"
                      min="0.8"
                      max="3.0"
                      step="0.1"
                      value={tankH}
                      onChange={(e) => setTankH(parseFloat(e.target.value))}
                      className="w-full accent-cyan-600 cursor-pointer"
                    />
                  </div>
                )}

                {/* Water Level Slider */}
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 space-y-2">
                  <div className="flex justify-between text-xs font-bold text-blue-900 dark:text-blue-200">
                    <span>{L('पानीको स्तर (Water Level):', 'Water Fill Level:')}</span>
                    <span className="font-mono">{waterFillPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={waterFillPct}
                    onChange={(e) => setWaterFillPct(parseInt(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="text-[11px] text-blue-700 dark:text-blue-300 font-mono">
                    {L(`हाल पानी: ${toNp(currentWaterLiters)} लिटर / बाँकी: ${toNp(remainingLiters)} लिटर`, `Current: ${currentWaterLiters} L / Remaining: ${remainingLiters} L`)}
                  </div>
                </div>
              </div>

              {/* 3D Visual Tank & Water Animation */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center min-h-[300px]">
                  <svg viewBox="0 0 460 260" className="w-full max-w-lg h-64">
                    {/* Tank Outer Glass Wireframe */}
                    <polygon
                      points="100,60 300,60 380,110 180,110"
                      className="fill-transparent stroke-gray-400 stroke-1 stroke-dashed"
                      strokeDasharray="4 4"
                    />
                    <polygon
                      points="100,200 300,200 380,250 180,250"
                      className="fill-cyan-100/30 stroke-cyan-600 stroke-2"
                    />

                    {/* Water Volume (height proportional to waterFillPct) */}
                    {(() => {
                      const totalH = 140; // from y=200 up to y=60
                      const waterH = totalH * (waterFillPct / 100);
                      const topY = 200 - waterH;

                      return (
                        <>
                          {/* Water Front Face */}
                          <polygon
                            points={`100,200 300,200 300,${topY} 100,${topY}`}
                            className="fill-blue-400/70 stroke-blue-500 stroke-1 transition-all duration-300"
                          />
                          {/* Water Right Face */}
                          <polygon
                            points={`300,200 380,250 380,${topY + 50} 300,${topY}`}
                            className="fill-blue-500/70 stroke-blue-600 stroke-1 transition-all duration-300"
                          />
                          {/* Water Top Surface Oval/Polygon */}
                          <polygon
                            points={`100,${topY} 300,${topY} 380,${topY + 50} 180,${topY + 50}`}
                            className="fill-blue-300/80 stroke-blue-400 stroke-1 transition-all duration-300"
                          />
                        </>
                      );
                    })()}

                    {/* Outer Vertical Edges */}
                    <line x1="100" y1="60" x2="100" y2="200" className="stroke-cyan-600 stroke-2" />
                    <line x1="300" y1="60" x2="300" y2="200" className="stroke-cyan-600 stroke-2" />
                    <line x1="380" y1="110" x2="380" y2="250" className="stroke-cyan-600 stroke-2" />
                    <line x1="180" y1="110" x2="180" y2="250" className="stroke-cyan-600 stroke-2" />

                    {/* Liter Label inside water */}
                    <text x="240" y="190" textAnchor="middle" className="text-base font-black fill-white drop-shadow font-mono">
                      {isNe ? toNp(currentWaterLiters) : currentWaterLiters.toLocaleString()} L
                    </text>
                  </svg>
                </div>

                {/* Calculation Breakdown Cards */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500">{L('कुल आयतन (Volume V = A × h):', 'Total Volume (V = A × h):')}</div>
                    <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono mt-1">
                      {isNe ? toNp(totalVolumeCubicM.toFixed(2)) : totalVolumeCubicM.toFixed(2)} m³
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1 font-mono">
                      A = {baseAreaSqM.toFixed(2)} m²
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500">{L('कुल पानी क्षमता (Liter Capacity):', 'Total Capacity in Liters:')}</div>
                    <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono mt-1">
                      {isNe ? toNp(totalCapacityLiters) : totalCapacityLiters.toLocaleString()} L
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1 font-mono">
                      {totalVolumeCubicM.toFixed(2)} × १,००० लिटर
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'flow' && (
          /* =========================================================================
             PUMP & USAGE SIMULATION
             ========================================================================= */
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 p-5 rounded-2xl border border-blue-200 dark:border-blue-800">
              <h2 className="text-xl font-bold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
                <span>⏱️</span>
                <span>{L('मोटर पम्प प्रवाह तथा घरायसी उपभोग हिसाब', 'Pump Flow Rate and Daily Consumption')}</span>
              </h2>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {L(
                  'मोटर पम्पको पानी प्रवाह दर (प्रति मिनेट लिटर) र परिवारको दैनिक उपभोगको आधारमा ट्याङ्की भरिन लाग्ने समय र पानी पुग्ने दिन गणना गर्नुहोस्।',
                  'Calculate pump fill duration and how many days water will last based on family usage.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-4">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg border-b pb-2">
                  {L('पम्प प्रवाह नियन्त्रण', 'Pump Flow Parameters')}
                </h3>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {L('मोटर पम्पको प्रवाह दर (Flow Rate L/min):', 'Pump Flow Rate (L/min):')}
                    </span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{pumpFlowLpm} L/min</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="120"
                    step="5"
                    value={pumpFlowLpm}
                    onChange={(e) => setPumpFlowLpm(parseInt(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>

              <div className="lg:col-span-7 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-4 text-sm">
                <h4 className="font-bold text-gray-800 dark:text-gray-100 border-b pb-2">
                  {L('व्यावहारिक विश्लेषण नतिजा (Practical Analysis)', 'Practical Analysis Results')}
                </h4>

                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl space-y-1">
                  <div className="font-bold text-blue-900 dark:text-blue-200">
                    {L('१. बाँकी खाली भाग भरिन लाग्ने समय:', '1. Time to Fill Remaining Capacity:')}
                  </div>
                  <div className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono">
                    {isNe ? toNp(timeToFillRemainingMin) : timeToFillRemainingMin} {L('मिनेट', 'minutes')}
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    {remainingLiters} L / {pumpFlowLpm} L/min
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl space-y-1">
                  <div className="font-bold text-emerald-900 dark:text-emerald-200">
                    {L('२. परिवारलाई पुग्ने अनुमानित दिन (दैनिक ४५० लिटर खर्चमा):', '2. Days Water Will Last (at 450 L/day):')}
                  </div>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {isNe ? toNp(daysOfWater) : daysOfWater} {L('दिन', 'days')}
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    {currentWaterLiters} L / ४५० L/दिन
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'problems' && (
          /* =========================================================================
             WORD PROBLEMS CHALLENGE
             ========================================================================= */
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex gap-2 justify-center">
              {tankProblems.map((p, i) => (
                <button
                  key={p.titleEn}
                  onClick={() => {
                    setProbIndex(i);
                    setUserAnswer('');
                    setFeedback(null);
                  }}
                  className={`py-2 px-4 rounded-xl text-sm font-bold border transition-all ${
                    probIndex === i
                      ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {isNe ? toNp(i + 1) : i + 1}
                </button>
              ))}
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-purple-200 dark:border-purple-800 space-y-5">
              <div className="border-b pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  {L('पाठ्यपुस्तक समस्या', 'Textbook Word Problem')}
                </span>
                <h3 className="text-xl font-black text-gray-800 dark:text-gray-100 mt-1">
                  {isNe ? currProb.titleNp : currProb.titleEn}
                </h3>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-xl text-gray-800 dark:text-gray-200 text-base leading-relaxed border border-purple-200 dark:border-purple-800">
                {isNe ? currProb.descNp : currProb.descEn}
              </div>

              {/* Input */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {L('तपाईंको उत्तर:', 'Your Answer:')}
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    step="any"
                    value={userAnswer}
                    onChange={(e) => {
                      setUserAnswer(e.target.value);
                      setFeedback(null);
                    }}
                    placeholder={L('उत्तर लेख्नुहोस्...', 'Enter value...')}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 font-mono text-lg font-bold dark:bg-gray-700 dark:text-gray-100"
                  />
                  <button
                    onClick={handleCheckChallenge}
                    disabled={!userAnswer.trim()}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow disabled:opacity-50 transition-all"
                  >
                    {L('जाँच गर्नुहोस्', 'Check Answer')}
                  </button>
                </div>
              </div>

              {/* Feedback Alert */}
              {feedback === 'correct' && (
                <div className="p-4 bg-green-50 dark:bg-green-950/40 border border-green-300 dark:border-green-800 rounded-xl text-green-900 dark:text-green-200 space-y-2">
                  <div className="font-black flex items-center gap-2 text-base">
                    <span>🎉</span>
                    <span>{L('उत्कृष्ट! सही उत्तर।', 'Excellent! Correct Answer.')}</span>
                  </div>
                  <div className="text-sm">
                    <strong>{L('समाधान विधि:', 'Solution:')}</strong> {isNe ? currProb.solutionNp : currProb.solutionEn}
                  </div>
                </div>
              )}

              {feedback === 'incorrect' && (
                <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded-xl text-red-900 dark:text-red-200 space-y-2">
                  <div className="font-black flex items-center gap-2 text-base">
                    <span>❌</span>
                    <span>{L('उत्तर मिलेन। पुनः प्रयास गर्नुहोस्।', 'Incorrect. Please try again!')}</span>
                  </div>
                  <div className="text-xs">
                    {L('सुझाव: आयतन V = A × h निकाल्नुहोस् र १ m³ = १,००० लिटर सम्बन्ध प्रयोग गर्नुहोस्।', 'Hint: Calculate V = A × h and use 1 m³ = 1,000 L conversion.')}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default PrismVolumeWaterTankDesigner;
