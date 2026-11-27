/**
 * TessellationDesignStudio.tsx
 * Grade 7 Mathematics – Lesson 18: SYMMETRY AND TESSELLATION
 * Simulation 3: Tessellation Design Studio
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 270-277)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Grid, Check, RotateCcw, Palette, Layers, Sparkles } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'कुनै समतल सतहलाई कुनै पनि Gap (Gap) नछोडी र एकमाथि अर्को नखप्टिई (No Overlap) ज्यामितीय आकृतिहरूले भर्ने कार्यलाई के भनिन्छ?',
    en: 'What is the arrangement of geometrical shapes covering a plane surface without gaps or overlaps called?',
    options: [
      { key: 'A', label: 'Tessellation (tiling)' },
      { key: 'B', label: 'Symmetry' },
      { key: 'C', label: 'Transformation' },
      { key: 'D', label: 'Bearing' },
    ],
    answer: 'A',
  },
  {
    np: 'कुन-कुन नियमित ज्यामितीय आकृतिहरूले मात्र नियमित टेसलेसन (Regular Tessellation) बनाउन सक्छन्?',
    en: 'Which regular polygons can form regular tessellations alone?',
    options: [
      { key: 'A', label: 'Equilateral triangle, square and regular hexagon' },
      { key: 'B', label: 'Pentagon and octagon' },
      { key: 'C', label: 'Circle and ellipse' },
      { key: 'D', label: 'Scalene triangle only' },
    ],
    answer: 'A',
  },
  {
    np: 'नेपाली गाउँघरमा प्रयोग हुने नाङ्लो (Nanglo) र डोको (Doko) को बुनाइ कुन गणितीय अवधारणाको उदाहरण हो?',
    en: 'Weaving of traditional Nepali Nanglo and Doko is a real-life example of which mathematical concept?',
    options: [
      { key: 'A', label: 'Tessellation' },
      { key: 'B', label: 'Circumference of a circle' },
      { key: 'C', label: 'Exponent' },
      { key: 'D', label: 'Pythagoras theorem' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि कुनै सतहमा टायल बिछ्याउँदा बीचमा Gap वा Overlapping भाग रह्यो भने के त्यो सही टेसलेसन हो?',
    en: 'If gaps or overlaps occur between tiles, is it a valid tessellation?',
    options: [
      { key: 'A', label: 'No (a tessellation must have no gaps or overlaps)' },
      { key: 'B', label: 'Yes, it is a special tessellation' },
      { key: 'C', label: 'It is always valid' },
      { key: 'D', label: 'It is valid only 50% of the time' },
    ],
    answer: 'A',
  },
];

type StudioTab = 'interactive_tiling' | 'triangular_builder' | 'nepali_real_life' | 'validator';

export const TessellationDesignStudio: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L18-03',
    chapter: 18,
    titleNp: 'टेसलेसन डिजाइन स्टुडियो (Tessellation Studio)',
    titleEn: 'Tessellation Design Studio',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [tab, setTab] = useState<StudioTab>('interactive_tiling');

  // Tile grid coloring state (4x6 grid of alternating triangles or squares)
  const [tileShape, setTileShape] = useState<'triangle' | 'square' | 'hexagon'>('triangle');
  const [selectedColor, setSelectedColor] = useState<string>('#3b82f6');
  const [tileColors, setTileColors] = useState<{ [key: string]: string }>({});

  const handleTileClick = (key: string) => {
    setTileColors({ ...tileColors, [key]: selectedColor });
  };

  const handleResetColors = () => {
    setTileColors({});
  };

  const COLOR_PALETTE = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#64748b'];

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! कुनै पनि Gap नछोडी र नखप्टिई सतहलाई टायलले भर्ने कला नै टेसलेसन हो। रङ्गीन प्याटर्न बनाऔँ!',
        'Hello! Tessellation is the art of completely covering a surface without gaps or overlaps. Let us create colorful patterns!'
      )}
    >
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 justify-center bg-indigo-50/80 p-2 rounded-2xl border border-indigo-200">
          {[
            { id: 'interactive_tiling', np: '1. अन्तरक्रियात्मक टायलिङ (Interactive Studio)', en: '1. Interactive Studio' },
            { id: 'triangular_builder', np: '2. त्रिकोणीय टेसलेसन (Triangular Tessellation)', en: '2. Triangular Tessellation' },
            { id: 'validator', np: '3. टेसलेसन परीक्षण (Valid vs Invalid)', en: '3. Valid vs Invalid Tiling' },
            { id: 'nepali_real_life', np: '4. नेपाली परिवेशका टेसलेसन (Real-life Nepali)', en: '4. Nepali Real-Life Patterns' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id as StudioTab)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
                tab === item.id
                  ? 'bg-indigo-600 text-white shadow-indigo-200 ring-2 ring-indigo-400'
                  : 'bg-white text-slate-700 hover:bg-indigo-100'
              }`}
            >
              {isNe ? item.np : item.en}
            </button>
          ))}
        </div>

        {/* Tab 1: Interactive Studio */}
        {tab === 'interactive_tiling' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-2xl">
              <h3 className="text-base font-bold text-blue-950" style={{ fontFamily: FONT_NP }}>
                {L('Tessellation को परिभाषा:', 'Definition of Tessellation:')}
              </h3>
              <p className="text-slate-700 text-xs md:text-sm mt-1">
                {L(
                  'कुनै समतल सतहलाई कुनै पनि ठाउँ खाली नछोडी (No gaps) र एकमाथि अर्को नखप्टिने गरी (No overlaps) ज्यामितीय आकृतिहरूले मिलाएर ढाक्ने व्यवस्थालाई Tessellation भनिन्छ।',
                  'A tessellation is the covering of a plane using one or more geometric shapes with no gaps and no overlaps.'
                )}
              </p>
            </div>

            {/* Shape and Color controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              {/* Shape choices */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">{L('टायल छान्नुहोस्:', 'Tile Shape:')}</span>
                {[
                  { id: 'triangle', np: 'समबाहु त्रिभुज', en: 'Triangles' },
                  { id: 'square', np: 'वर्ग (Square)', en: 'Squares' },
                  { id: 'hexagon', np: 'षट्कोण (Hexagon)', en: 'Hexagons' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setTileShape(s.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      tileShape === s.id
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {isNe ? s.np : s.en}
                  </button>
                ))}
              </div>

              {/* Color Palette */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">{L('रङ्ग:', 'Color:')}</span>
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      selectedColor === c ? 'scale-125 border-slate-900 shadow-md ring-2 ring-indigo-400' : 'border-white'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <button
                  onClick={handleResetColors}
                  className="ml-2 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  {L('खाली', 'Reset')}
                </button>
              </div>
            </div>

            {/* Tiling Surface */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-center">
              <div className="text-xs text-slate-500 mb-2 font-medium">
                {L('कुनै पनि टायलमा क्लिक गरेर रङ्ग भर्नुहोस् र रङ्गीन टेसलेसन ढाँचा तयार गर्नुहोस्:', 'Click any tile to paint it with the chosen color:')}
              </div>

              {tileShape === 'square' && (
                <div className="grid grid-cols-6 gap-0.5 border-4 border-slate-700 bg-slate-700 p-0.5 rounded-lg shadow-lg">
                  {Array.from({ length: 24 }).map((_, i) => {
                    const key = `sq-${i}`;
                    const bg = tileColors[key] || ((Math.floor(i / 6) + (i % 6)) % 2 === 0 ? '#e2e8f0' : '#ffffff');
                    return (
                      <button
                        key={key}
                        onClick={() => handleTileClick(key)}
                        className="w-12 h-12 transition-all hover:opacity-80"
                        style={{ backgroundColor: bg }}
                      />
                    );
                  })}
                </div>
              )}

              {tileShape === 'triangle' && (
                <svg width="340" height="200" viewBox="0 0 340 200" className="border-4 border-slate-700 rounded-lg bg-slate-100 shadow-lg">
                  {/* Triangular grid */}
                  {Array.from({ length: 4 }).map((_, row) =>
                    Array.from({ length: 8 }).map((_, col) => {
                      const w = 42;
                      const h = 48;
                      const x1 = col * (w / 2);
                      const y1 = row * h;
                      const key = `tri-${row}-${col}`;
                      const bg = tileColors[key] || ((row + col) % 2 === 0 ? '#93c5fd' : '#cbd5e1');

                      const isUp = (row + col) % 2 === 0;
                      const points = isUp
                        ? `${x1 + w / 2},${y1} ${x1},${y1 + h} ${x1 + w},${y1 + h}`
                        : `${x1},${y1} ${x1 + w},${y1} ${x1 + w / 2},${y1 + h}`;

                      return (
                        <polygon
                          key={key}
                          points={points}
                          fill={bg}
                          stroke="#334155"
                          strokeWidth="1.5"
                          className="cursor-pointer hover:opacity-75 transition-opacity"
                          onClick={() => handleTileClick(key)}
                        />
                      );
                    })
                  )}
                </svg>
              )}

              {tileShape === 'hexagon' && (
                <svg width="340" height="220" viewBox="0 0 340 220" className="border-4 border-slate-700 rounded-lg bg-slate-100 shadow-lg">
                  {/* Hexagonal honeycomb tiling */}
                  {Array.from({ length: 3 }).map((_, row) =>
                    Array.from({ length: 5 }).map((_, col) => {
                      const r = 24;
                      const dx = r * Math.sqrt(3);
                      const cx = 35 + col * dx + (row % 2) * (dx / 2);
                      const cy = 35 + row * (r * 1.5);
                      const key = `hex-${row}-${col}`;
                      const bg = tileColors[key] || ((row + col) % 2 === 0 ? '#fed7aa' : '#ffffff');

                      const hexPoints = [0, 60, 120, 180, 240, 300]
                        .map((deg) => {
                          const rad = (deg * Math.PI) / 180;
                          return `${cx + r * Math.cos(rad)},${cy + r * Math.sin(rad)}`;
                        })
                        .join(' ');

                      return (
                        <polygon
                          key={key}
                          points={hexPoints}
                          fill={bg}
                          stroke="#475569"
                          strokeWidth="2"
                          className="cursor-pointer hover:opacity-75 transition-opacity"
                          onClick={() => handleTileClick(key)}
                        />
                      );
                    })
                  )}
                </svg>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Triangular Tessellation */}
        {tab === 'triangular_builder' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-emerald-50 border-l-4 border-emerald-600 p-4 rounded-r-2xl">
              <h3 className="text-base font-bold text-emerald-950" style={{ fontFamily: FONT_NP }}>
                {L('त्रिकोणीय टेसलेसन (Triangular Tessellation) का विधिहरू:', 'Triangular Tessellation Methods:')}
              </h3>
              <p className="text-slate-700 text-xs md:text-sm mt-1">
                {L(
                  'पाठ्यपुस्तक अनुसार समबाहु त्रिभुज र समकोणी त्रिभुज दुवैले कुनै Gap नछोडी टेसलेसन बनाउँछन्।',
                  'Both equilateral triangles and right-angled triangles can tessellate seamlessly across a flat plane.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Equilateral Triangle Tiling */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col items-center">
                <div className="text-xs font-bold text-indigo-900 mb-2">
                  {L('विधि 1: समबाहु त्रिभुजहरूको टेसलेसन (Equilateral △)', 'Method 1: Equilateral Triangles')}
                </div>
                <svg width="240" height="160" viewBox="0 0 240 160">
                  {Array.from({ length: 3 }).map((_, r) =>
                    Array.from({ length: 6 }).map((_, c) => {
                      const w = 40;
                      const h = 46;
                      const x = c * (w / 2);
                      const y = r * h;
                      const isUp = (r + c) % 2 === 0;
                      const pts = isUp
                        ? `${x + w / 2},${y} ${x},${y + h} ${x + w},${y + h}`
                        : `${x},${y} ${x + w},${y} ${x + w / 2},${y + h}`;
                      return (
                        <polygon
                          key={`eq-${r}-${c}`}
                          points={pts}
                          fill={isUp ? '#60a5fa' : '#fbbf24'}
                          stroke="#1e293b"
                          strokeWidth="1.5"
                        />
                      );
                    })
                  )}
                </svg>
                <div className="text-[11px] text-slate-600 mt-2 text-center">
                  {L('6 pcs समबाहु त्रिभुजहरू एउटा शीर्षमा भेटिँदा 6 × 60° = 360° हुन्छ।', '6 equilateral triangles meet at each vertex (6 × 60° = 360°).')}
                </div>
              </div>

              {/* Right-angled Triangle Tiling */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col items-center">
                <div className="text-xs font-bold text-indigo-900 mb-2">
                  {L('विधि 2: समकोणी त्रिभुजहरूको टेसलेसन (Right-angled △)', 'Method 2: Right-angled Triangles')}
                </div>
                <svg width="240" height="160" viewBox="0 0 240 160">
                  {Array.from({ length: 3 }).map((_, r) =>
                    Array.from({ length: 4 }).map((_, c) => {
                      const x = c * 60;
                      const y = r * 50;
                      return (
                        <g key={`rt-${r}-${c}`}>
                          {/* Upper right triangle */}
                          <polygon points={`${x},${y} ${x + 60},${y} ${x + 60},${y + 50}`} fill="#34d399" stroke="#1e293b" strokeWidth="1.5" />
                          {/* Lower left right triangle */}
                          <polygon points={`${x},${y} ${x},${y + 50} ${x + 60},${y + 50}`} fill="#a78bfa" stroke="#1e293b" strokeWidth="1.5" />
                        </g>
                      );
                    })
                  )}
                </svg>
                <div className="text-[11px] text-slate-600 mt-2 text-center">
                  {L('दुई समकोणी त्रिभुज जोड्दा आयत बन्छ र आयतहरू मिलेर पूर्ण सतह ढाकिन्छ।', 'Pairs of right triangles form rectangles that tile the surface.')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Validator (Valid vs Invalid) */}
        {tab === 'validator' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200">
              <h3 className="text-base font-bold text-purple-950" style={{ fontFamily: FONT_NP }}>
                {L('टेसलेसन मान्य वा अमान्य कसरी चिन्ने?', 'How to Distinguish Valid vs Invalid Tessellation:')}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Example 1: Valid Square Tiling */}
              <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-center space-y-2">
                <div className="text-xs font-bold text-emerald-900 uppercase">✓ {L('सही टेसलेसन (Valid)', 'Valid Tessellation')}</div>
                <div className="h-28 flex items-center justify-center">
                  <div className="grid grid-cols-3 gap-0 border-2 border-emerald-600">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className={`w-8 h-8 border border-emerald-600 ${i % 2 === 0 ? 'bg-emerald-400' : 'bg-emerald-200'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-emerald-800 font-semibold">
                  {L('कुनै Gap छैन र Overlapping पनि छैन। (No gaps, no overlaps)', 'No gaps and no overlaps. Perfect tiling.')}
                </p>
              </div>

              {/* Example 2: Invalid (Gaps) */}
              <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-center space-y-2">
                <div className="text-xs font-bold text-rose-900 uppercase">✕ {L('गलत: Gap भएको (Gaps)', 'Invalid: Has Gaps')}</div>
                <div className="h-28 flex items-center justify-center">
                  <svg width="100" height="90" viewBox="0 0 100 90">
                    <circle cx="25" cy="25" r="20" fill="#f87171" stroke="#b91c1c" strokeWidth="2" />
                    <circle cx="75" cy="25" r="20" fill="#f87171" stroke="#b91c1c" strokeWidth="2" />
                    <circle cx="50" cy="65" r="20" fill="#f87171" stroke="#b91c1c" strokeWidth="2" />
                    {/* Empty center gap */}
                    <text x="50" y="42" textAnchor="middle" fontSize="10" fill="#7f1d1d" fontWeight="bold">Gap</text>
                  </svg>
                </div>
                <p className="text-[11px] text-rose-800 font-semibold">
                  {L('वृत्तहरूलाई जोड्दा बीचमा Gap (Gap) छुट्छ, त्यसैले वृत्तले टेसलेसन बनाउँदैन।', 'Circles leave gaps when placed side by side.')}
                </p>
              </div>

              {/* Example 3: Invalid (Overlaps) */}
              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-center space-y-2">
                <div className="text-xs font-bold text-amber-900 uppercase">✕ {L('गलत: Overlapping (Overlaps)', 'Invalid: Overlapping')}</div>
                <div className="h-28 flex items-center justify-center">
                  <svg width="100" height="90" viewBox="0 0 100 90">
                    <rect x="15" y="15" width="45" height="45" fill="rgba(245, 158, 11, 0.5)" stroke="#b45309" strokeWidth="2" />
                    <rect x="40" y="25" width="45" height="45" fill="rgba(239, 68, 68, 0.5)" stroke="#b91c1c" strokeWidth="2" />
                    <text x="50" y="42" textAnchor="middle" fontSize="10" fill="#b45309" fontWeight="bold">Overlapping</text>
                  </svg>
                </div>
                <p className="text-[11px] text-amber-800 font-semibold">
                  {L('टायलहरू एकमाथि अर्को खप्टिनु हुँदैन। समतल सतह बराबर हुनुपर्छ।', 'Tiles cannot overlap each other.')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Nepali Real-Life Tessellation */}
        {tab === 'nepali_real_life' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-2xl">
              <h3 className="text-base font-bold text-amber-950" style={{ fontFamily: FONT_NP }}>
                {L('नेपाली जनजीवन र संस्कृतिका टेसलेसन उदाहरणहरू:', 'Real-Life Nepali Tessellation Examples:')}
              </h3>
              <p className="text-slate-700 text-xs mt-1">
                {L('पाठ्यपुस्तक अनुसार हाम्रा परम्परागत सामान र Architectureमा टेसलेसनको व्यापक प्रयोग पाइन्छ।', 'Textbook examples: Traditional Nepali household items and crafts reflect tessellation.')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  titleNp: '1. नाङ्लो र डोकोको बुनाइ',
                  titleEn: '1. Nanglo & Doko Weaving',
                  descNp: 'बाँस वा चोयालाई क्रस गरी त्रिकोणीय र समानान्तर टेसलेसन ढाँचामा बुनिन्छ।',
                  descEn: 'Bamboo strips woven in tight repeating triangular and diamond geometric patterns.',
                  badge: 'Traditional craft',
                },
                {
                  titleNp: '2. ढुङ्गे पर्खाल र इँटाको गारो',
                  titleEn: '2. Stone & Brick Walls',
                  descNp: 'इँटाहरूलाई आयताकार टेसलेसनमा बिना कुनै Gap मिलाएर पर्खाल बनाइन्छ।',
                  descEn: 'Rectangular bricks arranged seamlessly without gaps to create strong walls.',
                  badge: 'Architecture',
                },
                {
                  titleNp: '3. नेपाली गलैंचा र कार्पेट',
                  titleEn: '3. Nepali Carpet & Rugs',
                  descNp: 'उनका धागाहरूबाट ज्यामितीय सममितीय ढाँचाहरू मिलाएर सुन्दर टेसलेसन बनाइन्छ।',
                  descEn: 'Handwoven wool rugs featuring symmetrical geometric tile designs.',
                  badge: 'Handicraft',
                },
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                  <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                    {item.badge}
                  </div>
                  <div className="font-bold text-sm text-slate-800" style={{ fontFamily: FONT_NP }}>
                    {isNe ? item.titleNp : item.titleEn}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isNe ? item.descNp : item.descEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default TessellationDesignStudio;
