import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const AngleMeasurementConversionLab: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-OPTMATH-G9-U2-01',
    chapter: 2,
    titleNp: 'कोण मापन तथा रूपान्तरण प्रयोगशाला',
    titleEn: 'Angle Measurement and Conversion Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'dial' | 'conversion' | 'circular_measure' | 'real_life'>('dial');

  // Interactive Angle in Degrees
  const [angleDeg, setAngleDeg] = useState<number>(45);

  // Conversions from angleDeg
  // Sexagesimal: Degrees
  // Centesimal: G = (10/9) * D
  const angleGrade = (angleDeg * 10) / 9;
  // Circular: Radian = D * (pi / 180)
  const angleRadian = (angleDeg * Math.PI) / 180;

  // Arc length state: l = r * theta (theta in rad)
  const [arcRadius, setArcRadius] = useState<number>(10); // cm
  const arcLength = (arcRadius * angleRadian).toFixed(2);

  // Custom Angle Conversion Input
  const [customDeg, setCustomDeg] = useState<string>('54');
  const parsedCustomDeg = parseFloat(customDeg) || 0;
  const customG = (parsedCustomDeg * 10) / 9;
  const customRad = (parsedCustomDeg * Math.PI) / 180;

  // Visual Dial Coordinates
  const cx = 150;
  const cy = 150;
  const radius = 100;
  const endX = cx + radius * Math.cos(-angleRadian);
  const endY = cy + radius * Math.sin(-angleRadian);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      mascotGreeting={L(
        'नमस्ते! कोण मापनका प्रणालीहरू: षाष्टिक पद्धति (Degrees), शतिक पद्धति (Grades) र वृत्तीय माप (Radians: θ = l/r) तथा तिनीहरूबीचको रूपान्तरण सूत्र यस प्रयोगशालामा अन्वेषण गर्नुहोस्!',
        'Welcome! Explore angle measurement systems (Degrees, Grades, Radians), conversion rules D/180 = G/200 = θ/π, and arc length formula l = rθ!'
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Navigation Tabs */}
        <div className="lg:col-span-12 flex flex-wrap gap-1.5 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('dial')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'dial'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. {L('कोण चक्र र मापन (Interactive Dial)', 'Angle Dial')}
          </button>
          <button
            onClick={() => setActiveTab('conversion')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'conversion'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. {L('रूपान्तरण क्याल्कुलेटर (Conversion Calculator)', 'Conversion Calculator')}
          </button>
          <button
            onClick={() => setActiveTab('circular_measure')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'circular_measure'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3. {L('वृत्तीय माप र चाप (Arc Length: l = rθ)', 'Arc Length (l = rθ)')}
          </button>
          <button
            onClick={() => setActiveTab('real_life')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'real_life'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            4. {L('दैनिक जीवनका उदाहरण (Real-Life Motion)', 'Real-Life Motion')}
          </button>
        </div>

        {/* TAB 1: INTERACTIVE ANGLE DIAL */}
        {activeTab === 'dial' && (
          <>
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-800 text-sm">
                {L('कोण समायोजन (Adjust Angle):', 'Angle Controls:')}
              </h4>

              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>{L('डिग्री (Degrees °):', 'Degrees (°):')}</span>
                  <span className="font-mono text-indigo-700 text-base">{fmt(angleDeg)}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="5"
                  value={angleDeg}
                  onChange={e => setAngleDeg(parseInt(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              {/* Standard Angle Shortcuts */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-500">{L('प्रमुख मानक कोणहरू:', 'Standard Special Angles:')}</span>
                <div className="grid grid-cols-4 gap-1.5 text-xs font-mono font-bold">
                  {[30, 45, 60, 90, 120, 180, 270, 360].map(a => (
                    <button
                      key={a}
                      onClick={() => setAngleDeg(a)}
                      className={`py-1.5 rounded-lg border transition-all ${
                        angleDeg === a ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700'
                      }`}
                    >
                      {a}°
                    </button>
                  ))}
                </div>
              </div>

              {/* 3 Scales Comparison */}
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex justify-between items-center">
                  <span className="font-bold text-indigo-950">{L('षाष्टिक पद्धति (Sexagesimal):', 'Sexagesimal:')}</span>
                  <span className="font-mono font-bold text-indigo-700 text-sm">{fmt(angleDeg)}°</span>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex justify-between items-center">
                  <span className="font-bold text-amber-950">{L('शतिक पद्धति (Centesimal):', 'Centesimal:')}</span>
                  <span className="font-mono font-bold text-amber-800 text-sm">{fmt(angleGrade.toFixed(2))}ᵍ</span>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex justify-between items-center">
                  <span className="font-bold text-emerald-950">{L('वृत्तीय माप (Circular Radian):', 'Radian:')}</span>
                  <span className="font-mono font-bold text-emerald-700 text-sm">{fmt(angleRadian.toFixed(3))} ᶜ</span>
                </div>
              </div>
            </div>

            {/* Circular Dial SVG */}
            <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
              <svg viewBox="0 0 300 300" className="w-full max-w-[280px] select-none">
                {/* Full Circle */}
                <circle cx={cx} cy={cy} r={radius} fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />

                {/* Shaded Angle Sector */}
                {angleDeg > 0 && (
                  <path
                    d={`M ${cx} ${cy} L ${cx + radius} ${cy} A ${radius} ${radius} 0 ${
                      angleDeg > 180 ? 1 : 0
                    } 0 ${endX} ${endY} Z`}
                    fill="#6366f1"
                    fillOpacity="0.2"
                  />
                )}

                {/* Base Ray (Initial Side) */}
                <line x1={cx} y1={cy} x2={cx + radius + 15} y2={cy} stroke="#334155" strokeWidth="2.5" />

                {/* Rotating Terminal Ray */}
                <line x1={cx} y1={cy} x2={endX} y2={endY} stroke="#4f46e5" strokeWidth="3" />

                {/* Center dot */}
                <circle cx={cx} cy={cy} r={5} fill="#4f46e5" />

                {/* Labels around circle: 0°, 90°, 180°, 270° */}
                <text x={cx + radius + 20} y={cy + 4} className="text-[10px] font-bold fill-slate-500 font-mono">0° / 0ᵍ</text>
                <text x={cx} y={cy - radius - 8} textAnchor="middle" className="text-[10px] font-bold fill-slate-500 font-mono">90° / 100ᵍ</text>
                <text x={cx - radius - 8} y={cy + 4} textAnchor="end" className="text-[10px] font-bold fill-slate-500 font-mono">180° / 200ᵍ</text>
                <text x={cx} y={cy + radius + 18} textAnchor="middle" className="text-[10px] font-bold fill-slate-500 font-mono">270° / 300ᵍ</text>
              </svg>
            </div>
          </>
        )}

        {/* TAB 2: CONVERSION CALCULATOR */}
        {activeTab === 'conversion' && (
          <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">
              {L('कोण रूपान्तरण सूत्र तथा क्याल्कुलेटर', 'Angle Conversion Formulas and Calculator')}
            </h4>

            {/* Formula Reference Banner */}
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-xs space-y-2">
              <span className="font-bold text-indigo-950 block">{L('पाठ्यपुस्तक सम्बन्ध सूत्र:', 'Textbook Core Relationship:')}</span>
              <div className="p-3 bg-white rounded-lg border border-indigo-100 text-center font-mono font-bold text-sm text-indigo-800">
                \frac&#123;D&#125;&#123;180&#125; = \frac&#123;G&#125;&#123;200&#125; = \frac&#123;θ^c&#125;&#123;π&#125;
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-slate-700 text-[11px]">
                <div>• १ समकोण = ९०° = १००ᵍ = π/२ रेडियन</div>
                <div>• १° = ६०' (मिनेट), १' = ६०'' (सेकेन्ड)</div>
              </div>
            </div>

            {/* Interactive Step-by-Step Converter */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700">{L('डिग्री मान राख्नुहोस् (Enter Degrees):', 'Enter Degrees:')}</span>
                <input
                  type="number"
                  value={customDeg}
                  onChange={e => setCustomDeg(e.target.value)}
                  className="w-24 p-2 border border-slate-300 rounded-lg text-sm font-bold font-mono text-indigo-700"
                />
                <span className="text-sm font-bold">°</span>
              </div>

              {/* Conversion Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-amber-900 block">{L('१. ग्रेडमा रूपान्तरण (To Grades):', 'To Grades (G):')}</span>
                  <div className="font-mono text-slate-700">
                    G = \frac&#123;10&#125;&#123;9&#125; × D = \frac&#123;10&#125;&#123;9&#125; × {fmt(parsedCustomDeg)}
                  </div>
                  <div className="font-mono font-bold text-amber-700 text-sm pt-1">
                    = {fmt(customG.toFixed(2))}ᵍ
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-emerald-900 block">{L('२. रेडियनमा रूपान्तरण (To Radians):', 'To Radians (θᶜ):')}</span>
                  <div className="font-mono text-slate-700">
                    θᶜ = \frac&#123;π&#125;&#123;180&#125; × D = \frac&#123;π × {fmt(parsedCustomDeg)}&#125;&#123;180&#125;
                  </div>
                  <div className="font-mono font-bold text-emerald-700 text-sm pt-1">
                    = {fmt(customRad.toFixed(4))} ᶜ
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CIRCULAR MEASURE & ARC LENGTH */}
        {activeTab === 'circular_measure' && (
          <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">
              {L('वृत्तीय माप तथा चापको लम्बाइ (Circular Measure: l = rθ)', 'Arc Length Formula: l = rθ')}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>{L('अर्धव्यास (Radius, r):', 'Radius (r):')}</span>
                    <span className="font-mono text-indigo-700">{fmt(arcRadius)} cm</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="25"
                    value={arcRadius}
                    onChange={e => setArcRadius(parseInt(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>{L('केन्द्रीय कोण (Central Angle θ):', 'Central Angle (θ):')}</span>
                    <span className="font-mono text-indigo-700">{fmt(angleDeg)}° ({fmt(angleRadian.toFixed(3))} ᶜ)</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="180"
                    step="15"
                    value={angleDeg}
                    onChange={e => setAngleDeg(parseInt(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>

              {/* Arc Calculation Output */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 text-xs text-emerald-950">
                <div className="font-bold text-sm">
                  {L('चापको लम्बाइ हिसाब (Arc Length Calculation):', 'Arc Length Calculation:')}
                </div>
                <div className="font-mono text-sm">
                  l = r × θ (θ अनिवार्य रेडियनमा हुनुपर्छ)
                </div>
                <div className="font-mono text-slate-700 pt-1">
                  l = {fmt(arcRadius)} × {fmt(angleRadian.toFixed(3))} = <span className="text-base font-bold text-emerald-700">{fmt(arcLength)} cm</span>
                </div>
                <div className="text-[11px] text-slate-500 pt-1">
                  {L('जब चापको लम्बाइ अर्धव्याससँग बराबर हुन्छ (l = r), तब बनेको कोण १ रेडियन (१ᶜ ≈ ५७.३°) हुन्छ।', 'When arc length equals radius (l = r), the subtended central angle is exactly 1 radian (1ᶜ ≈ 57.3°).')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: REAL LIFE MOTION */}
        {activeTab === 'real_life' && (
          <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">
              {L('दैनिक जीवनका वृत्तीय उदाहरण (Real-Life Angular Motion)', 'Real-Life Angular Applications')}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="font-bold text-indigo-950 text-sm">🎠 {L('पिङको विस्थापन (Swing Angular Motion)', 'Playground Swing')}</div>
                <p className="text-slate-600 leading-relaxed">
                  {L(
                    'यदि ३ मिटर लामो डोरी भएको पिङ ६०° को कोणमा हल्लिन्छ भने पिङले पार गरेको चापको दुरी:',
                    'If a 3 m long swing swings through an angle of 60°, the arc distance travelled is:'
                  )}
                </p>
                <div className="font-mono bg-white p-2 rounded border border-slate-200 text-indigo-700 font-bold">
                  l = r × θ = ३ × (π/३) = π ≈ ३.१४ मिटर
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="font-bold text-indigo-950 text-sm">🕰️ {L('घडीको सुइ (Clock Hands Motion)', 'Clock Hand Movement')}</div>
                <p className="text-slate-600 leading-relaxed">
                  {L(
                    'घडीको मिनेट सुइले १ घण्टा (६० मिनेट) मा पूरा ३६०° (२π रेडियन) घुम्छ। १ मिनेटमा ६° (π/३० रेडियन) कोण बनाउँछ।',
                    'The minute hand of a clock completes 360° (2π radians) in 60 minutes, turning 6° per minute.'
                  )}
                </p>
                <div className="font-mono bg-white p-2 rounded border border-slate-200 text-indigo-700 font-bold">
                  १५ मिनेटमा = ९०° = १००ᵍ = π/२ रेडियन
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default AngleMeasurementConversionLab;
