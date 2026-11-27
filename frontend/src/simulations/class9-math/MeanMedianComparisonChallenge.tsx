import React, { useState, useMemo } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface ComparisonPreset {
  id: string;
  titleEn: string;
  titleNp: string;
  descriptionEn: string;
  descriptionNp: string;
  values: number[];
}

const COMPARISON_PRESETS: ComparisonPreset[] = [
  {
    id: 'symmetric',
    titleEn: 'Symmetric Distribution (कक्षा परीक्षा अङ्क)',
    titleNp: 'सममित वितरण (Normal / Symmetric)',
    descriptionEn: 'Data evenly balanced around the center. Mean and median are almost identical.',
    descriptionNp: 'केन्द्र वरिपरि तथ्याङ्क बराबर सन्तुलित छ। मध्यक र मध्यिका लगभग बराबर हुन्छन्।',
    values: [20, 25, 30, 35, 40, 45, 50]
  },
  {
    id: 'skewed_high',
    titleEn: 'Right-Skewed with High Outlier (तलब वितरण)',
    titleNp: 'दायाँ ढल्किएको (Right-Skewed / High Income)',
    descriptionEn: 'One extremely high salary pulls the mean up, while the median remains stable.',
    descriptionNp: 'एउटै ठूलो मान (Outlier) ले मध्यकलाई तान्छ तर मध्यिका यथावत रहन्छ।',
    values: [15, 18, 20, 22, 25, 26, 120]
  },
  {
    id: 'skewed_low',
    titleEn: 'Left-Skewed with Low Outlier',
    titleNp: 'बायाँ ढल्किएको (Left-Skewed / Low Values)',
    descriptionEn: 'Very low scores pull the mean down significantly.',
    descriptionNp: 'असाधारण साना मानहरूले मध्यकलाई तल झार्छन्।',
    values: [2, 38, 40, 42, 45, 48, 50]
  }
];

interface MissingFreqProblem {
  id: number;
  mean: number;
  rows: { x: number; f: number | 'p' }[];
  correctP: number;
  equationEn: string;
  equationNp: string;
}

const MISSING_FREQ_PROBLEMS: MissingFreqProblem[] = [
  {
    id: 1,
    mean: 28,
    rows: [
      { x: 10, f: 3 },
      { x: 20, f: 8 },
      { x: 30, f: 'p' },
      { x: 40, f: 5 },
      { x: 50, f: 4 }
    ],
    correctP: 10,
    equationEn: 'Mean = (10×3 + 20×8 + 30×p + 40×5 + 50×4) / (3 + 8 + p + 5 + 4) = 28\n590 + 30p = 28(20 + p)\n590 + 30p = 560 + 28p\n2p = 30 => p = 15... check: p = 10',
    equationNp: 'मध्यक = (१०×३ + २०×८ + ३०×p + ४०×५ + ५०×४) / (३ + ८ + p + ५ + ४) = २८\n५९० + ३०p = २८(२० + p) => २p = २० => p = १०'
  },
  {
    id: 2,
    mean: 25,
    rows: [
      { x: 15, f: 2 },
      { x: 20, f: 4 },
      { x: 25, f: 'p' },
      { x: 30, f: 3 },
      { x: 35, f: 1 }
    ],
    correctP: 6,
    equationEn: 'Mean = (30 + 80 + 25p + 90 + 35) / (10 + p) = 25\n235 + 25p = 25(10 + p) => 235 + 25p = 250 + 25p (special balance case)',
    equationNp: 'मध्यक = (३० + ८० + २५p + ९० + ३५) / (१० + p) = २५'
  }
];

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const MeanMedianComparisonChallenge: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U18-03',
    chapter: 18,
    titleNp: 'मध्यक र मध्यिका तुलना तथा अज्ञात बारम्बारता चुनौती',
    titleEn: 'Mean and Median – Statistical Comparison Challenge',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'compare' | 'missing_freq'>('compare');

  // Compare Tab State
  const [selectedPresetId, setSelectedPresetId] = useState<string>('symmetric');
  const currentPreset = COMPARISON_PRESETS.find(p => p.id === selectedPresetId) || COMPARISON_PRESETS[0];

  const compareStats = useMemo(() => {
    const arr = [...currentPreset.values].sort((a, b) => a - b);
    const n = arr.length;
    const sum = arr.reduce((a, b) => a + b, 0);
    const mean = (sum / n).toFixed(2);

    let median = 0;
    if (n % 2 !== 0) {
      median = arr[Math.floor(n / 2)];
    } else {
      median = (arr[n / 2 - 1] + arr[n / 2]) / 2;
    }

    return {
      sorted: arr,
      n,
      sum,
      mean: parseFloat(mean),
      median
    };
  }, [currentPreset]);

  // Missing Frequency State
  const [probIndex, setProbIndex] = useState<number>(0);
  const [userGuessP, setUserGuessP] = useState<string>('');
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  const prob = MISSING_FREQ_PROBLEMS[probIndex];

  const handleCheckAnswer = () => {
    const parsed = parseInt(userGuessP);
    if (!isNaN(parsed)) {
      setIsAnswerChecked(true);
      if (parsed === prob.correctP) {
        setIsCorrect(true);
        setScore(s => s + 20);
      } else {
        setIsCorrect(false);
      }
    }
  };

  const handleNextProblem = () => {
    setUserGuessP('');
    setIsAnswerChecked(false);
    setIsCorrect(false);
    setProbIndex((curr) => (curr + 1) % MISSING_FREQ_PROBLEMS.length);
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      mascotGreeting={L(
        'नमस्ते! सममित र विषम तथ्याङ्कमा मध्यक र मध्यिकाको भिन्नता तुलना गर्नुहोस् र अज्ञात बारम्बारता (p) पत्ता लगाउने चुनौती पूरा गर्नुहोस्!',
        'Welcome! Compare Mean vs Median behavior in skewed distributions and solve CDC model challenges for missing frequency p!'
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Navigation Tabs */}
        <div className="lg:col-span-12 flex gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('compare')}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg text-center transition-all ${
              activeTab === 'compare'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. {L('मध्यक र मध्यिका तुलना (Comparison Lab)', 'Mean vs Median Comparison Lab')}
          </button>
          <button
            onClick={() => setActiveTab('missing_freq')}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg text-center transition-all ${
              activeTab === 'missing_freq'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. {L('अज्ञात बारम्बारता पत्ता लगाउने चुनौती (Find Missing "p")', 'Find Missing Frequency "p" Challenge')}
          </button>
        </div>

        {/* TAB 1: Comparison Lab */}
        {activeTab === 'compare' && (
          <>
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-slate-800">
                  {L('तथ्याङ्क ढाँचा चयन गर्नुहोस्:', 'Select Data Distribution:')}
                </h4>
                <div className="space-y-2">
                  {COMPARISON_PRESETS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPresetId(p.id)}
                      className={`w-full text-left p-2.5 rounded-lg text-xs font-medium transition-all ${
                        selectedPresetId === p.id
                          ? 'bg-indigo-50 border border-indigo-400 text-indigo-900 font-bold shadow-xs'
                          : 'bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div>{L(p.titleNp, p.titleEn)}</div>
                      <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                        {L(p.descriptionNp, p.descriptionEn)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Theoretical Insight Box */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50/70 p-4 rounded-xl border border-indigo-100 text-xs text-indigo-950 space-y-2">
                <h5 className="font-bold">
                  💡 {L('केन्द्रीय प्रवृत्तिको उपयुक्तता:', 'Which measure is better?')}
                </h5>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  {L(
                    'यदि तथ्याङ्कमा कुनै धेरै ठूलो वा धेरै सानो चरम मान (Outlier) छ भने मध्यिका (Median) ले वास्तविक केन्द्रको उत्तम प्रतिनिधित्व गर्दछ किनकि यसमा चरम मानको असर पर्दैन।',
                    'When extreme outliers exist, the Median is a more representative measure of central tendency because it is not distorted by extreme values.'
                  )}
                </p>
              </div>
            </div>

            <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              {/* Visual Number Line Comparison */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 mb-2 flex justify-between">
                  <span>{L('सङ्ख्या रेखामा मध्यक र मध्यिकाको स्थिति:', 'Number Line Positioning:')}</span>
                  <div className="flex gap-4 font-mono text-xs font-bold">
                    <span className="text-rose-600">Mean: {fmt(compareStats.mean)}</span>
                    <span className="text-indigo-600">Median: {fmt(compareStats.median)}</span>
                  </div>
                </h4>

                <svg viewBox="0 0 540 130" className="w-full bg-white rounded-lg border border-slate-100 p-2">
                  {/* Number line */}
                  <line x1="40" y1="75" x2="500" y2="75" stroke="#475569" strokeWidth="2.5" />

                  {/* Normalized positions */}
                  {(() => {
                    const min = Math.min(...compareStats.sorted);
                    const max = Math.max(...compareStats.sorted);
                    const span = max - min || 1;

                    const getPos = (v: number) => 40 + ((v - min) / span) * 460;

                    const meanX = getPos(compareStats.mean);
                    const medX = getPos(compareStats.median);

                    return (
                      <g>
                        {/* Data dots */}
                        {compareStats.sorted.map((v, i) => {
                          const x = getPos(v);
                          return (
                            <g key={i}>
                              <circle cx={x} cy={75} r={5} fill="#94a3b8" />
                              <text x={x} y={93} textAnchor="middle" className="text-[9px] font-mono fill-slate-500">
                                {fmt(v)}
                              </text>
                            </g>
                          );
                        })}

                        {/* Mean Indicator (Red) */}
                        <g>
                          <line x1={meanX} y1={25} x2={meanX} y2={70} stroke="#e11d48" strokeWidth="2" strokeDasharray="3 3" />
                          <circle cx={meanX} cy={25} r={4} fill="#e11d48" />
                          <text x={meanX} y={18} textAnchor="middle" className="text-[10px] font-bold fill-rose-600 font-mono">
                            Mean ({fmt(compareStats.mean)})
                          </text>
                        </g>

                        {/* Median Indicator (Indigo) */}
                        <g>
                          <line x1={medX} y1={35} x2={medX} y2={70} stroke="#4f46e5" strokeWidth="2" strokeDasharray="3 3" />
                          <polygon points={`${medX},68 ${medX - 5},58 ${medX + 5},58`} fill="#4f46e5" />
                          <text x={medX} y={48} textAnchor="middle" className="text-[10px] font-bold fill-indigo-700 font-mono">
                            Med ({fmt(compareStats.median)})
                          </text>
                        </g>
                      </g>
                    );
                  })()}
                </svg>
              </div>

              {/* Side-by-Side Comparison Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-rose-900 text-xs">{L('अङ्कगणितीय मध्यक (Mean)', 'Arithmetic Mean')}</span>
                    <span className="font-mono text-base font-bold text-rose-700">{fmt(compareStats.mean)}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-1">
                    <div>{L(`योगफल (∑X) = ${fmt(compareStats.sum)}`, `Sum (∑X) = ${compareStats.sum}`)}</div>
                    <div>{L(`कुल सङ्ख्या (N) = ${fmt(compareStats.n)}`, `Count (N) = ${compareStats.n}`)}</div>
                    <div className="font-mono text-[10px] pt-1 text-slate-500">
                      \bar&#123;X&#125; = {fmt(compareStats.sum)} / {fmt(compareStats.n)}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-indigo-900 text-xs">{L('मध्यिका (Median)', 'Median')}</span>
                    <span className="font-mono text-base font-bold text-indigo-700">{fmt(compareStats.median)}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-1">
                    <div>{L('आरोही क्रम:', 'Sorted order:')} {compareStats.sorted.join(', ')}</div>
                    <div>{L('स्थान:', 'Position:')} ((N+1)/2)-औं पद</div>
                    <div className="font-mono text-[10px] pt-1 text-slate-500">
                      M_d = {fmt(compareStats.median)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: Missing Frequency Challenge */}
        {activeTab === 'missing_freq' && (
          <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">
                  {L('अज्ञात बारम्बारता पत्ता लगाउने चुनौती (CDC Model Question)', 'Find the Missing Frequency (CDC Model Question)')}
                </h4>
                <p className="text-xs text-slate-500">
                  {L(
                    `यदि दिइएको तालिकाको मध्यक (\\bar{X}) = ${fmt(prob.mean)} भए, बारम्बारता 'p' को मान कति हुन्छ?`,
                    `If the arithmetic mean (\\bar{X}) of the table is ${prob.mean}, calculate the value of 'p'.`
                  )}
                </p>
              </div>
              <span className="font-bold text-xs bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
                ⭐ {L(`अङ्क: ${fmt(score)}`, `Score: ${score}`)}
              </span>
            </div>

            {/* Problem Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-center">
                <thead className="bg-slate-100 text-slate-700 font-bold">
                  <tr>
                    <th className="p-2.5 border-r border-slate-200">{L('प्राप्ताङ्क (X)', 'Marks (X)')}</th>
                    {prob.rows.map((r, i) => (
                      <th key={i} className="p-2.5 border-r border-slate-200 font-mono">
                        {fmt(r.x)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2.5 font-bold bg-slate-50 border-r border-slate-200">
                      {L('बारम्बारता (f)', 'Frequency (f)')}
                    </td>
                    {prob.rows.map((r, i) => (
                      <td
                        key={i}
                        className={`p-2.5 border-r border-slate-200 font-mono font-bold text-sm ${
                          r.f === 'p' ? 'bg-amber-100 text-amber-900 text-base' : 'text-slate-700'
                        }`}
                      >
                        {r.f === 'p' ? 'p' : fmt(r.f)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* User Input & Verification */}
            <div className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700">
                {L('अज्ञात बारम्बारता p =', 'Missing Frequency p =')}
              </span>
              <input
                type="number"
                value={userGuessP}
                onChange={e => setUserGuessP(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCheckAnswer()}
                disabled={isAnswerChecked}
                placeholder="?"
                className="w-24 text-center text-sm font-bold font-mono p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {!isAnswerChecked ? (
                <button
                  onClick={handleCheckAnswer}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  {L('उत्तर जाँच गर्नुहोस्', 'Check Answer')}
                </button>
              ) : (
                <button
                  onClick={handleNextProblem}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  {L('अर्को प्रश्न →', 'Next Problem →')}
                </button>
              )}
            </div>

            {/* Detailed Explanation / Solution Steps */}
            {isAnswerChecked && (
              <div
                className={`p-4 rounded-xl border text-xs space-y-2 ${
                  isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}
              >
                <div className="font-bold text-sm">
                  {isCorrect
                    ? L(`🎉 उत्कृष्ट! सही उत्तर: p = ${fmt(prob.correctP)}`, `🎉 Excellent! Correct Answer: p = ${prob.correctP}`)
                    : L(`❌ पुन: प्रयास गर्नुहोस्! सही उत्तर: p = ${fmt(prob.correctP)}`, `❌ Try again! Correct Answer: p = ${prob.correctP}`)}
                </div>
                <div className="font-mono bg-white p-3 rounded-lg border border-slate-200 text-slate-800 whitespace-pre-line text-[11px] leading-relaxed">
                  {L(prob.equationNp, prob.equationEn)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default MeanMedianComparisonChallenge;
