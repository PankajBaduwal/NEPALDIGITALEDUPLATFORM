/**
 * TriangleConstructionWorkshop.tsx
 * Grade 7 Mathematics – Lesson 14: PLANE FIGURES
 * Simulation 1: Triangle Construction Workshop
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 205-212)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Play, RotateCcw, ArrowRight, Check, Compass } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'त्रिभुजका तीनवटै भित्री कोणहरूको योगफल कति हुन्छ?',
    en: 'What is the sum of the three interior angles of any triangle?',
    options: [
      { key: 'A', label: '180°' },
      { key: 'B', label: '90°' },
      { key: 'C', label: '360°' },
      { key: 'D', label: '270°' },
    ],
    answer: 'A',
  },
  {
    np: 'दुई भुजा र तिनीहरू बीचको कोण (SAS) दिइएको अवस्थामा त्रिभुज रचना गर्दा सुरुमा के खिचिन्छ?',
    en: 'When constructing a triangle given two sides and an included angle (SAS), what is drawn first?',
    options: [
      { key: 'A', label: 'Base side' },
      { key: 'B', label: 'Vertex' },
      { key: 'C', label: 'Upper arc' },
      { key: 'D', label: 'Midpoint' },
    ],
    answer: 'A',
  },
  {
    np: 'तीन भुजाको लम्बाइ दिइएको अवस्थामा (SSS), कुन ज्यामितीय उपकरण प्रयोग गरेर दुवै शीर्षबाट चाप काटिन्छ?',
    en: 'When three sides are given (SSS), which instrument is used to draw intersecting arcs from the vertices?',
    options: [
      { key: 'A', label: 'Compass and ruler' },
      { key: 'B', label: 'Protractor only' },
      { key: 'C', label: 'Eraser' },
      { key: 'D', label: 'Pencil only' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि त्रिभुजका दुई कोणहरू 45° र 75° छन् भने तेस्रो कोण कति हुन्छ?',
    en: 'If two angles of a triangle are 45° and 75°, what is the third angle?',
    options: [
      { key: 'A', label: '60° (180° - 120°)' },
      { key: 'B', label: '50°' },
      { key: 'C', label: '70°' },
      { key: 'D', label: '80°' },
    ],
    answer: 'A',
  },
];

type ConstructionCase = 'sas' | 'asa' | 'sss' | 'aas';

export const TriangleConstructionWorkshop: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L14-01',
    chapter: 14,
    titleNp: 'त्रिभुज रचना कार्यशाला (Triangle Construction Workshop)',
    titleEn: 'Triangle Construction Workshop',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [cCase, setCCase] = useState<ConstructionCase>('sas');
  const [step, setStep] = useState<number>(1);

  const getStepCount = () => 4;

  const handleNextStep = () => {
    if (step < getStepCount()) {
      setStep(step + 1);
    }
  };

  const handleReset = () => {
    setStep(1);
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते विद्यार्थीहरू! पाठ्यपुस्तकका 4 वटै त्रिभुज रचना विधिहरू (SAS, ASA, SSS, AAS) चरणबद्ध रूपमा अभ्यास गरौँ!',
        'Hello students! Explore all 4 official triangle construction methods (SAS, ASA, SSS, AAS) step-by-step!'
      )}
    >
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Case Selection */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-indigo-50/80 p-2 rounded-2xl border border-indigo-200">
          {[
            { id: 'sas', np: 'केस 1: दुई भुजा र बीचको कोण (SAS)', en: 'Case 1: SAS (Two Sides & Angle)' },
            { id: 'asa', np: 'केस 2: एक भुजा र दुई कोण (ASA)', en: 'Case 2: ASA (One Side & Two Angles)' },
            { id: 'sss', np: 'केस 3: तीनवटै भुजा (SSS)', en: 'Case 3: SSS (Three Sides Given)' },
            { id: 'aas', np: 'केस 4: एक भुजा र विपरित कोण (AAS)', en: 'Case 4: AAS / Two Angles' },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setCCase(c.id as ConstructionCase);
                setStep(1);
              }}
              className={`p-3 rounded-xl font-bold text-xs transition-all ${
                cCase === c.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-indigo-100'
              }`}
            >
              {isNe ? c.np : c.en}
            </button>
          ))}
        </div>

        {/* Construction Canvas & Stepper */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
          {/* Header Description */}
          <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-200">
            <h3 className="text-base font-bold text-indigo-950" style={{ fontFamily: FONT_NP }}>
              {cCase === 'sas' &&
                L(
                  'उदाहरण 1 (SAS): △PQR रचना गर्नुहोस् जहाँ PQ = 5.6 cm, QR = 4.5 cm र ∠PQR = 60° छन्।',
                  'Example 1 (SAS): Construct △PQR where PQ = 5.6 cm, QR = 4.5 cm and ∠PQR = 60°.'
                )}
              {cCase === 'asa' &&
                L(
                  'उदाहरण 2 (ASA): △ABC रचना गर्नुहोस् जहाँ AB = 5.2 cm, ∠A = 75° र ∠B = 60° छन्।',
                  'Example 2 (ASA): Construct △ABC where AB = 5.2 cm, ∠A = 75° and ∠B = 60°.'
                )}
              {cCase === 'sss' &&
                L(
                  'उदाहरण 3 (SSS): △ABC रचना गर्नुहोस् जहाँ AB = 4.5 cm, BC = 5 cm र CA = 6.5 cm छन्।',
                  'Example 3 (SSS): Construct △ABC where AB = 4.5 cm, BC = 5 cm and CA = 6.5 cm.'
                )}
              {cCase === 'aas' &&
                L(
                  'उदाहरण 4 (AAS): △XYZ रचना गर्नुहोस् जहाँ XY = 5 cm, ∠X = 45° र ∠Z = 75° छन्। (∠Y = 180° - 120° = 60°)',
                  'Example 4 (AAS): Construct △XYZ where XY = 5 cm, ∠X = 45° and ∠Z = 75° (so ∠Y = 60°).'
                )}
            </h3>
          </div>

          {/* SVG Construction Visual */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center">
            <svg width="420" height="260" viewBox="0 0 420 260">
              {/* Common Baseline Coordinates: P(60, 200) -> Q(300, 200) */}
              {/* Step 1: Base Line */}
              {step >= 1 && (
                <>
                  <line x1="60" y1="200" x2="300" y2="200" stroke="#1e293b" strokeWidth="3" />
                  <circle cx="60" cy="200" r="4" fill="#2563eb" />
                  <circle cx="300" cy="200" r="4" fill="#2563eb" />

                  {cCase === 'sas' && (
                    <>
                      <text x="50" y="220" fontSize="13" fontWeight="bold">P</text>
                      <text x="300" y="220" fontSize="13" fontWeight="bold">Q</text>
                      <text x="160" y="220" fontSize="12" fill="#2563eb" fontWeight="bold">PQ = 5.6 cm</text>
                    </>
                  )}
                  {cCase === 'asa' && (
                    <>
                      <text x="50" y="220" fontSize="13" fontWeight="bold">A</text>
                      <text x="300" y="220" fontSize="13" fontWeight="bold">B</text>
                      <text x="160" y="220" fontSize="12" fill="#2563eb" fontWeight="bold">AB = 5.2 cm</text>
                    </>
                  )}
                  {cCase === 'sss' && (
                    <>
                      <text x="50" y="220" fontSize="13" fontWeight="bold">B</text>
                      <text x="300" y="220" fontSize="13" fontWeight="bold">C</text>
                      <text x="160" y="220" fontSize="12" fill="#2563eb" fontWeight="bold">BC = 5.0 cm</text>
                    </>
                  )}
                  {cCase === 'aas' && (
                    <>
                      <text x="50" y="220" fontSize="13" fontWeight="bold">X</text>
                      <text x="300" y="220" fontSize="13" fontWeight="bold">Y</text>
                      <text x="160" y="220" fontSize="12" fill="#2563eb" fontWeight="bold">XY = 5.0 cm</text>
                    </>
                  )}
                </>
              )}

              {/* Step 2: Angles or First Arc */}
              {step >= 2 && (
                <>
                  {cCase === 'sas' && (
                    <>
                      {/* 60 deg angle at Q toward left */}
                      {/* Q is at (300, 200). 60 deg ray goes up-left: dx = -180*cos(60) = -90, dy = -180*sin(60) = -155.88 */}
                      <line x1="300" y1="200" x2="200" y2="40" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4" />
                      {/* Arc at Q */}
                      <path d="M 270 200 A 30 30 0 0 0 285 174" fill="none" stroke="#f59e0b" strokeWidth="2" />
                      <text x="250" y="185" fontSize="11" fontWeight="bold" fill="#b45309">60°</text>
                    </>
                  )}
                  {cCase === 'asa' && (
                    <>
                      {/* Angle at A = 75° */}
                      <line x1="60" y1="200" x2="110" y2="30" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4" />
                      <path d="M 90 200 A 30 30 0 0 0 68 171" fill="none" stroke="#f59e0b" strokeWidth="2" />
                      <text x="75" y="185" fontSize="11" fontWeight="bold" fill="#b45309">75°</text>
                    </>
                  )}
                  {cCase === 'sss' && (
                    <>
                      {/* Compass arc from B with radius 4.5 cm (approx 150px) */}
                      <path d="M 120 70 A 150 150 0 0 1 180 60" fill="none" stroke="#6366f1" strokeWidth="2.5" />
                      <text x="80" y="65" fontSize="11" fill="#4f46e5" fontWeight="bold">चाप r = 4.5 cm (Arc)</text>
                    </>
                  )}
                  {cCase === 'aas' && (
                    <>
                      {/* 45 deg angle ray from X */}
                      <line x1="60" y1="200" x2="220" y2="40" stroke="#0ea5e9" strokeWidth="2" strokeDasharray="4" />
                      <text x="90" y="185" fontSize="11" fontWeight="bold" fill="#0284c7">45°</text>
                    </>
                  )}
                </>
              )}

              {/* Step 3: Second Arm cut / Second Angle / Intersecting Arc */}
              {step >= 3 && (
                <>
                  {cCase === 'sas' && (
                    <>
                      {/* Cut QR = 4.5 cm at R (approx 140px along the 60 deg line): Rx = 300 - 140*cos(60) = 230, Ry = 200 - 140*sin(60) = 78 */}
                      <circle cx="230" cy="78.7" r="4" fill="#ef4444" />
                      <text x="235" y="75" fontSize="13" fontWeight="bold" fill="#ef4444">R</text>
                      <text x="270" y="130" fontSize="11" fontWeight="bold" fill="#b45309">QR = 4.5 cm</text>
                      {/* Compass cross mark */}
                      <line x1="225" y1="73" x2="235" y2="85" stroke="#ef4444" strokeWidth="2" />
                    </>
                  )}
                  {cCase === 'asa' && (
                    <>
                      {/* Angle at B = 60° pointing left */}
                      <line x1="300" y1="200" x2="160" y2="30" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="4" />
                      <text x="250" y="185" fontSize="11" fontWeight="bold" fill="#6d28d9">60°</text>
                      {/* Intersection C at around (102, 60) */}
                      <circle cx="102" cy="58" r="4" fill="#ef4444" />
                      <text x="95" y="50" fontSize="13" fontWeight="bold" fill="#ef4444">C</text>
                    </>
                  )}
                  {cCase === 'sss' && (
                    <>
                      {/* Compass arc from C with radius 6.5 cm (approx 190px) intersecting at A */}
                      <path d="M 130 50 A 190 190 0 0 0 160 90" fill="none" stroke="#ec4899" strokeWidth="2.5" />
                      <circle cx="145" cy="65" r="4" fill="#ef4444" />
                      <text x="140" y="55" fontSize="13" fontWeight="bold" fill="#ef4444">A</text>
                      <text x="210" y="65" fontSize="11" fill="#db2777" fontWeight="bold">चाप r = 6.5 cm</text>
                    </>
                  )}
                  {cCase === 'aas' && (
                    <>
                      {/* 60 deg angle ray from Y intersecting at Z */}
                      <line x1="300" y1="200" x2="150" y2="30" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4" />
                      <text x="250" y="185" fontSize="11" fontWeight="bold" fill="#b45309">∠Y = 60°</text>
                      <circle cx="185" cy="75" r="4" fill="#ef4444" />
                      <text x="180" y="65" fontSize="13" fontWeight="bold" fill="#ef4444">Z (75°)</text>
                    </>
                  )}
                </>
              )}

              {/* Step 4: Final Completed Triangle Joined */}
              {step >= 4 && (
                <>
                  {cCase === 'sas' && (
                    <>
                      {/* Join P(60, 200) to R(230, 78.7) */}
                      <polygon points="60,200 300,200 230,78.7" fill="rgba(99, 102, 241, 0.2)" stroke="#4f46e5" strokeWidth="3" />
                      <text x="130" y="130" fontSize="11" fontWeight="bold" fill="#4338ca">PR जोडिएको</text>
                    </>
                  )}
                  {cCase === 'asa' && (
                    <>
                      <polygon points="60,200 300,200 102,58" fill="rgba(16, 185, 129, 0.2)" stroke="#059669" strokeWidth="3" />
                    </>
                  )}
                  {cCase === 'sss' && (
                    <>
                      <polygon points="50,200 300,200 145,65" fill="rgba(236, 72, 153, 0.2)" stroke="#db2777" strokeWidth="3" />
                      <text x="75" y="130" fontSize="11" fontWeight="bold" fill="#db2777">AB = 4.5 cm</text>
                      <text x="220" y="125" fontSize="11" fontWeight="bold" fill="#db2777">AC = 6.5 cm</text>
                    </>
                  )}
                  {cCase === 'aas' && (
                    <>
                      <polygon points="60,200 300,200 185,75" fill="rgba(14, 165, 233, 0.2)" stroke="#0284c7" strokeWidth="3" />
                    </>
                  )}
                </>
              )}
            </svg>

            {/* Step Controls */}
            <div className="flex items-center gap-3 mt-4">
              <span className="text-sm font-bold text-slate-700">
                {L(`चरण ${toNp(step)} / ${toNp(getStepCount())}`, `Step ${step} of ${getStepCount()}`)}
              </span>
              <button
                onClick={handleNextStep}
                disabled={step >= getStepCount()}
                className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 text-sm ${
                  step >= getStepCount()
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                }`}
              >
                {step >= getStepCount() ? L('सम्पन्न', 'Complete') : L('अर्को चरण', 'Next Step')}
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-bold flex items-center gap-1"
              >
                <RotateCcw className="w-4 h-4" />
                {L('पुनः सुरु', 'Reset')}
              </button>
            </div>
          </div>

          {/* Detailed CDC Instruction Text for Current Step */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-700 text-sm space-y-1">
            <div className="font-bold text-indigo-900">
              {cCase === 'sas' && step === 1 && L('चरण 1: स्केलको सहायताले 5.6 cm लम्बाइ भएको रेखाखण्ड PQ खिच्नुहोस्।', 'Step 1: Draw a line segment PQ of length 5.6 cm using a ruler.')}
              {cCase === 'sas' && step === 2 && L('चरण 2: प्रोटेक्टर वा कम्पासको सहायताले बिन्दु Q मा 60° को कोण बनाउने किरण खिच्नुहोस्।', 'Step 2: Construct an angle of 60° at vertex Q.')}
              {cCase === 'sas' && step === 3 && L('चरण 3: कम्पासमा 4.5 cm नापेर Q बाट सो किरणमा चाप काट्नुहोस् र काटिएको बिन्दुलाई R नाम दिनुहोस्।', 'Step 3: Measure 4.5 cm with a compass, cut the ray from Q and label the point R.')}
              {cCase === 'sas' && step === 4 && L('चरण 4: बिन्दु P र R लाई जोड्नुहोस्। यसरी अभीष्ट △PQR तयार भयो।', 'Step 4: Join points P and R. The required triangle △PQR is constructed.')}

              {cCase === 'sss' && step === 1 && L('चरण 1: स्केलको सहायताले BC = 5 cm रेखा खिच्नुहोस्।', 'Step 1: Draw base line BC = 5 cm using a ruler.')}
              {cCase === 'sss' && step === 2 && L('चरण 2: कम्पासमा 4.5 cm नापेर बिन्दु B बाट माथितिर एउटा चाप खिच्नुहोस्।', 'Step 2: Take radius 4.5 cm and draw an arc from point B.')}
              {cCase === 'sss' && step === 3 && L('चरण 3: कम्पासमा 6.5 cm नापेर बिन्दु C बाट अघिको चापलाई काट्ने गरी अर्को चाप खिच्नुहोस् (काट्ने बिन्दु A)।', 'Step 3: Take radius 6.5 cm and draw an arc from point C cutting the first arc at point A.')}
              {cCase === 'sss' && step === 4 && L('चरण 4: AB र AC लाई जोड्नुहोस्। अहिले △ABC तयार भयो।', 'Step 4: Join AB and AC. The required triangle △ABC is complete.')}

              {(cCase === 'asa' || cCase === 'aas') && step <= 2 && L('आधार रेखा खिचेर दुवै छेउका कोणहरू निर्धारण गर्नुहोस्।', 'Draw the base line and determine both end angles.')}
              {(cCase === 'asa' || cCase === 'aas') && step > 2 && L('दुवै कोणका किरणहरू जहाँ आपसमा काटिन्छन्, त्यहीँ तेस्रो Vertex प्राप्त हुन्छ।', 'The intersection of both angle rays forms the third vertex.')}
            </div>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};

export default TriangleConstructionWorkshop;
