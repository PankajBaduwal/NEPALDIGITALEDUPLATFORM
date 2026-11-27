import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Copy, Move, Layers, CheckCircle, RefreshCw } from 'lucide-react';

type ActivityTab = 'overlay' | 'angles' | 'sides' | 'notation' | 'test_pairs';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'सर्वाङ्गसम त्रिभुजहरू (Congruent Triangles) को मुख्य विशेषता कुन हो?',
    en: 'What is the primary characteristic of congruent triangles?',
    options: [
      { key: 'A', label: 'उही आकार (Shape) र उही नाप (Size) हुनु' },
      { key: 'B', label: 'क्षेत्रफल मात्र बराबर हुनु' },
      { key: 'C', label: 'कोण मात्र बराबर हुनु' },
      { key: 'D', label: 'समानान्तर हुनु' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि △ABC ≅ △PQR भए, भुजा AB को संगत भुजा (Corresponding side) कुन हुन्छ?',
    en: 'If △ABC ≅ △PQR, which side corresponds to AB?',
    options: [
      { key: 'A', label: 'भुजा PQ' },
      { key: 'B', label: 'भुजा QR' },
      { key: 'C', label: 'भुजा PR' },
      { key: 'D', label: 'कुनै पनि' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि △ABC ≅ △DEF भए, ∠B को संगत कोण (Corresponding angle) कुन हो?',
    en: 'If △ABC ≅ △DEF, which angle corresponds to ∠B?',
    options: [
      { key: 'A', label: '∠D' },
      { key: 'B', label: '∠E' },
      { key: 'C', label: '∠F' },
      { key: 'D', label: '∠A' },
    ],
    answer: 'B',
  }
];

export const CongruentTriangleDiscoveryLab: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U15-01',
    chapter: 15,
    titleNp: 'सर्वाङ्गसम त्रिभुज खोजी प्रयोगशाला',
    titleEn: 'Congruent Triangle Discovery Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<ActivityTab>('overlay');

  // Triangle 2 interactive translation and rotation for Overlay Activity
  const [posX, setPosX] = useState<number>(240);
  const [posY, setPosY] = useState<number>(40);
  const [rotation, setRotation] = useState<number>(0);
  const [highlightPart, setHighlightPart] = useState<'A' | 'B' | 'C' | 'AB' | 'BC' | 'CA' | 'none'>('none');

  // Target matching position: posX = 60, posY = 40, rotation = 0
  const isOverlapped = Math.abs(posX - 60) < 15 && Math.abs(posY - 40) < 15 && Math.abs(rotation) < 10;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! आकार (Shape) र नाप (Size) दुवै हुबहु बराबर हुने सर्वाङ्गसम त्रिभुजहरूको खोजी गरौं!',
        'Hello! Discover congruent triangles that have exactly the same shape and size!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-800/80 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('overlay')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'overlay' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            {L('१. खप्ट्याएर परीक्षण (Overlay & Match)', '1. Overlay Matching')}
          </button>
          <button
            onClick={() => setActiveTab('angles')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'angles' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            {L('२. संगत कोणहरू (Corresponding Angles)', '2. Corresponding Angles')}
          </button>
          <button
            onClick={() => setActiveTab('sides')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'sides' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            {L('३. संगत भुजाहरू (Corresponding Sides)', '3. Corresponding Sides')}
          </button>
          <button
            onClick={() => setActiveTab('notation')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'notation' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            {L('४. सर्वाङ्गसम सङ्केत (Congruency Notation)', '4. Notation (△ABC ≅ △PQR)')}
          </button>
        </div>

        {/* Tab 1: Overlay Matching */}
        {activeTab === 'overlay' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-amber-300 text-base">
                  {L('सर्वाङ्गसमता: एउटा त्रिभुजलाई अर्कोमा हुबहु खप्ट्याउनुहोस्', 'Congruence: Overlay Triangle 2 Exactly on Triangle 1')}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {L('तलको स्लाइडरहरू प्रयोग गरी दायाँको त्रिकोण △PQR लाई बायाँको △ABC मा खप्ट्याउनुहोस्। ठ्याक्कै खप्टिएमा तिनीहरू सर्वाङ्गसम हुन्छन्।', 'Move and rotate triangle △PQR so that it completely covers △ABC. When they match perfectly, they are congruent.')}
                </p>
              </div>

              {isOverlapped && (
                <div className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-xs font-bold animate-pulse">
                  🎉 {L('हुबहु खप्टियो! △ABC ≅ △PQR', 'Exact Match! △ABC ≅ △PQR')}
                </div>
              )}
            </div>

            {/* Controls for Triangle 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-900/70 rounded-xl border border-slate-800">
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {L('दायाँ-बायाँ सार्नुहोस् (Position X):', 'Move X:')} {posX}px
                </label>
                <input
                  type="range"
                  min="60"
                  max="280"
                  value={posX}
                  onChange={(e) => setPosX(parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {L('माथि-तल सार्नुहोस् (Position Y):', 'Move Y:')} {posY}px
                </label>
                <input
                  type="range"
                  min="30"
                  max="120"
                  value={posY}
                  onChange={(e) => setPosY(parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {L('घुमाउनुहोस् (Rotation Angle):', 'Rotate Angle:')} {rotation}°
                </label>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>

            {/* Interactive SVG Stage */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-center">
              <svg viewBox="0 0 500 280" className="w-full max-w-2xl h-72 select-none">
                <defs>
                  <pattern id="gridCong" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="500" height="280" fill="url(#gridCong)" />

                {/* Fixed Triangle 1: ABC at base (60, 40) */}
                <g transform="translate(60, 40)">
                  <polygon
                    points="0,160 160,160 40,30"
                    fill="rgba(56, 189, 248, 0.2)"
                    stroke="#38bdf8"
                    strokeWidth="3"
                  />
                  <circle cx="0" cy="160" r="4" fill="#38bdf8" />
                  <circle cx="160" cy="160" r="4" fill="#38bdf8" />
                  <circle cx="40" cy="30" r="4" fill="#38bdf8" />
                  <text x="-15" y="170" fill="#38bdf8" fontSize="13" fontWeight="bold">A</text>
                  <text x="165" y="170" fill="#38bdf8" fontSize="13" fontWeight="bold">B</text>
                  <text x="35" y="20" fill="#38bdf8" fontSize="13" fontWeight="bold">C</text>
                </g>

                {/* Movable Triangle 2: PQR */}
                <g transform={`translate(${posX}, ${posY}) rotate(${rotation}, 80, 95)`}>
                  <polygon
                    points="0,160 160,160 40,30"
                    fill="rgba(245, 158, 11, 0.25)"
                    stroke="#f59e0b"
                    strokeWidth="3"
                    strokeDasharray={isOverlapped ? 'none' : '4 3'}
                  />
                  <circle cx="0" cy="160" r="4" fill="#f59e0b" />
                  <circle cx="160" cy="160" r="4" fill="#f59e0b" />
                  <circle cx="40" cy="30" r="4" fill="#f59e0b" />
                  <text x="-15" y="170" fill="#f59e0b" fontSize="13" fontWeight="bold">P</text>
                  <text x="165" y="170" fill="#f59e0b" fontSize="13" fontWeight="bold">Q</text>
                  <text x="35" y="20" fill="#f59e0b" fontSize="13" fontWeight="bold">R</text>
                </g>
              </svg>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => { setPosX(60); setPosY(40); setRotation(0); kit.good(); }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                {L('हुबहु खप्ट्याउनुहोस् (Snap to Match)', 'Snap to Exact Match')}
              </button>
              <button
                onClick={() => { setPosX(240); setPosY(40); setRotation(0); }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                {L('पुनः सुरु गर्नुहोस् (Separate)', 'Separate Triangles')}
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Corresponding Angles */}
        {activeTab === 'angles' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700">
              <h3 className="font-bold text-amber-300 text-base">
                {L('संगत कोणहरू (Corresponding Angles)', 'Corresponding Angles of Congruent Triangles')}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {L('सर्वाङ्गसम त्रिभुजहरूका संगत कोणहरू सधैं आपसमा बराबर हुन्छन्। तलको बटनहरू थिचेर संगत कोणहरू हाइलाइट गर्नुहोस्।', 'Corresponding angles of congruent triangles are always equal. Click below to highlight matching angle pairs.')}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setHighlightPart('A')}
                className={`px-4 py-2 rounded-xl border text-xs font-bold ${
                  highlightPart === 'A' ? 'bg-amber-600 border-amber-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                ∠A ↔ ∠P (६०° = ६०°)
              </button>
              <button
                onClick={() => setHighlightPart('B')}
                className={`px-4 py-2 rounded-xl border text-xs font-bold ${
                  highlightPart === 'B' ? 'bg-amber-600 border-amber-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                ∠B ↔ ∠Q (७०° = ७०°)
              </button>
              <button
                onClick={() => setHighlightPart('C')}
                className={`px-4 py-2 rounded-xl border text-xs font-bold ${
                  highlightPart === 'C' ? 'bg-amber-600 border-amber-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                ∠C ↔ ∠R (५०° = ५०°)
              </button>
            </div>

            {/* Display Two Side-by-Side Triangles */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-center">
              <svg viewBox="0 0 500 240" className="w-full max-w-2xl h-64">
                {/* Triangle ABC */}
                <g transform="translate(60, 30)">
                  <polygon points="0,160 160,160 50,20" fill="rgba(56, 189, 248, 0.15)" stroke="#38bdf8" strokeWidth="3" />
                  <circle cx="0" cy="160" r={highlightPart === 'A' ? 12 : 4} fill={highlightPart === 'A' ? '#f59e0b' : '#38bdf8'} />
                  <circle cx="160" cy="160" r={highlightPart === 'B' ? 12 : 4} fill={highlightPart === 'B' ? '#f59e0b' : '#38bdf8'} />
                  <circle cx="50" cy="20" r={highlightPart === 'C' ? 12 : 4} fill={highlightPart === 'C' ? '#f59e0b' : '#38bdf8'} />
                  <text x="-15" y="170" fill="#38bdf8" fontSize="13" fontWeight="bold">A</text>
                  <text x="165" y="170" fill="#38bdf8" fontSize="13" fontWeight="bold">B</text>
                  <text x="45" y="10" fill="#38bdf8" fontSize="13" fontWeight="bold">C</text>
                  <text x="70" y="200" fill="#38bdf8" fontSize="13" fontWeight="bold">△ABC</text>
                </g>

                {/* Triangle PQR */}
                <g transform="translate(280, 30)">
                  <polygon points="0,160 160,160 50,20" fill="rgba(168, 85, 247, 0.15)" stroke="#a855f7" strokeWidth="3" />
                  <circle cx="0" cy="160" r={highlightPart === 'A' ? 12 : 4} fill={highlightPart === 'A' ? '#f59e0b' : '#a855f7'} />
                  <circle cx="160" cy="160" r={highlightPart === 'B' ? 12 : 4} fill={highlightPart === 'B' ? '#f59e0b' : '#a855f7'} />
                  <circle cx="50" cy="20" r={highlightPart === 'C' ? 12 : 4} fill={highlightPart === 'C' ? '#f59e0b' : '#a855f7'} />
                  <text x="-15" y="170" fill="#a855f7" fontSize="13" fontWeight="bold">P</text>
                  <text x="165" y="170" fill="#a855f7" fontSize="13" fontWeight="bold">Q</text>
                  <text x="45" y="10" fill="#a855f7" fontSize="13" fontWeight="bold">R</text>
                  <text x="70" y="200" fill="#a855f7" fontSize="13" fontWeight="bold">△PQR</text>
                </g>
              </svg>
            </div>
          </div>
        )}

        {/* Tab 3: Corresponding Sides */}
        {activeTab === 'sides' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700">
              <h3 className="font-bold text-amber-300 text-base">
                {L('संगत भुजाहरू (Corresponding Sides)', 'Corresponding Sides of Congruent Triangles')}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {L('सर्वाङ्गसम त्रिभुजहरूका संगत भुजाहरू बराबर हुन्छन्: AB = PQ, BC = QR, र CA = RP।', 'Corresponding sides of congruent triangles are equal in length: AB = PQ, BC = QR, and CA = RP.')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-center">
                <div className="text-xs text-slate-400">AB ↔ PQ</div>
                <div className="font-mono font-bold text-amber-300 text-base mt-1">६ सेमी = ६ सेमी</div>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-center">
                <div className="text-xs text-slate-400">BC ↔ QR</div>
                <div className="font-mono font-bold text-emerald-300 text-base mt-1">५ सेमी = ५ सेमी</div>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-center">
                <div className="text-xs text-slate-400">CA ↔ RP</div>
                <div className="font-mono font-bold text-sky-300 text-base mt-1">४ सेमी = ४ सेमी</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Congruency Notation */}
        {activeTab === 'notation' && (
          <div className="space-y-4 p-5 bg-slate-900/90 rounded-2xl border border-slate-700">
            <h3 className="font-bold text-amber-300 text-base">
              {L('सर्वाङ्गसमता लेख्ने सही तरिका (Congruency Notation Order)', 'Writing Congruency Statements Correctly')}
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              {L(
                'सर्वाङ्गसमता लेख्दा शीर्षबिन्दुहरूको क्रम संगत हुनुपर्छ। यदि A को संगत P, B को संगत Q, र C को संगत R भएमा: △ABC ≅ △PQR लेखिन्छ।',
                'When writing a congruence statement, vertex letters must match in exact corresponding order. If A corresponds to P, B to Q, and C to R, we write △ABC ≅ △PQR.'
              )}
            </p>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-2">
              <div className="text-2xl font-mono font-bold text-emerald-400">
                △ABC ≅ △PQR
              </div>
              <div className="text-xs text-slate-400">
                A ↔ P &nbsp;|&nbsp; B ↔ Q &nbsp;|&nbsp; C ↔ R
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default CongruentTriangleDiscoveryLab;
