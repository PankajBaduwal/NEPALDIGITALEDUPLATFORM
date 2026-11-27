/**
 * EqualAngleCopyingStudio.tsx
 * Grade 7 Mathematics – Lesson 13: LINES AND ANGLES
 * Simulation 2: Equal Angle Construction and Copying Studio (2D Interactive Simulation)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 193-195)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Copy, Compass, Check, ArrowRight, RefreshCw } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'दिइएको कोणसँग बराबर हुने गरी अर्को कोण रचना गर्दा कुन ज्यामितीय उपकरण प्रयोग गरिन्छ?',
    en: 'Which geometric instrument is used to copy a given angle without measuring degrees directly?',
    options: [
      { key: 'A', label: 'Compass and ruler' },
      { key: 'B', label: 'Protractor only' },
      { key: 'C', label: 'Set square' },
      { key: 'D', label: 'By folding paper' },
    ],
    answer: 'A',
  },
  {
    np: 'दिइएको कोणको भुजामा काटिएको चापको लम्बाइ नापेर नयाँ शीर्षबाट चाप काट्दा के निश्चित हुन्छ?',
    en: 'Measuring the distance between arc intersections ensures what?',
    options: [
      { key: 'A', label: 'The new angle is equal to the given angle' },
      { key: 'B', label: 'The new angle becomes 90°' },
      { key: 'C', label: 'The angle doubles' },
      { key: 'D', label: 'The arm becomes longer' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि ∠PQR = 50° छ भने कम्पासद्वारा रचना गरिएको बराबर कोणको नाप कति हुन्छ?',
    en: 'If ∠PQR = 50°, what is the measure of the copied angle using compass?',
    options: [
      { key: 'A', label: '50° (equal measure)' },
      { key: 'B', label: '25°' },
      { key: 'C', label: '100°' },
      { key: 'D', label: '130°' },
    ],
    answer: 'A',
  },
  {
    np: 'बराबर कोण रचनाको अन्तिम प्रमाणीकरण कुन उपकरणले नापेर गरिन्छ?',
    en: 'Which instrument is used to verify that the copied angle is equal?',
    options: [
      { key: 'A', label: 'Protractor' },
      { key: 'B', label: 'Thermometer' },
      { key: 'C', label: 'Ruler only' },
      { key: 'D', label: 'Clock' },
    ],
    answer: 'A',
  },
];

export const EqualAngleCopyingStudio: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const handleBack = onBackToLibrary || onBack || (() => {});
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L13-02',
    titleEn: 'Equal Angle Copying Studio',
    titleNp: 'बराबर कोण रचना र प्रतिलिपि कार्यशाला',
    chapter: 13,
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);

  const [sampleAngle, setSampleAngle] = useState<number>(50);
  const [isCopied, setIsCopied] = useState<boolean>(true);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'दिइएको कोण ∠PQR को चापको चौडाइ कम्पासले नापेर नयाँ आधार रेखामा स्थानान्तरण गर्दा बराबर कोण बन्दछ!',
        'Copying an angle ∠PQR uses compass arc transfer onto a new base ray to guarantee equal measure!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Source Angle Selector */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[35, 50, 65, 80, 110].map((deg) => (
            <button
              key={deg}
              onClick={() => {
                kit.tap();
                setSampleAngle(deg);
                setIsCopied(true);
              }}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer',
                background: sampleAngle === deg ? '#187C68' : '#E2E8F0',
                color: sampleAngle === deg ? '#FFF' : '#334155',
              }}
            >
              {deg}°
            </button>
          ))}
        </div>

        {/* Dual Canvas: Original Angle and Copied Angle */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {/* Left: Original Angle */}
          <div style={{ background: '#FFF', borderRadius: 12, padding: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0369A1' }}>
              {L('दिइएको कोण ∠PQR (Original Angle)', 'Given Angle ∠PQR')}
            </span>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '16px 0',
                background: '#F8FAFC',
                borderRadius: 10,
                marginTop: 10,
              }}
            >
              <svg width="240" height="180" viewBox="0 0 240 180">
                <line x1="40" y1="140" x2="200" y2="140" stroke="#0F172A" strokeWidth="2.5" />
                <circle cx="40" cy="140" r="4" fill="#0369A1" />
                <text x="30" y="155" fontWeight="bold">Q</text>
                <text x="205" y="155" fontWeight="bold">R</text>

                {(() => {
                  const rad = (sampleAngle * Math.PI) / 180;
                  const ax = 40 + 120 * Math.cos(rad);
                  const ay = 140 - 120 * Math.sin(rad);
                  return (
                    <>
                      <line x1="40" y1="140" x2={ax} y2={ay} stroke="#0369A1" strokeWidth="2.5" />
                      <text x={ax + 5} y={ay} fontWeight="bold">P</text>
                      {/* Compass arc */}
                      <path
                        d={`M 90 140 A 50 50 0 0 0 ${40 + 50 * Math.cos(rad)} ${140 - 50 * Math.sin(rad)}`}
                        fill="none"
                        stroke="#EF4444"
                        strokeWidth="2"
                        strokeDasharray="3 2"
                      />
                      <text x="75" y="125" fontSize="11" fontWeight="bold" fill="#0C4A6E">
                        {sampleAngle}°
                      </text>
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>

          {/* Right: Copied Angle */}
          <div style={{ background: '#FFF', borderRadius: 12, padding: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#15803D' }}>
              {L('कम्पासले सारेको बराबर कोण ∠BAC', 'Copied Equal Angle ∠BAC')}
            </span>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '16px 0',
                background: '#F0FDF4',
                borderRadius: 10,
                marginTop: 10,
              }}
            >
              <svg width="240" height="180" viewBox="0 0 240 180">
                <line x1="40" y1="140" x2="200" y2="140" stroke="#0F172A" strokeWidth="2.5" />
                <circle cx="40" cy="140" r="4" fill="#15803D" />
                <text x="30" y="155" fontWeight="bold">A</text>
                <text x="205" y="155" fontWeight="bold">C</text>

                {(() => {
                  const rad = (sampleAngle * Math.PI) / 180;
                  const bx = 40 + 120 * Math.cos(rad);
                  const by = 140 - 120 * Math.sin(rad);
                  return (
                    <>
                      <line x1="40" y1="140" x2={bx} y2={by} stroke="#15803D" strokeWidth="2.5" />
                      <text x={bx + 5} y={by} fontWeight="bold">B</text>
                      {/* Transferred arc */}
                      <path
                        d={`M 90 140 A 50 50 0 0 0 ${40 + 50 * Math.cos(rad)} ${140 - 50 * Math.sin(rad)}`}
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="2"
                      />
                      <text x="75" y="125" fontSize="11" fontWeight="bold" fill="#065F46">
                        {sampleAngle}°
                      </text>
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>
        </div>

        {/* Verification Card */}
        <div
          style={{
            background: '#ECFDF5',
            padding: 16,
            borderRadius: 10,
            border: '2px solid #10B981',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 800, color: '#065F46' }}>
            ✓ ∠PQR = ∠BAC = {sampleAngle}° ({L('बराबर कोण प्रमाणित भयो', 'Equal Angle Verified')})
          </div>
          <div style={{ fontSize: 13, color: '#047857', marginTop: 4 }}>
            {L(
              'प्रोटेक्टरले नाप्दा दुवै कोणको मान ठ्याक्कै एउटै प्राप्त हुन्छ।',
              'Measuring with a protractor confirms both angles have identical degree measures.'
            )}
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};

export default EqualAngleCopyingStudio;
