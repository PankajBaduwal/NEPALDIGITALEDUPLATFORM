/**
 * AngleConstructionCompassLab.tsx
 * Grade 7 Mathematics – Lesson 13: LINES AND ANGLES (रेखाहरू र कोणहरू)
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
    np: 'कम्पास र पेन्सिलको प्रयोग गरी रेखाखण्डको सुरु बिन्दुबाट कुनै नबदली चाप खिच्दा बन्ने पहिलो कोण कति डिग्रीको हुन्छ?',
    en: 'When drawing an arc with an unchanged compass radius from a vertex, what angle is formed by the first arc intersection?',
    options: [
      { key: 'A', label: '६०° (60°)' },
      { key: 'B', label: '९०°' },
      { key: 'C', label: '४५°' },
      { key: 'D', label: '३०°' },
    ],
    answer: 'A',
  },
  {
    np: '६०° को कोणलाई आधा (समद्विभाजन / Bisect) गर्दा कति डिग्रीको कोण बन्छ?',
    en: 'Bisecting a 60° angle creates what angle?',
    options: [
      { key: 'A', label: '३०° (३०° लाई फेरि आधा गर्दा १५° बन्छ)' },
      { key: 'B', label: '४५°' },
      { key: 'C', label: '१५°' },
      { key: 'D', label: '२०°' },
    ],
    answer: 'A',
  },
  {
    np: '९०° को कोणलाई समद्विभाजन (Bisect) गर्दा कति डिग्रीको कोण बन्दछ?',
    en: 'Bisecting a 90° angle produces what angle?',
    options: [
      { key: 'A', label: '४५° (४५°)' },
      { key: 'B', label: '३०°' },
      { key: 'C', label: '६०°' },
      { key: 'D', label: '७५°' },
    ],
    answer: 'A',
  },
  {
    np: '६०° र ९०° को बीचको कोणलाई समद्विभाजन गर्दा कुन कोण प्राप्त हुन्छ?',
    en: 'Bisecting the angle between 60° and 90° results in which angle?',
    options: [
      { key: 'A', label: '७५° [ ६०° + (३०°/२) = ७५° ]' },
      { key: 'B', label: '१०५°' },
      { key: 'C', label: '१२०°' },
      { key: 'D', label: '१३५°' },
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
    { deg: 60, np: '६०° (मूल चाप)', stepsNp: '१. रेखा खिच्ने, २. शीर्षबाट चाप घुमाउने, ३. सोही नापले चाप काट्ने = ६०°' },
    { deg: 30, np: '३०° (६०° को आधा)', stepsNp: '१. ६०° बनाउने, २. ०° र ६०° बाट दुई चाप काट्ने = ३०°' },
    { deg: 15, np: '१५° (३०° को आधा)', stepsNp: '१. ३०° बनाउने, २. ०° र ३०° बाट दुई चाप काटी जोड्ने = १५°' },
    { deg: 90, np: '९०° (लम्ब रचना)', stepsNp: '१. ६०° र १२०° का चाप काट्ने, २. दुवैबाट माथि चाप काटी जोड्ने = ९०°' },
    { deg: 45, np: '४५° (९०° को आधा)', stepsNp: '१. ९०° बनाउने, २. ०° र ९०° बाट दुई चाप काटी समद्विभाजन गर्ने = ४५°' },
    { deg: 75, np: '७५° (६०° र ९०° को बीच)', stepsNp: '१. ६०° र ९०° बनाउने, २. दुवैको बीचबाट चाप काटी जोड्ने = ७५°' },
    { deg: 120, np: '१२०° (दोस्रो चाप)', stepsNp: '१. ६०° को बिन्दुबाट फेरि सोही नापले दोस्रो चाप काट्ने = १२०°' },
  ];

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'कम्पासको नाप नबदली पहिलो चाप काट्दा ६०°, दोस्रो चापमा १२०°, र बीचमा समद्विभाजन गर्दा ९०°, ४५°, ३०°, १५°, ७५° बन्छन्!',
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
              <text x="160" y="195" fontSize="10" fill="#DC2626">०° बिन्दु</text>
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
