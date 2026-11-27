import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';

interface SystemProblem {
  id: string;
  nameNp: string;
  nameEn: string;
  eq1: { a: number; b: number; c: number; text: string };
  eq2: { a: number; b: number; c: number; text: string };
  solution: { x: number; y: number };
  substitutionSteps: {
    titleNp: string;
    titleEn: string;
    detailNp: string;
    detailEn: string;
    math: string;
  }[];
  eliminationSteps: {
    titleNp: string;
    titleEn: string;
    detailNp: string;
    detailEn: string;
    math: string;
  }[];
}

const SYSTEMS: SystemProblem[] = [
  {
    id: 's1',
    nameNp: 'पाठ्यपुस्तक उदाहरण १: x + y = ८ र २x - y = ४',
    nameEn: 'Textbook Example 1: x + y = 8 and 2x - y = 4',
    eq1: { a: 1, b: 1, c: 8, text: 'x + y = 8' },
    eq2: { a: 2, b: -1, c: 4, text: '2x - y = 4' },
    solution: { x: 4, y: 4 },
    substitutionSteps: [
      {
        titleNp: 'चरण १: समीकरण (i) बाट y को मान x को रूपमा व्यक्त गर्ने',
        titleEn: 'Step 1: Express y in terms of x from Eq (i)',
        detailNp: 'x + y = ८ बाट y लाई एक्लो बनाउँदा:',
        detailEn: 'From x + y = 8, isolate y:',
        math: 'y = 8 - x ... (iii)',
      },
      {
        titleNp: 'चरण २: y को मान समीकरण (ii) मा प्रतिस्थापन गर्ने',
        titleEn: 'Step 2: Substitute y into Eq (ii)',
        detailNp: '२x - y = ४ मा y = (८ - x) राख्दा:',
        detailEn: 'In 2x - y = 4, put y = (8 - x):',
        math: '2x - (8 - x) = 4 ⇒ 3x - 8 = 4 ⇒ 3x = 12 ⇒ x = 4',
      },
      {
        titleNp: 'चरण ३: x को मान समीकरण (iii) मा राखी y पत्ता लगाउने',
        titleEn: 'Step 3: Substitute x into Eq (iii) to find y',
        detailNp: 'y = ८ - x मा x = ४ राख्दा:',
        detailEn: 'In y = 8 - x, put x = 4:',
        math: 'y = 8 - 4 = 4 ⇒ (x, y) = (4, 4)',
      },
    ],
    eliminationSteps: [
      {
        titleNp: 'चरण १: y को गुणाङ्कहरू तुलना गर्ने (समान र विपरीत चिन्ह)',
        titleEn: 'Step 1: Compare y coefficients (equal and opposite signs)',
        detailNp: 'समीकरण (i) मा +y र समीकरण (ii) मा -y छ। दुवैलाई सोझै जोड्दा y हट्छ:',
        detailEn: 'Eq (i) has +y and Eq (ii) has -y. Adding them directly eliminates y:',
        math: '(x + y) + (2x - y) = 8 + 4 ⇒ 3x = 12 ⇒ x = 4',
      },
      {
        titleNp: 'चरण २: x को मान कुनै एक समीकरणमा राखी y निकाल्ने',
        titleEn: 'Step 2: Substitute x into Eq (i) to find y',
        detailNp: 'समीकरण (i): x + y = ८ मा x = ४ राख्दा:',
        detailEn: 'In Eq (i): x + y = 8, put x = 4:',
        math: '4 + y = 8 ⇒ y = 8 - 4 = 4 ⇒ (x, y) = (4, 4)',
      },
    ],
  },
  {
    id: 's2',
    nameNp: 'पाठ्यपुस्तक उदाहरण २: ३x + २y = ११ र २x + ३y = ४',
    nameEn: 'Textbook Example 2: 3x + 2y = 11 and 2x + 3y = 4',
    eq1: { a: 3, b: 2, c: 11, text: '3x + 2y = 11' },
    eq2: { a: 2, b: 3, c: 4, text: '2x + 3y = 4' },
    solution: { x: 5, y: -2 },
    substitutionSteps: [
      {
        titleNp: 'चरण १: समीकरण (i) बाट y निकाल्ने',
        titleEn: 'Step 1: Isolate y from Eq (i)',
        detailNp: '३x + २y = ११ ⇒ २y = ११ - ३x',
        detailEn: '3x + 2y = 11 ⇒ 2y = 11 - 3x',
        math: 'y = (11 - 3x) / 2 ... (iii)',
      },
      {
        titleNp: 'चरण २: समीकरण (ii) मा प्रतिस्थापन गर्ने',
        titleEn: 'Step 2: Substitute y into Eq (ii)',
        detailNp: '२x + ३[(११ - ३x)/२] = ४',
        detailEn: '2x + 3[(11 - 3x)/2] = 4',
        math: '4x + 33 - 9x = 8 ⇒ -5x = -25 ⇒ x = 5',
      },
      {
        titleNp: 'चरण ३: y पत्ता लगाउने',
        titleEn: 'Step 3: Solve for y',
        detailNp: 'y = (११ - ३(५)) / २ = (११ - १५)/२ = -४/२ = -२',
        detailEn: 'y = (11 - 3(5)) / 2 = -4/2 = -2',
        math: 'y = -2 ⇒ (x, y) = (5, -2)',
      },
    ],
    eliminationSteps: [
      {
        titleNp: 'चरण १: y को गुणाङ्क बराबर बनाउन गुणन गर्ने',
        titleEn: 'Step 1: Multiply to equalize y coefficients',
        detailNp: 'समीकरण (i) लाई ३ ले र समीकरण (ii) लाई २ ले गुणन गर्ने:',
        detailEn: 'Multiply Eq (i) by 3 and Eq (ii) by 2:',
        math: 'Eq(i)×3: 9x + 6y = 33\nEq(ii)×2: 4x + 6y = 8',
      },
      {
        titleNp: 'चरण २: समीकरणहरू घटाएर y हटाउने',
        titleEn: 'Step 2: Subtract equations to eliminate y',
        detailNp: '(९x + ६y) - (४x + ६y) = ३३ - ८',
        detailEn: '(9x + 6y) - (4x + 6y) = 33 - 8',
        math: '5x = 25 ⇒ x = 5',
      },
      {
        titleNp: 'चरण ३: x को मान समीकरण (i) मा राखी y निकाल्ने',
        titleEn: 'Step 3: Substitute x into Eq (i) to find y',
        detailNp: '३(५) + २y = ११ ⇒ १५ + २y = ११ ⇒ २y = -४',
        detailEn: '3(5) + 2y = 11 ⇒ 15 + 2y = 11 ⇒ 2y = -4',
        math: 'y = -2 ⇒ (x, y) = (5, -2)',
      },
    ],
  },
];

const QUIZ_QUESTIONS = [
  {
    np: 'प्रतिस्थापन विधि (Substitution Method) को मुख्य सिद्धान्त के हो?',
    en: 'What is the primary principle of the Substitution Method?',
    options: [
      { key: 'A', label: 'एउटा समीकरणबाट एउटा चल राशिको मान निकालेर अर्को समीकरणमा राख्ने' },
      { key: 'B', label: 'दुवै समीकरणलाई सिधै जोड्ने' },
      { key: 'C', label: 'ग्राफ कोरेर हेर्ने मात्र' },
      { key: 'D', label: 'कुनै पनि होइन' },
    ],
    answer: 'A',
  },
  {
    np: 'हटाउने वा विलोपन विधि (Elimination Method) मा कुन बेला दुई समीकरणहरू जोडिन्छ?',
    en: 'In Elimination Method, when are two equations added?',
    options: [
      { key: 'A', label: 'हटाउन खोजिएको चल राशिका गुणाङ्क बराबर र विपरीत चिन्ह (+ र -) भएका बेला' },
      { key: 'B', label: 'सधैं जोड्नुपर्छ' },
      { key: 'C', label: 'गुणाङ्कहरू समान चिन्हका भएमा' },
      { key: 'D', label: 'कहिले पनि जोड्न मिल्दैन' },
    ],
    answer: 'A',
  },
  {
    np: 'x + y = १० र x - y = २ भए x र y को मान कति हुन्छ?',
    en: 'If x + y = 10 and x - y = 2, what are the values of x and y?',
    options: [
      { key: 'A', label: 'x = 6, y = 4' },
      { key: 'B', label: 'x = 5, y = 5' },
      { key: 'C', label: 'x = 7, y = 3' },
      { key: 'D', label: 'x = 8, y = 2' },
    ],
    answer: 'A',
  },
];

export const SubstitutionEliminationLab: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U11-02',
    chapter: 11,
    titleNp: 'प्रतिस्थापन र विलोपन विधि प्रयोगशाला',
    titleEn: 'Substitution and Elimination Method Laboratory',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeSysId, setActiveSysId] = useState<string>('s1');
  const [activeMethod, setActiveMethod] = useState<'sub' | 'elim'>('sub');
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);

  const sys = SYSTEMS.find((s) => s.id === activeSysId) || SYSTEMS[0];
  const steps = activeMethod === 'sub' ? sys.substitutionSteps : sys.eliminationSteps;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! दुई अज्ञात राशि भएका युगपत समीकरणहरू समाधान गर्न प्रतिस्थापन विधि र विलोपन विधि (हटाउने विधि) को चरणबद्ध तुलना गर्नुहोस्!',
        'Welcome! Compare Substitution and Elimination methods side-by-side to master simultaneous linear equation solving!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* System Selector */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {SYSTEMS.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setActiveSysId(s.id);
                setCurrentStepIdx(0);
              }}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: activeSysId === s.id ? '2px solid #0D9488' : '1px solid #CBD5E1',
                backgroundColor: activeSysId === s.id ? '#F0FDFA' : '#FFFFFF',
                color: activeSysId === s.id ? '#0F766E' : '#475569',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: isNe ? FONT_NP : 'inherit',
                fontSize: 13,
              }}
            >
              {L(s.nameNp, s.nameEn)}
            </button>
          ))}
        </div>

        {/* Method Toggle Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 16,
            backgroundColor: '#F8FAFC',
            padding: 10,
            borderRadius: 10,
          }}
        >
          <button
            onClick={() => {
              setActiveMethod('sub');
              setCurrentStepIdx(0);
            }}
            style={{
              padding: '8px 20px',
              borderRadius: 8,
              border: activeMethod === 'sub' ? '2px solid #2563EB' : '1px solid #CBD5E1',
              backgroundColor: activeMethod === 'sub' ? '#EFF6FF' : '#FFFFFF',
              color: activeMethod === 'sub' ? '#1D4ED8' : '#475569',
              fontWeight: 800,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            🔄 {L('प्रतिस्थापन विधि (Substitution)', 'Substitution Method')}
          </button>
          <button
            onClick={() => {
              setActiveMethod('elim');
              setCurrentStepIdx(0);
            }}
            style={{
              padding: '8px 20px',
              borderRadius: 8,
              border: activeMethod === 'elim' ? '2px solid #D97706' : '1px solid #CBD5E1',
              backgroundColor: activeMethod === 'elim' ? '#FFFBEB' : '#FFFFFF',
              color: activeMethod === 'elim' ? '#B45309' : '#475569',
              fontWeight: 800,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            ✂️ {L('विलोपन विधि (Elimination)', 'Elimination Method')}
          </button>
        </div>

        {/* Given Equations Banner */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            padding: 14,
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <span style={{ fontSize: 12, color: '#64748B' }}>{L('समीकरण (i):', 'Equation (i):')} </span>
            <strong style={{ fontFamily: 'monospace', fontSize: 16, color: '#1E293B' }}>
              {sys.eq1.text}
            </strong>
          </div>
          <div style={{ color: '#CBD5E1' }}>|</div>
          <div>
            <span style={{ fontSize: 12, color: '#64748B' }}>{L('समीकरण (ii):', 'Equation (ii):')} </span>
            <strong style={{ fontFamily: 'monospace', fontSize: 16, color: '#1E293B' }}>
              {sys.eq2.text}
            </strong>
          </div>
          <div style={{ color: '#CBD5E1' }}>|</div>
          <div
            style={{
              backgroundColor: '#ECFDF5',
              padding: '4px 12px',
              borderRadius: 6,
              border: '1px solid #A7F3D0',
            }}
          >
            <span style={{ fontSize: 12, color: '#065F46', fontWeight: 700 }}>
              {L('समाधान:', 'Solution:')}{' '}
              <span style={{ fontFamily: 'monospace', fontSize: 15 }}>
                x = {fmt(sys.solution.x)}, y = {fmt(sys.solution.y)}
              </span>
            </span>
          </div>
        </div>

        {/* Interactive Step-by-Step Flow */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            border: '1px solid #CBD5E1',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
              {activeMethod === 'sub'
                ? L('प्रतिस्थापन विधिको चरणहरू:', 'Substitution Method Steps:')
                : L('विलोपन विधिको चरणहरू:', 'Elimination Method Steps:')}
            </span>
            <span style={{ fontSize: 12, color: '#64748B' }}>
              {L('चरण', 'Step')} {fmt(currentStepIdx + 1)} / {fmt(steps.length)}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {steps.map((st, idx) => {
              const isCurrent = idx === currentStepIdx;
              const isPast = idx < currentStepIdx;
              return (
                <div
                  key={idx}
                  onClick={() => setCurrentStepIdx(idx)}
                  style={{
                    padding: 14,
                    borderRadius: 10,
                    border: isCurrent
                      ? '2px solid #2563EB'
                      : isPast
                      ? '1px solid #93C5FD'
                      : '1px solid #E2E8F0',
                    backgroundColor: isCurrent ? '#EFF6FF' : isPast ? '#F8FAFC' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        backgroundColor: isCurrent ? '#2563EB' : isPast ? '#3B82F6' : '#94A3B8',
                        color: '#FFFFFF',
                        fontSize: 12,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {fmt(idx + 1)}
                    </span>
                    <strong style={{ fontSize: 14, color: '#1E293B' }}>
                      {L(st.titleNp, st.titleEn)}
                    </strong>
                  </div>

                  <div style={{ marginTop: 6, paddingLeft: 36, fontSize: 13, color: '#475569' }}>
                    {L(st.detailNp, st.detailEn)}
                  </div>

                  <div
                    style={{
                      marginTop: 8,
                      paddingLeft: 36,
                      fontFamily: 'monospace',
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#1D4ED8',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {st.math}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stepper Navigation Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
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
                fontSize: 13,
              }}
            >
              ← {L('अघिल्लो चरण', 'Previous Step')}
            </button>
            <button
              disabled={currentStepIdx >= steps.length - 1}
              onClick={() => setCurrentStepIdx((prev) => Math.min(steps.length - 1, prev + 1))}
              style={{
                padding: '6px 16px',
                borderRadius: 6,
                border: 'none',
                backgroundColor: currentStepIdx >= steps.length - 1 ? '#94A3B8' : '#2563EB',
                color: '#FFFFFF',
                cursor: currentStepIdx >= steps.length - 1 ? 'not-allowed' : 'pointer',
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              {L('अर्को चरण', 'Next Step')} →
            </button>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};

export default SubstitutionEliminationLab;
