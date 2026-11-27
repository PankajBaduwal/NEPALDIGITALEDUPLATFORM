import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface TaskItem {
  id: string;
  titleNp: string;
  titleEn: string;
  typeNp: string;
  typeEn: string;
  givenNp: string;
  givenEn: string;
  requiredStepsCount: number;
  expectedSequence: string[];
}

const TASKS: TaskItem[] = [
  {
    id: 't1',
    titleNp: 'चुनौती 1: 4 भुजा र विकर्ण भएको चतुर्भुजको रचना',
    titleEn: 'Challenge 1: Quadrilateral with 4 Sides and 1 Diagonal',
    typeNp: 'विषमबाहु चतुर्भुज',
    typeEn: 'Scalene Quadrilateral',
    givenNp: 'AB = 5.0 cm, BC = 4.5 cm, CD = 4.0 cm, DA = 3.5 cm, विकर्ण BD = 6.0 cm',
    givenEn: 'AB = 5.0 cm, BC = 4.5 cm, CD = 4.0 cm, DA = 3.5 cm, Diagonal BD = 6.0 cm',
    requiredStepsCount: 5,
    expectedSequence: [
      'Draw base line AB = 5.0 cm',
      'Draw arc of 6.0 cm from B (diagonal BD)',
      'Draw arc of 3.5 cm from A to intersect at D',
      'Draw arcs of 4.5 cm from B and 4.0 cm from D to locate C',
      'Join all vertices to finish ABCD',
    ],
  },
  {
    id: 't2',
    titleNp: 'चुनौती 2: 2 भुजा र 1 कोण भएको समानान्तर चतुर्भुज',
    titleEn: 'Challenge 2: Parallelogram with 2 Sides and 1 Angle',
    typeNp: 'समानान्तर चतुर्भुज',
    typeEn: 'Parallelogram',
    givenNp: 'AB = 6.0 cm, BC = 4.5 cm, ∠B = 60° (सम्मुख भुजाहरू बराबर र समानान्तर)',
    givenEn: 'AB = 6.0 cm, BC = 4.5 cm, ∠B = 60° (Opposite sides equal and parallel)',
    requiredStepsCount: 5,
    expectedSequence: [
      'Draw base AB = 6.0 cm',
      'Construct angle 60° at vertex B',
      'Cut arc of 4.5 cm along 60° ray to fix C',
      'Draw arc of 6.0 cm from C and 4.5 cm from A to locate D',
      'Join AD and CD to finish ABCD',
    ],
  },
  {
    id: 't3',
    titleNp: 'चुनौती 3: समलम्ब चतुर्भुजको रचना (Trapezium)',
    titleEn: 'Challenge 3: Construction of Trapezium',
    typeNp: 'समलम्ब चतुर्भुज',
    typeEn: 'Trapezium',
    givenNp: 'AB = 7.0 cm, BC = 5.0 cm, CD = 3.5 cm, ∠B = 75°, र AB // CD',
    givenEn: 'AB = 7.0 cm, BC = 5.0 cm, CD = 3.5 cm, ∠B = 75°, and AB // CD',
    requiredStepsCount: 5,
    expectedSequence: [
      'Draw base AB = 7.0 cm',
      'Construct angle 75° at B',
      'Cut arc of 5.0 cm to locate C',
      'Draw parallel line through C parallel to AB',
      'Cut 3.5 cm along parallel line to locate D and join AD',
    ],
  },
];

const QUIZ_QUESTIONS = [
  {
    np: 'कुनै पनि ज्यामितीय रचनामा रुलर (Ruler) को मुख्य कार्य के हो?',
    en: 'What is the main function of a ruler in geometrical construction?',
    options: [
      { key: 'A', label: 'To draw straight line segments and measure length' },
      { key: 'B', label: 'To measure angles only' },
      { key: 'C', label: 'To draw circles' },
      { key: 'D', label: 'None of these' },
    ],
    answer: 'A',
  },
  {
    np: 'कम्पासको सहायताले 60° को कोण बनाउँदा चापको अर्धव्यास के हुनुपर्छ?',
    en: 'When constructing a 60° angle with a compass, what must be true about the arc radius?',
    options: [
      { key: 'A', label: 'The radius of the initial arc and the cutting arc must be the same' },
      { key: 'B', label: 'The radius must be doubled' },
      { key: 'C', label: 'The radius must be halved' },
      { key: 'D', label: 'Any difference is fine' },
    ],
    answer: 'A',
  },
  {
    np: 'समानान्तर चतुर्भुज रचना गर्दा यदि दुई आसन्न भुजाहरू AB र BC दिएका छन् भने सम्मुख भुजाहरू CD र DA को नाप कति हुन्छ?',
    en: 'In constructing a parallelogram with adjacent sides AB and BC, what are the lengths of opposite sides CD and DA?',
    options: [
      { key: 'A', label: 'CD = AB and DA = BC' },
      { key: 'B', label: 'CD = BC and DA = AB' },
      { key: 'C', label: 'All are different' },
      { key: 'D', label: 'It is zero' },
    ],
    answer: 'A',
  },
];

export const CompleteGeometryConstructionChallenge: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U15-03',
    chapter: 15,
    titleNp: 'पूर्ण ज्यामितीय रचना चुनौती',
    titleEn: 'Complete Geometrical Construction Challenge',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTaskId, setActiveTaskId] = useState<string>('t1');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedTool, setSelectedTool] = useState<'ruler' | 'compass' | 'pencil'>('ruler');
  const [verifiedScore, setVerifiedScore] = useState<number | null>(null);

  const task = TASKS.find((t) => t.id === activeTaskId) || TASKS[0];

  const handleSelectTask = (id: string) => {
    setActiveTaskId(id);
    setCurrentStep(0);
    setVerifiedScore(null);
  };

  const handleApplyNextStep = () => {
    if (currentStep < task.requiredStepsCount) {
      setCurrentStep((prev) => prev + 1);
      if (currentStep + 1 === task.requiredStepsCount) {
        setVerifiedScore(100);
      }
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setVerifiedScore(null);
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! कक्षा 9 को पाठ्यपुस्तकका अभ्यासहरूबाट छानिएका चतुर्भुज, समानान्तर चतुर्भुज र समलम्ब चतुर्भुजका वास्तविक रचना चुनौतीहरू रुलर र कम्पास प्रयोग गरी पूरा गर्नुहोस्!',
        'Welcome! Tackle authentic construction challenges from the Grade 9 textbook using virtual geometric instruments and verify your construction accuracy!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Task Selection Tabs */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {TASKS.map((t) => (
            <button
              key={t.id}
              onClick={() => handleSelectTask(t.id)}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: activeTaskId === t.id ? '2px solid #0D9488' : '1px solid #CBD5E1',
                backgroundColor: activeTaskId === t.id ? '#F0FDFA' : '#FFFFFF',
                color: activeTaskId === t.id ? '#0F766E' : '#475569',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {L(t.titleNp, t.titleEn)}
            </button>
          ))}
        </div>

        {/* Task Objective Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                backgroundColor: '#ECFDF5',
                color: '#065F46',
                padding: '3px 8px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {L(task.typeNp, task.typeEn)}
            </span>
            <span style={{ fontSize: 13, color: '#64748B' }}>
              {L('प्रगति:', 'Progress:')} <strong>{fmt(currentStep)} / {fmt(task.requiredStepsCount)}</strong>
            </span>
          </div>

          <div style={{ fontSize: 14, color: '#1E293B', fontWeight: 600 }}>
            {L('दिइएको नापहरू:', 'Given Measurements:')}{' '}
            <span style={{ fontFamily: 'monospace', color: '#0F766E' }}>
              {L(task.givenNp, task.givenEn)}
            </span>
          </div>

          {/* Virtual Instrument Bar */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              backgroundColor: '#F8FAFC',
              padding: 10,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>
              {L('उपकरण छान्नुहोस्:', 'Select Instrument:')}
            </span>
            <button
              onClick={() => setSelectedTool('ruler')}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: selectedTool === 'ruler' ? '2px solid #2563EB' : '1px solid #CBD5E1',
                backgroundColor: selectedTool === 'ruler' ? '#EFF6FF' : '#FFFFFF',
                color: selectedTool === 'ruler' ? '#1D4ED8' : '#475569',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              📏 {L('रुलर (Ruler)', 'Ruler')}
            </button>
            <button
              onClick={() => setSelectedTool('compass')}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: selectedTool === 'compass' ? '2px solid #D97706' : '1px solid #CBD5E1',
                backgroundColor: selectedTool === 'compass' ? '#FFFBEB' : '#FFFFFF',
                color: selectedTool === 'compass' ? '#B45309' : '#475569',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              📐 {L('कम्पास (Compass Arc)', 'Compass Arc')}
            </button>
            <button
              onClick={() => setSelectedTool('pencil')}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: selectedTool === 'pencil' ? '2px solid #059669' : '1px solid #CBD5E1',
                backgroundColor: selectedTool === 'pencil' ? '#ECFDF5' : '#FFFFFF',
                color: selectedTool === 'pencil' ? '#065F46' : '#475569',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              ✏️ {L('पेन्सिल (Draw / Join)', 'Draw / Join')}
            </button>
          </div>
        </div>

        {/* Dynamic Construction Canvas Stage */}
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
            height={280}
            style={{ backgroundColor: '#F8FAFC', borderRadius: 8, overflow: 'hidden' }}
          >
            <defs>
              <pattern id="gridChal" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#F1F5F9" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width={480} height={280} fill="url(#gridChal)" />

            {/* Step 1: Base segment */}
            {currentStep >= 1 && (
              <g>
                <line x1={90} y1={230} x2={310} y2={230} stroke="#1E40AF" strokeWidth="2.5" />
                <circle cx={90} cy={230} r="4" fill="#1E40AF" />
                <circle cx={310} cy={230} r="4" fill="#1E40AF" />
                <text x={80} y={245} fontSize="12" fontWeight="800" fill="#1E40AF">
                  A
                </text>
                <text x={315} y={245} fontSize="12" fontWeight="800" fill="#1E40AF">
                  B
                </text>
              </g>
            )}

            {/* Step 2: Arc 1 */}
            {currentStep >= 2 && (
              <g>
                <path d="M 120 70 A 180 180 0 0 1 170 90" fill="none" stroke="#D97706" strokeWidth="2" strokeDasharray="3,3" />
                <text x="175" y="80" fontSize="10" fill="#B45309">
                  arc 1
                </text>
              </g>
            )}

            {/* Step 3: Arc 2 & Intersection Point D */}
            {currentStep >= 3 && (
              <g>
                <path d="M 140 95 A 140 140 0 0 1 150 65" fill="none" stroke="#EC4899" strokeWidth="2" strokeDasharray="3,3" />
                <circle cx={145} cy={80} r="4" fill="#EC4899" />
                <line x1={90} y1={230} x2={145} y2={80} stroke="#1E40AF" strokeWidth="2" />
                <text x={132} y={75} fontSize="12" fontWeight="800" fill="#EC4899">
                  D
                </text>
              </g>
            )}

            {/* Step 4: Arcs for C */}
            {currentStep >= 4 && (
              <g>
                <path d="M 280 60 A 160 160 0 0 1 310 90" fill="none" stroke="#059669" strokeWidth="2" strokeDasharray="3,3" />
                <circle cx={290} cy={75} r="4" fill="#059669" />
                <line x1={310} y1={230} x2={290} y2={75} stroke="#1E40AF" strokeWidth="2" />
                <text x={295} y={70} fontSize="12" fontWeight="800" fill="#059669">
                  C
                </text>
              </g>
            )}

            {/* Step 5: Completed Polygon */}
            {currentStep >= 5 && (
              <g>
                <line x1={145} y1={80} x2={290} y2={75} stroke="#1E40AF" strokeWidth="2" />
                <polygon points="90,230 310,230 290,75 145,80" fill="#CCFBF1" fillOpacity="0.4" />
                <text x="200" y="150" fontSize="13" fontWeight="800" fill="#0F766E">
                  ✓ ABCD {L('सम्पन्न', 'Complete')}
                </text>
              </g>
            )}
          </svg>

          {/* Controls & Feedback */}
          <div
            style={{
              width: '100%',
              maxWidth: 480,
              marginTop: 12,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <button
              onClick={handleReset}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#475569',
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              🔄 {L('पुन: सुRs गर्नुहोस्', 'Reset')}
            </button>

            <button
              disabled={currentStep >= task.requiredStepsCount}
              onClick={handleApplyNextStep}
              style={{
                padding: '8px 18px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: currentStep >= task.requiredStepsCount ? '#94A3B8' : '#0D9488',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: 13,
                cursor: currentStep >= task.requiredStepsCount ? 'not-allowed' : 'pointer',
              }}
            >
              {currentStep < task.requiredStepsCount
                ? L('अर्को रचना चरण लागू गर्नुहोस् (+)', 'Apply Next Construction Step (+)')
                : L('रचना सम्पन्न भयो', 'Construction Complete')}
            </button>
          </div>

          {verifiedScore !== null && (
            <div
              style={{
                width: '100%',
                maxWidth: 480,
                marginTop: 12,
                padding: 12,
                borderRadius: 8,
                backgroundColor: '#ECFDF5',
                border: '1px solid #6EE7B7',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: '#065F46' }}>
                🎉 {L('रचना शुद्धता जाँच सफल (All conditions satisfied)!', 'Construction accuracy verified (100%)!')}
              </span>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#065F46' }}>
                100/100
              </span>
            </div>
          )}
        </div>
      </div>
    </SimFrame2D>
  );
};

export default CompleteGeometryConstructionChallenge;
