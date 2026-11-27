import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const TrigonometricRatioExplorer: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U20-01',
    chapter: 20,
    titleNp: 'त्रिकोणमितीय अनुपात अन्वेषक',
    titleEn: 'Trigonometric Ratio Explorer',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  // Triangle Configuration
  // Right angle at B (90°). Vertices: A (top), B (bottom-left right-angle), C (bottom-right)
  const [baseLen, setBaseLen] = useState<number>(8); // cm (horizontal, BC)
  const [perpLen, setPerpLen] = useState<number>(6); // cm (vertical, AB)
  const [referenceAngle, setReferenceAngle] = useState<'C' | 'A'>('C');
  const [activeTab, setActiveTab] = useState<'ratios' | 'identities' | 'pythagoras'>('ratios');

  // Calculations
  const hypLen = Math.sqrt(baseLen * baseLen + perpLen * perpLen);
  const angleRadC = Math.atan2(perpLen, baseLen);
  const angleDegC = (angleRadC * 180) / Math.PI;
  const angleDegA = 90 - angleDegC;

  // Active perspective based on reference angle
  // If angle is at C:
  //   Opposite (p) = AB = perpLen
  //   Adjacent (b) = BC = baseLen
  //   Hypotenuse (h) = AC = hypLen
  // If angle is at A:
  //   Opposite (p) = BC = baseLen
  //   Adjacent (b) = AB = perpLen
  //   Hypotenuse (h) = AC = hypLen
  const p = referenceAngle === 'C' ? perpLen : baseLen;
  const b = referenceAngle === 'C' ? baseLen : perpLen;
  const h = hypLen;
  const currentAngleDeg = referenceAngle === 'C' ? angleDegC : angleDegA;

  // 6 Ratios
  const sinVal = p / h;
  const cosVal = b / h;
  const tanVal = p / b;
  const cosecVal = h / p;
  const secVal = h / b;
  const cotVal = b / p;

  // SVG Coordinates
  // Let B be at (80, 240)
  const bx = 90;
  const by = 230;
  const scale = 22; // px per cm
  const cx = bx + baseLen * scale;
  const cy = by;
  const ax = bx;
  const ay = by - perpLen * scale;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      mascotGreeting={L(
        'नमस्ते! समकोणी त्रिभुजमा सम्मुख भुजा (Perpendicular), आसन्न भुजा (Base) र कर्ण (Hypotenuse) को सम्बन्ध तथा ६ वटा त्रिकोणमितीय अनुपातहरू अन्वेषण गर्नुहोस्!',
        'Welcome! Explore Opposite (p), Adjacent (b), and Hypotenuse (h) in a right triangle, and discover all six trigonometric ratios!'
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Interactive Right Triangle */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">
                {L('समकोणी त्रिभुज ABC (∠B = ९०°)', 'Right-Angled Triangle ABC (∠B = 90°)')}
              </h4>
              <p className="text-xs text-slate-500">
                {L('सन्दर्भ कोण परिवर्तन गर्दा सम्मुख र आसन्न भुजाहरू बदलिन्छन्।', 'Changing reference angle swaps Opposite and Adjacent sides.')}
              </p>
            </div>
            {/* Reference Angle Selector */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
              <span className="text-slate-500 px-1">{L('सन्दर्भ कोण (θ):', 'Ref Angle (θ):')}</span>
              <button
                onClick={() => setReferenceAngle('C')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  referenceAngle === 'C' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-600'
                }`}
              >
                ∠C = {fmt(angleDegC.toFixed(1))}°
              </button>
              <button
                onClick={() => setReferenceAngle('A')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  referenceAngle === 'A' ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-600'
                }`}
              >
                ∠A = {fmt(angleDegA.toFixed(1))}°
              </button>
            </div>
          </div>

          {/* Triangle SVG Canvas */}
          <div className="w-full flex justify-center bg-slate-50/70 p-3 rounded-xl border border-slate-100 overflow-x-auto">
            <svg viewBox="0 0 460 270" className="w-full max-w-[440px] select-none">
              <defs>
                <linearGradient id="triGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.1" />
                </linearGradient>
              </defs>

              {/* Triangle fill */}
              <polygon
                points={`${ax},${ay} ${bx},${by} ${cx},${cy}`}
                fill="url(#triGrad)"
                stroke="#4f46e5"
                strokeWidth="2.5"
              />

              {/* Right-angle marker at B */}
              <rect
                x={bx}
                y={by - 16}
                width="16"
                height="16"
                fill="none"
                stroke="#dc2626"
                strokeWidth="2"
              />

              {/* Reference Angle Arc */}
              {referenceAngle === 'C' ? (
                <path
                  d={`M ${cx - 28} ${cy} A 28 28 0 0 0 ${cx - 28 * Math.cos(angleRadC)} ${cy - 28 * Math.sin(angleRadC)}`}
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="2.5"
                />
              ) : (
                <path
                  d={`M ${ax} ${ay + 28} A 28 28 0 0 0 ${ax + 28 * Math.sin(angleRadC)} ${ay + 28 * Math.cos(angleRadC)}`}
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="2.5"
                />
              )}

              {/* Vertices Labels */}
              <circle cx={ax} cy={ay} r={4.5} fill="#4f46e5" />
              <text x={ax - 12} y={ay - 6} className="text-xs font-bold fill-indigo-900 font-mono">
                A
              </text>

              <circle cx={bx} cy={by} r={4.5} fill="#dc2626" />
              <text x={bx - 14} y={by + 16} className="text-xs font-bold fill-red-800 font-mono">
                B (90°)
              </text>

              <circle cx={cx} cy={cy} r={4.5} fill="#4f46e5" />
              <text x={cx + 10} y={cy + 16} className="text-xs font-bold fill-indigo-900 font-mono">
                C
              </text>

              {/* Side Dimensions & Labels */}
              {/* Vertical side AB */}
              <text
                x={ax - 30}
                y={(ay + by) / 2}
                textAnchor="middle"
                className={`text-[11px] font-bold ${referenceAngle === 'C' ? 'fill-rose-700' : 'fill-blue-700'}`}
              >
                {referenceAngle === 'C' ? L('सम्मुख (p)', 'Opp (p)') : L('आसन्न (b)', 'Adj (b)')} = {fmt(perpLen)}
              </text>

              {/* Horizontal side BC */}
              <text
                x={(bx + cx) / 2}
                y={by + 20}
                textAnchor="middle"
                className={`text-[11px] font-bold ${referenceAngle === 'C' ? 'fill-blue-700' : 'fill-rose-700'}`}
              >
                {referenceAngle === 'C' ? L('आसन्न (b)', 'Adj (b)') : L('सम्मुख (p)', 'Opp (p)')} = {fmt(baseLen)}
              </text>

              {/* Hypotenuse AC */}
              <text
                x={(ax + cx) / 2 + 14}
                y={(ay + cy) / 2 - 8}
                textAnchor="middle"
                className="text-[11px] font-bold fill-emerald-800 font-mono"
              >
                {L('कर्ण (h)', 'Hyp (h)')} = {fmt(hypLen.toFixed(1))}
              </text>
            </svg>
          </div>

          {/* Sliders for Base and Perpendicular */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>{L('आधार भुजा (BC):', 'Base (BC):')}</span>
                <span className="font-mono text-indigo-700">{fmt(baseLen)} cm</span>
              </div>
              <input
                type="range"
                min="4"
                max="12"
                step="1"
                value={baseLen}
                onChange={e => setBaseLen(parseInt(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>{L('लम्ब भुजा (AB):', 'Perpendicular (AB):')}</span>
                <span className="font-mono text-indigo-700">{fmt(perpLen)} cm</span>
              </div>
              <input
                type="range"
                min="3"
                max="10"
                step="1"
                value={perpLen}
                onChange={e => setPerpLen(parseInt(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
          </div>
        </div>

        {/* Right Column: All 6 Ratios & Identities */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('ratios')}
              className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'ratios'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {L('६ वटा अनुपात (6 Ratios)', '6 Ratios')}
            </button>
            <button
              onClick={() => setActiveTab('identities')}
              className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'identities'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {L('सर्वसमिका (Identities)', 'Identities')}
            </button>
            <button
              onClick={() => setActiveTab('pythagoras')}
              className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'pythagoras'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {L('पाइथागोरस (h² = p² + b²)', 'Pythagoras')}
            </button>
          </div>

          {/* TAB 1: 6 Trigonometric Ratios */}
          {activeTab === 'ratios' && (
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-slate-800 flex justify-between">
                <span>{L(`कोण θ = ∠${referenceAngle} (${fmt(currentAngleDeg.toFixed(1))}°) का अनुपातहरू:`, `Ratios for θ = ∠${referenceAngle}:`)}</span>
              </div>

              {/* Primary Ratios */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 bg-indigo-50/70 border border-indigo-200 rounded-xl">
                  <span className="font-bold text-indigo-950 block">sin θ</span>
                  <span className="text-[10px] text-slate-500 font-mono">p / h</span>
                  <div className="font-bold text-indigo-700 text-sm font-mono mt-1">
                    {sinVal.toFixed(3)}
                  </div>
                  <div className="text-[10px] text-slate-600 font-mono">{fmt(p)}/{fmt(h.toFixed(1))}</div>
                </div>

                <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl">
                  <span className="font-bold text-blue-950 block">cos θ</span>
                  <span className="text-[10px] text-slate-500 font-mono">b / h</span>
                  <div className="font-bold text-blue-700 text-sm font-mono mt-1">
                    {cosVal.toFixed(3)}
                  </div>
                  <div className="text-[10px] text-slate-600 font-mono">{fmt(b)}/{fmt(h.toFixed(1))}</div>
                </div>

                <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                  <span className="font-bold text-emerald-950 block">tan θ</span>
                  <span className="text-[10px] text-slate-500 font-mono">p / b</span>
                  <div className="font-bold text-emerald-700 text-sm font-mono mt-1">
                    {tanVal.toFixed(3)}
                  </div>
                  <div className="text-[10px] text-slate-600 font-mono">{fmt(p)}/{fmt(b)}</div>
                </div>
              </div>

              {/* Reciprocal Ratios */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-bold text-slate-800 block">cosec θ</span>
                  <span className="text-[10px] text-slate-500 font-mono">h / p (1/sin)</span>
                  <div className="font-bold text-slate-900 text-sm font-mono mt-1">
                    {cosecVal.toFixed(3)}
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-bold text-slate-800 block">sec θ</span>
                  <span className="text-[10px] text-slate-500 font-mono">h / b (1/cos)</span>
                  <div className="font-bold text-slate-900 text-sm font-mono mt-1">
                    {secVal.toFixed(3)}
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-bold text-slate-800 block">cot θ</span>
                  <span className="text-[10px] text-slate-500 font-mono">b / p (1/tan)</span>
                  <div className="font-bold text-slate-900 text-sm font-mono mt-1">
                    {cotVal.toFixed(3)}
                  </div>
                </div>
              </div>

              {/* Definition mnemonic */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-950">
                <strong>💡 {L('स्मरण सूत्र (Mnemonic):', 'Formula Rule:')}</strong>{' '}
                {L(
                  'सम्मुख भुजा (p) = कोणको सिधा अगाडिको भुजा, आसन्न भुजा (b) = कोण जोडिएको भुजा, कर्ण (h) = समकोण (९०°) को सिधा अगाडिको सबैभन्दा लामो भुजा।',
                  'Opposite (p) is opposite the angle, Adjacent (b) is next to it, and Hypotenuse (h) is always opposite the 90° angle.'
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Trigonometric Identities */}
          {activeTab === 'identities' && (
            <div className="space-y-3 text-xs">
              <h5 className="font-bold text-slate-800">
                {L('पाठ्यपुस्तक सर्वसमिकाहरूको प्रमाणीकरण:', 'Textbook Identity Verification:')}
              </h5>

              {/* Identity 1: sin^2 + cos^2 = 1 */}
              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1">
                <div className="font-bold text-indigo-950 flex justify-between">
                  <span>sin² θ + cos² θ = 1</span>
                  <span className="text-emerald-700 font-mono">✓ Verified</span>
                </div>
                <div className="font-mono text-[11px] text-slate-700">
                  ({sinVal.toFixed(3)})² + ({cosVal.toFixed(3)})² = {(sinVal * sinVal).toFixed(3)} + {(cosVal * cosVal).toFixed(3)} ={' '}
                  <span className="font-bold text-indigo-700">{(sinVal * sinVal + cosVal * cosVal).toFixed(3)} ≈ 1</span>
                </div>
              </div>

              {/* Identity 2: sec^2 - tan^2 = 1 */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                <div className="font-bold text-blue-950 flex justify-between">
                  <span>sec² θ − tan² θ = 1</span>
                  <span className="text-emerald-700 font-mono">✓ Verified</span>
                </div>
                <div className="font-mono text-[11px] text-slate-700">
                  ({secVal.toFixed(3)})² − ({tanVal.toFixed(3)})² = {(secVal * secVal).toFixed(3)} − {(tanVal * tanVal).toFixed(3)} ={' '}
                  <span className="font-bold text-blue-700">{(secVal * secVal - tanVal * tanVal).toFixed(3)} ≈ 1</span>
                </div>
              </div>

              {/* Identity 3: cosec^2 - cot^2 = 1 */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <div className="font-bold text-slate-900 flex justify-between">
                  <span>cosec² θ − cot² θ = 1</span>
                  <span className="text-emerald-700 font-mono">✓ Verified</span>
                </div>
                <div className="font-mono text-[11px] text-slate-700">
                  ({cosecVal.toFixed(3)})² − ({cotVal.toFixed(3)})² = {(cosecVal * cosecVal).toFixed(3)} − {(cotVal * cotVal).toFixed(3)} ={' '}
                  <span className="font-bold text-slate-900">{(cosecVal * cosecVal - cotVal * cotVal).toFixed(3)} ≈ 1</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Pythagoras Theorem */}
          {activeTab === 'pythagoras' && (
            <div className="space-y-3 text-xs">
              <h5 className="font-bold text-slate-800">
                {L('पाइथागोरस साध्य (Pythagorean Theorem):', 'Pythagorean Theorem:')}
              </h5>
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                <div className="text-base font-bold text-emerald-950 font-mono">
                  h² = p² + b²
                </div>
                <div className="font-mono text-[11px] text-slate-700 space-y-1">
                  <div>p² = {fmt(p)}² = <span className="font-bold">{fmt(p * p)}</span></div>
                  <div>b² = {fmt(b)}² = <span className="font-bold">{fmt(b * b)}</span></div>
                  <div>p² + b² = {fmt(p * p)} + {fmt(b * b)} = <span className="font-bold text-emerald-800">{fmt(p * p + b * b)}</span></div>
                  <div className="pt-1 border-t border-emerald-200 text-emerald-900">
                    h = \sqrt&#123;{fmt(p * p + b * b)}&#125; = <span className="font-bold">{fmt(hypLen.toFixed(2))} cm</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </SimFrame2D>
  );
};

export default TrigonometricRatioExplorer;
