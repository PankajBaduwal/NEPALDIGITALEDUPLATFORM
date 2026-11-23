import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';

const QUIZ_QUESTIONS = [
  {
    np: 'गोला (Sphere) को कुल सतहको क्षेत्रफल (Surface Area) को सूत्र के हो?',
    en: 'What is the formula for the surface area of a sphere?',
    options: [
      { key: 'A', label: '४πr²' },
      { key: 'B', label: '२πr²' },
      { key: 'C', label: '४/३ πr³' },
      { key: 'D', label: '३πr²' },
    ],
    answer: 'A',
  },
  {
    np: 'अर्धगोला (Hemisphere) को कुल सतहको क्षेत्रफल (TSA) को सूत्र के हो?',
    en: 'What is the formula for the Total Surface Area (TSA) of a hemisphere?',
    options: [
      { key: 'A', label: '२πr²' },
      { key: 'B', label: '३πr² (वक्र सतह २πr² + वृत्ताकार सतह πr²)' },
      { key: 'C', label: '४πr²' },
      { key: 'D', label: '२/३ πr³' },
    ],
    answer: 'B',
  },
  {
    np: 'गोलाको आयतन (Volume of a Sphere) को सूत्र के हो?',
    en: 'What is the formula for the volume of a sphere?',
    options: [
      { key: 'A', label: 'V = ४/३ πr³' },
      { key: 'B', label: 'V = २/३ πr³' },
      { key: 'C', label: 'V = ४πr²' },
      { key: 'D', label: 'V = πr²h' },
    ],
    answer: 'A',
  },
  {
    np: 'अर्धगोलाको आयतन गोलाको आयतनको कति भाग हुन्छ?',
    en: 'What fraction of a sphere\'s volume is a hemisphere\'s volume?',
    options: [
      { key: 'A', label: 'बराबर' },
      { key: 'B', label: 'आधा (१/२ भाग अर्थात् २/३ πr³)' },
      { key: 'C', label: 'एक-चौथाइ (१/४ भाग)' },
      { key: 'D', label: 'दुई गुणा' },
    ],
    answer: 'B',
  },
];

export const SphereHemisphere3DLab: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U7-03',
    chapter: 7,
    titleNp: 'गोला तथा अर्धगोला ३D प्रयोगशाला',
    titleEn: 'Sphere and Hemisphere 3D Laboratory',
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'solid' | 'cut' | 'displacement'>('solid');
  const [radiusCm, setRadiusCm] = useState<number>(7); // cm
  const [sliceOpen, setSliceOpen] = useState<boolean>(false);

  const pi = 22 / 7;
  const diameterCm = radiusCm * 2;

  // Sphere calculations
  const sphereArea = 4 * pi * radiusCm * radiusCm;
  const sphereVolume = (4 / 3) * pi * Math.pow(radiusCm, 3);

  // Hemisphere calculations
  const hemiCSA = 2 * pi * radiusCm * radiusCm;
  const hemiFlatBase = pi * radiusCm * radiusCm;
  const hemiTSA = 3 * pi * radiusCm * radiusCm; // 2πr² + πr²
  const hemiVolume = (2 / 3) * pi * Math.pow(radiusCm, 3);

  // Water displacement calculation (assuming 5000 ml water in cylinder beaker of radius 15 cm)
  const beakerRadius = 15;
  const waterRiseCm = sphereVolume / (pi * beakerRadius * beakerRadius);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! गोला (४πr², ४/३ πr³) र अर्धगोला (वक्र २πr², कुल ३πr², आयतन २/३ πr³) को क्षेत्रफल, आयतन र विस्थापन प्रयोग सिकौं!',
        'Welcome! Explore sphere (4πr², 4/3 πr³) and hemisphere (CSA=2πr², TSA=3πr², Vol=2/3 πr³) areas, volumes and water displacement!'
      )}
    >
      <div className="space-y-6" style={{ fontFamily: isNe ? FONT_NP : 'inherit' }}>
        {/* Navigation Tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl max-w-xl mx-auto shadow-inner">
          <button
            onClick={() => setActiveTab('solid')}
            className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'solid'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span>🌐</span>
            <span>{L('१. गोला र अर्धगोला', '1. Sphere & Hemisphere')}</span>
          </button>
          <button
            onClick={() => setActiveTab('cut')}
            className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'cut'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span>✂️</span>
            <span>{L('२. समतल काट विभाजन', '2. Slicing Plane')}</span>
          </button>
          <button
            onClick={() => setActiveTab('displacement')}
            className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'displacement'
                ? 'bg-cyan-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span>🧪</span>
            <span>{L('३. पानी विस्थापन प्रयोग', '3. Water Displacement')}</span>
          </button>
        </div>

        {/* Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Left */}
          <div className="lg:col-span-5 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg border-b pb-2">
              {L('गोलाको नाप नियन्त्रण', 'Sphere Parameters')}
            </h3>

            {/* Radius Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {L('अर्धव्यास r (Radius):', 'Radius (r):')}
                </span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  {isNe ? toNp(radiusCm) : radiusCm} cm (d = {isNe ? toNp(diameterCm) : diameterCm} cm)
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="21"
                step="1"
                value={radiusCm}
                onChange={(e) => setRadiusCm(parseInt(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Slicing Plane Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
              <div>
                <div className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  {L('समतलले बीचबाट काट्ने (Split Hemispheres):', 'Split into 2 Hemispheres:')}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {L('गोलालाई दुई बराबर अर्धगोलामा विभाजन गर्छ', 'Divides sphere into 2 equal hemispheres')}
                </div>
              </div>
              <input
                type="checkbox"
                checked={sliceOpen}
                onChange={(e) => setSliceOpen(e.target.checked)}
                className="w-6 h-6 text-blue-600 rounded cursor-pointer"
              />
            </div>

            {/* Presets */}
            <div>
              <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                {L('पाठ्यपुस्तकका चर्चित उदाहरणहरू:', 'Textbook Examples:')}
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  onClick={() => setRadiusCm(7)}
                  className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg border hover:bg-gray-100 font-bold text-center"
                >
                  r = 7 cm
                </button>
                <button
                  onClick={() => setRadiusCm(10.5)}
                  className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg border hover:bg-gray-100 font-bold text-center"
                >
                  r = 10.5 cm
                </button>
                <button
                  onClick={() => setRadiusCm(14)}
                  className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg border hover:bg-gray-100 font-bold text-center"
                >
                  r = 14 cm
                </button>
              </div>
            </div>
          </div>

          {/* Visualization Right */}
          <div className="lg:col-span-7 space-y-4">
            {/* SVG Visualizer */}
            <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center min-h-[300px]">
              <svg viewBox="0 0 460 280" className="w-full max-w-lg h-64">
                {!sliceOpen ? (
                  /* Whole Sphere 3D with shading */
                  <g>
                    <defs>
                      <radialGradient id="sphereGrad" cx="35%" cy="35%" r="65%">
                        <stop offset="0%" stopColor="#93c5fd" />
                        <stop offset="50%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#1e3a8a" />
                      </radialGradient>
                    </defs>
                    {/* Main Sphere Body */}
                    <circle cx="230" cy="140" r="90" fill="url(#sphereGrad)" className="stroke-blue-900 stroke-1" />
                    {/* Equator Guide Ring */}
                    <ellipse cx="230" cy="140" rx="90" ry="24" className="fill-transparent stroke-white/60 stroke-1 stroke-dashed" strokeDasharray="4 4" />
                    {/* Radius Vector */}
                    <line x1="230" y1="140" x2="320" y2="140" className="stroke-white stroke-2" />
                    <circle cx="230" cy="140" r="3" className="fill-white" />
                    <text x="275" y="132" textAnchor="middle" className="text-xs font-bold fill-white font-mono">
                      r = {radiusCm} cm
                    </text>
                    <text x="230" y="255" textAnchor="middle" className="text-sm font-black fill-blue-900 dark:fill-blue-200">
                      {L('गोला (Sphere): क्षेत्रफल = ४πr², आयतन = ४/३ πr³', 'Sphere: Area = 4πr², Volume = 4/3 πr³')}
                    </text>
                  </g>
                ) : (
                  /* Two Separated Hemispheres */
                  <g>
                    <defs>
                      <radialGradient id="hemiGrad" cx="40%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="#6ee7b7" />
                        <stop offset="70%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#064e3b" />
                      </radialGradient>
                    </defs>

                    {/* Left Hemisphere */}
                    <g transform="translate(-25, 0)">
                      <path d="M 160,50 A 90 90 0 0 0 160,230 Z" fill="url(#hemiGrad)" className="stroke-emerald-800" />
                      {/* Flat circular cut face */}
                      <ellipse cx="160" cy="140" rx="20" ry="90" className="fill-emerald-200 stroke-emerald-700 stroke-2" />
                      <text x="160" y="145" textAnchor="middle" className="text-[11px] font-black fill-emerald-950 -rotate-90">
                        πr²
                      </text>
                    </g>

                    {/* Right Hemisphere */}
                    <g transform="translate(25, 0)">
                      <path d="M 280,50 A 90 90 0 0 1 280,230 Z" fill="url(#hemiGrad)" className="stroke-emerald-800" />
                      {/* Flat circular cut face */}
                      <ellipse cx="280" cy="140" rx="20" ry="90" className="fill-emerald-200 stroke-emerald-700 stroke-2" />
                      <text x="280" y="145" textAnchor="middle" className="text-[11px] font-black fill-emerald-950 rotate-90">
                        πr²
                      </text>
                    </g>

                    <text x="230" y="260" textAnchor="middle" className="text-xs font-black fill-emerald-900 dark:fill-emerald-200">
                      {L('अर्धगोला (Hemisphere): वक्र = २πr², समतल = πr², कुल = ३πr²', 'Hemisphere: CSA = 2πr², Base = πr², TSA = 3πr²')}
                    </text>
                  </g>
                )}
              </svg>
            </div>

            {/* Formulas & Calculations Comparison Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              {/* Sphere Card */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-blue-200 dark:border-blue-800 space-y-2">
                <div className="font-bold text-blue-900 dark:text-blue-300 text-sm border-b pb-1">
                  🌐 {L('गोलाको हिसाब (Sphere)', 'Sphere Calculations')}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{L('सतहको क्षेत्रफल (४πr²):', 'Surface Area (4πr²):')}</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{sphereArea.toFixed(1)} cm²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{L('आयतन (४/३ πr³):', 'Volume (4/3 πr³):')}</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{sphereVolume.toFixed(1)} cm³</span>
                </div>
              </div>

              {/* Hemisphere Card */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-emerald-200 dark:border-emerald-800 space-y-2">
                <div className="font-bold text-emerald-900 dark:text-emerald-300 text-sm border-b pb-1">
                  🌓 {L('अर्धगोलाको हिसाब (Hemisphere)', 'Hemisphere Calculations')}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{L('वक्र सतह CSA (२πr²):', 'Curved SA (2πr²):')}</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{hemiCSA.toFixed(1)} cm²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{L('कुल सतह TSA (३πr²):', 'Total SA (3πr²):')}</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{hemiTSA.toFixed(1)} cm²</span>
                </div>
                <div className="flex justify-between border-t pt-1">
                  <span className="text-gray-500">{L('आयतन (२/३ πr³):', 'Volume (2/3 πr³):')}</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{hemiVolume.toFixed(1)} cm³</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};

export default SphereHemisphere3DLab;
