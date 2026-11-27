/**
 * AngleConstructionCompassLab.tsx
 * Grade 7 Mathematics – Lesson 13: LINES AND ANGLES
 * Simulation 1: Angle Construction Compass Lab (2D Interactive Compass Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 187-193)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Compass, PenTool, Check, RefreshCw } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'कम्पास र पेन्सिलको प्रयोग गरी रेखाखण्डको सुRs बिन्दुबाट कुनै नबदली चाप खिच्दा बन्ने पहिलो कोण कति degreesको हुन्छ?',
    en: 'When drawing an arc with an unchanged compass radius from a vertex, what angle is formed by the first arc intersection?',
    options: [
      { key: 'A', label: '60° (60°)' },
      { key: 'B', label: '90°' },
      { key: 'C', label: '45°' },
      { key: 'D', label: '30°' },
    ],
    answer: 'A',
  },
  {
    np: '60° को कोणलाई आधा (समद्विभाजन / Bisect) गर्दा कति degreesको कोण बन्छ?',
    en: 'Bisecting a 60° angle creates what angle?',
    options: [
      { key: 'A', label: '30° (halving 30° again gives 15°)' },
      { key: 'B', label: '45°' },
      { key: 'C', label: '15°' },
      { key: 'D', label: '20°' },
    ],
    answer: 'A',
  },
  {
    np: '90° को कोणलाई समद्विभाजन (Bisect) गर्दा कति degreesको कोण बन्दछ?',
    en: 'Bisecting a 90° angle produces what angle?',
    options: [
      { key: 'A', label: '45° (45°)' },
      { key: 'B', label: '30°' },
      { key: 'C', label: '60°' },
      { key: 'D', label: '75°' },
    ],
    answer: 'A',
  },
  {
    np: '60° र 90° को बीचको कोणलाई समद्विभाजन गर्दा कुन कोण प्राप्त हुन्छ?',
    en: 'Bisecting the angle between 60° and 90° results in which angle?',
    options: [
      { key: 'A', label: '75° [ 60° + (30°/2) = 75° ]' },
      { key: 'B', label: '105°' },
      { key: 'C', label: '120°' },
      { key: 'D', label: '135°' },
    ],
    answer: 'A',
  },
];

export const AngleConstructionCompassLab: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L13-01',
    titleEn: 'Angle Construction Compass Lab',
    titleNp: 'कम्पासबाट कोण रचना प्रयोगशाला',
    chapter: 13,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [targetAngle, setTargetAngle] = useState<number>(60);
  const [constructStep, setConstructStep] = useState<number>(3);

  const CONSTRUCTIBLE = [
    { deg: 60, np: '60° (मूल चाप)', stepsNp: '1. Draw a line, 2. Swing an arc from the vertex, 3. Cut the arc with the same radius = 60°' },
    { deg: 30, np: '30° (60° को आधा)', stepsNp: '1. Construct 60°, 2. Cut two arcs from 0° and 60° = 30°' },
    { deg: 15, np: '15° (30° को आधा)', stepsNp: '1. Construct 30°, 2. Cut two arcs from 0° and 30° and join = 15°' },
    { deg: 90, np: '90° (लम्ब रचना)', stepsNp: '1. Mark the 60° and 120° arcs, 2. Cut arcs above from both and join = 90°' },
    { deg: 45, np: '45° (90° को आधा)', stepsNp: '1. Construct 90°, 2. Cut two arcs from 0° and 90° to bisect = 45°' },
    { deg: 75, np: '75° (60° र 90° को बीच)', stepsNp: '1. Construct 60° and 90°, 2. Cut arcs between the two and join = 75°' },
    { deg: 120, np: '120° (दोस्रो चाप)', stepsNp: '1. From the 60° point cut a second arc with the same radius = 120°' },
  ];

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'कम्पासको नाप नबदली पहिलो चाप काट्दा 60°, दोस्रो चापमा 120°, र बीचमा समद्विभाजन गर्दा 90°, 45°, 30°, 15°, 75° बन्छन्!',
        'Compass radius unchanged makes 60° on first cut, 120° on second, and bisection yields 90°, 45°, 30°, 15°, 75°!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Angle Selector Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {CONSTRUCTIBLE.map((item) => (
            <button
              key={item.deg}
              onClick={() => {
                kit.tap();
                setTargetAngle(item.deg);
              }}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer',
                background: targetAngle === item.deg ? '#187C68' : '#E2E8F0',
                color: targetAngle === item.deg ? '#FFF' : '#334155',
                transition: 'all 0.2s',
              }}
            >
              {item.deg}°
            </button>
          ))}
        </div>

        {/* Construction Visual Stage */}
        <div style={{ background: '#FFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#187C68' }}>
            {L(`कम्पासद्वारा ${targetAngle}° को कोण रचना`, `Compass Construction of ${targetAngle}°`)}
          </h3>

          {/* SVG Animated/Interactive Geometry Compass Workspace */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '20px 0',
              background: '#F8FAFC',
              borderRadius: 12,
              border: '1px solid #CBD5E1',
              margin: '16px 0',
            }}
          >
            <svg width="340" height="240" viewBox="0 0 340 240">
              {/* Base line QR */}
              <line x1="60" y1="180" x2="280" y2="180" stroke="#0F172A" strokeWidth="2.5" />
              <circle cx="60" cy="180" r="5" fill="#187C68" />
              <text x="50" y="195" fontWeight="bold" fontSize="13">B</text>
              <text x="285" y="195" fontWeight="bold" fontSize="13">C</text>

              {/* Main Compass Arc from B (radius 100) */}
              <path
                d="M 160 180 A 100 100 0 0 0 110 93.4"
                fill="none"
                stroke="#94A3B8"
                strokeWidth="2"
                strokeDasharray="4 2"
              />

              {/* Angle Terminal Arm BA */}
              {(() => {
                const rad = (targetAngle * Math.PI) / 180;
                const armX = 60 + 150 * Math.cos(rad);
                const armY = 180 - 150 * Math.sin(rad);

                // Small angle arc
                const arcRad = (targetAngle * Math.PI) / 180;
                const arcEndX = 60 + 35 * Math.cos(arcRad);
                const arcEndY = 180 - 35 * Math.sin(arcRad);

                return (
                  <>
                    <line x1="60" y1="180" x2={armX} y2={armY} stroke="#10B981" strokeWidth="3" />
                    <circle cx={armX} cy={armY} r="4" fill="#059669" />
                    <text x={armX + 8} y={armY} fontWeight="bold" fontSize="13" fill="#047857">A</text>

                    {/* Small Angle Arc */}
                    <path
                      d={`M 95 180 A 35 35 0 0 0 ${arcEndX} ${arcEndY}`}
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="2"
                    />
                    <text x="105" y="165" fontSize="12" fontWeight="bold" fill="#065F46">
                      {targetAngle}°
                    </text>
                  </>
                );
              })()}

              {/* Intersection Points */}
              <circle cx="160" cy="180" r="3" fill="#DC2626" />
              <text x="160" y="195" fontSize="10" fill="#DC2626">0° point</text>
            </svg>
          </div>

          {/* Construction Steps Box */}
          {(() => {
            const cur = CONSTRUCTIBLE.find((c) => c.deg === targetAngle)!;
            return (
              <div
                style={{
                  background: '#F0FDF4',
                  padding: 16,
                  borderRadius: 10,
                  border: '1px solid #BBF7D0',
                  lineHeight: 1.8,
                }}
              >
                <div style={{ fontWeight: 800, color: '#166534', fontSize: 15 }}>
                  {L(`रचनाका चरणहरू (${targetAngle}°):`, `Construction Steps (${targetAngle}°):`)}
                </div>
                <div style={{ color: '#15803D', fontSize: 14, marginTop: 4 }}>
                  {cur.stepsNp}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </SimFrame2D>
  );
};

export default AngleConstructionCompassLab;
