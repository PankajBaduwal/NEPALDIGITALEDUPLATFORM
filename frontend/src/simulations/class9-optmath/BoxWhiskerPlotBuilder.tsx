import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const BoxWhiskerPlotBuilder: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-OPTMATH-G9-U5-03',
    chapter: 5,
    titleNp: 'बाकस र जुँगा रेखाचित्र निर्माणशाला',
    titleEn: 'Box and Whisker Plot Builder',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'build' | 'compare' | 'quiz'>('build');

  // Activity A & B: Dataset
  const [dataInput, setDataInput] = useState<string>('12, 15, 18, 22, 25, 28, 30, 32, 35, 40, 48');
  const rawVals = dataInput
    .split(',')
    .map((s) => parseFloat(s.trim()))
    .filter((n) => !isNaN(n));
  const sorted = [...rawVals].sort((a, b) => a - b);
  const n = sorted.length;

  const minVal = n > 0 ? sorted[0] : 0;
  const maxVal = n > 0 ? sorted[n - 1] : 0;

  const getQ = (data: number[], k: number) => {
    const len = data.length;
    if (len === 0) return 0;
    const pos = (k * (len + 1)) / 4;
    const base = Math.floor(pos) - 1;
    const frac = pos - Math.floor(pos);
    if (base < 0) return data[0];
    if (base >= len - 1) return data[len - 1];
    return data[base] + frac * (data[base + 1] - data[base]);
  };

  const q1 = getQ(sorted, 1);
  const q2 = getQ(sorted, 2);
  const q3 = getQ(sorted, 3);

  // SVG parameters for single box plot
  const svgW = 440;
  const svgH = 140;
  const axisMin = 0;
  const axisMax = 60;
  const toX = (val: number) => 40 + ((val - axisMin) / (axisMax - axisMin)) * (svgW - 80);

  // Activity C: Comparison Data
  const sectionA = [14, 18, 20, 24, 28, 32, 35, 38, 42]; // Med ~ 28
  const sectionB = [20, 25, 30, 34, 38, 40, 45, 50, 55]; // Med ~ 38

  const calcFiveSummary = (arr: number[]) => {
    const s = [...arr].sort((a, b) => a - b);
    return {
      min: s[0],
      q1: getQ(s, 1),
      med: getQ(s, 2),
      q3: getQ(s, 3),
      max: s[s.length - 1],
    };
  };

  const sumA = calcFiveSummary(sectionA);
  const sumB = calcFiveSummary(sectionB);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      mascotGreeting={L(
        'नमस्ते! तथ्याङ्कशास्त्रको पाँच-संख्यात्मक सारांश (Five-Number Summary: Min, Q₁, Median, Q₃, Max) र बाकस र जुँगा रेखाचित्र (Box and Whisker Plot) यहाँ बनाउनुहोस् र तुलना गर्नुहोस्!',
        'Welcome! Build and compare Box and Whisker Plots with the Five-Number Summary!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b pb-2">
          {[
            { id: 'build', labelNp: 'क) बाकस र जुँगा रेखाचित्र निर्माण (Build)', labelEn: 'A) Build Box Plot' },
            { id: 'compare', labelNp: 'ख) दुई समूहको तुलना (Compare Two Plots)', labelEn: 'B) Compare Two Datasets' },
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

        {/* TAB A: BUILD */}
        {activeTab === 'build' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="bg-indigo-50 border-l-4 border-indigo-600 p-3 rounded text-sm text-indigo-900">
              <span className="font-bold">{L('पाँच-संख्यात्मक सारांश (Five-Number Summary):', 'Five-Number Summary:')}</span>
              <p className="mt-1">
                {L(
                  'बाकस र जुँगा चित्र बनाउन पाँचवटा मानहरू चाहिन्छ: १. सबैभन्दा सानो मान (Min), २. पहिलो चतुर्थांश (Q₁), ३. मध्यिका (Median Q₂), ४. तेस्रो चतुर्थांश (Q₃), र ५. सबैभन्दा ठूलो मान (Max)। बाकसले बीचको ५०% तथ्याङ्क जनाउँछ।',
                  'A box plot represents five values: Min, Q1, Median (Q2), Q3, and Max. The central box represents the middle 50% of the dataset.'
                )}
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {L('तथ्याङ्क प्रविष्ट गर्नुहोस्:', 'Enter Dataset:')}
              </label>
              <input
                type="text"
                value={dataInput}
                onChange={(e) => setDataInput(e.target.value)}
                className="w-full p-2.5 border rounded-xl font-mono text-sm font-bold text-slate-800"
              />
            </div>

            {/* Five Number Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
              <div className="p-2.5 bg-slate-50 border rounded-xl">
                <span className="text-[11px] text-slate-500 font-bold block">{L('न्यूनतम (Min)', 'Min')}</span>
                <span className="font-mono text-base font-bold text-slate-800">{fmt(minVal)}</span>
              </div>
              <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl">
                <span className="text-[11px] text-indigo-700 font-bold block">Q₁ (२५%)</span>
                <span className="font-mono text-base font-bold text-indigo-900">{fmt(q1.toFixed(1))}</span>
              </div>
              <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl">
                <span className="text-[11px] text-amber-800 font-bold block">{L('मध्यिका Q₂ (५०%)', 'Median Q2')}</span>
                <span className="font-mono text-base font-bold text-amber-950">{fmt(q2.toFixed(1))}</span>
              </div>
              <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl">
                <span className="text-[11px] text-indigo-700 font-bold block">Q₃ (७५%)</span>
                <span className="font-mono text-base font-bold text-indigo-900">{fmt(q3.toFixed(1))}</span>
              </div>
              <div className="p-2.5 bg-slate-50 border rounded-xl">
                <span className="text-[11px] text-slate-500 font-bold block">{L('अधिकतम (Max)', 'Max')}</span>
                <span className="font-mono text-base font-bold text-slate-800">{fmt(maxVal)}</span>
              </div>
            </div>

            {/* Interactive SVG Box Plot */}
            <div className="bg-slate-900 p-4 rounded-2xl flex justify-center">
              <svg width="100%" height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
                {/* Number Line */}
                <line x1={40} y1={95} x2={svgW - 40} y2={95} stroke="#64748b" strokeWidth={1.5} />
                {Array.from({ length: 7 }).map((_, i) => {
                  const val = i * 10;
                  const x = toX(val);
                  return (
                    <g key={i}>
                      <line x1={x} y1={92} x2={x} y2={98} stroke="#94a3b8" strokeWidth={1.5} />
                      <text x={x} y={115} fill="#94a3b8" fontSize="10" textAnchor="middle">
                        {fmt(val)}
                      </text>
                    </g>
                  );
                })}

                {/* Lower Whisker: Min to Q1 */}
                <line x1={toX(minVal)} y1={50} x2={toX(q1)} y2={50} stroke="#38bdf8" strokeWidth={2.5} />
                {/* Min end-line */}
                <line x1={toX(minVal)} y1={40} x2={toX(minVal)} y2={60} stroke="#38bdf8" strokeWidth={3} />
                <text x={toX(minVal)} y={32} fill="#38bdf8" fontSize="10" textAnchor="middle" fontWeight="bold">
                  Min ({fmt(minVal)})
                </text>

                {/* Box: Q1 to Q3 */}
                <rect
                  x={toX(q1)}
                  y={30}
                  width={Math.max(toX(q3) - toX(q1), 2)}
                  height={40}
                  fill="#38bdf8"
                  fillOpacity="0.25"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  rx={3}
                />
                <text x={toX(q1)} y={85} fill="#93c5fd" fontSize="10" textAnchor="middle" fontWeight="bold">
                  Q₁ ({fmt(q1.toFixed(1))})
                </text>
                <text x={toX(q3)} y={85} fill="#93c5fd" fontSize="10" textAnchor="middle" fontWeight="bold">
                  Q₃ ({fmt(q3.toFixed(1))})
                </text>

                {/* Median Line inside box */}
                <line x1={toX(q2)} y1={30} x2={toX(q2)} y2={70} stroke="#f59e0b" strokeWidth={3.5} />
                <text x={toX(q2)} y={22} fill="#fbbf24" fontSize="11" textAnchor="middle" fontWeight="bold">
                  Median ({fmt(q2.toFixed(1))})
                </text>

                {/* Upper Whisker: Q3 to Max */}
                <line x1={toX(q3)} y1={50} x2={toX(maxVal)} y2={50} stroke="#38bdf8" strokeWidth={2.5} />
                {/* Max end-line */}
                <line x1={toX(maxVal)} y1={40} x2={toX(maxVal)} y2={60} stroke="#38bdf8" strokeWidth={3} />
                <text x={toX(maxVal)} y={32} fill="#38bdf8" fontSize="10" textAnchor="middle" fontWeight="bold">
                  Max ({fmt(maxVal)})
                </text>
              </svg>
            </div>
          </div>
        )}

        {/* TAB B: COMPARE TWO BOX PLOTS */}
        {activeTab === 'compare' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-semibold text-slate-800 text-base">
              {L('दुई समूहको तुलना (Comparing Section A and Section B):', 'Comparing Two Datasets:')}
            </h3>

            <div className="bg-slate-900 p-4 rounded-2xl flex justify-center">
              <svg width="100%" height={200} viewBox={`0 0 ${svgW} 200`}>
                {/* Number Line */}
                <line x1={40} y1={170} x2={svgW - 40} y2={170} stroke="#64748b" strokeWidth={1.5} />
                {Array.from({ length: 7 }).map((_, i) => {
                  const val = i * 10;
                  const x = toX(val);
                  return (
                    <g key={i}>
                      <line x1={x} y1={167} x2={x} y2={173} stroke="#94a3b8" strokeWidth={1} />
                      <text x={x} y={188} fill="#94a3b8" fontSize="10" textAnchor="middle">
                        {fmt(val)}
                      </text>
                    </g>
                  );
                })}

                {/* SECTION A (Top) */}
                <text x={40} y={30} fill="#38bdf8" fontSize="12" fontWeight="bold">
                  {L('खण्ड A (Section A)', 'Section A')}
                </text>
                <line x1={toX(sumA.min)} y1={50} x2={toX(sumA.q1)} y2={50} stroke="#38bdf8" strokeWidth={2} />
                <line x1={toX(sumA.min)} y1={42} x2={toX(sumA.min)} y2={58} stroke="#38bdf8" strokeWidth={2} />
                <rect x={toX(sumA.q1)} y={35} width={toX(sumA.q3) - toX(sumA.q1)} height={30} fill="#38bdf8" fillOpacity="0.2" stroke="#38bdf8" strokeWidth={2} />
                <line x1={toX(sumA.med)} y1={35} x2={toX(sumA.med)} y2={65} stroke="#fbbf24" strokeWidth={3} />
                <line x1={toX(sumA.q3)} y1={50} x2={toX(sumA.max)} y2={50} stroke="#38bdf8" strokeWidth={2} />
                <line x1={toX(sumA.max)} y1={42} x2={toX(sumA.max)} y2={58} stroke="#38bdf8" strokeWidth={2} />

                {/* SECTION B (Bottom) */}
                <text x={40} y={105} fill="#34d399" fontSize="12" fontWeight="bold">
                  {L('खण्ड B (Section B)', 'Section B')}
                </text>
                <line x1={toX(sumB.min)} y1={125} x2={toX(sumB.q1)} y2={125} stroke="#34d399" strokeWidth={2} />
                <line x1={toX(sumB.min)} y1={117} x2={toX(sumB.min)} y2={133} stroke="#34d399" strokeWidth={2} />
                <rect x={toX(sumB.q1)} y={110} width={toX(sumB.q3) - toX(sumB.q1)} height={30} fill="#34d399" fillOpacity="0.2" stroke="#34d399" strokeWidth={2} />
                <line x1={toX(sumB.med)} y1={110} x2={toX(sumB.med)} y2={140} stroke="#fbbf24" strokeWidth={3} />
                <line x1={toX(sumB.q3)} y1={125} x2={toX(sumB.max)} y2={125} stroke="#34d399" strokeWidth={2} />
                <line x1={toX(sumB.max)} y1={117} x2={toX(sumB.max)} y2={133} stroke="#34d399" strokeWidth={2} />
              </svg>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-slate-50 border rounded-xl space-y-1">
                <span className="font-bold text-slate-800">तुलनात्मक विश्लेषण (Comparison):</span>
                <p className="text-slate-600 text-xs leading-relaxed">
                  {L(
                    'खण्ड B को मध्यिका (Median = 38) खण्ड A (Median = 28) भन्दा धेरै माथि छ। यसले खण्ड B का विद्यार्थीहरूको औसत उपलब्धि राम्रो भएको देखाउँछ।',
                    'Section B has a higher median (38) compared to Section A (28), indicating higher overall performance.'
                  )}
                </p>
              </div>

              <div className="p-3 bg-slate-50 border rounded-xl space-y-1">
                <span className="font-bold text-slate-800">फैलावट (Spread / Dispersion):</span>
                <p className="text-slate-600 text-xs leading-relaxed">
                  {L(
                    'खण्ड B को विस्तार (Max - Min = 35) खण्ड A (Max - Min = 28) भन्दा बढी फैलिएको छ।',
                    'Section B has a wider range (35) than Section A (28), showing greater variability among students.'
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default BoxWhiskerPlotBuilder;
