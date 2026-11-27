import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const TrigRatioIdentityExplorer: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-OPTMATH-G9-U2-02',
    chapter: 2,
    titleNp: 'त्रिकोणमितीय अनुपात तथा सर्वसमिका अन्वेषक',
    titleEn: 'Trigonometric Ratio and Identity Explorer',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'ratios' | 'reciprocals' | 'pythagorean' | 'proof_lab'>('ratios');

  // Triangle side sliders
  const [perpP, setPerpP] = useState<number>(3); // opposite
  const [baseB, setBaseB] = useState<number>(4); // adjacent
  const hypH = Math.sqrt(perpP * perpP + baseB * baseB);
  const angleDeg = (Math.atan2(perpP, baseB) * 180) / Math.PI;

  // 6 Ratios
  const sinV = perpP / hypH;
  const cosV = baseB / hypH;
  const tanV = perpP / baseB;
  const cosecV = hypH / perpP;
  const secV = hypH / baseB;
  const cotV = baseB / perpP;

  // Identity Prover State
  const [selectedProofId, setSelectedProofId] = useState<number>(0);
  const [proofStep, setProofStep] = useState<number>(0);

  const PROOFS = [
    {
      title: 'sin² θ + cos² θ = 1',
      stepsNp: [
        'बायाँ पक्ष (LHS) = sin² θ + cos² θ',
        '= (p / h)² + (b / h)² = p² / h² + b² / h²',
        '= (p² + b²) / h²',
        'पाइथागोरस साध्य अनुसार p² + b² = h² राख्दा: = h² / h² = 1 = दायाँ पक्ष (RHS) [प्रमाणित]',
      ],
      stepsEn: [
        'LHS = sin² θ + cos² θ',
        '= (p / h)² + (b / h)² = p² / h² + b² / h²',
        '= (p² + b²) / h²',
        'By Pythagorean theorem p² + b² = h²: = h² / h² = 1 = RHS [Proved]',
      ],
    },
    {
      title: 'sec² θ − tan² θ = 1',
      stepsNp: [
        'बायाँ पक्ष (LHS) = sec² θ − tan² θ',
        '= (h / b)² − (p / b)² = h² / b² − p² / b²',
        '= (h² − p²) / b²',
        'पाइथागोरस साध्य अनुसार h² − p² = b² राख्दा: = b² / b² = 1 = दायाँ पक्ष (RHS) [प्रमाणित]',
      ],
      stepsEn: [
        'LHS = sec² θ − tan² θ',
        '= (h / b)² − (p / b)² = h² / b² − p² / b²',
        '= (h² − p²) / b²',
        'By Pythagoras h² − p² = b²: = b² / b² = 1 = RHS [Proved]',
      ],
    },
    {
      title: 'tan θ = sin θ / cos θ',
      stepsNp: [
        'दायाँ पक्ष (RHS) = sin θ / cos θ',
        '= (p / h) / (b / h)',
        '= (p / h) × (h / b)',
        '= p / b = tan θ = बायाँ पक्ष (LHS) [प्रमाणित]',
      ],
      stepsEn: [
        'RHS = sin θ / cos θ',
        '= (p / h) / (b / h)',
        '= (p / h) × (h / b)',
        '= p / b = tan θ = LHS [Proved]',
      ],
    },
  ];

  const currentProof = PROOFS[selectedProofId];

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      mascotGreeting={L(
        'नमस्ते! ऐच्छिक गणितको त्रिकोणमितीय अनुपात (sin, cos, tan, cosec, sec, cot), पारस्परिक सम्बन्ध र सर्वसमिका प्रमाण प्रयोगशालामा स्वागत छ!',
        'Welcome! Explore trigonometric ratios, reciprocal and quotient relationships, and step-by-step identity proofs!'
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Navigation Tabs */}
        <div className="lg:col-span-12 flex flex-wrap gap-1.5 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('ratios')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'ratios'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. {L('6 pcs अनुपातहरू (6 Ratios)', '6 Ratios')}
          </button>
          <button
            onClick={() => setActiveTab('reciprocals')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'reciprocals'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. {L('पारस्परिक सम्बन्ध (Reciprocals)', 'Reciprocal Relations')}
          </button>
          <button
            onClick={() => setActiveTab('pythagorean')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'pythagorean'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3. {L('पाइथागोरस सर्वसमिका (Pythagorean)', 'Pythagorean Identities')}
          </button>
          <button
            onClick={() => setActiveTab('proof_lab')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'proof_lab'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            4. {L('सर्वसमिका प्रमाण प्रयोगशाला (Proof Lab)', 'Identity Proof Lab')}
          </button>
        </div>

        {/* TAB 1: 6 RATIOS WITH LIVE RIGHT TRIANGLE */}
        {activeTab === 'ratios' && (
          <>
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-800 text-sm">
                {L('समकोणी त्रिभुज भुजा समायोजन:', 'Adjust Triangle Sides:')}
              </h4>

              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>{L('सम्मुख भुजा (Perpendicular, p):', 'Opposite (p):')}</span>
                    <span className="font-mono text-indigo-700 font-bold">{fmt(perpP)} cm</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={perpP}
                    onChange={e => setPerpP(parseInt(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>{L('आसन्न भुजा (Base, b):', 'Adjacent (b):')}</span>
                    <span className="font-mono text-indigo-700 font-bold">{fmt(baseB)} cm</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={baseB}
                    onChange={e => setBaseB(parseInt(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between font-mono font-bold text-emerald-800">
                  <span>Hypotenuse (h):</span>
                  <span>{fmt(hypH.toFixed(2))} cm</span>
                </div>
              </div>

              {/* Ratios Table Display */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <div className="font-bold text-indigo-950">sin θ = p/h</div>
                  <div className="font-mono font-bold text-indigo-700 text-sm mt-0.5">{sinV.toFixed(3)}</div>
                </div>
                <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="font-bold text-blue-950">cos θ = b/h</div>
                  <div className="font-mono font-bold text-blue-700 text-sm mt-0.5">{cosV.toFixed(3)}</div>
                </div>
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="font-bold text-emerald-950">tan θ = p/b</div>
                  <div className="font-mono font-bold text-emerald-700 text-sm mt-0.5">{tanV.toFixed(3)}</div>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="font-bold text-slate-800">cosec θ = h/p</div>
                  <div className="font-mono font-bold text-slate-700 text-sm mt-0.5">{cosecV.toFixed(3)}</div>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="font-bold text-slate-800">sec θ = h/b</div>
                  <div className="font-mono font-bold text-slate-700 text-sm mt-0.5">{secV.toFixed(3)}</div>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="font-bold text-slate-800">cot θ = b/p</div>
                  <div className="font-mono font-bold text-slate-700 text-sm mt-0.5">{cotV.toFixed(3)}</div>
                </div>
              </div>
            </div>

            {/* Triangle SVG Canvas */}
            <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
              <svg viewBox="0 0 340 240" className="w-full max-w-[320px] select-none">
                {/* Scaled coordinates */}
                {(() => {
                  const s = 18;
                  const ox = 50;
                  const oy = 200;
                  const bx = ox + baseB * s;
                  const by = oy;
                  const ax = ox;
                  const ay = oy - perpP * s;

                  return (
                    <g>
                      <polygon points={`${ax},${ay} ${ox},${oy} ${bx},${by}`} fill="#e0e7ff" stroke="#4f46e5" strokeWidth="2.5" />
                      <rect x={ox} y={oy - 16} width="16" height="16" fill="none" stroke="#dc2626" strokeWidth="2" />
                      <text x={ox - 10} y={oy + 16} className="text-xs font-bold fill-slate-700">90°</text>
                      <text x={bx + 8} y={by + 4} className="text-xs font-bold fill-indigo-900 font-mono">θ ({fmt(angleDeg.toFixed(1))}°)</text>

                      {/* Sides */}
                      <text x={ox - 24} y={(ay + oy) / 2} textAnchor="middle" className="text-[11px] font-bold fill-rose-700">p = {fmt(perpP)}</text>
                      <text x={(ox + bx) / 2} y={oy + 20} textAnchor="middle" className="text-[11px] font-bold fill-blue-700">b = {fmt(baseB)}</text>
                      <text x={(ax + bx) / 2 + 12} y={(ay + by) / 2 - 6} textAnchor="middle" className="text-[11px] font-bold fill-emerald-800 font-mono">h = {fmt(hypH.toFixed(2))}</text>
                    </g>
                  );
                })()}
              </svg>
            </div>
          </>
        )}

        {/* TAB 2: RECIPROCALS & QUOTIENT */}
        {activeTab === 'reciprocals' && (
          <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">
              {L('पारस्परिक तथा भागफल सम्बन्ध (Reciprocal and Quotient Relations)', 'Reciprocal and Quotient Relations')}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2">
                <span className="font-bold text-indigo-950 block">sin θ × cosec θ = 1</span>
                <div className="font-mono text-slate-700">
                  {sinV.toFixed(3)} × {cosecV.toFixed(3)} = <span className="font-bold text-indigo-700">{(sinV * cosecV).toFixed(3)} ≈ 1</span>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                <span className="font-bold text-blue-950 block">cos θ × sec θ = 1</span>
                <div className="font-mono text-slate-700">
                  {cosV.toFixed(3)} × {secV.toFixed(3)} = <span className="font-bold text-blue-700">{(cosV * secV).toFixed(3)} ≈ 1</span>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <span className="font-bold text-emerald-950 block">tan θ × cot θ = 1</span>
                <div className="font-mono text-slate-700">
                  {tanV.toFixed(3)} × {cotV.toFixed(3)} = <span className="font-bold text-emerald-700">{(tanV * cotV).toFixed(3)} ≈ 1</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <span className="font-bold text-slate-800 block">{L('भागफल सम्बन्ध (Quotient Relations):', 'Quotient Relations:')}</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                <div className="p-3 bg-white rounded border border-slate-200">
                  tan θ = \frac&#123;sin θ&#125;&#123;cos θ&#125; ⇒ \frac&#123;{sinV.toFixed(3)}&#125;&#123;{cosV.toFixed(3)}&#125; = <span className="font-bold text-indigo-700">{(sinV / cosV).toFixed(3)}</span> = tan θ
                </div>
                <div className="p-3 bg-white rounded border border-slate-200">
                  cot θ = \frac&#123;cos θ&#125;&#123;sin θ&#125; ⇒ \frac&#123;{cosV.toFixed(3)}&#125;&#123;{sinV.toFixed(3)}&#125; = <span className="font-bold text-indigo-700">{(cosV / sinV).toFixed(3)}</span> = cot θ
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PYTHAGOREAN IDENTITIES */}
        {activeTab === 'pythagorean' && (
          <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">
              {L('पाइथागोरस सर्वसमिकाहरू (Pythagorean Trigonometric Identities)', 'Pythagorean Identities')}
            </h4>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex justify-between items-center">
                <div>
                  <span className="font-bold text-indigo-950 block text-sm">sin² θ + cos² θ = 1</span>
                  <span className="font-mono text-slate-600 mt-1 block">
                    ({sinV.toFixed(3)})² + ({cosV.toFixed(3)})² = {(sinV * sinV).toFixed(3)} + {(cosV * cosV).toFixed(3)}
                  </span>
                </div>
                <span className="font-mono text-base font-bold text-indigo-700">
                  = {(sinV * sinV + cosV * cosV).toFixed(3)} ≈ 1.000
                </span>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex justify-between items-center">
                <div>
                  <span className="font-bold text-blue-950 block text-sm">sec² θ − tan² θ = 1</span>
                  <span className="font-mono text-slate-600 mt-1 block">
                    ({secV.toFixed(3)})² − ({tanV.toFixed(3)})² = {(secV * secV).toFixed(3)} − {(tanV * tanV).toFixed(3)}
                  </span>
                </div>
                <span className="font-mono text-base font-bold text-blue-700">
                  = {(secV * secV - tanV * tanV).toFixed(3)} ≈ 1.000
                </span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900 block text-sm">cosec² θ − cot² θ = 1</span>
                  <span className="font-mono text-slate-600 mt-1 block">
                    ({cosecV.toFixed(3)})² − ({cotV.toFixed(3)})² = {(cosecV * cosecV).toFixed(3)} − {(cotV * cotV).toFixed(3)}
                  </span>
                </div>
                <span className="font-mono text-base font-bold text-slate-800">
                  = {(cosecV * cosecV - cotV * cotV).toFixed(3)} ≈ 1.000
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: STEP-BY-STEP PROOF LAB */}
        {activeTab === 'proof_lab' && (
          <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">
                  {L('चरणबद्ध सर्वसमिका प्रमाण प्रयोगशाला', 'Step-by-Step Identity Proof Workspace')}
                </h4>
                <p className="text-xs text-slate-500">
                  {L('प्रमाण गर्नुपर्ने सर्वसमिका छनोट गरी प्रत्येक चरण क्रमशः हेर्नुहोस्।', 'Select an identity to view step-by-step mathematical proof.')}
                </p>
              </div>

              {/* Selector */}
              <div className="flex gap-2">
                {PROOFS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setSelectedProofId(idx); setProofStep(0); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                      selectedProofId === idx ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Proof Steps Container */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3 font-mono text-xs">
              <h5 className="font-bold text-indigo-900 text-sm">
                Proof ( {currentProof.title}):
              </h5>
              <div className="space-y-2">
                {(isNe ? currentProof.stepsNp : currentProof.stepsEn).slice(0, proofStep + 1).map((step, i) => (
                  <div key={i} className="p-2.5 bg-white rounded-lg border border-indigo-100 text-slate-800 leading-relaxed">
                    {step}
                  </div>
                ))}
              </div>

              {proofStep < currentProof.stepsNp.length - 1 && (
                <button
                  onClick={() => setProofStep(s => s + 1)}
                  className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  {L('अर्को चरण देखाउनुहोस् →', 'Reveal Next Step →')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default TrigRatioIdentityExplorer;
