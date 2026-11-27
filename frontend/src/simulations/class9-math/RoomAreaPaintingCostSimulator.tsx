import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';

const QUIZ_QUESTIONS = [
  {
    np: 'एउटा कोठाको लम्बाइ l, चौडाइ b र उचाइ h भए चार भित्ताको क्षेत्रफल (Area of four walls) को सूत्र के हो?',
    en: 'If l, b, and h are length, breadth, and height of a room, what is the formula for area of four walls?',
    options: [
      { key: 'A', label: '२(l + b)h वा २h(l + b)' },
      { key: 'B', label: 'l × b × h' },
      { key: 'C', label: '२(lb + bh + hl)' },
      { key: 'D', label: '२(l + h)' },
    ],
    answer: 'A',
  },
  {
    np: 'भुइँमा कार्पेट बिछ्याउँदा कुन सतहको क्षेत्रफल हिसाब गरिन्छ?',
    en: 'When laying carpet on the floor, which surface area is calculated?',
    options: [
      { key: 'A', label: 'चार भित्ताको क्षेत्रफल [२h(l + b)]' },
      { key: 'B', label: 'भुइँको क्षेत्रफल (l × b)' },
      { key: 'C', label: 'भुइँ र सिलिङ दुवै (२lb)' },
      { key: 'D', label: 'कोठाको आयतन (lbh)' },
    ],
    answer: 'B',
  },
  {
    np: 'भित्तामा रङ लगाउँदा ढोका र झ्यालको क्षेत्रफललाई चार भित्ताको कुल क्षेत्रफलबाट के गर्नुपर्छ?',
    en: 'When painting the walls, what must be done with the area of doors and windows?',
    options: [
      { key: 'A', label: 'जोड्नुपर्छ (Add)' },
      { key: 'B', label: 'घटाउनुपर्छ (Subtract)' },
      { key: 'C', label: 'गुणा गर्नुपर्छ (Multiply)' },
      { key: 'D', label: 'कुनै फरक पर्दैन' },
    ],
    answer: 'B',
  },
  {
    np: 'एउटा वर्गाकार कोठा (Cubical Room) को प्रत्येक भुजा ४ मिटर भए चार भित्ताको क्षेत्रफल कति हुन्छ?',
    en: 'If each side of a cubical room is 4m, what is the area of its four walls?',
    options: [
      { key: 'A', label: '१६ वर्ग मिटर' },
      { key: 'B', label: '४८ वर्ग मिटर' },
      { key: 'C', label: '६४ वर्ग मिटर (४a² = ४ × ४² = ६४)' },
      { key: 'D', label: '९६ वर्ग मिटर' },
    ],
    answer: 'C',
  },
];

export const RoomAreaPaintingCostSimulator: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U5-02',
    chapter: 5,
    titleNp: 'कोठाको क्षेत्रफल तथा रङरोगन खर्च सिमुलेटर',
    titleEn: 'Room Area and Painting Cost Simulator',
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'room' | 'cost' | 'cubical'>('room');

  // --- Room Dimensions (in meters) ---
  const [lengthM, setLengthM] = useState<number>(6); // l
  const [breadthM, setBreadthM] = useState<number>(4); // b
  const [heightM, setHeightM] = useState<number>(3); // h

  // --- Doors and Windows ---
  const [doorCount, setDoorCount] = useState<number>(1);
  const [doorWidth, setDoorWidth] = useState<number>(1.2); // m
  const [doorHeight, setDoorHeight] = useState<number>(2.0); // m

  const [windowCount, setWindowCount] = useState<number>(2);
  const [windowWidth, setWindowWidth] = useState<number>(1.5); // m
  const [windowHeight, setWindowHeight] = useState<number>(1.2); // m

  // --- Costs (in Rs per sq. meter) ---
  const [paintRatePerSqM, setPaintRatePerSqM] = useState<number>(180);
  const [carpetRatePerSqM, setCarpetRatePerSqM] = useState<number>(350);
  const [plasterRatePerSqM, setPlasterRatePerSqM] = useState<number>(120);

  // Surfaces selected for highlighting
  const [highlightSurface, setHighlightSurface] = useState<'all' | 'floor' | 'ceiling' | 'walls'>('all');

  // --- Area Calculations ---
  const floorArea = lengthM * breadthM; // l * b
  const ceilingArea = lengthM * breadthM; // l * b
  const floorAndCeilingArea = 2 * floorArea;
  const fourWallsArea = 2 * heightM * (lengthM + breadthM); // 2h(l + b)
  const totalRoomSurface = 2 * (lengthM * breadthM + breadthM * heightM + heightM * lengthM); // 2(lb + bh + hl)

  // Openings
  const totalDoorArea = doorCount * (doorWidth * doorHeight);
  const totalWindowArea = windowCount * (windowWidth * windowHeight);
  const openingsArea = totalDoorArea + totalWindowArea;

  // Net Painting Area (Four walls excluding doors and windows)
  const netWallPaintArea = Math.max(0, fourWallsArea - openingsArea);
  const netWallsAndCeilingPaintArea = netWallPaintArea + ceilingArea;

  // --- Cost Calculations ---
  const wallPaintingCost = Math.round(netWallPaintArea * paintRatePerSqM);
  const ceilingPaintingCost = Math.round(ceilingArea * paintRatePerSqM);
  const totalPaintingCost = wallPaintingCost + ceilingPaintingCost;
  const carpetFlooringCost = Math.round(floorArea * carpetRatePerSqM);
  const totalRenovationCost = totalPaintingCost + carpetFlooringCost;

  // --- Cubical Room Comparison ---
  const [cubeSide, setCubeSide] = useState<number>(4);
  const cubeFloor = cubeSide * cubeSide;
  const cubeFourWalls = 4 * (cubeSide * cubeSide);
  const cubeTSA = 6 * (cubeSide * cubeSide);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! कोठाको लम्बाइ, चौडाइ र उचाइ परिवर्तन गरेर चार भित्ता, भुइँ, सिलिङको क्षेत्रफल र रङरोगन खर्च हिसाब गरौं!',
        'Welcome! Adjust room dimensions to calculate wall, floor, ceiling areas, and paint/carpet costs!'
      )}
    >
      <div className="space-y-6" style={{ fontFamily: isNe ? FONT_NP : 'inherit' }}>
        {/* Navigation Tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl max-w-xl mx-auto shadow-inner">
          <button
            onClick={() => setActiveTab('room')}
            className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'room'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span>🏠</span>
            <span>{L('१. कोठा तथा भित्ता क्षेत्रफल', '1. Room Surfaces')}</span>
          </button>
          <button
            onClick={() => setActiveTab('cost')}
            className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'cost'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span>🎨</span>
            <span>{L('२. रङ तथा कार्पेट खर्च', '2. Paint & Carpet Cost')}</span>
          </button>
          <button
            onClick={() => setActiveTab('cubical')}
            className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'cubical'
                ? 'bg-amber-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span>📦</span>
            <span>{L('३. घनाकार कोठा (Cube)', '3. Cubical Room')}</span>
          </button>
        </div>

        {activeTab === 'room' && (
          /* =========================================================================
             ROOM SURFACES EXPLORER
             ========================================================================= */
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 p-5 rounded-2xl border border-blue-200 dark:border-blue-800">
              <h2 className="text-xl font-bold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
                <span>🏠</span>
                <span>{L('आयताकार कोठाको विभिन्न सतहहरूको क्षेत्रफल', 'Rectangular Room Surface Areas')}</span>
              </h2>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {L(
                  'कोठाको चार भित्ताको क्षेत्रफल = २h(l + b), भुइँको क्षेत्रफल = l × b, सिलिङको क्षेत्रफल = l × b। भित्तामा रङ लगाउँदा ढोका र झ्यालको क्षेत्रफल घटाइन्छ।',
                  'Four walls area = 2h(l + b), Floor = l × b, Ceiling = l × b. Doors and windows are subtracted when painting.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controls */}
              <div className="lg:col-span-5 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-4">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg border-b pb-2">
                  {L('कोठाको नाप (Dimensions in meters)', 'Room Dimensions')}
                </h3>

                {/* Length */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{L('लम्बाइ l (Length):', 'Length (l):')}</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{isNe ? toNp(lengthM) : lengthM} m</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="15"
                    step="0.5"
                    value={lengthM}
                    onChange={(e) => setLengthM(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                {/* Breadth */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{L('चौडाइ b (Breadth):', 'Breadth (b):')}</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{isNe ? toNp(breadthM) : breadthM} m</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="12"
                    step="0.5"
                    value={breadthM}
                    onChange={(e) => setBreadthM(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                {/* Height */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{L('उचाइ h (Height):', 'Height (h):')}</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{isNe ? toNp(heightM) : heightM} m</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="6"
                    step="0.2"
                    value={heightM}
                    onChange={(e) => setHeightM(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                {/* Openings Section */}
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-3 border border-gray-200 dark:border-gray-600">
                  <div className="font-bold text-xs uppercase tracking-wide text-gray-700 dark:text-gray-300">
                    {L('ढोका तथा झ्यालको विवरण (Openings)', 'Doors & Windows Details')}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-gray-600 dark:text-gray-400">{L('ढोका संख्या (Doors):', 'Door Count:')}</label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        value={doorCount}
                        onChange={(e) => setDoorCount(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-2 py-1 rounded border font-mono font-bold dark:bg-gray-700 dark:text-gray-100"
                      />
                      <div className="text-[10px] text-gray-500 mt-0.5">{doorWidth}m × {doorHeight}m</div>
                    </div>
                    <div>
                      <label className="text-gray-600 dark:text-gray-400">{L('झ्याल संख्या (Windows):', 'Window Count:')}</label>
                      <input
                        type="number"
                        min="0"
                        max="8"
                        value={windowCount}
                        onChange={(e) => setWindowCount(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-2 py-1 rounded border font-mono font-bold dark:bg-gray-700 dark:text-gray-100"
                      />
                      <div className="text-[10px] text-gray-500 mt-0.5">{windowWidth}m × {windowHeight}m</div>
                    </div>
                  </div>
                  <div className="text-xs text-red-600 dark:text-red-400 font-mono">
                    {L('घटाउनुपर्ने क्षेत्रफल (Doors + Windows):', 'Deductible Area:')} {isNe ? toNp(openingsArea.toFixed(2)) : openingsArea.toFixed(2)} m²
                  </div>
                </div>

                {/* Surface Highlight Filter */}
                <div>
                  <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                    {L('सतह छनोट गर्नुहोस् (Highlight Surface):', 'Highlight Surface:')}
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
                    <button
                      onClick={() => setHighlightSurface('all')}
                      className={`p-2 rounded-lg border ${highlightSurface === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-50 dark:bg-gray-700'}`}
                    >
                      {L('सबै', 'All')}
                    </button>
                    <button
                      onClick={() => setHighlightSurface('walls')}
                      className={`p-2 rounded-lg border ${highlightSurface === 'walls' ? 'bg-blue-600 text-white' : 'bg-gray-50 dark:bg-gray-700'}`}
                    >
                      {L('४ भित्ता', 'Walls')}
                    </button>
                    <button
                      onClick={() => setHighlightSurface('floor')}
                      className={`p-2 rounded-lg border ${highlightSurface === 'floor' ? 'bg-blue-600 text-white' : 'bg-gray-50 dark:bg-gray-700'}`}
                    >
                      {L('भुइँ', 'Floor')}
                    </button>
                    <button
                      onClick={() => setHighlightSurface('ceiling')}
                      className={`p-2 rounded-lg border ${highlightSurface === 'ceiling' ? 'bg-blue-600 text-white' : 'bg-gray-50 dark:bg-gray-700'}`}
                    >
                      {L('सिलिङ', 'Ceiling')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Isometric 3D Visual & Breakdown */}
              <div className="lg:col-span-7 space-y-4">
                {/* 3D Isometric SVG Room */}
                <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
                  <svg viewBox="0 0 460 260" className="w-full max-w-lg h-60">
                    {/* Isometric Floor (Greenish) */}
                    <polygon
                      points="230,190 380,130 230,70 80,130"
                      className={`transition-all duration-300 ${
                        highlightSurface === 'floor' || highlightSurface === 'all'
                          ? 'fill-amber-200/80 dark:fill-amber-800/40 stroke-amber-600 stroke-2'
                          : 'fill-gray-100 dark:fill-gray-800 stroke-gray-400 stroke-1'
                      }`}
                    />
                    <text x="230" y="135" textAnchor="middle" className="text-xs font-bold fill-amber-900 dark:fill-amber-200">
                      {L('भुइँ (Floor)', 'Floor')} = {isNe ? toNp(floorArea.toFixed(1)) : floorArea.toFixed(1)} m²
                    </text>

                    {/* Back Left Wall */}
                    <polygon
                      points="80,130 230,70 230,10 80,70"
                      className={`transition-all duration-300 ${
                        highlightSurface === 'walls' || highlightSurface === 'all'
                          ? 'fill-blue-200/70 dark:fill-blue-900/40 stroke-blue-500 stroke-2'
                          : 'fill-gray-200 dark:fill-gray-800 stroke-gray-400'
                      }`}
                    />

                    {/* Back Right Wall */}
                    <polygon
                      points="230,70 380,130 380,70 230,10"
                      className={`transition-all duration-300 ${
                        highlightSurface === 'walls' || highlightSurface === 'all'
                          ? 'fill-blue-300/70 dark:fill-blue-800/50 stroke-blue-600 stroke-2'
                          : 'fill-gray-300 dark:fill-gray-700 stroke-gray-400'
                      }`}
                    />

                    {/* Ceiling Wireframe / Highlight */}
                    <polygon
                      points="230,130 380,70 230,10 80,70"
                      className={`transition-all duration-300 fill-transparent stroke-dashed ${
                        highlightSurface === 'ceiling'
                          ? 'stroke-purple-600 stroke-2 fill-purple-200/40'
                          : 'stroke-gray-400/50 stroke-1'
                      }`}
                      strokeDasharray="4 4"
                    />

                    {/* Front Left Wall (Semi-transparent with Door) */}
                    <polygon
                      points="80,130 230,190 230,130 80,70"
                      className={`transition-all duration-300 ${
                        highlightSurface === 'walls' || highlightSurface === 'all'
                          ? 'fill-blue-100/40 dark:fill-blue-950/30 stroke-blue-400 stroke-1'
                          : 'fill-transparent stroke-gray-400 stroke-1'
                      }`}
                    />
                    {/* Door graphic */}
                    {doorCount > 0 && (
                      <rect x="130" y="115" width="22" height="42" className="fill-amber-700/80 stroke-amber-900 stroke-1" />
                    )}

                    {/* Front Right Wall (Semi-transparent with Window) */}
                    <polygon
                      points="230,190 380,130 380,70 230,130"
                      className={`transition-all duration-300 ${
                        highlightSurface === 'walls' || highlightSurface === 'all'
                          ? 'fill-blue-100/40 dark:fill-blue-950/30 stroke-blue-400 stroke-1'
                          : 'fill-transparent stroke-gray-400 stroke-1'
                      }`}
                    />
                    {/* Window graphic */}
                    {windowCount > 0 && (
                      <rect x="290" y="105" width="30" height="25" className="fill-cyan-200/90 stroke-cyan-600 stroke-1" />
                    )}

                    {/* Dimension Arrows & Text */}
                    <text x="140" y="175" className="text-xs font-bold fill-blue-700 dark:fill-blue-300">
                      l = {isNe ? toNp(lengthM) : lengthM}m
                    </text>
                    <text x="320" y="175" className="text-xs font-bold fill-blue-700 dark:fill-blue-300">
                      b = {isNe ? toNp(breadthM) : breadthM}m
                    </text>
                    <text x="60" y="105" className="text-xs font-bold fill-blue-700 dark:fill-blue-300">
                      h = {isNe ? toNp(heightM) : heightM}m
                    </text>
                  </svg>
                </div>

                {/* Calculation Cards */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500">{L('चार भित्ताको क्षेत्रफल [२h(l + b)]:', 'Four Walls Area:')}</div>
                    <div className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono mt-1">
                      {isNe ? toNp(fourWallsArea.toFixed(1)) : fourWallsArea.toFixed(1)} m²
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1">
                      २ × {heightM} × ({lengthM} + {breadthM})
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500">{L('भुइँको क्षेत्रफल [l × b]:', 'Floor Area:')}</div>
                    <div className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1">
                      {isNe ? toNp(floorArea.toFixed(1)) : floorArea.toFixed(1)} m²
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1">
                      {lengthM} × {breadthM}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500">{L('सिलिङको क्षेत्रफल [l × b]:', 'Ceiling Area:')}</div>
                    <div className="text-xl font-black text-purple-600 dark:text-purple-400 font-mono mt-1">
                      {isNe ? toNp(ceilingArea.toFixed(1)) : ceilingArea.toFixed(1)} m²
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1">
                      {lengthM} × {breadthM}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500">{L('ढोका र झ्याल बाहेक भित्ता:', 'Net Wall Area:')}</div>
                    <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                      {isNe ? toNp(netWallPaintArea.toFixed(1)) : netWallPaintArea.toFixed(1)} m²
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1">
                      {fourWallsArea.toFixed(1)} - {openingsArea.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cost' && (
          /* =========================================================================
             PAINTING & CARPET COST ESTIMATOR
             ========================================================================= */
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800">
              <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-200 mb-2 flex items-center gap-2">
                <span>🎨</span>
                <span>{L('कोठाको रङरोगन तथा भुइँमा कार्पेट बिछ्याउने लागत', 'Painting and Carpet Flooring Cost Estimate')}</span>
              </h2>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {L(
                  'रङ लगाउने कुल क्षेत्रफल = चार भित्ता (झ्याल-ढोका बाहेक) + सिलिङ। भुइँमा कार्पेटको क्षेत्रफल = l × b। लागत = क्षेत्रफल × प्रति वर्ग मिटर दर।',
                  'Total painting area = Net walls + Ceiling. Carpet area = Floor area (l × b). Cost = Area × Rate per sq. meter.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Cost Rate Inputs */}
              <div className="lg:col-span-5 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-4">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg border-b pb-2">
                  {L('प्रति वर्ग मिटर लागत दरहरू', 'Cost Rates per sq. meter')}
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    🎨 {L('भित्ता तथा सिलिङ रङरोगन दर (Painting Rate/m²):', 'Wall & Ceiling Paint Rate (Rs/m²):')}
                  </label>
                  <input
                    type="number"
                    step="10"
                    value={paintRatePerSqM}
                    onChange={(e) => setPaintRatePerSqM(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-lg border font-mono font-bold dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    🧶 {L('भुइँको कार्पेट बिछ्याउने दर (Carpet Rate/m²):', 'Floor Carpet Rate (Rs/m²):')}
                  </label>
                  <input
                    type="number"
                    step="20"
                    value={carpetRatePerSqM}
                    onChange={(e) => setCarpetRatePerSqM(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-lg border font-mono font-bold dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    🧱 {L('प्लाष्टर गर्ने दर (Plastering Rate/m²):', 'Plastering Rate (Rs/m²):')}
                  </label>
                  <input
                    type="number"
                    step="10"
                    value={plasterRatePerSqM}
                    onChange={(e) => setPlasterRatePerSqM(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-lg border font-mono font-bold dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
              </div>

              {/* Complete Cost Estimate Receipt */}
              <div className="lg:col-span-7 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 space-y-4">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg border-b pb-2">
                  {L('कुल लागत अनुमान बिल (Detailed Cost Invoice)', 'Estimated Budget Breakdown')}
                </h3>

                <div className="space-y-3 text-sm">
                  {/* Walls Paint */}
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-700">
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-gray-200">
                        {L('१. चार भित्ता रङरोगन (झ्याल/ढोका बाहेक):', '1. Four Walls Painting (Net):')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {netWallPaintArea.toFixed(1)} m² × रु. {paintRatePerSqM}
                      </div>
                    </div>
                    <span className="font-mono font-bold text-gray-900 dark:text-gray-100">
                      रु. {isNe ? toNp(wallPaintingCost) : wallPaintingCost.toLocaleString()}
                    </span>
                  </div>

                  {/* Ceiling Paint */}
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-700">
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-gray-200">
                        {L('२. सिलिङ रङरोगन (Ceiling Paint):', '2. Ceiling Painting:')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {ceilingArea.toFixed(1)} m² × रु. {paintRatePerSqM}
                      </div>
                    </div>
                    <span className="font-mono font-bold text-gray-900 dark:text-gray-100">
                      रु. {isNe ? toNp(ceilingPaintingCost) : ceilingPaintingCost.toLocaleString()}
                    </span>
                  </div>

                  {/* Carpet Flooring */}
                  <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-700">
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-gray-200">
                        {L('३. भुइँमा कार्पेट बिछ्याउने खर्च (Carpet):', '3. Carpet Flooring:')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {floorArea.toFixed(1)} m² × रु. {carpetRatePerSqM}
                      </div>
                    </div>
                    <span className="font-mono font-bold text-gray-900 dark:text-gray-100">
                      रु. {isNe ? toNp(carpetFlooringCost) : carpetFlooringCost.toLocaleString()}
                    </span>
                  </div>

                  {/* Total Cost */}
                  <div className="pt-4 flex justify-between items-center border-t-2 border-gray-800 dark:border-gray-200">
                    <div>
                      <div className="text-lg font-black text-gray-900 dark:text-gray-50">
                        {L('कुल मर्मत तथा सजावट खर्च:', 'Total Estimated Cost:')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {L('रङरोगन र कार्पेट दुवै समावेश', 'Includes both paint and carpeting')}
                      </div>
                    </div>
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                      रु. {isNe ? toNp(totalRenovationCost) : totalRenovationCost.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cubical' && (
          /* =========================================================================
             CUBICAL ROOM COMPARISON
             ========================================================================= */
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 p-5 rounded-2xl border border-amber-200 dark:border-amber-800">
              <h2 className="text-xl font-bold text-amber-900 dark:text-amber-200 mb-2 flex items-center gap-2">
                <span>📦</span>
                <span>{L('घनाकार कोठा (Cubical Room l = b = h = a)', 'Cubical Room Comparison')}</span>
              </h2>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {L(
                  'घनाकार कोठामा लम्बाइ, चौडाइ र उचाइ सबै बराबर हुन्छन् (l = b = h = a)। यसका चार भित्ताको क्षेत्रफल = ४a², भुइँ = a², र कुल सतहको क्षेत्रफल TSA = ६a² हुन्छ।',
                  'In a cubical room, length, breadth and height are equal (a). Four walls = 4a², Floor = a², and Total surface area = 6a².'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-4">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg border-b pb-2">
                  {L('घनाकार कोठाको भुजा (Edge a)', 'Cube Edge Length')}
                </h3>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{L('भुजाको लम्बाइ a:', 'Edge Length (a):')}</span>
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{isNe ? toNp(cubeSide) : cubeSide} m</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="10"
                    step="0.5"
                    value={cubeSide}
                    onChange={(e) => setCubeSide(parseFloat(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                </div>
              </div>

              <div className="lg:col-span-7 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-3 text-sm">
                <h4 className="font-bold text-gray-800 dark:text-gray-100 border-b pb-2">
                  {L('घनाकार कोठाका सूत्रहरू र हिसाब', 'Formulas & Calculations')}
                </h4>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl space-y-1">
                  <div className="font-bold text-amber-900 dark:text-amber-200">
                    {L('१. चार भित्ताको क्षेत्रफल = ४a²', '1. Four Walls Area = 4a²')}
                  </div>
                  <div className="font-mono text-sm text-amber-800 dark:text-amber-300">
                    ४ × {cubeSide}² = ४ × {cubeSide * cubeSide} = <strong>{isNe ? toNp(cubeFourWalls) : cubeFourWalls} m²</strong>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl space-y-1">
                  <div className="font-bold text-amber-900 dark:text-amber-200">
                    {L('२. भुइँ वा सिलिङको क्षेत्रफल = a²', '2. Floor or Ceiling = a²')}
                  </div>
                  <div className="font-mono text-sm text-amber-800 dark:text-amber-300">
                    {cubeSide}² = <strong>{isNe ? toNp(cubeFloor) : cubeFloor} m²</strong>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl space-y-1">
                  <div className="font-bold text-amber-900 dark:text-amber-200">
                    {L('३. कुल सतहको क्षेत्रफल (६ वटै सतह) = ६a²', '3. Total Surface Area (TSA) = 6a²')}
                  </div>
                  <div className="font-mono text-sm text-amber-800 dark:text-amber-300">
                    ६ × {cubeSide}² = ६ × {cubeSide * cubeSide} = <strong>{isNe ? toNp(cubeTSA) : cubeTSA} m²</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default RoomAreaPaintingCostSimulator;
