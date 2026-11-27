import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const GeometricTransformationLab: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-OPTMATH-G9-U3-03',
    chapter: 3,
    titleNp: 'ज्यामितीय विस्थापन तथा रूपान्तरण प्रयोगशाला',
    titleEn: 'Geometric Transformation Laboratory',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [transformationType, setTransformationType] = useState<'reflection' | 'rotation' | 'enlargement'>('reflection');

  // Original Triangle Vertices: A(1, 1), B(4, 1), C(2, 3)
  const [triA, setTriA] = useState<{ x: number; y: number }>({ x: 1, y: 1 });
  const [triB, setTriB] = useState<{ x: number; y: number }>({ x: 4, y: 1 });
  const [triC, setTriC] = useState<{ x: number; y: number }>({ x: 2, y: 3 });

  // Transformation Settings
  const [reflectionAxis, setReflectionAxis] = useState<'x_axis' | 'y_axis' | 'origin' | 'y_eq_x'>('x_axis');
  const [rotationAngle, setRotationAngle] = useState<'+90' | '-90' | '180'>('+90');
  const [scaleFactorK, setScaleFactorK] = useState<number>(2);

  // Transform a point (x, y)
  const transformPoint = (pt: { x: number; y: number }): { x: number; y: number } => {
    if (transformationType === 'reflection') {
      if (reflectionAxis === 'x_axis') return { x: pt.x, y: -pt.y };
      if (reflectionAxis === 'y_axis') return { x: -pt.x, y: pt.y };
      if (reflectionAxis === 'origin') return { x: -pt.x, y: -pt.y };
      if (reflectionAxis === 'y_eq_x') return { x: pt.y, y: pt.x };
    }
    if (transformationType === 'rotation') {
      if (rotationAngle === '+90') return { x: -pt.y, y: pt.x };
      if (rotationAngle === '-90') return { x: pt.y, y: -pt.x };
      if (rotationAngle === '180') return { x: -pt.x, y: -pt.y };
    }
    if (transformationType === 'enlargement') {
      return { x: pt.x * scaleFactorK, y: pt.y * scaleFactorK };
    }
    return pt;
  };

  const imgA = transformPoint(triA);
  const imgB = transformPoint(triB);
  const imgC = transformPoint(triC);

  // SVG Coordinates mapping
  const svgSize = 360;
  const origin = 180;
  const scale = 20;

  const toSvg = (pt: { x: number; y: number }) => ({
    x: origin + pt.x * scale,
    y: origin - pt.y * scale,
  });

  const svgA = toSvg(triA);
  const svgB = toSvg(triB);
  const svgC = toSvg(triC);

  const svgImgA = toSvg(imgA);
  const svgImgB = toSvg(imgB);
  const svgImgC = toSvg(imgC);

  const isIsometric = transformationType !== 'enlargement';

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      mascotGreeting={L(
        'नमस्ते! ऐच्छिक गणितको ज्यामितीय रूपान्तरण (Transformation: परावर्तन, परिक्रमण, विस्तारण/सङ्कुचन) प्रयोगशालामा स्वागत छ। समदूरीय (Isometric) र गैर-समदूरीय रूपान्तरण प्रत्यक्ष हेर्नुहोस्!',
        'Welcome! Explore geometric transformations (Reflection, Rotation, Enlargement/Reduction) on a coordinate grid!'
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Navigation Tabs */}
        <div className="lg:col-span-12 flex flex-wrap gap-1.5 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setTransformationType('reflection')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              transformationType === 'reflection'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🪞</span>
            <span>{L('१. परावर्तन (Reflection)', '1. Reflection')}</span>
          </button>
          <button
            onClick={() => setTransformationType('rotation')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              transformationType === 'rotation'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🔄</span>
            <span>{L('२. परिक्रमण (Rotation)', '2. Rotation')}</span>
          </button>
          <button
            onClick={() => setTransformationType('enlargement')}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              transformationType === 'enlargement'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🔍</span>
            <span>{L('३. विस्तारण / सङ्कुचन (Enlargement)', '3. Enlargement')}</span>
          </button>
        </div>

        {/* Controls Column */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-800 text-sm">
            {L('रूपान्तरण नियम तथा सर्तहरू:', 'Transformation Settings:')}
          </h4>

          {/* Sub-controls based on transformation */}
          {transformationType === 'reflection' && (
            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-700 block">{L('परावर्तन रेखा (Axis of Reflection):', 'Axis of Reflection:')}</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'x_axis', label: 'X-अक्ष (y = 0)', rule: '(x, −y)' },
                  { key: 'y_axis', label: 'Y-अक्ष (x = 0)', rule: '(−x, y)' },
                  { key: 'origin', label: 'मूलबिन्दु (Origin)', rule: '(−x, −y)' },
                  { key: 'y_eq_x', label: 'रेखा y = x', rule: '(y, x)' },
                ].map(ax => (
                  <button
                    key={ax.key}
                    onClick={() => setReflectionAxis(ax.key as any)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      reflectionAxis === ax.key ? 'bg-indigo-600 text-white border-indigo-600 font-bold' : 'bg-white text-slate-700'
                    }`}
                  >
                    <div>{ax.label}</div>
                    <div className="text-[10px] font-mono opacity-80">{ax.rule}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {transformationType === 'rotation' && (
            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-700 block">{L('मूलबिन्दु वरिपरि परिक्रमण कोण:', 'Rotation about Origin:')}</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: '+90', label: '+९०° (बायाँ)', rule: '(−y, x)' },
                  { key: '-90', label: '−९०° (दायाँ)', rule: '(y, −x)' },
                  { key: '180', label: '१८०° (आधा चक्र)', rule: '(−x, −y)' },
                ].map(r => (
                  <button
                    key={r.key}
                    onClick={() => setRotationAngle(r.key as any)}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      rotationAngle === r.key ? 'bg-indigo-600 text-white border-indigo-600 font-bold' : 'bg-white text-slate-700'
                    }`}
                  >
                    <div>{r.label}</div>
                    <div className="text-[10px] font-mono opacity-80">{r.rule}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {transformationType === 'enlargement' && (
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div className="flex justify-between font-bold text-slate-700">
                <span>{L('नाप गुणक (Scale Factor, k):', 'Scale Factor (k):')}</span>
                <span className="font-mono text-indigo-700 font-bold text-sm">k = {fmt(scaleFactorK)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.5"
                value={scaleFactorK}
                onChange={e => setScaleFactorK(parseFloat(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="text-[11px] text-slate-500 font-mono">
                P(x, y) → P'(kx, ky) = P'({scaleFactorK}x, {scaleFactorK}y)
              </div>
            </div>
          )}

          {/* Coordinates Summary Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-center">
              <thead className="bg-slate-100 text-slate-700 font-bold font-mono">
                <tr>
                  <th className="p-2 border-r">{L('वस्तु (Object)', 'Object')}</th>
                  <th className="p-2">{L('प्रतिबिम्ब (Image)', 'Image')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                <tr>
                  <td className="p-2 border-r font-bold text-indigo-700">A({fmt(triA.x)}, {fmt(triA.y)})</td>
                  <td className="p-2 font-bold text-amber-700">A'({fmt(imgA.x)}, {fmt(imgA.y)})</td>
                </tr>
                <tr>
                  <td className="p-2 border-r font-bold text-indigo-700">B({fmt(triB.x)}, {fmt(triB.y)})</td>
                  <td className="p-2 font-bold text-amber-700">B'({fmt(imgB.x)}, {fmt(imgB.y)})</td>
                </tr>
                <tr>
                  <td className="p-2 border-r font-bold text-indigo-700">C({fmt(triC.x)}, {fmt(triC.y)})</td>
                  <td className="p-2 font-bold text-amber-700">C'({fmt(imgC.x)}, {fmt(imgC.y)})</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Isometric Badge */}
          <div className={`p-3 rounded-xl border text-xs font-bold ${isIsometric ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-blue-50 border-blue-300 text-blue-950'}`}>
            {isIsometric
              ? L('📏 समदूरीय रूपान्तरण (Isometric): आकार र नाप यथावत (अनुरूप त्रिभुज △ABC ≅ △A\'B\'C\')', 'Isometric: Size and shape strictly preserved (Congruent).')
              : L('🔍 गैर-समदूरीय रूपान्तरण (Non-isometric): नाप परिवर्तन हुन्छ (समरूप त्रिभुज △ABC ∼ △A\'B\'C\')', 'Non-isometric: Size changes while angles are preserved (Similar).')}
          </div>
        </div>

        {/* Visual Plane Canvas */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
          <svg viewBox={`0 0 ${svgSize} ${svgSize}`} className="w-full max-w-[340px] bg-slate-50 rounded-xl border border-slate-200 select-none">
            {/* Grid */}
            {Array.from({ length: 19 }).map((_, i) => {
              const p = i * scale;
              return (
                <g key={i}>
                  <line x1={p} y1={0} x2={p} y2={svgSize} stroke="#e2e8f0" strokeDasharray="1 1" />
                  <line x1={0} y1={p} x2={svgSize} y2={p} stroke="#e2e8f0" strokeDasharray="1 1" />
                </g>
              );
            })}

            {/* Axes */}
            <line x1={0} y1={origin} x2={svgSize} y2={origin} stroke="#334155" strokeWidth="2" />
            <line x1={origin} y1={0} x2={origin} y2={svgSize} stroke="#334155" strokeWidth="2" />

            {/* Reflection line y = x if active */}
            {transformationType === 'reflection' && reflectionAxis === 'y_eq_x' && (
              <line x1={0} y1={svgSize} x2={svgSize} y2={0} stroke="#9333ea" strokeWidth="1.5" strokeDasharray="4 4" />
            )}

            {/* Original Triangle ABC (Indigo) */}
            <polygon
              points={`${svgA.x},${svgA.y} ${svgB.x},${svgB.y} ${svgC.x},${svgC.y}`}
              fill="#6366f1"
              fillOpacity="0.25"
              stroke="#4f46e5"
              strokeWidth="2.5"
            />
            <text x={svgA.x - 10} y={svgA.y - 6} className="text-[10px] font-bold fill-indigo-900 font-mono">A</text>
            <text x={svgB.x + 6} y={svgB.y + 12} className="text-[10px] font-bold fill-indigo-900 font-mono">B</text>
            <text x={svgC.x} y={svgC.y - 8} textAnchor="middle" className="text-[10px] font-bold fill-indigo-900 font-mono">C</text>

            {/* Transformed Image Triangle A'B'C' (Amber) */}
            <polygon
              points={`${svgImgA.x},${svgImgA.y} ${svgImgB.x},${svgImgB.y} ${svgImgC.x},${svgImgC.y}`}
              fill="#f59e0b"
              fillOpacity="0.25"
              stroke="#d97706"
              strokeWidth="2.5"
            />
            <text x={svgImgA.x - 12} y={svgImgA.y - 6} className="text-[10px] font-bold fill-amber-900 font-mono">A'</text>
            <text x={svgImgB.x + 6} y={svgImgB.y + 12} className="text-[10px] font-bold fill-amber-900 font-mono">B'</text>
            <text x={svgImgC.x} y={svgImgC.y - 8} textAnchor="middle" className="text-[10px] font-bold fill-amber-900 font-mono">C'</text>
          </svg>

          <div className="mt-2 flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1 text-indigo-700">
              <span className="w-3 h-3 bg-indigo-500 rounded"></span> {L('मूल आकृति △ABC', 'Original △ABC')}
            </span>
            <span className="flex items-center gap-1 text-amber-700">
              <span className="w-3 h-3 bg-amber-500 rounded"></span> {L('प्रतिबिम्ब △A\'B\'C\'', 'Image △A\'B\'C\'')}
            </span>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};

export default GeometricTransformationLab;
