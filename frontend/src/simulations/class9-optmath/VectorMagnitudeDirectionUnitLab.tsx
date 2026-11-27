import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const VectorMagnitudeDirectionUnitLab: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-OPTMATH-G9-U4-03',
    chapter: 4,
    titleNp: 'भेक्टर परिमाण, दिशा तथा एकाइ भेक्टर प्रयोगशाला',
    titleEn: 'Vector Magnitude, Direction and Unit Vector Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'magnitude' | 'direction' | 'unitvec' | 'challenge'>('magnitude');

  // Vector components
  const [vecX, setVecX] = useState<number>(4);
  const [vecY, setVecY] = useState<number>(3);

  // Computed values
  const mag = Math.sqrt(vecX ** 2 + vecY ** 2);
  // Quadrant adjusted angle with positive X-axis (0 to 360 deg)
  let angleDeg = (Math.atan2(vecY, vecX) * 180) / Math.PI;
  if (angleDeg < 0) angleDeg += 360;

  // Quadrant
  let quadrant = 'I';
  if (vecX < 0 && vecY >= 0) quadrant = 'II';
  else if (vecX < 0 && vecY < 0) quadrant = 'III';
  else if (vecX >= 0 && vecY < 0) quadrant = 'IV';

  // Unit vector components
  const uX = mag !== 0 ? vecX / mag : 0;
  const uY = mag !== 0 ? vecY / mag : 0;

  // SVG parameters
  const svgSize = 340;
  const origin = 170;
  const scale = 22;

  // Activity D: Challenge
  const [cIdx, setCIdx] = useState<number>(0);
  const [userGuessMag, setUserGuessMag] = useState<string>('');
  const [challengeResult, setChallengeResult] = useState<boolean | null>(null);

  const practiceItems = [
    { x: 3, y: 4, mag: 5, uX: '3/5', uY: '4/5' },
    { x: 6, y: 8, mag: 10, uX: '3/5', uY: '4/5' },
    { x: -5, y: 12, mag: 13, uX: '-5/13', uY: '12/13' },
    { x: 8, y: -6, mag: 10, uX: '4/5', uY: '-3/5' },
  ];

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      mascotGreeting={L(
        'नमस्ते! भेक्टरको परिमाण |a⃗| = √(x² + y²), दिशा θ = tan⁻¹(y/x), र एकाइ भेक्टर â = a⃗ / |a⃗| यहाँ गतिशील चित्रबाट अन्वेषण गर्नुहोस्!',
        'Welcome! Explore vector magnitude |a⃗| = √(x² + y²), direction θ, and unit vectors â = a⃗ / |a⃗| visually!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b pb-2">
          {[
            { id: 'magnitude', labelNp: 'क) परिमाण अन्वेषक (Magnitude)', labelEn: 'A) Magnitude' },
            { id: 'direction', labelNp: 'ख) दिशा अन्वेषक (Direction θ)', labelEn: 'B) Direction' },
            { id: 'unitvec', labelNp: 'ग) एकाइ भेक्टर (Unit Vector â)', labelEn: 'C) Unit Vector' },
            { id: 'challenge', labelNp: 'घ) अभ्यास चुनौती (Challenge)', labelEn: 'D) Challenge' },
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

        {/* CONTROLS (for magnitude, direction, unitvec) */}
        {activeTab !== 'challenge' && (
          <div className="bg-slate-50 border p-3 rounded-xl flex flex-wrap gap-4 items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-700">X-कम्पोनेन्ट:</span>
              <input
                type="range"
                min="-6"
                max="6"
                value={vecX}
                onChange={(e) => setVecX(parseInt(e.target.value))}
                className="w-28 accent-amber-600"
              />
              <span className="font-mono font-bold w-6">{fmt(vecX)}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-700">Y-कम्पोनेन्ट:</span>
              <input
                type="range"
                min="-6"
                max="6"
                value={vecY}
                onChange={(e) => setVecY(parseInt(e.target.value))}
                className="w-28 accent-emerald-600"
              />
              <span className="font-mono font-bold w-6">{fmt(vecY)}</span>
            </div>

            <div className="text-xs bg-white px-3 py-1.5 rounded-lg border font-mono">
              a⃗ = ({fmt(vecX)}, {fmt(vecY)}) | {L(`चरण ${quadrant}`, `Quadrant ${quadrant}`)}
            </div>
          </div>
        )}

        {/* TAB A: MAGNITUDE EXPLORER */}
        {activeTab === 'magnitude' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            <div className="md:col-span-6 bg-slate-900 rounded-2xl p-3 flex justify-center">
              <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
                <defs>
                  <marker id="m-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
                  </marker>
                </defs>
                {/* Axes */}
                <line x1={10} y1={origin} x2={svgSize - 10} y2={origin} stroke="#475569" strokeWidth={1.5} />
                <line x1={origin} y1={10} x2={origin} y2={svgSize - 10} stroke="#475569" strokeWidth={1.5} />

                {/* Right Triangle projection */}
                <line x1={origin} y1={origin} x2={origin + vecX * scale} y2={origin} stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="3" />
                <line x1={origin + vecX * scale} y1={origin} x2={origin + vecX * scale} y2={origin - vecY * scale} stroke="#10b981" strokeWidth={2.5} strokeDasharray="3" />

                {/* Right angle marker */}
                {vecX !== 0 && vecY !== 0 && (
                  <rect
                    x={origin + vecX * scale - (vecX > 0 ? 10 : -2)}
                    y={origin - (vecY > 0 ? 10 : -2)}
                    width={8}
                    height={8}
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth={1}
                  />
                )}

                {/* Vector Hypotenuse */}
                <line
                  x1={origin}
                  y1={origin}
                  x2={origin + vecX * scale}
                  y2={origin - vecY * scale}
                  stroke="#38bdf8"
                  strokeWidth={3.5}
                  markerEnd="url(#m-arr)"
                />
                <circle cx={origin + vecX * scale} cy={origin - vecY * scale} r={4} fill="#38bdf8" />

                <text x={origin + (vecX * scale) / 2} y={origin + (vecY >= 0 ? 16 : -8)} fill="#f59e0b" fontSize="11" fontWeight="bold">
                  x = {fmt(vecX)}
                </text>
                <text x={origin + vecX * scale + (vecX >= 0 ? 6 : -36)} y={origin - (vecY * scale) / 2} fill="#10b981" fontSize="11" fontWeight="bold">
                  y = {fmt(vecY)}
                </text>
              </svg>
            </div>

            <div className="md:col-span-6 bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-600 p-3 rounded text-sm text-blue-900">
                <span className="font-bold">{L('भेक्टरको परिमाण (Magnitude):', 'Magnitude Formula:')}</span>
                <p className="mt-1">
                  {L(
                    'पाइथागोरस साध्य अनुसार भेक्टरको परिमाण भनेको X र Y कम्पोनेन्टहरूले बनाएको समकोणी त्रिभुजको कर्ण (Hypotenuse) को लम्बाइ हो।',
                    'By the Pythagorean theorem, the magnitude is the hypotenuse of the right triangle formed by x and y components.'
                  )}
                </p>
              </div>

              <div className="p-4 bg-slate-50 border rounded-xl font-mono space-y-2 text-sm">
                <div className="text-slate-600">|a⃗| = √(x² + y²)</div>
                <div className="text-indigo-900 font-bold">
                  = √(({fmt(vecX)})² + ({fmt(vecY)})²)
                </div>
                <div className="text-indigo-900 font-bold">
                  = √({fmt(vecX ** 2)} + {fmt(vecY ** 2)}) = √{fmt(vecX ** 2 + vecY ** 2)}
                </div>
                <div className="text-emerald-700 text-lg font-bold">
                  ≈ {fmt(mag.toFixed(2))} {L('एकाइ (units)', 'units')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB B: DIRECTION EXPLORER */}
        {activeTab === 'direction' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            <div className="md:col-span-6 bg-slate-900 rounded-2xl p-3 flex justify-center">
              <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
                <defs>
                  <marker id="d-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
                  </marker>
                </defs>
                <line x1={10} y1={origin} x2={svgSize - 10} y2={origin} stroke="#475569" strokeWidth={1.5} />
                <line x1={origin} y1={10} x2={origin} y2={svgSize - 10} stroke="#475569" strokeWidth={1.5} />

                {/* Positive X-axis indicator */}
                <line x1={origin} y1={origin} x2={origin + 60} y2={origin} stroke="#f59e0b" strokeWidth={2} />

                {/* Angle Arc */}
                {(() => {
                  const rArc = 36;
                  const endRad = (-angleDeg * Math.PI) / 180;
                  const ax = origin + rArc * Math.cos(endRad);
                  const ay = origin + rArc * Math.sin(endRad);
                  const largeArc = angleDeg > 180 ? 1 : 0;
                  return (
                    <path
                      d={`M ${origin + rArc} ${origin} A ${rArc} ${rArc} 0 ${largeArc} 0 ${ax} ${ay}`}
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth={2}
                    />
                  );
                })()}

                {/* Vector */}
                <line
                  x1={origin}
                  y1={origin}
                  x2={origin + vecX * scale}
                  y2={origin - vecY * scale}
                  stroke="#38bdf8"
                  strokeWidth={3}
                  markerEnd="url(#d-arr)"
                />
                <text x={origin + 18} y={origin - 12} fill="#fbbf24" fontSize="11" fontWeight="bold">
                  θ = {fmt(angleDeg.toFixed(1))}°
                </text>
              </svg>
            </div>

            <div className="md:col-span-6 bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <div className="bg-amber-50 border-l-4 border-amber-600 p-3 rounded text-sm text-amber-900">
                <span className="font-bold">{L('भेक्टरको दिशा (Direction of Vector):', 'Vector Direction Angle:')}</span>
                <p className="mt-1">
                  {L(
                    'भेक्टरले धनात्मक X-अक्षसँग घडीको सुईको उल्टो दिशामा बनाएको कोण θ नै भेक्टरको दिशा हो: tan θ = y / x।',
                    'The angle θ made by the vector with the positive X-axis in anti-clockwise direction: tan θ = y / x.'
                  )}
                </p>
              </div>

              <div className="p-4 bg-slate-50 border rounded-xl font-mono text-sm space-y-2">
                <div className="text-slate-600">tan θ = y / x = {fmt(vecY)} / {fmt(vecX)}</div>
                <div className="text-indigo-900 font-bold">
                  {vecX !== 0 ? `θ = tan⁻¹(${fmt((vecY / vecX).toFixed(2))})` : 'θ = 90° or 270°'}
                </div>
                <div className="text-emerald-700 text-lg font-bold">
                  {L('दिशा कोण θ:', 'Actual Direction θ:')} {fmt(angleDeg.toFixed(1))}°
                </div>
                <div className="text-xs text-slate-500">
                  {quadrant === 'I' && L('पहिलो चरण: θ = α', 'Quadrant I: θ = α')}
                  {quadrant === 'II' && L('दोस्रो चरण: θ = १८०° - α', 'Quadrant II: θ = 180° - α')}
                  {quadrant === 'III' && L('तेस्रो चरण: θ = १८०° + α', 'Quadrant III: θ = 180° + α')}
                  {quadrant === 'IV' && L('चौथो चरण: θ = ३६०° - α', 'Quadrant IV: θ = 360° - α')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB C: UNIT VECTOR EXPLORER */}
        {activeTab === 'unitvec' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            <div className="md:col-span-6 bg-slate-900 rounded-2xl p-3 flex justify-center">
              <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
                <defs>
                  <marker id="u-big" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
                  </marker>
                  <marker id="u-small" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#fbbf24" />
                  </marker>
                </defs>
                <line x1={10} y1={origin} x2={svgSize - 10} y2={origin} stroke="#475569" strokeWidth={1} />
                <line x1={origin} y1={10} x2={origin} y2={svgSize - 10} stroke="#475569" strokeWidth={1} />

                {/* Unit circle radius = scale * 1.5 for clarity */}
                <circle cx={origin} cy={origin} r={scale * 2} fill="none" stroke="#64748b" strokeDasharray="3" />

                {/* Full Vector a */}
                <line
                  x1={origin}
                  y1={origin}
                  x2={origin + vecX * scale}
                  y2={origin - vecY * scale}
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  markerEnd="url(#u-big)"
                />
                <text x={origin + vecX * scale + 6} y={origin - vecY * scale} fill="#38bdf8" fontSize="11" fontWeight="bold">a⃗</text>

                {/* Unit Vector â (length = scale * 2) */}
                <line
                  x1={origin}
                  y1={origin}
                  x2={origin + uX * (scale * 2)}
                  y2={origin - uY * (scale * 2)}
                  stroke="#fbbf24"
                  strokeWidth={4}
                  markerEnd="url(#u-small)"
                />
                <text x={origin + uX * (scale * 2) + 8} y={origin - uY * (scale * 2) - 8} fill="#fbbf24" fontSize="12" fontWeight="bold">â (एकाइ १)</text>
              </svg>
            </div>

            <div className="md:col-span-6 bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <div className="bg-emerald-50 border-l-4 border-emerald-600 p-3 rounded text-sm text-emerald-900">
                <span className="font-bold">{L('एकाइ भेक्टर (Unit Vector):', 'Unit Vector Definition:')}</span>
                <p className="mt-1">
                  {L(
                    'परिमाण १ भएको भेक्टरलाई एकाइ भेक्टर (Unit Vector) भनिन्छ। a⃗ को दिशामा रहेको एकाइ भेक्टर â = a⃗ / |a⃗| हुन्छ। X-अक्षको एकाइ भेक्टर i⃗ = (1, 0) र Y-अक्षको j⃗ = (0, 1) हुन्छ।',
                    'A vector with magnitude 1 is a unit vector. The unit vector in the direction of a⃗ is â = a⃗ / |a⃗|. Along X-axis: i⃗ = (1, 0), along Y-axis: j⃗ = (0, 1).'
                  )}
                </p>
              </div>

              <div className="p-4 bg-slate-50 border rounded-xl font-mono text-sm space-y-2">
                <div className="text-slate-700">
                  â = a⃗ / |a⃗| = ({fmt(vecX)}, {fmt(vecY)}) / {fmt(mag.toFixed(2))}
                </div>
                <div className="text-indigo-900 font-bold">
                  â = ({fmt(uX.toFixed(3))}, {fmt(uY.toFixed(3))})
                </div>
                <div className="text-amber-800 font-bold">
                  a⃗ = {fmt(vecX)}i⃗ + {fmt(vecY)}j⃗
                </div>
                <div className="text-xs text-slate-500">
                  {L('परिक्षण:', 'Check:')} |â| = √(({fmt(uX.toFixed(3))})² + ({fmt(uY.toFixed(3))})²) = {fmt(Math.sqrt(uX ** 2 + uY ** 2).toFixed(2))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB D: CHALLENGE */}
        {activeTab === 'challenge' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-800 text-base">
              {L('परिमाण तथा एकाइ भेक्टर चुनौती:', 'Vector Challenge:')}
            </h3>

            <div className="p-4 bg-slate-50 border rounded-xl">
              <div className="text-base font-semibold text-slate-800">
                {L(
                  `दिइएको भेक्टर v⃗ = (${toNp(practiceItems[cIdx].x)}, ${toNp(practiceItems[cIdx].y)}) को परिमाण |v⃗| पत्ता लगाउनुहोस्:`,
                  `Find the magnitude |v⃗| of vector v⃗ = (${practiceItems[cIdx].x}, ${practiceItems[cIdx].y}):`
                )}
              </div>

              <div className="flex gap-2 mt-3 items-center">
                <input
                  type="number"
                  placeholder={L('परिमाण लेख्नुहोस्...', 'Enter magnitude...')}
                  value={userGuessMag}
                  onChange={(e) => setUserGuessMag(e.target.value)}
                  className="p-2 border rounded-lg font-mono font-bold w-44"
                />
                <button
                  onClick={() => {
                    const ans = parseFloat(userGuessMag);
                    const isRight = ans === practiceItems[cIdx].mag;
                    setChallengeResult(isRight);
                    if (isRight) kit.good();
                    else kit.oops();
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg text-sm"
                >
                  {L('जाँच गर्नुहोस्', 'Check')}
                </button>
              </div>

              {challengeResult !== null && (
                <div className={`mt-3 p-3 rounded-xl border text-sm font-mono ${challengeResult ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-300 text-rose-900'}`}>
                  {challengeResult ? (
                    <div>
                      <div className="font-bold">{L('सही जवाफ! ✓', 'Correct! ✓')}</div>
                      <div>|v⃗| = √({fmt(practiceItems[cIdx].x)}² + {fmt(practiceItems[cIdx].y)}²) = {fmt(practiceItems[cIdx].mag)}</div>
                      <div className="text-xs text-slate-600 mt-1">
                        एकाइ भेक्टर v̂ = ({fmt(practiceItems[cIdx].uX)}, {fmt(practiceItems[cIdx].uY)})
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="font-bold">{L('पुन: प्रयास गर्नुहोस्!', 'Incorrect. Try again!')}</div>
                      <div>सूत्र: |v⃗| = √(x² + y²) = √({fmt(practiceItems[cIdx].x * practiceItems[cIdx].x)} + {fmt(practiceItems[cIdx].y * practiceItems[cIdx].y)})</div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 pt-3 border-t flex justify-end">
                <button
                  onClick={() => {
                    setUserGuessMag('');
                    setChallengeResult(null);
                    setCIdx((prev) => (prev + 1) % practiceItems.length);
                  }}
                  className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold"
                >
                  {L('अर्को अभ्यास प्रश्न →', 'Next Practice Question →')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default VectorMagnitudeDirectionUnitLab;
