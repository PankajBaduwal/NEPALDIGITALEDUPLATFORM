import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface TrapeziumStep {
  stepNum: number;
  instructionNp: string;
  instructionEn: string;
  tool: 'ruler' | 'compass' | 'protractor';
}

interface TrapeziumCase {
  id: string;
  titleNp: string;
  titleEn: string;
  givenNp: string;
  givenEn: string;
  steps: TrapeziumStep[];
}

const TRAPEZIUM_CASES: TrapeziumCase[] = [
  {
    id: 'case1',
    titleNp: 'अवस्था १: ३ भुजाहरू, १ कोण र समानान्तर अवस्था दिइएको',
    titleEn: 'Case 1: 3 Sides, 1 Angle and Parallel Condition Given',
    givenNp: 'AB = 8.0 cm, BC = 6.0 cm, CD = 4.0 cm, ∠ABC = 60°, र AB // CD',
    givenEn: 'AB = 8.0 cm, BC = 6.0 cm, CD = 4.0 cm, ∠ABC = 60°, and AB // CD',
    steps: [
      {
        stepNum: 1,
        instructionNp: 'रुलरको सहायताले आधार रेखाखण्ड AB = ८.० सेमी खिच्नुहोस्।',
        instructionEn: 'Draw base line segment AB = 8.0 cm using a ruler.',
        tool: 'ruler',
      },
      {
        stepNum: 2,
        instructionNp: 'कम्पास वा प्रोटेक्टरको प्रयोग गरी बिन्दु B मा ६०° को कोण ∠ABX खिच्नुहोस्।',
        instructionEn: 'Construct angle ∠ABX = 60° at vertex B using compass or protractor.',
        tool: 'protractor',
      },
      {
        stepNum: 3,
        instructionNp: 'कम्पासलाई ६.० सेमी (BC) खोली बिन्दु B बाट किरण BX मा चाप काटी शीर्षबिन्दु C पत्ता लगाउनुहोस्।',
        instructionEn: 'Set compass to 6.0 cm (BC) and cut an arc on ray BX from B to locate vertex C.',
        tool: 'compass',
      },
      {
        stepNum: 4,
        instructionNp: 'बिन्दु C बाट आधार रेखाखण्ड AB सँग समानान्तर हुने गरी रेखा CY खिच्नुहोस् (एकान्तर कोण ६०° बनाएर)।',
        instructionEn: 'Through vertex C, construct line CY parallel to AB (using alternate angle 60°).',
        tool: 'compass',
      },
      {
        stepNum: 5,
        instructionNp: 'कम्पासमा ४.० सेमी (CD) नापी बिन्दु C बाट समानान्तर रेखा CY मा चाप काटी बिन्दु D पत्ता लगाउनुहोस्।',
        instructionEn: 'Measure 4.0 cm (CD) on compass and cut an arc from C along CY to locate point D.',
        tool: 'compass',
      },
      {
        stepNum: 6,
        instructionNp: 'रुलरले बिन्दु A र बिन्दु D जोड्नुहोस्। यसरी समलम्ब चतुर्भुज ABCD को रचना सम्पन्न भयो।',
        instructionEn: 'Join vertex A and vertex D with a ruler to complete trapezium ABCD.',
        tool: 'ruler',
      },
    ],
  },
];

const QUIZ_QUESTIONS = [
  {
    np: 'समलम्ब चतुर्भुज (Trapezium) को मुख्य ज्यामितीय विशेषता कुन हो?',
    en: 'What is the primary defining geometric property of a trapezium?',
    options: [
      { key: 'A', label: 'सम्मुख भुजाहरूको ठ्याक्कै एक जोडी समानान्तर (One pair of opposite sides parallel) हुन्छ' },
      { key: 'B', label: 'चारै भुजाहरू बराबर हुन्छन्' },
      { key: 'C', label: 'दुवै जोडी सम्मुख भुजाहरू समानान्तर हुन्छन्' },
      { key: 'D', label: 'विकर्णहरू सधैं बराबर हुन्छन्' },
    ],
    answer: 'A',
  },
  {
    np: 'समलम्ब चतुर्भुजमा दिएको बिन्दुबाट अर्को रेखासँग समानान्तर रेखा खिच्न कुन कोणको समानता प्रयोग गरिन्छ?',
    en: 'Which angle equality is used to construct a parallel line through a given point?',
    options: [
      { key: 'A', label: 'एकान्तर कोणहरू (Alternate interior angles) बराबर बनाएर' },
      { key: 'B', label: 'शीर्षाभिमुख कोण मात्र' },
      { key: 'C', label: '९०° को कोण मात्र' },
      { key: 'D', label: 'कुनै पनि होइन' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि AB // CD र ∠ABC = ६०° भए, भुजा BC मा पर्ने भित्री क्रमागत कोण ∠BCD को मान कति हुनुपर्छ?',
    en: 'If AB // CD and ∠ABC = 60°, what must be the consecutive interior angle ∠BCD?',
    options: [
      { key: 'A', label: '120° (१८०° - ६०° = १२०°, संपूरक कोण)' },
      { key: 'B', label: '60°' },
      { key: 'C', label: '90°' },
      { key: 'D', label: '30°' },
    ],
    answer: 'A',
  },
];

export const TrapeziumConstructionLab: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U15-02',
    chapter: 15,
    titleNp: 'समलम्ब चतुर्भुज रचना प्रयोगशाला',
    titleEn: 'Trapezium Construction Laboratory',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeCaseIdx] = useState<number>(0);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);

  const tCase = TRAPEZIUM_CASES[activeCaseIdx];
  const maxSteps = tCase.steps.length;

  // Geometric coordinates for Case 1:
  // Scale: 32px per cm
  // A = (80, 240)
  // B = (80 + 8*32 = 336, 240)
  // At B: angle 60° towards top-left/top-right. Ray BX direction: 180° - 60° = 120° (or top-left)
  // Let's place B at right and ray BX going up-left:
  // dx = 6 * 32 * cos(120°) = 192 * (-0.5) = -96
  // dy = 6 * 32 * sin(120°) = 192 * 0.866 = 166.3
  // C = (336 - 96 = 240, 240 - 166 = 74)
  // Parallel to AB is horizontal line at y = 74
  // CD = 4 cm = 4 * 32 = 128px left from C:
  // D = (240 - 128 = 112, 74)
  const pA = { x: 80, y: 240 };
  const pB = { x: 336, y: 240 };
  const pC = { x: 240, y: 74 };
  const pD = { x: 112, y: 74 };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! पाठ्यपुस्तकमा आधारित भएर रुलर, कम्पास र प्रोटेक्टरको प्रयोग गरी समलम्ब चतुर्भुज (Trapezium) को चरणबद्ध र ज्यामितीय रूपमा शुद्ध रचना गर्नुहोस्!',
        'Welcome! Construct trapeziums step-by-step using virtual ruler, compass, and protractor with strict geometric precision!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
            <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 800, color: '#D97706', marginTop: 4 }}>
              {L(tCase.givenNp, tCase.givenEn)}
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#64748B' }}>
            {L('चरण', 'Step')} <strong>{fmt(currentStepIdx + 1)}</strong> / {fmt(maxSteps)}
          </div>
        </div>

        {/* Geometry Board */}
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
              <pattern id="trapGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#F1F5F9" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width={480} height={300} fill="url(#trapGrid)" />

            {/* Step 1: Base AB */}
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
                  AB = 8.0 cm
                </text>
              </g>
            )}

            {/* Step 2: Ray BX at 60° */}
            {currentStepIdx >= 1 && (
              <g>
                <line x1={pB.x} y1={pB.y} x2={210} y2={20} stroke="#D97706" strokeWidth="1.5" strokeDasharray="4,4" />
                {/* 60° angle arc */}
                <path d={`M ${pB.x - 30} ${pB.y} A 30 30 0 0 1 ${pB.x - 15} ${pB.y - 26}`} fill="none" stroke="#D97706" strokeWidth="2" />
                <text x={pB.x - 45} y={pB.y - 12} fontSize="11" fill="#B45309" fontWeight="700">
                  60°
                </text>
                <text x="205" y="18" fontSize="11" fill="#B45309" fontWeight="700">
                  X
                </text>
              </g>
            )}

            {/* Step 3: Arc on BX at 6cm to locate C */}
            {currentStepIdx >= 2 && (
              <g>
                <path d="M 225 60 A 192 192 0 0 1 255 88" fill="none" stroke="#059669" strokeWidth="2" />
                <circle cx={pC.x} cy={pC.y} r="4" fill="#059669" />
                <line x1={pB.x} y1={pB.y} x2={pC.x} y2={pC.y} stroke="#1E40AF" strokeWidth="2" />
                <text x={pC.x + 8} y={pC.y - 4} fontSize="12" fontWeight="800" fill="#059669">
                  C
                </text>
                <text x={(pB.x + pC.x) / 2 + 15} y={(pB.y + pC.y) / 2} fontSize="11" fill="#1E3A8A">
                  6.0 cm
                </text>
              </g>
            )}

            {/* Step 4: Parallel line through C */}
            {currentStepIdx >= 3 && (
              <g>
                <line x1={50} y1={pC.y} x2={380} y2={pC.y} stroke="#7C3AED" strokeWidth="1.5" strokeDasharray="3,3" />
                <text x="385" y={pC.y + 4} fontSize="11" fill="#7C3AED" fontWeight="700">
                  Y (// AB)
                </text>
              </g>
            )}

            {/* Step 5: Arc of 4cm from C to locate D */}
            {currentStepIdx >= 4 && (
              <g>
                <path d="M 112 60 L 112 88" stroke="#EC4899" strokeWidth="2" />
                <circle cx={pD.x} cy={pD.y} r="4" fill="#EC4899" />
                <line x1={pD.x} y1={pD.y} x2={pC.x} y2={pC.y} stroke="#1E40AF" strokeWidth="2" />
                <text x={pD.x - 14} y={pD.y - 6} fontSize="12" fontWeight="800" fill="#EC4899">
                  D
                </text>
                <text x={(pD.x + pC.x) / 2} y={pD.y - 8} fontSize="11" fill="#1E3A8A" textAnchor="middle">
                  CD = 4.0 cm
                </text>
              </g>
            )}

            {/* Step 6: Join AD to complete trapezium ABCD */}
            {currentStepIdx >= 5 && (
              <g>
                <line x1={pA.x} y1={pA.y} x2={pD.x} y2={pD.y} stroke="#1E40AF" strokeWidth="2" />
                <polygon
                  points={`${pA.x},${pA.y} ${pB.x},${pB.y} ${pC.x},${pC.y} ${pD.x},${pD.y}`}
                  fill="#FEF3C7"
                  fillOpacity="0.4"
                />
                <text x={(pA.x + pD.x) / 2 - 14} y={(pA.y + pD.y) / 2} fontSize="11" fill="#92400E">
                  AD
                </text>
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
                  backgroundColor: '#D97706',
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
                  tCase.steps[currentStepIdx].instructionNp,
                  tCase.steps[currentStepIdx].instructionEn
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
                  backgroundColor: currentStepIdx >= maxSteps - 1 ? '#94A3B8' : '#D97706',
                  color: '#FFFFFF',
                  cursor: currentStepIdx >= maxSteps - 1 ? 'not-allowed' : 'pointer',
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                {L('अर्को चरण (रचना अघि बढाउने)', 'Next Step')} →
              </button>
            </div>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};

export default TrapeziumConstructionLab;
