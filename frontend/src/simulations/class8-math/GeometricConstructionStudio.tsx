import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Compass, Ruler, Play, CheckCircle, RotateCcw, ArrowRight } from 'lucide-react';

type ConstructionType = 'rectangle' | 'square' | 'parallelogram_angle' | 'parallelogram_diagonal';

interface ConstructionModeInfo {
  id: ConstructionType;
  titleNp: string;
  titleEn: string;
  givenNp: string;
  givenEn: string;
  totalSteps: number;
  stepsNp: string[];
  stepsEn: string[];
}

const CONSTRUCTIONS: ConstructionModeInfo[] = [
  {
    id: 'rectangle',
    titleNp: 'आयतको रचना (Construction of Rectangle)',
    titleEn: 'Construction of Rectangle',
    givenNp: 'दिइएको: भुजा AB = ६ सेमी र AD = ४ सेमी',
    givenEn: 'Given: Adjacent sides AB = 6 cm and AD = 4 cm',
    totalSteps: 5,
    stepsNp: [
      '१. स्केलको सहायताले आधार रेखा खण्ड AB = ६ सेमी खिच्नुहोस्।',
      '२. बिन्दु A मा कम्पासले ९०° को कोण बनाउने रेखा खिच्नुहोस्।',
      '३. कम्पासलाई ४ सेमी फैलाई बिन्दु A बाट चाप काटी बिन्दु D पत्ता लगाउनुहोस् (AD = ४ सेमी)।',
      '४. बिन्दु B मा पनि ९०° को कोण बनाई ४ सेमीको चाप काटी बिन्दु C पत्ता लगाउनुहोस् (BC = ४ सेमी)।',
      '५. बिन्दु C र D लाई सीधा रेखाले जोड्नुहोस्। यसरी अभीष्ट आयत ABCD तयार हुन्छ।'
    ],
    stepsEn: [
      '1. Using a ruler, draw the base line segment AB = 6 cm.',
      '2. Using a compass, construct a 90° right angle at vertex A.',
      '3. With compass radius set to 4 cm, draw an arc from A to mark vertex D (AD = 4 cm).',
      '4. Construct a 90° angle at vertex B and cut an arc of 4 cm to mark vertex C (BC = 4 cm).',
      '5. Join vertices C and D with a straight segment. The required rectangle ABCD is formed!'
    ]
  },
  {
    id: 'square',
    titleNp: 'वर्गको रचना (Construction of Square)',
    titleEn: 'Construction of Square',
    givenNp: 'दिइएको: एउटा भुजा AB = ५ सेमी',
    givenEn: 'Given: One side AB = 5 cm',
    totalSteps: 4,
    stepsNp: [
      '१. स्केलले आधार रेखा खण्ड AB = ५ सेमी खिच्नुहोस्।',
      '२. बिन्दु A र B दुवैमा कम्पासको सहायताले ९०° का लम्ब रेखाहरू खिच्नुहोस्।',
      '३. कम्पासलाई ५ सेमी फैलाई A बाट चाप काटी D र B बाट चाप काटी C चिन्ह लगाउनुहोस्।',
      '४. बिन्दु C र D लाई सीधा रेखाले जोड्नुहोस्। चारै भुजा ५ सेमी भएको वर्ग ABCD तयार हुन्छ।'
    ],
    stepsEn: [
      '1. Using a ruler, draw base line segment AB = 5 cm.',
      '2. Construct perpendicular 90° rays at both vertices A and B using compass.',
      '3. With compass radius set to 5 cm, cut arcs from A to get D and from B to get C.',
      '4. Join vertices C and D. The required square ABCD of side 5 cm is complete!'
    ]
  },
  {
    id: 'parallelogram_angle',
    titleNp: 'समानान्तर चतुर्भुज: दुई भुजा र बीचको कोण',
    titleEn: 'Parallelogram: 2 Sides & Included Angle',
    givenNp: 'दिइएको: AB = ६ सेमी, AD = ४ सेमी र बीचको कोण ∠A = ६०°',
    givenEn: 'Given: AB = 6 cm, AD = 4 cm, and included angle ∠A = 60°',
    totalSteps: 5,
    stepsNp: [
      '१. आधार रेखा खण्ड AB = ६ सेमी खिच्नुहोस्।',
      '२. बिन्दु A मा कम्पासले ६०° को कोण बनाउने किरण AX खिच्नुहोस्।',
      '३. किरण AX मा कम्पासले ४ सेमीको चाप काटी शीर्षबिन्दु D पत्ता लगाउनुहोस् (AD = ४ सेमी)।',
      '४. बिन्दु D बाट ६ सेमीको चाप र बिन्दु B बाट ४ सेमीको चाप खिच्दा आपसमा काटिने बिन्दु C पत्ता लगाउनुहोस्।',
      '५. BC र CD जोड्नुहोस्। अभीष्ट समानान्तर चतुर्भुज ABCD तयार भयो।'
    ],
    stepsEn: [
      '1. Draw the base segment AB = 6 cm.',
      '2. Using a compass, construct an included angle of 60° at vertex A (ray AX).',
      '3. Cut an arc of 4 cm on ray AX from A to determine vertex D (AD = 4 cm).',
      '4. From vertex D draw an arc of radius 6 cm, and from B draw an arc of radius 4 cm to intersect at C.',
      '5. Join BC and CD. The required parallelogram ABCD is constructed!'
    ]
  },
  {
    id: 'parallelogram_diagonal',
    titleNp: 'समानान्तर चतुर्भुज: दुई भुजा र विकर्ण',
    titleEn: 'Parallelogram: 2 Sides & 1 Diagonal',
    givenNp: 'दिइएको: AB = ६ सेमी, BC = ४ सेमी र विकर्ण AC = ८ सेमी',
    givenEn: 'Given: AB = 6 cm, BC = 4 cm, and diagonal AC = 8 cm',
    totalSteps: 5,
    stepsNp: [
      '१. आधार रेखा खण्ड AB = ६ सेमी खिच्नुहोस्।',
      '२. बिन्दु A बाट ८ सेमीको चाप र बिन्दु B बाट ४ सेमीको चाप खिची काटिएको बिन्दु C पत्ता लगाउनुहोस् (त्रिभुज ABC बन्यो)।',
      '३. समानान्तर चतुर्भुजको सम्मुख भुजा बराबर हुने भएकाले CD = ६ सेमी र AD = ४ सेमी हुन्छ।',
      '४. बिन्दु C बाट ६ सेमीको चाप र बिन्दु A बाट ४ सेमीको चाप खिची प्रतिच्छेदन बिन्दु D पत्ता लगाउनुहोस्।',
      '५. AD र CD लाई जोड्नुहोस्। अभीष्ट समानान्तर चतुर्भुज ABCD तयार भयो।'
    ],
    stepsEn: [
      '1. Draw the base line segment AB = 6 cm.',
      '2. From A draw an arc of 8 cm and from B draw an arc of 4 cm to intersect at C (forming triangle ABC).',
      '3. Since opposite sides are equal: CD = 6 cm and AD = 4 cm.',
      '4. From C draw an arc of 6 cm and from A draw an arc of 4 cm intersecting at vertex D.',
      '5. Join segments AD and CD. The required parallelogram ABCD is complete!'
    ]
  }
];

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'आयत (Rectangle) रचना गर्दा प्रत्येक भित्री कोण कति डिग्रीको बनाउनुपर्छ?',
    en: 'When constructing a rectangle, what measure must each interior angle have?',
    options: [
      { key: 'A', label: '४५°' },
      { key: 'B', label: '६०°' },
      { key: 'C', label: '९०° (Right Angle)' },
      { key: 'D', label: '१२०°' },
    ],
    answer: 'C',
  },
  {
    np: 'समानान्तर चतुर्भुज (Parallelogram) का सम्मुख भुजाहरू कस्ता हुन्छन्?',
    en: 'What is true about the opposite sides of a parallelogram?',
    options: [
      { key: 'A', label: 'बराबर र समानान्तर दुवै हुन्छन् (Both equal and parallel)' },
      { key: 'B', label: 'असमान हुन्छन्' },
      { key: 'C', label: 'लम्ब मात्र हुन्छन्' },
      { key: 'D', label: 'काटिन्छन्' },
    ],
    answer: 'A',
  },
  {
    np: 'कम्पासको सहायताले ६०° को कोण बनाउँदा पहिलो चापको अर्धव्यास कति हुनुपर्छ?',
    en: 'When constructing a 60° angle using a compass, what must be true about the cutting arc radius?',
    options: [
      { key: 'A', label: 'सुरुको चापकै बराबर अर्धव्यास (Same radius as the initial arc)' },
      { key: 'B', label: 'दोब्बर हुनुपर्छ' },
      { key: 'C', label: 'आधा हुनुपर्छ' },
      { key: 'D', label: 'जति भए पनि हुन्छ' },
    ],
    answer: 'A',
  }
];

export const GeometricConstructionStudio: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U14-02',
    chapter: 14,
    titleNp: 'ज्यामितीय रचना स्टुडियो (Geometric Construction Studio)',
    titleEn: 'Geometric Construction Studio',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeMode, setActiveMode] = useState<ConstructionType>('rectangle');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showRuler, setShowRuler] = useState<boolean>(true);
  const [showCompassArcs, setShowCompassArcs] = useState<boolean>(true);

  const activeConstruction = CONSTRUCTIONS.find((c) => c.id === activeMode) || CONSTRUCTIONS[0];

  const handleNextStep = () => {
    if (currentStep < activeConstruction.totalSteps) {
      setCurrentStep((s) => s + 1);
      kit.good();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! कम्पास, स्केल र चाँदाको सहायताले आयत, वर्ग र समानान्तर चतुर्भुजको चरणबद्ध रचना सिक्नुहोस्!',
        'Hello! Learn step-by-step geometric construction of rectangles, squares, and parallelograms using ruler and compass!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Mode Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CONSTRUCTIONS.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setActiveMode(c.id);
                setCurrentStep(1);
              }}
              className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all ${
                activeMode === c.id
                  ? 'bg-amber-500/20 border-amber-400 text-white shadow-md shadow-amber-500/10'
                  : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="text-amber-300">{isNe ? c.titleNp : c.titleEn}</div>
            </button>
          ))}
        </div>

        {/* Given Statement & Tools Toggle */}
        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase font-bold text-amber-400 tracking-wider">
              {isNe ? activeConstruction.titleNp : activeConstruction.titleEn}
            </div>
            <p className="text-sm text-slate-200 font-semibold mt-1">
              {isNe ? activeConstruction.givenNp : activeConstruction.givenEn}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRuler(!showRuler)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${
                showRuler ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              <Ruler size={14} />
              {showRuler ? L('स्केल देखाउनुहोस्', 'Hide Ruler') : L('स्केल लुकाउनुहोस्', 'Show Ruler')}
            </button>
            <button
              onClick={() => setShowCompassArcs(!showCompassArcs)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${
                showCompassArcs ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              <Compass size={14} />
              {showCompassArcs ? L('चाप (Arcs) लुकाउनुहोस्', 'Hide Arcs') : L('चाप (Arcs) देखाउनुहोस्', 'Show Arcs')}
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 flex items-center gap-1"
            >
              <RotateCcw size={14} />
              {L('सुरुदेखि (Reset)', 'Reset')}
            </button>
          </div>
        </div>

        {/* Interactive Construction SVG Canvas */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-center">
          <svg viewBox="0 0 500 300" className="w-full max-w-2xl h-72 select-none">
            <defs>
              <pattern id="gridConst" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="500" height="300" fill="url(#gridConst)" />

            {/* Scale background ruler on the bottom if enabled */}
            {showRuler && (
              <g transform="translate(70, 260)">
                <rect x="0" y="0" width="360" height="20" fill="#334155" rx="3" />
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((cm) => (
                  <g key={cm} transform={`translate(${cm * 40}, 0)`}>
                    <line x1="0" y1="0" x2="0" y2="12" stroke="#e2e8f0" strokeWidth="1.5" />
                    <text x="2" y="16" fill="#e2e8f0" fontSize="9" fontWeight="bold">
                      {cm}
                    </text>
                  </g>
                ))}
              </g>
            )}

            {/* RECTANGLE CONSTRUCTION (AB = 6cm [240px], AD = 4cm [160px]) */}
            {activeMode === 'rectangle' && (
              <g>
                {/* Step 1: Base AB */}
                {currentStep >= 1 && (
                  <g>
                    <line x1="100" y1="220" x2="340" y2="220" stroke="#38bdf8" strokeWidth="3" />
                    <circle cx="100" cy="220" r="4" fill="#38bdf8" />
                    <circle cx="340" cy="220" r="4" fill="#38bdf8" />
                    <text x="85" y="235" fill="#38bdf8" fontSize="13" fontWeight="bold">A</text>
                    <text x="345" y="235" fill="#38bdf8" fontSize="13" fontWeight="bold">B</text>
                    <text x="220" y="240" fill="#94a3b8" fontSize="11" textAnchor="middle">6 cm (६ सेमी)</text>
                  </g>
                )}

                {/* Step 2: 90 deg ray at A */}
                {currentStep >= 2 && (
                  <g>
                    <line x1="100" y1="220" x2="100" y2="40" stroke="#f43f5e" strokeWidth="2" strokeDasharray="5 3" />
                    {showCompassArcs && (
                      <g>
                        <path d="M 125 220 A 25 25 0 0 0 75 220" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
                        <path d="M 112 198 A 25 25 0 0 1 100 175" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
                      </g>
                    )}
                    <rect x="100" y="205" width="15" height="15" fill="none" stroke="#f43f5e" strokeWidth="1.5" />
                    <text x="65" y="200" fill="#f43f5e" fontSize="11">90°</text>
                  </g>
                )}

                {/* Step 3: Mark AD = 4cm */}
                {currentStep >= 3 && (
                  <g>
                    {showCompassArcs && (
                      <path d="M 85 60 A 30 30 0 0 1 115 60" fill="none" stroke="#22c55e" strokeWidth="2" />
                    )}
                    <line x1="100" y1="220" x2="100" y2="60" stroke="#38bdf8" strokeWidth="3" />
                    <circle cx="100" cy="60" r="4" fill="#22c55e" />
                    <text x="80" y="60" fill="#22c55e" fontSize="13" fontWeight="bold">D</text>
                    <text x="75" y="145" fill="#94a3b8" fontSize="11">4 cm</text>
                  </g>
                )}

                {/* Step 4: 90 deg ray at B & Mark BC = 4cm */}
                {currentStep >= 4 && (
                  <g>
                    <line x1="340" y1="220" x2="340" y2="60" stroke="#38bdf8" strokeWidth="3" />
                    {showCompassArcs && (
                      <path d="M 325 60 A 30 30 0 0 1 355 60" fill="none" stroke="#22c55e" strokeWidth="2" />
                    )}
                    <rect x="325" y="205" width="15" height="15" fill="none" stroke="#f43f5e" strokeWidth="1.5" />
                    <circle cx="340" cy="60" r="4" fill="#22c55e" />
                    <text x="350" y="60" fill="#22c55e" fontSize="13" fontWeight="bold">C</text>
                    <text x="350" y="145" fill="#94a3b8" fontSize="11">4 cm</text>
                  </g>
                )}

                {/* Step 5: Join CD */}
                {currentStep >= 5 && (
                  <g>
                    <line x1="100" y1="60" x2="340" y2="60" stroke="#38bdf8" strokeWidth="3" />
                    <polygon points="100,220 340,220 340,60 100,60" fill="rgba(56, 189, 248, 0.15)" />
                    <text x="220" y="50" fill="#94a3b8" fontSize="11" textAnchor="middle">6 cm</text>
                    <text x="220" y="145" fill="#22c55e" fontSize="14" fontWeight="bold" textAnchor="middle">
                      ✅ अभीष्ट आयत ABCD (Rectangle ABCD)
                    </text>
                  </g>
                )}
              </g>
            )}

            {/* SQUARE CONSTRUCTION (Side AB = 5cm [200px]) */}
            {activeMode === 'square' && (
              <g>
                {/* Step 1: Base AB = 5cm */}
                {currentStep >= 1 && (
                  <g>
                    <line x1="130" y1="220" x2="330" y2="220" stroke="#f59e0b" strokeWidth="3" />
                    <circle cx="130" cy="220" r="4" fill="#f59e0b" />
                    <circle cx="330" cy="220" r="4" fill="#f59e0b" />
                    <text x="115" y="235" fill="#f59e0b" fontSize="13" fontWeight="bold">A</text>
                    <text x="335" y="235" fill="#f59e0b" fontSize="13" fontWeight="bold">B</text>
                    <text x="230" y="240" fill="#94a3b8" fontSize="11" textAnchor="middle">5 cm</text>
                  </g>
                )}

                {/* Step 2: 90 deg rays at A and B */}
                {currentStep >= 2 && (
                  <g>
                    <line x1="130" y1="220" x2="130" y2="20" stroke="#f43f5e" strokeWidth="2" strokeDasharray="5 3" />
                    <line x1="330" y1="220" x2="330" y2="20" stroke="#f43f5e" strokeWidth="2" strokeDasharray="5 3" />
                    <rect x="130" y="205" width="15" height="15" fill="none" stroke="#f43f5e" strokeWidth="1.5" />
                    <rect x="315" y="205" width="15" height="15" fill="none" stroke="#f43f5e" strokeWidth="1.5" />
                  </g>
                )}

                {/* Step 3: Cut 5cm arcs */}
                {currentStep >= 3 && (
                  <g>
                    <path d="M 115 20 A 30 30 0 0 1 145 20" fill="none" stroke="#22c55e" strokeWidth="2" />
                    <path d="M 315 20 A 30 30 0 0 1 345 20" fill="none" stroke="#22c55e" strokeWidth="2" />
                    <line x1="130" y1="220" x2="130" y2="20" stroke="#f59e0b" strokeWidth="3" />
                    <line x1="330" y1="220" x2="330" y2="20" stroke="#f59e0b" strokeWidth="3" />
                    <circle cx="130" cy="20" r="4" fill="#22c55e" />
                    <circle cx="330" cy="20" r="4" fill="#22c55e" />
                    <text x="110" y="20" fill="#22c55e" fontSize="13" fontWeight="bold">D</text>
                    <text x="340" y="20" fill="#22c55e" fontSize="13" fontWeight="bold">C</text>
                  </g>
                )}

                {/* Step 4: Join CD */}
                {currentStep >= 4 && (
                  <g>
                    <line x1="130" y1="20" x2="330" y2="20" stroke="#f59e0b" strokeWidth="3" />
                    <polygon points="130,220 330,220 330,20 130,20" fill="rgba(245, 158, 11, 0.15)" />
                    <text x="230" y="125" fill="#22c55e" fontSize="14" fontWeight="bold" textAnchor="middle">
                      ✅ अभीष्ट वर्ग ABCD (Square ABCD)
                    </text>
                  </g>
                )}
              </g>
            )}

            {/* PARALLELOGRAM WITH INCLUDED ANGLE (AB = 6cm, AD = 4cm, Angle = 60) */}
            {activeMode === 'parallelogram_angle' && (
              <g>
                {/* Step 1: Base AB */}
                {currentStep >= 1 && (
                  <g>
                    <line x1="80" y1="220" x2="320" y2="220" stroke="#a855f7" strokeWidth="3" />
                    <circle cx="80" cy="220" r="4" fill="#a855f7" />
                    <circle cx="320" cy="220" r="4" fill="#a855f7" />
                    <text x="65" y="235" fill="#a855f7" fontSize="13" fontWeight="bold">A</text>
                    <text x="325" y="235" fill="#a855f7" fontSize="13" fontWeight="bold">B</text>
                    <text x="200" y="240" fill="#94a3b8" fontSize="11" textAnchor="middle">6 cm</text>
                  </g>
                )}

                {/* Step 2: 60 deg Ray AX */}
                {currentStep >= 2 && (
                  <g>
                    <line x1="80" y1="220" x2="200" y2="40" stroke="#f43f5e" strokeWidth="2" strokeDasharray="5 3" />
                    {showCompassArcs && (
                      <path d="M 115 220 A 35 35 0 0 0 98 190" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
                    )}
                    <text x="120" y="205" fill="#f43f5e" fontSize="11">60°</text>
                  </g>
                )}

                {/* Step 3: Mark AD = 4cm (80px * 2 = 160px at 60 deg -> dx=80, dy=138.5) */}
                {currentStep >= 3 && (
                  <g>
                    {showCompassArcs && (
                      <path d="M 150 75 A 30 30 0 0 1 170 85" fill="none" stroke="#22c55e" strokeWidth="2" />
                    )}
                    <line x1="80" y1="220" x2="160" y2="81.5" stroke="#a855f7" strokeWidth="3" />
                    <circle cx="160" cy="81.5" r="4" fill="#22c55e" />
                    <text x="145" y="75" fill="#22c55e" fontSize="13" fontWeight="bold">D</text>
                    <text x="100" y="145" fill="#94a3b8" fontSize="11">4 cm</text>
                  </g>
                )}

                {/* Step 4: Arc from D (6cm) and from B (4cm) to get C (400, 81.5) */}
                {currentStep >= 4 && (
                  <g>
                    {showCompassArcs && (
                      <g>
                        <path d="M 385 70 A 40 40 0 0 1 415 90" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
                        <path d="M 390 95 A 40 40 0 0 1 410 70" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
                      </g>
                    )}
                    <circle cx="400" cy="81.5" r="4" fill="#22c55e" />
                    <text x="410" y="80" fill="#22c55e" fontSize="13" fontWeight="bold">C</text>
                  </g>
                )}

                {/* Step 5: Complete Parallelogram */}
                {currentStep >= 5 && (
                  <g>
                    <line x1="160" y1="81.5" x2="400" y2="81.5" stroke="#a855f7" strokeWidth="3" />
                    <line x1="320" y1="220" x2="400" y2="81.5" stroke="#a855f7" strokeWidth="3" />
                    <polygon points="80,220 320,220 400,81.5 160,81.5" fill="rgba(168, 85, 247, 0.15)" />
                    <text x="260" y="160" fill="#22c55e" fontSize="14" fontWeight="bold" textAnchor="middle">
                      ✅ समानान्तर चतुर्भुज ABCD (Parallelogram ABCD)
                    </text>
                  </g>
                )}
              </g>
            )}

            {/* PARALLELOGRAM WITH DIAGONAL (AB = 6cm, BC = 4cm, Diagonal AC = 8cm) */}
            {activeMode === 'parallelogram_diagonal' && (
              <g>
                {/* Step 1: Base AB */}
                {currentStep >= 1 && (
                  <g>
                    <line x1="80" y1="220" x2="320" y2="220" stroke="#06b6d4" strokeWidth="3" />
                    <circle cx="80" cy="220" r="4" fill="#06b6d4" />
                    <circle cx="320" cy="220" r="4" fill="#06b6d4" />
                    <text x="65" y="235" fill="#06b6d4" fontSize="13" fontWeight="bold">A</text>
                    <text x="325" y="235" fill="#06b6d4" fontSize="13" fontWeight="bold">B</text>
                    <text x="200" y="240" fill="#94a3b8" fontSize="11" textAnchor="middle">6 cm</text>
                  </g>
                )}

                {/* Step 2: Arc from A (8cm) and B (4cm) to form C (360, 90) */}
                {currentStep >= 2 && (
                  <g>
                    {showCompassArcs && (
                      <g>
                        <path d="M 345 80 A 50 50 0 0 1 375 100" fill="none" stroke="#f59e0b" strokeWidth="2" />
                        <path d="M 350 105 A 40 40 0 0 1 370 75" fill="none" stroke="#38bdf8" strokeWidth="2" />
                      </g>
                    )}
                    <line x1="80" y1="220" x2="360" y2="90" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5 3" />
                    <line x1="320" y1="220" x2="360" y2="90" stroke="#06b6d4" strokeWidth="3" />
                    <circle cx="360" cy="90" r="4" fill="#22c55e" />
                    <text x="370" y="90" fill="#22c55e" fontSize="13" fontWeight="bold">C</text>
                    <text x="210" y="145" fill="#f59e0b" fontSize="11">विकर्ण AC = 8 cm</text>
                  </g>
                )}

                {/* Step 3 & 4: Arc from C (6cm) and A (4cm) to form D (120, 90) */}
                {currentStep >= 3 && (
                  <g>
                    {showCompassArcs && (
                      <g>
                        <path d="M 105 80 A 30 30 0 0 1 135 100" fill="none" stroke="#a855f7" strokeWidth="1.5" />
                        <path d="M 110 105 A 30 30 0 0 1 130 75" fill="none" stroke="#22c55e" strokeWidth="1.5" />
                      </g>
                    )}
                    <circle cx="120" cy="90" r="4" fill="#22c55e" />
                    <text x="105" y="85" fill="#22c55e" fontSize="13" fontWeight="bold">D</text>
                  </g>
                )}

                {/* Step 5: Join AD and CD */}
                {currentStep >= 4 && (
                  <g>
                    <line x1="80" y1="220" x2="120" y2="90" stroke="#06b6d4" strokeWidth="3" />
                    <line x1="120" y1="90" x2="360" y2="90" stroke="#06b6d4" strokeWidth="3" />
                    <polygon points="80,220 320,220 360,90 120,90" fill="rgba(6, 182, 212, 0.15)" />
                    <text x="240" y="170" fill="#22c55e" fontSize="14" fontWeight="bold" textAnchor="middle">
                      ✅ समानान्तर चतुर्भुज ABCD
                    </text>
                  </g>
                )}
              </g>
            )}
          </svg>
        </div>

        {/* Step-by-Step Instruction & Control Bar */}
        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center justify-center font-bold text-sm">
              {currentStep}/{activeConstruction.totalSteps}
            </div>
            <div className="text-sm text-slate-100 font-semibold max-w-xl">
              {isNe ? activeConstruction.stepsNp[currentStep - 1] : activeConstruction.stepsEn[currentStep - 1]}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentStep === 1}
              onClick={handlePrevStep}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold text-slate-300"
            >
              {L('अघिल्लो चरण', 'Previous')}
            </button>
            <button
              disabled={currentStep >= activeConstruction.totalSteps}
              onClick={handleNextStep}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-xs font-bold text-white shadow-lg shadow-amber-600/30 flex items-center gap-1.5"
            >
              <span>{L('अर्को चरण', 'Next Step')}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};
export default GeometricConstructionStudio;
