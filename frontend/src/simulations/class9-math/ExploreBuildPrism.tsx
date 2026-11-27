import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';

interface PrismTypeInfo {
  id: 'triangular' | 'rectangular' | 'square' | 'trapezoidal';
  nameNp: string;
  nameEn: string;
  baseShapeNp: string;
  baseShapeEn: string;
  vertices: number;
  edges: number;
  faces: number;
  lateralFaces: number;
}

const PRISM_TYPES: PrismTypeInfo[] = [
  {
    id: 'triangular',
    nameNp: 'त्रिभुजाकार प्रिज्म (Triangular Prism)',
    nameEn: 'Triangular Prism',
    baseShapeNp: 'त्रिभुज (२ वटा समानान्तर र सर्वसम)',
    baseShapeEn: 'Triangle (2 parallel & congruent)',
    vertices: 6,
    edges: 9,
    faces: 5,
    lateralFaces: 3,
  },
  {
    id: 'rectangular',
    nameNp: 'आयताकार प्रिज्म (Rectangular Prism / Cuboid)',
    nameEn: 'Rectangular Prism / Cuboid',
    baseShapeNp: 'आयात (२ वटा समानान्तर र सर्वसम)',
    baseShapeEn: 'Rectangle (2 parallel & congruent)',
    vertices: 8,
    edges: 12,
    faces: 6,
    lateralFaces: 4,
  },
  {
    id: 'square',
    nameNp: 'वर्गाकार प्रिज्म / घन (Cube / Square Prism)',
    nameEn: 'Square-based Prism / Cube',
    baseShapeNp: 'वर्ग (२ वटा सर्वसम वर्ग)',
    baseShapeEn: 'Square (2 congruent squares)',
    vertices: 8,
    edges: 12,
    faces: 6,
    lateralFaces: 4,
  },
  {
    id: 'trapezoidal',
    nameNp: 'समलम्बाकार प्रिज्म (Trapezoidal Prism)',
    nameEn: 'Trapezoidal Prism',
    baseShapeNp: 'समलम्ब चतुर्भुज (Trapezium)',
    baseShapeEn: 'Trapezium (2 parallel bases)',
    vertices: 8,
    edges: 12,
    faces: 6,
    lateralFaces: 4,
  },
];

const QUIZ_QUESTIONS = [
  {
    np: 'प्रिज्म (Prism) को परिभाषा अनुसार यसका दुई विपरीत आधारहरू (Bases) कस्ता हुन्छन्?',
    en: 'According to the definition of a prism, how are its two opposite bases related?',
    options: [
      { key: 'A', label: 'समानान्तर र सर्वसम (Parallel and Congruent)' },
      { key: 'B', label: 'समानान्तर तर असमान आकारका' },
      { key: 'C', label: 'एउटा बिन्दुमा जोडिएका' },
      { key: 'D', label: 'सधैं वृत्ताकार' },
    ],
    answer: 'A',
  },
  {
    np: 'त्रिभुजाकार प्रिज्ममा कतिवटा शीर्षबिन्दु (Vertices), किनारा (Edges) र सतह (Faces) हुन्छन्?',
    en: 'How many vertices, edges, and faces does a triangular prism have?',
    options: [
      { key: 'A', label: 'V = ६, E = ९, F = ५' },
      { key: 'B', label: 'V = ८, E = १२, F = ६' },
      { key: 'C', label: 'V = ५, E = ८, F = ५' },
      { key: 'D', label: 'V = ४, E = ६, F = ४' },
    ],
    answer: 'A',
  },
  {
    np: 'ओयलरको सूत्र (Euler\'s Formula: V - E + F) प्रिज्मका लागि प्रमाणित गर्दा कति मान आउँछ?',
    en: 'What is the evaluated value of Euler\'s formula (V - E + F) for any prism?',
    options: [
      { key: 'A', label: '०' },
      { key: 'B', label: '१' },
      { key: 'C', label: '२ (V - E + F = २)' },
      { key: 'D', label: '४' },
    ],
    answer: 'C',
  },
  {
    np: 'प्रिज्मको आधारसँग समानान्तर हुने गरी कुनै समतलले काट्दा बन्ने अनुप्रस्थ काट (Cross-section) कस्तो हुन्छ?',
    en: 'What is the cross-section formed when a prism is sliced by a plane parallel to its base?',
    options: [
      { key: 'A', label: 'आधारसँग सर्वसम (Congruent to the base)' },
      { key: 'B', label: 'आधारभन्दा सानो' },
      { key: 'C', label: 'सधैं वृत्त' },
      { key: 'D', label: 'अनियमित आकारको' },
    ],
    answer: 'A',
  },
];

export const ExploreBuildPrism: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U6-01',
    chapter: 6,
    titleNp: 'प्रिज्मको अन्वेषण तथा निर्माण',
    titleEn: 'Explore and Build a Prism',
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [selectedType, setSelectedType] = useState<PrismTypeInfo>(PRISM_TYPES[0]);
  const [prismHeight, setPrismHeight] = useState<number>(180); // length/height of prism in px
  const [highlightPart, setHighlightPart] = useState<'all' | 'bases' | 'lateral' | 'cross'>('all');
  const [crossSectionPos, setCrossSectionPos] = useState<number>(50); // % along length
  const [rotationAngle, setRotationAngle] = useState<number>(25); // tilt angle in degrees

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! पाठ ६ प्रिज्म अन्तर्गत विभिन्न प्रकारका प्रिज्महरू, आधार, छड्के सतह, अनुप्रस्थ काट र ओयलरको सूत्र अन्वेषण गरौं!',
        'Welcome! Explore prism types, congruent bases, lateral faces, uniform cross-sections, and Euler\'s formula!'
      )}
    >
      <div className="space-y-6" style={{ fontFamily: isNe ? FONT_NP : 'inherit' }}>
        {/* Prism Type Selector Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRISM_TYPES.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedType(p)}
              className={`p-3 rounded-2xl border text-center transition-all ${
                selectedType.id === p.id
                  ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-lg scale-[1.02]'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="text-xl mb-1">
                {p.id === 'triangular' ? '📐' : p.id === 'square' ? '🧊' : p.id === 'rectangular' ? '📦' : '⏢'}
              </div>
              <div className="text-xs font-bold">{isNe ? p.nameNp.split('(')[0] : p.nameEn}</div>
            </button>
          ))}
        </div>

        {/* Main Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-5 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg border-b pb-2">
              {L('प्रिज्म नियन्त्रण तथा विशेषताहरू', 'Prism Controls & Features')}
            </h3>

            {/* Prism Length / Height Slider */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {L('प्रिज्मको लम्बाइ वा उचाइ (Length / Height h):', 'Prism Height/Length (h):')}
                </span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  {isNe ? toNp(Math.round(prismHeight / 10)) : Math.round(prismHeight / 10)} cm
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="260"
                value={prismHeight}
                onChange={(e) => setPrismHeight(parseInt(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* 3D View Angle Tilt */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {L('३D अवलोकन कोण (View Angle):', 'View Tilt Angle:')}
                </span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  {isNe ? toNp(rotationAngle) : rotationAngle}°
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="45"
                value={rotationAngle}
                onChange={(e) => setRotationAngle(parseInt(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Highlight Component Mode */}
            <div>
              <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                {L('सतह हाइलाइट (Highlight Part):', 'Highlight Surface:')}
              </div>
              <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
                <button
                  onClick={() => setHighlightPart('all')}
                  className={`p-2 rounded-lg border ${highlightPart === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-50 dark:bg-gray-700'}`}
                >
                  {L('सबै', 'All')}
                </button>
                <button
                  onClick={() => setHighlightPart('bases')}
                  className={`p-2 rounded-lg border ${highlightPart === 'bases' ? 'bg-emerald-600 text-white' : 'bg-gray-50 dark:bg-gray-700'}`}
                >
                  {L('आधार (Bases)', 'Bases')}
                </button>
                <button
                  onClick={() => setHighlightPart('lateral')}
                  className={`p-2 rounded-lg border ${highlightPart === 'lateral' ? 'bg-amber-600 text-white' : 'bg-gray-50 dark:bg-gray-700'}`}
                >
                  {L('छड्के सतह', 'Lateral')}
                </button>
                <button
                  onClick={() => setHighlightPart('cross')}
                  className={`p-2 rounded-lg border ${highlightPart === 'cross' ? 'bg-purple-600 text-white' : 'bg-gray-50 dark:bg-gray-700'}`}
                >
                  {L('अनुप्रस्थ काट', 'Cross-sec')}
                </button>
              </div>
            </div>

            {/* Cross Section Slider when cross is enabled */}
            {highlightPart === 'cross' && (
              <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800 space-y-2">
                <div className="flex justify-between text-xs font-bold text-purple-900 dark:text-purple-200">
                  <span>{L('अनुप्रस्थ काटको स्थान (Cutting Plane Position):', 'Slice Plane Position:')}</span>
                  <span>{crossSectionPos}%</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="85"
                  value={crossSectionPos}
                  onChange={(e) => setCrossSectionPos(parseInt(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
                <div className="text-[11px] text-purple-700 dark:text-purple-300">
                  {L('आधारसँग समानान्तर काट्दा बन्ने अनुप्रस्थ काट आधारसँग ठ्याक्कै सर्वसम हुन्छ।', 'The sliced cross-section is identical and congruent to the base.')}
                </div>
              </div>
            )}

            {/* Euler's Formula Card */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-800 space-y-2">
              <div className="font-bold text-blue-900 dark:text-blue-200 text-xs uppercase tracking-wide">
                {L('ओयलरको सूत्र परीक्षण (Euler\'s Formula: V - E + F = 2)', "Euler's Formula Verification")}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-white dark:bg-gray-800 p-2 rounded-xl">
                  <div className="text-gray-500">{L('शीर्षबिन्दु (V)', 'Vertices (V)')}</div>
                  <div className="text-lg font-black text-blue-600 dark:text-blue-400 font-mono">{isNe ? toNp(selectedType.vertices) : selectedType.vertices}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-2 rounded-xl">
                  <div className="text-gray-500">{L('किनारा (E)', 'Edges (E)')}</div>
                  <div className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">{isNe ? toNp(selectedType.edges) : selectedType.edges}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-2 rounded-xl">
                  <div className="text-gray-500">{L('सतह (F)', 'Faces (F)')}</div>
                  <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">{isNe ? toNp(selectedType.faces) : selectedType.faces}</div>
                </div>
              </div>
              <div className="text-center font-mono text-xs font-bold text-blue-800 dark:text-blue-300 pt-1">
                {selectedType.vertices} - {selectedType.edges} + {selectedType.faces} = <strong>2</strong> ✓
              </div>
            </div>
          </div>

          {/* 3D Visualizer & Characteristics Display */}
          <div className="lg:col-span-7 space-y-4">
            {/* SVG 3D Prism Visualization */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center min-h-[320px]">
              <svg viewBox="0 0 500 320" className="w-full max-w-lg h-72">
                {selectedType.id === 'triangular' && (
                  /* Triangular Prism Visual */
                  <g>
                    {/* Front Base (Triangle 1) */}
                    {/* Vertices: A(120, 80), B(60, 240), C(180, 240) */}
                    {/* Back Base (Triangle 2): offset by prismHeight along isometric axis */}
                    {(() => {
                      const dx = prismHeight * 0.8;
                      const dy = -prismHeight * 0.35;
                      const sliceDx = dx * (crossSectionPos / 100);
                      const sliceDy = dy * (crossSectionPos / 100);

                      return (
                        <>
                          {/* Back Base (Emerald) */}
                          <polygon
                            points={`${120 + dx},${80 + dy} ${60 + dx},${240 + dy} ${180 + dx},${240 + dy}`}
                            className={`transition-all duration-300 ${
                              highlightPart === 'bases' || highlightPart === 'all'
                                ? 'fill-emerald-300/60 dark:fill-emerald-800/60 stroke-emerald-600 stroke-2'
                                : 'fill-gray-200 dark:fill-gray-800 stroke-gray-400'
                            }`}
                          />

                          {/* Connecting Lateral Faces */}
                          {/* Top Face */}
                          <polygon
                            points={`120,80 ${120 + dx},${80 + dy} ${180 + dx},${240 + dy} 180,240`}
                            className={`transition-all duration-300 ${
                              highlightPart === 'lateral' || highlightPart === 'all'
                                ? 'fill-amber-200/40 dark:fill-amber-900/30 stroke-amber-500 stroke-1'
                                : 'fill-gray-100 dark:fill-gray-850 stroke-gray-400'
                            }`}
                          />
                          {/* Bottom Face */}
                          <polygon
                            points={`60,240 ${60 + dx},${240 + dy} ${180 + dx},${240 + dy} 180,240`}
                            className={`transition-all duration-300 ${
                              highlightPart === 'lateral' || highlightPart === 'all'
                                ? 'fill-amber-300/40 dark:fill-amber-800/40 stroke-amber-600 stroke-1'
                                : 'fill-gray-200 dark:fill-gray-800 stroke-gray-400'
                            }`}
                          />

                          {/* Slicing Plane if cross is selected */}
                          {highlightPart === 'cross' && (
                            <polygon
                              points={`${120 + sliceDx},${80 + sliceDy} ${60 + sliceDx},${240 + sliceDy} ${180 + sliceDx},${240 + sliceDy}`}
                              className="fill-purple-400/80 stroke-purple-700 stroke-2 animate-pulse"
                            />
                          )}

                          {/* Front Base (Emerald) */}
                          <polygon
                            points="120,80 60,240 180,240"
                            className={`transition-all duration-300 ${
                              highlightPart === 'bases' || highlightPart === 'all'
                                ? 'fill-emerald-400/80 dark:fill-emerald-700/80 stroke-emerald-700 stroke-2'
                                : 'fill-gray-300 dark:fill-gray-700 stroke-gray-500'
                            }`}
                          />

                          {/* Labels */}
                          <text x="120" y="180" textAnchor="middle" className="text-xs font-black fill-emerald-950 dark:fill-emerald-100">
                            {L('अगाडिको आधार (Base 1)', 'Front Base')}
                          </text>
                          <text x={120 + dx} y={180 + dy} textAnchor="middle" className="text-xs font-black fill-emerald-950 dark:fill-emerald-100">
                            {L('पछाडिको आधार (Base 2)', 'Back Base')}
                          </text>

                          {/* Dimension Arrow h */}
                          <line x1="180" y1="240" x2={180 + dx} y2={240 + dy} className="stroke-blue-600 stroke-2 stroke-dasharray-4" strokeDasharray="4 4" />
                          <text x={180 + dx / 2 + 10} y={240 + dy / 2} className="text-xs font-bold fill-blue-600 font-mono">
                            h = {Math.round(prismHeight / 10)} cm
                          </text>
                        </>
                      );
                    })()}
                  </g>
                )}

                {selectedType.id === 'rectangular' && (
                  /* Rectangular Prism / Cuboid */
                  <g>
                    {(() => {
                      const dx = prismHeight * 0.7;
                      const dy = -prismHeight * 0.4;
                      const sliceDx = dx * (crossSectionPos / 100);
                      const sliceDy = dy * (crossSectionPos / 100);

                      return (
                        <>
                          {/* Back Face */}
                          <polygon
                            points={`${80 + dx},${120 + dy} ${220 + dx},${120 + dy} ${220 + dx},${240 + dy} ${80 + dx},${240 + dy}`}
                            className="fill-emerald-200/60 dark:fill-emerald-900/40 stroke-emerald-600 stroke-2"
                          />
                          {/* Top Face */}
                          <polygon
                            points={`80,120 ${80 + dx},${120 + dy} ${220 + dx},${120 + dy} 220,120`}
                            className="fill-amber-200/50 dark:fill-amber-900/30 stroke-amber-500 stroke-1"
                          />
                          {/* Right Face */}
                          <polygon
                            points={`220,120 ${220 + dx},${120 + dy} ${220 + dx},${240 + dy} 220,240`}
                            className="fill-amber-300/50 dark:fill-amber-800/40 stroke-amber-600 stroke-1"
                          />
                          {/* Cross section plane */}
                          {highlightPart === 'cross' && (
                            <polygon
                              points={`${80 + sliceDx},${120 + sliceDy} ${220 + sliceDx},${120 + sliceDy} ${220 + sliceDx},${240 + sliceDy} ${80 + sliceDx},${240 + sliceDy}`}
                              className="fill-purple-400/80 stroke-purple-700 stroke-2"
                            />
                          )}
                          {/* Front Face */}
                          <polygon
                            points="80,120 220,120 220,240 80,240"
                            className="fill-emerald-400/80 dark:fill-emerald-700/80 stroke-emerald-700 stroke-2"
                          />
                          <text x="150" y="185" textAnchor="middle" className="text-xs font-black fill-emerald-950 dark:fill-white">
                            {L('आधार आयात (Base Rectangle)', 'Base Rectangle')}
                          </text>
                        </>
                      );
                    })()}
                  </g>
                )}

                {(selectedType.id === 'square' || selectedType.id === 'trapezoidal') && (
                  /* Square / Trapezoidal */
                  <g>
                    {(() => {
                      const dx = prismHeight * 0.7;
                      const dy = -prismHeight * 0.4;
                      return (
                        <>
                          <polygon
                            points={`${100 + dx},${100 + dy} ${220 + dx},${100 + dy} ${220 + dx},${220 + dy} ${100 + dx},${220 + dy}`}
                            className="fill-emerald-200/60 dark:fill-emerald-900/40 stroke-emerald-600 stroke-2"
                          />
                          <polygon
                            points={`100,100 ${100 + dx},${100 + dy} ${220 + dx},${100 + dy} 220,100`}
                            className="fill-amber-200/50 stroke-amber-500 stroke-1"
                          />
                          <polygon
                            points={`220,100 ${220 + dx},${100 + dy} ${220 + dx},${220 + dy} 220,220`}
                            className="fill-amber-300/50 stroke-amber-600 stroke-1"
                          />
                          <polygon
                            points="100,100 220,100 220,220 100,220"
                            className="fill-emerald-400/80 stroke-emerald-700 stroke-2"
                          />
                          <text x="160" y="165" textAnchor="middle" className="text-xs font-black fill-emerald-950 dark:fill-white">
                            {selectedType.id === 'square' ? L('वर्गाकार आधार', 'Square Base') : L('समलम्ब आधार', 'Trapezoid Base')}
                          </text>
                        </>
                      );
                    })()}
                  </g>
                )}
              </svg>
            </div>

            {/* Characteristics Checklist */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-3 text-sm">
              <h4 className="font-bold text-gray-800 dark:text-gray-100 border-b pb-2">
                {L('पाठ्यपुस्तक अनुसार प्रिज्मका मुख्य विशेषताहरू (Characteristics)', 'Textbook Prism Characteristics')}
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">१.</span>
                  <div>
                    <strong>{L('दुई विपरीत आधारहरू सर्वसम र समानान्तर हुन्छन्:', 'Two Congruent & Parallel Bases:')}</strong>{' '}
                    {isNe ? selectedType.baseShapeNp : selectedType.baseShapeEn}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">२.</span>
                  <div>
                    <strong>{L('छड्के सतहहरू आयताकार हुन्छन् (Lateral Faces):', 'Rectangular Lateral Faces:')}</strong>{' '}
                    {L(`यस प्रिज्ममा ${toNp(selectedType.lateralFaces)} वटा छड्के आयताकार सतहहरू छन्।`, `Contains ${selectedType.lateralFaces} rectangular lateral faces.`)}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">३.</span>
                  <div>
                    <strong>{L('एकसमान अनुप्रस्थ काट (Uniform Cross-Section):', 'Uniform Cross-Section:')}</strong>{' '}
                    {L('आधारसँग समानान्तर हुने गरी जहाँ काटिए पनि बन्ने अनुप्रस्थ काटको आकार र क्षेत्रफल सधैं समान हुन्छ।', 'Cutting plane parallel to the base always produces an identical cross-sectional area.')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};

export default ExploreBuildPrism;
