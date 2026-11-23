import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const SpecialAnglesIdentitiesLab: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U20-02',
    chapter: 20,
    titleNp: 'विशिष्ट कोण तथा त्रिकोणमितीय सर्वसमिका प्रयोगशाला',
    titleEn: 'Special Angles and Trigonometric Identities Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'table' | 'tri45' | 'tri3060' | 'limits' | 'complementary' | 'challenge'>('table');

  // Activity D: Table State
  const [hiddenCells, setHiddenCells] = useState<{ [key: string]: boolean }>({});
  const specialAngles = [0, 30, 45, 60, 90];

  const angleValues: Record<number, { sin: string; cos: string; tan: string; cosec: string; sec: string; cot: string }> = {
    0: { sin: '0', cos: '1', tan: '0', cosec: 'Undefined (अपरिभाषित)', sec: '1', cot: 'Undefined (अपरिभाषित)' },
    30: { sin: '1/2', cos: '√3/2', tan: '1/√3', cosec: '2', sec: '2/√3', cot: '√3' },
    45: { sin: '1/√2', cos: '1/√2', tan: '1', cosec: '√2', sec: '√2', cot: '1' },
    60: { sin: '√3/2', cos: '1/2', tan: '√3', cosec: '2/√3', sec: '2', cot: '1/√3' },
    90: { sin: '1', cos: '0', tan: 'Undefined (अपरिभाषित)', cosec: '1', sec: 'Undefined (अपरिभाषित)', cot: '0' },
  };

  const toggleHide = (key: string) => {
    setHiddenCells(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAllTable = (hide: boolean) => {
    const newMap: { [key: string]: boolean } = {};
    if (hide) {
      specialAngles.forEach(ang => {
        ['sin', 'cos', 'tan', 'cosec', 'sec', 'cot'].forEach(fn => {
          newMap[`${ang}-${fn}`] = true;
        });
      });
    }
    setHiddenCells(newMap);
  };

  // Activity E: Complementary Slider
  const [compAngle, setCompAngle] = useState<number>(30);
  const compPartner = 90 - compAngle;

  // Activity F: Challenge
  const [challengeIdx, setChallengeIdx] = useState<number>(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [answered, setAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  const CHALLENGES = [
    {
      expr: 'sin² 45° + cos² 45° = ?',
      opts: ['1/2', '1', '√2', '2'],
      correct: 1,
      expNp: 'सर्वसमिका अनुसार sin² θ + cos² θ = १ हुन्छ। (१/√२)² + (१/√२)² = १/२ + १/२ = १।',
      expEn: 'Identity sin² θ + cos² θ = 1. (1/√2)² + (1/√2)² = 1/2 + 1/2 = 1.',
    },
    {
      expr: 'tan 45° × cot 45° = ?',
      opts: ['0', '1/2', '1', '2'],
      correct: 2,
      expNp: 'tan 45° = १ र cot 45° = १। अतः १ × १ = १। (tan θ × cot θ = १)',
      expEn: 'tan 45° = 1 and cot 45° = 1. Thus 1 × 1 = 1.',
    },
    {
      expr: 'sin 30° / cos 60° = ?',
      opts: ['1/4', '1/2', '1', '√3'],
      correct: 2,
      expNp: 'sin 30° = १/२ र cos 60° = १/२। अतः (१/२) / (१/२) = १।',
      expEn: 'sin 30° = 1/2 and cos 60° = 1/2. Thus (1/2) / (1/2) = 1.',
    },
    {
      expr: '1 − sin² 60° = ?',
      opts: ['sin² 60°', 'cos² 60° (अर्थात् 1/4)', 'tan² 60°', '1'],
      correct: 1,
      expNp: '1 − sin² θ = cos² θ। cos 60° = १/२ भएकाले cos² 60° = (१/२)² = १/४।',
      expEn: '1 − sin² θ = cos² θ. Since cos 60° = 1/2, (1/2)² = 1/4.',
    },
  ];

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      mascotGreeting={L(
        'नमस्ते! विशिष्ट कोणहरू (०°, ३०°, ४५°, ६०°, ९०°) का त्रिकोणमितीय मानहरू, ४५° र ३०°-६०° ज्यामितीय त्रिभुज र पूरक कोण सम्बन्ध अन्वेषण गर्नुहोस्!',
        'Welcome! Master special trigonometric angles (0°, 30°, 45°, 60°, 90°), geometric triangle derivations, and complementary relationships!'
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Navigation Tabs */}
        <div className="lg:col-span-12 flex flex-wrap gap-1.5 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('table')}
            className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'table'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. {L('विशिष्ट मान तालिका (Values Table)', 'Values Table')}
          </button>
          <button
            onClick={() => setActiveTab('tri45')}
            className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'tri45'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. {L('४५° त्रिभुज प्रयोगशाला (45° Lab)', '45° Triangle Lab')}
          </button>
          <button
            onClick={() => setActiveTab('tri3060')}
            className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'tri3060'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3. {L('३०° र ६०° समबाहु त्रिभुज (30°/60°)', '30° & 60° Lab')}
          </button>
          <button
            onClick={() => setActiveTab('complementary')}
            className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'complementary'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            4. {L('पूरक कोण सम्बन्ध (90° − θ)', 'Complementary Angles')}
          </button>
          <button
            onClick={() => setActiveTab('challenge')}
            className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'challenge'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            5. {L('सर्वसमिका चुनौती (Quiz)', 'Identities Quiz')}
          </button>
        </div>

        {/* TAB 1: Values Table with Recall / Hide */}
        {activeTab === 'table' && (
          <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">
                  {L('विशिष्ट कोणहरूको त्रिकोणमितीय मान तालिका', 'Trigonometric Ratios of Special Angles')}
                </h4>
                <p className="text-xs text-slate-500">
                  {L('कुनै पनि कोठामा थिचेर मान लुकाउन वा देखाउन सकिन्छ (कण्ठस्थ पार्ने अभ्यास)।', 'Click any cell to reveal/hide for memory practice.')}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleAllTable(true)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300"
                >
                  👁️‍🗨️ {L('सबै लुकाउनुहोस् (Hide All)', 'Hide All')}
                </button>
                <button
                  onClick={() => toggleAllTable(false)}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200"
                >
                  👀 {L('सबै देखाउनुहोस् (Show All)', 'Show All')}
                </button>
              </div>
            </div>

            {/* Interactive Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-center">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3 border-r border-slate-200 text-left">{L('अनुपात / कोण', 'Ratio / Angle')}</th>
                    {specialAngles.map(a => (
                      <th key={a} className="p-3 border-r border-slate-200 font-mono text-sm">
                        {fmt(a)}°
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {(['sin', 'cos', 'tan', 'cosec', 'sec', 'cot'] as const).map(fn => (
                    <tr key={fn} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-indigo-900 border-r border-slate-200 text-left capitalize">
                        {fn} θ
                      </td>
                      {specialAngles.map(ang => {
                        const cellKey = `${ang}-${fn}`;
                        const isHidden = hiddenCells[cellKey];
                        const val = angleValues[ang][fn];
                        const isUndefined = val.includes('Undefined');

                        return (
                          <td
                            key={ang}
                            onClick={() => toggleHide(cellKey)}
                            className="p-3 border-r border-slate-200 cursor-pointer select-none transition-all"
                          >
                            {isHidden ? (
                              <span className="inline-block px-3 py-1 bg-slate-200 text-slate-400 rounded text-xs font-bold">
                                ?
                              </span>
                            ) : (
                              <span
                                className={`font-bold ${
                                  isUndefined ? 'text-rose-600 text-[11px]' : 'text-slate-800 text-sm'
                                }`}
                              >
                                {val}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: 45° Isosceles Triangle */}
        {activeTab === 'tri45' && (
          <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">
              {L('४५° कोणको त्रिकोणमितीय अनुपात ज्यामितीय उत्पत्ति', 'Geometric Derivation of 45° Trigonometric Ratios')}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
              {/* SVG 45 Triangle */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-center">
                <svg viewBox="0 0 280 240" className="w-full max-w-[280px]">
                  {/* Right isosceles triangle: base 140, height 140 */}
                  <polygon points="50,190 190,190 50,50" fill="#e0e7ff" stroke="#4f46e5" strokeWidth="2.5" />
                  {/* Right angle marker at (50, 190) */}
                  <rect x="50" y="174" width="16" height="16" fill="none" stroke="#dc2626" strokeWidth="2" />

                  {/* Labels */}
                  <text x="40" y="205" className="text-xs font-bold fill-slate-800 font-mono">B (90°)</text>
                  <text x="200" y="200" className="text-xs font-bold fill-slate-800 font-mono">C (45°)</text>
                  <text x="40" y="42" className="text-xs font-bold fill-slate-800 font-mono">A (45°)</text>

                  {/* Dimensions */}
                  <text x="120" y="210" textAnchor="middle" className="text-xs font-bold fill-indigo-700">b = a</text>
                  <text x="30" y="125" textAnchor="middle" className="text-xs font-bold fill-indigo-700">p = a</text>
                  <text x="135" y="110" textAnchor="middle" className="text-xs font-bold fill-emerald-700 font-mono">h = a√2</text>
                </svg>
              </div>

              {/* Derivation Steps */}
              <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-100 space-y-3 text-xs">
                <h5 className="font-bold text-indigo-950">
                  {L('समद्विबाहु समकोणी त्रिभुजमा (Isosceles Right Triangle):', 'Derivation Steps:')}
                </h5>
                <ul className="space-y-1.5 list-disc pl-4 text-slate-700 font-mono text-[11px] leading-relaxed">
                  <li>AB = BC = a (बराबर भुजाहरू)</li>
                  <li>AC² = AB² + BC² = a² + a² = 2a² ⇒ AC = a√2</li>
                  <li className="font-bold text-indigo-900">
                    sin 45° = p / h = a / (a√2) = 1/√2
                  </li>
                  <li className="font-bold text-indigo-900">
                    cos 45° = b / h = a / (a√2) = 1/√2
                  </li>
                  <li className="font-bold text-indigo-900">
                    tan 45° = p / b = a / a = 1
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: 30° and 60° Equilateral Triangle */}
        {activeTab === 'tri3060' && (
          <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">
              {L('३०° र ६०° कोणको ज्यामितीय उत्पत्ति (Equilateral Triangle Altitude)', 'Derivation of 30° and 60° Ratios')}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
              {/* SVG Equilateral Triangle with altitude */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-center">
                <svg viewBox="0 0 280 250" className="w-full max-w-[280px]">
                  {/* Equilateral ABC, side 2a */}
                  <polygon points="140,40 50,210 230,210" fill="#e0e7ff" stroke="#4f46e5" strokeWidth="2" />
                  {/* Altitude AD */}
                  <line x1="140" y1="40" x2="140" y2="210" stroke="#dc2626" strokeWidth="2" strokeDasharray="3 3" />
                  <rect x="140" y="196" width="14" height="14" fill="none" stroke="#dc2626" strokeWidth="1.5" />

                  <text x="140" y="30" textAnchor="middle" className="text-xs font-bold fill-slate-800 font-mono">A (30°|30°)</text>
                  <text x="35" y="215" className="text-xs font-bold fill-slate-800 font-mono">B (60°)</text>
                  <text x="235" y="215" className="text-xs font-bold fill-slate-800 font-mono">C (60°)</text>
                  <text x="145" y="225" className="text-xs font-bold fill-red-700 font-mono">D</text>

                  {/* Dimensions */}
                  <text x="95" y="225" textAnchor="middle" className="text-[11px] font-bold fill-slate-700">BD = a</text>
                  <text x="80" y="120" textAnchor="middle" className="text-[11px] font-bold fill-indigo-700">AB = 2a</text>
                  <text x="165" y="130" textAnchor="middle" className="text-[11px] font-bold fill-red-700 font-mono">AD = a√3</text>
                </svg>
              </div>

              {/* Ratios Table */}
              <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-100 space-y-3 text-xs">
                <h5 className="font-bold text-indigo-950">
                  {L('समकोणी त्रिभुज ABD बाट (From Right Triangle ABD):', 'From Right Triangle ABD:')}
                </h5>
                <div className="space-y-1.5 font-mono text-[11px] text-slate-800">
                  <div className="p-2 bg-white rounded border border-indigo-100">
                    <strong>३०° का लागि (For 30°):</strong> सम्मुख = a, कर्ण = 2a, आसन्न = a√3
                    <div className="text-indigo-700 font-bold mt-0.5">
                      sin 30° = 1/2, cos 30° = √3/2, tan 30° = 1/√3
                    </div>
                  </div>
                  <div className="p-2 bg-white rounded border border-indigo-100">
                    <strong>६०° का लागि (For 60°):</strong> सम्मुख = a√3, कर्ण = 2a, आसन्न = a
                    <div className="text-indigo-700 font-bold mt-0.5">
                      sin 60° = √3/2, cos 60° = 1/2, tan 60° = √3
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Complementary Angles */}
        {activeTab === 'complementary' && (
          <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">
              {L('पूरक कोण सम्बन्ध (Complementary Angles: θ + (90° − θ) = 90°)', 'Complementary Angle Relationships')}
            </h4>

            {/* Slider */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span>{L('कोण θ:', 'Angle θ:')} <span className="font-mono text-indigo-700">{fmt(compAngle)}°</span></span>
                <span>{L('पूरक कोण (90° − θ):', 'Complementary (90° − θ):')} <span className="font-mono text-rose-700">{fmt(compPartner)}°</span></span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                step="15"
                value={compAngle}
                onChange={e => setCompAngle(parseInt(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            {/* Side-by-Side Equalities */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl space-y-1">
                <div className="font-bold text-indigo-950">sin θ = cos (90° − θ)</div>
                <div className="font-mono text-slate-700">
                  sin {fmt(compAngle)}° = cos {fmt(compPartner)}°
                </div>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                <div className="font-bold text-rose-950">cos θ = sin (90° − θ)</div>
                <div className="font-mono text-slate-700">
                  cos {fmt(compAngle)}° = sin {fmt(compPartner)}°
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                <div className="font-bold text-emerald-950">tan θ = cot (90° − θ)</div>
                <div className="font-mono text-slate-700">
                  tan {fmt(compAngle)}° = cot {fmt(compPartner)}°
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Challenge Quiz */}
        {activeTab === 'challenge' && (
          <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                {L(`प्रश्न ${challengeIdx + 1} / ${CHALLENGES.length}`, `Question ${challengeIdx + 1} of ${CHALLENGES.length}`)}
              </span>
              <span className="font-bold text-xs bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
                ⭐ {L(`अङ्क: ${fmt(score)}`, `Score: ${score}`)}
              </span>
            </div>

            <h3 className="font-bold text-slate-800 text-base font-mono">
              {CHALLENGES[challengeIdx].expr}
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {CHALLENGES[challengeIdx].opts.map((opt, i) => {
                let style = 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800';
                if (answered) {
                  if (i === CHALLENGES[challengeIdx].correct) {
                    style = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                  } else if (selectedOpt === i) {
                    style = 'bg-rose-50 border-rose-500 text-rose-900 font-bold';
                  } else {
                    style = 'opacity-50 border-slate-200 text-slate-400';
                  }
                }
                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (answered) return;
                      setSelectedOpt(i);
                      setAnswered(true);
                      if (i === CHALLENGES[challengeIdx].correct) setScore(s => s + 25);
                    }}
                    disabled={answered}
                    className={`p-3 rounded-xl border text-xs font-mono transition-all text-left ${style}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {answered && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <div className="font-bold text-indigo-900">{L('स्पष्टीकरण:', 'Explanation:')}</div>
                <div className="text-slate-700">{L(CHALLENGES[challengeIdx].expNp, CHALLENGES[challengeIdx].expEn)}</div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              {answered && (
                <button
                  onClick={() => {
                    setSelectedOpt(null);
                    setAnswered(false);
                    setChallengeIdx(c => (c + 1) % CHALLENGES.length);
                  }}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  {challengeIdx === CHALLENGES.length - 1
                    ? L('सुरुबाट फेरि गर्नुहोस्', 'Start Over')
                    : L('अर्को प्रश्न →', 'Next Question →')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default SpecialAnglesIdentitiesLab;
