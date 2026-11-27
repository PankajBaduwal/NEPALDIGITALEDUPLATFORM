import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface ConstructionStep {
  stepNum: number;
  instructionNp: string;
  instructionEn: string;
  tool: 'ruler' | 'compass' | 'pencil';
  actionDesc: string;
}

interface ConstructionCase {
  id: string;
  titleNp: string;
  titleEn: string;
  givenDataNp: string;
  givenDataEn: string;
  steps: ConstructionStep[];
}

const CASES: ConstructionCase[] = [
  {
    id: 'case1',
    titleNp: 'अवस्था 1: चार भुजा र एउटा विकर्ण दिइएको (4 भुजाहरू र 1 विकर्ण)',
    titleEn: 'Case 1: 4 Sides and 1 Diagonal Given',
    givenDataNp: 'AB = 4.8 cm, BC = 4.3 cm, CD = 3.6 cm, AD = 4.2 cm, विकर्ण AC = 6.0 cm',
    givenDataEn: 'AB = 4.8 cm, BC = 4.3 cm, CD = 3.6 cm, AD = 4.2 cm, Diagonal AC = 6.0 cm',
    steps: [
      {
        stepNum: 1,
        instructionNp: 'रुलरको सहायताले आधार रेखाखण्ड AB = 4.8 cm खिच्नुहोस्।',
        instructionEn: 'Draw the base line segment AB = 4.8 cm using a ruler.',
        tool: 'ruler',
        actionDesc: 'Base line AB = 4.8 cm drawn.',
      },
      {
        stepNum: 2,
        instructionNp: 'कम्पासलाई 6.0 cm खोली बिन्दु A बाट माथितिर चाप (arc) खिच्नुहोस्।',
        instructionEn: 'Open compass to 6.0 cm (diagonal AC) and draw an arc from point A upwards.',
        tool: 'compass',
        actionDesc: 'Arc from A (radius = 6.0 cm).',
      },
      {
        stepNum: 3,
        instructionNp: 'कम्पासलाई 4.3 cm खोली बिन्दु B बाट पहिलो चाप काट्ने गरी अर्को चाप खिच्नुहोस् र प्रतिच्छेदन बिन्दुलाई C नाम दिनुहोस्।',
        instructionEn: 'Set compass to 4.3 cm (side BC) and draw an arc from B intersecting the first arc at point C.',
        tool: 'compass',
        actionDesc: 'Point C located at arc intersection.',
      },
      {
        stepNum: 4,
        instructionNp: 'रुलरले रेखाखण्ड BC र विकर्ण AC जोड्नुहोस्। यसरी △ABC तयार भयो।',
        instructionEn: 'Join BC and AC with a ruler to complete △ABC.',
        tool: 'ruler',
        actionDesc: 'Sides BC and AC joined.',
      },
      {
        stepNum: 5,
        instructionNp: 'बिन्दु A बाट 4.2 cm (AD) को चाप र बिन्दु C बाट 3.6 cm (CD) को चाप खिची प्रतिच्छेदन बिन्दु D पत्ता लगाउनुहोस्।',
        instructionEn: 'Draw an arc of 4.2 cm from A and 3.6 cm from C to locate intersection point D.',
        tool: 'compass',
        actionDesc: 'Point D located by arcs from A and C.',
      },
      {
        stepNum: 6,
        instructionNp: 'रुलरको सहायताले AD र CD जोडी चतुर्भुज ABCD को रचना पूरा गर्नुहोस्।',
        instructionEn: 'Join AD and CD with a ruler to complete quadrilateral ABCD.',
        tool: 'pencil',
        actionDesc: 'Quadrilateral ABCD completed.',
      },
    ],
  },
  {
    id: 'case2',
    titleNp: 'अवस्था 2: तीन भुजा र दुई कोण दिइएको',
    titleEn: 'Case 2: 3 Sides and 2 Included Angles Given',
    givenDataNp: 'AB = 5.0 cm, BC = 4.5 cm, CD = 4.0 cm, ∠B = 75°, ∠C = 105°',
    givenDataEn: 'AB = 5.0 cm, BC = 4.5 cm, CD = 4.0 cm, ∠B = 75°, ∠C = 105°',
    steps: [
      {
        stepNum: 1,
        instructionNp: 'आधार रेखाखण्ड BC = 4.5 cm खिच्नुहोस्।',
        instructionEn: 'Draw the base line segment BC = 4.5 cm.',
        tool: 'ruler',
        actionDesc: 'Base BC = 4.5 cm drawn.',
      },
      {
        stepNum: 2,
        instructionNp: 'प्रोटेक्टर वा कम्पासले बिन्दु B मा 75° को कोण ∠CBX खिच्नुहोस्।',
        instructionEn: 'Construct angle ∠CBX = 75° at point B.',
        tool: 'compass',
        actionDesc: 'Ray BX at 75° constructed.',
      },
      {
        stepNum: 3,
        instructionNp: 'कम्पासले किरण BX मा 5.0 cm नापी बिन्दु A चिन्ह लगाउनुहोस् (AB = 5.0 cm)।',
        instructionEn: 'Cut an arc of 5.0 cm along ray BX to mark vertex A.',
        tool: 'compass',
        actionDesc: 'Point A marked at 5.0 cm from B.',
      },
      {
        stepNum: 4,
        instructionNp: 'बिन्दु C मा 105° को कोण ∠BCY खिच्नुहोस्।',
        instructionEn: 'Construct angle ∠BCY = 105° at vertex C.',
        tool: 'compass',
        actionDesc: 'Ray CY at 105° constructed.',
      },
      {
        stepNum: 5,
        instructionNp: 'किरण CY मा 4.0 cm नापी बिन्दु D चिन्ह लगाउनुहोस् र AD जोड्नुहोस्।',
        instructionEn: 'Mark point D at 4.0 cm on ray CY, then join AD to complete ABCD.',
        tool: 'ruler',
        actionDesc: 'Point D marked and AD joined.',
      },
    ],
  },
];

const QUIZ_QUESTIONS = [
  {
    np: 'कुनै चतुर्भुजको निश्चित (अद्वितीय) रचना गर्न न्यूनतम कतिpcs स्वतन्त्र नापहरू चाहिन्छन्?',
    en: 'How many independent geometric measurements are required to construct a unique quadrilateral?',
    options: [
      { key: 'A', label: '5 measurements' },
      { key: 'B', label: '4 pcs' },
      { key: 'C', label: '3 pcs' },
      { key: 'D', label: '6 pcs' },
    ],
    answer: 'A',
  },
  {
    np: 'चार भुजा र एक विकर्ण दिएको अवस्थामा सबैभन्दा पहिले कुन आकृतिको रचना गरिन्छ?',
    en: 'When 4 sides and 1 diagonal are given, which figure is constructed first?',
    options: [
      { key: 'A', label: 'One triangle with a diagonal (three sides of one triangle: AB, BC, AC)' },
      { key: 'B', label: 'Rectangle' },
      { key: 'C', label: 'The angles at all four corners' },
      { key: 'D', label: 'None of these' },
    ],
    answer: 'A',
  },
  {
    np: 'चापहरू (Arcs) काटिएको प्रतिच्छेदन बिन्दुले रचनामा के जनाउँछ?',
    en: 'What does the intersection point of two geometric compass arcs represent?',
    options: [
      { key: 'A', label: 'The unknown vertex (target vertex location)' },
      { key: 'B', label: 'Only the angle bisector' },
      { key: 'C', label: 'Centre of the circle' },
      { key: 'D', label: 'Error' },
    ],
    answer: 'A',
  },
];

export const ScaleneQuadrilateralConstructionLab: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U15-01',
    chapter: 15,
    titleNp: 'विषमबाहु चतुर्भुज रचना प्रयोगशाला',
    titleEn: 'Scalene Quadrilateral Construction Laboratory',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeCaseId, setActiveCaseId] = useState<string>('case1');
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);

  const activeCase = CASES.find((c) => c.id === activeCaseId) || CASES[0];
  const maxSteps = activeCase.steps.length;

  // Geometry coordinate model for Case 1 (4 sides + diagonal):
  // Scale: 35px per cm
  // A = (100, 240)
  // B = (100 + 4.8 * 35 = 268, 240)
  // C: intersection of circle(A, 6.0*35=210) and circle(B, 4.3*35=150.5)
  // Calculated C ≈ (240, 85)
  // D: intersection of circle(A, 4.2*35=147) and circle(C, 3.6*35=126)
  // Calculated D ≈ (115, 100)
  const pA = { x: 100, y: 240 };
  const pB = { x: 268, y: 240 };
  const pC = { x: 240, y: 85 };
  const pD = { x: 115, y: 100 };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! पाठ्यपुस्तकका आधारमा रुलर र कम्पासको प्रयोग गरी 4 भुजा र 1 विकर्ण दिइएको वा भुजाहरू र कोणहरू दिइएको अवस्थामा विषमबाहु चतुर्भुजको चरणबद्ध रचना गर्नुहोस्!',
        'Welcome! Construct scalene quadrilaterals step-by-step using a virtual ruler and compass based on the official curriculum!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Case Selector Tabs */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {CASES.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setActiveCaseId(c.id);
                setCurrentStepIdx(0);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: activeCaseId === c.id ? '2px solid #0D9488' : '1px solid #CBD5E1',
                backgroundColor: activeCaseId === c.id ? '#F0FDFA' : '#FFFFFF',
                color: activeCaseId === c.id ? '#0F766E' : '#475569',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {L(c.titleNp, c.titleEn)}
            </button>
          ))}
        </div>

        {/* Given Dimensions Banner */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            padding: 14,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>
              {L('दिइएको नापहरू (Given Dimensions):', 'Given Dimensions:')}
            </span>
            <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 800, color: '#0F766E', marginTop: 4 }}>
              {L(activeCase.givenDataNp, activeCase.givenDataEn)}
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#64748B' }}>
            {L('चरण', 'Step')} <strong>{fmt(currentStepIdx + 1)}</strong> / {fmt(maxSteps)}
          </div>
        </div>

        {/* Virtual Geometry Construction Board */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            border: '1px solid #CBD5E1',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <svg
            width={480}
            height={300}
            style={{ backgroundColor: '#F8FAFC', borderRadius: 8, overflow: 'hidden' }}
          >
            {/* Grid */}
            <defs>
              <pattern id="constGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#F1F5F9" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width={480} height={300} fill="url(#constGrid)" />

            {/* Step 1: Base Line AB */}
            {currentStepIdx >= 0 && (
              <g>
                <line x1={pA.x} y1={pA.y} x2={pB.x} y2={pB.y} stroke="#1E40AF" strokeWidth="2.5" />
                <circle cx={pA.x} cy={pA.y} r="4" fill="#1E40AF" />
                <circle cx={pB.x} cy={pB.y} r="4" fill="#1E40AF" />
                <text x={pA.x - 14} y={pA.y + 16} fontSize="12" fontWeight="800" fill="#1E40AF">
                  A
                </text>
                <text x={pB.x + 8} y={pB.y + 16} fontSize="12" fontWeight="800" fill="#1E40AF">
                  B
                </text>
                <text x={(pA.x + pB.x) / 2} y={pA.y + 18} fontSize="11" fill="#1E3A8A" textAnchor="middle">
                  4.8 cm
                </text>
              </g>
            )}

            {/* Step 2: Arc from A (radius 6cm) */}
            {currentStepIdx >= 1 && (
              <g>
                <path
                  d="M 220 70 A 210 210 0 0 1 260 100"
                  fill="none"
                  stroke="#D97706"
                  strokeWidth="2"
                  strokeDasharray="4,3"
                />
                <line x1={pA.x} y1={pA.y} x2={240} y2={85} stroke="#FCD34D" strokeWidth="1" strokeDasharray="2,2" />
                <text x="160" y="160" fontSize="10" fill="#B45309">
                  arc AC (6.0 cm)
                </text>
              </g>
            )}

            {/* Step 3: Arc from B (radius 4.3cm) intersecting at C */}
            {currentStepIdx >= 2 && (
              <g>
                <path
                  d="M 230 100 A 150 150 0 0 1 250 70"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2"
                  strokeDasharray="4,3"
                />
                <circle cx={pC.x} cy={pC.y} r="4" fill="#059669" />
                <text x={pC.x + 8} y={pC.y - 4} fontSize="12" fontWeight="800" fill="#059669">
                  C
                </text>
              </g>
            )}

            {/* Step 4: Join BC and Diagonal AC */}
            {currentStepIdx >= 3 && (
              <g>
                <line x1={pB.x} y1={pB.y} x2={pC.x} y2={pC.y} stroke="#1E40AF" strokeWidth="2" />
                <line x1={pA.x} y1={pA.y} x2={pC.x} y2={pC.y} stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3,3" />
                <text x={(pB.x + pC.x) / 2 + 10} y={(pB.y + pC.y) / 2} fontSize="10" fill="#1E3A8A">
                  4.3 cm
                </text>
                <text x="175" y="145" fontSize="10" fill="#64748B">
                  AC = 6.0 cm
                </text>
              </g>
            )}

            {/* Step 5: Arcs for Point D (from A: 4.2cm, from C: 3.6cm) */}
            {currentStepIdx >= 4 && (
              <g>
                {/* Arc from A (radius 4.2cm) */}
                <path
                  d="M 100 90 A 147 147 0 0 1 130 110"
                  fill="none"
                  stroke="#EC4899"
                  strokeWidth="2"
                  strokeDasharray="4,3"
                />
                {/* Arc from C (radius 3.6cm) */}
                <path
                  d="M 110 115 A 126 126 0 0 1 120 85"
                  fill="none"
                  stroke="#7C3AED"
                  strokeWidth="2"
                  strokeDasharray="4,3"
                />
                <circle cx={pD.x} cy={pD.y} r="4" fill="#EC4899" />
                <text x={pD.x - 14} y={pD.y - 4} fontSize="12" fontWeight="800" fill="#EC4899">
                  D
                </text>
              </g>
            )}

            {/* Step 6: Join AD and CD to complete ABCD */}
            {currentStepIdx >= 5 && (
              <g>
                <line x1={pA.x} y1={pA.y} x2={pD.x} y2={pD.y} stroke="#1E40AF" strokeWidth="2" />
                <line x1={pD.x} y1={pD.y} x2={pC.x} y2={pC.y} stroke="#1E40AF" strokeWidth="2" />
                <text x={(pA.x + pD.x) / 2 - 20} y={(pA.y + pD.y) / 2} fontSize="10" fill="#1E3A8A">
                  4.2 cm
                </text>
                <text x={(pD.x + pC.x) / 2} y={(pD.y + pC.y) / 2 - 8} fontSize="10" fill="#1E3A8A" textAnchor="middle">
                  3.6 cm
                </text>
                {/* Fill Polygon */}
                <polygon
                  points={`${pA.x},${pA.y} ${pB.x},${pB.y} ${pC.x},${pC.y} ${pD.x},${pD.y}`}
                  fill="#CCFBF1"
                  fillOpacity="0.3"
                />
              </g>
            )}
          </svg>

          {/* Stepper Description & Controls */}
          <div
            style={{
              width: '100%',
              maxWidth: 480,
              marginTop: 12,
              padding: 12,
              borderRadius: 8,
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: '#0D9488',
                  color: '#FFFFFF',
                  fontSize: 12,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {fmt(currentStepIdx + 1)}
              </span>
              <strong style={{ fontSize: 13, color: '#1E293B' }}>
                {L(
                  activeCase.steps[currentStepIdx].instructionNp,
                  activeCase.steps[currentStepIdx].instructionEn
                )}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
              <button
                disabled={currentStepIdx === 0}
                onClick={() => setCurrentStepIdx((prev) => Math.max(0, prev - 1))}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  border: '1px solid #CBD5E1',
                  backgroundColor: currentStepIdx === 0 ? '#F1F5F9' : '#FFFFFF',
                  color: currentStepIdx === 0 ? '#94A3B8' : '#334155',
                  cursor: currentStepIdx === 0 ? 'not-allowed' : 'pointer',
                  fontSize: 12,
                }}
              >
                ← {L('अघिल्लो चरण', 'Previous Step')}
              </button>

              <button
                disabled={currentStepIdx >= maxSteps - 1}
                onClick={() => setCurrentStepIdx((prev) => Math.min(maxSteps - 1, prev + 1))}
                style={{
                  padding: '6px 16px',
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: currentStepIdx >= maxSteps - 1 ? '#94A3B8' : '#0D9488',
                  color: '#FFFFFF',
                  cursor: currentStepIdx >= maxSteps - 1 ? 'not-allowed' : 'pointer',
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                {L('अर्को चरण (कम्पास/रुलर प्रयोग)', 'Next Step')} →
              </button>
            </div>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};

export default ScaleneQuadrilateralConstructionLab;
