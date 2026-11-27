import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const LimitInfiniteSeriesLab: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-OPTMATH-G9-U6-02',
    chapter: 6,
    titleNp: 'सीमा तथा अनन्त श्रेणी दृश्य प्रयोगशाला',
    titleEn: 'Limit and Infinite Series Visual Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'sequence' | 'geometric' | 'series'>('sequence');

  // Activity A: Sequence 1/n
  const [seqN, setSeqN] = useState<number>(5);

  // Activity C: Geometric polygon inscribed in circle
  const [sides, setSides] = useState<number>(6);
  const circleRadius = 90;
  // Polygon perimeter = 2 * n * r * sin(pi / n), Area = 0.5 * n * r^2 * sin(2*pi / n)
  const circlePerimeter = 2 * Math.PI * circleRadius;
  const circleArea = Math.PI * circleRadius * circleRadius;

  const polyPerimeter = 2 * sides * circleRadius * Math.sin(Math.PI / sides);
  const polyArea = 0.5 * sides * circleRadius * circleRadius * Math.sin((2 * Math.PI) / sides);

  // Activity D: Infinite Series 1/2 + 1/4 + 1/8 + ... = 1
  const [seriesTerms, setSeriesTerms] = useState<number>(4);
  const partialSums = Array.from({ length: seriesTerms }).map((_, i) => {
    const term = Math.pow(0.5, i + 1);
    const sum = 1 - Math.pow(0.5, i + 1);
    return { term, sum, n: i + 1 };
  });

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      mascotGreeting={L(
        'नमस्ते! अनुक्रमको सीमा (Limit of Sequence 1/n → 0), ज्यामितीय सीमा (Inscribed Polygons → Circle), र अनन्त श्रेणीको योग (Partial Sums → 1) यस प्रयोगशालामा अन्वेषण गर्नुहोस्!',
        'Welcome! Explore limits of sequences, geometric limits of inscribed polygons, and partial sums of infinite series!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b pb-2">
          {[
            { id: 'sequence', labelNp: 'क) अनुक्रमको सीमा (Sequence: 1/n → 0)', labelEn: 'A) Limit of Sequence' },
            { id: 'geometric', labelNp: 'ख) ज्यामितीय सीमा (Geometric Limit)', labelEn: 'B) Geometric Limit' },
            { id: 'series', labelNp: 'ग) अनन्त श्रेणी तथा आंशिक योग (Infinite Series)', labelEn: 'C) Infinite Series' },
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

        {/* TAB A: SEQUENCE */}
        {activeTab === 'sequence' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-3 rounded text-sm text-blue-900">
              <span className="font-bold">{L('अनुक्रमको सीमा (Limit of Sequence):', 'Concept:')}</span>
              <p className="mt-1">
                {L(
                  'पाठ्यपुस्तकको अनुक्रम: 1, 1/2, 1/3, 1/4, ... मा n अनन्ततर्फ बढ्दै जाँदा (n → ∞), अनुक्रमको पद 1/n शून्यको अझ नजिकिँदै जान्छ। यसलाई lim (n→∞) 1/n = 0 लेखिन्छ।',
                  'In the sequence 1, 1/2, 1/3, 1/4, ..., as n grows infinitely large (n → ∞), the term 1/n gets arbitrarily close to 0: lim 1/n = 0.'
                )}
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center text-sm font-bold text-slate-800 mb-1">
                <span>{L('पद संख्या n:', 'Term Number n:')} {fmt(seqN)}</span>
                <span className="text-xs text-indigo-700 font-mono">1/n = {fmt((1 / seqN).toFixed(4))}</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={seqN}
                onChange={(e) => setSeqN(parseInt(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            {/* Sequence Graph SVG */}
            <div className="bg-slate-900 p-4 rounded-xl flex justify-center">
              <svg width="100%" height={160} viewBox="0 0 380 160">
                {/* Axes */}
                <line x1={30} y1={130} x2={360} y2={130} stroke="#475569" strokeWidth={1.5} />
                <line x1={30} y1={20} x2={30} y2={130} stroke="#475569" strokeWidth={1.5} />
                <text x={365} y={135} fill="#94a3b8" fontSize="10">n</text>
                <text x={25} y={15} fill="#94a3b8" fontSize="10">1/n</text>

                {/* 1/n points */}
                {Array.from({ length: seqN }).map((_, i) => {
                  const nVal = i + 1;
                  const x = 35 + (nVal / 30) * 310;
                  const y = 130 - (1 / nVal) * 100;
                  return (
                    <g key={i}>
                      <circle cx={x} cy={y} r={nVal === seqN ? 5 : 3} fill={nVal === seqN ? '#fbbf24' : '#38bdf8'} />
                      {nVal <= 5 && (
                        <text x={x - 6} y={y - 8} fill="#93c5fd" fontSize="9">
                          1/{fmt(nVal)}
                        </text>
                      )}
                    </g>
                  );
                })}
                {/* Asymptote y = 0 */}
                <line x1={30} y1={130} x2={360} y2={130} stroke="#f43f5e" strokeWidth={1} strokeDasharray="3" />
              </svg>
            </div>
          </div>
        )}

        {/* TAB B: GEOMETRIC LIMITS */}
        {activeTab === 'geometric' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="bg-emerald-50 border-l-4 border-emerald-600 p-3 rounded text-sm text-emerald-900">
              <span className="font-bold">{L('ज्यामितीय सीमा (Geometric Limit of Polygons):', 'Geometric Limits:')}</span>
              <p className="mt-1">
                {L(
                  'वृत्तभित्र नियमित बहुभुज खिच्दा, जब भुजाहरूको संख्या (n) अनन्ततर्फ बढ्दै जान्छ, बहुभुजको परिमिति वृत्तको परिधि (2πr) र क्षेत्रफल वृत्तको क्षेत्रफल (πr²) सँग ठ्याक्कै नजिकिन्छ!',
                  'As the number of sides (n) of an inscribed regular polygon increases towards infinity, its perimeter approaches the circle circumference (2πr) and area approaches πr².'
                )}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[3, 4, 5, 6, 8, 12, 24, 36].map((s) => (
                <button
                  key={s}
                  onClick={() => setSides(s)}
                  className={`px-3 py-1 text-xs rounded-lg font-bold border transition-all ${
                    sides === s ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  n = {fmt(s)} {L('भुजा', 'sides')}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              <div className="md:col-span-6 bg-slate-900 rounded-xl p-3 flex justify-center">
                <svg width={240} height={240} viewBox="0 0 240 240">
                  {/* Outer circle */}
                  <circle cx={120} cy={120} r={circleRadius} fill="none" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4" />

                  {/* Inscribed regular polygon */}
                  {(() => {
                    const pts = Array.from({ length: sides }).map((_, i) => {
                      const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
                      return `${120 + circleRadius * Math.cos(angle)},${120 + circleRadius * Math.sin(angle)}`;
                    });
                    return (
                      <polygon
                        points={pts.join(' ')}
                        fill="#38bdf8"
                        fillOpacity="0.25"
                        stroke="#38bdf8"
                        strokeWidth={2}
                      />
                    );
                  })()}
                </svg>
              </div>

              <div className="md:col-span-6 space-y-3 font-mono text-sm">
                <div className="p-3 bg-slate-50 border rounded-xl space-y-1">
                  <div className="text-xs text-slate-500">{L('बहुभुजको परिमिति (Polygon Perimeter):', 'Perimeter:')}</div>
                  <div className="text-indigo-900 font-bold">{fmt(polyPerimeter.toFixed(2))} px</div>
                  <div className="text-xs text-amber-700">Circumference of the circle (limit 2πr) = {fmt(circlePerimeter.toFixed(2))} px</div>
                </div>

                <div className="p-3 bg-slate-50 border rounded-xl space-y-1">
                  <div className="text-xs text-slate-500">{L('बहुभुजको क्षेत्रफल (Polygon Area):', 'Area:')}</div>
                  <div className="text-indigo-900 font-bold">{fmt(polyArea.toFixed(1))} sq.px</div>
                  <div className="text-xs text-amber-700">Area of the circle (limit πr²) = {fmt(circleArea.toFixed(1))} sq.px</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB C: INFINITE SERIES */}
        {activeTab === 'series' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="bg-indigo-50 border-l-4 border-indigo-600 p-3 rounded text-sm text-indigo-900">
              <span className="font-bold">{L('अनन्त श्रेणीको आंशिक योग (Infinite Series Partial Sums):', 'Partial Sums:')}</span>
              <p className="mt-1">
                {L(
                  'पाठ्यपुस्तक उदाहरण: 1/2 + 1/4 + 1/8 + 1/16 + ... श्रेणीका आंशिक योगहरू (Partial Sums Sₙ) निकाल्दै जाँदा S₁ = 0.5, S₂ = 0.75, S₃ = 0.875 हुँदै 1 तर्फ नजिकिन्छ। त्यसैले यस अनन्त श्रेणीको योग = 1 हुन्छ!',
                  'Textbook example: 1/2 + 1/4 + 1/8 + ... has partial sums S1=0.5, S2=0.75, S3=0.875 approaching 1. Hence the sum of this infinite series is 1.'
                )}
              </p>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-700 block mb-1">
                {L('पद संख्या (Number of terms):', 'Number of Terms:')} {fmt(seriesTerms)}
              </span>
              <input
                type="range"
                min="1"
                max="8"
                value={seriesTerms}
                onChange={(e) => setSeriesTerms(parseInt(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            {/* Visual Square Area Halving */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              <div className="md:col-span-6 bg-slate-900 rounded-xl p-3 flex justify-center">
                <svg width={220} height={220} viewBox="0 0 220 220">
                  {/* Unit Square border */}
                  <rect x={10} y={10} width={200} height={200} fill="none" stroke="#64748b" strokeWidth={2} />
                  {/* Term 1: 1/2 (left half) */}
                  <rect x={10} y={10} width={100} height={200} fill="#38bdf8" fillOpacity="0.6" stroke="#fff" strokeWidth={1} />
                  <text x={50} y={115} fill="#fff" fontSize="12" fontWeight="bold">1/2</text>

                  {/* Term 2: 1/4 (top right quarter) */}
                  {seriesTerms >= 2 && (
                    <>
                      <rect x={110} y={10} width={100} height={100} fill="#34d399" fillOpacity="0.6" stroke="#fff" strokeWidth={1} />
                      <text x={150} y={65} fill="#fff" fontSize="11" fontWeight="bold">1/4</text>
                    </>
                  )}

                  {/* Term 3: 1/8 */}
                  {seriesTerms >= 3 && (
                    <>
                      <rect x={110} y={110} width={50} height={100} fill="#fbbf24" fillOpacity="0.6" stroke="#fff" strokeWidth={1} />
                      <text x={125} y={165} fill="#fff" fontSize="10" fontWeight="bold">1/8</text>
                    </>
                  )}

                  {/* Term 4: 1/16 */}
                  {seriesTerms >= 4 && (
                    <rect x={160} y={110} width={50} height={50} fill="#f43f5e" fillOpacity="0.6" stroke="#fff" strokeWidth={1} />
                  )}
                </svg>
              </div>

              <div className="md:col-span-6 space-y-2 font-mono text-xs">
                {partialSums.map((p) => (
                  <div key={p.n} className="p-2 bg-slate-50 border rounded-lg flex justify-between items-center">
                    <span className="font-bold text-slate-700">S_{p.n} = 1 - (1/2)^{p.n}</span>
                    <span className="text-indigo-900 font-bold text-sm">= {fmt(p.sum.toFixed(4))}</span>
                  </div>
                ))}
                <div className="p-2 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-950 font-bold text-center">
                  lim (n→∞) Sₙ = 1
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default LimitInfiniteSeriesLab;
