/**
 * IrrationalNumberLineLab.tsx
 * Grade 8 Mathematics – Unit 3: RATIONAL AND IRRATIONAL NUMBERS
 * Simulation 4: Irrational Numbers on the Number Line Lab
 * Strictly adheres to CDC Nepal Grade 8 Mathematics Curriculum (2023 edition, Unit 3)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Compass, Ruler, Triangle, RotateCw, Check, Sparkles } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'सङ्ख्या रेखामा √2 निर्माण गर्दा आधार 1 एकाइ र लम्ब 1 एकाइ भएको समकोण त्रिभुजको कर्ण (Hypotenuse) कति हुन्छ?',
    en: 'When constructing √2 on a number line with base 1 and perpendicular 1, what is the hypotenuse?',
    options: [
      { key: 'A', label: '√2 [ h = √(1² + 1²) = √2 ]' },
      { key: 'B', label: '2' },
      { key: 'C', label: '√3' },
      { key: 'D', label: '1' },
    ],
    answer: 'A',
  },
  {
    np: 'कम्पासको सहायताले कर्णको नापलाई सङ्ख्या रेखामा काट्दा √2 को बिन्दु लगभग कति दशमलवमा पर्छ?',
    en: 'When transferring the hypotenuse to the number line with a compass, where does √2 lie approximately?',
    options: [
      { key: 'A', label: 'About 1.414 (between 1 and 2, closer to 1.4)' },
      { key: 'B', label: 'About 2.5' },
      { key: 'C', label: 'About 1.732' },
      { key: 'D', label: 'Exactly 2' },
    ],
    answer: 'A',
  },
  {
    np: 'सङ्ख्या रेखामा √3 निर्माण गर्न कुन-कुन भुजाहरू भएको समकोण त्रिभुज बनाइन्छ?',
    en: 'To construct √3 on the number line, which perpendicular sides are used in the right triangle?',
    options: [
      { key: 'A', label: 'Base √2 and perpendicular 1 unit [ h = √((√2)² + 1²) = √3 ]' },
      { key: 'B', label: 'Base 2 and perpendicular 1' },
      { key: 'C', label: 'Base 1 and perpendicular 1' },
      { key: 'D', label: 'Base 3 and perpendicular 1' },
    ],
    answer: 'A',
  },
  {
    np: 'आधार 2 एकाइ र लम्ब 1 एकाइ भएको समकोण त्रिभुजको कर्णले सङ्ख्या रेखामा कुन अपरिमेय सङ्ख्या दिन्छ?',
    en: 'A right triangle with base 2 and perpendicular 1 yields which irrational number on the number line?',
    options: [
      { key: 'A', label: '√5 [ h = √(2² + 1²) = √(4 + 1) = √5 ≈ 2.236 ]' },
      { key: 'B', label: '√6' },
      { key: 'C', label: '√4 = 2' },
      { key: 'D', label: '√7' },
    ],
    answer: 'A',
  },
  {
    np: 'के दशमलव 1.4142... सङ्ख्या √2 को ठ्याक्कै मान (Exact Value) हो?',
    en: 'Is the decimal 1.4142... the exact value of √2?',
    options: [
      { key: 'A', label: 'No, this is only an approximation; the exact value is √2 itself' },
      { key: 'B', label: 'Yes, this is the exact value' },
      { key: 'C', label: 'It is a rational number' },
      { key: 'D', label: 'It is an integer' },
    ],
    answer: 'A',
  },
];

export const IrrationalNumberLineLab: React.FC<{
  onBack?: () => void;
  onBackToLibrary?: () => void;
}> = ({ onBack, onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U3-02',
    chapter: 3,
    titleNp: 'सङ्ख्या रेखामा अपरिमेय सङ्ख्या निर्माण (Irrational Number Line)',
    titleEn: 'Irrational Numbers on the Number Line Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeRoot, setActiveRoot] = useState<'root2' | 'root3' | 'root5'>('root2');

  // Compass sweep angle (0deg = at hypotenuse, 100% = fully swept down to number line)
  const [compassProgress, setCompassProgress] = useState<number>(0);

  // SVG Geometry constants
  // Scale: 1 unit = 110px. Origin O at (80, 240)
  const originX = 80;
  const originY = 240;
  const unitPx = 110;

  const toPxX = (u: number) => originX + u * unitPx;
  const toPxY = (u: number) => originY - u * unitPx;

  const rootConfig = {
    root2: {
      nameNp: '√2 निर्माण',
      nameEn: 'Construct √2',
      base: 1,
      perp: 1,
      hypot: Math.SQRT2, // ~1.4142
      hypotFormulaNp: 'h = √(1² + 1²) = √2',
      hypotFormulaEn: 'h = √(1² + 1²) = √2',
      approx: '1.4142',
      approxEn: '1.4142',
      baseLabel: '1',
      perpLabel: '1',
    },
    root3: {
      nameNp: '√3 निर्माण',
      nameEn: 'Construct √3',
      base: Math.SQRT2, // ~1.4142
      perp: 1,
      hypot: Math.sqrt(3), // ~1.732
      hypotFormulaNp: 'h = √((√2)² + 1²) = √(2 + 1) = √3',
      hypotFormulaEn: 'h = √((√2)² + 1²) = √(2 + 1) = √3',
      approx: '1.7320',
      approxEn: '1.7320',
      baseLabel: '√2',
      perpLabel: '1',
    },
    root5: {
      nameNp: '√5 निर्माण',
      nameEn: 'Construct √5',
      base: 2,
      perp: 1,
      hypot: Math.sqrt(5), // ~2.236
      hypotFormulaNp: 'h = √(2² + 1²) = √(4 + 1) = √5',
      hypotFormulaEn: 'h = √(2² + 1²) = √(4 + 1) = √5',
      approx: '2.2360',
      approxEn: '2.2360',
      baseLabel: '2',
      perpLabel: '1',
    },
  }[activeRoot];

  // Hypotenuse vertex coords
  const pBaseX = toPxX(rootConfig.base);
  const pBaseY = originY;
  const pTopX = toPxX(rootConfig.base);
  const pTopY = toPxY(rootConfig.perp);

  // Angle of hypotenuse from origin
  const initialAngle = Math.atan2(pTopY - originY, pTopX - originX); // negative in SVG
  const targetAngle = 0; // along positive X axis
  const currentAngle = initialAngle + compassProgress * (targetAngle - initialAngle);

  // Current compass needle endpoint
  const radiusPx = rootConfig.hypot * unitPx;
  const compassEndX = originX + radiusPx * Math.cos(currentAngle);
  const compassEndY = originY + radiusPx * Math.sin(currentAngle);

  const finalNumberLineX = toPxX(rootConfig.hypot);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! पाइथागोरस साध्य र कम्पासको प्रयोग गरेर सङ्ख्या रेखामा √2, √3 र √5 निर्माण गरौँ!',
        'Hello! Construct exact positions of √2, √3, and √5 on the number line using Pythagoras theorem and compass!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Selector */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: '#f8fafc', padding: 8, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          {[
            { id: 'root2', labelNp: '1. सङ्ख्या रेखामा √2 निर्माण', labelEn: '1. Construct √2', value: 'root2' },
            { id: 'root3', labelNp: '2. सङ्ख्या रेखामा √3 निर्माण', labelEn: '2. Construct √3', value: 'root3' },
            { id: 'root5', labelNp: '3. सङ्ख्या रेखामा √5 निर्माण', labelEn: '3. Construct √5', value: 'root5' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveRoot(tab.value as any);
                setCompassProgress(0);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                border: 'none',
                background: activeRoot === tab.value ? '#0284c7' : '#ffffff',
                color: activeRoot === tab.value ? '#ffffff' : '#334155',
                boxShadow: activeRoot === tab.value ? '0 2px 4px rgba(2, 132, 199, 0.25)' : 'none',
              }}
            >
              <Compass size={16} />
              <span>{isNe ? tab.labelNp : tab.labelEn}</span>
            </button>
          ))}
        </div>

        {/* Construction Workspace */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 480px) 1fr', gap: 20, alignItems: 'start' }}>
          {/* SVG Construction Canvas */}
          <div style={{ background: '#ffffff', borderRadius: 16, padding: 14, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0369a1', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Ruler size={16} />
              {L('कम्पासको चाप (Compass Arc) र समकोण त्रिभुज', 'Right Triangle & Compass Arc Transfer')}
            </div>

            <svg width={450} height={290} viewBox="0 0 450 290" style={{ background: '#fafbfc', borderRadius: 8, border: '1px solid #cbd5e1' }}>
              {/* Grid Lines */}
              {Array.from({ length: 5 }).map((_, i) => (
                <line key={`v-${i}`} x1={toPxX(i)} y1={20} x2={toPxX(i)} y2={270} stroke="#e2e8f0" strokeWidth={1} strokeDasharray="3" />
              ))}

              {/* Number Line */}
              <line x1={30} y1={originY} x2={430} y2={originY} stroke="#1e293b" strokeWidth={3} />
              <polygon points="432,240 422,235 422,245" fill="#1e293b" />
              <polygon points="28,240 38,235 38,245" fill="#1e293b" />

              {/* Unit Tick Marks & Labels */}
              {[0, 1, 2, 3].map((u) => (
                <g key={u}>
                  <line x1={toPxX(u)} y1={originY - 6} x2={toPxX(u)} y2={originY + 6} stroke="#1e293b" strokeWidth={2} />
                  <text x={toPxX(u)} y={originY + 22} fontSize="13" fontWeight="bold" fill="#334155" textAnchor="middle">
                    {isNe ? toNp(u) : u}
                  </text>
                </g>
              ))}

              {/* Right Triangle Base */}
              <line x1={originX} y1={originY} x2={pBaseX} y2={pBaseY} stroke="#0284c7" strokeWidth={3.5} />
              {/* Right Triangle Perpendicular */}
              <line x1={pBaseX} y1={pBaseY} x2={pTopX} y2={pTopY} stroke="#16a34a" strokeWidth={3.5} />
              {/* Hypotenuse */}
              <line x1={originX} y1={originY} x2={pTopX} y2={pTopY} stroke="#dc2626" strokeWidth={3.5} />

              {/* Right Angle Symbol */}
              <rect x={pBaseX - 10} y={originY - 10} width={10} height={10} fill="none" stroke="#64748b" strokeWidth={1.5} />

              {/* Labels for triangle sides */}
              <text x={(originX + pBaseX) / 2} y={originY - 8} fill="#0284c7" fontWeight="bold" fontSize="12" textAnchor="middle">
                {rootConfig.baseLabel}
              </text>
              <text x={pBaseX + 14} y={(originY + pTopY) / 2 + 4} fill="#16a34a" fontWeight="bold" fontSize="12">
                {rootConfig.perpLabel}
              </text>
              <text x={(originX + pTopX) / 2 - 14} y={(originY + pTopY) / 2 - 8} fill="#dc2626" fontWeight="bold" fontSize="13">
                {activeRoot === 'root2' ? '√2' : activeRoot === 'root3' ? '√3' : '√5'}
              </text>

              {/* Compass Arc from Top vertex to current needle */}
              <path
                d={`M ${pTopX} ${pTopY} A ${radiusPx} ${radiusPx} 0 0 1 ${compassEndX} ${compassEndY}`}
                fill="none"
                stroke="#e11d48"
                strokeWidth={2.5}
                strokeDasharray="4"
              />

              {/* Compass Needle Indicator */}
              <line x1={originX} y1={originY} x2={compassEndX} y2={compassEndY} stroke="#9333ea" strokeWidth={2} strokeDasharray="2" />
              <circle cx={compassEndX} cy={compassEndY} r={5} fill="#9333ea" />

              {/* Point on Number Line once sweep is complete */}
              {compassProgress >= 0.95 && (
                <g>
                  <circle cx={finalNumberLineX} cy={originY} r={7} fill="#15803d" stroke="#ffffff" strokeWidth={2} />
                  <text x={finalNumberLineX} y={originY - 14} fill="#15803d" fontWeight="900" fontSize="14" textAnchor="middle">
                    {activeRoot === 'root2' ? '√2' : activeRoot === 'root3' ? '√3' : '√5'}
                  </text>
                  <text x={finalNumberLineX} y={originY + 36} fill="#047857" fontWeight="bold" fontSize="11" textAnchor="middle">
                    ≈ {isNe ? toNp(rootConfig.approx) : rootConfig.approxEn}
                  </text>
                </g>
              )}

              {/* Origin O */}
              <text x={originX - 12} y={originY + 18} fill="#dc2626" fontWeight="bold" fontSize="13">O</text>
            </svg>

            {/* Interactive Compass Slider */}
            <div style={{ width: '100%', marginTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                <span>{L('कम्पासको चाप घुमाउनुहोस् (Sweep Compass):', 'Sweep Compass to Number Line:')}</span>
                <span>{Math.round(compassProgress * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={compassProgress}
                onChange={(e) => {
                  setCompassProgress(parseFloat(e.target.value));
                  if (parseFloat(e.target.value) >= 0.98) kit.good();
                }}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* Right Explanation & Proof Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: '#f8fafc', padding: 18, borderRadius: 14, border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#0369a1', fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Triangle size={20} />
                {isNe ? rootConfig.nameNp : rootConfig.nameEn}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, lineHeight: 1.6, color: '#334155' }}>
                <div style={{ background: '#ffffff', padding: 12, borderRadius: 8, borderLeft: '4px solid #0284c7' }}>
                  <strong>{L('1. समकोण त्रिभुज रचना:', '1. Right Triangle Formation:')}</strong><br />
                  {L(
                    `सङ्ख्या रेखामा आधार ${rootConfig.baseLabel} एकाइ र लम्ब 1 एकाइ लिएर समकोण त्रिभुज बनाइन्छ।`,
                    `Construct right triangle with base = ${rootConfig.baseLabel} and perpendicular = 1 unit.`
                  )}
                </div>

                <div style={{ background: '#ffffff', padding: 12, borderRadius: 8, borderLeft: '4px solid #dc2626' }}>
                  <strong>{L('2. पाइथागोरस साध्यबाट कर्ण (Hypotenuse):', '2. Pythagoras Theorem:')}</strong><br />
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#b91c1c', marginTop: 4 }}>
                    {isNe ? rootConfig.hypotFormulaNp : rootConfig.hypotFormulaEn}
                  </div>
                </div>

                <div style={{ background: '#ffffff', padding: 12, borderRadius: 8, borderLeft: '4px solid #16a34a' }}>
                  <strong>{L('3. कम्पासद्वारा सङ्ख्या रेखामा स्थानान्तरण:', '3. Compass Arc Transfer:')}</strong><br />
                  {L(
                    'उद्गम बिन्दु O मा कम्पासको चुच्चो राखी कर्णको नाप लिएर चापलाई सङ्ख्या रेखासम्म घुमाइन्छ। यसले सङ्ख्या रेखामा ठ्याक्कै अपरिमेय सङ्ख्याको विन्दु पत्ता लगाउँछ।',
                    'Place compass point at Origin O with radius equal to hypotenuse, sweep down to intersect the number line.'
                  )}
                </div>
              </div>

              {/* Exact vs Approximation box */}
              <div style={{ marginTop: 14, background: '#f0fdf4', padding: 14, borderRadius: 10, border: '1.5px solid #bbf7d0' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#166534' }}>
                  {L('ठ्याक्कै मान (Exact) बनाम निकटीकरण (Approximation):', 'Exact Value vs Decimal Approximation:')}
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#15803d', marginTop: 4 }}>
                  {activeRoot === 'root2' ? '√2' : activeRoot === 'root3' ? '√3' : '√5'} ≈ {isNe ? toNp(rootConfig.approx) : rootConfig.approxEn}...
                </div>
                <div style={{ fontSize: 12, color: '#166534', marginTop: 4 }}>
                  {L(
                    'दशमलव मान अन्त्य नहुने भएकाले निकटीकरण मात्र हो। सङ्ख्या रेखामा कोरेको बिन्दु नै यसको वास्तविक ठ्याक्कै स्थान हो।',
                    'The decimal expansion never ends; the geometric point on the number line represents its exact real value.'
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};

export default IrrationalNumberLineLab;
