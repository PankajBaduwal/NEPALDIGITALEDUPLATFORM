import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface ProofCase {
  id: string;
  titleNp: string;
  titleEn: string;
  statementNp: string;
  statementEn: string;
  steps: {
    statement: string;
    reason: string;
    missing: boolean;
    options?: string[];
    correctAnswer?: string;
  }[];
}

const THEOREMS: ProofCase[] = [
  {
    id: 'th1',
    titleNp: 'साध्य 1: समद्विबाहु त्रिभुजका आधार कोणहरू बराबर हुन्छन्',
    titleEn: 'Theorem 1: Base angles of an isosceles triangle are equal',
    statementNp: 'समद्विबाहु त्रिभुजमा बराबर भुजाहरूका सम्मुख कोणहरू (आधार कोणहरू) आपसमा बराबर हुन्छन् (If AB = AC then ∠B = ∠C)।',
    statementEn: 'In an isosceles triangle, the angles opposite to the equal sides are equal (If AB = AC then ∠B = ∠C).',
    steps: [
      {
        statement: 'Construction: the bisector AD of the vertex angle ∠A is drawn.',
        reason: 'By construction',
        missing: false,
      },
      {
        statement: 'In △ABD and △ACD: (i) AB = AC, (ii) ∠BAD = ∠CAD, (iii) AD = AD',
        reason: 'Given, by construction and common side',
        missing: false,
      },
      {
        statement: '△ABD ≅ △ACD',
        reason: 'By the S.A.S. congruence condition',
        missing: true,
        options: ['S.A.S. condition', 'S.S.S. condition', 'A.S.A. condition'],
        correctAnswer: 'S.A.S. condition',
      },
      {
        statement: '∠B = ∠C',
        reason: 'Corresponding angles of congruent triangles',
        missing: true,
        options: [
          'Corresponding angles of congruent triangles',
          'Adjacent angles',
          'Vertically opposite angles',
        ],
        correctAnswer: 'Corresponding angles of congruent triangles',
      },
    ],
  },
  {
    id: 'th2',
    titleNp: 'साध्य 2: ठूलो कोणको सम्मुख भुजा लामो हुन्छ',
    titleEn: 'Theorem 2: The side opposite to the greater angle is longer',
    statementNp: 'कुनै त्रिभुजमा दुई कोणहरू असमान भए ठूलो कोणको सम्मुख भुजा सानो कोणको सम्मुख भुजा भन्दा लामो हुन्छ।',
    statementEn: 'In any triangle, if two angles are unequal, the side opposite to the greater angle is longer.',
    steps: [
      {
        statement: 'Let ∠B > ∠C in △ABC.',
        reason: 'Given',
        missing: false,
      },
      {
        statement: 'If AC > AB is not true: (i) AC = AB or (ii) AC < AB must be true.',
        reason: 'Possibilities',
        missing: false,
      },
      {
        statement: 'If AC = AB then ∠B = ∠C, which contradicts what is given.',
        reason: 'By the isosceles triangle theorem (contradiction)',
        missing: false,
      },
      {
        statement: 'If AC < AB then ∠B < ∠C, which is also impossible.',
        reason: 'The opposite possibility is proved false (contradiction)',
        missing: false,
      },
      {
        statement: 'Therefore AC > AB necessarily.',
        reason: 'Proved by contradiction',
        missing: true,
        options: ['Proved by contradiction', 'By direct measurement', 'रचनाद्वारा मात्र'],
        correctAnswer: 'Proved by contradiction',
      },
    ],
  },
];

interface NumProblem {
  id: string;
  questionNp: string;
  questionEn: string;
  diagram: string;
  correctVal: number;
  unit: string;
  hintNp: string;
  hintEn: string;
}

const NUM_PROBLEMS: NumProblem[] = [
  {
    id: 'np1',
    questionNp: 'समद्विबाहु त्रिभुज △ABC मा AB = AC र शीर्ष कोण ∠A = 50° भए आधार कोण ∠B को मान कति हुन्छ?',
    questionEn: 'In isosceles △ABC with AB = AC and vertical angle ∠A = 50°, find base angle ∠B.',
    diagram: '△ABC: AB = AC, ∠A = 50°, ∠B = ∠C = ?',
    correctVal: 65,
    unit: '°',
    hintNp: '∠B = ∠C हुन्छ। अतः ∠B = (180° - 50°) ÷ 2 = 130° ÷ 2 = 65°',
    hintEn: '∠B = ∠C. Thus ∠B = (180° - 50°) / 2 = 130° / 2 = 65°',
  },
  {
    id: 'np2',
    questionNp: 'कुनै त्रिभुजको बाहिरी कोण 110° र एउटा अनासन्न भित्री कोण 40° भए अर्को अनासन्न भित्री कोण कति हुन्छ?',
    questionEn: 'If an exterior angle of a triangle is 110° and one remote interior angle is 40°, find the other interior angle.',
    diagram: 'Exterior ∠ = 110°, Interior₁ = 40°, Interior₂ = ?',
    correctVal: 70,
    unit: '°',
    hintNp: 'बाहिरी कोण = अनासन्न दुई भित्री कोणहरूको योगफल। अतः 110° - 40° = 70°',
    hintEn: 'Exterior angle = Int₁ + Int₂. Therefore, 110° - 40° = 70°',
  },
];

const QUIZ_QUESTIONS = [
  {
    np: 'समद्विबाहु त्रिभुजको शीर्ष कोणबाट आधारमा खिचिएको लम्बले के गर्छ?',
    en: 'What does the perpendicular drawn from the vertex to the base of an isosceles triangle do?',
    options: [
      { key: 'A', label: 'It bisects both the base and the vertex angle into two equal parts' },
      { key: 'B', label: 'It bisects only the base' },
      { key: 'C', label: 'It bisects only the angle' },
      { key: 'D', label: 'It does neither' },
    ],
    answer: 'A',
  },
  {
    np: 'त्रिभुजका तीन भुजाहरू 3 cm, 4 cm र 8 cm हुन They can वा सक्दैनन्?',
    en: 'Can 3cm, 4cm, and 8cm form a triangle?',
    options: [
      { key: 'A', label: 'They cannot (because 3 + 4 = 7 < 8, against the triangle inequality)' },
      { key: 'B', label: 'They can' },
      { key: 'C', label: 'It forms a right-angled triangle' },
      { key: 'D', label: 'It forms an equilateral triangle' },
    ],
    answer: 'A',
  },
  {
    np: 'समबाहु त्रिभुजका प्रत्येक कोण कति degreesका हुन्छन्?',
    en: 'What is the measure of each interior angle in an equilateral triangle?',
    options: [
      { key: 'A', label: '60°' },
      { key: 'B', label: '90°' },
      { key: 'C', label: '45°' },
      { key: 'D', label: '180°' },
    ],
    answer: 'A',
  },
];

export const TriangleTheoremsProblemSolver: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U13-03',
    chapter: 13,
    titleNp: 'त्रिभुज साध्य तथा समस्या समाधान प्रयोगशाला',
    titleEn: 'Triangle Theorem and Problem-Solving Laboratory',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'proofs' | 'numerical'>('proofs');

  // Proofs state
  const [selectedThId, setSelectedThId] = useState<string>('th1');
  const [userProofAnswers, setUserProofAnswers] = useState<Record<number, string>>({});
  const [proofVerified, setProofVerified] = useState<boolean>(false);

  const theorem = THEOREMS.find((t) => t.id === selectedThId) || THEOREMS[0];

  // Numerical problems state
  const [activeProbIdx, setActiveProbIdx] = useState<number>(0);
  const [userNumInput, setUserNumInput] = useState<string>('');
  const [numFeedback, setNumFeedback] = useState<'none' | 'correct' | 'incorrect'>('none');
  const [showHint, setShowHint] = useState<boolean>(false);

  const currProb = NUM_PROBLEMS[activeProbIdx];

  const handleVerifyProof = () => {
    let allCorrect = true;
    theorem.steps.forEach((st, idx) => {
      if (st.missing && userProofAnswers[idx] !== st.correctAnswer) {
        allCorrect = false;
      }
    });
    setProofVerified(allCorrect);
  };

  const handleCheckNumerical = () => {
    if (Number(userNumInput) === currProb.correctVal) {
      setNumFeedback('correct');
    } else {
      setNumFeedback('incorrect');
    }
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'स्वागत छ! त्रिभुजका प्रमुख साध्यहरू (समद्विबाहु त्रिभुजका आधार कोणहरू, ठूलो कोण र लामो भुजा) का प्रमाणहरू र कोण निकाल्ने अभ्यासहरू यहाँ प्रत्यक्ष समाधान गर्नुहोस्!',
        'Welcome! Investigate key triangle theorems with interactive two-column proofs and solve numerical angle problems step-by-step!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
          <button
            onClick={() => setActiveTab('proofs')}
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              border: activeTab === 'proofs' ? '2px solid #0D9488' : '1px solid #CBD5E1',
              backgroundColor: activeTab === 'proofs' ? '#F0FDFA' : '#FFFFFF',
              color: activeTab === 'proofs' ? '#0F766E' : '#475569',
              fontWeight: 800,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            📜 {L('साध्य प्रमाणीकरण (Theorem Proofs)', 'Theorem Proofs')}
          </button>
          <button
            onClick={() => setActiveTab('numerical')}
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              border: activeTab === 'numerical' ? '2px solid #2563EB' : '1px solid #CBD5E1',
              backgroundColor: activeTab === 'numerical' ? '#EFF6FF' : '#FFFFFF',
              color: activeTab === 'numerical' ? '#1D4ED8' : '#475569',
              fontWeight: 800,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            🔢 {L('संख्यात्मक समस्या समाधान (Angle Problems)', 'Angle Calculations')}
          </button>
        </div>

        {activeTab === 'proofs' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Theorem Selectors */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              {THEOREMS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedThId(t.id);
                    setUserProofAnswers({});
                    setProofVerified(false);
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: selectedThId === t.id ? '2px solid #0D9488' : '1px solid #CBD5E1',
                    backgroundColor: selectedThId === t.id ? '#CCFBF1' : '#FFFFFF',
                    color: selectedThId === t.id ? '#0F766E' : '#475569',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  {L(t.titleNp, t.titleEn)}
                </button>
              ))}
            </div>

            {/* Statement Banner */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: 14,
                borderLeft: '4px solid #0D9488',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0F766E' }}>
                {L('साध्यको कथन (Theorem Statement):', 'Theorem Statement:')}
              </div>
              <div style={{ fontSize: 14, color: '#1E293B', marginTop: 4, fontWeight: 600 }}>
                {L(theorem.statementNp, theorem.statementEn)}
              </div>
            </div>

            {/* Two Column Proof Table */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
                {L('दुई स्तम्भीय प्रमाण (Two-Column Proof):', 'Two-Column Proof Table:')}
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC' }}>
                    <th style={{ width: '50%', padding: '8px 12px', textAlign: 'left', border: '1px solid #E2E8F0' }}>
                      {L('दाबी (Statements)', 'Statements')}
                    </th>
                    <th style={{ width: '50%', padding: '8px 12px', textAlign: 'left', border: '1px solid #E2E8F0' }}>
                      {L('कारण (Reasons)', 'Reasons')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {theorem.steps.map((st, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '10px 12px', border: '1px solid #E2E8F0', verticalAlign: 'top' }}>
                        {idx + 1}. {st.statement}
                      </td>
                      <td style={{ padding: '10px 12px', border: '1px solid #E2E8F0', verticalAlign: 'top' }}>
                        {st.missing ? (
                          <select
                            value={userProofAnswers[idx] || ''}
                            onChange={(e) =>
                              setUserProofAnswers({ ...userProofAnswers, [idx]: e.target.value })
                            }
                            style={{
                              width: '100%',
                              padding: '6px 8px',
                              borderRadius: 6,
                              border: '1px solid #CBD5E1',
                              fontSize: 12,
                              backgroundColor: '#F0FDFA',
                              color: '#0F766E',
                              fontWeight: 600,
                            }}
                          >
                            <option value="">-- {L('कारण छान्नुहोस्', 'Select Reason')} --</option>
                            {st.options?.map((opt, oIdx) => (
                              <option key={oIdx} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          `${idx + 1}. ${st.reason}`
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button
                  onClick={handleVerifyProof}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: '#0D9488',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  {L('प्रमाण जाँच्नुहोस्', 'Verify Proof')}
                </button>
              </div>

              {proofVerified && (
                <div
                  style={{
                    padding: 12,
                    backgroundColor: '#ECFDF5',
                    borderRadius: 8,
                    border: '1px solid #6EE7B7',
                    color: '#065F46',
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  🎉 {L('प्रमाणित भयो! सबै दाबी र कारणहरू पूर्ण रूपमा सही छन्। (Q.E.D.)', 'Verified! All statements and reasons are logically sound. (Q.E.D.)')}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Question Selector */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              {NUM_PROBLEMS.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setActiveProbIdx(i);
                    setUserNumInput('');
                    setNumFeedback('none');
                    setShowHint(false);
                  }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    border: activeProbIdx === i ? '2px solid #2563EB' : '1px solid #CBD5E1',
                    backgroundColor: activeProbIdx === i ? '#EFF6FF' : '#FFFFFF',
                    color: activeProbIdx === i ? '#1D4ED8' : '#475569',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  {L(`समस्या ${fmt(i + 1)}`, `Problem ${i + 1}`)}
                </button>
              ))}
            </div>

            {/* Problem Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 600, color: '#1E293B', lineHeight: 1.6 }}>
                {L(currProb.questionNp, currProb.questionEn)}
              </div>

              <div
                style={{
                  padding: 10,
                  backgroundColor: '#F8FAFC',
                  borderRadius: 8,
                  fontFamily: 'monospace',
                  fontSize: 13,
                  color: '#2563EB',
                }}
              >
                {currProb.diagram}
              </div>

              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 6 }}>
                <input
                  type="number"
                  placeholder={L('उत्तर', 'value')}
                  value={userNumInput}
                  onChange={(e) => setUserNumInput(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: '1px solid #CBD5E1',
                    fontSize: 14,
                    width: 120,
                  }}
                />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#475569' }}>{currProb.unit}</span>

                <button
                  onClick={handleCheckNumerical}
                  style={{
                    padding: '7px 16px',
                    borderRadius: 6,
                    border: 'none',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  {L('जाँच गर्नुहोस्', 'Check')}
                </button>

                <button
                  onClick={() => setShowHint(!showHint)}
                  style={{
                    padding: '7px 12px',
                    borderRadius: 6,
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#D97706',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  💡 {showHint ? L('संकेत लुकाउने', 'Hide Hint') : L('संकेत हेर्ने', 'Show Hint')}
                </button>
              </div>

              {numFeedback === 'correct' && (
                <div style={{ padding: 10, backgroundColor: '#ECFDF5', borderRadius: 6, color: '#065F46', fontWeight: 700, fontSize: 13 }}>
                  🎉 {L('सही उत्तर! स्याबास!', 'Correct answer! Well done!')}
                </div>
              )}

              {numFeedback === 'incorrect' && (
                <div style={{ padding: 10, backgroundColor: '#FEF2F2', borderRadius: 6, color: '#991B1B', fontSize: 13 }}>
                  ❌ {L('मिलेन, कृपया पुनः प्रयास गर्नुहोस् वा संकेत हेर्नुहोस्।', 'Incorrect, please try again or check the hint.')}
                </div>
              )}

              {showHint && (
                <div style={{ padding: 10, backgroundColor: '#FFFBEB', borderRadius: 6, border: '1px solid #FCD34D', color: '#B45309', fontSize: 12, lineHeight: 1.5 }}>
                  <strong>{L('संकेत:', 'Hint:')}</strong> {L(currProb.hintNp, currProb.hintEn)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default TriangleTheoremsProblemSolver;
