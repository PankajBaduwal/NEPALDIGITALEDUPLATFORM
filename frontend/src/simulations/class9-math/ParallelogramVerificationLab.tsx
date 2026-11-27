import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface ProofStep {
  statement: string;
  reason: string;
  missing: boolean;
  options?: string[];
  correctAnswer?: string;
}

const PROOF_STEPS: ProofStep[] = [
  {
    statement: '△AOB र △COD मा:',
    reason: 'तुलना गर्दा (Comparing triangles)',
    missing: false,
  },
  {
    statement: '(i) ∠OAB = ∠OCD (Alternate angles)',
    reason: 'AB // CD भएकाले एकान्तर कोणहरू बराबर',
    missing: true,
    options: ['AB // CD भएकाले एकान्तर कोणहरू बराबर', 'शीर्षाभिमुख कोणहरू', 'आसन्न कोणहरू'],
    correctAnswer: 'AB // CD भएकाले एकान्तर कोणहरू बराबर',
  },
  {
    statement: '(ii) AB = CD',
    reason: 'समानान्तर चतुर्भुजका सम्मुख भुजाहरू बराबर',
    missing: false,
  },
  {
    statement: '(iii) ∠OBA = ∠ODC (Alternate angles)',
    reason: 'AB // CD भएकाले एकान्तर कोणहरू बराबर',
    missing: false,
  },
  {
    statement: '△AOB ≅ △COD',
    reason: 'को.भु.को. (A.S.A.) अनुरुपता सर्त अनुसार',
    missing: true,
    options: ['को.भु.को. (A.S.A.) सर्त', 'भु.भु.भु. (S.S.S.) सर्त', 'भु.को.भु. (S.A.S.) सर्त'],
    correctAnswer: 'को.भु.को. (A.S.A.) सर्त',
  },
  {
    statement: 'अतः AO = OC र BO = OD',
    reason: 'अनुरुप त्रिभुजका अनुरुप भुजाहरू (Corresponding sides of congruent triangles)',
    missing: true,
    options: [
      'अनुरुप त्रिभुजका अनुरुप भुजाहरू (Corresponding sides of congruent triangles)',
      'साझा भुजाहरू',
      'रचना अनुसार',
    ],
    correctAnswer: 'अनुरुप त्रिभुजका अनुरुप भुजाहरू (Corresponding sides of congruent triangles)',
  },
];

const QUIZ_QUESTIONS = [
  {
    np: 'समानान्तर चतुर्भुजका विकर्णहरूले एक अर्कालाई के गर्छन्?',
    en: 'What do the diagonals of a parallelogram do to each other?',
    options: [
      { key: 'A', label: 'परस्पर समद्विभाजित गर्छन् (Bisect each other: AO = OC, BO = OD)' },
      { key: 'B', label: 'सधैं बराबर हुन्छन्' },
      { key: 'C', label: 'काट्दैनन्' },
      { key: 'D', label: 'कुनै सम्बन्ध हुँदैन' },
    ],
    answer: 'A',
  },
  {
    np: 'समानान्तर चतुर्भुज ABCD मा ∠A = ७०° भए सम्मुख कोण ∠C को मान कति हुन्छ?',
    en: 'In parallelogram ABCD, if ∠A = 70°, what is the value of opposite angle ∠C?',
    options: [
      { key: 'A', label: '70° (सम्मुख कोणहरू बराबर हुन्छन्)' },
      { key: 'B', label: '110°' },
      { key: 'C', label: '90°' },
      { key: 'D', label: '140°' },
    ],
    answer: 'A',
  },
  {
    np: 'समानान्तर चतुर्भुजका कुनै दुई आसन्न कोणहरूको योगफल कति हुन्छ?',
    en: 'What is the sum of any two adjacent angles of a parallelogram?',
    options: [
      { key: 'A', label: '180° (क्रमागत भित्री कोणहरू)' },
      { key: 'B', label: '360°' },
      { key: 'C', label: '90°' },
      { key: 'D', label: '120°' },
    ],
    answer: 'A',
  },
];

export const ParallelogramVerificationLab: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U14-02',
    chapter: 14,
    titleNp: 'समानान्तर चतुर्भुजका गुणहरूको प्रमाणीकरण प्रयोगशाला',
    titleEn: 'Parallelogram Properties Verification Laboratory',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'visual' | 'proof'>('visual');

  // Parallelogram parameter controls
  const [baseLength, setBaseLength] = useState<number>(220); // AB & CD px
  const [slantAngle, setSlantAngle] = useState<number>(65); // degrees
  const [slantSide, setSlantSide] = useState<number>(140); // AD & BC px

  // Coordinates:
  // D is bottom-left origin (110, 240)
  const pD = { x: 110, y: 240 };
  const pC = { x: pD.x + baseLength, y: pD.y };
  const rad = (slantAngle * Math.PI) / 180;
  const pA = {
    x: pD.x + slantSide * Math.cos(rad),
    y: pD.y - slantSide * Math.sin(rad),
  };
  const pB = { x: pA.x + baseLength, y: pA.y };

  // Intersection of diagonals O is midpoint of AC and BD
  const pO = {
    x: (pA.x + pC.x) / 2,
    y: (pA.y + pC.y) / 2,
  };

  // Segment lengths (in cm, 25px = 1cm)
  const pxToCm = 25;
  const lenAB = (baseLength / pxToCm).toFixed(1);
  const lenCD = (baseLength / pxToCm).toFixed(1);
  const lenAD = (slantSide / pxToCm).toFixed(1);
  const lenBC = (slantSide / pxToCm).toFixed(1);

  const lenAO = (Math.hypot(pO.x - pA.x, pO.y - pA.y) / pxToCm).toFixed(1);
  const lenOC = (Math.hypot(pC.x - pO.x, pC.y - pO.y) / pxToCm).toFixed(1);
  const lenBO = (Math.hypot(pO.x - pB.x, pO.y - pB.y) / pxToCm).toFixed(1);
  const lenOD = (Math.hypot(pD.x - pO.x, pD.y - pO.y) / pxToCm).toFixed(1);

  // Angles
  const angleD = slantAngle;
  const angleA = 180 - slantAngle;
  const angleB = slantAngle;
  const angleC = 180 - slantAngle;

  // Proof state
  const [proofAnswers, setProofAnswers] = useState<Record<number, string>>({});
  const [proofVerified, setProofVerified] = useState<boolean>(false);

  const handleVerifyProof = () => {
    let allOk = true;
    PROOF_STEPS.forEach((st, idx) => {
      if (st.missing && proofAnswers[idx] !== st.correctAnswer) {
        allOk = false;
      }
    });
    setProofVerified(allOk);
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! समानान्तर चतुर्भुजका चार प्रमुख विशेषताहरू: १) सम्मुख भुजाहरू बराबर र समानान्तर, २) सम्मुख कोणहरू बराबर, ३) आसन्न कोणहरू १८०°, र ४) विकर्णहरू आपसमा समद्विभाजित हुने गुणलाई यहाँ प्रत्यक्ष जाँच्नुहोस्!',
        'Welcome! Investigate the four core theorems of parallelograms: equal opposite sides, equal opposite angles, supplementary adjacent angles, and diagonal bisection!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
          <button
            onClick={() => setActiveTab('visual')}
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              border: activeTab === 'visual' ? '2px solid #0D9488' : '1px solid #CBD5E1',
              backgroundColor: activeTab === 'visual' ? '#F0FDFA' : '#FFFFFF',
              color: activeTab === 'visual' ? '#0F766E' : '#475569',
              fontWeight: 800,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            📐 {L('दृश्य प्रमाणीकरण (Visual Measurement Lab)', 'Visual Measurement Lab')}
          </button>
          <button
            onClick={() => setActiveTab('proof')}
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              border: activeTab === 'proof' ? '2px solid #2563EB' : '1px solid #CBD5E1',
              backgroundColor: activeTab === 'proof' ? '#EFF6FF' : '#FFFFFF',
              color: activeTab === 'proof' ? '#1D4ED8' : '#475569',
              fontWeight: 800,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            📜 {L('विकर्ण समद्विभाजन साध्य प्रमाण (Proof)', 'Diagonal Bisection Proof')}
          </button>
        </div>

        {activeTab === 'visual' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Dimension Sliders */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: 14,
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 14,
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#475569' }}>
                  <span>{L('आधार लम्बाइ (Base AB/CD):', 'Base Length:')}</span>
                  <strong>{fmt(lenAB)} cm</strong>
                </div>
                <input
                  type="range"
                  min={160}
                  max={280}
                  step={10}
                  value={baseLength}
                  onChange={(e) => setBaseLength(Number(e.target.value))}
                  style={{ width: '100%', marginTop: 6, accentColor: '#0D9488' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#475569' }}>
                  <span>{L('छड्के भुजा (Slant AD/BC):', 'Slant Side:')}</span>
                  <strong>{fmt(lenAD)} cm</strong>
                </div>
                <input
                  type="range"
                  min={100}
                  max={170}
                  step={10}
                  value={slantSide}
                  onChange={(e) => setSlantSide(Number(e.target.value))}
                  style={{ width: '100%', marginTop: 6, accentColor: '#0D9488' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#475569' }}>
                  <span>{L('झुकाव कोण (Angle ∠D):', 'Slant Angle ∠D:')}</span>
                  <strong>{fmt(slantAngle)}°</strong>
                </div>
                <input
                  type="range"
                  min={45}
                  max={85}
                  step={5}
                  value={slantAngle}
                  onChange={(e) => setSlantAngle(Number(e.target.value))}
                  style={{ width: '100%', marginTop: 6, accentColor: '#0D9488' }}
                />
              </div>
            </div>

            {/* Dynamic Parallelogram SVG */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #CBD5E1',
                padding: 14,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <svg width={480} height={280} style={{ backgroundColor: '#F8FAFC', borderRadius: 8 }}>
                {/* Parallelogram Body */}
                <polygon
                  points={`${pA.x},${pA.y} ${pB.x},${pB.y} ${pC.x},${pC.y} ${pD.x},${pD.y}`}
                  fill="#F0FDFA"
                  stroke="#0D9488"
                  strokeWidth="2.5"
                />

                {/* Diagonals AC & BD */}
                <line x1={pA.x} y1={pA.y} x2={pC.x} y2={pC.y} stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="3,3" />
                <line x1={pB.x} y1={pB.y} x2={pD.x} y2={pD.y} stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3,3" />

                {/* Intersection Point O */}
                <circle cx={pO.x} cy={pO.y} r="5" fill="#7C3AED" />
                <text x={pO.x + 8} y={pO.y - 6} fontSize="12" fontWeight="800" fill="#7C3AED">
                  O
                </text>

                {/* Vertex labels */}
                <text x={pA.x - 12} y={pA.y - 8} fontSize="13" fontWeight="800" fill="#1E293B">
                  A
                </text>
                <text x={pB.x + 8} y={pB.y - 8} fontSize="13" fontWeight="800" fill="#1E293B">
                  B
                </text>
                <text x={pC.x + 8} y={pC.y + 16} fontSize="13" fontWeight="800" fill="#1E293B">
                  C
                </text>
                <text x={pD.x - 16} y={pD.y + 16} fontSize="13" fontWeight="800" fill="#1E293B">
                  D
                </text>

                {/* Angles labels */}
                <text x={pA.x + 14} y={pA.y + 20} fontSize="11" fill="#1E40AF" fontWeight="800">
                  {fmt(angleA)}°
                </text>
                <text x={pB.x - 28} y={pB.y + 20} fontSize="11" fill="#1E40AF" fontWeight="800">
                  {fmt(angleB)}°
                </text>
                <text x={pC.x - 28} y={pC.y - 8} fontSize="11" fill="#1E40AF" fontWeight="800">
                  {fmt(angleC)}°
                </text>
                <text x={pD.x + 14} y={pD.y - 8} fontSize="11" fill="#1E40AF" fontWeight="800">
                  {fmt(angleD)}°
                </text>
              </svg>
            </div>

            {/* Verification Results 4-Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
              }}
            >
              {/* Prop 1: Opposite sides */}
              <div style={{ backgroundColor: '#F0FDF4', borderRadius: 8, padding: 12, border: '1px solid #86EFAC' }}>
                <strong style={{ fontSize: 12, color: '#166534' }}>
                  १. सम्मुख भुजाहरू बराबर (Opposite Sides Equal):
                </strong>
                <div style={{ fontFamily: 'monospace', fontSize: 14, color: '#065F46', marginTop: 4 }}>
                  AB = CD = {fmt(lenAB)} cm ✓ | AD = BC = {fmt(lenAD)} cm ✓
                </div>
              </div>

              {/* Prop 2: Opposite angles */}
              <div style={{ backgroundColor: '#F0FDF4', borderRadius: 8, padding: 12, border: '1px solid #86EFAC' }}>
                <strong style={{ fontSize: 12, color: '#166534' }}>
                  २. सम्मुख कोणहरू बराबर (Opposite Angles Equal):
                </strong>
                <div style={{ fontFamily: 'monospace', fontSize: 14, color: '#065F46', marginTop: 4 }}>
                  ∠A = ∠C = {fmt(angleA)}° ✓ | ∠B = ∠D = {fmt(angleB)}° ✓
                </div>
              </div>

              {/* Prop 3: Adjacent angles */}
              <div style={{ backgroundColor: '#EFF6FF', borderRadius: 8, padding: 12, border: '1px solid #BFDBFE' }}>
                <strong style={{ fontSize: 12, color: '#1E40AF' }}>
                  ३. आसन्न कोणहरू संपूरक (Adjacent Angles Supplementary):
                </strong>
                <div style={{ fontFamily: 'monospace', fontSize: 14, color: '#1E3A8A', marginTop: 4 }}>
                  ∠A + ∠B = {fmt(angleA)}° + {fmt(angleB)}° = {fmt(angleA + angleB)}° ✓
                </div>
              </div>

              {/* Prop 4: Diagonals bisect */}
              <div style={{ backgroundColor: '#FFFBEB', borderRadius: 8, padding: 12, border: '1px solid #FCD34D' }}>
                <strong style={{ fontSize: 12, color: '#92400E' }}>
                  ४. विकर्णहरूको समद्विभाजन (Diagonals Bisect Each Other):
                </strong>
                <div style={{ fontFamily: 'monospace', fontSize: 14, color: '#B45309', marginTop: 4 }}>
                  AO = OC = {fmt(lenAO)} cm ✓ | BO = OD = {fmt(lenBO)} cm ✓
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Proof Tab */
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
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>
              {L(
                'साध्य: समानान्तर चतुर्भुजका विकर्णहरूले एक अर्कालाई समद्विभाजित गर्दछन्। (Diagonals of a parallelogram bisect each other)',
                'Theorem: Diagonals of a parallelogram bisect each other (AO = OC, BO = OD).'
              )}
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
                {PROOF_STEPS.map((st, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: '8px 12px', border: '1px solid #E2E8F0' }}>
                      {idx + 1}. {st.statement}
                    </td>
                    <td style={{ padding: '8px 12px', border: '1px solid #E2E8F0' }}>
                      {st.missing ? (
                        <select
                          value={proofAnswers[idx] || ''}
                          onChange={(e) => setProofAnswers({ ...proofAnswers, [idx]: e.target.value })}
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
                🎉 {L('सफल प्रमाणीकरण! समानान्तर चतुर्भुजका विकर्णहरूले परस्पर समद्विभाजन गर्छन् (Q.E.D.)।', 'Verified! Diagonals of a parallelogram bisect each other (Q.E.D.).')}
              </div>
            )}
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default ParallelogramVerificationLab;
